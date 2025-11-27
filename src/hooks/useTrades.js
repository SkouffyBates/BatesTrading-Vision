import { useState, useEffect } from 'react';

/**
 * Custom hook for managing trades
 * Handles CRUD operations and localStorage persistence
 */
export const useTrades = (initialTrades = []) => {
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem('swing_trades');
    return saved ? JSON.parse(saved) : initialTrades;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('swing_trades', JSON.stringify(trades));
  }, [trades]);

  const addTrade = (trade) => {
    setTrades([...trades, trade]);
  };

  const editTrade = (updatedTrade) => {
    setTrades(trades.map((t) => (t.id === updatedTrade.id ? updatedTrade : t)));
  };

  const deleteTrade = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce trade ?')) {
      setTrades(trades.filter((t) => t.id !== id));
    }
  };

  const getTradesByAccount = (accountId) => {
    if (accountId === 'all') return trades;
    return trades.filter((t) => t.accountId === accountId);
  };

  const getTradesByTimeFilter = (timeFilter) => {
    const now = new Date();
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.openDate);
      if (timeFilter === 'month') {
        return (
          tradeDate.getMonth() === now.getMonth() &&
          tradeDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === 'year') {
        return tradeDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  };

  return {
    trades,
    addTrade,
    editTrade,
    deleteTrade,
    getTradesByAccount,
    getTradesByTimeFilter,
  };
};

export default useTrades;