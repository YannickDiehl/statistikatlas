// Formel als Satz „Phi“ für eine Tabelle mit zwei Zeilen und zwei Spalten: (a · d − b · c) durch die Wurzel aus dem
// Produkt der Randsummen, mit Vorzeichen wie phi() in mariposa 0.7.4 (NEWS 0.7.4: „Phi of a 2x2 table … carries the
// sign of the association“). Beispiel aus dem Lehrdatensatz (Weiterbildung und Erwerbstätigkeit), Reiter mit allen 200.
// In R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, count, num, pct } from '../../format';
import { relate } from '../../math';
import { sampleColumn } from '../../sample';
import { crosstab as cross, chiSquare, phi as unsignedPhi } from '../../../tasks/kit/stats';
import { T } from './shared';

/** Lehrdatensatz: a = Weiterbildung und erwerbstätig, b = Weiterbildung, nicht erwerbstätig, c = keine Weiterbildung, erwerbstätig, d = beides nein. */
export const WB_ERW = { a: 59, b: 23, c: 78, d: 40 } as const;

export type PhiValues = { a: number; b: number; c: number; d: number };
export type PhiStats = PhiValues & { ad: number; bc: number; diff: number; r1: number; r2: number; k1: number; k2: number; prod: number; root: number; n: number; phi: number | null; abs: number | null; chi2: number | null; shareA: number | null; shareB: number | null };

/** Stärke aus dem Betrag nach der Faustregel von Cohen (ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark). */
export const phiWords = (v: number) => { const a = Math.abs(v); return a < 0.1 ? 'Die beiden Merkmale hängen kaum zusammen.' : a < 0.3 ? 'Das ist ein schwacher Zusammenhang.' : a < 0.5 ? 'Das ist ein mittlerer Zusammenhang.' : a < 0.995 ? 'Das ist ein starker Zusammenhang.' : 'Die beiden Merkmale hängen vollständig zusammen.'; };
/** Was das Vorzeichen bei der Kodierung 1 = Ja bedeutet. */
const signWords = (v: number) => Math.abs(v) < 0.005 ? 'Ohne Vorzeichen: Ja bei der einen Frage geht weder eher mit Ja noch eher mit Nein bei der anderen einher.'
  : v > 0 ? 'Das Plus heißt hier: Ja bei der einen Frage geht eher mit Ja bei der anderen einher.'
  : 'Das Minus heißt hier: Ja bei der einen Frage geht eher mit Nein bei der anderen einher.';

export const phiSatz: SentenceTemplate<PhiValues, PhiStats> = {
  concept: 'phi',
  wofuer: 'Machen Erwerbstätige häufiger eine Weiterbildung? Im Lehrdatensatz haben von 137 Erwerbstätigen 59 in den letzten zwölf Monaten eine Weiterbildung gemacht, von 63 anderen 23. Beide Fragen haben nur zwei Antworten. Phi fasst den Zusammenhang einer solchen Tabelle in einer Zahl zwischen −1 und +1 zusammen.',
  kurz: 'Phi sagt dir, wie stark zwei Ja-Nein-Fragen zusammenhängen, von −1 bis +1. Das Vorzeichen hängt davon ab, welche Antwort den Code 1 trägt.',
  fachlich: 'Phi ist die Pearson-Korrelation zweier 0/1-Variablen, berechnet aus den vier Feldern der Vierfeldertafel. Teilt man Chi-Quadrat durch die Fallzahl und zieht die Wurzel, erhält man seinen Betrag.',
  initial: { ...WB_ERW },
  compute: v => {
    const ad = v.a * v.d, bc = v.b * v.c, diff = ad - bc, r1 = v.a + v.b, r2 = v.c + v.d, k1 = v.a + v.c, k2 = v.b + v.d;
    const prod = r1 * r2 * k1 * k2, root = Math.sqrt(prod), n = r1 + r2, phi = prod > 0 ? diff / root : null;
    return { ...v, ad, bc, diff, r1, r2, k1, k2, prod, root, n, phi, abs: phi === null ? null : Math.abs(phi), chi2: phi === null ? null : n * phi * phi, shareA: k1 > 0 ? v.a / k1 : null, shareB: k2 > 0 ? v.b / k2 : null };
  },
  metrics: [
    { label: 'Personen n', value: s => count(s.n) },
    { label: 'Phi φ', value: s => s.phi === null ? 'nicht definiert' : num(s.phi) },
  ],
  glyphs: [
    { key: 'phi', sym: 'φ', say: 'phi', term: 'Phi', plain: 'wie stark zwei Ja-Nein-Fragen zusammenhängen, von −1 bis +1', concept: 'phi' },
    { key: 'a', sym: 'a', say: 'a', term: 'Zelle a', plain: 'Weiterbildung ja, erwerbstätig' },
    { key: 'b', sym: 'b', say: 'b', term: 'Zelle b', plain: 'Weiterbildung ja, nicht erwerbstätig' },
    { key: 'c', sym: 'c', say: 'c', term: 'Zelle c', plain: 'keine Weiterbildung, erwerbstätig' },
    { key: 'd', sym: 'd', say: 'd', term: 'Zelle d', plain: 'keine Weiterbildung, nicht erwerbstätig' },
    { key: 'rand', sym: '√((a + b)(c + d)(a + c)(b + d))', say: 'Wurzel aus dem Produkt der vier Randsummen', term: 'Randsummen', plain: 'die beiden Zeilensummen und die beiden Spaltensummen, malgenommen' },
  ],
  symbolic: [{ part: ['φ'], m: 'phi' }, ' = ', { frac: [{ part: ['a'], m: 'a' }, { part: ['d'], m: 'd' }, ' − ', { part: ['b'], m: 'b' }, { part: ['c'], m: 'c' }],
    den: [{ big: '√', m: 'rand' }, { root: [{ part: ['(a + b)(c + d)(a + c)(b + d)'], m: 'rand' }], m: 'rand' }], m: 'phi' }],
  aria: 'phi gleich a mal d minus b mal c, geteilt durch die Wurzel aus dem Produkt der vier Randsummen',
  numeric: s => [{ part: ['φ'], m: 'phi' }, ' = (', { part: [count(s.a)], m: 'a' }, ' · ', { part: [count(s.d)], m: 'd' }, ' − ', { part: [count(s.b)], m: 'b' }, ' · ', { part: [count(s.c)], m: 'c' }, ') / ',
    { part: [`√(${count(s.r1)} · ${count(s.r2)} · ${count(s.k1)} · ${count(s.k2)})`], m: 'rand' },
    s.phi === null ? ': nicht definiert, eine Randsumme ist 0' : ` = ${num(s.diff, 0)} / ${num(s.root)} ≈ ${num(s.phi)}`],
  sentence: [{ m: 'phi', t: 'Phi' }, ' ist der Unterschied der Diagonalen, ', { m: 'a', t: 'a' }, ' mal ', { m: 'd', t: 'd' }, ' minus ', { m: 'b', t: 'b' }, ' mal ', { m: 'c', t: 'c' }, ', geteilt durch die Wurzel aus ', { m: 'rand', t: 'dem Produkt der vier Randsummen' }, '.'],
  worked: s => [
    { title: 'Die Diagonalen malnehmen', text: `a · d = ${count(s.a)} · ${count(s.d)} = ${count(s.ad)} und b · c = ${count(s.b)} · ${count(s.c)} = ${count(s.bc)}.` },
    { title: 'Den Unterschied bilden', text: `${count(s.ad)} − ${count(s.bc)} = ${num(s.diff, 0)}. ${s.diff > 0 ? 'Plus: Die Diagonale a, d ist stärker besetzt.' : s.diff < 0 ? 'Minus: Die Gegendiagonale b, c ist stärker besetzt.' : 'Beide Diagonalen sind gleich stark besetzt.'}` },
    { title: 'Die Ränder malnehmen und die Wurzel ziehen', text: `${count(s.r1)} · ${count(s.r2)} · ${count(s.k1)} · ${count(s.k2)} = ${count(s.prod)}, die Wurzel daraus ist ${s.prod > 0 ? `≈ ${num(s.root)}` : '0'}.` },
    { title: 'Teilen', text: s.phi === null ? 'Eine Randsumme ist 0. Durch 0 kann man nicht teilen, φ ist nicht definiert.' : `${num(s.diff, 0)} / ${num(s.root)} ≈ ${num(s.phi)}.` },
  ],
  fehler: 'Vertauschst du bei einer Frage Ja und Nein, dreht sich das Vorzeichen von φ. Die Stärke liest du am Betrag ab, die Richtung an den Prozenten der Tabelle.',
  sliders: [
    { key: 'a', label: 'Weiterbildung ja, erwerbstätig', min: 0, max: 400, step: 1, format: v => count(v) },
    { key: 'b', label: 'Weiterbildung ja, nicht erwerbstätig', min: 0, max: 400, step: 1, format: v => count(v) },
    { key: 'c', label: 'keine Weiterbildung, erwerbstätig', min: 0, max: 400, step: 1, format: v => count(v) },
    { key: 'd', label: 'keine Weiterbildung, nicht erwerbstätig', min: 0, max: 400, step: 1, format: v => count(v) },
  ],
  quick: [
    { label: 'alle Zellen mal 2', mark: 'rand', apply: v => ({ a: Math.min(400, v.a * 2), b: Math.min(400, v.b * 2), c: Math.min(400, v.c * 2), d: Math.min(400, v.d * 2) }) },
    { label: 'Ja und Nein bei der Weiterbildung tauschen', mark: 'phi', apply: v => ({ a: v.c, b: v.d, c: v.a, d: v.b }) },
    { label: 'alle in die Diagonale', mark: 'b', apply: v => ({ ...v, b: 0, c: 0 }) },
    { label: 'Lehrdatensatz', mark: 'phi', apply: () => ({ ...WB_ERW }) },
  ],
  compare: s => s.phi === null ? 'Ohne zwei gefüllte Zeilen und Spalten gibt es nichts zu vergleichen.'
    : `φ misst das Muster, nicht die Menge: Bei doppelt so vielen Personen in jeder Zelle bleibt φ ≈ ${num(s.phi)}, χ² = n · φ² verdoppelt sich von ${num(s.chi2!)} auf ${num(2 * s.chi2!)}.`,
  check: {
    question: 'Eine Tabelle hat a = 30, b = 10, c = 10 und d = 30. Wie groß ist φ?',
    answer: 0.5, tolerance: 0.011,
    right: 'Genau, 0,5: (900 − 100) / √(40 · 40 · 40 · 40) = 800 / 1.600.',
    diagnose: v => close(v, 800, 0.011) ? 'Fast! Das ist erst a · d − b · c. Jetzt noch durch die Wurzel aus dem Produkt der Randsummen teilen.'
      : close(v, -0.5, 0.011) ? 'Fast! Andersherum: Diagonale a · d minus Gegendiagonale b · c.'
      : close(v, 0.25, 0.011) ? 'Fast! Das ist φ zum Quadrat, also χ² / n. Zieh noch die Wurzel.'
      : 'Noch nicht ganz. Rechne erst a · d − b · c, dann teile durch die Wurzel aus den vier Randsummen, malgenommen.',
  },
  interpret: s => s.phi === null ? {
    kurz: 'Eine Zeile oder Spalte ist leer. Dann lässt sich kein Zusammenhang berechnen.',
    fachlich: 'Eine Randsumme ist 0, deshalb ist φ nicht definiert.',
  } : {
    kurz: `${s.shareA === null || s.shareB === null ? '' : `Unter den Erwerbstätigen haben ${pct(s.shareA)} eine Weiterbildung gemacht, unter den anderen ${pct(s.shareB)}. `}φ ≈ ${num(s.phi)}: ${phiWords(s.phi)}`,
    fachlich: `φ = (ad − bc) / √(Randsummen) ≈ ${num(s.phi)}, χ² = n · φ² ≈ ${num(s.chi2!)} bei n = ${count(s.n)}. ${signWords(s.phi)} Die Stufen ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark gelten für den Betrag und sind eine Faustregel nach Cohen.`,
  },
  think: {
    question: 'Alle vier Zellen werden verdoppelt. Was passiert mit φ?',
    options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1, mark: 'rand',
    explain: 'a · d − b · c wird viermal so groß, das Produkt der vier Ränder 16-mal, seine Wurzel viermal. Zähler und Nenner wachsen gleich, φ bleibt.',
    kurz: 'φ misst das Muster, nicht die Menge.',
    hint: 'Probier oben „alle Zellen mal 2“ aus.',
  },
  genau: {
    kurz: 'φ ist die Pearson-Korrelation zweier 0/1-Spalten; sein Vorzeichen hängt an der Kodierung. Bei zwei Zeilen und zwei Spalten ist der Betrag von φ so groß wie Cramér-V.',
    paragraphs: [
      'Mit dem unkorrigierten χ² gilt |φ| = √(χ² / n); im Lehrdatensatz ist χ² ≈ 0,77 und φ ≈ 0,06.',
      'phi() aus mariposa 0.7.4 meldet bei zwei mal zwei Feldern φ mit Vorzeichen, genau wie Pearson-r der 0/1-Spalten. Bei größeren Tabellen meldet es √(χ² / n) ohne Vorzeichen; das kann dann über 1 liegen, und du nimmst besser Cramér-V.',
      'Welche Antwort den Code 1 trägt, ist eine Festlegung. Polst du eine Frage um, dreht sich nur das Vorzeichen; polst du beide um, bleibt es gleich.',
      'Ein Zusammenhang beweist keine Ursache: Erwerbstätige und andere unterscheiden sich auch in Alter und Arbeitszeit.',
    ],
  },
  picture: 'b05-phi',
};

// ---------- Reiter ----------

const X = 'weiterbildung', Y = 'erwerbstaetig';
/**
 * φ wie mariposa::phi() 0.7.4: bei zwei mal zwei Feldern mit Vorzeichen (= Pearson-r der beiden Spalten), sonst
 * √(χ² / n) ohne Vorzeichen. Dazu der Betrag und die Anteile mit Weiterbildung je Gruppe.
 */
export function phiData(c: SampleCtx) {
  const x = sampleColumn(c.rows, c.columns.x?.[0] ?? X), y = sampleColumn(c.rows, c.columns.y?.[0] ?? Y);
  const t = cross(x, y), two = t.rows.length === 2 && t.cols.length === 2, ok = Math.min(t.rows.length, t.cols.length) >= 2;
  const chi2 = ok ? chiSquare(t.cells).chi2 : NaN, size = unsignedPhi(x, y);
  const phi = !ok ? null : two ? relate(x, y).r : Number.isFinite(size) ? size : null;
  const share = (code: number) => { const g = x.filter((_, i) => y[i] === code); return g.length ? g.filter(v => v === 1).length / g.length : null; };
  return { phi, abs: phi === null ? null : Math.abs(phi), chi2, erw: share(1), ohne: share(0), n: x.length };
}

export const phiTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: X, y: Y },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Weiterbildung in den letzten zwölf Monaten und Erwerbstätigkeit, beide Ja oder Nein.',
    value: c => phiData(c).phi,
    result: c => {
      const p = phiData(c);
      if (p.phi === null) return { kurz: 'Bei einer der beiden Fragen haben alle dieselbe Antwort. Dann lässt sich φ nicht berechnen.', fachlich: 'Die Tabelle hat keine zwei gefüllten Zeilen und Spalten, φ ist nicht definiert.' };
      return {
        kurz: `${p.erw === null || p.ohne === null ? '' : `Unter den Erwerbstätigen haben ${pct(p.erw)} eine Weiterbildung gemacht, unter den anderen ${pct(p.ohne)}. `}φ ≈ ${num(p.phi)}: ${phiWords(p.phi)}`,
        fachlich: `φ ≈ ${num(p.phi)}, sein Betrag ist √(χ² / n) = √(${num(p.chi2)} / ${p.n}). ${signWords(p.phi)}`,
        zusatz: 'phi() aus mariposa 0.7.4 meldet bei zwei mal zwei Feldern φ mit Vorzeichen, genau wie Pearson-r der 0/1-Spalten.',
      };
    },
    voraussetzung: 'Beide Spalten haben genau zwei Kategorien, kodiert mit 0 und 1. Die Stufen ab 0,1 schwach, ab 0,3 mittel und ab 0,5 stark sind nur eine Faustregel für den Betrag.',
    think: [
      {
        question: 'Ja und Nein bei der Weiterbildung werden vertauscht. Was passiert mit φ?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Die Tabelle tauscht ihre Zeilen: Aus der Diagonale wird die Gegendiagonale. a · d − b · c dreht sein Vorzeichen, die Ränder bleiben. So meldet es auch phi() in mariposa.',
        kurz: 'Das Vorzeichen hängt an der Kodierung.',
        tryIt: { label: 'Weiterbildung umpolen (1 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
      {
        question: 'Und was passiert dabei mit √(χ² / n), dem Betrag von φ?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'verdoppelt sich'], correct: 0,
        explain: 'χ² zählt die Abstände zwischen beobachteten und erwarteten Zahlen in jeder Zelle. Beim Tauschen wandern sie nur in andere Zellen; die Stärke bleibt.',
        kurz: 'Die Stärke hängt nicht an der Kodierung.',
        tryIt: { label: 'Weiterbildung umpolen (1 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'same', measure: c => phiData(c).abs },
      },
      {
        question: 'Ja und Nein bei der Erwerbstätigkeit werden vertauscht. Was passiert mit φ?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird größer'], correct: 1,
        explain: 'Jetzt tauschen die Spalten. Auch das macht aus der Diagonale die Gegendiagonale, und φ dreht sein Vorzeichen.',
        kurz: 'Es ist gleich, welche Frage du umpolst.',
        tryIt: { label: 'Erwerbstätigkeit umpolen (1 minus Code)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'phi', variant: 0,
    tokens: {
      phi: { sym: 'phi()', term: T('phi'), kurz: 'Berechnet φ für zwei Spalten; R gibt nur die Zahl aus, ohne p-Wert. Bei zwei mal zwei Feldern trägt φ ein Vorzeichen wie Pearson-r der 0/1-Spalten, bei größeren Tabellen ist es √(χ² / n) ohne Vorzeichen.', fehler: 'Mit nur einer Spalte meldet mariposa: Exactly two variables must be specified for `chi_square()`.' },
    },
    outputMap: [
      { match: '0.06193526', atlas: 'φ', explain: 'Das ist φ für Weiterbildung und Erwerbstätigkeit, mit Vorzeichen, weil die Tabelle zwei mal zwei Felder hat. Das Plus heißt: Ja geht eher mit Ja einher.' },
      { match: '[1]', atlas: 'Nummer der ersten Zahl', explain: '[1] gehört nicht zum Ergebnis. R nummeriert damit nur die erste Zahl einer Ausgabe.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist φ? Tippe sie an.', correct: '0.06193526',
      wrong: { '[1]': 'Fast! [1] ist nur die Nummer der ersten Zahl in der Ausgabe. φ steht dahinter.' },
    },
  },
  next: {
    next: { id: 'cramers_v', why: 'Dieselbe Idee für Tabellen mit mehr als zwei Zeilen oder Spalten, dann ohne Vorzeichen.' },
    before: [
      { id: 'crosstab', why: 'Die Vierfeldertafel mit den Zellen a, b, c und d.' },
      { id: 'chi_square', why: 'Der Betrag von φ ist die Wurzel aus χ² / n.' },
    ],
    after: [{ id: 'effect', why: 'φ beschreibt, wie stark ein Zusammenhang ist, unabhängig von n.' }],
    more: [
      { id: 'pearson', why: 'Mit 0 und 1 kodiert ist φ genau Pearson-r.' },
      { id: 'mcnemar_test', why: 'Ein anderer Test für Ja-Nein-Fragen, wenn dieselben Personen zweimal antworten.' },
    ],
  },
};
