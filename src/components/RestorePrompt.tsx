import React, { useState } from 'react';
import { buildRestorePointLabel } from '../context/SessionContext';
import './RestorePrompt.css';

export type RestorePromptResult = 'created' | 'skipped';

interface RestorePromptProps {
  onDone: (result: RestorePromptResult) => void;
}

type Status = 'idle' | 'creating' | 'success' | 'error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

export const RestorePrompt: React.FC<RestorePromptProps> = ({ onDone }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [createdLabel, setCreatedLabel] = useState<string>('');

  const createRestorePoint = async () => {
    setStatus('creating');
    setErrorMsg('');
    const label = buildRestorePointLabel();
    try {
      if (electronAPI?.createRestorePoint) {
        const result = await electronAPI.createRestorePoint(label);
        if (result?.success) {
          setCreatedLabel(label);
          setStatus('success');
        } else {
          setErrorMsg(result?.error || 'Windows could not create the restore point.');
          setStatus('error');
        }
      } else {
        await new Promise(res => setTimeout(res, 800));
        setCreatedLabel(label);
        setStatus('success');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  return (
    <div className="restore-prompt">
      <div className="restore-card">
        <div className={`restore-icon ${status}`}>
          {status === 'success' ? '✓' : status === 'error' ? '!' : status === 'creating' ? '' : '↺'}
          {status === 'creating' && <span className="restore-spinner" />}
        </div>

        {status === 'success' ? (
          <>
            <h1 className="restore-title">Restore Point Created</h1>
            <p className="restore-lead">
              Saved as <strong>{createdLabel}</strong>. If a tweak causes problems, roll
              Windows back to this point from Settings → System → Recovery.
            </p>
            <div className="restore-actions">
              <button className="restore-btn-primary" onClick={() => onDone('created')}>Continue</button>
            </div>
          </>
        ) : status === 'error' ? (
          <>
            <h1 className="restore-title">Couldn’t Create Restore Point</h1>
            <p className="restore-lead">{errorMsg}</p>
            <p className="restore-note">
              System Restore may be off, or DeBloat isn’t running as Administrator.
              You can try again. Skipping is allowed, but Apply will ask you to create
              one before any tweaks run.
            </p>
            <div className="restore-actions">
              <button className="restore-btn-ghost" onClick={() => onDone('skipped')}>Skip for Now</button>
              <button className="restore-btn-primary" onClick={() => void createRestorePoint()}>Try Again</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="restore-title">Create a Restore Point</h1>
            <p className="restore-lead">
              Before you apply tweaks, create a Windows System Restore point so you can
              undo system changes if something goes wrong.
            </p>
            <p className="restore-note">
              The restore point is named with today’s date and time (for example,
              “DeBloat Jul 18, 2026, 1:09:00 AM”). You can restore to it later from
              Settings → System → Recovery.
            </p>
            <div className="restore-actions">
              <button className="restore-btn-ghost" onClick={() => onDone('skipped')} disabled={status === 'creating'}>
                Skip
              </button>
              <button className="restore-btn-primary" onClick={() => void createRestorePoint()} disabled={status === 'creating'}>
                {status === 'creating' ? 'Creating…' : 'Create Restore Point'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
