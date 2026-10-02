import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { applyOp } from '../../sample';
import type { ConceptTabs, SampleCtx } from '../../types';
import { b09Testlogik } from './index';
import { SCHLAF, anteilTest, binomApprox, binomExact, dbinom, dunn, familyError, gruppenTest, mischen, schlafP, schlafTest } from './rechnen';
import { hypothese } from './hypothese';
import { pruefgroesse, T_START } from './pruefgroesse';
import { MISCHEN, asFarAs, nullverteilung } from './nullverteilung';
import { SEITEN, seiten } from './seiten';
import { ANTEIL, alpha } from './alpha';
import { kritisch } from './kritisch';
import { betaFor, fehlerarten } from './fehlerarten';
import { teststaerke } from './teststaerke';
import { DF, freiheitsgrade } from './freiheitsgrade';
import { exakt, vergleich } from './exakt';
import { DUNN, mehrfach } from './mehrfach';
import { ABITUR, abiturD, effekt } from './effekt';

/*
 * Referenzwerte des Bereichs B9, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) als Statistikatlas-200-Befragte.sav):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *
 * A. Schlafdauer gegen sieben Stunden
 *   x <- as.numeric(atlas$schlafdauer); t.test(x, mu = 7)
 *   # n = 200, mean = 7.0825, sd = 0.81975836, se = 0.05796567, t = 1.4232562, df = 199, p = 0.15622776,
 *   # conf.int = [6.9681942, 7.1968058]; sum(x > 7) = 101, sum(x < 7) = 88, min 5.1, max 9.5
 *   atlas %>% t_test(schlafdauer, mu = 7, alternative = "two.sided")      # t(199) = 1.423, p = 0.156, N = 200
 *   2 * pt(-abs((mean(x) - mu0) / se), 199) für mu0 = 6.7, 6.9, 6.95, 7.05, 7.1, 7.2, 7.25, 7.5
 *   # 3.671806658e-10, 0.001894168685, 0.02331727259, 0.5756486708, 0.7630414097, 0.04399001708, 0.004284468244, 1.190923325e-11
 *   t.test(x + 0.1, mu = 7); t.test(x - 0.1, mu = 7)                       # t = 3.1484, p = 0.0018942; t = -0.3019, p = 0.7630
 *   0.0825 / (0.82 / sqrt(200)); 0.82 / sqrt(200)                          # 1.4228368, 0.0579828 (Formel als Satz mit s ≈ 0,82)
 *   0.0825 / (sd(x) / sqrt(20000)); qt(.975, 199); sd(x) / sqrt(200) * 60  # 14.2326, 1.9719565, 3.4779 Minuten
 *   qt(.95, 199); qt(.975, 9); qt(.995, 199); qt(.9995, 1); qnorm(c(.975, .95, .995))
 *   # 1.6525467, 2.2621572, 2.6007602, 636.6192488; 1.959964, 1.644854, 2.575829
 *
 * B. Lernzeit nach Weiterbildung (Welch wie mariposa, ohne minus mit)
 *   lz <- as.numeric(atlas$lernzeit); wb <- as.numeric(atlas$weiterbildung)
 *   S <- sd(lz); S * sqrt(1/82 + 1/118); 1.96 * S * sqrt(1/82 + 1/118)  # 3.2375153, 0.4654563, 0.9122943
 *   w <- t.test(lz ~ wb); w$stderr; w$parameter; w$statistic; w$p.value  # 0.4654934, 175.84117, 0.1564348, 0.8758698
 *   set.seed(1); perm <- replicate(100000, { g <- sample(wb); mean(lz[g == 0]) - mean(lz[g == 1]) })
 *   sd(perm); quantile(perm, c(.025, .975)); mean(abs(perm) >= 0.0728193)  # 0.4654806; -0.9172592, 0.9161430; 0.87694
 *   # Der Atlas mischt mit einer festen Folge (mulberry32, Startwert 2026): 183 von 200, 1.743 von 2.000 (0,87).
 *   # Fehlerarten: grob mit der Normalverteilung, wahrer Unterschied 1 h, Standardfehler der Daten (Welch):
 *   pw <- function(a, se = w$stderr) pnorm(1/se - qnorm(1 - a/2)) + pnorm(-1/se - qnorm(1 - a/2))
 *   1 - pw(c(.001, .01, .05, .1))     # beta: 0.8733287, 0.6655171, 0.4253030, 0.3072655
 *   pnorm(1/0.47 - 1.96)              # 0.5665744 (mit den sichtbaren Zahlen, gerundet 0,57)
 *   w2 <- t.test(2 * lz ~ wb); 1 - pw(.05, w2$stderr)   # stderr 0.9309868, beta 0.8109404
 *   # Teststärke als Formel: pz(d, n, a) <- pnorm(d * sqrt(n/2) - qnorm(1 - a/2)) + pnorm(-d * sqrt(n/2) - qnorm(1 - a/2))
 *   # pz(.3, 100, .05) 0.5641160; pz(.3, 400, .05) 0.9887753; pz(.5, 100, .05) 0.9424375; pz(.3, 100, .01) 0.3247326;
 *   # pz(.3, 175, .05) 0.8013024; pz(.05, 5, .001) 0.0010367; 2 * ((qnorm(.975) + qnorm(.8)) / .3)^2 = 174.42
 *   power.t.test(n = 100, delta = .3)$power; power.t.test(power = .8, delta = .3)$n   # 0.5600359, 175.39
 *   1 / sp (gepoolte Standardabweichung der Lernzeit nach Weiterbildung 3.2454809)   # 0.3081207
 *   t.test(lz ~ wb, var.equal = TRUE)$parameter                          # 198; t(198) = 0.156 in t_test(…, var.equal = TRUE)
 *   sa <- as.numeric(atlas$schulabschluss); chisq.test(table(sa, wb))$parameter   # 4
 *   oneway.test(lz ~ sa, var.equal = TRUE)$parameter; oneway.test(lz ~ sa)$parameter   # 4, 195; 4, 96.701708
 *   qt(.975, c(1, 4, 26, 27, 30, 100, 199)); qnorm(.975)
 *   # 12.7062047, 2.7764451, 2.0555294, 2.0518305, 2.0422725, 1.9839715, 1.9719565; 1.9599640 (gerundet ab df = 27 weniger als 0,1 über 1,96)
 *   t.test(lz ~ wb, alternative = "greater")$p.value; t.test(lz ~ wb, alternative = "less")$p.value   # 0.4379349, 0.5620651
 *   atlas %>% t_test(lernzeit, group = weiterbildung, alternative = "greater")  # t(175.8) = 0.156, p = 0.438
 *   sp <- sqrt(((118 - 1) * var(lz[wb == 0]) + (82 - 1) * var(lz[wb == 1])) / 198); d <- (mean(lz[wb == 0]) - mean(lz[wb == 1])) / sp
 *   # sp = 3.2454809, d = 0.0224372, Hedges g = d * (1 - 3 / (4 * 200 - 9)) = 0.0223521; t_test meldet g = 0.022 (negligible)
 *
 * E. Effektgröße: Lernzeit mit Abitur (Code 4) gegen ohne Schulabschluss (Code 0)
 *   sa <- as.numeric(atlas$schulabschluss); g4 <- lz[sa == 4]; g0 <- lz[sa == 0]
 *   mean(g4); sd(g4); mean(g0); sd(g0)                  # 9.355, 3.3604754 (n 40); 5.8833333, 3.0719753 (n 42)
 *   sp <- sqrt((39 * var(g4) + 41 * var(g0)) / 80); d <- (mean(g4) - mean(g0)) / sp; d * (1 - 3 / (4 * 82 - 9))
 *   # sp = 3.2158540, d = 1.0795474, g = 1.0693949; pnorm(3.47 / 3.22) = 0.8594027; 3.47 / 3.22 = 1.0776398
 *   0.05 * sqrt(10000 / 2); 2 * pnorm(-0.05 * sqrt(10000 / 2))   # 3.5355, 0.000407 (d = 0,05 bei 20.000 Befragten signifikant)
 *
 * D. Mehrere Vergleiche: finanzielle Lage nach Schulabschluss
 *   k <- atlas %>% kruskal_wallis(finanzlage, group = schulabschluss)   # H(4) = 11.585, p = 0.021 *
 *   kruskal.test(as.numeric(finanzlage) ~ as.numeric(schulabschluss), data = atlas)$p.value   # 0.02071547
 *   (k %>% dunn_test(p_adjust = "holm"))$results[, c("z", "p", "p_adj")]
 *   # z: -1.8104515, 0.0830916, -2.7466949, -1.5550907, 1.8357118, -0.9136140, 0.2523024, -2.7419887, -1.5883731, 1.1674690
 *   # p_adj: 0.5312024, 1, 0.0601991, 0.6732119, 0.5312024, 1, 1, 0.0601991, 0.6732119, 0.9720840
 *   2 * pnorm(-2.7466949)                                                # 0.0060199 (kleinstes unkorrigiertes p)
 *   atlas %>% kruskal_wallis(finanzlage, group = schulabschluss) %>% dunn_test(p_adjust = "holm")   # 10 comparisons, 0 significant
 *   1 - 0.95^c(2, 3, 10, 20, 30); 0.05 / c(3, 7)                         # 0.0975, 0.142625, 0.4012631, 0.6415141, 0.7853612; 0.0166667, 0.0071429
 *
 * C. Weiterbildung gegen 50 % (82 von 200)
 *   binom.test(82, 200, 0.5)$p.value                                      # 0.013130356
 *   atlas %>% binomial_test(weiterbildung, p = .5)                        # prop = 0.410 vs 0.500, p = 0.013 *, N = 200
 *   rej <- sapply(0:200, function(k) binom.test(k, 200, .5)$p.value <= 0.05); sum(dbinom(0:200, 200, .5)[rej])  # 0.040037192
 *   binom.test(118, 200, .5)$p.value; binom.test(200, 200, .5)$p.value   # 0.013130356 (gleich), 1.244603e-60
 *   z <- (82 - 100) / sqrt(50); 2 * pnorm(-abs(z))                        # -2.5455844, 0.010909498
 *   2 * pnorm(-(abs(82 - 100) - 0.5) / sqrt(50))                          # 0.013328329 (Stetigkeitskorrektur)
 *   for (n in c(10, 20, 50, 100, 200)) { k <- (n * 41) %/% 100; binom.test(k, n)$p.value; 2 * pnorm(-abs(k - n/2) / sqrt(n/4)) }
 *   # n 10, k 4: 0.75390625, 0.52708926; n 20, k 8: 0.50344467, 0.37109337; n 50, k 20: 0.20263875, 0.15729921;
 *   # n 100, k 41: 0.08862608, 0.07186064; n 200, k 82: 0.01313036, 0.01090950
 */
const rows = createSurvey();
const ctx = (columns: Record<string, string>): SampleCtx => ({ rows, columns: Object.fromEntries(Object.entries(columns).map(([k, v]) => [k, [v]])) });
const tabs = (id: string): ConceptTabs => b09Testlogik.tabs[id];
const result = (id: string, data = rows) => { const s = tabs(id).sample; assert.ok(s?.kind === 'analysis', `${id}: Auswertung`); const cols = Object.fromEntries(Object.entries(s.columns ?? {}).map(([k, v]) => [k, [v]])); return s.result({ rows: data, columns: cols }); };

test('B9: alle zwölf Begriffe sind erklärt und haben Reiter mit Weiter', () => {
  const ids = ['hypothesis', 'test_statistic', 'null_distribution', 'test_sides', 'alpha_level', 'critical_value', 'type_errors', 'power', 'general_df', 'exact_asymptotic', 'multiplicity', 'effect'];
  assert.deepEqual(Object.keys(b09Testlogik.explanations).sort(), [...ids].sort(), 'genau die zwölf Begriffe des Bereichs');
  for (const id of ids) {
    assert.ok(b09Testlogik.explanations[id], `${id}: Erklärung fehlt`);
    assert.ok(b09Testlogik.tabs[id]?.next, `${id}: Weiter fehlt`);
  }
});

test('B9 Hypothese: Schlafdauer gegen sieben Stunden wie in R', () => {
  const r = schlafTest(ctx({ x: 'schlafdauer' }))!;
  for (const [mine, data, ref] of [[SCHLAF.mean, r.mean, 7.0825], [SCHLAF.sd, r.sd, 0.81975836], [SCHLAF.se, r.se, 0.05796567], [SCHLAF.t, r.t, 1.4232562], [SCHLAF.p, r.p, 0.15622776], [SCHLAF.lo, r.ci[0], 6.9681942], [SCHLAF.hi, r.ci[1], 7.1968058]] as const) {
    assert.ok(close(mine, ref, 1e-6), `Konstante ${mine} ≠ R ${ref}`);
    assert.ok(close(data, ref, 1e-6), `Lehrdatensatz ${data} ≠ R ${ref}`);
  }
  assert.deepEqual([r.n, r.df, r.mehr, r.weniger, SCHLAF.mehr, SCHLAF.weniger], [200, 199, 101, 88, 101, 88]);
  for (const [mu0, p] of [[6.7, 3.671806658e-10], [6.9, 0.001894168685], [6.95, 0.02331727259], [7.05, 0.5756486708], [7.1, 0.7630414097], [7.2, 0.04399001708], [7.25, 0.004284468244], [7.5, 1.190923325e-11]])
    assert.ok(close(schlafP(mu0), p, Math.max(1e-6 * p, 1e-15)), `μ₀ = ${mu0}: ${schlafP(mu0)} ≠ R ${p}`);
  assert.match(hypothese.stellDirVor.text, /im Schnitt 7,08 Stunden .* R meldet dazu p = 0\.156\./);
  assert.match(hypothese.ausprobieren[1].explain, /von etwa 6,97 bis 7,20 Stunden/);
  assert.match(hypothese.ausprobieren[2].explain, /p fällt auf etwa 0,002\./);
  assert.match(hypothese.regler!.describe(7), /mindestens 0,08 Stunden in etwa 16 von 100 Stichproben vor, p ≈ 0,16\. .* nicht\./);
  assert.match(hypothese.regler!.describe(7.1), /in etwa 76 von 100 .*p ≈ 0,76/);
  assert.match(hypothese.regler!.describe(6.9), /in weniger als 1 von 100 .*p ≈ 0,0019\. .*signifikant/);
  assert.match(hypothese.regler!.describe(7.2), /in etwa 4 von 100 .*p ≈ 0,044\. .*signifikant/);
  assert.match(hypothese.genau.paragraphs[0], /t\(199\) ≈ 1,42, p ≈ 0,16\. .*von 6,97 bis 7,20 Stunden/);
  // Reiter: Auswertung mit allen 200 und nach den beiden Verschiebungen (R: p 0.0018942 bzw. 0.7630414).
  assert.match(result('hypothesis').kurz, /im Schnitt 7,08 Stunden pro Nacht, 0,08 Stunden mehr als sieben\. .*in etwa 16 von 100 .*\(p ≈ 0,16\)\. .*nicht\./);
  assert.match(result('hypothesis').fachlich, /t\(199\) ≈ 1,42, p ≈ 0,16; 95-%-Konfidenzintervall von 6,97 bis 7,20 Stunden/);
  assert.equal(result('hypothesis').zusatz, '101 Befragte schlafen mehr als sieben Stunden, 88 weniger.');
  assert.match(result('hypothesis', applyOp(rows, 'schlafdauer', 'shift', 0.1)).kurz, /7,18 Stunden .*p ≈ 0,0019\)\. .*signifikant/);
  assert.match(result('hypothesis', applyOp(rows, 'schlafdauer', 'shift', -0.1)).kurz, /6,98 Stunden pro Nacht, 0,02 Stunden weniger .*p ≈ 0,76/);
});

test('B9 Prüfgröße: t für die Schlafdauer wie in R, mit den sichtbaren Zahlen nachrechenbar', () => {
  const s = pruefgroesse.compute(T_START);
  assert.ok(close(s.t, 1.4228368, 1e-6) && close(s.se, 0.0579828, 1e-6), `t ${s.t}, SE ${s.se}`);
  assert.ok(close(T_START.d, SCHLAF.mean - 7, 1e-9), 'Abstand wie in den Daten');
  assert.ok(close(pruefgroesse.compute({ ...T_START, s: SCHLAF.sd, n: 20000 }).t, 14.2326, 1e-4), 'bei 20.000 Befragten');
  assert.deepEqual(pruefgroesse.worked(s).map(w => w.text), ['√200 ≈ 14,14.', 'SE = 0,82 / 14,14 ≈ 0,058 Stunden.', 't = 0,0825 / 0,058 ≈ 1,42.']);
  assert.match(pruefgroesse.fehler, /0,08 Stunden sind bei 200 Befragten etwa 1,4 Standardfehler, bei 20\.000 Befragten wären es über 14\./);
  assert.match(pruefgroesse.interpret(s).kurz, /1,42 Standardfehler über dem Vergleichswert\. .*in etwa 16 von 100 Stichproben/);
  assert.match(pruefgroesse.interpret(s).fachlich, /bei 199 Freiheitsgraden, zweiseitig p ≈ 0,16\. Die Grenze für α = 0,05 liegt bei ±1,97/);
  assert.equal(pruefgroesse.check.diagnose(0.5).startsWith('Fast!'), true);
  // Reiter: R t = 1.4232562, verschoben 3.1484153 und −0.3019028; ein Standardfehler 0.05796567 h = 3.48 Minuten.
  assert.match(result('test_statistic').kurz, /Standardfehler von 0,058 Stunden liegt das 1,42 Standardfehler über sieben Stunden: t ≈ 1,42\./);
  assert.match(result('test_statistic').fachlich, /\(7,0825 − 7\) \/ \(0,82 \/ √200\) ≈ 1,42 bei 199 Freiheitsgraden\. .*±1,97/);
  assert.equal(result('test_statistic').zusatz, 'Ein Standardfehler entspricht hier 3,48 Minuten Schlaf pro Nacht.');
  assert.match(result('test_statistic', applyOp(rows, 'schlafdauer', 'shift', 0.1)).kurz, /t ≈ 3,15\./);
  assert.match(result('test_statistic', applyOp(rows, 'schlafdauer', 'shift', -0.1)).kurz, /0,3 Standardfehler unter sieben Stunden: t ≈ −0,3\./);
});

test('B9 Nullverteilung: Mischen der Weiterbildung wie in R, die feste Mischfolge nahe am p-Wert', () => {
  const g = gruppenTest(ctx({ x: 'lernzeit', group: 'weiterbildung' }))!;
  assert.ok(close(g.sAll, MISCHEN.s, 1e-6) && close(g.perm, MISCHEN.sd, 1e-6) && close(1.96 * g.perm, MISCHEN.rand, 1e-6), `s ${g.sAll}, Breite ${g.perm}`);
  assert.ok(close(Math.sqrt(1 / 82 + 1 / 118), MISCHEN.root, 1e-6));
  assert.ok(close(g.se, 0.4654934, 1e-6) && close(g.df, 175.84117, 1e-4) && close(g.t, 0.1564348, 1e-6) && close(g.two, 0.8758698, 1e-6), 'Welch wie R');
  // Die feste Mischfolge: Standardabweichung und Anteil nahe an R (100.000 Mischungen: 0.4654806 und 0.87694).
  const all = mischen(rows, 2000), sd = Math.sqrt(all.reduce((a, v) => a + v * v, 0) / all.length);
  assert.ok(Math.abs(sd - 0.4654806) < 0.02, `Mischfolge sd ${sd}`);
  assert.equal(asFarAs(200), 183); assert.equal(asFarAs(2000), 1743);
  assert.ok(Math.abs(asFarAs(2000) / 2000 - MISCHEN.pPerm) < 0.03, 'Anteil nahe am Permutations-p aus R');
  assert.match(nullverteilung.regler!.describe(200), /Nach 200 Mischungen liegen die Gruppen in 183 davon mindestens 0,07 Stunden auseinander.*Anteil von 0,92; bei so wenigen/);
  assert.match(nullverteilung.regler!.describe(2000), /Nach 2\.000 Mischungen .* in 1\.743 davon .*Anteil von 0,87, nahe am p-Wert 0,88 des t-Tests\./);
  assert.match(nullverteilung.bausteine[1].rechnung!, /3,24 · √\(1\/82 \+ 1\/118\) ≈ 3,24 · 0,144 ≈ 0,47 h/);
  assert.match(nullverteilung.bausteine[2].rechnung!, /In etwa 88 von 100 Mischungen .*p ≈ 0,88\./);
  assert.match(nullverteilung.ausprobieren[0].explain, /zwischen −0,91 und \+0,91 Stunden/);
  assert.match(nullverteilung.ausprobieren[1].explain, /von 0,47 auf 0,93 Stunden/);
  assert.match(nullverteilung.ausprobieren[2].explain, /rund 0,15 Stunden/);
  assert.match(nullverteilung.genau.paragraphs[1], /Anteil von 0,88, .*zwischen etwa −0,92 und \+0,92 Stunden\. .*±0,91 Stunden/);
  // Reiter: R 1.96 · 0.4654563 = 0.9122943; verdoppelt 1.8245886.
  assert.match(result('null_distribution').kurz, /zwischen −0,91 und \+0,91 Stunden\. Beobachtet sind 0,07 Stunden\. Das liegt innerhalb/);
  assert.match(result('null_distribution').fachlich, /≈ 0,47 h\. R nähert sie mit der t-Verteilung mit 175,8 Freiheitsgraden\./);
  assert.match(result('null_distribution', applyOp(rows, 'lernzeit', 'double')).kurz, /zwischen −1,82 und \+1,82 Stunden\. Beobachtet sind 0,15 Stunden/);
});

test('B9 Seiten: einseitige und zweiseitige p-Werte der Lernzeit nach Weiterbildung wie in R', () => {
  const g = gruppenTest(ctx({ x: 'lernzeit', group: 'weiterbildung' }))!;
  for (const [mine, data, ref] of [[SEITEN.two, g.two, 0.8758698], [SEITEN.right, g.right, 0.4379349], [SEITEN.left, g.left, 0.5620651]] as const)
    { assert.ok(close(mine, ref, 1e-6), `${mine} ≠ R ${ref}`); assert.ok(close(data, ref, 1e-6), `Daten ${data} ≠ R ${ref}`); }
  assert.match(seiten.stellDirVor.text, /ohne Weiterbildung im Schnitt 7,78 Stunden, die mit Weiterbildung 7,71 Stunden\. .*t ≈ 0,16\. Zweiseitig meldet R p = 0\.876\. .*p = 0\.438, .*p = 0\.562\./);
  assert.equal(seiten.bausteine[1].rechnung, 'p ≈ 0,44 + 0,44 ≈ 0,88');
  assert.match(seiten.regler!.describe(0), /in etwa 56 von 100 .*\(p ≈ 0,56\)/);
  assert.match(seiten.regler!.describe(1), /in etwa 88 von 100 .*\(p ≈ 0,88\)/);
  assert.match(seiten.regler!.describe(2), /in etwa 44 von 100 .*\(p ≈ 0,44\)/);
  assert.match(result('test_sides').kurz, /Ohne minus mit Weiterbildung: 0,07 Stunden, t ≈ 0,16\. Zweiseitig ist p ≈ 0,88\. Rechtsseitig .* p ≈ 0,44, linksseitig .* p ≈ 0,56\./);
});

test('B9 Signifikanzniveau: Weiterbildung gegen 50 % wie in R, Entscheidung je nach α', () => {
  const r = anteilTest(ctx({ x: 'weiterbildung' }));
  assert.deepEqual([r.k, r.n], [ANTEIL.k, ANTEIL.n]);
  assert.ok(close(r.exact, 0.013130356, 1e-8) && close(ANTEIL.p, 0.013130356, 1e-8), `exakt ${r.exact}`);
  assert.ok(close(binomExact(118, 200), 0.013130356, 1e-8) && close(binomExact(200, 200), 1.244603e-60, 1e-65), 'umgepolt und alle Ja');
  let size = 0;
  for (let k = 0; k <= 200; k++) if (binomExact(k, 200) <= 0.05) size += dbinom(k, 200, 0.5);
  assert.ok(close(size, 0.040037192, 1e-8) && close(ANTEIL.size05, 0.040037192, 1e-8), `tatsächliche Fehlerquote ${size}`);
  assert.match(alpha.stellDirVor.text, /82 von 200 .*41 %\. .*R meldet p = 0\.013\. Bei α = 0,05 heißt das signifikant, bei α = 0,01 nicht\./);
  assert.equal(alpha.bausteine[1].rechnung, 'p ≈ 0,013 < α = 0,05: H₀ verwerfen. Bei α = 0,01 wäre p ≈ 0,013 > 0,01: H₀ nicht verwerfen.');
  assert.match(alpha.regler!.describe(0.05), /Mit α = 0,05 liegt p ≈ 0,013 darunter: .*signifikant\. .*in etwa 5 % der Studien/);
  assert.match(alpha.regler!.describe(0.01), /p ≈ 0,013 darüber: Du verwirfst H₀ nicht\. .*in etwa 1 % der Studien/);
  assert.match(alpha.regler!.describe(0.013), /p ≈ 0,0131 knapp darüber/);
  assert.match(alpha.regler!.describe(0.014), /p ≈ 0,0131 knapp darunter/);
  assert.match(alpha.genau.paragraphs[1], /für α = 0,05 bei 0,04\./);
  assert.match(result('alpha_level').kurz, /82 von 200 .*41 %\. .*in etwa 1 von 100 Stichproben vor \(p ≈ 0,013\)\. Bei α = 0,05 verwirfst du H₀: signifikant\./);
  assert.match(result('alpha_level').fachlich, /Bei α = 0,01 wäre das nicht signifikant\./);
  assert.match(result('alpha_level', applyOp(rows, 'weiterbildung', 'reverse')).kurz, /118 von 200 .*p ≈ 0,013/);
  assert.match(result('alpha_level', applyOp(rows, 'weiterbildung', 'constant', 1)).kurz, /200 von 200 .*p < 0,001/);
});

test('B9 Kritischer Wert: Quantile der t-Verteilung wie in R', () => {
  const s = kritisch.compute(kritisch.initial);
  assert.ok(close(s.c, 1.9719565, 1e-6) && close(s.cOne, 1.6525467, 1e-6) && close(s.cNormal, 1.959964, 1e-6), `c ${s.c}`);
  assert.ok(close(kritisch.compute({ alpha: 0.05, df: 9 }).c, 2.2621572, 1e-6) && close(kritisch.compute({ alpha: 0.01, df: 199 }).c, 2.6007602, 1e-6), 'df 9, α 0,01');
  assert.ok(close(kritisch.compute({ alpha: 0.001, df: 1 }).c, 636.6192488, 1e-4), 'df 1, α 0,001');
  assert.deepEqual(kritisch.worked(s).map(w => w.text), ['α / 2 = 0,05 / 2 = 0,025. So viel Fläche bekommt jeder Rand.', 'Rechts von c liegt nur noch der Anteil 0,025 der Fläche: c ≈ 1,97 bei 199 Freiheitsgraden.', 'Zum Vergleich die Schlafdauer: t ≈ 1,42. Das liegt zwischen −c und +c: H₀ nicht verwerfen.']);
  assert.match(kritisch.fehler, /bei 1,96, die einseitige bei 1,64\./);
  assert.match(kritisch.think.explain, /Bei df = 9 liegt sie bei 2,26\./);
  assert.match(kritisch.interpret(s).kurz, /mindestens 1,97 von 0 entfernt ist\. .*in 5 % der Studien\./);
  assert.match(kritisch.genau.paragraphs[0], /t ≈ 1,42 bei 199 Freiheitsgraden\. Die Grenze liegt bei 1,97, .*p ≈ 0,16\./);
  assert.match(result('critical_value').kurz, /t ≈ 1,42\. Die Grenze bei α = 0,05 liegt bei ±1,97\. t liegt zwischen den Grenzen/);
  assert.match(result('critical_value').fachlich, /läge die Grenze bei 1,65\./);
  assert.match(result('critical_value', applyOp(rows, 'schlafdauer', 'shift', 0.1)).kurz, /t ≈ 3,15\. .*t liegt im Ablehnungsbereich: Du verwirfst H₀\./);
});

test('B9 Fehlerarten: Übersehen einer Stunde Unterschied wie in R', () => {
  for (const [a, beta] of [[0.001, 0.8733287], [0.01, 0.6655171], [0.05, 0.4253030], [0.1, 0.3072655]]) assert.ok(close(betaFor(a), beta, 1e-6), `α ${a}: β ${betaFor(a)} ≠ R ${beta}`);
  assert.match(fehlerarten.stellDirVor.text, /R meldet p = 0\.876\. .*Bei 82 und 118 Befragten passiert das grob gerechnet in 43 % der Studien\./);
  assert.equal(fehlerarten.bausteine[2].rechnung, 'α = 0,05: β ≈ 0,43; α = 0,01: β ≈ 0,67');
  assert.match(fehlerarten.ausprobieren[2].explain, /in etwa 67 statt 43 von 100 Studien\./);
  assert.match(fehlerarten.regler!.describe(0.05), /in etwa 5 % der Studien .*in 43 % der Studien/);
  assert.match(fehlerarten.regler!.describe(0.001), /in etwa 0,1 % der Studien .*in 87 % der Studien/);
  assert.match(fehlerarten.genau.paragraphs[0], /Φ\(1 \/ 0,47 − 1,96\) ≈ 0,57, also β ≈ 0,43\./);
  assert.match(result('type_errors').kurz, /0,47 Stunden, übersähe .* in 43 % der Studien\./);
  const doubled = gruppenTest({ rows: applyOp(rows, 'lernzeit', 'double'), columns: { x: ['lernzeit'], group: ['weiterbildung'] } })!;
  assert.ok(close(doubled.se, 0.9309868, 1e-6) && close(betaFor(0.05, doubled.se), 0.8109404, 1e-6), 'verdoppelt wie R');
  assert.match(result('type_errors', applyOp(rows, 'lernzeit', 'double')).fachlich, /Φ\(1 \/ 0,93 − 1,96\) ≈ 0,19, also β ≈ 0,81/);
});

test('B9 Teststärke: Näherung mit der Normalverteilung wie in R', () => {
  for (const [d, n, a, p] of [[0.3, 100, 0.05, 0.5641160], [0.3, 400, 0.05, 0.9887753], [0.5, 100, 0.05, 0.9424375], [0.3, 100, 0.01, 0.3247326], [0.3, 175, 0.05, 0.8013024], [0.05, 5, 0.001, 0.0010367]])
    assert.ok(close(teststaerke.compute({ d, n, alpha: a }).power, p, 1e-6), `d ${d}, n ${n}, α ${a}`);
  const s = teststaerke.compute(teststaerke.initial);
  assert.deepEqual(teststaerke.worked(s).map(w => w.text.split('.')[0] + '.'), ['d · √(n/2) = 0,3 · √(100 / 2) ≈ 2,12.', '2,12 − 1,96 ≈ 0,16.', 'Φ(0,16) ≈ 0,56: Der Test findet den Unterschied in etwa 56 von 100 Studien.']);
  assert.match(teststaerke.interpret(s).kurz, /mit 100 Personen je Gruppe in etwa 56 von 100 Studien\. In den übrigen 44 übersieht er ihn\./);
  assert.match(teststaerke.interpret(teststaerke.compute({ d: 0.3, n: 1600, alpha: 0.05 })).kurz, /fast immer\.$/);
  assert.match(teststaerke.genau.paragraphs[0], /liefert die Näherung 0,56\. power\.t\.test.* ebenfalls 0,56\. .*175 Personen je Gruppe, power\.t\.test kommt auf 176\./);
  assert.ok(Math.round(0.5600359 * 100) === 56 && Math.ceil(175.39) === 176 && Math.ceil(174.42) === 175, 'power.t.test');
  const g = gruppenTest(ctx({ x: 'lernzeit', group: 'weiterbildung' }))!;
  assert.ok(close(g.sp, 3.2454809, 1e-6) && close(1 / g.sp, 0.3081207, 1e-6), 'gepoolte Standardabweichung');
  assert.match(result('power').kurz, /Mit 82 und 118 Befragten und einem Standardfehler von 0,47 Stunden fände der Test eine Stunde Unterschied in etwa 57 von 100 Studien\. Eine Stunde sind hier d ≈ 0,31\./);
  assert.match(result('power', applyOp(rows, 'lernzeit', 'double')).fachlich, /Φ\(1 \/ 0,93 − 1,96\) ≈ 0,19/);
});

test('B9 Freiheitsgrade: Zählregeln und Grenzen wie in R', () => {
  const g = gruppenTest(ctx({ x: 'lernzeit', group: 'weiterbildung' }))!;
  assert.equal(g.studentDf, 198); assert.ok(close(g.df, DF.welch, 1e-6) && close(DF.welch, 175.84117, 1e-4), 'Welch');
  assert.deepEqual([DF.eins, DF.student, DF.kreuz, DF.anovaZ, DF.anovaN], [199, 198, 4, 4, 195]);
  assert.ok(close(DF.welchAnova, 96.701708, 1e-6));
  assert.match(freiheitsgrade.stellDirVor.text, /200 − 1 = 199 .*200 − 2 = 198\. Welch kommt auf 175,8,/);
  assert.equal(freiheitsgrade.bausteine[3].rechnung, 'Grenze für α = 0,05, zweiseitig: df = 4: 2,78; df = 199: 1,97; sehr viele: 1,96');
  assert.match(freiheitsgrade.regler!.describe(1), /bei 12,71\. .*Die Ränder sind dicker/);
  assert.match(freiheitsgrade.regler!.describe(26), /bei 2,06\. .*Die Ränder sind dicker/);
  assert.match(freiheitsgrade.regler!.describe(27), /bei 2,05\. .*kaum noch ein Unterschied/);
  assert.match(freiheitsgrade.regler!.describe(100), /bei 1,98\. Die Normalverteilung hätte 1,96\./);
  assert.match(freiheitsgrade.genau.paragraphs[1], /4 und 195 Freiheitsgrade, im Welch-Test 4 und 96,7\./);
  assert.match(result('general_df').kurz, /Student hat 198 Freiheitsgrade\. Welch kommt auf 175,8,/);
  assert.match(result('general_df').fachlich, /bei Welch: 1,97\./);
});

test('B9 Exakt und genähert: Binomialtest gegen Normalnäherung wie in R', () => {
  for (const [n, k, e, a] of [[10, 4, 0.75390625, 0.52708926], [20, 8, 0.50344467, 0.37109337], [50, 20, 0.20263875, 0.15729921], [100, 41, 0.08862608, 0.07186064], [200, 82, 0.01313036, 0.01090950]]) {
    const b = vergleich(n);
    assert.equal(b.k, k, `n ${n}`);
    assert.ok(close(b.exact, e, 1e-7) && close(b.approx, a, 1e-7), `n ${n}: ${b.exact}, ${b.approx}`);
  }
  assert.ok(close(binomApprox(82, 200).z, -2.5455844, 1e-6) && close(binomApprox(82.5, 200).p, 0.013328329, 1e-8), 'z und Stetigkeitskorrektur');
  assert.match(exakt.stellDirVor.text, /R meldet p = 0\.013\. Die Normalverteilung als Näherung liefert p ≈ 0,011\./);
  assert.equal(exakt.bausteine[1].rechnung, 'z = (82 − 100) / 7,07 ≈ −2,55; p ≈ 0,011');
  assert.match(exakt.bausteine[1].acht, /liefert sie 0,37 statt 0,5\./);
  assert.match(exakt.ausprobieren[0].explain, /p ≈ 0,75, die Näherung liefert 0,53\. .*0,013 und 0,011\./);
  assert.match(exakt.regler!.describe(200), /82 Ja ergibt sich exakt p ≈ 0,013, .*p ≈ 0,011\. Die Näherung liegt nah/);
  assert.match(exakt.regler!.describe(100), /41 Ja .*p ≈ 0,089, .*p ≈ 0,072\. Die Näherung weicht noch spürbar ab\./);
  assert.match(exakt.genau.paragraphs[0], /≈ 2,47 ergibt p ≈ 0,013, fast wie exakt\./);
  assert.match(result('exact_asymptotic').kurz, /Exakt ergibt sich p ≈ 0,013, mit der Normalverteilung genähert p ≈ 0,011\. Bei 200 Befragten liegen beide nah beieinander\./);
  assert.match(result('exact_asymptotic').fachlich, /z = \(82 − 100\) \/ √50 ≈ −2,55, p ≈ 0,011\./);
});

test('B9 Mehrere Vergleiche: Dunn ohne und mit Holm wie in R', () => {
  const d = dunn(ctx({ x: 'finanzlage', group: 'schulabschluss' }));
  const z = [-1.8104515, 0.0830916, -2.7466949, -1.5550907, 1.8357118, -0.9136140, 0.2523024, -2.7419887, -1.5883731, 1.1674690];
  const adj = [0.5312024, 1, 0.0601991, 0.6732119, 0.5312024, 1, 1, 0.0601991, 0.6732119, 0.9720840];
  d.pairs.forEach((p, i) => { assert.ok(close(p.z, z[i], 1e-6), `z ${i}: ${p.z}`); assert.ok(close(p.holm, adj[i], 1e-6), `Holm ${i}: ${p.holm}`); });
  assert.deepEqual([d.pairs.length, d.raw, d.holmCount], [DUNN.m, DUNN.raw, DUNN.holm]);
  assert.ok(close(Math.min(...d.pairs.map(p => p.p)), DUNN.minP, 1e-7) && close(Math.min(...d.pairs.map(p => p.holm)), DUNN.minHolm, 1e-7), 'kleinste p-Werte');
  for (const [m, f] of [[2, 0.0975], [3, 0.142625], [10, 0.4012631], [20, 0.6415141], [30, 0.7853612]]) assert.ok(close(familyError(m), f, 1e-6), `m ${m}`);
  assert.match(mehrfach.stellDirVor.text, /zwei davon bei p ≈ 0,006, .*p ≈ 0,06: Bei α = 0,05 ist kein Vergleich mehr signifikant\./);
  assert.equal(mehrfach.bausteine[1].rechnung, '1 − 0,95¹⁰ ≈ 0,4');
  assert.match(mehrfach.bausteine[1].was, /auf etwa 40 %\./);
  assert.equal(mehrfach.bausteine[2].rechnung, 'Holm: 0,006 · 10 ≈ 0,06 > 0,05');
  assert.match(mehrfach.ausprobieren[0].explain, /bei etwa 64 %\./);
  assert.match(mehrfach.regler!.describe(10), /in etwa 40 von 100 Studien .*p < 0,005\./);
  assert.match(mehrfach.regler!.describe(3), /in etwa 14 von 100 .*p < 0,017\./);
  assert.match(mehrfach.regler!.describe(7), /p < 0,0071\./);
  assert.match(mehrfach.genau.paragraphs[2], /p ≈ 0,021 bei α = 0,05/);
  assert.match(result('multiplicity').kurz, /Von 10 Paarvergleichen .* ohne Korrektur 2 unter 0,05, nach Holm 0\. .*von 0,006 auf 0,06\./);
  assert.match(result('multiplicity', applyOp(rows, 'finanzlage', 'reverse')).kurz, /ohne Korrektur 2 unter 0,05, nach Holm 0\./);
});

test('B9 Effektgröße: Cohens d und Hedges g wie in R', () => {
  const abi = abiturD(ctx({ x: 'lernzeit' }))!;
  assert.ok(close(abi, ABITUR.d, 1e-6) && close(ABITUR.d, 1.0795474, 1e-6), `Abitur d ${abi}`);
  assert.ok(close(ABITUR.sp, 3.2158540, 1e-7) && close(ABITUR.g, 1.0693949, 1e-7) && close(ABITUR.mit - ABITUR.ohne, 3.4716667, 1e-6), 'Abitur');
  const g = gruppenTest(ctx({ x: 'lernzeit', group: 'weiterbildung' }))!;
  assert.ok(close(g.cohen, 0.0224372, 1e-6) && close(g.hedges, 0.0223521, 1e-6), `Weiterbildung d ${g.cohen}, g ${g.hedges}`);
  const s = effekt.compute(effekt.initial);
  assert.ok(close(s.d, 1.0776398, 1e-6) && close(s.u3, 0.8594027, 1e-6), 'Startwerte');
  assert.match(effekt.wofuer, /im Schnitt 9,36 Stunden gelernt, die ohne Schulabschluss 5,88 Stunden\./);
  assert.deepEqual(effekt.worked(s).map(w => w.text), ['R meldet die Mittelwerte 9.355 und 5.883 Stunden. Abitur minus ohne Schulabschluss ergibt 3,47 Stunden.', 'd = 3,47 / 3,22 ≈ 1,08.', 'Nach der Faustregel von Cohen ist ein Betrag von 1,08 ein großer Effekt: ab 0,2 klein, ab 0,5 mittel, ab 0,8 groß.']);
  assert.match(effekt.interpret(s).kurz, /1,08 Standardabweichungen auseinander, .*ein großer Effekt\. .*etwa 86 von 100 Personen/);
  assert.match(effekt.interpret(effekt.compute({ diff: 0.07, s: 3.25 })).kurz, /0,02 Standardabweichungen .*vernachlässigbar/);
  assert.match(effekt.genau.paragraphs[0], /≈ 3,22 Stunden, mit allen Nachkommastellen gerechnet, also d ≈ 1,08\. .*g ≈ 1,07\./);
  assert.match(result('effect').kurz, /0,07 Stunden, bei einer Standardabweichung von 3,25 Stunden .*d ≈ 0,02, nach der Faustregel von Cohen vernachlässigbar\./);
  assert.match(result('effect').fachlich, /Hedges g ≈ 0,02; der Welch-Test ergibt p ≈ 0,88\./);
  assert.equal(result('effect').zusatz, 'Zum Vergleich: Abitur gegen ohne Schulabschluss ergibt d ≈ 1,08.');
});
