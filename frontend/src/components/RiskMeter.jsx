import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Cpu, Info, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RiskMeter({ riskScore = 15, riskLevel = 'GREEN', reasons = [], recommendedAction = '' }) {
  
  const getColors = () => {
    if (riskLevel === 'RED') {
      return {
        bg: 'from-red-950/60 to-red-900/30',
        border: 'border-red-500/40',
        text: 'text-red-400',
        glow: 'glow-red',
        progressBg: 'bg-red-500',
        badge: 'bg-red-500/20 border-red-500/50 text-red-300'
      };
    }
    if (riskLevel === 'AMBER') {
      return {
        bg: 'from-amber-950/60 to-amber-900/30',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        glow: 'glow-amber',
        progressBg: 'bg-amber-500',
        badge: 'bg-amber-500/20 border-amber-500/50 text-amber-300'
      };
    }
    return {
      bg: 'from-emerald-950/60 to-emerald-900/30',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      glow: 'glow-green',
      progressBg: 'bg-emerald-500',
      badge: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
    };
  };

  const style = getColors();

  return (
    <div className={`glass-panel p-6 rounded-2xl border bg-gradient-to-br ${style.bg} ${style.border} ${style.glow} flex flex-col justify-between transition-all duration-300`}>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base font-outfit tracking-wide">Explainable AI Risk Engine</h3>
            <p className="text-[11px] text-gray-400">Real-time journey anomaly analysis</p>
          </div>
        </div>

        {/* Level Badge */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 ${style.badge}`}>
          {riskLevel === 'RED' ? <ShieldAlert className="w-4 h-4" /> : riskLevel === 'AMBER' ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{riskLevel} LEVEL</span>
        </div>
      </div>

      {/* Main Score Visualizer Gauge */}
      <div className="my-2 flex flex-col sm:flex-row items-center gap-6 bg-black/30 p-4 rounded-xl border border-white/5">
        
        {/* Circular Gauge Score */}
        <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-white/10"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={style.text}
              strokeDasharray={`${riskScore}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-extrabold font-outfit ${style.text}`}>{riskScore}</span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">/ 100</span>
          </div>
        </div>

        {/* Linear Progress & Scale */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-400">0–39 GREEN</span>
            <span className="text-amber-400">40–69 AMBER</span>
            <span className="text-red-400">70+ RED</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.progressBg}`}
              style={{ width: `${Math.max(5, riskScore)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-300 pt-1 italic">
            "{recommendedAction || 'Normal baseline safety monitoring.'}"
          </p>
        </div>

      </div>

      {/* Explainable AI Reasons Breakdown */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5 mb-2">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Why is my risk score this level?</span>
        </h4>

        <div className="space-y-1.5">
          {reasons && reasons.length > 0 ? (
            reasons.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-gray-200 flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                  {r.text}
                </span>
                {r.score > 0 && (
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    +{r.score}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All telemetry signals within normal baseline thresholds.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
