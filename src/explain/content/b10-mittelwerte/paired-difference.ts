// Werkstatt „Gepaarte Differenzen“: der gepaarte t-Test mit fünf Personen, die einen Wissenstest zweimal lösen.
// Beide Voreinstellungen haben dieselbe mittlere Veränderung (+2), aber verschieden einheitliche Veränderungen.
// Reiter: dieselbe Rechnung mit allen 200 Befragten (wissenstest, wissenstest_t2). Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptTabs, Ctx, FNode, Workshop } from '../../types';
import type { Pairs } from '../../math';
import { close, num, paren, signed, unit } from '../../format';
import { pt } from '../../../tasks/kit/dist';
import { eq, often, pairedFor, pText, sig3 } from './stats';

export type PairedStats = {
  xs: number[]; ys: number[]; d: number[]; n: number; sum: number; mean: number; absMean: number;
  dev: number[]; sq: number[]; ss: number; variance: number; sd: number; sdX: number; root: number; se: number;
  /** null, wenn alle Veränderungen gleich sind (s = 0). */
  t: number | null; df: number; p: number | null; meanX: number; meanY: number;
};

export function pairedStats(data: Pairs): PairedStats {
  const xs = [...data.x], ys = [...data.y], n = xs.length, d = ys.map((y, i) => y - xs[i]);
  const sum = d.reduce((a, b) => a + b, 0), mean = sum / n, dev = d.map(v => v - mean), sq = dev.map(v => v * v);
  const ss = sq.reduce((a, b) => a + b, 0), variance = ss / (n - 1), sd = Math.sqrt(variance), root = Math.sqrt(n), se = sd / root;
  const meanX = xs.reduce((a, b) => a + b, 0) / n, meanY = ys.reduce((a, b) => a + b, 0) / n;
  const sdX = Math.sqrt(xs.reduce((a, v) => a + (v - meanX) ** 2, 0) / (n - 1));
  const t = se > 1e-12 ? mean / se : null;
  return {
    xs, ys, d, n, sum, mean, absMean: d.reduce((a, v) => a + Math.abs(v), 0) / n, dev, sq, ss, variance, sd, sdX, root, se,
    t, df: n - 1, p: t === null ? null : 2 * pt(-Math.abs(t), n - 1), meanX, meanY,
  };
}

type C = Ctx<PairedStats>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const tasks = (v: number) => unit(v, 'Aufgabe', 'Aufgaben');
/**
 * Gehen die sichtbaren, gerundeten Zahlen nicht auf (`fromShown` ist die Rechnung mit ihnen), sagt der Text, dass mit
 * allen Nachkommastellen gerechnet wurde.
 */
const exactNote = (fromShown: number, result: number, fmt: (v: number) => string) => fmt(fromShown) !== fmt(result) ? ' Mit allen Nachkommastellen gerechnet.' : '';
const r2 = (v: number) => Math.round(v * 100) / 100;
/** Auf drei gültige Ziffern gerundet, wie sig3 es zeigt. */
const r3 = (v: number) => Math.abs(v) >= 1 ? r2(v) : Number(v.toPrecision(3));

const FIRST = [12, 9, 14, 10, 7];

export const paarWerkstatt: Workshop<Pairs, PairedStats> = {
  id: 'b10-paare',
  wofuer: 'Fünf Personen lösen einen Wissenstest mit 20 Aufgaben zweimal, zu zwei Zeitpunkten. Haben sie beim zweiten Mal mehr gelöst? Die Personen sind sehr verschieden gut. Der gepaarte t-Test schaut deshalb nur auf die Veränderung jeder einzelnen Person.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus fünf kleinen Schritten, die du alle schon kannst: abziehen, die Mitte finden, die Streuung messen, teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b10-paare',
  names: NAMES,
  bounds: { min: 0, max: 20 },
  presets: [
    { id: 'gemischt', label: 'Mal mehr, mal weniger: +2 im Schnitt', data: { x: FIRST, y: [10, 12, 17, 13, 10] } },
    { id: 'einheitlich', label: 'Alle ähnlich: +2 im Schnitt', data: { x: FIRST, y: [13, 11, 16, 12, 10] } },
  ],
  compute: pairedStats,
  glyphs: [
    { sym: 'xᵢ', say: 'x i', term: 'Beobachtung', plain: 'gelöste Aufgaben von Person i beim ersten Test', step: 1 },
    { sym: 'yᵢ', say: 'y i', term: 'Beobachtung', plain: 'gelöste Aufgaben von Person i beim zweiten Test', step: 1 },
    { sym: 'dᵢ', say: 'd i', term: 'Gepaarte Differenz', plain: 'die Veränderung von Person i: zweiter minus erster Test', step: 1 },
    { sym: 'd̄', say: 'd quer', term: 'Arithmetisches Mittel', plain: 'die mittlere Veränderung der fünf', step: 2 },
    { sym: 's', say: 's', term: 'Standardabweichung', plain: 'wie verschieden die Veränderungen sind', step: 3 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 4 },
    { sym: '√', say: 'Wurzel', term: 'Quadratwurzel', plain: 'welche Zahl ergibt mal sich selbst n?', step: 4 },
    { sym: 'SE', say: 'S E', term: 'Standardfehler', plain: 'wie stark d̄ von Stichprobe zu Stichprobe schwanken würde', step: 4 },
    { sym: 't', say: 't', term: 'Prüfgröße', plain: 'die mittlere Veränderung, gemessen in Standardfehlern', step: 5 },
  ],
  steps: [
    {
      button: 'dᵢ', title: 'Die Veränderung jeder Person ausrechnen', sym: 'dᵢ', say: 'd i', concept: 'paired_difference', perPerson: true,
      was: 'Für jede Person rechnen wir: zweiter Test minus erster Test. Plus heißt, sie hat beim zweiten Mal mehr Aufgaben gelöst.',
      rechnung: c => `Person ${P(c)}: ${c.s.ys[c.who]} − ${c.s.xs[c.who]} = ${signed(c.s.d[c.who])}`,
      fach: 'Die gepaarte Differenz dᵢ = yᵢ − xᵢ: der spätere minus der frühere Wert derselben Person.',
      warum: 'So vergleicht sich jede Person mit sich selbst. Wie gut jemand überhaupt ist, fällt dabei heraus.',
      acht: 'Die Richtung festhalten: immer später minus früher. Wer andersherum rechnet, bekommt dieselben Zahlen mit umgedrehtem Vorzeichen.',
      check: {
        question: c => `Um wie viele Aufgaben hat sich Person ${P(c)} verändert? Mit Vorzeichen.`,
        answer: c => c.s.d[c.who],
        diagnose: (c, v) => v !== 'NA' && Math.abs(c.s.d[c.who]) > 1e-9 && close(v, -c.s.d[c.who])
          ? 'Fast! Die Größe stimmt, nur die Richtung nicht. Rechne zweiter Test minus erster Test.' : null,
      },
    },
    {
      button: 'd̄', title: 'Die mittlere Veränderung finden', sym: 'd̄', say: 'd quer', concept: 'mean', perPerson: false,
      was: 'Wir zählen die fünf Veränderungen zusammen und teilen durch fünf.',
      rechnung: c => `(${c.s.d.map(v => paren(v)).join(' + ')}) / 5 = ${num(c.s.sum)} / 5 = ${num(c.s.mean)}`,
      fach: 'd̄ ist das arithmetische Mittel der Differenzen. Es ist gleich dem Mittel des zweiten Tests minus dem Mittel des ersten.',
      warum: 'd̄ sagt, um wie viele Aufgaben sich die fünf im Schnitt verändert haben. Genau diesen Unterschied prüft der Test.',
      acht: 'Plus und Minus bleiben stehen. Wer nur die Beträge mittelt, macht aus jeder Verschlechterung eine Verbesserung.',
      check: {
        question: 'Um wie viele Aufgaben haben sich die fünf im Schnitt verändert?',
        answer: c => c.s.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : Math.abs(c.s.sum) > 1e-9 && close(v, c.s.sum) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.'
          : Math.abs(c.s.absMean - c.s.mean) > 0.02 && close(v, c.s.absMean) ? 'Fast! Du hast die Minuszeichen weggelassen. Eine Verschlechterung zählt mit ihrem Minus.'
          : Math.abs(c.s.sum) > 1e-9 && close(v, c.s.sum / 4) ? 'Fast! Du hast durch 4 geteilt. Für die Mitte teilst du durch alle fünf.'
          : null,
      },
    },
    {
      button: 's', title: 'Die Streuung der Veränderungen messen', sym: 's', say: 's', concept: 'sd', perPerson: true,
      links: [{ id: 'variance', label: 'Varianz' }],
      was: 'Wie in der Werkstatt Streuung: Abstände zu d̄ quadrieren, zusammenzählen, durch n − 1 = 4 teilen, Wurzel ziehen.',
      rechnung: c => `Person ${P(c)}: (${signed(c.s.d[c.who])} − ${paren(c.s.mean)})² = ${num(c.s.sq[c.who])}. Alle fünf: s = √(${num(c.s.ss)} / 4) = √${num(c.s.variance)} ≈ ${num(c.s.sd)}.`,
      fach: 'Die Standardabweichung der Differenzen: s = √(Σ(dᵢ − d̄)² / (n − 1)).',
      warum: 'Verändern sich alle ähnlich, ist s klein. Dann fällt schon eine kleine mittlere Veränderung auf.',
      acht: 'Gerechnet wird mit den Veränderungen, nicht mit den Testwerten. Die Testwerte streuen stark, weil die Personen verschieden gut sind.',
      check: {
        question: 'Wie groß ist die Standardabweichung der fünf Veränderungen? Zwei Nachkommastellen reichen.',
        answer: c => c.s.sd,
        diagnose: (c, v) => v === 'NA' || c.s.sd < 1e-9 ? null
          : Math.abs(c.s.variance - c.s.sd) > 0.02 && close(v, c.s.variance) ? 'Fast! Das ist noch die Zahl vor der Wurzel.'
          : close(v, Math.sqrt(c.s.ss / 5)) ? 'Fast! Du hast durch 5 geteilt. Bei der Streuung teilst du durch n − 1 = 4.'
          : Math.abs(c.s.sdX - c.s.sd) > 0.02 && close(v, c.s.sdX) ? 'Fast! Das ist die Streuung der ersten Testwerte. Gefragt ist die Streuung der Veränderungen.'
          : null,
      },
    },
    {
      button: 's / √n', title: 'Die Genauigkeit der mittleren Veränderung bestimmen', sym: 'SE', say: 'S E', concept: 'se', perPerson: false,
      was: 'Wir teilen s durch die Wurzel aus der Zahl der Personen. Das Ergebnis heißt Standardfehler.',
      rechnung: c => `SE = ${num(c.s.sd)} / √5 ≈ ${num(c.s.sd)} / ${num(c.s.root)} ${eq(c.s.se)} ${sig3(c.s.se)}.${exactNote(r2(c.s.sd) / r2(c.s.root), c.s.se, sig3)}`,
      fach: 'SE = s / √n: wie stark d̄ von Stichprobe zu Stichprobe schwanken würde.',
      warum: 'Mit mehr Personen wird die mittlere Veränderung genauer. Das bringt die Wurzel aus n in die Rechnung.',
      acht: 'Geteilt wird durch √n, nicht durch n. Wer durch 5 teilt, bekommt einen zu kleinen Standardfehler.',
      check: {
        question: 'Und jetzt s durch √5 teilen? Zwei Nachkommastellen reichen.',
        answer: c => c.s.se,
        diagnose: (c, v) => v === 'NA' || c.s.sd < 1e-9 ? null
          : close(v, c.s.sd / 5) ? 'Fast! Du hast durch 5 geteilt. Geteilt wird durch √5, also durch etwa 2,24.'
          : close(v, c.s.sd) ? 'Fast! Das ist noch s. Jetzt noch durch √5 teilen.'
          : null,
      },
    },
    {
      button: 't', title: 'Die Veränderung am Schwanken messen', sym: 't', say: 't', concept: 't_test', perPerson: false,
      was: 'Wir teilen die mittlere Veränderung durch ihren Standardfehler. Das Ergebnis heißt t.',
      rechnung: c => c.s.t === null ? 'Alle Veränderungen sind gleich, der Standardfehler ist 0. Durch 0 lässt sich nicht teilen.'
        : `t = ${num(c.s.mean)} / ${sig3(c.s.se)} ${eq(c.s.t)} ${num(c.s.t)}.${exactNote(r2(c.s.mean) / r3(c.s.se), c.s.t, v => num(v))}`,
      fach: 't = d̄ / SE mit n − 1 = 4 Freiheitsgraden. Das ist der gepaarte t-Test: ein t-Test für eine Stichprobe, die Differenzen.',
      warum: 't misst die mittlere Veränderung in Standardfehlern. Je weiter t von 0 entfernt ist, desto schlechter passt das Ergebnis zur Annahme, dass sich im Mittel nichts verändert.',
      acht: 'Ein großes t heißt nicht, dass sich jede Person verbessert hat. Es sagt etwas über die mittlere Veränderung.',
      check: {
        question: 'Wie groß ist t?',
        answer: c => c.s.t ?? 'NA',
        diagnose: (c, v) => v === 'NA' || c.s.t === null ? null
          : Math.abs(c.s.sd - c.s.se) > 0.02 && close(v, c.s.mean / c.s.sd) ? 'Fast! Du hast durch s geteilt. Geteilt wird durch den Standardfehler aus Schritt 4.'
          : Math.abs(c.s.mean) > 1e-9 && close(v, c.s.se / c.s.mean) ? 'Fast! Andersherum: Die mittlere Veränderung steht oben, der Standardfehler unten.'
          : null,
      },
    },
  ],
  numeric: (c, last): FNode[] => [
    't = ', { part: [num(c.s.mean)], m: 2 }, ' / (', { part: [num(c.s.sd)], m: 3 }, ' / ', { part: ['√5'], m: 4 }, ')',
    { br: true }, '= ', { part: [num(c.s.mean)], m: 2 }, ' / ', { part: [sig3(c.s.se)], m: 4 }, ' ',
    ...(c.s.t === null ? ['(nicht definiert)'] : [`${eq(c.s.t)} `, { part: [num(c.s.t)], m: last }] as FNode[]),
  ],
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.xs[i]) },
      { head: 'yᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.ys[i]) },
      { head: 'dᵢ = yᵢ − xᵢ', from: 1, active: [1, 2], cell: (c, i) => signed(c.s.d[i]), sum: c => num(c.s.sum), sumFrom: 2, tone: (c, i) => c.s.d[i] > 0 ? 'pos' : c.s.d[i] < 0 ? 'neg' : undefined },
      { head: 'dᵢ − d̄', from: 3, active: [3], cell: (c, i) => signed(c.s.dev[i]), sum: () => '0', sumFrom: 3, sumNote: 'immer' },
      { head: '(dᵢ − d̄)²', from: 3, active: [3], cell: (c, i) => num(c.s.sq[i]), sum: c => num(c.s.ss), sumFrom: 3 },
    ],
    lines: [
      { from: 2, step: 2, text: c => `d̄ = ${num(c.s.sum)} / 5 = ${num(c.s.mean)}` },
      { from: 3, step: 3, text: c => `s = √(${num(c.s.ss)} / 4) ≈ ${num(c.s.sd)}` },
      { from: 4, step: 4, text: c => `SE = ${num(c.s.sd)} / √5 ${eq(c.s.se)} ${sig3(c.s.se)}` },
      { from: 5, step: 5, text: c => c.s.t === null ? 't ist nicht definiert, weil SE = 0 ist.' : `t = ${num(c.s.mean)} / ${sig3(c.s.se)} ${eq(c.s.t)} ${num(c.s.t)}` },
    ],
  },
  captions: {
    1: 'Je Person der erste Test (1) und der zweite (2); der Pfeil ist ihre Veränderung. Du kannst beide Punkte ziehen.',
    2: 'Unten die fünf Veränderungen. Die gestrichelte Linie ist ihre Mitte d̄.',
    3: 'Das Band reicht von d̄ − s bis d̄ + s: So weit streuen die Veränderungen.',
    4: 'Der Standardfehler ist viel schmaler als das Band, weil fünf Personen zusammen genauer sind als eine.',
    5: 't zählt, wie viele Standardfehler d̄ von 0 entfernt ist.',
  },
  think: [
    {
      question: 'Beide Voreinstellungen haben im Schnitt +2 Aufgaben. In welcher ist t größer?', options: ['bei „Mal mehr, mal weniger“', 'bei „Alle ähnlich“', 'in beiden gleich'], correct: 1, step: 3,
      explain: 'Wenn sich alle ähnlich verändern, ist s klein und damit auch der Standardfehler. Dieselben +2 Aufgaben sind dann viele Standardfehler groß.',
      kurz: 'Einheitliche Veränderungen machen denselben Unterschied deutlicher.',
      tryIt: { label: 'Alle ähnlich', apply: () => ({ x: FIRST, y: [13, 11, 16, 12, 10] }) },
    },
    {
      question: 'Alle fünf lösen beim ersten Test eine Aufgabe mehr, der zweite bleibt. Was passiert mit d̄?', options: ['bleibt gleich', 'sinkt um 1', 'steigt um 1'], correct: 1, step: 2,
      explain: 'Jede Veränderung yᵢ − xᵢ wird um 1 kleiner, also auch ihre Mitte. s bleibt gleich, denn alle rücken gemeinsam.',
      kurz: 'Eine gemeinsame Verschiebung ändert d̄, nicht s.',
      tryIt: { label: 'erster Test eine Aufgabe mehr', apply: d => ({ x: d.x.map(v => Math.min(20, v + 1)), y: d.y }) },
    },
    {
      question: 'Alle fünf verbessern sich um genau 2 Aufgaben. Was passiert mit t?', options: ['wird sehr groß', 'lässt sich nicht berechnen', 'wird 0'], correct: 1, step: 5,
      explain: 'Alle Veränderungen sind gleich, also ist s = 0 und auch der Standardfehler. Durch 0 lässt sich nicht teilen. In echten Daten kommt das kaum vor.',
      kurz: 'Ohne Streuung gibt es kein Schwanken, an dem man messen kann.',
      tryIt: { label: 'alle genau +2', apply: d => ({ x: d.x, y: d.x.map(v => Math.min(20, v + 2)) }) },
    },
    {
      question: 'Was passiert mit t, wenn du die beiden Tests wie zwei fremde Gruppen vergleichst?', options: ['t wird kleiner', 't bleibt gleich', 't wird größer'], correct: 0, step: 3,
      explain: c => `Dann zählt das Schwanken zwischen den Personen mit: Die ersten Testwerte streuen mit s ≈ ${num(c.s.sdX)}, die Veränderungen nur mit ${num(c.s.sd)}. Der Unterschied erscheint dann viel unsicherer. Das gilt, solange, wer im ersten Test gut ist, meist auch im zweiten gut ist; ziehst du die Punkte gegenläufig, kann es sich umkehren.`,
      kurz: 'Wer die Paare zerreißt, verschenkt Genauigkeit.',
    },
  ],
  variants: {
    paired_difference: {
      lastStep: 5,
      kurz: 'Gepaarte Differenzen vergleichen jede Person mit sich selbst: zweiter Wert minus erster. Der gepaarte t-Test prüft, ob diese Veränderungen im Mittel von 0 abweichen.',
      fachlich: 'Die gepaarte Differenz ist je Person der spätere minus der frühere Wert. Der gepaarte t-Test ist ein t-Test für eine Stichprobe mit diesen Differenzen.',
      symbolic: ['t = ', { frac: [{ part: ['d̄'], m: 2 }], den: [{ part: ['s'], m: 3 }, ' / ', { big: '√', m: 4 }, { root: ['n'], m: 4 }], m: 5 }, ',   ', { part: ['dᵢ = yᵢ − xᵢ'], m: 1 }],
      aria: 't gleich d quer geteilt durch s durch Wurzel aus n, dabei ist d i gleich y i minus x i',
      metrics: [
        { label: 'mittlere Veränderung d̄', value: c => signed(c.s.mean) },
        { label: 'Standardabweichung s', value: c => num(c.s.sd) },
        { label: 'Standardfehler SE', value: c => sig3(c.s.se) },
        { label: 'Prüfgröße t', value: c => c.s.t === null ? 'nicht definiert' : num(c.s.t) },
      ],
      interpret: c => {
        if (c.s.t === null) return {
          kurz: 'Alle fünf haben sich genau gleich verändert. Ohne Streuung gibt es keinen Standardfehler, und t ist nicht definiert.',
          fachlich: 's = 0, also SE = 0; t = d̄ / SE lässt sich nicht berechnen.',
        };
        const dir = c.s.mean > 0.005 ? `${tasks(c.s.mean)} mehr` : c.s.mean < -0.005 ? `${tasks(-c.s.mean)} weniger` : 'genauso viele Aufgaben';
        return {
          kurz: `Beim zweiten Test lösen die fünf im Schnitt ${dir} als beim ersten. Gäbe es im Mittel keine Veränderung, wäre ein so großes t ${often(c.s.p!)} Stichproben zu erwarten (${pText(c.s.p!)}). ${c.s.p! < 0.05 ? 'Das wäre überraschend, obwohl es nur fünf Personen sind.' : 'Bei nur fünf Personen wäre das nicht überraschend.'}`,
          fachlich: `Gepaarter t-Test, zweiseitig: d̄ = ${num(c.s.mean)}, s ≈ ${num(c.s.sd)}, SE ≈ ${sig3(c.s.se)}, t(${c.s.df}) ≈ ${num(c.s.t)}, ${pText(c.s.p!)}. Signifikant zum Niveau α = 0,05 heißt p < 0,05${c.s.p! < 0.05 ? ', und das ist hier erfüllt.' : ', und das ist hier nicht erfüllt.'}`,
        };
      },
      genau: {
        kurz: 'Der gepaarte t-Test braucht unabhängige Personen und annähernd normalverteilte Differenzen. Bei vielen Personen reicht eine annähernd normale Verteilung von d̄.',
        paragraphs: c => [
          `Hier: Die ersten Testwerte streuen mit s ≈ ${num(c.s.sdX)} Aufgaben, die Veränderungen mit s ≈ ${num(c.s.sd)}. Weil jede Person mit sich selbst verglichen wird, zählt nur die kleinere Streuung.`,
          'Mit fünf Personen nimmt der Test an, dass die Differenzen in der Grundgesamtheit annähernd normalverteilt sind. Ab etwa 30 Personen sorgt der zentrale Grenzwertsatz dafür, dass d̄ annähernd normalverteilt ist; das ist eine Faustregel.',
          'Die Differenzen brauchen eine sinnvolle gemeinsame Skala: Beide Tests haben 20 Aufgaben und gelten im Lehrbeispiel als gleich schwer. Bei sehr schiefen Differenzen ordnet der Wilcoxon-Test ihre Beträge nach Rängen.',
          'In mariposa gibt es dafür kein eigenes Argument: Du bildest die Differenz mit mutate() und testest sie mit t_test(differenz, mu = 0).',
        ],
      },
    },
  },
};

/** Reiter: Wissenstest zu Zeitpunkt 1 und 2 der 200 Befragten. */
export const pairedDifferenceTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'wissenstest', y: 'wissenstest_t2' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: zweiter minus erster Wissenstest, für jede Person.',
    value: c => pairedFor(c).dMean,
    result: c => {
      const p = pairedFor(c);
      if (!(p.sdD > 0)) return { kurz: `Alle 200 haben sich um genau ${num(p.dMean)} Aufgaben verändert. Ohne Streuung ist t nicht definiert.`, fachlich: 's = 0, also SE = 0; t lässt sich nicht berechnen.' };
      return {
        kurz: `Beim zweiten Test lösen die 200 im Schnitt ${p.dMean > 0.005 ? `${tasks(p.dMean)} mehr` : p.dMean < -0.005 ? `${tasks(-p.dMean)} weniger` : 'genauso viele Aufgaben'} als beim ersten. Die Veränderungen streuen mit s ≈ ${num(p.sdD)} Aufgaben, der Standardfehler ist ${sig3(p.se)}. Gäbe es im Mittel keine Veränderung, wäre ein so großes t ${often(p.p)} Stichproben zu erwarten (${pText(p.p)}).`,
        fachlich: `Gepaarter t-Test, zweiseitig: d̄ = ${num(p.dMean)}, s ≈ ${num(p.sdD)}, SE ≈ ${sig3(p.se)}, t(${p.df}) ≈ ${num(p.t)}, ${pText(p.p)}.`,
        zusatz: `${p.up} Befragte lösen beim zweiten Test mehr Aufgaben, ${p.down} weniger, ${p.same} gleich viele.`,
      };
    },
    voraussetzung: 'Die 200 Befragten sind unabhängig voneinander, und beide Tests messen dasselbe auf derselben Skala. Nach der Faustregel ab 30 Personen ist d̄ dann annähernd normalverteilt.',
    think: [
      {
        question: 'Alle lösen beim zweiten Test eine Aufgabe weniger. Was passiert mit der mittleren Veränderung d̄?', options: ['bleibt gleich', 'sinkt um 1', 'sinkt um 200'], correct: 1,
        explain: 'Jede einzelne Veränderung wird um 1 kleiner. Ihre Mitte sinkt deshalb um genau 1, in den Ausgangsdaten von +0,75 auf −0,25.',
        kurz: 'Was alle gleich trifft, verschiebt die Mitte der Veränderungen.',
        tryIt: { label: 'zweiter Test eine Aufgabe weniger', op: 'shift', column: 'y', value: -1 },
        expect: { change: 'plus', amount: -1 },
      },
      {
        question: 'Alle lösen beim ersten Test eine Aufgabe mehr. Was passiert mit der Streuung s der Veränderungen?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Jede Veränderung wird um 1 kleiner, alle gemeinsam. Die Abstände zwischen den Veränderungen bleiben, also auch s.',
        kurz: 'Gemeinsames Verschieben ändert die Lage, nicht die Streuung.',
        tryIt: { label: 'erster Test eine Aufgabe mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same', measure: c => pairedFor(c).sdD },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 3,
    tokens: {
      differenz: { sym: 'differenz', term: 'Gepaarte Differenzen', kurz: 'Die neue Spalte: für jede Person der zweite Test minus der erste. Sie entsteht in mutate().', fehler: 'Schreibst du die Spalte in mutate() anders als in t_test(), meldet R: Column `differenz` doesn\'t exist.' },
      '-': { sym: '−', term: 'Differenz', kurz: 'Zieht für jede Person den ersten Test vom zweiten ab. Plus heißt: beim zweiten Mal mehr gelöst.', fehler: 'Schreibst du die beiden Spalten andersherum, dreht sich das Vorzeichen jeder Differenz und damit auch das von t.' },
    },
    outputMap: [
      { match: 't', atlas: 't', step: 5, explain: 'Die mittlere Veränderung geteilt durch ihren Standardfehler, wie in Schritt 5.' },
      { match: '199', atlas: 'n − 1', explain: '199 Freiheitsgrade: 200 Personen minus 1. Gezählt werden Personen, nicht Messungen.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es im Mittel keine Veränderung, wäre ein so großes t in weniger als 1 von 1.000 Stichproben zu erwarten.' },
      { match: 'N', atlas: 'n', step: 4, explain: 'N zählt die 200 Personen, also die 200 Differenzen. Durch √N teilst du in Schritt 4.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe sind die Freiheitsgrade des gepaarten Tests? Tippe sie an.', correct: '199',
      wrong: { t: 'Fast! Das ist t. Die Freiheitsgrade stehen davor in Klammern.', N: 'Fast! N zählt die Personen. Die Freiheitsgrade sind eins weniger.' },
    },
  },
  next: {
    next: { id: 'wilcoxon_test', why: 'Ordnet die Beträge der Differenzen nach Rängen. Das hilft, wenn die Differenzen sehr schief verteilt sind.' },
    before: [
      { id: 'paired_design', why: 'Nur verbundene Messungen derselben Personen ergeben sinnvolle Differenzen.' },
      { id: 'sd', why: 'Die Streuung der Differenzen, aus der der Standardfehler entsteht.' },
    ],
    after: [{ id: 't_test', why: 'Der gepaarte t-Test ist ein t-Test für eine Stichprobe: die Differenzen gegen 0.' }],
    more: [
      { id: 'se', why: 'Standardabweichung durch die Wurzel aus n, wie in Schritt 4.' },
      { id: 'mcnemar_test', why: 'Der gepaarte Vergleich für eine Ja-nein-Frage vorher und nachher.' },
    ],
  },
};

