/**
 * Node builders.
 *
 * Every builder takes a single options object and returns a plain node object
 * whose keys are the names the game uses (usually UPPER CASE with spaces).
 * Option names mirror the Python reference library's keyword arguments.
 */

/**
 * Format a vector as the game's `"x, y, z"` string.
 *
 * Accepts an array or any iterable, *or* an already-formatted string. Strings
 * pass through verbatim: the game, `dumps()` and `describe()` all express
 * vectors this way, so a vector copied out of a decoded code has to survive
 * being handed straight back to a builder.
 *
 * @param {Iterable<number> | string} value
 * @returns {string}
 */
export function _vec3(value) {
  if (typeof value === "string") {
    return value
      .trim()
      .replace(/^[[\]]+/, "")
      .replace(/[[\]]+$/, "")
      .trim();
  }
  return Array.from(value, (component) => String(component)).join(", ");
}

/**
 * Wait a duration of time before continuing.
 * @param {object} [options]
 * @param {number} [options.TIME] Seconds to delay the next node by.
 */
export function WAIT({ TIME = 1 } = {}) {
  return { K_NAME: "WAIT", TIME };
}

/**
 * Run a base moveset skill.
 * @param {object} [options]
 */
export function SKILL({
  move = "Divergent Fist",
  speed = 1,
  cancel_last = false,
  enable_variants = true,
  hold_for = 0,
  start = 0,
} = {}) {
  return {
    K_NAME: "SKILL",
    MOVE: move,
    SPEED: speed,
    START: start,
    "HOLD FOR": hold_for,
    "ENABLE VARIANTS": enable_variants,
    "CANCEL LAST": cancel_last,
  };
}

/**
 * Run a base moveset special skill.
 * @param {object} [options]
 */
export function SPECIAL({
  spec = "Limitless",
  speed = 1,
  cancel_last = false,
  enable_variants = true,
} = {}) {
  return {
    K_NAME: "SPECIAL",
    SPEC: spec,
    SPEED: speed,
    "ENABLE VARIANTS": enable_variants,
    "CANCEL LAST": cancel_last,
  };
}

/**
 * Play an animation. `animation` uses the `[character, animation]` pairs from
 * `types.Animations`.
 * @param {object} [options]
 */
export function ANIMATION({
  animation = null,
  start = 0,
  end = 10,
  looped = false,
  speed = 1,
  fade_in = 0.1,
  fade_out = 0,
  last_hit = -1,
} = {}) {
  if (animation === null) animation = [1, 1];
  return {
    K_NAME: "ANIM",
    ANIM_USE: animation,
    PREVIEW: [start, end],
    SPEED: speed,
    "FADE IN": fade_in,
    "FADE OUT": fade_out,
    "LAST HIT": last_hit,
    LOOPED: looped,
  };
}

/**
 * Play a sound effect.
 * @param {object} [options]
 */
export function SOUND({
  id = 12222253,
  speed = 1,
  volume = 0.5,
  start = 0,
  end = 500,
  fade_in = 0,
  fade_out = 0,
  cancel = false,
  global_ = false,
  projectile_tag = "nil",
} = {}) {
  return {
    K_NAME: "SFX",
    ID: id,
    START: start,
    END: end,
    SPEED: speed,
    VOLUME: volume,
    "FADE IN": fade_in,
    "FADE OUT": fade_out,
    GLOBAL: global_,
    "PROJECTILE TAG": projectile_tag,
    CANCEL: cancel,
  };
}

/**
 * Apply a force to a character.
 * @param {object} [options]
 */
export function VELOCITY({
  force = null,
  time = 0,
  fade = false,
  track = false,
  last_hit = -1,
  ragdoll = 0,
  true_ragdoll = false,
  relative_from_branch = false,
} = {}) {
  if (force === null) force = [0, 0, 0];
  return {
    K_NAME: "VELO",
    FORCE: _vec3(force),
    TIME: time,
    FADE: fade,
    TRACK: track,
    "LAST HIT": last_hit,
    RAGDOLL: ragdoll,
    "TRUE RAGDOLL": true_ragdoll,
    "RELATIVE FROM BRANCH": relative_from_branch,
  };
}

/**
 * Emit a signal to Connect Blocks.
 * @param {object} [options]
 */
export function CONNECT({ signal = "Nothing", time = 0.1, range = "inf" } = {}) {
  return { K_NAME: "CONNECT", SIGNAL: signal, TIME: time, RANGE: range };
}

/**
 * Create a hitbox.
 * @param {object} [options]
 */
export function HITBOX({
  position = null,
  rotation = null,
  size = null,
  stun = 1,
  stun_anim = false,
  ignore_wakeup = false,
  damage = 1,
  debree = 0,
  attack_type = "Melee",
  blockable = true,
  blockable_360 = false,
  cancel_enemy = true,
  clear_knockback = false,
  can_kill = true,
  hit_ragdoll = false,
  hit_user = false,
  single_target = true,
  branch = "nil",
  branch_target = "nil",
  branch_finisher = "nil",
  projectile_tag = "nil",
  link_user = false,
  preview = null,
} = {}) {
  if (position === null) position = [0, 0, 4];
  if (rotation === null) rotation = [0, 0, 0];
  if (size === null) size = [6, 6, 6];
  const node = {
    K_NAME: "HITBOX",
    POSITION: _vec3(position),
    ROTATION: _vec3(rotation),
    SIZE: _vec3(size),
    STUN: stun,
    "STUN ANIM": stun_anim,
    DAMAGE: damage,
    DEBREE: debree,
    "ATTACK TYPE": attack_type,
    BLOCKABLE: blockable,
    "360 BLOCK": blockable_360,
    "CANCEL ENEMY": cancel_enemy,
    "CLEAR KNOCKBACK": clear_knockback,
    "CAN KILL": can_kill,
    "HIT RAGDOLL": hit_ragdoll,
    "HIT USER": hit_user,
    "SINGLE TARGET": single_target,
    BRANCH: branch,
    "BRANCH TARGET": branch_target,
    "BRANCH FINISHER": branch_finisher,
    "PROJECTILE TAG": projectile_tag,
    "IGNORE WAKEUP": ignore_wakeup,
    "LINK USER": link_user,
  };
  if (preview !== null) node.PREVIEW = preview;
  return node;
}

/**
 * Proceed to a branch on hit.
 * @param {object} [options]
 */
export function BRANCH({ branch = "nil", random = "", last_hit = -1 } = {}) {
  return {
    K_NAME: "BRANCH",
    BRANCH: branch,
    RANDOM: random,
    "LAST HIT": last_hit,
  };
}

/**
 * Play a visual effect.
 * @param {object} [options]
 */
export function VISUAL({
  effect = "Slash",
  amount = 1,
  texture = 0,
  color = "255, 255, 255",
  alt_color = "255, 255, 255",
  opacity = 0,
  alt_opacity = 0,
  position = null,
  alt_position = null,
  rotation = null,
  alt_rotation = null,
  size = 1,
  alt_size = 1,
  time = 1,
  last_hit = -1,
  limb = "HumanoidRootPart",
  visual_tag = "nil",
  projectile_tag = "nil",
  run_on_server = false,
  cancel_on_interrupt = false,
  relative_from_branch = false,
  can_collide = false,
  easing_style = "Linear",
  easing_direction = "In",
} = {}) {
  if (position === null) position = [0, 0, 0];
  if (alt_position === null) alt_position = [0, 0, 0];
  if (rotation === null) rotation = [0, 0, 0];
  if (alt_rotation === null) alt_rotation = [0, 0, 0];
  return {
    K_NAME: "VISUAL",
    EFFECT: effect,
    TIME: time,
    POSITION: _vec3(position),
    ROTATION: _vec3(rotation),
    SIZE: size,
    COLOR: color,
    OPACITY: opacity,
    "ALT POSITION": _vec3(alt_position),
    "ALT ROTATION": _vec3(alt_rotation),
    "ALT SIZE": alt_size,
    "ALT COLOR": alt_color,
    "ALT OPACITY": alt_opacity,
    TEXTURE: texture,
    "BODY PART": limb,
    "EASING STYLE": easing_style,
    "EASING DIRECTION": easing_direction,
    "PROJECTILE TAG": projectile_tag,
    "VISUAL TAG": visual_tag,
    AMOUNT: amount,
    "RUN ON SERVER": run_on_server,
    "RELATIVE FROM BRANCH": relative_from_branch,
    "CANCEL ON INTERRUPT": cancel_on_interrupt,
    "CAN COLLIDE": can_collide,
    "LAST HIT": last_hit,
  };
}

/**
 * Grab a target's limb.
 * @param {object} [options]
 */
export function GRAB({
  limb = "HumanoidRootPart",
  target_limb = "HumanoidRootPart",
  position = null,
  rotation = null,
  time = 1,
  last_hit = 1,
} = {}) {
  if (position === null) position = [0, 0, 0];
  if (rotation === null) rotation = [0, 0, 0];
  return {
    K_NAME: "GRAB",
    "BODY PART": limb,
    "BODY PART2": target_limb,
    TIME: time,
    POSITION: _vec3(position),
    ROTATION: _vec3(rotation),
    "LAST HIT": last_hit,
  };
}

/**
 * Create a projectile.
 * @param {object} [options]
 */
export function PROJECTILE({
  projectile_tag = "nil",
  position = null,
  rotation = null,
  size = null,
  speed = 1,
  time = 1,
  stun = 1,
  stun_anim = false,
  ignore_wakeup = true,
  damage = 1,
  debree = 0,
  attack_type = "Melee",
  blockable = true,
  blockable_360 = false,
  cancel_enemy = true,
  clear_knockback = false,
  can_kill = true,
  hit_ragdoll = false,
  hit_user = false,
  single_target = true,
  aim_last_hit = -1,
  continue_ = false,
  branch = "nil",
  branch_target = "nil",
  branch_collided = "nil",
  filter_interval = 1,
  reflect_count = 0,
  cache = true,
} = {}) {
  if (position === null) position = [0, 0, 4];
  if (rotation === null) rotation = [0, 0, 0];
  if (size === null) size = [6, 6, 6];
  return {
    K_NAME: "PROJECTILE",
    DAMAGE: damage,
    STUN: stun,
    SPEED: speed,
    SIZE: _vec3(size),
    POSITION: _vec3(position),
    ROTATION: _vec3(rotation),
    "ATTACK TYPE": attack_type,
    "PROJECTILE TAG": projectile_tag,
    "REFLECT COUNT": reflect_count,
    "FILTER INTERVAL": filter_interval,
    BRANCH: branch,
    "BRANCH TARGET": branch_target,
    "BRANCH COLLIDED": branch_collided,
    CONTINUE: continue_,
    "HIT RAGDOLL": hit_ragdoll,
    "STUN ANIM": stun_anim,
    "HIT USER": hit_user,
    "SINGLE TARGET": single_target,
    BLOCKABLE: blockable,
    "360 BLOCK": blockable_360,
    "CAN KILL": can_kill,
    "AIM LAST HIT": aim_last_hit,
    TIME: time,
    "IGNORE WAKEUP": ignore_wakeup,
    DEBREE: debree,
    "CANCEL ENEMY": cancel_enemy,
    CACHE: cache,
    "CLEAR KNOCKBACK": clear_knockback,
  };
}

/**
 * Start a counter.
 * @param {object} [options]
 */
export function COUNTER({
  attack_type = null,
  time = 1,
  stun = 1,
  cancel_enemy = true,
  branch = "nil",
  branch_target = "nil",
  remove_on_hit = true,
  reflect = false,
  continue_ = false,
} = {}) {
  if (attack_type === null) attack_type = ["Melee"];
  return {
    K_NAME: "COUNTER",
    TIME: time,
    STUN: stun,
    "ATTACK TYPE2": attack_type.join(","),
    BRANCH: branch,
    "BRANCH TARGET": branch_target,
    "CANCEL ENEMY": cancel_enemy,
    "REMOVE ON HIT": remove_on_hit,
    REFLECT: reflect,
    CONTINUE: continue_,
  };
}

/**
 * Create a tag.
 * @param {object} [options]
 */
export function TAG({
  tag = "nil",
  value = "nil",
  time = 1,
  check = false,
  add_remove = true,
  set_value = true,
  branch = "nil",
  last_hit = -1,
} = {}) {
  return {
    K_NAME: "TAG",
    TAG: tag,
    VALUE: value,
    TIME: time,
    "ADD/REMOVE": add_remove,
    CHECK: check,
    SET: set_value,
    BRANCH: branch,
    "LAST HIT": last_hit,
  };
}

/**
 * Check or set a character state.
 * @param {object} [options]
 */
export function STATE({
  state = "Stun",
  value = 1,
  time = 1,
  cancel_on_end = false,
  disable_burst = false,
  last_hit = -1,
  check = false,
  branch = "nil",
  state_tag = "nil",
} = {}) {
  return {
    K_NAME: "STATE",
    STATE: state,
    VALUE: value,
    TIME: time,
    "DISABLE BURST": disable_burst,
    "CANCEL ON END": cancel_on_end,
    "LAST HIT": last_hit,
    BRANCH: branch,
    CHECK: check,
    "STATE TAG": state_tag,
  };
}

/**
 * Teleport to an offset.
 * @param {object} [options]
 */
export function TELEPORT({
  position = null,
  rotation = null,
  last_hit = -1,
  projectile_tag = "nil",
  relative_from_branch = false,
  ignore_walls = false,
} = {}) {
  if (position === null) position = [0, 0, 0];
  if (rotation === null) rotation = [0, 0, 0];
  return {
    K_NAME: "TELEPORT",
    POSITION: _vec3(position),
    ROTATION: _vec3(rotation),
    "PROJECTILE TAG": projectile_tag,
    "LAST HIT": last_hit,
    "RELATIVE FROM BRANCH": relative_from_branch,
    "IGNORE WALLS": ignore_walls,
  };
}

/**
 * Add to your awakening bar.
 * @param {object} [options]
 */
export function ADD_AWAKENING({ amount = 5 } = {}) {
  return { K_NAME: "ULTGIB", AMOUNT: amount };
}

/**
 * Add to your health bar.
 * @param {object} [options]
 */
export function ADD_HEALTH({ amount = 5, can_kill = false } = {}) {
  return { K_NAME: "HPGIB", AMOUNT: amount, "CAN KILL": can_kill };
}

/**
 * Add to your evasion bar.
 * @param {object} [options]
 */
export function ADD_EVASION({ amount = 5 } = {}) {
  return { K_NAME: "EVGIB", AMOUNT: amount };
}

/**
 * Cancel the skill.
 * @param {object} [options]
 */
export function HIT_CANCEL({ time = 1, flip = false, endlag = 1, branch = "nil" } = {}) {
  return {
    K_NAME: "HITCNCL",
    TIME: time,
    ENDLAG: endlag,
    BRANCH: branch,
    FLIP: flip,
  };
}

/**
 * Set the cooldown of a skill.
 * @param {object} [options]
 */
export function SET_COOLDOWN({ key = -1, cooldown = -1 } = {}) {
  return { KEY: key, K_NAME: "SETCD", COOLDOWN: cooldown };
}

/**
 * Loop the current skill.
 * @param {object} [options]
 */
export function LOOP({ loop_back = 1, loop_amount = 3, hold = false } = {}) {
  return {
    "LOOP BACK": loop_back,
    HOLD: hold,
    "LOOP AMOUNT": loop_amount,
    K_NAME: "LOOP",
  };
}

/**
 * Emit particles.
 *
 * Every setting is a typed argument, confirmed against a game-produced code.
 * Values left as `null` are omitted rather than guessed. Anything not modelled
 * can still be passed verbatim as an extra key.
 *
 * `orientation_type` is one of `FacingCamera`, `FacingCameraWorldUp`,
 * `VelocityParallel`, `VelocityPerpendicular`; `flipbook_mode` is one of
 * `Loop`, `OneShot`, `PingPong`, `Random`; `shape` is one of `Box`,
 * `Cylinder`, `Disc`, `Sphere`. The sequence fields take either a
 * comma-separated string or an array.
 *
 * @param {object} [options]
 */
export function PARTICLE({
  part_size = null,
  texture = null,
  emit_count = null,
  rate = null,
  duration = null,
  color = null,
  size = null,
  brightness = null,
  transparency = null,
  squash = null,
  lifetime = null,
  speed = null,
  rotation = null,
  rot_speed = null,
  acceleration = null,
  drag = null,
  light_emission = null,
  light_influence = null,
  z_offset = null,
  spread_angle = null,
  position = null,
  lock_to_part = null,
  limb = null,
  orientation_type = null,
  emission_direction = null,
  flipbook_size = null,
  flipbook_mode = null,
  flipbook_framerate = null,
  shape = null,
  shape_inout = null,
  shape_partial = null,
  run_on_server = null,
  client_sided = null,
  cancel_tag = null,
  cancel = null,
  cancel_on_interrupt = null,
  projectile_tag = null,
  last_hit = null,
  ...fields
} = {}) {
  const provided = {
    "PART SIZE": part_size === null ? null : _vec3(part_size),
    TEXTURE: texture,
    "EMIT COUNT": emit_count,
    RATE: rate,
    DURATION: duration,
    COLOR: color,
    SIZE: size === null ? null : _vec3(size),
    BRIGHTNESS: brightness,
    TRANSPARENCY: transparency === null ? null : _vec3(transparency),
    SQUASH: squash === null ? null : _vec3(squash),
    LIFETIME: lifetime === null ? null : _vec3(lifetime),
    SPEED: speed === null ? null : _vec3(speed),
    ROTATION: rotation === null ? null : _vec3(rotation),
    "ROT SPEED": rot_speed === null ? null : _vec3(rot_speed),
    ACCELERATION: acceleration === null ? null : _vec3(acceleration),
    DRAG: drag,
    "LIGHT EMISSION": light_emission,
    "LIGHT INFLUENCE": light_influence,
    ZOFFSET: z_offset,
    "SPREAD ANGLE": spread_angle === null ? null : _vec3(spread_angle),
    POSITION: position === null ? null : _vec3(position),
    "LOCK TO PART": lock_to_part,
    "BODY PART": limb,
    "ORIENTATION TYPE": orientation_type,
    "EMISSION DIRECTION": emission_direction,
    "FLIPBOOK SIZE": flipbook_size === null ? null : _vec3(flipbook_size),
    "FLIPBOOK MODE": flipbook_mode,
    "FLIPBOOK FRAMERATE":
      flipbook_framerate === null ? null : _vec3(flipbook_framerate),
    SHAPE: shape,
    "SHAPE INOUT": shape_inout,
    "SHAPE PARTIAL": shape_partial,
    "RUN ON SERVER": run_on_server,
    "CLIENT SIDED": client_sided,
    "CANCEL TAG": cancel_tag,
    CANCEL: cancel,
    "CANCEL ON INTERRUPT": cancel_on_interrupt,
    "PROJECTILE TAG": projectile_tag,
    "LAST HIT": last_hit,
  };
  const node = { K_NAME: "PARTICLE" };
  for (const [key, value] of Object.entries(provided)) {
    if (value !== null) node[key] = value;
  }
  Object.assign(node, fields);
  return node;
}

/**
 * Point the camera in a direction.
 * @param {object} [options]
 */
export function LOOK({
  time = null,
  smoothness = 40,
  horizontal_only = null,
  last_hit = -1,
  relative_from_branch = null,
  projectile_tag = null,
  camera_direction = null,
  grounded = null,
} = {}) {
  const provided = {
    TIME: time,
    "HORIZONTAL ONLY": horizontal_only,
    "RELATIVE FROM BRANCH": relative_from_branch,
    "PROJECTILE TAG": projectile_tag,
    "CAMERA DIRECTION": camera_direction,
    GROUNDED: grounded,
  };
  const node = { K_NAME: "LOOK", SMOOTHNESS: smoothness, "LAST HIT": last_hit };
  for (const [key, value] of Object.entries(provided)) {
    if (value !== null) node[key] = value;
  }
  return node;
}

/**
 * Force the user's melee count to a specific M1 for a while.
 * @param {object} [options]
 */
export function SETMELEE({ combo = null, offset = null, last_hit = -1 } = {}) {
  const provided = { COMBO: combo, OFFSET: offset };
  const node = { K_NAME: "SETMELEE", "LAST HIT": last_hit };
  for (const [key, value] of Object.entries(provided)) {
    if (value !== null) node[key] = value;
  }
  return node;
}

/**
 * Build any node verbatim by its `K_NAME`.
 *
 * An escape hatch for nodes with no dedicated builder:
 *
 *     raw("PARTICLE", { ID: 1, TIME: 2 })
 *     raw("LOOK", { TARGET: "Head" })
 *
 * @param {string} k_name
 * @param {object} [fields]
 */
export function raw(k_name, fields = {}) {
  return { K_NAME: k_name, ...fields };
}
