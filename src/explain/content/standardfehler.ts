// Vorlage „Formel als Satz“ (Stufe 2) am Beispiel Standardfehler. Wortlaut: docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt/04-standardfehler.md
import type { SentenceTemplate } from '../types';
import { standardError } from '../math';
import { num, count, close } from '../format';

/** ALLBUS 2023, politisches Interesse (pa02a) umgepolt, ungewichtet, aggregiert. */
export const INTEREST = { mean: 3.297, sd: 0.94, n: 5225 } as const;

export type SeValues = { s: number; n: number };
export type SeStats = SeValues & { root: number; se: number; moe: number; lo: number; hi: number };

export const standardfehler: SentenceTemplate<SeValues, SeStats> = {
  concept: 'se',
  wofuer: 'Umfragen berichten Mittelwerte oft mit einem ±. Das politische Interesse liegt im ALLBUS 2023 im Mittel bei 3,30 (umgepolt: 1 = überhaupt nicht, 5 = sehr stark). Wie genau ist diese Zahl, wenn 5.225 Befragte gültig geantwortet haben?',
  kurz: 'Der Standardfehler sagt, wie genau ein Mittelwert aus einer Stichprobe ist. Je kleiner, desto genauer.',
  fachlich: 'Die geschätzte Standardabweichung der Stichprobenverteilung des Mittelwerts.',
  initial: { s: INTEREST.sd, n: INTEREST.n },
  compute: v => {
    const se = standardError(v.s, v.n), moe = 1.96 * se;
    return { ...v, root: Math.sqrt(v.n), se, moe, lo: INTEREST.mean - moe, hi: INTEREST.mean + moe };
  },
  metrics: [
    { label: 'Mittelwert x̄', value: () => num(INTEREST.mean, 3) },
    { label: 'Standardfehler SE', value: s => num(s.se, 3) },
  ],
  glyphs: [
    { key: 'se', sym: 'SE', say: '„S E“', term: 'Standardfehler', plain: 'wie stark der Mittelwert von Stichprobe zu Stichprobe schwanken würde', concept: 'se' },
    { key: 's', sym: 's', say: '„s“', term: 'Standardabweichung', plain: 'wie verschieden die Befragten antworten', concept: 'sd' },
    { key: 'sqrt', sym: '√', say: '„Wurzel“', term: 'Quadratwurzel', plain: 'welche Zahl ergibt mal sich selbst n?', concept: 'sqrt' },
    { key: 'n', sym: 'n', say: '„n“', term: 'Fallzahl', plain: 'wie viele gültige Antworten es gibt', concept: 'validn' },
  ],
  symbolic: [{ part: ['SE'], m: 'se' }, ' = ', { frac: [{ part: ['s'], m: 's' }], den: [{ big: '√', m: 'sqrt' }, { root: [{ part: ['n'], m: 'n' }], m: 'sqrt' }], m: 'sqrt' }],
  aria: 'S E gleich s geteilt durch Wurzel aus n',
  numeric: s => [{ part: ['SE'], m: 'se' }, ' = ', { part: [num(s.s)], m: 's' }, ' / ', { part: ['√'], m: 'sqrt' }, { part: [count(s.n)], m: 'n' },
    ` = ${num(s.s)} / ${num(s.root)} ≈ ${num(s.se, 3)}`],
  sentence: ['Der ', { m: 'se', t: 'Standardfehler' }, ' ist ', { m: 's', t: 'die Standardabweichung der Antworten' }, ', geteilt durch ', { m: 'sqrt', t: 'die Quadratwurzel' }, ' aus ', { m: 'n', t: 'der Fallzahl' }, '.'],
  worked: s => [
    { title: 'Quadratwurzel der Fallzahl', text: `√${count(s.n)} ≈ ${num(s.root)}. Probe: ${num(s.root)} · ${num(s.root)} ≈ ${count(s.n)}.` },
    { title: 'Standardabweichung durch diese Zahl teilen', text: `${num(s.s)} / ${num(s.root)} ≈ ${num(s.se, 3)}.` },
    { title: 'Einheit prüfen', text: `Das Ergebnis hat die Einheit der Daten: ${num(s.se, 3)} Punkte auf der Skala des politischen Interesses.` },
  ],
  fehler: 'Standardabweichung und Standardfehler verwechseln. s beschreibt, wie verschieden die Befragten sind, und wird mit mehr Befragten nicht kleiner. SE beschreibt, wie genau der Mittelwert ist, und schrumpft mit mehr Befragten.',
  sliders: [
    { key: 's', label: 'Standardabweichung', min: 0.2, max: 2, step: 0.02, format: v => num(v) },
    { key: 'n', label: 'Fallzahl', min: 10, max: 40000, step: 1, log: true, format: v => count(v) },
  ],
  quick: [
    { label: 'n mal 4', mark: 'n', apply: v => ({ ...v, n: Math.min(40000, v.n * 4) }) },
    { label: 'n durch 4', mark: 'n', apply: v => ({ ...v, n: Math.max(10, Math.round(v.n / 4)) }) },
    { label: 'ALLBUS-Werte', mark: 's', apply: () => ({ s: INTEREST.sd, n: INTEREST.n }) },
  ],
  compare: s => `s bleibt bei mehr Befragten gleich, SE schrumpft. Hier: s = ${num(s.s)}, SE ≈ ${num(s.se, 3)}.`,
  check: {
    question: 'Wie groß ist der Standardfehler bei s = 1 und n = 100?',
    answer: 0.1, tolerance: 0.0011,
    right: 'Stimmt: 1 / √100 = 1 / 10 = 0,1.',
    diagnose: v => close(v, 0.01, 0.0011) ? 'Du hast durch n geteilt. Geteilt wird durch √n, also durch 10.'
      : close(v, 10, 0.0011) ? 'Umgekehrt: s wird durch √n geteilt, nicht √n durch s.'
      : close(v, 1, 0.0011) ? 'Das ist noch s selbst. Es fehlt das Teilen durch √n.'
      : 'Erst √100 ausrechnen, dann s durch dieses Ergebnis teilen.',
  },
  interpret: s => ({
    kurz: `In etwa 95 von 100 Zufallsstichproben mit ${count(s.n)} Befragten läge der Mittelwert höchstens rund ${num(s.moe, 3)} Punkte vom wahren Mittelwert aller Erwachsenen entfernt.`,
    fachlich: `SE ≈ ${num(s.se, 3)}. Das 95-%-Konfidenzintervall reicht von x̄ − 1,96 · SE bis x̄ + 1,96 · SE, hier von ${num(INTEREST.mean, 3)} − ${num(s.moe, 3)} ≈ ${num(s.lo)} bis ${num(INTEREST.mean, 3)} + ${num(s.moe, 3)} ≈ ${num(s.hi)}. Bei wiederholten Zufallsstichproben würden etwa 95 % solcher Intervalle den wahren Mittelwert enthalten.`,
  }),
  think: {
    question: 'Du willst den Standardfehler halbieren. Wie viele Befragte brauchst du?',
    options: ['doppelt so viele', 'viermal so viele', 'zehnmal so viele'], correct: 1, mark: 'sqrt',
    explain: 'Die Fallzahl steht unter der Wurzel: √(4 · n) = 2 · √n. Viermal so viele Befragte teilen den Standardfehler nur durch 2.',
    kurz: 'Doppelte Genauigkeit kostet vierfache Fallzahl.',
    hint: 'Probiere oben „n mal 4“.',
  },
  genau: {
    kurz: 'Die Formel gilt für einfache Zufallsstichproben. Beim ALLBUS ist der echte Standardfehler etwas größer.',
    paragraphs: [
      's / √n gilt für einfache Zufallsstichproben unabhängiger Personen. Der ALLBUS zieht zuerst Gemeinden und darin Personen. Befragte aus derselben Gemeinde ähneln sich etwas, deshalb ist der tatsächliche Standardfehler etwas größer (Designeffekt). Außerdem wird Ostdeutschland überproportional befragt; für Aussagen über ganz Deutschland wird gewichtet, und auch das vergrößert den Standardfehler etwas.',
      'Die Größe der Grundgesamtheit kommt in der Formel nicht vor: Ob 70 Millionen oder 700 Millionen Erwachsene, es zählt n.',
      's ist selbst aus der Stichprobe geschätzt. Bei kleinen Stichproben nimmt man für das Intervall deshalb die t-Verteilung statt 1,96.',
    ],
  },
};
