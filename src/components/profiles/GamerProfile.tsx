import React from 'react';
import { Gamepad2, Cpu, HardDrive, Wifi, Zap } from 'lucide-react';
import './GamerProfile.css';

interface OptimizationItem {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  enabled: boolean;
}

const gamerOptimizations: OptimizationItem[] = [
  {
    id: 'game-mode',
    name: 'Game Mode',
    description: 'Enables Windows Game Mode for optimized gaming performance',
    impact: 'high',
    category: 'System',
    enabled: true,
  },
  {
    id: 'gpu-scheduling',
    name: 'Hardware-accelerated GPU scheduling',
    description: 'Reduces latency by allowing the GPU to manage its own memory',
    impact: 'high',
    category: 'Graphics',
    enabled: true,
  },
  {
    id: 'xbox-services',
    name: 'Disable Xbox Services',
    description: 'Disables Xbox-related background services when not in use',
    impact: 'medium',
    category: 'Services',
    enabled: true,
  },
  {
    id: 'game-bar',
    name: 'Disable Game Bar',
    description: 'Removes Game Bar overlay that can impact performance',
    impact: 'medium',
    category: 'System',
    enabled: true,
  },
  {
    id: 'background-apps',
    name: 'Disable Background Apps',
    description: 'Prevents apps from running in the background during gaming',
    impact: 'high',
    category: 'System',
    enabled: true,
  },
  {
    id: 'power-plan',
    name: 'Ultimate Performance Power Plan',
    description: 'Enables maximum performance power settings',
    impact: 'high',
    category: 'Power',
    enabled: true,
  },
  {
    id: 'visual-effects',
    name: 'Disable Visual Effects',
    description: 'Reduces UI animations and visual effects for better performance',
    impact: 'medium',
    category: 'System',
    enabled: true,
  },
  {
    id: 'mouse-precision',
    name: 'Disable Mouse Acceleration',
    description: 'Removes mouse acceleration for precise aiming',
    impact: 'high',
    category: 'Input',
    enabled: true,
  },
];

const GamerProfile: React.FC = () => {
  const [optimizations, setOptimizations] = React.useState(gamerOptimizations);

  const toggleOptimization = (id: string) => {
    setOptimizations(prev =>
      prev.map(opt =>
        opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Graphics':
        return <Gamepad2 size={16} />;
      case 'Services':
        return <Cpu size={16} />;
      case 'System':
        return <HardDrive size={16} />;
      case 'Power':
        return <Zap size={16} />;
      case 'Input':
        return <Wifi size={16} />;
      default:
        return <Cpu size={16} />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'impact-high';
      case 'medium':
        return 'impact-medium';
      case 'low':
        return 'impact-low';
      default:
        return '';
    }
  };

  return (
    <div className="gamer-profile">
      <div className="profile-header">
        <div className="profile-icon gamer">
          <Gamepad2 size={32} />
        </div>
        <div className="profile-info">
          <h2>Gamer Profile</h2>
          <p>Optimized for maximum gaming performance and FPS</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">8</span>
          <span className="stat-label">Optimizations</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">High</span>
          <span className="stat-label">Performance Impact</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">~15%</span>
          <span className="stat-label">Expected FPS Gain</span>
        </div>
      </div>

      <div className="optimizations-grid">
        {optimizations.map(opt => (
          <div key={opt.id} className={`optimization-card ${opt.enabled ? 'enabled' : ''}`}>
            <div className="opt-header">
              <div className="opt-icon">
                {getCategoryIcon(opt.category)}
              </div>
              <div className="opt-title">
                <h4>{opt.name}</h4>
                <span className={`impact-badge ${getImpactColor(opt.impact)}`}>
                  {opt.impact} impact
                </span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={opt.enabled}
                  onChange={() => toggleOptimization(opt.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
            <p className="opt-description">{opt.description}</p>
          </div>
        ))}
      </div>

      <div className="profile-actions">
        <button className="btn btn-secondary">Preview Changes</button>
        <button className="btn btn-primary gamer-btn">
          <Zap size={18} />
          Apply Gamer Profile
        </button>
      </div>
    </div>
  );
};

export default GamerProfile;
