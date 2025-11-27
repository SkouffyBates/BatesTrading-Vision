import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
// fs removed: personal-finance JSON persistence deleted

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
// Personal Finance IPC handlers removed (module deleted)
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});