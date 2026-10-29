import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFileSync } from "node:fs";
const { scripts } = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

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
