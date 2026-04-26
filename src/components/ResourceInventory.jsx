import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Minus, RefreshCw, Send, AlertTriangle, X, Edit3, ShieldAlert, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ResourceInventory = ({ departmentType, isFull = false }) => {
  const [resources, setResources] = useState([]);
  const [activeHazards, setActiveHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMode, setDeployMode] = useState(null); // stores resource object
  const [deployQty, setDeployQty] = useState(1);
  const [selectedHazard, setSelectedHazard] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${baseUrl}/api/resources/${departmentType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHazards = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin-tools/hazards`);
      setActiveHazards(data);
      if (data.length > 0) setSelectedHazard(data[0]._id);
    } catch (err) { console.error('Failed to fetch hazards', err); }
  };

  useEffect(() => {
    fetchResources();
    fetchHazards();
  }, [departmentType]);

  const handleDeploy = async () => {
    if (!deployMode || !selectedHazard) return;
    if (deployQty <= 0 || deployQty > deployMode.quantity) return alert('Invalid quantity');
    
    try {
      await updateQuantity(deployMode._id, deployMode.quantity - deployQty);
      const hazard = activeHazards.find(h => h._id === selectedHazard);
      alert(`SUCCESS: Deployed ${deployQty} ${deployMode.unit} of ${deployMode.name} to the ${hazard.type} Zone!`);
      setDeployMode(null);
      setDeployQty(1);
    } catch (err) { alert('Failed to deploy resources'); }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 0) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem('token');
      await axios.put(`${baseUrl}/api/resources/update/${id}`, { quantity: newQty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(resources.map(r => r._id === id ? { ...r, quantity: newQty } : r));
    } catch (err) {
      console.error('Update failed');
    }
  };

  const filteredResources = resources
    .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    .filter(r => {
       const q = Number(r.quantity);
       if (filter === 'low') return q < 10;
       return true;
    });

  return (
    <div className={`bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col h-full relative overflow-hidden ${isFull ? 'min-h-[700px]' : ''}`}>
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10 gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
            <Package className="text-blue-600" />
            {isFull ? 'Operational Resource Ledger' : 'Resource Hub'}
          </h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Live Asset Ledger</p>
        </div>

        {isFull && (
           <div className="flex flex-1 max-w-md bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 items-center gap-2 mx-4">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-transparent border-none outline-none font-bold text-sm flex-1"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        )}

        <div className="flex gap-2">
          {isFull && (
             <button 
                onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${filter === 'low' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-gray-100 text-gray-400'}`}
             >
                <AlertTriangle size={14} /> LOW STOCK
             </button>
          )}
          <Link to="/manage-inventory" className="w-10 h-10 bg-white hover:bg-blue-600 hover:text-white rounded-xl text-blue-600 transition-all shadow-sm border border-gray-100 flex items-center justify-center active:scale-95" title="Manage Resource Types">
            <Edit3 size={18} />
          </Link>
          <button onClick={fetchResources} className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-100 flex items-center justify-center active:scale-95">
            <RefreshCw size={18} className={`text-gray-400 transition-all ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`grid gap-5 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 ${isFull ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        <AnimatePresence mode='popLayout'>
          {filteredResources.map((resource) => {
            const isLow = resource.quantity < 10;
            const isOutOfStock = resource.quantity === 0;
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={resource._id} 
                className={`p-5 rounded-[2rem] flex flex-col gap-4 transition-all relative overflow-hidden group ${isOutOfStock ? 'bg-red-600/10 border border-red-600 shadow-xl shadow-red-50' : isLow ? 'bg-red-50/50 border border-red-100' : 'bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-gray-100'}`}
              >
                {isLow && (
                  <div className="absolute top-0 right-0 p-2 text-red-500 animate-pulse">
                    <ShieldAlert size={14} />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-black tracking-tight ${isOutOfStock ? 'text-red-600' : isLow ? 'text-red-900' : 'text-gray-900'}`}>{resource.name}</p>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{resource.unit}</p>
                       {isOutOfStock && <span className="text-[8px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded animate-pulse">OUT OF STOCK</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(resource._id, resource.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`px-3 font-black text-sm min-w-[3ch] text-center ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{resource.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(resource._id, resource.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        >
                          <Plus size={14} />
                        </button>
                     </div>
                     <button 
                        onClick={() => setDeployMode(resource)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-lg transition-all active:scale-95 ${isLow ? 'bg-red-600 text-white shadow-red-200' : 'bg-blue-600 text-white shadow-blue-200'}`}
                        title="Deploy to Hazard Zone"
                      >
                        <Send size={14} />
                      </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredResources.length === 0 && !loading && (
          <div className="py-12 text-center col-span-full">
            <Package size={40} className="mx-auto text-gray-100 mb-2" />
            <p className="text-gray-400 font-bold text-sm">
               {filter === 'low' 
                 ? "No critical stock alerts at this time." 
                 : "No resources logged in this department."}
            </p>
          </div>
        )}
      </div>

      {/* Deployment Panel */}
      <AnimatePresence>
        {deployMode && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 left-4 right-4 z-50 p-6 bg-gray-900 text-white rounded-[2rem] shadow-2xl animate-in fade-in zoom-in"
          >
             <div className="flex justify-between items-center mb-5">
                <h4 className="font-black flex items-center gap-2"><Send size={18} className="text-blue-400" /> DEPLOY ASSET</h4>
                <button onClick={() => setDeployMode(null)} className="p-2 hover:bg-gray-800 rounded-xl transition-all"><X size={18} /></button>
             </div>
             
             {activeHazards.length === 0 ? (
               <div className="p-4 bg-red-900/30 border border-red-900/50 rounded-2xl text-xs font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle size={16} /> NO ACTIVE HAZARD ZONES
               </div>
             ) : (
               <div className="space-y-5">
                  <div className="p-4 bg-gray-800 rounded-2xl">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TARGET ZONE</p>
                     <select 
                       className="w-full bg-transparent border-none outline-none font-bold text-sm text-white cursor-pointer"
                       value={selectedHazard}
                       onChange={(e) => setSelectedHazard(e.target.value)}
                     >
                        {activeHazards.map(h => (
                          <option key={h._id} value={h._id} className="bg-gray-900">{h.type} Hazard ({h.radius}m)</option>
                        ))}
                     </select>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-2xl">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">UNITS TO DEPLOY</p>
                     <div className="flex items-center justify-between">
                        <button onClick={() => setDeployQty(Math.max(1, deployQty - 1))} className="p-1 hover:text-blue-400 transition-colors"><Minus size={18} /></button>
                        <span className="text-xl font-black">{deployQty}</span>
                        <button onClick={() => setDeployQty(Math.min(deployMode.quantity, deployQty + 1))} className="p-1 hover:text-blue-400 transition-colors"><Plus size={18} /></button>
                     </div>
                  </div>
                  
                  <button 
                    onClick={handleDeploy}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex justify-center items-center gap-3"
                  >
                    <Send size={18} /> AUTHORIZE DEPLOYMENT
                  </button>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceInventory;
