// Begriffskarte „Signifikanzniveau α“. Beispiel: 82 von 200 Befragten mit Weiterbildung gegen die Hälfte
// (exakter Binomialtest wie mariposa::binomial_test(weiterbildung, p = .5)). Zahlen in R, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num, pct } from '../../format';
import { anteilTest, outOf100, pShown, small } from './rechnen';

/** Weiterbildung gegen 50 %: exakter p-Wert und tatsächliche Fehlerquote des Tests bei 200 Befragten (R, siehe Test). */
export const ANTEIL = { k: 82, n: 200, p: 0.013130356, size05: 0.040037192 } as const;

export const alpha: ConceptCard = {
  concept: 'alpha_level',
  picture: 'b09-alpha',
  wofuer: `Hat genau die Hälfte der Befragten in den letzten zwölf Monaten eine Weiterbildung gemacht? Im Lehrdatensatz sind es ${ANTEIL.k} von ${ANTEIL.n}. Ab welchem p-Wert sagst du: Das passt nicht mehr zur Hälfte? Diese Schwelle legst du vorher fest.`,
  kurz: 'Das Signifikanzniveau α ist die Schwelle, die du vor der Auswertung festlegst. Liegt p darunter, verwirfst du die Nullhypothese und nennst das Ergebnis signifikant.',
  stellDirVor: {
    text: `${ANTEIL.k} von ${ANTEIL.n} Befragten haben in den letzten zwölf Monaten eine Weiterbildung gemacht, das sind 41 %. Die Nullhypothese sagt: In der Grundgesamtheit sind es 50 %. Der Binomialtest in R meldet p = 0.013. Bei α = 0,05 heißt das signifikant, bei α = 0,01 nicht.`,
    figures: [
      { label: 'mit Weiterbildung', value: `${ANTEIL.k} von ${ANTEIL.n}` },
      { label: 'Anteil', value: '41 %' },
      { label: 'p-Wert', value: small(ANTEIL.p) },
      { label: 'übliche Schwelle α', value: '0,05' },
    ],
  },
  heisst: {
    sym: 'α', say: 'alpha',
    fach: 'Die vorab gewählte Obergrenze für die Wahrscheinlichkeit, eine wahre Nullhypothese zu verwerfen, also für den Fehler erster Art. Der Test verwirft H₀, wenn p höchstens α ist.',
  },
  bausteine: [
    {
      title: 'Die Schwelle vorher wählen',
      was: 'Vor der Auswertung legst du fest, wie viele Fehlalarme du hinnimmst. Üblich ist α = 0,05, also 5 %.',
      warum: 'Würdest du die Schwelle erst nach dem Blick auf p wählen, könntest du jedes Ergebnis passend machen.',
      acht: 'α ist keine Eigenschaft der Daten. Es ist eine Regel, die du dir selbst gibst, und es misst nicht die Größe eines Effekts.',
      concept: 'hypothesis',
    },
    {
      title: 'p mit α vergleichen',
      was: 'Nach der Auswertung legst du p neben α. Ist p höchstens so groß wie α, verwirfst du H₀.',
      rechnung: `p ≈ ${small(ANTEIL.p)} < α = 0,05: H₀ verwerfen. Bei α = 0,01 wäre p ≈ ${small(ANTEIL.p)} > 0,01: H₀ nicht verwerfen.`,
      warum: 'So wird aus einer Zahl eine Entscheidung: verwerfen oder nicht verwerfen.',
      acht: 'p und α sind verschiedene Dinge. α wählst du vorher, p rechnet R aus den Daten.',
      concept: 'p_value',
    },
    {
      title: 'Den Preis kennen',
      was: 'α ist die Quote der Fehlalarme, die du in Kauf nimmst. Gäbe es keinen Unterschied, würdest du bei α = 0,05 in etwa 5 von 100 Studien trotzdem einen melden.',
      warum: 'Ein kleineres α schützt besser vor Fehlalarmen. Dafür übersiehst du echte Unterschiede leichter.',
      acht: 'α = 0,05 heißt nicht, dass diese eine Entscheidung mit 5 % Wahrscheinlichkeit falsch ist. Es ist eine Quote über viele Studien, in denen es in Wahrheit keinen Unterschied gibt.',
      concept: 'type_errors',
    },
  ],
  ausprobieren: [
    {
      question: `Du hättest α = 0,01 gewählt. Ist das Ergebnis p = ${small(ANTEIL.p)} dann signifikant?`,
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: `${small(ANTEIL.p)} liegt über 0,01. Bei dieser strengeren Schwelle verwirfst du H₀ nicht. Schieb den Regler auf 0,01.`,
      kurz: 'Dasselbe p, andere Schwelle, andere Entscheidung.',
    },
    {
      question: `Nach dem Blick auf p = ${small(ANTEIL.p)} wechselst du von α = 0,01 auf 0,05. Was ist das Problem?`,
      options: ['keins, 0,05 ist üblich', 'die Fehlerquote stimmt nicht mehr'], correct: 1, step: 1,
      explain: 'Wer die Schwelle nach dem Ergebnis wählt, entscheidet immer so, wie es passt. Dann gilt keine feste Fehlerquote mehr.',
      kurz: 'α gehört vor die Auswertung.',
    },
    {
      question: 'In 1.000 Studien gibt es keinen einzigen echten Unterschied. Wie viele wären bei α = 0,05 trotzdem signifikant?',
      options: ['etwa 50', 'keine', 'etwa 500'], correct: 0, step: 3,
      explain: '5 % von 1.000 sind 50. So viele Fehlalarme entstehen allein durch Zufall.',
      kurz: 'α ist die Quote der Fehlalarme ohne echten Unterschied.',
    },
  ],
  regler: {
    label: 'Welche Schwelle α legst du fest?',
    min: 0.001, max: 0.1, step: 0.001, initial: 0.05,
    format: v => `α = ${num(v, 3)}`,
    describe: v => {
      const reject = ANTEIL.p <= v, near = Math.abs(v - ANTEIL.p) < 0.0015, p = near ? num(ANTEIL.p, 4) : small(ANTEIL.p);
      return `Mit α = ${num(v, 3)} liegt p ≈ ${p} ${near ? 'knapp ' : ''}${reject ? 'darunter: Du verwirfst H₀ und nennst das Ergebnis signifikant' : 'darüber: Du verwirfst H₀ nicht'}. Gäbe es keinen Unterschied, würdest du mit dieser Regel in höchstens ${pct(v)} der Studien trotzdem einen melden.`;
    },
  },
  check: {
    question: 'Was bedeutet α = 0,05?',
    options: [
      'Mit 5 % Wahrscheinlichkeit ist dieses Ergebnis falsch.',
      'Gäbe es keinen Unterschied, würde der Test in etwa 5 von 100 Studien trotzdem einen melden.',
      'Der Unterschied muss mindestens 5 % groß sein.',
      'Das Ergebnis ist zu 95 % sicher.',
    ],
    correct: 1,
    right: 'Genau. α ist die Quote der Fehlalarme, die du in Kauf nimmst, wenn es in Wahrheit keinen Unterschied gibt.',
    diagnose: {
      0: 'Fast! α ist eine Quote über viele Studien ohne echten Unterschied: In etwa 5 von 100 davon meldet der Test trotzdem einen. Ob dieses eine Ergebnis falsch ist, sagt α nicht.',
      2: 'Fast! α sagt nichts über die Größe eines Unterschieds. Dafür gibt es Effektgrößen.',
      3: 'Fast! Das klingt verlockend, stimmt aber nicht. α begrenzt nur die Fehlalarme, wenn H₀ stimmt.',
    },
  },
  fuerDich: 'Leg α fest, bevor du R startest, und schreib es in die Hausarbeit, zusammen mit den Hypothesen. „Signifikant“ heißt dann nur: p lag unter deiner Schwelle. Wie groß der Unterschied ist, sagt erst die Effektgröße.',
  genau: {
    kurz: 'α begrenzt die Quote der Fehler erster Art, wenn H₀ und die Annahmen des Tests stimmen. Bei diskreten Tests wie dem Binomialtest liegt die tatsächliche Quote oft darunter.',
    paragraphs: [
      '0,05 ist eine Konvention, kein Naturgesetz. Wo ein Fehlalarm teuer ist, wählt man kleinere Werte wie 0,01 oder 0,001. Wer viele Tests rechnet, muss α für die ganze Familie anpassen (Begriff „Mehrere Vergleiche“).',
      `Beim Binomialtest gibt es nur ganze Zahlen von Personen. Deshalb trifft die tatsächliche Fehlerquote α selten genau: Bei 200 Befragten und 50 % liegt sie für α = 0,05 bei ${num(ANTEIL.size05, 3)}.`,
      'mariposa markiert p < 0,05 mit einem Stern, p < 0,01 mit zwei und p < 0,001 mit drei. Die Sterne ersetzen keine vorab gewählte Schwelle.',
      'Ob gerade diese eine Entscheidung ein Irrtum war, weiß man bei einer einzelnen Studie nicht. α beschreibt nur, wie oft die Regel über viele Studien hinweg irrt, wenn H₀ stimmt.',
    ],
  },
};

/** Reiter: Weiterbildung gegen 50 % mit den aktuellen Daten und der Entscheidung bei α = 0,05 und 0,01, In R binomial_test(), Weiter. */
export const alphaTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Passt der Anteil mit Weiterbildung zu genau der Hälfte, bei α = 0,05?',
    value: c => anteilTest(c).exact,
    result: c => {
      const r = anteilTest(c), sig = r.exact <= 0.05;
      return {
        kurz: `${r.k} von ${r.n} Befragten haben eine Weiterbildung gemacht, ${num(r.k / r.n * 100, 1)} %. Gäbe es in der Grundgesamtheit genau 50 %, käme ein mindestens so großer Abstand ${outOf100(r.exact)} Stichproben vor (p ${pShown(r.exact)}). Bei α = 0,05 ${sig ? 'verwirfst du H₀: signifikant' : 'verwirfst du H₀ nicht'}.`,
        fachlich: `Exakter Binomialtest, zweiseitig, H₀: π = 0,5; p ${pShown(r.exact)}. Bei α = 0,01 wäre das ${r.exact <= 0.01 ? 'ebenfalls signifikant' : 'nicht signifikant'}.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an, die alle mit derselben Wahrscheinlichkeit Ja sagen.',
    think: [
      {
        question: 'Alle Angaben umgepolt: Ja wird Nein und Nein wird Ja. Was passiert mit p?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
        explain: 'Jetzt sind es 118 statt 82 von 200. Der Abstand zu 100 bleibt 18 Personen, nur in die andere Richtung. Zweiseitig zählt beides gleich.',
        kurz: 'Zweiseitig ist die Richtung egal.',
        tryIt: { label: 'Ja und Nein tauschen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle hätten eine Weiterbildung gemacht. Was passiert mit p?', options: ['wird kleiner', 'bleibt gleich', 'wird größer'], correct: 0,
        explain: '200 von 200 passen überhaupt nicht zu 50 %. p fällt weit unter jede übliche Schwelle.',
        kurz: 'Je weiter weg von H₀, desto kleiner p.',
        tryIt: { label: 'alle auf Ja', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'binomial_test', variant: 0,
    tokens: {
      p: { sym: 'p =', term: 'Anteil unter H₀', kurz: 'Hier ist p kein p-Wert, sondern der Anteil der Nullhypothese. p = .5 prüft, ob genau die Hälfte Ja sagt.', fehler: 'Der Anteil steht als Zahl zwischen 0 und 1. Mit p = 50 meldet mariposa: `p` must be between 0 and 1.' },
    },
    outputMap: [
      { match: 'p', atlas: 'p-Wert', step: 2, explain: 'Liegt unter 0,05: Bei α = 0,05 verwirfst du H₀, bei α = 0,01 nicht.' },
      { match: '*', atlas: 'Signifikanzstern', step: 2, explain: 'Ein Stern heißt p < 0,05. Die Schwelle α legst du trotzdem selbst und vorher fest.' },
      { match: 'prop', atlas: 'Anteil mit Weiterbildung', explain: '82 von 200 sind 0,41. Verglichen wird mit 0,5 aus der Nullhypothese.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten.' },
    ],
    check: {
      question: 'Welches Zeichen zeigt, dass p unter 0,05 liegt? Tippe es an.', correct: '*',
      wrong: { prop: 'Fast! Das ist der Anteil mit Weiterbildung. Das Zeichen für p < 0,05 steht direkt hinter p.', N: 'Fast! N ist die Zahl der Befragten. Das Zeichen für p < 0,05 steht direkt hinter p.' },
    },
  },
  next: {
    next: { id: 'critical_value', why: 'Übersetzt α in eine Grenze für die Prüfgröße.' },
    before: [
      { id: 'hypothesis', why: 'α ist die Schwelle, ab der du H₀ verwirfst.' },
      { id: 'null_distribution', why: 'Unter ihr bestimmt α, wie viel Fläche als auffällig gilt.' },
    ],
    after: [
      { id: 'type_errors', why: 'α ist die Quote der Fehler erster Art.' },
      { id: 'power', why: 'Ein kleineres α senkt die Teststärke.' },
    ],
    more: [
      { id: 'multiplicity', why: 'Bei vielen Tests muss α für die ganze Familie gelten.' },
      { id: 'p_value', why: 'Die Zahl, die du mit α vergleichst.' },
    ],
  },
};
