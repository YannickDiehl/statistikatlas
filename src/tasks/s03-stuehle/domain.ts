import { isMissingCode, type SavFile, type SavVariable } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, near, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { CHAIR_CODES, SELECTIONS, type Selection } from './content';

export type Measure = 'mean' | 'median';
export type Sign = { value: string; measure: Measure | ''; selection: Selection | ''; right: string };
export type S03State = {
  mode: WorkMode;
  /** Halbsatz je Missing-Code: Wer ist das? */
  who: Record<string, string>;
  /** Missing-Codes, die einen Stuhl bekommen. */
  rule: number[];
  reasons: { dk: string; nw: string };
  /** Stühle je Code, als Eingabetext. */
  seats: Record<string, string>;
  built: boolean;
  hallText: string;
  sign: Sign;
};

export const initialS03 = (): S03State => ({
  mode: 'solo', who: {}, rule: [], reasons: { dk: '', nw: '' }, seats: {}, built: false, hallText: '',
  sign: { value: '', measure: '', selection: '', right: '' },
});

const CODE_KEY = /^-?\d{1,3}$/;
export function parseS03(raw: unknown): S03State {
  const r = record(raw), reasons = record(r.reasons), sign = record(r.sign);
  const who: Record<string, string> = {}, seats: Record<string, string> = {};
  for (const [k, v] of Object.entries(record(r.who))) if (CODE_KEY.test(k)) who[k] = str(v, 200);
  for (const [k, v] of Object.entries(record(r.seats))) if (CODE_KEY.test(k)) seats[k] = str(v, 6);
  const rule = Array.isArray(r.rule) ? r.rule.filter((c): c is number => (CHAIR_CODES as readonly number[]).includes(c as number)) : [];
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'), who, rule: [...new Set(rule)],
    reasons: { dk: str(reasons.dk, 300), nw: str(reasons.nw, 300) }, seats, built: bool(r.built), hallText: str(r.hallText, 400),
    sign: {
      value: str(sign.value, 12), measure: oneOf(sign.measure, ['mean', 'median', ''] as const, ''),
      selection: oneOf(sign.selection, ['gefragt', 'vollzeit', 'teilzeit', 'alle0', ''] as const, ''), right: str(sign.right, 6),
    },
  };
}

export function statusS03(s: S03State): TaskStatus {
  if (s.built && s.hallText.trim() && s.sign.value.trim() && s.sign.measure && s.sign.selection && s.sign.right.trim()) return 'done';
  const texts = [...Object.values(s.who), ...Object.values(s.seats), s.reasons.dk, s.reasons.nw, s.hallText, s.sign.value, s.sign.right];
  return s.built || s.rule.length || texts.some(t => t.trim()) || s.sign.measure || s.sign.selection ? 'running' : 'open';
}

/* ---------- Saal 1: Stühle ---------- */

export function rawCounts(v: SavVariable): Map<number, number> {
  const out = new Map<number, number>();
  for (const x of v.values) if (!Number.isNaN(x)) out.set(x, (out.get(x) ?? 0) + 1);
  return out;
}

/** Gültige, gelabelte Codes, die in den Daten vorkommen. */
export function validCodes(v: SavVariable): number[] {
  const counts = rawCounts(v);
  return [...v.valueLabels.keys()].filter(c => !isMissingCode(v, c) && counts.has(c)).sort((a, b) => a - b);
}

/** Hare-Verfahren: ganze Anteile, Reststühle nach größten Resten (bei Gleichstand die größere Gruppe).
 *  Ganzzahlig gerechnet, damit Gleichstände exakt erkannt werden. */
export function largestRemainder(groups: [number, number][], total = 100): Map<number, number> {
  const sum = groups.reduce((a, [, n]) => a + n, 0);
  if (!sum) return new Map(groups.map(([c]) => [c, 0]));
  const quotas = groups.map(([code, n]) => ({ code, n, whole: Math.floor(n * total / sum), remainder: n * total % sum }));
  const out = new Map(quotas.map(g => [g.code, g.whole]));
  let rest = total - [...out.values()].reduce((a, b) => a + b, 0);
  for (const g of [...quotas].sort((a, b) => b.remainder - a.remainder || b.n - a.n || a.code - b.code)) {
    if (rest-- <= 0) break;
    out.set(g.code, out.get(g.code)! + 1);
  }
  return out;
}

export const seatsFor = (counts: Map<number, number>, valid: number[], rule: readonly number[]) =>
  largestRemainder([...valid, ...rule].map(c => [c, counts.get(c) ?? 0] as [number, number]));

const SHORT: Record<number, string> = { [-8]: 'weiß nicht', [-7]: 'verweigert', [-50]: 'nicht wahlberechtigt', [-9]: 'keine Angabe', [-42]: 'Datenfehler' };
export const codeName = (v: SavVariable, code: number) => SHORT[code] ?? v.valueLabels.get(code) ?? String(code);

export function describeRule(rule: readonly number[]): string {
  if (!rule.length) return 'nur klare Antworten';
  if (CHAIR_CODES.every(c => rule.includes(c))) return 'alle Befragten';
  return `mit ${CHAIR_CODES.filter(c => rule.includes(c)).map(c => `„${SHORT[c]}“`).join(', ')}`;
}
const nested = (s: string) => s.replace(/„/g, '‚').replace(/“/g, '‘');

function subsets(codes: readonly number[]): number[][] {
  return Array.from({ length: 1 << codes.length }, (_, mask) => codes.filter((_, i) => mask & (1 << i)));
}

export type SeatDiagnosis = { kind: 'ok' | 'raw' | 'rounded' | 'sum' | 'otherRule' | 'nomatch'; sum: number; notes: Note[] };

export function diagnoseSeats(v: SavVariable, ticked: readonly number[], entered: Map<number, number>): SeatDiagnosis {
  const counts = rawCounts(v), valid = validCodes(v);
  const sum = [...entered.values()].reduce((a, b) => a + b, 0);
  const get = (c: number) => entered.get(c) ?? 0;
  const within = (want: Map<number, number>, tol: number) => [...new Set([...want.keys(), ...entered.keys()])].every(c => Math.abs(get(c) - (want.get(c) ?? 0)) <= tol);

  const expected = seatsFor(counts, valid, ticked);
  if (sum === 100 && within(expected, 1)) return { kind: 'ok', sum, notes: [{ tone: 'ok', text: `Dein Saal steht: 100 Stühle nach der Regel „${nested(describeRule(ticked))}“.` }] };

  const all = [...counts.values()].reduce((a, b) => a + b, 0);
  const raw = new Map(valid.map(c => [c, Math.round((counts.get(c) ?? 0) / all * 100)]));
  if (valid.every(c => get(c) === raw.get(c)) && CHAIR_CODES.every(c => !entered.get(c))) {
    return { kind: 'raw', sum, notes: [{ tone: 'warn', text: `Du hast Rohprozente abgelesen – die Spalte, die alle Befragten zählt. ${100 - sum} Stühle fehlen. Wo sitzen diese Menschen?` }] };
  }

  const base = [...valid, ...ticked].reduce((a, c) => a + (counts.get(c) ?? 0), 0);
  const rounded = new Map([...valid, ...ticked].map(c => [c, Math.round((counts.get(c) ?? 0) / base * 100)]));
  if (sum !== 100 && within(rounded, 0)) {
    const diff = [...expected.keys()].find(c => (rounded.get(c) ?? 0) !== (expected.get(c) ?? 0));
    const who = diff === undefined ? 'jemand' : `„${codeName(v, diff)}“`;
    const text = sum > 100
      ? `${sum} Stühle – einer muss aufstehen. Nach größten Resten wäre es ${who}. Parlamente streiten über solche Verfahren.`
      : `${sum} Stühle – einer bleibt frei. Nach größten Resten bekäme ${who} ihn.`;
    return { kind: 'rounded', sum, notes: [{ tone: 'hint', text }] };
  }

  // Nah an der angekreuzten Regel, aber die Summe stimmt nicht (z. B. Prozente abgeschnitten statt gerundet).
  if (within(expected, 1)) {
    const off = sum < 100
      ? `${100 - sum === 1 ? 'einer bleibt' : `${100 - sum} bleiben`} frei. Hast du Prozente abgeschnitten statt gerundet?`
      : `${sum - 100} zu viel. Prüf die Summe.`;
    return { kind: 'sum', sum, notes: [{ tone: 'warn', text: `${sum} Stühle statt 100 – ${off} Deine Zahlen liegen nah an der Regel „${nested(describeRule(ticked))}“; jeder Stuhl steht für ein Prozent, zusammen sind es genau 100.` }] };
  }

  let best: { rule: number[]; distance: number } | null = null;
  for (const rule of subsets(CHAIR_CODES)) {
    const want = seatsFor(counts, valid, rule);
    if (!within(want, 1)) continue;
    const distance = [...want.keys()].reduce((a, c) => a + Math.abs(get(c) - want.get(c)!), 0);
    if (!best || distance < best.distance) best = { rule, distance };
  }
  if (best) return { kind: 'otherRule', sum, notes: [{ tone: 'warn', text: `Deine Zahlen passen zur Regel „${nested(describeRule(best.rule))}“, angekreuzt hast du „${nested(describeRule(ticked))}“. Hast du vor fre() anders gefiltert?` }] };
  return { kind: 'nomatch', sum, notes: [{ tone: 'warn', text: 'Diese Stuhlzahlen passen zu keiner Regel. Filtere in R nach deiner Regel und lies in fre() die Spalte „Valid %“ ab.' }] };
}

/* ---------- Saal 2: Stuhlreihe ---------- */

export function hoursFor(sav: SavFile, selection: Selection): number[] {
  const h = sav.byName.get('dw15'), w = sav.byName.get('work');
  if (!h) return [];
  const out: number[] = [];
  h.values.forEach((x, i) => {
    const work = w?.values[i];
    if (selection === 'alle0' && x === -10) { out.push(0); return; }
    if (isMissingCode(h, x)) return;
    if (selection === 'vollzeit' && work !== 1) return;
    if (selection === 'teilzeit' && work !== 2) return;
    out.push(x);
  });
  return out;
}

/** Quantil nach SPSS (Typ 6, HAVERAGE) – so rechnet mariposa::describe(). Erwartet sortierte Werte. */
export function quantile6(sorted: number[], p: number): number {
  const n = sorted.length;
  if (!n) return NaN;
  const h = (n + 1) * p;
  if (h <= 1) return sorted[0];
  if (h >= n) return sorted[n - 1];
  const lo = Math.floor(h);
  return sorted[lo - 1] + (h - lo) * (sorted[lo] - sorted[lo - 1]);
}

export type Describe = { n: number; mean: number; median: number; q1: number; q3: number; sd: number; skew: number; above: number };

export function describeHours(values: number[]): Describe {
  const x = [...values].sort((a, b) => a - b), n = x.length;
  const mean = x.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(x.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  const skew = n > 2 && sd > 0 ? n / ((n - 1) * (n - 2)) * x.reduce((a, b) => a + ((b - mean) / sd) ** 3, 0) : NaN;
  return { n, mean, median: quantile6(x, 0.5), q1: quantile6(x, 0.25), q3: quantile6(x, 0.75), sd, skew, above: x.filter(v => v > mean).length / n };
}

const selectionShort = (id: Selection | '') => SELECTIONS.find(s => s.id === id)?.short ?? '';
const measureName = (m: Measure) => m === 'mean' ? 'Mittelwert' : 'Median';

export function checkSign(sav: SavFile, sign: Sign): Note[] {
  const value = parseNumber(sign.value);
  if (value === null) return [];
  const notes: Note[] = [];
  const stats = Object.fromEntries(SELECTIONS.map(s => [s.id, describeHours(hoursFor(sav, s.id))])) as Record<Selection, Describe>;
  const match = SELECTIONS.flatMap(s => (['median', 'mean'] as Measure[]).map(m => ({ s: s.id, m }))).find(({ s, m }) => near(value, stats[s][m], 0.05));
  notes.push(match
    ? { tone: 'hint', text: `${de(value, Number.isInteger(value) ? 0 : 1)} ist der ${measureName(match.m)} ${selectionShort(match.s)}.` }
    : { tone: 'warn', text: 'Diese Zahl finde ich unter keiner Fallauswahl. Prüf in R Filter und Maß.' });
  if (sign.measure && sign.selection) {
    const want = stats[sign.selection][sign.measure];
    notes.push(near(value, want, 0.05)
      ? { tone: 'ok', text: `Passt zu deiner Angabe: ${measureName(sign.measure)} ${selectionShort(sign.selection)}.` }
      : { tone: 'warn', text: `Deine Zahl ist nicht der ${measureName(sign.measure)} ${selectionShort(sign.selection)} – der liegt bei ${de(want)}.` });
    const right = parseNumber(sign.right);
    if (right !== null) {
      const wantRight = Math.round(stats[sign.selection].above * 100);
      notes.push(Math.abs(right - wantRight) <= 1
        ? { tone: 'ok', text: `Stimmt: ${wantRight} von 100 Stühlen stehen rechts vom Durchschnitt. Der Durchschnitt ist nicht die Mitte.` }
        : { tone: 'warn', text: 'Zähl mit filter(dw15 > Mittelwert) %>% nrow() und rechne auf 100 Stühle um.' });
    }
  }
  return notes;
}

/* ---------- Ergebnis ---------- */

export function plenumLines(s: S03State): [string, string][] {
  const seat = (code: number) => (code < 0 && !s.rule.includes(code) ? '' : s.seats[String(code)]?.trim()) || '–';
  const sign = s.sign.value.trim() && s.sign.measure
    ? `${s.sign.value.trim()} Stunden (${measureName(s.sign.measure)} ${selectionShort(s.sign.selection)})`.replace(' )', ')')
    : '';
  return [
    ['Stuhlregel', describeRule(s.rule)],
    ['Stühle CDU/CSU · weiß nicht · AfD', `${seat(1)} · ${seat(-8)} · ${seat(42)}`],
    ['Schild', sign],
    ['Stühle rechts vom Durchschnitt', s.sign.right.trim()],
  ];
}
