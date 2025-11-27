import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter } from 'recharts';
import { BarChart2, TrendingUp, Zap } from 'lucide-react';
import CalendarHeatmap from '../Common/CalendarHeatmap';

/**
 * Enhanced Analysis with correlation, drawdown, win/loss ratios + Calendar
 */
const Analysis = ({ trades }) => {
  const setupStats = useMemo(() => {
    const data = {};
    trades.forEach(t => {
      if (!data[t.setup]) {
        data[t.setup] = {
          name: t.setup || 'Autre',
          wins: 0,
          total: 0,
          pnl: 0,
          bestTrade: -Infinity,
          worstTrade: Infinity
        };
      }
      data[t.setup].total += 1;
      data[t.setup].pnl += parseFloat(t.pnl);
      if (t.pnl > 0) data[t.setup].wins += 1;
      if (t.pnl > data[t.setup].bestTrade) data[t.setup].bestTrade = t.pnl;
      if (t.pnl < data[t.setup].worstTrade) data[t.setup].worstTrade = t.pnl;
    });
    return Object.values(data).map(d => ({
      ...d,
      winRate: d.total > 0 ? ((d.wins / d.total) * 100).toFixed(0) : 0
    }));
  }, [trades]);

  const pairStats = useMemo(() => {
    const data = {};
    trades.forEach(t => {
      const pair = t.pair || 'Inconnu';
      if (!data[pair]) {
        data[pair] = {
          name: pair,
          pnl: 0,
          trades: 0,
          wins: 0
        };
      }
      data[pair].pnl += parseFloat(t.pnl);
      data[pair].trades += 1;
      if (t.pnl > 0) data[pair].wins += 1;
    });
    return Object.values(data)
      .map(d => ({
        ...d,
        winRate: d.trades > 0 ? ((d.wins / d.trades) * 100).toFixed(0) : 0
      }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
      .slice(0, 8);
  }, [trades]);

  const directionStats = useMemo(() => {
    const data = {
      'Long': { pnl: 0, trades: 0, wins: 0 },
      'Short': { pnl: 0, trades: 0, wins: 0 }
    };
    trades.forEach(t => {
      if (data[t.direction]) {
        data[t.direction].pnl += parseFloat(t.pnl);
        data[t.direction].trades += 1;
        if (t.pnl > 0) data[t.direction].wins += 1;
      }
    });
    return Object.entries(data).map(([name, stats]) => ({
      name,
      ...stats,
      winRate: stats.trades > 0 ? ((stats.wins / stats.trades) * 100).toFixed(0) : 0
    }));
  }, [trades]);

  // Risk/Reward scatter
  const riskRewardData = useMemo(() => {
    return trades.slice(0, 50).map((t, i) => ({
      x: parseFloat(t.risk) || 0,
      y: parseFloat(t.pnl) || 0,
      name: `Trade ${i + 1}`,
      fill: t.pnl > 0 ? '#10B981' : '#EF4444'
    }));
  }, [trades]);

  // Monthly heatmap data
  const monthlyStats = useMemo(() => {
    const months = {};
    trades.forEach(t => {
      const date = new Date(t.openDate);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!months[key]) {
        months[key] = { month: key, pnl: 0, trades: 0, wins: 0 };
      }
      months[key].pnl += parseFloat(t.pnl);
      months[key].trades += 1;
      if (t.pnl > 0) months[key].wins += 1;
    });
    return Object.values(months).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [trades]);

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="dashboard-section">
        <h2 className="section-title mb-6">Analyse & Statistiques Détaillées</h2>
      </div>

      {/* Calendar Heatmap - RESTORED */}
      <CalendarHeatmap trades={trades} onTradeSelect={(trade) => {
        // Dispatch a global event so App can navigate to Journal and scroll
        try {
          window.dispatchEvent(new CustomEvent('navigateToTrade', { detail: trade.id }));
        } catch (e) {
          // Fallback: try direct scroll if possible
          const element = document.getElementById(`trade-${trade.id}`);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
      }} />

      {/* Direction Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-section">
          <h3 className="section-title mb-6">Performance: Long vs Short</h3>
          <div className="chart-container h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={directionStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" />
                <YAxis dataKey="name" type="category" width={60} stroke="rgba(255,255,255,0.4)" />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="pnl" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                  {directionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="section-title mb-6">Win Rate par Direction</h3>
          <div className="space-y-4">
            {directionStats.map((stat, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-white">{stat.name}</p>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">{stat.trades} trades</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="w-32 bg-slate-700 rounded h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded"
                      style={{ width: `${stat.winRate}%` }}
                    />
                  </div>
                  <span className="font-bold text-white ml-2">{stat.winRate}%</span>
                </div>
                <p className="text-xs text-slate-400">
                  P&L: <span className={stat.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}>${stat.pnl.toFixed(2)}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Setup Performance */}
      <div className="dashboard-section lg:col-span-2">
        <h3 className="section-title mb-6">Performance par Setup</h3>
        <div className="chart-container h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={setupStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" />
              <YAxis dataKey="name" type="category" width={120} stroke="rgba(255,255,255,0.4)" />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                {setupStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pair Analysis */}
      <div className="dashboard-section lg:col-span-2">
        <h3 className="section-title mb-6">Top Instruments (P&L)</h3>
        <div className="chart-container h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pairStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {pairStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance */}
      {monthlyStats.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title mb-6">Performance Mensuelle</h3>
          <div className="chart-container h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="pnl" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Risk/Reward Scatter */}
      {riskRewardData.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title mb-6">Relation Risque/Récompense</h3>
          <div className="chart-container h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="x" name="Risque" stroke="rgba(255,255,255,0.4)" />
                <YAxis dataKey="y" name="P&L" stroke="rgba(255,255,255,0.4)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Trades" data={riskRewardData} fill="#06b6d4">
                  {riskRewardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;