// Formel als Satz „Erwartete Zellhäufigkeit“: Zeilensumme mal Spaltensumme durch n. Beispiel aus dem Lehrdatensatz
// (Abitur und Weiterbildung), Reiter mit allen 200. In R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, count, num, pct, unit } from '../../format';
import { abschlussNachWeiterbildung } from './crosstab';
import { eq } from './shared';

/** Lehrdatensatz: 40 Befragte mit Abitur, 82 von 200 mit Weiterbildung, 19 mit beidem. */
export const ABITUR_JA = { row: 40, col: 82, n: 200, observed: 19 } as const;

export type ExpValues = { 'nⱼ₊': number; 'n₊ₖ': number; n: number };
export type ExpStats = { row: number; col: number; n: number; valid: boolean; prod: number; E: number; colShare: number };

export const erwartet: SentenceTemplate<ExpValues, ExpStats> = {
  concept: 'expected',
  wofuer: 'Im Lehrdatensatz haben 40 Befragte Abitur, und 82 der 200 haben in den letzten zwölf Monaten eine Weiterbildung gemacht. Wie viele mit Abitur und Weiterbildung wären zu erwarten, wenn Schulabschluss und Weiterbildung nichts miteinander zu tun hätten? Beobachtet sind 19.',
  kurz: 'Die erwartete Zellhäufigkeit sagt dir, wie viele Personen in einer Zelle stünden, wenn die beiden Merkmale nichts miteinander zu tun hätten. Jede Zeile hätte dann dieselben Anteile wie alle zusammen.',
  fachlich: 'Unter der Annahme der Unabhängigkeit das Produkt der Randhäufigkeiten geteilt durch die Fallzahl: Eⱼₖ = nⱼ₊ · n₊ₖ / n.',
  initial: { 'nⱼ₊': ABITUR_JA.row, 'n₊ₖ': ABITUR_JA.col, n: ABITUR_JA.n },
  compute: v => {
    const row = v['nⱼ₊'], col = v['n₊ₖ'], n = v.n, valid = row <= n && col <= n && n > 0;
    return { row, col, n, valid, prod: row * col, E: valid ? row * col / n : 0, colShare: n > 0 ? col / n : 0 };
  },
  metrics: [
    { label: 'Anteil der Spalte n₊ₖ / n', value: s => s.valid ? pct(s.colShare) : 'passt nicht' },
    { label: 'Erwartete Zellhäufigkeit E', value: s => s.valid ? num(s.E) : 'nicht definiert' },
  ],
  glyphs: [
    { key: 'E', sym: 'Eⱼₖ', say: 'E j k', term: 'Erwartete Zellhäufigkeit', plain: 'so viele Personen stünden in der Zelle, wenn die beiden Merkmale nichts miteinander zu tun hätten', concept: 'expected' },
    { key: 'nⱼ₊', sym: 'nⱼ₊', say: 'n j plus', term: 'Zeilensumme', plain: 'wie viele Personen in der Zeile stehen, hier die mit Abitur' },
    { key: 'n₊ₖ', sym: 'n₊ₖ', say: 'n plus k', term: 'Spaltensumme', plain: 'wie viele Personen in der Spalte stehen, hier die mit Weiterbildung' },
    { key: 'n', sym: 'n', say: 'n', term: 'Anzahl gültiger Wertepaare', plain: 'alle Personen in der Tabelle', concept: 'validn' },
  ],
  symbolic: [{ part: ['Eⱼₖ'], m: 'E' }, ' = ', { frac: [{ part: ['nⱼ₊'], m: 'nⱼ₊' }, ' · ', { part: ['n₊ₖ'], m: 'n₊ₖ' }], den: [{ part: ['n'], m: 'n' }], m: 'E' }],
  aria: 'E j k gleich n j plus mal n plus k, geteilt durch n',
  numeric: s => [{ part: ['E'], m: 'E' }, ' = ', { part: [count(s.row)], m: 'nⱼ₊' }, ' · ', { part: [count(s.col)], m: 'n₊ₖ' }, ' / ', { part: [count(s.n)], m: 'n' },
    s.valid ? ` = ${count(s.prod)} / ${count(s.n)} ${eq(s.E)} ${num(s.E)}` : ': Diese Ränder passen nicht zusammen.'],
  sentence: ['Die ', { m: 'E', t: 'erwartete Zellhäufigkeit' }, ' ist ', { m: 'nⱼ₊', t: 'die Zeilensumme' }, ' mal ', { m: 'n₊ₖ', t: 'die Spaltensumme' }, ', geteilt durch ', { m: 'n', t: 'die Zahl aller Personen' }, '.'],
  worked: s => s.valid ? [
    { title: 'Zeilensumme mal Spaltensumme', text: `${count(s.row)} · ${count(s.col)} = ${count(s.prod)}.` },
    { title: 'Durch alle teilen', text: `${count(s.prod)} / ${count(s.n)} ${eq(s.E)} ${num(s.E)}.` },
    { title: 'Als Anteil lesen', text: s.row > 0 ? `${num(s.E)} von ${count(s.row)} sind ${pct(s.E / s.row)}, genau der Anteil der Spalte an allen: ${count(s.col)} von ${count(s.n)}.` : 'Die Zeile ist leer, also wird auch dort niemand erwartet.' },
  ] : [{ title: 'Die Ränder prüfen', text: 'Eine Randsumme ist größer als die Zahl aller Personen. So eine Tabelle gibt es nicht.' }],
  fehler: 'Erwartete Zahlen dürfen Kommazahlen sein, obwohl man Menschen nur ganz zählen kann. Sie sind Rechengrößen für den Fall ohne Zusammenhang, keine Vorhersage für einzelne Personen.',
  sliders: [
    { key: 'nⱼ₊', label: 'Zeilensumme', min: 0, max: 1000, step: 1, format: v => unit(v, 'Person', 'Personen', 0) },
    { key: 'n₊ₖ', label: 'Spaltensumme', min: 0, max: 1000, step: 1, format: v => unit(v, 'Person', 'Personen', 0) },
    { key: 'n', label: 'Alle Personen', min: 10, max: 1000, step: 1, log: true, format: v => unit(v, 'Person', 'Personen', 0) },
  ],
  quick: [
    { label: 'Spalte verdoppeln', mark: 'n₊ₖ', apply: v => ({ ...v, 'n₊ₖ': Math.min(1000, v['n₊ₖ'] * 2) }) },
    { label: 'alle Zahlen mal 2', mark: 'n', apply: v => ({ 'nⱼ₊': Math.min(1000, v['nⱼ₊'] * 2), 'n₊ₖ': Math.min(1000, v['n₊ₖ'] * 2), n: Math.min(1000, v.n * 2) }) },
    { label: 'Lehrdatensatz: Abitur und Weiterbildung', mark: 'E', apply: () => ({ 'nⱼ₊': ABITUR_JA.row, 'n₊ₖ': ABITUR_JA.col, n: ABITUR_JA.n }) },
  ],
  compare: s => s.valid && s.row > 0
    ? `E geteilt durch die Zeilensumme ist der Anteil der Spalte: ${num(s.E)} / ${count(s.row)} ≈ ${num(s.E / s.row)}, genau wie ${count(s.col)} / ${count(s.n)}.`
    : 'Mit einer leeren Zeile oder unmöglichen Rändern gibt es keinen Anteil zu vergleichen.',
  check: {
    question: 'Eine Zeile hat 50 Personen, die Spalte 80, insgesamt sind es 200. Wie viele Personen erwartest du in der Zelle, wenn die beiden Merkmale nichts miteinander zu tun haben?',
    answer: 20, tolerance: 0.011,
    right: 'Genau, 20: 50 · 80 / 200 = 4.000 / 200 = 20.',
    diagnose: v => close(v, 4000) ? 'Fast! Das ist erst Zeilensumme mal Spaltensumme. Jetzt noch durch alle 200 teilen.'
      : close(v, 40) ? 'Fast! Du hast durch 100 geteilt. Geteilt wird durch alle Personen, hier 200.'
      : close(v, 0.4) ? 'Fast! 0,4 ist der Anteil der Spalte. Mal die 50 Personen der Zeile ergibt das die erwartete Zahl.'
      : close(v, 25) ? 'Fast! 25 % ist der Anteil der Zeile an allen. Gefragt ist eine Zahl von Personen.'
      : 'Noch nicht ganz. Rechne Zeilensumme mal Spaltensumme und teile durch alle Personen.',
  },
  interpret: s => s.valid ? {
    kurz: `Gäbe es keinen Zusammenhang, stünden in dieser Zelle ${unit(s.E, 'Person', 'Personen')}. Das sind ${pct(s.colShare)} der Zeile, genau der Anteil der Spalte an allen.`,
    fachlich: `Eⱼₖ = nⱼ₊ · n₊ₖ / n = ${num(s.E)}. Unter Unabhängigkeit hat jede Zeile denselben Anteil der Spalte wie die Tabelle insgesamt.`,
  } : {
    kurz: 'Diese Ränder passen nicht zusammen: Eine Zeile oder Spalte kann nicht mehr Personen haben als alle zusammen.',
    fachlich: 'Für nⱼ₊ > n oder n₊ₖ > n gibt es keine Kreuztabelle, also auch keine erwartete Zellhäufigkeit.',
  },
  think: {
    question: 'Die Spaltensumme verdoppelt sich, Zeile und Gesamtzahl bleiben gleich. Was passiert mit der erwarteten Zahl?',
    options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 0, mark: 'n₊ₖ',
    explain: 'Die Spaltensumme steht im Zähler. Doppelt so viele in der Spalte heißt: Ohne Zusammenhang erwartest du in jeder Zeile doppelt so viele.',
    kurz: 'E wächst mit jedem Rand im gleichen Verhältnis.',
    hint: 'Probier oben „Spalte verdoppeln“ aus.',
  },
  genau: {
    kurz: 'Erwartete Zahlen gehören zur Annahme ohne Zusammenhang. Der Chi-Quadrat-Test vergleicht sie mit den beobachteten Zahlen.',
    paragraphs: [
      'Im Lehrdatensatz sind mit Abitur und Weiterbildung 19 Befragte beobachtet und 16,4 erwartet. Mit Haupt- oder Volksschulabschluss sind es 12 beobachtet und ebenfalls 16,4 erwartet.',
      'Unabhängigkeit heißt: Die Wahrscheinlichkeit für Zeile und Spalte zugleich ist das Produkt der beiden einzelnen. Geschätzt mit den Rändern ergibt das nⱼ₊ / n · n₊ₖ / n · n = nⱼ₊ · n₊ₖ / n.',
      'Für die Chi-Quadrat-Näherung zählen die erwarteten Zahlen, nicht die beobachteten. Eine verbreitete Faustregel verlangt in den meisten Zellen mindestens 5 erwartete Personen; sonst hilft der exakte Test nach Fisher.',
    ],
  },
};

// ---------- Reiter ----------

/** Erwartete und beobachtete Zahl mit Weiterbildung je Schulabschluss für die aktuellen Daten. */
export function erwartetJa(c: SampleCtx) {
  const a = abschlussNachWeiterbildung(c);
  return { ...a, rows: a.groups.map(g => ({ ...g, E: a.n > 0 ? g.n * a.ja / a.n : 0 })) };
}

export const expectedTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss', y: 'weiterbildung' },
    kurz: 'Dieselbe Rechnung für alle Zellen der Spalte Ja: Schulabschluss und Weiterbildung der 200 Befragten.',
    value: c => erwartetJa(c).rows[4].E,
    result: c => {
      const e = erwartetJa(c), ab = e.rows[4];
      const gap = e.rows.reduce((b, g) => Math.abs(g.ja - g.E) > Math.abs(b.ja - b.E) ? g : b);
      return {
        kurz: `Gäbe es keinen Zusammenhang, hätte jede Schulabschluss-Gruppe ${pct(e.n > 0 ? e.ja / e.n : 0)} mit Weiterbildung. Mit Abitur wären das ${num(ab.E)} von ${ab.n}; beobachtet sind ${ab.ja}.`,
        fachlich: `Erwartete Zellhäufigkeiten für Weiterbildung = Ja, in Klammern die beobachteten: ${e.rows.map(g => `${g.label} ${num(g.E)} (${g.ja})`).join(', ')}.`,
        zusatz: `Am weitesten liegt „${gap.label}“ von der Erwartung entfernt: ${gap.ja} beobachtet, ${num(gap.E)} erwartet.`,
      };
    },
    voraussetzung: 'Die erwarteten Zahlen gelten für den Fall ohne Zusammenhang. Sie brauchen dieselben Ränder wie die beobachtete Tabelle.',
    think: [
      {
        question: 'Ja und Nein bei der Weiterbildung werden vertauscht. Was passiert mit „beobachtet minus erwartet“ in der Zelle Abitur und Ja?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Vorher sind es 19 beobachtet und 16,4 erwartet, also 2,6 mehr. Nach dem Tausch stehen 21 Befragte mit Abitur bei Ja, erwartet sind 23,6: 2,6 weniger.',
        kurz: 'Mehr als erwartet wird zu weniger als erwartet.',
        tryIt: { label: 'Weiterbildung umpolen (1 minus Code)', op: 'reverse', column: 'y' },
        expect: { change: 'sign', measure: c => { const g = erwartetJa(c).rows[4]; return g.ja - g.E; } },
      },
      {
        question: 'Der Schulabschluss wird umgepolt. Was passiert mit der Summe aller erwarteten Zahlen in der Spalte Ja?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die erwarteten Zahlen einer Spalte ergeben zusammen immer ihre Spaltensumme, hier 82. Umpolen vertauscht nur die Zeilen.',
        kurz: 'Erwartete Zahlen behalten die Ränder.',
        tryIt: { label: 'Schulabschluss umpolen (4 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'same', measure: c => erwartetJa(c).rows.reduce((a, g) => a + g.E, 0) },
      },
    ],
  },
  next: {
    next: { id: 'chi_square', why: 'Vergleicht beobachtete und erwartete Zahlen in allen Zellen und fragt, ob die Abstände über Zufall hinausgehen.' },
    before: [
      { id: 'crosstab', why: 'Die Tabelle mit den beobachteten Zahlen und ihren Rändern.' },
      { id: 'stochastic_independence', why: 'Die Annahme, unter der die erwarteten Zahlen gelten.' },
    ],
    after: [{ id: 'cramers_v', why: 'Fasst die Abstände zwischen beobachtet und erwartet als Stärke zusammen.' }],
    more: [{ id: 'fisher_test', why: 'Hilft, wenn viele erwartete Zahlen klein sind.' }],
  },
};
