import { useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { RestorePrompt, type RestorePromptResult } from './components/RestorePrompt';
import { RestoreGateModal } from './components/RestoreGateModal';
import { Sidebar } from './components/Sidebar';
import { WindowControls } from './components/WindowControls';
import { TerminalProvider } from './context/TerminalContext';
import { SessionProvider, type RestorePointStatus } from './context/SessionContext';
import GamerView from './views/GamerView';
import DeveloperView from './views/DeveloperView';
import UltimateView from './views/UltimateView';
import TunesView from './views/TunesView';
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
      case 'tunes':
        return <TunesView />;
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
      <RestoreGateModal />
    </div>
  );
}

function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [activeView, setActiveView] = useState('gamer');
  const [ultimateAcknowledged, setUltimateAcknowledged] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [restoreSeed, setRestoreSeed] = useState<RestorePointStatus>('none');

  const handleLogout = () => {
    setActiveView('gamer');
    setUltimateAcknowledged(false);
    setRestoreSeed('none');
    setSessionKey(k => k + 1);
    setPhase('welcome');
  };

  const handleRestoreDone = (result: RestorePromptResult) => {
    setRestoreSeed(result === 'created' ? 'created' : 'skipped');
    setPhase('app');
  };

  if (phase === 'welcome') {
    return (
      <>
        <div className="titlebar-drag" aria-hidden />
        <WindowControls />
        <Welcome onContinue={() => setPhase('restore')} />
      </>
    );
  }

  if (phase === 'restore') {
    return (
      <>
        <div className="titlebar-drag" aria-hidden />
        <WindowControls />
        <RestorePrompt onDone={handleRestoreDone} />
      </>
    );
  }

  return (
    <>
      <div className="titlebar-drag" aria-hidden />
      <WindowControls />
      <TerminalProvider key={`term-${sessionKey}`}>
        <SessionProvider key={`sess-${sessionKey}`} initialRestoreStatus={restoreSeed}>
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
