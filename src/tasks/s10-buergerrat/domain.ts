import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { averageMarginalEffects, linkinv, logistic, logitOf, LOGIT_PROBLEMS, type LogitFit, type LogitResult } from '../kit/logit';
import { de, halfUnit, numberReadings } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { crosstab, validValues } from '../kit/stats';
import { oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { CAMPAIGN_ANSWERS, EXPERT_OR, PERSONS, UNITS, type CampaignAnswer, type PersonId, type Unit } from './content';

/* ---------- Vorbereitung: Variablen wie im Lösungsskript, alle Modellvarianten einmal je Datei ---------- */

export type ModelId = 'main' | 'unweighted' | 'nonvote' | 'pe09' | 'pa02a' | 'dontknow' | 'ineligible' | 'allMissing' | 'pflichtOnly';
export type Profile = [pflicht: number, interesse: number];
export type Prepared = {
  models: Record<ModelId, LogitResult>;
  /** Das Modell des Sachverständigen – null, wenn es sich auf dieser Datei nicht schätzen lässt */
  main: LogitFit | null;
  /** Erklärung statt Zahl, wenn main fehlt */
  problem: string | null;
  /** Spannweite des umgepolten Pflichtgefühls (für die S-Kurve) */
  pflichtRange: [number, number];
  /** Profile auf den umgepolten Skalen und in den Originalcodes */
  profiles: Record<PersonId, Profile>;
  rawProfiles: Record<PersonId, Profile>;
  /** AME (Pflichtgefühl, Interesse) gewichtet und ohne Gewicht */
  ame: number[];
  ameUnweighted: number[];
  /** Anteil der Wählenden in der gewichteten Kreuztabelle pflicht × waehlen, ungerundet und aus den gerundeten Summen (Station 6) */
  crosstabShare: number[];
};

/** rec(x, rules = "rev") wie mariposa 0.7.3: max + min − x über die beobachteten gültigen Werte. */
function reverser(x: Float64Array) {
  let lo = Infinity, hi = -Infinity;
  for (const v of x) if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const apply = (v: number) => hi + lo - v;
  return { apply, lo, hi, column: Float64Array.from(x, v => (Number.isFinite(v) ? apply(v) : NaN)) };
}

export function prepare(sav: SavFile): Prepared {
  const pvVar = sav.byName.get('pv01')!;
  const pv = validValues(pvVar), pvRaw = pvVar.values;
  const vote = (v: number) => (v >= 1 && v <= 90 ? 1 : v === 91 ? 0 : NaN);
  const waehlen = Float64Array.from(pv, vote);
  const pe09 = validValues(sav.byName.get('pe09')!), pa02a = validValues(sav.byName.get('pa02a')!);
  const w = validValues(sav.byName.get('wghtpew')!);
  const rp = reverser(pe09), ri = reverser(pa02a);
  const names = ['pflicht', 'interesse'];
  const xs = [rp.column, ri.column];
  // Varianten der abhängigen Variable: „weiß nicht“ (−8), „nicht wahlberechtigt“ (−50) oder alle fehlenden Angaben als 0
  const extra = (code: number | null) => Float64Array.from(pvRaw, (raw, i) => (code === null ? (waehlen[i] === 1 ? 1 : 0) : raw === code ? 0 : waehlen[i]));
  const models: Record<ModelId, LogitResult> = {
    main: logistic(waehlen, xs, names, w),
    unweighted: logistic(waehlen, xs, names, null),
    nonvote: logistic(Float64Array.from(waehlen, v => 1 - v), xs, names, w),
    pe09: logistic(waehlen, [pe09, ri.column], ['pe09', 'interesse'], w),
    pa02a: logistic(waehlen, [rp.column, pa02a], ['pflicht', 'pa02a'], w),
    dontknow: logistic(extra(-8), xs, names, w),
    ineligible: logistic(extra(-50), xs, names, w),
    allMissing: logistic(extra(null), xs, names, w),
    pflichtOnly: logistic(waehlen, [rp.column], ['pflicht'], w),
  };
  const main = models.main.ok ? models.main : null;
  const profiles = {} as Record<PersonId, Profile>, rawProfiles = {} as Record<PersonId, Profile>;
  for (const person of Object.values(PERSONS)) {
    rawProfiles[person.id] = [person.pe09, person.pa02a];
    profiles[person.id] = [rp.apply(person.pe09), ri.apply(person.pa02a)];
  }
  const t = crosstab(rp.column, waehlen, w);
  const yes = t.cols.indexOf(1);
  const yesSum = yes < 0 ? NaN : t.cells.reduce((s, row) => s + row[yes], 0);
  const crosstabShare = t.n ? [yesSum / t.n, Math.round(yesSum) / Math.round(t.n)] : [];
  return {
    models, main, profiles, rawProfiles, crosstabShare, pflichtRange: [rp.lo, rp.hi],
    problem: models.main.ok ? null : LOGIT_PROBLEMS[models.main.problem],
    ame: main ? averageMarginalEffects(main).map(a => a.ame) : [],
    ameUnweighted: models.unweighted.ok ? averageMarginalEffects(models.unweighted).map(a => a.ame) : [],
  };
}

const fitOf = (p: Prepared, id: ModelId) => { const m = p.models[id]; return m.ok ? m : null; };
const up = (x: Profile): Profile => [x[0] + 1, x[1]];

/** Die Zahlen des Modells für die beiden Ratsmitglieder (ohne und mit einer Stufe mehr Pflichtgefühl). */
export type PersonNumbers = { logit: [number, number]; odds: [number, number]; prob: [number, number] };
export function personNumbers(fit: LogitFit, x: Profile): PersonNumbers {
  const l: [number, number] = [logitOf(fit, x), logitOf(fit, up(x))];
  return { logit: l, odds: [Math.exp(l[0]), Math.exp(l[1])], prob: [linkinv(l[0]), linkinv(l[1])] };
}

/* ---------- Wertedetektor ---------- */

export type Reading = { x: number; tol: number; percent: boolean };
/** Liest eine Eingabe mit numberReadings() aus dem Kit („3.765“ wie in R und als Tausenderpunkt, vorangestelltes „+“/„×“ erlaubt);
 *  „%“ oder „Prozent“ am Ende markiert Prozent, eine angehängte Einheit („Pp.“, „Prozentpunkte“, „-fach“) wird überlesen.
 *  Toleranz = eine halbe Einheit der letzten eingegebenen Stelle. */
export function readEntries(input: string): Reading[] {
  const t = input.trim().replace(/\s*(Pp\.?|Prozentpunkte|-?fach|x)$/i, ''), percent = /(%|Prozent)$/i.test(t);
  const core = t.replace(/\s*(%|Prozent)$/i, '').trim();
  return numberReadings(core).map(({ x, decimals }) => ({ x, tol: halfUnit(decimals), percent }));
}
export const readEntry = (input: string): Reading | null => readEntries(input)[0] ?? null;

/** Eine Deutung für eine eingetragene Zahl. prob: Wert ist eine Wahrscheinlichkeit/ein Anteil (Eingabe als Anteil oder in Prozent).
 *  slack: relativer Spielraum für Werte, die man von Hand aus gerundeten Zahlen weiterrechnet (Chance × Exp(B), p aus der Chance). */
export type Candidate = { id: string; value: number; prob?: boolean; slack?: number; note: (r: Reading) => Note };
/** Spielraum beim Weiterrechnen von Hand: 0,5 % für Chancen, 0,1 % für Wahrscheinlichkeiten. */
export const HAND_SLACK = { odds: 0.005, prob: 0.001 } as const;
const slack = (c: Candidate, s: number): Candidate => ({ ...c, slack: s });
const cand = (id: string, value: number, tone: Note['tone'], text: string | ((r: Reading) => string), prob = false): Candidate =>
  ({ id, value, prob, note: r => ({ tone, text: typeof text === 'string' ? text : text(r) }) });

/** Abstand relativ zur Toleranz (≤ 1 heißt: passt) und die Toleranz in der Einheit der Deutung.
 *  Verglichen wird mit dem genauen Wert und mit dem Wert, wie mariposa ihn druckt (drei Nachkommastellen) – wer 1.405 zu 1,41 rundet, liegt richtig. */
function compare(r: Reading, c: Candidate): { d: number; tol: number } | null {
  if (!Number.isFinite(c.value)) return null;
  const printed = Math.round(c.value * 1000) / 1000;
  const readings: [number, number][] = c.prob
    ? r.percent ? [[r.x / 100, r.tol / 100]] : Math.abs(r.x) <= 1 ? [[r.x, r.tol]] : [[r.x / 100, r.tol / 100], [r.x, r.tol]]
    : r.percent ? [] : [[r.x, r.tol]];
  let best: { d: number; tol: number } | null = null;
  for (const [x, tol] of readings) {
    const d = Math.min(Math.abs(x - c.value), Math.abs(x - printed)) / Math.max(tol, (c.slack ?? 0) * Math.abs(c.value));
    if (d <= 1 && (!best || d < best.d)) best = { d, tol };
  }
  return best;
}

export type Detection = { reading: Reading; hits: Candidate[]; imprecise: boolean } | null;
/** Alle Deutungen, die zur Eingabe passen (die richtige zuerst). maxTol: gröbste zulässige Genauigkeit in der Einheit der Deutung. */
export function detect(input: string, cands: Candidate[], maxTol: number): Detection {
  const options = readEntries(input).map(reading => {
    const matched = cands.map(c => ({ c, m: compare(reading, c) })).filter(h => h.m !== null)
      .sort((a, b) => Number(b.c.id === 'ok') - Number(a.c.id === 'ok') || a.m!.d - b.m!.d);
    const first = matched[0];
    const tol = first ? first.m!.tol : cands[0]?.prob && (reading.percent || Math.abs(reading.x) > 1) ? reading.tol / 100 : reading.tol;
    const imprecise = tol > maxTol * (1 + 1e-6) + 1e-9;
    return { reading, hits: imprecise ? [] : matched.map(h => h.c), imprecise };
  });
  if (!options.length) return null;
  return options.find(o => o.hits[0]?.id === 'ok') ?? options.find(o => o.hits.length) ?? options[0];
}
export const isOk = (input: string, cands: Candidate[], maxTol: number) => detect(input, cands, maxTol)?.hits[0]?.id === 'ok';

const PRECISION = 'Trag die Zahl genauer ein – mit so vielen Nachkommastellen, wie R sie zeigt.';
/** Rückmeldung für ein Feld: Deutung, Genauigkeitshinweis oder „nicht gefunden“. */
export function checkField(input: string, cands: Candidate[], maxTol: number, notFound: string, label = ''): Note[] {
  if (!input.trim()) return [];
  const d = detect(input, cands, maxTol);
  const pre = label ? `${label}: ` : '';
  if (!d) return [{ tone: 'hint', text: `${pre}Das ist keine Zahl.` }];
  if (d.imprecise) return [{ tone: 'hint', text: `${pre}${PRECISION}` }];
  if (!d.hits.length) return [{ tone: 'warn', text: `${pre}${notFound}` }];
  const n = d.hits[0].note(d.reading);
  return [{ ...n, text: `${pre}${n.text}` }];
}

const f2 = (x: number) => de(x, 2), f1 = (x: number) => de(x, 1);
/** Chancen mit drei gültigen Stellen: 3,25 · 12,2 · 90,8 · 245 */
export const odds3 = (x: number) => de(x, Math.abs(x) < 10 ? 2 : Math.abs(x) < 100 ? 1 : 0);
const pct = (p: number) => `${de(100 * p, 1)} %`;
const signed = (x: number, digits = 1) => `${x > 0 ? '+' : ''}${de(x, digits)}`;
const entered = (r: Reading) => de(r.x, Math.max(0, Math.min(4, Math.round(-Math.log10(r.tol * 2)))));

/* ---------- Station 1: Modell nachrechnen ---------- */

export const OR_TOL = 0.005;
const OR_ORDER: (ModelId | 'b')[] = ['main', 'unweighted', 'nonvote', 'pe09', 'pa02a', 'dontknow', 'ineligible', 'allMissing', 'pflichtOnly', 'b'];
const OR_TEXT: Record<Exclude<ModelId | 'b', 'main'>, (r: Reading) => string> = {
  unweighted: () => 'Ungewichtet? Das ist Exp(B) ohne weights = wghtpew. Der ALLBUS hat Ostdeutsche absichtlich überrepräsentiert – der Sachverständige hat für Deutschland gewichtet.',
  nonvote: r => `Gegenrichtung: Hast du Nichtwahl als 1 kodiert – oder beide Skalen nicht umgepolt? Beides dreht alle Effekte um: 1/${entered(r)} ≈ ${f2(1 / r.x)}.`,
  pe09: () => 'pe09 läuft von „stimme voll zu“ (1) bis „stimme gar nicht zu“ (4). Ohne Umpolen heißt ein höherer Wert weniger Pflichtgefühl – deshalb liegt Exp(B) unter 1.',
  pa02a: () => 'pa02a läuft von „sehr stark“ (1) bis „überhaupt nicht“ (5). Ohne Umpolen dreht sich der Effekt des Interesses um.',
  dontknow: () => '„Weiß nicht“ als Nichtwahl gezählt? Wer bei pv01 „weiß nicht“ (−8) sagt, hat keine Absicht geäußert – der Code gehört zu NA (Sitzung 5).',
  ineligible: () => 'Nicht Wahlberechtigte (−50) als Nichtwählende gezählt? Wer nicht wählen darf, entscheidet sich nicht gegen das Wählen – −50 gehört zu NA.',
  allMissing: () => 'Alle fehlenden Angaben als Nichtwahl gezählt? Mit else=0 werden auch „weiß nicht“, „verweigert“ und „nicht wahlberechtigt“ zu 0. Setz else=NA.',
  pflichtOnly: () => 'Das ist das Modell nur mit dem Pflichtgefühl. Der Sachverständige hatte auch das politische Interesse im Modell.',
  b: () => 'Das ist B, der Logit-Koeffizient. Gesucht ist Exp(B) – die Spalte weiter rechts in summary().',
};

/** Deutungen für Exp(B) von Pflichtgefühl (term 1) oder Interesse (term 2). */
export function orCandidates(p: Prepared, term: 1 | 2): Candidate[] {
  const out: Candidate[] = [];
  for (const id of OR_ORDER) {
    if (id === 'b') { if (p.main) out.push(cand('b', p.main.coef[term], 'hint', OR_TEXT.b)); continue; }
    const fit = fitOf(p, id);
    if (!fit || term >= fit.coef.length) continue;
    out.push(id === 'main' ? cand('ok', fit.expB[term], 'ok', 'stimmt.') : cand(id, fit.expB[term], id === 'unweighted' || id === 'pflichtOnly' ? 'hint' : 'warn', OR_TEXT[id]));
  }
  return out;
}

export type OrEntry = { pflicht: string; interesse: string };
export function modelOk(p: Prepared, e: OrEntry): boolean {
  return Boolean(p.main) && isOk(e.pflicht, orCandidates(p, 1), OR_TOL) && isOk(e.interesse, orCandidates(p, 2), OR_TOL);
}

const OR_NOT_FOUND = 'Diesen Wert finde ich in keiner Variante. Prüfe: waehlen 1/0 aus pv01 mit else=NA, beide Skalen umgepolt, weights = wghtpew.';
/** Station 1: Beide Exp(B) zusammen verraten meist, welcher Weg gerechnet wurde; sonst Rückmeldung je Feld. */
export function checkModel(p: Prepared, e: OrEntry): Note[] {
  if (!p.main) return [];
  const cp = orCandidates(p, 1), ci = orCandidates(p, 2);
  const dp = e.pflicht.trim() ? detect(e.pflicht, cp, OR_TOL) : null, di = e.interesse.trim() ? detect(e.interesse, ci, OR_TOL) : null;
  if (dp?.hits.length && di?.hits.length) {
    const ids = new Set(di.hits.map(c => c.id));
    const common = dp.hits.map(c => c.id).filter(id => ids.has(id)).sort((a, b) => ord(a) - ord(b))[0];
    if (common === 'ok') {
      const own = p.main.expB[1];
      const expert = Math.abs(own - EXPERT_OR) <= 0.005
        ? `Die ${de(EXPERT_OR, 2)} auf der Folie des Sachverständigen ist bestätigt.`
        : `Auf der Folie stand ${de(EXPERT_OR, 2)} – deine Datei liefert einen anderen Wert. Übersetze mit deinem.`;
      return [{ tone: 'ok', text: `Stimmt: Exp(B) = ${entered(dp.reading)} für Pflichtgefühl und ${entered(di.reading)} für Interesse, gewichtet. ${expert}` }];
    }
    if (common) return [dp.hits.find(c => c.id === common)!.note(dp.reading)];
  }
  const other = ' Trag auch das andere Exp(B) ein – erst beide zusammen zeigen, dass du dasselbe Modell hast.';
  const field = (input: string, cands: Candidate[], label: string, otherEmpty: boolean) => checkField(input, cands, OR_TOL, OR_NOT_FOUND, label)
    .map(n => (n.tone === 'ok' && otherEmpty ? { ...n, text: n.text + other } : n));
  return [...field(e.pflicht, cp, 'Pflichtgefühl', !e.interesse.trim()), ...field(e.interesse, ci, 'Interesse', !e.pflicht.trim())];
}
const ord = (id: string) => { const i = OR_ORDER.indexOf(id === 'ok' ? 'main' : id as ModelId); return i < 0 ? 99 : i; };

/* ---------- Station 2: Jana von Hand ---------- */

export type Chain = { logit: string; odds: string; prob: string };
export const CHAIN_TOL = { logit: 0.005, odds: 0.05, prob: 0.005 } as const;
const RAW_TEXT = (p: Prepared, id: PersonId) => `Du hast die Originalcodes eingesetzt (pe09 = ${p.rawProfiles[id][0]}, pa02a = ${p.rawProfiles[id][1]}). Das Modell rechnet mit den umgepolten Skalen – welcher Wert wird daraus?`;

export function janaCandidates(p: Prepared): Record<keyof Chain, Candidate[]> {
  const m = p.main;
  if (!m) return { logit: [], odds: [], prob: [] };
  const x = p.profiles.jana, raw = p.rawProfiles.jana;
  const L = logitOf(m, x), O = Math.exp(L), P = linkinv(L);
  // von Hand mit den B-Werten, wie summary() sie druckt (drei Nachkommastellen)
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  const Lh = r3(m.coef[0]) + r3(m.coef[1]) * x[0] + r3(m.coef[2]) * x[1];
  // B schon auf zwei Stellen gerundet – der Logit weicht dann spürbar ab
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const L2 = r2(m.coef[0]) + r2(m.coef[1]) * x[0] + r2(m.coef[2]) * x[1];
  const early = 'B zu früh gerundet? Rechne mit drei Nachkommastellen, so wie summary() sie zeigt – sonst weicht der Logit schon merklich ab.';
  const Lraw = logitOf(m, raw), Lp = logitOf(m, [raw[0], x[1]]), Li = logitOf(m, [x[0], raw[1]]);
  const u = fitOf(p, 'unweighted'), Lu = u ? logitOf(u, x) : NaN;
  const rawText = RAW_TEXT(p, 'jana');
  const unw = 'Das stammt aus dem Modell ohne Gewicht. Rechne mit dem gewichteten Modell weiter.';
  return {
    logit: [
      cand('ok', L, 'ok', 'stimmt.'),
      cand('ok', Lh, 'ok', 'stimmt.'),
      cand('earlyRound', L2, 'hint', early),
      cand('rawCodes', Lraw, 'warn', rawText),
      cand('rawPflicht', Lp, 'warn', 'Beim Pflichtgefühl steht der Originalcode von pe09. Im Modell zählt der umgepolte Wert.'),
      cand('rawInteresse', Li, 'warn', 'Beim Interesse steht der Originalcode von pa02a. Im Modell zählt der umgepolte Wert.'),
      cand('noConst', L - m.coef[0], 'hint', 'Die Konstante fehlt: Logit = Konstante + B × Wert für jeden Prädiktor.'),
      cand('expB', m.coef[0] + m.expB[1] * x[0] + m.expB[2] * x[1], 'hint', 'Du hast Exp(B) eingesetzt. Im Logit stehen die B-Werte (Spalte B).'),
      cand('expBall', m.expB[0] + m.expB[1] * x[0] + m.expB[2] * x[1], 'hint', 'Du hast Exp(B) eingesetzt. Im Logit stehen die B-Werte (Spalte B), auch bei der Konstanten.'),
      cand('sign', -L, 'warn', 'Das Vorzeichen ist gedreht – das wäre der Logit der Nichtwahl.'),
      cand('unweighted', Lu, 'hint', unw),
      cand('isOdds', O, 'hint', 'Das ist schon die Chance, exp(Logit). Der Logit ist die Zahl davor: Konstante + B × Wert.'),
      cand('isProb', P, 'hint', 'Das ist schon die Wahrscheinlichkeit. Der Logit kommt zuerst: Konstante + B × Wert.'),
    ],
    odds: [
      slack(cand('ok', O, 'ok', 'stimmt.'), HAND_SLACK.odds),
      slack(cand('ok', Math.exp(Lh), 'ok', 'stimmt.'), HAND_SLACK.odds),
      cand('earlyRound', Math.exp(L2), 'hint', early),
      cand('isLogit', L, 'warn', 'Das ist der Logit. Die Chance ist exp(Logit).'),
      cand('isProb', P, 'warn', 'Das ist die Wahrscheinlichkeit. Chance = p / (1 − p).', true),
      cand('inverse', 1 / O, 'hint', 'Das ist die Chance, nicht zu wählen (1 geteilt durch Janas Chance).'),
      cand('rawCodes', Math.exp(Lraw), 'warn', rawText),
      cand('unweighted', Math.exp(Lu), 'hint', unw),
    ],
    prob: [
      slack(cand('ok', P, 'ok', 'stimmt.', true), HAND_SLACK.prob),
      slack(cand('ok', linkinv(Lh), 'ok', 'stimmt.', true), HAND_SLACK.prob),
      cand('earlyRound', linkinv(L2), 'hint', early, true),
      cand('isOdds', O, 'warn', 'Das ist die Chance, nicht die Wahrscheinlichkeit. Wahrscheinlichkeiten liegen zwischen 0 und 1 (0 bis 100 %): p = Chance / (1 + Chance).'),
      cand('isLogit', L, 'warn', 'Das ist der Logit. Erst exp(Logit) ergibt die Chance, dann p = Chance / (1 + Chance).'),
      cand('complement', 1 - P, 'warn', 'Das ist die Wahrscheinlichkeit, nicht zu wählen.', true),
      cand('logitAsOdds', L > 0 ? L / (1 + L) : NaN, 'warn', 'Du hast den Logit statt der Chance eingesetzt: p = Chance / (1 + Chance), mit Chance = exp(Logit).', true),
      cand('rawCodes', linkinv(Lraw), 'warn', rawText, true),
      cand('unweighted', linkinv(Lu), 'hint', unw, true),
    ],
  };
}

const CHAIN_NOT_FOUND = 'Diese Zahl finde ich auf keinem Weg. Logit = Konstante + B × Wert, Chance = exp(Logit), p = Chance / (1 + Chance).';
export function checkChain(p: Prepared, c: Chain): Note[] {
  const k = janaCandidates(p);
  return [
    ...checkField(c.logit, k.logit, CHAIN_TOL.logit, CHAIN_NOT_FOUND, 'Logit'),
    ...checkField(c.odds, k.odds, CHAIN_TOL.odds, CHAIN_NOT_FOUND, 'Chance'),
    ...checkField(c.prob, k.prob, CHAIN_TOL.prob, CHAIN_NOT_FOUND, 'Wahrscheinlichkeit'),
  ];
}
export const chainOk = (p: Prepared, c: Chain) => {
  const k = janaCandidates(p);
  return Boolean(p.main) && isOk(c.logit, k.logit, CHAIN_TOL.logit) && isOk(c.odds, k.odds, CHAIN_TOL.odds) && isOk(c.prob, k.prob, CHAIN_TOL.prob);
};
export const janaProbOk = (p: Prepared, input: string) => Boolean(p.main) && isOk(input, janaCandidates(p).prob, CHAIN_TOL.prob);

/* ---------- Station 3 und Sätze: regelbasierte Gegenfragen ---------- */

const MULTIPLIER = String.raw`(\d+([.,]\d+)?|zwei|drei|vier|fünf|doppelt)\s*-?\s*(mal|fach\w*)`;
export const TIMES_LIKELY = new RegExp(String.raw`${MULTIPLIER}\s+(so\s+)?(hohe\s+|große\s+)?wahrscheinlich|wahrscheinlich\w*\s+(\S+\s+){0,4}?${MULTIPLIER}|${MULTIPLIER}\s+(so\s+)?(oft|häufig\w*|öfter)`, 'i');
export const ODDS_WORDS = /(Chance|Odds|Wettquote|Verhältnis|\bzu\s*1\b)/i;
export const PROB_WORDS = /(Wahrscheinlichkeit|Prozentpunkt|Prozent|%|\bPp\b|von\s+100\b)/i;
export const LOGIT_WORDS = /\b(Logit\w*|log)\b/i;
export const CAUSAL_WORDS = /\b(bewirk\w*|verursach\w*|führ(t|en)\s+(dazu|zu)|sorg(t|en)|wirk(t|en)|Wirkung|weil|deshalb|dadurch)\b/i;
export const DETERMINISTIC = /\b(Jana|sie|er|Herr\s+Wiegand)\s+(wird|würde|geht)\s+(\w+\s+)?(wählen|zur\s+Wahl)/i;
/** Abgeschwächte Sätze („würde wahrscheinlich wählen“) sind keine deterministische Aussage. */
const HEDGE = /(wahrscheinlich|eher|vermutlich|vielleicht|möglicherweise|wohl|eventuell|tendenziell)/i;
const NEG_TOKEN = /^(nicht|kein\w*|nie|niemals)$/i;
/** Nach diesen Wörtern hebt sich die Verneinung auf oder gilt nicht der Behauptung („nicht bestreiten“, „kein Zufall“, „nicht nur … sondern“). */
const NEG_CANCEL = /^(bestreiten|abstreiten|leugnen|zu|nur|falsch|zufall|sicher)$/i;
const UNSURE = /(Ahnung|nicht\s+sicher|unsicher|weiß\s+(es\s+|ich\s+)?nicht|vielleicht|vermutlich|möglicherweise|eventuell|wohl|tendenziell|eher)/i;
const AGREE_LEAD = /^\W*(ja|genau|stimmt(?!\s+nicht))\b/i;
const BELIEVE_NOT = /\b(glaube|denke|meine|finde|heißt|bedeutet|ist)\s+(ich\s+|das\s+|es\s+)?nicht(\s+so)?\s*,?\s*dass\b/i;
const REJECT_AFTER = /\b(stimmt\s+nicht|(ist|wäre|sind)\s+(das\s+|es\s+)?falsch|(heißt|bedeutet)\s+(das|es)\s+nicht|nein)\b/i;
/** Die eingetippte Zahl ohne angehängte Einheit und ohne „×“ – für die Ratskarte, die die gewählte Einheit genau einmal anhängt. */
export const bareNumber = (input: string) => input.trim().replace(/\s*(Pp\.?|Prozentpunkte|Prozent|%|-?fach|x)$/i, '').replace(/^×\s*/, '').trim();
const words = (s: string) => s.match(/[\p{L}\d]+/gu) ?? [];
/** Lehnt der Satz die „x-mal so wahrscheinlich“-Lesart ab? Nur wenn eine Verneinung die Behauptung selbst regiert: höchstens zwei
 *  Wörter davor oder darin („nicht 3,77-mal“, „steigt nicht um das 3,77-fache“), „ich glaube nicht, dass …“ / „das heißt nicht, dass …“, oder gleich danach
 *  „stimmt nicht“ / „ist falsch“ / „heißt es nicht“. Kein Ablehnen: „Ja“/„Stimmt“ am Anfang, doppelte Verneinung, „sondern“,
 *  Unsicherheit („keine Ahnung“, „weiß nicht“, „vielleicht“). */
function rejectsTimes(text: string): boolean {
  const m = TIMES_LIKELY.exec(text);
  if (!m) return false;
  const before = text.slice(0, m.index), end = m.index + m[0].length;
  if (AGREE_LEAD.test(text) || UNSURE.test(before)) return false;
  const tokens = [...words(before).slice(-2), ...words(m[0])];
  const governs = tokens.some((t, i) => NEG_TOKEN.test(t) && !NEG_CANCEL.test(tokens[i + 1] ?? '') && !tokens.slice(i + 1).some(u => /^sondern$/i.test(u)));
  const after = text.slice(end, end + 25);
  return governs || BELIEVE_NOT.test(before) || (REJECT_AFTER.test(after) && !/falsch\s+ist\s+(das|es)\s+nicht|nicht\s+falsch/i.test(after));
}
const deterministic = (text: string) => { const m = DETERMINISTIC.exec(text); return Boolean(m) && !HEDGE.test(m![0]); };

/** Zahlen, die eine Gegenfrage nennen darf – nur solche, die die Person schon selbst richtig eingetragen hat. */
export type Known = { or: number | null; pJana: number | null };
export function known(p: Prepared, s: { or: OrEntry; jana: Chain }): Known {
  return { or: p.main && modelOk(p, s.or) ? p.main.expB[1] : null, pJana: p.main && janaProbOk(p, s.jana.prob) ? linkinv(logitOf(p.main, p.profiles.jana)) : null };
}

export function answerNotes(text: string, k: Known): Note[] {
  if (!text.trim()) return [];
  const notes: Note[] = [];
  const times = TIMES_LIKELY.test(text), rejected = times && rejectsTimes(text);
  const probe = k.or !== null && k.pJana !== null ? `${pct(k.pJana)} × ${f2(k.or)} = ${de(100 * k.pJana * k.or, 0)} %` : null;
  if (rejected) notes.push({ tone: 'ok', text: probe
    ? `Richtig abgelehnt – die Probe an Jana zeigt, warum: ${probe}. Exp(B) vervielfacht die Chance (wählen : nicht wählen), nicht die Wahrscheinlichkeit.`
    : 'Richtig abgelehnt. Exp(B) vervielfacht die Chance (wählen : nicht wählen), nicht die Wahrscheinlichkeit – die Probe an Jana (ihre Wahrscheinlichkeit mal Exp(B)) zeigt, warum.' });
  else if (times) notes.push({ tone: 'warn', text: probe
    ? `Probier es an Jana: ${probe} – geht das? Exp(B) vervielfacht die Chance (wählen : nicht wählen), nicht die Wahrscheinlichkeit.`
    : 'Probier es an Jana aus: Nimm ihre Wahrscheinlichkeit aus Station 2 mal Exp(B) – was kommt heraus? Exp(B) vervielfacht die Chance (wählen : nicht wählen), nicht die Wahrscheinlichkeit.' });
  else if (ODDS_WORDS.test(text)) notes.push({ tone: 'ok', text: 'Du sprichst von Chancen – genau darauf bezieht sich Exp(B): Je Stufe Pflichtgefühl wird die Chance (wählen : nicht wählen) mit Exp(B) multipliziert.' });
  if (CAUSAL_WORDS.test(text)) notes.push({ tone: 'hint', text: 'Du schreibst von einer Wirkung. Das Modell vergleicht Menschen mit mehr und weniger Pflichtgefühl – was eine Kampagne bewirkt, zeigt es nicht (Sitzung 10). Wie klingt dein Satz als Vergleich?' });
  if (deterministic(text)) notes.push({ tone: 'hint', text: k.pJana !== null
    ? `Das Modell sagt nichts über Jana persönlich: Von 100 Menschen, die so antworten wie Jana, würden etwa ${de(100 * k.pJana, 0)} wählen gehen.`
    : 'Das Modell sagt nichts über Jana persönlich, sondern über Menschen wie sie: Von 100 Menschen, die so antworten wie Jana, …' });
  if (!notes.length) notes.push({ tone: 'hint', text: 'Gegenprobe: Gilt dein Satz auch für Herrn Wiegand? Station 4 zeigt es.' });
  return notes;
}

/* ---------- Station 4: eine Stufe mehr – in Chancen und in Wahrscheinlichkeiten ---------- */

export const CELLS = ['janaUp', 'wiegand', 'wiegandUp'] as const;
export type Cell = typeof CELLS[number];
export type Cells = Record<Cell, string>;
export const CELL_TOL = { odds: 0.05, prob: 0.005 } as const;
const cellPerson = (c: Cell): [PersonId, 0 | 1] => (c === 'janaUp' ? ['jana', 1] : c === 'wiegand' ? ['wiegand', 0] : ['wiegand', 1]);

export function cellCandidates(p: Prepared, cell: Cell, lang: 'odds' | 'prob'): Candidate[] {
  const m = p.main;
  if (!m) return [];
  const [person, level] = cellPerson(cell);
  const n = personNumbers(m, p.profiles[person]);
  const u = fitOf(p, 'unweighted'), nu = u ? personNumbers(u, p.profiles[person]) : null;
  const raw = level === 0 ? logitOf(m, p.rawProfiles[person]) : NaN;
  const other = level === 1 ? 0 : 1;
  const ame = p.ame[0] ?? NaN;
  const unw = 'Das stammt aus dem Modell ohne Gewicht.';
  const swap = level === 1 ? 'Das ist der Wert ohne die Stufe mehr.' : 'Das ist schon der Wert mit einer Stufe mehr.';
  if (lang === 'odds') return [
    slack(cand('ok', n.odds[level], 'ok', 'stimmt.'), HAND_SLACK.odds),
    cand('additive', level === 1 ? n.odds[0] + m.expB[1] : NaN, 'warn', 'Exp(B) ist ein Faktor: Chance × Exp(B), nicht Chance + Exp(B).'),
    cand('isProb', n.prob[level], 'warn', 'Das ist die Wahrscheinlichkeit; gefragt ist die Chance p / (1 − p).', true),
    cand('isLogit', n.logit[level], 'warn', 'Das ist der Logit; die Chance ist exp(Logit).'),
    cand('inverse', 1 / n.odds[level], 'hint', 'Das ist die Chance, nicht zu wählen.'),
    cand('rawCodes', Math.exp(raw), 'warn', RAW_TEXT(p, person)),
    cand('swap', n.odds[other], 'hint', swap),
    cand('unweighted', nu ? nu.odds[level] : NaN, 'hint', unw),
  ];
  return [
    slack(cand('ok', n.prob[level], 'ok', 'stimmt.', true), HAND_SLACK.prob),
    cand('isOdds', n.odds[level], 'warn', 'Das ist die Chance, nicht die Wahrscheinlichkeit: p = Chance / (1 + Chance).'),
    cand('timesLikely', level === 1 ? n.prob[0] * m.expB[1] : NaN, 'warn', 'Das ist die Wahrscheinlichkeit ohne die Stufe mal Exp(B). Exp(B) vervielfacht die Chance, nicht die Wahrscheinlichkeit – Wahrscheinlichkeiten können nicht über 100 % steigen.', true),
    cand('plusAme', level === 1 ? n.prob[0] + ame : NaN, 'hint', 'Das ist die Wahrscheinlichkeit ohne die Stufe plus der durchschnittliche marginale Effekt – linear gedacht. Auf der S-Kurve ist der Schritt je nach Ausgangslage größer oder kleiner.', true),
    cand('complement', 1 - n.prob[level], 'warn', 'Das ist die Wahrscheinlichkeit, nicht zu wählen.', true),
    cand('isLogit', n.logit[level], 'warn', 'Das ist der Logit, keine Wahrscheinlichkeit.'),
    cand('rawCodes', linkinv(raw), 'warn', RAW_TEXT(p, person), true),
    cand('swap', n.prob[other], 'hint', swap, true),
    cand('unweighted', nu ? nu.prob[level] : NaN, 'hint', unw, true),
  ];
}

export const CELL_LABELS: Record<Cell, string> = { janaUp: 'Jana, eine Stufe mehr', wiegand: 'Herr Wiegand', wiegandUp: 'Herr Wiegand, eine Stufe mehr' };
const CELL_NOT_FOUND = { odds: 'Diese Chance finde ich nicht. Eine Stufe mehr: Chance × Exp(B); Herr Wiegand: erst Logit, dann exp().', prob: 'Diese Wahrscheinlichkeit finde ich nicht. predict(modell, newdata = profile, type = "response") liefert sie.' };
export function checkCells(p: Prepared, cells: Cells, lang: 'odds' | 'prob'): Note[] {
  return CELLS.flatMap(c => checkField(cells[c], cellCandidates(p, c, lang), CELL_TOL[lang], CELL_NOT_FOUND[lang], CELL_LABELS[c]));
}
export const cellsOk = (p: Prepared, cells: Cells, lang: 'odds' | 'prob') =>
  Boolean(p.main) && CELLS.every(c => isOk(cells[c], cellCandidates(p, c, lang), CELL_TOL[lang]));

/* ---------- Die Dolmetscher-Tafel (Enthüllung nach Frage 3) ---------- */

export type TafelRow = PersonNumbers & { person: PersonId; risk: [number, number] };
export function tafel(p: Prepared): TafelRow[] {
  if (!p.main) return [];
  return (['jana', 'wiegand'] as PersonId[]).map(person => {
    const n = personNumbers(p.main!, p.profiles[person]);
    return { person, ...n, risk: [1 - n.prob[0], 1 - n.prob[1]] };
  });
}
const relRisk = (r: TafelRow) => (r.risk[1] - r.risk[0]) / r.risk[0];

export type Lang = 'odds' | 'prob' | 'logit';
export function languages(text: string): Lang[] {
  const out: Lang[] = [];
  if (ODDS_WORDS.test(text)) out.push('odds');
  if (PROB_WORDS.test(text)) out.push('prob');
  if (LOGIT_WORDS.test(text)) out.push('logit');
  return out;
}
export const LANG_LABELS: Record<Lang, string> = { odds: 'Chancen', prob: 'Wahrscheinlichkeiten', logit: 'Logits' };

/** Die Antwort in allen drei Sprachen – mit Zahlen, weil die Tafel erst nach den eigenen richtigen Werten erscheint. */
export function tafelSentences(p: Prepared): Record<Lang | 'risk', string> {
  const [j, w] = tafel(p);
  const dp = (r: TafelRow) => 100 * (r.prob[1] - r.prob[0]);
  return {
    prob: `In Wahrscheinlichkeiten gewinnt Jana mehr: ${signed(dp(j))} gegenüber ${signed(dp(w))} Prozentpunkten (${pct(j.prob[0])} → ${pct(j.prob[1])}; ${pct(w.prob[0])} → ${pct(w.prob[1])}).`,
    odds: `In Chancen gewinnen beide gleich: Beide Chancen werden mit ${f2(p.main!.expB[1])} multipliziert (Jana ${odds3(j.odds[0])} → ${odds3(j.odds[1])}, Herr Wiegand ${odds3(w.odds[0])} → ${odds3(w.odds[1])}).`,
    logit: `Im Logit gewinnen beide gleich viel: ${signed(p.main!.coef[1], 2)} (Jana ${f2(j.logit[0])} → ${f2(j.logit[1])}, Herr Wiegand ${f2(w.logit[0])} → ${f2(w.logit[1])}).`,
    risk: `Im Nichtwahl-Risiko sinkt es relativ bei beiden stark: Jana ${pct(j.risk[0])} → ${pct(j.risk[1])} (${signed(100 * relRisk(j), 0)} %), Herr Wiegand ${pct(w.risk[0])} → ${pct(w.risk[1])} (${signed(100 * relRisk(w), 0)} %).`,
  };
}

const CAMPAIGN_NOTES: Record<CampaignAnswer, string> = {
  jana: 'Du sagst „bei Jana“ – das stimmt in Wahrscheinlichkeiten (Prozentpunkten).',
  wiegand: 'Du sagst „bei Herrn Wiegand“ – das stimmt höchstens, wenn man das Nichtwahl-Risiko relativ betrachtet. In Prozentpunkten gewinnt er weniger.',
  same: 'Du sagst „bei beiden gleich“ – das stimmt in Chancen und Logits.',
  depends: 'Genau: Die Antwort hängt an der Sprache. Zwei Spalten der Tafel sagen „gleich“, eine sagt „bei Jana viel mehr“.',
};

export function tafelNotes(p: Prepared, campaign: CampaignAnswer | '', answer: string): Note[] {
  if (!p.main) return [];
  const langs = languages(answer), s = tafelSentences(p);
  const notes: Note[] = [];
  if (campaign) notes.push({ tone: campaign === 'depends' ? 'ok' : 'hint', text: CAMPAIGN_NOTES[campaign] });
  notes.push({ tone: 'hint', text: langs.length
    ? `Deine Antwort spricht ${langs.map(l => LANG_LABELS[l]).join(' und ')}. Die anderen Sprachen: ${(['odds', 'prob', 'logit'] as Lang[]).filter(l => !langs.includes(l)).map(l => s[l]).join(' ')}`
    : `Ich erkenne nicht, in welcher Sprache du antwortest. Alle drei: ${s.odds} ${s.prob} ${s.logit}` });
  if (CAUSAL_WORDS.test(answer)) notes.push({ tone: 'hint', text: 'Vorsicht mit „bewirkt“: Das Modell vergleicht Menschen, die sich im Pflichtgefühl unterscheiden. Ob eine Kampagne Pflichtgefühl erzeugt und damit Menschen an die Urne bringt, zeigt es nicht (Sitzung 10).' });
  return notes;
}

/* ---------- Station 5: AME und die eine Zahl ---------- */

export const AME_TOL = 0.0005;
export function ameCandidates(p: Prepared): Candidate[] {
  const m = p.main;
  if (!m) return [];
  return [
    cand('ok', p.ame[0], 'ok', r => `Stimmt: Im Mittel über alle Befragten steigt die Wahrscheinlichkeit je Stufe Pflichtgefühl um ${de(100 * (r.percent || Math.abs(r.x) > 1 ? r.x / 100 : r.x), 1)} Prozentpunkte.`, true),
    cand('interesse', p.ame[1], 'warn', 'Das ist der AME des politischen Interesses. Der Rat fragt nach dem Pflichtgefühl.', true),
    cand('unweighted', p.ameUnweighted[0], 'hint', 'Das ist der AME aus dem Modell ohne Gewicht.', true),
    cand('b', m.coef[1], 'warn', 'Das ist B, nicht der AME. marginal_effects() rechnet in Wahrscheinlichkeiten.'),
    cand('or', m.expB[1], 'warn', 'Das ist Exp(B), nicht der AME. marginal_effects() rechnet in Wahrscheinlichkeiten.'),
  ];
}
export const checkAme = (p: Prepared, input: string) =>
  checkField(input, ameCandidates(p), AME_TOL, 'Diesen AME finde ich nicht. modell %>% marginal_effects() zeigt ihn in der Spalte AME.');

export type ReportKind = 'or' | 'orPct' | 'b' | 'ame' | 'amePp' | 'jana' | 'janaShare' | 'wiegand' | 'wiegandShare' | 'invOr'
  | 'riskJana' | 'riskWiegand' | 'orInt' | 'ameInt' | 'ameIntPp' | 'hit' | 'level' | 'levelPct';
type ReportCandidate = { kind: ReportKind; value: number; units: Unit[]; abs?: boolean };
export const KIND_LABELS: Record<ReportKind, string> = {
  or: 'Exp(B), das Chancenverhältnis', orPct: 'Exp(B) als Prozent-Zuwachs der Chance', b: 'B, der Logit-Koeffizient',
  ame: 'der durchschnittliche marginale Effekt (AME)', amePp: 'der durchschnittliche marginale Effekt (AME)',
  jana: 'Janas Zuwachs in Prozentpunkten', janaShare: 'Janas Zuwachs als Anteil', wiegand: 'Herrn Wiegands Zuwachs in Prozentpunkten', wiegandShare: 'Herrn Wiegands Zuwachs als Anteil',
  invOr: 'der Kehrwert von Exp(B)', riskJana: 'Janas relativer Rückgang des Nichtwahl-Risikos', riskWiegand: 'Herrn Wiegands relativer Rückgang des Nichtwahl-Risikos',
  orInt: 'Exp(B) des politischen Interesses', ameInt: 'der AME des politischen Interesses', ameIntPp: 'der AME des politischen Interesses',
  hit: 'die Trefferquote des Modells', level: 'eine Wahrscheinlichkeit', levelPct: 'eine Wahrscheinlichkeit',
};

/** Kurzname der Größe für die Ratskarte. */
export const KIND_SHORT: Record<ReportKind, string> = {
  or: 'Exp(B)', orPct: 'Exp(B) als Prozent', b: 'B (Logit)', ame: 'AME', amePp: 'AME', jana: 'Jana', janaShare: 'Jana', wiegand: 'Herr Wiegand', wiegandShare: 'Herr Wiegand',
  invOr: '1/Exp(B)', riskJana: 'Nichtwahl-Risiko Jana', riskWiegand: 'Nichtwahl-Risiko Herr Wiegand', orInt: 'Exp(B) Interesse', ameInt: 'AME Interesse', ameIntPp: 'AME Interesse',
  hit: 'Trefferquote', level: 'Wahrscheinlichkeit', levelPct: 'Wahrscheinlichkeit',
};

export function reportCandidates(p: Prepared): ReportCandidate[] {
  const m = p.main;
  if (!m) return [];
  const [j, w] = tafel(p);
  const levels = [...j.prob, ...w.prob];
  return [
    { kind: 'or', value: m.expB[1], units: ['times', 'none'] },
    { kind: 'orPct', value: 100 * (m.expB[1] - 1), units: ['pct'] },
    { kind: 'b', value: m.coef[1], units: ['logit', 'none'] },
    { kind: 'ame', value: p.ame[0], units: ['none'] },
    { kind: 'amePp', value: 100 * p.ame[0], units: ['pp', 'pct'] },
    { kind: 'jana', value: 100 * (j.prob[1] - j.prob[0]), units: ['pp', 'pct'] },
    { kind: 'janaShare', value: j.prob[1] - j.prob[0], units: ['none'] },
    { kind: 'wiegand', value: 100 * (w.prob[1] - w.prob[0]), units: ['pp', 'pct'] },
    { kind: 'wiegandShare', value: w.prob[1] - w.prob[0], units: ['none'] },
    { kind: 'invOr', value: 1 / m.expB[1], units: ['times', 'none'] },
    { kind: 'riskJana', value: 100 * Math.abs(relRisk(j)), units: ['pct'], abs: true },
    { kind: 'riskWiegand', value: 100 * Math.abs(relRisk(w)), units: ['pct'], abs: true },
    { kind: 'orInt', value: m.expB[2], units: ['times', 'none'] },
    { kind: 'ameInt', value: p.ame[1], units: ['none'] },
    { kind: 'ameIntPp', value: 100 * p.ame[1], units: ['pp', 'pct'] },
    { kind: 'hit', value: m.classification.overall, units: ['pct'] },
    ...levels.map(v => ({ kind: 'levelPct' as const, value: 100 * v, units: ['pct'] as Unit[] })),
    ...levels.map(v => ({ kind: 'level' as const, value: v, units: ['none'] as Unit[] })),
  ];
}

/** Größen der Ratsmitglieder: Sie werden erst erkannt, wenn die Dolmetscher-Tafel offen ist – sonst wäre das Feld ein Orakel für Station 2 und 4. */
const BOARD_KINDS: ReportKind[] = ['jana', 'janaShare', 'wiegand', 'wiegandShare', 'riskJana', 'riskWiegand', 'level', 'levelPct'];
/** Größenabgleich: Welche Größe steckt hinter der Berichtszahl? Die Einheit entscheidet bei Gleichstand. */
export function recogniseReport(p: Prepared, input: string, unit: Unit | '', revealed = false): { kind: ReportKind; reading: Reading } | null {
  const cands = reportCandidates(p).filter(c => revealed || !BOARD_KINDS.includes(c.kind));
  for (const r of readEntries(input)) {
    const hits = cands.map(c => ({ c, d: Math.abs((c.abs ? Math.abs(r.x) : r.x) - c.value) / r.tol })).filter(h => h.d <= 1);
    hits.sort((a, b) => Number(unit !== '' && b.c.units.includes(unit)) - Number(unit !== '' && a.c.units.includes(unit)) || a.d - b.d);
    if (hits[0]) return { kind: hits[0].c.kind, reading: r };
  }
  return null;
}

const UNIT_HINTS: Partial<Record<ReportKind, Partial<Record<Unit, (r: Reading) => string>>>> = {
  amePp: { pct: r => `Prozent oder Prozentpunkte? Die Wahrscheinlichkeit steigt im Mittel um ${entered(r)} Prozentpunkte (eine Differenz von Prozentwerten), nicht um ${entered(r)} Prozent.` },
  jana: { pct: r => `Prozent oder Prozentpunkte? Janas Wahrscheinlichkeit steigt um ${entered(r)} Prozentpunkte, nicht um ${entered(r)} Prozent.` },
  wiegand: { pct: r => `Prozent oder Prozentpunkte? Herrn Wiegands Wahrscheinlichkeit steigt um ${entered(r)} Prozentpunkte, nicht um ${entered(r)} Prozent.` },
  ame: { pp: r => `${entered(r)} Prozentpunkte wären winzig – ${entered(r)} ist ein Anteil, in Prozentpunkten also ${de(100 * r.x, 1)}.` },
  janaShare: { pp: r => `${entered(r)} ist ein Anteil – in Prozentpunkten ${de(100 * r.x, 1)}.` },
  wiegandShare: { pp: r => `${entered(r)} ist ein Anteil – in Prozentpunkten ${de(100 * r.x, 1)}.` },
  riskJana: { pp: () => 'Das Nichtwahl-Risiko sinkt relativ – das sind Prozent, keine Prozentpunkte.' },
  riskWiegand: { pp: () => 'Das Nichtwahl-Risiko sinkt relativ – das sind Prozent, keine Prozentpunkte.' },
};
const factorHint = (r: Reading) => `Exp(B) ist ein Faktor für die Chance, keine Differenz. Als Prozent hieße es: Die Chance steigt um ${de(100 * (r.x - 1), 0)} %.`;
for (const k of ['or', 'orInt'] as const) UNIT_HINTS[k] = { pp: factorHint, pct: factorHint };
UNIT_HINTS.b = { pp: () => 'B ist in Logit-Einheiten, nicht in Prozentpunkten.', pct: () => 'B ist in Logit-Einheiten, nicht in Prozent.', times: () => 'B ist kein Faktor – der Faktor ist Exp(B).' };

/** Was die Zahl zeigt und was sie verschweigt. Zahlen der Ratsmitglieder erst, wenn die Tafel offen ist. */
function showsHides(p: Prepared, kind: ReportKind, r: Reading, revealed: boolean): Note {
  const [j, w] = tafel(p);
  const dj = de(100 * (j.prob[1] - j.prob[0]), 1), dw = de(100 * (w.prob[1] - w.prob[0]), 1);
  const both = revealed ? ` – für Menschen wie Jana ${dj}, wie Herrn Wiegand ${dw} Prozentpunkte` : '';
  const texts: Record<ReportKind, [Note['tone'], string]> = {
    or: ['ok', `Zeigt: eine Zahl, die für alle gilt – die Chance (wählen : nicht wählen) ist bei einer Stufe mehr Pflichtgefühl ${entered(r)}-mal so groß. Verschweigt: wie viel das an Wahrscheinlichkeit bringt; in der Zeitung wird daraus schnell „${entered(r)}-mal so wahrscheinlich“.`],
    orPct: ['ok', `Zeigt: Die Chance steigt je Stufe um ${entered(r)} % – für alle gleich. Verschweigt: wie viel das an Wahrscheinlichkeit bringt; „${entered(r)} %“ klingt nach viel mehr, als es für Menschen wie Herrn Wiegand ist.`],
    b: ['ok', 'Zeigt: Richtung und Stärke auf der Logit-Skala, für alle gleich. Verschweigt: Kaum jemand im Rat kann Logits lesen.'],
    ame: ['ok', `Zeigt: Im Durchschnitt über alle Befragten steigt die Wahrscheinlichkeit je Stufe um ${de(100 * r.x, 1)} Prozentpunkte. Verschweigt: dass es für einzelne Menschen sehr verschieden ist${both}.`],
    amePp: ['ok', `Zeigt: Im Durchschnitt über alle Befragten steigt die Wahrscheinlichkeit je Stufe um ${entered(r)} Prozentpunkte. Verschweigt: dass es für einzelne Menschen sehr verschieden ist${both}.`],
    jana: ['ok', 'Zeigt: ehrlich für Menschen wie Jana. Verschweigt: Für Menschen, die ohnehin fast sicher wählen, bringt dieselbe Stufe viel weniger.'],
    janaShare: ['ok', 'Zeigt: ehrlich für Menschen wie Jana. Verschweigt: Für Menschen, die ohnehin fast sicher wählen, bringt dieselbe Stufe viel weniger.'],
    wiegand: ['ok', 'Zeigt: ehrlich für Menschen wie Herrn Wiegand. Verschweigt: Für Menschen mit wenig Pflichtgefühl und Interesse bringt dieselbe Stufe viel mehr.'],
    wiegandShare: ['ok', 'Zeigt: ehrlich für Menschen wie Herrn Wiegand. Verschweigt: Für Menschen mit wenig Pflichtgefühl und Interesse bringt dieselbe Stufe viel mehr.'],
    invOr: ['ok', 'Zeigt: Die Chance der Nichtwahl schrumpft je Stufe auf diesen Bruchteil – dieselbe Information wie Exp(B), von der anderen Seite. Verschweigt: wie viel das an Wahrscheinlichkeit bringt; für Laien schwer zu lesen.'],
    riskJana: ['ok', `Zeigt: Das Nichtwahl-Risiko sinkt für Menschen wie Jana relativ um ${entered(r)} %. Verschweigt: Ein relativer Wert klingt groß, auch wenn das Risiko schon klein ist.`],
    riskWiegand: ['ok', `Zeigt: Das Nichtwahl-Risiko sinkt für Menschen wie Herrn Wiegand relativ um ${entered(r)} %. Verschweigt: Sein Risiko war schon vorher klein – in Prozentpunkten ist es wenig.`],
    orInt: ['warn', 'Das ist die Zahl für politisches Interesse. Der Rat fragt nach dem Pflichtgefühl.'],
    ameInt: ['warn', 'Das ist die Zahl für politisches Interesse. Der Rat fragt nach dem Pflichtgefühl.'],
    ameIntPp: ['warn', 'Das ist die Zahl für politisches Interesse. Der Rat fragt nach dem Pflichtgefühl.'],
    hit: ['warn', 'Das ist die Trefferquote des Modells. Sie sagt nichts darüber, wie stark das Pflichtgefühl mit der Wahlabsicht zusammenhängt.'],
    level: ['warn', 'Das ist eine Wahrscheinlichkeit, kein Effekt: Sie sagt, wie wahrscheinlich jemand wählt, nicht, was eine Stufe mehr Pflichtgefühl ändert.'],
    levelPct: ['warn', 'Das ist eine Wahrscheinlichkeit, kein Effekt: Sie sagt, wie wahrscheinlich jemand wählt, nicht, was eine Stufe mehr Pflichtgefühl ändert.'],
  };
  const [tone, text] = texts[kind];
  return { tone, text };
}

export function checkReport(p: Prepared, number: string, unit: Unit | '', revealed: boolean): Note[] {
  if (!p.main || !number.trim()) return [];
  const hit = recogniseReport(p, number, unit, revealed);
  const later = revealed ? '' : ' Zahlen zu Jana und Herrn Wiegand ordne ich erst ein, wenn die Dolmetscher-Tafel offen ist (Station 4).';
  if (!hit) return [{ tone: 'warn', text: readEntry(number) ? `Diese Zahl erkenne ich nicht. Nimm eine Zahl aus deinem Modell, aus marginal_effects() oder von deiner Tafel.${later}` : 'Das ist keine Zahl.' }];
  const notes: Note[] = [{ tone: 'hint', text: `Das ist ${KIND_LABELS[hit.kind]}.` }, showsHides(p, hit.kind, hit.reading, revealed)];
  const unitHint = unit ? UNIT_HINTS[hit.kind]?.[unit]?.(hit.reading) : undefined;
  if (!unit) notes.push({ tone: 'hint', text: 'Wähl eine Einheit – ohne Einheit versteht der Rat die Zahl nicht.' });
  else if (unitHint) notes.push({ tone: 'warn', text: unitHint });
  return notes;
}

export function sentenceNotes(text: string, unit: Unit | '', k: Known): Note[] {
  if (!text.trim()) return [];
  const notes = answerNotes(text, k).filter(n => !n.text.startsWith('Gegenprobe'));
  if (unit === 'pp' && /Prozent(?!punkt)/i.test(text)) notes.push({ tone: 'hint', text: 'Im Satz steht „Prozent“ – gemeint sind Prozentpunkte?' });
  return notes;
}

/* ---------- Station 6 (Zusatz): Trefferquote gegen Likelihood ---------- */

export type LikelihoodEntry = { hitModel: string; hitAll: string; nullLL: string; modelLL: string; sentence: string };
export const LL_TOL = { hit: 0.0005, ll: 0.5 } as const;
export function likelihoodCandidates(p: Prepared): Record<'hitModel' | 'hitAll' | 'nullLL' | 'modelLL', Candidate[]> {
  const m = p.main, u = fitOf(p, 'unweighted');
  if (!m) return { hitModel: [], hitAll: [], nullLL: [], modelLL: [] };
  const c = m.classification;
  const all = c.n1 / (c.n0 + c.n1), allRounded = Math.round(c.n1) / (Math.round(c.n0) + Math.round(c.n1));
  const unw = 'Das stammt aus dem Modell ohne Gewicht.';
  return {
    hitModel: [
      cand('ok', c.overall / 100, 'ok', 'stimmt.', true),
      cand('unweighted', u ? u.classification.overall / 100 : NaN, 'hint', unw, true),
      cand('pct1', c.pct1 / 100, 'warn', 'Das ist die Trefferquote nur bei den Wählenden. Gesucht ist „Overall Percentage“.', true),
      cand('pct0', c.pct0 / 100, 'warn', 'Das ist die Quote bei den Nichtwählenden – gesucht ist „Overall Percentage“.', true),
      cand('all', all, 'hint', 'Das ist die Quote der Regel „alle wählen“ – sie gehört ins zweite Feld.', true),
    ],
    hitAll: [
      cand('ok', allRounded, 'ok', 'stimmt.', true),
      cand('ok', all, 'ok', 'stimmt.', true),
      ...p.crosstabShare.map(v => cand('ok', v, 'ok', 'stimmt – aus der Kreuztabelle, mit etwas anderer Fallbasis als das Modell.', true)),
      cand('complement', 1 - all, 'warn', 'Das ist der Anteil der Nichtwählenden. Die Regel „alle wählen“ liegt bei allen anderen richtig.', true),
      cand('model', c.overall / 100, 'hint', 'Das ist die Trefferquote des Modells – sie gehört ins erste Feld.', true),
      cand('unweighted', u ? u.classification.n1 / (u.classification.n0 + u.classification.n1) : NaN, 'hint', unw, true),
    ],
    nullLL: [
      cand('ok', m.minus2LLNull, 'ok', 'stimmt.'),
      cand('model', m.minus2LL, 'warn', 'Das ist die −2LL deines Modells. Das Nullmodell hat nur die Konstante (modell$null.deviance).'),
      cand('chi2', m.omnibus.chi2, 'hint', 'Das ist die Differenz der beiden −2LL (Omnibus-Chi-Quadrat).'),
      cand('unweighted', u ? u.minus2LLNull : NaN, 'hint', unw),
    ],
    modelLL: [
      cand('ok', m.minus2LL, 'ok', 'stimmt.'),
      cand('null', m.minus2LLNull, 'warn', 'Das ist die −2LL des Nullmodells, gesucht ist die deines Modells.'),
      cand('chi2', m.omnibus.chi2, 'hint', 'Das ist die Differenz der beiden −2LL (Omnibus-Chi-Quadrat).'),
      cand('unweighted', u ? u.minus2LL : NaN, 'hint', unw),
    ],
  };
}

const LL_FIELDS = [['hitModel', 'Trefferquote des Modells', 'hit'], ['hitAll', 'Regel „alle wählen“', 'hit'], ['nullLL', '−2LL Nullmodell', 'll'], ['modelLL', '−2LL Modell', 'll']] as const;
export function checkLikelihood(p: Prepared, e: LikelihoodEntry): Note[] {
  const k = likelihoodCandidates(p);
  return LL_FIELDS.flatMap(([f, label, tol]) => checkField(e[f], k[f], LL_TOL[tol], 'Diesen Wert finde ich nicht. Schau in summary(modell): Classification Table und −2 Log Likelihood.', label));
}
export const likelihoodOk = (p: Prepared, e: LikelihoodEntry) => {
  const k = likelihoodCandidates(p);
  return Boolean(p.main) && LL_FIELDS.every(([f, , tol]) => isOk(e[f], k[f], LL_TOL[tol]));
};

/** Enthüllung der Likelihood-Station (erst nach vier richtigen Einträgen). */
export function likelihoodReveal(p: Prepared): string[] {
  const m = p.main!, c = m.classification;
  const all = 100 * c.n1 / (c.n0 + c.n1), r1 = (x: number) => Math.round(10 * x) / 10;
  return [
    `Trefferquote: Modell ${f1(c.overall)} % gegen ${f1(all)} % für die Regel „alle wählen“ (${signed(r1(c.overall) - r1(all))} Prozentpunkte). Von ${de(c.n0, 0)} Nichtwählenden erkennt das Modell ${de(c.correct0, 0)} (${f1(c.pct0)} %).`,
    `−2LL sinkt dagegen von ${f1(m.minus2LLNull)} auf ${f1(m.minus2LL)} (${signed(-100 * m.mcfadden, 0)} %, McFadden-R² = ${de(m.mcfadden, 3)}).`,
    'Die Likelihood misst, wie wahrscheinlich das Modell die tatsächlich beobachteten Antworten macht – nicht, wie oft es mit der Schwelle 0,5 richtig liegt. Wenn fast alle wählen wollen, liegt schon die Regel „alle wählen“ fast immer richtig.',
  ];
}

/* ---------- Zustand, Status, Ratskarte ---------- */

export type S10State = {
  mode: WorkMode;
  or: OrEntry;
  jana: Chain;
  answer1: string;
  odds: Cells;
  prob: Cells;
  campaign: CampaignAnswer | '';
  answer3: string;
  joint: string;
  ame: string;
  report: { number: string; unit: Unit | ''; sentence: string };
  likelihood: LikelihoodEntry;
};

const emptyCells = (): Cells => ({ janaUp: '', wiegand: '', wiegandUp: '' });
export const initialS10 = (): S10State => ({
  mode: 'solo', or: { pflicht: '', interesse: '' }, jana: { logit: '', odds: '', prob: '' }, answer1: '',
  odds: emptyCells(), prob: emptyCells(), campaign: '', answer3: '', joint: '', ame: '',
  report: { number: '', unit: '', sentence: '' }, likelihood: { hitModel: '', hitAll: '', nullLL: '', modelLL: '', sentence: '' },
});

const CAMPAIGN_IDS = CAMPAIGN_ANSWERS.map(a => a.id);
const UNIT_IDS = UNITS.map(u => u.id);
/** Höchstlänge eines Zahlenfelds – lang genug für „+22,2 Prozentpunkte“. */
export const NUMBER_MAX = 24;
const num = (x: unknown) => str(x, NUMBER_MAX);
export function parseS10(raw: unknown): S10State {
  const r = record(raw), or = record(r.or), jana = record(r.jana), odds = record(r.odds), prob = record(r.prob), rep = record(r.report), ll = record(r.likelihood);
  const cells = (c: Record<string, unknown>) => Object.fromEntries(CELLS.map(k => [k, num(c[k])])) as Cells;
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    or: { pflicht: num(or.pflicht), interesse: num(or.interesse) },
    jana: { logit: num(jana.logit), odds: num(jana.odds), prob: num(jana.prob) },
    answer1: str(r.answer1, 800),
    odds: cells(odds), prob: cells(prob),
    campaign: oneOf(r.campaign, [...CAMPAIGN_IDS, ''] as const, ''),
    answer3: str(r.answer3, 800), joint: str(r.joint, 800), ame: num(r.ame),
    report: { number: num(rep.number), unit: oneOf(rep.unit, [...UNIT_IDS, ''] as const, ''), sentence: str(rep.sentence, 600) },
    likelihood: { hitModel: num(ll.hitModel), hitAll: num(ll.hitAll), nullLL: num(ll.nullLL), modelLL: num(ll.modelLL), sentence: str(ll.sentence, 600) },
  };
}

const filled = (...xs: string[]) => xs.every(x => x.trim() !== '');
export function statusS10(s: S10State): TaskStatus {
  if (filled(s.or.pflicht, s.or.interesse, s.jana.logit, s.jana.odds, s.jana.prob, s.answer1, s.answer3, s.report.number, s.report.sentence) && s.campaign) return 'done';
  const any = [s.or.pflicht, s.or.interesse, s.jana.logit, s.jana.odds, s.jana.prob, s.answer1, s.answer3, s.joint, s.ame, s.report.number, s.report.sentence,
    ...Object.values(s.odds), ...Object.values(s.prob), ...Object.values(s.likelihood)].some(x => x.trim() !== '');
  return any || s.campaign ? 'running' : 'open';
}

/** Die Tafel erscheint nach Jana (Station 2), allen sechs Zellen (Station 4) und der Antwort auf Frage 3. */
export const tafelReady = (p: Prepared, s: S10State) =>
  Boolean(p.main) && chainOk(p, s.jana) && cellsOk(p, s.odds, 'odds') && cellsOk(p, s.prob, 'prob') && Boolean(s.campaign) && s.answer3.trim() !== '';

export function plenumLines(s: S10State, p: Prepared | null = null): [string, string][] {
  const campaign = CAMPAIGN_ANSWERS.find(a => a.id === s.campaign)?.label ?? '';
  const suffix = UNITS.find(u => u.id === s.report.unit)?.suffix ?? '';
  const kind = p && s.report.number.trim() ? recogniseReport(p, s.report.number, s.report.unit, tafelReady(p, s))?.kind : undefined;
  const ll = s.likelihood, bare = (x: string) => x.trim().replace(/\s*%$/, '');
  return [
    ['Frage 3 · Bei wem bewirkt die Kampagne mehr?', [campaign, s.answer3.trim()].filter(Boolean).join(' – ')],
    ['Gemeinsamer Satz für den Rat', s.joint.trim()],
    ['Die eine Zahl für den Bericht', s.report.number.trim() ? `${s.report.unit ? bareNumber(s.report.number) + suffix : s.report.number.trim()}${kind ? ` · ${KIND_SHORT[kind]}` : ''}` : ''],
    ['Satz für den Bericht', s.report.sentence.trim()],
    ['Frage 1 · „3,77-mal so wahrscheinlich?“', s.answer1.trim()],
    ['Zusatz · Trefferquote gegen −2LL', filled(ll.hitModel, ll.hitAll) ? `Modell ${bare(ll.hitModel)} % · „alle wählen“ ${bare(ll.hitAll)} %${filled(ll.nullLL, ll.modelLL) ? ` · −2LL ${ll.nullLL.trim()} → ${ll.modelLL.trim()}` : ''}` : ''],
  ];
}
