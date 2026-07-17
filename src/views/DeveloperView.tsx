import React, { useState, useMemo } from 'react';
import { developerTweaks } from '../data/developerTweaks';
import type { Tweak } from '../data/gamerTweaks';
import './GamerView.css';

type TweakStatus = 'applied' | 'failed' | 'working' | 'pending';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

const DeveloperView: React.FC = () => {
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [lastAppliedTweaks, setLastAppliedTweaks] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const categoryOrder = ['Apps', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks', 'Developer Tools'];
  const categoryLabels: Record<string, string> = {
    'Scheduled Tasks': 'S Tasks',
    'Developer Tools': 'D Tools',
  };
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

  const handleApplyChanges = async () => {
    const ids = [...selectedTweaks];
    if (ids.length === 0) return;
    const toApply = developerTweaks.filter(t => ids.includes(t.id));
    setLastAppliedTweaks(ids);
    setIsApplying(true);
    setTweakStatuses(prev => {
      const next = { ...prev };
      ids.forEach(id => { next[id] = 'working'; });
      return next;
    });

    try {
      if (electronAPI?.applyTweaks) {
        const results = await electronAPI.applyTweaks(toApply, 'apply');
        setTweakStatuses(prev => {
          const next = { ...prev };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          results.forEach((r: any) => { next[r.id] = r.success ? 'applied' : 'failed'; });
          return next;
        });
      } else {
        await new Promise(res => setTimeout(res, 600));
        setTweakStatuses(prev => {
          const next = { ...prev };
          ids.forEach(id => { next[id] = 'applied'; });
          return next;
        });
      }
    } finally {
      setIsApplying(false);
      // Keep the applied tweaks switched ON so the UI reflects the machine's
      // current state instead of resetting to off.
    }
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
                {categoryLabels[category] || category}
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
                  {tweakStatuses[tweak.id] === 'applied' ? '✓' : tweakStatuses[tweak.id] === 'failed' ? '✗' : '…'}
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
