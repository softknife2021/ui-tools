import { useEffect, useRef, useState } from "react";
import type { LogLine } from "../types";

export function LogDock({ releaseId }: { releaseId?: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLines([]);
    if (!releaseId) return;
    return window.platform.subscribeLogs(releaseId, (line) => {
      if (line.releaseId === releaseId) setLines((prev) => [...prev, line]);
    });
  }, [releaseId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <section className="log-dock panel">
      <div className="panel-title">Logs {releaseId ? `— ${releaseId}` : ""}</div>
      <div className="log-body mono">
        {!releaseId && <div className="muted">Select a release to stream its logs.</div>}
        {lines.map((l, i) => (
          <div key={i} className={`log-line log-${l.level}`}>
            <span className="muted">{new Date(l.ts).toLocaleTimeString()}</span> {l.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
}
