// Begriffskarte „Null- & Alternativhypothese“. Beispiel: Schlafdauer der 200 Befragten gegen sieben Stunden
// (t-Test einer Stichprobe wie mariposa::t_test(schlafdauer, mu = 7)). Zahlen in R nachgerechnet, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';
import { MU0, SCHLAF as S, outOf100, pShown, schlafP, schlafTest } from './rechnen';


export const hypothese: ConceptCard = {
  concept: 'hypothesis',
  picture: 'b09-hypothese',
  wofuer: 'Ein Gesundheitsratgeber schreibt: Erwachsene schlafen im Schnitt sieben Stunden pro Nacht. Passt das zu den 200 Befragten des Lehrdatensatzes? Bevor du rechnest, legst du fest, welche Aussage du prüfst und welche Abweichung dich interessiert.',
  kurz: 'Die Nullhypothese ist die Annahme, die du prüfst, etwa „im Mittel genau sieben Stunden“. Die Alternativhypothese beschreibt die Abweichung, die dich interessiert.',
  stellDirVor: {
    text: `Die 200 Befragten haben in den letzten sieben Tagen im Schnitt ${num(S.mean)} Stunden pro Nacht geschlafen, knapp fünf Minuten mehr als sieben Stunden. Ist das ein echter Unterschied oder nur ein Zufall dieser Stichprobe? Der Test braucht dafür zwei Sätze. H₀ sagt: In der Grundgesamtheit sind es im Mittel genau sieben Stunden. H₁ sagt: Es sind mehr oder weniger. R meldet dazu p = 0.156.`,
    figures: [
      { label: 'Mittelwert der 200', value: `${num(S.mean)} h` },
      { label: 'Vergleichswert μ₀', value: `${MU0} h` },
      { label: 'Unterschied', value: `${num(S.mean - MU0)} h` },
      { label: 'p-Wert', value: num(S.p) },
    ],
  },
  heisst: {
    sym: 'H₀, H₁', say: 'H null, H eins',
    fach: 'Die Nullhypothese H₀ legt einen Wert oder eine Gleichheit in der Grundgesamtheit fest, hier μ = 7. Die Alternativhypothese H₁ umfasst die Abweichungen, die gegen H₀ sprechen sollen, hier μ ≠ 7.',
  },
  bausteine: [
    {
      title: 'Die Annahme festlegen',
      was: 'Du schreibst auf, welchen Wert die Grundgesamtheit hätte, wenn nichts Besonderes los wäre. Hier: im Mittel genau sieben Stunden Schlaf.',
      rechnung: 'H₀: μ = 7 Stunden',
      warum: 'Nur unter einer festen Annahme lässt sich ausrechnen, welche Mittelwerte der Zufall allein liefern würde.',
      acht: `H₀ handelt von der Grundgesamtheit, nicht von den 200 Befragten. Ihren Mittelwert ${num(S.mean)} kennst du schon, über ihn musst du nichts annehmen.`,
      concept: 'population_parameter',
    },
    {
      title: 'Die Gegenrichtung benennen',
      was: 'Die Alternativhypothese sagt, welche Abweichungen dich interessieren. Hier zählen beide Richtungen: mehr oder weniger als sieben Stunden.',
      rechnung: 'H₁: μ ≠ 7 Stunden',
      warum: 'Die Richtung bestimmt, welche Ergebnisse später als auffällig gelten. Deshalb legst du sie vor dem Blick in die Daten fest.',
      acht: 'Wer erst die Daten ansieht und dann die Richtung wählt, meldet ohne echten Unterschied doppelt so oft einen, wie α verspricht.',
      concept: 'test_sides',
    },
    {
      title: 'Verwerfen oder nicht verwerfen',
      was: `Am Ende entscheidest du nur über H₀: verwerfen oder nicht verwerfen. Mit p ≈ ${num(S.p)} verwirfst du H₀ bei α = 0,05 nicht.`,
      rechnung: `p ≈ ${num(S.p)} > α = 0,05: H₀ nicht verwerfen`,
      warum: 'Ein Test kann H₀ nur in Bedrängnis bringen, nicht beweisen. Auch 7,1 Stunden würde er hier nicht verwerfen.',
      acht: 'Nicht verworfen heißt nicht bestätigt. Die Daten passen zu sieben Stunden, aber genauso zu vielen Werten daneben.',
      concept: 'p_value',
    },
  ],
  ausprobieren: [
    {
      question: `Die Befragten schlafen im Schnitt ${num(S.mean)} Stunden. Darf H₀ lauten: μ = ${num(S.mean)}?`,
      options: ['ja, das ist ja der Mittelwert', 'nein, H₀ legst du vor den Daten fest'], correct: 1, step: 1,
      explain: 'H₀ ist ein Vergleichswert, den du vorher begründest, hier die sieben Stunden aus dem Ratgeber. Wer den Mittelwert der Stichprobe einsetzt, prüft nichts mehr: Der Test fände nie einen Unterschied.',
      kurz: 'Erst die Annahme, dann die Daten.',
    },
    {
      question: 'Der Test verwirft H₀ nicht. Heißt das, die Menschen schlafen im Mittel genau sieben Stunden?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: `Schieb den Regler auf 7,1 Stunden: Auch diesen Wert verwirft der Test nicht. Alle Werte von etwa ${num(S.lo)} bis ${num(S.hi)} Stunden passen zu den Daten; sieben Stunden ist nur einer davon.`,
      kurz: 'Nicht verworfen ist nicht bewiesen.',
    },
    {
      question: 'Du prüfst gegen 6,9 statt gegen 7 Stunden. Was passiert mit p?',
      options: ['p wird kleiner', 'p bleibt gleich', 'p wird größer'], correct: 0, step: 3,
      explain: `Der Abstand von ${num(S.mean)} zu 6,9 ist größer als der zu 7. Läge der wahre Mittelwert bei 6,9 Stunden, wäre so ein Abstand selten: p fällt auf etwa ${num(schlafP(6.9), 3)}.`,
      kurz: 'Ein anderer Vergleichswert ist eine andere Frage.',
    },
  ],
  regler: {
    label: 'Gegen welchen Wert μ₀ prüfst du (in Stunden)?',
    min: 6.7, max: 7.5, step: 0.05, initial: MU0,
    format: v => `μ₀ = ${num(v)} h`,
    describe: v => {
      const p = schlafP(v), d = Math.abs(S.mean - v);
      if (d < 0.005) return `Der Mittelwert der 200 liegt praktisch genau auf ${num(v)} Stunden. p ist dann fast 1, und du verwirfst H₀ nicht.`;
      return `Läge der wahre Mittelwert bei ${num(v)} Stunden, käme ein Abstand von mindestens ${num(d)} Stunden ${outOf100(p)} Stichproben vor, p ${pShown(p)}. Bei α = 0,05 verwirfst du H₀: μ = ${num(v)} ${p > 0.05 ? 'nicht' : 'und nennst den Unterschied signifikant'}.`;
    },
  },
  check: {
    question: 'Welches Paar ist ein sauberes Hypothesenpaar für die Frage, ob die Menschen im Mittel sieben Stunden schlafen?',
    options: [
      `H₀: x̄ = ${num(S.mean)}; H₁: x̄ ≠ ${num(S.mean)}`,
      'H₀: μ = 7; H₁: μ ≠ 7',
      'H₀: μ ≠ 7; H₁: μ = 7',
      `H₀: μ = 7; H₁: μ = ${num(S.mean)}`,
    ],
    correct: 1,
    right: 'Genau. H₀ legt den festen Wert μ = 7 fest, H₁ umfasst alle Abweichungen davon, in beide Richtungen.',
    diagnose: {
      0: 'Fast! x̄ ist der Mittelwert der Stichprobe, den kennst du schon. Hypothesen handeln vom Mittelwert μ der Grundgesamtheit.',
      2: 'Fast! Das ist vertauscht. H₀ legt den festen Wert fest, nur unter ihr lässt sich rechnen.',
      3: 'Fast! H₁ umfasst alle Abweichungen, die dich interessieren, nicht nur den Wert, den du in den Daten gesehen hast.',
    },
  },
  fuerDich: 'Wenn du in einer Hausarbeit einen Test planst, schreib die Hypothesen vor der Auswertung auf, in Worten und mit Zeichen. H₀ ist die nüchterne Annahme ohne Unterschied, H₁ das, was dich interessiert.',
  genau: {
    kurz: 'Hypothesen handeln von Kennwerten der Grundgesamtheit, etwa μ. Die Entscheidung lautet „verwerfen“ oder „nicht verwerfen“, nie „H₀ bewiesen“.',
    paragraphs: [
      `Hier ist das ein t-Test für eine Stichprobe: t(199) ≈ ${num(S.t)}, p ≈ ${num(S.p)}. Das 95-%-Konfidenzintervall reicht von ${num(S.lo)} bis ${num(S.hi)} Stunden. Jeden Vergleichswert μ₀ in diesem Bereich würde der Test bei α = 0,05 nicht verwerfen.`,
      'Bei Gruppenvergleichen kann H₀ gleiche Mittelwerte behaupten (t-Test) oder gleiche Verteilungen (Rangtests wie Mann-Whitney). Das sind verschiedene Aussagen.',
      'Eine gerichtete Alternative (größer oder kleiner) muss inhaltlich vor der Analyse feststehen. Wer sie erst nach dem Blick in die Daten wählt, meldet ohne echten Unterschied in etwa 10 statt 5 von 100 Studien einen.',
      'Die 200 Befragten des Lehrdatensatzes sind synthetisch. Die Rechnung zeigt, wie ein Test funktioniert, nicht, wie lange Menschen in Deutschland schlafen.',
    ],
  },
};

/** Reiter: Schlafdauer aller 200 gegen sieben Stunden, In R der Katalogaufruf t_test(schlafdauer, mu = 7), Weiter. */
export const hypotheseTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Passt ihre Schlafdauer zur Nullhypothese „im Mittel genau sieben Stunden“?',
    value: c => schlafTest(c)?.p ?? null,
    result: c => {
      const r = schlafTest(c);
      if (!r) return { kurz: 'Alle Befragten schlafen gleich lange. Ohne Streuung lässt sich kein t-Test rechnen.', fachlich: 'Der t-Test braucht mindestens zwei verschiedene Werte.' };
      const d = r.mean - MU0, side = d >= 0 ? 'mehr' : 'weniger';
      return {
        kurz: `Die 200 Befragten schlafen im Schnitt ${num(r.mean)} Stunden pro Nacht, ${num(Math.abs(d))} Stunden ${side} als sieben. Läge der wahre Mittelwert bei sieben Stunden, käme ein so großer Abstand ${outOf100(r.p)} Stichproben vor (p ${pShown(r.p)}). Bei α = 0,05 verwirfst du H₀ ${r.p > 0.05 ? 'nicht' : 'und nennst den Unterschied signifikant'}.`,
        fachlich: `t-Test für eine Stichprobe, H₀: μ = 7, H₁: μ ≠ 7. t(${r.df}) ≈ ${num(r.t)}, p ${pShown(r.p)}; 95-%-Konfidenzintervall von ${num(r.ci[0])} bis ${num(r.ci[1])} Stunden.`,
        zusatz: `${r.mehr} Befragte schlafen mehr als sieben Stunden, ${r.weniger} weniger.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an. Der Mittelwert soll annähernd normalverteilt sein; bei 200 Personen ist das meist erfüllt.',
    think: [
      {
        question: 'H₀ bleibt „im Mittel sieben Stunden“. Alle schlafen 0,1 Stunden länger. Was passiert mit p?', options: ['p sinkt', 'p bleibt gleich', 'p steigt'], correct: 0,
        explain: 'Der Mittelwert rückt weiter von sieben Stunden weg, die Streuung bleibt. Ein größerer Abstand wäre ohne Unterschied seltener, also sinkt p.',
        kurz: 'Weiter weg von H₀, kleineres p.',
        tryIt: { label: 'alle 0,1 Stunden länger', op: 'shift', column: 'x', value: 0.1 },
        expect: { change: 'down' },
      },
      {
        question: 'Alle schlafen 0,1 Stunden kürzer. Was passiert mit p?', options: ['p sinkt', 'p bleibt gleich', 'p steigt'], correct: 2,
        explain: 'Der Mittelwert rückt näher an sieben Stunden heran. Ein kleinerer Abstand wäre auch ohne Unterschied gewöhnlich, also steigt p.',
        kurz: 'Näher an H₀, größeres p.',
        tryIt: { label: 'alle 0,1 Stunden kürzer', op: 'shift', column: 'x', value: -0.1 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 2,
    tokens: {
      '"two.sided"': { sym: '"two.sided"', term: 'Zweiseitige Alternative', kurz: 'H₁ umfasst beide Richtungen: mehr oder weniger als mu. Das ist auch die Voreinstellung.', fehler: 'Schreib two.sided mit Punkt. Mit "two-sided" meldet R: \'arg\' sollte eines von \'“two.sided”, “less”, “greater”\' sein.' },
    },
    outputMap: [
      { match: 't', atlas: 'Prüfgröße t', step: 3, explain: 'Der Abstand des Mittelwerts zu mu = 7, gemessen in Standardfehlern. In Klammern stehen die Freiheitsgrade.' },
      { match: 'p', atlas: 'p-Wert', step: 3, explain: 'Liegt über 0,05: Bei α = 0,05 verwirfst du H₀: μ = 7 nicht.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten mit gültiger Schlafdauer.' },
    ],
    check: {
      question: 'An welcher Zahl entscheidest du, ob du H₀: μ = 7 verwirfst? Tippe sie an.', correct: 'p',
      wrong: { t: 'Fast! t ist der Abstand in Standardfehlern. Entscheiden kannst du mit p oder mit einem kritischen Wert.', N: 'Fast! N ist die Zahl der Befragten. Die Entscheidung triffst du mit p.' },
    },
  },
  next: {
    next: { id: 'test_statistic', why: 'Misst, wie weit die Daten von H₀ entfernt sind, in Standardfehlern.' },
    before: [
      { id: 'population_parameter', why: 'Hypothesen handeln von Kennwerten der Grundgesamtheit, etwa μ.' },
      { id: 'mean', why: 'Der Mittelwert x̄ der Stichprobe schätzt μ.' },
    ],
    after: [
      { id: 'test_sides', why: 'H₁ legt fest, ob beide Richtungen zählen oder nur eine.' },
      { id: 'p_value', why: 'Rechnet so, als ob H₀ stimmt.' },
      { id: 'type_errors', why: 'Wer über H₀ entscheidet, kann sich auf zwei Arten irren.' },
    ],
    more: [
      { id: 't_test', why: 'Prüft Hypothesen über Mittelwerte.' },
      { id: 'confidence', why: 'Zeigt alle Vergleichswerte, die der Test nicht verwerfen würde.' },
    ],
  },
};
