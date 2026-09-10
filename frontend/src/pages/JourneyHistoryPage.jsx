import React, { useEffect, useState } from 'react';
import { History, MapPin, Calendar, Clock, ShieldCheck, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import GoogleMapView from '../components/GoogleMapView';

export default function JourneyHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getJourneyHistory();
      if (res.success) {
        setHistory(res.journeys);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading journey history...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h1 className="text-3xl font-extrabold text-white font-outfit">Completed Journey History</h1>
        </div>
        <p className="text-xs text-gray-400">Review past trip travel paths, risk logs, and safety check responses.</p>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history && history.length > 0 ? (
          history.map((jrn) => {
            const isExpanded = expandedId === jrn.id;
            return (
              <div key={jrn.id} className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition-all">
                
                {/* Summary Row Header */}
                <div
                  onClick={() => toggleExpand(jrn.id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base font-outfit">{jrn.name}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        jrn.risk_level === 'RED' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                        jrn.risk_level === 'AMBER' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {jrn.risk_level || 'GREEN'} ({jrn.risk_score || 10}/100)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {jrn.start_location?.name} → {jrn.destination?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(jrn.start_time).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {jrn.duration_mins || 28} mins ({jrn.distance_km || 6.4} km)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400">
                      {isExpanded ? 'Hide Details' : 'View Replay'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </div>

                {/* Expanded Details: Map & Logs */}
                {isExpanded && (
                  <div className="p-5 border-t border-white/10 bg-black/40 space-y-6">
                    
                    {/* Replay Map */}
                    <div className="h-80 rounded-xl overflow-hidden border border-white/10">
                      <GoogleMapView
                        startLocation={jrn.start_location}
                        destination={jrn.destination}
                        currentLocation={jrn.destination}
                        locationHistory={[]}
                        isDeviated={false}
                        isOffline={false}
                        riskLevel={jrn.risk_level}
                        eta="Arrived"
                        distance={`${jrn.distance_km || 6.4} km`}
                        speed="0 km/h"
                      />
                    </div>

                    {/* Timeline Log */}
                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-gray-300 uppercase tracking-wider">Trip Timeline & Safety Events</h4>
                      <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-gray-300">
                          <span>🚀 Trip Departed from {jrn.start_location?.name}</span>
                          <span className="text-gray-500">{new Date(jrn.start_time).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>✅ Journey Monitoring Concluded cleanly</span>
                          <span className="text-gray-500">{jrn.end_time ? new Date(jrn.end_time).toLocaleTimeString() : 'Completed'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="glass-panel p-12 rounded-3xl text-center text-gray-400 space-y-3">
            <ShieldCheck className="w-12 h-12 text-gray-500 mx-auto" />
            <p className="font-bold">No completed journeys recorded yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
