/**
 * The character-code codec.
 *
 * A Jujutsu Shenanigans character code is:
 *
 *     base64( zstd( json ) )
 *
 * where the JSON is the (minified) `Array` of skill objects. Nothing else is
 * layered on top --- the zstd frame is a plain standard frame and the base64
 * uses the standard alphabet, so decoding is fully reversible.
 *
 * This module is deliberately backend-agnostic. A zstd implementation is chosen
 * automatically, in this order:
 *
 * 1. `node:zlib` (Node 22.15+ ships zstd)
 * 2. `fzstd` (optional, decompression only)
 *
 * Set the `JSSHENANIGANS_ZSTD_BACKEND` environment variable (e.g. to "fzstd")
 * to prefer a specific one; the rest stay as fallbacks.
 */

import { Buffer } from "node:buffer";
import { createRequire } from "node:module";
import zlib from "node:zlib";

import { BackendNotFoundError, InvalidCharacterCodeError } from "./errors.js";

const require = createRequire(import.meta.url);

/** Every zstd frame begins with these four bytes. */
export const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd]);

/** Environment variable used to prefer a specific zstd backend. */
export const ENV_BACKEND = "JSSHENANIGANS_ZSTD_BACKEND";

// The first four base64 characters of any character code (ZSTD_MAGIC).
const MAGIC_B64_PREFIX = "KLUv";

/**
 * @typedef {object} Backend
 * @property {string} name
 * @property {((bytes: Buffer) => Buffer) | null} compress
 * @property {(bytes: Buffer) => Buffer} decompress
 */

/** @returns {Backend} */
function loadZlib() {
  if (
    typeof zlib.zstdCompressSync !== "function" ||
    typeof zlib.zstdDecompressSync !== "function"
  ) {
    throw new Error("node:zlib has no zstd support (needs Node >= 22.15)");
  }
  return {
    name: "node:zlib",
    compress: (bytes) => zlib.zstdCompressSync(bytes),
    decompress: (bytes) => zlib.zstdDecompressSync(bytes),
  };
}

/** @returns {Backend} */
function loadFzstd() {
  const fzstd = require("fzstd");
  return {
    name: "fzstd",
    compress: null,
    decompress: (bytes) => Buffer.from(fzstd.decompress(bytes)),
  };
}

/** @type {ReadonlyArray<[string, () => Backend]>} */
const BACKENDS = [
  ["node:zlib", loadZlib],
  ["fzstd", loadFzstd],
];

/** @type {Backend | null} */
let cachedBackend = null;

/** @returns {Backend} */
function loadBackend() {
  const preferred = (process.env[ENV_BACKEND] ?? "").trim().toLowerCase();
  const candidates = [...BACKENDS];
  if (preferred) {
    candidates.sort((a, b) => Number(a[0] !== preferred) - Number(b[0] !== preferred));
  }

  /** @type {string[]} */
  const problems = [];
  for (const [name, loader] of candidates) {
    try {
      return loader();
    } catch (exc) {
      problems.push(`${name}: ${exc.name ?? "Error"}: ${exc.message ?? exc}`);
    }
  }

  throw new BackendNotFoundError(
    `no usable zstd backend found (tried ${problems.join(", ")}); ` +
      "use Node 22.15+ or install 'fzstd'",
  );
}

/** @returns {Backend} */
function backend() {
  if (cachedBackend === null) cachedBackend = loadBackend();
  return cachedBackend;
}

/** Return the name of the zstd implementation currently in use. */
export function backend_name() {
  return backend().name;
}

/** @param {string} code @returns {string} */
function cleanCode(code) {
  if (typeof code !== "string") {
    throw new InvalidCharacterCodeError(
      `expected a string character code, got ${typeof code}`,
    );
  }
  let cleaned = code.replace(/\s+/g, "");
  // Tolerate codes copied with a prefix in front of them (e.g. a "Code: "
  // label) by resyncing on the magic.
  const index = cleaned.indexOf(MAGIC_B64_PREFIX);
  if (index > 0) cleaned = cleaned.slice(index);
  return cleaned;
}

/** @param {string} cleaned @returns {Buffer} */
function decodeBase64(cleaned) {
  const padded = cleaned + "=".repeat((4 - (cleaned.length % 4)) % 4);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(padded)) {
    throw new InvalidCharacterCodeError("not valid base64");
  }
  return Buffer.from(padded, "base64");
}

/** @param {string} code @returns {Buffer} */
function decodeBytes(code) {
  const cleaned = cleanCode(code);
  if (!cleaned) throw new InvalidCharacterCodeError("empty character code");

  const raw = decodeBase64(cleaned);
  if (!raw.subarray(0, 4).equals(ZSTD_MAGIC)) {
    throw new InvalidCharacterCodeError(
      "decoded payload is not a zstd frame; this does not look like a " +
        "character code",
    );
  }

  let decompressed;
  try {
    decompressed = backend().decompress(raw);
  } catch (exc) {
    throw new InvalidCharacterCodeError(
      `zstd decompression failed: ${exc.message ?? exc}`,
    );
  }
  if (!decompressed || decompressed.length === 0) {
    throw new InvalidCharacterCodeError(
      "zstd decompression produced no data; the code is corrupt",
    );
  }
  return decompressed;
}

/**
 * zstd-compress a JSON string and base64-encode the result.
 * @param {string} rawJson
 * @returns {string}
 */
export function compress(rawJson) {
  const active = backend();
  if (typeof active.compress !== "function") {
    throw new BackendNotFoundError(`backend '${active.name}' cannot compress`);
  }
  return active.compress(Buffer.from(rawJson, "utf8")).toString("base64");
}

/**
 * Base64-decode `code` and zstd-decompress it back into a JSON string.
 * @param {string} code
 * @returns {string}
 */
export function decompress(code) {
  return decodeBytes(code).toString("utf8");
}

/**
 * Serialise a character payload (an array of skills) into a character code.
 * @param {unknown} payload
 * @returns {string}
 */
export function encode(payload) {
  return compress(JSON.stringify(payload));
}

/**
 * Decode a character code back into JavaScript objects.
 * @param {string} code
 * @returns {unknown}
 */
export function decode(code) {
  const json = decompress(code);
  try {
    return JSON.parse(json);
  } catch (exc) {
    throw new InvalidCharacterCodeError(`payload is not valid JSON: ${exc.message ?? exc}`);
  }
}
