// Werkstatt „Streuung“ (Stufe 1) für Varianz und Standardabweichung. Wortlaut: docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt/02-streuung.md
import type { Ctx, FNode, Workshop } from '../types';
import { series, type Series } from '../math';
import { num, signed, paren, close } from '../format';

type C = Ctx<Series>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const GROUP_A = series([4, 5, 5, 5, 6]), GROUP_B = series([1, 3, 5, 7, 9]);

const terms = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 4 }, ' '] as FNode[] : []),
  { part: ['('], m: 3 }, { part: [`${x} −`], m: 2 }, ' ', { part: [num(c.s.mean)], m: 1 }, { part: [')²'], m: 3 },
]);

export const streuung: Workshop<number[], Series> = {
  id: 'streuung',
  title: 'der Standardabweichung',
  wofuer: 'Zwei Gruppen stufen sich auf der Links-rechts-Skala ein (1 = ganz links, 10 = ganz rechts). Beide haben denselben Mittelwert 5. Trotzdem wirken sie verschieden: In der einen sind sich alle ziemlich einig, in der anderen gehen die Meinungen weit auseinander. Die Standardabweichung macht diesen Unterschied zu einer Zahl.',
  names: NAMES,
  bounds: { min: 1, max: 10 },
  presets: [
    { id: 'B', label: 'Gruppe B: 1 3 5 7 9', data: [1, 3, 5, 7, 9] },
    { id: 'A', label: 'Gruppe A: 4 5 5 5 6', data: [4, 5, 5, 5, 6] },
  ],
  compute: series,
  glyphs: [
    { sym: 'x̄', say: '„x quer“', term: 'Mittelwert', plain: 'die Mitte der Gruppe', step: 1 },
    { sym: 'xᵢ', say: '„x i“', term: 'Beobachtung', plain: 'der Wert von Person i', step: 2 },
    { sym: 'i', say: '„i“', term: 'Laufindex', plain: 'die Nummer der Person, von 1 bis n', step: 4 },
    { sym: 'n', say: '„n“', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 5 },
    { sym: 'Σ', say: '„Sigma“', term: 'Summenzeichen', plain: 'alles addieren, jede Person einmal', step: 4 },
    { sym: '( )²', say: '„hoch zwei“', term: 'Quadrat', plain: 'mit sich selbst malnehmen', step: 3 },
    { sym: '√', say: '„Wurzel“', term: 'Quadratwurzel', plain: 'welche Zahl ergibt mal sich selbst diesen Wert?', step: 6 },
  ],
  steps: [
    {
      button: 'x̄', sym: 'x̄', concept: 'mean', also: 'Mittelwert x̄', perPerson: true,
      kurz: 'Wir suchen die Mitte der Gruppe. Von ihr aus wird gleich jeder Abstand gemessen.',
      fachlich: 'Der Mittelwert x̄ ist die Summe aller Beobachtungen geteilt durch die Fallzahl n. Er ist der Bezugspunkt für alle Abweichungen.',
      vorgerechnet: c => `Alle fünf Werte addieren: ${c.s.xs.join(' + ')} = ${num(c.s.sum)}. Durch die Fallzahl teilen: ${num(c.s.sum)} / 5 = ${num(c.s.mean)}. Person ${P(c)} trägt ihren Wert ${c.s.xs[c.who]} dazu bei, wie alle anderen auch.`,
      alltag: 'Wie eine Wippe: Der Mittelwert ist der Punkt, an dem die Werte links und rechts genau im Gleichgewicht sind.',
      warum: 'Streuung heißt immer Streuung um etwas herum. Ohne Mitte gäbe es keine Abweichung, die man messen könnte.',
      fehler: 'Beim Mittelwert wird durch n = 5 geteilt, also durch alle Personen. Das n − 1 kommt erst in Schritt 5.',
      check: {
        question: 'Wie groß ist der Mittelwert x̄ dieser Gruppe?',
        answer: c => c.s.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.sum) ? 'Das ist die Summe. Jetzt noch durch n = 5 teilen.'
          : close(v, c.s.sum / 4) ? 'Beim Mittelwert durch n = 5 teilen, nicht durch n − 1.'
          : null,
      },
    },
    {
      button: 'xᵢ − x̄', sym: 'xᵢ − x̄', concept: 'deviation', also: 'mit Vorzeichen', perPerson: true,
      kurz: 'Für jede Person messen wir: Wie weit ist sie von der Mitte weg, und auf welcher Seite?',
      fachlich: 'Die Abweichung ist die Beobachtung einer Person minus den Mittelwert. Ihr Vorzeichen zeigt die Richtung.',
      vorgerechnet: c => {
        const d = c.s.dev[c.who];
        const side = d < -1e-9 ? `Negativ: ${P(c)} liegt links der Mitte.` : d > 1e-9 ? `Positiv: ${P(c)} liegt rechts der Mitte.` : `Null: ${P(c)} liegt genau auf der Mitte.`;
        return `Person ${P(c)} hat den Wert ${c.s.xs[c.who]}. Der Mittelwert liegt bei ${num(c.s.mean)}. Abweichung: ${c.s.xs[c.who]} − ${num(c.s.mean)} = ${signed(d)}. ${side}`;
      },
      alltag: 'Wie Hausnummern auf einer Straße: Wer bei Nummer 1 wohnt, wohnt 4 Häuser links von Nummer 5.',
      warum: 'Das Vorzeichen zeigt die Seite, links oder rechts der Mitte. Der Betrag zeigt, wie weit weg jemand ist.',
      fehler: 'Das Minus weglassen. Es wirkt unwichtig, zeigt aber etwas Wichtiges: Addiert man alle Abweichungen, kommt immer 0 heraus (siehe Summenzeile der Tabelle).',
      check: {
        question: c => `Person ${P(c)} hat den Wert ${c.s.xs[c.who]}, der Mittelwert liegt bei ${num(c.s.mean)}. Wie groß ist die Abweichung xᵢ − x̄ von ${P(c)}?`,
        answer: c => c.s.dev[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who];
          return v !== 'NA' && Math.abs(d) > 1e-9 && close(v, -d) ? `Der Betrag stimmt, das Vorzeichen nicht. Rechne Wert minus Mittelwert: ${c.s.xs[c.who]} − ${num(c.s.mean)}.` : null;
        },
      },
    },
    {
      button: '( )²', sym: '(xᵢ − x̄)²', concept: 'squared_deviation', also: 'Abweichungsquadrat', perPerson: true,
      kurz: 'Aus jedem Abstand wird eine Fläche. Danach zählt nur noch, wie weit jemand weg ist, nicht mehr die Seite.',
      fachlich: 'Jede Abweichung wird quadriert, also mit sich selbst multipliziert. Das Ergebnis ist nie negativ.',
      vorgerechnet: c => {
        const d = c.s.dev[c.who], q = c.s.sq[c.who];
        return `Die Abweichung von ${P(c)} ist ${signed(d)}. Quadriert: (${signed(d)})² = ${paren(d)} · ${paren(d)} = ${num(q)}. ${d < -1e-9 ? 'Minus mal Minus ergibt Plus. ' : ''}Im Bild: ein Quadrat mit der Seitenlänge ${num(Math.abs(d))} und der Fläche ${num(q)} Kästchen.`;
      },
      alltag: 'Aus jedem Abstand wird eine quadratische Fläche, wie eine Terrasse mit dieser Seitenlänge. Doppelte Seitenlänge heißt vierfache Fläche.',
      warum: 'Das Quadrat macht jede Abweichung positiv, sodass sich nichts mehr aufhebt. Und es lässt große Abweichungen stärker zählen als kleine.',
      fehler: 'Taschenrechner-Falle: Wer −4² eintippt, bekommt −16, weil erst quadriert und dann das Minus gesetzt wird. Richtig ist (−4)² = 16 mit Klammern. Ein Quadrat ist nie negativ.',
      check: {
        question: c => `Die Abweichung von Person ${P(c)} ist ${signed(c.s.dev[c.who])}. Was ergibt (${signed(c.s.dev[c.who])})²?`,
        answer: c => c.s.sq[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who], q = c.s.sq[c.who];
          if (v === 'NA') return null;
          if (q > 1e-9 && close(v, -q)) return 'Taschenrechner-Falle: Klammern setzen. Ein Quadrat ist nie negativ.';
          if (Math.abs(d) > 1e-9 && close(v, 2 * Math.abs(d)) && !close(v, q)) return 'Das ist mal 2. Hoch 2 heißt: die Zahl mit sich selbst malnehmen.';
          return null;
        },
      },
    },
    {
      button: 'Σ', sym: 'Σ(xᵢ − x̄)²', concept: 'ss', also: 'Summe der Abweichungsquadrate', perPerson: true,
      kurz: 'Alle Flächen kommen auf einen Haufen.',
      fachlich: 'Das Summenzeichen Σ addiert die quadrierten Abweichungen aller n Personen. Das Ergebnis heißt Quadratsumme.',
      vorgerechnet: c => `Die Abweichungsquadrate der fünf Personen: ${c.s.sq.map(q => num(q)).join(' + ')} = ${num(c.s.ss)}. Person ${P(c)} steuert ${num(c.s.sq[c.who])} bei, das sind ${c.s.ss > 0 ? Math.round(c.s.sq[c.who] / c.s.ss * 100) : 0} % der Quadratsumme.`,
      alltag: 'Wie beim Einsammeln: Jede Person gibt ihre Fläche ab, alle Flächen kommen auf einen Haufen.',
      warum: 'Σ sorgt dafür, dass jede Person genau einmal in die Rechnung eingeht: Der Laufindex i geht von 1 bis n.',
      fehler: 'Die Abweichungen addieren statt ihrer Quadrate. Die Summe der Abweichungen ist immer 0, damit ließe sich keine Streuung messen.',
      check: {
        question: 'Wie groß ist die Quadratsumme der Abweichungen?',
        answer: c => c.s.ss,
        diagnose: (c, v) => v !== 'NA' && c.s.ss > 1e-9 && close(v, 0) ? '0 ist die Summe der Abweichungen. Gefragt ist die Summe ihrer Quadrate.' : null,
      },
    },
    {
      button: '÷ (n − 1)', sym: 's²', concept: 'variance', also: 'Varianz s², geteilt durch die Freiheitsgrade n − 1', perPerson: false,
      kurz: 'Der Haufen wird fair aufgeteilt. So groß ist eine typische Fläche.',
      fachlich: 'Die Quadratsumme geteilt durch die Freiheitsgrade n − 1 ergibt die Varianz s².',
      vorgerechnet: c => `${num(c.s.ss)} geteilt durch n − 1 = 5 − 1 = 4 ergibt ${num(c.s.variance)}. Das ist die Fläche eines typischen Quadrats, gemessen in Skalenpunkten zum Quadrat.`,
      alltag: 'Wie gerechtes Aufteilen: Der Haufen wird in gleich große Stücke geteilt, eins weniger, als es Personen gibt.',
      warum: 'Teilen macht Gruppen unterschiedlicher Größe vergleichbar. Warum durch n − 1 und nicht durch n, erklärt „Genau genommen“.',
      fehler: c => `Durch n statt durch n − 1 teilen. Das ergäbe ${num(c.s.ss)} / 5 = ${num(c.s.ss / 5)} statt ${num(c.s.variance)}.`,
      check: {
        question: 'Wie groß ist die Varianz s²?',
        answer: c => c.s.variance,
        diagnose: (c, v) => v === 'NA' || c.s.ss < 1e-9 ? null
          : close(v, c.s.ss / 5) ? 'Du hast durch n = 5 geteilt. Die Formel teilt durch die Freiheitsgrade n − 1 = 4.'
          : close(v, c.s.ss) ? 'Das ist noch die Quadratsumme. Es fehlt das Teilen durch n − 1.'
          : null,
      },
    },
    {
      button: '√', sym: 's', concept: 'sd', also: 'Quadratwurzel der Varianz', perPerson: false,
      kurz: 'Aus der typischen Fläche wird wieder ein Abstand: So weit liegen die Werte typischerweise von der Mitte weg.',
      fachlich: 'Die Standardabweichung s ist die Quadratwurzel der Varianz. Sie hat wieder die Einheit der Daten.',
      vorgerechnet: c => `√${num(c.s.variance)} ≈ ${num(c.s.sd)}. Probe: ${num(c.s.sd)} · ${num(c.s.sd)} ≈ ${num(Math.round(c.s.sd * 100) ** 2 / 10000)}. Die Seitenlänge des typischen Quadrats beträgt also etwa ${num(c.s.sd)} Skalenpunkte.`,
      alltag: 'Eine Terrasse mit 10 m² Fläche ist ein Quadrat mit etwa 3,16 m Seitenlänge. Die Wurzel rechnet von der Fläche zurück zur Länge.',
      warum: 'Die Varianz hat die Einheit „Skalenpunkte zum Quadrat“, die niemand deuten kann. Erst s ist wieder in Skalenpunkten und lässt sich am Zahlenstrahl abtragen.',
      fehler: c => `Die Wurzel vergessen. ${num(c.s.variance)} ist die Varianz, nicht die Standardabweichung. Prüfe die Einheit: s muss in Skalenpunkten sein.`,
      check: {
        question: 'Wie groß ist die Standardabweichung s? Zwei Nachkommastellen reichen.',
        answer: c => c.s.sd,
        diagnose: (c, v) => v !== 'NA' && Math.abs(c.s.variance - c.s.sd) > 0.02 && close(v, c.s.variance) ? 'Das ist noch die Varianz. Es fehlt die Wurzel.' : null,
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
    1: 'Die fünf Einstufungen auf dem Zahlenstrahl. Punkte lassen sich ziehen.',
    2: 'Die Pfeile zeigen die Abweichungen: grün rechts der Mitte, braunrot links davon.',
    3: 'Jede Abweichung wird zur Seite eines Quadrats. Ein Kästchen ist 1 Punkt².',
    4: 'Die Quadratsumme legt alle Flächen zusammen.',
    5: 'Geteilt durch n − 1 ergibt sich die Fläche eines typischen Quadrats: die Varianz.',
    6: 'Die Seite dieses Quadrats ist die Standardabweichung s. Oben am Zahlenstrahl: x̄ ± s.',
  },
  think: [
    {
      question: 'Alle fünf wählen die 5. Wie groß wird s?', questionFor: { variance: 'Alle fünf wählen die 5. Wie groß wird s²?' },
      options: ['0', '5', 'hängt von n ab'], correct: 0, step: 2,
      explain: 'Jede Abweichung wird 5 − 5 = 0. Null quadriert bleibt 0, die Quadratsumme ist 0, √0 = 0. Die Formel misst nur Abweichungen, und es gibt keine.',
      kurz: 'Keine Unterschiede, keine Streuung.',
      tryIt: { label: 'alle auf 5', apply: () => [5, 5, 5, 5, 5] },
    },
    {
      question: 'Alle rücken zwei Punkte nach rechts. Was macht s?', questionFor: { variance: 'Alle rücken zwei Punkte nach rechts. Was macht s²?' },
      options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 2,
      explain: 'Der Mittelwert wandert mit. In der Abweichung heben sich die 2 Punkte auf: (xᵢ + 2) − (x̄ + 2) = xᵢ − x̄. Die Streuung beschreibt, wie weit die Werte auseinanderliegen, nicht wo sie liegen.',
      kurz: 'Verschieben ändert die Lage, nicht die Streuung.',
      tryIt: { label: 'um 2 verschieben', apply: d => Math.max(...d) <= 8 ? d.map(x => x + 2) : Math.min(...d) >= 3 ? d.map(x => x - 2) : [6, 7, 7, 7, 8] },
    },
    {
      question: 'Warum nicht einfach die Abweichungen addieren, ohne Quadrat?', options: ['das ginge genauso', 'die Summe wäre immer 0'], correct: 1, step: 3,
      explain: c => `Hier: ${c.s.dev.map(d => paren(d)).join(' + ')} = 0. Die Abweichungen vom eigenen Mittelwert ergeben immer genau 0, das zeigt auch die Summenzeile der Tabelle. Erst das Quadrat macht jede Abweichung positiv.`,
      kurz: 'Plus und Minus würden sich sonst gegenseitig aufheben.',
    },
    {
      question: 'Eine Abweichung verdoppelt sich von 2 auf 4. Wie wächst ihr Beitrag zur Quadratsumme?', options: ['doppelt', 'vierfach'], correct: 1, step: 3,
      explain: '2² = 4, aber 4² = 16. Das Quadrat lässt Personen am Rand überproportional zählen. Deshalb reagiert die Streuung empfindlich auf Ausreißer.',
      kurz: 'Wer weit weg ist, zählt viel mehr.',
      tryIt: { label: 'Gruppe B, Person E auf 10', apply: () => [1, 3, 5, 7, 10] },
    },
  ],
  variants: {
    sd: {
      lastStep: 6,
      kurz: 'Die Standardabweichung sagt, wie weit die Werte typischerweise von ihrer Mitte entfernt liegen.',
      fachlich: 'Die Quadratwurzel der Varianz, also der Quadratsumme der Abweichungen vom Mittelwert geteilt durch die Freiheitsgrade n − 1.',
      symbolic: ['s = ', { big: '√', m: 6 }, { root: [{ frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')²'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 }], m: 6 }],
      aria: 's gleich Wurzel aus: Summe über alle Personen i von x i minus x quer, zum Quadrat, geteilt durch n minus 1',
      metrics: [{ label: 'Mittelwert x̄', value: c => num(c.s.mean) }, { label: 'Standardabweichung s', value: c => num(c.s.sd) }],
      interpret: c => ({
        kurz: c.s.sd < 0.005 ? 'Alle sagen dasselbe. Es gibt keine Streuung.'
          : Math.abs(c.s.sd - GROUP_A.sd) <= Math.abs(c.s.sd - GROUP_B.sd) ? 'Diese Gruppe ist sich eher einig, ähnlich wie Gruppe A.' : 'Diese Gruppe ist sich eher uneinig, ähnlich wie Gruppe B.',
        fachlich: `Die Standardabweichung beträgt s = ${num(c.s.sd)} Skalenpunkte. Die Einstufungen liegen also typischerweise etwa ${num(c.s.sd)} Punkte um den Mittelwert ${num(c.s.mean)} herum, grob zwischen ${num(c.s.mean - c.s.sd)} und ${num(c.s.mean + c.s.sd)}. Zum Vergleich: Gruppe A hat s = ${num(GROUP_A.sd)}, Gruppe B s = ${num(GROUP_B.sd)}. Je kleiner s, desto einiger ist sich eine Gruppe. Der Mittelwert allein hätte diesen Unterschied nicht gezeigt.`,
      }),
      genau: {
        kurz: 'Mit n − 1 wird die Streuung in der Bevölkerung nicht zu klein geschätzt. Und s ist etwas anderes als der durchschnittliche Abstand.',
        paragraphs: c => [
          'Warum n − 1? Die Abweichungen vom eigenen Mittelwert ergeben zusammen immer 0, das zeigt die Summenzeile der Tabelle. Kennt man vier davon, steht die fünfte fest: Es bleiben n − 1 frei wählbare Abweichungen, die Freiheitsgrade. Mit n − 1 ist s² ein erwartungstreuer Schätzer der Varianz der Grundgesamtheit, unterschätzt sie also nicht systematisch. Teilt man durch n, erhält man die mittlere quadrierte Abweichung genau dieser fünf Personen.',
          `s ist kein durchschnittlicher Abstand. Hier beträgt die mittlere absolute Abweichung ${num(c.s.mad)}, s dagegen ${num(c.s.sd)}. Das Quadrat gewichtet große Abweichungen stärker.`,
          'Die Links-rechts-Skala hier wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten.',
        ],
      },
    },
    variance: {
      lastStep: 5,
      kurz: 'Die Varianz ist die Fläche eines typischen Abweichungsquadrats. Je größer, desto weiter liegen die Werte auseinander.',
      fachlich: 'Die Quadratsumme der Abweichungen vom Mittelwert geteilt durch die Freiheitsgrade n − 1.',
      symbolic: ['s² = ', { frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')²'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 }],
      aria: 's Quadrat gleich Summe über alle Personen i von x i minus x quer, zum Quadrat, geteilt durch n minus 1',
      metrics: [{ label: 'Mittelwert x̄', value: c => num(c.s.mean) }, { label: 'Varianz s²', value: c => num(c.s.variance) }],
      interpret: c => ({
        kurz: c.s.variance < 0.005 ? 'Alle sagen dasselbe. Es gibt keine Streuung.'
          : Math.abs(c.s.variance - GROUP_A.variance) <= Math.abs(c.s.variance - GROUP_B.variance) ? 'Diese Gruppe ist sich eher einig, ähnlich wie Gruppe A.' : 'Diese Gruppe ist sich eher uneinig, ähnlich wie Gruppe B.',
        fachlich: `Die Varianz beträgt s² = ${num(c.s.variance)} Skalenpunkte zum Quadrat. Als Fläche ist sie schwer zu deuten; ihre Wurzel, die Standardabweichung s ≈ ${num(c.s.sd)}, ist wieder in Skalenpunkten.`,
      }),
      genau: {
        kurz: 'Mit n − 1 wird die Streuung in der Bevölkerung nicht zu klein geschätzt.',
        paragraphs: () => [
          'Warum n − 1? Die Abweichungen vom eigenen Mittelwert ergeben zusammen immer 0, das zeigt die Summenzeile der Tabelle. Kennt man vier davon, steht die fünfte fest: Es bleiben n − 1 frei wählbare Abweichungen, die Freiheitsgrade. Mit n − 1 ist s² ein erwartungstreuer Schätzer der Varianz der Grundgesamtheit, unterschätzt sie also nicht systematisch. Teilt man durch n, erhält man die mittlere quadrierte Abweichung genau dieser fünf Personen.',
          'Die Links-rechts-Skala hier wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten.',
        ],
      },
    },
  },
};
