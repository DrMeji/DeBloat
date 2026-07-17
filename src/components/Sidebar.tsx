import React from 'react';
import './Sidebar.css';
import logo from '../assets/logo.png';

interface SidebarProps {
  // Props removed as they are no longer needed
}

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="DeBloat logo" className="sidebar-logo" />
      </div>
    </div>
  );
};
