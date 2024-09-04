import React, { useState, useContext, useEffect } from 'react';
import "./RightMainPanel.css";
import TreeMap from './TreeMap';
import EnclosureDisplay from './EnclosureDisplay';
import { ScanModeContext, ScanModeProvider } from './ScanModeProvider';
import FullScan from './FullScan';
import FolderScan from './FolderScan';
import Loading from './Loading';
import ListView from './ListView';

const RightMainPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeView, setActiveView] = useState(1);
  const [nextPath, setNextPath] = useState([]);
  const { setCurrentPath, loading, setLoading, isScanMode, setIsScanMode, data, setData, homePath, setHomePath, currentPath } = useContext(ScanModeContext);

  useEffect(() => {
    if (data && data.length !== 0) {
      setIsScanMode(3);
    }
    if (currentPath.length !== 0) {
      setHomePath(currentPath);
    }
  }, [data]);


  const navigateToDirectory = (file) => {
    if (file.isDirectory) {
      const newPath = `${currentPath}\\${file.name}`;
      window.electron.navigateDirectory(newPath)
        .then((result) => {
          console.log('Result from navigateDirectory:', result);
          if (result && result.path && Array.isArray(result.files)) {
            setCurrentPath(result.path);
            setData(result.files);
            setNextPath([]); // Clear nextPath when navigating to a new directory
          } else {
            console.error('Unexpected result format:', result);
          }
        })
        .catch((err) => {
          console.error('Error navigating directory:', err);
        });
    }
  };

  const handleBackButton = (inputPath) => {
    const lastSlashIndex = inputPath.lastIndexOf('\\');
    
    // Split the input into two parts
    const newCurrentPath = inputPath.substring(0, lastSlashIndex);
    const newNextPath = inputPath.substring(lastSlashIndex + 1);
    
    // Set new current and next paths
    setCurrentPath(newCurrentPath);
    setNextPath(prev => [...prev, newNextPath]); // Append the last part of the path to nextPath
  };

  const handleNavigateForward = () => {
    if (nextPath.length > 0) {
      const lastElement = nextPath[nextPath.length - 1];
      setNextPath(prev => prev.slice(0, -1));
      navigateToDirectory({ isDirectory: true, name: lastElement });
    }
  };

  const svgs = [
    <svg key={0} className={activeView === 0 ? "active-view" : ""} width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(0)}>
      <circle cx="10" cy="10" r="10" fill="white"/>
      <circle cx="21" cy="26" r="8" fill="white"/>
      <circle cx="27.5" cy="11.5" r="5.5" fill="white"/>
      <circle cx="4.5" cy="25.5" r="3.5" fill="white"/>
    </svg>,
    <svg key={1} className={activeView === 1 ? "active-view" : ""} width="44" height="37" viewBox="0 0 44 37" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(1)}>
      <path d="M5 5H39" stroke="white" strokeWidth="10" strokeLinecap="round"/>
      <path d="M5 18.1351H39" stroke="white" strokeWidth="10" strokeLinecap="round"/>
      <path d="M5 32H39" stroke="white" strokeWidth="10" strokeLinecap="round"/>
    </svg>,
    <svg key={2} className={activeView === 2 ? "active-view" : ""} width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(2)}>
      <rect y="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/>
      <rect width="16.2609" height="16.2609" rx="2" fill="white"/>
      <rect x="17.7391" y="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/>
      <rect x="17.7391" width="16.2609" height="16.2609" rx="2" fill="white"/>
    </svg>
  ];

  const svgs2 =[
    <svg key={3} className={activeIndex === 3 ? "active-view" : ""} width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleOpClick(3)}>
      <path fillRule="evenodd" clipRule="evenodd" d="M16.822 0.527912C16.0566 -0.175971 14.8796 -0.175971 14.1143 0.527912L0.65016 12.9107C-0.691215 14.1444 0.181609 16.3828 2.00402 16.3828H4.98296V29.0046C4.98296 30.1092 5.87839 31.0046 6.98296 31.0046H23.9533C25.0579 31.0046 25.9533 30.1092 25.9533 29.0046V16.3828H28.9322C30.7546 16.3828 31.6275 14.1444 30.2861 12.9107L16.822 0.527912ZM9.97589 18.1263C9.97589 17.574 10.4236 17.1263 10.9759 17.1263H13.9688C14.5211 17.1263 14.9688 17.574 14.9688 18.1263V21.0829C14.9688 21.6351 14.5211 22.0829 13.9688 22.0829H10.9759C10.4236 22.0829 9.97589 21.6351 9.97589 21.0829V18.1263ZM10.9759 23.0742C10.4236 23.0742 9.97589 23.5219 9.97589 24.0742V27.0307C9.97589 27.583 10.4236 28.0307 10.9759 28.0307H13.9688C14.5211 28.0307 14.9688 27.583 14.9688 27.0307V24.0742C14.9688 23.5219 14.5211 23.0742 13.9688 23.0742H10.9759ZM15.9674 18.1263C15.9674 17.574 16.4151 17.1263 16.9674 17.1263H19.9603C20.5126 17.1263 20.9603 17.574 20.9603 18.1263V21.0829C20.9603 21.6351 20.5126 22.0829 19.9603 22.0829H16.9674C16.4151 22.0829 15.9674 21.6351 15.9674 21.0829V18.1263ZM16.9674 23.0742C16.4151 23.0742 15.9674 23.5219 15.9674 24.0742V27.0307C15.9674 27.583 16.4151 28.0307 16.9674 28.0307H19.9603C20.5126 28.0307 20.9603 27.583 20.9603 27.0307V24.0742C20.9603 23.5219 20.5126 23.0742 19.9603 23.0742H16.9674Z" fill="white"/>
    </svg>,
    <svg key={4} className={activeIndex === 4 ? "active-view" : ""} width="30" height="16" viewBox="0 0 30 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleOpClick(4)}>
      <path fillRule="evenodd" clipRule="evenodd" d="M0.485058 7.146C-0.161687 7.5345 -0.161686 8.47194 0.48506 8.86045L12.1408 15.8621C12.8073 16.2625 13.6557 15.7824 13.6557 15.0049V10.2533H28.9708C29.5231 10.2533 29.9708 9.80562 29.9708 9.25334V6.75312C29.9708 6.20083 29.5231 5.75312 28.9708 5.75312H13.6557V1.00155C13.6557 0.224019 12.8073 -0.25606 12.1408 0.14432L0.485058 7.146Z" fill="white"/>
    </svg>,
    <svg key={5} className={activeIndex === 5 ? "active-view" : ""} width="30" height="16" viewBox="0 0 30 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleOpClick(5)}>
      <path fillRule="evenodd" clipRule="evenodd" d="M29.4858 8.86044C30.1325 8.47194 30.1325 7.53449 29.4858 7.14599L17.83 0.144314C17.1635 -0.256065 16.3151 0.224012 16.3151 1.00154V5.75311H1C0.447718 5.75311 2.04891e-06 6.20083 2.04891e-06 6.75311V9.25334C2.04891e-06 9.80562 0.447718 10.2533 1 10.2533H16.3151V15.0049C16.3151 15.7824 17.1635 16.2625 17.83 15.8621L29.4858 8.86044Z" fill="white"/>
    </svg>
  ]

  const handleSvgClick = (index) => {
    setActiveView(index);
  };

  const handleOpClick = (index) => {
    setActiveView(index);
    if (index === 3) {
      console.log("this is home path" , homePath)
      setCurrentPath(homePath);
    }
    if (index === 4) {
      handleBackButton();
    }
    if (index === 5) {
      handleNavigateForward();
    }
    setTimeout(() => {
        setActiveView(null);
    }, 150);
  };

  return (
    <div className='RightMain'>
      <div className='top'>
        <div className='top-right bg-10'>{svgs2}</div>
        <div className='top-left'>{homePath ? homePath : "Path"}</div>
        <div className='top-right bg-10'>{svgs}</div>
      </div>
      <div className='bottom center' id='Main-Display-Content'>
  
        {/* Handle loading state first */}
        {/* {data ? setLoading(false) : setLoading(true)} */}
        {loading ? (
          <Loading />
        ) : (
          /* If no data is present, render scanning components */
          data && data.length === 0 ? (
            isScanMode === 0 ? (
              <FullScan />
            ) : isScanMode === 1 ? (
              <ScanModeProvider><FolderScan /></ScanModeProvider>
            ) : <div>data is null or length is 0</div>
          ) : (
            /* If data is present, render the appropriate view */
            activeIndex === 0 ? (
              <EnclosureDisplay data={data} width={1135} height={653} />
            ) : activeIndex === 1 ? (
              <ListView data={data} />
            ) : activeIndex === 2 ? (
              <TreeMap data={data} width={1135} height={653} />
            ) : <div>No View Capable</div>
          )
        )}
  
      </div>
    </div>
  );
}  
export default RightMainPanel;