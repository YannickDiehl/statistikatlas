// Begriffskarte „Normalverteilung prüfen“: Schlafdauer und Haushaltseinkommen der 200 Befragten, wie der Leitaufruf
// normality_test(schlafdauer). Das Bild zeigt die Schlafdauer als Säulen mit der passenden Glockenkurve.
// Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import type { SurveyRow } from '../../../domain/survey';
import { num } from '../../format';
import { sampleColumn } from '../../sample';
import { normalityFor, often, pText } from './stats';

/** Säulen der Schlafdauer je halbe Stunde von 4,5 bis 10 Stunden, mit Mittelwert und Standardabweichung (für das Bild). */
export function sleepHistogram(rows: readonly SurveyRow[]) {
  const xs = sampleColumn(rows, 'schlafdauer'), n = xs.length, lo = 4.5, hi = 10, width = 0.5;
  const mean = xs.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(xs.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1));
  const bins = Array.from({ length: Math.round((hi - lo) / width) }, (_, k) => xs.filter(v => v >= lo + k * width - 1e-9 && v < lo + (k + 1) * width - 1e-9).length);
  return { n, lo, hi, width, mean, sd, bins };
}

export const normality: ConceptCard = {
  concept: 'normality_test',
  picture: 'b10-normal',
  wofuer: 'Viele Verfahren nehmen an, dass Werte annähernd normalverteilt sind, also glockenförmig um ihre Mitte liegen. Passt das zur Schlafdauer der 200 Befragten? Zum Einkommen ihrer Haushalte? Normalitätstests vergleichen die Daten mit der Form einer Normalverteilung.',
  kurz: 'Ein Normalitätstest prüft, wie weit die Form deiner Daten von einer Glockenkurve abweicht. Ein großes p heißt nur: Die Abweichung fällt nicht auf.',
  stellDirVor: {
    text: 'Im Lehrdatensatz haben die 200 Befragten in den letzten sieben Tagen im Mittel 7,08 Stunden pro Nacht geschlafen, mit s ≈ 0,82 Stunden. 140 von ihnen liegen höchstens eine Standardabweichung von der Mitte entfernt; bei einer Normalverteilung wären es etwa 137. R meldet für die Schlafdauer Shapiro–Wilk W = 0.994, p = 0.660. Beim Haushaltseinkommen ist p < 0.001: Wenige Haushalte haben sehr hohe Einkommen, die Verteilung ist rechtsschief.',
    figures: [
      { label: 'Schlafdauer, Shapiro–Wilk', value: 'p = 0.660' },
      { label: 'Einkommen, Shapiro–Wilk', value: 'p < 0.001' },
      { label: 'Schlafdauer höchstens 1 s von der Mitte', value: '140 von 200' },
    ],
  },
  heisst: {
    sym: 'W', say: 'W',
    fach: 'Normalitätstests prüfen die Nullhypothese, dass die Daten aus einer Normalverteilung stammen. Shapiro–Wilk misst mit W, wie gut die sortierten Werte zu den Erwartungen einer Normalverteilung passen; der Kolmogorov–Smirnov-Test mit Lilliefors-Korrektur misst den größten Abstand D der Verteilungsfunktionen.',
  },
  bausteine: [
    {
      title: 'Die Daten der Größe nach ordnen',
      was: 'Beide Tests beginnen mit den sortierten Werten, vom kürzesten bis zum längsten Schlaf.',
      warum: 'Sortiert lässt sich jeder Wert mit dem Wert vergleichen, den eine Normalverteilung an dieser Stelle erwarten ließe.',
      acht: 'Sortiert werden die Werte selbst, nicht ihre Ränge. Es geht um die Form der Verteilung.',
      concept: 'sorting',
    },
    {
      title: 'Den Abstand zur Glockenkurve messen',
      was: 'Shapiro–Wilk fragt, wie gut die sortierten Werte zu den Erwartungen einer Normalverteilung passen. W nahe 1 heißt: sehr gut.',
      rechnung: 'Schlafdauer: W ≈ 0,99 (R: 0.994), KS-Abstand D ≈ 0,05. Einkommen: W ≈ 0,96, D ≈ 0,11.',
      warum: 'So wird die ganze Form in eine Zahl gefasst, die sich prüfen lässt.',
      acht: 'W liegt fast immer nahe 1, auch bei schiefen Daten wie dem Einkommen. Kleine Unterschiede in W können viel bedeuten.',
      concept: 'normal_distribution',
    },
    {
      title: 'Den p-Wert vorsichtig lesen',
      was: 'p sagt, wie überraschend so ein Abstand wäre, wenn die Daten aus einer Normalverteilung stammten. Für die Schlafdauer meldet Shapiro–Wilk p ≈ 0,66, der KS-Test p ≈ 0,24; beim Einkommen beide p < 0,001.',
      warum: 'Ein kleines p heißt: Die Form passt nicht zur Glockenkurve. Ein großes p heißt nur, dass keine Abweichung auffällt.',
      acht: 'Mit sehr vielen Befragten fallen schon harmlose Abweichungen auf, mit wenigen übersieht der Test auch grobe. Schau dir deshalb immer auch ein Bild der Verteilung an.',
      concept: 'p_value',
    },
  ],
  ausprobieren: [
    {
      question: 'Shapiro–Wilk meldet für die Schlafdauer p ≈ 0,66. Ist damit bewiesen, dass die Schlafdauer normalverteilt ist?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Ein großes p heißt nur: Die Daten widersprechen der Normalverteilung nicht auffällig. Viele andere Formen würden ebenso passen.',
      kurz: 'Nicht auffällig heißt nicht bewiesen.',
    },
    {
      question: 'Bei einem t-Test mit zwei Gruppen: Welche Verteilung zählt?',
      options: ['die Werte in jeder Gruppe, nicht alle zusammen', 'alle Werte zusammen', 'nur die größere Gruppe'], correct: 0, step: 3,
      explain: 'Bei Gruppenvergleichen geht es um die Verteilung in den Gruppen, genauer um die Modellfehler. Zwei verschobene Glocken zusammen sehen nicht wie eine Glocke aus.',
      kurz: 'Geprüft wird, was das Modell annimmt.',
    },
    {
      question: 'Mit 20.000 statt 200 Befragten bleibt dieselbe leichte Abweichung von der Glocke. Was passiert mit p?',
      options: ['wird kleiner', 'bleibt gleich', 'wird größer'], correct: 0, step: 3,
      explain: 'Mehr Befragte machen auch kleine Abweichungen auffällig. Bei großen Stichproben sind Normalitätstests deshalb fast immer auffällig, auch wenn es kaum stört.',
      kurz: 'Große Stichproben finden jede kleine Abweichung.',
    },
  ],
  check: {
    question: 'Shapiro–Wilk meldet für eine Variable p = 0,30. Was folgt daraus?',
    options: [
      'Die Variable ist normalverteilt.',
      'Gäbe es eine Normalverteilung, wäre so ein Abstand nicht überraschend.',
      'Mit 30 % Wahrscheinlichkeit ist die Variable normalverteilt.',
      'Die Variable ist schief verteilt.',
    ],
    correct: 1,
    right: 'Genau. Stammten die Daten aus einer Normalverteilung, käme so ein Abstand in etwa 30 von 100 Stichproben vor.',
    diagnose: {
      0: 'Fast! Ein großes p beweist keine Normalverteilung. Es heißt nur, dass keine Abweichung auffällt.',
      2: 'Fast! p ist keine Wahrscheinlichkeit für eine Hypothese. Es rechnet unter der Annahme, dass die Normalverteilung stimmt.',
      3: 'Noch nicht ganz. Ein großes p spricht gerade nicht für eine auffällige Abweichung.',
    },
  },
  fuerDich: 'Wenn du eine Annahme prüfen willst, schau dir zuerst ein Histogramm oder ein Q-Q-Bild an. Der Test ergänzt das Bild, er ersetzt es nicht.',
  genau: {
    kurz: 'mariposa berichtet Shapiro–Wilk für 3 bis 5.000 Fälle und den KS-Test mit Lilliefors-Korrektur ab 4 Fällen, ohne Gewichte. Bei Gruppenmodellen zählen die Gruppenverteilungen beziehungsweise die Modellfehler.',
    paragraphs: [
      'Shapiro–Wilk: W = (Σ aᵢ x₍ᵢ₎)² / Σ(xᵢ − x̄)², mit den sortierten Werten x₍ᵢ₎ und Gewichten aᵢ aus der Normalverteilung. Lilliefors: D ist der größte Abstand zwischen der Verteilungsfunktion der Daten und der einer Normalverteilung mit geschätztem Mittelwert und geschätzter Standardabweichung.',
      'Im Lehrdatensatz meldet R für die Schlafdauer KS = 0.051, p = 0.238 und W = 0.994, p = 0.660; für das Haushaltseinkommen KS = 0.109 und W = 0.957, beide mit p < 0.001.',
      'Viele Verfahren brauchen die Normalverteilung nur annähernd und nur für die Modellfehler oder die Mittelwerte. Bei großen Gruppen sorgt der zentrale Grenzwertsatz dafür, dass Mittelwerte annähernd normalverteilt sind; ab etwa 30 Personen je Gruppe gilt das als Faustregel.',
      'Die Tests sind für stetige Werte gedacht. Bei wenigen ganzzahligen Stufen, etwa Zustimmungsfragen, fallen sie fast immer auf, weil viele gleiche Werte vorkommen.',
    ],
  },
};

export const normalityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Passt die Schlafdauer zur Form einer Normalverteilung?',
    value: c => normalityFor(c).test?.D ?? null,
    result: c => {
      const n = normalityFor(c);
      if (!n.test) return { kurz: 'Die Schlafdauer streut nicht. Dann gibt es keine Form, die man mit einer Glockenkurve vergleichen könnte.', fachlich: 'Die Standardabweichung ist 0; der Test ist nicht definiert.' };
      return {
        kurz: `Die Schlafdauer weicht um D ≈ ${num(n.test.D)} von der passenden Normalverteilung ab. Stammten die Daten aus einer Normalverteilung, wäre ein mindestens so großer Abstand ${often(n.test.p)} Stichproben zu erwarten (${pText(n.test.p)}).`,
        fachlich: `Kolmogorov–Smirnov-Test mit Lilliefors-Korrektur: D ≈ ${num(n.test.D, 3)}, ${pText(n.test.p)}; Mittelwert ${num(n.mean)} h, s ≈ ${num(n.sd)} h. Shapiro–Wilk zeigt der Reiter „In R“.`,
        zusatz: `${n.within1} von ${n.n} Befragten liegen höchstens eine Standardabweichung von der Mitte entfernt, ${n.within2} höchstens zwei; bei einer Normalverteilung wären es etwa 137 und 191.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig, die Werte stetig. Ein großes p beweist keine Normalverteilung.',
    think: [
      {
        question: 'Alle schlafen eine Stunde länger. Was passiert mit dem Abstand D zur Normalverteilung?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Die ganze Verteilung rückt um eine Stunde, ihre Form bleibt. Der Test vergleicht nur die Form mit der passenden Glockenkurve.',
        kurz: 'Verschieben ändert die Form nicht.',
        tryIt: { label: 'alle eine Stunde länger', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Schlafdauer wird gespiegelt: lange Nächte werden kurz und kurze lang. Was passiert mit D?', options: ['bleibt gleich', 'wird größer', 'wechselt das Vorzeichen'], correct: 0,
        explain: 'Eine Glockenkurve sieht gespiegelt genauso aus. Der größte Abstand zu ihr bleibt gleich groß, er liegt nur auf der anderen Seite.',
        kurz: 'Die Normalverteilung ist symmetrisch.',
        tryIt: { label: 'Schlafdauer spiegeln', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'normality_test', variant: 0,
    outputMap: [
      { match: 'KS', atlas: 'Abstand D', step: 2, explain: 'Der größte Abstand zwischen der Verteilung der Schlafdauer und der passenden Normalverteilung.' },
      { match: 'p', atlas: 'p des KS-Tests', step: 3, explain: 'Mit Lilliefors-Korrektur: Stammten die Daten aus einer Normalverteilung, wäre ein mindestens so großer Abstand in etwa 24 von 100 Stichproben zu erwarten.' },
      { match: 'W', atlas: 'W', step: 2, explain: 'Shapiro–Wilk: W nahe 1 heißt, die sortierten Werte passen gut zur Normalverteilung.' },
      { match: '0.660', atlas: 'p von Shapiro–Wilk', step: 3, explain: 'Stammten die Daten aus einer Normalverteilung, wäre ein mindestens so kleines W in etwa 66 von 100 Stichproben zu erwarten.' },
      { match: 'n', atlas: 'n', explain: 'Gerechnet wurde mit allen 200 gültigen Werten.' },
    ],
    check: {
      question: 'Welche Zahl ist der p-Wert von Shapiro–Wilk? Tippe sie an.', correct: '0.660',
      wrong: { W: 'Fast! Das ist W selbst. Der p-Wert steht dahinter.', p: 'Fast! Das ist der p-Wert des KS-Tests, der erste der beiden.', KS: 'Fast! Das ist der KS-Abstand D, kein p-Wert.' },
    },
  },
  next: {
    next: { id: 'shape', why: 'Beschreibt, wie eine Verteilung von der Glockenform abweicht: schief oder spitz.' },
    before: [
      { id: 'normal_distribution', why: 'Die Glockenkurve, mit der die Daten verglichen werden.' },
      { id: 'sorting', why: 'Beide Tests rechnen mit den sortierten Werten.' },
    ],
    after: [{ id: 'p_value', why: 'Wie überraschend der Abstand wäre, wenn die Daten normalverteilt wären.' }],
    more: [{ id: 'central_limit', why: 'Warum Mittelwerte großer Gruppen auch ohne normalverteilte Werte annähernd normal sind.' }],
  },
};
