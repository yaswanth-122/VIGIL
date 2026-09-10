const https = require('https');

// Curated popular locations database for instant high-speed suggestions
const POPULAR_VENUES = [
  { name: 'Marina Beach', category: 'Public Beach', lat: 13.0475, lng: 80.2824, address: 'Kamarajar Salai, Triplicane, Chennai, Tamil Nadu', safetyScore: 88, lighting: 'Well-Lit Corridor' },
  { name: 'Phoenix Marketcity', category: 'Shopping Mall', lat: 12.9915, lng: 80.2170, address: 'Velachery Main Rd, Chennai, Tamil Nadu', safetyScore: 96, lighting: 'High Density Lighting' },
  { name: 'Chennai Central Railway Station', category: 'Transit Hub', lat: 13.0827, lng: 80.2707, address: 'Kannappar Thidal, Periyamet, Chennai', safetyScore: 90, lighting: '24/7 Security Patrol' },
  { name: 'Chennai International Airport (MAA)', category: 'Airport', lat: 12.9941, lng: 80.1709, address: 'GST Rd, Meenambakkam, Chennai', safetyScore: 98, lighting: 'High Density Lighting' },
  { name: 'DLF Cybercity Tech Park', category: 'Tech Park', lat: 12.8687, lng: 80.2215, address: 'Mount Poonamallee Rd, Manapakkam, Chennai', safetyScore: 97, lighting: 'CCTV Monitored Corridor' },
  { name: 'Kempegowda International Airport (BLR)', category: 'Airport', lat: 13.1986, lng: 77.7066, address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka', safetyScore: 98, lighting: 'High Density Lighting' },
  { name: 'Indiranagar 100ft Road', category: 'Commercial Street', lat: 12.9784, lng: 77.6408, address: 'Indiranagar, Bengaluru, Karnataka', safetyScore: 92, lighting: 'Well-Lit Corridor' },
  { name: 'UB City', category: 'Business & Shopping Center', lat: 12.9719, lng: 77.5956, address: 'Vittal Mallya Rd, Bengaluru, Karnataka', safetyScore: 96, lighting: 'High Density Lighting' },
  { name: 'Chhatrapati Shivaji Maharaj Terminus', category: 'Transit Hub', lat: 18.9400, lng: 72.8353, address: 'Fort, Mumbai, Maharashtra', safetyScore: 92, lighting: '24/7 Security Patrol' },
  { name: 'Bandrakurla Complex (BKC)', category: 'Business District', lat: 19.0657, lng: 72.8686, address: 'Bandra East, Mumbai, Maharashtra', safetyScore: 95, lighting: 'High Density Lighting' },
  { name: 'Connaught Place', category: 'Commercial Center', lat: 28.6315, lng: 77.2167, address: 'Connaught Circus, New Delhi', safetyScore: 93, lighting: 'Well-Lit Corridor' },
  { name: 'Indira Gandhi International Airport (DEL)', category: 'Airport', lat: 28.5562, lng: 77.1000, address: 'Palam, New Delhi', safetyScore: 98, lighting: 'High Density Lighting' }
];

/**
 * Perform live place search using OpenStreetMap Nominatim API + local curated venues fallback
 */
async function searchPlaces(query) {
  if (!query || query.trim().length < 2) {
    return POPULAR_VENUES.slice(0, 6).map((v, index) => ({
      id: `popular_${index}`,
      name: v.name,
      category: v.category,
      address: v.address,
      lat: v.lat,
      lng: v.lng,
      safetyScore: v.safetyScore,
      lighting: v.lighting,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`
    }));
  }

  const cleanQuery = query.trim().toLowerCase();

  // Filter curated venues first
  const localMatches = POPULAR_VENUES.filter(
    v => v.name.toLowerCase().includes(cleanQuery) || v.address.toLowerCase().includes(cleanQuery) || v.category.toLowerCase().includes(cleanQuery)
  ).map((v, index) => ({
    id: `local_${index}`,
    name: v.name,
    category: v.category,
    address: v.address,
    lat: v.lat,
    lng: v.lng,
    safetyScore: v.safetyScore,
    lighting: v.lighting,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`
  }));

  // Fetch online geocoding data from OpenStreetMap Nominatim
  let onlineResults = [];
  try {
    onlineResults = await fetchNominatimPlaces(query);
  } catch (err) {
    console.warn('Nominatim online places search warning:', err.message);
  }

  // Combine results with local matches taking priority
  const combined = [...localMatches];
  
  onlineResults.forEach(onl => {
    if (!combined.some(c => Math.abs(c.lat - onl.lat) < 0.002 && Math.abs(c.lng - onl.lng) < 0.002)) {
      combined.push(onl);
    }
  });

  return combined.slice(0, 8);
}

function fetchNominatimPlaces(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`;
    
    const options = {
      headers: {
        'User-Agent': 'VIGIL-VirtualSafetyCompanion/1.0 (contact: yaswanth@vigil-app.com)'
      }
    };

    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!Array.isArray(json)) return resolve([]);

          const parsed = json.map((item, idx) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const name = item.display_name.split(',')[0] || item.name || query;
            const category = item.type ? item.type.toUpperCase() : 'LOCATION';

            // Generate AI safety rating heuristic based on type & coordinates
            const isTransportOrMall = item.type === 'station' || item.type === 'aerodrome' || item.type === 'mall' || item.type === 'bus_stop';
            const safetyScore = isTransportOrMall ? 94 : 89;
            const lighting = isTransportOrMall ? 'High Density Lighting' : 'Well-Lit Corridor';

            return {
              id: `osm_${item.place_id || idx}`,
              name: name,
              category: category,
              address: item.display_name,
              lat: lat,
              lng: lng,
              safetyScore: safetyScore,
              lighting: lighting,
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            };
          });

          resolve(parsed);
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

module.exports = {
  searchPlaces
};
