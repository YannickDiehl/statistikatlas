// Formel als Satz „Teststärke“: 1 − β ≈ Φ(d · √(n/2) − z₁₋α/₂) für zwei Gruppen mit je n Personen, grob mit der
// Normalverteilung. Beispiel: eine Stunde Lernzeit (d ≈ 0,3) bei 100 Personen je Gruppe. Zahlen in R, siehe b09-testlogik.test.ts.
import type { ConceptTabs, SentenceTemplate } from '../../types';
import { close, count, num } from '../../format';
import { pnorm, qnorm } from '../../../tasks/kit/dist';
import { gruppenTest } from './rechnen';
import { betaFor } from './fehlerarten';

export type PValues = { d: number; n: number; alpha: number };
export type PStats = PValues & { delta: number; z: number; gap: number; power: number; beta: number };

/** Wie oft der Test den Unterschied findet, als Satzteil („in etwa 56 von 100 Studien“, „fast immer“). */
function found(power: number): string {
  const k = Math.round(power * 100);
  return k >= 100 ? 'fast immer' : k < 1 ? 'in weniger als 1 von 100 Studien' : `in etwa ${k} von 100 Studien`;
}

export const teststaerke: SentenceTemplate<PValues, PStats> = {
  concept: 'power',
  picture: 'b09-teststaerke',
  wofuer: 'Du planst eine eigene Befragung: Lernen Menschen mit Weiterbildung mehr? Einen Unterschied von einer Stunde pro Woche fändest du wichtig. Wie viele Befragte brauchst du, damit der Test so einen Unterschied auch findet?',
  kurz: 'Die Teststärke sagt dir, wie oft ein Test einen echten Unterschied einer bestimmten Größe findet. Mehr Befragte und größere Unterschiede machen sie größer.',
  fachlich: 'Die Wahrscheinlichkeit, H₀ zu verwerfen, wenn eine bestimmte Alternative gilt: 1 − β. Für zwei Gruppen mit je n Personen gilt grob 1 − β ≈ Φ(d · √(n/2) − z₁₋α/₂).',
  initial: { d: 0.3, n: 100, alpha: 0.05 },
  compute: v => {
    const delta = v.d * Math.sqrt(v.n / 2), z = qnorm(1 - v.alpha / 2), power = pnorm(delta - z) + pnorm(-delta - z);
    return { ...v, delta, z, gap: delta - z, power, beta: 1 - power };
  },
  metrics: [
    { label: 'erwartete Prüfgröße', value: s => num(s.delta) },
    { label: 'Teststärke 1 − β', value: s => num(s.power) },
  ],
  glyphs: [
    { key: 'power', sym: '1 − β', say: 'eins minus beta', term: 'Teststärke (Power)', plain: 'wie oft der Test einen echten Unterschied dieser Größe findet', concept: 'power' },
    { key: 'phi', sym: 'Φ', say: 'Phi', term: 'Kumulierte Wahrscheinlichkeit', plain: 'der Anteil der Normalverteilung links von einer Stelle', concept: 'cumulative_probability' },
    { key: 'd', sym: 'd', say: 'd', term: 'Effektgröße', plain: 'der Unterschied in Standardabweichungen', concept: 'effect' },
    { key: 'n', sym: 'n', say: 'n', term: 'Fallzahl je Gruppe', plain: 'wie viele Personen in jeder der beiden Gruppen sind' },
    { key: 'z', sym: 'z₁₋α/₂', say: 'z eins minus alpha halbe', term: 'Kritischer Wert & Ablehnungsbereich', plain: 'die Grenze, die die Prüfgröße überspringen muss', concept: 'critical_value' },
    { key: 'alpha', sym: 'α', say: 'alpha', term: 'Signifikanzniveau α', plain: 'die Schwelle für Fehlalarme', concept: 'alpha_level' },
  ],
  symbolic: [{ part: ['1 − β'], m: 'power' }, ' ≈ ', { part: ['Φ'], m: 'phi' }, '( ', { part: ['d'], m: 'd' }, ' · ', { big: '√', m: 'n' }, { root: [{ frac: [{ part: ['n'], m: 'n' }], den: ['2'], m: 'n' }], m: 'n' }, ' − ', { part: ['z'], m: 'z' }, { sub: '1 − α/2' }, ' )'],
  aria: 'eins minus beta ungefähr gleich Phi von d mal Wurzel aus n halbe minus z eins minus alpha halbe',
  numeric: s => [{ part: ['1 − β'], m: 'power' }, ' ≈ ', { part: ['Φ'], m: 'phi' }, '(', { part: [num(s.d)], m: 'd' }, ' · ', { part: [`√(${count(s.n)} / 2)`], m: 'n' }, ' − ', { part: [num(s.z)], m: 'z' }, ')',
    ' ≈ Φ(', num(s.delta), ' − ', num(s.z), ') ≈ Φ(', num(s.gap), ') ≈ ', { part: [num(s.power)], m: 'power' }],
  sentence: ['Die ', { m: 'power', t: 'Teststärke' }, ' ist ', { m: 'phi', t: 'der Anteil der Studien' }, ', in denen die Prüfgröße über ', { m: 'z', t: 'die Grenze' }, ' für ', { m: 'alpha', t: 'α' }, ' springt, wenn es ', { m: 'd', t: 'den Unterschied d' }, ' gibt und je Gruppe ', { m: 'n', t: 'n Personen' }, ' antworten.'],
  worked: s => [
    { title: 'Den Unterschied in Standardfehlern ausdrücken', text: `d · √(n/2) = ${num(s.d)} · √(${count(s.n)} / 2) ≈ ${num(s.delta)}. So weit liegt die Prüfgröße im Mittel von 0 entfernt, wenn der Unterschied echt ist.` },
    { title: 'Die Grenze abziehen', text: `${num(s.delta)} − ${num(s.z)} ≈ ${num(s.gap)}. ${s.gap >= 0 ? 'Im Mittel liegt die Prüfgröße also jenseits der Grenze.' : 'Im Mittel bleibt die Prüfgröße also diesseits der Grenze.'}` },
    { title: 'Nachsehen, wie oft die Prüfgröße die Grenze überspringt', text: `Φ(${num(s.gap)}) ≈ ${num(s.power)}: Der Test findet den Unterschied ${found(s.power)}.` },
  ],
  fehler: 'Die Teststärke gilt immer für einen bestimmten Unterschied. „Der Test hat 80 % Teststärke“ ohne Angabe von d sagt nichts. Und eine nachträglich aus dem beobachteten Effekt berechnete Teststärke ersetzt keine Planung.',
  sliders: [
    { key: 'd', label: 'Unterschied d in Standardabweichungen', min: 0.05, max: 1.5, step: 0.05, format: v => num(v) },
    { key: 'n', label: 'Fallzahl je Gruppe', min: 5, max: 2000, step: 1, log: true, format: v => count(v) },
    { key: 'alpha', label: 'Signifikanzniveau α', min: 0.001, max: 0.2, step: 0.001, format: v => num(v, 3) },
  ],
  quick: [
    { label: 'n mal 4', mark: 'n', apply: v => ({ ...v, n: Math.min(2000, v.n * 4) }) },
    { label: 'd = 0,5', mark: 'd', apply: v => ({ ...v, d: 0.5 }) },
    { label: 'α = 0,01', mark: 'alpha', apply: v => ({ ...v, alpha: 0.01 }) },
  ],
  compare: s => `Viermal so viele Befragte verdoppeln die erwartete Prüfgröße. Hier: ${num(s.delta)}, Teststärke ≈ ${num(s.power)}.`,
  check: {
    question: 'Die Teststärke beträgt 0,8. Wie groß ist β, die Wahrscheinlichkeit, den Unterschied zu übersehen?',
    answer: 0.2, tolerance: 0.011,
    right: 'Genau, 0,2: 1 − 0,8 = 0,2. In etwa 20 von 100 Studien bleibt der Unterschied unentdeckt.',
    diagnose: v => close(v, 0.8) ? 'Fast! 0,8 ist die Teststärke selbst. β ist der Rest bis 1.'
      : close(v, 0.05, 0.0011) ? 'Fast! 0,05 ist das übliche α, die Quote der Fehlalarme. β ist 1 minus Teststärke.'
      : close(v, 20) ? 'Fast! Als Anteil geschrieben sind 20 % genau 0,2.'
      : 'Noch nicht ganz. Teststärke und β ergeben zusammen 1.',
  },
  interpret: s => ({
    kurz: `Gibt es den Unterschied d = ${num(s.d)} wirklich, findet der Test ihn mit ${count(s.n)} Personen je Gruppe ${found(s.power)}.${Math.round(s.power * 100) < 100 && Math.round(s.power * 100) >= 1 ? ` In den übrigen ${100 - Math.round(s.power * 100)} übersieht er ihn.` : ''}`,
    fachlich: `Teststärke 1 − β ≈ ${num(s.power)} bei d = ${num(s.d)}, n = ${count(s.n)} je Gruppe und α = ${num(s.alpha, 3)}, zweiseitig, grob mit der Normalverteilung gerechnet. Als Faustregel plant man auf mindestens 0,8.`,
  }),
  think: {
    question: 'Du willst die Teststärke von etwa 0,56 auf 0,8 bringen. Was hilft?',
    options: ['α kleiner machen', 'mehr Befragte', 'd kleiner wählen'], correct: 1, mark: 'n',
    explain: 'Mehr Befragte vergrößern die erwartete Prüfgröße d · √(n/2). Mit 175 statt 100 Personen je Gruppe liegt die Teststärke bei etwa 0,8. Ein kleineres α senkt sie dagegen.',
    kurz: 'Mehr Befragte, mehr Teststärke.',
    hint: 'Probier oben „n mal 4“ aus.',
  },
  genau: {
    kurz: 'Die Formel ist eine Näherung mit der Normalverteilung. R rechnet mit power.t.test() die genauere Fassung mit der t-Verteilung.',
    paragraphs: [
      'Für d = 0,3, n = 100 je Gruppe und α = 0,05 liefert die Näherung 0,56. power.t.test(n = 100, delta = 0.3) meldet ebenfalls 0,56. Für 0,8 braucht die Näherung 175 Personen je Gruppe, power.t.test kommt auf 176.',
      'Eine Stunde Lernzeit in den letzten sieben Tagen entspricht im Lehrdatensatz etwa d = 0,3, denn die Standardabweichung innerhalb der Gruppen beträgt gut 3 Stunden. Daher kommt der Startwert.',
      'Die Teststärke ist keine Wahrscheinlichkeit dafür, dass H₁ stimmt. Sie gilt unter der Annahme, dass der Unterschied d tatsächlich besteht.',
      'Plane n vor der Erhebung mit einem Unterschied, der inhaltlich wichtig wäre. Effekt, Streuung, Design, Test und α gehören zusammen in die Planung; bei verbundenen Messungen oder ungleichen Gruppen gelten andere Formeln.',
    ],
  },
};

/** Reiter: Teststärke für eine Stunde Unterschied mit dem Standardfehler der aktuellen Daten, Weiter (base R power.t.test steht nicht im Katalog). */
export const teststaerkeTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
    kurz: 'Mit allen 200 Befragten: Wie oft fände der t-Test eine Stunde Unterschied in der Lernzeit?',
    value: c => { const r = gruppenTest(c); return r ? 1 - betaFor(0.05, r.se) : null; },
    result: c => {
      const r = gruppenTest(c);
      if (!r) return { kurz: 'In einer der Gruppen streut die Lernzeit nicht. Dann lässt sich der Vergleich nicht rechnen.', fachlich: 'Der Welch-t-Test braucht in beiden Gruppen mindestens zwei verschiedene Werte.' };
      const power = 1 - betaFor(0.05, r.se);
      return {
        kurz: `Mit ${r.nMit} und ${r.nOhne} Befragten und einem Standardfehler von ${num(r.se)} Stunden fände der Test eine Stunde Unterschied ${found(power)}. Eine Stunde sind hier d ≈ ${num(1 / r.sp)}.`,
        fachlich: `Grob mit der Normalverteilung: Teststärke ≈ Φ(1 / ${num(r.se)} − 1,96) ≈ ${num(power)}; α = 0,05, zweiseitig. Die gepoolte Standardabweichung beträgt ${num(r.sp)} Stunden.`,
      };
    },
    voraussetzung: 'Grob gerechnet: Der Standardfehler der Daten gilt auch, wenn der Unterschied in Wahrheit eine Stunde beträgt.',
    think: [
      {
        question: 'Alle lernen doppelt so lange, gefragt bleibt nach einer Stunde Unterschied. Was passiert mit der Teststärke?', options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 0,
        explain: 'Die Streuung verdoppelt sich, eine Stunde ist dann nur noch halb so viele Standardfehler. Der Test findet sie seltener.',
        kurz: 'Mehr Streuung, weniger Teststärke.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'down' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit der Teststärke?', options: ['bleibt gleich', 'sinkt', 'steigt'], correct: 0,
        explain: 'Verschieben ändert die Streuung nicht. Der Standardfehler bleibt, also auch die Teststärke.',
        kurz: 'Die Lage ändert nichts an der Teststärke.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was passiert mit der Teststärke?', options: ['sinkt', 'bleibt gleich', 'steigt'], correct: 0,
        explain: 'Der Ausreißer vergrößert den Standardfehler. Eine Stunde Unterschied fällt dann seltener auf.',
        kurz: 'Ausreißer kosten Teststärke.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'down' },
      },
    ],
  },
  next: {
    next: { id: 'effect', why: 'Die Teststärke gilt immer für einen Unterschied einer bestimmten Größe.' },
    before: [
      { id: 'type_errors', why: 'Die Teststärke ist eins minus β, die Wahrscheinlichkeit eines Fehlers zweiter Art.' },
      { id: 'alpha_level', why: 'Ein größeres α erhöht die Teststärke, aber auch die Fehlalarme.' },
      { id: 'se', why: 'Je kleiner der Standardfehler, desto leichter fällt ein Unterschied auf.' },
    ],
    after: [{ id: 'confidence', why: 'Viele Befragte machen Tests stärker und Intervalle schmaler.' }],
    more: [{ id: 'sampling', why: 'Die Planung setzt eine Zufallsstichprobe unabhängiger Personen voraus.' }],
  },
};
