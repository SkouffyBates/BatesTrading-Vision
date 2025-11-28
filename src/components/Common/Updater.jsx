import React, { useEffect, useState } from 'react';

const Updater = () => {
  const [available, setAvailable] = useState(false);
  const [progress, setProgress] = useState(null);
  const [info, setInfo] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (!window.updater) return;

    const unsubAvailable = window.updater.on('update:available', (data) => {
      setAvailable(true);
      setInfo(data);
    });
    const unsubNot = window.updater.on('update:not-available', () => {
      // no-op
    });
    const unsubProgress = window.updater.on('update:progress', (p) => setProgress(p));
    const unsubDownloaded = window.updater.on('update:downloaded', (d) => {
      setProgress(null);
      const toast = window.__addToast;
      if (toast) {
        toast('Mise à jour téléchargée. Redémarrer pour installer.', 'info', 8000);
      }
    });

    return () => {
      try { unsubAvailable(); } catch (e) {}
      try { unsubNot(); } catch (e) {}
      try { unsubProgress(); } catch (e) {}
      try { unsubDownloaded(); } catch (e) {}
    };
  }, []);

  if (!available) return null;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-60">
        <div className="u-card p-3 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-white">Nouvelle mise à jour disponible</div>
            <div className="text-xs text-slate-400">{info?.version || ''} {info?.releaseNotes ? <button onClick={() => setShowNotes(true)} className="underline text-slate-300 ml-2 text-xs">Voir notes</button> : null}</div>
            {progress && (
              <div className="text-xs text-slate-400 mt-1">Téléchargement: {Math.round(progress.percent || 0)}%</div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.updater && window.updater.downloadUpdate()}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm"
            >
              Télécharger
            </button>
            <button
              onClick={() => window.updater && window.updater.quitAndInstall()}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm"
            >
              Installer et redémarrer
            </button>
          </div>
        </div>
      </div>

      {showNotes && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 max-w-3xl w-full rounded-lg p-6 border border-slate-700 shadow-xl">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">Notes de version — {info?.version || ''}</h3>
              <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-white">Fermer</button>
            </div>
            <div className="mt-4 text-slate-200 text-sm max-h-80 overflow-y-auto">
              {typeof info?.releaseNotes === 'string' ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{info.releaseNotes}</div>
              ) : (
                <pre className="whitespace-pre-wrap">{JSON.stringify(info?.releaseNotes, null, 2)}</pre>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { window.updater && window.updater.downloadUpdate(); setShowNotes(false); }} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm">Télécharger</button>
              <button onClick={() => { window.updater && window.updater.quitAndInstall(); }} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm">Installer et redémarrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Updater;
