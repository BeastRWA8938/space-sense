import React from 'react'
import "./LeftNavPanel.css"

const LeftNavPanel = () => {
  return (
    <div className='LeftNavMain'>
        <div className='top'>
            <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="19.3617" height="22.3404" rx="2" fill="white"/>
                <rect x="20.1064" width="14.8936" height="14.8936" rx="2" fill="white"/>
                <rect y="23.0851" width="19.3617" height="11.9149" rx="2" fill="white"/>
                <rect x="20.1064" y="15.6383" width="14.8936" height="19.3617" rx="2" fill="white"/>
            </svg>
            <p className='tool-name'>Space Sense</p>
        </div>
        <div className='bottom'>
            Scans
        </div>
    </div>
  )
}

export default LeftNavPanel