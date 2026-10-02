// Formel als Satz „Skalierung durch Division“ (Begriff `scaling`): Lernzeit in sieben Tagen durch einen Maßstab a teilen,
// etwa durch 7 für Stunden pro Tag. Vorbild src/explain/content/standardfehler.ts, Ton nach streuung.ts.
// Zahlen in R nachgerechnet, siehe b04-umformen.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { num, close } from '../../format';
import { eq } from './shared';
import { columnStats } from './shared';

/** Lernzeit der 200 Befragten (Stunden in den letzten sieben Tagen): Mittelwert, Standardabweichung, Varianz wie in R. */
export const LERNZEIT = { mean: 7.7515, sd: 3.237515, variance: 10.481505 } as const;
const L = LERNZEIT;

export type ScaleValues = { x: number; a: number };
export type ScaleStats = ScaleValues & { xs: number; meanS: number; sdS: number; varS: number };

/** Welcher Maßstab gerade gilt, in Worten: pro Tag, in Standardabweichungen, unverändert oder allgemein. */
const isDay = (a: number) => Math.abs(a - 7) < 1e-9, isSd = (a: number) => Math.abs(a - L.sd) < 1e-6, isOne = (a: number) => Math.abs(a - 1) < 1e-9;
const aText = (a: number) => isDay(a) ? 'a = 7: Die Woche hat sieben Tage. Aus Stunden in sieben Tagen werden Stunden pro Tag.'
  : isSd(a) ? `a = s ≈ ${num(L.sd)}: Gemessen wird jetzt in Standardabweichungen.`
  : isOne(a) ? 'a = 1: Teilen durch 1 ändert nichts.'
  : `a = ${num(a)}: Jede Zahl wird durch ${num(a)} geteilt${a < 1 ? '. Weil a kleiner als 1 ist, werden die Zahlen dabei größer' : ''}.`;

export const skalieren: SentenceTemplate<ScaleValues, ScaleStats> = {
  concept: 'scaling',
  picture: 'b04-skalieren',
  wofuer: 'Im Lehrdatensatz steht, wie viele Stunden jemand in den letzten sieben Tagen gelernt hat. Wie viel ist das pro Tag? Du teilst jede Lernzeit durch 7. Was passiert dabei mit der Mitte, mit der Streuung und mit der Reihenfolge der Befragten?',
  kurz: 'Skalieren heißt: alle Werte durch dieselbe Zahl teilen. Mitte und Streuung ändern sich im selben Verhältnis, die Reihenfolge bleibt.',
  fachlich: 'Skalierung durch Division: x*ᵢ = xᵢ / a mit einem festen a > 0. Mittelwert und Standardabweichung werden ebenfalls durch a geteilt, die Varianz durch a²; die Rangfolge bleibt erhalten.',
  initial: { x: 8.3, a: 7 },
  compute: v => ({ ...v, xs: v.x / v.a, meanS: L.mean / v.a, sdS: L.sd / v.a, varS: L.variance / (v.a * v.a) }),
  metrics: [
    { label: 'neuer Wert x*ᵢ', value: s => num(s.xs) },
    { label: 'neue Mitte x̄ / a', value: s => num(s.meanS) },
    { label: 'neue Streuung s / a', value: s => num(s.sdS) },
  ],
  glyphs: [
    { key: 'xs', sym: 'x*ᵢ', say: 'x Stern i', term: 'Skalierung durch Division', plain: 'der neue Wert von Person i', concept: 'scaling' },
    { key: 'x', sym: 'xᵢ', say: 'x i', term: 'Datenreihe', plain: 'die Lernzeit von Person i in Stunden', concept: 'series' },
    { key: 'a', sym: 'a', say: 'a', term: 'Maßstab', plain: 'die Zahl, durch die alle Werte geteilt werden; sie ist größer als 0' },
    { key: 'mean', sym: 'x̄', say: 'x quer', term: 'Arithmetisches Mittel', plain: 'die Mitte der 200 Lernzeiten', concept: 'mean' },
    { key: 'sd', sym: 's', say: 's', term: 'Standardabweichung', plain: 'die Streuung der 200 Lernzeiten', concept: 'sd' },
  ],
  symbolic: [{ part: ['x*', { sub: 'i' }], m: 'xs' }, ' = ', { frac: [{ part: ['x', { sub: 'i' }], m: 'x' }], den: [{ part: ['a'], m: 'a' }], m: 'a' }],
  aria: 'x Stern i gleich x i geteilt durch a',
  numeric: s => [
    { part: ['x*'], m: 'xs' }, ' = ', { part: [num(s.x)], m: 'x' }, ' / ', { part: [num(s.a)], m: 'a' }, ` ${eq(s.xs)} ${num(s.xs)}`, { br: true },
    'x̄ / a = ', { part: [num(L.mean)], m: 'mean' }, ' / ', { part: [num(s.a)], m: 'a' }, ` ≈ ${num(s.meanS)}`, { br: true },
    's / a = ', { part: [num(L.sd)], m: 'sd' }, ' / ', { part: [num(s.a)], m: 'a' }, ` ≈ ${num(s.sdS)}`,
  ],
  sentence: ['Der ', { m: 'xs', t: 'neue Wert' }, ' ist ', { m: 'x', t: 'der alte Wert' }, ' geteilt durch ', { m: 'a', t: 'den Maßstab a' }, '. Genauso teilen sich ', { m: 'mean', t: 'die Mitte' }, ' und ', { m: 'sd', t: 'die Streuung' }, ' durch a.'],
  worked: s => [
    { title: 'Den Maßstab wählen', text: aText(s.a) },
    { title: 'Den Wert teilen', text: `${num(s.x)} / ${num(s.a)} ${eq(s.xs)} ${num(s.xs)}.` },
    { title: 'Mitte und Streuung mitteilen', text: `Mitte ${num(L.mean)} / ${num(s.a)} ≈ ${num(s.meanS)}, Streuung ${num(L.sd)} / ${num(s.a)} ≈ ${num(s.sdS)}. Die Reihenfolge der Befragten bleibt dieselbe.` },
  ],
  fehler: 'Skalieren verschiebt die Mitte nicht auf 0. Dafür musst du vorher die Mitte abziehen; erst beides zusammen ergibt z-Werte.',
  sliders: [
    { key: 'x', label: 'Lernzeit einer Person in sieben Tagen', min: 0, max: 40, step: 0.1, format: v => `${num(v)} h` },
    { key: 'a', label: 'Maßstab a', min: 0.5, max: 14, step: 0.01, format: v => num(v) },
  ],
  quick: [
    { label: 'pro Tag: a = 7', mark: 'a', apply: v => ({ ...v, a: 7 }) },
    { label: 'in Standardabweichungen: a = s', mark: 'a', apply: v => ({ ...v, a: L.sd }) },
    { label: 'a verdoppeln', mark: 'a', apply: v => ({ ...v, a: Math.min(14, 2 * v.a) }) },
  ],
  compare: s => `Vorher liegt die Mitte bei ${num(L.mean)} h, nachher bei ${num(s.meanS)}. Jeder Wert, die Mitte und die Streuung werden durch dieselbe Zahl ${num(s.a)} geteilt.`,
  check: {
    question: 'Du teilst alle Lernzeiten durch a = 2. Vorher war s = 3 Stunden. Wie groß ist s danach?',
    answer: 1.5, tolerance: 0.011,
    right: 'Genau, 1,5: 3 / 2 = 1,5. Die Streuung schrumpft im selben Verhältnis wie die Werte.',
    diagnose: v => close(v, 3) ? 'Fast! Das ist das alte s. Teilen verschiebt nicht nur, es staucht: Auch s wird durch 2 geteilt.'
      : close(v, 0.75) ? 'Fast! Du hast zweimal durch 2 geteilt. Das gilt für die Varianz s², nicht für s.'
      : close(v, 6) ? 'Fast! Du hast malgenommen. Geteilt wird durch 2.'
      : close(v, 1) ? 'Fast! Du hast 2 abgezogen. Abziehen ändert die Streuung gar nicht; erst das Teilen macht sie kleiner.'
      : 'Noch nicht ganz. Teile die alte Standardabweichung durch 2.',
  },
  interpret: s => ({
    kurz: isDay(s.a)
      ? `Bei a = 7 rechnest du Stunden in sieben Tagen in Stunden pro Tag um. Eine Person mit ${num(s.x)} Stunden lernt etwa ${num(s.xs)} Stunden pro Tag.`
      : `Teilst du durch ${num(s.a)}, wird aus ${num(s.x)} der Wert ${num(s.xs)}. Mitte und Streuung werden im selben Verhältnis ${s.a > 1 + 1e-9 ? 'kleiner' : s.a < 1 - 1e-9 ? 'größer' : 'gar nicht verändert'}, die Reihenfolge bleibt.`,
    fachlich: `x*ᵢ = xᵢ / a mit a = ${num(s.a)}: x̄ / a ≈ ${num(s.meanS)}, s / a ≈ ${num(s.sdS)}, s² / a² ≈ ${num(s.varS)}. Die Mitte liegt danach nicht bei 0.`,
  }),
  think: {
    question: `Du teilst alle Lernzeiten durch ihre Standardabweichung s ≈ ${num(L.sd)}. Wo liegt danach die Mitte?`,
    options: ['bei 0', `bei ${num(L.mean)} / ${num(L.sd)}, also etwa ${num(L.mean / L.sd)}`, 'bei 1'], correct: 1, mark: 'mean',
    explain: `Teilen verschiebt nichts auf 0: ${num(L.mean)} / ${num(L.sd)} ≈ ${num(L.mean / L.sd)}. Die Streuung ist danach 1, die Mitte aber nicht 0. Erst wenn du vorher zentrierst, entstehen z-Werte.`,
    kurz: 'Skalieren allein ergibt noch keine z-Werte.',
    hint: 'Probier oben „in Standardabweichungen: a = s“ aus.',
  },
  genau: {
    kurz: 'Teilen durch a teilt Mittelwert und Standardabweichung durch a, die Varianz durch a². Die Form der Verteilung und die Reihenfolge bleiben.',
    paragraphs: [
      'Für die z-Standardisierung ist der Maßstab die Standardabweichung. Man zieht zuerst die Mitte ab und teilt dann durch s; skaliert werden also die zentrierten Werte.',
      `Die Varianz trägt die quadrierte Einheit und schrumpft deshalb um a². Pro Tag statt in sieben Tagen: ${num(L.variance)} / 49 ≈ ${num(L.variance / 49)} h².`,
      'Der Maßstab muss größer als 0 sein. Mit einer negativen Zahl drehte sich zusätzlich die Reihenfolge um, und durch 0 kann man nicht teilen.',
      'Schiefe, Ränge und Korrelationen mit anderen Spalten ändern sich beim Skalieren nicht. Nur die Einheit ändert sich.',
    ],
  },
};

/** Lernzeit pro Tag (geteilt durch 7) für die aktuellen Daten: Mittelwert, Streuung, Varianz und die längste Lernzeit. */
export function proTag(c: SampleCtx) {
  const st = columnStats(c, c.columns.x?.[0] ?? 'lernzeit');
  let top = 0;
  st.xs.forEach((v, i) => { if (v > st.xs[top]) top = i; });
  return { ...st, top, day: st.mean / 7, sdDay: st.sd / 7, varDay: st.variance / 49 };
}

export const tabsScaling: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Umrechnung für alle 200 Befragten: die Lernzeit in sieben Tagen geteilt durch 7 ergibt Stunden pro Tag.',
    value: c => proTag(c).day,
    result: c => {
      const t = proTag(c);
      return {
        kurz: `Pro Tag lernen die ${t.n} Befragten im Schnitt ${num(t.day)} Stunden. Die Streuung schrumpft im selben Verhältnis: von ${num(t.sd)} auf ${num(t.sdDay)} Stunden.`,
        fachlich: `x̄ / 7 = ${num(t.mean)} / 7 ≈ ${num(t.day)} h; s / 7 = ${num(t.sd)} / 7 ≈ ${num(t.sdDay)} h. Die Varianz schrumpft auf ein Neunundvierzigstel: ${num(t.variance)} / 49 ≈ ${num(t.varDay)} h².`,
        zusatz: `Die Reihenfolge bleibt: Wer in sieben Tagen am meisten lernt (${c.rows[t.top].id}, ${num(t.xs[t.top])} h), lernt auch pro Tag am meisten (${num(t.xs[t.top] / 7)} h).`,
      };
    },
    voraussetzung: 'Teilen setzt einen festen Maßstab größer als 0 voraus. Hier ist es 7, die Zahl der Tage.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der mittleren Lernzeit pro Tag?', options: ['bleibt gleich', 'verdoppelt sich', 'steigt um 2 Stunden'], correct: 1,
        explain: 'Jede Lernzeit verdoppelt sich, geteilt durch 7 auch. Teilen und Malnehmen vertragen sich: 2 · x / 7 = 2 · (x / 7).',
        kurz: 'Malnehmen wirkt auf die skalierten Werte genauso.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Alle lernen sieben Stunden mehr in den sieben Tagen. Was passiert mit der mittleren Lernzeit pro Tag?', options: ['steigt um 7 Stunden', 'steigt um 1 Stunde', 'bleibt gleich'], correct: 1,
        explain: 'Sieben Stunden mehr in sieben Tagen sind eine Stunde mehr pro Tag. Auch eine Verschiebung wird mitgeteilt: (x + 7) / 7 = x / 7 + 1.',
        kurz: 'Verschiebungen werden mit durch a geteilt.',
        tryIt: { label: 'alle sieben Stunden mehr', op: 'shift', column: 'x', value: 7 },
        expect: { change: 'plus', amount: 1 },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden in sieben Tagen. Wie stark ändert sich die mittlere Lernzeit pro Tag?', options: ['steigt um höchstens 0,03 Stunden', 'steigt um etwa 4,5 Stunden', 'bleibt gleich'], correct: 0,
        explain: 'Ihr eigener Wert pro Tag steigt um mehrere Stunden. Im Mittelwert der 200 zählt das nur ein Zweihundertstel: höchstens 40 / 7 / 200 ≈ 0,03 Stunden.',
        kurz: 'Bei 200 Personen fällt ein einzelner Wert wenig ins Gewicht, auch skaliert.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up', atMost: 0.03 },
      },
    ],
  },
  next: {
    next: { id: 'z', why: 'Erst zentrieren, dann durch s teilen: So entstehen Werte mit Mitte 0 und Streuung 1.' },
    before: [
      { id: 'divide', why: 'Jeder Wert wird durch dieselbe Zahl geteilt.' },
      { id: 'series', why: 'Die Werte, die umgerechnet werden.' },
    ],
    after: [
      { id: 'pomps', why: 'Rechnet Antworten so um, dass die Skala von 0 bis 100 reicht: abziehen, teilen, mal 100.' },
    ],
    more: [
      { id: 'centering', why: 'Verschiebt statt zu teilen: Die Mitte wandert auf 0.' },
      { id: 'sd', why: 'Wird durch dieselbe Zahl geteilt wie die Werte.' },
    ],
  },
};
