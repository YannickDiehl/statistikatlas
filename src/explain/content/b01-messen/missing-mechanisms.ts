// Begriffskarte „Warum fehlen Angaben?“ (missing_mechanisms): MCAR, MAR, MNAR. Beispiel: ALLBUS 2023 (Fragebogensplit
// beim Vertrauen in den Bundestag, fehlende Einkommen) und ein Gedankenexperiment mit dem Lehrdatensatz: Die Befragten
// mit dem höchsten Haushaltseinkommen verschweigen ihre Angabe (Regler). Vorlage: Begriffskarte (Annahmen, keine Rechnung).
// Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num, signed, unit } from '../../format';
import { baseSurvey, sampleColumn } from '../../sample';
import { mean, role } from './shared';
import { ALLBUS_INC } from './missing';

/**
 * ALLBUS 2023, ungewichtet: Den Fragebogen füllten 3.243 Befragte selbst aus (CAWI, MAIL; splt23_1 = 1 oder 2), 2.003 wurden
 * persönlich befragt (CAPI, splt23_1 = −15). Nur unter den Selbstausfüllern war der Fragebogen geteilt: 1.596 (Split B) bekamen
 * die Frage nach dem Vertrauen in den Bundestag (pt03) nicht. Vertrauen im Schnitt: persönlich 4,0604, Split A 3,8090.
 */
export const ALLBUS_SPLIT = { nichtGefragt: 1596, selbst: 3243, persoenlich: 2003, n: 5246, vertrauenPersoenlich: 4.0604, vertrauenSplitA: 3.8090 } as const;

/** Mittelwert ohne die `k` größten Werte (die Spitzenverdiener verschweigen ihre Angabe). */
export function ohneSpitze(values: readonly number[], k: number) {
  const rest = [...values].sort((a, b) => a - b).slice(0, values.length - k);
  return { n: rest.length, m: mean(rest), bias: mean(rest) - mean(values) };
}
/** Mittelwert ohne jede zehnte Person (P010, P020 bis P200): Fehlen ohne Muster. */
export const ohneJedeZehnte = (values: readonly number[]) => mean(values.filter((_, i) => (i + 1) % 10 !== 0));

const EIN = () => baseSurvey().map(r => r.values.einkommen);
const eur = (v: number) => `${num(v)} €`;

export const missingMechanisms: ConceptCard = {
  concept: 'missing_mechanisms',
  picture: 'b01-fehlmuster',
  wofuer: 'Dass Angaben fehlen, ist noch kein Problem. Schwierig wird es, wenn sie aus einem bestimmten Grund fehlen. Ob die übrigen Antworten das Bild verzerren, hängt davon ab, warum die anderen schweigen.',
  kurz: 'Fehlen Angaben rein zufällig, bleiben die Ergebnisse im Schnitt richtig. Fehlen sie gerade wegen des fehlenden Werts, etwa weil hohe Einkommen verschwiegen werden, verzerren die übrigen Antworten das Bild.',
  stellDirVor: {
    text: `Im ALLBUS 2023 füllten ${count(ALLBUS_SPLIT.selbst)} Befragte den Fragebogen selbst aus, online oder auf Papier. Er war in zwei Versionen aufgeteilt, und ${count(ALLBUS_SPLIT.nichtGefragt)} von ihnen bekamen die Version ohne die Frage nach dem Vertrauen in den Bundestag. Beide Gruppen sind nach Alter, Bildung und Wohnort gleich zusammengesetzt. Ob jemand dort fehlt, hat deshalb mit seinem Vertrauen nichts zu tun. Beim eigenen Nettoeinkommen ist das anders: ${ALLBUS_INC.fehlend} Befragte machten keine Angabe oder verweigerten sie, vielleicht gerade wegen der Höhe ihres Einkommens.`,
    figures: [
      { label: 'Selbst ausgefüllt', value: count(ALLBUS_SPLIT.selbst) },
      { label: 'Bundestag: nicht gefragt', value: count(ALLBUS_SPLIT.nichtGefragt) },
      { label: 'Einkommen: keine Angabe oder verweigert', value: String(ALLBUS_INC.fehlend) },
    ],
  },
  regler: {
    label: 'Wie viele Befragte mit dem höchsten Haushaltseinkommen verschweigen ihre Angabe?', min: 0, max: 40, step: 1, initial: 20,
    format: v => unit(v, 'Person', 'Personen', 0),
    describe: v => {
      const all = mean(EIN()), k = Math.round(v);
      if (k <= 0) return `Fehlt niemand, liegt der Mittelwert bei ${eur(all)}: dem Wert aller 200 Befragten.`;
      const o = ohneSpitze(EIN(), k);
      return `${k === 1 ? 'Fehlt die Person' : `Fehlen die ${k} Befragten`} mit dem höchsten Einkommen, liegt der Mittelwert der übrigen ${o.n} bei ${eur(o.m)} statt ${eur(all)}: ${eur(-o.bias)} zu niedrig.`;
    },
  },
  heisst: {
    sym: 'MCAR, MAR, MNAR', say: 'M C A R, M A R, M N A R',
    fach: 'MCAR (missing completely at random): Das Fehlen hängt mit nichts zusammen. MAR (missing at random): Es hängt nur mit beobachteten Angaben zusammen. MNAR (missing not at random): Es hängt auch dann noch vom fehlenden Wert selbst ab.',
  },
  bausteine: [
    {
      title: 'Rein zufälliges Fehlen erkennen',
      was: 'Wer fehlt, fehlt ohne jedes Muster, etwa weil der Zufall die Version des Fragebogens bestimmt hat.',
      rechnung: `Fehlt im Lehrdatensatz jede zehnte Person (P010, P020 bis P200), liegt der Mittelwert des Haushaltseinkommens der übrigen bei ${eur(ohneJedeZehnte(EIN()))} statt ${eur(mean(EIN()))}.`,
      warum: 'Die übrigen sind dann selbst eine Zufallsauswahl. Der Mittelwert bleibt im Schnitt richtig, er wird nur ungenauer.',
      acht: 'Rein zufälliges Fehlen lässt sich selten belegen. Ein Fragebogensplit, den der Zufall zuteilt, ist der klare Fall, aber nur unter denen, die geteilt wurden.',
      concept: 'random_sampling',
    },
    {
      title: 'Erklärbares Fehlen erkennen',
      was: 'Ältere lassen die Einkommensfrage vielleicht häufiger aus. Innerhalb jeder Altersgruppe fehlt die Angabe aber zufällig.',
      warum: 'Weil das Alter bekannt ist, lässt sich das Fehlen berücksichtigen, etwa mit Gewichten oder Ersetzungsmodellen.',
      acht: 'Nur vollständige Fälle auszuwerten, reicht dann nicht von selbst. Die Altersgruppen sind sonst falsch gemischt.',
      concept: 'weights',
    },
    {
      title: 'Fehlen wegen des Werts selbst erkennen',
      was: 'Wer sehr viel verdient, verschweigt sein Einkommen häufiger. Dann hängt das Fehlen vom fehlenden Wert ab.',
      rechnung: `Verschweigen die 20 Befragten mit dem höchsten Einkommen ihre Angabe, sinkt der Mittelwert der übrigen von ${eur(mean(EIN()))} auf ${eur(ohneSpitze(EIN(), 20).m)}.`,
      warum: 'Die übrigen sind dann keine faire Auswahl mehr. Weder Weglassen noch Ersetzen durch den Mittelwert behebt das.',
      acht: 'Ob MAR oder MNAR vorliegt, lässt sich aus den Daten allein nicht entscheiden.',
      concept: 'sampling_bias',
    },
  ],
  ausprobieren: [
    {
      question: 'Ein Fragebogen wurde per Zufall in zwei Versionen verteilt. Wer eine Frage nicht bekam, fehlt dort. Ist der Mittelwert der übrigen verzerrt?',
      options: ['nein, nur etwas ungenauer', 'ja, deutlich'], correct: 0, step: 1,
      explain: 'Der Zufall hat entschieden, wer fehlt. Die übrigen sind deshalb eine Zufallsauswahl, und ihr Mittelwert trifft im Schnitt den aller Befragten.',
      kurz: 'Zufälliges Fehlen kostet Genauigkeit, keine Richtigkeit.',
    },
    {
      question: 'Bei einer Frage fehlen vor allem die Antworten von Personen mit hohem Einkommen. Wie liegt der Mittelwert der vollständigen Fälle?',
      options: ['zu niedrig', 'richtig', 'zu hoch'], correct: 0, step: 3,
      explain: `Die hohen Werte fehlen, also fehlt oben etwas. Im Lehrdatensatz sind es bei 20 fehlenden Spitzenverdienern ${eur(-ohneSpitze(EIN(), 20).bias)} zu wenig. Schieb den Regler und schau zu.`,
      kurz: 'Wer fehlt, bestimmt die Richtung der Verzerrung.',
    },
    {
      question: 'Du ersetzt die fehlenden Einkommen durch den Mittelwert der anderen. Ist die Verzerrung damit weg?',
      options: ['nein', 'ja'], correct: 0, step: 3,
      explain: 'Der Ersatzwert ist selbst zu niedrig, denn er stammt aus den übrigen. Die Verzerrung bleibt, und die Streuung wird zusätzlich zu klein.',
      kurz: 'Ersetzen durch den Mittelwert repariert kein selektives Fehlen.',
    },
  ],
  check: {
    question: 'Wer nicht gewählt hat, beantwortet die Frage nach der Wahlteilnahme seltener. Welcher Fall liegt vor?',
    options: [
      'MNAR: Das Fehlen hängt vom fehlenden Wert selbst ab.',
      'MCAR: Die Angaben fehlen rein zufällig.',
      'MAR: Das Fehlen hängt nur von bekannten Angaben ab.',
      'Kein Problem, wenn genug Personen antworten.',
    ],
    correct: 0,
    right: 'Genau. Ob jemand antwortet, hängt von der Antwort selbst ab, und die Wahlbeteiligung wird zu hoch geschätzt.',
    diagnose: {
      1: 'Fast! Hier fehlen vor allem Nichtwählerinnen und Nichtwähler. Das ist ein Muster, kein Zufall.',
      2: 'Fast! Das Fehlen hängt von der Wahlteilnahme selbst ab, und genau die ist unbekannt.',
      3: 'Fast! Mehr Antworten ändern nichts daran, wer fehlt. Die Verzerrung bleibt.',
    },
  },
  fuerDich: 'Wenn in deinen Daten Angaben fehlen, schreib auf, wie viele und warum. Vergleiche die Fehlenden mit den anderen bei bekannten Merkmalen wie Alter oder Bildung.',
  genau: {
    kurz: 'MCAR, MAR und MNAR sind Annahmen darüber, wovon das Fehlen abhängt. Welche zutrifft, entscheidet, welche Auswertung vertretbar ist.',
    paragraphs: [
      'Formal ist M das Muster der fehlenden Angaben, Y_obs sind die beobachteten und Y_mis die fehlenden Werte. MCAR heißt P(M | Y_obs, Y_mis) = P(M), MAR heißt P(M | Y_obs, Y_mis) = P(M | Y_obs).',
      'MNAR liegt vor, wenn das Fehlen auch nach Berücksichtigung aller beobachteten Angaben vom fehlenden Wert abhängt. Beispiel: Fehlende Einkommen hängen zusätzlich von der nicht angegebenen Einkommenshöhe ab.',
      'MAR und MNAR lassen sich aus den beobachteten Daten allein im Allgemeinen nicht unterscheiden. MAR rechtfertigt weder pauschal die Auswertung vollständiger Fälle noch das Ersetzen durch den Mittelwert; passende Modelle wie die multiple Imputation und Sensitivitätsanalysen bleiben nötig.',
      `Die ${count(ALLBUS_SPLIT.persoenlich)} persönlich Befragten bekamen die Frage alle. Über alle ${count(ALLBUS_SPLIT.n)} Befragten hängt das Fehlen deshalb vom Erhebungsweg ab, und persönlich Befragte antworten im Schnitt höher (${num(ALLBUS_SPLIT.vertrauenPersoenlich)} gegen ${num(ALLBUS_SPLIT.vertrauenSplitA)}, ungewichtet). Über alle gesehen ist das Fehlen also MAR: Es hängt an einer bekannten Angabe, dem Erhebungsweg.`,
      'Die Szenarien mit dem Lehrdatensatz sind Gedankenexperimente: Dort fehlt in Wahrheit keine Angabe.',
    ],
  },
};

function spitzeOf(c: SampleCtx) {
  const values = sampleColumn(c.rows, role(c, 'x', 'einkommen'));
  return { values, all: mean(values), top: ohneSpitze(values, 20), ten: ohneJedeZehnte(values) };
}

export const missingMechanismsTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'einkommen' },
    kurz: 'Dasselbe Gedankenexperiment mit allen 200 Befragten: Die 20 mit dem höchsten Haushaltseinkommen verschweigen ihre Angabe.',
    value: c => spitzeOf(c).top.bias,
    result: c => {
      const { all, top, ten } = spitzeOf(c);
      return {
        kurz: `Verschweigen die 20 Befragten mit dem höchsten Haushaltseinkommen ihre Angabe, liegt der Mittelwert der übrigen ${top.n} bei ${eur(top.m)} statt ${eur(all)}. Das sind ${eur(-top.bias)} zu wenig.`,
        fachlich: `Szenario MNAR: Ausschluss der 20 höchsten Werte, vollständige Fälle n = ${top.n}; Verzerrung des Mittelwerts ${signed(top.bias)} €.`,
        zusatz: `Fehlt stattdessen jede zehnte Person (P010, P020 bis P200), liegt der Mittelwert bei ${eur(ten)}.`,
      };
    },
    voraussetzung: 'Ein Gedankenexperiment: Im Lehrdatensatz fehlt keine Angabe. Welcher Fall in echten Daten vorliegt, lässt sich aus den Daten allein meist nicht entscheiden.',
    think: [
      {
        question: 'Alle verdienen 100 € mehr. Was passiert mit der Verzerrung durch die 20 Fehlenden?',
        options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: `Alle rücken um 100 €, die Fehlenden und die übrigen gleich. In den Ausgangsdaten bleiben es ${eur(-ohneSpitze(EIN(), 20).bias)} zu wenig.`,
        kurz: 'Verschieben ändert nicht, wer fehlt.',
        tryIt: { label: 'alle 100 € mehr', op: 'shift', column: 'x', value: 100 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle Einkommen verdoppeln sich. Was passiert mit der Verzerrung?',
        options: ['verdoppelt sich', 'bleibt gleich'], correct: 0,
        explain: 'Alle Abstände verdoppeln sich, auch der zwischen den Fehlenden und den übrigen. Die Verzerrung wächst mit den Werten.',
        kurz: 'Die Verzerrung hat die Einheit der Daten.',
        tryIt: { label: 'alle Einkommen verdoppeln', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  next: {
    next: { id: 'missing_tools', why: 'Die Werkzeuge in R, um Missing-Codes zu markieren und zu zählen.' },
    before: [{ id: 'missing', why: 'Was fehlende Angaben sind und wie R sie behandelt.' }],
    after: [
      { id: 'sampling_bias', why: 'Selektives Fehlen verzerrt Schätzungen wie eine schiefe Stichprobe.' },
      { id: 'weights', why: 'Gewichte können erklärbares Fehlen teilweise ausgleichen.' },
    ],
    more: [{ id: 'random_sampling', why: 'Zufall macht die übrigen Fälle vergleichbar, bei der Auswahl wie beim Fehlen.' }],
  },
};
