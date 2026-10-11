import { isMissingCode, type SavFile, type SavVariable } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { oneOf, record, str, strList } from '../kit/storage';
import type { TaskStatus } from '../types';
import { ANTRAG_IDS, antraege, ERROR_PATTERNS, type Antrag, type AntragId } from './content';

export type Stamp = {
  decision: 'take' | 'ask' | null;
  variable: string;
  lowest: string;
  /** Eingetragene Zahl der gültigen Antworten. */
  valid: string;
  searches: string[];
  note: string;
};
export type S01State = {
  mode: WorkMode;
  cases: string;
  vars: string;
  stamps: Record<AntragId, Stamp>;
  idea: string;
  ideaStamp: Stamp;
  lesson: string;
};

export const emptyStamp = (): Stamp => ({ decision: null, variable: '', lowest: '', valid: '', searches: [], note: '' });
export const initialS01 = (): S01State => ({
  mode: 'solo', cases: '', vars: '',
  stamps: { horoskop: emptyStamp(), gefluechtete: emptyStamp(), politik: emptyStamp(), einsamkeit: emptyStamp() },
  idea: '', ideaStamp: emptyStamp(), lesson: '',
});

function parseStamp(raw: unknown): Stamp {
  const r = record(raw);
  return {
    decision: r.decision === 'take' || r.decision === 'ask' ? r.decision : null,
    // Früher hieß das Feld „asked“ (wem die Frage gestellt wurde); gespeicherte Eingaben werden übernommen.
    variable: str(r.variable, 40), lowest: str(r.lowest, 120), valid: str(r.valid ?? r.asked, 20),
    searches: strList(r.searches, 12, 60), note: str(r.note, 600),
  };
}

export function parseS01(raw: unknown): S01State {
  const r = record(raw), stamps = record(r.stamps);
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    cases: str(r.cases, 20), vars: str(r.vars, 20),
    stamps: Object.fromEntries(ANTRAG_IDS.map(id => [id, parseStamp(stamps[id])])) as Record<AntragId, Stamp>,
    idea: str(r.idea, 300), ideaStamp: parseStamp(r.ideaStamp), lesson: str(r.lesson, 600),
  };
}

const stampComplete = (s: Stamp) => s.decision === 'take' ? s.variable.trim() !== '' : s.decision === 'ask' && s.searches.filter(x => x.trim()).length >= 2;

export function statusS01(s: S01State): TaskStatus {
  if (ANTRAG_IDS.every(id => stampComplete(s.stamps[id]))) return 'done';
  const touched = s.cases || s.vars || s.idea || ANTRAG_IDS.some(id => s.stamps[id].decision !== null);
  return touched ? 'running' : 'open';
}

/* ---------- Suche wie mariposa::find_var() ---------- */

export type SearchResult = { ok: true; hits: SavVariable[]; notes: Note[] } | { ok: false; message: string };
const LETTER = /[A-Za-zÄÖÜäöüß]/;

/** Zeigt ein Treffer-Wort mit hervorgehobenem Suchteil, wenn das Suchwort mitten in einem anderen Wort beginnt (gemEINSAMer). */
function wordPart(label: string, re: RegExp): string {
  const m = re.exec(label);
  if (!m || !m[0] || !LETTER.test(label[m.index - 1] ?? '')) return '';
  const end0 = m.index + m[0].length;
  let start = m.index;
  while (start > 0 && LETTER.test(label[start - 1])) start--;
  let end = end0;
  while (end < label.length && LETTER.test(label[end])) end++;
  return label.slice(start, m.index).toLocaleLowerCase('de') + m[0].toLocaleUpperCase('de') + label.slice(end0, end).toLocaleLowerCase('de');
}

export function findVar(sav: SavFile, pattern: string): SearchResult {
  const p = pattern.trim();
  if (!p) return { ok: false, message: 'Gib ein Suchwort ein.' };
  let re: RegExp;
  try { re = new RegExp(p, 'i'); } catch { return { ok: false, message: 'Das Suchwort enthält Sonderzeichen, die R als Suchmuster liest. Nimm ein einfaches Wort.' }; }
  const hits = sav.variables.filter(v => re.test(v.name) || re.test(v.label));
  const notes: Note[] = [];
  if (!hits.length && /[äöüÄÖÜß]/.test(p)) notes.push({ tone: 'hint', text: 'Die Labels im ALLBUS stehen in Großbuchstaben ohne Umlaute (zum Beispiel FLUECHTL.). Versuch es mit ae, oe, ue oder einem Wortstamm.' });
  const parts = [...new Set(hits.map(v => wordPart(v.label, re)).filter(Boolean))];
  if (parts.length) notes.push({ tone: 'hint', text: `Wortteil-Treffer: ${parts.join(', ')} – dein Suchwort steckt mitten in einem anderen Wort.` });
  return { ok: true, hits, notes };
}

/* ---------- Codebuch lesen ---------- */

const tnzCodes = (v: SavVariable) => [...v.valueLabels].filter(([, label]) => /^TNZ/i.test(label)).map(([code]) => code);

/** Wie vielen Befragten wurde die Frage gestellt? Alle außer „TNZ: trifft nicht zu“ (Split, Filter, Modus). */
export function askedCount(v: SavVariable): number {
  const tnz = new Set(tnzCodes(v));
  let n = 0;
  for (const x of v.values) if (!tnz.has(x)) n++;
  return n;
}

/** Gültige Antworten: alle Werte, die kein fehlender Code sind. */
export const validCount = (v: SavVariable) => Array.from(v.values).filter(x => !isMissingCode(v, x)).length;

/** Fehlende Werte nach Code, die häufigsten zuerst (für die Rückmeldung). */
function missingBreakdown(v: SavVariable, skip: number[] = []): { label: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const x of v.values) if (isMissingCode(v, x) && !Number.isNaN(x) && !skip.includes(x)) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ label: v.valueLabels.get(code) ?? String(code), count }));
}

export function lowestLabel(v: SavVariable): string | null {
  const valid = [...v.valueLabels].filter(([code]) => !isMissingCode(v, code)).sort((a, b) => a[0] - b[0]);
  return valid[0]?.[1] ?? null;
}

const norm = (s: string) => s.toLocaleLowerCase('de').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const labelMatches = (input: string, label: string) => {
  const a = norm(input), b = norm(label);
  return a.length >= 3 && (b.includes(a) || a.includes(b));
};
const n = (x: number) => x.toLocaleString('de-DE');
const hat = (x: number) => x === 1 ? 'hat' : 'haben';

/* ---------- Stempel spiegeln ---------- */

export function checkStamp(sav: SavFile, antrag: Antrag | null, stamp: Stamp): Note[] {
  if (stamp.decision === 'take') {
    const name = stamp.variable.trim().toLowerCase();
    if (!name) return [{ tone: 'hint', text: 'Welche Variable übernimmst du? Trag ihren Namen ein, zum Beispiel rh08b.' }];
    const v = sav.byName.get(name);
    if (!v) return [{ tone: 'warn', text: `Eine Variable „${stamp.variable.trim()}“ gibt es im ALLBUS nicht. Prüf die Schreibweise mit find_var().` }];
    const notes: Note[] = [{ tone: antrag?.fits?.includes(name) ? 'ok' : 'hint', text: antrag?.catalog[name] ?? `${name} heißt im Datensatz „${v.label}“. Passt das zur Idee?` }];
    if (stamp.lowest.trim()) {
      const lowest = lowestLabel(v);
      notes.push(lowest && labelMatches(stamp.lowest, lowest)
        ? { tone: 'ok', text: `Stimmt: Der niedrigste Wert heißt „${lowest}“.` }
        : { tone: 'warn', text: `Das passt nicht zum Label des niedrigsten gültigen Werts. Schau mit codebook(allbus, ${name}) nach.` });
    }
    const given = parseNumber(stamp.valid);
    if (given !== null) {
      const valid = validCount(v), asked = askedCount(v), never = sav.nCases - asked;
      const split = never > 0 ? ` Gestellt wurde die Frage nur ${n(asked)} Befragten: ${n(never)} ${hat(never)} sie nie gehört (${tnzCodes(v).map(c => v.valueLabels.get(c)).join(', ')}).` : '';
      const list = (skip: number[] = []) => missingBreakdown(v, skip).slice(0, 4).map(m => `${m.label} (n = ${n(m.count)})`).join(', ');
      if (given === valid) notes.push({ tone: 'ok', text: `Stimmt: ${n(valid)} gültige Antworten.${split}` });
      else if (given === asked) notes.push({ tone: 'hint', text: `Fast! ${n(asked)} Befragten wurde die Frage gestellt. ${n(asked - valid)} von ihnen ${hat(asked - valid)} nicht gültig geantwortet: ${list(tnzCodes(v))}. Zieh auch sie ab.` });
      else if (given === sav.nCases) notes.push({ tone: 'warn', text: `Das sind alle Befragten. Zieh die fehlenden Werte ab: ${list()}.` });
      else notes.push({ tone: 'warn', text: `Diese Zahl finde ich nicht. Zähl nach: alle Befragten minus alle fehlenden Werte (die negativen Codes im Codebuch, etwa „KEINE ANGABE“ oder „TNZ“).` });
    }
    return notes;
  }
  if (stamp.decision === 'ask') {
    if (stamp.searches.filter(s => s.trim()).length < 2) return [{ tone: 'hint', text: 'Zeig, wie du gesucht hast: Trag mindestens zwei Suchwörter ein, die du in R ausprobiert hast.' }];
    if (!antrag) return [{ tone: 'ok', text: 'Deine Suche ist dokumentiert.' }];
    if (antrag.onAsk.needsReason && stamp.note.trim().length < 10) return [{ tone: 'hint', text: `${antrag.onAsk.text} Wenn du bei „beauftragen“ bleibst, begründe es in einem Satz.` }];
    if (antrag.onAsk.needsReason) return [{ tone: 'ok', text: 'Einspruch zur Kenntnis genommen. Deine Begründung steht im Prüfbericht.' }];
    return [{ tone: antrag.onAsk.tone, text: antrag.onAsk.text }];
  }
  return [];
}

/* ---------- Handschlag und Fehler-Decoder ---------- */

export function checkHandshake(sav: SavFile, cases: string, vars: string): Note[] {
  const c = parseNumber(cases), v = parseNumber(vars), notes: Note[] = [];
  if (c !== null) notes.push(c === sav.nCases
    ? { tone: 'ok', text: `${n(sav.nCases)} Fälle – das sind alle Befragten.` }
    : { tone: 'warn', text: 'Die Fallzahl steht im Environment hinter allbus: „… obs.“' });
  if (v !== null) notes.push(v === sav.variables.length
    ? { tone: 'ok', text: `Handschlag geglückt: ${n(sav.variables.length)} Variablen. R und Browser sehen dieselbe Datei.` }
    : { tone: 'warn', text: 'Die Zahl der Variablen steht im Environment hinter „obs. of“.' });
  return notes;
}

export function decodeError(message: string): { cause: string; fix: string } | null {
  const hit = ERROR_PATTERNS.find(e => e.pattern.test(message));
  return hit ? { cause: hit.cause, fix: hit.fix } : null;
}

/* ---------- Ergebnis ---------- */

export function plenumLines(s: S01State): [string, string][] {
  const asks = ANTRAG_IDS.filter(id => s.stamps[id].decision === 'ask').length;
  const politik = s.stamps.politik;
  return [
    ['Muss das Büro beauftragen', `${asks} von 4`],
    ['Idee 3 (Politik) übernommen als', politik.decision === 'take' ? politik.variable.trim() : politik.decision === 'ask' ? 'beauftragt' : ''],
    ['Eigene Idee', s.idea.trim()],
  ];
}

function stampLine(stamp: Stamp): string {
  if (stamp.decision === 'take') return `Stempel: übernehmen · Variable ${stamp.variable.trim() || '–'} · niedrigster Wert: ${stamp.lowest.trim() || '–'} · gültige Antworten: ${stamp.valid.trim() || '–'}`;
  if (stamp.decision === 'ask') return `Stempel: beauftragen · gesucht: ${stamp.searches.map(x => `„${x}“`).join(', ') || '–'}${stamp.note.trim() ? ` · Begründung: ${stamp.note.trim()}` : ''}`;
  return 'Stempel: offen';
}

export function reportMarkdown(s: S01State): string {
  const parts = [
    '# Prüfbericht „Schon gefragt?“',
    '',
    'Büro einer Bundestagsabgeordneten · Daten: ALLBUScompact 2023 (ZA8831), GESIS',
    '',
    `Handschlag: ${s.cases.trim() || '–'} Fälle, ${s.vars.trim() || '–'} Variablen`,
    ...antraege.flatMap((a, i) => ['', `## Idee ${i + 1}: „${a.text}“`, stampLine(s.stamps[a.id])]),
    '', `## Eigene Idee: ${s.idea.trim() || '–'}`, stampLine(s.ideaStamp),
    '', '## Was mich am meisten in die Irre geführt hat', s.lesson.trim() || '–', '',
  ];
  return parts.join('\n');
}

export function rScript(s: S01State): string {
  const all = [...ANTRAG_IDS.map(id => s.stamps[id]), s.ideaStamp];
  const searches = [...new Set(all.flatMap(x => x.searches.map(w => w.trim()).filter(Boolean)))];
  const taken = [...new Set(all.filter(x => x.decision === 'take' && x.variable.trim()).map(x => x.variable.trim().toLowerCase()))];
  return [
    'library(mariposa)',
    '',
    'allbus <- read_spss(file.choose())',
    '',
    ...searches.map(w => `find_var(allbus, "${w.replace(/"/g, '')}")`),
    ...(taken.length ? ['', `codebook(allbus, ${taken.join(', ')})`] : []),
    '',
  ].join('\n');
}
