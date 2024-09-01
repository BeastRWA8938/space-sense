const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openExternalLink: (url) => ipcRenderer.send('open-external-link', url)
});
