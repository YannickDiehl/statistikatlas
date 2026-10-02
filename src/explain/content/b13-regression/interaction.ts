// Begriffskarte „Interaktion“ (Bereich B13) mit Reitern. Beispiel: wissenstest ~ lernzeit * weiterbildung, wie der
// Katalogaufruf linear_regression (Variante 1). Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx, TokenNote } from '../../types';
import { num, unit } from '../../format';
import { sampleColumn } from '../../sample';
import { ref, titleFor } from '../../../domain/learning';
import { ols } from './fit';
import { LINEAR_REGRESSION_TOKEN, MODELL } from './gerade-tabs';

/** lm(wissenstest ~ lernzeit * weiterbildung) bei den 200 Befragten (R). */
export const IA = { b0: 6.46656417701, b1: 0.48240625911, b2: -0.88941068393, b3: 0.08977126592, p: 0.4469257, nMit: 82 } as const;
const tasks = (v: number) => unit(v, 'Aufgabe', 'Aufgaben');
/** „+ 0,09“ bzw. „− 0,2“ für Rechnungen. */
const plus = (v: number) => `${v < 0 ? '−' : '+'} ${num(Math.abs(v))}`;

/** Modell mit Interaktion für die aktuellen Daten: y ~ x · g (Haupteffekte und Produkt). */
export function interactionFor(c: SampleCtx) {
  const x = sampleColumn(c.rows, c.columns.x?.[0] ?? 'lernzeit'), y = sampleColumn(c.rows, c.columns.y?.[0] ?? 'wissenstest');
  const g = sampleColumn(c.rows, c.columns.group?.[0] ?? 'weiterbildung');
  const m = ols([x, g, x.map((v, i) => v * g[i])], y);
  return m ? { b: m.b, n1: g.filter(v => v === 1).length, n0: g.filter(v => v === 0).length } : null;
}
/** Steigung in Worten: „0,48 Aufgaben mehr“, „0,2 Aufgaben weniger“. */
const perHour = (b: number) => `${tasks(Math.abs(b))} ${b < 0 ? 'weniger' : 'mehr'}`;

/** Codelegende zum Sternchen in lernzeit * weiterbildung (geprüft in R: nur lernzeit:weiterbildung zeigt keine Haupteffekte). */
export const STAR_TOKEN: TokenNote = { sym: '*', term: titleFor(ref('interaction')), kurz: 'lernzeit * weiterbildung nimmt beide Variablen und ihr Produkt ins Modell. R schreibt das Produkt als lernzeit:weiterbildung.', fehler: 'Mit lernzeit:weiterbildung statt mit dem Sternchen fehlen die beiden Haupteffekte. R rechnet trotzdem, zeigt aber nur die Zeile lernzeit:weiterbildung, und ihre Zahl bedeutet dann etwas anderes.' };

export const interaktion: ConceptCard = {
  concept: 'interaction',
  picture: 'b13-interaktion',
  wofuer: 'Hängt die Lernzeit bei allen gleich stark mit dem Wissenstest zusammen? Vielleicht ist die Gerade bei Befragten mit Weiterbildung steiler als bei denen ohne. Eine Interaktion prüft genau das: ob die Steigung einer Variable von einer anderen abhängt.',
  kurz: 'Eine Interaktion heißt: Wie stark x mit y zusammenhängt, hängt von einer dritten Variable ab. Im Bild sind das zwei Geraden mit verschiedener Steigung.',
  stellDirVor: {
    text: `R schätzt für die 200 Befragten den Wissenstest aus Lernzeit, Weiterbildung (0 = Nein, 1 = Ja) und ihrem Produkt. Ohne Weiterbildung steigt die Gerade um ${num(IA.b1)} Aufgaben je Stunde, mit Weiterbildung um ${num(IA.b1)} + ${num(IA.b3)} = ${num(IA.b1 + IA.b3)}. Der Unterschied ist klein; R meldet dazu p = .447.`,
    figures: [
      { label: 'Steigung ohne Weiterbildung', value: num(IA.b1) },
      { label: 'Steigung mit Weiterbildung', value: num(IA.b1 + IA.b3) },
      { label: 'Unterschied b₃', value: num(IA.b3) },
      { label: 'p-Wert in R', value: '.447' },
    ],
  },
  heisst: {
    sym: 'b₃ · x · z', say: 'b drei mal x mal z',
    fach: 'Ein Interaktionsterm ist das Produkt zweier Prädiktoren im linearen Prädiktor. Sein Koeffizient b₃ gibt an, um wie viel sich die Steigung von x ändert, wenn z um eins größer ist.',
  },
  bausteine: [
    {
      title: 'Zwei Prädiktoren malnehmen',
      was: 'Für jede Person bilden wir das Produkt aus Lernzeit und Weiterbildung. Ohne Weiterbildung ist es 0, mit Weiterbildung gleich der Lernzeit.',
      rechnung: 'P001 hat 6 Stunden gelernt und eine Weiterbildung gemacht: 6 · 1 = 6. Ohne Weiterbildung wäre es 6 · 0 = 0.',
      warum: 'So kann das Modell der Lernzeit in den beiden Gruppen ein verschiedenes Gewicht geben.',
      acht: 'In R schreibst du lernzeit * weiterbildung. Das Sternchen nimmt beide Variablen und ihr Produkt ins Modell.',
      concept: 'multiply',
    },
    {
      title: 'Die Steigung je Gruppe ablesen',
      was: 'Ohne Weiterbildung gilt die Steigung b₁. Mit Weiterbildung kommt b₃ dazu: b₁ + b₃.',
      rechnung: `Ohne: ${num(IA.b1)} Aufgaben je Stunde. Mit: ${num(IA.b1)} + ${num(IA.b3)} = ${num(IA.b1 + IA.b3)} Aufgaben je Stunde.`,
      warum: 'b₃ ist der Unterschied der beiden Steigungen. Ist b₃ = 0, laufen die beiden Geraden parallel.',
      acht: 'b₁ gilt jetzt nur für die Gruppe mit Weiterbildung = 0. Wer b₁ als Steigung für alle liest, übersieht die Interaktion.',
      concept: 'linear_regression',
    },
    {
      title: 'Den Unterschied einordnen',
      was: `Der Unterschied von ${num(IA.b3)} Aufgaben je Stunde ist klein. R meldet für das Produkt p = .447.`,
      warum: 'Gäbe es in Wahrheit keinen Unterschied der Steigungen, käme ein so großer Unterschied in etwa 45 von 100 Stichproben vor.',
      acht: 'Ein großer p-Wert beweist nicht, dass die Steigungen gleich sind. Er heißt nur: Die Daten passen gut zu parallelen Geraden.',
      concept: 'p_value',
    },
  ],
  regler: {
    label: 'Was wäre, wenn b₃ anders wäre?', min: -0.5, max: 0.5, step: 0.01, initial: 0.09,
    format: v => `b₃ = ${num(v)}`,
    describe: v => {
      const mit = IA.b1 + v;
      if (Math.abs(v) < 0.005) return `Mit b₃ = 0 sind beide Geraden gleich steil, ${num(IA.b1)} Aufgaben je Stunde: Sie laufen parallel.`;
      return `Mit Weiterbildung sagt die Gerade dann je Stunde ${perHour(mit)} voraus (${num(IA.b1)} ${plus(v)} = ${num(mit)}), ohne Weiterbildung ${perHour(IA.b1)}. Die Gerade mit Weiterbildung ist ${v > 0 ? 'steiler' : mit < -0.005 ? 'sogar fallend' : 'flacher'}.`;
    },
  },
  ausprobieren: [
    {
      question: 'Setz b₃ auf 0. Wie verlaufen die beiden Geraden?', options: ['parallel', 'sie kreuzen sich', 'beide waagerecht'], correct: 0, step: 2,
      explain: 'Ohne Interaktion bekommt die Lernzeit in beiden Gruppen dasselbe Gewicht. Die Weiterbildung schiebt die Gerade dann nur nach oben oder unten.',
      kurz: 'b₃ = 0 heißt: gleiche Steigung, parallele Geraden.',
    },
    {
      question: 'Ein Modell nur mit Lernzeit und Weiterbildung, ohne Produkt: Können die beiden Geraden verschieden steil sein?', options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Ohne Produkt hat die Lernzeit ein einziges Gewicht für alle. Erst das Produkt erlaubt jeder Gruppe ihre eigene Steigung.',
      kurz: 'Verschiedene Steigungen brauchen einen Interaktionsterm.',
    },
    {
      question: `Im Modell mit Interaktion ist b₁ = ${num(IA.b1)}. Für wen gilt diese Steigung?`, options: ['für alle', 'für Befragte ohne Weiterbildung', 'für Befragte mit Weiterbildung'], correct: 1, step: 2,
      explain: `Bei Weiterbildung = 0 fällt das Produkt weg, und es bleibt b₁. Mit Weiterbildung gilt b₁ + b₃ = ${num(IA.b1 + IA.b3)}.`,
      kurz: 'Haupteffekte gelten dort, wo die andere Variable 0 ist.',
    },
  ],
  check: {
    question: 'Ein Modell meldet b₁ = 0,4 für die Lernzeit und b₃ = 0,2 für das Produkt mit der Weiterbildung. Wie steil ist die Gerade für Befragte mit Weiterbildung?',
    options: ['0,2 Aufgaben je Stunde', '0,4 Aufgaben je Stunde', '0,6 Aufgaben je Stunde', '0,08 Aufgaben je Stunde'], correct: 2,
    right: 'Genau. Mit Weiterbildung gilt b₁ + b₃ = 0,4 + 0,2 = 0,6.',
    diagnose: {
      0: 'Fast! 0,2 ist nur der Unterschied der beiden Steigungen. Die Steigung selbst ist b₁ + b₃.',
      1: 'Fast! 0,4 gilt für Befragte ohne Weiterbildung. Mit Weiterbildung kommt b₃ dazu.',
      3: 'Fast! b₁ und b₃ werden zusammengezählt, nicht malgenommen.',
    },
  },
  fuerDich: 'Wenn du liest, ein Zusammenhang gelte „vor allem für Frauen“ oder „nur in Ostdeutschland“, steckt oft eine Interaktion dahinter. Frag dann: Wie groß ist der Unterschied der Steigungen, und wie genau ist er geschätzt?',
  genau: {
    kurz: 'Mit Interaktion gelten die Haupteffekte nur dort, wo die andere Variable 0 ist. Produktterme erhöhen außerdem oft den VIF.',
    paragraphs: [
      'Allgemein ist die Steigung von x im Modell mit Interaktion b₁ + b₃ · z. Ist z metrisch, ändert sich die Steigung mit jedem Wert von z ein Stück.',
      `b₂ = ${num(IA.b2)} ist der Unterschied der beiden Geraden bei 0 Stunden Lernzeit, nicht der Unterschied im Durchschnitt. Zentriert man die Lernzeit vorher, gilt b₂ beim Mittelwert der Lernzeit.`,
      'Das Produkt hängt eng mit der Weiterbildung selbst zusammen. R meldet dafür VIF-Werte von 6.774 und 7.405 (Begriff „Multikollinearität“); die Vorhersagen des Modells berührt das nicht.',
      'Eine Interaktion beschreibt, dass ein Zusammenhang in Gruppen verschieden stark ist. Warum das so ist, sagt sie nicht.',
    ],
  },
};

export const interaktionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest', group: 'weiterbildung' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Ist die Gerade mit Weiterbildung steiler oder flacher als ohne?',
    value: c => interactionFor(c)?.b[3] ?? null,
    result: c => {
      const m = interactionFor(c);
      if (!m) return { kurz: 'Mit diesen Daten lässt sich das Modell nicht schätzen.', fachlich: 'Die Prädiktoren hängen vollständig voneinander ab.' };
      const [b0, b1, b2, b3] = m.b;
      return {
        kurz: `Ohne Weiterbildung sagt die Gerade je Stunde ${perHour(b1)} voraus, mit Weiterbildung ${perHour(b1 + b3)}. Der Unterschied b₃ beträgt ${num(b3)} Aufgaben je Stunde.`,
        fachlich: `ŷ = ${num(b0)} ${plus(b1)} · Lernzeit ${plus(b2)} · Weiterbildung ${plus(b3)} · (Lernzeit mal Weiterbildung). Mit Weiterbildung: ŷ = ${num(b0 + b2)} ${plus(b1 + b3)} · Lernzeit.`,
        zusatz: `${m.n1} Befragte haben eine Weiterbildung gemacht, ${m.n0} nicht.`,
      };
    },
    voraussetzung: 'Das Modell nimmt in jeder Gruppe einen geraden Zusammenhang an. Es beschreibt Unterschiede zwischen den Gruppen, keine Wirkungen.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was macht b₃?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Beide Geraden rücken um eine Stunde nach rechts. Ihre Steigungen bleiben, also auch deren Unterschied b₃.',
        kurz: 'Verschieben ändert nicht, wie verschieden steil die Geraden sind.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht b₃?', options: ['verdoppelt sich', 'halbiert sich', 'bleibt gleich'], correct: 1,
        explain: 'Beide Steigungen halbieren sich, denn eine Stunde zählt jetzt wie zwei. Damit halbiert sich auch ihr Unterschied.',
        kurz: 'Andere Einheit, andere Steigungen, anderer Unterschied.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 0.5 },
      },
      {
        question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was macht b₃?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Beide Geraden kippen: Aus Steigungen werden Gefälle gleicher Stärke. Auch ihr Unterschied dreht sein Vorzeichen.',
        kurz: 'Umpolen dreht die Richtung, nicht die Größe des Unterschieds.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 1,
    tokens: {
      linear_regression: LINEAR_REGRESSION_TOKEN, modell: MODELL,
      '*': STAR_TOKEN,
    },
    outputMap: [
      { match: '0.090', atlas: 'b₃', step: 2, explain: 'B in der Zeile lernzeit:weiterbildung ist der Unterschied der Steigungen: mit Weiterbildung 0,09 Aufgaben je Stunde mehr.' },
      { match: '0.482', atlas: 'b₁', step: 2, explain: 'B der Lernzeit: die Steigung ohne Weiterbildung, also bei Weiterbildung = 0.' },
      { match: '-0.889', atlas: 'b₂', explain: 'B der Weiterbildung: der Unterschied der beiden Geraden bei 0 Stunden Lernzeit.' },
      { match: '.447', atlas: 'p-Wert von b₃', step: 3, explain: 'Gäbe es keinen Unterschied der Steigungen, käme einer dieser Größe in etwa 45 von 100 Stichproben vor.' },
      { match: '7.405', atlas: 'VIF des Produkts', explain: 'Das Produkt hängt eng mit der Weiterbildung zusammen. Ein hoher VIF ist bei Produkttermen üblich.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie verschieden steil die beiden Geraden sind? Tippe sie an.', correct: '0.090',
      wrong: {
        '0.482': 'Fast! Das ist b₁, die Steigung ohne Weiterbildung. Der Unterschied steht in der Zeile lernzeit:weiterbildung.',
        '-0.889': 'Fast! Das ist b₂, der Abstand der Geraden bei 0 Stunden. Der Unterschied der Steigungen steht in der Zeile lernzeit:weiterbildung.',
        '7.405': 'Fast! Das ist der VIF des Produkts. Der Unterschied der Steigungen steht unter B.',
      },
    },
  },
  next: {
    next: { id: 'multicollinearity', why: 'Produktterme hängen eng mit ihren Bestandteilen zusammen. Was das für die Koeffizienten heißt, zeigt der VIF.' },
    before: [
      { id: 'linear_regression', why: 'Die Gerade, deren Steigung sich hier je Gruppe unterscheiden darf.' },
      { id: 'prediction', why: 'Das Produkt geht als weiteres Gewicht in den linearen Prädiktor ein.' },
      { id: 'dummy', why: 'Gruppen gehen als 0/1-Spalten in das Produkt ein.' },
    ],
    after: [
      { id: 'factorial_anova', why: 'Interaktionen zweier Faktoren, mit Gruppenmittelwerten statt Geraden.' },
      { id: 'marginal_effects', why: 'In Logitmodellen mit Interaktion zeigen marginale Effekte die Unterschiede in Prozentpunkten.' },
    ],
    more: [
      { id: 'centering', why: 'Zentrierte Prädiktoren machen die Haupteffekte leichter lesbar.' },
      { id: 'confounding', why: 'Eine Interaktion ist kein Beleg für eine Ursache.' },
    ],
  },
};
