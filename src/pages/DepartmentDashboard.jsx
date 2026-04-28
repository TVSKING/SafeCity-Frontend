import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ResourceInventory from '../components/ResourceInventory';
import HazardMap from '../components/HazardMap';
import { ShieldCheck, Activity, MapPin, CheckCircle, Clock, AlertCircle, PlayCircle, Phone, LayoutDashboard, Map as MapIcon, Zap, Send, Archive, ShieldAlert } from 'lucide-react';


const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;
      try { 
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${baseUrl}/api/alerts/department?deptType=${user.departmentType}`, {
          headers: { Authorization: `Bearer ${token}` }
        }); 
        
        const rawAlerts = data.alerts || (Array.isArray(data) ? data : []);
        // Apply local filtering to ensure absolute relevance
        const filtered = rawAlerts.filter(a => checkRelevance(a));
        setAlerts(filtered); 
      }
      catch (err) { 
        setAlerts([]); 
      }
    };
    fetchAlerts();
    socket.on('newAlert', (newAlert) => {
      if (checkRelevance(newAlert)) {
        setAlerts(prev => [newAlert, ...prev.filter(a => a._id !== newAlert._id)]);
        setNotifications(prev => [...prev, `NEW: ${newAlert.type} report!`]);
        setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
      }
    });
    socket.on('alertUpdated', (updatedAlert) => setAlerts(prev => prev.map(a => a._id === updatedAlert._id ? updatedAlert : a)));
    return () => { socket.off('newAlert'); socket.off('alertUpdated'); };
  }, [user]);

  const checkRelevance = (alert) => {
    if (!user || !alert) return false;
    
    const alertState = (alert.state || '').trim().toLowerCase();
    const userState = (user.state || '').trim().toLowerCase();
    
    // If state is missing, assume it's a global/critical SOS that needs attention
    if (alertState && userState && alertState !== userState) {
      return false;
    }

    const dept = (user.departmentType || '').toLowerCase();
    const aDept = (alert.assignedDepartment || '').toLowerCase();
    const aType = (alert.type || '').toLowerCase();

    if (dept === 'police') return aDept === 'police' || aType === 'crime' || aType === 'accident' || aType === 'sos';
    if (dept === 'fire') return aDept === 'fire' || aType === 'fire' || aType === 'sos';
    if (dept === 'ambulance' || dept === 'medical') return aDept === 'ambulance' || aDept === 'medical' || aType === 'medical' || aType === 'accident' || aType === 'sos';
    return aDept === dept || aDept === 'none' || aType === 'sos';
  };

  const updateStatus = async (id, status) => {
    // Optimistic UI update
    const previousAlerts = [...alerts];
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    
    try { 
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem('token');
      await axios.put(`${baseUrl}/api/alerts/update/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
    }
    catch (err) { 
      console.error(err);
      setAlerts(previousAlerts); // Rollback on failure
      alert('Network Error: Failed to update incident status. Please check your connection.'); 
    }
  };

  const stats = {
    pending: alerts.filter(a => a.status === 'Pending').length,
    active: alerts.filter(a => a.status === 'Accepted' || a.status === 'In Progress').length,
    resolved: alerts.filter(a => a.status === 'Resolved').length
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <div className="fixed top-20 right-4 z-[1000] space-y-2">
        {notifications.map((n, i) => <div key={i} className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-in font-bold flex items-center gap-2"><AlertCircle />{n}</div>)}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Activity className="text-red-600" /> {user.name}
          </h1>
          <p className="text-gray-500 font-medium">Regional Response Command Center</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} /> Alerts
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'map' ? 'bg-orange-600 text-white shadow-md shadow-orange-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <MapIcon size={18} /> Live Map
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Archive size={18} /> Inventory
          </button>
        </div>
        
        <Link 
          to="/dispatch"
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-900/30 flex items-center gap-2 hover:bg-black transition-all hover:-translate-y-1"
        >
          <Send size={18} /> OPEN LIVE DISPATCH MAP
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 rounded-3xl bg-red-50 border border-red-100 shadow-sm relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10"><AlertCircle size={100} /></div>
               <p className="text-xs font-black uppercase text-red-400 mb-1">Unchecked</p>
               <span className="text-4xl font-black text-red-600">{stats.pending}</span>
            </div>
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 shadow-sm relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10"><Clock size={100} /></div>
               <p className="text-xs font-black uppercase text-blue-400 mb-1">Active</p>
               <span className="text-4xl font-black text-blue-600">{stats.active}</span>
            </div>
            <div className="p-6 rounded-3xl bg-green-50 border border-green-100 shadow-sm relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10"><CheckCircle size={100} /></div>
               <p className="text-xs font-black uppercase text-green-400 mb-1">Resolved</p>
               <span className="text-4xl font-black text-green-600">{stats.resolved}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts List or Full Inventory */}
        <div className="lg:col-span-3">
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {alerts.filter(a => a.status !== 'Resolved').length === 0 && (
                <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <ShieldCheck size={80} className="mb-4 opacity-20" />
                  <p className="text-xl font-bold">No active alerts in your sector</p>
                </div>
              )}
              {alerts.filter(a => a.status !== 'Resolved').map((alert) => (
                <div key={alert._id} className={`bg-white p-8 rounded-[2.5rem] shadow-xl border-l-8 transition-all ${alert.type === 'SOS' ? 'border-l-red-600 animate-pulse-subtle' : 'border-l-blue-500'} flex flex-col md:flex-row gap-8`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                        alert.status === 'Pending' ? 'bg-red-100 text-red-600' :
                        alert.status === 'Accepted' ? 'bg-blue-100 text-blue-600' :
                        alert.status === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {alert.status}
                      </span>
                      <span className="text-gray-300 font-bold text-xs">ID: {alert._id.slice(-6).toUpperCase()}</span>
                      {alert.triageLevel >= 4 && (
                        <span className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">
                          <AlertCircle size={12} /> CRITICAL
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        {alert.type === 'SOS' && <Zap className="text-red-600" />}
                        {alert.type} Incident
                      </h2>
                      <p className="text-gray-600 mt-2 font-medium leading-relaxed">{alert.description || 'No description provided.'}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Reporter</span>
                        <span className="text-sm font-bold text-gray-700">{alert.reporterName}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Contact</span>
                        <span className="text-sm font-bold text-gray-700">{alert.reporterPhone}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Time</span>
                        <span className="text-sm font-bold text-gray-700">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[220px]">
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`)} 
                      className="py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
                    >
                      <MapPin size={18} /> GPS NAVIGATION
                    </button>
                    {alert.status === 'Pending' && <button onClick={() => updateStatus(alert._id, 'Accepted')} className="py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700">ACCEPT MISSION</button>}
                    {alert.status === 'Accepted' && <button onClick={() => updateStatus(alert._id, 'In Progress')} className="py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100">START RESPONSE</button>}
                    {alert.status === 'In Progress' && <button onClick={() => updateStatus(alert._id, 'Resolved')} className="py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100">MARK RESOLVED</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="animate-in fade-in zoom-in h-[700px]">
               <HazardMap stateFilter={user.state} showIncidents={true} onUpdateStatus={updateStatus} />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="animate-in fade-in zoom-in">
               <ResourceInventory departmentType={user.departmentType} isFull={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;

