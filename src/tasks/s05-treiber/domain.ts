import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { crosstab, MEASURES, permutationV, validValues, type MeasureId } from '../kit/stats';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { CARD_IDS, cardById, CARDS, KONF_ORDERS, LAGE, LEVEL_MEASURES, STAMPS, type Card, type CardId, type Level, type Stamp } from './content';

export const MEASURE_IDS = ['V', 'phi', 'gamma', 'tau', 'rho', 'r'] as const satisfies readonly MeasureId[];
const SIGNED: MeasureId[] = ['gamma', 'tau', 'rho', 'r'];

/** Spalten, die alle Karten brauchen: Zufriedenheit (umgepolt und original), Gewicht, Landesteil, Wirtschaftslage-Gruppe. */
export type Prepared = { sav: SavFile; y: Float64Array; yOrig: Float64Array; w: Float64Array; east: Float64Array; lage: Float64Array };

export function prepare(sav: SavFile): Prepared {
  const yOrig = validValues(sav.byName.get('ps03')!);
  const ep01 = validValues(sav.byName.get('ep01')!);
  return {
    sav, yOrig,
    // rec(ps03, rules = "rev"): max + min − x = 7 − x, höher = zufriedener
    y: Float64Array.from(yOrig, v => (Number.isNaN(v) ? NaN : 7 - v)),
    w: validValues(sav.byName.get('wghtpew')!),
    east: validValues(sav.byName.get('eastwest')!),
    lage: Float64Array.from(ep01, v => (v <= 2 ? 1 : v === 3 ? 2 : v <= 5 ? 3 : NaN)),
  };
}

/** Werte einer Karte, nach der Umkodierung wie in R. */
export function cardValues(p: Prepared, card: Card, map = card.recode?.map): Float64Array {
  const raw = validValues(p.sav.byName.get(card.source)!);
  return map ? Float64Array.from(raw, v => (Number.isNaN(v) ? NaN : map(v) ?? NaN)) : raw;
}

export type Stratum = { label: string; keep: (i: number) => boolean };
/** West und Ost – bei der Karte „West oder Ost“ stattdessen die Wirtschaftslage als Drittvariable. */
export function strata(p: Prepared, card: Card): Stratum[] {
  if (card.id === 'eastwest') return LAGE.groups.map((label, g) => ({ label: `Wirtschaftslage ${label}`, keep: i => p.lage[i] === g + 1 }));
  return [{ label: 'West', keep: i => p.east[i] === 1 }, { label: 'Ost', keep: i => p.east[i] === 2 }];
}
const only = (x: Float64Array, keep: (i: number) => boolean) => Float64Array.from(x, (v, i) => (keep(i) ? v : NaN));

export type Variant = { measure: MeasureId; weighted: boolean; stratum: number; reversed: boolean; value: number };

/** Alle Werte einer Karte: Maß × Gewicht × gesamt/Landesteile × ps03 umgepolt oder original. */
export function variants(p: Prepared, card: Card): Variant[] {
  const x = cardValues(p, card), groups = strata(p, card), out: Variant[] = [];
  for (const measure of MEASURE_IDS) for (const reversed of SIGNED.includes(measure) ? [true, false] : [true]) {
    const y = reversed ? p.y : p.yOrig;
    for (const weighted of [true, false]) for (let s = -1; s < groups.length; s++) {
      const keep = s < 0 ? () => true : groups[s].keep;
      out.push({ measure, weighted, stratum: s, reversed, value: MEASURES[measure].fn(only(y, keep), only(x, keep), weighted ? p.w : null) });
    }
  }
  return out;
}

const decimals = (s: string) => (s.trim().replace(/^[−–-]/, '').split(/[.,]/)[1] ?? '').length;
/** Toleranz aus den eingegebenen Nachkommastellen: 0,54 → ±0,005; 0,544 → ±0,0005. */
export const tolerance = (input: string) => (decimals(input) >= 2 ? 0.5 * 10 ** -decimals(input) + 1e-9 : null);

const fmt = (x: number) => de(x, 3);
export const measureLabel = (m: MeasureId) => MEASURES[m].label;
const variantText = (v: Variant, groups: string[]) =>
  `${measureLabel(v.measure)} ${v.weighted ? 'mit' : 'ohne'} Gewicht${v.stratum >= 0 ? ` (${groups[v.stratum]})` : ''}${v.reversed ? '' : ' mit ps03 in der Originalkodierung'} = ${fmt(v.value)}`;

/** Richtungssatz in Worten. */
export function direction(card: Card, value: number): string {
  if (card.high === null || Math.abs(value) < 0.005) return 'Eine Richtung lässt sich hier nicht angeben.';
  return `Wer ${card.high}, ist eher ${value > 0 ? 'zufriedener' : 'unzufriedener'} mit der Demokratie.`;
}

export type Entry = { measure: MeasureId | ''; weighted: boolean; value: string };

/** Wertedetektor: Welcher Variante entspricht die eingetragene Zahl? */
export function checkEntry(p: Prepared, card: Card, vars: Variant[], e: Entry): Note[] {
  const x = parseNumber(e.value);
  if (x === null || !e.measure) return [];
  const tol = tolerance(e.value);
  if (tol === null) return [{ tone: 'hint', text: 'Trag den Wert mit drei Nachkommastellen ein, so wie R ihn zeigt.' }];
  const groups = strata(p, card).map(s => s.label);
  const hits = vars.filter(v => Math.abs(v.value - x) <= tol).sort((a, b) => Math.abs(a.value - x) - Math.abs(b.value - x));
  const notes: Note[] = [];
  if (e.measure === 'rho' && e.weighted) notes.push({ tone: 'hint', text: 'spearman_rho() nutzt Gewichte nur zur Fallauswahl – gewichtet und ungewichtet ist ρ hier gleich.' });
  const want = hits.find(v => v.measure === e.measure && v.weighted === e.weighted && v.stratum < 0 && v.reversed);
  if (want) return [...notes, { tone: 'ok', text: `Stimmt: ${variantText(want, groups)}. ${SIGNED.includes(want.measure) ? direction(card, want.value) : ''}`.trim() }];
  const same = hits.find(v => v.measure === e.measure && v.stratum < 0 && v.reversed);
  if (same) return [...notes, { tone: 'hint', text: `Das ist ${variantText(same, groups)}. ${e.weighted ? 'Für Deutschland rechnest du mit weights = wghtpew.' : 'Du hast oben „ohne Gewicht“ angegeben.'}` }];
  const orig = hits.find(v => !v.reversed);
  if (orig) return [...notes, { tone: 'warn', text: `Das ist ${variantText(orig, groups)}. Das Vorzeichen passt zu ps03 mit 1 = sehr zufrieden – hast du ps03 zuerst umgepolt?` }];
  const part = hits.find(v => v.stratum >= 0);
  if (part) return [...notes, { tone: 'hint', text: `Das ist ${variantText(part, groups)} – gesucht ist hier der Wert für ganz Deutschland.` }];
  if (hits[0]) return [...notes, { tone: 'hint', text: `Das ist ${variantText(hits[0], groups)} – oben hast du ${measureLabel(e.measure)} gewählt.` }];
  return [...notes, { tone: 'warn', text: 'Diesen Wert finde ich für diese Karte nicht. Prüfe Umpolen, Umkodierung und Gewicht.' }];
}

/** Werte für die Landesteile (bzw. Wirtschaftslage-Gruppen): mit oder ohne Gewicht, ps03 umgepolt. */
export function checkStrata(p: Prepared, card: Card, vars: Variant[], measure: MeasureId | '', inputs: string[]): Note[] {
  if (!measure) return [];
  const groups = strata(p, card).map(s => s.label);
  return inputs.flatMap((input, s): Note[] => {
    const x = parseNumber(input), tol = tolerance(input);
    if (x === null || s >= groups.length) return [];
    if (tol === null) return [{ tone: 'hint', text: `${groups[s]}: bitte mit drei Nachkommastellen.` }];
    const hit = vars.find(v => v.measure === measure && v.stratum === s && v.reversed && Math.abs(v.value - x) <= tol);
    const other = vars.find(v => Math.abs(v.value - x) <= tol);
    return [hit
      ? { tone: 'ok', text: `${groups[s]}: ${measureLabel(measure)} = ${fmt(hit.value)} – stimmt.` }
      : { tone: 'warn', text: other ? `${groups[s]}: Das ist ${variantText(other, groups)}.` : `${groups[s]}: Diesen Wert finde ich nicht. Filtere mit filter() oder group_by() und rechne dasselbe Maß.` }];
  });
}

/** Offengelegte Stempel-Regel. */
export const STAMP_RULE = 'kehrt sich um: Die Landesteile haben verschiedene Vorzeichen, beide mindestens 0,03 vom Nullpunkt entfernt. · nur in einem Landesteil: Ein Wert ist mindestens doppelt so groß wie der andere, und der kleinere liegt unter 0,1. · schrumpft: Im Mittel liegen die Landesteile unter 85 % des Gesamtwerts. · Sonst: trägt.';

export function stampReading(total: number, parts: number[], signed: boolean): Stamp {
  const abs = parts.map(Math.abs);
  if (signed && parts.some(a => a >= 0.03) && parts.some(a => a <= -0.03)) return 'kehrt sich um';
  if (Math.max(...abs) >= 2 * Math.min(...abs) && Math.min(...abs) < 0.1) return 'nur in einem Landesteil';
  if (abs.reduce((a, b) => a + b, 0) / abs.length < 0.85 * Math.abs(total)) return 'schrumpft';
  return 'trägt';
}

export function checkStamp(p: Prepared, card: Card, vars: Variant[], measure: MeasureId | '', stamp: Stamp | ''): Note[] {
  if (!stamp) return [];
  const m = measure || LEVEL_MEASURES[card.level][0];
  const total = vars.find(v => v.measure === m && v.weighted && v.stratum < 0 && v.reversed)!.value;
  const parts = strata(p, card).map((_, s) => vars.find(v => v.measure === m && !v.weighted && v.stratum === s && v.reversed)!.value);
  const mine = stampReading(total, parts, SIGNED.includes(m));
  const where = card.id === 'eastwest' ? 'in den drei Wirtschaftslage-Gruppen' : 'in West und Ost';
  const values = `${measureLabel(m)} gesamt ${fmt(total)}, ${where} ${parts.map(fmt).join(' / ')}`;
  return stamp === mine
    ? [{ tone: 'ok', text: `Meine Lesart nach der offengelegten Regel ist auch „${mine}“ (${values}).` }]
    : [{ tone: 'hint', text: `Nach der offengelegten Regel lese ich „${mine}“ (${values}). Du stempelst „${stamp}“ – die Entscheidung bleibt bei dir; begründe sie im Satz.` }];
}

/** Passung von Maß und Skalenniveau: Denkanstöße, keine Bewertung. */
export function fitNotes(p: Prepared, card: Card, vars: Variant[], measure: MeasureId | ''): Note[] {
  if (!measure) return [];
  const v = (m: MeasureId, weighted = true) => vars.find(x => x.measure === m && x.weighted === weighted && x.stratum < 0 && x.reversed)!.value;
  const notes: Note[] = [];
  const x = cardValues(p, card), t = crosstab(p.y, x);
  if (measure === 'V' && card.level !== 'nominal') {
    const rv = permutationV(p.y, x, p.w);
    notes.push({ tone: 'hint', text: v('V') < 1.5 * rv
      ? `Zufalls-V: Vertauscht man die Zufriedenheit zufällig, ergibt sich schon V ≈ ${fmt(rv)}. Dein V (${fmt(v('V'))}) ist fast nur Tabellengröße.`
      : `V nutzt die Reihenfolge der Stufen nicht. Zum Vergleich: Zufalls-V ≈ ${fmt(rv)}.` });
  }
  if (measure === 'phi' && Math.min(t.rows.length, t.cols.length) > 2) notes.push({ tone: 'hint', text: `Phi ist für Vierfeldertafeln gedacht; diese Tabelle ist ${t.rows.length}×${t.cols.length} groß – Phi kann hier über 1 steigen. Nimm Cramér-V.` });
  if ((measure === 'gamma' || measure === 'tau') && card.id === 'konf') {
    const gammas = KONF_ORDERS.map(o => MEASURES.gamma.fn(p.y, cardValues(p, card, o.map), p.w));
    notes.push({ tone: 'warn', text: `Die Reihenfolge der Konfessionen ist willkürlich. Gamma je nach Reihenfolge: ${gammas.map(fmt).join(' / ')} (${KONF_ORDERS.map(o => o.label).join(' | ')}).` });
  }
  if (measure === 'gamma' && card.id !== 'konf') notes.push({ tone: 'hint', text: `Gamma übergeht Paare mit Bindungen und liegt deshalb über Tau-b (γ ${fmt(v('gamma'))}, τ ${fmt(v('tau'))}).` });
  if (measure === 'r' && card.level === 'ordinal') notes.push({ tone: 'hint', text: 'Pearson-r setzt gleiche Abstände zwischen den Stufen voraus. Hält das für diese Skala?' });
  return notes;
}

export function checkLevel(card: Card, level: Level | ''): Note[] {
  if (!level) return [];
  if (level === card.level || level === card.alsoLevel) return [{ tone: 'ok', text: `${level} – passt. Dazu passen ${LEVEL_MEASURES[level].map(measureLabel).join(', ')}.` }];
  return [{ tone: 'hint', text: `Schau noch einmal ins Codebuch: ${card.question}` }];
}

/* ---------- Enthüllung: Rangliste in vier Währungen ---------- */

export const CURRENCIES = ['V', 'gamma', 'tau', 'r'] as const satisfies readonly MeasureId[];
export const VIEWS = ['weighted', 'unweighted', 'west', 'ost'] as const;
export type View = typeof VIEWS[number];
export const VIEW_LABELS: Record<View, string> = { weighted: 'gewichtet', unweighted: 'ohne Gewicht', west: 'nur West', ost: 'nur Ost' };
export type Reveal = Record<View, Record<CardId, Record<typeof CURRENCIES[number], number>>>;

export function reveal(p: Prepared): Reveal {
  const out = {} as Reveal;
  for (const view of VIEWS) {
    out[view] = {} as Reveal[View];
    const keep = view === 'west' ? (i: number) => p.east[i] === 1 : view === 'ost' ? (i: number) => p.east[i] === 2 : () => true;
    const y = only(p.y, keep), w = view === 'weighted' ? p.w : null;
    for (const card of CARDS) {
      const x = only(cardValues(p, card), keep);
      out[view][card.id] = Object.fromEntries(CURRENCIES.map(m => [m, card.id === 'eastwest' && (view === 'west' || view === 'ost') ? NaN : MEASURES[m].fn(y, x, w)])) as Reveal[View][CardId];
    }
  }
  return out;
}

/** Rangplätze nach Betrag (1 = stärkster Zusammenhang); nicht berechenbare Werte bekommen keinen Platz. */
export function ranks(values: Partial<Record<CardId, number>>): Partial<Record<CardId, number>> {
  const sorted = (Object.entries(values) as [CardId, number][]).filter(([, v]) => Number.isFinite(v)).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  return Object.fromEntries(sorted.map(([id], i) => [id, i + 1]));
}

export function revealNotes(r: Reveal, view: View): string[] {
  const byCurrency = Object.fromEntries(CURRENCIES.map(m => [m, ranks(Object.fromEntries(CARD_IDS.map(id => [id, r[view][id][m]])))])) as Record<typeof CURRENCIES[number], Partial<Record<CardId, number>>>;
  const notes: string[] = [];
  let jump: { id: CardId; from: number; to: number; m: string } | null = null;
  for (const id of CARD_IDS) for (const m of ['gamma', 'tau', 'r'] as const) {
    const a = byCurrency.V[id], b = byCurrency[m][id];
    if (a && b && (!jump || Math.abs(b - a) > Math.abs(jump.to - jump.from))) jump = { id, from: a, to: b, m: measureLabel(m) };
  }
  if (jump) notes.push(`${cardById[jump.id].title} steht bei V auf Platz ${jump.from}, bei ${jump.m} auf Platz ${jump.to}.`);
  const joker = CARDS.find(c => c.joker);
  if (joker && CURRENCIES.every(m => byCurrency[m][joker.id] === 1)) notes.push(`Der Joker „${cardById[joker.id].title}“ steht in allen vier Währungen auf Platz 1 – kein Wunder: Er misst fast dasselbe wie die Demokratiezufriedenheit.`);
  const without = Object.fromEntries(CURRENCIES.map(m => [m, ranks(Object.fromEntries(CARD_IDS.filter(id => !cardById[id].joker).map(id => [id, r[view][id][m]])))])) as typeof byCurrency;
  const firsts = CARD_IDS.filter(id => !cardById[id].joker && CURRENCIES.every(m => without[m][id] === 1));
  if (firsts.length) notes.push(`Unter den übrigen Kandidaten steht nur ${cardById[firsts[0]].title} in allen vier Währungen vorn.`);
  if (view === 'weighted') {
    const age = r.weighted.age.r, ageU = r.unweighted.age.r;
    notes.push(`Mit Gewicht ändert sich r für das Alter von ${fmt(ageU)} auf ${fmt(age)}: In West (${fmt(r.west.age.r)}) und Ost (${fmt(r.ost.age.r)}) zeigt der Zusammenhang in verschiedene Richtungen, ungewichtet rechnet die Ost-Überquote das gegeneinander auf.`);
    notes.push(`Für West oder Ost bleibt Gamma mit Gewicht fast gleich (${fmt(r.unweighted.eastwest.gamma)} → ${fmt(r.weighted.eastwest.gamma)}), V nicht (${fmt(r.unweighted.eastwest.V)} → ${fmt(r.weighted.eastwest.V)}).`);
  }
  return notes;
}

/* ---------- Gegenfrage, Zustand, Karte, R-Code ---------- */

export const DRIVER_WORDS = /\b(treib\w*|Treiber|bewirk\w*|verursach\w*|weil|führt|führen|sorgt|macht\s+\w+\s+zufrieden)\b/i;

export function driverQuestion(text: string): Note[] {
  return DRIVER_WORDS.test(text)
    ? [{ tone: 'hint', text: 'Du schreibst von einer Ursache. Zeigt ein Zusammenhangsmaß, was was bewirkt? Welche Drittvariable könnte beides beeinflussen – und kann die Richtung auch umgekehrt sein?' }]
    : [];
}

export type S05State = {
  mode: WorkMode;
  card: CardId | null;
  level: Level | '';
  measure: MeasureId | '';
  weighted: boolean;
  value: string;
  strata: string[];
  stamp: Stamp | '';
  sentence: string;
  second: { measure: MeasureId | ''; value: string; unweighted: string; veto: boolean };
  view: View;
  recommendation: string;
};

export const initialS05 = (): S05State => ({
  mode: 'solo', card: null, level: '', measure: '', weighted: true, value: '', strata: ['', '', ''], stamp: '', sentence: '',
  second: { measure: '', value: '', unweighted: '', veto: false }, view: 'weighted', recommendation: '',
});

export function parseS05(raw: unknown): S05State {
  const r = record(raw), sec = record(r.second), strataRaw = Array.isArray(r.strata) ? r.strata : [];
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    card: typeof r.card === 'string' && (CARD_IDS as string[]).includes(r.card) ? r.card as CardId : null,
    level: oneOf(r.level, ['nominal', 'ordinal', 'metrisch', ''] as const, ''),
    measure: oneOf(r.measure, [...MEASURE_IDS, ''] as const, ''),
    weighted: bool(r.weighted, true), value: str(r.value, 12),
    strata: [0, 1, 2].map(i => str(strataRaw[i], 12)),
    stamp: oneOf(r.stamp, [...STAMPS, ''] as const, ''), sentence: str(r.sentence, 600),
    second: { measure: oneOf(sec.measure, [...MEASURE_IDS, ''] as const, ''), value: str(sec.value, 12), unweighted: str(sec.unweighted, 12), veto: bool(sec.veto) },
    view: oneOf(r.view, VIEWS, 'weighted'), recommendation: str(r.recommendation, 800),
  };
}

export function statusS05(s: S05State): TaskStatus {
  if (s.card && s.measure && s.value.trim() && s.stamp && s.sentence.trim() && s.recommendation.trim()) return 'done';
  return s.card || s.level || s.measure || s.value.trim() || s.sentence.trim() || s.recommendation.trim() ? 'running' : 'open';
}

export function plenumLines(s: S05State): [string, string][] {
  const card = s.card ? cardById[s.card] : null;
  return [
    ['Kandidat', card ? `${card.title} (${card.id})` : ''],
    ['Maß = Wert · Stempel', s.measure && s.value.trim() ? `${measureLabel(s.measure)} = ${s.value.trim()}${s.stamp ? ` · ${s.stamp}` : ''}` : ''],
    ['Zweite Währung', s.second.measure && s.second.value.trim() ? `${measureLabel(s.second.measure)} = ${s.second.value.trim()}` : ''],
    ['„Treiber“?', s.second.veto ? 'Veto: kein Treiber' : ''],
    ['Satz für den Fonds', s.sentence.trim()],
    ['Empfehlung', s.recommendation.trim()],
  ];
}

/** Einlesen, ps03 umpolen und die Karte umkodieren. */
export function rSetupFor(card: Card): string {
  const recode = card.recode ? `,\n    ${card.id} = rec(${card.source}, rules = "${card.recode.rules}")` : '';
  return ['library(mariposa)', 'library(dplyr)', '',
    'allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav',
    'allbus <- allbus %>%',
    `  mutate(zufriedenheit = rec(ps03, rules = "rev")${recode})   # umgepolt: höher = zufriedener`].join('\n');
}

/** Vollständiger R-Code für eine Karte (Hilfestufe 4). */
export function rCodeFor(card: Card): string {
  const x = card.id;
  // Bei metrischen Karten wäre die Kreuztabelle zu lang (Alter: 79 Zeilen) – dort genügen die Korrelationen.
  const head = card.level === 'metrisch' ? [rSetupFor(card), ''] : [
    rSetupFor(card), '',
    '# Überblick: Zeilenprozente, gewichtet',
    `allbus %>% crosstab(${x}, zufriedenheit, percentages = "row", weights = wghtpew) %>% summary()`, '',
  ];
  const measure = card.level === 'nominal'
    ? ['# Maß: Cramér-V, gewichtet und ohne Gewicht', `allbus %>% cramers_v(zufriedenheit, ${x}, weights = wghtpew)`, `allbus %>% cramers_v(zufriedenheit, ${x})`]
    : card.level === 'ordinal'
      ? ['# Maß: Gamma und Tau-b, gewichtet (kendall_tau() erst nach unlabel(), sonst sehr langsam)', `allbus %>% goodman_gamma(zufriedenheit, ${x}, weights = wghtpew)`,
        `allbus %>% unlabel(zufriedenheit, ${x}, wghtpew) %>% kendall_tau(zufriedenheit, ${x}, weights = wghtpew)`]
      : ['# Maß: Pearson-r, gewichtet und ohne Gewicht', `allbus %>% pearson_cor(zufriedenheit, ${x}, weights = wghtpew)`, `allbus %>% pearson_cor(zufriedenheit, ${x})`];
  const split = card.id === 'eastwest'
    ? ['', '# Drittvariable: Hält der Unterschied innerhalb gleicher Wirtschaftslage?', `allbus <- allbus %>% mutate(lage = rec(ep01, rules = "${LAGE.rules}"))`,
      'allbus %>% filter(lage == 1) %>% goodman_gamma(zufriedenheit, eastwest)', 'allbus %>% filter(lage == 2) %>% goodman_gamma(zufriedenheit, eastwest)',
      'allbus %>% filter(lage == 3) %>% goodman_gamma(zufriedenheit, eastwest)']
    : ['', '# West und Ost getrennt', card.level === 'nominal'
      ? `allbus %>% group_by(eastwest) %>% cramers_v(zufriedenheit, ${x})`
      : card.level === 'ordinal'
        ? `allbus %>% unlabel(zufriedenheit, ${x}) %>% group_by(eastwest) %>% kendall_tau(zufriedenheit, ${x})`
        : `allbus %>% group_by(eastwest) %>% pearson_cor(zufriedenheit, ${x})`];
  return [...head, ...measure, ...split].join('\n');
}

export function scaffoldFor(card: Card): string {
  const fn = card.level === 'nominal' ? 'cramers_v' : card.level === 'ordinal' ? 'goodman_gamma' : 'pearson_cor';
  return `allbus <- allbus %>% mutate(zufriedenheit = rec(ps03, rules = "___"))\nallbus %>% ${fn}(zufriedenheit, ___, weights = ___)\nallbus %>% group_by(___) %>% ${fn}(zufriedenheit, ___)`;
}
