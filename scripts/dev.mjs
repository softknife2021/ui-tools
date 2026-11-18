// Starts the Vite dev server, then launches Electron pointed at it.
import { createServer } from "vite";
import { spawn } from "node:child_process";
import electron from "electron";

const server = await createServer();
await server.listen();
const url = server.resolvedUrls.local[0];
console.log(`Vite dev server: ${url}`);

const app = spawn(electron, ["."], {
  stdio: "inherit",
  env: { ...process.env, VITE_DEV_SERVER_URL: url },
});

app.on("close", async (code) => {
  await server.close();
  process.exit(code ?? 0);
});
