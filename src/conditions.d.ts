export interface Condition {
  K_NAME: string;
  [key: string]: unknown;
}

export interface FlipOptions {
  /** If false the check must pass; if true it must not. */
  flip?: boolean;
}

/** Check if the player is in the air. */
export declare function IN_AIR(options?: FlipOptions): Condition;

/** Check if the player is jumping. */
export declare function IS_JUMPING(options?: FlipOptions): Condition;

/** Check if the player is hovering their cursor over another player. */
export declare function HAS_TARGET(options?: FlipOptions): Condition;

/** Check if the player has their awakening. */
export declare function IS_AWAKENED(options?: FlipOptions): Condition;

/** Check how much of the awakening bar the player has. */
export declare function HAS_AWK_BAR(
  options?: FlipOptions & { amount?: number },
): Condition;

/** Check how much durability the current move has. */
export declare function DURABILITY(options?: { durability?: number }): Condition;

/** Check how much health the player has. */
export declare function HAS_HEALTH(
  options?: FlipOptions & { amount?: number },
): Condition;

/** Check if the player is in a domain. */
export declare function IS_IN_DOMAIN(options?: FlipOptions): Condition;

/** Check if the player is holding the skill key. */
export declare function IS_HOLDING(options?: FlipOptions): Condition;
