// Werkstatt „Erwartung“ für Erwartungswert (expectation, Schritte 1–2) und Populationsvarianz (population_variance,
// Schritte 1–5). Beispiel: fünf Personen und ihre Haushaltsgröße; eine davon wird zufällig gezogen, jede mit der
// Chance 1/5. Brücke: dieselbe Ziehung aus den 200 Befragten. Ton nach der Streuung (src/explain/content/streuung.ts).
// Zahlen in R nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts. Bild: 'b06-erwartung' in src/components/explain/pictures/b06-wahrscheinlichkeit.tsx.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, TokenNote, Workshop } from '../../types';
import { num, signed, paren, close, unit, pct } from '../../format';
import { eqFrom, shownDiff, sumNodes } from '../../sample';
import { eqSign as eq } from './gemeinsam';
import { ref, titleFor } from '../../../domain/learning';

/** Kennwerte der Ziehung mit gleichen Chancen aus den Werten `xs`. */
export type Erw = {
  xs: number[]; n: number; p: number; sum: number;
  /** Beitrag xᵢ · pᵢ jeder Person */
  w: number[];
  mu: number; dev: number[]; sq: number[]; ss: number;
  sigma2: number; sigma: number;
  /** korrigierte Stichprobenvarianz zum Vergleich (n − 1) */
  s2: number;
  /** gleiche Werte zusammengefasst: Wert, Anzahl, Wahrscheinlichkeit */
  groups: { value: number; count: number; prob: number }[];
};

export function erwartungStats(xs: readonly number[]): Erw {
  const n = xs.length, p = 1 / n, sum = xs.reduce((a, b) => a + b, 0), mu = sum / n;
  const dev = xs.map(x => x - mu), sq = dev.map(d => d * d), ss = sq.reduce((a, b) => a + b, 0);
  const values = [...new Set(xs)].sort((a, b) => a - b);
  return {
    xs: [...xs], n, p, sum, w: xs.map(x => x * p), mu, dev, sq, ss,
    sigma2: ss / n, sigma: Math.sqrt(ss / n), s2: n > 1 ? ss / (n - 1) : 0,
    groups: values.map(v => { const count = xs.filter(x => x === v).length; return { value: v, count, prob: count / n }; }),
  };
}

type C = Ctx<Erw>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const isInt = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;
/** „P(X = 2) = 2 · 0,2 = 0,4“ für den ersten Wert, den mehrere Personen haben. */
const sharedValue = (c: C) => {
  const g = c.s.groups.find(x => x.count > 1);
  return g ? `Gleiche Werte sammeln ihre Chancen: P(X = ${g.value}) = ${g.count} · 0,2 = ${num(g.prob)}.` : 'Hier hat jede Person einen anderen Wert, also gilt P(X = x) = 0,2 für jeden Wert.';
};
/** Nach Werten zusammengefasst: „1 · 0,2 + 2 · 0,4 + …“. */
const grouped = (c: C) => c.s.groups.map(g => `${g.value} · ${num(g.prob)}`).join(' + ');
const people = (v: number) => unit(v, 'Person', 'Personen');

const muTerms = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 2 }, ' '] as FNode[] : []),
  { part: [String(x)], m: 2 }, ' · ', { part: ['0,2'], m: 1 },
]);
const varTerms = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 5 }, ' '] as FNode[] : []),
  { part: ['('], m: 4 }, { part: [`${x} −`], m: 3 }, ' ', { part: [num(c.s.mu)], m: 2 }, { part: [')²'], m: 4 },
]);

const NEN = 'Durch n − 1 teilt man, wenn man aus einer Stichprobe die Varianz einer größeren Gruppe schätzt. Hier kennst du die ganze Gruppe, aus der gezogen wird; es gibt nichts zu schätzen.';

// ---------- Brücke: dieselbe Ziehung aus den 200 Befragten ----------

type B = BridgeCtx<Erw>;
const N = (c: B) => c.values.length;
const BP = (c: B) => c.names[c.who];
const lernzeit = (c: B) => c.col.id === 'lernzeit';
const toMu = (c: B, d: number) => Math.abs(d) < 0.005 ? 'genau auf μ' : `${c.u(Math.abs(d))} ${d > 0 ? 'über' : 'unter'} μ`;
const share = (part: number, whole: number) => whole <= 0 ? '0 %' : part / whole * 100 < 0.005 ? 'weniger als 0,01 %' : `${num(part / whole * 100)} %`;
const binary = (c: B) => c.values.every(v => v === 0 || v === 1);
/** Was der Erwartungswert bei dieser Spalte bedeutet (Skalenniveau). */
const scaleNote = (c: B) => binary(c) ? `„${c.col.title}“ hat nur die Werte 0 und 1; μ ist dann die Wahrscheinlichkeit, eine 1 zu ziehen.`
  : c.col.scale === 'nominal' ? `Die Codes von „${c.col.title}“ haben keine Rangfolge; ein Erwartungswert der Codes beschreibt nichts Inhaltliches.`
  : c.col.likert ? `Für „${c.col.title}“ nimmst du gleich große Abstände zwischen den Antwortstufen an.`
  : c.col.scale === 'ordinal' ? `Die Codes von „${c.col.title}“ sind geordnet, ihre Abstände aber nicht festgelegt; μ setzt gleiche Abstände voraus.`
  : `„${c.col.title}“ ist metrisch: Gleiche Zahlenabstände bedeuten gleich viel.`;

export const bridgeErwartung: Bridge<Erw> = {
  data: 'series',
  numeric: (c, last) => {
    const n = N(c), chance: FNode = { part: [`1/${n}`], m: 1 };
    if (last <= 2) return [
      'μ = ', ...sumNodes(n, c.who, i => [{ part: [num(c.values[i])], m: 2 }, ' · ', chance], [' ', { part: ['+'], m: 2 }, ' ']), { br: true },
      '= ', { part: [num(c.s.sum)], m: 2 }, ` / ${n} ${eq(c.s.mu)} `, { part: [c.u(c.s.mu)], m: 2 },
    ];
    return [
      'σ² = [ ', ...sumNodes(n, c.who, i => [{ part: ['('], m: 4 }, { part: [`${num(c.values[i])} −`], m: 3 }, ' ', { part: [num(c.s.mu)], m: 2 }, { part: [')²'], m: 4 }], [' ', { part: ['+'], m: 5 }, ' ']),
      ' ] · ', chance, { br: true },
      '= ', { part: [num(c.s.ss)], m: 5 }, ` / ${n} ${eq(c.s.sigma2)} `, { part: [c.u(c.s.sigma2, { squared: true })], m: 5 },
    ];
  },
  lines: [
    {
      all: c => `Jede der ${N(c)} Befragten hat beim Ziehen dieselbe Chance: 1 / ${N(c)} = ${pct(1 / N(c))}.`,
      person: c => `${BP(c)} wird mit ${pct(1 / N(c))} gezogen, wie jede andere Person auch.`,
    },
    {
      all: c => `Jeder Wert mal 1 / ${N(c)}, alles zusammen: μ ${eq(c.s.mu)} ${c.u(c.s.mu)}. Das ist genau der Mittelwert der ${N(c)}.`,
      person: c => `${BP(c)} steuert ${num(c.values[c.who])} · 1 / ${N(c)} ${eq(c.s.w[c.who])} ${c.u(c.s.w[c.who])} bei.`,
    },
    {
      all: c => `Für jede Person: Wert minus μ. Mit den Chancen gewichtet ergeben alle ${N(c)} Abstände zusammen 0.`,
      person: c => { const d = shownDiff(c.values[c.who], c.s.mu); return `${BP(c)}: ${num(c.values[c.who])} − ${num(c.s.mu)} = ${signed(d)}, also ${toMu(c, d)}.`; },
    },
    {
      all: c => { const b = c.s.sq.indexOf(Math.max(...c.s.sq)); return `Jeder Abstand wird mit sich selbst malgenommen. Das größte Quadrat liefert ${c.names[b]}: ${c.u(c.s.sq[b], { squared: true, digits: 1 })}.`; },
      person: c => { const d = shownDiff(c.values[c.who], c.s.mu), q = c.s.sq[c.who]; return `${BP(c)}: ${paren(d)}² ${eqFrom(d * d, q)} ${c.u(q, { squared: true })}.`; },
    },
    {
      all: c => `${num(c.s.ss)} · 1 / ${N(c)} ${eq(c.s.sigma2)} ${c.u(c.s.sigma2, { squared: true })}. Durch ${N(c)} − 1 geteilt wäre es s² ${eq(c.s.s2)} ${c.u(c.s.s2, { squared: true })}.`,
      person: c => `${BP(c)} trägt ${share(c.s.sq[c.who], c.s.ss)} zu σ² bei.`,
    },
  ],
  metrics: (c, variant) => [
    { label: 'Befragte n', value: String(N(c)) },
    { label: 'Erwartungswert μ', value: c.u(c.s.mu) },
    ...(variant === 'population_variance' ? [{ label: 'Populationsvarianz σ²', value: c.u(c.s.sigma2, { squared: true }) }] : []),
  ],
  interpret: (c, variant) => {
    if (variant === 'population_variance') {
      if (c.s.sigma2 < 1e-12) return { kurz: 'Alle haben denselben Wert. Es gibt keine Streuung, σ² ist 0.', fachlich: `Die Populationsvarianz von „${c.col.title}“ ist 0.` };
      return {
        kurz: `Der gewichtete Durchschnitt der Abstandsquadrate, jede Person mit der Chance 1 / ${N(c)}, ist ${c.u(c.s.sigma2, { squared: true })}. Mit n − 1 statt n käme s² ${eq(c.s.s2)} ${c.u(c.s.s2, { squared: true })} heraus, fast dasselbe.`,
        fachlich: `σ² = Σ(xᵢ − μ)² / ${N(c)} ${eq(c.s.sigma2)} ${c.u(c.s.sigma2, { squared: true })} und σ ≈ ${c.u(c.s.sigma)} für „${c.col.title}“; die Stichprobenvarianz teilt durch ${N(c) - 1}: s² ${eq(c.s.s2)} ${c.u(c.s.s2, { squared: true })}.`,
        zusatz: `σ² ist s² mal ${N(c) - 1} / ${N(c)}, also ein wenig kleiner.`,
      };
    }
    return {
      kurz: lernzeit(c) ? `Ziehst du sehr oft zufällig eine der ${N(c)} Befragten, kommen im Mittel ${unit(c.s.mu, 'Stunde', 'Stunden')} Lernzeit heraus. Das ist genau ihr Mittelwert.`
        : `Ziehst du sehr oft zufällig eine der ${N(c)} Befragten, liegt „${c.col.title}“ im Mittel bei ${c.u(c.s.mu)}. Das ist genau der Mittelwert der ${N(c)}.`,
      fachlich: `E(X) = Σ xᵢ · 1/${N(c)} ${eq(c.s.mu)} ${c.u(c.s.mu)} für X = „${c.col.title}“ einer zufällig gezogenen Person.`,
      zusatz: `Wären die ${N(c)} eine Zufallsstichprobe aus allen Erwachsenen, wäre ihr Mittelwert nur eine Schätzung für den Erwartungswert dort.`,
    };
  },
  voraussetzung: c => `Jede Person hat dieselbe Chance, gezogen zu werden. ${scaleNote(c)}`,
  picture: (c, step) => ({ center: step >= 2 ? c.s.mu : undefined, deviation: step >= 3, contributions: step >= 4 ? { label: 'Quadrate (xᵢ − μ)²', values: c.s.sq } : undefined }),
  value: (c, variant) => variant === 'population_variance' ? c.s.sigma2 : c.s.mu,
};

// ---------- Werkstatt ----------

export const erwartung: Workshop<number[], Erw> = {
  id: 'erwartung',
  bridge: bridgeErwartung,
  wofuer: 'Du ziehst aus fünf Personen eine blind heraus, wie bei einer Verlosung. Wie viele Menschen leben im Mittel in ihrem Haushalt? Das beantwortet der Erwartungswert. Die Populationsvarianz sagt dazu, wie weit die Haushaltsgrößen um ihn herum streuen.',
  mut: 'Die Formel sieht nach Wahrscheinlichkeitsrechnung aus. Sie besteht aber nur aus kleinen Schritten, die du kennst: teilen, malnehmen und zusammenzählen, für die Streuung noch abziehen und quadrieren. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b06-erwartung',
  dataNote: 'Fünf Beispielpersonen mit ihrer Haushaltsgröße. Die Punkte im Bild lassen sich mit Maus oder Pfeiltasten verschieben.',
  names: NAMES,
  bounds: { min: 1, max: 8 },
  presets: [
    { id: 'A', label: 'Fünf Haushalte: 1 2 2 3 5', data: [1, 2, 2, 3, 5] },
    { id: 'B', label: 'Mit großem Haushalt: 2 3 3 4 7', data: [2, 3, 3, 4, 7] },
  ],
  compute: erwartungStats,
  glyphs: [
    { sym: 'pᵢ', say: 'p i', term: 'Wahrscheinlichkeit', plain: 'die Chance, Person i zu ziehen, hier 1 durch 5', step: 1 },
    { sym: 'xᵢ', say: 'x i', term: 'Beobachtung', plain: 'die Haushaltsgröße von Person i', step: 2 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Person einmal', step: 2 },
    { sym: 'μ', say: 'mü', term: 'Erwartungswert', plain: 'der Wert, der im Mittel herauskommt', step: 2 },
    { sym: 'E(X)', say: 'E von X', term: 'Erwartungswert', plain: 'eine andere Schreibweise für μ', step: 2 },
    { sym: '( )²', say: 'hoch zwei', term: 'Quadrat', plain: 'mit sich selbst malnehmen', step: 4 },
    { sym: 'σ²', say: 'sigma Quadrat', term: 'Populationsvarianz', plain: 'der mit den Chancen gewichtete Durchschnitt der Abstandsquadrate', step: 5 },
  ],
  steps: [
    {
      button: 'pᵢ', title: 'Jeder Person ihre Chance geben', sym: 'pᵢ = 1/n', say: 'p i gleich 1 durch n', concept: 'probability', perPerson: false,
      was: 'Du ziehst eine der fünf Personen blind. Jede hat dieselbe Chance: 1 von 5, also 0,2.',
      rechnung: 'pᵢ = 1 / 5 = 0,2 für jede Person. Zusammen: 5 · 0,2 = 1.',
      fach: c => `Bei einer Ziehung mit gleichen Chancen hat jede der n Personen die Wahrscheinlichkeit 1/n. ${sharedValue(c)}`,
      warum: 'Der Erwartungswert gewichtet jeden Wert mit seiner Wahrscheinlichkeit. Dafür brauchst du zuerst die Wahrscheinlichkeiten.',
      acht: 'Alle Chancen zusammen ergeben immer 1. Kommt etwas anderes heraus, fehlt eine Person oder eine zählt doppelt.',
      check: {
        question: 'Wie wahrscheinlich ziehst du eine bestimmte Person, zum Beispiel A?',
        answer: () => 0.2,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.n) ? 'Fast! 5 ist die Zahl der Personen. Die Chance ist 1 durch 5.'
          : close(v, 20) ? 'Fast! 20 % stimmt. Als Wahrscheinlichkeit schreibst du 0,2.'
          : close(v, 0.25) ? 'Fast! Das wäre 1 durch 4. Es sind fünf Personen, also 1 durch 5.'
          : null,
      },
    },
    {
      button: 'Σ xᵢ · pᵢ', title: 'Gewichtet zusammenzählen', sym: 'μ = E(X)', say: 'mü gleich E von X', concept: 'expectation', perPerson: true,
      was: 'Jeden Wert nimmst du mit seiner Chance mal, dann zählst du alles zusammen. So entsteht der Erwartungswert μ.',
      rechnung: c => `Person ${P(c)}: ${c.s.xs[c.who]} · 0,2 = ${num(c.s.w[c.who])}. Alle zusammen: ${c.s.w.map(w => num(w)).join(' + ')} = ${num(c.s.mu)}.`,
      fach: 'Der Erwartungswert ist die Summe aller möglichen Werte, jeder gewichtet mit seiner Wahrscheinlichkeit: μ = E(X) = Σ x · P(X = x).',
      warum: 'Werte mit großer Chance ziehen μ stärker zu sich. Haben alle Personen dieselbe Chance, ist μ genau der Mittelwert der Gruppe.',
      acht: c => isInt(c.s.mu)
        ? `μ muss kein möglicher Wert sein. Hier ist es zufällig eine ganze Zahl; bei 1, 2, 2, 3, 5 wäre es 2,6.`
        : `μ muss kein möglicher Wert sein. Einen Haushalt mit ${num(c.s.mu)} Personen gibt es nicht; als Erwartungswert ist ${num(c.s.mu)} trotzdem richtig.`,
      check: {
        question: 'Was kommt heraus, wenn du alle fünf gewichteten Werte zusammenzählst?',
        answer: c => c.s.mu,
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          if (Math.abs(c.s.sum - c.s.mu) > 0.02 && close(v, c.s.sum)) return 'Fast! Das ist die Summe der Werte ohne Gewicht. Jeder Wert zählt nur mit seiner Chance 0,2.';
          if (Math.abs(c.s.sum / 4 - c.s.mu) > 0.02 && close(v, c.s.sum / 4)) return 'Fast! Du hast durch 4 geteilt. Beim Erwartungswert zählt jede Person mit 1/5, also mit 0,2.';
          const one = c.s.w[c.who];
          if (Math.abs(one - c.s.mu) > 0.02 && close(v, one)) return `Fast! Das ist nur der Beitrag von Person ${P(c)}. Zähl die Beiträge aller fünf zusammen.`;
          return null;
        },
      },
    },
    {
      button: 'xᵢ − μ', title: 'Abstände zu μ messen', sym: 'xᵢ − μ', say: 'x i minus mü', concept: 'deviation', perPerson: true,
      was: 'Für jede Person rechnest du: ihr Wert minus μ. Das Vorzeichen zeigt, auf welcher Seite sie liegt.',
      rechnung: c => {
        const d = c.s.dev[c.who];
        const side = d < -1e-9 ? `also ${people(-d)} unter μ` : d > 1e-9 ? `also ${people(d)} über μ` : 'also genau auf μ';
        return `Person ${P(c)}: ${c.s.xs[c.who]} − ${num(c.s.mu)} = ${signed(d)}, ${side}.`;
      },
      fach: 'Die Abweichung vom Erwartungswert ist xᵢ − μ. Mit den Chancen gewichtet ergeben alle Abweichungen zusammen 0.',
      warum: 'Die Populationsvarianz misst, wie weit die Werte von μ entfernt liegen. Dafür brauchst du jeden einzelnen Abstand.',
      acht: 'Gemessen wird von μ aus. Hier ist μ zugleich der Mittelwert der fünf, weil alle dieselbe Chance haben.',
      check: {
        question: c => `Wie weit liegt Person ${P(c)} von μ entfernt? Mit Vorzeichen.`,
        answer: c => c.s.dev[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who];
          return v !== 'NA' && Math.abs(d) > 1e-9 && close(v, -d) ? 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Wert minus μ.' : null;
        },
      },
    },
    {
      button: '( )²', title: 'Abstände quadrieren', sym: '(xᵢ − μ)²', say: 'x i minus mü, zum Quadrat', concept: 'squared_deviation', perPerson: true,
      was: 'Jeden Abstand nimmst du mit sich selbst mal. Danach sind alle Zahlen positiv.',
      rechnung: c => {
        const d = c.s.dev[c.who];
        return `Person ${P(c)}: (${signed(d)})² = ${paren(d)} · ${paren(d)} = ${num(c.s.sq[c.who])}${d < -1e-9 ? '. Minus mal Minus ergibt Plus.' : '.'}`;
      },
      fach: 'Die quadrierte Abweichung (xᵢ − μ)² ist nie negativ und lässt große Abstände besonders stark zählen.',
      warum: 'Ohne Quadrat würden sich Plus und Minus zu 0 aufheben. Und wer weit von μ weg ist, zählt stärker.',
      acht: c => {
        const d = Math.min(...c.s.dev);
        return d > -1e-9 ? 'Hier liegen alle genau auf μ, jedes Quadrat ist 0. Sonst gilt: Klammern setzen, ein Quadrat ist nie negativ.'
          : `Im Taschenrechner Klammern setzen: (${num(d)})² = ${num(d * d)}. Ohne Klammern zeigt er −${num(d * d)}.`;
      },
      check: {
        question: c => `Was kommt heraus, wenn du ${paren(c.s.dev[c.who])} mit sich selbst malnimmst?`,
        answer: c => c.s.sq[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who], q = c.s.sq[c.who];
          if (v === 'NA') return null;
          if (q > 1e-9 && close(v, -q)) return 'Fast! Das Minus ist zu viel: Minus mal Minus ergibt Plus. Ein Quadrat ist nie negativ.';
          if (Math.abs(d) > 1e-9 && close(v, 2 * Math.abs(d)) && !close(v, q)) return `Fast! Das ist mal 2. Mit sich selbst malnehmen heißt: ${paren(d)} · ${paren(d)}.`;
          return null;
        },
      },
    },
    {
      button: 'Σ ( )² · pᵢ', title: 'Die Quadrate gewichtet zusammenzählen', sym: 'σ²', say: 'sigma Quadrat', concept: 'population_variance', perPerson: false,
      was: 'Jedes Quadrat zählt mit der Chance seiner Person, hier 0,2. Zusammengezählt ergibt das die Populationsvarianz σ².',
      rechnung: c => `(${c.s.sq.map(q => num(q)).join(' + ')}) · 0,2 = ${num(c.s.ss)} / 5 = ${num(c.s.sigma2)}. Die Wurzel daraus: σ ≈ ${num(c.s.sigma)}.`,
      fach: 'Die Populationsvarianz ist der Erwartungswert der quadrierten Abweichung: σ² = E[(X − μ)²]. Bei n gleich wahrscheinlichen Werten ist das Σ(xᵢ − μ)² / n.',
      warum: 'Hier kennst du die ganze Gruppe, aus der gezogen wird, und es gibt nichts zu schätzen. Deshalb teilst du durch n, nicht durch n − 1.',
      acht: c => c.s.ss > 1e-9
        ? `Wer wie bei s² durch 4 teilt, bekommt ${num(c.s.ss / 4)} statt ${num(c.s.sigma2)}. Das wäre die Schätzung aus einer Stichprobe, nicht die Varianz der Gruppe selbst.`
        : 'Hier ist die Summe 0, da kommt bei jedem Teilen 0 heraus. Sonst gilt: Für σ² teilst du durch n, nicht durch n − 1.',
      check: {
        question: 'Was kommt heraus, wenn du die Summe der Quadrate durch 5 teilst?',
        answer: c => c.s.sigma2,
        diagnose: (c, v) => v === 'NA' || c.s.ss < 1e-9 ? null
          : close(v, c.s.ss / 4) ? 'Fast! Du hast durch 4 geteilt wie bei s². Für σ² zählt jede Person mit 0,2, also teilst du durch 5.'
          : close(v, c.s.ss) ? 'Fast! Das ist noch die Summe. Jetzt noch durch 5 teilen, also mal 0,2.'
          : Math.abs(c.s.sigma - c.s.sigma2) > 0.02 && close(v, c.s.sigma) ? 'Fast! Das ist schon die Wurzel σ. Gefragt ist σ², die Zahl vor der Wurzel.'
          : null,
      },
    },
  ],
  numeric: (c, last) => last <= 2
    ? ['μ = ', ...muTerms(c), { br: true }, '= ', { part: [num(c.s.mu)], m: 2 }]
    : ['σ² = [ ', ...varTerms(c), ' ] · ', { part: ['0,2'], m: 1 }, { br: true },
      '= ', { part: [num(c.s.ss)], m: 5 }, ' · 0,2 = ', { part: [num(c.s.sigma2)], m: 5 }],
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [], cell: (c, i) => String(c.s.xs[i]) },
      { head: 'pᵢ', from: 1, active: [1], cell: () => '0,2', sum: () => '1', sumFrom: 1 },
      { head: 'xᵢ · pᵢ', from: 2, active: [2], cell: (c, i) => num(c.s.w[i]), sum: c => num(c.s.mu), sumFrom: 2 },
      { head: 'xᵢ − μ', from: 3, active: [3], cell: (c, i) => signed(c.s.dev[i]), sum: () => '0', sumFrom: 3, sumNote: 'immer' },
      { head: '(xᵢ − μ)²', from: 4, active: [4, 5], cell: (c, i) => num(c.s.sq[i]), sum: c => num(c.s.ss), sumFrom: 5 },
    ],
    lines: [
      { from: 2, step: 2, text: c => `μ = ${c.s.w.map(w => num(w)).join(' + ')} = ${num(c.s.mu)}` },
      { from: 2, step: 2, text: c => `Nach Werten zusammengefasst: ${grouped(c)} = ${num(c.s.mu)}` },
      { from: 5, step: 5, text: c => `σ² = ${num(c.s.ss)} · 0,2 = ${num(c.s.sigma2)}; σ = √${num(c.s.sigma2)} ≈ ${num(c.s.sigma)}` },
    ],
  },
  captions: {
    1: 'Die fünf Haushaltsgrößen auf der Skala. Jede Person hat beim Ziehen die Chance 0,2.',
    2: 'Die gestrichelte Linie ist μ: der Wert, der im Mittel herauskommt.',
    3: 'Die Pfeile zeigen die Abstände zu μ: grün darüber, braunrot darunter.',
    4: 'Rechts steht das Quadrat jedes Abstands.',
    5: 'σ² ist der mit den Chancen gewichtete Durchschnitt der Abstandsquadrate; σ ist seine Wurzel.',
  },
  // Variantenfilter (IB30): Fragen zur Streuung stehen nur auf der Karte Populationsvarianz, im Wortlaut vor der
  // neutralen Fassung; die Karte Erwartungswert hat ihre eigene Frage zu den Chancen. Ausprobieren meldet die letzte
  // Kennzahl der Variante: μ auf der Karte Erwartungswert, σ² auf der Karte Populationsvarianz.
  think: [
    {
      question: 'Alle Haushalte bekommen eine Person mehr. Was passiert mit μ?',
      options: ['steigt um 1', 'bleibt gleich', 'verdoppelt sich'], correct: 0, step: 2,
      explain: 'Jeder Wert steigt um 1, die Chancen bleiben 0,2. Zusammen kommt 5 · 0,2 · 1 = 1 dazu, solange niemand schon bei der Obergrenze 8 liegt.',
      kurz: 'Verschieben verschiebt den Erwartungswert um genau so viel.',
      tryIt: { label: 'alle eine Person mehr', apply: d => d.map(x => Math.min(8, x + 1)) }, tryFor: ['expectation'],
    },
    {
      question: 'Alle Haushalte bekommen eine Person mehr. Was passiert mit σ²?', onlyFor: ['population_variance'],
      options: ['wird um 1 größer', 'ändert sich nicht', 'verdoppelt sich'], correct: 1, step: 3,
      explain: 'μ steigt auch um 1. Im Abstand hebt sich die 1 auf: (xᵢ + 1) − (μ + 1) = xᵢ − μ. Deshalb bleibt auch σ² gleich, solange niemand schon bei der Obergrenze 8 liegt.',
      kurz: 'Verschieben ändert die Lage, nicht die Streuung.',
      tryIt: { label: 'alle eine Person mehr', apply: d => d.map(x => Math.min(8, x + 1)) },
    },
    {
      question: 'Warum zählt jede der fünf Personen mit 0,2 und nicht mit 0,25?', onlyFor: ['expectation'],
      options: ['weil die fünf die ganze Gruppe sind, aus der gezogen wird', 'weil das Ergebnis dann kleiner wird'], correct: 0, step: 1,
      explain: 'Gezogen wird aus genau diesen fünf, jede mit der Chance 1 / 5. Zusammen ergeben die fünf Chancen 1; mit je 0,25 wären es 1,25.',
      kurz: 'Gezogen wird aus allen n: Jede Person zählt mit 1 / n.',
    },
    {
      question: 'Warum teilst du hier durch 5 und nicht durch 4 wie bei der Stichprobenvarianz s²?', onlyFor: ['population_variance'],
      options: ['weil die fünf die ganze Gruppe sind, aus der gezogen wird', 'weil 5 die größere Zahl ist'], correct: 0, step: 5,
      explain: NEN,
      kurz: 'Ganze Gruppe: durch n. Schätzung aus einer Stichprobe: durch n − 1.',
    },
  ],
  variants: {
    expectation: {
      lastStep: 2,
      kurz: 'Der Erwartungswert sagt dir, welcher Wert im Mittel herauskommt, wenn du sehr oft zufällig ziehst. Jeder Wert zählt so stark wie seine Wahrscheinlichkeit.',
      fachlich: 'Die mit den Wahrscheinlichkeiten gewichtete Summe aller möglichen Werte einer Zufallsvariable: μ = E(X) = Σ x · P(X = x).',
      symbolic: ['μ = E(X) = ', { big: 'Σ', m: 2 }, { part: ['x', { sub: 'i' }], m: 2 }, ' · ', { part: ['p', { sub: 'i' }], m: 1 }],
      aria: 'mü gleich E von X gleich Summe über alle Personen i von x i mal p i',
      metrics: [{ label: 'Chance je Person', value: () => '0,2' }, { label: 'Erwartungswert μ', value: c => num(c.s.mu) }],
      interpret: c => ({
        kurz: `Ziehst du sehr oft zufällig eine der fünf Personen, kommen im Mittel ${people(c.s.mu)} pro Haushalt heraus. Weil alle dieselbe Chance haben, ist das genau der Mittelwert der fünf.`,
        fachlich: `E(X) = Σ xᵢ · pᵢ = ${num(c.s.mu)}. Nach Werten zusammengefasst: ${grouped(c)} = ${num(c.s.mu)}. Wären die fünf eine Stichprobe aus einer größeren Gruppe, wäre ihr Mittelwert nur eine Schätzung für deren Erwartungswert.`,
      }),
      next: { id: 'population_variance', label: 'Weiter zur Populationsvarianz' },
      genau: {
        kurz: 'Der Erwartungswert gehört zum Modell, der Mittelwert zur Stichprobe. Bei einer Ziehung mit gleichen Chancen aus einer festen Gruppe fallen beide zusammen.',
        paragraphs: () => [
          'Bei stetigen Verteilungen ersetzt ein Integral über x mal Dichte die Summe. Nicht jede Verteilung besitzt einen endlichen Erwartungswert.',
          'Gesetz der großen Zahlen: Ziehst du sehr oft mit Zurücklegen, nähert sich der Durchschnitt der gezogenen Werte dem Erwartungswert μ.',
          'Für eine Variable mit den Werten 0 und 1 ist der Erwartungswert die Wahrscheinlichkeit der 1: E(X) = 0 · (1 − p) + 1 · p = p.',
        ],
      },
    },
    population_variance: {
      lastStep: 5,
      kurz: 'Die Populationsvarianz sagt dir, wie weit die Werte im Modell um den Erwartungswert streuen. Sie ist der mit den Wahrscheinlichkeiten gewichtete Durchschnitt der Abstandsquadrate.',
      fachlich: 'Der Erwartungswert der quadrierten Abweichung vom Erwartungswert: σ² = E[(X − μ)²], bei N gleich wahrscheinlichen Werten Σ(xᵢ − μ)² / N.',
      symbolic: ['σ² = ', { big: 'Σ', m: 5 }, { part: ['('], m: 4 }, { part: ['x', { sub: 'i' }, ' −'], m: 3 }, ' ', { part: ['μ'], m: 2 }, { part: [')²'], m: 4 }, ' · ', { part: ['p', { sub: 'i' }], m: 1 }],
      aria: 'sigma Quadrat gleich Summe über alle Personen i von x i minus mü, zum Quadrat, mal p i',
      // σ² zuletzt: Das Ausprobieren dieser Karte (Denkfrage zu σ²) meldet die letzte Kennzahl.
      metrics: [{ label: 'Erwartungswert μ', value: c => num(c.s.mu) }, { label: 'Populationsvarianz σ²', value: c => num(c.s.sigma2) }],
      interpret: c => ({
        kurz: c.s.sigma2 < 1e-12 ? 'Alle fünf leben in gleich großen Haushalten. Es gibt keine Streuung, σ² ist 0.'
          : `Der gewichtete Durchschnitt der Abstandsquadrate, jede Person mit ihrer Chance 0,2, ist ${unit(c.s.sigma2, 'Person²', 'Personen²')}. Seine Wurzel σ ≈ ${people(c.s.sigma)} sagt grob, wie weit ein Haushalt von μ = ${num(c.s.mu)} entfernt liegt.`,
        fachlich: `σ² = Σ(xᵢ − μ)² / 5 = ${num(c.s.ss)} / 5 = ${num(c.s.sigma2)}, σ ≈ ${num(c.s.sigma)}. Teilst du durch n − 1 = 4, erhältst du s² = ${num(c.s.s2)}: die Schätzung, wenn die fünf eine Stichprobe aus einer größeren Gruppe wären.`,
      }),
      next: { id: 'variance', label: 'Weiter zur Stichprobenvarianz s²' },
      genau: {
        kurz: 'σ² beschreibt die Streuung im Modell; s² mit n − 1 schätzt sie aus einer Stichprobe. Für eine ganz bekannte Gruppe teilst du durch N.',
        paragraphs: () => [
          NEN,
          'σ² = E[(X − μ)²] ist der Erwartungswert der quadrierten Abweichung und hat die quadrierte Einheit der Daten. Seine Wurzel σ, die Standardabweichung der Population, hat wieder die Einheit der Daten; sie ist kein durchschnittlicher Abstand, weil große Abstände im Quadrat stärker zählen.',
          'Eine endliche Varianz setzt voraus, dass E(X²) endlich ist. Bei Modellen mit sehr dicken Rändern kann σ² unendlich sein.',
        ],
      },
    },
  },
};

// ---------- Reiter ----------

const T = (id: string) => titleFor(ref(id));
const DESCRIBE: TokenNote = {
  sym: 'describe()', term: T('describe'),
  kurz: 'Berechnet Kennwerte einer oder mehrerer Spalten. Welche, sagt show; N und Missing stehen immer dabei.',
  fehler: 'Ohne library(mariposa) meldet R: konnte Funktion "describe" nicht finden.',
};
const MEAN_VALUE: TokenNote = {
  sym: '"mean"', term: T('mean'), kurz: '"mean" steht für den Mittelwert. Bei einer Ziehung mit gleichen Chancen aus diesen Daten ist er der Erwartungswert μ.',
  fehler: 'Groß geschrieben kennt describe() den Namen nicht: show = "MEAN" ergibt Unknown `show` value. Richtig ist "mean".',
};
const VAR_VALUE: TokenNote = {
  sym: '"var"', term: T('variance'), kurz: '"var" steht für variance, die Varianz. R teilt dabei durch n − 1, berechnet also s², nicht σ².',
  fehler: 'Groß geschrieben kennt describe() den Namen nicht: show = "VAR" ergibt Unknown `show` value. Richtig ist "var".',
};
const N_MAP = { match: 'N', atlas: 'n', step: 1, explain: 'N zählt die Befragten. Beim Ziehen hat jede die Chance 1 / N.' };
const MISSING_MAP = { match: 'Missing', atlas: 'fehlende Werte', explain: 'Missing zählt Befragte ohne Antwort. Im Lehrdatensatz fehlt niemand.' };

export const expectationTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'erwartung', variant: 'expectation', variable: 'lernzeit',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Erwartungswert?', options: ['bleibt gleich', 'steigt um 1 Stunde', 'steigt um 200 Stunden'], correct: 1, step: 2,
        explain: 'Jeder Wert steigt um 1, jede Chance bleibt 1 / 200. Zusammen kommt 200 · 1 / 200 = 1 Stunde dazu.',
        kurz: 'Verschieben verschiebt den Erwartungswert um genau so viel.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1 },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem Erwartungswert?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 2,
        explain: 'Jeder Beitrag xᵢ · 1/200 verdoppelt sich, also auch ihre Summe μ.',
        kurz: 'Malnehmen wirkt auf den Erwartungswert genauso.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Die gewählte Person lernt plötzlich 40 Stunden. Wie stark ändert sich der Erwartungswert?', options: ['gar nicht', 'ein wenig', 'um mehr als 10 Stunden'], correct: 1, step: 2,
        explain: 'Ihr Wert zählt nur mit der Chance 1 / 200. Der Erwartungswert steigt deshalb um (40 − alter Wert) / 200, höchstens um 0,2 Stunden.',
        kurz: 'Bei 200 gleichen Chancen fällt ein einzelner Wert wenig ins Gewicht.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up', atMost: 0.2 + 1e-9 },
      },
    ],
  },
  r: {
    entry: 'mean', variant: 0, live: { fn: 'describe', show: ['mean'] },
    tokens: { describe: DESCRIBE, '"mean"': MEAN_VALUE },
    outputMap: [
      { match: 'Mean', atlas: 'μ bei Ziehung aus den 200', step: 2, explain: 'Ziehst du mit gleichen Chancen aus diesen 200, ist der Erwartungswert genau dieser Mittelwert.' },
      N_MAP, MISSING_MAP,
    ],
    check: {
      question: 'Welche Zahl ist der Erwartungswert, wenn du zufällig eine der 200 Befragten ziehst? Tippe sie an.', correct: 'Mean',
      wrong: { N: 'Fast! N ist die Zahl der Befragten; jede zählt mit 1 / N. Der Erwartungswert steht unter Mean.', Missing: 'Fast! Missing zählt fehlende Antworten. Der Erwartungswert steht unter Mean.' },
    },
  },
  next: {
    next: { id: 'population_variance', why: 'Wie weit streuen die Werte um den Erwartungswert? Dieselbe Gewichtung, angewandt auf die Abstandsquadrate.' },
    before: [
      { id: 'random_variable', why: 'Der Erwartungswert gehört zu einer Zufallsvariable, nicht zu einer Datenreihe.' },
      { id: 'probability_mass', why: 'Die Wahrscheinlichkeiten, mit denen jeder Wert gewichtet wird.' },
    ],
    after: [
      { id: 'law_large_numbers', why: 'Der Durchschnitt vieler Ziehungen nähert sich dem Erwartungswert.' },
      { id: 'sampling_distribution', why: 'Der Mittelwert vieler Stichproben streut um den Erwartungswert.' },
      { id: 'mean', why: 'Der Mittelwert einer Stichprobe schätzt den Erwartungswert.' },
    ],
    more: [{ id: 'central_limit', why: 'Mittelwerte vieler Werte sind annähernd normalverteilt um μ.' }],
  },
};

export const populationVarianceTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'erwartung', variant: 'population_variance', variable: 'lernzeit',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was macht σ²?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 3,
        explain: 'μ wandert um eine Stunde mit. Im Abstand hebt sich die Stunde auf: (xᵢ + 1) − (μ + 1) = xᵢ − μ. Die Populationsvarianz bleibt gleich.',
        kurz: 'Verschieben ändert die Lage, nicht die Streuung.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht σ²?', options: ['verdoppelt sich', 'vervierfacht sich', 'bleibt gleich'], correct: 1, step: 4,
        explain: 'Jeder Abstand verdoppelt sich, jedes Quadrat vervierfacht sich (Schritt 4). Damit wird auch σ² viermal so groß.',
        kurz: 'Doppelte Werte, vierfache Varianz.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 4 },
      },
      {
        question: 'Die gewählte Person lernt plötzlich 40 Stunden. Was macht σ² in den Ausgangsdaten?', options: ['bleibt fast gleich', 'steigt', 'sinkt'], correct: 1, step: 4,
        explain: 'Ihr Abstand zu μ wird groß, und das Quadrat macht ihn riesig (Schritt 4). Auch mit der kleinen Chance 1 / 200 wächst σ² in den Ausgangsdaten dadurch um fast die Hälfte, während μ nur ein wenig steigt.',
        kurz: 'Wer weit weg ist, zählt im Quadrat viel mehr.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 'variance', variant: 0, live: { fn: 'describe', show: ['mean', 'var'] },
    tokens: { describe: DESCRIBE, '"mean"': MEAN_VALUE, '"var"': VAR_VALUE },
    outputMap: [
      { match: 'Variance', atlas: 's², nicht σ²', step: 5, explain: 'R teilt durch n − 1 und meldet s². Für σ² der 200 nimmst du diese Zahl mal 199 / 200.' },
      { match: 'Mean', atlas: 'μ', step: 2, explain: 'Bei einer Ziehung mit gleichen Chancen aus den 200 ist der Mittelwert der Erwartungswert μ, von dem aus die Abstände gemessen werden.' },
      N_MAP, MISSING_MAP,
    ],
    check: {
      question: 'Welche Zahl musst du mit 199 / 200 malnehmen, um σ² der 200 Befragten zu bekommen? Tippe sie an.', correct: 'Variance',
      wrong: { Mean: 'Fast! Das ist μ, der Erwartungswert. Die Varianz steht unter Variance.', N: 'Fast! N ist die Zahl der Befragten. Die Varianz steht unter Variance.', Missing: 'Fast! Missing zählt fehlende Antworten. Die Varianz steht unter Variance.' },
    },
  },
  next: {
    next: { id: 'variance', why: 'Aus einer Stichprobe schätzt man σ² mit s², geteilt durch n − 1.' },
    before: [
      { id: 'expectation', why: 'Der Erwartungswert μ, von dem aus alle Abstände gemessen werden.' },
      { id: 'squared_deviation', why: 'Die Abstandsquadrate, die gewichtet zusammengezählt werden.' },
    ],
    after: [
      { id: 'sampling_distribution', why: 'Die Streuung des Mittelwerts über viele Stichproben ist σ² / n.' },
      { id: 'normal_distribution', why: 'σ² legt die Breite der Glockenkurve fest.' },
    ],
    more: [
      { id: 'central_limit', why: 'Braucht eine endliche Varianz σ².' },
      { id: 'variance_assumption', why: 'Gleiche Varianzen in Gruppen sind eine Annahme mancher Tests.' },
    ],
  },
};
