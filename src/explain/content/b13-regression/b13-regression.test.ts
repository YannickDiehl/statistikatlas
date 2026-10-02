import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { applyOp, bridgeContext, sampleColumn } from '../../sample';
import { close } from '../../format';
import { txt } from '../../types';
import { fitLine, ols } from './fit';
import { gerade, bridgeGerade, BEISPIEL, AUSREISSER } from './gerade';

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
  assert.match(bridgeGerade.interpret(c, 'linear_regression').kurz, /^Wer eine Stunde länger lernt, löst laut Gerade im Schnitt 0,52 Aufgaben mehr\./);
  assert.match(bridgeGerade.interpret(c, 'prediction').kurz, /P002 mit 8,3 Stunden Lernzeit sagt die Gerade 10,41 gelöste Aufgaben voraus/);
});

test('B13 Gerade: Leitaufruf mit Lernzeit und Alter wie in R', () => {
  const m = ols([X, A], Y)!;
  assert.ok(close(m.b[0], 5.822370021838, 1e-9) && close(m.b[1], 0.517959761657, 1e-9) && close(m.b[2], 0.006112726002, 1e-9), `Koeffizienten ${m.b}`);
  assert.ok(close(m.sse, 1368.215, 1e-3) && close(Math.sqrt(m.sse / 197), 2.635385, 1e-6), 'SSE und Standardfehler der Schätzung');
  assert.ok(close(m.yhat[0], 9.180750358, 1e-8), 'Vorhersage P001');
  assert.deepEqual([X[0], A[0], Y[0]], [6, 41, 12], 'P001: 6 Stunden, 41 Jahre, 12 Aufgaben');
});
