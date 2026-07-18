import React, { useEffect, useRef } from 'react';
import { useTerminal } from '../context/TerminalContext';
import './TerminalView.css';

const TerminalView: React.FC = () => {
  const { logLines, isApplying, applySummary, clearLogs } = useTerminal();
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
        <p className="terminal-view-lead">
          Watch every remove, disable, and registry change as it runs. Open this tab while Apply is
          running on Gamer, Developer, or Ultimate.
        </p>
        <div className="terminal-view-actions">
          <button
            type="button"
            className="terminal-clear-btn"
            onClick={clearLogs}
            disabled={isApplying || logLines.length === 0}
          >
            Clear
          </button>
        </div>
      </header>

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
