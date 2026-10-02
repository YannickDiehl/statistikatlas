// Begriffskarte „Tukey-Paarvergleiche“ (B11): Lernzeit nach Schulabschluss im Lehrdatensatz, zehn Paare, eine gemeinsame
// Hürde aus der studentisierten Spannweite, wie mariposa::tukey_test(). Zahlen aus R in b11-rangtests.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { basePairs, hurdle40, pairLabel, pairsOf, SCHOOL } from './posthoc';

/** Wie viele der Paare bei diesem α auffällig sind (p nach Tukey kleiner als α). */
export const tukeyCount = (alpha: number) => basePairs().pairs.filter(p => p.pTukey < alpha).length;

export const tukeyCard: ConceptCard = {
  concept: 'tukey_test',
  picture: 'b11-tukey',
  wofuer: 'Im Lehrdatensatz lernen Befragte mit verschiedenen Schulabschlüssen unterschiedlich lange. Gäbe es zwischen den Abschlüssen keine Unterschiede, wäre so ein Ergebnis sehr überraschend (einfaktorielle ANOVA, p < 0,001). Aber zwischen welchen Abschlüssen? Fünf Gruppen ergeben zehn Paare, und jedes einzelne kann zufällig auffallen.',
  kurz: 'Tukey vergleicht nach einer ANOVA jedes Paar von Gruppen. Die Hürde liegt dabei so hoch, dass der Zufall bei allen Paaren zusammen nur selten einen Unterschied vortäuscht.',
  stellDirVor: {
    text: 'Befragte ohne Schulabschluss haben in den letzten sieben Tagen im Schnitt 5,88 Stunden gelernt, Befragte mit Abitur 9,36 Stunden. Dazwischen liegen Haupt-/Volksschulabschluss mit 6,95, Mittlerer Abschluss mit 7,95 und Fachhochschulreife mit 8,71 Stunden. Tukey meldet bei α = 0,05 für 4 der 10 Paare einen Unterschied.',
    figures: [
      { label: 'ohne Schulabschluss', value: '5,88 h' },
      { label: 'Abitur', value: '9,36 h' },
      { label: 'Paare', value: '10' },
      { label: 'auffällig bei α = 0,05', value: '4' },
    ],
  },
  heisst: {
    sym: 'q', say: 'q',
    fach: 'Die Tukey-HSD-Methode misst jede Mittelwertdifferenz an der studentisierten Spannweite q: dem Abstand zwischen größtem und kleinstem von k Gruppenmitteln, gemessen in Standardfehlern. Die Hürde ist ihr 95-%-Quantil; so bleibt die familienweise Fehlerrate bei α.',
  },
  bausteine: [
    {
      title: 'Alle Paare bilden',
      was: 'Fünf Gruppen ergeben 5 · 4 / 2 = 10 Paare. Jedes Paar ist ein eigener Vergleich, also ein eigener Test.',
      rechnung: 'Gäbe es keine Unterschiede, fiele bei zehn unabhängigen Tests mit α = 0,05 in 1 − 0,95¹⁰ ≈ 40 % der Studien mindestens einer auf.',
      warum: 'Viele Tests geben dem Zufall viele Gelegenheiten. Irgendein Paar fällt dann leicht auf, auch ohne echten Unterschied.',
      acht: 'Die 40 % sind nur ein grober Richtwert: Die zehn Vergleiche teilen sich Gruppen und sind nicht unabhängig. Klar bleibt: Bei vielen Vergleichen fällt leicht irgendwo einer zufällig auf.',
      concept: 'multiplicity',
    },
    {
      title: 'Eine gemeinsame Hürde festlegen',
      was: 'Tukey fragt: Wie weit können das größte und das kleinste von fünf Gruppenmitteln ohne echte Unterschiede auseinanderliegen? Die Hürde ist der Abstand, den der Zufall nur in 5 von 100 Studien übertrifft.',
      rechnung: 'Bei 5 Gruppen und 195 Freiheitsgraden ist die kritische Spannweite q ≈ 3,89. Für ohne Schulabschluss gegen Abitur ergibt das 3,89 / √2 · 0,67 ≈ 1,84 Stunden; mit allen Nachkommastellen rechnet R 1,83.',
      warum: 'Die Hürde richtet sich nach dem größten Abstand unter fünf Gruppen, den der Zufall nur selten übertrifft. Was sie überspringt, fällt auch im Vergleich aller Paare auf.',
      acht: 'Die Hürde wächst mit der Zahl der Gruppen. Mit mehr Gruppen braucht es größere Unterschiede, damit Tukey sie meldet.',
      concept: 'tukey_test',
    },
    {
      title: 'Jedes Paar mit der Hürde vergleichen',
      was: 'Ein Paar ist auffällig, wenn seine Differenz im Betrag größer ist als die Hürde. Gleichbedeutend: Das Intervall um die Differenz enthält die 0 nicht.',
      rechnung: 'Ohne Schulabschluss minus Abitur: −3,47 Stunden, im Betrag mehr als die Hürde von 1,83. Das simultane 95-%-Intervall reicht von −5,31 bis −1,64 Stunden.',
      warum: 'So liest du an einer Tabelle ab, welche Paare sich unterscheiden und um wie viele Stunden, nicht nur ob.',
      acht: 'Ein unauffälliges Paar heißt nicht, dass beide Gruppen gleich lange lernen. Haupt-/Volksschulabschluss minus Fachhochschulreife: −1,76 Stunden, knapp unter seiner Hürde von 1,84.',
      concept: 'confidence',
    },
  ],
  ausprobieren: [
    {
      question: 'Mit zehn statt fünf Gruppen: Wird die Hürde für ein Paar höher oder niedriger?', options: ['höher', 'gleich', 'niedriger'], correct: 0, step: 2,
      explain: 'Unter zehn Gruppenmitteln liegen das größte und das kleinste zufällig weiter auseinander als unter fünf. Bei 195 Freiheitsgraden steigt die kritische Spannweite von 3,89 auf 4,53, die Hürde mit ihr.',
      kurz: 'Mehr Gruppen, höhere Hürde.',
    },
    {
      question: 'Warum meldet Tukey weniger auffällige Paare als zehn einzelne t-Tests?', options: ['wegen der höheren gemeinsamen Hürde', 'weil Tukey weniger Befragte nutzt', 'weil Tukey kleine Gruppen weglässt'], correct: 0, step: 2,
      explain: 'Ein einzelner t-Test schlägt für ohne Schulabschluss gegen Abitur schon ab 1,31 Stunden Unterschied an. Tukey verlangt 1,83 Stunden, weil die Hürde für alle zehn Paare zusammen gilt.',
      kurz: 'Der Schutz für alle Paare kostet eine höhere Hürde.',
    },
    {
      question: 'Ohne Schulabschluss minus Abitur ergibt −3,47 Stunden. Zeigt das, dass ein Abitur zu mehr Lernzeit führt?', options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Die Daten sind beobachtet, niemand wurde einem Abschluss zugeteilt. Sie zeigen nur, dass die Lernzeit mit dem Abschluss zusammenhängt, nicht warum.',
      kurz: 'Ein Unterschied zwischen Gruppen ist noch keine Ursache.',
    },
  ],
  regler: {
    label: 'Wie streng soll die Hürde sein?',
    min: 0.01, max: 0.1, step: 0.01, initial: 0.05,
    format: v => `α = ${num(v, 3)}`,
    describe: v => {
      const r = basePairs(), n = tukeyCount(v);
      return `Bei α = ${num(v, 3)} muss ein Paar mit je 40 Personen mindestens ${num(hurdle40(r, 'tukey', v))} Stunden auseinanderliegen. Im Lehrdatensatz ${n === 1 ? 'überspringt ein Paar seine' : `überspringen ${n} der 10 Paare ihre`} eigene Hürde.`;
    },
  },
  check: {
    question: 'Tukey meldet für Haupt-/Volksschulabschluss minus Fachhochschulreife −1,76 Stunden und p ≈ 0,07. Was heißt das bei α = 0,05?',
    options: [
      'Beide Gruppen lernen gleich lange.',
      'Im Vergleich aller zehn Paare ist der Unterschied nicht auffällig; er kann trotzdem bestehen.',
      'Mit 7 % Wahrscheinlichkeit gibt es keinen Unterschied.',
      'Ein einzelner t-Test wäre genauso ausgegangen.',
    ],
    correct: 1,
    right: 'Genau. Die Differenz bleibt unter der gemeinsamen Hürde. Das ist kein Beleg dafür, dass es keinen Unterschied gibt.',
    diagnose: {
      0: 'Fast! Nicht auffällig heißt nicht gleich. Es fehlt nur der Beleg für einen Unterschied.',
      2: 'Fast! p ist keine Wahrscheinlichkeit für die Nullhypothese. Er fragt, wie überraschend die Daten wären, wenn es keinen Unterschied gäbe.',
      3: 'Fast! Ein einzelner t-Test hat eine niedrigere Hürde. Für dieses Paar läge sein p bei etwa 0,01.',
    },
  },
  fuerDich: 'Vergleicht eine Studie nach einer ANOVA einzelne Gruppen, schau nach, ob sie für die vielen Vergleiche korrigiert hat, etwa mit Tukey. Ohne Korrektur sind einzelne auffällige Paare oft Zufall.',
  genau: {
    kurz: 'Tukey setzt gleiche Streuungen in allen Gruppen voraus. Bei ungleich großen Gruppen heißt das Verfahren Tukey-Kramer und ist etwas vorsichtig.',
    paragraphs: [
      'mariposa rechnet wie TukeyHSD() in R mit der gemeinsamen Fehlervarianz MSE der ANOVA und der studentisierten Spannweitenverteilung. Bei ungleich großen Gruppen heißt das Verfahren Tukey-Kramer; es hält die familienweise Fehlerrate höchstens bei α.',
      'Die Methode setzt gleiche Streuungen in allen Gruppen voraus. Einen Ersatz für ungleiche Streuungen bietet tukey_test() nicht; prüfe die Streuungen vorher, etwa mit dem Levene-Test.',
      'Tukey schützt die Familie aller Paarvergleiche. Für jeden denkbaren Vergleich, auch von Gruppen gegen Kombinationen von Gruppen, braucht es den strengeren Scheffé-Test.',
      'Die Intervalle in der Ausgabe sind simultane 95-%-Intervalle: Bei wiederholten Zufallsstichproben enthielten in etwa 95 von 100 Studien alle zehn Intervalle zugleich die wahren Differenzen.',
    ],
  },
};

// Reiter -------------------------------------------------------------------------------

/** Zahl der Paare mit p nach Tukey unter 0,05 in den aktuellen Daten. */
export const tukeyCountOf = (c: SampleCtx) => { const r = pairsOf(c); return r ? r.pairs.filter(p => p.pTukey < 0.05).length : null; };

export const tukeyTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Zwischen welchen Schulabschlüssen unterscheidet sich die Lernzeit in den letzten sieben Tagen?',
    value: tukeyCountOf,
    result: c => {
      const r = pairsOf(c);
      if (!r || !(r.mse > 0)) return { kurz: 'Innerhalb der Gruppen streut die Lernzeit nicht. Dann lässt sich kein Paarvergleich rechnen.', fachlich: 'Die Fehlervarianz MSE ist 0.' };
      const hits = r.pairs.filter(p => p.pTukey < 0.05), far = r.pairs.reduce((a, p) => Math.abs(p.diff) > Math.abs(a.diff) ? p : a);
      const means = r.anova.groups.map(g => g.mean);
      return {
        kurz: `Bei α = 0,05 meldet Tukey ${hits.length} der ${r.pairs.length} Paare als auffällig. Am weitesten auseinander liegen ${SCHOOL[far.a]} und ${SCHOOL[far.b]}: ${num(means[far.a])} gegen ${num(means[far.b])} Stunden.`,
        fachlich: `Tukey-HSD nach der einfaktoriellen ANOVA, MSE ≈ ${num(r.mse)} bei ${r.df} Freiheitsgraden. ${hits.length ? `Auffällig (p < 0,05), in der Richtung von R: ${hits.map(p => `${pairLabel(p)} ${num(p.diff)} h`).join('; ')}.` : 'Bei keinem Paar liegt das p unter α = 0,05.'}`,
        zusatz: `Für zwei Gruppen mit je 40 Personen liegt die Hürde bei ${num(hurdle40(r, 'tukey'))} Stunden.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig, die Lernzeit ist in jeder Gruppe annähernd normalverteilt und streut in allen Gruppen ähnlich stark.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Zahl der auffälligen Paare?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Differenzen und Standardfehler verdoppeln sich beide, die Hürde auch. Jedes Paar steht im Verhältnis zur Hürde genau wie vorher.',
        kurz: 'Die Einheit ändert nichts am Vergleich.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person gibt 60 Stunden Lernzeit an. Was passiert mit der Hürde, die ein Paar überspringen muss?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Ein so extremer Wert vergrößert die Streuung innerhalb seiner Gruppe und damit die gemeinsame Fehlervarianz. Tukey misst jedes Paar an ihr, also steigt die Hürde für alle Paare.',
        kurz: 'Ein Ausreißer macht alle Vergleiche vorsichtiger.',
        tryIt: { label: 'eine Person auf 60 Stunden', op: 'outlier', column: 'x', value: 60 },
        expect: { change: 'up', measure: c => { const r = pairsOf(c); return r ? hurdle40(r, 'tukey') : null; } },
      },
    ],
  },
  r: {
    entry: 'tukey_test', variant: 0,
    tokens: {
      tukey_test: { sym: 'tukey_test()', term: 'Tukey-Paarvergleiche', kurz: 'Vergleicht nach oneway_anova() alle Paare von Gruppen mit einer gemeinsamen Hürde. summary() zeigt Differenzen, p-Werte und Intervalle.', fehler: 'tukey_test() braucht das Ergebnis von oneway_anova() davor. Direkt auf die Daten angewandt meldet mariposa: `tukey_test()` is not available for objects of class <tbl_df/tbl/data.frame>.' },
      group: { sym: 'group =', term: 'Gruppenvariable', kurz: 'Nennt die Spalte mit den Gruppen, hier die fünf Schulabschlüsse.', fehler: 'Mit nur zwei Gruppen gibt es nur ein Paar. Dann reicht der t-Test, und eine Korrektur ist überflüssig.' },
    },
    outputMap: [
      { match: '10 comparisons', atlas: 'zehn Paare', step: 1, explain: 'Fünf Gruppen ergeben 5 · 4 / 2 = 10 Paarvergleiche.' },
      { match: '4 significant', atlas: 'auffällige Paare', step: 3, explain: 'So viele Paare überspringen bei α = 0,05 die gemeinsame Hürde. summary() zeigt, welche es sind.' },
      { match: 'p < .05', atlas: 'Signifikanzniveau α', explain: 'Die Schwelle α = 0,05, mit der die korrigierten p-Werte verglichen werden.' },
    ],
    check: {
      question: 'Wie viele Paare meldet Tukey als auffällig? Tippe es an.', correct: '4 significant',
      wrong: { '10 comparisons': 'Fast! Das ist die Zahl aller Paare. Auffällig sind weniger.', 'p < .05': 'Fast! Das ist die Schwelle α. Die Zahl der auffälligen Paare steht davor.' },
    },
  },
  next: {
    next: { id: 'scheffe_test', why: 'Noch strenger: schützt nicht nur alle Paare, sondern jeden denkbaren Vergleich von Gruppen.' },
    before: [
      { id: 'oneway_anova', why: 'Zeigt zuerst, ob sich überhaupt irgendwo Gruppenmittel unterscheiden.' },
      { id: 'multiplicity', why: 'Warum viele Vergleiche eine gemeinsame Korrektur brauchen.' },
    ],
    after: [
      { id: 'confidence', why: 'Tukey liefert zu jedem Paar ein simultanes Intervall für die Differenz.' },
    ],
    more: [
      { id: 'dunn_test', why: 'Die Paarvergleiche nach dem Rangtest Kruskal–Wallis.' },
      { id: 't_test', why: 'Der Vergleich eines einzelnen Paars, ohne Korrektur.' },
      { id: 'variance_assumption', why: 'Tukey setzt gleiche Streuungen in allen Gruppen voraus.' },
    ],
  },
};

