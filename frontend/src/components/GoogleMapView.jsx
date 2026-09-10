import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Compass, ShieldAlert, AlertTriangle, Radio, Plus, Minus, Layers, LocateFixed, Eye, Navigation } from 'lucide-react';

export default function GoogleMapView({
  startLocation = { name: 'Origin', lat: 12.9716, lng: 77.5946 },
  destination = { name: 'Destination', lat: 12.9352, lng: 77.6245 },
  currentLocation = { lat: 12.9716, lng: 77.5946 },
  locationHistory = [],
  isDeviated = false,
  isOffline = false,
  riskLevel = 'GREEN',
  eta = '18 mins',
  distance = '5.2 km',
  speed = '28 km/h',
  onSelectMapDestination
}) {
  const mapRef = useRef(null);
  const googleMapObj = useRef(null);
  const userMarkerObj = useRef(null);
  const routePolylineObj = useRef(null);

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(false);
  const [mapType, setMapType] = useState('roadmap');
  const [zoomLevel, setZoomLevel] = useState(14);
  const [clickDestination, setClickDestination] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Initialize Google Maps API
  useEffect(() => {
    if (!apiKey) {
      setMapsError(true);
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader
      .load()
      .then((google) => {
        if (!mapRef.current) return;
        const centerLat = currentLocation.lat || startLocation.lat;
        const centerLng = currentLocation.lng || startLocation.lng;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: zoomLevel,
          mapTypeId: mapType,
          styles: mapType === 'roadmap' ? darkMapStyle : [],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });

        googleMapObj.current = map;

        // Map Click Listener to select final destination
        map.addListener('click', (e) => {
          const clickedLat = e.latLng.lat();
          const clickedLng = e.latLng.lng();
          const destObj = {
            name: `Map Pin (${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`,
            lat: clickedLat,
            lng: clickedLng
          };
          setClickDestination(destObj);
          if (onSelectMapDestination) {
            onSelectMapDestination(destObj);
          }
        });

        // Start Marker
        new google.maps.Marker({
          position: { lat: startLocation.lat, lng: startLocation.lng },
          map,
          title: `Start: ${startLocation.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });

        // Destination Marker
        new google.maps.Marker({
          position: { lat: destination.lat, lng: destination.lng },
          map,
          title: `Destination: ${destination.name}`,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 8,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });

        // Live Location Marker
        userMarkerObj.current = new google.maps.Marker({
          position: { lat: currentLocation.lat, lng: currentLocation.lng },
          map,
          title: 'Live Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: isOffline ? '#6B7280' : riskLevel === 'RED' ? '#EF4444' : riskLevel === 'AMBER' ? '#F59E0B' : '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          }
        });

        // Shortest Route Polyline
        const pathCoords = [
          { lat: startLocation.lat, lng: startLocation.lng },
          { lat: currentLocation.lat, lng: currentLocation.lng },
          { lat: destination.lat, lng: destination.lng }
        ];

        routePolylineObj.current = new google.maps.Polyline({
          path: pathCoords,
          geodesic: true,
          strokeColor: isDeviated ? '#F59E0B' : '#06B6D4',
          strokeOpacity: 0.85,
          strokeWeight: 5,
        });
        routePolylineObj.current.setMap(map);

        setGoogleMapsLoaded(true);
      })
      .catch((err) => {
        console.warn('Google Maps loader failed or key invalid, switching to SVG Interactive Visual Map:', err);
        setMapsError(true);
      });
  }, [apiKey]);

  // Update position dynamically
  useEffect(() => {
    if (googleMapsLoaded && googleMapObj.current && userMarkerObj.current) {
      const latLng = { lat: currentLocation.lat, lng: currentLocation.lng };
      userMarkerObj.current.setPosition(latLng);
      googleMapObj.current.panTo(latLng);

      if (routePolylineObj.current) {
        const historyPath = locationHistory.map(l => ({ lat: l.latitude, lng: l.longitude }));
        const fullPath = [
          { lat: startLocation.lat, lng: startLocation.lng },
          ...(historyPath.length > 0 ? historyPath : [latLng]),
          { lat: destination.lat, lng: destination.lng }
        ];
        routePolylineObj.current.setPath(fullPath);
      }
    }
  }, [currentLocation, googleMapsLoaded, locationHistory]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 20));
    if (googleMapObj.current) {
      googleMapObj.current.setZoom(googleMapObj.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 1));
    if (googleMapObj.current) {
      googleMapObj.current.setZoom(googleMapObj.current.getZoom() - 1);
    }
  };

  const handleRecenter = () => {
    if (googleMapObj.current) {
      googleMapObj.current.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  };

  // SVG Canvas Map Click Handler
  const handleSvgMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert click coordinates to simulated lat/lng
    const lat = 12.9716 - (clickY - 250) * 0.0003;
    const lng = 77.5946 + (clickX - 400) * 0.0003;

    const destObj = {
      name: `Map Selected Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      lat,
      lng
    };
    setClickDestination(destObj);
    if (onSelectMapDestination) {
      onSelectMapDestination(destObj);
    }
  };

  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b687a' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2d4d' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] }
  ];

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col">
      
      {/* Top Map HUD overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Status Pills */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2 text-white shadow-lg">
            <Radio className={`w-3.5 h-3.5 ${isOffline ? 'text-gray-400' : 'text-emerald-400 animate-pulse'}`} />
            <span>{isOffline ? 'GPS DISCONNECTED' : 'LIVE GPS ACTIVE'}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-lg ${
            riskLevel === 'RED' ? 'bg-red-500/20 text-red-400 border-red-500/40 glow-red' :
            riskLevel === 'AMBER' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 glow-amber' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-green'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{riskLevel} RISK</span>
          </div>
        </div>

        {/* Travel Stats HUD */}
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium flex items-center gap-4 text-gray-200 pointer-events-auto shadow-lg">
          <div>ETA: <span className="font-bold text-cyan-400">{eta}</span></div>
          <div className="w-px h-3 bg-white/20"></div>
          <div>Shortest Dist: <span className="font-bold text-blue-400">{distance}</span></div>
          <div className="w-px h-3 bg-white/20"></div>
          <div>Speed: <span className="font-bold text-emerald-400">{speed}</span></div>
        </div>
      </div>

      {/* Floating Controls Overlay */}
      <div className="absolute top-16 right-3 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="glass-panel p-1 rounded-xl border border-white/10 flex flex-col gap-1 shadow-xl text-xs font-bold">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              mapType === 'roadmap' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              mapType === 'satellite' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
        </div>

        <div className="glass-panel p-1 rounded-xl border border-white/10 flex flex-col gap-1 shadow-xl text-gray-200">
          <button onClick={handleZoomIn} className="p-2 rounded-lg hover:bg-white/10 text-white">
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-white/10"></div>
          <button onClick={handleZoomOut} className="p-2 rounded-lg hover:bg-white/10 text-white">
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleRecenter}
          className="glass-panel p-2.5 rounded-xl border border-white/10 text-cyan-400 hover:bg-white/10 shadow-xl transition-all"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Main Map Canvas */}
      {!mapsError && apiKey ? (
        <div ref={mapRef} className="w-full h-full min-h-[420px] flex-1 cursor-crosshair"></div>
      ) : (
        /* Fallback Interactive Vector Visualizer with Click Selection */
        <div
          onClick={handleSvgMapClick}
          className={`relative w-full h-full min-h-[420px] flex-1 overflow-hidden flex items-center justify-center cursor-pointer transition-colors duration-500 ${
            mapType === 'satellite' ? 'bg-[#060e1a]' : 'bg-[#0c1322]'
          }`}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="none">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>

              <linearGradient id="devGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>

              <pattern id="roadGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width="800" height="500" fill="url(#roadGrid)" />

            <path d="M 0 180 L 800 180 M 0 320 L 800 320 M 240 0 L 240 500 M 560 0 L 560 500" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />

            {/* Shortest Route Scheduled Polyline */}
            <path
              d="M 120 380 Q 250 150 400 240 T 680 120"
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="7"
              strokeDasharray="8 6"
            />

            {/* Actual Client Travel Trail */}
            <path
              d="M 120 380 Q 250 150 400 240"
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {isDeviated && (
              <path
                d="M 400 240 Q 480 320 540 390"
                fill="none"
                stroke="url(#devGrad)"
                strokeWidth="5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            )}

            {/* Start Pin */}
            <g transform="translate(120, 380)">
              <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="3" />
              <text x="0" y="26" textAnchor="middle" fill="#10B981" fontSize="11" fontWeight="bold">START</text>
            </g>

            {/* Final Destination Pin */}
            <g transform="translate(680, 120)">
              <path d="M 0 0 L -8 -20 C -8 -26 8 -26 8 -20 Z" fill="#EF4444" />
              <circle cx="0" cy="-20" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
              <text x="0" y="-36" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="bold">DESTINATION</text>
            </g>

            {/* Live Client GPS Marker Circle */}
            <g transform={isDeviated ? "translate(540, 390)" : "translate(400, 240)"}>
              <circle cx="0" cy="0" r="26" fill="none" stroke={riskLevel === 'RED' ? '#EF4444' : riskLevel === 'AMBER' ? '#F59E0B' : '#06B6D4'} strokeWidth="1.5" className="animate-radar opacity-75" />
              <circle cx="0" cy="0" r="12" fill={isOffline ? '#6B7280' : riskLevel === 'RED' ? '#EF4444' : riskLevel === 'AMBER' ? '#F59E0B' : '#3B82F6'} stroke="#FFFFFF" strokeWidth="3" className="shadow-2xl" />
            </g>
          </svg>

          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-gray-300 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Click Anywhere on Map to Select Destination ({startLocation.name} → {destination.name})</span>
          </div>

          {isDeviated && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/50 backdrop-blur-md px-4 py-2 rounded-xl text-amber-300 font-semibold text-xs flex items-center gap-2 shadow-xl animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Route Deviation Detected: Off Planned Corridor</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Coordinates & Location Details */}
      <div className="bg-[#0B0F19]/90 border-t border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-white">{currentLocation.name || 'Current GPS Telemetry Point'}</span>
          <span className="text-gray-500">
            ({currentLocation.lat ? currentLocation.lat.toFixed(4) : '12.9716'}, {currentLocation.lng ? currentLocation.lng.toFixed(4) : '77.5946'})
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <span>Start: <strong className="text-gray-200">{startLocation.name}</strong></span>
          <span>→</span>
          <span>Dest: <strong className="text-gray-200">{destination.name}</strong></span>
        </div>
      </div>

    </div>
  );
}
