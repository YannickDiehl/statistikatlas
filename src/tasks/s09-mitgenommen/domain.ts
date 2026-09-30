import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, parseNumber } from '../kit/numbers';
import { predictCi, tryOls, wobble, dfbeta, type OlsFit } from '../kit/ols';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { validValues } from '../kit/stats';
import { oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import {
  COMMON_CAUSES, CONTROL_IDS, controlById, CONTROLS, GROUP_IDS, GROUPS, MAX_WORDS, MOVERS, SORT_LABEL, SORTS, WOBBLE_K,
  type ControlId, type GroupId, type Sort,
} from './content';

/* ---------- Daten ---------- */

export type Prepared = {
  sav: SavFile;
  /** demo = rec(ps03, rules = "rev"): höher = zufriedener */
  y: Float64Array;
  yOrig: Float64Array;
  pt03: Float64Array;
  w: Float64Array;
  /** dg03 mit gültigen Codes 1–4, sonst NaN */
  dg: Float64Array;
  dummy: Record<GroupId, Float64Array>;
  /** ost = rec(eastwest, "1=0; 2=1"), ostjugend = rec(dg03, "1:2=1; 3:4=0") */
  ost: Float64Array;
  ostjugend: Float64Array;
  controls: Record<ControlId, Float64Array>;
};

const mapValid = (x: Float64Array, f: (v: number) => number | null) => Float64Array.from(x, v => (Number.isNaN(v) ? NaN : f(v) ?? NaN));

export function prepare(sav: SavFile): Prepared {
  const col = (name: string) => validValues(sav.byName.get(name)!);
  const yOrig = col('ps03');
  const dg = mapValid(col('dg03'), v => (v >= 1 && v <= 4 ? v : null));
  const dummy = Object.fromEntries(GROUP_IDS.map(g => [g, mapValid(dg, v => (v === g ? 1 : 0))])) as Record<GroupId, Float64Array>;
  const controls = Object.fromEntries(CONTROLS.map(c => [c.id, c.map ? mapValid(col(c.source), c.map) : col(c.source)])) as Record<ControlId, Float64Array>;
  return {
    sav, yOrig, y: mapValid(yOrig, v => 7 - v), pt03: col('pt03'), w: col('wghtpew'), dg, dummy,
    ost: mapValid(col('eastwest'), v => (v === 1 ? 0 : v === 2 ? 1 : null)), ostjugend: mapValid(dg, v => (v <= 2 ? 1 : 0)), controls,
  };
}

/* ---------- Modelle ---------- */

export type Outcome = 'rev' | 'orig' | 'pt03';
export type ModelSpec = { outcome: Outcome; ref: GroupId; controls: ControlId[]; weighted: boolean };
export type Model = {
  spec: ModelSpec;
  fit: OlsFit;
  c: number;
  /** Abstand jeder Gruppe zur Referenz (Referenz = 0) */
  b: Record<GroupId, number>;
  ci: Record<GroupId, [number, number]>;
  /** ungewichtete Fälle je Gruppe im Modell */
  n: Record<GroupId, number>;
};

export const others = (ref: GroupId) => GROUP_IDS.filter(g => g !== ref);
const orderedControls = (controls: ControlId[]) => CONTROL_IDS.filter(id => controls.includes(id));

/** Modell-Cache je Datei: jede Kombination wird höchstens einmal geschätzt. null heißt: nicht schätzbar. */
export function modelStore(p: Prepared) {
  const cache = new Map<string, Model | null>();
  return (spec: ModelSpec): Model | null => {
    const controls = orderedControls(spec.controls);
    const key = `${spec.outcome}|${spec.ref}|${controls.join(',')}|${spec.weighted}`;
    if (cache.has(key)) return cache.get(key)!;
    const y = spec.outcome === 'rev' ? p.y : spec.outcome === 'orig' ? p.yOrig : p.pt03;
    const groups = others(spec.ref);
    const fit = tryOls(y, [...groups.map(g => p.dummy[g]), ...controls.map(c => p.controls[c])], spec.weighted ? p.w : null,
      { names: [...groups.map(g => GROUPS[g].dummy), ...controls] });
    let model: Model | null = null;
    if (fit) {
      const b = { [spec.ref]: 0 } as Record<GroupId, number>, ci = { [spec.ref]: [0, 0] } as Record<GroupId, [number, number]>;
      groups.forEach((g, j) => { b[g] = fit.coef[j + 1]; ci[g] = [fit.ciLower[j + 1], fit.ciUpper[j + 1]]; });
      const n = Object.fromEntries(GROUP_IDS.map(g => [g, fit.rows.filter(i => p.dg[i] === g).length])) as Record<GroupId, number>;
      model = { spec: { ...spec, controls }, fit, c: fit.coef[0], b, ci, n };
    }
    cache.set(key, model);
    return model;
  };
}
export type Models = ReturnType<typeof modelStore>;
export const core = (models: Models, ref: GroupId, outcome: Outcome = 'rev', weighted = true) => models({ outcome, ref, controls: [], weighted });

/** Vorhersage je Gruppe mit Konfidenzintervall (im Modell ohne Kontrollen; bei jeder Referenz gleich). */
export function predictions(m: Model): Record<GroupId, { fit: number; lower: number; upper: number; n: number }> {
  const groups = others(m.spec.ref);
  return Object.fromEntries(GROUP_IDS.map(g => {
    const x = [...groups.map(h => (h === g ? 1 : 0)), ...m.spec.controls.map(() => 0)];
    const r = predictCi(m.fit, x);
    return [g, { fit: r.fit, lower: r.lower, upper: r.upper, n: m.n[g] }];
  })) as Record<GroupId, { fit: number; lower: number; upper: number; n: number }>;
}

/* ---------- Eingaben prüfen ---------- */

const decimals = (s: string) => (s.trim().replace(/^[−–-]/, '').split(/[.,]/)[1] ?? '').length;
/** Toleranz aus den Nachkommastellen (mindestens zwei): 0,17 → ±0,005; 0,166 → ±0,0005. */
export const tolerance = (input: string) => (decimals(input) >= 2 ? 0.5 * 10 ** -decimals(input) + 1e-9 : null);
const within = (value: number, input: string) => {
  const x = parseNumber(input), tol = tolerance(input);
  return x !== null && tol !== null && Number.isFinite(value) && Math.abs(value - x) <= tol;
};
const fmt = (x: number, d = 2) => de(x, d);
/** Eine eingetragene Zahl mit Komma und echtem Minus, so viele Stellen wie eingetragen. */
export const own = (input: string) => { const x = parseNumber(input); return x === null ? input.trim() : de(x, decimals(input)); };

export type ModelEntry = { c: string; b: [string, string, string, string] };
export const emptyEntry = (): ModelEntry => ({ c: '', b: ['', '', '', ''] });
type Field = 'c' | GroupId;
const fieldLabel = (f: Field) => (f === 'c' ? 'Konstante' : GROUPS[f].short);
const fieldInput = (e: ModelEntry, f: Field) => (f === 'c' ? e.c : e.b[f - 1]);
const fieldValue = (m: Model, f: Field) => (f === 'c' ? m.c : m.b[f]);

type Alternative = { values: number[]; text: string };

/** Erkannt: alle Felder (Konstante nur, wenn verlangt) passen zum Hauptmodell. */
export function modelRecognised(m: Model | null, ref: GroupId, e: ModelEntry, withConstant = true): boolean {
  if (!m) return false;
  const fields: Field[] = [...(withConstant ? ['c' as const] : []), ...others(ref)];
  return fields.every(f => within(fieldValue(m, f), fieldInput(e, f)));
}

/** Wertedetektor für eine Koeffiziententabelle: stimmt sie, passt sie zu einer bekannten Variante, oder was fehlt? */
function checkTable(m: Model | null, ref: GroupId, e: ModelEntry, withConstant: boolean, alternatives: Alternative[]): Note[] {
  const fields: Field[] = [...(withConstant ? ['c' as const] : []), ...others(ref)];
  const entered = fields.filter(f => fieldInput(e, f).trim());
  if (!entered.length) return [];
  if (!m) return [{ tone: 'warn', text: 'Dieses Modell lässt sich mit deiner Datei nicht schätzen – eine Gruppe ist leer oder die Prädiktoren sind kollinear. Prüfe Referenz und Kontrollen.' }];
  const bad = entered.find(f => parseNumber(fieldInput(e, f)) === null);
  if (bad) return [{ tone: 'warn', text: `${fieldLabel(bad)}: Das ist keine Zahl.` }];
  const coarse = entered.find(f => tolerance(fieldInput(e, f)) === null);
  if (coarse) return [{ tone: 'hint', text: `${fieldLabel(coarse)}: Trag die Werte mit drei Nachkommastellen ein, so wie R sie zeigt.` }];
  const wrong = entered.filter(f => !within(fieldValue(m, f), fieldInput(e, f)));
  if (!wrong.length) return entered.length === fields.length
    ? [{ tone: 'ok', text: `Stimmt: ${withConstant ? `Die Konstante ist die mittlere Zufriedenheit der Referenzgruppe (${GROUPS[ref].short}); ` : ''}jedes B ist der Abstand einer Gruppe zu ihr, kein eigener Gruppenwert.` }]
    : [{ tone: 'hint', text: `Bisher stimmt alles – trag noch ${fields.filter(f => !entered.includes(f)).map(fieldLabel).join(', ')} ein.` }];
  const alt = alternatives.find(a => wrong.every(f => a.values.some(v => within(v, fieldInput(e, f)))));
  if (alt) return [{ tone: 'warn', text: alt.text }];
  const right = entered.filter(f => !wrong.includes(f));
  return [{ tone: 'warn', text: `${wrong.map(fieldLabel).join(', ')}: Diesen Wert finde ich nicht.${right.length ? ` (${right.map(fieldLabel).join(', ')} ${right.length > 1 ? 'stimmen' : 'stimmt'}.)` : ''} Prüfe Umpolen, Gewicht und welche drei Dummies im Modell stehen.` }];
}

const values = (m: Model | null) => (m ? [m.c, ...others(m.spec.ref).map(g => m.b[g])] : []);

const altCache = new WeakMap<Models, Map<GroupId, Alternative[]>>();

/** Varianten des Gruppenmodells: ohne Gewicht, ohne Umpolen, andere Referenz (Dummyfalle), dg03 als Zahl, eastwest allein.
 *  Je Datei und Referenz einmal gerechnet. */
export function coreAlternatives(p: Prepared, models: Models, ref: GroupId): Alternative[] {
  const byRef = altCache.get(models) ?? new Map<GroupId, Alternative[]>();
  altCache.set(models, byRef);
  const hit = byRef.get(ref);
  if (hit) return hit;
  const out: Alternative[] = [];
  byRef.set(ref, out);
  const add = (m: Model | null, text: string) => { if (m) out.push({ values: values(m), text }); };
  add(core(models, ref, 'rev', false), 'Das ist das Modell ohne Gewicht. Warum ändert das Gewicht die Koeffizienten kaum, die Unsicherheit bei West→Ost aber deutlich? Für den Film rechnest du mit weights = wghtpew.');
  add(core(models, ref, 'orig'), 'Die Vorzeichen passen zu ps03 ohne Umpolen (1 = sehr zufrieden). Pol zuerst mit rec(ps03, rules = "rev") um.');
  add(core(models, ref, 'orig', false), 'Das ist ps03 ohne Umpolen und ohne Gewicht. Pol um und rechne mit weights = wghtpew.');
  for (const r of others(ref)) {
    const trap = r === 4 ? ' Oder stehen alle vier Dummies im Modell? Dann lässt R den letzten weg (Dummyfalle; mariposa meldet „perfect collinearity“ und zeigt unsinnige VIF-Werte) – nimm nur drei.' : '';
    add(core(models, r), `Diese Zahlen passen zur Referenz ${GROUPS[r].short} – oben hast du ${GROUPS[ref].short} gewählt.${trap}`);
    add(core(models, r, 'rev', false), `Das ist die Referenz ${GROUPS[r].short} ohne Gewicht – oben hast du ${GROUPS[ref].short} gewählt.`);
    add(core(models, r, 'orig'), `Das ist die Referenz ${GROUPS[r].short} mit ps03 ohne Umpolen – oben hast du ${GROUPS[ref].short} gewählt.`);
  }
  for (const [outcome, weighted] of [['rev', true], ['orig', true], ['rev', false]] as const) {
    const fit = tryOls(outcome === 'rev' ? p.y : p.yOrig, [p.dg], weighted ? p.w : null);
    if (fit) out.push({ values: fit.coef, text: 'Eine Zahl für vier Gruppen: dg03 als Zahl behandelt die Gruppen wie eine Skala von 1 bis 4. Nimm die Dummies aus to_dummy().' });
    const ew = tryOls(outcome === 'rev' ? p.y : p.yOrig, [p.ost], weighted ? p.w : null);
    if (ew) out.push({ values: ew.coef, text: 'Das ist der Ost-West-Unterschied allein (Wohnort). Die vier Gruppen brauchen die Dummies aus dg03.' });
  }
  return out;
}

export function checkModel(p: Prepared, models: Models, ref: GroupId, e: ModelEntry): Note[] {
  return checkTable(core(models, ref), ref, e, true, coreAlternatives(p, models, ref));
}

/** Modell mit Kontrollen: die drei B der Gruppen. */
export function checkControlled(models: Models, ref: GroupId, controls: ControlId[], e: ModelEntry): Note[] {
  const main = models({ outcome: 'rev', ref, controls, weighted: true });
  const alts: Alternative[] = [];
  const add = (m: Model | null, text: string) => { if (m) alts.push({ values: values(m), text }); };
  add(core(models, ref), 'Das sind die Werte ohne Kontrollen. Nimm die angekreuzten Kontrollen mit + ins Modell.');
  add(models({ outcome: 'rev', ref, controls, weighted: false }), 'Das ist das Modell mit Kontrollen, aber ohne Gewicht. Rechne mit weights = wghtpew.');
  add(models({ outcome: 'orig', ref, controls, weighted: true }), 'Die Vorzeichen passen zu ps03 ohne Umpolen. Pol zuerst um.');
  for (const c of controls) add(models({ outcome: 'rev', ref, controls: controls.filter(x => x !== c), weighted: true }), `Da fehlt eine Kontrolle: ${controlById[c].title}. Oben ist sie angekreuzt.`);
  for (const c of CONTROL_IDS.filter(x => !controls.includes(x))) add(models({ outcome: 'rev', ref, controls: [...controls, c], weighted: true }), `Das Modell enthält zusätzlich ${controlById[c].title} – oben ist diese Kontrolle nicht angekreuzt.`);
  return checkTable(main, ref, e, false, alts);
}

/** Gegenprobe mit pt03 (Vertrauen in den Bundestag) als abhängige Variable. */
export function checkCounter(models: Models, ref: GroupId, e: ModelEntry): Note[] {
  const alts: Alternative[] = [];
  const u = core(models, ref, 'pt03', false);
  if (u) alts.push({ values: values(u), text: 'Das ist die Gegenprobe ohne Gewicht. Rechne mit weights = wghtpew.' });
  const ps = core(models, ref);
  if (ps) alts.push({ values: values(ps), text: 'Das sind die Werte für die Demokratiezufriedenheit. In der Gegenprobe steht pt03 links vom ~.' });
  for (const r of others(ref)) { const m = core(models, r, 'pt03'); if (m) alts.push({ values: values(m), text: `Diese Zahlen passen zur Referenz ${GROUPS[r].short} – nimm dieselbe Referenz wie oben (${GROUPS[ref].short}).` }); }
  return checkTable(core(models, ref, 'pt03'), ref, e, false, alts);
}

/** Vorhersage für Ost→West aus der eigenen Tabelle: Konstante + B (oder die Konstante, wenn Ost→West die Referenz ist). */
export function checkPrediction(m: Model | null, e: ModelEntry, input: string, group: GroupId = 2): Note[] {
  const x = parseNumber(input);
  if (!m || x === null) return input.trim() && x === null ? [{ tone: 'warn', text: 'Das ist keine Zahl.' }] : [];
  const tol = tolerance(input);
  if (tol === null) return [{ tone: 'hint', text: 'Bitte mit zwei Nachkommastellen.' }];
  const t = Math.max(tol, 0.011);
  const ref = m.spec.ref, exact = m.c + m.b[group];
  const c = parseNumber(e.c), b = group === ref ? 0 : parseNumber(e.b[group - 1]);
  const mine = c !== null && b !== null ? c + b : NaN;
  if (Math.abs(x - exact) <= t || Math.abs(x - mine) <= t) return [{ tone: 'ok', text: `Stimmt: ${group === ref ? `${GROUPS[group].short} ist die Referenz, die Vorhersage ist die Konstante.` : `Konstante + B(${GROUPS[group].short}) = ${fmt(exact)}.`} Diese Zahl muss bei jeder Referenz herauskommen.` }];
  if (group !== ref && Math.abs(x - m.b[group]) <= t) return [{ tone: 'hint', text: 'Das ist nur der Abstand zur Referenz. Die Vorhersage ist Konstante + B.' }];
  if (group !== ref && Math.abs(x - m.c) <= t) return [{ tone: 'hint', text: 'Das ist die Konstante – die Vorhersage der Referenzgruppe. Für Ost→West kommt das B dazu.' }];
  return [{ tone: 'warn', text: 'Rechne Konstante + B der Gruppe aus deiner Tabelle.' }];
}

/* ---------- Wie viele Umgezogene? ---------- */

export type MoverVariant = { key: 'all' | 'allWeighted' | 'model' | 'modelWeighted'; ow: number; wo: number; text: string };

export function moverVariants(p: Prepared): MoverVariant[] {
  const count = (g: GroupId, weighted: boolean, model: boolean) => {
    let s = 0;
    for (let i = 0; i < p.dg.length; i++) if (p.dg[i] === g && (!model || Number.isFinite(p.y[i])) && (!weighted || Number.isFinite(p.w[i]))) s += weighted ? p.w[i] : 1;
    return s;
  };
  return [
    { key: 'all', ow: count(2, false, false), wo: count(3, false, false), text: 'Das ist die Häufigkeit ohne Gewicht über alle Befragten.' },
    { key: 'allWeighted', ow: count(2, true, false), wo: count(3, true, false), text: 'Das ist die gewichtete Häufigkeit über alle Befragten – so viele stünden für Deutschland.' },
    { key: 'model', ow: count(2, false, true), wo: count(3, false, true), text: 'Das sind die Umgezogenen, die auch ps03 beantwortet haben – genau sie tragen das Modell.' },
    { key: 'modelWeighted', ow: count(2, true, true), wo: count(3, true, true), text: 'Das ist die gewichtete Zahl der Umgezogenen mit ps03.' },
  ];
}

const countTol = (input: string) => Math.max(0.5 * 10 ** -decimals(input), 0.5) + 1e-9;
const nearCount = (v: number, input: string) => { const x = parseNumber(input); return x !== null && Math.abs(x - v) <= countTol(input); };

export function moversRecognised(vars: MoverVariant[], ow: string, wo: string): MoverVariant | null {
  return vars.find(v => nearCount(v.ow, ow) && nearCount(v.wo, wo)) ?? null;
}

export function checkMovers(vars: MoverVariant[], ow: string, wo: string): Note[] {
  if (!ow.trim() || !wo.trim()) return [];
  if (parseNumber(ow) === null || parseNumber(wo) === null) return [{ tone: 'warn', text: 'Bitte zwei Zahlen eintragen.' }];
  const hit = moversRecognised(vars, ow, wo);
  const model = vars.find(v => v.key === 'model')!;
  const film = `Im Modell stehen nur Befragte, denen ps03 gestellt wurde (Split): ${de(model.ow, 0)} Ost→West und ${de(model.wo, 0)} West→Ost. So wenige Menschen tragen den Film.`;
  if (hit) return [{ tone: 'ok', text: `${hit.text} ${hit.key === 'model' ? '' : film}`.trim() }];
  if (vars.some(v => nearCount(v.ow, wo) && nearCount(v.wo, ow))) return [{ tone: 'hint', text: 'Vertauscht? Ost→West heißt: im Osten aufgewachsen, lebt heute im Westen (dg03 = 2).' }];
  return [{ tone: 'warn', text: 'Diese Zahlen finde ich nicht. frequency(dg03) zeigt die vier Gruppen; Ost→West ist Code 2, West→Ost Code 3.' }];
}

/* ---------- Wer zieht um? Selektion ---------- */

export type Selection = { weighted: Record<GroupId, number>; unweighted: Record<GroupId, number>; model: number; modelUnweighted: number; col: number };

/** Abitur-Anteile je Gruppe wie crosstab(dg03, abi, percentages = "row", weights = wghtpew) (Prozent aus ungerundeten Zellen). */
export function selection(p: Prepared): Selection {
  const abi = p.controls.abi;
  const share = (g: GroupId, weighted: boolean, model: boolean) => {
    let yes = 0, all = 0;
    for (let i = 0; i < p.dg.length; i++) {
      if (p.dg[i] !== g || !Number.isFinite(abi[i]) || (model && !Number.isFinite(p.y[i]))) continue;
      const w = weighted ? p.w[i] : 1;
      all += w; if (abi[i] === 1) yes += w;
    }
    return 100 * yes / all;
  };
  let colYes = 0, colAll = 0;
  for (let i = 0; i < p.dg.length; i++) if (Number.isFinite(p.dg[i]) && abi[i] === 1) { colAll += p.w[i]; if (p.dg[i] === 3) colYes += p.w[i]; }
  return {
    weighted: Object.fromEntries(GROUP_IDS.map(g => [g, share(g, true, false)])) as Record<GroupId, number>,
    unweighted: Object.fromEntries(GROUP_IDS.map(g => [g, share(g, false, false)])) as Record<GroupId, number>,
    model: share(3, true, true), modelUnweighted: share(3, false, true), col: 100 * colYes / colAll,
  };
}

const pctTol = (input: string) => 0.5 * 10 ** -decimals(input) + 1e-9;
const nearPct = (v: number, input: string) => { const x = parseNumber(input); return x !== null && Number.isFinite(v) && Math.abs(x - v) <= pctTol(input); };

export const selectionRecognised = (s: Selection, input: string) =>
  [s.weighted[3], s.unweighted[3], s.model, s.modelUnweighted].some(v => nearPct(v, input) || nearPct(v / 100, input));

export function checkSelection(s: Selection, input: string): Note[] {
  const x = parseNumber(input);
  if (x === null) return input.trim() ? [{ tone: 'warn', text: 'Das ist keine Zahl.' }] : [];
  const all = `Abitur-Anteile: ${GROUP_IDS.map(g => `${GROUPS[g].short} ${de(s.weighted[g], 1)} %`).join(', ')}.`;
  if (nearPct(s.weighted[3], input) || nearPct(s.weighted[3] / 100, input)) return [{ tone: 'ok', text: `Stimmt (gewichtet). ${all} Die West→Ost-Umgezogenen sind eine eigene Auswahl – das ist Selektion.` }];
  if (nearPct(s.unweighted[3], input)) return [{ tone: 'ok', text: `Stimmt (ohne Gewicht; gewichtet ${de(s.weighted[3], 1)} %). ${all} Die West→Ost-Umgezogenen sind eine eigene Auswahl – das ist Selektion.` }];
  if (nearPct(s.model, input) || nearPct(s.modelUnweighted, input)) return [{ tone: 'ok', text: `Stimmt für die Befragten mit ps03. Über alle: ${all}` }];
  if (nearPct(100 - s.weighted[3], input) || nearPct(100 - s.unweighted[3], input)) return [{ tone: 'hint', text: 'Das ist der Anteil ohne Abitur. Gesucht ist die Spalte (Fach-)Abitur.' }];
  const other = GROUP_IDS.find(g => g !== 3 && (nearPct(s.weighted[g], input) || nearPct(s.unweighted[g], input)));
  if (other) return [{ tone: 'hint', text: `Das ist die Zeile ${GROUPS[other].short}. Gesucht ist West→Ost (dg03 = 3).` }];
  if (nearPct(s.col, input)) return [{ tone: 'hint', text: 'Das sind Spaltenprozente: welcher Teil der Abiturient:innen West→Ost gezogen ist. Gesucht ist der Anteil innerhalb der Gruppe: percentages = "row".' }];
  return [{ tone: 'warn', text: 'Diesen Wert finde ich nicht. crosstab(dg03, abi, percentages = "row", weights = wghtpew) zeigt die Zeilenprozente.' }];
}

/** Denkanstoß zur Sortierung einer Kontrollkarte – keine Musterlösung. */
export function sortNote(id: ControlId, sort: Sort | ''): Note[] {
  if (!sort) return [];
  const c = controlById[id];
  return [{ tone: (sort === 'vorher') === !c.consequence ? 'ok' : 'hint', text: `${c.title}: ${sort === 'vorher' ? c.onBefore : c.onAfter}` }];
}

/** Wie ändern die Kontrollen die drei Abstände? */
export function controlEffect(models: Models, ref: GroupId, controls: ControlId[]): { g: GroupId; without: number; with: number }[] | null {
  const a = core(models, ref), b = models({ outcome: 'rev', ref, controls, weighted: true });
  return a && b ? others(ref).map(g => ({ g, without: a.b[g], with: b.b[g] })) : null;
}

/* ---------- Interaktion (Profi) ---------- */

export type Interaction = { fit: OlsFit; additive: OlsFit | null; unweighted: OlsFit | null; orig: OlsFit | null };

export function interaction(p: Prepared): Interaction | null {
  const prod = Float64Array.from(p.ost, (v, i) => v * p.ostjugend[i]);
  const fit = tryOls(p.y, [p.ost, p.ostjugend, prod], p.w, { names: ['ost', 'ostjugend', 'ost:ostjugend'] });
  if (!fit) return null;
  return {
    fit, additive: tryOls(p.y, [p.ost, p.ostjugend], p.w), unweighted: tryOls(p.y, [p.ost, p.ostjugend, prod], null), orig: tryOls(p.yOrig, [p.ost, p.ostjugend, prod], p.w),
  };
}

export const interactionRecognised = (it: Interaction | null, input: string) => Boolean(it && within(it.fit.coef[3], input));

export function checkInteraction(it: Interaction | null, coreR2: number, input: string): Note[] {
  const x = parseNumber(input);
  if (x === null) return input.trim() ? [{ tone: 'warn', text: 'Das ist keine Zahl.' }] : [];
  if (!it) return [{ tone: 'warn', text: 'Das Interaktionsmodell lässt sich mit deiner Datei nicht schätzen.' }];
  if (tolerance(input) === null) return [{ tone: 'hint', text: 'Bitte mit drei Nachkommastellen, so wie R sie zeigt.' }];
  const f = it.fit;
  if (within(f.coef[3], input)) return [{ tone: 'ok', text: `Stimmt: ost:ostjugend = ${fmt(f.coef[3], 3)} (${f.p[3] < 0.001 ? 'p < 0,001' : `p = ${de(f.p[3], 3)}`}). Die Ost-Bleibenden liegen um so viel anders, als ost und ostjugend einzeln erwarten ließen. R² = ${fmt(f.r2, 3)} – wie im Modell mit vier Gruppen (${fmt(coreR2, 3)}): dieselbe Information, zweite Schreibweise.` }];
  if (it.orig && within(it.orig.coef[3], input)) return [{ tone: 'warn', text: 'Das Vorzeichen passt zu ps03 ohne Umpolen. Pol zuerst um.' }];
  if (it.unweighted && within(it.unweighted.coef[3], input)) return [{ tone: 'hint', text: 'Das ist die Interaktion ohne Gewicht. Rechne mit weights = wghtpew.' }];
  if (it.additive && it.additive.coef.slice(1).some(v => within(v, input))) return [{ tone: 'hint', text: 'Das ist das Modell ohne Interaktion (ost + ostjugend). Schreib ost * ostjugend.' }];
  if (within(f.coef[1], input) || within(f.coef[2], input)) return [{ tone: 'hint', text: 'Das ist der Koeffizient für ost bzw. ostjugend. Gesucht ist die Zeile ost:ostjugend.' }];
  if (within(f.p[3], input)) return [{ tone: 'hint', text: 'Das ist der p-Wert. Gesucht ist B der Zeile ost:ostjugend.' }];
  return [{ tone: 'warn', text: 'Diesen Wert finde ich nicht. Bilde ost und ostjugend mit rec() und rechne linear_regression(demo ~ ost * ostjugend, weights = wghtpew).' }];
}

/* ---------- Wackeltest und Tafel ---------- */

export type Wobble = { g: GroupId; full: number; lo: number; hi: number };

/** Wackeltest (Einfluss): Jeder Gruppenabstand ohne die fünf Fälle, die ihn am stärksten nach oben bzw. nach unten ziehen (DFBETA). */
export function wobbleTest(m: Model, k = WOBBLE_K): Wobble[] {
  const db = dfbeta(m.fit);
  return others(m.spec.ref).map((g, j) => {
    const r = wobble(m.fit, j + 1, k, db);
    const vals = [r.withoutUp, r.withoutDown];
    return { g, full: m.b[g], lo: Math.min(...vals), hi: Math.max(...vals) };
  });
}

/** Tafel der anderen Schnittplätze: dieselbe Frage mit jeder Referenz. */
export function board(models: Models): { ref: GroupId; model: Model }[] {
  return GROUP_IDS.flatMap(ref => { const m = core(models, ref); return m ? [{ ref, model: m }] : []; });
}

/* ---------- Welche Gruppe entscheidet den Streit? ---------- */

export function checkDecide(groups: GroupId[]): Note[] {
  if (!groups.length) return [];
  if (groups.some(g => MOVERS.includes(g))) return [{ tone: 'ok', text: 'Genau: Nur bei den Umgezogenen sagen „Prägung“ und „Ort“ Verschiedenes voraus. Bei den Bleibenden erwarten beide Lager dasselbe.' }];
  return [{ tone: 'hint', text: 'Bei den Bleibenden erwarten beide Lager dasselbe. Welche Gruppen trennen Prägung und Ort?' }];
}

/* ---------- Off-Text: Gegenfragen ---------- */

const CAUSAL = /\b(macht|machen|prägt|prägen|geprägt|weil|deshalb|daher|führt|führen|verursach\w*|bewirk\w*|sorgt|liegt\s+an|liegt\s+am)\b/i;
const SWEEPING = /\b(alle|immer|jede[rsnm]?|niemand|nie|keine[rn]?|die Ostdeutschen|die Westdeutschen)\b/i;
const EAST_TO_WEST = /in den Westen|nach Westen|Ost\s*→\s*West|Ost-West-Umgezogen|aus dem Osten/i;
const WEST_TO_EAST = /in den Osten|nach Osten|West\s*→\s*Ost|West-Ost-Umgezogen|aus dem Westen/i;
const HEDGE = /\b(etwa|rund|ungefähr|vermutlich|wohl|unsicher\w*|kleine[rn]?|wenige[rn]?|Spanne|zwischen|kaum|vielleicht|deutet|scheint|eher|wenig)\b/i;

export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export type OffContext = {
  selection: Selection | null;
  movers: MoverVariant | null;
  wobble: Wobble[] | null;
  consequences: ControlId[];
  effectWithout: { g: GroupId; value: number }[] | null;
};

/** Gegenfragen zum Off-Text-Satz (Regelwerk wie in „Belege es!“): Denkanstöße ohne Bewertung. Zahlen nur, wo die eigenen Werte erkannt sind. */
export function offQuestions(text: string, ctx: OffContext): Note[] {
  if (!text.trim()) return [];
  const notes: Note[] = [];
  const words = wordCount(text);
  if (words > MAX_WORDS) notes.push({ tone: 'warn', text: `${words} Wörter – die Sprecherin hat Platz für höchstens ${MAX_WORDS}.` });
  if (CAUSAL.test(text)) notes.push({ tone: 'hint', text: ctx.selection
    ? `Wer zieht um? Von den West→Ost-Umgezogenen haben ${de(ctx.selection.weighted[3], 0)} % Abitur (West-Bleibende ${de(ctx.selection.weighted[4], 0)} %) – die Gruppen unterscheiden sich schon, bevor jemand umzieht.`
    : 'Wer zieht um? Unterscheiden sich die Umgezogenen schon, bevor sie umziehen?' });
  if (SWEEPING.test(text)) notes.push({ tone: 'hint', text: ctx.movers
    ? `Wie viele Menschen tragen diesen Satz? Im Modell ${de(ctx.movers.ow, 0)} Ost→West und ${de(ctx.movers.wo, 0)} West→Ost.`
    : 'Wie viele Menschen tragen diesen Satz?' });
  const ew = EAST_TO_WEST.test(text), we = WEST_TO_EAST.test(text);
  if (ew !== we) notes.push({ tone: 'hint', text: `Und die andere Gruppe? Du sprichst nur von ${ew ? 'Ost→West' : 'West→Ost'}.` });
  if (ctx.consequences.length) notes.push({ tone: 'hint', text: `Du hast ${ctx.consequences.map(c => controlById[c].title).join(' und ')} kontrolliert – das kann eine Folge des Umzugs sein.${ctx.effectWithout ? ` Ohne diese Kontrolle: ${ctx.effectWithout.map(x => `${GROUPS[x.g].short} ${fmt(x.value, 2)}`).join(', ')}.` : ''}` });
  if (!HEDGE.test(text)) notes.push({ tone: 'hint', text: ctx.wobble
    ? `Wie sicher ist das? Wackeltest ohne die fünf einflussreichsten Fälle: ${ctx.wobble.filter(x => MOVERS.includes(x.g)).map(x => `${GROUPS[x.g].short} zwischen ${fmt(x.lo)} und ${fmt(x.hi)}`).join(', ')}.`
    : 'Wie sicher ist das? Wie viele Menschen tragen die Zahl, und wie stark wackelt sie?' });
  return notes;
}

/* ---------- Zustand ---------- */

export type S09State = {
  mode: WorkMode;
  decide: GroupId[];
  decideText: string;
  movers: [string, string];
  ref: GroupId | 0;
  refReason: string;
  model: ModelEntry;
  pred: string;
  second: { ref: GroupId | 0; model: ModelEntry; pred: string };
  abi: string;
  sort: Record<ControlId, Sort | ''>;
  controls: ControlId[];
  cmodel: ModelEntry;
  inter: string;
  counter: ModelEntry;
  offText: string;
};

const emptySort = () => Object.fromEntries(CONTROL_IDS.map(id => [id, ''])) as Record<ControlId, Sort | ''>;

export const initialS09 = (): S09State => ({
  mode: 'solo', decide: [], decideText: '', movers: ['', ''], ref: 0, refReason: '', model: emptyEntry(), pred: '',
  second: { ref: 0, model: emptyEntry(), pred: '' }, abi: '', sort: emptySort(), controls: [], cmodel: emptyEntry(), inter: '', counter: emptyEntry(), offText: '',
});

/** Neue Referenz: Tabellen, die an ihr hängen, beginnen von vorn; die zweite Referenz nur, wenn sie jetzt gleich wäre. */
export function chooseRef(s: S09State, ref: GroupId | 0): S09State {
  if (ref === s.ref) return s;
  return { ...s, ref, model: emptyEntry(), pred: '', cmodel: emptyEntry(), counter: emptyEntry(), second: s.second.ref === ref ? { ref: 0, model: emptyEntry(), pred: '' } : s.second };
}
export const chooseSecondRef = (s: S09State, ref: GroupId | 0): S09State =>
  ref === s.second.ref ? s : { ...s, second: { ref, model: emptyEntry(), pred: '' } };
/** Andere Kontrollen: die Tabelle mit Kontrollen beginnt von vorn. */
export const toggleControl = (s: S09State, id: ControlId): S09State =>
  ({ ...s, controls: s.controls.includes(id) ? s.controls.filter(c => c !== id) : orderedControls([...s.controls, id]), cmodel: emptyEntry() });

const isGroup = (x: unknown): x is GroupId => x === 1 || x === 2 || x === 3 || x === 4;
function parseEntry(raw: unknown): ModelEntry {
  const r = record(raw), b = Array.isArray(r.b) ? r.b : [];
  return { c: str(r.c, 12), b: [0, 1, 2, 3].map(i => str(b[i], 12)) as ModelEntry['b'] };
}

export function parseS09(raw: unknown): S09State {
  const r = record(raw), second = record(r.second), sort = record(r.sort), movers = Array.isArray(r.movers) ? r.movers : [];
  const ref = isGroup(r.ref) ? r.ref : 0, secondRef = isGroup(second.ref) && second.ref !== ref ? second.ref : 0;
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    decide: Array.isArray(r.decide) ? GROUP_IDS.filter(g => (r.decide as unknown[]).includes(g)) : [],
    decideText: str(r.decideText, 400), movers: [str(movers[0], 12), str(movers[1], 12)],
    ref, refReason: str(r.refReason, 400), model: parseEntry(r.model), pred: str(r.pred, 12),
    second: { ref: secondRef, model: parseEntry(second.model), pred: str(second.pred, 12) },
    abi: str(r.abi, 12),
    sort: Object.fromEntries(CONTROL_IDS.map(id => [id, oneOf(sort[id], [...SORTS, ''] as const, '')])) as Record<ControlId, Sort | ''>,
    controls: Array.isArray(r.controls) ? CONTROL_IDS.filter(id => (r.controls as unknown[]).includes(id)) : [],
    cmodel: parseEntry(r.cmodel), inter: str(r.inter, 12), counter: parseEntry(r.counter), offText: str(r.offText, 400),
  };
}

const filled = (e: ModelEntry, ref: GroupId | 0, withConstant: boolean) =>
  ref !== 0 && (!withConstant || e.c.trim() !== '') && others(ref).every(g => e.b[g - 1].trim() !== '');

export function statusS09(s: S09State): TaskStatus {
  if (s.ref && filled(s.model, s.ref, true) && s.pred.trim() && s.movers.every(m => m.trim()) && s.abi.trim() && filled(s.cmodel, s.ref, false) && s.offText.trim()) return 'done';
  return s.decide.length || s.movers.some(m => m.trim()) || s.ref || s.offText.trim() ? 'running' : 'open';
}

export function plenumLines(s: S09State): [string, string][] {
  const ref = s.ref ? GROUPS[s.ref] : null;
  const notControlled = CONTROL_IDS.filter(id => s.sort[id] === 'folge' && !s.controls.includes(id)).map(id => controlById[id].title);
  const lines: [string, string][] = [
    ['Referenzgruppe', ref ? ref.short : ''],
    ['B Ost→West', !s.ref ? '' : s.ref === 2 ? 'Referenz' : s.model.b[1].trim() ? own(s.model.b[1]) : ''],
    ['Vorhersage Ost→West', s.pred.trim() ? own(s.pred) : ''],
    ['Kontrolliert', s.controls.map(id => controlById[id].title).join(', ')],
    ['Bewusst nicht kontrolliert', notControlled.length ? `${notControlled.join(', ')} (${SORT_LABEL.folge})` : ''],
    ['Off-Text', s.offText.trim()],
  ];
  if (s.second.ref) lines.splice(3, 0, ['Zweite Referenz', `${GROUPS[s.second.ref].short}${s.second.pred.trim() ? ` · Vorhersage Ost→West ${own(s.second.pred)}` : ''}`]);
  return lines;
}

/* ---------- R-Code ---------- */

export const dummyTerms = (ref: GroupId) => others(ref).map(g => GROUPS[g].dummy).join(' + ');

const setupLines = [
  'library(dplyr)',
  'library(mariposa)   # zuletzt laden: haven würde sonst read_spss() überdecken',
  '',
  'allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav',
  '',
  '# Zufriedenheit umpolen (höher = zufriedener), Abitur und Geschlecht als 0/1',
  'allbus <- allbus %>%',
  '  mutate(',
  '    demo = rec(ps03, rules = "rev"),',
  `    abi  = rec(educ, rules = "${controlById.abi.rules}"),`,
  `    frau = rec(sex, rules = "${controlById.frau.rules}")`,
  '  )',
  '',
  '# Wer ist umgezogen? (dg03: Jugend Ost/West × Wohnort heute Ost/West)',
  'allbus %>% frequency(dg03, weights = wghtpew) %>% summary()',
  '',
  '# Einmal alle vier Dummies anlegen: dg03_1 … dg03_4',
  'allbus <- allbus %>% to_dummy(dg03)',
];
export const rSetup = () => setupLines.join('\n');

export const rModel = (ref: GroupId, outcome: 'demo' | 'pt03' = 'demo') => [
  `# Referenz: ${GROUPS[ref].short} – ihr Dummy (${GROUPS[ref].dummy}) bleibt draußen; nie alle vier zugleich`,
  'allbus %>%',
  `  linear_regression(${outcome} ~ ${dummyTerms(ref)}, weights = wghtpew) %>%`,
  '  summary()',
].join('\n');

/** mariposa 0.7.3: summary() bricht ab, wenn deparse() die Formel auf zwei Zeilen umbricht (über 60 Zeichen). */
export const LONG_FORMULA = 60;

export function rControls(ref: GroupId, controls: ControlId[]): string {
  const formula = `demo ~ ${[dummyTerms(ref), ...orderedControls(controls)].join(' + ')}`;
  const model = formula.length > LONG_FORMULA
    ? ['modell <- allbus %>%', `  linear_regression(${formula}, weights = wghtpew)`,
      '# Bei so langen Formeln bricht summary() in mariposa 0.7.3 ab – die Koeffiziententabelle zeigt B, Standardfehler, p und KI:', 'modell$coef_table']
    : ['allbus %>%', `  linear_regression(${formula}, weights = wghtpew) %>%`, '  summary()'];
  return [
    '# Wer zieht um? Abitur-Anteil je Gruppe',
    'allbus %>% crosstab(dg03, abi, percentages = "row", weights = wghtpew) %>% summary()',
    '',
    `# Modell mit Kontrollen${controls.length ? '' : ' (noch keine angekreuzt)'}`,
    ...model,
  ].join('\n');
}

export const rInteraction = () => [
  '# Profi: dieselbe Frage als Interaktion',
  'allbus <- allbus %>%',
  '  mutate(',
  '    ost       = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]"),',
  '    ostjugend = rec(dg03, rules = "1:2=1 [Jugend Ost]; 3:4=0 [Jugend West]")',
  '  )',
  'allbus %>% linear_regression(demo ~ ost + ostjugend, weights = wghtpew) %>% summary()',
  'allbus %>% linear_regression(demo ~ ost * ostjugend, weights = wghtpew) %>% summary()',
].join('\n');

/** Vollständiges Skript (Hilfestufe 4) für eine Referenz und eine Kontrollauswahl. */
export function rSolution(ref: GroupId, controls: ControlId[] = COMMON_CAUSES): string {
  return [
    rSetup(), '',
    rModel(ref), '',
    rControls(ref, controls), '',
    '# Gegenprobe: Vertrauen in den Bundestag statt Demokratiezufriedenheit',
    rModel(ref, 'pt03'), '',
    rInteraction(),
  ].join('\n');
}

export const scaffoldModel = () => [
  'allbus <- allbus %>% to_dummy(___)',
  'allbus %>%',
  '  linear_regression(demo ~ ___ + ___ + ___, weights = ___) %>%',
  '  summary()',
].join('\n');

export const scaffoldControls = (ref: GroupId) => [
  'allbus %>% crosstab(dg03, ___, percentages = "___", weights = wghtpew) %>% summary()',
  'allbus %>%',
  `  linear_regression(demo ~ ${dummyTerms(ref)} + ___ + ___, weights = wghtpew) %>%`,
  '  summary()',
].join('\n');

export const scaffoldInteraction = () => [
  'allbus <- allbus %>%',
  '  mutate(ost = rec(eastwest, rules = "___"),',
  '         ostjugend = rec(dg03, rules = "___"))',
  'allbus %>% linear_regression(demo ~ ___ * ___, weights = wghtpew) %>% summary()',
].join('\n');
