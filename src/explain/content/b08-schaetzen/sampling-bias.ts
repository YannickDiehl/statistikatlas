// Begriffskarte „Verzerrung & Zufallsfehler“ (sampling_bias). Beispiel: Eine Online-Umfrage zum Lernen erreicht vor allem
// Befragte, die feste Lernzeiten planen (Lernplanung 4 oder 5); ihr Mittelwert liegt systematisch zu hoch. Bild
// 'b08-verzerrung' mit Regler n: Zufallsfehler schrumpfen, die Verzerrung bleibt. Reiter: dieselbe Rechnung mit den Daten.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num, signed, unit } from '../../format';
import { sampleColumn } from '../../sample';
import { VERTRAUEN, columnX, mean, sd1, sdN, stufe } from './daten';

/** Wer bei der gedachten Online-Umfrage mitmacht: Zustimmung „eher“ oder „voll und ganz“ zu festen Lernzeiten. */
export const PLANT = 4;
/** Antworten, die die Online-Umfrage im Regler bekommt. */
export const VERZERRUNG_N = [10, 25, 50, 100, 250, 500, 1000, 5000] as const;

/** Mittelwert aller, der Planenden, Verzerrung und Streuungen aus den aktuellen Daten (Spalte x, Auswahl über lernplanung5). */
export function verzerrung(c: SampleCtx) {
  const x = columnX(c, 'lernzeit'), plan = sampleColumn(c.rows, 'lernplanung5');
  const sel = x.filter((_, i) => plan[i] >= PLANT);
  const alle = mean(x), teil = mean(sel);
  return { N: x.length, n: sel.length, alle, teil, bias: teil - alle, sigma: sdN(x), sigmaTeil: sdN(sel), se: sd1(sel) / Math.sqrt(sel.length) };
}

/** Feste Zahlen der Ausgangsdaten für die Karte (in R nachgerechnet, im Bereichstest auch aus den Daten). */
export const PLANUNG = { N: 200, n: 88, alle: 7.7515, teil: 8.670455, sigma: 3.229411, sigmaTeil: 2.743014 } as const;
const BIAS = PLANUNG.teil - PLANUNG.alle;

/** Bereich, in dem etwa 95 von 100 Umfragen mit n Antworten landen (Normalnäherung): Online-Umfrage und Zufallsstichprobe. */
export function bereiche(n: number) {
  const h = 1.96 * PLANUNG.sigmaTeil / Math.sqrt(n), z = 1.96 * PLANUNG.sigma / Math.sqrt(n);
  return { online: [PLANUNG.teil - h, PLANUNG.teil + h] as [number, number], zufall: [PLANUNG.alle - z, PLANUNG.alle + z] as [number, number] };
}

export function bereichText(n: number): string {
  const b = bereiche(n), drin = b.online[0] <= PLANUNG.alle;
  return `Mit ${count(n)} Antworten landet die Online-Umfrage in etwa 95 von 100 Fällen zwischen ${num(b.online[0])} und ${num(b.online[1])} Stunden. Eine Zufallsstichprobe gleicher Größe landet zwischen ${num(b.zufall[0])} und ${num(b.zufall[1])} Stunden, rund um den wahren Wert ${num(PLANUNG.alle)}. ${drin ? 'Noch überlappen sich beide Bereiche, weil der Zufallsfehler groß ist.' : 'Der wahre Wert liegt nicht einmal im Bereich der Online-Umfrage.'}`;
}

export const samplingBias: ConceptCard = {
  concept: 'sampling_bias',
  picture: 'b08-verzerrung',
  wofuer: 'Eine Online-Umfrage zum Lernen bekommt viele Antworten, aber vor allem von bestimmten Menschen. Liegt sie trotzdem richtig, wenn nur genug mitmachen?',
  kurz: 'Zufallsfehler lassen eine Schätzung mal nach oben, mal nach unten schwanken. Verzerrung heißt: Sie liegt im Mittel systematisch daneben, und mehr Befragte helfen dagegen nicht.',
  stellDirVor: {
    text: `Unter den 200 Befragten planen ${PLANUNG.n} feste Zeiten zum Lernen ein (Zustimmung „eher“ oder „voll und ganz“). Sie haben in den letzten sieben Tagen im Schnitt ${unit(PLANUNG.teil, 'Stunde', 'Stunden')} gelernt, alle 200 zusammen ${unit(PLANUNG.alle, 'Stunde', 'Stunden')}. Stell dir eine Online-Umfrage vor, bei der vor allem diese Planenden mitmachen. Sie läge im Mittel um ${unit(BIAS, 'Stunde', 'Stunden')} zu hoch, ganz gleich, wie viele antworten.`,
    figures: [
      { label: 'alle 200', value: `${num(PLANUNG.alle)} h` },
      { label: `die ${PLANUNG.n} Planenden`, value: `${num(PLANUNG.teil)} h` },
      { label: 'Verzerrung', value: `${signed(BIAS)} h` },
    ],
  },
  heisst: {
    sym: 'Bias(θ̂) = E(θ̂) − θ', say: 'Bias von theta Dach gleich E von theta Dach minus theta',
    fach: 'Die Verzerrung ist die Differenz zwischen dem Mittel der Schätzungen über alle möglichen Stichproben und dem Parameter. Der Zufallsfehler ist die Abweichung einer einzelnen Schätzung von diesem Mittel.',
  },
  bausteine: [
    {
      title: 'Zufällige Schwankung erkennen',
      was: 'Eine Zufallsstichprobe liegt mal etwas zu hoch, mal etwas zu niedrig. Im Mittel über viele Stichproben trifft sie.',
      warum: 'Dieser Zufallsfehler wird mit mehr Befragten kleiner. Wie groß er ist, misst der Standardfehler.',
      acht: 'Auch eine gute Zufallsstichprobe liegt fast nie genau richtig. Das ist kein Fehler im Verfahren.',
      concept: 'se',
    },
    {
      title: 'Systematische Abweichung erkennen',
      was: `Bei der Online-Umfrage machen vor allem Menschen mit, die viel lernen. Ihr Mittelwert liegt im Schnitt ${unit(BIAS, 'Stunde', 'Stunden')} zu hoch.`,
      rechnung: `Verzerrung = ${num(PLANUNG.teil)} − ${num(PLANUNG.alle)} ≈ ${num(BIAS)} h`,
      warum: 'Die Abweichung kommt aus der Auswahl, nicht aus dem Zufall. Sie bleibt bei jeder Wiederholung gleich.',
      acht: 'Mehr Antworten machen eine verzerrte Umfrage genauer, aber nicht richtiger. Sie trifft dann sehr verlässlich den falschen Wert.',
      concept: 'expectation',
    },
    {
      title: 'Die Ursache finden',
      was: 'Verzerrung entsteht durch eine schiefe Auswahl, durch Menschen, die nicht teilnehmen, oder durch eine ungeeignete Rechenregel.',
      warum: 'Nur wer die Ursache kennt, kann gegensteuern: mit Zufallsauswahl, Gewichtung oder einer besseren Regel.',
      acht: `Auch der ALLBUS 2023 wäre ungewichtet verzerrt, weil er den Osten mit Absicht stärker befragt. Das mittlere Vertrauen in den Bundestag läge dann bei ${num(VERTRAUEN.mean)} statt ${num(VERTRAUEN.gewichtet)}.`,
      concept: 'missing_mechanisms',
    },
  ],
  ausprobieren: [
    {
      question: 'Die Online-Umfrage bekommt 5.000 statt 100 Antworten. Was passiert mit der Verzerrung?',
      options: ['sie wird kleiner', 'sie bleibt gleich', 'sie verschwindet'], correct: 1, step: 2,
      explain: `Mehr Antworten verkleinern nur den Zufallsfehler. Die Umfrage landet dann sehr nah bei ${unit(PLANUNG.teil, 'Stunde', 'Stunden')}, also verlässlich ${unit(BIAS, 'Stunde', 'Stunden')} zu hoch. Schieb den Regler nach rechts.`,
      kurz: 'Mehr Antworten heilen keine Verzerrung.',
    },
    {
      question: 'Eine Zufallsstichprobe liegt diesmal etwas über dem wahren Wert. Ist sie deshalb verzerrt?',
      options: ['ja', 'nein, das ist Zufallsfehler'], correct: 1, step: 1,
      explain: 'Verzerrung betrifft das Mittel über viele Stichproben. Eine einzelne Abweichung kann reiner Zufall sein; beim nächsten Mal liegt die Stichprobe vielleicht darunter.',
      kurz: 'Eine Abweichung allein ist noch keine Verzerrung.',
    },
    {
      question: 'Was hilft gegen die Verzerrung der Online-Umfrage?',
      options: ['mehr Antworten sammeln', 'die Teilnehmenden zufällig auswählen'], correct: 1, step: 3,
      explain: 'Wenn der Zufall entscheidet, wer gefragt wird, kommen Planende und Nicht-Planende im richtigen Verhältnis vor. Dann trifft die Umfrage im Mittel.',
      kurz: 'Gegen Verzerrung hilft die Auswahl, nicht die Menge.',
    },
  ],
  regler: {
    label: 'Wie viele Menschen beantworten die Umfrage?',
    min: 0, max: VERZERRUNG_N.length - 1, step: 1, initial: VERZERRUNG_N.indexOf(100),
    format: v => `${count(stufe(VERZERRUNG_N, v))} Antworten`,
    describe: v => bereichText(stufe(VERZERRUNG_N, v)),
  },
  check: {
    question: 'Eine Umfrage liegt bei jeder Wiederholung ungefähr gleich weit zu hoch. Was beschreibt das?',
    options: ['Zufallsfehler', 'Verzerrung', 'Standardfehler'],
    correct: 1,
    right: 'Genau. Eine Abweichung in dieselbe Richtung bei jeder Wiederholung ist Verzerrung.',
    diagnose: {
      0: 'Fast! Zufallsfehler wechseln die Richtung: mal zu hoch, mal zu niedrig. Hier liegt die Umfrage immer zu hoch.',
      2: 'Fast! Der Standardfehler misst, wie stark Schätzungen schwanken. Eine feste Abweichung in eine Richtung misst er nicht.',
    },
  },
  fuerDich: 'Bei Umfragen mit riesiger Teilnehmerzahl lohnt die Frage: Wer hat mitgemacht und wer nicht? Eine große, aber selbst gewählte Stichprobe kann weiter danebenliegen als eine kleine Zufallsstichprobe.',
  genau: {
    kurz: 'Präzision und Verzerrung sind verschiedene Fragen. Eine sehr stabile Schätzung kann systematisch falsch liegen.',
    paragraphs: [
      'Ursachen können eine ungeeignete Schätzregel, unvollständige Erreichbarkeit oder systematische Nichtteilnahme sein.',
      'Eine größere Stichprobe verkleinert die Zufallsschwankungen, behebt aber keine Verzerrung. Den gesamten Fehler fasst der mittlere quadratische Fehler zusammen: Verzerrung zum Quadrat plus Varianz der Schätzung.',
      'Erwartungstreu heißt Bias = 0 unter den getroffenen Annahmen. Das garantiert keinen kleinen Fehler in jeder einzelnen Stichprobe.',
      `Die Bereiche im Bild sind Näherungen: Mittelwert ± 1,96 · σ / √n, mit Zurücklegen gezogen aus den ${PLANUNG.n} Planenden beziehungsweise aus allen 200. σ beträgt dort ${num(PLANUNG.sigmaTeil)} und hier ${num(PLANUNG.sigma)} Stunden.`,
      'Dass Planende länger lernen, ist ein Zusammenhang im synthetischen Lehrdatensatz. Für die Verzerrung genügt er; eine Ursache behauptet er nicht.',
    ],
  },
};

export const samplingBiasTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Eine Online-Umfrage zum Lernen erreicht vor allem Befragte, die feste Lernzeiten planen. Wie weit liegt ihr Mittelwert neben dem aller 200?',
    value: c => verzerrung(c).bias,
    result: c => {
      const v = verzerrung(c), dir = v.bias > 0.005 ? 'zu hoch' : v.bias < -0.005 ? 'zu niedrig' : 'nicht daneben';
      return {
        kurz: `Die ${v.n} Befragten, die feste Lernzeiten planen, lernen im Schnitt ${unit(v.teil, 'Stunde', 'Stunden')}. Alle ${v.N} lernen ${unit(v.alle, 'Stunde', 'Stunden')}. Die Online-Umfrage läge systematisch ${dir === 'nicht daneben' ? 'nicht daneben' : `${unit(Math.abs(v.bias), 'Stunde', 'Stunden')} ${dir}`}.`,
        fachlich: `Verzerrung = ${num(v.teil)} − ${num(v.alle)} ≈ ${signed(v.bias)} h. Der Standardfehler dieser Teilstichprobe beträgt nur ${num(v.se)} h; mehr Teilnehmende würden nur ihn verkleinern.`,
        zusatz: 'Mitmachen: Zustimmung „eher“ oder „voll und ganz“ zur Aussage „Ich plane feste Zeiten zum Lernen ein.“',
      };
    },
    voraussetzung: 'Die Lernzeiten sind die der 200 Befragten; ausgewählt wird nur über die Lernplanung. Ändert sich die Lernzeit, bleiben dieselben Personen in der Umfrage.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit der Verzerrung?',
        options: ['bleibt gleich', 'steigt um 1 Stunde', 'verschwindet'], correct: 0,
        explain: 'Beide Mittelwerte steigen um eine Stunde. Ihr Abstand, die Verzerrung, bleibt.',
        kurz: 'Verzerrung ist ein Abstand, keine Lage.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Verzerrung?',
        options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 0,
        explain: 'Beide Mittelwerte verdoppeln sich, also auch ihr Abstand. Die Auswahl bleibt dieselbe schiefe Auswahl.',
        kurz: 'Die Verzerrung wächst mit der Skala.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  next: {
    next: { id: 'missing_mechanisms', why: 'Warum Menschen nicht teilnehmen oder Angaben fehlen, entscheidet, ob eine Schätzung verzerrt wird.' },
    before: [
      { id: 'estimator', why: 'Die Rechenregel, deren Mittel über viele Stichproben am Parameter vorbeiliegen kann.' },
      { id: 'population_parameter', why: 'Der wahre Wert, an dem die Verzerrung gemessen wird.' },
    ],
    after: [
      { id: 'weights', why: 'Gewichte gleichen ungleiche Auswahlchancen aus, etwa den stärker befragten Osten im ALLBUS.' },
      { id: 'missing', why: 'Fehlende Angaben können eine Schätzung genauso verzerren wie eine schiefe Auswahl.' },
    ],
    more: [
      { id: 'random_sampling', why: 'Das beste Mittel gegen eine schiefe Auswahl.' },
      { id: 'se', why: 'Misst den Zufallsfehler, nicht die Verzerrung.' },
    ],
  },
};
