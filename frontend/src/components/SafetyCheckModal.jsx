import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldCheck, Coffee, Clock, AlertTriangle, X, Sparkles, Volume2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { startAlarm, stopAlarm, speakVoiceAnnouncement } from '../utils/audio';
import { api } from '../services/api';

export default function SafetyCheckModal({
  isOpen,
  onClose,
  onRespondSafe,
  onRespondUnsafe,
  onRespondBreak,
  onRespondExtend,
  onTriggerSOS,
  onNoResponse,
  onUpdateTimeoutMins,
  triggerReason,
  timeoutMinutes = 2
}) {
  const [showBreakOptions, setShowBreakOptions] = useState(false);
  const [showDurationOptions, setShowDurationOptions] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [noResponseTriggered, setNoResponseTriggered] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [aiMessage, setAiMessage] = useState('Checking in with VIGIL AI Virtual Companion...');

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(30);
      setNoResponseTriggered(false);
      setShowToast(false);
      return;
    }

    setSecondsLeft(30);
    setNoResponseTriggered(false);
    setShowToast(false);

    // Fetch Gemini AI Conversational Check-in Prompt
    api.getAICheckIn(triggerReason || 'PROLONGED_INACTIVITY').then((res) => {
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
      `No response detected for ${timeoutMinutes} minutes inactivity. Dialing primary guardian Hari Kiran automatically.`
    );
    if (onNoResponse) {
      onNoResponse();
    }
  };

  const handleSafeAction = () => {
    stopAlarm();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onRespondSafe();
    }, 1200);
  };

  const handleUnsafeAction = () => {
    stopAlarm();
    if (onRespondUnsafe) {
      onRespondUnsafe();
    }
  };

  const handleSOSAction = () => {
    stopAlarm();
    window.location.href = 'tel:+917659834470';
    if (onTriggerSOS) {
      onTriggerSOS();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-[#121826] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl shadow-amber-500/40 text-white flex flex-col gap-5">
        
        {/* Safe Confirmation Toast */}
        {showToast && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xl border border-emerald-300 flex items-center gap-2 animate-bounce z-50">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>You're marked SAFE. Journey monitoring continues.</span>
          </div>
        )}

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
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ⚠️ VIGIL SAFETY CHECK
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-outfit tracking-wide mt-1">
              We haven't detected movement for {timeoutMinutes} minute{timeoutMinutes !== 1 ? 's' : ''}. Are you safe?
            </h2>
          </div>
        </div>

        {/* Gemini AI Voice Check-In Agent Card */}
        <div className="bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-slate-900 border border-cyan-500/30 p-3.5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>VIGIL AI Virtual Companion</span>
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

        {/* Visible 30-Second Countdown Timer */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          noResponseTriggered
            ? 'bg-red-500/20 border-red-500/50 text-red-300 glow-red animate-pulse'
            : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300'
        }`}>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-300 tracking-wider">RESPONSE COUNTDOWN</div>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              {noResponseTriggered ? '00' : `${String(secondsLeft).padStart(2, '0')}s`}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold block text-white">
              {noResponseTriggered ? '🚨 NO RESPONSE DETECTED' : `Please respond within ${secondsLeft} seconds.`}
            </span>
            <button
              onClick={() => setShowDurationOptions(!showDurationOptions)}
              className="text-[10px] font-bold text-cyan-400 hover:underline mt-1"
            >
              No-Movement Threshold: {timeoutMinutes} min →
            </button>
          </div>
        </div>

        {/* Duration Selection Input Mode */}
        {showDurationOptions && (
          <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span>Select No-Movement Threshold:</span>
              <button onClick={() => setShowDurationOptions(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (onUpdateTimeoutMins) onUpdateTimeoutMins(m);
                    setShowDurationOptions(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    timeoutMinutes === m ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 font-black' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3 Large Action Buttons: SAFE, UNSAFE, SOS */}
        {!showBreakOptions ? (
          <div className="space-y-3">
            {/* 🟢 SAFE */}
            <button
              onClick={handleSafeAction}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-600/40 border border-emerald-400/40 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-6 h-6" />
              <span>🟢 I'M SAFE</span>
            </button>

            {/* 🟠 UNSAFE */}
            <button
              onClick={handleUnsafeAction}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 border border-orange-400/40 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>🟠 I'M UNSAFE</span>
            </button>

            {/* 🔴 SOS EMERGENCY */}
            <button
              onClick={handleSOSAction}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-base shadow-xl shadow-red-600/50 border border-red-400/40 transition-all flex items-center justify-center gap-2 animate-pulse-glow"
            >
              <AlertOctagon className="w-6 h-6" />
              <span>🔴 SOS EMERGENCY</span>
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
                    stopAlarm();
                    onRespondBreak(mins);
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
