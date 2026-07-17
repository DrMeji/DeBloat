import { useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

function App() {
  const [started, setStarted] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  if (!started) {
    return <Welcome onContinue={() => setStarted(true)} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <main className="main-content">
        <div className="view-container">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
