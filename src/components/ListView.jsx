import React from 'react';
import './ListView.css'; // Import the CSS file for styling

const ListView = ({ data }) => {
  return (
    <div className="list-view">
      {data && data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index} className={item.isDirectory ? 'directory' : 'file'}>
              <span className="item-name">{item.name}</span>
              {!item.isDirectory && <span className="item-size">{item.size} bytes</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items to display</p>
      )}
    </div>
  );
};

export default ListView;
