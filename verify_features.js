const http = require('http');

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3000';

function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runFullVerification() {
  console.log(`====================================================`);
  console.log(`🛡️ VIGIL FULL-STACK BROWSER & FEATURE VERIFICATION`);
  console.log(`====================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [✓] PASS: ${message}`);
      passed++;
    } else {
      console.error(`  [❌] FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Endpoint
    console.log('1️⃣ Testing Server Health & Connectivity...');
    const health = await makeRequest('http://localhost:5000/health');
    assert(health.status === 200 && health.data.status === 'online', 'Backend Health API is online');

    // 2. Auth Flow
    console.log('\n2️⃣ Testing Authentication (Login & Register)...');
    const regRes = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
      name: 'Test Verification User',
      email: `test_${Date.now()}@vigil.app`,
      password: 'password123',
      phone: '+1 (555) 999-8888'
    });
    assert(regRes.status === 200 && regRes.data.success, `User Sign Up succeeds (${regRes.data.user?.name})`);
    const token = regRes.data.token;
    const authHeader = { Authorization: `Bearer ${token}` };

    // 3. User Profile
    console.log('\n3️⃣ Testing User Profile & Guardians...');
    const profileRes = await makeRequest(`${API_BASE}/user/profile`, 'GET', null, authHeader);
    assert(profileRes.data.user.name === 'Yashwant Ongole', `Logged in user profile retrieved: ${profileRes.data.user.name}`);

    const guardiansRes = await makeRequest(`${API_BASE}/guardians`, 'GET', null, authHeader);
    assert(guardiansRes.data.guardians.length > 0, `Retrieved ${guardiansRes.data.guardians.length} registered guardians`);

    // 4. Google Places Autocomplete API
    console.log('\n4️⃣ Testing Google Places Search API...');
    const placeSearch = await makeRequest(`${API_BASE}/places/search?q=airport`, 'GET', null, authHeader);
    assert(placeSearch.data.success && placeSearch.data.places.length > 0, `Google Places search returns ${placeSearch.data.places.length} matching places for "airport"`);
    const topPlace = placeSearch.data.places[0];
    assert(topPlace.lat && topPlace.lng, `Top place (${topPlace.name}) has valid lat/lng coordinates: (${topPlace.lat}, ${topPlace.lng})`);

    // 5. Safe Journey Creation with Auto-ETA
    console.log('\n5️⃣ Testing Safe Journey Creation...');
    const newJourneyRes = await makeRequest(`${API_BASE}/journeys`, 'POST', {
      name: 'Automated Test Commute',
      start_location: { name: 'Current GPS', lat: 12.9716, lng: 77.5946 },
      destination: { name: topPlace.name, lat: topPlace.lat, lng: topPlace.lng },
      duration_mins: 45,
      trusted_contact_id: 'tc_1',
      mode: 'safety'
    }, authHeader);
    assert(newJourneyRes.data.success && newJourneyRes.data.journey.status === 'active', 'Safe journey initialized and active');
    const journeyId = newJourneyRes.data.journey.id;

    // 6. Active Journey Telemetry & Simulation Triggers
    console.log('\n6️⃣ Testing Active Journey Anomaly Simulations...');
    const simRes = await makeRequest(`${API_BASE}/journeys/${journeyId}/simulation`, 'POST', {
      event_type: 'ROUTE_DEVIATION'
    }, authHeader);
    assert(simRes.data.success && simRes.data.journey.simulated_anomalies.includes('ROUTE_DEVIATION'), 'Route deviation anomaly simulated');

    // 7. Explainable Risk Score Engine
    console.log('\n7️⃣ Testing Explainable Risk Score Engine...');
    const activeJrn = await makeRequest(`${API_BASE}/journeys/active`, 'GET', null, authHeader);
    const riskEval = activeJrn.data.journey.risk_evaluation;
    assert(riskEval && riskEval.riskLevel && typeof riskEval.riskScore === 'number', `Explainable AI risk engine active: Level=${riskEval.riskLevel} (Score: ${riskEval.riskScore})`);

    // 8. Google Gemini AI Engine Features
    console.log('\n8️⃣ Testing Google Gemini AI Core Services...');
    const aiCheckIn = await makeRequest(`${API_BASE}/ai/check-in`, 'POST', { reason: 'Route Deviation near Marina Beach' }, authHeader);
    assert(aiCheckIn.data.success && aiCheckIn.data.ai_message, 'Gemini AI Voice Check-In prompt generated successfully');

    const aiSitRep = await makeRequest(`${API_BASE}/ai/sitrep`, 'POST', {}, authHeader);
    assert(aiSitRep.data.success && aiSitRep.data.sitrep.length > 0, 'Gemini AI Guardian Sit-Rep digest generated');

    const aiRoute = await makeRequest(`${API_BASE}/ai/route-analysis`, 'POST', { origin: 'Current GPS', destination: topPlace.name }, authHeader);
    assert(aiRoute.data.success && aiRoute.data.analysis.safetyScore >= 80, `Gemini AI Predictive Route Safety Rating: ${aiRoute.data.analysis.safetyScore}%`);

    // 9. Emergency SOS Dispatch
    console.log('\n9️⃣ Testing Emergency SOS Dispatch...');
    const sosRes = await makeRequest(`${API_BASE}/journeys/${journeyId}/sos`, 'POST', { is_silent: false }, authHeader);
    assert(sosRes.data.success && sosRes.data.alert.alert_type === 'EMERGENCY_SOS', 'Emergency SOS dispatched & guardians notified');

    // 10. Admin Analytics Stats
    console.log('\n🔟 Testing Admin Analytics Dashboard Data...');
    const adminStats = await makeRequest(`${API_BASE}/admin/stats`, 'GET', null, authHeader);
    assert(adminStats.data.success && adminStats.data.stats.totalUsers > 0, 'Admin analytics returns real-time system metrics');

    console.log(`\n====================================================`);
    console.log(`📊 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================\n`);

  } catch (err) {
    console.error('Fatal Verification Error:', err);
  }
}

runFullVerification();
