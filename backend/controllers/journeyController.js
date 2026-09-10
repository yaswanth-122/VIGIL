const { readDb, writeDb } = require('../database/db');
const { evaluateJourneyRisk } = require('../services/riskEngine');
const aiService = require('../services/aiService');
const placeService = require('../services/placeService');

// Helper to extract the currently authenticated user from Bearer token or return latest user
function extractUser(req, db) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.includes('vigil_token_')) {
    const tokenPayload = authHeader.split('vigil_token_')[1];
    if (tokenPayload) {
      const match = db.users.find(u => tokenPayload.startsWith(u.id));
      if (match) return match;
    }
  }
  return db.users[db.users.length - 1] || db.users[0] || { id: 'usr_default', name: 'Alex Rivera' };
}

// GET /api/user/profile
exports.getUserProfile = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const contacts = db.trusted_contacts.filter(c => c.user_id === user.id || !c.user_id || c.user_id === 'usr_default');

  const userSafe = { ...user };
  delete userSafe.password_hash;

  res.json({ success: true, user: userSafe, trusted_contacts: contacts });
};

// POST /api/user/profile
exports.updateUserProfile = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const { name, emergency_phone, emergency_contact, blood_type, medical_notes } = req.body;

  const targetUser = db.users.find(u => u.id === user.id) || db.users[0];
  if (targetUser) {
    if (name) targetUser.name = name;
    if (emergency_phone) targetUser.emergency_phone = emergency_phone;
    if (emergency_contact) targetUser.emergency_contact = emergency_contact;
    if (blood_type) targetUser.blood_type = blood_type;
    if (medical_notes) targetUser.medical_notes = medical_notes;
    writeDb(db);
  }

  const userSafe = { ...targetUser };
  delete userSafe.password_hash;
  res.json({ success: true, user: userSafe });
};

// GET /api/journeys/active
exports.getActiveJourney = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const active = db.journeys.find(j => j.status === 'active' && (j.user_id === user.id || j.user_id === 'usr_default'));

  if (!active) {
    return res.json({ success: true, journey: null });
  }

  const locs = db.location_updates.filter(l => l.journey_id === active.id);
  const latestLoc = locs.length > 0 ? locs[locs.length - 1] : null;
  const activeCheck = db.safety_checks.find(s => s.journey_id === active.id && s.status === 'PENDING');
  const riskEval = evaluateJourneyRisk(active, locs, activeCheck, active.simulated_anomalies || []);

  res.json({
    success: true,
    journey: {
      ...active,
      user_name: user.name,
      current_location: latestLoc || active.start_location,
      risk_evaluation: riskEval,
      active_safety_check: activeCheck || null
    }
  });
};

// POST /api/journeys
exports.createJourney = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const { name, start_location, destination, duration_mins, trusted_contact_id, mode } = req.body;

  // Mark existing active journey as completed/cancelled
  db.journeys.forEach(j => {
    if (j.status === 'active' && (j.user_id === user.id || j.user_id === 'usr_default')) {
      j.status = 'cancelled';
      j.end_time = new Date().toISOString();
    }
  });

  const newJourney = {
    id: `jrn_${Date.now()}`,
    user_id: user.id,
    user_name: user.name,
    name: name || 'Safe Commute',
    start_location: start_location || { name: 'Current Location', lat: 12.9716, lng: 77.5946 },
    destination: destination || { name: 'Destination', lat: 12.9352, lng: 77.6245 },
    status: 'active',
    mode: mode || 'safety',
    start_time: new Date().toISOString(),
    end_time: null,
    duration_mins: parseInt(duration_mins) || 60,
    trusted_contact_id: trusted_contact_id || 'tc_1',
    risk_score: 0,
    risk_level: 'GREEN',
    is_offline: false,
    break_until: null,
    simulated_anomalies: [],
    created_at: new Date().toISOString()
  };

  db.journeys.unshift(newJourney);

  const initialLoc = {
    id: `loc_${Date.now()}`,
    journey_id: newJourney.id,
    latitude: newJourney.start_location.lat,
    longitude: newJourney.start_location.lng,
    accuracy: 10,
    speed: 0,
    heading: 0,
    battery: 95,
    network: 'online',
    timestamp: new Date().toISOString()
  };
  db.location_updates.push(initialLoc);

  writeDb(db);
  res.status(201).json({ success: true, journey: newJourney });
};

// GET /api/journeys/:id
exports.getJourneyById = (req, res) => {
  const db = readDb();
  const journey = db.journeys.find(j => j.id === req.params.id);
  if (!journey) {
    return res.status(404).json({ success: false, message: 'Journey not found' });
  }
  const locs = db.location_updates.filter(l => l.journey_id === journey.id);
  const activeCheck = db.safety_checks.find(s => s.journey_id === journey.id && s.status === 'PENDING');
  const riskEval = evaluateJourneyRisk(journey, locs, activeCheck, journey.simulated_anomalies || []);

  res.json({
    success: true,
    journey: {
      ...journey,
      location_history: locs,
      risk_evaluation: riskEval,
      active_safety_check: activeCheck || null
    }
  });
};

// POST /api/journeys/:id/end
exports.endJourney = (req, res) => {
  const db = readDb();
  const journey = db.journeys.find(j => j.id === req.params.id);
  if (!journey) {
    return res.status(404).json({ success: false, message: 'Journey not found' });
  }

  journey.status = 'completed';
  journey.end_time = new Date().toISOString();

  db.safety_checks.forEach(s => {
    if (s.journey_id === journey.id && s.status === 'PENDING') {
      s.status = 'RESOLVED';
    }
  });

  writeDb(db);
  res.json({ success: true, journey });
};

// POST /api/journeys/:id/location
exports.addLocationUpdate = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const journey = db.journeys.find(j => j.id === req.params.id);
  if (!journey) {
    return res.status(404).json({ success: false, message: 'Journey not found' });
  }

  const { latitude, longitude, accuracy, speed, heading, battery, network } = req.body;
  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
  }

  const locUpdate = {
    id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    journey_id: journey.id,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    accuracy: parseFloat(accuracy) || 10,
    speed: parseFloat(speed) || 0,
    heading: parseFloat(heading) || 0,
    battery: battery !== undefined ? parseInt(battery) : 90,
    network: network || 'online',
    timestamp: new Date().toISOString()
  };

  db.location_updates.push(locUpdate);
  journey.is_offline = false;

  const locs = db.location_updates.filter(l => l.journey_id === journey.id);
  const activeCheck = db.safety_checks.find(s => s.journey_id === journey.id && s.status === 'PENDING');
  const riskEval = evaluateJourneyRisk(journey, locs, activeCheck, journey.simulated_anomalies || []);

  journey.risk_score = riskEval.riskScore;
  journey.risk_level = riskEval.riskLevel;

  if ((riskEval.riskLevel === 'AMBER' || riskEval.riskLevel === 'RED') && !activeCheck) {
    const newCheck = {
      id: `chk_${Date.now()}`,
      journey_id: journey.id,
      trigger_reason: riskEval.reasons.map(r => r.text).join('; '),
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      timeout_seconds: 30
    };
    db.safety_checks.push(newCheck);
  }

  if (riskEval.riskLevel === 'RED') {
    const existingRedAlert = db.alerts.find(a => a.journey_id === journey.id && a.status === 'active' && a.alert_type === 'HIGH_RISK');
    if (!existingRedAlert) {
      db.alerts.push({
        id: `alt_${Date.now()}`,
        journey_id: journey.id,
        user_name: user.name,
        alert_type: 'HIGH_RISK',
        message: `High risk detected for ${user.name} (${riskEval.riskScore}/100): ${riskEval.reasons.map(r => r.text).join(', ')}`,
        risk_score: riskEval.riskScore,
        status: 'active',
        timestamp: new Date().toISOString(),
        location: { lat: locUpdate.latitude, lng: locUpdate.longitude }
      });
    }
  }

  writeDb(db);
  res.json({ success: true, location: locUpdate, risk_evaluation: riskEval });
};

// GET /api/journeys/:id/location
exports.getJourneyLocations = (req, res) => {
  const db = readDb();
  const locs = db.location_updates.filter(l => l.journey_id === req.params.id);
  res.json({ success: true, locations: locs });
};

// POST /api/journeys/:id/safety-check
exports.handleSafetyCheck = (req, res) => {
  const db = readDb();
  const { action, duration_mins } = req.body;
  const journey = db.journeys.find(j => j.id === req.params.id);

  if (!journey) {
    return res.status(404).json({ success: false, message: 'Journey not found' });
  }

  if (action === 'TRIGGER') {
    const newCheck = {
      id: `chk_${Date.now()}`,
      journey_id: journey.id,
      trigger_reason: 'Manual Safety Check Dispatched',
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      timeout_seconds: 30
    };
    db.safety_checks.push(newCheck);
    writeDb(db);
    return res.json({ success: true, safety_check: newCheck });
  }

  const activeCheck = db.safety_checks.find(s => s.journey_id === journey.id && s.status === 'PENDING');
  if (activeCheck) {
    activeCheck.status = action;
    activeCheck.response_time = new Date().toISOString();
  }

  if (action === 'SAFE') {
    journey.simulated_anomalies = [];
    journey.risk_score = 10;
    journey.risk_level = 'GREEN';
  } else if (action === 'BREAK') {
    const breakMins = parseInt(duration_mins) || 15;
    journey.break_until = new Date(Date.now() + breakMins * 60000).toISOString();
    journey.risk_score = 5;
    journey.risk_level = 'GREEN';
  } else if (action === 'EXTEND') {
    journey.duration_mins += parseInt(duration_mins) || 30;
    journey.risk_score = 15;
    journey.risk_level = 'GREEN';
  }

  writeDb(db);
  res.json({ success: true, journey, resolved_check: activeCheck });
};

// POST /api/journeys/:id/sos
exports.triggerSOS = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const journey = db.journeys.find(j => j.id === req.params.id);

  const locs = journey ? db.location_updates.filter(l => l.journey_id === journey.id) : [];
  const lastLoc = locs.length > 0 ? locs[locs.length - 1] : { latitude: 12.9716, longitude: 77.5946 };

  const alert = {
    id: `sos_${Date.now()}`,
    journey_id: journey ? journey.id : 'unknown',
    user_name: user.name,
    alert_type: 'EMERGENCY_SOS',
    message: `🚨 CRITICAL SOS DISPATCHED BY ${user.name}! Emergency notification sent to guardian and emergency contacts.`,
    risk_score: 100,
    status: 'active',
    is_silent: req.body.is_silent || false,
    timestamp: new Date().toISOString(),
    location: { lat: lastLoc.latitude, lng: lastLoc.longitude },
    emergency_phone: user.emergency_phone || '112'
  };

  db.alerts.unshift(alert);
  if (journey) {
    journey.risk_score = 100;
    journey.risk_level = 'RED';
  }

  writeDb(db);
  res.json({ success: true, alert, emergency_number: '112' });
};

// POST /api/journeys/:id/offline
exports.simulateOffline = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const journey = db.journeys.find(j => j.id === req.params.id);
  if (!journey) {
    return res.status(404).json({ success: false, message: 'Journey not found' });
  }

  journey.is_offline = true;

  const locs = db.location_updates.filter(l => l.journey_id === journey.id);
  const lastLoc = locs.length > 0 ? locs[locs.length - 1] : null;

  db.alerts.unshift({
    id: `off_${Date.now()}`,
    journey_id: journey.id,
    user_name: user.name,
    alert_type: 'DEVICE_OFFLINE',
    message: `⚠️ DEVICE OFFLINE: ${user.name}'s device stopped sending GPS updates. Current status unknown.`,
    risk_score: 50,
    status: 'active',
    timestamp: new Date().toISOString(),
    last_known_location: lastLoc ? { lat: lastLoc.latitude, lng: lastLoc.longitude, battery: lastLoc.battery, time: lastLoc.timestamp } : null
  });

  writeDb(db);
  res.json({ success: true, journey, message: 'Device offline simulation triggered' });
};

// POST /api/journeys/:id/simulation
exports.setSimulationEvent = (req, res) => {
  const db = readDb();
  const journey = db.journeys.find(j => j.id === req.params.id);
  if (!journey) {
    return res.status(404).json({ success: false, message: 'Journey not found' });
  }

  const { event_type } = req.body;
  if (!journey.simulated_anomalies) journey.simulated_anomalies = [];

  if (event_type === 'RESET') {
    journey.simulated_anomalies = [];
    journey.is_offline = false;
    journey.risk_score = 10;
    journey.risk_level = 'GREEN';
  } else if (event_type) {
    if (!journey.simulated_anomalies.includes(event_type)) {
      journey.simulated_anomalies.push(event_type);
    }
  }

  const locs = db.location_updates.filter(l => l.journey_id === journey.id);
  const activeCheck = db.safety_checks.find(s => s.journey_id === journey.id && s.status === 'PENDING');
  const riskEval = evaluateJourneyRisk(journey, locs, activeCheck, journey.simulated_anomalies);

  journey.risk_score = riskEval.riskScore;
  journey.risk_level = riskEval.riskLevel;

  writeDb(db);
  res.json({ success: true, journey, risk_evaluation: riskEval });
};

// GET /api/alerts
exports.getAlerts = (req, res) => {
  const db = readDb();
  res.json({ success: true, alerts: db.alerts || [] });
};

// GET /api/guardian/active
exports.getGuardianFeed = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const activeJourney = db.journeys.find(j => j.status === 'active' && (j.user_id === user.id || j.user_id === 'usr_default'));
  const contacts = db.trusted_contacts.filter(c => c.user_id === user.id || !c.user_id || c.user_id === 'usr_default');

  if (!activeJourney) {
    return res.json({
      success: true,
      active_monitoring: false,
      user: { id: user.id, name: user.name, phone: user.phone, emergency_contact: user.emergency_contact },
      contacts,
      active_journey: null,
      alerts: db.alerts || []
    });
  }

  const locs = db.location_updates.filter(l => l.journey_id === activeJourney.id);
  const latestLoc = locs.length > 0 ? locs[locs.length - 1] : null;
  const activeCheck = db.safety_checks.find(s => s.journey_id === activeJourney.id && s.status === 'PENDING');
  const riskEval = evaluateJourneyRisk(activeJourney, locs, activeCheck, activeJourney.simulated_anomalies || []);

  res.json({
    success: true,
    active_monitoring: true,
    user: { id: user.id, name: user.name, phone: user.phone, emergency_contact: user.emergency_contact },
    contacts,
    active_journey: {
      ...activeJourney,
      user_name: user.name,
      current_location: latestLoc || activeJourney.start_location,
      risk_evaluation: riskEval,
      location_history: locs
    },
    alerts: db.alerts.filter(a => a.journey_id === activeJourney.id || a.status === 'active')
  });
};

// GET /api/journeys/history
exports.getJourneyHistory = (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const completed = db.journeys.filter(j => (j.status === 'completed' || j.status === 'cancelled') && (j.user_id === user.id || j.user_id === 'usr_default'));
  res.json({ success: true, journeys: completed });
};

// GET /api/admin/stats
exports.getAdminStats = (req, res) => {
  const db = readDb();
  const journeys = db.journeys || [];
  const alerts = db.alerts || [];

  const totalUsers = db.users.length;
  const activeJourneys = journeys.filter(j => j.status === 'active').length;
  const greenJourneys = journeys.filter(j => j.risk_level === 'GREEN').length;
  const amberEvents = journeys.filter(j => j.risk_level === 'AMBER').length;
  const redAlerts = alerts.filter(a => a.alert_type === 'HIGH_RISK').length;
  const sosEvents = alerts.filter(a => a.alert_type === 'EMERGENCY_SOS').length;
  const offlineDevices = journeys.filter(j => j.is_offline).length;

  res.json({
    success: true,
    stats: {
      totalUsers,
      activeJourneys,
      greenJourneys,
      amberEvents,
      redAlerts,
      sosEvents,
      offlineDevices,
      totalJourneysCount: journeys.length,
      totalAlertsCount: alerts.length
    },
    recent_alerts: alerts.slice(0, 10),
    journeys_summary: journeys.map(j => ({
      id: j.id,
      name: j.name,
      status: j.status,
      risk_level: j.risk_level,
      risk_score: j.risk_score,
      start_time: j.start_time
    }))
  });
};

// GOOGLE GEMINI AI ENDPOINTS
exports.getAICheckIn = async (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const activeJourney = db.journeys.find(j => j.status === 'active') || db.journeys[0];
  const { reason } = req.body;

  const journeyWithUser = { ...activeJourney, name: user.name };
  const aiMessage = await aiService.generateAICheckIn(journeyWithUser, reason);
  res.json({ success: true, ai_message: aiMessage });
};

exports.getAISitRep = async (req, res) => {
  const db = readDb();
  const user = extractUser(req, db);
  const activeJourney = db.journeys.find(j => j.status === 'active') || db.journeys[0];
  const alerts = db.alerts || [];

  const journeyWithUser = { ...activeJourney, user_name: user.name };
  const sitrep = await aiService.generateGuardianSitRep(journeyWithUser, alerts);
  res.json({ success: true, sitrep });
};

exports.getAIRouteAnalysis = async (req, res) => {
  const { origin, destination } = req.body;
  const analysis = await aiService.analyzeRouteSafety(origin || 'Current Location', destination || 'Destination');
  res.json({ success: true, analysis });
};

// GET /api/places/search?q=query
exports.searchPlaces = async (req, res) => {
  try {
    const query = req.query.q || '';
    const places = await placeService.searchPlaces(query);
    res.json({ success: true, places });
  } catch (err) {
    console.error('Search places error:', err);
    res.status(500).json({ success: false, message: 'Failed to search places', places: [] });
  }
};

