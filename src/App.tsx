import { useState } from 'react'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)

  return (
    <div className="welcome">
      <div className="welcome-drag" />

      <div className="welcome-content">
        <div className="welcome-logo">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        <h1 className="welcome-title">DeBloat</h1>
        <p className="welcome-subtitle">Advanced Windows optimization &amp; debloating utility</p>

        {started && (
          <p className="welcome-status">Let&apos;s build the next screen from here.</p>
        )}
      </div>

      <div className="welcome-footer">
        <button className="btn btn-primary welcome-continue" onClick={() => setStarted(true)}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default App
