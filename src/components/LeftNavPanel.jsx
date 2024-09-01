import React, {useState} from 'react'
import "./LeftNavPanel.css"

const LeftNavPanel = () => {

  const [activeIndex, setActiveIndex] = useState(null);

  const handleSvgClick = (index) => {
    setActiveIndex(index);

    setTimeout(() => {
      setActiveIndex(null);
    }, 150);
  };

  const svgs = [
    <svg key={0} className={activeIndex === 0 ? "glimps" : ""} width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(0)}>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M30.7581 23.7459C30.5064 23.754 30.2537 23.7581 30 23.7581C17.2975 23.7581 7 13.4607 7 0.758118C7 0.504425 7.00411 0.251709 7.01226 0C2.76264 3.09033 0 8.10159 0 13.7581C0 23.147 7.61116 30.7581 17 30.7581C22.6565 30.7581 27.6678 27.9955 30.7581 23.7459Z" fill="white"/>
    </svg>,
    <svg key={1} className={activeIndex === 1 ? "glimps" : ""} width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => window.open('https://github.com/YourGithubUsername', '_blank')}>
      <g clip-path="url(#clip0_71_119)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M16.9493 0C7.5768 0 0 7.68345 0 17.1889C0 24.7872 4.85471 31.2189 11.5895 33.4953C12.4315 33.6664 12.7399 33.1254 12.7399 32.6704C12.7399 32.2719 12.7122 30.906 12.7122 29.4828C7.99728 30.5075 7.01545 27.4338 7.01545 27.4338C6.25773 25.4416 5.13504 24.9296 5.13504 24.9296C3.59186 23.8767 5.24745 23.8767 5.24745 23.8767C6.95924 23.9905 7.85747 25.6411 7.85747 25.6411C9.37255 28.259 11.814 27.5193 12.7961 27.0639C12.9363 25.954 13.3856 25.1856 13.8626 24.7589C10.1022 24.3604 6.14567 22.8806 6.14567 16.2781C6.14567 14.3998 6.81873 12.8631 7.88522 11.668C7.71696 11.2412 7.12751 9.47649 8.05384 7.11452C8.05384 7.11452 9.48496 6.65911 12.7118 8.87892C14.0934 8.50267 15.5181 8.31126 16.9493 8.30965C18.3805 8.30965 19.8393 8.50907 21.1865 8.87892C24.4137 6.65911 25.8449 7.11452 25.8449 7.11452C26.7712 9.47649 26.1814 11.2412 26.0131 11.668C27.1077 12.8631 27.753 14.3998 27.753 16.2781C27.753 22.8806 23.7965 24.3317 20.008 24.7589C20.6255 25.2995 21.1584 26.3238 21.1584 27.9461C21.1584 30.2511 21.1307 32.1011 21.1307 32.67C21.1307 33.1254 21.4394 33.6664 22.2811 33.4956C29.0159 31.2186 33.8706 24.7872 33.8706 17.1889C33.8983 7.68345 26.2938 0 16.9493 0Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="clip0_71_119">
          <rect width="34" height="33.5278" fill="white"/>
        </clipPath>
      </defs>
    </svg>,
    <svg key={2} className={activeIndex === 2 ? "glimps" : ""} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleSvgClick(2)}>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M14 24C19.5228 24 24 19.5228 24 14C24 8.47716 19.5228 4 14 4C8.47715 4 4 8.47716 4 14C4 19.5228 8.47715 24 14 24ZM14 18C16.2091 18 18 16.2091 18 14C18 11.7909 16.2091 10 14 10C11.7909 10 10 11.7909 10 14C10 16.2091 11.7909 18 14 18Z" fill="white"/>
      <path d="M12 23H16L15 28H13L12 23Z" fill="white"/>
      <path d="M5 12V16L0 15V13L5 12Z" fill="white"/>
      <path d="M21.6141 8.80147L18.6958 6.06593L22.8448 3.10186L24.304 4.46964L21.6141 8.80147Z" fill="white"/>
      <path d="M19.2086 22.137L22.0465 19.3182L24.8606 23.5703L23.4417 24.9797L19.2086 22.137Z" fill="white"/>
      <path d="M12 5H16L15 0H13L12 5Z" fill="white"/>
      <path d="M23 12V16L28 15V13L23 12Z" fill="white"/>
      <path d="M9.30421 21.9341L6.38585 19.1985L3.69601 23.5304L5.15519 24.8981L9.30421 21.9341Z" fill="white"/>
      <path d="M6.5236 9.3663L9.36154 6.54742L5.12845 3.70472L3.70948 5.11416L6.5236 9.3663Z" fill="white"/>
    </svg>
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
              <div className='button-div'>Full Disk Scan</div>
              <div className='button-div'>Folder Scan</div>
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