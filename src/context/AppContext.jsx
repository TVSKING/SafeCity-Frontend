import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Disaster Mode State
  const [isDisasterMode, setIsDisasterMode] = useState(
    localStorage.getItem('disasterMode') === 'true'
  );

  // Language State
  const [language, setLanguage] = useState(
    localStorage.getItem('appLanguage') || 'en'
  );

  // Offline Queue for Reports
  const [offlineQueue, setOfflineQueue] = useState(
    JSON.parse(localStorage.getItem('offlineQueue') || '[]')
  );

  useEffect(() => {
    localStorage.setItem('disasterMode', isDisasterMode);
  }, [isDisasterMode]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Sync Offline Queue when internet returns
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online. Syncing offline reports...');
      // Logic to sync reports would go here
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [offlineQueue]);

  const translations = {
    en: {
      emergency_title: 'Emergency Response',
      report_now: 'Report Emergency',
      sos_button: 'ACTIVATE SOS',
      hazard_map: 'Hazard Map',
      address_guard: 'Address Guard',
      first_aid: 'First Aid',
      disaster_mode: 'Disaster Mode (Low Bandwidth)'
    },
    hi: {
      emergency_title: 'आपातकालीन प्रतिक्रिया',
      report_now: 'आपातकाल की रिपोर्ट करें',
      sos_button: 'एसओएस सक्रिय करें',
      hazard_map: 'खतरा मानचित्र',
      address_guard: 'पता गार्ड',
      first_aid: 'प्राथमिक चिकित्सा',
      disaster_mode: 'आपदा मोड (कम बैंडविड्थ)'
    },
    gu: {
      emergency_title: 'કટોકટી પ્રતિભાવ',
      report_now: 'કટોકટીની જાણ કરો',
      sos_button: 'SOS સક્રિય કરો',
      hazard_map: 'જોખમ નકશો',
      address_guard: 'એડ્રેસ ગાર્ડ',
      first_aid: 'પ્રાથમિક સારવાર',
      disaster_mode: 'આપત્તિ મોડ (ઓછી બેન્ડવિડ્થ)'
    }
  };

  const t = (key) => translations[language][key] || key;

  return (
    <AppContext.Provider value={{
      isDisasterMode, setIsDisasterMode,
      language, setLanguage,
      offlineQueue, setOfflineQueue,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
