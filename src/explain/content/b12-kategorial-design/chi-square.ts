// Werkstatt „Chi-Quadrat (Unabhängigkeit)“ (chi_square) an einer Vierfeldertafel aus dem Lehrdatensatz.
// Ton nach der Streuung (src/explain/content/streuung.ts). Zahlen in R nachgerechnet: b12-kategorial-design.test.ts.
import type { ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import { num, signed, paren, close, pct, count } from '../../format';
import { chiParts, eqFor, fine, fineParen, fineSigned, partSum, partText, shareOf, type ChiParts } from './chi-gemeinsam';
import { often, pText } from './rechnen';
import { chiSquare, cramersV, crosstab } from '../../../tasks/kit/stats';
import { columnById } from '../../../domain/survey';
import { ref, titleFor } from '../../../domain/learning';
import { pchisq } from '../../../tasks/kit/dist';

/** Vierfeldertafel: Zellen a, b, c, d (Zeile 1 links, Zeile 1 rechts, Zeile 2 links, Zeile 2 rechts) mit Beschriftung. */
export type FourData = { o: number[]; rows: [string, string]; cols: [string, string]; rowShort: [string, string]; colShort: [string, string]; rowTitle: string; colTitle: string };
export type FourStats = ChiParts & {
  rows: [string, string]; cols: [string, string]; rowShort: [string, string]; colShort: [string, string]; rowTitle: string; colTitle: string;
  rowSum: number[]; colSum: number[]; prod: number[]; cells: number; shares: number[]; overall: number; v: number; yates: number;
};

const ERWERB: Pick<FourData, 'cols' | 'colShort' | 'colTitle'> = { cols: ['nicht erwerbstätig', 'erwerbstätig'], colShort: ['nein', 'ja'], colTitle: 'Erwerbstätig' };
/** Lehrdatensatz: Weiterbildung (Zeilen) und Erwerbstätigkeit (Spalten); R: table(weiterbildung, erwerbstaetig). */
export const WB_EW: FourData = { o: [40, 78, 23, 59], rows: ['ohne Weiterbildung', 'mit Weiterbildung'], rowShort: ['nein', 'ja'], rowTitle: 'Weiterbildung', ...ERWERB };
/** Lehrdatensatz: Alter bis 65 und ab 66 Jahren (Zeilen) und Erwerbstätigkeit; R: table(alter >= 66, erwerbstaetig). */
export const ALTER_EW: FourData = { o: [34, 137, 29, 0], rows: ['bis 65 Jahre', 'ab 66 Jahren'], rowShort: ['bis 65', 'ab 66'], rowTitle: 'Alter', ...ERWERB };

export function fourStats(d: FourData): FourStats {
  const [a, b, c, dd] = d.o, rowSum = [a + b, c + dd], colSum = [a + c, b + dd], n = a + b + c + dd;
  const prod = d.o.map((_, i) => rowSum[i >> 1] * colSum[i & 1]), e = prod.map(p => n > 0 ? p / n : 0);
  const parts = chiParts(d.o, e, 1);
  const yates = d.o.reduce((s, x, i) => s + (e[i] > 0 ? Math.max(0, Math.abs(x - e[i]) - 0.5) ** 2 / e[i] : 0), 0);
  return {
    ...parts, rows: d.rows, cols: d.cols, rowShort: d.rowShort, colShort: d.colShort, rowTitle: d.rowTitle, colTitle: d.colTitle,
    rowSum, colSum, prod, cells: 4, shares: [rowSum[0] ? b / rowSum[0] : 0, rowSum[1] ? dd / rowSum[1] : 0], overall: n ? colSum[1] / n : 0,
    v: n ? Math.sqrt(parts.chi2 / n) : 0, yates,
  };
}

type C = Ctx<FourStats>;
const cell = (s: FourStats, i: number) => `Zelle ${'abcd'[i]} (${s.rows[i >> 1]}, ${s.cols[i & 1]})`;
const Z = (c: C) => cell(c.s, c.who);
const versus = (d: number) => Math.abs(d) < 1e-9 ? 'genau wie erwartet' : `${fine(Math.abs(d))} ${d > 0 ? 'mehr' : 'weniger'} als erwartet`;

const terms = (c: C): FNode[] => c.s.o.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 5 }, ' '] as FNode[] : []),
  { part: ['('], m: 3 }, { part: [`${x} −`], m: 2 }, ' ', { part: [fine(c.s.e[i])], m: 1 }, { part: [')²'], m: 3 }, ' ', { part: [`/ ${fine(c.s.e[i])}`], m: 4 },
]);

export const unabhaengigkeit: Workshop<FourData, FourStats> = {
  id: 'b12-unabhaengigkeit',
  wofuer: 'Sind Befragte mit Weiterbildung häufiger erwerbstätig als die ohne? Im Lehrdatensatz sind es 72 % gegen 66 %. Ist das mehr, als der Zufall allein liefern würde? Der Chi-Quadrat-Test vergleicht die Kreuztabelle mit der Tabelle, die du ohne jeden Zusammenhang erwarten würdest.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus kleinen Schritten, die du alle schon kannst: malnehmen, teilen, abziehen, quadrieren, zusammenzählen. Den Vergleich mit dem Zufall im letzten Schritt übernimmt R. Hier geht es ums Verstehen.',
  picture: 'b12-unabhaengigkeit',
  dataNote: 'Vier Zellen einer Kreuztabelle aus dem Lehrdatensatz, a bis d. Wähle eine Zelle in der Rechentabelle.',
  names: ['a', 'b', 'c', 'd'],
  bounds: { min: 0, max: 100000 },
  presets: [
    { id: 'wb', label: 'Weiterbildung und Erwerbstätigkeit', data: WB_EW },
    { id: 'alter', label: 'Alter und Erwerbstätigkeit', data: ALTER_EW },
  ],
  compute: fourStats,
  glyphs: [
    { sym: 'Oⱼₖ', say: 'O j k', term: 'Beobachtete Zellhäufigkeit', plain: 'wie viele Befragte in Zeile j und Spalte k stehen', step: 2 },
    { sym: 'Eⱼₖ', say: 'E j k', term: 'Erwartete Zellhäufigkeit', plain: 'wie viele es ohne Zusammenhang wären: Zeilensumme mal Spaltensumme durch n', step: 1 },
    { sym: 'j, k', say: 'j, k', term: 'Zeile und Spalte', plain: 'welche Zelle gemeint ist', step: 2 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Zelle einmal', step: 5 },
    { sym: 'χ²', say: 'Chi-Quadrat', term: 'Prüfgröße', plain: 'wie weit die Tabelle insgesamt von der Unabhängigkeit weg ist', step: 5 },
    { sym: 'df', say: 'd f', term: 'Freiheitsgrade', plain: '(Zeilen − 1) mal (Spalten − 1), bei vier Feldern also 1', step: 6 },
  ],
  steps: [
    {
      button: 'Eⱼₖ', title: 'Erwarten, was ohne Zusammenhang käme', sym: 'Eⱼₖ', say: 'E j k', concept: 'expected', perPerson: false,
      links: [{ id: 'crosstab', label: 'Kreuztabelle' }, { id: 'stochastic_independence', label: 'Stochastische Unabhängigkeit' }],
      was: 'Wir tun so, als hätten die beiden Merkmale nichts miteinander zu tun. Dann bekommt jede Zelle ihren Anteil: Zeilensumme mal Spaltensumme, geteilt durch n.',
      rechnung: c => `${Z(c)}: ${c.s.rowSum[c.who >> 1]} · ${c.s.colSum[c.who & 1]} / ${c.s.n} = ${count(c.s.prod[c.who])} / ${c.s.n} ${eqFor(fine(c.s.e[c.who]), c.s.e[c.who])} ${fine(c.s.e[c.who])}.`,
      fach: 'Die erwartete Zellhäufigkeit Eⱼₖ = Zeilensumme mal Spaltensumme / n gilt, wenn beide Merkmale stochastisch unabhängig sind.',
      warum: c => `Ohne Zusammenhang wären in beiden Zeilen gleich viele ${c.s.cols[1]}: ${pct(c.s.overall)} wie unter allen ${c.s.n}. Genau das rechnet die Formel aus.`,
      acht: 'Erwartete Zahlen müssen keine ganzen Zahlen sein. Ein Bruchteil einer Person kommt nicht vor, als Maßstab ist die Zahl trotzdem richtig.',
      check: {
        question: c => `Wie viele Befragte erwartest du in Zelle ${c.names[c.who]}?`,
        answer: c => c.s.e[c.who],
        diagnose: (c, v) => v === 'NA' ? null
          : !close(c.s.prod[c.who], c.s.e[c.who]) && close(v, c.s.prod[c.who]) ? `Fast! Das ist Zeilensumme mal Spaltensumme. Jetzt noch durch n = ${c.s.n} teilen.`
          : !close(c.s.o[c.who], c.s.e[c.who]) && close(v, c.s.o[c.who]) ? 'Fast! Das ist die beobachtete Zahl. Erwartet ist, was ohne Zusammenhang herauskäme.'
          : !close(c.s.n / 4, c.s.e[c.who]) && close(v, c.s.n / 4) ? 'Fast! Ein Viertel von n stimmt nur, wenn alle Zeilen und Spalten gleich groß sind. Nimm Zeilensumme mal Spaltensumme durch n.'
          : null,
      },
    },
    {
      button: 'Oⱼₖ − Eⱼₖ', title: 'Abweichungen messen', sym: 'Oⱼₖ − Eⱼₖ', say: 'O j k minus E j k', concept: 'subtract', perPerson: false,
      links: [{ id: 'crosstab', label: 'Beobachtete Zellhäufigkeiten' }],
      was: 'Für jede Zelle rechnen wir: beobachtet minus erwartet. Das Vorzeichen zeigt, ob mehr oder weniger Befragte darin stehen als erwartet.',
      rechnung: c => `${Z(c)}: ${c.s.o[c.who]} − ${fine(c.s.e[c.who])} ${eqFor(fine(c.s.e[c.who]), c.s.e[c.who])} ${fineSigned(c.s.dev[c.who])}, also ${versus(c.s.dev[c.who])}.`,
      fach: 'Oⱼₖ ist die beobachtete Häufigkeit in Zeile j und Spalte k. Die Differenz Oⱼₖ − Eⱼₖ zeigt die Abweichung dieser Zelle von der Unabhängigkeit.',
      warum: 'Der Test fragt: Wie weit ist die Tabelle von einer Tabelle ohne Zusammenhang weg? Genau das messen wir hier, Zelle für Zelle.',
      acht: 'In einer Vierfeldertafel sind alle vier Abweichungen gleich groß, nur die Vorzeichen wechseln. Zusammen ergeben sie immer 0.',
      check: {
        question: c => `Wie weit liegt Zelle ${c.names[c.who]} über oder unter der Erwartung? Mit Vorzeichen.`,
        answer: c => c.s.dev[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who];
          return v !== 'NA' && Math.abs(d) > 1e-9 && close(v, -d) ? 'Fast! Der Abstand stimmt, nur die Richtung nicht. Rechne beobachtet minus erwartet.' : null;
        },
      },
    },
    {
      button: '( )²', title: 'Abweichungen quadrieren', sym: '(Oⱼₖ − Eⱼₖ)²', say: 'O j k minus E j k, zum Quadrat', concept: 'square', perPerson: false,
      was: 'Jede Abweichung nehmen wir mit sich selbst mal. Danach sind alle Zahlen positiv.',
      rechnung: c => `${Z(c)}: ${fineParen(c.s.dev[c.who])} · ${fineParen(c.s.dev[c.who])} ${eqFor(num(c.s.sq[c.who]), c.s.sq[c.who])} ${num(c.s.sq[c.who])}${c.s.dev[c.who] < -1e-9 ? '. Minus mal Minus ergibt Plus.' : '.'}`,
      fach: 'Die quadrierte Abweichung (Oⱼₖ − Eⱼₖ)² ist nie negativ. Große Abweichungen zählen dadurch stärker als kleine.',
      warum: 'Sonst heben sich Plus und Minus auf, denn zusammen ergeben die Abweichungen immer 0. Und große Abweichungen sollen stärker zählen.',
      acht: 'Im Taschenrechner Klammern setzen: (−2,83)² ≈ 8,01. Ohne Klammern zeigt er eine negative Zahl. Ein Quadrat ist nie negativ.',
      check: {
        question: c => `Was kommt heraus, wenn du ${fineParen(c.s.dev[c.who])} mit sich selbst malnimmst?`,
        answer: c => c.s.sq[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who], q = c.s.sq[c.who];
          if (v === 'NA') return null;
          if (q > 1e-9 && close(v, -q)) return 'Fast! Das Minus ist zu viel: Minus mal Minus ergibt Plus. Ein Quadrat ist nie negativ.';
          if (Math.abs(d) > 1e-9 && close(v, 2 * Math.abs(d)) && !close(v, q)) return `Fast! Das ist mal 2. Mit sich selbst malnehmen heißt: ${fineParen(d)} · ${fineParen(d)}.`;
          return null;
        },
      },
    },
    {
      button: '÷ Eⱼₖ', title: 'An der Erwartung messen', sym: '(Oⱼₖ − Eⱼₖ)² / Eⱼₖ', say: 'O j k minus E j k zum Quadrat, geteilt durch E j k', concept: 'divide', perPerson: false,
      was: 'Jedes Quadrat teilen wir durch die erwartete Zahl seiner Zelle. So wird jede Abweichung an ihrer Erwartung gemessen.',
      rechnung: c => { const t = partText(c.s.part[c.who]); return `${Z(c)}: ${num(c.s.sq[c.who])} / ${fine(c.s.e[c.who])} ${eqFor(t, c.s.part[c.who])} ${t}.`; },
      fach: 'Der Quotient (Oⱼₖ − Eⱼₖ)² / Eⱼₖ ist der Beitrag der Zelle zur Prüfgröße χ².',
      warum: 'Dieselbe Abweichung wiegt in einer kleinen Zelle schwerer als in einer großen. 3 zu viel bei 10 Erwarteten sind viel, bei 1.000 kaum etwas.',
      acht: 'Geteilt wird durch die erwartete Zahl Eⱼₖ, nicht durch die beobachtete und nicht durch n.',
      check: {
        question: c => `Was kommt heraus, wenn du ${num(c.s.sq[c.who])} durch ${fine(c.s.e[c.who])} teilst?`,
        answer: c => c.s.part[c.who],
        diagnose: (c, v) => {
          const q = c.s.sq[c.who], o = c.s.o[c.who], part = c.s.part[c.who];
          if (v === 'NA' || q < 1e-9) return null;
          if (close(v, q)) return `Fast! Das ist noch das Quadrat. Jetzt noch durch ${fine(c.s.e[c.who])} teilen.`;
          if (o > 0 && !close(q / o, part) && close(v, q / o)) return `Fast! Du hast durch die beobachtete Zahl geteilt. Geteilt wird durch die erwartete, hier ${fine(c.s.e[c.who])}.`;
          if (!close(q / c.s.n, part) && close(v, q / c.s.n)) return `Fast! Du hast durch alle ${c.s.n} geteilt. Geteilt wird durch die erwartete Zahl, hier ${fine(c.s.e[c.who])}.`;
          return null;
        },
      },
    },
    {
      button: 'Σ', title: 'Alles zusammenzählen', sym: 'χ²', say: 'Chi-Quadrat', concept: 'chi_square', perPerson: false,
      was: 'Wir zählen die vier Beiträge aus Schritt 4 zusammen. Das Ergebnis heißt χ².',
      rechnung: c => { const s = partSum(c.s); return `${s.line}.${s.note} Zelle ${c.names[c.who]} steuert ${partText(c.s.part[c.who])} bei, das sind ${shareOf(c.s.part[c.who], c.s.chi2)} von χ².`; },
      fach: 'χ² = Σ (Oⱼₖ − Eⱼₖ)² / Eⱼₖ über alle Zellen ist die Prüfgröße des Chi-Quadrat-Tests auf Unabhängigkeit.',
      warum: 'So steckt die ganze Abweichung von der Unabhängigkeit in einer Zahl. χ² = 0 hieße: Die Anteile sind in beiden Zeilen genau gleich.',
      acht: 'Zusammengezählt werden die Beiträge aus Schritt 4, nicht die Abweichungen. Die Abweichungen allein ergäben immer 0.',
      check: {
        question: 'Wie groß ist die Summe der vier Beiträge?',
        answer: c => c.s.chi2,
        diagnose: (c, v) => v === 'NA' || c.s.chi2 < 1e-9 ? null
          : close(v, 0) ? 'Fast! 0 ist die Summe der Abweichungen. Gefragt ist die Summe der Beiträge aus Schritt 4.'
          : !close(c.s.sumSq, c.s.chi2) && close(v, c.s.sumSq) ? 'Fast! Das ist die Summe der Quadrate. Jedes Quadrat teilst du vorher durch seine erwartete Zahl.'
          : null,
      },
    },
    {
      button: 'df, p', title: 'Mit dem Zufall vergleichen', sym: 'df = (r − 1) · (c − 1)', say: 'd f gleich r minus 1 mal c minus 1', concept: 'chi_square_distribution', perPerson: false,
      links: [{ id: 'general_df', label: 'Freiheitsgrade im Modell' }, { id: 'p_value', label: 'p-Wert' }],
      was: 'Wir zählen die Freiheitsgrade: Zeilen minus eins mal Spalten minus eins. Damit sagt die χ²-Verteilung, wie oft der Zufall allein so ein χ² liefert.',
      rechnung: c => `df = (2 − 1) · (2 − 1) = 1. Gäbe es keinen Zusammenhang, käme ein χ² von mindestens ${num(c.s.chi2)} ${often(c.s.p)} vor (${pText(c.s.p)}).`,
      fach: 'Unter der Nullhypothese der Unabhängigkeit folgt χ² näherungsweise einer χ²-Verteilung mit (r − 1)(c − 1) Freiheitsgraden; r und c zählen Zeilen und Spalten.',
      warum: 'Stehen alle Zeilen- und Spaltensummen fest, legt eine Zelle die anderen drei fest. Frei wählbar ist bei vier Feldern also nur eine Zahl.',
      acht: 'χ² und p sagen nicht, wie stark der Zusammenhang ist. Bei sehr vielen Befragten wird auch ein winziger Unterschied überraschend.',
      check: {
        question: 'Wie viele Freiheitsgrade hat eine Vierfeldertafel?',
        answer: () => 1,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.cells) ? 'Fast! Das ist die Zahl der Zellen. Frei wählbar ist nur eine: (2 − 1) · (2 − 1) = 1.'
          : close(v, c.s.cells - 1) ? 'Fast! Zellen minus eins gilt beim Anpassungstest. Hier stehen auch die Zeilen- und Spaltensummen fest: (2 − 1) · (2 − 1) = 1.'
          : null,
      },
    },
  ],
  numeric: (c, last) => [
    'χ² = ', ...terms(c), { br: true },
    '= ', { part: [partSum(c.s).terms], m: 4 }, ` ${partSum(c.s).sign} `, { part: [num(c.s.chi2)], m: 5 },
    ...(last >= 6 ? [{ br: true }, { part: ['df = (2 − 1) · (2 − 1) = 1'], m: 6 }, ', ', { part: [pText(c.s.p)], m: 6 }] as FNode[] : []),
  ],
  table: {
    rowHead: 'Zelle', // Die Zeilen sind Zellen der Kreuztabelle, keine Personen (IB14, IB31).
    columns: [
      { head: 'Oⱼₖ', from: 1, active: [1, 2], cell: (c, i) => String(c.s.o[i]), sum: c => String(c.s.n), sumFrom: 1 },
      { head: 'Eⱼₖ', from: 1, active: [1], cell: (c, i) => fine(c.s.e[i]), sum: c => num(c.s.n), sumFrom: 1 },
      { head: 'Oⱼₖ − Eⱼₖ', from: 2, active: [2], cell: (c, i) => fineSigned(c.s.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer', tone: (c, i) => c.s.dev[i] > 1e-9 ? 'pos' : c.s.dev[i] < -1e-9 ? 'neg' : undefined },
      { head: '(Oⱼₖ − Eⱼₖ)²', from: 3, active: [3], cell: (c, i) => num(c.s.sq[i]) },
      { head: '(Oⱼₖ − Eⱼₖ)² / Eⱼₖ', from: 4, active: [4, 5], cell: (c, i) => partText(c.s.part[i]), sum: c => num(c.s.chi2), sumFrom: 5 },
    ],
    lines: [
      { from: 1, step: 1, text: c => `Zeilensummen ${c.s.rowSum.join(' und ')}, Spaltensummen ${c.s.colSum.join(' und ')}, n = ${c.s.n}` },
      { from: 5, step: 5, text: c => `χ² = ${partSum(c.s).line}` },
      { from: 6, step: 6, text: c => `df = 1; ${pText(c.s.p)}` },
    ],
  },
  captions: {
    1: 'Groß steht die beobachtete Zahl jeder Zelle, klein darunter die erwartete. Rechts und unten stehen die Summen.',
    2: 'Unter jeder Zahl steht jetzt ihre Abweichung von der Erwartung.',
    3: 'Quadriert sind alle vier Abweichungen positiv.',
    4: 'Unter jeder Zahl steht ihr Beitrag zu χ²: das Quadrat geteilt durch die erwartete Zahl.',
    5: 'Die vier Beiträge zusammen ergeben χ².',
    6: 'Bei einem Freiheitsgrad sagt die χ²-Verteilung, wie überraschend dieses χ² wäre.',
  },
  think: [
    {
      question: 'Beide Zeilen haben dieselben Anteile: 30 und 70 von je 100. Wie groß wird χ²?',
      options: ['0', '1', 'hängt von n ab'], correct: 0, step: 2,
      explain: 'Die Zeilensummen sind 100 und 100, die Spaltensummen 60 und 140. Erwartet sind 100 · 60 / 200 = 30 und 100 · 140 / 200 = 70, genau wie beobachtet. Jede Abweichung ist 0, also auch χ².',
      kurz: 'Gleiche Anteile in allen Zeilen heißt: kein Zusammenhang.',
      tryIt: { label: 'gleiche Anteile: 30 70 30 70', apply: d => ({ ...d, o: [30, 70, 30, 70] }) },
    },
    {
      question: 'Alle vier Zahlen verdoppeln sich, die Anteile bleiben gleich. Was macht χ²?',
      options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 4,
      explain: 'Jede Abweichung verdoppelt sich, ihr Quadrat vervierfacht sich. Die erwartete Zahl verdoppelt sich nur. Viermal geteilt durch zweimal: χ² verdoppelt sich.',
      kurz: 'Mehr Befragte mit denselben Anteilen machen χ² größer.',
      // Die Tafel hat keine ziehbaren Punkte; die Grenze 100.000 hält nur die Zahlen lesbar und wird mit Klicks kaum erreicht.
      tryIt: { label: 'alle Zahlen verdoppeln', apply: d => d.o.every(x => x * 2 <= 100000) ? { ...d, o: d.o.map(x => x * 2) } : d },
    },
    {
      question: 'Du vertauschst die beiden Zeilen. Was macht χ²?',
      options: ['bleibt gleich', 'ändert sich'], correct: 0, step: 5,
      explain: 'Dieselben vier Zellen stehen nur an anderer Stelle. Jede Zelle behält ihre Erwartung und ihren Beitrag, also bleibt auch χ². Die Reihenfolge der Kategorien spielt keine Rolle.',
      kurz: 'χ² kennt keine Reihenfolge der Kategorien.',
      tryIt: { label: 'Zeilen vertauschen', apply: d => ({ ...d, o: [d.o[2], d.o[3], d.o[0], d.o[1]], rows: [d.rows[1], d.rows[0]], rowShort: [d.rowShort[1], d.rowShort[0]] }) },
    },
  ],
  variants: {
    chi_square: {
      lastStep: 6,
      kurz: 'Der Chi-Quadrat-Test prüft, ob zwei kategoriale Merkmale zusammenhängen. Er vergleicht die Kreuztabelle mit der Tabelle, die du ohne Zusammenhang erwarten würdest.',
      fachlich: 'χ² = Σ (Oⱼₖ − Eⱼₖ)² / Eⱼₖ mit Eⱼₖ = Zeilensumme mal Spaltensumme / n, verglichen mit einer χ²-Verteilung mit (r − 1)(c − 1) Freiheitsgraden.',
      symbolic: ['χ² = ', { big: 'Σ', m: 5 }, { frac: [{ part: ['('], m: 3 }, { part: ['O', { sub: 'jk' }, ' −'], m: 2 }, ' ', { part: ['E', { sub: 'jk' }], m: 1 }, { part: [')²'], m: 3 }], den: [{ part: ['E', { sub: 'jk' }], m: 4 }], m: 4 },
        ',  ', { part: ['df = (r − 1)(c − 1)'], m: 6 }],
      aria: 'Chi-Quadrat gleich Summe über alle Zellen von O j k minus E j k, zum Quadrat, geteilt durch E j k; Freiheitsgrade r minus 1 mal c minus 1',
      metrics: [{ label: 'Befragte n', value: c => String(c.s.n) }, { label: 'Prüfgröße χ²', value: c => num(c.s.chi2) }],
      interpret: c => ({
        kurz: `Von den Befragten ${c.s.rows[1]} sind ${pct(c.s.shares[1])} ${c.s.cols[1]}, von denen ${c.s.rows[0]} ${pct(c.s.shares[0])}. ${c.s.chi2 < 1e-9
          ? 'Die Anteile sind gleich, χ² ist 0: Die Tabelle zeigt keinen Zusammenhang.'
          : `Gäbe es keinen Zusammenhang, käme ein χ² von mindestens ${num(c.s.chi2)} ${often(c.s.p)} vor. ${c.s.p >= 0.05 ? 'Die Daten sprechen also nicht deutlich gegen die Unabhängigkeit.' : 'Bei α = 0,05 sprechen die Daten gegen die Unabhängigkeit.'}`}`,
        fachlich: `χ² = ${num(c.s.chi2)} bei 1 Freiheitsgrad, ${pText(c.s.p)}; Cramér-V ≈ ${num(c.s.v)}. Die kleinste erwartete Zellhäufigkeit ist ${fine(c.s.minE)}${c.s.minE >= 5 ? '; die Faustregel „mindestens 5“ ist erfüllt.' : '. Das liegt unter der Faustregel 5; nimm dann den exakten Test nach Fisher.'}`,
      }),
      genau: {
        kurz: 'Die χ²-Verteilung ist eine Näherung, die gut passt, wenn in jeder Zelle genug Befragte erwartet werden. χ² sagt, ob die Merkmale zusammenhängen, nicht wie stark und in welche Richtung.',
        paragraphs: c => [
          `Bei Vierfeldertafeln gibt es eine Kontinuitätskorrektur nach Yates: Von jedem Abstand |Oⱼₖ − Eⱼₖ| wird 0,5 abgezogen. mariposa rechnet sie mit correct = TRUE; hier ergäbe das χ² ≈ ${num(c.s.yates)} statt ${num(c.s.chi2)}.`,
          'Die Faustregel verlangt in jeder Zelle eine erwartete Häufigkeit von mindestens 5. Bei kleineren Zahlen ist der p-Wert aus der χ²-Verteilung ungenau; der exakte Test nach Fisher kommt ohne diese Näherung aus.',
          'χ² ist nie negativ und zeigt keine Richtung. Die Richtung liest du an den Anteilen in den Zeilen ab, die Stärke an Cramér-V (bei vier Feldern der Betrag von Phi).',
          'Der Test nimmt unabhängige Befragte an, und jede Person steht in genau einer Zelle. Für dieselben Personen zu zwei Zeitpunkten passt McNemar.',
        ],
      },
    },
  },
};

/**
 * Kreuztabelle zweier Spalten wie mariposa::chi_square 0.7.4: nur beobachtete Kategorien, ohne Korrektur.
 * null, wenn eine Spalte nur eine Kategorie hat (mariposa rechnet dann nicht).
 */
export function crossChi(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'schulabschluss', y = c.columns.y?.[0] ?? 'weiterbildung';
  const xs = c.rows.map(r => r.values[x]), ys = c.rows.map(r => r.values[y]), t = crosstab(xs, ys);
  if (t.rows.length < 2 || t.cols.length < 2) return null;
  const rowSum = t.cells.map(r => r.reduce((a, b) => a + b, 0)), colSum = t.cols.map((_, j) => t.cells.reduce((a, r) => a + r[j], 0));
  const { chi2, df } = chiSquare(t.cells), minE = Math.min(...rowSum.flatMap(r => colSum.map(c2 => r * c2 / t.n))), last = t.cols.length - 1;
  const share = t.rows.map((r, i) => ({ code: r, share: t.cells[i][last] / rowSum[i] }));
  return { x, y, t, chi2, df, p: pchisq(chi2, df, false), v: cramersV(xs, ys), minE, share };
}
const label = (id: string, code: number) => columnById[id]?.categories?.find(k => k.value === code)?.label ?? String(code);

export const chiSquareTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss', y: 'weiterbildung' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten, jetzt für Schulabschluss und Weiterbildung: zehn Zellen statt vier, so wie R sie rechnet.',
    value: c => crossChi(c)?.chi2 ?? null,
    result: c => {
      const r = crossChi(c);
      if (!r) return { kurz: 'Eine der beiden Spalten hat nur noch eine Antwort. Dann gibt es nichts zu vergleichen, und mariposa rechnet den Test nicht.', fachlich: 'chi_square() rechnet dann nicht und warnt, dass eine Spalte nur eine beobachtete Kategorie hat.' };
      const lo = r.share.reduce((a, b) => b.share < a.share ? b : a), hi = r.share.reduce((a, b) => b.share > a.share ? b : a);
      return {
        kurz: `Der Anteil mit Weiterbildung reicht je nach Schulabschluss von ${pct(lo.share)} (${label(r.x, lo.code)}) bis ${pct(hi.share)} (${label(r.x, hi.code)}). Gäbe es keinen Zusammenhang, käme ein χ² von mindestens ${num(r.chi2)} ${often(r.p)} vor.`,
        fachlich: `χ² = ${num(r.chi2)} bei ${r.df} Freiheitsgraden, ${pText(r.p)}; Cramér-V ≈ ${num(r.v)}.`,
        zusatz: `Die kleinste erwartete Zellhäufigkeit ist ${num(r.minE)}; die Faustregel „mindestens 5“ ist ${r.minE >= 5 ? 'erfüllt' : 'verletzt'}.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an. Als Faustregel sollte jede erwartete Zellhäufigkeit mindestens 5 sein.',
    think: [
      {
        question: 'Die Codes des Schulabschlusses werden umgedreht: Aus 0 wird 4 und aus 4 wird 0. Was passiert mit χ²?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die Zeilen der Tabelle tauschen nur ihre Plätze. Jede Zelle behält ihre beobachtete und ihre erwartete Zahl, also bleibt χ² gleich.',
        kurz: 'χ² kennt keine Reihenfolge der Kategorien.',
        tryIt: { label: 'Schulabschluss umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Aus jedem Ja bei der Weiterbildung wird ein Nein und umgekehrt. Was passiert mit p?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
        explain: 'Die beiden Spalten der Tabelle tauschen ihre Plätze. Die Abweichungen von der Erwartung bleiben dieselben, also auch χ² und p.',
        kurz: 'Umpolen ändert nichts an der Frage, ob zwei Merkmale zusammenhängen.',
        tryIt: { label: 'Weiterbildung umpolen', op: 'reverse', column: 'y' },
        expect: { change: 'same', measure: c => crossChi(c)?.p ?? null },
      },
    ],
  },
  r: {
    entry: 'chi_square', variant: 0,
    tokens: {
      chi_square: { sym: 'chi_square()', term: titleFor(ref('chi_square')), kurz: 'Prüft, ob zwei kategoriale Spalten zusammenhängen. Meldet χ², die Freiheitsgrade, p, Cramér-V und die Zahl der Befragten N.', fehler: 'Mit nur einer Spalte meldet mariposa: Exactly two variables must be specified for `chi_square()`.' },
      correct: { sym: 'correct =', term: 'Kontinuitätskorrektur', kurz: 'FALSE rechnet χ² ohne Korrektur, wie in der Werkstatt. TRUE zieht bei vier Feldern von jedem Abstand 0,5 ab.', fehler: 'Bei mehr als zwei Zeilen oder Spalten wirkt correct = TRUE nicht. Die Korrektur gibt es nur für Vierfeldertafeln.' },
    },
    outputMap: [
      { match: 'chi2', atlas: 'χ²', step: 5, explain: 'Die Prüfgröße aus Schritt 5. In Klammern stehen die Freiheitsgrade: (5 − 1) · (2 − 1) = 4.' },
      { match: 'p', atlas: 'p-Wert', step: 6, explain: 'Gäbe es keinen Zusammenhang, käme ein χ² von mindestens 3,08 in etwa 54 von 100 Stichproben vor.' },
      { match: 'V', atlas: 'Cramér-V', explain: 'Cramér-V misst die Stärke des Zusammenhangs zwischen 0 und 1. In Klammern steht eine Faustregel-Einordnung nach Cohen (ab 0,1 klein, ab 0,3 mittel); small heißt klein.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten mit Angaben in beiden Spalten.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist χ²? Tippe sie an.', correct: 'chi2',
      wrong: { p: 'Fast! Das ist der p-Wert. χ² steht hinter chi2, mit den Freiheitsgraden in Klammern.', V: 'Fast! Das ist Cramér-V, die Stärke des Zusammenhangs. χ² steht hinter chi2.', N: 'Fast! N ist die Zahl der Befragten. χ² steht hinter chi2.' },
    },
  },
  next: {
    next: { id: 'cramers_v', why: 'χ² sagt, ob zwei Merkmale zusammenhängen. Cramér-V sagt, wie stark.' },
    before: [
      { id: 'crosstab', why: 'Die beobachtete Tabelle, die der Test mit der erwarteten vergleicht.' },
      { id: 'expected', why: 'Die Zahlen, die ohne Zusammenhang zu erwarten wären.' },
      { id: 'chi_square_distribution', why: 'Sagt, wie oft der Zufall allein ein so großes χ² liefert.' },
    ],
    after: [
      { id: 'fisher_test', why: 'Rechnet exakt, wenn erwartete Zellhäufigkeiten unter 5 liegen.' },
      { id: 'phi', why: 'Misst bei vier Feldern Stärke und Richtung des Zusammenhangs.' },
    ],
    more: [
      { id: 'mcnemar_test', why: 'Für dieselben Personen zu zwei Zeitpunkten statt für zwei Gruppen.' },
      { id: 'chisq_gof', why: 'Dieselbe Rechnung für ein einzelnes Merkmal und eine vorgegebene Verteilung.' },
    ],
  },
};
