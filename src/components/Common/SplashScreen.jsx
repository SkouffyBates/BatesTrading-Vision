import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [message, setMessage] = useState('Chargement...');

  useEffect(() => {
    let mounted = true;

    const doInit = async () => {
      const start = Date.now();
      try {
        if (window.db && window.db.loadLegacyData) {
          setMessage('Vérification des anciennes données...');
          const legacy = await window.db.loadLegacyData();
          if (legacy && (legacy.trades?.length || legacy.accounts?.length || legacy.macroEvents?.length)) {
            setMessage('Migration des anciennes données...');
            const result = await window.db.migrateFromLocalStorage(legacy);
            setMessage('Migration terminée');
            // Inform user via toast summary if available
            const toast = window.__addToast;
            if (result && toast) {
              toast(`Migration: ${result.accounts.inserted} comptes, ${result.trades.inserted} trades, ${result.macroEvents.inserted} macro events importés.`, 'success', 8000);
            }
          }
        }
      } catch (e) {
        const toast = window.__addToast;
        toast ? toast('Erreur lors de la migration silencieuse: ' + (e.message || ''), 'error') : console.error('Splash migration error:', e);
      }

      const elapsed = Date.now() - start;
      const minMs = 1400;
      const wait = elapsed < minMs ? minMs - elapsed : 0;
      setTimeout(() => {
        if (mounted) onComplete();
      }, wait);
    };

    doInit();
    return () => (mounted = false);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50">
      <div className="w-full max-w-lg p-8 rounded-lg bg-gradient-to-b from-slate-800/60 to-slate-900/80 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg">
            <span className="text-xl font-extrabold text-slate-900">BT</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-semibold">BatesTrading Vision</h1>
            <p className="text-slate-400 text-sm">Votre journal de trading — chargement en cours</p>
          </div>
        </div>

        <div className="mt-6">
          <style>{`
            @keyframes indeterminate {
              0% { left: -40%; width: 40%; }
              50% { left: 20%; width: 60%; }
              100% { left: 100%; width: 80%; }
            }
          `}</style>
          <div className="relative h-2 bg-slate-800 rounded overflow-hidden">
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '-40%' }} className="bg-emerald-400/80 rounded" />
            <div className="absolute top-0 left-0 h-2 bg-emerald-400/80 rounded" style={{ animation: 'indeterminate 1.6s cubic-bezier(.2,.8,.2,1) infinite' }} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-slate-300 text-sm">{message}</div>
            <div className="text-slate-500 text-xs">v1.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
