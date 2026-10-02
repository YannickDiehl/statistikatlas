import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { CATALOG_OUTPUT } from '../../catalogOutput';
import { locate } from '../../rRead';
import { applyOp, bridgeContext } from '../../sample';
import { close } from '../../format';
import { txt, type Ctx } from '../../types';
import { zstats } from './shared';
import { zentrieren, bridgeZentrieren } from './zentrieren';
import { standardisieren, bridgeStandardisieren } from './standardisieren';

/*
 * Referenzwerte des Bereichs B4 „Umformen“, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem
 * Lehrdatensatz, gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas, Knopf „SPSS-Datei (.sav)“, oder
 * writeSav(createSurvey())):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *
 * Zentrieren und Standardisieren, fünf Beispielpersonen:
 *   x <- c(5, 7, 9, 9, 10); mean(x); sd(x); (x - mean(x)) / sd(x)   # 8; 2; -1.5 -0.5 0.5 0.5 1.0
 *   sqrt(sum((x - mean(x))^2) / 5)                                  # 1.788854 (durch n statt n − 1)
 *   x <- c(5, 7, 9, 9, 20); mean(x); sd(x); (x - mean(x)) / sd(x)   # 10; 5.830952; -0.857 -0.514 -0.171 -0.171 1.715
 *   sqrt(sum((x - mean(x))^2) / 5); 5 / sd(x)                        # 5.215362; 0.8574929
 * Lehrdatensatz, Lernzeit:
 *   x <- as.numeric(atlas$lernzeit); mean(x); sd(x); sum((x - mean(x))^2)   # 7.7515; 3.237515; 2085.81955
 *   sum(x < mean(x)); sum(x > mean(x))                                       # 103; 97
 *   z <- (x - mean(x)) / sd(x)
 *   z[atlas$id == "P002"]; (x - mean(x))[atlas$id == "P002"]                 # 0.16942; 0.5485
 *   min(z); atlas$id[which.min(z)]; max(z); atlas$id[which.max(z)]           # -2.394274 P100; 3.289096 P175
 *   sum(abs(z) <= 1); sum(z > 2); sum(z < -2)                                 # 141; 4; 2
 *   all.equal(((x + 1) - mean(x + 1)) / sd(x + 1), z); all.equal(((2 * x) - mean(2 * x)) / sd(2 * x), z)   # TRUE; TRUE
 *   all.equal(((60 - x) - mean(60 - x)) / sd(60 - x), -z)                   # TRUE: Umpolen dreht das Vorzeichen
 *   atlas %>% center(lernzeit, suffix = "_zentriert") %>% describe(lernzeit, lernzeit_zentriert, show = c("mean", "sd"))
 *   #   lernzeit 7.752 3.238; lernzeit_zentriert 0.000 3.238
 *   atlas %>% std(lernzeit, method = "sd", suffix = "_z") %>% describe(lernzeit, lernzeit_z, show = c("mean", "sd"))
 *   #   lernzeit 7.752 3.238; lernzeit_z 0.000 1.000
 *   atlas %>% std(lernzeit, method = "z", suffix = "_z")   # Fehler: 'arg' sollte eines von '“sd”, “2sd”, “mad”, “gmd”' sein
 *   atlas %>% center(geschlecht2)                          # Can't select columns that don't exist.
 */

const rows = createSurvey();
const ctx = <S,>(s: S, who = 0): Ctx<S> => ({ s, who, names: ['A', 'B', 'C', 'D', 'E'] });

test('B4 Zentrieren und Standardisieren: fünf Beispielpersonen wie in R', () => {
  const a = zstats([5, 7, 9, 9, 10]), b = zstats([5, 7, 9, 9, 20]);
  assert.equal(a.mean, 8); assert.equal(a.sd, 2); assert.deepEqual(a.z, [-1.5, -0.5, 0.5, 0.5, 1]);
  assert.ok(close(a.sdN, 1.788854, 1e-6), 'durch n geteilt');
  assert.equal(b.mean, 10); assert.ok(close(b.sd, 5.830952, 1e-6), 's mit Viellernerin');
  [-0.857493, -0.514496, -0.171499, -0.171499, 1.714986].forEach((z, i) => assert.ok(close(b.z![i], z, 1e-6), `z ${i}`));
  assert.ok(close(b.sdN, 5.215362, 1e-6) && close(b.raw![0], 0.8574929, 1e-6), 'Diagnosewerte wie in R');
  const z = standardisieren.steps;
  assert.equal(txt(z[2].rechnung, ctx(a)), 's = √((9 + 1 + 1 + 1 + 4) / 4) = √(16 / 4) = √4 = 2');
  assert.equal(txt(z[3].rechnung, ctx(a)), 'Person A: −3 / 2 = −1,5.');
  assert.equal(txt(z[4].rechnung, ctx(a)), 'z für A = −1,5: A liegt 1,5 Standardabweichungen unter der Mitte. Alle fünf z-Werte zusammen: −1,5 − 0,5 + 0,5 + 0,5 + 1 = 0.');
  assert.equal(txt(z[3].acht, ctx(b)), 'Erst die Mitte abziehen, dann teilen. Wer die Lernzeit selbst teilt, bekommt für A 5 / 5,83 ≈ 0,86 statt −0,86.');
  assert.equal(txt(z[2].acht, ctx(b)), 'Teile durch n − 1 = 4, nicht durch 5. Sonst kommt 5,22 statt 5,83 heraus, und alle z-Werte werden etwas zu groß.');
  assert.equal(txt(zentrieren.steps[1].rechnung, ctx(a)), 'Person A: 5 − 8 = −3. A lernt 3 Stunden weniger als der Durchschnitt.');
  assert.equal(txt(zentrieren.steps[1].acht, ctx(b)), 'Alle bekommen denselben Abzug. Deshalb bleiben die Abstände untereinander gleich: Zwischen A und E liegen vorher und nachher 15 Stunden.');
  // Diagnosen: Varianz statt s, durch n geteilt, Lernzeit selbst geteilt, Mitte in Stunden statt 0.
  assert.match(z[2].check.diagnose(ctx(a), 4)!, /^Fast! Das ist die Varianz/);
  assert.match(z[2].check.diagnose(ctx(a), 1.79)!, /^Fast! Du hast durch 5 geteilt/);
  assert.match(z[3].check.diagnose(ctx(a), 2.5)!, /^Fast! Du hast die Lernzeit selbst geteilt/);
  assert.match(z[4].check.diagnose(ctx(a), 8)!, /^Fast! Das ist die Mitte der Lernzeiten/);
  // Ohne Streuung: keine z-Werte, die Frage erwartet NA.
  const flat = zstats([8, 8, 8, 8, 8]);
  assert.equal(flat.z, null); assert.equal(z[3].check.answer(ctx(flat)), 'NA');
  assert.equal(standardisieren.variants.z.interpret(ctx(flat)).kurz, 'Alle lernen gleich lange. Die Streuung ist 0, und z-Werte gibt es nicht.');
});

test('B4 Zentrieren und Standardisieren: die 200 Befragten wie in R', () => {
  const c = bridgeContext(standardisieren.compute, 'series', rows, 'lernzeit', '', 1);
  assert.ok(close(c.s.mean, 7.7515, 1e-9) && close(c.s.sd, 3.237515, 1e-6) && close(c.s.ss, 2085.81955, 1e-5), 'Lernzeit wie in R');
  assert.ok(close(c.s.z![1], 0.16942, 1e-5) && close(c.s.dev[1], 0.5485, 1e-9), 'P002 wie in R');
  assert.deepEqual([c.s.below, c.s.above], [103, 97]);
  assert.deepEqual([c.names[c.s.minAt], c.names[c.s.maxAt]], ['P100', 'P175']);
  assert.ok(close(c.s.z![c.s.minAt], -2.394274, 1e-6) && close(c.s.z![c.s.maxAt], 3.289096, 1e-6));
  const b = bridgeStandardisieren;
  assert.equal(b.lines[4].all(c), 'Die 200 z-Werte reichen von −2,39 (P100) bis +3,29 (P175). Ihre Mitte ist 0, ihre Standardabweichung 1.');
  assert.equal(b.lines[3].person(c), 'P002: +0,55 / 3,24 ≈ +0,17.');
  assert.equal(b.lines[2].all(c), 'Quadratsumme 2.085,82 h² geteilt durch 199, daraus die Wurzel: s ≈ 3,24 h.');
  const i = b.interpret(c, 'z');
  assert.equal(i.kurz, 'P002 liegt 0,17 Standardabweichungen über der Mitte: mehr Lernzeit als der Durchschnitt. 141 von 200 Befragten liegen höchstens eine Standardabweichung von der Mitte entfernt.');
  assert.equal(i.zusatz, '6 von 200 Befragten liegen mehr als zwei Standardabweichungen von der Mitte entfernt: 4 darüber, 2 darunter.');
  assert.equal(b.metrics(c, 'z').at(-1)!.value, '+0,17');
  // Vorhersagen: Verschieben und Verdoppeln lassen z gleich, Umpolen (60 minus Stunden) dreht das Vorzeichen.
  const zAfter = (d: typeof rows) => b.value(bridgeContext(standardisieren.compute, 'series', d, 'lernzeit', '', 1), 'z')!;
  assert.ok(close(zAfter(applyOp(rows, 'lernzeit', 'shift', 1)), c.s.z![1], 1e-9) && close(zAfter(applyOp(rows, 'lernzeit', 'double', 2)), c.s.z![1], 1e-9));
  assert.ok(close(zAfter(applyOp(rows, 'lernzeit', 'reverse')), -c.s.z![1], 1e-9));
  const zc = bridgeContext(zentrieren.compute, 'series', rows, 'lernzeit', '', 1), bz = bridgeZentrieren;
  assert.equal(bz.lines[1].all(zc), 'Von jedem der 200 Werte ziehen wir 7,75 h ab. Danach liegt die Mitte bei 0: 103 Werte sind negativ, 97 positiv.');
  assert.equal(bz.interpret(zc, 'centering').kurz, 'Nach dem Zentrieren liegt die Mitte bei 0. P002 steht bei +0,55: P002 lernt 0,55 Stunden mehr als der Durchschnitt.');
  assert.equal(bz.interpret(zc, 'centering').fachlich, 'Die zentrierte Spalte „Lernzeit“ hat den Mittelwert 0 und dieselbe Standardabweichung wie vorher, s ≈ 3,24 h.');
});

test('B4 Zentrieren und Standardisieren: die Zahlen in R finden ihren Platz', () => {
  const center = CATALOG_OUTPUT['centering:0'].output, std = CATALOG_OUTPUT['z:0'].output;
  assert.deepEqual(['0.000', 'Mean', 'SD', 'N'].map(m => locate(center, m)?.text), ['0.000', '7.752', '3.238', '200']);
  assert.match(center, /lernzeit_zentriert {2}0\.000 {2}3\.238/);
  assert.deepEqual(['1.000', '0.000', 'Mean', 'SD'].map(m => locate(std, m)?.text), ['1.000', '0.000', '7.752', '3.238']);
  assert.match(std, /lernzeit_z {2}0\.000 {2}1\.000/);
});
