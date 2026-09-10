import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Navigation, ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, WifiOff, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AdminAnalyticsPage() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStats();
      if (res.success) {
        setStatsData(res);
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading system analytics data...
      </div>
    );
  }

  const s = statsData?.stats || {
    totalUsers: 1,
    activeJourneys: 1,
    greenJourneys: 1,
    amberEvents: 0,
    redAlerts: 0,
    sosEvents: 0,
    offlineDevices: 0,
    totalJourneysCount: 2,
    totalAlertsCount: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h1 className="text-3xl font-extrabold text-white font-outfit">VIGIL System Analytics & Admin</h1>
          </div>
          <p className="text-xs text-gray-400">Real-time database metrics, risk distributions, and emergency event statistics.</p>
        </div>

        <button
          onClick={fetchAdminStats}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-outfit">{s.totalUsers}</div>
          <p className="text-[10px] text-gray-400">Registered platform profiles</p>
        </div>

        {/* Active Journeys */}
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 space-y-2 bg-blue-950/20">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Journeys</span>
            <Navigation className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-outfit">{s.activeJourneys}</div>
          <p className="text-[10px] text-blue-300/80">Currently monitored trips</p>
        </div>

        {/* Green Journeys */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-2 bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Green (Normal)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 font-outfit">{s.greenJourneys}</div>
          <p className="text-[10px] text-emerald-300/80">Low risk safe trips</p>
        </div>

        {/* Offline Devices */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-500/30 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Offline Devices</span>
            <WifiOff className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-extrabold text-gray-200 font-outfit">{s.offlineDevices}</div>
          <p className="text-[10px] text-gray-400">Telemetry lost duration</p>
        </div>

      </div>

      {/* Secondary Risk & Anomaly Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Amber Anomaly Events */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-3">
          <div className="flex items-center justify-between text-amber-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base font-outfit">Amber Events</h3>
            </div>
            <span className="text-2xl font-extrabold text-amber-300 font-outfit">{s.amberEvents}</span>
          </div>
          <p className="text-xs text-gray-300">Route deviations, unexpected stops, and direction changes logged.</p>
        </div>

        {/* Red High Risk Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-red-950/20 space-y-3">
          <div className="flex items-center justify-between text-red-400">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-white text-base font-outfit">Red High Risk</h3>
            </div>
            <span className="text-2xl font-extrabold text-red-300 font-outfit">{s.redAlerts}</span>
          </div>
          <p className="text-xs text-gray-300">High risk threshold triggers requiring automated guardian checks.</p>
        </div>

        {/* Emergency SOS Broadcasts */}
        <div className="glass-panel p-6 rounded-2xl border border-rose-600/40 bg-rose-950/30 space-y-3 glow-red">
          <div className="flex items-center justify-between text-rose-400">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-bold text-white text-base font-outfit">Critical SOS Events</h3>
            </div>
            <span className="text-2xl font-extrabold text-white font-outfit">{s.sosEvents}</span>
          </div>
          <p className="text-xs text-rose-200/80">Immediate emergency alarm dispatches to primary guardian.</p>
        </div>

      </div>

      {/* Visual Stats Graph Representation */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-base font-outfit">Risk Score Level Distribution</h3>
        
        <div className="space-y-4 pt-2">
          
          {/* Green Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">🟢 GREEN (0-39 Low Risk)</span>
              <span className="text-gray-300">{s.greenJourneys} Journeys</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.totalJourneysCount > 0 ? (s.greenJourneys / s.totalJourneysCount) * 100 : 100}%` }}></div>
            </div>
          </div>

          {/* Amber Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-400">🟡 AMBER (40-69 Unusual Anomaly)</span>
              <span className="text-gray-300">{s.amberEvents} Events</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.totalJourneysCount > 0 ? (s.amberEvents / s.totalJourneysCount) * 100 : 25}%` }}></div>
            </div>
          </div>

          {/* Red Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-red-400">🔴 RED (70+ Critical Risk Alert)</span>
              <span className="text-gray-300">{s.redAlerts + s.sosEvents} Events</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.totalJourneysCount > 0 ? ((s.redAlerts + s.sosEvents) / s.totalJourneysCount) * 100 : 15}%` }}></div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
