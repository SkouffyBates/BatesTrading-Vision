import { useState, useEffect } from 'react';

/**
 * Custom hook for managing accounts with SQLite
 * CORRECTION: Recharge correctement après création/suppression
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

  // ✅ CORRECTION: Recharger les comptes depuis la DB après création
  const addAccount = async (account) => {
    if (isElectron) {
      try {
        await window.db.createAccount(account);
        // Recharger la liste complète depuis la DB
        const updated = await window.db.getAccounts();
        setAccounts(updated || []);
        console.log('✅ Account created and list refreshed');
      } catch (error) {
        console.error('Error creating account:', error);
        alert('Erreur lors de la création du compte: ' + error.message);
      }
    } else {
      const newAccounts = [...accounts, account];
      setAccounts(newAccounts);
      localStorage.setItem('swing_accounts', JSON.stringify(newAccounts));
    }
  };

  // ✅ CORRECTION: Recharger les comptes depuis la DB après suppression
  const deleteAccount = async (id) => {
    if (isElectron) {
      try {
        await window.db.deleteAccount(id);
        // Recharger la liste complète depuis la DB
        const updated = await window.db.getAccounts();
        setAccounts(updated || []);
        console.log('✅ Account deleted and list refreshed');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Erreur lors de la suppression du compte: ' + error.message);
      }
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