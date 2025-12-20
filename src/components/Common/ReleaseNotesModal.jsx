import React from 'react';
import { X, Gift, Sparkles, Wrench } from 'lucide-react';
import { RELEASE_NOTES } from '../../data/releaseNotes';

const ReleaseNotesModal = ({ isOpen, onClose, version }) => {
  if (!isOpen) return null;

  // Find the note for the current version, or default to the latest one
  const currentNote = RELEASE_NOTES.find(n => n.version === version) || RELEASE_NOTES[0];
  const otherNotes = RELEASE_NOTES.filter(n => n.version !== currentNote.version);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Header with decorative background */}
        <div className="relative p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Gift size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase mb-3">
              <Sparkles size={12} /> Nouveautés
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Mise à jour {currentNote.version} installée !
            </h2>
            <p className="text-slate-400 text-sm">
              Découvrez les dernières améliorations de BatesTrading Vision.
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors z-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Main Release Note */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span> {currentNote.title}
              </h3>
              
              <div className="space-y-3">
                {currentNote.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="mt-1 min-w-[20px]">{feature.startsWith('✨') ? '✨' : '🔹'}</div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {feature.replace(/^[✨🔹]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {currentNote.fixes && currentNote.fixes.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <Wrench size={14} /> Corrections & Améliorations
                </h4>
                <ul className="space-y-2">
                  {currentNote.fixes.map((fix, i) => (
                    <li key={i} className="text-slate-400 text-sm flex items-start gap-2 pl-2 border-l-2 border-slate-700">
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Previous Releases (Collapsed or Small) */}
          {otherNotes.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Versions Précédentes</h4>
              <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
                {otherNotes.slice(0, 2).map((note) => (
                  <div key={note.version}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">v{note.version}</span>
                      <span className="text-slate-500 text-xs">• {note.date}</span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-1">{note.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
          >
            Super, merci !
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReleaseNotesModal;
