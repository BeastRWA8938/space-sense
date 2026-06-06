import React, { useContext, useEffect } from 'react';
import './FolderScan.css';
import { ScanModeContext } from './ScanModeProvider';

const FolderScan = () => {
  const {
    data,
    homePath,
    currentPath,
    setData,
    setHomePath,
    setIsScanMode,
    setCurrentPath,
    selectedPath,
    setSelectedPath,
    setLoading,
    setUserMessage,
  } = useContext(ScanModeContext);

  // Function to open directory and update selectedPath and data
  const openDirectory = async () => {
    if (!window.electron) {
      // Mock folder select for browser preview
      setSelectedPath('C:\\Mock\\ProjectDir');
      return;
    }
    try {
      const result = await window.electron.openDirectory();
      if (result.path) {
        console.log("Selected Path:", result.path);
        setSelectedPath(result.path);
      }
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  // Effect to track changes in data or currentPath
  useEffect(() => {
    if (data) {
      console.log("Data has changed:", data);
    }
    if (currentPath) {
      console.log("Current path has changed:", currentPath);
    }
  }, [data, currentPath]);

  // Function to start scanning the selected directory
  const startScanning = async (selectedPath) => {
    if (!selectedPath || typeof selectedPath !== 'string') {
      setUserMessage('Invalid selected path.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setUserMessage("");
    if (!window.electron) {
      // Mock scanning for browser preview
      setCurrentPath(selectedPath);
      setHomePath(selectedPath);
      setIsScanMode(3);
      setTimeout(() => {
        setData([
          { name: 'src', size: '4.5', sizeType: 'MB', isDirectory: true, value: 50 },
          { name: 'public', size: '2.1', sizeType: 'MB', isDirectory: true, value: 25 },
          { name: 'package.json', size: '2.1', sizeType: 'KB', isDirectory: false, value: 10 },
          { name: 'README.md', size: '4.0', sizeType: 'KB', isDirectory: false, value: 15 }
        ]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const result = await window.electron.getInitialDirectory(selectedPath);
      if (result && result.path && Array.isArray(result.files)) {
        console.log("Initial Directory Data:", result.files);
        setCurrentPath(result.path);
        setData(result.files);
      } else {
        setUserMessage('Unexpected scan result format.');
      }
    } catch (err) {
      setUserMessage('Failed to scan directory: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Function to handle start scan button click
  const handleStartScan = () => {
    if (selectedPath) {
      setCurrentPath(selectedPath);
      setHomePath(selectedPath);
      setIsScanMode(3); // Update scan mode to start scan
      startScanning(selectedPath);
      console.log("Home Path:", homePath);
      console.log("Selected Path:", selectedPath);
      console.log("Current Path:", currentPath);
    } else {
      console.error("No path selected");
    }
  };

  return (
    <div className='FolderScan-main'>
      <div className='title'>Folder Scan</div>
      <p>Select a folder of your choice to start visualizing.</p>
      <div className='handelPath'>
        <div className="displayPath path-bg">{selectedPath || "No path selected"}</div>
        <div className="selectPath button-div path-bg" onClick={openDirectory}>...</div>
      </div>
      <div className='button-div width-fit pad5' onClick={handleStartScan}>Start Scan</div>
    </div>
  );
};

export default FolderScan;
