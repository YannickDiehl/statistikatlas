// Begriffskarte „Ereignis & Wahrscheinlichkeit“ (probability). Beispiel: eine Person zufällig aus den 200 Befragten
// ziehen; Ereignis „hat Abitur“ (40 von 200). Zahlen in R nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { ABSCHLUSS, column, countIf, eqSign } from './gemeinsam';

const A = ABSCHLUSS;

/** Anteil der Befragten mit einem Schulabschluss-Code (Spalte x der Auswertung, sonst schulabschluss). */
const share = (c: SampleCtx, ok: (code: number) => boolean) => { const xs = column(c, 'x', 'schulabschluss'); return countIf(xs, ok) / xs.length; };
const abitur = (c: SampleCtx) => share(c, v => v === 4);

export const probability: ConceptCard = {
  concept: 'probability',
  wofuer: 'Du ziehst aus den 200 Befragten des Lehrdatensatzes eine Person blind heraus, wie bei einer Verlosung. Hat sie Abitur? Sicher weißt du das vorher nicht. Aber du kannst sagen, wie wahrscheinlich es ist, mit einer Zahl zwischen 0 und 1.',
  kurz: 'Eine Wahrscheinlichkeit sagt dir, welcher Anteil der Ziehungen ein Ergebnis treffen würde, wenn du sehr oft neu ziehst. 0 heißt nie, 1 heißt immer.',
  stellDirVor: {
    text: `${A.count[4]} der ${A.n} Befragten haben Abitur, ${A.count[0]} haben keinen Schulabschluss. Ziehst du eine Person zufällig, hat jede dieselbe Chance. Dann ist die Wahrscheinlichkeit für Abitur ${A.count[4]} von ${A.n}, also ${num(A.count[4] / A.n)} oder ${pct(A.count[4] / A.n)}. Die Wahrscheinlichkeit für kein Abitur ist 1 − ${num(A.count[4] / A.n)} = ${num(1 - A.count[4] / A.n)}.`,
    figures: [
      { label: 'Befragte mit Abitur', value: `${A.count[4]} von ${A.n}` },
      { label: 'P(Abitur)', value: num(A.count[4] / A.n) },
      { label: 'P(kein Abitur)', value: num(1 - A.count[4] / A.n) },
    ],
  },
  heisst: {
    sym: 'P(A)', say: 'P von A',
    fach: 'Ein Ereignis A fasst mögliche Ergebnisse eines Zufallsvorgangs zusammen. Seine Wahrscheinlichkeit P(A) liegt zwischen 0 und 1; das Gegenereignis hat P(nicht A) = 1 − P(A).',
  },
  bausteine: [
    {
      title: 'Das Ereignis festlegen',
      was: 'Zuerst sagst du genau, was zählt: Die gezogene Person hat Abitur. So ein Ergebnis heißt Ereignis, man kürzt es mit A ab.',
      warum: 'Nur für ein klar beschriebenes Ereignis lässt sich eine Wahrscheinlichkeit angeben. „Hat einen guten Abschluss“ wäre zu ungenau.',
      acht: `Ein Ereignis kann mehrere Ergebnisse umfassen. „Mindestens Fachhochschulreife“ fasst Fachhochschulreife und Abitur zusammen: ${A.count[3] + A.count[4]} von ${A.n} Befragten.`,
    },
    {
      title: 'Die Chance als Anteil ausrechnen',
      was: `Hat jede Person dieselbe Chance, gezogen zu werden, zählst du die Treffer und teilst durch alle. ${A.count[4]} von ${A.n} haben Abitur.`,
      rechnung: `P(Abitur) = ${A.count[4]} / ${A.n} = ${num(A.count[4] / A.n)}`,
      warum: `Ziehst du sehr oft neu, kommt jede Person etwa gleich oft dran. Deshalb hat in etwa ${Math.round(A.count[4] / A.n * 100)} von 100 Ziehungen die gezogene Person Abitur.`,
      acht: 'Das gilt für die Ziehung aus genau diesen 200. Wie viele Erwachsene in Deutschland Abitur haben, sagt die Zahl nicht; dafür braucht es eine Zufallsstichprobe aus allen Erwachsenen.',
      concept: 'random_sampling',
    },
    {
      title: 'Das Gegenteil mitdenken',
      was: 'Entweder hat die gezogene Person Abitur oder nicht. Beide Wahrscheinlichkeiten zusammen ergeben immer 1.',
      rechnung: `P(kein Abitur) = 1 − ${num(A.count[4] / A.n)} = ${num(1 - A.count[4] / A.n)}, das sind ${A.n - A.count[4]} von ${A.n}.`,
      warum: 'Oft ist das Gegenteil leichter zu zählen. Dann rechnest du 1 minus seine Wahrscheinlichkeit.',
      acht: 'Das Gegenteil heißt: alles außer A. Zum Gegenteil von Abitur gehören alle anderen Abschlüsse und kein Abschluss, nicht nur „ohne Schulabschluss“.',
    },
  ],
  ausprobieren: [
    {
      question: 'Jemand rechnet eine Wahrscheinlichkeit aus und bekommt 1,2. Was sagt dir das?',
      options: ['ein sehr wahrscheinliches Ereignis', 'ein Rechenfehler', 'ein sicheres Ereignis'], correct: 1, step: 2,
      explain: 'Wahrscheinlichkeiten liegen immer zwischen 0 und 1. Mehr Treffer als Personen gibt es nicht: Höchstens alle 200 Befragten können Abitur haben.',
      kurz: 'Über 1 und unter 0 gibt es keine Wahrscheinlichkeit.',
    },
    {
      question: 'Du ziehst zehnmal eine Person und legst sie jedes Mal zurück. Haben dann genau 2 der 10 Gezogenen Abitur?',
      options: ['ja, sicher', 'nicht unbedingt'], correct: 1, step: 2,
      explain: '0,2 beschreibt den Anteil auf lange Sicht. Bei nur 10 Ziehungen sind auch 0, 1, 3 oder 4 Treffer gut möglich. Genau 2 kommen nur in etwa 30 von 100 solchen Zehnerserien vor.',
      kurz: 'Wahrscheinlichkeiten zeigen sich erst bei vielen Wiederholungen.',
    },
    {
      question: 'Wie wahrscheinlich ziehst du eine Person mit Abitur oder Fachhochschulreife?',
      options: ['0,2', 'gut 0,4', '0,8'], correct: 1, step: 1,
      explain: `Niemand hat beides als höchsten Abschluss, die Ereignisse schließen sich aus. Dann zählst du die Treffer zusammen: ${A.count[4]} + ${A.count[3]} = ${A.count[3] + A.count[4]} von ${A.n}, also gut 0,4.`,
      kurz: 'Für Ereignisse, die sich ausschließen, addierst du die Wahrscheinlichkeiten.',
    },
  ],
  regler: {
    label: 'Wie viele der 200 Befragten haben das Merkmal?',
    min: 0, max: 200, step: 1, initial: 40,
    format: v => `${v} von 200`,
    describe: v => v === 0 ? 'Niemand hat es: P = 0. Das Ereignis tritt bei keiner Ziehung ein.'
      : v === 200 ? 'Alle haben es: P = 1. Das Ereignis tritt bei jeder Ziehung ein.'
      : `P = ${v} / 200 = ${pct(v / 200)}. Auf lange Sicht treffen etwa ${v} von 200 Ziehungen eine solche Person, ${200 - v} nicht. Das Gegenereignis hat ${pct(1 - v / 200)}.`,
  },
  check: {
    question: `Im Lehrdatensatz haben ${A.mitWeiterbildung} von ${A.n} Befragten in den letzten zwölf Monaten eine Weiterbildung gemacht. Du ziehst eine Person zufällig. Was stimmt?`,
    options: [
      `Die Wahrscheinlichkeit für eine Weiterbildung ist ${A.mitWeiterbildung}.`,
      `Die Wahrscheinlichkeit für eine Weiterbildung ist ${num(A.mitWeiterbildung / A.n)}, für keine ${num(1 - A.mitWeiterbildung / A.n)}.`,
      `Die Wahrscheinlichkeit für keine Weiterbildung ist ${num(A.mitWeiterbildung / A.n)}.`,
      `Die gezogene Person hat zu ${pct(A.mitWeiterbildung / A.n, 0)} eine Weiterbildung gemacht.`,
    ],
    correct: 1,
    right: `Genau. ${A.mitWeiterbildung} / ${A.n} = ${num(A.mitWeiterbildung / A.n)}, und das Gegenereignis hat 1 − ${num(A.mitWeiterbildung / A.n)} = ${num(1 - A.mitWeiterbildung / A.n)}.`,
    diagnose: {
      0: `Fast! ${A.mitWeiterbildung} ist die Anzahl. Die Wahrscheinlichkeit ist der Anteil: ${A.mitWeiterbildung} / ${A.n} = ${num(A.mitWeiterbildung / A.n)}.`,
      2: `Fast! Da sind Ereignis und Gegenteil vertauscht. ${num(A.mitWeiterbildung / A.n)} gehört zur Weiterbildung, für keine bleiben ${num(1 - A.mitWeiterbildung / A.n)}.`,
      3: 'Fast! Eine einzelne Person hat eine Weiterbildung gemacht oder nicht. Die Prozentzahl beschreibt die Ziehung, nicht die Person.',
    },
  },
  fuerDich: 'Liest du „Partei X gewinnt mit 70 % Wahrscheinlichkeit“, heißt das nicht, dass sie 70 % der Stimmen bekommt. Es heißt: In etwa 7 von 10 ähnlichen Lagen würde sie gewinnen, in 3 nicht.',
  genau: {
    kurz: 'Hier ist die Wahrscheinlichkeit ein Anteil, weil jede der 200 Personen dieselbe Chance hat. Allgemein gehört sie zu einem Zufallsmodell, und ein beobachteter Anteil schätzt sie.',
    paragraphs: [
      'Ein beobachteter Anteil ist eine relative Häufigkeit in diesen Daten. Eine Modellwahrscheinlichkeit gehört zum angenommenen Zufallsmodell, hier zur Ziehung mit gleichen Chancen. Bei einer Zufallsstichprobe schätzt der Anteil in der Stichprobe die Wahrscheinlichkeit in der Grundgesamtheit.',
      'Ein Zufallsmodell muss zum Auswahlprozess passen. Haben nicht alle Personen dieselbe Chance, in die Stichprobe zu kommen, beschreibt der ungewichtete Anteil die Grundgesamtheit verzerrt; dann helfen Gewichte.',
      'Die Grundregeln gelten für jede Wahrscheinlichkeit: 0 ≤ P(A) ≤ 1 und P(nicht A) = 1 − P(A). Für Ereignisse, die sich gegenseitig ausschließen, addieren sich die Wahrscheinlichkeiten.',
    ],
  },
};

export const probabilityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie wahrscheinlich ziehst du eine Person mit Abitur?',
    value: abitur,
    result: c => {
      const xs = column(c, 'x', 'schulabschluss'), n = xs.length, k = countIf(xs, v => v === 4), p = k / n, hi = countIf(xs, v => v >= 3);
      return {
        kurz: `${k} von ${n} Befragten haben Abitur. Ziehst du eine Person zufällig, ist die Wahrscheinlichkeit dafür ${num(p)}, also ${pct(p)}. Für kein Abitur bleiben ${num(1 - p)}.`,
        fachlich: `P(Abitur) = ${k} / ${n} ${eqSign(p)} ${num(p)} und P(nicht Abitur) = 1 − P(Abitur) ${eqSign(1 - p)} ${num(1 - p)}, bei einer Ziehung mit gleichen Chancen aus diesen ${n} Befragten.`,
        zusatz: `Mindestens Fachhochschulreife haben ${hi} von ${n}, das ist eine Wahrscheinlichkeit von ${pct(hi / n)}.`,
      };
    },
    voraussetzung: 'Jede der 200 Befragten hat dieselbe Chance, gezogen zu werden. Für Aussagen über alle Erwachsenen bräuchte es eine Zufallsstichprobe.',
    think: [
      {
        question: 'Angenommen, alle 200 hätten Abitur. Wie wahrscheinlich ziehst du dann eine Person ohne Abitur?',
        options: ['0', '0,2', '0,8'], correct: 0,
        explain: 'Alle 200 sind Treffer für Abitur, für das Gegenteil bleibt niemand: 1 − 1 = 0. Ein Ereignis, das nie eintreten kann, hat die Wahrscheinlichkeit 0.',
        kurz: 'Sicheres Ereignis 1, unmögliches 0.',
        tryIt: { label: 'alle auf Abitur (Code 4)', op: 'constant', column: 'x', value: 4 },
        expect: { change: 'equals', value: 0, measure: c => 1 - abitur(c) },
      },
      {
        question: 'Angenommen, alle 200 hätten einen mittleren Abschluss. Wie wahrscheinlich ziehst du jemanden mit Abitur?',
        options: ['0', '0,2', '1'], correct: 0,
        explain: 'Niemand hat dann Abitur. Es gibt keinen Treffer, also ist die Wahrscheinlichkeit 0 von 200, gleich 0.',
        kurz: 'Ohne Treffer ist die Wahrscheinlichkeit 0.',
        tryIt: { label: 'alle auf mittleren Abschluss (Code 2)', op: 'constant', column: 'x', value: 2 },
        expect: { change: 'equals', value: 0 },
      },
    ],
  },
  r: {
    entry: 'frequency', variant: 0,
    outputMap: [
      { match: 'Valid %', atlas: 'P(ohne Schulabschluss) in Prozent', step: 2, explain: 'Valid % ist der Anteil unter den gültigen Antworten: 21 % haben keinen Schulabschluss. Ziehst du zufällig, ist das die Wahrscheinlichkeit 0,21.' },
      { match: '42', atlas: 'Anzahl der Treffer', step: 2, explain: '42 Befragte haben keinen Schulabschluss. Geteilt durch alle 200 ergibt das die Wahrscheinlichkeit.' },
      { match: 'valid N', atlas: 'n, durch das du teilst', step: 2, explain: 'valid N zählt alle gültigen Antworten. Durch diese Zahl teilst du die Treffer.' },
    ],
    check: {
      question: 'Welche Zahl ist die Wahrscheinlichkeit in Prozent, eine Person ohne Schulabschluss zu ziehen? Tippe sie an.', correct: 'Valid %',
      wrong: {
        '42': 'Fast! 42 ist die Anzahl der Treffer. Die Wahrscheinlichkeit ist ihr Anteil: 42 von 200, unter Valid %.',
        'valid N': 'Fast! 200 ist die Zahl aller Befragten. Durch sie teilst du; die Wahrscheinlichkeit steht unter Valid %.',
      },
    },
  },
  next: {
    next: { id: 'conditional_probability', why: 'Was ändert sich, wenn du schon etwas über die gezogene Person weißt, etwa dass sie eine Weiterbildung gemacht hat?' },
    before: [
      { id: 'frequency', why: 'Die Häufigkeitstabelle liefert die Anteile, aus denen hier Wahrscheinlichkeiten werden.' },
      { id: 'random_sampling', why: 'Gleiche Chancen für alle machen aus einem Anteil eine Wahrscheinlichkeit.' },
    ],
    after: [
      { id: 'random_variable', why: 'Gibt jedem Ergebnis eine Zahl, mit der sich rechnen lässt.' },
      { id: 'stochastic_independence', why: 'Wann zwei Ereignisse nichts übereinander verraten.' },
      { id: 'theoretical_distribution', why: 'Ein Modell, das allen möglichen Werten Wahrscheinlichkeiten gibt.' },
    ],
    more: [
      { id: 'law_large_numbers', why: 'Warum sich der Anteil bei vielen Ziehungen der Wahrscheinlichkeit nähert.' },
      { id: 'logit', why: 'Übersetzt Wahrscheinlichkeiten in Odds und Logits.' },
    ],
  },
};
