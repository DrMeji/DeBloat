import React, { useState, useMemo } from 'react';
import { ultimateTweaks } from '../data/ultimateTweaks';
import type { Tweak } from '../data/gamerTweaks';
import { useTweakRunner } from '../hooks/useTweakRunner';
import './GamerView.css';
import './UltimateView.css';

interface UltimateViewProps {
  onCancel?: () => void;
}

const UltimateView: React.FC<UltimateViewProps> = ({ onCancel }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const { tweakStatuses, isApplying, runTweaks } = useTweakRunner();

  const preferredOrder = ['Apps', 'Security', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks', 'Developer Tools'];
  const categoryOrder = preferredOrder.filter(c => ultimateTweaks.some(t => t.category === c));
  const categoryLabels: Record<string, string> = {
    'Scheduled Tasks': 'S Tasks',
    'Developer Tools': 'D Tools',
  };
  const [activeCategory, setActiveCategory] = useState<string>(categoryOrder[0] || 'Apps');

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
    setSelectedTweaks(ultimateTweaks.filter(t => t.recommended).map(t => t.id));
    setActivePreset('recommended');
  };

  const handlePresetAggressive = () => {
    setSelectedTweaks(ultimateTweaks.map(t => t.id));
    setActivePreset('aggressive');
  };

  const handlePresetReset = () => {
    setSelectedTweaks([]);
    setActivePreset('reset');
  };

  const handleApplyChanges = () => {
    void runTweaks(ultimateTweaks.filter(t => selectedTweaks.includes(t.id)));
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
            The Ultimate profile combines every Gamer and Developer tweak with the most
            aggressive changes available. These options are powerful enough that they can
            leave your PC less secure or less stable.
          </p>
          <ul className="ultimate-warning-list">
            <li>Can <strong>disable Microsoft Defender, Firewall, SmartScreen, and UAC</strong>.</li>
            <li>Can <strong>remove Xbox, Edge, Bing Search, and OneDrive completely</strong>.</li>
            <li>Can <strong>permanently disable Windows Update</strong>.</li>
            <li>Some Developer options (WSL / Hyper-V) may fail inside a VirtualBox VM.</li>
          </ul>
          <p className="ultimate-warning-note">
            Nothing is applied automatically. Every option starts off, and the danger
            items are excluded from the Recommended preset. Watch the Live Terminal for
            exactly what succeeds or fails.
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

export default UltimateView;
