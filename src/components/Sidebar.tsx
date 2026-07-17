import React from 'react';
import { 
  LayoutDashboard,
  Zap,
  Trash2,
  Users,
  History
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'optimize', name: 'Optimize', icon: Zap },
  { id: 'debloat', name: 'Debloat Apps', icon: Trash2 },
  { id: 'profiles', name: 'Profiles', icon: Users },
  { id: 'restore', name: 'Restore', icon: History },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView,
  onViewChange
}) => {
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
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
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
