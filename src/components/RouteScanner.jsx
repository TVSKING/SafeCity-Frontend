import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Search, ShieldCheck, AlertTriangle, ChevronRight, X, Loader2, Zap } from 'lucide-react';

const RouteScanner = ({ isOpen, onClose }) => {
  const [destination, setDestination] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const checkRoute = async (e) => {
    e.preventDefault();
    if (!destination) return;
    setScanning(true);
    setResult(null);

    try {
      // 1. Geocode the destination
      const { data: geoData } = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1&countrycodes=in`);
      
      if (geoData.length === 0) {
        setResult({ status: 'error', message: 'Location not found. Please try a different address.' });
        setScanning(false);
        return;
      }

      const destLat = parseFloat(geoData[0].lat);
      const destLng = parseFloat(geoData[0].lon);

      // 2. Fetch active hazards
      const { data: hazards } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/hazards`);

      // 3. Check for proximity to hazards (within 2km of destination or 500m of the zone radius)
      const dangerZone = hazards.find(h => {
        const R = 6371; // Earth radius in km
        const dLat = (h.location.lat - destLat) * Math.PI / 180;
        const dLng = (h.location.lng - destLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(destLat * Math.PI / 180) * Math.cos(h.location.lat * Math.PI / 180) * 
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c * 1000; // Distance in meters

        return distance <= (h.radius + 500); // Check if within zone radius + 500m buffer
      });

      if (dangerZone) {
        setResult({
          status: 'danger',
          zone: dangerZone,
          locationName: geoData[0].display_name.split(',')[0],
          message: `DANGER: Your destination is within the ${dangerZone.title} hazard perimeter.`
        });
      } else {
        setResult({
          status: 'safe',
          locationName: geoData[0].display_name.split(',')[0],
          message: 'ROUTE VALIDATED: No active hazard zones detected at your destination.'
        });
      }

    } catch (err) {
      console.error(err);
      setResult({ status: 'error', message: 'System error during validation. Please try again later.' });
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col border-4 border-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 p-8 text-white relative">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} />
           </div>
           <div className="flex justify-between items-start">
             <div>
               <h2 className="text-3xl font-black flex items-center gap-3">
                  ROUTE SCANNER <Zap className="text-blue-400 fill-blue-400" size={24} />
               </h2>
               <p className="text-gray-400 font-bold mt-1">Cross-reference your path with live hazard zones.</p>
             </div>
             <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
               <X size={24} />
             </button>
           </div>
        </div>

        <div className="p-8">
           <form onSubmit={checkRoute} className="relative mb-8">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Enter your destination..."
                className="w-full pl-12 pr-20 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold transition-all"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <button 
                type="submit"
                disabled={scanning}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all flex items-center gap-2"
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : 'SCAN'}
              </button>
           </form>

           {result && (
              <div className={`p-8 rounded-[2.5rem] border-4 animate-in slide-in-from-bottom-4 duration-300 ${
                result.status === 'danger' ? 'bg-red-50 border-red-100 text-red-600' : 
                result.status === 'safe' ? 'bg-green-50 border-green-100 text-green-600' :
                'bg-gray-50 border-gray-100 text-gray-600'
              }`}>
                 <div className="flex items-center gap-4 mb-4">
                    {result.status === 'danger' ? <AlertTriangle size={40} className="animate-bounce" /> : <ShieldCheck size={40} />}
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tight">{result.status === 'danger' ? 'THREAT DETECTED' : 'CLEAR PATH'}</h3>
                       <p className="font-bold opacity-80 text-sm">Target: {result.locationName}</p>
                    </div>
                 </div>
                 
                 <p className="font-bold text-sm leading-relaxed mb-6">{result.message}</p>

                 {result.status === 'danger' && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Hazard Intel</p>
                       <p className="text-sm font-black text-gray-900">{result.zone.title}</p>
                       <p className="text-xs text-gray-500 font-bold mt-1">Severity: {result.zone.severity} | Avoid all travel.</p>
                    </div>
                 )}

                 <button 
                  onClick={() => { setDestination(''); setResult(null); }}
                  className={`mt-8 w-full py-4 rounded-2xl font-black text-xs transition-all ${
                    result.status === 'danger' ? 'bg-red-600 text-white shadow-xl shadow-red-200' :
                    result.status === 'safe' ? 'bg-green-600 text-white shadow-xl shadow-green-200' :
                    'bg-gray-900 text-white'
                  }`}
                 >
                    NEW SCAN <ChevronRight size={14} className="inline ml-1" />
                 </button>
              </div>
           )}

           {!result && !scanning && (
              <div className="text-center py-10 opacity-30">
                 <Search size={48} className="mx-auto mb-4" />
                 <p className="font-bold text-sm">Ready to validate your route safety status.</p>
              </div>
           )}
        </div>

        <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
           <Zap size={12} className="fill-gray-400" /> Validation based on latest city command data
        </div>
      </div>
    </div>
  );
};

export default RouteScanner;
