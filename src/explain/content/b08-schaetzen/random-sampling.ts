// Begriffskarte „Zufallsauswahl“ (random_sampling). Beispiel: 50 der 200 Befragten per Los, ohne Zurücklegen; Chance je
// Person, Zahl der möglichen Stichproben und der Standardfehler des mittleren Haushaltseinkommens mit
// Endlichkeitskorrektur. Regler: wie viele der 200 gelost werden. Reiter: dieselbe Rechnung mit den aktuellen Daten.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num, pct } from '../../format';
import { lgamma } from '../../../tasks/kit/dist';
import { columnX, mean, sd1 } from './daten';

/** Wie viele der 200 im Beispiel gelost werden. */
export const GELOST = 50;
/** Standardabweichung des Haushaltseinkommens der 200 (mit n − 1, wie sd() in R) und ihr Mittelwert, in €. */
export const EINKOMMEN = { N: 200, mean: 3154.62, sd: 1426.646148 } as const;

/** Standardfehler des Mittelwerts bei einfacher Zufallsauswahl ohne Zurücklegen: √(1 − n / N) · S / √n. */
export const seOhne = (n: number, N: number, S: number) => Math.sqrt(Math.max(0, 1 - n / N)) * S / Math.sqrt(n);
/** Zahl der möglichen Stichproben C(N, n), über den Logarithmus (für große Zahlen). */
export const moeglich = (N: number, n: number) => Math.exp(lgamma(N + 1) - lgamma(n + 1) - lgamma(N - n + 1));

const HOCH = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Große Zahl als „4,54 · 10⁴⁷“. */
export function zehnerPotenz(v: number): string {
  const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
  return `${num(m)} · 10${String(e).split('').map(d => HOCH[Number(d)]).join('')}`;
}

/** Einfache Zufallsauswahl von 50 aus den aktuellen 200 Befragten: Mittelwert aller und Standardfehler. */
export function auswahl(c: SampleCtx) {
  const x = columnX(c, 'einkommen');
  return { N: x.length, mean: mean(x), sd: sd1(x), se: seOhne(GELOST, x.length, sd1(x)), mit: sd1(x) * Math.sqrt((x.length - 1) / x.length) / Math.sqrt(GELOST) };
}

export function auswahlText(n: number): string {
  const se = seOhne(n, EINKOMMEN.N, EINKOMMEN.sd);
  const base = `Jede Person kommt mit der Wahrscheinlichkeit ${n} / ${EINKOMMEN.N} = ${pct(n / EINKOMMEN.N)} in die Stichprobe.`;
  if (n >= EINKOMMEN.N) return `${base} Wer alle zieht, kennt den Mittelwert genau: Der Standardfehler ist 0.`;
  return `${base} Das mittlere Haushaltseinkommen der Gelosten liegt typischerweise etwa ${count(se)} € neben dem aller ${EINKOMMEN.N}.`;
}

const se50 = seOhne(GELOST, EINKOMMEN.N, EINKOMMEN.sd);

export const randomSampling: ConceptCard = {
  concept: 'random_sampling',
  wofuer: 'Damit eine Stichprobe für alle sprechen kann, darf nicht die Bequemlichkeit entscheiden, wer gefragt wird. Wie sieht eine echte Zufallsauswahl aus?',
  kurz: 'Bei einer Zufallsauswahl entscheidet ein festgelegtes Losverfahren, wer in die Stichprobe kommt. Bei der einfachen Zufallsauswahl ist jede mögliche Gruppe gleich wahrscheinlich.',
  stellDirVor: {
    text: `Lose ${GELOST} der 200 Befragten aus, etwa mit nummerierten Losen. Jede Person kommt mit der Wahrscheinlichkeit ${GELOST} / 200 = ${pct(GELOST / 200)} in die Stichprobe. Es gibt rund ${zehnerPotenz(moeglich(200, GELOST))} verschiedene Gruppen von ${GELOST} Personen, und jede ist gleich wahrscheinlich. Das mittlere Haushaltseinkommen der Gelosten liegt typischerweise etwa ${count(se50)} € neben dem aller 200, das ${count(EINKOMMEN.mean)} € im Monat beträgt.`,
    figures: [
      { label: 'Chance je Person', value: pct(GELOST / 200) },
      { label: 'mögliche Stichproben', value: `rund ${zehnerPotenz(moeglich(200, GELOST))}` },
      { label: 'Standardfehler des Einkommens', value: `${count(se50)} €` },
    ],
  },
  heisst: {
    sym: 'P(S = s) = 1 / C(N, n)', say: 'P von S gleich s ist eins durch N über n',
    fach: 'Eine Wahrscheinlichkeitsstichprobe verwendet ein festgelegtes Zufallsverfahren mit bekannten, positiven Auswahlwahrscheinlichkeiten. Bei einfacher Zufallsauswahl ohne Zurücklegen hat jede Teilmenge s vom Umfang n aus N Einheiten die Wahrscheinlichkeit 1 / C(N, n).',
  },
  bausteine: [
    {
      title: 'Eine vollständige Liste haben',
      was: 'Für eine Zufallsauswahl brauchst du eine Liste aller, die infrage kommen. Der ALLBUS nimmt dafür die Melderegister der ausgewählten Gemeinden.',
      warum: 'Wer nicht auf der Liste steht, kann nicht gezogen werden. Dann fehlt er auch in jedem Ergebnis.',
      acht: 'Eine Liste von Vereinsmitgliedern oder Followern ist keine Liste aller Erwachsenen. Daran ändert auch ein noch so zufälliges Los nichts.',
      concept: 'sampling',
    },
    {
      title: 'Das Los entscheiden lassen',
      was: 'Ein Zufallsverfahren wählt aus der Liste aus, nicht die Interviewerin und nicht die Befragten selbst. Jede Person hat eine bekannte Chance, gezogen zu werden.',
      warum: 'Nur mit bekannten Chancen lässt sich ausrechnen, wie stark Ergebnisse durch den Zufall schwanken.',
      acht: 'Wer auf der Straße „zufällig“ Leute anspricht, wählt nicht zufällig aus. Er erreicht nur, wer gerade dort unterwegs ist.',
      concept: 'probability',
    },
    {
      title: 'Jede Gruppe gleich wahrscheinlich machen',
      was: `Bei der einfachen Zufallsauswahl ist jede mögliche Gruppe von ${GELOST} Personen gleich wahrscheinlich. Dafür reicht es nicht, dass jede einzelne Person dieselbe Chance hat.`,
      warum: 'Erst dann gelten die üblichen Formeln für den Standardfehler.',
      acht: 'Wer zufällig eine ganze Schulklasse zieht, gibt jeder Schülerin dieselbe Chance. Trotzdem ist das keine einfache Zufallsauswahl: Gruppen aus verschiedenen Klassen kommen nie vor.',
      concept: 'sampling_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'Eine Interviewerin spricht vor der Mensa Menschen an, die gerade Zeit haben. Ist das eine Zufallsauswahl?',
      options: ['ja, sie kennt niemanden vorher', 'nein, es fehlt ein Losverfahren mit bekannten Chancen'], correct: 1, step: 2,
      explain: 'Wer gerade keine Zeit hat oder nie zur Mensa geht, hat keine Chance. Wie groß die Chancen der anderen sind, weiß niemand.',
      kurz: 'Zufällig angesprochen ist nicht zufällig ausgewählt.',
    },
    {
      question: 'Du lost alle 200 aus. Wie stark schwankt der Mittelwert dann noch?',
      options: ['gar nicht', 'genauso wie bei 50', 'etwas weniger als bei 50'], correct: 0, step: 3,
      explain: 'Wer ohne Zurücklegen alle zieht, hat jedes Mal dieselben 200 Personen. Der Standardfehler ist dann 0. Schieb den Regler auf 200.',
      kurz: 'Ohne Zurücklegen wird die Stichprobe am Ende zur Grundgesamtheit.',
    },
    {
      question: 'Eine Zufallsstichprobe ist gezogen, aber viele der Gezogenen machen nicht mit. Ist das Ergebnis trotzdem unverzerrt?',
      options: ['ja, gezogen wurde zufällig', 'nicht unbedingt'], correct: 1, step: 1,
      explain: 'Wenn sich die Teilnehmenden von denen unterscheiden, die nicht mitmachen, ist das Ergebnis verzerrt. Daran ändert die zufällige Ziehung nichts.',
      kurz: 'Nichtteilnahme kann jede Zufallsstichprobe verzerren.',
    },
  ],
  regler: {
    label: 'Wie viele der 200 lost du aus?',
    min: 10, max: 200, step: 10, initial: GELOST,
    format: v => `${Math.round(v)} von 200`,
    describe: v => auswahlText(Math.round(v)),
  },
  check: {
    question: `Welche Auswahl ist eine einfache Zufallsauswahl von ${GELOST} aus 200?`,
    options: [
      `die ersten ${GELOST}, die sich auf eine Rundmail melden`,
      `${GELOST} Personen, per Los aus der Liste aller 200 gezogen`,
      `eine von vier festen Gruppen mit je ${GELOST} Personen, per Los gewählt`,
      `die ${GELOST}, die am längsten lernen`,
    ],
    correct: 1,
    right: `Genau. Das Los wählt aus der vollständigen Liste, und jede Gruppe von ${GELOST} ist gleich wahrscheinlich.`,
    diagnose: {
      0: 'Fast! Hier entscheiden die Menschen selbst, ob sie mitmachen. Das ist Selbstauswahl, kein Losverfahren.',
      2: `Fast! Jede Person hat zwar die Chance ${pct(GELOST / 200)}, aber nur vier Gruppen sind möglich. Bei einfacher Zufallsauswahl ist jede Gruppe von ${GELOST} möglich.`,
      3: 'Noch nicht ganz. Hier entscheidet die Lernzeit, wer dabei ist, nicht der Zufall.',
    },
  },
  fuerDich: 'Wenn eine Studie sich „repräsentativ“ nennt, frag nach dem Verfahren: Gab es eine Liste, ein Los und bekannte Chancen? Das Wort allein garantiert nichts.',
  genau: {
    kurz: 'Gleiche Chancen für einzelne Personen reichen nicht für eine einfache Zufallsauswahl. Auch alle möglichen Gruppen müssen gleich wahrscheinlich sein.',
    paragraphs: [
      `Ohne Zurücklegen sind die Ziehungen abhängig. Der Standardfehler des Mittelwerts schrumpft um den Faktor √(1 − n / N): SE = √(1 − n / N) · S / √n. Hier: √(1 − ${GELOST} / 200) · ${count(EINKOMMEN.sd)} / √${GELOST} ≈ ${count(se50)} €.`,
      'Bei kleinem Auswahlanteil n / N ist das Modell unabhängiger, identisch verteilter Beobachtungen eine gute Näherung. Für alle Erwachsenen in Deutschland ist der Anteil winzig.',
      'Viele Erhebungen ziehen mehrstufig: erst Gemeinden, dann Personen, oft mit ungleichen Chancen. Dann braucht die Auswertung Gewichte und Designverfahren.',
      'Zufallsauswahl von Personen und zufällige Zuweisung zu Versuchsgruppen erfüllen verschiedene Aufgaben. Die eine erlaubt Schlüsse auf die Grundgesamtheit, die andere Schlüsse auf Ursachen.',
      'Nichtteilnahme kann auch eine Zufallsstichprobe verzerren. Das Auswahlverfahren garantiert keine perfekte Abbildung der Grundgesamtheit in jeder einzelnen Stichprobe.',
    ],
  },
};

export const randomSamplingTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'einkommen' },
    kurz: `Lose ${GELOST} der 200 Befragten aus, ohne Zurücklegen. Wie genau trifft ihr mittleres Haushaltseinkommen das aller 200?`,
    value: c => auswahl(c).se,
    result: c => {
      const a = auswahl(c);
      return {
        kurz: `Alle ${a.N} haben im Schnitt ${count(a.mean)} € im Monat. Der Mittelwert von ${GELOST} zufällig Gelosten liegt typischerweise etwa ${count(a.se)} € daneben.`,
        fachlich: `Einfache Zufallsauswahl ohne Zurücklegen: SE = √(1 − ${GELOST} / ${a.N}) · ${count(a.sd)} / √${GELOST} ≈ ${count(a.se)} €. Mit Zurücklegen wären es σ / √${GELOST} ≈ ${count(a.mit)} €.`,
        zusatz: `Jede Person kommt mit der Wahrscheinlichkeit ${pct(GELOST / a.N)} in die Stichprobe.`,
      };
    },
    voraussetzung: 'Das Los wählt aus der Liste aller 200, jede Gruppe von 50 gleich wahrscheinlich. Alle Gelosten antworten.',
    think: [
      {
        question: 'Alle Einkommen verdoppeln sich. Was macht der Standardfehler?',
        options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 0,
        explain: 'Die Einkommen streuen doppelt so weit, also schwankt auch ihr Mittelwert doppelt so stark. Die Auswahl selbst bleibt gleich.',
        kurz: 'Mehr Streuung, ungenauerer Mittelwert.',
        tryIt: { label: 'alle Einkommen doppelt so hoch', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Alle Haushalte bekommen 100 € mehr. Was macht der Standardfehler?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Verschieben ändert die Streuung nicht. Der Mittelwert der Gelosten rückt genauso um 100 € wie der aller 200.',
        kurz: 'Die Lage ändert nichts an der Genauigkeit.',
        tryIt: { label: 'alle 100 € mehr', op: 'shift', column: 'x', value: 100 },
        expect: { change: 'same' },
      },
      {
        question: 'Ein Haushalt hat plötzlich 30.000 € im Monat. Was macht der Standardfehler?',
        options: ['steigt', 'bleibt genau gleich', 'sinkt'], correct: 0,
        explain: 'Der Ausreißer vergrößert die Streuung. Ob er gelost wird, verändert den Mittelwert der Stichprobe stark.',
        kurz: 'Ein Ausreißer macht den Mittelwert unsicherer.',
        tryIt: { label: 'die gewählte Person auf 30.000 €', op: 'outlier', column: 'x', value: 30000 },
        expect: { change: 'up' },
      },
    ],
  },
  next: {
    next: { id: 'sampling_distribution', why: 'Was entsteht, wenn du das Los in Gedanken sehr oft wiederholst: die Verteilung aller möglichen Ergebnisse.' },
    before: [
      { id: 'sampling', why: 'Die Zufallsauswahl ist der Weg von der Grundgesamtheit zur Stichprobe.' },
      { id: 'probability', why: 'Bekannte Auswahlchancen sind Wahrscheinlichkeiten.' },
    ],
    after: [
      { id: 'weights', why: 'Ungleiche Auswahlchancen gleicht man mit Gewichten aus.' },
      { id: 'random_assignment', why: 'Etwas anderes: Zufall entscheidet dort, wer welche Behandlung bekommt.' },
    ],
    more: [
      { id: 'sampling_bias', why: 'Was passiert, wenn statt des Loses die Selbstauswahl entscheidet.' },
      { id: 'law_large_numbers', why: 'Gilt für Zufallsstichproben: Mit mehr Gelosten landet der Mittelwert verlässlicher beim wahren Wert.' },
    ],
  },
};
