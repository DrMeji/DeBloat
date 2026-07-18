import React, { useState } from 'react';
import { logIn, signUp } from '../lib/settingsStore';

interface WelcomeProps {
  onAuthenticated: () => void;
}

type AuthMode = 'choose' | 'login' | 'signup';

export const Welcome: React.FC<WelcomeProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [needs2fa, setNeeds2fa] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSplit = mode === 'login' || mode === 'signup';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setEmailCode('');
    setNeeds2fa(false);
    setError(null);
  };

  const openMode = (next: AuthMode) => {
    resetForm();
    setMode(next);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = logIn({ email, password, emailCode: needs2fa ? emailCode : undefined });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsTwoFactor) {
      setNeeds2fa(true);
      setError(null);
      return;
    }
    onAuthenticated();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signUp({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAuthenticated();
  };

  return (
    <div className={`welcome ${isSplit ? 'is-split' : ''}`}>
      <div className="welcome-brand">
        <div className="welcome-brand-inner">
          <svg
            className="welcome-icon"
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <h1 className="welcome-title">DeBloat</h1>
        </div>
      </div>

      <div className="welcome-panel">
        {mode === 'choose' && (
          <div className="welcome-auth-actions welcome-choose">
            <button type="button" className="btn btn-primary welcome-auth-btn" onClick={() => openMode('login')}>
              Log in
            </button>
            <button
              type="button"
              className="btn welcome-auth-btn welcome-auth-btn-secondary"
              onClick={() => openMode('signup')}
            >
              Sign up
            </button>
          </div>
        )}

        {mode === 'login' && (
          <form className="welcome-auth-form" onSubmit={handleLogin}>
            {error && <p className="welcome-auth-error">{error}</p>}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            {needs2fa && (
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={emailCode}
                onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Email code"
                autoComplete="one-time-code"
                required
              />
            )}
            <div className="welcome-auth-actions">
              <button type="button" className="btn welcome-auth-btn welcome-auth-btn-secondary" onClick={() => openMode('choose')}>
                Back
              </button>
              <button type="submit" className="btn btn-primary welcome-auth-btn">
                {needs2fa ? 'Verify' : 'Log in'}
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form className="welcome-auth-form" onSubmit={handleSignUp}>
            {error && <p className="welcome-auth-error">{error}</p>}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <div className="welcome-auth-actions">
              <button type="button" className="btn welcome-auth-btn welcome-auth-btn-secondary" onClick={() => openMode('choose')}>
                Back
              </button>
              <button type="submit" className="btn btn-primary welcome-auth-btn">
                Sign up
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
