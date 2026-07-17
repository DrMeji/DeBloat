import { useState } from 'react';
import './App.css';
import { Welcome } from './components/Welcome';
import { Dashboard } from './components/Dashboard';

function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <Welcome onContinue={() => setStarted(true)} />;
  }

  return (
    <div className="app">
      {/* The Sidebar component has been removed to provide a blank slate */}
      <main className="main-content">
        <div className="view-container">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}

export default App;
