// Begriffskarte „Linearer Zusammenhang“: gerade gegen gebogen, Steilheit gegen Enge. Beispiel aus dem Lehrdatensatz
// (Lernzeit und Wissenstest), Regler „Bogen“ mit sieben Punkten. In R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { sampleColumn } from '../../sample';
import { pearsonOf } from './shared';

/** Lehrdatensatz: mittlerer Wissenstest nach Lernzeit (unter 6, 6 bis unter 9, ab 9 Stunden), Steigung und r. */
export const LERNZEIT_GRUPPEN = { means: [7.6792, 10.35, 11.791], n: [53, 80, 67], slope: 0.5188908, r: 0.5391689, cov: 5.44, varx: 10.48 } as const;

/** Sieben Punkte zwischen Gerade (Bogen 0) und symmetrischem Bogen (Bogen 1): y = (1 − v) · x + v · (1 + (x − 4)² · 2/3). */
export const BOGEN_X = [1, 2, 3, 4, 5, 6, 7];
export const bogenY = (v: number) => BOGEN_X.map(x => (1 - v) * x + v * (1 + (x - 4) ** 2 * 2 / 3));
export const bogenR = (v: number) => pearsonOf(BOGEN_X, bogenY(v));

const L = LERNZEIT_GRUPPEN;

export const linearKarte: ConceptCard = {
  concept: 'linear',
  wofuer: 'Bevor du eine Pearson-Korrelation deutest, brauchst du eine Vorfrage: Folgen die Punkte überhaupt grob einer Geraden? r misst nur diesen geraden Anteil. Ein Bogen kann r klein machen, obwohl die beiden Merkmale eng zusammenhängen.',
  kurz: 'Ein Zusammenhang ist linear, wenn eine Gerade ihn gut beschreibt: Ein Schritt mehr bei x bringt im Schnitt überall gleich viel mehr bei y. Nur dann erzählt Pearson-r die ganze Geschichte.',
  stellDirVor: {
    text: `Im Lehrdatensatz lösen Befragte, die in den letzten sieben Tagen weniger als 6 Stunden gelernt haben, im Wissenstest im Schnitt ${num(L.means[0])} Aufgaben. Mit 6 bis unter 9 Stunden sind es ${num(L.means[1])}, ab 9 Stunden ${num(L.means[2])}. Eine Gerade beschreibt das grob: etwa ${num(L.slope)} Aufgaben mehr je Stunde, r ≈ ${num(L.r)}. Ganz gleichmäßig sind die Schritte nicht; ob eine Gerade passt, zeigt erst das Streudiagramm.`,
    figures: [
      { label: 'unter 6 Stunden', value: `${num(L.means[0])} Aufgaben` },
      { label: '6 bis unter 9 Stunden', value: `${num(L.means[1])} Aufgaben` },
      { label: 'ab 9 Stunden', value: `${num(L.means[2])} Aufgaben` },
      { label: 'Pearson-r', value: num(L.r) },
    ],
  },
  heisst: {
    fach: 'Ein Zusammenhang ist linear, wenn sich die mittlere Veränderung von y durch eine Gerade in Abhängigkeit von x beschreiben lässt. Pearson-r erfasst genau diese lineare Komponente.',
  },
  bausteine: [
    {
      title: 'Eine Gerade durch die Punkte denken',
      was: 'Stell dir eine Gerade vor, die mittig durch die Punktwolke läuft. Liegen die Punkte ohne Bogen um sie herum, ist der Zusammenhang linear.',
      warum: 'Pearson-r misst, wie eng die Punkte an so einer Geraden liegen. Für andere Formen ist r nicht gemacht.',
      acht: 'Linear heißt nicht stark. Auch eine breite Punktwolke kann einer Geraden folgen, nur eben locker.',
      concept: 'pearson',
    },
    {
      title: 'Auf Bögen achten',
      was: 'Steigt y erst und fällt dann wieder, folgen die Punkte einem Bogen. Dann kann r nahe 0 liegen, obwohl x und y eng zusammenhängen.',
      warum: 'Beim symmetrischen Bogen liegen die Punkte links und rechts gleich hoch. Die Plusflächen rechts und die Minusflächen links heben sich genau auf.',
      acht: 'r = 0 heißt nur: kein gerader Zusammenhang. Schau immer auch auf das Streudiagramm.',
      concept: 'covariance',
    },
    {
      title: 'Steilheit und Enge trennen',
      was: 'Die Steigung der Geraden sagt, um wie viel y je Schritt in x wächst. r sagt, wie eng die Punkte an der Geraden liegen.',
      rechnung: `Lehrdatensatz: Steigung ${num(L.cov)} / ${num(L.varx)} ≈ ${num(L.slope)} Aufgaben je Stunde, r ≈ ${num(L.r)}. Je Minute wäre die Steigung 60-mal kleiner, r bliebe gleich.`,
      warum: 'Die Steigung hängt von den Einheiten ab, r nicht. Deshalb taugt r für Vergleiche und die Steigung für Aussagen wie „je Stunde“.',
      acht: 'Ein großes r heißt nicht, dass y stark mit x wächst. Auch eine flache Gerade hat r = 1, wenn alle Punkte genau auf ihr liegen.',
      concept: 'linear_regression',
    },
    {
      title: 'Stetig steigend, aber nicht gerade',
      was: 'Steigt y immer weiter, aber immer langsamer, ist das Muster stetig, aber nicht gerade. Dann passt Spearman besser als Pearson.',
      warum: 'Spearman fragt nur nach der Reihenfolge. Jedes Muster, das immer steigt, bekommt dort den Wert 1.',
      acht: 'Auch Spearman sieht keinen Bogen, der erst steigt und dann fällt.',
      concept: 'spearman',
    },
  ],
  ausprobieren: [
    {
      question: 'Schieb den Regler ganz nach rechts: Die Punkte liegen auf einem symmetrischen Bogen. Wie groß ist r?',
      options: ['nahe 1', 'genau 0', 'negativ'], correct: 1, step: 2,
      explain: 'Beim symmetrischen Bogen heben sich Plus- und Minusflächen genau auf: r = 0. Dabei folgt jeder y-Wert genau aus x.',
      kurz: 'r = 0 heißt nicht: kein Zusammenhang.',
    },
    {
      question: 'Alle Punkte liegen genau auf einer sehr flachen, steigenden Geraden. Wie groß ist r?',
      options: ['nahe 0, weil die Gerade flach ist', 'genau 1', 'das hängt von der Einheit ab'], correct: 1, step: 3,
      explain: 'r misst die Enge an der Geraden, nicht ihre Steigung. Liegen alle Punkte genau auf einer steigenden Geraden, ist r = 1, egal wie flach sie ist.',
      kurz: 'Enge, nicht Steilheit.',
    },
    {
      question: 'Die Lernzeit wird in Minuten statt in Stunden gemessen. Was ändert sich?',
      options: ['nur die Steigung', 'nur r', 'beides'], correct: 0, step: 3,
      explain: 'Die Steigung je Minute ist 60-mal kleiner als je Stunde. r hat keine Einheit und bleibt gleich.',
      kurz: 'Einheiten ändern die Steigung, nicht r.',
    },
  ],
  regler: {
    label: 'Wie stark sind die sieben Punkte gebogen?',
    min: 0, max: 1, step: 0.05, initial: 0,
    format: v => v < 0.005 ? 'gerade' : v > 0.995 ? 'ganz gebogen' : `${num(v * 100, 0)} % gebogen`,
    describe: v => {
      const r = bogenR(v) ?? 0;
      return v < 0.005 ? 'Alle sieben Punkte liegen genau auf einer Geraden: r = 1.'
        : v > 0.995 ? 'Die Punkte liegen auf einem symmetrischen Bogen: r ≈ 0, obwohl jeder y-Wert genau aus x folgt.'
        : `Mit diesem Bogen ist r ≈ ${num(r)}. y folgt weiter genau aus x, aber die Gerade passt immer schlechter.`;
    },
  },
  check: {
    question: 'Eine Studie findet zwischen Alter und politischem Interesse r = 0,03. Was folgt daraus?',
    options: [
      'Alter und Interesse hängen nicht zusammen.',
      'Es gibt keinen geraden Zusammenhang; ein Bogen ist möglich. Das Streudiagramm klärt es.',
      'Der Zusammenhang ist schwach, aber sicher linear.',
      'Ältere interessieren sich etwas mehr für Politik, weil r positiv ist.',
    ],
    correct: 1,
    right: 'Genau. r misst nur den geraden Anteil. Ob die Punkte einem Bogen folgen, zeigt erst das Streudiagramm.',
    diagnose: {
      0: 'Fast! Das ist der häufigste Fehler. r nahe 0 schließt nur einen geraden Zusammenhang aus, keinen gebogenen.',
      2: 'Fast! Ob ein Zusammenhang linear ist, sagt r nicht. Das zeigt nur das Bild der Punkte.',
      3: 'Noch nicht ganz. Bei r = 0,03 ist kaum ein gerader Zusammenhang zu sehen, und „weil“ behauptet eine Ursache, die r nicht zeigen kann.',
    },
  },
  fuerDich: 'Bevor du eine Korrelation deutest, schau dir das Streudiagramm an. Folgen die Punkte grob einer Geraden, beschreibt r den Zusammenhang gut; folgen sie einem Bogen, erzählt r nur die halbe Geschichte.',
  genau: {
    kurz: 'Linear heißt: Die mittlere Veränderung von y je Schritt in x ist überall gleich. Pearson-r und die einfache lineare Regression beschreiben genau diesen Anteil.',
    paragraphs: [
      `Formal hängt der Mittelwert von y über eine Gerade a + b · x von x ab. Die Steigung b ist die Kovarianz geteilt durch die Varianz von x; im Lehrdatensatz ${num(L.cov)} / ${num(L.varx)} ≈ ${num(L.slope)} Aufgaben je Stunde.`,
      `r² ist der Anteil der Varianz von y, den eine Gerade erklärt; hier ${num(L.r)}² ≈ ${num(L.r ** 2)}. Ein gebogenes Muster kann viel mehr erklären, als r² zeigt.`,
      'Ein linearer Zusammenhang beweist keine Ursache. Wer mehr lernt, kann sich auch sonst unterscheiden, etwa im Schulabschluss.',
      'Ein einzelner Ausreißer kann eine gerade Punktwolke gebogen aussehen lassen oder r stark verschieben. Deshalb lohnt der Blick auf die einzelnen Punkte.',
    ],
  },
  picture: 'b05-linear',
};

// ---------- Reiter ----------

const COLS = { x: 'lernzeit', y: 'wissenstest' };
/** Steigung der Geraden (Kovarianz durch Varianz von x), r und die mittleren Werte von y in drei Lernzeitgruppen. */
export function geradeData(c: SampleCtx) {
  const x = sampleColumn(c.rows, c.columns.x?.[0] ?? COLS.x), y = sampleColumn(c.rows, c.columns.y?.[0] ?? COLS.y), n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  const cov = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0) / (n - 1), varx = x.reduce((a, v) => a + (v - mx) ** 2, 0) / (n - 1);
  const group = (lo: number, hi: number) => { const g = y.filter((_, i) => x[i] >= lo && x[i] < hi); return g.length ? g.reduce((a, b) => a + b, 0) / g.length : null; };
  return { slope: varx > 0 ? cov / varx : null, r: pearsonOf(x, y), cov, varx, n, groups: [group(-Infinity, 6), group(6, 9), group(9, Infinity)] };
}
const mean = (v: number | null) => v === null ? 'niemand' : num(v);

export const linearTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...COLS },
    kurz: 'Mit allen 200 Befragten: Wie gut beschreibt eine Gerade den Zusammenhang von Lernzeit und Wissenstest?',
    value: c => geradeData(c).r,
    result: c => {
      const g = geradeData(c);
      if (g.slope === null || g.r === null) return { kurz: 'Eine der beiden Spalten streut nicht. Dann gibt es keine Gerade und kein r.', fachlich: 'Die Varianz von x oder y ist 0.' };
      return {
        kurz: `Die Gerade durch die ${g.n} Punkte ${g.slope >= 0 ? 'steigt' : 'fällt'} um etwa ${num(Math.abs(g.slope))} Aufgaben je Stunde Lernzeit. Wie eng die Punkte an ihr liegen, zeigt r ≈ ${num(g.r)}.`,
        fachlich: `Steigung b = sₓᵧ / sₓ² = ${num(g.cov)} / ${num(g.varx)} ≈ ${num(g.slope)}; r ≈ ${num(g.r)}, r² ≈ ${num(g.r * g.r)}.`,
        zusatz: `Mittlerer Wissenstest: unter 6 Stunden ${mean(g.groups[0])}, 6 bis unter 9 Stunden ${mean(g.groups[1])}, ab 9 Stunden ${mean(g.groups[2])} Aufgaben.`,
      };
    },
    voraussetzung: 'Beide Spalten werden als metrisch behandelt. Ob eine Gerade passt, zeigt das Streudiagramm, nicht r allein.',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit der Steigung, also den Aufgaben je Stunde?', options: ['verdoppelt sich', 'halbiert sich', 'bleibt gleich'], correct: 1,
        explain: 'Für dieselben Aufgaben braucht es jetzt doppelt so viele Stunden. Die Steigung je Stunde halbiert sich.',
        kurz: 'Die Steigung hängt an der Einheit.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 0.5, measure: c => geradeData(c).slope },
      },
      {
        question: 'Und was passiert dabei mit r?', options: ['halbiert sich', 'bleibt gleich', 'verdoppelt sich'], correct: 1,
        explain: 'Die Punkte liegen genauso eng an der Geraden wie vorher, nur die Achse ist gestreckt. r hat keine Einheit und bleibt gleich.',
        kurz: 'Enge bleibt, Steilheit ändert sich.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was passiert mit r?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Die Gerade kippt: Sie fällt jetzt so steil, wie sie vorher stieg. Die Punkte liegen genauso eng an ihr, nur das Vorzeichen dreht sich.',
        kurz: 'Umpolen dreht die Richtung, nicht die Form.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  next: {
    next: { id: 'pearson', why: 'Misst, wie eng die Punkte an einer Geraden liegen.' },
    before: [
      { id: 'pairs', why: 'Erst mit beiden Werten jeder Person entsteht ein Streudiagramm.' },
      { id: 'metric', why: 'Eine Gerade setzt voraus, dass Abstände zwischen Zahlen etwas bedeuten.' },
    ],
    after: [
      { id: 'linear_regression', why: 'Legt die Gerade so durch die Punkte, dass die quadrierten Abstände möglichst klein sind.' },
      { id: 'spearman', why: 'Für Muster, die stetig steigen, aber nicht gerade.' },
    ],
    more: [
      { id: 'outliers_influence', why: 'Einzelne Punkte können eine Gerade stark verschieben.' },
      { id: 'covariance', why: 'Der Zähler von r: Plus- und Minusflächen um die beiden Mittelwerte.' },
    ],
  },
};
