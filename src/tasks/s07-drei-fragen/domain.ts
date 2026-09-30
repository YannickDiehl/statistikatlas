import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, halfUnit, numberReadings } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { reliability, rowMeans, rowSums, type Reliability } from '../kit/reliability';
import { pearson, random, validValues } from '../kit/stats';
import { oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { DUTY_REASONS, FACET_IDS, FACETS, ITEM_IDS, ITEMS, R_BATTERY, R_SETUP, type FacetId, type ItemId } from './content';

/* ---------- Kurzskalen ---------- */

const byOrder = (a: ItemId, b: ItemId) => ITEM_IDS.indexOf(a) - ITEM_IDS.indexOf(b);
export const sortItems = (items: readonly ItemId[]) => [...items].sort(byOrder);
export const keyOf = (items: readonly ItemId[]) => sortItems(items).join('+');
export const labelOf = (items: readonly ItemId[]) => sortItems(items).join(' + ');
export const restOf = (items: readonly ItemId[]) => ITEM_IDS.filter(i => !items.includes(i));
/** Die drei Fragen, die bleiben – erst wenn genau vier gestrichen sind. */
export const keptOf = (struck: readonly ItemId[]): ItemId[] | null => (struck.length === 4 ? restOf(struck) : null);

/** Alle 35 Dreierauswahlen aus sieben Fragen, in der Reihenfolge von combn(). */
export const TRIPLES: ItemId[][] = (() => {
  const out: ItemId[][] = [];
  for (let a = 0; a < 7; a++) for (let b = a + 1; b < 7; b++) for (let c = b + 1; c < 7; c++) out.push([ITEM_IDS[a], ITEM_IDS[b], ITEM_IDS[c]]);
  return out;
})();

export type TripleStats = {
  key: string;
  items: ItemId[];
  rest: ItemId[];
  /** Cronbachs α wie reliability(): listenweise über die drei Fragen. */
  alpha: number;
  alphaStd: number;
  omega: number;
  /** ω liegt an der Grenze des Faktormodells (Heywood-Fall): Der Wertedetektor nennt ω dann nicht (mariposa 0.7.4 zeigt es dort nicht mehr). */
  omegaBoundary: boolean;
  nAlpha: number;
  /** Stellvertreter-Wert: r(Kurzwert mit min_valid = 3, Restwert mit min_valid = 4). */
  r: number;
  nR: number;
  rankAlpha: number;
  rankR: number;
};

/** Weitere Varianten für den Wertedetektor – nur für die Kurzskalen, die jemand einträgt (bei Bedarf gerechnet). */
export type TripleDetail = {
  alphaW: number;
  /** α nur auf den Fällen mit allen sieben Antworten (wer vorher gefiltert hat). */
  alphaAll7: number;
  /** α der vier gestrichenen Fragen. */
  alphaRest: number;
  /** Ohne min_valid (beide oder einer der beiden Werte). */
  rAny: number[];
  rW: number;
  /** Gegen den Gesamtindex aller sieben (Teil-Ganzes-Überlappung), mit und ohne min_valid. */
  rLong: number[];
};

export type Prepared = {
  x: Record<ItemId, Float64Array>;
  w: Float64Array;
  full: Reliability;
  fullW: Reliability;
  /** Anteil „stimme voll/eher zu“ (1–2) je Frage, gewichtet – eine Aussage über die Bevölkerung. */
  agree: Record<ItemId, number>;
  triples: TripleStats[];
  byKey: Record<string, TripleStats>;
  /** Korrelation von α und Stellvertreter-Wert über alle 35 Kurzskalen. */
  corAlphaR: number;
  complete7: Float64Array;
  lang: Float64Array;
  langAny: Float64Array;
  details: Map<string, TripleDetail>;
};

const countValid = (a: Float64Array, b: Float64Array) => { let n = 0; for (let i = 0; i < a.length; i++) if (Number.isFinite(a[i]) && Number.isFinite(b[i])) n++; return n; };

/** Rangplätze, 1 = größter Wert; nicht berechenbare Werte stehen hinten. */
function rankDesc(values: number[]): number[] {
  const key = (v: number) => (Number.isFinite(v) ? v : -Infinity);
  const order = values.map((v, i) => [key(v), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const out = new Array<number>(values.length);
  order.forEach(([, i], r) => { out[i] = r + 1; });
  return out;
}

/** Einmal je Datei: alle 35 Kurzskalen mit α, Stellvertreter-Wert und den Varianten für den Wertedetektor. */
export function prepare(sav: SavFile): Prepared {
  const x = Object.fromEntries(ITEM_IDS.map(id => [id, Float64Array.from(validValues(sav.byName.get(id)!), v => (v >= 1 && v <= 5 ? v : NaN))])) as Record<ItemId, Float64Array>;
  const w = validValues(sav.byName.get('wghtpew')!);
  const all = ITEM_IDS.map(id => x[id]);
  const full = reliability(all), fullW = reliability(all, w, { omega: false });
  const complete7 = Float64Array.from(all[0], (_, i) => (all.every(c => Number.isFinite(c[i])) ? 1 : NaN));
  const lang = rowMeans(all, 7), langAny = rowMeans(all);
  const agree = Object.fromEntries(ITEM_IDS.map(id => {
    let yes = 0, tot = 0;
    x[id].forEach((v, i) => { if (Number.isFinite(v) && Number.isFinite(w[i])) { tot += w[i]; if (v <= 2) yes += w[i]; } });
    return [id, tot > 0 ? yes / tot : NaN];
  })) as Record<ItemId, number>;
  const raw = TRIPLES.map(items => {
    const rest = restOf(items), xs = items.map(i => x[i]);
    const rel = reliability(xs);
    const kurz = rowMeans(xs, 3), restMean = rowMeans(rest.map(i => x[i]), 4);
    return { key: keyOf(items), items, rest, alpha: rel.alpha, alphaStd: rel.alphaStd, omega: rel.omega, omegaBoundary: rel.omegaBoundary, nAlpha: rel.n, r: pearson(kurz, restMean), nR: countValid(kurz, restMean) };
  });
  const ra = rankDesc(raw.map(t => t.alpha)), rr = rankDesc(raw.map(t => t.r));
  const triples: TripleStats[] = raw.map((t, i) => ({ ...t, rankAlpha: ra[i], rankR: rr[i] }));
  return {
    x, w, full, fullW, agree, triples,
    byKey: Object.fromEntries(triples.map(t => [t.key, t])),
    corAlphaR: pearson(triples.map(t => t.alpha), triples.map(t => t.r)),
    complete7, lang, langAny, details: new Map(),
  };
}

/** Varianten einer Kurzskala (einmal gerechnet, dann gemerkt). */
export function detailOf(p: Prepared, t: TripleStats): TripleDetail {
  const cached = p.details.get(t.key);
  if (cached) return cached;
  const xs = t.items.map(i => p.x[i]), xr = t.rest.map(i => p.x[i]);
  const kurz = rowMeans(xs, 3), restMean = rowMeans(xr, 4), kurzAny = rowMeans(xs), restAny = rowMeans(xr);
  const d: TripleDetail = {
    alphaW: reliability(xs, p.w, { omega: false }).alpha,
    alphaAll7: reliability(xs.map(c => Float64Array.from(c, (v, i) => v * p.complete7[i])), null, { omega: false }).alpha,
    alphaRest: reliability(xr, null, { omega: false }).alpha,
    rAny: [pearson(kurzAny, restAny), pearson(kurz, restAny), pearson(kurzAny, restMean)],
    rW: pearson(kurz, restMean, p.w),
    rLong: [pearson(kurz, p.lang), pearson(kurzAny, p.langAny)],
  };
  p.details.set(t.key, d);
  return d;
}

/* ---------- Wertedetektor ---------- */

const f3 = (v: number) => de(v, 3);
const count = (n: number) => n.toLocaleString('de-DE');
/** Eine erkennbare Zahl: das Ziel (ok), eine angenommene Variante (accepted) oder eine erklärte Verwechslung.
 *  also: Die Variante gilt nur, wenn die Eingabe auch zu diesem zweiten Wert passt (zwei Kennzahlen, die gleich gerundet sind). */
export type Variant = { value: number; also?: number; ok?: boolean; accepted?: boolean; text: string };

/** Lesarten der Eingabe mit genug Nachkommastellen (numberReadings: „0,759“, „.759“, „27.0%“ …); Toleranz = halbe Einheit der letzten Stelle. */
const readings = (input: string, minDecimals: number) => numberReadings(input).filter(r => r.decimals >= minDecimals);
const close = (v: number | undefined, x: number, tol: number) => v !== undefined && Number.isFinite(v) && Math.abs(v - x) <= tol;
const hitOf = (vars: Variant[], input: string, minDecimals: number) => {
  for (const { x, decimals } of readings(input, minDecimals)) {
    const tol = halfUnit(decimals);
    const hit = vars.find(v => close(v.value, x, tol) && (v.also === undefined || close(v.also, x, tol)));
    if (hit) return hit;
  }
  return null;
};

/** Erkannt heißt: das Ziel oder eine angenommene Variante. Erst dann erscheinen Zahlen aus der Datei.
 *  minDecimals: Kennzahlen mit mindestens zwei, Prozentwerte mit mindestens einer Nachkommastelle. */
export const recognised = (vars: Variant[], input: string, minDecimals = 2) => Boolean(hitOf(vars, input, minDecimals)?.accepted);

export function checkNumber(vars: Variant[], input: string, notFound: string, minDecimals = 2, digitsHint = 'Trag den Wert mit drei Nachkommastellen ein, so wie R ihn zeigt.'): Note[] {
  if (!input.trim()) return [];
  if (!numberReadings(input).length) return [{ tone: 'hint', text: 'Das lese ich nicht als Zahl. Trag den Wert so ein, wie R ihn zeigt.' }];
  if (!readings(input, minDecimals).length) return [{ tone: 'hint', text: digitsHint }];
  const hit = hitOf(vars, input, minDecimals);
  if (!hit) return [{ tone: 'warn', text: notFound }];
  return [{ tone: hit.ok ? 'ok' : hit.accepted ? 'hint' : 'warn', text: hit.text }];
}

export function batteryVariants(p: Prepared): Variant[] {
  const { full } = p;
  const omega = Number.isFinite(full.omega) && !full.omegaBoundary
    ? ` Daneben zeigt R McDonalds ω = ${f3(full.omega)}: ω lässt jede Frage unterschiedlich stark am Begriff hängen, α behandelt alle gleich.` : '';
  return [
    { value: full.alpha, ok: true, accepted: true, text: `Stimmt: Alle sieben Fragen zusammen erreichen α = ${f3(full.alpha)} (n = ${count(full.n)}).${omega}` },
    { value: full.alphaStd, accepted: true, text: `Das ist das standardisierte α (${f3(full.alphaStd)}) – angenommen. Das rohe α steht in der Zeile darüber.` },
    { value: p.fullW.alpha, accepted: true, text: `Das ist das gewichtete α (${f3(p.fullW.alpha)}) – angenommen. Die Aufgabe rechnet ungewichtet.` },
    ...(full.omegaBoundary ? [] : [
      { value: full.omega, text: `Das ist McDonalds ω (${f3(full.omega)}). Gesucht ist Cronbachs α, zwei Zeilen darüber.` },
      { value: full.omegaStd, text: `Das ist das standardisierte ω (${f3(full.omegaStd)}). Gesucht ist Cronbachs α ganz oben.` },
    ]),
    ...full.items.map((it, i) => ({ value: it.alphaIfDeleted, text: `Das ist „Alpha ohne Item“ für ${ITEM_IDS[i]} (${f3(it.alphaIfDeleted)}). Gesucht ist α aller sieben Fragen oben in der Ausgabe.` })),
    ...p.triples.map(t => ({ value: t.alpha, text: `Das ist das α der Kurzskala ${labelOf(t.items)} (${f3(t.alpha)}). Hier geht es um alle sieben Fragen.` })),
  ];
}

export const BATTERY_NOT_FOUND = 'Diesen Wert finde ich nicht. Stehen in reliability() alle sieben Fragen pa29 bis pa35?';

/** Die schwächste Trennschärfe der ganzen Batterie: Frage und Wert. */
export function weakestItem(p: Prepared): ItemId {
  const cr = p.full.items.map(i => i.corrected);
  return ITEM_IDS[cr.indexOf(Math.min(...cr))];
}

export function checkWeakest(p: Prepared, item: ItemId | '', input: string): Note[] {
  if (!item || !p.full.items.length) return [];
  const weakest = weakestItem(p), idx = ITEM_IDS.indexOf(item), it = p.full.items[idx];
  if (item !== weakest) return [{ tone: 'hint', text: `${item} ist nicht die Frage mit der schwächsten Trennschärfe. Vergleiche in der Item-Total-Statistik die Spalte corrected_r über alle sieben Fragen.` }];
  if (!input.trim()) return [{ tone: 'hint', text: 'Richtige Frage. Trag auch ihre Trennschärfe aus der Spalte corrected_r ein.' }];
  const top = ITEM_IDS.reduce((a, b) => (p.agree[b] > p.agree[a] ? b : a));
  const higher = it.alphaIfDeleted > p.full.alpha;
  const vars: Variant[] = [
    { value: it.corrected, ok: true, accepted: true, text: `Stimmt: ${item} hängt am schwächsten mit den übrigen sechs zusammen (Trennschärfe ${f3(it.corrected)}). Ohne ${item} läge α bei ${f3(it.alphaIfDeleted)}${higher ? ' – höher als mit ihr' : ''}.${item === top ? ' Ausgerechnet die Frage mit der meisten Zustimmung unterscheidet am wenigsten zwischen den Befragten.' : ''}` },
    { value: it.alphaIfDeleted, text: 'Das ist „Alpha ohne Item“ (alpha_deleted). Die Trennschärfe steht in der Spalte corrected_r.' },
    ...p.full.items.map((o, i) => ({ value: o.corrected, text: `Das ist die Trennschärfe von ${ITEM_IDS[i]}, nicht von ${item}.` })),
  ];
  return checkNumber(vars, input, `Diesen Wert finde ich in der Zeile von ${item} nicht. Die Trennschärfe steht in der Spalte corrected_r.`);
}

export function alphaVariants(p: Prepared, t: TripleStats): Variant[] {
  const mine = labelOf(t.items), d = detailOf(p, t);
  return [
    { value: t.alpha, ok: true, accepted: true, text: `Stimmt: Die Stimmigkeit deiner drei Fragen ist α = ${f3(t.alpha)} (n = ${count(t.nAlpha)}).` },
    // print() zeigt neben α nur ω: Eine abweichende dritte Stelle ist meist ω, nicht das standardisierte α aus summary().
    // Sind beide gleich gerundet, lässt sich nicht sagen, welches gemeint war – dann eine gemeinsame, angenommene Rückmeldung.
    ...(t.omegaBoundary ? [] : [
      { value: t.omega, also: t.alphaStd, accepted: true, text: `Das ist McDonalds ω oder das standardisierte α – beide liegen hier bei ${f3(t.alphaStd)}. Angenommen; gesucht ist eigentlich Cronbachs α, das R direkt vor ω zeigt.` },
      { value: t.omega, text: `Das ist McDonalds ω (${f3(t.omega)}). Gesucht ist Cronbachs α aus derselben Zeile.` },
    ]),
    { value: t.alphaStd, accepted: true, text: `Das ist das standardisierte α (${f3(t.alphaStd)}, „Alpha (standardized)“ in summary()) – angenommen. Für die Kurzskala zählt eigentlich das rohe α; beide liegen hier nah beieinander.` },
    { value: d.alphaW, accepted: true, text: `Das ist das gewichtete α (${f3(d.alphaW)}) – angenommen. Die Aufgabe rechnet ungewichtet; für die Stimmigkeit ändert das Gewicht wenig.` },
    { value: d.alphaAll7, accepted: true, text: `Das ist α auf den Fällen mit allen sieben Antworten (${f3(d.alphaAll7)}) – angenommen. reliability() mit deinen drei Fragen nimmt alle, die diese drei beantwortet haben.` },
    { value: p.full.alpha, text: `Das ist das α aller sieben Fragen (${f3(p.full.alpha)}), nicht deiner drei.` },
    { value: d.alphaRest, text: `Das ist das α der vier gestrichenen Fragen (${f3(d.alphaRest)}). Gesucht ist die Stimmigkeit der drei, die bleiben.` },
    ...p.full.items.map((it, i) => ({ value: it.alphaIfDeleted, text: `Das ist „Alpha ohne Item“ für ${ITEM_IDS[i]} aus der ganzen Batterie (${f3(it.alphaIfDeleted)}). Rechne reliability() nur mit deinen drei Fragen.` })),
    { value: t.r, text: `Das ist der Stellvertreter-Wert r (${f3(t.r)}). In dieses Feld gehört die Stimmigkeit α aus reliability().` },
    ...p.triples.filter(o => o.key !== t.key).map(o => ({ value: o.alpha, text: `Das ist das α der Kurzskala ${labelOf(o.items)} (${f3(o.alpha)}). Behalten hast du ${mine}.` })),
  ];
}

export function rVariants(p: Prepared, t: TripleStats): Variant[] {
  const mine = labelOf(t.items), d = detailOf(p, t);
  return [
    { value: t.r, ok: true, accepted: true, text: `Stimmt: Der Stellvertreter-Wert deiner Kurzskala ist r = ${f3(t.r)} (n = ${count(t.nR)}).` },
    ...d.rAny.map(value => ({ value, accepted: true, text: `Angenommen (r = ${f3(value)}) – aber wer bekommt überhaupt einen Skalenwert? Ohne min_valid bekommt auch einen Wert, wer nur eine der Fragen beantwortet hat. Mit min_valid = 3 und min_valid = 4 vergleichst du nur Menschen, die alle Fragen beantwortet haben.` })),
    { value: d.rW, accepted: true, text: `Das ist r mit Gewicht (${f3(d.rW)}) – angenommen. Die Aufgabe rechnet ungewichtet.` },
    ...d.rLong.map(value => ({ value, text: `Du hast mit dem Gesamtindex aller sieben Fragen korreliert (r = ${f3(value)}). Der enthält deine drei Fragen selbst – du prüfst eine Aussage an sich selbst. Der Restwert besteht nur aus den vier gestrichenen Fragen.` })),
    { value: t.alpha, text: `Das ist die Stimmigkeit α (${f3(t.alpha)}). In dieses Feld gehört der Stellvertreter-Wert r aus pearson_cor().` },
    ...p.triples.filter(o => o.key !== t.key).map(o => ({ value: o.r, text: `Das ist der Stellvertreter-Wert der Kurzskala ${labelOf(o.items)} (${f3(o.r)}). Behalten hast du ${mine}.` })),
  ];
}

export const ALPHA_NOT_FOUND = 'Diesen Wert finde ich für deine drei Fragen nicht. Stehen in reliability() genau die drei Fragen, die du behältst?';
export const R_NOT_FOUND = 'Diesen Wert finde ich nicht. Besteht kurz aus deinen drei und rest aus den vier gestrichenen Fragen – und korrelierst du die beiden mit pearson_cor()?';

/* ---------- Inhalt: die drei Seiten (erst als Hilfe) ---------- */

export const facetsOf = (items: readonly ItemId[]) => sortItems(items).map(i => ITEMS[i].facet);
export const facetLetters = (items: readonly ItemId[]) => facetsOf(items).join(' ');

export function facetNote(items: readonly ItemId[]): Note {
  const have = new Set<FacetId>(facetsOf(items));
  const missing = FACET_IDS.filter(fid => !have.has(fid)).map(fid => `„${FACETS[fid].name}“`);
  if (!missing.length) return { tone: 'ok', text: 'Jede der drei Seiten ist mit einer Frage vertreten.' };
  return { tone: 'hint', text: `Aus ${missing.join(' und ')} ist keine Frage mehr dabei.` };
}

/** Hinweis zu pa29, wenn sie in einer Auswahl steht: Kern des Begriffs, aber kaum Unterschiede. */
export function pa29Note(p: Prepared, items: readonly ItemId[]): Note[] {
  if (!items.includes('pa29')) return [];
  const share = Math.round(100 * p.agree.pa29);
  return [{ tone: 'hint', text: `pa29 trifft den Kern des Begriffs, aber ${share} % stimmen ihr zu – sie unterscheidet kaum zwischen den Befragten. Streichen oder behalten ist eine Frage der Validität, keine Rechenfrage.` }];
}

/* ---------- Die Landschaft aller 35 Kurzskalen ---------- */

const strength = (r: number) => (Math.abs(r) < 0.3 ? 'nur schwach' : Math.abs(r) < 0.5 ? 'mäßig' : 'deutlich');

export function landscapeNotes(p: Prepared, own: ItemId[][], batteryKnown: boolean): string[] {
  const byAlpha = [...p.triples].sort((a, b) => a.rankAlpha - b.rankAlpha), bestR = p.triples.find(t => t.rankR === 1)!;
  const [first, second] = byAlpha, n = p.triples.length;
  const notes = [
    `Die stimmigste Kurzskala ist ${labelOf(first.items)} (α = ${f3(first.alpha)}). Als Stellvertreter steht sie auf Platz ${first.rankR} von ${n}.`,
    `Die zweitstimmigste, ${labelOf(second.items)}, steht als Stellvertreter auf Platz ${second.rankR}.`,
    `Den besten Stellvertreter-Wert hat ${labelOf(bestR.items)} (r = ${f3(bestR.r)}) – bei der Stimmigkeit Platz ${bestR.rankAlpha}.`,
    `Über alle ${n} Kurzskalen hängen Stimmigkeit und Stellvertreter-Wert ${strength(p.corAlphaR)} zusammen (r = ${f3(p.corAlphaR)}).`,
  ];
  const good = p.triples.filter(t => t.alpha >= 0.7), with29 = p.triples.filter(t => t.items.includes('pa29'));
  const good29 = good.filter(t => t.items.includes('pa29')).length;
  notes.push(`${good.length} von ${n} Kurzskalen erreichen α ≥ 0,70${good29 ? `, ${good29} davon mit pa29.` : `, keine davon mit pa29 (höchstens ${f3(Math.max(...with29.map(t => t.alpha)))}).`}`);
  if (batteryKnown) notes.push(`Alle sieben Fragen erreichen α = ${f3(p.full.alpha)}, die beste Dreierauswahl ${f3(first.alpha)}: α wächst mit der Zahl der Fragen.`);
  if (own.some(items => items.includes('pa29'))) notes.push('Steht pa29 in der Kurzskala, bleiben für den Restwert nur Fragen übrig, die eng zusammenhängen. Das hebt den Stellvertreter-Wert, ohne dass die Kurzskala besser misst – der Test hängt auch davon ab, was im Rest steckt.');
  return notes;
}

/* ---------- Pflichtfrage bei zu einheitlicher Wahl ---------- */

export const DUTY_GROUPS = 12;

function shuffled<T>(list: readonly T[], seed: number): T[] {
  const next = random(seed), out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const DUTY_ITEMS = shuffled(ITEM_IDS, 807), DUTY_TEXTS = shuffled(DUTY_REASONS, 708);

/** Fest ausgeloste Pflichtfrage je Gruppennummer: überall gleich, die Gruppen 1–7 bekommen sieben verschiedene Fragen. */
export function dutyFor(group: number): { item: ItemId; reason: string } {
  const k = (Math.max(1, Math.round(group)) - 1) % 7;
  return { item: DUTY_ITEMS[k], reason: DUTY_TEXTS[k % DUTY_TEXTS.length] };
}

/** Die ausgeloste Pflichtfrage fehlt in der Wahl: allein „du“, zu zweit „ihr“. */
export function dutyMissing(item: ItemId, final: readonly ItemId[], solo: boolean): Note[] {
  if (!final.length || final.includes(item)) return [];
  return [{ tone: 'warn', text: solo
    ? `Deine Pflichtfrage ${item} fehlt in dieser Auswahl. Wähle eine Kurzskala mit ${item} – in der Landschaft sind sie dunkel.`
    : `Eure Pflichtfrage ${item} fehlt in dieser Auswahl. Wählt eine Kurzskala mit ${item} – in der Landschaft sind sie dunkel.` }];
}

export function dutyInstruction(item: ItemId, final: readonly ItemId[], solo: boolean): string {
  const has = final.includes(item);
  if (solo) return has
    ? 'Sie muss in deiner Kurzskala bleiben – deine Wahl enthält sie schon. Begründe, warum du die beiden anderen dazunimmst.'
    : `Sie muss in deiner Kurzskala bleiben: Wähle oben neu; in der Landschaft sind alle Kurzskalen mit ${item} dunkel.`;
  return has
    ? 'Sie muss in eurer Kurzskala bleiben – eure Wahl enthält sie schon. Begründet, warum ihr die beiden anderen dazunehmt.'
    : `Sie muss in eurer Kurzskala bleiben: Wählt oben neu; in der Landschaft sind alle Kurzskalen mit ${item} dunkel.`;
}

/* ---------- Kür: Mittelwertindex gegen Kombinationsindex ---------- */

export type Kuer = {
  /** Anteile in Prozent, gewichtet: im Schnitt Zustimmung (Kurzwert ≤ 2) und allen drei zugestimmt. */
  meanW: number; allW: number;
  meanU: number; allU: number;
  /** Kurzwert < 2 statt ≤ 2. */
  strictW: number;
  /** ohne min_valid gebildet. */
  meanAnyW: number; allAnyW: number;
};

const share = (hit: (i: number) => boolean, valid: (i: number) => boolean, w: Float64Array | null, n: number) => {
  let a = 0, b = 0;
  for (let i = 0; i < n; i++) if (valid(i) && (!w || Number.isFinite(w[i]))) { const wi = w ? w[i] : 1; b += wi; if (hit(i)) a += wi; }
  return b > 0 ? (100 * a) / b : NaN;
};

export function kuer(p: Prepared, items: ItemId[]): Kuer {
  const xs = items.map(i => p.x[i]), n = p.w.length;
  const z = xs.map(c => Float64Array.from(c, v => (Number.isNaN(v) ? NaN : v <= 2 ? 1 : 0)));
  const kurz = rowMeans(xs, 3), sum3 = rowSums(z, 3), kurzAny = rowMeans(xs), sumAny = rowSums(z);
  const both = (i: number) => Number.isFinite(kurz[i]) && Number.isFinite(sum3[i]);
  return {
    meanW: share(i => kurz[i] <= 2, both, p.w, n), allW: share(i => sum3[i] === 3, both, p.w, n),
    meanU: share(i => kurz[i] <= 2, both, null, n), allU: share(i => sum3[i] === 3, both, null, n),
    strictW: share(i => kurz[i] < 2, both, p.w, n),
    meanAnyW: share(i => kurzAny[i] <= 2, i => Number.isFinite(kurzAny[i]), p.w, n),
    allAnyW: share(i => sumAny[i] === 3, i => Number.isFinite(sumAny[i]), p.w, n),
  };
}

const p1 = (v: number) => `${de(v, 1)} %`;
export function kuerMeanVariants(k: Kuer): Variant[] {
  return [
    { value: k.meanW, ok: true, accepted: true, text: `Stimmt: Nach dem Mittelwertindex stimmen ${p1(k.meanW)} im Schnitt zu.` },
    { value: k.meanU, text: `Das ist der Anteil ohne Gewicht (${p1(k.meanU)}). Für eine Aussage über Deutschland rechnest du mit weights = wghtpew.` },
    // Wer den Anteil „allen drei zugestimmt“ ins erste Feld schreibt, ist häufiger als die strenge Grenze < 2 (beide liegen nah beieinander).
    { value: k.allW, text: `Das ist der Anteil, der allen drei Aussagen zustimmt (${p1(k.allW)}) – er gehört ins zweite Feld.` },
    { value: k.strictW, text: `Das ist der Anteil mit einem Kurzwert unter 2 (${p1(k.strictW)}). „Im Schnitt Zustimmung“ schließt die 2 („stimme eher zu“) ein: rules = "1:2=1 …".` },
    { value: k.meanAnyW, text: `Das ist der Anteil ohne min_valid (${p1(k.meanAnyW)}). Dann zählt auch mit, wer nur eine der drei Fragen beantwortet hat.` },
    { value: k.meanW - k.allW, text: `Das ist die Zelle „im Schnitt ja, aber nicht allen drei“ (${p1(k.meanW - k.allW)}). Gesucht ist die Randsumme der ganzen Zeile.` },
    { value: 100 - k.meanW, text: `Das ist die andere Zeile: im Schnitt keine Zustimmung (${p1(100 - k.meanW)}).` },
  ];
}
export function kuerAllVariants(k: Kuer): Variant[] {
  return [
    { value: k.allW, ok: true, accepted: true, text: `Stimmt: Allen drei Aussagen stimmen ${p1(k.allW)} zu.` },
    { value: k.allU, text: `Das ist der Anteil ohne Gewicht (${p1(k.allU)}). Für eine Aussage über Deutschland rechnest du mit weights = wghtpew.` },
    { value: k.allAnyW, text: `Das ist der Anteil ohne min_valid (${p1(k.allAnyW)}). Dann zählen auch Menschen mit fehlenden Antworten im Nenner.` },
    { value: k.meanW, text: `Das ist der Anteil nach dem Mittelwertindex (${p1(k.meanW)}) – er gehört ins erste Feld.` },
    { value: 100 - k.allW, text: `Das ist die andere Spalte: nicht allen drei zugestimmt (${p1(100 - k.allW)}).` },
  ];
}
export const KUER_NOT_FOUND = 'Diesen Anteil finde ich nicht. Prüfe die Umkodierung (1–2 = Zustimmung), min_valid = 3 und weights = wghtpew.';

export function kuerReveal(k: Kuer): string {
  return `Nach dem Mittelwertindex stimmen ${p1(k.meanW)} im Schnitt zu, allen drei Aussagen aber nur ${p1(k.allW)}. ${p1(k.meanW - k.allW)} gelten nur nach der Mittelwertlogik als populistisch: Zustimmung bei einer Aussage gleicht Ablehnung bei einer anderen aus.`;
}

/* ---------- Zustand ---------- */

export type Proposal = { struck: ItemId[]; why: string; alpha: string; r: string };
export type S07State = {
  mode: WorkMode;
  battery: { alpha: string; weakest: ItemId | ''; value: string };
  a: Proposal;
  b: Proposal;
  /** Hilfe „Seiten des Begriffs“: 0 zu, 1 Denkanstoß, 2 die drei Seiten als Vorschlag. */
  facetLevel: 0 | 1 | 2;
  final: ItemId[];
  reason: string;
  sentence: string;
  duty: number | null;
  kuer: { mean: string; all: string };
};

const emptyProposal = (): Proposal => ({ struck: [], why: '', alpha: '', r: '' });
export const initialS07 = (): S07State => ({
  mode: 'solo', battery: { alpha: '', weakest: '', value: '' }, a: emptyProposal(), b: emptyProposal(), facetLevel: 0,
  final: [], reason: '', sentence: '', duty: null, kuer: { mean: '', all: '' },
});

/** Eine Frage streichen oder zurücknehmen (höchstens vier). Eine neue Auswahl macht α und r dieses Vorschlags ungültig. */
export function toggleStrike(s: S07State, which: 'a' | 'b', item: ItemId): S07State {
  const p = s[which];
  const struck = p.struck.includes(item) ? p.struck.filter(i => i !== item) : p.struck.length < 4 ? sortItems([...p.struck, item]) : p.struck;
  if (struck === p.struck) return s;
  return { ...s, [which]: { ...p, struck, alpha: '', r: '' } };
}

/** Endgültige Wahl: die Kür hängt an den drei Fragen und beginnt neu. */
export function chooseFinal(s: S07State, items: ItemId[]): S07State {
  const final = items.length === 3 ? sortItems(items) : [];
  return keyOf(final) === keyOf(s.final) ? s : { ...s, final, kuer: { mean: '', all: '' } };
}

const itemList = (x: unknown, max: number) => {
  const list = Array.isArray(x) ? x.filter((v): v is ItemId => typeof v === 'string' && (ITEM_IDS as string[]).includes(v)) : [];
  return sortItems([...new Set(list)]).slice(0, max);
};
const parseProposal = (raw: unknown): Proposal => {
  const r = record(raw);
  return { struck: itemList(r.struck, 4), why: str(r.why, 400), alpha: str(r.alpha, 12), r: str(r.r, 12) };
};

export function parseS07(raw: unknown): S07State {
  const r = record(raw), bat = record(r.battery), k = record(r.kuer);
  const final = itemList(r.final, 3);
  const duty = typeof r.duty === 'number' && Number.isInteger(r.duty) && r.duty >= 1 && r.duty <= DUTY_GROUPS ? r.duty : null;
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    battery: { alpha: str(bat.alpha, 12), weakest: oneOf(bat.weakest, [...ITEM_IDS, ''] as const, ''), value: str(bat.value, 12) },
    a: parseProposal(r.a), b: parseProposal(r.b),
    facetLevel: r.facetLevel === 1 || r.facetLevel === 2 ? r.facetLevel : 0,
    final: final.length === 3 ? final : [],
    reason: str(r.reason, 600), sentence: str(r.sentence, 400), duty,
    kuer: { mean: str(k.mean, 12), all: str(k.all, 12) },
  };
}

const filled = (p: Proposal) => p.struck.length === 4 && Boolean(p.alpha.trim() && p.r.trim());
export function statusS07(s: S07State): TaskStatus {
  if (filled(s.a) && filled(s.b) && s.final.length === 3 && s.sentence.trim()) return 'done';
  const any = s.battery.alpha.trim() || s.battery.weakest || s.a.struck.length || s.b.struck.length || s.final.length || s.sentence.trim() || s.reason.trim();
  return any ? 'running' : 'open';
}

/** Die Landschaft öffnet sich, wenn beide Vorschläge mit α und r eingetragen und erkannt sind. */
export function revealReady(p: Prepared, s: S07State): boolean {
  return (['a', 'b'] as const).every(which => {
    const kept = keptOf(s[which].struck);
    if (!kept) return false;
    const t = p.byKey[keyOf(kept)];
    return recognised(alphaVariants(p, t), s[which].alpha) && recognised(rVariants(p, t), s[which].r);
  });
}

/** Eingetragener Prozentwert in deutscher Schreibweise mit einer Stelle („21.7%“ → „21,7 %“); Unlesbares bleibt, wie es ist. */
export const pctText = (input: string) => { const r = numberReadings(input)[0]; return r ? `${de(r.x, 1)} %` : input.trim(); };

export function plenumLines(s: S07State, final: TripleStats | null): [string, string][] {
  const a = keptOf(s.a.struck), b = keptOf(s.b.struck);
  const duty = s.duty ? dutyFor(s.duty) : null;
  const k = s.kuer.mean.trim() && s.kuer.all.trim() ? `${pctText(s.kuer.mean)} im Schnitt · ${pctText(s.kuer.all)} durchgehend` : '';
  return [
    ['Kurzskala', s.final.length === 3 ? labelOf(s.final) : ''],
    ['Punkt im Kreuz (α | r)', final ? `${f3(final.alpha)} | ${f3(final.r)}` : ''],
    ['Was sie nicht mehr misst', s.sentence.trim()],
    ['Begründung', s.reason.trim()],
    ['Vorschläge', a || b ? `Stimmigkeit: ${a ? labelOf(a) : '–'} · Inhalt: ${b ? labelOf(b) : '–'}` : ''],
    ...(duty ? [[`Pflichtfrage (Gruppe ${s.duty})`, `${duty.item} – ${duty.reason}`] as [string, string]] : []),
    ...(k ? [['Kür', k] as [string, string]] : []),
  ];
}

/* ---------- R-Code ---------- */

const args = (items: readonly ItemId[]) => sortItems(items).join(', ');

export function rProposal(items: ItemId[], tag: 'a' | 'b'): string {
  const name = tag === 'a' ? 'Vorschlag A (Stimmigkeit)' : 'Vorschlag B (Inhalt)';
  return [
    `# ${name}: Wie stimmig sind die drei Fragen?`,
    `allbus %>% reliability(${args(items)})`, '',
    '# Zwei Werte pro Person: Kurzwert aus den drei Fragen, Restwert aus den vier gestrichenen',
    'allbus <- allbus %>%', '  mutate(',
    `    kurz_${tag} = row_means(pick(${args(items)}), min_valid = 3),`,
    `    rest_${tag} = row_means(pick(${args(restOf(items))}), min_valid = 4)`, '  )', '',
    '# Stellvertreter-Test: Wie eng hängt der Kurzwert mit dem Restwert zusammen?',
    `allbus %>% pearson_cor(kurz_${tag}, rest_${tag})`,
  ].join('\n');
}

export const scaffoldProposal = (tag: 'a' | 'b') => [
  'allbus %>% reliability(___, ___, ___)', '',
  'allbus <- allbus %>%', '  mutate(',
  `    kurz_${tag} = row_means(pick(___, ___, ___), min_valid = ___),`,
  `    rest_${tag} = row_means(pick(___, ___, ___, ___), min_valid = ___)`, '  )', '',
  'allbus %>% pearson_cor(___, ___)',
].join('\n');

export function rKuer(items: ItemId[]): string {
  const [i1, i2, i3] = sortItems(items);
  const z = (i: ItemId, n: number) => `    z${n} = rec(${i}, rules = "1:2=1 [stimmt zu]; 3:5=0 [nicht]")`;
  return [
    '# Kür: Mittelwertindex gegen Kombinationsindex (gewichtet: eine Aussage über Deutschland)',
    'allbus <- allbus %>%', '  mutate(',
    `    kurz = row_means(pick(${i1}, ${i2}, ${i3}), min_valid = 3),`,
    `${z(i1, 1)},`, `${z(i2, 2)},`, `${z(i3, 3)}`, '  )',
    'allbus <- allbus %>%',
    '  mutate(zustimmungen = row_sums(pick(z1, z2, z3), min_valid = 3))',
    'allbus <- allbus %>%', '  mutate(',
    '    im_schnitt  = rec(kurz, rules = "1:2=1 [im Schnitt Zustimmung]; 2.01:5=0 [nein]"),',
    '    durchgehend = rec(zustimmungen, rules = "3=1 [allen drei zugestimmt]; 0:2=0 [nicht allen]")', '  )',
    'allbus %>% crosstab(im_schnitt, durchgehend, percentages = "total", weights = wghtpew) %>% summary()',
  ].join('\n');
}

export const scaffoldKuer = [
  'allbus <- allbus %>%', '  mutate(',
  '    kurz = row_means(pick(___, ___, ___), min_valid = 3),',
  '    z1 = rec(___, rules = "1:2=1 [stimmt zu]; 3:5=0 [nicht]"),',
  '    z2 = rec(___, rules = "___"),', '    z3 = rec(___, rules = "___")', '  )',
  'allbus <- allbus %>% mutate(zustimmungen = row_sums(pick(z1, z2, z3), min_valid = ___))',
  'allbus <- allbus %>%', '  mutate(',
  '    im_schnitt  = rec(kurz, rules = "1:2=1 [im Schnitt Zustimmung]; 2.01:5=0 [nein]"),',
  '    durchgehend = rec(zustimmungen, rules = "___=1 [allen drei zugestimmt]; 0:2=0 [nicht allen]")', '  )',
  'allbus %>% crosstab(im_schnitt, durchgehend, percentages = "___", weights = ___) %>% summary()',
].join('\n');

/** Vollständiges Skript: Einlesen, Batterie, beide Vorschläge und – mit endgültiger Wahl – die Kür. */
export function rScript(a: ItemId[] | null, b: ItemId[] | null, final: ItemId[] | null): string {
  return [R_SETUP, R_BATTERY, ...(a ? [rProposal(a, 'a')] : []), ...(b ? [rProposal(b, 'b')] : []), ...(final ? [rKuer(final)] : [])].join('\n\n') + '\n';
}
