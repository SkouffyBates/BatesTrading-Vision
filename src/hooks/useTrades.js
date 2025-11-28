import { useState, useEffect } from 'react';

/**
 * Normalize a DB row (snake_case) to app expected camelCase fields
 */
const normalizeTradeRow = (row) => {
  if (!row) return row;
  return {
    id: row.id,
    accountId: row.account_id || row.accountId,
    openDate: row.open_date || row.openDate,
    closeDate: row.close_date || row.closeDate,
    pair: row.pair,
    direction: row.direction,
    positionSize: row.position_size || row.positionSize || row.position_size_text || row.positionSize,
    setup: row.setup,
    risk: row.risk,
    pnl: row.pnl,
    r: row.r,
    notes: row.notes,
    psychology: row.psychology,
    screenshotBefore: row.screenshot_before || row.screenshotBefore || row.screenshot,
    screenshotAfter: row.screenshot_after || row.screenshotAfter,
    createdAt: row.created_at || row.createdAt,
  };
};

/**
 * Custom hook for managing trades with SQLite
 */
export const useTrades = (initialTrades = []) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.db;

  // Helper to load and normalize trades from DB or localStorage
  const loadTradesFromSource = async () => {
    if (isElectron) {
      try {
        const dbTrades = await window.db.getTrades();
        const normalized = (dbTrades || []).map(normalizeTradeRow);
        setTrades(normalized);
        return;
      } catch (error) {
          const toast = window.__addToast;
          toast ? toast('Erreur en chargeant les trades depuis la BDD: ' + (error.message || ''), 'error') : console.error('Error loading trades from DB:', error);
      }
    }

    // Fallback to localStorage or initial
    const saved = localStorage.getItem('swing_trades');
    setTrades(saved ? JSON.parse(saved) : initialTrades);
  };

  // Expose a reload function so parent components can refresh trades after migration/import
  const reloadTrades = async () => {
    await loadTradesFromSource();
  };

  // Load trades on mount
  useEffect(() => {
    (async () => {
      await loadTradesFromSource();
      setLoading(false);
    })();
  }, []);

  const addTrade = async (trade) => {
    if (isElectron) {
      try {
        await window.db.createTrade(trade);
        await loadTradesFromSource();
      } catch (e) {
        const toast = window.__addToast;
        toast ? toast('Erreur lors de la création du trade: ' + (e.message || ''), 'error') : console.error('Error creating trade:', e);
      }
    } else {
      const newTrades = [...trades, trade];
      setTrades(newTrades);
      localStorage.setItem('swing_trades', JSON.stringify(newTrades));
    }
  };

  const editTrade = async (updatedTrade) => {
    if (isElectron) {
      try {
        await window.db.updateTrade(updatedTrade);
        await loadTradesFromSource();
      } catch (e) {
        const toast = window.__addToast;
        toast ? toast('Erreur lors de la mise à jour du trade: ' + (e.message || ''), 'error') : console.error('Error updating trade:', e);
      }
    } else {
      const newTrades = trades.map((t) => (t.id === updatedTrade.id ? updatedTrade : t));
      setTrades(newTrades);
      localStorage.setItem('swing_trades', JSON.stringify(newTrades));
    }
  };

  const deleteTrade = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce trade ?')) return;
    if (isElectron) {
      try {
        await window.db.deleteTrade(id);
        await loadTradesFromSource();
      } catch (e) {
        const toast = window.__addToast;
        toast ? toast('Erreur lors de la suppression du trade: ' + (e.message || ''), 'error') : console.error('Error deleting trade:', e);
      }
    } else {
      const newTrades = trades.filter((t) => t.id !== id);
      setTrades(newTrades);
      localStorage.setItem('swing_trades', JSON.stringify(newTrades));
    }
  };

  const getTradesByAccount = (accountId) => {
    if (accountId === 'all') return trades;
    return trades.filter((t) => t.accountId === accountId);
  };

  const getTradesByTimeFilter = (timeFilter) => {
    const now = new Date();
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.openDate || trade.open_date);
      if (timeFilter === 'month') {
        return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
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
    reloadTrades,
    getTradesByAccount,
    getTradesByTimeFilter,
  };
};

export default useTrades;