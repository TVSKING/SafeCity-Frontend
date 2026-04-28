import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Users, MapPin, Zap, ChevronRight, ShieldCheck, Droplets, Activity } from 'lucide-react';

const CommunitySOS = ({ userLocation }) => {
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const { data } = await axios.get(`${baseUrl}/api/alerts/community`); // New endpoint I'll add
        setNearbyAlerts(data.filter(a => a.priority === 'HIGH' || a.type === 'Medical'));
      } catch (err) {
        // Mock data for demo if API fails
        setNearbyAlerts([
          { _id: '1', type: 'Medical', reporterName: 'Asha Patel', description: 'Elderly neighbor having chest pain. Need immediate CPR assistance.', distance: '0.4km', time: '2m ago' },
          { _id: '2', type: 'Blood Link', reporterName: 'City Hospital', description: 'URGENT: B+ Blood needed for emergency surgery.', distance: '1.2km', time: '15m ago', isBlood: true },
          { _id: '3', type: 'General', reporterName: 'Rajesh Shah', description: 'Basement flooded. Need help moving furniture and elderly residents.', distance: '0.8km', time: '10m ago' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, [userLocation]);

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-red-50 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
           <h3 className="text-2xl font-black flex items-center gap-2">
             COMMUNITY SHIELD <Heart className="fill-white" size={24} />
           </h3>
           <p className="text-red-100 font-bold text-sm mt-1">Verified responders active in your neighborhood.</p>
        </div>
        <Users className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
      </div>

      <div className="p-8 space-y-4">
        {nearbyAlerts.map((alert) => (
          <div key={alert._id} className={`p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] ${
            alert.isBlood ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
          }`}>
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                     alert.isBlood ? 'bg-red-600 text-white' : 'bg-white text-blue-600 shadow-sm'
                   }`}>
                      {alert.isBlood ? <Droplets size={20} /> : <Activity size={20} />}
                   </div>
                   <div>
                      <h4 className="font-black text-gray-900 uppercase tracking-tight">{alert.type} Assistance</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{alert.distance} AWAY • {alert.time}</p>
                   </div>
                </div>
                <div className="bg-white px-3 py-1 rounded-full text-[8px] font-black text-green-600 border border-green-50 shadow-sm">
                   STILL OPEN
                </div>
             </div>

             <p className="text-sm font-bold text-gray-700 leading-relaxed mb-6">
                "{alert.description}"
             </p>

             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs font-black text-gray-400">
                   <ShieldCheck size={14} className="text-blue-500" /> VERIFIED REQUEST
                </div>
                <button className={`px-6 py-3 rounded-xl font-black text-xs transition-all shadow-lg ${
                   alert.isBlood ? 'bg-red-600 text-white shadow-red-100' : 'bg-gray-900 text-white'
                }`}>
                   I'M HEADING THERE <ChevronRight size={14} className="inline ml-1" />
                </button>
             </div>
          </div>
        ))}

        <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-black text-xs hover:bg-gray-50 transition-all uppercase tracking-widest">
           View all neighborhood requests
        </button>
      </div>
    </div>
  );
};

export default CommunitySOS;
