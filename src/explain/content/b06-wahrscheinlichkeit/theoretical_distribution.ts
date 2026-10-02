// Begriffskarte „Theoretische Verteilung“. Beispiel: Normalmodell für die Schlafdauer der 200 Befragten (μ = 7,08 h,
// σ = 0,82 h) im Vergleich mit den beobachteten Werten; der Regler verschiebt μ. Zahlen in R nachgerechnet, siehe
// b06-wahrscheinlichkeit.test.ts. Bild: 'b06-modell' in src/components/explain/pictures/b06-wahrscheinlichkeit.tsx.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { SCHLAF, cdf, column, countIf, meanSd, schlafModell, sleepMu } from './gemeinsam';

const S = SCHLAF;
const M6 = schlafModell.F(6), OBS6 = S.below6 / S.n;

/** Modell aus den aktuellen Daten: Normalverteilung mit x̄ und s der Schlafdauer; Anteil unter 6 Stunden im Modell und beobachtet. */
function model(c: SampleCtx) {
  const xs = column(c, 'x', 'schlafdauer'), { mean, sd } = meanSd(xs);
  return { n: xs.length, mean, sd, model6: sd > 0 ? cdf(6, mean, sd) : null, obs6: countIf(xs, v => v < 6) / xs.length };
}

export const theoreticalDistribution: ConceptCard = {
  concept: 'theoretical_distribution',
  picture: 'b06-modell',
  wofuer: 'Die 200 Befragten haben angegeben, wie lange sie in den letzten sieben Tagen durchschnittlich pro Nacht geschlafen haben. Ein Modell soll beschreiben, wie Schlafdauern überhaupt verteilt sein können, auch solche, die in den Daten nicht vorkommen. So ein Modell heißt theoretische Verteilung.',
  kurz: 'Eine theoretische Verteilung ist ein Modell: Sie sagt für alle möglichen Werte, wie wahrscheinlich sie sind. Wenige Zahlen, die Parameter, legen ihre Form fest.',
  stellDirVor: {
    text: `Im Mittel schlafen die ${S.n} Befragten ${num(S.mean)} Stunden pro Nacht, mit einer Standardabweichung von ${num(S.sd)} Stunden. Ein passendes Modell ist eine Normalverteilung mit μ = ${num(S.mean)} h und σ = ${num(S.sd)} h. Sie sagt zum Beispiel: Weniger als 6 Stunden schlafen ${pct(M6)}. In den Daten sind es ${S.below6} von ${S.n}, also ${pct(OBS6)}.`,
    figures: [
      { label: 'Modell', value: `N(${num(S.mean)}; ${num(S.sd)}²)` },
      { label: 'unter 6 h im Modell', value: pct(M6) },
      { label: 'unter 6 h in den Daten', value: pct(OBS6) },
    ],
  },
  heisst: {
    sym: 'X ∼ N(μ, σ²)', say: 'X ist normalverteilt mit mü und sigma Quadrat',
    fach: 'Eine theoretische Verteilung ordnet allen möglichen Werten einer Zufallsvariable Wahrscheinlichkeiten zu. Ihre Parameter, hier μ und σ, bestimmen die konkrete Form.',
  },
  bausteine: [
    {
      title: 'Eine Modellfamilie wählen',
      was: 'Schlafdauern häufen sich um eine Mitte und werden zu beiden Seiten seltener. Dazu passt die Glockenform der Normalverteilung.',
      warum: 'Die Familie legt die Grundform fest. Für Zählungen wie gelöste Aufgaben passen andere Familien, etwa die Binomialverteilung.',
      acht: 'Kein Modell ist wahr. Die Normalverteilung erlaubt auch 20 Stunden Schlaf, nur mit winziger Wahrscheinlichkeit; für die Mitte der Daten kann sie trotzdem gut passen.',
      concept: 'normal_distribution',
    },
    {
      title: 'Die Parameter festlegen',
      was: `Aus den Daten nimmst du μ = ${num(S.mean)} h und σ = ${num(S.sd)} h. Damit steht das Modell fest.`,
      rechnung: `X ∼ N(${num(S.mean)}; ${num(S.sd)}²)`,
      warum: 'Gleiche Familie, andere Parameter, andere Kurve: Mit größerem μ rückt sie nach rechts, mit größerem σ wird sie breiter.',
      acht: 'μ und σ gehören zum Modell, x̄ und s zu den Daten. Hier schätzen x̄ und s die Parameter; dasselbe sind sie nicht.',
      concept: 'population_parameter',
    },
    {
      title: 'Modell und Daten vergleichen',
      was: `Das Modell rechnet auch für Werte, die keiner der ${S.n} angegeben hat. Für „weniger als 6 Stunden“ sagt es ${pct(M6)}.`,
      rechnung: `Modell: P(X < 6) ≈ ${pct(M6)}. Daten: ${S.below6} von ${S.n} = ${pct(OBS6)}.`,
      warum: 'Passen Modell und Daten zusammen, kann man mit dem Modell rechnen: für Bereiche, Wahrscheinlichkeiten und Tests.',
      acht: 'Ein gut passendes Modell beweist nicht, dass es stimmt. Es ist eine Annahme, die zu den Daten passen soll.',
      concept: 'empirical_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'Keiner der 200 schläft weniger als 5 Stunden. Sagt das Modell dafür 0 %?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: `Das Modell beschreibt alle möglichen Werte, nicht nur die beobachteten. Weniger als 5 Stunden schlafen im Modell ${pct(schlafModell.F(5))}; bei 200 Befragten wäre das rechnerisch gut eine Person.`,
      kurz: 'Ein Modell kennt auch Werte, die noch niemand beobachtet hat.',
    },
    {
      question: `Du vergrößerst σ von ${num(S.sd)} auf 1,5 Stunden. Was passiert mit der Kurve?`,
      options: ['wird breiter und flacher', 'rückt nach rechts', 'wird schmaler und höher'], correct: 0, step: 2,
      explain: 'σ ist die Streuung des Modells. Ein größeres σ verteilt dieselbe Gesamtfläche 1 auf einen breiteren Bereich, deshalb wird die Kurve flacher.',
      kurz: 'μ verschiebt, σ verbreitert.',
    },
    {
      question: 'Schieb μ mit dem Regler auf 8 Stunden. Passt das Modell dann besser oder schlechter zu den Daten?',
      options: ['besser', 'schlechter'], correct: 1, step: 3,
      explain: `Die Kurve rückt nach rechts, weg von den Balken. Unter 6 Stunden sagt das Modell dann nur noch ${pct(cdf(6, 8, S.sd))}, beobachtet sind ${pct(OBS6)}.`,
      kurz: 'Die Parameter müssen zu den Daten passen.',
    },
  ],
  regler: {
    label: 'Mitte μ des Modells, in Stunden',
    min: 6, max: 8.2, step: 0.02, initial: 7.08,
    format: v => `μ = ${num(v)} h`,
    describe: v => {
      const p = cdf(6, sleepMu(v), S.sd), gap = p - OBS6;
      const verdict = Math.abs(gap) < 0.03 ? 'Das passt gut.' : gap > 0 ? 'Das Modell sagt mehr kurze Nächte voraus, als beobachtet wurden.' : 'Das Modell sagt weniger kurze Nächte voraus, als beobachtet wurden.';
      return `Mit μ = ${num(v)} h und σ = ${num(S.sd)} h sagt das Modell: ${pct(p)} schlafen weniger als 6 Stunden. In den Daten sind es ${pct(OBS6)}. ${verdict}`;
    },
  },
  check: {
    question: 'Was unterscheidet die theoretische von der empirischen Verteilung der Schlafdauer?',
    options: [
      'Die theoretische ist ein Modell für alle möglichen Werte; die empirische fasst die 200 beobachteten Werte zusammen.',
      'Die theoretische ist eine genauere Messung derselben Daten.',
      'Die theoretische gibt nur den beobachteten Werten eine Wahrscheinlichkeit.',
      'Die empirische Verteilung ist immer eine Normalverteilung.',
    ],
    correct: 0,
    right: 'Genau. Das Modell beschreibt, was möglich ist; die Daten zeigen, was beobachtet wurde.',
    diagnose: {
      1: 'Noch nicht ganz. Gemessen wird nur einmal, in den Daten. Das Modell ist eine Annahme über alle möglichen Werte.',
      2: 'Fast! Gerade nicht: Das Modell gibt auch Werten eine Wahrscheinlichkeit, die nicht beobachtet wurden, etwa unter 5 Stunden.',
      3: 'Fast! Daten können jede Form haben, schief oder mit zwei Gipfeln. Eine Normalverteilung ist ein Modell, das man an sie heranträgt.',
    },
  },
  fuerDich: 'Hinter vielen Tests steht ein Modell, etwa „die Mittelwerte sind normalverteilt“. Liest du, ein Test setze eine Normalverteilung voraus, ist genau so eine theoretische Verteilung gemeint.',
  genau: {
    kurz: 'Eine theoretische Verteilung ist durch ihre Familie und ihre Parameter festgelegt. Ob sie zu Daten passt, lässt sich prüfen, aber nie beweisen.',
    paragraphs: [
      'Die Normalverteilung ist ein Modell mit unbeschränktem Wertebereich. Bei begrenzten Skalen, etwa 2 bis 14 Stunden Schlaf, ist ihre Eignung eine Frage der Näherung.',
      'Das Modell beschreibt auch Werte, die in der vorliegenden Stichprobe nicht vorkamen. Deshalb eignet es sich für Wahrscheinlichkeiten von Bereichen und für Simulationen.',
      'Hier sind μ und σ aus denselben Daten geschätzt, mit denen das Modell verglichen wird. Der Test auf Normalverteilung in R berücksichtigt das mit der Lilliefors-Korrektur.',
      'Es gibt viele Familien: diskrete wie Bernoulli- und Binomialverteilung für Zählungen, stetige wie Normal-, t-, Chi-Quadrat- und F-Verteilung.',
    ],
  },
};

export const theoreticalDistributionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dasselbe Modell mit allen 200 Befragten: eine Normalverteilung mit Mittelwert und Standardabweichung der Schlafdauer, verglichen mit den Daten.',
    value: c => model(c).model6,
    result: c => {
      const m = model(c);
      if (m.model6 === null) return { kurz: 'Alle haben dieselbe Schlafdauer angegeben. Eine Normalverteilung ohne Streuung gibt es nicht.', fachlich: 'Für σ = 0 ist die Normalverteilung nicht definiert.' };
      return {
        kurz: `Das Modell ist eine Normalverteilung mit μ = ${num(m.mean)} h und σ = ${num(m.sd)} h. Weniger als 6 Stunden schlafen darin ${pct(m.model6)}; in den Daten sind es ${pct(m.obs6)}.`,
        fachlich: `X ∼ N(${num(m.mean)}; ${num(m.sd)}²) mit Parametern aus x̄ und s der ${m.n} Befragten; P(X < 6) ≈ ${pct(m.model6)}.`,
        zusatz: `Beobachtet schlafen ${Math.round(m.obs6 * m.n)} von ${m.n} Befragten weniger als 6 Stunden.`,
      };
    },
    voraussetzung: 'Die Normalverteilung ist ein Modell; ob sie passt, zeigt der Vergleich mit den Daten. Die Befragten sollen unabhängig voneinander antworten.',
    think: [
      {
        question: 'Alle schlafen eine Stunde länger. Was passiert mit dem Anteil unter 6 Stunden im Modell?',
        options: ['steigt', 'bleibt gleich', 'sinkt deutlich'], correct: 2,
        explain: 'μ rückt um eine Stunde nach rechts, σ bleibt. Die Grenze von 6 Stunden liegt dann weit links im Modell; der Anteil fällt von gut 9 % auf unter 1 %.',
        kurz: 'Verschieben verschiebt das Modell mit.',
        tryIt: { label: 'alle eine Stunde länger', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'down', atLeast: 0.05 },
      },
      {
        question: 'Alle schlafen eine Stunde kürzer. Was passiert mit dem Anteil unter 6 Stunden im Modell?',
        options: ['steigt deutlich', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'μ rückt um eine Stunde nach links. Die 6 Stunden liegen dann nah an der Mitte des Modells, und fast die Hälfte der Fläche liegt darunter.',
        kurz: 'Liegt die Grenze näher an der Mitte, liegt mehr darunter.',
        tryIt: { label: 'alle eine Stunde kürzer', op: 'shift', column: 'x', value: -1 },
        expect: { change: 'up', atLeast: 0.05 },
      },
    ],
  },
  r: {
    entry: 'normality_test', variant: 0,
    outputMap: [
      { match: 'KS', atlas: 'größter Abstand zwischen Daten und Modell', step: 3, explain: 'KS misst den größten Abstand zwischen der Treppe der Daten und der Kurve F des Modells: hier 0,051, also gut 5 Prozentpunkte.' },
      { match: 'p', atlas: 'p-Wert zu KS', step: 3, explain: 'Wären die Schlafdauern in Wahrheit normalverteilt, käme ein Abstand wie 0,051 oder größer in etwa 24 von 100 Stichproben vor.' },
      { match: 'n', atlas: 'n', explain: 'n zählt die Befragten, deren Werte mit dem Modell verglichen werden.' },
    ],
    check: {
      question: 'Welche Zahl misst den größten Abstand zwischen der beobachteten Verteilung und dem Normalmodell? Tippe sie an.', correct: 'KS',
      wrong: {
        p: 'Fast! Das ist der p-Wert. Er sagt, wie überraschend der Abstand wäre, wenn das Modell stimmte; der Abstand selbst steht hinter KS.',
        n: 'Fast! n ist die Zahl der Befragten. Der Abstand steht hinter KS.',
      },
    },
  },
  next: {
    next: { id: 'density_function', why: 'Bei stetigen Modellen wie diesem steckt die Wahrscheinlichkeit in Flächen unter der Kurve.' },
    before: [
      { id: 'empirical_distribution', why: 'Die beobachtete Verteilung, mit der du das Modell vergleichst.' },
      { id: 'random_variable', why: 'Das Modell verteilt Wahrscheinlichkeiten auf die Werte einer Zufallsvariable.' },
    ],
    after: [
      { id: 'cumulative_probability', why: 'Wahrscheinlichkeiten bis zu einer Grenze, direkt aus dem Modell.' },
      { id: 'normal_distribution', why: 'Die Modellfamilie aus diesem Beispiel.' },
      { id: 'normality_test', why: 'Prüft, ob die Daten zu einem Normalmodell passen.' },
    ],
    more: [{ id: 'binomial_distribution', why: 'Ein Modell für Zählungen, etwa Treffer in n Versuchen.' }],
  },
};
