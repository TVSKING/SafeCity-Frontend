import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Heart, MapPin, X, ChevronRight, Activity, Droplets } from 'lucide-react';

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const CommunityAlertToast = () => {
  const [nearbyAlert, setNearbyAlert] = useState(null);
  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    // Get user location for proximity checking
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLoc({ lat: 22.3039, lng: 70.8022 }) // Default Rajkot coords for demo
    );

    socket.on('newAlert', (alert) => {
      if (!userLoc || alert.isSpam) return;

      const dist = calculateDistance(userLoc.lat, userLoc.lng, alert.location.lat, alert.location.lng);
      
      // Notify if within 2km for community help
      if (dist <= 2) {
        setNearbyAlert({ ...alert, distance: dist.toFixed(1) });
        
        // Auto-hide after 15 seconds
        setTimeout(() => setNearbyAlert(null), 15000);
      }
    });

    return () => socket.off('newAlert');
  }, [userLoc]);

  if (!nearbyAlert) return null;

  return (
    <div className="fixed top-24 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[4000] animate-in slide-in-from-right-10 duration-500">
      <div className={`p-6 rounded-[2.5rem] shadow-2xl border-2 overflow-hidden relative group ${
        nearbyAlert.type === 'Medical' || nearbyAlert.type === 'SOS' 
        ? 'bg-red-600 text-white border-red-500' 
        : 'bg-white text-gray-900 border-gray-100'
      }`}>
         {/* Progress Bar */}
         <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
            <div className="h-full bg-white/60 animate-toast-progress"></div>
         </div>

         <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              nearbyAlert.type === 'Medical' || nearbyAlert.type === 'SOS'
              ? 'bg-white text-red-600'
              : 'bg-red-600 text-white'
            }`}>
               {nearbyAlert.type === 'Medical' ? <Activity size={28} /> : <Heart size={28} />}
            </div>

            <div className="flex-1">
               <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    nearbyAlert.type === 'Medical' || nearbyAlert.type === 'SOS' ? 'text-red-100' : 'text-red-600'
                  }`}>
                    🤝 Nearby Help Required
                  </span>
                  <button onClick={() => setNearbyAlert(null)} className="opacity-50 hover:opacity-100 transition-opacity">
                     <X size={16} />
                  </button>
               </div>
               
               <h4 className="text-lg font-black leading-tight">
                  {nearbyAlert.type} assistance needed {nearbyAlert.distance}km away
               </h4>
               <p className={`text-xs font-bold mt-2 leading-relaxed line-clamp-2 ${
                 nearbyAlert.type === 'Medical' || nearbyAlert.type === 'SOS' ? 'text-red-50' : 'text-gray-500'
               }`}>
                  "{nearbyAlert.description || 'No description provided.'}"
               </p>

               <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-80">
                     <MapPin size={12} /> Verified Location
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1 ${
                    nearbyAlert.type === 'Medical' || nearbyAlert.type === 'SOS'
                    ? 'bg-white text-red-600 hover:bg-red-50'
                    : 'bg-gray-900 text-white hover:bg-black'
                  }`}>
                     I'm heading there <ChevronRight size={12} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CommunityAlertToast;
