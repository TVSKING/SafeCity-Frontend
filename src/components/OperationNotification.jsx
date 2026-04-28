import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Bell, Zap, CheckCircle2, ShieldAlert, Siren, Info, X } from 'lucide-react';

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const OperationNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notif) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notif, id }]);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);

    // Play subtle sound if available
    try {
      const audio = new Audio(notif.type === 'SOS' ? '/sos_alert.mp3' : '/notif_ping.mp3');
      // audio.play().catch(() => {}); // Browser may block auto-play
    } catch (e) {}
  };

  useEffect(() => {
    socket.on('newAlert', (alert) => {
      if (alert.type === 'SOS' || alert.priority === 'HIGH') {
        addNotification({
          type: 'SOS',
          title: '🚨 CRITICAL SOS RECEIVED',
          message: `High-priority ${alert.type} reported by ${alert.reporterName}.`,
          color: 'bg-red-600'
        });
      }
    });

    socket.on('alertUpdated', (alert) => {
      if (alert.status === 'Accepted') {
        addNotification({
          type: 'ASSIGN',
          title: '✅ MISSION ASSIGNED',
          message: `${alert.type} incident is now being handled by ${alert.assignedDepartment.toUpperCase()} DEPT.`,
          color: 'bg-blue-600'
        });
      } else if (alert.status === 'Resolved') {
        addNotification({
          type: 'RESOLVE',
          title: '🏁 MISSION COMPLETED',
          message: `${alert.type} incident at ${alert.location.lat.toFixed(2)}, ${alert.location.lng.toFixed(2)} has been resolved.`,
          color: 'bg-green-600'
        });
      }
    });

    return () => {
      socket.off('newAlert');
      socket.off('alertUpdated');
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[5000] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className={`p-5 rounded-3xl shadow-2xl text-white flex items-start gap-4 animate-in slide-in-from-top-10 duration-500 pointer-events-auto border-2 border-white/20 backdrop-blur-md ${n.color}`}
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
             {n.type === 'SOS' ? <Siren size={24} /> : n.type === 'ASSIGN' ? <ShieldAlert size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-start">
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{n.title}</h4>
                <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="opacity-50 hover:opacity-100"><X size={14} /></button>
             </div>
             <p className="text-xs font-bold leading-tight">{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OperationNotification;
