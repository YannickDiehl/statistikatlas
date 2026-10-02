import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { applyOp } from '../../sample';
import { close } from '../../format';
import { txt, type Ctx, type SampleCtx } from '../../types';
import { mannWhitney, midRanks } from './rank';
import { mannWhitneyTabs, mannWhitneyWorkshop as mwW, mwSample, MW_START, MW_TIES } from './mann-whitney';
import { wilcoxonTabs, wilcoxonWorkshop as wxW, wxSample, WX_START, WX_TIES } from './wilcoxon';
import { friedmanTabs, friedmanWorkshop as frW, frSample, FR_START, FR_TIES, FR_SAME_ORDER } from './friedman';
import { tukeyCard, tukeyCount, tukeyTabs } from './tukey';
import { hurdlesFor, scheffeCard, scheffeTabs } from './scheffe';
import { dunnCard, dunnSample, dunnTabs, DUNN_MIN_P } from './dunn';
import { bonferroniFor, pairwiseWilcoxonCard, pairwiseWilcoxonTabs, pwImproved, pwSample } from './pairwise-wilcoxon';
import { basePairs, hurdle40, tukeyHurdle } from './posthoc';
import { qt } from '../../../tasks/kit/dist';
import { qtukey } from '../../../tasks/kit/means';
import { qf } from './rank';
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

/*
 * Friedman, Werkstatt (fünf Personen, Wissenstest dreimal):
 *   m1 <- matrix(c(8,10,12, 11,10,14, 6,9,8, 12,15,16, 9,13,11), ncol = 3, byrow = TRUE)
 *   t(apply(m1, 1, rank)); colSums(t(apply(m1, 1, rank)))                   # Ränge 1 2 3 / 2 1 3 / 1 3 2 / 1 2 3 / 1 3 2; Summen 6 11 13
 *   as_tibble(m1, .name_repair = ~c("t1", "t2", "t3")) %>% friedman_test(t1, t2, t3)   # chi² = 5.2, p = 0.074274, W = 0.52
 *   rank(as.vector(t(m1)))                                                  # gemeinsam geordnet: 2.5 6.5 10.5 / 8.5 6.5 13 / …
 *   m2 <- matrix(c(8,10,10, 11,10,14, 9,9,8, 12,15,16, 9,13,11), ncol = 3, byrow = TRUE)
 *   colSums(t(apply(m2, 1, rank)))                                          # 7.5 11 11.5
 *   … %>% friedman_test(t1, t2, t3)                                         # chi² = 2.111111, p = 0.347999, W = 0.211111; ohne Korrektur 12 / 60 * 9.5 = 1.9
 *   m3 <- m1; m3[4, 3] <- 20 und pmin(m1 + 3, 20)                           # chi² = 5.2 (beide)
 *   matrix(c(8,10,12, 10,11,14, 6,8,9, 12,15,16, 9,11,13), …)               # chi² = 10, W = 1
 * Friedman, Lehrdatensatz:
 *   atlas %>% friedman_test(wissenstest, wissenstest_t2, wissenstest_t3) %>% summary()
 *     # Mean Rank 1.56 2.0475 2.3925; chi² = 78.083682, df = 2, p = 1.1075e-17, W = 0.195209
 *   atlas %>% mutate(wissenstest = wissenstest + 1) %>% friedman_test(…)    # chi² = 18.368499; Mean Rank 1.9275 1.85 2.2225
 *   atlas %>% mutate(wissenstest_t2 = wissenstest_t2 - 1) %>% friedman_test(…)   # chi² = 88.741477; Mean Rank 1.7575 1.7325 2.51
 *   atlas %>% mutate(wissenstest = wissenstest + 1, wissenstest_t2 = wissenstest_t2 - 1) %>% friedman_test(…)   # Mean Rank 2.13 1.53 2.34
 *   atlas %>% friedman_test(wissenstest, wissenstest_t2)                    # Fehler: Friedman test requires at least 3 related measurements.
 */
test('B11 Friedman: Werkstatt wie in R', () => {
  const s = frW.compute(FR_START);
  assert.deepEqual([s.ranks, s.R, s.dev, s.ss], [[[1, 2, 3], [2, 1, 3], [1, 3, 2], [1, 2, 3], [1, 3, 2]], [6, 11, 13], [-4, 1, 3], 26]);
  assert.ok(near(s.Q, 5.2) && near(s.p, 0.074274) && near(s.W, 0.52) && near(s.Qraw, 5.2), `Q ${s.Q}`);
  assert.deepEqual(s.global[0], [2.5, 6.5, 10.5]);
  const t = frW.compute(FR_TIES);
  assert.deepEqual(t.R, [7.5, 11, 11.5]);
  assert.ok(near(t.Qraw, 1.9) && near(t.Q, 2.111111) && near(t.p, 0.347999) && near(t.W, 0.211111), `Q ${t.Q}`);
  for (const k of [0, 1]) assert.ok(near(frW.compute(frW.think[k].tryIt!.apply(FR_START)).Q, 5.2), `Denkfrage ${k + 1}: Q bleibt`);
  const one = frW.compute(FR_SAME_ORDER);
  assert.ok(near(one.Q, 10) && near(one.W, 1), 'gleiche Reihenfolge: W = 1');
  const c = at(frW, FR_START, 1), v = frW.variants.friedman_test;
  assert.equal(txt(frW.steps[0].rechnung, c), 'Person B: 11, 10 und 14 Aufgaben. Ränge: 2, 1 und 3.');
  assert.equal(txt(frW.steps[1].rechnung, c), 'Test 1: R₁ = 1 + 2 + 1 + 1 + 1 = 6. Test 2: R₂ = 2 + 1 + 3 + 2 + 3 = 11. Test 3: R₃ = 3 + 3 + 2 + 3 + 2 = 13.');
  assert.equal(txt(frW.steps[2].rechnung, c), 'Test 1: 6 − 10 = −4; Test 2: 11 − 10 = +1; Test 3: 13 − 10 = +3.');
  assert.equal(txt(frW.steps[3].rechnung, c), '(−4)² + 1² + 3² = 16 + 1 + 9 = 26.');
  assert.equal(txt(frW.steps[4].rechnung, c), 'Q = 12 / (5 · 3 · 4) · 26 = 0,2 · 26 = 5,2.');
  assert.equal(txt(frW.steps[5].rechnung, c), 'W = 5,2 / (5 · 2) ≈ 0,52');
  assert.match(txt(frW.steps[4].rechnung, at(frW, FR_TIES)), /= 1,9\. Wegen der Gleichstände innerhalb der Personen korrigiert R und meldet Q ≈ 2,11\./);
  assert.equal(txt(frW.steps[0].rechnung, at(frW, FR_TIES)), 'Person A: 8, 10 und 10 Aufgaben. Ränge: 1; 2,5 und 2,5. Gleiche Ergebnisse teilen sich ihre Plätze.');
  assert.equal(v.interpret(c).kurz, 'Der dritte Test schneidet mit der Rangsumme 13 am besten ab, der erste mit 6 am schwächsten. Ohne Unterschied hätte jeder Test etwa 10.');
  assert.match(v.interpret(c).fachlich, /^Q ≈ 5,2 bei 2 Freiheitsgraden, p ≈ 0,07 .*in etwa 7 von 100 .*nicht signifikant; Kendalls W ≈ 0,52 ist nach der Faustregel stark\.$/);
  assert.match(v.genau.paragraphs(at(frW, FR_TIES))[1], /von 1,9 auf 2,11/);
  assert.match(frW.steps[0].check.diagnose(at(frW, FR_START, 0), 10.5)!, /allen 15 Werten/);
  assert.match(frW.steps[1].check.diagnose(c, 46)!, /gelösten Aufgaben/);
  assert.match(frW.steps[1].check.diagnose(c, 1.2)!, /mittlere Rang/);
  assert.match(frW.steps[2].check.diagnose(c, 4)!, /Seite/);
  assert.match(frW.steps[2].check.diagnose(c, 4)!, /^Fast!/);
  assert.match(frW.steps[3].check.diagnose(c, 8)!, /ohne Vorzeichen/);
  assert.match(frW.steps[5].check.diagnose(c, 5.2)!, /noch Q/);
});

test('B11 Friedman: 200 Befragte und In R wie in R', () => {
  const columns = { x: ['wissenstest'], y: ['wissenstest_t2'], z: ['wissenstest_t3'] };
  const f = frSample(ctx(rows, columns));
  assert.ok(near(f.Q, 78.083682) && near(f.W, 0.195209) && near(f.p, 1.1075e-17, 1e-20), `Q ${f.Q}`);
  assert.ok(f.meanRanks.every((m, j) => near(m, [1.56, 2.0475, 2.3925][j])) && near(f.R[0], 312) && near(f.R[2], 478.5));
  const x1 = frSample(ctx(applyOp(rows, 'wissenstest', 'shift', 1), columns)), y1 = frSample(ctx(applyOp(rows, 'wissenstest_t2', 'shift', -1), columns));
  assert.ok(near(x1.Q, 18.368499) && x1.meanRanks.every((m, j) => near(m, [1.9275, 1.85, 2.2225][j])), 'erster Test + 1');
  assert.ok(near(y1.Q, 88.741477) && y1.meanRanks.every((m, j) => near(m, [1.7575, 1.7325, 2.51][j])), 'zweiter Test − 1');
  const both = frSample(ctx(applyOp(applyOp(rows, 'wissenstest', 'shift', 1), 'wissenstest_t2', 'shift', -1), columns));
  assert.ok(both.meanRanks.every((m, j) => near(m, [2.13, 1.53, 2.34][j])), 'beide Änderungen');
  const s = friedmanTabs.sample!;
  if (s.kind !== 'analysis') return assert.fail('Auswertung erwartet');
  const r = s.result(ctx(rows, columns));
  assert.equal(r.kurz, 'Ordnet jede Person ihre drei Testergebnisse, liegt der erste Test im Schnitt auf Rang 1,56, der zweite auf 2,05, der dritte auf 2,39. Gäbe es keinen Unterschied zwischen den Zeitpunkten, käme ein so großes Q in weniger als 1 von 1.000 Stichproben vor (p < 0,001). Die Befragten sind sich in der Reihenfolge nach der Faustregel nur schwach einig (W ≈ 0,2).');
  assert.equal(r.fachlich, 'Friedman-Test: χ² = Q ≈ 78,08 bei 2 Freiheitsgraden, p < 0,001, Kendalls W ≈ 0,2. Bei α = 0,05 ist das signifikant; die Übereinstimmung ist nach der Faustregel schwach.');
  assert.equal(r.zusatz, 'Rangsummen: erster Test 312, zweiter 409,5, dritter 478,5; ohne Unterschied hätte jeder 400.');
  assert.match(s.think[0].explain, /von 78,08 auf 18,37/);
  assert.match(s.think[1].explain, /von 2,05 auf 1,73/);
  const map = Object.fromEntries(friedmanTabs.r!.outputMap.map(o => [o.match, o.explain]));
  assert.match(map["Kendall's W"], /78,08 \/ 400 ≈ 0,2/);
});

/*
 * Tukey und Scheffé, Lehrdatensatz (Lernzeit nach Schulabschluss):
 *   atlas %>% oneway_anova(lernzeit, group = schulabschluss) %>% summary()
 *     # Mittelwerte 5.883333 6.95 7.945946 8.707317 9.355 (n = 42, 40, 37, 41, 40); F = 8.638858, p = 1.937e-06; MSE = 9.086344, df = 195
 *   atlas %>% oneway_anova(lernzeit, group = schulabschluss) %>% tukey_test() %>% summary()
 *     # p (Tukey) .498 .023 <.001 <.001 .597 .070 .004 .799 .247 .870; ohne − Abitur −3.472, Intervall −5.305 bis −1.638
 *   atlas %>% oneway_anova(lernzeit, group = schulabschluss) %>% scheffe_test() %>% summary()
 *     # p (Scheffé) .634 .060 .002 <.001 .718 .147 .015 .871 .383 .919
 *   qtukey(0.95, 5, 195); qtukey(0.95, 10, 195)                             # 3.893996; 4.526526
 *   se <- function(i, j) sqrt(mse * (1 / n[i] + 1 / n[j]))                  # ohne–Abitur 0.665958, Haupt–FHR 0.669908, ohne–Mittlerer 0.679646
 *   qtukey(0.95, 5, 195) / sqrt(2) * se(1, 5); … se(2, 4); … se(1, 3)        # Hürden 1.833696, 1.844572, 1.871385
 *   1 - 0.95^10; qt(0.975, 195) * se(1, 5)                                  # 0.401263; 1.313405
 *   2 * pt(-abs(m[2] - m[4]) / se(2, 4), 195)                               # 0.009399 (ein t-Test für Haupt gegen FHR)
 *   for (al in c(.01, .05, .10)) qtukey(1 - al, 5, 195) * sqrt(mse / 40)    # 2.224553, 1.855924, 1.669930
 *   qf(0.95, 4, 195); sqrt(4 * qf(0.95, 4, 195))                            # 2.417963; S = 3.109960 (1.129469 mal 2.753471)
 *   sqrt(4 * qf(0.95, 4, 195)) * se(1, 3)                                   # 2.113671
 *   k Gruppen mit je 40, df = 39k: t, Tukey, Scheffé in Stunden
 *     # k = 2: 1.341892 1.341892 1.341892; k = 3: 1.334882 1.600089 1.671205; k = 5: 1.329326 1.855924 2.096208; k = 10: 1.325188 2.144876 2.790122
 *   atlas %>% oneway_anova(lernzeit, group = schulabschluss) %>% scheffe_test()   # direkt auf atlas: not available for objects of class <tbl_df/tbl/data.frame>
 */
test('B11 Tukey und Scheffé: Lehrdatensatz wie in R', () => {
  const r = basePairs();
  assert.ok(r.anova.groups.every((g, j) => near(g.mean, [5.883333, 6.95, 7.945946, 8.707317, 9.355][j])) && near(r.mse, 9.086344) && r.df === 195, 'Mittelwerte und MSE');
  assert.ok(near(r.anova.F, 8.638858) && near(r.anova.p, 1.937e-6, 1e-9), `F ${r.anova.F}`);
  const pT = [0.4981007, 0.02268198, 0.0002959011, 4.659976e-6, 0.5971051, 0.07007976, 0.004092882, 0.7990774, 0.2466722, 0.8697207];
  const pS = [0.6336146, 0.05997996, 0.001547187, 3.862793e-5, 0.717797, 0.1470042, 0.01463932, 0.8709408, 0.3826445, 0.9191521];
  r.pairs.forEach((p, k) => { assert.ok(near(p.pTukey, pT[k], 1e-6), `Tukey ${k}: ${p.pTukey}`); assert.ok(near(p.pScheffe, pS[k], 1e-6), `Scheffé ${k}: ${p.pScheffe}`); });
  assert.deepEqual([0.01, 0.05, 0.1].map(tukeyCount), [3, 4, 5]);
  assert.ok(near(qtukey(0.95, 5, 195), 3.893996, 1e-4) && near(qtukey(0.95, 10, 195), 4.526526, 1e-4), 'qtukey');
  const [ohneAbi, hauptFhr, ohneMittel] = [r.pairs[3], r.pairs[5], r.pairs[1]];
  assert.ok(near(ohneAbi.se, 0.665958) && near(hauptFhr.se, 0.669908) && near(ohneMittel.se, 0.679646), 'SE');
  assert.ok(near(tukeyHurdle(0.05, ohneAbi.se, 5, 195), 1.833696, 1e-4) && near(tukeyHurdle(0.05, hauptFhr.se, 5, 195), 1.844572, 1e-4) && near(tukeyHurdle(0.05, ohneMittel.se, 5, 195), 1.871385, 1e-4), 'Hürden');
  assert.ok(near(ohneAbi.diff, -3.471667) && near(ohneAbi.diff - 2.753471 * ohneAbi.se, -5.305363, 1e-4), 'Intervall');
  assert.ok(near(1 - 0.95 ** 10, 0.401263) && near(qt(0.975, 195) * ohneAbi.se, 1.313405), 'ohne Schutz');
  [[0.01, 2.224553], [0.05, 1.855924], [0.1, 1.66993]].forEach(([a, v]) => assert.ok(near(hurdle40(r, 'tukey', a), v, 1e-4), `HSD α ${a}`));
  assert.ok(near(qf(0.95, 4, 195), 2.417963) && near(Math.sqrt(4 * qf(0.95, 4, 195)) * ohneMittel.se, 2.113671), 'Scheffé-Hürde');
  [[2, 1.341892, 1.341892, 1.341892], [3, 1.334882, 1.600089, 1.671205], [5, 1.329326, 1.855924, 2.096208], [10, 1.325188, 2.144876, 2.790122]].forEach(([k, t, tu, sc]) => {
    const h = hurdlesFor(k);
    assert.ok(near(h.t, t) && near(h.tukey, tu, 1e-4) && near(h.scheffe, sc), `k = ${k}: ${h.t} ${h.tukey} ${h.scheffe}`);
  });
  // Texte mit diesen Zahlen
  assert.match(tukeyCard.stellDirVor.text, /5,88 Stunden gelernt, Befragte mit Abitur 9,36 .* 6,95, Mittlerer Abschluss mit 7,95 und Fachhochschulreife mit 8,71 .* 4 der 10 Paare/);
  assert.match(tukeyCard.bausteine[0].rechnung!, /≈ 40 %/);
  assert.match(tukeyCard.bausteine[1].rechnung!, /q ≈ 3,89\. .* ≈ 1,84 Stunden; mit allen Nachkommastellen rechnet R 1,83\./);
  assert.match(tukeyCard.bausteine[2].rechnung!, /−3,47 Stunden, im Betrag mehr als die Hürde von 1,83\. .* von −5,31 bis −1,64/);
  assert.match(tukeyCard.bausteine[2].acht, /−1,76 Stunden, knapp unter seiner Hürde von 1,84/);
  assert.match(tukeyCard.ausprobieren[0].explain, /von 3,89 auf 4,53/);
  assert.match(tukeyCard.ausprobieren[1].explain, /1,31 Stunden .* 1,83 Stunden/);
  assert.match(tukeyCard.check.diagnose[3]!, /etwa 0,01/);
  assert.equal(tukeyCard.regler!.describe(0.05), 'Bei α = 0,05 muss ein Paar mit je 40 Personen mindestens 1,86 Stunden auseinanderliegen. Das schaffen im Lehrdatensatz 4 der 10 Paare.');
  assert.match(tukeyCard.regler!.describe(0.1), /1,67 Stunden .* 5 der 10 Paare/);
  assert.match(scheffeCard.stellDirVor.text, /Tukey 4 der 10 .* Scheffé nur 3\. .* −2,06 Stunden\. Tukey meldet dafür p ≈ 0,023, Scheffé p ≈ 0,06/);
  assert.match(scheffeCard.bausteine[1].rechnung!, /√\(\(5 − 1\) · 2,42\) ≈ 3,11 .* 3,89 \/ √2 ≈ 2,75\. .* 3,11 · 0,68 ≈ 2,11 Stunden statt 1,87\./);
  assert.match(scheffeCard.bausteine[1].was, /etwa 13 % höher/);
  assert.match(scheffeCard.ausprobieren[1].explain, /hier 1,34 Stunden/);
  assert.match(scheffeCard.regler!.describe(5), /Tukey mindestens 1,86 Stunden Unterschied, bei Scheffé 2,1 Stunden\. Ein einzelner t-Test bräuchte 1,33 Stunden\./);
  // Reiter
  const columns = { x: ['lernzeit'], group: ['schulabschluss'] };
  const t = tukeyTabs.sample!, s = scheffeTabs.sample!;
  if (t.kind !== 'analysis' || s.kind !== 'analysis') return assert.fail('Auswertungen erwartet');
  const rt = t.result(ctx(rows, columns)), rs = s.result(ctx(rows, columns));
  assert.equal(rt.kurz, 'Bei α = 0,05 meldet Tukey 4 der 10 Paare als auffällig. Am weitesten auseinander liegen Ohne Schulabschluss und Abitur / fachgebundene Hochschulreife: 5,88 gegen 9,36 Stunden.');
  assert.match(rt.fachlich, /MSE ≈ 9,09 bei 195 Freiheitsgraden\. Auffällig .*Ohne Schulabschluss − Mittlerer Abschluss −2,06 h; Ohne Schulabschluss − Fachhochschulreife −2,82 h; Ohne Schulabschluss − Abitur \/ fachgebundene Hochschulreife −3,47 h; Haupt-\/Volksschulabschluss − Abitur \/ fachgebundene Hochschulreife −2,41 h\./);
  assert.equal(rs.kurz, 'Bei α = 0,05 meldet Scheffé 3 der 10 Paare als auffällig, Tukey 4. Für zwei Gruppen mit je 40 Personen liegt die Scheffé-Hürde bei 2,1 Stunden, die von Tukey bei 1,86.');
  assert.equal(rs.zusatz, 'Ein Paar fällt nur bei Tukey auf, keines nur bei Scheffé.');
});

/*
 * Dunn-Vergleiche, Lehrdatensatz (finanzielle Lage nach Schulabschluss):
 *   atlas %>% kruskal_wallis(finanzlage, group = schulabschluss) %>% dunn_test(p_adjust = "holm") %>% summary()
 *     # z: −1.810 0.083 −2.747 −1.555 1.836 −0.914 0.252 −2.742 −1.588 1.167
 *     # p (unadj) kleinstes 0.006019911 (ohne gegen FHR), 0.006106845 (Mittlerer gegen FHR); p (adj) beide 0.06019911
 *   rk <- rank(fl); tt <- table(fl); T <- sum(tt^3 - tt)
 *   sqrt((200 * 201 / 12 - T / (12 * 199)) * (1/42 + 1/41))                  # SE ohne gegen FHR 12.306841
 *   0.006019911 * 1:10                                                      # … 5: 0.030100, 8: 0.048159, 9: 0.054179, 10: 0.060199
 *   atlas %>% mutate(finanzlage = 6 - finanzlage) %>% kruskal_wallis(…) %>% dunn_test(p_adjust = "holm")   # z gespiegelt, kleinstes p (adj) 0.060199
 *   atlas %>% mutate(schulabschluss = 4 - schulabschluss) %>% kruskal_wallis(…) %>% dunn_test(…)       # kleinstes p (adj) 0.060199
 *   dunn_test.kruskal_wallis(x, p_adjust = "bonferroni", …)                 # Voreinstellung im Quellstand 0.7.4
 *   … %>% dunn_test(p_adjust = "Holm")                                      # Fehler: `p_adjust` must be one of "bonferroni", "holm", … ✖ Got "Holm".
 */
test('B11 Dunn-Vergleiche: Lehrdatensatz wie in R', () => {
  const columns = { x: ['finanzlage'], y: ['schulabschluss'], group: ['schulabschluss'] };
  const d = dunnSample(ctx(rows, columns));
  const z = [-1.8104515, 0.08309158, -2.74669488, -1.55509074, 1.83571176, -0.91361396, 0.25230243, -2.74198866, -1.58837314, 1.16746904];
  d.pairs.forEach((p, k) => assert.ok(near(p.z, z[k]), `z ${k}: ${p.z}`));
  assert.ok(near(d.pairs[2].p, DUNN_MIN_P, 1e-9) && near(d.pairs[2].pAdj, 0.06019911) && near(d.pairs[7].pAdj, 0.06019911), 'Holm');
  assert.equal(d.pairs.filter(p => p.pAdj < 0.05).length, 0);
  assert.equal(d.pairs.filter(p => p.p < 0.05).length, 2);
  assert.ok(near((d.kw.mean[0] - d.kw.mean[3]) / d.pairs[2].z, 12.306841, 1e-5), 'SE');
  const rev = dunnSample(ctx(applyOp(rows, 'finanzlage', 'reverse'), columns));
  assert.ok(rev.pairs.every((p, k) => near(p.z, -z[k])), 'umgepolt: z gespiegelt');
  assert.ok(near(Math.min(...dunnSample(ctx(applyOp(rows, 'schulabschluss', 'reverse'), columns)).pairs.map(p => p.pAdj)), 0.060199), 'andersherum nummeriert');
  assert.match(dunnCard.bausteine[1].rechnung!, /\(85,43 − 119,23\) \/ 12,31 ≈ −2,75/);
  assert.match(dunnCard.ausprobieren[1].explain, /0,006 · 5 ≈ 0,03/);
  assert.match(dunnCard.regler!.describe(8), /8 · 0,006 ≈ 0,048\. Er liegt noch unter α = 0,05\./);
  assert.match(dunnCard.regler!.describe(9), /9 · 0,006 ≈ 0,054\. Er liegt über α = 0,05/);
  assert.match(dunnCard.regler!.describe(10), /≈ 0,06\. /);
  const s = dunnTabs.sample!;
  if (s.kind !== 'analysis') return assert.fail('Auswertung erwartet');
  const r = s.result(ctx(rows, columns));
  assert.equal(r.kurz, 'Am deutlichsten unterscheiden sich Ohne Schulabschluss und Fachhochschulreife: z ≈ −2,75, nach der Holm-Korrektur p ≈ 0,06. Bei α = 0,05 ist nach der Korrektur kein Paar auffällig; ohne Korrektur wären es 2.');
  assert.equal(r.zusatz, 'Kruskal–Wallis über alle Gruppen: H ≈ 11,59, p ≈ 0,02.');
});

/*
 * Paarweiser Wilcoxon, Lehrdatensatz (Wissenstest zu drei Zeitpunkten):
 *   atlas %>% friedman_test(wissenstest, wissenstest_t2, wissenstest_t3) %>% pairwise_wilcoxon(p_adjust = "holm") %>% summary()
 *     # 1–2: z = −5.358338, p = 8.399089e-08, p (adj) = 1.679818e-07
 *     # 1–3: z = −8.541720, p = 1.322386e-17, p (adj) = 3.967157e-17
 *     # 2–3: z = −3.755427, p = 1.730464e-04, p (adj) = 1.730464e-04
 *   atlas %>% wilcoxon_test(wissenstest_t2, wissenstest_t3)                 # 108 besser, 65 schlechter, 27 gleich; r = 0.285520
 *   atlas %>% wilcoxon_test(wissenstest, wissenstest_t3)                    # 145 besser, 31 schlechter, 24 gleich
 *   atlas %>% mutate(wissenstest = wissenstest + 1) %>% wilcoxon_test(wissenstest, wissenstest_t3)       # 101 besser
 *   atlas %>% mutate(wissenstest_t2 = wissenstest_t2 - 1) %>% wilcoxon_test(wissenstest_t2, wissenstest_t3) # 135 besser
 *   pairwise_wilcoxon.friedman_test(x, p_adjust = "bonferroni", …)          # Voreinstellung im Quellstand 0.7.4
 *   atlas %>% pairwise_wilcoxon()                                           # Fehler: not available for objects of class <tbl_df/tbl/data.frame>
 */
test('B11 Paarweiser Wilcoxon: Lehrdatensatz wie in R', () => {
  const columns = { x: ['wissenstest'], y: ['wissenstest_t2'], z: ['wissenstest_t3'] };
  const ps = pwSample(ctx(rows, columns));
  [[-5.358338, 1.679818e-7], [-8.54172, 3.967157e-17], [-3.755427, 1.730464e-4]].forEach(([z, p], k) => assert.ok(near(ps[k].z, z) && near(ps[k].pAdj, p, 1e-9 * Math.max(1, p * 1e3)), `Paar ${k}: ${ps[k].z} ${ps[k].pAdj}`));
  assert.deepEqual([ps[2].test.nPos, ps[2].test.nNeg, ps[2].test.nZero, ps[1].test.nPos, ps[1].test.nNeg], [108, 65, 27, 145, 31]);
  assert.ok(near(ps[2].test.r, 0.28552), `r ${ps[2].test.r}`);
  assert.equal(pwImproved(ctx(applyOp(rows, 'wissenstest', 'shift', 1), columns), 0, 2), 101);
  assert.equal(pwImproved(ctx(applyOp(rows, 'wissenstest_t2', 'shift', -1), columns), 1, 2), 135);
  assert.deepEqual([3, 4, 8].map(k => bonferroniFor(k).m), [3, 6, 28]);
  assert.match(pairwiseWilcoxonCard.regler!.describe(4), /6 Paare\. .* 0,05 \/ 6 ≈ 0,0083/);
  assert.match(pairwiseWilcoxonCard.stellDirVor.text, /115 Befragte, 53 werden schlechter\. Vom zweiten zum dritten verbessern sich 108, und 65 .* z ≈ −3,76 statt −5,36/);
  assert.match(pairwiseWilcoxonCard.genau.paragraphs[2], /r ≈ 0,29/);
  const s = pairwiseWilcoxonTabs.sample!;
  if (s.kind !== 'analysis') return assert.fail('Auswertung erwartet');
  const r = s.result(ctx(rows, columns));
  assert.equal(r.kurz, 'Nach der Holm-Korrektur sind 3 der 3 Paare bei α = 0,05 auffällig. Den kleinsten Unterschied gibt es zwischen dem zweiten und dem dritten Messzeitpunkt (z ≈ −3,76, p < 0,001).');
  assert.equal(r.zusatz, '1 gegen 2: 115 besser, 53 schlechter; 1 gegen 3: 145 besser, 31 schlechter; 2 gegen 3: 108 besser, 65 schlechter.');
  assert.match(s.think[0].explain, /101 statt 145/);
  assert.match(s.think[1].explain, /135 statt 108/);
});
