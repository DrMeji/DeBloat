import React, { useState, useMemo } from 'react';
import { ultimateTweaks } from '../data/ultimateTweaks';
import type { Tweak } from '../data/gamerTweaks';
import './GamerView.css';
import './UltimateView.css';

type TweakStatus = 'applied' | 'failed' | 'working' | 'pending';

interface UltimateViewProps {
  onCancel?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

const UltimateView: React.FC<UltimateViewProps> = ({ onCancel }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

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

  const handleApplyChanges = async () => {
    const ids = [...selectedTweaks];
    if (ids.length === 0) return;
    const toApply = ultimateTweaks.filter(t => ids.includes(t.id));
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
      setSelectedTweaks([]);
    }
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

  if (!acknowledged) {
    return (
      <div className="ultimate-warning">
        <div className="ultimate-warning-card">
          <div className="ultimate-warning-icon">!</div>
          <h1 className="ultimate-warning-title">Proceed with Caution</h1>
          <p className="ultimate-warning-lead">
            The Ultimate profile includes the most aggressive changes available. These options are
            powerful enough that they can leave your PC less secure or less stable.
          </p>
          <ul className="ultimate-warning-list">
            <li>Can <strong>disable Microsoft Defender</strong>, leaving no built-in antivirus.</li>
            <li>Can <strong>turn off SmartScreen</strong>, so downloaded files run without warnings.</li>
            <li>Can <strong>disable CPU security mitigations</strong> for extra performance.</li>
            <li>Some changes require a reboot and may affect system stability.</li>
          </ul>
          <p className="ultimate-warning-note">
            Nothing is applied automatically. Every option starts off, and the danger items are
            excluded from the Recommended preset. You are in control of what runs.
          </p>
          <div className="ultimate-warning-actions">
            {onCancel && (
              <button className="ultimate-btn-cancel" onClick={onCancel}>
                Go Back
              </button>
            )}
            <button className="ultimate-btn-continue" onClick={() => setAcknowledged(true)}>
              I Understand, Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

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

export default UltimateView;
