// Bereich B10 „Mittelwerte vergleichen“: jede Zahl in Texten, Beispielen und Kontrollfragen, in R nachgerechnet
// (R 4.x, mariposa 0.7.4 aus dem Quellstand) und hier festgehalten; dazu aus den Daten des Atlas nachgerechnet,
// damit eine Änderung des Lehrdatensatzes auffällt. ALLBUS nur als Aggregat; die Datei liest nur der Test mit
// ALLBUS_SAV (sonst übersprungen).
//
// Gemeinsamer Anfang aller R-Befehle:
//   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
//   library(dplyr)
//   atlas <- read_spss("Statistikatlas-200-Befragte.sav")      # writeSav(createSurvey()) bzw. Knopf im Atlas
//   allbus <- read_spss("ZA8831_v1-3-0.sav")
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSurvey } from '../../../domain/survey';
import { readSav } from '../../../sandbox/readSav';
import { validValues } from '../../../tasks/kit/stats';
import { applyOp } from '../../sample';
import { close } from '../../format';
import type { SampleCtx } from '../../types';
import { b10Mittelwerte } from './index';
import { dfText, lilliefors, often, pText, sig3, welchFor } from './stats';
import { tTestSentence, VERTRAUEN, welchFromSummary } from './t-test';
import { paarWerkstatt, pairedStats } from './paired-difference';
import { pairedDesign, sdForR, tForR, WISSEN } from './paired-design';
import { pairedFor } from './stats';
import { txt } from '../../types';

const rows = createSurvey();
const ctx = (columns: Record<string, string>, data = rows): SampleCtx => ({ rows: data, columns: Object.fromEntries(Object.entries(columns).map(([k, v]) => [k, [v]])) });
const near = (a: number, b: number, tol: number, label: string) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} statt ${b} (R)`);

test('B10: every concept of the area is registered with tabs', () => {
  const ids = Object.keys(b10Mittelwerte.explanations);
  for (const id of ids) assert.ok(b10Mittelwerte.tabs[id]?.next, `${id}: Reiter fehlen`);
});

test('B10: Schreibweise für kleine Kennwerte und p', () => {
  assert.equal(sig3(0.058315), '0,0583');
  assert.equal(sig3(0.0010434), '0,00104');
  assert.equal(pText(0.8758698), 'p ≈ 0,88');
  assert.equal(pText(0.03410942), 'p ≈ 0,034');
  assert.equal(pText(7.0e-8), 'p < 0,001');
  assert.equal(often(0.3318161), 'in etwa 33 von 100');
  assert.equal(dfText(175.84117), '175,8');
  assert.equal(dfText(198), '198');
});

/*
 * t-Test (Formel als Satz), ALLBUS 2023 ungewichtet, Vertrauen in den Bundestag nach Erhebungsgebiet:
 *   allbus %>% t_test(pt03, group = eastwest) %>% summary()
 *   # ALTE BUNDESLAENDER N = 2423, Mean 4.082 (4.082130), SD 1.591 (1.591246)
 *   # NEUE BUNDESLAENDER N = 1169, Mean 3.666 (3.666382), SD 1.660 (1.659832)
 *   # Equal variances not assumed: t = 7.128 (7.128173), df = 2222.707, Mean Diff. 0.416; Cohen's d 0.258 (0.2576078)
 *   allbus %>% t_test(pt03, group = eastwest)        # t(2222.7) = 7.128, p < 0.001 ***, g = 0.258 (small), N = 3592
 * Gerundete Startwerte und Kurzbefehle (Welch aus Kennwerten, wie welchFromSummary):
 *   welch <- function(m1, m2, s1, s2, n1, n2) { se <- sqrt(s1^2/n1 + s2^2/n2); t <- (m1 - m2)/se
 *     df <- (s1^2/n1 + s2^2/n2)^2 / ((s1^2/n1)^2/(n1 - 1) + (s2^2/n2)^2/(n2 - 1)); c(se, t, df, 2 * pt(-abs(t), df)) }
 *   welch(4.08, 3.67, 1.59, 1.66, 2423, 1169)   # se 0.0583147, t 7.030817, df 2220.973, p 2.7e-12
 *   welch(4.08, 3.67, 1.59, 1.66, 24, 12)       # se 0.5787666, t 0.7084029, df 21.26632, p 0.4863882
 *   1.59^2 / 2423; 1.66^2 / 1169                # 0.001043376, 0.002357228
 *   0.41 / sqrt(((2423 - 1) * 1.59^2 + (1169 - 1) * 1.66^2) / (2423 + 1169 - 2))   # d = 0.2541678
 *   welch(4.4, 4.0, 1, 1, 50, 50)               # Kontrollfrage: se 0.2, t 2
 * Lehrdatensatz (Reiter „Mit 200 Befragten“):
 *   atlas %>% t_test(lernzeit, group = weiterbildung) %>% summary()
 *   # Nein 118, 7.781; Ja 82, 7.709; t = 0.156 (0.1564348), df 175.841, p .876 (0.8758698), SE 0.465 (0.4654934), g 0.022
 *   atlas %>% mutate(lernzeit = 60 - lernzeit) %>% t_test(lernzeit, group = weiterbildung)   # t(175.8) = -0.156
 */
test('t-Test: ALLBUS-Werte, gerundete Startwerte, Kurzbefehle und Kontrollfrage wie in R', () => {
  const exact = welchFromSummary({ 'x̄₁': VERTRAUEN.west.mean, 'x̄₂': VERTRAUEN.ost.mean, 's₁': VERTRAUEN.west.sd, 's₂': VERTRAUEN.ost.sd, 'n₁': VERTRAUEN.west.n, 'n₂': VERTRAUEN.ost.n });
  near(exact.t, VERTRAUEN.t, 2e-5, 'ALLBUS t'); near(exact.df, VERTRAUEN.df, 1e-3, 'ALLBUS df'); near(exact.d, 0.2576078, 1e-6, 'ALLBUS d');
  const s = tTestSentence.compute(tTestSentence.initial);
  near(s.se, 0.0583147, 1e-7, 'Start SE'); near(s.t, 7.030817, 1e-5, 'Start t'); near(s.df, 2220.973, 1e-3, 'Start df'); near(s.d, 0.2541678, 1e-6, 'Start d');
  near(s.v1, 0.001043376, 1e-9, 'Start West'); near(s.v2, 0.002357228, 1e-9, 'Start Ost');
  assert.ok(s.p < 0.001);
  const small = tTestSentence.compute(tTestSentence.quick[0].apply(tTestSentence.initial));
  assert.deepEqual([small['n₁'], small['n₂']], [24, 12]);
  near(small.se, 0.5787666, 1e-6, 'durch 100: SE'); near(small.t, 0.7084029, 1e-6, 'durch 100: t'); near(small.df, 21.26632, 1e-4, 'durch 100: df'); near(small.p, 0.4863882, 1e-6, 'durch 100: p');
  const check = welchFromSummary({ 'x̄₁': 4.4, 'x̄₂': 4, 's₁': 1, 's₂': 1, 'n₁': 50, 'n₂': 50 });
  near(check.se, 0.2, 1e-12, 'Kontrollfrage SE'); near(check.t, 2, 1e-9, 'Kontrollfrage t');
  assert.equal(tTestSentence.check.answer, 2);
  assert.match(tTestSentence.check.diagnose(0.5), /^Fast! Andersherum/);
  assert.match(tTestSentence.wofuer, /2\.423 Befragte .* 4,08 Punkte\. Die 1\.169 Befragten .* 3,67 Punkte \(ungewichtet\)/);
  assert.match(tTestSentence.genau.paragraphs[0], /t\(2222\.7\) = 7\.128, p < 0\.001 und g = 0\.258\. Mit den gerundeten Werten oben kommt 7,03 heraus/);
  assert.match(tTestSentence.interpret(s).kurz, /wäre ein so großes t in weniger als 1 von 1\.000 Stichproben zu erwarten \(p < 0,001\)\. Mit d ≈ 0,25 ist der Unterschied nach der Faustregel von Cohen klein\./);
  assert.match(tTestSentence.worked(s)[1].text, /1,59² \/ 2\.423 ≈ 0,00104 und 1,66² \/ 1\.169 ≈ 0,00236/);
  assert.match(tTestSentence.worked(s)[3].text, /0,41 \/ 0,0583 ≈ 7,03/);
});

test('t-Test: Lernzeit nach Weiterbildung im Reiter wie in R, auch umgepolt', () => {
  const w = welchFor(ctx({ x: 'lernzeit', group: 'weiterbildung' }))!;
  assert.deepEqual([w.n0, w.n1], [118, 82]);
  near(w.m0, 7.781356, 1e-6, 'ohne'); near(w.m1, 7.708537, 1e-6, 'mit'); near(w.t, 0.1564348, 1e-6, 't'); near(w.df, 175.84117, 1e-4, 'df');
  near(w.p, 0.8758698, 1e-6, 'p'); near(w.se, 0.4654934, 1e-6, 'SE'); near(w.g, 0.022, 5e-4, 'g');
  const turned = welchFor(ctx({ x: 'lernzeit', group: 'weiterbildung' }, applyOp(rows, 'lernzeit', 'reverse')))!;
  near(turned.t, -0.1564348, 1e-6, 'umgepolt');
  const sample = b10Mittelwerte.tabs.t_test.sample!;
  assert.equal(sample.kind, 'analysis');
  if (sample.kind === 'analysis') {
    const r = sample.result(ctx({ x: 'lernzeit', group: 'weiterbildung' }));
    assert.match(r.kurz, /im Schnitt 7,78 Stunden gelernt, mit Weiterbildung 7,71 Stunden\. Das sind 0,07 Stunden Unterschied oder 0,16 Standardfehler\. .* in etwa 88 von 100 Stichproben vor \(p ≈ 0,88\)/);
    assert.match(r.fachlich, /0,07 h, SE ≈ 0,465 h, t ≈ 0,16 bei 175,8 Freiheitsgraden, p ≈ 0,88, Hedges' g ≈ 0,02/);
  }
});

const ALLBUS = process.env.ALLBUS_SAV;
test('t-Test: ALLBUS-Aggregate aus der Datei nachgerechnet', { skip: !ALLBUS && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const bytes = readFileSync(ALLBUS!), sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const v = validValues(sav.byName.get('pt03')!), g = validValues(sav.byName.get('eastwest')!);
  for (const [code, ref] of [[1, VERTRAUEN.west], [2, VERTRAUEN.ost]] as const) {
    const xs = [...v].filter((x, i) => Number.isFinite(x) && g[i] === code);
    const m = xs.reduce((a, b) => a + b, 0) / xs.length, sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
    assert.equal(xs.length, ref.n, `n in Gruppe ${code}`); near(m, ref.mean, 1e-6, `Mittelwert ${code}`); near(sd, ref.sd, 1e-6, `SD ${code}`);
  }
});

/*
 * Gepaarte Differenzen (Werkstatt), fünf Beispielpersonen, erster Test x = 12 9 14 10 7:
 *   x <- c(12, 9, 14, 10, 7)
 *   y <- c(10, 12, 17, 13, 10); d <- y - x; c(mean(d), sd(d), sd(d)/sqrt(5)); t.test(y, x, paired = TRUE)
 *   # d = -2 3 3 3 3; 2, 2.236068, 1; t = 2, df = 4, p-value = 0.1161165
 *   y <- c(13, 11, 16, 12, 10); d <- y - x; c(mean(d), sd(d), sd(d)/sqrt(5)); t.test(y, x, paired = TRUE)
 *   # d = 1 2 2 2 3; 2, 0.7071068, 0.3162278; t = 6.324555, df = 4, p-value = 0.003198202
 *   sd(x)                                                     # 2.701851
 * Lehrdatensatz, wissenstest und wissenstest_t2 (Reiter):
 *   atlas %>% mutate(differenz = wissenstest_t2 - wissenstest) %>% t_test(differenz, mu = 0) %>% summary()
 *   # N 200, Mean 0.750, Std. Deviation 1.894 (1.893522), Std. Error Mean 0.134 (0.1338923); t = 5.602 (5.601519), df 199, p < .001
 *   d <- atlas$wissenstest_t2 - atlas$wissenstest; table(sign(d))   # -1: 53, 0: 32, 1: 115
 *   t.test(d)$p.value                                                # 7.003222e-08
 *   mean(atlas$wissenstest_t2 - 1 - atlas$wissenstest)               # -0.25 (zweiter Test eine Aufgabe weniger)
 *   sd(atlas$wissenstest_t2 - (atlas$wissenstest + 1))                # 1.893522 (erster Test eine mehr: s bleibt)
 */
test('Gepaarte Differenzen: die fünf Beispielpersonen wie in R', () => {
  const [mixed, even] = paarWerkstatt.presets.map(p => pairedStats(p.data));
  assert.deepEqual(mixed.d, [-2, 3, 3, 3, 3]); assert.deepEqual(even.d, [1, 2, 2, 2, 3]);
  near(mixed.mean, 2, 1e-12, 'd̄'); near(mixed.sd, 2.236068, 1e-6, 's'); near(mixed.se, 1, 1e-12, 'SE'); near(mixed.t!, 2, 1e-12, 't'); near(mixed.p!, 0.1161165, 1e-7, 'p');
  near(even.sd, 0.7071068, 1e-7, 's'); near(even.se, 0.3162278, 1e-7, 'SE'); near(even.t!, 6.324555, 1e-6, 't'); near(even.p!, 0.003198202, 1e-9, 'p');
  near(mixed.sdX, 2.701851, 1e-6, 'sd(x)');
  const at = (s: typeof mixed) => ({ s, who: 0, names: paarWerkstatt.names });
  assert.equal(txt(paarWerkstatt.steps[3].rechnung, at(mixed)), 'SE = 2,24 / √5 ≈ 2,24 / 2,24 = 1.');
  assert.equal(txt(paarWerkstatt.steps[4].rechnung, at(mixed)), 't = 2 / 1 = 2.');
  assert.equal(txt(paarWerkstatt.steps[3].rechnung, at(even)), 'SE = 0,71 / √5 ≈ 0,71 / 2,24 ≈ 0,316. Mit allen Nachkommastellen gerechnet.');
  assert.equal(txt(paarWerkstatt.steps[4].rechnung, at(even)), 't = 2 / 0,316 ≈ 6,32. Mit allen Nachkommastellen gerechnet.');
  const v = paarWerkstatt.variants.paired_difference;
  assert.match(v.interpret(at(mixed)).kurz, /in etwa 12 von 100 Stichproben zu erwarten \(p ≈ 0,12\)\. Bei nur fünf Personen wäre das nicht überraschend\./);
  assert.match(v.interpret(at(even)).kurz, /in weniger als 1 von 100 Stichproben zu erwarten \(p ≈ 0,0032\)\. Das wäre überraschend/);
  assert.match(v.genau.paragraphs(at(mixed))[0], /s ≈ 2,7 Aufgaben, die Veränderungen mit s ≈ 2,24/);
  // Denkfragen: „erster Test eine Aufgabe mehr“ senkt d̄ um 1 und lässt s gleich; „alle genau +2“ lässt t undefiniert.
  const shifted = pairedStats(paarWerkstatt.think[1].tryIt!.apply(paarWerkstatt.presets[0].data));
  near(shifted.mean, 1, 1e-12, 'd̄ nach Verschieben'); near(shifted.sd, mixed.sd, 1e-12, 's nach Verschieben');
  assert.equal(pairedStats(paarWerkstatt.think[2].tryIt!.apply(paarWerkstatt.presets[0].data)).t, null);
});

test('Gepaarte Differenzen: die 200 Befragten wie in R', () => {
  const c = ctx({ x: 'wissenstest', y: 'wissenstest_t2' }), p = pairedFor(c);
  near(p.dMean, 0.75, 1e-12, 'd̄'); near(p.sdD, 1.893522, 1e-6, 's'); near(p.se, 0.1338923, 1e-7, 'SE'); near(p.t, 5.601519, 1e-6, 't'); near(p.p, 7.003222e-8, 1e-12, 'p');
  assert.deepEqual([p.up, p.down, p.same], [115, 53, 32]);
  near(pairedFor(ctx({ x: 'wissenstest', y: 'wissenstest_t2' }, applyOp(rows, 'wissenstest_t2', 'shift', -1))).dMean, -0.25, 1e-9, 'zweiter Test −1');
  near(pairedFor(ctx({ x: 'wissenstest', y: 'wissenstest_t2' }, applyOp(rows, 'wissenstest', 'shift', 1))).sdD, 1.893522, 1e-6, 'erster Test +1');
  const sample = b10Mittelwerte.tabs.paired_difference.sample!;
  if (sample.kind === 'analysis') {
    const r = sample.result(c);
    assert.match(r.kurz, /im Schnitt \+0,75 Aufgaben im Vergleich zum ersten\. Die Veränderungen streuen mit s ≈ 1,89 Aufgaben, der Standardfehler ist 0,134\. .*in weniger als 1 von 1\.000 Stichproben zu erwarten \(p < 0,001\)/);
    assert.equal(r.zusatz, '115 Befragte lösen beim zweiten Test mehr Aufgaben, 53 weniger, 32 gleich viele.');
    assert.match(r.fachlich, /t\(199\) ≈ 5,6, p < 0,001/);
  }
});

/*
 * Verbundene Messungen (Begriffskarte), Lehrdatensatz:
 *   x <- atlas$wissenstest; y <- atlas$wissenstest_t2
 *   c(mean(x), mean(y), sd(x), sd(y), sd(y - x), cor(x, y))   # 10.125 10.875 3.11575265 3.48714437 1.893522 0.8413497
 *   t.test(y, x, paired = TRUE)$statistic                     # 5.601519
 *   t.test(y, x)                                              # Welch: t = 2.268145, df = 393.0573, p = 0.02386226
 *   sapply(c(0, 0.5, 0.84, 0.95), function(r) sqrt(sd(x)^2 + sd(y)^2 - 2 * r * sd(x) * sd(y)))
 *   # 4.676333 3.317079 1.901251 1.106544
 *   sapply(c(0, 0.5, 0.84, 0.95), function(r) mean(y - x) / (sqrt(sd(x)^2 + sd(y)^2 - 2 * r * sd(x) * sd(y)) / sqrt(200)))
 *   # 2.268145 3.197573 5.578747 9.585341
 *   t.test((y - 1) - x)$statistic                             # -1.867173 (zweiter Test eine Aufgabe weniger; mariposa: t(199) = -1.867)
 */
test('Verbundene Messungen: Zahlen der Karte, Regler und Reiter wie in R', () => {
  const p = pairedFor(ctx({ x: 'wissenstest', y: 'wissenstest_t2' }));
  for (const [mine, data, label] of [[WISSEN.m1, p.mx, 'erster Test'], [WISSEN.m2, p.my, 'zweiter Test'], [WISSEN.s1, p.sx, 's₁'], [WISSEN.s2, p.sy, 's₂'], [WISSEN.sd, p.sdD, 's der Differenzen'],
    [WISSEN.r, p.r, 'r'], [WISSEN.tPaired, p.t, 't gepaart'], [WISSEN.tWelch, p.tU, 't Welch'], [WISSEN.dfWelch, p.dfU, 'df Welch'], [WISSEN.pWelch, p.pU, 'p Welch']] as const) {
    near(mine, data, 1e-4, `${label} (Karte gegen Daten)`);
  }
  for (const [r, sd, t] of [[0, 4.676333, 2.268145], [0.5, 3.317079, 3.197573], [0.84, 1.901251, 5.578747], [0.95, 1.106544, 9.585341]]) {
    near(sdForR(r), sd, 1e-6, `s bei r = ${r}`); near(tForR(r), t, 1e-6, `t bei r = ${r}`);
  }
  near(tForR(WISSEN.r), WISSEN.tPaired, 1e-5, 'Regler am Start = gepaartes t');
  assert.match(pairedDesign.regler!.describe(WISSEN.r), /^Bei r = 0,84 streuen die Veränderungen um 1,89 Aufgaben\. Die mittlere Veränderung von \+0,75 Aufgaben ist dann 5,6 Standardfehler groß\.$/);
  assert.match(pairedDesign.regler!.describe(0), /um 4,68 Aufgaben\. .* 2,27 Standardfehler groß\. So rechnet auch, wer die Paare übersieht\./);
  assert.match(pairedDesign.stellDirVor.text, /im Mittel 10,13 von 20 Aufgaben, beim zweiten 10,88\. .* s ≈ 3,12 und 3,49 Aufgaben\. .* s ≈ 1,89 Aufgaben\. .*\(r ≈ 0,84\)/);
  near(pairedFor(ctx({ x: 'wissenstest', y: 'wissenstest_t2' }, applyOp(rows, 'wissenstest_t2', 'shift', -1))).t, -1.867173, 1e-6, 't nach zweitem Test −1');
  const sample = b10Mittelwerte.tabs.paired_design.sample!;
  if (sample.kind === 'analysis') {
    const r = sample.result(ctx({ x: 'wissenstest', y: 'wissenstest_t2' }));
    assert.match(r.kurz, /von \+0,75 Aufgaben 5,6 Standardfehler groß\. Als zwei fremde Gruppen gerechnet sind es nur 2,27/);
    assert.match(r.fachlich, /t\(199\) ≈ 5,6, p < 0,001\. .* t ≈ 2,27 bei 393,1 Freiheitsgraden, p ≈ 0,024\. .* r ≈ 0,84/);
  }
});

// Damit der Import genutzt wird, auch wenn spätere Begriffe ihn brauchen.
void close; void lilliefors;
