// Formel als Satz „Cramér-V“: Wurzel aus χ² durch n mal (kleinere Tabellenseite minus eins). Beispiel aus dem
// Lehrdatensatz (Schulabschluss und Geschlechtseintrag, wie der Katalogaufruf), Reiter mit allen 200.
// In R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, count, num } from '../../format';
import { sampleColumn, sampleColumnInfo } from '../../sample';
import { crosstab as cross, chiSquare, cramersV } from '../../../tasks/kit/stats';
import { pchisq } from '../../../tasks/kit/dist';
import { T } from './shared';

/** Lehrdatensatz: Schulabschluss (5 Stufen) und Geschlechtseintrag (4 Einträge), χ² gerundet auf zwei Stellen. */
export const SCHUL_GESCHLECHT = { chi2: 10.02, n: 200, k: 3 } as const;

export type VValues = { 'χ²': number; n: number; k: number };
export type VStats = { chi2: number; n: number; k: number; denom: number; ratio: number; V: number; possible: boolean };

/** Startwerte (Lehrdatensatz): dann steht in der Deutung der Vergleich mit dem Zufall. */
const start = (s: VStats) => s.chi2 === SCHUL_GESCHLECHT.chi2 && s.n === SCHUL_GESCHLECHT.n && s.k === SCHUL_GESCHLECHT.k;
/** Grobe Einordnung; starre Schwellen sind bei V wenig hilfreich, deshalb nur als Faustregel genannt. */
const vWords = (v: number) => v < 0.1 ? 'kaum ein Zusammenhang' : v < 0.3 ? 'ein schwacher Zusammenhang' : v < 0.5 ? 'ein mittlerer Zusammenhang' : v < 0.995 ? 'ein starker Zusammenhang' : 'ein vollständiger Zusammenhang';

export const cramerSatz: SentenceTemplate<VValues, VStats> = {
  concept: 'cramers_v',
  wofuer: 'Hängt der Schulabschluss mit dem Geschlechtseintrag zusammen? Die Tabelle hat 5 Zeilen und 4 Spalten, viel mehr als zwei mal zwei. Der Chi-Quadrat-Test liefert dazu χ² ≈ 10,02 bei 200 Befragten. Cramér-V macht daraus eine Zahl zwischen 0 und 1, die nicht mit der Zahl der Befragten wächst.',
  kurz: 'Cramér-V sagt dir, wie stark zwei Merkmale mit Kategorien zusammenhängen, von 0 (gar nicht) bis 1 (vollständig). Eine Richtung hat es nicht.',
  fachlich: 'Cramér-V ist die Chi-Quadrat-Prüfgröße, bereinigt um Fallzahl und Tabellengröße. Es liegt zwischen 0 und 1.',
  initial: { 'χ²': SCHUL_GESCHLECHT.chi2, n: SCHUL_GESCHLECHT.n, k: SCHUL_GESCHLECHT.k },
  compute: v => {
    const chi2 = v['χ²'], n = v.n, k = v.k, denom = n * k, ratio = denom > 0 ? chi2 / denom : 0;
    return { chi2, n, k, denom, ratio, V: Math.sqrt(ratio), possible: ratio <= 1 + 1e-12 };
  },
  metrics: [
    { label: 'n · k', value: s => count(s.denom) },
    { label: 'Cramér-V', value: s => s.possible ? num(s.V) : 'nicht möglich' },
  ],
  glyphs: [
    { key: 'V', sym: 'V', say: 'V', term: 'Cramér-V', plain: 'wie stark zwei Merkmale mit Kategorien zusammenhängen, von 0 bis 1', concept: 'cramers_v' },
    { key: 'sqrt', sym: '√', say: 'Wurzel', term: 'Quadratwurzel', plain: 'macht aus dem Anteil am größtmöglichen χ² eine Zahl wie eine Korrelation; bei zwei mal zwei Feldern ist das der Betrag von Phi', concept: 'sqrt' },
    { key: 'χ²', sym: 'χ²', say: 'Chi-Quadrat', term: 'Chi-Quadrat-Prüfgröße', plain: 'wie weit die beobachteten Zahlen von den erwarteten abweichen, über alle Zellen zusammengefasst' },
    { key: 'n', sym: 'n', say: 'n', term: 'Anzahl gültiger Wertepaare', plain: 'die Zahl der Personen in der Tabelle', concept: 'validn' },
    { key: 'k', sym: 'k', say: 'k', term: 'Kleinere Tabellenseite minus eins', plain: 'min(Zeilen − 1, Spalten − 1); bei 5 Zeilen und 4 Spalten ist das 3' },
  ],
  symbolic: [{ part: ['V'], m: 'V' }, ' = ', { big: '√', m: 'sqrt' }, { root: [{ frac: [{ part: ['χ²'], m: 'χ²' }], den: [{ part: ['n'], m: 'n' }, ' · ', { part: ['k'], m: 'k' }], m: 'sqrt' }], m: 'sqrt' }],
  aria: 'V gleich Wurzel aus Chi-Quadrat, geteilt durch n mal k',
  numeric: s => [{ part: ['V'], m: 'V' }, ' = ', { part: ['√'], m: 'sqrt' }, '(', { part: [num(s.chi2)], m: 'χ²' }, ' / (', { part: [count(s.n)], m: 'n' }, ' · ', { part: [String(s.k)], m: 'k' }, '))',
    s.possible ? ` = √(${num(s.chi2)} / ${count(s.denom)}) ≈ ${num(s.V)}` : ': mehr als 1, so ein χ² ist hier nicht möglich'],
  sentence: [{ m: 'V', t: 'Cramér-V' }, ' ist ', { m: 'sqrt', t: 'die Wurzel' }, ' aus ', { m: 'χ²', t: 'χ²' }, ', geteilt durch ', { m: 'n', t: 'die Fallzahl' }, ' mal ', { m: 'k', t: 'die kleinere Tabellenseite minus eins' }, '.'],
  worked: s => s.possible ? [
    { title: 'Den Nenner bilden', text: `n · k = ${count(s.n)} · ${s.k} = ${count(s.denom)}.` },
    { title: 'χ² durch den Nenner teilen', text: `${num(s.chi2)} / ${count(s.denom)} ≈ ${num(s.ratio, s.ratio < 0.1 && s.ratio > 0 ? 3 : 2)}.` },
    { title: 'Die Wurzel ziehen', text: `√${num(s.ratio, s.ratio < 0.1 && s.ratio > 0 ? 3 : 2)} ≈ ${num(s.V)}.` },
  ] : [{ title: 'Die Grenze prüfen', text: `χ² kann höchstens n · k = ${count(s.denom)} groß werden. Mit ${num(s.chi2)} gibt es diese Tabelle nicht, und V wäre größer als 1.` }],
  fehler: 'k ist nicht die Zahl der Zeilen oder Spalten, sondern die kleinere von beiden minus eins. Bei 5 Schulabschlüssen und 4 Geschlechtseinträgen ist k = min(4, 3) = 3.',
  sliders: [
    { key: 'χ²', label: 'Chi-Quadrat-Prüfgröße', min: 0, max: 60, step: 0.01, format: v => num(v) },
    { key: 'n', label: 'Fallzahl', min: 20, max: 2000, step: 1, log: true, format: v => count(v) },
    { key: 'k', label: 'kleinere Tabellenseite minus eins', min: 1, max: 4, step: 1, format: v => String(v) },
  ],
  quick: [
    { label: 'gleiches Muster, n und χ² mal 4', mark: 'n', apply: v => ({ ...v, 'χ²': Math.min(60, v['χ²'] * 4), n: Math.min(2000, v.n * 4) }) },
    { label: 'größere Tabelle: k plus 1', mark: 'k', apply: v => ({ ...v, k: Math.min(4, v.k + 1) }) },
    { label: 'Lehrdatensatz', mark: 'V', apply: () => ({ 'χ²': SCHUL_GESCHLECHT.chi2, n: SCHUL_GESCHLECHT.n, k: SCHUL_GESCHLECHT.k }) },
  ],
  compare: s => `χ² wächst mit der Fallzahl: Bei gleichem Muster und viermal so vielen Befragten wird es viermal so groß. V bleibt dabei gleich, hier ${s.possible ? `≈ ${num(s.V)}` : 'über 1, also unmöglich'}.`,
  check: {
    question: 'χ² = 18 bei n = 100, die Tabelle hat 3 Zeilen und 4 Spalten. Wie groß ist V?',
    answer: 0.3, tolerance: 0.011,
    right: 'Genau, 0,3: k = min(3 − 1, 4 − 1) = 2, also √(18 / 200) = √0,09 = 0,3.',
    diagnose: v => close(v, 0.09, 0.011) ? 'Fast! Das ist noch die Zahl unter der Wurzel. Zieh die Wurzel: √0,09 = 0,3.'
      : close(v, Math.sqrt(0.18), 0.011) ? 'Fast! Du hast k vergessen. Teile χ² durch n mal k, hier 100 · 2.'
      : close(v, Math.sqrt(0.06), 0.011) ? 'Fast! k ist die kleinere Seite minus eins: min(3 − 1, 4 − 1) = 2, nicht 3.'
      : close(v, -0.3, 0.011) ? 'Fast! V ist nie negativ, es hat keine Richtung.'
      : 'Noch nicht ganz. Bestimme zuerst k = min(Zeilen − 1, Spalten − 1), dann rechne √(χ² / (n · k)).',
  },
  interpret: s => s.possible ? {
    kurz: start(s)
      ? `V ≈ ${num(s.V)}. So viel käme bei 5 mal 4 Feldern und 200 Befragten auch ganz ohne Zusammenhang leicht zustande: Im Mittel läge V dann bei etwa ${num(Math.sqrt(12 / 600))}.`
      : `V ≈ ${num(s.V)}: nach der groben Faustregel ${vWords(s.V)}. Ob das mehr ist, als der Zufall liefert, hängt von der Tabellengröße und von n ab; das prüft der Chi-Quadrat-Test.`,
    fachlich: `V = √(${num(s.chi2)} / (${count(s.n)} · ${s.k})) ≈ ${num(s.V)}. Ohne jeden Zusammenhang ist χ² im Mittel etwa so groß wie die Freiheitsgrade (r − 1)(c − 1); V liegt dann ungefähr bei √(df / (n · k)), in großen Tabellen also höher als in kleinen. Die Stufen ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark sind nur eine grobe Faustregel.`,
  } : {
    kurz: 'So ein χ² ist bei dieser Fallzahl und Tabellengröße nicht möglich: V kann höchstens 1 werden.',
    fachlich: `χ² ist höchstens n · k = ${count(s.denom)}. Darüber gäbe es keine Tabelle mit diesen Rändern.`,
  },
  think: {
    question: 'Gleiches χ², aber die Tabelle wird größer: k steigt von 1 auf 3. Was passiert mit V?',
    options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 2, mark: 'k',
    explain: 'k steht im Nenner. In größeren Tabellen kann χ² höchstens n · k groß werden; das Teilen hält V zwischen 0 und 1. Den Zufall rechnet V aber nicht heraus: Ohne jeden Zusammenhang fällt V in großen Tabellen im Schnitt größer aus als in kleinen.',
    kurz: 'V hält die Skala von 0 bis 1, egal wie groß die Tabelle ist.',
    hint: 'Probier oben „größere Tabelle: k plus 1“ aus.',
  },
  genau: {
    kurz: 'V liegt zwischen 0 und 1 und hat keine Richtung. Bei zwei Zeilen und zwei Spalten ist V der Betrag von Phi.',
    paragraphs: [
      'Die Zahlen stammen aus dem Lehrdatensatz: χ² ≈ 10,02 bei n = 200 und k = 3, also V ≈ 0,13. Gäbe es keinen Zusammenhang, käme ein so großes χ² bei 12 Freiheitsgraden in etwa 61 von 100 Stichproben vor (p ≈ 0,61). Ein Zusammenhang von Schulabschluss und Geschlechtseintrag ist hier also nicht zu erkennen.',
      'Ohne jeden Zusammenhang liegt V bei 200 Befragten im Mittel bei etwa 0,06, wenn die Tabelle zwei mal zwei Felder hat, und bei etwa 0,14 mit fünf mal vier Feldern. Vergleiche V deshalb immer mit dem, was Tabellengröße und Fallzahl schon durch Zufall liefern.',
      '„Divers“ und „Kein Eintrag“ haben je nur eine Person. So dünn besetzte Spalten machen χ² und V zusätzlich unsicher.',
      'cramers_v() aus mariposa rechnet χ² ohne Kontinuitätskorrektur. Bei seltenen Kategorien warnt R, dass die Chi-Quadrat-Näherung unzuverlässig sein kann.',
      'Starre Schwellen für „schwach“ oder „stark“ helfen bei V wenig: Wie groß ein Zusammenhang wirken muss, hängt vom Thema und von der Tabellengröße ab.',
      'Ein Zusammenhang beweist keine Ursache.',
    ],
  },
};

// ---------- Reiter ----------

const X = 'schulabschluss', Y = 'geschlecht';
/** V wie mariposa::cramers_v() mit χ², Zeilen und Spalten der Tabelle für die aktuellen Daten. */
export function vData(c: SampleCtx) {
  const xId = c.columns.x?.[0] ?? X, yId = c.columns.y?.[0] ?? Y, x = sampleColumn(c.rows, xId), y = sampleColumn(c.rows, yId);
  const t = cross(x, y), ok = Math.min(t.rows.length, t.cols.length) >= 2, chi2 = ok ? chiSquare(t.cells).chi2 : NaN;
  const df = (t.rows.length - 1) * (t.cols.length - 1), k = Math.min(t.rows.length, t.cols.length) - 1;
  return {
    V: ok ? cramersV(x, y) : null, chi2, df, p: ok ? pchisq(chi2, df, false) : 1, chance: ok ? Math.sqrt(df / (t.n * k)) : 0,
    r: t.rows.length, k: t.cols.length, n: t.n, xTitle: sampleColumnInfo(xId).title, yTitle: sampleColumnInfo(yId).title,
  };
}

export const cramersTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: X, y: Y },
    kurz: 'Dieselbe Formel mit allen 200 Befragten: Schulabschluss und Geschlechtseintrag, wie im Aufruf unter „In R“.',
    value: c => vData(c).V,
    result: c => {
      const v = vData(c);
      if (v.V === null) return { kurz: 'Bei einer der beiden Spalten kommt nur eine Kategorie vor. Dann lässt sich V nicht berechnen.', fachlich: 'Die Tabelle braucht mindestens zwei Zeilen und zwei Spalten.' };
      return {
        kurz: v.p >= 0.05
          ? `„${v.xTitle}“ und „${v.yTitle}“: V ≈ ${num(v.V)}. Ein V in dieser Höhe käme bei ${v.r} mal ${v.k} Feldern und ${v.n} Befragten auch ganz ohne Zusammenhang leicht zustande. Im Mittel läge es dann bei etwa ${num(v.chance)}.`
          : `„${v.xTitle}“ und „${v.yTitle}“ hängen mit V ≈ ${num(v.V)} zusammen, nach der groben Faustregel ${vWords(v.V)}. Ohne Zusammenhang läge V hier im Mittel nur bei etwa ${num(v.chance)}.`,
        fachlich: `Die Tabelle hat ${v.r} Zeilen und ${v.k} Spalten, also k = ${Math.min(v.r, v.k) - 1}. χ² ≈ ${num(v.chi2)} bei ${v.df} Freiheitsgraden: Gäbe es keinen Zusammenhang, käme ein so großes χ² ${v.p >= 0.01 ? `in etwa ${Math.round(v.p * 100)} von 100 Stichproben vor (p ≈ ${num(v.p)})` : v.p >= 0.001 ? 'in weniger als 1 von 100 Stichproben vor (p < 0,01)' : 'in weniger als 1 von 1.000 Stichproben vor (p < 0,001)'}. V = √(χ² / (n · k)) ≈ ${num(v.V)}.`,
        zusatz: 'Einige Kategorien sind sehr selten. Dann ist die Chi-Quadrat-Näherung unsicher, und R warnt davor.',
      };
    },
    voraussetzung: 'Beide Spalten haben Kategorien, die Reihenfolge spielt keine Rolle. Starre Schwellen für schwach oder stark sind bei V nur eine grobe Faustregel.',
    think: [
      {
        question: 'Die Codes des Schulabschlusses werden umgepolt: Aus 4 wird 0, aus 0 wird 4. Was passiert mit V?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird kleiner'], correct: 0,
        explain: 'Umpolen vertauscht nur die Reihenfolge der Zeilen. χ² zählt jede Zelle einzeln und kennt keine Reihenfolge, also bleiben χ² und V gleich.',
        kurz: 'V kennt keine Reihenfolge der Kategorien.',
        tryIt: { label: 'Schulabschluss umpolen (4 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Die Codes des Geschlechtseintrags werden umgepolt. Was passiert mit V?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Auch hier tauschen nur die Spalten ihre Plätze. Jede Zelle behält ihre beobachtete und ihre erwartete Zahl.',
        kurz: 'Welcher Code welche Kategorie trägt, ändert V nicht.',
        tryIt: { label: 'Geschlechtseintrag umpolen (3 minus Code)', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'cramers_v', variant: 0,
    tokens: {
      cramers_v: { sym: 'cramers_v()', term: T('cramers_v'), kurz: 'Berechnet Cramér-V für zwei Spalten mit Kategorien. R gibt nur die Zahl aus, ohne p-Wert.', fehler: 'Mit nur einer Spalte meldet mariposa: Exactly two variables must be specified for `chi_square()`.' },
    },
    outputMap: [
      { match: '0.1292178', atlas: 'V', explain: 'Das ist Cramér-V für Schulabschluss und Geschlechtseintrag: √(χ² / (n · k)) mit k = 3.' },
      { match: '[1]', atlas: 'Nummer der ersten Zahl', explain: '[1] gehört nicht zum Ergebnis. R nummeriert damit nur die erste Zahl einer Ausgabe.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist Cramér-V? Tippe sie an.', correct: '0.1292178',
      wrong: { '[1]': 'Fast! [1] ist nur die Nummer der ersten Zahl in der Ausgabe. V steht dahinter.' },
    },
  },
  next: {
    next: { id: 'effect', why: 'V ist eine Effektgröße: Es beschreibt die Stärke, unabhängig von der Fallzahl.' },
    before: [
      { id: 'chi_square', why: 'V entsteht aus der Chi-Quadrat-Prüfgröße.' },
      { id: 'crosstab', why: 'Die Tabelle, deren Zusammenhang V zusammenfasst.' },
    ],
    after: [{ id: 'phi', why: 'Bei zwei Zeilen und zwei Spalten ist V der Betrag von Phi.' }],
    more: [
      { id: 'expected', why: 'χ² vergleicht die beobachteten mit den erwarteten Zahlen.' },
      { id: 'goodman_gamma', why: 'Für geordnete Kategorien gibt es Maße mit Richtung.' },
    ],
  },
};
