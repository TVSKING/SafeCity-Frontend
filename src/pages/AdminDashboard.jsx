import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import HazardMap from '../components/HazardMap';
import {
  BarChart3, AlertCircle, CheckCircle, Clock, MapPin,
  ExternalLink, ArrowRightLeft, Search, Filter, ShieldAlert, Radio, Activity, LayoutDashboard, Map as MapIcon, Users, Zap, Package, Check, X, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { sanitizeInput } from '../utils/validation';




const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const AdminDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const [volunteers, setVolunteers] = useState([]);
  const [safetyChecks, setSafetyChecks] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);
  const [pulseTitle, setPulseTitle] = useState('');
  const [pulseArea, setPulseArea] = useState('');

  useEffect(() => {
    fetchAlerts();
    fetchVolunteers();
    fetchSafetyChecks();
    fetchPendingItems();
    fetchActiveBroadcasts();
    socket.on('newAlert', (newAlert) => setAlerts(prev => [newAlert, ...prev]));
    socket.on('alertUpdated', (updatedAlert) => setAlerts(prev => prev.map(a => a._id === updatedAlert._id ? updatedAlert : a)));
    socket.on('newSafetyCheck', (newCheck) => setSafetyChecks(prev => [newCheck, ...prev]));
    socket.on('safetyCheckUpdated', (updatedCheck) => setSafetyChecks(prev => prev.map(c => c._id === updatedCheck._id ? updatedCheck : c)));
    socket.on('broadcastAlert', (newAlert) => setActiveBroadcasts(prev => [newAlert, ...prev]));
    socket.on('broadcastClosed', (id) => setActiveBroadcasts(prev => prev.filter(b => b._id !== id)));
    return () => {
      socket.off('newAlert');
      socket.off('alertUpdated');
      socket.off('newSafetyCheck');
      socket.off('safetyCheckUpdated');
      socket.off('broadcastAlert');
      socket.off('broadcastClosed');
    };
  }, []);

  const fetchSafetyChecks = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/safety-checks`);
      setSafetyChecks(data);
    } catch (err) { console.error(err); }
  };

  const fetchPendingItems = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/marketplace/pending`);
      setPendingItems(data);
    } catch (err) { console.error(err); }
  };

  const fetchActiveBroadcasts = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/broadcasts`);
      setActiveBroadcasts(data);
    } catch (err) { console.error(err); }
  };

  const handleApproveItem = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${baseUrl}/api/admin-tools/marketplace/${id}/approve`);
      setPendingItems(prev => prev.filter(i => i._id !== id));
    } catch (err) { alert('Failed to approve'); }
  };

  const handleRejectItem = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${baseUrl}/api/admin-tools/marketplace/${id}/reject`);
      setPendingItems(prev => prev.filter(i => i._id !== id));
    } catch (err) { alert('Failed to reject'); }
  };

  const handleInitiatePulse = async () => {
    if (!pulseTitle || !pulseArea) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/safety-checks/create`, {
        title: pulseTitle, area: pulseArea, isActive: true
      });
      setPulseTitle('');
      setPulseArea('');
      alert('Safety Pulse Initiated!');
    } catch (err) { console.error(err); }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/admin`);
      setAlerts(data);
    } catch (err) { console.error(err); }
  };

  const fetchVolunteers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/volunteers`);
      setVolunteers(data);
    } catch (err) { console.error(err); }
  };


  const handleReassign = async (alertId, dept) => {
    try { await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/assign`, { alertId, departmentType: dept }); }
    catch (err) { alert('Failed to reassign'); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/broadcast/send`, {
        message: broadcastMessage,
        scope: 'All'
      });
      setBroadcastMessage('');
      alert('Broadcast Alert Sent!');
    } catch (err) { console.error(err); }
  };

  const handleProtocol = async (protocol) => {
    let message = '';
    if (protocol === 'Lockdown Protocol') {
      message = 'CRITICAL ALERT: LOCKDOWN PROTOCOL INITIATED. Shelter in place immediately. Secure all doors and stay away from windows.';
    } else if (protocol === 'Evacuation Route A') {
      message = 'EVACUATION ORDER: Proceed calmly to Evacuation Route A immediately. Follow designated emergency signs. Do not use elevators.';
    } else if (protocol === 'Mass Casualty Mode') {
      message = 'EMERGENCY: MASS CASUALTY INCIDENT DECLARED. All available medical personnel and verified volunteers report to the nearest triage center.';
    }

    if (!window.confirm(`Are you sure you want to trigger ${protocol.toUpperCase()}? This will alert all citizens.`)) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/broadcast/send`, {
        message: message,
        scope: 'All'
      });
      alert(`${protocol} Initiated! Broadcast sent.`);
    } catch (err) { console.error(err); alert('Failed to initiate protocol'); }
  };

  const handleCloseBroadcast = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${baseUrl}/api/admin-tools/broadcast/${id}/close`);
    } catch (err) { console.error(err); }
  };

  const handleCloseSafetyPulse = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${baseUrl}/api/admin-tools/safety-checks/${id}/close`);
    } catch (err) { console.error(err); }
  };

  const handleVerifyVolunteer = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${baseUrl}/api/admin-tools/volunteers/${id}/verify`);
      setVolunteers(prev => prev.map(v => v._id === id ? { ...v, status: 'Verified' } : v));
    } catch (err) { alert('Failed to verify volunteer'); }
  };

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status !== 'Resolved').length,
    resolved: alerts.filter(a => a.status === 'Resolved').length,
    pending: alerts.filter(a => a.status === 'Pending').length
  };

  const filteredAlerts = alerts
    .filter(a => filter === 'All' || a.status === filter)
    .filter(a =>
      (a.reporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );


  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-red-600" /> Command Center
          </h1>
          <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            City-wide Operations Network Active
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'hazards', label: 'Hazard Map', icon: MapIcon },
            { id: 'safety', label: 'Safety Pulse', icon: Radio },
            { id: 'volunteers', label: 'Volunteers', icon: Users },
            { id: 'approvals', label: 'Approvals', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (

            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <Link
          to="/dispatch"
          className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-600/30 flex items-center gap-2 hover:bg-red-700 transition-all hover:-translate-y-1"
        >
          <Send size={18} /> OPEN LIVE DISPATCH MAP
        </Link>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Alerts', value: stats.total, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Pending Response', value: stats.pending, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Active Missions', value: stats.active - stats.pending, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Total Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-[2.5rem] ${stat.bg} border-4 border-white shadow-xl transition-transform hover:scale-105`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <p className={`text-4xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-40`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><LayoutDashboard /> Live Incident Feed</h3>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <select className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-xs" onChange={(e) => setFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporter</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignment</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert._id} className={`hover:bg-gray-50/80 transition-colors ${alert.type === 'SOS' ? 'bg-red-50/30' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="font-bold text-gray-900">{alert.reporterName}</div>
                          <div className="text-xs text-gray-400 font-medium">{alert.reporterPhone}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${alert.type === 'SOS' ? 'bg-red-600' : 'bg-blue-600'}`}></span>
                            <span className="text-xs font-black text-gray-700">{alert.type.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${alert.status === 'Pending' ? 'bg-red-100 text-red-600' :
                            alert.status === 'Accepted' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                            {alert.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <select
                            className="bg-gray-100 border-none rounded-lg px-3 py-1.5 text-[10px] font-black outline-none focus:ring-2 focus:ring-red-600 transition-all"
                            value={alert.assignedDepartment}
                            onChange={(e) => handleReassign(alert._id, e.target.value)}
                          >
                            <option value="none">UNASSIGNED</option>
                            <option value="police">POLICE DEPT</option>
                            <option value="fire">FIRE DEPT</option>
                            <option value="ambulance">MEDICAL UNITS</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => window.open(`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`)} className="p-2 hover:bg-white rounded-xl text-red-600 transition-all shadow-sm border border-transparent hover:border-red-100">
                            <MapPin size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Broadcast & Tools */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10"><Radio size={200} /></div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Radio className="text-red-500 animate-pulse" /> Emergency Broadcast
              </h3>
              <p className="text-xs text-gray-400 mb-6 font-medium">Send geo-fenced push notifications to all citizens in the area.</p>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <textarea
                  className="w-full bg-gray-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-600 outline-none resize-none"
                  rows="4"
                  placeholder="Enter emergency message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(sanitizeInput(e.target.value, 'text'))}
                ></textarea>
                <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-900/40">
                  <Radio size={18} /> BROADCAST NOW
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldAlert size={18} /> Security Protocols</h3>
              <div className="space-y-3">
                {['Lockdown Protocol', 'Evacuation Route A', 'Mass Casualty Mode'].map(p => (
                  <button key={p} onClick={() => handleProtocol(p)} className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-all text-xs font-black text-gray-600 border border-transparent hover:border-red-100">
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {activeBroadcasts.length > 0 && (
              <div className="bg-red-50 p-8 rounded-[2.5rem] shadow-xl border border-red-100">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">Active Directives</h3>
                <div className="space-y-3">
                  {activeBroadcasts.map(b => (
                    <div key={b._id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-red-100">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 pr-4">{b.message}</p>
                      <button onClick={() => handleCloseBroadcast(b._id)} className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Deactivate">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'hazards' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <MapIcon className="text-red-600" /> Dynamic Hazard Mapping
              </h3>
              <p className="text-gray-500 font-medium">Mark "No-Go" zones and infrastructure collapses in real-time.</p>
            </div>
            <HazardMap />
          </div>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Radio className="text-red-600" /> Trigger Safety Pulse</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Pulse Title</label>
                <input type="text" placeholder="e.g. Earthquake Safety Check" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" value={pulseTitle} onChange={e => setPulseTitle(sanitizeInput(e.target.value, 'text'))} />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Target Neighborhood</label>
                <input type="text" placeholder="e.g. Downtown" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" value={pulseArea} onChange={e => setPulseArea(sanitizeInput(e.target.value, 'text'))} />
              </div>
              <button onClick={handleInitiatePulse} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                <Zap size={18} /> INITIATE PULSE
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-6">Recent Safety Checks</h3>
            <div className="space-y-4">
              {safetyChecks.map((check, i) => {
                const safe = check.responses?.filter(r => r.status === 'Safe').length || 0;
                const danger = check.responses?.filter(r => r.status === 'Need Help').length || 0;
                return (
                  <div key={check._id || i} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{check.title}</h4>
                        <p className="text-xs text-gray-500 font-medium">{check.area}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${check.isActive ? 'text-red-600 bg-red-50 animate-pulse' : 'text-green-600 bg-green-50'}`}>{check.isActive ? 'Active' : 'Completed'}</span>
                        {check.isActive && (
                          <button onClick={() => handleCloseSafetyPulse(check._id)} className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase">
                            Stop Pulse
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-black text-green-600">{safe}</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase">I'm Okay</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-red-600">{danger}</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase">Need Help</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {safetyChecks.length === 0 && <p className="text-gray-500 text-sm">No recent safety checks found.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'volunteers' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Users className="text-blue-600" /> Verified Volunteers</h3>
              <p className="text-sm text-gray-500 font-medium">Manage and deploy community responders</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-600 font-black text-xs">
                {volunteers.length} REGISTERED
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Volunteer</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Exp Level</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {volunteers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold">No volunteers registered yet.</td>
                  </tr>
                )}
                {volunteers.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-400 font-medium">{v.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {v.skills?.map((s, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase ${v.experienceLevel === 'Expert' ? 'text-purple-600' : v.experienceLevel === 'Intermediate' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {v.experienceLevel}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${v.status === 'Active' ? 'bg-green-100 text-green-600' :
                        v.status === 'Verified' ? 'bg-blue-100 text-blue-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                        {v.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {(v.status === 'Pending' || !v.status) && (
                        <button onClick={() => handleVerifyVolunteer(v._id)} className="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl">VERIFY</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in p-8">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2"><Package className="text-blue-600" /> Pending Inventory Approvals</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingItems.length === 0 && (
              <div className="col-span-full p-12 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-2xl">
                No pending items to approve.
              </div>
            )}
            {pendingItems.map(item => (
              <div key={item._id} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                {item.photoUrl ? (
                  <div className="h-40 w-full bg-gray-200">
                    <img src={item.photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <Package size={40} />
                  </div>
                )}
                <div className="p-6">
                  <h4 className="font-black text-gray-900 text-lg mb-1">{item.resourceName}</h4>
                  <p className="text-xs font-bold text-blue-600 uppercase mb-4">{item.type} • {item.quantity}</p>
                  <p className="text-sm text-gray-600 font-medium mb-1"><span className="font-bold">Owner:</span> {item.ownerName}</p>
                  <p className="text-sm text-gray-600 font-medium mb-1"><span className="font-bold">Location:</span> {item.location}</p>
                  <p className="text-sm text-gray-600 font-medium mb-6"><span className="font-bold">Contact:</span> {item.contact}</p>

                  <div className="flex gap-2">
                    <button onClick={() => handleApproveItem(item._id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black flex justify-center items-center gap-1 transition-all shadow-lg shadow-green-100 active:scale-95">
                      <Check size={16} /> APPROVE
                    </button>
                    <button onClick={() => handleRejectItem(item._id)} className="flex-1 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-black flex justify-center items-center gap-1 transition-all shadow-lg shadow-gray-100 active:scale-95">
                      <X size={16} /> REJECT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in zoom-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incident Type Distribution */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <BarChart3 className="text-red-600" /> Incident Frequency
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(
                    alerts.reduce((acc, curr) => {
                      acc[curr.type] = (acc[curr.type] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" fill="#ef4444" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <CheckCircle className="text-green-600" /> Resolution Status
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: stats.pending, color: '#ef4444' },
                        { name: 'Active', value: stats.active - stats.pending, color: '#f97316' },
                        { name: 'Resolved', value: stats.resolved, color: '#22c55e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#22c55e'][index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Trend Analytics */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
              <Activity className="text-blue-600" /> Crisis Intensity Timeline
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: '08:00', alerts: 2 },
                  { name: '10:00', alerts: 5 },
                  { name: '12:00', alerts: 8 },
                  { name: '14:00', alerts: alerts.length },
                  { name: '16:00', alerts: alerts.length + 2 },
                  { name: '18:00', alerts: alerts.length - 1 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}


      {activeTab === 'logistics' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Logistics Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Warehouse Stock</p>
                <p className="text-4xl font-black text-blue-600 mt-1">{globalLogistics.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0)}</p>
              </div>
              <Package size={32} className="text-blue-100" />
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Requisitions</p>
                <p className="text-4xl font-black text-orange-600 mt-1">12</p>
              </div>
              <Clock size={32} className="text-orange-100" />
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency Rate</p>
                <p className="text-4xl font-black text-green-600 mt-1">94%</p>
              </div>
              <Zap size={32} className="text-green-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Credit Manager */}
            <div className="lg:col-span-1 bg-gray-900 p-8 rounded-[3rem] shadow-2xl text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-yellow-400" /> Logistics Credit Manager
              </h3>
              <div className="space-y-6">
                {Object.entries(departmentCredits).map(([dept, credits]) => (
                  <div key={dept} className="p-4 bg-gray-800 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{dept}</p>
                      <span className="text-xl font-black text-yellow-400">{credits} CR</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setDepartmentCredits(prev => ({...prev, [dept]: prev[dept] + 50}))} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-[10px] font-black transition-all">+50 CR</button>
                      <button onClick={() => setDepartmentCredits(prev => ({...prev, [dept]: Math.max(0, prev[dept] - 50)}))} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-[10px] font-black transition-all">-50 CR</button>
                    </div>
                  </div>
                ))}
                <button className="w-full py-4 bg-blue-600 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">DISTRIBUTE MONTHLY BUDGET</button>
              </div>
            </div>

            {/* Requisition Queue */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-orange-600" /> Requisition Queue</h3>
                <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all shadow-lg active:scale-95">
                  AUTHORIZE ALL ROUTINE REQUESTS
                </button>
              </div>
              
              <div className="space-y-4">
                 {[
                   { dept: 'Hospital', item: 'Medical Kits', qty: 200, type: 'CRITICAL', time: '5m ago' },
                   { dept: 'Fire Dept', item: 'Blankets', qty: 50, type: 'ROUTINE', time: '12m ago' },
                   { dept: 'Police', item: 'Riot Gear', qty: 15, type: 'CRITICAL', time: '1h ago' }
                 ].map((req, i) => (
                   <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.type === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Package size={20} />
                         </div>
                         <div>
                            <p className="text-xs font-black text-gray-900">{req.qty} {req.item}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.dept} • {req.time}</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><Check size={16} /></button>
                         <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X size={16} /></button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Global Warehouse Manager */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-xl font-bold flex items-center gap-2"><Archive className="text-blue-600" /> Global City Warehouse</h3>
                   <p className="text-xs text-gray-400 font-medium">Add stock from external government shipments</p>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                   <Plus size={16} /> LOG NEW SHIPMENT
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {globalLogistics.slice(0, 8).map((item, i) => (
                  <div key={i} className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{item.unit}</p>
                        <p className="text-sm font-black text-gray-900 mt-1">{item.name}</p>
                     </div>
                     <p className="text-xl font-black text-blue-600">{item.quantity}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

