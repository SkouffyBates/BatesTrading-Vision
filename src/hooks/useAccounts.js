import { useState, useEffect } from 'react';

/**
 * Custom hook for managing trading accounts
 * Handles CRUD operations and localStorage persistence
 */
export const useAccounts = (initialAccounts = []) => {
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('swing_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [currentAccountId, setCurrentAccountId] = useState('all');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('swing_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const addAccount = (account) => {
    setAccounts([...accounts, account]);
  };

  const deleteAccount = (id) => {
    setAccounts(accounts.filter((a) => a.id !== id));
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
  };
};

export default useAccounts;