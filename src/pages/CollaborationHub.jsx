import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, Search, Plus, MapPin, Phone, Heart, ShieldCheck, Share2, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VolunteerRegistration from '../components/VolunteerRegistration';
import ResourceListingModal from '../components/ResourceListingModal';
import MissingPersonReportModal from '../components/MissingPersonReportModal';

const CollaborationHub = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('marketplace');
  const [missingPersons, setMissingPersons] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [showReg, setShowReg] = useState(false);
  const [showResourceList, setShowResourceList] = useState(false);
  const [showMissingReport, setShowMissingReport] = useState(false);


  const fetchData = async () => {
    try {
      const { data: persons } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/missing-persons`);
      const { data: items } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/marketplace`);
      setMissingPersons(persons);
      setMarketplaceItems(items);
    } catch (err) { console.error(err); }
  };

  const handleBroadcastInfo = (person) => {
    const shareText = `🚨 MISSING PERSON ALERT 🚨\nName: ${person.name}\nAge: ${person.age}\nLast Seen: ${person.lastSeenLocation}\n\nHelp us find them! Shared via SafeCity.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Missing Person Alert',
        text: shareText,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        alert('Info copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Info copied to clipboard! Share it to help find ' + person.name);
    }
  };

  const handleContactProvider = (contact) => {
    if (!contact) return;
    if (contact.includes('@')) {
      window.location.href = `mailto:${contact}`;
    } else {
      window.location.href = `tel:${contact.replace(/[^0-9+]/g, '')}`;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to resolve/delete this resource?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/marketplace/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMarketplaceItems(prev => prev.filter(i => i._id !== id));
    } catch (err) { alert('Failed to delete'); }
  };

  const handleDeletePerson = async (id) => {
    if (!window.confirm('Are you sure you want to mark this person as Found/Resolved?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/missing-persons/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMissingPersons(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert('Failed to delete'); }
  };


  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-outfit">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Collaboration <span className="text-blue-600">Hub</span></h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">Community-driven resource sharing and missing persons recovery network.</p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-1.5 rounded-2xl flex shadow-inner">
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'marketplace' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Package size={20} /> Marketplace
          </button>
          <button 
            onClick={() => setActiveTab('missing')}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'missing' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={20} /> Missing Persons
          </button>
        </div>
      </div>

      {activeTab === 'marketplace' ? (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-gray-800">Crisis Inventory</h2>
              <button 
                onClick={() => setShowResourceList(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                 <Plus size={20} /> List Resource
              </button>
           </div>

           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {marketplaceItems.length === 0 && (
                <div className="col-span-full p-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] text-center text-gray-400">
                   <Package size={64} className="mx-auto mb-4 opacity-20" />
                   <p className="text-xl font-bold">No community resources listed yet.</p>
                </div>
              )}
              {marketplaceItems.map((item, i) => (
                 <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-50 hover:border-blue-100 transition-all group overflow-hidden">
                   {item.photoUrl && (
                     <div className="h-48 -mt-6 -mx-6 mb-6 bg-gray-100 relative">
                        <img src={item.photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                     </div>
                   )}
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                         <Package size={28} />
                      </div>
                      <span className="text-[10px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-full uppercase tracking-widest">{item.availability}</span>
                   </div>
                   <h3 className="text-xl font-black text-gray-900 mb-1">{item.resourceName}</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{item.type}</p>
                   
                   <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                         <Users size={16} className="text-gray-400" /> {item.ownerName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                         <MapPin size={16} className="text-gray-400" /> {item.location}
                      </div>
                   </div>

                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleContactProvider(item.contact)}
                       className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                     >
                        <Phone size={18} /> CONTACT
                     </button>
                     {isAdmin && (
                       <button 
                         onClick={() => handleDeleteItem(item._id)}
                         className="px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all shadow-sm border border-transparent hover:border-red-200"
                         title="Mark Resolved / Delete"
                       >
                         <Trash2 size={20} />
                       </button>
                     )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-gray-800">Missing Persons Board</h2>
              <button 
                onClick={() => setShowMissingReport(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-100"
              >
                 <Plus size={20} /> File Report
              </button>
           </div>


           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {missingPersons.length === 0 && (
                <div className="col-span-full p-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] text-center text-gray-400">
                   <Users size={64} className="mx-auto mb-4 opacity-20" />
                   <p className="text-xl font-bold">No active reports. Everyone is accounted for.</p>
                </div>
              )}
              {missingPersons.map((person, i) => (
                <div key={i} className="bg-white overflow-hidden rounded-[2.5rem] shadow-xl border border-gray-50 hover:border-red-100 transition-all group">
                   <div className="h-64 bg-gray-100 relative">
                      {person.photoUrl ? (
                        <img src={person.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                           <Users size={80} />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                         MISSING
                      </div>
                   </div>
                   <div className="p-6">
                      <h3 className="text-xl font-black text-gray-900">{person.name}</h3>
                      <p className="text-sm text-gray-500 font-bold mb-4">{person.age} Years Old</p>
                      
                      <div className="flex items-start gap-2 mb-6">
                         <MapPin size={16} className="text-red-500 mt-0.5" />
                         <p className="text-xs text-gray-600 font-medium">Last seen: <span className="font-bold text-gray-800">{person.lastSeenLocation}</span></p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleBroadcastInfo(person)}
                          className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                           <Share2 size={16} /> BROADCAST INFO
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeletePerson(person._id)}
                            className="px-4 bg-green-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-100 transition-all flex items-center justify-center border border-transparent hover:border-green-200"
                            title="Mark Found"
                          >
                             <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Collaboration CTA */}
      <div className="mt-20 bg-gray-900 rounded-[3rem] p-12 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
         <div className="relative z-10">
            <Heart className="text-red-500 mx-auto mb-6 fill-red-500 animate-pulse" size={48} />
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Become a Crisis Hero</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 font-medium">Verified volunteers get priority dispatch and skill-based matching to specific emergencies.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button onClick={() => setShowReg(true)} className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black hover:bg-gray-100 transition-all shadow-2xl">
                  REGISTER VOLUNTEER
               </button>
               <button onClick={() => setShowReg(true)} className="bg-transparent text-white border-2 border-white/20 px-10 py-4 rounded-2xl font-black hover:bg-white/5 transition-all">
                  SKILL ASSESSMENT
               </button>
            </div>
         </div>
      </div>

      <VolunteerRegistration isOpen={showReg} onClose={() => setShowReg(false)} />
      <ResourceListingModal 
        isOpen={showResourceList} 
        onClose={() => setShowResourceList(false)} 
        onRefresh={fetchData} 
      />
      <MissingPersonReportModal 
        isOpen={showMissingReport} 
        onClose={() => setShowMissingReport(false)} 
        onRefresh={fetchData} 
      />
    </div>
  );
};



export default CollaborationHub;
