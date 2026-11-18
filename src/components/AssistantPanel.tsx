import type { Release } from "../types";

// Placeholder. Later: main process calls the Claude API with the platform's MCP tools;
// any state-changing tool call it proposes goes through ConfirmDialog first.
export function AssistantPanel({ release }: { release?: Release }) {
  return (
    <aside className="assistant panel">
      <div className="panel-title">AI Assistant</div>
      <div className="assistant-body">
        <p className="muted">Not connected yet (prototype).</p>
        {release && (
          <p className="muted">
            Context: <span className="mono">{release.id}</span>
          </p>
        )}
      </div>
      <input className="assistant-input" placeholder="Ask about this release… (disabled)" disabled />
    </aside>
  );
}
