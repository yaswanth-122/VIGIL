import React from 'react';
import { History, ShieldCheck, AlertTriangle, AlertOctagon, PhoneCall, Navigation, Clock, Activity, CheckCircle2 } from 'lucide-react';

export default function SafetyEventLog({ safetyLog = [] }) {
  if (!safetyLog || safetyLog.length === 0) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-white/10 text-center text-xs text-gray-400 space-y-2">
        <History className="w-6 h-6 mx-auto text-gray-500" />
        <p>No safety events logged for this journey yet.</p>
      </div>
    );
  }

  const getEventBadge = (eventName) => {
    switch (eventName) {
      case 'Journey Started':
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Navigation };
      case 'Movement Detected':
        return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Activity };
      case 'Inactivity Detected':
      case 'Safety Check Triggered':
        return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: AlertTriangle };
      case 'User Marked SAFE':
        return { bg: 'bg-emerald-600/30 text-emerald-300 border-emerald-400/50', icon: ShieldCheck };
      case 'User Marked UNSAFE':
        return { bg: 'bg-orange-600/30 text-orange-300 border-orange-400/50', icon: AlertTriangle };
      case 'SOS Triggered':
      case 'No Response / Potential Emergency':
        return { bg: 'bg-red-600/30 text-red-300 border-red-400/50', icon: AlertOctagon };
      case 'Guardian Notified':
        return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: PhoneCall };
      default:
        return { bg: 'bg-gray-500/20 text-gray-300 border-gray-500/40', icon: Clock };
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="font-extrabold text-white text-base font-outfit">Journey Safety Event Log</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {safetyLog.length} Event{safetyLog.length !== 1 ? 's' : ''} Recorded
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {safetyLog.map((item, idx) => {
          const badge = getEventBadge(item.event);
          const IconComp = badge.icon;
          const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Now';

          return (
            <div
              key={item.id || idx}
              className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-start gap-3 transition-all hover:bg-white/5"
            >
              <div className={`p-2 rounded-xl border ${badge.bg} shrink-0 mt-0.5`}>
                <IconComp className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white truncate">{item.event}</span>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">{timeStr}</span>
                </div>
                {item.details && (
                  <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">{item.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
