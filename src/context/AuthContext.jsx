import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  const login = async (data) => {
    // Expecting { token, user } from server
    const { user, token } = data;
    if (token) localStorage.setItem('token', token);
    
    console.log('🔑 Login Attempt | Data received:', data.user);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data: freshUser } = await axios.get(`${baseUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile Refresh Success:', freshUser.state);
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (err) {
      console.error('❌ Profile Refresh Failed. Falling back to login data.', err);
      // Ensure we don't lose the state if it was in the initial login data
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
