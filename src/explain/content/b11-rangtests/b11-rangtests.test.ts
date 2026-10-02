import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { applyOp } from '../../sample';
import { close } from '../../format';
import { txt, type Ctx, type SampleCtx } from '../../types';
import { mannWhitney, midRanks } from './rank';
import { mannWhitneyTabs, mannWhitneyWorkshop as mwW, mwSample, MW_START, MW_TIES } from './mann-whitney';

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
