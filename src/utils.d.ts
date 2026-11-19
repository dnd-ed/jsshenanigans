import type { Node } from "./nodes.js";

export interface BranchDefinition {
  nodes: Node[];
  conditions: Array<Record<string, unknown>>;
}

/** Define a branch. */
export declare function Branch(
  nodes: Node[],
  conditions?: Array<Record<string, unknown>> | null,
): BranchDefinition;

export interface PropertiesOptions {
  damage_multiplier?: number;
  knockback_multiplier?: number;
  invincible?: boolean;
  replace_skill_if_occupied?: boolean;
  prevent_override?: boolean;
  hide_in_awakening?: boolean;
  keep_when_moveset_switches?: boolean;
  hide_in_base?: boolean;
  use_when_obtained?: boolean;
  use_on_death?: boolean;
  no_stun?: boolean;
  no_cancel?: boolean;
  variant_tag?: string;
}

/** Define the properties of a skill. */
export declare function Properties(
  options?: PropertiesOptions,
): Record<string, number | boolean | string>;
