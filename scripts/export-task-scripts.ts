// Schreibt die Lösungsskripte (Hilfestufe 4) der Lernpfad-Aufgaben als .R-Dateien, mit festem Dateipfad statt file.choose().
//   node --import tsx scripts/export-task-scripts.ts <datei.sav> <ordner>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { antraege, SETUP_SCRIPT } from '../src/tasks/s01-schon-gefragt/content';
import { R_SOLUTION as S02 } from '../src/tasks/s02-datenerfassung/content';
import { R_SOLUTION as S03 } from '../src/tasks/s03-stuehle/content';
import { R_SOLUTION as S04 } from '../src/tasks/s04-nenner-check/content';
import { CARDS } from '../src/tasks/s05-treiber/content';
import { rCodeFor } from '../src/tasks/s05-treiber/domain';
import { hints as S06_HINTS, rSolution as S06 } from '../src/tasks/s06-letzte-frage/content';

const [sav, out] = process.argv.slice(2);
if (!sav || !out) {
  console.error('Aufruf: node --import tsx scripts/export-task-scripts.ts <datei.sav> <ordner>');
  process.exit(1);
}
const withFile = (code: string) => code.replaceAll('file.choose()', () => JSON.stringify(sav));
const scripts: Record<string, string> = {
  's01-schon-gefragt.R': `${SETUP_SCRIPT}\n${antraege.map(a => a.hint.solution).join('\n')}\n`,
  's02-datenerfassung.R': S02,
  's03-stuehle.R': S03,
  's04-nenner-check.R': S04,
  ...Object.fromEntries(CARDS.map(c => [`s05-treiber-${c.id}.R`, rCodeFor(c)])),
  's06-letzte-frage.R': S06(4),
  ...Object.fromEntries(Object.entries(S06_HINTS).map(([station, h]) => [`s06-letzte-frage-${station}.R`, h.solution])),
};
mkdirSync(out, { recursive: true });
for (const [name, code] of Object.entries(scripts)) writeFileSync(join(out, name), withFile(code));
console.log(`${Object.keys(scripts).length} Skripte nach ${out} geschrieben.`);
