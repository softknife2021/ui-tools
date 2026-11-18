import type { ReleaseStatus, StageState } from "../types";

const LABELS: Record<ReleaseStatus | StageState, string> = {
  pending_approval: "Pending approval",
  running: "Running",
  succeeded: "Succeeded",
  failed: "Failed",
  rolled_back: "Rolled back",
  not_started: "Not started",
  waiting: "Waiting",
  done: "Done",
};

export function StatusBadge({ status }: { status: ReleaseStatus | StageState }) {
  return <span className={`badge badge-${status}`}>{LABELS[status]}</span>;
}
