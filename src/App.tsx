import { useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';

function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <Welcome onContinue={() => setStarted(true)} />;
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="view-container">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}

export default App;
