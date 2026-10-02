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
