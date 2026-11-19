/** Tests for the read-only tools, backed by real game-produced codes. */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as codec from "../src/codec.js";
import * as nodes from "../src/nodes.js";
import * as jss from "../src/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
  readFileSync(path.join(here, "fixtures", name), "utf8").trim();

const SAMPLE_CODE = fixture("sample_code.txt");
const PARTICLE_CODE = fixture("game_code_particle_look_setmelee.txt");
const ALL_FIELDS_CODE = fixture("game_code_all_fields.txt");

test("describe summarises a character code", () => {
  const info = jss.describe(SAMPLE_CODE);
  assert.equal(info.skill_count, 5);
  assert.equal(info.skills[4].kind, "CHASE");
});

test("unmodelled fields survive a round trip", () => {
  const payload = codec.decode(jss.Character.from_code(SAMPLE_CODE).export_character_code());
  assert.equal(payload[0]["TOOL TIP"], "tooltip here");
  assert.equal(payload[2].COLOR, "1,1,1 5,5,5");
  const kinds = JSON.parse(payload[0].DATA).Line.map((node) => node.K_NAME);
  for (const kind of ["PARTICLE", "LOOK", "SETMELEE"]) {
    assert.ok(kinds.includes(kind), `missing ${kind}`);
  }
});

test("dumps expands the node graph", () => {
  const character = new jss.Character();
  character.create.skill("Expandable", [nodes.WAIT({ TIME: 0.5 })]);
  const expanded = JSON.parse(jss.dumps(character.export_character_code()));
  assert.equal(expanded[0].DATA.Line[0].K_NAME, "WAIT");
});

test("nested DATA strings are expanded recursively", () => {
  const inner = JSON.stringify({ Line: [], Req: [], Prop: {} });
  const middle = JSON.stringify({
    Line: [],
    Req: [],
    Prop: {},
    Nested: { DATA: inner },
  });
  const payload = [{ NAME: "x", K_NAME: "SKILL", KEY: 1, DATA: middle }];
  const expanded = JSON.parse(jss.dumps(codec.encode(payload)));
  assert.equal(typeof expanded[0].DATA.Nested.DATA, "object");
});

test("describe handles non-object entries", () => {
  const info = jss.describe(codec.encode([1, 2]));
  assert.equal(info.skill_count, 2);
});

test("parses a game code using particle, look and setmelee", () => {
  const payload = codec.decode(PARTICLE_CODE);
  assert.equal(payload.length, 8);

  const kinds = new Set();
  for (const skill of payload) {
    if (typeof skill.DATA === "string") {
      for (const node of JSON.parse(skill.DATA).Line) kinds.add(node.K_NAME);
    }
  }
  for (const kind of ["PARTICLE", "LOOK", "SETMELEE"]) {
    assert.ok(kinds.has(kind), `missing ${kind}`);
  }

  const rebuilt = jss.Character.from_code(PARTICLE_CODE).export_character_code();
  assert.deepEqual(codec.decode(rebuilt), payload);
});

function allFieldsNodes() {
  const out = {};
  for (const skill of codec.decode(ALL_FIELDS_CODE)) {
    if (typeof skill.DATA === "string") {
      for (const node of JSON.parse(skill.DATA).Line) {
        out[node.K_NAME] ??= new Set();
        for (const key of Object.keys(node)) out[node.K_NAME].add(key);
      }
    }
  }
  return out;
}

test("every key the game emits is modelled", () => {
  const game = allFieldsNodes();
  const ours = {
    PARTICLE: nodes.PARTICLE({
      part_size: [1, 1, 1],
      texture: 1,
      emit_count: 2,
      rate: 3,
      duration: 4,
      color: "1,2,3",
      size: [1, 2],
      brightness: 5,
      transparency: [1, 2],
      squash: [1, 2],
      lifetime: [1, 2],
      speed: [1, 2],
      rotation: [1, 2],
      rot_speed: [1, 2],
      acceleration: [1, 2, 3],
      drag: 6,
      light_emission: 7,
      light_influence: 8,
      z_offset: 9,
      spread_angle: [1, 2, 3],
      position: [1, 2, 3],
      lock_to_part: true,
      limb: "Head",
      orientation_type: "FacingCamera",
      emission_direction: "Left",
      flipbook_size: [1, 2],
      flipbook_mode: "Loop",
      flipbook_framerate: [1, 2],
      shape: "Box",
      shape_inout: "InAndOut",
      shape_partial: 1,
      run_on_server: true,
      client_sided: true,
      cancel_tag: "t",
      cancel: true,
      cancel_on_interrupt: true,
      projectile_tag: "p",
      last_hit: 1,
    }),
    HITBOX: nodes.HITBOX({
      position: [1, 2, 3],
      rotation: [4, 5, 6],
      size: [7, 8, 9],
      stun: 10,
      damage: 11,
      debree: 12,
      attack_type: "Domain",
      blockable: true,
      blockable_360: true,
      cancel_enemy: true,
      clear_knockback: true,
      can_kill: true,
      hit_ragdoll: true,
      hit_user: true,
      single_target: false,
      branch: "b",
      branch_target: "t",
      branch_finisher: "f",
      projectile_tag: "p",
      link_user: true,
      preview: [0, 15],
      stun_anim: true,
      ignore_wakeup: true,
    }),
    COUNTER: nodes.COUNTER({
      attack_type: ["Melee", "Domain"],
      stun: 2,
      branch: "b",
      branch_target: "t",
      reflect: true,
      continue_: true,
    }),
    STATE: nodes.STATE({
      time: 2,
      cancel_on_end: true,
      disable_burst: true,
      last_hit: 3,
      check: true,
      branch: "b",
      state_tag: "t",
    }),
    HPGIB: nodes.ADD_HEALTH({ amount: 1, can_kill: true }),
    TELEPORT: nodes.TELEPORT({
      position: [1, 2, 3],
      rotation: [4, 5, 6],
      last_hit: 7,
      projectile_tag: "p",
      relative_from_branch: true,
      ignore_walls: true,
    }),
  };

  for (const [kind, node] of Object.entries(ours)) {
    const missing = [...game[kind]].filter((key) => !(key in node));
    assert.deepEqual(missing, [], `${kind} is missing game keys: ${missing}`);
  }

  assert.deepEqual(
    Object.keys(ours.PARTICLE).sort(),
    [...game.PARTICLE].sort(),
  );
});

test("the game code shows hiding is property-driven", () => {
  const payload = codec.decode(PARTICLE_CODE);
  const named = (prefix) =>
    payload.find((skill) => (skill.NAME ?? "").startsWith(prefix));

  const visible = named("visible skill");
  assert.equal(visible.KEY, 99);
  assert.ok(!("DATA" in visible));

  const invisible = JSON.parse(named("invisible skill").DATA).Prop;
  assert.deepEqual(invisible, { AWK: true, AWK2: true });

  assert.deepEqual(JSON.parse(named("half-visible").DATA).Prop, { AWK2: true });
});
