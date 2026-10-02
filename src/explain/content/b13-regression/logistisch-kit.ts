// Gemeinsames der logistischen Begriffe in B13 (Logit, Likelihood, Logistische Regression, Marginale Effekte):
// das Katalogmodell weiterbildung ~ lernzeit + alter für die aktuellen Daten, das Beispiel „mindestens 10 Aufgaben“
// und die Zeichen der Codelegende. Referenzwerte aus R in b13-regression.test.ts.
import type { SampleCtx, TokenNote } from '../../types';
import { sampleColumn } from '../../sample';
import { ref, titleFor } from '../../../domain/learning';
import { invLogit, logistic } from './fit';

/**
 * Beispiel „mindestens 10 von 20 Aufgaben“ (R: bestanden = rec(wissenstest, rules = "10:20=1; 0:9=0"),
 * glm(bestanden ~ lernzeit, family = binomial)): 122 von 200 schaffen es.
 */
export const BESTANDEN = { k: 122, n: 200, b0: -2.043177832, b1: 0.335612347, ame: 0.0651654, nullDev: 267.4992, dev: 227.9453 } as const;
/** Vorhergesagte Wahrscheinlichkeit, mindestens 10 Aufgaben zu lösen, bei `h` Stunden Lernzeit. */
export const pBestanden = (h: number) => invLogit(BESTANDEN.b0 + BESTANDEN.b1 * h);

/** Katalogmodell weiterbildung ~ lernzeit + alter (R: glm, binomial) für die Ausgangsdaten. */
export const WB_MODELL = { b0: 0.011477758418, b1: -0.005960168232, b2: -0.007023127517, dev: 270.0636, nullDev: 270.7434, ameX: -0.001436868, ameA: -0.001693125, k: 82 } as const;

/**
 * Logitmodell für die aktuellen Daten: Rolle y (Ja/Nein, Standard weiterbildung) aus x (Standard lernzeit) und alter,
 * wie der Katalogaufruf. Dazu das Modell ohne Prädiktoren und der mittlere marginale Effekt von x.
 */
export function wbModel(c: SampleCtx) {
  const xId = c.columns.x?.[0] ?? 'lernzeit', yId = c.columns.y?.[0] ?? 'weiterbildung';
  const x = sampleColumn(c.rows, xId), a = sampleColumn(c.rows, 'alter'), y = sampleColumn(c.rows, yId);
  const k = y.filter(v => v === 1).length, n = y.length;
  const m = logistic([x, a], y);
  if (!m) return null;
  return { b: m.b, p: m.p, dev: m.deviance, nullDev: m.nullDeviance, chi2: m.nullDeviance - m.deviance, k, n, ame: m.ame[0], or: Math.exp(m.b[1]) };
}

export const LOGISTIC_TOKEN: TokenNote = {
  sym: 'logistic_regression()', term: titleFor(ref('logistic_regression')),
  kurz: 'Schätzt ein Logitmodell für eine Ja-Nein-Variable. Links von ~ steht die Variable mit 0 und 1, rechts stehen die Prädiktoren.',
  fehler: 'Hat die linke Seite mehr als zwei Werte, meldet mariposa zum Beispiel: Dependent variable `wissenstest` must be binary: it has 17 distinct values.',
};
export const FACTORS_TOKEN: TokenNote = {
  sym: 'factors =', term: titleFor(ref('dummy')),
  kurz: '"dummy" nimmt Kategorien als Dummyvariablen ins Modell, "numeric" mit ihren Codes als Zahlen.',
  fehler: 'Ein Tippfehler wie factors = "dummies" ergibt: \'arg\' sollte eines von \'“dummy”, “numeric”\' sein.',
};
