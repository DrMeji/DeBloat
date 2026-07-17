import React from 'react';
import { 
  Cpu, 
  Activity, 
  Monitor,
  HardDrive, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import './Dashboard.css';

const systemStats = [
  { 
    id: 'cpu', 
    label: 'CPU', 
    value: '23%', 
    trend: '-12%', 
    icon: Cpu, 
    color: '#3b82f6',
    positive: true 
  },
  { 
    id: 'memory', 
    label: 'Memory', 
    value: '4.2 GB', 
    trend: '-1.8 GB', 
    icon: Activity, 
    color: '#10b981',
    positive: true 
  },
  { 
    id: 'gpu', 
    label: 'GPU', 
    value: '31%', 
    trend: '-8%', 
    icon: Monitor, 
    color: '#8b5cf6',
    positive: true 
  },
  { 
    id: 'storage', 
    label: 'Storage', 
    value: '2.1 MB/s', 
    trend: '-5.4 MB/s', 
    icon: HardDrive, 
    color: '#f59e0b',
    positive: true 
  }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>System Dashboard</h1>
          <p className="subtitle">
            Live system resource monitoring
          </p>
        </div>
        <div className="header-actions">
          <div className="system-status">
            <CheckCircle2 size={16} className="status-icon" />
            <span>System Optimized</span>
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
    </div>
  );
};
