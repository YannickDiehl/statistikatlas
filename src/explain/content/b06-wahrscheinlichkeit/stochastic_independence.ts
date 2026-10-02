// Begriffskarte „Stochastische Unabhängigkeit“. Beispiel: Anteil ohne Schulabschluss unter Befragten mit und ohne
// Weiterbildung (20,7 % und 21,2 %, fast gleich) und beim Abitur (23,2 % und 17,8 %). Zahlen in R nachgerechnet,
// siehe b06-wahrscheinlichkeit.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { ABSCHLUSS, column } from './gemeinsam';

const A = ABSCHLUSS;
const P_ABI = A.count[4] / A.n, P_W = A.mitWeiterbildung / A.n;
const EXPECTED = P_ABI * P_W * A.n;

/** Anteil mit Weiterbildung (y) je Schulabschluss (x) und insgesamt; größter Abstand in Prozentpunkten. */
function gaps(c: SampleCtx) {
  const s = column(c, 'x', 'schulabschluss'), w = column(c, 'y', 'weiterbildung'), n = s.length;
  const all = w.filter(v => v === 1).length / n;
  const groups = [0, 1, 2, 3, 4].map(code => {
    const idx = s.map((v, i) => v === code ? i : -1).filter(i => i >= 0);
    return { code, n: idx.length, share: idx.length ? idx.filter(i => w[i] === 1).length / idx.length : null };
  }).filter(g => g.share !== null) as { code: number; n: number; share: number }[];
  const biggest = groups.reduce((b, g) => Math.abs(g.share - all) > Math.abs(b.share - all) ? g : b, groups[0]);
  const abi = s.filter(v => v === 4).length, beide = s.filter((v, i) => v === 4 && w[i] === 1).length;
  return { n, all, groups, biggest, gap: Math.abs(biggest.share - all) * 100, abi, beide };
}

export const stochasticIndependence: ConceptCard = {
  concept: 'stochastic_independence',
  wofuer: 'Hängt die Weiterbildung mit dem Schulabschluss zusammen? Wenn nicht, wäre der Anteil mit Weiterbildung in jeder Abschlussgruppe gleich. Genau das meint stochastische Unabhängigkeit: Das eine verrät nichts über das andere.',
  kurz: 'Zwei Ereignisse sind unabhängig, wenn das Wissen über das eine nichts an der Wahrscheinlichkeit des anderen ändert. Dann ist der Anteil in jeder Teilgruppe derselbe.',
  stellDirVor: {
    text: `Unter allen ${A.n} Befragten haben ${pct(A.count[0] / A.n)} keinen Schulabschluss. Unter den ${A.mitWeiterbildung} mit Weiterbildung sind es ${pct(A.mit[0] / A.mitWeiterbildung)}, unter den ${A.ohneWeiterbildung} ohne Weiterbildung ${pct(A.ohne[0] / A.ohneWeiterbildung)}. Die drei Anteile liegen keinen Prozentpunkt auseinander: Für „ohne Schulabschluss“ verrät die Weiterbildung fast nichts. Beim Abitur ist das anders, mit ${pct(A.mit[4] / A.mitWeiterbildung)} gegenüber ${pct(A.ohne[4] / A.ohneWeiterbildung)}.`,
    figures: [
      { label: 'P(ohne Abschluss)', value: pct(A.count[0] / A.n) },
      { label: 'P(ohne Abschluss | Weiterbildung)', value: pct(A.mit[0] / A.mitWeiterbildung) },
      { label: 'P(Abitur | Weiterbildung)', value: pct(A.mit[4] / A.mitWeiterbildung) },
      { label: 'P(Abitur | keine Weiterbildung)', value: pct(A.ohne[4] / A.ohneWeiterbildung) },
    ],
  },
  heisst: {
    sym: 'P(A | B) = P(A)', say: 'P von A gegeben B gleich P von A',
    fach: 'A und B sind stochastisch unabhängig, wenn P(A ∩ B) = P(A) · P(B) gilt. Für P(B) > 0 ist das gleichbedeutend mit P(A | B) = P(A).',
  },
  bausteine: [
    {
      title: 'Mit und ohne Bedingung vergleichen',
      was: `Du vergleichst die bedingte Wahrscheinlichkeit mit der ohne Bedingung. Hier: P(Abitur | Weiterbildung) = ${pct(A.mit[4] / A.mitWeiterbildung)} mit P(Abitur) = ${pct(P_ABI)}.`,
      warum: 'Ändert das Wissen über B die Wahrscheinlichkeit von A, hängen die beiden zusammen. Ändert es nichts, sind sie unabhängig.',
      acht: 'Gleich heißt im Modell exakt gleich. In Daten weichen Anteile auch bei Unabhängigkeit ein wenig voneinander ab, weil der Zufall mitspielt.',
      concept: 'conditional_probability',
    },
    {
      title: 'Mit der Produktregel prüfen',
      was: 'Bei Unabhängigkeit ist die Wahrscheinlichkeit, dass beides eintritt, das Produkt der beiden Einzelwahrscheinlichkeiten.',
      rechnung: `Erwartet: P(Abitur) · P(Weiterbildung) = ${pct(P_ABI)} · ${pct(P_W)} = ${pct(P_ABI * P_W)}, also ${num(EXPECTED)} von ${A.n}. Beobachtet: ${A.mit[4]} von ${A.n}.`,
      warum: 'Das Produkt ist der Maßstab für „kein Zusammenhang“. Daraus entstehen die erwarteten Häufigkeiten einer Kreuztabelle.',
      acht: 'Das Produkt gilt nur bei Unabhängigkeit. Hängen die Ereignisse zusammen, rechnest du P(A ∩ B) = P(A | B) · P(B).',
      concept: 'expected',
    },
    {
      title: 'Unabhängige Beobachtungen annehmen',
      was: 'Unabhängigkeit ist auch eine Annahme über die Daten: Die Antwort einer befragten Person verrät nichts über die Antwort einer anderen.',
      warum: 'Fast alle Tests und Standardfehler rechnen damit. Werden Menschen aus derselben Familie oder Klasse befragt, ähneln sich ihre Antworten oft.',
      acht: 'Wiederholte Antworten derselben Person sind nicht unabhängig. Dafür gibt es eigene Verfahren für verbundene Messungen.',
      concept: 'paired_design',
    },
  ],
  ausprobieren: [
    {
      question: 'Zwei Ereignisse haben je die Wahrscheinlichkeit 0,5 und sind unabhängig. Wie wahrscheinlich treten beide ein?',
      options: ['0,25', '0,5', '1'], correct: 0, step: 2,
      explain: '0,5 · 0,5 = 0,25. Bei unabhängigen Ereignissen nimmst du die Wahrscheinlichkeiten mal; addieren darfst du nur, wenn sie sich ausschließen.',
      kurz: 'Unabhängig und beides: malnehmen.',
    },
    {
      question: 'Die Korrelation zweier Merkmale ist 0. Sind sie dann sicher unabhängig?',
      options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'r = 0 heißt nur: kein linearer Zusammenhang. Ein Zusammenhang in Form eines Bogens kann trotzdem bestehen, etwa wenn mittlere Werte des einen mit hohen Werten des anderen einhergehen.',
      kurz: 'Unkorreliert ist nicht dasselbe wie unabhängig.',
    },
    {
      question: `Im Lehrdatensatz sind die Anteile ohne Schulabschluss ${pct(A.mit[0] / A.mitWeiterbildung)} und ${pct(A.ohne[0] / A.ohneWeiterbildung)}, nicht exakt gleich. Beweist das einen Zusammenhang?`,
      options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Auch bei echter Unabhängigkeit schwanken Anteile in Stichproben ein wenig. Ob eine Abweichung größer ist, als der Zufall erwarten lässt, prüft der Chi-Quadrat-Test.',
      kurz: 'Kleine Abweichungen gibt es auch ohne Zusammenhang.',
    },
  ],
  check: {
    question: `Unter allen ${A.n} Befragten haben ${pct(P_W)} eine Weiterbildung gemacht. Unter den ${A.count[1]} mit Hauptschulabschluss sind es ${pct(A.mit[1] / A.count[1])}. Was folgt daraus?`,
    options: [
      'Weiterbildung und Hauptschulabschluss sind in diesen Daten nicht unabhängig.',
      'Sie sind unabhängig, weil beide Anteile unter 50 % liegen.',
      'Der Hauptschulabschluss verhindert eine Weiterbildung.',
      `Die Wahrscheinlichkeit für beides ist ${num(P_W)} · ${num(A.mit[1] / A.count[1])}.`,
    ],
    correct: 0,
    right: `Genau. ${pct(A.mit[1] / A.count[1])} sind nicht ${pct(P_W)}: Der Abschluss ändert in diesen Daten den Anteil. Ob das über den Zufall hinausgeht, ist eine zweite Frage.`,
    diagnose: {
      1: 'Noch nicht ganz. Unabhängig heißt: gleiche Anteile mit und ohne Bedingung. Ob sie unter 50 % liegen, spielt keine Rolle.',
      2: 'Fast! Aus Anteilen in Beobachtungsdaten folgt keine Wirkung. Die Daten zeigen nur, dass Abschluss und Weiterbildung zusammenhängen.',
      3: `Fast! 0,3 ist schon eine bedingte Wahrscheinlichkeit. Richtig ist P(Weiterbildung | Hauptschule) · P(Hauptschule) = ${num(A.mit[1] / A.count[1])} · ${num(A.count[1] / A.n)} = ${num(A.mit[1] / A.n)}: ${A.mit[1]} von ${A.n} haben beides.`,
    },
  },
  fuerDich: 'Wenn eine Studie sagt, zwei Merkmale hängen nicht zusammen, frag nach: Sind die Anteile in allen Gruppen ähnlich? Und wurden die Menschen unabhängig voneinander befragt oder ganze Familien, Klassen, Haushalte?',
  genau: {
    kurz: 'Formal heißt Unabhängigkeit P(A ∩ B) = P(A) · P(B). Für zwei Merkmale muss das für alle Kombinationen ihrer Werte gelten.',
    paragraphs: [
      'Ist P(B) > 0, ist die Produktregel gleichbedeutend mit P(A | B) = P(A). Die Produktform gilt auch dann, wenn P(B) = 0 ist.',
      'Unkorreliert bedeutet nur fehlende lineare Kovariation, sofern die Varianzen existieren. Unabhängige Merkmale sind immer unkorreliert, aber nicht umgekehrt.',
      'Viele Verfahren nehmen unabhängige Beobachtungen an. Wiederholte Antworten derselben Person, Klassen oder Haushalte können Abhängigkeiten erzeugen; dann ist der Standardfehler oft zu klein.',
    ],
  },
};

export const stochasticIndependenceTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss', y: 'weiterbildung' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Ist der Anteil mit Weiterbildung in jeder Abschlussgruppe gleich?',
    value: c => gaps(c).gap,
    result: c => {
      const g = gaps(c), label = A.labels[g.biggest.code];
      const list = g.groups.map(x => `${A.labels[x.code]} ${pct(x.share)}`).join(', ');
      return {
        kurz: g.gap < 0.05
          ? `In jeder Abschlussgruppe haben gleich viele eine Weiterbildung gemacht, ${pct(g.all)}. Weiterbildung und Abschluss sind in diesen Daten unabhängig.`
          : `Insgesamt haben ${pct(g.all)} eine Weiterbildung gemacht. Am weitesten davon entfernt ist die Gruppe ${label} mit ${pct(g.biggest.share)}, also ${num(g.gap, 1)} Prozentpunkte. Exakt unabhängig sind die beiden Merkmale in diesen Daten nicht.`,
        fachlich: `P(Weiterbildung | Abschluss): ${list}; P(Weiterbildung) = ${pct(g.all)}. Bei Unabhängigkeit wären alle gleich.`,
        zusatz: g.abi ? `Bei Unabhängigkeit erwartet man unter den ${g.abi} mit Abitur ${num(g.abi * g.all)} mit Weiterbildung; beobachtet sind es ${g.beide}.` : undefined,
      };
    },
    voraussetzung: 'Die Befragten antworten unabhängig voneinander. Ob die Abstände über den Zufall hinausgehen, prüft der Chi-Quadrat-Test.',
    think: [
      {
        question: 'Weiterbildung wird umgepolt: Wer eine gemacht hat, gilt als ohne, und umgekehrt. Was passiert mit dem größten Abstand zwischen den Gruppen?',
        options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Jeder Anteil wird zu 1 minus dem alten Anteil, auch der Anteil unter allen. Die Abstände drehen nur ihr Vorzeichen, ihre Größe bleibt.',
        kurz: 'Umpolen ändert die Richtung, nicht die Stärke der Abhängigkeit.',
        tryIt: { label: 'Weiterbildung umpolen (1 minus Code)', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle 200 hätten eine Weiterbildung gemacht. Wie groß ist dann der größte Abstand, in Prozentpunkten?',
        options: ['0', '11', '41'], correct: 0,
        explain: 'In jeder Gruppe sind es dann 100 %, insgesamt auch. Ohne Unterschiede im einen Merkmal kann der Abschluss nichts mehr verraten.',
        kurz: 'Was für alle gilt, ist von allem unabhängig.',
        tryIt: { label: 'alle mit Weiterbildung (Code 1)', op: 'constant', column: 'y', value: 1 },
        expect: { change: 'equals', value: 0 },
      },
    ],
  },
  r: {
    entry: 'crosstab', variant: 1,
    outputMap: [
      { match: '21.0%', atlas: 'P(ohne Abschluss) ohne Bedingung', step: 1, explain: 'In der Spalte Total: 21 % aller Befragten haben keinen Schulabschluss. Bei Unabhängigkeit stünde dieser Anteil in jeder Spalte.' },
      { match: '20.7%', atlas: 'P(ohne Abschluss | Weiterbildung)', step: 1, explain: 'Unter den 82 mit Weiterbildung haben 20,7 % keinen Schulabschluss, fast dieselben 21 % wie insgesamt.' },
      { match: '21.2%', atlas: 'P(ohne Abschluss | keine Weiterbildung)', step: 1, explain: 'Unter den 118 ohne Weiterbildung sind es 21,2 %. Beide Spalten liegen nah an der Spalte Total.' },
      { match: 'col %', atlas: 'Spaltenprozente', step: 1, explain: 'col % heißt Spaltenprozent: Die Spalte ist die Bedingung, jede Spalte ergibt zusammen 100 %.' },
    ],
    check: {
      question: 'Welche Zahl stünde bei exakter Unabhängigkeit auch in den Spalten Nein und Ja der ersten Zeile? Tippe sie an.', correct: '21.0%',
      wrong: {
        '20.7%': 'Fast! Das ist der Anteil unter den Befragten mit Weiterbildung. Bei Unabhängigkeit wäre er gleich dem Anteil in der Spalte Total.',
        '21.2%': 'Fast! Das ist der Anteil unter den Befragten ohne Weiterbildung. Bei Unabhängigkeit wäre er gleich dem Anteil in der Spalte Total.',
      },
    },
  },
  next: {
    next: { id: 'expected', why: 'Aus der Produktregel entstehen die Zellhäufigkeiten, die man bei Unabhängigkeit erwarten würde.' },
    before: [
      { id: 'conditional_probability', why: 'Unabhängigkeit vergleicht die bedingte mit der unbedingten Wahrscheinlichkeit.' },
      { id: 'probability', why: 'Die Einzelwahrscheinlichkeiten, deren Produkt den Maßstab liefert.' },
    ],
    after: [
      { id: 'chi_square', why: 'Prüft, ob Abweichungen von der Unabhängigkeit über den Zufall hinausgehen.' },
      { id: 'sampling', why: 'Unabhängige Befragte sind eine Annahme fast aller Verfahren.' },
      { id: 'binomial_distribution', why: 'Setzt unabhängige Versuche voraus.' },
    ],
    more: [{ id: 'pearson', why: 'r = 0 heißt nur: kein linearer Zusammenhang, nicht Unabhängigkeit.' }],
  },
};
