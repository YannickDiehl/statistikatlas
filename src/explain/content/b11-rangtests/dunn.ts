// Begriffskarte „Dunn-Vergleiche“ (B11): finanzielle Lage nach Schulabschluss im Lehrdatensatz, gemeinsame Ränge aus
// Kruskal–Wallis, z je Paar und Holm-Korrektur wie mariposa::dunn_test(p_adjust = "holm"). Zahlen aus R in b11-rangtests.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { byGroup, dunn } from './rank';
import { SCHOOL } from './posthoc';
import { pText } from './words';

/** Kleinstes ungeschütztes p der Dunn-Vergleiche im Lehrdatensatz (Ohne Schulabschluss gegen Fachhochschulreife). */
export const DUNN_MIN_P = 0.006019911;

export const dunnCard: ConceptCard = {
  concept: 'dunn_test',
  wofuer: 'Im Lehrdatensatz kommen Befragte mit verschiedenen Schulabschlüssen unterschiedlich gut mit ihrem Haushaltseinkommen aus. Gäbe es keine Unterschiede, käme ein so großes H nach Kruskal–Wallis nur in etwa 2 von 100 Stichproben vor. Aber welche Abschlüsse unterscheiden sich? Die Dunn-Vergleiche prüfen jedes Paar über dieselben Ränge.',
  kurz: 'Die Dunn-Vergleiche prüfen nach Kruskal–Wallis jedes Paar von Gruppen über ihre mittleren Ränge. Die p-Werte werden für die Zahl der Vergleiche korrigiert.',
  stellDirVor: {
    text: 'Die Gruppe Fachhochschulreife hat den höchsten mittleren Rang (119,23), die Gruppe Mittlerer Abschluss den niedrigsten (84,38). Ohne Schutz sähen zwei Paare auffällig aus, beide mit p ≈ 0,006. Nach der Holm-Korrektur für zehn Vergleiche steigt ihr p auf 0,06, und bei keinem Paar liegt das p mehr unter α = 0,05.',
    figures: [
      { label: 'Kruskal–Wallis H', value: '11,59' },
      { label: 'Paare', value: '10' },
      { label: 'kleinstes p ohne Schutz', value: '0,006' },
      { label: 'kleinstes p nach Holm', value: '0,06' },
    ],
  },
  heisst: {
    sym: 'z', say: 'z',
    fach: 'Der Dunn-Test vergleicht zwei mittlere Ränge aus der gemeinsamen Rangreihe aller Gruppen: z = (R̄ᵢ − R̄ⱼ) / SE, mit Bindungskorrektur im Standardfehler. Die p-Werte werden anschließend für die Familie der Vergleiche korrigiert, hier nach Holm.',
  },
  bausteine: [
    {
      title: 'Die Ränge aus Kruskal–Wallis übernehmen',
      was: 'Alle 200 Befragten stehen schon in einer gemeinsamen Reihe. Dunn vergleicht die mittleren Ränge zweier Gruppen, ohne neu zu ordnen.',
      warum: 'So passen Gesamttest und Paarvergleiche zusammen: Beide sehen dieselben Ränge.',
      acht: 'Das ist nicht dasselbe wie ein Mann–Whitney-U-Test je Paar. Der ordnet für jedes Paar nur die beiden Gruppen neu.',
      concept: 'kruskal_wallis',
    },
    {
      title: 'Den Abstand zweier mittlerer Ränge messen',
      was: 'Für jedes Paar teilt Dunn den Abstand der mittleren Ränge durch seinen Standardfehler. Das ergibt z.',
      rechnung: 'Ohne Schulabschluss gegen Fachhochschulreife: (85,43 − 119,23) / 12,31 ≈ −2,75.',
      warum: 'Der Standardfehler sagt, wie weit zwei mittlere Ränge ohne echten Unterschied üblicherweise auseinanderliegen.',
      acht: 'Das Vorzeichen zeigt nur die Richtung: Negativ heißt, die erste Gruppe hat den kleineren mittleren Rang.',
      concept: 'se',
    },
    {
      title: 'Die p-Werte für zehn Vergleiche korrigieren',
      was: 'Holm macht kleine p-Werte größer, und zwar das kleinste am stärksten. Danach vergleichst du wie gewohnt mit α.',
      rechnung: 'Das kleinste p mal 10, das zweitkleinste mal 9 und so weiter, nie kleiner als das vorige: 0,006 · 10 ≈ 0,06.',
      warum: 'So bleibt die Wahrscheinlichkeit, irgendwo einen Unterschied zu melden, den es nicht gibt, für alle zehn Vergleiche zusammen höchstens α.',
      acht: 'Ein Gesamttest mit p unter α garantiert kein auffälliges Paar. Hier liegt das p von Kruskal–Wallis unter α = 0,05, nach der Korrektur aber bei keinem einzigen Paar.',
      concept: 'multiplicity',
    },
  ],
  ausprobieren: [
    {
      question: 'Kruskal–Wallis ist bei α = 0,05 signifikant. Muss dann mindestens ein Paar auffällig sein?', options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Hier nicht: Das p von Kruskal–Wallis liegt unter α, nach der Korrektur aber bei keinem einzigen Paar. Der Gesamttest bündelt kleine Unterschiede, die einzeln zu schwach sind.',
      kurz: 'Gesamttest und Paare beantworten verschiedene Fragen.',
    },
    {
      question: 'Mit fünf statt zehn Vergleichen: Wird das korrigierte p des auffälligsten Paars kleiner oder größer?', options: ['kleiner', 'gleich', 'größer'], correct: 0, step: 3,
      explain: 'Weniger Vergleiche, mildere Korrektur: 0,006 · 5 ≈ 0,03. Das läge unter α = 0,05. Stell den Regler auf 5.',
      kurz: 'Jeder zusätzliche Vergleich kostet Schärfe.',
    },
    {
      question: 'Warum ordnet Dunn nicht für jedes Paar neu?', options: ['damit alle Paare dieselben Ränge wie der Gesamttest nutzen', 'weil Neuordnen nicht erlaubt ist', 'weil es schneller geht'], correct: 0, step: 1,
      explain: 'Gesamttest und Paarvergleiche sollen dieselben Daten auf dieselbe Weise sehen. Neu geordnete Paare hätten ihre eigenen Ränge und passten nicht mehr zu H.',
      kurz: 'Eine Reihe für alle Vergleiche.',
    },
  ],
  regler: {
    label: 'Wie viele Vergleiche werden korrigiert?',
    min: 1, max: 10, step: 1, initial: 10,
    format: v => `${Math.round(v)} ${Math.round(v) === 1 ? 'Vergleich' : 'Vergleiche'}`,
    describe: v => {
      const m = Math.round(v), p = Math.min(1, m * DUNN_MIN_P);
      return m === 1
        ? `Mit einem einzigen Vergleich bleibt p ≈ ${num(DUNN_MIN_P, 3)} unverändert. Es liegt unter α = 0,05.`
        : `Mit ${m} Vergleichen wird aus dem kleinsten p ≈ 0,006 der Wert ${m} · 0,006 ≈ ${num(p, 3)}. ${p < 0.05 ? 'Er liegt noch unter α = 0,05.' : 'Er liegt über α = 0,05, das Paar ist nicht mehr auffällig.'}`;
    },
  },
  check: {
    question: 'Dunn meldet für ein Paar p (unadj) = 0,006 und p (adj) = 0,06. Was gilt bei α = 0,05?',
    options: [
      'Das Paar ist auffällig, denn 0,006 liegt unter 0,05.',
      'Im Vergleich aller zehn Paare ist es nicht auffällig; ein Unterschied kann trotzdem bestehen.',
      'Die beiden Gruppen kommen gleich gut mit ihrem Einkommen aus.',
      'Die Korrektur hat den Unterschied verkleinert.',
    ],
    correct: 1,
    right: 'Genau. Für die Familie der zehn Vergleiche zählt das korrigierte p.',
    diagnose: {
      0: 'Fast! Das ist das ungeschützte p. Bei zehn Vergleichen entscheidet das korrigierte.',
      2: 'Fast! Nicht auffällig heißt nicht gleich. Es fehlt nur der Beleg für einen Unterschied.',
      3: 'Fast! Die mittleren Ränge bleiben dieselben. Nur p ist größer geworden, die Hürde also höher.',
    },
  },
  fuerDich: 'Liegt das p des Gesamttests unter α, lohnt der Blick auf die korrigierten Paarvergleiche. Bleibt dort nichts übrig, beschreibst du den Unterschied vorsichtig, als Muster über alle Gruppen.',
  genau: {
    kurz: 'Dunn nutzt die gemeinsamen Ränge aller Gruppen und korrigiert für Gleichstände. Welche Korrektur der p-Werte du nimmst, legst du vorher fest.',
    paragraphs: [
      'Der Standardfehler lautet √((N(N + 1) / 12 − Σ(t³ − t) / (12(N − 1))) · (1/nᵢ + 1/nⱼ)); t ist die Zahl gleicher Antworten. Bei der finanziellen Lage mit nur fünf Antwortstufen gibt es sehr viele Gleichstände.',
      'Ohne Angabe korrigiert dunn_test() nach Bonferroni: jedes p mal 10. Holm ist nie strenger und hält dieselbe familienweise Fehlerrate ein. mariposa bietet auch BH an; das kontrolliert statt der familienweisen Fehlerrate den Anteil falscher Funde.',
      'Die Normalverteilung für z ist eine Näherung, die mit großen Gruppen gut passt.',
      'Ein Mann–Whitney-U-Test je Paar ordnet jedes Mal nur zwei Gruppen neu. Das ist ein anderer Test mit anderen p-Werten; nach Kruskal–Wallis passt Dunn.',
    ],
  },
};

// Reiter -------------------------------------------------------------------------------

/** Dunn-Vergleiche auf den aktuellen 200 Befragten; Gruppen aufsteigend nach Code. */
export function dunnSample(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'finanzlage', g = c.columns.group?.[0] ?? c.columns.y?.[0] ?? 'schulabschluss';
  const { codes, values } = byGroup(c.rows, x, g);
  return { codes, ...dunn(values) };
}
/** z des Paars mit den Codes a und b (a vor b), sonst null. */
export const dunnZ = (c: SampleCtx, a: number, b: number) => {
  const d = dunnSample(c), i = d.codes.indexOf(a), j = d.codes.indexOf(b);
  return d.pairs.find(p => p.i === i && p.j === j)?.z ?? null;
};
const label = (code: number) => SCHOOL[code] ?? String(code);

export const dunnTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'finanzlage', y: 'schulabschluss', group: 'schulabschluss' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Welche Schulabschlüsse unterscheiden sich darin, wie gut der Haushalt mit dem Einkommen auskommt?',
    value: c => { const d = dunnSample(c); const ps = d.pairs.map(p => p.pAdj).filter(Number.isFinite); return ps.length ? Math.min(...ps) : null; },
    result: c => {
      const d = dunnSample(c), ok = d.pairs.filter(p => Number.isFinite(p.z));
      if (!ok.length) return { kurz: 'Alle Befragten geben dieselbe Antwort. Dann gibt es nichts zu ordnen und keinen Vergleich.', fachlich: 'Die z-Werte sind nicht definiert.' };
      const top = ok.reduce((a, p) => Math.abs(p.z) > Math.abs(a.z) ? p : a), hits = ok.filter(p => p.pAdj < 0.05).length, raw = ok.filter(p => p.p < 0.05).length;
      return {
        kurz: `Am deutlichsten unterscheiden sich ${label(d.codes[top.i])} und ${label(d.codes[top.j])}: mittlerer Rang ${num(d.kw.mean[top.i])} gegen ${num(d.kw.mean[top.j])}, z ≈ ${num(top.z)}, nach der Holm-Korrektur ${pText(top.pAdj)}. Bei α = 0,05 ${hits === 0 ? 'ist nach der Korrektur kein Paar auffällig' : hits === 1 ? 'ist nach der Korrektur ein Paar auffällig' : `sind nach der Korrektur ${hits} Paare auffällig`}; ohne Korrektur wären es ${raw}.`,
        fachlich: `Dunn-Vergleiche nach Kruskal–Wallis mit Holm-Korrektur, ${ok.length} Paare. z in der Richtung von R: erste minus zweite Gruppe, negativ heißt kleinerer mittlerer Rang der ersten.`,
        zusatz: `Kruskal–Wallis über alle Gruppen: H ≈ ${num(d.kw.H)}, ${pText(d.kw.p)}.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig, und jede Person gehört zu genau einer Gruppe. Die Antworten lassen sich ordnen.',
    think: [
      {
        question: 'Alle Antworten zur finanziellen Lage werden umgepolt. Was passiert mit z für Ohne Schulabschluss gegen Fachhochschulreife?', options: ['wechselt das Vorzeichen', 'bleibt gleich', 'wird 0'], correct: 0,
        explain: 'Umpolen spiegelt jeden Rang. Die Gruppe mit dem kleineren mittleren Rang hat danach den größeren, und z dreht sein Vorzeichen bei gleichem Betrag.',
        kurz: 'Das Vorzeichen von z zeigt nur die Richtung.',
        tryIt: { label: 'finanzielle Lage umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'sign', measure: c => dunnZ(c, 0, 3) },
      },
      {
        question: 'Jemand nummeriert die Abschlüsse andersherum. Was passiert mit dem kleinsten korrigierten p?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Es bleiben dieselben zehn Paare mit denselben Rängen, nur unter anderen Nummern. Die Korrektur sieht dieselben zehn p-Werte.',
        kurz: 'Die Gruppen brauchen keine Reihenfolge.',
        tryIt: { label: 'Abschlüsse andersherum nummerieren', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'dunn_test', variant: 0,
    tokens: {
      dunn_test: { sym: 'dunn_test()', term: 'Dunn-Vergleiche', kurz: 'Vergleicht nach kruskal_wallis() jedes Paar von Gruppen über die gemeinsamen Ränge. summary() zeigt z und die p-Werte vor und nach der Korrektur.', fehler: 'dunn_test() braucht das Ergebnis von kruskal_wallis() davor. Direkt auf die Daten angewandt meldet mariposa: `dunn_test()` is not available for objects of class <tbl_df/tbl/data.frame>.' },
      p_adjust: { sym: 'p_adjust =', term: 'Mehrere Vergleiche', kurz: 'Wählt die Korrektur der p-Werte. Ohne Angabe nimmt mariposa "bonferroni".', fehler: 'Groß- und Kleinschreibung zählt. p_adjust = "Holm" ergibt: `p_adjust` must be one of "bonferroni", "holm", … ✖ Got "Holm".' },
      '"holm"': { sym: '"holm"', term: 'Holm-Korrektur', kurz: 'Das kleinste p mal der Zahl der Vergleiche, das nächste mal eins weniger und so weiter, nie kleiner als das vorige.', fehler: 'Holm ändert nur die p-Werte. Die z-Werte und die mittleren Ränge bleiben dieselben.' },
      group: { sym: 'group =', term: 'Gruppenvariable', kurz: 'Nennt die Spalte mit den Gruppen, hier die fünf Schulabschlüsse. Ihre Reihenfolge spielt keine Rolle.', fehler: 'Mit nur zwei Gruppen gibt es nur ein Paar, und die Korrektur ändert nichts.' },
    },
    outputMap: [
      { match: '(Holm)', atlas: 'Holm-Korrektur', step: 3, explain: 'Die p-Werte sind für die zehn Vergleiche korrigiert, wie im Aufruf mit p_adjust = "holm" verlangt.' },
      { match: '10 comparisons', atlas: 'zehn Paare', step: 3, explain: 'Fünf Gruppen ergeben 5 · 4 / 2 = 10 Paare.' },
      { match: '0 significant', atlas: 'auffällige Paare', step: 3, explain: 'Nach der Korrektur liegt bei keinem Paar das p unter α = 0,05, obwohl das p von Kruskal–Wallis darunter liegt.' },
      { match: 'p < .05', atlas: 'Signifikanzniveau α', explain: 'Die Schwelle α = 0,05 für die korrigierten p-Werte.' },
    ],
    check: {
      question: 'Wie viele Paare sind nach der Korrektur auffällig? Tippe es an.', correct: '0 significant',
      wrong: { '10 comparisons': 'Fast! Das ist die Zahl aller Paare.', 'p < .05': 'Fast! Das ist die Schwelle α. Die Zahl der auffälligen Paare steht davor.', '(Holm)': 'Fast! Das ist die Korrektur. Die Zahl der auffälligen Paare steht in der zweiten Zeile.' },
    },
  },
  next: {
    next: { id: 'multiplicity', why: 'Der gemeinsame Gedanke hinter Holm, Bonferroni und Tukey: viele Vergleiche, eine Fehlerkontrolle.' },
    before: [
      { id: 'kruskal_wallis', why: 'Liefert die gemeinsamen Ränge und zeigt, ob sich irgendwo Gruppen unterscheiden.' },
      { id: 'ranks', why: 'Verglichen werden mittlere Ränge, nicht die Antworten selbst.' },
    ],
    after: [
      { id: 'alpha_level', why: 'Nach der Korrektur vergleichst du jedes p wie gewohnt mit α.' },
    ],
    more: [
      { id: 'tukey_test', why: 'Die Paarvergleiche nach der ANOVA, über Mittelwerte statt über Ränge.' },
      { id: 'mann_whitney', why: 'Der Rangtest für genau zwei Gruppen, mit eigener Rangreihe.' },
    ],
  },
};
