# VIGIL — AI-Assisted Virtual Safety Companion

> “It doesn't just track your journey. It understands it.”

**Team**: BUG BUSTERS  
**Hackathon Project**: 24-Hour National Hackathon Submission  

VIGIL is an end-to-end journey safety monitoring platform designed for real-time risk evaluation, proactive safety checks, and emergency coordination. Centered on **Semmancheri, Chennai, Tamil Nadu, India**, VIGIL integrates live GPS tracking with an **Explainable AI-Assisted Risk Engine** that distinguishes everyday delays (like traffic or café stops) from high-risk anomalies (like major route deviations combined with prolonged inactivity).

---

## 🌟 Key Features

- 🟢 **NORMAL MODE vs 🛡️ SAFETY MODE**: Everyday privacy by default; voluntary journey protection when traveling.
- 📍 **Semmancheri (Chennai) GIS Mapping**: Interactive Leaflet maps showing real-time location, planned route, destination, traveled path, and deviation zones.
- ⚡ **Explainable AI Risk Engine**: Transparent scoring system (+25 Route deviation, +20 Prolonged stop, +15 ETA delay, +10 Direction change, +20 Unanswered safety check).
- 🛡️ **Proactive Safety Checks**: Automated "ARE YOU SAFE?" modal when risk transitions to Amber/Red.
- 🚨 **Instant SOS & Silent Mode**: Direct location broadcasting to Guardians with India emergency hotline (112) integration.
- 📡 **Device Offline & Break Protection**: Graceful handling when GPS updates stop, displaying last known location and timestamp. "I'm Taking a Break" suppresses false alerts during intentional stops.
- 🎮 **Hackathon Demo Control Center**: Live simulation bar to trigger route deviation, stops, ETA delays, offline state, and emergency alerts.
- 📊 **Guardian & Admin Dashboards**: Command center for guardians and system metrics for administrators.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd VIGIL
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Start Backend & Frontend concurrently:
   ```bash
   npm run dev
   ```

4. Access the application in your browser:
   - Frontend UI: `http://localhost:5173`
   - Backend REST API: `http://localhost:5000`

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **User** | `user@vigil.demo` | `demo123` |
| **Guardian** | `guardian@vigil.demo` | `demo123` |
| **Admin** | `admin@vigil.demo` | `demo123` |

*(Quick "Use Demo Account" buttons are built directly into the login screen!)*

---

## 🗺️ Semmancheri Demo Route

- **Start**: DLF Garden City / Semmancheri Residential Area (`12.8632° N, 80.2240° E`)
- **Waypoint 1**: Semmancheri Junction / Sathyabama Institute Road (`12.8698° N, 80.2205° E`)
- **Waypoint 2**: OMR Tech Corridor / Infosys Semmancheri (`12.8735° N, 80.2230° E`)
- **Destination**: Semmancheri OMR Hub & Café (`12.8760° N, 80.2260° E`)
