import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Search, ShieldCheck, AlertTriangle, ChevronRight, X, Loader2, Zap, Building2 } from 'lucide-react';

const AddressScanner = ({ isOpen, onClose }) => {
  const [address, setAddress] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const scanAddress = async (e) => {
    e.preventDefault();
    if (!address) return;
    setScanning(true);
    setResult(null);

    try {
      // 1. Geocode the address globally (landmark, building, pincode, etc.)
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data: geoData } = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
      
      if (geoData.length === 0) {
        setResult({ status: 'error', message: 'Address not recognized. Please provide a landmark, building name, or pincode.' });
        setScanning(false);
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lng = parseFloat(geoData[0].lon);

      // 2. Fetch active hazards
      const { data: hazards } = await axios.get(`${baseUrl}/api/admin-tools/hazards`);

      // 3. Check for proximity to hazards
      let nearestDist = Infinity;
      const dangerZone = hazards.find(h => {
        if (!h.location || typeof h.location.lat !== 'number') return false;

        const R = 6371; // km
        const dLat = (h.location.lat - lat) * Math.PI / 180;
        const dLng = (h.location.lng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(h.location.lat * Math.PI / 180) * 
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c * 1000; // meters
        
        if (distance < nearestDist) nearestDist = distance;
        return distance <= ((h.radius || 500) + 3000);
      });

      if (dangerZone) {
        setResult({
          status: 'danger',
          zone: dangerZone,
          distance: Math.round(nearestDist),
          locationName: geoData[0].display_name,
          message: `THREAT DETECTED: This area is currently inside a ${dangerZone.type} hazard zone.`
        });
      } else {
        setResult({
          status: 'safe',
          locationName: geoData[0].display_name,
          message: `AREA SECURE: No active hazard zones detected within 3km of this location.`
        });
      }

    } catch (err) {
      setResult({ status: 'error', message: 'Validation engine error. Please check your connection.' });
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col border-4 border-white animate-in zoom-in-95 duration-200">
        
        <div className="bg-gray-900 p-8 text-white relative">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Building2 size={120} />
           </div>
           <div className="flex justify-between items-start">
             <div>
               <h2 className="text-3xl font-black flex items-center gap-3">
                  ADDRESS GUARD <ShieldCheck className="text-blue-400" size={24} />
               </h2>
               <p className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">Universal Security Scanner</p>
             </div>
             <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
               <X size={24} />
             </button>
           </div>
        </div>

        <div className="p-8">
           <form onSubmit={scanAddress} className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Building, Road, Pincode, or Full Address..."
                className="w-full pl-12 pr-24 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold transition-all text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button 
                type="submit"
                disabled={scanning}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all flex items-center gap-2"
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : 'SCAN AREA'}
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
                       <h3 className="text-2xl font-black uppercase tracking-tight">{result.status === 'danger' ? 'HAZARD DETECTED' : 'SECURE ZONE'}</h3>
                       <p className="font-bold opacity-60 text-[10px] uppercase tracking-widest mt-1">Verified Location</p>
                    </div>
                 </div>
                 
                 <div className="bg-white/50 backdrop-blur p-4 rounded-2xl mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Identified As</p>
                    <p className="text-xs font-bold text-gray-900 line-clamp-2">{result.locationName}</p>
                 </div>

                 <p className="font-bold text-sm leading-relaxed mb-6">{result.message}</p>

                 <button 
                  onClick={() => { setAddress(''); setResult(null); }}
                  className={`w-full py-4 rounded-2xl font-black text-xs transition-all ${
                    result.status === 'danger' ? 'bg-red-600 text-white shadow-xl shadow-red-200' :
                    result.status === 'safe' ? 'bg-green-600 text-white shadow-xl shadow-green-200' :
                    'bg-gray-900 text-white'
                  }`}
                 >
                    SCAN ANOTHER AREA <ChevronRight size={14} className="inline ml-1" />
                 </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AddressScanner;
