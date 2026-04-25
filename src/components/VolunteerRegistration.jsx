import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldCheck, Award, Zap, Heart, CheckCircle2, Bot } from 'lucide-react';

const VolunteerRegistration = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    experienceLevel: 'Beginner'
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const availableSkills = [
    'Medical / First Aid',
    'Search & Rescue',
    'Drone Pilot',
    'Electrician',
    'Driving / Logistics',
    'Communication / Radio',
    'Translation',
    'Heavy Machinery'
  ];

  const handleToggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/collaboration/volunteers/register`, formData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
        onClose();
      }, 3000);
    } catch (err) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all">
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Hero!</h2>
            <p className="text-gray-500 font-medium">Your application is being verified. You will receive a notification when active.</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-100 flex">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
            </div>

            <div className="p-10">
              {step === 1 && (
                <div className="animate-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Join the Network</h2>
                  <p className="text-gray-500 font-medium mb-8">Tell us who you are. Verified volunteers save lives.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                      <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" placeholder="e.g. Alex Johnson" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                      <input type="email" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" placeholder="alex@hero.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <button 
                      disabled={!formData.name || !formData.email}
                      onClick={() => setStep(2)} 
                      className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all mt-6 disabled:opacity-50"
                    >
                      NEXT: SKILL ASSESSMENT
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Skill Assessment</h2>
                  <p className="text-gray-500 font-medium mb-8">Select the fields you are qualified to assist in.</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {availableSkills.map(skill => (
                      <button 
                        key={skill} 
                        onClick={() => handleToggleSkill(skill)}
                        className={`p-4 rounded-xl text-xs font-bold transition-all border-2 ${formData.skills.includes(skill) ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">BACK</button>
                    <button onClick={() => setStep(3)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">NEXT</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Final Verification</h2>
                  <p className="text-gray-500 font-medium mb-8">What is your general experience level?</p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {['Beginner', 'Intermediate', 'Expert'].map(level => (
                      <button 
                        key={level} 
                        onClick={() => setFormData({...formData, experienceLevel: level})}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${formData.experienceLevel === level ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                      >
                        <div className="text-left">
                          <p className="font-black uppercase tracking-widest text-[10px] opacity-60">{level}</p>
                          <p className="font-bold">{level === 'Beginner' ? 'Under 1 year experience' : level === 'Intermediate' ? '1-5 years field experience' : 'Field specialist / Pro'}</p>
                        </div>
                        {formData.experienceLevel === level && <Award />}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">BACK</button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Zap size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                      FINISH REGISTRATION
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerRegistration;
