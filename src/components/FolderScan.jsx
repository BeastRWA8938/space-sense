import React, { useContext } from 'react';
import './FolderScan.css';
import { ScanModeContext } from './ScanModeProvider';

const FolderScan = () => {
  const { setCurrentPath, selectedPath, setSelectedPath, setLoading } = useContext(ScanModeContext);

  const openDirectory = async () => {
    try {
      const result = await window.electron.openDirectory();
      if (result.path) {
        setSelectedPath(result.path);
      }
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const handelStartScan = () => {
    setCurrentPath(selectedPath);
    setLoading(true);
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
