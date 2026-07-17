import React, { useState, useMemo } from 'react';
import { developerTweaks } from '../data/developerTweaks';
import type { Tweak } from '../data/gamerTweaks';
import './GamerView.css';

type TweakStatus = 'applied' | 'failed' | 'pending';

const DeveloperView: React.FC = () => {
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [lastAppliedTweaks, setLastAppliedTweaks] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const categoryOrder = ['Apps', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks', 'Developer Tools'];
  const [activeCategory, setActiveCategory] = useState<string>('Apps');

  const groupedTweaks = useMemo(() => {
    return developerTweaks.reduce((acc, tweak) => {
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
    const recommendedIds = developerTweaks.filter(t => t.recommended).map(t => t.id);
    setSelectedTweaks(recommendedIds);
    setActivePreset('recommended');
  };

  const handlePresetAggressive = () => {
    const allIds = developerTweaks.map(t => t.id);
    setSelectedTweaks(allIds);
    setActivePreset('aggressive');
  };

  const handlePresetReset = () => {
    setSelectedTweaks([]);
    setActivePreset('reset');
  };

  const handleApplyChanges = () => {
    console.log('Applying tweaks:', selectedTweaks);
    const newStatuses: Record<string, TweakStatus> = {};
    // Simulate applying tweaks (in a real scenario, this would be an async IPC call)
    selectedTweaks.forEach(id => {
      // Simulate some failing for demonstration
      newStatuses[id] = Math.random() > 0.2 ? 'applied' : 'failed';
    });
    setTweakStatuses(prev => ({ ...prev, ...newStatuses }));
    setLastAppliedTweaks(selectedTweaks);
    setSelectedTweaks([]);
  };

  const handleUndoLast = () => {
    if (lastAppliedTweaks.length === 0) {
      return;
    }
    console.log('Undoing tweaks:', lastAppliedTweaks);
    setTweakStatuses(prev => {
      const next = { ...prev };
      lastAppliedTweaks.forEach(id => {
        delete next[id];
      });
      return next;
    });
    // Bring the reverted tweaks back as selected so the change is visible
    setSelectedTweaks(lastAppliedTweaks);
    setActivePreset(null);
    setLastAppliedTweaks([]);
  };

  const getRiskColor = (risk: Tweak['risk']) => {
    if (risk === 'safe') return '#4ade80'; // green
    if (risk === 'moderate') return '#facc15'; // yellow
    if (risk === 'aggressive') return '#f87171'; // red
    return '#888';
  };

  const activeTweaks = groupedTweaks[activeCategory] || [];

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

export default DeveloperView;
