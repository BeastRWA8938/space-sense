import React from 'react';
import './ListView.css'; // Import the CSS file for styling

const ListView = ({ data, navigateToDirectory }) => {
  return (
    <div className="list-view">
      {data && data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index} className={item.isDirectory ? 'directory' : 'file'}
                onClick={item.isDirectory ? () => navigateToDirectory(item) : undefined}
                style={item.isDirectory ? { cursor: 'pointer' } : {}}>
              <span className="item-name">{item.name}</span>
              {<span className="item-size">{item.size} {item.sizeType}</span>}
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
