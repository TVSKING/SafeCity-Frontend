import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Mail, Lock, User, Building, ArrowRight, CheckCircle, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { sanitizeInput } from '../utils/validation';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', departmentType: 'police', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`, formData);
      setSuccess(true);
      if (data.emailUrl) setPreviewUrl(data.emailUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 text-center relative z-10">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-500 font-medium mb-8">
            An activation key has been sent to <b>{formData.email}</b>. Please check your inbox.
          </p>
          {previewUrl && (
             <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-8">
                <p className="text-xs text-blue-600 font-bold mb-2 uppercase">Dev Mode - View Email</p>
                <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm font-black text-blue-700 underline">Open Sent Email</a>
             </div>
          )}
          <button onClick={() => navigate('/activate')} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black transition-all flex justify-center items-center gap-2 shadow-xl">
             ENTER ACTIVATION KEY <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 hover:rotate-0 transition-transform">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">SafeCity</h1>
          <p className="text-gray-500 mt-2 font-medium">Register Department</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <User size={20} />
            </div>
            <input type="text" required placeholder="Department Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: sanitizeInput(e.target.value, 'text')})} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
            <input type="email" required placeholder="Official Email" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-gray-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
            <input type="password" required placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-gray-900" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Building size={20} />
            </div>
            <select className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-gray-900 cursor-pointer" value={formData.departmentType} onChange={(e) => setFormData({...formData, departmentType: e.target.value})}>
              <option value="police">Police Department</option>
              <option value="fire">Fire Department</option>
              <option value="ambulance">Ambulance / Medical</option>
              <option value="other">Other Response Unit</option>
            </select>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <MapPin size={20} />
            </div>
            <input type="text" required placeholder="Official Registered Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-bold text-gray-900" value={formData.address} onChange={(e) => setFormData({...formData, address: sanitizeInput(e.target.value, 'text')})} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all flex justify-center items-center gap-2 shadow-xl shadow-red-100 disabled:opacity-50 mt-4">
            {loading ? 'REGISTERING...' : 'REGISTER ACCOUNT'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium text-sm">
          Already have an account? <Link to="/login" className="text-red-600 font-bold hover:underline">Log in</Link><br/>
          <Link to="/activate" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Have an activation key?</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
