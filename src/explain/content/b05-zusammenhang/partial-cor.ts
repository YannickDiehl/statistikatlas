// Formel als Satz „Partielle Korrelation“ mit einer Kontrollvariable: (rXY − rXZ · rYZ) / √((1 − rXZ²)(1 − rYZ²)).
// Beispiel aus dem Lehrdatensatz: Lernplanung (x) und Wissenstest (y), kontrolliert für die Lernzeit (z).
// In R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, num, paren } from '../../format';
import { sampleColumn, sampleColumnInfo } from '../../sample';
import { relate } from '../../math';
import { T } from './shared';

/** Lehrdatensatz, auf zwei Stellen gerundet: r(Lernplanung, Wissenstest), r(Lernplanung, Lernzeit), r(Wissenstest, Lernzeit). */
export const PLAN_TEST_ZEIT = { rXY: 0.16, rXZ: 0.34, rYZ: 0.54 } as const;

export type PcValues = { rXY: number; rXZ: number; rYZ: number };
export type PcStats = PcValues & { prod: number; numer: number; den: number; partial: number | null; det: number; valid: boolean };

/** Kleine Zahlen mit drei Nachkommastellen (zwei gültige Ziffern), sonst zwei. */
const sig = (v: number) => num(v, Math.abs(v) < 0.1 && Math.abs(v) >= 0.0005 ? 3 : 2);

export function partialOf(rxy: number, rxz: number, ryz: number): number | null {
  const den = Math.sqrt((1 - rxz * rxz) * (1 - ryz * ryz));
  return den > 1e-12 ? (rxy - rxz * ryz) / den : null;
}

/** Wie sich die Kontrolle auswirkt, aus den Beträgen (nicht aus den Variablennamen). */
const change = (before: number, after: number) => Math.abs(after) < Math.abs(before) - 0.05 ? 'wird der Zusammenhang schwächer' : Math.abs(after) > Math.abs(before) + 0.05 ? 'wird er stärker' : 'bleibt er etwa so stark';

export const partielleKorrelation: SentenceTemplate<PcValues, PcStats> = {
  concept: 'partial_cor',
  wofuer: 'Wer feste Lernzeiten plant, löst im Wissenstest etwas mehr Aufgaben: Im Lehrdatensatz hängen Lernplanung und Wissenstest mit r ≈ 0,16 zusammen. Aber wer plant, lernt auch mehr, und wer mehr lernt, löst mehr. Bleibt ein Zusammenhang, wenn man die Lernzeit herausrechnet?',
  kurz: 'Die partielle Korrelation sagt dir, wie stark zwei Merkmale zusammenhängen, wenn man ein drittes herausrechnet. So siehst du, ob ein Zusammenhang nur über das dritte Merkmal läuft.',
  fachlich: 'Die partielle Korrelation ist die Korrelation von x und y, nachdem eine dritte Variable aus beiden linear herausgerechnet ist. Sie ist die Korrelation der Residuen beider Variablen.',
  initial: { ...PLAN_TEST_ZEIT },
  compute: v => {
    const prod = v.rXZ * v.rYZ, numer = v.rXY - prod, den = Math.sqrt((1 - v.rXZ ** 2) * (1 - v.rYZ ** 2));
    const det = 1 + 2 * v.rXY * v.rXZ * v.rYZ - v.rXY ** 2 - v.rXZ ** 2 - v.rYZ ** 2, valid = det >= -1e-9 && den > 1e-12;
    return { ...v, prod, numer, den, det, valid, partial: valid ? numer / den : null };
  },
  metrics: [
    { label: 'ohne Kontrolle rXY', value: s => num(s.rXY) },
    { label: 'kontrolliert rXY|Z', value: s => s.partial === null ? 'nicht möglich' : num(s.partial) },
  ],
  glyphs: [
    { key: 'partial', sym: 'rXY|Z', say: 'r X Y, kontrolliert für Z', term: 'Partielle Korrelation', plain: 'der Zusammenhang von x und y, wenn z herausgerechnet ist', concept: 'partial_cor' },
    { key: 'rXY', sym: 'rXY', say: 'r X Y', term: 'Pearson-Korrelation', plain: 'Lernplanung und Wissenstest, ohne Kontrolle', concept: 'pearson' },
    { key: 'rXZ', sym: 'rXZ', say: 'r X Z', term: 'Pearson-Korrelation', plain: 'Lernplanung und Lernzeit', concept: 'pearson' },
    { key: 'rYZ', sym: 'rYZ', say: 'r Y Z', term: 'Pearson-Korrelation', plain: 'Wissenstest und Lernzeit', concept: 'pearson' },
    { key: 'rest', sym: '√((1 − rXZ²)(1 − rYZ²))', say: 'Wurzel aus eins minus r X Z Quadrat, mal eins minus r Y Z Quadrat', term: 'Was ohne z übrig bleibt', plain: 'wie viel von x und von y nicht mit z zusammenhängt' },
  ],
  symbolic: [{ part: ['rXY|Z'], m: 'partial' }, ' = ', { frac: [{ part: ['rXY'], m: 'rXY' }, ' − ', { part: ['rXZ'], m: 'rXZ' }, ' · ', { part: ['rYZ'], m: 'rYZ' }],
    den: [{ big: '√', m: 'rest' }, { root: [{ part: ['(1 − rXZ²)(1 − rYZ²)'], m: 'rest' }], m: 'rest' }], m: 'partial' }],
  aria: 'r X Y kontrolliert für Z gleich: r X Y minus r X Z mal r Y Z, geteilt durch die Wurzel aus eins minus r X Z Quadrat, mal eins minus r Y Z Quadrat',
  numeric: s => [{ part: ['rXY|Z'], m: 'partial' }, ' = (', { part: [num(s.rXY)], m: 'rXY' }, ' − ', { part: [paren(s.rXZ)], m: 'rXZ' }, ' · ', { part: [paren(s.rYZ)], m: 'rYZ' }, ') / ',
    { part: [`√((1 − ${paren(s.rXZ)}²) · (1 − ${paren(s.rYZ)}²))`], m: 'rest' },
    s.partial === null ? ': Diese drei Korrelationen passen nicht zusammen.' : ` = ${sig(s.numer)} / ${num(s.den)} ≈ ${num(s.partial)}`],
  sentence: ['Die ', { m: 'partial', t: 'partielle Korrelation' }, ' nimmt ', { m: 'rXY', t: 'den Zusammenhang von x und y' }, ', zieht den Teil ab, der über z läuft, ', { m: 'rXZ', t: 'r von x und z' }, ' mal ', { m: 'rYZ', t: 'r von y und z' }, ', und teilt durch ', { m: 'rest', t: 'das, was ohne z übrig bleibt' }, '.'],
  worked: s => s.valid ? [
    { title: 'Den Teil über z abziehen', text: `${num(s.rXY)} − ${paren(s.rXZ)} · ${paren(s.rYZ)} ${Math.abs(Number(sig(s.numer).replace('−', '-').replace(',', '.')) - s.numer) > 1e-9 ? '≈' : '='} ${sig(s.numer)}.` },
    { title: 'Den Rest ohne z berechnen', text: `√((1 − ${paren(s.rXZ)}²) · (1 − ${paren(s.rYZ)}²)) ≈ ${num(s.den)}.` },
    { title: 'Teilen', text: `${sig(s.numer)} / ${num(s.den)} ≈ ${num(s.partial!)}.` },
  ] : [{ title: 'Die drei Zahlen prüfen', text: 'Diese drei Korrelationen passen nicht zusammen. So ein Muster kann es in echten Daten nicht geben.' }],
  fehler: 'Herausrechnen heißt nicht erklären: Verschwindet ein Zusammenhang nach der Kontrolle, ist damit nicht gezeigt, dass z die Ursache ist. Und kontrolliert wird nur der gerade, lineare Teil von z.',
  sliders: [
    { key: 'rXY', label: 'r von x und y (Lernplanung und Wissenstest)', min: -0.95, max: 0.95, step: 0.01, format: v => num(v) },
    { key: 'rXZ', label: 'r von x und z (Lernplanung und Lernzeit)', min: -0.95, max: 0.95, step: 0.01, format: v => num(v) },
    { key: 'rYZ', label: 'r von y und z (Wissenstest und Lernzeit)', min: -0.95, max: 0.95, step: 0.01, format: v => num(v) },
  ],
  quick: [
    { label: 'z hängt mit nichts zusammen', mark: 'rXZ', apply: v => ({ ...v, rXZ: 0, rYZ: 0 }) },
    { label: 'Zusammenhang läuft ganz über z', mark: 'rYZ', apply: v => ({ ...v, rXZ: 0.8, rYZ: 0.8, rXY: 0.64 }) },
    { label: 'Lehrdatensatz', mark: 'partial', apply: () => ({ ...PLAN_TEST_ZEIT }) },
  ],
  compare: s => s.partial === null ? 'Diese drei Korrelationen passen nicht zusammen; probier andere Werte.'
    : `Ohne Kontrolle ist r = ${num(s.rXY)}, mit Kontrolle für z ${num(s.partial)}: Mit z herausgerechnet ${change(s.rXY, s.partial)}.`,
  check: {
    question: 'rXY = 0,5, rXZ = 0,5 und rYZ = 0,5. Wie groß ist die partielle Korrelation von x und y, kontrolliert für z?',
    answer: 1 / 3, tolerance: 0.011,
    right: 'Genau, etwa 0,33: (0,5 − 0,25) / √(0,75 · 0,75) = 0,25 / 0,75.',
    diagnose: v => close(v, -1 / 3, 0.011) ? 'Fast! Andersherum: rXY minus rXZ mal rYZ, nicht umgekehrt.'
      : close(v, 0.25, 0.011) ? 'Fast! Das ist erst der Zähler. Teile ihn noch durch √(0,75 · 0,75) = 0,75.'
      : close(v, 0.5, 0.011) ? 'Fast! Das ist noch r ohne Kontrolle. Zieh den Teil über z ab: 0,5 · 0,5.'
      : close(v, 0.25 / 0.5625, 0.011) ? 'Fast! Du hast die Wurzel vergessen. Geteilt wird durch √(0,75 · 0,75) = 0,75, nicht durch 0,5625.'
      : 'Noch nicht ganz. Rechne erst den Zähler rXY − rXZ · rYZ, dann teile durch √((1 − rXZ²)(1 − rYZ²)).',
  },
  interpret: s => s.partial === null ? {
    kurz: 'Diese drei Korrelationen passen nicht zusammen. In echten Daten kann es dieses Muster nicht geben.',
    fachlich: 'Die Korrelationsmatrix aus rXY, rXZ und rYZ wäre nicht positiv semidefinit; eine partielle Korrelation gibt es dafür nicht.',
  } : {
    kurz: `Ohne Kontrolle hängen Lernplanung und Wissenstest mit r = ${num(s.rXY)} zusammen. Rechnet man die Lernzeit heraus, ${change(s.rXY, s.partial)}: r = ${num(s.partial)}.`,
    fachlich: `rXY|Z = (${num(s.rXY)} − ${paren(s.rXZ)} · ${paren(s.rYZ)}) / √((1 − ${paren(s.rXZ)}²)(1 − ${paren(s.rYZ)}²)) ≈ ${num(s.partial)}. Das ist die Korrelation dessen, was von x und y übrig bleibt, wenn z jeweils linear herausgerechnet ist.`,
  },
  think: {
    question: 'Die Lernzeit hängt weder mit der Lernplanung noch mit dem Wissenstest zusammen (rXZ = rYZ = 0). Was passiert beim Kontrollieren?',
    options: ['nichts, rXY|Z = rXY', 'der Zusammenhang verschwindet', 'er verdoppelt sich'], correct: 0, mark: 'rXZ',
    explain: 'Mit rXZ = 0 wird nichts abgezogen, und der Nenner ist √(1 · 1) = 1. Eine Kontrollvariable, die mit keinem der beiden zusammenhängt, ändert nichts.',
    kurz: 'Kontrollieren ändert nur etwas, wenn z mit x oder y zusammenhängt.',
    hint: 'Probier oben „z hängt mit nichts zusammen“ aus.',
  },
  genau: {
    kurz: 'Die partielle Korrelation ist die Korrelation der Residuen von x und y, nachdem z jeweils linear herausgerechnet wurde. Eine Ursache stellt sie nicht fest.',
    paragraphs: [
      'Rechne zwei Regressionen: x auf z und y auf z. Die Residuen sind das, was z nicht erklärt. Ihre Pearson-Korrelation ist rXY|Z; im Lehrdatensatz −0,03, genau wie mit der Formel.',
      'Im Lehrdatensatz hängen Lernplanung und Wissenstest mit r ≈ 0,16 zusammen, mit der Lernzeit herausgerechnet mit r ≈ −0,03. Der Zusammenhang läuft also fast ganz über die Lernzeit. Eine Ursache ist damit nicht gezeigt.',
      'Mit mehreren Kontrollvariablen rechnet partial_cor() über die Inverse der Korrelationsmatrix; die Freiheitsgrade sind n − k − 2. Gerechnet wird immer listenweise über alle Variablen.',
      'Kontrolliert wird nur linear. Hängt z gekrümmt mit x oder y zusammen, bleibt ein Teil davon in den Residuen.',
    ],
  },
};

// ---------- Reiter ----------

const COLS = { x: 'lernplanung5', y: 'wissenstest', z: 'lernzeit' };
/** Die drei Korrelationen und die partielle Korrelation für die aktuellen Daten. */
export function partialData(c: SampleCtx) {
  const id = (role: 'x' | 'y' | 'z') => c.columns[role]?.[0] ?? COLS[role];
  const v = (role: 'x' | 'y' | 'z') => sampleColumn(c.rows, id(role));
  const rxy = relate(v('x'), v('y')).r, rxz = relate(v('x'), v('z')).r, ryz = relate(v('y'), v('z')).r;
  return { rxy, rxz, ryz, partial: rxy === null || rxz === null || ryz === null ? null : partialOf(rxy, rxz, ryz), titles: { x: sampleColumnInfo(id('x')).title, y: sampleColumnInfo(id('y')).title, z: sampleColumnInfo(id('z')).title } };
}

export const partialTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...COLS },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Lernplanung und Wissenstest, kontrolliert für die Lernzeit.',
    value: c => partialData(c).partial,
    result: c => {
      const p = partialData(c), t = p.titles;
      if (p.partial === null || p.rxy === null) return { kurz: 'Eine der drei Spalten streut nicht. Dann lässt sich keine partielle Korrelation berechnen.', fachlich: 'Eine Korrelation ist nicht definiert oder z erklärt x oder y vollständig.' };
      return {
        kurz: `Ohne Kontrolle hängen „${t.x}“ und „${t.y}“ mit r ≈ ${num(p.rxy)} zusammen. Mit „${t.z}“ herausgerechnet ${change(p.rxy, p.partial)}: r ≈ ${num(p.partial)}.`,
        fachlich: `rXY ≈ ${num(p.rxy)}, rXZ ≈ ${num(p.rxz!)}, rYZ ≈ ${num(p.ryz!)}; rXY|Z = (rXY − rXZ · rYZ) / √((1 − rXZ²)(1 − rYZ²)) ≈ ${num(p.partial)}.`,
        zusatz: 'Das Vorzeichen der partiellen Korrelation zeigt die Richtung des Zusammenhangs, der ohne z übrig bleibt.',
      };
    },
    voraussetzung: 'Kontrolliert wird nur der lineare Teil von z. Die Lernplanung wird dabei mit gleich großen Abständen zwischen den Stufen behandelt.',
    think: [
      {
        question: 'Die Lernplanung wird umgepolt: Aus „Stimme voll und ganz zu“ wird „Stimme überhaupt nicht zu“. Was passiert mit der partiellen Korrelation?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'rXY und rXZ wechseln beide das Vorzeichen, rYZ bleibt. Damit dreht sich der Zähler rXY − rXZ · rYZ, der Nenner bleibt gleich.',
        kurz: 'Umpolen dreht die Richtung, nicht die Stärke.',
        tryIt: { label: 'Lernplanung umpolen (6 minus Antwort)', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
      {
        question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was passiert mit der partiellen Korrelation?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'verdoppelt sich'], correct: 1,
        explain: 'Jetzt wechseln rXY und rYZ das Vorzeichen. Der Zähler dreht sich wieder, der Nenner bleibt: Die partielle Korrelation behält ihren Betrag.',
        kurz: 'Es ist gleich, welche der beiden Spalten du umpolst.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'partial_cor', variant: 0,
    tokens: {
      partial_cor: { sym: 'partial_cor()', term: T('partial_cor'), kurz: 'Berechnet die partielle Korrelation zweier Spalten, kontrolliert für die Spalten in controls, und zum Vergleich r ohne Kontrolle.', fehler: 'Ohne controls meldet mariposa: `controls` must specify at least one control variable.' },
      controls: { sym: 'controls =', term: 'Kontrollvariablen', kurz: 'Die Spalten, die herausgerechnet werden. Mehrere stehen in c( ).', fehler: 'Fehlt controls, meldet mariposa: `controls` must specify at least one control variable. Für r ohne Kontrolle nimmst du pearson_cor().' },
    },
    outputMap: [
      { match: 'partial r', atlas: 'rXY|Z', explain: 'Lernzeit und Wissenstest hängen mit r = 0,53 zusammen, wenn Alter und Schlafdauer herausgerechnet sind.' },
      { match: 'zero-order r', atlas: 'rXY', explain: 'zero-order heißt: ohne Kontrolle. 0,54 ist Pearson-r von Lernzeit und Wissenstest; die Kontrolle ändert hier kaum etwas.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es nach der Kontrolle keinen Zusammenhang, käme ein so großes partielles r in weniger als 1 von 1.000 Stichproben vor.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten mit gültigen Werten in allen vier Spalten.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist die partielle Korrelation? Tippe sie an.', correct: 'partial r',
      wrong: { 'zero-order r': 'Fast! Das ist r ohne Kontrolle. Die partielle Korrelation steht hinter partial r =.', N: 'Fast! Das ist die Zahl der Befragten. Die partielle Korrelation steht hinter partial r =.' },
    },
  },
  next: {
    next: { id: 'confounding', why: 'Wann ein Zusammenhang über ein drittes Merkmal läuft, und warum Kontrollieren allein keine Ursache zeigt.' },
    before: [
      { id: 'pearson', why: 'Die drei Korrelationen, aus denen die partielle entsteht.' },
      { id: 'residuals', why: 'Partiell heißt: die Residuen von x und y korrelieren.' },
    ],
    after: [{ id: 'linear_regression', why: 'Mit mehreren erklärenden Variablen kontrolliert auch die Regression für die übrigen.' }],
    more: [
      { id: 'causality', why: 'Was eine Kontrolle zeigen kann und was nicht.' },
      { id: 'correlation_matrix', why: 'Mit mehreren Kontrollvariablen rechnet R über die Korrelationsmatrix.' },
    ],
  },
};
