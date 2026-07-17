import React, { useState, useMemo } from 'react';
import { ultimateTweaks } from '../data/ultimateTweaks';
import type { Tweak } from '../data/gamerTweaks';
import './GamerView.css';

type TweakStatus = 'applied' | 'failed' | 'pending';

const UltimateView: React.FC = () => {
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [lastAppliedTweaks, setLastAppliedTweaks] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const categoryOrder = ['Performance', 'Services', 'Security'];
  const [activeCategory, setActiveCategory] = useState<string>('Performance');

  const groupedTweaks = useMemo(() => {
    return ultimateTweaks.reduce((acc, tweak) => {
      (acc[tweak.category] = acc[tweak.category] || []).push(tweak);
      return acc;
    }, {} as Record<string, Tweak[]>);
  }, []);

  const toggleTweak = (id: string) => {
    setActivePreset(null);
    setSelectedTweaks(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handlePresetRecommended = () => {
    const recommendedIds = ultimateTweaks.filter(t => t.recommended).map(t => t.id);
    setSelectedTweaks(recommendedIds);
    setActivePreset('recommended');
  };

  const handlePresetAggressive = () => {
    const allIds = ultimateTweaks.map(t => t.id);
    setSelectedTweaks(allIds);
    setActivePreset('aggressive');
  };

  const handlePresetReset = () => {
    setSelectedTweaks([]);
    setActivePreset('reset');
  };

  const handleApplyChanges = () => {
    console.log('Applying ULTIMATE tweaks:', selectedTweaks);
    const newStatuses: Record<string, TweakStatus> = {};
    selectedTweaks.forEach(id => {
      newStatuses[id] = Math.random() > 0.2 ? 'applied' : 'failed';
    });
    setTweakStatuses(prev => ({ ...prev, ...newStatuses }));
    setLastAppliedTweaks(selectedTweaks);
    setSelectedTweaks([]);
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
                onClick={() => setActiveCategory(category)}
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
            <button className="apply-btn" onClick={handleApplyChanges} disabled={selectedTweaks.length === 0}>
              Apply Changes
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
                  {tweakStatuses[tweak.id] === 'applied' ? '✓' : '✗'}
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

export default UltimateView;
