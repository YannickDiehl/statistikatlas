// Reiter der Quadratsumme (`ss`). Die Erklärung bleibt die Schrittkarte „Alles zusammenzählen“ der Werkstatt Streuung
// (Schritt 4, src/explain/registry.ts); hier stehen nur die Reiter. Zahlen in R nachgerechnet, siehe b04-umformen.test.ts.
import type { ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { columnStats } from './shared';

/** Quadratsumme der Lernzeit für die aktuellen Daten, mit dem größten Beitrag und dem Anteil der 20 größten. */
export function ssOf(c: SampleCtx) {
  const st = columnStats(c, c.columns.x?.[0] ?? 'lernzeit');
  let big = 0;
  st.sq.forEach((q, i) => { if (q > st.sq[big]) big = i; });
  const top = [...st.sq].sort((a, b) => b - a).slice(0, Math.round(st.n / 10)).reduce((a, b) => a + b, 0);
  return { ...st, big, topShare: st.ss > 0 ? top / st.ss : 0, bigShare: st.ss > 0 ? st.sq[big] / st.ss : 0, tenth: Math.round(st.n / 10) };
}

export const tabsSs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Summe mit allen 200 Befragten: jede Lernzeit minus die Mitte, quadriert, alles zusammengezählt.',
    value: c => ssOf(c).ss,
    result: c => {
      const s = ssOf(c), who = c.rows[s.big]?.id ?? '';
      if (s.ss < 1e-9) return { kurz: 'Alle haben dieselbe Lernzeit. Jeder Abstand zur Mitte ist 0, also auch die Quadratsumme.', fachlich: 'SSₓ = 0: Ohne Streuung gibt es keine quadrierten Abweichungen.' };
      return {
        kurz: `Die ${s.n} quadrierten Abstände zur Mitte ergeben zusammen ${num(s.ss)} h². Allein ${who} mit ${num(s.xs[s.big])} Stunden steuert ${num(s.sq[s.big], 1)} h² bei, ${pct(s.bigShare, 1)} der Summe.`,
        fachlich: `SSₓ = Σ(xᵢ − x̄)² ≈ ${num(s.ss)} h² bei n = ${s.n} und x̄ ≈ ${num(s.mean)} h. Geteilt durch n − 1 = ${s.n - 1} ergibt sich die Varianz s² ≈ ${num(s.variance)} h².`,
        zusatz: `Die ${s.tenth} Befragten mit den größten Abständen liefern zusammen ${pct(s.topShare, 1)} der Quadratsumme, obwohl sie nur ein Zehntel sind.`,
      };
    },
    voraussetzung: 'Die Quadratsumme wächst mit jeder weiteren Person. Vergleichbar wird sie erst geteilt durch n − 1, als Varianz.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was macht die Quadratsumme?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Die Mitte wandert um eine Stunde mit. Jeder Abstand zur Mitte bleibt gleich, also auch jedes Quadrat und ihre Summe.',
        kurz: 'Verschieben ändert die Lage, nicht die Streuung.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht die Quadratsumme?', options: ['verdoppelt sich', 'vervierfacht sich', 'bleibt gleich'], correct: 1,
        explain: 'Jeder Abstand verdoppelt sich, jedes Quadrat wird viermal so groß: (2 · 3)² = 36 = 4 · 9. Also vervierfacht sich auch die Summe.',
        kurz: 'Doppelte Abstände, vierfache Quadrate.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 4 },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was macht die Quadratsumme?', options: ['bleibt fast gleich', 'steigt', 'sinkt'], correct: 1,
        explain: 'Ihr Abstand zur Mitte wird groß, und das Quadrat macht ihn riesig. In den Ausgangsdaten wächst die Quadratsumme dadurch je nach Person um 924 bis 1.035 h², also um fast die Hälfte.',
        kurz: 'Wer weit weg ist, zählt im Quadrat viel mehr.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 'variance', variant: 0, live: { fn: 'describe', show: ['mean', 'var'] },
    tokens: {
      '"var"': { sym: '"var"', term: 'Korrigierte Stichprobenvarianz', kurz: '"var" steht für variance, die Varianz s². Mal (N − 1) genommen ergibt sie die Quadratsumme.', fehler: 'Groß geschrieben kennt describe() den Namen nicht: show = "VAR" ergibt Unknown `show` value. Richtig ist "var".' },
    },
    outputMap: [
      { match: 'Variance', atlas: 's², die Quadratsumme geteilt durch n − 1', explain: 'R zeigt die Quadratsumme nicht direkt. Variance mal (N − 1) ergibt sie wieder.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten. Mit N − 1 nimmst du die Varianz mal, um zur Quadratsumme zurückzukommen.' },
      { match: 'Mean', atlas: 'x̄', explain: 'Die Mitte, von der aus jeder Abstand gemessen und dann quadriert wird.' },
    ],
    check: {
      question: 'Aus welcher Zahl der Ausgabe bekommst du die Quadratsumme, wenn du sie mal (N − 1) nimmst? Tippe sie an.', correct: 'Variance',
      wrong: {
        Mean: 'Fast! Das ist die Mitte. Die Quadratsumme steckt in der Varianz: Variance mal (N − 1).',
        N: 'Fast! N brauchst du für das N − 1. Malgenommen wird aber die Varianz unter Variance.',
        Missing: 'Fast! Missing zählt fehlende Antworten. Die Quadratsumme steckt in Variance.',
      },
    },
  },
  next: {
    next: { id: 'variance', why: 'Geteilt durch n − 1 wird aus der Summe ein Durchschnitt, der nicht mehr mit der Zahl der Befragten wächst.' },
    before: [
      { id: 'squared_deviation', why: 'Die einzelnen Quadrate, die hier zusammengezählt werden.' },
      { id: 'mean', why: 'Die Mitte, von der aus jeder Abstand gemessen wird.' },
    ],
    after: [
      { id: 'group_variation', why: 'Zerlegt die Quadratsumme in Unterschiede zwischen und innerhalb von Gruppen.' },
      { id: 'residuals', why: 'Die Regression wählt die Gerade mit der kleinsten Quadratsumme der Residuen.' },
      { id: 'explained_variance', why: 'Vergleicht die Quadratsumme der Residuen mit der gesamten Quadratsumme.' },
    ],
    more: [
      { id: 'oneway_anova', why: 'Prüft mit den beiden Teilen der Quadratsumme, ob sich Gruppenmittelwerte unterscheiden.' },
    ],
  },
};
