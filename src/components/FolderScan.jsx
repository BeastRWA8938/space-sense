import React, { useContext } from 'react';
import './FolderScan.css';
import { ScanModeContext } from './ScanModeProvider';

const FolderScan = () => {
  const { homePath, setData, setHomePath, setCurrentPath, selectedPath, setSelectedPath, setLoading } = useContext(ScanModeContext);

  const openDirectory = async () => {
    try {
      const result = await window.electron.openDirectory();
      if (result.path) {
        console.log("line 12 folderscan: ", result.path)
        setSelectedPath(result.path);
      }
      if (result.files) {
        console.log("line 12 folderscan: ", result.files)
        setData(result.files)
      }
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const startScanning = () => {
    setLoading(true);
  
    if (typeof selectedPath !== 'string') {
      console.error('Invalid path:', selectedPath);
      setLoading(false);
      return;
    }
  
    window.electron.getInitialDirectory(selectedPath)
      .then((result) => {
        setLoading(false);
        if (result && result.path && Array.isArray(result.files)) {
          setCurrentPath(result.path);
          setData(result.files);
        } else {
          console.error('Unexpected result format:', result);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error('Error fetching initial directory:', err);
      });
  };
  
  
  const handelStartScan = () => {
    setCurrentPath(selectedPath);
    setHomePath(selectedPath);
    startScanning(selectedPath);
  }

  return (
    <div className='FolderScan-main'>
      <div className='title'>Folder Scan</div>
      <p>Select a folder of your choice to start visualizing.</p>
      <div className='handelPath'>
        <div className="displayPath path-bg">{selectedPath || "Path"}</div>
        <div className="selectPath button-div path-bg" onClick={openDirectory}>...</div>
      </div>
      <div className='button-div width-fit pad5' onClick={handelStartScan}>Start Scan</div>
    </div>
  );
};

export default FolderScan;
