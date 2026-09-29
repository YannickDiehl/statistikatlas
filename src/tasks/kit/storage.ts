import { TASK_IDS, type TaskId } from '../types';

export const taskStorageKey = 'statistikatlas.aufgaben.v1';
export type TaskStore = { tasks: Partial<Record<TaskId, unknown>> };

export const emptyTaskStore = (): TaskStore => ({ tasks: {} });

export function parseTaskStore(raw: string | null): TaskStore {
  if (!raw) return emptyTaskStore();
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return emptyTaskStore(); }
  const tasks = record(record(data).tasks);
  const out = emptyTaskStore();
  for (const id of TASK_IDS) {
    const value = tasks[id];
    if (value && typeof value === 'object' && !Array.isArray(value)) out.tasks[id] = value;
  }
  return out;
}

/* Kleine Helfer zum defensiven Lesen gespeicherter Zustände. */
export const record = (x: unknown): Record<string, unknown> =>
  x && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, unknown> : {};
export const str = (x: unknown, max = 2000) => typeof x === 'string' ? x.slice(0, max) : '';
export const bool = (x: unknown, fallback = false) => typeof x === 'boolean' ? x : fallback;
export const oneOf = <T extends string>(x: unknown, options: readonly T[], fallback: T): T =>
  options.includes(x as T) ? x as T : fallback;
export const strList = (x: unknown, maxItems = 20, max = 200) =>
  Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string').slice(0, maxItems).map(s => s.slice(0, max)) : [];
