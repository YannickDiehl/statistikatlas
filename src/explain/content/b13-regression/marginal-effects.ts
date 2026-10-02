// Formel als Satz „Marginale Effekte“ (Bereich B13) mit Reitern. Beispiel: mindestens 10 Aufgaben nach Lernzeit
// (b₁ ≈ 0,34); Mit 200 Befragten und In R: das Katalogmodell weiterbildung ~ lernzeit + alter.
// Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptTabs, SentenceTemplate } from '../../types';
import { num, signed, close } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { coef } from './gerade';
import { BESTANDEN as BE, LOGISTIC_TOKEN, wbModel } from './logistisch-kit';

export type MeValues = { b: number; p: number };
export type MeStats = MeValues & { q: number; pq: number; me: number };
const pp = (v: number) => `${num(v * 100, 1)} Prozentpunkte`;
const shown = (v: number) => Math.round(v * 100) / 100;
const eq = (v: number) => Math.abs(shown(v) - v) > 1e-9 ? '≈' : '=';

export const marginaleEffekte: SentenceTemplate<MeValues, MeStats> = {
  concept: 'marginal_effects',
  wofuer: 'Ein Logitmodell sagt: Je Stunde Lernzeit steigt der Logit, mindestens 10 Aufgaben zu lösen, um 0,34. Aber um wie viele Prozentpunkte steigt die Wahrscheinlichkeit? Das hängt davon ab, wo jemand auf der S-Kurve steht. Bei 8 Stunden liegt die vorhergesagte Wahrscheinlichkeit bei 0,66.',
  kurz: 'Ein marginaler Effekt übersetzt eine Logit-Steigung in Prozentpunkte. Er ist in der Mitte der S-Kurve am größten und an den Rändern klein.',
  fachlich: 'Die Ableitung der vorhergesagten Wahrscheinlichkeit nach x: ME = b · p · (1 − p). Der mittlere marginale Effekt (AME) mittelt sie über alle Personen.',
  initial: { b: 0.34, p: 0.66 },
  compute: v => { const q = 1 - v.p, pq = v.p * q; return { ...v, q, pq, me: v.b * pq }; },
  metrics: [
    { label: 'p · (1 − p)', value: s => num(s.pq) },
    { label: 'Marginaler Effekt', value: s => pp(s.me) },
  ],
  glyphs: [
    { key: 'me', sym: 'ME', say: 'M E', term: 'Marginale Effekte', plain: 'wie viele Prozentpunkte die Wahrscheinlichkeit je Einheit von x steigt oder sinkt', concept: 'marginal_effects' },
    { key: 'b', sym: 'b', say: 'b', term: 'Logit-Steigung', plain: 'wie stark sich der Logit je Einheit von x ändert' },
    { key: 'p', sym: 'p', say: 'p', term: 'Ereignis & Wahrscheinlichkeit', plain: 'die vorhergesagte Wahrscheinlichkeit an dieser Stelle', concept: 'probability' },
    { key: 'q', sym: '1 − p', say: 'eins minus p', term: 'Gegenwahrscheinlichkeit', plain: 'die Wahrscheinlichkeit für Nein' },
  ],
  symbolic: [{ part: ['ME'], m: 'me' }, ' = ', { part: ['b'], m: 'b' }, ' · ', { part: ['p'], m: 'p' }, ' · ', { part: ['(1 − p)'], m: 'q' }],
  aria: 'M E gleich b mal p mal eins minus p',
  numeric: s => [{ part: ['ME'], m: 'me' }, ' = ', { part: [num(s.b)], m: 'b' }, ' · ', { part: [num(s.p)], m: 'p' }, ' · ', { part: [num(s.q)], m: 'q' }, ' ≈ ', { part: [num(s.me, 3)], m: 'me' }],
  sentence: ['Der ', { m: 'me', t: 'marginale Effekt' }, ' ist ', { m: 'b', t: 'die Logit-Steigung' }, ' mal ', { m: 'p', t: 'der Wahrscheinlichkeit' }, ' mal ', { m: 'q', t: 'ihrer Gegenwahrscheinlichkeit' }, '.'],
  worked: s => [
    { title: 'Wahrscheinlichkeit und Gegenwahrscheinlichkeit malnehmen', text: `${num(s.p)} · ${num(s.q)} ${eq(s.pq)} ${num(s.pq)}. Am größten wird das bei p = 0,5: 0,5 · 0,5 = 0,25.` },
    { title: 'Mit der Logit-Steigung malnehmen', text: `${num(s.b)} · ${num(s.pq)} ≈ ${num(s.me, 3)}${num(s.b * shown(s.pq), 3) === num(s.me, 3) ? '' : '; R rechnet mit allen Nachkommastellen'}.` },
    { title: 'In Prozentpunkte übersetzen', text: `${num(s.me, 3)} sind ${pp(s.me)} je Einheit von x, an dieser Stelle der S-Kurve.` },
  ],
  fehler: 'Der marginale Effekt gilt für einen kleinen Schritt an einer Stelle der S-Kurve. Für eine ganze Stunde ist die Änderung etwas anders, für andere Personen auch. Deshalb mittelt R über alle Personen.',
  sliders: [
    { key: 'b', label: 'Logit-Steigung b', min: -1, max: 1, step: 0.01, format: v => num(v) },
    { key: 'p', label: 'Wahrscheinlichkeit p', min: 0.01, max: 0.99, step: 0.01, format: v => num(v) },
  ],
  quick: [
    { label: 'Mitte der S-Kurve: p = 0,5', mark: 'p', apply: v => ({ ...v, p: 0.5 }) },
    { label: 'Am Rand: p = 0,95', mark: 'q', apply: v => ({ ...v, p: 0.95 }) },
    { label: 'Beispiel: 8 Stunden', mark: 'b', apply: () => ({ b: 0.34, p: 0.66 }) },
  ],
  compare: s => `In der Mitte, bei p = 0,5, wäre der Effekt am größten: b / 4 = ${num(s.b / 4, 3)}. Hier ist er ${num(s.me, 3)}.`,
  check: {
    question: 'b = 0,8 und p = 0,5. Wie groß ist der marginale Effekt?',
    answer: 0.2, tolerance: 0.011,
    right: 'Genau, 0,2: 0,8 · 0,5 · 0,5 = 0,2, also 20 Prozentpunkte je Einheit.',
    diagnose: v => close(v, 0.8) ? 'Fast! Das ist noch b selbst. Nimm es mit p und mit 1 − p mal.'
      : close(v, 0.4) ? 'Fast! Es fehlt noch der Faktor 1 − p.'
      : close(v, 0.25) ? 'Fast! 0,25 ist p · (1 − p). Jetzt noch mit b malnehmen.'
      : close(v, 20) ? 'Fast! Das sind schon Prozentpunkte. Als Zahl ist der Effekt 0,2.'
      : 'Noch nicht ganz. Rechne b mal p mal (1 − p).',
  },
  interpret: s => {
    if (Math.abs(s.me) < 0.0005) return { kurz: 'Hier ändert sich die Wahrscheinlichkeit mit x kaum.', fachlich: `ME = ${num(s.b)} · ${num(s.p)} · ${num(s.q)} ≈ ${num(s.me, 3)}.` };
    const where = Math.abs(s.p - 0.5) < 0.005 ? 'Mehr ist bei dieser Steigung nicht möglich.' : `In der Mitte, bei p = 0,5, wären es ${pp(Math.abs(s.b / 4))}.`;
    return {
      kurz: `An dieser Stelle der S-Kurve ${s.me > 0 ? 'steigt' : 'sinkt'} die Wahrscheinlichkeit je Einheit von x um etwa ${pp(Math.abs(s.me))}. ${where}`,
      fachlich: `ME = b · p · (1 − p) = ${num(s.b)} · ${num(s.p)} · ${num(s.q)} ≈ ${num(s.me, 3)}. Das ist die Steigung der S-Kurve an dieser Stelle, auf der Skala der Wahrscheinlichkeit.`,
    };
  },
  think: {
    question: 'Wo ist der marginale Effekt bei gleichem b am größten?',
    options: ['bei p = 0,5', 'bei p nahe 1', 'überall gleich'], correct: 0, mark: 'p',
    explain: 'p · (1 − p) ist bei p = 0,5 am größten, nämlich 0,25. Dort ist die S-Kurve am steilsten; zu den Rändern hin wird sie flach.',
    kurz: 'In der Mitte der S-Kurve ändert sich die Wahrscheinlichkeit je Einheit am stärksten.',
    hint: 'Probier oben „Mitte der S-Kurve: p = 0,5“ aus.',
  },
  genau: {
    kurz: 'R mittelt den marginalen Effekt über alle Personen, das ist der AME. Für Kategorien vergleicht R stattdessen Gruppen.',
    paragraphs: [
      `Der mittlere marginale Effekt (AME) ist der Durchschnitt von b · pᵢ · (1 − pᵢ) über alle Personen. Für mindestens 10 Aufgaben nach Lernzeit meldet R AME = 0.065: je Stunde im Schnitt ${pp(BE.ame)}.`,
      `Daraus folgt eine Faustregel: b / 4 ist der größtmögliche Effekt. Bei b ≈ ${num(BE.b1)} sind das, mit allen Nachkommastellen gerechnet, ${pp(BE.b1 / 4)} je Stunde.`,
      'mariposa rechnet die Ableitung numerisch und ihren Standardfehler mit der Delta-Methode. Für Kategorien vergleicht es jede Stufe mit der Vergleichsgruppe, statt abzuleiten.',
      'Die Formel gilt für einen metrischen Prädiktor ohne Interaktion. Lineare Modelle brauchen sie nicht: Dort ist der Koeffizient selbst der marginale Effekt.',
    ],
  },
};

export const marginaleEffekteTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'weiterbildung' },
    kurz: 'Das Modell aus dem R-Aufruf mit allen 200 Befragten: Um wie viele Prozentpunkte ändert sich die Wahrscheinlichkeit einer Weiterbildung je Stunde Lernzeit?',
    value: c => wbModel(c)?.ame ?? null,
    result: c => {
      const m = wbModel(c);
      if (!m) return { kurz: 'Mit diesen Daten lässt sich das Logitmodell nicht schätzen.', fachlich: 'Es braucht Ja- und Nein-Antworten und Prädiktoren, die Ja und Nein nicht vollständig trennen.' };
      const tiny = Math.abs(m.ame) < 0.005;
      return {
        kurz: `Je Stunde Lernzeit ändert sich die Wahrscheinlichkeit einer Weiterbildung im Schnitt um ${signed(m.ame * 100)} Prozentpunkte, bei gleichem Alter. ${tiny ? 'Das ist so gut wie nichts.' : m.ame > 0 ? 'Wer länger lernt, hat eher eine Weiterbildung gemacht.' : 'Wer länger lernt, hat seltener eine Weiterbildung gemacht.'}`,
        fachlich: `AME = Durchschnitt von b₁ · pᵢ · (1 − pᵢ) über alle ${m.n} Befragten ≈ ${coef(m.ame)}, mit b₁ ≈ ${coef(m.b[1])}.`,
        zusatz: `Im Betrag größer als |b₁| / 4 ≈ ${coef(Math.abs(m.b[1]) / 4)} kann der Effekt bei keiner Person werden; so groß wäre er bei p = 0,5.`,
      };
    },
    voraussetzung: 'Der AME gilt für das Modell mit Lernzeit und Alter und für diese Befragten. Er beschreibt einen Zusammenhang, keine Wirkung.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was macht der AME der Lernzeit?', options: ['verdoppelt sich', 'halbiert sich', 'bleibt gleich'], correct: 1,
        explain: 'Der Logit-Koeffizient halbiert sich, jede Person behält ihr p. Damit halbiert sich auch jeder marginale Effekt und ihr Durchschnitt.',
        kurz: 'Ein Effekt je Stunde hängt davon ab, wie lang eine Stunde ist.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 0.5 },
      },
      {
        question: 'Die Weiterbildung wird umgepolt: Aus Ja wird Nein und aus Nein Ja. Was macht der AME?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'b₁ wechselt das Vorzeichen, und aus p wird 1 − p. Das Produkt p · (1 − p) bleibt gleich, also dreht nur das Vorzeichen.',
        kurz: 'Was bei Ja dazukommt, fehlt bei Nein.',
        tryIt: { label: 'Weiterbildung umpolen (Ja und Nein tauschen)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'marginal_effects', variant: 0,
    tokens: {
      logistic_regression: LOGISTIC_TOKEN,
      marginal_effects: { sym: 'marginal_effects()', term: titleFor(ref('marginal_effects')), kurz: 'Rechnet ein Logitmodell in Änderungen der Wahrscheinlichkeit um, gemittelt über alle Personen.', fehler: 'Für ein lineares Modell meldet mariposa: Average marginal effects are not needed for a linear model.' },
    },
    outputMap: [
      { match: 'lernzeit: AME', atlas: 'AME der Lernzeit', explain: 'Je Stunde ändert sich die Wahrscheinlichkeit einer Weiterbildung im Schnitt um etwa −0,1 Prozentpunkte, genauer um −0,14 Prozentpunkte.' },
      { match: 'alter: AME', atlas: 'AME des Alters', explain: 'Je Lebensjahr ändert sich die Wahrscheinlichkeit im Schnitt um etwa −0,2 Prozentpunkte.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es keinen Zusammenhang, käme ein AME dieser Größe in etwa 89 von 100 Stichproben vor.' },
    ],
    check: {
      question: 'Welche Zahl ist der mittlere marginale Effekt der Lernzeit? Tippe sie an.', correct: 'lernzeit: AME',
      wrong: {
        'alter: AME': 'Fast! Das ist der AME des Alters. Gefragt ist die Zeile lernzeit.',
        p: 'Fast! Das ist der p-Wert. Der AME steht hinter AME =.',
      },
    },
  },
  next: {
    next: { id: 'effect', why: 'Prozentpunkte sind eine Effektgröße, die man ohne Logits versteht.' },
    before: [
      { id: 'logistic_regression', why: 'Das Modell, dessen Koeffizienten hier übersetzt werden.' },
      { id: 'logit', why: 'Die Skala, auf der die Koeffizienten stehen.' },
    ],
    after: [{ id: 'confidence', why: 'Wie genau der AME geschätzt ist, zeigt sein Intervall.' }],
    more: [
      { id: 'linear_regression', why: 'Dort ist der Koeffizient selbst schon der marginale Effekt.' },
      { id: 'interaction', why: 'Mit Interaktion hängt der marginale Effekt zusätzlich von der anderen Variable ab.' },
    ],
  },
};
