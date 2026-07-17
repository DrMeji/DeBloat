import React, { useState, useMemo } from 'react';
import { gamerTweaks, Tweak } from '../data/gamerTweaks';
import './GamerView.css';

type TweakStatus = 'applied' | 'failed' | 'pending';

const GamerView: React.FC = () => {
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [lastAppliedTweaks, setLastAppliedTweaks] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Apps', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks']);

  const groupedTweaks = useMemo(() => {
    return gamerTweaks.reduce((acc, tweak) => {
      (acc[tweak.category] = acc[tweak.category] || []).push(tweak);
      return acc;
    }, {} as Record<string, Tweak[]>);
  }, []);

  const toggleTweak = (id: string) => {
    setSelectedTweaks(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handlePresetRecommended = () => {
    const recommendedIds = gamerTweaks.filter(t => t.recommended).map(t => t.id);
    setSelectedTweaks(recommendedIds);
  };

  const handlePresetAggressive = () => {
    const allIds = gamerTweaks.map(t => t.id);
    setSelectedTweaks(allIds);
  };

  const handlePresetReset = () => {
    setSelectedTweaks([]);
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
      console.log('No recent changes to undo.');
      return;
    }
    console.log('Undoing tweaks:', lastAppliedTweaks);
    const newStatuses = { ...tweakStatuses };
    lastAppliedTweaks.forEach(id => {
      delete newStatuses[id];
    });
    setTweakStatuses(newStatuses);
    setLastAppliedTweaks([]);
  };

  const getRiskColor = (risk: Tweak['risk']) => {
    if (risk === 'safe') return '#4ade80'; // green
    if (risk === 'moderate') return '#facc15'; // yellow
    if (risk === 'aggressive') return '#f87171'; // red
    return '#888';
  };

  return (
    <div className="gamer-view">
      <header className="gamer-header">
        <button className="preset-btn" onClick={handlePresetRecommended}>Recommended</button>
        <button className="preset-btn" onClick={handlePresetAggressive}>Aggressive</button>
        <button className="preset-btn" onClick={handlePresetReset}>Reset</button>
      </header>

      <div className="tweaks-container">
        {Object.entries(groupedTweaks).map(([category, tweaks]) => (
          <div key={category} className="category-section">
            <h3 className="category-header" onClick={() => toggleCategory(category)}>
              {category}
              <span className={`chevron ${expandedCategories.includes(category) ? 'expanded' : ''}`}>›</span>
            </h3>
            {expandedCategories.includes(category) && (
              <div className="category-content">
                {tweaks.map(tweak => (
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
            )}
          </div>
        ))}
      </div>

      <footer className="gamer-footer">
        <div className="footer-info">
          {selectedTweaks.length} tweak{selectedTweaks.length !== 1 ? 's' : ''} selected
        </div>
        <div className="footer-actions">
          <button className="undo-btn" onClick={handleUndoLast} disabled={lastAppliedTweaks.length === 0}>
            Undo Last
          </button>
          <button className="apply-btn" onClick={handleApplyChanges} disabled={selectedTweaks.length === 0}>
            Apply Changes
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GamerView;
