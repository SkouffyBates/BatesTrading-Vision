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
  getAllEcoNotes,
  createEcoNote,
  deleteEcoNote,
} from './database.js';

// --- CONFIGURATION ---
const APP_TITLE = "BatesTrading Vision";
const BG_COLOR = '#0f172a'; // Slate-900

let autoUpdater = null;
let mainWindow = null;

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- WINDOW MANAGEMENT ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: APP_TITLE,
    icon: path.join(__dirname, '../public/icon.ico'),
    backgroundColor: BG_COLOR,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);
}

// --- UPDATER INITIALIZATION ---
async function initAutoUpdater() {
  try {
    const mod = await import('electron-updater');
    // Robust import handling for ESM/CJS compatibility
    const au = mod.autoUpdater || (mod.default && mod.default.autoUpdater) || mod.default;
    
    if (!au) {
      console.error('❌ AutoUpdater: Module loaded but updater object not found.');
      return;
    }

    autoUpdater = au;
    
    // Configuration
    autoUpdater.autoDownload = false; // On laisse l'utilisateur décider
    autoUpdater.allowPrerelease = false;
    
    // Logger simple pour le debug
    autoUpdater.logger = console;
    
    console.log('✅ AutoUpdater initialized');

    // Event Listeners
    autoUpdater.on('checking-for-update', () => {
      console.log('🔍 Checking for updates...');
      mainWindow?.webContents.send('update:checking');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('📦 Update available:', info.version);
      mainWindow?.webContents.send('update:available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('tjrs à jour:', info);
      mainWindow?.webContents.send('update:not-available', info);
    });

    autoUpdater.on('error', (err) => {
      console.error('❌ Update Error:', err);
      mainWindow?.webContents.send('update:error', { message: err.message || 'Unknown error' });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      // Log moins verbeux pour la progress
      // console.log(`📥 Download: ${progressObj.percent}%`);
      mainWindow?.webContents.send('update:progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('✅ Update downloaded');
      mainWindow?.webContents.send('update:downloaded', info);
    });

  } catch (e) {
    console.error('❌ Failed to load electron-updater:', e);
  }
}

// --- IPC HANDLERS ---
function setupIpcHandlers() {
  // Helper wrapper for error handling
  const handle = (channel, fn) => {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        return await fn(event, ...args);
      } catch (error) {
        console.error(`❌ IPC Error [${channel}]:`, error);
        throw error;
      }
    });
  };

  // === DATABASE HANDLERS ===
  handle('db:getAccounts', () => getAllAccounts());
  handle('db:createAccount', (_, v) => createAccount(v));
  handle('db:deleteAccount', (_, id) => deleteAccount(id));
  handle('db:updateAccountName', (_, id, name) => updateAccountName(id, name));

  // Trades
  handle('db:getTrades', () => (getAllTrades() || []).map(normalizeTradeRow));
  handle('db:createTrade', (_, v) => { createTrade(v); return (getAllTrades() || []).map(normalizeTradeRow); });
  handle('db:updateTrade', (_, v) => { updateTrade(v); return (getAllTrades() || []).map(normalizeTradeRow); });
  handle('db:deleteTrade', (_, id) => { deleteTrade(id); return (getAllTrades() || []).map(normalizeTradeRow); });

  // Trading Plan & Macro
  handle('db:getTradingPlan', () => getTradingPlan());
  handle('db:saveTradingPlan', (_, v) => saveTradingPlan(v));
  handle('db:getMacroEvents', () => getAllMacroEvents());
  handle('db:createMacroEvent', (_, v) => createMacroEvent(v));
  handle('db:deleteMacroEvent', (_, id) => deleteMacroEvent(id));

  // Migration & Settings
  handle('db:migrateFromLocalStorage', (_, v) => migrateFromLocalStorage(v));
  handle('db:loadLegacyData', () => loadLegacyData());
  handle('db:getSetting', (_, k) => getSetting(k));
  handle('db:setSetting', (_, k, v) => setSetting(k, v));

  // === ECO WATCH HANDLERS ===
  handle('db:getEcoNotes', () => getAllEcoNotes());
  handle('db:createEcoNote', (_, v) => createEcoNote(v));
  handle('db:deleteEcoNote', (_, id) => deleteEcoNote(id));

  // === UPDATER HANDLERS (Async fixed) ===
  ipcMain.handle('app:checkForUpdates', async () => {
    if (!autoUpdater) return { ok: false, message: 'Updater not initialized' };
    try {
      // AWAIT is critical here to catch immediate errors
      const result = await autoUpdater.checkForUpdates();
      return { ok: true, version: result?.updateInfo?.version };
    } catch (e) {
      console.error('Check failed:', e);
      return { ok: false, message: e.message };
    }
  });

  ipcMain.handle('app:downloadUpdate', async () => {
    if (!autoUpdater) return { ok: false, message: 'Updater not initialized' };
    try {
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (e) {
      console.error('Download failed:', e);
      return { ok: false, message: e.message };
    }
  });

  ipcMain.handle('app:quitAndInstall', async () => {
    if (!autoUpdater) return { ok: false, message: 'Updater not initialized' };
    try {
      autoUpdater.quitAndInstall();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  });

  // === APP INFO HANDLERS ===
  ipcMain.handle('app:getVersion', () => app.getVersion());
}

// Helper: Normalize DB rows to CamelCase
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

// --- APP LIFECYCLE ---
app.whenReady().then(async () => {
  initDatabase();
  cleanOldMacroEvents('2024-01-01');
  cleanOldTrades('2024-01-01');
  
  await initAutoUpdater(); // Wait for updater init
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
