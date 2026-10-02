// t-Test als Formel als Satz (Prüfgröße mit Reglern). Beispiel: ALLBUS 2023, ungewichtet, Vertrauen in den Bundestag
// (pt03, 1 bis 7) nach Erhebungsgebiet (eastwest). Startwerte auf zwei Nachkommastellen gerundet, damit die Rechnung mit
// den sichtbaren Zahlen aufgeht; R rechnet mit allen Stellen (t = 7.128). Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptTabs, SentenceTemplate } from '../../types';
import { count, close, fixed, num, unit } from '../../format';
import { pt } from '../../../tasks/kit/dist';
import { dfText, often, pText, sig3, welchFor } from './stats';

/** ALLBUS 2023, ungewichtet: Vertrauen in den Bundestag (1 = gar kein, 7 = großes Vertrauen), West und Ost. Aggregate aus R. */
export const VERTRAUEN = {
  west: { n: 2423, mean: 4.08213, sd: 1.591246 },
  ost: { n: 1169, mean: 3.666382, sd: 1.659832 },
  /** mariposa::t_test(pt03, group = eastwest): t(2222.7) = 7.128, p < 0.001, g = 0.258 */
  t: 7.128173, df: 2222.70659, g: 0.258,
} as const;

export type TValues = { 'x̄₁': number; 'x̄₂': number; 's₁': number; 's₂': number; 'n₁': number; 'n₂': number };
export type TStats = TValues & { diff: number; v1: number; v2: number; se: number; t: number; df: number; p: number; d: number };

/** Welch-t-Test aus Mittelwerten, Standardabweichungen und Gruppengrößen; d mit der gepoolten Standardabweichung. */
export function welchFromSummary(v: TValues): TStats {
  const v1 = v['s₁'] ** 2 / v['n₁'], v2 = v['s₂'] ** 2 / v['n₂'], se = Math.sqrt(v1 + v2), diff = v['x̄₁'] - v['x̄₂'], t = diff / se;
  const df = (v1 + v2) ** 2 / (v1 * v1 / (v['n₁'] - 1) + v2 * v2 / (v['n₂'] - 1));
  const pooled = Math.sqrt(((v['n₁'] - 1) * v['s₁'] ** 2 + (v['n₂'] - 1) * v['s₂'] ** 2) / (v['n₁'] + v['n₂'] - 2));
  return { ...v, diff, v1, v2, se, t, df, p: 2 * pt(-Math.abs(t), df), d: diff / pooled };
}

/** Startwerte: die ALLBUS-Werte auf zwei Nachkommastellen. */
const START: TValues = { 'x̄₁': 4.08, 'x̄₂': 3.67, 's₁': 1.59, 's₂': 1.66, 'n₁': VERTRAUEN.west.n, 'n₂': VERTRAUEN.ost.n };
const points = (v: number) => unit(v, 'Punkt', 'Punkte');
/**
 * Freiheitsgrade nach Welch für den Satz in der Fachsprache: Mit den Streuungen und Gruppengrößen der Startwerte die
 * exakten aus R (2.222,7, wie unter „Genau genommen“), sonst die aus den eingestellten Werten.
 */
const exactDf = (s: TStats) => s['s₁'] === START['s₁'] && s['s₂'] === START['s₂'] && s['n₁'] === START['n₁'] && s['n₂'] === START['n₂'] ? VERTRAUEN.df : s.df;
/** Größe des Unterschieds nach der Faustregel von Cohen (0,2 klein, 0,5 mittel, 0,8 groß). */
const size = (d: number) => { const a = Math.abs(d); return a < 0.2 ? 'sehr klein' : a < 0.5 ? 'klein' : a < 0.8 ? 'mittel' : 'groß'; };

export const tTestSentence: SentenceTemplate<TValues, TStats> = {
  concept: 't_test',
  wofuer: 'Im ALLBUS 2023 sagen 2.423 Befragte aus Westdeutschland, wie sehr sie dem Bundestag vertrauen: von 1 (gar kein Vertrauen) bis 7 (großes Vertrauen). Im Mittel sind es 4,08 Punkte. Die 1.169 Befragten aus Ostdeutschland kommen auf 3,67 Punkte (ungewichtet). Ist dieser Unterschied größer, als der Zufall einer Stichprobe erwarten lässt?',
  kurz: 'Der t-Test sagt dir, wie groß der Unterschied zweier Gruppenmittel im Vergleich zu seinem üblichen Schwanken ist. Je weiter t von 0 entfernt ist, desto schlechter passt der Unterschied zum Zufall allein.',
  fachlich: 'Die Differenz zweier Gruppenmittelwerte geteilt durch ihren geschätzten Standardfehler; nach Welch geht die Varianz jeder Gruppe geteilt durch ihre Größe ein.',
  initial: START,
  compute: welchFromSummary,
  metrics: [
    { label: 'Unterschied x̄₁ − x̄₂', value: s => points(s.diff) },
    { label: 'Standardfehler SE', value: s => sig3(s.se) },
    { label: 'Prüfgröße t', value: s => num(s.t) },
    { label: 'p-Wert', value: s => pText(s.p).replace(/^p /, '') },
    { label: 'Effektgröße d', value: s => num(s.d) },
  ],
  glyphs: [
    { key: 't', sym: 't', say: 't', term: 'Prüfgröße & Referenzverteilung', plain: 'der Unterschied, gemessen in Standardfehlern', concept: 'test_statistic' },
    { key: 'x̄₁', sym: 'x̄₁', say: 'x quer eins', term: 'Arithmetisches Mittel', plain: 'die Mitte der ersten Gruppe, hier Westdeutschland', concept: 'mean' },
    { key: 'x̄₂', sym: 'x̄₂', say: 'x quer zwei', term: 'Arithmetisches Mittel', plain: 'die Mitte der zweiten Gruppe, hier Ostdeutschland', concept: 'mean' },
    { key: 'SE', sym: 'SE', say: 'S E', term: 'Standardfehler', plain: 'wie stark der Unterschied von Stichprobe zu Stichprobe schwanken würde', concept: 'se' },
    { key: 's₁', sym: 's₁', say: 's eins', term: 'Standardabweichung', plain: 'wie verschieden die Antworten in der ersten Gruppe sind', concept: 'sd' },
    { key: 's₂', sym: 's₂', say: 's zwei', term: 'Standardabweichung', plain: 'wie verschieden die Antworten in der zweiten Gruppe sind', concept: 'sd' },
    { key: 'n₁', sym: 'n₁', say: 'n eins', term: 'Fallzahl', plain: 'wie viele Befragte in der ersten Gruppe gültig geantwortet haben' },
    { key: 'n₂', sym: 'n₂', say: 'n zwei', term: 'Fallzahl', plain: 'wie viele Befragte in der zweiten Gruppe gültig geantwortet haben' },
  ],
  symbolic: [{ part: ['t'], m: 't' }, ' = ', {
    frac: [{ part: ['x̄₁'], m: 'x̄₁' }, ' − ', { part: ['x̄₂'], m: 'x̄₂' }],
    den: [{ big: '√', m: 'SE' }, { root: [{ part: ['s₁²'], m: 's₁' }, ' / ', { part: ['n₁'], m: 'n₁' }, ' + ', { part: ['s₂²'], m: 's₂' }, ' / ', { part: ['n₂'], m: 'n₂' }], m: 'SE' }],
    m: 'SE',
  }],
  aria: 't gleich x quer eins minus x quer zwei, geteilt durch die Wurzel aus s eins Quadrat durch n eins plus s zwei Quadrat durch n zwei',
  numeric: s => [{ part: ['t'], m: 't' }, ' = (', { part: [fixed(s['x̄₁'])], m: 'x̄₁' }, ' − ', { part: [fixed(s['x̄₂'])], m: 'x̄₂' }, ') / √(',
    { part: [`${num(s['s₁'])}²`], m: 's₁' }, ' / ', { part: [count(s['n₁'])], m: 'n₁' }, ' + ', { part: [`${num(s['s₂'])}²`], m: 's₂' }, ' / ', { part: [count(s['n₂'])], m: 'n₂' }, ')',
    { br: true }, `= ${num(s.diff)} / `, { part: [sig3(s.se)], m: 'SE' }, ` ≈ ${num(s.t)}`],
  sentence: [{ m: 't', t: 't' }, ' ist ', { m: 'x̄₁', t: 'die Mitte der ersten Gruppe' }, ' minus ', { m: 'x̄₂', t: 'die Mitte der zweiten Gruppe' }, ', geteilt durch ',
    { m: 'SE', t: 'den Standardfehler dieses Unterschieds' }, '. Der Standardfehler entsteht aus ', { m: 's₁', t: 'der Streuung' }, ' und ', { m: 'n₁', t: 'der Größe' }, ' jeder Gruppe.'],
  worked: s => [
    { title: 'Die beiden Mitten voneinander abziehen', text: `${fixed(s['x̄₁'])} − ${fixed(s['x̄₂'])} = ${num(s.diff)}.` },
    { title: 'Jede Streuung durch die Größe ihrer Gruppe teilen', text: `${num(s['s₁'])}² / ${count(s['n₁'])} ≈ ${sig3(s.v1)} und ${num(s['s₂'])}² / ${count(s['n₂'])} ≈ ${sig3(s.v2)}.` },
    { title: 'Zusammenzählen und die Wurzel ziehen', text: `√(${sig3(s.v1)} + ${sig3(s.v2)}) ≈ ${sig3(s.se)}. Das ist der Standardfehler des Unterschieds.` },
    { title: 'Den Unterschied durch den Standardfehler teilen', text: `${num(s.diff)} / ${sig3(s.se)} ≈ ${num(s.t)}.` },
  ],
  fehler: 'Teilst du den Unterschied durch die Standardabweichung statt durch den Standardfehler, bekommst du die Effektgröße d, nicht t. Das passiert vielen. Merksatz: t teilt durch das Schwanken des Unterschieds, d durch das Schwanken der Menschen.',
  sliders: [
    { key: 'x̄₁', label: 'Mittelwert West', min: 1, max: 7, step: 0.01, format: v => `${fixed(v)} Punkte` },
    { key: 'x̄₂', label: 'Mittelwert Ost', min: 1, max: 7, step: 0.01, format: v => `${fixed(v)} Punkte` },
    { key: 's₁', label: 'Standardabweichung West', min: 0.5, max: 3, step: 0.01, format: v => num(v) },
    { key: 's₂', label: 'Standardabweichung Ost', min: 0.5, max: 3, step: 0.01, format: v => num(v) },
    { key: 'n₁', label: 'Befragte West', min: 10, max: 10000, step: 1, log: true, format: v => count(v) },
    { key: 'n₂', label: 'Befragte Ost', min: 10, max: 10000, step: 1, log: true, format: v => count(v) },
  ],
  quick: [
    { label: 'beide Gruppen durch 100', mark: 'n₁', apply: v => ({ ...v, 'n₁': Math.max(10, Math.round(v['n₁'] / 100)), 'n₂': Math.max(10, Math.round(v['n₂'] / 100)) }) },
    { label: 'beide Gruppen mal 4', mark: 'n₂', apply: v => ({ ...v, 'n₁': Math.min(10000, v['n₁'] * 4), 'n₂': Math.min(10000, v['n₂'] * 4) }) },
    { label: 'Unterschied halbieren', mark: 'x̄₂', apply: v => ({ ...v, 'x̄₂': Math.round((v['x̄₁'] - (v['x̄₁'] - v['x̄₂']) / 2) * 100) / 100 }) },
    { label: 'ALLBUS-Werte', mark: 'x̄₁', apply: () => ({ ...START }) },
  ],
  compare: s => `Der Unterschied ist ${points(s.diff)}, sein Standardfehler ${sig3(s.se)}. Mehr Befragte verkleinern den Standardfehler, der Unterschied bleibt: t ≈ ${num(s.t)}.`,
  check: {
    question: 'Der Unterschied der beiden Mitten ist 0,4 Punkte, sein Standardfehler 0,2. Wie groß ist t?',
    answer: 2, tolerance: 0.011,
    right: 'Genau, 2: 0,4 / 0,2 = 2. Der Unterschied ist zwei Standardfehler groß.',
    diagnose: v => close(v, 0.08) ? 'Fast! Du hast malgenommen. t ist der Unterschied geteilt durch den Standardfehler.'
      : close(v, 0.5) ? 'Fast! Andersherum: Der Unterschied steht oben, der Standardfehler unten.'
      : close(v, 0.4) ? 'Fast! Das ist noch der Unterschied selbst. Jetzt noch durch 0,2 teilen.'
      : close(v, -2) ? 'Fast! Das Vorzeichen stimmt nicht. Die erste Mitte ist größer, also ist auch t positiv.'
      : 'Noch nicht ganz. Teile den Unterschied 0,4 durch den Standardfehler 0,2.',
  },
  interpret: s => ({
    kurz: Math.abs(s.diff) < 0.005
      ? 'Beide Gruppen haben dieselbe Mitte, t ist 0. Genau das erwartet man, wenn es keinen Unterschied gibt.'
      : `Gäbe es in der Bevölkerung keinen Unterschied, wäre ein so großes t ${often(s.p)} Stichproben zu erwarten (${pText(s.p)}). Mit d ≈ ${num(Math.abs(s.d))} ist der Unterschied nach der Faustregel von Cohen ${size(s.d)}.`,
    fachlich: `Welch-t-Test, zweiseitig: t ≈ ${num(s.t)} bei ${dfText(exactDf(s))} Freiheitsgraden, ${pText(s.p)}; Cohens d ≈ ${num(s.d)}. Signifikant zum Niveau α = 0,05 heißt hier p < 0,05${s.p < 0.05 ? ', und das ist erfüllt' : ', und das ist nicht erfüllt'}.`,
  }),
  think: {
    question: 'Beide Gruppen haben nur noch ein Hundertstel ihrer Befragten, Mitten und Streuungen bleiben gleich. Was passiert mit t?',
    options: ['bleibt gleich', 'etwa ein Zehntel so groß', 'ein Hundertstel so groß'], correct: 1, mark: 'n₁',
    explain: 'Die Fallzahl steht unter der Wurzel: Ein Hundertstel der Befragten macht den Standardfehler √100 = 10-mal so groß. t schrumpft deshalb auf etwa ein Zehntel, der Unterschied selbst bleibt.',
    kurz: 'Derselbe Unterschied ist mit wenigen Befragten viel unsicherer.',
    hint: 'Probier oben „beide Gruppen durch 100“ aus.',
  },
  genau: {
    kurz: 'Diese Formel ist der Welch-t-Test, den mariposa standardmäßig rechnet. Er braucht keine gleichen Streuungen in beiden Gruppen.',
    paragraphs: [
      `R rechnet mit allen Nachkommastellen und meldet für die ALLBUS-Daten t(2222.7) = 7.128, p < 0.001 und g = 0.258. Mit den gerundeten Werten oben kommt t ≈ ${num(welchFromSummary(START).t)} heraus; der Unterschied liegt allein an der Rundung. Die Freiheitsgrade unter „Was heißt das Ergebnis?“ sind die von R: ${dfText(VERTRAUEN.df)}.`,
      'Welch-t-Test heißt: Jede Gruppe bringt ihre eigene Varianz mit, und die Freiheitsgrade sind meist keine ganze Zahl. Mit var.equal = TRUE rechnet mariposa den Student-t-Test, der eine gemeinsame Varianz beider Gruppen annimmt.',
      'Der Test nimmt unabhängige Befragte an. Die Gruppenmittelwerte sollen annähernd normalverteilt sein; bei großen Gruppen ist das meist erfüllt, als Faustregel ab etwa 30 Personen je Gruppe. Bei kleinen Gruppen brauchen die Werte selbst eine annähernd normale Form.',
      'Die Vertrauensskala wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Abstände zwischen den Stufen sollen gleiche Abstände im Vertrauen bedeuten. Der ALLBUS befragt Ostdeutschland überproportional; für den Vergleich der beiden Gruppen ist das unproblematisch, für Aussagen über ganz Deutschland würde man gewichten.',
      'Für verbundene Messungen derselben Personen hat mariposa kein paired-Argument. Du bildest zuerst die Differenzen und testest sie gegen 0 (Begriff „Gepaarte Differenzen“).',
    ],
  },
};

/** Lernzeit nach Weiterbildung, ein Satz für die Ergebnisse des Reiters (Richtung wie R: ohne minus mit). */
export const tTestTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
    kurz: 'Derselbe Test mit allen 200 Befragten: Lernen Befragte mit Weiterbildung im Schnitt anders lange als die ohne?',
    value: c => welchFor(c)?.t ?? null,
    result: c => {
      const w = welchFor(c);
      if (!w) return { kurz: 'In einer der beiden Gruppen streut die Lernzeit nicht. Dann lässt sich kein t-Test rechnen.', fachlich: 'Der Welch-t-Test braucht in beiden Gruppen mindestens zwei verschiedene Werte.' };
      return {
        kurz: `Ohne Weiterbildung haben die Befragten in den letzten sieben Tagen im Schnitt ${num(w.m0)} Stunden gelernt, mit Weiterbildung ${num(w.m1)} Stunden. Das sind ${num(Math.abs(w.diff))} Stunden Unterschied oder ${num(Math.abs(w.t))} Standardfehler. Gäbe es keinen Unterschied, käme ein mindestens so großes t ${often(w.p)} Stichproben vor (${pText(w.p)}).`,
        fachlich: `Welch-t-Test, zweiseitig, in der Richtung von R (ohne minus mit Weiterbildung): ${num(w.diff)} h, SE ≈ ${sig3(w.se)} h, t ≈ ${num(w.t)} bei ${dfText(w.df)} Freiheitsgraden, ${pText(w.p)}, Hedges' g ≈ ${num(w.g)}.`,
        zusatz: `${w.n0} Befragte haben in den letzten zwölf Monaten keine Weiterbildung gemacht, ${w.n1} schon.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an. Bei mehr als 30 Personen je Gruppe sind die Gruppenmittel meist annähernd normalverteilt, als Faustregel.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit t?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1,
        explain: 'Der Unterschied verdoppelt sich, der Standardfehler auch. t ist ihr Verhältnis und bleibt deshalb gleich.',
        kurz: 't hängt nicht von der Einheit ab.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Lernzeit wird umgepolt: 60 Stunden minus der eigene Wert. Was passiert mit t?', options: ['bleibt genau gleich', 'nur das Vorzeichen dreht sich', 'wird viel größer'], correct: 1,
        explain: 'Wer vorher mehr gelernt hat, hat jetzt den kleineren Wert. Der Unterschied dreht seine Richtung, die Streuungen bleiben. Deshalb wechselt nur das Vorzeichen von t.',
        kurz: 'Das Vorzeichen von t zeigt die Richtung, der Betrag die Größe.',
        tryIt: { label: 'Lernzeit umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit t?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Beide Gruppen rücken um dieselbe Stunde. Der Unterschied zwischen ihnen bleibt, die Streuung auch.',
        kurz: 'Verschieben ändert nichts am Vergleich.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 0,
    tokens: {
      t_test: { sym: 't_test()', term: 't-Test', kurz: 'Vergleicht die Mittelwerte zweier Gruppen. Kurz meldet R t mit den Freiheitsgraden, p, die Effektgröße g und N.', fehler: 't_test() vergleicht genau zwei Gruppen. Bei mehr Gruppen meldet mariposa: must have exactly 2 groups.' },
    },
    outputMap: [
      { match: 't', atlas: 'Prüfgröße t', explain: 'Der Unterschied ohne minus mit Weiterbildung, geteilt durch seinen Standardfehler. In Klammern stehen die Freiheitsgrade nach Welch.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es keinen Unterschied, wäre ein mindestens so großes t in etwa 88 von 100 Stichproben zu erwarten.' },
      { match: 'g', atlas: 'Effektgröße', explain: 'g misst den Unterschied in Standardabweichungen. negligible heißt vernachlässigbar.' },
      { match: 'N', atlas: 'n₁ + n₂', explain: 'N zählt die Befragten beider Gruppen zusammen: 118 ohne und 82 mit Weiterbildung.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist die Prüfgröße t? Tippe sie an.', correct: 't',
      wrong: { p: 'Fast! Das ist der p-Wert. Er entsteht erst aus t und den Freiheitsgraden.', g: 'Fast! Das ist die Effektgröße g. Sie teilt durch die Streuung der Menschen, t durch den Standardfehler.', N: 'Fast! N zählt die Befragten. t steht direkt hinter t(175.8) =.' },
    },
  },
  next: {
    next: { id: 'p_value', why: 'Wie überraschend wäre dein t, wenn es keinen Unterschied gäbe? Diese Frage beantwortet p.' },
    before: [
      { id: 'mean', why: 'Die beiden Gruppenmittel, deren Unterschied der Test misst.' },
      { id: 'se', why: 'Das übliche Schwanken eines Mittelwerts, aus dem der Nenner entsteht.' },
      { id: 'test_statistic', why: 't ist eine Prüfgröße mit der t-Verteilung als Bezug.' },
    ],
    after: [
      { id: 'effect', why: 'Wie groß der Unterschied ist, sagt t nicht. Dafür gibt es d und g.' },
      { id: 'oneway_anova', why: 'Vergleicht die Mittelwerte von mehr als zwei Gruppen auf einmal.' },
      { id: 'paired_difference', why: 'Der t-Test für dieselben Personen zu zwei Zeitpunkten.' },
    ],
    more: [
      { id: 'variance_assumption', why: 'Was var.equal = TRUE annimmt und warum Welch der Standard ist.' },
      { id: 'mann_whitney', why: 'Vergleicht zwei Gruppen über Ränge, wenn Mittelwerte nicht passen.' },
      { id: 'confidence', why: 'Zeigt, wie groß der Unterschied plausibel sein könnte.' },
    ],
  },
};
