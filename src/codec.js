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
 * The codec is deliberately backend-agnostic and isomorphic:
 *
 * - In Node it uses `node:zlib` (Node 22.15+ ships zstd), then `fzstd` if it is
 *   installed.
 * - In a browser neither exists, so a WASM backend can be installed with
 *   {@link register_backend}; see `docs/` in the repository for a working one.
 *
 * Set the `JSSHENANIGANS_ZSTD_BACKEND` environment variable (e.g. to "fzstd")
 * to prefer a specific backend; the rest stay as fallbacks.
 */

import { BackendNotFoundError, InvalidCharacterCodeError } from "./errors.js";

/** Every zstd frame begins with these four bytes. */
export const ZSTD_MAGIC = new Uint8Array([0x28, 0xb5, 0x2f, 0xfd]);

/** Environment variable used to prefer a specific zstd backend. */
export const ENV_BACKEND = "JSSHENANIGANS_ZSTD_BACKEND";

// The first four base64 characters of any character code (ZSTD_MAGIC).
const MAGIC_B64_PREFIX = "KLUv";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * @typedef {object} Backend
 * @property {string} name
 * @property {((bytes: Uint8Array) => Uint8Array) | null} [compress]
 * @property {(bytes: Uint8Array) => Uint8Array} decompress
 */

// ------------------------------------------------------------------ base64 --- //

/** @param {Uint8Array} bytes @returns {string} */
function bytesToBase64(bytes) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

/** @param {string} text @returns {Uint8Array} */
function base64ToBytes(text) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(text, "base64"));
  }
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

// ---------------------------------------------------------------- backends --- //

/** @returns {Backend} */
function loadZlib() {
  const zlib = globalThis.process?.getBuiltinModule?.("node:zlib");
  if (
    !zlib ||
    typeof zlib.zstdCompressSync !== "function" ||
    typeof zlib.zstdDecompressSync !== "function"
  ) {
    throw new Error("node:zlib has no zstd support (needs Node >= 22.15)");
  }
  return {
    name: "node:zlib",
    compress: (bytes) => new Uint8Array(zlib.zstdCompressSync(bytes)),
    decompress: (bytes) => new Uint8Array(zlib.zstdDecompressSync(bytes)),
  };
}

/** @returns {Backend} */
function loadFzstd() {
  const nodeModule = globalThis.process?.getBuiltinModule?.("node:module");
  if (!nodeModule) throw new Error("fzstd is Node-only");
  const require = nodeModule.createRequire(import.meta.url);
  const fzstd = require("fzstd");
  return {
    name: "fzstd",
    compress: null,
    decompress: (bytes) => new Uint8Array(fzstd.decompress(bytes)),
  };
}

/** @type {Array<[string, () => Backend]>} */
const BACKENDS = [
  ["node:zlib", loadZlib],
  ["fzstd", loadFzstd],
];

/** @type {Backend[]} */
const customBackends = [];

/**
 * Install a custom backend, used before the built-in ones.
 *
 * This is how a browser (or a worker) gets zstd: neither `node:zlib` nor
 * `fzstd` is available there, so hand the codec something that can decompress
 * (and, if you want to export codes, compress) instead.
 *
 * @param {Backend} backend
 */
export function register_backend(backend) {
  if (
    !backend ||
    typeof backend.name !== "string" ||
    typeof backend.decompress !== "function"
  ) {
    throw new TypeError("a backend needs at least { name, decompress }");
  }
  customBackends.unshift(backend);
  cachedBackend = null; // re-resolve on the next call
}

/** @type {Backend | null} */
let cachedBackend = null;

/** @returns {Backend[]} */
function candidates() {
  const preferred = (globalThis.process?.env?.[ENV_BACKEND] ?? "")
    .trim()
    .toLowerCase();

  const list = [
    ...customBackends.map((backend) => [backend.name, () => backend]),
    ...BACKENDS,
  ];
  if (preferred) {
    list.sort((a, b) => Number(a[0] !== preferred) - Number(b[0] !== preferred));
  }
  return list;
}

/** @returns {Backend} */
function loadBackend() {
  /** @type {string[]} */
  const problems = [];
  for (const [name, loader] of candidates()) {
    try {
      return loader();
    } catch (exc) {
      problems.push(`${name}: ${exc.name ?? "Error"}: ${exc.message ?? exc}`);
    }
  }

  throw new BackendNotFoundError(
    "no usable zstd backend found (tried " +
      problems.join(", ") +
      "); use Node 22.15+, install 'fzstd', or call register_backend()",
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

// ------------------------------------------------------------------ codec --- //

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

/** @param {Uint8Array} bytes @returns {boolean} */
function hasZstdMagic(bytes) {
  return (
    bytes.length >= 4 &&
    bytes[0] === ZSTD_MAGIC[0] &&
    bytes[1] === ZSTD_MAGIC[1] &&
    bytes[2] === ZSTD_MAGIC[2] &&
    bytes[3] === ZSTD_MAGIC[3]
  );
}

/** @param {string} code @returns {Uint8Array} */
function decodeBytes(code) {
  const cleaned = cleanCode(code);
  if (!cleaned) throw new InvalidCharacterCodeError("empty character code");

  const padded = cleaned + "=".repeat((4 - (cleaned.length % 4)) % 4);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(padded)) {
    throw new InvalidCharacterCodeError("not valid base64");
  }
  const raw = base64ToBytes(padded);
  if (!hasZstdMagic(raw)) {
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
  return bytesToBase64(active.compress(encoder.encode(rawJson)));
}

/**
 * Base64-decode `code` and zstd-decompress it back into a JSON string.
 * @param {string} code
 * @returns {string}
 */
export function decompress(code) {
  return decoder.decode(decodeBytes(code));
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
