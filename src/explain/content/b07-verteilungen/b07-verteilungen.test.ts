import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { applyOp } from '../../sample';
import type { SampleCtx } from '../../types';
import { columnStats, skewness, within } from './dist';
import { ALTER_WITHIN1, EINKOMMEN_SKEW, SCHLAF, inside, normalverteilung, normalTabs, schlafFit } from './normal';

/*
 * Referenzwerte des Bereichs B7, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas, Knopf „SPSS-Datei (.sav)“, oder writeSav(createSurvey())):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 */
const rows = createSurvey();
const ok = (mine: number, r: number, what: string, tol = 1e-6) => assert.ok(close(mine, r, tol), `${what}: ${mine} ≠ R ${r}`);

/*
 * Normalverteilung: Schlafdauer
 *   x <- as.numeric(atlas$schlafdauer); m <- mean(x); s <- sd(x)                 # 7.0825, 0.8197584
 *   sapply(c(0.5, 1, 1.5, 2, 2.5, 3), function(k) sum(abs(x - m) <= k * s))     # 72 140 176 191 199 200
 *   2 * pnorm(c(1, 2)) - 1                                                       # 0.6826895 0.9544997
 *   m + c(-1, 1) * s; m + c(-2, 2) * s                                           # 6.262742 7.902258; 5.442983 8.722017
 *   sum(x < m - 2 * s); pnorm(-2) * 200                                          # 6; 4.550026
 *   y <- as.numeric(atlas$alter); sum(abs(y - mean(y)) <= sd(y))                 # 119
 *   atlas %>% describe(schlafdauer, einkommen, show = "skew")                    # Skewness -0.058, 0.792
 *   skew <- function(x) { n <- length(x); d <- x - mean(x); mean(d^3) / mean(d^2)^1.5 * sqrt(n * (n - 1)) / (n - 2) }
 *   skew(x); skew(as.numeric(atlas$einkommen))                                   # -0.05780177 0.7915222
 *   sapply(1:200, function(i) { xx <- x; xx[i] <- 14; skew(xx) - skew(x) })      # +1.84 bis +1.92 (danach 1.78 bis 1.86)
 *   sapply(1:200, function(i) { xx <- x + 0.5; xx[i] <- 14; skew(xx) - skew(x + 0.5) })   # mindestens +1.54
 *   atlas %>% normality_test(schlafdauer)     # KS = 0.051, p = 0.238; Shapiro-Wilk W = 0.994, p = 0.660 (n = 200)
 */
test('B7 Normalverteilung: Schlafdauer, Flächen und Schiefe wie in R', () => {
  const s = columnStats(rows, 'schlafdauer');
  ok(s.mean, 7.0825, 'Mittelwert'); ok(s.sd, 0.8197584, 'Standardabweichung'); ok(SCHLAF.mean, s.mean, 'SCHLAF.mean'); ok(SCHLAF.sd, s.sd, 'SCHLAF.sd');
  assert.deepEqual([0.5, 1, 1.5, 2, 2.5, 3].map(k => within(s.xs, s.mean, s.sd, k)), [72, 140, 176, 191, 199, 200], 'Zahl innerhalb k · s wie in R');
  assert.equal(SCHLAF.within1, 140, 'innerhalb 1 s'); assert.equal(SCHLAF.within2, 191, 'innerhalb 2 s');
  assert.equal(s.xs.filter(x => x < s.mean - 2 * s.sd).length, SCHLAF.below2, 'unter x̄ − 2s');
  ok(inside(1), 0.6826895, 'Modell 1 s'); ok(inside(2), 0.9544997, 'Modell 2 s');
  const alter = columnStats(rows, 'alter');
  assert.equal(within(alter.xs, alter.mean, alter.sd, 1), ALTER_WITHIN1, 'Alter innerhalb 1 s');
  ok(skewness(s.xs), -0.05780177, 'Schiefe Schlafdauer'); ok(SCHLAF.skew, skewness(s.xs), 'SCHLAF.skew');
  ok(skewness(columnStats(rows, 'einkommen').xs), 0.7915222, 'Schiefe Einkommen'); ok(EINKOMMEN_SKEW, 0.7915222, 'EINKOMMEN_SKEW');
  // Ausreißer 14 Stunden: Schiefe steigt für jede Person um mehr als 1, auf etwa 1,8 (Text der Vorhersage).
  const after = rows.map((_, i) => skewness(columnStats(applyOp(rows, 'schlafdauer', 'outlier', 14, i), 'schlafdauer').xs));
  assert.ok(Math.min(...after) > 1.77 && Math.max(...after) < 1.87, `Schiefe nach Ausreißer ${Math.min(...after)} bis ${Math.max(...after)}`);
  // Texte mit den Zahlen aus R
  assert.match(normalverteilung.stellDirVor.text, /im Schnitt 7,08 Stunden .* 0,82 Stunden\. 140 von ihnen .* zwischen 6,26 und 7,9 Stunden\. .* 68 % voraus, also etwa 137 von 200\./);
  assert.match(normalverteilung.bausteine[2].rechnung!, /6,26 bis 7,9 Stunden, im Modell 68,3 %, in den Daten 140 von 200 \(70 %\)\. .* 5,44 bis 8,72 Stunden, im Modell 95,4 %, in den Daten 191 von 200\./);
  assert.match(normalverteilung.bausteine[3].rechnung!, /Schiefe −0,06.*Schiefe 0,79/);
  assert.match(normalverteilung.ausprobieren[2].explain, /2,3 % von 200 sind etwa 5\. In den Daten sind es 6\./);
  assert.equal(normalverteilung.regler!.describe(1), 'Im Modell liegen 68,3 % zwischen 6,26 und 7,9 Stunden. Bei den 200 Befragten sind es 140, also 70 %.');
  assert.equal(normalverteilung.regler!.describe(2), 'Im Modell liegen 95,4 % zwischen 5,44 und 8,72 Stunden. Bei den 200 Befragten sind es 191, also 95,5 %.');
  const ctx: SampleCtx = { rows, columns: { x: ['schlafdauer'] } };
  const f = schlafFit(ctx);
  assert.deepEqual([f.k1, f.k2], [140, 191]);
  if (normalTabs.sample?.kind === 'analysis') assert.match(normalTabs.sample.result(ctx).kurz, /7,08 Stunden .* 0,82 Stunden\. 140 von 200 .* etwa 137 voraus\. Die Schiefe ist −0,06;/);
});

/*
 * Standardnormalverteilung: 5,5 Stunden Schlaf bei μ = 7,08 und σ = 0,82 (x̄ und s der 200, gerundet)
 *   (5.5 - 7.08) / 0.82; pnorm(-1.93)                                         # -1.926829; 0.02680342
 *   sum(x <= 5.5)                                                            # 7
 *   pnorm(-2); qnorm(0.975); qnorm(0.995); pnorm(2)                          # 0.02275013 1.959964 2.575829 0.9772499
 *   z <- (x - mean(x)) / sd(x); sum(abs(z) > 1.96); max(z); min(z)          # 10; 2.94904; -2.418396
 *   atlas$id[which.max(z)]                                                   # P181 (9,5 Stunden)
 *   mean(x) + c(-1.96, 1.96) * sd(x)                                        # 5.475794 8.689206
 *   sapply(1:200, function(i) { xx <- x; xx[i] <- 14; max(scale(xx)) })     # 7.210069 bis 7.339311
 *   sapply(1:200, function(i) { xx <- x + 0.5; xx[i] <- 14; max(scale(xx)) })   # mindestens 6.814707
 *   atlas %>% std(lernzeit, method = "sd", suffix = "_z") %>% describe(lernzeit, lernzeit_z, show = c("mean", "sd"))
 *                                                                            # lernzeit 7.752 3.238; lernzeit_z 0.000 1.000
 *   atlas %>% std(lernzeit, method = "SD")   # Fehler: 'arg' sollte eines von '“sd”, “2sd”, “mad”, “gmd”' sein
 */
test('B7 Standardnormalverteilung: z, Fläche und die z-Werte der 200 wie in R', async () => {
  const { standardnormal, standardTabs, zFit, Z_START } = await import('./standard-normal');
  const s = standardnormal.compute(Z_START);
  ok(s.z, -1.926829, 'z'); assert.equal(s.zr, -1.93); ok(s.area, 0.02680342, 'Φ(−1,93)'); assert.equal(s.count, 7, 'höchstens 5,5 h');
  assert.match(standardnormal.interpret(s).kurz, /^Laut Modell schlafen etwa 2,7 % der Menschen höchstens 5,5 Stunden pro Nacht\. 5,5 Stunden liegen 1,93 Standardabweichungen unter der Mitte\. Bei den 200 Befragten sind es 7 von 200\.$/);
  assert.equal(standardnormal.worked(s)[1].text, '(−1,58) / 0,82 ≈ −1,93. Das sind 1,93 Standardabweichungen unter der Mitte.');
  const two = standardnormal.compute(standardnormal.quick[0].apply(Z_START));
  assert.deepEqual([two.x, two.zr], [8.72, 2]); ok(two.area, 0.9772499, 'Φ(2)');
  assert.match(standardnormal.fehler, /Φ\(−2\) ≈ 2,3 %/);
  const f = zFit({ rows, columns: { x: ['schlafdauer'] } });
  assert.equal(f.outside, 10); ok(f.zmax, 2.94904, 'größter z-Wert', 1e-5); ok(f.zmin, -2.418396, 'kleinster z-Wert', 1e-5); assert.equal(f.who, 'P181');
  const after = rows.map((_, i) => zFit({ rows: applyOp(rows, 'schlafdauer', 'outlier', 14, i), columns: { x: ['schlafdauer'] } }).zmax);
  assert.ok(Math.min(...after) > 7.21 && Math.max(...after) < 7.34, 'größter z-Wert nach dem Ausreißer über 7');
  if (standardTabs.sample?.kind === 'analysis') {
    const r = standardTabs.sample.result({ rows, columns: { x: ['schlafdauer'] } });
    assert.match(r.kurz, /10 von 200 liegen weiter als 1,96 .* also 10\. Der größte z-Wert ist 2,95\./);
    assert.match(r.zusatz!, /Zwischen 5,48 und 8,69 Stunden liegen 190 von 200 Befragten\./);
  }
});
