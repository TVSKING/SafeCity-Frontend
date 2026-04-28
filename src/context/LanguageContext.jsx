import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    emergency: "EMERGENCY",
    tap_to_report: "Tap to report immediately",
    safety_pulse: "SAFETY PULSE",
    police: "POLICE",
    ambulance: "AMBULANCE",
    fire: "FIRE",
    scan_address: "SCAN AREA",
    offline_manuals: "OFFLINE MANUALS",
    my_status: "MY REPORTS",
    login: "LOGIN",
    register: "REGISTER",
    home: "HOME",
    command_center: "COMMAND CENTER",
    sos_active: "SOS BROADCAST ACTIVE",
    system_directive: "SYSTEM DIRECTIVE",
    hazard_map: "HAZARD MAP",
    language: "LANGUAGE",
    privacy: "PRIVACY",
    terms: "TERMS"
  },
  gu: {
    emergency: "કટોકટી",
    tap_to_report: "તરત જ રિપોર્ટ કરવા માટે દબાવો",
    safety_pulse: "સેફ્ટી પલ્સ",
    police: "પોલીસ",
    ambulance: "એમ્બ્યુલન્સ",
    fire: "ફાયર બ્રિગેડ",
    scan_address: "વિસ્તાર તપાસો",
    offline_manuals: "ઓફલાઇન માહિતી",
    my_status: "મારા રિપોર્ટ",
    login: "લોગિન",
    register: "નોંધણી",
    home: "હોમ",
    command_center: "કમાન્ડ સેન્ટર",
    sos_active: "SOS એલર્ટ ચાલુ છે",
    system_directive: "સિસ્ટમ સૂચના",
    hazard_map: "જોખમ નકશો",
    language: "ભાષા",
    privacy: "ગોપનીયતા",
    terms: "શરતો"
  },
  hi: {
    emergency: "आपातकालीन",
    tap_to_report: "तुरंत रिपोर्ट करने के लिए दबाएं",
    safety_pulse: "सेफ्टी पल्स",
    police: "पुलिस",
    ambulance: "एम्बुलेंस",
    fire: "फायर ब्रिगेड",
    scan_address: "क्षेत्र की जाँच करें",
    offline_manuals: "ऑफलाइन गाइड",
    my_status: "मेरी रिपोर्ट",
    login: "लॉगिन",
    register: "पंजीकरण",
    home: "होम",
    command_center: "कमांड सेंटर",
    sos_active: "SOS अलर्ट सक्रिय है",
    system_directive: "सिस्टम निर्देश",
    hazard_map: "खतरा मानचित्र",
    language: "भाषा",
    privacy: "गोपनीयता",
    terms: "शर्तें"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
