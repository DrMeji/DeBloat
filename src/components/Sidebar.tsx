import React from 'react';
import './Sidebar.css';
import logo from '../assets/logo.png';

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
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="DeBloat logo" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
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
