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

    socket.on('newAlert', () => fetchHazards()); // Refresh hazards on new alerts

    socket.on('newDeployment', (dep) => {
       dep.startTime = Date.now();
       setDeployments(prev => [...prev, dep]);
    });

    return () => {
      socket.off('newAlert');
      socket.off('newDeployment');
    };
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

      // --- ABSOLUTE STATION OVERRIDE ---
      let startLat = 23.0225; // Default: Ahmedabad
      let startLng = 72.5714; // Default: Ahmedabad

      const uRef = (user.name || user.address || user.email || '').toLowerCase();
      if (uRef.includes('jala')) {
         startLat = 20.9467;
         startLng = 72.9520;
         console.log("📍 Station Match: Jala Station");
      } else if (uRef.includes('ahme') || uRef.includes('ahm')) {
         startLat = 23.0225;
         startLng = 72.5714;
         console.log("📍 Station Match: Ahmedabad Station");
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
        duration: 30000, // Faster ETA for testing (30s)
        progress: 0
      };

      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/resources/deploy`, newDeployment);
      alert(`Dispatching ${deployQty}x ${resource.name}. ETA: 30 Seconds.`);
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
               <p className="text-gray-500 font-bold text-sm">Select a hazard zone on the map to deploy units. ETA: 30 seconds.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-2xl text-center">
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
            />

            {hazards.map((hazard) => (
               <Circle
                  key={hazard._id}
                  center={[hazard.location.lat, hazard.location.lng]}
                  radius={hazard.radius || 1000}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3 }}
               >
                  <Popup>
                     <div className="p-2 min-w-[200px]">
                        <h3 className="text-lg font-black text-red-600 mb-2">{hazard.type.toUpperCase()}</h3>
                        <p className="text-xs font-bold text-gray-500 mb-4">{hazard.title}</p>
                        
                        <div className="space-y-3">
                           <select 
                              className="w-full bg-gray-100 p-2 rounded-lg font-bold text-sm outline-none border-2 border-gray-200 focus:border-red-500 transition-all"
                              value={selectedResource}
                              onChange={e => setSelectedResource(e.target.value)}
                           >
                              {resources.length > 0 ? resources.map(r => (
                                 <option key={r._id} value={r._id}>
                                    {r.name} ({r.quantity} available)
                                 </option>
                              )) : (
                                 <option disabled>No resources in database</option>
                              )}
                           </select>
                           <input 
                              type="number" 
                              value={deployQty}
                              onChange={e => setDeployQty(parseInt(e.target.value))}
                              className="w-full bg-gray-100 p-2 rounded-lg font-bold text-sm"
                           />
                           <button 
                              onClick={() => triggerDeploy(hazard)}
                              className="w-full py-3 bg-red-600 text-white font-black rounded-xl"
                           >
                              DISPATCH NOW
                           </button>
                        </div>
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
                  />
               );
            })}
         </MapContainer>
      </div>
    </div>
  );
};

export default LiveDispatchMap;
