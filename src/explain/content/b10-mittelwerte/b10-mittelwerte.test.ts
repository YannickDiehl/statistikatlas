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

// Damit der Import genutzt wird, auch wenn spätere Begriffe ihn brauchen.
void close; void lilliefors;
