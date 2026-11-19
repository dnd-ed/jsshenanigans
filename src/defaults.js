/**
 * Default tables used to drop redundant fields when building a skill.
 *
 * `NODE_DEFAULTS` is derived from the builders themselves, so a builder and its
 * default can never drift apart.
 */

import * as nodes from "./nodes.js";

/** Node K_NAME -> builder name in `nodes`. */
export const _NODE_BUILDERS = {
  WAIT: "WAIT",
  SKILL: "SKILL",
  SPECIAL: "SPECIAL",
  // K_NAME is "ANIM"; the builder is nodes.ANIMATION. A wrong key here means
  // ANIM defaults are never stripped.
  ANIM: "ANIMATION",
  SFX: "SOUND",
  VELO: "VELOCITY",
  CONNECT: "CONNECT",
  HITBOX: "HITBOX",
  BRANCH: "BRANCH",
  VISUAL: "VISUAL",
  GRAB: "GRAB",
  PROJECTILE: "PROJECTILE",
  COUNTER: "COUNTER",
  TAG: "TAG",
  STATE: "STATE",
  TELEPORT: "TELEPORT",
  ULTGIB: "ADD_AWAKENING",
  HPGIB: "ADD_HEALTH",
  EVGIB: "ADD_EVASION",
  HITCNCL: "HIT_CANCEL",
  SETCD: "SET_COOLDOWN",
  LOOP: "LOOP",
  // nodes present in the live game but missing from libjjs
  PARTICLE: "PARTICLE",
  LOOK: "LOOK",
  SETMELEE: "SETMELEE",
};

export const NODE_DEFAULTS = Object.fromEntries(
  Object.entries(_NODE_BUILDERS).map(([kName, builder]) => [kName, nodes[builder]()]),
);

export const PROPERTIES_DEFAULTS = {
  DMG: 1,
  KNOCK: 1,
  INV: false,
  REP: false,
  REP2: false,
  AWK: false,
  KEEP: false,
  AWK2: false,
  USE: false,
  USEONDEATH: false,
  NOSTUN: false,
  NOCANCEL: false,
  VAR: "-",
};

export const CONDITIONS_DEFAULTS = {
  AIR: { FLIP: false },
  JUMP: { FLIP: false },
  AIM: { FLIP: false },
  ULT: { FLIP: false },
  BAR: { AMOUNT: 5, FLIP: false },
  DUR: { DURABILITY: 1 },
  HP: { AMOUNT: 1, FLIP: false },
  DOMAIN: { FLIP: false },
  HOLD: { FLIP: false },
};
