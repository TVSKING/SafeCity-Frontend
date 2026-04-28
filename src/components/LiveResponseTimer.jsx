import React, { useState, useEffect } from 'react';
import { Clock, Timer, Zap } from 'lucide-react';

const LiveResponseTimer = ({ createdAt, resolvedAt, status }) => {
  const [elapsed, setElapsed] = useState('');
  const [colorClass, setColorClass] = useState('text-green-600');

  useEffect(() => {
    const calculateTime = () => {
      const startTime = new Date(createdAt).getTime();
      const endTime = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
      const diff = Math.floor((endTime - startTime) / 1000);

      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      
      // Update color based on time
      if (!resolvedAt) {
        if (mins >= 8) setColorClass('text-red-600 animate-pulse');
        else if (mins >= 3) setColorClass('text-orange-500');
        else setColorClass('text-green-600');
      } else {
        setColorClass('text-gray-500');
      }

      setElapsed(`${mins}m ${secs}s`);
    };

    calculateTime();
    const interval = !resolvedAt ? setInterval(calculateTime, 1000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [createdAt, resolvedAt, status]);

  return (
    <div className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest ${colorClass}`}>
       {resolvedAt ? <Timer size={14} /> : <Clock size={14} className="animate-spin-slow" />}
       <span>{resolvedAt ? 'Total Duration' : 'Response Time'}: {elapsed}</span>
       {!resolvedAt && status === 'Pending' && (
         <div className="flex items-center gap-1 ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[8px]">
            <Zap size={10} className="fill-red-600" /> URGENT
         </div>
       )}
    </div>
  );
};

export default LiveResponseTimer;
