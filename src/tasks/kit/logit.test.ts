import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { averageMarginalEffects, linkinv, logistic, logitOf, LOGIT_PROBLEMS, predictProb, type LogitFit } from './logit';
import { validValues } from './stats';

const close = (actual: number, expected: number, tol = 1e-8) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);
const closeAll = (actual: number[], expected: number[], tol = 1e-8) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((v, i) => close(v, expected[i], tol));
};

// Testdatei wie im Lösungsskript: waehlen = rec(pv01, "1:90=1; 91=0; else=NA"), pflicht/interesse = rec(…, "rev").
const sav = fixtureSav();
const col = (name: string) => validValues(sav.byName.get(name)!);
const rev = (x: Float64Array) => {
  const v = [...x].filter(Number.isFinite);
  const lo = Math.min(...v), hi = Math.max(...v);
  return Float64Array.from(x, a => hi + lo - a);
};
const waehlen = Float64Array.from(col('pv01'), v => (v >= 1 && v <= 90 ? 1 : v === 91 ? 0 : NaN));
const pflicht = rev(col('pe09')), interesse = rev(col('pa02a')), w = col('wghtpew');
const fitOf = (weights: Float64Array | null) => {
  const r = logistic(waehlen, [pflicht, interesse], ['pflicht', 'interesse'], weights);
  assert.ok(r.ok);
  return r as LogitFit;
};

// Referenz: mariposa 0.7.3 (R 4.5.3), logistic_regression(waehlen ~ pflicht + interesse, weights = wghtpew) auf der Testdatei;
// coef_table, model_summary, omnibus_test, classification, marginal_effects()$results, predict(type = "response").
test('weighted model on the fixture equals mariposa logistic_regression()', () => {
  const m = fitOf(w);
  assert.deepEqual(m.terms, ['(Intercept)', 'pflicht', 'interesse']);
  closeAll(m.coef, [-3.6688974893339781, 0.96119292394665212, 0.88238632256631933]);
  closeAll(m.se, [2.2025781063332537, 0.63568666257201634, 0.60312877156451428]);
  closeAll(m.wald, [2.7746519864815054, 2.2863090260668555, 2.1404123218127844]);
  closeAll(m.p, [0.095767469848173442, 0.13051998043962715, 0.14346332768761544]);
  closeAll(m.expB, [0.025504573515925513, 2.6148138877370535, 2.4166597607321609]);
  closeAll(m.ciLower, [0.00034023593624374598, 0.75221729538219317, 0.74102245704630221]);
  closeAll(m.ciUpper, [1.9118593920756244, 9.0894635226761604, 7.8813325339978233]);
  assert.equal(m.n, 28);
  assert.equal(m.cases, 27);
  assert.equal(m.iterations, 5);
  close(m.minus2LL, 19.355641471398691);
  close(m.minus2LLNull, 27.396230433523801);
  close(m.coxSnell, 0.25132440657144706);
  close(m.nagelkerke, 0.40082502591539559);
  close(m.mcfadden, 0.29349252926001546);
  close(m.omnibus.chi2, 8.0405889621251099);
  assert.equal(m.omnibus.df, 2);
  close(m.omnibus.p, 0.017947678909667503);
  const c = m.classification;
  assert.deepEqual([c.n0, c.n1, c.correct0, c.correct1].map(Math.round), [5, 22, 2, 21]);
  closeAll([c.pct0, c.pct1, c.overall], [44.799866947555159, 94.545210685145861, 84.854691870448434]);
});

test('average marginal effects equal mariposa marginal_effects() (weighted)', () => {
  const [a, b] = averageMarginalEffects(fitOf(w));
  assert.equal(a.term, 'pflicht');
  closeAll([a.ame, a.se, a.z, a.p, a.ciLower, a.ciUpper],
    [0.10320337280240116, 0.059516447456849732, 1.7340311327759452, 0.082912559375042175, -0.013446720700794765, 0.2198534663055971]);
  assert.equal(b.term, 'interesse');
  closeAll([b.ame, b.se, b.z, b.p, b.ciLower, b.ciUpper],
    [0.094741900752224273, 0.056261307378884559, 1.6839619476703074, 0.092189022962590683, -0.015528235433527021, 0.20501203693797557]);
});

test('predicted probabilities equal predict(type = "response") for four profiles', () => {
  const m = fitOf(w);
  const profiles = [[2, 2], [3, 2], [3, 4], [4, 4]];
  closeAll(profiles.map(x => predictProb(m, x)), [0.50456512406488796, 0.72699985021193736, 0.93958645900556148, 0.97600025158776404]);
  close(logitOf(m, [2, 2]), m.coef[0] + 2 * m.coef[1] + 2 * m.coef[2], 1e-15);
});

test('unweighted model, AME and predictions equal mariposa without weights', () => {
  const m = fitOf(null);
  closeAll(m.coef, [-4.0482625472483882, 1.2050119060593458, 0.79559108421089897]);
  closeAll(m.se, [2.426646436124233, 0.67833063946049554, 0.63058914046355186]);
  closeAll(m.p, [0.095265321542788411, 0.075660854070591768, 0.20707002046311568]);
  closeAll(m.expB, [0.017452671504314551, 3.3367988059555218, 2.2157503048307827]);
  assert.equal(m.n, 27);
  close(m.minus2LL, 17.748643473432484);
  close(m.minus2LLNull, 25.874943692126859);
  closeAll([m.coxSnell, m.nagelkerke, m.mcfadden], [0.25990304579768275, 0.42160047713428572, 0.31406059527646502]);
  closeAll([m.classification.pct0, m.classification.pct1, m.classification.overall], [40, 95.454545454545453, 85.18518518518519]);
  const [a, b] = averageMarginalEffects(m);
  closeAll([a.ame, a.se, a.p], [0.12112360372902418, 0.055058044074196476, 0.027812170103313747]);
  closeAll([b.ame, b.se, b.p], [0.0799700473724239, 0.057094047739395179, 0.16131210951255293]);
  closeAll([[2, 2], [3, 2], [3, 4], [4, 4]].map(x => predictProb(m, x)), [0.48823802864075971, 0.76096099084970958, 0.93986462101823642, 0.98118579035458264]);
});

// Referenz: R 4.5.3, glm(y ~ x + x2, family = binomial(), weights = w) auf erfundenen Daten.
test('small weighted glm with overlap equals R glm()', () => {
  const r = logistic([0, 1, 0, 1, 0, 1, 1, 1, 0, 1], [[1, 2, 3, 3, 3, 4, 5, 6, 5, 2], [1, 0, 1, 0, 1, 0, 1, 0, 0, 1]], ['x', 'x2'],
    [1.2, 0.55, 1.2, 1.2, 0.55, 0.55, 1.2, 1.2, 0.55, 1.2]);
  assert.ok(r.ok);
  const m = r as LogitFit;
  closeAll(m.coef, [0.42618260594192164, 0.36699324370431152, -1.6602148918510267]);
  closeAll(m.se, [2.5023878807426092, 0.55975067317677518, 1.7823033705059219]);
  closeAll([m.minus2LL, m.minus2LLNull], [10.11921647565438, 12.41156363816269]);
  assert.equal(m.iterations, 4);
});

test('non-estimable models give a reason instead of numbers', () => {
  // vollständige Trennung: R warnt „fitted probabilities numerically 0 or 1 occurred“
  assert.deepEqual(logistic([0, 0, 0, 1, 1, 1], [[1, 2, 3, 4, 5, 6], [2, 1, 2, 1, 2, 1]], ['x', 'x2']), { ok: false, problem: 'separation' });
  // quasi-vollständige Trennung: ebenso
  assert.deepEqual(logistic([0, 0, 0, 1, 0, 1, 1, 1], [[1, 2, 3, 3, 3, 4, 5, 6], [1, 0, 1, 0, 1, 0, 1, 0]], ['x', 'x2']), { ok: false, problem: 'separation' });
  // vollständige Trennung, bei der R ohne Warnung auf riesige Koeffizienten konvergiert (B = 16,4; kleinstes p = 2e−11)
  assert.deepEqual(logistic([1, 1, 1, 0, 0, 0, 1, 1], [[4, 4, 4, 1, 1, 1, 4, 4], [5, 4, 3, 5, 4, 3, 2, 1]], ['x', 'x2']), { ok: false, problem: 'separation' });
  // kollinear: x2 = 2·x (R setzt den Koeffizienten auf NA)
  assert.deepEqual(logistic([0, 1, 0, 1, 0, 1], [[1, 2, 3, 4, 5, 6], [2, 4, 6, 8, 10, 12]], ['x', 'x2']), { ok: false, problem: 'collinear' });
  // keine Konvergenz (R mit glm.control(maxit = 2): „algorithm did not converge“)
  assert.deepEqual(logistic(waehlen, [pflicht, interesse], ['pflicht', 'interesse'], w, { maxit: 2 }), { ok: false, problem: 'no-convergence' });
  assert.deepEqual(logistic([1, 1, 1, 1], [[1, 2, 3, 4]], ['x']), { ok: false, problem: 'one-outcome' });
  assert.deepEqual(logistic([0, 1, 2, 1], [[1, 2, 3, 4]], ['x']), { ok: false, problem: 'not-binary' });
  assert.deepEqual(logistic([0, 1, NaN, 1], [[1, 2, 3, NaN], [1, 1, 1, 1]], ['x', 'x2']), { ok: false, problem: 'too-few' });
  assert.deepEqual(logistic([0, 1, 0, 1], [[1, 2, 3, 4]], ['x'], [1, -1, 1, 1]), { ok: false, problem: 'invalid-weight' });
  for (const text of Object.values(LOGIT_PROBLEMS)) assert.doesNotMatch(text, /NaN|undefined/);
});

test('missing values drop out listwise and the link is bounded like R', () => {
  const full = logistic([0, 1, 0, 1, 0, 1, 1, 1, 0, 1], [[1, 2, 3, 3, 3, 4, 5, 6, 5, 2]], ['x']);
  const withNa = logistic([0, 1, 0, 1, 0, 1, 1, 1, 0, 1, NaN, 1], [[1, 2, 3, 3, 3, 4, 5, 6, 5, 2, 4, NaN]], ['x']);
  assert.ok(full.ok && withNa.ok);
  assert.deepEqual((withNa as LogitFit).coef, (full as LogitFit).coef);
  assert.equal(linkinv(0), 0.5);
  assert.equal(linkinv(-40), 2.220446049250313e-16 / (1 + 2.220446049250313e-16));
  assert.ok(linkinv(40) < 1);
});
