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
export type {
  CharacterOptions,
  CreateHelper,
  Skill,
  SkillKind,
  SkillOptions,
  SkillSummary,
} from "./character.js";
export { dumps, describe } from "./tools.js";
export type { DescribeResult, SkillInfo } from "./tools.js";
export { Animations } from "./types.js";
export type {
  AnimationRef,
  AttackTypeName,
  BodyPartName,
  EasingDirectionName,
  EasingStyleName,
  EffectName,
  SkillName,
  SpecialName,
  StateName,
} from "./types.js";
export { Branch, Properties } from "./utils.js";
export type { BranchDefinition, PropertiesOptions } from "./utils.js";

import * as codec from "./codec.js";
import * as conditions from "./conditions.js";
import * as nodes from "./nodes.js";
import * as tools from "./tools.js";
import * as types from "./types.js";

export { codec, conditions, nodes, tools, types };

/** The library version. */
export declare const VERSION: string;
