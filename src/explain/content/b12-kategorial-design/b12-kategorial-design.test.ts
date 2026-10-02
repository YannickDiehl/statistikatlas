import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { txt, type SampleCtx } from '../../types';
import { binomTestHalf, counts, dbinom, fisher2x2, fourfold, mcnemar, oddsRatio, pbinom, pText } from './rechnen';
import { anpassung, gofSample, gofStats, gofTabs, LEHR, SCHULE } from './chisq-gof';
import { ALTER_EW, chiSquareTabs, crossChi, fourStats, unabhaengigkeit, WB_EW } from './chi-square';
import { binomialTabs, binomialTest, pBinom, WEITERBILDUNG } from './binomial-test';
import { dFisher, FISHER, fisherSample, fisherTabs, fisherTest, pFisher } from './fisher-test';
import { KURS, mcnemarTabs, mcnemarTest, mcSample, mcStats } from './mcnemar-test';
import { applyOp } from '../../sample';
import { confounding, PLANUNG } from './confounding';
import { causality, LERNEN } from './causality';
import { coinGroups, randomAssignment, TYPISCH } from './random-assignment';

/*
 * Referenzwerte des Bereichs B12, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas oder writeSav(createSurvey())):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   sa <- as.numeric(atlas$schulabschluss); wb <- as.numeric(atlas$weiterbildung); ew <- as.numeric(atlas$erwerbstaetig)
 *   alter <- as.numeric(atlas$alter); kv <- as.numeric(atlas$kurs_vor); kn <- as.numeric(atlas$kurs_nach)
 */
const rows = createSurvey();
const near = (a: number, b: number, tol = 1e-6) => close(a, b, tol);

/*
 * Anpassungstest (chisq_gof):
 *   table(sa)                                             # 42 40 37 41 40
 *   chisq.test(table(sa))                                 # X-squared = 0.35, df = 4, p = 0.9863619994
 *   chisq.test(table(sa), p = c(.1, .2, .3, .2, .2))      # X-squared = 33.04166667, p = 1.171245689e-06
 *   chisq.test(2 * table(sa))$statistic                   # 0.7 (doppelt so viele Befragte)
 *   atlas %>% chisq_gof(schulabschluss)                   # chi2(4) = 0.350, p = 0.986, N = 200
 *   atlas %>% chisq_gof(schulabschluss, expected = c(.1, .2, .3, .2, .2))   # chi2(4) = 33.042, p < 0.001
 *   atlas %>% chisq_gof(lernzeit)                         # Error: `lernzeit` appears to be a continuous variable.
 */
test('B12 Anpassung: Häufigkeiten, χ² und p wie in R', () => {
  assert.deepEqual(counts(rows, 'schulabschluss', [0, 1, 2, 3, 4]), SCHULE, 'Schulabschlüsse im Lehrdatensatz');
  const g = gofStats({ o: SCHULE, pct: [20, 20, 20, 20, 20] }), l = gofStats({ o: SCHULE, pct: LEHR });
  assert.ok(near(g.chi2, 0.35) && near(g.p, 0.9863619994) && g.df === 4, `gleich häufig: ${g.chi2}, ${g.p}`);
  assert.ok(near(l.chi2, 33.04166667) && near(l.p, 1.171245689e-6, 1e-12), `Lehrhypothese: ${l.chi2}, ${l.p}`);
  assert.ok(near(gofStats({ o: SCHULE.map(x => x * 2), pct: [20, 20, 20, 20, 20] }).chi2, 0.7), 'verdoppelt');
  assert.deepEqual(l.e.map(e => Math.round(e)), [20, 40, 60, 40, 40]);
  const c = { s: g, who: 2, names: anpassung.names };
  assert.equal(txt(anpassung.steps[1].rechnung, c), 'Mittlerer Abschluss: 37 − 40 = −3, also 3 Personen weniger als erwartet.');
  assert.equal(txt(anpassung.steps[4].rechnung, c), '0,1 + 0 + 0,23 + 0,025 + 0 ≈ 0,35. Die gerundeten Beiträge ergäben 0,36; mit allen Nachkommastellen sind es 0,35. „Mittlerer Abschluss“ steuert 0,23 bei, das sind 64 % von χ².');
  assert.match(txt(anpassung.steps[5].rechnung, c), /df = 5 − 1 = 4\. .*mindestens 0,35 in etwa 99 von 100 Stichproben vor \(p ≈ 0,99\)/);
  assert.match(anpassung.variants.chisq_gof.interpret({ s: l, who: 0, names: anpassung.names }).kurz, /„Ohne Schulabschluss“: 42 statt 20\. .*33,04 in weniger als 1 von 1\.000/);
  assert.match(txt(anpassung.think[2].explain, c), /20, 40, 60, 40, 40\. .*42 statt 20, .*37 statt 60\. .*33,04/);
  // Auswertung mit allen 200 wie mariposa (nur beobachtete Kategorien)
  const ctx: SampleCtx = { rows, columns: { x: ['schulabschluss'] } }, s = gofSample(ctx)!;
  assert.ok(near(s.chi2, 0.35) && near(s.p, 0.9863619994), 'Auswertung wie chisq_gof()');
  assert.match(gofTabsResult(ctx), /37- bis 42-mal vor; gleich häufig wären je 40\. .*0,35 in etwa 99 von 100/);
});
const gofTabsResult = (c: SampleCtx) => { const s = gofTabs.sample!; return s.kind === 'analysis' ? s.result(c).kurz : ''; };

/*
 * Unabhängigkeit (chi_square), Vierfeldertafeln:
 *   t1 <- table(wb, ew)                                   # 40 78 / 23 59
 *   chisq.test(t1, correct = FALSE)                       # X-squared = 0.7671952084, p = 0.381086138; expected 37.17 80.83 / 25.83 56.17
 *   chisq.test(t1, correct = TRUE)$statistic              # 0.5200497031 (Yates; mariposa correct = TRUE: chi2(1) = 0.520)
 *   sqrt(0.7671952084 / 200)                              # 0.06193525686 (Cramér-V, mariposa: V = 0.062)
 *   chisq.test(2 * t1, correct = FALSE)$statistic         # 1.534390417 (verdoppelt)
 *   t2 <- table(alter >= 66, ew)                          # 34 137 / 29 0
 *   chisq.test(t2, correct = FALSE)                       # X-squared = 73.75847025, p = 8.828463274e-18; expected 53.865 117.135 / 9.135 19.865
 *   chisq.test(t2, correct = TRUE)$statistic              # 70.09221182; sqrt(73.75847025 / 200) = 0.6072827605
 *   chisq.test(matrix(c(30, 30, 70, 70), 2), correct = FALSE)$statistic   # 0
 *   59 / 82; 78 / 118; 137 / 200                          # 0.7195122 0.6610169 0.685
 *   Auswertung mit allen 200 (Leitaufruf In R):
 *   chisq.test(table(sa, wb))                             # X-squared = 3.082032574, df = 4, p = 0.5441925335, min(expected) = 15.17
 *   prop.table(table(sa, wb), 1)[, 2]                     # 0.4048 0.3000 0.4595 0.4146 0.4750
 *   atlas %>% chi_square(schulabschluss, weiterbildung, correct = FALSE)  # chi2(4) = 3.082, p = 0.544, V = 0.124 (small), N = 200
 *   atlas %>% chi_square(schulabschluss)                  # Error: Exactly two variables must be specified for `chi_square()`.
 */
test('B12 Unabhängigkeit: Vierfeldertafeln, erwartete Zahlen, χ², Yates und Cramér-V wie in R', () => {
  assert.deepEqual(fourfold(rows, 'weiterbildung', 'erwerbstaetig'), [[40, 78], [23, 59]], 'Weiterbildung und Erwerbstätigkeit');
  const old = rows.map(r => ({ ...r, values: { ...r.values, alt: r.values.alter >= 66 ? 1 : 0 } }));
  assert.deepEqual(fourfold(old, 'alt', 'erwerbstaetig'), [[34, 137], [29, 0]], 'Alter und Erwerbstätigkeit');
  assert.deepEqual(WB_EW.o, [40, 78, 23, 59]); assert.deepEqual(ALTER_EW.o, [34, 137, 29, 0]);
  const w = fourStats(WB_EW), a = fourStats(ALTER_EW);
  assert.deepEqual(w.e.map(e => Math.round(e * 100) / 100), [37.17, 80.83, 25.83, 56.17]);
  assert.ok(near(w.chi2, 0.7671952084) && near(w.p, 0.381086138) && near(w.yates, 0.5200497031) && near(w.v, 0.06193525686), `wb: ${w.chi2} ${w.p} ${w.yates}`);
  assert.ok(near(a.chi2, 73.75847025) && near(a.p, 8.828463274e-18, 1e-20) && near(a.yates, 70.09221182) && near(a.v, 0.6072827605), `alter: ${a.chi2}`);
  assert.ok(near(a.e[2], 9.135) && near(a.e[0], 53.865));
  assert.ok(near(fourStats({ ...WB_EW, o: WB_EW.o.map(x => 2 * x) }).chi2, 1.534390417), 'verdoppelt');
  assert.ok(near(fourStats({ ...WB_EW, o: [30, 70, 30, 70] }).chi2, 0), 'gleiche Anteile');
  assert.ok(near(w.shares[1], 59 / 82) && near(w.shares[0], 78 / 118) && near(w.overall, 0.685));
  const c = { s: w, who: 0, names: unabhaengigkeit.names };
  assert.equal(txt(unabhaengigkeit.steps[0].rechnung, c), 'Zelle a (ohne Weiterbildung, nicht erwerbstätig): 118 · 63 / 200 = 7.434 / 200 = 37,17.');
  assert.equal(txt(unabhaengigkeit.steps[4].rechnung, c), '0,22 + 0,099 + 0,31 + 0,14 ≈ 0,77. Zelle a steuert 0,22 bei, das sind 28 % von χ².');
  assert.match(txt(unabhaengigkeit.steps[1].rechnung, { ...c, s: a, who: 2 }), /29 − 9,1[34] ≈ \+19,87/);
  const i = unabhaengigkeit.variants.chi_square.interpret(c);
  assert.match(i.kurz, /mit Weiterbildung sind 72 % erwerbstätig, von denen ohne Weiterbildung 66,1 %\. .*0,77 in etwa 38 von 100/);
  assert.match(i.fachlich, /χ² = 0,77 bei 1 Freiheitsgrad, p ≈ 0,38; Cramér-V ≈ 0,06\. Die kleinste erwartete Zellhäufigkeit ist 25,83/);
  assert.match(unabhaengigkeit.variants.chi_square.genau.paragraphs(c)[0], /χ² ≈ 0,52 statt 0,77/);
  assert.match(unabhaengigkeit.wofuer, /72 % gegen 66 %/);
  // Auswertung mit allen 200: Schulabschluss und Weiterbildung
  const ctx: SampleCtx = { rows, columns: { x: ['schulabschluss'], y: ['weiterbildung'] } }, r = crossChi(ctx)!;
  assert.ok(near(r.chi2, 3.082032574) && near(r.p, 0.5441925335) && near(r.v, 0.1241376771) && near(r.minE, 15.17) && r.df === 4, `sa × wb: ${r.chi2}`);
  const s = chiSquareTabs.sample!;
  if (s.kind === 'analysis') {
    const res = s.result(ctx);
    assert.match(res.kurz, /von 30 % \(Haupt-\/Volksschulabschluss\) bis 47,5 % \(Abitur \/ fachgebundene Hochschulreife\)\. .*3,08 in etwa 54 von 100/);
    assert.match(res.fachlich, /χ² = 3,08 bei 4 Freiheitsgraden, p ≈ 0,54; Cramér-V ≈ 0,12\./);
    assert.match(res.zusatz!, /15,17/);
  }
});

/*
 * Binomialtest (binomial_test), wie mariposa bei p = .5: 2 * min(pbinom(k, 200, .5), pbinom(k − 1, 200, .5, lower.tail = FALSE)):
 *   table(wb)                                             # 118 82
 *   binom.test(82, 200)                                   # p = 0.01313035594, CI 0.3411306457 0.4815784148
 *   pbinom(82, 200, .5)                                   # 0.00656517797 (je Rand)
 *   k = 90 → 0.1789640395; k = 95 → 0.5246223557; k = 118 → 0.01313035594; k = 86 → 0.05596574049; k = 70 → 2.65287556e-05; k = 60 → 1.507061557e-08
 *   binom.test(52, 100)$p.value; binom.test(5200, 10000)$p.value   # 0.7643534344; 6.593515599e-05
 *   binom.test(820, 2000)$p.value                         # 8.350476972e-16
 *   atlas %>% binomial_test(weiterbildung, p = .5)        # Group 1 (Ja): prop = 0.410 vs 0.500, p = 0.013 *, N = 200
 *   atlas %>% binomial_test(schulabschluss, p = .5)       # Error: `schulabschluss` has 5 observed categories; the binomial test needs exactly 2 categories.
 *   atlas %>% binomial_test(weiterbildung, p = 50)        # Error: `p` must be between 0 and 1.
 *   atlas %>% mutate(weiterbildung = rec(weiterbildung, rules = "1=0; 0=0")) %>% binomial_test(weiterbildung, p = .5)
 *                                                         # Error: `weiterbildung` has 1 observed category; the binomial test needs exactly 2 categories.
 */
test('B12 Binomialtest: Anteil mit Weiterbildung, p-Werte des Reglers und Beispiele wie in R', () => {
  assert.equal(rows.filter(r => r.values.weiterbildung === 1).length, WEITERBILDUNG.ja);
  for (const [k, p] of [[82, 0.01313035594], [90, 0.1789640395], [95, 0.5246223557], [118, 0.01313035594], [86, 0.05596574049], [70, 2.65287556e-05], [60, 1.507061557e-08], [100, 1]] as const)
    assert.ok(near(pBinom(k), p, Math.max(1e-12, p * 1e-6)), `k = ${k}: ${pBinom(k)} ≠ R ${p}`);
  assert.ok(near(pbinom(82, 200, 0.5), 0.00656517797) && near(WEITERBILDUNG.lowerTail, 0.00656517797));
  assert.ok(near(binomTestHalf(52, 100), 0.7643534344) && near(binomTestHalf(5200, 10000), 6.593515599e-05, 1e-10) && binomTestHalf(820, 2000) < 1e-15);
  assert.ok(near(WEITERBILDUNG.p, 0.01313035594) && near(WEITERBILDUNG.ciLo, 0.3411306457) && near(WEITERBILDUNG.ciHi, 0.4815784148));
  assert.ok(near(dbinom(100, 200, 0.5), 0.05634847901), 'dbinom(100, 200, .5)');
  assert.equal(pText(pBinom(82)), 'p ≈ 0,013');
  assert.match(binomialTest.bausteine[2].rechnung!, /0,0066 \+ 0,0066 ≈ 0,013\. .*in etwa 13 von 1\.000 Stichproben/);
  assert.match(binomialTest.ausprobieren[0].explain, /p steigt auf etwa 0,18/);
  assert.match(binomialTest.ausprobieren[2].explain, /p ≈ 0,013/);
  assert.match(binomialTest.regler!.describe(95), /in etwa 52 von 100 Stichproben .*\(p ≈ 0,52\)/);
  assert.match(binomialTest.fuerDich, /p ≈ 0,76.*p < 0,001/);
  assert.match(binomialTest.genau.paragraphs[2], /von 0,34 bis 0,48/);
  const s = binomialTabs.sample!;
  if (s.kind === 'analysis') {
    const res = s.result({ rows, columns: { x: ['weiterbildung'] } });
    assert.match(res.kurz, /^82 von 200 Befragten .* das sind 41 %\. .*in etwa 13 von 1\.000 Stichproben mindestens so weit von 100 entfernt \(p ≈ 0,013\)/);
  }
});

/*
 * Fisher (fisher_test), Vierfeldertafel Weiterbildung (Zeilen) und Erwerbstätigkeit (Spalten), Ränder 118/82 und 63/137:
 *   t <- matrix(c(40, 23, 78, 59), 2); fisher.test(t)      # p = 0.4400503626, odds ratio (bedingte Schätzung) 1.313701046
 *   (40 * 59) / (78 * 23)                                  # 1.315496098 (mariposa: OR = 1.315 [0.712, 2.432])
 *   82 * 137 / 200; dhyper(59, 137, 63, 82)                # 56.17; 0.08471393266
 *   k <- 40:72; sapply(k, function(x) fisher.test(matrix(c(x - 19, 82 - x, 137 - x, x), 2))$p.value)
 *     # k = 40: 1.045216758e-06; 56: 1; 59: 0.4400503626; 62: 0.08869647287; 64: 0.01997903469; 72: 5.471139346e-07
 *   chisq.test(t, correct = FALSE)$p.value                 # 0.381086138
 *   atlas %>% fisher_test(row = weiterbildung, col = erwerbstaetig)   # p = 0.440, OR = 1.315 [0.712, 2.432], N = 200
 *   atlas %>% fisher_test(row = erwerbstaetig, col = weiterbildung)   # dasselbe: p = 0.440, OR = 1.315
 *   atlas %>% fisher_test(row = weiterbildung)             # Error: Argument `col` is missing, with no default.
 *   atlas %>% fisher_test(row = lernzeit, col = erwerbstaetig)   # Error: `row` variable `lernzeit` appears to be continuous. ...
 */
test('B12 Fisher: exakte p-Werte, Odds Ratio und die Rechnung mit allen 200 wie in R', () => {
  assert.deepEqual(fourfold(rows, 'weiterbildung', 'erwerbstaetig'), [[40, 78], [23, 59]]);
  assert.ok(near(fisher2x2([[40, 78], [23, 59]]), 0.4400503626) && near(FISHER.p, 0.4400503626) && near(FISHER.pChi, 0.381086138));
  assert.ok(near(oddsRatio([[40, 78], [23, 59]])!, 1.315496098) && near(FISHER.or, 1.315496098) && near(FISHER.expected, 56.17) && near(dFisher(59), 0.08471393266));
  for (const [k, p] of [[40, 1.045216758e-06], [56, 1], [59, 0.4400503626], [62, 0.08869647287], [64, 0.01997903469], [72, 5.471139346e-07]] as const)
    assert.ok(near(pFisher(k), p, Math.max(1e-13, p * 1e-6)), `k = ${k}: ${pFisher(k)} ≠ R ${p}`);
  assert.match(fisherTest.stellDirVor.text, /etwa 56,17 Erwerbstätige\. Fisher meldet in R p = 0\.440, der Chi-Quadrat-Test p = 0\.381\./);
  assert.match(fisherTest.bausteine[1].rechnung!, /in etwa 85 von 1\.000/);
  assert.match(fisherTest.ausprobieren[0].explain, /p fällt auf etwa 0,02/);
  assert.match(fisherTest.ausprobieren[2].explain, /aus 1,32 wird 0,76/);
  assert.match(fisherTest.regler!.describe(64), /78 % erwerbstätig, von denen ohne 61,9 %\. .*in etwa 20 von 1\.000 .*\(p ≈ 0,020\)/);
  assert.match(fisherTest.regler!.describe(56), /\(p = 1\)/);
  assert.match(fisherTest.genau.paragraphs[1], /≈ 1,32, mit einem 95-%-Intervall von 0,71 bis 2,43\. .*1,31/);
  const ctx = { rows, columns: { x: ['weiterbildung'], y: ['erwerbstaetig'] } }, f = fisherSample(ctx)!;
  assert.ok(near(f.p, 0.4400503626) && near(f.or!, 1.315496098) && near(f.pChi, 0.381086138));
  const flipped = fisherSample({ ...ctx, rows: applyOp(rows, 'erwerbstaetig', 'reverse') })!;
  assert.ok(near(flipped.p, 0.4400503626) && near(flipped.or!, 1 / 1.315496098), 'umgepolt: gleiches p, Kehrwert des Odds Ratio');
  const s = fisherTabs.sample!;
  if (s.kind === 'analysis') assert.match(s.result(ctx).kurz, /Von den 82 Befragten mit Weiterbildung sind 72 % erwerbstätig, von den 118 ohne 66,1 %\. .*in etwa 44 von 100/);
});

/*
 * McNemar (mcnemar_test), Kurszuversicht vorher (kv) und nachher (kn):
 *   table(kv, kn)                                          # 71 46 / 9 74: b = 46 (Nein → Ja), c = 9 (Ja → Nein)
 *   sum(kv); sum(kn)                                       # 83; 120
 *   mcnemar.test(table(kv, kn))                            # McNemar's chi-squared = 23.564, p = 1.208499116e-06
 *   mcnemar.test(table(kv, kn), correct = FALSE)           # 24.89090909
 *   binom.test(46, 55)$p.value                             # 4.336383137e-07 (mariposa: p < 0.001 (exact))
 *   (abs(10 - 4) - 1)^2 / 14; (10 - 4)^2 / 14              # 1.785714286; 2.571428571 (Kontrollfrage)
 *   (abs(10 - 10) - 1)^2 / 20                              # 0.05 (b = c, nicht bei 0 abgeschnitten)
 *   mc <- function(b, c) (abs(b - c) - 1)^2 / (b + c)
 *   mc(sum(kv == 0), 0); mc(sum(kn == 1), 0); mc(200, 0)   # 115.008547 (nachher alle Ja); 118.0083333 (vorher alle Nein); 198.005 (beides)
 *   atlas %>% mcnemar_test(kurs_vor, kurs_nach, correct = TRUE)   # chi2(1) = 23.564 (cc), p < 0.001 (asymptotic), p < 0.001 *** (exact), N = 200
 *   atlas %>% mcnemar_test(kurs_vor, schulabschluss)       # Error: `var2` must be dichotomous (exactly 2 levels).
 */
test('B12 McNemar: Wechsel, χ² mit und ohne Korrektur, exakter p-Wert und die Vorhersagen wie in R', () => {
  assert.deepEqual(fourfold(rows, 'kurs_vor', 'kurs_nach'), [[71, 46], [9, 74]]);
  const s = mcStats({ b: KURS.b, c: KURS.c });
  assert.ok(near(s.chi2, 23.56363636) && near(s.raw, 24.89090909) && near(s.p, 1.208499116e-06, 1e-12) && near(s.exact, 4.336383137e-07, 1e-12), `${s.chi2} ${s.p} ${s.exact}`);
  assert.ok(near(mcnemar(10, 4)!.chi2, 1.785714286) && near(mcnemar(10, 4, false)!.chi2, 2.571428571) && near(mcnemar(10, 10)!.chi2, 0.05));
  assert.ok(near(mcnemarTest.check.answer, 1.785714286), 'Kontrollfrage');
  assert.match(mcnemarTest.check.diagnose(36 / 14), /^Fast! Das ist χ² ohne Korrektur/);
  const flat = (n: unknown[]): string => n.map(x => typeof x === 'string' ? x : x && typeof x === 'object' && 'part' in x ? flat((x as { part: unknown[] }).part) : '').join('');
  assert.equal(flat(mcnemarTest.numeric(s)), 'χ² = (|46 − 9| − 1)² / (46 + 9) = 36² / 55 = 1.296 / 55 ≈ 23,56');
  assert.match(mcnemarTest.genau.paragraphs[0], /37² \/ 55 ≈ 24,89/);
  assert.match(mcnemarTest.compare(s), /Ohne Korrektur wäre χ² = 24,89, mit Korrektur 23,56/);
  const ctx = { rows, columns: { x: ['kurs_vor'], y: ['kurs_nach'] } }, m = mcSample(ctx);
  assert.deepEqual([m.b, m.c, m.vorher, m.nachher], [46, 9, KURS.vorher, KURS.nachher]);
  const v = mcnemarTabs.sample!;
  if (v.kind === 'analysis') {
    assert.ok(near(v.value!({ ...ctx, rows: applyOp(rows, 'kurs_nach', 'constant', 1) })!, 115.008547), 'nachher alle Ja');
    assert.ok(near(v.value!({ ...ctx, rows: applyOp(rows, 'kurs_vor', 'constant', 0) })!, 118.0083333), 'vorher alle Nein');
    assert.ok(near(v.value!({ ...ctx, rows: applyOp(applyOp(rows, 'kurs_vor', 'constant', 0), 'kurs_nach', 'constant', 1) })!, 198.005), 'beides');
    assert.match(v.result(ctx).kurz, /^46 Befragte trauen sich .*; 9 andersherum\. .*weniger als 1 von 1\.000 Stichproben vor \(p < 0,001\)/);
  }
});

/*
 * Confounding und Kausalität (Lehrdatensatz):
 *   plan <- as.numeric(atlas$lernplanung5); wiss <- as.numeric(atlas$wissenstest); lern <- as.numeric(atlas$lernzeit)
 *   cor(plan, wiss); cor(plan, lern); cor(lern, wiss)      # 0.1625442706; 0.3408014766; 0.5391688537
 *   atlas %>% pearson_cor(lernplanung5, wissenstest)       # r = 0.163, p = 0.021 *, N = 200
 *   atlas %>% partial_cor(lernplanung5, wissenstest, controls = lernzeit)   # partial r = -0.027, p = 0.707 (zero-order r = 0.163)
 *   planer <- plan >= 4; sum(planer)                       # 88 (andere 112)
 *   tapply(wiss, planer, mean); tapply(lern, planer, mean) # 9.75 / 10.60227273; 7.029464286 / 8.670454545
 *   viel <- lern > median(lern); median(lern)              # 7.6
 *   tapply(wiss, list(planer, viel), mean)                 # bis 7,6 h: 9.34375 (32) gegen 9.014492754 (69); über: 11.32142857 (56) gegen 10.93023256 (43)
 *   tapply(wiss, viel, mean); table(viel)                  # 9.118811881 (101), 11.15151515 (99)
 *   atlas %>% filter(id == "P002") %>% select(lernzeit, wissenstest)   # 8.3, 9
 *   tapply(lern, atlas$weiterbildung, mean)                # 7.781355932 (ohne), 7.708536585 (mit)
 */
test('B12 Confounding und Kausalität: Zusammenhänge und Vergleiche im Lehrdatensatz wie in R', () => {
  const plan = rows.map(r => r.values.lernplanung5), wiss = rows.map(r => r.values.wissenstest), lern = rows.map(r => r.values.lernzeit);
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const cor = (x: number[], y: number[]) => { const mx = avg(x), my = avg(y); let sxy = 0, sxx = 0, syy = 0; x.forEach((v, i) => { sxy += (v - mx) * (y[i] - my); sxx += (v - mx) ** 2; syy += (y[i] - my) ** 2; }); return sxy / Math.sqrt(sxx * syy); };
  const r12 = cor(plan, wiss), r13 = cor(plan, lern), r23 = cor(wiss, lern), partial = (r12 - r13 * r23) / Math.sqrt((1 - r13 ** 2) * (1 - r23 ** 2));
  assert.ok(near(r12, PLANUNG.r) && near(r13, PLANUNG.rPlanLern) && near(r23, PLANUNG.rLernWiss) && near(partial, PLANUNG.partial), `${r12} ${partial}`);
  const planer = (i: number) => plan[i] >= 4, pick = (f: (i: number) => boolean, xs: number[]) => xs.filter((_, i) => f(i));
  assert.equal(pick(planer, wiss).length, PLANUNG.nPlaner);
  assert.ok(near(avg(pick(planer, wiss)), PLANUNG.wissPlaner) && near(avg(pick(i => !planer(i), wiss)), PLANUNG.wissAndere));
  assert.ok(near(avg(pick(planer, lern)), PLANUNG.lernPlaner) && near(avg(pick(i => !planer(i), lern)), PLANUNG.lernAndere));
  const viel = (i: number) => lern[i] > 7.6;
  assert.ok(near(avg(pick(i => planer(i) && !viel(i), wiss)), PLANUNG.wenig.planer) && near(avg(pick(i => !planer(i) && !viel(i), wiss)), PLANUNG.wenig.andere));
  assert.ok(near(avg(pick(i => planer(i) && viel(i), wiss)), PLANUNG.viel.planer) && near(avg(pick(i => !planer(i) && viel(i), wiss)), PLANUNG.viel.andere));
  assert.ok(near(avg(pick(viel, wiss)), LERNEN.viel) && near(avg(pick(i => !viel(i), wiss)), LERNEN.wenig) && pick(viel, wiss).length === LERNEN.nViel);
  const p002 = rows.find(r => r.id === 'P002')!.values;
  assert.deepEqual([p002.lernzeit, p002.wissenstest], [LERNEN.p002.lernzeit, LERNEN.p002.wissenstest]);
  assert.match(confounding.stellDirVor.text, /88 Befragte .* 10,6 Aufgaben, die übrigen 112 nur 9,75\. .* 8,67 statt 7,03 Stunden/);
  assert.match(confounding.bausteine[2].rechnung!, /9,34 gegen 9,01 .* 11,32 gegen 10,93\. .*: −0,03\./);
  assert.ok(PLANUNG.wenig.planer - PLANUNG.wenig.andere < (PLANUNG.wissPlaner - PLANUNG.wissAndere) / 2 && PLANUNG.viel.planer - PLANUNG.viel.andere < (PLANUNG.wissPlaner - PLANUNG.wissAndere) / 2, 'schrumpft auf weniger als die Hälfte');
  assert.match(causality.stellDirVor.text, /r = 0,54\. Die 99 Befragten mit mehr als 7,6 Stunden .* 11,15 Aufgaben, die übrigen 101 nur 9,12\./);
  assert.match(causality.ausprobieren[1].question, /7,71 Stunden, die ohne 7,78/);
});

/*
 * Zufällige Zuweisung: Münzwurf mit dem Zufallsgenerator des Lehrdatensatzes (LCG aus src/domain/survey.ts), in R:
 *   coin <- function(seed, k = 200) { state <- seed %% 2^32; g <- integer(k)
 *     for (i in 1:k) { state <- (1664525 * state + 1013904223) %% 2^32; g[i] <- as.integer(state / 2^32 < 0.5) }; g }
 *   for (v in 1:10) { g <- coin(v); c(sum(g == 1), mean(lern[g == 1]), mean(lern[g == 0]), mean(alter[g == 1]), mean(alter[g == 0]),
 *                                    mean(sa[g == 1] == 4), mean(sa[g == 0] == 4)) }
 *     # v = 1: 101 7.795050 7.707071 47.287129 46.828283 0.178218 0.222222
 *     # v = 4: 106 7.369811 8.181915 49.094340 44.765957 0.188679 0.212766
 *     # v = 7: 102 7.396078 8.121429 ...; v = 10: 103 7.669903 7.838144
 *   sd(lern) * sqrt(2 / 100); sd(lern) * sqrt(2 / 1000)    # 0.4578538037; 0.1447860855
 */
test('B12 Zufällige Zuweisung: Münzwürfe und typische Zufallsunterschiede wie in R', () => {
  const R: [number, number, number, number, number, number, number, number][] = [
    [1, 101, 7.795050, 7.707071, 47.287129, 46.828283, 0.178218, 0.222222],
    [2, 89, 7.667416, 7.818919, 49.078652, 45.441441, 0.224719, 0.180180],
    [3, 99, 7.732323, 7.770297, 47.444444, 46.683168, 0.232323, 0.168317],
    [4, 106, 7.369811, 8.181915, 49.094340, 44.765957, 0.188679, 0.212766],
    [5, 115, 7.634783, 7.909412, 47.400000, 46.600000, 0.191304, 0.211765],
    [6, 102, 7.861765, 7.636735, 46.088235, 48.071429, 0.176471, 0.224490],
    [7, 102, 7.396078, 8.121429, 47.176471, 46.938776, 0.215686, 0.183673],
    [8, 107, 7.438318, 8.111828, 46.514019, 47.688172, 0.168224, 0.236559],
    [9, 109, 7.511927, 8.038462, 46.541284, 47.681319, 0.229358, 0.164835],
    [10, 103, 7.669903, 7.838144, 46.233010, 47.938144, 0.213592, 0.185567],
  ];
  for (const [v, nA, lA, lB, aA, aB, bA, bB] of R) {
    const g = coinGroups(v);
    assert.ok(g.a.n === nA && g.b.n === 200 - nA, `Münzwurf ${v}: Gruppengröße`);
    for (const [mine, r] of [[g.a.lernzeit, lA], [g.b.lernzeit, lB], [g.a.alter, aA], [g.b.alter, aB], [g.a.abitur, bA], [g.b.abitur, bB]]) assert.ok(near(mine, r, 1e-5), `Münzwurf ${v}: ${mine} ≠ R ${r}`);
  }
  const s = rows.map(r => r.values.lernzeit), m = s.reduce((a, b) => a + b, 0) / s.length, sd = Math.sqrt(s.reduce((a, x) => a + (x - m) ** 2, 0) / (s.length - 1));
  assert.ok(near(sd, TYPISCH.sd) && near(sd * Math.sqrt(2 / 100), TYPISCH.n100) && near(sd * Math.sqrt(2 / 1000), TYPISCH.n1000));
  assert.match(randomAssignment.stellDirVor.text, /7,8 und 7,71 Stunden\. .* 8,67 und 7,03 Stunden/);
  assert.match(randomAssignment.bausteine[1].rechnung!, /101 und 99 Befragte; Lernzeit 7,8 und 7,71 h; Alter 47,29 und 46,83 Jahre; Abitur 17,8 % und 22,2 %/);
  assert.match(randomAssignment.regler!.describe(4), /106 Befragte, Gruppe B 94\. .* 7,37 und 8,18 Stunden, ein Unterschied von 0,81 Stunden.* 1,64 Stunden\./);
  assert.match(randomAssignment.ausprobieren[0].explain, /etwa 0,46 Stunden/);
  assert.match(randomAssignment.ausprobieren[1].explain, /von 0,46 auf 0,14 Stunden/);
});
