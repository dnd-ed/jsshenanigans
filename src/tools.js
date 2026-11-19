/**
 * Read-only helpers for looking inside a character code you did not build.
 *
 * These exist because the fastest way to learn what the live game supports is
 * to decode a code *it* produced and read the fields straight off it.
 */

import * as codec from "./codec.js";
import { InvalidCharacterCodeError } from "./errors.js";

/** Recursively parse nested `DATA` JSON strings into objects. */
function expand(obj) {
  if (Array.isArray(obj)) return obj.map(expand);
  if (obj !== null && typeof obj === "object") {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "DATA" && typeof value === "string") {
        try {
          out[key] = expand(JSON.parse(value));
        } catch {
          out[key] = value;
        }
      } else {
        out[key] = expand(value);
      }
    }
    return out;
  }
  return obj;
}

/**
 * Return the full payload of `code` as pretty-printed JSON.
 *
 * @param {string} code
 * @param {object} [options]
 * @param {number} [options.indent] JSON indentation.
 * @param {boolean} [options.expand_data] Parse the nested `DATA` strings so the
 *   whole node graph is visible instead of one escaped blob.
 * @returns {string}
 */
export function dumps(code, { indent = 2, expand_data = true } = {}) {
  const obj = codec.decode(code);
  return JSON.stringify(expand_data ? expand(obj) : obj, null, indent);
}

/**
 * Return a compact structural summary of a character code.
 * @param {string} code
 * @returns {{skill_count: number, skills: object[]}}
 */
export function describe(code) {
  const obj = codec.decode(code);
  if (!Array.isArray(obj)) {
    throw new InvalidCharacterCodeError("top-level payload is not a list of skills");
  }

  const skills = obj.map((entry) => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      return { kind: null, name: null, raw: entry };
    }
    const info = {
      kind: entry.K_NAME ?? null,
      name: entry.NAME ?? null,
      fields: Object.keys(entry).sort(),
    };
    if (typeof entry.DATA === "string") {
      let inner = null;
      try {
        inner = JSON.parse(entry.DATA);
      } catch {
        inner = null;
      }
      if (inner !== null && typeof inner === "object" && !Array.isArray(inner)) {
        info.nodes = (inner.Line ?? [])
          .filter((node) => node !== null && typeof node === "object")
          .map((node) => node.K_NAME);
        info.conditions = (inner.Req ?? [])
          .filter((cond) => cond !== null && typeof cond === "object")
          .map((cond) => cond.K_NAME);
        if (inner.Branch) info.branches = Object.keys(inner.Branch).sort();
      }
    }
    return info;
  });

  return { skill_count: obj.length, skills };
}
