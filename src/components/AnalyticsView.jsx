import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Clock, ShieldCheck, MapIcon, TrendingUp } from 'lucide-react';

const AnalyticsView = ({ alerts }) => {
  // 1. Calculate Stats
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved');
  
  // Mock performance calculation (In real world, use difference between createdAt and acceptedAt/resolvedAt)
  const avgResponseTime = resolvedAlerts.length > 0 ? '12.4 min' : '---';
  const avgResolutionTime = resolvedAlerts.length > 0 ? '42.8 min' : '---';

  // 2. Prepare Time Series Data (Mocked hourly distribution)
  const timeData = [
    { hour: '00:00', count: 4 }, { hour: '04:00', count: 2 }, { hour: '08:00', count: 8 },
    { hour: '12:00', count: 15 }, { hour: '16:00', count: 12 }, { hour: '20:00', count: 9 }
  ];

  // 3. Prepare Zone Data (Top neighborhoods)
  const zoneData = [
    { name: 'Downtown', count: 45, color: '#ef4444' },
    { name: 'Industrial', count: 32, color: '#f97316' },
    { name: 'North Suburb', count: 21, color: '#3b82f6' },
    { name: 'East Side', count: 18, color: '#10b981' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg Response Time', value: avgResponseTime, icon: Clock, color: 'blue' },
          { label: 'Avg Resolution Time', value: avgResolutionTime, icon: Activity, color: 'orange' },
          { label: 'Mission Success Rate', value: '98.2%', icon: ShieldCheck, color: 'green' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-6">
             <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incident Trends */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                   <TrendingUp className="text-blue-600" /> Hourly Incident Spikes
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Temporal Intelligence Feed</p>
             </div>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                   <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                   />
                   <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill: '#3b82f6', strokeWidth: 4, stroke: '#fff'}} activeDot={{r: 8}} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Most Dangerous Zones */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                   <MapIcon className="text-red-600" /> Hot Zone Rankings
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Regional Risk Density</p>
             </div>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#475569'}} width={100} />
                   <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                   />
                   <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                      {zoneData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white flex items-center justify-between overflow-hidden relative">
         <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Predictive Patrol Suggestions</h3>
            <p className="text-gray-400 font-bold text-sm max-w-lg">Based on historical data, we suggest increasing fire patrols in the <span className="text-red-400">Industrial Zone</span> between 12:00 and 15:00.</p>
         </div>
         <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
            <TrendingUp size={48} className="text-blue-400" />
         </div>
         {/* Background Glow */}
         <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
};

export default AnalyticsView;
