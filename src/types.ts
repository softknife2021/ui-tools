export type Environment = "dev" | "qa" | "staging" | "prod";

export type ReleaseStatus = "pending_approval" | "running" | "succeeded" | "failed" | "rolled_back";

export type StageState = "not_started" | "waiting" | "running" | "done" | "failed";

export interface Project {
  id: string;
  name: string;
}

export interface Release {
  id: string;
  projectId: string;
  version: string;
  environment: Environment;
  status: ReleaseStatus;
  author: string;
  createdAt: string;
  changes: string[];
  stages: { environment: Environment; state: StageState }[];
}

export interface LogLine {
  releaseId: string;
  ts: string;
  level: "info" | "error";
  text: string;
}

export interface PlatformBridge {
  listProjects(): Promise<Project[]>;
  listReleases(projectId?: string): Promise<Release[]>;
  getRelease(id: string): Promise<Release | null>;
  promote(id: string): Promise<Release>;
  subscribeLogs(id: string, onLine: (line: LogLine) => void): () => void;
}
