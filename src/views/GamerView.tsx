import React, { useMemo } from 'react';
import { gamerTweaks, Tweak } from '../data/gamerTweaks';
import { useTweakRunner } from '../hooks/useTweakRunner';
import { useSession } from '../context/SessionContext';
import './GamerView.css';

const GamerView: React.FC = () => {
  const {
    gamer,
    setProfileSelected,
    setProfilePreset,
    setProfileCategory,
  } = useSession();
  const { selected: selectedTweaks, preset: activePreset, category: activeCategory } = gamer;
  const { tweakStatuses, isApplying, runTweaks } = useTweakRunner();

  const categoryOrder = ['Apps', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks'];

  const groupedTweaks = useMemo(() => {
    return gamerTweaks.reduce((acc, tweak) => {
      (acc[tweak.category] = acc[tweak.category] || []).push(tweak);
      return acc;
    }, {} as Record<string, Tweak[]>);
  }, []);

  const toggleTweak = (id: string) => {
    setProfilePreset('gamer', null);
    setProfileSelected('gamer', prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handlePresetRecommended = () => {
    setProfileSelected('gamer', gamerTweaks.filter(t => t.recommended).map(t => t.id));
    setProfilePreset('gamer', 'recommended');
  };

  const handlePresetAggressive = () => {
    setProfileSelected('gamer', gamerTweaks.map(t => t.id));
    setProfilePreset('gamer', 'aggressive');
  };

  const handlePresetReset = () => {
    setProfileSelected('gamer', []);
    setProfilePreset('gamer', 'reset');
  };

  const handleApplyChanges = () => {
    void runTweaks(gamerTweaks.filter(t => selectedTweaks.includes(t.id)));
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

  return (
    <div className="gamer-view">
      <div className="gamer-topbar">
        <header className="gamer-header">
          <nav className="category-tabs">
            {categoryOrder.map(category => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setProfileCategory('gamer', category)}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <div className="preset-group">
              <button
                className={`preset-tab ${activePreset === 'recommended' ? 'active' : ''}`}
                onClick={handlePresetRecommended}
              >
                Recommended
              </button>
              <button
                className={`preset-tab ${activePreset === 'aggressive' ? 'active' : ''}`}
                onClick={handlePresetAggressive}
              >
                Aggressive
              </button>
              <button
                className={`preset-tab ${activePreset === 'reset' ? 'active' : ''}`}
                onClick={handlePresetReset}
              >
                Reset
              </button>
            </div>
            <span className="selected-count">{selectedTweaks.length}</span>
            <button className="apply-btn" onClick={handleApplyChanges} disabled={selectedTweaks.length === 0 || isApplying}>
              {isApplying ? 'Applying…' : 'Apply Changes'}
            </button>
          </div>
        </header>
      </div>

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
  );
};

export default GamerView;
