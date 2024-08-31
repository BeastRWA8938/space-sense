import './App.css';
import LeftNavPanel from './components/LeftNavPanel';
import RightMainPanel from './components/RightMainPanel';

function App() {
  return (
    <div className="App">
      <div className='Main'>
        <LeftNavPanel/>
        <RightMainPanel/>
      </div>
    </div>
  );
}

export default App;
