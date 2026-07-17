import React, { useState, useMemo } from 'react';
import { appsCatalog, appCategoryOrder, appCategoryLabels, type AppItem, type AppCategory } from '../data/appsCatalog';
import './GamerView.css';
import './AppsView.css';

const AppsView: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<AppCategory>('Browsers');

  const groupedApps = useMemo(() => {
    return appsCatalog.reduce((acc, app) => {
      (acc[app.category] = acc[app.category] || []).push(app);
      return acc;
    }, {} as Record<string, AppItem[]>);
  }, []);

  const toggleApp = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleInstall = () => {
    console.log('Installing apps:', selected);
    setInstalled(prev => Array.from(new Set([...prev, ...selected])));
    setSelected([]);
  };

  const activeApps = groupedApps[activeCategory] || [];

  return (
    <div className="gamer-view">
      <div className="gamer-topbar">
        <header className="gamer-header">
          <nav className="category-tabs apps-category-tabs">
            {appCategoryOrder.map(category => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {appCategoryLabels[category] || category}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <span className="selected-count">{selected.length}</span>
            <button className="apply-btn" onClick={handleInstall} disabled={selected.length === 0}>
              Install Selected
            </button>
          </div>
        </header>
      </div>

      <div className="apps-grid">
        {activeApps.map(app => {
          const isSelected = selected.includes(app.id);
          const isInstalled = installed.includes(app.id);
          return (
            <button
              key={app.id}
              className={`app-card ${isSelected ? 'selected' : ''} ${isInstalled ? 'installed' : ''}`}
              onClick={() => toggleApp(app.id)}
              title={app.winget || app.name}
            >
              <span className="app-avatar">{app.name.charAt(0)}</span>
              <span className="app-name">{app.name}</span>
              <span className="app-dot" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppsView;
