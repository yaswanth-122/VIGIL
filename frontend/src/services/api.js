const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('vigil_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

export const api = {
  // Authentication
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async updatePreferences(preferences) {
    const res = await fetch(`${API_BASE}/user/preferences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    return res.json();
  },

  // User Profile
  async getUserProfile() {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateUserProfile(profileData) {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  // Guardians Management
  async getGuardians() {
    const res = await fetch(`${API_BASE}/guardians`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addGuardian(guardianData) {
    const res = await fetch(`${API_BASE}/guardians`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(guardianData)
    });
    return res.json();
  },

  async updateGuardian(id, guardianData) {
    const res = await fetch(`${API_BASE}/guardians/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(guardianData)
    });
    return res.json();
  },

  async deleteGuardian(id) {
    const res = await fetch(`${API_BASE}/guardians/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Active Journey
  async getActiveJourney() {
    const res = await fetch(`${API_BASE}/journeys/active`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Create Journey
  async createJourney(data) {
    const res = await fetch(`${API_BASE}/journeys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // End Journey
  async endJourney(journeyId) {
    const res = await fetch(`${API_BASE}/journeys/${journeyId}/end`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Location Update
  async postLocation(journeyId, locationData) {
    const res = await fetch(`${API_BASE}/journeys/${journeyId}/location`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData)
    });
    return res.json();
  },

  // Safety Check
  async handleSafetyCheck(journeyId, action, durationMins = 15) {
    const res = await fetch(`${API_BASE}/journeys/${journeyId}/safety-check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, duration_mins: durationMins })
    });
    return res.json();
  },

  // SOS
  async triggerSOS(journeyId, isSilent = false) {
    const targetId = journeyId || 'active';
    const res = await fetch(`${API_BASE}/journeys/${targetId}/sos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_silent: isSilent })
    });
    return res.json();
  },

  // Offline Simulation
  async simulateOffline(journeyId) {
    const res = await fetch(`${API_BASE}/journeys/${journeyId}/offline`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Set Simulation Event
  async triggerSimulation(journeyId, eventType) {
    const res = await fetch(`${API_BASE}/journeys/${journeyId}/simulation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ event_type: eventType })
    });
    return res.json();
  },

  // Google Gemini AI Services
  async getAICheckIn(reason) {
    const res = await fetch(`${API_BASE}/ai/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async getAISitRep() {
    const res = await fetch(`${API_BASE}/ai/sitrep`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getAIRouteAnalysis(origin, destination) {
    const res = await fetch(`${API_BASE}/ai/route-analysis`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ origin, destination })
    });
    return res.json();
  },

  // Guardian Feed
  async getGuardianFeed() {
    const res = await fetch(`${API_BASE}/guardian/active`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Journey History
  async getJourneyHistory() {
    const res = await fetch(`${API_BASE}/journeys/history`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin Stats
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Google Places Auto-Search
  async searchPlaces(query) {
    const res = await fetch(`${API_BASE}/places/search?q=${encodeURIComponent(query || '')}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
