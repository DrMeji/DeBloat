import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Wifi,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  activeProfile: string | null;
}

const systemStats = [
  { 
    id: 'cpu', 
    label: 'CPU Usage', 
    value: '23%', 
    trend: '-12%', 
    icon: Cpu, 
    color: '#3b82f6',
    positive: true 
  },
  { 
    id: 'ram', 
    label: 'RAM Usage', 
    value: '4.2 GB', 
    trend: '-1.8 GB', 
    icon: Activity, 
    color: '#10b981',
    positive: true 
  },
  { 
    id: 'disk', 
    label: 'Disk I/O', 
    value: '2.1 MB/s', 
    trend: '-5.4 MB/s', 
    icon: HardDrive, 
    color: '#8b5cf6',
    positive: true 
  },
  { 
    id: 'network', 
    label: 'Network', 
    value: '0.3 MB/s', 
    trend: '-0.8 MB/s', 
    icon: Wifi, 
    color: '#f59e0b',
    positive: true 
  }
];

const recentOptimizations = [
  { id: 1, action: 'Disabled Xbox services', time: '2 mins ago', status: 'success' },
  { id: 2, action: 'Removed Microsoft Teams', time: '2 mins ago', status: 'success' },
  { id: 3, action: 'Disabled telemetry', time: '2 mins ago', status: 'success' },
  { id: 4, action: 'Reduced startup apps', time: '2 mins ago', status: 'success' }
];

const recommendations = [
  { id: 1, text: 'Disable Windows Search indexing for better disk performance', impact: 'Medium' },
  { id: 2, text: 'Remove OneDrive integration to reduce background sync', impact: 'Low' },
  { id: 3, text: 'Disable Superfetch/SysMain for SSD optimization', impact: 'High' }
];

export const Dashboard: React.FC<DashboardProps> = ({ activeProfile }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>System Dashboard</h1>
          <p className="subtitle">
            {activeProfile 
              ? `Running ${activeProfile.charAt(0).toUpperCase() + activeProfile.slice(1)} profile optimizations`
              : 'Select a profile to begin optimization'
            }
          </p>
        </div>
        <div className="header-actions">
          <div className="system-status">
            <CheckCircle2 size={16} className="status-icon" />
            <span>System Protected</span>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ color: stat.color }}>
                  <Icon size={20} />
                </div>
                <div className={`stat-trend ${stat.positive ? 'positive' : 'negative'}`}>
                  <TrendingUp size={14} />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Recent Optimizations</h2>
            <span className="badge">{recentOptimizations.length} actions</span>
          </div>
          <div className="optimization-list">
            {recentOptimizations.map((opt) => (
              <div key={opt.id} className="optimization-item">
                <div className="opt-status">
                  <CheckCircle2 size={16} className="success-icon" />
                </div>
                <div className="opt-details">
                  <span className="opt-action">{opt.action}</span>
                  <span className="opt-time">
                    <Clock size={12} />
                    {opt.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section recommendations">
          <div className="section-header">
            <h2>Recommendations</h2>
            <span className="badge">{recommendations.length} pending</span>
          </div>
          <div className="recommendation-list">
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-item">
                <div className="rec-icon">
                  <AlertCircle size={16} />
                </div>
                <div className="rec-details">
                  <span className="rec-text">{rec.text}</span>
                  <span className={`impact-badge impact-${rec.impact.toLowerCase()}`}>
                    {rec.impact} Impact
                  </span>
                </div>
                <button className="apply-btn">Apply</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
