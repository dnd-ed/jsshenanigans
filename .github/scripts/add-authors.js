#!/usr/bin/env node
/**
 * Check (or add) git contributors in `contributors` of package.json.
 *
 * With `--check` this only reports contributors who are not listed, and exits 0
 * either way, so it is safe to run in CI on every push. Without `--check` the
 * missing contributors are appended to package.json.
 *
 * Identities are read through `git log`'s %aN/%aE, which respect `.mailmap` --
 * that is how the same person committing under two names/emails is collapsed
 * into a single entry. Identities listed in `.github/authors-ignore.txt` are
 * never credited.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const PACKAGE = "package.json";
const IGNORE_FILE = ".github/authors-ignore.txt";

// Identities that must never be credited as an author.
const IGNORE_NAME = /\[bot\]|^github actions$|^dependabot$/i;
const IGNORE_EMAIL = /^(action|bot|noreply)@|github-actions\[bot\]@/i;

/** @returns {{names: Set<string>, emails: Set<string>}} */
function loadIgnore() {
  const names = new Set();
  const emails = new Set();
  if (!existsSync(IGNORE_FILE)) return { names, emails };

  for (const raw of readFileSync(IGNORE_FILE, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.includes("<") && line.includes(">")) {
      const [name, rest] = line.split("<");
      if (name.trim()) names.add(name.trim().toLowerCase());
      const address = rest.split(">")[0].trim();
      if (address) emails.add(address.toLowerCase());
    } else if (line.includes("@")) {
      emails.add(line.toLowerCase());
    } else {
      names.add(line.toLowerCase());
    }
  }
  return { names, emails };
}

/** @returns {Array<[string, string]>} unique (name, email) pairs, in order. */
function gitAuthors() {
  const { names: ignoreNames, emails: ignoreEmails } = loadIgnore();
  const output = execFileSync("git", ["log", "--format=%aN\t%aE"], {
    encoding: "utf8",
  });

  const authors = [];
  const seen = new Set();
  for (const line of output.split(/\r?\n/)) {
    if (!line.includes("\t")) continue;
    const [name, email] = line.split("\t").map((part) => part.trim());
    if (!name || !email || !email.includes("@")) continue;
    if (IGNORE_NAME.test(name) || IGNORE_EMAIL.test(email)) continue;
    if (ignoreNames.has(name.toLowerCase()) || ignoreEmails.has(email.toLowerCase())) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    authors.push([name, email]);
  }
  return authors;
}

function main(argv) {
  const check = argv.includes("--check");
  const pkg = JSON.parse(readFileSync(PACKAGE, "utf8"));
  const contributors = (pkg.contributors ??= []);

  // Matching is by email only. The one-person / several-identities case is
  // handled properly by `.mailmap`.
  const existing = new Set(
    contributors
      .map((entry) => String(entry.email ?? "").toLowerCase())
      .filter(Boolean),
  );

  const missing = gitAuthors().filter(
    ([, email]) => !existing.has(email.toLowerCase()),
  );

  if (missing.length === 0) {
    console.log("all contributors are already listed");
    return 0;
  }

  if (check) {
    for (const [name, email] of missing) {
      console.log(`::warning::contributor not listed in package.json: ${name} <${email}>`);
    }
    return 0;
  }

  for (const [name, email] of missing) contributors.push({ name, email });
  writeFileSync(PACKAGE, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

  console.log("added contributors:");
  for (const [name, email] of missing) console.log(`  ${name} <${email}>`);
  return 0;
}

process.exit(main(process.argv.slice(2)));
