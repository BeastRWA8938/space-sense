// src/FileExplorer.js
import React, { useState } from 'react';

const FileExplorer = () => {
  const [directory, setDirectory] = useState(null);
  const [files, setFiles] = useState([]);

  const openDirectory = async () => {
    const dirPath = await window.electron.openDirectory();
    if (dirPath) {
      const fs = window.require('fs');
      const path = window.require('path');

      fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error('Could not list the directory.', err);
          return;
        }
        setDirectory(dirPath);
        setFiles(files.map(file => ({
          name: file,
          isDirectory: fs.lstatSync(path.join(dirPath, file)).isDirectory(),
        })));
      });
    }
  };

  return (
    <div>
      <button onClick={openDirectory}>Open Directory</button>
      <h3>Directory: {directory}</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            {file.name} {file.isDirectory ? '(Directory)' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileExplorer;
