const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');

require('@electron/remote/main').initialize();

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 800,
        resizable: false,
        icon: path.join(__dirname, 'SpaceSenseLogo.ico'),
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

    ipcMain.handle("dialog:openDirectory", async () => {
        try {
            const result = await dialog.showOpenDialog({
                properties: ["openDirectory"],
            });
    
            if (result.canceled || result.filePaths.length === 0) {
                return { path: "", files: [] };
            }
            
            // Return the selected directory path
            return { path: result.filePaths[0], files: [] };
        } catch (error) {
            console.error("Failed to open directory:", error);
            return { path: "", files: [] };
        }
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
