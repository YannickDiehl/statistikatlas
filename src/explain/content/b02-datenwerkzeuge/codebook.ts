// Begriffskarte „Codebuch & Variablensuche“: ALLBUS 2023 (nur Aggregate und Metadaten) als Beispiel, dazu
// codebook() und find_var() aus mariposa 0.7.4 auf dem Lehrdatensatz. In R nachgerechnet, siehe
// ./b02-datenwerkzeuge.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num } from '../../format';
import { columnById } from '../../../domain/survey';
import { savVariableLabel } from '../../../domain/savWriter';
import { ALLBUS, spalte } from './daten';

const P = ALLBUS.pt03;
const minus11 = P.codes.find(c => c.code === -11)!;

export const codebook: ConceptCard = {
  concept: 'codebook',
  wofuer: 'Du öffnest einen Datensatz und siehst Spalten wie pt03 oder erwerbstaetig, darin Zahlen wie 1, 4 oder −11. Was wurde gefragt, und was heißt der Code? Das steht im Codebuch.',
  kurz: 'Ein Codebuch ist der Beipackzettel deiner Daten: Es sagt zu jeder Spalte, was gefragt wurde und was die Codes bedeuten. Mit einer Suche findest du die passende Spalte, ohne alle Namen zu kennen.',
  stellDirVor: {
    text: `Der ALLBUS 2023 hat ${count(ALLBUS.befragte)} Befragte und ${ALLBUS.spalten} Spalten. Eine davon heißt pt03; in ihr stehen Zahlen von 1 bis 7, aber auch −42, −11 und −9. Erst das Codebuch verrät: pt03 ist das Vertrauen in den Bundestag, 1 heißt gar kein Vertrauen, 7 großes Vertrauen. Die negativen Codes sind fehlende Angaben, etwa −11 bei Befragten, denen die Frage nicht gestellt wurde. Gefunden hast du die Spalte mit find_var("Bundestag").`,
    figures: [
      { label: 'Befragte', value: count(ALLBUS.befragte) },
      { label: 'Spalten', value: String(ALLBUS.spalten) },
      { label: 'pt03', value: 'Vertrauen in den Bundestag' },
      { label: 'gültige Antworten (ungewichtet)', value: count(P.gueltig) },
    ],
  },
  heisst: {
    fach: 'Ein Codebuch dokumentiert für jede Variable Namen, Variablenlabel (Fragetext), Datentyp, Wertelabels, Codes für fehlende Angaben und Häufigkeiten. find_var() durchsucht Namen und Variablenlabels nach einem Muster.',
  },
  bausteine: [
    {
      title: 'Die Frage hinter der Spalte nachschlagen',
      was: 'Zu jedem Spaltennamen nennt das Codebuch den Fragetext. Hinter erwerbstaetig steht: „Sind Sie gegenwärtig erwerbstätig?“',
      warum: 'Spaltennamen sind kurz und oft rätselhaft. Erst der Fragetext sagt, was gemessen wurde.',
      acht: 'Ähnliche Namen heißen nicht dasselbe. Lies den Fragetext, bevor du rechnest.',
      concept: 'labels',
    },
    {
      title: 'Die Codes übersetzen',
      was: 'Das Codebuch nennt zu jedem Code seinen Antworttext. Bei finanzlage heißt 1 „Sehr schwer“ und 5 „Sehr leicht“.',
      warum: 'Erst mit den Antworttexten weißt du, in welche Richtung eine Skala läuft.',
      acht: 'Codes sind nicht immer Mengen. Beim Schulabschluss ist Code 4 nicht doppelt so viel Bildung wie Code 2.',
      concept: 'nominal',
    },
    {
      title: 'Nachsehen, welche Werte vorkommen',
      was: 'Das Codebuch zählt die Werte jeder Spalte und die fehlenden Angaben. Die Lernzeit reicht von 0 bis 18,4 Stunden, mit 99 verschiedenen Werten.',
      warum: 'So fallen Tippfehler und Sondercodes auf, bevor sie in eine Rechnung geraten.',
      acht: 'Ein Wert wie −9 oder 99 ist oft keine echte Antwort, sondern ein Code für keine Angabe. Prüfe das im Codebuch.',
      concept: 'frequency',
    },
    {
      title: 'Die passende Spalte suchen',
      was: 'find_var() sucht in Namen und Labels, also den Fragetexten. find_var("lern") findet im Lehrdatensatz sechs Spalten, von lernzeit bis quelle_kurs.',
      warum: 'Große Datensätze haben Hunderte Spalten. Eine Suche nach einem Stichwort ist schneller als Blättern.',
      acht: 'find_var() sucht Buchstabenfolgen, keine Bedeutungen. „Bildung“ findet die Weiterbildung, aber nicht den Schulabschluss.',
    },
  ],
  ausprobieren: [
    {
      question: `In pt03 steht bei ${count(minus11.n)} Befragten der Code −11. Was heißt das?`,
      options: ['sehr wenig Vertrauen', 'die Frage wurde ihnen nicht gestellt', 'ein Tippfehler'], correct: 1, step: 3,
      explain: 'Das Codebuch nennt −11 „TNZ: SPLIT“: trifft nicht zu, weil diese Befragten eine andere Fassung des Fragebogens bekamen. Wer −11 als Zahl mitrechnet, verfälscht den Durchschnitt.',
      kurz: 'Negative Codes sind im ALLBUS fehlende Angaben, jede mit eigenem Grund.',
    },
    {
      question: 'find_var("lern") findet auch quelle_buch. Warum?',
      options: ['der Name enthält lern', 'das Label enthält Lern', 'find_var() irrt sich'], correct: 1, step: 4,
      explain: 'Der Name quelle_buch enthält kein lern, aber sein Label lautet „Lernquelle Buch“. find_var() sucht in beidem und achtet nicht auf Groß- und Kleinschreibung.',
      kurz: 'Gesucht wird in Namen und Labels.',
    },
  ],
  check: {
    question: 'In einer Spalte findest du den Wert 99. Was tust du zuerst?',
    options: [
      'Ich rechne mit 99 wie mit jedem anderen Wert.',
      'Ich schaue im Codebuch nach, ob 99 ein Code für eine fehlende Angabe ist.',
      'Ich lösche alle Zeilen mit 99.',
      'Ich ersetze 99 durch den Mittelwert.',
    ],
    correct: 1,
    right: 'Genau. Erst klärst du, was 99 bedeutet, dann entscheidest du, wie du damit rechnest.',
    diagnose: {
      0: 'Fast! 99 kann ein Sondercode sein, etwa für weiß nicht. Dann verfälscht er jede Rechnung.',
      2: 'Fast! Ohne Codebuch weißt du nicht, ob 99 eine echte Antwort ist. Vielleicht ist jemand 99 Jahre alt.',
      3: 'Noch nicht ganz. Erst klärst du, was 99 bedeutet. Werte zu ersetzen ist eine eigene, heikle Entscheidung.',
    },
  },
  fuerDich: 'Bevor du eine Spalte auswertest, schlag sie im Codebuch nach: Fragetext, Codes, fehlende Angaben. Das kostet eine Minute und bewahrt dich vor den häufigsten Fehlern in Hausarbeiten.',
  genau: {
    kurz: 'Ein Codebuch beschreibt Daten, es verändert sie nicht. In R baut codebook() es aus den Metadaten, die read_spss() mit eingelesen hat.',
    paragraphs: [
      'codebook(view = FALSE) druckt eine Übersicht in die Konsole; summary() zeigt dazu jede Variable mit Label, Werten und Wertelabels. Mit view = TRUE öffnet sich das Codebuch als HTML-Seite.',
      'find_var(muster, search = "name_label") durchsucht Namen und Variablenlabels; search = "name" oder search = "label" schränkt die Suche ein. Die Spalte col nennt die Position im Datensatz.',
      'Große Erhebungen wie der ALLBUS veröffentlichen ihr Codebuch zusätzlich als PDF, mit Fragebogen, Filterführung und Hinweisen zur Gewichtung. Was dort steht, geht über die Metadaten der Datei hinaus.',
      'Ein Codebuch lässt sich weitergeben: codebook(view = FALSE) und danach write_xlsx("codebuch.xlsx") schreibt es in eine Excel-Datei.',
    ],
  },
};

const SKALA = { nominal: 'nominal', ordinal: 'ordinal', metric: 'metrisch' } as const;
/** Label mit Satzzeichen am Ende, damit es im Text einen Satz abschließt. */
const satz = (label: string) => /[.?!]$/.test(label) ? `„${label}“` : `„${label}“.`;

/** Codebuch-Eintrag der gewählten Spalte aus den aktuellen Daten. */
export function eintrag(c: SampleCtx) {
  const { id, values } = spalte(c, 'lernzeit'), col = columnById[id];
  const gueltig = values.filter(Number.isFinite), verschieden = new Set(gueltig).size;
  const haeufig = (col.categories ?? []).map(k => ({ ...k, n: gueltig.filter(v => v === k.value).length }));
  return { id, col, label: savVariableLabel(col), n: gueltig.length, fehlend: values.length - gueltig.length, verschieden, min: Math.min(...gueltig), max: Math.max(...gueltig), haeufig };
}

export const codebookTabs: ConceptTabs = {
  sample: {
    kind: 'analysis',
    kurz: 'Dein Codebuch-Eintrag für eine Spalte der 200 Befragten: Label, Werte und fehlende Angaben. Wähle oben eine andere Spalte, um sie nachzuschlagen.',
    value: c => eintrag(c).verschieden,
    result: c => {
      const e = eintrag(c), fehlt = e.fehlend === 0 ? 'Es fehlt keine Angabe.' : `${e.fehlend} Angaben fehlen.`;
      if (e.haeufig.length) {
        const top = Math.max(...e.haeufig.map(k => k.n)), meist = e.haeufig.filter(k => k.n === top).map(k => `„${k.label}“`).join(' und ');
        const benutzt = e.haeufig.filter(k => k.n > 0).length, first = e.haeufig[0], last = e.haeufig[e.haeufig.length - 1];
        return {
          kurz: `Die Spalte ${e.id} trägt das Label ${satz(e.label)} Die ${e.n} Befragten verteilen sich auf ${benutzt} von ${e.haeufig.length} Antworten; am häufigsten ist ${meist} mit ${top}. ${fehlt}`,
          fachlich: `Variable ${e.id}, ${SKALA[e.col.scale]}, Typ lbl+dbl mit Wertelabels von ${first.value} = ${first.label} bis ${last.value} = ${last.label}; ${e.n} gültige Werte, ${e.verschieden} verschiedene.`,
          zusatz: `Code ${first.value} heißt „${first.label}“, Code ${last.value} heißt „${last.label}“.`,
        };
      }
      const u = e.col.unit ? ` ${e.col.unit}` : '';
      return {
        kurz: `Die Spalte ${e.id} trägt das Label ${satz(e.label)} Die Antworten reichen von ${num(e.min)} bis ${num(e.max)}${u}, mit ${e.verschieden} verschiedenen Werten. ${fehlt}`,
        fachlich: `Variable ${e.id}, ${SKALA[e.col.scale]}, Typ dbl ohne Wertelabels; ${e.n} gültige Werte, ${e.verschieden} verschiedene, kleinster ${num(e.min)}, größter ${num(e.max)}.`,
        zusatz: `Erlaubt sind Werte von ${num(e.col.min)} bis ${num(e.col.max)}${u}; alles außerhalb wäre ein Code oder ein Tippfehler.`,
      };
    },
    voraussetzung: 'Das Codebuch beschreibt die Daten, wie sie gerade sind. Nach Änderungen zeigt es die neuen Werte.',
    think: [
      {
        question: 'Du polst die Spalte um. Was passiert mit der Zahl verschiedener Werte im Codebuch?',
        options: ['sie bleibt gleich', 'sie steigt', 'sie sinkt'], correct: 0,
        explain: 'Umpolen spiegelt jeden Wert: Aus zwei verschiedenen Werten werden wieder zwei verschiedene. Das Codebuch zählt danach genauso viele, nur andere.',
        kurz: 'Umpolen ändert die Werte, nicht ihre Vielfalt.',
        tryIt: { label: 'die Spalte umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle hätten den Wert 0. Wie viele verschiedene Werte zählt das Codebuch dann?',
        options: ['1', '0', '200'], correct: 0,
        explain: 'Alle haben denselben Wert, also gibt es genau einen. Das Codebuch zeigt so etwas sofort: Eine Spalte ohne Unterschiede taugt für keinen Vergleich.',
        kurz: 'Ein einziger Wert heißt: keine Unterschiede.',
        tryIt: { label: 'alle auf 0', op: 'constant', column: 'x', value: 0 },
        expect: { change: 'equals', value: 1 },
      },
    ],
  },
  r: {
    entry: 'codebook', variant: 0,
    tokens: {
      codebook: { sym: 'codebook()', term: 'Codebuch & Variablensuche', kurz: 'Baut aus den Metadaten ein Codebuch: Fragetexte, Typen, Werte und Wertelabels jeder Spalte.', fehler: 'Fehlt atlas %>% davor, meldet mariposa: Argument `data` is missing, with no default.' },
      view: { sym: 'view =', term: 'Ansicht', kurz: 'FALSE druckt nur die Übersicht in die Konsole. TRUE öffnet das Codebuch als HTML-Seite.', fehler: 'Mit großem V meldet mariposa: Unknown argument `View` of `codebook()`. R unterscheidet Groß- und Kleinschreibung.' },
    },
    outputMap: [
      { match: '29 variables', atlas: '29 Spalten', explain: 'So viele Spalten hat der Lehrdatensatz: 28 Fragen und die Kennung id.' },
      { match: '200 observations', atlas: '200 Befragte', step: 3, explain: 'Jede Zeile ist eine befragte Person.' },
      { match: '29 labelled', atlas: 'Spalten mit Variablenlabel', step: 1, explain: 'Alle 29 Spalten tragen einen Fragetext oder eine Beschreibung, auch die Kennung id.' },
      { match: '19 lbl+dbl', atlas: 'Spalten mit Wertelabels', step: 2, explain: '19 Spalten speichern Codes mit Antworttexten, etwa erwerbstaetig mit 0 = Nein und 1 = Ja.' },
      { match: '9 dbl', atlas: 'Zahlen ohne Antworttexte', step: 3, explain: '9 Spalten sind gewöhnliche Zahlen wie lernzeit oder einkommen. Dort zählt der Wert selbst.' },
    ],
    check: {
      question: 'Wie viele Spalten haben Antworttexte, also Wertelabels? Tippe es an.', correct: '19 lbl+dbl',
      wrong: {
        '29 labelled': 'Fast! labelled zählt die Spalten mit Fragetext, dem Variablenlabel. Antworttexte haben die 19 Spalten vom Typ lbl+dbl.',
        '9 dbl': 'Fast! Das sind die Spalten mit gewöhnlichen Zahlen, ohne Antworttexte.',
      },
    },
  },
  next: {
    next: { id: 'data_import', why: 'Mit read_spss() kommen die Fragetexte und Antworttexte des Codebuchs gleich mit nach R.' },
    before: [
      { id: 'labels', why: 'Fragetexte und Antworttexte, die das Codebuch sammelt.' },
      { id: 'frequency', why: 'Zählt, wie oft jeder Wert vorkommt; das Codebuch zeigt es für jede Spalte.' },
    ],
    after: [{ id: 'missing_tools', why: 'Codes, die das Codebuch als fehlend ausweist, markierst du mit set_na().' }],
    more: [
      { id: 'series', why: 'Jede Spalte im Codebuch ist eine Datenreihe mit einem Wert je Person.' },
      { id: 'data_export', why: 'Mit write_xlsx() geht das Codebuch als Excel-Datei weiter.' },
    ],
  },
};
