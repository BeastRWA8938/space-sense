const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getInitialDirectory: () => ipcRenderer.invoke('directory:getInitial'),
  navigateDirectory: (dirPath) => ipcRenderer.invoke('directory:navigate', dirPath)
});
