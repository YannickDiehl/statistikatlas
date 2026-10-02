import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { applyOp, bridgeContext } from '../../sample';
import { txt, type Ctx } from '../../types';
import { tabsFor } from '../../registry';
import { rangkorrelation, rankStats, type RankStats } from './spearman';

/*
 * Referenzwerte des Bereichs B5 „Zusammenhang“, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem
 * Lehrdatensatz, gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) als .sav):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *
 * Die R-Befehle zu jedem Begriff stehen über seinem Test.
 */

const rows = createSurvey();
const at = <S,>(compute: (d: never) => S, data: unknown, who = 0, names: readonly string[] = ['A', 'B', 'C', 'D', 'E']): Ctx<S> => ({ s: compute(data as never), who, names });
const near = (a: number | null, b: number, tol = 1e-6) => a !== null && Math.abs(a - b) <= tol;

/*
 * Spearman, Werkstatt (fünf Personen):
 *   x <- c(2, 4, 5, 7, 9); y <- c(3, 2, 6, 5, 8)
 *   rank(x); rank(y)                                        # 1 2 3 4 5; 2 1 4 3 5
 *   cor(x, y, method = "spearman"); cor(x, y)               # 0.8; 0.829383
 *   data.frame(x, y) %>% spearman_rho(x, y)                 # rho = 0.800, p = 0.104, N = 5
 *   cor(c(2, 4, 5, 7, 10), y, method = "spearman")          # 0.8 (E auf 10 Stunden: gleiche Ränge)
 *   cor(x, c(9, 7, 5, 3, 2), method = "spearman")           # -1
 *   cor(c(1, 2, 3, 5, 10), c(2, 4, 7, 8, 9), method = "spearman"); cor(c(1, 2, 3, 5, 10), c(2, 4, 7, 8, 9))   # 1; 0.842164
 *   x <- c(2, 4, 4, 7, 9); y <- c(3, 5, 2, 5, 8)
 *   rank(x); rank(y)                                        # 1 2.5 2.5 4 5; 2 3.5 1 3.5 5
 *   sum((rank(x) - 3) * (rank(y) - 3)); sum((rank(x) - 3)^2); sum((rank(y) - 3)^2)   # 7.25; 9.5; 9.5
 *   cor(x, y, method = "spearman"); 1 - 6 * sum((rank(x) - rank(y))^2) / (5 * 24)   # 0.763158; 0.775
 * Brücke, x = lernzeit, y = wissenstest:
 *   rx <- rank(atlas$lernzeit); ry <- rank(atlas$wissenstest)
 *   sum((rx - 100.5) * (ry - 100.5)); sum((rx - 100.5)^2); sum((ry - 100.5)^2)       # 316796.75; 666506.5; 659445.5
 *   cor(atlas$lernzeit, atlas$wissenstest, method = "spearman")                      # 0.477847
 *   p <- (rx - 100.5) * (ry - 100.5); sum(p > 0); sum(p < 0)                         # 119; 81
 *   rx[2]; ry[2]; p[2]                                                               # 113.5; 70.5; -390 (P002)
 *   cor(2 * lernzeit, wissenstest, method = "spearman"); cor(lernzeit + 1, …)        # 0.477847 beide
 *   cor(lernzeit, 20 - wissenstest, method = "spearman")                             # -0.477847
 * R-Ausgabe (Katalog): atlas %>% spearman_rho(finanzlage, schulabschluss, use = "listwise")   # rho = 0.130, p = 0.066, N = 200
 */
test('B5 Spearman: Werkstatt, Brücke und R-Ausgabe wie in R', () => {
  const [meist, bogen, gleich] = rangkorrelation.presets.map(p => rankStats(p.data));
  assert.deepEqual([meist.rx, meist.ry], [[1, 2, 3, 4, 5], [2, 1, 4, 3, 5]], 'Ränge meist');
  assert.ok(near(meist.rho, 0.8) && near(meist.r, 0.829383) && meist.sp === 8 && meist.qx === 10 && meist.qy === 10, 'meist: ρ, r, Summe, Quadratsummen');
  assert.ok(near(bogen.rho, 1) && near(bogen.r, 0.842164), 'bogen: ρ = 1, r ≈ 0,84');
  assert.deepEqual([gleich.rx, gleich.ry], [[1, 2.5, 2.5, 4, 5], [2, 3.5, 1, 3.5, 5]], 'mittlere Ränge');
  assert.ok(near(gleich.sp, 7.25) && near(gleich.qx, 9.5) && near(gleich.qy, 9.5) && near(gleich.rho, 0.763158) && near(gleich.r, 0.837472) && near(gleich.short, 0.775), 'gleich: Summe, Quadratsummen, ρ, r, Kurzformel');
  // Denkfragen: E auf 10 Stunden ändert ρ nicht, umgekehrte Reihenfolge ergibt −1, der Bogen hat r ≈ 0,84.
  const th = rangkorrelation.think;
  assert.ok(near(rankStats(th[0].tryIt!.apply(rangkorrelation.presets[0].data)).rho, 0.8), 'E auf 10');
  assert.ok(near(rankStats(th[3].tryIt!.apply(rangkorrelation.presets[0].data)).rho, -1), 'umgekehrt');
  assert.match(txt(th[1].explain, at(rankStats, rangkorrelation.presets[0].data)), /etwa 0,84/);
  // Texte mit den Zahlen der Voreinstellungen.
  const s = rangkorrelation.steps, c = at<RankStats>(rankStats, rangkorrelation.presets[2].data, 1);
  assert.equal(txt(s[0].rechnung, c), 'Person B: 4 Stunden haben zwei Personen. Sie teilen sich die Plätze 2 und 3 und bekommen je Rang 2,5. 5 Aufgaben haben zwei Personen. Sie teilen sich die Plätze 3 und 4 und bekommen je Rang 3,5.');
  assert.match(txt(s[4].rechnung, c), /ρ = 7,25 \/ √\(9,5 · 9,5\) = 7,25 \/ 9,5 ≈ 0,76\./);
  assert.match(txt(s[4].rechnung, at(rankStats, rangkorrelation.presets[0].data)), /ρ = 8 \/ √\(10 · 10\) = 8 \/ 10 = 0,8\./);
  assert.match(rangkorrelation.variants.spearman.genau.paragraphs(c)[0], /ergäbe sie 0,78 statt ρ ≈ 0,76/);
  assert.match(s[0].check.diagnose(at(rankStats, rangkorrelation.presets[0].data, 1), 4)!, /^Fast! Das ist die Antwort selbst/);
  assert.match(s[0].check.diagnose(c, 2)!, /^Fast! Gleiche Antworten teilen sich ihre Plätze/);
  assert.match(s[4].check.diagnose(at(rankStats, rangkorrelation.presets[0].data), 2)!, /durch 4 geteilt/);
  // Brücke mit den 200 Befragten.
  const b = rangkorrelation.bridge!, bc = bridgeContext(rankStats, 'pairs', rows, 'lernzeit', 'wissenstest', 1);
  assert.ok(near(bc.s.sp, 316796.75) && near(bc.s.qx, 666506.5) && near(bc.s.qy, 659445.5) && near(bc.s.rho, 0.477847), 'Brücke: Summe, Quadratsummen, ρ');
  assert.equal(bc.s.prod.filter(p => p > 0).length, 119); assert.equal(bc.s.prod.filter(p => p < 0).length, 81);
  assert.deepEqual([bc.s.rx[1], bc.s.ry[1], bc.s.prod[1]], [113.5, 70.5, -390], 'P002');
  assert.equal(b.lines[0].person(bc), 'P002 hat bei „Lernzeit“ 8,3 h, das ist Rang 113,5, geteilt mit einer weiteren Person. Bei „Wissenstest“ hat P002 9 Aufgaben: Rang 70,5.');
  assert.equal(b.lines[3].all(bc), 'Die 200 Produkte ergeben zusammen 316.796,75. 119 sind positiv, 81 negativ.');
  assert.equal(b.lines[4].all(bc), '316.796,75 / √(666.506,5 · 659.445,5) ≈ 0,48. Zum Vergleich: Pearson-r der Werte selbst ist 0,54.');
  assert.equal(b.interpret(bc, 'spearman').zusatz, '119 von 200 Befragten stehen bei beiden Spalten auf derselben Seite des mittleren Rangs.');
  const rho = (d: typeof rows) => b.value(bridgeContext(rankStats, 'pairs', d, 'lernzeit', 'wissenstest', 1), 'spearman');
  assert.ok(near(rho(applyOp(rows, 'lernzeit', 'double')), 0.477847) && near(rho(applyOp(rows, 'lernzeit', 'shift', 1)), 0.477847) && near(rho(applyOp(rows, 'wissenstest', 'reverse')), -0.477847), 'Vorhersagen wie in R');
  // „In R“: p = 0.066 heißt in etwa 7 von 100.
  assert.match(tabsFor('spearman')!.r!.outputMap[1].explain, /in etwa 7 von 100/);
  assert.ok(close(0.066 * 100, 7, 0.5));
});
