import { isMissingCode, type SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { ben, S02_VARS, SHEET_IDS, type Entry, type S02Var, type Sheet, type SheetId, type Soll } from './content';

export type Entries = Record<SheetId, Record<S02Var, string>>;
export type S02State = {
  mode: WorkMode;
  entries: Entries;
  /** Erfassungsregeln für offene Zellen, Schlüssel „Bogen.Variable“. */
  rules: Record<string, string>;
  /** Schlichtung der Doppelerfassung, Schlüssel „Bogen.Variable“. */
  settled: Record<string, 'mine' | 'other'>;
  /** Eigene Zahl vor „Übernehmen“, damit die Entscheidung umkehrbar bleibt. */
  kept: Record<string, string>;
  partnerCode: string;
  numbers: { mfn: string; dk: string; afd: string };
  plenumRule: string;
  /** Erst nach „Erfassung abschließen“ werden eindeutige Zellen bewertet. */
  graded: boolean;
  revealed: boolean;
};

export const emptyEntries = (): Entries => Object.fromEntries(SHEET_IDS.map(id => [id, Object.fromEntries(S02_VARS.map(v => [v, '']))])) as Entries;
export const initialS02 = (): S02State => ({
  mode: 'solo', entries: emptyEntries(), rules: {}, settled: {}, kept: {}, partnerCode: '', numbers: { mfn: '', dk: '', afd: '' }, plenumRule: '', graded: false, revealed: false,
});
const cellKey = (sheet: SheetId, variable: S02Var) => `${sheet}.${variable}`;
const KEY = /^[123]\.(pa02a|pa01|pt03|st01|pv01|ls01)$/;

export function parseS02(raw: unknown): S02State {
  const r = record(raw), e = record(r.entries), n = record(r.numbers);
  const entries = emptyEntries();
  for (const id of SHEET_IDS) { const row = record(e[id]); for (const v of S02_VARS) entries[id][v] = str(row[v], 8); }
  const rules: Record<string, string> = {}, settled: Record<string, 'mine' | 'other'> = {}, kept: Record<string, string> = {};
  for (const [k, v] of Object.entries(record(r.rules))) if (KEY.test(k)) rules[k] = str(v, 300);
  for (const [k, v] of Object.entries(record(r.settled))) if (KEY.test(k) && (v === 'mine' || v === 'other')) settled[k] = v;
  for (const [k, v] of Object.entries(record(r.kept))) if (KEY.test(k)) kept[k] = str(v, 8);
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'), entries, rules, settled, kept, partnerCode: str(r.partnerCode, 400),
    numbers: { mfn: str(n.mfn, 12), dk: str(n.dk, 12), afd: str(n.afd, 12) }, plenumRule: str(r.plenumRule, 300),
    graded: bool(r.graded), revealed: bool(r.revealed),
  };
}

export function statusS02(s: S02State): TaskStatus {
  const cells = SHEET_IDS.flatMap(id => S02_VARS.map(v => s.entries[id][v]));
  if (cells.every(c => c.trim()) && s.numbers.mfn && s.numbers.dk && s.numbers.afd) return 'done';
  return cells.some(c => c.trim()) || s.numbers.mfn || s.numbers.afd ? 'running' : 'open';
}

/* ---------- Zellen prüfen ---------- */

export type CellCheck = { state: 'empty'; message: string } | { state: 'invalid'; message: string } | { state: 'ok'; code: number };

export function checkCell(sav: SavFile, variable: S02Var, input: string): CellCheck {
  if (!input.trim()) return { state: 'empty', message: 'Eine leere Zelle wird in R zu einem namenlosen NA. Der ALLBUS speichert, warum etwas fehlt.' };
  const x = parseNumber(input);
  if (x === null) return { state: 'invalid', message: 'Bitte den Code als Zahl eintragen – das Wort dazu steht im Codebuch.' };
  if (!Number.isInteger(x)) return { state: 'invalid', message: `Ein Doppelkreuz ist eine Entscheidung, keine Rechnung: ${de(x)} hat kein Label.` };
  const v = sav.byName.get(variable);
  if (v && !v.valueLabels.has(x)) return { state: 'invalid', message: `${variable} hat keinen Code ${x}.` };
  return { state: 'ok', code: x };
}

/** Übersetzt ein Label oder einen Wert in den Code der geladenen Datei. */
function resolve(sav: SavFile, variable: S02Var, e: Soll | Entry): number | null {
  if (e.kind === 'value') return e.value;
  if (e.kind !== 'label') return null;
  const hit = [...(sav.byName.get(variable)?.valueLabels ?? [])].find(([, l]) => l.toUpperCase() === e.label.toUpperCase());
  return hit ? hit[0] : null;
}

export type CellGrade = { status: 'match' | 'mismatch' | 'open' | 'invalid' | 'empty'; message?: string };

export function gradeCell(sav: SavFile, sheet: Sheet, variable: S02Var, input: string): CellGrade {
  const check = checkCell(sav, variable, input);
  if (check.state !== 'ok') return { status: check.state, message: check.message };
  const soll = sheet.cells[variable].soll;
  if (soll.kind === 'open') return { status: 'open', message: 'Hier musst du entscheiden. Schreib deine Regel dazu, damit die nächste Person genauso erfasst.' };
  const want = resolve(sav, variable, soll);
  if (want === check.code) return { status: 'match' };
  const v = sav.byName.get(variable)!;
  if (soll.kind === 'label' && /^TNZ/i.test(soll.label)) return { status: 'mismatch', message: `Diese Frage stand in Version ${sheet.version} gar nicht auf dem Bogen. Welcher Code sagt „nicht gefragt“?` };
  if (soll.kind === 'value' && soll.value === 0 && isMissingCode(v, check.code)) return { status: 'mismatch', message: 'Die 0 ist hier eine gültige Antwort (ganz unzufrieden), keine fehlende Angabe.' };
  return { status: 'mismatch', message: 'Das passt nicht zum Codebuch. Welche Zahl steht dort beim angekreuzten Wort – und in welche Richtung läuft die Skala?' };
}

/* ---------- Doppelerfassung ---------- */

export function benEntries(sav: SavFile): Entries {
  const out = emptyEntries();
  for (const id of SHEET_IDS) for (const v of S02_VARS) {
    const code = resolve(sav, v, ben[id][v]);
    out[id][v] = code === null ? '' : String(code);
  }
  return out;
}

const same = (a: string, b: string) => {
  const x = parseNumber(a), y = parseNumber(b);
  return x === null || y === null ? a.trim() === b.trim() : x === y;
};

export function diffEntries(a: Entries, b: Entries): { sheet: SheetId; variable: S02Var }[] {
  return SHEET_IDS.flatMap(sheet => S02_VARS.filter(v => !same(a[sheet][v], b[sheet][v])).map(variable => ({ sheet, variable })));
}

/** Kompakter Zeilencode zum Abtippen in der Partnervariante: „S02:1,4,…“ mit 18 Werten. */
export const encodeRow = (e: Entries) => `S02:${SHEET_IDS.flatMap(id => S02_VARS.map(v => e[id][v].trim())).join(',')}`;

export function decodeRow(code: string): Entries | null {
  const m = /^S02:(.*)$/.exec(code.trim());
  if (!m) return null;
  const values = m[1].split(',');
  if (values.length !== SHEET_IDS.length * S02_VARS.length) return null;
  const out = emptyEntries();
  SHEET_IDS.forEach((id, i) => S02_VARS.forEach((v, j) => { out[id][v] = values[i * S02_VARS.length + j].trim(); }));
  return out;
}

/* ---------- Die drei Zahlen aus R ---------- */

export function countCode(sav: SavFile, variable: string, code: number, mode?: number): number {
  const v = sav.byName.get(variable), m = sav.byName.get('mode');
  if (!v) return 0;
  let n = 0;
  v.values.forEach((x, i) => { if (x === code && (mode === undefined || m?.values[i] === mode)) n++; });
  return n;
}

export function scanCode(sav: SavFile, code: number) {
  const m = sav.byName.get('mode');
  const modes = [...new Set(Array.from(m?.values ?? []))].filter(x => !Number.isNaN(x)).sort((a, b) => a - b);
  const byMode = modes.map(x => ({ label: m?.valueLabels.get(x) ?? String(x), n: 0 }));
  let total = 0, variables = 0;
  for (const v of sav.variables) {
    if (v.kind !== 'numeric' || v.name === 'mode') continue;
    let hit = false;
    v.values.forEach((x, i) => { if (x === code) { total++; hit = true; const k = modes.indexOf(m?.values[i] ?? NaN); if (k >= 0) byMode[k].n++; } });
    if (hit) variables++;
  }
  return { total, variables, byMode };
}

/** Position eines Codes nach to_numeric(to_label(x)) in mariposa 0.7.3: gültige Codes, die vorkommen, fortlaufend nummeriert
 *  (so erscheint es für den ALLBUS, in dem alle Missing-Codes vorkommen). Neuere mariposa-Versionen behalten die Originalcodes. */
export function factorPosition(sav: SavFile, variable: string): Map<number, number> {
  const v = sav.byName.get(variable);
  if (!v) return new Map();
  const present = new Set(Array.from(v.values).filter(x => !isMissingCode(v, x)));
  const codes = [...v.valueLabels.keys()].filter(c => present.has(c)).sort((a, b) => a - b);
  return new Map(codes.map((c, i) => [c, i + 1]));
}

export function checkNumbers(sav: SavFile, numbers: S02State['numbers']): Note[] {
  const notes: Note[] = [];
  const mfn = parseNumber(numbers.mfn), dk = parseNumber(numbers.dk), afd = parseNumber(numbers.afd);
  const wantMfn = countCode(sav, 'pa01', -42, 4), elsewhere = countCode(sav, 'pa01', -42) - wantMfn;
  if (mfn !== null) notes.push(mfn === wantMfn
    ? { tone: 'ok', text: `Stimmt: ${wantMfn} Papierbögen haben bei links–rechts mehrere Kreuze. In allen anderen Modi zusammen: ${elsewhere}.` }
    : { tone: 'warn', text: 'Zähl in der Papier-Teilmenge die Zeilen mit −42 bei pa01.' });
  const wantDk = countCode(sav, 'st01', -8, 4);
  if (dk !== null) notes.push(dk === wantDk
    ? { tone: 'ok', text: `Stimmt: ${wantDk}. ${wantDk === 0 ? 'Das Codebuch listet „weiß nicht“, auf Papier kommt es nie vor. ' : ''}Was heißt das für deine Randnotiz?` }
    : { tone: 'warn', text: 'Schau in der Papier-Teilmenge bei st01 nach dem Code −8.' });
  const wantAfd = factorPosition(sav, 'pv01').get(42);
  if (afd !== null && wantAfd !== undefined) notes.push(afd === wantAfd
    ? { tone: 'ok', text: `Stimmt: Nach dem Umwandeln trägt die AfD die ${wantAfd}. Codes sind Namen, keine Rangplätze – beim Umwandeln wird neu durchnummeriert.` }
    : afd === 42
      ? { tone: 'ok', text: `Stimmt für deine mariposa-Version: Sie stellt beim Umwandeln die Originalcodes wieder her. Ältere Versionen nummerieren neu durch – dann trägt die AfD die ${wantAfd}. Codes sind Namen, keine Rangplätze.` }
      : { tone: 'warn', text: 'Vergleiche in der Häufigkeitstabelle die Zeile der AfD in pv01 und in partei_zahl.' });
  return notes;
}

/* ---------- Ergebnis ---------- */

export function plenumLines(s: S02State): [string, string][] {
  const row = S02_VARS.map(v => s.entries['2'][v].trim() || '–').join(' | ');
  const rule = s.plenumRule.trim() || Object.values(s.rules).find(r => r.trim()) || '';
  return [['Zeile für Bogen 2', row], ['Meine Regel', rule]];
}

export { cellKey };
