import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldCheck, Coffee, Clock, AlertTriangle, X, Bot, Sparkles, Volume2 } from 'lucide-react';
import { startAlarm, stopAlarm, speakVoiceAnnouncement } from '../utils/audio';
import { api } from '../services/api';

export default function SafetyCheckModal({
  isOpen,
  onClose,
  onRespondSafe,
  onRespondBreak,
  onRespondExtend,
  onTriggerSOS,
  onUpdateTimeoutMins,
  triggerReason,
  timeoutMinutes = 10
}) {
  const [showBreakOptions, setShowBreakOptions] = useState(false);
  const [showDurationOptions, setShowDurationOptions] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeoutMinutes * 60);
  const [noResponseTriggered, setNoResponseTriggered] = useState(false);
  const [aiMessage, setAiMessage] = useState('Checking in with VIGIL AI Virtual Companion...');

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(timeoutMinutes * 60);
      setNoResponseTriggered(false);
      return;
    }

    setSecondsLeft(timeoutMinutes * 60);
    setNoResponseTriggered(false);

    // Fetch Gemini AI Conversational Check-in Prompt
    api.getAICheckIn(triggerReason || 'PROLONGED_ACTIVITY').then((res) => {
      if (res.success && res.ai_message) {
        setAiMessage(res.ai_message);
        speakVoiceAnnouncement(res.ai_message);
      }
    }).catch(() => {});

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNoResponseTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeoutMinutes]);

  const handleNoResponseTimeout = () => {
    setNoResponseTriggered(true);
    startAlarm();
    window.location.href = 'tel:+917659834470';
    speakVoiceAnnouncement(
      "No safety check response detected after prolonged activity. Dialing primary guardian Hari Kiran automatically."
    );
  };

  const handleSafeAction = () => {
    stopAlarm();
    onRespondSafe();
  };

  const handleBreakAction = (mins) => {
    stopAlarm();
    onRespondBreak(mins);
  };

  if (!isOpen) return null;

  const minutesPart = Math.floor(secondsLeft / 60);
  const secondsPart = secondsLeft % 60;
  const formattedTime = `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121826] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl shadow-amber-500/30 text-white flex flex-col gap-5">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopAlarm();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="flex items-center gap-4 border-b border-amber-500/20 pb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 glow-amber shrink-0 animate-bounce">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ⚠️ PROLONGED ACTIVITY DETECTED
            </span>
            <h2 className="text-2xl font-extrabold text-white font-outfit tracking-wide mt-0.5">ARE YOU SAFE?</h2>
            <p className="text-xs text-amber-300 font-medium">{triggerReason || 'Unexpected stop or prolonged inactivity detected'}</p>
          </div>
        </div>

        {/* Gemini AI Voice Check-In Agent Card */}
        <div className="bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-slate-900 border border-cyan-500/30 p-4 rounded-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>VIGIL Gemini AI Voice Agent Check-in</span>
            </div>
            <button
              type="button"
              onClick={() => speakVoiceAnnouncement(aiMessage)}
              className="p-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-[10px] flex items-center gap-1 font-bold"
              title="Replay Voice Speech"
            >
              <Volume2 className="w-3 h-3" />
              <span>Replay Voice</span>
            </button>
          </div>
          <p className="text-xs text-gray-200 italic leading-relaxed">
            “{aiMessage}”
          </p>
        </div>

        {/* Countdown Timer & Duration Indicator Display */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          noResponseTriggered ? 'bg-red-500/20 border-red-500/50 text-red-300 glow-red animate-pulse' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Response Countdown</div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {noResponseTriggered ? '00:00' : formattedTime}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold block">
              {noResponseTriggered ? '🚨 NO RESPONSE DETECTED' : `Safety Popup Interval: ${timeoutMinutes} Mins`}
            </span>
            <button
              onClick={() => setShowDurationOptions(!showDurationOptions)}
              className="text-[10px] font-bold text-cyan-400 hover:underline mt-0.5"
            >
              Change Duration →
            </button>
          </div>
        </div>

        {/* Duration Selection Input Mode */}
        {showDurationOptions && (
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span>Select Prolonged Activity Safety Check Duration:</span>
              <button onClick={() => setShowDurationOptions(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 5, 10, 15, 30].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (onUpdateTimeoutMins) onUpdateTimeoutMins(m);
                    setShowDurationOptions(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    timeoutMinutes === m ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        {!showBreakOptions ? (
          <div className="space-y-2.5">
            {/* I'm Safe Button */}
            <button
              onClick={handleSafeAction}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 border border-emerald-400/30 transition-all active:scale-98"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>YES, I'M SAFE (RESET ALERT)</span>
            </button>

            {/* Taking a Break Button */}
            <button
              onClick={() => setShowBreakOptions(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs transition-all"
            >
              <Coffee className="w-4 h-4" />
              <span>TAKING A BREAK</span>
            </button>

            {/* Extend Journey Button */}
            <button
              onClick={() => onRespondExtend(30)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>EXTEND JOURNEY (+30 MINS)</span>
            </button>

            {/* SOS Direct Trigger */}
            <button
              onClick={() => {
                stopAlarm();
                window.location.href = 'tel:+917659834470';
                onTriggerSOS();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-lg shadow-red-600/40 border border-red-400/30 transition-all flex items-center justify-center gap-2 animate-pulse-glow"
            >
              <AlertOctagon className="w-5 h-5" />
              <span>🚨 TRIGGER EMERGENCY SOS & AUTO-CALL</span>
            </button>
          </div>
        ) : (
          /* Break Duration Selector */
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Select Break Duration:</h4>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    handleBreakAction(mins);
                    setShowBreakOptions(false);
                  }}
                  className="py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 font-bold text-xs transition-all flex flex-col items-center gap-1"
                >
                  <Coffee className="w-4 h-4 text-blue-400" />
                  <span>{mins} Mins</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBreakOptions(false)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-200 pt-2"
            >
              ← Back to options
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
