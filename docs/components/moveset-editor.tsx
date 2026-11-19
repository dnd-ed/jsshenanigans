'use client';

import * as conditions from '@dnd-ed/jsshenanigans/conditions';
import * as jss from '@dnd-ed/jsshenanigans';
import * as nodes from '@dnd-ed/jsshenanigans/nodes';
import { useEffect, useMemo, useState } from 'react';

import { loadBrowserBackend } from '@/lib/browser-backend';

type Skill = {
  NAME?: string;
  K_NAME?: string;
  KEY?: number;
  COOLDOWN?: number;
  DATA?: string;
  [key: string]: unknown;
};

type SkillData = {
  Line?: unknown[];
  Prop?: Record<string, unknown>;
  Req?: unknown[];
  Branch?: Record<string, unknown>;
};

const builder = (module: object, name: string) =>
  (module as Record<string, (options?: object) => Record<string, unknown>>)[name];

const NODE_BUILDERS = Object.keys(nodes)
  .filter((name) => !name.startsWith('_') && name !== 'raw')
  .sort();
const CONDITION_BUILDERS = Object.keys(conditions).sort();
const SKILL_KINDS = ['SKILL', 'SPECIAL', 'MELEE', 'CHASE', 'AWAKENING'];

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

function readData(skill: Skill | undefined): SkillData {
  if (!skill?.DATA) return { Line: [], Prop: {}, Req: [] };
  try {
    return JSON.parse(skill.DATA) as SkillData;
  } catch {
    return { Line: [], Prop: {}, Req: [] };
  }
}

const withData = (skill: Skill, data: SkillData): Skill => ({
  ...skill,
  DATA: JSON.stringify(data),
});

export function MovesetEditor() {
  const [payload, setPayload] = useState<Skill[]>([]);
  const [code, setCode] = useState('');
  const [selected, setSelected] = useState(0);
  const [backend, setBackend] = useState('loading…');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    loadBrowserBackend()
      .then((name) => setBackend(name))
      .catch((exc: Error) => {
        setBackend('unavailable');
        setError(`Could not start the browser zstd backend: ${exc.message}`);
      });
  }, []);

  const skill = payload[selected];
  const data = useMemo(() => readData(skill), [skill]);
  const ready = backend !== 'loading…' && backend !== 'unavailable';

  const mutate = (index: number, next: Skill) =>
    setPayload((current) => current.map((entry, i) => (i === index ? next : entry)));

  function addSkill(kind: string) {
    const character = new jss.Character();
    character.create.skill('New Skill', { kind: kind as 'SKILL' });
    const created = character.raw[0] as Skill;
    setPayload((current) => [...current, created]);
    setSelected(payload.length);
    setNote(`Added a ${kind} skill.`);
  }

  function removeSkill(index: number) {
    setPayload((current) => current.filter((_, i) => i !== index));
    setSelected(0);
  }

  function addNode(name: string) {
    if (!skill) return;
    const next = structuredClone(data);
    (next.Line ??= []).push(builder(nodes, name)({}));
    mutate(selected, withData(skill, next));
    setNote(`Added a ${name} node.`);
  }

  function addCondition(name: string) {
    if (!skill) return;
    const next = structuredClone(data);
    (next.Req ??= []).push(builder(conditions, name)({}));
    mutate(selected, withData(skill, next));
  }

  function updateLine(index: number, json: string) {
    if (!skill) return;
    try {
      const next = structuredClone(data);
      next.Line![index] = JSON.parse(json);
      mutate(selected, withData(skill, next));
      setError(null);
    } catch (exc) {
      setError(`Node JSON is invalid: ${(exc as Error).message}`);
    }
  }

  function updateReq(index: number, json: string) {
    if (!skill) return;
    try {
      const next = structuredClone(data);
      next.Req![index] = JSON.parse(json);
      mutate(selected, withData(skill, next));
      setError(null);
    } catch (exc) {
      setError(`Condition JSON is invalid: ${(exc as Error).message}`);
    }
  }

  /** Load: hand the pasted code to jss and keep the decoded skills. */
  function load() {
    try {
      const character = jss.Character.from_code(code.trim());
      setPayload(character.raw as Skill[]);
      setSelected(0);
      setError(null);
      setNote(`Loaded ${character.length} entries.`);
    } catch (exc) {
      setError(`Could not load that code: ${(exc as Error).message}`);
    }
  }

  /** Export: let jss encode the current payload back into a code. */
  function exportCode() {
    try {
      const next = jss.encode(payload);
      setCode(next);
      setError(null);
      setNote(`Exported ${next.length} characters with ${jss.backend_name()}.`);
    } catch (exc) {
      setError(`Could not export: ${(exc as Error).message}`);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
        <span className="rounded bg-fd-secondary px-2 py-1 font-mono text-xs">
          zstd backend: {backend}
        </span>
        <span className="text-fd-muted-foreground">
          {payload.length} {payload.length === 1 ? 'entry' : 'entries'}
        </span>
        {note && <span className="text-fd-muted-foreground">{note}</span>}
        {error && <span className="text-red-600">{error}</span>}
      </div>

      <section className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="code">
          Character code
        </label>
        <textarea
          id="code"
          className="h-24 w-full resize-y rounded-lg border bg-fd-background p-3 font-mono text-xs"
          placeholder="Paste a JJS character code, then press Load"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-fd-primary px-3 py-1.5 text-sm text-fd-primary-foreground disabled:opacity-50"
            onClick={load}
            disabled={!code.trim()}
          >
            Load
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={exportCode}
            disabled={!ready || payload.length === 0}
          >
            Export code
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => navigator.clipboard?.writeText(code)}
            disabled={!code}
          >
            Copy
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Skills</h2>
          <ul className="flex flex-col gap-1">
            {payload.map((entry, index) => (
              <li key={index}>
                <button
                  type="button"
                  className={`w-full rounded-md border px-2 py-1.5 text-left text-sm ${
                    index === selected ? 'bg-fd-secondary' : ''
                  }`}
                  onClick={() => setSelected(index)}
                >
                  <span className="font-mono text-xs">{entry.K_NAME}</span> {entry.NAME}
                </button>
              </li>
            ))}
          </ul>
          <select
            className="rounded-md border bg-fd-background px-2 py-1.5 text-sm"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) addSkill(event.target.value);
              event.target.value = '';
            }}
          >
            <option value="">Add skill…</option>
            {SKILL_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </section>

        <section className="flex flex-col gap-4">
          {!skill ? (
            <p className="text-sm text-fd-muted-foreground">
              Load a code or add a skill to start editing.
            </p>
          ) : (
            <>
              {(['SKILL', 'SPECIAL', 'MELEE', 'CHASE', 'AWAKENING'] as const).includes(
                skill.K_NAME as 'SKILL',
              ) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs">
                    Name
                    <input
                      className="rounded border bg-fd-background px-2 py-1 text-sm"
                      value={skill.NAME ?? ''}
                      onChange={(event) =>
                        mutate(selected, { ...skill, NAME: event.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    Kind
                    <select
                      className="rounded border bg-fd-background px-2 py-1 text-sm"
                      value={skill.K_NAME ?? 'SKILL'}
                      onChange={(event) =>
                        mutate(selected, { ...skill, K_NAME: event.target.value })
                      }
                    >
                      {SKILL_KINDS.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded border bg-fd-background px-2 py-1 text-sm"
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) addNode(event.target.value);
                    event.target.value = '';
                  }}
                >
                  <option value="">Add node…</option>
                  {NODE_BUILDERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded border bg-fd-background px-2 py-1 text-sm"
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) addCondition(event.target.value);
                    event.target.value = '';
                  }}
                >
                  <option value="">Add condition…</option>
                  {CONDITION_BUILDERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => removeSkill(selected)}
                >
                  Remove skill
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Nodes</h3>
                {(data.Line ?? []).map((node, index) => (
                  <div key={index} className="flex flex-col gap-1 rounded-lg border p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">
                        {(node as { K_NAME?: string }).K_NAME ?? 'node'}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-fd-muted-foreground"
                        onClick={() => {
                          const next = structuredClone(data);
                          next.Line!.splice(index, 1);
                          mutate(selected, withData(skill, next));
                        }}
                      >
                        remove
                      </button>
                    </div>
                    <textarea
                      className="h-24 w-full resize-y rounded border bg-fd-background p-2 font-mono text-xs"
                      defaultValue={pretty(node)}
                      onBlur={(event) => updateLine(index, event.target.value)}
                    />
                  </div>
                ))}
                {(data.Line ?? []).length === 0 && (
                  <p className="text-xs text-fd-muted-foreground">No nodes yet.</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Conditions</h3>
                {(data.Req ?? []).map((condition, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      className="w-full rounded border bg-fd-background px-2 py-1 font-mono text-xs"
                      defaultValue={pretty(condition)}
                      onBlur={(event) => updateReq(index, event.target.value)}
                    />
                    <button
                      type="button"
                      className="text-xs text-fd-muted-foreground"
                      onClick={() => {
                        const next = structuredClone(data);
                        next.Req!.splice(index, 1);
                        mutate(selected, withData(skill, next));
                      }}
                    >
                      remove
                    </button>
                  </div>
                ))}
                {(data.Req ?? []).length === 0 && (
                  <p className="text-xs text-fd-muted-foreground">No conditions yet.</p>
                )}
              </div>

              <details className="rounded-lg border p-2">
                <summary className="cursor-pointer text-sm font-medium">
                  Raw skill JSON
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded bg-fd-secondary p-2 font-mono text-xs">
                  {pretty(skill)}
                </pre>
              </details>
            </>
          )}
        </section>
      </div>

      <details className="rounded-lg border p-2">
        <summary className="cursor-pointer text-sm font-medium">Whole payload</summary>
        <pre className="mt-2 max-h-96 overflow-auto rounded bg-fd-secondary p-2 font-mono text-xs">
          {pretty(payload)}
        </pre>
      </details>
    </div>
  );
}
