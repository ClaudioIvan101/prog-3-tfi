const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const configPath = path.resolve(__dirname, "../../src/config/env.js");

function loadPort(value) {
  return spawnSync(process.execPath, ["-e", `console.log(require(${JSON.stringify(configPath)}).port)`], {
    env: { ...process.env, PORT: value },
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
