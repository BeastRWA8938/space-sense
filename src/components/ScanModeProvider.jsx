import React, { useState } from 'react';
const ScanModeContext = React.createContext();

const ScanModeProvider = ({ children }) => {
  const [isScanMode, setIsScanMode] = useState(0);
  const [nextPath, setNextPath] = useState([]);
  const [data, setData] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [ selectedPath, setSelectedPath ] = useState(0);
  const [ loading, setLoading ] = useState(false)
  const [ homePath, setHomePath ] = useState("")

  return (
    <ScanModeContext.Provider value={{ nextPath, setNextPath, homePath, setHomePath, selectedPath, setSelectedPath, loading, setLoading, currentPath, setCurrentPath, data, setData, isScanMode, setIsScanMode }}>
      {children}
    </ScanModeContext.Provider>
  );
};

export { ScanModeContext, ScanModeProvider };