// Begriffskarte „Exakte Verteilung & Näherung“. Beispiel: 82 von 200 Befragten mit Weiterbildung gegen die Hälfte,
// exakter Binomialtest (wie binom.test und mariposa::binomial_test) gegen die Normalnäherung. Zahlen in R, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';
import { anteilTest, binomApprox, binomExact, jaBei, pShown, small } from './rechnen';
import { ANTEIL } from './alpha';

/** Zahl der Befragten am Regler, auf Zehner gerundet, 10 bis 200. */
export const nOf = (v: number) => Math.max(10, Math.min(200, Math.round(v / 10) * 10));
/** Exakter und genäherter p-Wert für n Befragte mit (abgerundet) 41 % Ja. */
export function vergleich(n: number) {
  const k = jaBei(n), a = binomApprox(k, n);
  return { n, k, exact: binomExact(k, n), approx: a.p, z: a.z };
}
const B200 = vergleich(200), B20 = vergleich(20), B10 = vergleich(10);

export const exakt: ConceptCard = {
  concept: 'exact_asymptotic',
  picture: 'b09-exakt',
  wofuer: `Bei ${ANTEIL.k} von ${ANTEIL.n} Befragten mit Weiterbildung meldet der Binomialtest p = 0.013. Eine Näherung mit der Normalverteilung kommt auf ${small(B200.approx)}. Welche Zahl stimmt, und wann ist die Näherung gut genug?`,
  kurz: 'Ein exakter Test rechnet für genau deine Fallzahl aus, welche Ergebnisse ohne echten Unterschied vorkämen. Ein asymptotischer Test nimmt eine Näherung, die erst bei vielen Fällen gut passt.',
  stellDirVor: {
    text: `${ANTEIL.k} von ${ANTEIL.n} Befragten haben eine Weiterbildung gemacht. Unter der Nullhypothese wären es im Mittel 100. Der Binomialtest zählt exakt, wie wahrscheinlich 82 oder weniger und 118 oder mehr wären: R meldet p = 0.013. Die Normalverteilung als Näherung liefert p ≈ ${small(B200.approx)}. Bei 200 Befragten liegen beide nah beieinander.`,
    figures: [
      { label: 'beobachtet', value: `${ANTEIL.k} von ${ANTEIL.n}` },
      { label: 'erwartet unter H₀', value: '100' },
      { label: 'exakt', value: `p ≈ ${small(B200.exact)}` },
      { label: 'Näherung', value: `p ≈ ${small(B200.approx)}` },
    ],
  },
  heisst: {
    fach: 'Exakt heißt: Die Nullverteilung gilt für den endlichen Stichprobenumfang, etwa die Binomialverteilung. Asymptotisch heißt: Man ersetzt sie durch eine Grenzverteilung wie die Normal- oder χ²-Verteilung, die erst für große n stimmt.',
  },
  bausteine: [
    {
      title: 'Exakt zählen',
      was: 'Unter H₀ sagt jede Person mit 50 % Wahrscheinlichkeit Ja. Die Binomialverteilung sagt genau, wie oft 82 oder weniger Ja oder 118 oder mehr herauskämen.',
      rechnung: `p = P(X ≤ 82) + P(X ≥ 118) ≈ ${small(B200.exact)}`,
      warum: 'Für 200 Personen lässt sich jede mögliche Anzahl von 0 bis 200 genau durchrechnen.',
      acht: 'Exakt heißt nicht annahmefrei. Auch der exakte Test setzt unabhängige Befragte voraus.',
      concept: 'binomial_distribution',
    },
    {
      title: 'Mit der Glockenkurve nähern',
      was: 'Statt zu zählen, legen wir eine Normalverteilung mit der Mitte 100 und der Standardabweichung √50 ≈ 7,07 darüber. Der Abstand von 18 Personen entspricht z ≈ −2,55.',
      rechnung: `z = (82 − 100) / 7,07 ≈ ${num(B200.z)}; p ≈ ${small(B200.approx)}`,
      warum: 'Bei vielen Personen sieht die Binomialverteilung fast aus wie eine Glocke. Eine Kurve ist schneller als 201 einzelne Wahrscheinlichkeiten.',
      acht: `Die Näherung ist bei wenigen Fällen ungenau. Bei 20 Befragten mit 8 Ja liefert sie ${num(B20.approx)} statt ${num(B20.exact)}.`,
      concept: 'central_limit',
    },
    {
      title: 'Die Güte der Näherung prüfen',
      was: 'Ob die Näherung reicht, hängt von der Fallzahl ab, bei Tabellen auch von den erwarteten Häufigkeiten in den Zellen.',
      warum: 'Je mehr Fälle, desto besser passt die Kurve. Mit wenigen Fällen ist der exakte Test die sichere Wahl.',
      acht: 'Die Regel „erwartet mindestens 5 je Zelle“ beim χ²-Test ist eine Faustregel, keine Garantie.',
      concept: 'chi_square',
    },
  ],
  ausprobieren: [
    {
      question: 'Bei 10 Befragten sagen 4 Ja. Liegen exakter p-Wert und Näherung dann näher beieinander als bei 200 Befragten?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: `Exakt ergibt sich p ≈ ${num(B10.exact)}, die Näherung liefert ${num(B10.approx)}. Bei 200 Befragten waren es ${small(B200.exact)} und ${small(B200.approx)}. Schieb den Regler auf 10.`,
      kurz: 'Wenige Fälle, schlechte Näherung.',
    },
    {
      question: 'Ist ein exakter Test frei von Annahmen?',
      options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Er setzt voraus, dass die Befragten unabhängig sind und alle dieselbe Wahrscheinlichkeit haben. Exakt heißt nur: keine Näherung der Nullverteilung.',
      kurz: 'Exakt ist nicht annahmefrei.',
    },
    {
      question: 'Warum rechnet der χ²-Test für Kreuztabellen meist mit einer Näherung?',
      options: ['weil exakt nicht geht', 'weil exaktes Zählen bei großen Tabellen sehr aufwendig ist'], correct: 1, step: 3,
      explain: 'Exakt müsste man alle Tabellen mit denselben Rändern durchzählen. Bei vielen Befragten sind das unvorstellbar viele, und die χ²-Kurve passt dann gut.',
      kurz: 'Die Näherung spart Rechenzeit, wenn sie gut passt.',
    },
  ],
  regler: {
    label: 'Wie viele Befragte, bei gleichem Anteil von etwa 41 %?',
    min: 10, max: 200, step: 10, initial: 200,
    format: v => { const n = nOf(v); return `${n} Befragte, ${jaBei(n)} mit Weiterbildung`; },
    describe: v => {
      const b = vergleich(nOf(v));
      return `Bei ${b.n} Befragten mit ${b.k} Ja ergibt sich exakt p ≈ ${small(b.exact)}, mit der Normalverteilung genähert p ≈ ${small(b.approx)}. ${Math.abs(b.exact - b.approx) <= 0.005 ? 'Die Näherung liegt nah am exakten Wert.' : 'Die Näherung weicht noch spürbar ab.'}`;
    },
  },
  check: {
    question: 'Was heißt „exakter Test“?',
    options: [
      'Der Test braucht keine Annahmen.',
      'Die Nullverteilung gilt genau für diese Fallzahl, ohne Näherung.',
      'Der p-Wert ist auf viele Stellen genau gerundet.',
      'Das Ergebnis ist sicher richtig.',
    ],
    correct: 1,
    right: 'Genau. Exakt beschreibt die Nullverteilung: Sie gilt für genau diese Fallzahl, ohne Grenzwertnäherung.',
    diagnose: {
      0: 'Fast! Auch ein exakter Test setzt etwa unabhängige Befragte voraus.',
      2: 'Fast! Exakt bezieht sich auf die Nullverteilung, nicht auf die Rundung.',
      3: 'Fast! Auch ein exakter Test kann Fehler erster und zweiter Art machen. Exakt ist nur seine Nullverteilung.',
    },
  },
  fuerDich: 'Bei kleinen Gruppen oder dünn besetzten Kreuztabellen greif zu einem exakten Test wie binomial_test() oder fisher_test(). Bei vielen Befragten liefern exakter und genäherter Test fast dasselbe.',
  genau: {
    kurz: 'Exakt bedeutet nicht annahmefrei, und es sagt nichts über Nachkommastellen. Bei diskreten exakten Tests liegt die tatsächliche Fehlerquote oft unter α.',
    paragraphs: [
      `Mit Stetigkeitskorrektur rückt die Näherung näher heran: (|82 − 100| − 0,5) / 7,07 ≈ 2,47 ergibt p ≈ ${small(binomApprox(82.5, 200).p)}, fast wie exakt.`,
      'Fishers exakter Test zählt alle Kreuztabellen mit denselben Rändern durch. Der χ²-Test nähert dieselbe Frage mit der χ²-Verteilung an.',
      'Monte-Carlo-Verfahren simulieren die Nullverteilung, statt sie zu zählen oder zu nähern. Sie bringen eine eigene Unsicherheit durch die Simulation mit.',
      'Wie gut eine Näherung passt, hängt auch von Bindungen, Zellbesetzungen und der Form der Verteilung ab, nicht nur von n.',
    ],
  },
};

/** Reiter: exakter und genäherter p-Wert für die aktuellen Daten, In R binomial_test(), Weiter. */
export const exaktTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung' },
    kurz: 'Mit allen 200 Befragten: Wie weit liegen exakter Binomialtest und Normalnäherung auseinander?',
    value: c => anteilTest(c).exact,
    result: c => {
      const r = anteilTest(c);
      return {
        kurz: `${r.k} von ${r.n} Befragten haben eine Weiterbildung gemacht. Exakt ergibt sich p ${pShown(r.exact)}, mit der Normalverteilung genähert p ${pShown(r.p)}. ${Math.abs(r.exact - r.p) <= 0.005 ? 'Bei 200 Befragten liegen beide nah beieinander.' : 'Die Näherung weicht hier spürbar ab.'}`,
        fachlich: `Exakter Binomialtest gegen 50 %: p ${pShown(r.exact)}. Normalnäherung: z = (${r.k} − ${r.n / 2}) / √${r.n / 4} ≈ ${num(r.z)}, p ${pShown(r.p)}.`,
      };
    },
    voraussetzung: 'Beide Tests nehmen unabhängige Befragte an, die alle mit derselben Wahrscheinlichkeit Ja sagen.',
    think: [
      {
        question: 'Ja und Nein werden getauscht. Was passiert mit dem exakten p-Wert?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
        explain: 'Statt 82 sind es 118 von 200, wieder 18 Personen von der Hälfte entfernt. Die Binomialverteilung mit 50 % ist symmetrisch.',
        kurz: 'Symmetrisch heißt: Die Richtung ist egal.',
        tryIt: { label: 'Ja und Nein tauschen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle hätten eine Weiterbildung gemacht. Was passiert mit dem genäherten p-Wert?', options: ['wird kleiner', 'bleibt gleich', 'wird größer'], correct: 0,
        explain: '200 von 200 liegen weit weg von der Hälfte. Auch die Näherung meldet dann einen winzigen p-Wert.',
        kurz: 'Weit weg von H₀: kleines p, exakt wie genähert.',
        tryIt: { label: 'alle auf Ja', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'down', measure: c => anteilTest(c).p },
      },
    ],
  },
  r: {
    entry: 'binomial_test', variant: 0,
    outputMap: [
      { match: 'p', atlas: 'exakter p-Wert', step: 1, explain: 'Aus der Binomialverteilung für genau 200 Befragte gezählt, ohne Näherung.' },
      { match: 'prop', atlas: 'beobachteter Anteil', explain: '82 von 200 sind 0,41.' },
      { match: '0.500', atlas: 'Anteil unter H₀', explain: 'Der Vergleichswert der Nullhypothese: die Hälfte.' },
      { match: 'N', atlas: 'n', explain: 'Die Fallzahl, für die die Binomialverteilung exakt gilt.' },
    ],
    check: {
      question: 'Welche Zahl hat R exakt aus der Binomialverteilung gezählt? Tippe sie an.', correct: 'p',
      wrong: { prop: 'Fast! Das ist der beobachtete Anteil. Gezählt wurde die Wahrscheinlichkeit dahinter, der p-Wert.', '0.500': 'Fast! Das ist der Anteil der Nullhypothese. Gezählt wurde der p-Wert.', N: 'Fast! N ist die Fallzahl. Gezählt wurde der p-Wert.' },
    },
  },
  next: {
    next: { id: 'binomial_test', why: 'Der exakte Test für einen Anteil, mit dem das Beispiel rechnet.' },
    before: [
      { id: 'null_distribution', why: 'Exakt oder genähert ist immer die Nullverteilung.' },
      { id: 'cumulative_probability', why: 'Aus der Verteilungsfunktion liest man die Randflächen ab.' },
    ],
    after: [
      { id: 'chi_square', why: 'Rechnet mit einer asymptotischen χ²-Näherung.' },
      { id: 'fisher_test', why: 'Die exakte Wahl für kleine Kreuztabellen.' },
    ],
    more: [{ id: 'central_limit', why: 'Erklärt, warum die Glockenkurve bei vielen Fällen passt.' }],
  },
};
