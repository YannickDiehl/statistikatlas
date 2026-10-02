// Begriffskarte „Rotation“: dieselbe Lösung mit gedrehten Achsen, am Beispiel des Vertrauens in Politik und Kirchen
// (ALLBUS 2023, ungewichtet, zwei Hauptkomponenten, Varimax); der Regler dreht die Achsen. Im Reiter mit den 200 Befragten:
// was Varimax aus einer erzwungenen zweiten Komponente macht. Zahlen aus R: b14-faktoren.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, fixed, num } from '../../format';
import { FRAGE, methodenR, pca, pct1, SPALTEN, varimax } from './rechnen';
import { NO_PCA } from './efa';
import { VERTRAUEN as V } from './allbus';
import { EXTRACTION, N_FACTORS, PCA, ROTATION, VARIMAX } from './r-zeichen';

/** Ladungen eines Punkts (x, y), wenn die Achsen um `deg` Grad im Uhrzeigersinn gedreht werden. */
export function turn([x, y]: readonly number[], deg: number): [number, number] {
  const t = deg * Math.PI / 180;
  return [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
}
const REG = V.unrotated[1], KIR = V.unrotated[3];
/** „0,84²“ oder „(−0,39)²“ */
const sq = (v: number) => v < 0 ? `(${fixed(v)})²` : `${fixed(v)}²`;
/** Gerundeter Drehwinkel der Varimax-Lösung. */
export const VARIMAX_DEG = Math.round(V.angle);

export const rotation: ConceptCard = {
  concept: 'rotation',
  picture: 'b14-rotation',
  wofuer: 'Eine Hauptkomponentenanalyse der fünf Vertrauensfragen im ALLBUS 2023 findet zwei Komponenten. Vor der Rotation laden alle fünf Fragen auf der ersten Komponente, die beiden Kirchen zusätzlich auf der zweiten. Wer gehört wozu? Eine Rotation dreht die Achsen so, dass sich die Lösung leichter deuten lässt.',
  kurz: 'Eine Rotation dreht die Achsen einer Lösung mit mehreren Faktoren, bis jede Frage möglichst nur auf einem Faktor hoch lädt. Die Daten und die zusammen erfasste Streuung bleiben dabei gleich.',
  stellDirVor: {
    text: `ALLBUS 2023, ${count(V.n)} Befragte, ungewichtet. Vor der Rotation lädt das Vertrauen in die Bundesregierung mit ${fixed(REG[0])} auf der ersten Komponente und mit ${fixed(REG[1])} auf der zweiten, die katholische Kirche mit ${fixed(KIR[0])} und ${fixed(KIR[1])}. Nach der Varimax-Rotation sind es ${fixed(V.rotated[1][0])} und ${fixed(V.rotated[1][1])} für die Bundesregierung, ${fixed(V.rotated[3][0])} und ${fixed(V.rotated[3][1])} für die katholische Kirche. Zusammen erfassen beide Komponenten vorher wie nachher ${pct1(V.total / 100)} der Streuung.`,
    figures: [
      { label: 'Drehwinkel', value: `etwa ${VARIMAX_DEG} Grad` },
      { label: 'vorher zusammen', value: pct1(V.total / 100) },
      { label: 'nachher zusammen', value: pct1(V.total / 100) },
    ],
  },
  heisst: {
    fach: 'Bei einer Rotation werden die Achsen der Lösung gedreht und die Ladungen für die neuen Achsen umgerechnet. Bei orthogonaler Rotation (Varimax) bleiben die Faktoren unkorreliert, bei schiefwinkliger (Oblimin, Promax) dürfen sie korrelieren; die modellierte gemeinsame Kovarianz bleibt gleich. Als Formel: Λ* = ΛT mit der Ladungsmatrix Λ und einer Transformationsmatrix T.',
  },
  bausteine: [
    {
      title: 'Die Lösung als Punkte sehen',
      was: 'Jede Frage wird ein Punkt: Ihre Ladung auf der ersten Komponente ist die eine Koordinate, die auf der zweiten die andere. Fragen, die zusammengehören, liegen nah beieinander.',
      warum: 'So siehst du die Gruppen sofort: drei Punkte für die Politik, zwei für die Kirchen.',
      acht: 'Die Achsen der ersten Lösung haben keine besondere Bedeutung. Die erste Komponente bündelt nur möglichst viel Streuung.',
      concept: 'loadings',
    },
    {
      title: 'Die Achsen drehen',
      was: `Wir drehen beide Achsen gemeinsam, bis sie möglichst nah an den Punktgruppen liegen. Varimax findet das von selbst, hier bei etwa ${VARIMAX_DEG} Grad.`,
      rechnung: `Bundesregierung: vorher ${fixed(REG[0])} und ${fixed(REG[1])}, nachher ${fixed(V.rotated[1][0])} und ${fixed(V.rotated[1][1])}.`,
      warum: 'Lädt jede Frage nur auf einer Achse hoch, lassen sich die Achsen benennen. Hier heißen sie Vertrauen in die Politik und Vertrauen in die Kirchen.',
      acht: 'Gedreht werden nur die Achsen. Die Punkte bleiben, wo sie sind: Die Daten ändern sich nicht.',
      concept: 'efa',
    },
    {
      title: 'Prüfen, was gleich bleibt',
      was: 'Jeder Punkt behält seinen Abstand zum Ursprung. Darum bleiben die Kommunalität jeder Frage und die zusammen erfasste Streuung gleich.',
      rechnung: `Bundesregierung: ${sq(REG[0])} + ${sq(REG[1])} ≈ ${num(REG[0] ** 2 + REG[1] ** 2)} und ${sq(V.rotated[1][0])} + ${sq(V.rotated[1][1])} ≈ ${num(V.rotated[1][0] ** 2 + V.rotated[1][1] ** 2)}.`,
      warum: `Die Rotation verteilt die erfasste Streuung nur anders. Vorher: ${pct1(V.shareUnrotated[0] / 100)} und ${pct1(V.shareUnrotated[1] / 100)}; nachher: ${pct1(V.shareRotated[0] / 100)} und ${pct1(V.shareRotated[1] / 100)}.`,
      acht: 'Eine Rotation erzeugt keine neue Information. Bei nur einer Komponente gibt es nichts zu drehen.',
      concept: 'communality',
    },
  ],
  ausprobieren: [
    {
      question: 'Du drehst die Achsen um 90 Grad. Was passiert?',
      options: ['die Komponenten tauschen die Plätze', 'die Kommunalitäten ändern sich', 'die Lösung passt besser zu den Daten'], correct: 0, step: 2,
      explain: 'Nach 90 Grad liegt Achse 2 dort, wo vorher Achse 1 lag, und Achse 1 zeigt in die Gegenrichtung der alten Achse 2. Inhaltlich ist es dieselbe Lösung. Schieb den Regler auf 90.',
      kurz: 'Eine Drehung ändert die Sicht, nicht die Lösung.',
    },
    {
      question: 'Varimax hält die Achsen im rechten Winkel. Was, wenn Vertrauen in die Politik und in die Kirchen selbst zusammenhängen?',
      options: ['dann passt eine schiefwinklige Rotation besser', 'dann darf man nicht rotieren'], correct: 0, step: 2,
      explain: `Oblimin oder Promax erlauben korrelierte Faktoren. Wer der Politik vertraut, vertraut hier auch den Kirchen etwas mehr (Korrelationen ${num(V.rQuer[0])} bis ${num(V.rQuer[1])}); das darf das Modell dann abbilden.`,
      kurz: 'Hängen die Merkmale zusammen, darf auch die Rotation sie zusammenhängen lassen.',
    },
    {
      question: 'Ändert die Rotation, wie viel Streuung beide Komponenten zusammen erfassen?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: `Nein, vorher wie nachher ${pct1(V.total / 100)}. Nur die Verteilung auf die beiden Komponenten ändert sich.`,
      kurz: 'Die Summe bleibt, die Verteilung ändert sich.',
    },
  ],
  regler: {
    label: 'Achsen drehen, im Uhrzeigersinn',
    min: 0, max: 90, step: 1, initial: 0,
    format: v => `${Math.round(v)} Grad`,
    describe: v => {
      const [a1, a2] = turn(REG, v), [b1, b2] = turn(KIR, v), deg = Math.round(v);
      const note = deg === 0 ? ' Das ist die Lösung vor der Rotation.' : Math.abs(deg - VARIMAX_DEG) <= 2 ? ' Etwa hier liegt die Varimax-Lösung: Jede Frage lädt fast nur auf einer Achse.' : '';
      return `Bei ${deg} Grad lädt die Bundesregierung mit ${fixed(a1)} auf Achse 1 und mit ${fixed(a2)} auf Achse 2, die katholische Kirche mit ${fixed(b1)} und ${fixed(b2)}.${note}`;
    },
  },
  check: {
    question: 'Was verändert eine Varimax-Rotation?',
    options: [
      'Die Ladungen und wie die erfasste Streuung auf die Faktoren verteilt ist.',
      'Die Antworten der Befragten.',
      'Die Kommunalitäten der Fragen.',
      'Wie viel Streuung alle Faktoren zusammen erfassen.',
    ],
    correct: 0,
    right: 'Genau. Die Achsen drehen sich, damit ändern sich die Ladungen und die Verteilung der Streuung; alles andere bleibt.',
    diagnose: {
      1: 'Noch nicht ganz. Die Daten bleiben unberührt; gedreht werden nur die Achsen der Lösung.',
      2: 'Fast! Die Kommunalitäten bleiben gleich, weil jeder Punkt seinen Abstand zum Ursprung behält.',
      3: `Fast! Die Summe bleibt gleich, hier ${pct1(V.total / 100)}. Nur die Verteilung auf die Faktoren ändert sich.`,
    },
  },
  fuerDich: 'In R ist Varimax bei efa() voreingestellt. Hältst du die Faktoren für korreliert, schreib rotation = "oblimin" oder "promax" ausdrücklich hin, und begründe die Wahl inhaltlich.',
  genau: {
    kurz: 'Eine Rotation macht eine Lösung leichter deutbar, ohne die Passung zu den Daten zu ändern. Welche Rotation passt, ist eine inhaltliche Entscheidung.',
    paragraphs: [
      'Formal: Λ* = ΛT. Bei orthogonaler Rotation ist T eine Drehung, Λ*Λ*′ = ΛΛ′, die modellierte Kovarianz bleibt gleich. Bei schiefwinkliger Rotation gilt ΛΦΛ′ = Λ*Φ*Λ*′ mit den Faktorkorrelationen Φ*.',
      'Varimax sucht die Drehung, bei der die quadrierten Ladungen je Faktor möglichst stark streuen: Ladungen sollen nahe 0 oder nahe 1 liegen. mariposa rechnet wie SPSS mit Kaiser-Normierung; beim Vertrauen war die Lösung nach drei Durchgängen stabil.',
      'Unkorreliert heißt nicht unabhängig. Und erzwungene Unkorreliertheit kann eine unpassende Beschreibung liefern, wenn die Merkmale in Wirklichkeit zusammenhängen.',
      'Eine Rotation kann aus einer überflüssigen Komponente keinen echten Inhalt machen. Bei den fünf Fragen zur Methoden-Zuversicht verteilt Varimax eine erzwungene zweite Komponente auf zwei künstliche Gruppen; das zeigt der Teil mit den 200 Befragten.',
    ],
  },
};

/** Zwei Hauptkomponenten der fünf Fragen, vor und nach Varimax; null, wenn eine Frage nicht streut. */
export function zweiKomponenten(c: SampleCtx) {
  const R = methodenR(c);
  if (!R) return null;
  const p = pca(R, 2), vm = varimax(p.loadings);
  const ss = [0, 1].map(k => vm.loadings.reduce((a, row) => a + row[k] ** 2, 0));
  return { p, vm, ss, total: (p.values[0] + p.values[1]) / 5 };
}

/** „Frage 3 und Frage 5“ */
const und = (js: number[]) => js.length === 1 ? FRAGE[js[0]] : `${js.slice(0, -1).map(j => FRAGE[j]).join(', ')} und ${FRAGE[js[js.length - 1]]}`;

/** Wohin die Fragen nach der Rotation gehören, je Gruppe ein Satz: deutlich auf eine Komponente oder auf beide etwa gleich. */
export function gruppen(L: readonly (readonly number[])[]): string {
  const first: number[] = [], second: number[] = [], both: number[] = [];
  L.forEach((row, j) => { const d = Math.abs(row[0]) - Math.abs(row[1]); (d > 0.1 ? first : d < -0.1 ? second : both).push(j); });
  const verb = (js: number[]) => js.length > 1 ? 'laden' : 'lädt';
  return [
    first.length ? `${und(first)} ${verb(first)} vor allem auf der ersten Komponente.` : '',
    second.length ? `${und(second)} ${verb(second)} vor allem auf der zweiten.` : '',
    both.length ? `${und(both)} ${verb(both)} auf beiden etwa gleich (${both.map(j => `${fixed(L[j][0])} und ${fixed(L[j][1])}`).join('; ')}).` : '',
  ].filter(Boolean).join(' ');
}

export const rotationTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Was passiert, wenn du bei den fünf Fragen zur Methoden-Zuversicht zwei Komponenten erzwingst und mit Varimax drehst?',
    value: c => zweiKomponenten(c)?.total ?? null,
    result: c => {
      const z = zweiKomponenten(c);
      if (!z) return NO_PCA;
      const [d1, d2] = z.p.values, first = z.p.loadings.map(r => r[0]);
      const before = Math.min(...first) >= 0.5 ? `Vor der Rotation laden alle fünf Fragen stark auf der ersten Komponente, zwischen ${num(Math.min(...first))} und ${num(Math.max(...first))}.` : 'Vor der Rotation laden die Fragen vor allem auf der ersten Komponente.';
      return {
        kurz: `${before} Nach Varimax teilen sich die Fragen auf beide Komponenten auf; zusammen erfassen sie wie vorher ${pct1(z.total)}. ${d2 < 1 ? 'Dabei unterscheiden sich die Befragten im Wesentlichen nur in einer Sache.' : 'Die zweite Komponente hat einen Eigenwert über 1.'}`,
        fachlich: `Ungedreht ${pct1(d1 / 5)} und ${pct1(d2 / 5)}, nach Varimax ${pct1(z.ss[0] / 5)} und ${pct1(z.ss[1] / 5)}. Der zweite Eigenwert ist ${num(d2)}${d2 < 1 ? ', also unter 1: Die Aufteilung ist hier ein Kunstprodukt der erzwungenen zweiten Komponente' : ''}.`,
        zusatz: `Nach der Rotation: ${gruppen(z.vm.loadings)}`,
      };
    },
    voraussetzung: 'Rotieren lässt sich erst ab zwei Komponenten. Ob es die zweite überhaupt braucht, entscheidet die Dimensionalität, nicht die Rotation.',
    think: [
      {
        question: 'Frage 1 wird umgepolt, aus 7 wird 1. Was passiert mit dem Anteil, den beide Komponenten zusammen erfassen?',
        options: ['bleibt gleich', 'sinkt', 'steigt'], correct: 0,
        explain: 'Umpolen dreht nur Vorzeichen. Die Eigenwerte bleiben, und die Rotation verteilt dieselbe Summe nur anders.',
        kurz: 'Weder Umpolen noch Drehen ändern die zusammen erfasste Streuung.',
        tryIt: { label: 'Frage 1 umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'efa', variant: 2,
    tokens: { extraction: EXTRACTION, '"pca"': PCA, n_factors: N_FACTORS, rotation: ROTATION, '"varimax"': VARIMAX },
    outputMap: [
      { match: 'PCA/Varimax', atlas: 'Hauptkomponenten, mit Varimax gedreht', step: 2, explain: 'Varimax hat die beiden Achsen gedreht. Bei den fünf Fragen zur Methoden-Zuversicht erzeugt das zwei künstliche Gruppen.' },
      { match: '79.5%', atlas: 'zusammen erfasste Streuung', step: 3, explain: 'Vor und nach der Rotation derselbe Wert: ungedreht 71,2 % und 8,3 %, gedreht 40,0 % und 39,5 %.' },
      { match: '2 components', atlas: 'zwei Komponenten', explain: 'Gedreht werden kann erst ab zwei Komponenten; hier sind sie mit n_factors = 2 erzwungen.' },
      { match: 'KMO', atlas: 'KMO-Wert', explain: 'Prüft vorab die Korrelationen. Mit der Rotation hat er nichts zu tun.' },
    ],
    check: {
      question: 'Welche Zahl zeigt, wie viel beide Komponenten zusammen erfassen, vor und nach der Rotation? Tippe sie an.', correct: '79.5%',
      wrong: {
        KMO: 'Fast! Der KMO-Wert prüft vorab die Korrelationen. Die erfasste Streuung steht hinter Variance explained.',
        N: 'Fast! N ist die Zahl der Befragten. Die erfasste Streuung steht hinter Variance explained.',
      },
    },
  },
  next: {
    next: { id: 'efa', why: 'Die ganze Analyse in R: Extraktion, Zahl der Komponenten und Rotation.' },
    before: [
      { id: 'loadings', why: 'Die Ladungen, die sich beim Drehen ändern.' },
      { id: 'dimensionality', why: 'Erst braucht es mehr als eine Dimension, dann lohnt das Drehen.' },
    ],
    after: [{ id: 'communality', why: 'Bleibt beim Drehen gleich, weil jeder Punkt seinen Abstand behält.' }],
    more: [{ id: 'factor_model', why: 'Bei schiefwinkliger Rotation kommen die Faktorkorrelationen ins Modell.' }],
  },
};
