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
import { INPUTS as S08_INPUTS } from '../src/tasks/s08-automat/content';
import { rSolution as s08Solution } from '../src/tasks/s08-automat/domain';
import { CONTROL_IDS as S09_CONTROLS, GROUP_IDS as S09_REFS } from '../src/tasks/s09-mitgenommen/content';
import { rSolution as s09Solution } from '../src/tasks/s09-mitgenommen/domain';

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
  ...Object.fromEntries(S08_INPUTS.map(i => [`s08-automat-${i.id}.R`, s08Solution(i)])),
  ...Object.fromEntries(S09_REFS.map(r => [`s09-mitgenommen-ref${r}.R`, s09Solution(r)])),
  's09-mitgenommen-alle-kontrollen.R': s09Solution(4, S09_CONTROLS),
};
mkdirSync(out, { recursive: true });
for (const [name, code] of Object.entries(scripts)) writeFileSync(join(out, name), withFile(code));
console.log(`${Object.keys(scripts).length} Skripte nach ${out} geschrieben.`);
