// Werkstatt „Streuung“ für Varianz und Standardabweichung. Wortlaut: das gebilligte Tonbeispiel
// „Standardabweichung, Neu“ (Aufgabe F1, Schritt 3, Plan docs/superpowers/plans/2026-10-01-freie-karte-ausbau-alle-knoten.md).
// Vorbild für alle Werkstätten; siehe src/explain/AUTHORING.md.
import type { Ctx, FNode, Workshop } from '../types';
import { series, type Series } from '../math';
import { num, signed, paren, close, unit } from '../format';

type C = Ctx<Series>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const GROUP_A = series([4, 5, 5, 5, 6]), GROUP_B = series([1, 3, 5, 7, 9]);
const same = (xs: number[], ys: number[]) => xs.length === ys.length && xs.every((x, i) => x === ys[i]);
/** Welche Voreinstellung gerade gilt: „A“, „B“ oder null für eigene Daten. */
const group = (c: C) => same(c.s.xs, GROUP_A.xs) ? 'A' : same(c.s.xs, GROUP_B.xs) ? 'B' : null;
/** „gut 3 Punkte“ für 3,16, sonst die Zahl mit höchstens zwei Nachkommastellen und Einheit („1 Punkt“, „0,71 Punkte“). */
const roughly = (v: number) => { const f = v - Math.floor(v); return v >= 2 && f >= 0.05 && f < 0.35 ? `gut ${Math.floor(v)} Punkte` : unit(v, 'Punkt', 'Punkte'); };
/** Größte Verschiebung (2 oder 1, sonst 0), die alle Werte auf der Skala lässt; bevorzugt nach rechts. */
const shiftWithin = (d: number[], lo: number, hi: number) => {
  const up = hi - Math.max(...d), down = Math.min(...d) - lo;
  return up >= 2 ? 2 : down >= 2 ? -2 : up >= 1 ? 1 : down >= 1 ? -1 : 0;
};

const terms = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 4 }, ' '] as FNode[] : []),
  { part: ['('], m: 3 }, { part: [`${x} −`], m: 2 }, ' ', { part: [num(c.s.mean)], m: 1 }, { part: [')²'], m: 3 },
]);

const NEN = 'Warum n − 1? Die Abstände von der eigenen Mitte ergeben zusammen immer 0, das zeigt die Summenzeile der Tabelle. Kennt man vier davon, steht der fünfte fest: Es bleiben n − 1 frei wählbare Abstände, die Freiheitsgrade. Die Abstände werden von der Mitte der Stichprobe aus gemessen, und die liegt näher an den Daten als die wahre Mitte aller Menschen. Die Quadratsumme fällt deshalb im Schnitt zu klein aus; das Teilen durch n − 1 gleicht das aus. So ist s² ein erwartungstreuer Schätzer der Varianz der Grundgesamtheit. Für s selbst gilt das nur annähernd. Teilt man durch n, erhält man die mittlere quadrierte Abweichung genau dieser fünf Personen.';
const SKALA = 'Die Links-rechts-Skala hier wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten.';

export const streuung: Workshop<number[], Series> = {
  id: 'streuung',
  wofuer: 'Zwei Gruppen mit je fünf Personen sagen, wo sie sich politisch einordnen: von 1 (ganz links) bis 10 (ganz rechts). Beide Gruppen landen im Durchschnitt bei 5. Und doch sind sie ganz verschieden: In Gruppe A sind sich fast alle einig, in Gruppe B gehen die Meinungen weit auseinander. Die Standardabweichung macht diesen Unterschied sichtbar, mit einer einzigen Zahl.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber nur aus sechs kleinen Schritten, die du alle schon kannst: zusammenzählen, abziehen, malnehmen, teilen und am Ende die Wurzel ziehen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'streuung',
  names: NAMES,
  bounds: { min: 1, max: 10 },
  presets: [
    { id: 'B', label: 'Gruppe B: 1 3 5 7 9', data: [1, 3, 5, 7, 9] },
    { id: 'A', label: 'Gruppe A: 4 5 5 5 6', data: [4, 5, 5, 5, 6] },
  ],
  compute: series,
  glyphs: [
    { sym: 'x̄', say: 'x quer', term: 'Mittelwert', plain: 'die Mitte der Gruppe', step: 1 },
    { sym: 'xᵢ', say: 'x i', term: 'Beobachtung', plain: 'die Antwort von Person i', step: 2 },
    { sym: 'i', say: 'i', term: 'Laufindex', plain: 'die Nummer der Person, von 1 bis n', step: 4 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 5 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Person einmal', step: 4 },
    { sym: '( )²', say: 'hoch zwei', term: 'Quadrat', plain: 'mit sich selbst malnehmen', step: 3 },
    { sym: '√', say: 'Wurzel', term: 'Quadratwurzel', plain: 'welche Zahl ergibt mal sich selbst diesen Wert?', step: 6 },
  ],
  steps: [
    {
      button: 'x̄', title: 'Die Mitte finden', sym: 'x̄', say: 'x quer', concept: 'mean', perPerson: false,
      was: 'Wir zählen alle fünf Antworten zusammen und teilen durch fünf. So finden wir die Mitte der Gruppe.',
      rechnung: c => `(${c.s.xs.join(' + ')}) / 5 = ${num(c.s.sum)} / 5 = ${num(c.s.mean)}`,
      fach: 'Summe aller Werte geteilt durch die Fallzahl n.',
      warum: 'Gleich messen wir, wie weit jede Person von der Mitte weg ist. Dafür brauchen wir zuerst die Mitte.',
      acht: 'Hier teilst du durch alle fünf Personen. Das „n − 1“ aus der Formel kommt erst in Schritt 5 dran.',
      alltag: 'Wie eine Wippe: Die Mitte ist der Punkt, an dem die Antworten links und rechts genau im Gleichgewicht sind.',
      check: {
        question: 'Wo liegt die Mitte dieser Gruppe?',
        answer: c => c.s.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.sum) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.'
          : close(v, c.s.sum / 4) ? 'Fast! Du hast durch 4 geteilt. Für die Mitte teilst du durch alle fünf, nicht durch n − 1.'
          : null,
      },
    },
    {
      button: 'xᵢ − x̄', title: 'Abstände messen', sym: 'xᵢ − x̄', say: 'x i minus x quer', concept: 'deviation', perPerson: true,
      was: 'Für jede Person rechnen wir: ihre Antwort minus die Mitte. Das Ergebnis sagt, wie weit sie weg ist und auf welcher Seite.',
      rechnung: c => {
        const d = c.s.dev[c.who];
        const side = d < -1e-9 ? `also ${unit(-d, 'Punkt', 'Punkte')} links der Mitte` : d > 1e-9 ? `also ${unit(d, 'Punkt', 'Punkte')} rechts der Mitte` : 'also genau auf der Mitte';
        return `Person ${P(c)}: ${c.s.xs[c.who]} − ${num(c.s.mean)} = ${signed(d)}, ${side}.`;
      },
      fach: 'Die Abweichung vom Mittelwert ist der Wert einer Person minus x̄. Ihr Vorzeichen zeigt die Richtung.',
      warum: 'Streuung bedeutet: Wie weit sind die Leute von der Mitte weg? Genau das messen wir hier, Person für Person.',
      acht: 'Das Minus darf bleiben, es zeigt die Seite. Kleine Überraschung: Alle Abstände zusammen ergeben immer 0, links und rechts gleichen sich aus.',
      check: {
        question: c => `Wie weit ist Person ${P(c)} von der Mitte weg? Mit Vorzeichen.`,
        answer: c => c.s.dev[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who];
          return v !== 'NA' && Math.abs(d) > 1e-9 && close(v, -d) ? 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Antwort minus Mitte.' : null;
        },
      },
    },
    {
      button: '( )²', title: 'Abstände quadrieren', sym: '( )²', say: 'hoch zwei', concept: 'squared_deviation', perPerson: true,
      was: 'Jeden Abstand nehmen wir mit sich selbst mal. Danach sind alle Zahlen positiv.',
      rechnung: c => {
        const d = c.s.dev[c.who];
        return `Person ${P(c)}: (${signed(d)})² = ${paren(d)} · ${paren(d)} = ${num(c.s.sq[c.who])}${d < -1e-9 ? '. Minus mal Minus ergibt Plus.' : '.'}`;
      },
      fach: 'Jede Abweichung wird quadriert, also mit sich selbst multipliziert. Das Ergebnis ist nie negativ.',
      warum: 'Zwei Gründe: Plus und Minus heben sich nicht mehr auf. Und wer weit weg ist, zählt stärker, denn 2 wird zu 4, aber 4 wird zu 16.',
      acht: 'Im Taschenrechner Klammern setzen: (−4)² = 16. Ohne Klammern zeigt er −16. Ein Quadrat ist nie negativ, daran erkennst du den Fehler sofort.',
      alltag: 'Aus jedem Abstand wird eine quadratische Fläche, wie eine Terrasse mit dieser Seitenlänge. Doppelte Seitenlänge heißt vierfache Fläche.',
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
      button: 'Σ', title: 'Alles zusammenzählen', sym: 'Σ', say: 'Sigma', concept: 'ss', perPerson: true,
      was: 'Wir zählen die fünf Quadrate zusammen.',
      rechnung: c => `${c.s.sq.map(q => num(q)).join(' + ')} = ${num(c.s.ss)}. Person ${P(c)} steuert ${num(c.s.sq[c.who])} bei, das sind ${c.s.ss > 0 ? Math.round(c.s.sq[c.who] / c.s.ss * 100) : 0} % der Summe.`,
      fach: 'Σ ist ein griechisches S und bedeutet: alles zusammenzählen, jede Person genau einmal.',
      warum: 'So steckt die Streuung der ganzen Gruppe in einer Zahl.',
      acht: 'Zusammengezählt werden die Quadrate, nicht die Abstände. Die Abstände allein ergäben immer 0.',
      check: {
        question: 'Wie groß ist die Summe der fünf Quadrate?',
        answer: c => c.s.ss,
        diagnose: (c, v) => v !== 'NA' && c.s.ss > 1e-9 && close(v, 0) ? 'Fast! 0 ist die Summe der Abstände. Gefragt ist die Summe ihrer Quadrate.' : null,
      },
    },
    {
      button: '÷ (n − 1)', title: 'Gerecht teilen', sym: 's²', say: 's Quadrat', concept: 'variance', perPerson: false,
      links: [{ id: 'df', label: 'Freiheitsgrade der Streuung' }],
      was: 'Wir teilen die Summe durch die Zahl der Personen minus eins, hier also durch 4.',
      rechnung: c => `${num(c.s.ss)} / (5 − 1) = ${num(c.s.ss)} / 4 = ${num(c.s.variance)}`,
      fach: 'Die Quadratsumme geteilt durch die Freiheitsgrade n − 1 ergibt die Varianz s².',
      warum: 'Durch das Teilen werden große und kleine Gruppen vergleichbar. Und warum minus eins? Damit die Streuung nicht zu klein geschätzt wird. Mehr dazu steht unter „Genau genommen“.',
      acht: c => c.s.ss > 1e-9
        ? `Wer durch 5 teilt, bekommt ${num(c.s.ss / 5)} statt ${num(c.s.variance)}. Das passiert sehr vielen. Merksatz: Bei der Streuung teilst du durch n − 1.`
        : 'Hier ist die Summe 0, da kommt bei jedem Teilen 0 heraus. Sonst gilt: Wer durch 5 statt durch 4 teilt, bekommt eine zu kleine Zahl. Merksatz: Bei der Streuung teilst du durch n − 1.',
      check: {
        question: 'Was kommt heraus, wenn du die Summe durch 4 teilst?',
        answer: c => c.s.variance,
        diagnose: (c, v) => v === 'NA' || c.s.ss < 1e-9 ? null
          : close(v, c.s.ss / 5) ? 'Fast! Du hast durch 5 geteilt. Bei der Streuung teilst du durch 4, also n − 1.'
          : close(v, c.s.ss) ? 'Fast! Das ist noch die Summe. Jetzt noch durch 4 teilen.'
          : null,
      },
    },
    {
      button: '√', title: 'Zurück zur Skala', sym: 's', say: 's', concept: 'sd', perPerson: false,
      was: 'Wir ziehen die Wurzel. Damit machen wir das Quadrieren aus Schritt 3 wieder rückgängig.',
      rechnung: c => `√${num(c.s.variance)} ≈ ${num(c.s.sd)}. Probe: ${num(c.s.sd)} · ${num(c.s.sd)} ≈ ${num(c.s.variance)}.`,
      fach: 'Die Standardabweichung s ist die Quadratwurzel der Varianz. Sie hat wieder die Einheit der Daten.',
      warum: c => `Die ${num(c.s.variance)} aus Schritt 5 ist in „Punkten zum Quadrat“, damit kann niemand etwas anfangen. Nach der Wurzel sind wir wieder in Punkten auf der Skala.`,
      acht: c => `Nicht bei der ${num(c.s.variance)} stehen bleiben. Das ist die Varianz. Die Standardabweichung ist ihre Wurzel.`,
      alltag: 'Eine Terrasse mit 10 m² Fläche ist ein Quadrat mit etwa 3,16 m Seitenlänge. Die Wurzel rechnet von der Fläche zurück zur Länge.',
      check: {
        question: 'Und jetzt die Wurzel daraus? Zwei Nachkommastellen reichen.',
        answer: c => c.s.sd,
        diagnose: (c, v) => v !== 'NA' && Math.abs(c.s.variance - c.s.sd) > 0.02 && close(v, c.s.variance) ? 'Fast! Das ist noch die Zahl vor der Wurzel.' : null,
      },
    },
  ],
  numeric: (c, last) => last === 6
    ? ['s = ', { part: ['√'], m: 6 }, '[ ', ...terms(c), ' ', { part: ['/ (5 − 1)'], m: 5 }, ' ]', { br: true },
      '= ', { part: ['√'], m: 6 }, '[ ', { part: [num(c.s.ss)], m: 4 }, ' ', { part: ['/ 4'], m: 5 }, ' ] = ', { part: [`√${num(c.s.variance)}`], m: 5 }, ' ≈ ', { part: [num(c.s.sd)], m: 6 }]
    : ['s² = [ ', ...terms(c), ' ] ', { part: ['/ (5 − 1)'], m: 5 }, { br: true },
      '= ', { part: [num(c.s.ss)], m: 4 }, ' ', { part: ['/ 4'], m: 5 }, ' = ', { part: [num(c.s.variance)], m: 5 }],
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.xs[i]), sum: c => num(c.s.sum), sumFrom: 1 },
      { head: 'xᵢ − x̄', from: 2, active: [2], cell: (c, i) => signed(c.s.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
      { head: '(xᵢ − x̄)²', from: 3, active: [3, 4], cell: (c, i) => num(c.s.sq[i]), sum: c => num(c.s.ss), sumFrom: 4 },
    ],
    lines: [
      { from: 1, step: 1, text: c => `x̄ = ${num(c.s.sum)} / 5 = ${num(c.s.mean)}` },
      { from: 5, step: 5, text: c => `s² = ${num(c.s.ss)} / (5 − 1) = ${num(c.s.variance)}` },
      { from: 6, step: 6, text: c => `s = √${num(c.s.variance)} ≈ ${num(c.s.sd)}` },
    ],
  },
  captions: {
    1: 'Die fünf Antworten auf der Skala. Du kannst die Punkte ziehen.',
    2: 'Die Pfeile zeigen die Abstände zur Mitte: grün rechts davon, braunrot links davon.',
    3: 'Jeder Abstand wird zur Seite eines Quadrats. Ein Kästchen ist 1 Punkt².',
    4: 'Die Summe legt alle Flächen zusammen.',
    5: 'Geteilt durch n − 1 ergibt sich die Fläche eines typischen Quadrats: die Varianz.',
    6: 'Die Seite dieses Quadrats ist die Standardabweichung s. Oben auf der Skala: x̄ ± s.',
  },
  think: [
    {
      question: 'Alle fünf wählen die 5. Wie groß wird s?', questionFor: { variance: 'Alle fünf wählen die 5. Wie groß wird s²?' },
      options: ['0', '5', 'hängt von n ab'], correct: 0, step: 2,
      explain: 'Jeder Abstand wird 5 − 5 = 0. Null quadriert bleibt 0, die Summe ist 0, die Wurzel aus 0 ist 0. Die Formel misst nur Abstände, und es gibt keine.',
      kurz: 'Keine Unterschiede, keine Streuung.',
      tryIt: { label: 'alle auf 5', apply: () => [5, 5, 5, 5, 5] },
    },
    {
      question: 'Alle rücken zwei Punkte nach rechts. Was macht s?', questionFor: { variance: 'Alle rücken zwei Punkte nach rechts. Was macht s²?' },
      options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 2,
      explain: 'Die Mitte wandert mit. Im Abstand heben sich die 2 Punkte auf: (xᵢ + 2) − (x̄ + 2) = xᵢ − x̄. Die Streuung beschreibt, wie weit die Antworten auseinanderliegen, nicht wo sie liegen.',
      kurz: 'Verschieben ändert die Lage, nicht die Streuung.',
      tryIt: { label: 'alle verschieben', apply: d => d.map(x => x + shiftWithin(d, 1, 10)) },
    },
    {
      question: 'Warum zählen wir nicht die Abstände selbst zusammen, ohne Quadrat?', options: ['das ginge genauso', 'die Summe wäre immer 0'], correct: 1, step: 3,
      explain: c => `Hier: ${c.s.dev.map(d => paren(d)).join(' + ')} = 0. Die Abstände von der eigenen Mitte ergeben immer genau 0, das zeigt auch die Summenzeile der Tabelle. Erst das Quadrat macht jeden Abstand positiv.`,
      kurz: 'Plus und Minus würden sich sonst gegenseitig aufheben.',
    },
    {
      question: 'Ein Abstand verdoppelt sich von 2 auf 4. Wie wächst sein Beitrag zur Summe der Quadrate?', options: ['doppelt', 'vierfach'], correct: 1, step: 3,
      explain: '2² = 4, aber 4² = 16. Das Quadrat lässt Personen am Rand besonders stark zählen. Deshalb reagiert die Streuung empfindlich auf Ausreißer.',
      kurz: 'Wer weit weg ist, zählt viel mehr.',
      tryIt: { label: 'Gruppe B, Person E auf 10', apply: () => [1, 3, 5, 7, 10] },
    },
  ],
  variants: {
    sd: {
      lastStep: 6,
      kurz: 'Die Standardabweichung sagt dir, wie weit die Antworten typischerweise von der Mitte entfernt sind. Kleine Zahl: alle nah beieinander; große Zahl: weit verstreut.',
      fachlich: 'Die Quadratwurzel der Varianz, also der Quadratsumme der Abweichungen vom Mittelwert geteilt durch die Freiheitsgrade n − 1.',
      symbolic: ['s = ', { big: '√', m: 6 }, { root: [{ frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')²'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 }], m: 6 }],
      aria: 's gleich Wurzel aus: Summe über alle Personen i von x i minus x quer, zum Quadrat, geteilt durch n minus 1',
      metrics: [{ label: 'Mitte x̄', value: c => num(c.s.mean) }, { label: 'Standardabweichung s', value: c => num(c.s.sd) }],
      interpret: c => ({
        kurz: c.s.sd < 0.005 ? 'Alle haben dieselbe Antwort gegeben. Es gibt keine Streuung, s ist 0.'
          : group(c) === 'B' ? `In Gruppe B liegen die Antworten typischerweise ${roughly(GROUP_B.sd)} von der Mitte entfernt. In Gruppe A sind es nur ${roughly(GROUP_A.sd)}: Dort sind sich fast alle einig. Gleicher Durchschnitt, ganz andere Gruppe.`
          : group(c) === 'A' ? `In Gruppe A liegen die Antworten typischerweise nur ${roughly(GROUP_A.sd)} von der Mitte entfernt: Dort sind sich fast alle einig. In Gruppe B sind es ${roughly(GROUP_B.sd)}. Gleicher Durchschnitt, ganz andere Gruppe.`
          : `In deiner Gruppe liegen die Antworten typischerweise ${roughly(c.s.sd)} von der Mitte entfernt. ${Math.abs(c.s.sd - GROUP_A.sd) <= Math.abs(c.s.sd - GROUP_B.sd) ? 'Das ist eher wie in Gruppe A: Dort sind sich fast alle einig.' : 'Das ist eher wie in Gruppe B: Dort gehen die Meinungen weit auseinander.'}`,
        fachlich: `Die Standardabweichung beträgt s = ${unit(c.s.sd, 'Skalenpunkt', 'Skalenpunkte')}. Die Antworten liegen also typischerweise etwa ${unit(c.s.sd, 'Punkt', 'Punkte')} von der Mitte ${num(c.s.mean)} entfernt, grob zwischen ${num(c.s.mean - c.s.sd)} und ${num(c.s.mean + c.s.sd)}. Zum Vergleich: Gruppe A hat s = ${num(GROUP_A.sd)}, Gruppe B s = ${num(GROUP_B.sd)}. Je kleiner s, desto einiger ist sich eine Gruppe. Der Mittelwert allein hätte diesen Unterschied nicht gezeigt.`,
      }),
      genau: {
        kurz: 'Mit n − 1 wird die Varianz in der Bevölkerung im Mittel über viele Stichproben nicht zu klein geschätzt. Und s ist etwas anderes als der durchschnittliche Abstand.',
        paragraphs: c => [
          NEN,
          `s ist kein durchschnittlicher Abstand. Hier beträgt die mittlere absolute Abweichung ${num(c.s.mad)}, s dagegen ${num(c.s.sd)}. Das Quadrat lässt große Abstände stärker zählen, und geteilt wird durch n − 1 statt durch n.`,
          SKALA,
        ],
      },
    },
    variance: {
      lastStep: 5,
      kurz: 'Die Varianz ist die Fläche eines typischen Abweichungsquadrats. Je größer sie ist, desto weiter liegen die Antworten auseinander.',
      fachlich: 'Die Quadratsumme der Abweichungen vom Mittelwert geteilt durch die Freiheitsgrade n − 1.',
      symbolic: ['s² = ', { frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')²'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 }],
      aria: 's Quadrat gleich Summe über alle Personen i von x i minus x quer, zum Quadrat, geteilt durch n minus 1',
      metrics: [{ label: 'Mitte x̄', value: c => num(c.s.mean) }, { label: 'Varianz s²', value: c => num(c.s.variance) }],
      interpret: c => ({
        kurz: c.s.variance < 0.005 ? 'Alle haben dieselbe Antwort gegeben. Es gibt keine Streuung, s² ist 0.'
          : group(c) === 'B' ? `In Gruppe B ist ein typisches Abweichungsquadrat ${unit(GROUP_B.variance, 'Punkt²', 'Punkte²')} groß, in Gruppe A nur ${num(GROUP_A.variance)}. Gleicher Durchschnitt, ganz andere Gruppe.`
          : group(c) === 'A' ? `In Gruppe A ist ein typisches Abweichungsquadrat nur ${unit(GROUP_A.variance, 'Punkt²', 'Punkte²')} groß, in Gruppe B ${num(GROUP_B.variance)}. Gleicher Durchschnitt, ganz andere Gruppe.`
          : `In deiner Gruppe ist ein typisches Abweichungsquadrat ${unit(c.s.variance, 'Punkt²', 'Punkte²')} groß. ${Math.abs(c.s.variance - GROUP_A.variance) <= Math.abs(c.s.variance - GROUP_B.variance) ? 'Das ist eher wie in Gruppe A: Dort sind sich fast alle einig.' : 'Das ist eher wie in Gruppe B: Dort gehen die Meinungen weit auseinander.'}`,
        fachlich: `Die Varianz beträgt s² = ${unit(c.s.variance, 'Skalenpunkt zum Quadrat', 'Skalenpunkte zum Quadrat')}. Als Fläche ist sie schwer zu deuten; ihre Wurzel, die Standardabweichung s ≈ ${num(c.s.sd)}, ist wieder in Skalenpunkten.`,
      }),
      next: { id: 'sd', label: 'Weiter zur Standardabweichung' },
      genau: {
        kurz: 'Mit n − 1 wird die Varianz in der Bevölkerung im Mittel über viele Stichproben nicht zu klein geschätzt.',
        paragraphs: () => [NEN, SKALA],
      },
    },
  },
};
