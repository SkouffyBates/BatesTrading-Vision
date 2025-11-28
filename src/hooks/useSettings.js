import React, { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    plDisplay: 'usd', // 'usd' or 'percent'
  });

  const loadSettings = async () => {
    try {
      if (window.db && window.db.getSetting) {
        const pl = await window.db.getSetting('pl_display');
        if (pl) setSettings((s) => ({ ...s, plDisplay: pl }));
        return;
      }
    } catch (e) {
      console.error('Error loading settings from DB', e);
    }

    // fallback localStorage
    const plLocal = localStorage.getItem('pl_display');
    if (plLocal) setSettings((s) => ({ ...s, plDisplay: plLocal }));
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
      setSettings((s) => ({ ...s, [key === 'pl_display' ? 'plDisplay' : key]: value }));
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
