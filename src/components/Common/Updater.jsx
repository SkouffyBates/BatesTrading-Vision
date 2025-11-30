import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const Updater = () => {
  const [available, setAvailable] = useState(false);
  const [progress, setProgress] = useState(null);
  const [info, setInfo] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false); // ✅ NOUVEAU: éviter les checks multiples

  useEffect(() => {
    if (!window.updater) {
      console.log('⚠️ Updater not available (dev mode or not installed)');
      return;
    }

    const unsubAvailable = window.updater.on('update:available', (data) => {
      console.log('✅ Update available:', data);
      setChecking(false); // ✅ CRITIQUE: Arrêter IMMÉDIATEMENT le checking
      setAvailable(true);
      setInfo(data);
      setError(null);
      setHasChecked(true); // ✅ Marquer comme vérifié
      
      // Toast notification (seulement si pas déjà affiché)
      const toast = window.__addToast;
      if (toast && !available) {
        toast(`Nouvelle version ${data.version} disponible !`, 'info', 8000);
      }
    });

    const unsubNot = window.updater.on('update:not-available', (data) => {
      console.log('ℹ️ No update available');
      setChecking(false);
      setAvailable(false);
      setHasChecked(true);
    });

    const unsubProgress = window.updater.on('update:progress', (p) => {
      console.log(`📥 Downloading: ${Math.round(p.percent)}%`);
      setProgress(p);
    });

    const unsubDownloaded = window.updater.on('update:downloaded', (d) => {
      console.log('✅ Update downloaded:', d);
      setProgress(null);
      setDownloaded(true);
      
      const toast = window.__addToast;
      if (toast) {
        toast('Mise à jour téléchargée ! Redémarrez pour installer.', 'success', 10000);
      }
    });

    const unsubError = window.updater.on('update:error', (err) => {
      console.error('❌ Update error:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
      setProgress(null);
      setChecking(false);
      setAvailable(false);
      setHasChecked(true);
      
      const toast = window.__addToast;
      if (toast) {
        toast('Erreur de mise à jour: ' + (err.message || ''), 'error', 5000);
      }
    });

    // ✅ CORRECTION: Ne vérifier qu'UNE SEULE FOIS au démarrage
    const timer = setTimeout(() => {
      if (!hasChecked) {
        console.log('🔍 Auto-checking for updates...');
        setChecking(true);
        window.updater.checkForUpdates().then((result) => {
          console.log('✅ Check initiated:', result);
        }).catch(e => {
          console.log('Check failed (normal in dev):', e);
          setChecking(false);
          setHasChecked(true);
        });
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      try { unsubAvailable(); } catch (e) {}
      try { unsubNot(); } catch (e) {}
      try { unsubProgress(); } catch (e) {}
      try { unsubDownloaded(); } catch (e) {}
      try { unsubError(); } catch (e) {}
    };
  }, [hasChecked, available]);

  const handleDownload = async () => {
    try {
      setError(null);
      await window.updater.downloadUpdate();
    } catch (e) {
      setError('Échec du téléchargement: ' + (e.message || ''));
    }
  };

  const handleInstall = async () => {
    try {
      await window.updater.quitAndInstall();
    } catch (e) {
      setError('Échec de l\'installation: ' + (e.message || ''));
    }
  };

  const handleCheckManually = async () => {
    if (checking) return; // ✅ PROTECTION: Ne pas relancer si déjà en cours
    
    setChecking(true);
    setError(null);
    setAvailable(false);
    try {
      const result = await window.updater.checkForUpdates();
      console.log('✅ Manual check result:', result);
    } catch (e) {
      setError('Vérification échouée: ' + (e.message || ''));
      setChecking(false);
      setHasChecked(true);
    }
  };

  // Ne rien afficher si pas d'update disponible
  if (!available && !error && !checking) return null;

  return (
    <>
      {/* Notification de mise à jour */}
      {(available || checking || error) && (
        <div className="fixed bottom-6 left-6 z-[60] max-w-md">
          <div className="u-card p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl animate-in slide-up">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              {checking ? (
                <RefreshCw size={24} className="text-cyan-400 animate-spin flex-shrink-0 mt-1" />
              ) : error ? (
                <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
              ) : downloaded ? (
                <CheckCircle size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
              ) : (
                <Download size={24} className="text-cyan-400 flex-shrink-0 mt-1" />
              )}
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">
                  {checking ? 'Vérification des mises à jour...' :
                   error ? 'Erreur de mise à jour' :
                   downloaded ? 'Mise à jour prête !' :
                   'Mise à jour disponible'}
                </h3>
                
                {info && (
                  <p className="text-slate-400 text-xs mt-1">
                    Version {info.version}
                    {info.releaseNotes && (
                      <button 
                        onClick={() => setShowNotes(true)}
                        className="ml-2 underline text-cyan-400 hover:text-cyan-300"
                      >
                        Voir les nouveautés
                      </button>
                    )}
                  </p>
                )}
                
                {error && (
                  <p className="text-red-400 text-xs mt-1">{error}</p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Téléchargement en cours...</span>
                  <span>{Math.round(progress.percent || 0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress.percent || 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {progress.transferred ? 
                    `${(progress.transferred / 1024 / 1024).toFixed(1)} MB / ${(progress.total / 1024 / 1024).toFixed(1)} MB` 
                    : 'Calcul...'}
                </p>
              </div>
            )}

            {/* Actions */}
            {!checking && (
              <div className="flex gap-2">
                {!downloaded && !error && !progress && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Télécharger
                  </button>
                )}
                
                {downloaded && (
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-bold transition-colors animate-pulse"
                  >
                    ✨ Installer et redémarrer
                  </button>
                )}
                
                {error && (
                  <button
                    onClick={handleCheckManually}
                    className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Réessayer
                  </button>
                )}
                
                {!downloaded && (
                  <button
                    onClick={() => {
                      setAvailable(false);
                      setError(null);
                    }}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
                  >
                    Plus tard
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal des notes de version */}
      {showNotes && info?.releaseNotes && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowNotes(false)}
        >
          <div 
            className="bg-slate-900 max-w-2xl w-full rounded-xl p-6 border border-slate-700 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Nouveautés</h3>
                <p className="text-sm text-slate-400 mt-1">Version {info.version}</p>
              </div>
              <button 
                onClick={() => setShowNotes(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-slate-200 text-sm leading-relaxed">
              {typeof info.releaseNotes === 'string' ? (
                <div className="whitespace-pre-wrap">{info.releaseNotes}</div>
              ) : (
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(info.releaseNotes, null, 2)}
                </pre>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setShowNotes(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  setShowNotes(false);
                  handleDownload();
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Télécharger la mise à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Updater;