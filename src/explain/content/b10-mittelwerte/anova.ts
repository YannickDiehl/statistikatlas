// Werkstatt „Streuung zwischen und innerhalb“ für die einfaktorielle ANOVA (oneway_anova, Schritte 1 bis 5) und die
// Zerlegung der Streuung (group_variation, Schritte 1 bis 3). Neun Beispielpersonen in drei Gruppen nach Schulabschluss
// sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben. Reiter: dieselbe Rechnung mit den 200 Befragten
// (Lernzeit nach Schulabschluss, fünf Gruppen). Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptTabs, Ctx, FNode, Workshop } from '../../types';
import { close, num, paren, pct, signed, unit } from '../../format';
import { pf } from '../../../tasks/kit/dist';
import { anovaFor, dfText, groupsFor, often, pText } from './stats';

/** Die drei Gruppen der Beispielpersonen; die ersten drei Personen gehören zur ersten Gruppe usw. */
export const GRUPPEN = [
  { key: 'H', label: 'Hauptschulabschluss' },
  { key: 'M', label: 'Mittlerer Abschluss' },
  { key: 'A', label: 'Abitur' },
] as const;
const NAMES = ['H1', 'H2', 'H3', 'M1', 'M2', 'M3', 'A1', 'A2', 'A3'] as const;
const groupOf = (i: number) => Math.floor(i / 3);

export type AnovaStats = {
  xs: number[]; groupSums: number[]; gm: number[]; sum: number; grand: number;
  /** je Person: Mitte ihrer Gruppe, deren Abstand zur Gesamtmitte und dessen Quadrat, eigener Abstand zur Gruppenmitte und Quadrat */
  gmOf: number[]; dB: number[]; sqB: number[]; dW: number[]; sqW: number[]; sqT: number[];
  ssB: number; ssW: number; ssT: number; ssBGroups: number;
  dfB: number; dfW: number; msB: number; msW: number;
  /** null, wenn innerhalb der Gruppen nichts streut (dann ist F nicht definiert) */
  F: number | null; p: number | null; ratioSS: number | null; inverse: number | null;
  /** Anteil der Streuung zwischen den Gruppen (η²), null ohne jede Streuung */
  share: number | null;
};

export function anovaStats(xs: number[]): AnovaStats {
  const k = 3, N = xs.length, nj = 3;
  const groupSums = [0, 1, 2].map(j => xs.slice(j * nj, j * nj + nj).reduce((a, b) => a + b, 0));
  const gm = groupSums.map(s => s / nj), sum = xs.reduce((a, b) => a + b, 0), grand = sum / N;
  const gmOf = xs.map((_, i) => gm[groupOf(i)]);
  const dB = gmOf.map(m => m - grand), sqB = dB.map(d => d * d);
  const dW = xs.map((x, i) => x - gmOf[i]), sqW = dW.map(d => d * d), sqT = xs.map(x => (x - grand) ** 2);
  const add = (a: number[]) => a.reduce((s, v) => s + v, 0);
  const ssB = add(sqB), ssW = add(sqW), ssT = add(sqT), dfB = k - 1, dfW = N - k, msB = ssB / dfB, msW = ssW / dfW;
  const F = msW > 1e-12 ? msB / msW : null;
  return {
    xs: [...xs], groupSums, gm, sum, grand, gmOf, dB, sqB, dW, sqW, sqT, ssB, ssW, ssT, ssBGroups: add(gm.map(m => (m - grand) ** 2)),
    dfB, dfW, msB, msW, F, p: F === null ? null : pf(F, dfB, dfW, false), ratioSS: ssW > 1e-12 ? ssB / ssW : null,
    inverse: F !== null && F > 1e-12 ? 1 / F : null, share: ssT > 1e-12 ? ssB / ssT : null,
  };
}

type C = Ctx<AnovaStats>;
const P = (c: C) => c.names[c.who];
const G = (c: C) => GRUPPEN[groupOf(c.who)];
const hours = (v: number) => unit(v, 'Stunde', 'Stunden');
/** „=“, wenn die angezeigte Zahl genau ist, sonst „≈“. */
const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
const ss = (b: 'B' | 'W' | 'T'): FNode[] => ['SS', { sub: b }];
const ms = (b: 'B' | 'W'): FNode[] => ['MS', { sub: b }];
/** Zwischen den Gruppen: 3 · (5 − 7)² + 3 · (7 − 7)² + 3 · (9 − 7)² */
const betweenTerms = (c: C) => c.s.gm.map(m => `3 · (${num(m)} − ${num(c.s.grand)})²`).join(' + ');

export const anovaWerkstatt: Workshop<number[], AnovaStats> = {
  id: 'b10-anova',
  wofuer: 'Neun Personen mit drei verschiedenen Schulabschlüssen (H = Hauptschulabschluss, M = Mittlerer Abschluss, A = Abitur) sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben. Lernen die drei Gruppen im Mittel verschieden lange? Oder liegen ihre Mitten nur so weit auseinander, wie es das Schwanken zwischen einzelnen Menschen ohnehin erwarten lässt?',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus fünf kleinen Schritten, die du alle schon kannst: Mitten finden, Abstände quadrieren, zusammenzählen, teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b10-anova',
  names: NAMES,
  bounds: { min: 0, max: 14 },
  presets: [
    { id: 'klar', label: 'Klare Unterschiede: 4 5 6 | 6 7 8 | 8 9 10', data: [4, 5, 6, 6, 7, 8, 8, 9, 10] },
    { id: 'streut', label: 'Gleiche Mitten, mehr Streuung: 2 5 8 | 4 7 10 | 6 9 12', data: [2, 5, 8, 4, 7, 10, 6, 9, 12] },
    { id: 'gleich', label: 'Keine Unterschiede: 5 7 9 | 6 7 8 | 7 7 7', data: [5, 7, 9, 6, 7, 8, 7, 7, 7] },
  ],
  compute: anovaStats,
  glyphs: [
    { sym: 'xᵢⱼ', say: 'x i j', term: 'Beobachtung', plain: 'die Lernzeit von Person i in Gruppe j', step: 1 },
    { sym: 'x̄ⱼ', say: 'x quer j', term: 'Gruppenmittel', plain: 'die Mitte von Gruppe j', step: 1 },
    { sym: 'x̄', say: 'x quer', term: 'Gesamtmittel', plain: 'die Mitte aller neun', step: 1 },
    { sym: 'nⱼ', say: 'n j', term: 'Gruppengröße', plain: 'wie viele Personen in Gruppe j sind, hier 3', step: 2 },
    { sym: 'SS_B', say: 'S S B', term: 'Quadratsumme zwischen den Gruppen', plain: 'wie weit die Gruppenmitten auseinanderliegen; B für between, zwischen', step: 2 },
    { sym: 'SS_W', say: 'S S W', term: 'Quadratsumme innerhalb der Gruppen', plain: 'wie verschieden die Menschen in derselben Gruppe sind; W für within, innerhalb', step: 3 },
    { sym: 'k', say: 'k', term: 'Zahl der Gruppen', plain: 'hier 3', step: 4 },
    { sym: 'N', say: 'N', term: 'Fallzahl', plain: 'alle Personen zusammen, hier 9', step: 4 },
    { sym: 'MS', say: 'M S', term: 'Mittlere Quadratsumme', plain: 'eine Quadratsumme geteilt durch ihre Freiheitsgrade', step: 4 },
    { sym: 'F', say: 'F', term: 'Prüfgröße F', plain: 'die Streuung zwischen geteilt durch die Streuung innerhalb', step: 5 },
  ],
  steps: [
    {
      button: 'x̄ⱼ', title: 'Die Mitte jeder Gruppe finden', sym: 'x̄ⱼ', say: 'x quer j', concept: 'mean', perPerson: true,
      was: 'Wir zählen in jeder Gruppe die drei Lernzeiten zusammen und teilen durch drei. Dazu kommt die Mitte aller neun Personen.',
      rechnung: c => {
        const j = groupOf(c.who), v = c.s.xs.slice(j * 3, j * 3 + 3);
        return `Gruppe ${G(c).key} von Person ${P(c)}: (${v.join(' + ')}) / 3 = ${num(c.s.gm[j])}. Alle neun: ${num(c.s.sum)} / 9 = ${num(c.s.grand)}.`;
      },
      fach: 'Das Gruppenmittel x̄ⱼ ist die Summe der Werte in Gruppe j geteilt durch ihre Größe nⱼ. Das Gesamtmittel x̄ teilt die Summe aller Werte durch N.',
      warum: 'Gleich vergleichen wir zwei Abstände: den der Gruppenmitten zur Gesamtmitte und den jeder Person zu ihrer Gruppenmitte.',
      acht: 'Die Gesamtmitte ist hier auch die Mitte der drei Gruppenmitten. Das gilt nur, weil alle Gruppen gleich groß sind.',
      check: {
        question: c => `Wo liegt die Mitte der Gruppe von Person ${P(c)}?`,
        answer: c => c.s.gm[groupOf(c.who)],
        diagnose: (c, v) => {
          const j = groupOf(c.who);
          if (v === 'NA') return null;
          if (Math.abs(c.s.groupSums[j]) > 1e-9 && close(v, c.s.groupSums[j])) return 'Fast! Das ist die Summe der Gruppe. Jetzt noch durch 3 teilen.';
          if (Math.abs(c.s.grand - c.s.gm[j]) > 0.02 && close(v, c.s.grand)) return `Fast! Das ist die Mitte aller neun. Gefragt ist die Mitte der Gruppe ${GRUPPEN[j].key}.`;
          return null;
        },
      },
    },
    {
      button: 'SS_B', title: 'Die Gruppen mit der Gesamtmitte vergleichen', sym: 'SS_B', say: 'S S B', concept: 'group_variation', perPerson: true,
      was: 'Für jede Person nehmen wir den Abstand ihrer Gruppenmitte zur Gesamtmitte und quadrieren ihn. Die Summe über alle neun heißt Streuung zwischen den Gruppen.',
      rechnung: c => `Person ${P(c)}: (${num(c.s.gmOf[c.who])} − ${num(c.s.grand)})² = ${num(c.s.sqB[c.who])}. Alle neun: ${betweenTerms(c)} = ${num(c.s.ssB)}.`,
      fach: 'Die Quadratsumme zwischen den Gruppen SS_B = Σ nⱼ (x̄ⱼ − x̄)²: Jede Gruppe zählt so oft, wie sie Personen hat.',
      warum: 'Liegen die Gruppenmitten weit auseinander, wird diese Summe groß. Sie misst, wie verschieden die Gruppen im Mittel sind.',
      acht: 'Jede Person zählt hier mit der Mitte ihrer Gruppe, nicht mit ihrem eigenen Wert. Deshalb steht in der Tabelle in jeder Gruppe dreimal dieselbe Zahl.',
      check: {
        question: 'Wie groß ist die Summe zwischen den Gruppen?',
        answer: c => c.s.ssB,
        diagnose: (c, v) => v === 'NA' || c.s.ssB < 1e-9 ? null
          : close(v, c.s.ssBGroups) ? 'Fast! Du hast jede Gruppe nur einmal gezählt. Jede Gruppe zählt dreimal, für jede ihrer Personen einmal.'
          : close(v, 0) ? 'Fast! 0 ergeben die Abstände ohne Quadrat. Erst quadrieren, dann zusammenzählen.'
          : null,
      },
    },
    {
      button: 'SS_W', title: 'Jede Person mit ihrer Gruppenmitte vergleichen', sym: 'SS_W', say: 'S S W', concept: 'group_variation', perPerson: true,
      was: 'Für jede Person nehmen wir den Abstand ihrer Lernzeit zur eigenen Gruppenmitte und quadrieren ihn. Alle neun Quadrate zusammen ergeben die Streuung innerhalb der Gruppen.',
      rechnung: c => `Person ${P(c)}: (${c.s.xs[c.who]} − ${num(c.s.gmOf[c.who])})² = ${num(c.s.sqW[c.who])}. Alle neun zusammen: ${num(c.s.ssW)}.`,
      fach: 'Die Quadratsumme innerhalb der Gruppen SS_W = ΣΣ (xᵢⱼ − x̄ⱼ)²: die Quadratsummen der einzelnen Gruppen, zusammengezählt.',
      warum: 'Diese Summe misst, wie verschieden Menschen derselben Gruppe sind. Das ist das übliche Schwanken, an dem wir die Gruppenunterschiede messen.',
      acht: c => `Gemessen wird zur eigenen Gruppenmitte, nicht zur Gesamtmitte. Kleine Probe: ${num(c.s.ssB)} + ${num(c.s.ssW)} = ${num(c.s.ssT)}, die Quadratsumme aller neun um die Gesamtmitte.`,
      check: {
        question: 'Wie groß ist die Summe innerhalb der Gruppen?',
        answer: c => c.s.ssW,
        diagnose: (c, v) => v === 'NA' ? null
          : Math.abs(c.s.ssT - c.s.ssW) > 0.02 && close(v, c.s.ssT) ? 'Fast! Das ist die Quadratsumme um die Gesamtmitte. Miss jede Person an der Mitte ihrer eigenen Gruppe.'
          : null,
      },
    },
    {
      button: '÷ df', title: 'Gerecht teilen', sym: 'MS', say: 'M S', concept: 'general_df', perPerson: false,
      was: 'Wir teilen die Summe zwischen den Gruppen durch k − 1 = 2 und die Summe innerhalb durch N − k = 6. So entstehen zwei vergleichbare Streuungen.',
      rechnung: c => `MS_B = ${num(c.s.ssB)} / 2 = ${num(c.s.msB)}. MS_W = ${num(c.s.ssW)} / 6 ${eq(c.s.msW)} ${num(c.s.msW)}.`,
      fach: 'Die mittleren Quadratsummen: SS_B geteilt durch k − 1 und SS_W geteilt durch N − k Freiheitsgrade.',
      warum: 'Drei Gruppenmitten haben nur zwei freie Abstände zur Gesamtmitte, neun Personen in drei Gruppen nur sechs freie Abstände zu ihren Gruppenmitten. Geteilt wird durch diese Freiheitsgrade.',
      acht: 'Wer beide Summen durch 8 teilt, also durch N − 1, vergleicht falsch. Merksatz: zwischen durch k − 1, innerhalb durch N − k.',
      check: {
        question: 'Was kommt heraus, wenn du die Summe innerhalb der Gruppen durch 6 teilst?',
        answer: c => c.s.msW,
        diagnose: (c, v) => v === 'NA' || c.s.ssW < 1e-9 ? null
          : close(v, c.s.ssW / 8) ? 'Fast! Du hast durch 8 geteilt, also durch N − 1. Innerhalb der Gruppen teilst du durch N − k = 6.'
          : close(v, c.s.ssW / 2) ? 'Fast! Durch 2 teilst du die Summe zwischen den Gruppen. Innerhalb teilst du durch N − k = 6.'
          : close(v, c.s.ssW) ? 'Fast! Das ist noch die Summe. Jetzt noch durch 6 teilen.'
          : null,
      },
    },
    {
      button: 'F', title: 'Beide Streuungen ins Verhältnis setzen', sym: 'F', say: 'F', concept: 'oneway_anova', perPerson: false,
      links: [{ id: 'f_distribution', label: 'F-Verteilung' }],
      was: 'Wir teilen die Streuung zwischen den Gruppen durch die Streuung innerhalb. Das Ergebnis heißt F.',
      rechnung: c => c.s.F === null ? 'Innerhalb der Gruppen streut nichts, MS_W ist 0. Durch 0 lässt sich nicht teilen.' : `F = ${num(c.s.msB)} / ${num(c.s.msW)} ${eq(c.s.F)} ${num(c.s.F)}.`,
      fach: 'F = MS_B / MS_W. Unterscheiden sich die Gruppenmittel in der Grundgesamtheit nicht, liegt F meist in der Nähe von 1.',
      warum: 'Ein großes F heißt: Die Gruppen liegen weiter auseinander, als es das Schwanken innerhalb der Gruppen erwarten lässt.',
      acht: 'F sagt nicht, welche Gruppen sich unterscheiden. Das zeigen erst Paarvergleiche wie der Tukey-Test.',
      check: {
        question: 'Wie groß ist F?',
        answer: c => c.s.F ?? 'NA',
        diagnose: (c, v) => v === 'NA' || c.s.F === null ? null
          : c.s.inverse !== null && Math.abs(c.s.inverse - c.s.F) > 0.02 && close(v, c.s.inverse) ? 'Fast! Andersherum: Die Streuung zwischen den Gruppen steht oben.'
          : c.s.ratioSS !== null && Math.abs(c.s.ratioSS - c.s.F) > 0.02 && close(v, c.s.ratioSS) ? 'Fast! Du hast die Summen geteilt. Nimm die geteilten Werte aus Schritt 4.'
          : null,
      },
    },
  ],
  numeric: (c, last): FNode[] => last <= 3
    ? [...ss('B'), ' = ', { part: [betweenTerms(c)], m: 2 }, ` = ${num(c.s.ssB)}`, { br: true },
      ...ss('W'), ' = ', { part: [num(c.s.ssW)], m: 3 }, ',  ', ...ss('T'), ` = ${num(c.s.ssB)} + ${num(c.s.ssW)} = ${num(c.s.ssT)}`]
    : ['F = (', { part: [num(c.s.ssB)], m: 2 }, ' ', { part: ['/ 2'], m: 4 }, ') / (', { part: [num(c.s.ssW)], m: 3 }, ' ', { part: ['/ 6'], m: 4 }, ')', { br: true },
      '= ', { part: [num(c.s.msB)], m: 4 }, ' / ', { part: [num(c.s.msW)], m: 4 }, ' ',
      ...(c.s.F === null ? ['(nicht definiert)'] : [`${eq(c.s.F)} `, { part: [num(c.s.F)], m: 5 }] as FNode[])],
  table: {
    columns: [
      { head: 'xᵢⱼ', from: 1, active: [1, 3], cell: (c, i) => String(c.s.xs[i]), sum: c => num(c.s.sum), sumFrom: 1 },
      { head: 'x̄ⱼ', from: 1, active: [1, 2, 3], cell: (c, i) => num(c.s.gmOf[i]) },
      { head: '(x̄ⱼ − x̄)²', from: 2, active: [2], cell: (c, i) => num(c.s.sqB[i]), sum: c => num(c.s.ssB), sumFrom: 2 },
      { head: '(xᵢⱼ − x̄ⱼ)²', from: 3, active: [3], cell: (c, i) => num(c.s.sqW[i]), sum: c => num(c.s.ssW), sumFrom: 3 },
    ],
    lines: [
      { from: 1, step: 1, text: c => `x̄_H = ${num(c.s.gm[0])}, x̄_M = ${num(c.s.gm[1])}, x̄_A = ${num(c.s.gm[2])}; alle: x̄ = ${num(c.s.grand)}` },
      { from: 3, step: 3, text: c => `SS_B + SS_W = ${num(c.s.ssB)} + ${num(c.s.ssW)} = ${num(c.s.ssT)} = SS_T` },
      { from: 4, step: 4, text: c => `MS_B = ${num(c.s.ssB)} / 2 = ${num(c.s.msB)}; MS_W = ${num(c.s.ssW)} / 6 ${eq(c.s.msW)} ${num(c.s.msW)}` },
      { from: 5, step: 5, text: c => c.s.F === null ? 'F ist nicht definiert, weil MS_W = 0 ist.' : `F = ${num(c.s.msB)} / ${num(c.s.msW)} ${eq(c.s.F)} ${num(c.s.F)}` },
    ],
  },
  captions: {
    1: 'Drei Gruppen: H = Hauptschulabschluss, M = Mittlerer Abschluss, A = Abitur. Gestrichelt die Mitte jeder Gruppe, durchgezogen die Mitte aller neun.',
    2: 'Die farbigen Balken zeigen, wie weit jede Gruppenmitte von der Gesamtmitte entfernt ist.',
    3: 'Die feinen Linien zeigen, wie weit jede Person von ihrer Gruppenmitte entfernt ist.',
    4: 'Unten die beiden geteilten Streuungen: zwischen den Gruppen und innerhalb.',
    5: 'F vergleicht die beiden Balken: Wie oft passt die Streuung innerhalb in die Streuung zwischen?',
  },
  think: [
    {
      question: 'Alle drei Gruppen rücken auf dieselbe Mitte. Wie groß wird F?', questionFor: { group_variation: 'Alle drei Gruppen rücken auf dieselbe Mitte. Wie groß wird die Streuung zwischen den Gruppen?' },
      options: ['0', '1', 'nicht definiert'], correct: 0, step: 2,
      explain: 'Dann liegt jede Gruppenmitte auf der Gesamtmitte. Alle Abstände in Schritt 2 sind 0, also auch die Streuung zwischen den Gruppen und F.',
      kurz: 'Ohne Unterschiede zwischen den Gruppen gibt es nichts zu erklären.',
      tryIt: { label: 'alle Gruppen auf eine Mitte', apply: d => { const s = anovaStats(d); return d.map((x, i) => Math.min(14, Math.max(0, x - s.gmOf[i] + s.grand))); } },
    },
    {
      question: 'Die Menschen in jeder Gruppe rücken näher an ihre Gruppenmitte, die Mitten bleiben. Welche Streuung ändert sich?',
      options: ['die zwischen den Gruppen', 'die innerhalb der Gruppen', 'beide'], correct: 1, step: 3,
      explain: 'Die Gruppenmitten bleiben, also auch die Streuung zwischen den Gruppen. Kleiner wird nur die Streuung innerhalb. In der ANOVA steigt deshalb F.',
      kurz: 'Je einiger die Gruppen in sich sind, desto deutlicher treten ihre Unterschiede hervor.',
      tryIt: { label: 'halber Abstand zur Gruppenmitte', apply: d => { const s = anovaStats(d); return d.map((x, i) => s.gmOf[i] + (x - s.gmOf[i]) / 2); } },
    },
    {
      question: 'Warum rechnet man nicht drei t-Tests, einen für jedes Paar von Gruppen?', stepFor: { group_variation: 3 },
      options: ['Drei Tests finden öfter zufällig einen Unterschied', 'Das ginge genauso gut', 't-Tests gehen nur mit zwei Personen'], correct: 0, step: 5,
      explain: 'Jeder Test kann sich irren. Mit drei Tests steigt die Chance, irgendwo zufällig einen Unterschied zu finden. Die ANOVA prüft alle Gruppen in einem einzigen Test.',
      kurz: 'Ein Test für alle Gruppen statt vieler einzelner.',
    },
  ],
  variants: {
    group_variation: {
      lastStep: 3,
      kurz: 'Die Streuung zwischen den Gruppen sagt, wie weit die Gruppenmitten auseinanderliegen. Die Streuung innerhalb sagt, wie verschieden die Menschen in derselben Gruppe sind.',
      fachlich: 'SS_B = Σ nⱼ (x̄ⱼ − x̄)² und SS_W = ΣΣ (xᵢⱼ − x̄ⱼ)². In der einfaktoriellen ANOVA ergeben beide zusammen die Quadratsumme aller Werte um das Gesamtmittel.',
      symbolic: [...ss('B'), ' = ', { big: 'Σ', m: 2 }, 'nⱼ ', { part: ['('], m: 2 }, { part: ['x̄ⱼ'], m: 1 }, ' − ', { part: ['x̄'], m: 1 }, { part: [')²'], m: 2 }, ',   ',
        ...ss('W'), ' = ', { big: 'ΣΣ', m: 3 }, { part: ['(xᵢⱼ −'], m: 3 }, ' ', { part: ['x̄ⱼ'], m: 1 }, { part: [')²'], m: 3 }],
      aria: 'S S B gleich Summe über die Gruppen von n j mal x quer j minus x quer zum Quadrat; S S W gleich Summe über alle Personen von x i j minus x quer j zum Quadrat',
      metrics: [
        { label: 'zwischen SS_B', value: c => num(c.s.ssB) },
        { label: 'innerhalb SS_W', value: c => num(c.s.ssW) },
        { label: 'Anteil zwischen', value: c => c.s.share === null ? 'nicht definiert' : pct(c.s.share) },
      ],
      interpret: c => c.s.share === null
        ? { kurz: 'Alle neun haben gleich lange gelernt. Es gibt keine Streuung, weder zwischen noch innerhalb der Gruppen.', fachlich: 'SS_T = 0, also auch SS_B = SS_W = 0; ein Anteil lässt sich nicht bilden.' }
        : c.s.share < 0.0005 ? {
          kurz: `Alle drei Gruppenmitten sind gleich. Die ganze Streuung der Lernzeit (${num(c.s.ssT)}) steckt in Unterschieden zwischen Menschen derselben Gruppe.`,
          fachlich: `SS_B = 0 und SS_W = SS_T = ${num(c.s.ssT)}. Der Anteil SS_B / SS_T heißt Eta-Quadrat η²; hier ist er 0.`,
        }
        : {
          kurz: `Von der gesamten Streuung der Lernzeit (${num(c.s.ssT)}) liegen ${num(c.s.ssB)}, also ${pct(c.s.share)}, zwischen den Gruppen. Der Rest steckt in Unterschieden zwischen Menschen derselben Gruppe.`,
          fachlich: `SS_B = ${num(c.s.ssB)}, SS_W = ${num(c.s.ssW)}, SS_T = SS_B + SS_W = ${num(c.s.ssT)}. Der Anteil SS_B / SS_T ${eq(c.s.share)} ${num(c.s.share)} heißt Eta-Quadrat η².`,
        },
      next: { id: 'oneway_anova', label: 'Weiter zur einfaktoriellen ANOVA' },
      genau: {
        kurz: 'Die Zerlegung SS_T = SS_B + SS_W gilt für die einfaktorielle ANOVA. Bei Typ-III-Tests mit mehreren Faktoren geht sie so nicht auf.',
        paragraphs: c => [
          `SS_T ist die Quadratsumme aller neun Werte um die Gesamtmitte, wie in der Werkstatt Streuung: hier ${num(c.s.ssT)}. Sie zerfällt genau in die Streuung zwischen und innerhalb der Gruppen, weil sich die Abstände innerhalb jeder Gruppe zu 0 aufheben.`,
          'Sind die Gruppen verschieden groß, zählt jede Gruppenmitte mit ihrem nⱼ. Große Gruppen tragen dann mehr zur Streuung zwischen den Gruppen bei, und die Gesamtmitte ist nicht mehr die Mitte der Gruppenmitten.',
          'Bei mehreren Faktoren rechnet mariposa Typ-III-Quadratsummen. Sie messen jeden Faktor so, als käme er zuletzt ins Modell, und ergeben zusammen nicht mehr die Gesamtsumme.',
        ],
      },
    },
    oneway_anova: {
      lastStep: 5,
      kurz: 'Die einfaktorielle ANOVA vergleicht die Mittelwerte mehrerer Gruppen auf einmal. Sie fragt, ob die Gruppen weiter auseinanderliegen, als das Schwanken innerhalb der Gruppen erwarten lässt.',
      fachlich: 'F = MS_B / MS_W: die mittlere Quadratsumme zwischen den Gruppen geteilt durch die innerhalb, mit k − 1 und N − k Freiheitsgraden. Unter der Nullhypothese gleicher Mittelwerte folgt F einer F-Verteilung.',
      symbolic: ['F = ', {
        frac: [{ big: 'Σ', m: 2 }, 'nⱼ', { part: ['('], m: 2 }, { part: ['x̄ⱼ'], m: 1 }, ' − ', { part: ['x̄'], m: 1 }, { part: [')²'], m: 2 }, ' ', { part: ['/ (k − 1)'], m: 4 }],
        den: [{ big: 'ΣΣ', m: 3 }, { part: ['(xᵢⱼ −'], m: 3 }, ' ', { part: ['x̄ⱼ'], m: 1 }, { part: [')²'], m: 3 }, ' ', { part: ['/ (N − k)'], m: 4 }],
        m: 5,
      }],
      aria: 'F gleich Summe über die Gruppen von n j mal x quer j minus x quer zum Quadrat, geteilt durch k minus 1, das Ganze geteilt durch die Summe über alle Personen von x i j minus x quer j zum Quadrat, geteilt durch N minus k',
      metrics: [
        { label: 'zwischen MS_B', value: c => num(c.s.msB) },
        { label: 'innerhalb MS_W', value: c => num(c.s.msW) },
        { label: 'Prüfgröße F', value: c => c.s.F === null ? 'nicht definiert' : num(c.s.F) },
        { label: 'p-Wert', value: c => c.s.p === null ? 'nicht definiert' : pText(c.s.p).replace(/^p /, '') },
      ],
      interpret: c => c.s.F === null || c.s.p === null
        ? { kurz: 'Innerhalb der Gruppen haben alle gleich lange gelernt. Ohne Schwanken innerhalb lässt sich F nicht berechnen.', fachlich: 'MS_W = 0, also ist F = MS_B / MS_W nicht definiert.' }
        : c.s.F < 0.005 ? {
          kurz: 'Alle drei Gruppenmitten sind gleich, F ist 0. Genau das erwartet man, wenn es zwischen den Gruppen keine Unterschiede gibt.',
          fachlich: 'F(2, 6) = 0, p = 1, η² = 0. Signifikant zum Niveau α = 0,05 wäre erst ein F mit p < 0,05.',
        }
        : {
          kurz: `Die Streuung zwischen den Gruppen ist ${num(c.s.F)}-mal so groß wie die innerhalb. Gäbe es zwischen den Gruppenmitteln keine Unterschiede, wäre ein so großes F ${often(c.s.p)} Stichproben zu erwarten (${pText(c.s.p)}).`,
          fachlich: `F(2, 6) ${eq(c.s.F)} ${num(c.s.F)}, ${pText(c.s.p)}, η² ${eq(c.s.share ?? 0)} ${num(c.s.share ?? 0)}. Signifikant zum Niveau α = 0,05 heißt p < 0,05${c.s.p < 0.05 ? ', und das ist hier erfüllt' : ', und das ist hier nicht erfüllt'}. Welche Gruppen sich unterscheiden, zeigt erst ein Paarvergleich.`,
        },
      genau: {
        kurz: 'Die klassische ANOVA nimmt gleiche Varianzen in allen Gruppen an. mariposa rechnet zusätzlich die Welch-ANOVA, die das nicht braucht.',
        paragraphs: () => [
          'Voraussetzungen: unabhängige Personen, annähernd normalverteilte Werte in jeder Gruppe und gleiche Varianzen in allen Gruppen. Bei großen Gruppen genügt, dass die Gruppenmittel annähernd normalverteilt sind; als Faustregel gelten etwa 30 Personen je Gruppe.',
          'Ein großes F sagt nur, dass sich irgendwo Gruppen unterscheiden. Welche, zeigen Paarvergleiche wie der Tukey-Test, die alle Paare gegen zufällige Funde absichern.',
          'Mit genau zwei Gruppen ist F = t², und die ANOVA ergibt denselben p-Wert wie der Student-t-Test mit gleichen Varianzen.',
          'Die Gruppen sind nicht zufällig zugeteilt. Ein Unterschied der Lernzeit nach Schulabschluss beschreibt einen Zusammenhang, keine Wirkung des Abschlusses.',
        ],
      },
    },
  },
};

/** Gruppenmittel der Lernzeit nach Schulabschluss als Text: „5,88 (ohne Abschluss) bis 9,36 Stunden (Abitur)“. */
function groupRange(c: Parameters<typeof groupsFor>[0]) {
  const g = groupsFor(c), lo = g.reduce((a, b) => b.mean < a.mean ? b : a), hi = g.reduce((a, b) => b.mean > a.mean ? b : a);
  const label = (level: number) => ['ohne Schulabschluss', 'Hauptschulabschluss', 'Mittlerer Abschluss', 'Fachhochschulreife', 'Abitur'][level] ?? `Code ${level}`;
  return { lo, hi, text: `${hours(lo.mean)} (${label(lo.level)}) bis ${hours(hi.mean)} (${label(hi.level)})` };
}

export const onewayAnovaTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Lernzeit in den letzten sieben Tagen nach fünf Schulabschlüssen.',
    value: c => anovaFor(c)?.F ?? null,
    result: c => {
      const a = anovaFor(c);
      if (!a || a.F === null || a.p === null) return { kurz: 'Innerhalb der Gruppen streut die Lernzeit nicht. Dann lässt sich F nicht berechnen.', fachlich: 'MS_W = 0; F = MS_B / MS_W ist nicht definiert.' };
      return {
        kurz: `Im Schnitt lernen die Gruppen ${groupRange(c).text}. Die Streuung zwischen den Gruppen ist ${num(a.F)}-mal so groß wie die innerhalb. Gäbe es keine Unterschiede zwischen den Gruppenmitteln, wäre ein so großes F ${often(a.p)} Stichproben zu erwarten (${pText(a.p)}).`,
        fachlich: `F(${a.dfBetween}, ${a.dfWithin}) ≈ ${num(a.F)}, ${pText(a.p)}, η² ≈ ${num(a.eta2)}. Welch-ANOVA ohne gleiche Varianzen: F ≈ ${num(a.welch.F)} bei ${a.welch.df1} und ${dfText(a.welch.df2)} Freiheitsgraden, ${pText(a.welch.p)}.`,
        zusatz: `Je Abschluss zwischen ${Math.min(...a.groups.map(g => g.n))} und ${Math.max(...a.groups.map(g => g.n))} Befragte. Die Daten zeigen einen Zusammenhang, keine Wirkung des Abschlusses.`,
      };
    },
    voraussetzung: 'Unabhängige Befragte und ähnliche Streuung in allen Gruppen. Mit 37 bis 42 Personen je Gruppe sind die Gruppenmittel annähernd normalverteilt.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit F?', options: ['verdoppelt sich', 'vervierfacht sich', 'bleibt gleich'], correct: 2,
        explain: 'Beide Quadratsummen werden viermal so groß, zwischen und innerhalb. F ist ihr Verhältnis und bleibt gleich.',
        kurz: 'F hängt nicht von der Einheit ab.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Lernzeit wird umgepolt: 60 Stunden minus der eigene Wert. Was passiert mit F?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 0,
        explain: 'Alle Abstände drehen nur ihre Richtung. Quadriert sind sie so groß wie vorher, beide Quadratsummen bleiben gleich. F hat kein Vorzeichen.',
        kurz: 'F misst Unterschiede, nicht ihre Richtung.',
        tryIt: { label: 'Lernzeit umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'oneway_anova', variant: 0,
    tokens: {
      oneway_anova: { sym: 'oneway_anova()', term: 'Einfaktorielle ANOVA', kurz: 'Vergleicht die Mittelwerte mehrerer Gruppen. summary() zeigt die Quadratsummen, F, die Welch-ANOVA und Effektgrößen.', fehler: 'Ohne group = weiß mariposa nicht, welche Gruppen es vergleichen soll, und meldet: Argument `group` is missing, with no default.' },
    },
    outputMap: [
      { match: '313.983', atlas: 'SS_B', step: 2, explain: 'Sum of Squares in der Zeile Between Groups: die Quadratsumme zwischen den Gruppen aus Schritt 2.' },
      { match: '1771.837', atlas: 'SS_W', step: 3, explain: 'Sum of Squares in der Zeile Within Groups: die Quadratsumme innerhalb der Gruppen aus Schritt 3.' },
      { match: 'Mean Square', atlas: 'MS_B', step: 4, explain: 'Mean Square ist die geteilte Quadratsumme aus Schritt 4: 313.983 / 4. Darunter steht MS_W = 1771.837 / 195.' },
      { match: 'F', atlas: 'F', step: 5, explain: 'F = 78.496 / 9.086, wie in Schritt 5. Daneben steht p, hier kleiner als 0,001.' },
      { match: 'Eta Squared', atlas: 'η²', explain: 'Der Anteil der Streuung zwischen den Gruppen an der gesamten Streuung: 313.983 / 2085.820.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist F? Tippe sie an.', correct: 'F',
      wrong: { 'Mean Square': 'Fast! Das ist MS_B aus Schritt 4. F ist MS_B geteilt durch MS_W.', '313.983': 'Fast! Das ist die Quadratsumme zwischen den Gruppen. F entsteht erst nach dem Teilen.', 'Eta Squared': 'Fast! Das ist η², der Anteil der Streuung zwischen den Gruppen.' },
    },
  },
  next: {
    next: { id: 'tukey_test', why: 'Die ANOVA sagt, dass sich irgendwo Gruppen unterscheiden. Tukey zeigt, welche Paare es sind.' },
    before: [
      { id: 'group_variation', why: 'Die beiden Quadratsummen, die F ins Verhältnis setzt.' },
      { id: 't_test', why: 'Der Vergleich von genau zwei Gruppen; mit zwei Gruppen ist F = t².' },
    ],
    after: [
      { id: 'levene_test', why: 'Prüft, ob die Gruppen ähnlich streuen, wie die klassische ANOVA annimmt.' },
      { id: 'factorial_anova', why: 'Zwei Gruppierungen auf einmal, etwa Schulabschluss und Weiterbildung.' },
      { id: 'kruskal_wallis', why: 'Der Vergleich mehrerer Gruppen mit Rängen statt Mittelwerten.' },
    ],
    more: [
      { id: 'f_distribution', why: 'Die Verteilung, an der F gemessen wird.' },
      { id: 'multiplicity', why: 'Warum viele einzelne t-Tests öfter zufällig etwas finden.' },
    ],
  },
};

export const groupVariationTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Dieselbe Zerlegung mit allen 200 Befragten: Wie viel der Streuung der Lernzeit liegt zwischen den fünf Schulabschlüssen?',
    value: c => anovaFor(c)?.ssBetween ?? null,
    result: c => {
      const a = anovaFor(c);
      if (!a || a.share === null) return { kurz: 'Alle haben gleich lange gelernt. Es gibt keine Streuung, die man zerlegen könnte.', fachlich: 'SS_T = 0.' };
      return {
        kurz: `Von der gesamten Streuung der Lernzeit (${num(a.ssTotal)} h²) liegen ${num(a.ssBetween)} h², also ${pct(a.share)}, zwischen den Abschlüssen. Der große Rest steckt in Unterschieden zwischen Menschen mit demselben Abschluss.`,
        fachlich: `SS_B ≈ ${num(a.ssBetween)}, SS_W ≈ ${num(a.ssWithin)}, SS_T = SS_B + SS_W ≈ ${num(a.ssTotal)} (in h²). η² = SS_B / SS_T ≈ ${num(a.eta2)}.`,
        zusatz: `Geteilt durch ihre Freiheitsgrade werden daraus MS_B ≈ ${num(a.msBetween)} und MS_W ≈ ${num(a.msWithin)}.`,
      };
    },
    voraussetzung: 'Die Zerlegung gilt immer, auch ohne Annahmen. Erst der F-Test der ANOVA braucht unabhängige Befragte und ähnliche Streuung in den Gruppen.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Quadratsumme zwischen den Gruppen?', options: ['verdoppelt sich', 'vervierfacht sich', 'bleibt gleich'], correct: 1,
        explain: 'Jeder Abstand einer Gruppenmitte zur Gesamtmitte verdoppelt sich, sein Quadrat vervierfacht sich. Der Anteil an der gesamten Streuung bleibt gleich.',
        kurz: 'Doppelte Werte, vierfache Quadratsummen, gleicher Anteil.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 4 },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit der Quadratsumme zwischen den Gruppen?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Alle Gruppenmitten und die Gesamtmitte rücken um eine Stunde. Ihre Abstände bleiben gleich.',
        kurz: 'Verschieben ändert keine Abstände.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'oneway_anova', variant: 0,
    outputMap: [
      { match: '313.983', atlas: 'SS_B', step: 2, explain: 'Sum of Squares, Zeile Between Groups: die Streuung zwischen den Gruppen aus Schritt 2.' },
      { match: '1771.837', atlas: 'SS_W', step: 3, explain: 'Sum of Squares, Zeile Within Groups: die Streuung innerhalb der Gruppen aus Schritt 3.' },
      { match: '2085.820', atlas: 'SS_T', explain: 'Die Zeile Total: beide zusammen, 313.983 + 1771.837 = 2085.820.' },
      { match: 'Eta Squared', atlas: 'Anteil zwischen', explain: 'η² = 313.983 / 2085.820: 15 % der Streuung liegen zwischen den Gruppen.' },
    ],
    check: {
      question: 'Welche Zahl ist die Streuung innerhalb der Gruppen? Tippe sie an.', correct: '1771.837',
      wrong: { '313.983': 'Fast! Das ist die Streuung zwischen den Gruppen, Zeile Between Groups.', '2085.820': 'Fast! Das ist die gesamte Streuung, Zeile Total. Innerhalb steht in der Zeile Within Groups.' },
    },
  },
  next: {
    next: { id: 'oneway_anova', why: 'Teilt beide Quadratsummen durch ihre Freiheitsgrade und setzt sie ins Verhältnis: F.' },
    before: [
      { id: 'mean', why: 'Gruppenmittel und Gesamtmittel, von denen aus die Abstände gemessen werden.' },
      { id: 'ss', why: 'Quadrierte Abstände zusammengezählt, wie bei der Streuung einer einzelnen Gruppe.' },
    ],
    after: [{ id: 'factorial_anova', why: 'Zerlegt die Streuung nach zwei Gruppierungen und ihrem Zusammenspiel.' }],
    more: [{ id: 'explained_variance', why: 'Derselbe Gedanke in der Regression: der erklärte Anteil der Streuung.' }],
  },
};
