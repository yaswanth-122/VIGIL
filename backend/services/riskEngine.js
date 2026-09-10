/**
 * Explainable AI-Assisted Risk Engine for VIGIL
 * Calculates risk score based on transparent, weighted safety signals.
 */

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function evaluateJourneyRisk(journey, locationUpdates = [], lastSafetyCheck = null, simulatedAnomalies = []) {
  let score = 0;
  const reasons = [];

  // If intentional break is active, suppress standard anomaly alerts
  const now = new Date();
  if (journey.break_until && new Date(journey.break_until) > now) {
    return {
      riskScore: 5,
      riskLevel: 'GREEN',
      reasons: [
        { code: 'BREAK_ACTIVE', text: 'Intentional Break Active (Alerts Suppressed)', score: 0 }
      ],
      recommendedAction: 'Journey monitoring paused for break.',
      isBreakActive: true
    };
  }

  // 1. Simulated Anomaly Overrides (from Demo Control Center)
  if (simulatedAnomalies && simulatedAnomalies.length > 0) {
    if (simulatedAnomalies.includes('ROUTE_DEVIATION')) {
      score += 25;
      reasons.push({ code: 'ROUTE_DEVIATION', text: '+25 Route deviation detected', score: 25 });
    }
    if (simulatedAnomalies.includes('PROLONGED_STOP')) {
      score += 20;
      reasons.push({ code: 'PROLONGED_STOP', text: '+20 Prolonged inactivity / stationary stop', score: 20 });
    }
    if (simulatedAnomalies.includes('ETA_DELAY')) {
      score += 15;
      reasons.push({ code: 'ETA_DELAY', text: '+15 Significant ETA delay', score: 15 });
    }
    if (simulatedAnomalies.includes('DIRECTION_CHANGE')) {
      score += 10;
      reasons.push({ code: 'DIRECTION_CHANGE', text: '+10 Sudden unexpected direction change', score: 10 });
    }
    if (simulatedAnomalies.includes('MULTIPLE_ANOMALIES')) {
      score += 35;
      reasons.push({ code: 'MULTIPLE_ANOMALIES', text: '+35 Concurrent risk anomalies detected', score: 35 });
    }
  }

  // 2. Real Telemetry Anomaly Analysis (when not purely driven by simulation flags)
  if (locationUpdates.length >= 2 && simulatedAnomalies.length === 0) {
    const latest = locationUpdates[locationUpdates.length - 1];
    const prev = locationUpdates[locationUpdates.length - 2];

    // Speed / Stop check
    if (latest.speed !== undefined && latest.speed < 0.5) {
      // Check stationary duration
      const stationaryTimeMs = now.getTime() - new Date(latest.timestamp).getTime();
      if (stationaryTimeMs > 300000) { // 5 minutes
        score += 20;
        reasons.push({ code: 'PROLONGED_STOP', text: '+20 Prolonged inactivity stop (>5 mins)', score: 20 });
      }
    }

    // Distance to expected destination check
    if (journey.destination && journey.destination.lat && journey.destination.lng) {
      const currentDistToDest = calculateDistanceKm(
        latest.latitude,
        latest.longitude,
        journey.destination.lat,
        journey.destination.lng
      );
      const prevDistToDest = calculateDistanceKm(
        prev.latitude,
        prev.longitude,
        journey.destination.lat,
        journey.destination.lng
      );

      // If moving away from destination significantly
      if (currentDistToDest > prevDistToDest + 0.3) {
        score += 15;
        reasons.push({ code: 'MOVING_AWAY', text: '+15 Path moving away from destination', score: 15 });
      }
    }
  }

  // 3. Unanswered Safety Check Penalty
  if (lastSafetyCheck && lastSafetyCheck.status === 'PENDING') {
    const checkAgeSec = (now.getTime() - new Date(lastSafetyCheck.timestamp).getTime()) / 1000;
    if (checkAgeSec > 20) {
      score += 20;
      reasons.push({ code: 'NO_SAFETY_RESPONSE', text: '+20 Unanswered safety check prompt', score: 20 });
    }
  }

  // 4. Low Battery Bonus Signal
  const latestLoc = locationUpdates[locationUpdates.length - 1];
  if (latestLoc && latestLoc.battery !== undefined && latestLoc.battery <= 15) {
    score += 10;
    reasons.push({ code: 'LOW_BATTERY', text: '+10 Critical device battery (≤15%)', score: 10 });
  }

  // Cap score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // Determine Level & Action
  let riskLevel = 'GREEN';
  let recommendedAction = 'Journey proceeding normally. Routine safety monitoring active.';

  if (score >= 70) {
    riskLevel = 'RED';
    recommendedAction = 'HIGH RISK ALERT: Immediate Safety Check dispatched. Guardian notification triggered.';
  } else if (score >= 40) {
    riskLevel = 'AMBER';
    recommendedAction = 'UNUSUAL BEHAVIOUR: Dispatching automated safety status request to user.';
  }

  return {
    riskScore: score,
    riskLevel,
    reasons: reasons.length > 0 ? reasons : [{ code: 'NORMAL', text: 'All journey signals normal', score: 0 }],
    recommendedAction,
    evaluatedAt: now.toISOString()
  };
}

module.exports = {
  evaluateJourneyRisk,
  calculateDistanceKm
};
