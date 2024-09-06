const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getInitialDirectory: () => ipcRenderer.invoke('directory:getInitial'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  navigateDirectory: (dirPath) => ipcRenderer.invoke('directory:navigate', dirPath)
});
