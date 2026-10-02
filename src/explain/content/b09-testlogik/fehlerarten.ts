// Begriffskarte „Fehler erster & zweiter Art“. Beispiel: Lernzeit nach Weiterbildung (p ≈ 0,88, H₀ nicht verworfen);
// angenommen wird ein wahrer Unterschied von einer Stunde, grob gerechnet mit der Normalverteilung und dem
// Standardfehler der Daten. Zahlen in R nachgerechnet, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num, pct } from '../../format';
import { LERNZEIT_NACH_WEITERBILDUNG as L } from '../muster/p-wert';
import { DELTA_H, gruppenTest, powerZ } from './rechnen';

/** Wahrscheinlichkeit, eine Stunde Unterschied zu übersehen, beim Standardfehler der Lernzeit nach Weiterbildung. */
export const betaFor = (alpha: number, se: number = L.se) => 1 - powerZ(DELTA_H / se, alpha);
/** Prozent ohne Nachkommastelle („43 %“) bzw. mit einer bei kleinen Werten („0,1 %“). */
export const percent = (v: number) => pct(v, v < 0.1 ? 1 : 0);

export const fehlerarten: ConceptCard = {
  concept: 'type_errors',
  picture: 'b09-fehlerarten',
  wofuer: 'Der t-Test findet im Lehrdatensatz keinen Unterschied in der Lernzeit zwischen Befragten mit und ohne Weiterbildung. Kann diese Entscheidung falsch sein? Ja, und zwar auf zwei Arten.',
  kurz: 'Ein Fehler erster Art ist ein Fehlalarm: Du meldest einen Unterschied, den es nicht gibt. Ein Fehler zweiter Art ist ein Übersehen: Es gibt einen Unterschied, aber der Test findet ihn nicht.',
  stellDirVor: {
    text: `Befragte mit und ohne Weiterbildung lernen fast gleich lange, R meldet p = 0.876. Bei α = 0,05 verwirfst du H₀ nicht. Angenommen, in der Grundgesamtheit lernen die mit Weiterbildung in Wahrheit eine Stunde mehr. Dann hätte der Test diesen Unterschied übersehen: ein Fehler zweiter Art. Bei ${L.nMit} und ${L.nOhne} Befragten passiert das grob gerechnet in ${percent(betaFor(0.05))} der Studien.`,
    figures: [
      { label: 'p-Wert', value: num(L.p) },
      { label: 'Entscheidung bei α = 0,05', value: 'H₀ nicht verwerfen' },
      { label: 'Fehlalarme ohne Unterschied (α)', value: '5 %' },
      { label: 'Übersehen bei 1 h Unterschied (β)', value: `≈ ${percent(betaFor(0.05))}` },
    ],
  },
  heisst: {
    sym: 'α, β', say: 'alpha, beta',
    fach: 'Fehler erster Art: H₀ ist wahr und wird verworfen; seine Wahrscheinlichkeit begrenzt α. Fehler zweiter Art: H₀ ist falsch und wird nicht verworfen; seine Wahrscheinlichkeit β hängt von der tatsächlichen Abweichung ab.',
  },
  bausteine: [
    {
      title: 'Den Fehlalarm kennen',
      was: 'Gibt es keinen Unterschied und der Test meldet trotzdem einen, ist das ein Fehler erster Art. Bei α = 0,05 passiert das in etwa 5 von 100 Studien.',
      rechnung: 'Wahrscheinlichkeit eines Fehlers erster Art: höchstens α = 0,05',
      warum: 'Der Zufall liefert manchmal auffällige Ergebnisse, auch wenn alles korrekt gemessen und gerechnet ist.',
      acht: 'Ein Fehler erster Art ist kein Rechenfehler. Er kann auch bei perfekt erhobenen Daten passieren.',
      concept: 'alpha_level',
    },
    {
      title: 'Das Übersehen kennen',
      was: 'Gibt es einen Unterschied und der Test findet ihn nicht, ist das ein Fehler zweiter Art. Wie oft das passiert, hängt von der Größe des Unterschieds ab.',
      rechnung: `eine Stunde Unterschied: β ≈ ${num(betaFor(0.05))}`,
      warum: 'Kleine Unterschiede gehen im Schwanken der Stichprobe leicht unter. Große fallen fast immer auf.',
      acht: 'Nicht verworfen heißt nicht „kein Unterschied“. Der Test kann ihn übersehen haben.',
      concept: 'power',
    },
    {
      title: 'Zwischen beiden abwägen',
      was: 'Ein kleineres α macht Fehlalarme seltener. Dafür übersieht der Test echte Unterschiede häufiger.',
      rechnung: `α = 0,05: β ≈ ${num(betaFor(0.05))}; α = 0,01: β ≈ ${num(betaFor(0.01))}`,
      warum: 'Beide Fehler hängen an derselben Grenze. Schiebst du sie nach außen, wird der eine seltener und der andere häufiger.',
      acht: 'Beide Fehler zugleich senkst du nur mit mehr Befragten oder genaueren Messungen.',
      concept: 'critical_value',
    },
  ],
  ausprobieren: [
    {
      question: 'In Wahrheit unterscheiden sich zwei Gruppen nicht. Eine Studie meldet trotzdem p = 0,02 und nennt das bei α = 0,05 signifikant. Welcher Fehler ist das?',
      options: ['Fehler erster Art', 'Fehler zweiter Art', 'kein Fehler'], correct: 0, step: 1,
      explain: 'H₀ (kein Unterschied) stimmt und wurde trotzdem verworfen. Das ist ein Fehlalarm, also ein Fehler erster Art.',
      kurz: 'Fehlalarm heißt Fehler erster Art.',
    },
    {
      question: 'In Wahrheit lernen die mit Weiterbildung eine Stunde mehr, aber der Test meldet p = 0,88. Welcher Fehler ist das?',
      options: ['Fehler erster Art', 'Fehler zweiter Art', 'kein Fehler'], correct: 1, step: 2,
      explain: 'H₀ ist falsch, wird aber nicht verworfen. Der Test hat den Unterschied übersehen: ein Fehler zweiter Art.',
      kurz: 'Übersehen heißt Fehler zweiter Art.',
    },
    {
      question: 'Du senkst α von 0,05 auf 0,01. Was passiert mit dem Risiko, eine Stunde Unterschied zu übersehen?',
      options: ['es steigt', 'es bleibt gleich', 'es sinkt'], correct: 0, step: 3,
      explain: `Die Grenze rückt nach außen, der Test verlangt mehr. Eine Stunde Unterschied übersieht er dann in etwa ${Math.round(betaFor(0.01) * 100)} statt ${Math.round(betaFor(0.05) * 100)} von 100 Studien.`,
      kurz: 'Weniger Fehlalarme, mehr Übersehen.',
    },
  ],
  regler: {
    label: 'Welche Schwelle α legst du fest?',
    min: 0.001, max: 0.1, step: 0.001, initial: 0.05,
    format: v => `α = ${num(v, 3)}`,
    describe: v => `Gibt es keinen Unterschied, meldet der Test bei α = ${num(v, 3)} in etwa ${percent(v)} der Studien trotzdem einen: Fehler erster Art. Lernen die mit Weiterbildung in Wahrheit eine Stunde mehr, übersieht er das grob gerechnet in ${percent(betaFor(v))} der Studien: Fehler zweiter Art.`,
  },
  check: {
    question: 'Der Test verwirft H₀ nicht. Was folgt daraus?',
    options: [
      'Es gibt sicher keinen Unterschied.',
      'Ein Fehler erster Art ist ausgeschlossen, ein Fehler zweiter Art möglich.',
      'Ein Fehler erster Art ist möglich.',
      'Die Entscheidung ist mit 95 % Sicherheit richtig.',
    ],
    correct: 1,
    right: 'Genau. Wer H₀ nicht verwirft, kann keinen Fehlalarm auslösen, aber einen echten Unterschied übersehen haben.',
    diagnose: {
      0: 'Fast! Der Test kann einen Unterschied übersehen haben. Ein Fehler zweiter Art ist möglich.',
      2: 'Fast! Ein Fehler erster Art setzt voraus, dass H₀ verworfen wurde. Wer nicht verwirft, kann keinen Fehlalarm auslösen.',
      3: 'Fast! α = 0,05 begrenzt nur Fehlalarme. Wie oft ein Übersehen vorkommt, hängt von der Größe des Unterschieds ab.',
    },
  },
  fuerDich: 'Wenn eine Studie „keinen Unterschied gefunden“ hat, frag: Hätte sie einen relevanten Unterschied überhaupt finden können? Bei wenigen Befragten ist ein Fehler zweiter Art oft wahrscheinlicher als ein Treffer.',
  genau: {
    kurz: 'α begrenzt die Quote der Fehler erster Art, wenn H₀ stimmt. β gilt immer für eine bestimmte Abweichung, und die Teststärke ist 1 − β.',
    paragraphs: [
      `Die Zahlen hier sind grob gerechnet: mit der Normalverteilung und dem Standardfehler ${num(L.se)} Stunden aus dem Lehrdatensatz. Die Teststärke für eine Stunde ist dann etwa Φ(1 / ${num(L.se)} − 1,96) ≈ ${num(1 - betaFor(0.05))}, also β ≈ ${num(betaFor(0.05))}.`,
      'Welche der vier Situationen vorliegt, weiß man bei einer einzelnen Studie nicht. Die Fehlerquoten beschreiben, wie oft ein Verfahren über viele Studien hinweg irrt.',
      'Ein Fehler erster Art ist auch bei korrekt erhobenen Daten und korrekt angewandtem Test möglich. Wer viele Tests rechnet, macht ihn leichter irgendwo: Bei 20 unabhängigen Tests ohne echten Unterschied und α = 0,05 passiert er in etwa 64 von 100 Fällen mindestens einmal (Begriff „Mehrere Vergleiche“).',
    ],
  },
};

/** Reiter: β für eine Stunde Unterschied mit dem Standardfehler der aktuellen Daten, Weiter (der Katalog hat keinen Aufruf dazu). */
export const fehlerartenTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
    kurz: 'Mit allen 200 Befragten: Wie oft würde der t-Test eine Stunde Unterschied in der Lernzeit übersehen?',
    value: c => { const r = gruppenTest(c); return r ? betaFor(0.05, r.se) : null; },
    result: c => {
      const r = gruppenTest(c);
      if (!r) return { kurz: 'In einer der Gruppen streut die Lernzeit nicht. Dann lässt sich der Vergleich nicht rechnen.', fachlich: 'Der Welch-t-Test braucht in beiden Gruppen mindestens zwei verschiedene Werte.' };
      const b = betaFor(0.05, r.se);
      return {
        kurz: `Mit dem Standardfehler dieser Daten, ${num(r.se)} Stunden, übersähe der Test eine Stunde Unterschied grob gerechnet in ${percent(b)} der Studien. Gibt es keinen Unterschied, meldet er in 5 % der Studien trotzdem einen.`,
        fachlich: `Grob mit der Normalverteilung: Teststärke ≈ Φ(1 / ${num(r.se)} − 1,96) ≈ ${num(1 - b)}, also β ≈ ${num(b)}; α = 0,05, zweiseitig.`,
      };
    },
    voraussetzung: 'Grob gerechnet: Der Standardfehler der Daten gilt auch, wenn der Unterschied in Wahrheit eine Stunde beträgt.',
    think: [
      {
        question: 'Alle lernen doppelt so lange, gefragt bleibt nach einer Stunde Unterschied. Was passiert mit dem Risiko, sie zu übersehen?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Die Streuung verdoppelt sich und mit ihr der Standardfehler. Eine Stunde geht im größeren Schwanken leichter unter.',
        kurz: 'Mehr Streuung, mehr Übersehen.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'up' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Risiko, eine Stunde Unterschied zu übersehen?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Verschieben ändert die Streuung nicht. Der Standardfehler bleibt, also auch das Risiko.',
        kurz: 'Die Lage ändert nichts am Übersehen.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was passiert mit dem Risiko, eine Stunde Unterschied zu übersehen?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Der Ausreißer vergrößert die Streuung in seiner Gruppe und damit den Standardfehler. Der Test wird unempfindlicher.',
        kurz: 'Ein Ausreißer macht den Test unempfindlicher.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
    ],
  },
  next: {
    next: { id: 'power', why: 'Die Wahrscheinlichkeit, einen echten Unterschied zu finden: eins minus β.' },
    before: [
      { id: 'hypothesis', why: 'Beide Fehler beziehen sich auf die Entscheidung über H₀.' },
      { id: 'alpha_level', why: 'Begrenzt die Quote der Fehler erster Art.' },
    ],
    after: [{ id: 'multiplicity', why: 'Mit vielen Tests häufen sich Fehler erster Art.' }],
    more: [{ id: 'population_parameter', why: 'Ob ein Fehler vorliegt, hängt vom wahren Wert in der Grundgesamtheit ab.' }],
  },
};
