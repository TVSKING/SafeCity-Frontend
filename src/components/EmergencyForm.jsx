import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapSelector from './MapSelector';
import AITriage from './AITriage';
import { Send, Phone, User as UserIcon, MessageSquare, AlertTriangle, CheckCircle2, Bot, Image as ImageIcon, Mic, Zap, Languages, Activity, MapPin } from 'lucide-react';

const EmergencyForm = () => {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterPhone: '',
    type: 'Fire',
    description: '',
    location: { lat: 22.3039, lng: 70.8022 },
    mediaUrls: [],
    triageLevel: 3,
    triageResponses: []
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showTriage, setShowTriage] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);
  const [aiClassification, setAiClassification] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Natural Language Triage Logic
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    setFormData({ ...formData, description: text });

    const lowerText = text.toLowerCase();
    let detectedType = formData.type;
    let detectedLevel = formData.triageLevel;

    if (lowerText.includes('fire') || lowerText.includes('smoke') || lowerText.includes('burning')) {
      detectedType = 'Fire';
      detectedLevel = 4;
    } else if (lowerText.includes('accident') || lowerText.includes('crash') || lowerText.includes('hit')) {
      detectedType = 'Accident';
      detectedLevel = 4;
    } else if (lowerText.includes('bleeding') || lowerText.includes('unconscious') || lowerText.includes('heart')) {
      detectedType = 'Medical';
      detectedLevel = 5;
    } else if (lowerText.includes('theft') || lowerText.includes('robbery') || lowerText.includes('fight')) {
      detectedType = 'Crime';
      detectedLevel = 3;
    }

    if (detectedType !== formData.type || detectedLevel !== formData.triageLevel) {
      setFormData(prev => ({ ...prev, type: detectedType, triageLevel: detectedLevel, description: text }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        // Simulate AI Damage Assessment
        setTimeout(() => {
          const assessments = ['Minor Damage', 'Structural Damage', 'Total Collapse'];
          setAiClassification(assessments[Math.floor(Math.random() * assessments.length)]);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setFormData(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, 'voice_note_mock_url'] }));
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        aiAssessment: aiClassification,
        timestamp: new Date().toISOString()
      };
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/create`, dataToSubmit);
      setStatus({ type: 'success', message: 'Report Submitted! Emergency services have been notified.' });
      setFormData({
        reporterName: '',
        reporterPhone: '',
        type: 'Fire',
        description: '',
        location: { lat: 22.3039, lng: 70.8022 },
        mediaUrls: [],
        triageLevel: 3,
        triageResponses: []
      });
      setAiClassification(null);
      setPreviewImage(null);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Submission failed. Please check your data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUseLiveLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude } }));
          setStatus({ type: 'success', message: 'Current Location Detected!' });
          setLoading(false);
          setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        },
        (error) => {
          console.error(error);
          setStatus({ type: 'error', message: 'Could not access location. Please select on map.' });
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setStatus({ type: 'error', message: 'Geolocation is not supported by your browser.' });
    }
  };

  return (
    <div className={`glass p-8 rounded-3xl max-w-4xl mx-auto border-red-100 shadow-2xl relative overflow-hidden transition-all duration-500 ${isLowPower ? 'grayscale invert bg-black' : ''}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-gradient-x"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-left">
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <AlertTriangle className="text-red-600 animate-pulse" />
            Crisis Report
          </h2>
          <p className="text-gray-500 font-medium">Smart Triage & Multimodal Reporting</p>
        </div>
        <button 
          onClick={() => setIsLowPower(!isLowPower)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${isLowPower ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'}`}
        >
          <Zap size={14} /> {isLowPower ? 'NORMAL MODE' : 'LOW POWER SOS'}
        </button>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'} animate-bounce`}>
          {status.type === 'success' ? <CheckCircle2 /> : <AlertTriangle />}
          <span className="font-semibold">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input required type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold" value={formData.reporterName} onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })} />
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input required type="tel" placeholder="+91 ..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold" value={formData.reporterPhone} onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Situation (AI Extraction Enabled)</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                rows="3"
                placeholder="Describe the emergency... (e.g. 'I see fire at the hospital')"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm font-medium"
                value={formData.description}
                onChange={handleDescriptionChange}
              ></textarea>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                <Languages size={10} /> Auto-Translating...
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Emergency Type</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-sm" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="Fire">🔥 Fire</option>
                <option value="Medical">🚑 Medical</option>
                <option value="Crime">🚓 Crime</option>
                <option value="Accident">💥 Accident</option>
              </select>
            </div>
            <div className="relative flex flex-col justify-end">
              <button type="button" onClick={() => setShowTriage(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-xs shadow-lg shadow-blue-100">
                <Bot size={16} /> AI TRIAGE
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
              <label htmlFor="photo-upload" className="w-full py-3 px-4 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-gray-600 font-bold hover:bg-gray-100 transition-all cursor-pointer text-xs border border-dashed border-gray-300">
                {previewImage ? <img src={previewImage} className="w-5 h-5 rounded-md object-cover" /> : <ImageIcon size={18} />}
                {aiClassification ? 'RE-UPLOAD' : 'PHOTO/IMAGE'}
              </label>
            </div>
            <button 
              type="button" 
              onClick={toggleRecording}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-xs border border-dashed ${isRecording ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-50 text-gray-600 border-gray-300'}`}
            >
              <Mic size={18} /> {isRecording ? 'RECORDING...' : 'VOICE NOTE'}
            </button>
          </div>

          {aiClassification && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <Activity className="text-orange-600" />
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase">AI Damage Assessment</p>
                <p className="text-sm font-black text-orange-900">{aiClassification.toUpperCase()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Incident Location</label>
            <button 
              type="button" 
              onClick={handleUseLiveLocation}
              className="flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-all border border-red-100"
            >
              <MapPin size={12} /> USE LIVE LOCATION
            </button>
          </div>
          <div className="rounded-[2rem] overflow-hidden border-2 border-gray-100 shadow-inner h-[280px]">
            <MapSelector location={formData.location} onLocationSelect={(loc) => setFormData({ ...formData, location: { lat: loc.lat, lng: loc.lng } })} />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-red-700 shadow-2xl shadow-red-200 flex flex-col items-center justify-center gap-0 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  REPORT NOW
                </div>
                <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Priority Broadcast Level {formData.triageLevel}</span>
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-4 py-2 opacity-40 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Google_Maps_Logo_2020.svg" className="h-4" alt="Google Maps" />
            <span className="h-4 w-[1px] bg-gray-400"></span>
            <div className="flex items-center gap-1 font-bold text-[10px]">
              <Bot size={12} /> SECURE MERN INFRASTRUCTURE
            </div>
          </div>
        </div>
      </form>

      <AITriage 
        isOpen={showTriage} 
        onClose={() => setShowTriage(false)} 
        onComplete={(level, responses) => {
          setFormData(prev => ({ ...prev, triageLevel: level, triageResponses: responses }));
          setShowTriage(false);
        }} 
      />
    </div>
  );
};

export default EmergencyForm;
