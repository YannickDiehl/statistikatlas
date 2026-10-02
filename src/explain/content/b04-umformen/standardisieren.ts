// Werkstatt „Standardisieren“ (Begriff `z`): Mitte abziehen, Streuung messen, durch s teilen, z lesen. Schritt 4 ist
// die Skalierung durch Division (`scaling`). Die ersten beiden Schritte stammen aus der Werkstatt „Zentrieren“.
// Ton nach src/explain/content/streuung.ts; Zahlen in R nachgerechnet, siehe b04-umformen.test.ts.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, Step, Workshop } from '../../types';
import { num, signed, close, paren } from '../../format';
import { NAMES, P, N, eq, lernzeit, scaleNote, sds, shiftWithin, sumText, toMiddle, zstats, type ZStats } from './shared';
import { COL_DEV, COL_X, LINEAL_BOUNDS, LINEAL_PRESETS, LINE_MITTE, LINE_ZENTRIEREN, STEP_MITTE, STEP_ZENTRIEREN, meanNodes } from './zentrieren';

type C = Ctx<ZStats>;
type BC = BridgeCtx<ZStats>;

const zOf = (c: { s: ZStats; who: number }) => c.s.z ? c.s.z[c.who] : null;
/** „1,5 Standardabweichungen unter der Mitte“, „genau auf der Mitte“. */
const zPlace = (z: number) => Math.abs(z) < 0.005 ? 'genau auf der Mitte' : `${sds(Math.abs(z))} ${z > 0 ? 'über' : 'unter'} der Mitte`;

const STEP_STREUUNG: Step<ZStats> = {
  button: 's', title: 'Die Streuung messen', sym: 's', say: 's', concept: 'sd', perPerson: false,
  links: [{ id: 'variance', label: 'Varianz' }, { id: 'ss', label: 'Quadratsumme' }],
  was: 'Wir bestimmen die Standardabweichung s wie in der Werkstatt Streuung: Abstände quadrieren, zusammenzählen, durch 4 teilen, Wurzel ziehen.',
  rechnung: c => c.s.sd > 1e-9
    ? `s = √((${c.s.sq.map(q => num(q)).join(' + ')}) / 4) ${eq(c.s.ss)} √(${num(c.s.ss)} / 4) ${eq(c.s.variance)} √${num(c.s.variance)} ${eq(c.s.sd)} ${num(c.s.sd)}`
    : 'Alle Abstände sind 0, also ist auch s = 0.',
  fach: 'Die Standardabweichung s ist die Wurzel aus der Quadratsumme geteilt durch n − 1. Sie dient gleich als Maßstab.',
  warum: 'Ob 3 Stunden unter der Mitte viel sind, hängt davon ab, wie stark die Gruppe streut. s liefert dafür den Maßstab.',
  acht: c => c.s.sd > 1e-9
    ? `Teile durch n − 1 = 4, nicht durch 5. Sonst kommt ${num(c.s.sdN)} statt ${num(c.s.sd)} heraus, und alle z-Werte rücken etwas zu weit von der 0 weg.`
    : 'Hier ist s = 0. Durch 0 kann man nicht teilen, z-Werte gibt es dann nicht.',
  check: {
    question: 'Wie groß ist s? Zwei Nachkommastellen reichen.',
    answer: c => c.s.sd,
    diagnose: (c, v) => {
      if (v === 'NA' || c.s.sd < 1e-9) return null;
      if (Math.abs(c.s.variance - c.s.sd) > 0.02 && close(v, c.s.variance)) return 'Fast! Das ist die Varianz, die Zahl vor der Wurzel. Zieh noch die Wurzel.';
      if (Math.abs(c.s.sdN - c.s.sd) > 0.02 && close(v, c.s.sdN)) return 'Fast! Du hast durch 5 geteilt. Bei der Streuung teilst du durch n − 1 = 4.';
      if (close(v, c.s.ss)) return 'Fast! Das ist die Quadratsumme. Teile sie durch 4 und zieh die Wurzel.';
      return null;
    },
  },
};

const STEP_TEILEN: Step<ZStats> = {
  button: '÷ s', title: 'Durch die Streuung teilen', sym: '(xᵢ − x̄) / s', say: 'x i minus x quer, geteilt durch s', concept: 'scaling', perPerson: true,
  was: 'Jeden Abstand zur Mitte teilen wir durch s. So sehen wir, wie viele Standardabweichungen in ihm stecken.',
  rechnung: c => {
    const z = zOf(c);
    return z === null ? 'Hier ist s = 0. Teilen durch 0 geht nicht, z ist nicht definiert.'
      : `Person ${P(c)}: ${signed(c.s.dev[c.who])} / ${num(c.s.sd)} ${eq(z)} ${signed(z)}.`;
  },
  fach: 'Alle zentrierten Werte werden durch dieselbe positive Zahl s geteilt. Die Abstände ändern sich im Verhältnis 1 / s, ihre Reihenfolge bleibt.',
  warum: 'Danach ist s die Einheit: 1 heißt eine Standardabweichung. Die Stunden kürzen sich weg, übrig bleibt eine Zahl ohne Einheit.',
  acht: c => {
    const z = zOf(c);
    return z === null ? 'Teilen geht nur, wenn s größer als 0 ist. Lernen alle gleich lange, gibt es keine z-Werte.'
      : `Erst die Mitte abziehen, dann teilen. Wer die Lernzeit selbst teilt, bekommt für ${P(c)} ${num(c.s.xs[c.who])} / ${num(c.s.sd)} ${eq(c.s.raw![c.who])} ${num(c.s.raw![c.who])} statt ${signed(z)}.`;
  },
  check: {
    question: c => `Was kommt heraus, wenn du den Abstand von Person ${P(c)} durch s teilst?`,
    answer: c => zOf(c) ?? 'NA',
    diagnose: (c, v) => {
      const z = zOf(c);
      if (v === 'NA' || z === null) return null;
      const d = c.s.dev[c.who], raw = c.s.raw![c.who];
      if (!close(raw, z) && close(v, raw)) return `Fast! Du hast die Lernzeit selbst geteilt. Teile den Abstand zur Mitte, also ${signed(d)}.`;
      if (Math.abs(z) > 1e-9 && close(v, -z)) return 'Fast! Die Zahl stimmt, nur das Vorzeichen nicht. Der Abstand zur Mitte behält beim Teilen seine Seite.';
      if (Math.abs(c.s.sd - 1) > 0.02 && Math.abs(d) > 1e-9 && close(v, d * c.s.sd)) return 'Fast! Du hast malgenommen. Teile den Abstand durch s.';
      if (Math.abs(c.s.variance - c.s.sd) > 0.02 && Math.abs(d) > 1e-9 && close(v, d / c.s.variance)) return 'Fast! Du hast durch die Varianz geteilt. Teile durch s, nicht durch s².';
      return null;
    },
  },
};

const STEP_Z: Step<ZStats> = {
  button: 'zᵢ', title: 'Den z-Wert lesen', sym: 'zᵢ', say: 'z i', concept: 'z', perPerson: true,
  links: [{ id: 'positive_sd', label: 'Die Werte streuen' }],
  was: 'Das Ergebnis heißt z-Wert. Er sagt, wie viele Standardabweichungen eine Person über oder unter der Mitte liegt.',
  rechnung: c => {
    const z = zOf(c);
    if (z === null) return 'Ohne Streuung gibt es keine z-Werte.';
    const zs = c.s.z!, total = zs.reduce((a, v) => a + Math.round(v * 100) / 100, 0);
    return `z für ${P(c)} = ${signed(z)}: ${P(c)} liegt ${zPlace(z)}. Alle fünf z-Werte zusammen: ${sumText(zs)} = 0${Math.abs(total) > 0.001 ? ', bis auf Rundung' : ''}.`;
  },
  fach: 'Die z-Standardisierung zieht den Mittelwert ab und teilt durch die Standardabweichung: zᵢ = (xᵢ − x̄) / s. Die z-Werte haben den Mittelwert 0 und die Standardabweichung 1.',
  warum: 'Ein z-Wert hat keine Einheit. Deshalb kannst du ihn über verschiedene Fragen hinweg vergleichen: z = 1 heißt überall eine Standardabweichung über der Mitte.',
  acht: 'z-Werte machen aus keiner Verteilung eine Normalverteilung. Die Form der Verteilung bleibt, nur das Lineal ändert sich.',
  check: {
    question: 'Wo liegt die Mitte der fünf z-Werte?',
    answer: c => c.s.z ? 0 : 'NA',
    diagnose: (c, v) => {
      if (v === 'NA' || !c.s.z) return null;
      if (Math.abs(c.s.mean) > 0.02 && close(v, c.s.mean)) return 'Fast! Das ist die Mitte der Lernzeiten in Stunden. Die z-Werte haben ihre Mitte bei 0.';
      if (close(v, 1)) return 'Fast! 1 ist die Standardabweichung der z-Werte. Ihre Mitte liegt bei 0.';
      return null;
    },
  },
};

// ---------- Brücke ----------

export const bridgeStandardisieren: Bridge<ZStats> = {
  data: 'series',
  numeric: c => {
    const z = zOf(c);
    return [
      ...meanNodes(c), { br: true },
      's = √( Σ(xᵢ − x̄)² / ', { part: [`${N(c) - 1}`], m: 3 }, ' ) ', eq(c.s.sd), ' ', { part: [c.u(c.s.sd)], m: 3 }, { br: true },
      `z für ${P(c)} = (`, { part: [`${num(c.values[c.who])} −`], m: 2 }, ' ', { part: [num(c.s.mean)], m: 1 }, ') ', { part: ['/'], m: 4 }, ' ', { part: [num(c.s.sd)], m: 3 },
      ...(z === null ? [' : nicht definiert'] : [` ${eq(z)} `, { part: [signed(z)], m: 5 }]) as FNode[],
    ];
  },
  lines: [
    LINE_MITTE,
    LINE_ZENTRIEREN,
    {
      all: c => c.s.sd > 1e-9 ? `Quadratsumme ${c.u(c.s.ss, { squared: true })} geteilt durch ${N(c) - 1}, daraus die Wurzel: s ${eq(c.s.sd)} ${c.u(c.s.sd)}.` : 'Alle Werte sind gleich, also ist s = 0.',
      person: c => `${P(c)} trägt ${paren(c.s.dev[c.who])}² ${eq(c.s.sq[c.who])} ${c.u(c.s.sq[c.who], { squared: true })} zur Quadratsumme bei.`,
    },
    {
      all: c => c.s.sd > 1e-9 ? `Jeden der ${N(c)} Abstände teilen wir durch ${num(c.s.sd)}. ${c.col.unit ? 'Die Einheit kürzt sich weg, übrig bleibt eine Zahl ohne Einheit.' : 'Übrig bleibt der Abstand in Standardabweichungen.'}` : 'Durch s = 0 kann man nicht teilen.',
      person: c => { const z = zOf(c); return z === null ? 'Ohne Streuung gibt es keinen z-Wert.' : `${P(c)}: ${signed(c.s.dev[c.who])} / ${num(c.s.sd)} ${eq(z)} ${signed(z)}.`; },
    },
    {
      all: c => c.s.z ? `Die ${N(c)} z-Werte reichen von ${signed(c.s.z[c.s.minAt])} (${c.names[c.s.minAt]}) bis ${signed(c.s.z[c.s.maxAt])} (${c.names[c.s.maxAt]}). Ihre Mitte ist 0, ihre Standardabweichung 1.` : 'Ohne Streuung gibt es keine z-Werte.',
      person: c => { const z = zOf(c); return z === null ? 'Ohne Streuung gibt es keinen z-Wert.' : `${P(c)} liegt ${zPlace(z)}.`; },
    },
  ],
  metrics: c => {
    const z = zOf(c);
    return [
      { label: 'Befragte n', value: String(N(c)) },
      { label: 'Mitte x̄', value: c.u(c.s.mean) },
      { label: 'Standardabweichung s', value: c.u(c.s.sd) },
      { label: `z-Wert von ${P(c)}`, value: z === null ? 'nicht definiert' : signed(z) },
    ];
  },
  interpret: c => {
    const z = zOf(c), zs = c.s.z;
    if (z === null || !zs) return { kurz: 'Alle haben denselben Wert. Die Standardabweichung ist 0, und z-Werte gibt es nicht.', fachlich: `Die Standardabweichung von „${c.col.title}“ ist 0; durch sie kann man nicht teilen.` };
    const inside = zs.filter(v => Math.abs(v) <= 1 + 1e-9).length, far = zs.filter(v => Math.abs(v) > 2).length, up = zs.filter(v => v > 2).length;
    return {
      kurz: `${P(c)} liegt ${zPlace(z)}${lernzeit(c) ? `: ${z > 0.005 ? 'mehr Lernzeit als der Durchschnitt' : z < -0.005 ? 'weniger Lernzeit als der Durchschnitt' : 'genau durchschnittliche Lernzeit'}` : ''}. ${inside} von ${N(c)} Befragten liegen höchstens eine Standardabweichung von der Mitte entfernt.`,
      fachlich: `zᵢ = (xᵢ − x̄) / s mit x̄ ${eq(c.s.mean)} ${c.u(c.s.mean)} und s ${eq(c.s.sd)} ${c.u(c.s.sd)}. Die z-Werte von „${c.col.title}“ haben den Mittelwert 0 und die Standardabweichung 1.`,
      zusatz: far ? `${far} von ${N(c)} Befragten liegen mehr als zwei Standardabweichungen von der Mitte entfernt: ${up} darüber, ${far - up} darunter.` : `Niemand liegt mehr als zwei Standardabweichungen von der Mitte entfernt.`,
    };
  },
  voraussetzung: c => `${scaleNote(c)} z-Werte gibt es nur, wenn die Werte streuen, also s größer als 0 ist.`,
  picture: (c, step) => ({
    center: c.s.mean, deviation: step >= 2,
    band: step >= 3 && c.s.sd > 1e-9 ? [c.s.mean - c.s.sd, c.s.mean + c.s.sd] : undefined,
    contributions: step >= 4 && c.s.z ? { label: 'z-Werte aller Befragten, der Größe nach', values: c.s.z } : undefined,
  }),
  value: c => zOf(c),
};

// ---------- Werkstatt ----------

export const standardisieren: Workshop<number[], ZStats> = {
  id: 'standardisieren',
  bridge: bridgeStandardisieren,
  wofuer: 'Fünf Personen sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben. Person E lernt 10 Stunden, 2 Stunden mehr als der Durchschnitt. Ist das viel? Bei einer Gruppe, die eng beieinanderliegt, schon. Der z-Wert misst den Abstand zur Mitte deshalb in Standardabweichungen und macht so auch ganz verschiedene Fragen vergleichbar.',
  mut: 'Die Formel hat vier Zeichen und fünf kleine Schritte: Mitte finden, abziehen, Streuung messen, teilen, ablesen. Jeden davon kennst du schon. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b04-standardisieren',
  names: NAMES,
  bounds: LINEAL_BOUNDS,
  presets: LINEAL_PRESETS,
  compute: zstats,
  glyphs: [
    { sym: 'x̄', say: 'x quer', term: 'Arithmetisches Mittel', plain: 'die Mitte der Gruppe', step: 1 },
    { sym: 'xᵢ', say: 'x i', term: 'Beobachtung', plain: 'die Lernzeit von Person i', step: 1 },
    { sym: 'xᵢ − x̄', say: 'x i minus x quer', term: 'zentrierter Wert', plain: 'wie weit Person i über oder unter der Mitte liegt', step: 2 },
    { sym: 's', say: 's', term: 'Standardabweichung', plain: 'der Maßstab für die Streuung der Gruppe', step: 3 },
    { sym: '/ s', say: 'geteilt durch s', term: 'Skalierung durch Division', plain: 'jeden Abstand in Standardabweichungen umrechnen', step: 4 },
    { sym: 'zᵢ', say: 'z i', term: 'z-Wert', plain: 'Abstand von Person i zur Mitte, in Standardabweichungen', step: 5 },
  ],
  steps: [STEP_MITTE, STEP_ZENTRIEREN, STEP_STREUUNG, STEP_TEILEN, STEP_Z],
  numeric: c => {
    const z = zOf(c);
    return [
      `z für Person ${P(c)} = `,
      { frac: [{ part: [`${num(c.s.xs[c.who])} −`], m: 2 }, ' ', { part: [num(c.s.mean)], m: 1 }], den: [{ part: [num(c.s.sd)], m: 3 }], m: 4 },
      ' = ', { part: [`${signed(c.s.dev[c.who])} / ${num(c.s.sd)}`], m: 4 },
      ...(z === null ? [' : nicht definiert, denn s = 0'] : [` ${eq(z)} `, { part: [signed(z)], m: 5 }]) as FNode[],
    ];
  },
  table: {
    columns: [
      COL_X, COL_DEV,
      { head: '(xᵢ − x̄)²', from: 3, active: [3], cell: (c, i) => num(c.s.sq[i]), sum: c => num(c.s.ss), sumFrom: 3 },
      {
        head: 'zᵢ', from: 4, active: [4, 5], cell: (c, i) => c.s.z ? signed(c.s.z[i]) : 'nicht definiert', sum: c => c.s.z ? '0' : '–', sumFrom: 5, sumNote: 'immer',
        tone: (c, i) => !c.s.z ? undefined : c.s.z[i] > 1e-9 ? 'pos' : c.s.z[i] < -1e-9 ? 'neg' : undefined,
      },
    ],
    lines: [
      { from: 1, step: 1, text: c => `x̄ = ${num(c.s.sum)} / 5 ${eq(c.s.mean)} ${num(c.s.mean)}` },
      { from: 3, step: 3, text: c => `s = √(${num(c.s.ss)} / 4) ${eq(c.s.sd)} ${num(c.s.sd)}` },
      { from: 5, step: 5, text: c => c.s.z ? 'Die z-Werte haben die Mitte 0 und die Standardabweichung 1.' : 'Ohne Streuung gibt es keine z-Werte.' },
    ],
  },
  captions: {
    1: 'Die fünf Lernzeiten auf einem Lineal in Stunden. Du kannst die Punkte ziehen.',
    2: 'Das zweite Lineal misst von der Mitte aus: Die Mitte ist dort 0.',
    3: 'Der helle Streifen reicht von x̄ − s bis x̄ + s.',
    4: 'Das dritte Lineal zählt in Standardabweichungen: Die Zahl sagt, wie viele s ein Punkt von der Mitte entfernt ist.',
    5: 'Die Punkte bleiben, wo sie sind. Nur das Lineal hat sich geändert.',
  },
  think: [
    {
      question: 'Alle lernen gleich viel mehr, zum Beispiel zwei Stunden. Was passiert mit den z-Werten?', options: ['werden größer', 'bleiben gleich', 'werden kleiner'], correct: 1, step: 2,
      explain: 'Die Mitte wandert mit, die Abstände zur Mitte bleiben gleich und damit auch s. Also bleiben alle z-Werte gleich.',
      kurz: 'Verschieben ändert keinen z-Wert.',
      tryIt: { label: 'alle verschieben', apply: d => d.map(x => x + shiftWithin(d, LINEAL_BOUNDS.min, LINEAL_BOUNDS.max)) },
    },
    {
      question: 'Alle lernen nur halb so lange. Was passiert mit den z-Werten?', options: ['halbieren sich', 'bleiben gleich', 'verdoppeln sich'], correct: 1, step: 4,
      explain: 'Abstände und s halbieren sich beide. Im Bruch (xᵢ − x̄) / s kürzt sich die Hälfte heraus, die z-Werte bleiben gleich.',
      kurz: 'z hängt nicht von der Einheit ab.',
      tryIt: { label: 'alle halb so lange', apply: d => d.map(x => x / 2) },
    },
    {
      question: 'Alle lernen gleich lange, 8 Stunden. Was wird aus den z-Werten?', options: ['lauter Nullen', 'lauter Einsen', 'nicht definiert'], correct: 2, step: 4,
      explain: 'Alle Abstände sind 0, also auch s. Durch 0 kann man nicht teilen: Ohne Streuung gibt es keine z-Werte.',
      kurz: 'z braucht eine Streuung größer als 0.',
      tryIt: { label: 'alle auf 8 Stunden', apply: () => [8, 8, 8, 8, 8] },
    },
    {
      question: 'Ein z-Wert ist −2, ein anderer +1. Welcher liegt weiter von der Mitte entfernt?', options: ['der mit −2', 'der mit +1', 'beide gleich weit'], correct: 0, step: 5,
      explain: 'Das Vorzeichen sagt nur die Seite. Die Entfernung steckt im Betrag: 2 Standardabweichungen sind doppelt so weit wie eine.',
      kurz: 'Für die Entfernung zählt der Betrag, nicht das Vorzeichen.',
    },
  ],
  variants: {
    z: {
      lastStep: 5,
      kurz: 'Ein z-Wert sagt dir, wie viele Standardabweichungen jemand über oder unter dem Durchschnitt liegt. So lassen sich Antworten auf ganz verschiedenen Skalen vergleichen.',
      fachlich: 'z-Standardisierung: zᵢ = (xᵢ − x̄) / s. Die z-Werte haben den Mittelwert 0 und die Standardabweichung 1; die Form der Verteilung bleibt erhalten.',
      symbolic: [{ part: ['z', { sub: 'i' }], m: 5 }, ' = ', { frac: [{ part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }], den: [{ part: ['s'], m: 3 }], m: 4 }],
      aria: 'z i gleich x i minus x quer, geteilt durch s',
      metrics: [
        { label: 'Mitte x̄', value: c => num(c.s.mean) },
        { label: 'Standardabweichung s', value: c => num(c.s.sd) },
        { label: 'z-Wert der gewählten Person', value: c => { const z = zOf(c); return z === null ? 'nicht definiert' : signed(z); } },
      ],
      interpret: c => {
        const z = zOf(c);
        if (z === null) return { kurz: 'Alle lernen gleich lange. Die Streuung ist 0, und z-Werte gibt es nicht.', fachlich: 's = 0, deshalb ist (xᵢ − x̄) / s nicht definiert. z-Werte setzen eine positive Standardabweichung voraus.' };
        return {
          kurz: `Person ${P(c)} liegt ${zPlace(z)}. Ein z-Wert über 0 heißt: mehr Lernzeit als der Durchschnitt; unter 0: weniger.`,
          fachlich: `z-Werte ${c.s.z!.map(v => signed(v)).join('; ')} bei x̄ ${eq(c.s.mean)} ${num(c.s.mean)} und s ${eq(c.s.sd)} ${num(c.s.sd)}. Ihr Mittelwert ist 0, ihre Standardabweichung 1.`,
        };
      },
      genau: {
        kurz: 'Standardisieren erzeugt keine Normalverteilung. Ein z-Wert beschreibt die Lage innerhalb genau dieser Gruppe.',
        paragraphs: () => [
          'Im Atlas teilt man durch die korrigierte Stichproben-Standardabweichung mit n − 1. Dann haben die z-Werte genau die Standardabweichung 1. Manche Lehrbücher teilen durch die Standardabweichung mit n; die z-Werte liegen dann etwas weiter von der 0 entfernt.',
          'Ein z-Wert hängt von der Gruppe ab. Dieselben 10 Stunden sind in einer Gruppe, die viel lernt, unterdurchschnittlich. Wer z-Werte zweier Gruppen vergleicht, vergleicht Lagen, keine Stunden.',
          'Nur wenn die Werte annähernd normalverteilt sind, lässt sich aus z ein Anteil ablesen, etwa: Unter z = 1 liegen dann rund 84 %. Ohne diese Annahme geht das nicht; die Form der Verteilung bleibt beim Standardisieren erhalten.',
          'In R: std(lernzeit, method = "sd", suffix = "_z"). "2sd" teilt durch zwei Standardabweichungen, "gmd" durch die Gini-Mitteldifferenz. "mad" zieht statt der Mitte den Median ab, den mittleren Wert der Reihe nach. Geteilt wird durch den Median der Abstände ohne Vorzeichen, mal rund 1,48.',
        ],
      },
    },
  },
};

// ---------- Reiter ----------

export const tabsZ: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'standardisieren', variant: 'z', variable: 'lernzeit',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem z-Wert der gewählten Person?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 1, step: 2,
        explain: 'Die Mitte wandert um eine Stunde mit, die Abstände bleiben und damit auch s. Zähler und Nenner von (xᵢ − x̄) / s ändern sich nicht.',
        kurz: 'Verschieben ändert keinen z-Wert.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem z-Wert der gewählten Person?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1, step: 4,
        explain: 'Der Abstand zur Mitte verdoppelt sich, s auch (Schritt 3). Beim Teilen in Schritt 4 kürzt sich die 2 heraus.',
        kurz: 'z hängt nicht von der Einheit ab.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Die Lernzeit wird umgepolt: 60 minus die Stunden. Was passiert mit dem z-Wert der gewählten Person?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 2,
        explain: 'Jeder Abstand zur Mitte dreht sein Vorzeichen, s bleibt gleich. Wer vorher über der Mitte lag, liegt jetzt genauso weit darunter.',
        kurz: 'Umpolen dreht die Seite, nicht den Abstand.',
        tryIt: { label: 'Lernzeit umpolen (60 minus Stunden)', op: 'reverse', column: 'x' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'z', variant: 0,
    tokens: {
      std: { sym: 'std()', term: 'z-Standardisierung', kurz: 'Standardisiert Spalten: Mitte abziehen, durch einen Maßstab teilen. Mit method = "sd" ist der Maßstab die Standardabweichung.', fehler: 'Ein unbekannter Maßstab bricht ab. method = "z" ergibt: \'arg\' sollte eines von \'“sd”, “2sd”, “mad”, “gmd”\' sein.' },
      method: { sym: 'method =', term: 'Maßstab', kurz: 'Sagt std(), wodurch geteilt wird. "sd" ergibt die üblichen z-Werte mit Standardabweichung 1.', fehler: 'Groß geschrieben kennt std() den Namen nicht: method = "SD" bricht mit derselben Meldung ab wie ein Tippfehler.' },
    },
    outputMap: [
      { match: '1.000', atlas: 'Standardabweichung der z-Werte', step: 5, explain: 'Die z-Werte haben immer die Standardabweichung 1: Geteilt wurde ja durch s.' },
      { match: '0.000', atlas: 'Mitte der z-Werte', step: 5, explain: 'Die z-Werte haben die Mitte 0, denn vorher wurde zentriert.' },
      { match: 'Mean', atlas: 'x̄', step: 1, explain: 'Die Mitte der Lernzeit in Stunden. Sie wird in Schritt 2 abgezogen.' },
      { match: 'SD', atlas: 's', step: 3, explain: 'Die Standardabweichung der Lernzeit in Stunden: der Maßstab, durch den in Schritt 4 geteilt wird.' },
    ],
    check: {
      question: 'Welche Zahl zeigt die Standardabweichung der z-Werte? Tippe sie an.', correct: '1.000',
      wrong: {
        SD: 'Fast! Das ist s der Lernzeit in Stunden. Die z-Werte stehen eine Zeile tiefer, in lernzeit_z.',
        '0.000': 'Fast! Das ist die Mitte der z-Werte. Ihre Standardabweichung steht daneben.',
        Mean: 'Fast! Das ist die Mitte der Lernzeit in Stunden. Gesucht ist die Streuung der z-Werte.',
      },
    },
  },
  next: {
    next: { id: 'pearson', why: 'r ist die Summe der Produkte zweier z-Werte, geteilt durch n − 1: Σ zₓ · zᵧ / (n − 1).' },
    before: [
      { id: 'centering', why: 'Der erste Teil: die Mitte abziehen.' },
      { id: 'scaling', why: 'Der zweite Teil: durch s teilen.' },
      { id: 'sd', why: 'Der Maßstab, in dem z misst.' },
    ],
    after: [
      { id: 'standard_normal', why: 'Sind die Werte normalverteilt, folgen ihre z-Werte der Normalverteilung mit Mitte 0 und Streuung 1.' },
      { id: 'effect', why: 'Effektgrößen wie Cohens d messen Unterschiede ebenfalls in Standardabweichungen.' },
    ],
    more: [
      { id: 'positive_sd', why: 'Ohne Streuung gibt es keine z-Werte.' },
      { id: 'normal_distribution', why: 'Standardisieren macht aus keiner Verteilung eine Normalverteilung.' },
    ],
  },
};
