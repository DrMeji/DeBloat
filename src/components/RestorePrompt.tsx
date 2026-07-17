import React, { useState } from 'react';
import './RestorePrompt.css';

interface RestorePromptProps {
  onDone: () => void;
}

type Status = 'idle' | 'creating' | 'success' | 'error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

export const RestorePrompt: React.FC<RestorePromptProps> = ({ onDone }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const createRestorePoint = async () => {
    setStatus('creating');
    setErrorMsg('');
    try {
      if (electronAPI?.createRestorePoint) {
        const result = await electronAPI.createRestorePoint();
        if (result?.success) {
          setStatus('success');
        } else {
          setErrorMsg(result?.error || 'Windows could not create the restore point.');
          setStatus('error');
        }
      } else {
        // Running in a browser (no Electron bridge), simulate for preview.
        await new Promise(res => setTimeout(res, 1500));
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
              A system restore point was saved. If anything ever goes wrong, you can roll
              Windows back to how it is right now.
            </p>
            <div className="restore-actions">
              <button className="restore-btn-primary" onClick={onDone}>Continue</button>
            </div>
          </>
        ) : status === 'error' ? (
          <>
            <h1 className="restore-title">Couldn’t Create Restore Point</h1>
            <p className="restore-lead">
              {errorMsg}
            </p>
            <p className="restore-note">
              This usually means System Restore is turned off, or the app isn’t running as
              Administrator. You can try again, or continue without one (not recommended).
            </p>
            <div className="restore-actions">
              <button className="restore-btn-ghost" onClick={onDone}>Continue Anyway</button>
              <button className="restore-btn-primary" onClick={createRestorePoint}>Try Again</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="restore-title">Create a Restore Point</h1>
            <p className="restore-lead">
              Before making any changes, it’s strongly recommended to create a Windows
              System Restore point. DeBloat will create one for you, no manual steps needed.
            </p>
            <p className="restore-note">
              If a tweak ever causes a problem, you can restore Windows back to this exact
              point from Settings → Recovery.
            </p>
            <div className="restore-actions">
              <button className="restore-btn-ghost" onClick={onDone} disabled={status === 'creating'}>
                Skip
              </button>
              <button className="restore-btn-primary" onClick={createRestorePoint} disabled={status === 'creating'}>
                {status === 'creating' ? 'Creating…' : 'Create Restore Point'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
