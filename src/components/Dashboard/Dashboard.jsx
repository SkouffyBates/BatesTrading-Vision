import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle, BarChart2, BookOpen, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { calculateStats, calculateDrawdown, calculateConsecutiveWins, calculateConsecutiveLosses, calculateAvgWin, calculateAvgLoss, calculateRRatio } from '../../utils/calculations';
import Card from '../Common/Card';

const COLORS = ['#10B981', '#EF4444'];

/**
 * Enhanced Dashboard with more visual indicators
 */
const Dashboard = ({ trades, accounts, currentAccountId }) => {
  const [timeFilter, setTimeFilter] = useState('all');

  const filteredTrades = useMemo(() => {
    const now = new Date();
    return trades.filter(trade => {
      const tradeDate = new Date(trade.openDate);
      if (timeFilter === 'month') {
        return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
      }
      if (timeFilter === 'year') {
        return tradeDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  }, [trades, timeFilter]);

  const stats = useMemo(() => calculateStats(filteredTrades, accounts, currentAccountId), [filteredTrades, accounts, currentAccountId]);
  const drawdown = useMemo(() => calculateDrawdown(stats.equityCurve), [stats.equityCurve]);
  const consecWins = useMemo(() => calculateConsecutiveWins(filteredTrades), [filteredTrades]);
  const consecLosses = useMemo(() => calculateConsecutiveLosses(filteredTrades), [filteredTrades]);
  const avgWin = useMemo(() => calculateAvgWin(filteredTrades), [filteredTrades]);
  const avgLoss = useMemo(() => calculateAvgLoss(filteredTrades), [filteredTrades]);
  const rRatio = useMemo(() => calculateRRatio(filteredTrades), [filteredTrades]);

  const pieData = [
    { name: 'Gagnants', value: stats.wins },
    { name: 'Perdants', value: stats.losses }
  ];

  // Monthly P&L breakdown
  const monthlyData = useMemo(() => {
    const months = {};
    filteredTrades.forEach(trade => {
      const date = new Date(trade.openDate);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!months[key]) months[key] = { name: key, pnl: 0 };
      months[key].pnl += parseFloat(trade.pnl);
    });
    return Object.values(months).sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [filteredTrades]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header avec filtres */}
      <div className="flex justify-between items-center">
        <div>
          {currentAccountId !== 'all' && (
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-400" /> Solde Actuel: ${stats.trueCurrentBalance.toLocaleString()}
            </h2>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setTimeFilter('month')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeFilter === 'month' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Ce Mois</button>
          <button onClick={() => setTimeFilter('year')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeFilter === 'year' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Cette Année</button>
          <button onClick={() => setTimeFilter('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Tout</button>
        </div>
      </div>

      {/* Stats Grid - Row 1 (Main metrics) */}
      <div className="dashboard-grid cols-4">
        <div className="stat-card glow-active">
          <Card title="P&L (Période)" value={`${stats.totalPnL > 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}`} icon={TrendingUp} trend={stats.totalPnL >= 0 ? 'up' : 'down'} />
        </div>
        <div className="stat-card glow-active">
          <Card title="Win Rate" value={`${stats.winRate}%`} subtext={`${stats.wins}W - ${stats.losses}L`} icon={CheckCircle} trend={parseFloat(stats.winRate) > 50 ? 'up' : 'down'} />
        </div>
        <div className="stat-card glow-active">
          <Card title="Profit Factor" value={stats.profitFactor} subtext="Cible > 1.5" icon={BarChart2} trend="neutral" />
        </div>
        <div className="stat-card glow-active">
          <Card title="Trades" value={stats.totalTrades} subtext={timeFilter === 'all' ? 'Total' : timeFilter === 'month' ? 'Ce mois' : 'Cette année'} icon={BookOpen} trend="neutral" />
        </div>
      </div>

      {/* Stats Grid - Row 2 (Advanced metrics) */}
      <div className="dashboard-grid cols-4">
        <div className="stat-card glow-active">
          <Card title="Drawdown Max" value={`${drawdown}%`} subtext="Cible < 5%" icon={ArrowDownRight} trend={drawdown < 5 ? 'up' : 'down'} />
        </div>
        <div className="stat-card glow-active">
          <Card title="Gains Consec." value={consecWins} subtext={`Pertes: ${consecLosses}`} icon={ArrowUpRight} trend="neutral" />
        </div>
        <div className="stat-card glow-active">
          <Card title="Gain Moyen" value={`$${avgWin}`} subtext={`Perte: $${Math.abs(parseFloat(avgLoss))}`} icon={Zap} trend={avgWin > 0 ? 'up' : 'down'} />
        </div>
        <div className="stat-card glow-active">
          <Card title="R-Ratio" value={rRatio} subtext="Cible > 2.0" icon={BarChart2} trend={rRatio > 2 ? 'up' : 'down'} />
        </div>
      </div>

      <div className="divider-gradient"></div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className="lg:col-span-2 dashboard-section">
          <h3 className="section-title mb-6">Courbe de Capital (Equity Curve)</h3>
          <div className="chart-container h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" hide />
                <YAxis stroke="rgba(255,255,255,0.4)" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', color: '#06b6d4', borderRadius: '8px' }} itemStyle={{ color: '#45E78C' }} />
                <Line type="monotone" dataKey="equity" stroke="#45E78C" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win/Loss Distribution */}
        <div className="dashboard-section flex flex-col items-center justify-center">
          <h3 className="section-title mb-4 w-full text-left">Distribution</h3>
          <div className="chart-container h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly P&L */}
      {monthlyData.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title mb-6">P&L Mensuel</h3>
          <div className="chart-container h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;