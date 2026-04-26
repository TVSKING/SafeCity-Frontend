import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Minus, RefreshCw, Send, AlertTriangle, X, Edit3, ShieldAlert, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ResourceInventory = ({ departmentType, isFull = false }) => {
  const [resources, setResources] = useState([]);
  const [activeHazards, setActiveHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

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
    ]
  };

  const defaultOptions = [
    { name: 'Supply Truck', unit: 'vehicles', category: 'Fleet' },
    { name: 'Water Bottles', unit: 'cases', category: 'Food/Water' },
    { name: 'Food Rations', unit: 'boxes', category: 'Food/Water' },
    { name: 'Blankets', unit: 'units', category: 'Shelter' },
    { name: 'Tents', unit: 'units', category: 'Shelter' }
  ];

  const currentOptions = departmentOptions[departmentType] || defaultOptions;

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


  const updateQuantity = async (resource, newQty) => {
    if (newQty < 0) return;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const token = localStorage.getItem('token');

    try {
      if (resource.isVirtual) {
        // Create new item in DB if it was virtual
        const { data } = await axios.post(`${baseUrl}/api/resources`, {
          name: resource.name,
          unit: resource.unit,
          quantity: newQty,
          departmentType: departmentType,
          lastUpdated: Date.now()
        }, { headers: { Authorization: `Bearer ${token}` } });
        setResources(prev => [...prev, data]);
      } else {
        // Normal update
        await axios.put(`${baseUrl}/api/resources/update/${resource._id}`, { quantity: newQty }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResources(resources.map(r => r._id === resource._id ? { ...r, quantity: newQty } : r));
      }
    } catch (err) {
      console.error('Update failed');
    }
  };

  // Merged Ledger
  const allResourcesMerged = currentOptions.map(opt => {
    const existing = resources.find(r => r.name === opt.name);
    if (existing) return existing;
    return {
      _id: `virtual_${opt.name.replace(/\s+/g, '_')}`,
      name: opt.name,
      unit: opt.unit,
      quantity: opt.initial || 0,
      departmentType: departmentType,
      lastUpdated: Date.now(),
      isVirtual: true
    };
  });

  const filteredResources = allResourcesMerged
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
                          onClick={() => updateQuantity(resource, resource.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`px-3 font-black text-sm min-w-[3ch] text-center ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{resource.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(resource, resource.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        >
                          <Plus size={14} />
                        </button>
                     </div>
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

    </div>
  );
};

export default ResourceInventory;
