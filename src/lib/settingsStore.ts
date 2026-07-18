const SETTINGS_KEY = 'debloat.settings.v1';
const ACCOUNTS_KEY = 'debloat.accounts.v1';
const SESSION_KEY = 'debloat.session.v1';

export const LICENSE_PRICE = 9.99;
export const LICENSE_PRICE_LABEL = '$9.99';

/** PayPal checkout for the one-time license (opens in browser). */
export const PAYPAL_CHECKOUT_URL =
  'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=payments%40debloat.app&item_name=DeBloat%20One-Time%20License&amount=9.99&currency_code=USD&no_shipping=1';

/**
 * Creator accounts — always fully unlocked, never need to pay.
 * Sign in / sign up with one of these emails to get free access.
 */
export const CREATOR_EMAILS = ['thomasjkmejia@gmail.com'] as const;

export function isCreatorEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (CREATOR_EMAILS as readonly string[]).includes(normalized);
}

export function withCreatorAccess(settings: SettingsState): SettingsState {
  if (!isCreatorEmail(settings.email)) return settings;
  if (settings.licensed) return settings;
  return { ...settings, licensed: true };
}

/** Tabs that require a paid license */
export const PREMIUM_VIEWS = ['gamer', 'developer', 'ultimate'] as const;
export type PremiumView = (typeof PREMIUM_VIEWS)[number];

export function isPremiumView(view: string): view is PremiumView {
  return (PREMIUM_VIEWS as readonly string[]).includes(view);
}

export type SettingsState = {
  /** Unique 7-character alphanumeric user id */
  userCode: string;
  email: string;
  /** Local mock only — never a real hash server-side */
  passwordSet: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  backupCodes: string[];
  /** SMS / mobile number 2FA */
  phone2faEnabled: boolean;
  phoneNumber: string;
  licensed: boolean;
};

export type AccountRecord = SettingsState & {
  email: string;
  passwordSet: string;
};

const defaults: SettingsState = {
  userCode: '',
  email: '',
  passwordSet: '',
  twoFactorEnabled: false,
  twoFactorSecret: '',
  backupCodes: [],
  phone2faEnabled: false,
  phoneNumber: '',
  licensed: false,
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeSettings(parsed: Partial<SettingsState> & { displayName?: string } | null): SettingsState {
  if (!parsed) return { ...defaults };
  const legacyName = typeof parsed.displayName === 'string' ? parsed.displayName : '';
  const rawCode = typeof parsed.userCode === 'string' ? parsed.userCode : '';
  return {
    ...defaults,
    userCode: rawCode || (legacyName.length === 7 ? legacyName.toUpperCase() : ''),
    email: typeof parsed.email === 'string' ? parsed.email : '',
    passwordSet: typeof parsed.passwordSet === 'string' ? parsed.passwordSet : '',
    twoFactorEnabled: Boolean(parsed.twoFactorEnabled),
    twoFactorSecret: typeof parsed.twoFactorSecret === 'string' ? parsed.twoFactorSecret : '',
    backupCodes: Array.isArray(parsed.backupCodes)
      ? parsed.backupCodes.filter((c): c is string => typeof c === 'string')
      : [],
    phone2faEnabled: Boolean(parsed.phone2faEnabled),
    phoneNumber: typeof parsed.phoneNumber === 'string' ? parsed.phoneNumber : '',
    licensed: Boolean(parsed.licensed),
  };
}

export function loadSettings(): SettingsState {
  return withCreatorAccess(
    normalizeSettings(safeParse<Partial<SettingsState>>(localStorage.getItem(SETTINGS_KEY)))
  );
}

export function saveSettings(next: SettingsState): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  syncAccountFromSettings(next);
  window.dispatchEvent(new Event('debloat-settings-changed'));
}

function loadAccounts(): Record<string, AccountRecord> {
  const raw = safeParse<Record<string, AccountRecord>>(localStorage.getItem(ACCOUNTS_KEY));
  return raw && typeof raw === 'object' ? raw : {};
}

function saveAccounts(accounts: Record<string, AccountRecord>): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function syncAccountFromSettings(settings: SettingsState): void {
  const email = settings.email.trim().toLowerCase();
  if (!email || !settings.passwordSet) return;
  const accounts = loadAccounts();
  accounts[email] = {
    ...settings,
    email,
    passwordSet: settings.passwordSet,
  };
  saveAccounts(accounts);
}

export function getSessionEmail(): string | null {
  const email = localStorage.getItem(SESSION_KEY);
  return email && email.trim() ? email.trim().toLowerCase() : null;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export type AuthResult =
  | { ok: true; settings: SettingsState; needsTwoFactor?: false }
  | { ok: true; settings: SettingsState; needsTwoFactor: true }
  | { ok: false; error: string };

export function signUp(input: {
  email: string;
  password: string;
}): AuthResult {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const accounts = loadAccounts();
  if (accounts[email]) {
    return { ok: false, error: 'An account with that email already exists. Log in instead.' };
  }

  const userCode = generateUniqueUserCode(accounts);
  const settings = withCreatorAccess({
    ...defaults,
    userCode,
    email,
    passwordSet: password,
    licensed: false,
  });

  accounts[email] = { ...settings, email, passwordSet: password };
  saveAccounts(accounts);
  localStorage.setItem(SESSION_KEY, email);
  saveSettings(settings);
  return { ok: true, settings };
}

export function logIn(input: {
  email: string;
  password: string;
  totpCode?: string;
}): AuthResult {
  const email = input.email.trim().toLowerCase();
  const accounts = loadAccounts();
  const account = accounts[email];

  if (!account) {
    return { ok: false, error: 'No account found for that email.' };
  }
  if (account.passwordSet !== input.password) {
    return { ok: false, error: 'Incorrect password.' };
  }

  const settings = withCreatorAccess(normalizeSettings(account));
  if (!settings.userCode) {
    settings.userCode = generateUniqueUserCode(accounts);
    accounts[email] = { ...settings, email, passwordSet: account.passwordSet };
    saveAccounts(accounts);
  }

  if (settings.twoFactorEnabled) {
    const code = (input.totpCode || '').trim();
    if (!code) {
      return { ok: true, settings, needsTwoFactor: true };
    }
    if (!/^\d{6}$/.test(code)) {
      return { ok: false, error: 'Enter the 6-digit authenticator code.' };
    }
  }

  localStorage.setItem(SESSION_KEY, email);
  saveSettings(settings);
  return { ok: true, settings };
}

export function logOutAccount(): void {
  clearSession();
}

export function isLicensed(): boolean {
  const settings = loadSettings();
  return settings.licensed || isCreatorEmail(settings.email);
}

export function isCreatorAccount(): boolean {
  return isCreatorEmail(loadSettings().email);
}

/** 7-character code: letters + numbers (no ambiguous 0/O/1/I). */
export function generateUserCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 7; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function generateUniqueUserCode(accounts: Record<string, AccountRecord>): string {
  const used = new Set(
    Object.values(accounts)
      .map(a => (a.userCode || '').toUpperCase())
      .filter(Boolean)
  );
  for (let attempt = 0; attempt < 40; attempt++) {
    const code = generateUserCode();
    if (!used.has(code)) return code;
  }
  return generateUserCode();
}

export function generateTotpSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let out = '';
  for (let i = 0; i < 16; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const n = Math.floor(10000000 + Math.random() * 90000000);
    const s = String(n);
    codes.push(`${s.slice(0, 4)}-${s.slice(4)}`);
  }
  return codes;
}
