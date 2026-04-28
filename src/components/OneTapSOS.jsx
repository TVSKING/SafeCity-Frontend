import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, MapPin, Zap } from 'lucide-react';

const OneTapSOS = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSOS = async () => {
    setLoading(true);
    setStatus('requesting_location');

    const sendSOS = async (lat = 20.5937, lng = 78.9629, state = 'Gujarat') => {
      try {
        setStatus('sending_alert');
        const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/create`, {
          reporterName: 'SOS User',
          reporterPhone: 'Unknown',
          type: 'SOS',
          description: 'ONE-TAP SOS TRIGGERED (URGENT RESPONSE)',
          location: { lat, lng },
          state: state,
          triageLevel: 5
        });
        console.log('✅ SOS Response:', response.data);
        setStatus('success');
        setTimeout(() => setStatus(null), 5000);
      } catch (error) {
        console.error('❌ SOS Error:', error);
        setStatus(`error_${error.response?.status || 'network'}`);
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      await sendSOS();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedState = 'Gujarat';
        try {
          const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          detectedState = data.address.state || 'Gujarat';
        } catch (e) {}
        await sendSOS(latitude, longitude, detectedState);
      },
      async (error) => {
        // Fallback to Gujarat if location fails
        await sendSOS();
      },
      { timeout: 5000 }
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
        {status?.startsWith('error') && (
          <p className="text-red-600 text-sm font-bold">
            {status === 'error_404' ? 'API Endpoint not found.' :
             status === 'error_500' ? 'Server Error. Please contact admin.' :
             status === 'error_403' ? 'Access Denied.' :
             'Network failure. Check internet.'}
          </p>
        )}
        {status === 'geo_error' && (
          <p className="text-red-600 text-sm font-bold">Location access denied / timeout.</p>
        )}
      </div>
    </div>
  );
};

export default OneTapSOS;
