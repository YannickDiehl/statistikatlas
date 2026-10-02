// Begriffskarte „Zufallsvariable & beobachteter Wert“. Beispiel: X = gelöste Aufgaben im Wissenstest einer zufällig
// gezogenen Person; P002 hat 9 gelöst. Zahlen in R nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { WISSEN, column, eqSign } from './gemeinsam';

const W = WISSEN;
/** Beobachteter Wert im Beispiel: P002 hat 9 Aufgaben gelöst. */
export const BEISPIEL = { person: 'P002', x: 9 } as const;

/** Häufigster Wert der Spalte x und seine Wahrscheinlichkeit bei einer Ziehung mit gleichen Chancen. */
function modal(c: SampleCtx) {
  const xs = column(c, 'x', 'wissenstest'), n = xs.length, counts = new Map<number, number>();
  for (const v of xs) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = xs[0];
  for (const [v, k] of counts) if (k > counts.get(best)! || (k === counts.get(best)! && v < best)) best = v;
  return { n, value: best, count: counts.get(best)!, p: counts.get(best)! / n, distinct: counts.size, min: Math.min(...xs), max: Math.max(...xs) };
}

export const randomVariable: ConceptCard = {
  concept: 'random_variable',
  wofuer: 'Bevor du eine Person aus den 200 ziehst, weißt du nicht, wie viele Aufgaben sie im Wissenstest gelöst hat. Nach dem Ziehen steht eine Zahl fest. Die Zufallsvariable trennt diese beiden Blicke: vorher offen, nachher beobachtet.',
  kurz: 'Eine Zufallsvariable macht aus dem Ergebnis eines Zufallsvorgangs eine Zahl. Vorher kennst du nur die möglichen Werte und ihre Wahrscheinlichkeiten, nachher einen konkreten Wert.',
  stellDirVor: {
    text: `X sei die Zahl gelöster Aufgaben einer zufällig gezogenen Person, möglich sind 0 bis 20. Vor dem Ziehen ist X offen. Am wahrscheinlichsten sind genau ${W.mode} Aufgaben: ${W.modeCount} von ${W.n} Befragten haben so viele gelöst, also ${num(W.modeCount / W.n)}. Ziehst du dann ${BEISPIEL.person} und sie hat ${BEISPIEL.x} gelöst, ist x = ${BEISPIEL.x} der beobachtete Wert.`,
    figures: [
      { label: 'mögliche Werte', value: '0 bis 20' },
      { label: 'wahrscheinlichster Wert', value: `${W.mode} Aufgaben` },
      { label: `P(X = ${W.mode})`, value: num(W.modeCount / W.n) },
      { label: `beobachtet bei ${BEISPIEL.person}`, value: `x = ${BEISPIEL.x}` },
    ],
  },
  heisst: {
    sym: 'X', say: 'groß X',
    fach: 'Eine Zufallsvariable X ordnet jedem möglichen Ergebnis eines Zufallsvorgangs eine Zahl zu. Großes X steht für die Variable, kleines x für einen möglichen oder beobachteten Wert.',
  },
  bausteine: [
    {
      title: 'Den Zufallsvorgang festlegen',
      was: 'Zuerst klärst du, was zufällig ist. Hier wird eine der 200 Personen gezogen, jede mit derselben Chance.',
      warum: 'Ohne Zufallsvorgang gibt es keine Wahrscheinlichkeiten. Die Daten jeder Person stehen fest, zufällig ist nur, wen du ziehst.',
      acht: `Die Zufälligkeit steckt im Ziehen, nicht in der Person. ${BEISPIEL.person} hat ${BEISPIEL.x} Aufgaben gelöst, daran ist nichts zufällig.`,
      concept: 'random_sampling',
    },
    {
      title: 'Jedem Ergebnis eine Zahl geben',
      was: 'Jede Person, die du ziehen könntest, bekommt die Zahl ihrer gelösten Aufgaben. So wird aus „wen ziehe ich?“ die Frage „welche Zahl kommt heraus?“.',
      warum: 'Mit Zahlen kann man rechnen: Wahrscheinlichkeiten für Bereiche, einen Erwartungswert, eine Streuung.',
      acht: 'Nicht jeder Zahlencode erlaubt Rechnen. Beim Geschlecht sind 0 bis 3 nur Etiketten; Abstände zwischen den Codes bedeuten nichts.',
      concept: 'nominal',
    },
    {
      title: 'Vorher und nachher unterscheiden',
      was: `Vor dem Ziehen kennst du nur die Verteilung von X. Nach dem Ziehen hast du einen Wert x, etwa x = ${BEISPIEL.x}.`,
      rechnung: `Vorher: P(X = ${W.mode}) = ${W.modeCount} / ${W.n} = ${num(W.modeCount / W.n)}. Nachher: x = ${BEISPIEL.x} bei ${BEISPIEL.person}.`,
      warum: 'Statistik denkt in beide Richtungen: Das Modell sagt, was passieren kann; die Daten zeigen, was passiert ist.',
      acht: `P(X = ${W.mode}) ergibt Sinn, P(${BEISPIEL.x} = ${W.mode}) nicht. Großes X ist die offene Größe, kleines x eine feste Zahl.`,
      concept: 'theoretical_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'Du ziehst zweimal hintereinander zufällig eine Person, mit Zurücklegen. Kommt beide Male dieselbe Aufgabenzahl heraus?',
      options: ['ja, X ist ja dieselbe Variable', 'nicht unbedingt'], correct: 1, step: 3,
      explain: 'X beschreibt den Vorgang, nicht das Ergebnis. Jede Ziehung kann einen anderen Wert liefern; die Wahrscheinlichkeiten bleiben dieselben.',
      kurz: 'Gleiche Zufallsvariable, verschiedene Werte.',
    },
    {
      question: 'Ist das Alter einer zufällig gezogenen Person eine Zufallsvariable?',
      options: ['ja', 'nein, das Alter steht doch fest'], correct: 0, step: 1,
      explain: 'Das Alter jeder Person steht fest. Zufällig ist, wen du ziehst. Deshalb ist das Alter der gezogenen Person vorher offen: eine Zufallsvariable.',
      kurz: 'Zufällig ist der Vorgang, nicht die Person.',
    },
    {
      question: 'X ist die Zahl gelöster Aufgaben. Kann X den Wert 10,5 annehmen?',
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Es gibt nur ganze gelöste Aufgaben, von 0 bis 20. Ein Durchschnitt der 200 kann trotzdem zwischen zwei ganzen Zahlen liegen; er ist ein Kennwert, kein möglicher Wert von X.',
      kurz: 'Mögliche Werte sind nicht dasselbe wie Kennwerte.',
    },
  ],
  check: {
    question: 'X ist die Lernzeit einer zufällig gezogenen Person. Was stimmt?',
    options: [
      'X ist vor dem Ziehen offen; nach dem Ziehen liegt ein Wert x vor.',
      'X ist die Lernzeit von P001.',
      'X ist der Mittelwert der Lernzeit.',
      'X ist zufällig, weil Menschen zufällig lange lernen.',
    ],
    correct: 0,
    right: 'Genau. X steht für den Vorgang mit offenem Ausgang, x für das, was herauskommt.',
    diagnose: {
      1: 'Fast! Das ist ein beobachteter Wert, ein kleines x. X ist die Lernzeit der Person, die erst noch gezogen wird.',
      2: 'Fast! Der Mittelwert ist ein Kennwert der Daten. X kann viele Werte annehmen, jeden mit seiner Wahrscheinlichkeit.',
      3: 'Noch nicht ganz. Wie lange jemand gelernt hat, steht fest. Zufällig ist, wen du ziehst.',
    },
  },
  fuerDich: 'Wenn in Formeln großes X und kleines x stehen, ist das kein Tippfehler. Großes X meint „was herauskommen könnte“, kleines x „was herausgekommen ist“.',
  genau: {
    kurz: 'Formal ist X eine Funktion, die jedem Ergebnis eines Zufallsvorgangs eine Zahl zuordnet. Ihre Verteilung sagt, mit welchen Wahrscheinlichkeiten welche Werte auftreten.',
    paragraphs: [
      'Das Zufallsmodell beschreibt mögliche Werte; die Datenreihe enthält die tatsächlich beobachteten Werte x₁ bis xₙ. Bei einer Zufallsstichprobe ist jeder dieser Werte die Beobachtung einer eigenen Zufallsvariable Xᵢ.',
      'Ein Zahlencode allein begründet noch keine sinnvollen Abstände. Ob man mit X rechnen darf, hängt vom Skalenniveau ab.',
      'Auch Kennwerte wie der Mittelwert X̄ sind vor der Erhebung Zufallsvariablen. Ihre Verteilung über viele Stichproben heißt Stichprobenverteilung.',
    ],
  },
};

export const randomVariableTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'wissenstest' },
    kurz: 'Dieselbe Zufallsvariable mit allen 200 Befragten: X ist die Zahl gelöster Aufgaben einer zufällig gezogenen Person.',
    value: c => modal(c).p,
    result: c => {
      const m = modal(c);
      return {
        kurz: `Möglich sind 0 bis 20 gelöste Aufgaben; bei den ${m.n} Befragten kommen ${m.distinct} verschiedene Werte vor. Am wahrscheinlichsten zieht man jemanden mit ${m.value} Aufgaben: ${m.count} von ${m.n}, also ${pct(m.p)}.`,
        fachlich: `X = gelöste Aufgaben bei Ziehung mit gleichen Chancen; P(X = ${m.value}) = ${m.count} / ${m.n} ${eqSign(m.p)} ${num(m.p)}. Beobachtet reicht X von ${m.min} bis ${m.max}.`,
        zusatz: `Jede gezogene Person liefert genau einen Wert x; vorher ist nur die Verteilung bekannt.`,
      };
    },
    voraussetzung: 'Jede der 200 Befragten hat dieselbe Chance, gezogen zu werden.',
    think: [
      {
        question: 'Alle lösen zwei Aufgaben mehr. Was passiert mit der Wahrscheinlichkeit des wahrscheinlichsten Werts?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Jeder Wert rückt um 2, aber gleich viele Personen teilen sich jeden Wert. Der wahrscheinlichste Wert wandert mit, seine Wahrscheinlichkeit bleibt.',
        kurz: 'Verschieben ändert die Werte, nicht ihre Wahrscheinlichkeiten.',
        tryIt: { label: 'alle zwei Aufgaben mehr', op: 'shift', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle 200 hätten genau 10 Aufgaben gelöst. Wie wahrscheinlich ist dann X = 10?',
        options: ['1', '0,5', '0,05'], correct: 0,
        explain: 'Dann gibt es nur noch einen möglichen Wert. Jede Ziehung liefert 10, die Wahrscheinlichkeit ist 1. X ist dann gar nicht mehr zufällig.',
        kurz: 'Ohne Unterschiede gibt es nichts mehr zu erraten.',
        tryIt: { label: 'alle auf 10 Aufgaben', op: 'constant', column: 'x', value: 10 },
        expect: { change: 'equals', value: 1 },
      },
    ],
  },
  next: {
    next: { id: 'discrete_continuous', why: 'Ob X nur einzelne Werte annimmt oder jeden Wert in einem Bereich, ändert, wie du rechnest.' },
    before: [
      { id: 'probability', why: 'X verteilt Wahrscheinlichkeiten auf Zahlen.' },
      { id: 'series', why: 'Die Datenreihe enthält die beobachteten Werte x.' },
    ],
    after: [
      { id: 'expectation', why: 'Der Wert, der im Mittel herauskommt, wenn du sehr oft ziehst.' },
      { id: 'theoretical_distribution', why: 'Ein Modell für alle möglichen Werte von X und ihre Wahrscheinlichkeiten.' },
      { id: 'estimator', why: 'Auch ein Schätzer ist vor der Erhebung eine Zufallsvariable.' },
    ],
    more: [{ id: 'population_variance', why: 'Wie weit X im Modell um seinen Erwartungswert streut.' }],
  },
};
