// Werkstatt „Ränge“ (Begriff `ranks`): Lernzeiten der Größe nach ordnen, Plätze zählen, Gleichstände teilen.
// Ton nach src/explain/content/streuung.ts; Zahlen in R nachgerechnet (rank() mit mittleren Rängen), siehe b04-umformen.test.ts.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, Workshop } from '../../types';
import { count, num, close } from '../../format';
import { NAMES, P, N, lernzeit, valuesOf } from './shared';

/**
 * Ränge einer Reihe: `place` ist der Platz in der geordneten Reihe (bei Gleichstand in der Reihenfolge der Personen),
 * `rank` der mittlere Rang (Zahl der kleineren Werte plus (Zahl der gleichen + 1) / 2), `rev` der Rang von oben gezählt,
 * `first`/`last` die Plätze, die sich gleiche Werte teilen, `order` die Personen der Größe nach.
 */
export type RankStats = {
  xs: number[]; n: number; order: number[]; place: number[]; below: number[]; equal: number[]; above: number[];
  first: number[]; last: number[]; rank: number[]; rev: number[]; sum: number; tied: number;
};
export function rankStats(values: readonly number[]): RankStats {
  const xs = [...values], n = xs.length;
  const order = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b] || a - b), sorted = order.map(i => xs[i]);
  const place = new Array<number>(n);
  order.forEach((i, k) => { place[i] = k + 1; });
  /** Zahl der Werte kleiner als v bzw. kleiner oder gleich v (binäre Suche in der geordneten Reihe). */
  const countBelow = (v: number, orEqual: boolean) => { let lo = 0, hi = n; while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < v || (orEqual && sorted[mid] === v)) lo = mid + 1; else hi = mid; } return lo; };
  const below = xs.map(v => countBelow(v, false)), upto = xs.map(v => countBelow(v, true));
  const equal = upto.map((u, i) => u - below[i]), rank = below.map((b, i) => b + (equal[i] + 1) / 2);
  return {
    xs, n, order, place, below, equal, above: upto.map(u => n - u), first: below.map(b => b + 1), last: upto,
    rank, rev: rank.map(r => n + 1 - r), sum: n * (n + 1) / 2, tied: equal.filter(e => e > 1).length,
  };
}

type C = Ctx<RankStats>;
type BC = BridgeCtx<RankStats>;

/** „Plätze 2 und 3“, „Plätze 21 bis 24“. */
const placesText = (first: number, last: number) => `Plätze ${first}${last === first + 1 ? ' und ' : ' bis '}${last}`;
/** Die Plätze eines Gleichstands als Summe: „2 + 3“, bei vielen „21 + … + 24“. */
const placesSum = (first: number, last: number) => last - first <= 3 ? Array.from({ length: last - first + 1 }, (_, k) => first + k).join(' + ') : `${first} + … + ${last}`;
/** Andere Personen mit demselben Wert. */
const sameAs = (c: C) => c.s.xs.map((x, i) => i).filter(i => i !== c.who && c.s.xs[i] === c.s.xs[c.who]).map(i => c.names[i]);
/** „1 Person lernt“, „2 Personen lernen“. */
const people = (k: number, verb: [string, string]) => k === 1 ? `1 Person ${verb[0]}` : `${k} Personen ${verb[1]}`;
/** Erster Gleichstand der Reihe (Personen und Plätze), sonst null. */
function firstTie(c: C) {
  const i = c.s.order.find(k => c.s.equal[k] > 1);
  if (i === undefined) return null;
  const who = c.s.order.filter(k => c.s.xs[k] === c.s.xs[i]);
  return { who, value: c.s.xs[i], first: c.s.first[i], last: c.s.last[i], rank: c.s.rank[i] };
}

// ---------- Brücke ----------

/** „P002 teilt 8,3 h mit 1 Person“ und Ähnliches für die 200. */
const sharers = (k: number) => k === 1 ? '1 weiteren Person' : `${k} weiteren Personen`;

export const bridgeRaenge: Bridge<RankStats> = {
  data: 'series',
  numeric: c => {
    const b = c.s.below[c.who], e = c.s.equal[c.who];
    return [
      `${P(c)}: `, { part: [`${b} Werte kleiner`], m: 1 }, ', ', { part: [`${e} gleich (mit ${P(c)})`], m: 2 }, { br: true },
      { part: [`R(${P(c)})`], m: 2 }, ' = ',
      ...(e > 1 ? [{ part: [`(${c.s.first[c.who]} + ${c.s.last[c.who]}) / 2`], m: 2 }, ' = '] as FNode[] : [{ part: [`Platz ${c.s.first[c.who]}`], m: 1 }, ' = '] as FNode[]),
      { part: [num(c.s.rank[c.who])], m: 2 },
    ];
  },
  lines: [
    {
      all: c => `Wir ordnen alle ${N(c)} ${valuesOf(c)} von ${c.u(c.s.xs[c.s.order[0]])} bis ${c.u(c.s.xs[c.s.order[N(c) - 1]])} und zählen die Plätze von 1 bis ${N(c)} durch.`,
      person: c => {
        const b = c.s.below[c.who], e = c.s.equal[c.who];
        return `Vor ${P(c)} stehen ${b} Befragte mit ${lernzeit(c) ? 'weniger Lernzeit' : 'kleinerem Wert'}${e > 1 ? `; ${e === 2 ? '1 weitere Person hat' : `${e - 1} weitere haben`} genau ${c.u(c.values[c.who])}` : ''}.`;
      },
    },
    {
      all: c => `${c.s.tied ? `${c.s.tied} Befragte teilen ihren Wert mit anderen und bekommen den Mittelwert ihrer Plätze.` : 'Kein Wert kommt doppelt vor, jeder Rang ist ein Platz.'} Alle Ränge zusammen ergeben ${count(c.s.sum)} = ${N(c)} · ${N(c) + 1} / 2.`,
      person: c => {
        const e = c.s.equal[c.who], f = c.s.first[c.who], l = c.s.last[c.who];
        return e > 1 ? `${P(c)} teilt ${c.u(c.values[c.who])} mit ${sharers(e - 1)}: ${placesText(f, l)}, Rang ${num(c.s.rank[c.who])}.`
          : `${P(c)} hat keinen Gleichstand: Rang ${num(c.s.rank[c.who])}, gleich dem Platz.`;
      },
    },
  ],
  metrics: c => [
    { label: 'Befragte n', value: String(N(c)) },
    { label: `Wert von ${P(c)}`, value: c.u(c.values[c.who]) },
    { label: `Rang von ${P(c)}`, value: num(c.s.rank[c.who]) },
  ],
  interpret: c => {
    const b = c.s.below[c.who], a = c.s.above[c.who];
    const less = lernzeit(c) ? ['lernt weniger', 'lernen weniger'] : ['hat einen kleineren Wert', 'haben einen kleineren Wert'];
    const more = lernzeit(c) ? 'mehr' : 'einen größeren';
    return {
      kurz: `${P(c)} steht auf Rang ${num(c.s.rank[c.who])} von ${N(c)}. ${b === 1 ? `1 Person ${less[0]}` : `${b} Befragte ${less[1]}`}, ${a} ${more}.`,
      fachlich: c.s.equal[c.who] > 1
        ? `Gleiche Werte bekommen den Mittelwert der Plätze, die sie sich teilen: R = (${c.s.first[c.who]} + ${c.s.last[c.who]}) / 2 = ${num(c.s.rank[c.who])}, denn ${b} Werte sind kleiner. Die Abstände zwischen den Werten gehen dabei verloren.`
        : `Ohne Gleichstand ist der Rang der Platz: ${b} Werte sind kleiner, also R = ${num(c.s.rank[c.who])}. Die Abstände zwischen den Werten gehen dabei verloren.`,
      zusatz: `Die Ränge haben immer den Mittelwert (n + 1) / 2 = ${num((N(c) + 1) / 2)}, egal wie die Werte verteilt sind.`,
    };
  },
  voraussetzung: c => c.col.scale === 'metric' ? `Ränge brauchen nur eine Reihenfolge. Bei „${c.col.title}“ gehen dabei die Abstände verloren.`
    : c.col.scale === 'ordinal' ? `„${c.col.title}“ ist geordnet: Genau dafür sind Ränge gemacht.`
    : `„${c.col.title}“ hat nur 0 und 1. Es entstehen zwei große Blöcke mit je einem mittleren Rang.`,
  picture: (c, step) => ({ contributions: step >= 2 ? { label: 'Ränge aller Befragten, der Größe nach', values: c.s.rank } : undefined }),
  value: c => c.s.rank[c.who],
};
// ---------- Werkstatt ----------

export const raenge: Workshop<number[], RankStats> = {
  id: 'raenge',
  bridge: bridgeRaenge,
  wofuer: 'Fünf Personen sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben. Manchmal zählt nur die Reihenfolge: Wer lernt am wenigsten, wer am meisten? Ränge ersetzen jede Lernzeit durch ihren Platz in dieser Reihenfolge. Dann stört auch eine Person, die extrem viel lernt, nicht mehr.',
  mut: 'Hier rechnest du kaum. Du ordnest die Lernzeiten, zählst die Plätze durch und teilst sie bei Gleichstand gerecht auf. Das übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b04-raenge',
  names: NAMES,
  bounds: { min: 0, max: 40 },
  presets: [
    { id: 'gleich', label: 'Mit Gleichstand: 9 4 15 7 7', data: [9, 4, 15, 7, 7] },
    { id: 'ausreisser', label: 'Mit Ausreißer: 9 4 40 7 7', data: [9, 4, 40, 7, 7] },
    { id: 'ohne', label: 'Ohne Gleichstand: 9 4 15 6 7', data: [9, 4, 15, 6, 7] },
  ],
  compute: rankStats,
  glyphs: [
    { sym: 'x₍₁₎ ≤ … ≤ x₍₅₎', say: 'x eins in Klammern bis x fünf in Klammern', term: 'geordnete Werte', plain: 'die Lernzeiten der Größe nach, von der kürzesten zur längsten', step: 1 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 1 },
    { sym: 'R(xᵢ)', say: 'R von x i', term: 'Rang', plain: 'der Platz von Person i; bei Gleichstand der Mittelwert der Plätze', step: 2 },
  ],
  steps: [
    {
      button: '≤', title: 'Der Größe nach ordnen', sym: 'x₍₁₎ ≤ … ≤ x₍₅₎', say: 'x eins in Klammern bis x fünf in Klammern', concept: 'sorting', perPerson: true,
      was: 'Wir ordnen die fünf Lernzeiten von der kürzesten zur längsten. Dann zählen wir die Plätze durch: 1, 2, 3, 4, 5.',
      rechnung: c => {
        const row = c.s.order.map(i => `${num(c.s.xs[i])} (${c.names[i]})`).join(' ≤ '), same = sameAs(c);
        return same.length
          ? `${row}. Person ${P(c)} teilt sich mit ${same.join(' und ')} die ${placesText(c.s.first[c.who], c.s.last[c.who])}.`
          : `${row}. Person ${P(c)} steht auf Platz ${c.s.place[c.who]}: ${people(c.s.below[c.who], ['lernt', 'lernen'])} weniger.`;
      },
      fach: 'Die geordneten Werte heißen Ordnungsstatistiken: x₍₁₎ ist der kleinste, x₍ₙ₎ der größte Wert. Die Platznummer zählt von 1 bis n.',
      warum: 'Für Ränge zählt nur, wer vor wem liegt. Wie groß die Abstände sind, spielt keine Rolle mehr.',
      acht: 'Platz 1 bekommt die kürzeste Lernzeit, nicht die längste. Anders als bei einer Siegerehrung zählen wir von unten.',
      check: {
        question: c => `Wie viele Personen lernen weniger als Person ${P(c)}?`,
        answer: c => c.s.below[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const b = c.s.below[c.who], a = c.s.above[c.who], place = c.s.place[c.who];
          if (a !== b && close(v, a)) return 'Fast! Das sind die Personen, die mehr lernen. Gezählt werden die mit weniger Stunden.';
          if (close(v, place)) return 'Fast! Das ist schon ihr Platz in der Reihe. Gefragt ist, wie viele Personen weniger lernen.';
          if (place - 1 !== b && close(v, place - 1)) return 'Fast! Du hast auch Personen mitgezählt, die gleich lange lernen. Gefragt ist, wie viele weniger lernen.';
          if (close(v, b + 1)) return 'Fast! Das ist der erste Platz nach diesen Personen. Gefragt ist, wie viele Personen weniger lernen.';
          return null;
        },
      },
    },
    {
      button: 'R', title: 'Gleichstände teilen', sym: 'R(xᵢ)', say: 'R von x i', concept: 'ranks', perPerson: true,
      was: 'Wer gleich lange lernt, bekommt denselben Rang: den Mittelwert der Plätze, die sich die Gleichen teilen. Alle anderen behalten ihren Platz als Rang.',
      rechnung: c => {
        const e = c.s.equal[c.who], f = c.s.first[c.who], l = c.s.last[c.who];
        return e > 1 ? `Person ${P(c)}: ${placesText(f, l)}, Rang (${placesSum(f, l)}) / ${e} = ${num(c.s.rank[c.who])}.`
          : `Person ${P(c)}: kein Gleichstand, Rang = Platz = ${num(c.s.rank[c.who])}.`;
      },
      fach: 'Der Rang R(xᵢ) ist die Position eines Werts in der geordneten Reihe. Gleiche Werte bekommen den Mittelwert ihrer Plätze, die mittleren Ränge.',
      warum: 'So hat niemand einen Vorteil, nur weil er zufällig zuerst genannt wurde. Und alle Ränge zusammen ergeben weiter n · (n + 1) / 2, hier 15.',
      acht: c => {
        const t = firstTie(c);
        return t ? `Wer gleich lange lernt, bekommt nicht den kleineren Platz. Bei ${t.who.map(i => c.names[i]).join(' und ')} (${placesText(t.first, t.last)}) ist der Rang ${num(t.rank)}, nicht ${t.first}.`
          : 'Hier gibt es keinen Gleichstand. Teilen sich zwei Personen einen Wert, bekommen beide den Mittelwert ihrer Plätze, nicht den kleineren.';
      },
      check: {
        question: c => `Welchen Rang bekommt Person ${P(c)}?`,
        answer: c => c.s.rank[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const r = c.s.rank[c.who], e = c.s.equal[c.who], f = c.s.first[c.who], l = c.s.last[c.who], rev = c.s.rev[c.who];
          if (e > 1 && (close(v, f) || close(v, l))) return `Fast! Das ist einer der Plätze. Wer gleich lange lernt, bekommt den Mittelwert der Plätze: (${placesSum(f, l)}) / ${e} = ${num(r)}.`;
          if (!close(rev, r) && close(v, rev)) return 'Fast! Du hast von der längsten Lernzeit an gezählt. Rang 1 bekommt die kürzeste.';
          return null;
        },
      },
    },
  ],
  numeric: c => {
    const e = c.s.equal[c.who];
    return [
      ...c.s.order.flatMap((i, k): FNode[] => [...(k ? [' ≤ '] : []), { part: [num(c.s.xs[i])], m: 1 }]), { br: true },
      { part: [`R(${num(c.s.xs[c.who])})`], m: 2 }, ' = ',
      ...(e > 1 ? [{ part: [`(${placesSum(c.s.first[c.who], c.s.last[c.who])}) / ${e}`], m: 2 }, ' = '] as FNode[] : [{ part: [`Platz ${c.s.place[c.who]}`], m: 1 }, ' = '] as FNode[]),
      { part: [num(c.s.rank[c.who])], m: 2 },
    ];
  },
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => num(c.s.xs[i]) },
      { head: 'Platz', from: 1, active: [1], cell: (c, i) => String(c.s.place[i]) },
      { head: 'R(xᵢ)', from: 2, active: [2], cell: (c, i) => num(c.s.rank[i]), sum: c => num(c.s.sum), sumFrom: 2, sumNote: 'immer n · (n + 1) / 2' },
    ],
    lines: [{
      from: 2, step: 2, text: c => {
        const t = firstTie(c);
        return t ? `${t.who.map(i => c.names[i]).join(' und ')} lernen gleich lange (${num(t.value)} h): ${placesText(t.first, t.last)}, Rang ${num(t.rank)}.` : 'Kein Gleichstand: Jeder Rang ist der Platz.';
      },
    }],
  },
  captions: {
    1: 'Oben die Lernzeiten in Stunden, unten die Plätze der Reihe nach. Du kannst die Punkte ziehen.',
    2: 'Unten stehen jetzt die Ränge. Gleich lange Lernzeiten teilen sich einen Rang; die Abstände in Stunden sind verschwunden.',
  },
  think: [
    {
      question: 'Person C lernt plötzlich 40 statt 15 Stunden. Was passiert mit ihrem Rang?', options: ['steigt', 'bleibt 5', 'sinkt'], correct: 1, step: 2,
      explain: 'C hatte schon die längste Lernzeit. Mehr als den letzten Platz gibt es nicht: Der Rang bleibt 5, egal wie weit C von den anderen entfernt liegt.',
      kurz: 'Ränge sind unempfindlich gegen Ausreißer.',
      tryIt: { label: 'C auf 40 Stunden', apply: d => d.map((x, i) => i === 2 ? 40 : x) },
    },
    {
      question: 'Alle lernen nur halb so lange. Was passiert mit den Rängen?', options: ['halbieren sich', 'bleiben gleich'], correct: 1, step: 1,
      explain: 'Die Reihenfolge bleibt dieselbe, also auch jeder Platz. Ränge ändern sich nur, wenn jemand jemanden überholt.',
      kurz: 'Ränge kennen nur die Reihenfolge.',
      tryIt: { label: 'alle halb so lange', apply: d => d.map(x => x / 2) },
    },
    {
      question: 'Zwei Personen teilen sich die Plätze 2 und 3. Welchen Rang bekommen sie?', options: ['beide 2', 'beide 2,5', 'die eine 2, die andere 3'], correct: 1, step: 2,
      explain: '(2 + 3) / 2 = 2,5. So bleibt die Summe aller Ränge 15, und niemand ist bevorzugt.',
      kurz: 'Gleiche Werte, gleicher mittlerer Rang.',
    },
    {
      question: 'Wie groß ist der Mittelwert der fünf Ränge?', options: ['3', 'hängt von den Lernzeiten ab'], correct: 0, step: 2,
      explain: 'Die Ränge ergeben zusammen immer 15, mit Gleichständen genauso. Geteilt durch 5 ist ihr Mittelwert immer (n + 1) / 2 = 3.',
      kurz: 'Die Ränge haben immer dieselbe Mitte.',
    },
  ],
  variants: {
    ranks: {
      lastStep: 2,
      kurz: 'Ein Rang sagt dir, an welcher Stelle jemand steht, wenn alle der Größe nach aufgereiht sind. Wie groß die Abstände sind, spielt dann keine Rolle mehr.',
      fachlich: 'Ränge ersetzen jeden Wert durch seine Position in der geordneten Reihe, von 1 für den kleinsten bis n für den größten. Gleiche Werte erhalten den Mittelwert ihrer Plätze; die Zuordnung zur Person bleibt.',
      symbolic: [{ part: ['R(x', { sub: 'i' }, ')'], m: 2 }, ' = ', { part: ['Platz von x', { sub: 'i' }], m: 1 }, ' in der geordneten Reihe; ', { part: ['bei Gleichstand der Mittelwert der Plätze'], m: 2 }],
      aria: 'R von x i gleich Platz von x i in der geordneten Reihe; bei Gleichstand der Mittelwert der Plätze',
      metrics: [
        { label: 'Lernzeit der gewählten Person', value: c => `${num(c.s.xs[c.who])} h` },
        { label: 'Rang der gewählten Person', value: c => num(c.s.rank[c.who]) },
      ],
      interpret: c => ({
        kurz: `Person ${P(c)} steht auf Rang ${num(c.s.rank[c.who])} von 5. ${c.s.below[c.who] ? `${people(c.s.below[c.who], ['lernt', 'lernen'])} weniger` : 'Niemand lernt weniger'}, ${c.s.above[c.who] ? `${people(c.s.above[c.who], ['lernt', 'lernen'])} mehr` : 'niemand mehr'}.`,
        fachlich: `Ränge ${c.s.rank.map(r => num(r)).join('; ')}. Ihre Summe ist immer n · (n + 1) / 2 = 15, ihr Mittelwert (n + 1) / 2 = 3.`,
      }),
      next: { id: 'spearman', label: 'Weiter zur Spearman-Korrelation' },
      genau: {
        kurz: 'Ränge behalten nur die Reihenfolge. Das macht sie unempfindlich gegen Ausreißer, kostet aber die Information über die Abstände.',
        paragraphs: () => [
          'Mit mittleren Rängen bleibt die Summe aller Ränge n · (n + 1) / 2, ganz gleich, wie viele Gleichstände es gibt. Rangtests wie Mann–Whitney oder Kruskal–Wallis rechnen mit solchen Rangsummen.',
          'Es gibt auch andere Regeln für Gleichstände: Im Sport bekommen alle den kleineren Platz (min_rank() in dplyr). In der Statistik nimmt man fast immer mittlere Ränge; rank() in R tut das ohne weitere Angabe.',
          'Ränge passen zu geordneten Kategorien wie dem Schulabschluss, bei denen Abstände nichts bedeuten. Bei metrischen Daten verschenken sie Information, sind dafür aber robust.',
          'In R: atlas %>% mutate(rang = rank(lernzeit)). Bei wenigen Antwortstufen, etwa 1 bis 5, entstehen große Blöcke mit demselben mittleren Rang.',
        ],
      },
    },
  },
};


export const tabsRanks: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'raenge', variant: 'ranks', variable: 'lernzeit',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Rang der gewählten Person?', options: ['steigt um 1', 'bleibt gleich', 'sinkt'], correct: 1, step: 1,
        explain: 'Alle rücken gleich weit, niemand überholt jemanden. Die Reihenfolge bleibt, also auch jeder Platz und jeder Rang.',
        kurz: 'Ränge kennen nur die Reihenfolge.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem Rang der gewählten Person?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1, step: 2,
        explain: 'Wer vorher weniger lernte, lernt auch doppelt genommen weniger. Gleiche Lernzeiten bleiben gleich, also auch die mittleren Ränge.',
        kurz: 'Malnehmen ändert keinen Rang.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
    ],
  },
  next: {
    next: { id: 'spearman', why: 'Pearson-r, gerechnet mit den Rängen statt mit den Werten: robust gegen Ausreißer.' },
    before: [
      { id: 'ordinal', why: 'Ränge brauchen nur eine Reihenfolge, keine festen Abstände.' },
      { id: 'sorting', why: 'Ordnen ist der erste Schritt zu den Rängen.' },
    ],
    after: [
      { id: 'median', why: 'Der mittlere Wert der Reihe nach steht auf dem mittleren Rang.' },
      { id: 'mann_whitney', why: 'Vergleicht zwei Gruppen über die Ränge aller Befragten.' },
    ],
    more: [
      { id: 'kruskal_wallis', why: 'Dasselbe für mehr als zwei Gruppen.' },
      { id: 'quantile', why: 'Quantile lesen Positionen in der geordneten Reihe ab.' },
    ],
  },
};
