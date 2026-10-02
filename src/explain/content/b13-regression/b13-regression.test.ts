import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { applyOp, bridgeContext, sampleColumn } from '../../sample';
import { close } from '../../format';
import { txt } from '../../types';
import { fitLine, ols } from './fit';
import { gerade, bridgeGerade, BEISPIEL, AUSREISSER } from './gerade';
import { erklaerteVarianz, erklaerteVarianzTabs, QS } from './explained-variance';
import { IA, interaktion, interactionFor, interaktionTabs } from './interaction';
import { logitSatz, logitTabs, shareFor } from './logit';
import { likelihoodKarte, llWb } from './likelihood';
import { BESTANDEN, WB_MODELL, pBestanden, wbModel } from './logistisch-kit';
import { logistic } from './fit';
import { logistischeRegression, logistischeRegressionTabs } from './logistic-regression';
import { marginaleEffekte, marginaleEffekteTabs } from './marginal-effects';
import { ausreisser, ausreisserTabs, influence, P175, P008, withScore, withoutP136 } from './outliers';
import { multikollinearitaet, multikollinearitaetTabs, vifFor, vifOf } from './multicollinearity';
import { baseTable, trainTest, ueberanpassung, ueberanpassungTabs } from './overfitting';

/*
 * Referenzwerte des Bereichs B13 „Regression“, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem
 * Lehrdatensatz, gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) als .sav):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   x <- as.numeric(atlas$lernzeit); y <- as.numeric(atlas$wissenstest)
 *
 * Werkstatt „Gerade“, fünf Personen:
 *   five <- data.frame(x = c(2, 4, 6, 8, 10), y = c(9, 7, 12, 9, 13)); f <- lm(y ~ x, five)
 *   coef(f)                       # 7, 0.5
 *   resid(f)                      # 1 -2 2 -2 1;   sum(resid(f)^2) = 14;   sum((y - mean(y))^2) = 24
 *   five$y[5] <- 3; f <- lm(y ~ x, five)
 *   coef(f)                       # 11, -0.5
 *   resid(f)                      # -1 -2 4 2 -3;  SSE 34;  SST 44
 *
 * Brücke, 200 Befragte:
 *   m <- lm(y ~ x)
 *   coef(m)                                         # 6.1028182424  0.5188907641
 *   sum(resid(m)^2); sum((y - mean(y))^2)           # 1370.273  1931.875
 *   summary(m)$sigma                                # 2.630698;  sum(abs(resid(m)) <= 2.630698) = 136
 *   sum((x - mean(x)) * (y - mean(y))); sum((x - mean(x))^2)   # 1082.313  2085.82
 *   sum(resid(m) > 0); sum(resid(m) < 0)            # 98  102
 *   which.max(resid(m)^2)                           # P136: x 6.5, y 17, ŷ 9.475608, e 7.524392
 *   fitted(m)[2]; resid(m)[2]                       # P002: 10.40961  -1.409612
 *   mean(abs(resid(m)))                             # 2.142273
 *   range(fitted(m))                                # 6.102818 15.65041
 *   b1(2 * x, y); b1(x, 20 - y)                     # 0.2594454  -0.5188908
 *   coef(lm(I(y + 2) ~ x))[1]                       # 8.102818
 *   sapply(1:200, function(k) { xx <- x; xx[k] <- 40; sse(xx, y) - sse(x, y) })   # 9.116845 bis 405.4752: steigt immer
 *   sapply(1:200, function(k) { xx <- x; xx[k] <- 40; b1(xx, y) - b1(x, y) })     # −0.2937661 bis −0.09798981
 *
 * Leitaufruf In R (Katalog linear_regression, Variante 0):
 *   modell <- atlas %>% linear_regression(wissenstest ~ lernzeit + alter, use = "listwise", standardized = TRUE)
 *   # B: (Intercept) 5.822, lernzeit 0.518, alter 0.006; Residual 1368.215, Total 1931.875; Std. Error 2.635
 *   coef(lm(y ~ x + as.numeric(atlas$alter)))        # 5.822370021838  0.517959761657  0.006112726002
 *   fitted(...)[1]                                   # P001 (6 h, 41 Jahre): 9.180750358
 *
 * Erklärter Varianzanteil:
 *   summary(m)$r.squared; cor(x, y)                  # 0.2907031  0.5391689
 *   summary(lm(y ~ x + alter))$r.squared             # 0.2917683 (Adjusted 0.2845781; R druckt 0.292 und 0.285)
 *   1931.875 - 1370.273                              # 561.602 = SSR
 *   sapply(1:200, function(k) { xx <- x; xx[k] <- 40; cor(xx, y)^2 - cor(x, y)^2 })   # −0.2099 bis −0.0047: sinkt immer
 *
 * Interaktion (Katalog linear_regression, Variante 1):
 *   w <- as.numeric(atlas$weiterbildung); mi <- lm(y ~ x * w)
 *   coef(mi)        # 6.46656417701  0.48240625911  -0.88941068393  0.08977126592
 *   # Steigung mit Weiterbildung 0.5721775, Achsenabschnitt 5.577153; p(b3) = 0.4469257; sum(w) = 82; w[1] = 1
 *   coef(lm(y ~ x:w))  # nur das Produkt: B 0.106, p .038 (Token-Karte zu *)
 *   confint(mi)[4, ]   # -0.142541  0.322084 (Katalogausgabe: 95% CI -0.143 bis 0.322)
 *
 * Logit und Likelihood (Weiterbildung):
 *   k <- sum(w); p <- k / 200; c(k, p, p / (1 - p), log(p / (1 - p)))   # 82  0.41  0.6949153  -0.3639654
 *   ll <- function(p) k * log(p) + (200 - k) * log(1 - p)
 *   ll(.41); ll(.5); ll(.9); -2 * ll(.41)            # -135.3717  -138.6294  -280.3446  270.7434
 *   g <- glm(w ~ x + as.numeric(atlas$alter), family = binomial)
 *   coef(g)        # 0.011477758418  -0.005960168232  -0.007023127517
 *   deviance(g); g$null.deviance                     # 270.0636  270.7434 (R: -2 Log Likelihood 270.064, Chi-square 0.680, Sig. .712)
 *   range(fitted(g))                                 # 0.3543686  0.4644712
 *   pp <- fitted(g); mean(coef(g)[2] * pp * (1 - pp)); mean(coef(g)[3] * pp * (1 - pp))   # -0.001436868  -0.001693125
 *   atlas %>% logistic_regression(weiterbildung ~ lernzeit + alter) %>% marginal_effects()   # AME -0.00144, -0.00169 (SE 0.01075, p 0.894)
 *
 * Logistische Regression, mindestens 10 Aufgaben:
 *   atlas %>% mutate(bestanden = rec(wissenstest, rules = "10:20=1; 0:9=0")) %>% frequency(bestanden)   # 78 / 122
 *   gb <- glm(bestanden ~ x, family = binomial); coef(gb)   # -2.043177832  0.335612347; exp(b1) = 1.398797
 *   deviance(gb); gb$null.deviance                          # 227.9453  267.4992
 *   predict(gb, data.frame(x = c(4, 6, 7, 8, 12, 15, 16, 17, 40)), type = "response")
 *   # 0.3316507 0.4926246 0.5759351 0.6551424 0.8791250 0.9521662 0.9653308 0.9749676 0.9999886;  Logit bei 12 h: 1.984170
 *   -coef(gb)[1] / coef(gb)[2]                              # 6.08791 (50 %)
 *   mean(coef(gb)[2] * fitted(gb) * (1 - fitted(gb)))       # AME 0.0651654 (mariposa: AME = 0.065)
 *
 * Ausreißer und Einfluss (Gerade y ~ x):
 *   cd <- cooks.distance(m); h <- hatvalues(m)
 *   which.max(cd); x[21]; y[21]; cd[21]               # P021: 1.6 h, 0 Aufgaben, D = 0.08421977; sum(cd > 4/200) = 9
 *   coef(lm(y[-21] ~ x[-21]))[2]                       # 0.4979594
 *   which.max(h); h[175]; cd[175]; resid(m)[175]       # P175: h = 0.05936259, D = 0.008828791, e = 1.349592
 *   cd[136]; h[136]                                    # 0.0237967  0.005750905
 *   for (v in 0:20) { yy <- y; yy[175] <- v; c(coef(lm(yy ~ x))[2], cooks.distance(lm(yy ~ x))[175]) }
 *   # v = 0: 0.432103 / 0.891998;  v = 10: 0.483154 / 0.130249;  v = 17: 0.518891 / 0.008829;  v = 20: 0.534206 / 0.083342
 *   yy <- y; yy[8] <- 0; coef(lm(yy ~ x))[2]           # P008 (7.8 h, 13 Aufgaben) auf 0: 0.5185885
 *   coef(lm(y[-175] ~ x[-175]))[2]                     # 0.511566
 *   coef(lm(y[-136] ~ x[-136]))[2]                     # 0.52343154; which(cd > 4/200) = 20 21 57 113 114 136 143 158 172
 *
 * Multikollinearität:
 *   r <- cor(x, alter); c(r, r^2, 1 / (1 - r^2), sqrt(1 / (1 - r^2)))   # 0.02962693 0.0008777552 1.000879 1.000439 (R: VIF 1.001)
 *   vif <- function(X) sapply(1:ncol(X), function(j) 1 / (1 - summary(lm(X[, j] ~ X[, -j]))$r.squared))
 *   vif(cbind(x, w, x * w))                          # 1.674551 6.774332 7.404867 (R² des Produkts 0.8649537)
 *   xc <- x - mean(x); vif(cbind(xc, w, xc * w))     # 1.674551 1.000141 1.674523
 *   1 / (1 - .81); sqrt(1 / (1 - .81))               # 5.263158 2.294157
 *
 * Überanpassung (Training P001 bis P100, Test P101 bis P200, R² im Test mit dem Mittelwert der Testpersonen):
 *   d <- as.data.frame(lapply(atlas[, -1], as.numeric)); tr <- 1:100; te <- 101:200
 *   ov <- c("lernzeit", "alter", "schlafdauer", "einkommen", "haushaltsgroesse", "arbeitsstunden", "lernplanung5", "lernzuversicht7",
 *           "statistikinteresse10", "finanzlage", "methoden1", "methoden2", "methoden3", "methoden4", "methoden5", "schulabschluss",
 *           "erwerbstaetig", "weiterbildung", "kurs_vor", "kurs_nach")
 *   for (k in 1:20) { m <- lm(reformulate(ov[1:k], "wissenstest"), d[tr, ]); pr <- predict(m, d[te, ]); yt <- d$wissenstest[te]
 *     c(summary(m)$r.squared, 1 - sum((yt - pr)^2) / sum((yt - mean(yt))^2)) }   # Werte in OVERFIT unten
 *   range(sapply(ov[-1], function(v) cor(d[[v]], d$wissenstest)))                 # -0.1699 (Schlafdauer) bis 0.2457 (Schulabschluss)
 */

const rows = createSurvey();
const X = sampleColumn(rows, 'lernzeit'), Y = sampleColumn(rows, 'wissenstest'), A = sampleColumn(rows, 'alter');

test('B13 Gerade: die fünf Personen wie in R', () => {
  const s = fitLine(BEISPIEL);
  assert.deepEqual([s.b0, s.b1, s.sse, s.sst, s.cp, s.sxx], [7, 0.5, 14, 24, 20, 40], 'Beispiel: b₀, b₁, SSE, SST, Σ Produkte, Σ Quadrate');
  assert.deepEqual(s.e, [1, -2, 2, -2, 1], 'Beispiel: Residuen');
  assert.deepEqual(s.yhat, [8, 9, 10, 11, 12], 'Beispiel: Vorhersagen');
  const o = fitLine(AUSREISSER);
  assert.deepEqual([o.b0, o.b1, o.sse, o.sst, o.cp], [11, -0.5, 34, 44, -20], 'Ausreißer: b₀, b₁, SSE, SST, Σ Produkte');
  assert.deepEqual(o.e, [-1, -2, 4, 2, -3], 'Ausreißer: Residuen');
  // Denkfrage: „von +20 auf −20, b₁ von 0,5 zu −0,5“
  assert.match(txt(gerade.think[0].explain, { s, who: 0, names: gerade.names }), /von \+20 auf −20, und b₁ wird von 0,5 zu −0,5/, 'Denkfrage zum Ausreißer');
  assert.deepEqual(gerade.think[0].tryIt!.apply(BEISPIEL), AUSREISSER, 'Ausprobieren setzt E auf 3 Aufgaben');
  const c = { s, who: 1, names: gerade.names };
  assert.equal(txt(gerade.steps[3].rechnung, c), 'Person B: ŷ = 7 + 0,5 · 4 = 7 + 2 = 9 Aufgaben. Gelöst hat B 7.');
  assert.equal(txt(gerade.steps[3].acht, c), 'Erst malnehmen, dann addieren: 7 + 0,5 · 4 ergibt 9, nicht 30.');
  assert.equal(txt(gerade.steps[2].rechnung, c), 'b₀ = ȳ − b₁ · x̄ = 10 − 0,5 · 6 = 10 − 3 = 7');
  assert.equal(txt(gerade.steps[4].rechnung, c), 'Person B: 7 − 9 = −2, also 2 Aufgaben unter der Geraden.');
  assert.match(gerade.variants.residuals.interpret(c).kurz, /im Schnitt 1,6 Aufgaben neben der Geraden\. Am weitesten liegen B, C und D daneben, je 2 Aufgaben\./);
  assert.match(gerade.variants.linear_regression.interpret({ s: o, who: 0, names: gerade.names }).kurz, /0,5 Aufgaben weniger\. Das liegt vor allem an Person E/);
  // Diagnosen der typischen Fehler
  assert.match(gerade.steps[1].check.diagnose(c, 5)!, /Kovarianz/);
  assert.match(gerade.steps[1].check.diagnose(c, 2)!, /Andersherum/);
  assert.match(gerade.steps[2].check.diagnose(c, 13)!, /abgezogen/);
  assert.match(gerade.steps[3].check.diagnose(c, 30)!, /Punktrechnung/);
  assert.match(gerade.steps[3].check.diagnose(c, 2)!, /Startwert/);
  assert.match(gerade.steps[5].check.diagnose(c, 8)!, /ohne Quadrat/);
  assert.match(gerade.steps[5].check.diagnose(c, 24)!, /ohne Gerade/);
  // Ohne Streuung in x: keine Steigung, keine kaputten Texte.
  const flat = fitLine({ x: [5, 5, 5, 5, 5], y: [9, 7, 12, 9, 13] });
  assert.equal(flat.b1, null, 'b₁ nicht definiert');
  assert.equal(gerade.steps[1].check.answer({ s: flat, who: 0, names: gerade.names }), 'NA');
});

test('B13 Gerade: die 200 Befragten wie in R', () => {
  const s = fitLine({ x: X, y: Y });
  assert.ok(close(s.b0!, 6.1028182424, 1e-9) && close(s.b1!, 0.5188907641, 1e-9), 'b₀ und b₁');
  assert.ok(close(s.sse, 1370.273, 1e-3) && close(s.sst, 1931.875, 1e-3), 'SSE und SST');
  assert.ok(close(s.cp, 1082.313, 1e-3) && close(s.sxx, 2085.82, 1e-2), 'Zähler und Nenner');
  assert.deepEqual([s.above, s.below], [98, 102], 'über und unter der Geraden');
  assert.equal(rows[s.biggest].id, 'P136'); assert.ok(close(s.e[s.biggest], 7.524392, 1e-6), 'größtes Residuum');
  assert.ok(close(s.yhat[1], 10.40961, 1e-5) && close(s.e[1], -1.409612, 1e-6), 'P002');
  assert.ok(close(s.absSum / 200, 2.142273, 1e-6), 'mittlerer Betrag der Residuen');
  assert.ok(close(Math.min(...s.yhat), 6.102818, 1e-6) && close(Math.max(...s.yhat), 15.65041, 1e-5), 'Spanne der Vorhersagen');
  const se = Math.sqrt(s.sse / 198);
  assert.ok(close(se, 2.630698, 1e-6)); assert.equal(s.e.filter(e => Math.abs(e) <= se).length, 136);
  assert.ok(close(fitLine({ x: X.map(v => 2 * v), y: Y }).b1!, 0.2594454, 1e-7), 'verdoppelt');
  assert.ok(close(fitLine({ x: X, y: Y.map(v => 20 - v) }).b1!, -0.5188908, 1e-7), 'umgepolt');
  assert.ok(close(fitLine({ x: X, y: Y.map(v => v + 2) }).b0!, 8.102818, 1e-6), 'zwei Aufgaben mehr');
  let lo = Infinity, hi = -Infinity, dlo = Infinity, dhi = -Infinity;
  for (let k = 0; k < 200; k++) {
    const f = fitLine({ x: sampleColumn(applyOp(rows, 'lernzeit', 'outlier', 40, k), 'lernzeit'), y: Y });
    lo = Math.min(lo, f.sse - s.sse); hi = Math.max(hi, f.sse - s.sse); dlo = Math.min(dlo, f.b1! - s.b1!); dhi = Math.max(dhi, f.b1! - s.b1!);
  }
  assert.ok(close(lo, 9.116845, 1e-5) && close(hi, 405.4752, 1e-3), `SSE nach dem Ausreißer: ${lo} bis ${hi}`);
  assert.ok(close(dlo, -0.2937661, 1e-7) && close(dhi, -0.09798981, 1e-7), `b₁ nach dem Ausreißer: ${dlo} bis ${dhi}`);
  // Texte der Brücke mit diesen Zahlen
  const c = bridgeContext(gerade.compute, 'pairs', rows, 'lernzeit', 'wissenstest', 1);
  assert.equal(bridgeGerade.lines[2].all(c), 'b₀ = 10,13 − 0,52 · 7,75 ≈ 6,1. So geht die Gerade durch den Punkt der beiden Mitten.');
  assert.equal(bridgeGerade.lines[5].all(c), 'Die 200 Quadrate ergeben Σeᵢ² ≈ 1.370,27. Den größten Beitrag liefert P136 mit e ≈ +7,52.');
  assert.equal(bridgeGerade.interpret(c, 'residuals').zusatz, '136 von 200 Befragten liegen höchstens 2,63 Aufgaben von der Geraden entfernt.');
  assert.match(bridgeGerade.interpret(c, 'linear_regression').kurz, /^Wer eine Stunde mehr gelernt hat, löst laut Gerade im Schnitt 0,52 Aufgaben mehr\./);
  assert.match(bridgeGerade.interpret(c, 'prediction').kurz, /P002 mit 8,3 Stunden Lernzeit sagt die Gerade 10,41 gelöste Aufgaben voraus/);
});

test('B13 Gerade: Leitaufruf mit Lernzeit und Alter wie in R', () => {
  const m = ols([X, A], Y)!;
  assert.ok(close(m.b[0], 5.822370021838, 1e-9) && close(m.b[1], 0.517959761657, 1e-9) && close(m.b[2], 0.006112726002, 1e-9), `Koeffizienten ${m.b}`);
  assert.ok(close(m.sse, 1368.215, 1e-3) && close(Math.sqrt(m.sse / 197), 2.635385, 1e-6), 'SSE und Standardfehler der Schätzung');
  assert.ok(close(m.yhat[0], 9.180750358, 1e-8), 'Vorhersage P001');
  assert.deepEqual([X[0], A[0], Y[0]], [6, 41, 12], 'P001: 6 Stunden, 41 Jahre, 12 Aufgaben');
});

test('B13 R²: Quadratsummen und Anteile wie in R', () => {
  const s = fitLine({ x: X, y: Y });
  assert.ok(close(s.r2!, 0.2907031, 1e-7), `R² ${s.r2}`);
  assert.deepEqual([QS.sst, QS.sse], [1931.875, 1370.273], 'Quadratsummen der Lernzeit-Geraden');
  assert.ok(close(s.sst, QS.sst, 1e-3) && close(s.sse, QS.sse, 1e-3), 'aus den Daten');
  assert.ok(close(ols([X, A], Y)!.sse, QS.sse2, 1e-3), 'SSE mit Lernzeit und Alter');
  assert.ok(close(ols([X, A], Y)!.r2, 0.2917683, 1e-7), 'R² mit Alter');
  assert.ok(close(ols([X, A], Y)!.r2 - s.r2!, 0.0010652, 1e-6), 'R² wächst um gut 0,001');
  assert.ok(close(QS.sst - QS.sse, 561.602, 1e-6), 'SSR');
  const st = erklaerteVarianz.compute(erklaerteVarianz.initial);
  assert.match(erklaerteVarianz.interpret(st).kurz, /^Die Gerade erfasst 29 % der Streuung\. 71 % bleiben/);
  assert.match(erklaerteVarianz.interpret(st).fachlich, /r ≈ 0,54, und 0,54 · 0,54 ≈ 0,29/);
  const sample = erklaerteVarianzTabs.sample!;
  if (sample.kind === 'analysis') assert.match(sample.result({ rows, columns: { x: ['lernzeit'], y: ['wissenstest'] } }).fachlich, /R² = 1 − 1\.370,27 \/ 1\.931,88 ≈ 0,29\. Das ist das Quadrat der Pearson-Korrelation r ≈ 0,54/);
});

test('B13 Interaktion: Modell mit Produkt wie in R', () => {
  const m = interactionFor({ rows, columns: {} })!;
  [IA.b0, IA.b1, IA.b2, IA.b3].forEach((b, k) => assert.ok(close(m.b[k], b, 1e-9), `b${k}: ${m.b[k]} statt ${b}`));
  assert.deepEqual([m.n1, m.n0], [82, 118], 'Gruppengrößen');
  assert.ok(close(IA.b1 + IA.b3, 0.5721775, 1e-7) && close(IA.b0 + IA.b2, 5.577153, 1e-6), 'Gerade mit Weiterbildung');
  assert.deepEqual([X[0], sampleColumn(rows, 'weiterbildung')[0]], [6, 1], 'P001: 6 Stunden, Weiterbildung');
  assert.match(interaktion.stellDirVor.text, /um 0,48 Aufgaben je Stunde, mit Weiterbildung um 0,48 \+ 0,09 = 0,57/);
  // Regler: 0,48 + v rundet für jeden Schritt wie die Summe der angezeigten Zahlen.
  for (let v = -0.5; v <= 0.5 + 1e-9; v += 0.01) assert.equal(Math.round((IA.b1 + v) * 100), Math.round(IA.b1 * 100) + Math.round(v * 100), `Regler ${v}`);
  const doubled = interactionFor({ rows: applyOp(rows, 'lernzeit', 'double'), columns: {} })!;
  assert.ok(close(doubled.b[3], IA.b3 / 2, 1e-9), 'verdoppelte Lernzeit halbiert b₃');
  const sample = interaktionTabs.sample!;
  if (sample.kind === 'analysis') assert.match(sample.result({ rows, columns: { x: ['lernzeit'], y: ['wissenstest'], group: ['weiterbildung'] } }).kurz, /je Stunde 0,48 Aufgaben mehr voraus, mit Weiterbildung 0,57 Aufgaben mehr\. Der Unterschied b₃ beträgt 0,09/);
});

test('B13 Logit: Anteil, Odds und Logit der Weiterbildung wie in R', () => {
  const s = shareFor(rows, 'weiterbildung');
  assert.deepEqual([s.k, s.n], [82, 200], 'Anzahlen');
  assert.ok(close(s.odds, 0.6949153, 1e-7) && close(s.logit, -0.3639654, 1e-7), 'Odds und Logit');
  const st = logitSatz.compute(logitSatz.initial);
  assert.ok(close(st.logit, s.logit, 1e-12), 'Formel als Satz startet bei den Daten');
  assert.match(logitSatz.worked(st)[2].text, /ln\(0,69\) ≈ −0,36 \(mit allen Nachkommastellen\)/, 'Rundung angesagt');
  assert.match(logitSatz.interpret(st).kurz, /Auf 100 Nein-Fälle kommen etwa 69 Ja-Fälle\. Der Logit ist −0,36, negativ/);
  assert.ok(close(1 / (1 + Math.exp(0.36)), 0.41, 0.005), 'zurück zu 0,41');
  const t = logitTabs.sample!;
  if (t.kind === 'analysis') assert.match(t.result({ rows, columns: { x: ['weiterbildung'] } }).fachlich, /Odds = 82 \/ 118 ≈ 0,69, logit = ln\(82 \/ 118\) ≈ −0,36/);
});

test('B13 Likelihood: Log-Likelihood und Modellvergleich wie in R', () => {
  assert.ok(close(llWb(0.41), -135.3717, 1e-4) && close(llWb(0.5), -138.6294, 1e-4) && close(llWb(0.9), -280.3446, 1e-4), 'ℓ bei 0,41, 0,5, 0,9');
  assert.ok(close(82 * Math.log(0.41), -73.11, 0.005) && close(118 * Math.log(0.59), -62.26, 0.005), 'die beiden Summanden');
  assert.equal(Math.round(Math.exp(llWb(0.41) - llWb(0.5))), 26, 'etwa 26-mal');
  let best = 0.05;
  for (let p = 0.05; p <= 0.95; p += 0.001) if (llWb(p) > llWb(best)) best = p;
  assert.ok(close(best, 0.41, 0.001), `Maximum bei ${best}`);
  const m = wbModel({ rows, columns: {} })!;
  [WB_MODELL.b0, WB_MODELL.b1, WB_MODELL.b2].forEach((b, k) => assert.ok(close(m.b[k], b, 1e-8), `b${k}: ${m.b[k]}`));
  assert.ok(close(m.dev, WB_MODELL.dev, 1e-4) && close(m.nullDev, WB_MODELL.nullDev, 1e-4), 'Devianzen');
  assert.ok(close(m.chi2, 0.6798, 1e-4), 'Chi-Quadrat');
  assert.ok(close(m.ame, WB_MODELL.ameX, 1e-8), `AME ${m.ame}`);
  assert.ok(close(Math.min(...m.p), 0.3543686, 1e-6) && close(Math.max(...m.p), 0.4644712, 1e-6), 'Spanne der Wahrscheinlichkeiten');
  assert.match(likelihoodKarte.stellDirVor.text, /−135,37, bei p = 0,9 nur −280,34/);
  assert.match(likelihoodKarte.bausteine[3].rechnung!, /270,74 − 270,06 = 0,68/);
  assert.match(likelihoodKarte.ausprobieren[0].explain, /nur etwa ein 26stel so wahrscheinlich wie unter 0,41/);
});

test('B13 Logistische Regression: S-Kurve und Katalogmodell wie in R', () => {
  const pass = Y.map(v => v >= 10 ? 1 : 0);
  assert.equal(pass.filter(v => v === 1).length, BESTANDEN.k, '122 schaffen mindestens 10 Aufgaben');
  const m = logistic([X], pass)!;
  assert.ok(close(m.b[0], BESTANDEN.b0, 1e-8) && close(m.b[1], BESTANDEN.b1, 1e-8), `Koeffizienten ${m.b}`);
  assert.ok(close(m.deviance, BESTANDEN.dev, 1e-4), 'Devianz');
  ([[4, 0.3316507], [6, 0.4926246], [7, 0.5759351], [8, 0.6551424], [12, 0.879125], [15, 0.9521662], [16, 0.9653308], [17, 0.9749676], [40, 0.9999886]] as const)
    .forEach(([h, p]) => assert.ok(close(pBestanden(h), p, 1e-6), `p bei ${h} h`));
  assert.ok(close(Math.exp(BESTANDEN.b1), 1.398797, 1e-6) && close(-BESTANDEN.b0 / BESTANDEN.b1, 6.08791, 1e-5), 'Odds Ratio und 50-%-Stelle');
  assert.match(logistischeRegression.stellDirVor.text, /−2,04 \+ 0,34 · Lernzeit\. Bei 4 Stunden Lernzeit sagt das Modell eine Wahrscheinlichkeit von 33 % vorher, bei 8 Stunden 66 %, bei 12 Stunden 88 %/);
  assert.match(logistischeRegression.bausteine[1].rechnung!, /e\^\(−1,98\)\) ≈ 0,88/);
  assert.match(logistischeRegression.ausprobieren[0].explain, /von 49 % auf 58 %, von 15 auf 16 Stunden nur von 95 % auf 97 %/);
  assert.ok(close(1.4 * 1.4, 1.96, 1e-9) && close(Math.exp(2 * BESTANDEN.b1), 1.96, 0.005), 'zwei Stunden: 1,96');
  const t = logistischeRegressionTabs.sample!;
  if (t.kind === 'analysis') {
    const r = t.result({ rows, columns: { x: ['lernzeit'], y: ['weiterbildung'] } });
    assert.match(r.kurz, /mit 0,99 malgenommen, bei gleichem Alter\. Sie ändern sich also so gut wie gar nicht/);
    // Kleine Koeffizienten mit zwei gültigen Ziffern (AUTHORING 2a), gerundet wie R sie druckt (−0.006, −0.007).
    assert.match(r.fachlich, /0,01 − 0,006 · Lernzeit − 0,007 · Alter\. Die Odds Ratio der Lernzeit ist e\^b₁ ≈ 0,994/);
    assert.match(r.zusatz!, /von 0,35 bis 0,46/);
  }
});

test('B13 Marginale Effekte: Formel, Beispiel und AME wie in R', () => {
  const s = marginaleEffekte.compute(marginaleEffekte.initial);
  assert.ok(close(s.me, 0.076296, 1e-6), `ME ${s.me}`);
  assert.match(marginaleEffekte.interpret(s).kurz, /um etwa 7,6 Prozentpunkte\. In der Mitte, bei p = 0,5, wären es 8,5 Prozentpunkte/);
  assert.ok(close(pBestanden(8), 0.66, 0.005) && close(BESTANDEN.b1, 0.34, 0.005), 'Startwerte gerundet aus R');
  assert.match(marginaleEffekte.genau.paragraphs[0], /je Stunde im Schnitt 6,5 Prozentpunkte/);
  assert.match(marginaleEffekte.genau.paragraphs[1], /b ≈ 0,34 sind das, mit allen Nachkommastellen gerechnet, 8,4 Prozentpunkte/);
  const pass = Y.map(v => v >= 10 ? 1 : 0), m = logistic([X], pass)!;
  assert.ok(close(m.p.reduce((a, p) => a + m.b[1] * p * (1 - p), 0) / 200, BESTANDEN.ame, 1e-7), 'AME bestanden wie R');
  const t = marginaleEffekteTabs.sample!;
  if (t.kind === 'analysis') {
    const r = t.result({ rows, columns: { x: ['lernzeit'], y: ['weiterbildung'] } });
    assert.match(r.kurz, /im Schnitt um −0,14 Prozentpunkte, bei gleichem Alter\. Das ist so gut wie nichts/);
    // R: AME −0.001436868, b₁ −0.005960168, |b₁| / 4 = 0.001490042; zwei gültige Ziffern.
    assert.match(r.fachlich, /≈ −0,0014, mit b₁ ≈ −0,006\.$/);
    assert.match(r.zusatz!, /\|b₁\| \/ 4 ≈ 0,0015 kann/);
  }
});

test('B13 Ausreißer und Einfluss: Hebel, Cooks Distanz und Steigungen wie in R', () => {
  const inf = influence({ x: X, y: Y });
  assert.equal(rows[P175].id, 'P175'); assert.equal(rows[P008].id, 'P008');
  assert.deepEqual([X[P175], Y[P175], X[P008], Y[P008], X[20], Y[20]], [18.4, 17, 7.8, 13, 1.6, 0], 'P175, P008, P021');
  assert.ok(close(inf.cook[20], 0.08421977, 1e-7) && inf.cook.indexOf(Math.max(...inf.cook)) === 20, 'größte Cooks Distanz P021');
  assert.equal(inf.cook.filter(d => d > 0.02).length, 9, 'über 4 / n');
  assert.ok(close(inf.h[P175], 0.05936259, 1e-8) && close(inf.cook[P175], 0.008828791, 1e-8), 'P175');
  assert.ok(close(inf.cook[135], 0.0237967, 1e-7) && close(inf.h[135], 0.005750905, 1e-8), 'P136');
  ([[0, 0.432103, 0.891998], [10, 0.483154, 0.130249], [17, 0.518891, 0.008829], [20, 0.534206, 0.083342]] as const)
    .forEach(([v, b, d]) => { const w = withScore(P175, v); assert.ok(close(w.b1, b, 1e-6) && close(w.cook, d, 1e-6), `P175 auf ${v}`); });
  assert.ok(close(withScore(P008, 0).b1, 0.5185885, 1e-7), 'P008 auf 0');
  assert.ok(close(withScore(P175, 17).e, 1.349592, 1e-6), 'Residuum P175');
  assert.ok(close(fitLine({ x: X.filter((_, i) => i !== 20), y: Y.filter((_, i) => i !== 20) }).b1!, 0.4979594, 1e-7), 'ohne P021');
  assert.ok(close(fitLine({ x: X.filter((_, i) => i !== P175), y: Y.filter((_, i) => i !== P175) }).b1!, 0.511566, 1e-6), 'ohne P175');
  assert.ok(close(0.005 + (18.4 - 7.75) ** 2 / 2085.82, 0.06, 0.005), 'Hebel mit den sichtbaren Zahlen');
  assert.match(ausreisser.stellDirVor.text, /fiele die Steigung von 0,52 auf 0,43 Aufgaben je Stunde\. .* bleibt die Steigung bei 0,52/);
  assert.match(ausreisser.regler!.describe(17), /Cooks Distanz von P175: 0,009, unter der Faustregel/);
  assert.match(ausreisser.ausprobieren[0].explain, /auf 0,43 Aufgaben je Stunde\. .* Cooks Distanz steigt auf 0,89/);
  const t = ausreisserTabs.sample!;
  if (t.kind === 'analysis') {
    const r = t.result({ rows, columns: { x: ['lernzeit'], y: ['wissenstest'] } });
    assert.match(r.kurz, /P021 mit 1,6 Stunden und 0 Aufgaben\. Ohne diese Person läge die Steigung bei 0,5 statt 0,52/);
    assert.match(r.fachlich, /Dᵢ ≈ 0,084\. Nach der Faustregel 4 \/ n = 0,02 sind 9 von 200/);
    assert.match(r.zusatz!, /P175 mit 18,4 Stunden Lernzeit: hᵢ ≈ 0,059/);
  }
});

test('B13 Multikollinearität: VIF wie in R', () => {
  const v = vifFor({ rows, columns: {} })!;
  assert.ok(close(v.r, 0.02962693, 1e-7) && close(v.vif, 1.000879, 1e-6), `r ${v.r}, VIF ${v.vif}`);
  const W = sampleColumn(rows, 'weiterbildung'), P = X.map((x, i) => x * W[i]);
  const vifCol = (cols: number[][], j: number) => 1 / (1 - ols(cols.filter((_, k) => k !== j), cols[j])!.r2);
  ([[0, 1.674551], [1, 6.774332], [2, 7.404867]] as const).forEach(([j, val]) => assert.ok(close(vifCol([X, W, P], j), val, 1e-5), `VIF ${j}`));
  assert.ok(close(1 - 1 / vifCol([X, W, P], 2), 0.8649537, 1e-6), 'R² des Produkts');
  const mx = X.reduce((a, b) => a + b, 0) / 200, Xc = X.map(x => x - mx), Pc = Xc.map((x, i) => x * W[i]);
  ([[1, 1.000141], [2, 1.674523]] as const).forEach(([j, val]) => assert.ok(close(vifCol([Xc, W, Pc], j), val, 1e-5), `zentriert VIF ${j}`));
  assert.ok(close(vifOf(0.9), 5.263158, 1e-6) && close(Math.sqrt(vifOf(0.9)), 2.294157, 1e-6), 'r = 0,9');
  assert.ok(close(1 / (1 - 0.865), 7.4, 0.05) && close(Math.sqrt(7.4), 2.7, 0.03), 'Rechnung mit sichtbaren Zahlen');
  assert.match(multikollinearitaet.regler!.describe(0.9), /VIF 5,26\. Der Standardfehler jedes der beiden Koeffizienten ist dann 2,29-mal so groß/);
  const t = multikollinearitaetTabs.sample!;
  if (t.kind === 'analysis') assert.match(t.result({ rows, columns: { x: ['lernzeit'], y: ['alter'] } }).kurz, /r = 0,03\. Beide bekommen den VIF 1,00: Ihre Beiträge lassen sich sauber trennen/);
});

const OVERFIT = [[0.291157, 0.288101], [0.305721, 0.256309], [0.326673, 0.253099], [0.344673, 0.255398], [0.364397, 0.267944], [0.380788, 0.255907], [0.381114, 0.253752],
  [0.386346, 0.277955], [0.428101, 0.218964], [0.428260, 0.217087], [0.432388, 0.193012], [0.436748, 0.179242], [0.441077, 0.157880], [0.443681, 0.150344],
  [0.451236, 0.107570], [0.455557, 0.098851], [0.456187, 0.098153], [0.457717, 0.090215], [0.459595, 0.082830], [0.459789, 0.080803]];

test('B13 Überanpassung: Training und Test für 1 bis 20 Prädiktoren wie in R', () => {
  const t = baseTable();
  OVERFIT.forEach(([tr, te], k) => assert.ok(close(t[k].train, tr, 1e-6) && close(t[k].test, te, 1e-6), `${k + 1} Prädiktoren: ${t[k].train} / ${t[k].test}`));
  assert.match(ueberanpassung.stellDirVor.text, /erfasst das Modell 29 % der Streuung bei den ersten 100 Befragten und 29 % bei den neuen\. Mit 20 Prädiktoren sind es 46 % bei den ersten 100, bei den neuen nur noch 8 %/);
  assert.match(ueberanpassung.bausteine[1].rechnung!, /0,29 mit 1 Prädiktor, 0,38 mit 6, 0,46 mit 20/);
  assert.match(ueberanpassung.bausteine[2].rechnung!, /0,29 mit 1 Prädiktor, 0,26 mit 6, 0,08 mit 20/);
  assert.match(ueberanpassung.regler!.describe(20), /46 % der Streuung, bei den 100 Testpersonen 8 %\. Die Lücke .* „Kurszuversicht, nachher“/);
  assert.equal(trainTest(rows, 1)!.train, t[0].train);
  const s = ueberanpassungTabs.sample!;
  if (s.kind === 'analysis') assert.match(s.result({ rows, columns: { x: ['lernzeit'], y: ['wissenstest'] } }).kurz, /R² 0,29 im Training und 0,29 im Test\. Mit 20 Prädiktoren: 0,46 im Training, aber nur 0,08 im Test/);
});

test('B13 Fixrunde 1: Zahlen der geänderten Texte wie in R', () => {
  // I1: P136 ist über 4 / n, kippt die Gerade aber kaum.
  const inf = influence({ x: X, y: Y });
  assert.ok(inf.cook[135] > 0.02 && close(withoutP136(), 0.52343154, 1e-7), 'P136');
  assert.deepEqual(inf.cook.map((d, i) => d > 0.02 ? i + 1 : 0).filter(Boolean), [20, 21, 57, 113, 114, 136, 143, 158, 172], 'auffällige Befragte wie in R');
  assert.match(ausreisser.bausteine[0].acht, /Ohne sie bliebe die Steigung bei 0,52\. Ihre Cooks Distanz von 0,024 liegt nur knapp über der Faustregel 4 \/ n = 0,02/);
  // I3: kleine Steigungen in der Brücke mit gültigen Ziffern (Einkommen als x).
  const c = bridgeContext(gerade.compute, 'pairs', rows, 'einkommen', 'wissenstest', 0);
  for (const k of [2, 3]) assert.doesNotMatch(bridgeGerade.lines[k].person(c) + bridgeGerade.lines[k].all(c), / 0 · /, `Schritt ${k + 1}: b₁ als 0`);
  assert.match(bridgeGerade.lines[3].person(c), /\+ 0,000\d+ · /, 'b₁ mit gültigen Ziffern');
  // Deferred minor: drei gültige Ziffern nur in den Rechnungen der Brücke, in Aussagen und Kennzahlen zwei (AUTHORING 2a).
  assert.match(bridgeGerade.lines[3].person(c), /\+ 0,000366 · /, 'Rechnung mit drei gültigen Ziffern');
  assert.match(bridgeGerade.interpret(c, 'linear_regression').kurz, /im Schnitt 0,00037 Aufgaben höher/, 'Aussage mit zwei gültigen Ziffern');
  assert.equal(bridgeGerade.metrics(c, 'linear_regression').at(-1)!.value, '0,00037', 'Kennzahl b₁');
  // I5: plausible Werte für b₃ aus der Katalogausgabe.
  assert.match(interaktion.bausteine[2].acht, /von −0,14 bis 0,32/);
  assert.ok(close(-0.142541, -0.14, 0.005) && close(0.322084, 0.32, 0.005), 'Intervall gerundet');
  // M2: sichtbare Rechnung für P001 im Leitaufruf.
  assert.ok(close(5.82 + 0.52 * 6 + 0.006 * 41, 9.19, 0.005), '9,19 mit den sichtbaren Zahlen');
  // M4: Korrelationen der übrigen Prädiktoren mit dem Wissenstest.
  const rs = ['alter', 'schlafdauer', 'einkommen', 'haushaltsgroesse', 'arbeitsstunden', 'lernplanung5', 'lernzuversicht7', 'statistikinteresse10', 'finanzlage', 'methoden1', 'methoden2', 'methoden3', 'methoden4', 'methoden5', 'schulabschluss', 'erwerbstaetig', 'weiterbildung', 'kurs_vor', 'kurs_nach']
    .map(v => fitLine({ x: sampleColumn(rows, v), y: Y }).r2! ** 0.5 * Math.sign(fitLine({ x: sampleColumn(rows, v), y: Y }).b1!));
  assert.ok(close(Math.min(...rs), -0.1699, 1e-4) && close(Math.max(...rs), 0.2457, 1e-4), `r zwischen ${Math.min(...rs)} und ${Math.max(...rs)}`);
  // M1: marginale Effekte mit zwei Nachkommastellen und Hinweis.
  assert.match(marginaleEffekte.worked(marginaleEffekte.compute(marginaleEffekte.initial))[1].text, /0,34 · 0,22 ≈ 0,076; R rechnet mit allen Nachkommastellen/);
});
