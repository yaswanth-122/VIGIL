import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, UserCheck, ShieldAlert, ArrowRight, Compass, LocateFixed, Search, AlertCircle, Sparkles, Sun, ExternalLink, Building2, Map, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';

export default function StartJourneyPage({ onActivateSafetyMode }) {
  const navigate = useNavigate();

  const [journeyName, setJourneyName] = useState('Safe Travel Commute');
  const [startName, setStartName] = useState('Current GPS Location');
  const [startLat, setStartLat] = useState(12.9716);
  const [startLng, setStartLng] = useState(77.5946);

  // Destination Search input & Lat/Lng
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [destName, setDestName] = useState('Marina Beach');
  const [destLat, setDestLat] = useState(13.0475);
  const [destLng, setDestLng] = useState(80.2824);

  // Live Google Places Search Autocomplete State
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState({
    name: 'Marina Beach',
    address: 'Kamarajar Salai, Triplicane, Chennai, Tamil Nadu',
    category: 'Public Beach',
    lat: 13.0475,
    lng: 80.2824,
    safetyScore: 88,
    lighting: 'Well-Lit Corridor',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=13.0475,80.2824'
  });

  const [durationMins, setDurationMins] = useState(45);
  const [safetyTimeoutMins, setSafetyTimeoutMins] = useState(10);
  const [isAutoDuration, setIsAutoDuration] = useState(true);
  const [calculatedDistKm, setCalculatedDistKm] = useState('8.4');
  const [guardians, setGuardians] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI Route Analysis State
  const [aiRouteInsight, setAiRouteInsight] = useState(null);

  // Auto-calculate ETA (Expected Time of Arrival) based on coordinates
  const handleAutoCalculateETA = (sLat = startLat, sLng = startLng, dLat = destLat, dLng = destLng) => {
    const R = 6371; // Earth radius in km
    const dLatRad = ((dLat - sLat) * Math.PI) / 180;
    const dLngRad = ((dLng - sLng) * Math.PI) / 180;
    const a =
      Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
      Math.cos((sLat * Math.PI) / 180) *
        Math.cos((dLat * Math.PI) / 180) *
        Math.sin(dLngRad / 2) *
        Math.sin(dLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = R * c;

    // Estimate minutes based on ~ 28km/h average urban speed + 10 min buffer
    const calculatedMins = Math.max(15, Math.round((distKm / 28) * 60 + 10));
    const distStr = distKm.toFixed(1);
    setCalculatedDistKm(distStr);
    setDurationMins(calculatedMins);
    setIsAutoDuration(true);
    return { distKm: distStr, mins: calculatedMins };
  };

  useEffect(() => {
    fetchGuardiansList();
    handleDetectGPS();
    fetchAIRouteAnalysis(startName, destName);
    performPlaceSearch('');
  }, []);

  // Debounced Place Search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destSearchQuery && destSearchQuery.trim().length >= 2) {
        performPlaceSearch(destSearchQuery);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [destSearchQuery]);

  const performPlaceSearch = async (queryStr) => {
    try {
      setIsSearchingPlaces(true);
      const res = await api.searchPlaces(queryStr);
      if (res.success && res.places) {
        setSearchResults(res.places);
      }
    } catch (err) {
      console.error('Error searching places:', err);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const fetchGuardiansList = async () => {
    try {
      const res = await api.getGuardians();
      if (res.success && res.guardians.length > 0) {
        setGuardians(res.guardians);
        const primary = res.guardians.find(g => g.is_primary) || res.guardians[0];
        setSelectedContact(primary.id);
      }
    } catch (err) {
      console.error('Error loading guardians:', err);
    }
  };

  const fetchAIRouteAnalysis = async (orig, dest) => {
    try {
      const res = await api.getAIRouteAnalysis(orig, dest);
      if (res.success && res.analysis) {
        setAiRouteInsight(res.analysis);
      }
    } catch (err) {
      console.warn('AI Route analysis warning:', err);
    }
  };

  // Detect Real Browser Geolocation
  const handleDetectGPS = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Using current location coordinates.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStartLat(pos.coords.latitude);
        setStartLng(pos.coords.longitude);
        const name = `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
        setStartName(name);
        setIsLocating(false);
        fetchAIRouteAnalysis(name, destName);
      },
      (err) => {
        console.warn('GPS permission denied or timeout:', err);
        setIsLocating(false);
        setGpsError('GPS permission was denied or timed out. Demo simulation coordinates loaded.');
      },
      { timeout: 8000 }
    );
  };

  // Select place from Autocomplete / Suggestions
  const handleChoosePlace = (place) => {
    setDestName(place.name);
    setDestLat(place.lat);
    setDestLng(place.lng);
    setDestSearchQuery(place.name);
    setSelectedPlaceDetails(place);
    setShowSearchResults(false);
    fetchAIRouteAnalysis(startName, place.name);
    handleAutoCalculateETA(startLat, startLng, place.lat, place.lng);
  };

  const handleCustomDestSearch = (e) => {
    const val = e.target.value;
    setDestSearchQuery(val);
    setShowSearchResults(true);
    setDestName(val || 'Custom Destination');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: journeyName,
        start_location: { name: startName, lat: parseFloat(startLat), lng: parseFloat(startLng) },
        destination: { name: destName, lat: parseFloat(destLat), lng: parseFloat(destLng) },
        duration_mins: parseInt(durationMins),
        safety_timeout_mins: parseInt(safetyTimeoutMins),
        trusted_contact_id: selectedContact,
        mode: 'safety'
      };

      const res = await api.createJourney(payload);
      if (res.success) {
        onActivateSafetyMode();
        navigate('/active');
      }
    } catch (err) {
      console.error('Error starting journey:', err);
      alert('Failed to start journey. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <ShieldAlert className="w-4 h-4" />
          <span>START SAFE JOURNEY</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Configure Your Safe Travel Companion</h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Search any destination. Gemini AI predicts safe street corridors & voluntary GPS safety tracking.
        </p>
      </div>

      {gpsError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={handleDetectGPS}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-bold border border-amber-500/40 shrink-0"
          >
            Retry GPS
          </button>
        </div>
      )}

      {/* Gemini AI Predictive Safe Route Card */}
      {aiRouteInsight && (
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-blue-950/40 to-cyan-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>VIGIL Gemini AI Route Intelligence</span>
            </div>
            <p className="text-xs text-gray-200">
              {aiRouteInsight.insightText}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center bg-black/40 px-3 py-2 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-bold uppercase">AI Safety Score</div>
              <div className="text-lg font-extrabold text-emerald-400 font-outfit">{aiRouteInsight.safetyScore}%</div>
            </div>

            <div className="text-center bg-black/40 px-3 py-2 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Well-Lit Path</span>
              </div>
              <div className="text-lg font-extrabold text-cyan-400 font-outfit">{aiRouteInsight.wellLitPercentage}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        
        {/* Journey Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Journey Name</span>
          </label>
          <input
            type="text"
            required
            value={journeyName}
            onChange={(e) => setJourneyName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
            placeholder="e.g. Evening Commute, Late Night Airport Taxi"
          />
        </div>

        {/* Start Location (Origin) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Starting Location</span>
            </label>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-all"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Detect Live Browser GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={startName}
              onChange={(e) => setStartName(e.target.value)}
              className="sm:col-span-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
              placeholder="Origin Name"
            />
            <input
              type="number"
              step="any"
              required
              value={startLat}
              onChange={(e) => setStartLat(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
              placeholder="Latitude"
            />
            <input
              type="number"
              step="any"
              required
              value={startLng}
              onChange={(e) => setStartLng(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
              placeholder="Longitude"
            />
          </div>
        </div>

        {/* Destination Search Box with Google Places Auto-Complete */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Search className="w-4 h-4 text-red-400" />
              <span>Search Destination (Live Google Places API)</span>
            </label>
            {isSearchingPlaces && (
              <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Searching Google Maps API...</span>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={destSearchQuery}
                onFocus={() => setShowSearchResults(true)}
                onChange={handleCustomDestSearch}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors shadow-inner"
                placeholder="Type place name, airport, station, mall, or address..."
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 pointer-events-none" />
              {destSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setDestSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown List */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-2 bg-[#0B0F19] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl divide-y divide-white/5 animate-fadeIn">
                <div className="px-4 py-2 bg-slate-950/80 text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
                  <span>Google Places Matching Suggestions ({searchResults.length})</span>
                  <span>Click to select</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleChoosePlace(place)}
                      className="w-full text-left p-3 hover:bg-white/10 flex items-start gap-3 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-white truncate">{place.name}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 capitalize">
                            {place.category || 'Location'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{place.address}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-mono">
                          <span className="text-emerald-400 font-semibold">Lat: {place.lat?.toFixed(4)}, Lng: {place.lng?.toFixed(4)}</span>
                          <span className="text-amber-300">⚡ AI Safety: {place.safetyScore}%</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Google Place Details Card */}
          {selectedPlaceDetails && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-outfit">Google Places Destination Details</span>
                </div>
                <a
                  href={selectedPlaceDetails.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-all"
                >
                  <span>Open Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">SELECTED PLACE:</span>
                  <strong className="text-white text-sm">{selectedPlaceDetails.name}</strong>
                  <p className="text-gray-300 text-[11px] mt-0.5">{selectedPlaceDetails.address}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px]">COORDINATES:</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{destLat?.toFixed(4)}, {destLng?.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px]">LIGHTING INDEX:</span>
                    <span className="text-emerald-400 font-bold text-[11px]">{selectedPlaceDetails.lighting || 'Well-Lit Corridor'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px]">AI SAFETY RATING:</span>
                    <span className="text-amber-400 font-extrabold text-[11px]">{selectedPlaceDetails.safetyScore || 92}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Input Coordinate Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <input
              type="text"
              required
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              className="sm:col-span-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
              placeholder="Selected Destination Name"
            />
            <input
              type="number"
              step="any"
              required
              value={destLat}
              onChange={(e) => setDestLat(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
              placeholder="Latitude"
            />
            <input
              type="number"
              step="any"
              required
              value={destLng}
              onChange={(e) => setDestLng(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
              placeholder="Longitude"
            />
          </div>
        </div>

        {/* Duration & Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Expected Duration Selector & Auto-Set ETA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Expected Journey Duration</span>
              </label>

              <button
                type="button"
                onClick={() => handleAutoCalculateETA()}
                className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/40 shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>⚡ Auto-Set ETA</span>
              </button>
            </div>

            {/* Auto-ETA Calculated Banner */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-gray-300 font-semibold">
                  Distance: <strong className="text-cyan-300">{calculatedDistKm} km</strong>
                </span>
              </div>
              <span className="text-emerald-400 font-extrabold text-sm">
                Target ETA: {durationMins} Mins
              </span>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Auto ETA', value: durationMins, isAuto: true },
                { label: '30 Mins', value: 30 },
                { label: '45 Mins', value: 45 },
                { label: '1 Hour', value: 60 }
              ].map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (opt.isAuto) {
                      handleAutoCalculateETA();
                    } else {
                      setDurationMins(opt.value);
                      setIsAutoDuration(false);
                    }
                  }}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    durationMins === opt.value
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 shadow-md shadow-blue-500/20'
                      : 'bg-black/20 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Minutes Input Override */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-gray-400 font-medium shrink-0">Custom Time:</span>
              <input
                type="number"
                min="5"
                max="600"
                value={durationMins}
                onChange={(e) => {
                  setDurationMins(parseInt(e.target.value) || 30);
                  setIsAutoDuration(false);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                placeholder="Enter custom minutes..."
              />
              <span className="text-xs text-gray-400 font-bold shrink-0">Mins</span>
            </div>
          </div>

          {/* Trusted Guardian Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Primary Guardian Contact</span>
            </label>
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-400"
            >
              {guardians && guardians.length > 0 ? (
                guardians.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.relationship}) — {g.phone}
                  </option>
                ))
              ) : (
                <option value="tc_1">Sarah Rivera (Mother) — +1 (555) 987-6543</option>
              )}
            </select>
          </div>

        </div>

        {/* Prolonged Activity Safety Check Popup Duration Selector */}
        <div className="space-y-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Safety Check Popup & Prolonged Activity Duration</span>
            </label>
            <span className="text-xs text-amber-400 font-extrabold font-mono">
              {safetyTimeoutMins} Mins Timeout
            </span>
          </div>
          <p className="text-[11px] text-gray-300">
            Select duration after prolonged activity or stationary stop when "ARE YOU SAFE?" popup appears:
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: '2 Mins', val: 2, tag: 'Demo' },
              { label: '5 Mins', val: 5, tag: 'Fast' },
              { label: '10 Mins', val: 10, tag: 'Default' },
              { label: '15 Mins', val: 15, tag: 'Standard' },
              { label: '30 Mins', val: 30, tag: 'Relaxed' }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setSafetyTimeoutMins(opt.val)}
                className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                  safetyTimeoutMins === opt.val
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/80 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-black/30 text-gray-400 border-white/10 hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-[9px] font-mono opacity-70">{opt.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-blue-600/40 border border-cyan-400/30 transition-all hover:scale-[1.01] active:scale-98"
          >
            <Navigation className="w-5 h-5" />
            <span>{submitting ? 'INITIALIZING SAFE JOURNEY...' : 'ACTIVATE SAFETY MODE & BEGIN TRACKING'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </form>
    </div>
  );
}
