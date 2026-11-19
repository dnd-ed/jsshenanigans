/**
 * Codec tests. Fixtures are real character codes: one produced by the live
 * game's editor and one from libjjs's README.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import * as codec from "../src/codec.js";
import * as jss from "../src/index.js";

const require = createRequire(import.meta.url);
let fzstdAvailable = true;
try {
  require.resolve("fzstd");
} catch {
  fzstdAvailable = false;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const fixture = (name) =>
  readFileSync(path.join(here, "fixtures", name), "utf8").trim();

const SAMPLE_CODE = fixture("sample_code.txt");
const LIBJJS_README_CODE = fixture("libjjs_readme_code.txt");

test("backend is detected", () => {
  assert.ok(jss.backend_name());
});

test("backend can be forced with the env var", () => {
  const out = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import { backend_name } from './src/codec.js'; console.log(backend_name());",
    ],
    {
      cwd: root,
      env: { ...process.env, JSSHENANIGANS_ZSTD_BACKEND: "node:zlib" },
      encoding: "utf8",
    },
  );
  assert.equal(out.trim(), "node:zlib");
});

test("an unavailable backend falls back to a usable one", () => {
  const out = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import { backend_name } from './src/codec.js'; console.log(backend_name());",
    ],
    {
      cwd: root,
      env: { ...process.env, JSSHENANIGANS_ZSTD_BACKEND: "definitely-not-a-backend" },
      encoding: "utf8",
    },
  );
  assert.ok(out.trim().length > 0);
});

test("compress/decompress round trips", () => {
  const raw = JSON.stringify([{ NAME: "x" }]);
  assert.equal(codec.decompress(codec.compress(raw)), raw);
});

test("decode reads the libjjs README sample", () => {
  const payload = codec.decode(LIBJJS_README_CODE);
  assert.ok(Array.isArray(payload));
  assert.deepEqual(
    payload.map((skill) => skill.K_NAME),
    ["SKILL", "SPECIAL", "AWAKENING"],
  );
});

test("round trip preserves everything", () => {
  const original = codec.decode(SAMPLE_CODE);
  const rebuilt = jss.Character.from_code(SAMPLE_CODE).export_character_code();
  assert.deepEqual(codec.decode(rebuilt), original);
});

test("generated frames are single-segment like the game", () => {
  const isSingleSegment = (blob) => {
    assert.ok(blob.subarray(0, 4).equals(codec.ZSTD_MAGIC));
    return Boolean((blob[4] >> 5) & 1);
  };
  const game = Buffer.from(LIBJJS_README_CODE, "base64");
  const generated = Buffer.from(codec.compress('{"a":1}'), "base64");
  assert.equal(isSingleSegment(game), true);
  assert.equal(isSingleSegment(generated), true);
});

test("error hierarchy", () => {
  assert.ok(new jss.InvalidCharacterCodeError("x") instanceof jss.JsshenanigansError);
  assert.ok(new jss.BackendNotFoundError("x") instanceof jss.JsshenanigansError);
  assert.throws(() => codec.decode("obviously not a code!!"), jss.JsshenanigansError);
});

// ------------------------------------------------------------------ fzstd --- //
// `fzstd` is an optional, decompress-only backend. These tests are skipped
// unless it is installed.

test(
  "fzstd decompresses a code produced by node:zlib",
  { skip: fzstdAvailable ? false : "fzstd is not installed" },
  () => {
    const code = codec.compress('{"hello":"world"}');
    const out = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        "import { backend_name, decompress } from './src/codec.js';" +
          "console.log(backend_name());console.log(decompress(process.argv[1]));",
        code,
      ],
      {
        cwd: root,
        env: { ...process.env, JSSHENANIGANS_ZSTD_BACKEND: "fzstd" },
        encoding: "utf8",
      },
    );
    const [name, json] = out.trim().split("\n");
    assert.equal(name, "fzstd");
    assert.equal(json, '{"hello":"world"}');
  },
);

test(
  "fzstd agrees with node:zlib",
  { skip: fzstdAvailable ? false : "fzstd is not installed" },
  () => {
    const fzstd = require("fzstd");
    const frame = zlib.zstdCompressSync(Buffer.from(SAMPLE_CODE, "utf8"));
    assert.deepEqual(
      Buffer.from(fzstd.decompress(frame)),
      zlib.zstdDecompressSync(frame),
    );
  },
);

test(
  "fzstd cannot compress, and says so clearly",
  { skip: fzstdAvailable ? false : "fzstd is not installed" },
  () => {
    const out = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        "import { compress } from './src/codec.js';" +
          "try { compress('x'); console.log('no-error'); } catch (e) { console.log(e.name); }",
      ],
      {
        cwd: root,
        env: { ...process.env, JSSHENANIGANS_ZSTD_BACKEND: "fzstd" },
        encoding: "utf8",
      },
    );
    assert.equal(out.trim(), "BackendNotFoundError");
  },
);

for (const bad of ["", "not base64!!", "aGVsbG8="]) {
  test(`invalid code raises: ${JSON.stringify(bad)}`, () => {
    assert.throws(() => codec.decode(bad), jss.InvalidCharacterCodeError);
  });
}
