import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { AlertTriangle, Plus, X, MapPin, Search, Navigation } from 'lucide-react';

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
import { sanitizeInput } from '../utils/validation';

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

const HazardMap = ({ stateFilter = null, showIncidents = false, onUpdateStatus = null }) => {
  const [hazards, setHazards] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newHazard, setNewHazard] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India Center
  const [zoom, setZoom] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const getEmoji = (type) => {
    const t = type.toLowerCase();
    if (t.includes('fire')) return '🔥';
    if (t.includes('medical') || t.includes('ambulance')) return '🚑';
    if (t.includes('police') || t.includes('crime')) return '🚓';
    if (t.includes('accident')) return '💥';
    if (t.includes('sos')) return '🚨';
    return '⚠️';
  };
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Gas Leak',
    severity: 'High',
    radius: 500
  });

  const fetchHazards = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/hazards`);
      setHazards(data);
    } catch (err) { console.error(err); }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      // If we are in a department view, we use the department endpoint, otherwise admin/public
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/admin`;
        
      const { data } = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const received = data.alerts || (Array.isArray(data) ? data : []);
      
      // Filter by state if requested
      let filtered = received;
      if (stateFilter) {
        const targetState = stateFilter.trim().toLowerCase();
        filtered = received.filter(a => {
          const aState = (a.state || '').trim().toLowerCase();
          return !aState || aState === targetState; // Show if missing state OR matching state
        });
      }

      setAlerts(filtered.filter(a => a.status !== 'Resolved'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHazards();
    if (showIncidents) fetchAlerts();

    // Socket.io Real-time Updates
    if (showIncidents) {
      socket.on('newAlert', (newAlert) => {
        if (stateFilter) {
          const alertState = (newAlert.state || '').trim().toLowerCase();
          const targetState = (stateFilter || '').trim().toLowerCase();
          if (alertState && alertState !== targetState) return;
        }
        setAlerts(prev => [newAlert, ...prev.filter(a => a._id !== newAlert._id)]);
      });

      socket.on('alertUpdated', (updatedAlert) => {
        if (updatedAlert.status === 'Resolved') {
          setAlerts(prev => prev.filter(a => a._id !== updatedAlert._id));
        } else {
          setAlerts(prev => prev.map(a => a._id === updatedAlert._id ? updatedAlert : a));
        }
      });
    }

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);

    return () => {
      socket.off('newAlert');
      socket.off('alertUpdated');
      clearTimeout(timer);
    };
  }, [stateFilter, showIncidents]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=in`);
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setZoom(14);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const RecenterMap = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom]);
    return null;
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setNewHazard(e.latlng);
        setShowForm(true);
      },
    });
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/hazards/create`, {
        ...formData,
        location: { lat: newHazard.lat, lng: newHazard.lng },
        state: stateFilter || 'Gujarat' // Pass the current state context
      });
      setHazards([...hazards, data]);
      setShowForm(false);
      setNewHazard(null);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/api/admin-tools/hazards/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHazards(hazards.filter(h => h._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="h-[700px] w-full rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-white group">
      {/* India-Wide Search Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white flex items-center gap-2">
          <div className="bg-red-50 p-2 rounded-xl text-red-600">
            <MapPin size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search city, area or pincode in India..." 
            className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-gray-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl font-black text-[10px] hover:bg-black transition-all flex items-center gap-2"
          >
            {isSearching ? '...' : <><Search size={14} /> FIND</>}
          </button>
          <button 
            type="button"
            onClick={() => { fetchAlerts(); fetchHazards(); }}
            className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all border border-red-100"
            title="Force Sync Map"
          >
            <Navigation size={20} className="rotate-45" />
          </button>
        </form>
      </div>

      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <RecenterMap center={mapCenter} zoom={zoom} />
        <MapEvents />
        
        {hazards.map((h, i) => (
          <React.Fragment key={i}>
            <Marker position={[h.location.lat, h.location.lng]}>
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="font-black text-gray-900 text-sm mb-1">{h.title}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{h.type} • {h.severity}</div>
                  <button 
                    onClick={() => handleDelete(h._id)}
                    className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} /> REMOVE HAZARD
                  </button>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[h.location.lat, h.location.lng]} 
              radius={h.radius} 
              pathOptions={{ 
                color: h.severity === 'Critical' ? 'red' : 'orange', 
                fillColor: h.severity === 'Critical' ? 'red' : 'orange',
                fillOpacity: 0.3 
              }} 
            />
          </React.Fragment>
        ))}

        {showIncidents && alerts.map((alert) => (
          <Marker 
            key={alert._id} 
            position={[alert.location.lat, alert.location.lng]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="font-size: 24px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 2px solid white; cursor: pointer;">${getEmoji(alert.type)}</div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-gray-900 text-lg">{alert.type.toUpperCase()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                    alert.status === 'Pending' ? 'bg-red-100 text-red-600' :
                    alert.status === 'Accepted' ? 'bg-blue-100 text-blue-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>{alert.status}</span>
                </div>
                <div className="text-xs text-gray-600 mb-4 line-clamp-2">{alert.description || 'No description provided.'}</div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`)} 
                    className="w-full py-2 bg-gray-900 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-2"
                  >
                    <Navigation size={12} /> NAVIGATE
                  </button>
                  
                  {onUpdateStatus && alert.status === 'Pending' && (
                    <button onClick={() => onUpdateStatus(alert._id, 'Accepted')} className="w-full py-2 bg-red-600 text-white rounded-lg text-[10px] font-black">ACCEPT MISSION</button>
                  )}
                  {onUpdateStatus && alert.status === 'Accepted' && (
                    <button onClick={() => onUpdateStatus(alert._id, 'In Progress')} className="w-full py-2 bg-orange-500 text-white rounded-lg text-[10px] font-black">START RESPONSE</button>
                  )}
                  {onUpdateStatus && alert.status === 'In Progress' && (
                    <button onClick={() => onUpdateStatus(alert._id, 'Resolved')} className="w-full py-2 bg-green-600 text-white rounded-lg text-[10px] font-black">MARK RESOLVED</button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {newHazard && (
          <Marker position={[newHazard.lat, newHazard.lng]} />
        )}
      </MapContainer>

      {showForm && (
        <div className="absolute top-24 right-4 z-[1000] bg-white p-6 rounded-3xl shadow-2xl w-80 border border-gray-100 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> Mark Hazard
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
              <input required type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Chemical Spill" value={formData.title} onChange={(e) => setFormData({ ...formData, title: sanitizeInput(e.target.value, 'text') })} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
              <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option>Gas Leak</option>
                <option>Structural Collapse</option>
                <option>Fire Outbreak</option>
                <option>Flooding</option>
                <option>Chemical Spill</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Severity</label>
              <div className="flex gap-2 mt-1">
                {['Moderate', 'High', 'Critical'].map(s => (
                  <button key={s} type="button" onClick={() => setFormData({ ...formData, severity: s })} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${formData.severity === s ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Impact Radius (m)</label>
              <input type="range" min="100" max="2000" step="100" className="w-full" value={formData.radius} onChange={(e) => setFormData({ ...formData, radius: e.target.value })} />
              <div className="text-right text-xs font-bold text-gray-900">{formData.radius}m</div>
            </div>
            <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">PUBLISH HAZARD</button>
          </form>
        </div>
      )}

      <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
        <button 
           onClick={() => {
             if ("geolocation" in navigator) {
               navigator.geolocation.getCurrentPosition((pos) => {
                 setMapCenter([pos.coords.latitude, pos.coords.longitude]);
                 setZoom(15);
               });
             }
           }}
           className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-900 hover:bg-red-600 hover:text-white transition-all active:scale-90 border border-gray-100"
        >
          <Navigation size={20} />
        </button>
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-gray-600 shadow-sm border border-white">
          Click map to mark "No-Go" zone
        </div>
      </div>
    </div>
  );
};

export default HazardMap;
