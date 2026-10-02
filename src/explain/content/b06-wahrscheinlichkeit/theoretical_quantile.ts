// Begriffskarte „Theoretisches Quantil“. Beispiel: Normalmodell der Schlafdauer, das 10-%- und das 90-%-Quantil;
// kritische Werte als Quantile der Standardnormalverteilung (1,96). Der Regler wählt den Anteil p. Zahlen in R
// nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts. Bild: 'b06-quantil' in src/components/explain/pictures/b06-wahrscheinlichkeit.tsx.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct, signed } from '../../format';
import { qnorm } from '../../../tasks/kit/dist';
import { HAUSHALT, SCHLAF, column, meanSd, quant, schlafModell } from './gemeinsam';

const S = SCHLAF, M = schlafModell, H = HAUSHALT;
const Q10 = M.q(0.1), Q90 = M.q(0.9), Z10 = qnorm(0.1);
/** Wie angezeigt gerundet: Die Rechnung im Text geht mit den sichtbaren Zahlen auf. */
const shown = (v: number) => Math.round(v * 100) / 100;
const hF = (k: number) => H.count.slice(0, k).reduce((a, b) => a + b, 0) / H.n;

/** 10-%-Quantil des Normalmodells aus x̄ und s der aktuellen Daten. */
function q10(c: SampleCtx) {
  const xs = column(c, 'x', 'schlafdauer'), { mean, sd } = meanSd(xs), sorted = [...xs].sort((a, b) => a - b);
  return { n: xs.length, mean, sd, q: sd > 0 ? quant(0.1, mean, sd) : null, below: (q: number) => sorted.filter(v => v <= q + 1e-9).length };
}

export const theoreticalQuantile: ConceptCard = {
  concept: 'theoretical_quantile',
  picture: 'b06-quantil',
  wofuer: 'Unter welcher Schlafdauer liegen die 10 % mit den kürzesten Nächten? In einem Modell beantwortet das ein theoretisches Quantil. Dieselbe Frage steckt in jedem kritischen Wert eines Tests.',
  kurz: 'Ein theoretisches Quantil ist die Grenze, unter der ein bestimmter Anteil der Modellwahrscheinlichkeit liegt. Es dreht die Frage der kumulierten Wahrscheinlichkeit um: Anteil rein, Grenze raus.',
  stellDirVor: {
    text: `Im Normalmodell der Schlafdauer mit μ = ${num(S.mean)} h und σ = ${num(S.sd)} h liegt das 10-%-Quantil bei ${num(Q10)} Stunden: 10 % der Modellwahrscheinlichkeit liegen darunter. Das 90-%-Quantil liegt bei ${num(Q90)} Stunden. Zwischen beiden liegen 80 %.`,
    figures: [
      { label: '10-%-Quantil', value: `${num(Q10)} h` },
      { label: '90-%-Quantil', value: `${num(Q90)} h` },
      { label: '97,5-%-Quantil von z', value: num(qnorm(0.975)) },
    ],
  },
  heisst: {
    sym: 'qₚ', say: 'q p',
    fach: 'Das theoretische p-Quantil qₚ ist die kleinste Grenze x, für die F(x) ≥ p gilt. Bei stetigen Verteilungen ist es die Stelle mit F(qₚ) = p.',
  },
  bausteine: [
    {
      title: 'Den Anteil vorgeben',
      was: 'Du startest mit einem Anteil p, etwa 10 %. Gesucht ist die Grenze, links von der genau dieser Anteil liegt.',
      warum: 'Viele Fragen kommen so: „Ab wann gehört man zu den unteren 10 %?“ Dann ist der Anteil bekannt und die Grenze gesucht.',
      acht: 'p ist hier ein Anteil, kein p-Wert eines Tests. Dasselbe Zeichen meint verschiedene Dinge.',
      concept: 'cumulative_probability',
    },
    {
      title: 'Die Grenze im Modell suchen',
      was: 'Du schiebst die Grenze, bis die Fläche links davon genau p ist. Bei der Normalverteilung ist das μ plus σ mal das Quantil der Standardnormalverteilung.',
      rechnung: `q₀,₁ = ${num(S.mean)} + ${num(S.sd)} · (${num(Z10)}) ≈ ${num(shown(S.mean) + shown(S.sd) * shown(Z10))} h`,
      warum: `F und Quantil sind Umkehrungen voneinander: F(${num(Q10)}) = 10 %, und das 10-%-Quantil ist ${num(Q10)} h.`,
      acht: `Ein Quantil ist ein Wert auf der Skala der Daten, hier in Stunden. Wer 10 % und ${num(Q10)} h verwechselt, hat Anteil und Grenze vertauscht.`,
      concept: 'standard_normal',
    },
    {
      title: 'Kritische Werte erkennen',
      was: `Kritische Werte von Tests sind Quantile der Referenzverteilung. ${num(qnorm(0.975))} ist das 97,5-%-Quantil der Standardnormalverteilung.`,
      rechnung: `q₀,₉₇₅ = ${num(qnorm(0.975))}: Rechts davon liegen 2,5 %, links von −${num(qnorm(0.975))} auch 2,5 %, zusammen 5 %.`,
      warum: `Deshalb taucht ${num(qnorm(0.975))} bei 95-%-Konfidenzintervallen und bei zweiseitigen Tests mit α = 5 % auf.`,
      acht: `Für zweiseitige Fragen mit α = 5 % brauchst du das 97,5-%-Quantil, nicht das 95-%-Quantil. Das 95-%-Quantil ist ${num(qnorm(0.95))}.`,
      concept: 'critical_value',
    },
  ],
  ausprobieren: [
    {
      question: 'Wo liegt das 50-%-Quantil einer Normalverteilung?',
      options: ['bei μ', 'bei σ', 'bei 0,5'], correct: 0, step: 2,
      explain: `Die Normalverteilung ist symmetrisch um μ. Links und rechts von μ liegt je die Hälfte, also q₀,₅ = μ = ${num(S.mean)} h.`,
      kurz: 'Bei einer symmetrischen Kurve liegt das 50-%-Quantil genau bei μ.',
    },
    {
      question: 'Ein Test ist einseitig mit α = 5 %. Welches Quantil der Standardnormalverteilung ist der kritische Wert?',
      options: [num(qnorm(0.95)), num(qnorm(0.975)), num(qnorm(0.995))], correct: 0, step: 3,
      explain: `Einseitig liegen die 5 % ganz auf einer Seite. Gesucht ist also das 95-%-Quantil: ${num(qnorm(0.95))}. ${num(qnorm(0.975))} gehört zu zweiseitig 5 %, ${num(qnorm(0.995))} zu zweiseitig 1 %.`,
      kurz: 'Erst klären, wie viel in einem Rand liegt.',
    },
    {
      question: 'Bei der Haushaltsgröße fragst du nach dem 50-%-Quantil. Gibt es einen Wert, bei dem F genau 50 % ist?',
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: `F(2) = ${pct(hF(2))} und F(3) = ${pct(hF(3))}: F springt über 50 % hinweg. Das Quantil ist deshalb die kleinste Grenze mit F ≥ 50 %, also 3 Personen.`,
      kurz: 'Diskret: die kleinste Grenze, ab der F den Anteil erreicht.',
    },
  ],
  regler: {
    label: 'Anteil p links der Grenze',
    min: 0.01, max: 0.99, step: 0.01, initial: 0.1,
    format: v => `p = ${pct(v, 0)}`,
    describe: v => {
      const q = M.q(v), z = qnorm(v);
      return `Das ${num(v * 100, 0)}-%-Quantil liegt bei ${num(q)} Stunden: Im Modell schlafen ${pct(v, 0)} höchstens so lange. In Standardabweichungen gemessen liegt es bei z = ${signed(z)}.`;
    },
  },
  check: {
    question: `Das 97,5-%-Quantil der Standardnormalverteilung ist ${num(qnorm(0.975))}. Was heißt das?`,
    options: [
      `Links von ${num(qnorm(0.975))} liegen 97,5 % der Fläche, rechts davon 2,5 %.`,
      `97,5 % der Werte sind genau ${num(qnorm(0.975))}.`,
      `Rechts von ${num(qnorm(0.975))} liegen 97,5 % der Fläche.`,
      'Mit 97,5 % Wahrscheinlichkeit stimmt die Nullhypothese.',
    ],
    correct: 0,
    right: `Genau. Das Quantil ist die Grenze; links davon liegen 97,5 %, rechts die restlichen 2,5 %.`,
    diagnose: {
      1: 'Noch nicht ganz. Bei einer stetigen Verteilung hat kein einzelner Wert eine Wahrscheinlichkeit. Das Quantil ist eine Grenze.',
      2: 'Fast! Andersherum: Das p-Quantil hat den Anteil p links von sich. Rechts liegen nur 2,5 %.',
      3: 'Fast! Quantile beschreiben die Referenzverteilung. Wie wahrscheinlich eine Hypothese ist, sagen sie nicht.',
    },
  },
  fuerDich: `Wenn in einer Formel 1,96 steht, weißt du jetzt, woher die Zahl kommt: Sie ist das 97,5-%-Quantil der Standardnormalverteilung. Andere Niveaus brauchen andere Quantile.`,
  genau: {
    kurz: 'Das theoretische Quantil ist qₚ = inf{x: F(x) ≥ p}. Bei stetigen, streng steigenden F ist es die Umkehrfunktion von F.',
    paragraphs: [
      'Bei diskreten Verteilungen sind nicht alle Zielwahrscheinlichkeiten exakt erreichbar; dann nimmt man die kleinste Grenze, bei der F den Anteil p erreicht oder überschreitet.',
      `Empirische Quantile werden aus endlichen Beobachtungen bestimmt, und dafür gibt es verschiedene Regeln. Hier liegen ${S.atMost6} der ${S.n} Befragten bei höchstens ${num(Q10)} Stunden, also ${pct(S.atMost6 / S.n)} statt der 10 % im Modell.`,
      'Bei der Normalverteilung gilt qₚ = μ + σ · zₚ, wobei zₚ das Quantil der Standardnormalverteilung ist. Kritische Werte für Tests und Intervalle sind passende Quantile der Referenzverteilung, etwa der t-Verteilung.',
    ],
  },
};

export const theoreticalQuantileTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wo liegt im Normalmodell die Grenze der 10 % mit den kürzesten Nächten?',
    value: c => q10(c).q,
    result: c => {
      const m = q10(c);
      if (m.q === null) return { kurz: 'Alle haben dieselbe Schlafdauer angegeben. Ohne Streuung gibt es kein Normalmodell und kein Quantil darin.', fachlich: 'Für σ = 0 ist die Normalverteilung nicht definiert.' };
      const k = m.below(m.q);
      return {
        kurz: `Im Normalmodell mit μ = ${num(m.mean)} h und σ = ${num(m.sd)} h liegt das 10-%-Quantil bei ${num(m.q)} Stunden. In den Daten schlafen ${k} von ${m.n} höchstens so lange.`,
        fachlich: `q₀,₁ = μ + σ · z₀,₁ = ${num(m.mean)} + ${num(m.sd)} · (${num(Z10)}) ≈ ${num(m.q)} h.`,
        zusatz: `Das 90-%-Quantil liegt bei ${num(quant(0.9, m.mean, m.sd))} Stunden; dazwischen liegen 80 % des Modells.`,
      };
    },
    voraussetzung: 'Das Quantil gehört zum Normalmodell; ob es die Daten gut beschreibt, hängt davon ab, wie gut das Modell passt.',
    think: [
      {
        question: 'Alle schlafen eine Stunde länger. Was passiert mit dem 10-%-Quantil des Modells?',
        options: ['steigt um 1 Stunde', 'bleibt gleich', 'steigt um 10 %'], correct: 0,
        explain: 'μ steigt um eine Stunde, σ bleibt. Die ganze Kurve rückt nach rechts, jedes Quantil mit ihr.',
        kurz: 'Verschieben verschiebt jedes Quantil um genau so viel.',
        tryIt: { label: 'alle eine Stunde länger', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1 },
      },
      {
        question: 'Alle schlafen eine halbe Stunde kürzer. Was passiert mit dem 10-%-Quantil des Modells?',
        options: ['sinkt um 0,5 Stunden', 'bleibt gleich', 'steigt'], correct: 0,
        explain: 'μ sinkt um eine halbe Stunde, σ bleibt. Das Quantil wandert mit der Kurve nach links.',
        kurz: 'Die Grenze wandert mit dem Modell.',
        tryIt: { label: 'alle eine halbe Stunde kürzer', op: 'shift', column: 'x', value: -0.5 },
        expect: { change: 'plus', amount: -0.5 },
      },
    ],
  },
  next: {
    next: { id: 'critical_value', why: 'Die Entscheidungsgrenze eines Tests ist ein Quantil der Referenzverteilung.' },
    before: [
      { id: 'cumulative_probability', why: 'Das Quantil dreht F um: Anteil rein, Grenze raus.' },
      { id: 'theoretical_distribution', why: 'Das Modell, aus dem das Quantil berechnet wird.' },
    ],
    after: [
      { id: 'confidence', why: 'Nutzt Quantile wie 1,96 für die Breite des Intervalls.' },
      { id: 'standard_normal', why: 'Ihre Quantile sind die bekanntesten kritischen Werte.' },
    ],
    more: [{ id: 'quantile', why: 'Quantile der Daten: Grenzen, die aus beobachteten Werten bestimmt werden.' }],
  },
};
