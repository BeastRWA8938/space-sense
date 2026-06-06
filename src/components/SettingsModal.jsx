import React, { useState, useEffect, useContext } from 'react';
import './SettingsModal.css';
import { ScanModeContext } from './ScanModeProvider';

const SettingsModal = () => {
  const { showSettings, setShowSettings } = useContext(ScanModeContext);
  const [maxDepth, setMaxDepth] = useState(100);
  const [ignoreList, setIgnoreList] = useState([]);
  const [newIgnoreItem, setNewIgnoreItem] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    if (showSettings) {
      setLoadingConfig(true);
      if (!window.electron) {
        // Mock loading configuration for browser preview fallback
        setTimeout(() => {
          setMaxDepth(50);
          setIgnoreList(['node_modules', '.git', 'dist', 'build']);
          setLoadingConfig(false);
        }, 300);
        return;
      }
      window.electron.getConfig()
        .then((config) => {
          if (config) {
            setMaxDepth(config.maxDepth || 100);
            setIgnoreList(config.ignoreList || []);
          }
        })
        .catch((err) => console.error('Error fetching config:', err))
        .finally(() => setLoadingConfig(false));
    }
  }, [showSettings]);

  if (!showSettings) return null;

  const handleAddIgnore = (e) => {
    e.preventDefault();
    const cleanItem = newIgnoreItem.trim();
    if (cleanItem && !ignoreList.includes(cleanItem)) {
      setIgnoreList([...ignoreList, cleanItem]);
      setNewIgnoreItem('');
    }
  };

  const handleRemoveIgnore = (itemToRemove) => {
    setIgnoreList(ignoreList.filter((item) => item !== itemToRemove));
  };

  const handleSave = async () => {
    try {
      if (!window.electron) {
        console.log("Mock saved configuration:", { maxDepth, ignoreList });
        setShowSettings(false);
        return;
      }
      await window.electron.saveConfig({ maxDepth, ignoreList });
      setShowSettings(false);
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  return (
    <div className="settings-overlay" onClick={() => setShowSettings(false)}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Configuration Settings</h2>
          <button className="close-btn" onClick={() => setShowSettings(false)}>&times;</button>
        </div>
        {loadingConfig ? (
          <div className="settings-loading">Loading settings...</div>
        ) : (
          <div className="settings-body">
            <div className="settings-section">
              <label htmlFor="depth-slider" className="section-title">Maximum Recursion Depth</label>
              <p className="section-desc">Defines how deep the scanner crawls subdirectories (default 100). Higher limits might impact performance on extremely large folders.</p>
              <div className="depth-slider-container">
                <input
                  id="depth-slider"
                  type="range"
                  min="5"
                  max="200"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
                  className="slider"
                />
                <span className="depth-value">{maxDepth} levels</span>
              </div>
            </div>

            <div className="settings-section">
              <span className="section-title">Ignored Directories</span>
              <p className="section-desc">Folder names matching these keys will be skipped during analysis to save time (e.g. system logs, cache, etc.).</p>
              <div className="ignore-chips-container">
                {ignoreList.map((item, idx) => (
                  <div key={idx} className="ignore-chip">
                    <span>{item}</span>
                    <button type="button" onClick={() => handleRemoveIgnore(item)} className="remove-chip-btn">&times;</button>
                  </div>
                ))}
                {ignoreList.length === 0 && <p className="no-items">No ignored folders defined.</p>}
              </div>
              <form onSubmit={handleAddIgnore} className="add-ignore-form">
                <input
                  type="text"
                  placeholder="e.g. build, temp, logs"
                  value={newIgnoreItem}
                  onChange={(e) => setNewIgnoreItem(e.target.value)}
                  className="settings-input"
                />
                <button type="submit" className="add-btn">Add Folder</button>
              </form>
            </div>
          </div>
        )}
        <div className="settings-footer">
          <button className="settings-btn cancel-btn" onClick={() => setShowSettings(false)}>Cancel</button>
          <button className="settings-btn save-btn" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
