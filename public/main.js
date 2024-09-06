const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs").promises;

// Function to get the size of a directory by summing the sizes of its contents
async function getDirectorySize(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const sizes = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await fs.stat(filePath);

          if (stats.isDirectory()) {
            return getDirectorySize(filePath); // Recursively get the size of subdirectories
          } else {
            return stats.size; // Return file size
          }
        } catch (error) {
          if (error.code === 'EPERM' || error.code === 'EACCES') {
            console.warn(`Permission denied: ${filePath}`);
            return 0; // Return 0 size for directories/files that can't be accessed
          } else {
            throw error; // Re-throw other unexpected errors
          }
        }
      })
    );

    return sizes.reduce((total, size) => total + size, 0);
  } catch (error) {
    console.error("Error reading directory:", error);
    return 0; // Return 0 if directory can't be read
  }
}

// Function to get directory contents with sizes
async function getDirectoryContents(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await fs.stat(filePath);

          let size = 0;
          if (stats.isDirectory()) {
            size = await getDirectorySize(filePath); // Try to get the size of the directory
          } else {
            size = stats.size; // Get the size of the file
          }

          return {
            name: file,
            size: size,
            isDirectory: stats.isDirectory(),
          };
        } catch (error) {
          if (error.code === 'EPERM' || error.code === 'EACCES') {
            console.warn(`Permission denied: ${filePath}`);
            return {
              name: file,
              size: 0,
              isDirectory: stats.isDirectory(),
              permissionDenied: true
            }; // Return item with a note that permission was denied
          } else {
            throw error; // Re-throw other unexpected errors
          }
        }
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