/**
 * JSShenanigans --- build, load and modify Jujutsu Shenanigans movesets.
 *
 * A JavaScript port of pythonshenanigans. On top of everything libjjs could do
 * it can also:
 *
 * - **load** an existing character code and edit it (everything is preserved);
 * - model the `PARTICLE`, `LOOK` and `SETMELEE` nodes;
 * - set the `TOOL TIP` (skills) and `COLOR` (awakenings) fields;
 * - round-trip codes without dropping fields it does not understand.
 *
 * Quick start:
 *
 *     import * as pts from "jsshenanigans";
 *     import * as nodes from "jsshenanigans/nodes";
 *
 *     const character = new pts.Character();
 *     character.create.skill("Punch", [nodes.HITBOX({ damage: 5 })]);
 *     const code = character.export_character_code();
 *
 *     const loaded = pts.Character.from_code(code);
 *     console.log(pts.describe(code));
 */

export * from "./errors.js";
export {
  ENV_BACKEND,
  ZSTD_MAGIC,
  backend_name,
  compress,
  decode,
  decompress,
  encode,
} from "./codec.js";
export { Character } from "./character.js";
export { dumps, describe } from "./tools.js";
export { Animations } from "./types.js";
export { Branch, Properties } from "./utils.js";

import * as codec from "./codec.js";
import * as conditions from "./conditions.js";
import * as nodes from "./nodes.js";
import * as tools from "./tools.js";
import * as types from "./types.js";

export { codec, conditions, nodes, tools, types };

/** The library version. */
export const VERSION = "1.1.0";
