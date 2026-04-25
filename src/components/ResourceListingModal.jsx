import React, { useState } from 'react';
import axios from 'axios';
import { X, Package, ShieldCheck, MapPin, Phone, User, Zap } from 'lucide-react';

const ResourceListingModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    ownerName: '',
    resourceName: '',
    quantity: '',
    type: 'Other',
    location: '',
    contact: '',
    availability: 'Available',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ownerName || !formData.resourceName || !formData.quantity || !formData.location || !formData.contact || !formData.photoUrl) {
      alert('Please fill out all fields and upload photo evidence.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/marketplace/create`, formData);
      onRefresh();
      onClose();
      setFormData({ ownerName: '', resourceName: '', quantity: '', type: 'Other', location: '', contact: '', availability: 'Available', photoUrl: '' });
    } catch (err) {
      alert('Failed to list resource');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[3rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all">
          <X size={24} />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <Package size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">List Crisis Resource</h2>
              <p className="text-sm text-gray-500 font-medium">Share your resources with the community.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Owner Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                   <input required type="text" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm" placeholder="e.g. Alex J." value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Resource Name</label>
                <input required type="text" className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm" placeholder="e.g. 50L Water" value={formData.resourceName} onChange={(e) => setFormData({...formData, resourceName: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Type</label>
                <select className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="Water">Water</option>
                  <option value="Food">Food</option>
                  <option value="Tool">Tool</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Quantity/Note</label>
                <input required type="text" className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm" placeholder="e.g. 10 kits" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Location</label>
              <div className="relative">
                 <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                 <input required type="text" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm" placeholder="e.g. Main Street Hub" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Contact Info</label>
              <div className="relative">
                 <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                 <input required type="text" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm" placeholder="Phone or Email" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Photo Evidence</label>
              <div className="relative">
                 <input required type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer" />
              </div>
              {formData.photoUrl && (
                <div className="mt-2 h-24 rounded-xl overflow-hidden border border-gray-100">
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Zap className="animate-spin" /> : <ShieldCheck size={20} />}
              PUBLISH TO INVENTORY
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourceListingModal;
