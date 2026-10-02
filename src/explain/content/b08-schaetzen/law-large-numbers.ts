// Begriffskarte „Gesetz der großen Zahlen“ (law_large_numbers). Beispiel: Anteil mit Weiterbildung (41 % der 200),
// Ziehungen mit Zurücklegen; wie oft liegt der Anteil mehr als 5 Prozentpunkte daneben? Exakt binomial
// (Bild 'b08-gesetz', Regler n). Reiter: dieselbe Wahrscheinlichkeit für 100 Ziehungen aus den aktuellen Daten.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num, pct } from '../../format';
import { columnX, outside5, stufe } from './daten';
import { WEITERBILDUNG } from './sampling-distribution';

/** Stichprobengrößen des Reglers. */
export const GESETZ_N = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000] as const;
/** Wie viele Personen eine Stichprobe im Reiter hat. */
export const GEZOGEN = 100;

/** Wahrscheinlichkeit, mehr als 5 Prozentpunkte neben 41 % zu liegen, bei n Ziehungen aus den 200 Befragten. */
export const daneben = (n: number) => outside5(n, WEITERBILDUNG.ja, WEITERBILDUNG.N);

/** „in etwa 26 von 100 Stichproben“, „in etwa 1 von 1.000 Stichproben“, „in keiner Stichprobe“: Häufigkeit in Worten. */
export function wieOft(p: number): string {
  if (p <= 0) return 'in keiner Stichprobe';
  if (p >= 0.995) return 'in praktisch allen Stichproben';
  if (p >= 0.01) return `in etwa ${Math.round(p * 100)} von 100 Stichproben`;
  if (p >= 0.001) return `in etwa ${Math.round(p * 1000)} von 1.000 Stichproben`;
  if (p >= 0.00001) return `in etwa ${Math.round(p * 100000)} von 100.000 Stichproben`;
  return 'in weniger als 1 von 100.000 Stichproben';
}

/** Anteil der Einsen in der Spalte x der aktuellen Daten und die Wahrscheinlichkeit für 100 Ziehungen. */
export function gesetz(c: SampleCtx) {
  const x = columnX(c, 'weiterbildung'), ones = x.filter(v => v === 1).length;
  return { N: x.length, ones, pi: ones / x.length, p: outside5(GEZOGEN, ones, x.length), p1000: outside5(1000, ones, x.length) };
}

const p10 = daneben(10), p100 = daneben(100), p1000 = daneben(1000);

export const lawLargeNumbers: ConceptCard = {
  concept: 'law_large_numbers',
  picture: 'b08-gesetz',
  wofuer: 'Kleine Umfragen liefern oft erstaunliche Ergebnisse, große selten. Warum werden Anteile verlässlicher, je mehr Menschen du befragst?',
  kurz: 'Das Gesetz der großen Zahlen sagt: Je größer die Stichprobe, desto verlässlicher landet der Mittelwert nahe beim wahren Wert. Große Abweichungen werden immer unwahrscheinlicher.',
  stellDirVor: {
    text: `${pct(WEITERBILDUNG.pi)} der 200 Befragten haben eine Weiterbildung gemacht. Ein Anteil ist auch ein Mittelwert: der Mittelwert aus Nullen (keine Weiterbildung) und Einsen (Weiterbildung). Stell dir vor, die 200 sind alle, und du ziehst zufällig Befragte, mit Zurücklegen. Bei 10 Gezogenen liegt der Anteil ${wieOft(p10)} mehr als 5 Prozentpunkte neben ${pct(WEITERBILDUNG.pi)}. Bei 100 Gezogenen nur noch ${wieOft(p100)}, bei 1.000 Gezogenen ${wieOft(p1000)}.`,
    figures: [
      { label: 'daneben bei 10 Gezogenen', value: pct(p10) },
      { label: 'daneben bei 100 Gezogenen', value: pct(p100) },
      { label: 'daneben bei 1.000 Gezogenen', value: pct(p1000, 2) },
    ],
  },
  heisst: {
    sym: 'P(|X̄ₙ − μ| > ε) → 0', say: 'P von Betrag X quer n minus mü größer epsilon geht gegen null',
    fach: 'Bei unabhängigen, identisch verteilten Beobachtungen mit endlichem Erwartungswert μ geht für jede feste Abweichung ε > 0 die Wahrscheinlichkeit P(|X̄ₙ − μ| > ε) gegen 0, wenn n wächst (schwaches Gesetz der großen Zahlen).',
  },
  bausteine: [
    {
      title: 'Eine Toleranz festlegen',
      was: 'Du legst fest, ab wann ein Ergebnis danebenliegt, hier ab mehr als 5 Prozentpunkten. Das Zeichen für diese Toleranz ist ε, sprich epsilon.',
      warum: 'Ganz genau trifft ein Anteil fast nie. Die Frage ist, wie oft er weiter als ε danebenliegt.',
      acht: 'ε ist frei gewählt. Das Gesetz gilt für jede noch so kleine feste Toleranz; es braucht dann nur mehr Befragte.',
      concept: 'probability',
    },
    {
      title: 'Die Stichprobe wachsen lassen',
      was: 'Mit mehr Befragten wird die Stichprobenverteilung schmaler. Immer weniger Stichproben landen außerhalb der Toleranz.',
      rechnung: `Mehr als 5 Prozentpunkte daneben: bei 10 Gezogenen ${pct(p10)}, bei 100 Gezogenen ${pct(p100)}, bei 1.000 Gezogenen ${pct(p1000, 2)}.`,
      warum: 'In großen Stichproben zählt jede einzelne zufällige Abweichung nur wenig. Sie wird durch die vielen anderen Werte verdünnt, nicht ausgeglichen.',
      acht: 'Das Gesetz sagt nichts über eine einzelne weitere Person. Sie muss den Anteil nicht näher an 41 % bringen.',
      concept: 'sampling_distribution',
    },
    {
      title: 'Die Grenzen kennen',
      was: 'Das Gesetz gilt für Zufallsstichproben aus einer festen Verteilung. Es verspricht keine Glockenform und keinen Schutz vor einer schiefen Auswahl.',
      warum: 'Bei einer verzerrten Auswahl pendelt sich der Mittelwert auch ein, aber beim falschen Wert.',
      acht: 'Nach vielen Nullen „muss“ keine Eins kommen. Der Zufall gleicht nichts aus; alte Abweichungen fallen nur bei vielen neuen Beobachtungen weniger ins Gewicht.',
      concept: 'sampling_bias',
    },
  ],
  ausprobieren: [
    {
      question: 'Bei 10 Gezogenen liegt der Anteil oft weit daneben. Was passiert bei 1.000 Gezogenen?',
      options: ['er liegt fast immer nah bei 41 %', 'er liegt genauso oft daneben', 'er trifft genau 41 %'], correct: 0, step: 2,
      explain: `Mehr als 5 Prozentpunkte daneben liegt er dann nur noch ${wieOft(p1000)}. Genau 41 % trifft er trotzdem selten. Schieb den Regler auf 1.000.`,
      kurz: 'Groß heißt verlässlich, nicht exakt.',
    },
    {
      question: 'In den ersten 10 Ziehungen hatte niemand eine Weiterbildung. Hat die nächste Person deshalb eher eine?',
      options: ['ja, der Zufall gleicht aus', 'nein, die Chance bleibt 41 %'], correct: 1, step: 3,
      explain: 'Jede Ziehung ist unabhängig von den vorigen. Die frühen Nullen werden nicht ausgeglichen, sondern durch viele weitere Ziehungen verdünnt.',
      kurz: 'Der Zufall hat kein Gedächtnis.',
    },
    {
      question: 'Eine Online-Umfrage mit 100.000 Antworten erreicht vor allem Menschen, die viel lernen. Trifft sie dank des Gesetzes die mittlere Lernzeit aller?',
      options: ['ja, so viele Antworten genügen', 'nein, sie pendelt sich beim falschen Wert ein'], correct: 1, step: 3,
      explain: 'Das Gesetz gilt für Zufallsstichproben. Bei einer schiefen Auswahl landet der Mittelwert verlässlich beim Mittel der Teilnehmenden, nicht bei dem aller Menschen.',
      kurz: 'Große Zahlen heilen keine schiefe Auswahl.',
    },
  ],
  regler: {
    label: 'Wie viele Befragte ziehst du?',
    min: 0, max: GESETZ_N.length - 1, step: 1, initial: 0,
    format: v => `${count(stufe(GESETZ_N, v))} Gezogene`,
    describe: v => { const n = stufe(GESETZ_N, v); return `Mit ${count(n)} Gezogenen liegt der Anteil ${wieOft(daneben(n))} mehr als 5 Prozentpunkte neben ${pct(WEITERBILDUNG.pi)}.`; },
  },
  check: {
    question: 'Was sagt das Gesetz der großen Zahlen?',
    options: [
      'Ab 30 Befragten ist der Mittelwert normalverteilt.',
      'Nach einer Serie von Abweichungen nach oben folgen Abweichungen nach unten.',
      'Mit wachsender Stichprobe werden große Abweichungen des Mittelwerts vom wahren Wert immer unwahrscheinlicher.',
      'Große Stichproben sind nie verzerrt.',
    ],
    correct: 2,
    right: 'Genau. Für jede feste Toleranz geht die Wahrscheinlichkeit einer größeren Abweichung gegen null.',
    diagnose: {
      0: 'Fast! Das klingt nach dem zentralen Grenzwertsatz, und die 30 ist nur eine Faustregel. Das Gesetz der großen Zahlen sagt nichts über die Form.',
      1: 'Fast! Das ist der Denkfehler „der Zufall gleicht aus“. Jede Ziehung ist unabhängig; alte Abweichungen werden nur verdünnt.',
      3: 'Fast! Das Gesetz gilt nur für Zufallsstichproben. Eine große, aber schiefe Auswahl liegt verlässlich daneben.',
    },
  },
  fuerDich: 'Ein überraschendes Ergebnis aus einer kleinen Umfrage ist oft Zufall. Schau auf die Zahl der Befragten, bevor du daraus etwas ableitest: Bei wenigen Befragten sind große Ausschläge üblich.',
  genau: {
    kurz: 'Die Wahrscheinlichkeit einer festen Abweichung geht gegen null. Das Gesetz sagt nichts über die Form der Verteilung und heilt keine Verzerrung.',
    paragraphs: [
      'Die Formel zeigt die schwache Form: Für jedes ε > 0 geht P(|X̄ₙ − μ| > ε) gegen 0. Die starke Form sagt sogar, dass der Mittelwert mit Wahrscheinlichkeit 1 gegen μ läuft.',
      `Vorausgesetzt sind unabhängige, identisch verteilte Beobachtungen mit endlichem Erwartungswert. Die Zahlen hier sind exakt: Die Zahl der Gezogenen mit Weiterbildung ist binomialverteilt mit n und π = ${num(WEITERBILDUNG.pi)}.`,
      'Ein zusätzlicher Fall muss den bisherigen Mittelwert nicht näher an μ bringen. Zufallsschwankungen bleiben möglich, sie werden nur im Verhältnis kleiner.',
      'Wie schnell die Abweichungen schrumpfen, beschreibt der Standardfehler σ / √n. Welche Form die Schwankungen haben, beschreibt der zentrale Grenzwertsatz.',
    ],
  },
};

export const lawLargeNumbersTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung' },
    kurz: `Du ziehst ${GEZOGEN} der 200 Befragten mit Zurücklegen. Wie oft liegt der Anteil mit Weiterbildung mehr als 5 Prozentpunkte neben dem Anteil aller 200?`,
    value: c => gesetz(c).p * 100,
    result: c => {
      const g = gesetz(c);
      return {
        kurz: `${g.ones} von ${g.N} Befragten haben eine Weiterbildung gemacht, also ${pct(g.pi)}. Bei ${GEZOGEN} Gezogenen liegt der Anteil ${wieOft(g.p)} mehr als 5 Prozentpunkte daneben. Bei 1.000 Gezogenen ${wieOft(g.p1000)}.`,
        fachlich: `P(|p̂ − π| > 0,05) bei n = ${GEZOGEN} und π = ${num(g.pi)}: ${num(g.p, 3)}, exakt aus der Binomialverteilung. Bei n = 1.000: ${num(g.p1000, 4)}.`,
      };
    },
    voraussetzung: 'Die Ziehungen sind unabhängig: Jede gezogene Person kommt zurück und kann wieder gezogen werden.',
    think: [
      {
        question: 'Wer keine Weiterbildung hatte, zählt jetzt als Ja und umgekehrt. Was passiert mit der Zahl der Stichproben, die mehr als 5 Prozentpunkte danebenliegen?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Aus 41 % werden 59 %. Die Anteile schwanken um 59 % genauso stark wie um 41 %, nur gespiegelt.',
        kurz: 'π und 1 − π schwanken gleich stark.',
        tryIt: { label: 'Weiterbildung umpolen (Ja und Nein tauschen)', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle 200 hätten eine Weiterbildung gemacht. In wie vielen von 100 Stichproben läge der Anteil dann mehr als 5 Prozentpunkte daneben?',
        options: ['keine', 'in etwa 26', 'in allen'], correct: 0,
        explain: 'Wenn alle gleich antworten, ergibt jede Stichprobe 100 %. Es gibt nichts mehr, das schwanken könnte.',
        kurz: 'Ohne Unterschiede kein Zufallsfehler.',
        tryIt: { label: 'alle auf Ja (Code 1)', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'equals', value: 0 },
      },
    ],
  },
  next: {
    next: { id: 'central_limit', why: 'Das Gesetz sagt, dass der Mittelwert sich einpendelt. Der zentrale Grenzwertsatz sagt, welche Form seine Schwankungen haben.' },
    before: [
      { id: 'random_sampling', why: 'Das Gesetz braucht unabhängige Zufallsziehungen.' },
      { id: 'expectation', why: 'Der wahre Wert μ, bei dem sich der Mittelwert einpendelt.' },
    ],
    after: [
      { id: 'sampling_distribution', why: 'Zeigt, wie sich die Verteilung der Anteile mit wachsendem n zusammenzieht.' },
    ],
    more: [
      { id: 'probability', why: 'Wahrscheinlichkeit als Anteil auf lange Sicht, begründet durch dieses Gesetz.' },
      { id: 'sampling_bias', why: 'Wogegen auch große Zahlen nicht helfen.' },
    ],
  },
};
