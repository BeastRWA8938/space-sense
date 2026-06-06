import React, { useEffect, useState, useContext } from 'react';
import './FullScan.css';
import { ScanModeContext } from './ScanModeProvider';

function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const FullScan = () => {
  const { setData, setCurrentPath, setHomePath, setIsScanMode, setLoading, setUserMessage } = useContext(ScanModeContext);
  const [drives, setDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(true);

  useEffect(() => {
    if (window.electron && window.electron.getSystemDrives) {
      window.electron.getSystemDrives()
        .then((res) => {
          if (Array.isArray(res)) {
            setDrives(res);
          }
        })
        .catch((err) => console.error("Error fetching system drives:", err))
        .finally(() => setLoadingDrives(false));
    } else {
      // Mock drives for web browser preview
      setDrives([
        { drive: 'C:\\', size: 512000000000, free: 128000000000 },
        { drive: 'D:\\', size: 1024000000000, free: 512000000000 }
      ]);
      setLoadingDrives(false);
    }
  }, []);

  const handleScanDrive = async (drivePath) => {
    setLoading(true);
    setUserMessage("");
    if (!window.electron) {
      // Provide mock scanning data for browser preview
      setCurrentPath(drivePath);
      setHomePath(drivePath);
      setIsScanMode(3);
      setTimeout(() => {
        setData([
          { name: 'Windows', size: '24.5', sizeType: 'GB', isDirectory: true, value: 40 },
          { name: 'Program Files', size: '15.2', sizeType: 'GB', isDirectory: true, value: 25 },
          { name: 'Users', size: '12.1', sizeType: 'GB', isDirectory: true, value: 20 },
          { name: 'pagefile.sys', size: '4.0', sizeType: 'GB', isDirectory: false, value: 10 },
          { name: 'temp', size: '1.2', sizeType: 'GB', isDirectory: true, value: 5 }
        ]);
        setLoading(false);
      }, 1000);
      return;
    }

    setCurrentPath(drivePath);
    setHomePath(drivePath);
    setIsScanMode(3); // Scanning view
    try {
      const result = await window.electron.getInitialDirectory(drivePath);
      if (result && result.path && Array.isArray(result.files)) {
        setData(result.files);
      } else {
        setUserMessage("Unexpected scan result format.");
      }
    } catch (err) {
      setUserMessage("Failed to scan drive: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fullscan-container'>
      <div className='fullscan-header'>
        <div className='title'>Full Disk Scan</div>
        <p>Select an active volume of your system to observe drive space distribution.</p>
      </div>

      {loadingDrives ? (
        <div className="drives-loading">Detecting active volumes...</div>
      ) : (
        <div className="drives-grid">
          {drives.map((d, index) => {
            const usedBytes = d.size - d.free;
            const percentage = d.size > 0 ? ((usedBytes / d.size) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="drive-card">
                <div className="drive-info">
                  <div className="drive-letter">{d.drive}</div>
                  <div className="drive-usage-text">
                    {formatBytes(usedBytes)} used of {formatBytes(d.size)}
                  </div>
                </div>
                <div className="drive-progress-bar-container">
                  <div 
                    className="drive-progress-bar-fill" 
                    style={{ width: `${percentage}%`, backgroundColor: percentage > 90 ? '#ff4d4d' : 'var(--accent-color)' }}
                  />
                </div>
                <div className="drive-footer">
                  <span className="drive-percent">{percentage}% Filled</span>
                  <button className="button-div scan-btn" onClick={() => handleScanDrive(d.drive)}>Scan Drive</button>
                </div>
              </div>
            );
          })}
          {drives.length === 0 && <p className="no-drives">No active volumes detected on the system.</p>}
        </div>
      )}
    </div>
  );
};

export default FullScan;
