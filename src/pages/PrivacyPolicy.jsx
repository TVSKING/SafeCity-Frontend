import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-gray-900 p-12 text-white relative">
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <ShieldCheck size={160} />
           </div>
           <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-8 font-bold text-xs uppercase tracking-widest">
              <ArrowLeft size={16} /> BACK TO HOME
           </Link>
           <h1 className="text-5xl font-black mb-4">Privacy Policy</h1>
           <p className="text-gray-400 font-bold text-lg">How SafeCity protects your data during emergencies.</p>
        </div>

        <div className="p-12 space-y-12">
          
          <section className="flex gap-6">
             <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                <Lock size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Data Encryption</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  All communication between your device and the SafeCity Command Center is encrypted using military-grade SSL/TLS protocols. Your personal details and live location are never transmitted over insecure channels.
                </p>
             </div>
          </section>

          <section className="flex gap-6">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Globe size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Location Tracking</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  SafeCity only tracks your live location when you explicitly submit an emergency report or use the "Safety Pulse" feature. We do not track your movements in the background unless a crisis broadcast is active in your immediate area.
                </p>
             </div>
          </section>

          <section className="flex gap-6">
             <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                <Server size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Data Retention</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Emergency reports are archived for 30 days for auditing and response analysis. After this period, personal identifiers are redacted to protect your privacy while allowing us to improve city safety analytics.
                </p>
             </div>
          </section>

          <section className="flex gap-6">
             <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                <EyeOff size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Third-Party Sharing</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Your data is shared ONLY with the relevant emergency departments (Police, Fire, Medical) required to handle your specific crisis. We NEVER sell or share citizen data with advertisers or non-emergency commercial entities.
                </p>
             </div>
          </section>

          <div className="pt-12 border-t border-gray-100 text-center">
             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">SafeCity Resilience Infrastructure © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
