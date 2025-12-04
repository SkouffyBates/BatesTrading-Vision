import React, { useState } from 'react';
import { Trash2, Plus, Briefcase, Edit, Save, X } from 'lucide-react';

/**
 * Account Management Modal
 * Create and manage trading accounts
 */
const AccountModal = ({ isOpen, onClose, accounts, onAddAccount, onDeleteAccount, onUpdateAccountName }) => {
  const [newAccountData, setNewAccountData] = useState({ name: '', balance: '' });
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newAccountData.name && newAccountData.balance) {
      onAddAccount({
        id: `acc_${Date.now()}`,
        name: newAccountData.name,
        balance: parseFloat(newAccountData.balance),
        currency: '$',
      });
      setNewAccountData({ name: '', balance: '' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      onDeleteAccount(id);
    }
  };

  const handleEditClick = (account) => {
    setEditingAccountId(account.id);
    setEditingName(account.name);
  };

  const handleSaveClick = (accountId) => {
    if (editingName.trim()) {
      onUpdateAccountName(accountId, editingName.trim());
      setEditingAccountId(null);
      setEditingName('');
    }
  };

  const handleCancelClick = () => {
    setEditingAccountId(null);
    setEditingName('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="u-card rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-cyan-400" />
            Mes Comptes
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Accounts List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {accounts.length === 0 ? (
              <p className="text-center text-slate-500 py-4">
                Aucun compte. Créez-en un ci-dessous.
              </p>
            ) : (
              accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex justify-between items-center u-card p-3 rounded"
                >
                  {editingAccountId === acc.id ? (
                    // ----- Edit Mode -----
                    <div className="flex-grow flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full bg-white/10 border border-cyan-500 rounded px-2 py-1 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                        autoFocus
                      />
                      <button onClick={() => handleSaveClick(acc.id)} className="text-green-400 hover:text-green-300 p-1"><Save size={16} /></button>
                      <button onClick={handleCancelClick} className="text-red-400 hover:text-red-300 p-1"><X size={16} /></button>
                    </div>
                  ) : (
                    // ----- View Mode -----
                    <>
                      <div>
                        <p className="font-bold text-white text-sm">{acc.name}</p>
                        <p className="text-xs text-slate-400">
                          Départ: {acc.balance.toLocaleString()} {acc.currency}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleEditClick(acc)}
                          className="text-slate-500 hover:text-cyan-400 p-1 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Account Form */}
          <form onSubmit={handleSubmit} className="border-t border-white/10 pt-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase">
              Ajouter un compte
            </h4>

            <input
              type="text"
              placeholder="Nom (ex: FTMO 120k)"
              value={newAccountData.name}
              onChange={(e) =>
                setNewAccountData({ ...newAccountData, name: e.target.value })
              }
              className="w-full bg-white/3 border border-white/10 rounded p-2 text-white text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              required
            />

            <input
              type="number"
              placeholder="Solde Initial (ex: 120000)"
              value={newAccountData.balance}
              onChange={(e) =>
                setNewAccountData({ ...newAccountData, balance: e.target.value })
              }
              className="w-full bg-white/3 border border-white/10 rounded p-2 text-white text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              required
            />

            <button
              type="submit"
              className="w-full brutal-btn bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-cyan-500/30 text-white py-2 rounded font-bold text-sm transition-colors border border-cyan-500/30 hover:border-cyan-500/50 flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Créer le compte
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;