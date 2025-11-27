import React, { useState } from 'react';
import { AlertTriangle, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const MacroEdge = ({ trades = [], onAddEvent = () => {} }) => {
  const [events, setEvents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ event: '', riskScore: 5, date: new Date().toISOString().split('T')[0], impact: 'medium' });

  const addEvent = () => {
    if (formData.event.trim()) {
      setEvents([...events, { ...formData, id: Date.now() }]);
      setFormData({ event: '', riskScore: 5, date: new Date().toISOString().split('T')[0], impact: 'medium' });
      setShowAddForm(false);
    }
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  // Calculate risk score based on event impacts
  const riskScore = events.length > 0 ? Math.min(100, Math.round((events.reduce((sum, e) => sum + parseInt(e.riskScore), 0) / events.length) * 1.2)) : 5;

  // Find wins and losses on high-risk days
  const highRiskEvents = events.filter((e) => parseInt(e.riskScore) >= 7);
  const tradesOnHighRiskDays = trades.filter((t) => {
    const tradeDate = new Date(t.date).toDateString();
    return highRiskEvents.some((e) => new Date(e.date).toDateString() === tradeDate);
  });

  const highRiskWins = tradesOnHighRiskDays.filter((t) => t.pnl > 0).length;
  const highRiskTotal = tradesOnHighRiskDays.length;
  const highRiskWinRate = highRiskTotal > 0 ? (highRiskWins / highRiskTotal) * 100 : 0;

  const impactColors = {
    low: 'text-emerald-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  const impactBg = {
    low: 'bg-emerald-500/10 border-emerald-500/30',
    medium: 'bg-yellow-500/10 border-yellow-500/30',
    high: 'bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="space-y-6 p-6">
      {/* Risk Gauge */}
      <div className="dashboard-section">
        <h2 className="text-xl font-bold mb-4 text-white">Jauge de Risque Macroéconomique</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Risk Score Circle */}
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={riskScore < 30 ? '#10b981' : riskScore < 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${(riskScore / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{riskScore}</div>
                  <div className="text-xs text-slate-400">Risk Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Événements actifs</span>
                <span className="text-2xl font-bold text-cyan-400">{events.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Événements à risque élevé</span>
                <span className="text-2xl font-bold text-red-400">{highRiskEvents.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taux de Victoires (Haut Risque)</span>
                <span className="text-2xl font-bold text-emerald-400">{formatPercent(highRiskWinRate)}</span>
              </div>
              <div className="mt-2 w-full bg-slate-700 rounded h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${highRiskWinRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Risk Categories */}
          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-400 mb-3">Distribution des Risques</div>
            {['low', 'medium', 'high'].map((level) => {
              const count = events.filter((e) => e.impact === level).length;
              return (
                <div key={level} className="flex items-center justify-between text-sm">
                  <span className={impactColors[level] + ' capitalize font-semibold'}>{level}</span>
                  <div className="flex items-center gap-2 flex-1 ml-3">
                    <div className="flex-1 bg-slate-700 rounded h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          level === 'low' ? 'bg-emerald-500' : level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${events.length > 0 ? (count / events.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-400 text-xs w-6">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="dashboard-section">
          <h3 className="text-lg font-bold mb-4 text-white">Ajouter un Événement Macroéconomique</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Événement</label>
              <input
                type="text"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="Ex: Fed decision, NFP report..."
                className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm outline-none border border-slate-700 focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm outline-none border border-slate-700 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Risk Score (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.riskScore}
                  onChange={(e) => setFormData({ ...formData, riskScore: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm outline-none border border-slate-700 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Impact</label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm outline-none border border-slate-700 focus:border-cyan-500"
                >
                  <option value="low">Bas</option>
                  <option value="medium">Moyen</option>
                  <option value="high">Élevé</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addEvent}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded text-sm transition-colors"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="dashboard-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Événements Macroéconomiques</h3>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
            >
              <Plus size={16} /> Ajouter
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Aucun événement enregistré</p>
          ) : (
            events
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((event) => (
                <div key={event.id} className={`border rounded-lg p-3 ${impactBg[event.impact]}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className={impactColors[event.impact]} />
                        <span className="font-semibold text-white text-sm">{event.event}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 ml-6">
                        {new Date(event.date).toLocaleDateString('fr-FR')} • Risk Score: {event.riskScore}/10
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="dashboard-section">
        <h3 className="text-lg font-bold mb-3 text-white">💡 Conseil Macro</h3>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-slate-300">
          <p>
            Les événements macroéconomiques peuvent créer une volatilité accrue. Surveillez les événements à risque élevé et ajustez votre
            taille de position en conséquence. Considérez des horaires de trading décalés pendant les annonces majeures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MacroEdge;
