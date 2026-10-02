import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { applyOp, bridgeContext, sampleColumn } from '../../sample';
import { close } from '../../format';
import { txt, type SampleCtx, type SampleTab } from '../../types';
import { ABSCHLUSS, HAUSHALT, SCHLAF, WISSEN, cdf, schlafModell } from './gemeinsam';
import { series } from '../../math';
import { CATALOG_OUTPUT } from '../../catalogOutput';
import { liveOutput, locate } from '../../rRead';
import { probability, probabilityTabs } from './probability';
import { conditionalProbability, conditionalProbabilityTabs } from './conditional_probability';
import { stochasticIndependence, stochasticIndependenceTabs } from './stochastic_independence';
import { randomVariable, randomVariableTabs } from './random_variable';
import { empiricalDistribution, empiricalDistributionTabs } from './empirical_distribution';
import { theoreticalDistribution, theoreticalDistributionTabs } from './theoretical_distribution';
import { discreteContinuous, discreteContinuousTabs } from './discrete_continuous';
import { probabilityMass, probabilityMassTabs, massUpTo } from './probability_mass';
import { densityFunction, densityFunctionTabs, areaAround7 } from './density_function';
import { cumulativeProbability, cumulativeProbabilityTabs, observedUpTo } from './cumulative_probability';
import { theoreticalQuantile, theoreticalQuantileTabs } from './theoretical_quantile';
import { bridgeErwartung, erwartung, expectationTabs } from './erwartung';

/*
 * Referenzwerte des Bereichs B6, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas, Knopf „SPSS-Datei (.sav)“, oder writeSav(createSurvey())):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   s <- as.numeric(atlas$schulabschluss); w <- as.numeric(atlas$weiterbildung)
 *   table(s)                                   # 42 40 37 41 40 (Codes 0 bis 4)
 *   table(s, w)                                # mit Weiterbildung 17 12 17 17 19, ohne 25 28 20 24 21
 *   table(w)                                   # 118 ohne, 82 mit; mean(w) = 0.41
 *   h <- as.numeric(atlas$haushaltsgroesse); table(h)          # 47 38 35 43 37 (1 bis 5)
 *   sl <- as.numeric(atlas$schlafdauer); mean(sl); sd(sl)      # 7.0825, 0.8197584; min 5.1, max 9.5, 38 verschiedene Werte
 *   sum(sl < 6); sum(sl <= 6); sum(sl >= 7 & sl <= 8)          # 18, 22, 90
 *   wt <- as.numeric(atlas$wissenstest); table(wt)             # häufigster Wert 11 mit 32 Befragten
 */

const rows = createSurvey();
const col = (id: string) => sampleColumn(rows, id);
const count = (xs: number[], ok: (v: number) => boolean) => xs.filter(ok).length;
/** Kontext einer Auswertung mit festen Spalten. */
const ctxFor = (tab: SampleTab, data = rows): SampleCtx => ({ rows: data, columns: tab.kind === 'analysis' && tab.columns ? Object.fromEntries(Object.entries(tab.columns).map(([k, v]) => [k, [v]])) : { x: ['lernzeit'], y: ['wissenstest'] } });

test('B6: die gemeinsamen Zahlen stimmen mit dem Lehrdatensatz und mit R überein', () => {
  const s = col('schulabschluss'), w = col('weiterbildung');
  assert.deepEqual([0, 1, 2, 3, 4].map(k => count(s, v => v === k)), [...ABSCHLUSS.count], 'Schulabschluss je Code');
  assert.deepEqual([0, 1, 2, 3, 4].map(k => s.filter((v, i) => v === k && w[i] === 1).length), [...ABSCHLUSS.mit], 'mit Weiterbildung');
  assert.deepEqual([0, 1, 2, 3, 4].map(k => s.filter((v, i) => v === k && w[i] === 0).length), [...ABSCHLUSS.ohne], 'ohne Weiterbildung');
  assert.deepEqual([count(w, v => v === 1), count(w, v => v === 0)], [ABSCHLUSS.mitWeiterbildung, ABSCHLUSS.ohneWeiterbildung], 'Weiterbildung');
  const h = col('haushaltsgroesse');
  assert.deepEqual(HAUSHALT.values.map(k => count(h, v => v === k)), [...HAUSHALT.count], 'Haushaltsgröße');
  const sl = col('schlafdauer'), m = series(sl);
  assert.ok(close(m.mean, SCHLAF.mean, 1e-9) && close(m.sd, SCHLAF.sd, 1e-7), `Schlafdauer ${m.mean} ${m.sd}`);
  assert.deepEqual([Math.min(...sl), Math.max(...sl), new Set(sl).size], [SCHLAF.min, SCHLAF.max, SCHLAF.distinct], 'Schlafdauer Spanne');
  assert.deepEqual([count(sl, v => v < 6), count(sl, v => v <= 6), count(sl, v => v >= 7 && v <= 8)], [SCHLAF.below6, SCHLAF.atMost6, SCHLAF.from7to8], 'Schlafdauer Zählungen');
  const wt = col('wissenstest');
  assert.equal(count(wt, v => v === WISSEN.mode), WISSEN.modeCount, 'Wissenstest häufigster Wert');
  assert.ok(Array.from({ length: 21 }, (_, k) => count(wt, v => v === k)).every(n => n <= WISSEN.modeCount), 'kein Wert häufiger als 11');
});

/*
 *   mean(s == 4); 1 - mean(s == 4); mean(s >= 3)               # 0.2, 0.8, 0.405
 *   dbinom(2, 10, 0.2)                                          # 0.3019899: genau 2 Treffer in etwa 30 von 100 Zehnerserien
 *   atlas %>% frequency(schulabschluss, show_unused = TRUE)     # 42 | 21.00 | 21.00 | 21.00 ... valid N=200
 */
test('B6 probability: Abitur 40 von 200, Gegenereignis, Ausprobieren und Auswertung wie in R', () => {
  assert.match(probability.stellDirVor.text, /Dann ist die Wahrscheinlichkeit für Abitur 40 von 200, also 0,2 oder 20 %\. Die Wahrscheinlichkeit für kein Abitur ist 1 − 0,2 = 0,8\./);
  assert.equal(probability.bausteine[1].rechnung, 'P(Abitur) = 40 / 200 = 0,2');
  assert.match(probability.bausteine[1].warum, /in etwa 20 von 100 Ziehungen/);
  assert.match(probability.bausteine[0].acht, /81 von 200/);
  assert.match(probability.ausprobieren[1].explain, /etwa 30 von 100/);
  assert.ok(close(0.3019899, 0.3, 0.005), 'dbinom(2, 10, 0.2) ≈ 0,3');
  assert.match(probability.check.right, /82 \/ 200 = 0,41, und das Gegenereignis hat 1 − 0,41 = 0,59/);
  assert.equal(probability.regler!.describe(40), 'P = 40 / 200 = 20 %. Auf lange Sicht treffen etwa 40 von 200 Ziehungen eine solche Person, 160 nicht. Das Gegenereignis hat 80 %.');
  const tab = probabilityTabs.sample!;
  assert.equal(tab.kind, 'analysis');
  if (tab.kind !== 'analysis') return;
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, '40 von 200 Befragten haben Abitur. Ziehst du eine Person zufällig, ist die Wahrscheinlichkeit dafür 0,2, also 20 %. Für kein Abitur bleiben 0,8.');
  assert.match(r.zusatz!, /81 von 200, das ist eine Wahrscheinlichkeit von 40,5 %/);
  assert.equal(tab.value!(ctxFor(tab)), 0.2);
  assert.match(r.fachlich, /^P\(Abitur\) = 40 \/ 200 = 0,2 und P\(nicht Abitur\) = 1 − P\(Abitur\) = 0,8,/);
});

/*
 *   19 / 40; 19 / 82; 82 / 200; 19 / 200                         # 0.475, 0.2317073, 0.41, 0.095
 *   12 / 200; 12 / 40; 12 / 82                                   # 0.06, 0.3, 0.1463415
 *   0.475 * 0.2 / 0.41                                           # 0.2317073 (Satz von Bayes)
 *   atlas %>% crosstab(row = schulabschluss, col = weiterbildung, percentages = "row")   # Abitur: 52.5% | 47.5%; Total 41.0%
 */
test('B6 conditional_probability: 19 von 40 und 19 von 82, Auswertung und Vorhersagen wie in R', () => {
  const card = conditionalProbability;
  assert.deepEqual(card.stellDirVor.figures!.map(f => f.value), ['41 %', '47,5 %', '23,2 %']);
  assert.equal(card.bausteine[1].rechnung, 'P(Weiterbildung | Abitur) = 19 / 40 = 47,5 %. Über die Formel: 9,5 % / 20 % = 47,5 %.');
  assert.equal(card.bausteine[2].rechnung, 'P(Abitur | Weiterbildung) = 19 / 82 ≈ 23,2 %, nicht 47,5 %.');
  assert.deepEqual(card.ausprobieren[0].options, ['6 %', '30 %', '14,6 %']);
  assert.match(card.genau.paragraphs[2], /47,5 % · 20 % \/ 41 % ≈ 23,2 %/);
  assert.ok(close(0.475 * 0.2 / 0.41, 19 / 82, 1e-12), 'Bayes geht auf');
  const tab = conditionalProbabilityTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Von den 40 Befragten mit Abitur haben 19 eine Weiterbildung gemacht, also 47,5 %. Unter allen 200 sind es 41 %. Umgekehrt haben von den 82 mit Weiterbildung 19 Abitur: 23,2 %.');
  assert.ok(close(tab.value!(ctxFor(tab))!, 0.475, 1e-12));
  assert.ok(close(tab.think[1].expect.measure!(ctxFor(tab))!, 6.5, 1e-9), 'Abstand 6,5 Prozentpunkte');
});

/*
 *   17 / 82; 25 / 118; 42 / 200; 19 / 82; 21 / 118               # 0.2073171, 0.2118644, 0.21, 0.2317073, 0.1779661
 *   0.2 * 0.41; 0.2 * 0.41 * 200                                  # 0.082, 16.4 (erwartet bei Unabhängigkeit)
 *   prop.table(table(s, w), 1)[, 2]; mean(w)                       # 40.5 30.0 45.9 41.5 47.5 %; 41 %: größter Abstand 11 Punkte (Hauptschule)
 *   atlas %>% crosstab(row = schulabschluss, col = weiterbildung, percentages = "col")   # erste Zeile: 21.2% | 20.7% | 21.0%
 */
test('B6 stochastic_independence: fast gleiche Anteile ohne Abschluss, Produktregel und größter Abstand wie in R', () => {
  const card = stochasticIndependence;
  assert.deepEqual(card.stellDirVor.figures!.map(f => f.value), ['21 %', '20,7 %', '23,2 %', '17,8 %']);
  assert.equal(card.bausteine[1].rechnung, 'Erwartet: P(Abitur) · P(Weiterbildung) = 20 % · 41 % = 8,2 %, also 16,4 von 200. Beobachtet: 19 von 200.');
  assert.match(card.check.diagnose[3]!, /= 0,3 · 0,2 = 0,06: 12 von 200 haben beides/);
  const tab = stochasticIndependenceTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Insgesamt haben 41 % eine Weiterbildung gemacht. Am weitesten davon entfernt ist die Gruppe Hauptschulabschluss mit 30 %, also 11 Prozentpunkte. Exakt unabhängig sind die beiden Merkmale in diesen Daten nicht.');
  assert.match(r.fachlich, /ohne Schulabschluss 40,5 %, Hauptschulabschluss 30 %, mittlerer Abschluss 45,9 %, Fachhochschulreife 41,5 %, Abitur 47,5 %/);
  assert.equal(r.zusatz, 'Bei Unabhängigkeit erwartet man unter den 40 mit Abitur 16,4 mit Weiterbildung; beobachtet sind es 19.');
  assert.ok(close(tab.value!(ctxFor(tab))!, 11, 1e-9), 'größter Abstand 11 Prozentpunkte');
});

/*
 *   wt[atlas$id == "P002"]; mean(wt == 11); length(unique(wt)); range(wt)   # 9, 0.16, 17 Werte, 0 bis 18
 */
test('B6 random_variable: P(X = 11) = 0,16, P002 mit 9 Aufgaben, Auswertung wie in R', () => {
  const p002 = rows.find(r => r.id === 'P002')!.values.wissenstest;
  assert.equal(p002, 9, 'P002 hat 9 Aufgaben gelöst');
  assert.match(randomVariable.stellDirVor.text, /32 von 200 Befragten haben so viele gelöst, also 0,16\. Ziehst du dann P002 und sie hat 9 gelöst, ist x = 9/);
  assert.equal(randomVariable.bausteine[2].rechnung, 'Vorher: P(X = 11) = 32 / 200 = 0,16. Nachher: x = 9 bei P002.');
  const tab = randomVariableTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Möglich sind 0 bis 20 gelöste Aufgaben; bei den 200 Befragten kommen 17 verschiedene Werte vor. Am wahrscheinlichsten zieht man jemanden mit 11 Aufgaben: 32 von 200, also 16 %.');
  assert.match(r.fachlich, /von 0 bis 18\./);
  assert.equal(tab.value!(ctxFor(tab)), 0.16);
});

/*
 *   prop.table(table(s)); cumsum(prop.table(table(s)))   # 0.21 0.2 0.185 0.205 0.2; kumuliert 0.21 0.41 0.595 0.8 1
 *   44 / 202                                             # 0.2178218
 *   atlas %>% frequency(schulabschluss, show_unused = TRUE)   # Cum. %: 21.00 41.00 59.50 80.00 100.00
 */
test('B6 empirical_distribution: Anteile und kumulierte Anteile des Schulabschlusses wie in R', () => {
  const card = empiricalDistribution;
  assert.match(card.stellDirVor.text, /Als Anteile sind das 21 %, 20 %, 18,5 %, 20,5 % und 20 %\./);
  assert.equal(card.bausteine[0].rechnung, '42 Befragte ohne Schulabschluss: 42 · 0,5 % = 21 %.');
  assert.equal(card.bausteine[1].rechnung, 'Fₙ(mittlerer Abschluss) = (42 + 40 + 37) / 200 = 119 / 200 = 59,5 %.');
  assert.deepEqual(card.ausprobieren[0].options, ['20,5 %', '80 %', '100 %']);
  assert.match(card.ausprobieren[2].explain, /44 \/ 202 ≈ 21,8 %/);
  const tab = empiricalDistributionTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Die Anteile der fünf Abschlüsse von ohne bis Abitur: 21 %, 20 %, 18,5 %, 20,5 %, 20 %. Höchstens einen mittleren Abschluss haben 59,5 %.');
  assert.match(r.fachlich, /Fₙ = 21 %, 41 %, 59,5 %, 80 %, 100 % für die Codes 0 bis 4/);
  assert.ok(close(tab.value!(ctxFor(tab))!, 0.595, 1e-12));
});

/*
 *   m <- mean(sl); s <- sd(sl)
 *   pnorm(6, m, s); sum(sl < 6) / 200                  # 0.09333222, 0.09
 *   pnorm(5, m, s); 200 * pnorm(5, m, s)               # 0.005536561, 1.107312 (gut eine Person)
 *   pnorm(6, 8, s); pnorm(6, m + 1, s); pnorm(6, m - 1, s)   # 0.00734885, 0.005536561, 0.4599184
 *   hist(sl, breaks = seq(5, 10, by = .5), right = FALSE)$counts   # 6 12 25 45 44 40 18 9 0 1
 *   atlas %>% normality_test(schlafdauer)              # KS = 0.051, p = 0.238 (Lilliefors); max |Fₙ − F| = 0.05073636
 */
test('B6 theoretical_distribution: Normalmodell der Schlafdauer, unter 6 Stunden im Modell und in den Daten wie in R', () => {
  const card = theoreticalDistribution;
  assert.match(card.stellDirVor.text, /μ = 7,08 h und σ = 0,82 h\. Sie sagt zum Beispiel: Weniger als 6 Stunden schlafen 9,3 %\. In den Daten sind es 18 von 200, also 9 %\./);
  assert.equal(card.bausteine[2].rechnung, 'Modell: P(X < 6) ≈ 9,3 %. Daten: 18 von 200 = 9 %.');
  assert.match(card.ausprobieren[0].explain, /schlafen im Modell 0,6 %/);
  assert.match(card.ausprobieren[2].explain, /nur noch 0,7 %, beobachtet sind 9 %/);
  assert.match(card.regler!.describe(7.08), /9,3 % schlafen weniger als 6 Stunden\. In den Daten sind es 9 %\. Das passt gut\./);
  assert.match(card.regler!.describe(6.5), /27,1 %.*mehr kurze Nächte/);
  const tab = theoreticalDistributionTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Das Modell ist eine Normalverteilung mit μ = 7,08 h und σ = 0,82 h. Weniger als 6 Stunden schlafen darin 9,3 %; in den Daten sind es 9 %.');
  assert.ok(close(tab.value!(ctxFor(tab))!, 0.09333222, 1e-6), 'P(X < 6) wie pnorm in R');
  const sl = col('schlafdauer');
  const bins = Array.from({ length: 10 }, (_, k) => count(sl, v => v >= 5 + k * 0.5 - 1e-9 && v < 5.5 + k * 0.5 - 1e-9));
  assert.deepEqual(bins, [6, 12, 25, 45, 44, 40, 18, 9, 0, 1], 'Histogramm wie in R');
});

/*
 *   mean(h == 2); mean(h == 1) + mean(h == 2)            # 0.19, 0.425
 *   pnorm(8, m, s) - pnorm(7, m, s)                      # 0.4085611
 *   length(unique(h)); length(unique(sl)); range(sl)     # 5, 38, 5.1 bis 9.5
 */
test('B6 discrete_continuous: Haushaltsgröße und Schlafdauer wie in R', () => {
  const card = discreteContinuous;
  assert.deepEqual(card.stellDirVor.figures!.map(f => f.value), ['5 Werte, 1 bis 5', '19 %', '5,1 bis 9,5 h', '40,9 %']);
  assert.equal(card.bausteine[1].rechnung, 'P(X = 2) = 19 %; P(X ≤ 2) = 23,5 % + 19 % = 42,5 %');
  assert.equal(card.bausteine[2].rechnung, 'Im Normalmodell der Schlafdauer: P(7 ≤ X ≤ 8) ≈ 40,9 %');
  const tab = discreteContinuousTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Die Haushaltsgröße hat bei 200 Befragten 5 verschiedene Werte, von 1 bis 5. Die Schlafdauer hat 38 verschiedene Werte, weil sie auf 0,1 Stunden gerundet ist; ungerundet wären fast alle verschieden.');
  assert.equal(tab.value!(ctxFor(tab)), 38);
});

/*
 *   prop.table(table(h)); cumsum(prop.table(table(h)))   # 0.235 0.19 0.175 0.215 0.185; kumuliert 0.235 0.425 0.6 0.815 1
 *   mean(h >= 4)                                         # 0.4
 */
test('B6 probability_mass: Haushaltsgröße p(1) bis p(5) wie in R', () => {
  const card = probabilityMass;
  assert.deepEqual(card.stellDirVor.figures!.map(f => f.value), ['23,5 %', '19 %', '17,5 %', '21,5 %', '18,5 %']);
  assert.equal(card.bausteine[1].rechnung, 'p(4) = P(X = 4) = 43 / 200 = 21,5 %');
  assert.equal(card.bausteine[2].rechnung, 'P(X ≥ 4) = p(4) + p(5) = 21,5 % + 18,5 % = 40 %');
  assert.deepEqual(card.check.options, ['18,5 %', '20 %', '81,5 %', '100 %']);
  assert.equal(card.regler!.describe(2), 'p(2) = 19 %: So wahrscheinlich ziehst du jemanden aus einem Haushalt mit 2 Personen. Mit allen kleineren Werten zusammen: P(X ≤ 2) = 42,5 %.');
  assert.ok(close(massUpTo(5), 1, 1e-12), 'alle Balken zusammen 1');
  const tab = probabilityMassTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Am wahrscheinlichsten zieht man jemanden aus einem Haushalt mit einer Person: 23,5 %. Alle 5 Balken zusammen ergeben 100 %.');
  assert.ok(close(tab.value!(ctxFor(tab))!, 0.235, 1e-12));
});

/*
 *   pnorm(8, m, s) - pnorm(7, m, s); sum(sl >= 7 & sl <= 8)        # 0.4085611; 90 von 200
 *   dnorm(7, m, s); dnorm(7, m, s) * 24                              # 0.4842001; 11.6208 (in Tagen gemessen)
 *   pnorm(7.05, m, s) - pnorm(6.95, m, s)                            # 0.04839031 (Höhe mal Breite: 0.48 * 0.1 = 0.048)
 *   pnorm(7.5, m, s) - pnorm(6.5, m, s); pnorm(7, m, s)              # 0.456054; 0.4599184
 *   pnorm(8, m + 2, s) - pnorm(7, m + 2, s)                          # 0.08779566
 *   integrate(function(x) dnorm(x, m, s), -Inf, Inf)$value           # 1
 */
test('B6 density_function: Fläche und Höhe der Dichte der Schlafdauer wie in R', () => {
  const card = densityFunction;
  assert.match(card.stellDirVor.text, /zwischen 7 und 8 Stunden beträgt 0,41: In diesem Modell schlafen 40,9 % so lange\. In den Daten sind es 90 von 200, also 45 %\./);
  assert.match(card.bausteine[0].acht, /Kurve 0,48 hoch/);
  assert.match(card.bausteine[1].acht, /0,48 · 0,1 ≈ 0,05\./);
  assert.match(card.bausteine[2].warum, /11,6 pro Tag/);
  assert.ok(close(areaAround7(0.05), 0.04839031, 1e-6) && close(areaAround7(0.5), 0.456054, 1e-6), 'Flächen wie pnorm in R');
  assert.equal(card.regler!.describe(0.5), 'Zwischen 6,5 und 7,5 Stunden ist die Fläche ≈ 0,46, also 45,6 %. Höhe mal Breite ergibt 0,48 · 1 ≈ 0,48. Bei breiten Bereichen ist das zu viel, weil die Kurve zu den Rändern abfällt.');
  assert.match(card.check.diagnose[2]!, /bei 46 %/);
  const tab = densityFunctionTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Im Normalmodell mit μ = 7,08 h und σ = 0,82 h hat der Bereich von 7 bis 8 Stunden die Fläche 0,41, also 40,9 %. In den Daten schlafen 90 von 200 so lange.');
  assert.ok(close(tab.value!(ctxFor(tab))!, 0.4085611, 1e-6));
  assert.ok(close(tab.think[1].expect.measure!(ctxFor(tab))!, 1, 1e-9), 'Gesamtfläche 1 wie integrate in R');
  // 1 / (s * sqrt(2 * pi)) = 0.4866584: Gipfel bei μ, etwas höher als die 0,48 bei 7 Stunden
  assert.match(r.zusatz!, /bei μ = 7,08 h, mit 0,49 pro Stunde/);
  assert.match(r.fachlich, /≈ 0,41 für X ∼ N\(7,08; 0,82²\); beobachtet 45 %/);
});

/*
 *   pnorm(6, m, s); pnorm(8, m, s); 1 - pnorm(8, m, s); pnorm(8, m, s) - pnorm(6, m, s)   # 0.09333222 0.8684795 0.1315205 0.7751472
 *   pnorm(7, m, s)                                                                        # 0.4599184
 *   mean(h <= 2); mean(h <= 1); 1 - mean(h <= 2); 1 - mean(h <= 3)                         # 0.425 0.235 0.575 0.4
 *   sum(sl <= 6); sum(sl < 6); sum(sl - 1 <= 6); sum(sl + 1 <= 6)                          # 22 18 99 0
 */
test('B6 cumulative_probability: F(6), F(8), Bereiche und Fₙ(6) wie in R', () => {
  const card = cumulativeProbability;
  assert.deepEqual(card.stellDirVor.figures!.map(f => f.value), ['9,3 %', '86,8 %', '77,5 %']);
  assert.equal(card.bausteine[1].rechnung, 'P(X > 8) = 1 − F(8) ≈ 13,2 %; P(6 < X ≤ 8) = F(8) − F(6) ≈ 77,5 %');
  assert.equal(card.bausteine[2].rechnung, 'P(X ≤ 2) = 42,5 %, aber P(X < 2) = P(X ≤ 1) = 23,5 %');
  assert.match(card.bausteine[2].acht, /1 − F\(2\) = 57,5 %, nicht 1 − F\(3\) = 40 %/);
  assert.match(card.ausprobieren[0].question, /F\(7\) ist etwa 46 %/);
  assert.equal(observedUpTo(6), 22, 'höchstens 6 Stunden');
  assert.equal(card.regler!.describe(6), 'F(6) ≈ 9,3 %: Im Modell schlafen so viele höchstens 6 Stunden, 90,7 % länger. In den Daten sind es 22 von 200, also 11 %.');
  assert.match(card.genau.paragraphs[2], /liegen 4 Befragte genau bei 6,0: Höchstens 6 Stunden schlafen 22, weniger als 6 nur 18\./);
  const tab = cumulativeProbabilityTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, '22 von 200 Befragten schlafen höchstens 6 Stunden, also Fₙ(6) = 11 %. Das Normalmodell mit μ = 7,08 h und σ = 0,82 h sagt F(6) ≈ 9,3 %.');
  assert.equal(tab.value!(ctxFor(tab)), 0.11);
  assert.equal(count(col('schlafdauer'), v => v - 1 <= 6 + 1e-9), 99, 'eine Stunde kürzer: 99 höchstens 6 Stunden');
});

/*
 *   qnorm(.1, m, s); qnorm(.9, m, s); qnorm(.5, m, s)              # 6.031937 8.133063 7.0825
 *   qnorm(c(.1, .95, .975, .995))                                  # -1.281552 1.644854 1.959964 2.575829
 *   7.08 + 0.82 * (-1.28)                                          # 6.0304: die Rechnung mit den sichtbaren Zahlen
 *   sum(sl <= qnorm(.1, m, s)); mean(h <= 2); mean(h <= 3)         # 22; 0.425 0.6
 *   qnorm(.1, m + 1, s)                                            # 7.031937 (eine Stunde länger: genau +1)
 */
test('B6 theoretical_quantile: Quantile des Schlafmodells und kritische Werte wie in R', () => {
  const card = theoreticalQuantile;
  assert.deepEqual(card.stellDirVor.figures!.map(f => f.value), ['6,03 h', '8,13 h', '1,96']);
  assert.equal(card.bausteine[1].rechnung, 'q₀,₁ = 7,08 + 0,82 · (−1,28) ≈ 6,03 h');
  assert.match(card.bausteine[2].acht, /Das 95-%-Quantil ist 1,64\./);
  assert.deepEqual(card.ausprobieren[1].options, ['1,64', '1,96', '2,58']);
  assert.match(card.ausprobieren[2].explain, /F\(2\) = 42,5 % und F\(3\) = 60 %/);
  assert.equal(card.regler!.describe(0.1), 'Das 10-%-Quantil liegt bei 6,03 Stunden: Im Modell schlafen 10 % höchstens so lange. In Standardabweichungen gemessen liegt es bei z = −1,28.');
  assert.match(card.genau.paragraphs[1], /22 der 200 Befragten bei höchstens 6,03 Stunden, also 11 %/);
  assert.equal(count(col('schlafdauer'), v => v <= 6.031937), 22, 'höchstens q₀,₁');
  const tab = theoreticalQuantileTabs.sample!;
  if (tab.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = tab.result(ctxFor(tab));
  assert.equal(r.kurz, 'Im Normalmodell mit μ = 7,08 h und σ = 0,82 h liegt das 10-%-Quantil bei 6,03 Stunden. In den Daten schlafen 22 von 200 höchstens so lange.');
  assert.ok(close(tab.value!(ctxFor(tab))!, 6.031937, 1e-6));
});

/*
 *   pv <- function(x) mean((x - mean(x))^2)                       # Populationsvarianz: durch N
 *   x <- c(1, 2, 2, 3, 5); mean(x); sum((x - mean(x))^2); pv(x); sqrt(pv(x)); var(x)   # 2.6 9.2 1.84 1.356466 2.3
 *   x <- c(2, 3, 3, 4, 7); mean(x); sum((x - mean(x))^2); pv(x); sqrt(pv(x)); var(x)   # 3.8 14.8 2.96 1.720465 3.7
 *   l <- as.numeric(atlas$lernzeit); mean(l); pv(l); sqrt(pv(l)); var(l)               # 7.7515 10.4291 3.229411 10.48151
 *   sprintf("%.8f", c(pv(l), var(l)))                                                  # 10.42909775 10.48150528
 *   var(l) * 199 / 200                                                                  # 10.4291
 *   which.max((l - mean(l))^2); max((l - mean(l))^2)                                    # 175 (P175), 113.3906
 *   range(sapply(1:200, function(k) { x <- l; x[k] <- 40; mean(x) - mean(l) }))         # 0.108 0.2
 *   range(sapply(1:200, function(k) { x <- l; x[k] <- 40; pv(x) - pv(l) }))             # 4.62 5.17
 *   atlas %>% describe(lernzeit, show = c("mean", "var"))                               # Mean 7.752, Variance 10.482
 */
test('B6 Werkstatt Erwartung: μ, σ² und s² der fünf Personen und der 200 Befragten wie in R', () => {
  const ctx = (data: number[], who = 0) => ({ s: erwartung.compute(data), who, names: erwartung.names });
  const a = ctx([1, 2, 2, 3, 5]), b = ctx([2, 3, 3, 4, 7]);
  for (const [c, r] of [[a, [2.6, 9.2, 1.84, 1.356466, 2.3]], [b, [3.8, 14.8, 2.96, 1.720465, 3.7]]] as const)
    assert.ok([c.s.mu, c.s.ss, c.s.sigma2, c.s.sigma, c.s.s2].every((v, i) => close(v, r[i], 1e-6)), `Kennwerte ${c.s.xs}`);
  const st = erwartung.steps;
  assert.equal(txt(st[1].rechnung, a), 'Person A: 1 · 0,2 = 0,2. Alle zusammen: 0,2 + 0,4 + 0,4 + 0,6 + 1 = 2,6.');
  assert.equal(txt(st[0].fach, a), 'Bei einer Ziehung mit gleichen Chancen hat jede der n Personen die Wahrscheinlichkeit 1/n. Gleiche Werte sammeln ihre Chancen: P(X = 2) = 2 · 0,2 = 0,4.');
  assert.equal(txt(st[4].rechnung, a), '(2,56 + 0,36 + 0,36 + 0,16 + 5,76) · 0,2 = 9,2 / 5 = 1,84. Die Wurzel daraus: σ ≈ 1,36.');
  assert.match(txt(st[4].acht, a), /durch 4 teilt, bekommt 2,3 statt 1,84/);
  assert.equal(erwartung.table.lines[1].text(a), 'Nach Werten zusammengefasst: 1 · 0,2 + 2 · 0,4 + 3 · 0,2 + 5 · 0,2 = 2,6');
  assert.match(st[4].check.diagnose(a, 2.3)!, /durch 4 geteilt/);
  assert.match(st[1].check.diagnose(a, 13)!, /ohne Gewicht/);
  assert.match(st[0].check.diagnose(a, 5)!, /Zahl der Personen/);
  assert.match(erwartung.variants.population_variance.interpret(a).fachlich, /9,2 \/ 5 = 1,84, σ ≈ 1,36\. Teilst du durch n − 1 = 4, erhältst du s² = 2,3/);
  // Brücke mit den 200 Befragten (Lernzeit)
  const bc = bridgeContext(erwartung.compute, 'series', rows, 'lernzeit', '', 1), br = bridgeErwartung;
  assert.ok(close(bc.s.mu, 7.7515, 1e-9) && close(bc.s.sigma2, 10.42909775, 1e-8) && close(bc.s.s2, 10.48150528, 1e-8), 'μ, σ², s² wie in R');
  assert.equal(br.lines[1].person(bc), 'P002 steuert 8,3 · 1 / 200 ≈ 0,04 h bei.');
  assert.equal(br.lines[3].all(bc), 'Jeder Abstand wird mit sich selbst malgenommen. Das größte Quadrat liefert P175: 113,4 h².');
  assert.equal(br.lines[4].all(bc), '2.085,82 · 1 / 200 ≈ 10,43 h². Durch 200 − 1 geteilt wäre es s² ≈ 10,48 h².');
  assert.equal(br.metrics(bc, 'population_variance').at(-1)!.value, '10,43 h²');
  assert.equal(br.interpret(bc, 'expectation').kurz, 'Ziehst du sehr oft zufällig eine der 200 Befragten, kommen im Mittel 7,75 Stunden Lernzeit heraus. Das ist genau ihr Mittelwert.');
  assert.ok(close(10.48 * 199 / 200, 10.43, 0.005), 'Rechnung im R-Reiter mit den sichtbaren Zahlen');
});

/*
 * Fix-Runde 1 (Review B6): neue und bisher nur kommentierte Zahlen.
 *   pnorm(8.05, m, s) - pnorm(6.95, m, s)                         # 0.4452474 (gerundete Daten 7,0 bis 8,0)
 *   dnorm(7, m, s) / 3600; 0.48 / 3600                             # 0.0001345; 0.0001333 (auf die Sekunde genau)
 *   pnorm(6, m + 1, s)                                             # 0.005536561 (von gut 9 % auf unter 1 %)
 *   x <- c(1, 2, 2, 3, 5); min(x - mean(x)); min(x - mean(x))^2    # -1.6, 2.56
 *   range(sapply(1:200, function(k) { x <- l; x[k] <- 40; pv(x) / pv(l) - 1 }))   # 0.4431076 0.4961079 (um fast die Hälfte)
 *   atlas %>% crosstab(row = schulabschluss, col = weiterbildung, percentages = "row")   # 47.5% (Abitur, Ja), 41.0% (Total, Ja)
 *   atlas %>% crosstab(row = schulabschluss, col = weiterbildung, percentages = "col")   # erste Zeile 21.2% 20.7% 21.0%
 *   atlas %>% normality_test(schlafdauer)                          # KS = 0.051, p = 0.238
 *   atlas %>% frequency(schulabschluss, show_unused = TRUE)        # mittlerer Abschluss: 37 | 18.50 | 59.50; FHR Cum. 80.00
 */
test('B6 Fix-Runde 1: geänderte Texte und ihre Zahlen wie in R', () => {
  // C1, I1
  assert.match(discreteContinuous.bausteine[2].warum, /^Bei einer stetigen Größe verteilt sich die Wahrscheinlichkeit lückenlos über einen ganzen Bereich\./);
  assert.match(discreteContinuous.ausprobieren[2].question, /ohne jede Rundung/);
  assert.match(discreteContinuous.ausprobieren[2].explain, /0,48 \/ 3600 ≈ 0,00013\.$/);
  assert.ok(close(0.48 / 3600, 0.000133, 5e-7) && close(schlafModell.f(7) / 3600, 0.0001345, 5e-8), 'eine Sekunde im Modell');
  // I3: alle mit Weiterbildung, gleich großer Anteil
  const ind = stochasticIndependenceTabs.sample!;
  if (ind.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const allW = applyOp(rows, 'weiterbildung', 'constant', 1);
  assert.equal(ind.result(ctxFor(ind, allW)).kurz, 'In jeder Abschlussgruppe ist der Anteil mit Weiterbildung gleich groß: 100 %. Weiterbildung und Abschluss sind in diesen Daten unabhängig.');
  // I4, M5, M6, M7 und die Denkfragen der Werkstatt (I2, M16)
  const a = { s: erwartung.compute([1, 2, 2, 3, 5]), who: 0, names: erwartung.names };
  assert.match(erwartung.variants.population_variance.interpret(a).kurz, /^Der gewichtete Durchschnitt der Abstandsquadrate, jede Person mit ihrer Chance 0,2, ist 1,84 Personen²\. Seine Wurzel σ ≈ 1,36 Personen/);
  assert.equal(txt(erwartung.steps[3].acht, a), 'Im Taschenrechner Klammern setzen: (−1,6)² = 2,56. Ohne Klammern zeigt er −2,56.');
  assert.doesNotMatch(String(erwartung.think[1].explain), /σ²/);
  assert.equal(erwartung.think[1].tryIt, undefined, 'kein Ausprobieren, das auf der Karte Erwartungswert μ statt der Abstände zeigt');
  assert.equal(erwartung.think[2].questionFor?.expectation, 'Warum zählt jede der fünf Personen mit 0,2 und nicht mit 0,25?');
  assert.doesNotMatch(String(erwartung.think[2].explain), /n − 1|s²/);
  assert.doesNotMatch(erwartung.mut, /fünf kleinen Schritten/);
  assert.equal(erwartung.steps[4].title, 'Die Quadrate gewichtet zusammenzählen');
  const bc = bridgeContext(erwartung.compute, 'series', rows, 'lernzeit', '', 1);
  assert.match(bridgeErwartung.interpret(bc, 'population_variance').kurz, /^Der gewichtete Durchschnitt der Abstandsquadrate, jede Person mit der Chance 1 \/ 200, ist 10,43 h²\./);
  assert.equal(bridgeErwartung.interpret(bc, 'population_variance').zusatz, 'σ² ist s² mal 199 / 200, also ein wenig kleiner.');
  assert.equal(bridgeErwartung.interpret(bc, 'expectation').zusatz, 'Wären die 200 eine Zufallsstichprobe aus allen Erwachsenen, wäre ihr Mittelwert nur eine Schätzung für den Erwartungswert dort.');
  // M10, M13
  assert.match(densityFunction.genau.paragraphs[3], /Dafür sagt das Modell 44,5 %, fast genau die beobachteten 45 %\./);
  assert.ok(close(schlafModell.F(8.05) - schlafModell.F(6.95), 0.4452474, 1e-6), 'rundungstreuer Bereich wie in R');
  assert.match(theoreticalQuantile.stellDirVor.text, /6,03 Stunden: Im Modell schlafen 10 % höchstens so lange\./);
  // M14: größte Änderung des Erwartungswerts durch einen Ausreißer ist genau 0,2 h; σ² steigt um 44,3 % bis 49,6 %
  const lz = col('lernzeit'), mu = series(lz).mean, pv = (xs: number[]) => { const mm = series(xs).mean; return xs.reduce((s2, v) => s2 + (v - mm) ** 2, 0) / xs.length; };
  const rises = lz.map((_, k) => series(lz.map((v, i) => i === k ? 40 : v)).mean - mu);
  assert.ok(close(Math.min(...rises), 0.108, 1e-9) && close(Math.max(...rises), 0.2, 1e-9), 'μ steigt um 0,108 bis 0,2 h');
  const rel = lz.map((_, k) => pv(lz.map((v, i) => i === k ? 40 : v)) / pv(lz) - 1);
  assert.ok(close(Math.min(...rel), 0.4431076, 1e-6) && close(Math.max(...rel), 0.4961079, 1e-6), 'σ² steigt um fast die Hälfte');
  assert.equal(expectationTabs.sample!.think[2].expect.change, 'up');
  // Erklärungen der Vorhersagen
  assert.ok(schlafModell.F(6) > 0.09 && cdf(6, SCHLAF.mean + 1, SCHLAF.sd) < 0.01, 'von gut 9 % auf unter 1 %');
  assert.deepEqual([count(col('schlafdauer'), v => v - 1 <= 6 + 1e-9), count(col('schlafdauer'), v => v <= 6 + 1e-9)], [99, 22], 'fast die Hälfte statt gut einem Zehntel');
  assert.equal(count(col('schulabschluss'), v => v === 4), 40, '40 von 40 mit Abitur');
  // K2: Zahlen der R-Zuordnungen in den erfassten Ausgaben
  const text = (key: string, m: string) => locate(CATALOG_OUTPUT[key].output, m)?.text;
  assert.deepEqual([text('crosstab:0', '47.5%'), text('crosstab:0', '41.0%')], ['47.5%', '41.0%']);
  assert.match(CATALOG_OUTPUT['crosstab:1'].output, /Ohne Schulabschluss +\| +25 \| +17 \| +42 \|\n\| +col % +\| +21\.2% \| +20\.7% \| +21\.0% \|/);
  assert.deepEqual([text('normality_test:0', 'KS'), text('normality_test:0', 'p')], ['0.051', '0.238']);
  assert.match(CATALOG_OUTPUT['frequency:0'].output, /Mittlerer Abschluss +\| +37 \| +18\.50 \| +18\.50 \| +59\.50 \|/);
  assert.equal(locate(liveOutput({ fn: 'describe', show: ['mean', 'var'] }, rows, 'lernzeit'), 'Variance')?.text, '10.482');
});
