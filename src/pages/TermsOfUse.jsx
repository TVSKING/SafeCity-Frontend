import React from 'react';
import { FileText, AlertCircle, Scale, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-red-600 p-12 text-white relative">
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <Scale size={160} />
           </div>
           <Link to="/" className="text-red-100 hover:text-white transition-colors flex items-center gap-2 mb-8 font-bold text-xs uppercase tracking-widest">
              <ArrowLeft size={16} /> BACK TO HOME
           </Link>
           <h1 className="text-5xl font-black mb-4">Terms of Use</h1>
           <p className="text-red-100 font-bold text-lg">Guidelines for responsible emergency reporting.</p>
        </div>

        <div className="p-12 space-y-12">
          
          <section className="flex gap-6">
             <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Zero Tolerance for Prank Calls</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  The SafeCity platform is strictly for real emergencies. Submitting false reports or "prank" alerts is a criminal offense under local city laws. We log all device IDs and IP addresses to assist authorities in prosecuting malicious activity.
                </p>
             </div>
          </section>

          <section className="flex gap-6">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <ShieldAlert size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Emergency Response Disclaimer</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  While SafeCity uses ultra-fast dispatch logic, response times depend on local traffic, department availability, and the severity of the crisis. SafeCity is an coordination tool and is not liable for delays caused by physical or logistical constraints.
                </p>
             </div>
          </section>

          <section className="flex gap-6">
             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 shrink-0">
                <FileText size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">User Responsibility</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  By using this app, you agree to provide accurate information and to update your "Safety Pulse" status honestly during city-wide drills or real crises. Misuse of the platform may result in your device being blacklisted from public reporting.
                </p>
             </div>
          </section>

          <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 italic text-gray-500 text-sm font-medium">
             "By clicking 'Report Now' or using the 'Safety Pulse', you acknowledge that you have read and agreed to these terms. Stay safe, stay responsible."
          </div>

          <div className="pt-12 border-t border-gray-100 text-center">
             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">SafeCity Compliance Layer © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
