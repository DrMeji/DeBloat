import React from 'react';
import './Sidebar.css';
import logo from '../assets/logo.png';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'gamer', name: 'Gamer' },
  { id: 'developer', name: 'Developer' },
  { id: 'ultimate', name: 'Ultimate' },
  { id: 'settings', name: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="DeBloat logo" className="sidebar-logo" />
      </div>

      <div className="sidebar-spacer" />

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item nav-item-logout">
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
