import React, { useState } from 'react';
import { buildRestorePointLabel, useSession } from '../context/SessionContext';
import { useTweakRunner } from '../hooks/useTweakRunner';
import './RestorePrompt.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

/** Blocks Apply until a restore point exists for this session. */
export const RestoreGateModal: React.FC = () => {
  const {
    restoreGateOpen,
    closeRestoreGate,
    takePendingTweaks,
    setRestorePointStatus,
  } = useSession();
  const { runTweaks } = useTweakRunner();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!restoreGateOpen) return null;

  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    const label = buildRestorePointLabel();
    try {
      if (electronAPI?.createRestorePoint) {
        const result = await electronAPI.createRestorePoint(label);
        if (!result?.success) {
          setError(result?.error || 'Windows could not create the restore point.');
          setBusy(false);
          return;
        }
      } else {
        await new Promise(res => setTimeout(res, 600));
      }
      setRestorePointStatus('created');
      const tweaks = takePendingTweaks();
      setBusy(false);
      if (tweaks && tweaks.length > 0) {
        void runTweaks(tweaks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  return (
    <div className="restore-gate-overlay" role="dialog" aria-modal="true" aria-labelledby="restore-gate-title">
      <div className="restore-card restore-gate-card">
        <div className={`restore-icon ${error ? 'error' : ''}`}>
          {error ? '!' : '↺'}
          {busy && <span className="restore-spinner" />}
        </div>
        <h1 id="restore-gate-title" className="restore-title">Restore Point Required</h1>
        <p className="restore-lead">
          You haven’t created a restore point yet. Create one before applying tweaks so
          you can roll Windows back if something breaks.
        </p>
        <p className="restore-note">
          It will be named with the current date and time (for example,
          “{buildRestorePointLabel()}”).
        </p>
        {error && <p className="restore-gate-error">{error}</p>}
        <div className="restore-actions">
          <button className="restore-btn-ghost" onClick={closeRestoreGate} disabled={busy}>
            Cancel
          </button>
          <button className="restore-btn-primary" onClick={() => void handleCreate()} disabled={busy}>
            {busy ? 'Creating…' : 'Create Restore Point'}
          </button>
        </div>
      </div>
    </div>
  );
};
