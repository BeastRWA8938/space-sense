import React, { useState } from 'react'
import "./RightMainPanel.css"

const RightMainPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0); 

  const svgs = [<svg key={0} className={activeIndex === 0 ? "active-view" : ""} width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(0)}><circle cx="10" cy="10" r="10" fill="white"/><circle cx="21" cy="26" r="8" fill="white"/><circle cx="27.5" cy="11.5" r="5.5" fill="white"/><circle cx="4.5" cy="25.5" r="3.5" fill="white"/></svg>,<svg key={1} className={activeIndex === 1 ? "active-view" : ""} width="44" height="37" viewBox="0 0 44 37" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(1)}><path d="M5 5H39" stroke="white" strokeWidth="10" strokeLinecap="round"/><path d="M5 18.1351H39" stroke="white" strokeWidth="10" strokeLinecap="round"/><path d="M5 32H39" stroke="white" strokeWidth="10" strokeLinecap="round"/></svg>,<svg key={2} className={activeIndex === 2 ? "active-view" : ""} width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(2)}><rect y="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/><rect width="16.2609" height="16.2609" rx="2" fill="white"/><rect x="17.7391" y="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/><rect x="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/></svg>];


  const handleSvgClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className='RightMain'>
      <div className='top'>
        <div className='top-left'>
          Path
        </div>
        <div className='top-right'>
          {svgs}
        </div>
      </div>
      <div className='bottom'>
        Display
      </div>
    </div>
  );
}

export default RightMainPanel;
