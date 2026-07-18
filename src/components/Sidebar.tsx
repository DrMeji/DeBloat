import React from 'react';
import './Sidebar.css';
import logo from '../assets/logo.png';
import { useTerminal } from '../context/TerminalContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

// A → Z
const menuItems = [
  { id: 'apps', name: 'Apps', disabled: false },
  { id: 'developer', name: 'Developer', disabled: false },
  { id: 'gamer', name: 'Gamer', disabled: false },
  { id: 'terminal', name: 'Live Terminal', disabled: false },
  { id: 'settings', name: 'Settings', disabled: true },
  { id: 'ultimate', name: 'Ultimate', disabled: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout }) => {
  const { isApplying, busyMode } = useTerminal();

  const canClickWhileBusy = (id: string) => {
    if (id === 'terminal') return true;
    // During app installs, allow switching back to Apps
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
          const isTerminalLive = item.id === 'terminal' && isApplying;
          const lockedByBusy = isApplying && !canClickWhileBusy(item.id);
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${isTerminalLive ? 'nav-item-live' : ''}`}
              data-keep-alive={canClickWhileBusy(item.id) ? 'true' : undefined}
              onClick={() => !item.disabled && !lockedByBusy && onViewChange(item.id)}
              disabled={item.disabled || lockedByBusy}
            >
              <span>{item.name}</span>
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
