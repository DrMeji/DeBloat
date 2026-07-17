import React from 'react';
import { Code, Terminal, Database, Container, Zap } from 'lucide-react';
import './DeveloperProfile.css';

interface OptimizationItem {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  enabled: boolean;
}

const developerOptimizations: OptimizationItem[] = [
  {
    id: 'wsl-optimization',
    name: 'WSL Performance Optimization',
    description: 'Optimizes Windows Subsystem for Linux for faster compilation and I/O',
    impact: 'high',
    category: 'Virtualization',
    enabled: true,
  },
  {
    id: 'hyperv',
    name: 'Enable Hyper-V Features',
    description: 'Enables necessary Hyper-V features for Docker and virtualization',
    impact: 'high',
    category: 'Virtualization',
    enabled: true,
  },
  {
    id: 'long-paths',
    name: 'Enable Long Path Support',
    description: 'Removes the 260 character path limit for node_modules and deep directories',
    impact: 'high',
    category: 'System',
    enabled: true,
  },
  {
    id: 'developer-mode',
    name: 'Enable Developer Mode',
    description: 'Enables developer features including sideloading and device discovery',
    impact: 'medium',
    category: 'System',
    enabled: true,
  },
  {
    id: 'search-indexing',
    name: 'Disable Search Indexing',
    description: 'Reduces disk I/O by disabling search indexing on project drives',
    impact: 'medium',
    category: 'Services',
    enabled: true,
  },
  {
    id: 'defender-exclusions',
    name: 'Configure Defender Exclusions',
    description: 'Excludes common dev folders from real-time scanning for better performance',
    impact: 'high',
    category: 'Security',
    enabled: true,
  },
  {
    id: 'powershell-execution',
    name: 'PowerShell Execution Policy',
    description: 'Sets execution policy to allow running unsigned scripts locally',
    impact: 'medium',
    category: 'System',
    enabled: true,
  },
  {
    id: 'environment-variables',
    name: 'Optimize Environment Variables',
    description: 'Cleans and optimizes PATH and environment variables for faster lookups',
    impact: 'low',
    category: 'System',
    enabled: true,
  },
];

const DeveloperProfile: React.FC = () => {
  const [optimizations, setOptimizations] = React.useState(developerOptimizations);

  const toggleOptimization = (id: string) => {
    setOptimizations(prev =>
      prev.map(opt =>
        opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Virtualization':
        return <Container size={16} />;
      case 'System':
        return <Terminal size={16} />;
      case 'Services':
        return <Database size={16} />;
      case 'Security':
        return <Code size={16} />;
      default:
        return <Code size={16} />;
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
    <div className="developer-profile">
      <div className="profile-header">
        <div className="profile-icon developer">
          <Code size={32} />
        </div>
        <div className="profile-info">
          <h2>Developer Profile</h2>
          <p>Optimized for software development, containers, and compilation workloads</p>
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
          <span className="stat-value">~25%</span>
          <span className="stat-label">Faster Builds</span>
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
        <button className="btn btn-primary developer-btn">
          <Zap size={18} />
          Apply Developer Profile
        </button>
      </div>
    </div>
  );
};

export default DeveloperProfile;
