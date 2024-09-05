const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  openDirectory: async () => {
    const result = await ipcRenderer.invoke('dialog:openDirectory');
    return result;
  },
  getInitialDirectory: (homePath) => ipcRenderer.invoke('directory:getInitial', homePath),
  navigateDirectory: (dirPath) => ipcRenderer.invoke('directory:navigate', dirPath),
});


