import React from 'react';
import { Zap, AlertTriangle, Shield, Trash2, Settings } from 'lucide-react';
import './ExtremeProfile.css';

interface OptimizationItem {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  warning?: boolean;
  enabled: boolean;
}

const extremeOptimizations: OptimizationItem[] = [
  {
    id: 'telemetry-disable',
    name: 'Complete Telemetry Disable',
    description: 'Disables all Windows telemetry, diagnostics, and data collection services',
    impact: 'high',
    category: 'Privacy',
    enabled: true,
  },
  {
    id: 'scheduled-tasks',
    name: 'Disable Non-Essential Scheduled Tasks',
    description: 'Removes all non-critical scheduled tasks including CEIP, compatibility, and maintenance tasks',
    impact: 'high',
    category: 'System',
    enabled: true,
  },
  {
    id: 'services-disable',
    name: 'Aggressive Service Disable',
    description: 'Disables all non-essential Windows services including Xbox, Maps, Printing, and more',
    impact: 'high',
    category: 'Services',
    warning: true,
    enabled: true,
  },
  {
    id: 'appx-removal',
    name: 'Remove All Pre-installed Apps',
    description: 'Removes all Windows Store apps including Photos, Mail, Calendar, and others',
    impact: 'high',
    category: 'Apps',
    warning: true,
    enabled: true,
  },
  {
    id: 'cortana-remove',
    name: 'Remove Cortana',
    description: 'Completely removes Cortana and its associated services from the system',
    impact: 'medium',
    category: 'System',
    enabled: true,
  },
  {
    id: 'edge-remove',
    name: 'Remove Microsoft Edge',
    description: 'Removes Edge browser and its background processes',
    impact: 'high',
    category: 'Apps',
    warning: true,
    enabled: false,
  },
  {
    id: 'store-remove',
    name: 'Remove Microsoft Store',
    description: 'Removes the Microsoft Store and its dependencies',
    impact: 'high',
    category: 'Apps',
    warning: true,
    enabled: false,
  },
  {
    id: 'windows-defender',
    name: 'Configure Windows Defender',
    description: 'Reduces Defender overhead while maintaining core security',
    impact: 'high',
    category: 'Security',
    warning: true,
    enabled: true,
  },
  {
    id: 'search-disable',
    name: 'Disable Windows Search',
    description: 'Completely disables Windows Search indexing and service',
    impact: 'medium',
    category: 'Services',
    enabled: true,
  },
  {
    id: 'updates-pause',
    name: 'Configure Update Behavior',
    description: 'Sets Windows Update to notify before downloading, pauses automatic restarts',
    impact: 'medium',
    category: 'System',
    enabled: true,
  },
  {
    id: 'uac-configure',
    name: 'Configure UAC',
    description: 'Adjusts User Account Control settings for reduced prompts',
    impact: 'low',
    category: 'Security',
    enabled: true,
  },
  {
    id: 'startup-optimize',
    name: 'Optimize Startup Items',
    description: 'Disables all non-essential startup programs and services',
    impact: 'high',
    category: 'System',
    enabled: true,
  },
];

const ExtremeProfile: React.FC = () => {
  const [optimizations, setOptimizations] = React.useState(extremeOptimizations);

  const toggleOptimization = (id: string) => {
    setOptimizations(prev =>
      prev.map(opt =>
        opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
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

  const enabledCount = optimizations.filter(o => o.enabled).length;
  const warningCount = optimizations.filter(o => o.warning && o.enabled).length;

  return (
    <div className="extreme-profile">
      <div className="profile-header">
        <div className="profile-icon extreme">
          <Zap size={32} />
        </div>
        <div className="profile-info">
          <h2>Extreme Profile</h2>
          <p>Maximum optimization with aggressive system modifications</p>
        </div>
      </div>

      {warningCount > 0 && (
        <div className="warning-banner">
          <AlertTriangle size={20} />
          <div className="warning-content">
            <strong>Warning:</strong> {warningCount} aggressive optimizations are enabled. Some changes may affect system functionality or require manual restoration.
          </div>
        </div>
      )}

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">{enabledCount}/{optimizations.length}</span>
          <span className="stat-label">Optimizations</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">Maximum</span>
          <span className="stat-label">Performance Impact</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">~40%</span>
          <span className="stat-label">Resource Reduction</span>
        </div>
      </div>

      <div className="optimizations-grid">
        {optimizations.map(opt => (
          <div key={opt.id} className={`optimization-card ${opt.enabled ? 'enabled' : ''} ${opt.warning ? 'has-warning' : ''}`}>
            <div className="opt-header">
              <div className="opt-icon">
                {opt.warning ? <AlertTriangle size={16} /> : <Settings size={16} />}
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
        <button className="btn btn-secondary">Create Restore Point</button>
        <button className="btn btn-warning">Preview Changes</button>
        <button className="btn btn-danger extreme-btn">
          <Trash2 size={18} />
          Apply Extreme Profile
        </button>
      </div>
    </div>
  );
};

export default ExtremeProfile;
