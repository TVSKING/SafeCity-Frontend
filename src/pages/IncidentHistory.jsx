import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  History, Search, Filter, Calendar, MapPin, 
  ArrowLeft, Download, FileText, CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const IncidentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/admin`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter only resolved for history
        setHistory(data.filter(a => a.status === 'Resolved'));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history
    .filter(a => typeFilter === 'All' || a.type === typeFilter)
    .filter(a => 
      (a.reporterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.state?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <Link to="/admin" className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2 mb-4 font-bold text-sm uppercase tracking-widest">
              <ArrowLeft size={16} /> Back to Command Center
            </Link>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <History className="text-red-600" /> Incident Archive
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">Complete historical record of all resolved regional emergencies.</p>
          </div>

          <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl">
            <Download size={18} /> EXPORT ALL DATA
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by reporter, state, or description..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-600 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              className="px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-red-600"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Fire">Fire</option>
              <option value="Police">Police</option>
              <option value="Medical">Medical</option>
              <option value="SOS">SOS</option>
            </select>
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2">
               <FileText size={16} /> {filteredHistory.length} RECORDS FOUND
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHistory.map((item) => (
            <div key={item._id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:-translate-y-2 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-[5rem] flex items-start justify-end p-6 text-green-600 opacity-20 group-hover:opacity-100 transition-opacity">
                <CheckCircle size={32} />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.type === 'Fire' ? 'bg-red-100 text-red-600' :
                  item.type === 'SOS' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {item.type}
                </span>
                <span className="text-gray-300 text-xs font-bold">#{item._id.slice(-6).toUpperCase()}</span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">{item.description || 'No description provided'}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                  <MapPin size={14} className="text-red-500" /> {item.state || 'National Jurisdiction'}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                  <Calendar size={14} className="text-blue-500" /> {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Reporter</p>
                  <p className="text-sm font-bold text-gray-900">{item.reporterName}</p>
                </div>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`)}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <MapPin size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-40">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <History size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Archive Empty</h2>
            <p className="text-gray-500 font-medium mt-2">No resolved incidents have been recorded yet.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default IncidentHistory;
