// Begriffskarte „Validität“ (validity). Beispiel aus dem Lehrdatensatz: Die fünf Fragen zur Methoden-Zuversicht sind
// sehr reliabel (Alpha 0,9), hängen aber kaum mit dem Wissenstest zusammen; die Lernzeit dagegen schon.
// Vorlage: Begriffskarte (Validität ist ein Urteil, keine Rechnung). Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { sampleColumn } from '../../sample';
import { pearson, role } from './shared';

/** R: Cronbach-Alpha der fünf Methodenfragen 0.898; r(Methoden-Mittel, Wissenstest) 0.0211; r(Lernzeit, Wissenstest) 0.5392. */
export const VAL = { alpha: 0.898, rMethoden: 0.0211, rLernzeit: 0.5391689 } as const;

export const validity: ConceptCard = {
  concept: 'validity',
  wofuer: 'Ein Test kann sehr genau sein und trotzdem das Falsche messen. Validität fragt: Darf man die Zahlen so deuten, wie man es möchte? Misst der Wissenstest Wissen, misst die Methoden-Zuversicht Können?',
  kurz: 'Validität heißt: Eine Messung misst das, was sie messen soll. Belegt wird das mit Gründen und Befunden, nicht mit einer einzigen Kennzahl.',
  stellDirVor: {
    text: `Fünf Fragen erfassen im Lehrdatensatz die Methoden-Zuversicht, etwa „Ich kann ein statistisches Ergebnis erklären.“ Die fünf Antworten hängen eng zusammen: Cronbach-Alpha ${num(VAL.alpha, 1)}. Mit dem Wissenstest hängt ihr Mittelwert aber kaum zusammen: r ≈ ${num(VAL.rMethoden)}. Die Lernzeit dagegen schon: r ≈ ${num(VAL.rLernzeit)}.`,
    figures: [
      { label: 'Alpha der fünf Fragen', value: num(VAL.alpha, 1) },
      { label: 'r Zuversicht und Wissenstest', value: num(VAL.rMethoden) },
      { label: 'r Lernzeit und Wissenstest', value: num(VAL.rLernzeit) },
    ],
  },
  heisst: {
    fach: 'Validität ist der Grad, in dem Theorie und empirische Befunde eine bestimmte Deutung von Messwerten für einen bestimmten Zweck stützen. Sie ist ein begründetes Gesamturteil, kein einzelner Kennwert.',
  },
  bausteine: [
    {
      title: 'Den Inhalt prüfen',
      was: 'Passen die Fragen zu dem, was gemessen werden soll? Wer nach Zutrauen fragt, misst Zutrauen, nicht Können.',
      warum: 'Der Inhalt ist der erste Beleg. Fehlt dort etwas Wichtiges, kann keine Rechnung das ausgleichen.',
      acht: 'Ein Name auf dem Fragebogen ist kein Beleg. „Methodenkompetenz“ darüberzuschreiben macht aus Selbstauskünften keine Kompetenzmessung.',
      concept: 'operationalization',
    },
    {
      title: 'Erwartete Zusammenhänge prüfen',
      was: 'Misst der Wissenstest Wissen, sollten Personen, die mehr lernen, eher mehr Aufgaben lösen.',
      rechnung: `Lernzeit und Wissenstest: r ≈ ${num(VAL.rLernzeit)}. Methoden-Zuversicht und Wissenstest: r ≈ ${num(VAL.rMethoden)}.`,
      warum: 'Passen die Befunde zu dem, was die Deutung erwarten lässt, stützt das die Deutung. Passen sie nicht, spricht das dagegen.',
      acht: 'Ein einzelner Zusammenhang beweist keine Validität. Er ist ein Beleg unter mehreren.',
      concept: 'pearson',
    },
    {
      title: 'Genauigkeit nicht mit Gültigkeit verwechseln',
      was: 'Die fünf Methodenfragen stimmen untereinander stark überein. Das zeigt nur, dass sie dasselbe messen, nicht was.',
      rechnung: `Alpha ${num(VAL.alpha, 1)}: sehr genau. r mit dem Wissenstest ${num(VAL.rMethoden)}: kein Maß für Wissen.`,
      warum: 'Reliabilität ist eine Voraussetzung, kein Beweis. Ein Maßband, das immer 5 cm zu viel anzeigt, misst zuverlässig falsch.',
      acht: 'Ein hoher Reliabilitätswert ist kein Gütesiegel für die Deutung.',
      concept: 'reliability',
    },
    {
      title: 'Zweck und Gruppe mitdenken',
      was: 'Eine Messung kann für einen Zweck taugen und für einen anderen nicht, für eine Gruppe und für eine andere nicht.',
      warum: 'Validität gilt immer für eine bestimmte Deutung. Wer die Zahlen anders nutzt, muss neu begründen.',
      acht: 'Die Methodenfragen des Lehrdatensatzes sind ein synthetisches Lehrbeispiel und nicht validiert.',
    },
  ],
  ausprobieren: [
    {
      question: 'Ein Test liefert bei jeder Wiederholung fast dieselben Werte. Ist er damit valide?',
      options: ['nein, nur zuverlässig', 'ja'], correct: 0, step: 3,
      explain: 'Zuverlässig heißt: Er misst immer gleich. Ob er das Richtige misst, ist eine andere Frage.',
      kurz: 'Genau ist nicht gleich gültig.',
    },
    {
      question: 'Die Methoden-Zuversicht hängt im Lehrdatensatz kaum mit dem Wissenstest zusammen. Was folgt daraus?',
      options: ['Als Maß für Wissen taugt sie hier nicht.', 'Die fünf Fragen sind schlecht formuliert.', 'Der Wissenstest ist kaputt.'], correct: 0, step: 2,
      explain: 'Sie kann ein gutes Maß für Zutrauen sein. Für die Deutung „Wer zuversichtlich ist, weiß mehr“ fehlt in diesen Daten aber jeder Beleg.',
      kurz: 'Eine Messung ist gültig für eine Deutung, nicht für jede.',
    },
  ],
  check: {
    question: 'Ein Fragebogen soll politisches Interesse messen. Was ist ein Beleg für seine Validität?',
    options: [
      'Wer hohe Werte hat, verfolgt auch häufiger politische Nachrichten.',
      'Cronbach-Alpha liegt bei 0,9.',
      'Sehr viele Menschen haben ihn ausgefüllt.',
      'Die Antworten sind gleichmäßig verteilt.',
    ],
    correct: 0,
    right: 'Genau. Ein Zusammenhang, den die Deutung erwarten lässt, ist ein Beleg für sie.',
    diagnose: {
      1: 'Fast! Alpha zeigt, dass die Fragen dasselbe messen. Ob es politisches Interesse ist, zeigt es nicht.',
      2: 'Fast! Viele Befragte machen Schätzungen genauer, aber nicht die Messung gültiger.',
      3: 'Noch nicht ganz. Die Form der Verteilung sagt nichts darüber, was gemessen wird.',
    },
  },
  fuerDich: 'Wenn eine Studie mit einer Skala arbeitet, frag: Welche Belege gibt es, dass sie misst, was sie messen soll? Ein hohes Alpha allein reicht nicht.',
  genau: {
    kurz: 'Validität ist ein Urteil über eine Deutung, gestützt auf mehrere Belege. Reliabilität ist nötig, aber nicht genug.',
    paragraphs: [
      'Belege für eine Deutung kommen aus dem Inhalt der Fragen, aus der Art, wie Befragte sie verstehen, aus der inneren Struktur der Antworten und aus erwarteten Beziehungen zu anderen Merkmalen (GESIS-Leitfaden von Repke, Birkenmaier und Lechner, 2024).',
      'Früher unterschied man Inhalts-, Kriteriums- und Konstruktvalidität. Heute gelten sie als Teile eines Gesamturteils über eine Deutung.',
      'Befunde aus einer Gruppe oder für einen Zweck übertragen sich nicht von selbst auf andere Gruppen oder Zwecke.',
      'Die Zahlen hier stammen aus dem synthetischen Lehrdatensatz. Dass Zuversicht und Wissen dort kaum zusammenhängen, ist so gebaut und keine Aussage über echte Menschen.',
    ],
  },
};

/** Mittelwert der fünf Methodenfragen je Person. */
const methodenMittel = (c: SampleCtx) => c.rows.map(r => [1, 2, 3, 4, 5].reduce((a, k) => a + r.values[`methoden${k}`], 0) / 5);

function validOf(c: SampleCtx) {
  const xs = sampleColumn(c.rows, role(c, 'x', 'lernzeit')), ys = sampleColumn(c.rows, role(c, 'y', 'wissenstest'));
  return { n: xs.length, r: pearson(xs, ys), rm: pearson(methodenMittel(c), ys) };
}
const weak = (r: number | null) => r === null ? 'gar nicht' : Math.abs(r) < 0.1 ? 'kaum' : r > 0 ? 'gleichläufig' : 'gegenläufig';

export const validityTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'wissenstest' },
    kurz: 'Dieselbe Prüfung mit allen 200 Befragten: Passen die Zusammenhänge zur Deutung „Der Wissenstest misst Wissen“?',
    value: c => validOf(c).r,
    result: c => {
      const { n, r, rm } = validOf(c), rm2 = rm === null ? 'nicht berechenbar' : num(rm);
      const first = r === null ? 'Der Wissenstest streut nicht, ein Zusammenhang lässt sich nicht messen.'
        : r >= 0.3 ? `Wer mehr lernt, löst im Wissenstest eher mehr Aufgaben: r ≈ ${num(r)}. Das passt zur Deutung „Der Test misst Wissen“.`
        : r <= -0.3 ? `Wer mehr lernt, hat im Wissenstest eher niedrigere Werte: r ≈ ${num(r)}. Das passt nicht zur Deutung „richtig gelöste Aufgaben“; prüfe die Auswertungsregel.`
        : `Lernzeit und Wissenstest hängen kaum zusammen: r ≈ ${num(r)}. Damit fehlt ein wichtiger Beleg für die Deutung „Der Test misst Wissen“.`;
      return {
        kurz: `${first} Mit der Methoden-Zuversicht hängt der Wissenstest ${weak(rm)} zusammen (r ≈ ${rm2}).`,
        fachlich: `Pearson-r von Lernzeit und Wissenstest ${r === null ? 'nicht definiert' : num(r)}; von Methoden-Zuversicht (Mittel der fünf Fragen) und Wissenstest ${rm2}; n = ${n}.`,
        zusatz: 'Die Lernzeit dient hier als erwarteter Begleiter von Wissen. Ein Wissenstest, der damit nichts zu tun hätte, wäre schwer als Wissenstest zu deuten.',
      };
    },
    voraussetzung: 'Ein Zusammenhang stützt eine Deutung nur, wenn er vorher aus der Theorie erwartet wurde.',
    think: [
      {
        question: 'Der Test wird leichter: Alle lösen eine Aufgabe mehr. Was passiert mit r zwischen Lernzeit und Wissenstest?',
        options: ['bleibt gleich', 'wird stärker', 'wird schwächer'], correct: 0,
        explain: 'Alle rücken um eine Aufgabe. Wer vorher mehr löste, tut es auch jetzt. Ob ein Test leicht oder schwer ist, ändert diesen Beleg nicht.',
        kurz: 'Die Höhe der Werte ist nicht ihre Bedeutung.',
        tryIt: { label: 'alle eine Aufgabe mehr', op: 'shift', column: 'y', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Jemand wertet falsch herum aus und zählt die falschen statt der richtigen Aufgaben. Was passiert mit r?',
        options: ['wechselt das Vorzeichen', 'bleibt gleich', 'wird null'], correct: 0,
        explain: `Aus ${num(VAL.rLernzeit)} wird ${num(-VAL.rLernzeit)}. Ohne die Auswertungsregel zu kennen, würdest du den Befund genau falsch herum deuten.`,
        kurz: 'Die Deutung hängt an der Auswertungsregel.',
        tryIt: { label: 'falsch herum auswerten (20 − Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  next: {
    next: { id: 'reliability', why: 'Prüft die Genauigkeit einer Skala. Sie ist nötig für Validität, aber kein Beweis dafür.' },
    before: [
      { id: 'operationalization', why: 'Die Messregel, deren Deutung hier begründet wird.' },
      { id: 'measurement_error', why: 'Zufällige und systematische Fehler, die eine Deutung schwächen.' },
    ],
    after: [
      { id: 'dimensionality', why: 'Ob ein Fragenblock eine oder mehrere Seiten misst, ist ein Beleg für die Deutung.' },
      { id: 'item_score', why: 'Ein gemeinsamer Wert aus mehreren Fragen braucht eine begründete Deutung.' },
    ],
    more: [{ id: 'causality', why: 'Auch bei Ursachen geht es darum, welche Deutung die Daten tragen.' }],
  },
};
