// Begriffskarte „Datenreihe“ (series). Beispiel: die Lernzeit von P001 bis P005 aus dem Lehrdatensatz.
// Vorlage: Begriffskarte, weil es nichts auszurechnen gibt; die Idee ist „ein Wert je Person, in der Reihenfolge der Personen“.
// Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { columnById } from '../../../domain/survey';
import { num } from '../../format';
import { sampleColumn, sampleColumnInfo } from '../../sample';
import { FUENF, listText, role, sub, valueText } from './shared';

const L = FUENF.map(p => p.lernzeit);
const h = (v: number) => `${num(v)} h`;

export const series: ConceptCard = {
  concept: 'series',
  wofuer: 'Bevor du etwas ausrechnest, liegen die Antworten selbst vor dir: eine Spalte, ein Wert je Person. Diese Liste heißt Datenreihe. Jede Rechnung in der Statistik beginnt mit ihr.',
  kurz: 'Eine Datenreihe ist eine Spalte mit genau einem Wert für jede Person. Ihre Reihenfolge sagt, wer welchen Wert hat, nicht wer am meisten hat.',
  stellDirVor: {
    text: `Fünf Befragte aus dem Lehrdatensatz sagen, wie viele Stunden sie in den letzten sieben Tagen selbstständig gelernt haben: P001 ${h(L[0])}, P002 ${h(L[1])}, P003 ${h(L[2])}, P004 ${h(L[3])} und P005 ${h(L[4])}. Diese fünf Zahlen in dieser Reihenfolge sind eine Datenreihe. Im ganzen Lehrdatensatz hat die Reihe 200 Werte, von P001 bis P200.`,
    figures: [
      { label: 'Werte n', value: '5' },
      { label: 'x₁ (P001)', value: h(L[0]) },
      { label: 'x₂ (P002)', value: h(L[1]) },
      { label: 'x₅ (P005)', value: h(L[4]) },
    ],
  },
  heisst: {
    sym: 'x₁, x₂, …, xₙ', say: 'x eins, x zwei bis x n',
    fach: 'Die beobachteten Werte einer Variablen, je Fall genau einer, in einer festen Reihenfolge der Fälle. xᵢ ist der Wert von Fall i, n die Zahl der Fälle.',
  },
  bausteine: [
    {
      title: 'Einen Wert je Person notieren',
      was: 'Jede befragte Person liefert genau einen Wert. Er steht in ihrer Zeile, neben ihrer Kennung.',
      warum: 'So weißt du später, von wem eine Zahl stammt. Ohne diese Zuordnung lässt sich nichts nachprüfen.',
      acht: 'Jede Person zählt genau einmal. Steht sie zweimal in der Liste, zählt sie bei jeder Rechnung doppelt.',
      concept: 'sampling',
    },
    {
      title: 'Die Personen durchnummerieren',
      was: 'Statt P001 bis P005 schreibt man kurz x₁ bis x₅. Die kleine Zahl unten heißt Index und ist die Nummer der Person.',
      rechnung: `x₁ = ${num(L[0])}; x₂ = ${num(L[1])}; x₃ = ${num(L[2])}; x₄ = ${num(L[3])}; x₅ = ${num(L[4])}`,
      warum: 'Mit dem Index kann eine Formel über jede Person sprechen, ohne sie beim Namen zu nennen. Σ xᵢ heißt dann: alle Werte zusammenzählen.',
      acht: 'Der Index ist eine Nummer, kein Messwert. x₂ heißt: der Wert der zweiten Person, nicht der Wert 2.',
      concept: 'sum',
    },
    {
      title: 'Reihenfolge und Rangfolge auseinanderhalten',
      was: `Die Datenreihe steht in der Reihenfolge der Personen. Der Größe nach sortiert entsteht eine andere Liste: ${[...L].sort((a, b) => a - b).map(v => num(v)).join('; ')}.`,
      warum: 'Für den Median brauchst du die sortierte Liste. Für alles, was zwei Spalten derselben Person verbindet, brauchst du die ursprüngliche.',
      acht: 'Sortierst du eine Spalte allein, landen Werte bei fremden Personen. Sortiere deshalb immer ganze Zeilen.',
      concept: 'sorting',
    },
    {
      title: 'Die Werte zählen',
      was: 'Die Länge der Reihe heißt n. Bei den fünf Befragten ist n = 5, im ganzen Lehrdatensatz n = 200.',
      warum: 'Durch n teilst du später, etwa beim Mittelwert. Deshalb muss klar sein, wie viele Werte wirklich da sind.',
      acht: 'Fehlt bei einer Person die Angabe, steht dort NA. Dann hat die Reihe weniger gültige Werte als Befragte.',
      concept: 'missing',
    },
  ],
  ausprobieren: [
    {
      question: 'Du sortierst die fünf Lernzeiten der Größe nach. Welcher Wert steht danach an zweiter Stelle?',
      options: [`${num(L[2])} Stunden`, `${num(L[1])} Stunden`], correct: 0, step: 3,
      explain: `Sortiert steht an zweiter Stelle ${num(L[2])}. In der Datenreihe ist x₂ aber der Wert von P002, also ${num(L[1])}. Nach dem Sortieren gehört die zweite Stelle nicht mehr zu P002.`,
      kurz: 'Sortieren ändert, wer an welcher Stelle steht.',
    },
    {
      question: `Was bedeutet x₄ = ${num(L[3])}?`,
      options: [`P004 hat ${num(L[3])} Stunden gelernt.`, `Vier Personen haben ${num(L[3])} Stunden gelernt.`, `Der viertgrößte Wert ist ${num(L[3])}.`], correct: 0, step: 2,
      explain: `Der Index 4 ist die Nummer der Person in der Reihe. x₄ ist also der Wert der vierten Person, P004. Der Größe nach steht ${num(L[3])} sogar ganz oben.`,
      kurz: 'Der Index zählt Personen, nicht Werte.',
    },
    {
      question: 'Eine sechste Person kommt dazu. Was ändert sich an der Reihe?',
      options: ['Sie wird um einen Wert länger: n = 6.', 'Alle Werte rücken der Größe nach neu ein.'], correct: 0, step: 4,
      explain: 'Die neue Person bekommt den nächsten Index, x₆. Die Werte der anderen bleiben, wo sie sind.',
      kurz: 'Neue Person, neuer Wert am Ende.',
    },
  ],
  check: {
    question: `In der Reihe steht x₂ = ${num(L[1])}. Was heißt das?`,
    options: [
      `Die zweite Person hat ${num(L[1])} Stunden gelernt.`,
      `Der zweitkleinste Wert ist ${num(L[1])}.`,
      `Zwei Personen haben ${num(L[1])} Stunden gelernt.`,
      `Jemand hat 2 mal ${num(L[1])} Stunden gelernt.`,
    ],
    correct: 0,
    right: 'Genau. Der Index 2 ist die Nummer der Person in der Reihe, hier P002.',
    diagnose: {
      1: 'Fast! Das wäre die sortierte Reihe. Die Datenreihe steht in der Reihenfolge der Personen.',
      2: 'Fast! Die 2 unten ist der Index, die Nummer der Person. Wie oft ein Wert vorkommt, zählt erst die Häufigkeitstabelle.',
      3: 'Noch nicht ganz. Der Index wird nicht mit dem Wert malgenommen. Er sagt nur, zu welcher Person der Wert gehört.',
    },
  },
  fuerDich: 'Bevor du in R etwas ausrechnest, schau dir die ersten Zeilen der Daten an. Prüfe: Steht jede Person genau einmal da, und gehört jeder Wert zur richtigen Person?',
  genau: {
    kurz: 'Eine Datenreihe ist eine Liste der beobachteten Werte einer Variablen. Ihre Ordnung folgt den Fällen, nicht der Größe.',
    paragraphs: [
      'Statistisch sind x₁ bis xₙ die beobachteten Werte einer Variablen bei n Fällen. Welche Person die Nummer 1 bekommt, ist willkürlich. Wichtig ist nur, dass die Reihenfolge für alle Variablen dieselbe bleibt.',
      'Die der Größe nach sortierte Reihe schreibt man x₍₁₎ bis x₍ₙ₎, mit Klammern um den Index. Ihre Werte heißen Ordnungsstatistiken. Median und Quantile lesen dort ab.',
      'Summe, Mittelwert und Varianz hängen nicht von der Reihenfolge ab. Zusammenhangsmaße wie die Korrelation hängen dagegen davon ab, dass xᵢ und yᵢ von derselben Person stammen.',
    ],
  },
};

/** Spalte der Auswertung (Spaltenwahl, sonst Lernzeit) und ihre Werte. */
function seriesOf(c: SampleCtx) {
  const column = role(c, 'x', 'lernzeit'), values = sampleColumn(c.rows, column), info = sampleColumnInfo(column);
  return { column, values, info, n: values.length, categories: !!columnById[column]?.categories };
}

export const seriesTabs: ConceptTabs = {
  sample: {
    kind: 'analysis',
    kurz: 'Dieselbe Idee mit allen 200 Befragten: Jede Spalte des Lehrdatensatzes ist eine Datenreihe mit einem Wert je Person.',
    value: c => seriesOf(c).n,
    result: c => {
      const { column, values, info, n, categories } = seriesOf(c), ids = c.rows.map(r => r.id);
      const first = [0, 1, 2].filter(i => i < n).map(i => `${ids[i]} (${valueText(column, values[i])})`);
      const lo = Math.min(...values), hi = Math.max(...values), top = values.indexOf(hi);
      return {
        kurz: `Die Spalte „${info.title}“ ist eine Datenreihe mit ${n} Werten, einer je Person. Sie beginnt mit ${listText(first)}.`,
        fachlich: `x₁ bis x${sub(n)} sind die Werte von „${info.title}“ in der Reihenfolge der Befragten, von ${ids[0]} bis ${ids[n - 1]}. ${categories ? `Die Codes reichen von ${valueText(column, lo)} bis ${valueText(column, hi)}.` : `Der kleinste Wert ist ${valueText(column, lo)}, der größte ${valueText(column, hi)}.`}`,
        zusatz: categories
          ? `Die Codes sind Kategorien: ${ids[0]} hat ${valueText(column, values[0])}.`
          : `${ids[top]} hat mit ${valueText(column, hi)} den größten Wert. In der Datenreihe steht er an Stelle ${top + 1}, sortiert stünde er ganz am Ende.`,
      };
    },
    voraussetzung: 'Jede Person steht genau einmal im Datensatz, und alle ihre Angaben stehen in derselben Zeile.',
    think: [
      {
        question: 'Alle Werte werden verdoppelt. Wie viele Werte hat die Reihe danach?',
        options: ['200', '400', '100'], correct: 0,
        explain: 'Jede Person behält genau einen Wert, nur sein Betrag ändert sich. Die Reihe bleibt 200 Werte lang.',
        kurz: 'Die Länge der Reihe ist die Zahl der Personen.',
        tryIt: { label: 'alle Werte verdoppeln', op: 'double', column: 'x', value: 2 },
        expect: { change: 'equals', value: 200 },
      },
    ],
  },
  r: {
    entry: 'describe', variant: 0, live: { fn: 'describe', show: ['min', 'max'] },
    outputMap: [
      { match: 'N', atlas: 'n, die Länge der Reihe', step: 4, explain: 'N zählt die gültigen Werte der Reihe: einer je Person, hier für alle 200.' },
      { match: 'Min', atlas: 'kleinster Wert x₍₁₎', step: 3, explain: 'Der kleinste Wert steht in der sortierten Reihe vorne. Von wem er stammt, verrät die Ausgabe nicht.' },
      { match: 'Max', atlas: 'größter Wert x₍ₙ₎', step: 3, explain: 'Der größte Wert steht in der sortierten Reihe hinten. In der Datenreihe kann er an jeder Stelle stehen.' },
      { match: 'Missing', atlas: 'fehlende Werte', step: 4, explain: 'Missing zählt Personen ohne gültigen Wert. Im Lehrdatensatz fehlt nichts.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie lang die Datenreihe ist? Tippe sie an.', correct: 'N',
      wrong: {
        Min: 'Fast! Das ist der kleinste Wert der Reihe. Wie viele Werte es sind, steht unter N.',
        Max: 'Fast! Das ist der größte Wert der Reihe. Wie viele Werte es sind, steht unter N.',
        Missing: 'Fast! Missing zählt fehlende Angaben. Die gültigen Werte zählt N.',
      },
    },
  },
  next: {
    next: { id: 'pairs', why: 'Zwei Datenreihen derselben Personen, Zeile für Zeile verbunden: So entstehen Wertepaare.' },
    before: [
      { id: 'sampling', why: 'Die Befragten einer Stichprobe liefern die Werte der Reihe.' },
      { id: 'operationalization', why: 'Die Messregel legt fest, was eine Zahl in der Reihe bedeutet.' },
    ],
    after: [
      { id: 'mean', why: 'Alle Werte der Reihe zusammenzählen und durch n teilen.' },
      { id: 'frequency', why: 'Zählt, wie oft jeder Wert in der Reihe vorkommt.' },
      { id: 'sorting', why: 'Ordnet die Reihe der Größe nach, ohne die Personen zu verlieren.' },
    ],
    more: [{ id: 'missing', why: 'Fehlt bei einer Person die Angabe, steht in der Reihe NA.' }],
  },
};
