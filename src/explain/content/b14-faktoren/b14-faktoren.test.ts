import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { applyOp } from '../../sample';
import { close } from '../../format';
import { txt, type Ctx, type SampleCtx } from '../../types';
import { cronbach, itemColumns, methodenPca, methodenR, mlOneFactor, pca, varimax, SPALTEN } from './rechnen';
import { alphaStats, alphaWerkstatt, KAUM, reliabilityTabs, shiftAll, ZUSAMMEN, type AlphaStats } from './reliability';

/*
 * Referenzwerte des Bereichs B14, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) als Statistikatlas-200-Befragte.sav):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   M <- as.data.frame(lapply(atlas[paste0("methoden", 1:5)], as.numeric))
 *   alpha <- function(X) { k <- ncol(X); k/(k-1) * (1 - sum(apply(X, 2, var)) / var(rowSums(X))) }
 *
 * Werkstatt Cronbachs Alpha (fünf Personen, drei Fragen):
 *   zus  <- matrix(c(2,3,2, 3,3,4, 4,5,4, 5,5,6, 6,7,6), ncol = 3, byrow = TRUE)
 *   kaum <- matrix(c(2,3,4, 3,3,4, 4,5,6, 5,5,6, 6,7,2), ncol = 3, byrow = TRUE)
 *   rowSums(zus); var(rowSums(zus)); apply(zus, 2, var); alpha(zus)      # 7 10 13 16 19; 22.5; 2.5 2.8 2.8; 0.96
 *   rowSums(kaum); var(rowSums(kaum)); alpha(kaum)                        # 9 10 15 16 15; 10.5; 0.3428571
 *   z3 <- zus; z3[,3] <- 8 - z3[,3]; alpha(z3); var(rowSums(z3))          # -1.783784; 3.7
 *   z2 <- zus; z2[,2] <- 4; alpha(z2); k2 <- kaum; k2[,2] <- 4; alpha(k2) # 0.7281553; -0.3488372
 *   alpha(zus - 1); alpha(kaum - 1); alpha(cbind(zus[,1], zus[,1], zus[,1]))   # 0.96; 0.3428571; 1
 *   reliability(as.data.frame(zus), V1, V2, V3)$alpha                      # 0.96
 *
 * Mit 200 Befragten und In R (reliability):
 *   atlas %>% reliability(methoden1, methoden2, methoden3, methoden4, methoden5, na.rm = TRUE) %>% summary()
 *   # Cronbach's Alpha 0.898, Alpha (standardized) 0.899, McDonald's Omega 0.899; SD methoden1 1.425;
 *   # Corrected Item-Total methoden1 0.761, Alpha if Deleted 0.873
 *   alpha(M); sum(apply(M, 2, var)); var(rowSums(M))                       # 0.8981982; 10.15633; 36.08683
 *   Mr <- M; Mr$methoden1 <- 8 - Mr$methoden1; alpha(Mr)                   # 0.4064987
 *   Mc <- M; Mc$methoden2 <- 4; alpha(Mc)                                  # 0.8221579
 *   Mrc <- Mr; Mrc$methoden2 <- 4; alpha(Mrc)                              # -0.03941032
 */

const rows = createSurvey();
const ctx = (data = rows): SampleCtx => ({ rows: data, columns: { x: [SPALTEN.x], y: [SPALTEN.y] } });
const at = (d: number[][], who = 0): Ctx<AlphaStats> => ({ s: alphaStats(d), who, names: alphaWerkstatt.names });

test('B14 Cronbachs Alpha: die Werkstatt rechnet wie R', () => {
  const z = alphaStats(ZUSAMMEN), k = alphaStats(KAUM);
  assert.deepEqual(z.X, [7, 10, 13, 16, 19], 'Summenwerte Passen zusammen');
  assert.deepEqual(k.X, [9, 10, 15, 16, 15], 'Summenwerte Passen kaum zusammen');
  for (const [mine, r] of [[z.varX, 22.5], [z.sumItemVar, 8.1], [z.diff, 14.4], [z.alpha, 0.96], [k.varX, 10.5], [k.sumItemVar, 8.1], [k.alpha, 0.3428571]])
    assert.ok(close(mine, r, 1e-6), `${mine} ≠ R ${r}`);
  assert.deepEqual(z.itemVar.map(v => Math.round(v * 100) / 100), [2.5, 2.8, 2.8], 'Varianzen der Fragen');
  assert.deepEqual(k.itemVar.map(v => Math.round(v * 100) / 100), [2.5, 2.8, 2.8], 'gleiche Antworten je Frage, anders verteilt');
  // Denkfragen: die Antworten stimmen für beide Voreinstellungen.
  const [t1, t2, t3, t4] = alphaWerkstatt.think;
  assert.ok(close(alphaStats(t1.tryIt!.apply(ZUSAMMEN)).alpha, 0.7281553, 1e-6) && close(alphaStats(t1.tryIt!.apply(KAUM)).alpha, -0.3488372, 1e-6), 'Frage 2 auf 4: sinkt');
  const z3 = alphaStats(t2.tryIt!.apply(KAUM));
  assert.ok(close(z3.alpha, -1.783784, 1e-6) && close(z3.varX, 3.7, 1e-9), 'Frage 3 umgepolt: −1,78');
  assert.match(txt(t2.explain, at(ZUSAMMEN)), /von 0,96 auf −1,78/);
  assert.deepEqual(shiftAll(ZUSAMMEN)[0], [1, 2, 1], 'eine Stufe tiefer');
  for (const d of [ZUSAMMEN, KAUM]) assert.ok(close(alphaStats(t3.tryIt!.apply(d)).alpha, alphaStats(d).alpha, 1e-12), 'verschieben: gleich');
  assert.ok(close(alphaStats(t4.tryIt!.apply(ZUSAMMEN)).alpha, 1, 1e-12), 'gleiche Antworten: Alpha 1');
  // Texte mit den sichtbaren Zahlen.
  const v = alphaWerkstatt.variants.reliability;
  assert.equal(txt(alphaWerkstatt.steps[5].rechnung, at(ZUSAMMEN)), 'α = 3/2 · 14,4 / 22,5 ≈ 0,96. Der gemeinsame Teil macht 64 % der Streuung der Summenwerte aus.');
  assert.equal(txt(alphaWerkstatt.steps[5].rechnung, at(KAUM)), 'α = 3/2 · 2,4 / 10,5 ≈ 0,34. Der gemeinsame Teil macht 23 % der Streuung der Summenwerte aus.');
  assert.match(v.interpret(at(ZUSAMMEN)).kurz, /passen sehr gut zusammen.*Alpha ist 0,96\./);
  assert.match(v.interpret(at(KAUM)).kurz, /passen kaum zusammen.*Alpha ist 0,34\./);
  assert.match(v.interpret(at(t2.tryIt!.apply(ZUSAMMEN))).kurz, /^Alpha ist negativ \(−1,78\)/);
  // Diagnosen der typischen Fehler.
  const c = at(ZUSAMMEN), s = alphaWerkstatt.steps;
  assert.match(s[0].check.diagnose(c, 7 / 3)!, /Durchschnitt/);
  assert.match(s[1].check.diagnose(c, 18)!, /durch 5 geteilt/);
  assert.match(s[1].check.diagnose(c, 90)!, /Quadratsumme/);
  assert.match(s[3].check.diagnose(c, 22.5)!, /Varianz der Summenwerte/);
  assert.match(s[4].check.diagnose(c, -14.4)!, /Vorzeichen/);
  assert.match(s[5].check.diagnose(c, 0.64)!, /mit 3\/2 mal/);
  assert.match(s[5].check.diagnose(c, 0.54)!, /Σsⱼ² \/ sₓ²/);
  // Undefiniert, wenn alle Summenwerte gleich sind.
  const flat = at([[4, 4, 4], [4, 4, 4], [4, 4, 4], [4, 4, 4], [4, 4, 4]]);
  assert.equal(s[5].check.answer(flat), 'NA');
  assert.doesNotMatch(v.interpret(flat).kurz + txt(s[5].rechnung, flat), /NaN|–/);
});

test('B14 Cronbachs Alpha mit 200 Befragten wie in R', () => {
  const a = cronbach(itemColumns(rows));
  for (const [mine, r] of [[a.alpha, 0.8981982], [a.sumItemVar, 10.15633], [a.totalVar, 36.08683], [a.alphaStd, 0.8988510]])
    assert.ok(close(mine, r, 1e-5), `${mine} ≠ R ${r}`);
  const s = reliabilityTabs.sample!;
  assert.equal(s.kind, 'analysis');
  if (s.kind !== 'analysis') return;
  const r = s.result(ctx());
  assert.match(r.kurz, /passen sehr gut zusammen: Cronbachs Alpha ist 0,90\./);
  assert.match(r.fachlich, /Σsⱼ² = 10,16, sₓ² = 36,09: α = 5\/4 · \(1 − 10,16 \/ 36,09\) ≈ 0,90\. .* 0,90\./);
  assert.equal(r.zusatz, 'Die Summenwerte streuen 3,55-mal so stark wie die fünf Fragen einzeln zusammen.');
  const rev = applyOp(rows, 'methoden1', 'reverse'), con = applyOp(rows, 'methoden2', 'constant', 4);
  assert.ok(close(s.value!(ctx(rev))!, 0.4064987, 1e-6), 'umgepolt wie R');
  assert.ok(close(s.value!(ctx(con))!, 0.8221579, 1e-6), 'Frage 2 konstant wie R');
  assert.ok(close(s.value!(ctx(applyOp(rev, 'methoden2', 'constant', 4)))!, -0.03941032, 1e-6), 'beides wie R');
  assert.match(s.think[0].explain, /von 0,90 auf 0,41/); assert.match(s.think[1].explain, /von 0,90 auf 0,82/);
  assert.match(s.result(ctx(con)).fachlich, /weil eine Frage nicht streut/);
  // In R: 1,425² ≈ 2,03 (var(methoden1) = 2.029246).
  assert.ok(close(1.425 ** 2, 2.03, 0.005) && close(a.itemVars[0], 2.029246, 1e-6));
});

test('B14 Rechnungen: Hauptkomponenten, Varimax und ML-Faktor wie mariposa::efa', () => {
  const R = methodenR(rows)!;
  const p1 = pca(R, 1), p2 = pca(R, 2);
  [3.5601784, 0.4135994, 0.3741370, 0.3370853, 0.3149998].forEach((v, i) => assert.ok(close(p1.values[i], v, 1e-6), `Eigenwert ${i + 1}`));
  [0.8521855, 0.8398356, 0.8287300, 0.8566694, 0.8414028].forEach((v, i) => assert.ok(close(p1.loadings[i][0], v, 1e-6), `Ladung ${i + 1}`));
  [-0.01409086, -0.40817487, 0.36011693, -0.20403813, 0.27473323].forEach((v, i) => assert.ok(close(p2.loadings[i][1], v, 1e-6), `zweite Komponente ${i + 1}`));
  const vm = varimax(p2.loadings);
  [[0.5951253, 0.6101185], [0.3088406, 0.8812196], [0.8419913, 0.3279150], [0.4645468, 0.7481378], [0.7908612, 0.3974613]]
    .forEach((row, i) => row.forEach((v, j) => assert.ok(close(vm.loadings[i][j], v, 1e-6), `Varimax ${i + 1}/${j + 1}`)));
  assert.equal(vm.iterations, 3);
  const ml = mlOneFactor(R)!;
  [0.8126905, 0.7954346, 0.7761573, 0.8202676, 0.7954613].forEach((v, i) => assert.ok(close(ml.loadings[i], v, 1e-5), `ML-Ladung ${i + 1}`));
  assert.ok(close(ml.share, 0.64024, 1e-4), 'ML: 64,0 %');
  assert.ok(methodenPca(rows), 'PCA aus den Daten');
});
