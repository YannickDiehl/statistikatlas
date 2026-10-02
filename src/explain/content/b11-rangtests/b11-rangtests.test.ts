import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { applyOp } from '../../sample';
import { close } from '../../format';
import { txt, type Ctx, type SampleCtx } from '../../types';
import { mannWhitney, midRanks } from './rank';
import { mannWhitneyTabs, mannWhitneyWorkshop as mwW, mwSample, MW_START, MW_TIES } from './mann-whitney';
import { wilcoxonTabs, wilcoxonWorkshop as wxW, wxSample, WX_START, WX_TIES } from './wilcoxon';
import { kruskalWallisTabs, kruskalWallisWorkshop as kwW, kwMeanRank, kwSample, KW_EVEN, KW_START, KW_TIES } from './kruskal-wallis';

/*
 * Referenzwerte des Bereichs B11, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas, Knopf „SPSS-Datei (.sav)“, oder writeSav(createSurvey())):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 */

const rows = createSurvey();
const ctx = (data = rows, columns: Record<string, string[]> = {}): SampleCtx => ({ rows: data, columns });
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol;
const at = <D, S>(w: { compute: (d: D) => S; names: readonly string[] }, data: D, who = 0): Ctx<S> => ({ s: w.compute(data), who, names: w.names });

/*
 * Mann–Whitney-U, Werkstatt (acht Lernzeiten, A bis D ohne, E bis H mit Weiterbildung):
 *   ohne <- c(2, 4, 5, 9); mit <- c(6, 7, 10, 30)
 *   rank(c(ohne, mit))                                                       # 1 2 3 6 4 5 7 8
 *   mw <- tibble(lernzeit = c(ohne, mit), weiterbildung = rep(0:1, each = 4))
 *   mw %>% mann_whitney(lernzeit, group = weiterbildung)                     # U = 2, W = 12, Z = -1.732051, p = 0.083265, r = 0.612372
 *   wilcox.test(ohne, mit)$p.value                                           # 0.1142857 (exakt, 4 von 70 Aufteilungen, zweiseitig)
 *   mean(ohne); mean(mit); mean(c(6, 7, 10, 12))                              # 5, 13.25, 8.75
 *   mw2 <- tibble(lernzeit = c(3, 5, 5, 8, 5, 6, 9, 12), weiterbildung = rep(0:1, each = 4))
 *   rank(mw2$lernzeit)                                                       # 1 3 3 6 3 5 7 8
 *   mw2 %>% mann_whitney(lernzeit, group = weiterbildung)                    # U = 3, W = 13, Z = -1.479020, p = 0.139135, r = 0.522913
 *   tibble(lernzeit = 1:8, weiterbildung = rep(0:1, each = 4)) %>% mann_whitney(lernzeit, group = weiterbildung)   # U = 0
 *   mw %>% mutate(lernzeit = lernzeit / 2) %>% mann_whitney(lernzeit, group = weiterbildung)                       # U = 2
 * Mann–Whitney-U, Lehrdatensatz:
 *   atlas %>% mann_whitney(finanzlage, group = weiterbildung)                # U = 4696, W = 8099, Z = -0.364193, p = 0.715714, r = 0.025752
 *                                                                            # rank mean Nein 101.7034 (n = 118), Ja 98.76829 (n = 82)
 *   rk <- rank(atlas$finanzlage); w <- as.numeric(atlas$weiterbildung)
 *   sum(rk[w == 0]) - 118 * 119 / 2; sum(rk[w == 1]) - 82 * 83 / 2          # 4980, 4696 (von 118 · 82 = 9676 Paaren)
 *   atlas %>% mutate(finanzlage = 6 - finanzlage) %>% mann_whitney(finanzlage, group = weiterbildung)   # U = 4696, Z = -0.364, p = 0.716
 *   atlas %>% mutate(finanzlage = 3) %>% mann_whitney(finanzlage, group = weiterbildung)
 *     # Warnung: Mann-Whitney test not computed for `finanzlage`. ✖ all values of `finanzlage` are identical.
 *   atlas %>% mann_whitney(finanzlage, group = schulabschluss)
 *     # not computed (`schulabschluss` has 5 groups with valid values; the Mann-Whitney test needs exactly 2)
 *   atlas %>% mann_whitney(finanzlage, group = weiterbildung, alternative = "kleiner")
 *     # Fehler: 'arg' sollte eines von '“two.sided”, “less”, “greater”' sein
 */
test('B11 Mann–Whitney-U: Werkstatt wie in R', () => {
  assert.deepEqual(midRanks(MW_START), [1, 2, 3, 6, 4, 5, 7, 8]);
  assert.deepEqual(midRanks(MW_TIES), [1, 3, 3, 6, 3, 5, 7, 8]);
  const s = mwW.compute(MW_START);
  assert.deepEqual([s.R1, s.R2, s.U1, s.U2, s.U], [12, 24, 2, 14, 2]);
  assert.ok(near(s.z, -1.732051) && near(s.p, 0.083265) && near(s.r, 0.612372), `z ${s.z}, p ${s.p}, r ${s.r}`);
  assert.ok(near(s.exact!, 0.1142857), `exakt ${s.exact}`);
  const t = mwW.compute(MW_TIES);
  assert.deepEqual([t.R1, t.R2, t.U], [13, 23, 3]);
  assert.ok(near(t.z, -1.479020) && near(t.p, 0.139135) && near(t.r, 0.522913) && t.exact === null, `z ${t.z}, p ${t.p}`);
  assert.equal(mwW.compute([1, 2, 3, 4, 5, 6, 7, 8]).U, 0);
  for (const k of [0, 1]) assert.equal(mwW.compute(mwW.think[k].tryIt!.apply(MW_START)).U, 2, `Denkfrage ${k + 1}: U bleibt 2`);
  assert.deepEqual(mwW.think[2].tryIt!.apply(MW_START), [1, 2, 3, 4, 5, 6, 7, 8]);
  // Texte mit diesen Zahlen
  const c = at(mwW, MW_START, 5), v = mwW.variants.mann_whitney;
  assert.equal(v.interpret(c).kurz, 'In 14 von 16 Paaren aus je einer Person ohne und einer mit Weiterbildung lernt die Person mit Weiterbildung länger. Gäbe es keinen Unterschied, wären es im Schnitt 8 von 16.');
  assert.match(v.interpret(c).fachlich, /^U = 2, z ≈ −1,73, p ≈ 0,08 .*in etwa 8 von 100 Stichproben.*nicht signifikant; der Effekt r = \|z\| \/ √8 ≈ 0,61 ist nach der Faustregel groß\.$/);
  assert.match(v.genau.paragraphs(c)[0], /p ≈ 0,11 statt 0,08/);
  assert.match(v.genau.paragraphs(c)[2], /ohne Weiterbildung 5 h, mit 13,25 h/);
  assert.match(mwW.think[0].explain as string, /um 4,5 Stunden/);
  assert.equal(txt(mwW.steps[0].rechnung, c), 'Person F lernt 7 h. 4 Personen lernen weniger, also bekommt F Rang 5.');
  assert.equal(txt(mwW.steps[1].rechnung, c), 'Ohne Weiterbildung: R₁ = 1 + 2 + 3 + 6 = 12. Mit Weiterbildung: R₂ = 4 + 5 + 7 + 8 = 24.');
  assert.equal(txt(mwW.steps[4].rechnung, c), 'z = (2 − 8) / 3,46 ≈ −1,73');
  const tie = at(mwW, MW_TIES, 2);
  assert.equal(txt(mwW.steps[0].rechnung, tie), 'Person C lernt 5 h, genau wie B und E. Sie teilen sich die Plätze 2 bis 4 und bekommen alle den mittleren Rang 3.');
  assert.match(v.interpret(tie).kurz, /^In 13 von 16 Paaren .* lernt die Person mit Weiterbildung länger, ein Gleichstand zählt halb\./);
  assert.match(mwW.steps[0].check.diagnose(c, 2)!, /eigenen Gruppe/);
  assert.match(mwW.steps[0].check.diagnose(c, 4)!, /von oben gezählt/);
  assert.match(mwW.steps[2].check.diagnose(c, 6)!, /6 abgezogen/);
  assert.match(mwW.steps[3].check.diagnose(c, 14)!, /größere/);
  assert.match(mwW.steps[4].check.diagnose(c, 1.73)!, /Vorzeichen/);
});

test('B11 Mann–Whitney-U: 200 Befragte und In R wie in R', () => {
  const columns = { x: ['finanzlage'], group: ['weiterbildung'] };
  const m = mwSample(ctx(rows, columns))!, t = m.test;
  assert.deepEqual([t.U, t.U1, t.U2, t.R2, t.n1, t.n2], [4696, 4980, 4696, 8099, 118, 82]);
  assert.ok(near(t.mean1, 101.7034, 1e-4) && near(t.mean2, 98.76829, 1e-5) && near(t.z, -0.364193) && near(t.p, 0.715714) && near(t.r, 0.025752), `${t.z} ${t.p}`);
  const s = mannWhitneyTabs.sample!;
  assert.equal(s.kind, 'analysis');
  if (s.kind !== 'analysis') return;
  const r = s.result(ctx(rows, columns));
  assert.match(r.kurz, /auf Rang 101,7, die mit auf Rang 98,77\..*nicht überraschend \(p ≈ 0,72\)\.$/);
  assert.equal(r.fachlich, 'Mann–Whitney-U, zweiseitig: U = 4.696, z ≈ −0,36, p ≈ 0,72, r ≈ 0,03. Bei α = 0,05 ist das nicht signifikant; der Effekt ist nach der Faustregel vernachlässigbar.');
  assert.equal(r.zusatz, 'In 4.980 von 9.676 Paaren aus je einer Person ohne und einer mit Weiterbildung kommt die Person ohne Weiterbildung leichter aus. Gleichstände zählen halb.');
  const rev = mwSample(ctx(applyOp(rows, 'finanzlage', 'reverse'), columns))!.test;
  assert.ok(rev.U === 4696 && near(rev.z, -0.364193) && near(rev.p, 0.715714), 'umgepolt wie in R');
  const flat = applyOp(rows, 'finanzlage', 'constant', 3);
  assert.match(s.result(ctx(flat, columns)).fachlich, /all values of `finanzlage` are identical/);
  assert.equal(s.think[1].expect.measure!(ctx(flat, columns)), 0);
  const map = Object.fromEntries(mannWhitneyTabs.r!.outputMap.map(o => [o.match, o.explain]));
  assert.match(map.p, /in etwa 72 von 100/);
  assert.match(map.r, /0,36 \/ √200/);
  assert.ok(close(Math.abs(t.z) / Math.sqrt(200), 0.026, 0.001));
  assert.ok(Number.isNaN(mannWhitney([1, 1], [1, 1]).z), 'alle gleich: z nicht definiert');
});

/*
 * Kruskal–Wallis, Werkstatt (neun Lernzeiten; je drei mit Hauptschulabschluss, Mittlerem Abschluss, Abitur):
 *   kw <- tibble(lernzeit = c(2, 5, 7, 4, 8, 10, 9, 12, 25), abschluss = rep(1:3, each = 3))
 *   rank(kw$lernzeit); tapply(rank(kw$lernzeit), kw$abschluss, mean)          # 1 3 4 2 5 7 6 8 9; 2.666667 4.666667 7.666667
 *   kw %>% kruskal_wallis(lernzeit, group = abschluss)                       # H = 5.066667, df = 2, p = 0.079394, epsilon² = 0.633333
 *   tapply(kw$lernzeit, kw$abschluss, mean)                                  # 4.666667 7.333333 15.333333 (Stunden)
 *   kw %>% mutate(lernzeit = replace(lernzeit, 9, 13)) %>% kruskal_wallis(lernzeit, group = abschluss)   # H = 5.066667
 *   kw2 <- tibble(lernzeit = c(3, 5, 5, 5, 8, 10, 8, 12, 20), abschluss = rep(1:3, each = 3))
 *   rank(kw2$lernzeit); tapply(rank(kw2$lernzeit), kw2$abschluss, mean)      # 1 3 3 3 5.5 7 5.5 8 9; 2.333333 5.166667 7.5
 *   kw2 %>% kruskal_wallis(lernzeit, group = abschluss)                      # H = 5.588406, p = 0.061164, epsilon² = 0.698551
 *   12 / 90 * sum(3 * (m - 5)^2); 1 - (3^3 - 3 + 2^3 - 2) / (9^3 - 9)         # 5.355556 (ohne Korrektur), C = 0.958333
 *   tibble(lernzeit = c(1, 5, 9, 2, 6, 7, 3, 4, 8), abschluss = rep(1:3, each = 3)) %>% kruskal_wallis(lernzeit, group = abschluss)   # H = 0
 * Kruskal–Wallis, Lehrdatensatz:
 *   atlas %>% kruskal_wallis(finanzlage, group = schulabschluss) %>% summary()
 *     # Mean Rank 85.43 107.85 84.38 119.23 104.69; H = 11.585454, df = 4, p = 0.020715, epsilon² = 0.058218
 *   fl <- as.numeric(atlas$finanzlage); sa <- as.numeric(atlas$schulabschluss)
 *   tapply(rank(6 - fl), sa, mean)                                           # 115.571429 93.15 116.621622 81.768293 96.3125
 *   atlas %>% mutate(finanzlage = 6 - finanzlage) %>% kruskal_wallis(finanzlage, group = schulabschluss)        # H = 11.585454
 *   atlas %>% mutate(schulabschluss = 4 - schulabschluss) %>% kruskal_wallis(finanzlage, group = schulabschluss) # H = 11.585454
 *   tapply(rank(6 - fl), 4 - sa, mean)                                       # Code 3 (vorher Code 1): 93.15
 *   atlas %>% kruskal_wallis(finanzlage, group = weiterbildung)              # H = 0.132636, p = 0.715714 (= Z² und p von mann_whitney)
 *   atlas %>% kruskal_wallis(finanzlage)                                     # Fehler: `group` is required for Kruskal-Wallis test.
 */
test('B11 Kruskal–Wallis: Werkstatt wie in R', () => {
  const s = kwW.compute(KW_START);
  assert.deepEqual(s.rank, [1, 3, 4, 2, 5, 7, 6, 8, 9]);
  assert.ok(s.mean.every((m, j) => near(m, [2.666667, 4.666667, 7.666667][j])), `${s.mean}`);
  assert.ok(near(s.ss, 38) && near(s.H, 5.066667) && near(s.p, 0.079394) && near(s.eps2, 0.633333) && s.C === 1, `H ${s.H}`);
  assert.ok(s.meanValue.every((m, j) => near(m, [4.666667, 7.333333, 15.333333][j])));
  const t = kwW.compute(KW_TIES);
  assert.deepEqual(t.rank, [1, 3, 3, 3, 5.5, 7, 5.5, 8, 9]);
  assert.ok(near(t.Hraw, 5.355556) && near(t.C, 0.958333) && near(t.H, 5.588406) && near(t.p, 0.061164), `H ${t.H}`);
  assert.ok(near(kwW.compute(KW_EVEN).H, 0), 'gleichmäßig verteilt: H = 0');
  assert.ok(near(kwW.compute(kwW.think[0].tryIt!.apply(KW_START)).H, 5.066667), 'I auf 13: H bleibt');
  const c = at(kwW, KW_START, 8), v = kwW.variants.kruskal_wallis;
  assert.equal(txt(kwW.steps[1].rechnung, c), 'Hauptschulabschluss: (1 + 3 + 4) / 3 ≈ 2,67. Mittlerer Abschluss: (2 + 5 + 7) / 3 ≈ 4,67. Abitur: (6 + 8 + 9) / 3 ≈ 7,67.');
  assert.equal(txt(kwW.steps[2].rechnung, c), 'Die Mitte aller Ränge ist (9 + 1) / 2 = 5. Hauptschulabschluss: 2,67 − 5 = −2,33; Mittlerer Abschluss: 4,67 − 5 = −0,33; Abitur: 7,67 − 5 = +2,67.');
  assert.equal(txt(kwW.steps[3].rechnung, c), '3 · (−2,33)² + 3 · (−0,33)² + 3 · 2,67² ≈ 16,33 + 0,33 + 21,33 = 38, mit allen Nachkommastellen gerechnet.');
  assert.equal(txt(kwW.steps[4].rechnung, c), 'H = 12 / 90 · 38 = 456 / 90 ≈ 5,07.');
  assert.match(txt(kwW.steps[4].rechnung, at(kwW, KW_TIES)), /≈ 5,36\. Wegen der Gleichstände teilt R noch durch 0,958 und meldet H ≈ 5,59\./);
  assert.equal(v.interpret(c).kurz, 'Die Gruppe Abitur steht in der Reihe im Schnitt auf Rang 7,67, die Gruppe Hauptschulabschluss auf Rang 2,67. Gäbe es keinen Unterschied, stünde jede Gruppe im Schnitt bei Rang 5.');
  assert.match(v.interpret(c).fachlich, /^H ≈ 5,07 bei 2 Freiheitsgraden, p ≈ 0,08 .*in etwa 8 von 100 Stichproben.*nicht signifikant; ε² = H \/ \(N − 1\) ≈ 0,63 ist nach der Faustregel groß\.$/);
  assert.match(v.genau.paragraphs(at(kwW, KW_TIES))[1], /C ≈ 0,958, und H steigt von 5,36 auf 5,59/);
  assert.match(v.genau.paragraphs(c)[3], /H ≈ 0,13 und p ≈ 0,72/);
  assert.match(kwW.steps[1].check.diagnose(c, 23)!, /Rangsumme/);
  assert.match(kwW.steps[1].check.diagnose(c, 15.33)!, /mittlere Lernzeit/);
  assert.match(kwW.steps[2].check.diagnose(c, 3.17)!, /4,5 abgezogen/);
  assert.match(kwW.steps[3].check.diagnose(c, 12.67)!, /Gruppengröße/);
  assert.match(kwW.steps[4].check.diagnose(c, 38)!, /Summe aus Schritt 4/);
});

test('B11 Kruskal–Wallis: 200 Befragte und In R wie in R', () => {
  const columns = { x: ['finanzlage'], y: ['schulabschluss'], group: ['schulabschluss'] };
  const k = kwSample(ctx(rows, columns)), t = k.test;
  assert.ok(near(t.H, 11.585454) && near(t.p, 0.020715) && near(t.eps2, 0.058218) && t.df === 4, `H ${t.H}`);
  assert.ok(t.mean.every((m, j) => near(m, [85.428571, 107.85, 84.378378, 119.231707, 104.6875][j])), `${t.mean}`);
  const rev = kwSample(ctx(applyOp(rows, 'finanzlage', 'reverse'), columns)).test;
  assert.ok(near(rev.H, 11.585454) && rev.mean.every((m, j) => near(m, [115.571429, 93.15, 116.621622, 81.768293, 96.3125][j])), 'umgepolt wie in R');
  assert.ok(near(kwSample(ctx(applyOp(rows, 'schulabschluss', 'reverse'), columns)).test.H, 11.585454), 'Abschlüsse andersherum wie in R');
  assert.ok(near(kwMeanRank(ctx(applyOp(applyOp(rows, 'schulabschluss', 'reverse'), 'finanzlage', 'reverse'), columns), 3)!, 93.15), 'Code 3 nach beiden Änderungen');
  assert.ok(near(kwSample(ctx(rows, { x: ['finanzlage'], group: ['weiterbildung'] })).test.H, 0.132636), 'zwei Gruppen: H = Z²');
  const s = kruskalWallisTabs.sample!;
  if (s.kind !== 'analysis') return assert.fail('Auswertung erwartet');
  const r = s.result(ctx(rows, columns));
  assert.match(r.kurz, /^Im Schnitt der Ränge liegt die Gruppe Fachhochschulreife am höchsten \(119,23\), die Gruppe Mittlerer Abschluss am niedrigsten \(84,38\)\..*in etwa 2 von 100 Stichproben vor \(p ≈ 0,02\)\.$/);
  assert.equal(r.fachlich, 'Kruskal–Wallis: H ≈ 11,59 bei 4 Freiheitsgraden, p ≈ 0,02, ε² ≈ 0,058. Bei α = 0,05 ist das signifikant; der Effekt ist nach der Faustregel klein.');
  assert.match(s.think[0].explain, /von 119,23 auf 81,77/);
  const map = Object.fromEntries(kruskalWallisTabs.r!.outputMap.map(o => [o.match, o.explain]));
  assert.match(map['.021'], /in etwa 2 von 100/);
  assert.match(map['Epsilon-squared'], /0,058/);
});

/*
 * Wilcoxon, verbunden, Werkstatt (sechs Personen, Wissenstest zweimal):
 *   wx <- tibble(t1 = c(8, 11, 9, 12, 7, 10), t2 = c(11, 12, 7, 17, 11, 16))
 *   wx$t2 - wx$t1; rank(abs(wx$t2 - wx$t1))                                  # 3 1 -2 5 4 6; 3 1 2 5 4 6
 *   wx %>% wilcoxon_test(t1, t2)                                             # V = W+ = 19, W- = 2, Z = -1.782084, p = 0.074735, r = 0.727533
 *   wilcox.test(wx$t2, wx$t1, paired = TRUE)$p.value                         # 0.09375 (exakt, 6 von 64 Vorzeichenmustern)
 *   wx2 <- tibble(t1 = c(8, 11, 9, 12, 7, 10), t2 = c(11, 11, 7, 14, 9, 13))
 *   d2 <- wx2$t2 - wx2$t1; rank(abs(d2[d2 != 0])); rank(abs(d2))             # 3 0 -2 2 2 3; 4.5 2 2 2 4.5; mit der Null 5.5 1 3 3 3 5.5
 *   wx2 %>% wilcoxon_test(t1, t2)                                            # W+ = 13, W- = 2, Z = -1.518144, p = 0.128978, r = 0.678935
 *   wx %>% mutate(t2 = replace(t2, 4, 20)) %>% wilcoxon_test(t1, t2)         # W+ = 19
 *   wx %>% mutate(t2 = t2 + 1) %>% wilcoxon_test(t1, t2); wx2 …              # W+ = 20; 19.5
 *   wx %>% mutate(t2 = t1) %>% wilcoxon_test(t1, t2)                         # Z = 0, p = 1
 * Wilcoxon, verbunden, Lehrdatensatz:
 *   atlas %>% wilcoxon_test(wissenstest, wissenstest_t2) %>% summary()
 *     # 115 positiv, 53 negativ, 32 gleich; W+ = 10425.5, W- = 3770.5, Z = -5.358338, p = 8.39909e-08, r = 0.413405
 *   atlas %>% mutate(wissenstest = wissenstest + 1) %>% wilcoxon_test(wissenstest, wissenstest_t2)       # 68 / 85 / 47, Z = -1.8606, p = 0.062801
 *   atlas %>% mutate(wissenstest_t2 = wissenstest_t2 - 1) %>% wilcoxon_test(wissenstest, wissenstest_t2) # dasselbe
 *   atlas %>% wilcoxon_test(wissenstest, wissenstest_t2, wissenstest_t3)     # drittes Argument = Gewicht: [Weighted] … N = 2324
 */
test('B11 Wilcoxon, verbunden: Werkstatt wie in R', () => {
  const s = wxW.compute(WX_START);
  assert.deepEqual([s.d, s.rank, s.Wpos, s.Wneg, s.n], [[3, 1, -2, 5, 4, 6], [3, 1, 2, 5, 4, 6], 19, 2, 6]);
  assert.ok(near(s.z, -1.782084) && near(s.p, 0.074735) && near(s.r, 0.727533) && near(s.exact!, 0.09375), `z ${s.z}`);
  const t = wxW.compute(WX_TIES);
  assert.deepEqual([t.d, t.Wpos, t.Wneg, t.n, t.nZero, t.withZeros], [[3, 0, -2, 2, 2, 3], 13, 2, 5, 1, [5.5, 1, 3, 3, 3, 5.5]]);
  assert.ok(t.rank.every((r, i) => i === 1 ? Number.isNaN(r) : r === [4.5, 0, 2, 2, 2, 4.5][i]), `${t.rank}`);
  assert.ok(near(t.z, -1.518144) && near(t.p, 0.128978) && near(t.r, 0.678935) && t.exact === null, `z ${t.z}`);
  assert.equal(wxW.compute(wxW.think[0].tryIt!.apply(WX_START)).Wpos, 19);
  assert.equal(wxW.compute(wxW.think[1].tryIt!.apply(WX_START)).Wpos, 20);
  assert.equal(wxW.compute(wxW.think[1].tryIt!.apply(WX_TIES)).Wpos, 19.5);
  const same = wxW.compute(wxW.think[2].tryIt!.apply(WX_START));
  assert.deepEqual([same.z, same.p, same.n], [0, 1, 0]);
  const c = at(wxW, WX_START, 2), v = wxW.variants.wilcoxon_test;
  assert.equal(txt(wxW.steps[0].rechnung, c), 'Person C: 7 − 9 = −2, also 2 Aufgaben weniger als beim ersten Mal.');
  assert.equal(txt(wxW.steps[1].rechnung, c), 'Person C: |−2| = 2. Eine Veränderung ist kleiner, also Rang 2.');
  assert.equal(txt(wxW.steps[2].rechnung, c), 'W⁺ = 3 + 1 + 5 + 4 + 6 = 19. W⁻ = 2. Zusammen 21 = 6 · 7 / 2.');
  assert.equal(txt(wxW.steps[3].rechnung, c), 'Erwartung 6 · 7 / 4 = 10,5. z = (2 − 10,5) / 4,77 ≈ −1,78.');
  assert.equal(v.interpret(c).kurz, '5 von 6 Personen lösen beim zweiten Test mehr Aufgaben, 1 weniger. Die Ränge der Verbesserungen ergeben 19 von 21; ohne Veränderung wäre es etwa die Hälfte.');
  assert.match(v.interpret(c).fachlich, /z ≈ −1,78, p ≈ 0,07 .*in etwa 7 von 100 .*nicht signifikant; r = \|z\| \/ √n ≈ 0,73 ist nach der Faustregel groß\./);
  assert.match(v.genau.paragraphs(c)[0], /alle 64 Vorzeichenmuster durch und meldet hier p ≈ 0,09 statt 0,07/);
  const b = at(wxW, WX_TIES, 1);
  assert.equal(txt(wxW.steps[1].rechnung, b), 'Person B hat sich nicht verändert und fällt weg. Gerechnet wird mit den übrigen 5.');
  assert.equal(wxW.steps[1].check.answer(b), 'NA');
  assert.match(wxW.steps[1].check.diagnose(b, 1)!, /Tippe NA/);
  assert.match(wxW.steps[1].check.diagnose(at(wxW, WX_TIES, 2), -2)!, /kein Vorzeichen/);
  assert.match(wxW.steps[1].check.diagnose(at(wxW, WX_TIES, 0), 5.5)!, /Nullen zählen nicht mit/);
  assert.match(wxW.steps[2].check.diagnose(c, 2)!, /Verschlechterungen/);
  assert.match(wxW.steps[2].check.diagnose(at(wxW, WX_TIES), 10)!, /Summe der Differenzen/);
  assert.match(wxW.steps[3].check.diagnose(c, 1.78)!, /Vorzeichen/);
});

test('B11 Wilcoxon, verbunden: 200 Befragte und In R wie in R', () => {
  const columns = { x: ['wissenstest'], y: ['wissenstest_t2'] };
  const t = wxSample(ctx(rows, columns));
  assert.deepEqual([t.nPos, t.nNeg, t.nZero, t.n, t.Wpos, t.Wneg], [115, 53, 32, 168, 10425.5, 3770.5]);
  assert.ok(near(t.z, -5.358338) && near(t.p, 8.39909e-8, 1e-12) && near(t.r, 0.413405), `z ${t.z}`);
  for (const d of [applyOp(rows, 'wissenstest', 'shift', 1), applyOp(rows, 'wissenstest_t2', 'shift', -1)]) {
    const u = wxSample(ctx(d, columns));
    assert.ok(u.nPos === 68 && u.nNeg === 85 && u.nZero === 47 && near(u.z, -1.8606, 1e-4) && near(u.p, 0.062801), `verschoben ${u.nPos} ${u.p}`);
  }
  const s = wilcoxonTabs.sample!;
  if (s.kind !== 'analysis') return assert.fail('Auswertung erwartet');
  const r = s.result(ctx(rows, columns));
  assert.equal(r.kurz, '115 Befragte lösen beim zweiten Messzeitpunkt mehr Aufgaben, 53 weniger, 32 gleich viele. Die Ränge der Verbesserungen ergeben 10.425,5, die der Verschlechterungen 3.770,5. Gäbe es keine Veränderung, käme ein so ungleiches Verhältnis in weniger als 1 von 1.000 Stichproben vor (p < 0,001).');
  assert.equal(r.fachlich, 'Wilcoxon-Test für verbundene Stichproben, zweite minus erste Messung: V = W⁺ = 10.425,5, z ≈ −5,36, p < 0,001, r ≈ 0,41. Bei α = 0,05 ist das signifikant; der Effekt ist nach der Faustregel mittel.');
  assert.equal(r.zusatz, 'Die 32 Befragten mit gleich vielen Aufgaben fallen weg; gerechnet wird mit 168 Paaren.');
  assert.match(s.think[0].explain, /von unter 0,001 auf etwa 0,06/);
  assert.match(wxW.variants.wilcoxon_test.genau.paragraphs(at(wxW, WX_START))[2], /32 von 200 Befragten/);
  const map = Object.fromEntries(wilcoxonTabs.r!.outputMap.map(o => [o.match, o.explain]));
  assert.match(map.r, /168 Paaren .* 5,36 \/ √168 ≈ 0,41/);
  assert.ok(near(5.358338 / Math.sqrt(168), 0.413405), 'r = |Z| / √168');
});
