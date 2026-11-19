/** Character builder/loader tests. */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as conditions from "../src/conditions.js";
import * as nodes from "../src/nodes.js";
import * as jss from "../src/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
  readFileSync(path.join(here, "fixtures", name), "utf8").trim();
const SAMPLE_CODE = fixture("sample_code.txt");

const lineOf = (skill) => JSON.parse(skill.DATA);

test("auto keys do not collide", () => {
  const character = new jss.Character({ hide_character_extras: true });
  for (let index = 0; index < 3; index += 1) {
    character.create.skill(`skill${index}`, [nodes.WAIT()]);
  }
  const keys = character.raw
    .filter((skill) => skill.K_NAME === "SKILL")
    .map((skill) => skill.KEY);
  assert.equal(keys.length, new Set(keys).size);
  assert.deepEqual([...keys].sort((a, b) => a - b), [1, 2, 3, 4]);
});

test("tooltip and color are emitted", () => {
  const character = new jss.Character();
  character.create.skill("a", [nodes.WAIT()], { tooltip: "hi" });
  character.create.skill("b", [], { kind: "AWAKENING", color: "1,1,1 2,2,2" });
  assert.equal(character.raw[0]["TOOL TIP"], "hi");
  assert.equal(character.raw[1].COLOR, "1,1,1 2,2,2");
});

test("a skill without a node list is allowed", () => {
  const character = new jss.Character();
  character.create.skill("Super Cool Skill", { cooldown: 5 });
  const skill = character.raw[0];
  assert.equal(skill.KEY, 1);
  assert.equal(skill.COOLDOWN, 5);
  assert.deepEqual(lineOf(skill).Line, []);
});

test("key auto continues from a loaded character", () => {
  const character = jss.Character.from_code(SAMPLE_CODE);
  character.create.skill("new", [nodes.WAIT()]);
  assert.equal(character.raw.at(-1).KEY, 2);
});

test("anim defaults are stripped, non-defaults kept", () => {
  const stripped = new jss.Character();
  stripped.create.skill("anim", [nodes.ANIMATION()]);
  assert.deepEqual(lineOf(stripped.raw[0]).Line[0], { K_NAME: "ANIM" });

  const kept = new jss.Character();
  kept.create.skill("anim", [nodes.ANIMATION({ animation: [1, 5] })]);
  assert.deepEqual(lineOf(kept.raw[0]).Line[0].ANIM_USE, [1, 5]);
});

test("to_code is an alias for export_character_code", () => {
  const character = new jss.Character();
  character.create.skill("Alias", [nodes.WAIT({ TIME: 1 })]);
  assert.equal(character.to_code(), character.export_character_code());
});

test("from_raw and create_raw_skill", () => {
  const character = new jss.Character();
  character.create.skill("Raw", [nodes.WAIT({ TIME: 0.5 })]);

  const reloaded = jss.Character.from_raw(character.export_raw());
  assert.deepEqual(reloaded.raw, character.raw);
  assert.equal(reloaded.export_character_code(), character.export_character_code());

  reloaded.create_raw_skill({
    NAME: "handmade",
    K_NAME: "SPECIAL",
    DATA: "{}",
    COOLDOWN: 0,
  });
  assert.deepEqual(reloaded.skills.at(-1), { kind: "SPECIAL", name: "handmade" });
});

test("length and iteration", () => {
  const character = new jss.Character();
  character.create.skill("one", [nodes.WAIT()]);
  character.create.skill("two", [nodes.WAIT()]);
  assert.equal(character.length, 2);
  assert.deepEqual([...character].map((skill) => skill.NAME), ["one", "two"]);
});

test("branch builder", () => {
  const branch = jss.Branch([nodes.WAIT({ TIME: 0.25 })], [conditions.IN_AIR()]);
  assert.deepEqual(branch.nodes, [{ K_NAME: "WAIT", TIME: 0.25 }]);
  assert.deepEqual(branch.conditions, [{ K_NAME: "AIR", FLIP: false }]);

  const character = new jss.Character();
  character.create.skill("Branchy", [nodes.WAIT()], { branches: { b: branch } });
  const data = lineOf(character.raw[0]);
  assert.deepEqual(Object.keys(data.Branch), ["b"]);
  assert.deepEqual(data.Branch.b.Req, [{ K_NAME: "AIR" }]);
});

test("properties defaults are stripped", () => {
  const character = new jss.Character();
  character.create.skill("default", [nodes.WAIT()], { properties: jss.Properties() });
  character.create.skill("custom", [nodes.WAIT()], {
    properties: jss.Properties({ damage_multiplier: 3 }),
  });
  assert.deepEqual(lineOf(character.raw[0]).Prop, {});
  assert.deepEqual(lineOf(character.raw[1]).Prop, { DMG: 3 });
});

test("bad payload entries raise InvalidCharacterCodeError", () => {
  assert.throws(
    () => jss.Character.from_code(jss.encode([1, 2, 3])),
    jss.InvalidCharacterCodeError,
  );
  assert.throws(() => jss.Character.from_raw("[1, 2, 3]"), jss.InvalidCharacterCodeError);
  assert.throws(() => new jss.Character({ raw: [1, 2, 3] }), jss.InvalidCharacterCodeError);
  assert.throws(() => jss.Character.from_raw("{not json"), jss.InvalidCharacterCodeError);
});

test("create_raw_skill rejects non-objects", () => {
  const character = new jss.Character();
  assert.throws(
    () => character.create_raw_skill("not an object"),
    jss.InvalidCharacterCodeError,
  );
  assert.equal(character.length, 0);

  character.create_raw_skill({ NAME: "n", K_NAME: "SPECIAL", DATA: "{}" });
  const reloaded = jss.Character.from_code(character.export_character_code());
  assert.deepEqual(reloaded.raw, character.raw);
});

test("unknown skill kinds raise", () => {
  const character = new jss.Character();
  assert.throws(() => character.create.skill("x", [], { kind: "NOPE" }), RangeError);
});

test("version matches package.json", () => {
  const pkg = JSON.parse(readFileSync(path.join(here, "..", "package.json"), "utf8"));
  assert.equal(jss.VERSION, pkg.version);
});
