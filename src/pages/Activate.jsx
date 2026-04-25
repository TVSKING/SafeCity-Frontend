import React, { useState } from 'react';
import axios from 'axios';
import { Key, Mail, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Activate = () => {
  const [formData, setFormData] = useState({ email: '', activationKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/activate`, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed');
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
          <h2 className="text-3xl font-black text-gray-900 mb-4">Account Activated!</h2>
          <p className="text-gray-500 font-medium mb-8">
            Your department account is now active and ready for dispatch operations.
          </p>
          <button onClick={() => navigate('/login')} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black transition-all flex justify-center items-center gap-2 shadow-xl">
             PROCEED TO LOGIN <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 hover:rotate-0 transition-transform">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Activate Account</h1>
          <p className="text-gray-500 mt-2 font-medium">Enter the key sent to your email.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
            <input type="email" required placeholder="Official Email" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Key size={20} />
            </div>
            <input type="text" required placeholder="6-Digit Activation Key" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-900 uppercase tracking-widest" maxLength={6} value={formData.activationKey} onChange={(e) => setFormData({...formData, activationKey: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all flex justify-center items-center gap-2 shadow-xl shadow-blue-100 disabled:opacity-50 mt-4">
            {loading ? 'ACTIVATING...' : 'ACTIVATE ACCOUNT'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium text-sm">
          Need an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Activate;
