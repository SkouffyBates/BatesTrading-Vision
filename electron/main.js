import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDatabase,
  closeDatabase,
  getAllAccounts,
  createAccount,
  deleteAccount,
  updateAccountName,
  getAllTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  getTradingPlan,
  saveTradingPlan,
  getAllMacroEvents,
  createMacroEvent,
  deleteMacroEvent,
  cleanOldMacroEvents,
  cleanOldTrades,
  migrateFromLocalStorage,
  loadLegacyData,
  getSetting,
  setSetting,
} from './database.js';

let autoUpdater = null;

// Normalize DB trade row (snake_case) to renderer-friendly camelCase
const normalizeTradeRow = (row) => {
  if (!row) return row;
  return {
    id: row.id,
    accountId: row.account_id || row.accountId,
    openDate: row.open_date || row.openDate,
    closeDate: row.close_date || row.closeDate,
    pair: row.pair,
    direction: row.direction,
    positionSize: row.position_size || row.positionSize,
    setup: row.setup,
    risk: row.risk,
    pnl: row.pnl,
    r: row.r,
    notes: row.notes,
    psychology: row.psychology,
    screenshotBefore: row.screenshot_before || row.screenshotBefore,
    screenshotAfter: row.screenshot_after || row.screenshotAfter,
    createdAt: row.created_at || row.createdAt,
  };
};

// Empêcher le garbage collection de la fenêtre
let mainWindow;

function createWindow() {
  // Configuration de la fenêtre
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "BatesTrading Vision",
    icon: path.join(__dirname, '../public/icon.ico'), // Optionnel si vous avez une icône
    backgroundColor: '#0f172a', // Couleur de fond (Slate-900) pour éviter le flash blanc
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true, // Cache la barre de menu (Fichier, Édition...) pour un look Pro
  });

  // En DEV : on charge l'URL de Vite. En PROD : on charge le fichier html compilé.
  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);
}

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== IPC HANDLERS ====================

// Initialize database when app is ready
app.whenReady().then(() => {
  initDatabase();
  // Clean up old data (before 2024) at startup
  cleanOldMacroEvents('2024-01-01');
  cleanOldTrades('2024-01-01');
  setupIpcHandlers();
  // Try to initialize electron-updater if available
  (async () => {
    try {
      const mod = await import('electron-updater');
      // Accept different export shapes (named export, default, or module itself)
      const au = mod && (mod.autoUpdater || mod.default || mod);
      if (!au) throw new Error('no-auto-updater-found');
      autoUpdater = au;
      try { autoUpdater.autoDownload = false; } catch (e) { /* ignore if not configurable */ }
      autoUpdater.on && autoUpdater.on('update-available', (info) => mainWindow && mainWindow.webContents.send('update:available', info));
      autoUpdater.on && autoUpdater.on('update-not-available', (info) => mainWindow && mainWindow.webContents.send('update:not-available', info));
      autoUpdater.on && autoUpdater.on('error', (err) => mainWindow && mainWindow.webContents.send('update:error', { message: err == null ? '' : (err.message || String(err)) }));
      autoUpdater.on && autoUpdater.on('download-progress', (progress) => mainWindow && mainWindow.webContents.send('update:progress', progress));
      autoUpdater.on && autoUpdater.on('update-downloaded', (info) => mainWindow && mainWindow.webContents.send('update:downloaded', info));
      console.log('✅ electron-updater loaded');
    } catch (e) {
      console.log('electron-updater not available:', e && e.message ? e.message : e);
    }
  })();
  createWindow();
});

/**
 * Setup all IPC handlers for database operations
 */
function setupIpcHandlers() {
  // ==================== ACCOUNTS ====================
  ipcMain.handle('db:getAccounts', () => getAllAccounts());
  ipcMain.handle('db:createAccount', (event, account) => createAccount(account));
  ipcMain.handle('db:deleteAccount', (event, id) => deleteAccount(id));
  ipcMain.handle('db:updateAccountName', (event, id, name) => updateAccountName(id, name));

  // ==================== TRADES ====================
  ipcMain.handle('db:getTrades', () => {
    const rows = getAllTrades();
    return (rows || []).map(normalizeTradeRow);
  });

  ipcMain.handle('db:createTrade', (event, trade) => {
    createTrade(trade);
    const rows = getAllTrades();
    return (rows || []).map(normalizeTradeRow);
  });

  ipcMain.handle('db:updateTrade', (event, trade) => {
    updateTrade(trade);
    const rows = getAllTrades();
    return (rows || []).map(normalizeTradeRow);
  });

  ipcMain.handle('db:deleteTrade', (event, id) => {
    deleteTrade(id);
    const rows = getAllTrades();
    return (rows || []).map(normalizeTradeRow);
  });

  // ==================== TRADING PLAN ====================
  ipcMain.handle('db:getTradingPlan', () => getTradingPlan());
  ipcMain.handle('db:saveTradingPlan', (event, plan) => saveTradingPlan(plan));

  // ==================== MACRO EVENTS ====================
  ipcMain.handle('db:getMacroEvents', () => getAllMacroEvents());
  ipcMain.handle('db:createMacroEvent', (event, event_data) => createMacroEvent(event_data));
  ipcMain.handle('db:deleteMacroEvent', (event, id) => deleteMacroEvent(id));

  // ==================== MIGRATION ====================
  ipcMain.handle('db:migrateFromLocalStorage', (event, data) => migrateFromLocalStorage(data));
  ipcMain.handle('db:loadLegacyData', () => loadLegacyData());
  // Settings handlers
  ipcMain.handle('db:getSetting', (event, key) => getSetting(key));
  ipcMain.handle('db:setSetting', (event, key, value) => setSetting(key, value));

  // ==================== UPDATES (guarded) ====================
  ipcMain.handle('app:checkForUpdates', async () => {
    if (!autoUpdater) return { ok: false, message: 'updater-not-installed' };
    try {
      autoUpdater.checkForUpdates();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  });

  ipcMain.handle('app:downloadUpdate', async () => {
    if (!autoUpdater) return { ok: false, message: 'updater-not-installed' };
    try {
      autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  });

  ipcMain.handle('app:quitAndInstall', async () => {
    if (!autoUpdater) return { ok: false, message: 'updater-not-installed' };
    try {
      autoUpdater.quitAndInstall();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  });
}

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});