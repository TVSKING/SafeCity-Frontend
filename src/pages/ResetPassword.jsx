import React, { useState } from 'react';
import axios from 'axios';
import { KeyRound, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ email: '', resetToken: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/reset-password`, formData);
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full glass p-8 rounded-3xl border-gray-100 shadow-2xl">
        <Link to="/forgot-password" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 mb-8 transition-all">
          <ArrowLeft size={16} /> BACK
        </Link>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900">Reset Password</h2>
          <p className="text-gray-500 mt-2 font-medium">Verify your identity and set a new password.</p>
        </div>

        {message ? (
          <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-green-700 font-bold">{message}</p>
            <p className="text-xs text-green-600 mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block ml-1">Email Address</label>
              <input 
                type="email" required 
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-medium" 
                placeholder="officer@safe.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block ml-1">6-Digit Reset Code</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" required maxLength="6"
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-black tracking-[0.5em] text-center" 
                  placeholder="XXXXXX"
                  value={formData.resetToken}
                  onChange={(e) => setFormData({...formData, resetToken: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block ml-1">New Master Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" required 
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none font-medium" 
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : "RESET PASSWORD"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
