import { useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { RestorePrompt } from './components/RestorePrompt';
import { Sidebar } from './components/Sidebar';
import { WindowControls } from './components/WindowControls';
import { TerminalProvider } from './context/TerminalContext';
import { SessionProvider } from './context/SessionContext';
import GamerView from './views/GamerView';
import DeveloperView from './views/DeveloperView';
import UltimateView from './views/UltimateView';
import AppsView from './views/AppsView';
import TerminalView from './views/TerminalView';

type Phase = 'welcome' | 'restore' | 'app';

function AppShell({
  activeView,
  setActiveView,
  ultimateAcknowledged,
  setUltimateAcknowledged,
  onLogout,
}: {
  activeView: string;
  setActiveView: (view: string) => void;
  ultimateAcknowledged: boolean;
  setUltimateAcknowledged: (v: boolean) => void;
  onLogout: () => void;
}) {
  const renderView = () => {
    switch (activeView) {
      case 'gamer':
        return <GamerView />;
      case 'developer':
        return <DeveloperView />;
      case 'ultimate':
        return (
          <UltimateView
            onCancel={() => setActiveView('gamer')}
            acknowledged={ultimateAcknowledged}
            onAcknowledge={() => setUltimateAcknowledged(true)}
          />
        );
      case 'apps':
        return <AppsView onNavigateToTerminal={() => setActiveView('terminal')} />;
      case 'terminal':
        return <TerminalView />;
      default:
        return <GamerView />;
    }
  };

  return (
    <div className="app">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onLogout={onLogout} />
      <main className="main-content">
        <div className="view-container">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [activeView, setActiveView] = useState('gamer');
  const [ultimateAcknowledged, setUltimateAcknowledged] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const handleLogout = () => {
    setActiveView('gamer');
    setUltimateAcknowledged(false);
    setSessionKey(k => k + 1);
    setPhase('welcome');
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
      <TerminalProvider key={`term-${sessionKey}`}>
        <SessionProvider key={`sess-${sessionKey}`}>
          <AppShell
            activeView={activeView}
            setActiveView={setActiveView}
            ultimateAcknowledged={ultimateAcknowledged}
            setUltimateAcknowledged={setUltimateAcknowledged}
            onLogout={handleLogout}
          />
        </SessionProvider>
      </TerminalProvider>
    </>
  );
}

export default App;
