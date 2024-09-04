const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
require('@electron/remote/main').initialize();
const fs = require('fs');
const path = require('path');

async function getDirectoryContents(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        return reject(err);
      }
      const fileDetailsPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const filePath = path.join(dirPath, file);
          fs.stat(filePath, (err, stats) => {
            if (err) {
              if (err.code === 'EBUSY') {
                console.warn(`Skipping busy or locked file: ${filePath}`);
                return resolve(null); // Return null for skipped files
              } else {
                return reject(err); // Re-throw other errors
              }
            }
            resolve({
              name: file,
              size: stats.size,
              isDirectory: stats.isDirectory(),
            });
          });
        });
      });

      Promise.all(fileDetailsPromises)
        .then((fileDetails) => {
          resolve(fileDetails.filter(fileDetail => fileDetail !== null));
        })
        .catch(reject);
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    resizable: false,
    icon: path.join(__dirname, 'SpaceSenseLogo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

ipcMain.handle("directory:getInitial", async (event, homePath) => {
  console.log(homePath); // Should print the path string, not an object
  const initialPath = homePath || (process.platform === 'win32' ? 'C:\\Users\\' : '/home');
  try {
    const files = await getDirectoryContents(initialPath);
    console.log('Initial directory contents:', { path: initialPath, files });
    return { path: initialPath, files };
  } catch (error) {
    console.error(`Error getting initial directory at ${initialPath}:`, error);
    return { path: "", files: [] };
  }
});


ipcMain.handle("directory:navigate", async (event, dirPath) => {
  try {
    const files = await getDirectoryContents(dirPath);
    console.log('Navigated directory contents:', { path: dirPath, files });
    return { path: dirPath, files };
  } catch (error) {
    console.error(`Error navigating directory at ${dirPath}:`, error);
    return { path: "", files: [] };
  }
});
