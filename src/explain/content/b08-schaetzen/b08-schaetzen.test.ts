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
import { binomial, middle95 } from './daten';

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
 */

const rows = createSurvey();
const allbusFile = process.env.ALLBUS_SAV;

/** Gültige Werte einer ALLBUS-Variable (Codes im Bereich lo bis hi; fehlende Codes sind negativ) mit Gewicht und Gebiet. */
function allbus(names: string[]) {
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
  assert.match(sampling.bausteine[2].acht, /ungewichtet im Mittel 3,95, gewichtet 4,01\./);
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
  assert.equal(anteilText(50), 'Mit 50 Gezogenen schwankt der Anteil typischerweise um etwa 6,96 Prozentpunkte um 41 %. In etwa 96 von 100 Stichproben liegt er zwischen 28 % und 54 %.');
  assert.match(anteilText(1000), /etwa 1,56 Prozentpunkte .* In etwa 95 von 100 Stichproben liegt er zwischen 38 % und 44,1 %\./);
  assert.equal(samplingDistribution.bausteine[2].rechnung, 'SE = √(0,41 · 0,59 / 50) ≈ 0,070, also 6,96 Prozentpunkte');
  assert.match(samplingDistribution.ausprobieren[0].explain, /von etwa 6,96 auf 3,48 Prozentpunkte/);
  assert.match(samplingDistribution.fuerDich, /≈ 0,031, also gut 3 Prozentpunkte/);
  const m = mittelwerte(ctx());
  assert.ok(close(m.sigma, 3.229411363, 1e-8) && close(m.se, 0.6458822726, 1e-9), 'σ und SE der Mittelwerte');
  const s = samplingDistributionTabs.sample!;
  if (s.kind === 'analysis') {
    assert.match(s.result(ctx()).kurz, /schwanken um 7,75 Stunden, den Mittelwert aller 200\. Typischerweise liegen sie etwa 0,65 Stunden daneben/);
    assert.match(s.result(ctx()).fachlich, /σ \/ √25 = 3,23 \/ 5 ≈ 0,65 h/);
  }
});

test('B8: ALLBUS-Aggregate aus der Datei nachgerechnet (nur mit ALLBUS_SAV)', { skip: !allbusFile && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const a = allbus(['eastwest', 'wghtpew', 'pt03', 'pa02a', 'dh04']);
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
});
