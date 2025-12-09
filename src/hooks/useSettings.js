import React, { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    plDisplay: 'usd', // 'usd' or 'percent'
    beThreshold: '0.3', // % of risk to consider Break Even
  });

  const loadSettings = async () => {
    try {
      if (window.db && window.db.getSetting) {
        const pl = await window.db.getSetting('pl_display');
        const be = await window.db.getSetting('be_threshold');
        setSettings((s) => ({
          ...s,
          plDisplay: pl || 'usd',
          beThreshold: be || '0.3'
        }));
        return;
      }
    } catch (e) {
      console.error('Error loading settings from DB', e);
    }

    // fallback localStorage
    const plLocal = localStorage.getItem('pl_display');
    const beLocal = localStorage.getItem('be_threshold');
    
    setSettings((s) => ({
      ...s,
      plDisplay: plLocal || s.plDisplay,
      beThreshold: beLocal || s.beThreshold
    }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const setSetting = async (key, value) => {
    try {
      if (window.db && window.db.setSetting) {
        await window.db.setSetting(key, value);
      } else {
        localStorage.setItem(key, value);
      }
      
      let stateKey = key;
      if (key === 'pl_display') stateKey = 'plDisplay';
      if (key === 'be_threshold') stateKey = 'beThreshold';
      
      setSettings((s) => ({ ...s, [stateKey]: value }));
      return true;
    } catch (e) {
      console.error('Error saving setting', e);
      return false;
    }
  };

  return React.createElement(SettingsContext.Provider, { value: { settings, setSetting } }, children);
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export default useSettings;
