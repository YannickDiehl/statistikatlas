// Tabellen-Werkzeug „Fehlende Angaben“ (missing). Fünf Befragte aus dem Lehrdatensatz (P001 bis P005) in einer
// Übungskopie: P003 ohne Angabe zum Einkommen (Code −9), P005 ohne Lernzeit (NA). Die Wahl legt fest, wie die −9
// behandelt wird. Vorlage: Werkzeug (Datenoperation mit mariposa::set_na). Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptTabs, SampleCtx, TableTool } from '../../types';
import { close, count, pct } from '../../format';
import { sampleColumn, sampleColumnInfo, unitText } from '../../sample';
import { FUENF, mean, role, validCount } from './shared';

/** ALLBUS 2023, ungewichtet: Haushaltsnettoeinkommen (hhincc) keine Angabe 696 und verweigert 28 von 5.246. */
export const ALLBUS_HHINC = { fehlend: 724, n: 5246 } as const;
/** ALLBUS 2023, ungewichtet: eigenes Nettoeinkommen (incc) keine Angabe oder verweigert 446, „kein Einkommen“ (−50) 251. */
export const ALLBUS_INC = { fehlend: 446, keinEinkommen: 251, n: 5246 } as const;

type Option = 'zahl' | 'na' | 'null';
const EIN = FUENF.map(p => p.einkommen as number);
/** Mittleres Einkommen der fünf je Wahl (R: 2972.4, 3717.75, 2974.2). */
export const MITTEL: Record<Option, number> = {
  zahl: (EIN[0] + EIN[1] - 9 + EIN[3] + EIN[4]) / 5,
  na: (EIN[0] + EIN[1] + EIN[3] + EIN[4]) / 4,
  null: (EIN[0] + EIN[1] + EIN[3] + EIN[4]) / 5,
};
const SUMME = { zahl: EIN[0] + EIN[1] - 9 + EIN[3] + EIN[4], gueltig: EIN[0] + EIN[1] + EIN[3] + EIN[4] };

const START = [
  'library(dplyr)',
  'library(mariposa)',
  '',
  'atlas <- read_spss("Statistikatlas-200-Befragte.sav")',
  '',
  '# Übungskopie: P003 ohne Angabe zum Einkommen (Code -9), P005 ohne Lernzeit',
  'fuenf <- atlas %>%',
  '  filter(id %in% c("P001", "P002", "P003", "P004", "P005")) %>%',
  '  mutate(',
  '    einkommen = replace(einkommen, id == "P003", -9),',
  '    lernzeit  = replace(lernzeit, id == "P005", NA)',
  '  )',
  '',
];

export const missing: TableTool = {
  concept: 'missing',
  wofuer: `Beim Einkommen fehlt in Umfragen oft die Antwort. Im ALLBUS 2023 (ungewichtet) machten ${pct(ALLBUS_HHINC.fehlend / ALLBUS_HHINC.n)} der Befragten keine Angabe zum Haushaltseinkommen oder verweigerten sie. Wie du mit solchen Lücken umgehst, verändert das Ergebnis.`,
  kurz: 'Ein fehlender Wert ist keine Null und kein Messwert. Er wird als NA markiert und zählt bei Rechnungen nicht mit.',
  mut: 'Hier rechnest du nichts Schweres. Du entscheidest nur für jede Zelle: echte Antwort oder fehlend?',
  columns: [
    { key: 'person', label: 'Person' },
    { key: 'einkommen', label: 'einkommen' },
    { key: 'lernzeit', label: 'lernzeit' },
  ],
  rows: FUENF.map(p => ({ person: p.id, einkommen: p.id === 'P003' ? -9 : p.einkommen, lernzeit: p.id === 'P005' ? null : p.lernzeit })),
  options: [
    { id: 'na', label: '−9 als fehlend markieren (NA)' },
    { id: 'zahl', label: '−9 als Zahl stehen lassen' },
    { id: 'null', label: 'die fehlende Angabe als 0 eintragen' },
  ],
  steps: [
    {
      title: 'Den Code für fehlende Angaben finden',
      was: 'Im Codebuch steht: −9 heißt „keine Angabe“. Bei P003 steht −9 in der Spalte einkommen, und diese Zahl ist kein Einkommen.',
      warum: 'Umfragen speichern fehlende Antworten oft als negative Zahl. Wer das nicht weiß, rechnet sie als Einkommen mit.',
      acht: 'Ein Code wie −9 sieht aus wie ein Messwert. Erst das Codebuch sagt, dass er keiner ist.',
      sym: '−9', say: 'minus neun',
      fach: 'Missing-Codes sind vereinbarte Werte für fehlende Antworten, etwa −9 für keine Angabe oder −7 für verweigert. Welche Codes fehlend bedeuten, legt das Codebuch fest.',
    },
    {
      title: 'Als fehlend markieren',
      was: 'Mit set_na() wird aus der −9 ein NA. NA heißt: Hier fehlt etwas.',
      warum: 'R lässt NA bei Rechnungen weg. Mit einer −9 rechnet es dagegen ohne Warnung, als wäre sie ein Einkommen.',
      acht: 'NA ist keine 0. Eine 0 ist eine echte Antwort, etwa 0 Stunden gelernt.',
      sym: 'NA', say: 'N A',
      fach: 'NA (not available) ist in R der Platzhalter für einen fehlenden Wert. set_na() aus mariposa wandelt angegebene Missing-Codes in NA um.',
      concept: 'missing',
    },
    {
      title: 'Die gültigen Fälle zählen',
      was: 'Beim Einkommen haben vier der fünf eine gültige Angabe. Der Mittelwert teilt deshalb durch 4, nicht durch 5.',
      warum: 'Wer fehlt, trägt nichts zur Summe bei. Also zählt er auch beim Teilen nicht mit.',
      acht: 'R meldet die gültigen Fälle als N und die fehlenden als Missing. Schau immer auf beide.',
      sym: 'n gültig = n − n fehlend', say: 'n gültig gleich n minus n fehlend',
      fach: 'Die gültige Fallzahl ist die Zahl der Fälle ohne fehlenden Wert: n gültig = n erhoben − n fehlend.',
    },
    {
      title: 'Für jede Rechnung festlegen, wer mitzählt',
      was: 'Bei P005 fehlt die Lernzeit. Für einen Zusammenhang von Einkommen und Lernzeit zählen nur die drei mit beiden Angaben.',
      warum: 'Listenweise heißt: nur Personen mit allen Angaben. Paarweise heißt: für jede Rechnung alle, die dort beide Angaben haben.',
      acht: 'Paarweise beruhen verschiedene Ergebnisse auf verschiedenen Personen. Das kann zu Widersprüchen zwischen ihnen führen.',
      fach: 'Listenweiser Ausschluss verwendet nur Fälle, die in allen beteiligten Variablen gültig sind; paarweiser Ausschluss verwendet je Rechnung alle dort gültigen Fälle.',
      concept: 'validn',
    },
  ],
  apply: (rows, option) => ({
    columns: [
      { key: 'person', label: 'Person' },
      { key: 'einkommen', label: 'einkommen nachher' },
      { key: 'lernzeit', label: 'lernzeit' },
      { key: 'zaehlt', label: 'zählt beim Einkommen mit' },
    ],
    rows: rows.map(r => {
      const gap = r.einkommen === -9;
      return {
        person: r.person,
        einkommen: !gap ? r.einkommen : option === 'na' ? null : option === 'null' ? 0 : -9,
        lernzeit: r.lernzeit,
        zaehlt: !gap ? 'ja' : option === 'na' ? 'nein' : option === 'null' ? 'ja, als 0' : 'ja, als −9',
      };
    }),
  }),
  rCode: option => [
    ...START,
    'fuenf %>%',
    ...(option === 'na' ? ['  set_na(einkommen = -9) %>%'] : option === 'null' ? ['  mutate(einkommen = replace(einkommen, id == "P003", 0)) %>%'] : []),
    '  describe(einkommen, show = "mean")',
  ].join('\n'),
  check: {
    question: 'Wie hoch ist mit dieser Wahl das mittlere Haushaltseinkommen der fünf? Zwei Nachkommastellen reichen.',
    answer: option => MITTEL[option as Option],
    right: 'Genau. So rechnet auch R mit dieser Wahl.',
    diagnose: (option, v) => {
      if (v === 'NA') return null;
      if (option === 'na') return close(v, MITTEL.null) ? 'Fast! Du hast durch 5 geteilt. Bei P003 fehlt die Angabe, es zählen nur vier Personen.'
        : close(v, MITTEL.zahl) ? 'Fast! Da ist die −9 noch mitgerechnet. Als fehlend markiert zählt sie nicht mit.'
        : close(v, SUMME.gueltig) ? 'Fast! Das ist die Summe der vier Angaben. Jetzt noch durch 4 teilen.' : null;
      if (option === 'zahl') return close(v, MITTEL.na) ? 'Fast! So rechnet R erst, wenn die −9 als fehlend markiert ist. Hier steht sie noch als Zahl in der Spalte.'
        : close(v, SUMME.zahl) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.' : null;
      return close(v, MITTEL.na) ? 'Fast! Hier steht bei P003 eine 0, und sie zählt mit. Deshalb teilst du durch 5.'
        : close(v, SUMME.gueltig) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.' : null;
    },
  },
  think: [
    {
      question: 'Beide Lücken sind als fehlend markiert. Wie viele Personen gehen in einen Zusammenhang von Einkommen und Lernzeit ein?',
      options: ['3', '4', '5'], correct: 0, step: 4,
      explain: 'P003 fehlt das Einkommen, P005 die Lernzeit. Für einen Zusammenhang braucht jede Person beide Angaben: Es bleiben drei. R meldet dann N = 3.',
      kurz: 'Listenweise zählen nur vollständige Fälle.',
    },
    {
      question: 'Eine Person hat in den letzten sieben Tagen gar nicht gelernt und trägt 0 ein. Ist das ein fehlender Wert?',
      options: ['nein', 'ja'], correct: 0, step: 2,
      explain: '0 Stunden ist eine echte Antwort und zählt mit. Fehlend heißt: Wir wissen es nicht.',
      kurz: 'Null ist eine Antwort, NA ist keine.',
    },
    {
      question: 'Du ersetzt das fehlende Einkommen durch den Mittelwert der anderen vier. Ist das Problem damit gelöst?',
      options: ['nein', 'ja'], correct: 0, step: 3,
      explain: 'Der Mittelwert bleibt so gleich, aber die Streuung wird kleiner, und R hält die erfundene Zahl für eine echte Antwort. Ob das vertretbar ist, hängt davon ab, warum die Angabe fehlt.',
      kurz: 'Ersetzen löst keine Lücke, es versteckt sie.',
    },
  ],
  genau: {
    kurz: 'Fehlende Werte sind weder Nullen noch Codes, mit denen man rechnet. Welche Fälle in eine Rechnung eingehen, legst du für jede Rechnung fest.',
    paragraphs: [
      'Paarweiser Ausschluss kann eine Korrelationsmatrix erzeugen, die sich nicht als gemeinsame Datenmatrix deuten lässt: Jede Zahl beruht auf anderen Personen.',
      `Im ALLBUS 2023 (ungewichtet) haben beim eigenen Nettoeinkommen ${ALLBUS_INC.fehlend} von ${count(ALLBUS_INC.n)} Befragten keine Angabe gemacht oder verweigert. Weitere ${ALLBUS_INC.keinEinkommen} sagten „kein Einkommen“, und auch das hat einen negativen Code (−50). Wer alle negativen Codes als fehlend behandelt, verliert diese echten Nullen.`,
      'Der Lehrdatensatz ist vollständig. Die Lücken hier entstehen in einer Übungskopie, wie im R-Code zu sehen.',
      'Ob der Ausschluss das Ergebnis verzerrt, hängt davon ab, warum Angaben fehlen. Darum geht es im Begriff „Warum fehlen Angaben?“.',
    ],
  },
};

function einkommenOf(c: SampleCtx) {
  const column = role(c, 'x', 'einkommen'), values = sampleColumn(c.rows, column), info = sampleColumnInfo(column);
  return { n: values.length, valid: validCount(c, column), m: mean(values.filter(Number.isFinite)), u: (v: number) => unitText(info, v) };
}

export const missingTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'einkommen' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Wie viele gültige Angaben hat das Haushaltseinkommen, und was zählt als fehlend?',
    result: c => {
      const { n, valid, m, u } = einkommenOf(c);
      return {
        kurz: `${valid === n ? `Alle ${valid}` : valid} von ${n} Befragten haben eine gültige Angabe zum Haushaltsnettoeinkommen. Der Mittelwert ${u(m)} beruht deshalb auf ${valid === n ? `allen ${n}` : `${valid} Personen`}.`,
        fachlich: `n gültig = ${valid}, n fehlend = ${n - valid}; Mittelwert x̄ ≈ ${u(m)}.`,
        zusatz: `Im ALLBUS 2023 (ungewichtet) fehlte das Haushaltseinkommen bei ${pct(ALLBUS_HHINC.fehlend / ALLBUS_HHINC.n)} der Befragten: keine Angabe oder verweigert.`,
      };
    },
    voraussetzung: 'Missing-Codes müssen vor der Rechnung als fehlend markiert sein, sonst rechnet R sie als Zahl mit.',
    think: [
      {
        question: 'Die gewählte Person trägt 0 € ein. Was passiert mit der Zahl der gültigen Angaben?',
        options: ['bleibt gleich', 'sinkt um 1'], correct: 0,
        explain: '0 € ist eine Antwort, auch wenn sie selten ist. Die Zahl der gültigen Angaben bleibt 200, nur der Mittelwert ändert sich.',
        kurz: 'Eine Null fehlt nicht.',
        tryIt: { label: 'die gewählte Person auf 0 €', op: 'outlier', column: 'x', value: 0 },
        expect: { change: 'same', measure: c => einkommenOf(c).valid },
      },
    ],
  },
  r: {
    entry: 'missing_tools', variant: 0,
    outputMap: [
      { match: 'Missing', atlas: 'n fehlend', step: 2, explain: 'Die eine Angabe, die mit set_na() als fehlend markiert wurde: die −9 von P001.' },
      { match: 'N', atlas: 'n gültig', step: 3, explain: 'Gültig sind 200 minus 1 fehlende Angabe, also 199.' },
      { match: 'Mean', atlas: 'Mittelwert der gültigen Angaben', step: 3, explain: 'Der Mittelwert der 199 gültigen Angaben. Mit der −9 als Zahl läge er niedriger.' },
    ],
    check: {
      question: 'Welche Zahl zählt die fehlenden Angaben? Tippe sie an.', correct: 'Missing',
      wrong: {
        N: 'Fast! N zählt die gültigen Angaben: 200 minus die eine fehlende.',
        Mean: 'Fast! Das ist der Mittelwert der 199 gültigen Angaben.',
        SD: 'Fast! Das ist die Standardabweichung der gültigen Angaben. Die fehlenden zählt Missing.',
      },
    },
  },
  next: {
    next: { id: 'missing_mechanisms', why: 'Warum fehlen Angaben? Davon hängt ab, ob der Ausschluss das Ergebnis verzerrt.' },
    before: [{ id: 'series', why: 'In der Datenreihe steht bei einer fehlenden Angabe NA statt eines Werts.' }],
    after: [
      { id: 'missing_tools', why: 'Die mariposa-Werkzeuge für Missing-Codes: set_na(), na_frequencies() und mehr.' },
      { id: 'item_score', why: 'Legt fest, wie viele Fragen beantwortet sein müssen, damit ein Skalenwert entsteht.' },
    ],
    more: [{ id: 'validn', why: 'Zählt bei Paaren nur Personen, bei denen beide Angaben vorliegen.' }],
  },
};
