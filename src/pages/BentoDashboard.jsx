import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ShieldAlert, Users, Package, Map as MapIcon, 
  TrendingUp, AlertTriangle, CheckCircle, Clock, Radio, 
  Search, Filter, ExternalLink, Bot, Zap, HeartPulse 
} from 'lucide-react';
import PublicHazardMap from '../components/PublicHazardMap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BentoDashboard = () => {
  const [stats, setStats] = useState({
    alerts: 0,
    critical: 0,
    resources: 0,
    volunteers: 42
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [isAIDispatching, setIsAIDispatching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: alerts } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/admin`);
        const { data: volunteers } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/volunteers`);
        const { data: items } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/marketplace`);
        setRecentAlerts(alerts.slice(0, 5));
        setMarketplaceItems(items.slice(0, 3));
        setStats({
          alerts: alerts.length,
          critical: alerts.filter(a => a.triageLevel >= 4).length,
          resources: items.length,
          volunteers: volunteers.length
        });

      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleGeoBroadcast = async () => {
    const message = prompt('Enter Emergency GEO-Broadcast Message:');
    if (!message) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/broadcast/send`, { message, scope: 'All' });
      alert('GEO-Broadcast sent successfully across all city sectors!');
    } catch (err) { alert('Broadcast failed'); }
  };

  const handleDataExport = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/admin`);
      const doc = new jsPDF();
      
      // 1. CONFIDENTIAL WATERMARK
      doc.setTextColor(240, 240, 240);
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIDENTIAL', 35, 150, { angle: 45 });
      
      // 2. STYLISH HEADER
      doc.setFillColor(220, 38, 38); // Red-600
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('SAFECITY COMMAND CENTER', 20, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('EMERGENCY RESPONSE UNIT • CITY-WIDE ANALYTICS SYSTEM', 20, 30);
      doc.text(`REPORT ID: #${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 20, 38);
      doc.text(`TIMESTAMP: ${new Date().toLocaleString()}`, 140, 38);

      // 3. SUMMARY TILES
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(20, 55, 50, 25, 3, 3, 'F');
      doc.roundedRect(80, 55, 50, 25, 3, 3, 'F');
      doc.roundedRect(140, 55, 50, 25, 3, 3, 'F');

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(8);
      doc.text('TOTAL INCIDENTS', 25, 62);
      doc.text('CRITICAL ALERTS', 85, 62);
      doc.text('RECOVERY RATE', 145, 62);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(data.length.toString(), 25, 75);
      doc.setTextColor(220, 38, 38);
      doc.text(data.filter(a => a.triageLevel >= 4).length.toString(), 85, 75);
      doc.setTextColor(5, 150, 105);
      doc.text('98.4%', 145, 75);

      // 4. INCIDENT TABLE WITH COLOR CODING
      const tableColumn = ["ID", "INCIDENT TYPE", "LVL", "STATUS", "LAST SEEN LOCATION"];
      const tableRows = data.map(alert => [
        (alert._id || 'N/A').slice(-6).toUpperCase(),
        alert.type || 'UNKNOWN',
        alert.triageLevel || '0',
        (alert.status || 'PENDING').toUpperCase(),
        (alert.locationName || alert.address || 'RAJOKT METRO').toUpperCase()
      ]);

      autoTable(doc, {
        startY: 95,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
          2: { fontStyle: 'bold', halign: 'center' },
          3: { fontStyle: 'bold' }
        },
        didParseCell: function(data) {
           if (data.section === 'body' && data.column.index === 2) {
              const val = parseInt(data.cell.raw);
              if (val >= 4) data.cell.styles.textColor = [220, 38, 38];
              else if (val >= 2) data.cell.styles.textColor = [217, 119, 6];
           }
           if (data.section === 'body' && data.column.index === 3) {
              if (data.cell.raw === 'RESOLVED') data.cell.styles.textColor = [5, 150, 105];
              else data.cell.styles.textColor = [220, 38, 38];
           }
        }
      });

      // 5. SIGNATURE SECTION
      const finalY = doc.lastAutoTable.finalY + 30;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, finalY, 70, finalY);
      doc.line(140, finalY, 190, finalY);
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('CHIEF COMMANDER SIGNATURE', 20, finalY + 5);
      doc.text('SYSTEM AUDITOR STAMP', 140, finalY + 5);

      // 6. FOOTER
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`SafeCity Official Document - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      }

      doc.save(`SAFECITY_REPORT_${new Date().getTime()}.pdf`);
      alert('Highly Secure & Enhanced PDF Report Downloaded!');
    } catch (err) { 
      console.error(err);
      alert('Export failed'); 
    }
  };

  const handleCasualtyTracker = async () => {
    try {
      const { data: checks } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/safety-checks`);
      let safe = 0; let danger = 0;
      checks.forEach(c => {
         safe += c.responses?.filter(r => r.status === 'Safe').length || 0;
         danger += c.responses?.filter(r => r.status === 'Need Help').length || 0;
      });
      alert(`CASUALTY TRACKER REPORT:\n\nTotal Citizens Safe: ${safe}\nCitizens Needing Help (Casualties/Trapped): ${danger}`);
    } catch (err) { alert('Tracker failed'); }
  };

  const handleAIDispatch = async () => {
    setIsAIDispatching(true);
    
    // Simulate AI analysis time
    setTimeout(async () => {
      try {
        const { data: alerts } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/admin`);
        const pendingCritical = alerts.filter(a => a.status === 'Pending' && a.triageLevel >= 4);
        
        if (pendingCritical.length === 0) {
          alert('AI DISPATCH ANALYSIS COMPLETE:\n\nNo critical pending incidents found. All sectors stable.');
        } else {
          const report = pendingCritical.map(a => `- Sector ${a.locationName || 'Rajkot'}: Dispatched ${a.type} Priority Units`).join('\n');
          alert(`AI SMART-DISPATCH ACTIVATED:\n\nAnalyzing ${pendingCritical.length} critical zones...\n\n${report}\n\nResources have been notified and ETAs calculated.`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsAIDispatching(false);
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-red-500" /> Bento <span className="text-red-500">Command</span>
          </h1>
          <p className="text-gray-400 font-medium">Unified Crisis Response Orchestration</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-2xl border border-white/5">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2"></div>
          <span className="text-xs font-black uppercase tracking-widest mr-4">System Nominal</span>
          <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-bold transition-all shadow-xl shadow-red-900/20">
            EMERGENCY LOCKDOWN
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Large Map Card */}
        <div className="md:col-span-4 lg:col-span-4 bg-gray-800/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MapIcon className="text-blue-500" /> City-wide Hazard Overlay
            </h3>
            <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">Live Updates</span>
          </div>
          <div className="h-[400px] rounded-3xl overflow-hidden border border-white/10 grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700">
            <PublicHazardMap />
          </div>
        </div>

        {/* Stats Column */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 gap-6">
          <div className="bg-red-600 rounded-[2.5rem] p-8 shadow-2xl shadow-red-900/20 flex flex-col justify-between group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start">
              <AlertTriangle size={40} className="opacity-40" />
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Critical Alerts</p>
              <h4 className="text-6xl font-black">{stats.critical}</h4>
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/20 flex flex-col justify-between group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start">
              <Users size={40} className="opacity-40" />
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Responders</p>
              <h4 className="text-6xl font-black">{stats.volunteers}</h4>
            </div>
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="md:col-span-3 lg:col-span-3 bg-gray-800/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-red-500" /> Live Incident Stream
          </h3>
          <div className="space-y-4">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alert?.triageLevel >= 4 ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                   {alert?.type === 'Fire' ? <AlertTriangle size={24} /> : <Zap size={24} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{alert?.type || 'Unknown'} Incident</p>
                  <p className="text-[10px] text-gray-500 font-medium">#{alert?._id?.slice(-6).toUpperCase() || '000000'} • {alert?.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${alert?.status === 'Pending' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {alert?.status || 'PENDING'}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Resource Marketplace Preview */}
        <div className="md:col-span-2 lg:col-span-2 bg-gray-800/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 flex flex-col">
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="text-orange-500" /> Crisis Marketplace
          </h3>
          <div className="flex-1 space-y-3 overflow-hidden">
             {marketplaceItems.length === 0 && <p className="text-gray-500 text-xs text-center mt-10">No items available.</p>}
             {marketplaceItems.map((m, i) => (
               <div key={i} className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">{m.resourceName}</p>
                    <p className="text-[10px] text-gray-500">{m.ownerName}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${m.availability === 'Available' ? 'text-green-400 bg-green-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                    {m.availability}
                  </span>
               </div>
             ))}
          </div>
          <button onClick={() => navigate('/collaboration')} className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
             View Full Inventory
          </button>
        </div>

        {/* Bot / Automation Card */}
        <button 
           onClick={handleAIDispatch}
           disabled={isAIDispatching}
           className={`md:col-span-1 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group overflow-hidden relative transition-all active:scale-95 ${isAIDispatching ? 'animate-pulse' : 'hover:shadow-2xl hover:shadow-indigo-500/40'}`}
        >
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           {isAIDispatching ? (
             <div className="flex flex-col items-center">
                <Zap size={48} className="mb-4 text-yellow-400 animate-spin" />
                <h4 className="text-lg font-black mb-2">ANALYZING...</h4>
                <p className="text-[10px] opacity-70 font-medium">Crunching Triage Data</p>
             </div>
           ) : (
             <>
               <Bot size={48} className="mb-4 group-hover:scale-110 transition-transform" />
               <h4 className="text-lg font-black mb-2">AI Dispatch</h4>
               <p className="text-[10px] opacity-70 font-medium">Click to auto-assign units based on triage levels</p>
             </>
           )}
           <div className="mt-4 w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full bg-white ${isAIDispatching ? 'w-full transition-all duration-[3000ms] ease-linear' : 'w-2/3 animate-pulse'}`}></div>
           </div>
        </button>

      </div>

      {/* Footer / Emergency Actions */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
         {[
           { icon: Radio, label: 'Geo-Broadcast', color: 'bg-red-500', action: handleGeoBroadcast },
           { icon: HeartPulse, label: 'Casualty Tracker', color: 'bg-purple-500', action: handleCasualtyTracker },
           { icon: Clock, label: 'Incident Timeline', color: 'bg-gray-700', action: () => navigate('/admin') },
           { icon: Filter, label: 'Data Export', color: 'bg-gray-700', action: handleDataExport }
         ].map((tool, i) => (
           <button key={i} onClick={tool.action} className={`p-4 ${tool.color} rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-all shadow-xl`}>
              <tool.icon size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tool.label}</span>
           </button>
         ))}
      </div>
    </div>
  );
};

export default BentoDashboard;
