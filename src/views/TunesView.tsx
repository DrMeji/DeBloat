import React, { useMemo } from 'react';
import { tunesTweaks } from '../data/tunesTweaks';
import type { Tweak } from '../data/gamerTweaks';
import { useTweakRunner } from '../hooks/useTweakRunner';
import { useSession } from '../context/SessionContext';
import './GamerView.css';

const TunesView: React.FC = () => {
  const {
    tunes,
    setProfileSelected,
    setProfilePreset,
    setProfileCategory,
    requestApply,
  } = useSession();
  const { selected: selectedTweaks, preset: activePreset, category: activeCategory } = tunes;
  const { tweakStatuses, isApplying, runTweaks } = useTweakRunner();

  const categoryOrder = ['Appearance', 'Search', 'Privacy', 'System'];

  const groupedTweaks = useMemo(() => {
    return tunesTweaks.reduce((acc, tweak) => {
      (acc[tweak.category] = acc[tweak.category] || []).push(tweak);
      return acc;
    }, {} as Record<string, Tweak[]>);
  }, []);

  const toggleTweak = (id: string) => {
    setProfilePreset('tunes', null);
    setProfileSelected('tunes', prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handlePresetRecommended = () => {
    setProfileSelected('tunes', tunesTweaks.filter(t => t.recommended).map(t => t.id));
    setProfilePreset('tunes', 'recommended');
  };

  const handlePresetAggressive = () => {
    setProfileSelected('tunes', tunesTweaks.map(t => t.id));
    setProfilePreset('tunes', 'aggressive');
  };

  const handlePresetReset = () => {
    setProfileSelected('tunes', []);
    setProfilePreset('tunes', 'reset');
  };

  const handleApplyChanges = () => {
    const toApply = tunesTweaks.filter(t => selectedTweaks.includes(t.id));
    if (requestApply(toApply)) void runTweaks(toApply);
  };

  const getRiskColor = (risk: Tweak['risk']) => {
    if (risk === 'safe') return '#4ade80';
    if (risk === 'moderate') return '#facc15';
    if (risk === 'aggressive') return '#f87171';
    return '#888';
  };

  const riskOrder: Record<Tweak['risk'], number> = { safe: 0, moderate: 1, aggressive: 2 };
  const category = categoryOrder.includes(activeCategory) ? activeCategory : categoryOrder[0];
  const activeTweaks = [...(groupedTweaks[category] || [])].sort(
    (a, b) => riskOrder[a.risk] - riskOrder[b.risk]
  );

  return (
    <div className="gamer-view">
      <div className="gamer-topbar">
        <div className="gamer-toolbar-row">
          <header className="gamer-toolbar gamer-toolbar-left">
            {categoryOrder.map(cat => (
              <button
                key={cat}
                type="button"
                className={`gamer-toolbar-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setProfileCategory('tunes', cat)}
              >
                {cat}
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
                      {tweakStatuses[tweak.id] === 'applied' ? '✓'
                        : tweakStatuses[tweak.id] === 'failed' ? '✗'
                        : tweakStatuses[tweak.id] === 'skipped' ? '–'
                        : '…'}
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

export default TunesView;
