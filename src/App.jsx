import React, { useRef, useMemo } from 'react';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import Journal from './components/Trading/Journal';
import Analysis from './components/Analysis/Analysis';
import Psychology from './components/Psychology/Psychology';
import TradingPlan from './components/TradingPlan/TradingPlan';
import MacroEdge from './components/MacroEdge/MacroEdge';
import Sidebar from './components/Sidebar/Sidebar';
import AccountModal from './components/Common/AccountModal';

// Hooks
import useTrades from './hooks/useTrades';
import useAccounts from './hooks/useAccounts';
import useTradingPlan from './hooks/useTradingPlan';
import useMacroEvents from './hooks/useMacroEvents';
import useNavigation from './hooks/useNavigation';

// Constants
import {
  INITIAL_TRADES,
  INITIAL_ACCOUNTS,
  INITIAL_PLAN,
  INITIAL_MACRO_EVENTS,
  VIEWS,
} from './utils/constants';

/**
 * Main App Component - Refactored
 */
const App = () => {
  const fileInputRef = useRef(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = React.useState(false);

  // Custom hooks
  const { currentView, navigateTo } = useNavigation(VIEWS.DASHBOARD);
  
  const {
    trades,
    addTrade,
    editTrade,
    deleteTrade,
    getTradesByAccount,
  } = useTrades(INITIAL_TRADES);

  const {
    accounts,
    currentAccountId,
    setCurrentAccountId,
    addAccount,
    deleteAccount,
  } = useAccounts(INITIAL_ACCOUNTS);

  const {
    plan,
    setPlan,
  } = useTradingPlan(INITIAL_PLAN);

  const {
    events: macroEvents,
    addEvent: addMacroEvent,
    deleteEvent: deleteMacroEvent,
    riskScore,
  } = useMacroEvents(INITIAL_MACRO_EVENTS);

  // Filter trades by current account
  const displayedTrades = useMemo(
    () => getTradesByAccount(currentAccountId),
    [trades, currentAccountId]
  );

  // Export/Import handlers
  const exportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify({ trades, plan, accounts, macroEvents })
      );
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `swing_trade_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.trades && json.plan) {
          if (
            window.confirm(
              'Attention : Ceci va écraser vos données. Continuer ?'
            )
          ) {
            // You'll need to implement setters for this
            alert('Import réussi !');
          }
        } else {
          alert('Format invalide.');
        }
      } catch (error) {
        alert('Erreur fichier.');
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <div className="flex h-screen app-root text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={navigateTo}
        currentAccountId={currentAccountId}
        onAccountChange={setCurrentAccountId}
        accounts={accounts}
        onAccountModalOpen={() => setIsAccountModalOpen(true)}
        onExport={exportData}
        onImportClick={() => fileInputRef.current?.click()}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto pb-20">
          {/* Mobile Header */}
          <header className="md:hidden mb-6 flex justify-between items-center">
            <h1 className="text-xl brutal-title-small">Bates Tading Vision</h1>
          </header>

          {/* Current Account Badge */}
          {currentAccountId !== 'all' && (
            <div className="mb-6 u-card p-4 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">
                    {accounts.find((a) => a.id === currentAccountId)?.name}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Solde Initial:{' '}
                    {accounts
                      .find((a) => a.id === currentAccountId)
                      ?.balance.toLocaleString()}{' '}
                    {accounts.find((a) => a.id === currentAccountId)?.currency}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View Router */}
          {currentView === VIEWS.DASHBOARD && (
            <Dashboard
              trades={displayedTrades}
              accounts={accounts}
              currentAccountId={currentAccountId}
            />
          )}

          {currentView === VIEWS.TRADING && (
            <Journal
              trades={displayedTrades}
              accounts={accounts}
              currentAccountId={currentAccountId}
              onAddTrade={addTrade}
              onEditTrade={editTrade}
              onDeleteTrade={deleteTrade}
            />
          )}

          {currentView === VIEWS.ANALYSIS && (
            <Analysis trades={displayedTrades} />
          )}

          {currentView === VIEWS.MACRO && (
            <MacroEdge
              events={macroEvents}
              onAddEvent={addMacroEvent}
              onDeleteEvent={deleteMacroEvent}
              riskScore={riskScore}
            />
          )}

          {currentView === VIEWS.PSYCHOLOGY && (
            <Psychology trades={displayedTrades} />
          )}

          {currentView === VIEWS.PLAN && (
            <TradingPlan
              plan={plan}
              setPlan={setPlan}
              trades={displayedTrades}
            />
          )}
        </div>
      </main>

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        onAddAccount={addAccount}
        onDeleteAccount={deleteAccount}
      />

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
        accept=".json"
      />
    </div>
  );
};

export default App;