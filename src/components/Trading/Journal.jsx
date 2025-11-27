import React, { useState, useMemo } from 'react';
import { Plus, Eye, ImageIcon, Pencil, Trash2, List, Grid } from 'lucide-react';

/**
 * Trading Journal - Table & Gallery views
 * Note: Cette version réutilise la logique actuelle du Journal
 */
const Journal = ({ trades, accounts, currentAccountId, onAddTrade, onEditTrade, onDeleteTrade }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const [formData, setFormData] = useState({
    accountId: currentAccountId !== 'all' ? currentAccountId : accounts[0]?.id || '',
    openDate: new Date().toISOString().split('T')[0],
    closeDate: new Date().toISOString().split('T')[0],
    pair: '',
    direction: 'Long',
    positionSize: '',
    setup: '',
    risk: '',
    pnl: '',
    notes: '',
    psychology: 'Calme',
    result: 'Win',
    screenshotBefore: '',
    screenshotAfter: ''
  });

  const openNewTradeModal = () => {
    setFormData({
      accountId: currentAccountId !== 'all' ? currentAccountId : accounts[0]?.id || '',
      openDate: new Date().toISOString().split('T')[0],
      closeDate: new Date().toISOString().split('T')[0],
      pair: '',
      direction: 'Long',
      positionSize: '',
      setup: '',
      risk: '',
      pnl: '',
      notes: '',
      psychology: 'Calme',
      result: 'Win',
      screenshotBefore: '',
      screenshotAfter: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditTradeModal = (trade) => {
    setFormData({
      accountId: trade.accountId || accounts[0].id,
      openDate: trade.openDate,
      closeDate: trade.closeDate || trade.openDate,
      pair: trade.pair,
      direction: trade.direction,
      positionSize: trade.positionSize || '',
      setup: trade.setup,
      risk: trade.risk,
      pnl: trade.pnl,
      notes: trade.notes,
      psychology: trade.psychology,
      result: trade.pnl > 0 ? 'Win' : 'Loss',
      screenshotBefore: trade.screenshotBefore || trade.screenshot || '',
      screenshotAfter: trade.screenshotAfter || ''
    });
    setEditingId(trade.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const riskAmount = parseFloat(formData.risk) || 0;
    const pnlAmount = parseFloat(formData.pnl) || 0;
    const rMultiple = riskAmount > 0 ? (pnlAmount / riskAmount).toFixed(2) : 0;
    const tradeData = {
      ...formData,
      risk: riskAmount,
      pnl: pnlAmount,
      r: rMultiple
    };
    if (editingId) {
      onEditTrade({ ...tradeData, id: editingId });
    } else {
      onAddTrade({ ...tradeData, id: Date.now() });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Journal de Trading</h2>
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'table'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vue Liste"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'gallery'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vue Galerie"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
        <button
          onClick={openNewTradeModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nouveau Trade
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="u-card rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                <tr>
                  <th className="px-4 py-4">Open</th>
                  <th className="px-4 py-4">Market</th>
                  <th className="px-4 py-4">Dir</th>
                  <th className="px-4 py-4">Size</th>
                  <th className="px-4 py-4 text-center">Res</th>
                  <th className="px-4 py-4 text-right">P&L</th>
                  <th className="px-4 py-4 text-center">Shots</th>
                  {currentAccountId === 'all' && <th className="px-4 py-4 text-center">Compte</th>}
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {trades
                  .slice()
                  .reverse()
                  .map((trade) => (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                        {trade.openDate}
                      </td>
                      <td className="px-4 py-4 font-bold text-white">{trade.pair}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            trade.direction === 'Long'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}
                        >
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">
                        {trade.positionSize || '-'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.pnl > 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {trade.pnl > 0 ? 'W' : 'L'}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-4 text-right font-mono font-bold ${
                          trade.pnl > 0
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {trade.pnl > 0 ? '+' : ''}
                        {trade.pnl}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {trade.screenshotBefore ? (
                            <a
                              href={trade.screenshotBefore}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <Eye size={16} />
                            </a>
                          ) : (
                            <span className="w-4"></span>
                          )}
                          {trade.screenshotAfter ? (
                            <a
                              href={trade.screenshotAfter}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <ImageIcon size={16} />
                            </a>
                          ) : (
                            <span className="w-4"></span>
                          )}
                        </div>
                      </td>
                      {currentAccountId === 'all' && (
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs text-slate-500 border border-slate-700 px-2 py-1 rounded">
                            {accounts.find((a) => a.id === trade.accountId)
                              ?.name || 'N/A'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-4 text-center flex justify-center gap-2">
                        <button
                          onClick={() => openEditTradeModal(trade)}
                          className="text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteTrade(trade.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
          {trades
            .slice()
            .reverse()
            .map((trade) => (
              <div
                key={trade.id}
                className="u-card rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-cyan-500/50 transition-colors"
              >
                <div className="h-48 bg-slate-900 relative group">
                  {trade.screenshotBefore || trade.screenshotAfter ? (
                    <img
                      src={
                        trade.screenshotAfter ||
                        trade.screenshotBefore
                      }
                      alt="Chart"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div
                    className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${
                      trade.pnl > 0
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {trade.pnl > 0 ? '+' : ''}
                    {trade.pnl}$
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs text-white">
                    {trade.pair} • {trade.direction}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-lg">
                      {trade.setup || 'Setup Inconnu'}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {trade.openDate}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 italic">
                    "{trade.notes}"
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <div className="flex gap-2">
                      {trade.screenshotBefore && (
                        <a
                          href={trade.screenshotBefore}
                          target="_blank"
                          className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-cyan-400"
                          title="Avant"
                          rel="noreferrer"
                        >
                          <Eye size={16} />
                        </a>
                      )}
                      {trade.screenshotAfter && (
                        <a
                          href={trade.screenshotAfter}
                          target="_blank"
                          className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-purple-400"
                          title="Après"
                          rel="noreferrer"
                        >
                          <ImageIcon size={16} />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditTradeModal(trade)}
                        className="text-slate-500 hover:text-cyan-400"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteTrade(trade.id)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal - Keep existing logic */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-600 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Modifier le Trade' : 'Nouveau Trade'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                Fermer
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 bg-slate-700/30 p-4 rounded-lg border border-slate-600 mb-4">
                <label className="text-sm text-emerald-400 font-bold block mb-2 flex items-center gap-2">
                  Compte de Trading
                </label>
                <select
                  required
                  value={formData.accountId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountId: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-500 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Date Ouverture
                </label>
                <input
                  type="date"
                  required
                  value={formData.openDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openDate: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Date Fermeture
                </label>
                <input
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      closeDate: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Instrument
                </label>
                <input
                  type="text"
                  required
                  placeholder="EURUSD..."
                  value={formData.pair}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pair: e.target.value.toUpperCase()
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">
                    Direction
                  </label>
                  <select
                    value={formData.direction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        direction: e.target.value
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                  >
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Taille</label>
                  <input
                    type="text"
                    placeholder="1.5 Lots"
                    value={formData.positionSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        positionSize: e.target.value
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Setup</label>
                <input
                  type="text"
                  list="setups"
                  placeholder="Breakout..."
                  value={formData.setup}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      setup: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                />
                <datalist id="setups">
                  <option value="Trend Following" />
                  <option value="Breakout" />
                  <option value="Reversal" />
                  <option value="Range" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Risque</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={formData.risk}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        risk: e.target.value
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">
                    P&L Réalisé
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={formData.pnl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pnl: e.target.value
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Screenshot AVANT
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.screenshotBefore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      screenshotBefore: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Screenshot APRÈS
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.screenshotAfter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      screenshotAfter: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Psychologie
                </label>
                <select
                  value={formData.psychology}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      psychology: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                >
                  <option value="Calme">Calme / Discipliné</option>
                  <option value="Anxieux">Anxieux / Hésitant</option>
                  <option value="FOMO">FOMO / Impulsif</option>
                  <option value="Revenge">Revenge / Colère</option>
                  <option value="Confiant">Confiant</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm text-slate-400">Notes</label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none resize-none"
                  placeholder="Analyse..."
                />
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-700">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95"
                >
                  {editingId
                    ? 'Mettre à jour'
                    : 'Enregistrer le Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
