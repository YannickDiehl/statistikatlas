// Werkstatt „Häufigkeiten“ für den Modus (Schritte 1 und 2) und die Häufigkeiten (Schritte 1 bis 5): je Antwort
// zählen, die häufigste finden, alle zählen, durch alle teilen, aufsummieren. Acht Beispielpersonen mit ihrem
// Schulabschluss (Codes 0 bis 4 wie im Lehrdatensatz); die Brücke rechnet dasselbe mit allen 200 Befragten.
// Referenzwerte in R: b03-lage.test.ts.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, Workshop } from '../../types';
import { num, pct } from '../../format';
import { labelOf, valueText } from './lage';

/** Kennwerte der Häufigkeiten. `values` sind die beobachteten Werte (aufsteigend), `counts` ihre Häufigkeiten. */
export interface Haeufigkeit {
  xs: number[]; n: number;
  values: number[]; counts: number[]; k: number;
  /** Breite der beobachteten Codes (größter minus kleinster plus 1), bei den acht Personen die fünf Abschlüsse */
  span: number;
  max: number; modes: number[]; mode: number; maxShare: number;
  /** je Person: Häufigkeit ihres Werts, Anteil (0 bis 1), Prozent, kumulierte Prozent von unten und von oben */
  own: number[]; ownFrac: number[]; ownShare: number[]; ownCum: number[]; ownCumTop: number[];
}

export function haeufigkeit(xs: readonly number[]): Haeufigkeit {
  const n = xs.length, m = new Map<number, number>();
  for (const v of xs) m.set(v, (m.get(v) ?? 0) + 1);
  const values = [...m.keys()].sort((a, b) => a - b), counts = values.map(v => m.get(v)!);
  const max = Math.max(...counts), modes = values.filter((_, i) => counts[i] === max);
  const own = xs.map(v => m.get(v)!), below = (v: number) => xs.filter(x => x <= v).length, above = (v: number) => xs.filter(x => x >= v).length;
  return {
    xs: [...xs], n, values, counts, k: values.length, span: values[values.length - 1] - values[0] + 1,
    max, modes, mode: modes[0], maxShare: max / n * 100,
    own, ownFrac: own.map(o => o / n), ownShare: own.map(o => o / n * 100),
    ownCum: xs.map(v => below(v) / n * 100), ownCumTop: xs.map(v => above(v) / n * 100),
  };
}

type C = Ctx<Haeufigkeit>;
const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
/** Codes des Schulabschlusses im Lehrdatensatz. */
const CODES = [0, 1, 2, 3, 4];
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (k: number) => String(k).split('').map(d => SUB[Number(d)] ?? d).join('');
const P = (c: C) => c.names[c.who];
const countOf = (s: Haeufigkeit, code: number) => s.xs.filter(v => v === code).length;
const abschluss = (code: number) => `Code ${code} („${labelOf('schulabschluss', code)}“)`;
const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
const list = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} und ${xs[xs.length - 1]}`;

export const haeufigkeiten: Workshop<number[], Haeufigkeit> = {
  id: 'b03-haeufigkeit',
  wofuer: 'Acht Personen nennen ihren höchsten Schulabschluss, von 0 (ohne Abschluss) bis 4 (Abitur). Welcher Abschluss kommt am häufigsten vor? Und welcher Anteil der Gruppe hat höchstens einen mittleren Abschluss? Dafür zählst du, statt zu rechnen.',
  mut: 'Hier zählst du vor allem: je Abschluss, dann alle zusammen. Danach teilst du einmal und zählst Anteile zusammen. Das Rechnen übernimmt später R.',
  picture: 'b03-haeufigkeit',
  dataNote: 'Acht Beispielpersonen mit ihrem Schulabschluss, Codes 0 bis 4. Die Punkte im Bild lassen sich zwischen den Abschlüssen ziehen.',
  names: NAMES,
  bounds: { min: 0, max: 4 },
  presets: [
    { id: 'A', label: 'Gruppe 1: 2 4 1 2 4 2 0 3', data: [2, 4, 1, 2, 4, 2, 0, 3] },
    { id: 'B', label: 'Zwei Lager: 1 1 4 1 4 4 2 0', data: [1, 1, 4, 1, 4, 4, 2, 0] },
  ],
  compute: haeufigkeit,
  glyphs: [
    { sym: 'j', say: 'j', term: 'Ausprägung', plain: 'eine mögliche Antwort, hier ein Abschluss', step: 1 },
    { sym: 'nⱼ', say: 'n j', term: 'absolute Häufigkeit', plain: 'wie viele Personen Antwort j gegeben haben', step: 1 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'alle gültigen Antworten, hier 8', step: 3 },
    { sym: 'hⱼ', say: 'h j', term: 'relative Häufigkeit', plain: 'der Anteil mit Antwort j', step: 4 },
    { sym: 'Fⱼ', say: 'F j', term: 'kumulierte relative Häufigkeit', plain: 'der Anteil mit Antwort j oder einer kleineren', step: 5 },
  ],
  steps: [
    {
      button: 'nⱼ', title: 'Je Abschluss zählen', sym: 'nⱼ', say: 'n j', concept: 'frequency', perPerson: true,
      was: 'Wir zählen für jeden Abschluss, wie viele der acht Personen ihn haben. Jede Person zählt genau einmal.',
      rechnung: c => { const v = c.s.xs[c.who]; return `Person ${P(c)} hat ${abschluss(v)}: n${sub(v)} = ${c.s.own[c.who]}. So viele der acht haben diesen Abschluss, ${P(c)} eingeschlossen.`; },
      fach: 'Die absolute Häufigkeit nⱼ zählt die Fälle mit der Ausprägung j.',
      warum: 'Erst die Zählung zeigt, wie sich die Personen auf die Abschlüsse verteilen. Die Codes selbst sind nur Namen.',
      acht: 'Abschlüsse, die niemand hat, gehören trotzdem in die Tabelle, mit nⱼ = 0. In R zeigt frequency() sie mit show_unused = TRUE.',
      check: {
        question: c => `Wie viele Personen haben denselben Abschluss wie Person ${P(c)}?`,
        answer: c => c.s.own[c.who],
        diagnose: (c, v) => v !== 'NA' && v === c.s.own[c.who] - 1 ? `Fast! Person ${P(c)} zählt selbst mit.` : null,
      },
    },
    {
      button: 'max nⱼ', title: 'Die häufigste Antwort finden', sym: '', concept: 'mode', perPerson: false,
      was: 'Wir suchen den Abschluss mit der größten Zahl. Er ist der Modus, die häufigste Antwort.',
      rechnung: c => c.s.modes.length === 1
        ? `Am häufigsten ist ${abschluss(c.s.mode)} mit ${c.s.max} von 8 Personen.`
        : `Gleich häufig sind ${list(c.s.modes.map(abschluss))} mit je ${c.s.max} Personen. R meldet bei Gleichstand den kleinsten Code, also ${c.s.mode}.`,
      fach: 'Der Modus ist die Ausprägung mit der größten absoluten Häufigkeit.',
      warum: 'Der Modus braucht keine Rechnung mit den Codes. Deshalb passt er auch zu Kategorien ohne Reihenfolge, etwa zu Parteien.',
      acht: c => c.s.modes.length > 1
        ? 'Hier gibt es mehr als einen Modus. Eine einzige Zahl verschweigt das; schau deshalb immer auch in die Tabelle.'
        : `Der Modus ist der Abschluss mit der größten Zahl, nicht die größte Zahl selbst. Gesucht ist hier Code ${c.s.mode}, nicht ${c.s.max}.`,
      check: {
        question: c => c.s.modes.length > 1 ? 'Wie viele Personen haben die häufigste Antwort?' : 'Welchen Code hat die häufigste Antwort?',
        answer: c => c.s.modes.length > 1 ? c.s.max : c.s.mode,
        diagnose: (c, v) => v === 'NA' ? null
          : c.s.modes.length === 1 && c.s.max !== c.s.mode && v === c.s.max ? 'Fast! Das ist, wie oft sie vorkommt. Gefragt ist der Code der häufigsten Antwort.'
          : c.s.modes.length > 1 && c.s.modes.includes(v) && v !== c.s.max ? 'Fast! Das ist einer der gleich häufigen Codes. Gefragt ist, wie viele Personen ihn haben.'
          : null,
      },
    },
    {
      button: 'n', title: 'Alle zählen', sym: 'n', say: 'n', concept: 'validn', perPerson: false,
      was: 'Wir zählen alle Personen mit einer gültigen Antwort: n = 8. Das ist die Summe aller nⱼ.',
      rechnung: c => `${CODES.map(k => countOf(c.s, k)).join(' + ')} = ${c.s.n}.`,
      fach: 'Die Summe der absoluten Häufigkeiten ergibt die Zahl der gültigen Fälle n.',
      warum: 'n ist der Nenner für alle Anteile. Ohne ihn weiß man nicht, ob 3 viel oder wenig ist.',
      acht: 'Gezählt werden Personen, nicht Abschlüsse. Fünf Codes, aber acht Personen: n = 8.',
      check: {
        question: 'Wie viele gültige Antworten gibt es insgesamt?',
        answer: c => c.s.n,
        diagnose: (c, v) => v !== 'NA' && v === 5 && c.s.n !== 5 ? 'Fast! 5 ist die Zahl der Abschlüsse. Gezählt werden die Personen.' : null,
      },
    },
    {
      button: 'nⱼ / n', title: 'Durch alle teilen', sym: 'hⱼ', say: 'h j', concept: 'frequency', perPerson: true,
      was: 'Wir teilen jede Zählung durch n = 8. So wird aus der Zahl ein Anteil; mal 100 ergibt Prozent.',
      rechnung: c => { const v = c.s.xs[c.who], f = c.s.ownFrac[c.who]; return `h${sub(v)} = n${sub(v)} / n = ${c.s.own[c.who]} / 8 ${eq(f)} ${num(f)}, also ${pct(f)}. So viele der acht haben denselben Abschluss wie ${P(c)}.`; },
      fach: 'Die relative Häufigkeit hⱼ = nⱼ / n ist der Anteil der Fälle mit Ausprägung j. Alle hⱼ zusammen ergeben 1, also 100 %.',
      warum: 'Anteile lassen sich vergleichen, auch wenn Gruppen verschieden groß sind. 3 von 8 und 75 von 200 sind beide 37,5 %.',
      acht: 'Prozent von wem? Hier von allen gültigen Antworten. Fehlen Werte, zeigt R zwei Spalten: Raw % für alle Fälle und Valid % für die gültigen.',
      check: {
        question: c => `Wie viel Prozent haben denselben Abschluss wie Person ${P(c)}?`,
        answer: c => c.s.ownShare[c.who],
        diagnose: (c, v) => v === 'NA' ? null
          : Math.abs(v - c.s.ownFrac[c.who]) < 1e-9 ? 'Fast! Das ist der Anteil. Mal 100 ergibt Prozent.'
          : v === c.s.own[c.who] && c.s.own[c.who] !== c.s.ownShare[c.who] ? 'Fast! Das ist die Zahl der Personen. Teile sie durch 8 und nimm sie mal 100.'
          : null,
      },
    },
    {
      button: 'Σ hⱼ', title: 'Von unten aufsummieren', sym: 'Fⱼ', say: 'F j', concept: 'empirical_distribution', perPerson: true,
      was: 'Wir zählen die Anteile vom niedrigsten Abschluss bis zum Abschluss der Person zusammen. Das zeigt, wie viele höchstens diesen Abschluss haben.',
      rechnung: c => {
        const v = c.s.xs[c.who], upTo = CODES.filter(k => k <= v);
        return `F${sub(v)} = ${upTo.map(k => `h${sub(k)}`).join(' + ')} = (${upTo.map(k => countOf(c.s, k)).join(' + ')}) / 8 = ${pct(c.s.ownCum[c.who] / 100)}. So viele haben höchstens den Abschluss von ${P(c)}.`;
      },
      fach: 'Die kumulierte relative Häufigkeit Fⱼ ist der Anteil der Fälle mit einem Wert kleiner oder gleich j.',
      warum: 'Bei geordneten Antworten fragt man oft: Wie viele haben höchstens einen mittleren Abschluss? In R steht das in der Spalte Cum. %.',
      acht: 'Aufsummieren ergibt nur bei geordneten Antworten Sinn. Bei Parteien wäre „bis zur SPD“ ohne Bedeutung.',
      check: {
        question: c => `Wie viel Prozent haben höchstens den Abschluss von Person ${P(c)}?`,
        answer: c => c.s.ownCum[c.who],
        diagnose: (c, v) => v === 'NA' ? null
          : Math.abs(c.s.ownShare[c.who] - c.s.ownCum[c.who]) > 1e-9 && Math.abs(v - c.s.ownShare[c.who]) < 1e-9 ? 'Fast! Das ist nur der Anteil dieses Abschlusses. Zähl die Anteile der niedrigeren Abschlüsse dazu.'
          : Math.abs(c.s.ownCumTop[c.who] - c.s.ownCum[c.who]) > 1e-9 && Math.abs(v - c.s.ownCumTop[c.who]) < 1e-9 ? 'Fast! Du hast von oben gezählt. Höchstens heißt: dieser Abschluss und alle niedrigeren.'
          : null,
      },
    },
  ],
  numeric: (c, last) => {
    const s = c.s, v = s.xs[c.who];
    const table: FNode = { part: [CODES.map(k => `n${sub(k)} = ${countOf(s, k)}`).join(', ')], m: 1 };
    if (last <= 2) return [table, { br: true }, { part: ['Modus'], m: 2 }, ` = Code ${s.mode}`];
    return [
      table, { br: true },
      { part: [`h${sub(v)}`], m: 4 }, ' = ', { part: [`n${sub(v)}`], m: 1 }, ' / ', { part: ['n'], m: 3 }, ` = ${s.own[c.who]} / ${s.n} ${eq(s.ownFrac[c.who])} `, { part: [`${num(s.ownFrac[c.who])}, also ${pct(s.ownFrac[c.who])}`], m: 4 }, { br: true },
      { part: [`F${sub(v)}`], m: 5 }, ' = ', { part: [pct(s.ownCum[c.who] / 100)], m: 5 },
    ];
  },
  table: {
    columns: [
      { head: 'Abschluss xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.xs[i]) },
      { head: 'nⱼ', from: 1, active: [1, 2], cell: (c, i) => String(c.s.own[i]) },
      { head: 'zählt', from: 3, active: [3], cell: () => '1', sum: c => String(c.s.n), sumFrom: 3 },
      { head: 'hⱼ', from: 4, active: [4], cell: (c, i) => pct(c.s.ownFrac[i]) },
      { head: 'Fⱼ', from: 5, active: [5], cell: (c, i) => pct(c.s.ownCum[i] / 100) },
    ],
    lines: [
      { from: 1, step: 1, text: c => `Häufigkeiten: ${CODES.map(k => `Code ${k}: ${countOf(c.s, k)}`).join(', ')}` },
      { from: 2, step: 2, text: c => c.s.modes.length === 1 ? `Modus: Code ${c.s.mode} mit ${c.s.max} Personen` : `Gleich häufig: Codes ${list(c.s.modes.map(String))} mit je ${c.s.max} Personen` },
      { from: 3, step: 3, text: c => `n = ${c.s.n}` },
      { from: 4, step: 4, text: c => `Prozent: ${CODES.map(k => `Code ${k}: ${pct(countOf(c.s, k) / c.s.n)}`).join(', ')}; zusammen 100 %` },
      { from: 5, step: 5, text: c => `Kumuliert: ${CODES.map(k => `bis ${k}: ${pct(c.s.xs.filter(x => x <= k).length / c.s.n)}`).join(', ')}` },
    ],
  },
  captions: {
    1: 'Jeder Punkt ist eine Person, gleiche Abschlüsse stapeln sich: 0 ohne Abschluss, 1 Haupt- oder Volksschule, 2 mittlerer Abschluss, 3 Fachhochschulreife (FH), 4 Abitur. Du kannst die Punkte ziehen.',
    2: 'Der höchste Stapel ist der Modus, grün umrandet.',
    3: 'Alle Stapel zusammen ergeben die acht Personen.',
    4: 'Unter jedem Stapel sein Anteil an allen acht.',
    5: 'Darunter die kumulierten Anteile, also höchstens dieser Abschluss. Sie wachsen von links nach rechts bis 100 %.',
  },
  think: [
    {
      question: 'Alle acht hätten Abitur. Was passiert mit dem Modus?', options: ['er wird Abitur', 'er bleibt gleich', 'es gibt keinen mehr'], correct: 0, step: 2,
      explain: 'Alle haben denselben Abschluss: n₄ = 8, also 8 / 8 = 100 %. Der Modus ist Abitur, und Unterschiede gibt es keine mehr.',
      kurz: 'Ohne Unterschiede ist die einzige Antwort auch die häufigste.',
      tryIt: { label: 'alle auf Abitur (Code 4)', apply: d => d.map(() => 4) },
    },
    {
      question: 'Kann es mehr als einen Modus geben?', options: ['ja, bei Gleichstand', 'nein, nie'], correct: 0, step: 2,
      explain: 'Haben zwei Abschlüsse gleich viele Personen, sind beide die häufigste Antwort. R meldet dann nur den kleinsten Code; die Tabelle zeigt beide.',
      kurz: 'Gleichstand heißt: mehrere Modi.',
      tryIt: { label: 'Zwei Lager', apply: () => [1, 1, 4, 1, 4, 4, 2, 0] },
    },
    {
      question: 'Darf man die Codes der acht zusammenzählen und durch 8 teilen?', options: ['das ergibt eine Zahl, aber keinen sinnvollen Abschluss', 'ja, das ist der typische Abschluss'], correct: 0, step: 1,
      explain: 'Code 4 ist nicht doppelt so viel Bildung wie Code 2. Für geordnete Kategorien beschreiben Häufigkeiten, Modus und Median die Verteilung, ein Mittelwert der Codes nicht.',
      kurz: 'Codes sind Namen, keine Mengen.',
    },
  ],
  variants: {
    mode: {
      lastStep: 2,
      kurz: 'Der Modus ist die Antwort, die am häufigsten vorkommt. Du findest ihn, indem du zählst, nicht rechnest.',
      fachlich: 'Der Modus ist die Ausprägung mit der größten absoluten Häufigkeit nⱼ; er braucht weder eine Reihenfolge noch Abstände.',
      symbolic: [{ part: ['Modus'], m: 2 }, ' = Antwort mit dem ', { part: ['größten'], m: 2 }, ' ', { part: ['n', { sub: 'j' }], m: 1 }],
      aria: 'Modus gleich die Antwort mit dem größten n j',
      metrics: [{ label: 'Häufigste Antwort, Personen', value: c => String(c.s.max) }, { label: 'Modus', value: c => `Code ${c.s.mode}` }],
      interpret: c => ({
        kurz: c.s.modes.length === 1
          ? `Am häufigsten haben die acht ${abschluss(c.s.mode)}: ${c.s.max} von 8 Personen.`
          : `Gleich häufig sind ${list(c.s.modes.map(abschluss))}, mit je ${c.s.max} von 8 Personen. Die Gruppe hat mehrere Schwerpunkte.`,
        fachlich: `Modus = ${c.s.mode} mit n${sub(c.s.mode)} = ${c.s.max}${c.s.modes.length > 1 ? '; bei Gleichstand meldet w_modus() den kleinsten Code' : ''}.`,
      }),
      next: { id: 'frequency', label: 'Weiter zu den Häufigkeiten' },
      genau: {
        kurz: 'Der Modus passt zu jedem Skalenniveau. Bei vielen verschiedenen Werten, etwa Einkommen in Euro, sagt er wenig.',
        paragraphs: () => [
          'Bei Gleichstand gibt mariposa::w_modus() nur einen Modus aus, den kleinsten Wert. Eine Verteilung mit zwei gleich hohen Gipfeln heißt bimodal.',
          'Bei metrischen Daten mit vielen verschiedenen Werten kommt fast jeder Wert nur einmal vor. Dann fasst man die Werte zu Klassen zusammen und nennt die häufigste Klasse.',
          'Mit Gewichten zählt jede Person mit ihrem Gewicht; der Modus ist dann die Antwort mit der größten Summe der Gewichte.',
        ],
      },
    },
    frequency: {
      lastStep: 5,
      kurz: 'Häufigkeiten zählen, wie oft jede Antwort vorkommt. Geteilt durch alle ergibt das Anteile, die sich vergleichen lassen.',
      fachlich: 'Die absolute Häufigkeit nⱼ zählt die Fälle je Ausprägung, die relative hⱼ = nⱼ / n teilt durch die Zahl der gültigen Fälle; die kumulierte Fⱼ summiert die relativen bis j.',
      symbolic: [{ part: ['h', { sub: 'j' }], m: 4 }, ' = ', { frac: [{ part: ['n', { sub: 'j' }], m: 1 }], den: [{ part: ['n'], m: 3 }], m: 4 }, ',  ', { part: ['F', { sub: 'j' }, ' = h₀ + … + h', { sub: 'j' }], m: 5 }],
      aria: 'h j gleich n j geteilt durch n; F j gleich h null plus und so weiter bis h j',
      metrics: [{ label: 'Personen n', value: c => String(c.s.n) }, { label: 'Anteil der häufigsten Antwort', value: c => pct(c.s.maxShare / 100) }],
      interpret: c => {
        const upTo2 = c.s.xs.filter(x => x <= 2).length / c.s.n;
        return {
          kurz: `${pct(c.s.maxShare / 100)} der acht haben ${c.s.modes.length === 1 ? abschluss(c.s.mode) : list(c.s.modes.map(abschluss))}; das ist die häufigste Antwort. Höchstens einen mittleren Abschluss haben ${pct(upTo2)}.`,
          fachlich: `n = ${c.s.n}; hⱼ für die Codes 0 bis 4: ${CODES.map(k => pct(countOf(c.s, k) / c.s.n)).join(', ')}. Zusammen ergeben sie 100 %.`,
        };
      },
      genau: {
        kurz: 'Prozente beziehen sich immer auf eine Basis. R zeigt Raw % für alle Fälle und Valid % für die gültigen.',
        paragraphs: () => [
          'Fehlen Antworten, unterscheiden sich Raw % (Basis: alle Befragten) und Valid % (Basis: gültige Antworten). Cum. % summiert die gültigen Prozente auf.',
          'Bei stetigen Variablen wie der Lernzeit kommt fast jeder Wert nur einmal vor. Eine Häufigkeitstabelle wird dann lang; besser fasst man Werte zu Klassen zusammen, etwa 0 bis unter 5 Stunden.',
          'fre() ist in mariposa ein anderer Name für frequency(). Mit weights = … zählt jede Person mit ihrem Gewicht.',
        ],
      },
    },
  },
};

// ---------- Brücke „Mit 200 Befragten“ ----------

type B = BridgeCtx<Haeufigkeit>;
const N = (c: B) => c.values.length;
const PB = (c: B) => c.names[c.who];
const vt = (c: B, v: number) => valueText(c.col.id, v);
const share = (c: B, k: number) => pct(k / N(c));
/** Erster Wert, bei dem die kumulierten Anteile mindestens 50 % erreichen. */
const half = (s: Haeufigkeit) => { let acc = 0; for (let i = 0; i < s.k; i++) { acc += s.counts[i]; if (acc * 2 >= s.n) return s.values[i]; } return s.values[s.k - 1]; };
const ordered = (c: B) => c.col.scale !== 'nominal';
const modesText = (c: B) => c.s.modes.length <= 3 ? list(c.s.modes.map(v => vt(c, v))) : `${c.s.modes.length} Werte`;

export const bridgeHaeufigkeit: Bridge<Haeufigkeit> = {
  data: 'series',
  numeric: (c, last) => {
    const s = c.s, v = c.values[c.who], i = s.values.indexOf(v);
    if (last <= 2) return [{ part: [`${s.k} verschiedene Werte`], m: 1 }, ', ', { part: ['Modus'], m: 2 }, ` = ${num(s.mode)} mit `, { part: [`nⱼ = ${s.max}`], m: 1 }];
    return [
      { part: ['hⱼ'], m: 4 }, ' = ', { part: [`nⱼ = ${s.counts[i]}`], m: 1 }, ' / ', { part: [`n = ${N(c)}`], m: 3 }, ' = ', { part: [share(c, s.counts[i])], m: 4 }, { br: true },
      { part: ['Fⱼ'], m: 5 }, ' = ', { part: [pct(s.ownCum[c.who] / 100)], m: 5 },
    ];
  },
  lines: [
    {
      all: c => `Die ${N(c)} Antworten verteilen sich auf ${c.s.k} verschiedene Werte. Zusammen ergeben die Zählungen wieder ${N(c)}.`,
      person: c => `${PB(c)} hat ${vt(c, c.values[c.who])}. Diesen Wert haben ${c.s.own[c.who]} Befragte, ${PB(c)} eingeschlossen.`,
    },
    {
      all: c => c.s.modes.length === 1 ? `Am häufigsten ist ${vt(c, c.s.mode)} mit ${c.s.max} Befragten.`
        : `Gleich häufig sind ${modesText(c)} mit je ${c.s.max} Befragten; R meldet den kleinsten Wert, ${num(c.s.mode)}.`,
      person: c => c.s.own[c.who] === c.s.max ? `${PB(c)} hat die häufigste Antwort.` : `${PB(c)} hat eine seltenere Antwort: ${c.s.own[c.who]} statt ${c.s.max} Befragte.`,
    },
    {
      all: c => `Alle Zählungen zusammen: n = ${N(c)}.`,
      person: c => `${PB(c)} zählt einmal mit, wie alle anderen.`,
    },
    {
      all: c => `Die häufigste Antwort hat ${c.s.max} / ${N(c)} = ${share(c, c.s.max)}. Alle Anteile zusammen ergeben 100 %.`,
      person: c => `${PB(c)}: ${c.s.own[c.who]} / ${N(c)} = ${share(c, c.s.own[c.who])} haben dieselbe Antwort.`,
    },
    {
      all: c => ordered(c) ? `Von der kleinsten Antwort an aufsummiert, erreichst du bei ${vt(c, half(c.s))} erstmals mindestens 50 %.`
        : `Bei „${c.col.title}“ haben die Codes keine Reihenfolge; aufsummieren ergibt hier keinen Sinn.`,
      person: c => ordered(c) ? `${pct(c.s.ownCum[c.who] / 100)} der Befragten haben höchstens den Wert von ${PB(c)}, ${vt(c, c.values[c.who])}.`
        : `${PB(c)} hat ${vt(c, c.values[c.who])}; ein Anteil „bis hierhin“ wäre ohne Bedeutung.`,
    },
  ],
  metrics: (c, variant) => variant === 'mode'
    ? [{ label: 'Befragte n', value: String(N(c)) }, { label: 'Häufigste Antwort, Befragte', value: String(c.s.max) }, { label: 'Modus', value: c.col.scale === 'metric' ? c.u(c.s.mode) : num(c.s.mode) }]
    : [{ label: 'Befragte n', value: String(N(c)) }, { label: 'Verschiedene Werte', value: String(c.s.k) }, { label: 'Anteil der häufigsten Antwort', value: share(c, c.s.max) }],
  interpret: (c, variant) => {
    const s = c.s, n = N(c), t = c.col.title;
    const rest = s.values.map((v, i) => ({ v, k: s.counts[i] })).filter(x => !s.modes.includes(x.v)).sort((a, b) => b.k - a.k || a.v - b.v);
    if (variant === 'mode') return {
      kurz: s.modes.length === 1 ? `Am häufigsten antworten die ${n} Befragten bei „${t}“ mit ${vt(c, s.mode)}: ${s.max} von ${n}.`
        : `Bei „${t}“ sind ${modesText(c)} gleich häufig, mit je ${s.max} von ${n} Befragten.`,
      fachlich: `Der Modus von „${t}“ ist ${num(s.mode)} mit nⱼ = ${s.max} bei n = ${n}${s.modes.length > 1 ? '; bei Gleichstand meldet w_modus() den kleinsten Wert' : ''}.`,
      zusatz: rest.length ? `Danach folgt ${vt(c, rest[0].v)} mit ${rest[0].k} Befragten.` : 'Alle haben dieselbe Antwort.',
    };
    return {
      kurz: `${share(c, s.max)} der ${n} Befragten antworten bei „${t}“ mit ${s.modes.length === 1 ? vt(c, s.mode) : modesText(c)}; das ist die häufigste Antwort. Alle Anteile zusammen ergeben 100 %.`,
      fachlich: `Häufigkeiten von „${t}“ bei n = ${n}: ${s.k} verschiedene Werte; der häufigste hat nⱼ = ${s.max}, also hⱼ = ${share(c, s.max)}.`,
      zusatz: s.k <= 8 ? `Je Wert: ${s.values.map((v, i) => `${num(v)}: ${s.counts[i]}`).join(', ')}.` : `Bei ${s.k} verschiedenen Werten wird die Tabelle lang; Klassen fassen sie zusammen.`,
    };
  },
  voraussetzung: (c, variant) => variant === 'mode'
    ? 'Der Modus braucht nur unterscheidbare Antworten, keine Reihenfolge und keine Abstände. Bei vielen verschiedenen Werten sagt er wenig.'
    : c.col.scale === 'metric' && c.s.k > 12 ? `„${c.col.title}“ hat ${c.s.k} verschiedene Werte; fasse sie für eine Tabelle besser zu Klassen zusammen.`
    : 'Häufigkeiten passen zu jeder Spalte. Kumulierte Anteile ergeben nur bei geordneten Antworten Sinn.',
  picture: () => ({}),
  value: (c, variant) => variant === 'mode' ? c.s.mode : c.s.maxShare,
};
haeufigkeiten.bridge = bridgeHaeufigkeit;

const SA = 'schulabschluss';

export const modeTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b03-haeufigkeit', variant: 'mode', variable: SA,
    think: [
      {
        question: 'Angenommen, niemand hätte einen Schulabschluss (Code 0). Welcher Code ist dann der Modus?', options: ['0', '4', 'keiner'], correct: 0, step: 2,
        explain: 'Alle 200 haben denselben Code. Die einzige Antwort ist auch die häufigste: Code 0 mit 200 Befragten.',
        kurz: 'Ohne Unterschiede ist die einzige Antwort der Modus.',
        tryIt: { label: 'alle auf ohne Schulabschluss (Code 0)', op: 'constant', column: 'x', value: 0 },
        expect: { change: 'equals', value: 0 },
      },
      {
        question: 'Die Codes werden umgedreht: Aus 0 wird 4, aus 4 wird 0. Welcher Code ist dann der Modus?', options: ['4', '0', '2'], correct: 0, step: 2,
        explain: 'Wer Code 0 hatte, hat jetzt Code 4. Die Zählungen wandern mit: In den Ausgangsdaten haben die 42 Befragten ohne Schulabschluss jetzt Code 4, und 4 wird der Modus.',
        kurz: 'Neue Namen, gleiche Zählungen.',
        tryIt: { label: 'Codes umdrehen (4 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'equals', value: 4 },
      },
    ],
  },
  r: {
    entry: 'mode', variant: 0,
    outputMap: [
      { match: 'Mode', atlas: 'Modus', step: 2, explain: 'Mode heißt Modus: der häufigste Code, hier 0 („Ohne Schulabschluss“) mit 42 Befragten.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die gültigen Antworten.' },
      { match: 'Missing', atlas: 'fehlende Werte', explain: 'Missing zählt Befragte ohne Antwort.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist der Modus? Tippe sie an.', correct: 'Mode',
      wrong: {
        N: 'Fast! N ist die Zahl der Befragten. Der Modus steht unter Mode.',
        Missing: 'Fast! Missing zählt fehlende Antworten. Der Modus steht unter Mode.',
      },
    },
  },
  next: {
    next: { id: 'median', why: 'Bei geordneten Antworten die Mitte der Reihe nach, statt der häufigsten Antwort.' },
    before: [
      { id: 'frequency', why: 'Der Modus ist der Wert mit der größten Häufigkeit.' },
      { id: 'nominal', why: 'Für den Modus reicht es, Kategorien zu unterscheiden.' },
    ],
    after: [{ id: 'crosstab', why: 'Häufigkeiten zweier Fragen zugleich; der Modus je Gruppe ist ein erster Vergleich.' }],
    more: [
      { id: 'mean', why: 'Bei metrischen Daten die Mitte, die alle Werte nutzt.' },
      { id: 'describe', why: 'Zeigt den Modus mit show = "all" neben anderen Kennzahlen.' },
    ],
  },
};

export const frequencyTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b03-haeufigkeit', variant: 'frequency', variable: SA,
    think: [
      {
        question: 'Angenommen, alle hätten Abitur. Wie viel Prozent hat dann die häufigste Antwort?', options: ['100', '20', '21'], correct: 0, step: 4,
        explain: 'Alle 200 haben Code 4: 200 / 200 = 100 %. Alle anderen Codes kommen nicht mehr vor.',
        kurz: 'Eine einzige Antwort hat 100 %.',
        tryIt: { label: 'alle auf Abitur (Code 4)', op: 'constant', column: 'x', value: 4 },
        expect: { change: 'equals', value: 100 },
      },
      {
        question: 'Die Codes werden umgedreht: Aus 0 wird 4, aus 4 wird 0. Was passiert mit dem Anteil der häufigsten Antwort?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0, step: 4,
        explain: 'Die Zählungen wandern nur zu anderen Codes; die größte bleibt die größte. In den Ausgangsdaten sind das 42 von 200, also 21 %.',
        kurz: 'Neue Namen, gleiche Anteile.',
        tryIt: { label: 'Codes umdrehen (4 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'frequency', variant: 0,
    tokens: {
      show_unused: { sym: 'show_unused =', term: 'leere Kategorien zeigen', kurz: 'Mit TRUE zeigt frequency() auch Codes mit Wertelabel, die niemand gewählt hat, mit N = 0.', fehler: 'Ohne show_unused = TRUE fehlt ein Abschluss, den niemand hat, in der Tabelle. Dann übersiehst du leicht, dass eine Kategorie leer ist.' },
    },
    outputMap: [
      { match: 'N', atlas: 'nⱼ', step: 1, explain: 'In der Spalte N stehen die absoluten Häufigkeiten, ganz oben 42 Befragte ohne Schulabschluss.' },
      { match: 'valid N', atlas: 'n', step: 3, explain: 'valid N zählt alle gültigen Antworten: den Nenner der Prozente.' },
      { match: 'Raw %', atlas: 'hⱼ in Prozent', step: 4, explain: 'Raw % teilt durch alle Fälle, Valid % nur durch die gültigen. Ohne fehlende Werte sind beide gleich.' },
      { match: 'Cum. %', atlas: 'Fⱼ', step: 5, explain: 'Cum. % summiert die gültigen Prozente von oben nach unten auf: 59,5 % haben höchstens einen mittleren Abschluss.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie viele Befragte keinen Schulabschluss haben? Tippe sie an.', correct: 'N',
      wrong: {
        'Raw %': 'Fast! Das ist ihr Anteil in Prozent. Die Zahl der Personen steht unter N.',
        'valid N': 'Fast! Das sind alle gültigen Antworten zusammen. Die Zahl für einen Abschluss steht in seiner Zeile unter N.',
      },
    },
  },
  next: {
    next: { id: 'crosstab', why: 'Häufigkeiten von zwei Fragen zugleich: Wie oft kommt jede Kombination vor?' },
    before: [
      { id: 'validn', why: 'n ist der Nenner aller Prozente.' },
      { id: 'count', why: 'Jede Person zählt genau einmal.' },
      { id: 'nominal', why: 'Zum Zählen reicht es, Kategorien zu unterscheiden.' },
    ],
    after: [
      { id: 'mode', why: 'Die Antwort mit der größten Häufigkeit.' },
      { id: 'multiple_response', why: 'Häufigkeiten, wenn eine Person mehrere Antworten geben darf.' },
      { id: 'empirical_distribution', why: 'Die kumulierten Anteile bilden die empirische Verteilung.' },
    ],
    more: [
      { id: 'chisq_gof', why: 'Prüft, ob beobachtete Häufigkeiten zu erwarteten passen.' },
      { id: 'codebook', why: 'Zeigt Häufigkeiten aller Variablen eines Datensatzes.' },
    ],
  },
};
