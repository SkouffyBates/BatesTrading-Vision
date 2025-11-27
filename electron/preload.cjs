const { contextBridge, ipcRenderer } = require('electron');

// Expose database API to renderer process
contextBridge.exposeInMainWorld('db', {
  // Accounts
  getAccounts: () => ipcRenderer.invoke('db:getAccounts'),
  createAccount: (account) => ipcRenderer.invoke('db:createAccount', account),
  deleteAccount: (id) => ipcRenderer.invoke('db:deleteAccount', id),

  // Trades
  getTrades: () => ipcRenderer.invoke('db:getTrades'),
  createTrade: (trade) => ipcRenderer.invoke('db:createTrade', trade),
  updateTrade: (trade) => ipcRenderer.invoke('db:updateTrade', trade),
  deleteTrade: (id) => ipcRenderer.invoke('db:deleteTrade', id),

  // Trading Plan
  getTradingPlan: () => ipcRenderer.invoke('db:getTradingPlan'),
  saveTradingPlan: (plan) => ipcRenderer.invoke('db:saveTradingPlan', plan),

  // Macro Events
  getMacroEvents: () => ipcRenderer.invoke('db:getMacroEvents'),
  createMacroEvent: (event) => ipcRenderer.invoke('db:createMacroEvent', event),
  deleteMacroEvent: (id) => ipcRenderer.invoke('db:deleteMacroEvent', id),

  // Migration
  migrateFromLocalStorage: (data) => ipcRenderer.invoke('db:migrateFromLocalStorage', data),
  loadLegacyData: () => ipcRenderer.invoke('db:loadLegacyData'),
});