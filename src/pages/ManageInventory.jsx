import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Trash2, Plus, Minus, ArrowLeft, Archive, RefreshCw, 
  Search, AlertCircle, TrendingUp, TrendingDown, Layers, Filter, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { sanitizeInput } from '../utils/validation';
import { motion, AnimatePresence } from 'framer-motion';

const ManageInventory = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, available
  const [credits, setCredits] = useState(500); // Initial credits
  
  // New Resource Form State
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [selectedResourceIdx, setSelectedResourceIdx] = useState(0);
  const [quantity, setQuantity] = useState('');

  const departmentOptions = {
    ambulance: [
      { name: 'Ambulance', unit: 'vehicles', category: 'Fleet', initial: 12 },
      { name: 'Medical Kits', unit: 'kits', category: 'Supplies', initial: 350 },
      { name: 'Oxygen Cylinders', unit: 'cylinders', category: 'Medical', initial: 150 },
      { name: 'Stretchers', unit: 'units', category: 'Equipment', initial: 40 },
      { name: 'Paramedic Teams', unit: 'teams', category: 'Personnel', initial: 25 },
      { name: 'Mobile ICU', unit: 'vehicles', category: 'Fleet', initial: 5 }
    ],
    fire: [
      { name: 'Fire Trucks', unit: 'vehicles', category: 'Fleet', initial: 10 },
      { name: 'Water Tankers', unit: 'tankers', category: 'Fleet', initial: 15 },
      { name: 'Fire Extinguishers', unit: 'units', category: 'Supplies', initial: 200 },
      { name: 'Rescue Ladders', unit: 'ladders', category: 'Equipment', initial: 20 },
      { name: 'Search Dogs', unit: 'dogs', category: 'Personnel', initial: 12 },
      { name: 'Helicopters', unit: 'vehicles', category: 'Fleet', initial: 3 }
    ],
    police: [
      { name: 'Police Cars', unit: 'vehicles', category: 'Fleet', initial: 45 },
      { name: 'Barricades', unit: 'units', category: 'Equipment', initial: 100 },
      { name: 'Riot Gear', unit: 'sets', category: 'Equipment', initial: 80 },
      { name: 'Surveillance Drones', unit: 'drones', category: 'Tech', initial: 15 },
      { name: 'Traffic Cones', unit: 'units', category: 'Equipment', initial: 300 },
      { name: 'Swat Teams', unit: 'teams', category: 'Personnel', initial: 10 }
    ],
    other: [
      { name: 'Supply Trucks', unit: 'vehicles', category: 'Fleet', initial: 15 },
      { name: 'Generators', unit: 'units', category: 'Power', initial: 20 },
      { name: 'Mobile Kitchen', unit: 'units', category: 'Food', initial: 5 },
      { name: 'Large Tents', unit: 'tents', category: 'Shelter', initial: 50 },
      { name: 'Relief Teams', unit: 'teams', category: 'Personnel', initial: 30 },
      { name: 'Food Rations', unit: 'boxes', category: 'Food', initial: 1000 },
      { name: 'Water Cases', unit: 'cases', category: 'Water', initial: 2000 }
    ]
  };

  const defaultOptions = [
    { name: 'Supply Truck', unit: 'vehicles', category: 'Fleet' },
    { name: 'Water Bottles', unit: 'cases', category: 'Food/Water' },
    { name: 'Food Rations', unit: 'boxes', category: 'Food/Water' },
    { name: 'Blankets', unit: 'units', category: 'Shelter' },
    { name: 'Tents', unit: 'units', category: 'Shelter' }
  ];

  const currentOptions = user ? (departmentOptions[user.departmentType] || defaultOptions) : defaultOptions;

  const fetchResources = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data } = await axios.get(`${baseUrl}/api/resources/${user.departmentType}`);
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [user]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!quantity) return;

    let name, unit;
    if (isCustom) {
      if (!customName || !customUnit) return;
      name = sanitizeInput(customName, 'text');
      unit = sanitizeInput(customUnit, 'text');
    } else {
      const selected = currentOptions[selectedResourceIdx];
      if (!selected) return;
      name = selected.name;
      unit = selected.unit;
    }

    const isRoutine = parseInt(quantity) < 50 && !isCustom;
    const cost = isRoutine ? 0 : 50;

    if (credits < cost) return alert('Insufficient Logistics Credits for this manual/large request');

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/resources`, {
        name,
        unit,
        quantity: parseInt(quantity),
        departmentType: user.departmentType,
        lastUpdated: Date.now(),
        status: isRoutine ? 'Dispatched' : 'Pending'
      });
      
      setResources(prev => {
        const exists = prev.find(r => r.name === data.name);
        if (exists) return prev.map(r => r.name === data.name ? data : r);
        return [...prev, data];
      });
      
      if (!isRoutine) setCredits(prev => prev - 50);
      setQuantity('');
      setCustomName('');
      setCustomUnit('');
      
      alert(isRoutine 
        ? `INSTANT DISPATCH: ${quantity} units released from Central Warehouse!` 
        : `REQUISITION SUBMITTED: Awaiting Admin Approval for ${quantity} units.`);
    } catch (err) {
      alert('Failed to submit requisition');
    }
  };


  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this resource type?')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.delete(`${baseUrl}/api/resources/${id}`);
      setResources(resources.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete resource');
    }
  };

  const handleUpdateQuantity = async (resource, delta) => {
    const currentQty = Number(resource.quantity);
    const newQty = Math.max(0, currentQty + delta);
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      if (resource.isVirtual) {
        // Create new item in DB if it was virtual
        const { data } = await axios.post(`${baseUrl}/api/resources`, {
          name: resource.name,
          unit: resource.unit,
          quantity: newQty,
          departmentType: user.departmentType,
          lastUpdated: Date.now()
        });
        setResources(prev => [...prev, data]);
      } else {
        // Normal update
        await axios.put(`${baseUrl}/api/resources/update/${resource._id}`, { quantity: newQty });
        setResources(prev => prev.map(r => r._id === resource._id ? { ...r, quantity: newQty, lastUpdated: Date.now() } : r));
      }
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  // Merged Ledger: Database items + Missing standard items with tiered defaults
  const allResourcesMerged = currentOptions.map(opt => {
    const existing = resources.find(r => r.name === opt.name);
    if (existing) return existing;
    return {
      _id: `virtual_${opt.name.replace(/\s+/g, '_')}`,
      name: opt.name,
      unit: opt.unit,
      quantity: opt.initial || 0,
      departmentType: user.departmentType,
      lastUpdated: Date.now(),
      isVirtual: true
    };
  });

  const totalStock = allResourcesMerged.reduce((acc, r) => acc + Number(r.quantity), 0);
  const lowStockCount = allResourcesMerged.filter(r => Number(r.quantity) < 10).length;
  const recentUpdates = allResourcesMerged.filter(r => !r.isVirtual && (Date.now() - new Date(r.lastUpdated).getTime()) < 86400000).length;

  const filteredResources = allResourcesMerged
    .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    .filter(r => {
      const q = Number(r.quantity);
      if (stockFilter === 'low') return q < 10;
      if (stockFilter === 'available') return q >= 10;
      return true;
    });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="group w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm border border-gray-100 active:scale-95">
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Archive className="text-blue-600" /> Resource Ledger
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{user?.departmentType?.toUpperCase()} LOGISTICS LIVE</p>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Zap size={12} className="text-yellow-600 fill-yellow-600" />
                  <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">{credits} CREDITS AVAILABLE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-xl border border-gray-100 overflow-x-auto w-full md:w-auto">
            {[
              { id: 'all', label: 'All Items', icon: Layers },
              { id: 'low', label: 'Low Stock', icon: AlertCircle },
              { id: 'available', label: 'In Stock', icon: CheckCircle2 }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setStockFilter(f.id)}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap ${stockFilter === f.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <f.icon size={14} /> {f.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'TOTAL UNITS', value: totalStock, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'CRITICAL LOW', value: lowStockCount, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'DAILY UPDATES', value: recentUpdates, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className={`p-8 rounded-[2.5rem] bg-white border-2 border-white shadow-xl flex justify-between items-center`}
            >
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-4xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={28} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls & Form */}
          <div className="lg:col-span-4 space-y-8">
            {/* Search */}
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search ledger..." 
                className="flex-1 bg-transparent border-none outline-none font-bold text-gray-900"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Add New Stock Form */}
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
               <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                  <Plus className="text-green-500" /> Register Stock
               </h3>
               <form onSubmit={handleAddResource} className="space-y-6">
                  <div className="flex bg-gray-50 p-1 rounded-xl mb-4 border border-gray-100">
                     <button 
                       type="button"
                       onClick={() => setIsCustom(false)}
                       className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${!isCustom ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                     >
                        STANDARD LIST
                     </button>
                     <button 
                       type="button"
                       onClick={() => setIsCustom(true)}
                       className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${isCustom ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                     >
                        MANUAL ENTRY
                     </button>
                  </div>

                  {!isCustom ? (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Select Supply Type</label>
                       <select 
                          value={selectedResourceIdx} 
                          onChange={e => setSelectedResourceIdx(parseInt(e.target.value))} 
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-900 cursor-pointer appearance-none shadow-inner"
                       >
                          {currentOptions.map((opt, idx) => (
                             <option key={idx} value={idx}>{opt.name} ({opt.unit})</option>
                          ))}
                       </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Resource Name</label>
                          <input 
                             type="text" 
                             required 
                             value={customName} 
                             onChange={e => setCustomName(e.target.value)} 
                             placeholder="e.g. Specialized Drone"
                             className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold shadow-inner" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Unit of Measure</label>
                          <input 
                             type="text" 
                             required 
                             value={customUnit} 
                             onChange={e => setCustomUnit(e.target.value)} 
                             placeholder="e.g. units, liters, sets"
                             className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold shadow-inner" 
                          />
                       </div>
                    </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Initial Quantity</label>
                     <input 
                        type="number" 
                        min="0"
                        required 
                        value={quantity} 
                        onChange={e => setQuantity(sanitizeInput(e.target.value, 'number'))} 
                        placeholder="e.g. 50"
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold shadow-inner" 
                     />
                  </div>
                   <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl shadow-gray-200 mt-4 active:scale-95 flex items-center justify-center gap-3 group">
                      <Archive size={20} className="group-hover:scale-110 transition-transform" /> 
                      {parseInt(quantity) < 50 && !isCustom ? 'INSTANT REQUISITION' : 'SUBMIT FOR APPROVAL'}
                   </button>
                   <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-tighter">
                      {parseInt(quantity) < 50 && !isCustom 
                        ? '✨ Routine request will be auto-dispatched (0 CR)' 
                        : '⚠️ Manual/Large request requires Admin Review (50 CR)'}
                   </p>
                </form>
            </div>
          </div>

          {/* Ledger List */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 min-h-[600px]">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                     <Package className="text-blue-600" /> Active Inventory
                  </h3>
                  <button onClick={fetchResources} className="group p-3 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-all shadow-sm">
                     <RefreshCw size={20} className={`transition-all ${loading ? 'animate-spin text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode='popLayout'>
                    {filteredResources.length === 0 && !loading && (
                       <div className="col-span-full py-20 text-center">
                          <Archive size={60} className="mx-auto text-gray-100 mb-4" />
                          <p className="text-gray-400 font-bold">
                             {stockFilter === 'low' 
                               ? "Great job! All resources are currently well-stocked." 
                               : "No matching resources found in your ledger."}
                          </p>
                          {(searchTerm || stockFilter !== 'all') && (
                            <button 
                              onClick={() => { setSearchTerm(''); setStockFilter('all'); }}
                              className="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                            >
                              Reset All Filters
                            </button>
                          )}
                       </div>
                    )}

                    {filteredResources.map((resource) => {
                       const isLow = resource.quantity < 10;
                       const isOutOfStock = resource.quantity === 0;
                       const category = currentOptions.find(o => o.name === resource.name)?.category || 'General';
                       
                       return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={resource._id} 
                            className={`p-6 bg-white rounded-[2.5rem] border-2 transition-all relative overflow-hidden group ${isOutOfStock ? 'border-red-600 bg-red-50 shadow-red-200' : isLow ? 'border-red-200 bg-red-50/10 shadow-red-50' : 'border-gray-50 hover:border-blue-100 shadow-xl shadow-gray-100'}`}
                          >
                             {isLow && (
                               <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-100 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                             )}
                             
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                   <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block tracking-widest">{category}</span>
                                   <p className="text-xl font-black text-gray-900">{resource.name}</p>
                                </div>
                                <button 
                                  onClick={() => !resource.isVirtual && handleDeleteResource(resource._id)}
                                  className={`p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${resource.isVirtual ? 'cursor-not-allowed opacity-0' : ''}`}
                                >
                                   <Trash2 size={18} />
                                </button>
                             </div>

                             <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1">
                                   <div className="flex justify-between items-end mb-2">
                                      <p className="text-2xl font-black text-gray-900 leading-none">{resource.quantity} <span className="text-xs font-bold text-gray-400 uppercase">{resource.unit}</span></p>
                                      {isOutOfStock ? (
                                         <span className="text-[10px] font-black text-red-600 flex items-center gap-1 animate-pulse tracking-tighter"><AlertCircle size={10} /> OUT OF STOCK</span>
                                       ) : isLow ? (
                                         <span className="text-[10px] font-black text-red-500 flex items-center gap-1"><AlertCircle size={10} /> CRITICAL</span>
                                       ) : null}
                                   </div>
                                </div>
                             </div>

                              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center bg-gray-50 rounded-2xl p-1 shadow-inner">
                                   <button 
                                      onClick={() => handleUpdateQuantity(resource, -1)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"
                                   >
                                      <Minus size={18} />
                                   </button>
                                   <span className="px-4 font-black text-gray-900 text-sm">{resource.quantity}</span>
                                   <button 
                                      onClick={() => handleUpdateQuantity(resource, 1)}
                                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-white rounded-xl transition-all shadow-sm"
                                   >
                                      <Plus size={18} />
                                   </button>
                                </div>
                                <div className="text-right">
                                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Last Audit</p>
                                   <p className="text-[10px] font-bold text-gray-900 mt-1">
                                      {resource.isVirtual ? 'NEVER' : new Date(resource.lastUpdated).toLocaleDateString()}
                                   </p>
                                </div>
                             </div>
                          </motion.div>
                       );
                    })}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
