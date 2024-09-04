import './App.css';
import LeftNavPanel from './components/LeftNavPanel';
import RightMainPanel from './components/RightMainPanel';
import {  DarkModeProvider } from './components/DarkModeProvider.jsx';
import { ScanModeProvider } from './components/ScanModeProvider.jsx';
import FolderScan from './components/FolderScan.jsx';


function App() {
  return (
    <div className="App">
      <div className='Main'>
      <DarkModeProvider>
        <ScanModeProvider>
          <LeftNavPanel/>
          <RightMainPanel/>
        </ScanModeProvider>
      </DarkModeProvider>
      </div>
    </div>
  );
}

export default App;
