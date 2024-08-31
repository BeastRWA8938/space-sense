import React from 'react'
import "./RightMainPanel.css"

const RightMainPanel = () => {
  return (
    <div className='RightMain'>
        <div className='top'>
            <div className='top-left'>
                Path
            </div>
            <div className='top-right'>
              <svg width="44" height="37" viewBox="0 0 44 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5H39" stroke="white" stroke-width="10" stroke-linecap="round"/>
                <path d="M5 18.1351H39" stroke="white" stroke-width="10" stroke-linecap="round"/>
                <path d="M5 32H39" stroke="white" stroke-width="10" stroke-linecap="round"/>
              </svg>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/>
                <rect width="16.2609" height="16.2609" rx="2" fill="white"/>
                <rect x="17.7391" y="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/>
                <rect x="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/>
              </svg>
            </div>
        </div>
        <div className='bottom'>
            Display
        </div>
    </div>
  )
}

export default RightMainPanel