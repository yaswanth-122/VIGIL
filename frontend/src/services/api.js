const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('vigil_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }
    const text = await res.text();
    if (!res.ok) {
      return { success: false, message: `Server error (${res.status}): ${text.slice(0, 100)}` };
    }
    return { success: true, data: text };
  } catch (err) {
    console.error(`API Fetch Error [${url}]:`, err);
    return { success: false, message: 'Unable to connect to backend server. Please verify backend service status.' };
  }
}

export const api = {
  // Authentication
  async register(userData) {
    return safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },

  async login(credentials) {
    return safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  },

  async updatePreferences(preferences) {
    return safeFetch(`${API_BASE}/user/preferences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
  },

  // User Profile
  async getUserProfile() {
    return safeFetch(`${API_BASE}/user/profile`, {
      headers: getAuthHeaders()
    });
  },

  async updateUserProfile(profileData) {
    return safeFetch(`${API_BASE}/user/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
  },

  // Guardians Management
  async getGuardians() {
    return safeFetch(`${API_BASE}/guardians`, {
      headers: getAuthHeaders()
    });
  },

  async addGuardian(guardianData) {
    return safeFetch(`${API_BASE}/guardians`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(guardianData)
    });
  },

  async updateGuardian(id, guardianData) {
    return safeFetch(`${API_BASE}/guardians/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(guardianData)
    });
  },

  async deleteGuardian(id) {
    return safeFetch(`${API_BASE}/guardians/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Active Journey
  async getActiveJourney() {
    return safeFetch(`${API_BASE}/journeys/active`, {
      headers: getAuthHeaders()
    });
  },

  // Create Journey
  async createJourney(data) {
    return safeFetch(`${API_BASE}/journeys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  // End Journey
  async endJourney(journeyId) {
    return safeFetch(`${API_BASE}/journeys/${journeyId}/end`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  // Location Update
  async postLocation(journeyId, locationData) {
    return safeFetch(`${API_BASE}/journeys/${journeyId}/location`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData)
    });
  },

  // Safety Check
  async handleSafetyCheck(journeyId, action, durationMins = 15) {
    return safeFetch(`${API_BASE}/journeys/${journeyId}/safety-check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, duration_mins: durationMins })
    });
  },

  // SOS
  async triggerSOS(journeyId, isSilent = false) {
    const targetId = journeyId || 'active';
    return safeFetch(`${API_BASE}/journeys/${targetId}/sos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_silent: isSilent })
    });
  },

  // Offline Simulation
  async simulateOffline(journeyId) {
    return safeFetch(`${API_BASE}/journeys/${journeyId}/offline`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  // Set Simulation Event
  async triggerSimulation(journeyId, eventType) {
    return safeFetch(`${API_BASE}/journeys/${journeyId}/simulation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ event_type: eventType })
    });
  },

  // Google Gemini AI Services
  async getAICheckIn(reason) {
    return safeFetch(`${API_BASE}/ai/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
  },

  async getAISitRep() {
    return safeFetch(`${API_BASE}/ai/sitrep`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  async getAIRouteAnalysis(origin, destination) {
    return safeFetch(`${API_BASE}/ai/route-analysis`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ origin, destination })
    });
  },

  // Guardian Feed
  async getGuardianFeed() {
    return safeFetch(`${API_BASE}/guardian/active`, {
      headers: getAuthHeaders()
    });
  },

  // Journey History
  async getJourneyHistory() {
    return safeFetch(`${API_BASE}/journeys/history`, {
      headers: getAuthHeaders()
    });
  },

  // Admin Stats
  async getAdminStats() {
    return safeFetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
  },

  // Google Places Auto-Search
  async searchPlaces(query) {
    return safeFetch(`${API_BASE}/places/search?q=${encodeURIComponent(query || '')}`, {
      headers: getAuthHeaders()
    });
  }
};
