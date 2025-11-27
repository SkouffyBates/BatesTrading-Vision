import { useState, useEffect } from 'react';

/**
 * Custom hook for managing trades with SQLite
 */
export const useTrades = (initialTrades = []) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.db;

  // Load trades on mount
  useEffect(() => {
    const loadTrades = async () => {
      if (isElectron) {
        try {
          const dbTrades = await window.db.getTrades();
          setTrades(dbTrades || []);
        } catch (error) {
          console.error('Error loading trades:', error);
          // Fallback to localStorage
          const saved = localStorage.getItem('swing_trades');
          setTrades(saved ? JSON.parse(saved) : initialTrades);
        }
      } else {
        // Browser mode (dev) - use localStorage
        const saved = localStorage.getItem('swing_trades');
        setTrades(saved ? JSON.parse(saved) : initialTrades);
      }
      setLoading(false);
    };

    loadTrades();
  }, []);

  const addTrade = async (trade) => {
    if (isElectron) {
      const updated = await window.db.createTrade(trade);
      setTrades(updated);
    } else {
      const newTrades = [...trades, trade];
      setTrades(newTrades);
      localStorage.setItem('swing_trades', JSON.stringify(newTrades));
    }
  };

  const editTrade = async (updatedTrade) => {
    if (isElectron) {
      const updated = await window.db.updateTrade(updatedTrade);
      setTrades(updated);
    } else {
      const newTrades = trades.map((t) =>
        t.id === updatedTrade.id ? updatedTrade : t
      );
      setTrades(newTrades);
      localStorage.setItem('swing_trades', JSON.stringify(newTrades));
    }
  };

  const deleteTrade = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce trade ?')) {
      if (isElectron) {
        const updated = await window.db.deleteTrade(id);
        setTrades(updated);
      } else {
        const newTrades = trades.filter((t) => t.id !== id);
        setTrades(newTrades);
        localStorage.setItem('swing_trades', JSON.stringify(newTrades));
      }
    }
  };

  const getTradesByAccount = (accountId) => {
    if (accountId === 'all') return trades;
    return trades.filter((t) => t.account_id === accountId || t.accountId === accountId);
  };

  const getTradesByTimeFilter = (timeFilter) => {
    const now = new Date();
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.open_date || trade.openDate);
      if (timeFilter === 'month') {
        return (
          tradeDate.getMonth() === now.getMonth() &&
          tradeDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === 'year') {
        return tradeDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  return {
    trades,
    loading,
    addTrade,
    editTrade,
    deleteTrade,
    getTradesByAccount,
    getTradesByTimeFilter,
  };
};

export default useTrades;