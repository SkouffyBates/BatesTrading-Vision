import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle, BarChart2, BookOpen, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { calculateStats, calculateDrawdown, calculateConsecutiveWins, calculateConsecutiveLosses, calculateAvgWin, calculateAvgLoss, calculateRRatio } from '../../utils/calculations';
import Card from '../Common/Card';
import Skeleton from '../Common/Skeleton';
import { useSettings } from '../../hooks/useSettings';

const COLORS = ['#10B981', '#EF4444', '#94a3b8']; // Green, Red, Slate-400 (BE)

/**
 * Enhanced Dashboard with more visual indicators
 */
const Dashboard = ({ trades, accounts, currentAccountId, plan = null }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const { settings } = useSettings();
  const plMode = settings?.plDisplay || 'usd';
  const beThreshold = settings?.beThreshold || 0.3;

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

  const stats = useMemo(() => calculateStats(filteredTrades, accounts, currentAccountId, beThreshold), [filteredTrades, accounts, currentAccountId, beThreshold]);
  const drawdown = useMemo(() => calculateDrawdown(stats.equityCurve), [stats.equityCurve]);
  const consecWins = useMemo(() => calculateConsecutiveWins(filteredTrades), [filteredTrades]);
  const consecLosses = useMemo(() => calculateConsecutiveLosses(filteredTrades), [filteredTrades]);
  const avgWin = useMemo(() => calculateAvgWin(filteredTrades), [filteredTrades]);
  const avgLoss = useMemo(() => calculateAvgLoss(filteredTrades), [filteredTrades]);
  const rRatio = useMemo(() => calculateRRatio(filteredTrades), [filteredTrades]);

  // Calculate plan metrics from trading data
  const planMetrics = useMemo(() => {
    if (!plan) return { routineCompletion: 0, adhérence: 0, objectifProgress: 0 };
    
    // Routine Quotidienne: % of daily tasks completed
    const completed = plan.dailyRoutine?.filter(item => item.done)?.length || 0;
    const total = plan.dailyRoutine?.length || 1;
    const routineCompletion = Math.round((completed / total) * 100);
    
    // Adhérence au Plan: based on trades psychology (avoiding FOMO, Revenge, Anxieux)
    const negativeStates = ['FOMO', 'Revenge', 'Anxieux'];
    const disciplinedTrades = filteredTrades.filter(t => !negativeStates.includes(t.psychology))?.length || 0;
    const adhérence = filteredTrades.length > 0 ? Math.round((disciplinedTrades / filteredTrades.length) * 100) : 0;
    
    // Objectif: extract target from goals text (e.g., "5% de croissance" or "$500")
    let objectifProgress = 0;
    if (plan.goals && stats.totalPnL) {
      // Try to parse a dollar target from goals (e.g., "$500")
      const dollarMatch = plan.goals.match(/\$(\d+)/);
      if (dollarMatch) {
        const target = parseInt(dollarMatch[1]);
        objectifProgress = Math.round((stats.totalPnL / target) * 100);
      }
      // Try to parse a percent target (e.g., "5%")
      const percentMatch = plan.goals.match(/(\d+)%/);
      if (percentMatch && !dollarMatch) {
        const targetPercent = parseInt(percentMatch[1]);
        // If base balance exists, calculate % of account
        const base = parseFloat(stats?.trueCurrentBalance) || 0;
        if (base > 0) {
          const targetAmount = (base * targetPercent) / 100;
          objectifProgress = Math.round((stats.totalPnL / targetAmount) * 100);
        }
      }
    }
    
    return { routineCompletion, adhérence, objectifProgress };
  }, [plan, filteredTrades, stats]);

  const fmt = (amount) => {
    const num = parseFloat(amount) || 0;
    if (plMode === 'percent') {
      const base = parseFloat(stats?.trueCurrentBalance) || 1;
      // Guard against zero or negative base, and NaN results
      if (!base || base <= 0) return '0.00%';
      const pct = (num / base) * 100;
      const result = isNaN(pct) ? 0 : pct;
      return `${result > 0 ? '+' : ''}${result.toFixed(2)}%`;
    }
    const result = isNaN(num) ? 0 : num;
    return `${result > 0 ? '+' : ''}${result.toFixed(2)}`;
  };

  const pieData = [
    { name: 'Gagnants', value: stats.wins },
    { name: 'Perdants', value: stats.losses },
    { name: 'Break Even', value: stats.breakEvens || 0 }
  ];

  // Prepare Equity Curve Data (Normal or Percentage Growth)
  const equityData = useMemo(() => {
    if (plMode !== 'percent') return stats.equityCurve;

    // In percent mode, we want to show Growth % from start
    // Find initial capital (first point)
    const startEquity = stats.equityCurve.length > 0 ? stats.equityCurve[0].equity : 1;
    const safeStart = startEquity === 0 ? 1 : startEquity; // Avoid div by zero

    return stats.equityCurve.map(point => ({
      ...point,
      // Calculate growth percentage: ((Current - Start) / Start) * 100
      equity: ((point.equity - startEquity) / safeStart) * 100
    }));
  }, [stats.equityCurve, plMode]);

  // Monthly P&L breakdown
  const monthlyData = useMemo(() => {
    const months = {};
    filteredTrades.forEach(trade => {
      const date = new Date(trade.openDate);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!months[key]) months[key] = { name: key, pnl: 0 };
      months[key].pnl += parseFloat(trade.pnl);
    });
    const result = Object.values(months).sort((a, b) => new Date(a.name) - new Date(b.name));
    if (plMode === 'percent') {
      const base = parseFloat(stats.trueCurrentBalance) || 1;
      return result.map(r => ({ ...r, pnl: base ? (r.pnl / base) * 100 : 0 }));
    }
    return result;
  }, [filteredTrades, plMode, stats.trueCurrentBalance]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Show skeletons when no trades yet */}
      {(!trades || trades.length === 0) && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="flex-1 h-20 rounded-lg" />
            <Skeleton className="flex-1 h-20 rounded-lg" />
            <Skeleton className="flex-1 h-20 rounded-lg" />
            <Skeleton className="flex-1 h-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
      )}
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
          <Card title="P&L (Période)" value={fmt(stats.totalPnL)} icon={TrendingUp} trend={stats.totalPnL >= 0 ? 'up' : 'down'} />
        </div>
        <div className="stat-card glow-active">
          <Card 
            title="Win Rate" 
            value={`${stats.winRate}%`} 
            subtext={`${stats.wins}W - ${stats.losses}L - ${stats.breakEvens || 0}BE`} 
            icon={CheckCircle} 
            trend={parseFloat(stats.winRate) > 50 ? 'up' : 'down'} 
          />
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
          <Card title="Gain Moyen" value={fmt(avgWin)} subtext={`Perte: ${fmt(Math.abs(parseFloat(avgLoss)))}`} icon={Zap} trend={avgWin > 0 ? 'up' : 'down'} />
        </div>
        <div className="stat-card glow-active">
          <Card title="R-Ratio" value={rRatio} subtext="Cible > 2.0" icon={BarChart2} trend={rRatio > 2 ? 'up' : 'down'} />
        </div>
      </div>

      {/* New Widgets Row - Routine, Adherence, Objectives */}
      <div className="dashboard-grid cols-3">
        <div className="stat-card glow-active">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">📅 Routine Quotidienne</h3>
              <div className="text-emerald-400 text-2xl font-bold mb-1">
                {plan ? `${plan.dailyRoutine?.filter(t => t.done)?.length || 0}/${plan.dailyRoutine?.length || 0}` : 'N/A'}
              </div>
              <p className="text-xs text-slate-500">Tâches complétées</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full" style={{ width: `${planMetrics.routineCompletion}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card glow-active">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">✅ Adhérence au Plan</h3>
              <div className={`text-2xl font-bold mb-1 ${planMetrics.adhérence > 60 ? 'text-emerald-400' : planMetrics.adhérence > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {planMetrics.adhérence}%
              </div>
              <p className="text-xs text-slate-500">Discipline maintenue</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div className={`h-full rounded-full ${
                planMetrics.adhérence > 60 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 
                planMetrics.adhérence > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-orange-500'
              }`} style={{ width: `${Math.min(planMetrics.adhérence, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card glow-active">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">🎯 Objectif</h3>
              <div className="text-cyan-400 text-2xl font-bold mb-1">{fmt(stats.totalPnL)}</div>
              <p className="text-xs text-slate-500">{plan?.goals ? plan.goals.substring(0, 50) : 'Aucun objectif défini'}</p>
            </div>
          </div>
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
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" hide />
                <YAxis stroke="rgba(255,255,255,0.4)" domain={['auto', 'auto']} tickFormatter={(v) => plMode === 'percent' ? `${v.toFixed(0)}%` : v} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', color: '#06b6d4', borderRadius: '8px' }} itemStyle={{ color: '#45E78C' }} formatter={(value) => plMode === 'percent' ? `${value.toFixed(2)}%` : value} />
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
                <YAxis stroke="rgba(255,255,255,0.4)" tickFormatter={(v) => plMode === 'percent' ? `${v.toFixed(0)}%` : v} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} formatter={(value) => plMode === 'percent' ? `${value.toFixed(2)}%` : value} />
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