import { schonGefragt } from './s01-schon-gefragt';
import { datenerfassung } from './s02-datenerfassung';
import { stuehle } from './s03-stuehle';
import { erstZeichnen } from './grafik-erst-zeichnen';
import { nennerCheck } from './s04-nenner-check';
import { treiber } from './s05-treiber';
import { letzteFrage } from './s06-letzte-frage';
import { dreiFragen } from './s07-drei-fragen';
import { automat } from './s08-automat';
import { mitgenommen } from './s09-mitgenommen';
import { buergerrat } from './s10-buergerrat';
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {
  s01: schonGefragt,
  s02: datenerfassung,
  s03: stuehle,
  grafik: erstZeichnen,
  s04: nennerCheck,
  s05: treiber,
  s06: letzteFrage,
  s07: dreiFragen,
  s08: automat,
  s09: mitgenommen,
  s10: buergerrat,
};
