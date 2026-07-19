import React, { useMemo } from 'react';
import { developerTweaks } from '../data/developerTweaks';
import type { Tweak } from '../data/gamerTweaks';
import { useTweakRunner } from '../hooks/useTweakRunner';
import { useSession } from '../context/SessionContext';
import './GamerView.css';

const DeveloperView: React.FC = () => {
  const {
    developer,
    setProfileSelected,
    setProfilePreset,
    setProfileCategory,
    requestApply,
  } = useSession();
  const { selected: selectedTweaks, preset: activePreset, category: activeCategory } = developer;
  const { tweakStatuses, isApplying, runTweaks } = useTweakRunner();

  const categoryOrder = ['Apps', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks', 'Developer Tools'];
  const categoryLabels: Record<string, string> = {
    'Scheduled Tasks': 'S Tasks',
    'Developer Tools': 'D Tools',
  };

  const groupedTweaks = useMemo(() => {
    return developerTweaks.reduce((acc, tweak) => {
      (acc[tweak.category] = acc[tweak.category] || []).push(tweak);
      return acc;
    }, {} as Record<string, Tweak[]>);
  }, []);

  const toggleTweak = (id: string) => {
    setProfilePreset('developer', null);
    setProfileSelected('developer', prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handlePresetRecommended = () => {
    setProfileSelected('developer', developerTweaks.filter(t => t.recommended).map(t => t.id));
    setProfilePreset('developer', 'recommended');
  };

  const handlePresetAggressive = () => {
    setProfileSelected('developer', developerTweaks.map(t => t.id));
    setProfilePreset('developer', 'aggressive');
  };

  const handlePresetReset = () => {
    setProfileSelected('developer', []);
    setProfilePreset('developer', 'reset');
  };

  const handleApplyChanges = () => {
    const toApply = developerTweaks.filter(t => selectedTweaks.includes(t.id));
    if (requestApply(toApply)) void runTweaks(toApply);
  };

  const getRiskColor = (risk: Tweak['risk']) => {
    if (risk === 'safe') return '#4ade80';
    if (risk === 'moderate') return '#facc15';
    if (risk === 'aggressive') return '#f87171';
    return '#888';
  };

  const riskOrder: Record<Tweak['risk'], number> = { safe: 0, moderate: 1, aggressive: 2 };
  const activeTweaks = [...(groupedTweaks[activeCategory] || [])].sort(
    (a, b) => riskOrder[a.risk] - riskOrder[b.risk]
  );

  const statusGlyph = (status: string) => {
    if (status === 'applied') return '✓';
    if (status === 'failed') return '✗';
    if (status === 'skipped') return '–';
    return '…';
  };

  return (
    <div className="gamer-view">
      <div className="gamer-topbar">
        <div className="gamer-toolbar-row">
          <header className="gamer-toolbar gamer-toolbar-left">
            {categoryOrder.map(category => (
              <button
                key={category}
                type="button"
                className={`gamer-toolbar-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setProfileCategory('developer', category)}
              >
                {categoryLabels[category] || category}
              </button>
            ))}

            <span className="gamer-toolbar-divider" aria-hidden />

            <button
              type="button"
              className={`gamer-toolbar-tab preset-recommended ${activePreset === 'recommended' ? 'active' : ''}`}
              onClick={handlePresetRecommended}
            >
              Recommended
            </button>
            <button
              type="button"
              className={`gamer-toolbar-tab preset-aggressive ${activePreset === 'aggressive' ? 'active' : ''}`}
              onClick={handlePresetAggressive}
            >
              Aggressive
            </button>
            <button
              type="button"
              className={`gamer-toolbar-tab preset-reset ${activePreset === 'reset' ? 'active' : ''}`}
              onClick={handlePresetReset}
            >
              Reset
            </button>
          </header>

          <div className="gamer-toolbar gamer-toolbar-right">
            <span className="gamer-toolbar-count">{selectedTweaks.length}</span>
            <button
              type="button"
              className="gamer-toolbar-apply"
              onClick={handleApplyChanges}
              disabled={selectedTweaks.length === 0 || isApplying}
            >
              {isApplying ? 'Applying…' : 'Apply Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="gamer-panel">
        <div className="gamer-panel-scroll">
          <div className="tweaks-container">
            {activeTweaks.map(tweak => (
              <div key={tweak.id} className="tweak-item">
                <div className="tweak-info">
                  <span className="tweak-name">{tweak.name}</span>
                  <p className="tweak-description">{tweak.description}</p>
                </div>
                <div className="tweak-controls">
                  <span className="risk-badge" style={{ backgroundColor: getRiskColor(tweak.risk) + '20', color: getRiskColor(tweak.risk) }}>
                    {tweak.risk}
                  </span>
                  {tweakStatuses[tweak.id] && (
                    <span className={`tweak-status ${tweakStatuses[tweak.id]}`}>
                      {statusGlyph(tweakStatuses[tweak.id])}
                    </span>
                  )}
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={selectedTweaks.includes(tweak.id)}
                      onChange={() => toggleTweak(tweak.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperView;
