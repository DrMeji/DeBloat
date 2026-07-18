import React from 'react';
import './Sidebar.css';
import logo from '../assets/logo.png';
import { useTerminal } from '../context/TerminalContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'gamer', name: 'Gamer', disabled: false },
  { id: 'developer', name: 'Developer', disabled: false },
  { id: 'apps', name: 'Apps', disabled: false },
  { id: 'ultimate', name: 'Ultimate', disabled: false },
  { id: 'settings', name: 'Settings', disabled: true },
  { id: 'terminal', name: 'Live Terminal', disabled: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout }) => {
  const { isApplying } = useTerminal();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div
          className="sidebar-logo-gradient"
          style={{
            WebkitMaskImage: `url(${logo})`,
            maskImage: `url(${logo})`,
          }}
          role="img"
          aria-label="DeBloat logo"
        />
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const isTerminalLive = item.id === 'terminal' && isApplying;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${isTerminalLive ? 'nav-item-live' : ''}`}
              onClick={() => !item.disabled && onViewChange(item.id)}
              disabled={item.disabled}
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
