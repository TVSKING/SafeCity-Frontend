import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Trash2, Plus, Minus, ArrowLeft, Archive, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageInventory = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Resource Form State
  const [selectedResourceIdx, setSelectedResourceIdx] = useState(0);
  const [quantity, setQuantity] = useState('');

  const departmentOptions = {
    ambulance: [
      { name: 'Ambulance', unit: 'vehicles' },
      { name: 'Medical Kits', unit: 'kits' },
      { name: 'Oxygen Cylinders', unit: 'cylinders' },
      { name: 'Stretchers', unit: 'units' },
      { name: 'Paramedic Teams', unit: 'teams' },
      { name: 'Mobile ICU', unit: 'vehicles' }
    ],
    fire: [
      { name: 'Fire Trucks', unit: 'vehicles' },
      { name: 'Water Tankers', unit: 'tankers' },
      { name: 'Fire Extinguishers', unit: 'units' },
      { name: 'Rescue Ladders', unit: 'ladders' },
      { name: 'Search Dogs', unit: 'dogs' },
      { name: 'Helicopters', unit: 'vehicles' }
    ],
    police: [
      { name: 'Police Cars', unit: 'vehicles' },
      { name: 'Barricades', unit: 'units' },
      { name: 'Riot Gear', unit: 'sets' },
      { name: 'Surveillance Drones', unit: 'drones' },
      { name: 'Traffic Cones', unit: 'units' },
      { name: 'Swat Teams', unit: 'teams' }
    ]
  };

  const defaultOptions = [
    { name: 'Supply Truck', unit: 'vehicles' },
    { name: 'Water Bottles', unit: 'cases' },
    { name: 'Food Rations', unit: 'boxes' },
    { name: 'Blankets', unit: 'units' },
    { name: 'Tents', unit: 'units' }
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
      alert('Resource added/updated successfully!');
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
    const newQty = currentQty + delta;
    if (newQty < 0) return; // Prevent negative quantity

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${baseUrl}/api/resources/update/${id}`, { quantity: newQty });
      setResources(prev => prev.map(r => r._id === id ? { ...r, quantity: newQty, lastUpdated: Date.now() } : r));
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
         <Link to="/dashboard" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm border border-gray-100">
            <ArrowLeft />
         </Link>
         <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
               <Archive className="text-blue-600" /> Manage Inventory
            </h1>
            <p className="text-gray-500 font-medium">Add new supply types or remove discontinued stock from your official ledger.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Form Column */}
         <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
               <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Plus className="text-green-500" /> Add New Stock
               </h3>
               <form onSubmit={handleAddResource} className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Select Resource Type</label>
                     <select 
                        value={selectedResourceIdx} 
                        onChange={e => setSelectedResourceIdx(parseInt(e.target.value))} 
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-900 cursor-pointer"
                     >
                        {currentOptions.map((opt, idx) => (
                           <option key={idx} value={idx}>{opt.name} ({opt.unit})</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Initial Quantity</label>
                     <input 
                        type="number" 
                        min="1"
                        required 
                        value={quantity} 
                        onChange={e => setQuantity(e.target.value)} 
                        placeholder="e.g. 50"
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" 
                     />
                  </div>
                  <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-gray-200 mt-4">
                     ADD TO LEDGER
                  </button>
               </form>
            </div>
         </div>

         {/* Ledger List Column */}
         <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                     <Package className="text-blue-600" /> Active Ledger
                  </h3>
                  <button onClick={fetchResources} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                     <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : 'text-gray-600'} />
                  </button>
               </div>

               <div className="space-y-4">
                  {resources.length === 0 && !loading && (
                     <div className="p-12 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-3xl">
                        Your ledger is empty. Add resources using the form.
                     </div>
                  )}

                  {resources.map((resource) => (
                     <div key={resource._id} className="p-6 bg-gray-50 rounded-3xl flex items-center justify-between border border-gray-100">
                        <div>
                           <p className="text-xl font-black text-gray-900">{resource.name}</p>
                           <div className="flex gap-4 mt-2">
                              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100 uppercase tracking-widest">
                                 {resource.quantity} {resource.unit}
                              </span>
                              <span className="text-xs font-bold text-gray-400">
                                 Updated: {new Date(resource.lastUpdated).toLocaleDateString()}
                              </span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-1">
                              <button 
                                 onClick={() => handleUpdateQuantity(resource._id, resource.quantity, -1)}
                                 className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                                 title="Decrease Quantity"
                              >
                                 <Minus size={18} />
                              </button>
                              <button 
                                 onClick={() => handleUpdateQuantity(resource._id, resource.quantity, 1)}
                                 className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                                 title="Increase Quantity"
                              >
                                 <Plus size={18} />
                              </button>
                           </div>
                           <button 
                              onClick={() => handleDeleteResource(resource._id)}
                              className="p-3 bg-white border border-gray-200 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                              title="Delete Resource Type"
                           >
                              <Trash2 size={20} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ManageInventory;
