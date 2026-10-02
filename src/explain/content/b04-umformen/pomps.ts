// Formel als Satz „POMP“ (Begriff `pomps`): eine Antwortstufe in Prozent des Wegs von der niedrigsten zur höchsten
// Stufe umrechnen. Vorbild src/explain/content/standardfehler.ts, Ton nach streuung.ts. Zahlen in R nachgerechnet
// (mariposa::pomps), siehe b04-umformen.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { num, close, unit } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { sampleColumn } from '../../sample';
import { eq } from './shared';

export type PompValues = { x: number; hi: number };
export type PompStats = PompValues & { steps: number; range: number; share: number; pomp: number; outside: boolean };

/** POMP einer Antwort x auf einer Skala von 1 bis hi. */
export const pompOf = (x: number, hi: number, lo = 1) => 100 * (x - lo) / (hi - lo);
/** Wo eine Antwort auf dem Weg liegt, als Ortsangabe nach „liegt“: „bei drei Vierteln des Wegs“, „auf halbem Weg“. */
export function wayAt(p: number): string {
  const near = (q: number) => Math.abs(p - q) < 0.5;
  return near(0) ? 'am Anfang des Wegs' : near(100) ? 'am Ende des Wegs'
    : near(25) ? 'bei einem Viertel des Wegs' : near(50) ? 'auf halbem Weg' : near(75) ? 'bei drei Vierteln des Wegs'
    : p < 25 ? 'bei weniger als einem Viertel des Wegs' : p < 50 ? 'zwischen einem Viertel und der Hälfte des Wegs'
    : p < 62.5 ? 'bei etwas mehr als der Hälfte des Wegs' : p < 75 ? 'bei fast drei Vierteln des Wegs' : p < 100 ? 'bei mehr als drei Vierteln des Wegs' : 'jenseits des Wegs';
}
/** Wie weit der Weg reicht, nach „Das ist“: „etwas mehr als die Hälfte des Wegs“. */
export function wayText(p: number): string {
  const near = (q: number) => Math.abs(p - q) < 0.5;
  return near(0) ? 'ganz am Anfang des Wegs' : near(100) ? 'am Ende des ganzen Wegs'
    : near(25) ? 'ein Viertel des Wegs' : near(50) ? 'auf halbem Weg' : near(75) ? 'drei Viertel des Wegs'
    : p < 25 ? 'weniger als ein Viertel des Wegs' : p < 50 ? 'zwischen einem Viertel und der Hälfte des Wegs'
    : p < 62.5 ? 'etwas mehr als die Hälfte des Wegs' : p < 75 ? 'fast drei Viertel des Wegs' : p < 100 ? 'mehr als drei Viertel des Wegs' : 'über das Ende des Wegs hinaus';
}

export const pomps: SentenceTemplate<PompValues, PompStats> = {
  concept: 'pomps',
  picture: 'b04-pomps',
  wofuer: 'Der Lehrdatensatz fragt Zustimmung mal mit 5, mal mit 7, mal mit 10 Stufen ab. Ist eine 4 auf der einen Skala viel oder wenig im Vergleich zu einer 4 auf der anderen? POMP rechnet jede Antwort auf denselben Bereich von 0 bis 100 um.',
  kurz: 'POMP sagt dir, wie viel Prozent des Wegs von der niedrigsten zur höchsten Stufe eine Antwort zurückgelegt hat. Die niedrigste Stufe wird 0, die höchste 100.',
  fachlich: 'POMP = 100 · (x − min) / (max − min) mit den theoretischen Endpunkten der Antwortskala (percent of maximum possible). Die Umrechnung ist linear; Reihenfolge und Korrelationen bleiben erhalten.',
  initial: { x: 4, hi: 5 },
  compute: v => {
    const range = v.hi - 1, steps = v.x - 1, share = steps / range;
    return { ...v, range, steps, share, pomp: 100 * share, outside: v.x > v.hi };
  },
  metrics: [
    { label: 'Antwort x', value: s => num(s.x) },
    { label: 'Skala', value: s => `1 bis ${num(s.hi)}` },
    { label: 'POMP', value: s => num(s.pomp) },
  ],
  glyphs: [
    { key: 'pomp', sym: 'POMP', say: 'Pomp', term: titleFor(ref('pomps')), plain: 'wie viel Prozent des Wegs von der niedrigsten zur höchsten Stufe eine Antwort zurückgelegt hat', concept: 'pomps' },
    { key: 'x', sym: 'x', say: 'x', term: 'Antwort', plain: 'die angekreuzte Stufe' },
    { key: 'min', sym: 'min', say: 'min', term: 'niedrigste Stufe', plain: 'das untere Ende der Antwortskala, im Lehrdatensatz immer 1' },
    { key: 'hi', sym: 'max', say: 'max', term: 'höchste Stufe', plain: 'das obere Ende der Antwortskala, etwa 5, 7 oder 10' },
    { key: 'range', sym: 'max − min', say: 'max minus min', term: 'Spannweite', plain: 'wie viele Stufen es von ganz unten bis ganz oben sind', concept: 'range' },
  ],
  symbolic: [{ part: ['POMP'], m: 'pomp' }, ' = 100 · ', { frac: [{ part: ['x'], m: 'x' }, ' − ', { part: ['min'], m: 'min' }], den: [{ part: ['max'], m: 'hi' }, ' − ', { part: ['min'], m: 'min' }], m: 'range' }],
  aria: 'POMP gleich 100 mal x minus min, geteilt durch max minus min',
  numeric: s => [
    { part: ['POMP'], m: 'pomp' }, ' = 100 · (', { part: [num(s.x)], m: 'x' }, ' − ', { part: ['1'], m: 'min' }, ') / (', { part: [num(s.hi)], m: 'hi' }, ' − ', { part: ['1'], m: 'min' }, ')',
    ` = 100 · ${num(s.steps)} / ${num(s.range)} ${eq(s.pomp)} `, { part: [num(s.pomp)], m: 'pomp' },
  ],
  sentence: ['Der ', { m: 'pomp', t: 'POMP-Wert' }, ' sagt, wie viel Prozent des Wegs ', { m: 'x', t: 'eine Antwort' }, ' von ', { m: 'min', t: 'der niedrigsten Stufe' }, ' bis ', { m: 'hi', t: 'zur höchsten' }, ' zurückgelegt hat, gemessen an ', { m: 'range', t: 'der ganzen Spannweite' }, '.'],
  worked: s => [
    { title: 'Vom unteren Ende aus zählen', text: `${num(s.x)} − 1 = ${unit(s.steps, 'Stufe', 'Stufen')} über der niedrigsten Antwort.` },
    { title: 'Durch die ganze Spannweite teilen', text: `${num(s.steps)} / (${num(s.hi)} − 1) = ${num(s.steps)} / ${num(s.range)} ${eq(s.share)} ${num(s.share)} des Wegs.` },
    { title: 'In Prozent umrechnen', text: `${num(s.steps)} / ${num(s.range)} · 100 ${eq(s.pomp)} ${num(s.pomp)}.${s.outside ? ' Über 100 heißt: Diese Antwort liegt außerhalb der Skala.' : ''}` },
  ],
  fehler: 'Nimm die Endpunkte der Antwortskala, nicht die kleinste und größte Antwort in deinen Daten. Sonst hängt POMP davon ab, wer zufällig befragt wurde.',
  sliders: [
    { key: 'x', label: 'Angekreuzte Stufe', min: 1, max: 10, step: 1, format: v => num(v) },
    { key: 'hi', label: 'Höchste Stufe der Skala', min: 2, max: 10, step: 1, format: v => num(v) },
  ],
  quick: [
    { label: '5 Stufen', mark: 'hi', apply: v => ({ ...v, hi: 5 }) },
    { label: '7 Stufen', mark: 'hi', apply: v => ({ ...v, hi: 7 }) },
    { label: '10 Stufen', mark: 'hi', apply: v => ({ ...v, hi: 10 }) },
  ],
  compare: s => {
    const parts = [5, 7, 10].filter(h => s.x <= h).map(h => `auf einer Skala bis ${h} den Wert ${num(pompOf(s.x, h))}`);
    return parts.length ? `Dieselbe Antwort ${num(s.x)} ergibt ${parts.join(', ')}.` : `Eine Antwort ${num(s.x)} gibt es auf keiner der Skalen bis 5, 7 oder 10.`;
  },
  check: {
    question: 'Jemand kreuzt auf einer Skala von 1 bis 7 die 5 an. Wie groß ist POMP?',
    answer: 400 / 6, tolerance: 0.011,
    right: 'Genau, rund 66,67: 100 · (5 − 1) / (7 − 1) = 100 · 4 / 6.',
    diagnose: v => close(v, 500 / 6, 0.05) ? 'Fast! Du hast 5 / 6 gerechnet. Zieh auch oben die 1 ab: (5 − 1) / (7 − 1).'
      : close(v, 500 / 7, 0.05) ? 'Fast! Du hast 5 / 7 gerechnet. Zieh oben und unten die 1 ab: (5 − 1) / (7 − 1).'
      : close(v, 400 / 7, 0.05) ? 'Fast! Teile durch die Spannweite 7 − 1 = 6, nicht durch 7.'
      : close(v, 4 / 6, 0.005) ? 'Fast! Das ist der Anteil des Wegs. Jetzt noch mal 100 nehmen.'
      : 'Noch nicht ganz. Rechne erst 5 − 1, teile durch 7 − 1 und nimm das Ergebnis mal 100.',
  },
  interpret: s => {
    if (s.outside) return {
      kurz: `Eine Antwort ${num(s.x)} gibt es auf einer Skala bis ${num(s.hi)} nicht. Der POMP-Wert läge mit ${num(s.pomp)} über 100.`,
      fachlich: `POMP = 100 · (${num(s.x)} − 1) / (${num(s.hi)} − 1) ${eq(s.pomp)} ${num(s.pomp)}. Werte über 100 zeigen eine Antwort außerhalb der Endpunkte, oft einen nicht umkodierten Code für fehlende Angaben.`,
    };
    const other = s.hi === 7 ? 5 : 7;
    return {
      kurz: `Die Antwort ${num(s.x)} liegt ${wayAt(s.pomp)} von der niedrigsten zur höchsten Stufe: POMP ${num(s.pomp)}. ${s.x <= other ? `Auf einer Skala bis ${other} ergäbe dieselbe ${num(s.x)} den Wert ${num(pompOf(s.x, other))}.` : `Auf einer Skala bis ${other} gäbe es diese Antwort nicht.`}`,
      fachlich: `POMP = 100 · (x − min) / (max − min) = 100 · (${num(s.x)} − 1) / (${num(s.hi)} − 1) ${eq(s.pomp)} ${num(s.pomp)}. 0 steht für die niedrigste, 100 für die höchste Stufe.`,
    };
  },
  think: {
    question: 'Auf einer Skala von 1 bis 5 kommt jemand auf POMP 50. Welche Stufe wurde angekreuzt?', options: ['2', '3', '4'], correct: 1, mark: 'x',
    explain: '50 % des Wegs von 1 bis 5 sind 2 von 4 Stufen: 1 + 2 = 3. POMP 50 ist immer die Mitte der Skala.',
    kurz: 'POMP 50 ist die Mitte der Skala.',
    hint: 'Stell oben die Stufe auf 3 und die höchste Stufe auf 5.',
  },
  genau: {
    kurz: 'POMP macht Skalen mit verschiedenen Stufen nebeneinander lesbar. Gleich gut gemessen sind sie dadurch nicht.',
    paragraphs: [
      'POMP steht für percent of maximum possible, Prozent des größtmöglichen Werts (Cohen und andere, 1999). In mariposa heißt die Funktion pomps(), mit scale_min und scale_max für die Endpunkte.',
      'Nimm die theoretischen Endpunkte der Skala. Ohne scale_min und scale_max nimmt pomps() die kleinste und größte Antwort in den Daten; dann hängt der Wert davon ab, wer befragt wurde.',
      'POMP ist eine lineare Umrechnung: Mittelwerte lassen sich genauso umrechnen, Standardabweichungen mal 100 / (max − min). Die Reihenfolge der Befragten bleibt.',
      'Wer POMP-Werte mittelt, nimmt gleich große Abstände zwischen den Antwortstufen an. Ein gemeinsamer Bereich von 0 bis 100 macht verschiedene Fragen noch nicht zu einer gemeinsamen Skala.',
    ],
  },
};

/** Lernplanung (1 bis 5) als POMP für die aktuellen Daten: Mittelwert der Antworten und der POMP-Werte, Zahl der Einsen und Fünfen. */
export function pompLernplanung(c: SampleCtx) {
  const xs = sampleColumn(c.rows, c.columns.x?.[0] ?? 'lernplanung5'), n = xs.length, mean = xs.reduce((a, b) => a + b, 0) / n;
  return { n, mean, pomp: pompOf(mean, 5), ones: xs.filter(v => v === 1).length, fives: xs.filter(v => v === 5).length };
}

export const tabsPomps: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernplanung5' },
    kurz: 'Dieselbe Umrechnung für alle 200 Befragten: Lernplanung von 1 bis 5 wird zu 0 bis 100.',
    value: c => pompLernplanung(c).pomp,
    result: c => {
      const p = pompLernplanung(c);
      return {
        kurz: `Im Schnitt kommen die ${p.n} Befragten bei der Lernplanung auf einen POMP-Wert von ${num(p.pomp)}. Das ist ${wayText(p.pomp)} von „Stimme überhaupt nicht zu“ bis „Stimme voll und ganz zu“.`,
        fachlich: `Mittelwert ${num(p.mean)} auf der Skala von 1 bis 5, also POMP = 100 · (${num(p.mean)} − 1) / 4 ${eq(p.pomp)} ${num(p.pomp)}. Einzelne Antworten: 1 wird 0, 2 wird 25, 3 wird 50, 4 wird 75, 5 wird 100.`,
        zusatz: `${p.ones} Befragte haben „Stimme überhaupt nicht zu“ angekreuzt (POMP 0), ${p.fives} „Stimme voll und ganz zu“ (POMP 100).`,
      };
    },
    voraussetzung: 'POMP nimmt gleich große Abstände zwischen den fünf Antwortstufen an. Die Endpunkte 1 und 5 kommen aus der Frage, nicht aus den Daten.',
    think: [
      {
        question: 'Angenommen, alle stimmen voll und ganz zu (5). Welcher mittlere POMP-Wert kommt heraus?', options: ['5', '100', '80'], correct: 1,
        explain: 'Die höchste Stufe ist der ganze Weg: 100 · (5 − 1) / 4 = 100. Und wenn alle 100 haben, ist auch der Mittelwert 100.',
        kurz: 'Die höchste Stufe ist immer POMP 100.',
        tryIt: { label: 'alle auf „Stimme voll und ganz zu“ (5)', op: 'constant', column: 'x', value: 5 },
        expect: { change: 'equals', value: 100 },
      },
      {
        question: 'Die Frage wird umgepolt: Aus 5 wird 1, aus 4 wird 2. Was passiert mit dem mittleren POMP-Wert?', options: ['bleibt gleich', 'sinkt, auf 100 minus den alten Wert', 'steigt'], correct: 1,
        explain: 'Jeder POMP-Wert p wird zu 100 − p. In den Ausgangsdaten wird aus 56,5 der Wert 43,5; weil der alte Wert über 50 lag, sinkt er.',
        kurz: 'Umpolen spiegelt POMP an der 50.',
        tryIt: { label: 'Lernplanung umpolen (6 minus Antwort)', op: 'reverse', column: 'x' },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'pomps', variant: 0,
    tokens: {
      pomps: { sym: 'pomps()', term: titleFor(ref('pomps')), kurz: 'Rechnet Antworten in Prozent des Wegs von scale_min bis scale_max um. Das Ergebnis reicht von 0 bis 100.', fehler: 'Vertauschst du die Endpunkte, bricht mariposa ab: `scale_min` (5) must be less than `scale_max` (1).' },
      scale_min: { sym: 'scale_min =', term: 'niedrigste Stufe', kurz: 'Das untere Ende der Antwortskala, hier 1 für „Stimme überhaupt nicht zu“. Es wird zu POMP 0.', fehler: 'Zu hoch angesetzt, etwa scale_min = 2, warnt mariposa: `lernplanung5` has value outside the scale range 2-5: 1. Dann entstehen Werte unter 0.' },
      scale_max: { sym: 'scale_max =', term: 'höchste Stufe', kurz: 'Das obere Ende der Antwortskala, hier 5 für „Stimme voll und ganz zu“. Es wird zu POMP 100.', fehler: 'Ohne scale_max nimmt pomps() die größte Antwort in den Daten. Dann hängt der Wert davon ab, wer befragt wurde.' },
    },
    outputMap: [
      { match: '56.500', atlas: 'mittlerer POMP-Wert', explain: 'Der Mittelwert der neuen Spalte pomp: 100 · (3,26 − 1) / 4 = 56,5.' },
      { match: 'Mean', atlas: 'x̄ auf der Skala 1 bis 5', explain: 'Der Mittelwert der ursprünglichen Antworten. Umgerechnet ergibt er den mittleren POMP-Wert.' },
      { match: '0.000', atlas: 'niedrigster POMP-Wert', explain: '„Stimme überhaupt nicht zu“ wird zu 0.' },
      { match: '100.000', atlas: 'höchster POMP-Wert', explain: 'Wer „Stimme voll und ganz zu“ angekreuzt hat, bekommt 100.' },
    ],
    check: {
      question: 'Welche Zahl ist der mittlere POMP-Wert? Tippe sie an.', correct: '56.500',
      wrong: {
        Mean: 'Fast! Das ist der Mittelwert auf der alten Skala von 1 bis 5. Der POMP-Wert steht in der Zeile pomp.',
        '100.000': 'Fast! Das ist der höchste POMP-Wert. Den Mittelwert findest du unter Mean in der Zeile pomp.',
      },
    },
  },
  next: {
    next: { id: 'item_score', why: 'Auch ein Skalenwert fasst Antworten zusammen; POMP macht ihn auf 0 bis 100 lesbar.' },
    before: [
      { id: 'scaling', why: 'POMP teilt durch die Spannweite der Skala, nachdem das Minimum abgezogen ist.' },
      { id: 'range', why: 'Die Breite der Skala von der niedrigsten zur höchsten Stufe.' },
    ],
    after: [
      { id: 'recode', why: 'Umpolen spiegelt POMP an der 50: aus 75 wird 25.' },
    ],
    more: [
      { id: 'ordinal', why: 'Zustimmungsstufen sind geordnet; POMP nimmt zusätzlich gleiche Abstände an.' },
    ],
  },
};
