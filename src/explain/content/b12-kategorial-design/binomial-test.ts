// Begriffskarte „Binomialtest“: Anteil mit Weiterbildung im Lehrdatensatz (82 von 200) gegen 50 %, exakt wie
// mariposa::binomial_test(weiterbildung, p = .5) 0.7.4. R-Befehle und Referenzwerte: b12-kategorial-design.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { binomTestHalf, often, pText } from './rechnen';

/** Weiterbildung in den letzten zwölf Monaten: 82 Ja von 200 (R: table(atlas$weiterbildung)). */
export const WEITERBILDUNG = { ja: 82, n: 200, lowerTail: 0.006565178, p: 0.01313036, ciLo: 0.3411306, ciHi: 0.4815784 } as const;
const W = WEITERBILDUNG;

/** p wie mariposa bei p = .5 für k Ja-Antworten von 200. */
export const pBinom = (k: number) => binomTestHalf(k, W.n);

export const binomialTest: ConceptCard = {
  concept: 'binomial_test',
  picture: 'b12-binomial',
  wofuer: '82 von 200 Befragten haben in den letzten zwölf Monaten eine Weiterbildung gemacht, also 41 %. Passt das noch zu der Annahme, dass es eigentlich die Hälfte ist? Der Binomialtest prüft einen Anteil gegen einen festen Wert.',
  kurz: 'Der Binomialtest prüft, ob ein beobachteter Anteil zu einem angenommenen Anteil passt. Er rechnet exakt aus, wie oft der Zufall allein so weit danebenläge.',
  stellDirVor: {
    text: `${W.ja} von ${W.n} Befragten haben in den letzten zwölf Monaten eine Weiterbildung gemacht, ${W.n - W.ja} nicht. Angenommen, unter allen Menschen wäre es genau die Hälfte: Dann erwartest du 100 Ja-Antworten. Beobachtet sind 18 weniger. Der Binomialtest in R meldet dazu p = 0.013.`,
    figures: [
      { label: 'Ja-Antworten', value: `${W.ja} von ${W.n}` },
      { label: 'erwartet bei 50 %', value: '100' },
      { label: 'Anteil', value: pct(W.ja / W.n) },
      { label: 'p-Wert', value: pText(W.p).replace('p ≈ ', '') },
    ],
  },
  heisst: {
    sym: 'p₀', say: 'p null',
    fach: 'Ein exakter Test für einen Anteil: Unter der Nullhypothese, dass der wahre Anteil p₀ beträgt, ist die Zahl K der Ja-Antworten binomialverteilt mit n und p₀. Bei p₀ = 0,5 summiert der zweiseitige p-Wert die Wahrscheinlichkeiten aller Ergebnisse, die mindestens so weit von n · p₀ entfernt liegen wie das beobachtete.',
  },
  bausteine: [
    {
      title: 'Ja-Antworten zählen',
      was: 'Wir zählen, wie viele der 200 Befragten Ja gesagt haben. Mehr braucht der Test aus den Daten nicht.',
      rechnung: `k = ${W.ja}, n = ${W.n}, Anteil ${W.ja} / ${W.n} = ${num(W.ja / W.n)}.`,
      warum: 'Der Test braucht nur zwei Zahlen: wie viele Ja gesagt haben und wie viele gefragt wurden.',
      acht: 'Der Test passt nur zu Fragen mit genau zwei Antworten. Hat eine Spalte mehr Kategorien, fass sie vorher mit rec() zusammen.',
      concept: 'frequency',
    },
    {
      title: 'Erwarten, was die Annahme sagt',
      was: 'Wir nehmen an, der wahre Anteil sei genau 50 %. Dann erwarten wir unter 200 Befragten 100 Ja-Antworten.',
      rechnung: `n · p₀ = ${W.n} · 0,5 = 100. Beobachtet sind ${W.ja}, also ${100 - W.ja} weniger.`,
      warum: 'Nur unter einer festen Annahme lässt sich ausrechnen, was der Zufall allein anrichten würde.',
      acht: 'Die 50 % sind eine Annahme zum Rechnen, keine Behauptung. Welchen Anteil du prüfst, legst du fest, bevor du die Daten ansiehst.',
      concept: 'hypothesis',
    },
    {
      title: 'Nachsehen, wie oft der Zufall so weit danebenliegt',
      was: 'Die Binomialverteilung sagt, wie wahrscheinlich jede Zahl von Ja-Antworten bei 50 % wäre. Wir zählen alle Ergebnisse zusammen, die mindestens 18 von 100 entfernt liegen.',
      rechnung: `P(K ≤ ${W.ja}) + P(K ≥ ${W.n - W.ja}) ≈ 0,0066 + 0,0066 ≈ 0,013. Wäre der Anteil in Wahrheit 50 %, läge die Zahl der Ja-Antworten ${often(W.p)} mindestens so weit daneben.`,
      warum: 'Genau dieser Anteil ist der p-Wert. Er zählt beide Richtungen, weil vorher nicht feststand, ob es mehr oder weniger sein würden.',
      acht: 'p ist nicht die Wahrscheinlichkeit, dass der Anteil 50 % beträgt. Er rechnet unter der Annahme, dass er es tut.',
      concept: 'binomial_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'Statt 82 sagen 90 der 200 Ja. Was passiert mit p?',
      options: ['p wird kleiner', 'p wird größer', 'p bleibt gleich'], correct: 1, step: 3,
      explain: `90 liegt näher an den erwarteten 100. So eine Abweichung käme öfter vor: p steigt auf etwa ${num(pBinom(90))}. Schieb den Regler oben auf 90.`,
      kurz: 'Näher an der Annahme, größerer p-Wert.',
    },
    {
      question: 'Der Anteil bleibt bei 41 %, aber es sind 2.000 statt 200 Befragte. Was passiert mit p?',
      options: ['p wird kleiner', 'p bleibt gleich', 'p wird größer'], correct: 0, step: 3,
      explain: '820 von 2.000 sind 180 weniger als die erwarteten 1.000. Bei so vielen Befragten käme das praktisch nie vor: p fällt unter 0,001.',
      kurz: 'Derselbe Anteil wird mit mehr Befragten überraschender.',
    },
    {
      question: 'Es wären 118 statt 82 Ja-Antworten, also 59 %. Was passiert mit p?',
      options: ['p bleibt gleich', 'p wird kleiner', 'p wird größer'], correct: 0, step: 3,
      explain: `118 liegt genauso weit über 100 wie 82 darunter. Der Test zählt beide Richtungen, deshalb bleibt ${pText(pBinom(118))}.`,
      kurz: 'Zweiseitig heißt: Zu viel und zu wenig zählen gleich.',
    },
  ],
  regler: {
    label: 'Wie viele der 200 Befragten sagen Ja?',
    min: 60, max: 140, step: 1, initial: W.ja,
    format: v => `${v} von 200`,
    describe: v => {
      if (v === 100) return 'Genau 100 Ja-Antworten: Das ist, was die Annahme vorhersagt. p ist dann 1.';
      const p = pBinom(v);
      const verdict = p >= 0.2 ? 'Das wäre gar nicht überraschend.' : p >= 0.05 ? 'Das wäre etwas überraschend, kommt aber oft genug vor.' : p >= 0.01 ? 'Das wäre überraschend.' : 'Das wäre sehr überraschend.';
      return `${v} Ja-Antworten liegen ${Math.abs(v - 100)} ${v < 100 ? 'unter' : 'über'} den erwarteten 100. Wäre der Anteil genau 50 %, läge die Zahl der Ja-Antworten ${often(p)} mindestens so weit weg (${pText(p)}). ${verdict}`;
    },
  },
  check: {
    question: 'R meldet für die Weiterbildung p = 0.013. Was heißt das?',
    options: [
      'Mit 1,3 % Wahrscheinlichkeit beträgt der Anteil 50 %.',
      'Wäre der Anteil in Wahrheit 50 %, läge die Zahl der Ja-Antworten nur in etwa 13 von 1.000 Stichproben mindestens so weit von 100 entfernt.',
      '41 % der Befragten haben eine Weiterbildung gemacht.',
      'Der Anteil liegt sicher unter 50 %.',
    ],
    correct: 1,
    right: 'Genau. p rechnet unter der Annahme von 50 % und fragt, wie selten so ein Ergebnis dann wäre.',
    diagnose: {
      0: 'Fast! Das ist der häufigste Fehler. p rechnet unter der Annahme, dass der Anteil 50 % beträgt. Wie wahrscheinlich die Annahme selbst ist, sagt p nicht.',
      2: 'Fast! Das stimmt zwar, ist aber der Anteil in der Stichprobe. p sagt, wie überraschend dieser Anteil wäre, wenn es in Wahrheit 50 % wären.',
      3: 'Fast! Ein kleiner p-Wert macht 50 % unplausibel, aber nicht unmöglich. Sicherheit gibt es mit einer Stichprobe nie.',
    },
  },
  fuerDich: 'Wenn eine Umfrage eine knappe Mehrheit meldet, etwa 52 %, frag nach der Zahl der Befragten. Bei 100 Befragten passen 52 Ja-Antworten gut zu 50 % (p ≈ 0,76). Bei 10.000 Befragten wären 52 % sehr überraschend (p < 0,001).',
  genau: {
    kurz: 'Der Binomialtest ist exakt und braucht keine Näherung. mariposa prüft bei p = .5 zweiseitig, bei anderen Werten einseitig.',
    paragraphs: [
      'Exakt heißt: Die Wahrscheinlichkeiten kommen direkt aus der Binomialverteilung mit n = 200 und p₀ = 0,5. Bei großem n liefert die Normalverteilung fast dieselbe Zahl, der Binomialtest braucht diese Näherung aber nicht.',
      'mariposa 0.7.4 rechnet wie SPSS: bei p = .5 zweiseitig, bei jedem anderen Wert einseitig, in die Richtung der Daten. Der gemeldete Anteil gehört zur Antwort der ersten Person mit gültigem Wert, hier Ja.',
      `Das 95-%-Konfidenzintervall nach Clopper-Pearson reicht von ${num(W.ciLo)} bis ${num(W.ciHi)}. Bei wiederholten Zufallsstichproben enthielten etwa 95 % solcher Intervalle den wahren Anteil; 0,5 liegt nicht in diesem.`,
      'Der Test nimmt unabhängige Befragte an, die alle dieselbe Wahrscheinlichkeit für Ja haben.',
    ],
  },
};

/** Ja-Antworten (Code 1) in der Spalte x der Auswertung. */
const ja = (c: SampleCtx) => { const x = c.columns.x?.[0] ?? 'weiterbildung'; return c.rows.filter(r => r.values[x] === 1).length; };

export const binomialTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung' },
    kurz: 'Derselbe Test mit allen 200 Befragten, so wie R ihn rechnet. Probier aus, was sich an p ändert, wenn du die Daten veränderst.',
    value: c => binomTestHalf(ja(c), c.rows.length),
    result: c => {
      const k = ja(c), n = c.rows.length, p = binomTestHalf(k, n), d = k - n / 2;
      if (k === 0 || k === n) return {
        kurz: `Alle ${n} Befragten haben dieselbe Antwort gegeben. mariposa rechnet den Binomialtest dann nicht, denn er braucht beide Antworten in den Daten.`,
        fachlich: 'binomial_test() meldet: `weiterbildung` has 1 observed category; the binomial test needs exactly 2 categories.',
      };
      return {
        kurz: `${k} von ${n} Befragten haben in den letzten zwölf Monaten eine Weiterbildung gemacht, das sind ${pct(k / n)}. Wäre der Anteil genau 50 %, läge die Zahl der Ja-Antworten ${often(p)} mindestens so weit von ${n / 2} entfernt (${pText(p)}).`,
        fachlich: `Exakter Binomialtest gegen p₀ = 0,5, zweiseitig: k = ${k}, n = ${n}, ${pText(p)}.`,
        zusatz: `Erwartet wären ${n / 2} Ja-Antworten; beobachtet sind ${k}, also ${Math.abs(d)} ${d >= 0 ? 'mehr' : 'weniger'}.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an, die alle dieselbe Wahrscheinlichkeit für Ja haben.',
    think: [
      {
        question: 'Aus jedem Ja wird ein Nein und umgekehrt. Was passiert mit p?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
        explain: 'Der Abstand zu den erwarteten 100 bleibt derselbe, nur die Richtung dreht sich. Der Test zählt beide Richtungen, deshalb bleibt p gleich.',
        kurz: 'Zweiseitig heißt: Zu viel und zu wenig zählen gleich.',
        tryIt: { label: 'Weiterbildung umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, niemand hätte eine Weiterbildung gemacht. Wie viele Ja-Antworten gibt es dann?', options: ['keine', '82', '100'], correct: 0,
        explain: 'Alle 200 sagen jetzt Nein. Mit nur einer Antwort rechnet mariposa den Test gar nicht: Er braucht beide Antworten in den Daten.',
        kurz: 'Ein Anteil lässt sich nur prüfen, wenn es beide Antworten gibt.',
        tryIt: { label: 'alle auf Nein (Code 0)', op: 'constant', column: 'x', value: 0 },
        expect: { change: 'equals', value: 0, measure: ja },
      },
    ],
  },
  r: {
    entry: 'binomial_test', variant: 0,
    tokens: {
      binomial_test: { sym: 'binomial_test()', term: 'Binomialtest', kurz: 'Prüft den Anteil einer Spalte mit zwei Antworten gegen einen festen Wert. Meldet den Anteil, p und die Zahl der Befragten N.', fehler: 'Mit mehr als zwei Antworten meldet mariposa: `schulabschluss` has 5 observed categories; the binomial test needs exactly 2 categories.' },
      p: { sym: 'p =', term: 'Anteil unter der Nullhypothese', kurz: 'Der Anteil, gegen den getestet wird, hier .5 für die Hälfte. Bei .5 prüft mariposa zweiseitig, bei anderen Werten einseitig.', fehler: 'Prozent statt Anteil, etwa p = 50, führt zu: `p` must be between 0 and 1.' },
    },
    outputMap: [
      { match: 'prop', atlas: 'Anteil mit Ja', step: 1, explain: 'prop heißt proportion, auf Deutsch Anteil: 82 von 200 sind 0,41. Dahinter steht der geprüfte Wert 0,5.' },
      { match: 'p', atlas: 'p-Wert', step: 3, explain: 'Wäre der Anteil in Wahrheit 50 %, läge die Zahl der Ja-Antworten in etwa 13 von 1.000 Stichproben mindestens so weit von 100 entfernt.' },
      { match: 'Group 1', atlas: 'Gruppe 1', explain: 'Die Antwort, deren Anteil R meldet. mariposa nimmt die Antwort der ersten Person, hier Ja.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten mit gültiger Antwort.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist der p-Wert? Tippe sie an.', correct: 'p',
      wrong: { prop: 'Fast! Das ist der Anteil mit Ja, 82 von 200. Der p-Wert steht hinter p =.', N: 'Fast! N ist die Zahl der Befragten. Der p-Wert steht hinter p =.' },
    },
  },
  next: {
    next: { id: 'chisq_gof', why: 'Prüft mehr als zwei Kategorien auf einmal gegen eine vorher festgelegte Verteilung.' },
    before: [
      { id: 'binomial_distribution', why: 'Sagt, wie wahrscheinlich jede Zahl von Ja-Antworten unter der Annahme ist.' },
      { id: 'hypothesis', why: 'Legt den Anteil fest, gegen den du prüfst.' },
      { id: 'bernoulli_distribution', why: 'Jede einzelne Antwort ist ein Ja oder ein Nein.' },
    ],
    after: [{ id: 'mcnemar_test', why: 'Rechnet mit demselben exakten Test, ob Wechsel in beide Richtungen gleich häufig sind.' }],
    more: [
      { id: 'confidence', why: 'Zeigt alle Anteile, die zu den Daten passen, statt nur einen zu prüfen.' },
      { id: 'test_sides', why: 'mariposa prüft bei 50 % zweiseitig, bei anderen Werten einseitig.' },
    ],
  },
};
