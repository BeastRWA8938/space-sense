const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electron', {
  pathSeparator: path.sep,
  joinPath: (...args) => path.join(...args),
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  openDirectory: async () => {
    const result = await ipcRenderer.invoke('dialog:openDirectory');
    return result;
  },
  getInitialDirectory: (homePath) => ipcRenderer.invoke('directory:getInitial', homePath),
  navigateDirectory: (dirPath) => ipcRenderer.invoke('directory:navigate', dirPath),
  getSystemDrives: () => ipcRenderer.invoke('system:getDrives'),
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:set', config),
});


