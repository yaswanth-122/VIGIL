const express = require('express');
const router = express.Router();
const controller = require('../controllers/journeyController');
const authController = require('../controllers/authController');
const guardianController = require('../controllers/guardianController');

// Authentication routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authController.getMe);
router.post('/user/preferences', authController.updatePreferences);

// User profile routes
router.get('/user/profile', controller.getUserProfile);
router.post('/user/profile', controller.updateUserProfile);

// Guardians management routes
router.get('/guardians', guardianController.getGuardians);
router.post('/guardians', guardianController.addGuardian);
router.put('/guardians/:id', guardianController.updateGuardian);
router.delete('/guardians/:id', guardianController.deleteGuardian);

// Journey routes
router.get('/journeys/active', controller.getActiveJourney);
router.get('/journeys/history', controller.getJourneyHistory);
router.post('/journeys', controller.createJourney);
router.get('/journeys/:id', controller.getJourneyById);
router.post('/journeys/:id/end', controller.endJourney);

// Location & Telemetry updates
router.post('/journeys/:id/location', controller.addLocationUpdate);
router.get('/journeys/:id/location', controller.getJourneyLocations);

// Safety Check, SOS, Simulation & Device Offline
router.post('/journeys/:id/safety-check', controller.handleSafetyCheck);
router.post('/journeys/:id/safety-timeout', controller.updateSafetyTimeout);
router.post('/journeys/:id/sos', controller.triggerSOS);
router.post('/journeys/:id/offline', controller.simulateOffline);
router.post('/journeys/:id/simulation', controller.setSimulationEvent);

// Google Gemini AI Engine Endpoints
router.post('/ai/check-in', controller.getAICheckIn);
router.post('/ai/sitrep', controller.getAISitRep);
router.post('/ai/route-analysis', controller.getAIRouteAnalysis);

// Google Maps & Places Search Endpoint
router.get('/places/search', controller.searchPlaces);

// System Logs & Dashboards
router.get('/alerts', controller.getAlerts);
router.get('/guardian/active', controller.getGuardianFeed);
router.get('/admin/stats', controller.getAdminStats);

module.exports = router;
