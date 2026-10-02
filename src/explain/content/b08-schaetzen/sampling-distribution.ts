// Begriffskarte „Stichprobenverteilung“ (sampling_distribution). Beispiel: Anteil mit Weiterbildung unter den 200
// Befragten (41 %); Stichproben von n Personen, mit Zurücklegen gezogen. Die Verteilung der Anteile ist exakt
// binomial (Bild 'b08-anteil', Regler n). Reiter: Mittelwerte der Lernzeit aus 25 Ziehungen, SE = σ / 5.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, fixed, num, pct, unit } from '../../format';
import { columnX, mean, middle95, sdN, stufe } from './daten';

/** Weiterbildung unter den 200 Befragten des Lehrdatensatzes: 82 von 200. */
export const WEITERBILDUNG = { ja: 82, N: 200, pi: 82 / 200 } as const;
/** Stichprobengrößen des Reglers. */
export const ANTEIL_N = [5, 10, 20, 50, 100, 200, 500, 1000] as const;
/** Standardfehler eines Anteils aus n unabhängigen Ziehungen. */
export const seAnteil = (n: number, p = WEITERBILDUNG.pi) => Math.sqrt(p * (1 - p) / n);
/** Wie viele Personen eine Stichprobe im Reiter hat. */
export const ZUEGE = 25;

/** Stichprobenverteilung des Mittelwerts aus 25 Ziehungen (mit Zurücklegen) aus den aktuellen 200 Befragten. */
export function mittelwerte(c: SampleCtx) {
  const x = columnX(c, 'lernzeit'), sigma = sdN(x);
  return { N: x.length, mu: mean(x), sigma, se: sigma / Math.sqrt(ZUEGE) };
}

const se50 = seAnteil(50), mitte50 = middle95(50, WEITERBILDUNG.pi);

/** Text zum Regler: Standardfehler in Prozentpunkten und die mittleren 95 % der Anteile (exakt binomial). */
export function anteilText(n: number): string {
  const m = middle95(n, WEITERBILDUNG.pi);
  return `Mit ${count(n)} Gezogenen schwankt der Anteil typischerweise um etwa ${num(seAnteil(n) * 100, 1)} Prozentpunkte um ${pct(WEITERBILDUNG.pi)}. In etwa ${Math.round(m.prob * 100)} von 100 Stichproben liegt er zwischen ${pct(m.lo)} und ${pct(m.hi)}.`;
}

export const samplingDistribution: ConceptCard = {
  concept: 'sampling_distribution',
  picture: 'b08-anteil',
  wofuer: 'Wahlumfragen melden Anteile, und jede Umfrage kommt auf eine etwas andere Zahl. Wie stark schwanken solche Anteile allein dadurch, wer zufällig gefragt wird?',
  kurz: 'Die Stichprobenverteilung zeigt, welche Ergebnisse eine Schätzung annehmen würde, wenn du die Befragung sehr oft wiederholst. Je schmaler sie ist, desto genauer ist die Schätzung.',
  stellDirVor: {
    text: `Unter den 200 Befragten haben ${WEITERBILDUNG.ja} in den letzten zwölf Monaten eine Weiterbildung gemacht, also ${pct(WEITERBILDUNG.pi)}. Stell dir vor, die 200 sind alle, über die du etwas wissen willst. Du ziehst 50 von ihnen zufällig, mit Zurücklegen, und zählst den Anteil mit Weiterbildung. Jede neue Stichprobe ergibt einen etwas anderen Anteil. In etwa ${Math.round(mitte50.prob * 100)} von 100 Stichproben liegt er zwischen ${pct(mitte50.lo)} und ${pct(mitte50.hi)}.`,
    figures: [
      { label: 'Anteil aller 200', value: pct(WEITERBILDUNG.pi) },
      { label: 'Gezogene je Stichprobe', value: '50' },
      { label: 'Standardfehler', value: `${num(se50 * 100, 1)} Prozentpunkte` },
    ],
  },
  heisst: {
    sym: 'X̄', say: 'X quer',
    fach: 'Die Stichprobenverteilung ist die Verteilung eines Schätzers über alle möglichen Stichproben desselben Umfangs aus demselben Modell oder Erhebungsdesign. Bei unabhängigen Beobachtungen gilt E(X̄) = μ und Var(X̄) = σ² / n. Bei einem Anteil ist X̄ der Mittelwert einer Ja-nein-Variable mit 0 und 1.',
  },
  bausteine: [
    {
      title: 'Die Befragung in Gedanken wiederholen',
      was: 'Du stellst dir vor, du ziehst immer wieder eine neue Stichprobe derselben Größe. Jedes Mal rechnest du dieselbe Schätzung aus.',
      warum: 'In Wirklichkeit hast du nur eine Stichprobe. Erst das Gedankenexperiment zeigt, wie sehr dein Ergebnis vom Zufall abhängt.',
      acht: 'Es geht um die Ergebnisse ganzer Stichproben, nicht um die einzelnen Antworten in einer Stichprobe.',
      concept: 'random_sampling',
    },
    {
      title: 'Die Ergebnisse aufzeichnen',
      was: `Die vielen Anteile trägst du in ein Bild ein. Die meisten liegen nahe bei ${pct(WEITERBILDUNG.pi)}, wenige weit weg.`,
      warum: 'Die Mitte der Verteilung zeigt, ob die Schätzung im Mittel richtig liegt. Ihre Breite zeigt, wie stark sie schwankt.',
      acht: 'Die Form ist nicht automatisch eine Glocke. Bei kleinen Stichproben ist sie grob und kann schief sein.',
      concept: 'estimator',
    },
    {
      title: 'Die Breite messen',
      was: `Die Standardabweichung der Stichprobenverteilung heißt Standardfehler. Bei 50 Gezogenen sind es knapp ${count(se50 * 100)} Prozentpunkte.`,
      rechnung: `SE = √(${num(WEITERBILDUNG.pi)} · ${num(1 - WEITERBILDUNG.pi)} / 50) ≈ ${fixed(se50, 3)}, also ${num(se50 * 100, 1)} Prozentpunkte`,
      warum: 'Mit mehr Befragten wird die Verteilung schmaler. Viermal so viele Befragte halbieren den Standardfehler.',
      acht: 'Der Standardfehler beschreibt, wie stark die Schätzung schwankt. Wie verschieden die Befragten untereinander sind, beschreibt die Standardabweichung.',
      concept: 'se',
    },
  ],
  ausprobieren: [
    {
      question: 'Du ziehst 200 statt 50 Befragte. Was passiert mit der Breite der Stichprobenverteilung?',
      options: ['sie wird schmaler', 'sie bleibt gleich', 'sie wird breiter'], correct: 0, step: 3,
      explain: `Viermal so viele Befragte halbieren den Standardfehler: von etwa ${num(se50 * 100, 1)} auf ${num(seAnteil(200) * 100, 1)} Prozentpunkte. Schieb den Regler auf 200.`,
      kurz: 'Mehr Befragte, schmalere Verteilung.',
    },
    {
      question: 'Wo liegt die Mitte der Stichprobenverteilung?',
      options: [`bei ${pct(WEITERBILDUNG.pi)}, dem Anteil aller 200`, 'bei 50 %', 'bei jedem Ziehen woanders'], correct: 0, step: 2,
      explain: 'Bei einer Zufallsauswahl liegt die Schätzung im Mittel richtig. Die Mitte der Verteilung ist der Anteil in der Grundgesamtheit.',
      kurz: 'Im Mittel trifft die Zufallsstichprobe.',
    },
    {
      question: 'Sieht die Stichprobenverteilung bei 5 Gezogenen wie eine Glocke aus?',
      options: ['ja', 'nein, sie ist grob und etwas schief'], correct: 1, step: 2,
      explain: 'Bei 5 Gezogenen gibt es nur sechs mögliche Anteile: 0 %, 20 %, 40 %, 60 %, 80 % und 100 %. Erst bei mehr Befragten wird daraus eine Glocke.',
      kurz: 'Die Glocke kommt erst mit größeren Stichproben.',
    },
  ],
  regler: {
    label: 'Wie viele Befragte ziehst du je Stichprobe?',
    min: 0, max: ANTEIL_N.length - 1, step: 1, initial: ANTEIL_N.indexOf(50),
    format: v => `${count(stufe(ANTEIL_N, v))} Gezogene`,
    describe: v => anteilText(stufe(ANTEIL_N, v)),
  },
  check: {
    question: 'Was zeigt eine Stichprobenverteilung?',
    options: [
      'wie die Antworten der Befragten in einer Stichprobe verteilt sind',
      'wie eine Schätzung über viele gedachte Stichproben schwanken würde',
      'wie die Antworten in der Grundgesamtheit verteilt sind',
    ],
    correct: 1,
    right: 'Genau. Sie beschreibt die Schätzung von Stichprobe zu Stichprobe, nicht die einzelnen Antworten.',
    diagnose: {
      0: 'Fast! Das ist die Verteilung der Daten in einer Stichprobe. Die Stichprobenverteilung zeigt die Ergebnisse vieler Stichproben.',
      2: 'Fast! Die Verteilung in der Grundgesamtheit gehört zu den einzelnen Menschen. Die Stichprobenverteilung gehört zu einer Schätzung.',
    },
  },
  fuerDich: `Wenn eine Umfrage mit 1.000 Befragten „plus minus 3 Prozentpunkte“ meldet, steckt dahinter eine Stichprobenverteilung. Bei einem Anteil um 50 % ist 1,96 · √(0,5 · 0,5 / 1.000) ≈ ${num(1.96 * Math.sqrt(0.25 / 1000), 3)}, also gut 3 Prozentpunkte.`,
  genau: {
    kurz: 'Die Formeln gelten für unabhängige, identisch verteilte Beobachtungen mit endlicher Varianz. Beim Ziehen ohne Zurücklegen aus einer kleinen Grundgesamtheit wird die Verteilung etwas schmaler.',
    paragraphs: [
      `Hier ziehen wir mit Zurücklegen: Jede gezogene Person kommt zurück und kann wieder gezogen werden. Dann ist die Zahl der Gezogenen mit Weiterbildung binomialverteilt mit n und π = ${num(WEITERBILDUNG.pi)}, und das Bild ist exakt.`,
      'Allgemein gilt bei unabhängigen Beobachtungen E(X̄) = μ und Var(X̄) = σ² / n. Für einen Anteil ist σ² = π(1 − π), daher SE = √(π(1 − π) / n).',
      'Ohne Zurücklegen aus N Personen schrumpft die Varianz um den Faktor (N − n) / (N − 1). Bei sehr großen Grundgesamtheiten wie allen Erwachsenen in Deutschland spielt das kaum eine Rolle.',
      'Die Standardabweichung einer Stichprobenverteilung ist der Standardfehler. Ihre Form ist nicht automatisch normal; das beschreibt erst der zentrale Grenzwertsatz.',
    ],
  },
};

export const samplingDistributionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: `Stell dir vor, du ziehst immer wieder ${ZUEGE} der 200 Befragten zufällig, mit Zurücklegen. Jedes Mal ergibt sich ein anderer Mittelwert der Lernzeit.`,
    value: c => mittelwerte(c).se,
    result: c => {
      const m = mittelwerte(c);
      return {
        kurz: `Die Mittelwerte dieser Stichproben schwanken um ${unit(m.mu, 'Stunde', 'Stunden')}, den Mittelwert aller ${m.N}, typischerweise um etwa ${unit(m.se, 'Stunde', 'Stunden')}. Diese Schwankung ist der Standardfehler.`,
        fachlich: `Bei ${ZUEGE} unabhängigen Ziehungen hat die Stichprobenverteilung von x̄ den Erwartungswert μ = ${num(m.mu)} h und die Standardabweichung σ / √${ZUEGE} = ${num(m.sigma)} / 5 ≈ ${num(m.se)} h.`,
        zusatz: `Grob gesagt streuen einzelne Befragte um ${unit(m.sigma, 'Stunde', 'Stunden')}, Mittelwerte aus ${ZUEGE} Befragten nur um ${unit(m.se, 'Stunde', 'Stunden')}.`,
      };
    },
    voraussetzung: 'Die Formel σ / √n gilt für unabhängige Ziehungen, hier mit Zurücklegen. σ teilt durch 200, weil die 200 hier die ganze Grundgesamtheit sind.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was macht der Standardfehler der Mittelwerte?',
        options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 0,
        explain: 'σ verdoppelt sich, die Zahl der Ziehungen bleibt 25. Also verdoppelt sich auch σ / 5.',
        kurz: 'Mehr Streuung der Menschen, breitere Stichprobenverteilung.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was macht der Standardfehler der Mittelwerte?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die ganze Verteilung rückt um eine Stunde, ihre Breite bleibt. σ ändert sich nicht.',
        kurz: 'Verschieben ändert die Mitte, nicht die Breite.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was macht der Standardfehler der Mittelwerte?',
        options: ['bleibt genau gleich', 'steigt', 'sinkt'], correct: 1,
        explain: 'Der Ausreißer vergrößert σ. Zieht man ihn in eine Stichprobe, springt deren Mittelwert weit nach oben.',
        kurz: 'Ein Ausreißer macht Mittelwerte unruhiger.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
    ],
  },
  next: {
    next: { id: 'se', why: c => { const m = mittelwerte(c); return `Ihre Standardabweichung ist der Standardfehler, hier σ / √${ZUEGE} = ${num(m.sigma)} / 5 ≈ ${num(m.se)} h.`; } },
    before: [
      { id: 'estimator', why: 'Die Regel, deren Ergebnisse von Stichprobe zu Stichprobe schwanken.' },
      { id: 'random_sampling', why: 'Legt fest, wie die gedachten neuen Stichproben entstehen.' },
    ],
    after: [
      { id: 'central_limit', why: 'Beschreibt die Form der Stichprobenverteilung von Mittelwerten: mit wachsendem n eine Glocke.' },
      { id: 'confidence', why: 'Aus der Breite der Stichprobenverteilung entsteht ein Bereich plausibler Werte.' },
    ],
    more: [
      { id: 'null_distribution', why: 'Die Stichprobenverteilung einer Prüfgröße, wenn es keinen Effekt gäbe.' },
      { id: 'law_large_numbers', why: 'Mit wachsendem n zieht sich die Verteilung um den wahren Wert zusammen.' },
      { id: 'binomial_distribution', why: 'Die exakte Verteilung der Zahl der Gezogenen mit Weiterbildung.' },
    ],
  },
};
