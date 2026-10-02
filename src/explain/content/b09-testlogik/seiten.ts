// Begriffskarte „Einseitig & zweiseitig testen“. Beispiel: Lernzeit nach Weiterbildung, Welch-t-Test in der Richtung
// von mariposa (ohne minus mit), mit alternative = "two.sided", "greater" und "less". Zahlen in R, siehe b09-testlogik.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';
import { LERNZEIT_NACH_WEITERBILDUNG as L } from '../muster/p-wert';
import { gruppenTest, outOf100, pShown } from './rechnen';

/** Einseitige und zweiseitige p-Werte der Lernzeit nach Weiterbildung (R: t_test mit alternative = …). */
export const SEITEN = { two: 0.8758698, right: 0.4379349, left: 0.5620651 } as const;
/** Stellung des Schalters: 0 nur links, 1 beide Seiten, 2 nur rechts. */
export const sideOf = (v: number) => Math.max(0, Math.min(2, Math.round(v))) as 0 | 1 | 2;

export const seiten: ConceptCard = {
  concept: 'test_sides',
  picture: 'b09-seiten',
  wofuer: 'Du vermutest vorher: Wer eine Weiterbildung macht, lernt auch sonst mehr. Darfst du dann nur in diese eine Richtung testen? Und was ändert das am p-Wert?',
  kurz: 'Zweiseitig zählen Abweichungen in beide Richtungen als auffällig, einseitig nur in einer. Welche Seite zählt, legst du vor dem Blick in die Daten fest.',
  stellDirVor: {
    text: `Im Lehrdatensatz lernen Befragte ohne Weiterbildung im Schnitt ${num(L.ohne)} Stunden, die mit Weiterbildung ${num(L.mit)} Stunden. R rechnet ohne minus mit und kommt auf t ≈ ${num(L.t)}. Zweiseitig meldet R p = 0.876. Einseitig in Richtung „ohne lernen mehr“ ist p = 0.438, in Richtung „mit Weiterbildung lernen mehr“ p = 0.562.`,
    figures: [
      { label: 'zweiseitig', value: `p ≈ ${num(SEITEN.two)}` },
      { label: 'rechts: ohne lernen mehr', value: `p ≈ ${num(SEITEN.right)}` },
      { label: 'links: mit lernen mehr', value: `p ≈ ${num(SEITEN.left)}` },
    ],
  },
  heisst: {
    fach: 'Die Alternativhypothese legt fest, welche Werte der Prüfgröße gegen H₀ sprechen: nur große (rechtsseitig), nur kleine (linksseitig) oder beide Ränder (zweiseitig). Bei einer symmetrischen, stetigen Nullverteilung ist der zweiseitige p-Wert das Doppelte des kleineren einseitigen.',
  },
  bausteine: [
    {
      title: 'Die Richtung vorher festlegen',
      was: 'Vor der Auswertung schreibst du auf, welche Abweichung dich interessiert: eine bestimmte Richtung oder jede.',
      rechnung: 'zweiseitig: H₁: μ ohne ≠ μ mit; einseitig: H₁: μ ohne < μ mit',
      warum: 'Die Richtung bestimmt, welcher Rand der Nullverteilung zählt. Sie muss aus der Fragestellung kommen, nicht aus den Daten.',
      acht: 'Wer die Richtung erst nach dem Blick in die Daten wählt, meldet ohne echten Unterschied doppelt so oft einen, wie α verspricht.',
      concept: 'hypothesis',
    },
    {
      title: 'Beide Ränder zusammenzählen',
      was: `Zweiseitig zählt jedes t, das mindestens ${num(L.t)} von 0 entfernt ist, egal in welche Richtung. Die Flächen beider Ränder ergeben p.`,
      rechnung: `p ≈ ${num(SEITEN.right)} + ${num(SEITEN.right)} ≈ ${num(SEITEN.two)}`,
      warum: 'Beide Richtungen wären interessant gewesen. Deshalb zählen beide Ränder.',
      acht: 'Der zweiseitige p-Wert ist hier das Doppelte des einseitigen. Das gilt bei symmetrischen Verteilungen wie t, nicht allgemein.',
      concept: 'null_distribution',
    },
    {
      title: 'Nur einen Rand ansehen',
      was: 'Einseitig zählt nur der Rand in der vorher genannten Richtung. Liegt t auf der anderen Seite, wird p groß.',
      rechnung: `Richtung „mit Weiterbildung lernen mehr“: p ≈ ${num(SEITEN.left)}`,
      warum: 'Die Daten zeigen leicht das Gegenteil der Vermutung: Die mit Weiterbildung lernen etwas weniger. In der vermuteten Richtung ist nichts Auffälliges zu sehen.',
      acht: 'Einseitig heißt nicht „halber p-Wert“. Halbiert wird nur, wenn das Ergebnis in die vorher genannte Richtung zeigt.',
      concept: 'p_value',
    },
  ],
  ausprobieren: [
    {
      question: 'Ein zweiseitiger Test meldet p = 0,08. Das Ergebnis zeigt in die vorher genannte Richtung. Wie groß wäre der einseitige p-Wert?',
      options: ['0,04', '0,08', '0,16'], correct: 0, step: 3,
      explain: 'Bei einer symmetrischen Verteilung wie t halbiert sich p, wenn das Ergebnis in die genannte Richtung zeigt: 0,08 / 2 = 0,04.',
      kurz: 'Richtige Richtung: halber p-Wert.',
    },
    {
      question: 'Und wenn das Ergebnis in die Gegenrichtung zeigt?',
      options: ['p = 0,04', 'p = 0,96', 'p = 0,08'], correct: 1, step: 3,
      explain: 'Dann zählt der große Rest der Verteilung: 1 − 0,04 = 0,96. In der Gegenrichtung findet ein einseitiger Test nie etwas.',
      kurz: 'Falsche Richtung: p wird groß.',
    },
    {
      question: 'Darfst du nach dem Blick in die Daten von zweiseitig auf einseitig wechseln, um unter 0,05 zu kommen?',
      options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Dann würdest du ohne echten Unterschied in etwa 10 statt 5 von 100 Studien einen melden. Die Richtung gehört vor die Auswertung.',
      kurz: 'Erst die Richtung, dann die Daten.',
    },
  ],
  regler: {
    label: 'Welche Seite zählt?',
    min: 0, max: 2, step: 1, initial: 1,
    format: v => ['nur links', 'beide Seiten', 'nur rechts'][sideOf(v)],
    describe: v => [
      `Gezählt wird nur der linke Rand: t-Werte bis ${num(L.t)}, passend zur Vermutung „mit Weiterbildung lernen mehr“. Gäbe es keinen Unterschied, käme das ${outOf100(SEITEN.left)} Wiederholungen vor (p ≈ ${num(SEITEN.left)}).`,
      `Gezählt werden beide Ränder: t-Werte, die mindestens ${num(L.t)} von 0 entfernt sind. Gäbe es keinen Unterschied, käme das ${outOf100(SEITEN.two)} Wiederholungen vor (p ≈ ${num(SEITEN.two)}).`,
      `Gezählt wird nur der rechte Rand: t-Werte ab ${num(L.t)}, also „ohne Weiterbildung lernen mehr“. Gäbe es keinen Unterschied, käme das ${outOf100(SEITEN.right)} Wiederholungen vor (p ≈ ${num(SEITEN.right)}).`,
    ][sideOf(v)],
  },
  check: {
    question: 'R meldet zweiseitig p = 0,06. Du hattest die Richtung vorher festgelegt, und das Ergebnis zeigt genau dorthin. Was gilt einseitig?',
    options: [
      'p = 0,03, bei α = 0,05 also signifikant',
      'p = 0,06, einseitig ändert nichts',
      'p = 0,12, einseitig ist strenger',
      'Einseitig darf man nie testen.',
    ],
    correct: 0,
    right: 'Genau. In der vorher genannten Richtung zählt nur ein Rand: 0,06 / 2 = 0,03.',
    diagnose: {
      1: 'Fast! Einseitig zählt nur ein Rand. Bei symmetrischer Verteilung halbiert sich p, wenn das Ergebnis in die genannte Richtung zeigt.',
      2: 'Fast! Strenger ist der einseitige Test nur in der Gegenrichtung. In der genannten Richtung halbiert sich p.',
      3: 'Noch nicht ganz. Einseitig ist erlaubt, wenn die Richtung vor der Auswertung inhaltlich feststand.',
    },
  },
  fuerDich: 'Wenn eine Studie einseitig testet, prüf, ob die Richtung vorher begründet war, am besten in einer Vorregistrierung. Ein einseitiger Test, der erst nach den Daten gewählt wurde, macht p kleiner, als er sein dürfte.',
  genau: {
    kurz: 'Bei symmetrischen, stetigen Nullverteilungen ist der zweiseitige p-Wert das Doppelte des kleineren einseitigen. Bei diskreten oder schiefen Verteilungen gilt das nicht allgemein.',
    paragraphs: [
      'In R wählst du die Richtung mit alternative = "two.sided", "less" oder "greater". mariposa rechnet bei t_test() Gruppe 0 minus Gruppe 1, hier ohne minus mit Weiterbildung. "greater" heißt also: Befragte ohne Weiterbildung lernen mehr.',
      'F- und χ²-Tests zählen nur den rechten Rand, weil große Werte gegen H₀ sprechen und die Prüfgröße nie negativ wird. Trotzdem erfassen sie Abweichungen in jede Richtung.',
      'Wer nachträglich die Richtung wählt, in die die Daten zeigen, testet praktisch zweiseitig mit doppeltem α. Ohne echten Unterschied läge die Fehlerquote dann bei 10 statt 5 %.',
    ],
  },
};

/** Reiter: alle drei p-Werte für die aktuellen Daten, In R der einseitige Katalogaufruf (alternative = "greater"), Weiter. */
export const seitenTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Was meldet der t-Test zweiseitig, und was einseitig in jede Richtung?',
    value: c => gruppenTest(c)?.two ?? null,
    result: c => {
      const r = gruppenTest(c);
      if (!r) return { kurz: 'In einer der Gruppen streut die Lernzeit nicht. Dann lässt sich kein t-Test rechnen.', fachlich: 'Der Welch-t-Test braucht in beiden Gruppen mindestens zwei verschiedene Werte.' };
      return {
        kurz: `Ohne minus mit Weiterbildung: ${num(r.d)} Stunden, t ≈ ${num(r.t)}. Zweiseitig ist p ${pShown(r.two)}. Rechtsseitig („ohne lernen mehr“) ist p ${pShown(r.right)}, linksseitig („mit lernen mehr“) p ${pShown(r.left)}.`,
        fachlich: `Welch-t-Test mit ${num(r.df, 1)} Freiheitsgraden. Der zweiseitige p-Wert ist das Doppelte des kleineren einseitigen, und die beiden einseitigen ergeben zusammen 1.`,
        zusatz: `${r.nMit} Befragte mit und ${r.nOhne} ohne Weiterbildung.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an. Die Gruppenmittelwerte sollen annähernd normalverteilt sein.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem rechtsseitigen p-Wert?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
        explain: 'Beide Gruppen rücken gleich weit. t bleibt, also auch jeder einseitige p-Wert.',
        kurz: 'Verschieben ändert keinen Rand.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same', measure: c => gruppenTest(c)?.right ?? null },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Wievielmal so groß ist danach der zweiseitige p-Wert wie der kleinere einseitige?', options: ['2', '1', 'hängt von der Person ab'], correct: 0,
        explain: 'Die t-Verteilung ist symmetrisch. Wo t auch landet: Zweiseitig zählt beide Ränder, also das Doppelte des kleineren.',
        kurz: 'Symmetrisch heißt: zweiseitig ist doppelt.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'equals', value: 2, measure: c => { const r = gruppenTest(c); return r ? r.two / Math.min(r.left, r.right) : null; } },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 5,
    tokens: {
      '"greater"': { sym: '"greater"', term: 'Rechtsseitige Alternative', kurz: 'Nur große Werte von t sprechen gegen H₀. Bei t_test() heißt das: Gruppe 0, hier ohne Weiterbildung, hat den größeren Mittelwert.', fehler: 'Wer "greater" erst wählt, nachdem er die Daten gesehen hat, meldet ohne echten Unterschied doppelt so oft einen, wie α verspricht.' },
    },
    outputMap: [
      { match: 'p', atlas: 'einseitiger p-Wert', step: 3, explain: 'Mit alternative = "greater" zählt nur der rechte Rand. 0.438 ist die Hälfte des zweiseitigen 0.876.' },
      { match: 't', atlas: 'Prüfgröße t', step: 2, explain: 't bleibt gleich, egal welche Seite du wählst. Nur die gezählte Fläche ändert sich.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten in beiden Gruppen.' },
    ],
    check: {
      question: 'Welche Zahl ändert sich, wenn du "greater" statt "two.sided" schreibst? Tippe sie an.', correct: 'p',
      wrong: { t: 'Fast! t bleibt gleich. Die Richtung ändert nur, welche Fläche der Nullverteilung als p zählt.', N: 'Fast! Die Zahl der Befragten bleibt gleich. Es ändert sich p.' },
    },
  },
  next: {
    next: { id: 'critical_value', why: 'Einseitig liegt die Grenze nur auf einer Seite, zweiseitig auf beiden.' },
    before: [
      { id: 'hypothesis', why: 'Die Alternativhypothese legt die Richtung fest.' },
      { id: 'null_distribution', why: 'Ihre Ränder liefern die Flächen, die als extrem zählen.' },
    ],
    after: [{ id: 'p_value', why: 'Hängt davon ab, welche Ränder zählen.' }],
    more: [{ id: 't_test', why: 'Mit alternative = "less" oder "greater" rechnest du einseitig.' }],
  },
};
