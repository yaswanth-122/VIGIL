import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, MapPin, Navigation, Battery, Wifi, PhoneCall, ArrowRight, Activity, Zap, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useBattery } from '../hooks/useBattery';
import { useAuth } from '../context/AuthContext';
import RiskMeter from '../components/RiskMeter';

export default function DashboardPage({ currentMode, onToggleMode, onOpenSOS }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeJourney, setActiveJourney] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [trustedContacts, setTrustedContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real device battery hook
  const { batteryLevel, isCharging, warningLevel, isSupported: isBatterySupported } = useBattery();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadDashboardData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, activeRes, guardianRes] = await Promise.all([
        api.getUserProfile(),
        api.getActiveJourney(),
        api.getGuardians()
      ]);

      if (profileRes.success) {
        setUserProfile(profileRes.user);
      }
      if (guardianRes.success) {
        setTrustedContacts(guardianRes.guardians);
      }
      if (activeRes.success) {
        setActiveJourney(activeRes.journey);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = authUser?.name || userProfile?.name || 'Traveler';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900">
        
        {/* Glowing Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                VIGIL SAFETY COMPANION
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit tracking-tight">
              Welcome, {displayName}
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              “It doesn't just track your journey. It understands it.” Voluntary safety monitoring powered by explainable AI telemetry analysis.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            {activeJourney ? (
              <button
                onClick={() => navigate('/active')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 border border-cyan-400/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Activity className="w-5 h-5 animate-pulse" />
                <span>OPEN ACTIVE JOURNEY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/start')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 border border-teal-400/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Navigation className="w-5 h-5" />
                <span>START SAFE JOURNEY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Battery Warning Banner if Low/Critical */}
      {warningLevel !== 'NORMAL' && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          warningLevel === 'EMERGENCY' ? 'bg-red-500/20 border-red-500/50 text-red-300 glow-red animate-pulse' :
          warningLevel === 'CRITICAL' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
          'bg-amber-500/20 border-amber-500/40 text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="uppercase tracking-wider">{warningLevel} BATTERY WARNING ({batteryLevel}%)</div>
              <div className="text-[11px] font-normal text-gray-300">
                {warningLevel === 'EMERGENCY' ? 'Your device battery is critically low (below 10%). GPS location tracking may halt if device powers off.' :
                 warningLevel === 'CRITICAL' ? 'Your device battery is at critical level (10-20%). Please connect charger.' :
                 'Your device battery is low (20-30%). Consider charging soon.'}
              </div>
            </div>
          </div>
          {isCharging && (
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold shrink-0">
              ⚡ Charging
            </span>
          )}
        </div>
      )}

      {/* Mode Indicator & Switcher Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 🟢 NORMAL MODE Card */}
        <div
          onClick={() => onToggleMode('normal')}
          className={`cursor-pointer glass-panel-interactive p-6 rounded-2xl border transition-all ${
            currentMode === 'normal'
              ? 'border-emerald-500/50 bg-emerald-950/20 glow-green'
              : 'border-white/10 opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">🟢 NORMAL MODE</h3>
                <p className="text-xs text-emerald-400 font-semibold">“Everyday privacy”</p>
              </div>
            </div>
            {currentMode === 'normal' && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Active Selection
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-4 leading-relaxed">
            Standard everyday privacy. No active journey monitoring, no background GPS telemetry parsing, and no unnecessary alerts.
          </p>
        </div>

        {/* 🛡️ SAFETY MODE Card */}
        <div
          onClick={() => onToggleMode('safety')}
          className={`cursor-pointer glass-panel-interactive p-6 rounded-2xl border transition-all ${
            currentMode === 'safety'
              ? 'border-blue-500/50 bg-blue-950/30 glow-blue'
              : 'border-white/10 opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">🛡️ SAFETY MODE</h3>
                <p className="text-xs text-blue-400 font-semibold">“Journey protection active”</p>
              </div>
            </div>
            {currentMode === 'safety' && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Active Selection
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-4 leading-relaxed">
            Voluntarily activated. Real-time GPS tracking begins, route anomalies are analyzed by the Explainable AI risk engine, and automated safety checks protect your trip.
          </p>
        </div>

      </div>

      {/* Main Grid: Active Journey & Risk Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Journey Summary Status Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base font-outfit">Active Journey Status</h3>
            </div>
            {activeJourney ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                MONITORING IN PROGRESS
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                NO ACTIVE JOURNEY
              </span>
            )}
          </div>

          {activeJourney ? (
            <div className="bg-black/30 p-5 rounded-xl border border-white/5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-extrabold text-white">{activeJourney.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeJourney.start_location.name}</span>
                    <span>→</span>
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{activeJourney.destination.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-400">Duration Scheduled:</div>
                  <div className="text-sm font-bold text-cyan-400">{activeJourney.duration_mins} Mins</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  onClick={() => navigate('/active')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>VIEW ON INTERACTIVE GOOGLE MAP</span>
                </button>

                <button
                  onClick={onOpenSOS}
                  className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 font-bold text-xs flex items-center gap-1.5"
                >
                  <span>EMERGENCY SOS</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-black/20 p-8 rounded-xl border border-white/5 text-center space-y-3">
              <Navigation className="w-10 h-10 text-gray-500 mx-auto" />
              <h4 className="text-sm font-bold text-gray-200">No journey active currently</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Ready to travel safely? Start a safe journey to activate voluntary GPS tracking and AI risk protection.
              </p>
              <button
                onClick={() => navigate('/start')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>START SAFE JOURNEY NOW</span>
              </button>
            </div>
          )}

          {/* Real Device Telemetry Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <Battery className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[10px] text-gray-400">Battery Level</div>
                <div className="text-sm font-bold text-white flex items-center gap-1">
                  <span>{isBatterySupported ? `${batteryLevel}%` : 'Unavailable'}</span>
                  {isCharging && <span className="text-[10px] text-emerald-400">⚡</span>}
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <Wifi className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-[10px] text-gray-400">Network Telemetry</div>
                <div className={`text-sm font-bold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-[10px] text-gray-400">GPS Hardware</div>
                <div className="text-sm font-bold text-white">HIGH ACCURACY</div>
              </div>
            </div>
          </div>

        </div>

        {/* Explainable Risk Engine Preview Widget */}
        <div>
          <RiskMeter
            riskScore={activeJourney?.risk_evaluation?.riskScore || 10}
            riskLevel={activeJourney?.risk_evaluation?.riskLevel || 'GREEN'}
            reasons={activeJourney?.risk_evaluation?.reasons || []}
            recommendedAction={activeJourney?.risk_evaluation?.recommendedAction || 'Normal baseline safety monitoring.'}
          />
        </div>

      </div>

      {/* Trusted Contacts Section */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base font-outfit">Designated Guardian & Trusted Contacts</h3>
          </div>
          <button
            onClick={() => navigate('/guardians')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            Manage Guardians →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trustedContacts.map((contact) => (
            <div key={contact.id} className="bg-black/30 p-4 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{contact.name}</span>
                  {contact.is_primary && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      PRIMARY GUARDIAN
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{contact.relationship} • {contact.phone}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors"
              >
                CALL
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
