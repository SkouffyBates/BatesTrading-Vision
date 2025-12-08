import { useCallback } from 'react';

/**
 * Hook to handle data import/export logic
 */
export const useDataManagement = ({
  trades,
  accounts,
  plan,
  macroEvents,
  onImportComplete
}) => {
  
  const exportData = useCallback(() => {
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
  }, [trades, accounts, plan, macroEvents]);

  const importData = useCallback((file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);

        // Basic validation
        const hasData = json.trades || json.accounts || json.plan || json.macroEvents;
        if (!hasData) {
          const toast = window.__addToast;
          toast ? toast('Aucune donnée valide trouvée dans le fichier.', 'error') : console.error('Aucune donnée valide trouvée.');
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
              // SQLite Migration
              await window.db.migrateFromLocalStorage(json);
              console.log('✅ Migration terminée.');
            } else {
              // LocalStorage Fallback (Legacy)
              if (json.trades) localStorage.setItem('swing_trades', JSON.stringify(json.trades));
              if (json.accounts) localStorage.setItem('swing_accounts', JSON.stringify(json.accounts));
              if (json.plan) localStorage.setItem('swing_plan', JSON.stringify(json.plan));
              if (json.macroEvents) localStorage.setItem('swing_macro_events', JSON.stringify(json.macroEvents));
            }
            
            // Trigger callback to reload or refresh
            if (onImportComplete) {
              onImportComplete();
            } else {
              window.location.reload();
            }

          } catch (err) {
            console.error('Import error:', err);
            const toast = window.__addToast;
            toast ? toast('Échec de l\'import : ' + (err.message || ''), 'error') : console.error('Échec de l\'import');
          }
        }
      } catch (error) {
        console.error('Parse error:', error);
        const toast = window.__addToast;
        toast ? toast('Erreur de lecture du fichier: ' + (error.message || ''), 'error') : console.error('Erreur de lecture');
      }
    };

    reader.readAsText(file);
  }, [onImportComplete]);

  return { exportData, importData };
};
