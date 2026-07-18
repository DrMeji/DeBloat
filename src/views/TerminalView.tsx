import React, { useEffect, useRef } from 'react';
import { useTerminal } from '../context/TerminalContext';
import './TerminalView.css';

const TerminalView: React.FC = () => {
  const {
    logLines,
    isApplying,
    applySummary,
    progressPercent,
    showRestartPrompt,
    clearLogs,
    dismissRestartPrompt,
    restartNow,
  } = useTerminal();
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logLines]);

  return (
    <div className="terminal-view">
      <header className="terminal-view-header">
        <div className="terminal-view-title-row">
          <span className={`terminal-view-pulse ${isApplying ? 'active' : ''}`} aria-hidden />
          <h1 className={`terminal-view-title ${isApplying ? 'is-live' : ''}`}>Live Terminal</h1>
          {applySummary && <span className="terminal-view-summary">{applySummary}</span>}
        </div>
        <div className="terminal-view-actions">
          <button
            type="button"
            className="terminal-clear-btn"
            onClick={clearLogs}
            disabled={isApplying || logLines.length === 0}
          >
            Clear
          </button>
          {progressPercent !== null && (
            <span className="terminal-progress" aria-live="polite">
              {progressPercent}%
            </span>
          )}
        </div>
      </header>

      {showRestartPrompt && !isApplying && (
        <div className="terminal-restart-prompt" role="dialog" aria-labelledby="restart-prompt-title">
          <div className="terminal-restart-card">
            <h2 id="restart-prompt-title" className="terminal-restart-title">
              Restart your PC?
            </h2>
            <p className="terminal-restart-lead">
              Some changes (Defender, services, features) only fully take effect after a restart.
            </p>
            <div className="terminal-restart-actions">
              <button type="button" className="terminal-restart-later" onClick={dismissRestartPrompt}>
                Restart later
              </button>
              <button type="button" className="terminal-restart-now" onClick={() => void restartNow()}>
                Restart now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="terminal-view-body" ref={bodyRef}>
        {logLines.length === 0 ? (
          <div className="terminal-view-empty">
            {isApplying
              ? 'Waiting for output…'
              : 'No activity yet. Go to Gamer, Developer, or Ultimate and hit Apply Changes.'}
          </div>
        ) : (
          logLines.map(line => (
            <div key={line.id} className={`terminal-view-line kind-${line.kind || 'info'}`}>
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TerminalView;
