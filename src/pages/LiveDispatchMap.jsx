import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Zap } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const createVehicleIcon = (type) => {
  let emoji = '🚚';
  if (type === 'ambulance') emoji = '🚑';
  if (type === 'fire') emoji = '🚒';
  if (type === 'police') emoji = '🚓';
  
  return L.divIcon({
    html: `<div style="font-size: 36px; line-height: 1; transform: translate(-50%, -50%); text-shadow: 0px 10px 20px rgba(0,0,0,0.5);">${emoji}</div>`,
    className: 'custom-vehicle-icon',
    iconSize: [40, 40],
  });
};

// Fix default marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const LiveDispatchMap = () => {
  const { user } = useAuth();
  const [hazards, setHazards] = useState([]);
  const [resources, setResources] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [deployQty, setDeployQty] = useState(1);

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/hazards`);
        // FUZZY STATE FILTER: Ignore casing, but show if state is missing
        if (user && user.state) {
          const uState = user.state.trim().toLowerCase();
          setHazards(data.filter(h => {
             const hState = (h.state || '').trim().toLowerCase();
             return !hState || hState === uState;
          }));
        } else {
          setHazards(data);
        }
      } catch (err) {}
    };
    
    const fetchResources = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = localStorage.getItem('token');
        const fetchType = user.role === 'admin' ? 'all' : user.departmentType;
        const { data } = await axios.get(`${baseUrl}/api/resources/${fetchType}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResources(data);
        if (data.length > 0) setSelectedResource(data[0]._id);
      } catch (err) {}
    };

    fetchHazards();
    fetchResources();

    socket.on('newDeployment', (dep) => {
       // FUZZY STATE FILTER: Ignore casing
       if (user && user.state && dep.state) {
          if (dep.state.trim().toLowerCase() === user.state.trim().toLowerCase()) {
             dep.startTime = Date.now();
             setDeployments(prev => [...prev, dep]);
          }
       } else {
          dep.startTime = Date.now();
          setDeployments(prev => [...prev, dep]);
       }
    });

    return () => socket.off('newDeployment');
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeployments(prev => prev.map(d => {
        const elapsed = Date.now() - d.startTime;
        const progress = Math.min(elapsed / d.duration, 1);
        return { ...d, progress };
      }).filter(d => {
        if (d.progress >= 1) {
          if (!d.reachedTime) d.reachedTime = Date.now();
          if (Date.now() - d.reachedTime > 5000) return false;
        }
        return true;
      }));
    }, 50); 
    return () => clearInterval(interval);
  }, []);

  const knownLocations = {
    'Kuvadava Road, Rajkot': { lat: 22.3175, lng: 70.8250 },
    'Bhaktinagar Station Plot, Rajkot': { lat: 22.2886, lng: 70.8033 },
    'Gandhigram Main Road, Rajkot': { lat: 22.3082, lng: 70.7816 },
    'Malaviya Nagar, Rajkot': { lat: 22.2798, lng: 70.7963 },
    'Pradyuman Nagar, Rajkot': { lat: 22.2964, lng: 70.7936 },
    'Mochi Bazar, Rajkot': { lat: 22.3031, lng: 70.8021 },
    'Nirmala Convent Road, Rajkot': { lat: 22.2961, lng: 70.7766 },
    'Raiya Road, Rajkot': { lat: 22.3035, lng: 70.7712 },
    'Civil Hospital Chowk, Jamnagar Road, Rajkot': { lat: 22.3060, lng: 70.8010 },
    'Malaviya Nagar Main Road, Rajkot': { lat: 22.2800, lng: 70.7960 },
    '150 Ring Road, Rajkot': { lat: 22.2825, lng: 70.7681 },
    'Kalawad Road, Rajkot': { lat: 22.2855, lng: 70.7715 },
    'Ahmedabad Station': { lat: 23.0225, lng: 72.5714 },
    'Jala Station': { lat: 20.9467, lng: 72.9520 },
    'SafeCity HQ': { lat: 20.5937, lng: 78.9629 }
  };

  const triggerDeploy = async (hazard) => {
    const resource = resources.find(r => r._id === selectedResource);
    if (!resource) return alert('Please select a resource');
    if (deployQty > resource.quantity) return alert('Not enough units available');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem('token');
      await axios.put(`${baseUrl}/api/resources/update/${resource._id}`, { quantity: resource.quantity - deployQty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(resources.map(r => r._id === resource._id ? { ...r, quantity: r.quantity - deployQty } : r));

      let startLat = 23.0225; // Default Base: Ahmedabad
      let startLng = 72.5714; // Default Base: Ahmedabad

      // AGGRESSIVE STATION DETECTION
      const userRef = (user.address || user.name || user.email || '').toLowerCase();
      if (userRef.includes('ahmedabad') || userRef.includes('ahme') || userRef.includes('ahm')) {
         startLat = knownLocations['Ahmedabad Station'].lat;
         startLng = knownLocations['Ahmedabad Station'].lng;
         console.log('📍 Station Match: Ahmedabad');
      } else if (userRef.includes('jala')) {
         startLat = knownLocations['Jala Station'].lat;
         startLng = knownLocations['Jala Station'].lng;
         console.log('📍 Station Match: Jala');
      } else if (user && user.address && knownLocations[user.address]) {
         startLat = knownLocations[user.address].lat;
         startLng = knownLocations[user.address].lng;
      } else if (user && user.address) {
         try {
            const { data: geoData } = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(user.address)}&format=json&limit=1`, {
              headers: { 'Accept-Language': 'en-US,en;q=0.9' }
            });
            if (geoData && geoData.length > 0) {
               startLat = parseFloat(geoData[0].lat);
               startLng = parseFloat(geoData[0].lon);
            }
         } catch (geoErr) {
            console.warn('Geocoding failed, falling back to HQ', geoErr);
         }
      }

      const newDeployment = {
        id: Date.now() + Math.random(),
        vehicleType: resource.departmentType, 
        resourceName: resource.name,
        resourceId: resource._id,
        hazardId: hazard._id,
        qty: deployQty,
        startLat,
        startLng,
        endLat: hazard.location.lat,
        endLng: hazard.location.lng,
        startTime: Date.now(),
        duration: 60000, 
        progress: 0
      };

      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/resources/deploy`, newDeployment);
      alert(`Dispatching ${deployQty}x ${resource.name}. ETA: 1 Minute.`);
    } catch (err) {
      alert('Deployment failed');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      <div className="bg-white text-gray-900 p-6 shadow-md flex items-center justify-between z-10 border-b border-gray-200">
         <div className="flex items-center gap-6">
            <Link to="/dashboard" className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
               <ArrowLeft />
            </Link>
            <div>
               <h1 className="text-3xl font-black flex items-center gap-3">
                  <Zap className="text-red-500 animate-pulse" /> LIVE DISPATCH COMMAND
               </h1>
               <p className="text-gray-500 font-bold text-sm">Select a hazard zone on the map to deploy units. ETA: 60 seconds.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-2xl">
               <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Active Units</p>
               <p className="text-2xl font-black text-green-600">{deployments.length}</p>
            </div>
         </div>
      </div>

      <div className="flex-1 relative">
         <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }} 
            className="z-0"
         >
            <TileLayer
               url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            />

            {hazards.map((hazard) => (
               <Circle
                  key={hazard._id}
                  center={[hazard.location.lat, hazard.location.lng]}
                  radius={hazard.radius || 1000}
                  pathOptions={{ 
                     color: '#ef4444', 
                     fillColor: '#ef4444', 
                     fillOpacity: 0.3,
                     weight: 2
                  }}
               >
                  <Popup className="custom-popup">
                     <div className="p-2 min-w-[250px]">
                        <h3 className="text-lg font-black text-red-600 uppercase mb-1">{hazard.type} ZONE</h3>
                        <p className="text-xs text-gray-500 font-bold mb-4">{hazard.description || 'High-risk area. Deployment requested.'}</p>
                        
                        {user.role === 'admin' ? (
                           <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                              <p className="text-sm font-bold text-red-600 uppercase">Observer Mode</p>
                              <p className="text-xs text-gray-600 font-medium mt-1">Waiting for departments to dispatch resources to this zone...</p>
                           </div>
                        ) : (
                           <div className="space-y-3">
                              <div>
                                 <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Resource</label>
                              <select 
                                 className="w-full bg-gray-100 border-none p-2 rounded-lg font-bold text-sm outline-none"
                                 value={selectedResource}
                                 onChange={e => setSelectedResource(e.target.value)}
                              >
                                 {resources.map(r => (
                                    <option key={r._id} value={r._id}>[{r.departmentType.toUpperCase()}] {r.name} ({r.quantity} left)</option>
                                 ))}
                              </select>
                           </div>
                           <div>
                              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Quantity</label>
                              <input 
                                 type="number" 
                                 min="1"
                                 value={deployQty}
                                 onChange={e => setDeployQty(parseInt(e.target.value))}
                                 className="w-full bg-gray-100 border-none p-2 rounded-lg font-bold text-sm outline-none"
                              />
                           </div>
                           <button 
                              onClick={() => triggerDeploy(hazard)}
                              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                           >
                              <Send size={16} /> DISPATCH UNITS
                           </button>
                        </div>
                        )}
                     </div>
                  </Popup>
               </Circle>
            ))}

            {deployments.map(d => {
               const currentLat = d.startLat + (d.endLat - d.startLat) * d.progress;
               const currentLng = d.startLng + (d.endLng - d.startLng) * d.progress;
               
               return (
                  <Marker 
                     key={d.id} 
                     position={[currentLat, currentLng]} 
                     icon={createVehicleIcon(d.vehicleType)}
                     zIndexOffset={1000}
                  >
                     <Popup>
                        <div className="font-bold text-center">
                           <p className="text-sm uppercase text-blue-600 mb-1">{d.vehicleType} UNIT</p>
                           <p className="text-xs text-gray-600">Carrying: {d.qty}x {d.resourceName}</p>
                           {d.progress < 1 ? (
                              <p className="text-[10px] text-orange-500 mt-2">En Route... {Math.round(d.progress * 100)}%</p>
                           ) : (
                              <p className="text-[10px] text-green-500 mt-2 font-black">ARRIVED</p>
                           )}
                        </div>
                     </Popup>
                  </Marker>
               );
            })}
         </MapContainer>
      </div>

      <style>{`
         .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 1.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
         }
         .custom-popup .leaflet-popup-tip {
            display: none;
         }
      `}</style>
    </div>
  );
};

export default LiveDispatchMap;
