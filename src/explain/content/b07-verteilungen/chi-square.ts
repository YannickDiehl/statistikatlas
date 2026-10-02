// Begriffskarte „χ²-Verteilung“ (Bereich B7). Beispiel: Schulabschluss und Weiterbildung der 200 Befragten,
// Chi-Quadrat-Test wie mariposa::chi_square(schulabschluss, weiterbildung, correct = FALSE).
// Grenzfall Vorlage: Die Verteilung ist eine Referenzkurve ohne Rechnung zum Nachvollziehen; die eine Rechnung
// (eine Zelle des χ²) steht als Baustein. Deshalb Begriffskarte mit einem Regler für die Freiheitsgrade.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, unit } from '../../format';
import { often, pchisq, pValue, qchisq } from './dist';
import { chiSquare, cramersV, crosstab } from '../../../tasks/kit/stats';
import { sampleColumn } from '../../sample';
import { ref, titleFor } from '../../../domain/learning';

/** Schulabschluss × Weiterbildung (R: chisq.test(table(sa, wb), correct = FALSE)); Zelle Haupt-/Volksschule mit Weiterbildung. */
export const CHI = { chi2: 3.082033, df: 4, p: 0.5441925, crit: 9.487729, cellB: 12, cellE: 16.4, minE: 15.17, doubled: 6.164065 } as const;
/** Gipfel der χ²-Verteilung: ν − 2 ab zwei Freiheitsgraden, sonst 0. */
export const peak = (df: number) => Math.max(0, df - 2);
const C = CHI;
const fg = (v: number) => unit(v, 'Freiheitsgrad', 'Freiheitsgraden');

export const chiQuadratVerteilung: ConceptCard = {
  concept: 'chi_square_distribution',
  picture: 'b07-chi',
  wofuer: 'Hängt der Schulabschluss damit zusammen, ob jemand in den letzten zwölf Monaten eine Weiterbildung gemacht hat? Der Chi-Quadrat-Test fasst die Antwort in einer Zahl zusammen: χ², sprich Chi-Quadrat. Ob diese Zahl groß ist, zeigt die χ²-Verteilung.',
  kurz: 'Die χ²-Verteilung zeigt, wie groß eine Summe quadrierter Abweichungen allein durch Zufall wird. Sie beginnt bei 0 und läuft nach rechts in einem langen Ausläufer aus.',
  stellDirVor: {
    text: `Die Kreuztabelle der 200 Befragten hat 5 Zeilen für die Schulabschlüsse und 2 Spalten für Weiterbildung ja oder nein. Der Chi-Quadrat-Test fasst alle Abweichungen von der Erwartung ohne Zusammenhang in einer Zahl zusammen: χ² ≈ ${num(C.chi2)} bei ${C.df} Freiheitsgraden. Ohne Zusammenhang lägen 95 % der χ²-Werte unter ${num(C.crit)}.`,
    figures: [
      { label: 'χ²', value: num(C.chi2) },
      { label: 'Freiheitsgrade', value: String(C.df) },
      { label: 'Grenze für die äußeren 5 %', value: num(C.crit) },
      { label: 'p-Wert', value: num(C.p) },
    ],
  },
  heisst: {
    sym: 'χ²', say: 'Chi-Quadrat',
    fach: 'Die Verteilung von Z₁² + Z₂² + …, der Summe der Quadrate von ν unabhängigen, standardnormalverteilten Größen. Ihr Erwartungswert ist ν, ihre Varianz 2ν.',
  },
  bausteine: [
    {
      title: 'Abweichungen quadrieren und zusammenzählen',
      was: 'Der Chi-Quadrat-Test vergleicht jede Zelle mit dem, was ohne Zusammenhang zu erwarten wäre. Jede Abweichung wird quadriert, durch die Erwartung geteilt und zusammengezählt.',
      rechnung: `Haupt- oder Volksschulabschluss mit Weiterbildung: beobachtet ${C.cellB}, erwartet ${num(C.cellE)}. (${C.cellB} − ${num(C.cellE)})² / ${num(C.cellE)} = ${num((C.cellB - C.cellE) ** 2)} / ${num(C.cellE)} ≈ ${num((C.cellB - C.cellE) ** 2 / C.cellE)}. Alle zehn Zellen zusammen: χ² ≈ ${num(C.chi2)}.`,
      warum: 'Durch das Quadrat zählen Abweichungen nach oben und nach unten gleich. Deshalb kann χ² nie negativ werden.',
      acht: 'Mehr Zellen bringen mehr Summanden und damit im Schnitt ein größeres χ². Deshalb hängt die Grenze von den Freiheitsgraden ab.',
      concept: 'chi_square',
    },
    {
      title: 'Die Freiheitsgrade zählen',
      was: 'Bei einer Kreuztabelle sind es (Zeilen − 1) mal (Spalten − 1). Hier: (5 − 1) · (2 − 1) = 4.',
      warum: 'Stehen die Summen am Rand der Tabelle fest, also wie viele es je Abschluss und je Antwort gibt, sind nicht alle Zellen frei. Die übrigen ergeben sich von selbst.',
      acht: 'Die Zahl der Befragten zählt hier nicht. Ob 200 oder 2.000 Befragte: Diese Tabelle hat 4 Freiheitsgrade.',
      concept: 'general_df',
    },
    {
      title: 'Den rechten Rand ansehen',
      was: `Bei 4 Freiheitsgraden liegen die χ²-Werte im Schnitt bei 4, am häufigsten um 2. Nur 5 % sind größer als ${num(C.crit)}.`,
      rechnung: `χ² = ${num(C.chi2)} liegt weit links von ${num(C.crit)}. Gäbe es keinen Zusammenhang, käme ein mindestens so großes χ² ${often(C.p)} Stichproben vor (R: p = 0.544).`,
      warum: 'Je weiter die Beobachtungen von der Erwartung abweichen, desto größer wird χ². Deshalb zählt nur der rechte Rand.',
      acht: 'Ein kleines χ² beweist keine Unabhängigkeit. Es heißt nur: Die Daten passen gut zur Annahme ohne Zusammenhang.',
      concept: 'critical_value',
    },
  ],
  ausprobieren: [
    {
      question: 'Wohin wandert der Gipfel der χ²-Verteilung, wenn die Freiheitsgrade wachsen?',
      options: ['nach rechts', 'nach links', 'Er bleibt bei 0.'], correct: 0, step: 2,
      explain: 'Bei 4 Freiheitsgraden liegt der Gipfel bei 2, bei 10 Freiheitsgraden bei 8. Der Erwartungswert, der Durchschnitt aller χ²-Werte, liegt jeweils bei der Zahl der Freiheitsgrade, also rechts vom Gipfel. Schieb den Regler nach rechts.',
      kurz: 'Mehr Freiheitsgrade, größere übliche Werte.',
    },
    {
      question: 'Kann χ² negativ werden?',
      options: ['ja, wenn weniger beobachtet als erwartet wird', 'nein, nie'], correct: 1, step: 1,
      explain: 'Jede Abweichung wird quadriert, das Ergebnis ist nie negativ. Weniger als erwartet zählt genauso wie mehr als erwartet.',
      kurz: 'Quadrate kennen kein Minus.',
    },
    {
      question: 'Dieselbe Tabelle mit doppelt so vielen Befragten, alle Anteile gleich. Was passiert mit χ²?',
      options: ['Es verdoppelt sich.', 'Es bleibt gleich.', 'Es halbiert sich.'], correct: 0, step: 1,
      explain: `Jede Abweichung verdoppelt sich, ihr Quadrat vervierfacht sich, die Erwartung verdoppelt sich. Zusammen ergibt das das doppelte χ², hier etwa ${num(C.doubled)}, weiterhin bei 4 Freiheitsgraden.`,
      kurz: 'Mehr Befragte machen dieselben Anteile auffälliger.',
    },
  ],
  regler: {
    label: 'Wie viele Freiheitsgrade hat die χ²-Verteilung?',
    min: 1, max: 10, step: 1, initial: 4,
    format: v => unit(v, 'Freiheitsgrad', 'Freiheitsgrade'),
    describe: v => `Bei ${fg(v)} liegt der Gipfel bei ${num(peak(v))} und der Erwartungswert bei ${num(v)}; nur 5 % der χ²-Werte sind größer als ${num(qchisq(0.95, v))}. ${Math.abs(v - 4) < 1e-9 ? `So ist es bei Schulabschluss und Weiterbildung: χ² = ${num(C.chi2)} liegt darunter.` : 'Die Tabelle aus Schulabschluss und Weiterbildung hat 4 Freiheitsgrade.'}`,
  },
  check: {
    question: 'Eine Kreuztabelle hat 3 Zeilen und 4 Spalten. Mit wie vielen Freiheitsgraden rechnet der Chi-Quadrat-Test?',
    options: ['6', '12', '5', '11'],
    correct: 0,
    right: 'Genau. (3 − 1) · (4 − 1) = 2 · 3 = 6.',
    diagnose: {
      1: 'Fast! 12 ist die Zahl aller Zellen. Frei sind nur (3 − 1) · (4 − 1) = 6.',
      2: 'Fast! Du hast (3 − 1) + (4 − 1) gerechnet. Die Freiheitsgrade sind das Produkt: 2 · 3 = 6.',
      3: 'Fast! Das ist die Zahl der Zellen minus 1. Weil auch die Summen am Rand der Tabelle feststehen, bleiben (3 − 1) · (4 − 1) = 6.',
    },
  },
  fuerDich: `Steht in einer Studie „χ²(4) = 12,3“, vergleiche mit dem Erwartungswert: Ohne Zusammenhang lägen die χ²-Werte bei 4 Freiheitsgraden im Schnitt bei 4. 12,3 liegt jenseits von ${num(C.crit)}, also unter den äußersten 5 %.`,
  genau: {
    kurz: 'Für Kreuztabellen ist die χ²-Verteilung eine Näherung. Sie passt, wenn die erwarteten Häufigkeiten nicht zu klein sind.',
    paragraphs: [
      'Eine χ²-verteilte Größe mit ν Freiheitsgraden ist die Summe von ν quadrierten, unabhängigen, standardnormalverteilten Größen. Erwartungswert ν, Varianz 2ν. Mit wachsendem ν wird die Verteilung symmetrischer.',
      `Die Prüfgröße des Chi-Quadrat-Tests folgt der χ²-Verteilung nur näherungsweise, für große Stichproben. Als Faustregel sollen alle erwarteten Häufigkeiten mindestens 5 betragen; sonst hilft der exakte Test von Fisher. Hier ist die kleinste ${num(C.minE)}.`,
      'Auch die Varianz normalverteilter Daten hängt mit ihr zusammen: (n − 1) · s² / σ² ist χ²-verteilt mit n − 1 Freiheitsgraden. Daraus entstehen Intervalle für σ.',
      `In R liefert qchisq(0.95, 4) die Grenze ${num(C.crit)} und pchisq(3.08, 4, lower.tail = FALSE) den p-Wert.`,
    ],
  },
};

/** Stärke nach Cohens Faustregel für Cramérs V bei einer Tabelle mit zwei Spalten (0,1 / 0,3 / 0,5), wie mariposa „small“. */
const strength = (v: number) => v < 0.1 ? 'kaum vorhanden' : v < 0.3 ? 'schwach' : v < 0.5 ? 'mittel' : 'stark';

/** Chi-Quadrat-Test von Schulabschluss und Weiterbildung für die aktuellen Daten. */
export function chiFit(c: SampleCtx) {
  const x = sampleColumn(c.rows, c.columns.x?.[0] ?? 'schulabschluss'), y = sampleColumn(c.rows, c.columns.y?.[0] ?? 'weiterbildung');
  const t = crosstab(x, y), { chi2, df } = chiSquare(t.cells);
  const rs = t.cells.map(r => r.reduce((a, b) => a + b, 0)), cs = t.cells[0].map((_, j) => t.cells.reduce((a, r) => a + r[j], 0));
  const minE = Math.min(...rs.flatMap(r => cs.map(k => r * k / t.n)));
  return { rows: t.rows.length, cols: t.cols.length, chi2, df, p: df > 0 ? pchisq(chi2, df, false) : 1, crit: df > 0 ? qchisq(0.95, df) : NaN, minE, v: df > 0 ? cramersV(x, y) : 0 };
}

export const chiTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss', y: 'weiterbildung' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Hängt der Schulabschluss mit einer Weiterbildung in den letzten zwölf Monaten zusammen?',
    value: c => chiFit(c).chi2,
    result: c => {
      const f = chiFit(c);
      if (f.df === 0) return { kurz: 'Alle Befragten stehen in einer Zeile oder Spalte. Dann gibt es nichts zu vergleichen.', fachlich: 'Mit nur einer Zeile oder Spalte hat die Tabelle keine Freiheitsgrade.' };
      return {
        kurz: `Die Kreuztabelle aus ${f.rows} Abschlüssen und ${f.cols} Antworten ergibt χ² = ${num(f.chi2)} bei ${f.df} Freiheitsgraden. Ohne Zusammenhang lägen 95 % der χ²-Werte unter ${num(f.crit)}. Gäbe es keinen Zusammenhang, käme ein mindestens so großes χ² ${often(f.p)} Stichproben vor.`,
        fachlich: `Pearsons χ² ohne Korrektur: χ²(${f.df}) ≈ ${num(f.chi2)}, p ${pValue(f.p)}. Grenze für α = 5 %: ${num(f.crit)}; Erwartungswert der χ²-Verteilung: ${f.df}.`,
        zusatz: `Cramérs V ≈ ${num(f.v)} misst die Stärke des Zusammenhangs: nach der üblichen Faustregel ${strength(f.v)}. Die kleinste erwartete Häufigkeit ist ${num(f.minE)}; ${f.minE >= 5 ? 'die Regel „mindestens 5“ ist erfüllt.' : 'das ist weniger als 5, die Näherung ist fraglich.'}`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig voneinander. Die χ²-Verteilung ist hier eine Näherung; als Faustregel sollen alle erwarteten Häufigkeiten mindestens 5 betragen.',
    think: [
      {
        question: 'Der Schulabschluss wird umgepolt: 4 minus Code. Was passiert mit χ²?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Umpolen vertauscht nur die Reihenfolge der Zeilen. Jede Zelle behält ihre beobachtete und erwartete Häufigkeit, die Summe bleibt.',
        kurz: 'χ² achtet nicht auf die Reihenfolge der Kategorien.',
        tryIt: { label: 'Schulabschluss umpolen (4 minus Code)', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Die gewählte Person hat jetzt Abitur (Code 4). Was passiert mit der Zahl der Freiheitsgrade?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Es bleiben 5 Abschlüsse und 2 Antworten, also (5 − 1) · (2 − 1) = 4. Nur die Zellen ändern sich.',
        kurz: 'Freiheitsgrade hängen an der Größe der Tabelle, nicht an den Zellen.',
        tryIt: { label: 'die gewählte Person auf Abitur (Code 4)', op: 'outlier', column: 'x', value: 4 },
        expect: { change: 'same', measure: c => chiFit(c).df },
      },
      {
        question: 'Weiterbildung wird umgepolt: 1 heißt jetzt keine Weiterbildung. Was passiert mit χ²?',
        options: ['bleibt gleich', 'verdoppelt sich', 'wird 0'], correct: 0,
        explain: 'Die beiden Spalten tauschen nur die Plätze. Jede Abweichung bleibt gleich groß, also auch χ².',
        kurz: 'Umpolen ändert die Beschriftung, nicht den Zusammenhang.',
        tryIt: { label: 'Weiterbildung umpolen', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'chi_square', variant: 0,
    tokens: {
      chi_square: { sym: 'chi_square()', term: titleFor(ref('chi_square')), kurz: 'Rechnet den Chi-Quadrat-Test für zwei Spalten mit Kategorien. R meldet χ² als chi2, die Freiheitsgrade in Klammern, p und Cramérs V.', fehler: 'Mit nur einer Spalte meldet mariposa: Exactly two variables must be specified for `chi_square()`.' },
    },
    outputMap: [
      { match: 'chi2', atlas: 'χ²', step: 1, explain: 'Die Summe aller quadrierten Abweichungen, jede geteilt durch ihre Erwartung.' },
      { match: '4', atlas: 'Freiheitsgrade', step: 2, explain: 'Die 4 in Klammern sind die Freiheitsgrade, (5 − 1) · (2 − 1). Sie wählen die passende χ²-Verteilung aus.' },
      { match: 'p', atlas: 'p-Wert', step: 3, explain: 'Gäbe es keinen Zusammenhang, käme ein mindestens so großes χ² in etwa 54 von 100 Stichproben vor. Das ist die Fläche rechts von χ².' },
      { match: 'V', atlas: 'Cramérs V', explain: 'V rechnet χ² in eine Stärke zwischen 0 und 1 um. small heißt: schwacher Zusammenhang.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten in der Tabelle.' },
    ],
    check: {
      question: 'Welche Zahl wählt aus, welche χ²-Verteilung gilt? Tippe sie an.', correct: '4',
      wrong: {
        chi2: 'Fast! Das ist die Prüfgröße χ² selbst. Welche Verteilung gilt, steht in Klammern davor.',
        p: 'Fast! Das ist der p-Wert, eine Fläche unter der χ²-Verteilung. Die Freiheitsgrade stehen in Klammern hinter chi2.',
        V: 'Fast! V misst die Stärke des Zusammenhangs. Die Freiheitsgrade stehen in Klammern hinter chi2.',
      },
    },
  },
  next: {
    next: { id: 'chi_square', why: 'Der Test, der seine Prüfgröße mit dieser Verteilung einordnet.' },
    before: [
      { id: 'standard_normal', why: 'χ² ist eine Summe quadrierter, standardnormalverteilter Größen.' },
      { id: 'general_df', why: 'Die Freiheitsgrade legen die Form fest.' },
      { id: 'expected', why: 'Die erwarteten Häufigkeiten, mit denen jede Zelle verglichen wird.' },
    ],
    after: [
      { id: 'chisq_gof', why: 'Prüft, ob Häufigkeiten zu einer vorgegebenen Verteilung passen.' },
      { id: 'f_distribution', why: 'Das Verhältnis zweier χ²-Größen, jede durch ihre Freiheitsgrade geteilt.' },
    ],
    more: [
      { id: 'mcnemar_test', why: 'Auch der McNemar-Test vergleicht seine Prüfgröße mit einer χ²-Verteilung.' },
      { id: 'fisher_test', why: 'Die exakte Alternative, wenn erwartete Häufigkeiten klein sind.' },
      { id: 'cramers_v', why: 'Rechnet χ² in eine Stärke zwischen 0 und 1 um.' },
    ],
  },
};
