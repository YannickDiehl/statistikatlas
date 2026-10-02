// Begriffskarte „Nullverteilung“. Beispiel: Lernzeit nach Weiterbildung (wie das Muster p-Wert); die Nullverteilung
// entsteht durch Mischen der Weiterbildungsangaben (Permutation). Zahlen in R nachgerechnet, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { count, num } from '../../format';
import { baseSurvey } from '../../sample';
import { LERNZEIT_NACH_WEITERBILDUNG as L } from '../muster/p-wert';
import { MIX_MAX, gruppenTest, mischen } from './rechnen';

/**
 * Lernzeit aller 200 (s über alle), Breite der Nullverteilung beim Mischen s · √(1/82 + 1/118), grober 95-%-Bereich
 * 1,96 · sd, dazu aus 100.000 Mischungen in R das 97,5-%-Quantil und der Anteil mindestens so großer Unterschiede.
 */
export const MISCHEN = { s: 3.2375153, root: 0.1437702, sd: 0.4654563, rand: 0.9122943, q: 0.9161430, pPerm: 0.87694 } as const;
/** Zahl der Mischungen am Regler, auf Zehner gerundet. */
export const mixCount = (v: number) => Math.max(10, Math.min(MIX_MAX, Math.round(v / 10) * 10));
/** Wie viele der ersten k Mischungen einen Unterschied von mindestens dem beobachteten ergeben (beide Richtungen). */
export function asFarAs(k: number): number {
  return mischen(baseSurvey(), k).filter(d => Math.abs(d) >= L.diff - 1e-9).length;
}

export const nullverteilung: ConceptCard = {
  concept: 'null_distribution',
  picture: 'b09-nullverteilung',
  wofuer: `Lernen Befragte mit Weiterbildung anders lange als die ohne? Im Lehrdatensatz liegen beide Gruppen ${num(L.diff)} Stunden auseinander. Um das einzuordnen, brauchst du einen Vergleich: Welche Unterschiede entstünden, wenn Weiterbildung und Lernzeit gar nichts miteinander zu tun hätten?`,
  kurz: 'Die Nullverteilung zeigt, welche Ergebnisse der Zufall allein liefern würde, wenn die Nullhypothese stimmt. An ihr misst du dein tatsächliches Ergebnis.',
  stellDirVor: {
    text: `Stell dir vor, du verteilst die ${L.nMit} Weiterbildungen zufällig neu auf die 200 Befragten, wie beim Mischen von Karten. Jetzt hat die Weiterbildung sicher nichts mehr mit der Lernzeit zu tun. Trotzdem liegen die beiden Gruppen fast nie genau gleichauf. Wiederholst du das Mischen sehr oft, entsteht die Nullverteilung des Unterschieds.`,
    figures: [
      { label: 'beobachteter Unterschied', value: `${num(L.diff)} h` },
      { label: 'typische Schwankung beim Mischen', value: `${num(MISCHEN.sd)} h` },
      { label: '95 von 100 Mischungen', value: `−${num(MISCHEN.rand)} bis +${num(MISCHEN.rand)} h` },
    ],
  },
  heisst: {
    fach: 'Die Verteilung, die eine Prüfgröße bei wiederholten Daten unter der Nullhypothese und den Annahmen des Tests hätte. Sie ist keine Verteilung der Rohwerte und keine Wahrscheinlichkeit dafür, dass H₀ stimmt.',
  },
  bausteine: [
    {
      title: 'Eine Welt ohne Unterschied bauen',
      was: 'Wir mischen die Weiterbildungsangaben zufällig neu. So sorgen wir dafür, dass die Nullhypothese stimmt: Weiterbildung und Lernzeit hängen nicht zusammen.',
      warum: 'Nur in einer Welt, in der H₀ sicher gilt, sieht man, was der Zufall allein anrichtet.',
      acht: 'Die Lernzeiten selbst bleiben beim Mischen gleich. Nur die Zuordnung zu den Gruppen ändert sich.',
      concept: 'hypothesis',
    },
    {
      title: 'Den Unterschied immer wieder ausrechnen',
      was: 'Nach jedem Mischen rechnen wir den Unterschied der Gruppen neu aus. Viele Mischungen ergeben viele Unterschiede, und ihre Verteilung ist die Nullverteilung.',
      rechnung: `typische Schwankung: ${num(MISCHEN.s)} · √(1/${L.nMit} + 1/${L.nOhne}) ≈ ${num(MISCHEN.s)} · ${num(MISCHEN.root, 3)} ≈ ${num(MISCHEN.sd)} h`,
      warum: 'So siehst du, wie weit zwei Gruppen auch ohne jeden Zusammenhang auseinanderliegen. Grob gesagt schwankt der Unterschied um knapp eine halbe Stunde.',
      acht: 'Die Nullverteilung zeigt Unterschiede zwischen Gruppen, keine einzelnen Lernzeiten. Sie ist deshalb viel schmaler als die Verteilung der Befragten.',
      concept: 'sampling_distribution',
    },
    {
      title: 'Das echte Ergebnis einordnen',
      was: `Jetzt legen wir den beobachteten Unterschied von ${num(L.diff)} Stunden daneben. Er liegt mitten in der Nullverteilung.`,
      rechnung: `In etwa ${Math.round(MISCHEN.pPerm * 100)} von 100 Mischungen ist der Unterschied mindestens so groß: p ≈ ${num(MISCHEN.pPerm)}.`,
      warum: 'Ein Ergebnis mitten in der Nullverteilung ist ohne Zusammenhang ganz gewöhnlich. Ein Ergebnis weit am Rand wäre überraschend.',
      acht: 'Die Nullverteilung rechnet so, als ob H₀ stimmt. Sie sagt nicht, wie wahrscheinlich H₀ ist.',
      concept: 'p_value',
    },
    {
      title: 'Die Kurve statt des Mischens nehmen',
      was: `R mischt nicht, sondern nimmt eine fertige Kurve: die t-Verteilung mit ${num(L.df, 1)} Freiheitsgraden. Gemessen in Standardfehlern hat sie fast dieselbe Form wie das Mischen.`,
      warum: 'Eine Formel ist schneller als tausendfaches Mischen. Sie gilt, wenn die Annahmen des Tests stimmen.',
      acht: 'Welche Kurve passt, hängt von der Prüfgröße ab: t, F, χ² oder Binomial. Eine Nullverteilung für alle Tests gibt es nicht.',
      concept: 't_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'Angenommen, die beiden Gruppen lägen eine ganze Stunde auseinander. Läge das mitten in der Nullverteilung?',
      options: ['ja', 'nein, eher am Rand'], correct: 1, step: 3,
      explain: `Ohne Zusammenhang liegen grob gerechnet 95 von 100 Mischungen zwischen −${num(MISCHEN.rand)} und +${num(MISCHEN.rand)} Stunden. Eine Stunde läge knapp außerhalb, ohne Zusammenhang also selten.`,
      kurz: 'Am Rand heißt: ohne Zusammenhang selten.',
    },
    {
      question: 'Was passiert mit der Nullverteilung, wenn alle Befragten doppelt so lange lernen?',
      options: ['wird doppelt so breit', 'bleibt gleich', 'wird halb so breit'], correct: 0, step: 2,
      explain: `Alle Unterschiede beim Mischen verdoppeln sich. Die typische Schwankung wächst von ${num(MISCHEN.sd)} auf ${num(2 * MISCHEN.sd)} Stunden.`,
      kurz: 'Die Nullverteilung hat die Einheit der Prüfgröße.',
    },
    {
      question: 'Mit 2.000 statt 200 Befragten: Wird die Nullverteilung breiter oder schmaler?',
      options: ['breiter', 'schmaler', 'gleich breit'], correct: 1, step: 2,
      explain: `Größere Gruppen haben stabilere Mittelwerte. Die typische Schwankung schrumpft auf etwa ein Drittel, rund ${num(MISCHEN.sd / Math.sqrt(10))} Stunden.`,
      kurz: 'Mehr Befragte, schmalere Nullverteilung.',
    },
  ],
  regler: {
    label: 'Wie oft neu gemischt?',
    min: 10, max: MIX_MAX, step: 10, initial: 200,
    format: v => `${count(mixCount(v))}-mal gemischt`,
    describe: v => {
      const n = mixCount(v), k = asFarAs(n);
      return `Nach ${count(n)} Mischungen liegen die Gruppen in ${count(k)} davon mindestens ${num(L.diff)} Stunden auseinander, so weit wie in den echten Daten. Das ist ein Anteil von ${num(k / n)}${n >= 500 ? `, nahe am p-Wert ${num(L.p)} des t-Tests` : '; bei so wenigen Mischungen schwankt er noch stark'}.`;
    },
  },
  check: {
    question: 'Was zeigt die Nullverteilung?',
    options: [
      'Wie die Lernzeiten der 200 Befragten verteilt sind.',
      'Welche Unterschiede der Zufall allein liefern würde, wenn es keinen Zusammenhang gäbe.',
      'Wie wahrscheinlich es ist, dass die Nullhypothese stimmt.',
      'Welche Unterschiede es in der Grundgesamtheit wirklich gibt.',
    ],
    correct: 1,
    right: 'Genau. Sie zeigt, was in einer Welt ohne Zusammenhang üblich wäre. Daran misst du dein Ergebnis.',
    diagnose: {
      0: 'Fast! Das wäre die Verteilung der Rohwerte. Die Nullverteilung zeigt Unterschiede zwischen Gruppen, wie sie ohne Zusammenhang entstünden.',
      2: 'Fast! Die Nullverteilung rechnet so, als ob H₀ stimmt. Ob sie stimmt, sagt sie nicht.',
      3: 'Noch nicht ganz. Die Nullverteilung beschreibt eine gedachte Welt ohne Unterschied, nicht die wirkliche.',
    },
  },
  fuerDich: 'Wenn ein Ergebnis „signifikant“ heißt, lag p unter einer Schwelle α, und dahinter steckt immer ein Vergleich mit einer Nullverteilung. Frag dich: Welche Welt ohne Unterschied wurde angenommen, und passt sie zu den Daten?',
  genau: {
    kurz: 'Die Nullverteilung hängt von Prüfgröße, Nullhypothese und Modell ab. Das Mischen ist ein Permutationstest, die t-Verteilung eine Näherung dafür.',
    paragraphs: [
      `Beim Mischen bleibt jede Lernzeit erhalten. Die Standardabweichung der Unterschiede ist dann genau s · √(1/n₁ + 1/n₂) ≈ ${num(MISCHEN.sd)} Stunden, mit s über alle 200 Befragten. Der Welch-t-Test schätzt den Standardfehler etwas anders und kommt ebenfalls auf ${num(L.se)} Stunden.`,
      `Die Zahlen am Regler stammen aus einer festen Folge von Zufallsmischungen. In R ergeben 100.000 Mischungen einen Anteil von ${num(MISCHEN.pPerm)}, und 95 von 100 Unterschieden liegen zwischen etwa −${num(MISCHEN.q)} und +${num(MISCHEN.q)} Stunden. Die Glockenkurve mit 1,96 Standardabweichungen kommt auf ±${num(MISCHEN.rand)} Stunden.`,
      'Je nach Prüfgröße kommen t-, F-, χ²- oder Binomialverteilungen infrage. Lautet H₀ nicht „genau gleich“, sondern etwa „höchstens sieben Stunden“, muss der Test für jeden erlaubten Wert richtig rechnen.',
      'Die Nullverteilung ist keine Verteilung der beobachteten Lernzeiten und keine Wahrscheinlichkeitsaussage über H₀.',
    ],
  },
};

/** Reiter: Breite der Nullverteilung beim Mischen für alle 200, In R der Welch-Test (Freiheitsgrade der t-Verteilung), Weiter. */
export const nullverteilungTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
    kurz: 'Dieselbe Nullverteilung mit allen 200 Befragten: Wie stark schwankt der Unterschied der Gruppen, wenn Weiterbildung und Lernzeit nichts miteinander zu tun hätten?',
    value: c => gruppenTest(c)?.perm ?? null,
    result: c => {
      const r = gruppenTest(c);
      if (!r) return { kurz: 'In einer der Gruppen streut die Lernzeit nicht. Dann lässt sich der Vergleich nicht rechnen.', fachlich: 'Der t-Test braucht in beiden Gruppen mindestens zwei verschiedene Werte.' };
      const rand = 1.96 * r.perm, inside = Math.abs(r.d) < rand;
      return {
        kurz: `Ohne Zusammenhang läge der Unterschied der Gruppen grob gerechnet in 95 von 100 Mischungen zwischen −${num(rand)} und +${num(rand)} Stunden. Beobachtet sind ${num(Math.abs(r.d))} Stunden. ${inside ? 'Das liegt innerhalb der Nullverteilung, ohne Zusammenhang also gewöhnlich.' : 'Das liegt am Rand der Nullverteilung, ohne Zusammenhang also selten.'}`,
        fachlich: `Permutationsverteilung des Unterschieds ohne minus mit Weiterbildung: Mitte 0, Standardabweichung s · √(1/${r.nMit} + 1/${r.nOhne}) ≈ ${num(r.perm)} h. R nähert sie mit der t-Verteilung mit ${num(r.df, 1)} Freiheitsgraden.`,
        zusatz: `${r.nMit} Befragte mit und ${r.nOhne} ohne Weiterbildung; beim Mischen bleiben diese Gruppengrößen gleich.`,
      };
    },
    voraussetzung: 'Das Mischen setzt voraus, dass die Befragten unabhängig sind und unter H₀ austauschbar.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Breite der Nullverteilung?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 0,
        explain: 'Jeder Unterschied beim Mischen verdoppelt sich, also auch ihre typische Schwankung.',
        kurz: 'Die Nullverteilung wächst mit der Einheit.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit der Breite der Nullverteilung?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Beide Gruppen rücken gleich weit. Die Unterschiede beim Mischen bleiben dieselben.',
        kurz: 'Verschieben ändert die Nullverteilung nicht.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was passiert mit der Breite der Nullverteilung?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 0,
        explain: 'Der Ausreißer vergrößert die Streuung aller Lernzeiten. Beim Mischen landet er mal in der einen, mal in der anderen Gruppe und macht die Unterschiede größer.',
        kurz: 'Ein Ausreißer macht die Nullverteilung breiter.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 0,
    outputMap: [
      { match: '175.8', atlas: 'Freiheitsgrade der Nullverteilung', step: 4, explain: 'Welche t-Verteilung als Nullverteilung dient, legen die Freiheitsgrade fest. Welch kommt hier auf 175,8.' },
      { match: 't', atlas: 'beobachtete Prüfgröße', step: 3, explain: 'Diesen Wert ordnet R in die Nullverteilung ein. 0.156 liegt mitten darin.' },
      { match: 'p', atlas: 'p-Wert', step: 3, explain: 'Der Anteil der Nullverteilung, der mindestens so weit von 0 entfernt ist wie t, in beide Richtungen.' },
    ],
    check: {
      question: 'Welche Zahl legt fest, welche t-Verteilung R als Nullverteilung nimmt? Tippe sie an.', correct: '175.8',
      wrong: { t: 'Fast! t ist das beobachtete Ergebnis, das R in der Nullverteilung einordnet.', p: 'Fast! p ist eine Fläche der Nullverteilung, nicht ihre Form.' },
    },
  },
  next: {
    next: { id: 'p_value', why: 'Der Anteil der Nullverteilung, der mindestens so extrem ist wie dein Ergebnis.' },
    before: [
      { id: 'test_statistic', why: 'Die Größe, deren Verteilung hier gezeigt wird.' },
      { id: 'sampling_distribution', why: 'Die Nullverteilung ist eine Stichprobenverteilung in einer Welt, in der H₀ gilt.' },
    ],
    after: [
      { id: 'critical_value', why: 'Schneidet die Ränder der Nullverteilung ab.' },
      { id: 'exact_asymptotic', why: 'Ob die Nullverteilung exakt gilt oder nur ungefähr.' },
    ],
    more: [
      { id: 't_distribution', why: 'Die Nullverteilung des t-Tests.' },
      { id: 'chi_square_distribution', why: 'Die Nullverteilung für Kreuztabellen.' },
    ],
  },
};
