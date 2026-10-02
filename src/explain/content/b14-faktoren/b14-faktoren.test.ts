import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav } from '../../../sandbox/readSav';
import { validValues } from '../../../tasks/kit/stats';
import { createSurvey } from '../../../domain/survey';
import { applyOp } from '../../sample';
import { close } from '../../format';
import { txt, type Ctx, type SampleCtx } from '../../types';
import { cronbach, itemColumns, methodenPca, methodenR, mlOneFactor, pca, varimax, SPALTEN } from './rechnen';
import { alphaStats, alphaWerkstatt, KAUM, reliabilityTabs, shiftAll, ZUSAMMEN, type AlphaStats } from './reliability';
import { efa, efaTabs, METHODEN_PCA } from './efa';
import { beideModelle, factorModel, factorModelTabs, METHODEN_ML } from './factor-model';
import { dimensionality, dimensionalityTabs } from './dimensionality';
import { eigenvalues, eigenvaluesTabs, equalCorrelation } from './eigenvalues';
import { loadings, loadingsTabs } from './loadings';
import { communalityTabs, KIRCHE, kommunalitaet, NACHHER, VORHER } from './communality';
import { VERTRAUEN } from './allbus';
import { corMatrix } from './rechnen';

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
 *
 * Hauptkomponenten (efa, eigenvalues, loadings, communality):
 *   R <- cor(M); range(R[upper.tri(R)])                                    # 0.607512729 0.676334515; mean 0.639935668
 *   eigen(R)$values                                                        # 3.5601784 0.4135994 0.3741370 0.3370853 0.3149998
 *   atlas %>% efa(methoden1, methoden2, methoden3, methoden4, methoden5, extraction = "pca", n_factors = 1, rotation = "none", use = "complete")
 *   # KMO = 0.891, Variance explained: 71.2%; summary(): Ladungen 0.852 0.840 0.829 0.857 0.841, Kommunalitäten 0.726 0.705 0.687 0.734 0.708
 *   e <- eigen(cor(Mr)); e$values; e$vectors[, 1] * sqrt(e$values[1])     # dieselben Eigenwerte; Ladung von methoden1 −0.852
 *
 * Gemeinsamer Faktor (factor_model):
 *   ml <- atlas %>% efa(methoden1, methoden2, methoden3, methoden4, methoden5, extraction = "ml", n_factors = 1, rotation = "none", use = "complete")
 *   # Variance explained: 64.0%; Extraction Sums 3.201 (64.024 %); Goodness of fit Chi² 2.827, df 5, p .727
 *   unclass(ml$loadings)       # 0.8126905 0.7954346 0.7761573 0.8202676 0.7954613
 *   ml$communalities           # 0.6604671 0.6327186 0.6024152 0.6728405 0.6327587; uniquenesses 1 minus diese
 *   atlas %>% efa(…, extraction = "ml", n_factors = 3)   # `n_factors` = 3 is too many for ML extraction with 5 variables.
 *
 * ALLBUS 2023 (ZA8831 v1.3.0, ungewichtet, nur Aggregate; dimensionality, loadings, communality, rotation):
 *   allbus <- read_spss("ZA8831_v1-3-0.sav")
 *   T <- as.data.frame(lapply(allbus[c("pt03","pt12","pt15","pt06","pt07")], as.numeric)); T <- T[complete.cases(T),]
 *   nrow(T); cor(T)                          # 3333; Politik .790 .676 .708, Kirchen .719, dazwischen .259 bis .349
 *   eigen(cor(T))$values                     # 2.9219141 1.2518745 0.3408948 0.2789437 0.2063728
 *   allbus %>% efa(pt03, pt12, pt15, pt06, pt07, extraction = "pca", n_factors = 2, rotation = "none", use = "complete")
 *   # ungedreht 0.8433806 −0.3469028 / 0.8400864 −0.3907181 / 0.8256293 −0.2860410 / 0.6181754 0.6949669 / 0.6641336 0.6434857
 *   allbus %>% efa(pt03, pt12, pt15, pt06, pt07, extraction = "pca", n_factors = 2, rotation = "varimax", use = "complete")
 *   # Varimax 0.8962963 0.1681830 / 0.9173876 0.1296370 / 0.8482711 0.2095696 / 0.1401630 0.9194967 / 0.2067410 0.9013354
 *   # Kommunalitäten 0.832 0.858 0.763 0.865 0.855; Rotation Sums 48.538 % und 34.938 %, zusammen 83.476 %; 3 Iterationen
 *   allbus %>% reliability(pt03, pt12, pt15, pt06, pt07)    # Cronbach's Alpha = 0.817, N = 3333
 *   table(as_factor(pt03, levels = "both"))  # TNZ: SPLIT 1596 (nur einem Teil gestellt)
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

test('B14 Komponenten- & Faktorenanalyse: die Zahlen der Karte und der Reiter wie in R', () => {
  const R = methodenR(rows)!, off = R.flatMap((row, i) => row.filter((_, j) => j > i));
  assert.ok(close(Math.min(...off), METHODEN_PCA.rMin, 1e-6) && close(Math.max(...off), METHODEN_PCA.rMax, 1e-6), 'Spanne der Korrelationen');
  const p = pca(R, 1);
  METHODEN_PCA.eigen.forEach((v, i) => assert.ok(close(p.values[i], v, 1e-6), `Eigenwert ${i + 1}`));
  METHODEN_PCA.loadings.forEach((v, i) => assert.ok(close(p.loadings[i][0], v, 1e-6), `Ladung ${i + 1}`));
  assert.match(efa.stellDirVor.text, /zwischen 0,61 und 0,68\. .* 71,2 % .* zwischen 0,83 und 0,86\./);
  assert.match(efa.bausteine[1].rechnung!, /3,56 \/ 5 ≈ 71,2 %/);
  assert.match(efa.bausteine[2].was, /Eigenwert von 0,41/);
  const s = efaTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx());
  assert.match(r.kurz, /^Eine Komponente bündelt 71,2 % der Streuung aller fünf Fragen\. Alle fünf Fragen laden stark auf ihr, zwischen 0,83 und 0,86\./);
  assert.match(r.fachlich, /erster Eigenwert 3,56 von 5, also 71,2 %\. Der zweite Eigenwert ist 0,41; nur eine Komponente liegt über 1\./);
  const rev = applyOp(rows, 'methoden1', 'reverse');
  assert.match(s.result(ctx(rev)).kurz, /Frage 1 \(−0,85\) lädt negativ/);
  assert.ok(close(s.value!(ctx(rev))!, s.value!(ctx())!, 1e-12), 'umgepolt: gleicher Anteil');
  assert.equal(s.result(ctx(applyOp(rows, 'methoden2', 'constant', 4))).kurz.startsWith('Mindestens eine Frage streut nicht'), true);
});

test('B14 Komponenten & Faktoren: PCA gegen ML wie in R', () => {
  const b = beideModelle(ctx())!;
  METHODEN_ML.loadings.forEach((v, i) => assert.ok(close(b.ml.loadings[i], v, 1e-5), `ML-Ladung ${i + 1}`));
  METHODEN_ML.communalities.forEach((v, i) => assert.ok(close(b.ml.communalities[i], v, 1e-5), `ML-Kommunalität ${i + 1}`));
  assert.ok(close(b.ml.share * 5, METHODEN_ML.ss, 1e-5) && close(METHODEN_ML.share, METHODEN_ML.ss / 5, 1e-6), 'ML: 3,20 von 5');
  assert.match(factorModel.stellDirVor.text, /bündelt 71,2 % .* erklärt 64,0 %\. Bei Frage 1 sind es 73 % gegen 66 %: Den Rest von 34 %/);
  assert.match(factorModel.bausteine[1].rechnung!, /3,20 von 5, also 64,0 %/);
  assert.match(factorModel.bausteine[2].rechnung!, /Komponente 0,83 bis 0,86, des Faktors 0,78 bis 0,82/);
  const s = factorModelTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx());
  assert.match(r.kurz, /bündelt 71,2 % der Streuung, der gemeinsame Faktor erklärt 64,0 %\./);
  assert.match(r.zusatz!, /Komponente 73 % .* Faktor 66 %; ihr eigener Rest im Faktorenmodell ist 0,34\./);
});

test('B14 Dimensionalität: Texte und Reiter mit den Zahlen aus R', () => {
  assert.match(dimensionality.stellDirVor.text, /3\.333 Befragte .* mit 0,68 bis 0,79, die beiden Kirchen mit 0,72\. .* nur bei 0,26 bis 0,35\. .* nämlich 2,92 und 1,25\./);
  assert.match(dimensionality.regler!.describe(1), /\(3,56\), der nächste bei 0,41/);
  assert.match(dimensionality.regler!.describe(0), /\(2,92 und 1,25\), der dritte bei 0,34/);
  assert.match(dimensionality.ausprobieren[1].question, /Alpha von 0,82\./);
  const s = dimensionalityTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx());
  assert.match(r.kurz, /^Nur eine Komponente hat einen Eigenwert über 1 \(3,56\); der zweite liegt bei 0,41\./);
  assert.equal(r.fachlich, 'Eigenwerte der Korrelationsmatrix: 3,56, 0,41, 0,37, 0,34, 0,31. Zusammen ergeben sie mit allen Nachkommastellen 5, die Zahl der Fragen.');
  assert.equal(r.zusatz, 'Die erste Komponente bündelt 71,2 % der Streuung, die zweite nur 8,3 %.');
  // In R: Variance explained 79.5 % mit zwei Komponenten, 71.2 % mit einer: 8,3 Prozentpunkte dazu.
  assert.ok(close(METHODEN_PCA.eigen[1] / 5 * 100, 8.27, 0.01));
});

test('B14 Eigenwerte: Karte, Regler und Reiter mit den Zahlen aus R', () => {
  assert.match(eigenvalues.stellDirVor.text, /erste Eigenwert 3,56\. Die übrigen vier sind klein: 0,41, 0,37, 0,34, 0,31\. .* 3,56 \/ 5 ≈ 71,2 %/);
  assert.match(eigenvalues.regler!.describe(0.64), /1 \+ 4 · 0,64 = 3,56\. Die erste Komponente bündelt 71,2 %, die anderen vier je 0,36\./);
  assert.deepEqual(equalCorrelation(0).map(v => Math.round(v * 1e9) / 1e9), [1, 1, 1, 1, 1]);
  assert.ok(close(equalCorrelation(0.6399357)[0], METHODEN_PCA.eigen[0], 1e-3), 'mittlere Korrelation 0.6399 (R) trifft den ersten Eigenwert fast');
  assert.ok(close(0.712 * 5, 3.56, 1e-9));
  const s = eigenvaluesTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx());
  assert.match(r.kurz, /^Der erste Eigenwert ist 3,56: Die erste Komponente bündelt 71,2 % .* zwischen 0,31 und 0,41\./);
  const out = applyOp(rows, 'methoden1', 'outlier', 1, 1), p = methodenPca(out)!;
  assert.ok(close(p.values.reduce((a, b) => a + b, 0), 5, 1e-9), 'Summe 5');
});

test('B14 Ladungen: ALLBUS-Muster und Reiter mit den Zahlen aus R', () => {
  assert.match(loadings.stellDirVor.text, /3\.333 Befragte.*Bundesregierung \(0,92\), Bundestag \(0,90\) und Parteien \(0,85\).*Katholische \(0,92\) und evangelische Kirche \(0,90\).*nur bei 0,13 bis 0,21\./);
  assert.match(loadings.bausteine[0].rechnung!, /Politik: 0,92, mit der Komponente Kirchen: 0,13\./);
  const s = loadingsTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx());
  assert.match(r.kurz, /^Frage 1 lädt mit 0,85 auf der Komponente\. Alle fünf Fragen laden stark auf ihr, zwischen 0,83 und 0,86\./);
  assert.match(r.zusatz!, /mit allen Nachkommastellen 0,73\./);
  assert.ok(close(s.value!(ctx(applyOp(rows, 'methoden1', 'reverse')))!, -0.8521855, 1e-6), 'umgepolt: −0.852 wie R');
  // In R (summary): Ladungen 0.829 bis 0.857.
  assert.deepEqual([Math.min(...METHODEN_PCA.loadings), Math.max(...METHODEN_PCA.loadings)].map(v => Math.round(v * 1000) / 1000), [0.829, 0.857]);
});

test('B14 Kommunalität: Formel als Satz und Reiter mit den Zahlen aus R', () => {
  const k = kommunalitaet.compute(KIRCHE), v = kommunalitaet.compute(VORHER), n = kommunalitaet.compute(NACHHER);
  assert.ok(close(k.h2, 0.866, 1e-9) && close(VERTRAUEN.communalities[3], 0.8651198, 1e-7), 'Kirche: 0,87 gerundet wie R 0.865');
  assert.ok(close(KIRCHE['λ₁'], VERTRAUEN.rotated[3][0], 0.005) && close(KIRCHE['λ₂'], VERTRAUEN.rotated[3][1], 0.005), 'Ladungen auf zwei Stellen');
  assert.ok(close(v.h2, 0.81, 1e-12) && close(n.h2, 0.81, 1e-12), 'vor und nach der Drehung 0,81');
  assert.ok(close(Math.hypot(0.72, 0.54), 0.9, 1e-12), 'Drehung: gleicher Abstand vom Ursprung');
  assert.match(kommunalitaet.interpret(k).kurz, /erfassen 87 % .* 13 % gehören ihr allein/);
  assert.deepEqual(kommunalitaet.worked(k).map(w => w.text).slice(0, 3), ['0,14 · 0,14 ≈ 0,02.', '0,92 · 0,92 ≈ 0,85.', '0,02 + 0,85 = 0,87.']);
  assert.match(kommunalitaet.fehler, /\(0,14 \+ 0,92\)² ≈ 1,12 statt 0,87/);
  assert.ok(close((0.14 + 0.92) ** 2, 1.1236, 1e-9));
  assert.match(kommunalitaet.check.diagnose(0.9), /ohne sie zu quadrieren/);
  assert.match(kommunalitaet.interpret(kommunalitaet.compute({ 'λ₁': 1, 'λ₂': 1 })).kurz, /über 1 gibt es/);
  const s = communalityTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx());
  assert.match(r.kurz, /bei Frage 1 73 % ihrer Streuung, 27 % gehören der Frage allein\. .* zwischen 69 und 73 %\./);
  assert.match(r.fachlich, /Frage 1 0,73, Frage 2 0,71, Frage 3 0,69, Frage 4 0,73, Frage 5 0,71\. .* Eigenwert 3,56\./);
});

const allbusFile = process.env.ALLBUS_SAV;
test('B14 ALLBUS 2023: die Aggregate zum Vertrauen stimmen mit der Datei überein', { skip: !allbusFile && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const bytes = readFileSync(allbusFile!);
  const sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const cols = VERTRAUEN.items.map(id => Array.from(validValues(sav.byName.get(id)!), v => (v >= 1 && v <= 7 ? v : NaN)));
  const keep = cols[0].map((_, i) => i).filter(i => cols.every(c => Number.isFinite(c[i])));
  assert.equal(keep.length, VERTRAUEN.n, 'listenweise vollständige Fälle');
  const X = cols.map(c => keep.map(i => c[i])), R = corMatrix(X)!;
  assert.ok(close(R[0][1], VERTRAUEN.rPolitik[0], 1e-6) && close(R[0][2], VERTRAUEN.rPolitik[1], 1e-6) && close(R[1][2], VERTRAUEN.rPolitik[2], 1e-6), 'Politik');
  assert.ok(close(R[3][4], VERTRAUEN.rKirche, 1e-6), 'Kirchen');
  const cross = [0, 1, 2].flatMap(i => [3, 4].map(j => R[i][j]));
  assert.ok(close(Math.min(...cross), VERTRAUEN.rQuer[0], 1e-6) && close(Math.max(...cross), VERTRAUEN.rQuer[1], 1e-6), 'dazwischen');
  const p = pca(R, 2);
  VERTRAUEN.eigen.forEach((v, i) => assert.ok(close(p.values[i], v, 1e-6), `Eigenwert ${i + 1}`));
  VERTRAUEN.unrotated.forEach((row, i) => row.forEach((v, j) => assert.ok(close(p.loadings[i][j], v, 1e-6), `ungedreht ${i + 1}/${j + 1}`)));
  const vm = varimax(p.loadings);
  VERTRAUEN.rotated.forEach((row, i) => row.forEach((v, j) => assert.ok(close(vm.loadings[i][j], v, 1e-6), `Varimax ${i + 1}/${j + 1}`)));
  assert.equal(vm.iterations, 3);
  assert.ok(close(Math.abs(vm.angle) * 180 / Math.PI, VERTRAUEN.angle, 1e-3), 'Drehwinkel');
  VERTRAUEN.communalities.forEach((v, i) => assert.ok(close(p.communalities[i], v, 1e-6), `Kommunalität ${i + 1}`));
  const ss = [0, 1].map(j => vm.loadings.reduce((a, row) => a + row[j] ** 2, 0) / 5 * 100);
  assert.ok(close(ss[0], VERTRAUEN.shareRotated[0], 1e-3) && close(ss[1], VERTRAUEN.shareRotated[1], 1e-3), 'gedrehte Anteile');
  assert.ok(close(p.share[0] * 100, VERTRAUEN.shareUnrotated[0], 1e-4) && close(p.share[1] * 100, VERTRAUEN.shareUnrotated[1], 1e-4), 'ungedrehte Anteile');
  assert.ok(close((p.values[0] + p.values[1]) / 5 * 100, VERTRAUEN.total, 1e-4), 'zusammen');
  assert.ok(close(cronbach(X).alpha, VERTRAUEN.alpha, 5e-4), 'Alpha 0.817');
});
