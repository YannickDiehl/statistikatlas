// Werkstatt „Gewichte“ (weights): der gewichtete Mittelwert x̄w = Σ wᵢxᵢ / Σ wᵢ in fünf Schritten. Fünf Beispielpersonen
// antworten auf die Frage nach dem Vertrauen in den Bundestag (1 bis 7); drei aus dem Westen zählen 2, zwei aus dem Osten 1
// (gerundetes Verhältnis der ALLBUS-Personengewichte). Vorlage: Werkstatt, weil die Rechnung Schritt für Schritt
// nachgerechnet wird. Der Reiter „Mit 200 Befragten“ gewichtet den Lehrdatensatz auf den Anteil mit Hochschulreife im
// ALLBUS 2023. Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import { close, count, num, pct, signed } from '../../format';
import { sampleColumn } from '../../sample';
import { listText, mean, role } from './shared';

export type Gewichtet = { x: number[]; w: number[] };
export type GewichtetS = {
  xs: number[]; ws: number[]; n: number; prod: number[]; plus: number[];
  sumX: number; sumW: number; sumWX: number; mean: number; meanW: number; perN: number;
};
type C = Ctx<GewichtetS>;

const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
/** Region der fünf Beispielpersonen: A, B und C aus dem Westen, D und E aus dem Osten. */
export const REGION = ['Westen', 'Westen', 'Westen', 'Osten', 'Osten'] as const;
const P = (c: C) => c.names[c.who];
const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';

/** ALLBUS 2023 (ungewichtet je Region bzw. mit wghtpew): Anteil Ost, Gewichte, Vertrauen in den Bundestag (pt03, 1 bis 7). */
export const ALLBUS_GEWICHT = {
  ost: 1679, n: 5246, anteilOst: 0.3201, anteilOstGewichtet: 0.1684, wWest: 1.2231, wOst: 0.5261,
  vertrauenWest: 4.0821, vertrauenOst: 3.6664, vertrauen: 3.9468, vertrauenGewichtet: 4.0139,
} as const;
const A = ALLBUS_GEWICHT;

export function gewichtet(d: Gewichtet): GewichtetS {
  const prod = d.x.map((x, i) => d.w[i] * x), sumX = d.x.reduce((a, b) => a + b, 0), sumW = d.w.reduce((a, b) => a + b, 0);
  const sumWX = prod.reduce((a, b) => a + b, 0);
  return {
    xs: d.x, ws: d.w, n: d.x.length, prod, plus: d.x.map((x, i) => d.w[i] + x),
    sumX, sumW, sumWX, mean: sumX / d.x.length, meanW: sumWX / sumW, perN: sumWX / d.x.length,
  };
}

/** „Hier zählen A, B und C je 2, D und E je 1.“: Personen nach ihrem Gewicht. */
function weightText(c: C) {
  const ws = [...new Set(c.s.ws)].sort((a, b) => b - a);
  const who = (w: number) => listText(c.s.ws.map((v, i) => v === w ? c.names[i] : '').filter(Boolean));
  if (ws.length === 1) return `Hier zählen alle fünf je ${num(ws[0])}.`;
  return `Hier zählen ${ws.map(w => `${who(w)} je ${num(w)}`).join(', ')}.`;
}

const terms = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 3 }, ' '] as FNode[] : []),
  { part: [`${num(c.s.ws[i])} · ${num(x)}`], m: 2 },
]);
const wTerms = (c: C): FNode[] => c.s.ws.flatMap((w, i): FNode[] => [...(i ? [' ', { part: ['+'], m: 4 }, ' '] as FNode[] : []), { part: [num(w)], m: 1 }]);

export const gewichte: Workshop<Gewichtet, GewichtetS> = {
  id: 'gewichte',
  wofuer: `Im ALLBUS 2023 kommt fast jede dritte befragte Person aus Ostdeutschland (${pct(A.anteilOst)}), gewichtet nur jede sechste (${pct(A.anteilOstGewichtet)}). Beim Vertrauen in den Bundestag (1 bis 7) antworten Befragte im Osten im Schnitt niedriger: ${num(A.vertrauenOst)} gegen ${num(A.vertrauenWest)} im Westen. Ohne Gewichte läge der Durchschnitt deshalb zu niedrig, bei ${num(A.vertrauen)} statt ${num(A.vertrauenGewichtet)}.`,
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber nur aus fünf kleinen Schritten, die du kennst: malnehmen, zusammenzählen und teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b01-gewichte',
  dataNote: 'Fünf Beispielpersonen, drei aus dem Westen (Gewicht 2) und zwei aus dem Osten (Gewicht 1). Die Punkte im Bild lassen sich ziehen.',
  names: NAMES,
  bounds: { min: 1, max: 7 },
  presets: [
    { id: 'verschieden', label: 'Ost und West verschieden: 5 4 5 | 2 4', data: { x: [5, 4, 5, 2, 4], w: [2, 2, 2, 1, 1] } },
    { id: 'gleich', label: 'Ost und West im Schnitt gleich: 3 5 4 | 4 4', data: { x: [3, 5, 4, 4, 4], w: [2, 2, 2, 1, 1] } },
  ],
  compute: gewichtet,
  glyphs: [
    { sym: 'wᵢ', say: 'w i', term: 'Gewicht', plain: 'wie stark Person i zählt', step: 1 },
    { sym: 'xᵢ', say: 'x i', term: 'Beobachtung', plain: 'die Antwort von Person i', step: 2 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Person einmal', step: 3 },
    { sym: 'x̄w', say: 'x quer w', term: 'Gewichteter Mittelwert', plain: 'die Mitte, bei der jede Person nach ihrem Gewicht zählt', step: 5 },
  ],
  steps: [
    {
      button: 'wᵢ', title: 'Gewichte vergeben', sym: 'wᵢ', say: 'w i', concept: 'weights', perPerson: true,
      was: c => `Jede Person bekommt eine Zahl, die sagt, wie stark sie zählt. ${weightText(c)}`,
      rechnung: c => `Person ${P(c)} aus dem ${REGION[c.who]}: w = ${num(c.s.ws[c.who])}`,
      fach: 'Das Gewicht wᵢ gibt an, mit welchem Faktor Person i in die Rechnung eingeht. Designgewichte gleichen ungleiche Auswahlwahrscheinlichkeiten aus.',
      warum: 'Im Osten wurde etwa doppelt so oft befragt, wie es dem Anteil an der Bevölkerung entspricht. Ohne Gewichte zählten die Antworten aus dem Osten zu viel.',
      acht: 'Gewicht 2 heißt nicht, dass die Antwort doppelt so groß wird. Sie zählt nur so, als stünde sie zweimal da.',
      check: {
        question: c => `Wie stark zählt Person ${P(c)}?`,
        answer: c => c.s.ws[c.who],
        diagnose: (c, v) => {
          const w = c.s.ws[c.who], x = c.s.xs[c.who];
          if (v === 'NA' || close(v, w)) return null;
          if (close(v, x)) return `Fast! ${num(x)} ist die Antwort von Person ${P(c)}. Gefragt ist ihr Gewicht.`;
          if (close(v, 1)) return `Fast! 1 wäre das Gewicht ohne Gewichtung. Person ${P(c)} zählt ${num(w)}.`;
          if (c.s.ws.some(o => close(v, o))) return `Fast! Das ist das Gewicht der anderen Gruppe. Person ${P(c)} aus dem ${REGION[c.who]} zählt ${num(w)}.`;
          return null;
        },
      },
    },
    {
      button: 'wᵢ · xᵢ', title: 'Antworten mit dem Gewicht malnehmen', sym: 'wᵢ · xᵢ', say: 'w i mal x i', concept: 'multiply', perPerson: true,
      was: 'Jede Antwort nehmen wir mit dem Gewicht ihrer Person mal.',
      rechnung: c => `Person ${P(c)}: ${num(c.s.ws[c.who])} · ${num(c.s.xs[c.who])} = ${num(c.s.prod[c.who])}`,
      fach: 'Das Produkt aus Gewicht und Messwert ist der gewichtete Beitrag der Person zur Summe.',
      warum: 'So zählt eine Antwort mit Gewicht 2 genauso, als hätten zwei Personen sie gegeben.',
      acht: c => {
        const w = c.s.ws[c.who], x = c.s.xs[c.who];
        return close(w + x, w * x) ? 'Gewicht und Antwort werden malgenommen, nicht zusammengezählt. Bei 2 und 2 kommt zufällig dasselbe heraus, sonst nicht.'
          : `Nicht das Gewicht zur Antwort zählen: ${num(w)} + ${num(x)} wäre ${num(w + x)}, gemeint ist ${num(w)} · ${num(x)} = ${num(w * x)}.`;
      },
      check: {
        question: c => `Was kommt heraus, wenn du ${num(c.s.xs[c.who])} mit dem Gewicht ${num(c.s.ws[c.who])} malnimmst?`,
        answer: c => c.s.prod[c.who],
        diagnose: (c, v) => {
          const w = c.s.ws[c.who], x = c.s.xs[c.who], p = c.s.prod[c.who];
          if (v === 'NA' || close(v, p)) return null;
          if (close(v, w + x)) return 'Fast! Das ist die Summe. Gewicht und Antwort werden malgenommen.';
          if (close(v, x)) return `Fast! Das ist die Antwort ohne Gewicht. Jetzt noch mal ${num(w)} nehmen.`;
          return null;
        },
      },
    },
    {
      button: 'Σ wᵢxᵢ', title: 'Die gewichteten Antworten zusammenzählen', sym: 'Σ wᵢxᵢ', say: 'Sigma w i x i', concept: 'sum', perPerson: true,
      was: 'Wir zählen die fünf Produkte zusammen.',
      rechnung: c => `${c.s.prod.map(p => num(p)).join(' + ')} = ${num(c.s.sumWX)}. Person ${P(c)} steuert ${num(c.s.prod[c.who])} bei.`,
      fach: 'Σ wᵢxᵢ ist die gewichtete Summe: jede Antwort, mit ihrem Gewicht malgenommen, genau einmal addiert.',
      warum: 'So steckt in einer Zahl, was alle zusammen beitragen, jede Person nach ihrem Gewicht.',
      acht: 'Zusammengezählt werden die Produkte, nicht die Antworten selbst. Die Antworten allein ergäben die ungewichtete Summe.',
      check: {
        question: 'Wie groß ist die Summe der gewichteten Antworten?',
        answer: c => c.s.sumWX,
        diagnose: (c, v) => v !== 'NA' && !close(c.s.sumX, c.s.sumWX) && close(v, c.s.sumX) ? 'Fast! Das ist die Summe der Antworten ohne Gewichte. Zusammengezählt werden die Produkte.' : null,
      },
    },
    {
      button: 'Σ wᵢ', title: 'Die Gewichte zusammenzählen', sym: 'Σ wᵢ', say: 'Sigma w i', concept: 'sum', perPerson: false,
      was: 'Wir zählen die fünf Gewichte zusammen.',
      rechnung: c => `${c.s.ws.map(w => num(w)).join(' + ')} = ${num(c.s.sumW)}`,
      fach: 'Die Summe der Gewichte ist die gewichtete Fallzahl. Sie steht im Nenner an der Stelle von n.',
      warum: c => `Die fünf Personen zählen zusammen wie ${num(c.s.sumW)}. Durch diese Zahl teilen wir gleich.`,
      acht: 'Nicht durch 5 teilen. Mit Gewichten teilst du durch die Summe der Gewichte.',
      check: {
        question: 'Wie groß ist die Summe der fünf Gewichte?',
        answer: c => c.s.sumW,
        diagnose: (c, v) => v !== 'NA' && !close(c.s.sumW, c.s.n) && close(v, c.s.n) ? 'Fast! 5 ist die Zahl der Personen. Gesucht ist die Summe ihrer Gewichte.' : null,
      },
    },
    {
      button: '÷ Σ wᵢ', title: 'Gerecht teilen', sym: 'x̄w', say: 'x quer w', concept: 'mean', perPerson: false,
      was: 'Wir teilen die Summe der gewichteten Antworten durch die Summe der Gewichte. Das ist der gewichtete Mittelwert.',
      rechnung: c => `${num(c.s.sumWX)} / ${num(c.s.sumW)} ${eq(c.s.meanW)} ${num(c.s.meanW)}`,
      fach: 'Der gewichtete Mittelwert ist x̄w = Σ wᵢxᵢ / Σ wᵢ. Sind alle Gewichte gleich, ist er das gewöhnliche arithmetische Mittel.',
      warum: c => `So liegt die Mitte dort, wo sie mit den richtigen Anteilen läge. Ohne Gewichte läge sie bei ${num(c.s.mean)}.`,
      acht: c => close(c.s.sumW, c.s.n)
        ? 'Hier ist die Summe der Gewichte zufällig 5. Sonst gilt: Wer durch 5 statt durch Σ wᵢ teilt, bekommt eine falsche Mitte.'
        : `Wer durch 5 teilt, bekommt ${num(c.s.perN)} statt ${num(c.s.meanW)}. Bei Gewichten teilst du durch Σ wᵢ.`,
      check: {
        question: 'Was kommt heraus, wenn du die gewichtete Summe durch die Summe der Gewichte teilst?',
        answer: c => c.s.meanW,
        diagnose: (c, v) => v === 'NA' || close(v, c.s.meanW) ? null
          : close(v, c.s.perN) ? 'Fast! Du hast durch 5 geteilt. Bei Gewichten teilst du durch die Summe der Gewichte.'
          : close(v, c.s.mean) ? 'Fast! Das ist der Mittelwert ohne Gewichte.'
          : null,
      },
    },
  ],
  numeric: c => [
    'x̄w = ( ', ...terms(c), ' ) / ( ', ...wTerms(c), ' )', { br: true },
    '= ', { part: [num(c.s.sumWX)], m: 3 }, ' / ', { part: [num(c.s.sumW)], m: 4 }, ` ${eq(c.s.meanW)} `, { part: [num(c.s.meanW)], m: 5 },
  ],
  table: {
    columns: [
      { head: 'Region', from: 1, active: [1], cell: (_c, i) => REGION[i] === 'Westen' ? 'West' : 'Ost' },
      { head: 'xᵢ', from: 1, active: [2], cell: (c, i) => num(c.s.xs[i]), sum: c => num(c.s.sumX), sumFrom: 5, sumNote: 'ohne Gewichte' },
      { head: 'wᵢ', from: 1, active: [1, 4], cell: (c, i) => num(c.s.ws[i]), sum: c => num(c.s.sumW), sumFrom: 4 },
      { head: 'wᵢ · xᵢ', from: 2, active: [2, 3], cell: (c, i) => num(c.s.prod[i]), sum: c => num(c.s.sumWX), sumFrom: 3 },
    ],
    lines: [
      { from: 5, step: 5, text: c => `x̄w = ${num(c.s.sumWX)} / ${num(c.s.sumW)} ${eq(c.s.meanW)} ${num(c.s.meanW)}` },
      { from: 5, step: 5, text: c => `ohne Gewichte: x̄ = ${num(c.s.sumX)} / 5 ${eq(c.s.mean)} ${num(c.s.mean)}` },
    ],
  },
  captions: {
    1: 'Die fünf Antworten auf der Skala von 1 bis 7. Rechts steht das Gewicht jeder Person. Du kannst die Punkte ziehen.',
    2: 'Neben jedem Punkt steht sein gewichteter Beitrag wᵢ · xᵢ.',
    3: 'Die Beiträge zusammen ergeben die gewichtete Summe.',
    4: 'Die Gewichte zusammen sagen, wie viele Personen die fünf darstellen.',
    5: 'Gestrichelt die Mitte ohne Gewichte, durchgezogen die gewichtete Mitte.',
  },
  think: [
    {
      question: 'Alle fünf bekommen das Gewicht 1. Was kommt heraus?', options: ['der gewöhnliche Mittelwert', 'die Hälfte davon'], correct: 0, step: 5,
      explain: c => `Dann ist Σ wᵢxᵢ die gewöhnliche Summe und Σ wᵢ = 5. Heraus kommt der Mittelwert ohne Gewichte, x̄ = ${num(c.s.mean)}.`,
      kurz: 'Gleiche Gewichte, gewöhnlicher Mittelwert.',
      tryIt: { label: 'alle Gewichte auf 1', apply: d => ({ x: d.x, w: d.x.map(() => 1) }) },
    },
    {
      question: 'Alle Gewichte werden verdoppelt. Was macht x̄w?', options: ['bleibt gleich', 'verdoppelt sich'], correct: 0, step: 5,
      explain: 'Zähler und Nenner verdoppeln sich beide, ihr Verhältnis bleibt. Für den Mittelwert zählt nur das Verhältnis der Gewichte, nicht ihre Größe.',
      kurz: 'Nur das Verhältnis der Gewichte zählt.',
      tryIt: { label: 'alle Gewichte verdoppeln', apply: d => ({ x: d.x, w: d.w.map(w => w * 2) }) },
    },
    {
      question: 'Mit den Gewichten 2 und 1 antworten D und E aus dem Osten jetzt beide 7. Welcher Mittelwert steigt stärker?', options: ['der Mittelwert ohne Gewichte', 'der gewichtete Mittelwert'], correct: 0, step: 1,
      explain: 'Ohne Gewichte zählen D und E wie alle anderen. Mit Gewichten zählen sie nur halb so viel wie eine Person aus dem Westen und bewegen die Mitte weniger.',
      kurz: 'Wer weniger Gewicht hat, bewegt die gewichtete Mitte weniger.',
      tryIt: { label: 'Gewichte 2 und 1, D und E auf 7', apply: d => ({ x: d.x.map((x, i) => i >= 3 ? 7 : x), w: d.x.map((_, i) => i < 3 ? 2 : 1) }) },
    },
  ],
  variants: {
    weights: {
      lastStep: 5,
      kurz: 'Gewichte legen fest, wie stark jede Person in eine Rechnung eingeht. Gruppen, die zu oft befragt wurden, zählen weniger, und Gruppen, die zu selten befragt wurden, mehr.',
      fachlich: 'Der gewichtete Mittelwert ist x̄w = Σ wᵢxᵢ / Σ wᵢ. Designgewichte gleichen ungleiche Auswahlwahrscheinlichkeiten aus.',
      symbolic: ['x̄w = ', { frac: [{ big: 'Σ', m: 3 }, { part: ['w', { sub: 'i' }], m: 1 }, { part: ['x', { sub: 'i' }], m: 2 }], den: [{ big: 'Σ', m: 4 }, { part: ['w', { sub: 'i' }], m: 4 }], m: 5 }],
      aria: 'x quer w gleich Summe über alle Personen i von w i mal x i, geteilt durch die Summe aller w i',
      metrics: [{ label: 'ohne Gewichte x̄', value: c => num(c.s.mean) }, { label: 'gewichtet x̄w', value: c => num(c.s.meanW) }],
      interpret: c => {
        const d = c.s.meanW - c.s.mean;
        return {
          kurz: Math.abs(d) < 0.005
            ? `Gewichtet und ohne Gewichte liegt das Vertrauen bei ${num(c.s.meanW)} Punkten. ${new Set(c.s.ws).size === 1 ? 'Alle zählen gleich viel, deshalb ist der gewichtete Mittelwert der gewöhnliche.' : 'Antworten Personen mit viel und wenig Gewicht im Schnitt gleich, ändern Gewichte die Mitte nicht.'}`
            : `Gewichtet liegt das Vertrauen in den Bundestag bei ${num(c.s.meanW)} Punkten, ohne Gewichte bei ${num(c.s.mean)}. Die Personen mit mehr Gewicht antworten hier im Schnitt ${d > 0 ? 'höher und ziehen die Mitte nach oben' : 'niedriger und ziehen die Mitte nach unten'}.`,
          fachlich: `x̄w = ${num(c.s.sumWX)} / ${num(c.s.sumW)} ${eq(c.s.meanW)} ${num(c.s.meanW)}; ohne Gewichte x̄ = ${num(c.s.mean)}. ${Math.abs(d) < 0.005 ? 'Der Unterschied ist 0, weil Gewicht und Antwort nicht zusammenhängen.' : `Der Unterschied von ${signed(d)} Punkten entsteht, weil Gewicht und Antwort zusammenhängen.`}`,
        };
      },
      genau: {
        kurz: 'Für den Mittelwert zählt nur das Verhältnis der Gewichte. Für Standardfehler und Tests zählt dagegen auch ihre Größe.',
        paragraphs: () => [
          `Im ALLBUS 2023 kommen ${count(A.ost)} von ${count(A.n)} Befragten aus Ostdeutschland, ungewichtet ${pct(A.anteilOst)}. Mit dem Personengewicht wghtpew zählen sie weniger, im Mittel ${num(A.wOst)} statt ${num(A.wWest)} im Westen; gewichtet sind es ${pct(A.anteilOstGewichtet)}.`,
          'Die Gewichte 2 und 1 im Beispiel stehen für dieses Verhältnis, gerundet: Eine Person aus dem Westen zählt etwa doppelt so viel wie eine aus dem Osten.',
          'Für Varianz, Standardfehler und Tests ist die Größe der Gewichte nicht egal. mariposa teilt bei w_var durch Σw − 1 und rechnet bei w_se mit der Wurzel aus Σw; Gewichte umzuskalieren ist deshalb keine folgenlose Formatierung.',
          'Gewichte sind keine automatische Korrektur für jedes Erhebungsdesign. Klumpen und Schichten einer Stichprobe brauchen eigene Verfahren, ein weights-Argument allein berücksichtigt sie nicht.',
        ],
      },
    },
  },
};

// ---------- Reiter: den Lehrdatensatz auf den Anteil mit Hochschulreife im ALLBUS 2023 gewichten ----------

/** ALLBUS 2023, mit wghtpew gewichtet: Anteil mit Fachhochschul- oder Hochschulreife unter den Befragten mit Schulabschluss 1 bis 5 (R: 0.4937). */
export const ZIEL_HOCHSCHULREIFE = 0.4937;

/** Gewichte für die 200: Wer Fachhochschulreife oder Abitur hat (Code 3 oder 4), zählt so viel, dass der Anteil dem ALLBUS entspricht. */
export function bildungsgewicht(c: SampleCtx) {
  const xs = sampleColumn(c.rows, role(c, 'x', 'lernzeit')), school = sampleColumn(c.rows, role(c, 'group', 'schulabschluss'));
  const hr = school.map(s => s >= 3), share = hr.filter(Boolean).length / hr.length;
  const wHr = ZIEL_HOCHSCHULREIFE / share, wOther = (1 - ZIEL_HOCHSCHULREIFE) / (1 - share);
  const w = hr.map(h => h ? wHr : wOther);
  return { xs, share, wHr, wOther, nHr: hr.filter(Boolean).length, mean: mean(xs), meanW: mean(xs, w) };
}

export const weightsTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Die Hochschulreife kommt hier seltener vor als im ALLBUS 2023. Gewichte gleichen das aus.',
    value: c => bildungsgewicht(c).meanW,
    result: c => {
      const g = bildungsgewicht(c), d = g.meanW - g.mean;
      return {
        kurz: `Ohne Gewichte haben die 200 Befragten in den letzten sieben Tagen im Schnitt ${num(g.mean)} Stunden gelernt, gewichtet ${num(g.meanW)} Stunden. Wer Fachhochschulreife oder Abitur hat, zählt ${num(g.wHr)}-mal, alle anderen ${num(g.wOther)}-mal.`,
        fachlich: `Anpassungsgewichte auf ${pct(ZIEL_HOCHSCHULREIFE)} mit Hochschulreife (ALLBUS 2023, gewichtet) statt ${pct(g.share)} im Lehrdatensatz; x̄w ≈ ${num(g.meanW)} h, Unterschied ${signed(d)} h.`,
        zusatz: `${g.nHr} von ${g.xs.length} Befragten haben Fachhochschulreife oder Abitur.`,
      };
    },
    voraussetzung: 'Die Gewichte gleichen nur den Anteil mit Hochschulreife an den ALLBUS 2023 an. Andere Unterschiede bleiben, und der ALLBUS selbst ist nur nach Ost und West gewichtet, nicht nach Bildung.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem gewichteten Mittelwert?',
        options: ['steigt um 1 Stunde', 'bleibt gleich', 'steigt um mehr als 1 Stunde'], correct: 0,
        explain: 'Jede Antwort wächst um 1, egal wie stark sie zählt. Geteilt durch die Summe der Gewichte bleibt genau 1 Stunde mehr.',
        kurz: 'Verschieben wirkt mit und ohne Gewichte gleich.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1 },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem gewichteten Mittelwert?',
        options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1,
        explain: 'Jedes Produkt wᵢ · xᵢ verdoppelt sich, die Summe der Gewichte bleibt. Also verdoppelt sich auch x̄w.',
        kurz: 'Malnehmen wirkt auf den gewichteten Mittelwert genauso.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  r: {
    entry: 'mean', variant: 1,
    outputMap: [
      { match: 'Weights: gewicht', atlas: 'Gewichtsspalte wᵢ', step: 1, explain: 'R nennt die Spalte, nach der gewichtet wurde. Hier hat jede Person das Gewicht 1.' },
      { match: 'Mean', atlas: 'gewichteter Mittelwert x̄w', step: 5, explain: 'Mit Gewicht 1 für alle ist x̄w genau der gewöhnliche Mittelwert, 7.752 wie ohne Gewichte.' },
      { match: 'N', atlas: 'Summe der Gewichte Σ wᵢ', step: 4, explain: 'Mit Gewichten meldet w_mean() unter N die Summe der Gewichte. Mit Gewicht 1 für alle ist sie 200, so viele wie Personen.' },
    ],
    check: {
      question: 'Woran erkennst du in der Ausgabe, dass R gewichtet gerechnet hat? Tippe es an.', correct: 'Weights: gewicht',
      wrong: {
        Mean: 'Fast! Der Mittelwert sieht mit und ohne Gewichte gleich aus. Dass gewichtet wurde, steht in der Zeile darüber.',
        N: 'Fast! N ist hier die Summe der Gewichte, mit Gewicht 1 für alle so groß wie die Zahl der Personen. Dass gewichtet wurde, steht bei Weights.',
      },
    },
  },
  next: {
    next: { id: 'random_sampling', why: 'Gewichte gleichen ungleiche Auswahlwahrscheinlichkeiten aus. Wie Zufallsauswahl funktioniert, zeigt dieser Begriff.' },
    before: [
      { id: 'mean', why: 'Der gewöhnliche Mittelwert, bei dem jede Person gleich viel zählt.' },
      { id: 'series', why: 'Die Antworten, die mit ihrem Gewicht malgenommen werden.' },
    ],
    after: [
      { id: 'se', why: 'Mit Gewichten ändert sich auch, wie genau ein Mittelwert geschätzt ist.' },
      { id: 'missing_mechanisms', why: 'Erklärbares Fehlen lässt sich teilweise mit Gewichten ausgleichen.' },
    ],
    more: [{ id: 'sampling_bias', why: 'Gewichte helfen nur gegen Verzerrungen, deren Ursache bekannt ist.' }],
  },
};
