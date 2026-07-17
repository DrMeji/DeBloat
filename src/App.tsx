import { useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { Sidebar } from './components/Sidebar';
import GamerView from './views/GamerView';

function App() {
  const [started, setStarted] = useState(false);
  const [activeView, setActiveView] = useState('gamer');

  if (!started) {
    return <Welcome onContinue={() => setStarted(true)} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'gamer':
        return <GamerView />;
      // Other views like Developer, Ultimate, etc. can be added here later
      default:
        return <GamerView />;
    }
  };

  return (
    <div className="app">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="main-content">
        <div className="view-container">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
