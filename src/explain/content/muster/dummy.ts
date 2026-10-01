// Muster des Tabellen-Werkzeugs: Dummyvariablen mit mariposa::rec() 0.7.4. Fünf Befragte aus dem Lehrdatensatz,
// je eine mit jedem Schulabschluss. In R nachgerechnet, siehe src/explain/content/muster/muster.test.ts.
import type { TableTool } from '../../types';

/** Codes und Wertelabels von `schulabschluss` (src/domain/survey.ts) mit den Namen der Dummyspalten. */
export const ABSCHLUESSE = [
  { code: 0, label: 'Ohne Schulabschluss', name: 'ohne' },
  { code: 1, label: 'Haupt-/Volksschulabschluss', name: 'haupt' },
  { code: 2, label: 'Mittlerer Abschluss', name: 'mittel' },
  { code: 3, label: 'Fachhochschulreife', name: 'fhr' },
  { code: 4, label: 'Abitur / fachgebundene Hochschulreife', name: 'abitur' },
] as const;

/** P001, P002, P003, P007 und P011 aus dem Lehrdatensatz (createSurvey()). */
const FUENF = [
  { person: 'P001', schulabschluss: 0 },
  { person: 'P002', schulabschluss: 3 },
  { person: 'P003', schulabschluss: 2 },
  { person: 'P007', schulabschluss: 1 },
  { person: 'P011', schulabschluss: 4 },
];

const byCode = (code: number) => ABSCHLUESSE.find(a => a.code === code)!;
const others = (ref: number) => ABSCHLUESSE.filter(a => a.code !== ref);
const quote = (s: string) => `„${s}“`;

export const dummy: TableTool = {
  concept: 'dummy',
  wofuer: 'Du willst wissen, ob der Schulabschluss mit der Lernzeit zusammenhängt, zum Beispiel in einer Regression. Die Codes 0 bis 4 sind aber keine Mengen: Abitur (Code 4) ist nicht doppelt so viel wie ein mittlerer Abschluss (Code 2). Deshalb bekommt jeder Abschluss eine eigene Spalte mit 0 oder 1.',
  kurz: 'Eine Dummyvariable fragt nur: Gehört diese Person zu dieser Gruppe, ja (1) oder nein (0)? Eine Gruppe bekommt keine eigene Spalte, sie ist der Vergleichspunkt.',
  mut: 'Hier rechnest du nichts aus. Du sortierst nur: Für jede Person und jede neue Spalte fragst du „ja oder nein?“.',
  columns: [
    { key: 'person', label: 'Person' },
    { key: 'schulabschluss', label: 'schulabschluss' },
    { key: 'label', label: 'Wertelabel' },
  ],
  rows: FUENF.map(r => ({ ...r, label: byCode(r.schulabschluss).label })),
  options: ABSCHLUESSE.map(a => ({ id: String(a.code), label: a.label })),
  steps: [
    {
      title: 'Eine Vergleichsgruppe wählen',
      was: 'Du legst fest, mit welcher Gruppe alle anderen verglichen werden. Diese Gruppe bekommt keine eigene Spalte.',
      warum: 'Die Vergleichsgruppe steckt in einer Regression schon im Achsenabschnitt. Eine eigene Spalte wäre doppelt.',
      acht: 'Mit Spalten für alle fünf Gruppen kann die Regression nicht rechnen. Diese Falle heißt Dummy-Falle.',
      fach: 'Die ausgelassene Kategorie heißt Referenzkategorie.',
    },
    {
      title: 'Für jede andere Gruppe eine Spalte anlegen',
      was: 'Jeder übrige Abschluss bekommt eine neue Spalte. Bei fünf Abschlüssen sind das vier Spalten.',
      warum: 'So bekommt jede Gruppe ihren eigenen Unterschied zur Vergleichsgruppe.',
      acht: 'Die Zahl der Spalten ist immer die Zahl der Gruppen minus eins.',
      sym: 'k − 1', say: 'k minus eins',
      fach: 'Für k Kategorien entstehen k − 1 Indikatorvariablen.',
    },
    {
      title: 'Ja oder nein eintragen',
      was: 'In jede neue Spalte kommt eine 1, wenn die Person zu dieser Gruppe gehört, sonst eine 0.',
      warum: 'Eine 1 schaltet den Unterschied dieser Gruppe ein, eine 0 schaltet ihn aus.',
      acht: 'Die Person aus der Vergleichsgruppe hat überall eine 0. Das ist richtig so und kein Fehler.',
      sym: 'Dᵢⱼ', say: 'D i j',
      fach: 'Dᵢⱼ ist 1, wenn Person i zur Kategorie j gehört, sonst 0.',
      concept: 'dummy',
    },
  ],
  apply: (rows, option) => {
    const ref = Number(option), cols = others(ref);
    return {
      columns: [{ key: 'person', label: 'Person' }, { key: 'label', label: 'Wertelabel' }, ...cols.map(a => ({ key: a.name, label: a.name }))],
      rows: rows.map(r => ({ person: r.person, label: r.label, ...Object.fromEntries(cols.map(a => [a.name, r.schulabschluss === a.code ? 1 : 0])) })),
    };
  },
  rCode: option => {
    const ref = byCode(Number(option)), cols = others(ref.code), width = Math.max(...cols.map(a => a.name.length));
    const rule = (code: number) => `${code}=1; ${ABSCHLUESSE.filter(a => a.code !== code).map(a => a.code).join(',')}=0`;
    return [
      'library(dplyr)',
      'library(mariposa)',
      '',
      'atlas <- read_spss("Statistikatlas-200-Befragte.sav")',
      '',
      `# Vergleichsgruppe: ${ref.label} (Code ${ref.code}), sie bekommt keine eigene Spalte`,
      'atlas <- atlas %>%',
      '  mutate(',
      ...cols.map((a, i) => `    ${a.name.padEnd(width)} = rec(schulabschluss, rules = "${rule(a.code)}")${i < cols.length - 1 ? ',' : ''}`),
      '  )',
    ].join('\n');
  },
  check: {
    question: 'Wie viele Dummyspalten brauchst du für die fünf Schulabschlüsse?',
    answer: () => 4,
    right: 'Genau, 4. Die Vergleichsgruppe braucht keine eigene Spalte.',
    diagnose: (_option, v) => v === 'NA' ? null
      : v === 5 ? 'Fast! Die Vergleichsgruppe bekommt keine eigene Spalte. Fünf Gruppen brauchen vier Spalten.'
      : v === 1 ? 'Fast! Eine Spalte mit den Codes 0 bis 4 wäre wieder die alte Variable. Jede Gruppe außer der Vergleichsgruppe braucht ihre eigene.'
      : null,
  },
  think: [
    {
      question: `Du wechselst die Vergleichsgruppe von ${quote('Ohne Schulabschluss')} zu ${quote('Abitur')}. Was passiert mit den Vorhersagen einer Regression?`,
      options: ['sie ändern sich', 'sie bleiben gleich'], correct: 1, step: 1,
      explain: 'Die Vorhersage für jede Gruppe bleibt dieselbe. Es ändert sich nur, womit die Koeffizienten verglichen werden: Jeder misst jetzt den Abstand zur Gruppe mit Abitur.',
      kurz: 'Andere Vergleichsgruppe, andere Koeffizienten, gleiche Vorhersagen.',
    },
    {
      question: 'Eine Person hat in allen vier neuen Spalten eine 0. Welchen Abschluss hat sie?',
      options: ['keinen gültigen', 'den der Vergleichsgruppe', 'das lässt sich nicht sagen'], correct: 1, step: 3,
      explain: 'Lauter Nullen heißt: Sie gehört zu keiner Gruppe mit eigener Spalte, also zur Vergleichsgruppe. Fehlt ihre Angabe, steht bei ausdrücklichen Regeln NA in den Spalten, nicht 0.',
      kurz: 'Lauter Nullen heißt: Vergleichsgruppe.',
    },
  ],
  genau: {
    kurz: 'Für k Gruppen brauchst du k − 1 Dummyvariablen. Welche Gruppe du weglässt, ändert die Deutung der Koeffizienten, nicht das Modell.',
    paragraphs: [
      'Mit Spalten für alle k Gruppen wäre ihre Summe in jeder Zeile 1, genau wie der Achsenabschnitt. Die Regression könnte die Effekte dann nicht trennen (perfekte Multikollinearität).',
      'Schreib die Codes ausdrücklich in die Regel, statt „else=0“ zu nutzen. Sonst wird eine fehlende Angabe zu 0 und zählt still zur Vergleichsgruppe.',
      'mariposa kann alle Spalten auch in einem Schritt anlegen: to_dummy(schulabschluss, ref = 0). Ohne ref bekommt jede Gruppe eine Spalte, dann tappst du in die Dummy-Falle. Mit rec() siehst du jede Regel einzeln.',
    ],
  },
};
