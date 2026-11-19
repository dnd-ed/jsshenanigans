/**
 * Condition builders.
 *
 * Every builder takes an options object and returns a plain condition object.
 */

/**
 * Check if the player is in the air.
 * @param {object} [options]
 * @param {boolean} [options.flip] If false the player must be in the air; if true they must not be.
 */
export function IN_AIR({ flip = false } = {}) {
  return { K_NAME: "AIR", FLIP: flip };
}

/**
 * Check if the player is jumping.
 * @param {object} [options]
 */
export function IS_JUMPING({ flip = false } = {}) {
  return { K_NAME: "JUMP", FLIP: flip };
}

/**
 * Check if the player is hovering their cursor over another player.
 * @param {object} [options]
 */
export function HAS_TARGET({ flip = false } = {}) {
  return { K_NAME: "AIM", FLIP: flip };
}

/**
 * Check if the player has their awakening.
 * @param {object} [options]
 */
export function IS_AWAKENED({ flip = false } = {}) {
  return { K_NAME: "ULT", FLIP: flip };
}

/**
 * Check how much of the awakening bar the player has.
 * @param {object} [options]
 * @param {number} [options.amount] Percentage to check. Defaults to 5.
 */
export function HAS_AWK_BAR({ amount = 5, flip = false } = {}) {
  return { K_NAME: "BAR", AMOUNT: amount, FLIP: flip };
}

/**
 * Check how much durability the current move has.
 * @param {object} [options]
 */
export function DURABILITY({ durability = 1 } = {}) {
  return { K_NAME: "DUR", DURABILITY: durability };
}

/**
 * Check how much health the player has.
 * @param {object} [options]
 */
export function HAS_HEALTH({ amount = 1, flip = false } = {}) {
  return { K_NAME: "HP", AMOUNT: amount, FLIP: flip };
}

/**
 * Check if the player is in a domain.
 * @param {object} [options]
 */
export function IS_IN_DOMAIN({ flip = false } = {}) {
  return { K_NAME: "DOMAIN", FLIP: flip };
}

/**
 * Check if the player is holding the skill key.
 * @param {object} [options]
 */
export function IS_HOLDING({ flip = false } = {}) {
  return { K_NAME: "HOLD", FLIP: flip };
}
