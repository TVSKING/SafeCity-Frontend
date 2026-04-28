import React, { useState } from 'react';
import { Image as ImageIcon, Video, Filter, Maximize2, ExternalLink, Clock, MapPin, Search } from 'lucide-react';

const MediaWall = ({ alerts }) => {
  const [filter, setFilter] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Extract all media from alerts
  const mediaItems = [];
  alerts.forEach(alert => {
    if (alert.mediaUrls && alert.mediaUrls.length > 0) {
      alert.mediaUrls.forEach(url => {
        mediaItems.push({
          url,
          alertId: alert._id,
          type: alert.type,
          reporter: alert.reporterName,
          timestamp: alert.createdAt,
          isVideo: url.toLowerCase().endsWith('.mp4') || url.includes('video')
        });
      });
    }
  });

  const filteredMedia = filter === 'All' 
    ? mediaItems 
    : mediaItems.filter(m => m.type === filter);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
         <div>
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
               <ImageIcon className="text-red-600" /> Intelligence Media Wall
            </h3>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Unified Field Evidence Feed</p>
         </div>
         <div className="flex gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            {['All', 'Fire', 'Accident', 'Medical', 'Crime'].map(t => (
               <button 
                 key={t}
                 onClick={() => setFilter(t)}
                 className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   filter === t ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                 }`}
               >
                  {t}
               </button>
            ))}
         </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.length === 0 && (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
             <ImageIcon size={64} className="opacity-10 mb-4" />
             <p className="font-bold text-lg">No evidence media found for this filter.</p>
          </div>
        )}
        
        {filteredMedia.map((item, i) => (
          <div 
            key={i} 
            className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 transition-all hover:scale-[1.03] hover:shadow-2xl cursor-pointer"
            onClick={() => setSelectedMedia(item)}
          >
             {item.isVideo ? (
               <div className="aspect-square bg-gray-900 flex items-center justify-center">
                  <Video size={48} className="text-white/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                        <Video size={24} />
                     </div>
                  </div>
               </div>
             ) : (
               <img src={item.url} alt="Evidence" className="w-full aspect-square object-cover transition-all group-hover:scale-110 duration-700" />
             )}
             
             {/* Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                      {item.type}
                   </span>
                </div>
                <h4 className="text-white font-black text-sm">{item.reporter}</h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-300 font-bold mt-1">
                   <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
             </div>

             {/* Investigation Icon */}
             <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-gray-900 shadow-xl scale-0 group-hover:scale-100 transition-transform duration-300">
                <Search size={18} />
             </div>
          </div>
        ))}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[5000] bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
           <button onClick={() => setSelectedMedia(null)} className="absolute top-8 right-8 text-white hover:rotate-90 transition-transform">
              <X size={40} />
           </button>
           
           <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white rounded-[4rem] overflow-hidden shadow-2xl">
              <div className="lg:col-span-2 bg-gray-100 flex items-center justify-center relative min-h-[400px]">
                 {selectedMedia.isVideo ? (
                   <video src={selectedMedia.url} controls autoPlay className="max-h-[70vh] w-full" />
                 ) : (
                   <img src={selectedMedia.url} alt="Evidence" className="max-h-[70vh] object-contain" />
                 )}
                 <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={16} /> HIGH RESOLUTION EVIDENCE
                 </div>
              </div>
              
              <div className="p-10 space-y-8 overflow-y-auto">
                 <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Source Incident</h3>
                    <h2 className="text-3xl font-black text-gray-900">{selectedMedia.type} Emergency</h2>
                    <p className="text-gray-500 font-bold text-xs mt-1 italic uppercase tracking-widest">Incident ID: {selectedMedia.alertId.slice(-8).toUpperCase()}</p>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-gray-100">
                          <Clock size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Captured</p>
                          <p className="font-black text-gray-900">{new Date(selectedMedia.timestamp).toLocaleString()}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                          <MapPin size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporter</p>
                          <p className="font-black text-gray-900">{selectedMedia.reporter}</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-gray-100">
                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl">
                       <ExternalLink size={18} /> OPEN INCIDENT FILE
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MediaWall;

// Helper icons
const X = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const ShieldAlert = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
  </svg>
);
