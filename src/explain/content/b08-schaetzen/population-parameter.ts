// Begriffskarte „Grundgesamtheit & Parameter“ (population_parameter). Beispiel: Anteil der stark politisch
// Interessierten im ALLBUS 2023 (Stichprobe, p) gegenüber dem unbekannten Anteil aller Erwachsenen (π).
// Reiter: Die 200 Befragten als gedachte Grundgesamtheit, μ gegenüber der Schätzung aus den ersten 20.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num, pct, unit } from '../../format';
import { sampleColumn } from '../../sample';
import { INTERESSE, columnX, mean } from './daten';

const STARK = INTERESSE.stark / INTERESSE.n;
/** Wie viele Befragte die gedachte kleine Stichprobe hat: die ersten 20 (P001 bis P020). */
export const ERSTE = 20;

/** μ aller Befragten (gedachte Grundgesamtheit), x̄ der ersten 20 und die Anteile mit Weiterbildung. */
export function parameter(c: SampleCtx) {
  const x = columnX(c, 'lernzeit'), w = sampleColumn(c.rows, 'weiterbildung');
  return { N: x.length, mu: mean(x), xbar: mean(x.slice(0, ERSTE)), pi: mean(w), p: mean(w.slice(0, ERSTE)), last: c.rows[ERSTE - 1]?.id ?? '' };
}

export const populationParameter: ConceptCard = {
  concept: 'population_parameter',
  wofuer: `Im ALLBUS 2023 sagen ${pct(STARK)} der Befragten, dass sie sich stark oder sehr stark für Politik interessieren. Gilt das für alle Erwachsenen in Deutschland? Dafür musst du trennen: Was hast du gemessen, und was willst du eigentlich wissen?`,
  kurz: 'Die Grundgesamtheit sind alle, über die du etwas wissen willst. Ein Parameter ist eine feste Zahl über sie, etwa ihr Mittelwert, die du meist nicht kennst.',
  stellDirVor: {
    text: `Im ALLBUS 2023 haben ${count(INTERESSE.n)} Menschen gesagt, wie stark sie sich für Politik interessieren. ${count(INTERESSE.stark)} von ihnen antworten „stark“ oder „sehr stark“, das sind ${pct(STARK)} (ungewichtet). Diese Zahl kennst du genau; sie gilt für die Befragten. Wissen willst du aber den Anteil unter allen Erwachsenen in Deutschland. Den kennt niemand, und die ${pct(STARK)} sind eine Schätzung dafür.`,
    figures: [
      { label: 'Befragte mit gültiger Antwort', value: count(INTERESSE.n) },
      { label: 'Anteil in der Stichprobe, p', value: pct(STARK) },
      { label: 'Anteil aller Erwachsenen, π', value: 'unbekannt' },
    ],
  },
  heisst: {
    sym: 'θ', say: 'theta',
    fach: 'Die Grundgesamtheit umfasst alle Personen oder möglichen Beobachtungen, über die eine Aussage getroffen werden soll. Ein Parameter θ beschreibt sie mit einer festen Zahl, etwa dem Mittelwert μ oder dem Anteil π.',
  },
  bausteine: [
    {
      title: 'Die Zielgruppe festlegen',
      was: 'Lege fest, über wen du sprichst: welche Menschen, wo und wann. Alle Erwachsenen in Deutschland im Jahr 2023 sind eine andere Gruppe als alle Studierenden in Marburg.',
      warum: 'Nur wenn die Grundgesamtheit klar ist, weißt du, für wen ein Ergebnis gilt. Eine Befragung von Studierenden sagt nichts über Rentnerinnen und Rentner.',
      acht: 'Wer nur online befragt, erreicht Menschen ohne Internet nicht. Die Grundgesamtheit, für die das Ergebnis gilt, ist dann kleiner als gedacht.',
      concept: 'sampling',
    },
    {
      title: 'Die Zielgröße benennen',
      was: 'Sag, welche Zahl über die Grundgesamtheit dich interessiert: ein Mittelwert μ, ein Anteil π, eine Streuung σ. Griechische Buchstaben stehen für Parameter.',
      warum: 'Erst die Zielgröße macht klar, worauf sich eine Schätzung oder eine Hypothese bezieht.',
      acht: 'p und π klingen gleich, meinen aber Verschiedenes. p ist der Anteil in deiner Stichprobe, π der Anteil in der Grundgesamtheit.',
      concept: 'hypothesis',
    },
    {
      title: 'Schätzen statt kennen',
      was: 'Der Parameter steht fest, aber du kennst ihn nicht. Aus der Stichprobe berechnest du eine Zahl, die ihm möglichst nahe kommt.',
      warum: 'Eine andere Stichprobe hätte eine etwas andere Zahl ergeben. Der Parameter selbst bleibt dabei derselbe.',
      acht: 'Zufällig ist die Stichprobe, nicht der Parameter. Deshalb schwanken die Schätzungen, nicht die Wahrheit.',
      concept: 'estimator',
    },
  ],
  ausprobieren: [
    {
      question: 'Ein anderes Team befragt im selben Jahr eine neue Zufallsstichprobe. Was ändert sich?',
      options: ['der Parameter π', 'der Anteil p in der Stichprobe', 'beides'], correct: 1, step: 3,
      explain: 'π gehört zu allen Erwachsenen und steht fest. p hängt davon ab, wer zufällig in die Stichprobe kommt, und fällt etwas anders aus.',
      kurz: 'Neue Stichprobe, neue Schätzung, gleicher Parameter.',
    },
    {
      question: `Der ALLBUS 2023 meldet ${pct(STARK)}. Interessieren sich damit genau ${pct(STARK)} aller Erwachsenen stark für Politik?`,
      options: ['ja', 'nein, das ist eine Schätzung'], correct: 1, step: 3,
      explain: `Die ${pct(STARK)} gelten für die Befragten. Für alle Erwachsenen sind sie eine Schätzung mit einer gewissen Unschärfe; wie groß sie ist, sagt der Standardfehler.`,
      kurz: 'Gemessen ist nicht gleich gewusst.',
    },
    {
      question: 'Eine Umfrage unter Studierenden in Marburg findet hohes politisches Interesse. Gilt das für alle Erwachsenen?',
      options: ['ja', 'nein, die Grundgesamtheit ist eine andere'], correct: 1, step: 1,
      explain: 'Die Stichprobe stammt aus Studierenden in Marburg. Ihre Grundgesamtheit sind diese Studierenden, nicht alle Erwachsenen in Deutschland.',
      kurz: 'Ein Ergebnis gilt für die Grundgesamtheit, aus der die Stichprobe stammt.',
    },
  ],
  check: {
    question: 'Welche dieser Zahlen ist ein Parameter?',
    options: [
      `der Anteil von ${pct(STARK)} unter den ${count(INTERESSE.n)} Befragten`,
      'der Anteil aller Erwachsenen in Deutschland, die sich stark für Politik interessieren',
      `die Zahl ${count(INTERESSE.n)} der Befragten`,
      'der Anteil in einer neuen Stichprobe',
    ],
    correct: 1,
    right: 'Genau. Ein Parameter beschreibt die Grundgesamtheit. Er steht fest, auch wenn ihn niemand kennt.',
    diagnose: {
      0: 'Fast! Das ist der Anteil in der Stichprobe, also eine Schätzung. Der Parameter ist der Anteil unter allen Erwachsenen.',
      2: `Noch nicht ganz. ${count(INTERESSE.n)} ist die Größe der Stichprobe. Ein Parameter ist eine Zahl über die Grundgesamtheit.`,
      3: 'Fast! Auch eine neue Stichprobe liefert nur eine Schätzung. Der Parameter gehört zu allen, nicht zu einer Stichprobe.',
    },
  },
  fuerDich: 'Wenn in den Nachrichten steht, wie viel Prozent „der Deutschen“ etwas denken, ist das fast immer eine Schätzung aus einer Stichprobe. Frag dich, wer befragt wurde und für welche Grundgesamtheit die Zahl stehen soll.',
  genau: {
    kurz: 'Im üblichen frequentistischen Modell ist der Parameter fest, aber unbekannt. Zufällig sind die Daten, nicht der Parameter.',
    paragraphs: [
      'Lege Personenkreis, Ort und Zeitraum fest. Der Mittelwert aller Erstsemester ist eine andere Zielgröße als der aller Studierenden.',
      'Neben μ und π gibt es viele Parameter: die Streuung σ, eine Korrelation ρ, ein Regressionsgewicht β. Allgemein schreibt man θ.',
      'Hier ungewichtet gerechnet. Für eine Aussage über alle Erwachsenen würde man den ALLBUS gewichten, weil er den Osten stärker befragt.',
      'Im Teil mit den 200 Befragten des Lehrdatensatzes tun wir so, als wären sie die ganze Grundgesamtheit. Das ist ein Gedankenexperiment: Die 200 synthetischen Befragten stehen für keine echte Bevölkerung.',
    ],
  },
};

export const populationParameterTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Stell dir für den Moment vor, die 200 Befragten wären alle, über die du etwas wissen willst. Dann kennst du den Parameter genau.',
    value: c => parameter(c).mu,
    result: c => {
      const p = parameter(c);
      return {
        kurz: `Dann ist μ = ${unit(p.mu, 'Stunde', 'Stunden')}: die mittlere Lernzeit aller ${p.N}. Hättest du nur die ersten ${ERSTE} befragt, wäre deine Schätzung ${unit(p.xbar, 'Stunde', 'Stunden')}. μ steht fest; die Schätzung hängt davon ab, wen du fragst.`,
        fachlich: `Parameter der gedachten Grundgesamtheit: μ = ${num(p.mu)} h. Statistik der Stichprobe P001 bis ${p.last}: x̄ = ${num(p.xbar)} h.`,
        zusatz: `Genauso beim Anteil mit Weiterbildung: π = ${pct(p.pi)} aller ${p.N}, aber ${pct(p.p)} unter den ersten ${ERSTE}.`,
      };
    },
    voraussetzung: 'Das ist ein Gedankenexperiment. In echten Studien kennst du μ nicht, sondern nur die Stichprobe.',
    think: [
      {
        question: 'Alle 200 lernen eine Stunde mehr. Was passiert mit μ?',
        options: ['steigt um 1 Stunde', 'bleibt gleich, μ ist fest', 'lässt sich nicht sagen'], correct: 0,
        explain: 'μ ist fest, solange die Grundgesamtheit dieselbe bleibt. Ändern sich die Menschen selbst, ändert sich auch ihr Parameter: Alle lernen eine Stunde mehr, also auch im Mittel.',
        kurz: 'Fest heißt: unabhängig von der Stichprobe, nicht unveränderlich.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1 },
      },
      {
        question: 'Angenommen, alle 200 hätten genau 8 Stunden gelernt. Wie groß ist μ dann?',
        options: ['8', '0', 'das hängt von der Stichprobe ab'], correct: 0,
        explain: 'Wenn alle gleich lange lernen, ist ihr Mittelwert genau diese Zeit. Dann träfe auch jede Stichprobe den Parameter genau.',
        kurz: 'Ohne Unterschiede trifft jede Stichprobe.',
        tryIt: { label: 'alle auf 8 Stunden', op: 'constant', column: 'x', value: 8 },
        expect: { change: 'equals', value: 8 },
      },
    ],
  },
  next: {
    next: { id: 'estimator', why: 'Die Rechenregel, die aus der Stichprobe eine Zahl für den Parameter macht.' },
    before: [
      { id: 'sampling', why: 'Die Stichprobe ist der Teil der Grundgesamtheit, den du wirklich befragst.' },
    ],
    after: [
      { id: 'hypothesis', why: 'Hypothesen sind Aussagen über Parameter, etwa μ = 7.' },
      { id: 'sampling_bias', why: 'Wenn eine Schätzung im Mittel am Parameter vorbeiliegt.' },
    ],
    more: [
      { id: 'confidence', why: 'Ein Bereich plausibler Werte für den unbekannten Parameter.' },
      { id: 'expectation', why: 'Der Mittelwert in einem Wahrscheinlichkeitsmodell, ein Parameter des Modells.' },
    ],
  },
};
