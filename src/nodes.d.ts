import type {
  AttackTypeName,
  BodyPartName,
  EasingDirectionName,
  EasingStyleName,
  EffectName,
  SkillName,
  SpecialName,
  StateName,
} from "./types.js";

/** A node object. Keys are the names the game uses. */
export interface Node {
  K_NAME: string;
  [key: string]: unknown;
}

/** A vector, as an array/iterable of numbers or an `"x, y, z"` string. */
export type Vec3 = Iterable<number> | string;

/** A number, or the literal string `"inf"` where the game accepts it. */
export type Time = number | "inf";

/**
 * Format a vector as the game's `"x, y, z"` string. Strings pass through
 * verbatim (a copy-pasted `"[x, y, z]"` is tolerated).
 */
export declare function _vec3(value: Vec3): string;

/** Wait a duration of time before continuing. */
export declare function WAIT(options?: { TIME?: number }): Node;

/** Run a base moveset skill. */
export declare function SKILL(options?: {
  move?: SkillName;
  speed?: number;
  cancel_last?: boolean;
  enable_variants?: boolean;
  hold_for?: number;
  start?: number;
}): Node;

/** Run a base moveset special skill. */
export declare function SPECIAL(options?: {
  spec?: SpecialName;
  speed?: number;
  cancel_last?: boolean;
  enable_variants?: boolean;
}): Node;

/** Play an animation. */
export declare function ANIMATION(options?: {
  animation?: readonly number[] | null;
  start?: number;
  end?: number;
  looped?: boolean;
  speed?: number;
  fade_in?: number;
  fade_out?: number;
  last_hit?: number;
}): Node;

/** Play a sound effect. */
export declare function SOUND(options?: {
  id?: number;
  speed?: number;
  volume?: number;
  start?: number;
  end?: number;
  fade_in?: number;
  fade_out?: number;
  cancel?: boolean;
  global_?: boolean;
  projectile_tag?: string;
}): Node;

/** Apply a force to a character. */
export declare function VELOCITY(options?: {
  force?: Vec3 | null;
  time?: Time;
  fade?: boolean;
  track?: boolean;
  last_hit?: number;
  ragdoll?: number;
  true_ragdoll?: boolean;
  relative_from_branch?: boolean;
}): Node;

/** Emit a signal to Connect Blocks. */
export declare function CONNECT(options?: {
  signal?: string;
  time?: Time;
  range?: number | "inf";
}): Node;

/** Create a hitbox. */
export declare function HITBOX(options?: {
  position?: Vec3 | null;
  rotation?: Vec3 | null;
  size?: Vec3 | null;
  stun?: number;
  stun_anim?: boolean;
  ignore_wakeup?: boolean;
  damage?: number;
  debree?: number;
  attack_type?: AttackTypeName;
  blockable?: boolean;
  blockable_360?: boolean;
  cancel_enemy?: boolean;
  clear_knockback?: boolean;
  can_kill?: boolean;
  hit_ragdoll?: boolean;
  hit_user?: boolean;
  single_target?: boolean;
  branch?: string;
  branch_target?: string;
  branch_finisher?: string;
  projectile_tag?: string;
  link_user?: boolean | number;
  preview?: readonly number[] | null;
}): Node;

/** Proceed to a branch on hit. */
export declare function BRANCH(options?: {
  branch?: string;
  random?: string;
  last_hit?: number;
}): Node;

/** Play a visual effect. */
export declare function VISUAL(options?: {
  effect?: EffectName;
  amount?: number;
  texture?: number;
  color?: string;
  alt_color?: string;
  opacity?: number;
  alt_opacity?: number;
  position?: Vec3 | null;
  alt_position?: Vec3 | null;
  rotation?: Vec3 | null;
  alt_rotation?: Vec3 | null;
  size?: number;
  alt_size?: number;
  time?: Time;
  last_hit?: number;
  limb?: BodyPartName;
  visual_tag?: string;
  projectile_tag?: string;
  run_on_server?: boolean;
  cancel_on_interrupt?: boolean;
  relative_from_branch?: boolean;
  can_collide?: boolean;
  easing_style?: EasingStyleName;
  easing_direction?: EasingDirectionName;
}): Node;

/** Grab a target's limb. */
export declare function GRAB(options?: {
  limb?: BodyPartName;
  target_limb?: BodyPartName;
  position?: Vec3 | null;
  rotation?: Vec3 | null;
  time?: Time;
  last_hit?: number;
}): Node;

/** Create a projectile. */
export declare function PROJECTILE(options?: {
  projectile_tag?: string;
  position?: Vec3 | null;
  rotation?: Vec3 | null;
  size?: Vec3 | null;
  speed?: number;
  time?: Time;
  stun?: number;
  stun_anim?: boolean;
  ignore_wakeup?: boolean;
  damage?: number;
  debree?: number;
  attack_type?: AttackTypeName;
  blockable?: boolean;
  blockable_360?: boolean;
  cancel_enemy?: boolean;
  clear_knockback?: boolean;
  can_kill?: boolean;
  hit_ragdoll?: boolean;
  hit_user?: boolean;
  single_target?: boolean;
  aim_last_hit?: number;
  continue_?: boolean;
  branch?: string;
  branch_target?: string;
  branch_collided?: string;
  filter_interval?: number;
  reflect_count?: number;
  cache?: boolean;
}): Node;

/** Start a counter. */
export declare function COUNTER(options?: {
  attack_type?: readonly AttackTypeName[] | null;
  time?: Time;
  stun?: number;
  cancel_enemy?: boolean;
  branch?: string;
  branch_target?: string;
  remove_on_hit?: boolean;
  reflect?: boolean;
  continue_?: boolean;
}): Node;

/** Create a tag. */
export declare function TAG(options?: {
  tag?: string;
  value?: string;
  time?: Time;
  check?: boolean;
  add_remove?: boolean;
  set_value?: boolean;
  branch?: string;
  last_hit?: number;
}): Node;

/** Check or set a character state. */
export declare function STATE(options?: {
  state?: StateName;
  value?: number;
  time?: Time;
  cancel_on_end?: boolean;
  disable_burst?: boolean;
  last_hit?: number;
  check?: boolean;
  branch?: string;
  state_tag?: string;
}): Node;

/** Teleport to an offset. */
export declare function TELEPORT(options?: {
  position?: Vec3 | null;
  rotation?: Vec3 | null;
  last_hit?: number;
  projectile_tag?: string;
  relative_from_branch?: boolean;
  ignore_walls?: boolean;
}): Node;

/** Add to your awakening bar. */
export declare function ADD_AWAKENING(options?: { amount?: number }): Node;

/** Add to your health bar. */
export declare function ADD_HEALTH(options?: {
  amount?: number;
  can_kill?: boolean;
}): Node;

/** Add to your evasion bar. */
export declare function ADD_EVASION(options?: { amount?: number }): Node;

/** Cancel the skill. */
export declare function HIT_CANCEL(options?: {
  time?: Time;
  flip?: boolean;
  endlag?: number;
  branch?: string;
}): Node;

/** Set the cooldown of a skill. */
export declare function SET_COOLDOWN(options?: {
  key?: number;
  cooldown?: number;
}): Node;

/** Loop the current skill. */
export declare function LOOP(options?: {
  loop_back?: number;
  loop_amount?: number;
  hold?: boolean;
}): Node;

export interface ParticleOptions {
  part_size?: Vec3 | null;
  texture?: number | null;
  emit_count?: number | null;
  rate?: number | null;
  duration?: number | null;
  color?: string | null;
  size?: Vec3 | null;
  brightness?: number | null;
  transparency?: Vec3 | null;
  squash?: Vec3 | null;
  lifetime?: Vec3 | null;
  speed?: Vec3 | null;
  rotation?: Vec3 | null;
  rot_speed?: Vec3 | null;
  acceleration?: Vec3 | null;
  drag?: number | null;
  light_emission?: number | null;
  light_influence?: number | null;
  z_offset?: number | null;
  spread_angle?: Vec3 | null;
  position?: Vec3 | null;
  lock_to_part?: boolean | null;
  limb?: BodyPartName | null;
  orientation_type?:
    | "FacingCamera"
    | "FacingCameraWorldUp"
    | "VelocityParallel"
    | "VelocityPerpendicular"
    | null;
  emission_direction?: string | null;
  flipbook_size?: Vec3 | null;
  flipbook_mode?: "Loop" | "OneShot" | "PingPong" | "Random" | null;
  flipbook_framerate?: Vec3 | null;
  shape?: "Box" | "Cylinder" | "Disc" | "Sphere" | null;
  shape_inout?: string | null;
  shape_partial?: number | null;
  run_on_server?: boolean | null;
  client_sided?: boolean | null;
  cancel_tag?: string | null;
  cancel?: boolean | null;
  cancel_on_interrupt?: boolean | null;
  projectile_tag?: string | null;
  last_hit?: number | null;
  /** Any setting not modelled above, passed through verbatim. */
  [key: string]: unknown;
}

/** Emit particles. Values left as `null` are omitted rather than guessed. */
export declare function PARTICLE(options?: ParticleOptions): Node;

export interface LookOptions {
  time?: number | null;
  smoothness?: number;
  horizontal_only?: boolean | null;
  last_hit?: number;
  relative_from_branch?: boolean | null;
  projectile_tag?: string | null;
  camera_direction?: boolean | null;
  grounded?: boolean | null;
}

/** Point the camera in a direction. */
export declare function LOOK(options?: LookOptions): Node;

export interface SetMeleeOptions {
  combo?: number | null;
  offset?: number | null;
  last_hit?: number;
}

/** Force the user's melee count to a specific M1 for a while. */
export declare function SETMELEE(options?: SetMeleeOptions): Node;

/** Build any node verbatim by its `K_NAME`. */
export declare function raw(k_name: string, fields?: Record<string, unknown>): Node;
