import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../domain/survey';
import { abbreviated, applyOp, bridgeContext, countWithin, fitsColumn, modifiedFrom, sampleColumn, samplePairs, sampleSeries, sumNodes, unitText } from './sample';
import { series, pairStats } from './math';
import { num } from './format';

/**
 * Reine Rechnung für den Reiter „Mit 200 Befragten“ (Spezifikation Lehrdatensatz, Abschnitte 5.3 und 5.4).
 * Referenzwerte der Lernzeit aus R (mariposa 0.7.4 auf Statistikatlas-200-Befragte.sav):
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   sum(atlas$lernzeit)                              # 1550.3
 *   mean(atlas$lernzeit)                             # 7.7515
 *   sum((atlas$lernzeit - mean(atlas$lernzeit))^2)   # 2085.81955
 *   sd(atlas$lernzeit)                               # 3.237515
 *   with(atlas, sum(abs(lernzeit - mean(lernzeit)) <= sd(lernzeit)))   # 141
 *   atlas$id[which.max((atlas$lernzeit - mean(atlas$lernzeit))^2)]     # "P175", lernzeit 18.4
 *   sd(replace(atlas$lernzeit, atlas$id == "P002", 40))                 # 3.960
 *   atlas %>% pearson_cor(lernzeit, wissenstest)                        # r = 0.539
 *   atlas %>% summarise(kovarianz = cov(lernzeit, wissenstest))         # 5.44
 */
const rows = createSurvey();
const near = (a: number, b: number, tol: number, label: string) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} statt ${b}`);

test('sampleSeries: the learning time of all 200 matches R', () => {
  const s = sampleSeries(rows, 'lernzeit');
  assert.equal(s.values.length, 200);
  near(s.sum, 1550.3, 1e-9, 'Summe');
  near(s.mean, 7.7515, 1e-12, 'Mittelwert');
  near(s.ss, 2085.81955, 1e-6, 'Quadratsumme');
  near(s.variance, 2085.81955 / 199, 1e-9, 'Varianz');
  near(s.sd, 3.237515, 1e-6, 's');
  near(s.dev.reduce((a, b) => a + b, 0), 0, 1e-9, 'Abweichungen ergeben zusammen 0');
  assert.equal(s.sq.length, 200);
  assert.equal(rows[s.biggest].id, 'P175');
  assert.equal(s.values[s.biggest], 18.4);
  near(s.sq[s.biggest], (18.4 - 7.7515) ** 2, 1e-9, 'größter Beitrag');
  near(s.sq[s.biggest], 113.3906, 1e-4, 'größter Beitrag gerundet');
  assert.equal(countWithin(s.values, s.mean - s.sd, s.mean + s.sd), 141);
  assert.equal(`${num(s.mean - s.sd)} bis ${num(s.mean + s.sd)}`, '4,51 bis 10,99');
});

test('samplePairs: covariance and r of learning time and test score match R', () => {
  const p = samplePairs(rows, 'lernzeit', 'wissenstest');
  near(p.cov, 5.44, 0.005, 'Kovarianz');
  near(p.r ?? NaN, 0.539, 0.0005, 'r');
  near(p.sx, 3.237515, 1e-6, 'sₓ');
  assert.equal(p.prod.length, 200);
  near(p.prod.reduce((a, b) => a + b, 0) / 199, p.cov, 1e-9, 'Summe der Produkte durch n − 1');
  assert.equal(samplePairs(applyOp(rows, 'wissenstest', 'constant', 10), 'lernzeit', 'wissenstest').r, null, 'ohne Streuung kein r');
});

test('applyOp round trips: shift keeps s, double doubles s, an outlier at P002 raises s to 3,96', () => {
  const s = sampleSeries(rows, 'lernzeit').sd;
  const shifted = applyOp(rows, 'lernzeit', 'shift');
  near(sampleSeries(shifted, 'lernzeit').sd, s, 1e-9, 'shift');
  near(sampleSeries(shifted, 'lernzeit').mean, 8.7515, 1e-9, 'shift verschiebt die Mitte um 1');
  near(sampleSeries(applyOp(rows, 'lernzeit', 'shift', 2), 'lernzeit').mean, 9.7515, 1e-9, 'shift um 2');
  const doubled = sampleSeries(applyOp(rows, 'lernzeit', 'double'), 'lernzeit');
  near(doubled.sd, 2 * s, 1e-9, 'double');
  near(doubled.variance, 4 * sampleSeries(rows, 'lernzeit').variance, 1e-9, 'Varianz vervierfacht');
  const p002 = rows.findIndex(r => r.id === 'P002');
  const outlier = sampleSeries(applyOp(rows, 'lernzeit', 'outlier', 40, p002), 'lernzeit');
  assert.equal(num(outlier.sd, 3), '3,96');
  near(outlier.sd, 3.960, 0.0005, 'outlier');
  const constant = sampleSeries(applyOp(rows, 'lernzeit', 'constant'), 'lernzeit');
  near(constant.sd, 0, 1e-12, 'constant ohne Wert setzt alle auf den Mittelwert');
  near(constant.mean, 7.7515, 1e-9, 'constant behält den Mittelwert');
  // Nur die eine Spalte ändert sich, die Daten selbst bleiben unberührt.
  assert.equal(rows[p002].values.lernzeit, sampleColumn(createSurvey(), 'lernzeit')[p002]);
  assert.deepEqual(applyOp(rows, 'lernzeit', 'double')[5].values.wissenstest, rows[5].values.wissenstest);
  assert.ok(Number.isInteger(applyOp(rows, 'lernzeit', 'double')[0].values.lernzeit * 10), 'ohne Rundungsreste');
});

test('modifiedFrom tells edited data from the starting data', () => {
  const base = createSurvey();
  assert.equal(modifiedFrom(rows, base), false);
  assert.equal(modifiedFrom(applyOp(rows, 'lernzeit', 'shift'), base), true);
  assert.equal(modifiedFrom(applyOp(applyOp(rows, 'lernzeit', 'shift', 1), 'lernzeit', 'shift', -1), base), false, 'zurückgeschoben ist wie vorher');
});

test('abbreviated: first, chosen and last term with an ellipsis', () => {
  const term = (v: number) => `(${num(v)} − 7,75)²`;
  assert.equal(abbreviated([6, 7, 8, 9, 10], 2, term), '(6 − 7,75)² + … + (8 − 7,75)² + … + (10 − 7,75)²');
  assert.equal(abbreviated([6, 7, 8, 9, 10], 0, term), '(6 − 7,75)² + … + (10 − 7,75)²');
  assert.equal(abbreviated([6, 7, 8, 9, 10], 4, term), '(6 − 7,75)² + … + (10 − 7,75)²');
  assert.equal(abbreviated([6, 7, 8, 9, 10], 1, term), '(6 − 7,75)² + (7 − 7,75)² + … + (10 − 7,75)²');
  assert.equal(abbreviated([6, 7, 8], 1, term), '(6 − 7,75)² + (7 − 7,75)² + (8 − 7,75)²');
  assert.equal(abbreviated([6, 7], 1, term, ' · '), '(6 − 7,75)² · (7 − 7,75)²');
});

test('reverse flips the sign of r, fitsColumn guards the data, the shift of Y keeps r', () => {
  const r = samplePairs(rows, 'lernzeit', 'wissenstest').r!;
  // R: atlas %>% mutate(wissenstest = 20 - wissenstest) %>% pearson_cor(lernzeit, wissenstest)  # r = -0.539
  near(samplePairs(applyOp(rows, 'wissenstest', 'reverse'), 'lernzeit', 'wissenstest').r!, -r, 1e-9, 'umgepolt');
  // R: atlas %>% mutate(wissenstest = wissenstest + 2) %>% pearson_cor(lernzeit, wissenstest)  # r = 0.539
  near(samplePairs(applyOp(rows, 'wissenstest', 'shift', 2), 'lernzeit', 'wissenstest').r!, r, 1e-9, 'verschoben');
  // R: atlas %>% mutate(lernzeit = replace(lernzeit, id == "P002", 40)) %>% pearson_cor(lernzeit, wissenstest)  # r = 0.426
  near(samplePairs(applyOp(rows, 'lernzeit', 'outlier', 40, 1), 'lernzeit', 'wissenstest').r!, 0.426, 0.0005, 'Ausreißer');
  assert.equal(fitsColumn(rows, 'wissenstest'), true);
  assert.equal(fitsColumn(applyOp(rows, 'wissenstest', 'shift', 2), 'wissenstest'), true, 'höchstens 18 + 2 = 20');
  assert.equal(fitsColumn(applyOp(rows, 'wissenstest', 'double'), 'wissenstest'), false, 'über 20 Aufgaben gibt es nicht');
  assert.equal(fitsColumn(applyOp(rows, 'schulabschluss', 'constant', 4), 'schulabschluss'), true);
  assert.equal(fitsColumn(applyOp(rows, 'schulabschluss', 'constant'), 'schulabschluss'), false, 'der Mittelwert ist kein Antwortcode');
  assert.equal(fitsColumn(applyOp(rows, 'lernzeit', 'outlier', 40, 1), 'lernzeit'), true);
});

test('bridge context: workshop math on all 200, units of the column, abbreviated formula nodes', () => {
  const c = bridgeContext(series, 'series', rows, 'lernzeit', '', 1);
  assert.equal(c.names[c.who], 'P002');
  assert.equal(c.s.xs.length, 200);
  near(c.s.sd, 3.237515, 1e-6, 's');
  assert.equal(c.u(c.s.sd), '3,24 h');
  assert.equal(c.u(c.s.variance, { squared: true }), '10,48 h²');
  assert.equal(unitText({ id: 'einkommen', title: 'Einkommen', unit: '€/Monat', question: '', scale: 'metric', likert: false }, 4, { squared: true }), '4 (€/Monat)²');
  assert.equal(unitText({ id: 'lernplanung5', title: 'Lernplanung', unit: '', question: '', scale: 'ordinal', likert: true }, 3.256), '3,26');
  // IB34: Einzahl bei genau 1 („1 Jahr“), sonst Mehrzahl; Abkürzungen bleiben.
  const col = (id: string, unit: string) => ({ id, title: id, unit, question: '', scale: 'metric' as const, likert: false });
  assert.equal(unitText(col('alter', 'Jahre'), 1), '1 Jahr'); assert.equal(unitText(col('alter', 'Jahre'), -1), '−1 Jahr');
  assert.equal(unitText(col('alter', 'Jahre'), 1.004), '1 Jahr', 'gerundet 1'); assert.equal(unitText(col('alter', 'Jahre'), 1.5), '1,5 Jahre');
  assert.equal(unitText(col('alter', 'Jahre'), 0), '0 Jahre'); assert.equal(unitText(col('haushaltsgroesse', 'Personen'), 1), '1 Person');
  assert.equal(unitText(col('wissenstest', 'Aufgaben'), 1), '1 Aufgabe'); assert.equal(unitText(col('lernzeit', 'h'), 1), '1 h');
  assert.equal(unitText(col('alter', 'Jahre'), 1, { squared: true }), '1 Jahr²');
  const p = bridgeContext(pairStats, 'pairs', rows, 'lernzeit', 'wissenstest', 0);
  near(p.s.r!, 0.539, 0.0005, 'r');
  assert.equal(p.col2?.title, 'Wissenstest');
  const flat = (nodes: unknown[]): string => nodes.map(n => typeof n === 'string' ? n : flat((n as { part: unknown[] }).part)).join('');
  const nodes = sumNodes(200, 1, i => [`x${i + 1}`], [' + ']);
  assert.equal(flat(nodes), 'x1 + x2 + … + x200');
  assert.deepEqual(nodes.filter(n => typeof n !== 'string'), [{ part: ['x2'], m: 'who' }], 'nur der Summand der gewählten Person ist markiert');
  assert.equal(flat(sumNodes(200, 99, i => [`x${i + 1}`])), 'x1 + … + x100 + … + x200');
});
