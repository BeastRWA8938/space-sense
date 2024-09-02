import React, { useState, useEffect } from 'react';

function FileExplorer() {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    window.electronAPI.getInitialDirectory()
      .then((result) => {
        console.log('Result from getInitialDirectory:', result);
        if (result && result.path && Array.isArray(result.files)) {
          setCurrentPath(result.path);
          setFiles(result.files);
        } else {
          console.error('Unexpected result format:', result);
        }
      })
      .catch((err) => {
        console.error('Error fetching initial directory:', err);
      });
  }, []);

  const navigateToDirectory = (file) => {
    if (file.isDirectory) {
      const newPath = `${currentPath}\\${file.name}`;
      window.electronAPI.navigateDirectory(newPath)
        .then((result) => {
          console.log('Result from navigateDirectory:', result);
          if (result && result.path && Array.isArray(result.files)) {
            setCurrentPath(result.path);
            setFiles(result.files);
          } else {
            console.error('Unexpected result format:', result);
          }
        })
        .catch((err) => {
          console.error('Error navigating directory:', err);
        });
    }
  };

  return (
    <div>
      <h2>Current Path: {currentPath}</h2>
      <ul>
        {files.length === 0 ? (
          <li>No files or directories found.</li>
        ) : (
          files.map((file, index) => (
            <li key={index} onClick={() => navigateToDirectory(file)}>
              <strong>{file.name}</strong> - {file.isDirectory ? 'Directory' : 'File'} - {file.size} bytes
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default FileExplorer;
