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
      nodeIntegration: true, // Ensure nodeIntegration is false for security
      sandbox: true, // Optional: Adds additional security by running the renderer in a sandbox
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  console.log("Electron window created and loaded URL");
}

// Initialize the application
app.whenReady().then(() => {
  createWindow();

  // Recreate the window if all windows are closed and the app is activated (macOS specific)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle window close event (non-macOS specific)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle("directory:getInitial", async () => {
  const initialPath = 'C:\\'; // Change this to your preferred starting path
  try {
    const files = await getDirectoryContents(initialPath);
    console.log('Initial directory contents:', { path: initialPath, files });
    return { path: initialPath, files };
  } catch (error) {
    console.error("Error getting initial directory:", error);
    return { path: "", files: [] };
  }
});

ipcMain.handle("directory:navigate", async (event, dirPath) => {
  try {
    const files = await getDirectoryContents(dirPath);
    console.log('Navigated directory contents:', { path: dirPath, files });
    return { path: dirPath, files };
  } catch (error) {
    console.error("Error navigating directory:", error);
    return { path: "", files: [] };
  }
});
