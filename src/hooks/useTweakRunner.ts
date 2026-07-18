import { useCallback, useEffect, useRef, useState } from 'react';
import type { Tweak } from '../data/gamerTweaks';
import type { LogLine } from '../components/LiveTerminal';

type TweakStatus = 'applied' | 'failed' | 'working' | 'pending';

type ApplyResult = {
  id: string;
  success: boolean;
  error?: string;
};

type ApplyResponse =
  | ApplyResult[]
  | { results: ApplyResult[]; successCount: number; failCount: number; total: number };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electronAPI = (window as any).electronAPI;

let logSeq = 0;
const nextId = () => `log-${Date.now()}-${++logSeq}`;

export function useTweakRunner() {
  const [tweakStatuses, setTweakStatuses] = useState<Record<string, TweakStatus>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(false);
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

  const runTweaks = useCallback(async (toApply: Tweak[]) => {
    if (toApply.length === 0 || isApplying) return;

    setIsApplying(true);
    setTerminalOpen(true);
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
      }) => {
        if (payload.type === 'start') {
          appendLog(`[${payload.index}/${payload.total}] ${payload.name}`, 'info');
        } else if (payload.type === 'command') {
          appendLog(`  > ${payload.line}`, 'cmd');
        } else if (payload.type === 'output' && payload.line?.trim()) {
          appendLog(`  ${payload.line.trim()}`, 'out');
        } else if (payload.type === 'success') {
          appendLog(`  OK  ${payload.name}`, 'ok');
        } else if (payload.type === 'fail') {
          appendLog(`  FAIL  ${payload.name}${payload.error ? ` — ${payload.error}` : ''}`, 'fail');
        } else if (payload.type === 'done') {
          appendLog(
            `Finished: ${payload.successCount} applied, ${payload.failCount} failed (of ${payload.total})`,
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
          ? results.filter(r => r.success).length
          : response.successCount;
        const failCount = Array.isArray(response)
          ? results.filter(r => !r.success).length
          : response.failCount;

        setTweakStatuses(prev => {
          const next = { ...prev };
          results.forEach(r => { next[r.id] = r.success ? 'applied' : 'failed'; });
          return next;
        });
        setApplySummary(`${successCount} applied · ${failCount} failed`);
      } else {
        for (let i = 0; i < toApply.length; i++) {
          const t = toApply[i];
          appendLog(`[${i + 1}/${toApply.length}] ${t.name}`, 'info');
          appendLog('  (browser preview — no system changes)', 'cmd');
          await new Promise(res => setTimeout(res, 120));
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

  return {
    tweakStatuses,
    setTweakStatuses,
    isApplying,
    logLines,
    terminalOpen,
    setTerminalOpen,
    applySummary,
    runTweaks,
  };
}
