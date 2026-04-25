import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, credentials);
      login(data);
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied. Invalid credentials protocol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full glass p-8 rounded-3xl border-gray-100 shadow-2xl transition-all hover:scale-[1.01]">
        <div className="text-center mb-10">
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Official Access</h2>
          <p className="text-gray-500 mt-2 font-medium">Log in to manage emergency operations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 animate-shake">
            <div className="w-1 h-4 bg-red-600 rounded-full"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block ml-1">Email Terminal</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" required className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all font-medium" placeholder="officer@safe.com" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} />
            </div>
          </div>
          <div className="relative">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block ml-1">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" required className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all font-medium" placeholder="••••••••" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><LogIn className="w-5 h-5" /> Access Dashboard</>}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium text-sm">
          Don't have an account? <Link to="/register" className="text-red-600 font-bold hover:underline">Register your Department</Link><br/>
          <Link to="/forgot-password" alt="Forgot Password" title="Forgot Password" className="text-gray-600 font-bold hover:underline mt-2 inline-block">Forgot Password?</Link> • <Link to="/activate" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Have an activation key?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
