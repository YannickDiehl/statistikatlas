// Begriffskarte „Kumulierte Wahrscheinlichkeit“. Beispiel: Normalmodell der Schlafdauer, F(6), F(8) und Bereiche
// dazwischen; diskret die Haushaltsgröße. Der Regler schiebt die Grenze x. Zahlen in R nachgerechnet, siehe
// b06-wahrscheinlichkeit.test.ts. Bild: 'b06-kumuliert' in src/components/explain/pictures/b06-wahrscheinlichkeit.tsx.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { baseSurvey, sampleColumn } from '../../sample';
import { HAUSHALT, SCHLAF, cdf, column, countIf, meanSd, schlafModell } from './gemeinsam';

const S = SCHLAF, M = schlafModell, H = HAUSHALT;
const F6 = M.F(6), F8 = M.F(8);
const hp = (k: number) => H.count[k - 1] / H.n;

let observed: number[] | null = null;
/** Wie viele der 200 Befragten (Ausgangsdaten) höchstens x Stunden schlafen. */
export const observedUpTo = (x: number) => countIf(observed ??= sampleColumn(baseSurvey(), 'schlafdauer'), v => v <= x + 1e-9);

/** Fₙ(6) der aktuellen Daten und F(6) des Normalmodells aus x̄ und s. */
function upTo6(c: SampleCtx) {
  const xs = column(c, 'x', 'schlafdauer'), { mean, sd } = meanSd(xs), k = countIf(xs, v => v <= 6 + 1e-9);
  return { n: xs.length, k, share: k / xs.length, model: sd > 0 ? cdf(6, mean, sd) : null, mean, sd };
}

export const cumulativeProbability: ConceptCard = {
  concept: 'cumulative_probability',
  picture: 'b06-kumuliert',
  wofuer: 'Wie viele Befragte schlafen höchstens 6 Stunden pro Nacht? Solche „höchstens“-Fragen beantwortet die kumulierte Wahrscheinlichkeit: Sie sammelt alles bis zu einer Grenze.',
  kurz: 'Die kumulierte Wahrscheinlichkeit F(x) sagt dir, wie wahrscheinlich ein Wert höchstens x ist. Sie wächst von 0 bis 1, je weiter du die Grenze nach rechts schiebst.',
  stellDirVor: {
    text: `Im Normalmodell der Schlafdauer mit μ = ${num(S.mean)} h und σ = ${num(S.sd)} h ist F(6) ≈ ${pct(F6)}: So viele schlafen höchstens 6 Stunden. F(8) ≈ ${pct(F8)}, also schlafen fast neun von zehn höchstens 8 Stunden. Zwischen 6 und 8 Stunden liegen F(8) − F(6) ≈ ${pct(F8 - F6)}.`,
    figures: [
      { label: 'F(6)', value: pct(F6) },
      { label: 'F(8)', value: pct(F8) },
      { label: 'F(8) − F(6)', value: pct(F8 - F6) },
    ],
  },
  heisst: {
    sym: 'F(x) = P(X ≤ x)', say: 'F von x gleich P von X kleiner gleich x',
    fach: 'Die Verteilungsfunktion F gibt für jede Grenze x die Wahrscheinlichkeit P(X ≤ x) an. Sie steigt von 0 auf 1 und hat bei diskreten Verteilungen Sprünge.',
  },
  bausteine: [
    {
      title: 'Bis zur Grenze aufsammeln',
      was: 'Du nimmst alle Wahrscheinlichkeit links von der Grenze zusammen. Bei einer Dichte ist das die Fläche bis x.',
      rechnung: `F(6) = P(X ≤ 6) ≈ ${pct(F6)}`,
      warum: 'Viele Fragen lauten „höchstens“ oder „weniger als“. F beantwortet sie mit einer einzigen Zahl.',
      acht: `F(x) ist eine Wahrscheinlichkeit, kein Wert der Schlafdauer. F(6) ≈ ${pct(F6)} heißt nicht „${num(F6 * 100, 1)} Stunden“.`,
      concept: 'density_function',
    },
    {
      title: 'Rechts und dazwischen ablesen',
      was: '„Mehr als x“ ist das Gegenteil von „höchstens x“. „Zwischen a und b“ ist der Unterschied zweier F-Werte.',
      rechnung: `P(X > 8) = 1 − F(8) ≈ ${pct(1 - F8)}; P(6 < X ≤ 8) = F(8) − F(6) ≈ ${pct(F8 - F6)}`,
      warum: 'So reicht eine einzige Funktion für alle Bereiche. Auch p-Werte sind solche Randwahrscheinlichkeiten.',
      acht: `Wer bei „mehr als 8 Stunden“ F(8) nimmt, bekommt ${pct(F8)} statt ${pct(1 - F8)}. Merksatz: Rechts von x liegt 1 minus F(x).`,
      concept: 'p_value',
    },
    {
      title: 'Bei diskreten Werten die Grenze prüfen',
      was: `Bei der Haushaltsgröße springt F an jedem möglichen Wert. F(2) = ${pct(hp(1))} + ${pct(hp(2))} = ${pct(hp(1) + hp(2))}.`,
      rechnung: `P(X ≤ 2) = ${pct(hp(1) + hp(2))}, aber P(X < 2) = P(X ≤ 1) = ${pct(hp(1))}`,
      warum: 'Bei diskreten Werten hat jeder einzelne Wert eine Masse. Ob die Grenze dazugehört, ändert dann das Ergebnis.',
      acht: `Bei „mindestens 3 Personen“ rechnest du 1 − F(2) = ${pct(1 - hp(1) - hp(2))}, nicht 1 − F(3) = ${pct(1 - hp(1) - hp(2) - hp(3))}.`,
      concept: 'probability_mass',
    },
  ],
  ausprobieren: [
    {
      question: `F(7) ist etwa ${pct(M.F(7), 0)}. Wie groß ist F(6)?`,
      options: [`größer als ${pct(M.F(7), 0)}`, `kleiner als ${pct(M.F(7), 0)}`, 'nicht zu sagen'], correct: 1, step: 1,
      explain: 'F kann nur steigen oder gleich bleiben: Bis 6 Stunden sammelt man weniger ein als bis 7 Stunden.',
      kurz: 'F steigt, sie fällt nie.',
    },
    {
      question: 'Wohin geht F(x), wenn x immer größer wird?',
      options: ['gegen 0', 'gegen 1', 'gegen unendlich'], correct: 1, step: 1,
      explain: 'Ganz rechts ist alle Wahrscheinlichkeit eingesammelt. Mehr als 1, also 100 %, gibt es nicht.',
      kurz: 'Ganz links 0, ganz rechts 1.',
    },
    {
      question: 'Ein Test meldet, rechts von t = 2 liege die Fläche 0,03. Wie groß ist F(2)?',
      options: ['0,03', '0,97', '2'], correct: 1, step: 2,
      explain: '1 − 0,03 = 0,97. Ein einseitiger p-Wert ist so eine Randfläche rechts, also 1 minus F.',
      kurz: 'Rechts von x liegt 1 minus F(x).',
    },
  ],
  regler: {
    label: 'Grenze x in Stunden',
    min: 5, max: 9.5, step: 0.05, initial: 6,
    format: v => `x = ${num(v)} h`,
    describe: v => {
      const F = M.F(v), k = observedUpTo(v);
      return `F(${num(v)}) ≈ ${pct(F)}: Im Modell schlafen so viele höchstens ${num(v)} Stunden, ${pct(1 - F)} länger. In den Daten sind es ${k} von ${S.n}, also ${pct(k / S.n)}.`;
    },
  },
  check: {
    question: `Im Modell ist F(8) ≈ ${pct(F8)}. Wie wahrscheinlich schläft jemand mehr als 8 Stunden?`,
    options: [pct(F8), pct(1 - F8), '8 %', '50 %'],
    correct: 1,
    right: `Genau. Mehr als 8 Stunden ist das Gegenteil von höchstens 8: 1 − ${pct(F8)} = ${pct(1 - F8)}.`,
    diagnose: {
      0: `Fast! ${pct(F8)} schlafen höchstens 8 Stunden. Mehr als 8 ist das Gegenteil: 1 minus F(8).`,
      2: 'Fast! 8 ist die Grenze in Stunden, keine Wahrscheinlichkeit. Gesucht ist die Fläche rechts davon.',
      3: 'Noch nicht ganz. 8 Stunden liegen rechts von der Mitte, dort ist schon viel mehr als die Hälfte eingesammelt.',
    },
  },
  fuerDich: 'Liest du „höchstens“, „weniger als“ oder „mindestens“, steckt eine kumulierte Wahrscheinlichkeit dahinter. Prüf dann, ob die Grenze selbst dazugehört; bei gezählten Dingen ändert das die Zahl.',
  genau: {
    kurz: 'F(x) = P(X ≤ x) steigt von 0 auf 1 und ist rechtsstetig. Bei stetigen Verteilungen ist F die Fläche unter der Dichte bis x.',
    paragraphs: [
      'Bei stetigen Verteilungen ist F(b) − F(a) die Wahrscheinlichkeit zwischen a und b, und es ist gleich, ob die Grenzen dazugehören.',
      `Diskret gilt für ganze Grenzen P(a ≤ X ≤ b) = F(b) − F(a − 1). „Größer als“ und „größer oder gleich“ unterscheiden sich.`,
      `Die empirische Verteilungsfunktion Fₙ schätzt F aus den Daten. Weil die Schlafdauer auf 0,1 Stunden gerundet ist, liegen ${S.atMost6 - S.below6} Befragte genau bei 6,0: Höchstens 6 Stunden schlafen ${S.atMost6}, weniger als 6 nur ${S.below6}.`,
    ],
  },
};

export const cumulativeProbabilityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie viele schlafen höchstens 6 Stunden, und was sagt das Normalmodell dazu?',
    value: c => upTo6(c).share,
    result: c => {
      const u = upTo6(c);
      return {
        kurz: `${u.k} von ${u.n} Befragten schlafen höchstens 6 Stunden, also Fₙ(6) = ${pct(u.share)}.${u.model === null ? '' : ` Das Normalmodell mit μ = ${num(u.mean)} h und σ = ${num(u.sd)} h sagt F(6) ≈ ${pct(u.model)}.`}`,
        fachlich: `Fₙ(6) = Anzahl der xᵢ ≤ 6 geteilt durch n = ${u.k} / ${u.n}${u.model === null ? '; ohne Streuung gibt es kein Normalmodell.' : `; F(6) ≈ ${pct(u.model)} im Modell.`}`,
        zusatz: `Mehr als 6 Stunden schlafen ${u.n - u.k} von ${u.n}, also 1 − Fₙ(6) = ${pct(1 - u.share)}.`,
      };
    },
    voraussetzung: 'Fₙ beschreibt die Daten, F das Modell. Beide stimmen nur ungefähr überein, und gerundete Werte genau bei 6,0 zählen bei „höchstens“ mit.',
    think: [
      {
        question: 'Alle schlafen eine Stunde kürzer. Was passiert mit dem Anteil, der höchstens 6 Stunden schläft?',
        options: ['steigt deutlich', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Alle, die bisher höchstens 7 Stunden schliefen, liegen jetzt bei höchstens 6. In den Ausgangsdaten sind das fast die Hälfte statt gut einem Zehntel.',
        kurz: 'Rücken die Werte nach links, sammelt F bis zur selben Grenze mehr ein.',
        tryIt: { label: 'alle eine Stunde kürzer', op: 'shift', column: 'x', value: -1 },
        expect: { change: 'up', atLeast: 0.05 },
      },
      {
        question: 'Alle schlafen eine Stunde länger. Was passiert mit dem Anteil, der höchstens 6 Stunden schläft?',
        options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 2,
        explain: 'Die Werte rücken nach rechts, über die Grenze von 6 Stunden. In den Ausgangsdaten schläft dann niemand mehr höchstens 6 Stunden.',
        kurz: 'Rücken die Werte nach rechts, sammelt F bis zur selben Grenze weniger ein.',
        tryIt: { label: 'alle eine Stunde länger', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'down' },
      },
    ],
  },
  next: {
    next: { id: 'theoretical_quantile', why: 'Die umgekehrte Frage: Bis zu welcher Grenze liegt ein bestimmter Anteil?' },
    before: [
      { id: 'density_function', why: 'F(x) ist die Fläche unter der Dichte bis x.' },
      { id: 'probability_mass', why: 'Diskret zählt F die Balken bis x zusammen.' },
    ],
    after: [
      { id: 'p_value', why: 'Eine Randwahrscheinlichkeit, 1 minus F oder F selbst, aus der Referenzverteilung.' },
      { id: 'critical_value', why: 'Die Grenze, bei der F einen festen Wert wie 0,975 erreicht.' },
      { id: 'empirical_distribution', why: 'Fₙ, die Treppe der Daten, schätzt F.' },
    ],
    more: [{ id: 'exact_asymptotic', why: 'Ob F exakt oder über eine Näherung berechnet wird.' }],
  },
};
