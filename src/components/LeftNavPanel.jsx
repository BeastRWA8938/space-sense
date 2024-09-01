import React, { useContext, useState } from 'react';
import './LeftNavPanel.css';
import { DarkModeContext } from './DarkModeProvider';
import { ScanModeContext } from './ScanModeProvider';

const LeftNavPanel = () => {
    const { isDarkMode, setIsDarkMode } = useContext(DarkModeContext);
    const { setData , setIsScanMode } = useContext(ScanModeContext);
    const [activeIndex, setActiveIndex] = useState(null);

    const handleFullScanClick = () => {
      setIsScanMode(0); // Set to Full Scan mode
      setData(null);    // Reset the data
    };

    const handleFolderScanClick = () => {
      setIsScanMode(1); // Set to Folder Scan mode
      setData(null);    // Reset the data
    };

    const handleMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleScanMode = (mode) => {
      setIsScanMode(mode);
    }

    const handleSvgClick = (index) => {
        setActiveIndex(index);
        setTimeout(() => {
            setActiveIndex(null);
        }, 150);
    };

    const handleExternalLink = (index) => {
        handleSvgClick(index);
        if (index === 0){
          handleMode();
        } else if (index === 1){
          if (window.electron) {
              window.electron.openExternalLink('https://github.com/BeastRWA8938/space-sense');
          } else {
              console.error('window.electron is not defined');
          }
        } 
    };

    const svgs = [
        <svg key={0} className={activeIndex === 0 ? "glimps" : ""} width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleExternalLink(0)}>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M32.4132 22.9394C29.7718 24.8643 26.5185 26 23 26C14.1634 26 7 18.8366 7 10C7 6.24451 8.29386 2.79123 10.4601 0.0615845C4.31747 2.62384 0 8.68677 0 15.7581C0 25.147 7.61116 32.7581 17 32.7581C23.8226 32.7581 29.7065 28.7391 32.4132 22.9394Z" fill="white"/>
        </svg>,
        <svg key={1} className={activeIndex === 1 ? "glimps" : ""} width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleExternalLink(1)}>
            <g clipPath="url(#clip0_71_119)">
                <path fillRule="evenodd" clipRule="evenodd" d="M16.9493 0C7.5768 0 0 7.68345 0 17.1889C0 24.7872 4.85471 31.2189 11.5895 33.4953C12.4315 33.6664 12.7399 33.1254 12.7399 32.6704C12.7399 32.2719 12.7122 30.906 12.7122 29.4828C7.99728 30.5075 7.01545 27.4338 7.01545 27.4338C6.25773 25.4416 5.13504 24.9296 5.13504 24.9296C3.59186 23.8767 5.24745 23.8767 5.24745 23.8767C6.95924 23.9905 7.85747 25.6411 7.85747 25.6411C9.37255 28.259 11.814 27.5193 12.7961 27.0639C12.9363 25.954 13.3856 25.1856 13.8626 24.7589C10.1022 24.3604 6.14567 22.8806 6.14567 16.2781C6.14567 14.3998 6.81873 12.8631 7.88522 11.668C7.71696 11.2412 7.12751 9.47649 8.05384 7.11452C8.05384 7.11452 9.48496 6.65911 12.7118 8.87892C14.0934 8.50267 15.5181 8.31126 16.9493 8.30965C18.3805 8.30965 19.8393 8.50907 21.1865 8.87892C24.4137 6.65911 25.8449 7.11452 25.8449 7.11452C26.7712 9.47649 26.1814 11.2412 26.0131 11.668C27.1077 12.8631 27.753 14.3998 27.753 16.2781C27.753 22.8806 23.7965 24.3317 20.008 24.7589C20.6255 25.2995 21.1584 26.3238 21.1584 27.9461C21.1584 30.2511 21.1307 32.1011 21.1307 32.67C21.1307 33.1254 21.4394 33.6664 22.2811 33.4956C29.0159 31.2186 33.8706 24.7872 33.8706 17.1889C33.8983 7.68345 26.2938 0 16.9493 0Z" fill="white"/>
            </g>
            <defs>
                <clipPath id="clip0_71_119">
                    <rect width="34" height="33.5278" fill="white"/>
                </clipPath>
            </defs>
        </svg>,
        <svg key={2} className={activeIndex === 2 ? "glimps" : ""} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleExternalLink(2)}>
            <path fillRule="evenodd" clipRule="evenodd" d="M14 24C19.5228 24 24 19.5228 24 14C24 8.47716 19.5228 4 14 4C8.47715 4 4 8.47716 4 14C4 19.5228 8.47715 24 14 24ZM14 18C16.2091 18 18 16.2091 18 14C18 11.7909 16.2091 10 14 10C11.7909 10 10 11.7909 10 14C10 16.2091 11.7909 18 14 18Z" fill="white"/>
            <path d="M12 23H16L15 28H13L12 23Z" fill="white"/>
            <path d="M5 12V16L0 15V13L5 12Z" fill="white"/>
            <path d="M21.6141 8.80147L18.6958 6.06593L22.8448 3.10186L24.304 4.46964L21.6141 8.80147Z" fill="white"/>
            <path d="M19.2086 22.137L22.0465 19.3182L24.8606 23.5703L23.4417 24.9797L19.2086 22.137Z" fill="white"/>
            <path d="M12 5H16L15 0H13L12 5Z" fill="white"/>
            <path d="M23 12V16L28 15V13L23 12Z" fill="white"/>
            <path d="M9.30421 21.9341L6.38585 19.1985L3.69601 23.5304L5.15519 24.8981L9.30421 21.9341Z" fill="white"/>
            <path d="M6.5236 9.3663L9.36154 6.54742L5.12845 3.70472L3.70948 5.11416L6.5236 9.3663Z" fill="white"/>
        </svg>,
    ];

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
          <div className='bottom from-start'>
              <div className='buttons'>
                <div className='button-div' onClick={handleFullScanClick}>Full Disk Scan</div>
                <div className='button-div' onClick={handleFolderScanClick}>Folder Scan</div>
              </div>
          </div>
          <div className='extras'>
            <div className='bottom-features bg-30' >
              {svgs}
            </div>
          </div>
      </div>
    )
  }
  
  export default LeftNavPanel;
  
  