/** Node and condition builder tests. */

import assert from "node:assert/strict";
import test from "node:test";

import { _NODE_BUILDERS } from "../src/defaults.js";
import * as conditions from "../src/conditions.js";
import * as nodes from "../src/nodes.js";

test("vec3 accepts any iterable", () => {
  assert.equal(nodes.HITBOX({ position: [1, 2, 3] }).POSITION, "1, 2, 3");
  assert.equal(nodes.TELEPORT({ position: [4, 5, 6] }).POSITION, "4, 5, 6");
  assert.equal(nodes.HITBOX({ position: new Set([1, 2, 3]) }).POSITION, "1, 2, 3");
});

test("vec3 passes preformatted strings through", () => {
  assert.equal(nodes.HITBOX({ position: "1, 2, 3" }).POSITION, "1, 2, 3");
  assert.equal(nodes.TELEPORT({ rotation: "[4, 5, 6]" }).ROTATION, "4, 5, 6");
});

test("hitbox preview is only present when given", () => {
  assert.deepEqual(nodes.HITBOX({ preview: [0, 15] }).PREVIEW, [0, 15]);
  assert.ok(!("PREVIEW" in nodes.HITBOX()));
});

test("no node builder shares state between calls", () => {
  const builders = [
    nodes.ANIMATION,
    nodes.VELOCITY,
    nodes.HITBOX,
    nodes.VISUAL,
    nodes.GRAB,
    nodes.PROJECTILE,
    nodes.COUNTER,
    nodes.TELEPORT,
  ];
  for (const builder of builders) {
    const first = builder();
    const second = builder();
    for (const [key, value] of Object.entries(first)) {
      if (value && typeof value === "object") {
        assert.notEqual(value, second[key], `${builder.name} shares ${key}`);
      }
    }
  }
});

test("node builder keys match their K_NAME", () => {
  for (const [kName, builder] of Object.entries(_NODE_BUILDERS)) {
    assert.equal(nodes[builder]().K_NAME, kName, `builder ${builder}`);
  }
});

test("documented defaults match the game", () => {
  assert.equal(nodes.SOUND().VOLUME, 0.5);
  assert.equal(conditions.HAS_AWK_BAR().AMOUNT, 5);
  assert.equal(nodes.PROJECTILE().POSITION, "0, 0, 4");
  assert.equal(nodes.LOOK().SMOOTHNESS, 40);
  assert.equal(nodes.SETMELEE()["LAST HIT"], -1);
});

test("visual alt fields have independent defaults", () => {
  const node = nodes.VISUAL({ color: "1, 2, 3", size: 4, position: [1, 2, 3] });
  assert.equal(node.COLOR, "1, 2, 3");
  assert.equal(node["ALT COLOR"], "255, 255, 255");
  assert.equal(node["ALT SIZE"], 1);
  assert.equal(node["ALT POSITION"], "0, 0, 0");
});

test("newly documented fields are emitted", () => {
  assert.equal(nodes.HITBOX({ link_user: true })["LINK USER"], true);
  assert.equal(nodes.PROJECTILE({ single_target: false })["SINGLE TARGET"], false);
  assert.equal(nodes.COUNTER({ reflect: true }).REFLECT, true);
  assert.equal(nodes.COUNTER({ continue_: true }).CONTINUE, true);
  assert.equal(nodes.TELEPORT({ ignore_walls: true })["IGNORE WALLS"], true);
  assert.equal(nodes.ADD_HEALTH({ can_kill: true })["CAN KILL"], true);
  assert.equal(nodes.STATE({ state_tag: "mytag" })["STATE TAG"], "mytag");
});

test("particle, look and setmelee builders", () => {
  const look = nodes.LOOK({ time: 1, horizontal_only: true, camera_direction: true });
  assert.equal(look.TIME, 1);
  assert.equal(look.SMOOTHNESS, 40);
  assert.equal(look["HORIZONTAL ONLY"], true);
  assert.ok(!("GROUNDED" in look));

  assert.deepEqual(nodes.SETMELEE({ combo: -1, offset: 2 }), {
    K_NAME: "SETMELEE",
    "LAST HIT": -1,
    COMBO: -1,
    OFFSET: 2,
  });

  const particle = nodes.PARTICLE({ part_size: [1, 1, 1], emit_count: 10, color: "1,2,3" });
  assert.equal(particle["PART SIZE"], "1, 1, 1");
  assert.equal(particle["EMIT COUNT"], 10);
  assert.equal(particle.COLOR, "1,2,3");
  assert.ok(!("RATE" in particle));
  assert.ok(!("DURATION" in particle));
  assert.equal(nodes.PARTICLE({ TRANSPARENCY: "0, 1" }).TRANSPARENCY, "0, 1");
});

test("raw builds any node verbatim", () => {
  assert.deepEqual(nodes.raw("CUSTOM", { X: 1 }), { K_NAME: "CUSTOM", X: 1 });
});

test("every condition builder serialises", () => {
  const built = [
    conditions.IN_AIR(),
    conditions.IS_JUMPING({ flip: true }),
    conditions.HAS_TARGET(),
    conditions.IS_AWAKENED({ flip: true }),
    conditions.HAS_AWK_BAR({ amount: 3 }),
    conditions.DURABILITY({ durability: 2 }),
    conditions.HAS_HEALTH({ amount: 50, flip: true }),
    conditions.IS_IN_DOMAIN(),
    conditions.IS_HOLDING({ flip: true }),
  ];
  assert.deepEqual(
    built.map((cond) => cond.K_NAME),
    ["AIR", "JUMP", "AIM", "ULT", "BAR", "DUR", "HP", "DOMAIN", "HOLD"],
  );
});
