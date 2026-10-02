// Begriffskarte „F-Verteilung“ (Bereich B7). Beispiel: Lernzeit nach Schulabschluss der 200 Befragten,
// einfaktorielle ANOVA wie mariposa::oneway_anova(lernzeit, group = schulabschluss). Zahlen in R nachgerechnet.
// Grenzfall Vorlage: Die F-Verteilung ist eine Referenzkurve; die Rechnung von F (zwei Streuungen, ein Verhältnis)
// steht in den Bausteinen. Deshalb Begriffskarte, der Regler verschiebt das beobachtete F.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { sampleColumn } from '../../sample';
import { often, pf, pValue, qf, shown2 } from './dist';
import { onewayAnova } from '../../../tasks/kit/means';

/** Lernzeit nach Schulabschluss (R: summary(aov(lernzeit ~ factor(schulabschluss)))), Gruppenmittel und η². */
export const ANOVA = { f: 8.638858, df1: 4, df2: 195, ssb: 313.9825, ssw: 1771.837, msb: 78.49563, msw: 9.086344, crit: 2.417963, p: 1.936406e-6, lowest: 5.883333, highest: 9.355, eta2: 0.150532 } as const;
const A = ANOVA;
const T = (id: string) => titleFor(ref(id));
/** Fläche rechts von f unter F(4, 195). */
export const fTail = (f: number) => pf(f, A.df1, A.df2, false);
/** „p ≈ 0,41“, „p < 0,001“. */
export const pText = (p: number) => `p ${pValue(p)}`;

export const fVerteilung: ConceptCard = {
  concept: 'f_distribution',
  picture: 'b07-f',
  wofuer: 'Lernen Befragte mit verschiedenen Schulabschlüssen unterschiedlich lange? Die einfaktorielle ANOVA vergleicht dafür zwei Streuungen: zwischen den Gruppen und innerhalb der Gruppen. Ihr Verhältnis F ordnet die F-Verteilung ein.',
  kurz: 'Die F-Verteilung zeigt, wie groß das Verhältnis zweier Streuungen allein durch Zufall wird. Werte um 1 sind üblich, sehr große Werte sind überraschend.',
  stellDirVor: {
    text: `Die 200 Befragten haben in den letzten sieben Tagen im Schnitt zwischen ${num(A.lowest, 1)} Stunden (ohne Schulabschluss) und ${num(A.highest, 1)} Stunden (Abitur) gelernt. Die ANOVA setzt die Streuung zwischen den fünf Gruppen ins Verhältnis zur Streuung innerhalb: F ≈ ${num(A.f)} bei ${A.df1} und ${A.df2} Freiheitsgraden. Gäbe es keine Unterschiede zwischen den Gruppen, lägen 95 % der F-Werte unter ${num(A.crit)}.`,
    figures: [
      { label: 'F', value: num(A.f) },
      { label: 'Freiheitsgrade', value: `${A.df1} und ${A.df2}` },
      { label: 'Grenze für die äußeren 5 %', value: num(A.crit) },
    ],
  },
  heisst: {
    sym: 'F', say: 'F',
    fach: 'Die Verteilung von F = (U₁ / ν₁) / (U₂ / ν₂), dem Verhältnis zweier unabhängiger χ²-Größen, jede geteilt durch ihre Freiheitsgrade: ν₁ im Zähler, ν₂ im Nenner.',
  },
  bausteine: [
    {
      title: 'Die Streuung zwischen den Gruppen messen',
      was: 'Wie weit liegen die fünf Gruppenmittel auseinander? Das misst die mittlere Quadratsumme zwischen den Gruppen: ihre Quadratsumme geteilt durch ihre Freiheitsgrade, eine Art Varianz der Gruppenmittel.',
      rechnung: `Quadratsumme zwischen den Gruppen ${num(A.ssb)}: die quadrierten Abstände der Gruppenmittel zur Mitte aller 200, für jede Person zusammengezählt. Geteilt durch 5 Gruppen minus 1, die Zähler-Freiheitsgrade: ${num(A.ssb)} / ${A.df1} ≈ ${num(A.msb, 1)}.`,
      warum: 'Lägen alle Gruppenmittel gleich, wäre diese Streuung 0. Je weiter sie auseinanderliegen, desto größer wird sie.',
      acht: 'Auch ohne echte Unterschiede liegen die Gruppenmittel einer Stichprobe nie genau gleich. Etwas Streuung zwischen den Gruppen gibt es immer.',
      concept: 'group_variation',
    },
    {
      title: 'Die Streuung innerhalb der Gruppen messen',
      was: 'Wie stark schwankt die Lernzeit innerhalb jeder Gruppe? Das misst die mittlere Quadratsumme innerhalb der Gruppen: die quadrierten Abstände zum eigenen Gruppenmittel, zusammengezählt und geteilt durch die Freiheitsgrade.',
      rechnung: `Quadratsumme innerhalb der Gruppen ${num(A.ssw)}: die quadrierten Abstände jeder Person zum Mittel ihrer Gruppe, zusammengezählt. Geteilt durch 200 Befragte minus 5 Gruppen, die Nenner-Freiheitsgrade: ${num(A.ssw)} / ${A.df2} ≈ ${num(A.msw)}.`,
      warum: 'Diese Streuung zeigt, wie stark die Befragten innerhalb einer Gruppe auseinanderliegen. Mit ihr wird die Streuung zwischen den Gruppen verglichen.',
      acht: 'Zähler und Nenner haben verschiedene Freiheitsgrade. Vertauschst du sie, gilt eine andere F-Verteilung.',
      concept: 'ss',
    },
    {
      title: 'Beide ins Verhältnis setzen',
      was: 'F teilt die Streuung zwischen den Gruppen durch die Streuung innerhalb. Gäbe es keine Unterschiede, läge F meist in der Nähe von 1.',
      rechnung: `F = ${num(A.msb, 1)} / ${num(A.msw)} ≈ ${num(A.f)}.`,
      warum: 'Ein F weit über 1 heißt: Die Gruppen unterscheiden sich stärker, als die Schwankung innerhalb der Gruppen erwarten ließe.',
      acht: 'F ist ein Verhältnis zweier Streuungen und deshalb nie negativ. Die F-Verteilung beginnt bei 0 und läuft nach rechts lang aus.',
      concept: 'oneway_anova',
    },
    {
      title: 'Den rechten Rand ansehen',
      was: `Bei 4 und 195 Freiheitsgraden sind nur 5 % der F-Werte größer als ${num(A.crit)}. Große F-Werte sprechen gegen gleiche Mittelwerte.`,
      rechnung: `F = ${num(A.f)} liegt weit rechts davon. Gäbe es keine Unterschiede zwischen den Gruppen, käme ein mindestens so großes F ${often(A.p)} Stichproben vor.`,
      warum: 'Nur große F-Werte sprechen gegen die Annahme gleicher Mittelwerte. Deshalb zählt allein der rechte Rand.',
      acht: 'Ein großes F spricht dafür, dass sich mindestens zwei Gruppen unterscheiden, sagt aber nicht, welche. Das zeigen Paarvergleiche wie der Tukey-Test.',
      concept: 'p_value',
    },
  ],
  ausprobieren: [
    {
      question: 'Alle fünf Gruppen hätten in der Stichprobe genau denselben Mittelwert. Welches F käme heraus?',
      options: ['0', 'etwa 1', 'sehr groß'], correct: 0, step: 3,
      explain: 'Die Streuung zwischen den Gruppen wäre 0, also auch F. Werte um 1 erwartest du, wenn es nur in der Grundgesamtheit keine Unterschiede gibt: Stichproben streuen immer etwas.',
      kurz: 'F = 0 heißt: keine Streuung zwischen den Gruppen.',
    },
    {
      question: 'Warum zählt bei F nur der rechte Rand?',
      options: ['Große F-Werte sprechen gegen gleiche Mittelwerte.', 'Die F-Verteilung ist symmetrisch.'], correct: 0, step: 4,
      explain: 'Kleine F-Werte heißen: Die Gruppen liegen eng beieinander. Gegen gleiche Mittelwerte sprechen nur große F-Werte.',
      kurz: 'Gegen die Nullhypothese spricht nur ein großes F.',
    },
    {
      question: 'Dieselben 200 Befragten werden in sechs statt fünf Gruppen eingeteilt. Welche Freiheitsgrade hat F dann?',
      options: ['5 und 194', '6 und 200', '4 und 195'], correct: 0, step: 2,
      explain: 'Zähler: 6 Gruppen minus 1 = 5. Nenner: 200 Befragte minus 6 Gruppen = 194.',
      kurz: 'Jede weitere Gruppe verschiebt einen Freiheitsgrad vom Nenner in den Zähler.',
    },
  ],
  regler: {
    label: 'Welches F hat die ANOVA ergeben?',
    min: 0, max: 10, step: 0.01, initial: shown2(A.f),
    format: v => `F = ${num(v)}`,
    describe: v => {
      if (v < 0.005) return 'F = 0 hieße: Alle Gruppenmittel liegen genau gleich. Gäbe es keine Unterschiede, wäre jedes F mindestens so groß.';
      const p = fTail(v);
      return `Gäbe es keine Unterschiede zwischen den Gruppen, käme ein F von mindestens ${num(v)} ${often(p)} Stichproben vor (${pText(p)}). Das liegt ${v < A.crit ? 'unter' : 'jenseits'} der Grenze ${num(A.crit)} für die äußeren 5 %.`;
    },
  },
  check: {
    question: 'Eine ANOVA vergleicht 3 Gruppen mit zusammen 60 Befragten. Welche Freiheitsgrade hat F?',
    options: ['2 und 57', '3 und 60', '2 und 59'],
    correct: 0,
    right: 'Genau. Zähler: 3 − 1 = 2. Nenner: 60 − 3 = 57.',
    diagnose: {
      1: 'Fast! Gezählt werden die Gruppen minus 1 und die Befragten minus die Gruppen: 3 − 1 = 2 und 60 − 3 = 57.',
      2: 'Fast! 59 wäre n − 1. Im Nenner ziehst du die Zahl der Gruppen ab: 60 − 3 = 57.',
    },
  },
  fuerDich: `Liest du „F(4, 195) = 8,64“, stehen die Zähler-Freiheitsgrade vorne: fünf Gruppen minus eins. Wie groß die Unterschiede sind, sagt F allein nicht; dafür meldet R η², hier ${num(A.eta2)}.`,
  genau: {
    kurz: 'Exakt gilt die F-Verteilung nur bei normalverteilten Fehlern mit gleicher Varianz in allen Gruppen. Bei ungleicher Varianz hilft der Welch-Test.',
    paragraphs: [
      'F = (U₁ / ν₁) / (U₂ / ν₂) mit unabhängigen χ²-Größen U₁ und U₂. In der ANOVA ist der Zähler die mittlere Quadratsumme zwischen den Gruppen mit k − 1 Freiheitsgraden, der Nenner die innerhalb der Gruppen mit n − k.',
      `Gäbe es keine Unterschiede, wäre der Erwartungswert von F gleich ν₂ / (ν₂ − 2), hier 195 / 193 ≈ ${num(195 / 193)}.`,
      'Bei zwei Gruppen ist F genau das Quadrat der Prüfgröße t des t-Tests mit gleichen Varianzen: F(1, ν) = t² bei ν Freiheitsgraden.',
      'Die ANOVA setzt normalverteilte Fehler mit gleicher Varianz in allen Gruppen voraus. Bei ungleichen Varianzen meldet R unter „Robust Tests“ den Welch-Test, hier 8,25 bei 4 und 96,7 Freiheitsgraden.',
    ],
  },
};

/** Einfaktorielle ANOVA der Lernzeit nach Schulabschluss für die aktuellen Daten. */
export function fFit(c: SampleCtx) {
  const y = sampleColumn(c.rows, c.columns.x?.[0] ?? 'lernzeit'), g = sampleColumn(c.rows, c.columns.group?.[0] ?? 'schulabschluss');
  const a = onewayAnova(y, g);
  if (!a) return null;
  const means = a.groups.map(x => x.mean);
  return {
    k: a.levels.length, df1: a.dfBetween, df2: a.dfWithin, between: a.ssBetween, inside: a.ssWithin, msb: a.msBetween, msw: a.msWithin,
    f: a.F, p: a.p, crit: qf(0.95, a.dfBetween, a.dfWithin), lowest: Math.min(...means), highest: Math.max(...means),
  };
}

export const fTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Unterscheidet sich die Lernzeit je nach Schulabschluss?',
    value: c => fFit(c)?.f ?? null,
    result: c => {
      const f = fFit(c);
      if (!f) return { kurz: 'Alle Befragten stehen jetzt in einer einzigen Gruppe. Dann gibt es nichts zu vergleichen.', fachlich: 'Mit nur einer Gruppe hat die ANOVA keine Zähler-Freiheitsgrade; F ist nicht definiert.' };
      return {
        kurz: `Die Streuung zwischen den ${f.k} Gruppen ist ${num(f.f)}-mal so groß wie die Streuung innerhalb: F = ${num(f.f)} bei ${f.df1} und ${f.df2} Freiheitsgraden. Ohne Unterschiede lägen 95 % der F-Werte unter ${num(f.crit)}. Gäbe es keine Unterschiede zwischen den Gruppen, käme ein mindestens so großes F ${often(f.p)} Stichproben vor.`,
        fachlich: `Einfaktorielle ANOVA: mittlere Quadratsumme zwischen den Gruppen ${num(f.msb)}, innerhalb ${num(f.msw)}, F(${f.df1}, ${f.df2}) ≈ ${num(f.f)}, ${pText(f.p)}.`,
        zusatz: `Im Schnitt lernen die Gruppen zwischen ${num(f.lowest, 1)} und ${num(f.highest, 1)} Stunden in den letzten sieben Tagen.`,
      };
    },
    voraussetzung: 'Die ANOVA nimmt unabhängige Befragte und in allen Gruppen annähernd normalverteilte Werte mit gleicher Streuung an. Bei ungleicher Streuung hilft der Welch-Test.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit F?',
        options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 0,
        explain: 'Beide Streuungen vervierfachen sich, denn jede Abweichung verdoppelt sich und wird quadriert. Ihr Verhältnis bleibt gleich.',
        kurz: 'F hängt nicht von der Einheit ab.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit F?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Alle Gruppen rücken um dieselbe Stunde. Die Abstände zwischen und innerhalb der Gruppen bleiben, also auch F.',
        kurz: 'Verschieben ändert keinen Vergleich.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'oneway_anova', variant: 0,
    tokens: {
      oneway_anova: { sym: 'oneway_anova()', term: T('oneway_anova'), kurz: 'Vergleicht die Mittelwerte mehrerer Gruppen. summary() zeigt die Tabelle mit F und den Freiheitsgraden.', fehler: 'Ohne group meldet mariposa: Argument `group` is missing, with no default.' },
    },
    outputMap: [
      { match: 'F', atlas: 'F', step: 3, explain: 'F teilt die mittlere Quadratsumme zwischen den Gruppen durch die innerhalb der Gruppen.' },
      { match: 'Mean Square', atlas: 'Streuung zwischen den Gruppen', step: 1, explain: 'Die mittlere Quadratsumme zwischen den Gruppen. Darunter steht die innerhalb der Gruppen, der Nenner von F.' },
      { match: 'df', atlas: 'Zähler-Freiheitsgrade', step: 1, explain: '5 Gruppen minus 1. Darunter stehen die 195 Nenner-Freiheitsgrade; beide zusammen wählen die F-Verteilung aus.' },
      { match: '195', atlas: 'Nenner-Freiheitsgrade', step: 2, explain: '200 Befragte minus 5 Gruppen. Sie gehören zur Streuung innerhalb der Gruppen.' },
      { match: 'Eta Squared', atlas: 'η²', explain: 'Der Anteil der Streuung, der zwischen den Gruppen liegt. Er sagt, wie groß die Unterschiede sind.' },
    ],
    check: {
      question: 'Welche Zahl ist F, das Verhältnis der beiden Streuungen? Tippe sie an.', correct: 'F',
      wrong: {
        'Mean Square': 'Fast! Das ist die Streuung zwischen den Gruppen, der Zähler. F ist dieser Wert geteilt durch die Streuung innerhalb.',
        df: 'Fast! Das sind die Zähler-Freiheitsgrade. F steht in der Spalte F.',
        'Eta Squared': 'Fast! η² ist eine Effektgröße, der Anteil der Streuung zwischen den Gruppen. F steht in der Tabelle darüber.',
      },
    },
  },
  next: {
    next: { id: 'oneway_anova', why: 'Der Test, der sein F mit dieser Verteilung einordnet.' },
    before: [
      { id: 'chi_square_distribution', why: 'Zähler und Nenner von F sind χ²-Größen, durch ihre Freiheitsgrade geteilt.' },
      { id: 'general_df', why: 'Zähler und Nenner haben eigene Freiheitsgrade.' },
      { id: 'group_variation', why: 'Die beiden Streuungen, die F ins Verhältnis setzt.' },
    ],
    after: [
      { id: 'factorial_anova', why: 'Prüft mehrere Faktoren, jeden mit eigenem F.' },
      { id: 'ancova', why: 'Vergleicht Gruppen, nachdem Kovariaten herausgerechnet sind; auch dort mit F.' },
    ],
    more: [
      { id: 'explained_variance', why: 'Auch der Gesamttest einer Regression nutzt die F-Verteilung.' },
      { id: 'tukey_test', why: 'Zeigt nach einem großen F, welche Gruppen sich unterscheiden.' },
      { id: 'levene_test', why: 'Prüft gleiche Streuung in den Gruppen, ebenfalls mit einem F.' },
    ],
  },
};
