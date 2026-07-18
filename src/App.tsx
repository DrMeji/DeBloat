import { useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { RestorePrompt } from './components/RestorePrompt';
import { Sidebar } from './components/Sidebar';
import { WindowControls } from './components/WindowControls';
import { TerminalProvider } from './context/TerminalContext';
import GamerView from './views/GamerView';
import DeveloperView from './views/DeveloperView';
import UltimateView from './views/UltimateView';
import AppsView from './views/AppsView';
import TerminalView from './views/TerminalView';

type Phase = 'welcome' | 'restore' | 'app';

function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [activeView, setActiveView] = useState('gamer');

  const handleLogout = () => {
    setActiveView('gamer');
    setPhase('welcome');
  };

  const renderView = () => {
    switch (activeView) {
      case 'gamer':
        return <GamerView />;
      case 'developer':
        return <DeveloperView />;
      case 'ultimate':
        return <UltimateView onCancel={() => setActiveView('gamer')} />;
      case 'apps':
        return <AppsView />;
      case 'terminal':
        return <TerminalView />;
      default:
        return <GamerView />;
    }
  };

  if (phase === 'welcome') {
    return (
      <>
        <WindowControls />
        <Welcome onContinue={() => setPhase('restore')} />
      </>
    );
  }

  if (phase === 'restore') {
    return (
      <>
        <WindowControls />
        <RestorePrompt onDone={() => setPhase('app')} />
      </>
    );
  }

  return (
    <>
      <WindowControls />
      <TerminalProvider>
        <div className="app">
          <Sidebar activeView={activeView} onViewChange={setActiveView} onLogout={handleLogout} />
          <main className="main-content">
            <div className="view-container">
              {renderView()}
            </div>
          </main>
        </div>
      </TerminalProvider>
    </>
  );
}

export default App;
