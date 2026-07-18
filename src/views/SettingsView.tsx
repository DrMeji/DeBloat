import React, { useMemo, useState } from 'react';
import {
  LICENSE_PRICE_LABEL,
  PAYPAL_CHECKOUT_URL,
  generateBackupCodes,
  generateTotpSecret,
  isCreatorEmail,
  loadSettings,
  saveSettings,
  type SettingsState,
} from '../lib/settingsStore';
import './SettingsView.css';

const electronAPI = (window as unknown as { electronAPI?: { openExternal?: (url: string) => Promise<unknown> } })
  .electronAPI;

function initials(userCode: string, email: string): string {
  if (userCode) return userCode.slice(0, 2).toUpperCase();
  const base = (email || 'DB').trim();
  return base.slice(0, 2).toUpperCase();
}

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings());
  const [email, setEmail] = useState(settings.email);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [pendingSecret, setPendingSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [show2faSetup, setShow2faSetup] = useState(false);

  const [phoneInput, setPhoneInput] = useState(settings.phoneNumber);
  const [phoneCode, setPhoneCode] = useState('');
  const [showPhoneSetup, setShowPhoneSetup] = useState(false);

  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatar = useMemo(
    () => initials(settings.userCode, settings.email),
    [settings.userCode, settings.email]
  );

  const persist = (next: SettingsState, message?: string) => {
    setSettings(next);
    saveSettings(next);
    setError(null);
    if (message) {
      setFlash(message);
      window.setTimeout(() => setFlash(null), 2800);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    persist(
      { ...settings, email: trimmedEmail },
      'Profile saved on this PC.'
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.passwordSet && currentPassword !== settings.passwordSet) {
      setError('Current password is incorrect.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    persist({ ...settings, passwordSet: newPassword }, 'Password updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const start2faSetup = () => {
    setPendingSecret(generateTotpSecret());
    setVerifyCode('');
    setShow2faSetup(true);
    setError(null);
  };

  const confirm2fa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(verifyCode.trim())) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    const codes = generateBackupCodes();
    persist(
      {
        ...settings,
        twoFactorEnabled: true,
        twoFactorSecret: pendingSecret,
        backupCodes: codes,
      },
      'Authenticator 2FA enabled.'
    );
    setShow2faSetup(false);
    setPendingSecret('');
    setVerifyCode('');
  };

  const disable2fa = () => {
    if (!window.confirm('Disable authenticator 2FA on this device?')) return;
    persist(
      {
        ...settings,
        twoFactorEnabled: false,
        twoFactorSecret: '',
        backupCodes: [],
      },
      'Authenticator 2FA disabled.'
    );
    setShow2faSetup(false);
  };

  const startPhoneSetup = () => {
    setPhoneInput(settings.phoneNumber);
    setPhoneCode('');
    setShowPhoneSetup(true);
    setError(null);
  };

  const confirmPhone2fa = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneInput.replace(/[^\d+\s()-]/g, '').trim();
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid mobile number (at least 10 digits).');
      return;
    }
    if (!/^\d{6}$/.test(phoneCode.trim())) {
      setError('Enter the 6-digit code sent to your phone.');
      return;
    }
    persist(
      {
        ...settings,
        phone2faEnabled: true,
        phoneNumber: cleaned,
      },
      'Mobile authenticator enabled.'
    );
    setShowPhoneSetup(false);
    setPhoneCode('');
  };

  const disablePhone2fa = () => {
    if (!window.confirm('Disable mobile number 2FA on this device?')) return;
    persist(
      {
        ...settings,
        phone2faEnabled: false,
        phoneNumber: '',
      },
      'Mobile authenticator disabled.'
    );
    setPhoneInput('');
    setShowPhoneSetup(false);
  };

  const handlePayPalPurchase = async () => {
    setError(null);
    try {
      if (electronAPI?.openExternal) {
        await electronAPI.openExternal(PAYPAL_CHECKOUT_URL);
      } else {
        window.open(PAYPAL_CHECKOUT_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setError('Could not open PayPal. Try again.');
      return;
    }
    persist({ ...settings, licensed: true }, 'PayPal opened — license unlocked on this PC.');
  };

  const headerName = settings.userCode || 'Your account';
  const headerEmail = settings.email || 'Add an email in Profile';
  const isCreator = isCreatorEmail(settings.email);
  const hasFullAccess = settings.licensed || isCreator;

  return (
    <div className="settings-view">
      <header className="settings-hero">
        <div className="settings-avatar" aria-hidden>
          {avatar}
        </div>
        <div className="settings-hero-text">
          <p className="settings-kicker">Account</p>
          <h1 className="settings-title">{headerName}</h1>
          <p className="settings-subtitle">{headerEmail}</p>
        </div>
        <div
          className={`settings-license-chip ${hasFullAccess ? 'is-paid' : ''} ${isCreator ? 'is-creator' : ''}`}
        >
          {isCreator ? 'Creator' : settings.licensed ? 'Paid' : 'Free'}
        </div>
      </header>

      {(flash || error) && (
        <div className={`settings-banner ${error ? 'is-error' : 'is-ok'}`} role="status">
          {error || flash}
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-column">
          <section className="settings-panel">
            <div className="settings-panel-head">
              <h2>Profile</h2>
              <p>Your unique user code and email on this PC.</p>
            </div>
            <form className="settings-form" onSubmit={handleSaveProfile}>
              <label className="settings-field">
                <span>User code</span>
                <input
                  type="text"
                  value={settings.userCode}
                  readOnly
                  className="settings-field-readonly"
                />
              </label>
              <label className="settings-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <button type="submit" className="settings-btn settings-btn-primary">
                Save profile
              </button>
            </form>
          </section>

          <section className={`settings-license ${hasFullAccess ? 'is-owned' : ''}`}>
            <div className="settings-license-copy">
              <p className="settings-license-label">One-time license</p>
              <h2>{isCreator ? 'Creator access' : 'Unlock DeBloat'}</h2>
              <p className="settings-license-lead">
                {isCreator
                  ? 'You’re signed in as the app creator. Gamer, Developer, and Ultimate stay unlocked — no payment needed.'
                  : 'Pay once with PayPal to unlock Gamer, Developer, and Ultimate. Tunes and Apps stay free.'}
              </p>
              {!isCreator && (
                <>
                  <p className="settings-license-price">{LICENSE_PRICE_LABEL}</p>
                  <p className="settings-license-note">
                    PayPal only. After checkout, your unlock is stored on this PC.
                  </p>
                </>
              )}
            </div>
            {isCreator ? (
              <div className="settings-license-status">Full access as creator — no payment required.</div>
            ) : settings.licensed ? (
              <div className="settings-license-status">You own DeBloat on this PC.</div>
            ) : (
              <button
                type="button"
                className="settings-btn settings-btn-buy settings-btn-paypal"
                onClick={handlePayPalPurchase}
              >
                Pay with PayPal — {LICENSE_PRICE_LABEL}
              </button>
            )}
          </section>
        </div>

        <div className="settings-column">
          <section className="settings-panel">
            <div className="settings-panel-head">
              <h2>Security</h2>
              <p>Password and two-factor authentication.</p>
            </div>

            <form className="settings-form" onSubmit={handleChangePassword}>
              <h3 className="settings-subhead">Change password</h3>
              {settings.passwordSet && (
                <label className="settings-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
              )}
              <label className="settings-field">
                <span>New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="settings-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" className="settings-btn settings-btn-secondary">
                {settings.passwordSet ? 'Update password' : 'Set password'}
              </button>
            </form>

            <div className="settings-divider" />

            <div className="settings-2fa">
              <div className="settings-2fa-head">
                <div>
                  <h3 className="settings-subhead">Authenticator app</h3>
                  <p className="settings-muted">
                    {settings.twoFactorEnabled
                      ? 'App authenticator is on for this device profile.'
                      : 'Add an authenticator app for an extra step at sign-in.'}
                  </p>
                </div>
                {settings.twoFactorEnabled ? (
                  <button type="button" className="settings-btn settings-btn-ghost" onClick={disable2fa}>
                    Disable
                  </button>
                ) : (
                  !show2faSetup && (
                    <button type="button" className="settings-btn settings-btn-secondary" onClick={start2faSetup}>
                      Enable 2FA
                    </button>
                  )
                )}
              </div>

              {show2faSetup && !settings.twoFactorEnabled && (
                <form className="settings-2fa-setup" onSubmit={confirm2fa}>
                  <div className="settings-qr" aria-hidden>
                    <div className="settings-qr-inner">
                      <span>QR</span>
                      <small>Authenticator</small>
                    </div>
                  </div>
                  <p className="settings-muted">
                    Scan with your authenticator app, or enter this secret manually:
                  </p>
                  <code className="settings-secret">{pendingSecret}</code>
                  <label className="settings-field">
                    <span>Verification code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                    />
                  </label>
                  <div className="settings-2fa-actions">
                    <button
                      type="button"
                      className="settings-btn settings-btn-ghost"
                      onClick={() => {
                        setShow2faSetup(false);
                        setPendingSecret('');
                        setVerifyCode('');
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="settings-btn settings-btn-primary">
                      Verify & enable
                    </button>
                  </div>
                </form>
              )}

              {settings.twoFactorEnabled && settings.backupCodes.length > 0 && (
                <div className="settings-backup">
                  <h3 className="settings-subhead">Backup codes</h3>
                  <p className="settings-muted">Store these somewhere safe. Each code works once.</p>
                  <ul className="settings-backup-list">
                    {settings.backupCodes.map(code => (
                      <li key={code}>{code}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="settings-divider" />

            <div className="settings-2fa">
              <div className="settings-2fa-head">
                <div>
                  <h3 className="settings-subhead">Mobile authenticator</h3>
                  <p className="settings-muted">
                    {settings.phone2faEnabled
                      ? `SMS codes enabled for ${settings.phoneNumber}.`
                      : 'Add your mobile number for an SMS code at sign-in.'}
                  </p>
                </div>
                {settings.phone2faEnabled ? (
                  <button type="button" className="settings-btn settings-btn-ghost" onClick={disablePhone2fa}>
                    Disable
                  </button>
                ) : (
                  !showPhoneSetup && (
                    <button type="button" className="settings-btn settings-btn-secondary" onClick={startPhoneSetup}>
                      Enable mobile 2FA
                    </button>
                  )
                )}
              </div>

              {showPhoneSetup && !settings.phone2faEnabled && (
                <form className="settings-2fa-setup" onSubmit={confirmPhone2fa}>
                  <label className="settings-field">
                    <span>Mobile number</span>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      autoComplete="tel"
                    />
                  </label>
                  <p className="settings-muted">
                    Enter the 6-digit code we would send to your phone (demo: any 6 digits).
                  </p>
                  <label className="settings-field">
                    <span>SMS verification code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={phoneCode}
                      onChange={e => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                    />
                  </label>
                  <div className="settings-2fa-actions">
                    <button
                      type="button"
                      className="settings-btn settings-btn-ghost"
                      onClick={() => {
                        setShowPhoneSetup(false);
                        setPhoneCode('');
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="settings-btn settings-btn-primary">
                      Verify & enable
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
