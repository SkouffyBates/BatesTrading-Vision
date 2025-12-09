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

// ✅ Helper: Déterminer si un trade est BE (Break Even)
// Supporte un seuil en % du risque (ex: 3%) OU une valeur fixe (ex: 10$)
export const isBE = (pnl, risk, thresholdPct = 3.0, thresholdFlat = 10.0) => {
  const absPnl = Math.abs(parseFloat(pnl || 0));
  const absRisk = Math.abs(parseFloat(risk || 0));

  // 1. Vérification par valeur fixe (si le PnL est négligeable en valeur absolue)
  // L'utilisateur a mentionné "-10$" comme exemple.
  if (absPnl <= thresholdFlat) return true;

  // 2. Vérification par pourcentage du risque (si le risque est défini)
  if (absRisk > 0) {
    // Handle comma for French locale users (e.g. "0,3")
    let cleanThreshold = thresholdPct;
    if (typeof thresholdPct === 'string') {
      cleanThreshold = thresholdPct.replace(',', '.');
    }
    
    const pct = (absPnl / absRisk) * 100;
    return pct <= parseFloat(cleanThreshold);
  }

  // Si pas de risque défini, seul le seuil fixe s'applique (déjà vérifié ci-dessus)
  return false;
};

export const calculateStats = (trades, accounts, currentAccountId, beThreshold = 0.3) => {
  // Guard against null/undefined inputs
  const safeTrades = Array.isArray(trades) ? trades : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  
  // ✅ CORRECTION: Trier les trades par date de fermeture (closeDate) pour equity curve
  const sortedTrades = [...safeTrades].sort((a, b) => {
    const dateA = new Date(a.closeDate || a.openDate);
    const dateB = new Date(b.closeDate || b.openDate);
    return dateA - dateB; // Ordre chronologique
  });
  
  const totalTrades = sortedTrades.length;
  
  // ✅ CORRECTION: Classifier Win/Loss/BE correctement avec seuil dynamique
  const wins = sortedTrades.filter(t => {
    const pnl = parseFloat(t.pnl || 0);
    const risk = parseFloat(t.risk || 0);
    return pnl > 0 && !isBE(pnl, risk, beThreshold, 10);
  }).length;
  
  const losses = sortedTrades.filter(t => {
    const pnl = parseFloat(t.pnl || 0);
    const risk = parseFloat(t.risk || 0);
    return pnl < 0 && !isBE(pnl, risk, beThreshold, 10);
  }).length;
  
  const breakEvens = sortedTrades.filter(t => {
    const pnl = parseFloat(t.pnl || 0);
    const risk = parseFloat(t.risk || 0);
    return isBE(pnl, risk, beThreshold, 10);
  }).length;
  
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
  const totalPnL = sortedTrades.reduce((acc, curr) => acc + parseFloat(curr.pnl || 0), 0);
  const grossProfit = sortedTrades.filter(t => t.pnl > 0).reduce((acc, t) => acc + parseFloat(t.pnl || 0), 0);
  const grossLoss = Math.abs(sortedTrades.filter(t => t.pnl < 0).reduce((acc, t) => acc + parseFloat(t.pnl || 0), 0));
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? grossProfit : 0) : (grossProfit / grossLoss).toFixed(2);

  let startBalance = 0;
  if (currentAccountId !== 'all') {
    const acc = safeAccounts.find(a => a.id === currentAccountId);
    startBalance = acc ? parseFloat(acc.balance || 0) : 0;
  } else {
    startBalance = safeAccounts.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0);
  }

  // ✅ CORRECTION: Equity curve basée sur les trades TRIÉS par date de fermeture
  let currentEquity = startBalance;
  const equityCurve = sortedTrades.map((t, index) => {
    currentEquity += parseFloat(t.pnl || 0);
    return { name: `T${index + 1}`, equity: currentEquity, date: t.closeDate || t.openDate };
  });

  if (equityCurve.length === 0) {
    equityCurve.push({ name: 'Début', equity: startBalance });
  } else {
    equityCurve.unshift({ name: 'Start', equity: startBalance });
  }

  const allTimePnL = sortedTrades.reduce((acc, curr) => acc + parseFloat(curr.pnl || 0), 0);
  const trueCurrentBalance = (currentAccountId === 'all'
    ? safeAccounts.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0)
    : (safeAccounts.find(a => a.id === currentAccountId)?.balance || 0)) + allTimePnL;

  return {
    winRate,
    totalPnL: isNaN(totalPnL) ? 0 : totalPnL,
    profitFactor: isNaN(profitFactor) ? 0 : profitFactor,
    totalTrades,
    equityCurve,
    wins,
    losses,
    breakEvens, // ✅ Nouveau: nombre de BE
    trueCurrentBalance: isNaN(trueCurrentBalance) ? startBalance : trueCurrentBalance,
    grossProfit: isNaN(grossProfit) ? 0 : grossProfit,
    grossLoss: isNaN(grossLoss) ? 0 : grossLoss
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