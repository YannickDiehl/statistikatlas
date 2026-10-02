// Begriffskarte „Logistische Regression“ (Bereich B13) mit Reitern. Verstehen: mindestens 10 von 20 Aufgaben nach
// Lernzeit (S-Kurve mit echtem Zusammenhang); Mit 200 Befragten und In R: das Katalogmodell weiterbildung ~ lernzeit + alter.
// Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num, unit } from '../../format';
import { MODELL } from './gerade-tabs';
import { coef } from './gerade';
import { BESTANDEN as BE, FACTORS_TOKEN, LOGISTIC_TOKEN, pBestanden, wbModel } from './logistisch-kit';

const pct = (p: number) => `${num(p * 100, 0)} %`;
const plus = (v: number) => `${v < 0 ? '−' : '+'} ${coef(Math.abs(v))}`;

export const logistischeRegression: ConceptCard = {
  concept: 'logistic_regression',
  picture: 'b13-logistisch',
  wofuer: 'Schaffen Befragte, die mehr lernen, eher mindestens die Hälfte der Aufgaben im Wissenstest, also 10 von 20? Die Antwort ist Ja oder Nein. Eine Gerade würde hier auch Werte unter 0 oder über 1 vorhersagen. Die logistische Regression sagt stattdessen Wahrscheinlichkeiten zwischen 0 und 1 vorher.',
  kurz: 'Die logistische Regression sagt für Ja-Nein-Fragen eine Wahrscheinlichkeit vorher. Sie legt eine Gerade auf die Logit-Skala und biegt sie so zu einer S-Kurve zwischen 0 und 1.',
  stellDirVor: {
    text: `${BE.k} der ${BE.n} Befragten lösen mindestens 10 Aufgaben. R schätzt für den Logit ${num(BE.b0)} + ${num(BE.b1)} · Lernzeit. Bei 4 Stunden Lernzeit sagt das Modell eine Wahrscheinlichkeit von ${pct(pBestanden(4))} vorher, bei 8 Stunden ${pct(pBestanden(8))}, bei 12 Stunden ${pct(pBestanden(12))}.`,
    figures: [
      { label: 'mindestens 10 Aufgaben', value: `${BE.k} von ${BE.n}` },
      { label: 'Logit je Stunde b₁', value: num(BE.b1) },
      { label: 'Odds Ratio je Stunde', value: num(Math.exp(BE.b1), 1) },
      { label: '50 % bei', value: `${num(-BE.b0 / BE.b1)} Stunden` },
    ],
  },
  heisst: {
    sym: 'p = 1 / (1 + e^(−η))', say: 'p gleich eins durch eins plus e hoch minus eta',
    fach: 'Die logistische Regression modelliert den Logit der Ereigniswahrscheinlichkeit als linearen Prädiktor η = b₀ + b₁x. Geschätzt wird nach Maximum Likelihood.',
  },
  bausteine: [
    {
      title: 'Den linearen Prädiktor bilden',
      was: 'Wie bei der Geraden: Startwert plus Steigung mal Lernzeit. Heraus kommt ein Logit, noch keine Wahrscheinlichkeit.',
      rechnung: `Bei 12 Stunden: η = ${num(BE.b0)} + ${num(BE.b1)} · 12 ≈ ${num(BE.b0 + BE.b1 * 12)}; R rechnet mit allen Nachkommastellen.`,
      warum: 'Auf der Logit-Skala darf die Gerade beliebig groß oder klein werden, ohne Grenzen.',
      acht: `b₁ = ${num(BE.b1)} ist keine Änderung in Prozentpunkten. Es ist die Änderung des Logits je Stunde.`,
      concept: 'prediction',
    },
    {
      title: 'In eine Wahrscheinlichkeit zurückrechnen',
      was: 'Die logistische Funktion macht aus jedem Logit eine Zahl zwischen 0 und 1.',
      rechnung: `p = 1 / (1 + e^(−${num(BE.b0 + BE.b1 * 12)})) ≈ ${num(pBestanden(12))}, also ${pct(pBestanden(12))}.`,
      warum: 'So bleibt jede Vorhersage eine echte Wahrscheinlichkeit, auch bei sehr viel oder sehr wenig Lernzeit.',
      acht: 'Die S-Kurve ist in der Mitte steil und an den Rändern flach. Eine Stunde Unterschied geht deshalb nicht überall mit gleich viel Unterschied in der Wahrscheinlichkeit einher.',
      concept: 'logit',
    },
    {
      title: 'Die Odds Ratio lesen',
      was: 'e hoch b₁ sagt, mit welchem Faktor sich die Odds je Stunde ändern.',
      rechnung: `e^${num(BE.b1)} ≈ ${num(Math.exp(BE.b1), 1)}: Je Stunde mehr werden die Odds, 10 Aufgaben zu schaffen, mit ${num(Math.exp(BE.b1), 1)} malgenommen.`,
      warum: 'Auf der Odds-Skala gilt für jede Stunde derselbe Faktor. Für die Wahrscheinlichkeit selbst gilt das nicht.',
      acht: `Eine Odds Ratio von ${num(Math.exp(BE.b1), 1)} heißt nicht 40 % mehr Wahrscheinlichkeit. Sie nimmt die Odds mal, nicht die Wahrscheinlichkeit.`,
      concept: 'effect',
    },
  ],
  regler: {
    label: 'Wie lange hat eine Person gelernt?', min: 0, max: 18, step: 1, initial: 8,
    format: v => unit(v, 'Stunde', 'Stunden'),
    describe: v => {
      const p = pBestanden(v);
      return `Bei ${unit(v, 'Stunde', 'Stunden')} Lernzeit sagt das Modell eine Wahrscheinlichkeit von ${pct(p)} vorher, mindestens 10 Aufgaben zu lösen. Die Odds stehen bei ${num(p / (1 - p))}.`;
    },
  },
  ausprobieren: [
    {
      question: 'Von 6 auf 7 Stunden oder von 15 auf 16 Stunden: Wo steigt die vorhergesagte Wahrscheinlichkeit stärker?', options: ['von 6 auf 7', 'von 15 auf 16', 'überall gleich'], correct: 0, step: 2,
      explain: `Von 6 auf 7 Stunden steigt sie von ${pct(pBestanden(6))} auf ${pct(pBestanden(7))}, von 15 auf 16 Stunden nur von ${pct(pBestanden(15))} auf ${pct(pBestanden(16))}. In der Mitte ist die S-Kurve am steilsten.`,
      kurz: 'Derselbe Unterschied von einer Stunde zählt in der Mitte viel, am Rand wenig.',
    },
    {
      question: 'Kann das Modell bei 40 Stunden Lernzeit eine Wahrscheinlichkeit über 1 vorhersagen?', options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Die logistische Funktion bleibt immer unter 1. Bei 40 Stunden sagt das Modell fast 100 % vorher, aber nie mehr.',
      kurz: 'Die S-Kurve hält jede Vorhersage zwischen 0 und 1.',
    },
    {
      question: `Je Stunde werden die Odds mit ${num(Math.exp(BE.b1), 1)} malgenommen. Was passiert bei zwei Stunden mehr?`, options: ['mal 2,8', 'mal 1,4 · 1,4 ≈ 1,96', 'plus 2,8'], correct: 1, step: 3,
      explain: 'Jede Stunde nimmt die Odds noch einmal mit 1,4 mal. Zwei Stunden ergeben 1,4 · 1,4 ≈ 1,96, also fast doppelte Odds.',
      kurz: 'Odds Ratios werden malgenommen, nicht addiert.',
    },
  ],
  check: {
    question: 'Ein Logitmodell meldet für die Lernzeit B = 0,3. Was heißt das?',
    options: [
      'Je Stunde steigt die Wahrscheinlichkeit um 30 Prozentpunkte.',
      'Je Stunde steigt der Logit um 0,3; die Odds werden mit e^0,3 ≈ 1,35 malgenommen.',
      'Je Stunde wird die Wahrscheinlichkeit mit 1,35 malgenommen.',
      'Die Lernzeit erfasst 30 % der Streuung.',
    ],
    correct: 1,
    right: 'Genau. B steht auf der Logit-Skala; e hoch B ist die Odds Ratio.',
    diagnose: {
      0: 'Fast! B ist keine Änderung in Prozentpunkten. Wie stark sich die Wahrscheinlichkeit ändert, hängt davon ab, wo jemand auf der S-Kurve steht.',
      2: 'Fast! Der Faktor 1,35 gilt für die Odds, nicht für die Wahrscheinlichkeit.',
      3: 'Noch nicht ganz. B ist kein Anteil erfasster Streuung, sondern die Änderung des Logits je Stunde.',
    },
  },
  fuerDich: 'Wenn du liest, eine Gruppe habe „doppelt so hohe Chancen“, ist oft eine Odds Ratio von 2 gemeint. Frag nach den Wahrscheinlichkeiten selbst: Von 1 % auf 2 % ist etwas ganz anderes als von 40 % auf 57 %.',
  genau: {
    kurz: 'Die Koeffizienten gelten auf der Logit-Skala. Für Aussagen in Prozentpunkten braucht es marginale Effekte.',
    paragraphs: [
      'Für die logistische Regression gibt es keine Formel wie b₁ = sₓᵧ / sₓ². R sucht die Koeffizienten Schritt für Schritt, bis die Likelihood nicht mehr wächst.',
      'Das Modell nimmt unabhängige Personen an und einen geraden Zusammenhang auf der Logit-Skala. Beide Antworten müssen vorkommen; trennt ein Prädiktor Ja und Nein vollständig, gibt es keine endliche Schätzung.',
      'Ein großer p-Wert im Hosmer-Lemeshow-Test beweist keine gute Passung. Die Pseudo-R²-Werte sind keine Anteile erklärter Varianz.',
      'Für das Beispiel wird der Wissenstest in R umkodiert: mutate(bestanden = rec(wissenstest, rules = "10:20=1; 0:9=0")). Das Modell beschreibt einen Zusammenhang, keine Wirkung der Lernzeit.',
    ],
  },
};

export const logistischeRegressionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'weiterbildung' },
    kurz: 'Das Modell aus dem R-Aufruf mit allen 200 Befragten: Hängt eine Weiterbildung mit Lernzeit und Alter zusammen?',
    value: c => wbModel(c)?.b[1] ?? null,
    result: c => {
      const m = wbModel(c);
      if (!m) return { kurz: 'Mit diesen Daten lässt sich das Logitmodell nicht schätzen.', fachlich: 'Es braucht Ja- und Nein-Antworten und Prädiktoren, die Ja und Nein nicht vollständig trennen.' };
      const lo = Math.min(...m.p), hi = Math.max(...m.p), flat = Math.abs(m.or - 1) < 0.02;
      return {
        kurz: `Je Stunde Lernzeit werden die Odds einer Weiterbildung mit ${num(m.or)} malgenommen, bei gleichem Alter. ${flat ? 'Sie ändern sich also so gut wie gar nicht.' : m.or > 1 ? 'Sie steigen also mit der Lernzeit.' : 'Sie sinken also mit der Lernzeit.'}`,
        fachlich: `logit(p) = ${coef(m.b[0])} ${plus(m.b[1])} · Lernzeit ${plus(m.b[2])} · Alter. Die Odds Ratio der Lernzeit ist e^b₁ ≈ ${num(m.or, 3)}.`,
        zusatz: `Die vorhergesagten Wahrscheinlichkeiten reichen von ${num(lo)} bis ${num(hi)}. ${hi - lo < 0.2 ? 'Lernzeit und Alter trennen die beiden Gruppen kaum.' : 'Lernzeit und Alter trennen die beiden Gruppen merklich.'}`,
      };
    },
    voraussetzung: 'Das Modell nimmt unabhängige Befragte an und einen geraden Zusammenhang auf der Logit-Skala. Es beschreibt Zusammenhänge, keine Wirkungen.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was macht der Logit-Koeffizient der Lernzeit?', options: ['verdoppelt sich', 'halbiert sich', 'bleibt gleich'], correct: 1,
        explain: 'Eine Stunde zählt jetzt wie zwei. Damit jede Person dieselbe Wahrscheinlichkeit behält, muss der Koeffizient halb so groß werden.',
        kurz: 'Andere Einheit, anderer Koeffizient, gleiche Vorhersagen.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 0.5 },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was macht der Logit-Koeffizient der Lernzeit?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Verschieben ändert nur den Startwert b₀. Wie stark sich der Logit je Stunde ändert, bleibt gleich.',
        kurz: 'Verschieben ändert die Steigung nicht, auch nicht auf der Logit-Skala.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Weiterbildung wird umgepolt: Aus Ja wird Nein und aus Nein Ja. Was macht der Logit-Koeffizient der Lernzeit?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Der Logit von Nein ist das Minus des Logits von Ja. Damit drehen alle Koeffizienten ihr Vorzeichen, ihre Beträge bleiben.',
        kurz: 'Ja und Nein tauschen dreht die Richtung.',
        tryIt: { label: 'Weiterbildung umpolen (Ja und Nein tauschen)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'logistic_regression', variant: 0,
    tokens: { logistic_regression: LOGISTIC_TOKEN, factors: FACTORS_TOKEN, modell: MODELL },
    outputMap: [
      { match: '-0.006', atlas: 'b₁, Logit je Stunde', step: 1, explain: 'B der Lernzeit auf der Logit-Skala: fast 0. Weiterbildung hängt hier kaum mit der Lernzeit zusammen.' },
      { match: '0.994', atlas: 'Odds Ratio', step: 3, explain: 'Exp(B): Je Stunde werden die Odds einer Weiterbildung mit 0,994 malgenommen, bei gleichem Alter.' },
      { match: '0.4225702', atlas: 'p von P001', step: 2, explain: 'predict(modell, type = "response") rechnet für jede Person die Wahrscheinlichkeit aus, hier für P001: 0,42.' },
      { match: '59.0', atlas: 'richtig eingeordnet', explain: 'Mit der Schwelle 0,5 sagt das Modell für alle Nein vorher, denn kein p erreicht 0,5. Richtig sind dann genau die 59 % ohne Weiterbildung.' },
    ],
    check: {
      question: 'Welche Zahl ist die Odds Ratio der Lernzeit? Tippe sie an.', correct: '0.994',
      wrong: {
        '-0.006': 'Fast! Das ist B, die Änderung des Logits. Die Odds Ratio steht unter Exp(B).',
        '0.4225702': 'Fast! Das ist die Wahrscheinlichkeit für P001 aus predict(). Die Odds Ratio steht unter Exp(B).',
        '59.0': 'Fast! Das ist der Anteil richtig eingeordneter Befragter. Die Odds Ratio steht unter Exp(B).',
      },
    },
  },
  next: {
    next: { id: 'marginal_effects', why: 'Übersetzt die Logit-Steigung in Prozentpunkte: Um wie viel ändert sich die Wahrscheinlichkeit je Stunde?' },
    before: [
      { id: 'logit', why: 'Die Skala, auf der das Modell eine Gerade ist.' },
      { id: 'likelihood', why: 'Das Prinzip, nach dem die Koeffizienten geschätzt werden.' },
      { id: 'prediction', why: 'Startwert plus Koeffizienten mal Prädiktoren, hier als Logit.' },
    ],
    after: [{ id: 'confidence', why: 'Intervalle zeigen, wie genau die Odds Ratios geschätzt sind.' }],
    more: [
      { id: 'linear_regression', why: 'Die Gerade für Zielgrößen mit vielen möglichen Werten.' },
      { id: 'chi_square', why: 'Ohne metrischen Prädiktor reicht für zwei Kategorien oft eine Kreuztabelle.' },
    ],
  },
};
