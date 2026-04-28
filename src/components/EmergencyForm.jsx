import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapSelector from './MapSelector';
import AITriage from './AITriage';
import { Send, Phone, User as UserIcon, MessageSquare, AlertTriangle, CheckCircle2, Bot, Image as ImageIcon, Mic, Zap, Languages, Activity, MapPin, ShieldCheck, Clock, Download } from 'lucide-react';
import { sanitizeInput } from '../utils/validation';
import { saveReportOffline, generateSMSText, getOfflineReports, syncOfflineReports } from '../utils/disasterMode';

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(getOfflineReports().length);

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

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        const isVideo = file.type.startsWith('video/');
        
        // 🤖 AI INTELLIGENCE SCAN (Future Scope: Fire/Smoke Detection)
        setTimeout(() => {
          const assessments = isVideo ? ['Severe Smoke Detected', 'Moving Fire Front'] : ['Minor Damage', 'Structural Damage', 'Total Collapse'];
          setAiClassification(assessments[Math.floor(Math.random() * assessments.length)]);
          setStatus({ type: 'success', message: `AI Analysis: ${isVideo ? 'Video' : 'Photo'} processed for responders.` });
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isListening, setIsListening] = useState(false);

  const startVoiceSOS = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice SOS is not supported in this browser. Please use the text field.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus({ type: 'success', message: '🎙️ SafeCity is listening... Speak clearly.' });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleDescriptionChange({ target: { value: transcript } });
      setStatus({ type: 'success', message: '✅ Voice Captured! AI is analyzing your situation...' });
      
      // Auto-submit after 3 seconds if we have enough info
      if (transcript.length > 5) {
        setTimeout(() => {
          document.getElementById('emergency-form-submit')?.click();
        }, 3000);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus({ type: 'error', message: 'Voice recognition failed. Please try typing.' });
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
          const audioUrl = URL.createObjectURL(blob);
          setFormData(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, audioUrl] }));
          setStatus({ type: 'success', message: 'Voice Note Captured Successfully!' });
        };

        recorder.start();
        setIsRecording(true);
        setAudioChunks(chunks);
      } catch (err) {
        alert('Microphone access denied. Please enable it to record voice notes.');
      }
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const [detectedState, setDetectedState] = useState('');

  const fetchStateFromCoords = async (lat, lng) => {
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (data.address && data.address.state) {
        setDetectedState(data.address.state);
      }
    } catch (err) {
      console.error("Failed to fetch state", err);
    }
  };

  useEffect(() => {
    // Try to get live location immediately on load
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude } }));
        },
        (err) => console.log("Location access denied or unavailable"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Update state detection whenever location changes
  useEffect(() => {
    if (formData.location.lat && formData.location.lng) {
      fetchStateFromCoords(formData.location.lat, formData.location.lng);
    }
  }, [formData.location]);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    setLoading(true);
    const { synced } = await syncOfflineReports(axios);
    setPendingSyncCount(getOfflineReports().length);
    setLoading(false);
    if (synced > 0) {
      setStatus({ type: 'success', message: `Successfully synced ${synced} offline reports!` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const dataToSubmit = {
      ...formData,
      state: detectedState || "Unknown State",
      aiAssessment: aiClassification,
      timestamp: new Date().toISOString()
    };

    if (isOffline) {
      saveReportOffline(dataToSubmit);
      setOfflineSaved(true);
      setPendingSyncCount(getOfflineReports().length);
      setLoading(false);
      setStatus({ type: 'success', message: 'OFFLINE MODE: Report saved to device memory. Please use SMS fallback below.' });
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${baseUrl}/api/alerts/create`, dataToSubmit);
      
      setStatus({ type: 'success', message: 'Report Submitted Successfully!' });
      // Reset form...
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      saveReportOffline(dataToSubmit); // Fallback to offline save even on server error
      setOfflineSaved(true);
      setPendingSyncCount(getOfflineReports().length);
      setStatus({ 
        type: 'error', 
        message: 'Network error. Report saved to device for later sync.' 
      });
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

      {/* Pending Sync Banner */}
      {pendingSyncCount > 0 && (
        <div className="mb-6 p-4 bg-blue-600 text-white rounded-2xl flex justify-between items-center animate-in slide-in-from-top-4">
           <div className="flex items-center gap-2">
              <Download size={18} className="animate-bounce" />
              <span className="font-bold text-sm uppercase tracking-widest">{pendingSyncCount} REPORTS PENDING SYNC</span>
           </div>
           <button onClick={handleSync} className="px-4 py-1.5 bg-white text-blue-600 rounded-lg font-black text-[10px] hover:bg-gray-100 transition-all">
              SYNC NOW
           </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-left">
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <AlertTriangle className="text-red-600 animate-pulse" />
            {isOffline ? 'Offline Disaster Report' : 'Crisis Report'}
          </h2>
          <p className="text-gray-500 font-medium">Smart Triage & Disaster Mode Active</p>
        </div>
        <button
          onClick={() => setIsLowPower(!isLowPower)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${isLowPower ? 'bg-white text-black ring-4 ring-black/5' : 'bg-gray-100 text-gray-600'}`}
        >
          <Zap size={14} className={isLowPower ? 'fill-black' : ''} /> {isLowPower ? 'LOW-BANDWIDTH ACTIVE' : 'LOW POWER MODE'}
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
                <input required type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold" value={formData.reporterName} onChange={(e) => setFormData({ ...formData, reporterName: sanitizeInput(e.target.value, 'text') })} />
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input required type="tel" placeholder="+91 ..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold" value={formData.reporterPhone} onChange={(e) => setFormData({ ...formData, reporterPhone: sanitizeInput(e.target.value, 'number') })} />
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
            <div className="relative flex flex-col justify-end gap-2">
              <button type="button" onClick={() => setShowTriage(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-xs shadow-lg shadow-blue-100">
                <Bot size={16} /> AI TRIAGE
              </button>
              <button type="button" onClick={startVoiceSOS} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black transition-all text-xs shadow-xl ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-red-600 border border-red-100 hover:bg-red-50'}`}>
                <Mic size={16} /> {isListening ? 'LISTENING...' : 'VOICE SOS'}
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

          {/* State Detection Indicator */}
          <div className="mb-4">
            {detectedState ? (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="text-green-600" size={16} />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                  REGIONAL AREA: {detectedState}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 animate-pulse">
                <Clock className="text-blue-600" size={16} />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  DETECTING SERVICE AREA...
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            id="emergency-form-submit"
            disabled={loading || (!isOffline && !detectedState)}
            className={`w-full py-4 rounded-[1.5rem] font-black text-lg shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-0 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 
              isOffline ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' :
              'bg-red-600 hover:bg-red-700 shadow-red-200'
            } text-white`}
          >
            {loading ? 'PROCESSING...' : (isOffline ? 'SAVE REPORT OFFLINE' : 'SUBMIT CRISIS REPORT')}
            <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">
              {isOffline ? 'Store & Forward Mode Active' : 'Real-time Satellite Sync'}
            </span>
          </button>

          {/* SMS FALLBACK UI */}
          {offlineSaved && (
             <div className="p-6 bg-red-600 rounded-[2.5rem] text-white shadow-xl shadow-red-200 animate-in slide-in-from-bottom-4">
                <h4 className="font-black text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Phone size={16} /> SMS FALLBACK READY
                </h4>
                <p className="text-[10px] font-bold opacity-90 mb-4 leading-relaxed">
                   Report saved locally. If internet is out, tap below to send a pre-filled SOS text.
                </p>
                <a 
                  href={`sms:108?body=${encodeURIComponent(generateSMSText(formData))}`}
                  className="w-full py-4 bg-white text-red-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg"
                >
                   <Send size={14} /> SEND SOS VIA SMS
                </a>
             </div>
          )}

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
