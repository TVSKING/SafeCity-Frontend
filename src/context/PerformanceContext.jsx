import React, { createContext, useContext, useState, useEffect } from 'react';

const PerformanceContext = createContext();

export const PerformanceProvider = ({ children }) => {
  const [isLowPower, setIsLowPower] = useState(localStorage.getItem('lowPowerMode') === 'true');
  const [dataThrottling, setDataThrottling] = useState(false);

  useEffect(() => {
    localStorage.setItem('lowPowerMode', isLowPower);
    if (isLowPower) {
      document.body.classList.add('low-power-active');
      setDataThrottling(true);
    } else {
      document.body.classList.remove('low-power-active');
      setDataThrottling(false);
    }
  }, [isLowPower]);

  // Battery API Integration
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const handleBatteryChange = () => {
          if (battery.level < 0.2 && !battery.charging) {
            setIsLowPower(true);
            console.log('⚡ AUTO-SWITCH: Low battery detected. Activating Energy Shield.');
          }
        };
        battery.addEventListener('levelchange', handleBatteryChange);
        handleBatteryChange();
        return () => battery.removeEventListener('levelchange', handleBatteryChange);
      });
    }
  }, []);

  return (
    <PerformanceContext.Provider value={{ isLowPower, setIsLowPower, dataThrottling }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);
