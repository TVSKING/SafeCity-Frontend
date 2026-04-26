import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Phone, FileText, Camera, Save, CheckCircle, KeyRound } from 'lucide-react';
import { sanitizeInput } from '../utils/validation';

const Profile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    address: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local storage and context
      login({ token, user: data });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/change-password`, passData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Password changed successfully!');
      setPassData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing password');
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header/Banner */}
          <div className="h-48 bg-gradient-to-r from-red-600 to-red-800 relative">
            <div className="absolute -bottom-16 left-12">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-xl overflow-hidden">
                  <img 
                    src={profile.profileImage || `https://ui-avatars.com/api/?name=${profile.name}&background=random&size=200`} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-[1.5rem]"
                  />
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-gray-900 text-white rounded-xl cursor-pointer hover:scale-110 transition-all">
                  <Camera size={16} />
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-20 px-12 pb-12">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-3xl font-black text-gray-900">{profile.name}</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Verified {user?.departmentType || 'Official'} Department
                </p>
              </div>
              {message && (
                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl animate-bounce">
                  <CheckCircle size={18} /> {message}
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Department Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: sanitizeInput(e.target.value, 'text')})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Contact Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      disabled
                      type="email" 
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl border-none outline-none cursor-not-allowed font-medium text-gray-500" 
                      value={profile.email}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Line</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="tel" 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold" 
                      placeholder="+91 ..."
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: sanitizeInput(e.target.value, 'number')})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Operational Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                    <textarea 
                      rows="1"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold resize-none" 
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: sanitizeInput(e.target.value, 'text')})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Department Bio / Description</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                    <textarea 
                      rows="4"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-medium resize-none" 
                      placeholder="Describe your department's mission and capabilities..."
                      value={profile.description}
                      onChange={(e) => setProfile({...profile, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                 <button 
                  type="submit" 
                  disabled={saving}
                  className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {saving ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><Save size={20} /> SAVE CHANGES</>}
                </button>
              </div>
            </form>

            {/* Change Password Section */}
            <div className="mt-16 pt-12 border-t border-gray-100">
               <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                 <KeyRound className="text-red-600" /> Security Protocol
               </h3>
               <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Current Password</label>
                    <input 
                      type="password" required
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold" 
                      value={passData.currentPassword}
                      onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">New Master Password</label>
                    <input 
                      type="password" required
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold" 
                      value={passData.newPassword}
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={passSaving}
                    className="py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {passSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
                  </button>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
