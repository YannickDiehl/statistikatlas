// Muster der Vorlagen, aus ihren Bereichen herausgenommen (Spezifikation Ausbau, Abschnitt 6):
// `p_value` als Begriffskarte, `dummy` als Tabellen-Werkzeug, beide mit Reitern (Vorbild für die Bereiche).
import type { AreaIndex, SampleCtx } from '../../types';
import { num } from '../../format';
import { tTest } from '../../../tasks/kit/means';
import { pWert } from './p-wert';
import { dummy, ABSCHLUESSE } from './dummy';

/**
 * Lernzeit nach Weiterbildung (Welch-t-Test wie mariposa::t_test) für die aktuellen Daten. Die Richtung ist die von
 * mariposa 0.7.4: Gruppe 0 minus Gruppe 1, also ohne minus mit Weiterbildung (`d`, `t`), wie in „In R“.
 */
export function lernzeitNachWeiterbildung(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'lernzeit', g = c.columns.group?.[0] ?? 'weiterbildung';
  const y = c.rows.map(r => r.values[x]), groups = c.rows.map(r => r.values[g]);
  const mean = (k: number) => { const v = y.filter((_, i) => groups[i] === k); return { n: v.length, m: v.reduce((a, b) => a + b, 0) / v.length }; };
  const mit = mean(1), ohne = mean(0), test = tTest(y, groups), d = ohne.m - mit.m;
  return { mit, ohne, test, d, t: test ? d / test.welch.se : NaN };
}

/** Zahl der Befragten je Schulabschluss (Codes 0 bis 4). */
const perCode = (c: SampleCtx) => ABSCHLUESSE.map(a => c.rows.filter(r => r.values[c.columns.x?.[0] ?? 'schulabschluss'] === a.code).length);

export const muster: AreaIndex = {
  explanations: {
    [pWert.concept]: { kind: 'begriff', card: pWert },
    [dummy.concept]: { kind: 'tabelle', tool: dummy },
  },
  tabs: {
    p_value: {
      sample: {
        kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },
        kurz: 'Dieselbe Frage mit allen 200 Befragten: Lernen Befragte mit Weiterbildung anders lange als die ohne?',
        value: c => lernzeitNachWeiterbildung(c).test?.welch.p ?? null,
        result: c => {
          const { mit, ohne, test, d, t } = lernzeitNachWeiterbildung(c);
          if (!test) return { kurz: 'In einer der beiden Gruppen streut die Lernzeit nicht. Dann lässt sich kein t-Test rechnen.', fachlich: 'Der Welch-t-Test braucht in beiden Gruppen mindestens zwei verschiedene Werte.' };
          const p = test.welch.p, shownP = p < 0.001 ? '< 0,001' : `≈ ${num(p)}`;
          return {
            kurz: `Befragte mit Weiterbildung haben in den letzten sieben Tagen im Schnitt ${num(mit.m)} Stunden gelernt, die ohne ${num(ohne.m)} Stunden. Gäbe es keinen Unterschied, wäre so ein Ergebnis ${p >= 0.05 ? 'nicht überraschend' : 'überraschend'} (p ${shownP}).`,
            fachlich: `Welch-t-Test, zweiseitig, in der Richtung von R: ohne minus mit Weiterbildung ${num(d)} h, t ≈ ${num(t)} bei ${num(test.welch.df, 1)} Freiheitsgraden, p ${shownP}.`,
            zusatz: `${mit.n} Befragte haben in den letzten zwölf Monaten eine Weiterbildung gemacht, ${ohne.n} nicht.`,
          };
        },
        voraussetzung: 'Der Test nimmt unabhängige Befragte an. Die Gruppenmittelwerte sollen annähernd normalverteilt sein; bei mehr als 30 Personen je Gruppe ist das meist erfüllt.',
        think: [
          {
            question: 'Alle lernen doppelt so lange. Was passiert mit p?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
            explain: 'Unterschied und Standardfehler verdoppeln sich beide. t ist ihr Verhältnis und bleibt gleich, also auch p.',
            kurz: 'p hängt nicht von der Einheit ab.',
            tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
            expect: { change: 'same' },
          },
          {
            question: 'Alle lernen eine Stunde mehr. Was passiert mit p?', options: ['bleibt gleich', 'wird kleiner', 'wird größer'], correct: 0,
            explain: 'Beide Gruppen rücken um eine Stunde. Der Unterschied zwischen ihnen bleibt, die Streuung auch.',
            kurz: 'Verschieben ändert nichts am Vergleich.',
            tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
            expect: { change: 'same' },
          },
        ],
      },
      r: {
        entry: 't_test', variant: 0,
        tokens: {
          t_test: { sym: 't_test()', term: 't-Test', kurz: 'Vergleicht die Mittelwerte zweier Gruppen und meldet t, die Freiheitsgrade, p und die Effektgröße g.', fehler: 't_test() vergleicht genau zwei Gruppen. Bei mehr Gruppen meldet mariposa: must have exactly 2 groups.' },
        },
        outputMap: [
          { match: 'p', atlas: 'p-Wert', step: 3, explain: 'Wie überraschend wäre ein so großer Unterschied, wenn es in Wahrheit keinen gäbe? Ein großer p-Wert heißt: gar nicht überraschend.' },
          { match: 't', atlas: 'Prüfgröße t', step: 2, explain: 'Der Unterschied geteilt durch seinen Standardfehler. In Klammern stehen die Freiheitsgrade.' },
          { match: 'g', atlas: 'Effektgröße', explain: 'g misst den Unterschied in Standardabweichungen. In Klammern schreibt R auf Englisch, wie groß er ist; negligible heißt vernachlässigbar.' },
          { match: 'N', atlas: 'n', explain: 'N zählt alle Befragten in beiden Gruppen.' },
        ],
        check: {
          question: 'Welche Zahl in der Ausgabe ist der p-Wert? Tippe sie an.', correct: 'p',
          wrong: { t: 'Fast! Das ist die Prüfgröße t. Aus ihr und der Nullverteilung entsteht p.', g: 'Fast! Das ist die Effektgröße g. Sie sagt, wie groß der Unterschied ist, nicht wie überraschend.', N: 'Fast! N ist die Zahl der Befragten. Der p-Wert steht hinter p =.' },
        },
      },
      next: {
        next: { id: 'alpha_level', why: 'Die Schwelle, die du vor der Auswertung festlegst. Liegt p darunter, nennt man das Ergebnis signifikant.' },
        before: [
          { id: 'hypothesis', why: 'p rechnet so, als ob die Nullhypothese stimmt.' },
          { id: 'test_statistic', why: 'Aus der Prüfgröße und ihrer Verteilung entsteht p.' },
          { id: 'null_distribution', why: 'Zeigt, welche Ergebnisse ohne echten Unterschied üblich wären.' },
        ],
        after: [
          { id: 'multiplicity', why: 'Wer viele Tests rechnet, findet auch ohne echte Unterschiede kleine p-Werte.' },
          { id: 'type_errors', why: 'Was passiert, wenn du dich aufgrund von p falsch entscheidest.' },
        ],
        more: [
          { id: 'effect', why: 'p sagt nichts darüber, wie groß ein Unterschied ist.' },
          { id: 'confidence', why: 'Zeigt, wie groß der Unterschied plausibel sein könnte.' },
          { id: 't_test', why: 'Der Test, aus dem das Beispiel stammt.' },
        ],
      },
    },
    dummy: {
      sample: {
        kind: 'analysis', columns: { x: 'schulabschluss' },
        kurz: 'Dieselbe Umwandlung für alle 200 Befragten: Jede Person bekommt in jeder Dummyspalte eine 0 oder eine 1.',
        result: c => {
          const k = perCode(c), n = c.rows.length;
          return {
            kurz: `In der Vergleichsgruppe „${ABSCHLUESSE[0].label}“ sind ${k[0]} Befragte; sie haben in allen Dummyspalten eine 0. Die anderen ${n - k[0]} haben genau eine 1.`,
            fachlich: `Mit Code 0 als Vergleichsgruppe entstehen vier Spalten. Einsen: ${ABSCHLUESSE.slice(1).map((a, i) => `${a.name} ${k[i + 1]}`).join(', ')}.`,
            zusatz: `Zusammen ${k.slice(1).reduce((a, b) => a + b, 0)} Einsen bei ${n} Befragten: Jede Person außerhalb der Vergleichsgruppe zählt genau einmal.`,
          };
        },
        voraussetzung: 'Jede Person hat genau einen gültigen Schulabschluss. Fehlt eine Angabe, steht in R in allen Dummyspalten NA.',
        think: [
          {
            question: 'Angenommen, alle hätten Abitur. Was steht dann in der Spalte abitur?', options: ['lauter Einsen', 'lauter Nullen', 'je zur Hälfte'], correct: 0,
            explain: 'Jede Person gehört jetzt zur Gruppe Abitur. In ihrer Spalte steht überall 1, in den anderen Spalten überall 0.',
            kurz: 'Ohne Unterschiede gibt es nichts mehr zu vergleichen.',
            tryIt: { label: 'alle auf Abitur (Code 4)', op: 'constant', column: 'x', value: 4 },
            expect: { change: 'equals', value: 200, measure: c => perCode(c)[4] },
          },
          {
            question: 'Angenommen, niemand hätte einen Schulabschluss. Wie viele Einsen gibt es dann?', options: ['keine', '200', '800'], correct: 0,
            explain: 'Alle gehören zur Vergleichsgruppe, und die hat keine eigene Spalte. In allen vier Dummyspalten steht nur 0.',
            kurz: 'Die Vergleichsgruppe erkennst du an lauter Nullen.',
            tryIt: { label: 'alle auf ohne Schulabschluss (Code 0)', op: 'constant', column: 'x', value: 0 },
            expect: { change: 'equals', value: 0, measure: c => perCode(c).slice(1).reduce((a, b) => a + b, 0) },
          },
        ],
      },
      r: {
        entry: 'dummy', variant: 0,
        tokens: {
          to_dummy: { sym: 'to_dummy()', term: 'Dummyvariablen', kurz: 'Bildet aus einer Spalte mit Codes eine 0/1-Spalte je Code. ref nennt die Vergleichsgruppe, die keine eigene Spalte bekommt.', fehler: 'Ohne ref bekommt jeder Code eine Spalte. In einer Regression ist dann eine davon überflüssig, weil sie aus den anderen folgt.' },
          '"schulabschluss_"': { sym: '"schulabschluss_"', term: 'Spalten auswählen', kurz: 'Der Anfang der Spaltennamen: starts_with() wählt alle Spalten, die so beginnen, also die vier Dummyspalten.', fehler: 'Ohne den Unterstrich passt auch die Spalte schulabschluss selbst dazu, und sie steht mit in der Tabelle.' },
          ref: { sym: 'ref =', term: 'Vergleichsgruppe', kurz: 'Der Code, der keine eigene Spalte bekommt. Hier ist es 0, ohne Schulabschluss.', fehler: 'Nennst du einen Code, den es nicht gibt, meldet mariposa: `ref` = 9 is not a category of `schulabschluss`.' },
        },
        outputMap: [
          { match: '200 × 4', atlas: '200 Befragte, 4 Dummyspalten', explain: '200 Zeilen für die Befragten, 4 Spalten: eine je Abschluss außer der Vergleichsgruppe.' },
          { match: 'schulabschluss_4', atlas: 'Spalte abitur', explain: 'schulabschluss_4 entspricht der Spalte abitur im Werkzeug. In der ersten Zeile steht 0: Person P001 hat kein Abitur.' },
        ],
        check: {
          question: 'Woran siehst du, wie viele Dummyspalten entstanden sind? Tippe es an.', correct: '200 × 4',
          wrong: { schulabschluss_4: 'Fast! Das ist ein Eintrag der ersten Person. Wie viele Spalten es sind, steht oben hinter „A tibble“.' },
        },
      },
      next: {
        next: { id: 'linear_regression', why: 'Dort gehen Dummyvariablen als erklärende Variablen ein: Jede Spalte vergleicht eine Gruppe mit der Vergleichsgruppe.' },
        before: [
          { id: 'nominal', why: 'Dummys übersetzen Kategorien ohne Rangfolge in Zahlen, mit denen man rechnen kann.' },
          { id: 'recode', why: 'Mit rec() bildest du jede Dummyspalte auch selbst.' },
        ],
        after: [{ id: 'prediction', why: 'In der Vorhersage einer Regression bekommt jede Dummyspalte ihr eigenes Gewicht.' }],
        more: [{ id: 'ordinal', why: 'Auch geordnete Kategorien wie der Schulabschluss werden oft als Dummys ausgewertet.' }],
      },
    },
  },
};
