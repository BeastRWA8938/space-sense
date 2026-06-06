# SpaceSense 📁📊

SpaceSense is a modern, high-performance desktop disk space visualization utility built with **Electron**, **React**, and **D3.js**. It scans your computer's folders and gives you clear visual insights into how your storage is used.

## Features

- **Full Disk Scan**: Scans native system logical drives on Windows (using native PowerShell commands with a robust `wmic` fallback).
- **Folder Scan**: Visualizes any directory selected via native folder select dialogs.
- **Multiple Visual Views**:
  - **Treemap Layout**: D3-powered rectangular representation of subfolders/files.
  - **Enclosure (Circle Packing) Layout**: Interactive concentric circle representation of files and folder depths.
  - **List View**: A classic list representing sizes, extensions, and directory names.
- **Persistent Settings Configuration**:
  - Exclude folder patterns from being scanned (e.g. `node_modules`, `.git`, temporary folders) to save scanning time.
  - Adjustable recursion depth constraint (from `5` to `200` levels).
  - Automatically persists configurations to the user's OS application storage under `config.json`.
- **Performance Optimizations**:
  - **Loop/Symlink Cycle Protection**: Employs `fs.lstat` and real path visited checking to halt infinite cycles on folder loops (like Windows junctions).
  - **Global Concurrency Semaphore**: Limits concurrent active disk read operations globally to `32` to avoid `EMFILE` resource exhaustion errors and head-thrashing on low-end mechanical HDDs.
  - **React Memoization**: All directory callbacks are memoized (`useCallback` / `useMemo`) to block redundant DOM calculations and D3 redrawing.
  - **Lightweight D3 DOM updates**: DOM updates for selected items are performed in $O(N)$ by toggling CSS classes directly instead of completely rebuilding the visualization nodes.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version >= 18 recommended)
- Windows OS (native logical drive integrations) or macOS/Linux (fallbacks supported)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the React dev server & Electron concurrently**:
   ```bash
   npm run electron:serve
   ```

### Production Build & Packaging

To compile React production assets and package the application into a standalone Windows installer (`.exe`):

```bash
npm run build
npm run electron:build
```

The resulting installer will be located in the `dist/` directory.

---

## Project Structure

- `public/main.js`: Main Electron process. Contains system disk retrievals, configuration load/save operations, global semaphore mechanisms, and recursive filesystem size scans.
- `public/preload.js`: Secure IPC context bridge API defining interfaces for disk scans, configurations, and navigation.
- `src/App.js`: Top-level React component rendering side navigation, settings, and main viz dashboards.
- `src/components/ScanModeProvider.jsx`: Memoized global context provider containing navigation queues, active paths, and state values.
- `src/components/RightMainPanel.jsx`: Master dashboard routing displays between Enclosure, TreeMap, ListView, and loading spinner controls.
- `src/components/TreeMap.jsx` & `src/components/EnclosureDisplay.jsx`: Interactive D3.js visual containers including custom tooltips and unmount lifecycle cleanups.
- `src/components/SettingsModal.jsx`: Interface settings manager for max depth limit and exclusions list.

---

## CI/CD Pipeline

The project includes an automated GitHub Actions pipeline located at `.github/workflows/build.yml`.
- On tag pushes matching `v*` (e.g. `v1.0.0`), the workflow automatically builds and compiles installer binaries for **Windows**, **macOS**, and **Linux** concurrently using matrix runners.
- The pipeline utilizes GitHub Secrets for secure code signing certificate distribution (`WIN_CSC_LINK` / `CSC_LINK`).

---

## License

This project is licensed under the Apache-2.0 License.