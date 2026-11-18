import type { Project } from "../types";

interface Props {
  projects: Project[];
  selectedId?: string;
  onSelect(id: string | undefined): void;
}

export function Navigator({ projects, selectedId, onSelect }: Props) {
  return (
    <nav className="navigator panel">
      <div className="panel-title">Explorer</div>
      <div className="tree-group">Projects</div>
      <button className={`tree-item ${!selectedId ? "active" : ""}`} onClick={() => onSelect(undefined)}>
        All releases
      </button>
      {projects.map((p) => (
        <button
          key={p.id}
          className={`tree-item ${selectedId === p.id ? "active" : ""}`}
          onClick={() => onSelect(p.id)}
        >
          ▸ {p.name}
        </button>
      ))}
    </nav>
  );
}
