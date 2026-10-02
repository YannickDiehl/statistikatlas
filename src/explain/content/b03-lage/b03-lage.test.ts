import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSurvey } from '../../../domain/survey';
import { readSav, isMissingCode } from '../../../sandbox/readSav';
import { close } from '../../format';
import { ALLBUS_N, validn, validnTabs } from './validn';
import { liveOutput } from '../../rRead';
import { LERNZEIT, range, rangeOf, rangeTabs, rangeWithTop } from './range';
import { applyOp } from '../../sample';
import { excessKurtosis, mean, median, quantile6, skewness } from './lage';
import { FORM, formOf, formWithTop, shape, shapeTabs } from './shape';
import { UEBERBLICK, describeCard, describeTabs, overviewOf } from './describe';
import { CATALOG_OUTPUT } from '../../catalogOutput';
import { sdOf } from './lage';
import { bridgeReihe, derReiheNach, reihe } from './reihe';
import { bridgeContext } from '../../sample';

/*
 * Referenzwerte des Bereichs B3, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas oder writeSav(createSurvey())), und auf dem
 * ALLBUS 2023 (ZA8831_v1-3-0.sav, ungewichtet, nur Aggregate):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *
 * Anzahl (validn), ALLBUS 2023 mit haven::read_sav(user_na = FALSE), Missing-Codes werden NA:
 *   a <- haven::read_sav(Sys.getenv("ALLBUS_SAV")); lr <- as.numeric(a$pa01); bt <- as.numeric(a$pt03)
 *   nrow(a); sum(!is.na(lr)); sum(!is.na(bt)); sum(!is.na(lr) & !is.na(bt))      # 5246 4997 3592 3436
 *   sum(is.na(lr)); sum(is.na(bt)); sum(is.na(lr) & is.na(bt))                     # 249 1654 93
 *   sum(as.numeric(haven::read_sav(Sys.getenv("ALLBUS_SAV"), user_na = TRUE)$pt03) == -11)   # 1596 (Split, nicht gefragt)
 *   atlas %>% describe(lernzeit, show = "mean")                                      # Mean 7.752, N 200, Missing 0
 *
 * Spannweite (range), x <- as.numeric(atlas$lernzeit), q <- function(v, p) unname(quantile(v, p, type = 6)):
 *   atlas %>% describe(lernzeit, show = c("min", "max", "range"))                   # Min 0.000, Max 18.400, Range 18.400
 *   atlas$id[x == min(x)]; atlas$id[x == max(x)]; sort(x)[c(2, 199)]                  # P100, P175; 0.9, 17.3
 *   q(x, .25); q(x, .75); q(x, .75) - q(x, .25)                                       # 5.8 9.75 3.95 (wie w_quantile, w_iqr)
 *   for (top in c(25, 40, 60)) { xx <- x; xx[atlas$id == "P175"] <- top; max(xx) - min(xx); q(xx, .75) - q(xx, .25) }   # 25/40/60, IQR immer 3.95
 *   range(sapply(1:200, function(k) { xx <- x; xx[k] <- 40; max(xx) - min(xx) }))   # 39.1 40
 *
 * Schiefe & Kurtosis (shape), Formeln wie mariposa .calc_skewness / w_kurtosis(excess = TRUE):
 *   G1 <- function(v) { n <- length(v); m <- mean(v); m2 <- sum((v-m)^2)/n; m3 <- sum((v-m)^3)/n; sqrt(n*(n-1))/(n-2) * m3/m2^1.5 }
 *   G2 <- function(v) { n <- length(v); m <- mean(v); m2 <- sum((v-m)^2)/n; m4 <- sum((v-m)^4)/n; ((n+1)*(m4/m2^2-3)+6)*(n-1)/((n-2)*(n-3)) }
 *   atlas %>% w_skew(lernzeit, einkommen)                            # 0.196 0.792 (G1: 0.1962485 0.7915222)
 *   atlas %>% w_kurtosis(lernzeit, einkommen)                        # 0.338 0.678 (G2: 0.3383592 0.6781967); excess = FALSE: 3.338
 *   inc <- as.numeric(atlas$einkommen); mean(inc); median(inc); quantile(inc, c(.25, .75), type = 6)   # 3154.62 2772; 2223 4087.75
 *   o <- order(inc, decreasing = TRUE); atlas$id[o[1]]; inc[o[1]]   # P054 8636
 *   for (v in c(10000, 15000, 20000, 30000)) { ii <- inc; ii[o[1]] <- v; G1(ii); G2(ii); mean(ii); median(ii) }
 *     # 0.9872025 1.858731 3161.44 2772 | 2.317081 13.58799 3186.44 | 4.18297 35.52917 3211.44 | 7.600467 84.98594 3261.44
 *   range(sapply(1:200, function(k) { xx <- x; xx[k] <- 40; G1(xx) }))      # 2.723155 2.821434
 *   G1(60 - x)                                                       # -0.1962485
 *
 * Deskriptiver Überblick (describe):
 *   atlas %>% describe(lernzeit, einkommen, show = "all")            # lernzeit 7.752 7.600 3.238 … IQR 3.950; einkommen 3154.620 2772.000
 *     # 1426.646 SE 100.879 Min 607 Max 8636 Range 8029 IQR 1864.750 Skewness 0.792 Mode 3070 Q25 2223 Q75 4087.750, N 200
 *   atlas %>% describe(lernzeit, einkommen)                          # ohne show: Mean Median SD Range IQR Skewness N Missing
 *   length(unique(inc)); sort(table(inc), decreasing = TRUE)[1:3]    # 197; 3070, 4549, 4917 je zweimal (Mode: kleinster)
 *   mean(as.numeric(atlas$schulabschluss))                           # 1.985
 *   sapply(1:200, function(k) { xx <- x; xx[k] <- 0; median(xx) })  # immer 7.6 (auch nach x + 1 bzw. 2 * x: 8.6 bzw. 15.2)
 *   range(sapply(1:200, function(k) { xx <- x; xx[k] <- 0; mean(xx) - mean(x) }))   # -0.092 0
 *
 * Median und Quantile (Werkstatt „Der Reihe nach“), q <- function(v, p, t = 6) unname(quantile(v, p, type = t)):
 *   d <- c(3, 12, 5, 8, 6); median(d); mean(d); q(d, .25); q(d, .75); q(d, .25, 7); q(d, .75, 7)   # 6 6.8 4 10 5 8
 *   d <- c(3, 20, 5, 8, 6); median(d); mean(d); q(d, .25); q(d, .75)                                # 6 8.4 4 14
 *   atlas %>% w_median(lernzeit)                                       # Median 7.600
 *   atlas %>% w_quantile(lernzeit, probs = c(.25, .5, .75))            # 5.800 7.600 9.750
 *   sort(x)[c(50, 51, 100, 101, 150, 151)]                             # 5.8 5.8 7.6 7.6 9.6 9.8
 *   sum(x < 7.6); sum(x > 7.6); sum(x == 7.6); sum(x >= 5.8 & x <= 9.75)   # 97 99 4 103
 *   rank(x, ties.method = "min")[atlas$id == "P002"]; rank(x, ties.method = "max")[atlas$id == "P002"]   # 113 114
 *   q(x, .25, 7); q(x, .75, 7)                                         # 5.8 9.65 (Type 7, nah an Type 6)
 *   q(x + 1, .75) - q(x + 1, .25); q(2 * x, .75) - q(2 * x, .25)       # 3.95 7.9
 */

const rows = createSurvey();

test('B3 Anzahl: die ALLBUS-Zahlen gehen auf, die Texte nennen sie, der Lehrdatensatz hat 200 vollständige Paare', () => {
  const A = ALLBUS_N;
  assert.equal(A.total - A.lrMissing, A.lr, 'Links-rechts gültig');
  assert.equal(A.total - A.btMissing, A.bt, 'Vertrauen gültig');
  assert.equal(A.total - (A.lrMissing + A.btMissing - A.bothMissing), A.both, 'vollständige Paare');
  assert.equal(A.total - A.lrMissing - A.btMissing, 3343, 'doppelt abgezogen');
  assert.match(validn.stellDirVor.text, /4\.997 der 5\.246 Befragten.*3\.592 gültige Antworten: 1\.596 Befragte.*weiteren 58.*3\.436 Befragte/);
  assert.match(validn.bausteine[1].rechnung!, /249 \+ 1\.654 − 93 = 1\.810 .*5\.246 − 1\.810 = 3\.436/);
  assert.match(validn.bausteine[1].acht, /kommt auf 3\.343 statt 3\.436/);
  // Probier es selbst: 1.000 − (50 + 80 − 20) = 890; doppelt abgezogen 870; nur Einkommen 920.
  assert.equal(validn.check.options[validn.check.correct], String(1000 - (50 + 80 - 20)));
  assert.deepEqual(validn.check.options.slice(1), ['870', '920', '1.000']);
  assert.ok(rows.every(r => Object.values(r.values).every(Number.isFinite)), 'Lehrdatensatz ohne fehlende Werte: kein Reiter „Mit 200 Befragten“');
  assert.equal(validnTabs.sample, undefined);
  assert.match(liveOutput(validnTabs.r!.live!, rows, 'lernzeit'), /lernzeit {2}7\.752 {2}200 {8}0/);
});

const allbus = process.env.ALLBUS_SAV;
test('B3 Anzahl: die Aggregate stimmen mit der ALLBUS-Datei überein (nur mit ALLBUS_SAV)', { skip: !allbus && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const bytes = readFileSync(allbus!), sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const lr = sav.byName.get('pa01')!, bt = sav.byName.get('pt03')!;
  const ok = (v: typeof lr, i: number) => !isMissingCode(v, v.values[i]);
  let nlr = 0, nbt = 0, both = 0, none = 0, split = 0;
  for (let i = 0; i < sav.nCases; i++) {
    const a = ok(lr, i), b = ok(bt, i);
    nlr += +a; nbt += +b; both += +(a && b); none += +(!a && !b); split += +(bt.values[i] === -11);
  }
  assert.deepEqual([sav.nCases, nlr, nbt, both, none, split], [ALLBUS_N.total, ALLBUS_N.lr, ALLBUS_N.bt, ALLBUS_N.both, ALLBUS_N.bothMissing, ALLBUS_N.btSplit]);
  assert.ok(close(nlr / sav.nCases, 0.9525, 0.001), 'Anteil gültig bei Links-rechts');
});

test('B3 Spannweite: Lernzeit, Regler und Auswertung wie in R', () => {
  const xs = rows.map(r => r.values.lernzeit);
  assert.deepEqual([Math.min(...xs), Math.max(...xs)], [LERNZEIT.min, LERNZEIT.max]);
  assert.equal(rows.find(r => r.values.lernzeit === 0)!.id, LERNZEIT.minPerson);
  assert.equal(rows.find(r => r.values.lernzeit === 18.4)!.id, LERNZEIT.maxPerson);
  assert.ok(close(quantile6(xs, 0.25), 5.8, 1e-9) && close(quantile6(xs, 0.75), 9.75, 1e-9) && close(LERNZEIT.iqr, 3.95, 1e-9), 'Quartile Type 6');
  for (const top of [18.4, 25, 40, 60]) {
    const r = rangeWithTop(top);
    assert.ok(close(r.range, top, 1e-9) && close(r.iqr, 3.95, 1e-9), `Regler ${top}`);
  }
  assert.match(range.regler!.describe(40), /Mit 40 Stunden reicht die Spannweite von 0 bis 40 Stunden: 40 Stunden\. Der Interquartilsabstand bleibt bei 3,95 Stunden/);
  assert.match(range.regler!.describe(18.4), /So ist es in den Daten: Die Spannweite beträgt 18,4 Stunden, der Interquartilsabstand 3,95 Stunden\./);
  assert.match(range.stellDirVor.text, /18,4 − 0 = 18,4 Stunden.*zwischen 5,8 und 9,75 Stunden.*3,95 Stunden breit/);
  const ctx = { rows, columns: { x: ['lernzeit'] } }, r0 = rangeOf(ctx);
  assert.deepEqual([r0.atMax, r0.atMin], [['P175'], ['P100']]);
  const after = rows.map((_, k) => rangeOf({ rows: applyOp(rows, 'lernzeit', 'outlier', 40, k), columns: { x: ['lernzeit'] } }).range);
  assert.ok(close(Math.min(...after), 39.1, 1e-9) && close(Math.max(...after), 40, 1e-9), 'Ausreißer 40: 39,1 bis 40 Stunden');
  const s = rangeTabs.sample!;
  assert.ok(s.kind === 'analysis' && s.think[0].explain.includes('auf 39,1 bis 40 Stunden'));
});

test('B3 Schiefe & Kurtosis: Einkommen, Lernzeit, Regler und Auswertung wie in R', () => {
  const inc = rows.map(r => r.values.einkommen), lz = rows.map(r => r.values.lernzeit);
  const near = (a: number, b: number, tol = 1e-6) => assert.ok(close(a, b, tol), `${a} ≠ R ${b}`);
  near(skewness(inc), FORM.einkommen.skew); near(excessKurtosis(inc), FORM.einkommen.kurt);
  near(skewness(lz), FORM.lernzeit.skew); near(excessKurtosis(lz), FORM.lernzeit.kurt); near(excessKurtosis(lz) + 3, FORM.lernzeit.kurtosis);
  near(mean(inc), FORM.einkommen.mean); near(median(inc), FORM.einkommen.median); near(quantile6(inc, 0.25), FORM.einkommen.q1); near(quantile6(inc, 0.75), FORM.einkommen.q3);
  near(mean(lz), FORM.lernzeit.mean); near(median(lz), FORM.lernzeit.median);
  assert.equal(rows.find(r => r.values.einkommen === Math.max(...inc))!.id, FORM.einkommen.top);
  for (const [v, sk, ku, m] of [[10000, 0.9872025, 1.858731, 3161.44], [15000, 2.317081, 13.58799, 3186.44], [20000, 4.18297, 35.52917, 3211.44], [30000, 7.600467, 84.98594, 3261.44]]) {
    const f = formWithTop(v);
    near(f.skew, sk); near(f.kurt, ku, 1e-5); near(f.mean, m); near(f.median, 2772);
  }
  assert.match(shape.regler!.describe(30000), /Mit 30\.000 € für diesen Haushalt beträgt die Schiefe 7,6 und der Exzess 84,99\. Der Mittelwert wandert auf 3\.261,44 €, der Median bleibt bei 2\.772 €\./);
  assert.match(shape.regler!.describe(8636), /So ist es in den Daten: Die Schiefe beträgt 0,79\. Der Mittelwert 3\.154,62 € liegt über dem Median 2\.772 €\./);
  assert.match(shape.ausprobieren[1].explain, /von 3\.154,62 € auf 3\.261,44 €.*von 0,79 auf 7,6/);
  const after = rows.map((_, k) => skewness(applyOp(rows, 'lernzeit', 'outlier', 40, k).map(r => r.values.lernzeit)));
  near(Math.min(...after), 2.723155); near(Math.max(...after), 2.821434);
  assert.ok(shapeTabs.sample!.think[2].explain.includes('auf 2,72 bis 2,82'));
  near(skewness(applyOp(rows, 'lernzeit', 'reverse').map(r => r.values.lernzeit)), -FORM.lernzeit.skew);
  const f = formOf({ rows, columns: { x: ['lernzeit'] } }), s = shapeTabs.sample!;
  assert.deepEqual([f.above, f.below], [97, 103]);
  assert.ok(s.kind === 'analysis' && /„Lernzeit“ ist fast symmetrisch verteilt: Die Schiefe beträgt 0,2\. Der Mittelwert 7,75 h liegt über dem Median 7,6 h\./.test(s.result({ rows, columns: { x: ['lernzeit'] } }).kurz));
  assert.ok(s.kind === 'analysis' && /läuft etwas zu großen Werten hin aus: Die Schiefe beträgt 0,79/.test(s.result({ rows, columns: { x: ['einkommen'] } }).kurz));
});

test('B3 Deskriptiver Überblick: Kennzahlen, R-Ausgabe und Vorhersagen wie in R', () => {
  const inc = rows.map(r => r.values.einkommen), lz = rows.map(r => r.values.lernzeit), E = UEBERBLICK.einkommen;
  const near = (a: number, b: number, tol = 1e-3) => assert.ok(close(a, b, tol), `${a} ≠ R ${b}`);
  near(mean(inc), E.mean); near(median(inc), E.median); near(sdOf(inc), E.sd); near(quantile6(inc, 0.75) - quantile6(inc, 0.25), E.iqr);
  near(Math.max(...inc) - Math.min(...inc), E.range); near(Math.min(...inc), E.min); near(Math.max(...inc), E.max);
  near(sdOf(lz), UEBERBLICK.lernzeit.sd, 1e-6);
  assert.equal(new Set(inc).size, E.distinct);
  assert.equal(inc.filter(v => v === E.mode).length, 2);
  assert.equal((rows.reduce((a, r) => a + r.values.schulabschluss, 0) / 200).toFixed(3), UEBERBLICK.schulabschlussMean);
  const out = CATALOG_OUTPUT['describe:0'].output;
  assert.match(out, /lernzeit {5}7\.752 {4}7\.600 {4}3\.238/);
  assert.match(out, /einkommen 3154\.620 2772\.000 1426\.646 100\.879 607\.000 8636\.000 8029\.000/);
  assert.match(out, /einkommen 1864\.750 {4}0\.792/);
  assert.match(describeCard.bausteine[0].rechnung!, /3\.154,62 € gegen 2\.772 €, also 382,62 € Unterschied/);
  assert.match(describeCard.bausteine[1].rechnung!, /SD 1\.426,65 €, IQR 1\.864,75 €, Range 8\.029 €/);
  const s = describeTabs.sample!;
  assert.ok(s.kind === 'analysis');
  if (s.kind === 'analysis') {
    assert.equal(s.result({ rows, columns: { x: ['lernzeit'] } }).kurz, 'Im Schnitt haben die 200 Befragten in den letzten sieben Tagen 7,75 Stunden gelernt, der Median liegt bei 7,6 Stunden. Grob gesagt liegt eine Person etwa 3,24 Stunden vom Durchschnitt entfernt; die mittlere Hälfte lernt zwischen 5,8 und 9,75 Stunden.');
    const med0 = rows.map((_, k) => overviewOf({ rows: applyOp(rows, 'lernzeit', 'outlier', 0, k), columns: { x: ['lernzeit'] } }).median);
    assert.ok(med0.every(m => close(m, 7.6, 1e-9)), 'Median bleibt bei 0 Stunden für jede Person');
    const dm = rows.map((_, k) => mean(applyOp(rows, 'lernzeit', 'outlier', 0, k).map(r => r.values.lernzeit)) - mean(lz));
    near(Math.min(...dm), -0.092, 1e-9); assert.ok(s.think[0].explain.includes('um bis zu 0,09 Stunden'));
  }
});

test('B3 Der Reihe nach: Median, Quartile und IQR der fünf und der 200 wie in R', () => {
  const a = reihe([3, 12, 5, 8, 6]), b = reihe([3, 20, 5, 8, 6]);
  assert.deepEqual([a.median, a.mean, a.q1, a.q3, a.iqr, a.range], [6, 6.8, 4, 10, 6, 9]);
  assert.deepEqual([b.median, b.mean, b.q1, b.q3, b.iqr], [6, 8.4, 4, 14, 10]);
  assert.deepEqual(derReiheNach.presets.map(p => p.data), [[3, 12, 5, 8, 6], [3, 20, 5, 8, 6]]);
  const ctx = { s: a, who: 0, names: derReiheNach.names };
  assert.match(derReiheNach.variants.quantile.genau.paragraphs(ctx)[0], /Q₁ = 5 statt 4 und Q₃ = 8 statt 10/);
  assert.match(String(typeof derReiheNach.steps[4].rechnung === 'function' ? derReiheNach.steps[4].rechnung(ctx) : ''), /Q₁ = 3 \+ 0,5 · \(5 − 3\) = 4\. Q₃ = 8 \+ 0,5 · \(12 − 8\) = 10\./);
  const c = bridgeContext(reihe, 'series', rows, 'lernzeit', '', 1), s = c.s;
  assert.deepEqual([s.median, s.q1, s.q3], [7.6, 5.8, 9.75]);
  assert.ok(close(s.iqr, 3.95, 1e-9));
  assert.deepEqual([s.below, s.above, s.same, s.placeLo[1], s.placeHi[1]], [97, 99, 4, 113, 114]);
  assert.equal(bridgeReihe.lines[4].all(c), 'Q₁ = 5,8 + 0,25 · (5,8 − 5,8) = 5,8 h. Q₃ = 9,6 + 0,75 · (9,8 − 9,6) = 9,75 h.');
  assert.equal(bridgeReihe.lines[2].all(c), 'Auf Platz 100 und 101 stehen 7,6 h und 7,6 h; die Mitte dazwischen ist x̃ = 7,6 h.');
  assert.equal(bridgeReihe.interpret(c, 'quantile').zusatz, '103 von 200 Befragten liegen zwischen Q₁ und Q₃, die Grenzen eingeschlossen.');
  assert.equal(bridgeReihe.interpret(c, 'median').zusatz, '97 von 200 Befragten liegen unter dem Median, 99 darüber und 4 genau darauf.');
  assert.equal(bridgeReihe.lines[0].person(c), 'P002 hat 8,3 h und steht der Reihe nach auf einem der Plätze 113 bis 114.');
  const iqrOf = (d: typeof rows) => bridgeReihe.value(bridgeContext(reihe, 'series', d, 'lernzeit', '', 0), 'quantile')!;
  assert.ok(close(iqrOf(applyOp(rows, 'lernzeit', 'shift', 1)), 3.95, 1e-9) && close(iqrOf(applyOp(rows, 'lernzeit', 'double', 2)), 7.9, 1e-9));
});
