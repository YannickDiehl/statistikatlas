import { isMissingCode, type SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, halfUnit, near, numberReadings, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import {
  AXIS_MAX_START, CANDIDATES, GEOM_IDS, GEOMS, QUESTION_IDS, QUESTIONS, R_AXIS, R_SETUP, R_SILHOUETTES, R_SKETCH, SILHOUETTE_IDS, SILHOUETTES,
  SKETCH_CODES, SKETCH_VAR, VARS,
  type GeomId, type Question, type QuestionId, type SilhouetteId,
} from './content';

export type Plan = { geom: GeomId | ''; x: string; second: string };
export type GrafikState = {
  mode: WorkMode;
  /** Relative Balkenhöhen der Skizze (0–100) für die Werte 0 bis 10. */
  sketch: number[];
  locked: boolean;
  read: { peak: string; count: string };
  silhouettes: Partial<Record<SilhouetteId, string>>;
  solved: boolean;
  question: QuestionId | '';
  plan: Plan;
  caption: string;
  axis: { west: string; east: string; start: number; reason: string };
};

const emptySketch = () => SKETCH_CODES.map(() => 0);
export const initialGrafik = (): GrafikState => ({
  mode: 'solo', sketch: emptySketch(), locked: false, read: { peak: '', count: '' }, silhouettes: {}, solved: false,
  question: '', plan: { geom: '', x: '', second: '' }, caption: '', axis: { west: '', east: '', start: 0, reason: '' },
});

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const num = (x: unknown, fallback: number) => typeof x === 'number' && Number.isFinite(x) ? x : fallback;

export function parseGrafik(raw: unknown): GrafikState {
  const r = record(raw), read = record(r.read), plan = record(r.plan), axis = record(r.axis), sil = record(r.silhouettes);
  const sketch = Array.isArray(r.sketch) && r.sketch.length === SKETCH_CODES.length
    ? r.sketch.map(x => Math.round(clamp(num(x, 0), 0, 100))) : emptySketch();
  const silhouettes: Partial<Record<SilhouetteId, string>> = {};
  for (const id of SILHOUETTE_IDS) if ((CANDIDATES as readonly string[]).includes(sil[id] as string)) silhouettes[id] = sil[id] as string;
  const question = oneOf(r.question, [...QUESTION_IDS, ''] as const, '');
  const allowed = question ? [questionById(question).group, questionById(question).outcome] : [];
  const x = allowed.includes(plan.x as string) ? plan.x as string : '';
  const second = allowed.includes(plan.second as string) && plan.second !== x ? plan.second as string : '';
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'), sketch, locked: bool(r.locked),
    read: { peak: str(read.peak, 12), count: str(read.count, 12) }, silhouettes, solved: bool(r.solved),
    question, plan: { geom: oneOf(plan.geom, [...GEOM_IDS, ''] as const, ''), x, second }, caption: str(r.caption, 400),
    axis: {
      west: str(axis.west, 12), east: str(axis.east, 12),
      start: Math.round(clamp(num(axis.start, 0), 0, AXIS_MAX_START) * 10) / 10, reason: str(axis.reason, 400),
    },
  };
}

export function statusGrafik(s: GrafikState): TaskStatus {
  const done = s.locked && s.read.peak.trim() && s.read.count.trim() && s.solved && s.plan.geom && s.caption.trim()
    && s.axis.west.trim() && s.axis.east.trim() && s.axis.reason.trim();
  if (done) return 'done';
  const touched = s.sketch.some(h => h > 0) || s.locked || s.read.peak || s.read.count || Object.keys(s.silhouettes).length || s.question
    || s.caption || s.axis.west || s.axis.east || s.axis.reason || s.axis.start > 0;
  return touched ? 'running' : 'open';
}

export const questionById = (id: QuestionId): Question => QUESTIONS.find(q => q.id === id)!;

/* ---------- Daten ---------- */

/** Werte einer Variable; fehlende Angaben (Missing-Codes laut Datei) werden NaN. */
export function column(sav: SavFile, name: string): number[] {
  const v = sav.byName.get(name);
  if (!v) return [];
  return Array.from(v.values, x => isMissingCode(v, x) ? NaN : x);
}

/** Beschriftung eines Codes: Kurzlabel aus content.ts, sonst das Wertelabel der Datei, sonst die Zahl. */
export function codeLabel(sav: SavFile, name: string, code: number): string {
  return VARS[name]?.short?.[code] ?? sav.byName.get(name)?.valueLabels.get(code)?.toLocaleLowerCase('de') ?? de(code, Number.isInteger(code) ? 0 : 1);
}

/* ---------- Teil 1 · Vorher-Skizze ---------- */

export type Truth = { counts: number[]; shares: number[]; n: number; mode: number; modeCount: number; mean: number; median: number };

export function sketchTruth(sav: SavFile): Truth {
  const counts = SKETCH_CODES.map(() => 0);
  for (const x of column(sav, SKETCH_VAR)) if (Number.isInteger(x) && x >= 0 && x <= 10) counts[x]++;
  const n = counts.reduce((a, b) => a + b, 0);
  const modeIndex = counts.indexOf(Math.max(...counts));
  let cum = 0, median = NaN;
  for (let i = 0; i < counts.length; i++) { cum += counts[i]; if (cum >= n / 2) { median = SKETCH_CODES[i]; break; } }
  return {
    counts, n, shares: counts.map(c => n ? c / n : 0), mode: SKETCH_CODES[modeIndex], modeCount: counts[modeIndex],
    mean: n ? counts.reduce((a, c, i) => a + c * SKETCH_CODES[i], 0) / n : NaN, median,
  };
}

export function sketchShares(sketch: readonly number[]): number[] | null {
  const sum = sketch.reduce((a, b) => a + b, 0);
  return sum > 0 ? sketch.map(h => h / sum) : null;
}

export function sketchSummary(sketch: readonly number[]): { peak: number; mean: number } | null {
  const shares = sketchShares(sketch);
  if (!shares) return null;
  return { peak: SKETCH_CODES[sketch.indexOf(Math.max(...sketch))], mean: shares.reduce((a, q, i) => a + q * SKETCH_CODES[i], 0) };
}

/** Wie viele von 100 Befragten stehen in der Skizze an einer anderen Stelle als in den Daten? (Totalvariationsabstand) */
export function misplaced(sketch: readonly number[], truth: Truth): number | null {
  const q = sketchShares(sketch);
  if (!q) return null;
  return Math.round(50 * q.reduce((a, x, i) => a + Math.abs(x - truth.shares[i]), 0));
}

const countTolerance = (target: number) => Math.max(1, target * 0.1);

/** Gipfel und Höhe des höchsten Balkens, abgelesen an der eigenen Grafik. */
export function checkRead(truth: Truth, sketch: readonly number[], read: GrafikState['read']): Note[] {
  const notes: Note[] = [];
  const peak = parseNumber(read.peak);
  if (peak !== null) {
    const own = sketchSummary(sketch)?.peak;
    if (peak === truth.mode) notes.push({ tone: 'ok', text: `Der höchste Balken steht bei ${truth.mode}. Das ist der Modus.` });
    else if (peak === own) notes.push({ tone: 'warn', text: 'Das ist der Gipfel deiner Skizze. Was zeigt die Grafik aus R?' });
    else notes.push({ tone: 'warn', text: 'Dort steht nicht der höchste Balken. Hast du ls01 auf die x-Achse gelegt und geom_bar() genommen?' });
  }
  const count = parseNumber(read.count);
  if (count !== null) {
    const pct = truth.modeCount / truth.n * 100;
    if (near(count, truth.modeCount, countTolerance(truth.modeCount))) notes.push({ tone: 'ok', text: `Gut abgelesen: Genau sind es ${truth.modeCount.toLocaleString('de-DE')} von ${truth.n.toLocaleString('de-DE')} Befragten.` });
    else if (near(count, pct, 1)) notes.push({ tone: 'hint', text: 'Das ist ein Prozentwert. Die y-Achse von geom_bar() zählt Befragte (count). Wie hoch ist der Balken dort?' });
    else notes.push({ tone: 'warn', text: 'Diese Höhe passt nicht zum höchsten Balken. Lies an der y-Achse ab, ungefähr reicht.' });
  }
  return notes;
}

export const readOk = (truth: Truth, sketch: readonly number[], read: GrafikState['read']) =>
  checkRead(truth, sketch, read).filter(n => n.tone === 'ok').length === 2;

/** Rückmeldung nach dem Aufdecken: Gipfel, Mitte, Form. */
export function compareSketch(truth: Truth, sketch: readonly number[]): Note[] {
  const own = sketchSummary(sketch), away = misplaced(sketch, truth);
  if (!own || away === null) return [];
  const notes: Note[] = [{ tone: away <= 15 ? 'ok' : 'hint', text: `In deiner Skizze stehen ${away} von 100 Befragten an einer anderen Stelle als in den Daten.` }];
  notes.push(own.peak === truth.mode
    ? { tone: 'ok', text: `Gipfel getroffen: ${truth.mode}.` }
    : { tone: 'hint', text: `Dein Gipfel liegt bei ${own.peak}, der echte bei ${truth.mode}.` });
  const shift = truth.mean - own.mean;
  if (Math.abs(shift) >= 0.5) notes.push({ tone: 'hint', text: `Deine Skizze hat ihr Mittel bei ${de(own.mean)}, die Daten bei ${de(truth.mean)}. ${shift > 0 ? 'Die Befragten sind zufriedener, als du dachtest.' : 'Die Befragten sind unzufriedener, als du dachtest.'}` });
  notes.push({ tone: 'hint', text: `Der lange Ausläufer liegt links, der Gipfel rechts: linksschief. Darum liegt das Mittel (${de(truth.mean)}) unter dem Median (${truth.median}).` });
  return notes;
}

/* ---------- Teil 2 · Silhouetten ---------- */

/** Höhen der Silhouette: ein Balken je Code (Kategorien) oder je ganzer Einheit (metrisch, ohne Lücken). */
export function silhouetteBars(sav: SavFile, name: string): number[] {
  const values = column(sav, name).filter(x => !Number.isNaN(x));
  if (!values.length) return [];
  if (VARS[name].level !== 'metric') {
    const codes = [...new Set(values)].sort((a, b) => a - b);
    return codes.map(c => values.filter(x => x === c).length);
  }
  const lo = Math.floor(Math.min(...values)), hi = Math.floor(Math.max(...values));
  const bars = Array.from({ length: hi - lo + 1 }, () => 0);
  for (const x of values) bars[Math.floor(x) - lo]++;
  return bars;
}

export function heaping(sav: SavFile): { at40: number; round: number } {
  const v = column(sav, 'dw15').filter(x => !Number.isNaN(x));
  return { at40: v.filter(x => x === 40).length, round: v.length ? v.filter(x => x % 5 === 0).length / v.length : NaN };
}

export function silhouetteResults(state: GrafikState) {
  return SILHOUETTE_IDS.map(id => ({ id, chosen: state.silhouettes[id] ?? '', truth: SILHOUETTES[id], correct: state.silhouettes[id] === SILHOUETTES[id] }));
}

/** Warum die Form zu ihrer Frage passt – erst nach dem Auflösen sichtbar. */
export function silhouetteStory(sav: SavFile, id: SilhouetteId, chosen: string): string {
  const h = heaping(sav);
  const stories: Record<SilhouetteId, string> = {
    A: 'Fünf Stufen, der Gipfel auf der zweiten: Die meisten nennen ihre Gesundheit „gut“, nur wenige „schlecht“.',
    B: `Eine Nadel bei 40 (${h.at40.toLocaleString('de-DE')}-mal genau 40 Stunden) und kleine Spitzen bei runden Zahlen: Vollzeitwoche und gerundete Angaben. ${Math.round(h.round * 100)} % aller Angaben sind Vielfache von 5.`,
    C: 'Zehn Stufen, der Gipfel bei 5: Wer sich nicht festlegen will, wählt die Mitte. Die echte Mitte einer Skala von 1 bis 10 liegt bei 5,5 – die 5 steht knapp links davon.',
    D: 'Viele schmale Balken, links scharf abgeschnitten: Befragt werden nur Erwachsene ab 18. Der breite Buckel um 60 sind die geburtenstarken Jahrgänge der 1960er, nach oben dünnt es aus.',
  };
  const decoy = chosen === 'pa02a' ? ' Das politische Interesse hat auch fünf Stufen, sein Gipfel liegt aber in der Mitte („mittel“).' : '';
  return stories[id] + decoy;
}

/* ---------- Teil 3 · Bauplan ---------- */

export type BarsView = { kind: 'bars'; position: 'stack' | 'dodge' | 'fill'; categories: string[]; groups: string[]; counts: number[][]; ordered: boolean; xName: string; fillName: string };
export type HistView = { kind: 'histogram'; breaks: number[]; groups: string[]; counts: number[][]; ordered: boolean; xName: string; fillName: string };
export type Box = { label: string; n: number; q1: number; median: number; q3: number; lo: number; hi: number; outliers: number[] };
export type BoxView = { kind: 'boxplot'; horizontal: boolean; boxes: Box[]; min: number; max: number; catName: string; valueName: string };
export type PointsView = { kind: 'points'; jitter: boolean; xs: number[]; ys: number[]; xTicks: [number, string][]; yTicks: [number, string][]; xName: string; yName: string };
export type View = BarsView | HistView | BoxView | PointsView;

const isCat = (name: string) => VARS[name]?.level !== 'metric';
const title = (name: string) => VARS[name]?.title ?? name;
const geomOf = (id: GeomId) => GEOMS.find(g => g.id === id)!;

/** Fälle, bei denen alle verwendeten Variablen gültig sind (wie filter(!is.na(…)) in R). */
export function planRows(sav: SavFile, plan: Plan): { x: number[]; s: number[] } {
  const x = column(sav, plan.x), s = plan.second ? column(sav, plan.second) : [];
  const keep = x.map((v, i) => !Number.isNaN(v) && (!plan.second || !Number.isNaN(s[i])));
  return { x: x.filter((_, i) => keep[i]), s: plan.second ? s.filter((_, i) => keep[i]) : [] };
}

const sortedCodes = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);

/** Quantil wie stats::quantile(type = 7) – so rechnet ggplot2 die Kästen. Erwartet sortierte Werte. */
export function quantile7(sorted: number[], p: number): number {
  const h = (sorted.length - 1) * p, lo = Math.floor(h);
  return lo + 1 < sorted.length ? sorted[lo] + (h - lo) * (sorted[lo + 1] - sorted[lo]) : sorted[lo];
}

export function boxOf(label: string, values: number[]): Box {
  const x = [...values].sort((a, b) => a - b);
  const q1 = quantile7(x, 0.25), median = quantile7(x, 0.5), q3 = quantile7(x, 0.75), iqr = q3 - q1;
  const inside = x.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
  return { label, n: x.length, q1, median, q3, lo: inside[0], hi: inside[inside.length - 1], outliers: [...new Set(x.filter(v => v < inside[0] || v > inside[inside.length - 1]))] };
}

/** Kleine, reproduzierbare Streuung für geom_jitter() (gleiches Bild bei jedem Aufbau). */
const jitterAt = (i: number, salt: number) => {
  const s = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

function axisTicks(sav: SavFile, name: string, values: number[]): { pos: (v: number) => number; ticks: [number, string][] } {
  if (!isCat(name)) {
    const lo = Math.min(...values), hi = Math.max(...values), step = hi - lo > 40 ? 20 : hi - lo > 12 ? 5 : 2;
    const ticks: [number, string][] = [];
    for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push([t, String(t)]);
    return { pos: v => v, ticks };
  }
  const codes = sortedCodes(values);
  return { pos: v => codes.indexOf(v) + 1, ticks: codes.map((c, i) => [i + 1, codeLabel(sav, name, c)]) };
}

export type PlanResult = { view: View | null; notes: Note[]; n: number };

/** Was ggplot2 aus dem Bauplan macht: das Bild (oder keins) und die Meldungen, die R dazu ausgibt. */
export function planPreview(sav: SavFile, question: Question, plan: Plan): PlanResult {
  if (!plan.geom || !plan.x) return { view: null, notes: [], n: 0 };
  const geom = plan.geom, x = plan.x, second = plan.second, notes: Note[] = [];
  const rows = planRows(sav, plan), n = rows.x.length;
  const swapped = x === question.outcome && second === question.group;

  if (geom === 'bar' || geom === 'dodge' || geom === 'fill') {
    const codes = sortedCodes(rows.x);
    let fill = second;
    if (second && !isCat(second)) {
      notes.push({ tone: 'warn', text: `ggplot2 meldet: „The following aesthetics were dropped during statistical transformation: fill.“ ${title(second)} hat zu viele Werte für Farben – die Farbe fällt weg.` });
      fill = '';
    }
    const groupCodes = fill ? sortedCodes(rows.s) : [0];
    const counts = codes.map(c => groupCodes.map(g => rows.x.filter((v, i) => v === c && (!fill || rows.s[i] === g)).length));
    if (!isCat(x)) notes.push({ tone: codes.length > 15 ? 'warn' : 'hint', text: `geom_bar() zählt jeden einzelnen Wert von ${title(x)}: ${codes.length} Balken. ${codes.length > 15 ? 'Für viele Werte ist das Histogramm gebaut.' : ''}`.trim() });
    if (geom === 'fill' && !fill) notes.push({ tone: 'warn', text: 'Ohne fill ist jeder Balken genau 100 % hoch – das Bild zeigt nichts.' });
    if (fill && geom !== 'fill') {
      const totals = counts.map(r => r.reduce((a, b) => a + b, 0));
      const ratio = Math.max(...totals) / Math.max(1, Math.min(...totals));
      if (ratio > 1.3) notes.push({ tone: 'hint', text: `Die Balken zeigen Anzahlen, und die Gruppen sind ungleich groß (${codes.map((c, i) => `${codeLabel(sav, x, c)}: ${totals[i].toLocaleString('de-DE')}`).join(', ')}). Höhen vergleichen dann auch die Gruppengröße. Mit position = "fill" vergleichst du Anteile.` });
    }
    if (geom === 'fill' && fill) notes.push(swapped
      ? { tone: 'hint', text: `Jetzt summiert sich jede Stufe von „${title(x)}“ zu 100 %: Du siehst, woher die Menschen einer Antwortstufe kommen – nicht, wie die Gruppen antworten. Tausche x und fill.` }
      : { tone: 'ok', text: `Jeder Balken summiert sich zu 100 %: Anteile innerhalb jeder Gruppe von „${title(x)}“. In einer Kreuztabelle hießen sie Spaltenprozente (nächste Sitzung).` });
    if (fill && VARS[fill].level === 'ordinal' && geom !== 'fill') notes.push({ tone: 'hint', text: 'Geordnete Kategorien in der Farbe: Eine Farbskala mit Reihenfolge hilft beim Lesen, z. B. scale_fill_brewer(palette = "RdBu").' });
    return {
      view: { kind: 'bars', position: geom === 'bar' ? 'stack' : geom, categories: codes.map(c => codeLabel(sav, x, c)), groups: fill ? groupCodes.map(g => codeLabel(sav, fill, g)) : [''], counts, ordered: Boolean(fill) && VARS[fill].level === 'ordinal', xName: title(x), fillName: fill ? title(fill) : '' },
      notes, n,
    };
  }

  if (geom === 'histogram') {
    if (isCat(x)) return { view: null, n, notes: [{ tone: 'warn', text: `Fehler in R: „stat_bin() requires a continuous x aesthetic. The x aesthetic is discrete.“ ${title(x)} hat Kategorien – dafür ist geom_bar() da.` }] };
    let fill = second;
    if (second && !isCat(second)) {
      notes.push({ tone: 'warn', text: `ggplot2 meldet: „The following aesthetics were dropped during statistical transformation: fill.“ ${title(second)} hat zu viele Werte für Farben – die Farbe fällt weg.` });
      fill = '';
    }
    const lo = Math.min(...rows.x), hi = Math.max(...rows.x), bins = 30, width = (hi - lo) / (bins - 1) || 1;
    const start = lo - width / 2, breaks = Array.from({ length: bins + 1 }, (_, i) => start + i * width);
    const groupCodes = fill ? sortedCodes(rows.s) : [0];
    const counts = breaks.slice(0, -1).map(() => groupCodes.map(() => 0));
    rows.x.forEach((v, i) => {
      const b = clamp(Math.floor((v - start) / width), 0, bins - 1), g = fill ? groupCodes.indexOf(rows.s[i]) : 0;
      counts[b][g]++;
    });
    notes.push({ tone: 'hint', text: 'R meldet: „stat_bin() using bins = 30. Pick better value binwidth.“ Mit binwidth = 1 sähest du jede einzelne Stunde bzw. jedes Jahr.' });
    if (fill) notes.push({ tone: 'hint', text: `Gestapelt: Die Balken der zweiten Gruppe beginnen dort, wo die erste aufhört – schwer zu vergleichen. In R hilft facet_wrap(~ ${VARS[fill].rName}) oder ein Boxplot.` });
    else if (question.group !== x) notes.push({ tone: 'hint', text: `Ein Histogramm für alle zusammen: Wo ist die Gruppe „${title(question.group)}“ geblieben?` });
    return { view: { kind: 'histogram', breaks, groups: fill ? groupCodes.map(g => codeLabel(sav, fill, g)) : [''], counts, ordered: Boolean(fill) && VARS[fill].level === 'ordinal', xName: title(x), fillName: fill ? title(fill) : '' }, notes, n };
  }

  if (geom === 'boxplot') {
    const y = second;
    if (!y) {
      if (isCat(x)) return { view: null, n, notes: [{ tone: 'warn', text: 'Ohne metrische Variable hat ein Boxplot nichts, was er zusammenfassen kann.' }] };
      notes.push({ tone: 'hint', text: `Eine Box für alle: Wo ist die Gruppe „${title(question.group)}“ geblieben?` });
      const b = boxOf('alle', rows.x);
      return { view: { kind: 'boxplot', horizontal: true, boxes: [b], min: Math.min(...rows.x), max: Math.max(...rows.x), catName: '', valueName: title(x) }, notes, n };
    }
    if (isCat(x) && isCat(y)) return { view: null, n, notes: [{ tone: 'warn', text: `Ein Boxplot braucht Werte mit Abständen. ${title(x)} und ${title(y)} sind beide Kategorien – Kästen entstehen so nicht. Für zwei Kategorien: Balken auf 100 %.` }] };
    const horizontal = !isCat(x) && isCat(y), both = !isCat(x) && !isCat(y);
    const cat = horizontal ? y : x, val = horizontal ? rows.x : rows.s, catValues = horizontal ? rows.s : rows.x;
    let boxes: Box[];
    if (both) {
      notes.push({ tone: 'warn', text: `ggplot2 meldet: „Continuous x aesthetic – did you forget aes(group = …)?“ Ohne Gruppen entsteht nur eine Box. Altersgruppen müsstest du erst bilden, z. B. mit rec().` });
      boxes = [boxOf('alle', rows.s)];
    } else {
      boxes = sortedCodes(catValues).map(c => boxOf(codeLabel(sav, cat, c), val.filter((_, i) => catValues[i] === c)));
      if (horizontal) notes.push({ tone: 'ok', text: 'Liegend: ggplot2 dreht den Boxplot selbst, wenn die Kategorien auf y stehen.' });
      if (swapped && !horizontal) notes.push({ tone: 'hint', text: 'Die Rollen sind vertauscht.' });
      const small = boxes.filter(b => b.n < 30), large = boxes.filter(b => b.n >= 30);
      if (small.length && large.length) notes.push({ tone: 'hint', text: `Hinter ${small.map(b => `„${b.label}“`).join(', ')} stehen nur ${small.map(b => b.n).join(', ')} Personen, hinter den anderen Kästen je mindestens ${Math.min(...large.map(b => b.n)).toLocaleString('de-DE')}. Sieht man das dem Kasten an?` });
      notes.push({ tone: 'ok', text: `Der dicke Strich ist der Median, der Kasten reicht vom ersten zum dritten Quartil: ${(large.length ? large : boxes).map(b => `${b.label} ${de(b.median)} (${de(b.q1)}–${de(b.q3)})`).join(', ')}.` });
    }
    return { view: { kind: 'boxplot', horizontal, boxes, min: Math.min(...val), max: Math.max(...val), catName: both ? '' : title(cat), valueName: both ? title(y) : title(horizontal ? x : y) }, notes, n };
  }

  // geom_point / geom_jitter
  if (!second) return { view: null, n, notes: [{ tone: 'warn', text: 'Fehler in R: „geom_point() requires the following missing aesthetics: y.“ Punkte brauchen x und y.' }] };
  const jitter = geom === 'jitter';
  const ax = axisTicks(sav, x, rows.x), ay = axisTicks(sav, second, rows.s);
  const xs = rows.x.map((v, i) => ax.pos(v) + (jitter ? 0.3 * jitterAt(i, 1) : 0));
  const ys = rows.s.map((v, i) => ay.pos(v) + (jitter ? 0.3 * jitterAt(i, 2) : 0));
  const distinct = new Set(rows.x.map((v, i) => `${v}|${rows.s[i]}`)).size;
  if (!jitter) notes.push({ tone: 'hint', text: `${n.toLocaleString('de-DE')} Personen, aber nur ${distinct.toLocaleString('de-DE')} verschiedene Punkte: Die meisten liegen genau übereinander. Wo ist die Wolke dicht?` });
  else if (isCat(x) && isCat(second)) notes.push({ tone: 'hint', text: 'Gestreute Punkte über zwei Kategorien zeigen Häufungen, aber Anteile lassen sich kaum ablesen. Für zwei Kategorien gibt es Balken auf 100 %.' });
  else if (isCat(x) || isCat(second)) notes.push({ tone: 'hint', text: 'Gestreute Punkte über Kategorien zeigen, wie viele Menschen wo liegen. Ein Boxplot fasst dasselbe knapper zusammen.' });
  else notes.push({ tone: 'ok', text: 'Gestreut und halb durchsichtig (alpha) sieht man, wo die Wolke dicht ist. Ob sie steigt, zeigt dir in R zusätzlich geom_smooth(method = "lm").' });
  if (swapped) notes.push({ tone: 'hint', text: 'Die Rollen sind vertauscht: Üblich steht das, wonach man vergleicht, auf x.' });
  return { view: { kind: 'points', jitter, xs, ys, xTicks: ax.ticks, yTicks: ay.ticks, xName: title(x), yName: title(second) }, notes, n };
}

/** Der Bauplan in ggplot2-Sprache – nur die Zeilen, die die Entscheidung ausdrücken. */
export function planCode(plan: Plan): string {
  if (!plan.geom || !plan.x) return '';
  const g = geomOf(plan.geom), name = (v: string) => VARS[v].rName;
  const aes = [`x = ${name(plan.x)}`, plan.second ? `${g.role} = ${name(plan.second)}` : ''].filter(Boolean).join(', ');
  return `ggplot(aes(${aes})) +\n  ${g.code}`;
}

/** Vollständiges R-Skript zum Bauplan (Hilfestufe 4). */
export function rCodeFor(question: Question, plan: Plan): string {
  const vars = [plan.x || question.group, plan.second].filter(Boolean);
  const geom = plan.geom ? geomOf(plan.geom) : geomOf('bar');
  const cats = vars.filter(isCat), name = (v: string) => VARS[v].rName;
  const mutate = cats.length ? `  mutate(${cats.map(v => `${name(v)} = to_label(${v})`).join(', ')}) %>%\n` : '';
  const filter = `  filter(${vars.map(v => `!is.na(${name(v)})`).join(', ')})`;
  const aes = [`x = ${name(vars[0])}`, plan.second ? `${geom.role} = ${name(plan.second)}` : ''].filter(Boolean).join(', ');
  return `# Teil 3 · ${question.text}
bild <- allbus %>%
${mutate}${filter}

bild %>% nrow()   # So viele Menschen stecken im Bild: n für die Bildunterschrift

bild %>%
  ggplot(aes(${aes})) +
  ${geom.code} +
  labs(
    title   = "${question.text}",
    caption = "ALLBUS 2023, ungewichtet, n = ___"
  )`;
}

const captionNumbers = (text: string) =>
  [...text.matchAll(/\d{1,3}(?:[.   ]\d{3})+|\d+/g)].map(m => Number(m[0].replace(/[.   ]/g, '')));

/** Prüft die Bildunterschrift: Stimmt n? Steht die Quelle drin? */
export function checkCaption(sav: SavFile, plan: Plan, caption: string): Note[] {
  if (!caption.trim() || !plan.geom || !plan.x) return [];
  const n = planRows(sav, plan).x.length, numbers = captionNumbers(caption), notes: Note[] = [];
  const single = [plan.x, plan.second].filter(Boolean).map(v => column(sav, v).filter(x => !Number.isNaN(x)).length);
  if (numbers.includes(n)) notes.push({ tone: 'ok', text: `n = ${n.toLocaleString('de-DE')} stimmt: So viele Menschen stecken in deinem Bild.` });
  else if (numbers.includes(sav.nCases)) notes.push({ tone: 'warn', text: `${sav.nCases.toLocaleString('de-DE')} sind alle Befragten. Wie viele stecken in deinem Bild, wenn fehlende Angaben wegfallen?` });
  else if (numbers.some(x => single.includes(x))) notes.push({ tone: 'hint', text: 'Das ist das n einer einzelnen Variable. Im Bild stehen nur Menschen, die beide Fragen beantwortet haben.' });
  else notes.push({ tone: 'warn', text: 'Ich finde kein passendes n. Zähl in R mit nrow(), wer nach filter() übrig bleibt.' });
  if (!/allbus/i.test(caption)) notes.push({ tone: 'hint', text: 'Ins Schulbuch gehört auch die Quelle: ALLBUS 2023.' });
  if (plan.second === 'ps03' || plan.x === 'ps03') {
    const all = column(sav, 'ps03').length, asked = single[[plan.x, plan.second].filter(Boolean).indexOf('ps03')];
    if (numbers.includes(n) && asked < all * 0.8) notes.push({ tone: 'hint', text: `Nur ${asked.toLocaleString('de-DE')} von ${all.toLocaleString('de-DE')} Befragten haben eine gültige Antwort zur Demokratie: Die Frage stand nur in einem Teil der Fragebögen.` });
  }
  return notes;
}

/* ---------- Teil 4 · Achse ---------- */

export function regionMeans(sav: SavFile): { west: number; east: number } {
  const ls = column(sav, 'ls01'), ew = column(sav, 'eastwest');
  const mean = (code: number) => {
    const v = ls.filter((x, i) => !Number.isNaN(x) && ew[i] === code);
    return v.reduce((a, b) => a + b, 0) / v.length;
  };
  return { west: mean(1), east: mean(2) };
}

/** Oberes Ende der y-Achse: knapp über dem größeren Balken, wie ggplot2 es ohne Vorgabe wählt (gerundet auf eine Stelle). */
export const axisTop = (m: { west: number; east: number }) => Math.ceil((Math.max(m.west, m.east) + 0.03) * 10) / 10;

/** Wievielmal so hoch ist der West-Balken im Bild, wenn die Achse bei `start` beginnt? */
export const pictureRatio = (m: { west: number; east: number }, start: number) => (m.west - start) / (m.east - start);

const meanFits = (input: string, target: number) => numberReadings(input).some(r => near(r.x, target, Math.max(halfUnit(r.decimals), 0.005)));

export function checkMeans(sav: SavFile, axis: GrafikState['axis']): Note[] {
  const m = regionMeans(sav), notes: Note[] = [];
  for (const [key, label, target, other] of [['west', 'West', m.west, m.east], ['east', 'Ost', m.east, m.west]] as const) {
    const input = axis[key];
    if (!input.trim()) continue;
    if (meanFits(input, target)) notes.push({ tone: 'ok', text: `${label}: ${de(target, 2)} stimmt.` });
    else if (meanFits(input, other)) notes.push({ tone: 'warn', text: `${label}: Das ist der Wert der anderen Gruppe.` });
    else notes.push({ tone: 'warn', text: `${label}: Diese Zahl passt nicht. Hast du group_by() vor summarise() gesetzt und na.rm = TRUE?` });
  }
  return notes;
}

export const meansOk = (sav: SavFile, axis: GrafikState['axis']) => checkMeans(sav, axis).filter(n => n.tone === 'ok').length === 2;

export function axisNotes(sav: SavFile, start: number): Note[] {
  const m = regionMeans(sav), picture = pictureRatio(m, start), data = m.west / m.east;
  const notes: Note[] = [{ tone: start === 0 ? 'ok' : picture > 1.5 ? 'warn' : 'hint', text: `Im Bild ist der West-Balken ${de(picture, 2)}-mal so hoch wie der Ost-Balken. In den Daten: ${de(m.west, 2)} zu ${de(m.east, 2)}, also ${de(data, 2)}-mal.` }];
  if (start > 0) notes.push({ tone: 'hint', text: `Wer bei ${de(start)} beginnt, muss das sagen: Ein Hinweis „Achse beginnt bei ${de(start)}“ gehört ins Bild. Bei Balken misst das Auge die Länge.` });
  return notes;
}

/* ---------- Ergebnis ---------- */

export function plenumLines(sav: SavFile, s: GrafikState): [string, string][] {
  const truth = sketchTruth(sav), own = sketchSummary(s.sketch), away = s.locked && readOk(truth, s.sketch, s.read) ? misplaced(s.sketch, truth) : null;
  const right = silhouetteResults(s).filter(r => r.correct).length;
  const q = s.question ? questionById(s.question) : null;
  const geom = s.plan.geom ? GEOMS.find(g => g.id === s.plan.geom)!.label : '';
  const roles = s.plan.x ? `x = ${s.plan.x}${s.plan.second ? `, ${GEOMS.find(g => g.id === s.plan.geom)?.role ?? 'fill'} = ${s.plan.second}` : ''}` : '';
  const m = regionMeans(sav);
  return [
    ['Gipfel: Skizze · Grafik', s.locked && own ? `${own.peak} · ${s.read.peak.trim() || '–'}` : ''],
    ['An anderer Stelle skizziert', away === null ? '' : `${away} von 100`],
    ['Silhouetten richtig', s.solved ? `${right} von 4` : ''],
    ['Leitfrage · Bauplan', q && geom ? `${q.short} · ${geom} (${roles})` : ''],
    ['Bildunterschrift', s.caption.trim()],
    ['Achse ab · Bildfaktor', meansOk(sav, s.axis) && s.axis.reason.trim() ? `${de(s.axis.start)} · ${de(pictureRatio(m, s.axis.start), 2)}-mal (Daten: ${de(m.west / m.east, 2)}-mal)` : ''],
  ];
}

export function rSolution(question: Question, plan: Plan): string {
  return `${R_SETUP}\n\n${R_SKETCH}\n\n${R_SILHOUETTES}\n\n${rCodeFor(question, plan)}\n\n${R_AXIS}\n`;
}
