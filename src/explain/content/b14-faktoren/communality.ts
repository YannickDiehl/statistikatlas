// Formel als Satz „Kommunalität“: hⱼ² = λⱼ₁² + λⱼ₂² mit zwei Reglern für die Ladungen einer Frage. Startwerte: katholische
// Kirche im ALLBUS 2023 (gedreht, ungewichtet); die Kurzbefehle zeigen eine Frage vor und nach einer Drehung mit glatten
// Zahlen. Zahlen aus R: b14-faktoren.test.ts.
import type { ConceptTabs, SampleCtx, SentenceTemplate } from '../../types';
import { close, count, fixed, num, paren } from '../../format';
import { FRAGE, methodenPca, SPALTEN } from './rechnen';
import { NO_PCA } from './efa';
import { VERTRAUEN as V } from './allbus';
import { PCA_TOKENS } from './r-zeichen';

export type LadungenZwei = { 'λ₁': number; 'λ₂': number };
export type KommunalitaetStats = { l1: number; l2: number; s1: number; s2: number; h2: number; u2: number; possible: boolean };

/** Katholische Kirche nach Varimax, auf zwei Stellen: 0,14 auf Politik, 0,92 auf Kirchen (R: Kommunalität 0.865). */
export const KIRCHE: LadungenZwei = { 'λ₁': 0.14, 'λ₂': 0.92 };
/** Eine Frage vor und nach einer Drehung: (0,72; 0,54) und (0,9; 0) haben beide die Kommunalität 0,81. */
export const VORHER: LadungenZwei = { 'λ₁': 0.72, 'λ₂': 0.54 };
export const NACHHER: LadungenZwei = { 'λ₁': 0.9, 'λ₂': 0 };

const r2 = (v: number) => Math.round(v * 100) / 100;
/** Prozent ohne Nachkommastelle; der Rest bis 100 so, dass beide zusammen 100 ergeben. */
const pcts = (h2: number) => { const a = Math.round(h2 * 100); return [`${a} %`, `${100 - a} %`] as const; };

export const kommunalitaet: SentenceTemplate<LadungenZwei, KommunalitaetStats> = {
  concept: 'communality',
  picture: 'b14-kommunalitaet',
  wofuer: `Wie viel von dem, was eine Frage misst, erfasst eine Faktorenanalyse? Beim Vertrauen in die katholische Kirche im ALLBUS 2023 sind es 87 %, bei zwei Komponenten nach der Varimax-Rotation (${count(V.n)} Befragte, ungewichtet). Die Kommunalität rechnet das aus den Ladungen aus.`,
  kurz: 'Die Kommunalität sagt dir, welcher Anteil der Streuung einer Frage durch die gemeinsamen Faktoren erfasst wird. Der Rest gehört der Frage allein.',
  fachlich: 'Bei unkorrelierten Faktoren ist die Kommunalität hⱼ² die Summe der quadrierten Ladungen von Frage j. Was bis 1 fehlt, 1 − hⱼ², ist ihre Einzigartigkeit.',
  initial: KIRCHE,
  compute: v => {
    const l1 = v['λ₁'], l2 = v['λ₂'], s1 = l1 * l1, s2 = l2 * l2, h2 = s1 + s2;
    return { l1, l2, s1, s2, h2, u2: 1 - h2, possible: h2 <= 1 + 1e-9 };
  },
  metrics: [
    { label: 'Kommunalität hⱼ²', value: s => num(s.h2) },
    { label: 'Einzigartigkeit 1 − hⱼ²', value: s => s.possible ? num(Math.max(0, s.u2)) : 'unmöglich' },
  ],
  glyphs: [
    { key: 'h²', sym: 'hⱼ²', say: 'h j Quadrat', term: 'Kommunalität', plain: 'der Anteil der Streuung von Frage j, den die Faktoren erfassen', concept: 'communality' },
    { key: 'λ₁', sym: 'λⱼ₁', say: 'Lambda j eins', term: 'Ladungen', plain: 'wie eng Frage j mit dem ersten Faktor zusammenhängt', concept: 'loadings' },
    { key: 'λ₂', sym: 'λⱼ₂', say: 'Lambda j zwei', term: 'Ladungen', plain: 'wie eng Frage j mit dem zweiten Faktor zusammenhängt', concept: 'loadings' },
    { key: 'ψ', sym: '1 − hⱼ²', say: 'eins minus h j Quadrat', term: 'Einzigartigkeit', plain: 'was die Frage für sich allein hat, samt Messfehler' },
  ],
  symbolic: [{ part: ['hⱼ²'], m: 'h²' }, ' = ', { part: ['λⱼ₁'], m: 'λ₁' }, '² + ', { part: ['λⱼ₂'], m: 'λ₂' }, '²', '    ', { part: ['1 − hⱼ²'], m: 'ψ' }, ' = Einzigartigkeit'],
  aria: 'h j Quadrat gleich Lambda j eins zum Quadrat plus Lambda j zwei zum Quadrat. Eins minus h j Quadrat ist die Einzigartigkeit.',
  numeric: s => {
    const shown = r2(r2(s.s1) + r2(s.s2)) === r2(s.h2);
    return [{ part: ['hⱼ²'], m: 'h²' }, ' = ', { part: [paren(s.l1)], m: 'λ₁' }, '² + ', { part: [paren(s.l2)], m: 'λ₂' }, '²',
      ` ≈ ${num(s.s1)} + ${num(s.s2)} ${shown ? '=' : '≈'} `, { part: [num(s.h2)], m: 'h²' }];
  },
  sentence: ['Die ', { m: 'h²', t: 'Kommunalität' }, ' einer Frage ist ', { m: 'λ₁', t: 'ihre Ladung auf dem ersten Faktor' }, ' zum Quadrat plus ',
    { m: 'λ₂', t: 'ihre Ladung auf dem zweiten Faktor' }, ' zum Quadrat. Was bis 1 fehlt, ist ', { m: 'ψ', t: 'ihre Einzigartigkeit' }, '.'],
  worked: s => {
    const exact = r2(r2(s.s1) + r2(s.s2)) === r2(s.h2);
    return [
      { title: 'Die erste Ladung quadrieren', text: `${paren(s.l1)} · ${paren(s.l1)} ≈ ${num(s.s1)}.` },
      { title: 'Die zweite Ladung quadrieren', text: `${paren(s.l2)} · ${paren(s.l2)} ≈ ${num(s.s2)}.` },
      { title: 'Die Quadrate zusammenzählen', text: exact ? `${num(s.s1)} + ${num(s.s2)} = ${num(s.h2)}.` : `${num(s.s1)} + ${num(s.s2)} ≈ ${num(s.h2)}; mit allen Nachkommastellen gerechnet.` },
      {
        title: 'Den Rest bis 1 bestimmen',
        text: s.possible ? `1 − ${num(s.h2)} = ${num(Math.max(0, s.u2))}. So viel der Streuung gehört der Frage allein.` : `Über 1 geht es nicht: Mehr als die ganze Streuung einer Frage kann kein Faktor erfassen.`,
      },
    ];
  },
  fehler: 'Erst quadrieren, dann zusammenzählen. Wer die Ladungen zusammenzählt und dann quadriert, bekommt zu viel: (0,14 + 0,92)² ≈ 1,12 statt 0,87.',
  sliders: [
    { key: 'λ₁', label: 'Ladung auf dem ersten Faktor', min: -1, max: 1, step: 0.01, format: v => fixed(v) },
    { key: 'λ₂', label: 'Ladung auf dem zweiten Faktor', min: -1, max: 1, step: 0.01, format: v => fixed(v) },
  ],
  quick: [
    { label: 'Katholische Kirche, ALLBUS', mark: 'h²', apply: () => KIRCHE },
    { label: 'Eine Frage vor der Drehung', mark: 'λ₁', apply: () => VORHER },
    { label: 'Dieselbe Frage nach der Drehung', mark: 'λ₁', apply: () => NACHHER },
    { label: 'Vorzeichen der ersten Ladung umdrehen', mark: 'λ₁', apply: v => ({ ...v, 'λ₁': -v['λ₁'] }) },
  ],
  compare: s => `Ladungen können negativ sein, ihre Quadrate nicht. Hier tragen die beiden Faktoren ${num(s.s1)} und ${num(s.s2)} zur Kommunalität ${num(s.h2)} bei.`,
  check: {
    question: 'Eine Frage lädt mit 0,6 auf dem ersten und mit 0,3 auf dem zweiten Faktor. Wie groß ist ihre Kommunalität?',
    answer: 0.45, tolerance: 0.011,
    right: 'Genau, 0,45: 0,36 + 0,09 = 0,45.',
    diagnose: v => close(v, 0.9) ? 'Fast! Du hast die Ladungen zusammengezählt, ohne sie zu quadrieren. Erst quadrieren: 0,36 und 0,09.'
      : close(v, 0.81) ? 'Fast! Du hast die Summe quadriert. Quadriere jede Ladung einzeln und zähle dann zusammen.'
      : close(v, 0.55) ? 'Fast! Das ist die Einzigartigkeit, 1 − 0,45. Gefragt ist die Kommunalität.'
      : close(v, 0.36) ? 'Fast! Das ist nur die erste Ladung im Quadrat. Die zweite kommt noch dazu.'
      : 'Noch nicht ganz. Quadriere jede Ladung und zähle die beiden Quadrate zusammen.',
  },
  interpret: s => {
    if (!s.possible) return {
      kurz: 'Eine Kommunalität über 1 gibt es bei standardisierten Fragen nicht. Solche Ladungen kann keine echte Lösung haben.',
      fachlich: `hⱼ² = ${num(s.h2)} > 1. Meldet R so etwas, heißt das Heywood-Fall: Das Modell passt nicht zu den Daten.`,
    };
    const [a, b] = pcts(s.h2);
    return {
      kurz: `Die beiden Faktoren erfassen ${a} der Streuung dieser Frage. ${b} gehören ihr allein, samt Messfehler.`,
      fachlich: `hⱼ² = ${paren(s.l1)}² + ${paren(s.l2)}² ≈ ${num(s.h2)}; Einzigartigkeit 1 − hⱼ² ≈ ${num(Math.max(0, s.u2))}.`,
    };
  },
  think: {
    question: 'Eine Lösung wird gedreht: Die Ladungen einer Frage ändern sich von 0,72 und 0,54 zu 0,9 und 0. Was passiert mit ihrer Kommunalität?',
    options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0, mark: 'h²',
    explain: '0,72² + 0,54² ≈ 0,52 + 0,29 = 0,81 und 0,9² + 0² = 0,81. Die Drehung verteilt den erfassten Anteil nur anders auf die Faktoren.',
    kurz: 'Eine Rotation ändert Ladungen, nicht die Kommunalität.',
    hint: 'Probier oben „Eine Frage vor der Drehung“ und „Dieselbe Frage nach der Drehung“ aus.',
  },
  genau: {
    kurz: 'Die Summe der quadrierten Ladungen gilt nur für unkorrelierte Faktoren. Die Einzigartigkeit ist mehr als Messfehler.',
    paragraphs: [
      'Bei korrelierten Faktoren (Oblimin, Promax) musst du die Faktorkorrelationen Φ mitrechnen: hⱼ² ist dann das j-te Element auf der Diagonale von ΛΦΛ′.',
      'Im gemeinsamen Faktorenmodell gilt 1 = hⱼ² + ψⱼ. Die Einzigartigkeit ψⱼ enthält die Besonderheiten der Frage und ihren Messfehler, nicht nur Messfehler.',
      'In der Hauptkomponentenanalyse beschreibt die Kommunalität den Anteil, den die behaltenen Komponenten darstellen. Sie ist kein Reliabilitätskoeffizient der einzelnen Frage.',
      'Eine kleine Kommunalität zeigt, dass die Lösung diese Frage nur schlecht abbildet. Allein rechtfertigt sie nicht, die Frage zu streichen.',
      `Die Zahlen zur katholischen Kirche stammen aus dem ALLBUS 2023 (${count(V.n)} Befragte, ungewichtet, Hauptkomponenten mit Varimax). R meldet die Kommunalität 0.865; mit den auf zwei Stellen gerundeten Ladungen kommen 0,02 + 0,85 = 0,87 heraus.`,
    ],
  },
};

const pcaOf = (c: SampleCtx) => methodenPca(c, 1);

export const communalityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Die Kommunalitäten der fünf Fragen zur Methoden-Zuversicht, mit einer Hauptkomponente und allen 200 Befragten.',
    value: c => pcaOf(c)?.communalities[0] ?? null,
    result: c => {
      const p = pcaOf(c);
      if (!p) return NO_PCA;
      const h = p.communalities, [a, b] = pcts(h[0]);
      return {
        kurz: `Die Komponente erfasst bei Frage 1 ${a} ihrer Streuung, ${b} gehören der Frage allein. Bei allen fünf Fragen liegt der erfasste Anteil zwischen ${Math.round(Math.min(...h) * 100)} und ${Math.round(Math.max(...h) * 100)} %.`,
        fachlich: `Mit einer Komponente ist hⱼ² = λⱼ². Kommunalitäten: ${h.map((v, j) => `${FRAGE[j]} ${num(v)}`).join(', ')}. Zusammen ergeben sie mit allen Nachkommastellen den ersten Eigenwert ${num(p.values[0])}.`,
      };
    },
    voraussetzung: 'Mit einer einzigen Komponente ist die Kommunalität die quadrierte Ladung. Jede Frage muss streuen.',
    think: [
      {
        question: 'Frage 1 wird umgepolt, aus 7 wird 1. Was passiert mit ihrer Kommunalität?',
        options: ['bleibt gleich', 'sinkt', 'steigt'], correct: 0,
        explain: 'Die Ladung von Frage 1 wechselt nur ihr Vorzeichen. Ihr Quadrat, die Kommunalität, bleibt genau gleich.',
        kurz: 'Quadrate kennen kein Vorzeichen.',
        tryIt: { label: 'Frage 1 umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'efa', variant: 0,
    tokens: PCA_TOKENS,
    outputMap: [
      { match: '71.2%', atlas: 'Durchschnitt der Kommunalitäten', explain: 'Mit einer Komponente ergeben die fünf Kommunalitäten zusammen 3,56. Geteilt durch 5 sind das 71,2 %.' },
      { match: 'summary()', atlas: 'Tabelle mit den Kommunalitäten', explain: 'summary() zeigt die Kommunalitäten unter Communalities, Spalte Extraction, hier 0.687 bis 0.734.' },
      { match: '1 component', atlas: 'eine Komponente', explain: 'Mit einer Komponente ist die Kommunalität jeder Frage ihre quadrierte Ladung.' },
    ],
    check: {
      question: 'Welche Zahl ist der Durchschnitt der fünf Kommunalitäten? Tippe sie an.', correct: '71.2%',
      wrong: { KMO: 'Fast! Der KMO-Wert prüft vorab die Korrelationen. Der Durchschnitt der Kommunalitäten steht hinter Variance explained.' },
    },
  },
  next: {
    next: { id: 'rotation', why: 'Dreht die Ladungen, ohne die Kommunalitäten zu ändern.' },
    before: [
      { id: 'loadings', why: 'Die Ladungen, deren Quadrate die Kommunalität ergeben.' },
      { id: 'factor_model', why: 'Im Faktorenmodell ist der Rest bis 1 die Einzigartigkeit.' },
    ],
    after: [{ id: 'efa', why: 'R meldet die Kommunalitäten in summary() unter Communalities.' }],
    more: [{ id: 'measurement_error', why: 'Der Messfehler steckt in der Einzigartigkeit, aber nicht nur er.' }],
  },
};
