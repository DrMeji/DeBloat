import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Tweak } from '../data/gamerTweaks';

export type LogLine = {
  id: string;
  text: string;
  kind?: 'info' | 'ok' | 'fail' | 'cmd' | 'out';
};

type TweakStatus = 'applied' | 'failed' | 'working' | 'pending' | 'skipped';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

let logSeq = 0;
const nextId = () => `log-${Date.now()}-${++logSeq}`;

type TerminalContextValue = {
  tweakStatuses: Record<string, TweakStatus>;
  isApplying: boolean;
  logLines: LogLine[];
  applySummary: string | null;
  clearLogs: () => void;
  runTweaks: (toApply: Tweak[]) => Promise<void>;
};

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [applySummary, setApplySummary] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

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
  }, []);

  const runTweaks = useCallback(async (toApply: Tweak[]) => {
    if (toApply.length === 0 || isApplying) return;

    setIsApplying(true);
    setApplySummary(null);
    setLogLines([]);
    appendLog(`Starting ${toApply.length} tweak(s)...`, 'info');

    setTweakStatuses(prev => {
      const next = { ...prev };
      toApply.forEach(t => { next[t.id] = 'working'; });
      return next;
    });

    unsubRef.current?.();
    if (electronAPI?.onTweakLog) {
      unsubRef.current = electronAPI.onTweakLog((payload: {
        type: string;
        name?: string;
        index?: number;
        total?: number;
        line?: string;
        error?: string;
        successCount?: number;
        failCount?: number;
        skipCount?: number;
      }) => {
        if (payload.type === 'start') {
          appendLog(`[${payload.index}/${payload.total}] ${payload.name}`, 'info');
        } else if (payload.type === 'command') {
          appendLog(`  > ${payload.line}`, 'cmd');
        } else if (payload.type === 'output' && payload.line?.trim()) {
          appendLog(`  ${payload.line.trim()}`, 'out');
        } else if (payload.type === 'success') {
          appendLog(`  OK  ${payload.name}`, 'ok');
        } else if (payload.type === 'skip') {
          appendLog(`  SKIP  ${payload.name}${payload.error ? ` — ${payload.error}` : ''}`, 'info');
        } else if (payload.type === 'fail') {
          appendLog(`  FAIL  ${payload.name}${payload.error ? ` — ${payload.error}` : ''}`, 'fail');
        } else if (payload.type === 'done') {
          const skip = payload.skipCount ? `, ${payload.skipCount} skipped` : '';
          appendLog(
            `Finished: ${payload.successCount} applied, ${payload.failCount} failed${skip} (of ${payload.total})`,
            'info'
          );
        }
      });
    }

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
      } else {
        for (let i = 0; i < toApply.length; i++) {
          const t = toApply[i];
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
      }
    } finally {
      unsubRef.current?.();
      unsubRef.current = null;
      setIsApplying(false);
    }
  }, [appendLog, isApplying]);

  const value = useMemo(
    () => ({ tweakStatuses, isApplying, logLines, applySummary, clearLogs, runTweaks }),
    [tweakStatuses, isApplying, logLines, applySummary, clearLogs, runTweaks]
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
