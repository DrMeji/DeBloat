import React from 'react';
import './WindowControls.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

export const WindowControls: React.FC = () => {
  const handleMinimize = () => {
    electronAPI?.minimizeToTray?.();
  };

  const handleClose = () => {
    electronAPI?.closeWindow?.();
  };

  return (
    <div className="window-controls">
      <button
        className="window-control-btn"
        onClick={handleMinimize}
        title="Minimize to tray"
        aria-label="Minimize to tray"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
          <line x1="2" y1="9" x2="10" y2="9" strokeLinecap="round" />
        </svg>
      </button>
      <button
        className="window-control-btn window-control-close"
        onClick={handleClose}
        title="Exit"
        aria-label="Exit"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
          <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" strokeLinecap="round" />
          <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};
