// Narrow, typed bridge exposed to the renderer as window.platform (see src/global.d.ts).
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("platform", {
  listProjects: () => ipcRenderer.invoke("platform:listProjects"),
  listReleases: (projectId) => ipcRenderer.invoke("platform:listReleases", projectId),
  getRelease: (id) => ipcRenderer.invoke("platform:getRelease", id),
  promote: (id) => ipcRenderer.invoke("platform:promote", id),
  subscribeLogs: (id, onLine) => {
    const listener = (_e, line) => onLine(line);
    ipcRenderer.on("logs:line", listener);
    ipcRenderer.send("logs:subscribe", id);
    return () => {
      ipcRenderer.removeListener("logs:line", listener);
      ipcRenderer.send("logs:unsubscribe");
    };
  },
});
