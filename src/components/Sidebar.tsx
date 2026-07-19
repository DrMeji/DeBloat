import React from 'react';
import './Sidebar.css';
import logo from '../assets/logo.png';
import { useTerminal } from '../context/TerminalContext';
import { isPremiumView } from '../lib/settingsStore';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  licensed: boolean;
}

const menuItems = [
  { id: 'gamer', name: 'Gamer', disabled: false },
  { id: 'developer', name: 'Developer', disabled: false },
  { id: 'ultimate', name: 'Ultimate', disabled: false },
  { id: 'tunes', name: 'Tunes', disabled: false },
  { id: 'apps', name: 'Apps', disabled: false },
  { id: 'terminal', name: 'Terminal', disabled: false },
  { id: 'settings', name: 'Settings', disabled: false },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onLogout,
  licensed,
}) => {
  const { isApplying, busyMode } = useTerminal();

  const canClickWhileBusy = (id: string) => {
    if (id === 'terminal') return true;
    if (busyMode === 'apps' && id === 'apps') return true;
    return false;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="DeBloat logo" className="sidebar-logo" />
      </div>

      <nav className={`sidebar-nav ${isApplying ? 'is-applying' : ''}`}>
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const isTerminal = item.id === 'terminal';
          const isTerminalLive = isTerminal && isApplying;
          const lockedByBusy = isApplying && !canClickWhileBusy(item.id);
          const lockedByLicense = !licensed && isPremiumView(item.id);
          const disabled = item.disabled || lockedByBusy || lockedByLicense;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''} ${isTerminal ? 'nav-item-terminal' : ''} ${isTerminalLive ? 'nav-item-live' : ''} ${lockedByLicense ? 'nav-item-locked' : ''}`}
              data-keep-alive={canClickWhileBusy(item.id) ? 'true' : undefined}
              onClick={() => {
                if (lockedByLicense) {
                  onViewChange('settings');
                  return;
                }
                if (!disabled) onViewChange(item.id);
              }}
              disabled={lockedByBusy || item.disabled}
              title={lockedByLicense ? 'Unlock with a one-time license in Settings' : undefined}
            >
              <span>{item.name}</span>
              {lockedByLicense && (
                <svg className="nav-lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item nav-item-logout" onClick={onLogout}>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
