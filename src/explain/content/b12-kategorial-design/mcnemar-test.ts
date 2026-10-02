// Formel als Satz „McNemar“: Kurszuversicht derselben 200 Befragten vorher und nachher (Lehrdatensatz, kurs_vor und kurs_nach),
// wie mariposa::mcnemar_test(kurs_vor, kurs_nach, correct = TRUE) 0.7.4. R-Referenzwerte: b12-kategorial-design.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { num, paren, close, count } from '../../format';
import { binomTestHalf, fourfold, mcnemar, often, pText, wer } from './rechnen';

/** Gegenrichtung im Satz: „9 andersherum“, „niemand andersherum“. */
const andere = (k: number) => k === 0 ? 'niemand' : String(k);

/** Lehrdatensatz: 46 wechseln von Nein zu Ja, 9 von Ja zu Nein; vorher 83 Ja, nachher 120 (R: table(kurs_vor, kurs_nach)). */
export const KURS = { b: 46, c: 9, vorher: 83, nachher: 120, chi2: 23.56363636, chi2Raw: 24.89090909, p: 1.208499116e-06, exact: 4.336383137e-07 } as const;

export type McValues = { b: number; c: number };
export type McStats = McValues & { total: number; diff: number; corr: number; sq: number; chi2: number; raw: number; p: number; exact: number };

export function mcStats(v: McValues): McStats {
  const total = v.b + v.c, diff = Math.abs(v.b - v.c), corr = diff - 1, m = mcnemar(v.b, v.c, true), raw = mcnemar(v.b, v.c, false);
  return { ...v, total, diff, corr, sq: corr * corr, chi2: m?.chi2 ?? 0, raw: raw?.chi2 ?? 0, p: m?.p ?? 1, exact: total > 0 ? binomTestHalf(v.b, total) : 1 };
}

export const mcnemarTest: SentenceTemplate<McValues, McStats> = {
  concept: 'mcnemar_test',
  wofuer: 'Dieselben 200 Befragten wurden vor und nach einem Kurs gefragt: „Trauen Sie sich zu, eine kleine Datenauswertung selbstständig durchzuführen?“ Vorher sagten 83 Ja, nachher 120. Ist das mehr als Zufall? McNemar schaut nur auf die Personen, die ihre Antwort gewechselt haben.',
  kurz: 'McNemar prüft, ob sich eine Ja-nein-Antwort bei denselben Personen verändert hat. Er vergleicht nur die Wechsel: von Nein zu Ja und von Ja zu Nein.',
  fachlich: 'Test für zwei verbundene dichotome Messungen: Unter der Nullhypothese sind beide Wechselrichtungen gleich wahrscheinlich; χ² = (|b − c| − 1)² / (b + c) mit einem Freiheitsgrad.',
  initial: { b: KURS.b, c: KURS.c },
  compute: mcStats,
  metrics: [
    { label: 'Wechsel b + c', value: s => String(s.total) },
    { label: 'Prüfgröße χ²', value: s => num(s.chi2) },
  ],
  glyphs: [
    { key: 'chi2', sym: 'χ²', say: 'Chi-Quadrat', term: 'Prüfgröße nach McNemar', plain: 'wie deutlich sich die beiden Wechselrichtungen unterscheiden' },
    { key: 'b', sym: 'b', say: 'b', term: 'Wechsel von Nein zu Ja', plain: 'wie viele vorher Nein und nachher Ja sagen' },
    { key: 'c', sym: 'c', say: 'c', term: 'Wechsel von Ja zu Nein', plain: 'wie viele vorher Ja und nachher Nein sagen' },
    { key: 'k', sym: '− 1', say: 'minus 1', term: 'Kontinuitätskorrektur', plain: 'macht den Unterschied etwas kleiner, weil Wechsel nur in ganzen Schritten gezählt werden' },
  ],
  symbolic: [{ part: ['χ²'], m: 'chi2' }, ' = ', { frac: ['(|', { part: ['b'], m: 'b' }, ' − ', { part: ['c'], m: 'c' }, '| ', { part: ['− 1'], m: 'k' }, ')²'], den: [{ part: ['b'], m: 'b' }, ' + ', { part: ['c'], m: 'c' }], m: 'chi2' }],
  aria: 'Chi-Quadrat gleich: Betrag von b minus c, minus 1, zum Quadrat, geteilt durch b plus c',
  numeric: s => [{ part: ['χ²'], m: 'chi2' }, ' = (|', { part: [String(s.b)], m: 'b' }, ' − ', { part: [String(s.c)], m: 'c' }, '| ', { part: ['− 1'], m: 'k' },
    s.total > 0 ? `)² / (${s.b} + ${s.c}) = ${paren(s.corr)}² / ${s.total} = ${count(s.sq)} / ${s.total} ${close(Math.round(s.chi2 * 100) / 100, s.chi2, 1e-9) ? '=' : '≈'} ${num(s.chi2)}` : ')² / 0: ohne Wechsel nicht berechenbar'],
  sentence: ['Die ', { m: 'chi2', t: 'Prüfgröße' }, ' ist der Unterschied zwischen ', { m: 'b', t: 'den Wechseln von Nein zu Ja' }, ' und ', { m: 'c', t: 'den Wechseln von Ja zu Nein' }, ', ', { m: 'k', t: 'verkleinert um 1' }, ', zum Quadrat und geteilt durch alle Wechsel.'],
  worked: s => s.total === 0
    ? [{ title: 'Die Wechsel zählen', text: 'Niemand wechselt seine Antwort. Dann gibt es nichts zu prüfen; mariposa meldet den exakten p-Wert 1.' }]
    : [
      { title: 'Die Wechsel zählen', text: `${wer(s.b, 'sagt vorher Nein und nachher Ja', 'sagen vorher Nein und nachher Ja')}, ${andere(s.c)} andersherum. Wer seine Antwort behält, zählt nicht.` },
      { title: 'Den Unterschied bilden und 1 abziehen', text: `|${s.b} − ${s.c}| = ${s.diff}, minus 1 ergibt ${num(s.corr)}.` },
      { title: 'Quadrieren und durch alle Wechsel teilen', text: `${paren(s.corr)}² = ${count(s.sq)}, geteilt durch ${s.b} + ${s.c} = ${s.total} ergibt χ² ≈ ${num(s.chi2)}.` },
      { title: 'Mit dem Zufall vergleichen', text: `Gäbe es keine Veränderung, käme bei einem Freiheitsgrad ein χ² von mindestens ${num(s.chi2)} ${often(s.p)} vor (${pText(s.p)}).` },
    ],
  fehler: 'Vergleiche nicht die Ja-Antworten vorher und nachher als zwei Gruppen. Es sind dieselben Personen; wer zweimal Ja sagt, zählt sonst doppelt und sagt nichts über eine Veränderung.',
  sliders: [
    { key: 'b', label: 'Wechsel von Nein zu Ja', min: 0, max: 200, step: 1, format: v => String(v) },
    { key: 'c', label: 'Wechsel von Ja zu Nein', min: 0, max: 200, step: 1, format: v => String(v) },
  ],
  quick: [
    { label: 'Lehrdatensatz: 46 und 9', mark: 'b', apply: () => ({ b: KURS.b, c: KURS.c }) },
    { label: 'gleich viele Wechsel', mark: 'c', apply: v => ({ ...v, c: v.b }) },
    // Nur wenn beide Zahlen danach noch auf den Regler passen; sonst bliebe das Verhältnis nicht gleich.
    { label: 'alle Wechsel mal 4', mark: 'b', apply: v => v.b * 4 <= 200 && v.c * 4 <= 200 ? { b: v.b * 4, c: v.c * 4 } : v },
  ],
  compare: s => s.total === 0 ? 'Ohne Wechsel gibt es keine Prüfgröße.' : `Ohne Korrektur wäre χ² = ${num(s.raw)}, mit Korrektur ${num(s.chi2)}. Bei vielen Wechseln macht die Korrektur wenig aus.`,
  check: {
    question: '10 Befragte wechseln von Nein zu Ja, 4 von Ja zu Nein. Wie groß ist χ² mit Korrektur?',
    answer: 25 / 14, tolerance: 0.011,
    right: 'Genau, etwa 1,79: (|10 − 4| − 1)² / 14 = 25 / 14.',
    diagnose: v => close(v, 36 / 14, 0.011) ? 'Fast! Das ist χ² ohne Korrektur. Zieh vom Unterschied erst 1 ab: (6 − 1)² / 14.'
      : close(v, 25, 0.011) ? 'Fast! Jetzt noch durch alle Wechsel teilen: 10 + 4 = 14.'
      : close(v, 5 / 14, 0.011) ? 'Fast! Das Quadrat fehlt: (6 − 1)² = 25, geteilt durch 14.'
      : close(v, 25 / 6, 0.011) ? 'Fast! Geteilt wird durch alle Wechsel, 10 + 4 = 14, nicht durch den Unterschied.'
      : 'Noch nicht ganz. Rechne |10 − 4| − 1, quadriere das Ergebnis und teile durch 10 + 4.',
  },
  interpret: s => s.total === 0
    ? { kurz: 'Niemand wechselt seine Antwort. Es gibt keine Veränderung, und mariposa meldet den exakten p-Wert 1.', fachlich: 'Ohne diskordante Paare ist χ² nicht definiert; der exakte Binomialtest ergibt p = 1.' }
    : {
      kurz: `${wer(s.b, 'wechselt', 'wechseln')} von Nein zu Ja, ${andere(s.c)} von Ja zu Nein. Gäbe es in Wahrheit keine Veränderung, wären beide Richtungen gleich häufig. Ein mindestens so großer Unterschied käme dann ${often(s.p)} vor.`,
      fachlich: `χ² = ${num(s.chi2)} mit Korrektur, 1 Freiheitsgrad, ${pText(s.p)}; exakter Binomialtest für ${s.b} von ${s.total} Wechseln: ${pText(s.exact)}.`,
    },
  think: {
    question: 'Zu den 200 Befragten kommen 100 hinzu, die vorher und nachher Ja sagen. Was passiert mit χ²?',
    options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, mark: 'b',
    explain: 'Wer seine Antwort behält, steckt weder in b noch in c. χ² hängt nur von den Wechseln ab und bleibt gleich.',
    kurz: 'Nur Wechsel zählen.',
    hint: 'Probier oben „gleich viele Wechsel“ aus: Dann ist χ² fast 0.',
  },
  genau: {
    kurz: 'McNemar braucht dieselben Personen zu zwei Zeitpunkten. Ob eine Veränderung von einem Kurs kommt, zeigt er nicht.',
    paragraphs: [
      `Die Korrektur „− 1“ gleicht aus, dass Wechsel nur in ganzen Schritten gezählt werden. mariposa rechnet sie mit correct = TRUE, das ist voreingestellt. Ohne Korrektur wäre χ² = 37² / 55 ≈ ${num(KURS.chi2Raw)}.`,
      'Zusätzlich meldet mariposa einen exakten p-Wert: einen Binomialtest, ob die b von b + c Wechseln zu 50 % in jede Richtung gehen. Bei wenigen Wechseln ist er verlässlicher als die χ²-Näherung.',
      'mariposa schneidet die Korrektur nicht bei 0 ab. Sind b und c gleich, entsteht deshalb ein kleiner positiver Wert, bei je 10 Wechseln etwa 0,05.',
      'Der Test sagt nur, ob sich die Antworten insgesamt verschoben haben. Ob der Kurs das bewirkt hat, lässt sich ohne Vergleichsgruppe nicht sagen: Auch die Zeit zwischen den Befragungen kann etwas verändern.',
    ],
  },
};

/** Wechsel in den Spalten der Auswertung: b = vorher 0 und nachher 1, c = vorher 1 und nachher 0. */
export function mcSample(c: SampleCtx) {
  const t = fourfold(c.rows, c.columns.x?.[0] ?? 'kurs_vor', c.columns.y?.[0] ?? 'kurs_nach');
  return { ...mcStats({ b: t[0][1], c: t[1][0] }), vorher: t[1][0] + t[1][1], nachher: t[0][1] + t[1][1] };
}

export const mcnemarTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'kurs_vor', y: 'kurs_nach' },
    kurz: 'Derselbe Test mit allen 200 Befragten, so wie R ihn rechnet: die Kurszuversicht vorher und nachher.',
    value: c => { const s = mcSample(c); return s.total > 0 ? s.chi2 : null; },
    result: c => {
      const s = mcSample(c);
      if (s.total === 0) return { kurz: 'Niemand wechselt seine Antwort. Es gibt keine Veränderung, und mariposa meldet den exakten p-Wert 1.', fachlich: 'Ohne diskordante Paare meldet mariposa kein χ², nur den exakten p-Wert 1.' };
      return {
        kurz: `${wer(s.b, 'traut sich die Auswertung nachher zu', 'trauen sich die Auswertung nachher zu')}, vorher nicht; ${andere(s.c)} andersherum. Gäbe es in Wahrheit keine Veränderung, käme ein mindestens so großer Unterschied ${often(s.p)} vor (${pText(s.p)}).`,
        fachlich: `McNemar mit Korrektur: χ² = ${num(s.chi2)}, 1 Freiheitsgrad, ${pText(s.p)}; exakt ${pText(s.exact)}.`,
        zusatz: `Vorher sagen ${s.vorher} von ${c.rows.length} Ja, nachher ${s.nachher}.`,
      };
    },
    voraussetzung: 'Beide Antworten stammen von denselben Personen, und die Personen sind voneinander unabhängig.',
    think: [
      {
        question: 'Angenommen, nach dem Kurs trauen es sich alle zu. Was passiert mit χ²?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Jetzt wechselt jeder, der vorher Nein sagte, zu Ja, und Wechsel zu Nein gibt es keine mehr. Der Unterschied der Wechsel wächst, also auch χ².',
        kurz: 'Je einseitiger die Wechsel, desto größer χ².',
        tryIt: { label: 'nachher alle auf Ja (Code 1)', op: 'constant', column: 'y', value: 1 },
        expect: { change: 'up' },
      },
      {
        question: 'Angenommen, vorher hätte es sich niemand zugetraut. Was passiert mit χ²?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Dann ist jedes Ja nachher ein Wechsel von Nein zu Ja, und Wechsel zu Nein gibt es keine. Der Unterschied wird größer, χ² steigt.',
        kurz: 'Nur Wechsel zählen, und hier gehen alle in dieselbe Richtung.',
        tryIt: { label: 'vorher alle auf Nein (Code 0)', op: 'constant', column: 'x', value: 0 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 'mcnemar_test', variant: 0,
    tokens: {
      mcnemar_test: { sym: 'mcnemar_test()', term: 'McNemar-Test', kurz: 'Prüft, ob sich eine Ja-nein-Antwort bei denselben Personen verändert hat. Meldet χ², den asymptotischen und den exakten p-Wert und N.', fehler: 'Mit einer Spalte mit mehr als zwei Antworten meldet mariposa: `var2` must be dichotomous (exactly 2 levels).' },
      correct: { sym: 'correct =', term: 'Kontinuitätskorrektur', kurz: 'TRUE zieht vom Unterschied der Wechsel 1 ab, wie in der Formel. FALSE rechnet ohne Korrektur.', fehler: 'Lässt du correct weg, rechnet mariposa trotzdem mit Korrektur, denn TRUE ist voreingestellt.' },
    },
    outputMap: [
      { match: 'chi2', atlas: 'χ²', explain: '(|46 − 9| − 1)² / 55 ≈ 23,56. (cc) heißt: mit Kontinuitätskorrektur.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Der erste p-Wert kommt aus der χ²-Verteilung. Gäbe es keine Veränderung, käme ein mindestens so großer Unterschied in weniger als 1 von 1.000 Stichproben vor.' },
      { match: 'exact', atlas: 'exakter p-Wert', explain: 'Der zweite p-Wert kommt aus einem Binomialtest: 46 von 55 Wechseln gehen zu Ja, verglichen mit 50 %.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten mit Antworten zu beiden Zeitpunkten.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist χ²? Tippe sie an.', correct: 'chi2',
      wrong: { p: 'Fast! Das ist der p-Wert. χ² steht hinter chi2, mit dem Freiheitsgrad in Klammern.', N: 'Fast! N ist die Zahl der Befragten. χ² steht hinter chi2.' },
    },
  },
  next: {
    next: { id: 'wilcoxon_test', why: 'Vergleicht dieselben Personen zu zwei Zeitpunkten, wenn die Antworten mehr als zwei Stufen haben.' },
    before: [
      { id: 'paired_design', why: 'Dieselben Personen wurden zweimal gefragt.' },
      { id: 'crosstab', why: 'Die Vierfeldertafel aus vorher und nachher, in der b und c stehen.' },
      { id: 'binomial_test', why: 'Der exakte p-Wert prüft, ob die Wechsel zu 50 % in jede Richtung gehen.' },
    ],
    after: [{ id: 'causality', why: 'Ob eine Veränderung vom Kurs kommt, zeigt erst ein Vergleich mit einer Gruppe ohne Kurs.' }],
    more: [
      { id: 'chi_square', why: 'Für zwei verschiedene Gruppen statt derselben Personen.' },
      { id: 'paired_difference', why: 'Dieselbe Idee bei Zahlen: Unterschiede je Person statt Wechsel.' },
    ],
  },
};
