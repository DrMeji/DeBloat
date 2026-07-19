import React, { useMemo, useState } from 'react';
import {
  LICENSE_PRICE_LABEL,
  PAYPAL_CHECKOUT_URL,
  isCreatorEmail,
  loadSettings,
  saveSettings,
  type SettingsState,
} from '../lib/settingsStore';
import packageJson from '../../package.json';
import './SettingsView.css';

const APP_VERSION = packageJson.version;

const electronAPI = (window as unknown as { electronAPI?: { openExternal?: (url: string) => Promise<unknown> } })
  .electronAPI;

type InlineMsg = { text: string; tone: 'error' | 'ok' };

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

  const [verifyCode, setVerifyCode] = useState('');
  const [show2faSetup, setShow2faSetup] = useState(false);

  const [profileMsg, setProfileMsg] = useState<InlineMsg | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<InlineMsg | null>(null);
  const [authMsg, setAuthMsg] = useState<InlineMsg | null>(null);
  const [licenseMsg, setLicenseMsg] = useState<InlineMsg | null>(null);

  const avatar = useMemo(
    () => initials(settings.userCode, settings.email),
    [settings.userCode, settings.email]
  );

  const showOk = (
    setter: React.Dispatch<React.SetStateAction<InlineMsg | null>>,
    text: string
  ) => {
    setter({ text, tone: 'ok' });
    window.setTimeout(() => setter(null), 2800);
  };

  const clearMsgs = () => {
    setProfileMsg(null);
    setPasswordMsg(null);
    setAuthMsg(null);
    setLicenseMsg(null);
  };

  const persist = (
    next: SettingsState,
    zone: 'profile' | 'password' | 'auth' | 'license',
    message?: string
  ) => {
    setSettings(next);
    saveSettings(next);
    clearMsgs();
    if (!message) return;
    const setters = {
      profile: setProfileMsg,
      password: setPasswordMsg,
      auth: setAuthMsg,
      license: setLicenseMsg,
    } as const;
    showOk(setters[zone], message);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setProfileMsg({ text: 'Enter a valid email address.', tone: 'error' });
      return;
    }
    persist({ ...settings, email: trimmedEmail }, 'profile', 'Profile saved on this PC.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.passwordSet && currentPassword !== settings.passwordSet) {
      setPasswordMsg({ text: 'Current password is incorrect.', tone: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', tone: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match.', tone: 'error' });
      return;
    }
    persist({ ...settings, passwordSet: newPassword }, 'password', 'Password updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const start2faSetup = () => {
    if (!settings.email.trim()) {
      setAuthMsg({ text: 'Add an email in Profile first.', tone: 'error' });
      return;
    }
    setVerifyCode('');
    setShow2faSetup(true);
    setAuthMsg(null);
  };

  const confirm2fa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(verifyCode.trim())) {
      setAuthMsg({ text: 'Enter the 6-digit code from your email.', tone: 'error' });
      return;
    }
    persist(
      { ...settings, email2faEnabled: true },
      'auth',
      'Email authenticator enabled.'
    );
    setShow2faSetup(false);
    setVerifyCode('');
  };

  const disable2fa = () => {
    if (!window.confirm('Disable email authenticator on this device?')) return;
    persist(
      { ...settings, email2faEnabled: false },
      'auth',
      'Email authenticator disabled.'
    );
    setShow2faSetup(false);
  };

  const handlePayPalPurchase = async () => {
    setLicenseMsg(null);
    try {
      if (electronAPI?.openExternal) {
        await electronAPI.openExternal(PAYPAL_CHECKOUT_URL);
      } else {
        window.open(PAYPAL_CHECKOUT_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setLicenseMsg({ text: 'Could not open PayPal. Try again.', tone: 'error' });
      return;
    }
    persist(
      { ...settings, licensed: true },
      'license',
      'PayPal opened — license unlocked on this PC.'
    );
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
              <div className="settings-form-actions">
                <button type="submit" className="settings-btn settings-btn-primary">
                  Save profile
                </button>
                {profileMsg && (
                  <span className={`settings-inline-msg is-${profileMsg.tone}`} role="status">
                    {profileMsg.text}
                  </span>
                )}
              </div>
            </form>
          </section>

          <section className={`settings-license ${hasFullAccess ? 'is-owned' : ''}`}>
            <div className="settings-license-copy">
              <p className="settings-license-label">One-time license</p>
              <h2>{isCreator ? 'Creator access' : 'Unlock DeBloat'}</h2>
              <p className="settings-license-lead">
                {isCreator
                  ? 'You’re signed in as the app creator. Gamer, Developer, and Ultimate stay unlocked — no payment needed.'
                  : 'Pay once with PayPal to unlock Gamer, Developer, and Ultimate. Tunes and Apps stay free. ALL SALES ARE FINAL, NO REFUNDS.'}
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
              <div className="settings-form-actions">
                <button
                  type="button"
                  className="settings-btn settings-btn-buy settings-btn-paypal"
                  onClick={handlePayPalPurchase}
                >
                  Pay with PayPal — {LICENSE_PRICE_LABEL}
                </button>
                {licenseMsg && (
                  <span className={`settings-inline-msg is-${licenseMsg.tone}`} role="status">
                    {licenseMsg.text}
                  </span>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="settings-column">
          <section className="settings-panel">
            <div className="settings-panel-head">
              <h2>Security</h2>
              <p>Password and email authenticator.</p>
            </div>

            <form className="settings-form" onSubmit={handleChangePassword}>
              <h3 className="settings-subhead">Change password</h3>
              {settings.passwordSet && (
                <label className="settings-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => {
                      setCurrentPassword(e.target.value);
                      if (passwordMsg?.tone === 'error') setPasswordMsg(null);
                    }}
                    autoComplete="current-password"
                  />
                </label>
              )}
              <label className="settings-field">
                <span>New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    if (passwordMsg?.tone === 'error') setPasswordMsg(null);
                  }}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="settings-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (passwordMsg?.tone === 'error') setPasswordMsg(null);
                  }}
                  autoComplete="new-password"
                />
              </label>
              <div className="settings-form-actions">
                <button type="submit" className="settings-btn settings-btn-secondary">
                  {settings.passwordSet ? 'Update password' : 'Set password'}
                </button>
                {passwordMsg && (
                  <span className={`settings-inline-msg is-${passwordMsg.tone}`} role="status">
                    {passwordMsg.text}
                  </span>
                )}
              </div>
            </form>

            <div className="settings-divider" />

            <div className="settings-2fa">
              <div className="settings-2fa-head">
                <div>
                  <h3 className="settings-subhead">Email authenticator</h3>
                  <p className="settings-muted">
                    {settings.email2faEnabled
                      ? `Codes will be sent to ${settings.email} when you sign in.`
                      : 'Adds an extra sign-in step by emailing you a one-time code.'}
                  </p>
                  {authMsg && !show2faSetup && (
                    <span className={`settings-inline-msg is-${authMsg.tone}`} role="status">
                      {authMsg.text}
                    </span>
                  )}
                </div>
                {settings.email2faEnabled ? (
                  <button type="button" className="settings-btn settings-btn-ghost" onClick={disable2fa}>
                    Disable
                  </button>
                ) : (
                  !show2faSetup && (
                    <button type="button" className="settings-btn settings-btn-secondary" onClick={start2faSetup}>
                      Enable email 2FA
                    </button>
                  )
                )}
              </div>

              {show2faSetup && !settings.email2faEnabled && (
                <form className="settings-2fa-setup" onSubmit={confirm2fa}>
                  <label className="settings-field settings-2fa-code-field">
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
                        setVerifyCode('');
                        setAuthMsg(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="settings-btn settings-btn-primary">
                      Verify & enable
                    </button>
                  </div>
                  {authMsg && (
                    <span className={`settings-inline-msg is-${authMsg.tone}`} role="status">
                      {authMsg.text}
                    </span>
                  )}
                </form>
              )}
            </div>

            <div className="settings-divider settings-divider-foot" />

            <div className="settings-about">
              <div className="settings-about-copy">
                <h3 className="settings-subhead">App version</h3>
                <p className="settings-muted">DeBloat v{APP_VERSION}</p>
              </div>
              <button
                type="button"
                className="settings-btn settings-btn-secondary"
                disabled
                title="Updates coming soon"
              >
                Update
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
