import React, { useMemo } from 'react';
import { Brain, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Enhanced Psychology module with emotional patterns and trading history
 */
const Psychology = ({ trades }) => {
  const emotionStats = useMemo(() => {
    const data = {};
    trades.forEach(t => {
      if (!data[t.psychology]) data[t.psychology] = { name: t.psychology, count: 0, pnl: 0, wins: 0 };
      data[t.psychology].count += 1;
      data[t.psychology].pnl += parseFloat(t.pnl);
      if (t.pnl > 0) data[t.psychology].wins += 1;
    });
    return Object.values(data);
  }, [trades]);

  const disciplineStats = useMemo(() => {
    if (trades.length === 0) return { score: 0, revengeCount: 0, fomoCount: 0, hasData: false };
    const negativeStates = ['FOMO', 'Revenge', 'Anxieux'];
    const indisciplinedCount = trades.filter(t => negativeStates.includes(t.psychology)).length;
    const revengeCount = trades.filter(t => t.psychology === 'Revenge').length;
    const fomoCount = trades.filter(t => t.psychology === 'FOMO').length;
    const score = Math.round(((trades.length - indisciplinedCount) / trades.length) * 100);
    return { score, revengeCount, fomoCount, hasData: true };
  }, [trades]);

  // Emotional patterns over time
  const emotionalTimeline = useMemo(() => {
    return trades.slice(0, 20).map((t, i) => ({
      name: `T${i + 1}`,
      pnl: parseFloat(t.pnl),
      psychology: t.psychology,
      color: t.pnl > 0 ? '#10B981' : '#EF4444'
    }));
  }, [trades]);

  // Emotion effectiveness breakdown
  const emotionEffectiveness = useMemo(() => {
    return emotionStats.map(stat => ({
      ...stat,
      winRate: stat.count > 0 ? ((stat.wins / stat.count) * 100).toFixed(0) : 0
    }));
  }, [emotionStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-section">
        <h2 className="section-title flex items-center gap-2">
          <Brain className="text-purple-400" /> Module Psychologie du Trading
        </h2>
      </div>

      {/* Discipline Score - Large Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="dashboard-section lg:col-span-1 flex flex-col items-center justify-center text-center">
          <h3 className="section-title mb-6">Score de Discipline</h3>
          {disciplineStats.hasData ? (
            <>
              <div className={`w-48 h-48 rounded-full border-8 flex items-center justify-center mb-6 shadow-lg ${
                disciplineStats.score >= 80 ? 'border-emerald-500 bg-emerald-500/5' : 
                disciplineStats.score >= 50 ? 'border-yellow-500 bg-yellow-500/5' : 
                'border-red-500 bg-red-500/5'
              }`}>
                <span className="text-5xl font-black text-white">{disciplineStats.score}%</span>
              </div>
              <p className={`text-lg font-bold mb-6 ${
                disciplineStats.score >= 80 ? 'text-emerald-400' : 
                disciplineStats.score >= 50 ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {disciplineStats.score >= 80 ? 'Excellent' : disciplineStats.score >= 50 ? 'Bon' : 'À améliorer'}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Brain size={48} className="mb-2 opacity-50" />
              <p>Aucune donnée.</p>
            </div>
          )}
        </div>

        {/* Emotion Stats */}
        <div className="lg:col-span-2 dashboard-section">
          <h3 className="section-title mb-6">Impact Émotionnel sur le P&L</h3>
          <div className="chart-container h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {emotionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Warnings & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-section p-6 rounded-xl border border-red-500/30 bg-red-500/5">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} /> Revenge Trading
          </h3>
          <p className="text-3xl font-black text-white mb-2">{disciplineStats.revengeCount}</p>
          <p className="text-sm text-slate-400">
            {disciplineStats.revengeCount === 0 
              ? 'Excellent ! Aucun revenge trading détecté.' 
              : `Attention : ${disciplineStats.revengeCount} trade(s) de revenge détecté(s). Prendre une pause.`}
          </p>
        </div>

        <div className="dashboard-section p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> FOMO Trading
          </h3>
          <p className="text-3xl font-black text-white mb-2">{disciplineStats.fomoCount}</p>
          <p className="text-sm text-slate-400">
            {disciplineStats.fomoCount === 0 
              ? 'Bon contrôle du FOMO.' 
              : `${disciplineStats.fomoCount} trade(s) par FOMO. Vérifier la stratégie d'entrée.`}
          </p>
        </div>
      </div>

      {/* Emotional Timeline */}
      <div className="dashboard-section">
        <h3 className="section-title mb-6">Timeline Émotionnelle (Derniers Trades)</h3>
        <div className="chart-container h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emotionalTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="pnl" stroke="#06b6d4" strokeWidth={2} dot={(props) => {
                const { cx, cy, payload } = props;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill={payload.color} 
                    stroke={payload.color}
                  />
                );
              }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Effectiveness Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-section">
          <h3 className="section-title mb-6">Efficacité par État Émotionnel</h3>
          <div className="space-y-3">
            {emotionEffectiveness.map((stat, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-white">{stat.name}</p>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">{stat.count} trades</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-48 bg-slate-700 rounded h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded" 
                      style={{ width: `${stat.winRate}%` }}
                    />
                  </div>
                  <span className="font-bold text-white ml-4">{stat.winRate}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  P&L Total: <span className={stat.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}>${stat.pnl.toFixed(2)}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips & Advice */}
        <div className="dashboard-section">
          <h3 className="section-title mb-6">Conseils de Maîtrise Émotionnelle</h3>
          <div className="space-y-3">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="font-bold text-emerald-400 mb-1">✓ Points Forts</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Discipline générale: {disciplineStats.score}%</li>
                <li>• Maintenir cet état émotionnel</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="font-bold text-yellow-400 mb-1">⚠ À Travailler</p>
              <ul className="text-sm text-slate-300 space-y-1">
                {disciplineStats.revengeCount > 0 && <li>• Prendre des pauses après les pertes</li>}
                {disciplineStats.fomoCount > 0 && <li>• Vérifier toutes les entrées vs plan</li>}
                <li>• Tenir un journal quotidien</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Psychology;
