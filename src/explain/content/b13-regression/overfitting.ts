// Begriffskarte „Überanpassung“ (Bereich B13) mit Reitern. Modelle für den Wissenstest, geschätzt mit P001 bis P100
// (Training) und geprüft an P101 bis P200 (Test), mit 1 bis 20 Prädiktoren. Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import type { SurveyRow } from '../../../domain/survey';
import { num } from '../../format';
import { baseSurvey, sampleColumn, sampleColumnInfo } from '../../sample';
import { ols } from './fit';
import { LINEAR_REGRESSION_TOKEN, MODELL } from './gerade-tabs';

/** Prädiktoren in fester Reihenfolge: zuerst die Lernzeit, dann Spalten ohne engen Bezug zum Wissenstest (keine Kategorien ohne Rangfolge). */
export const ORDER = ['lernzeit', 'alter', 'schlafdauer', 'einkommen', 'haushaltsgroesse', 'arbeitsstunden', 'lernplanung5', 'lernzuversicht7', 'statistikinteresse10', 'finanzlage',
  'methoden1', 'methoden2', 'methoden3', 'methoden4', 'methoden5', 'schulabschluss', 'erwerbstaetig', 'weiterbildung', 'kurs_vor', 'kurs_nach'] as const;
export const MAX_K = ORDER.length;

/** R² im Training (P001 bis P100) und im Test (P101 bis P200, gemessen am Mittelwert der Testpersonen) mit den ersten k Prädiktoren. */
export function trainTest(rows: readonly SurveyRow[], k: number, x = 'lernzeit', y = 'wissenstest') {
  const names = [x, ...ORDER.filter(c => c !== x)].slice(0, k);
  const cols = names.map(c => sampleColumn(rows, c)), ys = sampleColumn(rows, y);
  const train = (v: number[]) => v.slice(0, 100), test = (v: number[]) => v.slice(100);
  const m = ols(cols.map(train), train(ys));
  if (!m) return null;
  const yt = test(ys), mt = yt.reduce((a, b) => a + b, 0) / yt.length;
  const pred = yt.map((_, i) => m.b[0] + cols.reduce((s, c, j) => s + m.b[j + 1] * c[100 + i], 0));
  const sse = yt.reduce((s, v, i) => s + (v - pred[i]) ** 2, 0), sst = yt.reduce((s, v) => s + (v - mt) ** 2, 0);
  return { train: m.r2, test: 1 - sse / sst, last: names[names.length - 1] };
}

let table: { train: number; test: number; last: string }[] | null = null;
/** Training und Test für 1 bis 20 Prädiktoren in den Ausgangsdaten (einmal gerechnet). */
export const baseTable = () => table ??= Array.from({ length: MAX_K }, (_, i) => trainTest(baseSurvey(), i + 1)!);
const pct = (v: number) => `${num(v * 100, 0)} %`;
const kOf = (v: number) => Math.max(1, Math.min(MAX_K, Math.round(v)));
const predictors = (k: number) => `${k} ${k === 1 ? 'Prädiktor' : 'Prädiktoren'}`;

export const ueberanpassung: ConceptCard = {
  concept: 'overfitting',
  picture: 'b13-ueberanpassung',
  wofuer: 'Wer den Wissenstest vorhersagen will, kann immer mehr Spalten ins Modell nehmen: Alter, Schlafdauer, Einkommen und so weiter. Auf den Daten, mit denen das Modell geschätzt wird, passt es dann jedes Mal besser. Aber sagt es auch neue Personen besser vorher?',
  kurz: 'Überanpassung heißt: Ein Modell lernt Zufälligkeiten seiner Daten mit. Auf diesen Daten passt es dann immer besser, bei neuen Personen wird es schlechter.',
  stellDirVor: {
    text: `Wir schätzen Modelle mit den ersten 100 Befragten und prüfen sie an den anderen 100. Mit der Lernzeit allein erfasst das Modell bei den ersten 100 ${pct(baseTable()[0].train)} der Streuung, bei den neuen 100 ${pct(baseTable()[0].test)}. Mit 20 Prädiktoren sind es bei den ersten 100 ${pct(baseTable()[19].train)}, bei den neuen nur noch ${pct(baseTable()[19].test)}.`,
    figures: [
      { label: 'Training, 1 Prädiktor', value: `R² ${num(baseTable()[0].train)}` },
      { label: 'Test, 1 Prädiktor', value: `R² ${num(baseTable()[0].test)}` },
      { label: 'Training, 20 Prädiktoren', value: `R² ${num(baseTable()[19].train)}` },
      { label: 'Test, 20 Prädiktoren', value: `R² ${num(baseTable()[19].test)}` },
    ],
  },
  heisst: {
    sym: 'MSEₜₑₛₜ', say: 'M S E Test',
    fach: 'Überanpassung liegt vor, wenn ein Modell seine Trainingsdaten besser beschreibt, als es neue Fälle vorhersagt. Gemessen wird das am Fehler bei zurückgehaltenen Daten, etwa am mittleren quadrierten Fehler MSEₜₑₛₜ.',
  },
  bausteine: [
    {
      title: 'Die Daten teilen',
      was: 'Wir schätzen das Modell nur mit einem Teil der Personen, dem Training. Die übrigen halten wir zurück, als wären sie neu.',
      rechnung: 'Training: P001 bis P100. Test: P101 bis P200.',
      warum: 'Nur an Personen, die das Modell nicht kennt, sieht man, wie gut es vorhersagt.',
      acht: 'Alles, was das Modell auswählt oder anpasst, auch welche Spalten hineinkommen, muss ohne den Testteil geschehen. Sonst ist der Test nicht mehr neu.',
      concept: 'sampling',
    },
    {
      title: 'Prädiktoren dazunehmen',
      was: 'Mit jedem weiteren Prädiktor passt sich das Modell den Trainingsdaten enger an. R² im Training steigt bei jedem Schritt.',
      rechnung: `Training: R² ${num(baseTable()[0].train)} mit 1 Prädiktor, ${num(baseTable()[5].train)} mit 6, ${num(baseTable()[19].train)} mit 20.`,
      warum: 'Jeder Prädiktor kann ein Stück Zufall in den Trainingsdaten erfassen, auch wenn er mit dem Wissenstest nichts zu tun hat.',
      acht: 'Ein höheres R² im Training heißt nicht, dass das Modell besser vorhersagt.',
      concept: 'explained_variance',
    },
    {
      title: 'Am Testteil prüfen',
      was: `Bei den zurückgehaltenen Personen sinkt R² mit vielen Prädiktoren, von ${num(baseTable()[0].test)} auf ${num(baseTable()[19].test)}.`,
      rechnung: `Test: R² ${num(baseTable()[0].test)} mit 1 Prädiktor, ${num(baseTable()[5].test)} mit 6, ${num(baseTable()[19].test)} mit 20.`,
      warum: 'Was das Modell an Zufall gelernt hat, kehrt bei neuen Personen nicht wieder. Dort stört es nur.',
      acht: 'Auch der Testfehler schwankt: Mit anderen 100 Testpersonen sähen die Zahlen etwas anders aus. Kreuzvalidierung wiederholt die Teilung deshalb mehrmals.',
      concept: 'prediction',
    },
  ],
  regler: {
    label: 'Wie viele Prädiktoren nimmt das Modell auf?', min: 1, max: MAX_K, step: 1, initial: 1,
    format: v => predictors(kOf(v)),
    describe: v => {
      const k = kOf(v), t = baseTable()[k - 1];
      const gap = t.train - t.test > 0.1 ? 'Die Lücke zwischen beiden zeigt Überanpassung.' : 'Training und Test liegen noch nah beieinander.';
      return `Mit ${predictors(k)} erfasst das Modell bei den 100 Trainingspersonen ${pct(t.train)} der Streuung, bei den 100 Testpersonen ${pct(t.test)}. ${gap} Zuletzt dazugekommen: „${sampleColumnInfo(t.last).title}“.`;
    },
  },
  ausprobieren: [
    {
      question: 'Schieb den Regler auf 20. Was passiert mit R² bei den Trainingspersonen?', options: ['steigt', 'sinkt', 'bleibt gleich'], correct: 0, step: 2,
      explain: `Es steigt von ${num(baseTable()[0].train)} auf ${num(baseTable()[19].train)}. Mit mehr Prädiktoren liegt das Modell auf seinen eigenen Daten nie weiter daneben.`,
      kurz: 'Auf den eigenen Daten hilft jeder Prädiktor ein wenig.',
    },
    {
      question: 'Und bei den 100 Testpersonen?', options: ['steigt auch', 'sinkt', 'bleibt gleich'], correct: 1, step: 3,
      explain: `Es sinkt von ${num(baseTable()[0].test)} auf ${num(baseTable()[19].test)}. Die zusätzlichen Prädiktoren haben vor allem Zufall der ersten 100 gelernt.`,
      kurz: 'Bei neuen Personen schadet gelernter Zufall.',
    },
    {
      question: 'Mit 1.000 statt 100 Trainingspersonen: Wäre die Überanpassung bei 20 Prädiktoren größer oder kleiner?', options: ['größer', 'kleiner'], correct: 1, step: 2,
      explain: 'Je mehr Personen auf einen Prädiktor kommen, desto weniger Zufall kann das Modell mitlernen. Mit 50 Personen je Prädiktor statt 5 wäre die Lücke viel kleiner.',
      kurz: 'Viele Personen je Prädiktor schützen vor Überanpassung.',
    },
  ],
  check: {
    question: 'Modell A hat im Training R² = 0,45, im Test 0,10. Modell B hat im Training 0,30, im Test 0,28. Welches sagt neue Personen besser vorher?',
    options: ['Modell A, weil sein Training-R² höher ist', 'Modell B, weil es im Test besser ist', 'beide gleich gut', 'das lässt sich nicht sagen'],
    correct: 1,
    right: 'Genau. Für neue Personen zählt der Test. A hat Zufälligkeiten seiner Trainingsdaten mitgelernt.',
    diagnose: {
      0: 'Fast! Das Training-R² zeigt nur, wie gut A seine eigenen Daten beschreibt. Für neue Personen zählt der Test.',
      2: 'Noch nicht ganz. Im Test liegt B klar vorn, 0,28 gegen 0,10.',
      3: 'Fast! Genau dafür gibt es den Testteil: Er zeigt, wie gut die Modelle neue Personen vorhersagen.',
    },
  },
  fuerDich: 'Wenn eine Studie ein Modell mit sehr vielen Variablen und hohem R² zeigt, frag: Wurde es an neuen Daten geprüft? Ein Modell, das alles erfasst, sagt oft wenig vorher.',
  genau: {
    kurz: 'Bewertet wird an Daten, die bei der Modellwahl keine Rolle gespielt haben. Auch der Testfehler ist eine Schätzung mit Unsicherheit.',
    paragraphs: [
      'R² im Test ist hier 1 − Σ(yᵢ − ŷᵢ)² / Σ(yᵢ − ȳ)² über die 100 Testpersonen, mit ihrem eigenen Mittelwert ȳ. Es kann negativ werden, wenn das Modell schlechter vorhersagt als dieser Mittelwert.',
      'Kreuzvalidierung teilt die Daten mehrmals anders auf und mittelt die Testfehler. So hängt das Ergebnis weniger an einer einzigen Teilung.',
      'Messungen derselben Person gehören zusammen in Training oder Test. Bei Vorhersagen über die Zeit muss der Test nach dem Training liegen.',
      'Die Reihenfolge der Prädiktoren ist hier fest: zuerst die Lernzeit, dann Spalten, die mit dem Wissenstest kaum zusammenhängen. Kategorien ohne Rangfolge sind nicht dabei.',
      'Das korrigierte R² und Kriterien wie AIC ziehen für jeden Prädiktor etwas ab. Sie ersetzen die Prüfung an neuen Daten aber nicht.',
    ],
  },
};

export const ueberanpassungTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Prüfung mit den aktuellen Daten: Training mit P001 bis P100, Test mit P101 bis P200.',
    value: c => trainTest(c.rows, 1, c.columns.x?.[0], c.columns.y?.[0])?.test ?? null,
    result: c => {
      const one = trainTest(c.rows, 1, c.columns.x?.[0], c.columns.y?.[0]), all = trainTest(c.rows, MAX_K, c.columns.x?.[0], c.columns.y?.[0]);
      if (!one || !all) return { kurz: 'Mit diesen Daten lässt sich das Modell nicht schätzen.', fachlich: 'Die Prädiktoren hängen im Training vollständig voneinander ab.' };
      return {
        kurz: `Mit der Lernzeit allein: R² ${num(one.train)} im Training und ${num(one.test)} im Test. Mit 20 Prädiktoren: ${num(all.train)} im Training, aber nur ${num(all.test)} im Test.`,
        fachlich: `Die 19 zusätzlichen Prädiktoren erhöhen R² im Training um ${num(all.train - one.train)} und verändern es im Test um ${num(all.test - one.test)}. Der Unterschied zwischen Training und Test wächst von ${num(one.train - one.test)} auf ${num(all.train - all.test)}.`,
      };
    },
    voraussetzung: 'Die Teilung in P001 bis P100 und P101 bis P200 ist fest. Mit einer anderen Teilung sähen die Zahlen etwas anders aus.',
    think: [
      {
        question: 'Alle lösen zwei Aufgaben mehr. Was macht R² der Lernzeit-Geraden im Test?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Die Gerade aus dem Training rutscht um 2 Aufgaben mit nach oben. Bei den Testpersonen liegt sie dann genauso weit daneben wie vorher.',
        kurz: 'Verschieben ändert nichts an der Güte der Vorhersage.',
        tryIt: { label: 'alle zwei Aufgaben mehr', op: 'shift', column: 'y', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht R² der Lernzeit-Geraden im Test?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1,
        explain: 'Die Steigung halbiert sich, die Vorhersagen bleiben dieselben. Also bleibt auch der Fehler bei den Testpersonen gleich.',
        kurz: 'Die Einheit eines Prädiktors ändert die Vorhersagen nicht.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 0,
    tokens: { linear_regression: LINEAR_REGRESSION_TOKEN, modell: MODELL },
    outputMap: [
      { match: '0.292', atlas: 'R² im Training', explain: 'R Square gilt für die 200 Befragten, an die das Modell angepasst wurde. Für neue Personen sagt es nichts.' },
      { match: '0.285', atlas: 'korrigiertes R²', explain: 'Adjusted R Square zieht für jeden Prädiktor etwas ab. Das dämpft Überanpassung, ersetzt aber keinen Test an neuen Daten.' },
    ],
    check: {
      question: 'Welche Zahl zieht für jeden Prädiktor etwas ab? Tippe sie an.', correct: '0.285',
      wrong: {
        '0.292': 'Fast! Das ist R Square ohne Abzug. Mit jedem weiteren Prädiktor wird es auf denselben Daten nie kleiner.',
        '0.540': 'Fast! Das ist R, die Wurzel aus R². Der Wert mit Abzug heißt Adjusted R Square.',
      },
    },
  },
  next: {
    next: { id: 'explained_variance', why: 'R² auf den eigenen Daten und R² bei neuen Personen sind zweierlei.' },
    before: [
      { id: 'prediction', why: 'Was geprüft wird: die Vorhersage für Personen, die das Modell nicht kennt.' },
      { id: 'linear_regression', why: 'Das Modell, das hier mit immer mehr Prädiktoren geschätzt wird.' },
    ],
    after: [{ id: 'multiplicity', why: 'Viele Prädiktoren durchzuprobieren ist wie viele Tests zu rechnen: Zufallsfunde werden wahrscheinlich.' }],
    more: [
      { id: 'sampling', why: 'Training und Test sollen aus derselben Grundgesamtheit stammen.' },
      { id: 'multicollinearity', why: 'Viele ähnliche Prädiktoren machen auch die Koeffizienten unsicher.' },
    ],
  },
};
