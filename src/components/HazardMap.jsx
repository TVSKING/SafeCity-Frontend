import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Plus, X } from 'lucide-react';

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

const HazardMap = () => {
  const [hazards, setHazards] = useState([]);
  const [newHazard, setNewHazard] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Gas Leak',
    severity: 'High',
    radius: 500
  });

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/hazards`);
        setHazards(data);
      } catch (err) { console.error(err); }
    };
    fetchHazards();

    // Fix for Leaflet maps getting "stuck" or grayed out on tab switch
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }, []);


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
        location: { lat: newHazard.lat, lng: newHazard.lng }
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
    <div className="h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-white">
      <MapContainer center={[22.3039, 70.8022]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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

        {newHazard && (
          <Marker position={[newHazard.lat, newHazard.lng]} />
        )}
      </MapContainer>

      {showForm && (
        <div className="absolute top-4 right-4 z-[1000] bg-white p-6 rounded-3xl shadow-2xl w-80 border border-gray-100 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> Mark Hazard
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
              <input required type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Chemical Spill" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
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

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/80 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-gray-600 shadow-sm border border-white">
        Click anywhere on map to mark a "No-Go" zone
      </div>
    </div>
  );
};

export default HazardMap;
