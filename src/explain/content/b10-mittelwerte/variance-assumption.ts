// Begriffskarte „Gleiche Fehlervarianz“: Streuung der Lernzeit in den fünf Abschlussgruppen des Lehrdatensatzes, klassische
// und Welch-ANOVA im Vergleich (summary von oneway_anova). Das Bild zeigt die Standardabweichungen je Gruppe und die
// gemeinsame Streuung √MS_W. Referenzwerte: ./b10-mittelwerte.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { anovaFor, dfText, groupsFor, leveneFor, pText } from './stats';

/** Standardabweichung der Lernzeit je Schulabschluss (Codes 0 bis 4) und gemeinsame Streuung √MS_W; aus R. */
export const STREUUNGEN = {
  sd: [3.071975, 2.529113, 3.324454, 2.725655, 3.360475],
  labels: ['ohne', 'Haupt', 'Mittel', 'FHR', 'Abitur'],
  pooled: Math.sqrt(9.086343744),
} as const;

/** Größte durch kleinste Standardabweichung der Gruppen. */
export function sdRatio(c: SampleCtx): number | null {
  const sds = groupsFor(c).map(g => g.sd).filter(Number.isFinite);
  const lo = Math.min(...sds), hi = Math.max(...sds);
  return sds.length >= 2 && lo > 0 ? hi / lo : null;
}

export const varianceAssumption: ConceptCard = {
  concept: 'variance_assumption',
  picture: 'b10-streuungen',
  wofuer: 'Die klassische ANOVA und der Student-t-Test nehmen an, dass die Menschen in allen Gruppen ähnlich stark um ihre Gruppenmitte streuen. In der Regression heißt dieselbe Annahme: Die Vorhersagefehler streuen überall gleich stark. Was passiert, wenn das nicht stimmt?',
  kurz: 'Gleiche Fehlervarianz heißt: Die Abweichungen vom Modell streuen überall ungefähr gleich stark. Der Fachbegriff dafür ist Homoskedastizität.',
  stellDirVor: {
    text: 'Im Lehrdatensatz streut die Lernzeit der letzten sieben Tage in den fünf Abschlussgruppen ähnlich stark: Die Standardabweichungen liegen zwischen 2,53 Stunden (Hauptschulabschluss) und 3,36 Stunden (Abitur). Die größte ist damit 1,33-mal so groß wie die kleinste. Die klassische ANOVA meldet F = 8,64, die Welch-ANOVA ohne diese Annahme F = 8,25. Beide kommen zum selben Schluss.',
    figures: [
      { label: 'kleinste s', value: '2,53 h' },
      { label: 'größte s', value: '3,36 h' },
      { label: 'klassische ANOVA', value: 'F = 8,64' },
      { label: 'Welch-ANOVA', value: 'F = 8,25' },
    ],
  },
  heisst: {
    sym: 'σ²', say: 'Sigma Quadrat',
    fach: 'Homoskedastizität: Die Varianz der Modellfehler ist bei allen Werten der Prädiktoren gleich, Var(εᵢ gegeben X) = σ². Beim Gruppenvergleich heißt das: gleiche Varianz in allen Gruppen der Grundgesamtheit.',
  },
  bausteine: [
    {
      title: 'Die Streuung um die Gruppenmitte vergleichen',
      was: 'Gemeint ist, wie stark die Menschen um ihre eigene Gruppenmitte streuen. Ob die Gruppenmitten gleich sind, spielt dafür keine Rolle.',
      rechnung: 's je Abschluss: 3,07; 2,53; 3,32; 2,73 und 3,36 Stunden.',
      warum: 'Die klassische ANOVA rechnet mit einer gemeinsamen Streuung innerhalb aller Gruppen. Das passt nur, wenn die Gruppen ähnlich streuen.',
      acht: 'Gleiche Fehlervarianz heißt nicht gleiche Mittelwerte. Und es geht um die Streuung um die Gruppenmitte, nicht um die Rohwerte aller zusammen.',
      concept: 'group_variation',
    },
    {
      title: 'Erkennen, wann es ein Problem wird',
      was: 'Heikel wird es, wenn die Streuungen sehr verschieden sind und die Gruppen zugleich verschieden groß. Dann fallen p-Werte der klassischen Tests zu klein oder zu groß aus.',
      warum: 'Die gemeinsame Streuung wird dann vor allem von der großen Gruppe bestimmt. Für die kleine Gruppe passt sie nicht.',
      acht: 'In der Regression zeigt sich das als Trichter im Bild der Residuen: Die Fehler werden zu einer Seite hin breiter.',
      concept: 'residuals',
    },
    {
      title: 'Auf ein Verfahren ohne diese Annahme ausweichen',
      was: 'Der Welch-t-Test und die Welch-ANOVA brauchen keine gleichen Varianzen. mariposa rechnet beide standardmäßig mit.',
      rechnung: 'Klassisch: F = 8,64 mit 4 und 195 Freiheitsgraden. Welch: F = 8,25 mit 4 und 96,7 Freiheitsgraden.',
      warum: 'Welch rechnet mit der Streuung jeder Gruppe einzeln. Stimmen die Varianzen doch überein, verliert man dabei wenig.',
      acht: 'Ein Levene-Test mit großem p beweist keine gleichen Varianzen. Er ist kein Schalter, der zwischen Student und Welch entscheidet.',
      concept: 'levene_test',
    },
  ],
  ausprobieren: [
    {
      question: 'In einer Gruppe streuen die Antworten doppelt so stark wie in der anderen, beide Gruppen sind gleich groß. Ist der klassische t-Test dann unbrauchbar?',
      options: ['nein, bei gleich großen Gruppen ist er recht unempfindlich', 'ja, immer', 'das hängt vom Mittelwert ab'], correct: 0, step: 2,
      explain: 'Bei gleich großen Gruppen stimmen seine p-Werte trotzdem recht gut. Heikel wird es erst, wenn zusätzlich die Gruppengrößen stark verschieden sind.',
      kurz: 'Ungleiche Streuung schadet vor allem bei ungleich großen Gruppen.',
    },
    {
      question: 'Der Levene-Test meldet p = 0,53. Heißt das, die Varianzen sind gleich?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Ein großes p heißt nur, dass die Daten zu gleichen Varianzen passen. Bei kleinen Gruppen übersieht der Test auch deutliche Unterschiede.',
      kurz: 'Nicht auffällig ist nicht dasselbe wie gleich.',
    },
    {
      question: 'Was ist mit gleicher Fehlervarianz gemeint?',
      options: ['Die Streuung um die Gruppenmitte ist überall ähnlich', 'Alle Gruppen haben dieselbe Mitte', 'Alle Variablen haben dieselbe Varianz'], correct: 0, step: 1,
      explain: 'Es geht um die Abweichungen vom Modell, beim Gruppenvergleich also um die Streuung um die eigene Gruppenmitte.',
      kurz: 'Fehlervarianz ist die Streuung um das Modell.',
    },
  ],
  check: {
    question: 'Welcher Befund spricht gegen gleiche Fehlervarianz?',
    options: [
      'Die Gruppenmittel liegen weit auseinander.',
      'Im Bild der Residuen einer Regression werden die Fehler nach rechts immer breiter.',
      'Die Lernzeit hat eine größere Varianz als der Wissenstest.',
      'Der Levene-Test meldet p = 0,53.',
    ],
    correct: 1,
    right: 'Genau. Ein Trichter heißt: Die Fehler streuen nicht überall gleich stark.',
    diagnose: {
      0: 'Fast! Verschiedene Mittelwerte sind kein Problem für die Annahme. Es geht um die Streuung um die Mittelwerte.',
      2: 'Fast! Verschiedene Variablen dürfen verschieden streuen. Die Annahme betrifft die Fehler eines Modells.',
      3: 'Noch nicht ganz. Ein großes p spricht eher nicht dagegen, beweist gleiche Varianzen aber auch nicht.',
    },
  },
  fuerDich: 'Wenn du zwei oder mehr Gruppen vergleichst, schau dir zuerst die Standardabweichungen je Gruppe an. Mit t_test() und oneway_anova() bekommst du in mariposa die Welch-Fassung ohnehin mitgeliefert.',
  genau: {
    kurz: 'Gemeint sind die Fehler um die modellierten Mittelwerte. Ungleiche Varianzen stören vor allem Standardfehler, Tests und Intervalle, nicht die Mittelwerte selbst.',
    paragraphs: [
      'In der Regression lautet die Annahme Var(εᵢ gegeben X) = σ²: Die Fehler streuen bei allen Werten der Prädiktoren gleich stark. Beurteilt wird das an den Residuen, den geschätzten Fehlern, etwa im Bild der Residuen gegen die Vorhersagen.',
      'Ist der bedingte Mittelwert richtig modelliert, bleiben die geschätzten Mittelwerte und Koeffizienten auch bei ungleichen Varianzen unverzerrt. Unpassend werden die klassischen Standardfehler, Tests und Intervalle. Robuste Standardfehler helfen dagegen, reparieren aber keine falsche Modellform.',
      'mariposa rechnet im t-Test und in der einfaktoriellen ANOVA immer beide Fassungen. Bei t_test() wählt var.equal, welche Fassung die Kurzausgabe zeigt; Standard ist Welch.',
      'Eine verbreitete Faustregel: Ist die größte Standardabweichung höchstens doppelt so groß wie die kleinste und sind die Gruppen ähnlich groß, ändern ungleiche Varianzen die Ergebnisse der klassischen ANOVA wenig.',
    ],
  },
};

const LABEL = ['ohne Schulabschluss', 'Hauptschulabschluss', 'Mittlerer Abschluss', 'Fachhochschulreife', 'Abitur'];

export const varianceAssumptionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Streut die Lernzeit in den fünf Abschlussgruppen ähnlich stark?',
    value: sdRatio,
    result: c => {
      const g = groupsFor(c), a = anovaFor(c), ratio = sdRatio(c), lev = leveneFor(c);
      if (!a || a.F === null || ratio === null) return { kurz: 'In mindestens einer Gruppe streut die Lernzeit nicht. Dann lassen sich die Streuungen nicht vergleichen.', fachlich: 'Eine Gruppenvarianz ist 0; Welch-ANOVA und Levene-Test sind nicht definiert.' };
      const lo = g.reduce((p, q) => q.sd < p.sd ? q : p), hi = g.reduce((p, q) => q.sd > p.sd ? q : p);
      return {
        kurz: `Die Lernzeit streut je Abschluss zwischen ${num(lo.sd)} Stunden (${LABEL[lo.level]}) und ${num(hi.sd)} Stunden (${LABEL[hi.level]}). Die größte Standardabweichung ist ${num(ratio)}-mal so groß wie die kleinste.`,
        fachlich: `Klassische ANOVA F(${a.dfBetween}, ${a.dfWithin}) ≈ ${num(a.F)}; Welch-ANOVA ohne gleiche Varianzen F ≈ ${num(a.welch.F)} bei ${a.welch.df1} und ${dfText(a.welch.df2)} Freiheitsgraden. Brown–Forsythe-Test: F ≈ ${num(lev.F)}, ${pText(lev.p)}.`,
        zusatz: ratio <= 2 ? 'Nach der Faustregel, höchstens das Doppelte, ist das kein Grund zur Sorge.' : 'Nach der Faustregel, höchstens das Doppelte, lohnt sich hier der Blick auf die Welch-ANOVA.',
      };
    },
    voraussetzung: 'Verglichen werden die Streuungen innerhalb der Gruppen, nicht ihre Mittelwerte.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem Verhältnis der größten zur kleinsten Standardabweichung?', options: ['verdoppelt sich', 'bleibt gleich', 'vervierfacht sich'], correct: 1,
        explain: 'Jede Standardabweichung verdoppelt sich, die größte wie die kleinste. Ihr Verhältnis bleibt gleich.',
        kurz: 'Das Verhältnis der Streuungen hat keine Einheit.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Verhältnis der Streuungen?', options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Jede Gruppenmitte rückt mit. Die Abstände zur Gruppenmitte bleiben, also auch die Streuungen.',
        kurz: 'Verschieben ändert keine Streuung.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'oneway_anova', variant: 1,
    outputMap: [
      { match: '2.529', atlas: 'kleinste s', step: 1, explain: 'Std. Deviation beim Hauptschulabschluss: die kleinste Streuung der fünf Gruppen.' },
      { match: '3.360', atlas: 'größte s', step: 1, explain: 'Std. Deviation beim Abitur: die größte Streuung, 1,33-mal so groß wie die kleinste.' },
      { match: '8.639', atlas: 'F klassisch', step: 3, explain: 'Die klassische ANOVA mit einer gemeinsamen Streuung für alle Gruppen.' },
      { match: '8.254', atlas: 'F nach Welch', step: 3, explain: 'Die Welch-ANOVA unter Robust Tests rechnet mit der Streuung jeder Gruppe einzeln.' },
      { match: '96.702', atlas: 'Freiheitsgrade nach Welch', step: 3, explain: 'Welch passt die Freiheitsgrade im Nenner an die ungleichen Streuungen an: 96,7 statt 195.' },
    ],
    check: {
      question: 'Welche Zahl ist F der ANOVA, die keine gleichen Varianzen braucht? Tippe sie an.', correct: '8.254',
      wrong: { '8.639': 'Fast! Das ist F der klassischen ANOVA mit gemeinsamer Streuung.', '96.702': 'Fast! Das sind die Freiheitsgrade im Nenner der Welch-ANOVA. F steht davor.', '3.360': 'Fast! Das ist die größte Standardabweichung, beim Abitur.' },
    },
  },
  next: {
    next: { id: 'levene_test', why: 'Prüft, ob die Gruppen verschieden streuen, mit absoluten Abständen zur Gruppenmitte.' },
    before: [
      { id: 'population_variance', why: 'Die Varianz in der Grundgesamtheit, um die es in der Annahme geht.' },
      { id: 'group_variation', why: 'Die Streuung innerhalb der Gruppen, die die klassische ANOVA gemeinsam schätzt.' },
    ],
    after: [
      { id: 'residuals', why: 'Im Bild der Residuen zeigt sich ungleiche Fehlervarianz als Trichter.' },
      { id: 'linear_regression', why: 'Dort gilt dieselbe Annahme für die Vorhersagefehler.' },
    ],
    more: [
      { id: 't_test', why: 'Der Welch-t-Test braucht keine gleichen Varianzen.' },
      { id: 'prediction_interval', why: 'Die klassische Formel braucht eine gemeinsame Fehlervarianz.' },
    ],
  },
};
