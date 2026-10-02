// Begriffskarte „Hypergeometrische Verteilung“ (Bereich B7). Beispiel: 10 der 200 Befragten ziehen, 82 haben eine
// Weiterbildung gemacht; dazu der exakte Test von Fisher für Weiterbildung und Erwerbstätigkeit. Zahlen in R nachgerechnet.
// Grenzfall Vorlage: Die Formel ist ein Zählen von Auswahlen, das als Rechnung in zwei Bausteinen steht; der Kern ist
// die Idee „ohne Zurücklegen“ im Vergleich zur Binomialverteilung. Deshalb Begriffskarte mit einem Regler für n.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, unit } from '../../format';
import { sampleColumn } from '../../sample';
import { dbinom, dhyper, fisherTest, often, prob, pValue } from './dist';

/** 10 aus 200 mit 82 Erfolgen (R: dhyper, dbinom) und die Vierfeldertafel Weiterbildung × Erwerbstätig (R: fisher.test). */
export const HYPER = { N: 200, K: 82, n: 10, p4: 0.2567104, b4: 0.2503034, a: 59, row1: 82, expected: 56.17, fisherP: 0.4400504 } as const;
const H = HYPER;
/** Standardabweichung der Treffer bei n aus 200 ohne und mit Zurücklegen. */
export const spread = (n: number) => {
  const p = H.K / H.N, b = n * p * (1 - p);
  return { e: n * p, without: Math.sqrt(b * (H.N - n) / (H.N - 1)), with: Math.sqrt(b) };
};

export const hypergeometrisch: ConceptCard = {
  concept: 'hypergeometric_distribution',
  picture: 'b07-hyper',
  wofuer: 'Du ziehst 10 der 200 Befragten für ein Interview, ohne jemanden zweimal zu ziehen. Wie viele davon haben eine Weiterbildung gemacht? Das beschreibt die hypergeometrische Verteilung. Sie steckt auch im exakten Test von Fisher.',
  kurz: 'Die hypergeometrische Verteilung zählt Treffer, wenn du aus einer begrenzten Gruppe ohne Zurücklegen ziehst. Jede Ziehung verändert, was für die nächste übrig bleibt.',
  stellDirVor: {
    text: `Unter den 200 Befragten haben ${H.K} in den letzten zwölf Monaten eine Weiterbildung gemacht, ${H.N - H.K} nicht. Du ziehst ${H.n} Personen für ein Interview, ohne jemanden zweimal zu ziehen. Am wahrscheinlichsten sind 4 mit Weiterbildung dabei, mit P ≈ ${prob(H.p4)}. Im Schnitt erwartest du ${H.n} · ${H.K} / ${H.N} = ${num(spread(H.n).e)}.`,
    figures: [
      { label: 'Gruppe N', value: String(H.N) },
      { label: 'mit Weiterbildung K', value: String(H.K) },
      { label: 'gezogen n', value: String(H.n) },
      { label: 'P(genau 4)', value: prob(H.p4) },
    ],
  },
  heisst: {
    sym: 'P(X = k)', say: 'P von X gleich k',
    fach: 'Aus N Objekten mit K Erfolgen werden n ohne Zurücklegen gezogen. Die Zahl X der Erfolge in der Auswahl hat P(X = k) = C(K, k) · C(N − K, n − k) / C(N, n).',
  },
  bausteine: [
    {
      title: 'Passende Auswahlen zählen',
      was: 'Wie viele Möglichkeiten gibt es, genau k Erfolge und n − k andere zu ziehen? Man zählt beide Teile und nimmt sie mal.',
      rechnung: 'Kleine Gruppe: 10 Befragte, 4 davon mit Weiterbildung, 3 werden gezogen. Genau 1 mit Weiterbildung: C(4, 1) · C(6, 2) = 4 · 15 = 60 Möglichkeiten.',
      warum: 'Jede Auswahl von Personen ist gleich wahrscheinlich. Dann reicht es, die passenden Auswahlen zu zählen.',
      acht: 'Gezählt werden Gruppen von Personen, keine Reihenfolgen. Wer zuerst gezogen wird, spielt keine Rolle.',
      concept: 'count',
    },
    {
      title: 'Durch alle Auswahlen teilen',
      was: 'Die Wahrscheinlichkeit ist die Zahl der passenden Auswahlen geteilt durch die Zahl aller Auswahlen.',
      rechnung: 'Alle Auswahlen von 3 aus 10: C(10, 3) = 120. P(X = 1) = 60 / 120 = 0,5.',
      warum: 'So wird aus einer Zählung eine Wahrscheinlichkeit zwischen 0 und 1. Alle möglichen k zusammen ergeben genau 1.',
      acht: 'Mehr Erfolge, als es in der Gruppe gibt, kann die Auswahl nicht enthalten. Aus 4 mit Weiterbildung ziehst du höchstens 4.',
      concept: 'probability_mass',
    },
    {
      title: 'Mit der Binomialverteilung vergleichen',
      was: 'Mit Zurücklegen bliebe die Wahrscheinlichkeit bei jeder Ziehung gleich. Das wäre die Binomialverteilung.',
      rechnung: `Kleine Gruppe mit Zurücklegen: P(X = 1) = 3 · 0,4 · 0,6² ≈ ${num(dbinom(1, 3, 0.4))} statt 0,5. Lehrdatensatz, 10 aus 200: P(X = 4) ≈ ${num(H.b4)} statt ${num(H.p4)}.`,
      warum: 'Ohne Zurücklegen wird nach jedem Treffer ein weiterer Treffer seltener. Das macht extreme Ergebnisse unwahrscheinlicher.',
      acht: 'Ist die Gruppe groß und die Auswahl klein, unterscheiden sich beide kaum. Bei 10 aus 200 ist der Unterschied gering.',
      concept: 'binomial_distribution',
    },
    {
      title: 'Den exakten Test von Fisher verstehen',
      was: 'Fisher fragt bei einer Vierfeldertafel: Wie wahrscheinlich ist diese Besetzung, wenn die Randsummen feststehen? Die Antwort liefert die hypergeometrische Verteilung.',
      rechnung: `Von den ${H.row1} mit Weiterbildung sind ${H.a} erwerbstätig, zu erwarten wären ${num(H.expected)}. Gäbe es keinen Zusammenhang, käme eine so große Abweichung ${often(H.fisherP)} Stichproben vor (R: p = 0.440).`,
      warum: 'Mit festen Randsummen reicht eine Zelle; die anderen drei folgen daraus. Ihre Verteilung ist hypergeometrisch.',
      acht: 'Der Test heißt exakt, weil er ohne Näherung rechnet. Das hilft bei kleinen erwarteten Häufigkeiten, wo der Chi-Quadrat-Test nur grob nähert.',
      concept: 'fisher_test',
    },
  ],
  ausprobieren: [
    {
      question: 'Du ziehst alle 200 Befragten. Wie viele mit Weiterbildung bekommst du?',
      options: ['sicher 82', 'meistens etwa 82', 'zwischen 0 und 200'], correct: 0, step: 3,
      explain: 'Ohne Zurücklegen ziehst du jede Person genau einmal. Dann ist das Ergebnis sicher: alle 82. Schieb den Regler auf 200.',
      kurz: 'Ohne Zurücklegen schrumpft der Zufall, je mehr du ziehst.',
    },
    {
      question: 'Was streut stärker: 10 aus 200 ohne Zurücklegen oder mit Zurücklegen?',
      options: ['mit Zurücklegen', 'ohne Zurücklegen', 'beide gleich'], correct: 0, step: 3,
      explain: `Ohne Zurücklegen ist die Standardabweichung ${num(spread(10).without)}, mit Zurücklegen ${num(spread(10).with)}. Der Faktor (N − n) / (N − 1) macht die Streuung kleiner.`,
      kurz: 'Ohne Zurücklegen kommt niemand zweimal vor.',
    },
    {
      question: 'Welche Zahlen kann X annehmen, wenn du 10 aus den 200 ziehst?',
      options: ['0 bis 10', '0 bis 82', '82 bis 200'], correct: 0, step: 2,
      explain: 'Mehr als 10 Treffer passen nicht in eine Auswahl von 10. Allgemein reicht X von max(0, n − (N − K)) bis min(n, K).',
      kurz: 'Die Größe der Auswahl begrenzt die Zahl der Treffer.',
    },
  ],
  regler: {
    label: 'Wie viele der 200 Befragten ziehst du?',
    min: 1, max: 200, step: 1, initial: H.n,
    format: v => unit(v, 'Person', 'Personen'),
    describe: v => {
      const s = spread(v);
      if (v >= H.N - 1e-9) return `Ziehst du alle 200, ist das Ergebnis sicher: genau ${H.K} mit Weiterbildung. Mit Zurücklegen schwankte es weiter, mit einer Standardabweichung von ${num(s.with)}.`;
      return `Ziehst du ${unit(v, 'Person', 'Personen')}, erwartest du ${num(s.e)} mit Weiterbildung. Die Standardabweichung ist ${num(s.without)} ohne und ${num(s.with)} mit Zurücklegen.`;
    },
  },
  check: {
    question: 'In einer Gruppe von 6 Befragten haben 2 eine Weiterbildung gemacht. Du ziehst 2 Personen ohne Zurücklegen. Wie wahrscheinlich ist es, dass beide eine Weiterbildung gemacht haben?',
    options: ['1 / 15', '1 / 9', '2 / 6', '1 / 2'],
    correct: 0,
    right: 'Genau. Für den ersten Treffer stehen die Chancen 2 / 6, danach bleibt 1 von 5: 2 / 6 · 1 / 5 = 1 / 15.',
    diagnose: {
      1: 'Fast! 1 / 9 = (2 / 6)² gälte mit Zurücklegen. Ohne Zurücklegen bleibt nach dem ersten Treffer nur 1 von 5.',
      2: 'Fast! 2 / 6 ist erst die Chance für den ersten Treffer. Für den zweiten bleibt nur 1 von 5.',
      3: 'Noch nicht ganz. Zähle alle Paare aus 6 Personen: 15. Nur eines davon besteht aus beiden mit Weiterbildung.',
    },
  },
  fuerDich: 'Ziehst du aus einer kleinen Gruppe, etwa aus einem Seminar mit 20 Leuten, rechne ohne Zurücklegen. Bei großen Bevölkerungen ist die Binomialverteilung eine gute Näherung.',
  genau: {
    kurz: 'Der Erwartungswert ist n · K / N wie bei der Binomialverteilung. Die Varianz ist um den Faktor (N − n) / (N − 1) kleiner.',
    paragraphs: [
      'P(X = k) = C(K, k) · C(N − K, n − k) / C(N, n). Die möglichen Werte reichen von max(0, n − (N − K)) bis min(n, K).',
      `Varianz: n · K / N · (1 − K / N) · (N − n) / (N − 1). Der letzte Faktor heißt Endlichkeitskorrektur. Bei 10 aus 200 ist er 190 / 199 ≈ ${num(190 / 199)}.`,
      'Beim exakten Test von Fisher hält man alle Randsummen der Vierfeldertafel fest. Die Zahl in einer Zelle ist dann unter der Nullhypothese hypergeometrisch verteilt. Der p-Wert summiert alle Tafeln, die höchstens so wahrscheinlich sind wie die beobachtete.',
      `In R liefert dhyper(4, 82, 118, 10) die Wahrscheinlichkeit für genau 4 Treffer, ${prob(dhyper(4, H.K, H.N, H.n))}.`,
    ],
  },
};

/** Vierfeldertafel Weiterbildung × Erwerbstätig in den aktuellen Daten und der exakte Test von Fisher. */
export function fisherFit(c: SampleCtx) {
  const xs = sampleColumn(c.rows, c.columns.x?.[0] ?? 'weiterbildung'), ys = sampleColumn(c.rows, c.columns.y?.[0] ?? 'erwerbstaetig');
  const cnt = (x: number, y: number) => xs.filter((v, i) => v === x && ys[i] === y).length;
  const a = cnt(1, 1), b = cnt(1, 0), c2 = cnt(0, 1), d = cnt(0, 0), n = xs.length, row1 = a + b, col1 = a + c2;
  return { a, b, c: c2, d, n, row1, col1, expected: row1 * col1 / n, p: fisherTest([[a, b], [c2, d]]) };
}

export const hyperTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung', y: 'erwerbstaetig' },
    kurz: 'Dieselbe Verteilung mit allen 200 Befragten: Hängt eine Weiterbildung mit der Erwerbstätigkeit zusammen? Der exakte Test von Fisher prüft das.',
    value: c => fisherFit(c).p,
    result: c => {
      const f = fisherFit(c), rest = f.n - f.row1;
      return {
        kurz: `Von den ${f.row1} Befragten mit Weiterbildung sind ${f.a} erwerbstätig; bei festen Randsummen wären ${num(f.expected)} zu erwarten. Gäbe es keinen Zusammenhang, käme eine so große Abweichung oder eine größere ${often(f.p)} Stichproben vor.`,
        fachlich: `Exakter Test von Fisher, zweiseitig: Vierfeldertafel ${f.a}, ${f.b}, ${f.c}, ${f.d}. Bei festen Randsummen ist die erste Zelle hypergeometrisch verteilt mit Erwartungswert ${num(f.expected)}; p ${pValue(f.p)}.`,
        zusatz: f.row1 > 0 && rest > 0
          ? `Erwerbstätig sind ${num(f.a / f.row1 * 100)} % mit und ${num(f.c / rest * 100)} % ohne Weiterbildung.`
          : 'Alle stehen jetzt in einer Zeile der Tafel; einen Vergleich gibt es nicht mehr.',
      };
    },
    voraussetzung: 'Der Test hält die Randsummen fest: wie viele eine Weiterbildung gemacht haben und wie viele erwerbstätig sind. Die Befragten sind unabhängig voneinander.',
    think: [
      {
        question: 'Weiterbildung wird umgepolt: 1 heißt jetzt keine Weiterbildung. Was passiert mit dem p-Wert von Fisher?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die beiden Zeilen der Tafel tauschen nur die Plätze. Die hypergeometrische Verteilung spiegelt sich mit, der zweiseitige p-Wert bleibt.',
        kurz: 'Umpolen ändert die Beschriftung, nicht den Zusammenhang.',
        tryIt: { label: 'Weiterbildung umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle hätten eine Weiterbildung gemacht. Was passiert mit dem p-Wert?',
        options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Dann gibt es nur noch eine Zeile, und bei festen Randsummen ist nur eine einzige Tafel möglich. Sie ist sicher: p = 1.',
        kurz: 'Ohne Vergleichsgruppe gibt es nichts zu testen.',
        tryIt: { label: 'alle auf Weiterbildung (1)', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 'fisher_test', variant: 0,
    tokens: {
      fisher_test: { sym: 'fisher_test()', term: 'Exakter Test von Fisher', kurz: 'Rechnet den exakten Test von Fisher für zwei Spalten mit Kategorien. Bei einer Vierfeldertafel nutzt er die hypergeometrische Verteilung.', fehler: 'Ohne zweite Spalte meldet mariposa: Argument `col` is missing, with no default.' },
    },
    outputMap: [
      { match: 'p', atlas: 'p-Wert', step: 4, explain: 'Gäbe es keinen Zusammenhang, käme eine so große Abweichung oder eine größere in etwa 44 von 100 Stichproben vor. Die Wahrscheinlichkeiten liefert die hypergeometrische Verteilung.' },
      { match: 'OR', atlas: 'Odds Ratio', explain: 'Das Chancenverhältnis: Mit Weiterbildung ist die Chance, erwerbstätig zu sein, etwa 1,3-mal so groß wie ohne. In Klammern steht das 95-%-Konfidenzintervall.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten in der Vierfeldertafel.' },
    ],
    check: {
      question: 'Welche Zahl kommt aus der hypergeometrischen Verteilung? Tippe sie an.', correct: 'p',
      wrong: {
        OR: 'Fast! Das Odds Ratio beschreibt die Stärke des Zusammenhangs. Aus der hypergeometrischen Verteilung kommt der p-Wert.',
        N: 'Fast! N zählt die Befragten. Aus der hypergeometrischen Verteilung kommt der p-Wert.',
      },
    },
  },
  next: {
    next: { id: 'fisher_test', why: 'Nutzt diese Verteilung, um eine Vierfeldertafel exakt zu prüfen.' },
    before: [
      { id: 'probability_mass', why: 'Jede mögliche Zahl von Treffern bekommt ihre eigene Wahrscheinlichkeit.' },
      { id: 'binomial_distribution', why: 'Dasselbe Zählen mit Zurücklegen, also mit festem p.' },
    ],
    after: [
      { id: 'crosstab', why: 'Die Vierfeldertafel, deren Zellen der Test von Fisher betrachtet.' },
    ],
    more: [
      { id: 'random_sampling', why: 'Bei Umfragen wird ohne Zurücklegen gezogen; bei großen Bevölkerungen spielt das kaum eine Rolle.' },
      { id: 'exact_asymptotic', why: 'Exakte Tests rechnen mit der Verteilung selbst statt mit einer Näherung.' },
    ],
  },
};
