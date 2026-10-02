// Werkstatt „Chi-Quadrat · Anpassung“ (chisq_gof): Sind die fünf Schulabschlüsse unter den 200 Befragten so häufig,
// wie eine vorher festgelegte Verteilung sagt? Ton nach der Streuung (src/explain/content/streuung.ts).
// Zahlen in R nachgerechnet: b12-kategorial-design.test.ts (chisq.test, mariposa::chisq_gof 0.7.4).
import type { ConceptTabs, Ctx, FNode, SampleCtx, Workshop } from '../../types';
import { num, signed, paren, close, unit } from '../../format';
import { columnById } from '../../../domain/survey';
import { chiParts, eqFor, fine, fineParen, fineSigned, partSum, partText, shareOf, type ChiParts } from './chi-gemeinsam';
import { counts, often, pText } from './rechnen';

/** Beobachtete Zahlen je Abschluss und die Annahme in Prozent (ganze Zahlen, damit beides auf der Skala des Bildes liegt). */
export type GofData = { o: number[]; pct: number[] };
export type GofStats = ChiParts & { p0: number[]; k: number; labels: string[]; uniform: boolean };

/** Wertelabels von `schulabschluss` (Codes 0 bis 4), wie im Datensatz. */
export const ABSCHLUSS = columnById.schulabschluss.categories!.map(c => c.label);
/** Zahl der Befragten je Schulabschluss im Lehrdatensatz (R: table(atlas$schulabschluss)). */
export const SCHULE = [42, 40, 37, 41, 40];
/** Lehrhypothese der zweiten Katalogvariante: 10, 20, 30, 20, 20 %. */
export const LEHR = [10, 20, 30, 20, 20];
const GLEICH = [20, 20, 20, 20, 20];

export function gofStats(d: GofData): GofStats {
  const n = d.o.reduce((a, b) => a + b, 0), p0 = d.pct.map(q => q / 100), e = p0.map(p => n * p);
  const parts = chiParts(d.o, e, d.o.length - 1);
  return { ...parts, p0, k: d.o.length, labels: ABSCHLUSS, uniform: d.pct.every(q => q === d.pct[0]) };
}

type C = Ctx<GofStats>;
const L = (c: C) => c.s.labels[c.who];
const share = (p: number) => `${num(p * 100)} %`;
/** „2 mehr als erwartet“, „3 weniger als erwartet“, „genau wie erwartet“. */
const versus = (d: number) => Math.abs(d) < 1e-9 ? 'genau wie erwartet' : `${unit(Math.abs(d), 'Person', 'Personen')} ${d > 0 ? 'mehr' : 'weniger'} als erwartet`;
const biggest = (s: GofStats) => s.part.indexOf(Math.max(...s.part));

const terms = (c: C): FNode[] => c.s.o.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 5 }, ' '] as FNode[] : []),
  { part: ['('], m: 3 }, { part: [`${x} −`], m: 2 }, ' ', { part: [fine(c.s.e[i])], m: 1 }, { part: [')²'], m: 3 }, ' ', { part: [`/ ${fine(c.s.e[i])}`], m: 4 },
]);

export const anpassung: Workshop<GofData, GofStats> = {
  id: 'b12-anpassung',
  wofuer: 'Im Lehrdatensatz haben 42 Befragte keinen Schulabschluss, 40 einen Hauptschulabschluss, 37 einen mittleren Abschluss, 41 die Fachhochschulreife und 40 das Abitur. Sind die fünf Abschlüsse gleich häufig, mit ein bisschen Zufall? Der Anpassungstest vergleicht beobachtete Zahlen mit einer Verteilung, die du vorher festlegst.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus kleinen Schritten, die du alle schon kannst: malnehmen, abziehen, quadrieren, teilen, zusammenzählen. Den Vergleich mit dem Zufall im letzten Schritt übernimmt R. Hier geht es ums Verstehen.',
  picture: 'b12-anpassung',
  dataNote: 'Die 200 Befragten des Lehrdatensatzes, nach Schulabschluss gezählt. Die Balken im Bild lassen sich ziehen, auch mit den Pfeiltasten.',
  names: ['Ohne', 'Haupt', 'Mittlerer', 'FH-Reife', 'Abitur'],
  bounds: { min: 1, max: 100 },
  presets: [
    { id: 'gleich', label: 'Annahme: alle gleich häufig', data: { o: SCHULE, pct: GLEICH } },
    { id: 'lehr', label: 'Annahme: 10, 20, 30, 20, 20 %', data: { o: SCHULE, pct: LEHR } },
  ],
  compute: gofStats,
  glyphs: [
    { sym: 'Oⱼ', say: 'O j', term: 'Beobachtete Häufigkeit', plain: 'wie viele Befragte Abschluss j haben', step: 2 },
    { sym: 'Eⱼ', say: 'E j', term: 'Erwartete Häufigkeit', plain: 'wie viele es nach der Annahme wären', step: 1 },
    { sym: 'p₀ⱼ', say: 'p null j', term: 'Anteil unter der Nullhypothese', plain: 'der Anteil, den die Annahme für Abschluss j festlegt', step: 1 },
    { sym: 'j', say: 'j', term: 'Laufindex', plain: 'die Nummer der Kategorie, von 1 bis k', step: 2 },
    { sym: 'k', say: 'k', term: 'Zahl der Kategorien', plain: 'wie viele Abschlüsse es gibt, hier 5', step: 6 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Kategorie einmal', step: 5 },
    { sym: 'χ²', say: 'Chi-Quadrat', term: 'Prüfgröße', plain: 'wie weit die Daten insgesamt von der Annahme weg sind', step: 5 },
    { sym: 'df', say: 'd f', term: 'Freiheitsgrade', plain: 'wie viele Häufigkeiten frei wählbar sind, hier k − 1', step: 6 },
  ],
  steps: [
    {
      button: 'Eⱼ', title: 'Erwarten, was die Annahme sagt', sym: 'Eⱼ = n · p₀ⱼ', say: 'E j gleich n mal p null j', concept: 'expected', perPerson: false,
      links: [{ id: 'hypothesis', label: 'Nullhypothese' }],
      was: 'Wir zählen alle Befragten zusammen und verteilen sie so, wie die Annahme es sagt. So bekommt jeder Abschluss eine erwartete Zahl.',
      rechnung: c => `n = ${c.s.o.join(' + ')} = ${c.s.n}. ${L(c)}: ${c.s.n} · ${num(c.s.p0[c.who])} ${eqFor(fine(c.s.e[c.who]), c.s.e[c.who])} ${fine(c.s.e[c.who])}.`,
      fach: 'Die erwartete Häufigkeit Eⱼ ist die Fallzahl n mal dem Anteil p₀ⱼ, den die Nullhypothese für Kategorie j festlegt.',
      warum: 'Ein Test braucht einen Maßstab. Die erwarteten Zahlen zeigen, was herauskäme, wenn die Annahme genau stimmte.',
      acht: c => c.s.uniform
        ? `Die erwarteten Zahlen kommen aus der Annahme, nicht aus den Daten. Bei gleich häufigen Abschlüssen ist jede ${c.s.n} / ${c.s.k} = ${num(c.s.n / c.s.k)}.`
        : 'Die erwarteten Zahlen kommen aus der Annahme, nicht aus den Daten. Jeder Abschluss bekommt seinen eigenen Anteil, deshalb sind sie verschieden.',
      check: {
        question: c => `Wie viele Befragte erwartest du beim Abschluss „${L(c)}“?`,
        answer: c => c.s.e[c.who],
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.n) ? `Fast! Das sind alle ${c.s.n} Befragten. Für einen Abschluss nimmst du nur seinen Anteil, hier ${share(c.s.p0[c.who])}.`
          : !close(c.s.o[c.who], c.s.e[c.who]) && close(v, c.s.o[c.who]) ? 'Fast! Das ist die beobachtete Zahl. Erwartet ist, was die Annahme vorhersagt: n mal p₀.'
          : null,
      },
    },
    {
      button: 'Oⱼ − Eⱼ', title: 'Abweichungen messen', sym: 'Oⱼ − Eⱼ', say: 'O j minus E j', concept: 'subtract', perPerson: false,
      links: [{ id: 'frequency', label: 'Beobachtete Häufigkeiten' }],
      was: 'Für jeden Abschluss rechnen wir: beobachtet minus erwartet. Das Vorzeichen zeigt, ob es mehr oder weniger sind als erwartet.',
      rechnung: c => `${L(c)}: ${c.s.o[c.who]} − ${fine(c.s.e[c.who])} ${eqFor(fine(c.s.e[c.who]), c.s.e[c.who])} ${fineSigned(c.s.dev[c.who])}, also ${versus(c.s.dev[c.who])}.`,
      fach: 'Oⱼ ist die beobachtete Häufigkeit der Kategorie j. Die Differenz Oⱼ − Eⱼ zeigt, wie weit die Daten in dieser Kategorie von der Annahme abweichen.',
      warum: 'Der Test fragt: Wie weit liegen die Daten von der Annahme weg? Genau das messen wir hier, Abschluss für Abschluss.',
      acht: 'Alle Abweichungen zusammen ergeben immer 0, denn beobachtet und erwartet sind gleich viele Befragte. Was bei einem Abschluss fehlt, ist bei einem anderen zu viel.',
      check: {
        question: c => `Wie weit liegt „${L(c)}“ über oder unter der Erwartung? Mit Vorzeichen.`,
        answer: c => c.s.dev[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who];
          return v !== 'NA' && Math.abs(d) > 1e-9 && close(v, -d) ? 'Fast! Der Abstand stimmt, nur die Richtung nicht. Rechne beobachtet minus erwartet.' : null;
        },
      },
    },
    {
      button: '( )²', title: 'Abweichungen quadrieren', sym: '(Oⱼ − Eⱼ)²', say: 'O j minus E j, zum Quadrat', concept: 'square', perPerson: false,
      was: 'Jede Abweichung nehmen wir mit sich selbst mal. Danach sind alle Zahlen positiv.',
      rechnung: c => `${L(c)}: ${fineParen(c.s.dev[c.who])} · ${fineParen(c.s.dev[c.who])} = ${num(c.s.sq[c.who])}${c.s.dev[c.who] < -1e-9 ? '. Minus mal Minus ergibt Plus.' : '.'}`,
      fach: 'Die quadrierte Abweichung (Oⱼ − Eⱼ)² ist nie negativ. Große Abweichungen zählen dadurch stärker als kleine.',
      warum: 'Sonst heben sich Plus und Minus auf, denn zusammen ergeben die Abweichungen immer 0. Und wer weit danebenliegt, soll stärker zählen.',
      acht: 'Im Taschenrechner Klammern setzen: (−3)² = 9. Ohne Klammern zeigt er −9. Ein Quadrat ist nie negativ.',
      check: {
        question: c => `Was kommt heraus, wenn du ${fineParen(c.s.dev[c.who])} mit sich selbst malnimmst?`,
        answer: c => c.s.sq[c.who],
        diagnose: (c, v) => {
          const d = c.s.dev[c.who], q = c.s.sq[c.who];
          if (v === 'NA') return null;
          if (q > 1e-9 && close(v, -q)) return 'Fast! Das Minus ist zu viel: Minus mal Minus ergibt Plus. Ein Quadrat ist nie negativ.';
          if (Math.abs(d) > 1e-9 && close(v, 2 * Math.abs(d)) && !close(v, q)) return `Fast! Das ist mal 2. Mit sich selbst malnehmen heißt: ${fineParen(d)} · ${fineParen(d)}.`;
          return null;
        },
      },
    },
    {
      button: '÷ Eⱼ', title: 'An der Erwartung messen', sym: '(Oⱼ − Eⱼ)² / Eⱼ', say: 'O j minus E j zum Quadrat, geteilt durch E j', concept: 'divide', perPerson: false,
      was: 'Jedes Quadrat teilen wir durch die erwartete Zahl seines Abschlusses. So wird jede Abweichung an ihrer Erwartung gemessen.',
      rechnung: c => { const t = partText(c.s.part[c.who]); return `${L(c)}: ${num(c.s.sq[c.who])} / ${fine(c.s.e[c.who])} ${eqFor(t, c.s.part[c.who])} ${t}.`; },
      fach: 'Der Quotient (Oⱼ − Eⱼ)² / Eⱼ ist der Beitrag der Kategorie j zur Prüfgröße χ².',
      warum: '3 Befragte zu wenig sind viel, wenn du 10 erwartest. Erwartest du 1.000, fallen sie kaum auf.',
      acht: 'Geteilt wird durch die erwartete Zahl Eⱼ, nicht durch die beobachtete und nicht durch n.',
      check: {
        question: c => `Was kommt heraus, wenn du ${num(c.s.sq[c.who])} durch ${fine(c.s.e[c.who])} teilst?`,
        answer: c => c.s.part[c.who],
        diagnose: (c, v) => {
          const q = c.s.sq[c.who], o = c.s.o[c.who], part = c.s.part[c.who];
          if (v === 'NA' || q < 1e-9) return null;
          if (close(v, q)) return `Fast! Das ist noch das Quadrat. Jetzt noch durch ${fine(c.s.e[c.who])} teilen.`;
          if (o > 0 && !close(q / o, part) && close(v, q / o)) return `Fast! Du hast durch die beobachtete Zahl geteilt. Geteilt wird durch die erwartete, hier ${fine(c.s.e[c.who])}.`;
          if (!close(q / c.s.n, part) && close(v, q / c.s.n)) return `Fast! Du hast durch alle ${c.s.n} geteilt. Geteilt wird durch die erwartete Zahl, hier ${fine(c.s.e[c.who])}.`;
          return null;
        },
      },
    },
    {
      button: 'Σ', title: 'Alles zusammenzählen', sym: 'χ²', say: 'Chi-Quadrat', concept: 'chisq_gof', perPerson: false,
      was: 'Wir zählen die fünf Beiträge aus Schritt 4 zusammen. Das Ergebnis heißt χ².',
      rechnung: c => { const s = partSum(c.s); return `${s.line}.${s.note} „${L(c)}“ steuert ${partText(c.s.part[c.who])} bei, das sind ${shareOf(c.s.part[c.who], c.s.chi2)} von χ².`; },
      fach: 'χ² = Σ (Oⱼ − Eⱼ)² / Eⱼ ist die Prüfgröße des Anpassungstests. Je größer sie ist, desto weiter liegen die Daten von der Annahme weg.',
      warum: 'So steckt die ganze Abweichung von der Annahme in einer Zahl. χ² = 0 hieße: Die Daten passen genau.',
      acht: 'Zusammengezählt werden die Beiträge aus Schritt 4, nicht die Abweichungen aus Schritt 2. Die Abweichungen allein ergäben immer 0.',
      check: {
        question: 'Wie groß ist die Summe der fünf Beiträge?',
        answer: c => c.s.chi2,
        diagnose: (c, v) => v === 'NA' || c.s.chi2 < 1e-9 ? null
          : close(v, 0) ? 'Fast! 0 ist die Summe der Abweichungen. Gefragt ist die Summe der Beiträge aus Schritt 4.'
          : !close(c.s.sumSq, c.s.chi2) && close(v, c.s.sumSq) ? 'Fast! Das ist die Summe der Quadrate. Jedes Quadrat teilst du vorher durch seine erwartete Zahl.'
          : null,
      },
    },
    {
      button: 'df, p', title: 'Mit dem Zufall vergleichen', sym: 'df = k − 1', say: 'd f gleich k minus 1', concept: 'chi_square_distribution', perPerson: false,
      links: [{ id: 'general_df', label: 'Freiheitsgrade im Modell' }, { id: 'p_value', label: 'p-Wert' }],
      was: 'Wir zählen die Freiheitsgrade: Kategorien minus eins. Damit sagt die χ²-Verteilung, wie oft der Zufall allein so ein χ² liefert.',
      rechnung: c => `df = ${c.s.k} − 1 = ${c.s.df}. Stimmte die Annahme, käme ein χ² von mindestens ${num(c.s.chi2)} ${often(c.s.p)} vor (${pText(c.s.p)}).`,
      fach: 'Unter der Nullhypothese folgt χ² näherungsweise einer χ²-Verteilung mit k − 1 Freiheitsgraden. Der p-Wert ist ihre Fläche ab dem beobachteten χ².',
      warum: 'Kennst du n und vier der fünf Zahlen, steht die fünfte fest. Deshalb zählen nur k − 1 frei wählbare Abweichungen.',
      acht: 'Ein großer p-Wert beweist nicht, dass die Annahme stimmt. Er heißt nur: Die Daten widersprechen ihr nicht deutlich.',
      check: {
        question: 'Wie viele Freiheitsgrade hat der Test bei fünf Abschlüssen?',
        answer: c => c.s.df,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.k) ? 'Fast! Das ist die Zahl der Abschlüsse. Die Freiheitsgrade sind eine weniger: k − 1.'
          : close(v, c.s.n - 1) ? 'Fast! n − 1 gehört zur Streuung. Hier zählen die Kategorien: k − 1.'
          : null,
      },
    },
  ],
  numeric: (c, last) => [
    'χ² = ', ...terms(c), { br: true },
    '= ', { part: [partSum(c.s).terms], m: 4 }, ` ${partSum(c.s).sign} `, { part: [num(c.s.chi2)], m: 5 },
    ...(last >= 6 ? [{ br: true }, { part: [`df = ${c.s.k} − 1 = ${c.s.df}`], m: 6 }, ', ', { part: [pText(c.s.p)], m: 6 }] as FNode[] : []),
  ],
  table: {
    columns: [
      { head: 'Oⱼ', from: 1, active: [1, 2], cell: (c, i) => String(c.s.o[i]), sum: c => String(c.s.n), sumFrom: 1 },
      { head: 'Eⱼ', from: 1, active: [1], cell: (c, i) => fine(c.s.e[i]), sum: c => num(c.s.n), sumFrom: 1 },
      { head: 'Oⱼ − Eⱼ', from: 2, active: [2], cell: (c, i) => fineSigned(c.s.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer', tone: (c, i) => c.s.dev[i] > 1e-9 ? 'pos' : c.s.dev[i] < -1e-9 ? 'neg' : undefined },
      { head: '(Oⱼ − Eⱼ)²', from: 3, active: [3], cell: (c, i) => num(c.s.sq[i]) },
      { head: '(Oⱼ − Eⱼ)² / Eⱼ', from: 4, active: [4, 5], cell: (c, i) => partText(c.s.part[i]), sum: c => num(c.s.chi2), sumFrom: 5 },
    ],
    lines: [
      { from: 1, step: 1, text: c => `n = ${c.s.n}; erwartet: ${c.s.e.map(e => num(e)).join(', ')}` },
      { from: 5, step: 5, text: c => `χ² = ${partSum(c.s).line}` },
      { from: 6, step: 6, text: c => `df = ${c.s.k} − 1 = ${c.s.df}; ${pText(c.s.p)}` },
    ],
  },
  captions: {
    1: 'Die Balken zeigen die beobachteten Zahlen, die gestrichelten Linien die erwarteten. Du kannst die Balken ziehen.',
    2: 'Über jedem Balken steht, wie weit er über oder unter seiner Erwartung liegt.',
    3: 'Quadriert zählen große Abweichungen viel stärker als kleine.',
    4: 'Unter jedem Balken steht sein Beitrag zu χ²: das Quadrat geteilt durch die erwartete Zahl.',
    5: 'Alle Beiträge zusammen ergeben χ².',
    6: 'Bei k − 1 Freiheitsgraden sagt die χ²-Verteilung, wie überraschend dieses χ² wäre.',
  },
  think: [
    {
      question: 'Alle fünf Abschlüsse kommen genau 40-mal vor, und die Annahme lautet „gleich häufig“. Wie groß wird χ²?',
      options: ['0', '40', 'hängt von n ab'], correct: 0, step: 2,
      explain: 'Jede Abweichung ist 40 − 40 = 0. Null quadriert bleibt 0, jeder Beitrag ist 0, also auch χ². Die Daten passen genau zur Annahme.',
      kurz: 'Keine Abweichung, kein χ².',
      tryIt: { label: 'alle auf 40, Annahme gleich häufig', apply: () => ({ o: [40, 40, 40, 40, 40], pct: GLEICH }) },
    },
    {
      question: 'Doppelt so viele Befragte, mit denselben Anteilen. Was macht χ²?',
      options: ['bleibt gleich', 'verdoppelt sich', 'halbiert sich'], correct: 1, step: 4,
      explain: 'Jede Abweichung verdoppelt sich, ihr Quadrat vervierfacht sich. Die erwartete Zahl verdoppelt sich nur. Viermal geteilt durch zweimal ergibt: χ² verdoppelt sich.',
      kurz: 'Mit mehr Befragten fallen dieselben Anteile stärker ins Gewicht.',
      // Verdoppelt nur, solange jeder Balken danach auf die Skala passt (höchstens 100); sonst stimmte das Verhältnis nicht mehr.
      tryIt: { label: 'alle Zahlen verdoppeln (bis 100 je Balken)', apply: d => d.o.every(x => x * 2 <= 100) ? { ...d, o: d.o.map(x => x * 2) } : d },
    },
    {
      question: 'Die Daten bleiben gleich, aber die Annahme lautet jetzt 10, 20, 30, 20, 20 %. Was macht χ²?',
      options: ['bleibt gleich', 'ändert sich'], correct: 1, step: 1,
      explain: c => {
        const s = gofStats({ o: c.s.o, pct: LEHR });
        return `Die erwarteten Zahlen werden ${s.e.map(e => num(e)).join(', ')}. Ohne Schulabschluss sind es ${s.o[0]} statt ${num(s.e[0])}, beim mittleren Abschluss ${s.o[2]} statt ${num(s.e[2])}. Mit diesen Daten wird χ² dann ${num(s.chi2)}.`;
      },
      kurz: 'Die Annahme bestimmt, womit du vergleichst.',
      tryIt: { label: 'Annahme 10, 20, 30, 20, 20 %', apply: d => ({ ...d, pct: LEHR }) },
    },
    {
      question: 'Warum teilen wir jedes Quadrat durch seine erwartete Zahl?',
      options: ['damit das Ergebnis zwischen 0 und 1 liegt', 'damit eine Abweichung an ihrer Erwartung gemessen wird'], correct: 1, step: 4,
      explain: 'χ² kann viel größer als 1 werden. Das Teilen sorgt dafür, dass 3 Befragte zu viel bei 10 Erwarteten mehr zählen als bei 1.000.',
      kurz: 'Abweichungen zählen im Verhältnis zur Erwartung.',
    },
  ],
  variants: {
    chisq_gof: {
      lastStep: 6,
      kurz: 'Der Anpassungstest prüft, ob beobachtete Häufigkeiten zu einer vorher festgelegten Verteilung passen. Je größer χ², desto schlechter passen sie.',
      fachlich: 'χ² = Σ (Oⱼ − Eⱼ)² / Eⱼ mit Eⱼ = n · p₀ⱼ, verglichen mit einer χ²-Verteilung mit k − 1 Freiheitsgraden.',
      symbolic: ['χ² = ', { big: 'Σ', m: 5 }, { frac: [{ part: ['('], m: 3 }, { part: ['O', { sub: 'j' }, ' −'], m: 2 }, ' ', { part: ['E', { sub: 'j' }], m: 1 }, { part: [')²'], m: 3 }], den: [{ part: ['E', { sub: 'j' }], m: 4 }], m: 4 },
        ',  ', { part: ['df = k − 1'], m: 6 }],
      aria: 'Chi-Quadrat gleich Summe über alle Kategorien j von O j minus E j, zum Quadrat, geteilt durch E j; Freiheitsgrade k minus 1',
      metrics: [{ label: 'Befragte n', value: c => String(c.s.n) }, { label: 'Prüfgröße χ²', value: c => num(c.s.chi2) }],
      interpret: c => {
        const b = biggest(c.s);
        return {
          kurz: c.s.chi2 < 1e-9
            ? 'Jeder Abschluss kommt genau so oft vor, wie die Annahme sagt. χ² ist 0, die Daten passen genau.'
            : c.s.p >= 0.05
              ? `Die größte Abweichung von der Erwartung beträgt ${unit(Math.max(...c.s.dev.map(Math.abs)), 'Person', 'Personen')}. Stimmte die Annahme, käme ein χ² von mindestens ${num(c.s.chi2)} ${often(c.s.p)} vor. Die Daten widersprechen der Annahme nicht deutlich.`
              : `Die Zahlen weichen von der Annahme ab, am stärksten bei „${c.s.labels[b]}“: ${c.s.o[b]} statt ${fine(c.s.e[b])}. Stimmte die Annahme, käme ein χ² von mindestens ${num(c.s.chi2)} ${often(c.s.p)} vor. Bei α = 0,05 sprechen die Daten gegen die Annahme.`,
          fachlich: `χ² = ${num(c.s.chi2)} bei ${c.s.df} Freiheitsgraden, ${pText(c.s.p)}. Die kleinste erwartete Häufigkeit ist ${fine(c.s.minE)}${c.s.minE >= 5 ? '; die Faustregel „mindestens 5“ ist erfüllt.' : '. Das liegt unter der Faustregel 5, der p-Wert ist dann nur grob.'}`,
        };
      },
      genau: {
        kurz: 'Die χ²-Verteilung ist eine Näherung. Als Faustregel sollte jede erwartete Häufigkeit mindestens 5 sein.',
        paragraphs: () => [
          'Die χ²-Verteilung beschreibt χ² nur näherungsweise. Die Faustregel verlangt, dass jede erwartete Häufigkeit mindestens 5 ist. Ist sie kleiner, warnt mariposa (expected count below 5), und der p-Wert ist ungenau.',
          'Die Annahme legst du fest, bevor du die Daten ansiehst. „Alle Abschlüsse gleich häufig“ und „10, 20, 30, 20, 20 %“ sind hier Lehrhypothesen, keine Aussagen über die Bevölkerung.',
          'Ohne expected nimmt chisq_gof() gleich große Anteile an, mit expected = c(.1, .2, .3, .2, .2) deine Anteile in der Reihenfolge der Codes. mariposa zählt nur Kategorien, die in den Daten vorkommen.',
          'Der Test ist nicht gerichtet: χ² sagt, wie weit die Daten insgesamt abweichen, nicht wo. Wo die Abweichung sitzt, zeigen die Beiträge aus Schritt 4.',
        ],
      },
    },
  },
};

/** Abschlüsse in Texten über die 200 Befragten. */
const KURZNAME = ['ohne Schulabschluss', 'Hauptschulabschluss', 'mittlerer Abschluss', 'Fachhochschulreife', 'Abitur'];

/**
 * Anpassungstest auf Gleichverteilung wie mariposa::chisq_gof 0.7.4: nur Kategorien, die in den Daten vorkommen,
 * jede mit n / k erwartet. null bei weniger als zwei beobachteten Kategorien (mariposa rechnet dann nicht).
 */
export function gofSample(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'schulabschluss', all = counts(c.rows, x, [0, 1, 2, 3, 4]);
  const seen = all.map((o, i) => ({ o, i })).filter(z => z.o > 0);
  if (seen.length < 2) return null;
  const s = chiParts(seen.map(z => z.o), seen.map(() => c.rows.length / seen.length), seen.length - 1);
  return { ...s, all, seen };
}

export const gofTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss' },
    kurz: 'Derselbe Test mit allen 200 Befragten, so wie R ihn rechnet: Sind die fünf Schulabschlüsse gleich häufig?',
    value: c => gofSample(c)?.chi2 ?? null,
    result: c => {
      const s = gofSample(c);
      if (!s) return { kurz: 'Alle Befragten haben jetzt denselben Abschluss. Dann gibt es nichts zu vergleichen, und mariposa rechnet den Test nicht.', fachlich: 'chisq_gof() meldet: `schulabschluss` has 1 observed category; at least 2 are needed.' };
      return {
        kurz: `Die Abschlüsse kommen ${Math.min(...s.o)}- bis ${Math.max(...s.o)}-mal vor; gleich häufig wären je ${num(s.e[0])}. Wären sie in Wahrheit gleich häufig, käme ein χ² von mindestens ${num(s.chi2)} ${often(s.p)} vor.`,
        fachlich: `χ² = ${num(s.chi2)} bei ${s.df} Freiheitsgraden, ${pText(s.p)}; erwartet je Abschluss ${num(s.e[0])}.`,
        zusatz: `Gezählt: ${s.all.map((o, i) => `${KURZNAME[i]} ${o}`).join(', ')}.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an. Als Faustregel sollte jede erwartete Häufigkeit mindestens 5 sein.',
    think: [
      {
        question: 'Die Codes werden umgedreht: Aus 0 wird 4 und aus 4 wird 0. Was passiert mit χ²?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die fünf Zahlen tauschen nur ihre Plätze, und bei gleich häufigen Abschlüssen ist die Erwartung überall dieselbe. Die Summe der Beiträge bleibt gleich.',
        kurz: 'Bei gleichen Erwartungen spielt die Reihenfolge keine Rolle.',
        tryIt: { label: 'Schulabschluss umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'chisq_gof', variant: 0,
    tokens: {
      chisq_gof: { sym: 'chisq_gof()', term: 'Chi-Quadrat-Anpassungstest', kurz: 'Vergleicht die Häufigkeiten einer Spalte mit einer vorgegebenen Verteilung. Ohne expected nimmt mariposa gleich große Anteile an.', fehler: 'Mit einer Spalte voller Kommazahlen meldet mariposa: `lernzeit` appears to be a continuous variable.' },
    },
    outputMap: [
      { match: 'chi2', atlas: 'χ²', step: 5, explain: 'Die Prüfgröße aus Schritt 5. In Klammern stehen die Freiheitsgrade: 5 − 1 = 4.' },
      { match: 'p', atlas: 'p-Wert', step: 6, explain: 'Wären die Abschlüsse in Wahrheit gleich häufig, käme ein χ² von mindestens 0,35 in etwa 99 von 100 Stichproben vor.' },
      { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten mit gültigem Schulabschluss.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist χ²? Tippe sie an.', correct: 'chi2',
      wrong: { p: 'Fast! Das ist der p-Wert. χ² steht hinter chi2, mit den Freiheitsgraden in Klammern.', N: 'Fast! N ist die Zahl der Befragten. χ² steht hinter chi2.' },
    },
  },
  next: {
    next: { id: 'chi_square', why: 'Dieselbe Rechnung für zwei Merkmale: Hängen sie zusammen?' },
    before: [
      { id: 'frequency', why: 'Die beobachteten Häufigkeiten, die der Test mit der Annahme vergleicht.' },
      { id: 'hypothesis', why: 'Legt die Anteile fest, aus denen die erwarteten Zahlen werden.' },
      { id: 'chi_square_distribution', why: 'Sagt, wie oft der Zufall allein ein so großes χ² liefert.' },
    ],
    after: [{ id: 'effect', why: 'χ² wächst mit der Zahl der Befragten. Wie groß die Abweichung ist, sagt eine Effektgröße.' }],
    more: [
      { id: 'binomial_test', why: 'Der Fall mit nur zwei Kategorien, exakt gerechnet.' },
      { id: 'exact_asymptotic', why: 'Die χ²-Verteilung ist eine Näherung; bei kleinen erwarteten Zahlen wird sie ungenau.' },
    ],
  },
};
