import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle } from 'lucide-react';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PublicHazardMap = () => {
  const [hazards, setHazards] = useState([]);

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/hazards`);
        setHazards(data);
      } catch (err) { console.error(err); }
    };
    fetchHazards();
    
    // Ensure map renders correctly
    setTimeout(() => {
       window.dispatchEvent(new Event('resize'));
    }, 300);

    // Refresh hazards every 30 seconds
    const interval = setInterval(fetchHazards, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-white">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {hazards.map((h, i) => (
          <React.Fragment key={i}>
            <Marker position={[h.location.lat, h.location.lng]}>
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="text-red-600" size={16} />
                    <span className="font-bold text-gray-900">{h.title}</span>
                  </div>
                  <div className="text-xs font-bold text-red-600 mb-1">{h.type.toUpperCase()}</div>
                  <div className="text-[10px] text-gray-500">Stay away from this zone. Radius: {h.radius}m</div>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[h.location.lat, h.location.lng]} 
              radius={h.radius} 
              pathOptions={{ 
                color: h.severity === 'Critical' ? '#ef4444' : '#f97316', 
                fillColor: h.severity === 'Critical' ? '#ef4444' : '#f97316',
                fillOpacity: 0.3,
                weight: 2,
                dashArray: '5, 10'
              }} 
            />
          </React.Fragment>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-white flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Live Hazard Tracking</span>
      </div>

    </div>
  );
};

export default PublicHazardMap;
