const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const configPath = path.resolve(__dirname, "../../src/config/env.js");

function loadPort(value) {
  return spawnSync(process.execPath, ["-e", `console.log(require(${JSON.stringify(configPath)}).port)`], {
    env: { ...process.env, PORT: value, NODE_ENV: "test" },
    encoding: "utf8",
  });
}

test("PORT accepts decimal integers and keeps the default for an empty value", () => {
  for (const [value, expected] of [["", 3000], ["0", 0], ["3001", 3001], ["65535", 65535]]) {
    const result = loadPort(value);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(Number(result.stdout), expected);
  }
});

test("PORT rejects non-decimal values and values outside the valid range", () => {
  for (const value of [" ", "3000\n", "0x10", "1e3", "1.5", "-1", "65536", "abc"]) {
    assert.notEqual(loadPort(value).status, 0, `PORT=${JSON.stringify(value)} must fail`);
  }
});

function loadNodeEnv(value) {
  return spawnSync(process.execPath, ["-e", `console.log(require(${JSON.stringify(configPath)}).nodeEnv)`], {
    env: { ...process.env, PORT: "0", NODE_ENV: value },
    encoding: "utf8",
  });
}

test("NODE_ENV defaults to development and accepts supported modes", () => {
  for (const [value, expected] of [["", "development"], ["development", "development"], ["test", "test"], ["production", "production"]]) {
    const result = loadNodeEnv(value);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), expected);
  }
});

test("NODE_ENV rejects misspelled or unsupported modes before startup", () => {
  for (const value of ["prodution", "Production", " production ", "staging"]) {
    assert.notEqual(loadNodeEnv(value).status, 0, `NODE_ENV=${JSON.stringify(value)} must fail`);
  }
});
