import React, { useContext, useEffect } from 'react';
import './FolderScan.css';
import { ScanModeContext } from './ScanModeProvider';

const FolderScan = () => {
  const { data, homePath, currentPath, setData, setHomePath, setIsScanMode, setCurrentPath, selectedPath, setSelectedPath, setLoading } = useContext(ScanModeContext);

  const openDirectory = async () => {
    try {
      const result = await window.electron.openDirectory();
      if (result.path) {
        console.log("line 12 folderscan: ", result.path)
        setSelectedPath(result.path);
      }
      if (result.files) {
        console.log("line 16 folderscan: ", result.files)
        setData(result.files)
      }
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  useEffect(() => {
    console.log("i have changed", data);
    console.log("i have changed", currentPath);
  }, [data, currentPath]); // This useEffect will trigger every time `data` changes


  const startScanning = (selectedPath) => {
    setLoading(true);
  
    if (typeof selectedPath !== 'string') {
      console.error('Invalid path:', selectedPath);
      setLoading(false);
      return;
    }
  
    window.electron.getInitialDirectory(selectedPath)
      .then((result) => {
        console.log("line 34 folderscan: ", selectedPath)
        setLoading(false);
        if (result && result.path && Array.isArray(result.files)) {
          console.log("line 43 of folderscan",result.files)
          console.log("line 44 of folder scan",result.path)
          setCurrentPath(result.path);
          console.log("i am current path",currentPath)
          setData(result.files);
          console.log("i am data",data)
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
    setIsScanMode(3);
    startScanning(selectedPath);
    console.log("we are the paths home",homePath)
    console.log("we are the sele" ,selectedPath)
    console.log("we are the curr",currentPath)
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
