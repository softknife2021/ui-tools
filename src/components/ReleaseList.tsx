import type { Release } from "../types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  releases: Release[];
  selectedId?: string;
  onSelect(id: string): void;
}

export function ReleaseList({ releases, selectedId, onSelect }: Props) {
  return (
    <section className="release-list panel">
      <div className="panel-title">Releases ({releases.length})</div>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Version</th>
            <th>Environment</th>
            <th>Status</th>
            <th>Author</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((r) => (
            <tr key={r.id} className={r.id === selectedId ? "selected" : ""} onClick={() => onSelect(r.id)}>
              <td>{r.projectId}</td>
              <td className="mono">{r.version}</td>
              <td>{r.environment}</td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td>{r.author}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
