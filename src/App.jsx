import React, { useRef, useMemo, useState } from 'react';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import Journal from './components/Trading/Journal';
import Analysis from './components/Analysis/Analysis';
import Psychology from './components/Psychology/Psychology';
import TradingPlan from './components/TradingPlan/TradingPlan';
import MacroEdge from './components/MacroEdge/MacroEdge';
import Sidebar from './components/Sidebar/Sidebar';
import AccountModal from './components/Common/AccountModal';
import SplashScreen from './components/Common/SplashScreen';
import Updater from './components/Common/Updater';
import { ToastProvider } from './hooks/useToast';
import { SettingsProvider } from './hooks/useSettings';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Hooks (now with SQLite support)
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
 * Main App Component - With SQLite Support
 */
const App = () => {
  const fileInputRef = useRef(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  const { currentView, navigateTo } = useNavigation(VIEWS.DASHBOARD);

  const {
    trades,
    loading: tradesLoading,
    addTrade,
    editTrade,
    deleteTrade,
    getTradesByAccount,
    reloadTrades,
  } = useTrades(INITIAL_TRADES);

  const {
    accounts,
    currentAccountId,
    setCurrentAccountId,
    addAccount,
    deleteAccount,
    loading: accountsLoading,
  } = useAccounts(INITIAL_ACCOUNTS);

  const { plan, setPlan } = useTradingPlan(INITIAL_PLAN);

  const {
    events: macroEvents,
    addEvent: addMacroEvent,
    deleteEvent: deleteMacroEvent,
    riskScore,
  } = useMacroEvents(INITIAL_MACRO_EVENTS);

  const displayedTrades = useMemo(
    () => getTradesByAccount(currentAccountId),
    [trades, currentAccountId]
  );

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

// ✅ CORRECTION: Remplacer la fonction handleImport dans App.jsx

const handleImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target.result);
      
      // ✅ CORRECTION: Vérifier qu'il y a au moins une donnée
      const hasData = json.trades || json.accounts || json.plan || json.macroEvents;
      if (!hasData) {
        const toast = window.__addToast;
        toast ? toast('Aucune donnée valide trouvée dans le fichier.', 'error') : console.error('Aucune donnée valide trouvée dans le fichier.');
        return;
      }
      
      console.log('📦 Import data:', {
        trades: json.trades?.length || 0,
        accounts: json.accounts?.length || 0,
        macroEvents: json.macroEvents?.length || 0,
        plan: !!json.plan
      });
      
      if (window.confirm('Attention : Ceci va écraser vos données. Continuer ?')) {
        try {
          if (window.db && window.db.migrateFromLocalStorage) {
            // Migration SQLite
            await window.db.migrateFromLocalStorage(json);
            
            // ✅ CORRECTION: Recharger TOUT après l'import
            console.log('✅ Migration terminée, rechargement...');
            window.location.reload(); // Force un reload complet
          } else {
            // Fallback localStorage
            if (json.trades) localStorage.setItem('swing_trades', JSON.stringify(json.trades));
            if (json.accounts) localStorage.setItem('swing_accounts', JSON.stringify(json.accounts));
            if (json.plan) localStorage.setItem('swing_plan', JSON.stringify(json.plan));
            // ✅ CORRECTION: Ne pas oublier les macro events!
            if (json.macroEvents) localStorage.setItem('swing_macro_events', JSON.stringify(json.macroEvents));
            
            window.location.reload();
          }
        } catch (err) {
          console.error('Import error:', err);
          const toast = window.__addToast;
          toast ? toast('Échec de l\'import : ' + (err.message || ''), 'error') : console.error('Échec de l\'import : ' + (err.message || err));
        }
      }
    } catch (error) {
      console.error('Parse error:', error);
      const toast = window.__addToast;
      toast ? toast('Erreur de lecture du fichier: ' + (error.message || ''), 'error') : console.error('Erreur de lecture du fichier: ' + error.message);
    }
  };
  
  reader.readAsText(file);
  event.target.value = null;
};

  // Listen for calendar navigation events to open Journal and scroll to a trade
 React.useEffect(() => {
  const handler = (e) => {
    const tradeId = e?.detail;
    if (!tradeId) return;
    navigateTo(VIEWS.TRADING);
    
    // ✅ CORRECTION: Déclencher l'édition, pas juste le scroll
    setTimeout(() => {
      // Envoyer l'événement d'édition au Journal
      const editEvent = new CustomEvent('editTrade', { detail: tradeId });
      window.dispatchEvent(editEvent);
    }, 300);
  };
  window.addEventListener('navigateToTrade', handler);
  return () => window.removeEventListener('navigateToTrade', handler);
}, [navigateTo]);
  // Show splash screen first (handles silent migration)
  if (!migrationComplete) {
    return (
      <ToastProvider>
        <SettingsProvider>
          <ErrorBoundary>
            <SplashScreen onComplete={() => setMigrationComplete(true)} />
          </ErrorBoundary>
        </SettingsProvider>
      </ToastProvider>
    );
  }

  // Show loading screen while data loads
  if (tradesLoading || accountsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <SettingsProvider>
        <ErrorBoundary>
          <div className="flex h-screen app-root text-slate-100 font-sans overflow-hidden">
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

      <main className="flex-1 overflow-auto p-8 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto pb-20">
          <header className="md:hidden mb-6 flex justify-between items-center">
            <h1 className="text-xl brutal-title-small">Bates Tading Vision</h1>
          </header>

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

          {currentView === VIEWS.DASHBOARD && (
            <Dashboard
              trades={displayedTrades}
              accounts={accounts}
              currentAccountId={currentAccountId}
              plan={plan}
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
            <TradingPlan plan={plan} setPlan={setPlan} trades={displayedTrades} />
          )}
        </div>
      </main>

        {/* Updater UI */}
        <Updater />

        <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        onAddAccount={addAccount}
        onDeleteAccount={deleteAccount}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
        accept=".json"
      />
          </div>
        </ErrorBoundary>
      </SettingsProvider>
    </ToastProvider>
  );
};

export default App;