import React, { useState, useMemo } from 'react';
const ScanModeContext = React.createContext();

const ScanModeProvider = ({ children }) => {
  const [isScanMode, setIsScanMode] = useState(0);
  const [nextPath, setNextPath] = useState([]);
  const [data, setData] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [homePath, setHomePath] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // Shared global error/status messages
  const [userMessage, setUserMessage] = useState("");

  const contextValue = useMemo(() => ({
    nextPath, setNextPath,
    homePath, setHomePath,
    selectedPath, setSelectedPath,
    loading, setLoading,
    currentPath, setCurrentPath,
    data, setData,
    isScanMode, setIsScanMode,
    showSettings, setShowSettings,
    userMessage, setUserMessage
  }), [
    nextPath, homePath, selectedPath, loading, currentPath, data, isScanMode, showSettings, userMessage
  ]);

  return (
    <ScanModeContext.Provider value={contextValue}>
      {children}
    </ScanModeContext.Provider>
  );
};

export { ScanModeContext, ScanModeProvider };