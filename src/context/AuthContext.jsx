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
    
    // Fetch fresh profile to ensure all fields like 'state' are current
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data: freshUser } = await axios.get(`${baseUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (err) {
      // Fallback to login data if profile fetch fails
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
