import assert from "node:assert/strict";
import net from "node:net";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function findAvailablePort() {
  const reservation = net.createServer();
  reservation.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    reservation.once("listening", resolve);
    reservation.once("error", reject);
  });
  const { port } = reservation.address();
  await new Promise((resolve, reject) => {
    reservation.close((error) => error ? reject(error) : resolve());
  });
  return port;
}

async function waitForServer(server, origin) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error("Java server exited before becoming ready.");
    try {
      const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch {
      await delay(100);
    }
  }
  throw new Error("Java server did not become ready within 6 seconds.");
}

const port = await findAvailablePort();
const origin = `http://127.0.0.1:${port}`;
const server = spawn("java", ["-cp", "bin", "com.sonora.Main"], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});

try {
  await waitForServer(server, origin);

  const health = await fetch(`${origin}/api/health`).then((response) => response.json());
  assert.equal(health.status, "ok");

  const tracks = await fetch(`${origin}/api/tracks`).then((response) => response.json());
  assert.equal(tracks.length, 6);
  assert.deepEqual([...new Set(tracks.map((track) => track.provider))].sort(), ["local", "spotify", "youtube"]);
  for (const track of tracks) {
    assert.equal(typeof track.id, "string");
    assert.equal(typeof track.title, "string");
    assert.equal(typeof track.durationSeconds, "number");
  }

  const search = await fetch(`${origin}/api/tracks?q=bright&provider=spotify`).then((response) => response.json());
  assert.equal(search.length, 1);
  assert.equal(search[0].title, "Mr. Brightside");

  const detail = await fetch(`${origin}/api/tracks/3n3Ppam7vgaVa1iaRUc9Lp`).then((response) => response.json());
  assert.equal(detail.provider, "spotify");
  assert.equal(detail.title, "Mr. Brightside");

  const missingTrack = await fetch(`${origin}/api/tracks/not-a-track`);
  assert.equal(missingTrack.status, 404);
  const rejectedMethod = await fetch(`${origin}/api/health`, { method: "POST" });
  assert.equal(rejectedMethod.status, 405);

  for (const resource of ["/", "/styles.css", "/js/main.js", "/js/PlayerApplication.js"]) {
    const response = await fetch(`${origin}${resource}`);
    assert.equal(response.status, 200, `Expected ${resource} to be served`);
    if (resource.endsWith(".js")) {
      assert.match(response.headers.get("content-type"), /javascript/);
    }
  }

  console.log("Smoke tests passed: health, catalog adapters, search, detail, errors, and static web assets.");
} finally {
  if (server.exitCode === null) {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
}