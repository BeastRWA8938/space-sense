const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises; // Use fs.promises for async operations

// Function to get directory contents
async function getDirectoryContents(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          isDirectory: stats.isDirectory(),
        };
      })
    );
    return fileDetails;
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
}

// Function to create the main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  console.log("start");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handler to open a directory
ipcMain.handle("dialog:openDirectory", async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { path: "", files: [] };
    }

    const dirPath = result.filePaths[0];
    const files = await getDirectoryContents(dirPath);

    return { path: dirPath, files };
  } catch (error) {
    console.error("Error handling directory request:", error);
    return { path: "", files: [] };
  }
});
