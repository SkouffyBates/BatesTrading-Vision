import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Migration Helper Component
 * Automatically migrates data from localStorage to SQLite
 */
const MigrationHelper = ({ onComplete }) => {
  const [status, setStatus] = useState('checking'); // checking, migrating, complete, error
  const [message, setMessage] = useState('Vérification des données...');

  useEffect(() => {
    const checkAndMigrate = async () => {
      // Check if running in Electron
      if (!window.db) {
        setStatus('complete');
        onComplete();
        return;
      }

      // First, try to load from localStorage (current browser storage)
      let hasLocalStorageData =
        localStorage.getItem('swing_trades') ||
        localStorage.getItem('swing_accounts') ||
        localStorage.getItem('swing_plan') ||
        localStorage.getItem('swing_macro_events');

      // If no localStorage data, try to load from old app data folder via IPC
      if (!hasLocalStorageData) {
        try {
          setStatus('checking');
          setMessage('Recherche de données anciennes...');
          const oldData = await window.db.loadLegacyData?.();
          
          if (oldData && (oldData.trades?.length > 0 || oldData.accounts?.length > 0)) {
            // Set migration data from old app folder
            const migrationData = oldData;
            
            try {
              setStatus('migrating');
              setMessage('Migration des anciennes données vers SQLite...');

              await window.db.migrateFromLocalStorage(migrationData);

              setStatus('complete');
              setMessage('Migration de l\'ancien dossier terminée !');
              setTimeout(onComplete, 2000);
              return;
            } catch (error) {
              console.error('Migration error:', error);
              setStatus('error');
              setMessage(`Erreur de migration: ${error.message}`);
              return;
            }
          }
        } catch (error) {
          console.log('No legacy data found or error reading it:', error);
        }

        // No data found anywhere
        setStatus('complete');
        setMessage('Aucune donnée à migrer');
        setTimeout(onComplete, 1000);
        return;
      }

      // Prepare migration data from localStorage
      const migrationData = {
        trades: localStorage.getItem('swing_trades')
          ? JSON.parse(localStorage.getItem('swing_trades'))
          : [],
        accounts: localStorage.getItem('swing_accounts')
          ? JSON.parse(localStorage.getItem('swing_accounts'))
          : [],
        plan: localStorage.getItem('swing_plan')
          ? JSON.parse(localStorage.getItem('swing_plan'))
          : null,
        macroEvents: localStorage.getItem('swing_macro_events')
          ? JSON.parse(localStorage.getItem('swing_macro_events'))
          : [],
      };

      // Migrate
      try {
        setStatus('migrating');
        setMessage('Migration des données vers SQLite...');

        await window.db.migrateFromLocalStorage(migrationData);

        setStatus('complete');
        setMessage('Migration terminée avec succès !');

        // Clear localStorage after successful migration
        localStorage.removeItem('swing_trades');
        localStorage.removeItem('swing_accounts');
        localStorage.removeItem('swing_plan');
        localStorage.removeItem('swing_macro_events');

        setTimeout(onComplete, 2000);
      } catch (error) {
        console.error('Migration error:', error);
        setStatus('error');
        setMessage(`Erreur de migration: ${error.message}`);
      }
    };

    checkAndMigrate();
  }, []);

  if (status === 'complete' && message === 'Aucune donnée à migrer') {
    return null; // Don't show anything
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="u-card rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          {status === 'checking' && (
            <>
              <Database size={64} className="text-cyan-400 animate-pulse mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Vérification...
              </h2>
              <p className="text-slate-400">{message}</p>
            </>
          )}

          {status === 'migrating' && (
            <>
              <Database
                size={64}
                className="text-cyan-400 mb-4 animate-spin"
                style={{ animationDuration: '3s' }}
              />
              <h2 className="text-2xl font-bold text-white mb-2">Migration</h2>
              <p className="text-slate-400">{message}</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full animate-pulse"
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {status === 'complete' && (
            <>
              <CheckCircle size={64} className="text-emerald-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Terminé !</h2>
              <p className="text-slate-400">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle size={64} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
              <p className="text-red-400">{message}</p>
              <button
                onClick={onComplete}
                className="mt-6 brutal-btn bg-red-600 hover:bg-red-700"
              >
                Continuer quand même
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationHelper;