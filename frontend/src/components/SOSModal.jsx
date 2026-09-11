import React, { useState, useEffect } from 'react';
import { AlertOctagon, Phone, MapPin, Battery, Wifi, UserCheck, X, VolumeX, Volume2, ShieldAlert } from 'lucide-react';
import { startAlarm, stopAlarm, speakVoiceAnnouncement } from '../utils/audio';

export default function SOSModal({ isOpen, onClose, activeJourney, userProfile, onConfirmSOS }) {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [silentSent, setSilentSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto call primary enabled guardian Hari Kiran (+917659834470)
      window.location.href = 'tel:+917659834470';

      // Trigger Siren Alarm Sound
      startAlarm();
      setIsAlarmActive(true);

      // Trigger AI Voice Speech Announcement
      speakVoiceAnnouncement(
        "Emergency SOS has been activated. Auto calling primary guardian Hari Kiran at 7 6 5 9 8 3 4 4 7 0 immediately."
      );
    } else {
      stopAlarm();
      setIsAlarmActive(false);
    }

    return () => {
      stopAlarm();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAlarmSound = () => {
    if (isAlarmActive) {
      stopAlarm();
      setIsAlarmActive(false);
    } else {
      startAlarm();
      setIsAlarmActive(true);
    }
  };

  const handleSilentSOS = async () => {
    stopAlarm();
    setIsAlarmActive(false);
    setSilentSent(true);
    if (onConfirmSOS) {
      await onConfirmSOS(true);
    }
  };

  const handleStandardSOS = async () => {
    window.location.href = 'tel:+917659834470';
    if (onConfirmSOS) {
      await onConfirmSOS(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-xl animate-fadeIn">
      
      {/* Full-Screen Visual Flashing Emergency Overlay Indicator */}
      <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none"></div>

      <div className="relative w-full max-w-lg bg-[#121826] border border-red-500/60 rounded-3xl p-6 shadow-2xl shadow-red-600/50 text-white flex flex-col gap-5 z-10">
        
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

        {/* SOS Header Banner */}
        <div className="flex items-center gap-4 border-b border-red-500/30 pb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-xl shadow-red-600/50 animate-pulse-glow shrink-0">
            <AlertOctagon className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
              🚨 EMERGENCY PROTOCOL ACTIVE
            </span>
            <h2 className="text-2xl font-extrabold text-white font-outfit tracking-wide mt-1">CRITICAL SOS DISPATCH</h2>
            <p className="text-xs text-red-300">Audio Alarm & AI Voice Announcement Triggered</p>
          </div>
        </div>

        {/* Alarm Sound Controller Bar */}
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 p-3 rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-red-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
            <span>Siren Alarm: {isAlarmActive ? 'PLAYING AUDIO' : 'MUTED'}</span>
          </div>

          <button
            onClick={toggleAlarmSound}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isAlarmActive
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-white/10 text-gray-300 border-white/20'
            }`}
          >
            {isAlarmActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAlarmActive ? 'MUTE SIREN' : 'START SIREN'}</span>
          </button>
        </div>

        {/* Live Device Payload Summary */}
        <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
          <div className="space-y-1">
            <div className="text-gray-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current GPS Location:</span>
            </div>
            <p className="font-bold text-white truncate">
              {activeJourney?.current_location?.name || '12.9716 N, 77.5946 E'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-gray-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Primary Guardian:</span>
            </div>
            <p className="font-bold text-white">
              Hari Kiran (+917659834470)
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-gray-400 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>Device Battery:</span>
            </div>
            <p className="font-bold text-white">
              {activeJourney?.current_location?.battery || 92}%
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-gray-400 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              <span>Network Telemetry:</span>
            </div>
            <p className="font-bold text-emerald-400">ONLINE (CELLULAR)</p>
          </div>
        </div>

        {/* Direct Call to Primary Guardian Banner */}
        <div className="bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border border-cyan-500/50 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg shadow-blue-500/20">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">Enabled Primary Guardian</span>
            <h4 className="text-base font-extrabold text-white font-outfit">HARI KIRAN</h4>
            <p className="text-[11px] text-cyan-200/80">+917659834470</p>
          </div>
          <a
            href="tel:+917659834470"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 border border-cyan-300/40 transition-all shrink-0 active:scale-95"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>DIRECT CALL</span>
          </a>
        </div>

        {/* National Emergency Hotline Banner */}
        <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-300 tracking-wider">Official Hotline</span>
            <h4 className="text-lg font-black text-white font-outfit">INDIA EMERGENCY: 112</h4>
            <p className="text-[11px] text-red-200/80">Direct call to National Emergency Response</p>
          </div>
          <a
            href="tel:112"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 border border-red-400/30 transition-all shrink-0 active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>CALL 112</span>
          </a>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleStandardSOS}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-xl shadow-red-600/50 border border-red-400/40 transition-all active:scale-98"
          >
            <AlertOctagon className="w-5 h-5" />
            <span>BROADCAST FULL GUARDIAN ALARM</span>
          </button>

          <button
            onClick={handleSilentSOS}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              silentSent
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
            }`}
          >
            <VolumeX className="w-4 h-4 text-purple-400" />
            <span>{silentSent ? 'SILENT SOS TELEMETRY DISPATCHED' : 'SILENT SOS PROTOTYPE (DISCREET ALERT)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
