// Begriffskarte „Levene & Brown–Forsythe“: Streut die Lernzeit in den fünf Abschlussgruppen gleich stark? Wie der Leitaufruf
// levene_test(lernzeit, group = schulabschluss, center = "median"). Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';
import { abschluss, leveneFor, often, pText } from './stats';

export const levene: ConceptCard = {
  concept: 'levene_test',
  wofuer: 'Streut die Lernzeit der letzten sieben Tage in allen fünf Abschlussgruppen ähnlich stark? Der Levene-Test prüft das mit einem Trick: Er macht aus jeder Lernzeit einen Abstand zum Zentrum ihrer Gruppe. Dann vergleicht er die mittleren Abstände wie in einer ANOVA.',
  kurz: 'Der Levene-Test prüft, ob Gruppen unterschiedlich stark streuen. Er vergleicht, wie weit die Menschen im Mittel vom Zentrum ihrer Gruppe entfernt sind.',
  stellDirVor: {
    text: 'Im Lehrdatensatz liegen Befragte mit Abitur im Mittel etwa 2,6 Stunden vom Median ihrer Gruppe entfernt, Befragte mit Hauptschulabschluss etwa 1,9 Stunden. Die anderen drei Gruppen liegen dazwischen. Ist dieser Unterschied größer, als der Zufall erwarten lässt? R meldet F(4, 195) = 0.799, p = 0.527.',
    figures: [
      { label: 'Abstand bei Abitur', value: '≈ 2,6 h' },
      { label: 'Abstand bei Hauptschulabschluss', value: '≈ 1,9 h' },
      { label: 'Brown–Forsythe in R', value: 'p = 0.527' },
    ],
  },
  heisst: {
    sym: 'zᵢⱼ', say: 'z i j',
    fach: 'Levene-Test auf gleiche Varianzen: eine einfaktorielle ANOVA auf die Abstände zᵢⱼ = |xᵢⱼ − Zⱼ| vom Gruppenzentrum Zⱼ. Mit dem Median als Zentrum heißt er Brown–Forsythe-Test; mariposa nimmt ohne Angabe den Mittelwert.',
  },
  bausteine: [
    {
      title: 'Das Zentrum jeder Gruppe finden',
      was: 'Für jede Gruppe bestimmen wir ein Zentrum. Beim Brown–Forsythe-Test ist es der Median, der mittlere Wert der Reihe nach; beim Levene-Test der Mittelwert.',
      rechnung: 'Median der Lernzeit: 5,7 Stunden ohne Abschluss, dann 7,3; 8; 8,6 und 8,9 Stunden mit Abitur.',
      warum: 'Von diesem Zentrum aus messen wir gleich, wie weit jede Person entfernt ist.',
      acht: 'Der Median ist unempfindlicher gegen Ausreißer. Deshalb nimmt man ihn gern, wenn die Werte schief verteilt sind.',
      concept: 'median',
    },
    {
      title: 'Die Abstände zum Zentrum messen',
      was: 'Für jede Person nehmen wir den Abstand ihrer Lernzeit zum Zentrum ihrer Gruppe, ohne Vorzeichen. Wer mit Abitur 12,4 Stunden lernt, liegt 3,5 Stunden über dem Median.',
      rechnung: 'z = |12,4 − 8,9| = 3,5 Stunden',
      warum: 'Streut eine Gruppe stark, sind ihre Abstände groß. Der mittlere Abstand misst also, wie stark die Gruppe streut.',
      acht: 'Ohne Betrag würden sich Abstände nach oben und unten gegenseitig aufheben. Deshalb zählt nur, wie weit, nicht in welche Richtung.',
      concept: 'deviation',
    },
    {
      title: 'Die Abstände wie in einer ANOVA vergleichen',
      was: 'Jetzt rechnet der Test eine einfaktorielle ANOVA mit den Abständen statt mit den Lernzeiten. Ein großes F heißt: Die Gruppen streuen verschieden stark.',
      rechnung: 'Mittlere Abstände je Abschluss: 2,4; 1,9; 2,5; 2,1 und 2,6 Stunden. F(4, 195) ≈ 0,8, p ≈ 0,53.',
      warum: 'So wird aus der Frage nach gleicher Streuung eine Frage nach gleichen Mittelwerten. Die kann die ANOVA beantworten.',
      acht: 'Ein großes p heißt nicht, dass die Streuungen gleich sind. Es heißt nur, dass die Daten nicht dagegen sprechen.',
      concept: 'oneway_anova',
    },
  ],
  ausprobieren: [
    {
      question: 'Alle Befragten lernen doppelt so lange. Was passiert mit F im Levene-Test?',
      options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 0, step: 3,
      explain: 'Alle Abstände verdoppeln sich, in allen Gruppen gleich. Das Verhältnis zwischen und innerhalb der Gruppen bleibt, also auch F.',
      kurz: 'Der Test hängt nicht von der Einheit ab.',
    },
    {
      question: 'Warum nimmt der Test den Betrag der Abstände und nicht die Abstände mit Vorzeichen?',
      options: ['Sonst heben sich die Abstände auf', 'Beträge sind kleiner', 'Das ist egal'], correct: 0, step: 2,
      explain: 'Mit Vorzeichen ergeben die Abstände um den Mittelwert in jeder Gruppe genau 0. Dann sähen alle Gruppen gleich aus, egal wie stark sie streuen.',
      kurz: 'Für die Streuung zählt die Entfernung, nicht die Richtung.',
    },
    {
      question: 'Der Levene-Test ist bei den 200 Befragten nicht auffällig. Nimmt man deshalb die klassische ANOVA statt der Welch-ANOVA?',
      options: ['nicht automatisch', 'ja, immer'], correct: 0, step: 3,
      explain: 'Der Levene-Test ist kein Schalter. Welch verliert wenig, auch wenn die Varianzen gleich sind; viele nehmen ihn deshalb von vornherein.',
      kurz: 'Die Wahl des Tests steht am besten vor der Auswertung fest.',
    },
  ],
  check: {
    question: 'Was vergleicht der Levene-Test zwischen den Gruppen?',
    options: ['die Mittelwerte der Lernzeit', 'die mittleren Abstände zum Zentrum der Gruppe', 'die Mediane der Gruppen', 'die Größe der Gruppen'],
    correct: 1,
    right: 'Genau. Je größer der mittlere Abstand, desto stärker streut die Gruppe.',
    diagnose: {
      0: 'Fast! Das macht die ANOVA mit den Lernzeiten selbst. Levene vergleicht die Abstände zum Zentrum der Gruppe.',
      2: 'Fast! Der Median ist nur der Bezugspunkt, von dem aus gemessen wird.',
      3: 'Noch nicht ganz. Die Gruppengrößen gehen in die Freiheitsgrade ein, verglichen werden sie nicht.',
    },
  },
  fuerDich: 'Wenn du in einer Arbeit liest „Levene-Test nicht signifikant, also gleiche Varianzen“, sei vorsichtig. Schau lieber selbst auf die Standardabweichungen je Gruppe und nimm im Zweifel den Welch-Test.',
  genau: {
    kurz: 'Brown–Forsythe nimmt den Median als Zentrum und ist robuster bei schiefen Daten. mariposa nimmt ohne Angabe den Mittelwert; center = "median" wählt Brown–Forsythe.',
    paragraphs: [
      'Die Prüfgröße ist das F einer einfaktoriellen ANOVA auf zᵢⱼ = |xᵢⱼ − Zⱼ|, mit k − 1 und N − k Freiheitsgraden. Im Lehrdatensatz meldet R mit dem Median F(4, 195) = 0.799, p = 0.527, mit dem Mittelwert F(4, 195) = 0.835, p = 0.504.',
      'Ein nicht auffälliges Ergebnis beweist keine gleichen Varianzen. Bei kleinen Gruppen übersieht der Test auch deutliche Unterschiede, bei sehr großen Gruppen fällt schon ein kleiner Unterschied auf.',
      'Der Test ist kein automatischer Schalter zwischen Student und Welch. Die Wahl sollte vor der Auswertung stehen; Welch verliert bei gleichen Varianzen wenig.',
    ],
  },
};


export const leveneTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Derselbe Test mit allen 200 Befragten: Streut die Lernzeit in den fünf Abschlussgruppen gleich stark?',
    value: c => { const l = leveneFor(c); return Number.isFinite(l.F) ? l.F : null; },
    result: c => {
      const l = leveneFor(c), m = leveneFor(c, 'mean');
      if (!Number.isFinite(l.F)) return { kurz: 'Die Lernzeit streut nicht. Dann gibt es keine Abstände, die sich vergleichen ließen.', fachlich: 'Alle Abstände sind 0; F ist nicht definiert.' };
      const lo = l.parts.reduce((p, q) => q.distance < p.distance ? q : p), hi = l.parts.reduce((p, q) => q.distance > p.distance ? q : p);
      return {
        kurz: `Im Mittel liegen die Befragten ${num(lo.distance, 1)} Stunden (${abschluss(lo.level)}) bis ${num(hi.distance, 1)} Stunden (${abschluss(hi.level)}) vom Median ihrer Gruppe entfernt. Gäbe es keine Unterschiede in der Streuung, wären solche Unterschiede ${often(l.p)} Stichproben zu erwarten (${pText(l.p)}).`,
        fachlich: `Brown–Forsythe-Test (Levene mit Median): F(${l.df1}, ${l.df2}) ≈ ${num(l.F)}, ${pText(l.p)}. Mit dem Mittelwert als Zentrum: F ≈ ${num(m.F)}, ${pText(m.p)}.`,
        zusatz: 'Ein großes p heißt nicht, dass die Streuungen gleich sind; die Daten sprechen nur nicht dagegen.',
      };
    },
    voraussetzung: 'Unabhängige Befragte. Mit dem Median als Zentrum ist der Test auch bei schiefen Verteilungen verlässlich.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit F?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1,
        explain: 'Alle Abstände zum Median verdoppeln sich, in allen Gruppen gleich. F vergleicht sie nur untereinander und bleibt gleich.',
        kurz: 'Die Einheit spielt keine Rolle.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Lernzeit wird umgepolt: 60 Stunden minus der eigene Wert. Was passiert mit F?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird größer'], correct: 0,
        explain: 'Der Median spiegelt sich mit. Jeder Abstand zu ihm bleibt genau gleich groß, nur die Richtung dreht sich, und die zählt hier nicht.',
        kurz: 'Abstände ohne Vorzeichen überstehen das Umpolen.',
        tryIt: { label: 'Lernzeit umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'levene_test', variant: 0,
    tokens: {
      center: { sym: 'center =', term: 'Gruppenzentrum', kurz: '"median" misst die Abstände zum Median jeder Gruppe (Brown–Forsythe), "mean" zum Mittelwert (Levene).', fehler: 'Mit einem anderen Wort meldet mariposa: `center` must be one of "mean" or "median".' },
      '"median"': { sym: '"median"', term: 'Median', kurz: 'Das Zentrum für die Abstände ist der Median jeder Gruppe. Das ist der Brown–Forsythe-Test.', fehler: 'Ohne Anführungszeichen ist median die R-Funktion für den Median, kein Wort. mariposa meldet dann: `center` must be a character vector, not a function.' },
    },
    outputMap: [
      { match: 'F', atlas: 'F der Abstände', step: 3, explain: 'F der einfaktoriellen ANOVA auf die Abstände zum Median, wie in Schritt 3.' },
      { match: 'p', atlas: 'p-Wert', step: 3, explain: 'Gäbe es keine Unterschiede in der Streuung, wären solche Unterschiede der Abstände in etwa 53 von 100 Stichproben zu erwarten.' },
      { match: 'variances equal', atlas: 'Kurzdeutung', explain: 'mariposa schreibt das, wenn p über 0,05 liegt. Bewiesen sind gleiche Varianzen damit nicht.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie überraschend die Unterschiede der Abstände wären, wenn alle Gruppen gleich streuten? Tippe sie an.', correct: 'p',
      wrong: { F: 'Fast! Das ist F, die Prüfgröße. Wie überraschend sie wäre, sagt p.', 'variances equal': 'Fast! Das ist die Kurzdeutung von mariposa. Sie folgt aus p und beweist keine gleichen Varianzen.' },
    },
  },
  next: {
    next: { id: 'normality_test', why: 'Die zweite Annahme der ANOVA: annähernd normalverteilte Werte in den Gruppen.' },
    before: [
      { id: 'variance_assumption', why: 'Die Annahme gleicher Fehlervarianz, die der Test befragt.' },
      { id: 'median', why: 'Das Zentrum, von dem aus Brown–Forsythe die Abstände misst.' },
      { id: 'oneway_anova', why: 'Der Test ist eine einfaktorielle ANOVA auf die Abstände.' },
    ],
    after: [{ id: 'p_value', why: 'Wie überraschend die Unterschiede der Streuung wären, wenn es keine gäbe.' }],
    more: [{ id: 't_test', why: 'Der Welch-t-Test braucht keine gleichen Varianzen.' }],
  },
};
