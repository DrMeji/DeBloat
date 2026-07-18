import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AppCategory } from '../data/appsCatalog';

type ProfileKey = 'gamer' | 'developer' | 'ultimate';

type ProfileSlice = {
  selected: string[];
  preset: string | null;
  category: string;
};

type SessionContextValue = {
  gamer: ProfileSlice;
  developer: ProfileSlice;
  ultimate: ProfileSlice;
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
  resetSession: () => void;
};

const defaultProfile = (category: string): ProfileSlice => ({
  selected: [],
  preset: null,
  category,
});

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [gamer, setGamer] = useState<ProfileSlice>(() => defaultProfile('Apps'));
  const [developer, setDeveloper] = useState<ProfileSlice>(() => defaultProfile('Apps'));
  const [ultimate, setUltimate] = useState<ProfileSlice>(() => defaultProfile('Apps'));

  const [appsSelected, setAppsSelected] = useState<string[]>([]);
  const [appsInstalled, setAppsInstalled] = useState<string[]>([]);
  const [appsFailed, setAppsFailed] = useState<string[]>([]);
  const [appsCategory, setAppsCategory] = useState<AppCategory>('Browsers');
  const [appsScanned, setAppsScanned] = useState(false);

  const setterFor = useCallback((key: ProfileKey) => {
    if (key === 'gamer') return setGamer;
    if (key === 'developer') return setDeveloper;
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

  const resetSession = useCallback(() => {
    setGamer(defaultProfile('Apps'));
    setDeveloper(defaultProfile('Apps'));
    setUltimate(defaultProfile('Apps'));
    setAppsSelected([]);
    setAppsInstalled([]);
    setAppsFailed([]);
    setAppsCategory('Browsers');
    setAppsScanned(false);
  }, []);

  const value = useMemo(
    () => ({
      gamer,
      developer,
      ultimate,
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
      resetSession,
    }),
    [
      gamer,
      developer,
      ultimate,
      setProfileSelected,
      setProfilePreset,
      setProfileCategory,
      appsSelected,
      appsInstalled,
      appsFailed,
      appsCategory,
      appsScanned,
      markAppsInstalled,
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
