// Werkstatt „Gerade“ (Bereich B13): Lineare Regression, Linearer Prädiktor und Residuen an fünf Personen mit
// Lernzeit und Wissenstest, dazu die Brücke zu den 200 Befragten. Ton nach der Streuung (src/explain/content/streuung.ts).
// Alle Zahlen sind in R nachgerechnet, die Referenzwerte stehen in b13-regression.test.ts.
import type { Bridge, BridgeCtx, Ctx, FNode, Workshop } from '../../types';
import { num, signed, paren, close, unit, round } from '../../format';
import { eqFrom, sumNodes, unitText } from '../../sample';
import { fitLine, type Fit, type Pairs } from './fit';

type C = Ctx<Fit>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const X = [2, 4, 6, 8, 10];
/** Fünf Personen: Lernzeit in Stunden (letzte sieben Tage) und gelöste Aufgaben im Wissenstest (0 bis 20). */
export const BEISPIEL: Pairs = { x: X, y: [9, 7, 12, 9, 13] };
/** Dieselben Personen, aber E löst nur 3 Aufgaben. */
export const AUSREISSER: Pairs = { x: X, y: [9, 7, 12, 9, 3] };

const P = (c: C) => c.names[c.who];
/** Größte Verschiebung (2 oder 1, sonst 0), die alle Werte auf der Skala lässt; bevorzugt nach oben. */
const shiftWithin = (d: number[], lo: number, hi: number) => {
  const up = hi - Math.max(...d), down = Math.min(...d) - lo;
  return up >= 2 ? 2 : down >= 2 ? -2 : up >= 1 ? 1 : down >= 1 ? -1 : 0;
};
const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);
const preset = (c: C) => same(c.s.xs, X) && same(c.s.ys, BEISPIEL.y) ? 'beispiel' : same(c.s.xs, X) && same(c.s.ys, AUSREISSER.y) ? 'ausreisser' : null;
/** „≈“, wenn die angezeigte Zahl gerundet ist, sonst „=“. */
export const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
/** „≈“, sobald eine der eingesetzten Zahlen gerundet angezeigt wird. */
const eqAll = (...vs: number[]) => vs.some(v => eq(v) === '≈') ? '≈' : '=';
const h = (v: number) => unit(v, 'Stunde', 'Stunden');
const tasks = (v: number) => unit(v, 'Aufgabe', 'Aufgaben');
/** Gerade als Text: „7 + 0,5 · x“, bei negativer Steigung „11 − 0,5 · x“. */
export const lineText = (b0: number, b1: number, coef = num) => `${num(b0)} ${b1 < 0 ? '−' : '+'} ${coef(Math.abs(b1))} · x`;
/** Lage zur Geraden: „2 Aufgaben unter der Geraden“. */
const toLine = (e: number, amount: (v: number) => string) => Math.abs(e) < 0.005 ? 'genau auf der Geraden' : `${amount(Math.abs(e))} ${e > 0 ? 'über' : 'unter'} der Geraden`;

/** Gleiche Personen mit dem größten quadrierten Residuum (bei Gleichstand alle). */
const biggestAll = (s: Fit) => { const m = Math.max(...s.e2); return s.e2.map((v, i) => [v, i] as const).filter(([v]) => m > 1e-9 && Math.abs(v - m) < 1e-9).map(([, i]) => i); };
const listNames = (names: readonly string[], idx: number[]) => idx.length === 1 ? names[idx[0]] : `${idx.slice(0, -1).map(i => names[i]).join(', ')} und ${names[idx[idx.length - 1]]}`;

const products = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' + '] as FNode[] : []),
  '(', `${x} − `, { part: [num(c.s.x.mean)], m: 1 }, ')(', `${c.s.ys[i]} − `, { part: [num(c.s.y.mean)], m: 1 }, ')',
]);
const squares = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [...(i ? [' + '] as FNode[] : []), '(', `${x} − `, { part: [num(c.s.x.mean)], m: 1 }, ')²']);

export const gerade: Workshop<Pairs, Fit> = {
  id: 'b13-gerade',
  wofuer: 'Lösen Personen, die mehr lernen, im Wissenstest mehr Aufgaben? Und wenn ja: wie viele mehr pro Stunde? Fünf Personen sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben und wie viele von 20 Aufgaben sie gelöst haben. Die lineare Regression legt die Gerade durch ihre Punkte, die insgesamt am wenigsten danebenliegt.',
  mut: 'Die Formeln sehen nach viel aus. Sie bestehen aber aus kleinen Schritten, die du schon kennst: Mitten finden, malnehmen, teilen, einsetzen, abziehen und quadrieren. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b13-gerade',
  names: NAMES,
  bounds: { min: 0, max: 20 },
  presets: [
    { id: 'beispiel', label: 'Fünf Personen, 2 bis 10 Stunden', data: BEISPIEL },
    { id: 'ausreisser', label: 'Person E löst nur 3 Aufgaben', data: AUSREISSER },
  ],
  compute: fitLine,
  glyphs: [
    { sym: 'xᵢ, yᵢ', say: 'x i, y i', term: 'Wertepaar', plain: 'Lernzeit und gelöste Aufgaben von Person i', step: 1 },
    { sym: 'x̄, ȳ', say: 'x quer, y quer', term: 'Mittelwerte', plain: 'die Mitte der Lernzeit und die Mitte der gelösten Aufgaben', step: 1 },
    { sym: 'b₁', say: 'b eins', term: 'Steigung', plain: 'wie viele Aufgaben die Gerade je Stunde mehr vorhersagt', step: 2 },
    { sym: 'b₀', say: 'b null', term: 'Achsenabschnitt', plain: 'die Vorhersage bei 0 Stunden', step: 3 },
    { sym: 'ŷᵢ', say: 'y Dach i', term: 'Vorhergesagter Wert', plain: 'was die Gerade für Person i erwartet', step: 4 },
    { sym: 'eᵢ', say: 'e i', term: 'Residuum', plain: 'gelöst minus vorhergesagt', step: 5 },
    { sym: 'Σeᵢ²', say: 'Summe e i Quadrat', term: 'Quadratsumme der Residuen', plain: 'wie weit die Gerade insgesamt danebenliegt', step: 6 },
  ],
  steps: [
    {
      button: 'x̄, ȳ', title: 'Zwei Mitten finden', sym: 'x̄, ȳ', say: 'x quer, y quer', concept: 'mean', perPerson: false,
      was: 'Wir suchen die Mitte der Lernzeit und die Mitte der gelösten Aufgaben. Zusammen ergeben sie einen Punkt: die Mitte der Punktwolke.',
      rechnung: c => `x̄ = (${c.s.xs.join(' + ')}) / 5 = ${num(c.s.x.mean)} Stunden, ȳ = (${c.s.ys.join(' + ')}) / 5 = ${num(c.s.y.mean)} Aufgaben`,
      fach: 'Die arithmetischen Mittel x̄ und ȳ. Die Regressionsgerade geht immer durch den Punkt (x̄ | ȳ).',
      warum: 'Die Gerade wird an dieser Mitte aufgehängt. Von dort aus messen wir gleich, wie die Punkte nach oben und unten abweichen.',
      acht: 'Du brauchst zwei Mitten, eine für jede Spalte. Gefragt ist hier vor allem ȳ, die Mitte der gelösten Aufgaben.',
      check: {
        question: 'Wo liegt die Mitte der gelösten Aufgaben, also ȳ?',
        answer: c => c.s.y.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.y.sum) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.'
          : !close(c.s.x.mean, c.s.y.mean) && close(v, c.s.x.mean) ? 'Fast! Das ist die Mitte der Lernzeit, x̄. Gefragt ist ȳ, die Mitte der gelösten Aufgaben.'
          : close(v, c.s.y.sum / 4) ? 'Fast! Du hast durch 4 geteilt. Für die Mitte teilst du durch alle fünf.'
          : null,
      },
    },
    {
      button: 'b₁', title: 'Die Steigung bestimmen', sym: 'b₁', say: 'b eins', concept: 'linear_regression', perPerson: true,
      links: [{ id: 'crossproduct', label: 'Abweichungsprodukt' }, { id: 'covariance', label: 'Stichprobenkovarianz' }],
      was: 'Je Person nehmen wir die beiden Abstände zur Mitte mal und zählen alles zusammen. Das teilen wir durch die Summe der quadrierten Abstände der Lernzeit.',
      rechnung: c => {
        const i = c.who, dx = c.s.x.dev[i], dy = c.s.y.dev[i];
        const mine = `Person ${P(c)}: ${paren(dx)} · ${paren(dy)} = ${num(c.s.prod[i])} und ${paren(dx)}² = ${num(c.s.xsq[i])}.`;
        return c.s.b1 === null
          ? `${mine} Alle fünf: Die Quadrate ergeben 0, alle haben gleich lange gelernt. Durch 0 kann man nicht teilen.`
          : `${mine} Alle fünf: ${num(c.s.cp)} / ${num(c.s.sxx)} ${eq(c.s.b1)} ${num(c.s.b1)}.`;
      },
      fach: 'Die Steigung b₁ heißt Regressionskoeffizient. Sie ist die Summe der Abweichungsprodukte geteilt durch die Quadratsumme von x, also sₓᵧ / sₓ².',
      warum: 'Der Zähler zeigt, ob die Punkte nach rechts oben oder rechts unten weisen. Der Nenner rechnet das auf eine Stunde mehr Lernzeit um.',
      acht: 'Unten stehen die Quadrate der Lernzeit, nicht die der Aufgaben. Wer die Spalten vertauscht, bekommt eine andere Gerade.',
      check: {
        question: c => c.s.b1 === null ? 'Wie groß ist die Steigung? Alle haben gleich lange gelernt. Tippe NA, wenn sie nicht definiert ist.' : 'Was kommt heraus, wenn du die Summe der Produkte durch die Summe der Quadrate teilst?',
        answer: c => c.s.b1 ?? 'NA',
        diagnose: (c, v) => {
          if (v === 'NA' || c.s.b1 === null || Math.abs(c.s.cp) < 1e-9) return null;
          if (close(v, c.s.cp / 4)) return 'Fast! Das ist die Kovarianz, die Summe durch 4. Für die Steigung teilst du durch die Quadratsumme der Lernzeit.';
          if (close(v, c.s.sxx / c.s.cp)) return 'Fast! Andersherum: Die Summe der Produkte steht oben, die Quadratsumme der Lernzeit unten.';
          if (c.s.sst > 1e-9 && !close(c.s.sst, c.s.sxx) && close(v, c.s.cp / c.s.sst)) return 'Fast! Unten stehen die Quadrate der Lernzeit, nicht die der Aufgaben.';
          if (!close(c.s.cp, c.s.b1) && close(v, c.s.cp)) return 'Fast! Das ist erst die Summe der Produkte. Jetzt noch durch die Summe der Quadrate teilen.';
          return null;
        },
      },
    },
    {
      button: 'b₀', title: 'Die Gerade durch die Mitte legen', sym: 'b₀', say: 'b null', concept: 'linear_regression', perPerson: false,
      was: 'Die Gerade geht durch die Mitte (x̄ | ȳ). Von dort gehen wir mit der Steigung zurück bis 0 Stunden.',
      rechnung: c => c.s.b1 === null || c.s.b0 === null ? 'Ohne Steigung gibt es auch keinen Achsenabschnitt: b₁ ist nicht definiert.'
        : `b₀ = ȳ − b₁ · x̄ ${eq(c.s.b1)} ${num(c.s.y.mean)} − ${paren(c.s.b1)} · ${num(c.s.x.mean)} ${eqAll(c.s.b1, c.s.b1 * c.s.x.mean)} ${num(c.s.y.mean)} − ${paren(c.s.b1 * c.s.x.mean)} ${eq(c.s.b0)} ${num(c.s.b0)}`,
      fach: 'Der Achsenabschnitt b₀ ist der vorhergesagte Wert bei x = 0. Er folgt aus b₀ = ȳ − b₁ · x̄.',
      warum: 'Mit Startwert und Steigung liegt die Gerade fest. Jetzt kann sie für jede Lernzeit eine Zahl vorhersagen.',
      acht: c => {
        const lo = Math.min(...c.s.xs);
        const start = c.s.b0 === null ? 'Ohne Steigung gibt es keinen Startwert.' : `Bei 0 Stunden sagt die Gerade ${tasks(c.s.b0)} voraus.`;
        return `${start} ${lo > 0 ? `Hier hat aber niemand weniger als ${h(lo)} gelernt; b₀ ist vor allem der Startpunkt der Geraden.` : 'Mindestens eine Person hat hier gar nicht gelernt; für sie ist b₀ die Vorhersage.'}`;
      },
      check: {
        question: 'Wie viele Aufgaben sagt die Gerade bei 0 Stunden Lernzeit voraus?',
        answer: c => c.s.b0 ?? 'NA',
        diagnose: (c, v) => {
          if (v === 'NA' || c.s.b1 === null || Math.abs(c.s.b1 * c.s.x.mean) < 1e-9) return null;
          const part = c.s.b1 * c.s.x.mean;
          if (close(v, c.s.y.mean + part)) return 'Fast! Hier wird abgezogen: ȳ − b₁ · x̄.';
          if (close(v, c.s.y.mean)) return 'Fast! Das ist noch ȳ. Zieh davon b₁ · x̄ ab.';
          if (close(v, part)) return 'Fast! Das ist b₁ · x̄. Zieh es noch von ȳ ab.';
          return null;
        },
      },
    },
    {
      button: 'ŷᵢ', title: 'Für jede Person vorhersagen', sym: 'ŷᵢ = b₀ + b₁ · xᵢ', say: 'y Dach i gleich b null plus b eins mal x i', concept: 'prediction', perPerson: true,
      was: 'Wir setzen die Lernzeit einer Person in die Gerade ein. Heraus kommt, wie viele Aufgaben die Gerade für sie erwartet.',
      rechnung: c => {
        const i = c.who;
        if (c.s.b1 === null) return `Ohne Steigung bleibt nur die Mitte: Die Gerade sagt für alle ${tasks(c.s.y.mean)} voraus. Gelöst hat ${P(c)} ${c.s.ys[i]}.`;
        return `Person ${P(c)}: ŷ ${eqAll(c.s.b0!, c.s.b1)} ${num(c.s.b0!)} + ${paren(c.s.b1)} · ${c.s.xs[i]} ${eqAll(c.s.b1, c.s.b1x[i])} ${num(c.s.b0!)} ${c.s.b1x[i] < 0 ? '−' : '+'} ${num(Math.abs(c.s.b1x[i]))} ${eqAll(c.s.b0!, c.s.b1x[i], c.s.yhat[i])} ${tasks(c.s.yhat[i])}. Gelöst hat ${P(c)} ${c.s.ys[i]}.`;
      },
      fach: 'ŷᵢ heißt vorhergesagter Wert. b₀ + b₁ · xᵢ ist der lineare Prädiktor; in der linearen Regression ist er die Vorhersage selbst.',
      warum: 'Die Vorhersage ist der Maßstab. Gleich vergleichen wir sie mit dem, was die Person wirklich gelöst hat.',
      acht: c => {
        const i = 1, x = c.s.xs[i];
        return c.s.b1 === null ? 'Erst malnehmen, dann addieren: Punktrechnung geht vor Strichrechnung.'
          : `Erst malnehmen, dann addieren: ${num(c.s.b0!)} + ${paren(c.s.b1)} · ${x} ergibt ${num(c.s.yhat[i])}, nicht ${num((c.s.b0! + c.s.b1) * x)}.`;
      },
      check: {
        question: c => `Wie viele Aufgaben sagt die Gerade für Person ${P(c)} voraus?`,
        answer: c => c.s.yhat[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const i = c.who, yhat = c.s.yhat[i];
          if (c.s.b1 !== null && !close((c.s.b0! + c.s.b1) * c.s.xs[i], yhat) && close(v, (c.s.b0! + c.s.b1) * c.s.xs[i])) return 'Fast! Erst malnehmen, dann addieren: Punktrechnung geht vor Strichrechnung.';
          if (c.s.b1 !== null && Math.abs(c.s.icpt) > 1e-9 && close(v, c.s.b1x[i])) return 'Fast! Da fehlt noch der Startwert b₀.';
          if (!close(c.s.ys[i], yhat) && close(v, c.s.ys[i])) return `Fast! So viele Aufgaben hat ${P(c)} wirklich gelöst. Gefragt ist, was die Gerade vorhersagt.`;
          return null;
        },
      },
    },
    {
      button: 'eᵢ', title: 'Danebenliegen messen', sym: 'eᵢ = yᵢ − ŷᵢ', say: 'e i gleich y i minus y Dach i', concept: 'residuals', perPerson: true,
      was: 'Für jede Person rechnen wir: gelöst minus vorhergesagt. Das Ergebnis sagt, wie weit sie über oder unter der Geraden liegt.',
      rechnung: c => { const i = c.who, e = c.s.e[i]; return `Person ${P(c)}: ${c.s.ys[i]} − ${num(c.s.yhat[i])} ${eq(e)} ${signed(e)}, also ${toLine(e, tasks)}.`; },
      fach: 'Das Residuum eᵢ ist der beobachtete Wert minus den vorhergesagten. Positiv heißt über der Geraden, negativ darunter.',
      warum: 'Keine Gerade trifft alle Punkte. Die Residuen zeigen, was die Lernzeit allein nicht vorhersagt.',
      acht: 'Immer gelöst minus vorhergesagt, nicht andersherum, sonst dreht sich jedes Vorzeichen. Kleine Überraschung: Alle Residuen zusammen ergeben 0.',
      check: {
        question: c => `Wie weit liegt Person ${P(c)} über oder unter der Geraden? Mit Vorzeichen.`,
        answer: c => c.s.e[c.who],
        diagnose: (c, v) => { const e = c.s.e[c.who]; return v !== 'NA' && Math.abs(e) > 1e-9 && close(v, -e) ? 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne gelöst minus vorhergesagt.' : null; },
      },
    },
    {
      button: 'Σeᵢ²', title: 'Quadrieren und zusammenzählen', sym: 'Σeᵢ²', say: 'Summe e i Quadrat', concept: 'residuals', perPerson: false,
      was: 'Wir quadrieren jedes Residuum und zählen alles zusammen. Die Summe sagt, wie weit die Gerade insgesamt danebenliegt.',
      rechnung: c => `${c.s.e.map(e => `${paren(e)}²`).join(' + ')} = ${c.s.e2.map(q => num(q)).join(' + ')} ${eq(c.s.sse)} ${num(c.s.sse)}`,
      fach: 'Die Quadratsumme der Residuen Σeᵢ², englisch SSE. Die Methode der kleinsten Quadrate wählt b₀ und b₁ so, dass sie so klein wie möglich wird.',
      warum: 'Wie bei der Streuung: Ohne Quadrat heben sich Plus und Minus auf. Und große Fehler zählen im Quadrat stärker als kleine.',
      acht: 'Wer die Residuen ohne Quadrat zusammenzählt, bekommt immer 0. Erst die Quadrate zeigen, wie weit die Gerade insgesamt danebenliegt.',
      check: {
        question: 'Wie groß ist die Summe der quadrierten Residuen?',
        answer: c => c.s.sse,
        diagnose: (c, v) => {
          if (v === 'NA' || c.s.sse < 1e-9) return null;
          if (close(v, 0)) return 'Fast! 0 ist die Summe der Residuen selbst. Gefragt ist die Summe ihrer Quadrate.';
          if (!close(c.s.absSum, c.s.sse) && close(v, c.s.absSum)) return 'Fast! Du hast die Abstände ohne Quadrat zusammengezählt. Quadriere jedes Residuum zuerst.';
          if (!close(c.s.sst, c.s.sse) && close(v, c.s.sst)) return 'Fast! Das ist die Quadratsumme um ȳ, ganz ohne Gerade. Gefragt sind die Abstände zur Geraden.';
          return null;
        },
      },
    },
  ],
  numeric: (c, last) => {
    const s = c.s, out: FNode[] = ['b₁ = [ ', ...products(c), ' ] / [ ', ...squares(c), ' ]', { br: true }];
    if (s.b1 === null) return [...out, '= ', { part: [num(s.cp)], m: 2 }, ' / ', { part: ['0'], m: 2 }, ': ', { part: ['nicht definiert'], m: 2 }];
    out.push('= ', { part: [`${num(s.cp)} / ${num(s.sxx)}`], m: 2 }, ` ${eq(s.b1)} `, { part: [num(s.b1)], m: 2 });
    if (last >= 3) out.push({ br: true }, 'b₀ = ', { part: [num(s.y.mean)], m: 1 }, ' − ', { part: [paren(s.b1)], m: 2 }, ' · ', { part: [num(s.x.mean)], m: 1 }, ` ${eqAll(s.b1, s.b0!)} `, { part: [num(s.b0!)], m: 3 });
    if (last >= 4) out.push({ br: true }, 'ŷ', { sub: P(c) }, ' = ', { part: [num(s.b0!)], m: 3 }, ' + ', { part: [paren(s.b1)], m: 2 }, ` · ${s.xs[c.who]} ${eqAll(s.b0!, s.b1, s.yhat[c.who])} `, { part: [num(s.yhat[c.who])], m: 4 });
    if (last >= 5) out.push({ br: true }, 'e', { sub: P(c) }, ` = ${s.ys[c.who]} − `, { part: [num(s.yhat[c.who])], m: 4 }, ` ${eq(s.e[c.who])} `, { part: [signed(s.e[c.who])], m: 5 });
    if (last >= 6) out.push({ br: true }, 'Σeᵢ² = ', { part: [s.e2.map(q => num(q)).join(' + ')], m: 6 }, ` ${eq(s.sse)} `, { part: [num(s.sse)], m: 6 });
    return out;
  },
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.xs[i]), sum: c => num(c.s.x.sum), sumFrom: 1 },
      { head: 'yᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.ys[i]), sum: c => num(c.s.y.sum), sumFrom: 1 },
      { head: '(xᵢ − x̄)(yᵢ − ȳ)', from: 2, active: [2], cell: (c, i) => num(c.s.prod[i]), sum: c => num(c.s.cp), sumFrom: 2, tone: (c, i) => c.s.prod[i] > 1e-9 ? 'pos' : c.s.prod[i] < -1e-9 ? 'neg' : undefined },
      { head: '(xᵢ − x̄)²', from: 2, active: [2], cell: (c, i) => num(c.s.xsq[i]), sum: c => num(c.s.sxx), sumFrom: 2 },
      { head: 'ŷᵢ', from: 4, active: [4], cell: (c, i) => num(c.s.yhat[i]) },
      { head: 'eᵢ', from: 5, active: [5], cell: (c, i) => signed(c.s.e[i]), sum: () => '0', sumFrom: 5, sumNote: 'immer', tone: (c, i) => c.s.e[i] > 1e-9 ? 'pos' : c.s.e[i] < -1e-9 ? 'neg' : undefined },
      { head: 'eᵢ²', from: 6, active: [6], cell: (c, i) => num(c.s.e2[i]), sum: c => num(c.s.sse), sumFrom: 6 },
    ],
    lines: [
      { from: 1, step: 1, text: c => `x̄ = ${num(c.s.x.sum)} / 5 = ${num(c.s.x.mean)}, ȳ = ${num(c.s.y.sum)} / 5 = ${num(c.s.y.mean)}` },
      { from: 2, step: 2, text: c => c.s.b1 === null ? 'b₁: Die Quadratsumme der Lernzeit ist 0, b₁ ist nicht definiert.' : `b₁ = ${num(c.s.cp)} / ${num(c.s.sxx)} ${eq(c.s.b1)} ${num(c.s.b1)}` },
      { from: 3, step: 3, text: c => c.s.b0 === null ? 'b₀: nicht definiert' : `b₀ = ${num(c.s.y.mean)} − ${paren(c.s.b1!)} · ${num(c.s.x.mean)} ${eq(c.s.b0)} ${num(c.s.b0)}, Gerade ŷ = ${lineText(c.s.b0, c.s.b1!)}` },
      { from: 6, step: 6, text: c => `Σeᵢ² = ${num(c.s.sse)}, ohne Gerade (um ȳ) wären es ${num(c.s.sst)}` },
    ],
  },
  captions: {
    1: 'Jeder Punkt ist eine Person. Die gestrichelten Linien zeigen x̄ und ȳ. Du kannst die Punkte ziehen.',
    2: 'Die Gerade geht durch die Mitte. Das Dreieck zeigt die Steigung: so viele Aufgaben mehr je Stunde.',
    3: 'Wo die Gerade bei 0 Stunden ankommt, liegt der Achsenabschnitt b₀.',
    4: 'Die offenen Kreise auf der Geraden sind die Vorhersagen ŷᵢ.',
    5: 'Die senkrechten Striche sind die Residuen: grün über der Geraden, braunrot darunter.',
    6: 'Jedes Residuum wird zur Seite eines Quadrats. Die Gerade macht die Summe dieser Flächen so klein wie möglich.',
  },
  think: [
    {
      question: 'Person E löst nur 3 statt 13 Aufgaben. Was passiert mit der Steigung?',
      options: ['bleibt fast gleich', 'wird sogar negativ', 'verdoppelt sich'], correct: 1, step: 2,
      explain: 'E liegt am Rand, 4 Stunden rechts der Mitte. Ihr Produkt kippt die Summe der Produkte von +20 auf −20, und b₁ wird von 0,5 zu −0,5. Am Rand hat eine einzelne Person einen langen Hebel.',
      kurz: 'Wer am Rand liegt, kann die ganze Gerade kippen.',
      tryIt: { label: 'Person E auf 3 Aufgaben', apply: d => ({ x: [...d.x], y: d.y.map((v, i) => i === 4 ? 3 : v) }) },
    },
    {
      question: 'Alle rücken bei den Aufgaben gleich weit nach oben oder unten. Was passiert mit der Steigung?',
      options: ['bleibt gleich', 'ändert sich um denselben Betrag', 'verdoppelt sich'], correct: 0, step: 3,
      explain: 'ȳ wandert mit, alle Abstände yᵢ − ȳ bleiben gleich, also auch b₁. Nur b₀ ändert sich um denselben Betrag: Die ganze Gerade rutscht mit.',
      kurz: 'Verschieben ändert den Startwert, nicht die Steigung.',
      tryIt: { label: 'alle gleich weit verschieben', apply: d => { const k = shiftWithin(d.y, 0, 20); return { x: [...d.x], y: d.y.map(v => v + k) }; } },
    },
    {
      question: 'Wie groß ist die Summe aller Residuen?',
      options: ['immer 0', 'hängt von den Daten ab', 'immer positiv'], correct: 0, step: 5,
      explain: c => `Hier: ${c.s.e.map(e => paren(e)).join(' + ')} = 0. Die Gerade geht durch die Mitte (x̄ | ȳ); deshalb gleichen sich die Abstände über und unter ihr genau aus.`,
      kurz: 'Über und unter der Geraden gleicht sich alles aus.',
    },
    {
      question: 'Kann eine andere Gerade eine kleinere Summe der quadrierten Residuen haben?',
      options: ['ja, oft', 'nein, nie'], correct: 1, step: 6,
      explain: 'Die Formeln aus Schritt 2 und 3 liefern genau die Gerade mit der kleinsten Summe. Jede andere Gerade, steiler, flacher oder verschoben, liegt insgesamt weiter daneben.',
      kurz: 'Darum heißt das Verfahren Methode der kleinsten Quadrate.',
    },
  ],
  variants: {
    linear_regression: {
      lastStep: 3,
      kurz: 'Die lineare Regression legt eine Gerade durch die Punkte. Ihre Steigung sagt dir, wie viele Aufgaben mehr Personen im Schnitt lösen, die eine Stunde länger gelernt haben.',
      fachlich: 'Die Gerade ŷ = b₀ + b₁ · x nach der Methode der kleinsten Quadrate: b₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)² und b₀ = ȳ − b₁ · x̄.',
      symbolic: [{ part: ['b₁'], m: 2 }, ' = ', { frac: [{ big: 'Σ', m: 2 }, '(x', { sub: 'i' }, ' − ', { part: ['x̄'], m: 1 }, ')(y', { sub: 'i' }, ' − ', { part: ['ȳ'], m: 1 }, ')'], den: [{ big: 'Σ', m: 2 }, '(x', { sub: 'i' }, ' − ', { part: ['x̄'], m: 1 }, ')²'], m: 2 },
        ',   ', { part: ['b₀ = '], m: 3 }, { part: ['ȳ'], m: 1 }, { part: [' − b₁ · '], m: 3 }, { part: ['x̄'], m: 1 }],
      aria: 'b eins gleich Summe von x i minus x quer mal y i minus y quer, geteilt durch die Summe von x i minus x quer zum Quadrat; b null gleich y quer minus b eins mal x quer',
      metrics: [
        { label: 'Steigung b₁', value: c => c.s.b1 === null ? 'nicht definiert' : num(c.s.b1) },
        { label: 'Achsenabschnitt b₀', value: c => c.s.b0 === null ? 'nicht definiert' : num(c.s.b0) },
      ],
      interpret: c => {
        const s = c.s;
        if (s.b1 === null || s.b0 === null) return { kurz: 'Alle haben gleich lange gelernt. Dann lässt sich keine Steigung berechnen.', fachlich: 'Die Quadratsumme von x ist 0, deshalb sind b₁ und b₀ nicht definiert.' };
        const fach = `Die Regressionsgerade lautet ŷ = ${lineText(s.b0, s.b1)}. Die Steigung ist b₁ = ${num(s.cp)} / ${num(s.sxx)} ${eq(s.b1)} ${num(s.b1)}, also sₓᵧ / sₓ². Bei nur fünf Personen ist sie sehr unsicher.`;
        if (Math.abs(s.b1) < 0.005) return { kurz: 'Die Gerade liegt waagerecht: Wer länger lernt, löst hier im Schnitt nicht mehr Aufgaben.', fachlich: fach };
        const kurz = `Wer eine Stunde mehr gelernt hat, löst laut Gerade im Schnitt ${tasks(Math.abs(s.b1))} ${s.b1 > 0 ? 'mehr' : 'weniger'}.`;
        return {
          kurz: preset(c) === 'ausreisser' ? `${kurz} Das liegt vor allem an Person E: Mit 13 statt 3 Aufgaben stiege die Gerade um 0,5 Aufgaben je Stunde.`
            : `${kurz} Bei 0 Stunden sagt die Gerade ${tasks(s.b0)} voraus.`,
          fachlich: fach,
        };
      },
      next: { id: 'prediction', label: 'Weiter zum linearen Prädiktor' },
      genau: {
        kurz: 'Die Steigung beschreibt einen Zusammenhang in den Daten, keine Wirkung. Für Aussagen über alle Menschen braucht es Annahmen über die Fehler.',
        paragraphs: c => [
          'Die Steigung lässt sich auch als b₁ = sₓᵧ / sₓ² = r · sᵧ / sₓ schreiben. In Kovarianz und Varianz steht beide Male n − 1; es kürzt sich weg.',
          `Wer länger lernt, unterscheidet sich vielleicht auch sonst, etwa in Vorwissen oder Interesse. Die Steigung ${c.s.b1 === null ? '' : `von ${num(c.s.b1)} `}beschreibt deshalb nur, wie Lernzeit und gelöste Aufgaben zusammenhängen (Begriff „Confounding“).`,
          'Standardfehler, t-Werte und Konfidenzintervalle der Koeffizienten verlangen unabhängige Personen, gleich große Fehlerstreuung und, bei kleinen Stichproben, annähernd normalverteilte Fehler.',
          'Die Regression von x auf y ist eine andere Gerade. Sie macht die waagerechten Abstände klein, nicht die senkrechten.',
        ],
      },
    },
    prediction: {
      lastStep: 4,
      kurz: 'Der lineare Prädiktor setzt Startwert und Gewicht zu einer Vorhersage zusammen: Startwert plus Steigung mal Lernzeit. So bekommt jede Person die Zahl, die die Gerade für sie erwartet.',
      fachlich: 'Die gewichtete Summe ηᵢ = b₀ + Σ bⱼ · xᵢⱼ der Prädiktorwerte einer Person. In der linearen Regression ist der vorhergesagte Wert ŷᵢ = ηᵢ.',
      symbolic: [{ part: ['ŷᵢ'], m: 4 }, ' = ', { part: ['b₀'], m: 3 }, ' + ', { part: ['b₁'], m: 2 }, { part: [' · xᵢ'], m: 4 }],
      aria: 'y Dach i gleich b null plus b eins mal x i',
      metrics: [
        { label: 'Gerade', value: c => c.s.b1 === null ? 'nicht definiert' : `ŷ = ${lineText(c.s.b0!, c.s.b1)}` },
        { label: 'Vorhersage ŷ der gewählten Person', value: c => `${num(c.s.yhat[c.who])} (Person ${P(c)})` },
      ],
      interpret: c => {
        const i = c.who, s = c.s;
        if (s.b1 === null) return { kurz: `Ohne Steigung sagt die Gerade für alle die Mitte voraus: ${tasks(s.y.mean)}.`, fachlich: 'Die Quadratsumme von x ist 0; als Vorhersage bleibt der Mittelwert ȳ.' };
        return {
          kurz: `Für Person ${P(c)} mit ${h(s.xs[i])} Lernzeit sagt die Gerade ${tasks(s.yhat[i])} voraus. Gelöst hat ${P(c)} ${tasks(s.ys[i])}.`,
          fachlich: `ŷ ${eqAll(s.b0!, s.b1)} ${num(s.b0!)} + ${paren(s.b1)} · ${s.xs[i]} ${eqAll(s.b0!, s.b1, s.yhat[i])} ${num(s.yhat[i])}. Die Gerade liefert so für jede Lernzeit eine Vorhersage, auch für Lernzeiten, die niemand angegeben hat.`,
        };
      },
      next: { id: 'residuals', label: 'Weiter zu den Residuen' },
      genau: {
        kurz: 'Mit mehreren Prädiktoren bekommt jeder sein eigenes Gewicht. In der logistischen Regression wird der lineare Prädiktor erst noch in eine Wahrscheinlichkeit umgerechnet.',
        paragraphs: () => [
          'Mit Lernzeit und Alter schätzt R für die 200 Befragten ŷ = 5,82 + 0,52 · Lernzeit + 0,006 · Alter. Jedes Gewicht beschreibt den Zusammenhang, wenn die anderen Prädiktoren gleich bleiben.',
          'Kategorien ohne Rangfolge gehen als Dummyvariablen ein: Jede Gruppe bekommt ihr eigenes Gewicht im Vergleich zur Vergleichsgruppe.',
          'In der logistischen Regression ist ηᵢ ein Logit. Erst die logistische Funktion 1 / (1 + e^(−η)) macht daraus eine Wahrscheinlichkeit zwischen 0 und 1.',
          'Vorhersagen weit außerhalb der beobachteten Werte sind unsicher: Die Gerade weiß nicht, ob der Zusammenhang dort noch gerade verläuft.',
        ],
      },
    },
    residuals: {
      lastStep: 6,
      kurz: 'Ein Residuum sagt dir, wie weit eine Person über oder unter der Geraden liegt. Die Regression wählt die Gerade, bei der die Summe der quadrierten Residuen am kleinsten ist.',
      fachlich: 'eᵢ = yᵢ − ŷᵢ. Die Methode der kleinsten Quadrate wählt b₀ und b₁ so, dass Σeᵢ² minimal wird.',
      symbolic: [{ part: ['Σ'], m: 6 }, { part: ['e'], m: 5 }, { sub: 'i' }, { part: ['²'], m: 6 }, ' = ', { big: 'Σ', m: 6 }, { part: ['(y'], m: 5 }, { sub: 'i' }, { part: [' − '], m: 5 }, { part: ['ŷ'], m: 4 }, { sub: 'i' }, { part: [')²'], m: 6 }],
      aria: 'Summe der e i Quadrat gleich Summe von y i minus y Dach i, zum Quadrat',
      metrics: [
        { label: 'Summe der Residuen', value: () => '0' },
        { label: 'Quadratsumme Σeᵢ²', value: c => num(c.s.sse) },
      ],
      interpret: c => {
        const s = c.s, big = biggestAll(s);
        if (!big.length) return { kurz: 'Alle Punkte liegen genau auf der Geraden. Jedes Residuum ist 0.', fachlich: 'Σeᵢ² = 0: Die Gerade trifft alle Punkte.' };
        const far = big.length === 1 ? `Am weitesten liegt Person ${c.names[big[0]]} daneben: ${signed(s.e[big[0]])}.`
          : `Am weitesten liegen ${listNames(c.names, big)} daneben, je ${tasks(Math.abs(s.e[big[0]]))}.`;
        return {
          kurz: `Ohne Vorzeichen liegt eine Person im Schnitt ${tasks(s.absSum / s.n)} neben der Geraden. ${far}`,
          fachlich: `Die Quadratsumme der Residuen beträgt Σeᵢ² = ${num(s.sse)}. Ohne Gerade, nur um ȳ, wären es ${num(s.sst)}. Keine andere Gerade kommt unter ${num(s.sse)}: Das ist die Methode der kleinsten Quadrate.`,
        };
      },
      next: { id: 'explained_variance', label: 'Weiter zum erklärten Varianzanteil' },
      genau: {
        kurz: 'Die kleinste Summe hat genau eine Gerade. Ihre Residuen ergeben zusammen 0 und hängen nicht mehr mit x zusammen.',
        paragraphs: c => [
          `Die Gerade der kleinsten Quadrate erfüllt zwei Bedingungen: Σeᵢ = 0 und Σxᵢeᵢ = 0. Hier: ${c.s.xs.map((x, i) => `${x} · ${paren(c.s.e[i])}`).join(' + ')} = 0. Aus diesen beiden Gleichungen folgen die Formeln für b₀ und b₁.`,
          'Residuen helfen bei der Prüfung des Modells: Zeigen sie ein Muster oder streuen sie für große x stärker als für kleine, passt die Gerade nicht (Begriff „Gleiche Fehlervarianz“). Normalverteilt sein sollen die Fehler, nicht die Rohwerte.',
          'Σeᵢ² wächst mit der Zahl der Personen. Vergleichbar wird es als Standardfehler der Schätzung √(Σeᵢ² / (n − 2)); R nennt ihn Std. Error of the Estimate.',
          'Mit mehr Prädiktoren wird Σeᵢ² auf denselben Daten nie größer. Das sagt aber nichts darüber, wie gut das Modell neue Personen vorhersagt (Begriff „Überanpassung“).',
        ],
      },
    },
  },
};

// ---------- Brücke „Mit 200 Befragten“ ----------

type BC = BridgeCtx<Fit>;
const PB = (c: BC) => c.names[c.who];
const N = (c: BC) => c.values.length;
const t1 = (c: BC) => `„${c.col.title}“`, t2 = (c: BC) => `„${c.col2!.title}“`;
const uy = (c: BC, v: number) => unitText(c.col2!, v);
/** b₁ in Rechnungen: mit genug gültigen Ziffern, negativ in Klammern. */
const pc = (v: number) => v < 0 ? `(${coef(v)})` : coef(v);
/** Koeffizient mit der Einheit von y („0,52 Aufgaben“, „0,00031 Aufgaben“). */
const uyc = (c: BC, v: number) => `${coef(v)}${c.col2!.unit ? ` ${c.col2!.unit}` : ''}`;
const lw = (c: BC) => c.col.id === 'lernzeit' && c.col2!.id === 'wissenstest';
const shown = (v: number) => Math.round(v * 100) / 100;
/** Koeffizient mit höchstens zwei Nachkommastellen; sehr kleine Werte mit drei gültigen Ziffern („0,000368“), damit Rechnungen aufgehen. */
/** Nachkommastellen, mit denen `coef` eine Zahl zeigt. */
const coefDigits = (v: number) => { const a = Math.abs(v); return a >= 0.01 || a === 0 ? 2 : Math.min(10, 2 - Math.floor(Math.log10(a))); };
/** Der Wert, den `coef` sichtbar macht (für Proben mit den sichtbaren Zahlen). */
const coefShown = (v: number) => Number(v.toFixed(coefDigits(v)));
export const coef = (v: number) => num(v, coefDigits(v));
/** Anteil an einer Summe in Prozent, kleine Anteile als „weniger als 0,01 %“. */
const share = (part: number, whole: number) => whole <= 0 ? '0 %' : part / whole * 100 < 0.005 ? 'weniger als 0,01 %' : `${num(part / whole * 100)} %`;
/** Satz zum Skalenniveau einer Spalte, leer bei metrischen Spalten. */
function scaleNote(title: string, col: BC['col']): string {
  if (col.likert) return `Für ${title} nimmst du gleich große Abstände zwischen den Antwortstufen an.`;
  if (col.scale === 'metric') return '';
  if (col.id === 'geschlecht' || col.id === 'berufsabschluss') return `${title} hat Kategorien ohne Rangfolge; die Gerade rechnet trotzdem mit ihren Codes wie mit Zahlen.`;
  if (col.scale === 'ordinal') return `${title} hat geordnete Kategorien; die Gerade nimmt gleich große Abstände zwischen den Codes an.`;
  return `${title} hat nur die Werte 0 und 1.`;
}

const prodTerm = (c: BC, i: number): FNode[] => ['(', `${num(c.values[i])} − `, { part: [num(c.s.x.mean)], m: 1 }, ')(', `${num(c.values2![i])} − `, { part: [num(c.s.y.mean)], m: 1 }, ')'];
const sqTerm = (c: BC, i: number): FNode[] => ['(', `${num(c.values[i])} − `, { part: [num(c.s.x.mean)], m: 1 }, ')²'];

export const bridgeGerade: Bridge<Fit> = {
  data: 'pairs',
  numeric: (c, last) => {
    const s = c.s, n = N(c), out: FNode[] = ['b₁ = [ ', ...sumNodes(n, c.who, i => prodTerm(c, i)), ' ] / [ ', ...sumNodes(n, c.who, i => sqTerm(c, i)), ' ]', { br: true }];
    if (s.b1 === null) return [...out, '= ', { part: [num(s.cp)], m: 2 }, ' / ', { part: ['0'], m: 2 }, ': ', { part: ['nicht definiert'], m: 2 }];
    out.push('= ', { part: [`${num(s.cp)} / ${num(s.sxx)}`], m: 2 }, ' ≈ ', { part: [coef(s.b1)], m: 2 });
    if (last >= 3) out.push({ br: true }, 'b₀ = ', { part: [num(s.y.mean)], m: 1 }, ' − ', { part: [pc(s.b1)], m: 2 }, ' · ', { part: [num(s.x.mean)], m: 1 }, ' ≈ ', { part: [num(s.b0!)], m: 3 });
    if (last >= 4) out.push({ br: true }, 'ŷ', { sub: PB(c) }, ' = ', { part: [num(s.b0!)], m: 3 }, ' + ', { part: [pc(s.b1)], m: 2 }, ` · ${num(c.values[c.who])} ≈ `, { part: [uy(c, s.yhat[c.who])], m: 4 });
    if (last >= 5) out.push({ br: true }, 'e', { sub: PB(c) }, ` = ${num(c.values2![c.who])} − `, { part: [num(s.yhat[c.who])], m: 4 }, ' ≈ ', { part: [signed(s.e[c.who])], m: 5 });
    if (last >= 6) out.push({ br: true }, 'Σeᵢ² = ', ...sumNodes(n, c.who, i => [{ part: [`${paren(s.e[i])}²`], m: 5 }]), ' ≈ ', { part: [num(s.sse)], m: 6 });
    return out;
  },
  lines: [
    {
      all: c => `Mittelwert von ${t1(c)}: x̄ ${eq(c.s.x.mean)} ${c.u(c.s.x.mean)}. Mittelwert von ${t2(c)}: ȳ ${eq(c.s.y.mean)} ${uy(c, c.s.y.mean)}.`,
      person: c => `${PB(c)} hat ${c.u(c.values[c.who])} bei ${t1(c)} und ${uy(c, c.values2![c.who])} bei ${t2(c)}.`,
    },
    {
      all: c => c.s.b1 === null ? `${t1(c)} streut nicht. Dann gibt es keine Steigung.`
        : `Summe der Produkte ${num(c.s.cp)}, Quadratsumme von x ${num(c.s.sxx)}: b₁ = ${num(c.s.cp)} / ${num(c.s.sxx)} ≈ ${coef(c.s.b1)}.`,
      person: c => { const i = c.who, p = c.s.prod[i], dx = round(c.s.x.dev[i], 2), dy = round(c.s.y.dev[i], 2); return `${PB(c)} steuert ${paren(dx)} · ${paren(dy)} ${eqFrom(dx * dy, p)} ${signed(p)} zum Zähler und ${num(c.s.xsq[i])} zum Nenner bei.`; },
    },
    {
      all: c => {
        const s = c.s;
        if (s.b1 === null || s.b0 === null) return 'Ohne Steigung gibt es keinen Achsenabschnitt.';
        const visible = shown(s.y.mean) - coefShown(s.b1) * shown(s.x.mean), fits = num(visible) === num(s.b0);
        return `b₀ = ${num(s.y.mean)} − ${pc(s.b1)} · ${num(s.x.mean)} ≈ ${num(s.b0)}${fits ? '' : ' (mit allen Nachkommastellen)'}. So geht die Gerade durch den Punkt der beiden Mitten.`;
      },
      person: c => `${PB(c)} geht in b₀ nur über die beiden Mitten und die Steigung ein, wie jede andere Person auch.`,
    },
    {
      all: c => {
        const s = c.s;
        if (s.b1 === null) return `Ohne Steigung sagt die Gerade für alle ${N(c)} Personen ȳ voraus.`;
        return `Für jede der ${N(c)} Personen: ŷ = ${lineText(s.b0!, s.b1, coef)}. Die Vorhersagen reichen von ${uy(c, Math.min(...s.yhat))} bis ${uy(c, Math.max(...s.yhat))}.`;
      },
      person: c => {
        const s = c.s, i = c.who;
        return s.b1 === null ? `${PB(c)} bekommt wie alle ${uy(c, s.yhat[i])}.` : `${PB(c)}: ${num(s.b0!)} + ${pc(s.b1)} · ${num(c.values[i])} ≈ ${uy(c, s.yhat[i])}.`;
      },
    },
    {
      all: c => `Beobachtet minus vorhergesagt, für jede Person. ${c.s.above} liegen über der Geraden, ${c.s.below} darunter; zusammen ergeben die Residuen 0.`,
      person: c => { const i = c.who, e = c.s.e[i]; return `${PB(c)}: ${num(c.values2![i])} − ${num(c.s.yhat[i])} ≈ ${signed(e)}, also ${toLine(e, v => uy(c, v))}.`; },
    },
    {
      all: c => { const b = c.s.biggest; return c.s.sse < 1e-9 ? 'Alle Residuen sind 0, die Summe ihrer Quadrate auch.' : `Die ${N(c)} Quadrate ergeben Σeᵢ² ≈ ${num(c.s.sse)}. Den größten Beitrag liefert ${c.names[b]} mit e ≈ ${signed(c.s.e[b])}.`; },
      person: c => `${PB(c)} steuert ${num(c.s.e2[c.who])} bei, das sind ${share(c.s.e2[c.who], c.s.sse)} der Summe.`,
    },
  ],
  metrics: (c, variant) => {
    const s = c.s, n = { label: 'Befragte n', value: String(N(c)) };
    const b1 = { label: 'Steigung b₁', value: s.b1 === null ? 'nicht definiert' : coef(s.b1) };
    if (variant === 'prediction') return [n, { label: 'Gerade', value: s.b1 === null ? 'nicht definiert' : `ŷ = ${lineText(s.b0!, s.b1, coef)}` }, { label: 'Vorhersage ŷ der gewählten Person', value: `${uy(c, s.yhat[c.who])} (${PB(c)})` }];
    if (variant === 'residuals') return [n, b1, { label: 'Quadratsumme Σeᵢ²', value: num(s.sse) }];
    return [n, { label: 'Achsenabschnitt b₀', value: s.b0 === null ? 'nicht definiert' : num(s.b0) }, b1];
  },
  interpret: (c, variant) => {
    const s = c.s, n = N(c);
    if (s.b1 === null || s.b0 === null) return { kurz: `${t1(c)} hat bei allen denselben Wert. Dann lässt sich keine Gerade berechnen.`, fachlich: 'Die Quadratsumme von x ist 0, deshalb sind b₁ und b₀ nicht definiert.' };
    const zusatz = `${s.above} von ${n} Befragten liegen über der Geraden, ${s.below} darunter.`;
    if (variant === 'prediction') {
      const i = c.who;
      return {
        kurz: lw(c) ? `Für ${PB(c)} mit ${num(c.values[i])} Stunden Lernzeit sagt die Gerade ${unit(s.yhat[i], 'gelöste Aufgabe', 'gelöste Aufgaben')} voraus. Gelöst hat ${PB(c)} ${tasks(c.values2![i])}.`
          : `Für ${PB(c)} (${c.u(c.values[i])} bei ${t1(c)}) sagt die Gerade ${uy(c, s.yhat[i])} bei ${t2(c)} voraus. Beobachtet sind ${uy(c, c.values2![i])}.`,
        fachlich: `ŷ = ${num(s.b0)} + ${pc(s.b1)} · ${num(c.values[i])} ≈ ${num(s.yhat[i])}. In der linearen Regression ist der lineare Prädiktor die Vorhersage selbst.`,
        zusatz: `Die Vorhersagen reichen von ${uy(c, Math.min(...s.yhat))} bis ${uy(c, Math.max(...s.yhat))}, beobachtet sind ${uy(c, Math.min(...c.values2!))} bis ${uy(c, Math.max(...c.values2!))}.`,
      };
    }
    if (variant === 'residuals') {
      const se = n > 2 ? Math.sqrt(s.sse / (n - 2)) : 0, within = s.e.filter(e => Math.abs(e) <= se + 1e-9).length, b = s.biggest;
      return {
        kurz: s.sse < 1e-9 ? 'Alle Punkte liegen genau auf der Geraden.' : `Ohne Vorzeichen liegt eine Person im Schnitt ${uy(c, s.absSum / n)} neben der Geraden. Am weitesten liegt ${c.names[b]} daneben: ${signed(s.e[b])}${c.col2!.unit ? ` ${c.col2!.unit}` : ''}.`,
        fachlich: `Die Quadratsumme der Residuen beträgt Σeᵢ² ≈ ${num(s.sse)} bei n = ${n}; ohne Gerade, nur um ȳ, wären es ${num(s.sst)}. Der Standardfehler der Schätzung ist √(Σeᵢ² / (n − 2)) ≈ ${num(se)}.`,
        zusatz: `${within} von ${n} Befragten liegen höchstens ${uy(c, se)} von der Geraden entfernt.`,
      };
    }
    const tiny = Math.abs(s.b1) < 0.005 && coef(s.b1) === num(s.b1);
    return {
      kurz: tiny ? `Zwischen ${t1(c)} und ${t2(c)} zeigt die Gerade fast keine Steigung.`
        : lw(c) ? `Wer eine Stunde mehr gelernt hat, löst laut Gerade im Schnitt ${tasks(Math.abs(s.b1))} ${s.b1 > 0 ? 'mehr' : 'weniger'}. Das gilt im Durchschnitt, nicht für jede Person.`
        : `Liegt ${t1(c)} um eine Einheit${c.col.unit ? ` (${c.col.unit})` : ''} höher, liegt ${t2(c)} laut Gerade im Schnitt ${uyc(c, Math.abs(s.b1))} ${s.b1 > 0 ? 'höher' : 'niedriger'}.`,
      fachlich: `Die Regressionsgerade lautet ŷ = ${lineText(s.b0, s.b1, coef)} bei n = ${n}. b₁ = sₓᵧ / sₓ² ≈ ${coef(s.b1)}; der Achsenabschnitt b₀ ≈ ${num(s.b0)} ist die Vorhersage bei x = 0.`,
      zusatz,
    };
  },
  voraussetzung: c => [
    'Die Gerade erfasst nur einen geraden Zusammenhang, und ihre Steigung beschreibt einen Zusammenhang, keine Wirkung.',
    scaleNote(t1(c), c.col), scaleNote(t2(c), c.col2!),
  ].filter(Boolean).join(' '),
  picture: (c, step) => ({
    center: [c.s.x.mean, c.s.y.mean],
    deviation: step === 2,
    quadrants: step === 2,
    contributions: step === 2 ? { label: 'Abweichungsprodukte aller Befragten, der Größe nach', values: c.s.prod }
      : step === 6 ? { label: 'Quadrierte Residuen aller Befragten, der Größe nach', values: c.s.e2 } : undefined,
  }),
  value: (c, variant) => variant === 'prediction' ? c.s.yhat[c.who] : variant === 'residuals' ? c.s.sse : c.s.b1,
};

gerade.bridge = bridgeGerade;
