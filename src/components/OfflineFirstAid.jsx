import React, { useState } from 'react';
import { HeartPulse, Droplets, Flame, Wind, ChevronRight, X, Phone, Zap, ShieldCheck } from 'lucide-react';

const OfflineFirstAid = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const guides = [
    {
      id: 'cpr',
      title: 'CPR (Adult)',
      icon: HeartPulse,
      color: 'red',
      steps: [
        'Check the scene for safety and the person for responsiveness.',
        'Call 108 or local emergency services immediately.',
        'Place the heel of one hand in the center of the chest.',
        'Push hard and fast: at least 2 inches deep, 100-120 compressions per minute.',
        'Allow chest to recoil completely between compressions.',
        'Minimize interruptions in compressions.'
      ]
    },
    {
      id: 'bleeding',
      title: 'Severe Bleeding',
      icon: Droplets,
      color: 'blue',
      steps: [
        'Apply firm, steady pressure directly to the wound with a clean cloth.',
        'Do not remove the cloth if it soaks through; add more layers on top.',
        'Maintain pressure until medical help arrives.',
        'If bleeding is from an arm or leg and pressure does not stop it, consider a tourniquet.',
        'Keep the person warm to prevent shock.'
      ]
    },
    {
      id: 'burns',
      title: 'Major Burns',
      icon: Flame,
      color: 'orange',
      steps: [
        'Stop the burning process: Put out flames or remove the person from the source.',
        'Cool the burn with cool (not cold) running water for at least 10-20 minutes.',
        'Do not apply ice, butter, or ointments.',
        'Cover the burn loosely with a sterile dressing or clean plastic wrap.',
        'Treat for shock: Lay the person flat and elevate feet if possible.'
      ]
    },
    {
      id: 'choking',
      title: 'Choking',
      icon: Wind,
      color: 'green',
      steps: [
        'Ask "Are you choking?" and "Can you speak?"',
        'If they can cough or speak, encourage them to keep coughing.',
        'If they cannot breathe, perform 5 back blows between the shoulder blades.',
        'Perform 5 abdominal thrusts (Heimlich maneuver).',
        'Repeat 5 and 5 until the object is forced out or the person becomes unresponsive.'
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border-4 border-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-600 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <ShieldCheck size={12} /> Local Resilience Layer
              </div>
              <h2 className="text-3xl font-black flex items-center gap-3">
                 OFFLINE FIRST-AID <Zap className="text-yellow-300 fill-yellow-300" size={24} />
              </h2>
              <p className="text-red-100 font-bold mt-1">Life-saving manuals stored on your device.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-black/10 hover:bg-black/20 rounded-2xl transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!activeCategory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {guides.map((guide) => (
                <button 
                  key={guide.id}
                  onClick={() => setActiveCategory(guide)}
                  className="flex flex-col items-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-red-100 transition-all group"
                >
                  <div className={`w-16 h-16 rounded-3xl bg-${guide.color}-50 flex items-center justify-center text-${guide.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                    <guide.icon size={32} />
                  </div>
                  <h3 className="font-black text-gray-900 text-xl">{guide.title}</h3>
                  <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                    Emergency Protocol <ChevronRight size={12} />
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setActiveCategory(null)}
                className="text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-6"
              >
                <ChevronRight size={14} className="rotate-180" /> Back to Manuals
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-${activeCategory.color}-50 flex items-center justify-center text-${activeCategory.color}-600`}>
                  <activeCategory.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">{activeCategory.title}</h3>
              </div>

              <div className="space-y-4">
                {activeCategory.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-red-600 border border-red-100 shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 font-bold text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-between">
                <div>
                   <p className="text-red-600 font-black text-sm uppercase">Medical Assistance Required?</p>
                   <p className="text-xs text-red-400 font-bold mt-1 tracking-tight">Tap to broadcast an immediate SOS alert.</p>
                </div>
                <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs shadow-lg shadow-red-200">
                  CALL 108
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
           <Zap size={12} className="fill-gray-400" /> Always call emergency services first
        </div>
      </div>
    </div>
  );
};

export default OfflineFirstAid;
