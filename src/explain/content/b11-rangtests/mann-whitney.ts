// Werkstatt „Mann–Whitney-U“ (B11): acht Lernzeiten in zwei Gruppen, Ränge, Rangsummen, U und z wie mariposa::mann_whitney().
// Ton nach der Streuung (src/explain/content/streuung.ts). Alle Zahlen sind in R nachgerechnet (b11-rangtests.test.ts).
import type { ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import { close, count, num, signed } from '../../format';
import { byGroup, mannWhitney, midRanks, type MannWhitney } from './rank';
import { pOften, pText, rWord, signif } from './words';

/** Vier Personen ohne (A bis D), vier mit Weiterbildung (E bis H). */
export const MW_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export const MW_GROUP = [0, 0, 0, 0, 1, 1, 1, 1] as const;
export const MW_START = [2, 4, 5, 9, 6, 7, 10, 30];
export const MW_TIES = [3, 5, 5, 8, 5, 6, 9, 12];

export type MwStats = MannWhitney & {
  xs: number[];
  /** Rang je Person in der gemeinsamen Reihe, Platz in der eigenen Gruppe, von oben gezählt. */
  rank: number[]; own: number[]; rev: number[];
  /** Summe der Lernzeiten je Gruppe (Denkfehler: Werte statt Ränge zusammengezählt). */
  sum1: number; sum2: number;
  /** R₁ − 6 (Denkfehler n₁(n₁ − 1) / 2), der größere U-Wert, alle Paare n₁ · n₂, U − E, U / σ. */
  wrongMin: number; big: number; pairs: number; gap: number; noE: number;
  ties: boolean;
  /** Exakter p-Wert wie wilcox.test() ohne Gleichstände, sonst null. */
  exact: number | null;
};

/** Exakter zweiseitiger p-Wert: Anteil aller 70 Aufteilungen der Ränge 1 bis 8 mit einem ebenso kleinen U. */
function exactP(U: number): number {
  let hits = 0, all = 0;
  for (let mask = 0; mask < 256; mask++) {
    let bits = 0, R = 0;
    for (let i = 0; i < 8; i++) if (mask & (1 << i)) { bits++; R += i + 1; }
    if (bits !== 4) continue;
    all++;
    if (R - 10 <= U + 1e-9) hits++;
  }
  return Math.min(1, 2 * hits / all);
}

export function mwCompute(xs: number[]): MwStats {
  const g1 = xs.slice(0, 4), g2 = xs.slice(4), t = mannWhitney(g1, g2);
  const own = [...midRanks(g1), ...midRanks(g2)], ties = new Set(xs).size < xs.length;
  return {
    ...t, xs: [...xs], rank: t.ranks, own, rev: t.ranks.map(r => 9 - r),
    sum1: g1.reduce((a, b) => a + b, 0), sum2: g2.reduce((a, b) => a + b, 0),
    wrongMin: t.R1 - 6, big: Math.max(t.U1, t.U2), pairs: 16, gap: t.U - t.E, noE: t.sd > 0 ? t.U / t.sd : 0,
    ties, exact: ties ? null : exactP(t.U),
  };
}

type C = Ctx<MwStats>;
const P = (c: C) => c.names[c.who];
const group = (i: number) => MW_GROUP[i] ? 'mit Weiterbildung' : 'ohne Weiterbildung';
const hours = (v: number) => `${num(v)} h`;
/** „1 + 2 + 3 + 6“: die Ränge einer Gruppe. */
const ranksOf = (c: C, g: 0 | 1) => c.s.rank.filter((_, i) => MW_GROUP[i] === g).map(r => num(r)).join(' + ');
const zText = (c: C) => Number.isFinite(c.s.z) ? num(c.s.z) : 'nicht definiert';
/** Wer in wie vielen Paaren vorn liegt, als Satz über Menschen. */
function pairsSentence(s: MwStats): string {
  if (Math.abs(s.U1 - s.U2) < 1e-9) return 'Beide Gruppen liegen in gleich vielen Paaren vorn, in je 8 von 16.';
  const [lead, v] = s.U2 > s.U1 ? ['mit', s.U2] : ['ohne', s.U1];
  return `In ${num(v)} von 16 Paaren aus je einer Person ohne und einer mit Weiterbildung lernt die Person ${lead} Weiterbildung länger${s.ties ? ', ein Gleichstand zählt halb' : ''}.`;
}

const parts = (c: C, last: number): FNode[] => {
  const u1: FNode[] = ['U₁ = (', { part: [ranksOf(c, 0)], m: 1 }, ') ', { part: ['− 4 · 5 / 2'], m: 3 }, ' = ', { part: [num(c.s.R1)], m: 2 }, ' − 10 = ', { part: [num(c.s.U1)], m: 3 }];
  const u: FNode[] = [{ br: true }, 'U = ', { part: [`min(${num(c.s.U1)}, 16 − ${num(c.s.U1)}) = ${num(c.s.U)}`], m: 4 }];
  const z: FNode[] = [{ br: true }, { part: [`z = (${num(c.s.U)} − 8) / ${num(c.s.sd)} ≈ ${zText(c)}`], m: 5 }];
  return [...u1, ...(last >= 4 ? u : []), ...(last >= 5 ? z : [])];
};

export const mannWhitneyWorkshop: Workshop<number[], MwStats> = {
  id: 'b11-mw',
  wofuer: 'Lernen Menschen mit Weiterbildung mehr als Menschen ohne? Acht Personen sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben: vier ohne Weiterbildung, vier mit. Eine Person lernt 30 Stunden und zieht den Mittelwert ihrer Gruppe weit nach oben. Der Mann–Whitney-U-Test vergleicht die Gruppen deshalb nicht über Mittelwerte, sondern über Ränge.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber nur aus fünf kleinen Schritten: der Reihe nach ordnen, zusammenzählen, abziehen und am Ende teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b11-mw',
  dataNote: 'Acht Beispielpersonen: A bis D ohne, E bis H mit Weiterbildung. Die Punkte im Bild lassen sich ziehen.',
  names: MW_NAMES,
  bounds: { min: 0, max: 30 },
  presets: [
    { id: 'start', label: 'Mit Ausreißer: 2 4 5 9 gegen 6 7 10 30', data: MW_START },
    { id: 'gleich', label: 'Mit Gleichstand: 3 5 5 8 gegen 5 6 9 12', data: MW_TIES },
  ],
  compute: mwCompute,
  glyphs: [
    { sym: 'R(xᵢ)', say: 'R von x i', term: 'Rang', plain: 'der Platz von Person i in der gemeinsamen Reihe', step: 1 },
    { sym: 'R₁, R₂', say: 'R eins, R zwei', term: 'Rangsummen', plain: 'alle Ränge einer Gruppe zusammengezählt', step: 2 },
    { sym: 'n₁, n₂', say: 'n eins, n zwei', term: 'Gruppengrößen', plain: 'wie viele Personen in jeder Gruppe sind, hier je 4', step: 3 },
    { sym: 'U₁', say: 'U eins', term: 'U der ersten Gruppe', plain: 'in wie vielen Paaren die erste Gruppe vorn liegt', step: 3 },
    { sym: 'U', say: 'U', term: 'Mann–Whitney-U', plain: 'der kleinere der beiden U-Werte', step: 4 },
    { sym: 'σ(U)', say: 'Sigma von U', term: 'Standardabweichung von U', plain: 'wie stark U ohne Unterschied üblicherweise schwankt', step: 5 },
    { sym: 'z', say: 'z', term: 'Prüfgröße', plain: 'Abstand von U zur Erwartung, in σ(U) gemessen', step: 5 },
  ],
  steps: [
    {
      button: 'Ränge', title: 'Alle in eine Reihe stellen', sym: 'R(xᵢ)', say: 'R von x i', concept: 'ranks', perPerson: true,
      links: [{ id: 'ordinal', label: 'Geordnete Kategorien' }],
      was: 'Wir stellen alle acht Personen nach ihrer Lernzeit in eine Reihe, egal aus welcher Gruppe. Die kürzeste Lernzeit bekommt Rang 1, die längste Rang 8.',
      rechnung: c => {
        const v = c.s.xs[c.who], same = c.s.xs.map((x, i) => [x, i] as const).filter(([x, i]) => x === v && i !== c.who).map(([, i]) => c.names[i]);
        const less = c.s.xs.filter(x => x < v).length;
        if (!same.length) return `Person ${P(c)} lernt ${hours(v)}. ${less === 1 ? 'Eine Person lernt' : `${less} Personen lernen`} weniger, also bekommt ${P(c)} Rang ${num(c.s.rank[c.who])}.`;
        return `Person ${P(c)} lernt ${hours(v)}, genau wie ${same.join(' und ')}. Sie teilen sich die Plätze ${less + 1} bis ${less + same.length + 1} und bekommen alle den mittleren Rang ${num(c.s.rank[c.who])}.`;
      },
      fach: 'Ein Rang ist der Platz eines Werts in der gemeinsamen Reihenfolge aller Werte. Gleiche Werte bekommen den Mittelwert ihrer Plätze.',
      warum: 'Ränge halten nur die Reihenfolge fest, nicht die Abstände. Ob jemand 10 oder 30 Stunden lernt, ist für den höchsten Rang gleich.',
      acht: 'Die Ränge vergibst du für alle acht gemeinsam, nicht getrennt je Gruppe. Sonst hätte jede Gruppe ihren eigenen Rang 1, und der Vergleich ginge verloren.',
      alltag: 'Wie beim Zieleinlauf eines Laufs: Für die Platzierung zählt nur, wer vor wem ankommt, nicht wie viele Sekunden dazwischen liegen.',
      check: {
        question: c => `Welchen Rang bekommt Person ${P(c)}?`,
        answer: c => c.s.rank[c.who],
        diagnose: (c, v) => {
          const r = c.s.rank[c.who];
          if (v === 'NA' || close(v, r)) return null;
          if (close(v, c.s.own[c.who])) return 'Fast! Das ist der Platz innerhalb der eigenen Gruppe. Gezählt wird in der gemeinsamen Reihe aller acht.';
          if (close(v, c.s.rev[c.who])) return 'Fast! Du hast von oben gezählt. Rang 1 bekommt die kürzeste Lernzeit.';
          return null;
        },
      },
    },
    {
      button: 'R₁, R₂', title: 'Ränge je Gruppe zusammenzählen', sym: 'R₁, R₂', say: 'R eins, R zwei', concept: 'sum', perPerson: false,
      was: 'Wir zählen die Ränge jeder Gruppe zusammen. Lernt eine Gruppe eher weniger, sammelt sie die kleinen Ränge und hat die kleinere Summe.',
      rechnung: c => `Ohne Weiterbildung: R₁ = ${ranksOf(c, 0)} = ${num(c.s.R1)}. Mit Weiterbildung: R₂ = ${ranksOf(c, 1)} = ${num(c.s.R2)}.`,
      fach: 'Die Rangsumme R₁ ist die Summe der Ränge aller Personen der ersten Gruppe. Die erste Gruppe ist in R der kleinere Code, hier ohne Weiterbildung.',
      warum: 'Gäbe es keinen Unterschied, wären die Ränge gut gemischt. Dann bekäme jede Gruppe etwa die Hälfte von 36, also 18.',
      acht: 'Zusammen ergeben die beiden Summen immer 36, so viel wie 1 + 2 + … + 8. Daran kannst du deine Rechnung prüfen.',
      check: {
        question: 'Wie groß ist die Rangsumme der Gruppe ohne Weiterbildung?',
        answer: c => c.s.R1,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.R1)) return null;
          if (close(v, c.s.R2)) return 'Fast! Das ist die Rangsumme der Gruppe mit Weiterbildung. Gefragt ist die Gruppe ohne.';
          if (close(v, c.s.sum1)) return 'Fast! Das ist die Summe der Lernzeiten. Zusammengezählt werden die Ränge.';
          return null;
        },
      },
    },
    {
      button: 'U₁', title: 'Den kleinsten möglichen Wert abziehen', sym: 'U₁', say: 'U eins', concept: 'mann_whitney', perPerson: false,
      was: 'Von R₁ ziehen wir 4 · 5 / 2 = 10 ab. So viel hätte die Gruppe mindestens, wenn sie die Ränge 1 bis 4 belegt.',
      rechnung: c => `U₁ = ${num(c.s.R1)} − 4 · 5 / 2 = ${num(c.s.R1)} − 10 = ${num(c.s.U1)}`,
      fach: 'U₁ = R₁ − n₁(n₁ + 1) / 2 zählt die Paare aus je einer Person beider Gruppen, in denen die Person der ersten Gruppe vorn liegt. Gleichstände zählen halb.',
      warum: c => `Danach ist U₁ eine Zahl von Paaren. Es gibt 4 · 4 = 16 Paare aus je einer Person ohne und einer mit Weiterbildung. In ${num(c.s.U1)} davon lernt die Person ohne Weiterbildung länger${c.s.ties ? ', ein Gleichstand zählt halb' : ''}.`,
      acht: 'Abgezogen wird n₁(n₁ + 1) / 2 mit n₁ = 4, also 10. Wer 4 · 3 / 2 = 6 abzieht, bekommt ein zu großes U.',
      alltag: 'Wie bei einem Turnier, in dem jede Person ohne gegen jede Person mit Weiterbildung antritt: U₁ zählt die Siege der ersten Gruppe.',
      check: {
        question: 'Was bleibt, wenn du von R₁ die 10 abziehst?',
        answer: c => c.s.U1,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.U1)) return null;
          if (close(v, c.s.R1)) return 'Fast! Das ist noch die Rangsumme. Jetzt noch 10 abziehen.';
          if (close(v, c.s.wrongMin)) return 'Fast! Du hast 6 abgezogen. Abgezogen wird 4 · 5 / 2 = 10.';
          if (close(v, c.s.U2)) return 'Fast! Das ist U der Gruppe mit Weiterbildung. Gefragt ist U₁, aus R₁ gerechnet.';
          return null;
        },
      },
    },
    {
      button: 'U', title: 'Die andere Gruppe ergänzen', sym: 'U', say: 'U', concept: 'mann_whitney', perPerson: false,
      was: 'Die übrigen Paare gehen an die andere Gruppe: U₂ = 16 − U₁. R meldet den kleineren der beiden Werte als U.',
      rechnung: c => `U₂ = 4 · 4 − ${num(c.s.U1)} = ${num(c.s.U2)}. U = min(${num(c.s.U1)}, ${num(c.s.U2)}) = ${num(c.s.U)}.`,
      fach: 'U = min(U₁, U₂) mit U₁ + U₂ = n₁ · n₂. Ein kleines U heißt: Eine Gruppe liegt in fast allen Paaren vorn.',
      warum: 'Beide Werte erzählen dieselbe Geschichte, nur von zwei Seiten. Der kleinere zeigt am deutlichsten, wie einseitig die Paare ausgehen.',
      acht: 'Ein kleines U ist ein deutliches Ergebnis, kein schwaches. U = 0 hieße: Alle aus einer Gruppe lernen länger als alle aus der anderen.',
      check: {
        question: 'Wie groß ist U, also der kleinere der beiden Werte?',
        answer: c => c.s.U,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.U)) return null;
          if (close(v, c.s.big)) return 'Fast! Das ist der größere der beiden Werte. R meldet den kleineren.';
          if (close(v, 16)) return 'Fast! 16 ist die Zahl aller Paare. U ist der kleinere Teil davon.';
          return null;
        },
      },
    },
    {
      button: 'z', title: 'Mit dem Zufall vergleichen', sym: 'z', say: 'z', concept: 'test_statistic', perPerson: false,
      links: [{ id: 'standard_normal', label: 'Standardnormalverteilung' }],
      was: 'Ohne Unterschied erwartet man U = 16 / 2 = 8. Wir messen, wie weit U davon entfernt ist, in Standardabweichungen von U.',
      rechnung: c => Number.isFinite(c.s.z)
        ? `z = (${num(c.s.U)} − 8) / ${num(c.s.sd)} ≈ ${num(c.s.z)}${c.s.ties ? '. Die Gleichstände machen σ(U) etwas kleiner als 3,46.' : ''}`
        : 'Alle acht lernen gleich lange. Dann schwankt U nicht, und z lässt sich nicht berechnen.',
      fach: 'z = (U − n₁n₂ / 2) / σ(U) mit σ(U) = √(n₁ · n₂ · (N + 1) / 12) ≈ 3,46, bei Gleichständen etwas kleiner. R vergleicht z mit der Standardnormalverteilung.',
      warum: 'Erst im Vergleich mit dem üblichen Schwanken wird klar, ob U überraschend klein ist. Daraus rechnet R den p-Wert.',
      acht: 'R rechnet mit dem kleineren U, deshalb ist z hier nie positiv. Die Richtung liest du an den Rangsummen ab, nicht am Vorzeichen von z.',
      check: {
        question: 'Wie groß ist z? Zwei Nachkommastellen reichen.',
        answer: c => Number.isFinite(c.s.z) ? c.s.z : 'NA',
        diagnose: (c, v) => {
          if (v === 'NA' || !Number.isFinite(c.s.z) || close(v, c.s.z)) return null;
          if (Math.abs(c.s.z) > 0.02 && close(v, -c.s.z)) return 'Fast! Das Vorzeichen stimmt nicht. R rechnet mit dem kleineren U, z ist hier nie positiv.';
          if (close(v, c.s.gap)) return 'Fast! Das ist erst der Abstand zu 8. Jetzt noch durch σ(U) teilen.';
          if (close(v, c.s.noE)) return 'Fast! Zuerst ziehst du die 8 ab, dann teilst du durch σ(U).';
          return null;
        },
      },
    },
  ],
  numeric: parts,
  table: {
    columns: [
      { head: 'Gruppe', from: 1, active: [], cell: (_, r) => MW_GROUP[r] ? 'mit' : 'ohne' },
      { head: 'Lernzeit (h)', from: 1, active: [], cell: (c, r) => num(c.s.xs[r]) },
      { head: 'Rang', from: 1, active: [1], cell: (c, r) => num(c.s.rank[r]), sum: () => '36', sumFrom: 1, sumNote: 'immer' },
      { head: 'Rang ohne', from: 2, active: [2, 3], cell: (c, r) => MW_GROUP[r] ? '–' : num(c.s.rank[r]), sum: c => num(c.s.R1), sumFrom: 2 },
      { head: 'Rang mit', from: 2, active: [2, 4], cell: (c, r) => MW_GROUP[r] ? num(c.s.rank[r]) : '–', sum: c => num(c.s.R2), sumFrom: 2 },
    ],
    lines: [
      { from: 3, step: 3, text: c => `U₁ = ${num(c.s.R1)} − 10 = ${num(c.s.U1)}` },
      { from: 4, step: 4, text: c => `U₂ = 16 − ${num(c.s.U1)} = ${num(c.s.U2)}, U = ${num(c.s.U)}` },
      { from: 5, step: 5, text: c => `z = (${num(c.s.U)} − 8) / ${num(c.s.sd)} ≈ ${zText(c)}` },
    ],
  },
  captions: {
    1: 'Jede Zeile ist eine Person, oben ohne, unten mit Weiterbildung. Du kannst die Punkte ziehen; rechts steht der Rang.',
    2: 'Rechts neben jeder Gruppe steht ihre Rangsumme.',
    3: 'Das Gitter zeigt alle 16 Paare. Ein grünes Feld mit + heißt: Die Person ohne Weiterbildung lernt länger.',
    4: 'Grüne Felder mit + zählen für U₁, braunrote mit − für U₂. Ein ½ ist ein Gleichstand und zählt für beide halb.',
    5: 'Die Achse reicht von 0 bis 16 Paaren. Markiert sind U und die Erwartung 8 ohne Unterschied; das helle Band reicht eine σ(U) um die 8.',
  },
  think: [
    {
      question: 'Person H lernt 12 statt 30 Stunden. Was passiert mit U?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 1,
      explain: 'H lernt immer noch am längsten und behält Rang 8. Kein Rang ändert sich, also auch U nicht. Der Mittelwert der Gruppe mit Weiterbildung fiele dagegen um 4,5 Stunden.',
      kurz: 'Ränge sind unempfindlich gegen Ausreißer.',
      tryIt: { label: 'Person H auf 12 Stunden', apply: d => d.map((v, i) => i === 7 ? 12 : v) },
    },
    {
      question: 'Alle lernen nur halb so lange. Was passiert mit U?', options: ['wird kleiner', 'bleibt gleich', 'wird größer'], correct: 1, step: 1,
      explain: 'Die Abstände schrumpfen, aber die Reihenfolge bleibt dieselbe. Jeder behält seinen Rang, und U hängt nur von den Rängen ab.',
      kurz: 'Für Ränge zählt nur, wer vor wem liegt.',
      tryIt: { label: 'alle halb so lange', apply: d => d.map(v => v / 2) },
    },
    {
      question: 'Alle vier ohne Weiterbildung lernen kürzer als alle vier mit. Wie groß ist U?', options: ['0', '8', '16'], correct: 0, step: 4,
      explain: 'Dann liegt in allen 16 Paaren die Person mit Weiterbildung vorn. U₁ ist 0 und U₂ ist 16; R meldet den kleineren Wert, also 0.',
      kurz: 'U = 0 ist der deutlichste Unterschied, den es geben kann.',
      tryIt: { label: 'ohne 1 2 3 4, mit 5 6 7 8', apply: () => [1, 2, 3, 4, 5, 6, 7, 8] },
    },
  ],
  variants: {
    mann_whitney: {
      lastStep: 5,
      kurz: 'Der Mann–Whitney-U-Test vergleicht zwei Gruppen über ihre Plätze in einer gemeinsamen Reihe. Er zählt, wie oft eine Person der einen Gruppe vor einer Person der anderen liegt.',
      fachlich: 'Rangtest für zwei unabhängige Stichproben: U = min(U₁, U₂) mit U₁ = R₁ − n₁(n₁ + 1) / 2, geprüft über z mit der Normalverteilung und Bindungskorrektur.',
      symbolic: ['U₁ = ', { big: 'Σ', m: 2 }, { part: ['R(xᵢ)'], m: 1 }, ' ', { part: ['−'], m: 3 }, ' ', { frac: ['n₁(n₁ + 1)'], den: ['2'], m: 3 }, { br: true },
        { part: ['z'], m: 5 }, ' = ', { frac: [{ part: ['U'], m: 4 }, ' − n₁n₂ / 2'], den: ['σ(U)'], m: 5 }],
      aria: 'U eins gleich Summe der Ränge der ersten Gruppe minus n eins mal n eins plus eins, geteilt durch zwei. z gleich U minus n eins mal n zwei halbe, geteilt durch Sigma von U; U ist der kleinere der beiden U-Werte',
      metrics: [
        { label: 'Rangsummen R₁ und R₂', value: c => `${num(c.s.R1)} und ${num(c.s.R2)}` },
        { label: 'z', value: zText },
        { label: 'U', value: c => num(c.s.U) },
      ],
      interpret: c => ({
        kurz: `${pairsSentence(c.s)} Gäbe es keinen Unterschied, wären es im Schnitt 8 von 16.`,
        fachlich: Number.isFinite(c.s.z)
          ? `U = ${num(c.s.U)}, z ≈ ${num(c.s.z)}, ${pText(c.s.p)} (zweiseitig, Normalverteilung mit Bindungskorrektur wie in R). Gäbe es keinen Unterschied, käme ein so kleines U ${pOften(c.s.p)} Stichproben vor. ${signif(c.s.p)}; der Effekt r = |z| / √8 ≈ ${num(c.s.r)} ist nach der Faustregel ${rWord(c.s.r)}.`
          : 'Alle acht lernen gleich lange. Dann gibt es keine Reihenfolge, und R rechnet keinen Test.',
      }),
      genau: {
        kurz: 'Bei so wenigen Personen ist die Normalverteilung nur eine grobe Näherung. Und ein Unterschied in den Rängen ist nicht automatisch ein Unterschied der Mediane.',
        paragraphs: c => [
          `R (mariposa) rechnet wie SPSS mit der Normalverteilung, ohne Stetigkeitskorrektur. ${c.s.exact !== null && Number.isFinite(c.s.p) ? `Der exakte Test aus wilcox.test() zählt alle 70 möglichen Aufteilungen der Ränge durch und meldet hier p ≈ ${num(c.s.exact)} statt ${num(c.s.p)}.` : 'Mit Gleichständen rechnet auch wilcox.test() nur mit dieser Näherung.'} Als Faustregel passen beide ab etwa 20 Personen je Gruppe gut zusammen.`,
          'Der Test fragt, ob die Personen einer Gruppe in der gemeinsamen Reihe eher vorn liegen. Als Unterschied der Mediane darfst du das nur lesen, wenn beide Gruppen ähnlich geformte Verteilungen haben, die nur verschoben sind.',
          `Zum Vergleich die Mittelwerte: ohne Weiterbildung ${hours(c.s.sum1 / 4)}, mit ${hours(c.s.sum2 / 4)}. Ein einzelner sehr hoher Wert verschiebt einen Mittelwert stark, einen Rang dagegen höchstens bis Platz 8.`,
          'Die Gruppen müssen unabhängig sein: Jede Person gehört zu genau einer Gruppe. Für zwei Messungen derselben Personen nimmst du den Wilcoxon-Test für verbundene Stichproben.',
        ],
      },
    },
  },
};

// Reiter -------------------------------------------------------------------------------

/** Mann–Whitney-U auf den aktuellen 200 Befragten (Spalten der Rollen x und group), Gruppen aufsteigend nach Code. */
export function mwSample(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'finanzlage', g = c.columns.group?.[0] ?? 'weiterbildung';
  const { codes, values } = byGroup(c.rows, x, g);
  if (codes.length !== 2) return null;
  return { test: mannWhitney(values[0], values[1]), same: new Set(values.flat()).size === 1, x };
}

export const mannWhitneyTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'finanzlage', group: 'weiterbildung' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Kommen Befragte mit einer Weiterbildung in den letzten zwölf Monaten anders mit ihrem Haushaltseinkommen aus als die übrigen?',
    value: c => { const t = mwSample(c)?.test; return t && Number.isFinite(t.p) ? t.p : null; },
    result: c => {
      const m = mwSample(c);
      if (!m) return { kurz: 'Für diesen Test braucht es genau zwei Gruppen.', fachlich: 'Der Mann–Whitney-U-Test vergleicht zwei unabhängige Gruppen.' };
      const t = m.test;
      if (m.same) return {
        kurz: `Alle 200 Befragten geben dieselbe Antwort. Dann gibt es nichts zu ordnen: Beide Gruppen haben den mittleren Rang ${num(t.mean1)}, und R rechnet keinen Test.`,
        fachlich: `mariposa meldet: all values of \`${m.x}\` are identical.`,
      };
      const lead = t.U1 >= t.U2 ? 'ohne' : 'mit';
      return {
        kurz: `Ordnest du alle 200 nach ihrer finanziellen Lage, liegen die Befragten ohne Weiterbildung im Schnitt auf Rang ${num(t.mean1)}, die mit auf Rang ${num(t.mean2)}. Ein höherer Rang heißt: Der Haushalt kommt leichter mit dem Einkommen aus. Gäbe es keinen Unterschied, wäre so ein Abstand ${t.p >= 0.05 ? 'nicht überraschend' : 'überraschend'} (${pText(t.p)}).`,
        fachlich: `Mann–Whitney-U, zweiseitig: U = ${count(t.U)}, z ≈ ${num(t.z)}, ${pText(t.p)}, r ≈ ${num(t.r)}. ${signif(t.p)}; der Effekt ist nach der Faustregel ${rWord(t.r)}.`,
        zusatz: `In ${num(lead === 'ohne' ? t.U1 : t.U2)} von ${count(t.n1 * t.n2)} Paaren aus je einer Person ohne und einer mit Weiterbildung kommt die Person ${lead} Weiterbildung leichter aus. Gleichstände zählen halb.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig voneinander, und jede Person gehört zu genau einer Gruppe. Die Antworten lassen sich der Größe nach ordnen; gleiche Abstände braucht der Test nicht.',
    think: [
      {
        question: 'Alle Antworten werden umgepolt: Aus „Sehr schwer“ wird „Sehr leicht“ und umgekehrt. Was passiert mit U?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Die Reihe dreht sich um, und die beiden Gruppen tauschen ihre U-Werte. R meldet den kleineren, und der bleibt derselbe. Auch p bleibt gleich; nur die mittleren Ränge wechseln die Seite.',
        kurz: 'Beim zweiseitigen Test ist die Richtung der Skala egal.',
        tryIt: { label: 'finanzielle Lage umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same', measure: c => mwSample(c)?.test.U ?? null },
      },
      {
        question: 'Angenommen, alle antworten „Teils / teils“. Wie weit liegen die mittleren Ränge der beiden Gruppen dann auseinander?', options: ['0', '1', '100,5'], correct: 0,
        explain: 'Alle teilen sich die Plätze 1 bis 200 und bekommen denselben mittleren Rang 100,5. Ohne Unterschiede in den Antworten gibt es keine Unterschiede in den Rängen, und R rechnet keinen Test.',
        kurz: 'Wo alle gleich antworten, gibt es nichts zu ordnen.',
        tryIt: { label: 'alle auf „Teils / teils“', op: 'constant', column: 'x', value: 3 },
        expect: { change: 'equals', value: 0, measure: c => { const t = mwSample(c)?.test; return t ? Math.abs(t.mean1 - t.mean2) : null; } },
      },
    ],
  },
  r: {
    entry: 'mann_whitney', variant: 0,
    tokens: {
      mann_whitney: { sym: 'mann_whitney()', term: 'Mann–Whitney-U', kurz: 'Vergleicht zwei unabhängige Gruppen über ihre Ränge. Meldet U, z, p und die Effektgröße r.', fehler: 'Hat die Gruppenspalte mehr als zwei Gruppen, rechnet mariposa nicht und meldet: `schulabschluss` has 5 groups with valid values; the Mann-Whitney test needs exactly 2.' },
      group: { sym: 'group =', term: 'Gruppenvariable', kurz: 'Nennt die Spalte, die die Befragten in zwei Gruppen teilt, hier Weiterbildung Nein oder Ja. Die erste Gruppe ist der kleinere Code.', fehler: 'Welche Gruppe die erste ist, legt der Code fest: 0 = Nein kommt vor 1 = Ja. Bei einem einseitigen Test prüfst du sonst leicht die falsche Richtung.' },
      mu: { sym: 'mu =', term: 'Null- & Alternativhypothese', kurz: 'Die Verschiebung, die die Nullhypothese annimmt. mu = 0 heißt: Ohne Unterschied liegen beide Gruppen gleich in der Reihe.', fehler: 'mu ist hier kein Mittelwert, sondern eine Verschiebung der ersten Gruppe. mu = 0 ist schon die Voreinstellung.' },
      '"two.sided"': { sym: '"two.sided"', term: 'Einseitig & zweiseitig testen', kurz: 'Zweiseitig: Gefragt ist, ob eine der beiden Gruppen in der Reihe vorn liegt, egal welche.', fehler: 'Nur die englischen Wörter funktionieren. alternative = "kleiner" ergibt: \'arg\' sollte eines von \'“two.sided”, “less”, “greater”\' sein.' },
    },
    outputMap: [
      { match: 'U', atlas: 'U', step: 4, explain: 'Der kleinere der beiden U-Werte. Er zählt die Paare, in denen die Gruppe mit Weiterbildung vorn liegt; Gleichstände zählen halb.' },
      { match: 'Z', atlas: 'z', step: 5, explain: 'U, gemessen am üblichen Schwanken ohne Unterschied. R rechnet aus dem kleineren U, deshalb ist z negativ.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es keinen Unterschied, käme ein so kleines U in etwa 72 von 100 Stichproben vor. Das ist gar nicht überraschend.' },
      { match: 'r', atlas: 'Effektgröße r', explain: 'r = |z| / √N, hier 0,36 / √200. In Klammern steht negligible, auf Deutsch vernachlässigbar.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle 200 Befragten in beiden Gruppen.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist U? Tippe sie an.', correct: 'U',
      wrong: { Z: 'Fast! Das ist z. Es misst U am üblichen Schwanken.', p: 'Fast! Das ist der p-Wert. Er sagt, wie überraschend U wäre, wenn es keinen Unterschied gäbe.', r: 'Fast! Das ist die Effektgröße r. Sie wird aus z gerechnet.', N: 'Fast! N ist die Zahl der Befragten. U steht ganz vorn hinter U =.' },
    },
  },
  next: {
    next: { id: 'kruskal_wallis', why: 'Dieselbe Idee für drei und mehr Gruppen: alle in eine Reihe stellen, dann die mittleren Ränge der Gruppen vergleichen.' },
    before: [
      { id: 'ranks', why: 'Der Test rechnet nicht mit den Antworten selbst, sondern mit ihren Plätzen in der gemeinsamen Reihe.' },
      { id: 'ordinal', why: 'Gemacht für geordnete Antworten wie die finanzielle Lage: Reihenfolge ja, feste Abstände nein.' },
    ],
    after: [
      { id: 'effect', why: 'r = |z| / √N sagt, wie groß der Unterschied ist. Der p-Wert allein sagt das nicht.' },
    ],
    more: [
      { id: 't_test', why: 'Vergleicht dieselben zwei Gruppen über Mittelwerte. Er nutzt die Abstände und reagiert stärker auf Ausreißer.' },
      { id: 'wilcoxon_test', why: 'Der Rangtest für zwei Messungen derselben Personen.' },
    ],
  },
};
