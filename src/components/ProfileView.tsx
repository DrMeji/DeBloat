import React, { useState } from 'react';
import { 
  Gamepad2, 
  Code2, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  Shield,
  Clock,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import './ProfileView.css';

interface ProfileViewProps {
  profileId: string;
}

const profileData = {
  gamer: {
    name: 'Gamer',
    icon: Gamepad2,
    color: '#10b981',
    description: 'Maximum FPS & gaming performance',
    longDescription: 'Optimizes Windows for the best possible gaming performance by removing unnecessary Microsoft applications, disabling non-essential background services, reducing CPU, RAM, and disk usage, minimizing input latency, and applying performance-focused system tweaks.',
    optimizations: [
      { category: 'Services', items: ['Disable Xbox services', 'Disable Print Spooler', 'Disable Fax', 'Disable Remote Registry'], impact: 85 },
      { category: 'Apps', items: ['Remove Microsoft Teams', 'Remove Xbox Game Bar', 'Remove Cortana', 'Remove Microsoft News'], impact: 70 },
      { category: 'Telemetry', items: ['Disable Windows Telemetry', 'Disable Activity History', 'Disable Location Tracking'], impact: 90 },
      { category: 'Performance', items: ['Disable Game DVR', 'Optimize GPU scheduling', 'Disable full-screen optimizations'], impact: 95 }
    ],
    benefits: ['Up to 15% FPS increase', 'Reduced input latency', 'Lower CPU/RAM usage', 'Faster boot times']
  },
  developer: {
    name: 'Developer',
    icon: Code2,
    color: '#3b82f6',
    description: 'Optimized for coding & development',
    longDescription: 'Builds a clean, efficient development environment by removing consumer-focused applications while preserving essential development tools and Windows components. Optimizes for compiling code, virtualization, containers, local AI models, and professional software development.',
    optimizations: [
      { category: 'Services', items: ['Disable Windows Search', 'Disable Superfetch', 'Disable Windows Ink'], impact: 75 },
      { category: 'Apps', items: ['Remove consumer apps', 'Keep WSL enabled', 'Keep Hyper-V', 'Remove Microsoft Store apps'], impact: 65 },
      { category: 'Environment', items: ['Enable long paths', 'Optimize PATH', 'Disable Windows Defender for dev folders'], impact: 80 },
      { category: 'Performance', items: ['Increase file handles', 'Optimize WSL2 memory', 'Enable developer mode'], impact: 85 }
    ],
    benefits: ['Faster compile times', 'Better Docker performance', 'Reduced background overhead', 'Optimized WSL2']
  },
  extreme: {
    name: 'Extreme',
    icon: Zap,
    color: '#ef4444',
    description: 'Maximum optimization possible',
    longDescription: 'The most aggressive optimization profile. Combines all Gamer and Developer optimizations while going even further by disabling or removing nearly every non-essential Windows feature, service, scheduled task, startup application, telemetry component, and background process.',
    optimizations: [
      { category: 'Services', items: ['Disable 40+ services', 'Remove non-essential drivers', 'Disable system restore'], impact: 95 },
      { category: 'Apps', items: ['Remove all store apps', 'Remove Cortana completely', 'Remove Windows Media Player'], impact: 90 },
      { category: 'System', items: ['Disable hibernation', 'Remove pagefile', 'Disable indexing completely'], impact: 100 },
      { category: 'Tasks', items: ['Disable scheduled tasks', 'Remove startup items', 'Disable auto-updates'], impact: 95 }
    ],
    benefits: ['Maximum performance gains', 'Lowest resource usage', 'Minimal Windows footprint', 'Complete control']
  }
};

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  
  const profile = profileData[profileId as keyof typeof profileData];
  
  if (!profile) {
    return <div className="profile-view">Profile not found</div>;
  }
  
  const Icon = profile.icon;
  const totalOptimizations = profile.optimizations.reduce((acc, cat) => acc + cat.items.length, 0);
  
  const toggleOptimization = (item: string) => {
    setSelectedOptimizations(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <div className="profile-view">
      <div className="profile-hero" style={{ '--profile-color': profile.color } as React.CSSProperties}>
        <div className="hero-icon">
          <Icon size={48} />
        </div>
        <div className="hero-content">
          <h1>{profile.name} Profile</h1>
          <p className="hero-description">{profile.description}</p>
        </div>
      </div>

      <div className="profile-info-card">
        <p>{profile.longDescription}</p>
      </div>

      <div className="benefits-section">
        <h2>Key Benefits</h2>
        <div className="benefits-grid">
          {profile.benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <CheckCircle2 size={16} style={{ color: profile.color }} />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="optimizations-section">
        <div className="section-header">
          <h2>Optimizations</h2>
          <div className="optimization-count">
            {selectedOptimizations.length > 0 
              ? `${selectedOptimizations.length} of ${totalOptimizations} selected`
              : `${totalOptimizations} optimizations available`
            }
          </div>
        </div>

        <div className="categories-list">
          {profile.optimizations.map((category) => {
            const isExpanded = expandedCategory === category.category;
            const categoryItems = category.items.join(',');
            const selectedInCategory = selectedOptimizations.filter(i => category.items.includes(i)).length;
            
            return (
              <div key={category.category} className={`category-card ${isExpanded ? 'expanded' : ''}`}>
                <button 
                  className="category-header"
                  onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                >
                  <div className="category-info">
                    <span className="category-name">{category.category}</span>
                    <span className="category-items">{category.items.length} optimizations</span>
                  </div>
                  <div className="category-meta">
                    <div className="impact-bar">
                      <div 
                        className="impact-fill" 
                        style={{ 
                          width: `${category.impact}%`,
                          background: profile.color 
                        }}
                      />
                    </div>
                    <span className="impact-value">{category.impact}%</span>
                    <ChevronRight size={16} className={`chevron ${isExpanded ? 'rotated' : ''}`} />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="category-content">
                    {category.items.map((item) => (
                      <label key={item} className="optimization-item">
                        <input
                          type="checkbox"
                          checked={selectedOptimizations.includes(item)}
                          onChange={() => toggleOptimization(item)}
                        />
                        <span className="checkmark"></span>
                        <span className="item-text">{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="action-bar">
        <div className="protection-notice">
          <Shield size={16} />
          <span>System Restore point will be created automatically</span>
        </div>
        <div className="action-buttons">
          <button className="btn-secondary">Preview Changes</button>
          <button 
            className="btn-primary"
            style={{ background: profile.color }}
          >
            Apply {profile.name} Profile
          </button>
        </div>
      </div>
    </div>
  );
};
