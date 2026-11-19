import type { Node } from "./nodes.js";
import type { BranchDefinition } from "./utils.js";

export type SkillKind = "SKILL" | "SPECIAL" | "MELEE" | "CHASE" | "AWAKENING";

export interface Skill {
  NAME?: string;
  K_NAME?: string;
  KEY?: number;
  DATA?: string;
  [key: string]: unknown;
}

export interface SkillOptions {
  /** The skill's node list (also accepted as the second positional argument). */
  line?: Node[];
  kind?: SkillKind;
  cooldown?: number | null;
  key?: number | null;
  add?: boolean;
  duration?: number | null;
  delay?: number | null;
  properties?: Record<string, number | boolean | string> | null;
  conditions?: Array<Record<string, unknown>> | null;
  branches?: Record<string, BranchDefinition> | null;
  tooltip?: string | null;
  color?: string | null;
  extra?: Record<string, unknown> | null;
}

export interface SkillSummary {
  kind: string | undefined;
  name: string | undefined;
}

export interface CharacterOptions {
  hide_character_extras?: boolean;
  raw?: unknown[] | null;
}

export declare class CreateHelper {
  character: Character;
  /** Create a skill, with the node list as the second argument. */
  skill(name: string, line?: Node[], options?: SkillOptions): void;
  /** Create a skill, with the node list inside `options.line`. */
  skill(name: string, options?: SkillOptions): void;
}

export declare class Character {
  raw: Skill[];
  create: CreateHelper;

  constructor(options?: CharacterOptions);

  /** Load a character from a JJS character code. Fields are kept verbatim. */
  static from_code(code: string): Character;

  /** Load a character from a raw JSON string (the inner a code holds). */
  static from_raw(rawJson: string): Character;

  /** Append a raw skill object, checked shallowly. */
  create_raw_skill(skill: Skill): void;

  /** Export the character as a raw JSON string. */
  export_raw(): string;

  /** Export the character as a JJS-compatible character code. */
  export_character_code(): string;

  /** Alias for `export_character_code`. */
  to_code(): string;

  get length(): number;

  [Symbol.iterator](): IterableIterator<Skill>;

  /** A list of `{ kind, name }` for every entry, in order. */
  get skills(): SkillSummary[];

  _used_keys(): Set<number>;
  _next_key(): number;
}
