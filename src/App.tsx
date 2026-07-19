import { useEffect, useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { RestorePrompt, type RestorePromptResult } from './components/RestorePrompt';
import { RestoreGateModal } from './components/RestoreGateModal';
import { Sidebar } from './components/Sidebar';
import { WindowControls } from './components/WindowControls';
import { TerminalProvider } from './context/TerminalContext';
import { SessionProvider, type RestorePointStatus } from './context/SessionContext';
import { getSessionEmail, isLicensed, isPremiumView, logOutAccount } from './lib/settingsStore';
import GamerView from './views/GamerView';
import DeveloperView from './views/DeveloperView';
import UltimateView from './views/UltimateView';
import TunesView from './views/TunesView';
import AppsView from './views/AppsView';
import TerminalView from './views/TerminalView';
import SettingsView from './views/SettingsView';

type Phase = 'welcome' | 'restore' | 'app';

function AppShell({
  activeView,
  setActiveView,
  ultimateAcknowledged,
  setUltimateAcknowledged,
  licensed,
  onLogout,
}: {
  activeView: string;
  setActiveView: (view: string) => void;
  ultimateAcknowledged: boolean;
  setUltimateAcknowledged: (v: boolean) => void;
  licensed: boolean;
  onLogout: () => void;
}) {
  const safeSetView = (view: string) => {
    if (!licensed && isPremiumView(view)) {
      setActiveView('settings');
      return;
    }
    setActiveView(view);
  };

  const renderView = () => {
    const view = !licensed && isPremiumView(activeView) ? 'tunes' : activeView;
    switch (view) {
      case 'gamer':
        return <GamerView />;
      case 'developer':
        return <DeveloperView />;
      case 'ultimate':
        return (
          <UltimateView
            onCancel={() => setActiveView('tunes')}
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
      case 'settings':
        return <SettingsView />;
      default:
        return <TunesView />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        onViewChange={safeSetView}
        onLogout={onLogout}
        licensed={licensed}
      />
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
  // Restore signed-in session across app / PC restarts (localStorage).
  const [phase, setPhase] = useState<Phase>(() => (getSessionEmail() ? 'app' : 'welcome'));
  const [activeView, setActiveView] = useState(() => (getSessionEmail() && isLicensed() ? 'gamer' : 'tunes'));
  const [ultimateAcknowledged, setUltimateAcknowledged] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [restoreSeed, setRestoreSeed] = useState<RestorePointStatus>(() =>
    getSessionEmail() ? 'skipped' : 'none'
  );
  const [licensed, setLicensed] = useState(() => isLicensed());

  useEffect(() => {
    const sync = () => setLicensed(isLicensed());
    window.addEventListener('debloat-settings-changed', sync);
    return () => window.removeEventListener('debloat-settings-changed', sync);
  }, []);

  useEffect(() => {
    if (!licensed && isPremiumView(activeView)) {
      setActiveView('tunes');
    }
  }, [licensed, activeView]);

  const handleLogout = () => {
    logOutAccount();
    setActiveView('tunes');
    setUltimateAcknowledged(false);
    setRestoreSeed('none');
    setSessionKey(k => k + 1);
    setLicensed(isLicensed());
    setPhase('welcome');
  };

  const handleRestoreDone = (result: RestorePromptResult) => {
    setRestoreSeed(result === 'created' ? 'created' : 'skipped');
    setLicensed(isLicensed());
    setActiveView(isLicensed() ? 'gamer' : 'tunes');
    setPhase('app');
  };

  if (phase === 'welcome') {
    return (
      <>
        <div className="titlebar-drag" aria-hidden />
        <WindowControls />
        <Welcome onAuthenticated={() => setPhase('restore')} />
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
            licensed={licensed}
            onLogout={handleLogout}
          />
        </SessionProvider>
      </TerminalProvider>
    </>
  );
}

export default App;
