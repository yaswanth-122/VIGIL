const { readDb, writeDb } = require('../database/db');

// GET /api/guardians
exports.getGuardians = (req, res) => {
  const db = readDb();
  res.json({ success: true, guardians: db.trusted_contacts || [] });
};

// POST /api/guardians
exports.addGuardian = (req, res) => {
  const db = readDb();
  const { name, phone, email, relationship, priority, is_primary, enabled } = req.body;

  if (!name || !phone || !relationship) {
    return res.status(400).json({ success: false, message: 'Name, phone number, and relationship are required' });
  }

  // If set as primary, unmark other guardians as primary
  if (is_primary) {
    db.trusted_contacts.forEach(c => {
      c.is_primary = false;
    });
  }

  const newGuardian = {
    id: `tc_${Date.now()}`,
    user_id: 'usr_default',
    name,
    phone,
    email: email || '',
    relationship,
    priority: parseInt(priority) || (db.trusted_contacts.length + 1),
    enabled: enabled !== undefined ? enabled : true,
    is_primary: is_primary || false
  };

  db.trusted_contacts.push(newGuardian);
  writeDb(db);

  res.status(201).json({ success: true, guardian: newGuardian, guardians: db.trusted_contacts });
};

// PUT /api/guardians/:id
exports.updateGuardian = (req, res) => {
  const db = readDb();
  const guardian = db.trusted_contacts.find(c => c.id === req.params.id);

  if (!guardian) {
    return res.status(404).json({ success: false, message: 'Guardian contact not found' });
  }

  const { name, phone, email, relationship, priority, is_primary, enabled } = req.body;

  if (is_primary) {
    db.trusted_contacts.forEach(c => {
      c.is_primary = false;
    });
  }

  if (name) guardian.name = name;
  if (phone) guardian.phone = phone;
  if (email !== undefined) guardian.email = email;
  if (relationship) guardian.relationship = relationship;
  if (priority !== undefined) guardian.priority = parseInt(priority);
  if (enabled !== undefined) guardian.enabled = enabled;
  if (is_primary !== undefined) guardian.is_primary = is_primary;

  writeDb(db);
  res.json({ success: true, guardian, guardians: db.trusted_contacts });
};

// DELETE /api/guardians/:id
exports.deleteGuardian = (req, res) => {
  const db = readDb();
  const index = db.trusted_contacts.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Guardian contact not found' });
  }

  db.trusted_contacts.splice(index, 1);
  writeDb(db);

  res.json({ success: true, guardians: db.trusted_contacts });
};
