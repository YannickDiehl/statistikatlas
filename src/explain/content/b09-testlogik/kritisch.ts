// Formel als Satz „Kritischer Wert & Ablehnungsbereich“: c = t₁₋α/₂(df), zweiseitig. Beispiel: Schlafdauer gegen sieben
// Stunden mit t ≈ 1,42 bei 199 Freiheitsgraden. Zahlen in R nachgerechnet, siehe b09-testlogik.test.ts.
import type { ConceptTabs, SentenceTemplate } from '../../types';
import { close, count, num, pct } from '../../format';
import { qnorm, qt } from '../../../tasks/kit/dist';
import { SCHLAF, schlafTest } from './rechnen';

export type CValues = { alpha: number; df: number };
export type CStats = CValues & { half: number; c: number; cOne: number; cNormal: number };

export const kritisch: SentenceTemplate<CValues, CStats> = {
  concept: 'critical_value',
  picture: 'b09-kritisch',
  wofuer: `Statt p kannst du auch t selbst mit einer Grenze vergleichen. Die mittlere Schlafdauer der 200 Befragten liegt ${num(SCHLAF.t)} Standardfehler über sieben Stunden. Reicht das, um die Nullhypothese zu verwerfen? Der kritische Wert sagt, ab wo t zu weit weg ist.`,
  kurz: 'Der kritische Wert ist die Grenze, ab der die Prüfgröße gegen die Nullhypothese spricht. Ohne echten Unterschied landen jenseits davon nur so wenige Ergebnisse, wie du vorher als Fehlalarme zulässt.',
  fachlich: 'Der kritische Wert ist die Grenze in der Nullverteilung, ab der ein Test die Nullhypothese verwirft; dahinter liegt der Ablehnungsbereich. Beim zweiseitigen t-Test umfassen beide Ränder zusammen genau das Signifikanzniveau.',
  initial: { alpha: 0.05, df: SCHLAF.df },
  compute: v => ({ ...v, half: v.alpha / 2, c: qt(1 - v.alpha / 2, v.df), cOne: qt(1 - v.alpha, v.df), cNormal: qnorm(1 - v.alpha / 2) }),
  metrics: [
    { label: 'Fläche je Rand α/2', value: s => num(s.half, 4) },
    { label: 'kritischer Wert c', value: s => `±${num(s.c)}` },
  ],
  glyphs: [
    { key: 'c', sym: 'c', say: 'c', term: 'Kritischer Wert & Ablehnungsbereich', plain: 'die Grenze, ab der t gegen H₀ spricht', concept: 'critical_value' },
    { key: 'q', sym: 't₁₋α/₂', say: 't eins minus alpha halbe', term: 'Theoretisches Quantil', plain: 'die Stelle der t-Verteilung, unter der 1 − α/2 der Fläche liegt', concept: 'theoretical_quantile' },
    { key: 'alpha', sym: 'α', say: 'alpha', term: 'Signifikanzniveau α', plain: 'wie viel Fläche die beiden Ränder zusammen haben', concept: 'alpha_level' },
    { key: 'df', sym: 'df', say: 'd f', term: 'Freiheitsgrade im Modell', plain: 'welche t-Verteilung gilt, beim t-Test einer Stichprobe n − 1', concept: 'general_df' },
  ],
  symbolic: [{ part: ['c'], m: 'c' }, ' = ', { part: ['t'], m: 'q' }, { sub: '1 − α/2' }, '(', { part: ['df'], m: 'df' }, ')'],
  aria: 'c gleich t eins minus alpha halbe, mit df Freiheitsgraden',
  numeric: s => [{ part: ['c'], m: 'c' }, ' = ', { part: ['t'], m: 'q' }, { sub: num(1 - s.alpha / 2, 4) }, '(', { part: [count(s.df)], m: 'df' }, ') ≈ ', { part: [num(s.c)], m: 'c' }],
  sentence: ['Der ', { m: 'c', t: 'kritische Wert' }, ' ist ', { m: 'q', t: 'die Stelle der t-Verteilung' }, ' mit ', { m: 'df', t: 'df Freiheitsgraden' }, ', über der nur noch ', { m: 'alpha', t: 'die Hälfte von α' }, ' der Fläche liegt.'],
  worked: s => [
    { title: 'α auf zwei Ränder verteilen', text: `α / 2 = ${num(s.alpha, 3)} / 2 = ${num(s.half, 4)}. So viel Fläche bekommt jeder Rand.` },
    { title: 'Die Grenze in der t-Verteilung suchen', text: `Rechts von c liegt nur noch der Anteil ${num(s.half, 4)} der Fläche: c ≈ ${num(s.c)} bei ${count(s.df)} Freiheitsgraden.` },
    { title: 't mit der Grenze vergleichen', text: `Zum Vergleich die Schlafdauer: t ≈ ${num(SCHLAF.t)}. ${SCHLAF.t >= s.c ? 'Das liegt jenseits von +c: H₀ verwerfen.' : 'Das liegt zwischen −c und +c: H₀ nicht verwerfen.'}` },
  ],
  fehler: `Einseitig und zweiseitig haben verschiedene Grenzen. Bei α = 0,05 und sehr vielen Befragten liegt die zweiseitige Grenze bei ${num(qnorm(0.975))}, die einseitige bei ${num(qnorm(0.95))}. Wer die falsche nimmt, verwirft zu oft oder zu selten.`,
  sliders: [
    { key: 'alpha', label: 'Signifikanzniveau', min: 0.001, max: 0.2, step: 0.001, format: v => num(v, 3) },
    { key: 'df', label: 'Freiheitsgrade', min: 1, max: 10000, step: 1, log: true, format: v => count(v) },
  ],
  quick: [
    { label: 'α = 0,01', mark: 'alpha', apply: v => ({ ...v, alpha: 0.01 }) },
    { label: 'nur 10 Befragte (df = 9)', mark: 'df', apply: v => ({ ...v, df: 9 }) },
    { label: 'sehr viele Befragte', mark: 'df', apply: v => ({ ...v, df: 10000 }) },
  ],
  compare: s => `Mit sehr vielen Freiheitsgraden nähert sich c dem Wert der Normalverteilung, ${num(s.cNormal)}. Hier: c ≈ ${num(s.c)}.`,
  check: {
    question: 'Wie groß ist der kritische Wert bei α = 0,05, zweiseitig, mit sehr vielen Befragten?',
    answer: 1.96, tolerance: 0.011,
    right: 'Genau, 1,96: Rechts davon liegen 2,5 % der Fläche, links von −1,96 ebenfalls.',
    diagnose: v => close(v, 1.645) ? 'Fast! 1,64 ist die einseitige Grenze. Zweiseitig bekommt jeder Rand nur α/2 = 0,025.'
      : close(v, 0.05, 0.0011) || close(v, 0.025, 0.0011) ? 'Fast! Das ist eine Fläche. Gesucht ist die Stelle auf der t-Achse, an der diese Fläche beginnt.'
      : close(v, 2.576) ? 'Fast! 2,58 gehört zu α = 0,01.'
      : close(v, -1.96) ? 'Fast! Die Grenzen liegen bei ±1,96. Gefragt ist die positive.'
      : 'Noch nicht ganz. Gesucht ist die Stelle, rechts von der 2,5 % der Fläche liegen.',
  },
  interpret: s => ({
    kurz: `Bei α = ${num(s.alpha, 3)} und ${count(s.df)} Freiheitsgraden spricht t gegen H₀, wenn es mindestens ${num(s.c)} von 0 entfernt ist. Ohne echten Unterschied passiert das in ${pct(s.alpha)} der Studien.`,
    fachlich: `Ablehnungsbereich: t ≤ −${num(s.c)} oder t ≥ ${num(s.c)}. Einseitig läge die Grenze bei ${num(s.cOne)}, mit der Normalverteilung zweiseitig bei ${num(s.cNormal)}.`,
  }),
  think: {
    question: 'Weniger Befragte, also weniger Freiheitsgrade. Was passiert mit dem kritischen Wert?',
    options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 0, mark: 'df',
    explain: `Mit wenigen Freiheitsgraden hat die t-Verteilung dickere Ränder. Um dieselbe Fläche abzuschneiden, muss die Grenze weiter nach außen: Bei df = 9 liegt sie bei ${num(qt(0.975, 9))}.`,
    kurz: 'Wenig Daten, strengere Grenze.',
    hint: 'Probier oben „nur 10 Befragte (df = 9)“ aus.',
  },
  genau: {
    kurz: 'Kritischer Wert und p-Wert führen zur selben Entscheidung. |t| ≥ c heißt genau dann p ≤ α.',
    paragraphs: [
      `Für die Schlafdauer ist t ≈ ${num(SCHLAF.t)} bei 199 Freiheitsgraden. Die Grenze liegt bei ${num(qt(0.975, 199))}, also wird H₀ bei α = 0,05 nicht verworfen. Das passt zu p ≈ ${num(SCHLAF.p)}.`,
      'Der kritische Wert ist ein Quantil der Nullverteilung, kein Quantil der Daten. Er hängt nur von α, der Richtung und den Freiheitsgraden ab, nicht von den Antworten der Befragten.',
      'Bei diskreten Prüfgrößen wie im Binomialtest gibt es nur bestimmte erreichbare Grenzen. Die Fehlerquote trifft α dann meist nicht genau.',
      `Dieselbe Zahl steckt im Konfidenzintervall: Mittelwert ± c · SE. Bei 200 Befragten und 95 % ist c ≈ ${num(qt(0.975, 199))} statt der Faustregel 2.`,
    ],
  },
};

/** Reiter: t der Schlafdauer gegen die Grenze bei α = 0,05 für die aktuellen Daten, Weiter (der Katalog druckt keine kritischen Werte). */
export const kritischTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Grenze mit allen 200 Befragten: Liegt t für die Schlafdauer im Ablehnungsbereich?',
    value: c => schlafTest(c)?.c ?? null,
    result: c => {
      const r = schlafTest(c);
      if (!r) return { kurz: 'Alle Befragten schlafen gleich lange. Ohne Streuung lässt sich t nicht berechnen.', fachlich: 'Der t-Test braucht mindestens zwei verschiedene Werte.' };
      return {
        kurz: `Für den Abstand zu sieben Stunden ist t ≈ ${num(r.t)}. Die Grenze bei α = 0,05 liegt bei ±${num(r.c)}. ${Math.abs(r.t) >= r.c ? 't liegt im Ablehnungsbereich: Du verwirfst H₀.' : 't liegt zwischen den Grenzen: Du verwirfst H₀ nicht.'}`,
        fachlich: `Zweiseitiger t-Test einer Stichprobe mit ${r.df} Freiheitsgraden; Ablehnungsbereich |t| ≥ ${num(r.c)}. Einseitig („mehr als sieben Stunden“) läge die Grenze bei ${num(r.cOne)}.`,
      };
    },
    voraussetzung: 'Die Grenze gilt, wenn t unter H₀ einer t-Verteilung folgt: unabhängige Befragte und ein annähernd normalverteilter Mittelwert.',
    think: [
      {
        question: 'Alle schlafen 0,1 Stunden länger. Was passiert mit t?', options: ['t steigt', 't bleibt gleich', 't sinkt'], correct: 0,
        explain: 'Der Abstand zu sieben Stunden wächst, der Standardfehler bleibt. t springt über die Grenze: Jetzt verwirfst du H₀.',
        kurz: 'Die Daten bewegen t.',
        tryIt: { label: 'alle 0,1 Stunden länger', op: 'shift', column: 'x', value: 0.1 },
        expect: { change: 'up', measure: c => schlafTest(c)?.t ?? null },
      },
      {
        question: 'Eine Person schläft plötzlich 14 Stunden pro Nacht. Was passiert mit dem kritischen Wert?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die Grenze hängt nur von α und den Freiheitsgraden ab, und es bleiben 200 Befragte. Die Antworten verschieben t, nicht die Grenze.',
        kurz: 'Die Daten bewegen t, nicht c.',
        tryIt: { label: 'die gewählte Person auf 14 Stunden', op: 'outlier', column: 'x', value: 14 },
        expect: { change: 'same' },
      },
    ],
  },
  next: {
    next: { id: 'type_errors', why: 'Auch mit der richtigen Grenze kann eine Entscheidung falsch sein.' },
    before: [
      { id: 'alpha_level', why: 'Legt fest, wie viel Fläche die Ränder haben.' },
      { id: 'test_sides', why: 'Bestimmt, ob es eine Grenze gibt oder zwei.' },
      { id: 'null_distribution', why: 'Die Verteilung, deren Ränder abgeschnitten werden.' },
    ],
    after: [{ id: 'confidence', why: 'Dieselbe Grenze bestimmt die Breite des Intervalls.' }],
    more: [
      { id: 'theoretical_quantile', why: 'Der kritische Wert ist ein Quantil der Nullverteilung.' },
      { id: 'quantile', why: 'Quantile der Daten sind etwas anderes als Quantile der Nullverteilung.' },
    ],
  },
};
