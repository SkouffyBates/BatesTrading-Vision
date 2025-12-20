import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, Activity, Search } from 'lucide-react';
import useEcoNotes from '../../hooks/useEcoNotes';

const IMPACT_COLORS = {
  Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const EcoWatch = () => {
  const { notes, loading, addNote, deleteNote } = useEcoNotes();
  const [formData, setFormData] = useState({
    url: '',
    summary: '',
    impact: 'Medium',
    relatedAssets: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.summary) return;

    const success = await addNote(formData);
    if (success) {
      setFormData({
        url: '',
        summary: '',
        impact: 'Medium',
        relatedAssets: '',
      });
    }
  };

  const formatDate = (timestamp) => {
    // If timestamp is not provided, use current date
    if (!timestamp) return new Date().toLocaleDateString();
    
    // Check if timestamp is a DB date string (YYYY-MM-DD HH:MM:SS) or created_at
    // The DB stores it as 'created_at' but our hook/backend might return it directly.
    // Based on database.js, it returns `created_at` from the SELECT *.
    
    // SQLite default CURRENT_TIMESTAMP is UTC 'YYYY-MM-DD HH:MM:SS'
    // We can try to parse it.
    const date = new Date(timestamp + 'Z'); // Append Z to treat as UTC if it's missing timezone info
    if (isNaN(date.getTime())) {
        // Fallback if parsing fails (e.g. if it's already a local formatted string)
        return timestamp; 
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight brutal-title">
          Veille <span className="text-cyan-400">Économique</span>
        </h2>
        <p className="text-slate-400 mt-2">
          Suivez les actualités et leur impact sur vos actifs.
        </p>
      </header>

      {/* Add Form */}
      <div className="u-card p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={20} className="text-cyan-400" />
          Ajouter une note
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Résumé / Titre</label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="Ex: Inflation US plus haute que prévu..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL (Optionnel)</label>
            <div className="relative">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none pl-10"
                placeholder="https://investing.com/..."
              />
              <ExternalLink size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Impact</label>
              <select
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none appearance-none cursor-pointer"
              >
                <option value="Low" className="bg-slate-900 text-white">Faible (Vert)</option>
                <option value="Medium" className="bg-slate-900 text-white">Moyen (Orange)</option>
                <option value="High" className="bg-slate-900 text-white">Fort (Rouge)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Actifs Liés</label>
              <input
                type="text"
                value={formData.relatedAssets}
                onChange={(e) => setFormData({ ...formData, relatedAssets: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="#EURUSD, #BTC"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-10">
             <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
             <p className="text-slate-500">Chargement...</p>
           </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aucune note pour le moment.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="u-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center group">
               {/* Impact Badge */}
               <div className={`shrink-0 w-2 rounded-full self-stretch md:self-auto md:h-12 ${
                 note.impact === 'High' ? 'bg-red-500' : 
                 note.impact === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
               }`}></div>

               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${IMPACT_COLORS[note.impact]}`}>
                      {note.impact === 'High' ? 'Impact Fort' : note.impact === 'Medium' ? 'Impact Moyen' : 'Impact Faible'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  
                  <h4 className="text-white font-medium text-lg leading-tight mb-2">
                    {note.summary}
                  </h4>

                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    {note.related_assets && (
                      <div className="flex gap-2">
                        {note.related_assets.split(',').map((asset, i) => (
                          <span key={i} className="text-cyan-400 font-mono bg-cyan-950/30 px-1.5 rounded text-xs">
                            {asset.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {note.url && (
                      <a 
                        href={note.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-xs ml-auto"
                      >
                        <ExternalLink size={12} /> Lire l'article
                      </a>
                    )}
                  </div>
               </div>

               <button
                  onClick={() => deleteNote(note.id)}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EcoWatch;
