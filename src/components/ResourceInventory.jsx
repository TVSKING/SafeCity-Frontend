import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Minus, RefreshCw, Send, AlertTriangle, X, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourceInventory = ({ departmentType }) => {
  const [resources, setResources] = useState([]);
  const [activeHazards, setActiveHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMode, setDeployMode] = useState(null); // stores resource object
  const [deployQty, setDeployQty] = useState(1);
  const [selectedHazard, setSelectedHazard] = useState('');

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

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="text-blue-600" />
          Resource Ledger
        </h3>
        <div className="flex gap-2">
          <Link to="/manage-inventory" className="p-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 transition-colors" title="Manage Resource Types">
            <Edit3 size={18} />
          </Link>
          <button onClick={fetchResources} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div key={resource._id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{resource.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{resource.quantity} {resource.unit} available</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => updateQuantity(resource._id, resource.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-lg min-w-[2ch] text-center">{resource.quantity}</span>
              <button 
                onClick={() => updateQuantity(resource._id, resource.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all"
              >
                <Plus size={16} />
              </button>
              <button 
                onClick={() => setDeployMode(resource)}
                className="w-8 h-8 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all ml-2"
                title="Deploy to Hazard Zone"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        ))}
        {resources.length === 0 && !loading && (
          <p className="text-gray-400 text-center py-4 italic">No resources found.</p>
        )}
      </div>

      {/* Deployment Panel */}
      {deployMode && (
        <div className="mt-6 p-5 bg-blue-50 rounded-2xl border border-blue-200 shadow-inner animate-in fade-in zoom-in">
           <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-blue-900 flex items-center gap-2"><Send size={16} /> Deploy {deployMode.name}</h4>
              <button onClick={() => setDeployMode(null)} className="text-blue-400 hover:text-blue-600"><X size={16} /></button>
           </div>
           
           {activeHazards.length === 0 ? (
             <div className="text-sm font-bold text-blue-600 flex items-center gap-2">
                <AlertTriangle size={16} /> No active hazard zones to deploy to.
             </div>
           ) : (
             <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-blue-500 mb-1 block">Target Hazard Zone</label>
                  <select 
                    className="w-full p-2 rounded-xl border-none outline-none font-bold text-sm text-gray-800 focus:ring-2 focus:ring-blue-500"
                    value={selectedHazard}
                    onChange={(e) => setSelectedHazard(e.target.value)}
                  >
                     {activeHazards.map(h => (
                       <option key={h._id} value={h._id}>{h.type} Hazard (Radius: {h.radius}m)</option>
                     ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-blue-500 mb-1 block">Quantity ({deployMode.unit})</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={deployMode.quantity} 
                    value={deployQty} 
                    onChange={e => setDeployQty(parseInt(e.target.value))}
                    className="w-full p-2 rounded-xl border-none outline-none font-bold text-sm text-gray-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={handleDeploy}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                >
                  <Send size={16} /> CONFIRM DEPLOYMENT
                </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ResourceInventory;
