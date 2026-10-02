// Begriffskarte „Ladungen“: welche Frage zu welcher Komponente gehört, am Beispiel des Vertrauens in Politik und Kirchen
// (ALLBUS 2023, ungewichtet, Hauptkomponenten mit Varimax). Zahlen aus R: b14-faktoren.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, fixed, num } from '../../format';
import { FRAGE, methodenPca, SPALTEN } from './rechnen';
import { loadingList, loadingSentence, NO_PCA } from './efa';
import { VERTRAUEN as V } from './allbus';
import { PCA_TOKENS } from './r-zeichen';

const L = V.rotated;
const cross = L.map((row, i) => row[i < 3 ? 1 : 0]);

export const loadings: ConceptCard = {
  concept: 'loadings',
  picture: 'b14-ladungen',
  wofuer: 'Eine Hauptkomponentenanalyse der fünf Vertrauensfragen im ALLBUS 2023 findet zwei Komponenten. Aber welche Frage gehört zu welcher? Die Ladungen sagen es dir, Frage für Frage.',
  kurz: 'Eine Ladung sagt dir, wie eng eine Frage mit einem Faktor zusammenhängt. Nahe 1: Die Frage gehört fest dazu; nahe 0: Sie hat mit ihm wenig zu tun.',
  stellDirVor: {
    text: `ALLBUS 2023, ${count(V.n)} Befragte, ungewichtet, zwei Komponenten nach der Varimax-Rotation. Bundesregierung (${fixed(L[1][0])}), Bundestag (${fixed(L[0][0])}) und Parteien (${fixed(L[2][0])}) laden stark auf der ersten Komponente, dem Vertrauen in die Politik. Katholische (${fixed(L[3][1])}) und evangelische Kirche (${fixed(L[4][1])}) laden stark auf der zweiten. Auf der jeweils anderen Komponente liegen alle Ladungen nur bei ${fixed(Math.min(...cross))} bis ${fixed(Math.max(...cross))}.`,
  },
  heisst: {
    sym: 'λⱼₖ', say: 'Lambda j k',
    fach: 'Die Ladung λⱼₖ verbindet Frage j mit Faktor k: Zⱼ = λⱼ₁F₁ + … + λⱼₘFₘ + εⱼ für standardisierte Fragen. Sind die Faktoren untereinander und mit den Resten unkorreliert, ist λⱼₖ die Korrelation zwischen Frage und Faktor.',
  },
  bausteine: [
    {
      title: 'Frage und Komponente korrelieren',
      was: 'Für jede Frage messen wir, wie eng sie mit der Komponente zusammenhängt. Bei unkorrelierten Komponenten ist das genau ihre Korrelation.',
      rechnung: `Bundesregierung mit der Komponente Politik: ${fixed(L[1][0])}, mit der Komponente Kirchen: ${fixed(L[1][1])}.`,
      warum: 'Eine Korrelation kennst du schon: −1 bis 1, nahe 0 heißt kein Zusammenhang. Genauso liest du Ladungen.',
      acht: 'Erlaubt eine Rotation korrelierte Faktoren, sind Ladungen keine Korrelationen mehr. Dann gibt es Muster- und Strukturladungen.',
      concept: 'pearson',
    },
    {
      title: 'Das Muster lesen',
      was: 'Wir suchen für jede Frage die Komponente mit der größten Ladung. Hier: drei Fragen zur Politik, zwei zu den Kirchen.',
      warum: 'Fragen mit hohen Ladungen auf derselben Komponente messen etwas Gemeinsames. Danach benennst du die Komponente.',
      acht: 'Lädt eine Frage auf zwei Komponenten ähnlich hoch, ist sie nicht eindeutig zugeordnet. Das ist ein Befund, kein Fehler der Rechnung.',
      concept: 'dimensionality',
    },
    {
      title: 'Auf das Vorzeichen achten',
      was: 'Eine negative Ladung heißt: Die Frage läuft gegen die Komponente. Wer dort hoch liegt, stimmt ihr eher nicht zu.',
      warum: 'Verkehrt gepolte Fragen erkennst du so sofort. Polst du sie um, wird die Ladung positiv, mit gleichem Betrag.',
      acht: 'Das Vorzeichen einer ganzen Komponente ist frei wählbar. Kehrt R alle Ladungen einer Komponente um, ändert sich am Modell nichts.',
      concept: 'recode',
    },
  ],
  ausprobieren: [
    {
      question: 'Eine Frage hat die Ladungen 0,45 auf der ersten und 0,5 auf der zweiten Komponente. Wohin gehört sie?',
      options: ['eindeutig zur zweiten', 'zu keiner eindeutig'], correct: 1, step: 2,
      explain: 'Die beiden Ladungen liegen nah beieinander. Die Frage misst etwas von beidem; eine klare Zuordnung gibt es nicht.',
      kurz: 'Zwei ähnliche Ladungen heißen: nicht eindeutig.',
    },
    {
      question: 'Bei den Methoden-Fragen im Lehrdatensatz lädt Frage 1 mit 0,85. Welche Ladung hat sie, wenn du sie umpolst?',
      options: ['0,85', '−0,85', '0'], correct: 1, step: 3,
      explain: 'Umpolen dreht nur das Vorzeichen: −0,85. Der Zusammenhang ist genauso eng, nur in die andere Richtung. Probier es im Teil mit den 200 Befragten aus.',
      kurz: 'Umpolen ändert das Vorzeichen, nicht die Stärke.',
    },
    {
      question: 'Ist eine Ladung von 0,4 die feste Grenze, ab der eine Frage zu einem Faktor gehört?',
      options: ['ja', 'nein, das ist eine Faustregel'], correct: 1, step: 2,
      explain: 'Die Grenze 0,4 ist verbreitet, aber keine Regel der Statistik. mariposa blendet mit blank = .40 nur kleine Ladungen in der Ausgabe aus.',
      kurz: 'Schwellen für Ladungen sind Faustregeln.',
    },
  ],
  check: {
    question: 'Eine Frage lädt mit 0,1 auf einem Faktor. Was heißt das?',
    options: [
      'Sie hängt kaum mit diesem Faktor zusammen.',
      'Sie gehört fest zu diesem Faktor.',
      'Sie misst den Faktor zu 10 %.',
      'Sie läuft gegen den Faktor.',
    ],
    correct: 0,
    right: 'Genau. 0,1 ist eine sehr schwache Korrelation: Die Frage hat mit diesem Faktor kaum etwas zu tun.',
    diagnose: {
      1: 'Fast! Dafür müsste die Ladung nahe 1 liegen. 0,1 ist eine sehr schwache Korrelation.',
      2: 'Fast! Eine Ladung ist keine Prozentzahl. Quadriert ergibt sie den erfassten Anteil, hier nur 1 %.',
      3: 'Noch nicht ganz. Gegen den Faktor liefe sie bei einer negativen Ladung.',
    },
  },
  fuerDich: 'In R zeigt summary() nach efa() die Ladungen als Tabelle. Lies sie Zeile für Zeile: Wo ist die größte Ladung, und gibt es eine zweite, fast so große?',
  genau: {
    kurz: 'Ladungen gelten immer für ein bestimmtes Modell und eine bestimmte Rotation. Bei korrelierten Faktoren unterscheiden sich Muster- und Strukturladungen.',
    paragraphs: [
      'Formel: Zⱼ = λⱼ₁F₁ + … + λⱼₘFₘ + εⱼ für standardisierte Fragen und Faktoren mit Varianz 1. Sind Faktoren und Reste unkorreliert, ist λⱼₖ die Korrelation von Frage j mit Faktor k.',
      'Bei korrelierten Faktoren (Oblimin, Promax) gilt Struktur = ΛΦ mit der Faktorkorrelationsmatrix Φ. Musterladungen können dann auch außerhalb von −1 bis 1 liegen.',
      'Ladungen sind nicht automatisch die Gewichte, mit denen man Werte je Person berechnet. Und eine Schwelle wie 0,4 ist keine allgemeine Gütegrenze.',
      `Die Zahlen im Beispiel stammen aus einer Hauptkomponentenanalyse mit zwei Komponenten und Varimax-Rotation (ALLBUS 2023, ${count(V.n)} Befragte, ungewichtet). Streng genommen sind es Komponenten, keine gemeinsamen Faktoren; gelesen werden die Ladungen gleich.`,
    ],
  },
};

const firstLoadings = (c: SampleCtx) => { const p = methodenPca(c, 1); return p ? p.loadings.map(r => r[0]) : null; };

export const loadingsTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Die Ladungen der fünf Fragen zur Methoden-Zuversicht auf der ersten Hauptkomponente, mit allen 200 Befragten.',
    value: c => firstLoadings(c)?.[0] ?? null,
    result: c => {
      const p = methodenPca(c, 1);
      if (!p) return NO_PCA;
      const l = p.loadings.map(r => r[0]);
      return {
        kurz: `Frage 1 lädt mit ${num(l[0])} auf der Komponente. ${loadingSentence(l)}`,
        fachlich: `Ladungen der ersten Hauptkomponente, Eigenvektor mal √${num(p.values[0])}: ${loadingList(l)}.`,
        zusatz: `Quadriert ergibt die Ladung von ${FRAGE[0]} den Anteil ihrer Streuung, den die Komponente erfasst: mit allen Nachkommastellen ${num(p.communalities[0])}.`,
      };
    },
    voraussetzung: 'Mit einer einzigen Komponente ist jede Ladung die Korrelation der Frage mit der Komponente. Jede Frage muss streuen.',
    think: [
      {
        question: 'Frage 1 wird umgepolt, aus 7 wird 1. Was passiert mit ihrer Ladung?',
        options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1,
        explain: 'Frage 1 läuft jetzt gegen die anderen. Ihre Ladung hat denselben Betrag, aber ein Minus davor, in den Ausgangsdaten −0,85.',
        kurz: 'Umpolen dreht das Vorzeichen der Ladung.',
        tryIt: { label: 'Frage 1 umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
      {
        question: 'Jetzt wird Frage 2 umgepolt. Was passiert mit der Ladung von Frage 1?',
        options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird kleiner'], correct: 0,
        explain: 'Umpolen ändert nur die Zeile der umgepolten Frage. Die Ladung von Frage 1 bleibt genau gleich.',
        kurz: 'Jede Frage behält ihre Ladung, wenn eine andere umgepolt wird.',
        tryIt: { label: 'Frage 2 umpolen', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'efa', variant: 0,
    tokens: PCA_TOKENS,
    outputMap: [
      { match: 'summary()', atlas: 'Tabelle mit den Ladungen', step: 1, explain: 'summary() zeigt die Komponentenmatrix mit allen fünf Ladungen, hier 0.829 bis 0.857.' },
      { match: '71.2%', atlas: 'Summe der quadrierten Ladungen geteilt durch 5', explain: 'Die fünf Ladungen quadriert und zusammengezählt ergeben 3,56. Geteilt durch 5 sind das 71,2 %.' },
      { match: '1 component', atlas: 'eine Komponente', explain: 'Jede Frage hat eine Ladung, weil es nur eine Komponente gibt.' },
    ],
    check: {
      question: 'Wo verweist R auf die Tabelle mit den Ladungen? Tippe es an.', correct: 'summary()',
      wrong: {
        '71.2%': 'Fast! In diesem Anteil stecken die quadrierten Ladungen aller fünf Fragen. Die Tabelle selbst zeigt summary().',
        KMO: 'Fast! Der KMO-Wert prüft vorab die Korrelationen. Die Ladungen zeigt summary().',
      },
    },
  },
  next: {
    next: { id: 'communality', why: 'Die quadrierten Ladungen einer Frage, zusammengezählt.' },
    before: [
      { id: 'dimensionality', why: 'Legt fest, auf wie vielen Komponenten oder Faktoren jede Frage eine Ladung hat.' },
      { id: 'pearson', why: 'Bei unkorrelierten Faktoren ist eine Ladung eine Korrelation.' },
    ],
    after: [
      { id: 'rotation', why: 'Dreht die Achsen, bis die Ladungen ein klares Muster zeigen.' },
      { id: 'reliability', why: 'Omega rechnet mit den Ladungen eines Faktors.' },
    ],
    more: [{ id: 'factor_model', why: 'Ladungen sind die Parameter des Faktorenmodells.' }],
  },
};
