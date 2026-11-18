// Electron main process: owns all platform access (later: REST client, credentials,
// MCP client, Claude API). The renderer only talks to it through preload.cjs.
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const platform = require("./mockPlatform.cjs");

const logStreams = new Map();

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Release IDE (prototype)",
    backgroundColor: "#1e1f22",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

ipcMain.handle("platform:listProjects", () => platform.listProjects());
ipcMain.handle("platform:listReleases", (_e, projectId) => platform.listReleases(projectId));
ipcMain.handle("platform:getRelease", (_e, id) => platform.getRelease(id));
ipcMain.handle("platform:promote", (_e, id) => platform.promote(id));

ipcMain.on("logs:subscribe", (event, id) => {
  const key = event.sender.id;
  logStreams.get(key)?.();
  const stop = platform.streamLogs(id, (line) => {
    if (!event.sender.isDestroyed()) event.sender.send("logs:line", { releaseId: id, ...line });
  });
  logStreams.set(key, stop);
});

ipcMain.on("logs:unsubscribe", (event) => {
  logStreams.get(event.sender.id)?.();
  logStreams.delete(event.sender.id);
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
