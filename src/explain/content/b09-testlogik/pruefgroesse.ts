// Formel als Satz „Prüfgröße & Referenzverteilung“: t = (x̄ − μ₀) / (s / √n) am Beispiel der Schlafdauer gegen
// sieben Stunden. Zahlen in R nachgerechnet, siehe b09-testlogik.test.ts.
import type { ConceptTabs, SentenceTemplate } from '../../types';
import { count, close, num } from '../../format';
import { pt, qt } from '../../../tasks/kit/dist';
import { SCHLAF, outOf100, pShown, schlafTest, small } from './rechnen';

export type TValues = { d: number; s: number; n: number };
export type TStats = TValues & { root: number; se: number; t: number; df: number; p: number; c: number };

/** Startwerte: Abstand der Schlafdauer zu sieben Stunden (genau 0,0825 h), s auf zwei Stellen, 200 Befragte. */
export const T_START: TValues = { d: 0.0825, s: 0.82, n: SCHLAF.n };
/** Abstand in Stunden: unter 0,1 mit bis zu vier Nachkommastellen, damit die Rechnung mit den sichtbaren Zahlen aufgeht. */
const dText = (v: number) => Math.abs(v) < 0.1 ? num(v, 4) : num(v);

export const pruefgroesse: SentenceTemplate<TValues, TStats> = {
  concept: 'test_statistic',
  picture: 'b09-pruefgroesse',
  wofuer: `Die 200 Befragten schlafen im Schnitt ${num(SCHLAF.mean)} Stunden pro Nacht, knapp fünf Minuten mehr als die sieben Stunden der Nullhypothese. Ist das viel oder wenig? Das hängt davon ab, wie stark ein Mittelwert von Stichprobe zu Stichprobe schwankt. Die Prüfgröße t misst den Abstand genau daran.`,
  kurz: 'Die Prüfgröße t sagt dir, wie viele Standardfehler dein Ergebnis von der Nullhypothese entfernt ist. Je weiter weg von 0, desto schlechter passt es zu H₀.',
  fachlich: 'Für den t-Test einer Stichprobe ist t = (x̄ − μ₀) / (s / √n). Unter H₀ und den Annahmen des Tests folgt t einer t-Verteilung mit n − 1 Freiheitsgraden, der Referenzverteilung.',
  initial: T_START,
  compute: v => {
    const root = Math.sqrt(v.n), se = v.s / root, t = v.d / se, df = v.n - 1;
    return { ...v, root, se, t, df, p: 2 * pt(-Math.abs(t), df), c: qt(0.975, df) };
  },
  metrics: [
    { label: 'Standardfehler SE', value: s => `${small(s.se)} h` },
    { label: 'Prüfgröße t', value: s => num(s.t) },
  ],
  glyphs: [
    { key: 't', sym: 't', say: 't', term: 'Prüfgröße & Referenzverteilung', plain: 'wie viele Standardfehler das Ergebnis von H₀ entfernt ist', concept: 'test_statistic' },
    { key: 'd', sym: 'x̄ − μ₀', say: 'x quer minus mü null', term: 'Abstand zum Vergleichswert', plain: 'Mittelwert der Stichprobe minus Wert der Nullhypothese' },
    { key: 'se', sym: 'SE', say: 'S E', term: 'Standardfehler', plain: 'wie stark der Mittelwert von Stichprobe zu Stichprobe schwankt', concept: 'se' },
    { key: 's', sym: 's', say: 's', term: 'Standardabweichung', plain: 'wie verschieden die Befragten schlafen', concept: 'sd' },
    { key: 'n', sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele gültige Antworten es gibt' },
  ],
  symbolic: [{ part: ['t'], m: 't' }, ' = ', { frac: [{ part: ['x̄ − μ₀'], m: 'd' }], den: [{ part: ['s'], m: 's' }, ' / ', { big: '√', m: 'n' }, { root: [{ part: ['n'], m: 'n' }], m: 'n' }], m: 'se' }],
  aria: 't gleich x quer minus mü null, geteilt durch s durch Wurzel aus n',
  numeric: s => [{ part: ['t'], m: 't' }, ' = ', { part: [dText(s.d)], m: 'd' }, ' / (', { part: [num(s.s)], m: 's' }, ' / ', { part: [`√${count(s.n)}`], m: 'n' }, ') ≈ ',
    dText(s.d), ' / ', { part: [small(s.se)], m: 'se' }, ' ≈ ', { part: [num(s.t)], m: 't' }],
  sentence: ['Die ', { m: 't', t: 'Prüfgröße t' }, ' ist ', { m: 'd', t: 'der Abstand des Mittelwerts zum Wert der Nullhypothese' }, ', geteilt durch ', { m: 'se', t: 'den Standardfehler' }, ', also durch ', { m: 's', t: 'die Standardabweichung' }, ' geteilt durch die Wurzel aus ', { m: 'n', t: 'der Fallzahl' }, '.'],
  worked: s => {
    const shown = Number(dText(s.d).replace(',', '.').replace('−', '-')) / Number(small(s.se).replace(',', '.'));
    const exact = num(shown) === num(s.t) ? '' : `, mit allen Nachkommastellen ≈ ${num(s.t)}`;
    return [
      { title: 'Die Wurzel aus der Fallzahl ziehen', text: `√${count(s.n)} ≈ ${num(s.root)}.` },
      { title: 'Den Standardfehler ausrechnen', text: `SE = ${num(s.s)} / ${num(s.root)} ≈ ${small(s.se)} Stunden.` },
      { title: 'Den Abstand durch den Standardfehler teilen', text: `t = ${dText(s.d)} / ${small(s.se)} ≈ ${num(shown)}${exact}.` },
    ];
  },
  fehler: `Der Abstand allein sagt noch nichts. ${num(SCHLAF.mean - 7)} Stunden sind bei 200 Befragten etwa 1,4 Standardfehler, bei 20.000 Befragten wären es über 14. Erst das Teilen durch SE macht Abstände vergleichbar.`,
  sliders: [
    { key: 'd', label: 'Abstand zum Vergleichswert', min: -0.3, max: 0.3, step: 0.0025, format: v => `${v > 0 ? '+' : ''}${dText(v)} h` },
    { key: 's', label: 'Standardabweichung', min: 0.2, max: 3, step: 0.01, format: v => `${num(v)} h` },
    { key: 'n', label: 'Fallzahl', min: 10, max: 40000, step: 1, log: true, format: v => count(v) },
  ],
  quick: [
    { label: 'n mal 4', mark: 'n', apply: v => ({ ...v, n: Math.min(40000, v.n * 4) }) },
    { label: 'Abstand mal 2', mark: 'd', apply: v => ({ ...v, d: Math.max(-0.3, Math.min(0.3, v.d * 2)) }) },
    { label: 'Schlafdaten', mark: 'd', apply: () => ({ ...T_START }) },
  ],
  compare: s => `Doppelter Abstand gibt doppeltes t, viermal so viele Befragte ebenfalls. Hier: SE ≈ ${small(s.se)} h, t ≈ ${num(s.t)}.`,
  check: {
    question: 'Ein Mittelwert liegt 0,2 Stunden über dem Vergleichswert, bei s = 1 und n = 100. Wie groß ist t?',
    answer: 2, tolerance: 0.011,
    right: 'Genau, 2: SE = 1 / √100 = 0,1, und 0,2 / 0,1 = 2.',
    diagnose: v => close(v, 0.02, 0.0011) ? 'Fast! Du hast durch n geteilt. SE ist s / √n = 1 / 10 = 0,1.'
      : close(v, 0.2, 0.0011) ? 'Fast! Das ist noch der Abstand selbst. Teile ihn durch den Standardfehler 0,1.'
      : close(v, 0.5) ? 'Fast! Andersherum: Der Abstand steht oben, der Standardfehler unten.'
      : close(v, -2) ? 'Fast! Der Mittelwert liegt über dem Vergleichswert, also ist t positiv.'
      : 'Noch nicht ganz. Rechne zuerst SE = s / √n aus und teile dann den Abstand durch SE.',
  },
  interpret: s => ({
    kurz: Math.abs(s.t) < 0.005 ? 'Der Mittelwert liegt genau auf dem Vergleichswert, t ist 0. Besser kann ein Ergebnis nicht zu H₀ passen.'
      : `Der Mittelwert liegt ${num(Math.abs(s.t))} Standardfehler ${s.t > 0 ? 'über' : 'unter'} dem Vergleichswert. Ohne echten Unterschied käme so ein Abstand ${outOf100(s.p)} Stichproben vor.`,
    fachlich: `t ≈ ${num(s.t)} bei ${count(s.df)} Freiheitsgraden, zweiseitig p ${pShown(s.p)}. Die Grenze für α = 0,05 liegt bei ±${num(s.c)}; unter H₀ folgt t einer t-Verteilung mit n − 1 Freiheitsgraden.`,
  }),
  think: {
    question: 'Du willst t verdoppeln, ohne den Abstand zu ändern. Wie viele Befragte brauchst du?',
    options: ['doppelt so viele', 'viermal so viele', 'zehnmal so viele'], correct: 1, mark: 'n',
    explain: 'n steht im Standardfehler unter der Wurzel. Viermal so viele Befragte halbieren SE, und t verdoppelt sich.',
    kurz: 'Mehr Befragte machen denselben Abstand deutlicher.',
    hint: 'Probier oben „n mal 4“ aus.',
  },
  genau: {
    kurz: 't hängt vom Abstand, von der Streuung und von der Fallzahl ab. Welche Referenzverteilung passt, bestimmen Test und Modell.',
    paragraphs: [
      `R meldet für die Schlafdauer t(199) = 1.423. Mit s ≈ ${num(SCHLAF.sd)} statt 0,82 und allen Nachkommastellen kommt dieselbe Zahl heraus. In Klammern stehen die Freiheitsgrade der Referenzverteilung, hier n − 1 = 199.`,
      'Andere Tests haben andere Prüfgrößen: F in der Varianzanalyse, χ² in der Kreuztabelle, z bei großen Stichproben. Bei F und χ² zählt nur der rechte Rand, weil sie nie negativ werden.',
      'n − 1 ist kein allgemeiner Freiheitsgrad: Ein Pearson-Test hat n − 2, eine Kreuztabelle mit r Zeilen und c Spalten (r − 1)(c − 1). Mehr dazu bei den Freiheitsgraden im Modell.',
      'Unter H₀ folgt t nur dann einer t-Verteilung, wenn die Annahmen stimmen: unabhängige Befragte und ein annähernd normalverteilter Mittelwert.',
    ],
  },
};

/** Reiter: t mit allen 200, In R der Katalogaufruf t_test(schlafdauer, mu = 7), Weiter. */
export const pruefgroesseTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Prüfgröße mit allen 200 Befragten: Wie viele Standardfehler liegt ihre mittlere Schlafdauer von sieben Stunden entfernt?',
    value: c => schlafTest(c)?.t ?? null,
    result: c => {
      const r = schlafTest(c);
      if (!r) return { kurz: 'Alle Befragten schlafen gleich lange. Ohne Streuung ist der Standardfehler 0, und t lässt sich nicht berechnen.', fachlich: 'Der t-Test braucht mindestens zwei verschiedene Werte.' };
      const d = r.mean - 7;
      return {
        kurz: `Die 200 schlafen im Schnitt ${num(r.mean)} Stunden pro Nacht. Gemessen am Standardfehler von ${small(r.se)} Stunden liegt das ${num(Math.abs(r.t))} Standardfehler ${d >= 0 ? 'über' : 'unter'} sieben Stunden: t ≈ ${num(r.t)}.`,
        fachlich: `t = (x̄ − 7) / (s / √n) = (${num(r.mean, 4)} − 7) / (${num(r.sd)} / √${r.n}) ≈ ${num(r.t)} bei ${r.df} Freiheitsgraden. Die Grenze für α = 0,05, zweiseitig, liegt bei ±${num(r.c)}.`,
        zusatz: `Ein Standardfehler entspricht hier ${num(r.se * 60)} Minuten Schlaf pro Nacht.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an. Der Mittelwert soll annähernd normalverteilt sein; bei 200 Personen ist das meist erfüllt.',
    think: [
      {
        question: 'Alle schlafen 0,1 Stunden länger. Was passiert mit t?', options: ['t steigt deutlich', 't bleibt gleich', 't sinkt'], correct: 0,
        explain: 'Der Abstand zu sieben Stunden wächst um 0,1 Stunden, der Standardfehler bleibt. 0,1 Stunden sind fast zwei Standardfehler, also steigt t um gut 1,7.',
        kurz: 'Größerer Abstand, größeres t.',
        tryIt: { label: 'alle 0,1 Stunden länger', op: 'shift', column: 'x', value: 0.1 },
        expect: { change: 'up', atLeast: 1 },
      },
      {
        question: 'Alle schlafen 0,1 Stunden kürzer. Was passiert mit t?', options: ['t steigt', 't bleibt gleich', 't sinkt deutlich'], correct: 2,
        explain: 'Der Mittelwert rückt um 0,1 Stunden nach unten, der Standardfehler bleibt. t fällt um gut 1,7 Standardfehler.',
        kurz: 'Verschieben bewegt t, die Streuung nicht.',
        tryIt: { label: 'alle 0,1 Stunden kürzer', op: 'shift', column: 'x', value: -0.1 },
        expect: { change: 'down', atLeast: 1 },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 2,
    outputMap: [
      { match: 't', atlas: 'Prüfgröße t', explain: 'Der Abstand des Mittelwerts zu mu = 7, geteilt durch den Standardfehler.' },
      { match: '199', atlas: 'Freiheitsgrade n − 1', explain: 'Legt fest, mit welcher t-Verteilung R die Prüfgröße vergleicht: 200 Befragte minus 1.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Entsteht, wenn R die Prüfgröße in ihre Referenzverteilung einordnet.' },
      { match: 'N', atlas: 'n', explain: 'N steckt unter der Wurzel im Standardfehler.' },
    ],
    check: {
      question: 'Welche Zahl ist die Prüfgröße? Tippe sie an.', correct: 't',
      wrong: { 199: 'Fast! 199 sind die Freiheitsgrade, n − 1. Die Prüfgröße steht hinter dem Gleichheitszeichen.', p: 'Fast! p entsteht erst aus t und der Referenzverteilung.', N: 'Fast! N ist die Zahl der Befragten. Die Prüfgröße steht hinter t(199) =.' },
    },
  },
  next: {
    next: { id: 'null_distribution', why: 'Zeigt, welche Werte der Prüfgröße der Zufall allein liefern würde.' },
    before: [
      { id: 'hypothesis', why: 'H₀ liefert den Vergleichswert μ₀.' },
      { id: 'se', why: 'Steht im Nenner: Der Abstand wird in Standardfehlern gemessen.' },
    ],
    after: [
      { id: 'p_value', why: 'Ordnet t in die Nullverteilung ein.' },
      { id: 'critical_value', why: 'Die Grenze, ab der t gegen H₀ spricht.' },
    ],
    more: [
      { id: 'general_df', why: 'Die Zahl in Klammern hinter t.' },
      { id: 't_distribution', why: 'Die Referenzverteilung des t-Tests.' },
    ],
  },
};
