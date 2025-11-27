const { contextBridge } = require('electron');

// Personal Finance API removed — expose a minimal API surface for future use
contextBridge.exposeInMainWorld('api', {});
