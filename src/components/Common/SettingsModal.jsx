import React, { useState, useEffect } from 'react';
import { ToggleRight, Save, X } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, setSetting } = useSettings();
  const [plMode, setPlMode] = useState(settings?.plDisplay || 'usd');
  const [beThreshold, setBeThreshold] = useState(settings?.beThreshold || '0.3');

  // Sync local state when settings change
  useEffect(() => {
    if (settings?.plDisplay) setPlMode(settings.plDisplay);
    if (settings?.beThreshold) setBeThreshold(settings.beThreshold);
  }, [settings]);

  const save = async () => {
    await setSetting('pl_display', plMode);
    await setSetting('be_threshold', beThreshold);
    const toast = window.__addToast;
    toast && toast('Préférences sauvegardées', 'success');
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not the modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4" onClick={handleBackdropClick}>
      <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md border border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Paramètres</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" title="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Affichage P&L</label>
            <div className="mt-2 flex items-center gap-3">
              <label className={`px-3 py-2 rounded ${plMode === 'usd' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                $ (USD)
              </label>
              <label className={`px-3 py-2 rounded ${plMode === 'percent' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                % (percent of Risk)
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setPlMode('usd')} className={`px-3 py-1 rounded ${plMode === 'usd' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>USD</button>
              <button onClick={() => setPlMode('percent')} className={`px-3 py-1 rounded ${plMode === 'percent' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>%</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Si % : affiché en pourcentage du solde du compte.</p>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <label className="text-sm text-slate-300 block mb-2">Seuil Break Even (BE)</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.3"
                value={beThreshold}
                onChange={(e) => setBeThreshold(e.target.value)}
                className="bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 w-24 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-slate-400 text-sm">% du risque</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Les trades avec un P&L &lt; X% du risque (positif ou négatif) seront BE.<br/>
              <span className="text-orange-400">Attention:</span> C'est le % du RISQUE, pas du compte.<br/>
              Ex: +0.10% sur le compte peut valoir +10% du risque.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200">Annuler</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white flex items-center gap-2"><Save size={14} /> Sauvegarder</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
