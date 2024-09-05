import React, { useState } from 'react';
const ScanModeContext = React.createContext();

const ScanModeProvider = ({ children }) => {
  const [isScanMode, setIsScanMode] = useState(0);
  const [data, setData] = useState([
    { name: '.idlerc', size: 96, isDirectory: true },
    { name: '.ipython', size: 96, isDirectory: true },
    { name: '.jupyter', size: 128, isDirectory: true },
    { name: '.keras', size: 128, isDirectory: true },
    { name: '.lesshst', size: 20, isDirectory: false },
    { name: '.linkedin_api', size: 96, isDirectory: true },
    { name: '.local', size: 96, isDirectory: true }
      ]);
  const [currentPath, setCurrentPath] = useState("");
  const [ selectedPath, setSelectedPath ] = useState(0);
  const [ loading, setLoading ] = useState(false)
  const [ homePath, setHomePath ] = useState("")

  return (
    <ScanModeContext.Provider value={{ homePath, setHomePath, selectedPath, setSelectedPath, loading, setLoading, currentPath, setCurrentPath, data, setData, isScanMode, setIsScanMode }}>
      {children}
    </ScanModeContext.Provider>
  );
};

export { ScanModeContext, ScanModeProvider };