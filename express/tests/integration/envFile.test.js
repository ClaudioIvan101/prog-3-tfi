const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { mkdtempSync, writeFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { scripts } = require("../../package.json");

test("start loads an optional .env without overriding process variables", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "inmobiliaria-env-"));
  const args = scripts.start.split(" ").slice(1, -1);
  const env = { ...process.env };
  delete env.PORT;
  const script = "console.log(process.env.PORT || 'default')";

  function readPort(environment) {
    const result = spawnSync(process.execPath, [...args, "-e", script], {
      cwd, env: environment, encoding: "utf8", timeout: 5000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }

  try {
    assert.equal(readPort(env), "default");
    writeFileSync(path.join(cwd, ".env"), "PORT=4321\n");
    assert.equal(readPort(env), "4321");
    assert.equal(readPort({ ...env, PORT: "5432" }), "5432");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
