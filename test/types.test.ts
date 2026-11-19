/**
 * Compile-only test for the hand-written declarations.
 *
 * `tsc --noEmit` runs this; nothing here executes. It exists so `index.d.ts`
 * (and the per-module declarations) can't silently drift from the code.
 */

import * as jss from "../src/index.js";
import * as conditions from "../src/conditions.js";
import * as nodes from "../src/nodes.js";
import * as tools from "../src/tools.js";
import type { BodyPartName, SkillName, SpecialName } from "../src/types.js";

const character = new jss.Character({ hide_character_extras: true });

character.create.skill(
  "Punch",
  [nodes.HITBOX({ damage: 5, position: [0, 0, 4], preview: [0, 15] })],
  {
    cooldown: 5,
    tooltip: "hi",
    conditions: [conditions.IN_AIR({ flip: true }), conditions.HAS_AWK_BAR({ amount: 5 })],
    properties: jss.Properties({ damage_multiplier: 2 }),
    branches: { b: jss.Branch([nodes.WAIT({ TIME: 1 })], [conditions.IS_HOLDING()]) },
  },
);

// The node list may also live in the options object.
character.create.skill("Kick", {
  kind: "SPECIAL",
  line: [nodes.SPECIAL({ spec: "Boogie Woogie" })],
});

const code: string = character.export_character_code();
const loaded: jss.Character = jss.Character.from_code(code);
const count: number = loaded.length;

for (const skill of loaded) {
  const name: string | undefined = skill.NAME;
  void name;
}

const summaries: jss.SkillSummary[] = loaded.skills;
const info: jss.DescribeResult = jss.describe(code);
const info2: jss.DescribeResult = tools.describe(code);
const pretty: string = jss.dumps(code, { indent: 4, expand_data: false });
const backend: string = jss.backend_name();

const magic: Uint8Array = jss.ZSTD_MAGIC;
const anim: readonly [number, number] = jss.Animations.HonoredOne.HollowPurple;

const move: SkillName = "Divergent Fist";
const spec: SpecialName = "Limitless";
const limb: BodyPartName = "Head";

const node: nodes.Node = nodes.TELEPORT({ position: "1, 2, 3" });
const condition: conditions.Condition = conditions.IS_IN_DOMAIN();
const particle: nodes.Node = nodes.PARTICLE({ part_size: [1, 1, 1], shape: "Box" });
const props: Record<string, number | boolean | string> = jss.Properties();
const err: Error = new jss.InvalidCharacterCodeError("nope");

void [count, summaries, info, info2, pretty, backend, magic, anim, move, spec, limb];
void [node, condition, particle, props, err];
