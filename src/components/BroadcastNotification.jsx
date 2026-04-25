import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Radio, X, Bell, ShieldAlert } from 'lucide-react';

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const BroadcastNotification = () => {
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);

  useEffect(() => {
    socket.on('broadcastAlert', (broadcast) => {
      setActiveBroadcasts(prev => [...prev, { ...broadcast, id: Date.now() }]);
      
      // Auto-remove after 30 seconds if it's not a critical type (if we had types)
      // For now keep them until dismissed or for 1 min
      setTimeout(() => {
        dismissBroadcast(broadcast._id);
      }, 60000);
    });

    return () => {
      socket.off('broadcastAlert');
    };
  }, []);

  const dismissBroadcast = (id) => {
    setActiveBroadcasts(prev => prev.filter(b => b._id !== id && b.id !== id));
  };

  if (activeBroadcasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[3000] space-y-4">
      {activeBroadcasts.map((b) => (
        <div 
          key={b._id || b.id} 
          className="bg-gray-900 text-white p-6 rounded-[2.5rem] shadow-2xl border-2 border-red-600/30 animate-in slide-in-from-bottom-10 duration-500 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600">
            <div className="h-full bg-white/20 animate-broadcast-progress"></div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
               <Radio size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                  <ShieldAlert size={12} /> Emergency Broadcast
                </span>
                <button 
                  onClick={() => dismissBroadcast(b._id || b.id)}
                  className="p-1 hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm font-bold leading-relaxed">{b.message}</p>
              <p className="text-[10px] text-gray-500 mt-3 font-medium">
                Sent at {new Date(b.sentAt || b.id).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BroadcastNotification;
