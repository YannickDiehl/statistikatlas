// Begriffskarte „Mehrere Vergleiche“. Beispiel: zehn Paarvergleiche der finanziellen Lage zwischen fünf
// Schulabschlüssen (Dunn-Test wie mariposa::dunn_test, ohne und mit Holm). Zahlen in R, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';
import { dunn, familyError, small } from './rechnen';

/** Dunn-Vergleiche der finanziellen Lage nach Schulabschluss (R): zehn Paare, zwei unkorrigiert unter 0,05, keines nach Holm. */
export const DUNN = { m: 10, raw: 2, holm: 0, minP: 0.0060199, minHolm: 0.0601991, kwP: 0.0207155 } as const;
/** Zahl der Tests am Regler, ganzzahlig zwischen 1 und 30. */
export const mOf = (v: number) => Math.max(1, Math.min(30, Math.round(v)));

export const mehrfach: ConceptCard = {
  concept: 'multiplicity',
  picture: 'b09-mehrfach',
  wofuer: 'Unterscheiden sich die fünf Schulabschlüsse darin, wie gut die Befragten mit ihrem Einkommen auskommen? Wer jede Gruppe mit jeder vergleicht, rechnet zehn Tests. Mit jedem Test steigt die Chance auf einen Zufallstreffer.',
  kurz: 'Wer viele Tests rechnet, findet auch ohne echte Unterschiede leicht einen Zufallstreffer. Korrekturen wie Bonferroni oder Holm halten die Fehlerquote für alle Tests zusammen klein.',
  stellDirVor: {
    text: `Fünf Schulabschlüsse ergeben zehn Paarvergleiche der finanziellen Lage. Ohne Korrektur liegen zwei davon bei p ≈ ${small(DUNN.minP)}, also unter 0,05. Mit der Holm-Korrektur, die der Atlas bei dunn_test() wählt, werden daraus p ≈ ${num(DUNN.minHolm)}: Bei α = 0,05 ist kein Vergleich mehr signifikant.`,
    figures: [
      { label: 'Paarvergleiche', value: String(DUNN.m) },
      { label: 'ohne Korrektur unter 0,05', value: String(DUNN.raw) },
      { label: 'nach Holm unter 0,05', value: String(DUNN.holm) },
      { label: 'kleinster p-Wert nach Holm', value: num(DUNN.minHolm) },
    ],
  },
  heisst: {
    sym: 'm', say: 'm',
    fach: 'Prüft man eine Familie von m Hypothesen, steigt die Wahrscheinlichkeit, mindestens eine wahre Nullhypothese zu verwerfen (familienweise Fehlerrate). Bonferroni vergleicht jedes p mit α / m, Holm geht schrittweise vor und ist oft weniger streng.',
  },
  bausteine: [
    {
      title: 'Die Tests zählen',
      was: 'Bei fünf Gruppen gibt es zehn Paare. Jedes Paar ist ein eigener Test mit eigener Chance auf einen Fehlalarm.',
      rechnung: 'm = 5 · 4 / 2 = 10 Vergleiche',
      warum: 'Die Familie der Tests legst du vorher fest. Nur dann weißt du, wofür die Fehlerquote gelten soll.',
      acht: 'Auch Tests, die du rechnest und nicht berichtest, gehören zur Familie.',
      concept: 'dunn_test',
    },
    {
      title: 'Die Fehlalarme zusammenrechnen',
      was: `Gäbe es nirgends einen Unterschied, hätte jeder Test 5 % Risiko für einen Fehlalarm. Über zehn unabhängige Tests steigt die Chance auf mindestens einen auf etwa ${Math.round(familyError(10) * 100)} %.`,
      rechnung: `1 − 0,95¹⁰ ≈ ${num(familyError(10))}`,
      warum: 'Jeder weitere Test ist eine weitere Gelegenheit für den Zufall. Die Gelegenheiten häufen sich.',
      acht: 'Die 40 % gelten für unabhängige Tests. Paarvergleiche hängen zusammen, das Prinzip bleibt aber gleich.',
      concept: 'type_errors',
    },
    {
      title: 'Die Schwelle anpassen',
      was: 'Bonferroni verlangt für jeden Test p < α / m, hier 0,05 / 10 = 0,005. Holm prüft der Reihe nach und ist etwas großzügiger.',
      rechnung: `Holm: ${small(DUNN.minP)} · 10 ≈ ${num(DUNN.minHolm)} > 0,05`,
      warum: 'So bleibt die Chance auf mindestens einen Fehlalarm in der ganzen Familie bei höchstens 5 %.',
      acht: 'Strengere Schwellen machen echte Unterschiede schwerer erkennbar. Die Teststärke jedes einzelnen Vergleichs sinkt.',
      concept: 'alpha_level',
    },
  ],
  ausprobieren: [
    {
      question: 'Du rechnest 20 Tests, und nirgends gibt es einen echten Unterschied. Wie viele Fehlalarme erwartest du bei α = 0,05 im Mittel?',
      options: ['etwa 1', 'keinen', 'etwa 5'], correct: 0, step: 2,
      explain: `5 % von 20 sind 1. Im Mittel ist also ein Test bei α = 0,05 zufällig signifikant, und die Chance auf mindestens einen liegt bei etwa ${Math.round(familyError(20) * 100)} %.`,
      kurz: 'Viele Tests, gute Chance auf einen Zufallstreffer.',
    },
    {
      question: 'Nach Bonferroni: Unter welcher Schwelle muss p bei 10 Vergleichen liegen?',
      options: ['0,005', '0,05', '0,5'], correct: 0, step: 3,
      explain: `α / m = 0,05 / 10 = 0,005. Mit p ≈ ${small(DUNN.minP)} liegen die beiden auffälligsten Vergleiche knapp darüber.`,
      kurz: 'Bonferroni teilt α durch die Zahl der Tests.',
    },
    {
      question: 'Nach der Korrektur ist bei α = 0,05 kein Vergleich signifikant. Heißt das, die Abschlüsse unterscheiden sich nicht?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Nicht verworfen ist nicht bewiesen. Die Korrektur schützt vor Fehlalarmen und übersieht dafür leichter einen echten Unterschied.',
      kurz: 'Korrektur kostet Teststärke.',
    },
  ],
  regler: {
    label: 'Wie viele Tests rechnest du?',
    min: 1, max: 30, step: 1, initial: 10,
    format: v => { const m = mOf(v); return m === 1 ? '1 Test' : `${m} Tests`; },
    describe: v => {
      const m = mOf(v);
      if (m === 1) return 'Ein einzelner Test liefert ohne Unterschied in etwa 5 von 100 Studien einen Fehlalarm. Eine Korrektur braucht er nicht.';
      return `Gibt es nirgends einen Unterschied, liefern ${m} unabhängige Tests in etwa ${Math.round(familyError(m) * 100)} von 100 Studien mindestens einen Fehlalarm. Bonferroni verlangt dann für jeden Test p < ${small(0.05 / m)}.`;
    },
  },
  check: {
    question: 'Du vergleichst zehn Gruppenpaare ohne Korrektur, mit der Schwelle α = 0,05. Ein Paar hat p = 0,03. Was ist die vorsichtige Deutung?',
    options: [
      'Das Paar unterscheidet sich sicher.',
      'Bei zehn Tests kann so ein p leicht ein Zufallstreffer sein; nach Bonferroni ist es nicht signifikant.',
      'p = 0,03 ist immer signifikant, egal wie viele Tests.',
      'Man berichtet nur den Test mit dem kleinsten p.',
    ],
    correct: 1,
    right: 'Genau. Nach Bonferroni bräuchte jeder der zehn Vergleiche p < 0,005, und 0,03 liegt weit darüber.',
    diagnose: {
      0: 'Fast! Bei zehn Tests ist ein p von 0,03 auch ohne echten Unterschied nicht selten. Nach Bonferroni bräuchte es p < 0,005.',
      2: 'Fast! Die Schwelle 0,05 gilt für einen einzelnen Test. Für eine Familie von zehn Tests muss sie strenger werden.',
      3: 'Fast! Gerade das Auswählen des kleinsten p macht Zufallstreffer wahrscheinlich. Berichte alle Tests der Familie.',
    },
  },
  fuerDich: 'Wenn eine Studie viele Gruppen oder viele Fragen vergleicht und nur die „signifikanten“ berichtet, sei vorsichtig. Frag, wie viele Tests insgesamt gerechnet wurden und ob korrigiert wurde.',
  genau: {
    kurz: 'Bonferroni und Holm begrenzen die Wahrscheinlichkeit mindestens eines Fehlers erster Art in der Familie. Benjamini-Hochberg begrenzt stattdessen den erwarteten Anteil falscher Entdeckungen.',
    paragraphs: [
      'Holm sortiert die p-Werte aufsteigend und nimmt den kleinsten mit m mal, den nächsten mit m − 1 und so weiter; ein korrigierter Wert ist nie kleiner als der davor. Holm hält dieselbe Fehlerquote ein wie Bonferroni und verwirft nie weniger.',
      'dunn_test() und pairwise_wilcoxon() korrigieren in mariposa ohne Angabe nach Bonferroni; der Atlas wählt sichtbar Holm. Mit p_adjust = "BH" begrenzt du stattdessen den Anteil falscher Entdeckungen.',
      `Der Gesamttest nach Kruskal-Wallis ist hier signifikant (p ≈ ${small(DUNN.kwP)} bei α = 0,05), trotzdem bleibt nach Holm kein Paarvergleich unter 0,05. Das ist kein Widerspruch: Der Gesamttest fragt nur, ob irgendwo ein Unterschied steckt.`,
      'Die Formel 1 − 0,95 hoch m gilt für unabhängige Tests. Bei abhängigen Tests wie diesen Paarvergleichen ist die Chance meist kleiner. Bonferroni und Holm schützen in jedem Fall.',
    ],
  },
};

/** Reiter: die zehn Dunn-Vergleiche für die aktuellen Daten, ohne und mit Holm, In R der Katalogaufruf dunn_test(p_adjust = "holm"), Weiter. */
export const mehrfachTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'finanzlage', group: 'schulabschluss' },
    kurz: 'Dieselben zehn Paarvergleiche mit allen 200 Befragten: Wie viele sind bei α = 0,05 ohne und wie viele mit Holm-Korrektur signifikant?',
    value: c => dunn(c).raw,
    result: c => {
      const d = dunn(c), min = Math.min(...d.pairs.map(p => p.p)), minHolm = Math.min(...d.pairs.map(p => p.holm));
      return {
        kurz: `Von ${d.pairs.length} Paarvergleichen der finanziellen Lage liegen ohne Korrektur ${d.raw} unter 0,05, nach Holm ${d.holmCount}. Der kleinste p-Wert wächst durch die Korrektur von ${small(min)} auf ${small(minHolm)}.`,
        fachlich: `Dunn-Test nach Kruskal-Wallis mit Rangmitteln und Bindungskorrektur, ${d.pairs.length} Vergleiche; Holm-Korrektur, damit α = 0,05 für die ganze Familie gilt.`,
      };
    },
    voraussetzung: 'Der Dunn-Test nimmt unabhängige Befragte an. Die finanzielle Lage ist ordinal, deshalb vergleicht er Ränge statt Mittelwerte.',
    think: [
      {
        question: 'Die Antworten werden umgepolt: „sehr schwer“ wird „sehr leicht“. Was passiert mit der Zahl der Vergleiche unter 0,05 ohne Korrektur?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Umpolen dreht nur die Reihenfolge der Ränge um. Die Abstände zwischen den Gruppen bleiben gleich groß, also auch jeder p-Wert.',
        kurz: 'Umpolen ändert die Richtung, nicht die Abstände.',
        tryIt: { label: 'finanzielle Lage umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'dunn_test', variant: 0,
    tokens: {
      '"holm"': { sym: '"holm"', term: 'Holm-Korrektur', kurz: 'Korrigiert die p-Werte schrittweise: Der kleinste wird mit der Zahl der Vergleiche malgenommen, der nächste mit einer weniger.', fehler: 'Groß- und Kleinschreibung zählt. Mit p_adjust = "Holm" meldet mariposa: `p_adjust` must be one of "bonferroni", "holm", "BH", … ✖ Got "Holm".' },
    },
    outputMap: [
      { match: '10 comparisons', atlas: 'Familie aus 10 Vergleichen', step: 1, explain: 'Fünf Abschlüsse ergeben 5 · 4 / 2 = 10 Paare.' },
      { match: '0 significant', atlas: 'nach Holm signifikant', step: 3, explain: 'Nach der Korrektur liegt kein Vergleich unter 0,05. Ohne Korrektur wären es zwei.' },
      { match: 'Holm', atlas: 'Korrekturverfahren', step: 3, explain: 'R nennt das Verfahren in Klammern. Die korrigierten p-Werte zeigt summary().' },
    ],
    check: {
      question: 'Wie viele Vergleiche sind nach der Korrektur bei α = 0,05 signifikant? Tippe es an.', correct: '0 significant',
      wrong: { '10 comparisons': 'Fast! Das ist die Zahl aller Vergleiche. Wie viele davon signifikant sind, steht dahinter.', Holm: 'Fast! Das ist der Name der Korrektur. Die Zahl der signifikanten Vergleiche steht in der zweiten Zeile.' },
    },
  },
  next: {
    next: { id: 'dunn_test', why: 'Paarvergleiche nach Kruskal-Wallis, mit Korrektur wie im Beispiel.' },
    before: [
      { id: 'p_value', why: 'Korrigiert werden die einzelnen p-Werte.' },
      { id: 'type_errors', why: 'Mit jedem Test wächst die Chance auf einen Fehler erster Art.' },
    ],
    after: [
      { id: 'tukey_test', why: 'Paarvergleiche nach der Varianzanalyse mit eingebauter Korrektur.' },
      { id: 'pairwise_wilcoxon', why: 'Paarvergleiche für verbundene Messungen, ebenfalls korrigiert.' },
    ],
    more: [{ id: 'scheffe_test', why: 'Eine besonders vorsichtige Korrektur für viele Vergleiche.' }],
  },
};
