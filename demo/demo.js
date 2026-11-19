/**
 * Demo for jsshenanigans: build a moveset, then load it back.
 *
 * Run with:  node demo/demo.js
 */

import * as jss from "../src/index.js";
import * as conditions from "../src/conditions.js";
import * as nodes from "../src/nodes.js";

// ------------------------------------------------------------------ building //

const character = new jss.Character({ hide_character_extras: true });

// A faster Todo swap that only works while airborne.
character.create.skill(
  "Quick Swap",
  [nodes.SPECIAL({ spec: "Boogie Woogie", speed: 100, enable_variants: false })],
  { kind: "SPECIAL", cooldown: 0, conditions: [conditions.IN_AIR()] },
);

// A normal skill exercising a few node types, a tooltip and the extra nodes.
character.create.skill(
  "Blitz",
  [
    nodes.SET_COOLDOWN({ key: -1, cooldown: 2 }),
    nodes.STATE({ state: "SpeedMultiplier", value: 2, time: 2 }),
    nodes.VISUAL({ effect: "Field of View", amount: 140, time: 2 }),
    nodes.HITBOX({ size: [6, 6, 4], damage: 5, preview: [0, 15] }),
    nodes.WAIT({ TIME: 0.5 }),
    nodes.PARTICLE({ speed: [1] }),
  ],
  { cooldown: 5, tooltip: "A short dash with a particle burst." },
);

// An awakening with the game's start/end colour pair.
character.create.skill(
  "Awakening",
  [nodes.VISUAL({ effect: "Shine", time: 1 })],
  { kind: "AWAKENING", duration: 15, delay: 1, color: "1,1,1 5,5,5" },
);

const code = character.export_character_code();

console.log("zstd backend:", jss.backend_name());
console.log("character code:");
console.log(code);
console.log();

// ------------------------------------------------------------------ loading //

console.log("summary:");
for (const entry of jss.describe(code).skills) {
  console.log("  ", entry.kind, "-", entry.name, "->", entry.nodes ?? []);
}
console.log();

console.log("pretty payload (DATA expanded):");
console.log(jss.dumps(code));
