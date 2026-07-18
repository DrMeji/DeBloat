import React, { useEffect, useRef } from 'react';
import './LiveTerminal.css';

export type LogLine = {
  id: string;
  text: string;
  kind?: 'info' | 'ok' | 'fail' | 'cmd' | 'out';
};

interface LiveTerminalProps {
  open: boolean;
  onToggle: () => void;
  live: boolean;
  lines: LogLine[];
  summary?: string | null;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({
  open,
  onToggle,
  live,
  lines,
  summary,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines, open]);

  return (
    <div className={`live-terminal ${live ? 'is-live' : ''} ${open ? 'is-open' : ''}`}>
      <button type="button" className="live-terminal-header" onClick={onToggle}>
        <span className={`live-terminal-pulse ${live ? 'active' : ''}`} aria-hidden />
        <span className="live-terminal-title">Live Terminal</span>
        {summary && <span className="live-terminal-summary">{summary}</span>}
        <span className="live-terminal-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="live-terminal-body" ref={bodyRef}>
          {lines.length === 0 ? (
            <div className="live-terminal-empty">
              Nothing running yet. Hit Apply Changes to watch each tweak execute live.
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className={`live-terminal-line kind-${line.kind || 'info'}`}>
                {line.text}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
