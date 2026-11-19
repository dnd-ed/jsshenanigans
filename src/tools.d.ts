export interface SkillInfo {
  kind?: string | null;
  name?: string | null;
  fields?: string[];
  nodes?: Array<string | undefined>;
  conditions?: Array<string | undefined>;
  branches?: string[];
  raw?: unknown;
}

export interface DescribeResult {
  skill_count: number;
  skills: SkillInfo[];
}

/**
 * Return the full payload of `code` as pretty-printed JSON.
 *
 * @param code A character code.
 * @param options `indent` (default 2) and `expand_data` (default true).
 */
export declare function dumps(
  code: string,
  options?: { indent?: number; expand_data?: boolean },
): string;

/** Return a compact structural summary of a character code. */
export declare function describe(code: string): DescribeResult;
