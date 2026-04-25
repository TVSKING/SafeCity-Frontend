import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Users, Mail, Key, Building2, MapPin } from 'lucide-react';

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const fetchUsers = async () => {
      try { const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/users`); setUsers(data); }
      catch (err) { console.error(err); }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div><h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3"><Users className="text-red-600" /> Registry</h1></div>
        <div className="relative w-96"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="glass p-6 rounded-[2rem] border-white shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">{user.name.charAt(0)}</div>
              <div><h3 className="text-lg font-bold text-gray-900">{user.name}</h3><span className="text-xs uppercase font-black text-gray-400">{user.role}</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl"><Mail className="w-4 h-4 text-red-500" /> {user.email}</div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl"><Key className="w-4 h-4 text-red-500" /> <strong>{user.plainPassword}</strong></div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl"><Building2 className="w-4 h-4 text-red-500" /> {user.departmentType}</div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl"><MapPin className="w-4 h-4 text-red-500 shrink-0" /> <span className="truncate">{user.address || 'Address Not Provided'}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAccounts;
