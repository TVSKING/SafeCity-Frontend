import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, MapPin, Zap } from 'lucide-react';

const OneTapSOS = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSOS = async () => {
    setLoading(true);
    setStatus('requesting_location');

    if (!navigator.geolocation) {
      setStatus('geo_not_supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setStatus('sending_alert');
          await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/create`, {
            reporterName: 'SOS User',
            reporterPhone: 'Unknown',
            type: 'SOS',
            description: 'ONE-TAP SOS TRIGGERED',
            location: { lat: latitude, lng: longitude },
            triageLevel: 5
          });
          setStatus('success');
          setTimeout(() => setStatus(null), 5000);
        } catch (error) {
          setStatus('error');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setStatus('geo_error');
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleSOS}
        disabled={loading}
        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all active:scale-90 shadow-2xl ${
          status === 'success' 
            ? 'bg-green-600 shadow-green-200' 
            : 'bg-red-600 hover:bg-red-700 shadow-red-200'
        } ${loading ? 'animate-pulse' : ''}`}
      >
        <Zap size={48} className="text-white mb-1" />
        <span className="text-white font-black text-xl tracking-tighter">SOS</span>
      </button>
      
      <div className="h-6">
        {status === 'requesting_location' && (
          <p className="text-blue-600 text-sm font-semibold flex items-center gap-1 animate-pulse">
            <MapPin size={14} /> Getting Location...
          </p>
        )}
        {status === 'sending_alert' && (
          <p className="text-orange-600 text-sm font-semibold animate-pulse">
            Broadcasting to Departments...
          </p>
        )}
        {status === 'success' && (
          <p className="text-green-600 text-sm font-bold flex items-center gap-1">
            <AlertCircle size={14} /> SOS SENT SUCCESSFULLY
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-sm font-bold">Failed to send SOS. Try again.</p>
        )}
        {status === 'geo_error' && (
          <p className="text-red-600 text-sm font-bold">Location access denied.</p>
        )}
      </div>
    </div>
  );
};

export default OneTapSOS;
