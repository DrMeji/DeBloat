import React from 'react';
import { 
  Zap
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  // Props removed as they are no longer needed
}

const menuItems: any[] = [];

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Zap size={32} className="logo-icon" />
          <span className="logo-text">DeBloat</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item`}
              onClick={() => {}}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="version">v1.0.0</div>
      </div>
    </div>
  );
};
