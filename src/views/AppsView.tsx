import React, { useMemo, useEffect } from 'react';
import {
  appsCatalog,
  appCategoryOrder,
  appCategoryLabels,
  appIconSlugs,
  appIconUrls,
  type AppItem,
} from '../data/appsCatalog';
import { useTerminal } from '../context/TerminalContext';
import { useSession } from '../context/SessionContext';
import './GamerView.css';
import './AppsView.css';

interface AppsViewProps {
  onNavigateToTerminal: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

const AppsView: React.FC<AppsViewProps> = ({ onNavigateToTerminal }) => {
  const { isApplying, runAppInstalls } = useTerminal();
  const {
    appsSelected: selected,
    appsInstalled: installed,
    appsFailed: failed,
    appsCategory: activeCategory,
    appsScanned,
    setAppsSelected,
    setAppsInstalled,
    setAppsFailed,
    setAppsCategory,
    setAppsScanned,
    markAppsInstalled,
  } = useSession();

  const [iconStage, setIconStage] = React.useState<Record<string, number>>({});

  useEffect(() => {
    if (appsScanned) return;
    let cancelled = false;
    (async () => {
      try {
        if (electronAPI?.checkInstalledApps) {
          const ids: string[] = await electronAPI.checkInstalledApps(
            appsCatalog.map(a => ({ id: a.id, name: a.name, winget: a.winget }))
          );
          if (!cancelled && Array.isArray(ids)) {
            setAppsInstalled(prev => Array.from(new Set([...prev, ...ids])));
            setAppsSelected(prev => prev.filter(id => !ids.includes(id)));
          }
        }
      } finally {
        if (!cancelled) setAppsScanned(true);
      }
    })();
    return () => { cancelled = true; };
  }, [appsScanned, setAppsInstalled, setAppsSelected, setAppsScanned]);

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
    if (isApplying || installed.includes(id)) return;
    setAppsSelected(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleInstall = async () => {
    const ids = selected.filter(id => !installed.includes(id));
    if (ids.length === 0 || isApplying) return;
    const toInstall = appsCatalog.filter(a => ids.includes(a.id));
    setAppsFailed(prev => prev.filter(id => !ids.includes(id)));
    setAppsSelected([]);
    onNavigateToTerminal();
    const { ok, bad } = await runAppInstalls(toInstall);
    markAppsInstalled(ok);
    setAppsFailed(prev => Array.from(new Set([...prev, ...bad])));
  };

  const activeApps = groupedApps[activeCategory] || [];
  const selectableCount = selected.filter(id => !installed.includes(id)).length;
  const scanning = !appsScanned;

  return (
    <div className="gamer-view">
      <div className="gamer-topbar">
        <div className="gamer-toolbar-row">
          <header className="gamer-toolbar gamer-toolbar-left apps-toolbar-left">
            {appCategoryOrder.map(category => (
              <button
                key={category}
                type="button"
                className={`gamer-toolbar-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setAppsCategory(category)}
              >
                {appCategoryLabels[category] || category}
              </button>
            ))}
          </header>

          <div className="gamer-toolbar gamer-toolbar-right">
            <span className="gamer-toolbar-count">{selectableCount}</span>
            <button
              type="button"
              className="gamer-toolbar-apply"
              onClick={() => void handleInstall()}
              disabled={selectableCount === 0 || isApplying || scanning}
            >
              {isApplying ? 'Installing…' : scanning ? 'Scanning…' : 'Install Selected'}
            </button>
          </div>
        </div>
      </div>

      <div className="gamer-panel">
        <div className="gamer-panel-scroll">
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
                  disabled={isApplying || isInstalled}
                  title={
                    isInstalled
                      ? 'Already installed'
                      : isFailed
                        ? 'Install failed, try again'
                        : (app.winget || app.name)
                  }
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
                  {isInstalled ? (
                    <span className="app-status">Installed</span>
                  ) : (
                    <span className="app-dot" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsView;
