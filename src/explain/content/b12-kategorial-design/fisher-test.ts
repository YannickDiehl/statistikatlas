// Begriffskarte „Fisher · exakter Test“: Weiterbildung und Erwerbstätigkeit im Lehrdatensatz (Vierfeldertafel 40 78 / 23 59),
// wie mariposa::fisher_test(row = weiterbildung, col = erwerbstaetig) 0.7.4. R-Referenzwerte: b12-kategorial-design.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { chiSquare } from '../../../tasks/kit/stats';
import { pchisq } from '../../../tasks/kit/dist';
import { dhyper, fisher2x2, fisherFromCell, fourfold, oddsRatio, often, pText } from './rechnen';

/** Randsummen der Tafel: 137 erwerbstätig, 63 nicht, 82 mit Weiterbildung; beobachtet 59 mit Weiterbildung und erwerbstätig. */
export const FISHER = { erwerbstaetig: 137, nicht: 63, mit: 82, ohne: 118, n: 200, k: 59, expected: 82 * 137 / 200, p: 0.4400503626, pChi: 0.381086138, or: 1.315496098, orLo: 0.712, orHi: 2.432 } as const;
const F = FISHER;

/** p wie fisher.test in R, wenn k der 82 Befragten mit Weiterbildung erwerbstätig sind (Ränder fest). */
export const pFisher = (k: number) => fisherFromCell(k, F.erwerbstaetig, F.nicht, F.mit);
/** Wahrscheinlichkeit genau dieser Tafel, wenn es keinen Zusammenhang gibt (dhyper in R). */
export const dFisher = (k: number) => dhyper(k, F.erwerbstaetig, F.nicht, F.mit);

export const fisherTest: ConceptCard = {
  concept: 'fisher_test',
  picture: 'b12-fisher',
  wofuer: 'Sind Befragte mit Weiterbildung häufiger erwerbstätig als die ohne? Der Chi-Quadrat-Test beantwortet das mit einer Näherung. Der exakte Test nach Fisher rechnet genau nach, auch wenn die Tabelle klein ist.',
  kurz: 'Der exakte Test nach Fisher prüft, ob zwei Merkmale einer Kreuztabelle zusammenhängen. Er geht alle Tabellen mit denselben Randsummen durch und braucht keine Näherung.',
  stellDirVor: {
    text: `Von den ${F.mit} Befragten mit Weiterbildung sind ${F.k} erwerbstätig, von den ${F.ohne} ohne Weiterbildung 78. Insgesamt sind ${F.erwerbstaetig} von ${F.n} erwerbstätig. Ohne Zusammenhang erwartest du unter den ${F.mit} etwa ${num(F.expected)} Erwerbstätige. Fisher meldet in R p = 0.440, der Chi-Quadrat-Test p = 0.381.`,
    figures: [
      { label: 'mit Weiterbildung erwerbstätig', value: `${F.k} von ${F.mit}` },
      { label: 'erwartet ohne Zusammenhang', value: num(F.expected) },
      { label: 'Odds Ratio', value: num(F.or) },
      { label: 'p-Wert', value: num(F.p) },
    ],
  },
  heisst: {
    fach: 'Ein exakter Test auf Unabhängigkeit in einer Kreuztabelle. Bei festen Randsummen folgt eine Zelle einer Vierfeldertafel der hypergeometrischen Verteilung; der p-Wert summiert die Wahrscheinlichkeiten aller Tabellen, die höchstens so wahrscheinlich sind wie die beobachtete.',
  },
  bausteine: [
    {
      title: 'Die Ränder festhalten',
      was: 'Wir halten fest, wie viele Befragte eine Weiterbildung haben und wie viele erwerbstätig sind. Diese Randsummen bleiben in allen Gedankenspielen gleich.',
      rechnung: `${F.mit} mit Weiterbildung, ${F.ohne} ohne; ${F.erwerbstaetig} erwerbstätig, ${F.nicht} nicht; zusammen ${F.n}.`,
      warum: 'Mit festen Rändern legt eine einzige Zelle die ganze Tabelle fest. So lassen sich alle möglichen Tabellen aufzählen.',
      acht: 'Fest sind nur die Ränder, nicht die Zellen. Gefragt wird, wie sich 137 Erwerbstätige auf die beiden Gruppen verteilen könnten.',
      concept: 'crosstab',
    },
    {
      title: 'Alle möglichen Tabellen durchgehen',
      was: 'Wie viele der 82 mit Weiterbildung wären erwerbstätig, wenn der Zufall die 137 Erwerbstätigen verteilte? Die hypergeometrische Verteilung sagt es für jede Zahl von 19 bis 82.',
      rechnung: `Am häufigsten wären Zahlen um 56. Genau ${F.k} kämen in etwa ${Math.round(dFisher(F.k) * 1000)} von 1.000 Stichproben vor.`,
      warum: 'Ohne Zusammenhang hat jede Verteilung der Erwerbstätigen auf die Befragten dieselbe Chance. Daraus folgt, wie oft jede Tabelle vorkäme.',
      acht: 'Das ist dieselbe Rechnung wie beim Ziehen ohne Zurücklegen: Wer einmal gezogen ist, kann nicht noch einmal gezogen werden.',
      concept: 'hypergeometric_distribution',
    },
    {
      title: 'Die ungewöhnlichen Tabellen zusammenzählen',
      was: 'Wir zählen alle Tabellen zusammen, die höchstens so wahrscheinlich sind wie die beobachtete. Das ergibt den p-Wert.',
      rechnung: `${pText(F.p)}: Gäbe es keinen Zusammenhang, käme eine so ungewöhnliche Tabelle ${often(F.p)} Stichproben vor.`,
      warum: 'Ungewöhnlich heißt hier: selten, wenn es keinen Zusammenhang gibt. Gezählt werden Abweichungen in beide Richtungen.',
      acht: 'Exakt heißt nicht, dass Fisher mehr sagt. Auch er sagt nur, wie überraschend die Tabelle ohne Zusammenhang wäre, nicht wie stark der Zusammenhang ist.',
      concept: 'p_value',
    },
  ],
  ausprobieren: [
    {
      question: 'Statt 59 wären 64 der 82 mit Weiterbildung erwerbstätig. Was passiert mit p?',
      options: ['p wird kleiner', 'p bleibt gleich', 'p wird größer'], correct: 0, step: 3,
      explain: `64 liegt weiter von den erwarteten ${num(F.expected)} weg. So eine Tabelle käme ohne Zusammenhang seltener vor: p fällt auf etwa ${num(pFisher(64))}. Schieb den Regler oben auf 64.`,
      kurz: 'Weiter weg von der Erwartung, kleinerer p-Wert.',
    },
    {
      question: 'Wann lohnt sich Fisher statt Chi-Quadrat besonders?',
      options: ['bei großen Tabellen mit vielen Befragten', 'wenn erwartete Zellhäufigkeiten unter 5 liegen', 'nie, beide liefern immer dasselbe'], correct: 1, step: 3,
      explain: 'Die χ²-Verteilung ist eine Näherung, die bei kleinen erwarteten Zahlen ungenau wird. Fisher rechnet exakt und passt deshalb gerade zu kleinen Tabellen.',
      kurz: 'Kleine Zellen: Fisher.',
    },
    {
      question: 'Du vertauschst die Spalten: erwerbstätig links, nicht erwerbstätig rechts. Was passiert mit p?',
      options: ['p bleibt gleich', 'p wird kleiner', 'p wird größer'], correct: 0, step: 2,
      explain: `Es sind dieselben Tabellen, nur anders angeordnet. Das Odds Ratio wird zu seinem Kehrwert, aus ${num(F.or)} wird ${num(1 / F.or)}; der p-Wert bleibt gleich.`,
      kurz: 'Umordnen ändert die Richtung, nicht den Test.',
    },
  ],
  regler: {
    label: 'Wie viele der 82 Befragten mit Weiterbildung sind erwerbstätig?',
    min: 40, max: 72, step: 1, initial: F.k,
    format: v => `${v} von 82`,
    describe: v => {
      const p = pFisher(v), lead = `Dann wären von den Befragten mit Weiterbildung ${pct(v / F.mit)} erwerbstätig, von denen ohne ${pct((F.erwerbstaetig - v) / F.ohne)}.`;
      if (p >= 0.995) return `${lead} Das ist fast genau, was ohne Zusammenhang zu erwarten wäre (p = 1).`;
      return `${lead} Gäbe es keinen Zusammenhang, käme eine so ungewöhnliche Tabelle ${often(p)} Stichproben vor (${pText(p)}).`;
    },
  },
  check: {
    question: 'Fisher meldet für Weiterbildung und Erwerbstätigkeit p = 0.440. Was heißt das?',
    options: [
      'Die beiden Merkmale hängen mit 44 % Wahrscheinlichkeit zusammen.',
      'Gäbe es keinen Zusammenhang, käme eine so ungewöhnliche Tabelle in etwa 44 von 100 Stichproben vor.',
      'Es gibt sicher keinen Zusammenhang.',
      'Der Zusammenhang ist mittelstark.',
    ],
    correct: 1,
    right: 'Genau. p rechnet unter der Annahme ohne Zusammenhang und fragt, wie selten so eine Tabelle dann wäre.',
    diagnose: {
      0: 'Fast! p rechnet unter der Annahme, dass es keinen Zusammenhang gibt. Wie wahrscheinlich ein Zusammenhang ist, sagt p nicht.',
      2: 'Fast! Ein großer p-Wert heißt nur: Die Tabelle passt gut zur Unabhängigkeit. Ein kleiner Zusammenhang kann trotzdem bestehen.',
      3: 'Fast! p sagt nichts über die Stärke. Die zeigt das Odds Ratio, hier 1,32.',
    },
  },
  fuerDich: 'Wenn eine Kreuztabelle kleine Zellen hat, etwa bei seltenen Gruppen in einer Befragung, nimm den exakten Test nach Fisher. R rechnet ihn in Sekunden, auch dort, wo der Chi-Quadrat-Test warnt.',
  genau: {
    kurz: 'Fisher hält die Randsummen fest und rechnet exakt. Das Odds Ratio meldet mariposa für die Tabelle selbst.',
    paragraphs: [
      'Bei festen Rändern folgt die Zelle „mit Weiterbildung und erwerbstätig“ der hypergeometrischen Verteilung mit 137 Erwerbstätigen, 63 Nicht-Erwerbstätigen und 82 Gezogenen. Zweiseitig zählt R alle Tabellen, deren Wahrscheinlichkeit höchstens so groß ist wie die der beobachteten.',
      `mariposa meldet das Odds Ratio der Tabelle, (40 · 59) / (78 · 23) ≈ ${num(F.or)}, mit einem 95-%-Intervall von ${num(F.orLo)} bis ${num(F.orHi)}. fisher.test() in R schätzt es anders und kommt auf 1,31.`,
      'Für große Tabellen mit mehr als zwei Zeilen und Spalten kann die exakte Rechnung zu aufwendig werden. mariposa wechselt dann zu einer Simulation.',
      'Der Test zählt Personen. Gewichtete Zellzahlen rundet mariposa deshalb auf ganze Zahlen.',
    ],
  },
};

/** Vierfeldertafel der Auswertung (Zeilen x, Spalten y), Fisher-p, Odds Ratio und χ²-p zum Vergleich; null, wenn eine Spalte nur eine Antwort hat. */
export function fisherSample(c: SampleCtx) {
  const t = fourfold(c.rows, c.columns.x?.[0] ?? 'weiterbildung', c.columns.y?.[0] ?? 'erwerbstaetig');
  const r = [t[0][0] + t[0][1], t[1][0] + t[1][1]], s = [t[0][0] + t[1][0], t[0][1] + t[1][1]];
  if (r.some(v => v === 0) || s.some(v => v === 0)) return null;
  const chi = chiSquare(t);
  return { t, r, p: fisher2x2(t), or: oddsRatio(t), pChi: pchisq(chi.chi2, 1, false) };
}

export const fisherTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'weiterbildung', y: 'erwerbstaetig' },
    kurz: 'Derselbe Test mit allen 200 Befragten, so wie R ihn rechnet: Weiterbildung und Erwerbstätigkeit.',
    value: c => fisherSample(c)?.p ?? null,
    result: c => {
      const f = fisherSample(c);
      if (!f) return { kurz: 'Eine der beiden Spalten hat nur noch eine Antwort. Dann gibt es nichts zu vergleichen, und mariposa rechnet den Test nicht.', fachlich: 'fisher_test() meldet dann, dass eine Spalte weniger als zwei beobachtete Kategorien hat.' };
      return {
        kurz: `Von den ${f.r[1]} Befragten mit Weiterbildung sind ${pct(f.t[1][1] / f.r[1])} erwerbstätig, von den ${f.r[0]} ohne ${pct(f.t[0][1] / f.r[0])}. Gäbe es keinen Zusammenhang, käme eine so ungewöhnliche Tabelle ${often(f.p)} Stichproben vor (${pText(f.p)}).`,
        fachlich: `Exakter Test nach Fisher, zweiseitig: ${pText(f.p)}; Odds Ratio ${f.or === null ? 'nicht definiert' : `≈ ${num(f.or)}`}.`,
        zusatz: `Zum Vergleich: Der Chi-Quadrat-Test ohne Korrektur kommt auf ${pText(f.pChi)}.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an und hält die Randsummen fest. Er braucht keine Mindestgröße der Zellen.',
    think: [
      {
        question: 'Aus jedem Ja bei der Erwerbstätigkeit wird ein Nein und umgekehrt. Was passiert mit p?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
        explain: 'Die beiden Spalten der Tafel tauschen ihre Plätze. Es sind dieselben möglichen Tabellen mit denselben Wahrscheinlichkeiten, also bleibt p gleich.',
        kurz: 'Umpolen ändert nichts an der Frage nach dem Zusammenhang.',
        tryIt: { label: 'Erwerbstätigkeit umpolen', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
      {
        question: 'Aus jedem Ja bei der Weiterbildung wird ein Nein und umgekehrt. Was passiert mit der Stärke des Zusammenhangs?', options: ['bleibt gleich, nur die Richtung dreht sich', 'wird stärker', 'wird schwächer'], correct: 0,
        explain: 'Das Odds Ratio wird zu seinem Kehrwert, etwa 1,32 zu 0,76. Beides heißt: Die Chancen unterscheiden sich um denselben Faktor, nur in die andere Richtung.',
        kurz: 'Ein Odds Ratio von 2 und eines von 0,5 sind gleich stark.',
        tryIt: { label: 'Weiterbildung umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same', measure: c => { const or = fisherSample(c)?.or; return or ? Math.abs(Math.log(or)) : null; } },
      },
    ],
  },
  r: {
    entry: 'fisher_test', variant: 0,
    tokens: {
      fisher_test: { sym: 'fisher_test()', term: 'Exakter Test nach Fisher', kurz: 'Prüft exakt, ob zwei kategoriale Spalten zusammenhängen. Meldet p, bei vier Feldern das Odds Ratio mit Intervall, und N.', fehler: 'Mit einer Spalte voller Kommazahlen meldet mariposa: `row` variable `lernzeit` appears to be continuous. Fisher\'s exact test requires categorical variables.' },
      row: { sym: 'row =', term: 'Zeilen der Kreuztabelle', kurz: 'Die Spalte, deren Antworten die Zeilen der Tafel bilden, hier die Weiterbildung.', fehler: 'Vertauschst du row und col, bleiben p und Odds Ratio gleich; nur die Tafel steht gekippt da.' },
      col: { sym: 'col =', term: 'Spalten der Kreuztabelle', kurz: 'Die Spalte, deren Antworten die Spalten der Tafel bilden, hier die Erwerbstätigkeit.', fehler: 'Ohne col meldet mariposa: Argument `col` is missing, with no default.' },
    },
    outputMap: [
      { match: 'p', atlas: 'p-Wert', step: 3, explain: 'Gäbe es keinen Zusammenhang, käme eine so ungewöhnliche Tabelle in etwa 44 von 100 Stichproben vor.' },
      { match: 'OR', atlas: 'Odds Ratio', explain: 'OR heißt odds ratio, auf Deutsch Chancenverhältnis: (40 · 59) / (78 · 23) ≈ 1,32. In eckigen Klammern steht das 95-%-Intervall.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten mit Angaben in beiden Spalten.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist der p-Wert? Tippe sie an.', correct: 'p',
      wrong: { OR: 'Fast! Das ist das Odds Ratio. Es sagt, wie stark der Zusammenhang ist; der p-Wert steht hinter p =.', N: 'Fast! N ist die Zahl der Befragten. Der p-Wert steht hinter p =.' },
    },
  },
  next: {
    next: { id: 'mcnemar_test', why: 'Auch eine Vierfeldertafel, aber mit denselben Personen zu zwei Zeitpunkten.' },
    before: [
      { id: 'crosstab', why: 'Die Tabelle, deren Randsummen der Test festhält.' },
      { id: 'hypergeometric_distribution', why: 'Sagt, wie wahrscheinlich jede Tabelle mit diesen Rändern ist.' },
      { id: 'chi_square', why: 'Die Näherung, die Fisher bei kleinen Zahlen ersetzt.' },
    ],
    after: [{ id: 'exact_asymptotic', why: 'Wann exakte Tests und wann Näherungen passen.' }],
    more: [
      { id: 'logit', why: 'Odds und Odds Ratio, die Fisher bei vier Feldern meldet.' },
      { id: 'phi', why: 'Misst die Stärke des Zusammenhangs in einer Vierfeldertafel.' },
    ],
  },
};
