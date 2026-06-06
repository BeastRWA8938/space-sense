# SpaceSense: Knowledge Transfer Document

Welcome to the **SpaceSense** codebase. SpaceSense is a cross-platform desktop application designed to scan local storage drives or custom folders and visualize space distribution. Built using **Electron**, **React**, and **D3.js**, it offers directory-level insights via Treemaps, Circle Packing Enclosures, and Tabular List Views.

This document provides a comprehensive, highly structured guide for developers, subagents, and LLMs to understand the application's architecture, security controls, algorithms, optimizations, and history.

---

## 1. Executive Architectural Summary

SpaceSense is structured around Electron's multi-process model. It separates OS-level operations (file traversal, volume listing, configuration persistence) from user interface rendering (interactive charts, history navigation, state updates).

```mermaid
graph TD
    subgraph Main Process [Electron Main Process (Node.js Environment)]
        M[main.js] -->|Orchestrates| S[Scanning Traversals]
        M -->|Manages| C[config.json Configuration]
        M -->|Executes| V[Logical Volume Queries]
        M -->|Limits I/O| Sem[Global Semaphore (32 concurrent)]
    end

    subgraph Bridge [IPC Preload Layer]
        P[preload.js] -->|Exposes secure API| CB[contextBridge]
    end

    subgraph Renderer Process [React Renderer Process (Chromium)]
        R[App.js] -->|Theme State| DP[DarkModeProvider]
        R -->|Scan State| SP[ScanModeProvider]
        R -->|Navigation Control| RMP[RightMainPanel]
        RMP -->|Tabular| LV[ListView]
        RMP -->|Squarified Treemap| TM[TreeMap (D3)]
        RMP -->|Circle Packing| ED[EnclosureDisplay (D3)]
    end

    %% IPC Connections
    RMP -->|Invokes IPC via contextBridge| P
    P -->|IPC Handler invocations| M
    M -->|Resolves IPC data| P
    P -->|Resolves Promise| RMP
```

### Process Breakdown

*   **Electron Main Process (`public/main.js`)**: Executes in a full Node.js environment. It has direct access to the file system, processes, and operating system API. It manages folder size calculation algorithms, limits concurrency, reads/writes user configuration, queries OS drives, and handles desktop window creation.
*   **IPC Preload Bridge (`public/preload.js`)**: Acts as a sandbox interface. It uses `contextBridge.exposeInMainWorld` to expose select, secure utility functions and IPC invoke/send handlers to the renderer. Direct Node.js access is completely disabled in the renderer for security.
*   **React Renderer (`src/`)**: A React 18 frontend that builds the user interface. It requests scans and file details via the preload bridge, runs visualizations using D3.js, manages UI themes, and coordinates folder navigation history.

---

## 2. Codebase File Structure & Component Reference

The workspace contains the following core source directories and files:

```
space-sense/
├── public/                     # Electron entry point and asset files
│   ├── main.js                 # Electron main process file (traversal, IPC handlers)
│   ├── preload.js              # IPC bridge exposing safe APIs to renderer
│   ├── index.html              # HTML entry point for the React application
│   └── SpaceSenseLogo.ico      # Application Icon
├── src/                        # React renderer source code
│   ├── components/             # React views and providers
│   │   ├── DarkModeProvider.jsx  # Dark/Light theme manager
│   │   ├── EnclosureDisplay.jsx  # D3 circle-packing visualization component
│   │   ├── FolderScan.jsx        # Selected folder scanning panel
│   │   ├── FullScan.jsx          # Logical drive selection and details panel
│   │   ├── LeftNavPanel.jsx      # Left sidebar navigation and external linkages
│   │   ├── ListView.jsx          # Tabular listing of directory files
│   │   ├── Loading.jsx           # Video loop play element for loading states
│   │   ├── RightMainPanel.jsx    # Central routing, caching, and navigation bar
│   │   ├── ScanModeProvider.jsx  # Scanning and path context provider
│   │   ├── SettingsModal.jsx     # Configuration editor modal (ignored dirs, max depth)
│   │   └── TreeMap.jsx           # D3 absolute-div squarified treemap component
│   ├── App.js                  # React Root Component
│   ├── index.js                # React index mount entry
│   ├── App.css / index.css     # CSS Global files and root variables
│   └── fonts/                  # Bundled JetBrains Mono variable fonts
└── package.json                # Project configuration and builder script
```

### Component Roles & Specifications

| Component | Responsibility | Relevant Context Hooks / Refs |
| :--- | :--- | :--- |
| **`main.js`** | Traversal, symlink protection, global concurrency semaphore, local partition map-limit chunks, drive listing fallbacks, configuration. | Uses `fsSemaphore` (32 limits), `appConfig`. |
| **`preload.js`** | Exposes custom safe Node path properties (`path.sep`, `path.join`) and wraps IPC invocations. | Exposes `window.electron`. |
| **`App.js`** | Root layout element; binds global provider nodes. | `DarkModeProvider`, `ScanModeProvider`. |
| **`DarkModeProvider`** | Toggles `.dark-mode` or `.light-mode` styling directly on the `document.body` DOM element. | `isDarkMode`, `setIsDarkMode`. |
| **`ScanModeProvider`** | Holds variables relating to path routing, file list output arrays, loading transitions, and configuration popups. | `isScanMode`, `data`, `currentPath`, `homePath`. |
| **`LeftNavPanel`** | Sidebar containing shortcuts for mode switching, dark-theme toggles, setting popups, and external links. | Links to GitHub repository via `open-external-link`. |
| **`RightMainPanel`** | Core visualization router. Handles history stacks (back/forward) and caches fetched directories. Handles screen resize observations. | `prevPaths`, `nextPaths`, `cacheRef` (path cache). |
| **`FullScan`** | Logical volume screen. Checks active systems volumes and displays usage status cards. | Uses `system:getDrives` IPC handler. |
| **`FolderScan`** | Path selection screen. Fires the OS system directory picker and starts traversal on approval. | Uses `dialog:openDirectory` IPC handler. |
| **`ListView`** | Lists directories and files in a clean list format. Interacting with folders triggers step-in navigation. | Navigates on directory row clicks. |
| **`TreeMap`** | D3 squarified treemap layout. Maps files using absolute positioned HTML `div` blocks. | Uses `tooltipRef` for interactive overlays. |
| **`EnclosureDisplay`** | D3 Pack layout visualization showing file structures using nested, packed circles. | Optimized with separate CSS selection update hooks. |
| **`Loading`** | Loading screen video loop player. | Plays video loops on scan actions. |
| **`SettingsModal`**| Pop-up interface allowing users to adjust maximum scanning depth and manage ignored folders list. | Uses `config:get` / `config:set` IPC handlers. |

---

## 3. IPC Channel Map & Security Configurations

### IPC Channel Map

| Channel Name | IPC Type | Sender | Recipient | Payload Description | Return Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `open-external-link` | `ipcRenderer.send` | Preload | Main | `url` (String) | *None* |
| `dialog:openDirectory` | `ipcRenderer.invoke`| Preload | Main | *None* | `{ path: String }` |
| `directory:getInitial` | `ipcRenderer.invoke`| Preload | Main | `homePath` (String) | `{ path: String, totalSize: Object, files: Array }` |
| `directory:navigate` | `ipcRenderer.invoke`| Preload | Main | `dirPath` (String) | `{ path: String, totalSize: Object, files: Array }` |
| `system:getDrives` | `ipcRenderer.invoke`| Preload | Main | *None* | `Array<{ drive: String, size: Number, free: Number }>` |
| `config:get` | `ipcRenderer.invoke`| Preload | Main | *None* | `{ maxDepth: Number, ignoreList: Array<String> }` |
| `config:set` | `ipcRenderer.invoke`| Preload | Main | New Config Object | `{ maxDepth: Number, ignoreList: Array<String> }` |

### Security Configurations

To prevent remote code execution (RCE) and directory injection exploits, the application implements the following security protocols:

1.  **Strict Context Isolation**:
    ```javascript
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
    }
    ```
    This completely isolates the React runtime context from the Electron preload script. The React runtime cannot access Electron modules, Node.js global variables, or process parameters directly.
2.  **Explicit Context Bridge Exposing**:
    Only highly specific wrapper routines are exposed via `preload.js`. Direct process invocations are unavailable in the browser frame.
3.  **External Link Sanitization**:
    In the main process, `open-external-link` validates that only safe protocols are opened, preventing arbitrary local executables or local files from running:
    ```javascript
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
    ```

---

## 4. Scanning & Traversal Algorithms

Directory size calculation is a computationally heavy, I/O-bound process. The scanner implements several key guardrails to prevent infinite loops, thread exhaustion, and OS file descriptor limits.

### A. Symlink Cycle & Junction Loop Protection
Windows Junction Points and Unix symbolic links can create cyclic references, leading to infinite loops and stack overflows.
To prevent this, the scanner employs **`fs.realpath`** and **`fs.lstat`** combined with a visited tracker:
1.  **Path Resolution**: Before crawling, the directory path is resolved to its physical location using `fs.realpath`.
2.  **Visited Set Tracking**: A `visited` path set is maintained. If a resolved directory path has already been processed in the current branch, the scanner immediately returns `0` to break the cycle.
3.  **Symlink Isolation**: `fs.lstat` checks if an entry is a symbolic link. If `stats.isSymbolicLink()` returns true, the scanner records the link's metadata size and returns immediately without traversing further.

```javascript
async function getDirectorySize(dirPath, depth = 0, visited = new Set()) {
  if (depth > appConfig.maxDepth) return 0;

  let realPath;
  try {
    realPath = await fsSemaphore.run(() => fs.realpath(dirPath));
    if (visited.has(realPath)) {
      return 0; // Circular reference protection
    }
    visited.add(realPath);
  } catch (err) {
    return 0;
  }

  try {
    const files = await fsSemaphore.run(() => fs.readdir(realPath));
    const sizes = await mapLimit(files, 50, async (file) => {
      if (appConfig.ignoreList.includes(file)) return 0; // Ignore list filter

      const filePath = path.join(realPath, file);
      try {
        const stats = await fsSemaphore.run(() => fs.lstat(filePath));
        
        if (stats.isSymbolicLink()) {
          return stats.size; // Stop traversal on symbolic link
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
```

### B. Global Concurrency Semaphore
To prevent operating system `EMFILE` errors (too many open file descriptors), the application uses a global semaphore class (`Semaphore`) to limit concurrent file operations.
*   **Limit**: Configured to `32` maximum concurrent global file system operations.
*   **Implementation**: Async actions are wrapped using `fsSemaphore.run(() => fs.operation())`. If the active operations count matches the limit, additional calls wait in an internal queue until a slot is released.

### C. Local Parallelism Control (`mapLimit`)
Inside directories, contents are processed in batches using a chunk limiter (`mapLimit`).
*   **Limit**: Processed in parallel batches of `50` concurrent entries to keep system memory usage stable when scanning extremely wide directories.

### D. Ignore Listing
System files and large package caches are skipped during scanning. The default ignore list consists of:
`['node_modules', '.git', 'System Volume Information', '$RECYCLE.BIN', '$Recycle.Bin']`
Users can customize this list through the settings modal.

### E. System Logical Volume Detection
The scanner queries active storage drives depending on the host OS:
*   **Windows**: Executes a PowerShell command:
    `Get-Volume | Select-Object DriveLetter, Size, SizeRemaining | ConvertTo-Json`
    If PowerShell fails, it falls back to WMIC:
    `wmic logicaldisk get DeviceID, FreeSpace, Size /Format:csv`
*   **Unix (macOS / Linux)**: Returns the root folder (`/`) as the single volume entry point.

---

## 5. React & D3 Performance Optimizations

### A. Memoized Event Callbacks (`useCallback`)
React components that pass methods to D3 drawings wrap those methods in `useCallback`. This prevents unnecessary recreations of the functions, avoiding visual stutter and redundant event re-binding during page resizing or view toggles.

### B. DOM Update and D3 Layout Separation
Recalculating a packed circle layout (`d3.pack`) or rebuilding the visual DOM is a heavy process. To optimize this, the circle-packing component (`EnclosureDisplay.jsx`) separates the initial layout creation from style updates (like selection changes):

1.  **Main Layout Effect**: Creates the D3 packing geometry and appends elements to the DOM. This runs only when the main directory details, width, or height change.
2.  **Lightweight Class Update Effect**: Updates styles for selected elements using class toggles without rebuilding the layout. When a user selects a folder node, D3 applies the CSS class directly. This updates the view in $O(N)$ time instead of recreating the layout.

```javascript
// Effect 1: Full DOM and geometry generation (re-runs only on data or boundary dimensions changes)
useEffect(() => {
  if (!info) return;
  // (Sets up d3.pack, nodes list, inserts div elements, configures hover events...)
}, [info, width, height, navigateToDirectory, handleNodeClick]);

// Effect 2: Lightweight selection styling updates (takes only O(N) time)
useEffect(() => {
  if (!divRef.current) return;
  d3.select(divRef.current)
    .selectAll('div.node')
    .classed('selected', d => {
      const nodeId = d.data.id || d.data.name;
      return nodeId === selectedNodeId;
    });
}, [selectedNodeId]);
```

### C. Tooltip State Cleanups
To prevent memory leaks and detached DOM tooltip nodes when switching views, the components clean up tooltip elements on unmount:
```javascript
return () => {
  if (tooltipRef.current) {
    d3.select(tooltipRef.current).style('visibility', 'hidden');
  }
};
```

### D. Directory History Caching
To speed up navigation, the main layout panel (`RightMainPanel.jsx`) caches directory data.
*   **State Refs**: Uses `cacheRef = useRef({})` to cache file lists by path (`path -> { path, files }`).
*   **Navigation Stacks**: Maintains a back stack (`prevPaths`) and forward stack (`nextPaths`).
*   **Cache Hits**: When going back or forward, the scanner retrieves data from `cacheRef` instantly, avoiding redundant IPC requests. The cache is cleared when users start a new full disk or custom folder scan.

---

## 6. Change Logs

### Release v0.1.0: Unified UX, Caching, and Navigation
*   **Visual Router Optimization**: Integrated `ListView`, `TreeMap`, and `EnclosureDisplay` into `RightMainPanel` using shared navigation.
*   **History Management**: Added forward, backward, and home buttons to navigation, using `prevPaths` and `nextPaths` stacks to trace user steps.
*   **Directory Caching**: Added `cacheRef` memory cache in the main panel. This caches folder results to make navigating back and forth instant.
*   **ResizeObserver Integration**: Integrated `ResizeObserver` on the central panel container to dynamically calculate dimensions and resize visualizations automatically.

### UI styling and Enclosure Layout Fixes
*   **Enclosure Circle Sizing**: Added a minimum circle radius limit (`minRadius = 10`) to keep tiny files visible and clickable inside large folders.
*   **Value Percentages and Bytes Formatting**: Standardized file size conversion strings and updated percentage values to reflect parent directory size.
*   **Interactive Styles**: Updated theme styling, hover states, scroll bars, and cursor styles across lists and visualization nodes.
