import { useState, useEffect } from 'react';

/**
 * Custom hook for managing accounts with SQLite
 */
export const useAccounts = (initialAccounts = []) => {
  const [accounts, setAccounts] = useState([]);
  const [currentAccountId, setCurrentAccountId] = useState('all');
  const [loading, setLoading] = useState(true);

  const isElectron = typeof window !== 'undefined' && window.db;

  useEffect(() => {
    const loadAccounts = async () => {
      if (isElectron) {
        try {
          const dbAccounts = await window.db.getAccounts();
          setAccounts(dbAccounts || []);
        } catch (error) {
          console.error('Error loading accounts:', error);
          const saved = localStorage.getItem('swing_accounts');
          setAccounts(saved ? JSON.parse(saved) : initialAccounts);
        }
      } else {
        const saved = localStorage.getItem('swing_accounts');
        setAccounts(saved ? JSON.parse(saved) : initialAccounts);
      }
      setLoading(false);
    };

    loadAccounts();
  }, []);

  const addAccount = async (account) => {
    if (isElectron) {
      const updated = await window.db.createAccount(account);
      setAccounts(updated);
    } else {
      const newAccounts = [...accounts, account];
      setAccounts(newAccounts);
      localStorage.setItem('swing_accounts', JSON.stringify(newAccounts));
    }
  };

  const deleteAccount = async (id) => {
    if (isElectron) {
      const updated = await window.db.deleteAccount(id);
      setAccounts(updated);
    } else {
      const newAccounts = accounts.filter((a) => a.id !== id);
      setAccounts(newAccounts);
      localStorage.setItem('swing_accounts', JSON.stringify(newAccounts));
    }
    if (currentAccountId === id) {
      setCurrentAccountId('all');
    }
  };

  const getCurrentAccount = () => {
    if (currentAccountId === 'all') return null;
    return accounts.find((a) => a.id === currentAccountId);
  };

  const getTotalBalance = () => {
    return accounts.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);
  };

  return {
    accounts,
    currentAccountId,
    setCurrentAccountId,
    addAccount,
    deleteAccount,
    getCurrentAccount,
    getTotalBalance,
    loading,
  };
};

export default useAccounts;