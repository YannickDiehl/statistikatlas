// Begriffskarte „Paarweiser Wilcoxon“ (B11): Wissenstest zu drei Messzeitpunkten im Lehrdatensatz, ein Wilcoxon-Test je
// Paar von Zeitpunkten und Holm-Korrektur wie mariposa::pairwise_wilcoxon(p_adjust = "holm"). Zahlen aus R in b11-rangtests.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { columnsOf, pairwiseWilcoxon } from './rank';
import { pText } from './words';

const ORD = ['ersten', 'zweiten', 'dritten'] as const;
/** Schwelle nach Bonferroni bei k Zeitpunkten: α geteilt durch die Zahl der Paare. */
export const bonferroniFor = (k: number) => { const g = Math.round(k), m = g * (g - 1) / 2; return { k: g, m, cut: 0.05 / m }; };

export const pairwiseWilcoxonCard: ConceptCard = {
  concept: 'pairwise_wilcoxon',
  wofuer: 'Im Lehrdatensatz lösen die Befragten zu drei Messzeitpunkten unterschiedlich viele Aufgaben im Wissenstest. Gäbe es keine Unterschiede zwischen den Zeitpunkten, wäre ein so großes Q nach Friedman sehr überraschend (p < 0,001). Aber zwischen welchen Zeitpunkten liegt der Unterschied?',
  kurz: 'Der paarweise Wilcoxon-Test vergleicht nach Friedman jedes Paar von Messzeitpunkten mit dem Wilcoxon-Test für verbundene Stichproben. Die p-Werte werden für die Zahl der Vergleiche korrigiert.',
  stellDirVor: {
    text: 'Vom ersten zum zweiten Messzeitpunkt verbessern sich 115 Befragte, 53 werden schlechter. Vom zweiten zum dritten verbessern sich 108, und 65 werden schlechter: Der Schritt ist kleiner, r ≈ 0,29 statt 0,41. Drei Zeitpunkte ergeben drei Paare, und nach der Holm-Korrektur liegen die p-Werte aller drei unter α = 0,05.',
    figures: [
      { label: 'Paare', value: '3' },
      { label: 'erster gegen zweiten', value: 'r ≈ 0,41' },
      { label: 'zweiter gegen dritten', value: 'r ≈ 0,29' },
      { label: 'erster gegen dritten', value: 'r ≈ 0,64' },
    ],
  },
  heisst: {
    sym: 'z', say: 'z',
    fach: 'Für jedes Paar von Messungen rechnet der paarweise Wilcoxon-Test den Vorzeichen-Rang-Test mit d = zweite minus erste Messung und z aus der kleineren Rangsumme. Die p-Werte werden für die Familie aller Paare korrigiert, hier nach Holm.',
  },
  bausteine: [
    {
      title: 'Alle Paare von Zeitpunkten bilden',
      was: 'Drei Zeitpunkte ergeben 3 · 2 / 2 = 3 Paare: erster gegen zweiten, erster gegen dritten und zweiter gegen dritten.',
      warum: 'Friedman sagt nur, dass sich irgendwann etwas verändert. Erst die Paare zeigen, zwischen welchen Zeitpunkten.',
      acht: 'Mit mehr Zeitpunkten wächst die Zahl der Paare schnell: Bei fünf Zeitpunkten sind es schon zehn.',
      concept: 'multiplicity',
    },
    {
      title: 'Jedes Paar mit dem Wilcoxon-Test prüfen',
      was: 'Für jedes Paar bildet der Test je Person die Differenz, ordnet die Beträge und vergleicht die Rangsummen. Das ist der Wilcoxon-Test, nur dreimal.',
      rechnung: 'Erster gegen zweiten: z ≈ −5,36. Erster gegen dritten: z ≈ −8,54. Zweiter gegen dritten: z ≈ −3,76.',
      warum: 'Jede Person bleibt ihr eigener Vergleich, auch im Paarvergleich. Unterschiede zwischen den Personen fallen heraus.',
      acht: 'Anders als bei Dunn wird für jedes Paar neu gerechnet, mit den Differenzen genau dieser beiden Messungen.',
      concept: 'wilcoxon_test',
    },
    {
      title: 'Die p-Werte nach Holm korrigieren',
      was: 'Holm macht kleine p-Werte größer, damit für alle drei Paare zusammen höchstens α gilt. Danach vergleichst du wie gewohnt mit α.',
      rechnung: 'Holm sortiert die p-Werte: das kleinste mal 3, das mittlere mal 2, das größte mal 1. Hier liegen alle drei schon vorher unter 0,001 und bleiben auch danach darunter.',
      warum: 'Ohne Korrektur stiege die Wahrscheinlichkeit, irgendwo einen Unterschied zu melden, den es nicht gibt.',
      acht: 'Ohne Angabe korrigiert pairwise_wilcoxon() nach Bonferroni, also jedes p mal 3. Holm ist nie strenger und oft milder.',
      concept: 'alpha_level',
    },
  ],
  ausprobieren: [
    {
      question: 'Wie viele Paarvergleiche brauchst du bei vier Messzeitpunkten?', options: ['4', '6', '12'], correct: 1, step: 1,
      explain: 'Jeder Zeitpunkt wird mit jedem anderen verglichen, jedes Paar einmal: 4 · 3 / 2 = 6. Stell den Regler auf 4.',
      kurz: 'k Zeitpunkte ergeben k · (k − 1) / 2 Paare.',
    },
    {
      question: 'Warum rechnest du nicht drei Wilcoxon-Tests ohne Korrektur?', options: ['weil dann eher irgendwo ein Zufallsfund auftaucht', 'weil der Wilcoxon-Test nur einmal erlaubt ist', 'weil die Unterschiede dann kleiner werden'], correct: 0, step: 3,
      explain: 'Jeder Test gibt dem Zufall eine neue Gelegenheit. Die Korrektur sorgt dafür, dass für alle drei Paare zusammen höchstens α gilt.',
      kurz: 'Mehr Tests, mehr Gelegenheiten für Zufallsfunde.',
    },
    {
      question: 'Erster gegen zweiten Zeitpunkt: z ≈ −5,36. Heißt das, die Befragten sind schlechter geworden?', options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'z ist bei mariposa nie positiv, es wird aus der kleineren Rangsumme gerechnet. Die Richtung zeigt die Spalte Based on in summary(): negative heißt, die zweite Messung ist eher höher.',
      kurz: 'Die Richtung steht nicht im Vorzeichen von z.',
    },
  ],
  regler: {
    label: 'Wie viele Messzeitpunkte gibt es?',
    min: 3, max: 8, step: 1, initial: 3,
    format: v => `${Math.round(v)} Zeitpunkte`,
    describe: v => {
      const b = bonferroniFor(v);
      return `Bei ${b.k} Zeitpunkten gibt es ${b.m} Paare. Nach Bonferroni muss das p eines Paars dann unter 0,05 / ${b.m} ≈ ${num(b.cut, b.cut < 0.01 ? 4 : 3)} liegen; Holm verlangt das nur vom kleinsten.`;
    },
  },
  check: {
    question: 'Der paarweise Wilcoxon-Test meldet für alle drei Paare korrigierte p-Werte unter 0,001. Was heißt das?',
    options: [
      'Alle drei Paare von Zeitpunkten unterscheiden sich auffällig, auch im Vergleich aller drei zusammen.',
      'Die Befragten verbessern sich von Zeitpunkt zu Zeitpunkt um gleich viel.',
      'Die Unterschiede sind groß und wichtig.',
      'Ohne Korrektur wären weniger Paare auffällig.',
    ],
    correct: 0,
    right: 'Genau. Auch nach der Korrektur für drei Vergleiche liegt das p jedes Paars unter α.',
    diagnose: {
      1: 'Fast! p sagt nichts über die Größe. Die Schritte sind verschieden groß: r ≈ 0,41 vom ersten zum zweiten, r ≈ 0,29 vom zweiten zum dritten Zeitpunkt.',
      2: 'Fast! Bei 200 Befragten werden auch kleine Unterschiede auffällig. Wie groß sie sind, zeigt die Effektgröße r.',
      3: 'Fast! Andersherum: Ohne Korrektur sind die p-Werte kleiner, es könnten also höchstens mehr Paare auffallen.',
    },
  },
  fuerDich: 'Bei Messungen derselben Personen zu mehreren Zeitpunkten gilt: erst der Gesamttest, dann die korrigierten Paare. So erfährst du, wann sich etwas verändert hat, ohne den Zufall zu überschätzen.',
  genau: {
    kurz: 'mariposa testet jedes Paar zweiseitig mit der Normalverteilung, wie beim Wilcoxon-Test. Fehlende Werte werden paarweise ausgeschlossen.',
    paragraphs: [
      'Jedes Paar nutzt alle Personen mit Werten in beiden Messungen. N kann deshalb größer sein als beim Friedman-Test, der nur Personen mit allen Messungen nimmt.',
      'Ohne Angabe korrigiert pairwise_wilcoxon() nach Bonferroni. Holm hält dieselbe familienweise Fehlerrate ein, ist aber nie strenger.',
      'Die Effektgröße je Paar ist r = |z| / √n wie beim Wilcoxon-Test, mit n ohne Nulldifferenzen. Für zweiten gegen dritten Zeitpunkt ist r ≈ 0,29, nach der Faustregel klein; den Gesamteffekt zeigt Kendalls W beim Friedman-Test.',
    ],
  },
};

// Reiter -------------------------------------------------------------------------------

const TIMES = (c: SampleCtx) => [c.columns.x?.[0] ?? 'wissenstest', c.columns.y?.[0] ?? 'wissenstest_t2', c.columns.z?.[0] ?? 'wissenstest_t3'];
/** Paarweiser Wilcoxon auf den aktuellen 200 Befragten (Paare 1–2, 1–3, 2–3). */
export const pwSample = (c: SampleCtx) => pairwiseWilcoxon(columnsOf(c.rows, TIMES(c)));
/** Befragte, die sich zwischen den Zeitpunkten i und j verbessern. */
export const pwImproved = (c: SampleCtx, i: number, j: number) => pwSample(c).find(p => p.i === i && p.j === j)?.test.nPos ?? null;

export const pairwiseWilcoxonTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'wissenstest', y: 'wissenstest_t2', z: 'wissenstest_t3' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Zwischen welchen der drei Messzeitpunkte unterscheidet sich die Zahl der gelösten Aufgaben?',
    value: c => pwSample(c).filter(p => p.pAdj < 0.05).length,
    result: c => {
      const ps = pwSample(c), hits = ps.filter(p => p.pAdj < 0.05);
      const weakest = ps.reduce((a, p) => Math.abs(p.z) < Math.abs(a.z) ? p : a);
      return {
        kurz: `Nach der Holm-Korrektur ${hits.length === 1 ? 'ist 1 der 3 Paare' : `sind ${hits.length} der 3 Paare`} bei α = 0,05 auffällig. Den kleinsten Unterschied gibt es zwischen dem ${ORD[weakest.i]} und dem ${ORD[weakest.j]} Messzeitpunkt (z ≈ ${num(weakest.z)}, r ≈ ${num(weakest.test.r)}, ${pText(weakest.pAdj)}).`,
        fachlich: `Paarweiser Wilcoxon-Test nach Friedman, Holm-Korrektur, je Paar zweite minus erste Messung: ${ps.map(p => `${p.i + 1} gegen ${p.j + 1} z ≈ ${num(p.z)}, ${pText(p.pAdj)}`).join('; ')}.`,
        zusatz: ps.map(p => `${p.i + 1} gegen ${p.j + 1}: ${p.test.nPos} besser, ${p.test.nNeg} schlechter`).join('; ') + '.',
      };
    },
    voraussetzung: 'Alle Messungen stammen von denselben Personen, und die Personen sind unabhängig voneinander. Die Veränderungen lassen sich der Größe nach ordnen.',
    think: [
      {
        question: 'Angenommen, beim ersten Test hätten alle eine Aufgabe mehr gelöst. Was passiert mit der Zahl der Befragten, die sich vom ersten zum dritten Zeitpunkt verbessern?', options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 0,
        explain: 'Jede Differenz dritter minus erster Test schrumpft um eine Aufgabe. Wer sich um genau eine verbessert hatte, zählt jetzt als gleich geblieben: 101 statt 145 Verbesserte.',
        kurz: 'Ein Paarvergleich sieht nur die Differenz seiner beiden Messungen.',
        tryIt: { label: 'erster Test eine Aufgabe mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'down', measure: c => pwImproved(c, 0, 2) },
      },
      {
        question: 'Angenommen, beim zweiten Test hätten alle eine Aufgabe weniger gelöst. Was passiert mit der Zahl der Befragten, die sich vom zweiten zum dritten Zeitpunkt verbessern?', options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 2,
        explain: 'Jede Differenz dritter minus zweiter Test wächst um eine Aufgabe. Wer vorher gleich viele gelöst hatte, zählt jetzt als verbessert: 135 statt 108.',
        kurz: 'Ändert sich eine Messung, ändern sich alle Paare mit ihr.',
        tryIt: { label: 'zweiter Test eine Aufgabe weniger', op: 'shift', column: 'y', value: -1 },
        expect: { change: 'up', measure: c => pwImproved(c, 1, 2) },
      },
    ],
  },
  r: {
    entry: 'pairwise_wilcoxon', variant: 0,
    tokens: {
      pairwise_wilcoxon: { sym: 'pairwise_wilcoxon()', term: 'Paarweiser Wilcoxon', kurz: 'Vergleicht nach friedman_test() jedes Paar von Messungen mit dem Wilcoxon-Test und korrigiert die p-Werte. summary() zeigt z und p je Paar.', fehler: 'pairwise_wilcoxon() braucht das Ergebnis von friedman_test() davor. Direkt auf die Daten angewandt meldet mariposa: `pairwise_wilcoxon()` is not available for objects of class <tbl_df/tbl/data.frame>.' },
      p_adjust: { sym: 'p_adjust =', term: 'Mehrere Vergleiche', kurz: 'Wählt die Korrektur der p-Werte. Ohne Angabe nimmt mariposa "bonferroni".', fehler: 'Nur die vorgesehenen Namen funktionieren. p_adjust = "holmes" ergibt: `p_adjust` must be one of "bonferroni", "holm", … ✖ Got "holmes".' },
      '"holm"': { sym: '"holm"', term: 'Holm-Korrektur', kurz: 'Das kleinste p mal der Zahl der Vergleiche, das nächste mal eins weniger und so weiter, nie kleiner als das vorige.', fehler: 'Holm ändert nur die p-Werte. Die z-Werte der Paare bleiben dieselben.' },
    },
    outputMap: [
      { match: '(Holm)', atlas: 'Holm-Korrektur', step: 3, explain: 'Die p-Werte sind für die drei Vergleiche korrigiert, wie im Aufruf mit p_adjust = "holm" verlangt.' },
      { match: '3 comparisons', atlas: 'drei Paare', step: 1, explain: 'Drei Messzeitpunkte ergeben 3 · 2 / 2 = 3 Paare.' },
      { match: '3 significant', atlas: 'auffällige Paare', step: 3, explain: 'Bei allen drei Paaren liegt das p nach der Korrektur unter α = 0,05.' },
      { match: 'p < .05', atlas: 'Signifikanzniveau α', explain: 'Die Schwelle α = 0,05 für die korrigierten p-Werte.' },
    ],
    check: {
      question: 'Wie viele Paare sind nach der Korrektur auffällig? Tippe es an.', correct: '3 significant',
      wrong: { '3 comparisons': 'Fast! Das ist die Zahl aller Paare. Hier ist sie zufällig gleich groß; gefragt ist die zweite Zahl.', 'p < .05': 'Fast! Das ist die Schwelle α. Die Zahl der auffälligen Paare steht davor.', '(Holm)': 'Fast! Das ist die Korrektur. Die Zahl der auffälligen Paare steht in der zweiten Zeile.' },
    },
  },
  next: {
    next: { id: 'multiplicity', why: 'Der gemeinsame Gedanke hinter Holm, Bonferroni, Tukey und Dunn: viele Vergleiche, eine Fehlerkontrolle.' },
    before: [
      { id: 'friedman_test', why: 'Zeigt zuerst, ob sich die Zeitpunkte überhaupt unterscheiden.' },
      { id: 'wilcoxon_test', why: 'Der Test, der für jedes Paar von Zeitpunkten gerechnet wird.' },
    ],
    after: [
      { id: 'effect', why: 'r = |z| / √n je Paar sagt, wie groß eine Veränderung ist.' },
    ],
    more: [
      { id: 'dunn_test', why: 'Die Paarvergleiche nach Kruskal–Wallis, für unabhängige Gruppen statt derselben Personen.' },
      { id: 'paired_design', why: 'Alle Paare vergleichen Messungen derselben Personen.' },
    ],
  },
};
