import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import EmergencyForm from '../components/EmergencyForm';
import OneTapSOS from '../components/OneTapSOS';
import PublicHazardMap from '../components/PublicHazardMap';
import { ShieldCheck, MapPin, Zap, HeartPulse, Flame, Siren, AlertTriangle, Radio, BookOpen, ShieldAlert } from 'lucide-react';




const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const Home = () => {
  const [activePulse, setActivePulse] = useState(null);
  const [pulseName, setPulseName] = useState('');
  const [pulseAge, setPulseAge] = useState('');
  const [pulseStatus, setPulseStatus] = useState('Safe');
  const [liveMessages, setLiveMessages] = useState([]);
  const [activeProtocols, setActiveProtocols] = useState([]);
  const prevResponsesRef = useRef(0);

  useEffect(() => {
    const fetchPulses = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/safety-checks`);
        const active = data.find(p => p.isActive);
        if (active) setActivePulse(active);
      } catch (err) { console.error(err); }
    };

    const fetchProtocols = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/broadcasts`);
        setActiveProtocols(data);
      } catch (err) { console.error(err); }
    };

    fetchPulses();
    fetchProtocols();

    socket.on('newSafetyCheck', (newCheck) => {
      setActivePulse(newCheck);
    });

    socket.on('safetyCheckUpdated', (updatedCheck) => {
      setActivePulse(prev => (prev && prev._id === updatedCheck._id) ? updatedCheck : prev);
    });

    socket.on('broadcastAlert', (newAlert) => {
      setActiveProtocols(prev => [newAlert, ...prev].slice(0, 5));
    });

    socket.on('broadcastClosed', (id) => {
      setActiveProtocols(prev => prev.filter(p => p._id !== id));
    });
    
    return () => {
      socket.off('newSafetyCheck');
      socket.off('safetyCheckUpdated');
      socket.off('broadcastAlert');
      socket.off('broadcastClosed');
    };
  }, []);

  useEffect(() => {
    if (activePulse && activePulse.responses) {
      const currentLen = activePulse.responses.length;
      if (prevResponsesRef.current !== 0 && currentLen > prevResponsesRef.current) {
        const newResponses = activePulse.responses.slice(prevResponsesRef.current);
        newResponses.forEach(res => {
          const msgId = Date.now() + Math.random();
          setLiveMessages(m => [...m, { id: msgId, name: res.name, status: res.status }]);
          setTimeout(() => {
            setLiveMessages(m => m.filter(msg => msg.id !== msgId));
          }, 1500);
        });
      }
      prevResponsesRef.current = currentLen;
    }
  }, [activePulse]);

  const handlePulseSubmit = async (e) => {
    e.preventDefault();
    if (!pulseName || !pulseAge || !activePulse) return;
    try {
      await axios.post(`$(import.meta.env.VITE_API_URL || "http://localhost:5000")/api/admin-tools/safety-checks/${activePulse._id}/respond`, {
        name: pulseName, age: pulseAge, status: pulseStatus
      });
      setPulseName('');
      setPulseAge('');
      setPulseStatus('Safe');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="relative pt-10 pb-20 px-4 sm:px-6 lg:pt-16 lg:pb-28 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold mb-6 animate-pulse border border-red-100">
              <Siren size={16} />
              RAPID CRISIS RESPONSE ENGINE ACTIVE
            </div>
            <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
              <span className="block">Safety is just one</span>
              <span className="block text-red-600">tap away.</span>
            </h1>
            <p className="mt-4 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-6 md:text-xl md:max-w-3xl">
              SafeCity connects you directly to emergency departments in real-time. Fast, reliable, and active 24/7.
            </p>
          </div>

          {/* Active Protocols / Directives */}
          {activeProtocols.length > 0 && (
            <div className="mb-12 max-w-4xl mx-auto space-y-4">
               {activeProtocols.map((protocol, i) => (
                 <div key={i} className="bg-red-50 border-l-8 border-red-600 p-6 rounded-r-2xl shadow-lg flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                    <ShieldAlert className="text-red-600 shrink-0 mt-1" size={32} />
                    <div>
                       <h3 className="font-black text-red-900 text-lg uppercase tracking-wider mb-1">System Directive</h3>
                       <p className="font-bold text-red-700">{protocol.message}</p>
                       <p className="text-xs text-red-400 mt-2 font-medium">{new Date(protocol.sentAt || Date.now()).toLocaleString()}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activePulse && (
             <div className="mb-12 max-w-4xl mx-auto relative">
                {/* Live Messages appearing above the banner */}
                <div className="absolute bottom-full left-0 right-0 mb-4 flex flex-col items-center gap-1 pointer-events-none z-20">
                   {liveMessages.map((msg) => (
                     <div key={msg.id} className="text-gray-600 text-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
                       <span className="font-black text-gray-900">{msg.name}</span> has just submitted a response <span className={`font-black ml-1 ${msg.status === 'Safe' ? 'text-green-600' : 'text-orange-600'}`}>[{msg.status.toUpperCase()}]</span>
                     </div>
                   ))}
                </div>

                <div className="bg-red-600 text-white rounded-[2rem] p-8 shadow-2xl shadow-red-500/30 border-4 border-red-400/30 relative overflow-hidden z-10">
                   <div className="absolute -top-10 -right-10 p-4 opacity-20"><Radio size={200} /></div>
                   <div className="relative z-10">
                      <h2 className="text-3xl font-black mb-2 flex items-center gap-3"><Zap className="text-yellow-300" /> SAFETY PULSE: {activePulse.title}</h2>
                      <p className="font-bold text-red-100 mb-6 text-lg">Area: {activePulse.area}. Please respond immediately so rescue teams can track casualties.</p>
                      
                      <form onSubmit={handlePulseSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                         <div className="flex-1 w-full">
                            <label className="text-[10px] font-black text-red-200 uppercase tracking-widest block mb-1">Your Name</label>
                            <input type="text" required value={pulseName} onChange={e => setPulseName(e.target.value)} className="w-full px-4 py-3 bg-red-700/50 border border-red-500 rounded-xl focus:ring-2 focus:ring-white outline-none font-bold text-white placeholder-red-300" placeholder="John Doe" />
                         </div>
                         <div className="w-24 shrink-0">
                            <label className="text-[10px] font-black text-red-200 uppercase tracking-widest block mb-1">Age</label>
                            <input type="number" required value={pulseAge} onChange={e => setPulseAge(e.target.value)} className="w-full px-4 py-3 bg-red-700/50 border border-red-500 rounded-xl focus:ring-2 focus:ring-white outline-none font-bold text-white placeholder-red-300" placeholder="25" />
                         </div>
                         <div className="flex-1 w-full">
                            <label className="text-[10px] font-black text-red-200 uppercase tracking-widest block mb-1">Status</label>
                            <select value={pulseStatus} onChange={e => setPulseStatus(e.target.value)} className="w-full px-4 py-3 bg-red-700/50 border border-red-500 rounded-xl focus:ring-2 focus:ring-white outline-none font-bold text-white">
                               <option value="Safe">I am Safe</option>
                               <option value="Need Help">I Need Help</option>
                            </select>
                         </div>
                         <button type="submit" className="px-8 py-3 h-[50px] bg-white text-red-600 rounded-xl font-black shadow-lg hover:bg-red-50 transition-all flex items-center gap-2">
                            SUBMIT <HeartPulse size={18} />
                         </button>
                      </form>
                   </div>
                </div>
             </div>
          )}

          {/* SOS & Audio-Beacon Section */}
          <div className="mb-20 flex flex-col md:flex-row items-center justify-center gap-8">
             <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col items-center max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/5 rounded-bl-[4rem]"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Immediate Danger?</h3>
                <p className="text-gray-500 text-sm text-center mb-8">Tap for 1-second emergency broadcast with your GPS location.</p>
                <OneTapSOS />
             </div>

             <div className="bg-orange-50 p-10 rounded-[3rem] border border-orange-100 shadow-xl flex flex-col items-center max-w-md w-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-600/5 rounded-bl-[4rem]"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Trapped / Under Rubble?</h3>
                <p className="text-gray-500 text-sm text-center mb-8">Trigger a high-frequency beacon to help rescue teams locate you.</p>
                <button 
                  onClick={() => {
                    const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3'); // Mock beacon sound
                    audio.loop = true;
                    audio.play();
                    alert('Audio Beacon Active! Keep your phone in a safe place.');
                  }}
                  className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-orange-200 hover:scale-110 transition-all animate-pulse"
                >
                  <Radio size={40} />
                </button>
                <span className="mt-4 text-[10px] font-black text-orange-600 uppercase tracking-widest">Activate Audio Beacon</span>
             </div>
          </div>


          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <div className="flex flex-col items-center p-8 bg-red-50 rounded-[2.5rem] border border-red-100 transition-all hover:shadow-lg hover:scale-105">
              <Zap className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="font-bold text-xl">Real-time Response</h3>
              <p className="text-sm text-gray-600 text-center mt-2">Immediate alert broadcast via Socket.io to all departments.</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 transition-all hover:shadow-lg hover:scale-105">
              <MapPin className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="font-bold text-xl">AI Triage</h3>
              <p className="text-sm text-gray-600 text-center mt-2">Automated severity assessment for faster deployment.</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-green-50 rounded-[2.5rem] border border-green-100 transition-all hover:shadow-lg hover:scale-105">
              <ShieldCheck className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="font-bold text-xl">No Registration</h3>
              <p className="text-sm text-gray-600 text-center mt-2">Zero friction. Public reporting doesn't require an account.</p>
            </div>
          </div>

          {/* Live Hazard Map Section */}
          <div className="max-w-6xl mx-auto mb-20">
             <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center justify-center gap-3">
                   <AlertTriangle className="text-red-600" /> Dynamic Hazard Map
                </h2>
                <p className="text-gray-500 font-medium">Real-time "No-Go" zones identified by city command. Avoid these areas.</p>
             </div>
             <PublicHazardMap />
          </div>

          <div id="report-section" className="relative z-10 mb-20">
            <EmergencyForm />
          </div>

          {/* Safe-Zone Navigator */}
          <div className="max-w-5xl mx-auto mb-20">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-3xl font-black text-gray-900">Safe-Zone Navigator</h2>
                   <p className="text-gray-500 font-medium">Real-time status of nearest emergency hubs</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full text-xs">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                   LIVE STATUS
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Civil Shelter A', type: 'SHELTER', dist: '0.8km', occupancy: '45%', status: 'Available', icon: MapPin, color: 'blue' },
                  { name: 'Sterling Medical', type: 'HOSPITAL', dist: '1.2km', occupancy: '98%', status: 'Full', icon: HeartPulse, color: 'red' },
                  { name: 'Mochi Fire Hub', type: 'RESCUE', dist: '2.5km', occupancy: '12%', status: 'Active', icon: Flame, color: 'orange' },
                  { name: 'Community Hall 4', type: 'SHELTER', dist: '3.1km', occupancy: '60%', status: 'Available', icon: MapPin, color: 'green' }
                ].map((hub, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:border-red-100 transition-all group">
                     <div className={`w-12 h-12 rounded-2xl bg-${hub.color}-50 flex items-center justify-center text-${hub.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                        <hub.icon size={24} />
                     </div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{hub.type}</p>
                     <h4 className="font-bold text-gray-900 mb-1">{hub.name}</h4>
                     
                     <div className="mt-4 mb-2">
                        <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                           <span className="text-gray-400">Occupancy</span>
                           <span className={parseInt(hub.occupancy) > 80 ? 'text-red-500' : 'text-green-500'}>{hub.occupancy}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${parseInt(hub.occupancy) > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: hub.occupancy }}></div>
                        </div>
                     </div>

                     <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                        <span className="text-xs font-bold text-gray-400">{hub.dist}</span>
                        <span className={`text-[10px] font-black uppercase ${hub.status === 'Full' ? 'text-red-500' : 'text-green-500'}`}>{hub.status}</span>
                     </div>
                  </div>
                ))}

             </div>
          </div>
          {/* Resilience Layer Section */}
          <div className="max-w-5xl mx-auto mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex items-center gap-6 group hover:border-red-100 transition-all">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-600 group-hover:rotate-12 transition-transform shrink-0">
                   <BookOpen size={40} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-900">Offline First-Aid</h3>
                   <p className="text-sm text-gray-500 font-medium">Critical CPR and wound care guides stored locally. No internet needed.</p>
                   <button className="mt-4 text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                      Open Manuals <Zap size={12} className="fill-red-600" />
                   </button>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex items-center gap-6 group hover:border-blue-100 transition-all">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 group-hover:rotate-12 transition-transform shrink-0">
                   <MapPin size={40} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-900">Route Validation</h3>
                   <p className="text-sm text-gray-500 font-medium">Crowdsourced road status. Mark blocked or flooded paths for others.</p>
                   <button className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      Report Blockage <Zap size={12} className="fill-blue-600" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="fixed top-0 right-0 -z-10 opacity-10 animate-pulse">
        <ShieldCheck size={600} className="text-red-200" />
      </div>
    </div>
  );
};

export default Home;

