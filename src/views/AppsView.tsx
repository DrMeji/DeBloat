import React from 'react';
import { managedApps } from '../data/apps';
import './AppsView.css';

const AppsView: React.FC = () => {
  return (
    <div className="apps-view">
      <header className="apps-header">
        <h1>Manage Applications</h1>
        <p>View and manage installed applications on your system.</p>
      </header>
      <div className="apps-list-container">
        {managedApps.map(app => {
          const Icon = app.icon;
          return (
            <div key={app.id} className="app-item">
              <div className="app-icon-wrapper">
                <Icon size={28} />
              </div>
              <div className="app-info">
                <span className="app-name">{app.name}</span>
                <p className="app-description">{app.description}</p>
              </div>
              <div className="app-actions">
                <button className="app-action-btn">Manage</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppsView;
