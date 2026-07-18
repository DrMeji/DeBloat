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
 * Special user codes are reserved for these emails only.
 */
export const CREATOR_EMAILS = ['thomasjkmejia@gmail.com'] as const;

/** Reserved user code for the creator email (not a random 7-char id). */
export const CREATOR_USER_CODES: Record<string, string> = {
  'thomasjkmejia@gmail.com': 'DEV',
};

export function isCreatorEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (CREATOR_EMAILS as readonly string[]).includes(normalized);
}

export function creatorUserCodeFor(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  return CREATOR_USER_CODES[normalized] ?? null;
}

export function withCreatorAccess(settings: SettingsState): SettingsState {
  if (!isCreatorEmail(settings.email)) return settings;
  const reserved = creatorUserCodeFor(settings.email);
  const next = { ...settings, licensed: true };
  if (reserved && next.userCode !== reserved) {
    next.userCode = reserved;
  }
  return next;
}

/** Tabs that require a paid license */
export const PREMIUM_VIEWS = ['gamer', 'developer', 'ultimate'] as const;
export type PremiumView = (typeof PREMIUM_VIEWS)[number];

export function isPremiumView(view: string): view is PremiumView {
  return (PREMIUM_VIEWS as readonly string[]).includes(view);
}

export type SettingsState = {
  /** Unique user id (7-char for regular accounts; reserved codes like DEV for creators) */
  userCode: string;
  email: string;
  /** Local mock only — never a real hash server-side */
  passwordSet: string;
  /** Email 2FA — code sent to profile email at sign-in */
  email2faEnabled: boolean;
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
  email2faEnabled: false,
  licensed: false,
};

/** Dummy / test accounts to wipe on load */
const PURGE_EMAILS = ['1@gmail.com'] as const;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeSettings(parsed: Partial<SettingsState> & {
  displayName?: string;
  twoFactorEnabled?: boolean;
  phone2faEnabled?: boolean;
} | null): SettingsState {
  if (!parsed) return { ...defaults };
  const legacyName = typeof parsed.displayName === 'string' ? parsed.displayName : '';
  const rawCode = typeof parsed.userCode === 'string' ? parsed.userCode : '';
  const email2faEnabled = Boolean(
    parsed.email2faEnabled ?? parsed.twoFactorEnabled ?? parsed.phone2faEnabled
  );
  return {
    ...defaults,
    userCode: rawCode || (legacyName.length === 7 ? legacyName.toUpperCase() : ''),
    email: typeof parsed.email === 'string' ? parsed.email : '',
    passwordSet: typeof parsed.passwordSet === 'string' ? parsed.passwordSet : '',
    email2faEnabled,
    licensed: Boolean(parsed.licensed),
  };
}

export function loadSettings(): SettingsState {
  purgeDummyAccounts();
  const raw = normalizeSettings(safeParse<Partial<SettingsState>>(localStorage.getItem(SETTINGS_KEY)));
  const settings = withCreatorAccess(raw);
  if (
    settings.email &&
    (settings.userCode !== raw.userCode || settings.licensed !== raw.licensed)
  ) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    syncAccountFromSettings(settings);
  }
  return settings;
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

function purgeDummyAccounts(): void {
  const accounts = loadAccounts();
  let changed = false;
  for (const email of PURGE_EMAILS) {
    if (accounts[email]) {
      delete accounts[email];
      changed = true;
    }
  }
  if (changed) saveAccounts(accounts);

  const session = getSessionEmail();
  if (session && (PURGE_EMAILS as readonly string[]).includes(session)) {
    clearSession();
    localStorage.removeItem(SETTINGS_KEY);
  }

  const current = safeParse<Partial<SettingsState>>(localStorage.getItem(SETTINGS_KEY));
  const currentEmail = typeof current?.email === 'string' ? current.email.trim().toLowerCase() : '';
  if (currentEmail && (PURGE_EMAILS as readonly string[]).includes(currentEmail)) {
    localStorage.removeItem(SETTINGS_KEY);
    clearSession();
  }
}

export type AuthResult =
  | { ok: true; settings: SettingsState; needsTwoFactor?: false }
  | { ok: true; settings: SettingsState; needsTwoFactor: true }
  | { ok: false; error: string };

export function signUp(input: {
  email: string;
  password: string;
}): AuthResult {
  purgeDummyAccounts();
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

  const reserved = creatorUserCodeFor(email);
  const userCode = reserved ?? generateUniqueUserCode(accounts);
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
  emailCode?: string;
}): AuthResult {
  purgeDummyAccounts();
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
  const reservedCode = creatorUserCodeFor(email);
  if (!settings.userCode || (reservedCode && settings.userCode !== reservedCode)) {
    settings.userCode = reservedCode ?? generateUniqueUserCode(accounts);
    accounts[email] = { ...settings, email, passwordSet: account.passwordSet };
    saveAccounts(accounts);
  }

  if (settings.email2faEnabled) {
    const code = (input.emailCode || '').trim();
    if (!code) {
      return { ok: true, settings, needsTwoFactor: true };
    }
    if (!/^\d{6}$/.test(code)) {
      return { ok: false, error: 'Enter the 6-digit code sent to your email.' };
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
  // Never hand out reserved creator codes to regular accounts
  for (const code of Object.values(CREATOR_USER_CODES)) {
    used.add(code.toUpperCase());
  }
  for (let attempt = 0; attempt < 40; attempt++) {
    const code = generateUserCode();
    if (!used.has(code)) return code;
  }
  return generateUserCode();
}
