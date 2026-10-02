import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { sampleColumn } from '../../sample';
import { close } from '../../format';
import type { SampleCtx, SampleTab } from '../../types';
import { ABSCHLUSS, HAUSHALT, SCHLAF, WISSEN, meanSd } from './gemeinsam';
import { probability, probabilityTabs } from './probability';
import { conditionalProbability, conditionalProbabilityTabs } from './conditional_probability';
import { stochasticIndependence, stochasticIndependenceTabs } from './stochastic_independence';
import { randomVariable, randomVariableTabs } from './random_variable';
import { empiricalDistribution, empiricalDistributionTabs } from './empirical_distribution';
import { theoreticalDistribution, theoreticalDistributionTabs } from './theoretical_distribution';
import { discreteContinuous, discreteContinuousTabs } from './discrete_continuous';

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
  const sl = col('schlafdauer'), m = meanSd(sl);
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
  assert.match(card.check.diagnose[3]!, /12 von 200, also 6 %/);
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
