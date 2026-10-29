import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const serverPath = JSON.stringify(new URL("../../src/server.js", import.meta.url).href);

function runServer(script) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: "0", NODE_ENV: "test" },
    encoding: "utf8",
    timeout: 5000,
  });
}

test("startup reports the actual port assigned by the operating system", () => {
  const result = runServer(`
    const { default: server } = await import(${serverPath});
    server.on("listening", () => {
      console.log("Actual port:", server.address().port);
      server.close();
    });
  `);
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  const port = result.stdout.match(/Actual port: (\d+)/)[1];
  assert.match(result.stdout, new RegExp("Server listening on port " + port));
});

test("an occupied port produces a safe startup error and a failing exit code", () => {
  const result = runServer(`
    const { createServer } = await import("node:net");
    const blocker = createServer();
    blocker.listen(0, "127.0.0.1", async () => {
      process.env.PORT = String(blocker.address().port);
      const { default: server } = await import(${serverPath});
      server.on("error", () => blocker.close());
    });
  `);
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unable to start HTTP server: EADDRINUSE/);
  assert.doesNotMatch(result.stdout, /Server listening|Servidor corriendo/);
});
