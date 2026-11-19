/**
 * A custom backend installed with `register_backend` must take priority, so a
 * browser can hand the codec a WASM zstd implementation.
 *
 * This lives in its own file: the Node test runner gives each file its own
 * process, so registering a backend here can't leak into the other suites.
 */

import assert from "node:assert/strict";
import test from "node:test";

import * as codec from "../src/codec.js";
import { InvalidCharacterCodeError } from "../src/errors.js";

const zlib = process.getBuiltinModule("node:zlib");

codec.register_backend({
  name: "test-backend",
  compress: (bytes) => new Uint8Array(zlib.zstdCompressSync(bytes)),
  decompress: (bytes) => new Uint8Array(zlib.zstdDecompressSync(bytes)),
});

test("a registered backend takes priority", () => {
  assert.equal(codec.backend_name(), "test-backend");
});

test("a registered backend round trips", () => {
  const raw = JSON.stringify([{ NAME: "custom", K_NAME: "SKILL" }]);
  assert.equal(codec.decompress(codec.compress(raw)), raw);
});

test("register_backend rejects malformed backends", () => {
  assert.throws(() => codec.register_backend(null), TypeError);
  assert.throws(() => codec.register_backend({ name: "x" }), TypeError);
});

test("the active backend never shadows the public API", () => {
  // Whatever is registered, `decode` still validates like normal.
  assert.throws(() => codec.decode("nope"), InvalidCharacterCodeError);
});
