// Begriffskarte „t-Verteilung“ (Bereich B7). Beispiel: Schlafen die 200 Befragten im Mittel anders lange als 7 Stunden?
// Einstichproben-t-Test wie mariposa::t_test(schlafdauer, mu = 7). Zahlen in R nachgerechnet (b07-verteilungen.test.ts).
// Grenzfall Vorlage: Die Formel T = Z / √(U / ν) liest niemand als Satz; Studierende sollen sehen, wie die
// Freiheitsgrade Form und Grenzen verändern. Deshalb Begriffskarte mit einem Regler für die Freiheitsgrade.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, unit } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { often, pnorm, pt, pValue, qt, series } from './dist';
import { oneSampleT } from '../../../tasks/kit/means';

/** Schlafdauer gegen 7 Stunden (R: t.test(x, mu = 7)); Unterschied und Standardfehler in Minuten. */
export const SCHLAF_T = { mean: 7.0825, diffMin: 4.95, seMin: 3.47794, t: 1.423256, df: 199, p: 0.1562278, pz: 0.1546619 } as const;
const S = SCHLAF_T;
const T = (id: string) => titleFor(ref(id));
/** Grenze für die äußeren 5 % (zweiseitig) bei df Freiheitsgraden. */
export const tCrit = (df: number) => qt(0.975, df);
const fg = (v: number) => unit(v, 'Freiheitsgrad', 'Freiheitsgraden');

export const tVerteilung: ConceptCard = {
  concept: 't_distribution',
  picture: 'b07-t',
  wofuer: 'Schlafen die 200 Befragten im Mittel anders lange als 7 Stunden pro Nacht? Ihr Mittel liegt knapp 5 Minuten darüber. Ob das auffällig ist, prüft der t-Test mit einer Vergleichskurve: der t-Verteilung.',
  kurz: 'Die t-Verteilung sieht aus wie die Standardnormalverteilung, hat aber dickere Ränder. Je mehr Befragte, desto ähnlicher werden die beiden.',
  stellDirVor: {
    text: `Die 200 Befragten schlafen im Mittel ${num(S.mean)} Stunden pro Nacht, ${num(S.diffMin)} Minuten länger als 7 Stunden. Der t-Test teilt diese ${num(S.diffMin)} Minuten durch ihren Standardfehler von ${num(S.seMin)} Minuten: t ≈ ${num(S.t)} bei ${S.df} Freiheitsgraden. Weil die Streuung nur geschätzt ist, ordnet er dieses t mit der t-Verteilung ein.`,
    figures: [
      { label: 'Schlafdauer im Mittel', value: `${num(S.mean)} h` },
      { label: 'Unterschied zu 7 h', value: `${num(S.diffMin)} min` },
      { label: 'Standardfehler', value: `${num(S.seMin)} min` },
      { label: `t bei ${S.df} Freiheitsgraden`, value: num(S.t) },
    ],
  },
  heisst: {
    sym: 't', say: 't',
    fach: 'Die Verteilung von T = Z / √(U / ν), wenn Z standardnormalverteilt ist und U unabhängig davon χ²-verteilt mit ν Freiheitsgraden. Sie ist symmetrisch um 0 und nähert sich mit wachsendem ν der Standardnormalverteilung.',
  },
  bausteine: [
    {
      title: 'Den Unterschied in Standardfehlern messen',
      was: 'Der t-Test teilt einen Unterschied durch seinen Standardfehler. t sagt also, wie viele Standardfehler der Unterschied groß ist.',
      rechnung: `t = ${num(S.diffMin)} Minuten / ${num(S.seMin)} Minuten ≈ ${num(S.t)}. R meldet t(199) = 1.423.`,
      warum: 'Ob knapp 5 Minuten viel sind, hängt davon ab, wie stark die Schlafdauer schwankt. Der Standardfehler rechnet das ein.',
      acht: 'Der Standardfehler ist selbst geschätzt, aus der Streuung der Befragten. Genau diese Unsicherheit macht aus der Glocke die t-Verteilung.',
      concept: 'test_statistic',
    },
    {
      title: 'Die geschätzte Streuung einrechnen',
      was: 'Statt mit der wahren Streuung rechnet t mit s, der Streuung der Befragten. Deshalb schwankt t etwas stärker als ein z-Wert, der mit der wahren Streuung rechnet. Große Werte kommen öfter vor: Die Ränder der t-Verteilung sind dicker.',
      warum: 'Bei wenigen Befragten kann s zufällig klein ausfallen. Dann kann t groß werden, auch wenn es in Wahrheit keinen Unterschied gibt.',
      acht: 'Die t-Verteilung beschreibt nicht die Daten. Sie zeigt, wie t von Stichprobe zu Stichprobe schwanken würde, wenn es keinen Unterschied gäbe.',
      concept: 'null_distribution',
    },
    {
      title: 'Die Freiheitsgrade ablesen',
      was: 'Welche t-Verteilung gilt, sagen die Freiheitsgrade. Beim Test einer Gruppe gegen einen festen Wert sind es n − 1; R schreibt sie in Klammern hinter t.',
      rechnung: `Grenze für die äußeren 5 %: 5 Befragte, 4 Freiheitsgrade: ±${num(tCrit(4))}. 31 Befragte, 30 Freiheitsgrade: ±${num(tCrit(30))}. 200 Befragte, 199 Freiheitsgrade: ±${num(tCrit(199))}. Standardnormalverteilung: ±1,96.`,
      warum: 'Mit mehr Befragten ist s genauer geschätzt. Dann rückt t an z heran, und die Grenzen schrumpfen Richtung 1,96.',
      acht: 'Der Welch-Test rechnet mit krummen Freiheitsgraden wie 175,8. Das ist kein Fehler, sondern eine Näherung für ungleiche Streuungen.',
      concept: 'general_df',
    },
  ],
  ausprobieren: [
    {
      question: 'Bei 4 Freiheitsgraden meldet ein Test t = 2,5. Liegt das jenseits der Grenze für die äußeren 5 %?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: `Die Grenze liegt bei ${num(tCrit(4))}; t = 2,5 liegt noch innerhalb. Bei der Standardnormalverteilung (1,96) läge es außerhalb. Schieb den Regler auf 4.`,
      kurz: 'Wenige Freiheitsgrade, weiter außen liegende Grenzen.',
    },
    {
      question: 'Was passiert mit der Grenze für die äußeren 5 %, wenn die Freiheitsgrade wachsen?',
      options: ['Sie sinkt und nähert sich 1,96.', 'Sie steigt.', 'Sie bleibt bei 1,96.'], correct: 0, step: 3,
      explain: `Mit mehr Freiheitsgraden ist die Streuung genauer geschätzt, die Ränder werden dünner. Von ${num(tCrit(1))} bei einem Freiheitsgrad fällt die Grenze auf ${num(tCrit(199))} bei 199.`,
      kurz: 'Viele Befragte: Die t-Verteilung gleicht fast der Standardnormalverteilung.',
    },
    {
      question: 'Warum hat die t-Verteilung dickere Ränder als die Standardnormalverteilung?',
      options: ['weil die Streuung geschätzt ist', 'weil die Daten schief sind'], correct: 0, step: 2,
      explain: 'Im Nenner von t steht ein geschätzter Standardfehler. Fällt er zufällig klein aus, wird t groß. Mit der Form der Daten hat das nichts zu tun.',
      kurz: 'Unsicherheit über s macht die Ränder dicker.',
    },
  ],
  regler: {
    label: 'Wie viele Freiheitsgrade hat die t-Verteilung?',
    min: 1, max: 200, step: 1, initial: 4,
    format: v => unit(v, 'Freiheitsgrad', 'Freiheitsgrade'),
    describe: v => {
      const p = often(2 * pt(-S.t, v)), own = Math.abs(v - S.df) < 1e-9;
      return `Bei ${fg(v)} liegen die äußeren 5 % jenseits von ±${num(tCrit(v))}, bei der Standardnormalverteilung jenseits von ±1,96. Der t-Test der Schlafdauer hat ${S.df} Freiheitsgrade${own ? ':' : `. Hätte er ${v < S.df ? 'nur ' : ''}${num(v)},`} ${own ? 'Gäbe es keinen Unterschied, käme' : 'käme ohne Unterschied'} ein t von ${num(S.t)} oder weiter außen ${p} Stichproben vor.`;
    },
  },
  check: {
    question: 'Ein t-Test mit 10 Befragten einer Gruppe meldet t(9) = 2,1. Wo liegt die Grenze für die äußeren 5 %?',
    options: ['bei 1,96', `bei ${num(tCrit(9))}`, 'bei 2,1'],
    correct: 1,
    right: `Genau. Bei 9 Freiheitsgraden liegen die äußeren 5 % jenseits von ±${num(tCrit(9))}. t = 2,1 liegt also noch innerhalb.`,
    diagnose: {
      0: 'Fast! 1,96 gilt für die Standardnormalverteilung, also für sehr viele Freiheitsgrade. Bei 9 sind die Ränder dicker.',
      2: 'Fast! 2,1 ist die Prüfgröße selbst. Die Grenze kommt aus der t-Verteilung mit 9 Freiheitsgraden.',
    },
  },
  fuerDich: `Steht in einem Artikel „t(28) = 2,3“, weißt du jetzt: 28 Freiheitsgrade, bei einer Gruppe also 29 Befragte. Die Grenze für die äußeren 5 % liegt dann bei ${num(tCrit(28))}, etwas über 1,96.`,
  genau: {
    kurz: 'Exakt gilt die t-Verteilung nur für normalverteilte Daten. Bei großen Gruppen passt sie dank des zentralen Grenzwertsatzes auch sonst gut.',
    paragraphs: [
      'T = Z / √(U / ν): Z ist standardnormalverteilt, U unabhängig davon χ²-verteilt mit ν Freiheitsgraden. Beim t-Test ist Z der Unterschied geteilt durch den wahren Standardfehler; U kommt aus der geschätzten Streuung.',
      'Exakt gilt das, wenn die Werte in der Grundgesamtheit normalverteilt sind. Bei großen Gruppen ist der Mittelwert nach dem zentralen Grenzwertsatz annähernd normalverteilt; dann passt die t-Verteilung auch bei anderer Form gut.',
      'Bei einem Freiheitsgrad hat die t-Verteilung so dicke Ränder, dass sie keinen Erwartungswert hat. Ab ν > 2 ist ihre Varianz ν / (ν − 2), also immer größer als 1.',
      `Für die Schlafdauer gegen 7 Stunden liefert die t-Verteilung mit 199 Freiheitsgraden p ≈ ${num(S.p)}, die Standardnormalverteilung p ≈ ${num(S.pz)}. Beide fragen: Wie oft käme ein t mindestens so weit von 0 vor, wenn das Mittel aller Menschen genau 7 Stunden wäre?`,
      'Beim Welch-Test für zwei Gruppen mit ungleicher Streuung rechnet R die Freiheitsgrade nach Welch und Satterthwaite aus. Daher kommen Werte wie 175,8.',
    ],
  },
};

/** Einstichproben-t-Test der Schlafdauer gegen 7 Stunden für die aktuellen Daten. */
export function tFit(c: SampleCtx) {
  const { xs, n, mean, sd } = series(c.rows, c.columns.x?.[0] ?? 'schlafdauer'), test = oneSampleT(xs, null, 7);
  if (!test || sd < 1e-9 * Math.max(1, Math.abs(mean))) return null;  // ohne Streuung (bis auf Rundungsreste) kein t
  return { n, mean, sd, se: sd / Math.sqrt(n), t: test.t, df: test.df, crit: tCrit(test.df), p: test.p, pz: 2 * pnorm(-Math.abs(test.t)) };
}

export const tTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schlafdauer' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Schlafen sie im Mittel anders lange als 7 Stunden pro Nacht?',
    value: c => tFit(c)?.t ?? null,
    result: c => {
      const f = tFit(c);
      if (!f) return { kurz: 'Alle Befragten haben dieselbe Schlafdauer. Ohne Streuung lässt sich kein t-Test rechnen.', fachlich: 'Der Standardfehler ist 0; t ist nicht definiert.' };
      const d = f.mean - 7;
      const gap = Math.abs(d) < 1e-9 ? 'genau 7 Stunden' : `${num(Math.abs(d) * 60)} Minuten ${d > 0 ? 'über' : 'unter'} 7 Stunden`;
      return {
        kurz: `Im Mittel schlafen die Befragten ${num(f.mean)} Stunden pro Nacht, ${gap}. Das ergibt t = ${num(f.t)} bei ${f.df} Freiheitsgraden; die Grenze für die äußeren 5 % liegt bei ±${num(f.crit)}. Wäre das Mittel aller Menschen 7 Stunden, käme ein t mindestens so weit von 0 ${often(f.p)} Stichproben vor.`,
        fachlich: `Einstichproben-t-Test gegen 7 Stunden: Unterschied ${num(d * 60)} Minuten, Standardfehler ${num(f.se * 60)} Minuten, t ≈ ${num(f.t)}, df = ${f.df}, zweiseitig p ${pValue(f.p)}. Mit der Standardnormalverteilung statt der t-Verteilung wäre p ${pValue(f.pz)}.`,
        zusatz: `Bei ${f.df} Freiheitsgraden ist die t-Verteilung kaum von der Standardnormalverteilung zu unterscheiden: Grenze ${num(f.crit)} statt 1,96.`,
      };
    },
    voraussetzung: 'Der Test nimmt unabhängige Befragte an. Das Mittel soll annähernd normalverteilt sein; bei 200 Befragten ist das nach dem zentralen Grenzwertsatz meist erfüllt.',
    think: [
      {
        question: 'Alle schlafen eine halbe Stunde länger. Was passiert mit t?',
        options: ['steigt deutlich', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Das Mittel rückt eine halbe Stunde weiter von 7 Stunden weg, der Standardfehler bleibt. In den Ausgangsdaten springt t von 1,42 auf etwa 10.',
        kurz: 'Größerer Unterschied, größeres t.',
        tryIt: { label: 'alle eine halbe Stunde länger', op: 'shift', column: 'x', value: 0.5 },
        expect: { change: 'up', atLeast: 1 },
      },
      {
        question: 'Die gewählte Person schläft plötzlich 14 Stunden pro Nacht. Was passiert mit der Zahl der Freiheitsgrade?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Die Freiheitsgrade zählen nur Befragte: n − 1 = 199. Welche Werte sie haben, spielt dafür keine Rolle.',
        kurz: 'Freiheitsgrade hängen an der Fallzahl, nicht an den Werten.',
        tryIt: { label: 'die gewählte Person auf 14 Stunden', op: 'outlier', column: 'x', value: 14 },
        expect: { change: 'same', measure: c => tFit(c)?.df ?? null },
      },
      {
        question: 'Alle schlafen eine halbe Stunde weniger. Was passiert mit t?',
        options: ['steigt', 'bleibt gleich', 'sinkt deutlich'], correct: 2,
        explain: 'Das Mittel rutscht unter 7 Stunden, der Standardfehler bleibt. In den Ausgangsdaten fällt t von 1,42 auf etwa −7,2.',
        kurz: 'Liegt das Mittel unter dem Vergleichswert, wird t negativ.',
        tryIt: { label: 'alle eine halbe Stunde kürzer', op: 'shift', column: 'x', value: -0.5 },
        expect: { change: 'down', atLeast: 1 },
      },
    ],
  },
  r: {
    entry: 't_test', variant: 2,
    tokens: {
      t_test: { sym: 't_test()', term: T('t_test'), kurz: 'Vergleicht einen Mittelwert mit einem festen Wert oder zwei Gruppen miteinander. R meldet t, die Freiheitsgrade in Klammern und p.', fehler: 'Ohne mu = 7 testet R gegen 0 und meldet für die Schlafdauer t(199) = 122.184.' },
    },
    outputMap: [
      { match: 't', atlas: 't', step: 1, explain: 'Der Unterschied zu 7 Stunden, geteilt durch seinen Standardfehler.' },
      { match: '199', atlas: 'Freiheitsgrade', step: 3, explain: 'Die Freiheitsgrade n − 1 = 199. Sie wählen die passende t-Verteilung aus.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Wäre das Mittel aller Menschen genau 7 Stunden, käme ein t mindestens so weit von 0 in etwa 16 von 100 Stichproben vor. Die Fläche dafür kommt aus der t-Verteilung.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten. Ihre Zahl minus 1 ergibt die Freiheitsgrade.' },
    ],
    check: {
      question: 'Welche Zahl legt fest, welche t-Verteilung gilt? Tippe sie an.', correct: '199',
      wrong: {
        t: 'Fast! Das ist die Prüfgröße t. Welche t-Verteilung gilt, steht in Klammern davor.',
        p: 'Fast! Das ist der p-Wert, eine Fläche unter der t-Verteilung. Welche t-Verteilung gilt, steht in Klammern hinter t.',
        N: 'Fast! N zählt die Befragten. Die Freiheitsgrade sind N − 1 und stehen in Klammern hinter t.',
      },
    },
  },
  next: {
    next: { id: 't_test', why: 'Der Test, der seine Prüfgröße t mit dieser Verteilung einordnet.' },
    before: [
      { id: 'standard_normal', why: 'Die Glocke, der die t-Verteilung bei vielen Freiheitsgraden gleicht.' },
      { id: 'general_df', why: 'Die Freiheitsgrade wählen die passende t-Verteilung aus.' },
      { id: 'se', why: 'Der geschätzte Standardfehler im Nenner von t.' },
    ],
    after: [
      { id: 'confidence', why: 'Bei kleinen Stichproben nimmt das Intervall die Grenze der t-Verteilung statt 1,96.' },
      { id: 'pearson', why: 'Auch r wird über eine t-Prüfgröße getestet.' },
    ],
    more: [
      { id: 'prediction_interval', why: 'Vorhersagebereiche der Regression nutzen ebenfalls t-Grenzen.' },
      { id: 'f_distribution', why: 'Bei zwei Gruppen ist F das Quadrat von t, beim t-Test mit gleichen Varianzen.' },
    ],
  },
};
