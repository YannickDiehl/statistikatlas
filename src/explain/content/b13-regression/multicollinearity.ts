// Begriffskarte „Multikollinearität“ (Bereich B13) mit Reitern. Beispiele aus den Katalogaufrufen: Lernzeit und Alter
// (VIF 1.001) und das Produkt im Modell mit Interaktion (VIF 7.405). Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { fixed, num } from '../../format';
import { sampleColumn, sampleColumnInfo } from '../../sample';
import { relate } from '../../math';
import { LINEAR_REGRESSION_TOKEN, MODELL } from './gerade-tabs';
import { STAR_TOKEN } from './interaction';

/** VIF eines von zwei Prädiktoren mit der Korrelation r: 1 / (1 − r²). */
export const vifOf = (r: number) => 1 / (1 - r * r);
/** VIF der beiden Spalten x und y für die aktuellen Daten. */
export function vifFor(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'lernzeit', y = c.columns.y?.[0] ?? 'alter';
  const r = relate(sampleColumn(c.rows, x), sampleColumn(c.rows, y)).r;
  return r === null ? null : { x, y, r, vif: vifOf(r) };
}

export const multikollinearitaet: ConceptCard = {
  concept: 'multicollinearity',
  picture: 'b13-vif',
  wofuer: 'Lernzeit und Alter haben bei den 200 Befragten fast nichts miteinander zu tun. Im Modell für den Wissenstest lassen sich ihre Beiträge deshalb sauber trennen. Was aber, wenn zwei Prädiktoren fast dasselbe messen?',
  kurz: 'Multikollinearität heißt: Prädiktoren hängen so eng zusammen, dass sich ihre Beiträge kaum trennen lassen. Die Koeffizienten werden dann unsicher, die Vorhersagen nicht unbedingt.',
  stellDirVor: {
    text: 'Lernzeit und Alter korrelieren mit r = 0,03. R meldet für beide einen VIF von etwa 1,00: kein Problem. Im Modell mit Interaktion steckt dagegen das Produkt aus Lernzeit und Weiterbildung. Es lässt sich zu 86 % aus den beiden anderen Prädiktoren vorhersagen, und R meldet dafür einen VIF von 7,4.',
    figures: [
      { label: 'r von Lernzeit und Alter', value: '0,03' },
      { label: 'VIF der Lernzeit in R', value: '1,00' },
      { label: 'R² des Produkts aus den anderen', value: '0,86' },
      { label: 'VIF des Produkts in R', value: '7,4' },
    ],
  },
  heisst: {
    sym: 'VIFⱼ = 1 / (1 − Rⱼ²)', say: 'V I F j gleich eins durch eins minus R j Quadrat',
    fach: 'Der Varianzinflationsfaktor VIFⱼ gibt an, um welchen Faktor die Varianz des Koeffizienten bⱼ größer ist, weil sich Prädiktor j aus den übrigen Prädiktoren vorhersagen lässt. Rⱼ² ist das R² dieser Vorhersage; 1 − Rⱼ² heißt Toleranz.',
  },
  bausteine: [
    {
      title: 'Einen Prädiktor aus den anderen vorhersagen',
      was: 'Wir rechnen eine Regression mit dem Prädiktor als Zielgröße. Ihr R² sagt, wie viel von ihm schon in den anderen Prädiktoren steckt.',
      rechnung: 'Lernzeit aus dem Alter: R² = 0,03 · 0,03 ≈ 0,001. Das Produkt aus Lernzeit und Weiterbildung aus beiden: R² ≈ 0,86.',
      warum: 'Was schon in den anderen Prädiktoren steckt, kann das Modell diesem Prädiktor nicht eindeutig zuschreiben.',
      acht: 'Paarweise Korrelationen reichen nicht immer. Ein Prädiktor kann aus mehreren anderen zusammen gut vorhersagbar sein.',
      concept: 'explained_variance',
    },
    {
      title: 'Den Faktor ausrechnen',
      was: 'Eins geteilt durch den Rest, der sich nicht vorhersagen lässt: Das ist der VIF.',
      rechnung: '1 / (1 − 0,001) ≈ 1 für die Lernzeit, 1 / (1 − 0,86) ≈ 7,1 für das Produkt; mit allen Nachkommastellen 7,4. Der Standardfehler des Produkts ist damit √7,4 ≈ 2,7-mal so groß wie ohne diesen Zusammenhang.',
      warum: 'Der VIF sagt, um welchen Faktor die Varianz eines Koeffizienten wächst. Für den Standardfehler gilt seine Wurzel.',
      acht: 'R meldet auch die Toleranz, 1 − Rⱼ². Kleine Toleranz und großer VIF sagen dasselbe.',
      concept: 'se',
    },
    {
      title: 'Die Folgen einordnen',
      was: 'Bei hohem VIF schwanken die Koeffizienten von Stichprobe zu Stichprobe stark, und ihre Konfidenzintervalle werden breit.',
      warum: 'Das Modell weiß, dass die Prädiktoren zusammen viel erfassen, aber nicht, welcher wie viel.',
      acht: 'Eine Faustregel nennt einen VIF über 10 problematisch; R druckt sie unter die Tabelle. Bei Produkttermen ist ein hoher VIF üblich und kein Fehler.',
      concept: 'confidence',
    },
  ],
  regler: {
    label: 'Wie eng hängen zwei Prädiktoren zusammen? Korrelation r', min: 0, max: 0.99, step: 0.01, initial: 0.03,
    format: v => `r = ${num(v)}`,
    describe: v => {
      const vif = vifOf(v);
      return `Bei r = ${num(v)} ist der VIF ${num(vif)}. Der Standardfehler jedes der beiden Koeffizienten ist dann ${num(Math.sqrt(vif))}-mal so groß wie bei unkorrelierten Prädiktoren${vif > 10 ? '; nach der Faustregel ist das problematisch' : ''}.`;
    },
  },
  ausprobieren: [
    {
      question: 'Zwei Prädiktoren korrelieren mit r = 0,9. Wie groß ist der VIF?', options: ['etwa 1,9', 'etwa 5,3', 'etwa 10'], correct: 1, step: 2,
      explain: '0,9 · 0,9 = 0,81, und 1 / (1 − 0,81) = 1 / 0,19 ≈ 5,3. Der Standardfehler ist dann etwa 2,3-mal so groß.',
      kurz: 'Erst bei sehr hohen Korrelationen wird der VIF groß.',
    },
    {
      question: 'Hohe Multikollinearität: Sagt das Modell deshalb schlechter vorher?', options: ['ja, deutlich', 'nicht unbedingt'], correct: 1, step: 3,
      explain: 'Multikollinearität drückt R² nicht. Unsicher ist nur, wie sich das Erfasste auf die einzelnen Koeffizienten verteilt.',
      kurz: 'Unsichere Koeffizienten heißen nicht schlechte Vorhersagen.',
    },
    {
      question: 'Alle paarweisen Korrelationen sind klein. Ist Multikollinearität dann ausgeschlossen?', options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Ein Prädiktor kann aus mehreren anderen zusammen gut vorhersagbar sein, obwohl er mit jedem einzelnen nur schwach korreliert. Deshalb rechnet der VIF mit allen übrigen Prädiktoren.',
      kurz: 'Der VIF schaut auf alle anderen Prädiktoren zugleich.',
    },
  ],
  check: {
    question: 'R meldet für einen Prädiktor die Toleranz 0,2. Wie groß ist sein VIF?',
    options: ['0,2', '0,8', '5', '1,25'], correct: 2,
    right: 'Genau. VIF = 1 / Toleranz = 1 / 0,2 = 5.',
    diagnose: {
      0: 'Fast! Das ist die Toleranz selbst, 1 − Rⱼ². Der VIF ist ihr Kehrwert.',
      1: 'Fast! 0,8 ist Rⱼ², also 1 − 0,2. Der VIF ist 1 / 0,2.',
      3: 'Fast! 1,25 wäre 1 / 0,8. Im Nenner steht die Toleranz 0,2.',
    },
  },
  fuerDich: 'Stehen in einer Studie zwei ähnliche Variablen im selben Modell, etwa Einkommen und Vermögen, und hat keine davon einen kleinen p-Wert, kann Multikollinearität dahinterstecken. Zusammen können sie trotzdem viel erfassen.',
  genau: {
    kurz: 'Ein hoher VIF zeigt schwer trennbare Beiträge. Er beweist weder einen falschen Prädiktor noch eine Ursache.',
    paragraphs: [
      'Bei perfekter linearer Abhängigkeit, etwa wenn eine Spalte die Summe zweier anderer ist, lassen sich die Koeffizienten gar nicht mehr eindeutig schätzen.',
      'Die Formel gilt für einen einzelnen metrischen Prädiktor. Für Faktoren mit mehreren Dummys braucht es ein gemeinsames Maß.',
      'Bei Produkttermen hilft Zentrieren: Mit zentrierter Lernzeit sinkt der VIF des Produkts von 7,4 auf 1,7, der der Weiterbildung von 6,8 auf 1. Die Vorhersagen bleiben dieselben.',
      'Für Vorhersagen innerhalb des beobachteten Bereichs kann ein Modell mit hohen VIF-Werten trotzdem gut sein.',
    ],
  },
};

export const multikollinearitaetTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'alter' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Lassen sich Lernzeit und Alter als Prädiktoren sauber trennen?',
    value: c => vifFor(c)?.vif ?? null,
    result: c => {
      const v = vifFor(c);
      if (!v) return { kurz: 'Eine der beiden Spalten streut nicht. Dann gibt es keinen VIF.', fachlich: 'Eine Standardabweichung ist 0.' };
      const tx = `„${sampleColumnInfo(v.x).title}“`, ty = `„${sampleColumnInfo(v.y).title}“`;
      return {
        kurz: `${tx} und ${ty} korrelieren mit r = ${num(v.r)}. Beide bekommen den VIF ${fixed(v.vif)}: Ihre Beiträge lassen sich ${v.vif < 2 ? 'sauber' : v.vif < 5 ? 'noch gut' : 'nur schwer'} trennen.`,
        fachlich: `R² der einen Spalte aus der anderen ist r² ≈ ${num(v.r * v.r, 4)}, also VIF = 1 / (1 − r²) ≈ ${fixed(v.vif)}. Die Standardfehler wachsen um den Faktor √VIF ≈ ${fixed(Math.sqrt(v.vif))}.`,
      };
    },
    voraussetzung: 'Mit zwei Prädiktoren hängt der VIF nur von ihrer Korrelation ab. Mit mehr Prädiktoren zählen alle übrigen zugleich.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was macht der VIF?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1,
        explain: 'Die Korrelation hängt nicht von der Einheit ab. Mit r bleibt auch der VIF gleich.',
        kurz: 'Andere Einheit, gleicher Zusammenhang, gleicher VIF.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Das Alter wird umgepolt: Aus jung wird alt und umgekehrt. Was macht der VIF?', options: ['wird negativ', 'bleibt gleich', 'wird 0'], correct: 1,
        explain: 'r wechselt sein Vorzeichen, r² bleibt gleich. Der VIF rechnet mit r², also bleibt er gleich.',
        kurz: 'Für den VIF zählt nur, wie eng der Zusammenhang ist, nicht seine Richtung.',
        tryIt: { label: 'Alter umpolen (18 plus 90 minus Alter)', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 1,
    tokens: { linear_regression: LINEAR_REGRESSION_TOKEN, modell: MODELL, '*': STAR_TOKEN },
    outputMap: [
      { match: '7.405', atlas: 'VIF des Produkts', step: 2, explain: 'Das Produkt lässt sich zu 86 % aus Lernzeit und Weiterbildung vorhersagen: 1 / (1 − 0,865) ≈ 7,4.' },
      { match: '0.135', atlas: 'Toleranz des Produkts', step: 2, explain: 'Tolerance ist 1 − Rⱼ². Ihr Kehrwert ist der VIF: 1 / 0,135 ≈ 7,4.' },
      { match: '6.774', atlas: 'VIF der Weiterbildung', explain: 'Auch die Weiterbildung hängt eng mit dem Produkt zusammen, denn ohne Weiterbildung ist das Produkt immer 0.' },
      { match: '1.675', atlas: 'VIF der Lernzeit', explain: 'Die Lernzeit hängt nur mäßig mit den anderen beiden zusammen.' },
    ],
    check: {
      question: 'Welche Zahl ist der VIF des Produkts lernzeit:weiterbildung? Tippe sie an.', correct: '7.405',
      wrong: {
        '0.135': 'Fast! Das ist die Toleranz. Der VIF ist ihr Kehrwert und steht daneben.',
        '1.675': 'Fast! Das ist der VIF der Lernzeit. Gefragt ist die Zeile lernzeit:weiterbildung.',
        '0.090': 'Fast! Das ist der Koeffizient B des Produkts. Der VIF steht unten unter Collinearity Statistics.',
      },
    },
  },
  next: {
    next: { id: 'centering', why: 'Zentrierte Prädiktoren senken den VIF von Produkttermen, ohne die Vorhersagen zu ändern.' },
    before: [
      { id: 'explained_variance', why: 'Rⱼ², das R² eines Prädiktors aus den übrigen.' },
      { id: 'prediction', why: 'Mehrere Prädiktoren teilen sich die Vorhersage.' },
      { id: 'pearson', why: 'Bei zwei Prädiktoren ist Rⱼ² genau r².' },
    ],
    after: [{ id: 'se', why: 'Der VIF vergrößert die Standardfehler der Koeffizienten.' }],
    more: [
      { id: 'interaction', why: 'Produktterme unzentrierter Prädiktoren haben oft einen hohen VIF.' },
      { id: 'correlation_matrix', why: 'Zeigt alle paarweisen Zusammenhänge der Prädiktoren auf einen Blick.' },
    ],
  },
};
