// Begriffskarte „Stichprobe & Unabhängigkeit“ (sampling). Beispiel: ALLBUS 2023 als Stichprobe mit absichtlich mehr
// Befragten im Osten (Aggregate, ungewichtet und mit wghtpew), Regler: Kopien täuschen Genauigkeit vor.
// Reiter: zwei Hälften der 200 Befragten als zwei Stichproben. R-Befehle und Referenzwerte: b08-schaetzen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num, pct, unit } from '../../format';
import { ALLBUS, INTERESSE, VERTRAUEN, columnX, mean, shown, small } from './daten';

/** Standardfehler, den R meldet, wenn jede Person `k`-mal in den Daten steht (sd mit n − 1 über k · n Zeilen). */
export function kopienSE(k: number): number {
  const n = INTERESSE.n, s = INTERESSE.sd * Math.sqrt((n - 1) * k / (k * n - 1));
  return s / Math.sqrt(k * n);
}

/** Die beiden Hälften des Lehrdatensatzes: P001 bis P100 und P101 bis P200 (bei anderer Zahl: erste und zweite Hälfte). */
export function haelften(c: SampleCtx) {
  const x = columnX(c, 'lernzeit'), half = Math.floor(x.length / 2);
  const a = mean(x.slice(0, half)), b = mean(x.slice(half)), alle = mean(x);
  // Abstand aus den angezeigten Mittelwerten, damit die Rechnung im Text mit den sichtbaren Zahlen aufgeht.
  return { a, b, alle, diff: a - b, shownGap: Math.abs(shown(a) - shown(b)), first: c.rows[half - 1]?.id ?? '', second: c.rows[half]?.id ?? '', half };
}

const ostAnteil = ALLBUS.ost / ALLBUS.befragte;

export const sampling: ConceptCard = {
  concept: 'sampling',
  wofuer: `Der ALLBUS 2023 hat ${count(ALLBUS.befragte)} Menschen befragt. Er will damit aber etwas über alle Erwachsenen in Deutschland sagen. Wie kann ein kleiner Teil für so viele Menschen sprechen?`,
  kurz: 'Eine Stichprobe ist der Teil der Menschen, die du tatsächlich befragst. Sie soll über alle Auskunft geben, über die du etwas wissen willst.',
  stellDirVor: {
    text: `Im ALLBUS 2023 haben ${count(ALLBUS.befragte)} Menschen geantwortet, ${count(ALLBUS.ost)} davon in Ostdeutschland. Das sind ${pct(ostAnteil)} der Befragten. Der Osten ist mit Absicht stärker vertreten, damit genug Ostdeutsche für eigene Vergleiche dabei sind. Für Aussagen über ganz Deutschland wird der ALLBUS gewichtet; dann zählt der Osten nur noch mit ${pct(ALLBUS.ostGewichtet)}.`,
    figures: [
      { label: 'Befragte im ALLBUS 2023', value: count(ALLBUS.befragte) },
      { label: 'davon im Osten, ungewichtet', value: pct(ostAnteil) },
      { label: 'Osten nach der Gewichtung', value: pct(ALLBUS.ostGewichtet) },
    ],
  },
  heisst: {
    sym: 'X₁, …, Xₙ', say: 'X eins bis X n',
    fach: 'Eine Stichprobe sind die n Beobachtungen X₁ bis Xₙ, die aus einer Grundgesamtheit erhoben werden. Unabhängig heißt: Der Zufallsfehler einer Beobachtung sagt nichts über den Zufallsfehler einer anderen.',
  },
  bausteine: [
    {
      title: 'Einen Teil befragen',
      was: 'Statt alle Erwachsenen zu fragen, wählt der ALLBUS einige tausend aus. Ihre Antworten sind die Daten, mit denen du rechnest.',
      warum: 'Alle zu befragen wäre viel zu teuer und zu langsam. Ein gut ausgewählter Teil reicht für recht genaue Aussagen über alle.',
      acht: 'Viele Antworten allein machen eine Stichprobe nicht gut. Eine riesige Online-Umfrage, bei der nur Interessierte mitmachen, kann weiter danebenliegen als eine kleine Zufallsstichprobe.',
      concept: 'population_parameter',
    },
    {
      title: 'Unabhängig auswählen',
      was: 'Jede Person kommt für sich in die Stichprobe. Was bei einer Person zufällig herauskommt, verrät nichts über den Zufall bei einer anderen.',
      warum: 'Nur dann bringt jede weitere Person neue Information. Darauf baut die Formel für den Standardfehler: s geteilt durch √n.',
      acht: 'Wer ganze Familien oder Schulklassen befragt, hat keine unabhängigen Personen mehr. Die Daten sind dann weniger wert, als die Zahl n verspricht.',
      concept: 'stochastic_independence',
    },
    {
      title: 'Das Design mitdenken',
      was: 'Der ALLBUS wählt erst Gemeinden aus und darin Personen. Ostdeutschland ist mit Absicht stärker vertreten.',
      warum: 'So spart man Wege und hat genug Befragte für Vergleiche zwischen Ost und West. Die Auswertung muss diesen Plan berücksichtigen.',
      acht: `Ungewichtet zählt der Osten zu stark. Beim Vertrauen in den Bundestag ergibt der ALLBUS 2023 ungewichtet im Mittel ${num(VERTRAUEN.mean)}, gewichtet ${num(VERTRAUEN.gewichtet)}.`,
      concept: 'weights',
    },
  ],
  ausprobieren: [
    {
      question: 'Durch einen Fehler steht jede befragte Person zweimal in den Daten. Wird der Mittelwert dadurch genauer?',
      options: ['ja, es sind doppelt so viele Zeilen', 'nein, es gibt keine neue Information'], correct: 1, step: 2,
      explain: 'Die Kopien sind nicht unabhängig, sie wiederholen nur dieselben Antworten. R meldet trotzdem einen kleineren Standardfehler. Probier es mit dem Regler aus.',
      kurz: 'Kopien sind keine neuen Menschen.',
    },
    {
      question: 'Eine Studie befragt 100 Familien mit je vier Personen. Ist das so viel wert wie 400 zufällig ausgewählte Einzelpersonen?',
      options: ['ja, 400 sind 400', 'nein, eher weniger'], correct: 1, step: 2,
      explain: 'Menschen in einer Familie ähneln sich, etwa im Einkommen oder im Wohnort. Die vier Antworten einer Familie bringen weniger neue Information als vier Fremde.',
      kurz: 'Ähnliche Menschen zählen nicht voll.',
    },
    {
      question: 'Eine Online-Umfrage hat 50.000 Antworten, eine Zufallsstichprobe 2.000. Welche sagt verlässlicher etwas über alle Erwachsenen?',
      options: ['die Online-Umfrage, weil sie größer ist', 'die Zufallsstichprobe, wenn sie gut gezogen ist'], correct: 1, step: 1,
      explain: 'Bei der Online-Umfrage entscheiden die Menschen selbst, ob sie mitmachen. Wer mitmacht, kann sich systematisch von den anderen unterscheiden. Dagegen helfen auch 50.000 Antworten nicht.',
      kurz: 'Wie ausgewählt wird, zählt mehr als wie viele.',
    },
  ],
  regler: {
    label: 'Wie oft steht jede befragte Person in den Daten?',
    min: 1, max: 4, step: 1, initial: 1,
    format: v => { const k = Math.round(v); return k === 1 ? 'einmal' : `${k}-mal`; },
    describe: v => {
      const k = Math.max(1, Math.round(v)), se1 = kopienSE(1);
      if (k === 1) return `Jede der ${count(INTERESSE.n)} Personen steht einmal da. Für das politische Interesse meldet R dann den Standardfehler ${small(se1)}. So genau ist der Mittelwert wirklich.`;
      return `Jetzt stehen ${count(k * INTERESSE.n)} Zeilen in den Daten. R meldet den Standardfehler ${small(kopienSE(k))} statt ${small(se1)}. Neue Menschen sind aber nicht dazugekommen: Die Genauigkeit bleibt die von ${count(INTERESSE.n)} Befragten.`;
    },
  },
  check: {
    question: 'Was heißt „unabhängig“ bei einer Stichprobe?',
    options: [
      'Die Befragten kennen sich nicht.',
      'Was bei einer Person zufällig herauskommt, sagt nichts über den Zufall bei einer anderen.',
      'Alle Befragten haben verschiedene Meinungen.',
      'Die Stichprobe hat mehr als 30 Personen.',
    ],
    correct: 1,
    right: 'Genau. Unabhängigkeit ist eine Aussage über den Zufall in den Daten, nicht über Freundschaften oder Meinungen.',
    diagnose: {
      0: 'Fast! Fremde sind oft unabhängig, aber darum geht es nicht. Entscheidend ist, ob der Zufall bei einer Person etwas über den Zufall bei einer anderen verrät.',
      2: 'Noch nicht ganz. Unabhängige Befragte dürfen gleicher Meinung sein. Es geht um den Zufall, mit dem ihre Antworten in die Daten kommen.',
      3: 'Fast! Die Zahl 30 stammt aus einer Faustregel für Mittelwerte. Mit Unabhängigkeit hat sie nichts zu tun.',
    },
  },
  fuerDich: 'Wenn du eine Umfrage liest, frag zuerst: Wer wurde befragt, und wie kamen diese Menschen in die Stichprobe? Erst danach lohnt der Blick auf die Prozentzahlen.',
  genau: {
    kurz: 'Unabhängigkeit ist eine Annahme über das Erhebungsdesign. Ob sie stimmt, lässt sich nicht mit einem einzelnen Test aus der Datentabelle beweisen.',
    paragraphs: [
      'Formal sind die Beobachtungen X₁ bis Xₙ Zufallsvariablen. Unabhängig heißt, dass ihre gemeinsame Verteilung das Produkt der einzelnen Verteilungen ist. Viele Verfahren nehmen zusätzlich an, dass alle Beobachtungen dieselbe Verteilung haben (unabhängig und identisch verteilt).',
      'Klumpen wie Gemeinden, Schichten wie Ost und West und ungleiche Auswahlwahrscheinlichkeiten verlangen passende Designverfahren. Ein weights-Argument allein berücksichtigt Klumpen und Schichten nicht; der Standardfehler fällt dann meist etwas zu klein aus.',
      `Im Regler steht jede Person mehrfach in den Daten. R kann das nicht erkennen und teilt durch die Wurzel aus der Zahl der Zeilen. Bei zwei Kopien kommt so ${small(kopienSE(2))} statt ${small(kopienSE(1))} heraus.`,
      'Die 200 Befragten des Lehrdatensatzes sind synthetisch. Sie sind ein Lehrbeispiel und keine Zufallsstichprobe einer echten Bevölkerung.',
    ],
  },
};

export const samplingTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Idee mit den 200 Befragten: Teil sie in zwei Hälften. Jede Hälfte ist eine Stichprobe aus denselben 200 Menschen.',
    value: c => haelften(c).diff,
    result: c => {
      const h = haelften(c), gap = h.shownGap;
      return {
        kurz: `Die ersten ${h.half} Befragten haben in den letzten sieben Tagen im Schnitt ${unit(h.a, 'Stunde', 'Stunden')} gelernt, die anderen ${h.half} ${unit(h.b, 'Stunde', 'Stunden')}. Zwei Stichproben, zwei Ergebnisse: Sie liegen ${unit(gap, 'Stunde', 'Stunden')} auseinander.`,
        fachlich: `Mittelwerte zweier Teilstichproben mit je ${h.half} Befragten: ${num(h.a)} h (bis ${h.first}) und ${num(h.b)} h (ab ${h.second}), Abstand ${num(gap)} h. Beide schätzen den Mittelwert aller ${2 * h.half}, ${num(h.alle)} h.`,
        zusatz: 'Niemand hat sich verändert. Der Unterschied entsteht nur dadurch, wer in welcher Hälfte steht.',
      };
    },
    voraussetzung: 'Die Nummern P001 bis P200 sagen nichts über die Lernzeit. Dann ist jede Hälfte wie eine zufällige Auswahl aus den 200.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem Abstand der beiden Hälften?',
        options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 0,
        explain: 'Beide Mittelwerte verdoppeln sich, also auch ihr Abstand. Die Schwankung zwischen Stichproben wächst mit der Streuung der Daten.',
        kurz: 'Mehr Streuung, größere Schwankung.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Abstand der beiden Hälften?',
        options: ['bleibt gleich', 'steigt um 1 Stunde', 'verdoppelt sich'], correct: 0,
        explain: 'Beide Hälften rücken um eine Stunde. Wer in welcher Hälfte steht, ändert sich nicht, also bleibt auch der Abstand.',
        kurz: 'Verschieben ändert die Schwankung nicht.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  next: {
    next: { id: 'random_sampling', why: 'Wie ein Losverfahren die Stichprobe zieht, damit sich der Zufall berechnen lässt.' },
    before: [
      { id: 'stochastic_independence', why: 'Was Unabhängigkeit in der Wahrscheinlichkeitsrechnung bedeutet.' },
    ],
    after: [
      { id: 'population_parameter', why: 'Worüber die Stichprobe Auskunft geben soll: die Grundgesamtheit und ihre Kennzahlen.' },
      { id: 'se', why: 'Die Formel s / √n setzt unabhängige Befragte voraus.' },
    ],
    more: [
      { id: 'sampling_bias', why: 'Wenn eine Auswahl systematisch danebenliegt.' },
      { id: 'weights', why: 'Gleichen ungleiche Auswahlchancen aus, etwa den stärker befragten Osten im ALLBUS.' },
    ],
  },
};
