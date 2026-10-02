// Werkstatt „Paarvergleich“ für konkordante und diskordante Paare, Goodman–Kruskal-Gamma und Kendall Tau-b:
// fünf Beispielpersonen mit zwei geordneten Fragen, jedes Personenpaar einmal verglichen. Brücke zu den 200 Befragten
// und Reiter der drei Begriffe. Alle Zahlen sind in R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, Variant, Workshop } from '../../types';
import type { Pairs } from '../../math';
import { close, num, pct, signed } from '../../format';
import { eq, int, pl, T } from './shared';

/** Ergebnis eines Personenpaars: gleich gerichtet, entgegengesetzt oder Gleichstand (bei x, bei y, bei beiden). */
export type PairKind = 'C' | 'D' | 'Tx' | 'Ty' | 'Txy';
export const pairKind = (x1: number, y1: number, x2: number, y2: number): PairKind => {
  const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  return dx === 0 && dy === 0 ? 'Txy' : dx === 0 ? 'Tx' : dy === 0 ? 'Ty' : dx === dy ? 'C' : 'D';
};

/** Kennwerte der Paarvergleiche; `ci`, `di`, `txi`, `tyi` zählen je Person die Paare mit den Personen nach ihr. */
export type PairCount = {
  n: number; xs: number[]; ys: number[]; n0: number;
  later: number[]; ci: number[]; di: number[]; txi: number[]; tyi: number[];
  C: number; D: number; Tx: number; Ty: number; Txy: number;
  cd: number; cpd: number; nx: number; ny: number; ties: number;
  gamma: number | null; tau: number | null;
  /** Für Diagnosen: C − D durch alle Paare, Gleichstände bei x und y zusammen. */
  cdOverN0: number; txy2: number;
};

export function pairCount(d: Pairs): PairCount {
  const n = d.x.length, n0 = n * (n - 1) / 2;
  const ci = new Array<number>(n).fill(0), di = ci.slice(), txi = ci.slice(), tyi = ci.slice();
  let Txy = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const k = pairKind(d.x[i], d.y[i], d.x[j], d.y[j]);
    if (k === 'C') ci[i]++; else if (k === 'D') di[i]++;
    if (k === 'Tx' || k === 'Txy') txi[i]++;
    if (k === 'Ty' || k === 'Txy') tyi[i]++;
    if (k === 'Txy') Txy++;
  }
  const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
  const C = sum(ci), D = sum(di), Tx = sum(txi), Ty = sum(tyi), cd = C - D, cpd = C + D, nx = n0 - Tx, ny = n0 - Ty;
  return {
    n, xs: [...d.x], ys: [...d.y], n0, later: ci.map((_, i) => n - 1 - i), ci, di, txi, tyi, C, D, Tx, Ty, Txy, cd, cpd, nx, ny,
    ties: n0 - cpd, gamma: cpd > 0 ? cd / cpd : null, tau: nx > 0 && ny > 0 ? cd / Math.sqrt(nx * ny) : null,
    cdOverN0: n0 > 0 ? cd / n0 : 0, txy2: Tx + Ty,
  };
}

type C = Ctx<PairCount>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const LABEL: Record<PairKind, string> = { C: 'gleich gerichtet', D: 'entgegengesetzt', Tx: 'Gleichstand beim Interesse', Ty: 'Gleichstand bei den Nachrichten', Txy: 'Gleichstand bei beiden' };
/** „B (2, 1)“: Person mit ihren beiden Antworten. */
const who2 = (c: C, j: number) => `${c.names[j]} (${c.s.xs[j]}, ${c.s.ys[j]})`;
/** Vergleiche der gewählten Person mit allen Personen nach ihr. */
const comparisons = (c: C) => {
  const i = c.who, out: { j: number; kind: PairKind }[] = [];
  for (let j = i + 1; j < c.s.n; j++) out.push({ j, kind: pairKind(c.s.xs[i], c.s.ys[i], c.s.xs[j], c.s.ys[j]) });
  return out;
};
const list = (names: string[]) => names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}`;
const intro = (c: C) => `Person ${P(c)} hat Interesse ${c.s.xs[c.who]} und Nachrichten ${c.s.ys[c.who]}.`;
const LAST = (c: C) => `Person ${P(c)} kommt als Letzte dran: Mit allen anderen ist sie schon verglichen.`;

/** Eingesetzte Formel bis zum letzten Schritt des Begriffs (C − D, γ oder τb). */
function numericFor(s: PairCount, last: number): FNode[] {
  const cd: FNode[] = [{ part: [int(s.C)], m: 2 }, ' ', { part: [`− ${int(s.D)}`], m: 3 }];
  if (last <= 3) return ['C − D = ', ...cd, ' = ', { part: [int(s.cd)], m: 3 }];
  const gamma: FNode[] = ['γ = (', ...cd, ') ', { part: [`/ (${int(s.C)} + ${int(s.D)})`], m: 4 }, ' = ', { part: [int(s.cd)], m: 3 }, ' ', { part: [`/ ${int(s.cpd)}`], m: 4 },
    s.gamma === null ? ': ' : ` ${eq(s.gamma)} `, { part: [s.gamma === null ? 'nicht definiert' : num(s.gamma)], m: 4 }];
  if (last <= 4) return gamma;
  return [...gamma, { br: true }, 'τb = ', { part: [int(s.cd)], m: 3 }, ' ', { part: [`/ √((${int(s.n0)} − ${int(s.Tx)}) · (${int(s.n0)} − ${int(s.Ty)}))`], m: 5 },
    s.tau === null ? ': ' : ` ${eq(s.tau)} `, { part: [s.tau === null ? 'nicht definiert' : num(s.tau)], m: 6 }];
}

/** „Von den 10 Paaren mit klarer Richtung sind 80 % gleich gerichtet.“, auch für ein einziges Paar richtig gebeugt. */
const withDirection = (C: number, cpd: number) => cpd === 1 ? `Das eine Paar mit klarer Richtung ist ${C === 1 ? 'gleich gerichtet' : 'entgegengesetzt'}.`
  : `Von den ${int(cpd)} Paaren mit klarer Richtung sind ${pct(C / cpd, 0)} gleich gerichtet.`;

const CD: FNode[] = [{ part: ['C'], m: 2 }, ' ', { part: ['− D'], m: 3 }];
/** Deutung der Richtung in den Beispielen: Interesse an Politik und Nachrichten lesen. */
const direction = (v: number) => v > 0 ? 'Wer sich mehr für Politik interessiert, liest hier eher auch öfter Nachrichten.' : 'Wer sich mehr für Politik interessiert, liest hier eher seltener Nachrichten.';

const GENAU_PAARE = 'Bei n Personen gibt es n(n − 1) / 2 Paare, bei 200 Befragten schon 19.900. R zählt sie über die Kreuztabelle: Für jede Zelle zählt es die Personen rechts unterhalb (gleich gerichtet) und links unterhalb (entgegengesetzt).';
const GENAU_ORDNUNG = 'Nur die Reihenfolge zählt, nicht die Abstände. Deshalb ändert es nichts, wenn du die Skala streckst oder andere Codes vergibst, solange die Reihenfolge bleibt. Genau das passt zu geordneten Kategorien.';
const GENAU_URSACHE = 'Ein Zusammenhang beweist keine Ursache: Interesse und Nachrichtenlesen können zum Beispiel beide mit der Bildung zusammenhängen (Begriff „Confounding“).';

const variantFor = (v: Omit<Variant<PairCount>, 'aria' | 'symbolic'> & { symbolic: FNode[]; aria: string }): Variant<PairCount> => v;

export const paarvergleich: Workshop<Pairs, PairCount> = {
  id: 'b05-paarvergleich',
  wofuer: 'Fünf Personen sagen, wie sehr sie sich für Politik interessieren (1 gar nicht bis 5 sehr stark) und wie oft sie politische Nachrichten lesen (1 nie bis 5 täglich). Die Antworten sind nur geordnet: Ob der Schritt von 1 auf 2 so groß ist wie von 4 auf 5, weiß niemand. Deshalb vergleichen wir Personen paarweise: Liest, wer sich mehr interessiert, auch öfter Nachrichten?',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus sechs kleinen Schritten, und die meisten sind Zählen: Paare bilden, gleich gerichtete und entgegengesetzte Paare zählen, Gleichstände zählen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b05-paarvergleich',
  names: NAMES,
  bounds: { min: 1, max: 5 },
  presets: [
    { id: 'meist', label: 'Meist gleich gerichtet', data: { x: [1, 2, 3, 4, 5], y: [2, 1, 3, 5, 4] } },
    { id: 'bindungen', label: 'Mit Gleichständen', data: { x: [1, 2, 2, 4, 5], y: [1, 3, 2, 3, 5] } },
    { id: 'gegen', label: 'Meist entgegengesetzt', data: { x: [1, 2, 3, 4, 5], y: [5, 3, 4, 2, 1] } },
  ],
  compute: pairCount,
  glyphs: [
    { sym: 'N₀', say: 'N null', term: 'Zahl der Personenpaare', plain: 'n(n − 1) / 2, bei fünf Personen 10', step: 1 },
    { sym: 'C', say: 'C', term: 'Konkordante Paare', plain: 'gleich gerichtete Paare', step: 2 },
    { sym: 'D', say: 'D', term: 'Diskordante Paare', plain: 'entgegengesetzte Paare', step: 3 },
    { sym: 'γ', say: 'Gamma', term: 'Goodman–Kruskal-Gamma', plain: '(C − D) / (C + D), ohne die Gleichstände', step: 4 },
    { sym: 'Tₓ, Tᵧ', say: 'T x, T y', term: 'Bindungen', plain: 'Paare mit Gleichstand beim Interesse oder bei den Nachrichten', step: 5 },
    { sym: 'τb', say: 'tau b', term: 'Kendall Tau-b', plain: '(C − D) / √((N₀ − Tₓ)(N₀ − Tᵧ)), mit den Gleichständen im Nenner', step: 6 },
  ],
  steps: [
    {
      button: 'N₀', title: 'Jede Person mit jeder vergleichen', sym: '', concept: 'concordance', perPerson: true,
      links: [{ id: 'ordinal', label: 'Geordnete Kategorien' }],
      was: 'Wir vergleichen immer zwei Personen miteinander. Jede Person trifft jede andere genau einmal; bei fünf Personen ergibt das zehn Paare.',
      rechnung: c => {
        const later = comparisons(c).map(x => c.names[x.j]);
        return later.length ? `${intro(c)} Sie wird mit ${list(later)} verglichen: ${later.length} ${later.length === 1 ? 'Paar' : 'Paare'}. Alle zusammen: 5 · 4 / 2 = ${c.s.n0} Paare.` : `${LAST(c)} Alle zusammen: 5 · 4 / 2 = ${c.s.n0} Paare.`;
      },
      fach: 'Bei n Personen gibt es N₀ = n(n − 1) / 2 Personenpaare. Das sind andere Paare als die beiden Werte einer einzelnen Person.',
      warum: 'Bei geordneten Antworten wissen wir nur, wer höher liegt. Genau diese Frage stellen wir für jedes Paar, bei beiden Fragen.',
      acht: 'Jedes Paar zählt nur einmal: A mit B ist dasselbe Paar wie B mit A. Deshalb vergleicht sich jede Person nur mit den Personen nach ihr.',
      check: {
        question: 'Wie viele Personenpaare gibt es bei fünf Personen?',
        answer: c => c.s.n0,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, 2 * c.s.n0) ? 'Fast! So zählst du jedes Paar doppelt, A mit B und B mit A. Richtig ist 5 · 4 / 2.'
          : close(v, c.s.n * c.s.n) ? 'Fast! Niemand wird mit sich selbst verglichen, und jedes Paar zählt einmal: 5 · 4 / 2.'
          : null,
      },
    },
    {
      button: 'C', title: 'Gleich gerichtete Paare zählen', sym: 'C', say: 'C', concept: 'concordance', perPerson: true,
      was: 'Ein Paar ist gleich gerichtet, wenn dieselbe Person bei beiden Fragen höher liegt. Wir zählen alle diese Paare.',
      rechnung: c => {
        const all = comparisons(c);
        if (!all.length) return `${LAST(c)} Alle zusammen: C = ${c.s.C}.`;
        const k = all.filter(x => x.kind === 'C').length;
        return `${intro(c)} ${all.map(x => `Mit ${who2(c, x.j)}: ${LABEL[x.kind]}.`).join(' ')} Davon gleich gerichtet: ${k}. Alle zusammen: C = ${c.s.C}.`;
      },
      fach: 'Ein Personenpaar ist konkordant, wenn die Reihenfolge bei x und bei y übereinstimmt. C zählt alle konkordanten Paare.',
      warum: 'Gleich gerichtete Paare sprechen für ein gleichläufiges Muster: mehr Interesse, öfter Nachrichten.',
      acht: 'Auch ein Paar, in dem dieselbe Person bei beiden Fragen niedriger liegt, ist gleich gerichtet. Es zählt nur, dass die Richtung übereinstimmt.',
      check: {
        question: 'Wie viele gleich gerichtete Paare gibt es insgesamt?',
        answer: c => c.s.C,
        diagnose: (c, v) => v === 'NA' || close(v, c.s.C) ? null
          : c.s.D > 0 && close(v, c.s.cpd) ? 'Fast! Du hast die entgegengesetzten Paare mitgezählt. Gezählt werden nur Paare, deren Richtung übereinstimmt.'
          : c.s.C > 0 && close(v, 2 * c.s.C) ? 'Fast! Du hast jedes Paar doppelt gezählt. A mit B ist dasselbe Paar wie B mit A.'
          : null,
      },
    },
    {
      button: 'C − D', title: 'Widersprüche abziehen', sym: 'C − D', say: 'C minus D', concept: 'concordance', perPerson: true,
      was: 'Ein Paar ist entgegengesetzt, wenn die eine Person mehr Interesse hat, aber seltener Nachrichten liest. Wir zählen diese Paare und ziehen sie von C ab.',
      rechnung: c => {
        const all = comparisons(c), opp = all.filter(x => x.kind === 'D').map(x => c.names[x.j]);
        const mine = !all.length ? LAST(c) : opp.length ? `Person ${P(c)}: ${opp.length} entgegengesetzte${opp.length === 1 ? 's Paar' : ' Paare'}, mit ${list(opp)}.` : `Person ${P(c)}: kein entgegengesetztes Paar.`;
        return `${mine} Alle zusammen: D = ${c.s.D}, also C − D = ${c.s.C} − ${c.s.D} = ${int(c.s.cd)}.`;
      },
      fach: 'Ein Paar ist diskordant, wenn sich die Reihenfolgen widersprechen; D zählt diese Paare. C − D ist positiv, wenn konkordante Paare überwiegen.',
      warum: 'Entgegengesetzte Paare sprechen für ein gegenläufiges Muster. Erst der Unterschied zeigt, welches Muster überwiegt.',
      acht: 'Paare mit Gleichstand sind weder gleich gerichtet noch entgegengesetzt. Sie fehlen in C und in D.',
      check: {
        question: 'Was kommt heraus, wenn du D von C abziehst?',
        answer: c => c.s.cd,
        diagnose: (c, v) => v === 'NA' || close(v, c.s.cd) ? null
          : c.s.cd !== 0 && close(v, -c.s.cd) ? 'Fast! Andersherum: C minus D, also gleich gerichtete minus entgegengesetzte Paare.'
          : c.s.D > 0 && close(v, c.s.cpd) ? 'Fast! Das ist die Summe. Gefragt ist der Unterschied C − D.'
          : null,
      },
    },
    {
      button: '÷ (C + D)', title: 'Durch die Paare mit Richtung teilen', sym: 'γ', say: 'Gamma', concept: 'goodman_gamma', perPerson: false,
      was: 'Wir teilen C − D durch C + D, die Zahl der Paare mit klarer Richtung. Paare mit Gleichstand lassen wir weg.',
      rechnung: c => c.s.gamma === null
        ? 'C + D = 0: Kein Paar hat eine klare Richtung. Durch 0 kann man nicht teilen, γ ist nicht definiert.'
        : `γ = (${c.s.C} − ${c.s.D}) / (${c.s.C} + ${c.s.D}) = ${int(c.s.cd)} / ${c.s.cpd} ${eq(c.s.gamma)} ${num(c.s.gamma)}`,
      fach: 'Goodman–Kruskal-Gamma ist (C − D) / (C + D). Es liegt zwischen −1 und +1; gebundene Paare zählen im Nenner nicht mit.',
      warum: 'So wird aus einer Anzahl ein Anteil: Wie viel mehr gleich gerichtete als entgegengesetzte Paare gibt es, gemessen an allen Paaren mit Richtung?',
      acht: 'Viele Gleichstände können Gamma groß aussehen lassen, denn sie fallen ganz aus der Rechnung. Schau deshalb auch auf Tau-b.',
      check: {
        question: c => c.s.gamma === null ? 'Wie groß ist γ? Hier gibt es kein Paar mit klarer Richtung. Tippe NA, wenn γ nicht definiert ist.' : 'Wie groß ist γ? Zwei Nachkommastellen reichen.',
        answer: c => c.s.gamma === null ? 'NA' : c.s.gamma,
        diagnose: (c, v) => v === 'NA' || c.s.gamma === null || close(v, c.s.gamma) ? null
          : close(v, c.s.cd) ? 'Fast! Das ist noch C − D. Jetzt noch durch C + D teilen.'
          : c.s.ties > 0 && close(v, c.s.cdOverN0) ? 'Fast! Du hast durch alle Paare geteilt. Gamma teilt nur durch die Paare ohne Gleichstand, also durch C + D.'
          : null,
      },
    },
    {
      button: 'Tₓ, Tᵧ', title: 'Gleichstände zählen', sym: 'Tₓ, Tᵧ', say: 'T x, T y', concept: 'kendall_tau', perPerson: true,
      was: 'Jetzt zählen wir die Paare mit Gleichstand: gleich viel Interesse, das ist Tₓ, oder gleich oft Nachrichten, das ist Tᵧ.',
      rechnung: c => {
        const all = comparisons(c), tx = all.filter(x => x.kind === 'Tx' || x.kind === 'Txy').map(x => c.names[x.j]), ty = all.filter(x => x.kind === 'Ty' || x.kind === 'Txy').map(x => c.names[x.j]);
        const mine = !all.length ? LAST(c)
          : !tx.length && !ty.length ? `Person ${P(c)}: kein Gleichstand mit den Personen nach ihr.`
          : `Person ${P(c)}: ${tx.length ? `Gleichstand beim Interesse mit ${list(tx)}` : 'beim Interesse kein Gleichstand'}, ${ty.length ? `bei den Nachrichten mit ${list(ty)}` : 'bei den Nachrichten keiner'}.`;
        return `${mine} Alle zusammen: Tₓ = ${c.s.Tx}, Tᵧ = ${c.s.Ty}.`;
      },
      fach: 'Paare mit gleichem x heißen in x gebunden (Tₓ), Paare mit gleichem y in y gebunden (Tᵧ). Ein Paar mit Gleichstand bei beiden zählt in beiden.',
      warum: 'Kendall Tau-b nimmt die Gleichstände ernst. Dafür muss es wissen, wie viele Paare bei jeder Frage keine Richtung haben.',
      acht: 'Ein Gleichstand bei einer Frage reicht: Das Paar hat dann keine klare Richtung. Es fehlt in C und D, zählt aber in Tₓ oder Tᵧ.',
      check: {
        question: 'Wie viele Paare haben beim Interesse einen Gleichstand?',
        answer: c => c.s.Tx,
        diagnose: (c, v) => v === 'NA' || close(v, c.s.Tx) ? null
          : c.s.Ty > 0 && close(v, c.s.txy2) ? 'Fast! Das sind die Gleichstände bei beiden Fragen zusammen. Gefragt ist nur das Interesse.'
          : !close(c.s.Ty, c.s.Tx) && close(v, c.s.Ty) ? 'Fast! Das sind die Gleichstände bei den Nachrichten. Gefragt ist das Interesse.'
          : null,
      },
    },
    {
      button: '÷ √( )', title: 'Gleichstände im Nenner mitzählen', sym: 'τb', say: 'tau b', concept: 'kendall_tau', perPerson: false,
      was: 'Wir teilen C − D durch die Wurzel aus dem Produkt zweier Zahlen. Das sind die Paare ohne Gleichstand beim Interesse und die Paare ohne Gleichstand bei den Nachrichten.',
      rechnung: c => c.s.tau === null
        ? 'Bei einer Frage haben alle dieselbe Antwort. Dann ist N₀ − Tₓ oder N₀ − Tᵧ gleich 0, und τb ist nicht definiert.'
        : `τb = ${int(c.s.cd)} / √((${c.s.n0} − ${c.s.Tx}) · (${c.s.n0} − ${c.s.Ty})) = ${int(c.s.cd)} / √${c.s.nx * c.s.ny} ${eq(c.s.tau)} ${num(c.s.tau)}`,
      fach: 'Kendall Tau-b ist (C − D) / √((N₀ − Tₓ)(N₀ − Tᵧ)). Ohne Gleichstände ist es so groß wie Gamma, sonst im Betrag meist kleiner.',
      warum: 'Der Nenner liegt zwischen C + D und allen Paaren. So zählen Gleichstände mit, und zwar bei der Frage, bei der sie auftreten.',
      acht: 'Tau-b ist im Betrag nie größer als Gamma. Je mehr Gleichstände es gibt, desto weiter liegen die beiden auseinander.',
      check: {
        question: c => c.s.tau === null ? 'Wie groß ist τb? Bei einer Frage antworten alle gleich. Tippe NA, wenn τb nicht definiert ist.' : 'Wie groß ist τb? Zwei Nachkommastellen reichen.',
        answer: c => c.s.tau === null ? 'NA' : c.s.tau,
        diagnose: (c, v) => v === 'NA' || c.s.tau === null || close(v, c.s.tau) ? null
          : c.s.gamma !== null && close(v, c.s.gamma) ? 'Fast! Das ist Gamma aus Schritt 4. Tau-b teilt durch √((N₀ − Tₓ)(N₀ − Tᵧ)).'
          : close(v, c.s.cdOverN0) ? 'Fast! Du hast durch alle Paare geteilt. Vorher ziehst du die Gleichstände ab: N₀ − Tₓ und N₀ − Tᵧ.'
          : close(v, c.s.cd) ? 'Fast! Das ist noch C − D. Jetzt noch durch die Wurzel teilen.'
          : null,
      },
    },
  ],
  numeric: (c, last) => numericFor(c.s, last),
  table: {
    columns: [
      { head: 'xᵢ, yᵢ', from: 1, active: [1], cell: (c, i) => `${c.s.xs[i]}, ${c.s.ys[i]}` },
      { head: 'Paare mit Späteren', from: 1, active: [1], cell: (c, i) => String(c.s.later[i]), sum: c => String(c.s.n0), sumFrom: 1 },
      { head: 'gleich gerichtet', from: 2, active: [2], cell: (c, i) => String(c.s.ci[i]), sum: c => String(c.s.C), sumFrom: 2, tone: (c, i) => c.s.ci[i] > 0 ? 'pos' : undefined },
      { head: 'entgegengesetzt', from: 3, active: [3], cell: (c, i) => String(c.s.di[i]), sum: c => String(c.s.D), sumFrom: 3, tone: (c, i) => c.s.di[i] > 0 ? 'neg' : undefined },
      { head: 'Gleichstand x, y', from: 5, active: [5], cell: (c, i) => `${c.s.txi[i]}, ${c.s.tyi[i]}`, sum: c => `${c.s.Tx}, ${c.s.Ty}`, sumFrom: 5 },
    ],
    lines: [
      { from: 3, step: 3, text: c => `C − D = ${c.s.C} − ${c.s.D} = ${int(c.s.cd)}` },
      { from: 4, step: 4, text: c => c.s.gamma === null ? 'γ: nicht definiert, C + D = 0' : `γ = ${int(c.s.cd)} / ${c.s.cpd} ${eq(c.s.gamma)} ${num(c.s.gamma)}` },
      { from: 6, step: 6, text: c => c.s.tau === null ? 'τb: nicht definiert' : `τb = ${int(c.s.cd)} / √(${c.s.nx} · ${c.s.ny}) ${eq(c.s.tau)} ${num(c.s.tau)}` },
    ],
  },
  captions: {
    1: 'Die Linien verbinden die gewählte Person mit allen Personen nach ihr. Du kannst die Punkte ziehen.',
    2: 'Grün mit Plus: die gleich gerichteten Paare der gewählten Person.',
    3: 'Grün mit Plus: gleich gerichtet. Braunrot mit Minus: entgegengesetzt. Grau gestrichelt mit Gleichheitszeichen: Gleichstand.',
    4: 'Alle zehn Paare. Gamma zählt nur die grünen und die braunroten Linien.',
    5: 'Gestrichelt: Paare mit Gleichstand bei mindestens einer Frage.',
    6: 'Tau-b zählt die gestrichelten Paare im Nenner mit, Gamma nicht.',
  },
  think: [
    {
      question: 'Zwei Personen geben bei beiden Fragen genau dieselben Antworten. Wie zählt ihr Paar?',
      options: ['gleich gerichtet', 'entgegengesetzt', 'als Gleichstand'], correct: 2, step: 5, stepFor: { concordance: 3, goodman_gamma: 3 },
      explain: 'Bei keiner Frage liegt eine der beiden höher. Das Paar hat keine Richtung: Es fehlt in C und D und zählt bei Tₓ und bei Tᵧ.',
      kurz: 'Gleiche Antworten, keine Richtung.',
      tryIt: { label: 'B antwortet wie A', apply: d => ({ x: d.x.map((v, i) => i === 1 ? d.x[0] : v), y: d.y.map((v, i) => i === 1 ? d.y[0] : v) }) },
    },
    {
      question: 'Die Nachrichtenfrage wird umgedreht: Aus 5 wird 1, aus 4 wird 2. Was passiert mit C und D?',
      options: ['sie tauschen die Plätze', 'beide bleiben gleich', 'beide werden 0'], correct: 0, step: 3,
      explain: 'Jedes gleich gerichtete Paar wird entgegengesetzt und umgekehrt. Deshalb wechseln C − D, Gamma und Tau-b ihr Vorzeichen; die Gleichstände bleiben.',
      kurz: 'Umdrehen dreht die Richtung, nicht die Stärke.',
      tryIt: { label: 'Nachrichten umdrehen', apply: d => ({ x: [...d.x], y: d.y.map(v => 6 - v) }) },
    },
    {
      question: 'Alle Antworten beim Interesse werden verdoppelt: Aus 1, 2, 3 wird 2, 4, 6. Was passiert mit C und D?',
      options: ['sie verdoppeln sich', 'sie bleiben gleich', 'sie halbieren sich'], correct: 1, step: 2,
      explain: 'Wer vorher mehr Interesse hatte, hat auch danach mehr. Die Reihenfolge bleibt, also bleibt jedes Paar, was es war. Nur Abstände ändern sich, und die zählen hier nicht.',
      kurz: 'Nur die Reihenfolge zählt.',
    },
    {
      question: 'Alle fünf geben beim Interesse dieselbe Antwort, die 3. Wie groß wird C − D?',
      options: ['0', 'bleibt gleich', 'wird größer'], correct: 0, step: 3,
      explain: 'Beim Interesse hat dann jedes Paar einen Gleichstand. Kein Paar ist gleich gerichtet oder entgegengesetzt: C = 0, D = 0. Gamma und Tau-b sind dann nicht definiert.',
      kurz: 'Ohne Reihenfolge keine Richtung.',
      tryIt: { label: 'alle beim Interesse auf 3', apply: d => ({ x: d.x.map(() => 3), y: [...d.y] }) },
    },
  ],
  variants: {
    concordance: variantFor({
      lastStep: 3,
      kurz: 'Ein Personenpaar ist gleich gerichtet, wenn dieselbe Person bei beiden Merkmalen höher liegt, und entgegengesetzt, wenn sich die Reihenfolgen widersprechen. Unterm Strich zählt, welche Sorte überwiegt.',
      fachlich: 'Konkordante Paare C stimmen in der Rangfolge beider Variablen überein, diskordante Paare D widersprechen sich; gebundene Paare zählen zu keiner der beiden.',
      symbolic: [...CD],
      aria: 'C minus D: Zahl der konkordanten minus Zahl der diskordanten Personenpaare',
      metrics: [{ label: 'Personenpaare N₀', value: c => String(c.s.n0) }, { label: 'C − D', value: c => int(c.s.cd) }],
      interpret: c => ({
        kurz: c.s.cd === 0 ? `${pl(c.s.C, 'Paar ist', 'Paare sind')} gleich gerichtet, ebenso viele entgegengesetzt. Kein Muster überwiegt.`
          : `${pl(c.s.C, 'Paar ist', 'Paare sind')} gleich gerichtet, ${c.s.D} entgegengesetzt. ${direction(c.s.cd)}`,
        fachlich: `C = ${c.s.C}, D = ${c.s.D}, C − D = ${int(c.s.cd)} bei N₀ = ${c.s.n0} Paaren; ${c.s.ties} ${c.s.ties === 1 ? 'Paar hat' : 'Paare haben'} einen Gleichstand. Ein Maß zwischen −1 und +1 entsteht erst durch Teilen.`,
      }),
      next: { id: 'goodman_gamma', label: 'Weiter zu Goodman–Kruskal-Gamma' },
      genau: {
        kurz: 'Paarvergleiche brauchen nur eine Reihenfolge, keine Abstände. Deshalb passen sie zu geordneten Kategorien.',
        paragraphs: () => [GENAU_PAARE, GENAU_ORDNUNG, GENAU_URSACHE],
      },
    }),
    goodman_gamma: variantFor({
      lastStep: 4,
      kurz: 'Gamma sagt dir, wie stark gleich gerichtete Paare gegenüber entgegengesetzten überwiegen, von −1 bis +1. Paare mit Gleichstand lässt es weg.',
      fachlich: 'Der Überschuss konkordanter über diskordante Paare, bezogen auf alle nicht gebundenen Paare: (C − D) / (C + D).',
      symbolic: ['γ = ', { frac: [...CD], den: [{ part: ['C + D'], m: 4 }], m: 4 }],
      aria: 'Gamma gleich C minus D, geteilt durch C plus D',
      metrics: [{ label: 'C − D', value: c => int(c.s.cd) }, { label: 'Gamma γ', value: c => c.s.gamma === null ? 'nicht definiert' : num(c.s.gamma) }],
      interpret: c => {
        if (c.s.gamma === null) return { kurz: 'Kein Paar hat eine klare Richtung. Dann lässt sich Gamma nicht berechnen.', fachlich: 'C + D = 0, deshalb ist γ nicht definiert.' };
        return {
          kurz: c.s.cd === 0 ? 'Gleich gerichtete und entgegengesetzte Paare halten sich genau die Waage.'
            : `${withDirection(c.s.C, c.s.cpd)} ${direction(c.s.cd)}`,
          fachlich: `γ = ${num(c.s.gamma)}. Ohne Gleichstände wäre das auch Tau-b; hier ${c.s.ties === 0 ? 'gibt es keine Gleichstände' : `fehlen ${c.s.ties} ${c.s.ties === 1 ? 'Paar' : 'Paare'} mit Gleichstand im Nenner`}. Bei nur fünf Personen ist γ sehr unsicher.`,
        };
      },
      next: { id: 'kendall_tau', label: 'Weiter zu Kendall Tau-b' },
      genau: {
        kurz: 'Gamma lässt Gleichstände weg. Bei vielen Gleichständen fällt es deshalb im Betrag größer aus als Tau-b.',
        paragraphs: c => [
          `Hier ist (C − D) / (C + D) = ${int(c.s.cd)} / ${c.s.cpd}. Umgerechnet heißt das: Unter den Paaren mit klarer Richtung ist der Anteil gleich gerichteter Paare (1 + γ) / 2.`,
          'Bei geordneten Kategorien mit wenigen Stufen gibt es sehr viele Gleichstände. Dann kann Gamma groß wirken, obwohl nur wenige Paare eine Richtung haben.',
          'goodman_gamma() aus mariposa gibt nur die Zahl aus. Hat eine Spalte nur eine Kategorie, meldet es NA und warnt, dass der Chi-Quadrat-Test nicht gerechnet wurde. Weil es intern χ² rechnet, warnt R außerdem oft vor kleinen erwarteten Zellzahlen, so auch bei Finanzlage und Schulabschluss; Gamma selbst betrifft das nicht.',
          GENAU_URSACHE,
        ],
      },
    }),
    kendall_tau: variantFor({
      lastStep: 6,
      kurz: 'Tau-b sagt dir, wie gut zwei Reihenfolgen zusammenpassen, von −1 bis +1, und zählt dabei Gleichstände mit. Ohne Gleichstände ist es so groß wie Gamma.',
      fachlich: '(C − D) / √((N₀ − Tₓ)(N₀ − Tᵧ)) mit N₀ = n(n − 1) / 2 und den in x und in y gebundenen Paaren Tₓ und Tᵧ.',
      symbolic: ['τb = ', { frac: [...CD], den: [{ big: '√', m: 6 }, { root: [{ part: ['(N₀ − Tₓ)(N₀ − Tᵧ)'], m: 5 }], m: 6 }], m: 6 }],
      aria: 'tau b gleich C minus D, geteilt durch die Wurzel aus N null minus T x, mal N null minus T y',
      metrics: [{ label: 'Gamma γ', value: c => c.s.gamma === null ? 'nicht definiert' : num(c.s.gamma) }, { label: 'Tau-b τb', value: c => c.s.tau === null ? 'nicht definiert' : num(c.s.tau) }],
      interpret: c => {
        if (c.s.tau === null) return { kurz: 'Bei einer Frage antworten alle gleich. Dann gibt es keine Reihenfolge, die man vergleichen könnte.', fachlich: 'N₀ − Tₓ oder N₀ − Tᵧ ist 0, deshalb ist τb nicht definiert.' };
        const g = c.s.gamma ?? 0;
        return {
          kurz: c.s.cd === 0 ? 'Gleich gerichtete und entgegengesetzte Paare halten sich genau die Waage.'
            : `${direction(c.s.tau)} ${c.s.ties === 0 ? `Ohne Gleichstände ist τb so groß wie Gamma: ${num(c.s.tau)}.` : `Mit ${c.s.ties} ${c.s.ties === 1 ? 'Paar' : 'Paaren'} mit Gleichstand ist τb ≈ ${num(c.s.tau)} im Betrag kleiner als Gamma, ${num(g)}.`}`,
          fachlich: `τb = ${num(c.s.tau)} mit Tₓ = ${c.s.Tx} und Tᵧ = ${c.s.Ty}; γ = ${num(g)}. Bei nur fünf Personen ist τb sehr unsicher.`,
        };
      },
      genau: {
        kurz: 'Tau-b passt zu geordneten Kategorien mit vielen Gleichständen. Mit √((N₀ − Tₓ)(N₀ − Tᵧ)) im Nenner bleibt es im Betrag höchstens so groß wie Gamma.',
        paragraphs: () => [
          'Der Nenner ist mindestens C + D und höchstens N₀. Ohne Gleichstände sind beide Nenner gleich, und τb ist so groß wie γ.',
          'kendall_tau() aus mariposa rechnet Tau-b und meldet einen p-Wert aus einer Näherung. Sie wird bei kleinen Stichproben und vielen Gleichständen ungenauer.',
          'Es gibt auch Tau-a mit N₀ im Nenner und Tau-c für rechteckige Tabellen. mariposa rechnet Tau-b.',
          GENAU_URSACHE,
        ],
      },
    }),
  },
};

// ---------- Brücke „Mit 200 Befragten“ ----------

type BC = BridgeCtx<PairCount>;
const N = (c: BC) => c.values.length;
const PB = (c: BC) => c.names[c.who];
const t1 = (c: BC) => `„${c.col.title}“`, t2 = (c: BC) => `„${c.col2!.title}“`;
/** Richtung aus dem Vorzeichen, nie aus den Spaltennamen. */
const towards = (c: BC, v: number) => `Wer bei ${t1(c)} höher liegt, liegt bei ${t2(c)} eher ${v > 0 ? 'auch höher' : 'tiefer'}.`;

export const bridgePaarvergleich: Bridge<PairCount> = {
  data: 'pairs',
  numeric: (c, last) => numericFor(c.s, last),
  lines: [
    {
      all: c => `${N(c)} Befragte ergeben ${N(c)} · ${N(c) - 1} / 2 = ${int(c.s.n0)} Personenpaare.`,
      person: c => c.who === 0 ? `${PB(c)} kommt als Erste dran: Sie wird mit allen ${N(c) - 1} anderen verglichen.`
        : c.who === N(c) - 1 ? `${PB(c)} kommt als Letzte dran: Mit allen anderen ist sie schon verglichen.`
        : `${PB(c)} wird mit ${c.s.later[c.who] === 1 ? 'der einen Person' : `den ${c.s.later[c.who]} Befragten`} nach ihr verglichen; mit ${c.who === 1 ? 'der einen Person' : `den ${c.who} Befragten`} davor ist sie schon verglichen.`,
    },
    {
      all: c => `In ${int(c.s.C)} Paaren liegt dieselbe Person bei beiden Spalten höher: gleich gerichtet.`,
      person: c => { const k = c.s.ci[c.who]; return `Mit den Befragten nach ${PB(c)} ${k === 0 ? 'ergibt sich kein gleich gerichtetes Paar' : k === 1 ? 'ergibt sich 1 gleich gerichtetes Paar' : `ergeben sich ${k} gleich gerichtete Paare`}.`; },
    },
    {
      all: c => `${int(c.s.D)} Paare sind entgegengesetzt. C − D = ${int(c.s.C)} − ${int(c.s.D)} = ${int(c.s.cd)}.`,
      person: c => `Mit den Befragten nach ${PB(c)}: ${pl(c.s.di[c.who], 'entgegengesetztes Paar', 'entgegengesetzte Paare')}, also ${signed(c.s.ci[c.who] - c.s.di[c.who])} für C − D.`,
    },
    {
      all: c => c.s.gamma === null ? 'Kein Paar hat eine klare Richtung. Dann ist γ nicht definiert.'
        : `γ = ${int(c.s.cd)} / ${int(c.s.cpd)} ≈ ${num(c.s.gamma)}. ${c.s.ties === 0 ? 'Paare mit Gleichstand gibt es nicht.' : c.s.ties === 1 ? 'Das eine Paar mit Gleichstand zählt nicht mit.' : `Die ${int(c.s.ties)} Paare mit Gleichstand zählen nicht mit.`}`,
      person: c => `${PB(c)} trägt ${c.s.ci[c.who]} − ${c.s.di[c.who]} = ${signed(c.s.ci[c.who] - c.s.di[c.who])} zu C − D bei.`,
    },
    {
      all: c => `${int(c.s.Tx)} Paare haben bei ${t1(c)} denselben Wert, ${int(c.s.Ty)} bei ${t2(c)}.`,
      person: c => `${PB(c)}: ${pl(c.s.txi[c.who], 'Gleichstand', 'Gleichstände')} bei ${t1(c)} und ${c.s.tyi[c.who]} bei ${t2(c)} mit den Befragten nach ihr.`,
    },
    {
      all: c => c.s.tau === null ? 'Eine Spalte hat lauter gleiche Werte. Dann ist τb nicht definiert.'
        : `τb = ${int(c.s.cd)} / √(${int(c.s.nx)} · ${int(c.s.ny)}) ≈ ${num(c.s.tau)}. ${c.s.gamma !== null && Math.abs(c.s.gamma - c.s.tau) > 0.005 ? `Gamma ist ${num(c.s.gamma)}: Die Gleichstände machen τb im Betrag kleiner.` : 'Gamma ist fast genauso groß.'}`,
      person: c => {
        const k = c.s.ci[c.who] - c.s.di[c.who], tau = c.s.tau ?? 0;
        return k === 0 || Math.abs(tau) < 0.005 ? `${PB(c)} trägt nichts zur Richtung bei.`
          : `${PB(c)} ${k * tau > 0 ? 'stützt' : 'schwächt'} den ${tau > 0 ? 'gleichläufigen' : 'gegenläufigen'} Zusammenhang mit ${signed(k)} ${Math.abs(k) === 1 ? 'Paar' : 'Paaren'}.`;
      },
    },
  ],
  metrics: (c, variant) => [
    { label: 'Befragte n', value: String(N(c)) },
    ...(variant === 'concordance' ? [{ label: 'Personenpaare N₀', value: int(c.s.n0) }, { label: 'C − D', value: int(c.s.cd) }]
      : variant === 'goodman_gamma' ? [{ label: 'C − D', value: int(c.s.cd) }, { label: 'Gamma γ', value: c.s.gamma === null ? 'nicht definiert' : num(c.s.gamma) }]
      : [{ label: 'Gamma γ', value: c.s.gamma === null ? 'nicht definiert' : num(c.s.gamma) }, { label: 'Tau-b τb', value: c.s.tau === null ? 'nicht definiert' : num(c.s.tau) }]),
  ],
  interpret: (c, variant) => {
    const zusatz = `${int(c.s.ties)} von ${int(c.s.n0)} Paaren haben einen Gleichstand bei mindestens einer Spalte.`;
    const value = variant === 'concordance' ? c.s.cd : variant === 'goodman_gamma' ? c.s.gamma : c.s.tau;
    if (value === null) return { kurz: 'Eine der beiden Spalten hat lauter gleiche Werte, oder kein Paar hat eine Richtung. Dann lässt sich das Maß nicht berechnen.', fachlich: 'Der Nenner ist 0, deshalb ist das Maß nicht definiert.', zusatz };
    const even = `Gleich gerichtete und entgegengesetzte Paare halten sich bei ${t1(c)} und ${t2(c)} ${c.s.cd === 0 ? 'genau' : 'fast'} die Waage.`;
    if (variant === 'concordance') return {
      kurz: c.s.cd === 0 ? even : `${pl(c.s.C, 'Paar ist', 'Paare sind')} gleich gerichtet, ${int(c.s.D)} entgegengesetzt. ${towards(c, c.s.cd)}`,
      fachlich: `C = ${int(c.s.C)}, D = ${int(c.s.D)}, C − D = ${int(c.s.cd)} bei N₀ = ${int(c.s.n0)} Personenpaaren und n = ${N(c)}.`,
      zusatz,
    };
    const near0 = Math.abs(value) < 0.05;
    return {
      kurz: near0 ? even : `${withDirection(c.s.C, c.s.cpd)} ${towards(c, value)}`,
      fachlich: variant === 'goodman_gamma'
        ? `Goodman–Kruskal-Gamma von ${t1(c)} und ${t2(c)}: γ ≈ ${num(value)} bei n = ${N(c)}. Die ${int(c.s.ties)} Paare mit Gleichstand fehlen im Nenner.`
        : `Kendall Tau-b von ${t1(c)} und ${t2(c)}: τb ≈ ${num(value)} bei n = ${N(c)}, mit Tₓ = ${int(c.s.Tx)} und Tᵧ = ${int(c.s.Ty)}. Gamma ist ${c.s.gamma === null ? 'nicht definiert' : num(c.s.gamma)}.`,
      zusatz,
    };
  },
  voraussetzung: () => 'Beide Spalten brauchen eine sinnvolle Reihenfolge, etwa geordnete Kategorien. Abstände zwischen den Antworten spielen keine Rolle.',
  picture: (c, step) => ({
    contributions: step >= 3 ? { label: 'Je Befragte: gleich gerichtete minus entgegengesetzte Paare mit den Befragten nach ihr', values: c.s.ci.map((v, i) => v - c.s.di[i]) } : undefined,
  }),
  value: (c, variant) => variant === 'concordance' ? c.s.cd : variant === 'goodman_gamma' ? c.s.gamma : c.s.tau,
};
paarvergleich.bridge = bridgePaarvergleich;

// ---------- Reiter ----------

const PV = 'finanzlage,schulabschluss';
const UMPOLEN_Y = { label: 'Schulabschluss umpolen (4 minus Code)', op: 'reverse', column: 'y' } as const;
const UMPOLEN_X = { label: 'Finanzlage umpolen (6 minus Code)', op: 'reverse', column: 'x' } as const;
const GAMMA_FN = { sym: 'goodman_gamma()', term: T('goodman_gamma'), kurz: 'Berechnet Goodman–Kruskal-Gamma für zwei geordnete Spalten. R gibt nur die Zahl aus, ohne p-Wert.', fehler: 'Mit nur einer Spalte meldet mariposa: Exactly two variables must be specified for `chi_square()`.' };
const ONE: { match: string; atlas: string; explain: string } = { match: '[1]', atlas: 'Nummer der ersten Zahl', explain: '[1] gehört nicht zum Ergebnis. R nummeriert damit nur die erste Zahl einer Ausgabe.' };

export const concordanceTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b05-paarvergleich', variant: 'concordance', variable: PV,
    think: [
      {
        question: 'Der Schulabschluss wird umgepolt: Aus Code 4 wird 0, aus 3 wird 1. Was passiert mit C − D?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 3,
        explain: 'Jedes gleich gerichtete Paar wird entgegengesetzt und umgekehrt: C und D tauschen die Plätze (Schritt 3). Damit wechselt C − D das Vorzeichen.',
        kurz: 'Umpolen dreht die Richtung jedes Paars.',
        tryIt: UMPOLEN_Y, expect: { change: 'sign' },
      },
      {
        question: 'Die Finanzlage wird umgepolt: Aus „sehr leicht“ wird „sehr schwer“. Was passiert mit C − D?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'verdoppelt sich'], correct: 1, step: 3,
        explain: 'Auch so dreht jedes Paar mit Richtung seine Richtung um. Wer vorher bei der Finanzlage höher lag, liegt jetzt tiefer.',
        kurz: 'Es ist gleich, welche Spalte du umpolst.',
        tryIt: UMPOLEN_X, expect: { change: 'sign' },
      },
    ],
  },
  next: {
    next: { id: 'goodman_gamma', why: 'Teilt C − D durch alle Paare mit klarer Richtung. So entsteht eine Zahl zwischen −1 und +1.' },
    before: [
      { id: 'ordinal', why: 'Paarvergleiche brauchen nur eine Reihenfolge, keine Abstände.' },
      { id: 'pairs', why: 'Jede Person bringt ihre beiden Antworten in jeden Vergleich mit.' },
    ],
    after: [{ id: 'kendall_tau', why: 'Nimmt zusätzlich die Gleichstände in den Nenner.' }],
    more: [
      { id: 'spearman', why: 'Ein anderes Maß für Reihenfolgen: Pearson mit Rängen.' },
      { id: 'crosstab', why: 'Bei geordneten Kategorien zählt R die Paare über die Kreuztabelle.' },
    ],
  },
};

export const gammaTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b05-paarvergleich', variant: 'goodman_gamma', variable: PV,
    think: [
      {
        question: 'Der Schulabschluss wird umgepolt: Aus Code 4 wird 0, aus 3 wird 1. Was macht Gamma?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 4,
        explain: 'C und D tauschen die Plätze (Schritt 3), C + D bleibt gleich. Damit behält γ seinen Betrag und wechselt das Vorzeichen (Schritt 4).',
        kurz: 'Umpolen dreht die Richtung, nicht die Stärke.',
        tryIt: UMPOLEN_Y, expect: { change: 'sign' },
      },
      {
        question: 'Die Finanzlage wird umgepolt: Aus „sehr leicht“ wird „sehr schwer“. Was macht Gamma?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'halbiert sich'], correct: 1, step: 4,
        explain: 'Auch hier dreht jedes Paar mit Richtung seine Richtung um. Die Gleichstände bleiben, also bleibt der Nenner, und γ wechselt das Vorzeichen.',
        kurz: 'Es ist gleich, welche Spalte du umpolst.',
        tryIt: UMPOLEN_X, expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'goodman_gamma', variant: 0,
    tokens: { goodman_gamma: GAMMA_FN },
    outputMap: [
      { match: '0.1349763', atlas: 'γ', step: 4, explain: 'Das ist Gamma für Finanzlage und Schulabschluss: (C − D) / (C + D) mit allen 200 Befragten. Dieselbe Zahl siehst du im Teil mit den 200 Befragten, wenn du Finanzielle Lage und Schulabschluss wählst.' },
      ONE,
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist Gamma? Tippe sie an.', correct: '0.1349763',
      wrong: { '[1]': 'Fast! [1] ist nur die Nummer der ersten Zahl in der Ausgabe. Gamma steht dahinter.' },
    },
  },
  next: {
    next: { id: 'kendall_tau', why: 'Zählt die Gleichstände im Nenner mit und fällt deshalb bei vielen Gleichständen im Betrag kleiner aus.' },
    before: [
      { id: 'concordance', why: 'Die gleich gerichteten und entgegengesetzten Paare, aus denen Gamma entsteht.' },
      { id: 'ordinal', why: 'Gamma braucht eine sinnvolle Reihenfolge der Kategorien.' },
    ],
    after: [{ id: 'effect', why: 'Gamma beschreibt, wie stark ein Zusammenhang ist.' }],
    more: [
      { id: 'crosstab', why: 'Die Tabelle, aus der R die Paare zählt.' },
      { id: 'spearman', why: 'Ein Maß für Reihenfolgen, das mit Rängen rechnet.' },
    ],
  },
};

export const tauTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b05-paarvergleich', variant: 'kendall_tau', variable: PV,
    think: [
      {
        question: 'Die Finanzlage wird umgepolt: Aus „sehr leicht“ wird „sehr schwer“. Was macht τb?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 6,
        explain: 'C und D tauschen die Plätze, die Gleichstände bleiben. Zähler und Nenner behalten ihren Betrag, nur das Vorzeichen dreht sich (Schritt 6).',
        kurz: 'Umpolen dreht die Richtung, nicht die Stärke.',
        tryIt: UMPOLEN_X, expect: { change: 'sign' },
      },
      {
        question: 'Der Schulabschluss wird umgepolt: Aus Code 4 wird 0, aus 3 wird 1. Was macht τb?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'verdoppelt sich'], correct: 1, step: 6,
        explain: 'Auch so dreht jedes Paar mit Richtung seine Richtung um. Tₓ und Tᵧ bleiben gleich, also auch der Nenner.',
        kurz: 'Es ist gleich, welche Spalte du umpolst.',
        tryIt: UMPOLEN_Y, expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'kendall_tau', variant: 0,
    tokens: {
      kendall_tau: { sym: 'kendall_tau()', term: T('kendall_tau'), kurz: 'Berechnet Kendall Tau-b für zwei oder mehr Spalten, dazu den p-Wert und die Zahl der Befragten N.', fehler: 'Mit nur einer Spalte meldet mariposa: At least two variables must be specified for correlation analysis.' },
    },
    outputMap: [
      { match: 'tau', atlas: 'τb', step: 6, explain: 'tau ist Kendall Tau-b für Finanzlage und Schulabschluss. Dieselbe Zahl siehst du im Teil mit den 200 Befragten, wenn du Finanzielle Lage und Schulabschluss wählst.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es unter allen Menschen keinen Zusammenhang der Reihenfolgen, käme ein so großes τb in etwa 6 bis 7 von 100 Stichproben vor.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten mit gültigen Werten in beiden Spalten.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist Tau-b? Tippe sie an.', correct: 'tau',
      wrong: { p: 'Fast! Das ist der p-Wert. Er sagt, wie überraschend τb wäre, wenn es keinen Zusammenhang gäbe. Tau-b steht hinter tau =.', N: 'Fast! Das ist die Zahl der Befragten. Tau-b steht hinter tau =.' },
    },
  },
  next: {
    next: { id: 'spearman', why: 'Vergleicht Reihenfolgen über Ränge statt über Paare und ist im Betrag meist etwas größer als τb.' },
    before: [
      { id: 'concordance', why: 'Die gleich gerichteten und entgegengesetzten Paare im Zähler.' },
      { id: 'goodman_gamma', why: 'Dieselbe Idee ohne die Gleichstände im Nenner.' },
    ],
    after: [{ id: 'p_value', why: 'kendall_tau() meldet, wie überraschend τb wäre, wenn es keinen Zusammenhang gäbe.' }],
    more: [
      { id: 'ranks', why: 'Gleichstände sind auch bei Rängen das Thema: Sie teilen sich ihre Plätze.' },
      { id: 'effect', why: 'Tau-b beschreibt, wie stark ein Zusammenhang ist.' },
    ],
  },
};
