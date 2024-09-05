const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

// Recursion depth limit for safety
const MAX_RECURSION_DEPTH = 50;

// Function to convert bytes to human-readable format
function formatBytes(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  
  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
  }
  
  return {
    size: bytes.toFixed(2),
    sizeType: units[unitIndex]
  };
}

// Function to calculate directory size recursively
async function getDirectorySize(dirPath, depth = 0) {
  if (depth > MAX_RECURSION_DEPTH) throw new Error("Maximum recursion depth exceeded");

  try {
    const files = await fs.readdir(dirPath);
    const sizes = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
          return getDirectorySize(filePath, depth + 1); // Recursively calculate folder size
        }
        return stats.size; // Return file size in bytes
      })
    );
    return sizes.reduce((total, size) => total + size, 0); // Sum up all sizes
  } catch (error) {
    console.error(`Error calculating size for ${dirPath}:`, error);
    return 0; // Return 0 if any error occurs during size calculation
  }
}

// Function to calculate directory contents and sizes
async function getDirectoryContents(dirPath) {
  try {
    // Calculate total size of the parent directory first
    const totalSizeBytes = await getDirectorySize(dirPath);
    
    const files = await fs.readdir(dirPath);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await fs.stat(filePath);

          let size, sizeType, value;

          if (stats.isDirectory()) {
            const dirSizeBytes = await getDirectorySize(filePath); // Calculate folder size
            ({ size, sizeType } = formatBytes(dirSizeBytes)); // Convert size to human-readable format
            value = ((dirSizeBytes / totalSizeBytes) * 100).toFixed(2); // Calculate value based on parent size
            return { name: file, size, sizeType, isDirectory: true, value };
          } else {
            ({ size, sizeType } = formatBytes(stats.size)); // Convert file size to human-readable format
            value = ((stats.size / totalSizeBytes) * 100).toFixed(2); // Calculate value based on parent size
            return { name: file, size, sizeType, isDirectory: false, value };
          }
        } catch (err) {
          console.warn(`Skipping file due to error: ${filePath} - ${err.message}`);
          return null; // Skip problematic files
        }
      })
    );

    // Return directory details including total size and files
    return {
      path: dirPath,
      totalSize: formatBytes(totalSizeBytes), // Total size of the directory in human-readable format
      files: fileDetails.filter((fileDetail) => fileDetail !== null), // Filter out null (skipped) files
    };
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return { path: dirPath, totalSize: formatBytes(0), files: [] };
  }
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
  const initialPath = homePath || os.homedir();
  try {
    const dirData = await getDirectoryContents(initialPath);
    console.log('Initial directory contents:', dirData);
    return dirData;
  } catch (error) {
    console.error(`Error getting initial directory at ${initialPath}:`, error);
    return { path: "", totalSize: formatBytes(0), files: [] };
  }
});

ipcMain.handle("directory:navigate", async (event, dirPath) => {
  try {
    const dirData = await getDirectoryContents(dirPath);
    console.log('Navigated directory contents:', dirData);
    return dirData;
  } catch (error) {
    console.error(`Error navigating directory at ${dirPath}:`, error);
    return { path: "", totalSize: formatBytes(0), files: [] };
  }
});
