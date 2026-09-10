import React from 'react';
import { Sliders, RefreshCw, AlertTriangle, WifiOff, ShieldAlert, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function DemoControlCenterBar({
  onTriggerEvent,
  onReset,
  onSimulateOffline,
  onTriggerSafetyCheck,
  onTriggerSOS,
  onTriggerImpact,
  activeJourneyId
}) {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 bg-slate-950/80 shadow-2xl space-y-3">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm font-outfit tracking-wide flex items-center gap-2">
              DEMO SIMULATION ENGINE
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live Hackathon Controls
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">Simulate anomalies & test backend risk engine in real time</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>🔄 Reset Demo</span>
        </button>
      </div>

      {/* Button Controls */}
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Normal Journey */}
        <button
          onClick={() => onTriggerEvent('RESET')}
          className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>🟢 Normal Journey</span>
        </button>

        {/* Phone Drop Impact */}
        {onTriggerImpact && (
          <button
            onClick={onTriggerImpact}
            className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all glow-red animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>💥 Phone Fall Impact</span>
          </button>
        )}

        {/* Route Deviation */}
        <button
          onClick={() => onTriggerEvent('ROUTE_DEVIATION')}
          className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>🟡 Route Deviation</span>
        </button>

        {/* Prolonged Stop */}
        <button
          onClick={() => onTriggerEvent('PROLONGED_STOP')}
          className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>🟡 Prolonged Stop</span>
        </button>

        {/* Direction Change */}
        <button
          onClick={() => onTriggerEvent('DIRECTION_CHANGE')}
          className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>🟡 Direction Change</span>
        </button>

        {/* ETA Delay */}
        <button
          onClick={() => onTriggerEvent('ETA_DELAY')}
          className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>🟡 ETA Delay</span>
        </button>

        {/* Multiple Anomalies */}
        <button
          onClick={() => onTriggerEvent('MULTIPLE_ANOMALIES')}
          className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center gap-1.5 transition-all glow-red"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>🔴 Multiple Anomalies</span>
        </button>

        {/* Device Offline */}
        <button
          onClick={onSimulateOffline}
          className="px-3 py-2 rounded-xl bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/40 text-gray-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
        >
          <WifiOff className="w-3.5 h-3.5 text-gray-400" />
          <span>⚠️ Device Offline</span>
        </button>

        {/* Trigger Safety Check */}
        <button
          onClick={onTriggerSafetyCheck}
          className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>🛡️ Safety Check</span>
        </button>

        {/* Trigger SOS */}
        <button
          onClick={onTriggerSOS}
          className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>🚨 Trigger SOS</span>
        </button>

      </div>
    </div>
  );
}
