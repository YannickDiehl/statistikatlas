// Begriffskarte „Dichte & Fläche“. Beispiel: Normalmodell der Schlafdauer (μ = 7,08 h, σ = 0,82 h); der Regler
// verbreitert einen Bereich um 7 Stunden, das Bild zeigt seine Fläche. Zahlen in R nachgerechnet, siehe
// b06-wahrscheinlichkeit.test.ts. Bild: 'b06-dichte' in src/components/explain/pictures/b06-wahrscheinlichkeit.tsx.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { SCHLAF, cdf, column, countIf, dnorm, meanSd, schlafModell } from './gemeinsam';

const S = SCHLAF, M = schlafModell;
/** Höhe der Dichte bei 7 Stunden, wie angezeigt gerundet (Rechnungen gehen mit den sichtbaren Zahlen auf). */
const F7 = M.f(7), F7_SHOWN = Math.round(F7 * 100) / 100;
const P78 = M.F(8) - M.F(7);
/** Fläche des Bereichs 7 ± h im Modell. */
export const areaAround7 = (h: number) => M.F(7 + h) - M.F(7 - h);

/** Modell aus den aktuellen Daten und die Fläche zwischen 7 und 8 Stunden darin. */
function model(c: SampleCtx) {
  const xs = column(c, 'x', 'schlafdauer'), { mean, sd } = meanSd(xs);
  return { n: xs.length, mean, sd, area: sd > 0 ? cdf(8, mean, sd) - cdf(7, mean, sd) : null, obs: countIf(xs, v => v >= 7 && v <= 8) };
}
/** Gesamtfläche unter der Dichte des Modells, numerisch über μ ± 10 σ (Trapezregel). */
function totalArea(c: SampleCtx): number | null {
  const m = model(c);
  if (!(m.sd > 0)) return null;
  const a = m.mean - 10 * m.sd, b = m.mean + 10 * m.sd, k = 4000, h = (b - a) / k;
  let sum = (dnorm(a, m.mean, m.sd) + dnorm(b, m.mean, m.sd)) / 2;
  for (let i = 1; i < k; i++) sum += dnorm(a + i * h, m.mean, m.sd);
  return sum * h;
}

export const densityFunction: ConceptCard = {
  concept: 'density_function',
  picture: 'b06-dichte',
  wofuer: 'Wie wahrscheinlich schläft eine Person zwischen 7 und 8 Stunden pro Nacht? Bei einer stetigen Größe wie der Schlafdauer beantwortet das eine Kurve, die Dichte. Die Wahrscheinlichkeit ist die Fläche unter ihr.',
  kurz: 'Eine Dichte zeigt, wo sich die Werte einer stetigen Variable häufen. Die Wahrscheinlichkeit für einen Bereich ist die Fläche unter der Kurve, nicht ihre Höhe.',
  stellDirVor: {
    text: `Für die Schlafdauer der ${S.n} Befragten passt eine Normalverteilung mit μ = ${num(S.mean)} h und σ = ${num(S.sd)} h. Die Fläche unter ihrer Kurve zwischen 7 und 8 Stunden beträgt ${num(P78)}: In diesem Modell schlafen ${pct(P78)} so lange. In den Daten sind es ${S.from7to8} von ${S.n}, also ${pct(S.from7to8 / S.n)}.`,
    figures: [
      { label: 'Fläche 7 bis 8 h im Modell', value: pct(P78) },
      { label: '7 bis 8 h in den Daten', value: pct(S.from7to8 / S.n) },
      { label: 'Höhe der Kurve bei 7 h', value: `${num(F7)} pro Stunde` },
    ],
  },
  heisst: {
    sym: 'f(x)', say: 'f von x',
    fach: 'Die Dichtefunktion f einer stetigen Zufallsvariable X liefert Wahrscheinlichkeiten als Flächen: P(a ≤ X ≤ b) ist das Integral von f über das Intervall von a bis b. Die Gesamtfläche ist 1.',
  },
  bausteine: [
    {
      title: 'Die Kurve lesen',
      was: 'Wo die Kurve hoch ist, liegen viele Werte dicht beieinander. Bei der Schlafdauer ist sie um 7 Stunden am höchsten.',
      warum: 'Die Höhe zeigt, wie dicht die Wahrscheinlichkeit an einer Stelle gepackt ist. Daher kommt der Name Dichte.',
      acht: `Die Höhe ist keine Wahrscheinlichkeit. Bei 7 Stunden ist die Kurve ${num(F7)} hoch, aber genau 7 Stunden haben die Wahrscheinlichkeit 0.`,
      concept: 'normal_distribution',
    },
    {
      title: 'Die Fläche als Wahrscheinlichkeit nehmen',
      was: `Für einen Bereich nimmst du die Fläche unter der Kurve zwischen seinen Grenzen. Zwischen 7 und 8 Stunden sind das ${pct(P78)}.`,
      rechnung: `P(7 ≤ X ≤ 8) = Fläche ≈ ${num(P78)}`,
      warum: 'Die Gesamtfläche unter jeder Dichte ist 1, also 100 %. Ein Teil der Fläche ist deshalb ein Teil der Wahrscheinlichkeit.',
      acht: `Für schmale Bereiche hilft: Fläche ≈ Höhe mal Breite. Zwischen 6,95 und 7,05 Stunden: ${num(F7_SHOWN)} · 0,1 ≈ ${num(F7_SHOWN * 0.1)}.`,
      concept: 'probability',
    },
    {
      title: 'Die Einheit beachten',
      was: 'Die Höhe hat die Einheit „pro Stunde“. Erst mal einer Breite in Stunden ergibt sie eine Wahrscheinlichkeit ohne Einheit.',
      warum: `Deshalb kann eine Dichte auch über 1 liegen. Misst du die Schlafdauer in Tagen statt in Stunden, wird die Kurve 24-mal so hoch: ${num(F7 * 24, 1)} pro Tag.`,
      acht: 'Eine Dichte über 1 ist kein Fehler. Entscheidend ist nur, dass die Gesamtfläche 1 bleibt.',
      concept: 'discrete_continuous',
    },
  ],
  ausprobieren: [
    {
      question: 'Der Bereich um 7 Stunden wird immer schmaler. Was passiert mit seiner Wahrscheinlichkeit?',
      options: ['sie geht gegen 0', 'sie geht gegen die Höhe der Kurve', 'sie bleibt gleich'], correct: 0, step: 2,
      explain: 'Die Fläche ist ungefähr Höhe mal Breite. Geht die Breite gegen 0, geht auch die Fläche gegen 0, egal wie hoch die Kurve ist. Schieb den Regler ganz nach links.',
      kurz: 'Ohne Breite keine Fläche, ohne Fläche keine Wahrscheinlichkeit.',
    },
    {
      question: 'Kann eine Dichte höher als 1 sein?',
      options: ['nein, nie', 'ja'], correct: 1, step: 3,
      explain: `Ja. Misst du die Schlafdauer in Tagen, ist die Kurve bei 7 Stunden ${num(F7 * 24, 1)} hoch. Die Fläche bleibt trotzdem 1, weil die Kurve dann sehr schmal ist.`,
      kurz: 'Höhe über 1 ist erlaubt, Fläche über 1 nicht.',
    },
    {
      question: 'Ist P(7 ≤ X ≤ 8) dasselbe wie P(7 < X < 8)?',
      options: ['ja', 'nein'], correct: 0, step: 2,
      explain: 'Bei einer Dichte haben die beiden Randpunkte die Wahrscheinlichkeit 0. Ob sie dazugehören, ändert an der Fläche nichts.',
      kurz: 'Stetig: Ränder zählen nicht.',
    },
  ],
  regler: {
    label: 'Halbe Breite des Bereichs um 7 Stunden',
    min: 0, max: 2, step: 0.05, initial: 0.5,
    format: v => `7 ± ${num(v)} h`,
    describe: v => {
      if (v < 0.001) return `Ein einzelner Punkt hat keine Breite. Die Fläche über genau 7 Stunden ist 0, obwohl die Kurve dort ${num(F7)} hoch ist.`;
      const area = areaAround7(v), rough = F7_SHOWN * 2 * v;
      return `Zwischen ${num(7 - v)} und ${num(7 + v)} Stunden ist die Fläche ≈ ${num(area)}, also ${pct(area)}. Höhe mal Breite ergibt ${num(F7_SHOWN)} · ${num(2 * v)} ≈ ${num(rough)}.${v >= 0.3 ? ' Bei breiten Bereichen ist das zu viel, weil die Kurve zu den Rändern abfällt.' : ''}`;
    },
  },
  check: {
    question: `Die Dichte der Schlafdauer ist bei 7 Stunden ${num(F7)} hoch. Was heißt das?`,
    options: [
      `Genau 7 Stunden schlafen ${pct(F7_SHOWN, 0)} der Befragten.`,
      `Um 7 Stunden liegen besonders viele Werte; für 6,95 bis 7,05 Stunden sind es etwa ${pct(areaAround7(0.05), 0)}.`,
      `Mit ${pct(F7_SHOWN, 0)} Wahrscheinlichkeit schläft jemand höchstens 7 Stunden.`,
      'Die Kurve kann nicht stimmen, weil eine Dichte nie über 0,4 liegen darf.',
    ],
    correct: 1,
    right: `Genau. Die Höhe sagt, wie dicht die Werte liegen. Zur Wahrscheinlichkeit wird sie erst mit einer Breite: ${num(F7_SHOWN)} · 0,1 ≈ ${num(F7_SHOWN * 0.1)}.`,
    diagnose: {
      0: 'Fast! Die Höhe ist keine Wahrscheinlichkeit. Genau 7 Stunden haben im Modell die Wahrscheinlichkeit 0; erst ein Bereich hat eine.',
      2: `Fast! Das wäre die kumulierte Wahrscheinlichkeit F(7), die Fläche links von 7. Sie liegt bei ${pct(M.F(7))}.`,
      3: 'Noch nicht ganz. Eine Dichte hat keine solche Obergrenze; sie darf sogar über 1 liegen. Nur ihre Gesamtfläche ist immer 1.',
    },
  },
  fuerDich: 'Siehst du eine Glockenkurve, lies nicht die Höhe als Prozentzahl. Frag stattdessen: Wie groß ist die Fläche über dem Bereich, der mich interessiert?',
  genau: {
    kurz: 'Die Dichte f ist die Ableitung der Verteilungsfunktion F. Wahrscheinlichkeiten sind Integrale von f, also Flächen.',
    paragraphs: [
      'Eine Dichtehöhe darf größer als 1 sein. Entscheidend ist: f(x) ≥ 0 überall und die gesamte Fläche ist 1.',
      'Bei einer Verteilung mit Dichte hat ein einzelner exakter Wert die Wahrscheinlichkeit 0. Das ist keine Aussage über ein gerundetes Messintervall: „7,0 Stunden“ in den Daten meint den Bereich von 6,95 bis 7,05.',
      'Schmale Bereiche können hohe Dichten und trotzdem kleine Wahrscheinlichkeiten haben. Für kleine Breiten gilt P(x ≤ X ≤ x + Δ) ≈ f(x) · Δ.',
    ],
  },
};

export const densityFunctionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Welche Fläche hat der Bereich von 7 bis 8 Stunden im Normalmodell? Und wie viele schlafen in den Daten so lange?',
    value: c => model(c).area,
    result: c => {
      const m = model(c);
      if (m.area === null) return { kurz: 'Alle haben dieselbe Schlafdauer angegeben. Ohne Streuung gibt es keine Dichtekurve.', fachlich: 'Für σ = 0 hat die Normalverteilung keine Dichte.' };
      return {
        kurz: `Im Normalmodell mit μ = ${num(m.mean)} h und σ = ${num(m.sd)} h hat der Bereich von 7 bis 8 Stunden die Fläche ${num(m.area)}, also ${pct(m.area)}. In den Daten schlafen ${m.obs} von ${m.n} so lange.`,
        fachlich: `P(7 ≤ X ≤ 8) = F(8) − F(7) ≈ ${num(m.area)} für X ∼ N(${num(m.mean)}; ${num(m.sd)}²); beobachtet ${pct(m.obs / m.n)}.`,
        zusatz: `Am höchsten ist die Kurve bei μ = ${num(m.mean)} h, mit ${num(dnorm(m.mean, m.mean, m.sd))} pro Stunde.`,
      };
    },
    voraussetzung: 'Die Normalverteilung ist ein Modell für die Schlafdauer; ihre Parameter kommen aus x̄ und s der Daten.',
    think: [
      {
        question: 'Alle schlafen zwei Stunden länger. Was passiert mit der Fläche zwischen 7 und 8 Stunden?',
        options: ['steigt', 'bleibt gleich', 'sinkt deutlich'], correct: 2,
        explain: 'Die Kurve rückt um zwei Stunden nach rechts, ihr Gipfel liegt dann bei gut 9 Stunden. Über 7 bis 8 Stunden bleibt nur noch der linke Ausläufer mit wenig Fläche.',
        kurz: 'Die Fläche hängt davon ab, wo die Kurve liegt.',
        tryIt: { label: 'alle zwei Stunden länger', op: 'shift', column: 'x', value: 2 },
        expect: { change: 'down', atLeast: 0.05 },
      },
      {
        question: 'Alle schlafen zwei Stunden länger. Was passiert mit der Gesamtfläche unter der Kurve?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die Kurve verschiebt sich nur. Ihre Gesamtfläche ist bei jeder Dichte 1, also 100 %.',
        kurz: 'Die Gesamtfläche jeder Dichte ist 1.',
        tryIt: { label: 'alle zwei Stunden länger', op: 'shift', column: 'x', value: 2 },
        expect: { change: 'same', measure: totalArea },
      },
    ],
  },
  next: {
    next: { id: 'cumulative_probability', why: 'Sammelt die Fläche links von einer Grenze: die Wahrscheinlichkeit, höchstens so viel zu schlafen.' },
    before: [
      { id: 'discrete_continuous', why: 'Eine Dichte gibt es nur bei stetigen Variablen.' },
      { id: 'theoretical_distribution', why: 'Das Modell, zu dem die Dichte gehört.' },
    ],
    after: [
      { id: 'normal_distribution', why: 'Die bekannteste Dichte, eine Glockenkurve mit μ und σ.' },
      { id: 'p_value', why: 'Ist eine Fläche am Rand einer Dichte.' },
    ],
    more: [{ id: 't_distribution', why: 'Eine Dichte mit breiteren Rändern als die Normalverteilung.' }],
  },
};
