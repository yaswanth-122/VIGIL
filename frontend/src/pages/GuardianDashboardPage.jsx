import React, { useEffect, useState, useRef } from 'react';
import { Eye, Phone, RefreshCw, Radio, MapPin, Battery, Wifi, Clock, UserCheck, Sparkles, FileText } from 'lucide-react';
import { api } from '../services/api';
import GoogleMapView from '../components/GoogleMapView';

export default function GuardianDashboardPage() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [aiSitrep, setAiSitrep] = useState('');

  const pollTimer = useRef(null);

  useEffect(() => {
    fetchGuardianFeed();

    // Auto refresh feed every 3 seconds
    pollTimer.current = setInterval(() => {
      fetchGuardianFeedSilently();
    }, 3000);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const fetchGuardianFeed = async () => {
    try {
      setLoading(true);
      const res = await api.getGuardianFeed();
      if (res.success) {
        setFeed(res);
      }

      // Fetch Gemini AI Sit-Rep
      const sitrepRes = await api.getAISitRep();
      if (sitrepRes.success && sitrepRes.sitrep) {
        setAiSitrep(sitrepRes.sitrep);
      }
    } catch (err) {
      console.error('Error loading guardian feed:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  const fetchGuardianFeedSilently = async () => {
    try {
      const res = await api.getGuardianFeed();
      if (res.success) {
        setFeed(res);
      }
    } catch (err) {
      console.error('Silent guardian refresh error:', err);
    } finally {
      setLastRefreshed(new Date());
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
        <p className="text-gray-300 font-bold text-base font-outfit">CONNECTING TO GUARDIAN COMMAND FEED...</p>
      </div>
    );
  }

  const activeJourney = feed?.active_journey;
  const user = feed?.user || { name: 'Alex Rivera' };
  const alerts = feed?.alerts || [];
  const riskEval = activeJourney?.risk_evaluation || { riskScore: 10, riskLevel: 'GREEN', reasons: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>GUARDIAN SAFETY COMMAND CENTRE</span>
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Live Sync</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Monitoring: {user.name}</h1>
          <p className="text-xs text-gray-400">
            Real-time telemetry, location pathing, and emergency status broadcast. Last updated: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>

        {/* Action Call & Manual Refresh */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:${user.phone || '+15552345678'}`}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>CALL USER NOW</span>
          </a>

          <button
            onClick={fetchGuardianFeed}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* Gemini AI Emergency Sit-Rep Summary Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-950 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-outfit">VIGIL Gemini AI Situation Report (Sit-Rep)</h3>
              <p className="text-[11px] text-cyan-300">Automated intelligence digest synthesized for trusted guardians</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            GEMINI 1.5 FLASH AI
          </span>
        </div>

        <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-xs text-gray-200 space-y-1.5 font-mono leading-relaxed whitespace-pre-line">
          {aiSitrep || 'Generating VIGIL Gemini AI Situation Digest...'}
        </div>
      </div>

      {/* Main Content Grid */}
      {feed?.active_monitoring && activeJourney ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active User Map (2 Columns) */}
          <div className="lg:col-span-2 min-h-[460px] h-[520px]">
            <GoogleMapView
              startLocation={activeJourney.start_location}
              destination={activeJourney.destination}
              currentLocation={{
                lat: activeJourney.current_location?.latitude || activeJourney.start_location.lat,
                lng: activeJourney.current_location?.longitude || activeJourney.start_location.lng,
                name: activeJourney.current_location?.name || 'Live GPS Location'
              }}
              locationHistory={activeJourney.location_history || []}
              isDeviated={activeJourney.simulated_anomalies?.includes('ROUTE_DEVIATION')}
              isOffline={activeJourney.is_offline}
              riskLevel={riskEval.riskLevel}
              eta="18 Mins"
              distance="5.2 km"
              speed={`${activeJourney.current_location?.speed || 28} km/h`}
            />
          </div>

          {/* Right Telemetry Sidebar */}
          <div className="space-y-6 flex flex-col justify-between">
            
            {/* Risk Gauge Card */}
            <div className={`glass-panel p-6 rounded-2xl border ${
              riskEval.riskLevel === 'RED' ? 'border-red-500/50 bg-red-950/30 glow-red' :
              riskEval.riskLevel === 'AMBER' ? 'border-amber-500/50 bg-amber-950/30 glow-amber' :
              'border-emerald-500/50 bg-emerald-950/20 glow-green'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live Journey Risk Score</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  riskEval.riskLevel === 'RED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  riskEval.riskLevel === 'AMBER' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {riskEval.riskLevel} LEVEL
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                <div>
                  <div className="text-3xl font-extrabold text-white font-outfit">{riskEval.riskScore} <span className="text-xs text-gray-400 font-normal">/ 100</span></div>
                  <p className="text-xs text-gray-300 mt-1">{riskEval.recommendedAction}</p>
                </div>
              </div>

              {/* Reasons */}
              <div className="mt-4 space-y-1.5 pt-3 border-t border-white/10">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reason Signals:</div>
                {riskEval.reasons?.map((r, i) => (
                  <div key={i} className="text-xs text-gray-200 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span>{r.text}</span>
                    {r.score > 0 && <span className="text-amber-400 font-bold">+{r.score}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* User Hardware Device Metrics */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>Device Status & Health</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <div className="text-gray-400 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery</span>
                  </div>
                  <div className="font-bold text-white">{activeJourney.current_location?.battery || 92}%</div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <div className="text-gray-400 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-blue-400" />
                    <span>Network</span>
                  </div>
                  <div className="font-bold text-emerald-400">ONLINE (5G)</div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <div className="text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Speed</span>
                  </div>
                  <div className="font-bold text-cyan-400">{activeJourney.current_location?.speed || 28} km/h</div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <div className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Status</span>
                  </div>
                  <div className="font-bold text-purple-400">{activeJourney.is_offline ? 'OFFLINE' : 'ACTIVE'}</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* No active journey monitoring banner */
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
          <UserCheck className="w-12 h-12 text-gray-500 mx-auto" />
          <h2 className="text-xl font-bold text-white font-outfit">No User Journey Currently Active</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            When {user.name} starts a safe journey in Safety Mode, real-time map telemetry, route progress, and AI risk alerts will appear here instantly.
          </p>
        </div>
      )}

    </div>
  );
}
