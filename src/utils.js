/**
 * Small helpers: branches and skill properties.
 */

/**
 * Define a branch.
 *
 * @param {object[]} nodes The nodes in the branch.
 * @param {object[]} [conditions] The conditions for the branch.
 * @returns {{nodes: object[], conditions: object[]}}
 */
export function Branch(nodes, conditions = null) {
  return { nodes, conditions: conditions ?? [] };
}

/**
 * Define the properties of a skill.
 *
 * @param {object} [options]
 * @returns {Record<string, number|boolean|string>}
 */
export function Properties({
  damage_multiplier = 1,
  knockback_multiplier = 1,
  invincible = false,
  replace_skill_if_occupied = false,
  prevent_override = false,
  hide_in_awakening = false,
  keep_when_moveset_switches = false,
  hide_in_base = false,
  use_when_obtained = false,
  use_on_death = false,
  no_stun = false,
  no_cancel = false,
  variant_tag = "-",
} = {}) {
  return {
    DMG: damage_multiplier,
    KNOCK: knockback_multiplier,
    INV: invincible,
    REP: replace_skill_if_occupied,
    REP2: prevent_override,
    AWK: hide_in_awakening,
    KEEP: keep_when_moveset_switches,
    AWK2: hide_in_base,
    USE: use_when_obtained,
    USEONDEATH: use_on_death,
    NOSTUN: no_stun,
    NOCANCEL: no_cancel,
    VAR: variant_tag,
  };
}
