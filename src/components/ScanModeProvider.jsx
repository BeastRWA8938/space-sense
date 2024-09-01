import React, { useState } from 'react';
const ScanModeContext = React.createContext();

const ScanModeProvider = ({ children }) => {
  const [isScanMode, setIsScanMode] = useState(0);
  const [data, setData] = useState(null);

  return (
    <ScanModeContext.Provider value={{ data, setData, isScanMode, setIsScanMode }}>
      {children}
    </ScanModeContext.Provider>
  );
};

export { ScanModeContext, ScanModeProvider };
