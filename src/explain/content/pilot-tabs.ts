// Reiter der sieben Pilotbegriffe (Spezifikation Lehrdatensatz und R, Abschnitt 5; Ausbau, Abschnitt 5) und die
// Brücken „Mit 200 Befragten“ der Pilot-Werkstätten. Wortlaut nach dem gebilligten Reiterbeispiel der
// Standardabweichung, im Ton der Streuung. Alle Zahlen kommen aus den aktuellen Daten; die R-Referenzwerte stehen
// in src/explain/sample.test.ts und src/explain/tabs.test.ts. Vorbild für die Reiter aller Bereiche (AUTHORING.md, Abschnitt 8).
import type { Bridge, BridgeCtx, ConceptTabs, FNode, TokenNote } from '../types';
import type { PairStats, Series } from '../math';
import { num, signed, paren, unit } from '../format';
import { countWithin, sumNodes, unitText } from '../sample';
import { ref, titleFor } from '../../domain/learning';

type SC = BridgeCtx<Series>;
type PC = BridgeCtx<PairStats>;

const P = (c: BridgeCtx<unknown>) => c.names[c.who];
const N = (c: BridgeCtx<unknown>) => c.values.length;
const lernzeit = (c: BridgeCtx<unknown>) => c.col.id === 'lernzeit';
/** „≈“, wenn die angezeigte Zahl gerundet ist, sonst „=“. */
const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
/** Menge in Sätzen über Menschen: „3,24 Stunden“ bei der Lernzeit, sonst mit der Einheit der Spalte. */
const amount = (c: BridgeCtx<unknown>, v: number) => lernzeit(c) ? unit(v, 'Stunde', 'Stunden') : c.u(v);
const amount2 = (c: PC, v: number) => c.col2!.id === 'lernzeit' ? unit(v, 'Stunde', 'Stunden') : unitText(c.col2!, v);
const values = (c: BridgeCtx<unknown>) => lernzeit(c) ? 'Lernzeiten' : `Werte von „${c.col.title}“`;
/** Lage zur Mitte: „1,75 h unter der Mitte“, „genau auf der Mitte“. */
const toMiddle = (c: BridgeCtx<unknown>, d: number, middle = 'der Mitte') => Math.abs(d) < 0.005 ? `genau auf ${middle}` : `${c.u(Math.abs(d))} ${d > 0 ? 'über' : 'unter'} ${middle}`;
/** Anteil an einer Summe in Prozent, kleine Anteile als „weniger als 0,01 %“. */
const share = (part: number, whole: number) => whole <= 0 ? '0 %' : part / whole * 100 < 0.005 ? 'weniger als 0,01 %' : `${num(part / whole * 100)} %`;
const metric = (c: BridgeCtx<unknown>) => c.col.question ? `Die Rechnung behandelt „${c.col.title}“ als metrisch: Gleiche Zahlenabstände bedeuten gleich viel.` : 'Die Rechnung behandelt die Werte als metrisch: Gleiche Zahlenabstände bedeuten gleich viel.';

// ---------- Brücke Mittel ----------

export const bridgeMittel: Bridge<Series> = {
  data: 'series',
  numeric: c => [
    'x̄ = ( ', ...sumNodes(N(c), c.who, i => [{ part: [num(c.values[i])], m: 1 }], [' ', { part: ['+'], m: 1 }, ' ']), ' ) ', { part: [`/ ${N(c)}`], m: 2 }, { br: true },
    '= ', { part: [num(c.s.sum)], m: 1 }, ' ', { part: [`/ ${N(c)}`], m: 2 }, ` ${eq(c.s.mean)} `, { part: [c.u(c.s.mean)], m: 2 },
  ],
  lines: [
    {
      all: c => `Alle ${N(c)} ${values(c)} zusammen ergeben ${c.u(c.s.sum)}.`,
      person: c => `${P(c)} trägt ${c.u(c.values[c.who])} dazu bei, wie alle anderen auch: jede Person genau einmal.`,
    },
    {
      all: c => `${num(c.s.sum)} / ${N(c)} ${eq(c.s.mean)} ${c.u(c.s.mean)}. Gerecht verteilt bekäme jede Person ${c.u(c.s.mean)}.`,
      person: c => `${P(c)} liegt mit ${c.u(c.values[c.who])} ${toMiddle(c, c.values[c.who] - c.s.mean, 'dem Mittelwert')}.`,
    },
  ],
  metrics: c => [
    { label: 'Befragte n', value: String(N(c)) },
    { label: 'Summe Σxᵢ', value: c.u(c.s.sum) },
    { label: 'Mittelwert x̄', value: c.u(c.s.mean) },
  ],
  interpret: c => {
    const below = c.values.filter(v => v < c.s.mean - 1e-9).length, above = c.values.filter(v => v > c.s.mean + 1e-9).length;
    return {
      kurz: lernzeit(c) ? `Im Durchschnitt haben die ${N(c)} Befragten in den letzten sieben Tagen ${amount(c, c.s.mean)} gelernt.`
        : `Im Durchschnitt liegen die ${N(c)} Befragten bei „${c.col.title}“ bei ${c.u(c.s.mean)}.`,
      fachlich: `Das arithmetische Mittel von „${c.col.title}“ beträgt x̄ ${eq(c.s.mean)} ${c.u(c.s.mean)} bei n = ${N(c)}.`,
      zusatz: `${below} von ${N(c)} Befragten liegen unter dem Mittelwert, ${above} darüber.`,
    };
  },
  voraussetzung: c => `${metric(c)} Sonst ist der Median die bessere Mitte.`,
  picture: (c, step) => ({ center: step >= 2 ? c.s.mean : undefined, deviation: step >= 2 }),
};

// ---------- Brücke Streuung ----------

const devTerm = (c: SC, i: number): FNode[] => [{ part: ['('], m: 3 }, { part: [`${num(c.values[i])} −`], m: 2 }, ' ', { part: [num(c.s.mean)], m: 1 }, { part: [')²'], m: 3 }];
const plus4: FNode[] = [' ', { part: ['+'], m: 4 }, ' '];

export const bridgeStreuung: Bridge<Series> = {
  data: 'series',
  numeric: (c, last) => {
    const n = N(c), terms = sumNodes(n, c.who, i => devTerm(c, i), plus4);
    return last >= 6
      ? ['s = ', { part: ['√'], m: 6 }, '[ ( ', ...terms, ' ) ', { part: [`/ (${n} − 1)`], m: 5 }, ' ]', { br: true },
        '= ', { part: ['√'], m: 6 }, '( ', { part: [num(c.s.ss)], m: 4 }, ' ', { part: [`/ ${n - 1}`], m: 5 }, ' ) ', eq(c.s.variance), ' ', { part: [`√${num(c.s.variance)}`], m: 5 }, ' ≈ ', { part: [c.u(c.s.sd)], m: 6 }]
      : ['s² = [ ', ...terms, ' ] ', { part: [`/ (${n} − 1)`], m: 5 }, { br: true },
        '= ', { part: [num(c.s.ss)], m: 4 }, ' ', { part: [`/ ${n - 1}`], m: 5 }, ` ${eq(c.s.variance)} `, { part: [c.u(c.s.variance, { squared: true })], m: 5 }];
  },
  lines: [
    {
      all: c => `Alle ${N(c)} ${values(c)} zusammen ergeben ${c.u(c.s.sum)}. Geteilt durch ${N(c)}: x̄ ${eq(c.s.mean)} ${c.u(c.s.mean)}.`,
      person: c => `${P(c)} hat den Wert ${c.u(c.values[c.who])}. Er zählt in der Summe einmal mit, wie jeder andere auch.`,
    },
    {
      all: c => `Für jede der ${N(c)} Personen: Wert minus ${num(c.s.mean)}. Zusammen ergeben alle ${N(c)} Abstände genau 0, wie bei den fünf Personen.`,
      person: c => `${P(c)}: ${num(c.values[c.who])} − ${num(c.s.mean)} = ${signed(c.s.dev[c.who])}, also ${toMiddle(c, c.s.dev[c.who])}.`,
    },
    {
      all: c => `Jeder der ${N(c)} Abstände wird mit sich selbst malgenommen. Kein Quadrat ist negativ, und große Abstände zählen viel.`,
      person: c => `${P(c)}: ${paren(c.s.dev[c.who])}² ${eq(c.s.sq[c.who])} ${c.u(c.s.sq[c.who], { squared: true })}.`,
    },
    {
      all: c => {
        const b = c.s.sq.indexOf(Math.max(...c.s.sq));
        return `Die ${N(c)} Quadrate ergeben zusammen die Quadratsumme ${c.u(c.s.ss, { squared: true })}. Den größten Beitrag liefert ${c.names[b]} mit ${c.u(c.values[b])}: (${num(c.values[b])} − ${num(c.s.mean)})² ≈ ${c.u(c.s.sq[b], { squared: true, digits: 1 })}.`;
      },
      person: c => `${P(c)} steuert ${c.u(c.s.sq[c.who], { squared: true })} bei, das sind ${share(c.s.sq[c.who], c.s.ss)} der Quadratsumme.`,
    },
    {
      all: c => `${num(c.s.ss)} / (${N(c)} − 1) = ${num(c.s.ss)} / ${N(c) - 1} ${eq(c.s.variance)} ${c.u(c.s.variance, { squared: true })}.`,
      person: c => `${P(c)} trägt ${share(c.s.sq[c.who], c.s.ss)} der Quadratsumme bei, also auch ${share(c.s.sq[c.who], c.s.ss)} der Varianz.`,
    },
    {
      all: c => `√${num(c.s.variance)} ≈ ${c.u(c.s.sd)}. Probe: ${num(c.s.sd)} · ${num(c.s.sd)} ≈ ${num(c.s.sd * c.s.sd)}.`,
      person: c => {
        const d = c.s.dev[c.who], inside = Math.abs(d) <= c.s.sd + 1e-9;
        return `${P(c)} liegt ${toMiddle(c, d)}, also ${inside ? 'innerhalb' : 'außerhalb'} von x̄ ± s (${num(c.s.mean - c.s.sd)} bis ${c.u(c.s.mean + c.s.sd)}).`;
      },
    },
  ],
  metrics: (c, variant) => [
    { label: 'Befragte n', value: String(N(c)) },
    { label: 'Mitte x̄', value: c.u(c.s.mean) },
    variant === 'variance' ? { label: 'Varianz s²', value: c.u(c.s.variance, { squared: true }) } : { label: 'Standardabweichung s', value: c.u(c.s.sd) },
  ],
  interpret: (c, variant) => {
    const lo = c.s.mean - c.s.sd, hi = c.s.mean + c.s.sd, k = countWithin(c.values, lo, hi);
    const big = c.s.sq.indexOf(Math.max(...c.s.sq));
    if (c.s.sd < 0.005) return { kurz: 'Alle haben denselben Wert. Es gibt keine Streuung.', fachlich: `Die Standardabweichung von „${c.col.title}“ ist 0.` };
    return variant === 'variance' ? {
      kurz: `Ein typisches Abweichungsquadrat ist bei den ${N(c)} Befragten ${c.u(c.s.variance, { squared: true })} groß. Seine Seite s ≈ ${c.u(c.s.sd)} sagt, wie weit die Befragten typischerweise von der Mitte entfernt sind.`,
      fachlich: `Die Varianz von „${c.col.title}“ beträgt s² ${eq(c.s.variance)} ${c.u(c.s.variance, { squared: true })}: die Quadratsumme ${num(c.s.ss)} geteilt durch n − 1 = ${N(c) - 1}.`,
      zusatz: `Den größten Einzelbeitrag liefert ${c.names[big]}: ${share(c.s.sq[big], c.s.ss)} der Quadratsumme.`,
    } : {
      kurz: `Typischerweise weicht ${lernzeit(c) ? 'die Lernzeit einer Person' : `„${c.col.title}“ bei einer Person`} um etwa ${amount(c, c.s.sd)} vom Durchschnitt (${amount(c, c.s.mean)}) ab.`,
      fachlich: `Die Standardabweichung von „${c.col.title}“ beträgt s ≈ ${c.u(c.s.sd)} bei n = ${N(c)}. Sie ist die Wurzel der Varianz s² ≈ ${c.u(c.s.variance, { squared: true })}.`,
      zusatz: lernzeit(c) ? `${k} von ${N(c)} Befragten lernen zwischen ${num(lo)} und ${num(hi)} Stunden.` : `${k} von ${N(c)} Befragten liegen bei „${c.col.title}“ zwischen ${num(lo)} und ${c.u(hi)}.`,
    };
  },
  voraussetzung: c => `${metric(c)} Für die Streuung braucht es mindestens zwei Werte.`,
  picture: (c, step) => ({
    center: c.s.mean,
    deviation: step >= 2,
    contributions: step === 4 || step === 5 ? { label: 'Quadrate aller Befragten, der Größe nach', values: c.s.sq } : undefined,
    band: step >= 6 ? [c.s.mean - c.s.sd, c.s.mean + c.s.sd] : undefined,
  }),
};

// ---------- Brücke Zusammenhang ----------

const prodTerm = (c: PC, i: number): FNode[] => [
  { part: ['('], m: 3 }, { part: [`${num(c.values[i])} −`], m: 2 }, ' ', { part: [num(c.s.x.mean)], m: 1 }, { part: [')'], m: 3 },
  { part: [' · ('], m: 3 }, { part: [`${num(c.values2![i])} −`], m: 2 }, ' ', { part: [num(c.s.y.mean)], m: 1 }, { part: [')'], m: 3 },
];
const t1 = (c: PC) => `„${c.col.title}“`, t2 = (c: PC) => `„${c.col2!.title}“`;
const strength = (r: number) => { const a = Math.round(Math.abs(r) * 100) / 100; return a >= 1 ? 'perfekter' : a >= 0.5 ? 'starker' : a >= 0.3 ? 'mittelstarker' : 'schwacher'; };

export const bridgeZusammenhang: Bridge<PairStats> = {
  data: 'pairs',
  numeric: (c, last) => {
    const n = N(c), cov = ['sₓᵧ = [ ', ...sumNodes(n, c.who, i => prodTerm(c, i), plus4), ' ] ', { part: [`/ (${n} − 1)`], m: 5 }] as FNode[];
    return last >= 6
      ? [...cov, { br: true }, 'r = ', { part: [num(c.s.cov)], m: 5 }, ' ', { part: [`/ (${num(c.s.x.sd)} · ${num(c.s.y.sd)})`], m: 6 }, ' ≈ ', { part: [c.s.r === null ? 'nicht definiert' : num(c.s.r)], m: 6 }]
      : [...cov, { br: true }, '= ', { part: [num(c.s.cp)], m: 4 }, ' ', { part: [`/ ${n - 1}`], m: 5 }, ` ${eq(c.s.cov)} `, { part: [num(c.s.cov)], m: 5 }];
  },
  lines: [
    {
      all: c => `Mittelwert von ${t1(c)}: x̄ ${eq(c.s.x.mean)} ${c.u(c.s.x.mean)}. Mittelwert von ${t2(c)}: ȳ ${eq(c.s.y.mean)} ${unitText(c.col2!, c.s.y.mean)}.`,
      person: c => `${P(c)} hat ${c.u(c.values[c.who])} bei ${t1(c)} und ${unitText(c.col2!, c.values2![c.who])} bei ${t2(c)}.`,
    },
    {
      all: c => `Für jede Person zwei Abstände: ihr x minus x̄ und ihr y minus ȳ. Beide Sorten ergeben zusammen 0.`,
      person: c => `${P(c)}: ${num(c.values[c.who])} − ${num(c.s.x.mean)} = ${signed(c.s.x.dev[c.who])} und ${num(c.values2![c.who])} − ${num(c.s.y.mean)} = ${signed(c.s.y.dev[c.who])}.`,
    },
    {
      all: c => `Je Person werden die beiden Abstände malgenommen. Gleiche Vorzeichen ergeben Plus, verschiedene ergeben Minus.`,
      person: c => {
        const p = c.s.prod[c.who];
        return `${P(c)}: ${paren(c.s.x.dev[c.who])} · ${paren(c.s.y.dev[c.who])} ${eq(p)} ${signed(p)}${Math.abs(p) < 0.005 ? ', also kein Beitrag' : p > 0 ? ', beide Abstände zeigen in dieselbe Richtung' : ', die Abstände zeigen in verschiedene Richtungen'}.`;
      },
    },
    {
      all: c => `Plus und Minus verrechnet ergeben die ${N(c)} Produkte ${num(c.s.cp)}. ${c.s.prod.filter(p => p > 1e-9).length} Produkte sind positiv, ${c.s.prod.filter(p => p < -1e-9).length} negativ.`,
      person: c => `${P(c)} steuert ${signed(c.s.prod[c.who])} zur Summe bei.`,
    },
    {
      all: c => `${num(c.s.cp)} / (${N(c)} − 1) = ${num(c.s.cp)} / ${N(c) - 1} ${eq(c.s.cov)} ${num(c.s.cov)}.`,
      person: c => `Geteilt wird die ganze Summe, also auch der Beitrag ${signed(c.s.prod[c.who])} von ${P(c)}.`,
    },
    {
      all: c => c.s.r === null ? 'Eine der beiden Spalten streut nicht. Dann ist r nicht definiert.'
        : `${num(c.s.cov)} / (${num(c.s.x.sd)} · ${num(c.s.y.sd)}) ≈ ${num(c.s.r)}. Größer als ${num(c.s.sxy)} kann die Kovarianz hier nicht werden.`,
      person: c => {
        const p = c.s.prod[c.who], r = c.s.r ?? 0;
        return Math.abs(p) < 0.005 || Math.abs(r) < 0.005 ? `${P(c)} trägt kaum etwas zu r bei.`
          : `${P(c)} ${p * r > 0 ? 'stützt' : 'schwächt'} den ${r > 0 ? 'gleichläufigen' : 'gegenläufigen'} Zusammenhang.`;
      },
    },
  ],
  metrics: (c, variant) => [
    { label: 'Befragte n', value: String(N(c)) },
    { label: 'Kovarianz sₓᵧ', value: num(c.s.cov) },
    ...(variant === 'pearson' ? [{ label: 'Pearson-r', value: c.s.r === null ? 'nicht definiert' : num(c.s.r) }] : []),
  ],
  interpret: (c, variant) => {
    const same = c.s.prod.filter(p => p > 1e-9).length;
    const zusatz = `${same} von ${N(c)} Befragten liegen in beiden Fragen auf derselben Seite der Mitte.`;
    if (variant === 'covariance') return {
      kurz: c.s.cov > 0.005 ? `Wer bei ${t1(c)} über dem Durchschnitt liegt, liegt bei ${t2(c)} eher auch darüber. Wie groß die Zahl ${num(c.s.cov)} ist, hängt von den Einheiten ab.`
        : c.s.cov < -0.005 ? `Wer bei ${t1(c)} über dem Durchschnitt liegt, liegt bei ${t2(c)} eher darunter. Wie groß die Zahl ${num(c.s.cov)} ist, hängt von den Einheiten ab.`
        : `Die Kovarianz ist fast 0: Über und unter dem Durchschnitt gleichen sich aus.`,
      fachlich: `Die Kovarianz von ${t1(c)} und ${t2(c)} beträgt sₓᵧ ${eq(c.s.cov)} ${num(c.s.cov)} bei n = ${N(c)}.`,
      zusatz,
    };
    if (c.s.r === null) return { kurz: 'Eine der beiden Spalten streut nicht. Dann lässt sich kein Zusammenhang berechnen.', fachlich: 'Eine Standardabweichung ist 0, deshalb ist r nicht definiert.', zusatz };
    const r = c.s.r;
    return {
      kurz: Math.abs(r) < 0.1 ? `Zwischen ${t1(c)} und ${t2(c)} gibt es hier kaum einen geraden Zusammenhang.`
        : lernzeit(c) && c.col2!.id === 'wissenstest' ? `Wer mehr lernt, löst im Wissenstest eher mehr Aufgaben. Das ist ein ${r > 0 ? 'gleichläufiger' : 'gegenläufiger'}, ${strength(r)} Zusammenhang.`
        : `Wer bei ${t1(c)} höher liegt, liegt bei ${t2(c)} eher ${r > 0 ? 'auch höher' : 'niedriger'}. Das ist ein ${strength(r)} Zusammenhang.`,
      fachlich: `Die Pearson-Korrelation von ${t1(c)} und ${t2(c)} beträgt r ≈ ${num(r)} bei n = ${N(c)}. Nach der Faustregel von Cohen ist ein Betrag ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark.`,
      zusatz,
    };
  },
  voraussetzung: c => `Beide Spalten werden als metrisch behandelt, und r erfasst nur gerade Muster. Ein einzelner Ausreißer kann r deutlich verändern.`,
  picture: (c, step) => ({
    center: [c.s.x.mean, c.s.y.mean],
    deviation: step >= 2,
    quadrants: step >= 3,
    contributions: step === 4 || step === 5 ? { label: 'Abweichungsprodukte aller Befragten, der Größe nach', values: c.s.prod } : undefined,
  }),
};

// ---------- Reiter ----------

const T = (id: string) => titleFor(ref(id));
/** Funktionen und Argumente der Leitaufrufe (Ergänzungen zur allgemeinen Codelegende in src/domain/rTokens.ts). */
const DESCRIBE: TokenNote = {
  sym: 'describe()', term: T('describe'),
  kurz: 'Berechnet Kennwerte einer oder mehrerer Spalten. Welche, sagt show; N und Missing stehen immer dabei.',
  fehler: 'Ohne library(mariposa) meldet R: konnte Funktion "describe" nicht finden.',
};
const SHOW_VALUE = (key: string, term: string, kurz: string): TokenNote => ({
  sym: `"${key}"`, term, kurz,
  fehler: `Groß geschrieben kennt describe() den Namen nicht: show = "${key.toUpperCase()}" ergibt Unknown \`show\` value. Richtig ist "${key}".`,
});
const MEAN_VALUE = SHOW_VALUE('mean', T('mean'), '"mean" steht für den Mittelwert x̄. In der Ausgabe heißt die Spalte Mean.');
const SD_VALUE = SHOW_VALUE('sd', T('sd'), '"sd" steht für standard deviation, die Standardabweichung s. In der Ausgabe heißt die Spalte SD.');
const VAR_VALUE = SHOW_VALUE('var', T('variance'), '"var" steht für variance, die Varianz s². In der Ausgabe heißt die Spalte Variance.');
const SE_VALUE = SHOW_VALUE('se', T('se'), '"se" steht für standard error, den Standardfehler. In der Ausgabe heißt die Spalte SE.');

/** Kennzahlen, die in describe() immer dabeistehen. */
const N_MAP = { match: 'N', atlas: 'n', explain: 'N zählt die gültigen Werte, hier alle Befragten. Durch diese Zahl teilst du beim Mittelwert.' };
const MISSING_MAP = { match: 'Missing', atlas: 'fehlende Werte', explain: 'Missing zählt Befragte ohne Antwort. Im Lehrdatensatz fehlt niemand.' };

/** Variablen der Vorhersagefragen. */
const LZ = 'lernzeit', LZ_WT = 'lernzeit,wissenstest';

export const PILOT_TABS: Record<string, ConceptTabs> = {
  mean: {
    sample: {
      kind: 'bridge', workshop: 'mittel', variant: 'mean', variable: LZ,
      think: [
        {
          question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Mittelwert?', options: ['bleibt gleich', 'steigt um 1 Stunde', 'steigt um 200 Stunden'], correct: 1, step: 2,
          explain: 'Die Summe wächst um 200 Stunden. Geteilt durch 200 bleibt für jede Person genau 1 Stunde mehr.',
          kurz: 'Verschieben verschiebt den Mittelwert um genau so viel.',
          tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        },
        {
          question: 'Eine Person lernt plötzlich 40 Stunden. Wie stark ändert sich der Mittelwert der 200?', options: ['gar nicht', 'ein wenig', 'um mehr als 10 Stunden'], correct: 1, step: 1,
          explain: 'Der neue Wert geht einmal in die Summe ein, geteilt wird durch 200. Ein einzelner Ausreißer verschiebt den Mittelwert deshalb nur um ein Zweihundertstel seines Unterschieds.',
          kurz: 'Bei 200 Personen fällt ein einzelner Wert wenig ins Gewicht.',
          tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        },
        {
          question: 'Alle lernen doppelt so lange. Was passiert mit dem Mittelwert?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 2,
          explain: 'Jeder Wert verdoppelt sich, also auch die Summe. Durch 200 geteilt ergibt das den doppelten Mittelwert.',
          kurz: 'Malnehmen wirkt auf den Mittelwert genauso.',
          tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        },
      ],
    },
    r: {
      entry: 'mean', variant: 0, live: { fn: 'describe', show: ['mean'] },
      tokens: { describe: DESCRIBE, '"mean"': MEAN_VALUE },
      outputMap: [
        { match: 'Mean', atlas: 'x̄', step: 2, explain: 'Mean heißt Mittelwert: die Summe aller Werte geteilt durch n.' },
        N_MAP, MISSING_MAP,
      ],
      check: {
        question: 'Welche Zahl in der Ausgabe ist der Mittelwert x̄? Tippe sie an.', correct: 'Mean',
        wrong: { N: 'Fast! N ist die Zahl der Befragten. Durch sie teilst du in Schritt 2; der Mittelwert steht unter Mean.', Missing: 'Fast! Missing zählt fehlende Antworten. Der Mittelwert steht unter Mean.' },
      },
    },
    next: {
      next: { id: 'sd', why: 'Wie weit liegen die Befragten typischerweise vom Mittelwert entfernt? Das misst die Standardabweichung.' },
      before: [
        { id: 'series', why: 'Die Einzelwerte, die zusammengezählt werden.' },
        { id: 'validn', why: 'n, durch das du am Ende teilst.' },
        { id: 'metric', why: 'Nur wenn Abstände zwischen Zahlen etwas bedeuten, ist der Mittelwert sinnvoll.' },
      ],
      after: [
        { id: 'variance', why: 'Misst, wie weit die Werte um den Mittelwert streuen.' },
        { id: 'centering', why: 'Von jedem Wert den Mittelwert abziehen: Dann liegt die Mitte bei 0.' },
        { id: 'covariance', why: 'Nutzt die Mittelwerte zweier Spalten als Bezugspunkte.' },
        { id: 't_test', why: 'Vergleicht die Mittelwerte zweier Gruppen.' },
        { id: 'confidence', why: 'Zeigt, in welchem Bereich der Mittelwert aller Menschen plausibel liegt.' },
      ],
      more: [
        { id: 'median', why: 'Die Mitte nach der Reihenfolge; Ausreißer stören sie kaum.' },
        { id: 'describe', why: 'Mittelwert, Streuung und mehr auf einen Blick.' },
        { id: 'weights', why: 'Mittelwert, bei dem manche Personen stärker zählen.' },
      ],
    },
  },

  variance: {
    sample: {
      kind: 'bridge', workshop: 'streuung', variant: 'variance', variable: LZ,
      think: [
        {
          question: 'Alle lernen eine Stunde mehr. Was macht s²?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 2,
          explain: 'Die Mitte wandert um 1 Stunde mit. Im Abstand hebt sich die Stunde auf: (xᵢ + 1) − (x̄ + 1) = xᵢ − x̄. Die Varianz bleibt gleich.',
          kurz: 'Verschieben ändert die Lage, nicht die Streuung.',
          tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        },
        {
          question: 'Alle lernen doppelt so lange. Was macht s²?', options: ['verdoppelt sich', 'vervierfacht sich', 'bleibt gleich'], correct: 1, step: 3,
          explain: 'Jeder Abstand verdoppelt sich, jedes Quadrat vervierfacht sich (Schritt 3). Damit wird auch die Varianz viermal so groß.',
          kurz: 'Doppelte Werte, vierfache Varianz.',
          tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        },
        {
          question: 'Eine Person lernt plötzlich 40 Stunden. Was macht s²?', options: ['bleibt fast gleich', 'steigt deutlich', 'sinkt'], correct: 1, step: 4,
          explain: 'Ihr Abstand zur Mitte wird groß, und das Quadrat macht ihn riesig (Schritt 3). Ein einziger Beitrag erhöht die Quadratsumme deutlich (Schritt 4).',
          kurz: 'Wer weit weg ist, zählt im Quadrat viel mehr.',
          tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        },
      ],
    },
    r: {
      entry: 'variance', variant: 0, live: { fn: 'describe', show: ['mean', 'var'] },
      tokens: { describe: DESCRIBE, '"mean"': MEAN_VALUE, '"var"': VAR_VALUE },
      outputMap: [
        { match: 'Mean', atlas: 'x̄', step: 1, explain: 'Mean ist die Mitte aus Schritt 1, von der aus alle Abstände gemessen werden.' },
        { match: 'Variance', atlas: 's²', step: 5, explain: 'Variance ist die Varianz: die Quadratsumme geteilt durch n − 1.' },
        N_MAP, MISSING_MAP,
      ],
      check: {
        question: 'Welche Zahl in der Ausgabe ist die Varianz s²? Tippe sie an.', correct: 'Variance',
        wrong: { Mean: 'Fast! Das ist der Mittelwert aus Schritt 1. Die Varianz steht unter Variance.', N: 'Fast! N ist die Zahl der Befragten. Die Varianz steht unter Variance.', Missing: 'Fast! Missing zählt fehlende Antworten. Die Varianz steht unter Variance.' },
      },
    },
    next: {
      next: { id: 'sd', why: 'Ziehst du die Wurzel aus der Varianz, bist du wieder in der Einheit der Daten.' },
      before: [
        { id: 'mean', why: 'Die Mitte, von der aus alle Abstände gemessen werden.' },
        { id: 'ss', why: 'Die Summe der quadrierten Abstände, die geteilt wird.' },
        { id: 'validn', why: 'n, aus dem die Freiheitsgrade n − 1 werden.' },
      ],
      after: [
        { id: 'sd', why: 'Die Wurzel der Varianz.' },
        { id: 'oneway_anova', why: 'Zerlegt die Streuung in Unterschiede zwischen und innerhalb von Gruppen.' },
        { id: 'reliability', why: 'Vergleicht die Varianz einzelner Fragen mit der Varianz des Skalenwerts.' },
      ],
      more: [{ id: 'population_variance', why: 'Die Varianz aller Menschen, die s² aus einer Stichprobe schätzt.' }],
    },
  },

  sd: {
    sample: {
      kind: 'bridge', workshop: 'streuung', variant: 'sd', variable: LZ,
      think: [
        {
          question: 'Alle lernen eine Stunde mehr. Was macht s?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 2,
          explain: 'Die Mitte wandert um 1 Stunde mit. Im Abstand hebt sich die Stunde auf: (xᵢ + 1) − (x̄ + 1) = xᵢ − x̄. Die Streuung bleibt gleich.',
          kurz: 'Verschieben ändert die Lage, nicht die Streuung.',
          tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        },
        {
          question: 'Alle lernen doppelt so lange. Was macht s?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 6,
          explain: 'Jeder Abstand verdoppelt sich, jedes Quadrat vervierfacht sich (Schritt 3). Die Varianz wird viermal so groß, die Wurzel daraus doppelt so groß (Schritt 6).',
          kurz: 'Doppelte Werte, doppelte Standardabweichung, vierfache Varianz.',
          tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        },
        {
          question: 'Eine Person lernt plötzlich 40 Stunden. Was macht s?', options: ['bleibt fast gleich', 'steigt deutlich', 'sinkt'], correct: 1, step: 4,
          explain: 'Ihr Abstand zur Mitte wird groß, und das Quadrat macht ihn riesig (Schritt 3). Ein einziger Beitrag erhöht die Quadratsumme deutlich (Schritt 4).',
          kurz: 'Wer weit weg ist, zählt im Quadrat viel mehr.',
          tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        },
      ],
    },
    r: {
      entry: 'sd', variant: 0, live: { fn: 'describe', show: ['mean', 'sd', 'var'] },
      tokens: { describe: DESCRIBE, '"mean"': MEAN_VALUE, '"sd"': SD_VALUE, '"var"': VAR_VALUE },
      outputMap: [
        { match: 'Mean', atlas: 'x̄', step: 1, explain: 'Mean ist die Mitte aus Schritt 1, von der aus alle Abstände gemessen werden.' },
        { match: 'SD', atlas: 's', step: 6, explain: 'SD heißt standard deviation, auf Deutsch Standardabweichung: die Wurzel aus Schritt 6.' },
        { match: 'Variance', atlas: 's²', step: 5, explain: 'Variance ist die Varianz, die Zahl vor der Wurzel.' },
        N_MAP, MISSING_MAP,
      ],
      check: {
        question: 'Welche Zahl in der Ausgabe ist s? Tippe sie an.', correct: 'SD',
        wrong: { Variance: 'Fast! Das ist die Varianz, noch vor der Wurzel (Schritt 5).', Mean: 'Fast! Das ist der Mittelwert x̄ aus Schritt 1. s steht unter SD.', N: 'Fast! N ist die Zahl der Befragten. s steht unter SD.', Missing: 'Fast! Missing zählt fehlende Antworten. s steht unter SD.' },
      },
    },
    next: {
      next: { id: 'se', why: 'Wie genau kennt man den Mittelwert? Teile s durch die Wurzel aus n: 3,24 / √200 ≈ 0,23 h.' },
      before: [
        { id: 'variance', why: 'Die Varianz s², deren Wurzel s ist.' },
        { id: 'mean', why: 'Die Mitte, von der aus alle Abstände gemessen werden.' },
      ],
      after: [
        { id: 'z', why: 'Misst Abstände zur Mitte in Standardabweichungen.' },
        { id: 'pearson', why: 'Teilt die Kovarianz durch die beiden Standardabweichungen.' },
        { id: 'effect', why: 'Drückt Unterschiede zwischen Gruppen in Standardabweichungen aus.' },
      ],
      more: [
        { id: 'describe', why: 'Mittelwert, Standardabweichung und mehr auf einen Blick.' },
        { id: 'shape', why: 'Schiefe und Kurtosis beschreiben die Form, die s allein nicht zeigt.' },
      ],
    },
  },

  covariance: {
    sample: {
      kind: 'bridge', workshop: 'zusammenhang', variant: 'covariance', variable: LZ_WT,
      think: [
        {
          question: 'Alle lösen im Wissenstest zwei Aufgaben mehr. Was macht die Kovarianz?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 2,
          explain: 'Die Mitte ȳ wandert um zwei Aufgaben mit. Die Abstände yᵢ − ȳ bleiben gleich, also auch alle Produkte.',
          kurz: 'Verschieben ändert die Lage, nicht den Zusammenhang.',
          tryIt: { label: 'alle zwei Aufgaben mehr', op: 'shift', column: 'y', value: 2 },
        },
        {
          question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was macht die Kovarianz?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 3,
          explain: 'Jeder Abstand yᵢ − ȳ dreht sein Vorzeichen. Damit dreht auch jedes Produkt sein Vorzeichen (Schritt 3), und die Summe wird negativ.',
          kurz: 'Umpolen dreht die Richtung, nicht die Stärke.',
          tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        },
        {
          question: 'Alle lernen doppelt so lange. Was macht die Kovarianz?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 3,
          explain: 'Jeder Abstand der Lernzeit verdoppelt sich, die Abstände im Wissenstest bleiben. Jedes Produkt verdoppelt sich, also auch die Kovarianz.',
          kurz: 'Andere Einheit, andere Kovarianz.',
          tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        },
      ],
    },
    r: {
      entry: '', variant: 0, live: { fn: 'cov' },
      tokens: {
        kovarianz: { sym: 'kovarianz', term: 'Name der Ergebnisspalte', kurz: 'So heißt die Spalte mit dem Ergebnis. Den Namen wählst du selbst, links vom =.', fehler: 'Ohne Namen heißt die Spalte wie die Rechnung, also `cov(lernzeit, wissenstest)`.' },
      },
      outputMap: [
        { match: 'kovarianz', atlas: 'sₓᵧ', step: 5, explain: 'Die Kovarianz: die Summe der Abweichungsprodukte geteilt durch n − 1. R zeigt hier drei gültige Stellen.' },
        { match: '<dbl>', atlas: 'Kommazahl', explain: '<dbl> steht für double: Die Spalte enthält Kommazahlen.' },
        { match: '1 × 1', atlas: 'eine Zeile, eine Spalte', explain: 'summarise() fasst alle Befragten zu einer Zeile zusammen. Die Tabelle hat eine Zeile und eine Spalte.' },
      ],
      check: {
        question: 'Welche Zahl in der Ausgabe ist die Kovarianz sₓᵧ? Tippe sie an.', correct: 'kovarianz',
        wrong: { '<dbl>': 'Fast! <dbl> nennt nur die Art der Spalte: Kommazahlen. Die Zahl steht eine Zeile tiefer.', '1 × 1': 'Fast! 1 × 1 heißt: eine Zeile, eine Spalte. Die Kovarianz steht unter kovarianz.' },
      },
    },
    next: {
      next: { id: 'pearson', why: 'Teilt die Kovarianz durch das Größtmögliche und macht sie so unabhängig von den Einheiten.' },
      before: [
        { id: 'mean', why: 'Die beiden Mitten x̄ und ȳ, von denen aus gemessen wird.' },
        { id: 'pairs', why: 'x und y derselben Person bleiben zusammen.' },
        { id: 'centering', why: 'Zentrierte Werte sind genau die Abstände zur Mitte.' },
      ],
      after: [{ id: 'pearson', why: 'Die Kovarianz im Zähler, die Standardabweichungen im Nenner.' }],
      more: [{ id: 'linear_regression', why: 'Die Steigung der Regressionsgeraden ist die Kovarianz geteilt durch die Varianz von x.' }],
    },
  },

  pearson: {
    sample: {
      kind: 'bridge', workshop: 'zusammenhang', variant: 'pearson', variable: LZ_WT,
      think: [
        {
          question: 'Alle lösen im Wissenstest zwei Aufgaben mehr. Was macht r?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 2,
          explain: 'Die Mitte ȳ wandert mit, die Abstände bleiben. Kovarianz und Standardabweichungen ändern sich nicht, also auch r nicht.',
          kurz: 'Verschieben ändert die Lage, nicht den Zusammenhang.',
          tryIt: { label: 'alle zwei Aufgaben mehr', op: 'shift', column: 'y', value: 2 },
        },
        {
          question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was macht r?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 6,
          explain: 'Jedes Produkt dreht sein Vorzeichen (Schritt 3), die Standardabweichungen bleiben. r behält seinen Betrag und wird negativ (Schritt 6).',
          kurz: 'Umpolen dreht die Richtung, nicht die Stärke.',
          tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        },
        {
          question: 'Die gewählte Person lernt plötzlich 40 Stunden, ihr Wissenstest bleibt. Kann ein einziger Wert r bei 200 Befragten spürbar verändern?', options: ['nein, kaum', 'ja, deutlich'], correct: 1, step: 6,
          explain: 'Ein Wert weit weg von der Mitte erzeugt ein großes Produkt (Schritt 3) und erhöht zugleich sₓ (Schritt 6). Je nach ihrem Wissenstest steigt oder sinkt r deutlich.',
          kurz: 'Ein Ausreißer kann r stark verschieben.',
          tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        },
      ],
    },
    r: {
      entry: 'pearson', variant: 0, live: { fn: 'pearson_cor' },
      tokens: {
        pearson_cor: { sym: 'pearson_cor()', term: T('pearson'), kurz: 'Berechnet r für zwei oder mehr Spalten, dazu den p-Wert und die Zahl der Befragten N.', fehler: 'Mit nur einer Spalte meldet mariposa: At least two variables must be specified for correlation analysis.' },
      },
      outputMap: [
        { match: 'r', atlas: 'r', step: 6, explain: 'r ist die Pearson-Korrelation aus Schritt 6: die Kovarianz geteilt durch sₓ · sᵧ.' },
        { match: 'p', atlas: 'p-Wert', explain: 'p < 0.001 heißt: Ohne Zusammenhang unter allen Menschen wäre ein so großes r sehr überraschend. Die Sterne sagen dasselbe kurz.' },
        { match: 'N', atlas: 'n', explain: 'N zählt die Befragten mit gültigen Werten in beiden Spalten.' },
      ],
      check: {
        question: 'Welche Zahl in der Ausgabe ist r? Tippe sie an.', correct: 'r',
        wrong: { p: 'Fast! Das ist der p-Wert. Er sagt, wie überraschend r wäre, wenn es keinen Zusammenhang gäbe. r steht hinter r =.', N: 'Fast! Das ist die Zahl der Befragten. r steht hinter r =.' },
      },
    },
    next: {
      next: { id: 'spearman', why: 'Dieselbe Idee mit Rängen: robuster gegen Ausreißer und passend für geordnete Kategorien.' },
      before: [
        { id: 'covariance', why: 'Die gemeinsame Streuung im Zähler.' },
        { id: 'sd', why: 'Die beiden Standardabweichungen im Nenner.' },
        { id: 'linear', why: 'r beschreibt nur gerade Muster.' },
      ],
      after: [
        { id: 'partial_cor', why: 'r, bei dem der Einfluss einer dritten Variable herausgerechnet ist.' },
        { id: 'correlation_matrix', why: 'Alle Korrelationen mehrerer Spalten auf einen Blick.' },
      ],
      more: [
        { id: 'p_value', why: 'Wie überraschend wäre ein r dieser Größe, wenn es keinen Zusammenhang gäbe?' },
        { id: 'effect', why: 'r selbst ist eine Effektgröße.' },
      ],
    },
  },

  se: {
    sample: {
      kind: 'analysis', columns: { x: 'lernzeit' },
      kurz: 'Dieselbe Formel als Satz, jetzt mit s und n aller 200 Befragten des Lehrdatensatzes.',
      result: c => {
        const x = c.rows.map(r => r.values[c.columns.x?.[0] ?? 'lernzeit']), n = x.length;
        const mean = x.reduce((a, b) => a + b, 0) / n, s = Math.sqrt(x.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)), se = s / Math.sqrt(n);
        return {
          kurz: `Mit allen ${n} Befragten: SE = ${num(s)} / √${n} ≈ ${num(se)} h. Der Mittelwert ${num(mean)} h würde von Stichprobe zu Stichprobe typischerweise um etwa ${unit(se, 'Stunde', 'Stunden')} schwanken.`,
          fachlich: `Standardfehler des Mittelwerts: SE = s / √n ≈ ${num(se)} h. Zwei Standardfehler um den Mittelwert, von ${num(mean - 2 * se)} bis ${num(mean + 2 * se)} h, ergeben ungefähr ein 95-%-Konfidenzintervall.`,
          zusatz: `Mit viermal so vielen Befragten wäre der Standardfehler halb so groß, etwa ${num(se / 2)} h.`,
        };
      },
      voraussetzung: 'Die Formel gilt für unabhängige Befragte und einen ungewichteten Mittelwert. Für die 200 synthetischen Befragten nimmt der Atlas das an.',
      think: [
        {
          question: 'Alle lernen doppelt so lange. Was macht der Standardfehler?', options: ['bleibt gleich', 'verdoppelt sich', 'halbiert sich'], correct: 1,
          explain: 'SE = s / √n. s verdoppelt sich, n bleibt 200. Also verdoppelt sich auch der Standardfehler.',
          kurz: 'Mehr Streuung, ungenauerer Mittelwert.',
          tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        },
        {
          question: 'Alle lernen eine Stunde mehr. Was macht der Standardfehler?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
          explain: 'Verschieben ändert s nicht, und n bleibt 200. Der Mittelwert wandert, seine Genauigkeit bleibt.',
          kurz: 'Die Lage ändert nichts an der Genauigkeit.',
          tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        },
        {
          question: 'Eine Person lernt plötzlich 40 Stunden. Was macht der Standardfehler?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 1,
          explain: 'Der Ausreißer vergrößert s, n bleibt gleich. Also steigt auch s / √n.',
          kurz: 'Ein Ausreißer macht den Mittelwert unsicherer.',
          tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        },
      ],
    },
    r: {
      entry: 'se', variant: 0, live: { fn: 'describe', show: ['mean', 'sd', 'se'] },
      tokens: { describe: DESCRIBE, '"mean"': MEAN_VALUE, '"sd"': SD_VALUE, '"se"': SE_VALUE },
      outputMap: [
        { match: 'Mean', atlas: 'x̄', explain: 'Mean ist der Mittelwert, dessen Genauigkeit der Standardfehler beschreibt.' },
        { match: 'SD', atlas: 's', explain: 'SD ist die Standardabweichung s im Zähler der Formel.' },
        { match: 'SE', atlas: 'SE', explain: 'SE heißt standard error, auf Deutsch Standardfehler: s / √n.' },
        N_MAP, MISSING_MAP,
      ],
      check: {
        question: 'Welche Zahl in der Ausgabe ist der Standardfehler? Tippe sie an.', correct: 'SE',
        wrong: { SD: 'Fast! Das ist s, die Streuung der einzelnen Befragten. Der Standardfehler ist s / √n und steht unter SE.', Mean: 'Fast! Das ist der Mittelwert selbst. Wie genau er ist, steht unter SE.', N: 'Fast! N ist die Zahl der Befragten, aus der √n wird. Der Standardfehler steht unter SE.', Missing: 'Fast! Missing zählt fehlende Antworten. Der Standardfehler steht unter SE.' },
      },
    },
    next: {
      next: { id: 'confidence', why: 'Mit dem Standardfehler baust du einen Bereich um den Mittelwert, der den Wert aller Menschen plausibel enthält.' },
      before: [
        { id: 'sd', why: 's steht im Zähler.' },
        { id: 'validn', why: '√n steht im Nenner.' },
        { id: 'sampling', why: 'Die Formel gilt für unabhängige Befragte.' },
      ],
      after: [
        { id: 'confidence', why: 'Mittelwert plus und minus etwa zwei Standardfehler.' },
        { id: 'test_statistic', why: 'Beim t-Test teilt man den Unterschied durch den Standardfehler.' },
        { id: 't_test', why: 'Vergleicht Mittelwerte mit Blick auf ihre Genauigkeit.' },
      ],
      more: [
        { id: 'sampling_distribution', why: 'Der Standardfehler ist die Standardabweichung dieser Verteilung.' },
        { id: 'power', why: 'Kleinere Standardfehler machen Unterschiede leichter erkennbar.' },
      ],
    },
  },

  recode: {
    r: {
      entry: 'recode', variant: 0, live: { fn: 'rec_frequency' },
      tokens: {
        frequency: { sym: 'frequency()', term: T('frequency'), kurz: 'Zählt, wie oft jeder Code vorkommt, mit Prozenten. Mit ihr prüfst du, ob das Umkodieren geklappt hat.', fehler: 'Bei einer Spalte mit vielen verschiedenen Werten, etwa lernzeit, wird die Tabelle sehr lang. frequency() passt zu Antwortcodes.' },
        lernplanung5_umgepolt: { sym: 'lernplanung5_umgepolt', term: 'Neue Variable', kurz: 'Der Name der neuen Spalte. _umgepolt sagt, was mit ihr passiert ist; die alte Spalte bleibt erhalten.', fehler: 'Gibst du der neuen Spalte den alten Namen, überschreibt mutate() die ursprünglichen Antworten.' },
      },
      outputMap: [
        { match: 'mean', atlas: 'Mittelwert der umgepolten Antworten', explain: 'Umpolen spiegelt die Skala an ihrer Mitte, also auch den Mittelwert: Bei 1 bis 5 wird aus x̄ der Wert 6 − x̄.' },
        { match: 'sd', atlas: 'Standardabweichung', explain: 'Die Streuung bleibt beim Umpolen gleich, nur die Richtung dreht sich.' },
        { match: 'skewness', atlas: 'Schiefe', explain: 'Die Schiefe wechselt beim Umpolen nur ihr Vorzeichen.' },
        { match: 'Raw %', atlas: 'Anteil mit Code 1', explain: 'Raw % ist der Anteil an allen Befragten. In der ersten Zeile stehen jetzt die, die vorher Code 5 hatten.' },
      ],
      check: {
        question: 'Welche Zahl zeigt den Mittelwert der umgepolten Antworten? Tippe sie an.', correct: 'mean',
        wrong: { sd: 'Fast! Das ist die Standardabweichung. Sie bleibt beim Umpolen gleich; der Mittelwert steht hinter mean=.', skewness: 'Fast! Das ist die Schiefe; beim Umpolen wechselt nur ihr Vorzeichen. Der Mittelwert steht hinter mean=.', 'Raw %': 'Fast! Das ist der Anteil mit Code 1. Der Mittelwert steht oben hinter mean=.' },
      },
    },
    next: {
      next: { id: 'dummy', why: 'Mit rec() machst du aus einer Kategorie eine Spalte mit 0 und 1.' },
      before: [
        { id: 'labels', why: 'rec() vergibt neue Wertelabels in eckigen Klammern.' },
        { id: 'missing', why: 'Fehlende Angaben bleiben fehlend, wenn keine Regel sie erfasst.' },
      ],
      after: [
        { id: 'dummy', why: 'Eine 0/1-Spalte je Kategorie.' },
        { id: 'item_score', why: 'Umgepolte Fragen gehen gemeinsam in den Skalenwert ein.' },
        { id: 'pomps', why: 'Rechnet Skalen auf 0 bis 100 um.' },
      ],
      more: [
        { id: 'conversion', why: 'Codes in Faktoren mit Antworttexten umwandeln.' },
        { id: 'frequency', why: 'Prüft nach dem Umkodieren, wie oft jeder Code vorkommt.' },
      ],
    },
  },
};
