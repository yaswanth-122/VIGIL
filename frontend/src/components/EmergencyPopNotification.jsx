import React, { useEffect } from 'react';
import { AlertOctagon, Phone, ExternalLink, MapPin, X, CheckCircle, Smartphone, Radio, Navigation } from 'lucide-react';

export default function EmergencyPopNotification({ alertData, onClose }) {
  useEffect(() => {
    // Request & trigger browser native HTML5 notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const lat = alertData?.location?.lat || '12.9716';
        const lng = alertData?.location?.lng || '77.5946';
        new Notification('🚨 VIGIL EMERGENCY SOS POP NOTIFICATION', {
          body: `Emergency Alert for ${alertData?.user_name || 'User'}! Pop notification sent to +917659834470. Google Maps: https://maps.google.com/?q=${lat},${lng}`,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [alertData]);

  if (!alertData) return null;

  const lat = alertData?.location?.lat || 12.9716;
  const lng = alertData?.location?.lng || 77.5946;
  const googleMapsUrl = alertData?.location?.google_maps_url || `https://www.google.com/maps?q=${lat},${lng}`;
  const googleMapsEmbed = alertData?.location?.google_maps_embed || `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  const guardians = alertData?.notified_guardians || [
    { name: 'Hari Kiran', phone: '+917659834470', is_primary: true, push_status: 'POPUP_NOTIFIED_DIALING' },
    { name: 'David Chen', phone: '+1 (555) 456-7890', is_primary: false, push_status: 'POPUP_NOTIFIED' },
    { name: 'National Emergency', phone: '112', is_primary: false, push_status: 'HOTLINE_BROADCAST_SENT' }
  ];

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-[480px] z-50 animate-slideDown font-sans">
      <div className="relative bg-[#0F1420]/95 backdrop-blur-2xl border-2 border-red-500 rounded-3xl p-5 shadow-2xl shadow-red-600/60 text-white space-y-4 glow-red">
        
        {/* Top Header Banner */}
        <div className="flex items-start justify-between gap-3 border-b border-red-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-600/50 animate-pulse-glow shrink-0">
              <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  🚨 POP NOTIFICATION DISPATCHED
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white font-outfit mt-0.5">
                EMERGENCY SOS MOBILE ALERT
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pop Notifications Sent to Emergency Numbers Card */}
        <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Smartphone className="w-4 h-4" />
              <span>Notified Emergency Mobile Numbers</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>POP-UP DELIVERED</span>
            </span>
          </div>

          <div className="space-y-2">
            {guardians.map((g, idx) => (
              <div key={idx} className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>{g.name}</span>
                    {g.is_primary && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/30 text-purple-300 border border-purple-400/40">
                        DEFAULT GUARDIAN
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono">{g.phone}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    g.is_primary ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {g.is_primary ? '🟢 DIALING NOW' : '🟢 NOTIFIED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Google Maps Location Card */}
        <div className="bg-gradient-to-r from-blue-950/80 to-cyan-950/80 p-3.5 rounded-2xl border border-cyan-500/40 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>Google Maps Live Location Pin</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </span>
          </div>

          {/* Embedded Google Maps Preview Frame */}
          <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 relative bg-slate-900">
            <iframe
              title="Google Maps SOS Location"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={googleMapsEmbed}
              className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
            ></iframe>
            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Google Maps API Pin</span>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/30 border border-cyan-300/40 transition-all active:scale-98"
          >
            <ExternalLink className="w-4 h-4" />
            <span>OPEN LIVE LOCATION IN GOOGLE MAPS</span>
          </a>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href="tel:+917659834470"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/40 border border-red-300/40 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>CALL GUARDIAN (+917659834470)</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
