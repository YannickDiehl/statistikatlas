// Tabellen-Werkzeug „Kreuztabelle“: fünf Befragte aus dem Lehrdatensatz (Erwerbstätigkeit und Weiterbildung) werden
// gekreuzt, die Wahl legt die Prozentbasis fest wie crosstab(…, percentages = …) in mariposa 0.7.4. Reiter mit den
// 200 Befragten (Schulabschluss und Weiterbildung). In R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { ConceptTabs, SampleCtx, TableTool } from '../../types';
import { close, num } from '../../format';
import { sampleColumn } from '../../sample';
import { columnById } from '../../../domain/survey';
import { T } from './shared';

/** P001, P002, P003, P008 und P011 aus dem Lehrdatensatz (createSurvey()): erwerbstaetig und weiterbildung, 0 = Nein, 1 = Ja. */
export const FUENF = [
  { person: 'P001', erwerbstaetig: 1, weiterbildung: 1 },
  { person: 'P002', erwerbstaetig: 1, weiterbildung: 0 },
  { person: 'P003', erwerbstaetig: 0, weiterbildung: 0 },
  { person: 'P008', erwerbstaetig: 1, weiterbildung: 1 },
  { person: 'P011', erwerbstaetig: 1, weiterbildung: 1 },
];
const YESNO = ['Nein', 'Ja'];
const code = (label: unknown) => YESNO.indexOf(String(label));
const percent = (part: number, whole: number) => whole > 0 ? `${num(part / whole * 100, 1)} %` : '–';

/** Zellzahlen der Kreuztabelle aus den Zeilen „vorher“ (Labels Nein/Ja): cells[Zeile][Spalte]. */
export function crossCounts(rows: TableTool['rows']) {
  const cells = [[0, 0], [0, 0]];
  for (const r of rows) { const i = code(r.erwerbstaetig), j = code(r.weiterbildung); if (i >= 0 && j >= 0) cells[i][j]++; }
  const rowSum = cells.map(r => r[0] + r[1]), colSum = [cells[0][0] + cells[1][0], cells[0][1] + cells[1][1]], n = rowSum[0] + rowSum[1];
  return { cells, rowSum, colSum, n };
}

export const kreuztabelle: TableTool = {
  concept: 'crosstab',
  wofuer: 'Machen Erwerbstätige häufiger eine Weiterbildung als Menschen ohne Erwerb? Dafür musst du für jede Person beide Antworten zugleich betrachten. Die Kreuztabelle zählt, wie oft jede Kombination vorkommt, und rechnet sie auf Wunsch in Prozent um.',
  kurz: 'Eine Kreuztabelle zählt, wie viele Personen jede Kombination aus zwei Antworten haben. Mit Prozenten innerhalb jeder Zeile kannst du Gruppen vergleichen.',
  mut: 'Hier rechnest du kaum. Du sortierst Personen in Kästchen, zählst sie und teilst am Ende durch eine Summe.',
  columns: [
    { key: 'person', label: 'Person' },
    { key: 'erwerbstaetig', label: 'erwerbstaetig' },
    { key: 'weiterbildung', label: 'weiterbildung' },
  ],
  rows: FUENF.map(r => ({ person: r.person, erwerbstaetig: YESNO[r.erwerbstaetig], weiterbildung: YESNO[r.weiterbildung] })),
  options: [
    { id: 'row', label: 'Zeilenprozente' },
    { id: 'col', label: 'Spaltenprozente' },
    { id: 'none', label: 'Nur Anzahlen' },
  ],
  steps: [
    {
      title: 'Für jede Person die Kombination ablesen',
      was: 'Jede Person hat bei beiden Fragen eine Antwort. Zusammen ergeben sie eine Kombination, etwa „erwerbstätig, keine Weiterbildung“.',
      warum: 'Eine Kreuztabelle braucht beide Antworten derselben Person. Nur so sieht man, was zusammen vorkommt.',
      acht: 'Die beiden Spalten nie getrennt sortieren oder zählen. Dann gehen die Paare verloren, und die Tabelle sagt nichts mehr über den Zusammenhang.',
      fach: 'Jede Person fällt in genau eine Zelle der Kreuztabelle: in Zeile j und Spalte k.',
      concept: 'pairs',
    },
    {
      title: 'Gleiche Kombinationen zählen',
      was: 'Wir zählen, wie viele Personen jede Kombination haben. Diese Zahl kommt in die passende Zelle.',
      warum: 'So wird aus fünf Zeilen mit Personen eine kleine Tabelle mit vier Zellen.',
      acht: 'Auch eine Kombination, die niemand hat, bekommt ihre Zelle, dann mit 0. Hier hat keine Person ohne Erwerb eine Weiterbildung gemacht.',
      sym: 'nⱼₖ', say: 'n j k',
      fach: 'nⱼₖ ist die Zellhäufigkeit: die Zahl der Personen mit Kategorie j in der Zeile und Kategorie k in der Spalte.',
      concept: 'crosstab',
    },
    {
      title: 'Ränder zusammenzählen',
      was: 'Wir zählen jede Zeile und jede Spalte zusammen. Unten rechts steht dann die Zahl aller Personen.',
      warum: 'Die Ränder zeigen, wie groß jede Gruppe ist. Durch sie teilst du gleich für die Prozente.',
      acht: 'Die Ränder müssen aufgehen: Alle Zeilensummen zusammen ergeben n, alle Spaltensummen auch.',
      sym: 'nⱼ₊, n₊ₖ', say: 'n j plus, n plus k',
      fach: 'Die Randhäufigkeiten nⱼ₊ und n₊ₖ sind die Summen einer Zeile und einer Spalte; n ist die Gesamtzahl.',
      concept: 'frequency',
    },
    {
      title: 'Innerhalb einer Gruppe in Prozent umrechnen',
      was: 'Wir teilen jede Zelle durch die Summe ihrer Zeile (Zeilenprozente) oder ihrer Spalte (Spaltenprozente). So lassen sich verschieden große Gruppen vergleichen.',
      warum: 'Hier gibt es viermal so viele Erwerbstätige wie Personen ohne Erwerb. Erst Anteile machen die beiden Gruppen vergleichbar.',
      acht: 'Zeilen- und Spaltenprozente beantworten verschiedene Fragen. Zeilenprozente: Wie viele Erwerbstätige machen eine Weiterbildung? Spaltenprozente: Wie viele mit Weiterbildung sind erwerbstätig?',
      sym: 'nⱼₖ / nⱼ₊', say: 'n j k durch n j plus',
      fach: 'Zeilenprozente sind bedingte relative Häufigkeiten: der Anteil einer Spaltenkategorie innerhalb einer Zeilenkategorie, mal 100.',
      concept: 'conditional_probability',
    },
  ],
  apply: (rows, option) => {
    const { cells, rowSum, colSum } = crossCounts(rows);
    const kombination = (i: number, j: number) => `${i ? 'erwerbstätig' : 'nicht erwerbstätig'}, ${j ? 'mit' : 'ohne'} Weiterbildung`;
    const base = option === 'row' ? { key: 'basis', label: 'Personen in der Zeile nⱼ₊' } : { key: 'basis', label: 'Personen in der Spalte n₊ₖ' };
    return {
      columns: [
        { key: 'person', label: 'Person' }, { key: 'kombination', label: 'Kombination' }, { key: 'zelle', label: 'Personen in der Zelle nⱼₖ' },
        ...(option === 'none' ? [] : [base, { key: 'prozent', label: option === 'row' ? 'Zeilenprozent' : 'Spaltenprozent' }]),
      ],
      rows: rows.map(r => {
        const i = code(r.erwerbstaetig), j = code(r.weiterbildung), n = i >= 0 && j >= 0 ? cells[i][j] : 0;
        const whole = option === 'row' ? rowSum[i] ?? 0 : colSum[j] ?? 0;
        return { person: r.person, kombination: kombination(i, j), zelle: n, ...(option === 'none' ? {} : { basis: whole, prozent: percent(n, whole) }) };
      }),
    };
  },
  rCode: option => [
    'library(dplyr)',
    'library(mariposa)',
    '',
    'atlas <- read_spss("Statistikatlas-200-Befragte.sav")',
    '',
    `# ${option === 'row' ? 'Zeilenprozente: Anteil mit Weiterbildung in jeder Gruppe der Erwerbstätigkeit' : option === 'col' ? 'Spaltenprozente: Anteil der Erwerbstätigen in jeder Gruppe der Weiterbildung' : 'Nur die Anzahlen, ohne Prozente'}`,
    'atlas %>%',
    `  crosstab(row = erwerbstaetig, col = weiterbildung, percentages = "${option}")`,
  ].join('\n'),
  check: {
    question: 'Wie viel Prozent der Erwerbstätigen haben eine Weiterbildung gemacht?',
    answer: () => 75,
    right: 'Genau, 75 %: 3 von 4 Erwerbstätigen haben eine Weiterbildung gemacht.',
    diagnose: (_option, v) => v === 'NA' ? null
      : close(v, 60) ? 'Fast! 60 % sind es unter allen fünf Personen. Gefragt ist der Anteil unter den vier Erwerbstätigen.'
      : close(v, 100) ? 'Fast! Das ist ein Spaltenprozent: Alle 3 mit Weiterbildung sind erwerbstätig. Gefragt ist die andere Richtung, 3 von 4.'
      : close(v, 25) ? 'Fast! Das ist der Anteil der Erwerbstätigen ohne Weiterbildung, 1 von 4.'
      : close(v, 3) ? 'Fast! 3 ist die Anzahl. Gefragt ist der Anteil in Prozent: 3 von 4.'
      : close(v, 0.75) ? 'Fast! Als Anteil stimmt das. In Prozent sind es 0,75 · 100.'
      : null,
  },
  think: [
    {
      question: 'Du willst wissen, ob Erwerbstätige häufiger eine Weiterbildung machen als Personen ohne Erwerb. Welche Prozente brauchst du?',
      options: ['Zeilenprozente', 'Spaltenprozente', 'Prozent von allen'], correct: 0, step: 4,
      explain: 'Die Frage vergleicht die Gruppen in den Zeilen: Erwerbstätige mit Personen ohne Erwerb. Also teilst du jede Zelle durch die Summe ihrer Zeile.',
      kurz: 'Die Gruppen, die du vergleichst, liefern den Nenner.',
    },
    {
      question: 'In einer Zelle steht 0. Ist das ein Fehler?',
      options: ['ja, die Zelle gehört weg', 'nein, die Kombination kommt nur nicht vor'], correct: 1, step: 2,
      explain: 'Die Zelle bleibt in der Tabelle. Eine 0 ist eine echte Zählung: Unter diesen fünf Personen hat niemand ohne Erwerb eine Weiterbildung gemacht.',
      kurz: 'Auch eine 0 ist ein Ergebnis.',
    },
    {
      question: 'Hier machen 75 % der Erwerbstätigen eine Weiterbildung, aber 0 % der anderen. Zeigt das einen Zusammenhang bei allen Menschen?',
      options: ['ja', 'nein'], correct: 1, step: 4,
      explain: 'Fünf Personen sind viel zu wenige; eine einzige andere Person würde die Prozente stark verschieben. Die Tabelle beschreibt nur diese fünf. Ob ein Unterschied über Zufall hinausgeht, prüft der Chi-Quadrat-Test.',
      kurz: 'Eine Kreuztabelle beschreibt, sie prüft nicht.',
    },
  ],
  genau: {
    kurz: 'Eine Kreuztabelle beschreibt, wie zwei Merkmale gemeinsam verteilt sind. Ob ein Unterschied über Zufall hinausgeht, prüft sie nicht.',
    paragraphs: [
      'Zeilenprozente sind bedingte Anteile: der Anteil mit Weiterbildung unter der Bedingung „erwerbstätig“. Dieser Anteil ist im Allgemeinen nicht derselbe wie der Anteil der Erwerbstätigen unter allen mit Weiterbildung.',
      'crosstab() aus mariposa zeigt Zellzahlen, Ränder und die gewählte Prozentbasis; percentages = "total" teilt durch alle Befragten. Ob die beiden Merkmale unabhängig sind, prüft chi_square().',
      'Metrische Spalten mit vielen verschiedenen Werten taugen nicht für eine Kreuztabelle: Fast jede Zelle wäre leer. Bilde vorher Klassen, etwa mit rec().',
    ],
  },
  picture: 'b05-kreuztabelle',
};

// ---------- Reiter ----------

const X = 'schulabschluss', Y = 'weiterbildung';
/** Zeilenprozente „Ja“ je Schulabschluss und die Randzahlen für die aktuellen Daten. */
export function abschlussNachWeiterbildung(c: SampleCtx) {
  const x = sampleColumn(c.rows, c.columns.x?.[0] ?? X), y = sampleColumn(c.rows, c.columns.y?.[0] ?? Y);
  const cats = columnById[X].categories!;
  const groups = cats.map(k => {
    const ys = y.filter((_, i) => x[i] === k.value);
    return { label: k.label, n: ys.length, ja: ys.filter(v => v === 1).length };
  });
  return { groups, n: x.length, ja: y.filter(v => v === 1).length };
}
const share = (part: number, whole: number) => whole > 0 ? part / whole * 100 : 0;

export const crosstabTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: X, y: Y },
    kurz: 'Dieselbe Tabelle mit allen 200 Befragten: Schulabschluss in den Zeilen, Weiterbildung in den Spalten, mit Zeilenprozenten.',
    value: c => { const a = abschlussNachWeiterbildung(c), g = a.groups[4]; return share(g.ja, g.n); },
    result: c => {
      const a = abschlussNachWeiterbildung(c), withShare = a.groups.filter(g => g.n > 0).map(g => ({ ...g, p: share(g.ja, g.n) }));
      const hi = withShare.reduce((b, g) => g.p > b.p ? g : b), lo = withShare.reduce((b, g) => g.p < b.p ? g : b);
      return {
        kurz: hi.p - lo.p < 0.05
          ? `In jeder Gruppe haben gleich viele eine Weiterbildung gemacht: ${num(hi.p, 1)} %.`
          : `Insgesamt haben ${num(share(a.ja, a.n), 1)} % der ${a.n} Befragten in den letzten zwölf Monaten eine Weiterbildung gemacht. Am häufigsten mit „${hi.label}“ (${num(hi.p, 1)} %), am seltensten mit „${lo.label}“ (${num(lo.p, 1)} %).`,
        fachlich: `Zeilenprozente für Weiterbildung = Ja: ${withShare.map(g => `${g.label} ${num(g.p, 1)} %`).join(', ')}.`,
        zusatz: `${a.ja} von ${a.n} Befragten haben eine Weiterbildung gemacht.`,
      };
    },
    voraussetzung: 'Jede Person hat bei beiden Fragen genau eine gültige Antwort. Die Tabelle beschreibt nur; ob die Unterschiede über Zufall hinausgehen, prüft der Chi-Quadrat-Test.',
    think: [
      {
        question: 'Angenommen, alle hätten eine Weiterbildung gemacht. Wie viel Prozent der Zeile Abitur stehen dann bei Ja?', options: ['100', '47,5', '0'], correct: 0,
        explain: 'Alle Befragten mit Abitur stehen dann in der Spalte Ja. Geteilt durch die Zeilensumme ergibt das 100 %, in jeder Zeile.',
        kurz: 'Zeilenprozente teilen durch die eigene Zeile.',
        tryIt: { label: 'alle auf Weiterbildung Ja (Code 1)', op: 'constant', column: 'y', value: 1 },
        expect: { change: 'equals', value: 100 },
      },
      {
        question: 'Der Schulabschluss wird umgepolt: Aus Abitur wird „ohne Schulabschluss“ und umgekehrt. Was passiert mit der Zahl der Befragten mit Weiterbildung?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Umpolen vertauscht nur, in welcher Zeile jemand steht. An den Weiterbildungen ändert sich nichts; die Spalte Ja behält ihre Summe.',
        kurz: 'Andere Zeilen, gleiche Spaltensummen.',
        tryIt: { label: 'Schulabschluss umpolen (4 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'same', measure: c => abschlussNachWeiterbildung(c).ja },
      },
      {
        question: 'Ja und Nein bei der Weiterbildung werden vertauscht. Was passiert mit der Zahl der Befragten mit Abitur?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die Befragten mit Abitur wechseln nur die Spalte. Die Zeilensumme bleibt, nur die Zeilenprozente drehen sich: Aus 47,5 % Ja werden 47,5 % Nein.',
        kurz: 'Andere Spalten, gleiche Zeilensummen.',
        tryIt: { label: 'Weiterbildung umpolen (1 minus Code)', op: 'reverse', column: 'y' },
        expect: { change: 'same', measure: c => abschlussNachWeiterbildung(c).groups[4].n },
      },
    ],
  },
  r: {
    entry: 'crosstab', variant: 0,
    tokens: {
      crosstab: { sym: 'crosstab()', term: T('crosstab'), kurz: 'Zählt, wie oft jede Kombination zweier Spalten vorkommt, mit Rändern und der gewählten Prozentbasis.', fehler: 'Fehlt col =, meldet mariposa: `crosstab()` needs two variables. Für eine einzelne Spalte nimmst du frequency().' },
      row: { sym: 'row =', term: 'Zeilenvariable', kurz: 'Die Spalte, deren Kategorien die Zeilen bilden. Ihre Gruppen vergleichst du mit Zeilenprozenten.', fehler: 'Vertauschst du row und col, stehen die Gruppen in den Spalten. Dann musst du Spaltenprozente lesen.' },
      col: { sym: 'col =', term: 'Spaltenvariable', kurz: 'Die Spalte, deren Kategorien die Spalten der Tabelle bilden.', fehler: 'Fehlt col =, meldet mariposa: `crosstab()` needs two variables.' },
      percentages: { sym: 'percentages =', term: 'Prozentbasis', kurz: 'Legt fest, wodurch geteilt wird: "row" durch die Zeilensumme, "col" durch die Spaltensumme, "none" gar nicht.', fehler: 'Ein deutsches Wort wie "zeile" kennt crosstab() nicht. R meldet dann: \'arg\' sollte eines von \'“row”, “none”, “col”, “total”, “all”\' sein.' },
      '"row"': { sym: '"row"', term: 'Zeilenprozente', kurz: 'Teilt jede Zelle durch ihre Zeilensumme. Jede Zeile ergibt zusammen 100 %.', fehler: 'Ohne Anführungszeichen sucht R ein Objekt namens row und meldet einen Fehler. Schreib "row" in Anführungszeichen.' },
    },
    outputMap: [
      { match: '47.5%', atlas: 'Zeilenprozent', step: 4, explain: '47,5 % der 40 Befragten mit Abitur haben eine Weiterbildung gemacht: 19 von 40.' },
      { match: '41.0%', atlas: 'Anteil an allen', explain: 'In der Zeile Total: 41 % aller 200 Befragten haben eine Weiterbildung gemacht, 82 von 200.' },
      { match: 'N (valid)', atlas: 'n', explain: 'N (valid) zählt die Befragten mit gültigen Antworten bei beiden Fragen.' },
    ],
    check: {
      question: 'Welche Zahl zeigt, wie viel Prozent der Befragten mit Abitur eine Weiterbildung gemacht haben? Tippe sie an.', correct: '47.5%',
      wrong: {
        '52.5%': 'Fast! Das sind die Befragten mit Abitur ohne Weiterbildung. Der Anteil mit Weiterbildung steht in der Spalte Ja.',
        '41.0%': 'Fast! Das ist der Anteil unter allen 200 Befragten. Gefragt ist die Zeile Abitur.',
      },
    },
  },
  next: {
    next: { id: 'expected', why: 'Was stünde in jeder Zelle, wenn die beiden Merkmale nichts miteinander zu tun hätten?' },
    before: [
      { id: 'frequency', why: 'Eine Kreuztabelle zählt wie eine Häufigkeitstabelle, nur für zwei Spalten zugleich.' },
      { id: 'nominal', why: 'Kategorien ohne Rangfolge lassen sich gut kreuzen.' },
    ],
    after: [
      { id: 'chi_square', why: 'Prüft, ob die Unterschiede zwischen den Zeilen über Zufall hinausgehen.' },
      { id: 'cramers_v', why: 'Fasst die Stärke des Zusammenhangs in einer Zahl zusammen.' },
    ],
    more: [
      { id: 'conditional_probability', why: 'Zeilenprozente sind bedingte Anteile.' },
      { id: 'phi', why: 'Das Maß für Tabellen mit zwei Zeilen und zwei Spalten.' },
    ],
  },
};
