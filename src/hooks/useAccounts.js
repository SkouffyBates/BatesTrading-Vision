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
            const toast = window.__addToast;
            toast ? toast('Erreur en chargeant les comptes: ' + (error.message || ''), 'error') : console.error('Error loading accounts:', error);
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
        const toast = window.__addToast;
        toast ? toast('Erreur lors de la création du compte: ' + (error.message || ''), 'error') : console.error('Error creating account:', error);
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
        const toast = window.__addToast;
        toast ? toast('Erreur lors de la suppression du compte: ' + (error.message || ''), 'error') : console.error('Error deleting account:', error);
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

  const updateAccountName = async (accountId, newName) => {
    if (isElectron) {
      try {
        await window.db.updateAccountName(accountId, newName);
        // Mettre à jour l'état local pour un feedback immédiat
        setAccounts(prevAccounts =>
          prevAccounts.map(account =>
            account.id === accountId ? { ...account, name: newName } : account
          )
        );
        console.log('✅ Account name updated');
      } catch (error) {
        const toast = window.__addToast;
        toast ? toast('Erreur lors du renommage du compte: ' + (error.message || ''), 'error') : console.error('Error updating account name:', error);
      }
    } else {
      // Fallback pour le navigateur
      const newAccounts = accounts.map(account =>
        account.id === accountId ? { ...account, name: newName } : account
      );
      setAccounts(newAccounts);
      localStorage.setItem('swing_accounts', JSON.stringify(newAccounts));
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
    updateAccountName,
    getCurrentAccount,
    getTotalBalance,
    loading,
  };
};

export default useAccounts;