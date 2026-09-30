import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { corMatrix, describeGroups, oneSampleT, onewayAnova, tTest, tukeyHSD, type Anova, type CorMatrix, type OneSample, type TTest, type TukeyRow } from '../kit/means';
import { de, halfUnit, numberReadings } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { validValues } from '../kit/stats';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import {
  BALANCE_PAIRS, MATRIX_LABELS, PAIR_IDS, PAIR_MEANING, PAIRS, rSolution, TEXTS, VERSION_IDS, versionByCode, versionById, VERSIONS,
  type PairId, type VersionId,
} from './content';

/* ---------- Aufbereitung wie im Lösungsskript ---------- */

export type Scope = 'all' | 'online' | 'paper';
export const SCOPES: Scope[] = ['all', 'online', 'paper'];
export type GroupVar = 'rep' | 'amt' | 'version' | 'paper';
const GROUP_VARS: GroupVar[] = ['rep', 'amt', 'version', 'paper'];
/** ok = rec(xr21, "1=1; 2=0; else=NA"); raw = xr21 unverändert (1/2); reversed = ja und nein vertauscht; naAsNo = else=0 (keine Angabe zählt als Nein). */
export type Coding = 'ok' | 'raw' | 'reversed' | 'naAsNo';
const CODINGS: Coding[] = ['ok', 'raw', 'reversed', 'naAsNo'];

/** alle = filter(mode != 2) (online und Papier), online = mode == 3, Papier = mode == 4. */
const inScope = (mode: number, s: Scope) => Number.isFinite(mode) && (s === 'all' ? mode !== 2 : s === 'online' ? mode === 3 : mode === 4);

export type Prepared = {
  mode: Float64Array; version: Float64Array; half: Float64Array; age: Float64Array; w: Float64Array;
  y: Record<Coding, Float64Array>;
  g: Record<GroupVar, Float64Array>;
};

export function prepare(sav: SavFile): Prepared {
  const col = (name: string) => validValues(sav.byName.get(name)!);
  const xr21 = col('xr21'), version = col('splt23_3'), mode = col('mode');
  const map = (x: Float64Array, f: (v: number) => number) => Float64Array.from(x, f);
  return {
    mode, version, half: col('splt23_1'), age: col('age'), w: col('wghtpew'),
    y: {
      ok: map(xr21, v => (v === 1 ? 1 : v === 2 ? 0 : NaN)),
      raw: map(xr21, v => (v === 1 || v === 2 ? v : NaN)),
      reversed: map(xr21, v => (v === 1 ? 0 : v === 2 ? 1 : NaN)),
      naAsNo: map(xr21, v => (v === 1 ? 1 : 0)),
    },
    g: {
      rep: map(version, v => (v === 1 || v === 3 ? 0 : v === 2 || v === 4 ? 1 : NaN)),
      amt: map(version, v => (v === 1 || v === 2 ? 5 : v === 3 || v === 4 ? 10 : NaN)),
      version: map(version, v => (v >= 1 && v <= 4 ? v : NaN)),
      paper: map(mode, v => (v === 3 ? 0 : v === 4 ? 1 : NaN)),
    },
  };
}

/* ---------- Alle Rechenwege einmal je Datei ---------- */

export type ShareVariant = { scope: Scope; weighted: boolean; grouping: GroupVar | 'total'; level: number; coding: Coding; value: number; n: number };
export type TVariant = { scope: Scope; weighted: boolean; grouping: 'rep' | 'amt' | 'paper'; kind: 'welch' | 'student'; test: TTest; value: number };
export type RVariant = { scope: 'all' | 'online'; weighted: boolean; pair: PairId; value: number; p: number; n: number };
export type FVariant = { scope: Scope; weighted: boolean; kind: 'classical' | 'welch'; value: number; p: number; df1: number; df2: number };
export type TukeyKey = '2-1' | '3-1' | '4-1' | '3-2' | '4-2' | '4-3' | 'none';
export const TUKEY_KEYS: TukeyKey[] = ['2-1', '3-1', '4-1', '3-2', '4-2', '4-3'];

export type Computed = {
  shares: ShareVariant[];
  tests: TVariant[];
  rs: RVariant[];
  fs: FVariant[];
  matrix: { unweighted: CorMatrix; weighted: CorMatrix };
  anova: { online: Anova | null; onlineW: Anova | null };
  tukey: { online: TukeyRow[] | null; onlineW: TukeyRow[] | null };
  /** Fälle je Fassung online und auf Papier (wie crosstab(splt23_3, mode)). */
  cells: { online: number[]; paper: number[] };
  /** Quote je Fassung, online und ungewichtet, mit Intervall (wie t_test(zusage) nach filter()). */
  rates: (OneSample | null)[];
  /** Deckt sich der Betrag vollständig mit der Fragebogenhälfte splt23_1? */
  splitMatch: boolean;
};

export function compute(p: Prepared): Computed {
  const scoped = (x: Float64Array, s: Scope) => Float64Array.from(x, (v, i) => (inScope(p.mode[i], s) ? v : NaN));
  const shares: ShareVariant[] = [], tests: TVariant[] = [], rs: RVariant[] = [], fs: FVariant[] = [];
  for (const scope of SCOPES) {
    const ys = Object.fromEntries(CODINGS.map(k => [k, scoped(p.y[k], scope)])) as Record<Coding, Float64Array>;
    const gs = Object.fromEntries(GROUP_VARS.map(k => [k, scoped(p.g[k], scope)])) as Record<GroupVar, Float64Array>;
    const one = Float64Array.from(p.mode, () => 0);
    for (const weighted of [false, true]) {
      const w = weighted ? p.w : null;
      for (const coding of CODINGS) {
        const total = describeGroups(ys[coding], one, w)[0];
        if (total) shares.push({ scope, weighted, grouping: 'total', level: 0, coding, value: total.mean, n: total.n });
        for (const grouping of GROUP_VARS) for (const g of describeGroups(ys[coding], gs[grouping], w))
          shares.push({ scope, weighted, grouping, level: g.level, coding, value: g.mean, n: g.n });
      }
      for (const grouping of ['rep', 'amt', 'paper'] as const) {
        const test = tTest(ys.ok, gs[grouping], w);
        if (test) for (const kind of ['welch', 'student'] as const) tests.push({ scope, weighted, grouping, kind, test, value: test[kind].t });
      }
      const a = onewayAnova(ys.ok, gs.version, w);
      if (a) {
        fs.push({ scope, weighted, kind: 'classical', value: a.F, p: a.p, df1: a.dfBetween, df2: a.dfWithin });
        fs.push({ scope, weighted, kind: 'welch', value: a.welch.F, p: a.welch.p, df1: a.welch.df1, df2: a.welch.df2 });
      }
    }
  }
  const matrices = {} as Record<'all' | 'online', { unweighted: CorMatrix; weighted: CorMatrix }>;
  for (const scope of ['all', 'online'] as const) {
    const vars = [p.g.rep, p.g.amt, p.g.paper, p.age, p.y.ok].map(x => scoped(x, scope));
    matrices[scope] = { unweighted: corMatrix(vars), weighted: corMatrix(vars, p.w) };
    for (const weighted of [false, true]) {
      const m = matrices[scope][weighted ? 'weighted' : 'unweighted'];
      for (const pair of PAIRS) if (Number.isFinite(m.r[pair.i][pair.j]))
        rs.push({ scope, weighted, pair: pair.id, value: m.r[pair.i][pair.j], p: m.p[pair.i][pair.j], n: m.n[pair.i][pair.j] });
    }
  }
  const yOnline = scoped(p.y.ok, 'online'), vOnline = scoped(p.g.version, 'online');
  const count = (s: Scope) => VERSIONS.map(v => p.version.reduce((n, x, i) => n + (x === v.code && inScope(p.mode[i], s) ? 1 : 0), 0));
  let splitMatch = true;
  p.version.forEach((v, i) => { if (v >= 1 && v <= 4 && p.half[i] !== (v <= 2 ? 1 : 2)) splitMatch = false; });
  return {
    shares, tests, rs, fs,
    matrix: matrices.all,
    anova: { online: onewayAnova(yOnline, vOnline), onlineW: onewayAnova(yOnline, vOnline, p.w) },
    tukey: { online: tukeyHSD(yOnline, vOnline), onlineW: tukeyHSD(yOnline, vOnline, p.w) },
    cells: { online: count('online'), paper: count('paper') },
    rates: VERSIONS.map(v => oneSampleT(Float64Array.from(yOnline, (x, i) => (vOnline[i] === v.code ? x : NaN)))),
    splitMatch,
  };
}

/** Einmal je geladener Datei rechnen – auch wenn die Aufgabe neu eingeblendet wird. */
const computed = new WeakMap<SavFile, Computed>();
export function computeFor(sav: SavFile): Computed {
  let c = computed.get(sav);
  if (!c) computed.set(sav, (c = compute(prepare(sav))));
  return c;
}

/* ---------- Eingaben lesen ---------- */

const clean = (s: string) => s.replace(/prozentpunkte|prozent|pp\.?|%/gi, '').trim();
/** Eine Lesart der Eingabe: Wert und Toleranz (halbe Einheit der letzten eingegebenen Stelle). */
export type Reading = { value: number; tol: number };
export type Parsed = { kind: 'empty' } | { kind: 'text' } | { kind: 'coarse' } | { kind: 'ok'; readings: Reading[] } | { kind: 'below'; value: number };

/** Liest alle vertretbaren Lesarten (numberReadings: „7.590“ wie R gedruckt zuerst, als Tausenderpunkt danach)
 *  und behält die, die für das Feld genau genug sind. Keine übrig: zu grob. */
function readAll(input: string, keep: (x: number, decimals: number) => Reading | null): Parsed {
  const s = clean(input);
  if (!s) return { kind: 'empty' };
  const all = numberReadings(s);
  if (!all.length) return { kind: 'text' };
  const readings = all.map(r => keep(r.x, r.decimals)).filter((r): r is Reading => r !== null);
  return readings.length ? { kind: 'ok', readings } : { kind: 'coarse' };
}

/** Anteil: so, wie R ihn druckt (0,677 oder 0.677; mind. zwei Nachkommastellen) oder in Prozent (67,7; mind. eine). Ergebnis als Anteil. */
export const parseShare = (input: string) => readAll(input, (x, d) => (Math.abs(x) <= 2
  ? (d >= 2 ? { value: x, tol: halfUnit(d) } : null)
  : (d >= 1 ? { value: x / 100, tol: halfUnit(d) / 100 } : null)));

/** t, r, F: mindestens zwei Nachkommastellen, auch mit Dezimalpunkt wie in R (7.590). */
export const parseStat = (input: string) => readAll(input, (x, d) => (d >= 2 ? { value: x, tol: halfUnit(d) } : null));

/** p-Wert wie gedruckt: „0,046“, „0.046“, „,046“ oder „< 0,001“. */
export function parseP(input: string): Parsed {
  const s = clean(input).replace(/^p\s*/i, '').replace(/^=\s*/, '');
  if (s.startsWith('<')) {
    const first = numberReadings(s.slice(1))[0];
    return first ? { kind: 'below', value: first.x } : { kind: 'text' };
  }
  return readAll(s, (x, d) => (d >= 3 ? { value: x, tol: halfUnit(d) } : null));
}

/** Differenz in Prozentpunkten (4,5) oder als Anteil, wie R sie druckt (0,045 oder 0.045). */
export const parseDiff = (input: string) => readAll(input, (x, d) => (Math.abs(x) < 1 && d >= 3
  ? { value: 100 * x, tol: 100 * halfUnit(d) }
  : { value: x, tol: halfUnit(d) }));

/** Versprochene Quote in Prozent (auch ganzzahlig). Ein Anteil unter 1 mit Nachkommastellen gilt als Anteil: 0,67 → 67, 0,8 → 80. */
export function parseRate(input: string): number | null {
  const first = numberReadings(clean(input))[0];
  if (!first) return null;
  return Math.abs(first.x) < 1 && first.decimals >= 1 ? 100 * first.x : first.x;
}

/** Quote für Karte und Rückmeldung: immer in Prozent (0,67 → „67 %“). */
export const rateText = (input: string) => {
  const x = parseRate(input);
  return x === null ? input.trim() : `${x.toLocaleString('de-DE', { maximumFractionDigits: 2 }).replace('-', '−')} %`;
};

/** Varianten, die zu irgendeiner Lesart passen, die nächste zuerst. */
const closest = <V extends { value: number }>(vs: V[], readings: Reading[], signFree = false) => {
  const gap = (v: V, r: Reading) => Math.abs((signFree ? Math.abs(v.value) : v.value) - (signFree ? Math.abs(r.value) : r.value));
  const dist = (v: V) => Math.min(...readings.map(r => (gap(v, r) <= r.tol + 1e-9 ? gap(v, r) : Infinity)));
  return vs.filter(v => Number.isFinite(v.value) && dist(v) < Infinity).sort((a, b) => dist(a) - dist(b));
};

/* ---------- Texte ---------- */

export const SCOPE_TEXT: Record<Scope, string> = { all: 'über alle Selbstausfüller:innen', online: 'nur online', paper: 'nur auf Papier' };
const weightText = (w: boolean) => (w ? 'gewichtet' : 'ungewichtet');
export const pct = (x: number) => `${de(100 * x, 1)} %`;
export const pp = (x: number) => `${x > 0 ? '+' : ''}${de(100 * x, 1)} Pp.`;
export const fmtP = (p: number) => (p < 0.001 ? 'p < 0,001' : `p = ${de(p, 3)}`);
export function groupLabel(grouping: GroupVar | 'total', level: number): string {
  if (grouping === 'rep') return level === 1 ? '„mit“ Wiederholung' : '„ohne“ Wiederholung';
  if (grouping === 'amt') return `${level} €`;
  if (grouping === 'version') return `Fassung ${versionByCode(level)?.id ?? level}`;
  if (grouping === 'paper') return level === 1 ? 'Papier' : 'online';
  return 'alle zusammen';
}
export const versionPair = (key: TukeyKey) => (key === 'none' ? 'kein Paar' : key.split('-').map(c => versionByCode(Number(c))!.id).join(' – '));

export type Check<V> = { notes: Note[]; hit: V | null; valid: boolean; exact: boolean };
const empty = <V,>(): Check<V> => ({ notes: [], hit: null, valid: false, exact: false });
const only = <V,>(note: Note): Check<V> => ({ notes: [note], hit: null, valid: false, exact: false });

/* ---------- Wertedetektor: Anteile ---------- */

export type ShareField = { scope: Scope; grouping: GroupVar; level: number };
const COARSE_SHARE: Note = { tone: 'hint', text: 'Trag die Quote in Prozent mit einer Nachkommastelle ein (z. B. 50,0) – oder so, wie R sie druckt (z. B. 0,500).' };

export function checkShare(c: Computed, field: ShareField, input: string): Check<ShareVariant> {
  const parsed = parseShare(input);
  if (parsed.kind === 'empty' || parsed.kind === 'text') return empty();
  if (parsed.kind !== 'ok') return only(COARSE_SHARE);
  const hits = closest(c.shares, parsed.readings);
  const sameGroup = (v: ShareVariant) => v.grouping === field.grouping && v.level === field.level;
  const sameField = (v: ShareVariant) => sameGroup(v) && v.scope === field.scope;
  const say = (v: ShareVariant) => `${groupLabel(v.grouping, v.level)}, ${SCOPE_TEXT[v.scope]}, ${weightText(v.weighted)}`;
  const result = (v: ShareVariant, note: Note): Check<ShareVariant> => ({ notes: [note], hit: v, valid: sameField(v) && v.coding === 'ok', exact: sameField(v) && v.coding === 'ok' && !v.weighted });
  const exact = hits.find(v => sameField(v) && v.coding === 'ok' && !v.weighted);
  if (exact) return result(exact, { tone: 'ok', text: `Stimmt: Zusagequote ${say(exact)} = ${pct(exact.value)}.` });
  const twin = hits.find(v => sameField(v) && v.coding === 'ok');
  if (twin) return result(twin, { tone: 'ok', text: `Das ist die gewichtete Quote (${say(twin)} = ${pct(twin.value)}) – auch gültig. Im Experiment rechnen wir aber ungewichtet: Das Los hat die Gruppen gebildet, nicht die Stichprobe.` });
  const codingNote = (v: ShareVariant): Note => v.coding === 'raw'
    ? { tone: 'warn', text: `Ein Mittelwert über 1 (${de(v.value, 3)}): xr21 hat noch die Codes 1 (ja) und 2 (nein). Bilde mit rec() zuerst eine 0/1-Variable – ihr Mittelwert ist die Quote.` }
    : v.coding === 'reversed'
      ? { tone: 'warn', text: `Das ist der Anteil der Nein-Antworten (${pct(v.value)}): In rec() sind ja und nein vertauscht – 1 = ja soll 1 werden, 2 = nein soll 0 werden.` }
      : { tone: 'warn', text: `Hier zählt „keine Angabe“ als Nein (${pct(v.value)}) – das passiert mit else=0 in rec(). Mit else=NA fallen fehlende Antworten heraus.` };
  const coded = hits.find(v => sameField(v) && v.coding !== 'ok');
  if (coded) return result(coded, codingNote(coded));
  const scope = hits.find(v => sameGroup(v) && v.coding === 'ok');
  if (scope) return result(scope, { tone: 'hint', text: `Das ist die Quote ${say(scope)} (${pct(scope.value)}). Gesucht ist hier: ${SCOPE_TEXT[field.scope]}.` });
  const level = hits.find(v => v.grouping === field.grouping && v.scope === field.scope && v.coding === 'ok');
  if (level) return result(level, { tone: 'warn', text: `Das ist die Quote ${groupLabel(level.grouping, level.level)} (${pct(level.value)}) – in dieses Feld gehört ${groupLabel(field.grouping, field.level)}.` });
  const other = hits.find(v => v.coding === 'ok');
  if (other) return result(other, { tone: 'hint', text: `Das ist die Quote ${say(other)} = ${pct(other.value)}. Gesucht ist ${groupLabel(field.grouping, field.level)}, ${SCOPE_TEXT[field.scope]}.` });
  if (hits[0]) return result(hits[0], codingNote(hits[0]));
  return only({ tone: 'warn', text: `Diese Quote für ${groupLabel(field.grouping, field.level)} finde ich nicht. Prüfe den Filter (${field.scope === 'online' ? 'nur online: mode == 3' : 'nur Selbstausfüller:innen: mode != 2'}), die 0/1-Kodierung von xr21 und die Gruppenvariable.` });
}

/** Die eigene Differenz aus den eigenen (erkannten) Anteilen, in Prozentpunkten: b − a. */
export function ownDiff(a: string, b: string): number | null {
  const x = parseShare(a), y = parseShare(b);
  return x.kind === 'ok' && y.kind === 'ok' ? y.readings[0].value - x.readings[0].value : null;
}

/** Ein t-Test-Eintrag (zwei Quoten und t) mit allen Rückmeldungen; die eigene Differenz erst, wenn beide Quoten erkannt sind. */
export function checkEntry(c: Computed, scope: Scope, grouping: 'rep' | 'amt', e: TEntry) {
  const [lo, hi] = grouping === 'rep' ? [0, 1] : [5, 10];
  const a = checkShare(c, { scope, grouping, level: lo }, e.a), b = checkShare(c, { scope, grouping, level: hi }, e.b), t = checkT(c, { scope, grouping }, e.t);
  const diff = a.hit && b.hit ? ownDiff(e.a, e.b) : null;
  return { notes: [...a.notes, ...b.notes, ...t.notes], diff, valid: a.valid && b.valid };
}

/* ---------- Wertedetektor: t ---------- */

export type TField = { scope: Scope; grouping: 'rep' | 'amt' };
const levelsText = (t: TTest) => `„${t.levels[0]} vs. ${t.levels[1]}“`;

export function checkT(c: Computed, field: TField, input: string): Check<TVariant> {
  const parsed = parseStat(input);
  if (parsed.kind === 'empty' || parsed.kind === 'text') return empty();
  if (parsed.kind !== 'ok') return only({ tone: 'hint', text: 't mit mindestens zwei Nachkommastellen, so wie R es druckt.' });
  const hits = closest(c.tests, parsed.readings, true);
  const sameField = (v: TVariant) => v.scope === field.scope && v.grouping === field.grouping;
  const result = (v: TVariant, note: Note): Check<TVariant> => ({ notes: [note], hit: v, valid: sameField(v), exact: sameField(v) && v.kind === 'welch' && !v.weighted });
  const what = (v: TVariant) => `${v.grouping === 'rep' ? 'Wiederholung' : v.grouping === 'amt' ? 'Betrag' : 'Modus'}, ${SCOPE_TEXT[v.scope]}, ${weightText(v.weighted)}`;
  const exact = hits.find(v => sameField(v) && v.kind === 'welch' && !v.weighted);
  if (exact) {
    const typed = parsed.readings[0].value, flipped = typed !== 0 && Math.sign(typed) !== Math.sign(exact.value);
    return result(exact, { tone: 'ok', text: `Stimmt: Welch-t = ${de(exact.value, 3)} (df = ${de(exact.test.welch.df, 1)}, ${fmtP(exact.test.welch.p)}). mariposa vergleicht ${levelsText(exact.test)}${flipped ? ' – dein Vorzeichen ist umgedreht, das ändert nur die Reihenfolge der Gruppen' : ''}.` });
  }
  const student = hits.find(v => sameField(v) && v.kind === 'student' && !v.weighted);
  if (student) return result(student, { tone: 'hint', text: `Das ist t für gleiche Varianzen (${de(student.value, 3)}, Zeile „Equal variances“ in summary()). mariposa rechnet standardmäßig Welch (ungleiche Varianzen): die Kurzausgabe bzw. die Zeile „Unequal variances“.` });
  const weighted = hits.find(v => sameField(v));
  if (weighted) return result(weighted, { tone: 'hint', text: `Das ist das gewichtete t (${what(weighted)}: ${de(weighted.value, 3)}). Im Experiment rechnen wir ungewichtet.` });
  if (hits[0]) return result(hits[0], { tone: 'hint', text: `Das ist t für ${what(hits[0])} (${hits[0].kind === 'welch' ? 'Welch' : 'gleiche Varianzen'}: ${de(hits[0].value, 3)}). Gesucht ist ${field.grouping === 'rep' ? 'Wiederholung' : 'Betrag'}, ${SCOPE_TEXT[field.scope]}.` });
  return only({ tone: 'warn', text: 'Dieses t finde ich nicht. Nimm den Welch-t-Wert aus der Kurzausgabe von t_test() bzw. die Zeile „Unequal variances“ in summary().' });
}

/* ---------- Wertedetektor: r ---------- */

export const pairText = (id: PairId) => { const p = PAIRS.find(x => x.id === id)!; return `${MATRIX_LABELS[p.a]} × ${MATRIX_LABELS[p.b]}`; };

export function checkR(c: Computed, pair: PairId, input: string): Check<RVariant> {
  const parsed = parseStat(input);
  if (parsed.kind === 'empty' || parsed.kind === 'text') return empty();
  if (parsed.kind !== 'ok') return only({ tone: 'hint', text: 'r mit mindestens zwei Nachkommastellen, so wie R es druckt.' });
  const hits = closest(c.rs, parsed.readings);
  const result = (v: RVariant, note: Note): Check<RVariant> => ({ notes: [note], hit: v, valid: v.pair === pair && v.scope === 'all', exact: v.pair === pair && v.scope === 'all' && !v.weighted });
  const exact = hits.find(v => v.pair === pair && v.scope === 'all' && !v.weighted);
  if (exact) return result(exact, { tone: 'ok', text: `Stimmt: r(${pairText(pair)}) = ${de(exact.value, 3)} über alle Selbstausfüller:innen (n = ${exact.n.toLocaleString('de-DE')}).` });
  const twin = hits.find(v => v.pair === pair && v.scope === 'all');
  if (twin) return result(twin, { tone: 'ok', text: `Das ist r gewichtet (${de(twin.value, 3)}) – auch gültig; für den Zufallscheck genügt ungewichtet.` });
  const online = hits.find(v => v.pair === pair);
  if (online) return result(online, { tone: 'hint', text: `Das ist r nur online (${de(online.value, 3)}). Der Zufallscheck braucht alle Selbstausfüller:innen – nur dort variiert papier.` });
  if (hits[0]) return result(hits[0], { tone: 'hint', text: `Das ist r(${pairText(hits[0].pair)}) = ${de(hits[0].value, 3)}. Gesucht ist die Zelle ${pairText(pair)}.` });
  const flipped = closest(c.rs, parsed.readings, true).find(v => v.pair === pair && v.scope === 'all');
  if (flipped) return only({ tone: 'warn', text: 'Der Betrag stimmt, das Vorzeichen nicht. Schau noch einmal in die Matrix: papier = 1 heißt Papier, wiederholung = 1 heißt „mit“.' });
  return only({ tone: 'warn', text: `Dieses r finde ich nicht. Nimm aus der Matrix die Zeile ${pairText(pair).replace(' × ', ' und die Spalte ')}.` });
}

/* ---------- Wertedetektor: ANOVA ---------- */

function anovaNote(v: FVariant, stat: string): Note {
  if (v.scope === 'online' && v.kind === 'welch') return { tone: 'hint', text: `Das ist Welchs Test aus „Assumption Tests“ (${stat}). Für die klassische ANOVA nimm die Zeile „Between Groups“.` };
  if (v.scope === 'online') return { tone: 'hint', text: `Das ist die gewichtete ANOVA (${stat}). Im Experiment rechnen wir ungewichtet – die gewichtete kommt gleich als zweite Enthüllung.` };
  if (v.scope === 'all') return { tone: 'hint', text: `Das ist die ANOVA über alle Selbstausfüller:innen (${v.kind === 'welch' ? 'Welch, ' : ''}${weightText(v.weighted)}: ${stat}). Dort sind Papier und Fassung vermischt – das Institut befragt nur online.` };
  return { tone: 'hint', text: `Das ist die ANOVA nur auf Papier (${stat}). Dort gab es nur zwei Fassungen – das Institut befragt online.` };
}

/** Innerhalb der Toleranz entscheidet die Nähe zur gesuchten Rechnung, nicht die letzte Stelle: online vor alle vor Papier, klassisch vor Welch, ungewichtet vor gewichtet. */
const SCOPE_RANK: Record<Scope, number> = { online: 0, all: 1, paper: 2 };
const anovaRank = (v: FVariant) => SCOPE_RANK[v.scope] * 4 + (v.kind === 'welch' ? 2 : 0) + (v.weighted ? 1 : 0);
const byRank = (vs: FVariant[]) => [...vs].sort((a, b) => anovaRank(a) - anovaRank(b));

export function checkF(c: Computed, input: string): Check<FVariant> {
  const parsed = parseStat(input);
  if (parsed.kind === 'empty' || parsed.kind === 'text') return empty();
  if (parsed.kind !== 'ok') return only({ tone: 'hint', text: 'F mit mindestens zwei Nachkommastellen, so wie R es druckt.' });
  const hits = byRank(closest(c.fs, parsed.readings));
  const isExact = (v: FVariant) => v.scope === 'online' && v.kind === 'classical' && !v.weighted;
  const exact = hits.find(isExact);
  if (exact) return { notes: [{ tone: 'ok', text: `Stimmt: F(${exact.df1}, ${exact.df2}) = ${de(exact.value, 3)} – ANOVA über die vier Fassungen, nur online.` }], hit: exact, valid: true, exact: true };
  if (hits[0]) return { notes: [anovaNote(hits[0], `F = ${de(hits[0].value, 3)}`)], hit: hits[0], valid: false, exact: false };
  return only({ tone: 'warn', text: 'Dieses F finde ich nicht. Nimm aus summary() die Zeile „Between Groups“, Spalte F – nur online, vier Fassungen (group = splt23_3).' });
}

export function checkP(c: Computed, input: string): Check<FVariant> {
  const parsed = parseP(input);
  if (parsed.kind === 'empty' || parsed.kind === 'text') return empty();
  if (parsed.kind === 'coarse') return only({ tone: 'hint', text: 'p mit drei Nachkommastellen, so wie R es druckt (oder „< 0,001“).' });
  const hits = byRank(parsed.kind === 'below' ? c.fs.filter(v => v.p < parsed.value) : closest(c.fs.map(v => ({ ...v, value: v.p })), parsed.readings).map(v => c.fs.find(f => f.scope === v.scope && f.kind === v.kind && f.weighted === v.weighted)!));
  const exact = hits.find(v => v.scope === 'online' && v.kind === 'classical' && !v.weighted);
  if (exact) return { notes: [{ tone: 'ok', text: `Stimmt: ${fmtP(exact.p)} für die ANOVA über die vier Fassungen, nur online. ${exact.p < 0.05 ? 'Irgendeine Fassung unterscheidet sich – welche, sagt erst Tukey.' : 'Kein Unterschied, der bei 5 % trägt.'}` }], hit: exact, valid: true, exact: true };
  if (hits[0]) return { notes: [anovaNote(hits[0], fmtP(hits[0].p))], hit: hits[0], valid: false, exact: false };
  return only({ tone: 'warn', text: 'Diesen p-Wert finde ich nicht. Nimm aus summary() die Zeile „Between Groups“, Spalte p_value.' });
}

/* ---------- Tukey: Welche Paare sind signifikant? ---------- */

export function tukeyTruth(c: Computed): TukeyKey[] | null {
  return c.tukey.online ? c.tukey.online.filter(r => r.p < 0.05).map(r => r.label as TukeyKey) : null;
}

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every(x => b.includes(x));

/** Die Tukey-Auswahl wird erst geprüft, wenn die eigene ANOVA erkannt ist und „Auswahl prüfen“ gedrückt wurde – und zwar als Ganzes:
 *  Eine falsche Auswahl bekommt einen Hinweis, ohne das falsche Paar zu nennen (sonst ließe sich die Tabelle erklicken). */
export function checkTukey(c: Computed, s: S06State): { notes: Note[]; correct: boolean } {
  if (!s.tukey.length) return { notes: [], correct: false };
  if (!anovaDone(c, s)) return { notes: [{ tone: 'hint', text: 'Trag zuerst oben F oder p deiner ANOVA ein – dann prüfe ich deine Tukey-Auswahl.' }], correct: false };
  if (!s.tukeyTried || !sameSet(s.tukeyTried, s.tukey)) return { notes: [], correct: false };
  const truth = tukeyTruth(c);
  if (!truth) return { notes: [{ tone: 'warn', text: 'Tukey lässt sich mit dieser Datei nicht rechnen: Mindestens eine Fassung hat online zu wenige Fälle.' }], correct: false };
  const correct = s.tukey.includes('none') ? truth.length === 0 : sameSet(s.tukey, truth);
  if (correct) return { notes: [{ tone: 'ok', text: truth.length
    ? `Stimmt: Nach Tukey ${truth.length === 1 ? 'unterscheidet sich nur' : 'unterscheiden sich nur'} ${truth.map(versionPair).join(', ')} signifikant.`
    : 'Stimmt: Nach Tukey unterscheidet sich kein Paar signifikant.' }], correct: true };
  return { notes: [{ tone: 'hint', text: 'Noch nicht: Deine Auswahl passt nicht zur Tukey-Tabelle. Signifikant ist ein Paar, wenn in summary() in der Spalte p-value ein Wert unter 0,05 steht – Tukey hat dabei schon für die sechs Vergleiche korrigiert.' }], correct: false };
}

/** Tukey fertig: eigene ANOVA erkannt, Auswahl geprüft und richtig. Erst dann nennt die Freigabe Tukey-Befunde. */
export const tukeyDone = (c: Computed, s: S06State) => checkTukey(c, s).correct;

/* ---------- Zufallscheck: Markierung auswerten ---------- */

export type MarkReading = { pair: PairId; r: number; p: number; marked: boolean; balance: boolean; verdict: 'hält' | 'verletzt' | 'übersehen' | 'kein Loscheck' };
/** Ab |r| ≥ 0,1 gilt eine Balance-Zelle als „deutlich von 0 entfernt“. */
export const BALANCE_LIMIT = 0.1;

export function readMarks(m: CorMatrix, marks: PairId[]): MarkReading[] {
  return PAIRS.map(({ id, i, j }) => {
    const r = m.r[i][j], balance = BALANCE_PAIRS.includes(id), marked = marks.includes(id);
    const off = Math.abs(r) >= BALANCE_LIMIT;
    const verdict = !balance ? 'kein Loscheck' : off ? 'verletzt' : marked ? 'hält' : 'übersehen';
    return { pair: id, r, p: m.p[i][j], marked, balance, verdict };
  });
}

export function markNotes(c: Computed, marks: PairId[], m: CorMatrix): string[] {
  const readings = readMarks(m, marks), notes: string[] = [];
  const r3 = (x: number) => de(x, 3);
  for (const x of readings) {
    const cells = x.pair === 'wiederholung-betrag' && Math.abs(x.r) >= 0.02 && Math.abs(x.r) < BALANCE_LIMIT ? ` ${TEXTS.cells}` : '';
    if (x.balance && x.verdict === 'verletzt') notes.push(`${pairText(x.pair)}: r = ${r3(x.r)}. ${x.marked ? 'Du hast richtig erwartet, dass hier bei echter Auslosung ≈ 0 stehen müsste' : 'Hier hätte bei echter Auslosung ≈ 0 stehen müssen'} – über beide Modi hinweg war die Fassung also nicht ausgelost.`);
    else if (x.balance && x.marked) notes.push(`${pairText(x.pair)}: r = ${r3(x.r)}, hält.${cells}`);
    else if (x.balance) notes.push(`${pairText(x.pair)} (r = ${r3(x.r)}) hättest du markieren können: ${PAIR_MEANING[x.pair]}${cells}`);
    else if (x.marked) notes.push(`${pairText(x.pair)}: ${PAIR_MEANING[x.pair]}`);
  }
  if (readings.some(x => x.pair === 'wiederholung-papier' && x.verdict === 'verletzt')) notes.push(TEXTS.codebook);
  if (!c.splitMatch) notes.push('Der Betrag deckt sich in dieser Datei nicht vollständig mit der Fragebogenhälfte splt23_1.');
  return notes;
}

/* ---------- Freigabe ---------- */

export function checkAmount(c: Computed, input: string): Check<TVariant> {
  const parsed = parseDiff(input);
  if (parsed.kind !== 'ok') return empty();
  const amt = c.tests.filter(v => v.grouping === 'amt' && v.kind === 'welch').map(v => ({ ...v, value: 100 * signedEffect(v.test, 'amt') }));
  const hits = closest(amt, parsed.readings, true), typed = parsed.readings[0].value;
  const say = (v: TVariant) => `${pp(signedEffect(v.test, 'amt'))} (${weightText(v.weighted)}; Welch ${fmtP(v.test.welch.p)})`;
  const sign = (v: TVariant) => (typed !== 0 && Math.sign(typed) !== Math.sign(v.value)
    ? ` Dein Vorzeichen ist umgedreht: mariposa rechnet „${v.test.levels[0]} vs. ${v.test.levels[1]}“ – für die Karte zählt, was 10 € gegenüber 5 € bringen.` : '');
  const result = (v: TVariant, note: Note): Check<TVariant> => ({ notes: [note], hit: v, valid: v.scope === 'online', exact: v.scope === 'online' && !v.weighted });
  const exact = hits.find(v => v.scope === 'online' && !v.weighted);
  if (exact) return result(exact, { tone: 'ok', text: `Stimmt: 10 € statt 5 € bringen online ${say(exact)}.${sign(exact)}` });
  const w = hits.find(v => v.scope === 'online');
  if (w) return result(w, { tone: 'ok', text: `Das ist der gewichtete Betragseffekt online: ${say(w)} – auch vertretbar.${sign(w)}` });
  if (hits[0]) return result(hits[0], { tone: 'hint', text: `Das ist der Betragseffekt ${SCOPE_TEXT[hits[0].scope]} (${weightText(hits[0].weighted)}). Euer Panel ist online – dafür zählt der Online-Wert aus Station 3.${sign(hits[0])}` });
  return only({ tone: 'hint', text: 'Diesen Betragseffekt finde ich nicht. Gemeint ist die Differenz der Zusagequoten 10 € − 5 € in Prozentpunkten, online.' });
}

/** Die Gegenfragen zur Freigabe. Welche Fassung vorn liegt, nennt sie erst nach den eigenen vier Quoten (meansDone),
 *  die Tukey-Befunde erst nach der eigenen richtigen Tukey-Markierung (tukeyDone). */
export function checkRelease(c: Computed, s: S06State, { meansDone, tukeyDone }: { meansDone: boolean; tukeyDone: boolean }): Note[] {
  const r = s.release;
  if (!r.version) return [];
  const v = versionById(r.version), notes: Note[] = [];
  const rates = c.rates.map(x => (x ? x.mean : NaN));
  const best = rates.indexOf(Math.max(...rates.filter(Number.isFinite)));
  if (!meansDone) notes.push({ tone: 'hint', text: 'Hast du die vier Fassungen online verglichen (Station 3b)? Mit den eigenen vier Quoten bekommst du hier eine Gegenfrage zu deiner Wahl.' });
  else if (best === v.code - 1) {
    if (!tukeyDone) notes.push({ tone: 'hint', text: 'Deine Fassung hat online den höchsten Balken. Hast du mit Tukey geprüft, gegen welche Fassungen sie sich signifikant durchsetzt?' });
    else {
      const wins = (c.tukey.online ?? []).filter(t => t.p < 0.05 && (t.a === v.code || t.b === v.code)).map(t => versionByCode(t.a === v.code ? t.b : t.a)!.id);
      const cheaper = v.amount === 10 ? ' Was sagst du, wenn sie bei uns nicht besser läuft als das billigere A1?' : '';
      notes.push({ tone: 'hint', text: `${v.id} hat den höchsten Balken, schlägt nach Tukey aber ${wins.length ? `nur ${wins.join(' und ')}` : 'keine andere Fassung'} signifikant.${cheaper}` });
    }
  }
  const rate = parseRate(r.rate), low = parseRate(r.low), high = parseRate(r.high), ci = c.rates[v.code - 1];
  const pooled = c.shares.find(x => x.scope === 'all' && !x.weighted && x.coding === 'ok' && x.grouping === 'version' && x.level === v.code);
  if (rate !== null && ci && pooled && Math.abs(pooled.value - ci.mean) > 0.01 && Math.abs(rate - 100 * pooled.value) <= 0.5) notes.push({ tone: 'warn', text: 'Das ist die Quote inklusive Papier – euer Panel befragt nur online.' });
  if (rate !== null && (low === null || high === null)) notes.push({ tone: 'hint', text: 'Wie breit ist dein Intervall? Eine Quote ohne Spanne ist ein Versprechen ohne Sicherheitsabstand.' });
  if (rate !== null && low !== null && high !== null) {
    if (low > high) notes.push({ tone: 'hint', text: 'Die untere Grenze liegt über der oberen – vertauscht?' });
    else if (rate < low || rate > high) notes.push({ tone: 'hint', text: 'Deine Quote liegt außerhalb deiner eigenen Spanne.' });
    if (ci) {
      // Das Intervall aus der Datei erscheint nur, wenn die Spanne selbst das Intervall aus t_test() ist oder die eigenen vier Quoten erkannt sind.
      const own = matchesShare(r.low, ci.ci[0]) && matchesShare(r.high, ci.ci[1]);
      const lo = 100 * ci.ci[0], hi = 100 * ci.ci[1];
      if (own) notes.push({ tone: 'ok', text: `Das ist das 95-%-Intervall aus t_test() für ${v.id} online (ungewichtet, n = ${ci.n.toLocaleString('de-DE')}).` });
      else if (meansDone) notes.push({ tone: 'hint', text: `Zum Vergleich: ${v.id} online, ungewichtet: ${de(100 * ci.mean, 1)} % [${de(lo, 1)}; ${de(hi, 1)}] (95-%-Intervall, n = ${ci.n.toLocaleString('de-DE')}).` });
      else notes.push({ tone: 'hint', text: 'Woran misst du deine Spanne? Rechne das 95-%-Intervall deiner Fassung (Hilfe unten) und trag es ein – oder vergleiche zuerst in Station 3b die vier Fassungen. Dann zeige ich dir das Intervall zum Vergleich.' });
      if (own || meansDone) {
        if (rate > hi) notes.push({ tone: 'warn', text: 'Deine Quote liegt über der oberen Grenze – ein Versprechen, das die Daten nicht tragen.' });
        else if (rate < lo) notes.push({ tone: 'hint', text: 'Deine Quote liegt unter der unteren Grenze: vorsichtig versprochen. Auch das ist eine Entscheidung – schreib sie in deine Unterschrift.' });
        if (low <= high && high - low < 0.5 * (hi - lo)) notes.push({ tone: 'hint', text: 'Deine Spanne ist schmaler als die Hälfte des 95-%-Intervalls. Wie sicher bist du?' });
      }
    }
  }
  if (s.gut.version && s.gut.rate.trim() && rate !== null) notes.push({ tone: 'hint', text: `Dein Bauchgefühl vorher: ${s.gut.version} mit ${rateText(s.gut.rate)}.` });
  return notes;
}


/** Trifft eine eingetippte Grenze (Prozent oder wie R sie druckt) den Anteil target? */
function matchesShare(input: string, target: number): boolean {
  const p = parseShare(input);
  return p.kind === 'ok' && p.readings.some(x => Math.abs(x.value - target) <= x.tol + 1e-9);
}

/** Satz aus Station 2: nennt er, was das Los nicht verteilt hat? */
export function becauseNotes(text: string): Note[] {
  const t = text.trim();
  if (t.length < 15) return [];
  return /papier|online|modus|mode|post|selbst gewählt|älter|alter/i.test(t)
    ? [{ tone: 'ok', text: 'Du nennst, was nicht ausgelost war. Genau darin unterscheiden sich „ohne“ und „mit“ – nicht nur in der Wiederholung.' }]
    : [{ tone: 'hint', text: 'Welche Zelle der Matrix erklärt den Unterschied? Schau auf die Zeile wiederholung – womit hängt sie zusammen, obwohl das Los das nicht dürfte?' }];
}

/* ---------- Zustand ---------- */

export type TEntry = { a: string; b: string; t: string };
export type S06State = {
  mode: WorkMode;
  gut: { version: VersionId | ''; rate: string };
  s1: { rep: TEntry; amt: TEntry };
  marks: PairId[];
  locked: boolean;
  r: { repPaper: string; amtPaper: string };
  matrixView: 'unweighted' | 'weighted';
  because: string;
  s3: { rep: TEntry; amt: TEntry };
  trapView: 'all' | 'online';
  anova: { means: string[]; F: string; p: string };
  tukey: TukeyKey[];
  /** Die Auswahl beim letzten „Auswahl prüfen“ (null: noch nie geprüft). Ändert sich die Auswahl, gilt sie als ungeprüft. */
  tukeyTried: TukeyKey[] | null;
  release: { version: VersionId | ''; rate: string; low: string; high: string; amount: string; notClaimed: string };
  sign: { panel: string; qs: string; veto: boolean };
};

const entry = (): TEntry => ({ a: '', b: '', t: '' });
export const initialS06 = (): S06State => ({
  mode: 'solo', gut: { version: '', rate: '' },
  s1: { rep: entry(), amt: entry() }, marks: [], locked: false, r: { repPaper: '', amtPaper: '' }, matrixView: 'unweighted', because: '',
  s3: { rep: entry(), amt: entry() }, trapView: 'all', anova: { means: ['', '', '', ''], F: '', p: '' }, tukey: [], tukeyTried: null,
  release: { version: '', rate: '', low: '', high: '', amount: '', notClaimed: '' }, sign: { panel: '', qs: '', veto: false },
});

/** Markieren geht nur, solange die Markierung nicht festgehalten ist. */
export const toggleMark = (s: S06State, pair: PairId): S06State =>
  s.locked ? s : { ...s, marks: s.marks.includes(pair) ? s.marks.filter(m => m !== pair) : [...s.marks, pair] };
export const lockMarks = (s: S06State): S06State => (s.marks.length ? { ...s, locked: true } : s);
/** Neu markieren: Die eingetragenen r hängen an der Markierung und beginnen von vorn. */
export const unlockMarks = (s: S06State): S06State => ({ ...s, locked: false, r: { repPaper: '', amtPaper: '' } });

export function toggleTukey(s: S06State, key: TukeyKey): S06State {
  if (key === 'none') return { ...s, tukey: s.tukey.includes('none') ? [] : ['none'] };
  const rest = s.tukey.filter(k => k !== 'none');
  return { ...s, tukey: rest.includes(key) ? rest.filter(k => k !== key) : [...rest, key] };
}

/** „Auswahl prüfen“: Die ganze Auswahl wird auf einmal bewertet. */
export const tryTukey = (s: S06State): S06State => ({ ...s, tukeyTried: [...s.tukey] });

/** Das Bauchgefühl steht fest, sobald die erste eigene Zahl aus Station 1 erkannt ist – es soll ein Vorher bleiben. */
export const gutLocked = (c: Computed, s: S06State) => [
  checkShare(c, { scope: 'all', grouping: 'rep', level: 0 }, s.s1.rep.a), checkShare(c, { scope: 'all', grouping: 'rep', level: 1 }, s.s1.rep.b),
  checkShare(c, { scope: 'all', grouping: 'amt', level: 5 }, s.s1.amt.a), checkShare(c, { scope: 'all', grouping: 'amt', level: 10 }, s.s1.amt.b),
].some(x => x.hit !== null);

/** Neue Fassung in der Freigabe: Quote, Spanne und Unterschriften hängen an der Fassung und beginnen von vorn. */
export const chooseRelease = (s: S06State, version: VersionId | ''): S06State => version === s.release.version ? s : {
  ...s, release: { ...s.release, version, rate: '', low: '', high: '' }, sign: { panel: '', qs: '', veto: false },
};

const parseEntry = (x: unknown): TEntry => { const r = record(x); return { a: str(r.a, 12), b: str(r.b, 12), t: str(r.t, 12) }; };

export function parseS06(raw: unknown): S06State {
  const r = record(raw), gut = record(r.gut), s1 = record(r.s1), s3 = record(r.s3), rr = record(r.r), an = record(r.anova), rel = record(r.release), sign = record(r.sign);
  const means = Array.isArray(an.means) ? an.means : [];
  const marks = Array.isArray(r.marks) ? [...new Set(r.marks.filter((m): m is PairId => typeof m === 'string' && (PAIR_IDS as string[]).includes(m)))] : [];
  const keys = (x: unknown): TukeyKey[] => {
    const list = Array.isArray(x) ? [...new Set(x.filter((k): k is TukeyKey => typeof k === 'string' && ([...TUKEY_KEYS, 'none'] as string[]).includes(k)))] : [];
    return list.includes('none') ? ['none'] : list;
  };
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    gut: { version: oneOf(gut.version, [...VERSION_IDS, ''] as const, ''), rate: str(gut.rate, 12) },
    s1: { rep: parseEntry(s1.rep), amt: parseEntry(s1.amt) },
    marks,
    locked: bool(r.locked) && marks.length > 0,
    r: { repPaper: str(rr.repPaper, 12), amtPaper: str(rr.amtPaper, 12) },
    matrixView: oneOf(r.matrixView, ['unweighted', 'weighted'] as const, 'unweighted'),
    because: str(r.because, 600),
    s3: { rep: parseEntry(s3.rep), amt: parseEntry(s3.amt) },
    trapView: oneOf(r.trapView, ['all', 'online'] as const, 'all'),
    anova: { means: [0, 1, 2, 3].map(i => str(means[i], 12)), F: str(an.F, 12), p: str(an.p, 12) },
    tukey: keys(r.tukey),
    tukeyTried: Array.isArray(r.tukeyTried) ? keys(r.tukeyTried) : null,
    release: {
      version: oneOf(rel.version, [...VERSION_IDS, ''] as const, ''), rate: str(rel.rate, 12), low: str(rel.low, 12), high: str(rel.high, 12),
      amount: str(rel.amount, 12), notClaimed: str(rel.notClaimed, 600),
    },
    sign: { panel: str(sign.panel, 400), qs: str(sign.qs, 400), veto: bool(sign.veto) },
  };
}

export function statusS06(s: S06State): TaskStatus {
  const r = s.release;
  if (r.version && r.rate.trim() && r.notClaimed.trim() && s.sign.panel.trim() && s.sign.qs.trim()) return 'done';
  const typed = [s.gut.rate, ...Object.values(s.s1.rep), ...Object.values(s.s1.amt), s.r.repPaper, s.r.amtPaper, s.because, ...Object.values(s.s3.rep), ...Object.values(s.s3.amt),
    ...s.anova.means, s.anova.F, s.anova.p, r.rate, r.low, r.high, r.amount, r.notClaimed, s.sign.panel, s.sign.qs];
  return s.gut.version || r.version || s.marks.length || s.tukey.length || typed.some(t => t.trim()) ? 'running' : 'open';
}

export type Release = 'offen' | 'Veto' | 'freigegeben';
export const releaseState = (s: S06State): Release => (s.sign.veto ? 'Veto' : s.sign.panel.trim() && s.sign.qs.trim() ? 'freigegeben' : 'offen');

export function plenumLines(s: S06State): [string, string][] {
  const r = s.release, v = r.version ? versionById(r.version) : null;
  const release = releaseState(s);
  return [
    ['Fassung', v ? `${v.id} · ${v.money}, ${v.placement}` : ''],
    ['Versprochene Online-Quote', r.rate.trim() ? `${rateText(r.rate)}${r.low.trim() && r.high.trim() ? ` (Spanne ${rateText(r.low).replace(/ %$/, '')}–${rateText(r.high)})` : ' (ohne Spanne)'}` : ''],
    ['10 € bringen', r.amount.trim() ? `${r.amount.trim().replace(/\s*(Pp\.?|%)$/i, '')} Pp.` : ''],
    ['Was wir nicht behaupten', r.notClaimed.trim()],
    ['Freigabe', release === 'Veto' ? 'Veto der Qualitätssicherung' : release === 'freigegeben' ? 'freigegeben mit zwei Unterschriften' : 'noch offen'],
    ['Panelaufbau', s.sign.panel.trim()],
    ['Qualitätssicherung', s.sign.qs.trim()],
    ['Bauchgefühl vorher', s.gut.version || s.gut.rate.trim() ? `${s.gut.version || '–'} · ${s.gut.rate.trim() ? rateText(s.gut.rate) : '–'}` : ''],
  ];
}

/* ---------- Enthüllungen: wann sie erscheinen ---------- */

const shareValid = (c: Computed, scope: Scope, e: TEntry) =>
  checkShare(c, { scope, grouping: 'rep', level: 0 }, e.a).valid && checkShare(c, { scope, grouping: 'rep', level: 1 }, e.b).valid;
/** Die vier eigenen Quoten der Fassungen (online) sind erkannt. */
export const meansDone = (c: Computed, s: S06State) =>
  VERSIONS.every((v, i) => checkShare(c, { scope: 'online', grouping: 'version', level: v.code }, s.anova.means[i]).valid);
/** Die Falle zeigt sich erst, wenn die eigenen Quoten „ohne/mit“ über alle und nur online erkannt sind. */
export const trapReady = (c: Computed, s: S06State) => shareValid(c, 'all', s.s1.rep) && shareValid(c, 'online', s.s3.rep);
/** Die Matrix erscheint nach der festgehaltenen Markierung und zwei r, die als genau diese Zellen erkannt sind (ungewichtet oder gewichtet). */
export const matrixReady = (c: Computed, s: S06State) =>
  s.locked && checkR(c, 'wiederholung-papier', s.r.repPaper).valid && checkR(c, 'betrag-papier', s.r.amtPaper).valid;
/** Die eigene ungewichtete ANOVA online ist erkannt (F oder p). Danach: Tukey-Prüfung und die gewichtete ANOVA als zweite Enthüllung. */
export const anovaDone = (c: Computed, s: S06State) => checkF(c, s.anova.F).exact || checkP(c, s.anova.p).exact;

export type Trap = { all: [number, number]; online: [number, number]; n: { all: [number, number]; online: [number, number] }; paperOhne: number; nPaperOhne: number };
export function trap(c: Computed): Trap | null {
  const get = (scope: Scope, level: number) => c.shares.find(v => v.scope === scope && !v.weighted && v.coding === 'ok' && v.grouping === 'rep' && v.level === level);
  const a0 = get('all', 0), a1 = get('all', 1), o0 = get('online', 0), o1 = get('online', 1), p0 = get('paper', 0);
  if (!a0 || !a1 || !o0 || !o1) return null;
  return { all: [a0.value, a1.value], online: [o0.value, o1.value], n: { all: [a0.n, a1.n], online: [o0.n, o1.n] }, paperOhne: p0 ? p0.value : NaN, nPaperOhne: p0 ? p0.n : 0 };
}

/** Die zweite Enthüllung in Sätzen: die ANOVA online mit und ohne Gewicht. Die t-Tests online erscheinen nur für Tests,
 *  deren Quoten in Station 3a schon erkannt sind, die gewichteten Tukey-Paare erst nach der eigenen richtigen Tukey-Auswahl. */
export function weightedNotes(c: Computed, done: { rep: boolean; amt: boolean; tukey: boolean } = { rep: false, amt: false, tukey: false }): string[] {
  const u = c.anova.online, w = c.anova.onlineW;
  if (!u || !w) return ['Die ANOVA lässt sich mit dieser Datei nicht schätzen: Mindestens eine Fassung hat online zu wenige Fälle.'];
  const notes = [`Ungewichtet: F(${u.dfBetween}, ${u.dfWithin}) = ${de(u.F, 3)}, ${fmtP(u.p)}. Mit wghtpew: F(${w.dfBetween}, ${w.dfWithin}) = ${de(w.F, 3)}, ${fmtP(w.p)}.`];
  if ((u.p < 0.05) !== (w.p < 0.05)) notes.push(`Die Signifikanz kippt: ${u.p < 0.05 ? 'ungewichtet signifikant, gewichtet nicht' : 'gewichtet signifikant, ungewichtet nicht'}.`);
  else notes.push('Die Signifikanz bleibt mit und ohne Gewicht dieselbe.');
  for (const grouping of (['rep', 'amt'] as const).filter(g => done[g])) {
    const t = (weighted: boolean) => c.tests.find(v => v.scope === 'online' && v.grouping === grouping && v.kind === 'welch' && v.weighted === weighted);
    const a = t(false), b = t(true);
    if (a && b) notes.push(`${grouping === 'rep' ? 'Wiederholung' : 'Betrag'} online: ungewichtet ${pp(signedEffect(a.test, grouping))} (${fmtP(a.test.welch.p)}), gewichtet ${pp(signedEffect(b.test, grouping))} (${fmtP(b.test.welch.p)}).`);
  }
  const sigW = (c.tukey.onlineW ?? []).filter(r => r.p < 0.05).length;
  if (done.tukey) notes.push(`Tukey gewichtet: ${sigW === 0 ? 'kein Paar' : sigW === 1 ? 'ein Paar' : `${sigW} Paare`} signifikant.`);
  return notes;
}

/** Effekt in fester Richtung: „mit − ohne“ bzw. „10 € − 5 €“, egal, welche Gruppe mariposa vorn hat. */
export function signedEffect(t: TTest, grouping: 'rep' | 'amt' | 'paper'): number {
  const high = grouping === 'amt' ? 10 : 1;
  return t.levels[0] === high ? t.diff : -t.diff;
}

export const rScriptFor = (s: S06State) => rSolution(s.release.version ? versionById(s.release.version).code : 1);
