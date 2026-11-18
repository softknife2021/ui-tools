// Mock release-engineering platform. Replace with a real REST client later;
// keep the same function names so the IPC layer and UI do not change.

const ENVIRONMENTS = ["dev", "qa", "staging", "prod"];

const projects = [
  { id: "payments-svc", name: "payments-svc" },
  { id: "mobile-app", name: "mobile-app" },
  { id: "reporting-api", name: "reporting-api" },
];

const releases = [
  release("payments-svc", "2.14.0", "staging", "running", "j.doe", [
    "PAY-812 Retry idempotency keys on timeout",
    "PAY-820 Bump TLS library",
  ]),
  release("payments-svc", "2.13.2", "prod", "succeeded", "a.smith", ["PAY-801 Hotfix currency rounding"]),
  release("payments-svc", "2.13.1", "prod", "rolled_back", "a.smith", ["PAY-799 Ledger batch size"]),
  release("mobile-app", "5.3.0", "qa", "failed", "k.lee", [
    "MOB-311 New onboarding flow",
    "MOB-318 Crash fix on Android 15",
  ]),
  release("mobile-app", "5.2.4", "prod", "succeeded", "k.lee", ["MOB-305 Analytics consent banner"]),
  release("reporting-api", "1.8.0", "dev", "pending_approval", "m.chen", ["REP-77 CSV export", "REP-80 Pagination"]),
];

function release(projectId, version, environment, status, author, changes) {
  return {
    id: `${projectId}@${version}`,
    projectId,
    version,
    environment,
    status,
    author,
    createdAt: new Date(Date.now() - Math.random() * 7 * 864e5).toISOString(),
    changes,
    stages: ENVIRONMENTS.map((env) => ({
      environment: env,
      state: stageState(ENVIRONMENTS.indexOf(env), ENVIRONMENTS.indexOf(environment), status),
    })),
  };
}

function stageState(stageIdx, currentIdx, status) {
  if (stageIdx < currentIdx) return "done";
  if (stageIdx > currentIdx) return "not_started";
  if (status === "succeeded") return "done";
  if (status === "running") return "running";
  if (status === "pending_approval") return "waiting";
  return "failed";
}

function listProjects() {
  return projects;
}

function listReleases(projectId) {
  return releases.filter((r) => !projectId || r.projectId === projectId);
}

function getRelease(id) {
  return releases.find((r) => r.id === id) ?? null;
}

function nextEnvironment(env) {
  const i = ENVIRONMENTS.indexOf(env);
  return i >= 0 && i < ENVIRONMENTS.length - 1 ? ENVIRONMENTS[i + 1] : null;
}

// State-changing action. The UI must get explicit user confirmation first.
function promote(id) {
  const r = getRelease(id);
  if (!r) throw new Error(`Unknown release ${id}`);
  const target = nextEnvironment(r.environment);
  if (!target) throw new Error(`${id} is already in ${r.environment}`);
  if (r.status !== "succeeded") throw new Error(`Only succeeded releases can be promoted (status: ${r.status})`);
  Object.assign(r, release(r.projectId, r.version, target, "running", r.author, r.changes), { createdAt: r.createdAt });
  return r;
}

const LOG_LINES = [
  "Resolving artifact {id}",
  "Pulling image registry.example/{project}:{version}",
  "Running pre-deploy checks",
  "Applying configuration to {env}",
  "Health check 1/3 OK",
  "Health check 2/3 OK",
  "Health check 3/3 OK",
  "Deployment step complete",
];

// Simulated log stream: calls onLine every ~700ms, returns a stop function.
function streamLogs(id, onLine) {
  const r = getRelease(id);
  if (!r) return () => {};
  let i = 0;
  const timer = setInterval(() => {
    const template = LOG_LINES[i % LOG_LINES.length];
    const failed = r.status === "failed" && i === 4;
    const text = failed
      ? "ERROR Health check failed: /ready returned 503"
      : template
          .replace("{id}", r.id)
          .replace("{project}", r.projectId)
          .replace("{version}", r.version)
          .replace("{env}", r.environment);
    onLine({ ts: new Date().toISOString(), level: failed ? "error" : "info", text });
    i++;
    if (r.status === "running" && i >= LOG_LINES.length) {
      // Simulated deploy finished.
      r.status = "succeeded";
      r.stages = r.stages.map((s) => (s.state === "running" ? { ...s, state: "done" } : s));
    }
    if (failed || (r.status !== "running" && i >= LOG_LINES.length)) clearInterval(timer);
  }, 700);
  return () => clearInterval(timer);
}

module.exports = { listProjects, listReleases, getRelease, promote, streamLogs, nextEnvironment };
