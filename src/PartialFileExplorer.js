import React, { useState } from 'react';

function PartialFileExplorer() {
  const [directoryPath, setDirectoryPath] = useState('');
  const [files, setFiles] = useState([]);

  const openDirectory = () => {
    window.electronAPI.openDirectory().then((result) => {
      if (result && result.path && Array.isArray(result.files)) {
        setDirectoryPath(result.path);
        setFiles(result.files);
      } else {
        console.error('Unexpected result format:', result);
      }
    }).catch((err) => {
      console.error('Error opening directory:', err);
    });
  };

  return (
    <div>
      <button onClick={openDirectory}>Open Directory</button>
      <div>
        {directoryPath && (
          <div>
            <h3>Directory Path:</h3>
            <p>{directoryPath}</p>
          </div>
        )}
        {files.length === 0 ? (
          <p>No files or directories to display</p>
        ) : (
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <strong>{file.name}</strong> - {file.isDirectory ? 'Directory' : 'File'} - {file.size} bytes
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PartialFileExplorer;