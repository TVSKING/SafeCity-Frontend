import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

const DemoDisclaimer = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-md border border-indigo-100 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 max-w-xl pointer-events-auto overflow-hidden relative group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 opacity-50" />
            
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 shrink-0 relative z-10">
              <Info size={22} strokeWidth={2.5} />
            </div>
            
            <div className="flex flex-col relative z-10">
              <h3 className="font-bold text-indigo-950 text-base leading-tight">Demo Site Notice</h3>
              <p className="text-indigo-800/80 text-sm font-medium mt-0.5">
                This is a <span className="text-indigo-600 font-bold">SafeCity demonstration</span>. All data and profiles are simulated for display purposes only.
              </p>
            </div>

            <button 
              onClick={() => setIsVisible(false)}
              className="ml-4 p-1.5 rounded-lg hover:bg-black/5 text-indigo-400 hover:text-indigo-600 transition-colors relative z-10 shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Progress bar timer */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600/30 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoDisclaimer;
