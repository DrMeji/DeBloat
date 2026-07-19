import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Tweak } from '../data/gamerTweaks';
import type { AppItem } from '../data/appsCatalog';

export type LogLine = {
  id: string;
  text: string;
  kind?: 'info' | 'ok' | 'fail' | 'cmd' | 'out';
};

type TweakStatus = 'applied' | 'failed' | 'working' | 'pending' | 'skipped';

export type BusyMode = null | 'tweaks' | 'apps';

type ApplyResult = {
  id: string;
  success: boolean;
  skipped?: boolean;
  error?: string;
};

type ApplyResponse =
  | ApplyResult[]
  | {
      results: ApplyResult[];
      successCount: number;
      failCount: number;
      skipCount?: number;
      total: number;
    };

type InstallResponse =
  | ApplyResult[]
  | {
      results: ApplyResult[];
      successCount: number;
      failCount: number;
      skipCount?: number;
      total: number;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

let logSeq = 0;
const nextId = () => `log-${Date.now()}-${++logSeq}`;

type LogPayload = {
  type: string;
  name?: string;
  index?: number;
  total?: number;
  line?: string;
  error?: string;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  skippedNames?: string[];
  finishedLabel?: string;
};

type TerminalContextValue = {
  tweakStatuses: Record<string, TweakStatus>;
  isApplying: boolean;
  busyMode: BusyMode;
  logLines: LogLine[];
  applySummary: string | null;
  progressPercent: number | null;
  showRestartPrompt: boolean;
  clearLogs: () => void;
  dismissRestartPrompt: () => void;
  restartNow: () => Promise<void>;
  runTweaks: (toApply: Tweak[]) => Promise<void>;
  runAppInstalls: (apps: AppItem[]) => Promise<{ ok: string[]; bad: string[] }>;
};

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [busyMode, setBusyMode] = useState<BusyMode>(null);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [applySummary, setApplySummary] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [showRestartPrompt, setShowRestartPrompt] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const batchProgressRef = useRef({ index: 0, total: 1 });

  useEffect(() => {
    return () => {
      unsubRef.current?.();
    };
  }, []);

  const appendLog = useCallback((text: string, kind: LogLine['kind'] = 'info') => {
    setLogLines(prev => [...prev, { id: nextId(), text, kind }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogLines([]);
    setApplySummary(null);
    setProgressPercent(null);
    setShowRestartPrompt(false);
  }, []);

  const dismissRestartPrompt = useCallback(() => {
    setShowRestartPrompt(false);
  }, []);

  const restartNow = useCallback(async () => {
    appendLog('Restarting PC in a few seconds…', 'info');
    if (electronAPI?.restartComputer) {
      await electronAPI.restartComputer();
    }
  }, [appendLog]);

  const setBatchSliceProgress = useCallback((fractionWithinItem: number) => {
    const { index, total } = batchProgressRef.current;
    if (!total || !index) return;
    const clamped = Math.max(0, Math.min(1, fractionWithinItem));
    const overall = ((index - 1 + clamped) / total) * 100;
    setProgressPercent(Math.min(99, Math.round(overall)));
  }, []);

  const attachLogListener = useCallback((finishedVerb = 'applied') => {
    unsubRef.current?.();
    if (!electronAPI?.onTweakLog) return;
    unsubRef.current = electronAPI.onTweakLog((payload: LogPayload) => {
      if (payload.type === 'start') {
        if (payload.index && payload.total) {
          batchProgressRef.current = { index: payload.index, total: payload.total };
          // Start of item N → beginning of that item's slice (was stuck at 50% for 2/2)
          setProgressPercent(Math.min(99, Math.round(((payload.index - 1) / payload.total) * 100)));
        }
        appendLog(`[${payload.index}/${payload.total}] ${payload.name}`, 'info');
      } else if (payload.type === 'command') {
        appendLog(`  > ${payload.line}`, 'cmd');
      } else if (payload.type === 'output' && payload.line?.trim()) {
        const line = payload.line.trim();
        appendLog(`  ${line}`, 'out');
        const pctMatch = line.match(/\((\d+)%\)/);
        if (pctMatch) {
          setBatchSliceProgress(parseInt(pctMatch[1], 10) / 100);
        } else if (/download complete/i.test(line)) {
          setBatchSliceProgress(0.7);
        } else if (/running installer/i.test(line)) {
          setBatchSliceProgress(0.85);
        } else if (/install finished/i.test(line)) {
          setBatchSliceProgress(0.95);
        }
      } else if (payload.type === 'success') {
        appendLog(`  OK  ${payload.name}`, 'ok');
        const { index, total } = batchProgressRef.current;
        if (total) setProgressPercent(Math.min(99, Math.round((index / total) * 100)));
      } else if (payload.type === 'skip') {
        appendLog(`  SKIP  ${payload.name}${payload.error ? ` — ${payload.error}` : ''}`, 'info');
        const { index, total } = batchProgressRef.current;
        if (total) setProgressPercent(Math.min(99, Math.round((index / total) * 100)));
      } else if (payload.type === 'fail') {
        appendLog(`  FAIL  ${payload.name}${payload.error ? ` — ${payload.error}` : ''}`, 'fail');
        const { index, total } = batchProgressRef.current;
        if (total) setProgressPercent(Math.min(99, Math.round((index / total) * 100)));
      } else if (payload.type === 'done') {
        setProgressPercent(100);
        const verb = payload.finishedLabel || finishedVerb;
        const skip = payload.skipCount ? `, ${payload.skipCount} skipped` : '';
        appendLog(
          `Finished: ${payload.successCount} ${verb}, ${payload.failCount} failed${skip} (of ${payload.total})`,
          'info'
        );
        if (payload.skippedNames && payload.skippedNames.length > 0) {
          appendLog('Skipped items:', 'info');
          payload.skippedNames.forEach(name => {
            appendLog(`  • ${name}`, 'info');
          });
        }
      }
    });
  }, [appendLog, setBatchSliceProgress]);

  const runTweaks = useCallback(async (toApply: Tweak[]) => {
    if (toApply.length === 0 || isApplying) return;

    setIsApplying(true);
    setBusyMode('tweaks');
    setApplySummary(null);
    setShowRestartPrompt(false);
    setProgressPercent(0);
    setLogLines([]);
    appendLog(`Starting ${toApply.length} tweak(s)...`, 'info');

    setTweakStatuses(prev => {
      const next = { ...prev };
      toApply.forEach(t => { next[t.id] = 'working'; });
      return next;
    });

    attachLogListener('applied');

    try {
      if (electronAPI?.applyTweaks) {
        const response: ApplyResponse = await electronAPI.applyTweaks(toApply, 'apply');
        const results = Array.isArray(response) ? response : response.results;
        const successCount = Array.isArray(response)
          ? results.filter(r => r.success && !r.skipped).length
          : response.successCount;
        const failCount = Array.isArray(response)
          ? results.filter(r => !r.success).length
          : response.failCount;
        const skipCount = Array.isArray(response)
          ? results.filter(r => r.skipped).length
          : (response.skipCount || 0);

        setTweakStatuses(prev => {
          const next = { ...prev };
          results.forEach(r => {
            if (r.skipped) next[r.id] = 'skipped';
            else next[r.id] = r.success ? 'applied' : 'failed';
          });
          return next;
        });
        setApplySummary(
          skipCount > 0
            ? `${successCount} applied · ${failCount} failed · ${skipCount} skipped`
            : `${successCount} applied · ${failCount} failed`
        );
        setProgressPercent(100);
        setShowRestartPrompt(true);
      } else {
        for (let i = 0; i < toApply.length; i++) {
          const t = toApply[i];
          setProgressPercent(Math.round(((i + 1) / toApply.length) * 100));
          appendLog(`[${i + 1}/${toApply.length}] ${t.name}`, 'info');
          appendLog('  (browser preview — no system changes)', 'cmd');
          await new Promise(res => setTimeout(res, 80));
          appendLog(`  OK  ${t.name}`, 'ok');
        }
        setTweakStatuses(prev => {
          const next = { ...prev };
          toApply.forEach(t => { next[t.id] = 'applied'; });
          return next;
        });
        setApplySummary(`${toApply.length} applied · 0 failed`);
        appendLog(`Finished: ${toApply.length} applied, 0 failed (of ${toApply.length})`, 'info');
        setProgressPercent(100);
        setShowRestartPrompt(true);
      }
    } finally {
      unsubRef.current?.();
      unsubRef.current = null;
      setIsApplying(false);
      setBusyMode(null);
    }
  }, [appendLog, attachLogListener, isApplying]);

  const runAppInstalls = useCallback(async (apps: AppItem[]) => {
    if (apps.length === 0 || isApplying) return { ok: [], bad: [] };

    setIsApplying(true);
    setBusyMode('apps');
    setApplySummary(null);
    setShowRestartPrompt(false);
    setProgressPercent(0);
    setLogLines([]);
    appendLog(`Installing ${apps.length} app(s)...`, 'info');

    attachLogListener('installed');

    try {
      if (electronAPI?.installApps) {
        const response: InstallResponse = await electronAPI.installApps(apps);
        const results = Array.isArray(response) ? response : response.results;
        const ok = results.filter(r => r.success).map(r => r.id);
        const bad = results.filter(r => !r.success).map(r => r.id);
        const skipCount = Array.isArray(response)
          ? results.filter(r => r.skipped).length
          : (response as { skipCount?: number }).skipCount || 0;
        const successCount = Array.isArray(response)
          ? results.filter(r => r.success && !r.skipped).length
          : response.successCount;
        const failCount = Array.isArray(response)
          ? bad.length
          : response.failCount;
        setApplySummary(
          skipCount > 0
            ? `${successCount} installed · ${failCount} failed · ${skipCount} already installed`
            : `${successCount} installed · ${failCount} failed`
        );
        setProgressPercent(100);
        return { ok, bad };
      }

      for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        setProgressPercent(Math.min(99, Math.round((i / apps.length) * 100)));
        appendLog(`[${i + 1}/${apps.length}] Install ${app.name}`, 'info');
        appendLog('  (browser preview — no system changes)', 'cmd');
        await new Promise(res => setTimeout(res, 400));
        appendLog(`  OK  Install ${app.name}`, 'ok');
      }
      setApplySummary(`${apps.length} installed · 0 failed`);
      appendLog(`Finished: ${apps.length} installed, 0 failed (of ${apps.length})`, 'info');
      setProgressPercent(100);
      return { ok: apps.map(a => a.id), bad: [] };
    } finally {
      unsubRef.current?.();
      unsubRef.current = null;
      setIsApplying(false);
      setBusyMode(null);
    }
  }, [appendLog, attachLogListener, isApplying]);

  const value = useMemo(
    () => ({
      tweakStatuses,
      isApplying,
      busyMode,
      logLines,
      applySummary,
      progressPercent,
      showRestartPrompt,
      clearLogs,
      dismissRestartPrompt,
      restartNow,
      runTweaks,
      runAppInstalls,
    }),
    [
      tweakStatuses,
      isApplying,
      busyMode,
      logLines,
      applySummary,
      progressPercent,
      showRestartPrompt,
      clearLogs,
      dismissRestartPrompt,
      restartNow,
      runTweaks,
      runAppInstalls,
    ]
  );

  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>;
}

export function useTerminal() {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error('useTerminal must be used inside TerminalProvider');
  return ctx;
}

/** Per-view runner: statuses for this view's apply + shared terminal logs */
export function useTweakRunner() {
  const { tweakStatuses, isApplying, runTweaks } = useTerminal();
  return { tweakStatuses, isApplying, runTweaks };
}
