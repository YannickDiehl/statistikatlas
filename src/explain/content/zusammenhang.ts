// Werkstatt „Zusammenhang“ (Stufe 1) für Kovarianz und Pearson-r. Wortlaut: docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt/03-zusammenhang.md
import type { Ctx, FNode, Workshop } from '../types';
import { pairStats, type PairStats, type Pairs } from '../math';
import { num, signed, paren, close } from '../format';

type C = Ctx<PairStats>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const side = (d: number) => d > 1e-9 ? 'über' : d < -1e-9 ? 'unter' : 'genau auf';
const X = [2, 3, 4, 5, 6];

const products = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 4 }, ' '] as FNode[] : []),
  { part: ['('], m: 3 }, { part: [`${x} −`], m: 2 }, ' ', { part: [num(c.s.x.mean)], m: 1 }, { part: [')'], m: 3 },
  { part: [' · ('], m: 3 }, { part: [`${c.s.ys[i]} −`], m: 2 }, ' ', { part: [num(c.s.y.mean)], m: 1 }, { part: [')'], m: 3 },
]);

const strength = (r: number) => {
  const a = Math.abs(r);
  return a >= 0.9999 ? 'perfekt' : a >= 0.5 ? 'stark' : a >= 0.3 ? 'mittel' : 'schwach';
};

export const zusammenhang: Workshop<Pairs, PairStats> = {
  id: 'zusammenhang',
  wofuer: 'Vertraut, wer dem Bundestag vertraut, auch eher der Bundesregierung? Fünf Beispielpersonen beantworten zwei ALLBUS-Fragen auf einer Skala von 1 (gar kein Vertrauen) bis 7 (großes Vertrauen). Die Formel fragt: Liegen die beiden Antworten einer Person meist auf derselben Seite ihres Durchschnitts?',
  names: NAMES,
  bounds: { min: 1, max: 7 },
  presets: [
    { id: 'gleich', label: 'Gleichläufig', data: { x: X, y: [2, 5, 3, 6, 4] } },
    { id: 'gegen', label: 'Gegenläufig', data: { x: X, y: [6, 3, 5, 2, 4] } },
    { id: 'krumm', label: 'Gekrümmt', data: { x: X, y: [5, 3, 2, 3, 5] } },
  ],
  compute: pairStats,
  glyphs: [
    { sym: 'x̄, ȳ', say: '„x quer, y quer“', term: 'Mittelwerte', plain: 'die Mitte jeder Frage', step: 1 },
    { sym: 'xᵢ, yᵢ', say: '„x i, y i“', term: 'Zusammengehöriges Wertepaar', plain: 'die beiden Antworten von Person i', step: 2 },
    { sym: '( ) · ( )', say: '„mal“', term: 'Abweichungsprodukt', plain: 'die beiden Abweichungen malnehmen', step: 3 },
    { sym: 'Σ', say: '„Sigma“', term: 'Summenzeichen', plain: 'alles addieren, jede Person einmal', step: 4 },
    { sym: 'n − 1', say: '„n minus eins“', term: 'Freiheitsgrade', plain: 'eins weniger als Personen', step: 5 },
    { sym: 'sₓᵧ', say: '„s x y“', term: 'Stichprobenkovarianz', plain: 'das typische Rechteck', step: 5 },
    { sym: 'sₓ, sᵧ', say: '„s x, s y“', term: 'Standardabweichungen', plain: 'typische Abstände jeder Frage', step: 6 },
    { sym: 'r', say: '„r“', term: 'Pearson-Korrelation', plain: 'Zusammenhang zwischen −1 und +1', step: 6 },
  ],
  steps: [
    {
      button: 'x̄ und ȳ', sym: 'x̄, ȳ', concept: 'mean', also: 'Mittelwerte beider Variablen', perPerson: false,
      kurz: 'Wir suchen für beide Fragen die Mitte. Zusammen bilden die beiden Mitten ein Achsenkreuz.',
      fachlich: 'Die arithmetischen Mittel x̄ und ȳ sind die Bezugspunkte für die Abweichungen beider Variablen.',
      vorgerechnet: c => `x̄ = (${c.s.xs.join(' + ')}) / 5 = ${num(c.s.x.mean)}; ȳ = (${c.s.ys.join(' + ')}) / 5 = ${num(c.s.y.mean)}. Das Achsenkreuz liegt bei (${num(c.s.x.mean)} | ${num(c.s.y.mean)}).`,
      alltag: 'Wie ein Fadenkreuz: Es teilt das Diagramm in vier Felder, rechts oben, links oben, links unten, rechts unten.',
      warum: 'Ob zwei Merkmale gemeinsam variieren, sieht man erst relativ zu ihren Mitten: Liegt jemand in beiden Fragen über oder unter dem Durchschnitt?',
      fehler: 'Nur eine Mitte berechnen. Die Kovarianz braucht beide.',
      check: {
        question: 'Wie groß ist ȳ?',
        answer: c => c.s.y.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.y.sum) ? 'Das ist die Summe. Jetzt durch n = 5 teilen.'
          : !close(c.s.x.mean, c.s.y.mean) && close(v, c.s.x.mean) ? 'Das ist x̄. Gefragt ist der Mittelwert der zweiten Frage, ȳ.'
          : null,
      },
    },
    {
      button: 'Abweichungen', sym: 'xᵢ − x̄, yᵢ − ȳ', concept: 'deviation', also: 'zwei je Person', perPerson: true,
      kurz: 'Für jede Person messen wir in beiden Fragen: Wie weit liegt sie von der Mitte weg, und auf welcher Seite?',
      fachlich: 'Je Person gibt es zwei Abweichungen vom Mittelwert, xᵢ − x̄ und yᵢ − ȳ, jeweils mit Vorzeichen. Beide gehören zu derselben Person (zusammengehöriges Wertepaar).',
      vorgerechnet: c => {
        const dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who];
        return `Person ${P(c)}: x = ${c.s.xs[c.who]}, y = ${c.s.ys[c.who]}. xᵢ − x̄ = ${c.s.xs[c.who]} − ${num(c.s.x.mean)} = ${signed(dx)}, yᵢ − ȳ = ${c.s.ys[c.who]} − ${num(c.s.y.mean)} = ${signed(dy)}. ${P(c)} liegt beim Vertrauen in den Bundestag ${side(dx)} dem Durchschnitt und bei der Bundesregierung ${side(dy)} dem Durchschnitt.`;
      },
      alltag: 'Wie eine Adresse im Fadenkreuz: so weit nach links oder rechts, so weit nach unten oder oben.',
      warum: 'Die beiden Vorzeichen zeigen, in welchem der vier Felder eine Person liegt.',
      fehler: 'Abweichungen verschiedener Personen mischen, etwa nach getrenntem Sortieren der Spalten. Beide Abweichungen gehören zu derselben Person.',
      check: {
        question: c => `Wie groß ist yᵢ − ȳ für Person ${P(c)}?`,
        answer: c => c.s.y.dev[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who];
          if (Math.abs(dy) > 1e-9 && close(v, -dy)) return `Der Betrag stimmt, das Vorzeichen nicht. Rechne Wert minus Mittelwert: ${c.s.ys[c.who]} − ${num(c.s.y.mean)}.`;
          if (!close(dx, dy) && close(v, dx)) return 'Das ist die Abweichung in x. Gefragt ist y.';
          return null;
        },
      },
    },
    {
      button: '( ) · ( )', sym: '(xᵢ − x̄)(yᵢ − ȳ)', concept: 'crossproduct', perPerson: true,
      kurz: 'Die beiden Abweichungen einer Person werden malgenommen. Das Ergebnis ist eine Rechteckfläche mit Vorzeichen.',
      fachlich: 'Das Abweichungsprodukt (xᵢ − x̄)(yᵢ − ȳ) ist positiv, wenn eine Person in beiden Variablen auf derselben Seite der Mitte liegt, und negativ, wenn sie auf verschiedenen Seiten liegt.',
      vorgerechnet: c => {
        const dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who], p = c.s.prod[c.who];
        const how = p > 1e-9 ? `Positiv: ${P(c)} liegt in beiden Fragen auf derselben Seite, das passt zu einem gleichläufigen Muster.`
          : p < -1e-9 ? `Negativ: ${P(c)} liegt auf verschiedenen Seiten, das spricht gegen ein gleichläufiges Muster.`
          : `Null: ${P(c)} liegt in einer Frage genau im Durchschnitt und trägt nichts bei.`;
        return `${P(c)}: ${paren(dx)} · ${paren(dy)} = ${num(p)}. ${how} Im Bild: ein Rechteck mit den Seiten ${num(Math.abs(dx))} und ${num(Math.abs(dy))}.`;
      },
      alltag: 'Wie zwei Wetterfahnen: Zeigen beide in dieselbe Richtung, zählt das als Übereinstimmung, sonst als Widerspruch. Je stärker der Wind, desto mehr zählt es.',
      warum: 'Das Vorzeichen des Produkts sagt, ob diese Person zum gleichläufigen oder zum gegenläufigen Muster beiträgt, die Fläche, wie deutlich.',
      fehler: 'Die Vorzeichenregel vergessen: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus. Und: Das Abweichungsquadrat der Standardabweichung ist der Sonderfall, in dem eine Variable mit sich selbst multipliziert wird.',
      check: {
        question: c => `Wie groß ist das Abweichungsprodukt von Person ${P(c)}?`,
        answer: c => c.s.prod[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const p = c.s.prod[c.who], dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who];
          if (Math.abs(p) > 1e-9 && close(v, -p)) return 'Vorzeichenregel: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus.';
          if (!close(dx + dy, p) && close(v, dx + dy)) return 'Das ist die Summe der Abweichungen. Gefragt ist ihr Produkt.';
          return null;
        },
      },
    },
    {
      button: 'Σ', sym: 'Σ(xᵢ − x̄)(yᵢ − ȳ)', concept: 'crossproduct_sum', perPerson: false,
      kurz: 'Alle Rechteckflächen werden verrechnet: Plusflächen gegen Minusflächen.',
      fachlich: 'Die Summe der Abweichungsprodukte fasst die gemeinsame Abweichung aller Personen zusammen.',
      vorgerechnet: c => `${c.s.prod.map(p => paren(p)).join(' + ')} = ${num(c.s.cp)}. Plusflächen zusammen ${num(c.s.pos)}, Minusflächen ${num(c.s.neg)}. ${c.s.cp > 1e-9 ? 'Die Plusflächen überwiegen.' : c.s.cp < -1e-9 ? 'Die Minusflächen überwiegen.' : 'Plus- und Minusflächen heben sich auf.'}`,
      alltag: 'Wie eine Abstimmung: Gleichläufige Personen stimmen für Plus, gegenläufige für Minus, und deutlichere Stimmen zählen mehr.',
      warum: 'Erst über alle Personen hinweg zeigt sich, welches Muster überwiegt.',
      fehler: 'Negative Produkte weglassen oder positiv zählen. Sie gehören mit ihrem Minus in die Summe.',
      check: {
        question: 'Wie groß ist die Summe der Abweichungsprodukte?',
        answer: c => c.s.cp,
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const abs = c.s.pos - c.s.neg;
          if (c.s.neg < -1e-9 && close(v, abs)) return 'Du hast die negativen Produkte positiv gezählt.';
          if (Math.abs(c.s.cp) > 1e-9 && close(v, 0)) return '0 ist die Summe der Abweichungen einer Variable. Gefragt ist die Summe der Produkte.';
          return null;
        },
      },
    },
    {
      button: '÷ (n − 1)', sym: 'sₓᵧ', concept: 'covariance', perPerson: false,
      kurz: 'Die Summe wird auf n − 1 verteilt. So groß ist ein typisches Rechteck.',
      fachlich: 'Die Summe der Abweichungsprodukte geteilt durch n − 1 ergibt die Stichprobenkovarianz sₓᵧ.',
      vorgerechnet: c => `${num(c.s.cp)} / (5 − 1) = ${num(c.s.cov)}. Einheit: Vertrauenspunkte beim Bundestag mal Vertrauenspunkte bei der Bundesregierung.`,
      alltag: 'Wie bei der Varianz: gerecht auf n − 1 Stücke verteilen.',
      warum: 'Teilen macht die Kovarianz unabhängig davon, wie viele Personen befragt wurden; n − 1 aus demselben Grund wie bei der Varianz.',
      fehler: 'Die Größe der Kovarianz als Stärke lesen. Sie hängt von den Einheiten ab: Misst man beide Fragen auf einer Skala von 10 bis 70, wird sie hundertmal so groß, ohne dass der Zusammenhang stärker wird.',
      check: {
        question: 'Wie groß ist die Kovarianz sₓᵧ?',
        answer: c => c.s.cov,
        diagnose: (c, v) => v === 'NA' || Math.abs(c.s.cp) < 1e-9 ? null
          : close(v, c.s.cp / 5) ? 'Du hast durch n = 5 geteilt. Die Formel teilt durch n − 1 = 4.'
          : close(v, c.s.cp) ? 'Das ist noch die Summe. Es fehlt das Teilen durch n − 1.'
          : null,
      },
    },
    {
      button: '÷ (sₓ · sᵧ)', sym: 'r', concept: 'pearson', also: 'Nenner: Produkt der Standardabweichungen', perPerson: false,
      kurz: 'Wir vergleichen das typische Rechteck mit dem größtmöglichen. So entsteht eine Zahl zwischen −1 und +1.',
      fachlich: 'Pearson-r ist die Kovarianz geteilt durch das Produkt der beiden Standardabweichungen. Das Ergebnis hat keine Einheit und liegt zwischen −1 und +1.',
      vorgerechnet: c => c.s.r === null
        ? `sₓ ≈ ${num(c.s.x.sd)} und sᵧ ≈ ${num(c.s.y.sd)}. Eine Standardabweichung ist 0, deshalb ist r nicht definiert: Man kann nicht durch 0 teilen.`
        : `sₓ ≈ ${num(c.s.x.sd)} und sᵧ ≈ ${num(c.s.y.sd)} (je aus der Werkstatt Standardabweichung), also sₓ · sᵧ ≈ ${num(c.s.sxy)}. r = ${num(c.s.cov)} / ${num(c.s.sxy)} = ${num(c.s.r)}.`,
      alltag: 'Wie eine Prozentangabe: nicht wie viele Punkte, sondern welcher Anteil vom Höchstmöglichen.',
      warum: 'Die Kovarianz kann nie größer sein als sₓ · sᵧ. Teilt man durch diesen Höchstwert, verschwinden die Einheiten, und Zusammenhänge zwischen ganz verschiedenen Fragen werden vergleichbar.',
      fehler: 'r als Anteil der Personen lesen. r = 0,5 heißt nicht, dass die Hälfte übereinstimmt. Es beschreibt, wie eng die Punkte an einer steigenden Geraden liegen.',
      check: {
        question: c => c.s.r === null ? 'Wie groß ist r? Hier ist eine Standardabweichung 0. Tippe NA, wenn r nicht definiert ist.' : 'Wie groß ist r?',
        answer: c => c.s.r === null ? 'NA' : c.s.r,
        diagnose: (c, v) => {
          if (v === 'NA' || c.s.r === null || Math.abs(c.s.cov) < 1e-9) return null;
          if (close(v, c.s.cov / (c.s.x.sd + c.s.y.sd))) return 'Im Nenner steht das Produkt sₓ · sᵧ, nicht die Summe.';
          if (close(v, c.s.cov / (c.s.x.variance * c.s.y.variance))) return 'Im Nenner stehen die Standardabweichungen, nicht die Varianzen.';
          if (!close(c.s.cov, c.s.r) && close(v, c.s.cov)) return 'Das ist noch die Kovarianz. Es fehlt das Teilen durch sₓ · sᵧ.';
          return null;
        },
      },
    },
  ],
  numeric: (c, last) => {
    const cov: FNode[] = ['sₓᵧ = [ ', ...products(c), ' ] ', { part: ['/ (5 − 1)'], m: 5 }, { br: true },
      '= ', { part: [num(c.s.cp)], m: 4 }, ' ', { part: ['/ 4'], m: 5 }, ' = ', { part: [num(c.s.cov)], m: 5 }];
    if (last < 6) return cov;
    return [...cov, { br: true }, 'r = ', { part: [num(c.s.cov)], m: 5 }, ' ', { part: [`/ (${num(c.s.x.sd)} · ${num(c.s.y.sd)})`], m: 6 }, ' = ',
      { part: [c.s.r === null ? 'nicht definiert' : num(c.s.r)], m: 6 }];
  },
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.xs[i]), sum: c => num(c.s.x.sum), sumFrom: 1 },
      { head: 'yᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.ys[i]), sum: c => num(c.s.y.sum), sumFrom: 1 },
      { head: 'xᵢ − x̄', from: 2, active: [2], cell: (c, i) => signed(c.s.x.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
      { head: 'yᵢ − ȳ', from: 2, active: [2], cell: (c, i) => signed(c.s.y.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
      { head: 'Produkt', from: 3, active: [3, 4], cell: (c, i) => num(c.s.prod[i]), sum: c => num(c.s.cp), sumFrom: 4 },
    ],
    lines: [
      { from: 1, step: 1, text: c => `x̄ = ${num(c.s.x.sum)} / 5 = ${num(c.s.x.mean)}, ȳ = ${num(c.s.y.sum)} / 5 = ${num(c.s.y.mean)}` },
      { from: 5, step: 5, text: c => `sₓᵧ = ${num(c.s.cp)} / 4 = ${num(c.s.cov)}` },
      { from: 6, step: 6, text: c => `sₓ ≈ ${num(c.s.x.sd)}, sᵧ ≈ ${num(c.s.y.sd)}, r = ${num(c.s.cov)} / ${num(c.s.sxy)} ${c.s.r === null ? 'nicht definiert' : `= ${num(c.s.r)}`}` },
    ],
  },
  captions: {
    1: 'Das Achsenkreuz aus x̄ und ȳ teilt das Diagramm in vier Felder. Punkte lassen sich ziehen.',
    2: 'Jede Person hat zwei Abweichungen: waagerecht zu x̄, senkrecht zu ȳ.',
    3: 'Rechts oben und links unten: gleichläufig, die Fläche zählt plus. Die anderen Felder zählen minus.',
    4: 'Der Balken legt alle Plusflächen und alle Minusflächen gegeneinander.',
    5: 'Geteilt durch n − 1 ergibt sich das typische Rechteck: die Kovarianz.',
    6: 'Das typische Rechteck im Vergleich zum größtmöglichen, sₓ · sᵧ: Das Verhältnis ist r.',
  },
  think: [
    {
      question: 'Du misst beide Fragen auf einer Skala von 10 bis 70 statt 1 bis 7 (alles mal 10). Was passiert?',
      options: ['beide werden zehnmal so groß', 'Kovarianz hundertmal so groß, r gleich', 'beide bleiben gleich'], correct: 1, step: 6, stepFor: { covariance: 5 },
      explain: 'Jede Abweichung wird zehnmal so groß, jedes Produkt hundertmal (10 · 10). sₓ und sᵧ werden je zehnmal so groß, ihr Produkt hundertmal; in r kürzt sich das weg.',
      kurz: 'r hängt nicht von der Einheit ab, die Kovarianz schon.',
    },
    {
      question: 'Die Punkte liegen auf einem U. Wie groß ist r?', questionFor: { covariance: 'Die Punkte liegen auf einem U. Wie groß ist die Kovarianz?' },
      options: ['nahe 1', '0', 'negativ'], correct: 1, step: 4,
      explain: 'Rechts und links liegen die Punkte oben, in der Mitte unten: Die Plus- und Minusrechtecke heben sich genau auf, die Summe ist 0. Kovarianz und r messen nur den geraden (linearen) Anteil eines Zusammenhangs.',
      kurz: 'r = 0 heißt nicht, dass es keinen Zusammenhang gibt.',
      tryIt: { label: 'gekrümmt', apply: () => ({ x: X, y: [5, 3, 2, 3, 5] }) },
    },
    {
      question: 'Eine Person liegt beim Vertrauen in den Bundestag genau im Durchschnitt. Was trägt sie zur Kovarianz bei?',
      options: ['etwas Positives', 'nichts', 'etwas Negatives'], correct: 1, step: 3,
      explain: 'Ihre Abweichung in x ist 0, das Rechteck hat keine Breite, das Produkt ist 0, egal wie weit sie in y abweicht.',
      kurz: 'Wer in einer Frage im Durchschnitt liegt, trägt nichts bei.',
    },
    {
      question: 'Wer dem Bundestag mehr vertraut, vertraut der Regierung weniger. Welches Vorzeichen hat r?', questionFor: { covariance: 'Wer dem Bundestag mehr vertraut, vertraut der Regierung weniger. Welches Vorzeichen hat die Kovarianz?' },
      options: ['positiv', 'negativ'], correct: 1, step: 3,
      explain: 'Die Punkte liegen dann vor allem links oben und rechts unten; dort sind die Rechtecke negativ.',
      kurz: 'Gegenläufig heißt Minus.',
      tryIt: { label: 'gegenläufig', apply: () => ({ x: X, y: [6, 3, 5, 2, 4] }) },
    },
  ],
  variants: {
    pearson: {
      lastStep: 6,
      kurz: 'r sagt, wie eng die Punkte an einer Geraden liegen, von −1 (perfekt gegenläufig) über 0 bis +1 (perfekt gleichläufig).',
      fachlich: 'Die Kovarianz geteilt durch das Produkt der beiden Standardabweichungen.',
      symbolic: ['r = ', { frac: [
        { frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')('], m: 3 }, { part: ['y', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['ȳ'], m: 1 }, { part: [')'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 },
      ], den: [{ part: ['sₓ · sᵧ'], m: 6 }], m: 6 }],
      aria: 'r gleich: Summe über alle Personen i von x i minus x quer, mal y i minus y quer, geteilt durch n minus 1; das Ganze geteilt durch s x mal s y',
      metrics: [{ label: 'Kovarianz sₓᵧ', value: c => num(c.s.cov) }, { label: 'Pearson-r', value: c => c.s.r === null ? 'nicht definiert' : num(c.s.r) }],
      interpret: c => {
        if (c.s.r === null) return { kurz: 'Eine Frage hat keine Streuung. Dann lässt sich kein Zusammenhang berechnen.', fachlich: 'Eine Standardabweichung ist 0, deshalb ist r nicht definiert.' };
        const r = c.s.r;
        return {
          kurz: Math.abs(r) < 0.1 ? 'Kein gerader Zusammenhang.' : `${r > 0 ? 'Gleichläufig' : 'Gegenläufig'} und ${strength(r)}${strength(r) === 'perfekt' ? '.' : ', aber kein perfekter Zusammenhang.'}`,
          fachlich: `r = ${num(r)}. Nach der verbreiteten Faustregel von Cohen ist ein Betrag ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark. Bei nur fünf Personen ist r sehr unsicher; die Werkstatt zeigt die Rechnung, nicht einen Befund über Deutschland.`,
        };
      },
      genau: {
        kurz: 'r beschreibt nur gerade Muster und sagt nichts darüber, was was verursacht.',
        paragraphs: () => [
          'Es gibt einen zweiten Rechenweg mit demselben Ergebnis: beide Variablen z-standardisieren und r = Σzₓzᵧ / (n − 1) rechnen. Er ist über den Routenwähler im Abschnitt „Mit dem Lehrdatensatz“ erreichbar.',
          'Dass r zwischen −1 und +1 liegt, folgt aus |sₓᵧ| ≤ sₓ · sᵧ (Cauchy-Schwarz-Ungleichung). Gleichheit gilt nur, wenn alle Punkte exakt auf einer Geraden liegen.',
          'Einzelne auffällige Punkte können r stark verändern. Bei Ausreißern oder nur geordneten Kategorien ist die Spearman-Korrelation robuster.',
          'Die Vertrauensskalen hier wie metrische Skalen zu behandeln, ist eine Annahme.',
          'Ein Zusammenhang ist keine Ursache: Beides kann zum Beispiel von allgemeinem politischem Vertrauen abhängen (Begriff „Confounding“).',
        ],
      },
    },
    covariance: {
      lastStep: 5,
      kurz: 'Die Kovarianz sagt, ob zwei Merkmale gemeinsam über oder unter ihrem Durchschnitt liegen: positiv heißt gleichläufig, negativ gegenläufig.',
      fachlich: 'Die Summe der Abweichungsprodukte geteilt durch n − 1.',
      symbolic: ['sₓᵧ = ', { frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')('], m: 3 }, { part: ['y', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['ȳ'], m: 1 }, { part: [')'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 }],
      aria: 's x y gleich Summe über alle Personen i von: x i minus x quer, mal y i minus y quer, geteilt durch n minus 1',
      metrics: [{ label: 'Summe der Produkte', value: c => num(c.s.cp) }, { label: 'Kovarianz sₓᵧ', value: c => num(c.s.cov) }],
      interpret: c => ({
        kurz: c.s.cov > 1e-9 ? 'Wer dem Bundestag mehr vertraut, vertraut in diesen fünf Beispielen eher auch der Bundesregierung.'
          : c.s.cov < -1e-9 ? 'Wer dem Bundestag mehr vertraut, vertraut in diesen fünf Beispielen der Bundesregierung eher weniger.'
          : 'Ein gerades gemeinsames Muster ist nicht zu erkennen.',
        fachlich: `sₓᵧ = ${num(c.s.cov)}. Das Vorzeichen zeigt die Richtung. Die Größe ist ohne Einheiten schwer zu deuten, dafür gibt es Pearson-r.`,
      }),
      genau: {
        kurz: 'Die Kovarianz zeigt die Richtung, aber ihre Größe hängt von den Einheiten ab.',
        paragraphs: () => [
          'Die Kovarianz einer Variable mit sich selbst ist ihre Varianz: Aus dem Rechteck wird ein Quadrat.',
          'Dass |sₓᵧ| höchstens sₓ · sᵧ sein kann, nutzt Pearson-r, um die Kovarianz auf −1 bis +1 zu bringen.',
          'Ein Zusammenhang ist keine Ursache: Beides kann zum Beispiel von allgemeinem politischem Vertrauen abhängen (Begriff „Confounding“).',
        ],
      },
    },
  },
};
