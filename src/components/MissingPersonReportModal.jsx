import React, { useState } from 'react';
import axios from 'axios';
import { X, User, MapPin, Phone, MessageSquare, ShieldAlert, Camera, Zap } from 'lucide-react';
import { sanitizeInput } from '../utils/validation';

const MissingPersonReportModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    lastSeenLocation: '',
    description: '',
    photoUrl: '',
    reporterContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/missing-persons/create`, formData);
      onRefresh();
      onClose();
      setFormData({ name: '', age: '', lastSeenLocation: '', description: '', photoUrl: '', reporterContact: '' });
      setPreview(null);
    } catch (err) {
      alert('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all">
          <X size={24} />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
               <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">File Missing Report</h2>
              <p className="text-sm text-gray-500 font-medium">Broadcast details to city-wide search network.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
               <label className="w-32 h-32 rounded-full border-4 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all overflow-hidden cursor-pointer relative">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="text-gray-300 mb-1" />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center px-2">Upload Photo</span>
                    </>
                  )}
               </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Person's Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                   <input required type="text" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-sm" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: sanitizeInput(e.target.value, 'text')})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Age</label>
                <input required type="number" className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-sm" placeholder="e.g. 24" value={formData.age} onChange={(e) => setFormData({...formData, age: sanitizeInput(e.target.value, 'number')})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Last Seen Location</label>
              <div className="relative">
                 <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                 <input required type="text" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-sm" placeholder="e.g. Near Metro Station" value={formData.lastSeenLocation} onChange={(e) => setFormData({...formData, lastSeenLocation: sanitizeInput(e.target.value, 'text')})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Distinguishing Features</label>
              <div className="relative">
                 <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                 <textarea rows="2" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-sm resize-none" placeholder="e.g. Wearing blue jacket, scar on left hand" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Reporter Contact</label>
              <div className="relative">
                 <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                 <input required type="text" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-sm" placeholder="Your Phone Number" value={formData.reporterContact} onChange={(e) => setFormData({...formData, reporterContact: sanitizeInput(e.target.value, 'number')})} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Zap className="animate-spin" /> : <ShieldAlert size={20} />}
              BROADCAST MISSING REPORT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MissingPersonReportModal;
