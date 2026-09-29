import { schonGefragt } from './s01-schon-gefragt';
import { datenerfassung } from './s02-datenerfassung';
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {
  s01: schonGefragt,
  s02: datenerfassung,
};
