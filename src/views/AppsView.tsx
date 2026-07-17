import React, { useState, useMemo } from 'react';
import {
  appsCatalog,
  appCategoryOrder,
  appCategoryLabels,
  appIconSlugs,
  appIconUrls,
  type AppItem,
  type AppCategory,
} from '../data/appsCatalog';
import './GamerView.css';
import './AppsView.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

const AppsView: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  // Tracks which fallback stage each app's icon is on (0 = Simple Icons,
  // 1 = website favicon, 2+ = letter avatar).
  const [iconStage, setIconStage] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<AppCategory>('Browsers');

  const getIconSources = (id: string): string[] => {
    const sources: string[] = [];
    const slug = appIconSlugs[id];
    const url = appIconUrls[id];
    if (slug) sources.push(`https://cdn.simpleicons.org/${slug}`);
    if (url) sources.push(`https://www.google.com/s2/favicons?sz=64&domain=${url}`);
    return sources;
  };

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

  const handleInstall = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const toInstall = appsCatalog.filter(a => ids.includes(a.id));
    setIsInstalling(true);
    setFailed(prev => prev.filter(id => !ids.includes(id)));

    try {
      if (electronAPI?.installApps) {
        const results = await electronAPI.installApps(toInstall);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ok = results.filter((r: any) => r.success).map((r: any) => r.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bad = results.filter((r: any) => !r.success).map((r: any) => r.id);
        setInstalled(prev => Array.from(new Set([...prev, ...ok])));
        setFailed(prev => Array.from(new Set([...prev, ...bad])));
      } else {
        // Browser preview (no Electron bridge): simulate a successful install.
        await new Promise(res => setTimeout(res, 600));
        setInstalled(prev => Array.from(new Set([...prev, ...ids])));
      }
    } finally {
      setIsInstalling(false);
      setSelected([]);
    }
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
            <button className="apply-btn" onClick={handleInstall} disabled={selected.length === 0 || isInstalling}>
              {isInstalling ? 'Installing…' : 'Install Selected'}
            </button>
          </div>
        </header>
      </div>

      <div className="apps-grid">
        {activeApps.map(app => {
          const isSelected = selected.includes(app.id);
          const isInstalled = installed.includes(app.id);
          const isFailed = failed.includes(app.id);
          const sources = getIconSources(app.id);
          const stage = iconStage[app.id] ?? 0;
          const iconSrc = sources[stage];
          return (
            <button
              key={app.id}
              className={`app-card ${isSelected ? 'selected' : ''} ${isInstalled ? 'installed' : ''} ${isFailed ? 'failed' : ''}`}
              onClick={() => toggleApp(app.id)}
              title={isFailed ? 'Install failed, try again' : (app.winget || app.name)}
            >
              <span className="app-avatar">
                {iconSrc ? (
                  <img
                    className="app-logo"
                    src={iconSrc}
                    alt=""
                    loading="lazy"
                    onError={() => setIconStage(prev => ({ ...prev, [app.id]: (prev[app.id] ?? 0) + 1 }))}
                  />
                ) : (
                  app.name.charAt(0)
                )}
              </span>
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
