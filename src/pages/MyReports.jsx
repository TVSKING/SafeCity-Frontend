import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, Clock, CheckCircle, AlertCircle, 
  MapPin, Calendar, Search, History, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyReports = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/my-reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (user) fetchMyReports();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <Link to="/" className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2 mb-4 font-bold text-sm uppercase tracking-widest">
              <ArrowLeft size={16} /> {t('home')}
            </Link>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <History className="text-red-600" /> {t('my_status')}
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">Track the progress of your submitted emergency reports.</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-gray-100">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FileText size={40} />
             </div>
             <h2 className="text-2xl font-black text-gray-900">No Reports Found</h2>
             <p className="text-gray-500 mt-2 font-medium">You haven't submitted any emergency reports yet.</p>
             <Link to="/" className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 hover:-translate-y-1 transition-all">
                REPORT EMERGENCY NOW
             </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:border-red-100 transition-all flex flex-col md:flex-row gap-8 items-start md:items-center">
                
                <div className={`w-20 h-20 shrink-0 rounded-[2rem] flex items-center justify-center ${
                  report.type === 'Fire' ? 'bg-red-50 text-red-600' :
                  report.type === 'Medical' ? 'bg-blue-50 text-blue-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  <AlertCircle size={40} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {report.type}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300">#{report._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{report.description || 'No detailed description'}</h3>
                  <div className="flex flex-wrap gap-4 items-center text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-1"><MapPin size={14} className="text-red-500" /> {report.state}</div>
                    <div className="flex items-center gap-1"><Calendar size={14} className="text-blue-500" /> {new Date(report.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-3 w-full md:w-auto pt-6 md:pt-0 border-t md:border-none border-gray-50">
                  <div className={`px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ${
                    report.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                    report.status === 'Accepted' ? 'bg-blue-100 text-blue-600' :
                    report.status === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {report.status === 'Resolved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                    {report.status}
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {report.status === 'Pending' ? 'Awaiting Dispatch' : 'Responders Active'}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReports;
