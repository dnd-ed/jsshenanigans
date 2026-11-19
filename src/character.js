/**
 * The `Character` builder and loader.
 *
 * Unlike libjjs, a `Character` can be *loaded* from an existing character code
 * with `Character.from_code`. Loaded entries are kept verbatim, so fields the
 * library does not model (`TOOL TIP`, awakening `COLOR`, editor `PREVIEW`
 * metadata, unknown nodes, ...) survive a decode -> edit -> encode round trip
 * untouched.
 */

import * as codec from "./codec.js";
import { CONDITIONS_DEFAULTS, NODE_DEFAULTS, PROPERTIES_DEFAULTS } from "./defaults.js";
import { InvalidCharacterCodeError } from "./errors.js";
import { VISUAL } from "./nodes.js";
import { BodyParts } from "./types.js";
import { Properties } from "./utils.js";

const SKILL_KINDS = ["SKILL", "SPECIAL", "MELEE", "CHASE", "AWAKENING"];

/**
 * Structural equality, so array defaults (e.g. `ANIM_USE`) compare by value.
 * @param {unknown} a
 * @param {unknown} b
 */
function sameValue(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length && keysA.every((k) => sameValue(a[k], b[k]))
    );
  }
  return false;
}

/** Drop entries whose value equals the node type's default. */
function stripNodeDefaults(node) {
  const defaults = NODE_DEFAULTS[node.K_NAME];
  if (!defaults) return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "K_NAME" || !(key in defaults) || !sameValue(defaults[key], value)) {
      out[key] = value;
    }
  }
  return out;
}

/** Drop entries whose value equals the condition type's default. */
function stripConditionDefaults(condition) {
  const defaults = CONDITIONS_DEFAULTS[condition.K_NAME];
  if (!defaults) return condition;
  const out = {};
  for (const [key, value] of Object.entries(condition)) {
    if (key === "K_NAME" || !(key in defaults) || !sameValue(defaults[key], value)) {
      out[key] = value;
    }
  }
  return out;
}

/** Drop properties whose value equals the property default. */
function stripPropertyDefaults(properties) {
  const out = {};
  for (const [key, value] of Object.entries(properties)) {
    if (key in PROPERTIES_DEFAULTS && sameValue(PROPERTIES_DEFAULTS[key], value)) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Validate a decoded payload, throwing {@link InvalidCharacterCodeError}.
 * Guards the whole `Character` API: without this a payload like `[1, 2, 3]`
 * fails later with an opaque `TypeError` instead.
 * @param {unknown} payload
 * @returns {object[]}
 */
function validateSkills(payload) {
  if (!Array.isArray(payload)) {
    throw new InvalidCharacterCodeError("top-level payload is not a list of skills");
  }
  payload.forEach((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new InvalidCharacterCodeError(
        `skill #${index} is ${describeType(entry)}, expected an object`,
      );
    }
  });
  return payload;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function describeType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/** A Jujutsu Shenanigans moveset, built from scratch or loaded from a code. */
export class Character {
  /**
   * @param {object} [options]
   * @param {boolean} [options.hide_character_extras] Prepend a hidden skill that
   *   hides the character's body (this *also* hides player accessories like
   *   hair). Ignored when `raw` is given.
   * @param {object[] | null} [options.raw] An existing payload to wrap (e.g. the
   *   result of `codec.decode`). Entries are kept as-is.
   */
  constructor({ hide_character_extras = false, raw = null } = {}) {
    this.raw = raw !== null ? [...validateSkills(raw)] : [];
    this.create = new CreateHelper(this);
    if (raw === null && hide_character_extras) {
      this.create.skill(
        "init__HideCharacterExtras",
        [
          // hide everything
          VISUAL({ effect: "Visibility", opacity: 1, alt_opacity: 1 }),
          // show limbs
          ...BodyParts.filter((part) => part !== "HumanoidRootPart").map((limb) =>
            VISUAL({ effect: "Visibility", opacity: 0, alt_opacity: 0, limb }),
          ),
        ],
        // Visibility comes from hide_in_base AND hide_in_awakening (both are
        // required -- a single flag only hides it in one mode), not from KEY.
        // The key allocator counts this entry, so user skills still receive
        // unique keys.
        {
          properties: Properties({
            use_when_obtained: true,
            hide_in_awakening: true,
            hide_in_base: true,
          }),
        },
      );
    }
  }

  // ---------------------------------------------------------------- //
  // loading / exporting
  // ---------------------------------------------------------------- //

  /**
   * Load a character from a JJS character code. Every field is preserved
   * verbatim, including ones this library does not understand.
   * @param {string} code
   * @returns {Character}
   */
  static from_code(code) {
    return new Character({ raw: codec.decode(code) });
  }

  /**
   * Load a character from a raw JSON string (the inner a code holds).
   * @param {string} rawJson
   * @returns {Character}
   */
  static from_raw(rawJson) {
    let payload;
    try {
      payload = JSON.parse(rawJson);
    } catch (exc) {
      throw new InvalidCharacterCodeError(
        `raw payload is not valid JSON: ${exc.message ?? exc}`,
      );
    }
    return new Character({ raw: payload });
  }

  /**
   * Append a raw skill object to the character. Checked shallowly: the entry
   * must be an object, so the character can never export a code that its own
   * loader rejects. The contents are left exactly as given.
   * @param {object} skill
   */
  create_raw_skill(skill) {
    if (!isPlainObject(skill)) {
      throw new InvalidCharacterCodeError(
        `skill is ${describeType(skill)}, expected an object`,
      );
    }
    this.raw.push(skill);
  }

  /** Export the character as a raw JSON string. */
  export_raw() {
    return JSON.stringify(this.raw);
  }

  /** Export the character as a JJS-compatible character code. */
  export_character_code() {
    return codec.compress(this.export_raw());
  }

  /** Alias for {@link Character#export_character_code}. */
  to_code() {
    return this.export_character_code();
  }

  // ---------------------------------------------------------------- //
  // introspection
  // ---------------------------------------------------------------- //

  get length() {
    return this.raw.length;
  }

  [Symbol.iterator]() {
    return this.raw[Symbol.iterator]();
  }

  /** A list of `{ kind, name }` for every entry, in order. */
  get skills() {
    return this.raw
      .filter(isPlainObject)
      .map((skill) => ({ kind: skill.K_NAME, name: skill.NAME }));
  }

  _used_keys() {
    const used = new Set();
    for (const skill of this.raw) {
      if (
        isPlainObject(skill) &&
        skill.K_NAME === "SKILL" &&
        Number.isInteger(skill.KEY)
      ) {
        used.add(skill.KEY);
      }
    }
    return used;
  }

  _next_key() {
    const used = this._used_keys();
    let key = 1;
    while (used.has(key)) key += 1;
    return key;
  }
}

class CreateHelper {
  /** @param {Character} character */
  constructor(character) {
    this.character = character;
  }

  _build_data(line, properties = null, conditions = null, branches = null) {
    const data = {
      Line: line.map(stripNodeDefaults),
      Prop: stripPropertyDefaults(properties ?? {}),
      Req: (conditions ?? []).map(stripConditionDefaults),
    };

    const cleanBranches = {};
    for (const [name, branch] of Object.entries(branches ?? {})) {
      cleanBranches[name] = {
        Line: (branch.nodes ?? []).map(stripNodeDefaults),
        Req: (branch.conditions ?? []).map(stripConditionDefaults),
      };
    }
    if (Object.keys(cleanBranches).length > 0) data.Branch = cleanBranches;

    return JSON.stringify(data);
  }

  /**
   * Create a skill for the character.
   *
   * The node list may be passed positionally (an array) or as `options.line`,
   * so both of these work:
   *
   *     character.create.skill("Punch", [nodes.HITBOX()])
   *     character.create.skill("Punch", { line: [nodes.HITBOX()], cooldown: 5 })
   *
   * @param {string} name
   * @param {object[]|object} [lineOrOptions]
   * @param {object} [maybeOptions]
   */
  skill(name, lineOrOptions = [], maybeOptions = {}) {
    const lineIsArray = Array.isArray(lineOrOptions);
    const line = lineIsArray ? lineOrOptions : lineOrOptions?.line ?? [];
    const options = lineIsArray ? maybeOptions ?? {} : lineOrOptions ?? {};

    const {
      kind = "SKILL",
      cooldown = 0,
      key = null,
      add = false,
      duration = null,
      delay = null,
      properties = null,
      conditions = null,
      branches = null,
      tooltip = null,
      color = null,
      extra = null,
    } = options;

    if (!SKILL_KINDS.includes(kind)) {
      throw new RangeError(`unknown skill kind: ${kind}`);
    }

    const data = {
      NAME: name,
      DATA: this._build_data(line, properties, conditions, branches),
      K_NAME: kind,
    };

    if (kind === "SKILL") {
      if (cooldown !== null) data.COOLDOWN = cooldown;
      data.KEY = key !== null ? key : this.character._next_key();
      if (add) data.ADD = add;
    } else if (kind === "SPECIAL" || kind === "CHASE") {
      if (cooldown !== null) data.COOLDOWN = cooldown;
    } else if (kind === "AWAKENING") {
      if (duration !== null) data.DURATION = duration;
      if (delay !== null) data.DELAY = delay;
      if (color !== null) data.COLOR = color;
    }

    if (tooltip !== null) data["TOOL TIP"] = tooltip;
    if (extra) Object.assign(data, extra);

    this.character.create_raw_skill(data);
  }
}
