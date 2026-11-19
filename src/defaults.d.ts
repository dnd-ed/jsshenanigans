import type { Node } from "./nodes.js";

/** Node K_NAME -> builder name in `nodes`. */
export declare const _NODE_BUILDERS: Readonly<Record<string, string>>;

/** Default node objects, derived from the builders themselves. */
export declare const NODE_DEFAULTS: Readonly<Record<string, Node>>;

export declare const PROPERTIES_DEFAULTS: Readonly<
  Record<string, number | boolean | string>
>;

export declare const CONDITIONS_DEFAULTS: Readonly<
  Record<string, Record<string, number | boolean>>
>;
