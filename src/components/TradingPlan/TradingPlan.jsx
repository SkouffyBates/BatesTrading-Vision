import React, { useState, useMemo } from 'react';
import { CheckCircle, ScrollText, Plus, Trash2, Flag, Target, TrendingUp } from 'lucide-react';

/**
 * Enhanced Trading Plan with visual tracking and performance metrics
 */
const TradingPlan = ({ plan, setPlan, trades }) => {
  const [newRule, setNewRule] = useState("");

  const toggleRoutine = (id) => {
    const newRoutine = plan.dailyRoutine.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setPlan({ ...plan, dailyRoutine: newRoutine });
  };

  const addRule = (e) => {
    e.preventDefault();
    if (newRule.trim()) {
      setPlan({ ...plan, rules: [...plan.rules, newRule] });
      setNewRule("");
    }
  };

  const deleteRule = (index) => {
    const newRules = plan.rules.filter((_, i) => i !== index);
    setPlan({ ...plan, rules: newRules });
  };

  // Calculate routine completion
  const routineCompletion = useMemo(() => {
    const completed = plan.dailyRoutine.filter(item => item.done).length;
    return Math.round((completed / plan.dailyRoutine.length) * 100);
  }, [plan.dailyRoutine]);

  // Calculate plan adherence from trades
  const planAdherence = useMemo(() => {
    if (trades.length === 0) return 0;
    // Simplified: trades with certain psychology/setup suggest rule adherence
    const disciplined = trades.filter(t => 
      (t.psychology === 'Calme' || t.psychology === 'Confiant') && 
      (t.setup && t.setup !== '')
    ).length;
    return Math.round((disciplined / trades.length) * 100);
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-section">
        <h2 className="section-title flex items-center gap-2">
          <ScrollText className="text-cyan-400" /> Plan de Trading & Discipline
        </h2>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Routine Completion */}
        <div className="dashboard-section p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Flag size={20} className="text-cyan-400" /> Routine Quotidienne
          </h3>
          <div className="text-4xl font-black text-cyan-400 mb-2">{routineCompletion}%</div>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${routineCompletion}%` }}
            />
          </div>
          <p className="text-sm text-slate-400">
            {plan.dailyRoutine.filter(item => item.done).length} / {plan.dailyRoutine.length} complétés
          </p>
        </div>

        {/* Plan Adherence */}
        <div className="dashboard-section p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-emerald-400" /> Adhérence au Plan
          </h3>
          <div className="text-4xl font-black text-emerald-400 mb-2">{planAdherence}%</div>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${planAdherence}%` }}
            />
          </div>
          <p className="text-sm text-slate-400">
            Trades conformes au plan
          </p>
        </div>

        {/* Goals */}
        <div className="dashboard-section p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-yellow-400" /> Objectif
          </h3>
          <p className="text-sm text-slate-300 italic mb-4">"{plan.goals}"</p>
          <button className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-400 px-3 py-2 rounded transition-colors text-sm">
            Éditer l'objectif
          </button>
        </div>
      </div>

      {/* Daily Routine Checklist */}
      <div className="dashboard-section">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="text-emerald-400" /> Routine Quotidienne
        </h3>
        <div className="space-y-3">
          {plan.dailyRoutine.map(item => (
            <div
              key={item.id}
              onClick={() => toggleRoutine(item.id)}
              className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                item.done
                  ? 'bg-emerald-900/30 border-emerald-700 hover:bg-emerald-900/50'
                  : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded border-2 mr-4 flex items-center justify-center transition-all ${
                  item.done
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-400 hover:border-emerald-500'
                }`}
              >
                {item.done && <CheckCircle size={16} className="text-white" />}
              </div>
              <span className={item.done ? 'text-slate-400 line-through' : 'text-white font-medium'}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hard Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-section">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ScrollText className="text-cyan-400" /> Règles (Hard Rules)
          </h3>
          <div className="space-y-2 mb-6">
            {plan.rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-slate-300 bg-slate-900/50 p-3 rounded border-l-4 border-cyan-500 hover:bg-slate-900/80 transition-colors"
              >
                <span className="text-sm">{rule}</span>
                <button
                  onClick={() => deleteRule(idx)}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addRule} className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Nouvelle règle..."
              className="flex-1 bg-white/3 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              className="brutal-btn bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-white px-3 py-2 rounded transition-colors"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>

        {/* Trading Rules Tips */}
        <div className="dashboard-section">
          <h3 className="text-xl font-bold text-white mb-4">Conseils de Règles</h3>
          <div className="space-y-3">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="font-bold text-cyan-400 mb-2">💡 Essentiels</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Définir R:R minimum (ex: 1:2)</li>
                <li>• Max risque par trade (ex: 1%)</li>
                <li>• Éviter les news volatiles</li>
              </ul>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="font-bold text-emerald-400 mb-2">✓ Discipline</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Respecter le plan de trading</li>
                <li>• Pas de revenge trading</li>
                <li>• Revoir hebdomadaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPlan;
