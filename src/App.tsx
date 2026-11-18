import { useCallback, useEffect, useState } from "react";
import type { Project, Release } from "./types";
import { Navigator } from "./components/Navigator";
import { ReleaseList } from "./components/ReleaseList";
import { ReleaseDetail } from "./components/ReleaseDetail";
import { LogDock } from "./components/LogDock";
import { AssistantPanel } from "./components/AssistantPanel";

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setReleases(await window.platform.listReleases(projectId));
  }, [projectId]);

  useEffect(() => {
    window.platform.listProjects().then(setProjects);
  }, []);

  // Poll like a live dashboard; replace with push updates once the real API supports it.
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const selected = releases.find((r) => r.id === selectedId);

  return (
    <div className="shell">
      <header className="titlebar">Release IDE — prototype (mock data)</header>
      <Navigator projects={projects} selectedId={projectId} onSelect={setProjectId} />
      <main className="center">
        <ReleaseList releases={releases} selectedId={selectedId} onSelect={setSelectedId} />
        <ReleaseDetail release={selected} onChanged={refresh} />
      </main>
      <AssistantPanel release={selected} />
      <LogDock releaseId={selectedId} />
    </div>
  );
}
