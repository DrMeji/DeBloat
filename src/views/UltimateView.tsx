import React, { useMemo } from 'react';
import { ultimateTweaks } from '../data/ultimateTweaks';
import type { Tweak } from '../data/gamerTweaks';
import { useTweakRunner } from '../hooks/useTweakRunner';
import { useSession } from '../context/SessionContext';
import './GamerView.css';
import './UltimateView.css';

interface UltimateViewProps {
  onCancel?: () => void;
  acknowledged: boolean;
  onAcknowledge: () => void;
}

const UltimateView: React.FC<UltimateViewProps> = ({ onCancel, acknowledged, onAcknowledge }) => {
  const {
    ultimate,
    setProfileSelected,
    setProfilePreset,
    setProfileCategory,
    requestApply,
  } = useSession();
  const { selected: selectedTweaks, preset: activePreset, category: activeCategory } = ultimate;
  const { tweakStatuses, isApplying, runTweaks } = useTweakRunner();

  const preferredOrder = ['Apps', 'Security', 'Services', 'Performance', 'Privacy', 'Scheduled Tasks', 'Developer Tools'];
  const categoryOrder = preferredOrder.filter(c => ultimateTweaks.some(t => t.category === c));
  const categoryLabels: Record<string, string> = {
    'Scheduled Tasks': 'S Tasks',
    'Developer Tools': 'D Tools',
  };

  const groupedTweaks = useMemo(() => {
    return ultimateTweaks.reduce((acc, tweak) => {
      (acc[tweak.category] = acc[tweak.category] || []).push(tweak);
      return acc;
    }, {} as Record<string, Tweak[]>);
  }, []);

  const toggleTweak = (id: string) => {
    setProfilePreset('ultimate', null);
    setProfileSelected('ultimate', prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handlePresetRecommended = () => {
    setProfileSelected('ultimate', ultimateTweaks.filter(t => t.recommended).map(t => t.id));
    setProfilePreset('ultimate', 'recommended');
  };

  const handlePresetAggressive = () => {
    setProfileSelected('ultimate', ultimateTweaks.map(t => t.id));
    setProfilePreset('ultimate', 'aggressive');
  };

  const handlePresetReset = () => {
    setProfileSelected('ultimate', []);
    setProfilePreset('ultimate', 'reset');
  };

  const handleApplyChanges = () => {
    const toApply = ultimateTweaks.filter(t => selectedTweaks.includes(t.id));
    if (requestApply(toApply)) void runTweaks(toApply);
  };

  const getRiskColor = (risk: Tweak['risk']) => {
    if (risk === 'safe') return '#4ade80';
    if (risk === 'moderate') return '#facc15';
    if (risk === 'aggressive') return '#f87171';
    return '#888';
  };

  const riskOrder: Record<Tweak['risk'], number> = { safe: 0, moderate: 1, aggressive: 2 };
  const category = categoryOrder.includes(activeCategory) ? activeCategory : (categoryOrder[0] || 'Apps');
  const activeTweaks = [...(groupedTweaks[category] || [])].sort(
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
            <li>Can <strong>completely disable Defender, Firewall, SmartScreen, and UAC</strong> (reboot after applying).</li>
            <li>Can <strong>force-remove Xbox, Edge, Bing Search, and OneDrive</strong>.</li>
            <li>Can <strong>permanently disable Windows Update</strong> and extra background services.</li>
            <li>Some Developer options (WSL / Hyper-V) are skipped inside a VirtualBox VM.</li>
          </ul>
          <p className="ultimate-warning-note">
            Nothing is applied automatically. Every option starts off, and the danger
            items are excluded from the Recommended preset. Watch the Terminal for
            exactly what succeeds or fails.
          </p>
          <div className="ultimate-warning-actions">
            {onCancel && (
              <button className="ultimate-btn-cancel" onClick={onCancel}>
                Go Back
              </button>
            )}
            <button className="ultimate-btn-continue" onClick={onAcknowledge}>
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
        <div className="gamer-toolbar-row">
          <header className="gamer-toolbar gamer-toolbar-left">
            {categoryOrder.map(cat => (
              <button
                key={cat}
                type="button"
                className={`gamer-toolbar-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setProfileCategory('ultimate', cat)}
              >
                {categoryLabels[cat] || cat}
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

export default UltimateView;
