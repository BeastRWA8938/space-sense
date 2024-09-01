const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

require('@electron/remote/main').initialize();

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 800,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Path to preload script
            enableRemoteModule: false,
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    win.loadURL("http://localhost:3000");
    
    ipcMain.on('open-external-link', (event, url) => {
        shell.openExternal(url);
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
