import { useState } from "react";
import type { Release } from "../types";
import { StatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";

const NEXT_ENV: Record<string, string | undefined> = { dev: "qa", qa: "staging", staging: "prod" };

interface Props {
  release?: Release;
  onChanged(): void;
}

export function ReleaseDetail({ release, onChanged }: Props) {
  const [tab, setTab] = useState<"overview" | "changes">("overview");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  if (!release) {
    return <section className="release-detail panel empty">Select a release to see details.</section>;
  }

  const target = NEXT_ENV[release.environment];
  const canPromote = Boolean(target) && release.status === "succeeded";

  async function promote() {
    setConfirming(false);
    setError(undefined);
    try {
      await window.platform.promote(release!.id);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <section className="release-detail panel">
      <div className="detail-header">
        <div>
          <h2>
            {release.projectId} <span className="mono">{release.version}</span>
          </h2>
          <div className="muted">
            {release.environment} · {release.author} · {new Date(release.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="actions">
          <StatusBadge status={release.status} />
          <button
            className="primary"
            disabled={!canPromote}
            title={canPromote ? "" : "Only succeeded releases that are not in prod can be promoted"}
            onClick={() => setConfirming(true)}
          >
            Promote{target ? ` to ${target}` : ""}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tabs">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          Pipeline
        </button>
        <button className={tab === "changes" ? "active" : ""} onClick={() => setTab("changes")}>
          Changes ({release.changes.length})
        </button>
      </div>

      {tab === "overview" ? (
        <ol className="pipeline">
          {release.stages.map((s) => (
            <li key={s.environment} className={`stage stage-${s.state}`}>
              <div className="stage-name">{s.environment}</div>
              <StatusBadge status={s.state} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="changes">
          {release.changes.map((c) => (
            <li key={c} className="mono">
              {c}
            </li>
          ))}
        </ul>
      )}

      {confirming && target && (
        <ConfirmDialog
          title={`Promote ${release.id} to ${target}?`}
          body={`This will deploy ${release.projectId} ${release.version} from ${release.environment} to ${target}.`}
          confirmLabel={`Promote to ${target}`}
          onConfirm={promote}
          onCancel={() => setConfirming(false)}
        />
      )}
    </section>
  );
}
