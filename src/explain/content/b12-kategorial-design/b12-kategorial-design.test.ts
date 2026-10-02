import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { txt, type SampleCtx } from '../../types';
import { binomTestHalf, counts, dbinom, fourfold, pbinom, pText } from './rechnen';
import { anpassung, gofSample, gofStats, gofTabs, LEHR, SCHULE } from './chisq-gof';
import { ALTER_EW, chiSquareTabs, crossChi, fourStats, unabhaengigkeit, WB_EW } from './chi-square';
import { binomialTabs, binomialTest, pBinom, WEITERBILDUNG } from './binomial-test';

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
