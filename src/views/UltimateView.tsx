import React, { useState, useMemo } from 'react';
import { ultimateTweaks } from '../data/ultimateTweaks';
import type { Tweak } from '../data/gamerTweaks';
import './GamerView.css';
import './UltimateView.css';

type TweakStatus = 'applied' | 'failed' | 'pending';

interface UltimateViewProps {
  onCancel?: () => void;
}

const UltimateView: React.FC<UltimateViewProps> = ({ onCancel }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const categoryOrder = ['Apps', 'Security', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks', 'Developer Tools'];
  const categoryLabels: Record<string, string> = {
    'Scheduled Tasks': 'S Tasks',
    'Developer Tools': 'D Tools',
  };
  const [activeCategory, setActiveCategory] = useState<string>('Apps');

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
    console.log('Applying tweaks:', selectedTweaks);
    const newStatuses: Record<string, TweakStatus> = {};
    selectedTweaks.forEach(id => {
      newStatuses[id] = Math.random() > 0.2 ? 'applied' : 'failed';
    });
    setTweakStatuses(prev => ({ ...prev, ...newStatuses }));
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

  if (!acknowledged) {
    return (
      <div className="ultimate-warning">
        <div className="ultimate-warning-card">
          <div className="ultimate-warning-icon">!</div>
          <h1 className="ultimate-warning-title">Proceed with Caution</h1>
          <p className="ultimate-warning-lead">
            The Ultimate profile combines every Gamer and Developer tweak with the most
            aggressive changes available. These options are powerful and permanent enough
            that they can leave your PC exposed.
          </p>
          <ul className="ultimate-warning-list">
            <li>Can <strong>completely disable Windows Defender &amp; Firewall</strong>, leaving no built-in antivirus.</li>
            <li>Can <strong>completely remove Microsoft Edge</strong>, so some Windows features may break.</li>
            <li>Can <strong>permanently disable Windows Update</strong>, so no more security patches.</li>
            <li>Can <strong>turn off UAC &amp; SmartScreen</strong>, so apps run without prompts.</li>
          </ul>
          <p className="ultimate-warning-note">
            Nothing is applied automatically. Every option starts <em>off</em>, and the danger
            items are excluded from the “Recommended” preset. You are in control of what runs.
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
