/**
 * Benchmark the available zstd backends.
 *
 * Run with:  node scripts/bench-backends.js [iterations]
 *
 * `node:zlib` is native and can both compress and decompress; `fzstd` is pure
 * JavaScript and can only decompress. This script measures both so the default
 * backend is an informed choice.
 */

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import * as codec from "../src/codec.js";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const iterations = Number(process.argv[2] ?? 500);

const code = readFileSync(path.join(here, "..", "test", "fixtures", "sample_code.txt"), "utf8").trim();
const json = codec.decompress(code);
const plain = Buffer.from(json, "utf8");
const frame = zlib.zstdCompressSync(plain);

/** @param {() => void} fn */
function time(fn) {
  fn();
  fn();
  const started = process.hrtime.bigint();
  for (let i = 0; i < iterations; i += 1) fn();
  return Number(process.hrtime.bigint() - started) / 1e6 / iterations;
}

let fzstd = null;
try {
  fzstd = require("fzstd");
} catch {
  fzstd = null;
}

const rows = [
  ["node:zlib compress", plain.length, () => zlib.zstdCompressSync(plain)],
  ["node:zlib decompress", plain.length, () => zlib.zstdDecompressSync(frame)],
];
if (fzstd) {
  rows.push(["fzstd decompress", plain.length, () => Buffer.from(fzstd.decompress(frame))]);
}

console.log(`payload: ${plain.length} bytes -> ${frame.length} byte frame, ${iterations} iterations`);
console.log("backend                 ms/op");
for (const [name, , fn] of rows) {
  console.log(`${name.padEnd(22)} ${time(fn).toFixed(4)}`);
}
if (!fzstd) console.log("(fzstd not installed; npm install fzstd to benchmark it)");
