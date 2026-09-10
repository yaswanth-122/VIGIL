const { readDb, writeDb, hashPassword } = require('../database/db');

// POST /api/auth/register
exports.register = (req, res) => {
  const { name, username, email, phone, password, confirmPassword } = req.body;

  if (!name || !username || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All required registration fields must be provided' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const db = readDb();

  // Check if username or email already exists
  const existingUser = db.users.find(
    u => u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === email.toLowerCase()
  );
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Username or Email is already registered' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    phone,
    password_hash: hashPassword(password),
    emergency_contact: `${name}'s Primary Guardian`,
    emergency_phone: phone,
    blood_type: 'Unknown',
    medical_notes: 'None',
    preferences: {
      theme: 'auto',
      safety_timeout_mins: 10
    },
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);

  // Create initial default primary guardian from emergency details
  const initialGuardian = {
    id: `tc_${Date.now()}`,
    user_id: newUser.id,
    name: `${name}'s Guardian`,
    phone,
    email,
    relationship: 'Family',
    priority: 1,
    enabled: true,
    is_primary: true
  };
  db.trusted_contacts.push(initialGuardian);

  writeDb(db);

  const token = `vigil_token_${newUser.id}_${Date.now()}`;
  const userSafe = { ...newUser };
  delete userSafe.password_hash;

  res.status(201).json({
    success: true,
    message: 'Account created successfully. Redirecting to login...',
    user: userSafe,
    token
  });
};

// POST /api/auth/login
exports.login = (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ success: false, message: 'Username/Email and password are required' });
  }

  const db = readDb();
  const inputLower = usernameOrEmail.toLowerCase();

  const user = db.users.find(
    u => u.username?.toLowerCase() === inputLower || u.email?.toLowerCase() === inputLower
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
  }

  const computedHash = hashPassword(password);
  if (user.password_hash !== computedHash) {
    return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
  }

  const token = `vigil_token_${user.id}_${Date.now()}`;
  const userSafe = { ...user };
  delete userSafe.password_hash;

  res.json({
    success: true,
    message: 'Login successful',
    user: userSafe,
    token
  });
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  const authHeader = req.headers.authorization;
  const db = readDb();

  let user = db.users[0]; // default fallback
  if (authHeader && authHeader.startsWith('Bearer vigil_token_')) {
    const userId = authHeader.replace('Bearer vigil_token_', '').split('_')[0];
    const found = db.users.find(u => u.id === userId);
    if (found) user = found;
  }

  const userSafe = { ...user };
  delete userSafe.password_hash;
  res.json({ success: true, user: userSafe });
};

// POST /api/user/preferences
exports.updatePreferences = (req, res) => {
  const db = readDb();
  const { theme, safety_timeout_mins } = req.body;
  const user = db.users[0];

  if (user) {
    if (!user.preferences) user.preferences = {};
    if (theme) user.preferences.theme = theme;
    if (safety_timeout_mins) user.preferences.safety_timeout_mins = parseInt(safety_timeout_mins);
    writeDb(db);
  }

  res.json({ success: true, preferences: user ? user.preferences : { theme: 'auto', safety_timeout_mins: 10 } });
};
