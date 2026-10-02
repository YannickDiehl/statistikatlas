// Begriffskarte „Ausreißer & Einfluss“ (Bereich B13) mit Reitern. Beispiel: die Gerade Wissenstest aus Lernzeit;
// P175 (längste Lernzeit) und P008 (fast mittlere Lernzeit). Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { baseSurvey, sampleColumn } from '../../sample';
import { fitLine, type Pairs } from './fit';

/** Hebelwerte und Cooks Distanzen einer Geraden (p = 2 Koeffizienten). */
export function influence(d: Pairs) {
  const f = fitLine(d), n = f.n, mse = f.sse / (n - 2);
  const h = f.x.dev.map(dx => 1 / n + (f.sxx > 0 ? dx * dx / f.sxx : 0));
  const cook = f.e.map((e, i) => mse > 0 ? e * e / (2 * mse) * h[i] / (1 - h[i]) ** 2 : 0);
  return { fit: f, h, cook };
}
/** Die Gerade der 200 Befragten, wenn Person `who` den Wissenstest `y` hätte; mit ihrer Cooks Distanz. */
export function withScore(who: number, y: number) {
  const rows = baseSurvey(), xs = sampleColumn(rows, 'lernzeit'), ys = sampleColumn(rows, 'wissenstest').map((v, i) => i === who ? y : v);
  const inf = influence({ x: xs, y: ys });
  return { b1: inf.fit.b1!, b0: inf.fit.b0!, cook: inf.cook[who], h: inf.h[who], e: inf.fit.e[who] };
}
/** Index von P175 (längste Lernzeit) und P008 (Lernzeit nahe x̄) in den Ausgangsdaten. */
export const P175 = 174, P008 = 7;
const dText = (d: number) => d < 0.1 ? num(d, 3) : num(d);

export const ausreisser: ConceptCard = {
  concept: 'outliers_influence',
  picture: 'b13-einfluss',
  wofuer: 'Eine einzelne Person kann eine Regressionsgerade kippen, aber nicht jede. Entscheidend ist, wie ungewöhnlich ihre Lernzeit ist und wie weit sie neben der Geraden liegt. Was wäre, wenn die Person mit der längsten Lernzeit kaum eine Aufgabe gelöst hätte?',
  kurz: 'Ein Ausreißer liegt weit neben der Geraden. Einflussreich wird er erst, wenn er auch am Rand liegt: Dann ändert sich die Gerade deutlich, sobald man ihn weglässt.',
  stellDirVor: {
    text: `P175 hat mit 18,4 Stunden am längsten gelernt und 17 Aufgaben gelöst; sie passt gut zur Geraden. Hätte sie 0 Aufgaben gelöst, fiele die Steigung von 0,52 auf ${num(withScore(P175, 0).b1)} Aufgaben je Stunde. Löst dagegen P008 mit 7,8 Stunden, fast der mittleren Lernzeit, 0 statt 13 Aufgaben, bleibt die Steigung bei ${num(withScore(P008, 0).b1)}.`,
    figures: [
      { label: 'Steigung mit allen', value: '0,52' },
      { label: 'P175 mit 0 Aufgaben', value: num(withScore(P175, 0).b1) },
      { label: 'P008 mit 0 Aufgaben', value: num(withScore(P008, 0).b1) },
      { label: 'Faustregel 4 / n', value: num(4 / 200) },
    ],
  },
  heisst: {
    sym: 'Dᵢ', say: 'D i',
    fach: 'Cooks Distanz Dᵢ misst, wie stark sich alle Vorhersagen ändern, wenn Person i weggelassen wird. Sie wächst mit dem Residuum und mit dem Hebelwert hᵢ der Person.',
  },
  bausteine: [
    {
      title: 'Danebenliegen messen',
      was: 'Das Residuum sagt, wie weit eine Person über oder unter der Geraden liegt. Groß heißt: ungewöhnlicher Wissenstest für diese Lernzeit.',
      rechnung: 'Das größte Residuum hat P136: 6,5 Stunden, 17 Aufgaben, vorhergesagt 9,48, also +7,52.',
      warum: 'Nur wer neben der Geraden liegt, kann sie zu sich herziehen.',
      acht: 'Ein großes Residuum allein macht noch keinen Einfluss. P136 liegt bei der Lernzeit nahe der Mitte; ihre Cooks Distanz ist nur 0,024.',
      concept: 'residuals',
    },
    {
      title: 'Den Hebel messen',
      was: 'Wer eine sehr ungewöhnliche Lernzeit hat, sitzt am langen Ende des Hebels. Das misst der Hebelwert hᵢ.',
      rechnung: 'hᵢ = 1 / n + (xᵢ − x̄)² / Σ(xᵢ − x̄)². P175: 1 / 200 + (18,4 − 7,75)² / 2.085,82 ≈ 0,06, sechsmal so viel wie im Schnitt (2 / 200 = 0,01).',
      warum: 'Am Rand gibt es wenige andere Punkte, die die Gerade festhalten.',
      acht: 'Ein hoher Hebel allein ist harmlos, wenn die Person nahe an der Geraden liegt. So ist es bei P175 mit ihren 17 Aufgaben: Cooks Distanz 0,009.',
      concept: 'deviation',
    },
    {
      title: 'Mit und ohne vergleichen',
      was: 'Cooks Distanz fasst zusammen, wie stark sich die Vorhersagen ändern, wenn eine Person fehlt.',
      rechnung: 'Am größten ist sie bei P021, die 1,6 Stunden gelernt und keine Aufgabe gelöst hat: Dᵢ ≈ 0,084. Ohne P021 läge die Steigung bei 0,5 statt 0,52.',
      warum: 'So siehst du, ob ein Ergebnis an einer einzelnen Person hängt.',
      acht: 'Eine Faustregel nennt Dᵢ > 4 / n auffällig, hier 0,02; das trifft auf 9 Befragte zu. Auffällige Personen prüfst du genau; löschen darfst du sie nicht ohne guten Grund.',
      concept: 'linear_regression',
    },
  ],
  regler: {
    label: 'Wie viele Aufgaben löst P175 mit 18,4 Stunden?', min: 0, max: 20, step: 1, initial: 17,
    format: v => `${num(v)} Aufgaben`,
    describe: v => {
      const w = withScore(P175, v);
      return `Dann steigt die Gerade um ${num(w.b1)} Aufgaben je Stunde, mit ihren echten 17 Aufgaben sind es 0,52. Cooks Distanz von P175: ${dText(w.cook)}, ${w.cook > 0.02 ? 'über' : 'unter'} der Faustregel 4 / n = 0,02.`;
    },
  },
  ausprobieren: [
    {
      question: 'Setz P175 auf 0 Aufgaben. Was passiert mit der Steigung?', options: ['wird steiler', 'wird deutlich flacher', 'bleibt gleich'], correct: 1, step: 3,
      explain: `Sie fällt von 0,52 auf ${num(withScore(P175, 0).b1)} Aufgaben je Stunde. Großer Hebel und großes Residuum zusammen: Cooks Distanz steigt auf ${dText(withScore(P175, 0).cook)}.`,
      kurz: 'Am Rand und weit daneben heißt: großer Einfluss.',
    },
    {
      question: 'P008 mit fast mittlerer Lernzeit löst 0 statt 13 Aufgaben. Ändert sich die Steigung stark?', options: ['ja, stark', 'kaum'], correct: 1, step: 2,
      explain: `Die Steigung bleibt bei ${num(withScore(P008, 0).b1)}; die Gerade rutscht nur ein wenig nach unten. In der Mitte hat eine Person keinen Hebel.`,
      kurz: 'Weit daneben, aber in der Mitte: wenig Einfluss auf die Steigung.',
    },
    {
      question: 'P175 liegt mit ihren 17 Aufgaben nahe an der Geraden. Ist sie einflussreich?', options: ['ja, wegen ihres Hebels', 'nein, ohne großes Residuum kaum'], correct: 1, step: 2,
      explain: `Ihr Hebel ist groß, ihr Residuum mit ${num(withScore(P175, 17).e)} klein. Cooks Distanz ist nur ${dText(withScore(P175, 17).cook)}.`,
      kurz: 'Hebel ohne Residuum bewegt nichts.',
    },
  ],
  check: {
    question: 'Welche Person kann eine Regressionsgerade am stärksten verändern?',
    options: [
      'eine Person mit mittlerer Lernzeit und sehr wenigen gelösten Aufgaben',
      'eine Person mit sehr langer Lernzeit, die genau auf der Geraden liegt',
      'eine Person mit sehr langer Lernzeit und sehr wenigen gelösten Aufgaben',
      'jede Person gleich stark',
    ],
    correct: 2,
    right: 'Genau. Großer Hebel und großes Residuum zusammen ergeben großen Einfluss.',
    diagnose: {
      0: 'Fast! Großes Residuum, aber kein Hebel: Sie verschiebt die Gerade nur ein wenig nach unten.',
      1: 'Fast! Großer Hebel, aber kein Residuum: Ohne sie läge die Gerade fast genauso.',
      3: 'Noch nicht ganz. Der Einfluss hängt vom Residuum und vom Hebel ab.',
    },
  },
  fuerDich: 'Wenn ein Ergebnis an zwei, drei Personen hängt, ist Vorsicht angebracht. Gute Studien zeigen ihre Ergebnisse mit und ohne auffällige Fälle.',
  genau: {
    kurz: 'Cooks Distanz verbindet Residuum und Hebel. Grenzwerte dafür sind Faustregeln.',
    paragraphs: [
      'Für eine Gerade gilt Dᵢ = eᵢ² / (p · MSE) · hᵢ / (1 − hᵢ)², mit p = 2 Koeffizienten und MSE = Σeᵢ² / (n − 2).',
      'Große Residuen betreffen ungewöhnliche Zielwerte, hohe Hebelwerte ungewöhnliche Werte der Prädiktoren. Mit mehreren Prädiktoren kann auch eine ungewöhnliche Kombination einen hohen Hebel haben.',
      'Auffällige Fälle prüfst du auf Erfassungsfehler und inhaltliche Besonderheiten. Gültige Beobachtungen löschst du nicht nur wegen eines Schwellenwerts; berichte die Ergebnisse mit und ohne sie.',
      'Faustregeln wie 4 / n sind grobe Orientierung. Verfahren mit Rängen, etwa die Spearman-Korrelation, sind weniger empfindlich gegen einzelne Werte.',
    ],
  },
};

/** Einfluss aller Befragten für die aktuellen Daten (Gerade y aus x). */
export function influenceFor(c: SampleCtx) {
  const xId = c.columns.x?.[0] ?? 'lernzeit', yId = c.columns.y?.[0] ?? 'wissenstest';
  const xs = sampleColumn(c.rows, xId), ys = sampleColumn(c.rows, yId), inf = influence({ x: xs, y: ys });
  const top = inf.cook.indexOf(Math.max(...inf.cook)), lever = inf.h.indexOf(Math.max(...inf.h));
  const without = fitLine({ x: xs.filter((_, i) => i !== top), y: ys.filter((_, i) => i !== top) });
  return { ...inf, xs, ys, top, lever, without: without.b1, over: inf.cook.filter(d => d > 4 / xs.length).length, ids: c.rows.map(r => r.id) };
}

export const ausreisserTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: An welcher Person hängt die Gerade am stärksten?',
    value: c => fitLine({ x: sampleColumn(c.rows, c.columns.x?.[0] ?? 'lernzeit'), y: sampleColumn(c.rows, c.columns.y?.[0] ?? 'wissenstest') }).b1,
    result: c => {
      const r = influenceFor(c);
      if (r.fit.b1 === null || r.without === null) return { kurz: 'Die Lernzeit streut nicht. Dann gibt es keine Gerade.', fachlich: 'Die Quadratsumme von x ist 0.' };
      return {
        kurz: `Am stärksten hängt die Gerade an ${r.ids[r.top]} mit ${num(r.xs[r.top])} Stunden und ${num(r.ys[r.top])} Aufgaben. Ohne diese Person läge die Steigung bei ${num(r.without)} statt ${num(r.fit.b1)} Aufgaben je Stunde.`,
        fachlich: `Größte Cooks Distanz: ${r.ids[r.top]} mit Dᵢ ≈ ${dText(r.cook[r.top])}. Nach der Faustregel 4 / n = ${num(4 / r.xs.length)} sind ${r.over} von ${r.xs.length} Befragten auffällig.`,
        zusatz: `Den größten Hebel hat ${r.ids[r.lever]} mit ${num(r.xs[r.lever])} Stunden Lernzeit: hᵢ ≈ ${dText(r.h[r.lever])}.`,
      };
    },
    voraussetzung: 'Cooks Distanz gehört zur Geraden des Wissenstests aus der Lernzeit. Auffällig heißt: genauer hinsehen, nicht löschen.',
    think: [
      {
        question: 'Die gewählte Person lernt plötzlich 40 Stunden, ihr Wissenstest bleibt. Was macht die Steigung?', options: ['wird steiler', 'wird deutlich flacher', 'bleibt fast gleich'], correct: 1,
        explain: 'Bei 40 Stunden sagt die Gerade mehr als 20 Aufgaben voraus; so viele gibt es nicht. Die Person liegt weit darunter und hat einen riesigen Hebel.',
        kurz: 'Ein Punkt weit am Rand kann die Gerade allein kippen.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'weaker', atLeast: 0.09 },
      },
      {
        question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was macht die Steigung?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Jedes Residuum dreht sein Vorzeichen, die Hebel bleiben. Die Gerade fällt jetzt genauso stark, wie sie vorher stieg.',
        kurz: 'Umpolen dreht die Richtung, nicht den Einfluss.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  next: {
    next: { id: 'spearman', why: 'Rechnet mit Rängen und reagiert deshalb weniger stark auf einzelne Werte.' },
    before: [
      { id: 'residuals', why: 'Wie weit eine Person neben der Geraden liegt.' },
      { id: 'linear_regression', why: 'Die Gerade, deren Einfluss hier geprüft wird.' },
      { id: 'deviation', why: 'Der Hebel wächst mit dem Abstand der Lernzeit zur Mitte.' },
    ],
    after: [{ id: 'variance_assumption', why: 'Residuenbilder zeigen auch, ob die Fehler überall gleich stark streuen.' }],
    more: [
      { id: 'pearson', why: 'Auch r reagiert empfindlich auf einzelne Punkte am Rand.' },
      { id: 'median', why: 'Der mittlere Wert der Reihe nach bleibt bei Ausreißern fast stehen.' },
    ],
  },
};
