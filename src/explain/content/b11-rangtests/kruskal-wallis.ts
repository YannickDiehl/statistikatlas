// Werkstatt „Kruskal–Wallis“ (B11): neun Lernzeiten in drei Gruppen, Ränge, mittlere Ränge, Abstände zur Mitte und H
// wie mariposa::kruskal_wallis(). Ton nach der Streuung. Alle Zahlen sind in R nachgerechnet (b11-rangtests.test.ts).
import type { ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import { columnById } from '../../../domain/survey';
import { close, num, signed } from '../../format';
import { byGroup, kruskalWallis, midRanks, type KruskalWallis } from './rank';
import { epsWord, pOften, pText, signif } from './words';

/** Je drei Personen mit Hauptschulabschluss (A bis C), Mittlerem Abschluss (D bis F) und Abitur (G bis I). */
export const KW_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const;
export const KW_GROUP = [0, 0, 0, 1, 1, 1, 2, 2, 2] as const;
export const KW_LABELS = ['Hauptschulabschluss', 'Mittlerer Abschluss', 'Abitur'] as const;
export const KW_SHORT = ['Haupt', 'Mittel', 'Abitur'] as const;
export const KW_START = [2, 5, 7, 4, 8, 10, 9, 12, 25];
export const KW_TIES = [3, 5, 5, 5, 8, 10, 8, 12, 20];
export const KW_EVEN = [1, 5, 9, 2, 6, 7, 3, 4, 8];

export type KwStats = KruskalWallis & {
  xs: number[];
  /** Rang je Person, Platz in der eigenen Gruppe, von oben gezählt. */
  rank: number[]; own: number[]; rev: number[];
  /** Mittlere Lernzeit je Gruppe (Denkfehler: Werte statt Ränge gemittelt), Abstand zu 4,5 statt 5 (Denkfehler N / 2). */
  meanValue: number[]; wrongMid: number[];
  /** Quadrat des Gruppenabstands je Person; Summe der Quadrate ohne Gewicht; H mit falschem Faktor 12 / (N · N). */
  perPerson: number[]; plain: number; wrongFactor: number;
  ties: boolean;
};

export function kwCompute(xs: number[]): KwStats {
  const groups = [0, 1, 2].map(g => xs.filter((_, i) => KW_GROUP[i] === g)), t = kruskalWallis(groups);
  const rank = t.ranks.flat(), own = groups.flatMap(g => midRanks(g));
  return {
    ...t, xs: [...xs], rank, own, rev: rank.map(r => 10 - r),
    meanValue: groups.map(g => g.reduce((a, b) => a + b, 0) / g.length), wrongMid: t.mean.map(m => m - 4.5),
    perPerson: xs.map((_, i) => t.dev[KW_GROUP[i]] ** 2), plain: t.dev.reduce((a, d) => a + d * d, 0), wrongFactor: 12 / 81 * t.ss,
    ties: new Set(xs).size < xs.length,
  };
}

type C = Ctx<KwStats>;
const P = (c: C) => c.names[c.who];
const hours = (v: number) => `${num(v)} h`;
const ranksOf = (c: C, g: number) => c.s.ranks[g].map(r => num(r)).join(' + ');
/** Gruppe mit dem höchsten bzw. niedrigsten mittleren Rang. */
const top = (s: KwStats) => s.mean.indexOf(Math.max(...s.mean));
const bottom = (s: KwStats) => s.mean.indexOf(Math.min(...s.mean));
const sqParts = (c: C) => c.s.dev.map(d => `3 · ${d < 0 ? `(${num(d)})` : num(d)}²`).join(' + ');

const numeric = (c: C): FNode[] => [
  'Σ = ', ...c.s.mean.flatMap((m, j): FNode[] => [...(j ? [' + '] : []), '3 · (', { part: [num(m)], m: 2 }, ' ', { part: ['− 5'], m: 3 }, { part: [')²'], m: 4 }]),
  ' = ', { part: [num(c.s.ss)], m: 4 }, { br: true },
  { part: [`H = 12 / (9 · 10) · ${num(c.s.ss)} ≈ ${num(c.s.Hraw)}`], m: 5 },
];

export const kruskalWallisWorkshop: Workshop<number[], KwStats> = {
  id: 'b11-kw',
  wofuer: 'Unterscheiden sich Menschen mit verschiedenen Schulabschlüssen darin, wie viel sie lernen? Neun Personen sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben: je drei mit Hauptschulabschluss, Mittlerem Abschluss und Abitur. Bei drei Gruppen reicht ein einzelner Paarvergleich nicht mehr. Kruskal–Wallis prüft alle Gruppen auf einmal, wieder über Ränge.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber nur aus fünf kleinen Schritten: ordnen, Mitte finden, Abstände messen, quadrieren und zusammenzählen, am Ende malnehmen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b11-kw',
  names: KW_NAMES,
  bounds: { min: 0, max: 30 },
  presets: [
    { id: 'start', label: 'Drei Gruppen: 2 5 7, 4 8 10, 9 12 25', data: KW_START },
    { id: 'gleich', label: 'Mit Gleichständen: 3 5 5, 5 8 10, 8 12 20', data: KW_TIES },
  ],
  compute: kwCompute,
  glyphs: [
    { sym: 'R(xᵢ)', say: 'R von x i', term: 'Rang', plain: 'der Platz von Person i in der gemeinsamen Reihe', step: 1 },
    { sym: 'R̄ⱼ', say: 'R quer j', term: 'mittlerer Rang', plain: 'Rangsumme der Gruppe j geteilt durch ihre Größe', step: 2 },
    { sym: 'nⱼ', say: 'n j', term: 'Gruppengröße', plain: 'wie viele Personen in Gruppe j sind, hier je 3', step: 2 },
    { sym: 'R̄', say: 'R quer', term: 'Mitte aller Ränge', plain: '(N + 1) / 2, hier 5', step: 3 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Gruppe einmal', step: 4 },
    { sym: 'N', say: 'N', term: 'Fallzahl', plain: 'alle Personen zusammen, hier 9', step: 5 },
    { sym: 'H', say: 'H', term: 'Kruskal–Wallis-H', plain: 'die Prüfgröße: Wie weit liegen die Gruppen in der Reihe auseinander?', step: 5 },
  ],
  steps: [
    {
      button: 'Ränge', title: 'Alle in eine Reihe stellen', sym: 'R(xᵢ)', say: 'R von x i', concept: 'ranks', perPerson: true,
      was: 'Wir stellen alle neun nach ihrer Lernzeit in eine Reihe, egal mit welchem Abschluss. Die kürzeste Lernzeit bekommt Rang 1, die längste Rang 9.',
      rechnung: c => {
        const v = c.s.xs[c.who], same = c.s.xs.map((x, i) => [x, i] as const).filter(([x, i]) => x === v && i !== c.who).map(([, i]) => c.names[i]);
        const less = c.s.xs.filter(x => x < v).length;
        if (!same.length) return `Person ${P(c)} lernt ${hours(v)}. ${less === 0 ? 'Niemand lernt' : less === 1 ? 'Eine Person lernt' : `${less} Personen lernen`} weniger, also bekommt ${P(c)} Rang ${num(c.s.rank[c.who])}.`;
        return `Person ${P(c)} lernt ${hours(v)}, genau wie ${same.join(' und ')}. Sie teilen sich die Plätze ${less + 1} bis ${less + same.length + 1} und bekommen alle den mittleren Rang ${num(c.s.rank[c.who])}.`;
      },
      fach: 'Ein Rang ist der Platz eines Werts in der gemeinsamen Reihenfolge aller Werte. Gleiche Werte bekommen den Mittelwert ihrer Plätze.',
      warum: 'Wie beim Mann–Whitney-U-Test zählt nur die Reihenfolge. Eine sehr lange Lernzeit zählt als Rang 9, nicht als besonders weiter Abstand.',
      acht: 'Die Ränge vergibst du für alle neun gemeinsam. Ränge innerhalb jeder Gruppe hätten in jeder Gruppe dieselben Zahlen 1, 2 und 3.',
      check: {
        question: c => `Welchen Rang bekommt Person ${P(c)}?`,
        answer: c => c.s.rank[c.who],
        diagnose: (c, v) => {
          const r = c.s.rank[c.who];
          if (v === 'NA' || close(v, r)) return null;
          if (close(v, c.s.own[c.who])) return 'Fast! Das ist der Platz innerhalb der eigenen Gruppe. Gezählt wird in der gemeinsamen Reihe aller neun.';
          if (close(v, c.s.rev[c.who])) return 'Fast! Du hast von oben gezählt. Rang 1 bekommt die kürzeste Lernzeit.';
          return null;
        },
      },
    },
    {
      button: 'R̄ⱼ', title: 'Die mittleren Ränge der Gruppen finden', sym: 'R̄ⱼ', say: 'R quer j', concept: 'mean', perPerson: false,
      was: 'Für jede Gruppe zählen wir die Ränge zusammen und teilen durch die Zahl ihrer Personen. Das ergibt den mittleren Rang der Gruppe.',
      rechnung: c => KW_LABELS.map((l, j) => `${l}: (${ranksOf(c, j)}) / 3 ≈ ${num(c.s.mean[j])}`).join('. ') + '.',
      fach: 'Der mittlere Rang R̄ⱼ ist das arithmetische Mittel der Ränge in Gruppe j, also die Rangsumme Rⱼ geteilt durch die Gruppengröße nⱼ.',
      warum: 'Der mittlere Rang zeigt, wo eine Gruppe in der gemeinsamen Reihe typischerweise steht. Gruppen verschiedener Größe werden so vergleichbar.',
      acht: 'Gemittelt werden die Ränge, nicht die Lernzeiten. Eine einzelne sehr lange Lernzeit zieht die mittlere Lernzeit kräftig nach oben, den mittleren Rang nicht.',
      check: {
        question: 'Wo steht die Gruppe Abitur im Schnitt? Gesucht ist ihr mittlerer Rang.',
        answer: c => c.s.mean[2],
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.mean[2])) return null;
          if (close(v, c.s.R[2])) return 'Fast! Das ist die Rangsumme der Gruppe. Jetzt noch durch 3 teilen.';
          if (close(v, c.s.meanValue[2])) return 'Fast! Das ist die mittlere Lernzeit. Gemittelt werden die Ränge.';
          return null;
        },
      },
    },
    {
      button: 'R̄ⱼ − R̄', title: 'Den Abstand zur Mitte messen', sym: 'R̄ⱼ − R̄', say: 'R quer j minus R quer', concept: 'deviation', perPerson: false,
      was: 'Ohne Unterschied läge jede Gruppe im Schnitt in der Mitte der Reihe, bei Rang 5. Wir messen, wie weit jede Gruppe davon weg ist.',
      rechnung: c => `Die Mitte aller Ränge ist (9 + 1) / 2 = 5. ${KW_LABELS.map((l, j) => `${l}: ${num(c.s.mean[j])} − 5 = ${signed(c.s.dev[j])}`).join('; ')}.`,
      fach: 'R̄ = (N + 1) / 2 ist der mittlere Rang aller N Personen. Die Abweichung R̄ⱼ − R̄ zeigt, wie weit Gruppe j davon entfernt liegt und auf welcher Seite.',
      warum: 'Liegen alle Gruppen nahe bei 5, sind die Ränge gut gemischt. Große Abstände heißen: Manche Gruppen sammeln die hohen, andere die niedrigen Ränge.',
      acht: 'Die Mitte ist (N + 1) / 2 = 5, nicht N / 2 = 4,5. Die Ränge laufen von 1 bis 9, und ihre Mitte ist 5.',
      check: {
        question: 'Wie weit liegt die Gruppe Abitur von der Mitte 5 weg? Mit Vorzeichen.',
        answer: c => c.s.dev[2],
        diagnose: (c, v) => {
          const d = c.s.dev[2];
          if (v === 'NA' || close(v, d)) return null;
          if (Math.abs(d) > 0.02 && close(v, -d)) return 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne mittlerer Rang minus 5.';
          if (close(v, c.s.wrongMid[2])) return 'Fast! Du hast 4,5 abgezogen. Die Mitte der Ränge 1 bis 9 ist (9 + 1) / 2 = 5.';
          return null;
        },
      },
    },
    {
      button: 'Σ nⱼ(…)²', title: 'Quadrieren, gewichten, zusammenzählen', sym: 'Σ nⱼ(R̄ⱼ − R̄)²', say: 'Summe über j von n j mal R quer j minus R quer zum Quadrat', concept: 'group_variation', perPerson: false,
      was: 'Jeden Abstand quadrieren wir und nehmen ihn mal die Größe der Gruppe. Dann zählen wir alles zusammen.',
      rechnung: c => `${sqParts(c)} ≈ ${c.s.weighted.map(w => num(w)).join(' + ')} = ${num(c.s.ss)}${c.s.weighted.some(w => Math.abs(w * 100 - Math.round(w * 100)) > 1e-6) ? ', mit allen Nachkommastellen gerechnet' : ''}.`,
      fach: 'Σ nⱼ(R̄ⱼ − R̄)² misst, wie stark die mittleren Ränge zwischen den Gruppen streuen. Große Gruppen zählen stärker.',
      warum: 'Das Quadrat macht jeden Abstand positiv, und weite Abstände zählen stärker. Mal nⱼ heißt: Jede Person bringt den Abstand ihrer Gruppe einmal mit.',
      acht: 'Ohne die Quadrate ergäbe die Summe immer 0, so wie die Abstände zur Mitte bei der Streuung. Die Tabelle zeigt es: Jede Person trägt ein Quadrat bei.',
      check: {
        question: 'Wie groß ist die Summe der drei gewichteten Quadrate?',
        answer: c => c.s.ss,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.ss)) return null;
          if (c.s.ss > 0.02 && close(v, 0)) return 'Fast! 0 ist die Summe der gewichteten Abstände. Gefragt ist die Summe ihrer Quadrate.';
          if (close(v, c.s.plain)) return 'Fast! Du hast die Quadrate nicht mit der Gruppengröße malgenommen. Jedes zählt dreimal.';
          return null;
        },
      },
    },
    {
      button: 'H', title: 'Auf die Prüfgröße umrechnen', sym: 'H', say: 'H', concept: 'kruskal_wallis', perPerson: false,
      links: [{ id: 'chi_square_distribution', label: 'χ²-Verteilung' }],
      was: 'Wir nehmen die Summe mal 12 / (N · (N + 1)) = 12 / 90. So entsteht H, das R mit einer festen Verteilung vergleicht.',
      rechnung: c => `H = 12 / 90 · ${num(c.s.ss)} = ${num(12 * c.s.ss)} / 90 ≈ ${num(c.s.Hraw)}${c.s.ties && Number.isFinite(c.s.H) ? `. Wegen der Gleichstände teilt R noch durch ${num(c.s.C, 3)} und meldet H ≈ ${num(c.s.H)}.` : '.'}`,
      fach: 'H = 12 / (N(N + 1)) · Σ nⱼ(R̄ⱼ − R̄)². Ohne Unterschied folgt H ungefähr einer χ²-Verteilung mit k − 1 Freiheitsgraden, hier 2.',
      warum: 'Der Faktor bringt H auf eine feste Skala: Ohne Unterschied folgt H ungefähr derselben χ²-Verteilung, egal wie viele Personen es sind. So kann R den p-Wert ablesen.',
      acht: 'Ein großes H spricht nur dafür, dass sich mindestens zwei Gruppen unterscheiden. Welche es sind, zeigen erst Paarvergleiche wie die Dunn-Vergleiche.',
      check: {
        question: 'Wie groß ist H vor der Korrektur für Gleichstände? Zwei Nachkommastellen reichen.',
        answer: c => c.s.Hraw,
        diagnose: (c, v) => {
          if (v === 'NA' || close(v, c.s.Hraw)) return null;
          if (close(v, c.s.ss)) return 'Fast! Das ist noch die Summe aus Schritt 4. Jetzt noch mal 12 / 90.';
          if (close(v, c.s.wrongFactor)) return 'Fast! Geteilt wird durch N · (N + 1) = 9 · 10 = 90, nicht durch 81.';
          return null;
        },
      },
    },
  ],
  numeric,
  table: {
    columns: [
      { head: 'Abschluss', from: 1, active: [], cell: (_, r) => KW_SHORT[KW_GROUP[r]] },
      { head: 'Lernzeit (h)', from: 1, active: [], cell: (c, r) => num(c.s.xs[r]) },
      { head: 'Rang', from: 1, active: [1, 2], cell: (c, r) => num(c.s.rank[r]), sum: () => '45', sumFrom: 1, sumNote: 'immer' },
      { head: 'R̄ der Gruppe', from: 2, active: [2], cell: (c, r) => num(c.s.mean[KW_GROUP[r]]) },
      { head: 'Abstand zu 5', from: 3, active: [3], cell: (c, r) => signed(c.s.dev[KW_GROUP[r]]), sum: () => '0', sumFrom: 3, sumNote: 'immer', tone: (c, r) => c.s.dev[KW_GROUP[r]] > 1e-9 ? 'pos' : c.s.dev[KW_GROUP[r]] < -1e-9 ? 'neg' : undefined },
      { head: 'Quadrat', from: 4, active: [4], cell: (c, r) => num(c.s.perPerson[r]), sum: c => num(c.s.ss), sumFrom: 4 },
    ],
    lines: [
      { from: 3, step: 3, text: () => 'Mitte aller Ränge: (9 + 1) / 2 = 5' },
      { from: 5, step: 5, text: c => `H = 12 / 90 · ${num(c.s.ss)} ≈ ${num(c.s.Hraw)}` },
    ],
  },
  captions: {
    1: 'Jede Zeile ist eine Person, nach Abschluss gruppiert. Du kannst die Punkte ziehen; rechts steht der Rang.',
    2: 'Unten auf der Rangachse von 1 bis 9 steht der mittlere Rang jeder Gruppe.',
    3: 'Die gestrichelte Linie ist die Mitte 5. Die Linien zeigen den Abstand jeder Gruppe zur Mitte: grün rechts davon (höhere Ränge), braunrot links davon.',
    4: 'Rechts steht für jede Gruppe ihr Quadrat mal 3. Zusammen ergeben sie die Summe aus Schritt 4.',
    5: 'Je weiter die mittleren Ränge auseinanderliegen, desto größer wird H.',
  },
  think: [
    {
      question: 'Mit den Startdaten: Person I lernt 13 statt 25 Stunden. Was passiert mit H?', options: ['wird kleiner', 'bleibt gleich', 'wird größer'], correct: 1, step: 1,
      explain: 'I lernt immer noch am längsten und behält Rang 9. Kein Rang ändert sich, also auch kein mittlerer Rang und nicht H.',
      kurz: 'Ein Ausreißer zählt nur als letzter Platz.',
      tryIt: { label: 'Startdaten, Person I auf 13 Stunden', apply: () => KW_START.map((v, i) => i === 8 ? 13 : v) },
    },
    {
      question: 'Alle drei Gruppen haben den mittleren Rang 5. Wie groß ist H?', options: ['0', '5', 'hängt von den Lernzeiten ab'], correct: 0, step: 3,
      explain: 'Jeder Abstand zur Mitte ist 0, also auch jedes Quadrat und die Summe. Dann ist H = 0: Die Ränge sind perfekt gemischt.',
      kurz: 'Gut gemischte Ränge, kein Unterschied.',
      tryIt: { label: 'Ränge gleichmäßig verteilen', apply: () => KW_EVEN },
    },
    {
      question: 'Die Gruppe Abitur heißt jetzt Gruppe 1, die Gruppe Hauptschulabschluss Gruppe 3. Was passiert mit H?', options: ['wird größer', 'bleibt gleich', 'wechselt das Vorzeichen'], correct: 1, step: 4,
      explain: 'H zählt für jede Gruppe ihren quadrierten Abstand zur Mitte zusammen. In welcher Reihenfolge die Gruppen stehen, spielt dabei keine Rolle.',
      kurz: 'Die Gruppen brauchen keine Reihenfolge.',
    },
  ],
  variants: {
    kruskal_wallis: {
      lastStep: 5,
      kurz: 'Kruskal–Wallis stellt alle in eine gemeinsame Reihe und schaut, ob manche Gruppen eher vorn, andere eher hinten stehen. Je weiter die Gruppen im Schnitt auseinanderstehen, desto größer wird die Prüfgröße H.',
      fachlich: 'Der Kruskal–Wallis-Test vergleicht mehrere unabhängige Gruppen über ihre mittleren Ränge. Je weiter diese auseinanderliegen, desto größer wird H; geprüft wird mit der Chi-Quadrat-Verteilung.',
      symbolic: ['H = ', { frac: [{ part: ['12 ·'], m: 5 }, ' ', { big: 'Σ', m: 4 }, 'n', { sub: 'j' }, { part: ['('], m: 4 }, { part: ['R̄', { sub: 'j' }], m: 2 }, ' ', { part: ['− R̄'], m: 3 }, { part: [')²'], m: 4 }], den: ['N(N + 1)'], m: 5 }],
      aria: 'H gleich 12 geteilt durch N mal N plus eins, mal die Summe über alle Gruppen j von n j mal R quer j minus R quer, zum Quadrat',
      metrics: [
        { label: 'Summe der Quadrate', value: c => num(c.s.ss) },
        { label: 'H', value: c => Number.isFinite(c.s.H) ? num(c.s.H) : 'nicht definiert' },
      ],
      interpret: c => ({
        kurz: c.s.ss < 1e-9
          ? 'Alle drei Gruppen stehen im Schnitt genau in der Mitte der Reihe. Die Ränge sind perfekt gemischt, H ist 0.'
          : `Die Gruppe ${KW_LABELS[top(c.s)]} steht in der Reihe im Schnitt auf Rang ${num(c.s.mean[top(c.s)])}, die Gruppe ${KW_LABELS[bottom(c.s)]} auf Rang ${num(c.s.mean[bottom(c.s)])}. Gäbe es keinen Unterschied, stünde jede Gruppe im Schnitt bei Rang 5.`,
        fachlich: Number.isFinite(c.s.H)
          ? `H ≈ ${num(c.s.H)} bei 2 Freiheitsgraden, ${pText(c.s.p)} (χ²-Näherung wie in R). Gäbe es keinen Unterschied, käme ein so großes H ${pOften(c.s.p)} Stichproben vor. ${signif(c.s.p)}; ε² = H / (N − 1) ≈ ${num(c.s.eps2)} ist nach der Faustregel ${epsWord(c.s.eps2)}.`
          : 'Alle neun lernen gleich lange. Dann gibt es keine Reihenfolge, und R rechnet keinen Test.',
      }),
      genau: {
        kurz: 'Mit drei Personen je Gruppe ist die χ²-Näherung nur grob. Und ein großes H sagt nicht, welche Gruppen sich unterscheiden.',
        paragraphs: c => [
          'Im Katalog steht die Formel als H = 12 / (N(N + 1)) · Σ Rⱼ² / nⱼ − 3(N + 1). Sie ergibt dieselbe Zahl. Die Form hier zeigt besser, dass H die Abstände der mittleren Ränge zur Mitte misst.',
          `Bei Gleichständen teilt R durch C = 1 − Σ(t³ − t) / (N³ − N); t ist die Zahl gleicher Werte. ${c.s.ties && Number.isFinite(c.s.H) ? `Hier ist C ≈ ${num(c.s.C, 3)}, und H steigt von ${num(c.s.Hraw)} auf ${num(c.s.H)}.` : 'Hier gibt es keine Gleichstände, C ist 1.'}`,
          'Die χ²-Näherung braucht genug Personen je Gruppe, als Faustregel mindestens fünf. Bei drei Personen je Gruppe ist p hier nur ein grober Anhaltspunkt.',
          'Mit zwei Gruppen ergibt Kruskal–Wallis denselben p-Wert wie der Mann–Whitney-U-Test, denn dann ist H = z². Im Lehrdatensatz, finanzielle Lage nach Weiterbildung: H ≈ 0,13 und p ≈ 0,72 in beiden Tests.',
          'Ein Unterschied in den mittleren Rängen ist nicht automatisch ein Unterschied der Mediane. So darfst du ihn nur lesen, wenn alle Gruppen ähnlich geformte Verteilungen haben.',
        ],
      },
    },
  },
};

// Reiter -------------------------------------------------------------------------------

/** Kruskal–Wallis auf den aktuellen 200 Befragten; Gruppen aufsteigend nach Code, mit ihren Wertelabels. */
export function kwSample(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'finanzlage', g = c.columns.group?.[0] ?? c.columns.y?.[0] ?? 'schulabschluss';
  const { codes, values } = byGroup(c.rows, x, g);
  const labels = codes.map(code => columnById[g]?.categories?.find(k => k.value === code)?.label ?? String(code));
  return { test: kruskalWallis(values), codes, labels, same: new Set(values.flat()).size === 1, x };
}
/** Mittlerer Rang der Gruppe mit diesem Code (null, wenn es sie nicht gibt). */
export const kwMeanRank = (c: SampleCtx, code: number) => { const k = kwSample(c), j = k.codes.indexOf(code); return j < 0 ? null : k.test.mean[j]; };

export const kruskalWallisTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'finanzlage', y: 'schulabschluss', group: 'schulabschluss' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Kommen Befragte mit verschiedenen Schulabschlüssen unterschiedlich gut mit ihrem Haushaltseinkommen aus?',
    value: c => { const t = kwSample(c).test; return Number.isFinite(t.H) ? t.H : null; },
    result: c => {
      const k = kwSample(c), t = k.test;
      if (k.same || !Number.isFinite(t.H)) return {
        kurz: 'Alle 200 Befragten geben dieselbe Antwort. Dann gibt es nichts zu ordnen, und R rechnet keinen Test.',
        fachlich: `Alle Gruppen haben denselben mittleren Rang ${num((t.N + 1) / 2)}; H ist nicht definiert.`,
      };
      const hi = t.mean.indexOf(Math.max(...t.mean)), lo = t.mean.indexOf(Math.min(...t.mean));
      return {
        kurz: `Im Schnitt der Ränge liegt die Gruppe ${k.labels[hi]} am höchsten (${num(t.mean[hi])}), die Gruppe ${k.labels[lo]} am niedrigsten (${num(t.mean[lo])}). Ein höherer Rang heißt: Der Haushalt kommt leichter mit dem Einkommen aus. Gäbe es keine Unterschiede zwischen den Abschlüssen, käme ein so großes H ${pOften(t.p)} Stichproben vor (${pText(t.p)}).`,
        fachlich: `Kruskal–Wallis: H ≈ ${num(t.H)} bei ${t.df} Freiheitsgraden, ${pText(t.p)}, ε² ≈ ${num(t.eps2, 3)}. ${signif(t.p)}; der Effekt ist nach der Faustregel ${epsWord(t.eps2)}.`,
        zusatz: `Mittlere Ränge: ${k.labels.map((l, j) => `${l} ${num(t.mean[j])}`).join(', ')}.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig, und jede Person gehört zu genau einer Gruppe. Die Antworten lassen sich ordnen; die Gruppen selbst brauchen keine Reihenfolge.',
    think: [
      {
        question: 'Alle Antworten zur finanziellen Lage werden umgepolt. Was passiert mit dem mittleren Rang der Gruppe Fachhochschulreife?', options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 0,
        explain: 'Umpolen spiegelt jeden Rang: Aus Rang r wird 201 − r. Die Gruppe Fachhochschulreife rutscht von 119,23 auf 81,77. H bleibt trotzdem gleich, denn es misst nur die Abstände zur Mitte 100,5.',
        kurz: 'Umpolen spiegelt die Ränge, H bleibt.',
        tryIt: { label: 'finanzielle Lage umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'down', measure: c => kwMeanRank(c, 3) },
      },
      {
        question: 'Jemand nummeriert die Abschlüsse andersherum: 0 für Abitur, 4 für ohne Schulabschluss. Was passiert mit H?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Kruskal–Wallis ordnet nur die Antworten zur finanziellen Lage. Die Gruppen sind für den Test bloß Namen; ihre Reihenfolge spielt keine Rolle.',
        kurz: 'Die Gruppen brauchen keine Reihenfolge.',
        tryIt: { label: 'Abschlüsse andersherum nummerieren', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'kruskal_wallis', variant: 0,
    tokens: {
      kruskal_wallis: { sym: 'kruskal_wallis()', term: 'Kruskal–Wallis', kurz: 'Vergleicht zwei oder mehr unabhängige Gruppen über ihre Ränge. Meldet die mittleren Ränge, H, die Freiheitsgrade, p und ε².', fehler: 'Ohne group = rechnet mariposa nicht und meldet: `group` is required for Kruskal-Wallis test.' },
      group: { sym: 'group =', term: 'Gruppenvariable', kurz: 'Nennt die Spalte, die die Befragten in Gruppen teilt, hier die fünf Schulabschlüsse. Ihre Reihenfolge spielt für H keine Rolle.', fehler: 'Eine Spalte mit sehr vielen Werten, etwa das Alter, wird hier zu Dutzenden Gruppen. Bilde vorher mit rec() wenige Altersgruppen.' },
    },
    outputMap: [
      { match: 'Mean Rank', atlas: 'mittlerer Rang R̄ⱼ', step: 2, explain: 'Der mittlere Rang jeder Gruppe in der Reihe aller 200. Ohne Unterschied läge jede Gruppe bei 100,5.' },
      { match: 'H', atlas: 'H', step: 5, explain: 'Die Prüfgröße: Wie weit liegen die mittleren Ränge auseinander? R hat sie schon für Gleichstände korrigiert.' },
      { match: 'df', atlas: 'Freiheitsgrade k − 1', explain: 'Fünf Gruppen ergeben 5 − 1 = 4 Freiheitsgrade für die χ²-Verteilung.' },
      { match: '.021', atlas: 'p-Wert', explain: 'Gäbe es keine Unterschiede zwischen den Abschlüssen, käme ein so großes H in etwa 2 von 100 Stichproben vor.' },
      { match: 'Epsilon-squared', atlas: 'Effektgröße ε²', explain: 'ε² = H / (N − 1) ≈ 0,058. Nach der Faustregel, die R darunter druckt, ist das ein kleiner Effekt.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist H? Tippe sie an.', correct: 'H',
      wrong: { 'Mean Rank': 'Fast! Das ist der mittlere Rang einer Gruppe. H steht in der Tabelle Test Statistics.', df: 'Fast! Das sind die Freiheitsgrade. H steht links daneben.', '.021': 'Fast! Das ist der p-Wert. Er wird aus H gerechnet.', 'Epsilon-squared': 'Fast! Das ist die Effektgröße ε². Sie wird aus H gerechnet.' },
    },
  },
  next: {
    next: { id: 'dunn_test', why: 'Sagt H, dass sich irgendwo Gruppen unterscheiden, zeigen die Dunn-Vergleiche, welche Paare es sind.' },
    before: [
      { id: 'mann_whitney', why: 'Derselbe Gedanke für genau zwei Gruppen.' },
      { id: 'ranks', why: 'Der Test rechnet mit den Plätzen in der gemeinsamen Reihe, nicht mit den Antworten selbst.' },
    ],
    after: [
      { id: 'effect', why: 'ε² = H / (N − 1) sagt, wie stark sich die Gruppen unterscheiden.' },
    ],
    more: [
      { id: 'oneway_anova', why: 'Vergleicht dieselben Gruppen über Mittelwerte statt über Ränge.' },
      { id: 'chi_square_distribution', why: 'Mit dieser Verteilung vergleicht R das H.' },
      { id: 'friedman_test', why: 'Der Rangtest für drei und mehr Messungen derselben Personen.' },
    ],
  },
};
