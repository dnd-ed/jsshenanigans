/**
 * Generate the node and condition reference pages.
 *
 * Maintainers: the option descriptions live in the Python reference
 * implementation, so this script reads both it and the JavaScript source:
 *
 *   - names, option defaults and node keys: `src/nodes.js` / `src/conditions.js`
 *   - default output: calling each builder with no arguments
 *   - descriptions: the Python `:param:` docstrings
 *
 * Usage:  node docs/scripts/generate-reference.mjs
 * The Python checkout defaults to ../../pts (a sibling of this repo) and can be
 * overridden with PYTHONSHENANIGANS_SRC.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as conditions from '../../src/conditions.js';
import * as nodes from '../../src/nodes.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const pythonRoot =
  process.env.PYTHONSHENANIGANS_SRC ??
  path.join(root, '..', 'pts', 'src', 'pythonshenanigans');

/** Escape text for a Markdown table cell inside MDX, leaving code spans alone. */
const escapeProse = (text) =>
  text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');

const cell = (text) =>
  String(text)
    .replace(/``(.+?)``/g, '`$1`')
    .split(/(`[^`]*`)/)
    .map((segment) => (segment.startsWith('`') ? segment : escapeProse(segment)))
    .join('')
    .replace(/\|/g, '\\|');

/** Split a JavaScript parameter block on commas that are not nested or quoted. */
function splitTopLevel(block) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (let index = 0; index < block.length; index += 1) {
    const char = block[index];
    if (quote) {
      current += char;
      if (char === quote && block[index - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      current += char;
      continue;
    }
    if ('([{'.includes(char)) depth += 1;
    if (')]}'.includes(char)) depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Parse `:param name: description` lines out of a Python module. */
function pythonParams(file) {
  const source = readFileSync(file, 'utf8');
  const starts = [];
  const functionRe = /^def (\w+)\(/gm;
  let match;
  while ((match = functionRe.exec(source)) !== null) {
    starts.push({ name: match[1], at: match.index });
  }

  const out = {};
  starts.forEach((start, index) => {
    const end = index + 1 < starts.length ? starts[index + 1].at : source.length;
    const body = source.slice(start.at, end);
    const params = {};
    let current = null;
    for (const line of body.split('\n')) {
      const param = line.match(/^\s*:param (\w+): (.*)$/);
      if (param) {
        current = param[1];
        params[current] = param[2].trim();
        continue;
      }
      if (!current) continue;
      // Indented continuation lines belong to the previous :param:.
      if (/^\s+:\w+/.test(line) || line.trim() === '"""' || line.trim() === '') {
        current = null;
      } else if (/^\s+\S/.test(line)) {
        params[current] += ` ${line.trim()}`;
      } else {
        current = null;
      }
    }
    out[start.name] = params;
  });
  return out;
}

/** Parse the builders out of a JavaScript module's source. */
function jsBuilders(file) {
  const source = readFileSync(file, 'utf8');
  const out = [];
  const fnRe = /export function (\w+)\(\{([\s\S]*?)\}\s*=\s*\{\}\)\s*\{([\s\S]*?)\n\}/g;
  let match;

  while ((match = fnRe.exec(source)) !== null) {
    const [, name, paramsBlock, body] = match;

    const options = [];
    for (const piece of splitTopLevel(paramsBlock)) {
      const entry = piece.trim();
      if (!entry) continue;
      if (entry.startsWith('...')) {
        options.push({ rest: true, name: entry.slice(3).trim() });
        continue;
      }
      const at = entry.indexOf('=');
      options.push({
        name: (at === -1 ? entry : entry.slice(0, at)).trim(),
        default: at === -1 ? undefined : entry.slice(at + 1).trim(),
      });
    }

    // output key -> option name, for `"KEY": option` and `"KEY": _vec3(option)`
    const keys = {};
    for (const re of [
      /"([^"]+)":\s*([A-Za-z_][A-Za-z0-9_]*)\b/g,
      /"([^"]+)":\s*_vec3\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g,
      /([A-Z][A-Z0-9_ ]*):\s*([A-Za-z_][A-Za-z0-9_]*)\b/g,
    ]) {
      let key;
      while ((key = re.exec(body)) !== null) {
        keys[key[2]] ??= key[1].trim();
      }
    }

    out.push({ name, options, keys });
  }
  return out;
}

function render({ title, description, module, mod, builders, python, usage }) {
  const lines = [
    '---',
    `title: ${title}`,
    `description: ${description}`,
    '---',
    '',
    description,
    '',
    '```js',
    `import * as ${module} from '@dnd-ed/jsshenanigans/${module}';`,
    '```',
    '',
  ];

  for (const builder of builders) {
    const docs = python[builder.name] ?? {};
    lines.push(`## ${builder.name}`, '');
    lines.push('```js', `${module}.${builder.name}({ ... });`, '```', '');
    lines.push('| Option | Node key | Default | Description |');
    lines.push('| --- | --- | --- | --- |');
    for (const option of builder.options) {
      if (option.rest) {
        lines.push(
          `| \`...${option.name}\` | — | — | Any extra key, passed through verbatim. |`,
        );
        continue;
      }
      const key = builder.keys[option.name] ? `\`${builder.keys[option.name]}\`` : '—';
      const def = option.default === undefined ? '—' : `\`${cell(option.default)}\``;
      const desc = docs[option.name] ? cell(docs[option.name]) : '—';
      lines.push(`| \`${option.name}\` | ${key} | ${def} | ${desc} |`);
    }
    lines.push('');
    lines.push('<Callout title="Default output">', '');
    lines.push('```json', JSON.stringify(mod[builder.name](), null, 2), '```', '');
    lines.push('</Callout>', '');
  }

  if (usage) lines.push(usage, '');
  return lines.join('\n');
}

const pyNodes = pythonParams(path.join(pythonRoot, 'nodes.py'));
const pyConditions = pythonParams(path.join(pythonRoot, 'conditions.py'));

const nodeBuilders = jsBuilders(path.join(root, 'src', 'nodes.js')).filter(
  (builder) => builder.name !== 'raw',
);
const conditionBuilders = jsBuilders(path.join(root, 'src', 'conditions.js'));

const target = (name) => path.join(root, 'docs', 'content', 'docs', 'api', `${name}.mdx`);

writeFileSync(
  target('nodes'),
  render({
    title: 'Node builders',
    description:
      'Every `nodes.*` builder, its options, and the node key each option writes.',
    module: 'nodes',
    mod: nodes,
    builders: nodeBuilders,
    python: pyNodes,
    usage: [
      '## raw',
      '',
      'For a node with no builder, or a field that is not modelled:',
      '',
      '```js',
      "nodes.raw('LOOK', { TARGET: 'Head' });",
      '```',
      '',
    ].join('\n'),
  }),
);

writeFileSync(
  target('conditions'),
  render({
    title: 'Condition builders',
    description: 'Every `conditions.*` builder and its options.',
    module: 'conditions',
    mod: conditions,
    builders: conditionBuilders,
    python: pyConditions,
  }),
);

console.log(
  `wrote api/nodes.mdx (${nodeBuilders.length} builders) and api/conditions.mdx (${conditionBuilders.length} builders)`,
);
