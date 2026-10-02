// Begriffskarte „Bedingte Wahrscheinlichkeit“. Beispiel: Weiterbildung unter den 40 Befragten mit Abitur (19 von 40)
// und die umgekehrte Bedingung (19 von 82). Zahlen in R nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { pct } from '../../format';
import { ABSCHLUSS, column, eqSign } from './gemeinsam';

const A = ABSCHLUSS;
const P_W_ABI = A.mit[4] / A.count[4], P_ABI_W = A.mit[4] / A.mitWeiterbildung, P_W = A.mitWeiterbildung / A.n, P_BEIDE = A.mit[4] / A.n;

/** Zählungen der Auswertung: Abschluss (x) und Weiterbildung (y) der aktuellen Daten. */
function counts(c: SampleCtx) {
  const s = column(c, 'x', 'schulabschluss'), w = column(c, 'y', 'weiterbildung'), n = s.length;
  const abi = s.filter(v => v === 4).length, weiter = w.filter(v => v === 1).length;
  const beide = s.filter((v, i) => v === 4 && w[i] === 1).length;
  return { n, abi, weiter, beide, wGivenAbi: abi ? beide / abi : null, abiGivenW: weiter ? beide / weiter : null, w: weiter / n };
}

export const conditionalProbability: ConceptCard = {
  concept: 'conditional_probability',
  wofuer: 'Machen Menschen mit Abitur häufiger eine Weiterbildung als andere? Um das zu beantworten, schaust du nur auf eine Teilgruppe: die Befragten mit Abitur. Genau das macht eine bedingte Wahrscheinlichkeit.',
  kurz: 'Eine bedingte Wahrscheinlichkeit sagt dir, wie wahrscheinlich etwas ist, wenn du schon weißt, dass etwas anderes zutrifft. Du rechnest dann nur noch in dieser Teilgruppe.',
  stellDirVor: {
    text: `Von den ${A.n} Befragten haben ${A.count[4]} Abitur. Von diesen ${A.count[4]} haben ${A.mit[4]} in den letzten zwölf Monaten eine Weiterbildung gemacht, also ${pct(P_W_ABI)}. Unter allen ${A.n} sind es ${A.mitWeiterbildung}, also ${pct(P_W)}. Weißt du, dass die gezogene Person Abitur hat, rechnest du mit ${pct(P_W_ABI)} statt mit ${pct(P_W)}.`,
    figures: [
      { label: 'P(Weiterbildung)', value: pct(P_W) },
      { label: 'P(Weiterbildung | Abitur)', value: pct(P_W_ABI) },
      { label: 'P(Abitur | Weiterbildung)', value: pct(P_ABI_W) },
    ],
  },
  heisst: {
    sym: 'P(A | B)', say: 'P von A gegeben B',
    fach: 'Die Wahrscheinlichkeit von A unter der Bedingung B: P(A | B) = P(A ∩ B) / P(B), definiert für P(B) > 0.',
  },
  bausteine: [
    {
      title: 'Die Teilgruppe wählen',
      was: `Die Bedingung steht hinter dem senkrechten Strich. Bei P(Weiterbildung | Abitur) zählen nur die ${A.count[4]} Befragten mit Abitur.`,
      warum: 'Das Wissen „hat Abitur“ schließt alle anderen aus. Die Teilgruppe wird zur neuen Gesamtheit der Rechnung.',
      acht: 'Der Strich heißt „gegeben“ oder „unter der Bedingung“. Er ist kein Bruchstrich und kein Minus.',
    },
    {
      title: 'In der Teilgruppe den Anteil zählen',
      was: `Von den ${A.count[4]} mit Abitur haben ${A.mit[4]} eine Weiterbildung gemacht. Du teilst durch ${A.count[4]}, nicht durch ${A.n}.`,
      rechnung: `P(Weiterbildung | Abitur) = ${A.mit[4]} / ${A.count[4]} = ${pct(P_W_ABI)}. Über die Formel: ${pct(P_BEIDE)} / ${pct(A.count[4] / A.n)} = ${pct(P_W_ABI)}.`,
      warum: `Der Nenner legt fest, auf wen sich der Anteil bezieht. Mit ${A.n} im Nenner bekämst du P(Weiterbildung und Abitur) = ${pct(P_BEIDE)}, eine andere Frage.`,
      acht: `Wer durch ${A.n} teilt, bekommt ${pct(P_BEIDE)} statt ${pct(P_W_ABI)}. Das passiert vielen. Merksatz: Geteilt wird durch die Größe der Teilgruppe.`,
      concept: 'crosstab',
    },
    {
      title: 'Die Richtung beachten',
      was: `Drehst du die Frage um, ändert sich die Teilgruppe. Unter den ${A.mitWeiterbildung} mit Weiterbildung haben ${A.mit[4]} Abitur, das sind ${pct(P_ABI_W)}.`,
      rechnung: `P(Abitur | Weiterbildung) = ${A.mit[4]} / ${A.mitWeiterbildung} ≈ ${pct(P_ABI_W)}, nicht ${pct(P_W_ABI)}.`,
      warum: `Beide Zahlen haben denselben Zähler ${A.mit[4]}, aber verschiedene Nenner: ${A.count[4]} Befragte mit Abitur und ${A.mitWeiterbildung} mit Weiterbildung.`,
      acht: 'P(A | B) und P(B | A) zu verwechseln, ist einer der häufigsten Fehler. Beim p-Wert passiert er oft: Er rechnet unter der Bedingung, dass die Nullhypothese stimmt, und sagt nicht, wie wahrscheinlich sie ist.',
      concept: 'p_value',
    },
  ],
  ausprobieren: [
    {
      question: `Unter den ${A.count[1]} Befragten mit Hauptschulabschluss haben ${A.mit[1]} eine Weiterbildung gemacht. Wie groß ist P(Weiterbildung | Hauptschulabschluss)?`,
      options: [pct(A.mit[1] / A.n), pct(A.mit[1] / A.count[1]), pct(A.mit[1] / A.mitWeiterbildung)], correct: 1, step: 2,
      explain: `${A.mit[1]} / ${A.count[1]} = ${pct(A.mit[1] / A.count[1])}. ${pct(A.mit[1] / A.n)} wäre ${A.mit[1]} von ${A.n}, also P(Weiterbildung und Hauptschulabschluss). ${pct(A.mit[1] / A.mitWeiterbildung)} wäre ${A.mit[1]} von ${A.mitWeiterbildung}, die umgekehrte Bedingung.`,
      kurz: 'Der Nenner ist die Teilgruppe hinter dem Strich.',
    },
    {
      question: 'Eine Kreuztabelle zeigt Zeilenprozente. Welche bedingte Wahrscheinlichkeit steht in einer Zeile?',
      options: ['P(Spalte | Zeile)', 'P(Zeile | Spalte)', 'P(Zeile und Spalte)'], correct: 0, step: 1,
      explain: `Zeilenprozente teilen durch die Summe der Zeile. Die Zeile ist also die Bedingung: In der Zeile Abitur stehen ${pct(A.ohne[4] / A.count[4])} ohne und ${pct(P_W_ABI)} mit Weiterbildung.`,
      kurz: 'Zeilenprozente: Die Zeile ist die Bedingung.',
    },
    {
      question: 'Ein Test erkennt eine seltene Krankheit fast immer: Wer krank ist, bekommt zu 99 % ein positives Ergebnis. Ist jemand mit positivem Test dann zu 99 % krank?',
      options: ['ja', 'nicht unbedingt'], correct: 1, step: 3,
      explain: 'P(positiv | krank) ist nicht P(krank | positiv). Ist die Krankheit selten, stammen viele positive Ergebnisse von Gesunden, bei denen der Test sich irrt. Die Bedingung umzudrehen, ändert die Teilgruppe.',
      kurz: 'Wer die Bedingung umdreht, bekommt eine andere Zahl.',
    },
  ],
  check: {
    question: `Im Lehrdatensatz gilt P(Weiterbildung | Abitur) = ${pct(P_W_ABI)}. Was heißt das?`,
    options: [
      `Von den Befragten mit Abitur haben ${pct(P_W_ABI)} eine Weiterbildung gemacht.`,
      `Von den Befragten mit Weiterbildung haben ${pct(P_W_ABI)} Abitur.`,
      `${pct(P_W_ABI)} aller Befragten haben Abitur und eine Weiterbildung.`,
      `Abitur führt bei ${pct(P_W_ABI)} der Menschen zu einer Weiterbildung.`,
    ],
    correct: 0,
    right: `Genau. Die Bedingung Abitur legt die Teilgruppe fest: ${A.mit[4]} von ${A.count[4]}.`,
    diagnose: {
      1: `Fast! Da ist die Richtung gedreht. Unter den Befragten mit Weiterbildung haben ${pct(P_ABI_W)} Abitur.`,
      2: `Fast! Das wäre P(Abitur und Weiterbildung), geteilt durch alle ${A.n}: ${pct(P_BEIDE)}.`,
      3: 'Fast! Eine bedingte Wahrscheinlichkeit beschreibt einen Anteil in einer Teilgruppe. Ob Abitur eine Weiterbildung bewirkt, sagt sie nicht.',
    },
  },
  fuerDich: 'Liest du „70 % der …, sind …“, frag dich: Wer ist die Teilgruppe im Nenner? Wer die Bedingung vertauscht, bekommt eine ganz andere Zahl, und viele Schlagzeilen leben genau davon.',
  genau: {
    kurz: 'Formal ist P(A | B) = P(A ∩ B) / P(B), nur für P(B) > 0. Ein Anteil in einer Teilgruppe der Daten schätzt diese Modellwahrscheinlichkeit.',
    paragraphs: [
      `P(A ∩ B), sprich „A und B“, ist die Wahrscheinlichkeit, dass beide Ereignisse eintreten. ${A.mit[4]} von ${A.n} Befragten haben Abitur und eine Weiterbildung, also ${pct(P_BEIDE)}. Geteilt durch P(Abitur) = ${pct(A.count[4] / A.n)} ergibt das ${pct(P_W_ABI)}.`,
      'In einer Kreuztabelle beantworten Zeilen- und Spaltenprozente unterschiedliche bedingte Fragen: Zeilenprozente bedingen auf die Zeile, Spaltenprozente auf die Spalte.',
      `Umgestellt ergibt die Formel die Multiplikationsregel P(A ∩ B) = P(A | B) · P(B). Mit ihr lässt sich die Bedingung umdrehen (Satz von Bayes): P(Abitur | Weiterbildung) = ${pct(P_W_ABI)} · ${pct(A.count[4] / A.n)} / ${pct(P_W)} ≈ ${pct(P_ABI_W)}.`,
      '„Unter der Nullhypothese“ legt beim Testen die Bedingung fest. Daraus folgt keine Wahrscheinlichkeit dafür, dass die Hypothese stimmt.',
    ],
  },
};

export const conditionalProbabilityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss', y: 'weiterbildung' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie wahrscheinlich hat eine Person mit Abitur eine Weiterbildung gemacht, und wie ist es umgekehrt?',
    value: c => counts(c).wGivenAbi,
    result: c => {
      const k = counts(c);
      if (k.wGivenAbi === null) return { kurz: 'Niemand hat Abitur. Dann gibt es keine Teilgruppe, und P(Weiterbildung | Abitur) ist nicht definiert.', fachlich: 'P(A | B) ist nur für P(B) > 0 definiert.' };
      const rev = k.abiGivenW === null ? 'Niemand hat eine Weiterbildung gemacht, die umgekehrte Bedingung ist deshalb nicht definiert.'
        : `Umgekehrt haben von den ${k.weiter} mit Weiterbildung ${k.beide} Abitur: ${pct(k.abiGivenW)}.`;
      return {
        kurz: `Von den ${k.abi} Befragten mit Abitur haben ${k.beide} eine Weiterbildung gemacht, also ${pct(k.wGivenAbi)}. Unter allen ${k.n} sind es ${pct(k.w)}. ${rev}`,
        fachlich: `P(Weiterbildung | Abitur) = ${k.beide} / ${k.abi} ${eqSign(k.wGivenAbi, 3)} ${pct(k.wGivenAbi)}; P(Weiterbildung) = ${k.weiter} / ${k.n} ${eqSign(k.w, 3)} ${pct(k.w)}.`,
        zusatz: `P(Abitur und Weiterbildung) = ${k.beide} / ${k.n} ${eqSign(k.beide / k.n, 3)} ${pct(k.beide / k.n)}: Dort stehen alle ${k.n} im Nenner.`,
      };
    },
    voraussetzung: 'Die Anteile beschreiben diese 200 Befragten. Als Schätzung für alle Erwachsenen bräuchte es eine Zufallsstichprobe.',
    think: [
      {
        question: 'Angenommen, alle 200 hätten eine Weiterbildung gemacht. Wie groß ist dann P(Weiterbildung | Abitur)?',
        options: ['1', '0,2', '0,41'], correct: 0,
        explain: 'In der Teilgruppe mit Abitur haben dann alle eine Weiterbildung gemacht: 40 von 40. Die bedingte Wahrscheinlichkeit ist 1.',
        kurz: 'Ist etwas für alle wahr, ist es auch in jeder Teilgruppe wahr.',
        tryIt: { label: 'alle mit Weiterbildung (Code 1)', op: 'constant', column: 'y', value: 1 },
        expect: { change: 'equals', value: 1 },
      },
      {
        question: 'Angenommen, alle 200 hätten Abitur. Um wie viele Prozentpunkte unterscheiden sich dann P(Weiterbildung | Abitur) und P(Weiterbildung)?',
        options: ['0', '6,5', '41'], correct: 0,
        explain: 'Die Teilgruppe mit Abitur sind dann alle 200. Bedingung und Gesamtheit fallen zusammen, beide Anteile sind gleich.',
        kurz: 'Umfasst die Bedingung alle, ändert sie nichts.',
        tryIt: { label: 'alle auf Abitur (Code 4)', op: 'constant', column: 'x', value: 4 },
        expect: { change: 'equals', value: 0, measure: c => { const k = counts(c); return k.wGivenAbi === null ? null : Math.abs(k.wGivenAbi - k.w) * 100; } },
      },
    ],
  },
  r: {
    entry: 'crosstab', variant: 0,
    outputMap: [
      { match: '47.5%', atlas: 'P(Weiterbildung | Abitur)', step: 2, explain: 'In der Zeile Abitur: 19 von 40 haben eine Weiterbildung gemacht, 47,5 %. Zeilenprozente teilen durch die Summe der Zeile.' },
      { match: '41.0%', atlas: 'P(Weiterbildung) ohne Bedingung', step: 2, explain: 'Unter allen 200 Befragten haben 41 % eine Weiterbildung gemacht. Das ist der Vergleich ohne Bedingung.' },
      { match: '19', atlas: 'Abitur und Weiterbildung', step: 2, explain: '19 Befragte haben Abitur und eine Weiterbildung. Geteilt durch die 40 der Zeile ergibt das 47,5 %.' },
      { match: 'row %', atlas: 'Zeilenprozente', step: 1, explain: 'row % heißt Zeilenprozent: Die Zeile ist die Bedingung, jede Zeile ergibt zusammen 100 %.' },
    ],
    check: {
      question: 'Welche Zahl ist P(Weiterbildung | Abitur)? Tippe sie an.', correct: '47.5%',
      wrong: {
        '41.0%': 'Fast! 41 % gelten für alle 200, ohne Bedingung. P(Weiterbildung | Abitur) steht in der Zeile Abitur.',
        '19': 'Fast! 19 ist die Anzahl mit Abitur und Weiterbildung. Die bedingte Wahrscheinlichkeit ist ihr Anteil an den 40 mit Abitur.',
      },
    },
  },
  next: {
    next: { id: 'stochastic_independence', why: 'Ändert die Bedingung nichts am Anteil, sind die beiden Ereignisse unabhängig.' },
    before: [
      { id: 'probability', why: 'Die Wahrscheinlichkeit ohne Bedingung, mit der du vergleichst.' },
      { id: 'crosstab', why: 'In der Kreuztabelle stehen die Zahlen für jede Teilgruppe.' },
    ],
    after: [
      { id: 'p_value', why: 'Rechnet unter der Bedingung, dass die Nullhypothese stimmt.' },
      { id: 'logistic_regression', why: 'Schätzt die Wahrscheinlichkeit eines Ereignisses gegeben mehrere Merkmale.' },
    ],
    more: [{ id: 'expected', why: 'Erwartete Zellhäufigkeiten, wenn die Bedingung nichts ändern würde.' }],
  },
};
