import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSurvey } from '../../../domain/survey';
import { readSav } from '../../../sandbox/readSav';
import { applyOp } from '../../sample';
import { close } from '../../format';
import { ALLBUS, INTERESSE, VERTRAUEN } from './daten';
import { haelften, kopienSE, sampling, samplingTabs } from './sampling';
import { parameter, populationParameter, populationParameterTabs } from './population-parameter';
import { LERNZEIT, estimator, estimatorTabs, schaetzungen } from './estimator';
import { ANTEIL_N, WEITERBILDUNG, anteilText, mittelwerte, samplingDistribution, samplingDistributionTabs, seAnteil } from './sampling-distribution';
import { HAUSHALT, HAUSHALT_KENNWERTE, HAUSHALT_N, binomial, haushaltMittel, middle95 } from './daten';
import { GLOCKE_N, centralLimit, centralLimitTabs, einkommenSchiefe, glockeText, schiefeMittel } from './central-limit';
import { PLANUNG, VERZERRUNG_N, bereichText, bereiche, samplingBias, samplingBiasTabs, verzerrung } from './sampling-bias';
import { EINKOMMEN, auswahl, auswahlText, moeglich, randomSampling, randomSamplingTabs, seOhne, zehnerPotenz } from './random-sampling';
import { confidence, confidenceTabs, intervall, kritisch, lernzeitKi } from './confidence';
import { GERADE, predictionInterval, predictionIntervalTabs, vorhersage, vorhersageDaten } from './prediction-interval';
import { gerade } from './daten';
import { CATALOG_OUTPUT } from '../../catalogOutput';
import { GESETZ_N, daneben, gesetz, lawLargeNumbers, lawLargeNumbersTabs, wieOft } from './law-large-numbers';

/*
 * Referenzwerte des Bereichs B8, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand).
 *
 * Lehrdatensatz, gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas oder writeSav(createSurvey())):
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   x <- as.numeric(atlas$lernzeit)
 *   mean(x[1:100]); mean(x[101:200]); mean(x)                 # 7.824  7.679  7.7515
 *   cor(1:200, x)                                             # 0.0168: Die Nummern sagen nichts über die Lernzeit
 *   atlas %>% slice(1:20) %>% summarise(xq = mean(lernzeit), p = mean(weiterbildung))   # 7.43  0.35 (P001 bis P020)
 *   mean(as.numeric(atlas$weiterbildung))                     # 0.41
 *   sum(x); median(x); var(x); var(x) * 199 / 200             # 1550.3  7.6  10.48150528  10.42909775
 *   atlas %>% describe(lernzeit, show = c("mean", "median", "var"))   # Mean 7.752, Median 7.600, Variance 10.482
 *   range(sapply(1:200, function(k) { xx <- x; xx[k] <- 40; mean(xx) - mean(x) }))   # +0.108 bis +0.200: steigt immer
 *   median(x + 1)                                             # 8.6
 *   sig <- sqrt(mean((x - mean(x))^2)); sig; sig / 5          # 3.229411  0.645882 (σ der 200, SE bei 25 Ziehungen)
 *   range(sapply(1:200, function(k) { xx <- x; xx[k] <- 40; sqrt(mean((xx - mean(xx))^2)) - sig }))   # +0.650 bis +0.721
 *   p <- 0.41; for (n in c(5, 10, 20, 50, 100, 200, 500, 1000))      # Anteil mit Weiterbildung, n Ziehungen mit Zurücklegen
 *     print(c(n, 100 * sqrt(p * (1 - p) / n), qbinom(.025, n, p) / n, qbinom(.975, n, p) / n,
 *             pbinom(qbinom(.975, n, p), n, p) - pbinom(qbinom(.025, n, p) - 1, n, p)))
 *   #   5 21.995 0.00 0.80 0.98841     10 15.553 0.10 0.70 0.98032     20 10.998 0.20 0.65 0.97885
 *   #  50  6.956 0.28 0.54 0.95703    100  4.918 0.31 0.51 0.96778    200  3.478 0.34 0.48 0.96318
 *   # 500  2.200 0.368 0.454 0.95446  1000 1.555 0.380 0.441 0.95371
 *   1.96 * sqrt(0.25 / 1000)                                  # 0.03099 (plus minus 3 Prozentpunkte)
 *   # mehr als 5 Prozentpunkte neben 41 % (ganzzahlig verglichen: |200 k − 82 n| · 20 > 200 n):
 *   for (n in c(10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000)) { k <- 0:n
 *     print(sum(dbinom(k, n, 0.41)[abs(200 * k - 82 * n) * 20 > 200 * n])) }
 *   # 0.7496966 0.6552191 0.3885462 0.2633219 0.1309173 0.02031882 0.001156979 4.838542e-06 5.8997e-13 2.78257e-24
 *   # umgepolt (π = 0,59) bei n = 100: 0.2633219; alle mit Weiterbildung (π = 1): 0
 *   e <- as.numeric(atlas$einkommen); g1 <- function(v) { m <- mean(v); mean((v - m)^3) / mean((v - m)^2)^1.5 }
 *   g1(e); g1(e) / sqrt(30); mean(e)                          # 0.7855733  0.1434254  3154.62 (gleich nach mal 2 und plus 100)
 *   range(sapply(1:200, function(k) { ee <- e; ee[k] <- 30000; g1(ee) - g1(e) }))   # +6.49 bis +6.76; nach mal 2: +1.46 bis +1.53
 *   range(sapply(1:200, function(k) { ee <- e; ee[k] <- 30000; g1(ee) / sqrt(30) }))  # 1.328944 bis 1.377220: noch deutlich schief (P001: 7.302735 / 1.333291)
 *   atlas %>% describe(einkommen, show = c("mean", "skew"))   # Skewness 0.792 (mit Kleinstichprobenkorrektur)
 *   atlas %>% filter(lernplanung5 >= 4) %>% summarise(n = n(), m = mean(lernzeit))   # 88  8.670455 (Verzerrung +0.918955)
 *   s <- x[as.numeric(atlas$lernplanung5) >= 4]; sN <- function(v) sqrt(mean((v - mean(v))^2))
 *   sN(s); sN(x); sd(s) / sqrt(length(s))                     # 2.743014  3.229411  0.294082
 *   for (n in c(10, 25, 50, 100, 250, 500, 1000, 5000))       # Bereiche ± 1.96 σ / √n: Online-Umfrage und Zufallsstichprobe
 *     print(c(mean(s) + c(-1, 1) * 1.96 * sN(s) / sqrt(n), mean(x) + c(-1, 1) * 1.96 * sN(x) / sqrt(n)))
 *   # n = 10: 6.970 10.371 | 5.750 9.753;  n = 50: 7.910 9.431 | 6.856 8.647;  n = 100: 8.133 9.208 | 7.119 8.384
 *   # n = 5000: 8.594 8.746 | 7.662 7.841
 *   choose(200, 50); mean(e); sd(e)                           # 4.538584e+47  3154.62  1426.646148
 *   for (n in c(10, 50, 100, 150, 190, 200)) print(sqrt(1 - n / 200) * sd(e) / sqrt(n))   # 439.72 174.73 100.88 58.24 23.14 0
 *   sqrt(mean((e - mean(e))^2)) / sqrt(50)                    # 201.2532 (mit Zurücklegen)
 *   range(sapply(1:200, function(k) { ee <- e; ee[k] <- 30000; sd(ee) - sd(e) }))   # +917.4 bis +948.0: SE steigt immer
 *   se <- sd(x) / sqrt(200); mean(x) + c(-1, 1) * qt(.975, 199) * se   # 7.300066 8.202934, Breite 0.902868, SE 0.228927
 *   range(sapply(1:200, function(k) { xx <- x; xx[k] <- 40; 2 * qt(.975, 199) * (sd(xx) - sd(x)) / sqrt(200) }))   # +0.18 bis +0.20
 *   g <- x[as.numeric(atlas$schulabschluss) == 0]; length(g); mean(g); sd(g) / sqrt(42)   # 42  5.883333  0.474016
 *   mean(g) + c(-1, 1) * qt(.975, 41) * sd(g) / sqrt(42)      # 4.926038 6.840628, qt(.975, 41) = 2.019541
 *   atlas %>% oneway_anova(lernzeit, group = schulabschluss) %>% summary()   # Ohne Schulabschluss: 5.883 0.474 4.926 6.841
 *   y <- as.numeric(atlas$wissenstest); m <- lm(y ~ x); coef(m); summary(m)$sigma; sum((x - mean(x))^2)
 *   # a = 6.1028182424, b = 0.5188907641, sₑ = 2.630697799, Σ(x − x̄)² = 2085.81955, ȳ = 10.125
 *   predict(m, data.frame(x = c(10, mean(x), 0, 18)), interval = "prediction")   # [6.0847, 16.4987] [4.9243, 15.3257] [0.8281, 11.3776] [10.1134, 20.7723]
 *   predict(m, data.frame(x = c(10, mean(x), 0, 18)), interval = "confidence")   # [10.8447, 11.7387] [9.7582, 10.4918] [5.1490, 7.0567] [14.2223, 16.6634]
 *   w0 <- 2 * qt(.975, 198) * summary(m)$sigma * sqrt(1 + 1/200); w0; sum(abs(resid(m)) <= w0 / 2)   # 10.40147, 191 von 200
 *   range(sapply(1:200, function(k) { yy <- y; yy[k] <- 20; 2 * qt(.975, 198) * summary(lm(yy ~ x))$sigma * sqrt(1 + 1/200) - w0 }))   # +0.063 bis +0.677
 *   # Regler n bei gleicher Geraden und Streuung, x₀ = 10: h₀ = 1/n + (10 − x̄)² / ((n − 1) · var(x)); halbe Breiten:
 *   # n = 10: 6.515648 und 2.377490 (qt(.975, 8) = 2.306004); n = 20000: 5.156576 und 0.044392
 *   atlas %>% linear_regression(wissenstest ~ lernzeit + alter, use = "listwise", standardized = TRUE)   # Std. Error of the Estimate 2.635
 * Vertrauen in den Bundestag (ALLBUS 2023, Aggregat oben): se3 <- 1.625373 / sqrt(3592)    # 0.0271197
 *   for (L in c(.8, .9, .95, .99)) print(3.946826 + c(-1, 1) * qt(1 - (1 - L) / 2, 3591) * se3)
 *   # 80 %: 3.912064 3.981588 (t 1.281787);  90 %: 3.902207 3.991445 (t 1.645278)
 *   # 95 %: 3.893654 3.999998 (t 1.960625);  99 %: 3.876933 4.016719 (t 2.577199);  qt(.975, 9) = 2.262157
 *   # gewichtet 4.013856: bei 95 % knapp außerhalb (> 3.999998), bei 99 % knapp innerhalb (< 4.016719)
 *   # n mal 4 (14368): 3.946826 + c(-1, 1) * qt(.975, 14367) * 1.625373 / sqrt(14368)   # 3.920247 3.973405
 *   t.test(x)$conf.int                                         # 7.300066 8.202934 (wie oneSampleT)
 *   sqrt(1.0201); sqrt(0.0201)                                  # 1.01  0.1417745 (Kontrollfrage Vorhersageintervall)
 *
 * ALLBUS 2023 (ZA8831_v1-3-0.sav, nur lesen, Pfad in ALLBUS_SAV), nur Aggregate:
 *   d <- haven::read_sav(Sys.getenv("ALLBUS_SAV"))
 *   nrow(d); table(d$eastwest)                                # 5246; West 3567, Ost 1679
 *   sum(d$wghtpew[d$eastwest == 2]) / sum(d$wghtpew)          # 0.1683825 (Anteil Ost, gewichtet)
 *   t3 <- as.numeric(d$pt03)                                  # Vertrauen Bundestag 1–7, fehlende Codes sind NA
 *   sum(!is.na(t3)); mean(t3, na.rm = TRUE); sd(t3, na.rm = TRUE)   # 3592  3.946826  1.625373
 *   ok <- !is.na(t3); sum(d$wghtpew[ok] * t3[ok]) / sum(d$wghtpew[ok])   # 4.013856 (gewichtet)
 *   mean(t3[ok & d$eastwest == 2]); mean(t3[ok & d$eastwest == 1])       # 3.666382  4.08213
 *   x <- 6 - as.numeric(d$pa02a); x <- x[!is.na(x)]          # politisches Interesse, umgepolt
 *   length(x); mean(x); sd(x); sum(x >= 4)                   # 5225  3.297225  0.93954  2069; 2069 / 5225 = 0.39598
 *   for (k in 1:4) { xx <- rep(x, k); print(sd(xx) / sqrt(length(xx))) }   # 0.012998 0.009190 0.007504 0.006498
 *   h <- as.numeric(d$dh04); h <- h[!is.na(h) & h > 0]; table(h)       # 1181 2287 772 647 195 40 11 6 4 1 (1–9, 12), n = 5144
 *   v <- as.numeric(names(table(h))); p <- as.numeric(table(h)) / length(h)
 *   mu <- sum(v * p); s2 <- sum((v - mu)^2 * p); sum((v - mu)^3 * p) / s2^1.5   # 2.341952, σ 1.176618, Schiefe 1.208179
 *   mean(h <= 2); mean(h >= 5)                                # 0.6741835  0.04996112
 *   # exakte Verteilung der Summe von n Ziehungen durch wiederholtes Falten (Skript b8-scratch/hh.R):
 *   # n = 2: sd 0.831995, Schiefe 0.854311; n = 10: 0.372079, 0.382060; n = 30: 0.214820, 0.220582; n = 100: 0.117662, 0.120818
 */

const rows = createSurvey();
const allbusFile = process.env.ALLBUS_SAV;

/** Die ALLBUS-Datei (nur lesen): Zahl der Fälle und alle Werte einer Variable; fehlende Codes sind negativ. Nur für Aggregate. */
function allbus() {
  const bytes = readFileSync(allbusFile!), sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  return { n: sav.nCases, v: (name: string) => Array.from(sav.byName.get(name)!.values) };
}
const ctx = (data = rows) => ({ rows: data, columns: { x: ['lernzeit'] } });

test('B8 sampling: ALLBUS-Aggregate, Kopien im Regler und die zwei Hälften wie in R', () => {
  assert.equal(ALLBUS.befragte, 5246, 'ALLBUS 2023: Befragte');
  assert.equal(ALLBUS.ost, 1679, 'ALLBUS 2023: davon Ost');
  assert.ok(close(ALLBUS.ostGewichtet, 0.1683825, 1e-7), 'Anteil Ost gewichtet');
  assert.ok(close(VERTRAUEN.mean, 3.946826, 1e-6) && close(VERTRAUEN.gewichtet, 4.013856, 1e-6), 'Vertrauen Bundestag');
  assert.ok(close(INTERESSE.sd, 0.93954, 1e-5) && INTERESSE.n === 5225, 'politisches Interesse');
  for (const [k, se] of [[1, 0.012998], [2, 0.009190], [3, 0.007504], [4, 0.006498]])
    assert.ok(close(kopienSE(k), se, 1e-6), `Kopien ${k}: ${kopienSE(k)} ≠ R ${se}`);
  assert.match(sampling.stellDirVor.text, /5\.246 Menschen geantwortet, 1\.679 davon in Ostdeutschland\. Das sind 32 % der Befragten\./);
  assert.match(sampling.stellDirVor.text, /nur noch mit 16,8 %\./);
  assert.match(sampling.bausteine[2].acht, /Bundestag \(Skala 1 bis 7\) ergibt der ALLBUS 2023 ungewichtet im Mittel 3,95, gewichtet 4,01\./);
  assert.match(sampling.regler!.describe(1), /Standardfehler 0,013\./);
  assert.match(sampling.regler!.describe(2), /10\.450 Zeilen .*Standardfehler 0,0092 statt 0,013\./);

  const h = haelften(ctx());
  assert.ok(close(h.a, 7.824, 1e-9) && close(h.b, 7.679, 1e-9) && close(h.alle, 7.7515, 1e-9), 'Hälften wie in R');
  assert.equal(h.first, 'P100'); assert.equal(h.second, 'P101');
  const s = samplingTabs.sample!;
  assert.equal(s.kind, 'analysis');
  if (s.kind === 'analysis') {
    const r = s.result(ctx());
    assert.match(r.kurz, /im Schnitt 7,82 Stunden gelernt, die anderen 100 7,68 Stunden\. .* 0,14 Stunden auseinander\./);
    assert.match(r.fachlich, /Mittelwert aller 200, 7,75 h\./);
    assert.match(s.result(ctx(applyOp(rows, 'lernzeit', 'double'))).kurz, /0,29 Stunden auseinander/, 'verdoppelt: 0,29');
  }
});

test('B8 population_parameter: Anteil der stark Interessierten und die 200 als gedachte Grundgesamtheit wie in R', () => {
  assert.ok(close(INTERESSE.stark / INTERESSE.n, 0.39598, 1e-5));
  assert.match(populationParameter.stellDirVor.text, /2\.069 von ihnen antworten „stark“ oder „sehr stark“, das sind 39,6 % \(ungewichtet\)/);
  const p = parameter(ctx());
  assert.ok(close(p.mu, 7.7515, 1e-9) && close(p.xbar, 7.43, 1e-9) && close(p.pi, 0.41, 1e-9) && close(p.p, 0.35, 1e-9), 'μ, x̄, π und p wie in R');
  const s = populationParameterTabs.sample!;
  if (s.kind === 'analysis') {
    const r = s.result(ctx());
    assert.match(r.kurz, /μ = 7,75 Stunden: die mittlere Lernzeit aller 200\. .* ersten 20 befragt, wäre deine Schätzung 7,43 Stunden\./);
    assert.match(r.fachlich, /P001 bis P020: x̄ = 7,43 h/);
    assert.match(r.zusatz!, /π = 41 % aller 200, aber 35 % unter den ersten 20/);
    assert.match(r.kurz, /μ steht fest; die Schätzung hängt davon ab, wen du fragst\.$/);
    assert.match(s.result(ctx(applyOp(rows, 'lernzeit', 'constant', 8))).kurz, /μ = 8 Stunden: .* hier trifft jede Stichprobe μ genau, weil alle gleich lange lernen\.$/);
  }
});

test('B8 estimator: zwei Regeln für die Lernzeit und die Varianz mit n − 1 gegen n wie in R', () => {
  const e = schaetzungen(ctx());
  for (const [mine, data, r] of [[LERNZEIT.sum, e.sum, 1550.3], [LERNZEIT.mean, e.mean, 7.7515], [LERNZEIT.median, e.median, 7.6], [LERNZEIT.s2, e.s2, 10.48150528], [LERNZEIT.ssN, e.ssN, 10.42909775]])
    { assert.ok(close(mine, r, 1e-5), `${mine} ≠ R ${r}`); assert.ok(close(data, r, 1e-8), `Lehrdatensatz ${data} ≠ R ${r}`); }
  assert.equal(schaetzungen(ctx(applyOp(rows, 'lernzeit', 'shift', 1))).median, 8.6, 'Median nach +1 Stunde');
  assert.match(estimator.stellDirVor.text, /ergibt für die 200 Befragten 7,75 Stunden .* ergibt 7,6 Stunden\./);
  assert.equal(estimator.bausteine[1].rechnung, 'x̄ = 1.550,3 / 200 ≈ 7,75 h');
  assert.match(estimator.genau.paragraphs[1], /ergibt sie 10,43 statt 10,48 h²/);
  const s = estimatorTabs.sample!;
  if (s.kind === 'analysis') assert.match(s.result(ctx()).kurz, /ergibt 7,75 Stunden\. .* ergibt 7,6 Stunden\./);
});

test('B8 sampling_distribution: exakte Binomialverteilung der Anteile und SE der Mittelwerte wie in R', () => {
  const R: Record<number, [number, number, number, number]> = {
    5: [21.99545408, 0, 0.8, 0.9884143799], 10: [15.55313473, 0.1, 0.7, 0.9803150663], 20: [10.99772704, 0.2, 0.65, 0.9788518586],
    50: [6.955573305, 0.28, 0.54, 0.9570270272], 100: [4.918333051, 0.31, 0.51, 0.9677763044], 200: [3.477786652, 0.34, 0.48, 0.9631798794],
    500: [2.199545408, 0.368, 0.454, 0.9544631737], 1000: [1.555313473, 0.38, 0.441, 0.9537149671],
  };
  assert.equal(WEITERBILDUNG.pi, 0.41);
  for (const n of ANTEIL_N) {
    const [se, lo, hi, prob] = R[n], m = middle95(n, WEITERBILDUNG.pi);
    assert.ok(close(seAnteil(n) * 100, se, 1e-7) && close(m.lo, lo, 1e-12) && close(m.hi, hi, 1e-12) && close(m.prob, prob, 1e-9), `n = ${n}: ${JSON.stringify(m)}`);
    assert.ok(close(binomial(n, WEITERBILDUNG.pi).reduce((a, b) => a + b, 0), 1, 1e-12), `n = ${n}: Summe 1`);
  }
  assert.ok(close(binomial(10, 0.41)[4], 0.2503034, 1e-7), 'dbinom(4, 10, 0.41) = 0.2503034');
  assert.match(samplingDistribution.stellDirVor.text, /In etwa 96 von 100 Stichproben liegt er zwischen 28 % und 54 %\./);
  assert.equal(anteilText(50), 'Mit 50 Gezogenen schwankt der Anteil typischerweise um etwa 7 Prozentpunkte um 41 %. In etwa 96 von 100 Stichproben liegt er zwischen 28 % und 54 %.');
  assert.match(anteilText(1000), /etwa 1,6 Prozentpunkte .* In etwa 95 von 100 Stichproben liegt er zwischen 38 % und 44,1 %\./);
  assert.equal(samplingDistribution.bausteine[2].rechnung, 'SE = √(0,41 · 0,59 / 50) ≈ 0,070, also 7 Prozentpunkte');
  assert.match(samplingDistribution.ausprobieren[0].explain, /von etwa 7 auf 3,5 Prozentpunkte/);
  assert.match(samplingDistribution.fuerDich, /≈ 0,031, also gut 3 Prozentpunkte/);
  const m = mittelwerte(ctx());
  assert.ok(close(m.sigma, 3.229411363, 1e-8) && close(m.se, 0.6458822726, 1e-9), 'σ und SE der Mittelwerte');
  const s = samplingDistributionTabs.sample!;
  if (s.kind === 'analysis') {
    assert.match(s.result(ctx()).kurz, /schwanken um 7,75 Stunden, den Mittelwert aller 200, typischerweise um etwa 0,65 Stunden\. Diese Schwankung ist der Standardfehler\./);
    assert.match(s.result(ctx()).fachlich, /σ \/ √25 = 3,23 \/ 5 ≈ 0,65 h/);
  }
});

test('B8 law_large_numbers: exakte Wahrscheinlichkeiten, mehr als 5 Prozentpunkte danebenzuliegen, wie in R', () => {
  const R = [0.7496965755, 0.6552190711, 0.3885461937, 0.2633218877, 0.1309172641, 0.02031882353, 0.001156979431, 4.838542493e-06, 5.8996955e-13, 2.78256602e-24];
  GESETZ_N.forEach((n, i) => assert.ok(Math.abs(daneben(n) - R[i]) <= 1e-9 * Math.max(R[i], 1e-15) + 1e-15, `n = ${n}: ${daneben(n)} ≠ R ${R[i]}`));
  assert.equal(wieOft(daneben(10)), 'in etwa 75 von 100 Stichproben');
  assert.equal(wieOft(daneben(1000)), 'in etwa 1 von 1.000 Stichproben');
  assert.equal(wieOft(daneben(2000)), 'in weniger als 1 von 100.000 Stichproben');
  assert.equal(wieOft(0), 'in keiner Stichprobe');
  assert.match(lawLargeNumbers.stellDirVor.text, /Bei 10 Gezogenen liegt der Anteil in etwa 75 von 100 Stichproben mehr als 5 Prozentpunkte neben 41 %\. Bei 100 Gezogenen nur noch in etwa 26 von 100 Stichproben, bei 1\.000 Gezogenen in etwa 1 von 1\.000 Stichproben\./);
  assert.ok(!/gleichen sich .* aus/.test(lawLargeNumbers.bausteine[1].warum) && /verdünnt, nicht ausgeglichen/.test(lawLargeNumbers.bausteine[1].warum), 'Baustein 2 widerspricht Baustein 3 nicht');
  assert.match(lawLargeNumbers.stellDirVor.text, /Ein Anteil ist auch ein Mittelwert/);
  assert.equal(lawLargeNumbers.bausteine[1].rechnung, 'Mehr als 5 Prozentpunkte daneben: bei 10 Gezogenen 75 %, bei 100 Gezogenen 26,3 %, bei 1.000 Gezogenen 0,12 %.');
  const wctx = (data = rows) => ({ rows: data, columns: { x: ['weiterbildung'] } });
  const g = gesetz(wctx());
  assert.equal(g.ones, 82); assert.ok(close(g.p, 0.2633218877, 1e-9));
  assert.ok(close(gesetz(wctx(applyOp(rows, 'weiterbildung', 'reverse'))).p, 0.2633218877, 1e-9), 'umgepolt gleich');
  assert.equal(gesetz(wctx(applyOp(rows, 'weiterbildung', 'constant', 1))).p, 0, 'alle Ja: nie daneben');
  const s = lawLargeNumbersTabs.sample!;
  if (s.kind === 'analysis') {
    assert.match(s.result(wctx()).kurz, /82 von 200 .* also 41 %\. Bei 100 Gezogenen liegt der Anteil in etwa 26 von 100 Stichproben mehr als 5 Prozentpunkte daneben\./);
    assert.match(s.result(wctx()).fachlich, /: 0,263, exakt .* n = 1\.000: 0,0012\./);
  }
});

test('B8 central_limit: exakte Verteilung der mittleren Haushaltsgröße und die Schiefe der Einkommen wie in R', () => {
  const H = HAUSHALT_KENNWERTE;
  assert.equal(HAUSHALT_N, 5144);
  assert.ok(close(H.mu, 2.341952, 1e-6) && close(H.sigma, 1.176618, 1e-6) && close(H.skew, 1.208179, 1e-6), 'Haushaltsgröße: μ, σ, Schiefe');
  assert.ok(close(H.bisZwei, 0.6741835, 1e-7) && close(H.abFuenf, 0.04996112, 1e-8), 'Anteile');
  const R: Record<number, [number, number]> = { 2: [0.831995, 0.854311], 10: [0.372079, 0.382060], 30: [0.214820, 0.220582], 100: [0.117662, 0.120818] };
  for (const [n, [sd, sk]] of Object.entries(R).map(([k, v]) => [Number(k), v] as const)) {
    const { sums, probs } = haushaltMittel(n), xs = sums.map(s => s / n);
    const total = probs.reduce((a, b) => a + b, 0), m = xs.reduce((a, x, i) => a + x * probs[i], 0);
    const v2 = xs.reduce((a, x, i) => a + (x - m) ** 2 * probs[i], 0), v3 = xs.reduce((a, x, i) => a + (x - m) ** 3 * probs[i], 0);
    assert.ok(close(total, 1, 1e-12) && close(m, H.mu, 1e-9), `n = ${n}: Summe und Mitte`);
    assert.ok(close(Math.sqrt(v2), sd, 1e-6) && close(v3 / v2 ** 1.5, sk, 1e-6) && close(schiefeMittel(n), sk, 1e-6), `n = ${n}: sd ${Math.sqrt(v2)}, Schiefe ${v3 / v2 ** 1.5}`);
  }
  assert.deepEqual(GLOCKE_N.map(n => glockeText(n).split('. ').at(-1)), [
    'Die Glockenkurve passt schlecht.', 'Die Verteilung ist noch deutlich schief.', 'Die Verteilung ist noch deutlich schief.', 'Die Verteilung ist noch deutlich schief.',
    'Die Glocke passt schon recht gut; rechts bleibt ein kleiner Überhang.', 'Die Glocke passt schon recht gut; rechts bleibt ein kleiner Überhang.',
    'Die Balken folgen fast genau der Glockenkurve.', 'Die Balken folgen fast genau der Glockenkurve.', 'Die Balken folgen fast genau der Glockenkurve.']);
  assert.match(centralLimit.stellDirVor.text, /5\.144 Menschen .* 67,4 % leben allein oder zu zweit, nur 5 % zu fünft oder mehr\./);
  assert.equal(centralLimit.bausteine[1].rechnung, '1,21 / √30 ≈ 1,21 / 5,48 ≈ 0,22');
  const ectx = (data = rows) => ({ rows: data, columns: { x: ['einkommen'] } });
  const e = einkommenSchiefe(ectx());
  assert.ok(close(e.skew, 0.7855733276, 1e-9) && close(e.skewMean, 0.1434254107, 1e-9) && close(e.mean, 3154.62, 1e-9), 'Schiefe der Einkommen');
  const s = centralLimitTabs.sample!;
  if (s.kind === 'analysis') {
    assert.match(s.result(ectx()).kurz, /Schiefe von 0,79: .* nur noch eine Schiefe von 0,14\. Sie sind fast symmetrisch, wie eine Glocke\./);
    // Nach der eigenen Vorhersage (Ausreißer 30.000 €) sind die Mittelwerte noch deutlich schief, für jede Person (R: 1,33 bis 1,38).
    const nach = (k: number) => ectx(applyOp(rows, 'einkommen', 'outlier', 30000, k));
    assert.ok(close(einkommenSchiefe(nach(0)).skewMean, 1.333290853, 1e-8) && close(einkommenSchiefe(nach(0)).skew, 7.302734759, 1e-8), 'P001 auf 30.000 € wie in R');
    assert.match(s.result(nach(0)).kurz, /Schiefe von 7,3: .* Schiefe von 1,33\. Sie sind noch deutlich schief; die Glocke passt hier schlecht\.$/);
    const all = rows.map((_, k) => einkommenSchiefe(nach(k)).skewMean);
    assert.ok(close(Math.min(...all), 1.328943677, 1e-8) && close(Math.max(...all), 1.377220006, 1e-8), 'Spanne über alle 200 wie in R');
    for (let k = 0; k < rows.length; k++) assert.ok(!/fast symmetrisch/.test(s.result(nach(k)).kurz), `Person ${k + 1}: Ergebnis behauptet Symmetrie`);
    assert.match(s.result(ectx()).zusatz!, /3\.155 € im Monat/);
  }
});

test('B8 sampling_bias: die Online-Umfrage der Planenden und die Bereiche im Bild wie in R', () => {
  const v = verzerrung(ctx());
  assert.equal(v.n, PLANUNG.n);
  for (const [mine, data, r] of [[PLANUNG.teil, v.teil, 8.670454545], [PLANUNG.alle, v.alle, 7.7515], [PLANUNG.sigmaTeil, v.sigmaTeil, 2.74301423], [PLANUNG.sigma, v.sigma, 3.229411363]])
    { assert.ok(close(mine, r, 1e-6), `${mine} ≠ R ${r}`); assert.ok(close(data, r, 1e-8), `Lehrdatensatz ${data} ≠ R ${r}`); }
  assert.ok(close(v.bias, 0.9189545455, 1e-9) && close(v.se, 0.2940819939, 1e-9), 'Verzerrung und SE');
  const R: Record<number, number[]> = { 10: [6.970316712, 10.37059238, 5.7498901, 9.7531099], 50: [7.910129792, 9.430779299, 6.85635284, 8.64664716], 100: [8.132823756, 9.208085335, 7.118535373, 8.384464627], 5000: [8.59442207, 8.746487021, 7.661985284, 7.841014716] };
  for (const [n, r] of Object.entries(R)) { const b = bereiche(Number(n)); [...b.online, ...b.zufall].forEach((x, i) => assert.ok(close(x, r[i], 1e-5), `n = ${n}: ${x} ≠ R ${r[i]}`)); }
  assert.match(bereichText(100), /zwischen 8,13 und 9,21 Stunden\. .* zwischen 7,12 und 8,38 Stunden, rund um den wahren Wert 7,75\. Der wahre Wert liegt nicht einmal/);
  assert.match(bereichText(10), /Noch überlappen sich beide Bereiche/);
  assert.equal(VERZERRUNG_N.filter(n => bereiche(n).online[0] <= PLANUNG.alle).join(), '10,25', 'wahrer Wert im Bereich der Online-Umfrage nur bei 10 und 25 Antworten');
  assert.match(samplingBias.stellDirVor.text, /88 feste Zeiten .* im Schnitt 8,67 Stunden gelernt, alle 200 zusammen 7,75 Stunden\. .* um 0,92 Stunden zu hoch/);
  assert.equal(samplingBias.bausteine[1].rechnung, 'Verzerrung = 8,67 − 7,75 ≈ 0,92 h');
  assert.match(samplingBias.bausteine[2].acht, /bei 3,95 statt 4,01\./);
  const s = samplingBiasTabs.sample!;
  if (s.kind === 'analysis') {
    assert.match(s.result(ctx()).kurz, /Die 88 Befragten, .* 8,67 Stunden\. Alle 200 lernen 7,75 Stunden\. Die Online-Umfrage läge systematisch 0,92 Stunden zu hoch\./);
    assert.match(s.result(ctx()).fachlich, /≈ \+0,92 h\. Der Standardfehler dieser Teilstichprobe beträgt nur 0,29 h/);
  }
});

test('B8 random_sampling: Zahl der möglichen Stichproben und der Standardfehler ohne Zurücklegen wie in R', () => {
  assert.ok(Math.abs(moeglich(200, 50) / 4.538583779e47 - 1) < 1e-9, `C(200, 50) = ${moeglich(200, 50)}`);
  assert.equal(zehnerPotenz(moeglich(200, 50)), '4,54 · 10⁴⁷');
  for (const [n, se] of [[10, 439.7218746], [50, 174.7277553], [100, 100.8791166], [150, 58.2425851], [190, 23.14325656], [200, 0]])
    assert.ok(close(seOhne(n, EINKOMMEN.N, EINKOMMEN.sd), se, 1e-6), `n = ${n}`);
  const ectx = (data = rows) => ({ rows: data, columns: { x: ['einkommen'] } }), a = auswahl(ectx());
  assert.ok(close(a.mean, EINKOMMEN.mean, 1e-9) && close(a.sd, EINKOMMEN.sd, 1e-6) && close(a.se, 174.7277553, 1e-6) && close(a.mit, 201.2532055, 1e-6), 'aus den Daten');
  assert.match(randomSampling.stellDirVor.text, /Wahrscheinlichkeit 50 \/ 200 = 25 % .* rund 4,54 · 10⁴⁷ verschiedene Gruppen .* schwankt typischerweise um etwa 175 € um das aller 200, das 3\.155 € im Monat beträgt\./);
  assert.equal(auswahlText(200), 'Jede Person kommt mit der Wahrscheinlichkeit 200 / 200 = 100 % in die Stichprobe. Wer alle zieht, kennt den Mittelwert genau: Der Standardfehler ist 0.');
  assert.match(auswahlText(10), /= 5 % .* um etwa 440 € um das aller 200\./);
  assert.match(randomSampling.genau.paragraphs[0], /√\(1 − 50 \/ 200\) · 1\.427 \/ √50 ≈ 175 €\./);
  const s = randomSamplingTabs.sample!;
  if (s.kind === 'analysis') assert.match(s.result(ectx()).fachlich, /≈ 175 €\. Mit Zurücklegen wären es σ \/ √50 ≈ 201 €\./);
});

test('B8 confidence: Konfidenzintervalle für das Vertrauen in den Bundestag und die Lernzeit wie in R', () => {
  const R: Record<number, [number, number, number]> = { 80: [1.281787362, 3.912064312, 3.981587688], 90: [1.645278067, 3.902206553, 3.991445447], 95: [1.960624819, 3.893654444, 3.999997556], 99: [2.577199119, 3.876933134, 4.016718866] };
  for (const [L, [t, lo, hi]] of Object.entries(R)) {
    const k = confidence.compute({ s: 1.625373, n: 3592, t: Number(L) });
    assert.ok(close(k.tq, t, 1e-8) && close(k.lo, lo, 1e-6) && close(k.hi, hi, 1e-6) && close(k.se, 0.02711969976, 1e-9), `${L} %: ${JSON.stringify(k)}`);
  }
  assert.ok(close(kritisch(95, 9), 2.262157163, 1e-8), 'qt(.975, 9)');
  const k = confidence.compute(confidence.initial);
  assert.equal(confidence.metrics[2].value(k), '3,89 bis 4,00');
  assert.equal(confidence.interpret(k).kurz, 'Rechnet man den ALLBUS wie eine einfache Zufallsstichprobe, sind für das mittlere Vertrauen Werte zwischen 3,89 und 4,00 plausibel. Bei wiederholten Zufallsstichproben mit 3.592 Befragten enthielten etwa 95 % solcher Intervalle den wahren Mittelwert. Das Intervall erfasst nur den Zufallsfehler: Gewichtet liegt der Mittelwert bei 4,01, knapp außerhalb.');
  assert.ok(VERTRAUEN.gewichtet > k.hi, 'gewichtet außerhalb des 95-%-Intervalls');
  assert.match(confidence.interpret(confidence.compute({ ...confidence.initial, t: 99 })).kurz, /Gewichtet liegt der Mittelwert bei 4,01, hier knapp innerhalb\.$/);
  const vier = confidence.compute(confidence.quick[0].apply(confidence.initial));
  assert.ok(close(vier.lo, 3.920246943, 1e-7) && close(vier.hi, 3.973405057, 1e-7), 'n mal 4 wie in R');
  assert.equal(confidence.interpret(vier).kurz, 'Rechnet man wie bei einer einfachen Zufallsstichprobe mit 14.368 Befragten, wären für das mittlere Vertrauen Werte zwischen 3,92 und 3,97 plausibel. Bei wiederholten Zufallsstichproben dieser Größe enthielten etwa 95 % solcher Intervalle den wahren Mittelwert.');
  assert.match(confidence.genau.paragraphs[2], /4,01, also knapp außerhalb des Intervalls: Ein Konfidenzintervall misst nur den Zufallsfehler/);
  assert.match(confidence.interpret(k).fachlich, /3,95 ± 1,96 · 0,027, also von 3,89 bis 4,00\. t ist das 97,5-%-Quantil der t-Verteilung mit 3\.591 Freiheitsgraden\./);
  assert.deepEqual(confidence.worked(k).map(w => w.text), [
    '1,63 / √3.592 ≈ 1,63 / 59,93 ≈ 0,027.', 'Für 95 % und 3.591 Freiheitsgrade liefert die t-Verteilung t ≈ 1,96.',
    '1,96 · 0,027 ≈ 0,053. So weit reicht das Intervall nach jeder Seite.', '3,95 − 0,053 ≈ 3,89 und 3,95 + 0,053 ≈ 4,00.']);
  assert.match(confidence.think.explain, /von etwa 1,96 auf etwa 2,58/);
  assert.match(confidence.compare(k), /^Das Intervall ist 0,11 Skalenpunkte breit\./);
  assert.equal(confidence.check.diagnose(0.98).slice(0, 5), 'Fast!');
  const l = lernzeitKi(ctx()), viaIntervall = intervall(l.m, { s: l.s, n: l.n, t: 95 });
  assert.ok(close(l.lo, viaIntervall.lo, 1e-10) && close(l.hi, viaIntervall.hi, 1e-10), 'oneSampleT und intervall rechnen dasselbe');
  assert.ok(close(l.lo, 7.300066098, 1e-8) && close(l.hi, 8.202933902, 1e-8) && close(l.width, 0.9028678044, 1e-9) && close(l.se, 0.2289269018, 1e-9), 'Lernzeit');
  const s = confidenceTabs.sample!;
  if (s.kind === 'analysis') assert.match(s.result(ctx()).kurz, /zwischen 7,30 und 8,20 Stunden/);
  const out = CATALOG_OUTPUT['oneway_anova:0'].output;
  assert.match(out, /Ohne Schulabschluss +42 +5\.883 +3\.072 +0\.474 +4\.926 +6\.841/, 'erfasste Ausgabe wie in R');
  assert.ok(close(5.883333333 - 2.01954097 * 0.4740160867, 4.926038426, 1e-8), 'untere Grenze aus t(41)');
});

test('B8 prediction_interval: Vorhersage- und Konfidenzintervall der Geraden Wissenstest auf Lernzeit wie in R', () => {
  const g = gerade(rows.map(r => r.values.lernzeit), rows.map(r => r.values.wissenstest));
  for (const [mine, data, r] of [[GERADE.a, g.a, 6.1028182424], [GERADE.b, g.b, 0.5188907641], [GERADE.se, g.se, 2.630697799], [GERADE.ssx, g.ssx, 2085.81955], [GERADE.my, g.my, 10.125], [GERADE.mx, g.mx, 7.7515]])
    { assert.ok(close(mine, r, 1e-8), `${mine} ≠ R ${r}`); assert.ok(close(data, r, 1e-8), `Lehrdatensatz ${data} ≠ R ${r}`); }
  const R: [number, number, number, number, number][] = [[10, 6.084722747, 16.49872902, 10.844736862, 11.73871490], [7.7515, 4.924264678, 15.32573532, 9.758168414, 10.49183159], [0, 0.8280739615, 11.37756252, 5.148960416, 7.056676069], [18, 10.1134186166, 20.77228537, 14.222287509, 16.663416482]];
  for (const [x, lo, hi, cl, ch] of R) {
    const p = vorhersage({ x, n: 200, t: 95 });
    assert.ok(close(p.lo, lo, 1e-7) && close(p.hi, hi, 1e-7) && close(p.ciLo, cl, 1e-7) && close(p.ciHi, ch, 1e-7), `x₀ = ${x}: ${JSON.stringify(p)}`);
  }
  for (const [n, half, ci] of [[10, 6.515648051, 2.377490387], [20000, 5.156576115, 0.04439246155]]) {
    const p = vorhersage({ x: 10, n, t: 95 });
    assert.ok(close(p.half, half, 1e-7) && close(p.ciHalf, ci, 1e-8), `n = ${n}`);
  }
  const k = predictionInterval.compute(predictionInterval.initial);
  assert.equal(predictionInterval.interpret(k).kurz, 'Für eine neue Person mit 10 Stunden Lernzeit sind 6,08 bis 16,50 gelöste Aufgaben plausibel. Für den Mittelwert aller Personen mit dieser Lernzeit sind nur 10,84 bis 11,74 Aufgaben plausibel; jede einzelne streut viel weiter.');
  assert.ok(close(predictionInterval.check.answer, Math.sqrt(1.0201), 1e-12) && close(Math.sqrt(0.0201), 0.1417744688, 1e-9), 'Kontrollfrage wie in R');
  assert.match(predictionInterval.check.diagnose(1.0201), /^Fast! Das ist 1 \+ h₀/);
  assert.match(predictionInterval.check.diagnose(0.14), /^Fast! Das ist √h₀ allein/);
  assert.match(predictionInterval.check.diagnose(1.02), /^Fast! Das ist 1 \+ h₀/);
  assert.match(predictionInterval.check.diagnose(1.14), /^Fast! Die 1 gehört unter die Wurzel/);
  assert.match(predictionInterval.interpret(predictionInterval.compute({ x: 18, n: 200, t: 95 })).kurz, /das Modell ist am Rand nur eine Näherung/);
  const w = predictionInterval.worked(k).map(x => x.text);
  assert.match(w[0], /^Die Gerade ŷ = 6,1 \+ 0,52 · x sagt für 10 Stunden 11,29 Aufgaben voraus/);
  assert.equal(w[1], 'h₀ = 1 / 200 + (10 − 7,75)² / 2.086 ≈ 0,0074.');
  assert.equal(w[2], '1,97 · 2,63 · √(1 + 0,0074) ≈ 5,21 Aufgaben nach jeder Seite.');
  assert.match(w[3], /√0,0074 ≈ 0,45\. Dieses Intervall reicht nur von 10,84 bis 11,74\.$/);
  assert.equal(predictionInterval.compare(k), 'Für eine neue Person ist der Bereich 10,41 Aufgaben breit, für den Mittelwert vergleichbarer Personen nur 0,89.');
  assert.deepEqual(predictionInterval.metrics.map(m => m.value(k)), ['11,29 Aufgaben', '6,08 bis 16,50', '10,84 bis 11,74']);
  const xy = (data = rows) => ({ rows: data, columns: { x: ['lernzeit'], y: ['wissenstest'] } }), d = vorhersageDaten(xy());
  assert.ok(close(2 * d.half, 10.40147064, 1e-7) && d.inside === 191, `Breite ${2 * d.half}, innerhalb ${d.inside}`);
  const s = predictionIntervalTabs.sample!;
  if (s.kind === 'analysis') {
    const r = s.result(xy());
    assert.match(r.kurz, /mit 7,75 Stunden Lernzeit sagt die Gerade 10,13 Aufgaben voraus\. Plausibel sind 4,92 bis 15,33 gelöste Aufgaben\. Für den Mittelwert solcher Personen sind nur 9,76 bis 10,49 Aufgaben plausibel\./);
    assert.equal(r.zusatz, '191 von 200 Befragten liegen höchstens 5,20 Aufgaben neben ihrer eigenen Vorhersage.');
  }
  const out = CATALOG_OUTPUT['linear_regression:0'].output;
  assert.match(out, /Std\. Error of the Estimate +2\.635/); assert.match(out, /wissenstest +10\.125/); assert.match(out, / 9\.180750 /);
});

test('B8: ALLBUS-Aggregate aus der Datei nachgerechnet (nur mit ALLBUS_SAV)', { skip: !allbusFile && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const a = allbus();
  const ew = a.v('eastwest'), w = a.v('wghtpew'), t3 = a.v('pt03'), pa = a.v('pa02a'), hh = a.v('dh04');
  assert.equal(a.n, ALLBUS.befragte);
  assert.equal(ew.filter(v => v === 2).length, ALLBUS.ost);
  const wOst = w.filter((_, i) => ew[i] === 2).reduce((x, y) => x + y, 0), wAll = w.reduce((x, y) => x + y, 0);
  assert.ok(close(wOst / wAll, ALLBUS.ostGewichtet, 1e-7), 'Anteil Ost gewichtet');
  const ok = t3.map(v => v >= 1 && v <= 7), t = t3.filter((_, i) => ok[i]);
  const m = t.reduce((x, y) => x + y, 0) / t.length, sd = Math.sqrt(t.reduce((x, y) => x + (y - m) ** 2, 0) / (t.length - 1));
  assert.equal(t.length, VERTRAUEN.n); assert.ok(close(m, VERTRAUEN.mean, 1e-6) && close(sd, VERTRAUEN.sd, 1e-6), 'pt03 Mittelwert und s');
  const tw = t3.reduce((x, v, i) => ok[i] ? x + v * w[i] : x, 0) / w.reduce((x, v, i) => ok[i] ? x + v : x, 0);
  assert.ok(close(tw, VERTRAUEN.gewichtet, 1e-6), 'pt03 gewichtet');
  const east = t3.filter((v, i) => ok[i] && ew[i] === 2), west = t3.filter((v, i) => ok[i] && ew[i] === 1);
  assert.ok(close(east.reduce((x, y) => x + y, 0) / east.length, VERTRAUEN.ost, 1e-6) && close(west.reduce((x, y) => x + y, 0) / west.length, VERTRAUEN.west, 1e-6), 'pt03 Ost und West');
  const pi = pa.filter(v => v >= 1 && v <= 5).map(v => 6 - v), pm = pi.reduce((x, y) => x + y, 0) / pi.length;
  assert.equal(pi.length, INTERESSE.n); assert.equal(pi.filter(v => v >= 4).length, INTERESSE.stark);
  assert.ok(close(pm, INTERESSE.mean, 1e-6) && close(Math.sqrt(pi.reduce((x, y) => x + (y - pm) ** 2, 0) / (pi.length - 1)), INTERESSE.sd, 1e-5), 'pa02a');
  assert.deepEqual(HAUSHALT.groessen.map(g => hh.filter(v => v === g).length), [...HAUSHALT.anzahl], 'dh04: Häufigkeiten');
  assert.equal(hh.filter(v => v > 0).length, HAUSHALT_N, 'dh04: gültige Angaben');
});
