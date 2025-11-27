import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDatabase,
  closeDatabase,
  getAllAccounts,
  createAccount,
  deleteAccount,
  getAllTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  getTradingPlan,
  saveTradingPlan,
  getAllMacroEvents,
  createMacroEvent,
  deleteMacroEvent,
  migrateFromLocalStorage,
  loadLegacyData,
} from './database.js';

// Empêcher le garbage collection de la fenêtre
let mainWindow;

function createWindow() {
  // Configuration de la fenêtre
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "BatesTading Vision",
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
  setupIpcHandlers();
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

  // ==================== TRADES ====================
  ipcMain.handle('db:getTrades', () => getAllTrades());
  ipcMain.handle('db:createTrade', (event, trade) => createTrade(trade));
  ipcMain.handle('db:updateTrade', (event, trade) => updateTrade(trade));
  ipcMain.handle('db:deleteTrade', (event, id) => deleteTrade(id));

  // ==================== TRADING PLAN ====================
  ipcMain.handle('db:getTradingPlan', () => getTradingPlan());
  ipcMain.handle('db:saveTradingPlan', (event, plan) => saveTradingPlan(plan));

  // ==================== MACRO EVENTS ====================
  ipcMain.handle('db:getMacroEvents', () => getAllMacroEvents());
  ipcMain.handle('db:createMacroEvent', (event, event_data) => createMacroEvent(event_data));
  ipcMain.handle('db:deleteMacroEvent', (event, id) => deleteMacroEvent(id));

  // ==================== MIGRATION ====================
  ipcMain.handle('db:migrateFromLocalStorage', (event, data) => migrateFromLocalStorage(data));
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