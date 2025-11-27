import React, { useState } from 'react';
import { Globe, Trash2, Plus, Zap, ArrowRight } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import RiskGauge from '../Common/RiskGauge';

/**
 * MacroEdge - Economic Calendar & Sentiment Analyzer
 * Refactored to use props from parent hook
 */
const MacroEdge = ({ events, onAddEvent, onDeleteEvent, riskScore }) => {
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0],
    event: '',
    category: 'Employment',
    actual: '',
    forecast: '',
    previous: '',
    impact: 'High',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newEvent.event.trim()) {
      onAddEvent(newEvent);
      setNewEvent({
        ...newEvent,
        event: '',
        actual: '',
        forecast: '',
        previous: '',
      });
    }
  };

  // Historical score data (simplified)
  const historyData = events
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((e, i) => ({
      name: e.date.substring(5),
      score: 50 + (i % 2 === 0 ? 5 : -5), // Placeholder
    }));

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="text-cyan-400" /> MacroEdge Pro
          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/40">
            Sentiment Analyzer
          </span>
        </h2>
      </div>

      {/* Risk Gauge & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Gauge */}
        <div className="u-card p-6 rounded-xl flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 w-full text-left">
            Sentiment Macro US
          </h3>
          <RiskGauge score={riskScore} />
          <div className="w-full mt-6 u-card p-4 rounded-lg">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" /> Impact sur Trading
            </h4>
            <ul className="text-sm space-y-2 text-slate-300">
              {riskScore > 60 ? (
                <>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-emerald-500" />
                    <strong>USD:</strong> Faible / Vente
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-emerald-500" />
                    <strong>Indices:</strong> Achat
                  </li>
                </>
              ) : riskScore < 40 ? (
                <>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-red-500" />
                    <strong>USD:</strong> Fort (Safe Haven)
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-red-500" />
                    <strong>Indices:</strong> Pression baissière
                  </li>
                </>
              ) : (
                <li className="text-yellow-500 italic">Marché en range.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Events Table */}
        <div className="lg:col-span-2 u-card p-6 rounded-xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
            Derniers Indicateurs
          </h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-slate-300 text-sm">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Actual</th>
                  <th className="px-4 py-3">Forecast</th>
                  <th className="px-4 py-3 text-center">Surprise</th>
                  <th className="px-4 py-3 text-center">Impact</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {events
                  .slice()
                  .reverse()
                  .map((e) => {
                    const surprise = parseFloat(e.actual) - parseFloat(e.forecast);
                    const isPositiveSurprise = surprise > 0;
                    let colorClass = 'text-emerald-400';

                    if (
                      e.category === 'Inflation' ||
                      (e.category === 'Employment' &&
                        e.event.includes('Unemployment')) ||
                      e.category === 'Central Bank'
                    ) {
                      colorClass = isPositiveSurprise
                        ? 'text-red-400'
                        : 'text-emerald-400';
                    } else {
                      colorClass = isPositiveSurprise
                        ? 'text-emerald-400'
                        : 'text-red-400';
                    }

                    return (
                      <tr key={e.id} className="hover:bg-slate-700/30">
                        <td className="px-4 py-3 whitespace-nowrap">{e.date}</td>
                        <td className="px-4 py-3 font-medium text-white">
                          {e.event}
                        </td>
                        <td className="px-4 py-3 font-mono">{e.actual}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {e.forecast}
                        </td>
                        <td
                          className={`px-4 py-3 text-center font-bold ${colorClass}`}
                        >
                          {surprise > 0 ? '+' : ''}
                          {surprise.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded border ${
                              e.impact === 'High'
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            }`}
                          >
                            {e.impact}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onDeleteEvent(e.id)}
                            className="text-slate-600 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Form & History Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Event Form */}
        <div className="u-card p-6 rounded-xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
            Ajouter Donnée Éco
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Event</label>
              <input
                type="text"
                list="macroEvents"
                required
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                value={newEvent.event}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, event: e.target.value })
                }
                placeholder="Rechercher..."
              />
              <datalist id="macroEvents">
                <option value="PPI m/m (Prix Producteurs)" />
                <option value="Core PPI m/m" />
                <option value="CPI m/m (Prix Conso)" />
                <option value="CPI y/y" />
                <option value="Core CPI m/m" />
                <option value="Unemployment Claims" />
                <option value="Unemployment Rate" />
                <option value="Non-Farm Employment Change (NFP)" />
                <option value="Retail Sales m/m" />
                <option value="ISM Manufacturing PMI" />
                <option value="Federal Funds Rate" />
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Catégorie</label>
                <select
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                  value={newEvent.category}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, category: e.target.value })
                  }
                >
                  <option value="Inflation">Inflation (CPI/PPI)</option>
                  <option value="Employment">Emploi (NFP/Jobs)</option>
                  <option value="Growth">Croissance (GDP/ISM)</option>
                  <option value="Confidence">Confiance (UoM/CB)</option>
                  <option value="Central Bank">Banque Centrale (Fed)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500">Actual</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm font-mono"
                  value={newEvent.actual}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, actual: e.target.value })
                  }
                  placeholder="Act."
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Forecast</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm font-mono"
                  value={newEvent.forecast}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, forecast: e.target.value })
                  }
                  placeholder="Frcst"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Previous</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm font-mono"
                  value={newEvent.previous}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, previous: e.target.value })
                  }
                  placeholder="Prev"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500">Impact</label>
              <select
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                value={newEvent.impact}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, impact: e.target.value })
                }
              >
                <option value="High">Haut (Rouge)</option>
                <option value="Medium">Moyen (Orange)</option>
                <option value="Low">Faible (Jaune)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full brutal-btn bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-cyan-500/30 text-white font-bold py-2 rounded text-sm mt-2 flex items-center justify-center gap-2 border border-cyan-500/30 hover:border-cyan-500/50"
            >
              <Plus size={16} /> Ajouter Donnée
            </button>
          </form>
        </div>

        {/* History Graph */}
        <div className="lg:col-span-2 u-card p-6 rounded-xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
            Historique Score Risk (12 Mois)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f1f5f9',
                  }}
                />
                <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroEdge;