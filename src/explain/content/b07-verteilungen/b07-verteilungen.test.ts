import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { applyOp } from '../../sample';
import type { SampleCtx } from '../../types';
import { skewness, within } from './dist';
import { tTest } from '../../../tasks/kit/means';
import { ALTER_WITHIN1, EINKOMMEN_SKEW, SCHLAF, inside, normalverteilung, normalTabs, schlafFit, series as columnStats } from './normal';

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
 *   mean(x) + c(-1.96, 1.96) * sd(x)                                        # 5.475774 8.689226
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
  assert.match(standardnormal.interpret(s).kurz, /^Laut Modell liegen etwa 2,7 % der Schlafdauern bei höchstens 5,5 Stunden pro Nacht\. 5,5 Stunden liegen 1,93 Standardabweichungen unter der Mitte\. Bei den 200 Befragten sind es 7 von 200\.$/);
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

/*
 * t-Verteilung: Schlafdauer gegen 7 Stunden
 *   tt <- t.test(x, mu = 7); tt$statistic; tt$parameter; tt$p.value; tt$stderr   # 1.423256 199 0.1562278 0.05796567
 *   (mean(x) - 7) * 60; tt$stderr * 60; 2 * pnorm(-1.423256)                     # 4.95 3.47794 0.1546619
 *   atlas %>% t_test(schlafdauer, mu = 7, alternative = "two.sided")             # t(199) = 1.423, p = 0.156, N = 200
 *   atlas %>% t_test(schlafdauer)                                                # t(199) = 122.184 (ohne mu: gegen 0)
 *   qt(0.975, c(1, 4, 9, 28, 30, 199))       # 12.706205 2.776445 2.262157 2.048407 2.042272 1.971957
 *   2 * pt(-1.423256, c(4, 199)); 2 * pt(-2.5, 4)                               # 0.2278 0.1563; 0.06676654
 *   t.test(x + 0.5, mu = 7)$statistic; t.test(x - 0.5, mu = 7)$statistic        # 10.04906 -7.202539
 */
test('B7 t-Verteilung: t-Test der Schlafdauer gegen 7 Stunden und Grenzen wie in R', async () => {
  const { SCHLAF_T, tCrit, tFit, tTabs, tVerteilung } = await import('./t');
  const ctx: SampleCtx = { rows, columns: { x: ['schlafdauer'] } }, f = tFit(ctx);
  ok(f.t, 1.423256, 't'); assert.equal(f.df, 199); ok(f.p, 0.1562278, 'p'); ok(f.pz, 0.1546619, 'p normal'); ok(f.se * 60, 3.47794, 'SE in Minuten', 1e-5);
  ok(SCHLAF_T.t, f.t, 'SCHLAF_T.t'); ok(SCHLAF_T.p, f.p, 'SCHLAF_T.p'); ok(SCHLAF_T.seMin, f.se * 60, 'SCHLAF_T.seMin', 1e-5); ok(SCHLAF_T.diffMin, (f.mean - 7) * 60, 'SCHLAF_T.diffMin');
  // Die Rechnung im Text geht mit den sichtbaren Zahlen auf: 4,95 / 3,48 ≈ 1,42.
  assert.equal(Math.round(4.95 / 3.48 * 100) / 100, 1.42);
  for (const [df, q] of [[1, 12.706205], [4, 2.776445], [9, 2.262157], [28, 2.048407], [30, 2.042272], [199, 1.971957]]) ok(tCrit(df), q, `qt(0.975, ${df})`);
  ok(tFit({ rows: applyOp(rows, 'schlafdauer', 'shift', 0.5), columns: { x: ['schlafdauer'] } }).t, 10.04906, 't nach +0,5 h', 1e-4);
  ok(tFit({ rows: applyOp(rows, 'schlafdauer', 'shift', -0.5), columns: { x: ['schlafdauer'] } }).t, -7.202539, 't nach −0,5 h', 1e-5);
  assert.match(tVerteilung.wofuer, /^Schlafen die 200 Befragten im Mittel anders lange als 7 Stunden pro Nacht\? Ihr Mittel liegt knapp 5 Minuten darüber\./);
  assert.match(tVerteilung.stellDirVor.text, /^Ihr Mittel liegt bei 7,08 Stunden, 4,95 Minuten über 7 Stunden\. .* 3,48 Minuten: t ≈ 1,42 bei 199 Freiheitsgraden\./);
  assert.match(tVerteilung.bausteine[2].rechnung!, /±2,78\. .* ±2,04\. .* ±1,97\./);
  assert.equal(tVerteilung.regler!.describe(4), 'Bei 4 Freiheitsgraden liegen die äußeren 5 % jenseits von ±2,78, bei der Standardnormalverteilung jenseits von ±1,96. Die Schlafdauer hat 199 Freiheitsgrade. Hätte sie nur 4, käme ohne Unterschied ein t von 1,42 oder weiter außen in etwa 23 von 100 Stichproben vor.');
  assert.match(tVerteilung.regler!.describe(199), /Die Schlafdauer hat 199 Freiheitsgrade: Gäbe es keinen Unterschied, käme ein t von 1,42 oder weiter außen in etwa 16 von 100 Stichproben vor\.$/);
  assert.match(tVerteilung.regler!.describe(200), /Hätte sie 200, käme/);
  // Welch-Freiheitsgrade 175,8 (Baustein 3, Genau genommen): atlas %>% t_test(lernzeit, group = weiterbildung)   # t(175.8) = 0.156
  const welch = tTest(rows.map(r => r.values.lernzeit), rows.map(r => r.values.weiterbildung))!.welch;
  assert.equal(Math.round(welch.df * 10) / 10, 175.8); assert.match(tVerteilung.bausteine[2].acht, /175,8/); assert.match(tVerteilung.genau.paragraphs[4], /175,8/);
  assert.match(tVerteilung.check.options[1], /2,26/); assert.match(tVerteilung.fuerDich, /bei 2,05/);
  if (tTabs.sample?.kind === 'analysis') assert.match(tTabs.sample.result(ctx).kurz, /7,08 Stunden pro Nacht, 4,95 Minuten über 7 Stunden\. Das ergibt t = 1,42 bei 199 Freiheitsgraden; .* ±1,97\. .* in etwa 16 von 100 Stichproben vor\./);
  assert.match(tTabs.next.more!.find(m => m.id === 'f_distribution')!.why as string, /gleichen Varianzen/);
});

/*
 * χ²-Verteilung: Schulabschluss × Weiterbildung
 *   sa <- as.numeric(atlas$schulabschluss); wb <- as.numeric(atlas$weiterbildung); tab <- table(sa, wb)
 *   ct <- chisq.test(tab, correct = FALSE); ct$statistic; ct$parameter; ct$p.value    # 3.082033 4 0.5441925
 *   ct$expected["1", "1"]; tab["1", "1"]; (12 - 16.4)^2 / 16.4; min(ct$expected)      # 16.4 12 1.180488 15.17
 *   qchisq(0.95, 1:10)        # 3.841459 5.991465 7.814728 9.487729 11.070498 ... 18.307038
 *   chisq.test(tab * 2, correct = FALSE)$statistic                                    # 6.164065
 *   chisq.test(table(4 - sa, wb), correct = FALSE)$statistic                          # 3.082033 (umgepolt gleich)
 *   pchisq(12.3, 4, lower.tail = FALSE)                                               # 0.01526 (unter den äußeren 5 %)
 *   atlas %>% chi_square(schulabschluss, weiterbildung, correct = FALSE)   # chi2(4) = 3.082, p = 0.544, V = 0.124 (small), N = 200
 *   atlas %>% cramers_v(schulabschluss, weiterbildung); sqrt(3.082033 / 200)        # 0.1241377 0.1241377
 *   optimize(function(v) dchisq(v, 4), c(0, 30), maximum = TRUE)$maximum             # 2 (Gipfel); bei 10: 8
 *   atlas %>% chi_square(schulabschluss)    # Fehler: Exactly two variables must be specified for `chi_square()`.
 */
test('B7 χ²-Verteilung: Chi-Quadrat-Test von Schulabschluss und Weiterbildung wie in R', async () => {
  const { CHI, chiFit, chiQuadratVerteilung, chiTabs } = await import('./chi-square');
  const { qchisq, pchisq } = await import('./dist');
  const ctx: SampleCtx = { rows, columns: { x: ['schulabschluss'], y: ['weiterbildung'] } }, f = chiFit(ctx);
  ok(f.chi2, 3.082033, 'χ²'); assert.equal(f.df, 4); ok(f.p, 0.5441925, 'p'); ok(f.crit, 9.487729, 'Grenze'); ok(f.minE, 15.17, 'kleinste Erwartung');
  ok(CHI.chi2, f.chi2, 'CHI.chi2'); ok(CHI.p, f.p, 'CHI.p'); ok(CHI.crit, f.crit, 'CHI.crit');
  [3.841459, 5.991465, 7.814728, 9.487729, 11.070498].forEach((q, i) => ok(qchisq(0.95, i + 1), q, `qchisq(0.95, ${i + 1})`));
  ok(qchisq(0.95, 10), 18.307038, 'qchisq(0.95, 10)'); ok(pchisq(12.3, 4, false), 0.01526, 'χ²(4) = 12,3', 1e-5);
  ok(chiFit({ rows: applyOp(rows, 'schulabschluss', 'reverse'), columns: ctx.columns }).chi2, 3.082033, 'umgepolt');
  ok((CHI.cellB - CHI.cellE) ** 2 / CHI.cellE, 1.180488, 'Beitrag der Zelle');
  assert.match(chiQuadratVerteilung.bausteine[0].rechnung!, /beobachtet 12, erwartet 16,4\. \(12 − 16,4\)² \/ 16,4 = 19,36 \/ 16,4 ≈ 1,18\. .* χ² ≈ 3,08\./);
  assert.match(chiQuadratVerteilung.bausteine[2].rechnung!, /mindestens so großes χ² in etwa 54 von 100 Stichproben/);
  assert.equal(chiQuadratVerteilung.bausteine[2].was, 'Bei 4 Freiheitsgraden liegen die χ²-Werte im Schnitt bei 4, am häufigsten um 2. Nur 5 % sind größer als 9,49.');
  assert.match(chiQuadratVerteilung.ausprobieren[0].explain, /^Bei 4 Freiheitsgraden liegt der Gipfel bei 2, bei 10 Freiheitsgraden bei 8\./);
  assert.match(chiQuadratVerteilung.fuerDich, /vergleiche mit dem Erwartungswert: .* im Schnitt bei 4\./);
  assert.match(chiQuadratVerteilung.wofuer, /^Hängt der Schulabschluss damit zusammen/); assert.match(chiQuadratVerteilung.stellDirVor.text, /^Die Kreuztabelle der 200 Befragten/);
  assert.match(chiQuadratVerteilung.bausteine[1].warum, /Summen am Rand der Tabelle/);
  const { dchisq } = await import('./dist');
  for (const [df, top] of [[4, 2], [10, 8]]) assert.ok(dchisq(top, df) > dchisq(top - 0.01, df) && dchisq(top, df) > dchisq(top + 0.01, df), `Gipfel von χ²(${df}) bei ${top}`);
  ok(f.v, 0.1241377, 'Cramérs V');
  assert.match(chiQuadratVerteilung.ausprobieren[2].explain, /etwa 6,16/);
  assert.match(chiQuadratVerteilung.regler!.describe(4), /^Bei 4 Freiheitsgraden liegt der Gipfel bei 2 und der Erwartungswert bei 4; nur 5 % der χ²-Werte sind größer als 9,49\. So ist es/);
  if (chiTabs.sample?.kind === 'analysis') {
    const r = chiTabs.sample.result(ctx);
    assert.match(r.kurz, /5 Abschlüssen und 2 Antworten ergibt χ² = 3,08 bei 4 Freiheitsgraden\. .* unter 9,49\. .* mindestens so großes χ² in etwa 54 von 100 Stichproben vor\./);
    assert.match(r.zusatz!, /Cramérs V ≈ 0,12, nach der üblichen Faustregel ein schwacher Zusammenhang\./);
  }
});

/*
 * F-Verteilung: Lernzeit nach Schulabschluss
 *   lz <- as.numeric(atlas$lernzeit); summary(aov(lz ~ factor(sa)))     # Sum Sq 313.98 / 1771.84, Mean Sq 78.50 / 9.09, F 8.639
 *   qf(0.95, 4, 195); pf(8.638858, 4, 195, lower.tail = FALSE)         # 2.417963 1.936e-06
 *   pf(c(1, 2, 2.42, 3, 5), 4, 195, lower.tail = FALSE)                # 0.408754 0.0960657 0.0498391 0.0196893 0.000739
 *   tapply(lz, sa, mean); summary(lm(lz ~ factor(sa)))$r.squared        # 5.883 6.950 7.946 8.707 9.355; 0.1505
 *   195 / 193                                                           # 1.010363
 *   oneway.test(lz ~ factor(sa))                                        # F = 8.2537, num df = 4, denom df = 96.702
 *   summary(aov(lz * 2 ~ factor(sa))); summary(aov(lz + 1 ~ factor(sa)))   # F jeweils 8.639
 *   atlas %>% oneway_anova(lernzeit)     # Fehler: Argument `group` is missing, with no default.
 */
test('B7 F-Verteilung: ANOVA der Lernzeit nach Schulabschluss wie in R', async () => {
  const { ANOVA, fFit, fTabs, fTail, fVerteilung } = await import('./f');
  const { qf } = await import('./dist');
  const ctx: SampleCtx = { rows, columns: { x: ['lernzeit'], group: ['schulabschluss'] } }, f = fFit(ctx);
  ok(f.f, 8.638858, 'F'); assert.deepEqual([f.df1, f.df2, f.k], [4, 195, 5]); ok(f.msb, 78.49563, 'MS zwischen', 1e-4); ok(f.msw, 9.086344, 'MS innerhalb', 1e-5);
  ok(f.between, 313.9825, 'SS zwischen', 1e-3); ok(f.inside, 1771.837, 'SS innerhalb', 1e-3); ok(f.crit, 2.417963, 'Grenze'); ok(f.p, 1.936406e-6, 'p', 1e-9);
  ok(f.lowest, 5.883333, 'kleinstes Gruppenmittel'); ok(f.highest, 9.355, 'größtes Gruppenmittel');
  for (const [k, v] of Object.entries({ f: f.f, msb: f.msb, msw: f.msw, crit: f.crit })) ok(ANOVA[k as 'f'], v, `ANOVA.${k}`, 1e-4);
  [[1, 0.408754], [2, 0.0960657], [2.42, 0.0498391], [3, 0.0196893], [5, 0.000739]].forEach(([v, p]) => ok(fTail(v), p, `pf(${v})`, 1e-6));
  ok(qf(0.95, 4, 195), 2.417963, 'qf');
  for (const d of [applyOp(rows, 'lernzeit', 'double'), applyOp(rows, 'lernzeit', 'shift', 1)]) ok(fFit({ rows: d, columns: ctx.columns }).f, 8.638858, 'F bleibt');
  assert.match(fVerteilung.stellDirVor.text, /zwischen 5,9 Stunden \(ohne Schulabschluss\) und 9,4 Stunden \(Abitur\).* F ≈ 8,64 bei 4 und 195 .* unter 2,42\./);
  assert.match(fVerteilung.bausteine[0].rechnung!, /^Quadratsumme zwischen den Gruppen 313,98: .* 313,98 \/ 4 ≈ 78,5\.$/);
  assert.match(fVerteilung.bausteine[1].rechnung!, /^Quadratsumme innerhalb der Gruppen 1\.771,84: .* 1\.771,84 \/ 195 ≈ 9,09\.$/);
  assert.equal(fVerteilung.bausteine[2].rechnung, 'F = 78,5 / 9,09 ≈ 8,64.');
  assert.equal(Math.round(78.5 / 9.09 * 100) / 100, 8.64, 'die Rechnung geht mit den sichtbaren Zahlen auf');
  assert.match(fVerteilung.bausteine[3].rechnung!, /in weniger als 1 von 1\.000 Stichproben/);
  assert.match(fVerteilung.regler!.describe(1), /in etwa 41 von 100 Stichproben vor \(p ≈ 0,41\)\. Das liegt unter der Grenze 2,42/);
  assert.match(fVerteilung.fuerDich, /hier 0,15\./); assert.match(fVerteilung.genau.paragraphs[1], /≈ 1,01\./);
  if (fTabs.sample?.kind === 'analysis') assert.match(fTabs.sample.result(ctx).kurz, /zwischen den 5 Gruppen ist 8,64-mal .* F = 8,64 bei 4 und 195 .* unter 2,42\. .* in weniger als 1 von 1\.000 Stichproben vor\./);
});

/*
 * Bernoulli-Verteilung: Weiterbildung (0/1)
 *   wb <- as.numeric(atlas$weiterbildung); sum(wb); mean(wb)          # 82 0.41
 *   mean(wb) * (1 - mean(wb)); var(wb); sqrt(0.41 * 0.59)             # 0.2419 0.2431156 0.4918333
 *   0.2 * 0.8; 0.5 * 0.5                                               # 0.16 0.25
 *   atlas %>% binomial_test(weiterbildung, p = .5)   # Group 1 (Ja): prop = 0.410 vs 0.500, p = 0.013 *, N = 200
 *   atlas %>% binomial_test(weiterbildung, p = 50)   # Fehler: `p` must be between 0 and 1.
 *   atlas %>% binomial_test(schulabschluss, p = .5)  # Fehler: `schulabschluss` has 5 observed categories; the binomial test needs exactly 2 categories.
 */
test('B7 Bernoulli-Verteilung: Anteil und Varianz der Weiterbildung wie in R', async () => {
  const { bernoulli, bernoulliTabs, bernFit, WEITERBILDUNG } = await import('./bernoulli');
  const f = bernFit({ rows, columns: { x: ['weiterbildung'] } });
  assert.deepEqual([f.k, f.n], [82, 200]); ok(f.p, 0.41, 'p̂'); ok(f.v, 0.2419, 'p̂(1 − p̂)'); ok(f.s2, 0.2431156, 'var()');
  assert.deepEqual([WEITERBILDUNG.k, WEITERBILDUNG.p, WEITERBILDUNG.var], [f.k, f.p, 0.2419]); ok(WEITERBILDUNG.s2, f.s2, 'WEITERBILDUNG.s2');
  const s = bernoulli.compute(bernoulli.initial);
  ok(s.v, 0.2419, 'Var(X)'); ok(s.sd, 0.4918333, 'Standardabweichung');
  assert.equal(bernoulli.worked(s)[2].text, 'Var(X) = 0,41 · 0,59 ≈ 0,24. Die Standardabweichung ist die Wurzel daraus, etwa 0,49.');
  assert.equal(bernoulli.compute({ p: 0.5 }).v, 0.25);
  ok(bernoulli.check.answer, 0.2 * 0.8, 'Kontrollfrage 0,2 · 0,8');
  assert.match(bernoulli.interpret(s).kurz, /^Bei p = 0,41 sind im Schnitt 41 von 100 Antworten eine 1\. Die Varianz 0,24 ist fast so groß wie möglich/);
  const flipped = bernFit({ rows: applyOp(rows, 'weiterbildung', 'reverse'), columns: { x: ['weiterbildung'] } });
  assert.equal(flipped.k, 118); ok(flipped.v, 0.2419, 'umgepolt gleich');
  if (bernoulliTabs.sample?.kind === 'analysis') assert.match(bernoulliTabs.sample.result({ rows, columns: { x: ['weiterbildung'] } }).kurz, /^82 von 200 .* p̂ = 0,41\. Die Varianz p̂ · \(1 − p̂\) beträgt 0,24;/);
});

/*
 * Binomialverteilung: fünf Befragte, p = 0,41
 *   choose(5, 2); 0.41^2 * 0.59^3; dbinom(2, 5, 0.41)        # 10 0.03452421 0.3452421
 *   5 * 0.41; 5 * 0.41 * 0.59                                # 2.05 1.2095
 *   dbinom(2, 3, 0.5); which.max(dbinom(0:5, 5, 0.41)) - 1    # 0.375 2
 *   binom.test(82, 200, 0.5)$p.value; binom.test(118, 200, 0.5)$p.value   # 0.01313036 0.01313036
 *   binom.test(200, 200, 0.5)$p.value; sqrt(200 * 0.25)      # 1.244603e-60 7.071068
 *   abs(82 - 100) / sqrt(50)                                 # 2.545584
 *   atlas %>% binomial_test(weiterbildung, p = .5)           # Group 1 (Ja): prop = 0.410 vs 0.500, p = 0.013 *, N = 200
 */
test('B7 Binomialverteilung: Reihenfolgen, Wahrscheinlichkeit und Binomialtest wie in R', async () => {
  const { binomial, binomialTabs, binFit, BIN_START } = await import('./binomial');
  const { binomTest, dbinom, choose } = await import('./dist');
  const s = binomial.compute(BIN_START);
  assert.equal(s.c, 10); ok(s.one, 0.03452421, 'eine Reihenfolge'); ok(s.P, 0.3452421, 'P(X = 2)'); ok(s.e, 2.05, 'n · p'); ok(s.v, 1.2095, 'Varianz'); assert.deepEqual(s.modes, [2]);
  // Gleichstand: dbinom(2:3, 5, 0.5) = 0.3125 0.3125; dbinom(1:2, 3, 0.5) = 0.375 0.375; dbinom(2:3, 4, 0.6) = 0.3456 0.3456
  for (const [v, m] of [[{ n: 5, k: 2, p: 0.5 }, [2, 3]], [{ n: 3, k: 2, p: 0.5 }, [1, 2]], [{ n: 4, k: 2, p: 0.6 }, [2, 3]], [{ n: 1, k: 1, p: 0.5 }, [0, 1]]] as const) {
    const t = binomial.compute({ ...v }); assert.deepEqual(t.modes, m, `Modi bei ${JSON.stringify(v)}`);
    assert.match(binomial.compare(t), new RegExp(`Am wahrscheinlichsten sind ${m[0]} und ${m[1]} Erfolge, beide gleich wahrscheinlich\\.$`));
  }
  assert.match(binomial.compare(s), /Am wahrscheinlichsten sind 2 Erfolge\.$/);
  assert.match(binomial.compare(binomial.compute({ n: 5, k: 1, p: 0.2 })), /Am wahrscheinlichsten ist 1 Erfolg\.$/);
  assert.match(binomial.worked(binomial.compute({ n: 1, k: 0, p: 0.3 }))[0].text, /^Zum Beispiel lauter Misserfolge\./);
  assert.match(binomial.worked(binomial.compute({ n: 1, k: 0, p: 0.3 }))[1].text, /auf 1 Platz verteilen/);
  assert.deepEqual(binomial.worked(s).map(w => w.text), [
    'Zum Beispiel erst 2 Erfolge, dann 3 Misserfolge. Weil die Versuche unabhängig sind, wird malgenommen: 0,41² · 0,59³ ≈ 0,035.',
    'Auf wie viele Arten lassen sich 2 Erfolge auf 5 Plätze verteilen? C(5, 2) = 10.',
    '10 · 0,035 ≈ 0,35. Genau 2 von 5 kämen in etwa 35 von 100 solcher Stichproben vor.',
  ]);
  ok(dbinom(2, 3, 0.5), binomial.check.answer, 'Kontrollfrage'); assert.equal(choose(12, 6), 924);
  assert.match(binomial.interpret(s).kurz, /^Bei 5 zufällig ausgewählten Personen und p = 0,41 kämen genau 2 mit Weiterbildung in etwa 35 von 100 solcher Stichproben vor\. Im Schnitt erwartest du 2,05\./);
  ok(binomTest(82, 200, 0.5), 0.01313036, 'Binomialtest'); ok(binomTest(118, 200, 0.5), 0.01313036, 'umgepolt'); ok(binomTest(200, 200, 0.5), 1.244603e-60, 'alle', 1e-64);
  const f = binFit({ rows, columns: { x: ['weiterbildung'] } });
  assert.deepEqual([f.k, f.e], [82, 100]); ok(f.sd, 7.071068, 'Standardabweichung');
  if (binomialTabs.sample?.kind === 'analysis') {
    const r = binomialTabs.sample.result({ rows, columns: { x: ['weiterbildung'] } });
    assert.match(r.kurz, /^82 von 200 .* im Schnitt 100, mit einer Standardabweichung von 7,07\. .* in etwa 1 von 100 Stichproben vor\./);
    assert.match(r.zusatz!, /2,55 Standardabweichungen/);
  }
});

/*
 * Hypergeometrische Verteilung: 10 aus 200, 82 mit Weiterbildung
 *   dhyper(0:10, 82, 118, 10); which.max(dhyper(0:10, 82, 118, 10)) - 1      # Modus 4, P = 0.2567104
 *   dbinom(4, 10, 0.41); 10 * 82 / 200                                         # 0.2503034 4.1
 *   sqrt(10 * .41 * .59 * 190 / 199); sqrt(10 * .41 * .59); sqrt(200 * .41 * .59)   # 1.519736 1.555313 6.955573
 *   choose(4, 1) * choose(6, 2); choose(10, 3); dhyper(1, 4, 6, 3); dbinom(1, 3, 0.4)   # 60 120 0.5 0.432
 *   dhyper(2, 2, 4, 2); 190 / 199                                               # 0.06666667 (1 / 15); 0.9547739
 *   tab <- table(wb, as.numeric(atlas$erwerbstaetig)); tab                      # 40 78 / 23 59
 *   fisher.test(tab)$p.value; 82 * 137 / 200                                    # 0.4400504 56.17
 *   fisher.test(table(1 - wb, as.numeric(atlas$erwerbstaetig)))$p.value         # 0.4400504 (umgepolt gleich)
 *   atlas %>% fisher_test(row = weiterbildung, col = erwerbstaetig)            # p = 0.440, OR = 1.315 [0.712, 2.432], N = 200
 *   atlas %>% fisher_test(row = weiterbildung)          # Fehler: Argument `col` is missing, with no default.
 */
test('B7 Hypergeometrische Verteilung: 10 aus 200 und der Test von Fisher wie in R', async () => {
  const { HYPER, fisherFit, hypergeometrisch, hyperTabs, spread } = await import('./hypergeometric');
  const { dhyper, dbinom, choose } = await import('./dist');
  const probs = Array.from({ length: 11 }, (_, k) => dhyper(k, 82, 200, 10));
  assert.equal(probs.indexOf(Math.max(...probs)), 4); ok(probs[4], 0.2567104, 'dhyper(4)'); ok(HYPER.p4, probs[4], 'HYPER.p4'); ok(dbinom(4, 10, 0.41), HYPER.b4, 'dbinom(4)');
  ok(probs.reduce((a, b) => a + b, 0), 1, 'Summe 1');
  ok(spread(10).without, 1.519736, 'SD ohne'); ok(spread(10).with, 1.555313, 'SD mit'); ok(spread(200).with, 6.955573, 'SD mit, 200'); ok(spread(200).without, 0, 'SD ohne, 200');
  assert.deepEqual([choose(4, 1) * choose(6, 2), choose(10, 3)], [60, 120]); ok(dhyper(1, 4, 10, 3), 0.5, 'kleine Gruppe'); ok(dbinom(1, 3, 0.4), 0.432, 'mit Zurücklegen');
  ok(dhyper(2, 2, 6, 2), 1 / 15, 'Kontrollfrage');
  const f = fisherFit({ rows, columns: { x: ['weiterbildung'], y: ['erwerbstaetig'] } });
  assert.deepEqual([f.a, f.b, f.c, f.d, f.row1], [59, 23, 78, 40, 82]); ok(f.expected, 56.17, 'erwartet'); ok(f.p, 0.4400504, 'Fisher p');
  ok(fisherFit({ rows: applyOp(rows, 'weiterbildung', 'reverse'), columns: { x: ['weiterbildung'], y: ['erwerbstaetig'] } }).p, 0.4400504, 'umgepolt');
  assert.equal(fisherFit({ rows: applyOp(rows, 'weiterbildung', 'constant', 1), columns: { x: ['weiterbildung'], y: ['erwerbstaetig'] } }).p, 1, 'nur eine Zeile');
  assert.match(hypergeometrisch.stellDirVor.text, /Am wahrscheinlichsten sind 4 mit Weiterbildung dabei, mit P ≈ 0,26\. Im Schnitt erwartest du 10 · 82 \/ 200 = 4,1\./);
  assert.match(hypergeometrisch.bausteine[2].rechnung!, /≈ 0,43 statt 0,5\. .* P\(X = 4\) ≈ 0,25 statt 0,26\./);
  assert.match(hypergeometrisch.bausteine[3].rechnung!, /59 erwerbstätig, zu erwarten wären 56,17\. .* in etwa 44 von 100 Stichproben/);
  assert.match(hypergeometrisch.ausprobieren[1].explain, /1,52, mit Zurücklegen 1,56/);
  assert.match(hypergeometrisch.regler!.describe(200), /sicher: genau 82 .* 6,96\./);
  assert.match(hypergeometrisch.genau.paragraphs[1], /≈ 0,95\./); assert.match(hypergeometrisch.genau.paragraphs[3], /, 0,26\.$/);
  if (hyperTabs.sample?.kind === 'analysis') assert.match(hyperTabs.sample.result({ rows, columns: { x: ['weiterbildung'], y: ['erwerbstaetig'] } }).kurz, /Von den 82 .* sind 59 erwerbstätig; .* 56,17 zu erwarten\. .* in etwa 44 von 100 Stichproben vor\./);
});

/*
 * Befunde der Begutachtung (Fix-Runde 1), Wortlaut und Zahlen:
 *   sqrt(n * .41 * .59 * (200 - n) / 199); sqrt(n * .41 * .59) für n = 1, 2, 10, 100, 199, 200
 *     # 0.4918 0.6938 1.5197 3.4865 0.4918 0 gegen 0.4918 0.6956 1.5553 4.9183 6.9382 6.9556: ohne ≤ mit, gleich nur bei n = 1
 */
test('B7 Fix-Runde 1: Wortlaut der Befunde I2, I5 und der Minors', async () => {
  const { hypergeometrisch, hyperTabs, spread } = await import('./hypergeometric');
  const { fVerteilung } = await import('./f');
  const { standardnormal } = await import('./standard-normal');
  const { bernoulli } = await import('./bernoulli');
  const { binomial, binomialTabs } = await import('./binomial');
  // I2: ohne Zurücklegen nie mehr Streuung als mit, gleich nur bei n = 1, bei 200 keine.
  for (let n = 1; n <= 200; n++) { const s = spread(n); assert.ok(s.without <= s.with + 1e-12 && (n === 1 || s.without < s.with), `n = ${n}`); }
  ok(spread(1).without, spread(1).with, 'n = 1 gleich'); ok(spread(100).without, 3.486514, 'n = 100'); assert.equal(spread(200).without, 0);
  assert.equal(hypergeometrisch.ausprobieren[0].kurz, 'Ohne Zurücklegen streut das Ergebnis weniger als mit Zurücklegen, sobald du mehr als eine Person ziehst. Ziehst du alle 200, bleibt kein Zufall.');
  // I5 und M12
  assert.match(hypergeometrisch.bausteine[3].was, /^Fisher prüft eine Kreuztabelle mit zwei mal zwei Feldern, eine Vierfeldertafel\./);
  assert.match(hypergeometrisch.bausteine[0].was, /Du zählst beide Teile und nimmst sie mal\./);
  assert.match(fVerteilung.bausteine[0].was, /mittlere Quadratsumme zwischen den Gruppen: ihre Quadratsumme geteilt durch ihre Freiheitsgrade/);
  assert.match(fVerteilung.bausteine[1].acht, /Vertauschst du sie/); assert.match(fVerteilung.ausprobieren[0].explain, /erwartest du/);
  for (const card of [hypergeometrisch, fVerteilung]) for (const b of card.bausteine) assert.ok(!/\bman\b/i.test(`${b.was} ${b.warum} ${b.acht}`), `„man“ in ${b.title}`);
  // M6
  assert.match(fVerteilung.bausteine[3].acht, /mindestens zwei Gruppen/); assert.match(fVerteilung.genau.kurz, /Bei ungleicher Varianz hilft der Welch-Test\.$/);
  // M8, M9, M10
  assert.match(standardnormal.sentence.at(-1) as string, /der Anteil der Werte, die höchstens so groß sind\.$/);
  assert.match(bernoulli.interpret(bernoulli.compute({ p: 0.41 })).kurz, /Ja und Nein kommen beide häufig vor/);
  assert.equal(bernoulli.check.tolerance, 0.011);
  // M11
  assert.match(binomial.check.right, /3 \/ 8, also etwa 0,38\.$/);
  if (binomialTabs.sample?.kind === 'analysis') assert.match(binomialTabs.sample.result({ rows, columns: { x: ['weiterbildung'] } }).fachlich, /B\(n = 200, p = 0,5\).* p-Wert ≈ 0,013\./);
  // M13, M14
  assert.match(normalTabs.r!.check.wrong.p, /wenn die Schlafdauer normalverteilt wäre/);
  assert.equal(normalverteilung.stellDirVor.figures![3].label, 'Modell: innerhalb x̄ ± s');
  if (hyperTabs.sample?.kind === 'analysis') assert.match(hyperTabs.sample.result({ rows, columns: { x: ['weiterbildung'], y: ['erwerbstaetig'] } }).zusatz!, /^Erwerbstätig sind 72 % der Befragten mit und 66,1 % der Befragten ohne Weiterbildung\.$/);
});
