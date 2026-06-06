const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration state and persistence lifecycle
let appConfig = {
  maxDepth: 100,
  ignoreList: ['node_modules', '.git', 'System Volume Information', '$RECYCLE.BIN', '$Recycle.Bin']
};

let CONFIG_FILE = '';

async function loadConfig() {
  CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    appConfig = { ...appConfig, ...JSON.parse(data) };
  } catch (err) {
    await saveConfig();
  }
}

async function saveConfig() {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(appConfig, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}

// Global Semaphore to bound concurrent File I/O tasks globally (EMFILE protection)
class Semaphore {
  constructor(max) {
    this.max = max;
    this.current = 0;
    this.queue = [];
  }
  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise(resolve => this.queue.push(resolve));
  }
  release() {
    this.current--;
    if (this.queue.length > 0) {
      this.current++;
      const next = this.queue.shift();
      next();
    }
  }
  async run(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

const fsSemaphore = new Semaphore(32); // 32 max concurrent active file operations globally

// Helper to limit parallel async tasks (EMFILE prevention locally)
async function mapLimit(array, limit, fn) {
  const results = [];
  const executing = new Set();
  for (const item of array) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

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

// Loop-safe directory scanning using fs.lstat (stops on symlinks/junction points)
async function getDirectorySize(dirPath, depth = 0, visited = new Set()) {
  if (depth > appConfig.maxDepth) return 0;

  let realPath;
  try {
    realPath = await fsSemaphore.run(() => fs.realpath(dirPath));
    if (visited.has(realPath)) {
      return 0; // Prevent infinite recursion on circular symlinks/junction points
    }
    visited.add(realPath);
  } catch (err) {
    return 0;
  }

  try {
    const files = await fsSemaphore.run(() => fs.readdir(realPath));
    const sizes = await mapLimit(files, 50, async (file) => {
      // Skip ignored directories/files
      if (appConfig.ignoreList.includes(file)) {
        return 0;
      }

      const filePath = path.join(realPath, file);
      try {
        const stats = await fsSemaphore.run(() => fs.lstat(filePath));
        
        // Stop recursion on symlinks / Junction points
        if (stats.isSymbolicLink()) {
          return stats.size;
        }

        if (stats.isDirectory()) {
          return await getDirectorySize(filePath, depth + 1, new Set(visited));
        }
        return stats.size;
      } catch (err) {
        return 0;
      }
    });
    return sizes.reduce((total, size) => total + size, 0);
  } catch (error) {
    return 0;
  }
}

// Function to calculate directory contents and sizes efficiently using fs.lstat
async function getDirectoryContents(dirPath) {
  try {
    const resolvedPath = await fsSemaphore.run(() => fs.realpath(dirPath));
    const files = await fsSemaphore.run(() => fs.readdir(resolvedPath));
    
    // Retrieve details for all files/subdirectories concurrently
    const fileDetails = await mapLimit(files, 50, async (file) => {
      // Skip ignored directories/files
      if (appConfig.ignoreList.includes(file)) {
        return null;
      }

      const filePath = path.join(resolvedPath, file);
      try {
        const stats = await fsSemaphore.run(() => fs.lstat(filePath));
        const isSymlink = stats.isSymbolicLink();
        const isDirectory = stats.isDirectory() && !isSymlink;
        let sizeBytes = stats.size;

        if (isDirectory) {
          // Pass the parent path to prevent scanning it recursively
          sizeBytes = await getDirectorySize(filePath, 1, new Set([resolvedPath]));
        }

        const { size, sizeType } = formatBytes(sizeBytes);
        return {
          name: file,
          size,
          sizeType,
          sizeBytes,
          isDirectory,
        };
      } catch (err) {
        console.warn(`Skipping file due to error: ${filePath} - ${err.message}`);
        return null;
      }
    });

    const validDetails = fileDetails.filter((detail) => detail !== null);
    
    // Calculate total size as the sum of child sizes (Pure O(N) traversal)
    const totalSizeBytes = validDetails.reduce((sum, item) => sum + item.sizeBytes, 0);
    const formattedTotal = formatBytes(totalSizeBytes);

    // Calculate percentages relative to the parent directory size
    const detailsWithValues = validDetails.map((item) => {
      const percentage = totalSizeBytes > 0 ? parseFloat(((item.sizeBytes / totalSizeBytes) * 100).toFixed(2)) : 0.0;
      return {
        name: item.name,
        size: item.size,
        sizeType: item.sizeType,
        isDirectory: item.isDirectory,
        value: percentage
      };
    });

    return {
      path: resolvedPath,
      totalSize: formattedTotal,
      files: detailsWithValues,
    };
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return { path: dirPath, totalSize: formatBytes(0), files: [] };
  }
}

function createWindow() {
  const win = new BrowserWindow({
    minWidth: 1400,
    minHeight: 800,
    // resizable: false,
    icon: path.join(__dirname, 'SpaceSenseLogo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    }
  });

  // Load the correct URL depending on environment
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;
  win.loadURL(startUrl);

  ipcMain.on('open-external-link', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        shell.openExternal(url);
      } else {
        console.warn(`Blocked opening unsafe URL protocol: ${parsedUrl.protocol}`);
      }
    } catch (err) {
      console.error('Failed to parse URL for external opening:', err);
    }
  });

  ipcMain.handle("dialog:openDirectory", async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { path: "" };
      }

      return { path: result.filePaths[0] };
    } catch (error) {
      console.error("Failed to open directory:", error);
      return { path: "" };
    }
  });
}

app.on("ready", async () => {
  await loadConfig();
  createWindow();
});

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

// Settings configuration IPC handlers
ipcMain.handle("config:get", () => {
  return appConfig;
});

ipcMain.handle("config:set", async (event, newConfig) => {
  if (newConfig && typeof newConfig === 'object') {
    appConfig = { ...appConfig, ...newConfig };
    await saveConfig();
  }
  return appConfig;
});

// System logical volumes info retrieval handler
ipcMain.handle("system:getDrives", async () => {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execPromise('powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "Get-Volume | Select-Object DriveLetter, Size, SizeRemaining | ConvertTo-Json"');
      if (!stdout || stdout.trim() === '') {
        throw new Error('Empty PowerShell output');
      }
      const data = JSON.parse(stdout);
      const list = Array.isArray(data) ? data : [data];
      return list
        .filter(d => d && d.DriveLetter !== null && d.DriveLetter !== undefined && d.DriveLetter.length > 0)
        .map(d => {
          const driveLetter = d.DriveLetter + ':\\';
          return {
            drive: driveLetter,
            size: d.Size || 0,
            free: d.SizeRemaining || 0
          };
        });
    } catch (err) {
      console.warn('PowerShell Get-Volume failed, falling back to WMIC logicaldisk...', err.message);
      try {
        const { stdout } = await execPromise('wmic logicaldisk get DeviceID, FreeSpace, Size /Format:csv');
        const lines = stdout.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) {
          throw new Error('No drives found via WMIC');
        }
        const drives = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 4) {
            const driveLetter = parts[1].trim(); // e.g. "C:"
            const freeSpace = parseInt(parts[2].trim(), 10) || 0;
            const size = parseInt(parts[3].trim(), 10) || 0;
            if (driveLetter && driveLetter.includes(':')) {
              drives.push({
                drive: driveLetter + '\\',
                size,
                free: freeSpace
              });
            }
          }
        }
        if (drives.length > 0) return drives;
      } catch (fallbackErr) {
        console.error('All Windows volume listing strategies failed:', fallbackErr);
      }
      return [{ drive: 'C:\\', size: 0, free: 0 }];
    }
  } else {
    // macOS / Linux fallback
    return [{ drive: '/', size: 0, free: 0 }];
  }
});
