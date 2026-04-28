import React from 'react';
import { Clock, CheckCircle2, Siren, AlertTriangle, Flag, ArrowDown } from 'lucide-react';

const TimelinePlayback = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-gray-400 text-xs italic">No timeline data available for this incident.</p>;
  }

  const getEventIcon = (status) => {
    switch (status) {
      case 'Pending': return <AlertTriangle className="text-red-600" size={16} />;
      case 'Accepted': return <CheckCircle2 className="text-blue-600" size={16} />;
      case 'In Progress': return <Siren className="text-orange-600" size={16} />;
      case 'Resolved': return <Flag className="text-green-600" size={16} />;
      default: return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getEventColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-50 border-red-100';
      case 'Accepted': return 'bg-blue-50 border-blue-100';
      case 'In Progress': return 'bg-orange-50 border-orange-100';
      case 'Resolved': return 'bg-green-50 border-green-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="space-y-4 py-4 relative">
      {/* Vertical Line */}
      <div className="absolute left-[23px] top-10 bottom-10 w-[2px] bg-gray-100 z-0"></div>

      {timeline.map((event, idx) => (
        <div key={idx} className="relative z-10 flex items-start gap-4 group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-all group-hover:scale-110 ${getEventColor(event.status)}`}>
            {getEventIcon(event.status)}
          </div>
          <div className="flex-1 pt-1">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{event.status}</h4>
              <span className="text-[10px] font-black text-gray-400 uppercase">{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-xs font-bold text-gray-600 mt-1 leading-relaxed">{event.message}</p>
          </div>
        </div>
      ))}

      <div className="flex justify-center pt-2">
         <div className="bg-gray-900 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            End of Record
         </div>
      </div>
    </div>
  );
};

export default TimelinePlayback;
