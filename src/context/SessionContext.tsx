import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AppCategory } from '../data/appsCatalog';
import type { Tweak } from '../data/gamerTweaks';

type ProfileKey = 'gamer' | 'developer' | 'ultimate' | 'tunes';

export type RestorePointStatus = 'none' | 'created' | 'skipped';

type ProfileSlice = {
  selected: string[];
  preset: string | null;
  category: string;
};

type SessionContextValue = {
  gamer: ProfileSlice;
  developer: ProfileSlice;
  ultimate: ProfileSlice;
  tunes: ProfileSlice;
  setProfileSelected: (key: ProfileKey, ids: string[] | ((prev: string[]) => string[])) => void;
  setProfilePreset: (key: ProfileKey, preset: string | null) => void;
  setProfileCategory: (key: ProfileKey, category: string) => void;

  appsSelected: string[];
  appsInstalled: string[];
  appsFailed: string[];
  appsCategory: AppCategory;
  appsScanned: boolean;
  setAppsSelected: (ids: string[] | ((prev: string[]) => string[])) => void;
  setAppsInstalled: (ids: string[] | ((prev: string[]) => string[])) => void;
  setAppsFailed: (ids: string[] | ((prev: string[]) => string[])) => void;
  setAppsCategory: (category: AppCategory) => void;
  setAppsScanned: (scanned: boolean) => void;
  markAppsInstalled: (ids: string[]) => void;

  restorePointStatus: RestorePointStatus;
  setRestorePointStatus: (status: RestorePointStatus) => void;
  restoreGateOpen: boolean;
  pendingTweaks: Tweak[] | null;
  /** Returns true if Apply may proceed now; false if the restore gate opened instead. */
  requestApply: (tweaks: Tweak[]) => boolean;
  closeRestoreGate: () => void;
  takePendingTweaks: () => Tweak[] | null;

  resetSession: () => void;
};

const defaultProfile = (category: string): ProfileSlice => ({
  selected: [],
  preset: null,
  category,
});

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialRestoreStatus = 'none',
}: {
  children: React.ReactNode;
  initialRestoreStatus?: RestorePointStatus;
}) {
  const [gamer, setGamer] = useState<ProfileSlice>(() => defaultProfile('Apps'));
  const [developer, setDeveloper] = useState<ProfileSlice>(() => defaultProfile('Apps'));
  const [ultimate, setUltimate] = useState<ProfileSlice>(() => defaultProfile('Apps'));
  const [tunes, setTunes] = useState<ProfileSlice>(() => defaultProfile('Appearance'));

  const [appsSelected, setAppsSelected] = useState<string[]>([]);
  const [appsInstalled, setAppsInstalled] = useState<string[]>([]);
  const [appsFailed, setAppsFailed] = useState<string[]>([]);
  const [appsCategory, setAppsCategory] = useState<AppCategory>('Browsers');
  const [appsScanned, setAppsScanned] = useState(false);

  const [restorePointStatus, setRestorePointStatus] = useState<RestorePointStatus>(initialRestoreStatus);
  const [restoreGateOpen, setRestoreGateOpen] = useState(false);
  const [pendingTweaks, setPendingTweaks] = useState<Tweak[] | null>(null);

  const setterFor = useCallback((key: ProfileKey) => {
    if (key === 'gamer') return setGamer;
    if (key === 'developer') return setDeveloper;
    if (key === 'tunes') return setTunes;
    return setUltimate;
  }, []);

  const setProfileSelected = useCallback((key: ProfileKey, ids: string[] | ((prev: string[]) => string[])) => {
    const set = setterFor(key);
    set(prev => ({
      ...prev,
      selected: typeof ids === 'function' ? ids(prev.selected) : ids,
    }));
  }, [setterFor]);

  const setProfilePreset = useCallback((key: ProfileKey, preset: string | null) => {
    setterFor(key)(prev => ({ ...prev, preset }));
  }, [setterFor]);

  const setProfileCategory = useCallback((key: ProfileKey, category: string) => {
    setterFor(key)(prev => ({ ...prev, category }));
  }, [setterFor]);

  const markAppsInstalled = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setAppsInstalled(prev => Array.from(new Set([...prev, ...ids])));
    setAppsSelected(prev => prev.filter(id => !ids.includes(id)));
  }, []);

  const requestApply = useCallback((tweaks: Tweak[]) => {
    if (tweaks.length === 0) return false;
    // TEMP: allow 'skipped' for VM testing when System Restore is unavailable
    if (restorePointStatus === 'created' || restorePointStatus === 'skipped') return true;
    setPendingTweaks(tweaks);
    setRestoreGateOpen(true);
    return false;
  }, [restorePointStatus]);

  const closeRestoreGate = useCallback(() => {
    setRestoreGateOpen(false);
    setPendingTweaks(null);
  }, []);

  const takePendingTweaks = useCallback(() => {
    const tweaks = pendingTweaks;
    setPendingTweaks(null);
    setRestoreGateOpen(false);
    return tweaks;
  }, [pendingTweaks]);

  const resetSession = useCallback(() => {
    setGamer(defaultProfile('Apps'));
    setDeveloper(defaultProfile('Apps'));
    setUltimate(defaultProfile('Apps'));
    setTunes(defaultProfile('Appearance'));
    setAppsSelected([]);
    setAppsInstalled([]);
    setAppsFailed([]);
    setAppsCategory('Browsers');
    setAppsScanned(false);
    setRestorePointStatus('none');
    setRestoreGateOpen(false);
    setPendingTweaks(null);
  }, []);

  const value = useMemo(
    () => ({
      gamer,
      developer,
      ultimate,
      tunes,
      setProfileSelected,
      setProfilePreset,
      setProfileCategory,
      appsSelected,
      appsInstalled,
      appsFailed,
      appsCategory,
      appsScanned,
      setAppsSelected,
      setAppsInstalled,
      setAppsFailed,
      setAppsCategory,
      setAppsScanned,
      markAppsInstalled,
      restorePointStatus,
      setRestorePointStatus,
      restoreGateOpen,
      pendingTweaks,
      requestApply,
      closeRestoreGate,
      takePendingTweaks,
      resetSession,
    }),
    [
      gamer,
      developer,
      ultimate,
      tunes,
      setProfileSelected,
      setProfilePreset,
      setProfileCategory,
      appsSelected,
      appsInstalled,
      appsFailed,
      appsCategory,
      appsScanned,
      markAppsInstalled,
      restorePointStatus,
      restoreGateOpen,
      pendingTweaks,
      requestApply,
      closeRestoreGate,
      takePendingTweaks,
      resetSession,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

/** Shared timestamp label for Windows System Restore points. */
export function buildRestorePointLabel(date = new Date()): string {
  const stamp = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  return `DeBloat ${stamp}`;
}
