import React from 'react';
import { 
  Gamepad2, 
  Code2, 
  Zap, 
  Settings, 
  LayoutDashboard,
  Shield,
  History,
  Info
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  activeProfile: string | null;
  onProfileSelect: (profile: string) => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

const profiles = [
  {
    id: 'gamer',
    name: 'Gamer',
    icon: Gamepad2,
    description: 'Maximum FPS & responsiveness',
    color: '#10b981'
  },
  {
    id: 'developer',
    name: 'Developer',
    icon: Code2,
    description: 'Optimized for coding',
    color: '#3b82f6'
  },
  {
    id: 'extreme',
    name: 'Extreme',
    icon: Zap,
    description: 'Maximum optimization',
    color: '#ef4444'
  }
];

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'protection', name: 'System Protection', icon: Shield },
  { id: 'history', name: 'History', icon: History },
  { id: 'about', name: 'About', icon: Info }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeProfile, 
  onProfileSelect,
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

      <div className="profiles-section">
        <h3 className="section-title">Optimization Profiles</h3>
        <div className="profiles-list">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            const isActive = activeProfile === profile.id;
            return (
              <button
                key={profile.id}
                className={`profile-card ${isActive ? 'active' : ''}`}
                onClick={() => onProfileSelect(profile.id)}
                style={{ '--profile-color': profile.color } as React.CSSProperties}
              >
                <div className="profile-icon-wrapper" style={{ color: profile.color }}>
                  <Icon size={24} />
                </div>
                <div className="profile-info">
                  <span className="profile-name">{profile.name}</span>
                  <span className="profile-description">{profile.description}</span>
                </div>
                {isActive && <div className="active-indicator" />}
              </button>
            );
          })}
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
