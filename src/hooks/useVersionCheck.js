import { useState, useEffect } from 'react';

const useVersionCheck = () => {
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const appVersion = await window.app.getVersion();
        setCurrentVersion(appVersion);

        const lastRunVersion = await window.db.getSetting('last_run_version');

        if (appVersion !== lastRunVersion) {
          setShowReleaseNotes(true);
          // Update the stored version immediately to avoid showing it again if the user force closes
          // Or we can do it when they close the modal. Let's do it here for safety.
          await window.db.setSetting('last_run_version', appVersion);
        }
      } catch (error) {
        console.error('Error checking version:', error);
      }
    };

    checkVersion();
  }, []);

  return {
    showReleaseNotes,
    setShowReleaseNotes, // Exposed so we can close it
    currentVersion
  };
};

export default useVersionCheck;
