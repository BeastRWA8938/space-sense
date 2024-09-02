import React from 'react'
import './FolderScan.css'

const FolderScan = () => {
  return (
    <div className='FolderScan-main'>
      <div className='title'>Folder Scan</div>
      <p>Select a folder of your choice to start visualizing.</p>
      <div className='handelPath'>
        <div className="displayPath path-bg">Path</div>
        <div className="selectPath button-div path-bg">...</div>
      </div>
      <div className='button-div width-fit pad5 '>Start Scan</div>
    </div>
  )
}

export default FolderScan
