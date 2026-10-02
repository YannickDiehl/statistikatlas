// Werkstatt „Wilcoxon, verbunden“ (B11): sechs Personen schreiben denselben Wissenstest zweimal; Differenzen, Ränge der
// Beträge, Rangsumme der Verbesserungen und z wie mariposa::wilcoxon_test(). Ton nach der Streuung.
// Alle Zahlen sind in R nachgerechnet (b11-rangtests.test.ts).
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import type { Pairs } from '../../math';
import { close, count, num, pct, signed } from '../../format';
import { sumNodes } from '../../sample';
import { columnsOf, midRanks, signedRank, type SignedRank } from './rank';
import { pOften, pText, rWord, signif } from './words';

export const WX_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export const WX_START: Pairs = { x: [8, 11, 9, 12, 7, 10], y: [11, 12, 7, 17, 11, 16] };
export const WX_TIES: Pairs = { x: [8, 11, 9, 12, 7, 10], y: [11, 11, 7, 14, 9, 13] };

export type WxStats = SignedRank & {
  xs: number[]; ys: number[];
  /** Rang des Betrags, wenn man die Nullen mitzählte (Denkfehler); Summe der positiven Differenzen (Denkfehler). */
  withZeros: number[]; dPos: number;
  /** min(W⁺, W⁻), seine Erwartung, U − E und U / σ für die Diagnosen; n(n + 1) / 2. */
  small: number; gap: number; noE: number; total: number;
  ties: boolean;
  /** Exakter p-Wert wie wilcox.test(paired = TRUE) ohne Gleichstände und Nullen, sonst null. */
  exact: number | null;
};

/** Exakter zweiseitiger p-Wert: Anteil aller 2ⁿ Vorzeichenmuster der Ränge 1 bis n mit einer ebenso kleinen Rangsumme. */
function exactP(n: number, small: number): number {
  let hits = 0;
  for (let mask = 0; mask < 2 ** n; mask++) {
    let w = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) w += i + 1;
    if (w <= small + 1e-9) hits++;
  }
  return Math.min(1, 2 * hits / 2 ** n);
}

export function wxCompute(d: Pairs): WxStats {
  const t = signedRank(d.x, d.y), abs = t.d.map(Math.abs), all = midRanks(abs);
  const small = Math.min(t.Wpos, t.Wneg), kept = abs.filter(v => v > 0);
  const ties = new Set(kept).size < kept.length;
  return {
    ...t, xs: [...d.x], ys: [...d.y],
    withZeros: all, dPos: t.d.filter(v => v > 0).reduce((a, b) => a + b, 0),
    small, gap: small - t.E, noE: t.sd > 0 ? small / t.sd : 0, total: t.n * (t.n + 1) / 2,
    ties, exact: !ties && t.nZero === 0 && t.n > 0 ? exactP(t.n, small) : null,
  };
}

type C = Ctx<WxStats>;
const P = (c: C) => c.names[c.who];
const tasks = (v: number) => `${num(v)} ${Math.abs(v) === 1 ? 'Aufgabe' : 'Aufgaben'}`;
const zText = (c: C) => num(c.s.z);
const plusRanks = (c: C, sign: 1 | -1) => c.s.signed.filter(v => Math.sign(v) === sign).map(v => num(Math.abs(v)));

const numeric = (c: C): FNode[] => [
  { part: [`W⁺ = ${plusRanks(c, 1).join(' + ') || '0'}${plusRanks(c, 1).length > 1 ? ` = ${num(c.s.Wpos)}` : ''}`], m: 3 }, ', ', { part: [`W⁻ = ${num(c.s.Wneg)}`], m: 3 }, { br: true },
  { part: [c.s.n ? `z = (${num(c.s.small)} − ${num(c.s.E)}) / ${num(c.s.sd)} ≈ ${zText(c)}` : 'z = 0'], m: 4 },
];

// Brücke „Mit 200 Befragten“ ----------------------------------------------------------------

type B = BridgeCtx<WxStats>;
const BP = (c: B) => c.names[c.who];
const T1 = (c: B) => `„${c.col.title}“`, T2 = (c: B) => `„${c.col2!.title}“`;
const plusTerm = (c: B, i: number): FNode[] => [c.s.d[i] > 0 ? num(c.s.rank[i]) : '0'];
const zeros = (k: number) => k === 0 ? 'Keine Differenz ist 0.' : k === 1 ? 'Eine Null fällt weg.' : `${k} Nullen fallen weg.`;

/** Dieselben vier Schritte mit allen 200 Befragten (zweite minus erste Spalte der Spaltenwahl). */
export const bridgeWilcoxon: Bridge<WxStats> = {
  data: 'pairs',
  numeric: (c, last) => {
    const w: FNode[] = ['W⁺ = ', ...sumNodes(c.values.length, c.who, i => plusTerm(c, i)), ' = ', { part: [num(c.s.Wpos)], m: 3 }];
    return last >= 4 ? [...w, { br: true }, { part: [c.s.n ? `z = (${num(c.s.small)} − ${num(c.s.E)}) / ${num(c.s.sd)} ≈ ${num(c.s.z)}` : 'z = 0'], m: 4 }] : w;
  },
  lines: [
    {
      all: c => `Für jede Person ${T2(c)} minus ${T1(c)}: ${c.s.nPos} Plus, ${c.s.nNeg} Minus, ${c.s.nZero} Nullen.`,
      person: c => `${BP(c)}: ${num(c.values2![c.who])} − ${num(c.values[c.who])} = ${signed(c.s.d[c.who])}.`,
    },
    {
      all: c => c.s.n === 0 ? 'Alle Differenzen sind 0, es bleibt nichts zu ordnen.' : `${zeros(c.s.nZero)} Die übrigen ${c.s.n} Beträge bekommen die Ränge 1 bis ${c.s.n}; gleiche Beträge teilen sich ihren Platz.`,
      person: c => c.s.d[c.who] === 0 ? `${BP(c)} hat die Differenz 0 und fällt weg.` : `${BP(c)}: |${signed(c.s.d[c.who])}| = ${num(Math.abs(c.s.d[c.who]))}, Rang ${num(c.s.rank[c.who])}.`,
    },
    {
      all: c => c.s.n === 0 ? 'Beide Rangsummen sind 0.' : `W⁺ = ${num(c.s.Wpos)}, W⁻ = ${num(c.s.Wneg)}. Zusammen ${num(c.s.total)} = ${c.s.n} · ${c.s.n + 1} / 2.`,
      person: c => { const d = c.s.d[c.who]; return d === 0 ? `${BP(c)} steuert nichts bei.` : `${BP(c)} steuert ${num(c.s.rank[c.who])} zu ${d > 0 ? 'W⁺' : 'W⁻'} bei.`; },
    },
    {
      all: c => c.s.n === 0 ? 'Ohne Veränderung meldet R wie SPSS z = 0 und p = 1.' : `Erwartung ${c.s.n} · ${c.s.n + 1} / 4 = ${num(c.s.E)}. z = (${num(c.s.small)} − ${num(c.s.E)}) / ${num(c.s.sd)} ≈ ${num(c.s.z)}.`,
      person: c => c.s.d[c.who] === 0 ? `${BP(c)} zählt für z nicht mit.` : `Der Rang von ${BP(c)} macht ${pct(c.s.rank[c.who] / c.s.total, 2)} aller Ränge aus.`,
    },
  ],
  metrics: c => [
    { label: 'Paare ohne Nulldifferenz n', value: String(c.s.n) },
    { label: 'z', value: num(c.s.z) },
    { label: 'Rangsumme W⁺', value: num(c.s.Wpos) },
  ],
  interpret: c => {
    const t = c.s;
    if (t.n === 0) return { kurz: 'Alle haben bei beiden Messungen denselben Wert. Es gibt keine Veränderung, die man ordnen könnte.', fachlich: 'Alle Differenzen sind 0; mariposa meldet wie SPSS z = 0 und p = 1.' };
    const [more, less] = t.Wpos >= t.Wneg ? ['positiven', 'negativen'] : ['negativen', 'positiven'];
    return {
      kurz: `${t.nPos} Befragte haben bei ${T2(c)} einen höheren Wert als bei ${T1(c)}, ${t.nNeg} einen niedrigeren, ${t.nZero} denselben. Die Ränge der ${more} Differenzen ergeben ${num(Math.max(t.Wpos, t.Wneg))}, die der ${less} ${num(Math.min(t.Wpos, t.Wneg))}. Gäbe es keine Veränderung, käme ein so ungleiches Verhältnis ${pOften(t.p)} Stichproben vor (${pText(t.p)}).`,
      fachlich: `Wilcoxon-Test für verbundene Stichproben, ${T2(c)} minus ${T1(c)}: V = W⁺ = ${num(t.Wpos)}, z ≈ ${num(t.z)}, ${pText(t.p)}, r ≈ ${num(t.r)}. ${signif(t.p)}; der Effekt ist nach der Faustregel ${rWord(t.r)}.`,
      zusatz: t.nZero === 0 ? `Niemand hat zweimal denselben Wert; gerechnet wird mit allen ${t.n} Paaren.` : `${t.nZero === 1 ? 'Eine Person mit gleichem Wert fällt' : `Die ${t.nZero} Befragten mit gleichem Wert fallen`} weg; gerechnet wird mit ${count(t.n)} Paaren.`,
    };
  },
  voraussetzung: () => 'Beide Spalten messen dasselbe auf derselben Skala, bei denselben Personen. Die Personen sind unabhängig, und die Differenzen lassen sich der Größe nach ordnen.',
  picture: (c, step) => ({
    contributions: step === 1 ? { label: 'Differenzen aller Befragten, der Größe nach', values: c.s.d }
      : step === 2 ? { label: 'Ränge der Beträge, der Größe nach; 0 heißt: fällt weg', values: c.s.rank.map(r => Number.isNaN(r) ? 0 : r) }
      : { label: 'Ränge mit Vorzeichen, der Größe nach', values: c.s.signed },
  }),
  value: c => c.s.Wpos,
};

export const wilcoxonWorkshop: Workshop<Pairs, WxStats> = {
  id: 'b11-wilcoxon',
  bridge: bridgeWilcoxon,
  wofuer: 'Wissen Menschen beim zweiten Mal mehr? Sechs Personen lösen denselben Wissenstest mit 20 Aufgaben zweimal. Weil es dieselben Personen sind, vergleichen wir nicht zwei Gruppen, sondern jede Person mit sich selbst. Dafür ordnet der Wilcoxon-Test für verbundene Stichproben die Veränderungen der Größe nach.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber nur aus vier kleinen Schritten: abziehen, der Größe nach ordnen, zusammenzählen und teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b11-wilcoxon',
  names: WX_NAMES,
  bounds: { min: 0, max: 20 },
  presets: [
    { id: 'start', label: 'Ohne Gleichstand', data: WX_START },
    { id: 'gleich', label: 'Mit einer Null und Gleichständen', data: WX_TIES },
  ],
  compute: wxCompute,
  glyphs: [
    { sym: 'xᵢ, yᵢ', say: 'x i, y i', term: 'Verbundene Messungen', plain: 'erster und zweiter Test von Person i', step: 1 },
    { sym: 'dᵢ', say: 'd i', term: 'Gepaarte Differenz', plain: 'zweiter minus erster Test', step: 1 },
    { sym: 'R(|dᵢ|)', say: 'R von Betrag d i', term: 'Rang des Betrags', plain: 'Platz der Veränderung, ohne Vorzeichen', step: 2 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'Personen mit einer Veränderung ungleich 0', step: 2 },
    { sym: 'W⁺, W⁻', say: 'W plus, W minus', term: 'Rangsummen', plain: 'Ränge der Verbesserungen und der Verschlechterungen', step: 3 },
    { sym: 'W', say: 'W', term: 'kleinere Rangsumme', plain: 'min(W⁺, W⁻), mit ihr rechnet R wie SPSS', step: 4 },
    { sym: 'σ(W)', say: 'Sigma von W', term: 'Standardabweichung der Rangsumme', plain: 'wie stark W ohne Veränderung üblicherweise schwankt', step: 4 },
    { sym: 'z', say: 'z', term: 'Prüfgröße', plain: 'Abstand der kleineren Summe zur Erwartung, in σ(W) gemessen', step: 4 },
  ],
  steps: [
    {
      button: 'dᵢ', title: 'Die Veränderung je Person berechnen', sym: 'dᵢ = yᵢ − xᵢ', say: 'd i gleich y i minus x i', concept: 'paired_difference', perPerson: true,
      links: [{ id: 'paired_design', label: 'Verbundene Messungen' }],
      was: 'Für jede Person rechnen wir: zweiter Test minus erster Test. Plus heißt verbessert, Minus heißt verschlechtert.',
      rechnung: c => {
        const d = c.s.d[c.who];
        const how = d > 0 ? `also ${tasks(d)} mehr als beim ersten Mal` : d < 0 ? `also ${tasks(-d)} weniger als beim ersten Mal` : 'also gleich viele wie beim ersten Mal';
        return `Person ${P(c)}: ${c.s.ys[c.who]} − ${c.s.xs[c.who]} = ${signed(d)}, ${how}.`;
      },
      fach: 'Die gepaarte Differenz dᵢ = yᵢ − xᵢ gehört zu genau einer Person. mariposa rechnet immer zweite minus erste Messung.',
      warum: 'Jede Person ist ihr eigener Vergleich. So fallen Unterschiede zwischen den Personen heraus, etwa dass manche ohnehin mehr wissen.',
      acht: 'Die Reihenfolge zählt: y − x, nicht x − y. Andersherum drehen sich alle Vorzeichen, und Verbesserungen sähen aus wie Verschlechterungen.',
      check: {
        question: c => `Wie groß ist die Veränderung von Person ${P(c)}? Mit Vorzeichen.`,
        answer: c => c.s.d[c.who],
        diagnose: (c, v) => {
          const d = c.s.d[c.who];
          return v !== 'NA' && Math.abs(d) > 1e-9 && !close(v, d) && close(v, -d) ? 'Fast! Der Betrag stimmt, nur die Richtung nicht. Rechne zweiter minus erster Test.' : null;
        },
      },
    },
    {
      button: 'R(|dᵢ|)', title: 'Nullen weglassen, Beträge ordnen', sym: 'R(|dᵢ|)', say: 'R von Betrag d i', concept: 'ranks', perPerson: true,
      was: 'Wer gleich viele Aufgaben löst, fällt weg. Die übrigen Veränderungen ordnen wir nach ihrer Größe, ohne Vorzeichen: Die kleinste bekommt Rang 1.',
      rechnung: c => {
        const d = c.s.d[c.who];
        if (d === 0) return `Person ${P(c)} hat sich nicht verändert und fällt weg. Gerechnet wird mit den übrigen ${c.s.n}.`;
        const a = Math.abs(d), same = c.s.d.map((v, i) => [Math.abs(v), i] as const).filter(([v, i]) => v === a && i !== c.who).map(([, i]) => c.names[i]);
        const less = c.s.d.filter(v => v !== 0 && Math.abs(v) < a).length;
        if (!same.length) return `Person ${P(c)}: |${signed(d)}| = ${num(a)}. ${less === 1 ? 'Eine Veränderung ist' : `${less} Veränderungen sind`} kleiner, also Rang ${num(c.s.rank[c.who])}.`;
        return `Person ${P(c)}: |${signed(d)}| = ${num(a)}, genau so groß wie bei ${same.join(' und ')}. Sie teilen sich die Plätze ${less + 1} bis ${less + same.length + 1}: Rang ${num(c.s.rank[c.who])}.`;
      },
      fach: 'Gerankt werden die Beträge |dᵢ| aller Differenzen ungleich 0. Gleiche Beträge bekommen den Mittelwert ihrer Plätze.',
      warum: 'Eine große Veränderung soll mehr zählen als eine kleine. Über den Rang zählt aber nur ihr Platz, nicht ihre volle Größe.',
      acht: 'Geordnet wird ohne Vorzeichen: −2 und +2 sind gleich groß und teilen sich einen Rang. Das Vorzeichen kommt erst im nächsten Schritt zurück.',
      check: {
        question: c => `Welchen Rang bekommt die Veränderung von Person ${P(c)}? Fällt sie weg, tippe NA.`,
        answer: c => c.s.d[c.who] === 0 ? 'NA' : c.s.rank[c.who],
        diagnose: (c, v) => {
          const d = c.s.d[c.who], r = c.s.rank[c.who];
          if (v === 'NA') return null;
          if (d === 0) return `Fast! Person ${P(c)} hat sich nicht verändert und bekommt keinen Rang. Tippe NA.`;
          if (close(v, r)) return null;
          if (d < 0 && close(v, -r)) return 'Fast! Der Rang selbst hat kein Vorzeichen. Das Minus kommt erst im nächsten Schritt dazu.';
          if (c.s.nZero > 0 && close(v, c.s.withZeros[c.who])) return 'Fast! Die Nullen zählen nicht mit. Wer sich nicht verändert hat, fällt vorher weg.';
          return null;
        },
      },
    },
    {
      button: 'W⁺', title: 'Die Ränge der Verbesserungen zusammenzählen', sym: 'W⁺', say: 'W plus', concept: 'wilcoxon_test', perPerson: false,
      was: 'Jeder Rang bekommt sein Vorzeichen zurück. Dann zählen wir die Ränge der Verbesserungen zusammen, und getrennt die der Verschlechterungen.',
      rechnung: c => c.s.n === 0
        ? 'Niemand hat sich verändert. Beide Summen sind 0.'
        : `W⁺ = ${plusRanks(c, 1).join(' + ') || '0'}${plusRanks(c, 1).length > 1 ? ` = ${num(c.s.Wpos)}` : ''}. W⁻ = ${plusRanks(c, -1).join(' + ') || '0'}${plusRanks(c, -1).length > 1 ? ` = ${num(c.s.Wneg)}` : ''}. Zusammen ${num(c.s.total)} = ${c.s.n} · ${c.s.n + 1} / 2.`,
      fach: 'W⁺ ist die Summe der Ränge aller positiven Differenzen; R nennt sie V. Es gilt W⁺ + W⁻ = n(n + 1) / 2.',
      warum: c => `Ohne Veränderung wären Verbesserungen und Verschlechterungen etwa gleich häufig und gleich groß. Dann bekäme jede Summe etwa die Hälfte, hier ${num(c.s.E)}.`,
      acht: 'Zusammengezählt werden die Ränge, nicht die Differenzen selbst. Sonst zählte eine große Veränderung wieder mit ihrer vollen Größe.',
      check: {
        question: 'Wie groß ist die Rangsumme der Verbesserungen?',
        answer: c => c.s.Wpos,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.Wpos)) return null;
          if (close(v, c.s.Wneg)) return 'Fast! Das ist die Rangsumme der Verschlechterungen. Gefragt sind die Plus-Ränge.';
          if (close(v, c.s.dPos)) return 'Fast! Das ist die Summe der Differenzen. Zusammengezählt werden ihre Ränge.';
          return null;
        },
      },
    },
    {
      button: 'z', title: 'Mit dem Zufall vergleichen', sym: 'z', say: 'z', concept: 'test_statistic', perPerson: false,
      links: [{ id: 'standard_normal', label: 'Standardnormalverteilung' }],
      was: 'Ohne Veränderung erwartet man für jede Summe n(n + 1) / 4. Wir messen, wie weit die kleinere Summe davon weg ist, in Standardabweichungen.',
      rechnung: c => c.s.n === 0
        ? 'Niemand hat sich verändert. R meldet dann wie SPSS z = 0 und p = 1.'
        : `Erwartung ${c.s.n} · ${c.s.n + 1} / 4 = ${num(c.s.E)}. z = (${num(c.s.small)} − ${num(c.s.E)}) / ${num(c.s.sd)} ≈ ${zText(c)}${c.s.ties ? '. Die Gleichstände machen σ(W) etwas kleiner.' : '.'}`,
      fach: 'z = (min(W⁺, W⁻) − n(n + 1) / 4) / σ(W) mit σ(W) = √(n(n + 1)(2n + 1) / 24), bei Gleichständen etwas kleiner. n zählt nur die Personen mit einer Veränderung.',
      warum: 'Erst im Vergleich mit dem üblichen Schwanken wird klar, ob die beiden Summen überraschend ungleich sind. Daraus rechnet R den p-Wert.',
      acht: 'R rechnet wie SPSS mit der kleineren Summe, deshalb ist z nie positiv. Ob es eher besser oder schlechter wurde, zeigt der Vergleich von W⁺ und W⁻.',
      check: {
        question: 'Wie groß ist z? Zwei Nachkommastellen reichen.',
        answer: c => c.s.z,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.z)) return null;
          if (Math.abs(c.s.z) > 0.02 && close(v, -c.s.z)) return 'Fast! Das Vorzeichen stimmt nicht. R rechnet mit der kleineren Summe, z ist hier nie positiv.';
          if (c.s.n && close(v, c.s.gap)) return 'Fast! Das ist erst der Abstand zur Erwartung. Jetzt noch durch σ(W) teilen.';
          if (c.s.n && close(v, c.s.noE)) return 'Fast! Zuerst ziehst du die Erwartung ab, dann teilst du durch σ(W).';
          return null;
        },
      },
    },
  ],
  numeric,
  table: {
    columns: [
      { head: 'Test 1', from: 1, active: [], cell: (c, r) => num(c.s.xs[r]) },
      { head: 'Test 2', from: 1, active: [], cell: (c, r) => num(c.s.ys[r]) },
      { head: 'd = y − x', from: 1, active: [1], cell: (c, r) => signed(c.s.d[r]), tone: (c, r) => c.s.d[r] > 0 ? 'pos' : c.s.d[r] < 0 ? 'neg' : undefined },
      { head: 'Rang |d|', from: 2, active: [2], cell: (c, r) => c.s.d[r] === 0 ? 'fällt weg' : num(c.s.rank[r]) },
      { head: 'Rang +', from: 3, active: [3], cell: (c, r) => c.s.d[r] > 0 ? num(c.s.rank[r]) : '–', sum: c => num(c.s.Wpos), sumFrom: 3 },
      { head: 'Rang −', from: 3, active: [3], cell: (c, r) => c.s.d[r] < 0 ? num(c.s.rank[r]) : '–', sum: c => num(c.s.Wneg), sumFrom: 3 },
    ],
    lines: [
      { from: 2, step: 2, text: c => `n = ${c.s.n} Personen mit einer Veränderung` },
      { from: 3, step: 3, text: c => `W⁺ + W⁻ = ${num(c.s.total)} = ${c.s.n} · ${c.s.n + 1} / 2` },
      { from: 4, step: 4, text: c => c.s.n ? `z = (${num(c.s.small)} − ${num(c.s.E)}) / ${num(c.s.sd)} ≈ ${zText(c)}` : 'z = 0' },
    ],
  },
  captions: {
    1: 'Je Zeile eine Person: 1 ist der erste, 2 der zweite Test. Grün heißt verbessert, braunrot verschlechtert.',
    2: 'Rechts steht der Rang der Veränderung, ohne Vorzeichen.',
    3: 'Rechts steht der Rang mit Vorzeichen. Unten die beiden Rangsummen als Balken.',
    4: 'Die gestrichelte Linie ist die Erwartung ohne Veränderung. Je weiter die Balken davon weg sind, desto größer ist z im Betrag.',
  },
  think: [
    {
      question: 'Person D löst beim zweiten Test 20 statt 17 Aufgaben. Was passiert mit W⁺?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 1, step: 3,
      explain: 'D rückt auf Rang 6, F auf Rang 5. Beide sind Verbesserungen, die Summe ihrer Ränge bleibt dieselbe. Wie groß die größte Veränderung ist, spielt keine Rolle.',
      kurz: 'Auch hier zählt nur die Reihenfolge.',
      tryIt: { label: 'Person D auf 20 Aufgaben', apply: d => ({ x: d.x, y: d.y.map((v, i) => i === 3 ? 20 : v) }) },
    },
    {
      question: 'Alle lösen beim zweiten Test eine Aufgabe mehr. Was passiert mit W⁺?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0, step: 3,
      explain: 'Jede Differenz wächst um 1. Verschlechterungen werden kleiner und rutschen nach vorn in der Reihe, Verbesserungen größer. Die Plus-Ränge sammeln mehr.',
      kurz: 'Mehr Verbesserung, größere Plus-Summe.',
      tryIt: { label: 'alle im zweiten Test eine Aufgabe mehr', apply: d => ({ x: d.x, y: d.y.map(v => Math.min(20, v + 1)) }) },
    },
    {
      question: 'Alle lösen beim zweiten Test genau so viele Aufgaben wie beim ersten. Was meldet R?', options: ['z = 0 und p = 1', 'ein sehr großes z', 'einen Fehler'], correct: 0, step: 2,
      explain: 'Alle Differenzen sind 0 und fallen weg. Dann bleibt nichts zu ordnen, und R meldet wie SPSS z = 0 und p = 1.',
      kurz: 'Keine Veränderung, kein Hinweis auf eine Veränderung.',
      tryIt: { label: 'zweiter Test wie der erste', apply: d => ({ x: d.x, y: [...d.x] }) },
    },
  ],
  variants: {
    wilcoxon_test: {
      lastStep: 4,
      kurz: 'Der Wilcoxon-Test für verbundene Stichproben vergleicht zwei Messungen derselben Personen. Er ordnet die Veränderungen nach ihrer Größe und fragt, ob die Verbesserungen oder die Verschlechterungen überwiegen.',
      fachlich: 'Vorzeichen-Rang-Test: Differenzen dᵢ = yᵢ − xᵢ ohne Nullen, Ränge der Beträge, W⁺ als Summe der positiven Ränge, geprüft über z mit der Normalverteilung und Bindungskorrektur.',
      symbolic: [{ part: ['dᵢ = yᵢ − xᵢ'], m: 1 }, { br: true }, 'W⁺ = ', { big: 'Σ', m: 3 }, { part: ['R(|dᵢ|)'], m: 2 }, { sub: 'dᵢ > 0' }, { br: true },
        { part: ['z'], m: 4 }, ' = ', { frac: [{ part: ['W'], m: 3 }, ' − n(n+1)/4'], den: ['σ(W)'], m: 4 }],
      aria: 'd i gleich y i minus x i. W plus gleich Summe der Ränge der Beträge aller positiven Differenzen. z gleich W minus n mal n plus eins geteilt durch vier, geteilt durch Sigma von W; W ist die kleinere der beiden Rangsummen',
      metrics: [
        { label: 'Verbessert, verschlechtert, gleich', value: c => `${c.s.nPos}, ${c.s.nNeg}, ${c.s.nZero}` },
        { label: 'W⁺ und W⁻', value: c => `${num(c.s.Wpos)} und ${num(c.s.Wneg)}` },
        { label: 'z', value: zText },
      ],
      interpret: c => ({
        kurz: c.s.n === 0
          ? 'Alle lösen beim zweiten Test genau so viele Aufgaben wie beim ersten. Es gibt keine Veränderung, die man ordnen könnte.'
          : `${c.s.nPos} von ${c.s.d.length} Personen lösen beim zweiten Test mehr Aufgaben, ${c.s.nNeg} weniger${c.s.nZero ? `, ${c.s.nZero} gleich viele` : ''}. Die Ränge der Verbesserungen ergeben ${num(c.s.Wpos)} von ${num(c.s.total)}; ohne Veränderung wäre es etwa die Hälfte.`,
        fachlich: c.s.n === 0
          ? 'Alle Differenzen sind 0. mariposa meldet wie SPSS z = 0 und p = 1.'
          : `W⁺ = ${num(c.s.Wpos)}, W⁻ = ${num(c.s.Wneg)}, z ≈ ${zText(c)}, ${pText(c.s.p)} (zweiseitig, Normalverteilung wie in R). Gäbe es keine Veränderung, käme ein so ungleiches Verhältnis ${pOften(c.s.p)} Stichproben vor. ${signif(c.s.p)}; r = |z| / √n ≈ ${num(c.s.r)} ist nach der Faustregel ${rWord(c.s.r)}.`,
      }),
      genau: {
        kurz: 'Bei sechs Personen ist die Normalverteilung nur eine Näherung. Und Nulldifferenzen fallen weg, wie in SPSS.',
        paragraphs: c => [
          `mariposa rechnet immer mit der Normalverteilung, ohne Stetigkeitskorrektur. ${c.s.exact !== null ? `Der exakte Test aus wilcox.test(…, paired = TRUE) zählt alle ${2 ** c.s.n} Vorzeichenmuster durch und meldet hier p ≈ ${num(c.s.exact)} statt ${num(c.s.p)}.` : 'Mit Nullen oder Gleichständen rechnet auch wilcox.test() nur mit dieser Näherung.'}`,
          'Als Test für die typische Veränderung gelesen, nimmt er an, dass die Differenzen symmetrisch verteilt sind. Und ihre Beträge müssen sich sinnvoll ordnen lassen: Zwei Aufgaben mehr ist mehr als eine.',
          'Wer sich nicht verändert, fällt weg, und n wird kleiner. Im Lehrdatensatz lösen 32 von 200 Befragten beim zweiten Messzeitpunkt genau so viele Aufgaben wie beim ersten.',
          'Für zwei unabhängige Gruppen ist der Mann–Whitney-U-Test zuständig. Für drei und mehr Messungen derselben Personen nimmst du den Friedman-Test.',
        ],
      },
    },
  },
};

// Reiter -------------------------------------------------------------------------------

/** Wilcoxon-Test auf den aktuellen 200 Befragten: zweite (y) minus erste Messung (x). */
export function wxSample(c: SampleCtx) {
  const [x, y] = columnsOf(c.rows, [c.columns.x?.[0] ?? 'wissenstest', c.columns.y?.[0] ?? 'wissenstest_t2']);
  return signedRank(x, y);
}

export const wilcoxonTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b11-wilcoxon', variant: 'wilcoxon_test', variable: 'wissenstest,wissenstest_t2',
    think: [
      {
        question: 'Angenommen, beim ersten Test hätten alle eine Aufgabe mehr gelöst. Was passiert mit der Rangsumme der Verbesserungen W⁺?', options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 0, step: 3,
        explain: 'Jede Differenz schrumpft um eine Aufgabe. Verbesserungen werden kleiner oder fallen weg, Verschlechterungen größer: Die Plus-Ränge verlieren Gewicht. Auch p steigt, von unter 0,001 auf etwa 0,06.',
        kurz: 'Kleinere Verbesserungen, kleinere Plus-Summe.',
        tryIt: { label: 'erster Test eine Aufgabe mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'down' },
      },
      {
        question: 'Angenommen, beim zweiten Test hätten alle eine Aufgabe weniger gelöst. Was passiert mit W⁺?', options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 0, step: 1,
        explain: 'Für den Test zählt nur die Differenz je Person. Ob der erste Test steigt oder der zweite sinkt, verändert sie genau gleich: Jede Differenz wird um eins kleiner.',
        kurz: 'Es zählt nur die Veränderung je Person.',
        tryIt: { label: 'zweiter Test eine Aufgabe weniger', op: 'shift', column: 'y', value: -1 },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'wilcoxon_test', variant: 0,
    tokens: {
      wilcoxon_test: { sym: 'wilcoxon_test()', term: 'Wilcoxon, verbunden', kurz: 'Vergleicht zwei Messungen derselben Personen über die Ränge ihrer Veränderungen. Meldet z, p und die Effektgröße r.', fehler: 'Ein drittes Argument nimmt wilcoxon_test() als Gewicht. wilcoxon_test(wissenstest, wissenstest_t2, wissenstest_t3) rechnet deshalb gewichtet und meldet N = 2324.' },
    },
    outputMap: [
      { match: 'wissenstest_t2 - wissenstest', atlas: 'dᵢ = yᵢ − xᵢ', step: 1, explain: 'Die Richtung der Differenz: zweiter minus erster Messzeitpunkt, also die zweite Spalte im Aufruf minus die erste.' },
      { match: 'Z', atlas: 'z', step: 4, explain: 'Aus der kleineren Rangsumme gerechnet, deshalb negativ. Die Verbesserungen überwiegen hier deutlich.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es keine Veränderung, käme ein so ungleiches Verhältnis in weniger als 1 von 1.000 Stichproben vor.' },
      { match: 'r', atlas: 'Effektgröße r', explain: 'r = |z| / √n mit den 168 Paaren ohne Nulldifferenz: 5,36 / √168 ≈ 0,41. medium heißt mittel.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle 200 Befragten, auch die 32 ohne Veränderung, die für die Ränge wegfallen.' },
    ],
    check: {
      question: 'Woran siehst du, in welcher Richtung R die Differenz bildet? Tippe es an.', correct: 'wissenstest_t2 - wissenstest',
      wrong: { Z: 'Fast! Das ist z. Es ist immer negativ und sagt deshalb nichts über die Richtung.', p: 'Fast! Das ist der p-Wert. Die Richtung steht in der ersten Zeile.', r: 'Fast! Das ist die Effektgröße r. Sie hat kein Vorzeichen.' },
    },
  },
  next: {
    next: { id: 'friedman_test', why: 'Derselbe Gedanke für drei und mehr Messungen derselben Personen, hier den Wissenstest zu drei Zeitpunkten.' },
    before: [
      { id: 'paired_design', why: 'Beide Messungen stammen von denselben Personen und gehören paarweise zusammen.' },
      { id: 'paired_difference', why: 'Je Person zweiter minus erster Test: Mit diesen Differenzen rechnet der Test.' },
    ],
    after: [
      { id: 'effect', why: 'r = |z| / √n sagt, wie groß die Veränderung ist. Der p-Wert allein sagt das nicht.' },
    ],
    more: [
      { id: 'mann_whitney', why: 'Der Rangtest für zwei unabhängige Gruppen statt für dieselben Personen.' },
      { id: 'pairwise_wilcoxon', why: 'Derselbe Test für jedes Paar von Messungen, mit Korrektur für mehrere Vergleiche.' },
    ],
  },
};
