/**
 * Calculation utilities for trading statistics
 */

export const filterTradesByTime = (trades, timeFilter) => {
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
};

export const calculateStats = (trades, accounts, currentAccountId) => {
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.pnl > 0).length;
  const losses = trades.filter(t => t.pnl <= 0).length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
  const totalPnL = trades.reduce((acc, curr) => acc + parseFloat(curr.pnl), 0);
  const grossProfit = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss).toFixed(2);

  let startBalance = 0;
  if (currentAccountId !== 'all') {
    const acc = accounts.find(a => a.id === currentAccountId);
    startBalance = acc ? parseFloat(acc.balance) : 0;
  } else {
    startBalance = accounts.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);
  }

  let currentEquity = startBalance;
  const equityCurve = trades.map((t, index) => {
    currentEquity += parseFloat(t.pnl);
    return { name: `T${index + 1}`, equity: currentEquity };
  });

  if (equityCurve.length === 0) {
    equityCurve.push({ name: 'Début', equity: startBalance });
  } else {
    equityCurve.unshift({ name: 'Start', equity: startBalance });
  }

  const allTimePnL = trades.reduce((acc, curr) => acc + parseFloat(curr.pnl), 0);
  const trueCurrentBalance = (currentAccountId === 'all'
    ? accounts.reduce((acc, curr) => acc + parseFloat(curr.balance), 0)
    : (accounts.find(a => a.id === currentAccountId)?.balance || 0)) + allTimePnL;

  return {
    winRate,
    totalPnL,
    profitFactor,
    totalTrades,
    equityCurve,
    wins,
    losses,
    trueCurrentBalance,
    grossProfit,
    grossLoss
  };
};

export const calculateDrawdown = (equityCurve) => {
  if (equityCurve.length === 0) return 0;
  let peak = equityCurve[0].equity;
  let maxDrawdown = 0;
  equityCurve.forEach(point => {
    if (point.equity > peak) peak = point.equity;
    const drawdown = ((peak - point.equity) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  return maxDrawdown.toFixed(2);
};

export const calculateConsecutiveWins = (trades) => {
  if (trades.length === 0) return 0;
  let current = 0;
  let max = 0;
  trades.forEach(t => {
    if (t.pnl > 0) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  });
  return max;
};

export const calculateConsecutiveLosses = (trades) => {
  if (trades.length === 0) return 0;
  let current = 0;
  let max = 0;
  trades.forEach(t => {
    if (t.pnl <= 0) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  });
  return max;
};

export const calculateAvgWin = (trades) => {
  const wins = trades.filter(t => t.pnl > 0);
  return wins.length ? (wins.reduce((acc, t) => acc + parseFloat(t.pnl), 0) / wins.length).toFixed(2) : 0;
};

export const calculateAvgLoss = (trades) => {
  const losses = trades.filter(t => t.pnl < 0);
  return losses.length ? (losses.reduce((acc, t) => acc + parseFloat(t.pnl), 0) / losses.length).toFixed(2) : 0;
};

export const calculateRRatio = (trades) => {
  const avgWin = Math.abs(parseFloat(calculateAvgWin(trades)));
  const avgLoss = Math.abs(parseFloat(calculateAvgLoss(trades)));
  return avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 0;
};
