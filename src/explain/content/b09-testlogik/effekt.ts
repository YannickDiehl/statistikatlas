// Formel als Satz „Effektgröße“: Cohens d = (x̄₁ − x̄₂) / sₚ. Beispiel: Lernzeit mit Abitur gegen ohne Schulabschluss;
// Reiter und In R mit der Lernzeit nach Weiterbildung (Hedges g in mariposa::t_test). Zahlen in R, siehe b09-testlogik.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, num, signed } from '../../format';
import { pnorm } from '../../../tasks/kit/dist';
import { gruppenTest, pShown } from './rechnen';

export type DValues = { diff: number; s: number };
export type DStats = DValues & { d: number; u3: number };

/** Lernzeit mit Abitur (Code 4) gegen ohne Schulabschluss (Code 0), R: Mittelwerte, gepoolte Standardabweichung, d, g. */
export const ABITUR = { mit: 9.355, ohne: 5.8833333, nMit: 40, nOhne: 42, sMit: 3.3604754, sOhne: 3.0719753, sp: 3.2158540, d: 1.0795474, g: 1.0693949 } as const;

/** Einordnung nach Cohens Faustregel (Betrag): unter 0,2 vernachlässigbar, ab 0,2 klein, ab 0,5 mittel, ab 0,8 groß. */
export function cohenLabel(d: number): string {
  const a = Math.abs(d);
  return a < 0.2 ? 'vernachlässigbar' : a < 0.5 ? 'ein kleiner Effekt' : a < 0.8 ? 'ein mittlerer Effekt' : 'ein großer Effekt';
}
/** Cohens d der Lernzeit mit Abitur gegen ohne Schulabschluss für die aktuellen Daten. */
export function abiturD(c: SampleCtx): number | null {
  const r = gruppenTest({ rows: c.rows.filter(p => p.values.schulabschluss === 4 || p.values.schulabschluss === 0).map(p => ({ ...p, values: { ...p.values, abi: p.values.schulabschluss === 4 ? 0 : 1 } })), columns: { x: ['lernzeit'], group: ['abi'] } });
  return r ? r.cohen : null;
}

export const effekt: SentenceTemplate<DValues, DStats> = {
  concept: 'effect',
  picture: 'b09-effekt',
  wofuer: `Befragte mit Abitur haben in den letzten sieben Tagen im Schnitt ${num(ABITUR.mit)} Stunden gelernt, die ohne Schulabschluss ${num(ABITUR.ohne)} Stunden. Ist das viel? Das hängt davon ab, wie verschieden die Befragten ohnehin sind. Die Effektgröße d misst den Unterschied in Standardabweichungen.`,
  kurz: 'Die Effektgröße d sagt dir, wie groß ein Unterschied ist, gemessen in Standardabweichungen. Anders als p hängt sie nicht von der Zahl der Befragten ab.',
  fachlich: 'Cohens d ist der Mittelwertunterschied zweier Gruppen geteilt durch die gepoolte Standardabweichung. Hedges g korrigiert d für kleine Stichproben leicht nach unten.',
  initial: { diff: 3.47, s: 3.22 },
  compute: v => { const d = v.diff / v.s; return { ...v, d, u3: pnorm(Math.abs(d)) }; },
  metrics: [
    { label: 'Unterschied', value: s => `${num(s.diff)} h` },
    { label: 'Effektgröße d', value: s => num(s.d) },
  ],
  glyphs: [
    { key: 'd', sym: 'd', say: 'd', term: 'Effektgröße', plain: 'der Unterschied in Standardabweichungen', concept: 'effect' },
    { key: 'diff', sym: 'x̄₁ − x̄₂', say: 'x quer eins minus x quer zwei', term: 'Mittelwertunterschied', plain: 'wie weit die beiden Gruppen im Schnitt auseinanderliegen' },
    { key: 's', sym: 'sₚ', say: 's p', term: 'Standardabweichung', plain: 'die gemeinsame Standardabweichung innerhalb der beiden Gruppen', concept: 'sd' },
  ],
  symbolic: [{ part: ['d'], m: 'd' }, ' = ', { frac: [{ part: ['x̄₁ − x̄₂'], m: 'diff' }], den: [{ part: ['sₚ'], m: 's' }], m: 'd' }],
  aria: 'd gleich x quer eins minus x quer zwei, geteilt durch s p',
  numeric: s => [{ part: ['d'], m: 'd' }, ' = ', { part: [num(s.diff)], m: 'diff' }, ' / ', { part: [num(s.s)], m: 's' }, ' ≈ ', { part: [num(s.d)], m: 'd' }],
  sentence: ['Die ', { m: 'd', t: 'Effektgröße d' }, ' ist ', { m: 'diff', t: 'der Unterschied der Mittelwerte' }, ', geteilt durch ', { m: 's', t: 'die Standardabweichung innerhalb der Gruppen' }, '.'],
  worked: s => [
    { title: 'Den Unterschied der Mittelwerte bilden', text: close(s.diff, 3.47, 1e-9) ? 'R meldet die Mittelwerte 9.355 und 5.883 Stunden. Abitur minus ohne Schulabschluss ergibt 3,47 Stunden.' : `x̄₁ − x̄₂ = ${signed(s.diff)} Stunden.` },
    { title: 'Durch die Streuung teilen', text: `d = ${num(s.diff)} / ${num(s.s)} ≈ ${num(s.d)}.` },
    { title: 'Mit der Faustregel einordnen', text: `Nach der Faustregel von Cohen ist ein Betrag von ${num(Math.abs(s.d))} ${cohenLabel(s.d)}: ab 0,2 klein, ab 0,5 mittel, ab 0,8 groß.` },
  ],
  fehler: 'Ein kleiner p-Wert heißt nicht, dass der Effekt groß ist. Mit 20.000 Befragten wird auch d = 0,05 signifikant. Umgekehrt kann ein großer Effekt bei wenigen Befragten nicht signifikant sein.',
  sliders: [
    { key: 'diff', label: 'Unterschied der Mittelwerte in Stunden', min: -6, max: 6, step: 0.01, format: v => `${signed(v)} h` },
    { key: 's', label: 'Standardabweichung innerhalb der Gruppen', min: 0.5, max: 8, step: 0.01, format: v => `${num(v)} h` },
  ],
  quick: [
    { label: 'Weiterbildung: 0,07 h bei 3,25 h', mark: 'diff', apply: () => ({ diff: 0.07, s: 3.25 }) },
    { label: 's halbieren', mark: 's', apply: v => ({ ...v, s: Math.max(0.5, Math.round(v.s / 2 * 100) / 100) }) },
    { label: 'Abitur gegen ohne Abschluss', mark: 'diff', apply: () => ({ diff: 3.47, s: 3.22 }) },
  ],
  compare: s => `Doppelte Streuung gibt halbes d, ein Unterschied allein sagt wenig. Hier: ${num(s.diff)} h geteilt durch ${num(s.s)} h ≈ ${num(s.d)}.`,
  check: {
    question: 'Zwei Gruppen liegen 2 Stunden auseinander, die Standardabweichung innerhalb der Gruppen beträgt 4 Stunden. Wie groß ist d?',
    answer: 0.5, tolerance: 0.011,
    right: 'Genau, 0,5: 2 / 4 = 0,5, nach der Faustregel ein mittlerer Effekt.',
    diagnose: v => close(v, 2) ? 'Fast! Das ist der Unterschied selbst. Teile ihn noch durch die Standardabweichung 4.'
      : close(v, 8) ? 'Fast! Hier wird geteilt, nicht malgenommen: 2 / 4.'
      : close(v, -0.5) ? 'Fast! Für die Größe zählt hier der Betrag: 0,5.'
      : close(v, 0.125, 0.0011) ? 'Fast! Du hast durch 4 zum Quadrat geteilt. d teilt durch die Standardabweichung selbst.'
      : 'Noch nicht ganz. Teile den Unterschied durch die Standardabweichung.',
  },
  interpret: s => ({
    kurz: Math.abs(s.d) < 0.005 ? 'Die Gruppen liegen gleichauf, d ist 0. Grob gesagt liegt dann jeweils die Hälfte einer Gruppe über dem Mittelwert der anderen.'
      : `Die Gruppen liegen ${num(Math.abs(s.d))} Standardabweichungen auseinander, nach der Faustregel von Cohen ${cohenLabel(s.d)}. Grob gesagt: Bei normalverteilten Werten lägen etwa ${Math.round(s.u3 * 100)} von 100 Personen der höheren Gruppe über dem Mittelwert der anderen.`,
    fachlich: `d = ${num(s.diff)} / ${num(s.s)} ≈ ${num(s.d)}. Das Vorzeichen zeigt nur, welche Gruppe vorn liegt. Die Faustregel (0,2 klein, 0,5 mittel, 0,8 groß) gilt für den Betrag und ist keine feste Grenze.`,
  }),
  think: {
    question: 'Die Streuung innerhalb der Gruppen halbiert sich, der Unterschied bleibt. Was passiert mit d?',
    options: ['d verdoppelt sich', 'd bleibt gleich', 'd halbiert sich'], correct: 0, mark: 's',
    explain: 'd ist der Unterschied geteilt durch die Streuung. Halbe Streuung im Nenner heißt doppeltes d: Dieselben Stunden wiegen schwerer, wenn die Gruppen in sich einiger sind.',
    kurz: 'Weniger Streuung, größerer Effekt.',
    hint: 'Probier oben „s halbieren“ aus.',
  },
  genau: {
    kurz: 'Welche Effektgröße passt, hängt von Frage und Verfahren ab. Cohens Schwellen sind Faustregeln, keine festen Grenzen.',
    paragraphs: [
      `Für Abitur gegen ohne Schulabschluss ist die gepoolte Standardabweichung √((39 · ${num(ABITUR.sMit)}² + 41 · ${num(ABITUR.sOhne)}²) / 80) ≈ ${num(ABITUR.sp)} Stunden, mit allen Nachkommastellen gerechnet, also d ≈ ${num(ABITUR.d)}. Mit der Korrektur nach Hedges ergibt sich g ≈ ${num(ABITUR.g)}.`,
      'mariposa meldet beim t-Test Hedges g. Für die Lernzeit nach Weiterbildung ist g = 0.022, nach R „negligible“, also vernachlässigbar.',
      'd hat keine Einheit: Misst du die Lernzeit in Minuten statt Stunden, werden Unterschied und Standardabweichung beide 60-mal so groß, und d bleibt gleich.',
      'Andere Verfahren haben andere Effektgrößen: r beim Zusammenhang, Cramérs V bei Kreuztabellen, η² in der Varianzanalyse, Odds Ratios in der logistischen Regression. Ob ein Effekt wichtig ist, entscheidet die Sache, nicht die Faustregel.',
    ],
  },
};

/** Reiter: d der Lernzeit nach Weiterbildung für die aktuellen Daten, In R der Welch-t-Test mit Hedges g, Weiter. */
export const effektTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
    kurz: 'Dieselbe Effektgröße mit allen 200 Befragten: Wie groß ist der Unterschied in der Lernzeit nach Weiterbildung?',
    value: c => gruppenTest(c)?.cohen ?? null,
    result: c => {
      const r = gruppenTest(c);
      if (!r) return { kurz: 'In einer der Gruppen streut die Lernzeit nicht. Dann lässt sich d nicht berechnen.', fachlich: 'd braucht in beiden Gruppen eine Standardabweichung über 0.' };
      const abi = abiturD(c);
      return {
        kurz: `Ohne minus mit Weiterbildung: ${num(r.d)} Stunden, bei einer Standardabweichung von ${num(r.sp)} Stunden innerhalb der Gruppen. Das sind d ≈ ${num(r.cohen)}, nach der Faustregel von Cohen ${cohenLabel(r.cohen)}.`,
        fachlich: `Cohens d mit gepoolter Standardabweichung: ${num(r.d)} / ${num(r.sp)} ≈ ${num(r.cohen)}. mariposa meldet Hedges g ≈ ${num(r.hedges)}; der Welch-Test ergibt p ${pShown(r.two)}.`,
        ...(abi === null ? {} : { zusatz: `Zum Vergleich: Abitur gegen ohne Schulabschluss ergibt d ≈ ${num(abi)}.` }),
      };
    },
    voraussetzung: 'd beschreibt die Größe des Unterschieds in diesen Daten. Die Faustregel von Cohen ist nur ein grober Anhaltspunkt.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit d?', options: ['bleibt gleich', 'verdoppelt sich', 'halbiert sich'], correct: 0,
        explain: 'Unterschied und Standardabweichung verdoppeln sich beide. Ihr Verhältnis bleibt, d hat keine Einheit.',
        kurz: 'd hängt nicht von der Einheit ab.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit d?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Beide Gruppen rücken gleich weit. Der Unterschied und die Streuung bleiben, also auch d.',
        kurz: 'Verschieben ändert die Effektgröße nicht.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 0,
    outputMap: [
      { match: 'g', atlas: 'Effektgröße g', explain: 'Hedges g: der Unterschied in Standardabweichungen, leicht korrigiert. 0.022 ist winzig.' },
      { match: '(negligible)', atlas: 'Einordnung nach Faustregel', explain: 'negligible heißt vernachlässigbar. R ordnet g nach Cohens Faustregel ein.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Sagt, wie überraschend der Unterschied ohne echten Unterschied wäre, nicht wie groß er ist.' },
      { match: 't', atlas: 'Prüfgröße t', explain: 't wächst mit der Zahl der Befragten, g nicht.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie groß der Unterschied ist? Tippe sie an.', correct: 'g',
      wrong: { p: 'Fast! p sagt, wie überraschend der Unterschied wäre, wenn es keinen gäbe. Die Größe steht hinter g.', t: 'Fast! t wächst mit der Zahl der Befragten. Die Größe des Unterschieds steht hinter g.' },
    },
  },
  next: {
    next: { id: 'power', why: 'Wie viele Befragte du brauchst, um einen Effekt dieser Größe zu finden.' },
    before: [
      { id: 'mean', why: 'Der Unterschied der Mittelwerte steht im Zähler.' },
      { id: 'sd', why: 'Die Standardabweichung steht im Nenner.' },
    ],
    after: [
      { id: 't_test', why: 'Meldet neben p auch die Effektgröße g.' },
      { id: 'cramers_v', why: 'Die Effektgröße für Kreuztabellen.' },
    ],
    more: [
      { id: 'p_value', why: 'Sagt, wie überraschend ein Ergebnis wäre, nicht wie groß es ist.' },
      { id: 'pearson', why: 'r ist selbst eine Effektgröße für Zusammenhänge.' },
    ],
  },
};
