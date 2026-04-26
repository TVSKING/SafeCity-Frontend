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
  
  // New Resource Form State
  const [selectedResourceIdx, setSelectedResourceIdx] = useState(0);
  const [quantity, setQuantity] = useState('');

  const departmentOptions = {
    ambulance: [
      { name: 'Ambulance', unit: 'vehicles', category: 'Fleet' },
      { name: 'Medical Kits', unit: 'kits', category: 'Supplies' },
      { name: 'Oxygen Cylinders', unit: 'cylinders', category: 'Medical' },
      { name: 'Stretchers', unit: 'units', category: 'Equipment' },
      { name: 'Paramedic Teams', unit: 'teams', category: 'Personnel' },
      { name: 'Mobile ICU', unit: 'vehicles', category: 'Fleet' }
    ],
    fire: [
      { name: 'Fire Trucks', unit: 'vehicles', category: 'Fleet' },
      { name: 'Water Tankers', unit: 'tankers', category: 'Fleet' },
      { name: 'Fire Extinguishers', unit: 'units', category: 'Supplies' },
      { name: 'Rescue Ladders', unit: 'ladders', category: 'Equipment' },
      { name: 'Search Dogs', unit: 'dogs', category: 'Personnel' },
      { name: 'Helicopters', unit: 'vehicles', category: 'Fleet' }
    ],
    police: [
      { name: 'Police Cars', unit: 'vehicles', category: 'Fleet' },
      { name: 'Barricades', unit: 'units', category: 'Equipment' },
      { name: 'Riot Gear', unit: 'sets', category: 'Equipment' },
      { name: 'Surveillance Drones', unit: 'drones', category: 'Tech' },
      { name: 'Traffic Cones', unit: 'units', category: 'Equipment' },
      { name: 'Swat Teams', unit: 'teams', category: 'Personnel' }
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

    const selected = currentOptions[selectedResourceIdx];

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/resources`, {
        name: selected.name,
        unit: selected.unit,
        quantity: parseInt(quantity),
        departmentType: user.departmentType,
        lastUpdated: Date.now()
      });
      
      setResources(prev => {
        const exists = prev.find(r => r._id === data._id);
        if (exists) return prev.map(r => r._id === data._id ? data : r);
        return [...prev, data];
      });
      
      setQuantity('');
    } catch (err) {
      alert('Failed to add resource');
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

  const handleUpdateQuantity = async (id, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${baseUrl}/api/resources/update/${id}`, { quantity: newQty });
      setResources(prev => prev.map(r => r._id === id ? { ...r, quantity: newQty, lastUpdated: Date.now() } : r));
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  // Stats calculation
  const totalStock = resources.reduce((acc, r) => acc + r.quantity, 0);
  const lowStockCount = resources.filter(r => r.quantity < 10).length;
  const recentUpdates = resources.filter(r => (Date.now() - new Date(r.lastUpdated).getTime()) < 86400000).length;

  const filteredResources = resources
    .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(r => {
      if (stockFilter === 'low') return r.quantity < 10;
      if (stockFilter === 'available') return r.quantity >= 10;
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
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{user?.departmentType?.toUpperCase()} LOGISTICS LIVE</p>
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
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Initial Quantity</label>
                     <input 
                        type="number" 
                        min="1"
                        required 
                        value={quantity} 
                        onChange={e => setQuantity(sanitizeInput(e.target.value, 'number'))} 
                        placeholder="e.g. 50"
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold shadow-inner" 
                     />
                  </div>
                  <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl shadow-gray-200 mt-4 active:scale-95 flex items-center justify-center gap-3">
                     <Archive size={20} /> AUTHORIZE ENTRY
                  </button>
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
                          <p className="text-gray-400 font-bold">No matching resources found in your ledger.</p>
                       </div>
                    )}

                    {filteredResources.map((resource) => {
                       const isLow = resource.quantity < 10;
                       const category = currentOptions.find(o => o.name === resource.name)?.category || 'General';
                       
                       return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={resource._id} 
                            className={`p-6 bg-white rounded-[2.5rem] border-2 transition-all relative overflow-hidden group ${isLow ? 'border-red-50 bg-red-50/10 shadow-red-50' : 'border-gray-50 hover:border-blue-100 shadow-xl shadow-gray-100'}`}
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
                                  onClick={() => handleDeleteResource(resource._id)}
                                  className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <Trash2 size={18} />
                                </button>
                             </div>

                             <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1">
                                   <div className="flex justify-between items-end mb-2">
                                      <p className="text-2xl font-black text-gray-900 leading-none">{resource.quantity} <span className="text-xs font-bold text-gray-400 uppercase">{resource.unit}</span></p>
                                      {isLow && <span className="text-[10px] font-black text-red-600 flex items-center gap-1"><AlertCircle size={10} /> CRITICAL</span>}
                                   </div>
                                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (resource.quantity / 50) * 100)}%` }}
                                        className={`h-full rounded-full ${isLow ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                                      />
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center bg-gray-50 rounded-2xl p-1 shadow-inner">
                                   <button 
                                      onClick={() => handleUpdateQuantity(resource._id, resource.quantity, -1)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"
                                   >
                                      <Minus size={18} />
                                   </button>
                                   <span className="px-4 font-black text-gray-900 text-sm">{resource.quantity}</span>
                                   <button 
                                      onClick={() => handleUpdateQuantity(resource._id, resource.quantity, 1)}
                                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-white rounded-xl transition-all shadow-sm"
                                   >
                                      <Plus size={18} />
                                   </button>
                                </div>
                                <div className="text-right">
                                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Last Audit</p>
                                   <p className="text-[10px] font-bold text-gray-900 mt-1">{new Date(resource.lastUpdated).toLocaleDateString()}</p>
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
