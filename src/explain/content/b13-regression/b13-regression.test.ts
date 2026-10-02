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
import { WB_MODELL, wbModel } from './logistisch-kit';

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
  assert.match(likelihoodKarte.ausprobieren[0].explain, /etwa 26-mal weniger wahrscheinlich/);
});
