import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { applyOp, bridgeContext } from '../../sample';
import { txt, type Ctx } from '../../types';
import { tabsFor } from '../../registry';
import { rangkorrelation, rankStats, type RankStats } from './spearman';
import { paarvergleich, pairCount, type PairCount } from './paarvergleich';
import { abschlussNachWeiterbildung, crossCounts, FUENF, kreuztabelle } from './crosstab';
import { erwartet, erwartetJa } from './expected';
import { phiData, phiSatz } from './phi';
import { cramerSatz, vData } from './cramers-v';
import { partialData, partielleKorrelation } from './partial-cor';
import { CATALOG_OUTPUT } from '../../catalogOutput';
import { locate } from '../../rRead';

/*
 * Referenzwerte des Bereichs B5 „Zusammenhang“, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem
 * Lehrdatensatz, gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) als .sav):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *
 * Die R-Befehle zu jedem Begriff stehen über seinem Test.
 */

const rows = createSurvey();
const at = <S,>(compute: (d: never) => S, data: unknown, who = 0, names: readonly string[] = ['A', 'B', 'C', 'D', 'E']): Ctx<S> => ({ s: compute(data as never), who, names });
const near = (a: number | null, b: number, tol = 1e-6) => a !== null && Math.abs(a - b) <= tol;

/*
 * Spearman, Werkstatt (fünf Personen):
 *   x <- c(2, 4, 5, 7, 9); y <- c(3, 2, 6, 5, 8)
 *   rank(x); rank(y)                                        # 1 2 3 4 5; 2 1 4 3 5
 *   cor(x, y, method = "spearman"); cor(x, y)               # 0.8; 0.829383
 *   data.frame(x, y) %>% spearman_rho(x, y)                 # rho = 0.800, p = 0.104, N = 5
 *   cor(c(2, 4, 5, 7, 10), y, method = "spearman")          # 0.8 (E auf 10 Stunden: gleiche Ränge)
 *   cor(x, c(9, 7, 5, 3, 2), method = "spearman")           # -1
 *   cor(c(1, 2, 3, 5, 10), c(2, 4, 7, 8, 9), method = "spearman"); cor(c(1, 2, 3, 5, 10), c(2, 4, 7, 8, 9))   # 1; 0.842164
 *   x <- c(2, 4, 4, 7, 9); y <- c(3, 5, 2, 5, 8)
 *   rank(x); rank(y)                                        # 1 2.5 2.5 4 5; 2 3.5 1 3.5 5
 *   sum((rank(x) - 3) * (rank(y) - 3)); sum((rank(x) - 3)^2); sum((rank(y) - 3)^2)   # 7.25; 9.5; 9.5
 *   cor(x, y, method = "spearman"); 1 - 6 * sum((rank(x) - rank(y))^2) / (5 * 24)   # 0.763158; 0.775
 * Brücke, x = lernzeit, y = wissenstest:
 *   rx <- rank(atlas$lernzeit); ry <- rank(atlas$wissenstest)
 *   sum((rx - 100.5) * (ry - 100.5)); sum((rx - 100.5)^2); sum((ry - 100.5)^2)       # 316796.75; 666506.5; 659445.5
 *   cor(atlas$lernzeit, atlas$wissenstest, method = "spearman")                      # 0.477847
 *   p <- (rx - 100.5) * (ry - 100.5); sum(p > 0); sum(p < 0)                         # 119; 81
 *   rx[2]; ry[2]; p[2]                                                               # 113.5; 70.5; -390 (P002)
 *   cor(2 * lernzeit, wissenstest, method = "spearman"); cor(lernzeit + 1, …)        # 0.477847 beide
 *   cor(lernzeit, 20 - wissenstest, method = "spearman")                             # -0.477847
 * R-Ausgabe (Katalog): atlas %>% spearman_rho(finanzlage, schulabschluss, use = "listwise")   # rho = 0.130, p = 0.066, N = 200
 */
test('B5 Spearman: Werkstatt, Brücke und R-Ausgabe wie in R', () => {
  const [meist, bogen, gleich] = rangkorrelation.presets.map(p => rankStats(p.data));
  assert.deepEqual([meist.rx, meist.ry], [[1, 2, 3, 4, 5], [2, 1, 4, 3, 5]], 'Ränge meist');
  assert.ok(near(meist.rho, 0.8) && near(meist.r, 0.829383) && meist.sp === 8 && meist.qx === 10 && meist.qy === 10, 'meist: ρ, r, Summe, Quadratsummen');
  assert.ok(near(bogen.rho, 1) && near(bogen.r, 0.842164), 'bogen: ρ = 1, r ≈ 0,84');
  assert.deepEqual([gleich.rx, gleich.ry], [[1, 2.5, 2.5, 4, 5], [2, 3.5, 1, 3.5, 5]], 'mittlere Ränge');
  assert.ok(near(gleich.sp, 7.25) && near(gleich.qx, 9.5) && near(gleich.qy, 9.5) && near(gleich.rho, 0.763158) && near(gleich.r, 0.837472) && near(gleich.short, 0.775), 'gleich: Summe, Quadratsummen, ρ, r, Kurzformel');
  // Denkfragen: E auf 10 Stunden ändert ρ nicht, umgekehrte Reihenfolge ergibt −1, der Bogen hat r ≈ 0,84.
  const th = rangkorrelation.think;
  assert.ok(near(rankStats(th[0].tryIt!.apply(rangkorrelation.presets[0].data)).rho, 0.8), 'E auf 10');
  assert.ok(near(rankStats(th[3].tryIt!.apply(rangkorrelation.presets[0].data)).rho, -1), 'umgekehrt');
  assert.match(txt(th[1].explain, at(rankStats, rangkorrelation.presets[0].data)), /etwa 0,84/);
  // Texte mit den Zahlen der Voreinstellungen.
  const s = rangkorrelation.steps, c = at<RankStats>(rankStats, rangkorrelation.presets[2].data, 1);
  assert.equal(txt(s[0].rechnung, c), 'Person B: 4 Stunden haben zwei Personen. Sie teilen sich die Plätze 2 und 3 und bekommen je Rang 2,5. 5 Aufgaben haben zwei Personen. Sie teilen sich die Plätze 3 und 4 und bekommen je Rang 3,5.');
  assert.match(txt(s[4].rechnung, c), /ρ = 7,25 \/ √\(9,5 · 9,5\) = 7,25 \/ 9,5 ≈ 0,76\./);
  assert.match(txt(s[4].rechnung, at(rankStats, rangkorrelation.presets[0].data)), /ρ = 8 \/ √\(10 · 10\) = 8 \/ 10 = 0,8\./);
  assert.match(rangkorrelation.variants.spearman.genau.paragraphs(c)[0], /ergäbe sie 0,78 statt ρ ≈ 0,76/);
  assert.match(s[0].check.diagnose(at(rankStats, rangkorrelation.presets[0].data, 1), 4)!, /^Fast! Das ist die Antwort selbst/);
  assert.match(s[0].check.diagnose(c, 2)!, /^Fast! Gleiche Antworten teilen sich ihre Plätze/);
  assert.match(s[4].check.diagnose(at(rankStats, rangkorrelation.presets[0].data), 2)!, /durch 4 geteilt/);
  // Brücke mit den 200 Befragten.
  const b = rangkorrelation.bridge!, bc = bridgeContext(rankStats, 'pairs', rows, 'lernzeit', 'wissenstest', 1);
  assert.ok(near(bc.s.sp, 316796.75) && near(bc.s.qx, 666506.5) && near(bc.s.qy, 659445.5) && near(bc.s.rho, 0.477847), 'Brücke: Summe, Quadratsummen, ρ');
  assert.equal(bc.s.prod.filter(p => p > 0).length, 119); assert.equal(bc.s.prod.filter(p => p < 0).length, 81);
  assert.deepEqual([bc.s.rx[1], bc.s.ry[1], bc.s.prod[1]], [113.5, 70.5, -390], 'P002');
  assert.equal(b.lines[0].person(bc), 'P002 hat bei „Lernzeit“ 8,3 h, das ist Rang 113,5, geteilt mit einer weiteren Person. Bei „Wissenstest“ hat P002 9 Aufgaben: Rang 70,5.');
  assert.equal(b.lines[3].all(bc), 'Die 200 Produkte ergeben zusammen 316.796,75. 119 sind positiv, 81 negativ.');
  assert.equal(b.lines[4].all(bc), '316.796,75 / √(666.506,5 · 659.445,5) ≈ 0,48. Zum Vergleich: Pearson-r der Werte selbst ist 0,54.');
  assert.equal(b.interpret(bc, 'spearman').zusatz, '119 von 200 Befragten stehen bei beiden Spalten auf derselben Seite des mittleren Rangs.');
  const rho = (d: typeof rows) => b.value(bridgeContext(rankStats, 'pairs', d, 'lernzeit', 'wissenstest', 1), 'spearman');
  assert.ok(near(rho(applyOp(rows, 'lernzeit', 'double')), 0.477847) && near(rho(applyOp(rows, 'lernzeit', 'shift', 1)), 0.477847) && near(rho(applyOp(rows, 'wissenstest', 'reverse')), -0.477847), 'Vorhersagen wie in R');
  // „In R“: p = 0.066 heißt in etwa 7 von 100.
  assert.match(tabsFor('spearman')!.r!.outputMap[1].explain, /in etwa 7 von 100/);
  assert.ok(close(0.066 * 100, 7, 0.5));
});

/*
 * Konkordante und diskordante Paare, Gamma, Tau-b, Werkstatt (fünf Personen; C, D, Tₓ, Tᵧ von Hand über alle Paare i < j):
 *   cdt <- function(x, y) { n <- length(x); C <- 0; D <- 0; Tx <- 0; Ty <- 0
 *     for (i in 1:(n - 1)) for (j in (i + 1):n) { dx <- sign(x[j] - x[i]); dy <- sign(y[j] - y[i])
 *       if (dx * dy > 0) C <- C + 1 else if (dx * dy < 0) D <- D + 1; if (dx == 0) Tx <- Tx + 1; if (dy == 0) Ty <- Ty + 1 }
 *     N0 <- n * (n - 1) / 2; c(C = C, D = D, Tx = Tx, Ty = Ty, N0 = N0, gamma = (C - D) / (C + D), tau = (C - D) / sqrt((N0 - Tx) * (N0 - Ty))) }
 *   meist:      x <- c(1, 2, 3, 4, 5); y <- c(2, 1, 3, 5, 4)   # C = 8, D = 2, Tx = 0, Ty = 0, gamma 0.6, tau 0.6
 *   bindungen:  x <- c(1, 2, 2, 4, 5); y <- c(1, 3, 2, 3, 5)   # C = 8, D = 0, Tx = 1, Ty = 1, gamma 1, tau 0.888889
 *   gegen:      x <- c(1, 2, 3, 4, 5); y <- c(5, 3, 4, 2, 1)   # C = 1, D = 9, gamma -0.8, tau -0.8
 *   cor(x, y, method = "kendall")                             # 0.6; 0.888889; -0.8 (Tau-b)
 *   data.frame(x, y) %>% goodman_gamma(x, y)                  # 0.6; 1; -0.8
 *   data.frame(x, y) %>% kendall_tau(x, y)                    # tau = 0.600; 0.889; -0.800
 *   cor(c(1, 2, 3, 4, 5), 6 - c(2, 1, 3, 5, 4), method = "kendall")   # -0.6 (Nachrichten umgedreht: C und D tauschen)
 * Brücke, x = finanzlage, y = schulabschluss:
 *   cdt(finanzlage, schulabschluss)                           # C 6954, D 5300, Tx 4679, Ty 3907, N0 19900
 *   atlas %>% goodman_gamma(finanzlage, schulabschluss)       # 0.1349763
 *   atlas %>% kendall_tau(finanzlage, schulabschluss, use = "listwise")   # tau = 0.106, p = 0.065, N = 200
 *   cor(finanzlage, schulabschluss, method = "kendall")       # 0.1060105
 *   cdt(finanzlage, 4 - schulabschluss); cdt(6 - finanzlage, schulabschluss)   # C 5300, D 6954: Vorzeichen gedreht
 *   6954 / (6954 + 5300); 19900 - 6954 - 5300                 # 0.5674882; 7646
 *   P002 mit P003 bis P200: C 88, D 36, Tx 50, Ty 40
 */
test('B5 Paarvergleich: konkordante Paare, Gamma und Tau-b wie in R', () => {
  const [meist, bindungen, gegen] = paarvergleich.presets.map(p => pairCount(p.data));
  const counts = (s: PairCount) => [s.C, s.D, s.Tx, s.Ty, s.n0];
  assert.deepEqual(counts(meist), [8, 2, 0, 0, 10]); assert.deepEqual(counts(bindungen), [8, 0, 1, 1, 10]); assert.deepEqual(counts(gegen), [1, 9, 0, 0, 10]);
  assert.ok(near(meist.gamma, 0.6) && near(meist.tau, 0.6) && near(bindungen.gamma, 1) && near(bindungen.tau, 0.888889) && near(gegen.gamma, -0.8) && near(gegen.tau, -0.8), 'γ und τb');
  const flipped = pairCount(paarvergleich.think[1].tryIt!.apply(paarvergleich.presets[0].data));
  assert.deepEqual([flipped.C, flipped.D], [2, 8], 'umgedreht: C und D tauschen'); assert.ok(near(flipped.tau, -0.6));
  const same = pairCount(paarvergleich.think[0].tryIt!.apply(paarvergleich.presets[0].data));
  assert.equal(same.Txy, 1, 'B antwortet wie A: ein Paar mit Gleichstand bei beiden');
  const flat = pairCount(paarvergleich.think[3].tryIt!.apply(paarvergleich.presets[0].data));
  assert.deepEqual([flat.C, flat.D, flat.gamma, flat.tau], [0, 0, null, null], 'alle beim Interesse auf 3');
  // Texte der Werkstatt.
  const s = paarvergleich.steps, c = at<PairCount>(pairCount, paarvergleich.presets[1].data, 1);
  assert.equal(txt(s[1].rechnung, at(pairCount, paarvergleich.presets[0].data, 0)), 'Person A hat Interesse 1 und Nachrichten 2. Mit B (2, 1): entgegengesetzt. Mit C (3, 3): gleich gerichtet. Mit D (4, 5): gleich gerichtet. Mit E (5, 4): gleich gerichtet. Davon gleich gerichtet: 3. Alle zusammen: C = 8.');
  assert.equal(txt(s[4].rechnung, c), 'Person B: Gleichstand beim Interesse mit C, bei den Nachrichten mit D. Alle zusammen: Tₓ = 1, Tᵧ = 1.');
  assert.equal(txt(s[5].rechnung, c), 'τb = 8 / √((10 − 1) · (10 − 1)) = 8 / √81 ≈ 0,89');
  assert.equal(txt(s[3].rechnung, at(pairCount, paarvergleich.presets[0].data)), 'γ = (8 − 2) / (8 + 2) = 6 / 10 = 0,6');
  assert.match(s[5].check.diagnose(c, 1)!, /^Fast! Das ist Gamma/); assert.match(s[3].check.diagnose(c, 0.8)!, /durch alle Paare geteilt/);
  assert.match(s[0].check.diagnose(c, 20)!, /doppelt/); assert.match(s[0].check.diagnose(c, 25)!, /mit sich selbst/);
  assert.match(paarvergleich.variants.goodman_gamma.interpret(at(pairCount, paarvergleich.presets[0].data)).kurz, /^Von den 10 Paaren mit klarer Richtung sind 80 % gleich gerichtet\./);
  // Brücke mit den 200 Befragten.
  const b = paarvergleich.bridge!, bc = bridgeContext(pairCount, 'pairs', rows, 'finanzlage', 'schulabschluss', 1);
  assert.deepEqual(counts(bc.s), [6954, 5300, 4679, 3907, 19900], 'C, D, Tx, Ty, N0 wie in R');
  assert.ok(near(bc.s.gamma, 0.1349763) && near(bc.s.tau, 0.1060105), 'γ und τb wie in R');
  assert.deepEqual([bc.s.ci[1], bc.s.di[1], bc.s.txi[1], bc.s.tyi[1]], [88, 36, 50, 40], 'P002');
  assert.equal(b.lines[0].all(bc), '200 Befragte ergeben 200 · 199 / 2 = 19.900 Personenpaare.');
  assert.equal(b.lines[2].all(bc), '5.300 Paare sind entgegengesetzt. C − D = 6.954 − 5.300 = 1.654.');
  assert.equal(b.lines[3].all(bc), 'γ = 1.654 / 12.254 ≈ 0,13. Die 7.646 Paare mit Gleichstand zählen nicht mit.');
  assert.equal(b.lines[5].all(bc), 'τb = 1.654 / √(15.221 · 15.993) ≈ 0,11. Gamma ist 0,13: Die Gleichstände machen τb im Betrag kleiner.');
  assert.match(b.interpret(bc, 'goodman_gamma').kurz, /^Von den 12\.254 Paaren mit klarer Richtung sind 57 % gleich gerichtet\./);
  for (const [col, op] of [['schulabschluss', 'reverse'], ['finanzlage', 'reverse']] as const) {
    const flippedRows = applyOp(rows, col, op), f = bridgeContext(pairCount, 'pairs', flippedRows, 'finanzlage', 'schulabschluss', 1);
    assert.deepEqual([f.s.C, f.s.D], [5300, 6954], `${col} umgepolt`);
  }
});

/*
 * Kreuztabelle, Werkzeug (fünf Befragte aus dem Lehrdatensatz):
 *   five <- atlas %>% filter(id %in% c("P001", "P002", "P003", "P008", "P011"))
 *   five %>% crosstab(row = erwerbstaetig, col = weiterbildung, percentages = "row")
 *   #   Nein: 1 | 0 | 1 (100.0% | 0.0%);  Ja: 1 | 3 | 4 (25.0% | 75.0%);  Total: 2 | 3 | 5 (40.0% | 60.0%)
 *   five %>% crosstab(row = erwerbstaetig, col = weiterbildung, percentages = "col")
 *   #   col %: Nein 50.0% | 0.0% | 20.0%;  Ja 50.0% | 100.0% | 80.0%
 *   atlas %>% crosstab(row = erwerbstaetig, col = weiterbildung, percentages = "none")   # 40 23 / 78 59, Total 118 82 200
 * Reiter (Katalog): atlas %>% crosstab(row = schulabschluss, col = weiterbildung, percentages = "row")
 *   prop.table(table(schulabschluss, weiterbildung), 1) * 100
 *   #   Ja: 40.4762 30.0000 45.9459 41.4634 47.5000; table(schulabschluss) 42 40 37 41 40; table(weiterbildung) 118 82
 */
test('B5 Kreuztabelle: fünf Befragte, Prozentbasis und die 200 wie in R', () => {
  const byId = new Map(rows.map(r => [r.id, r.values]));
  for (const p of FUENF) assert.deepEqual([byId.get(p.person)!.erwerbstaetig, byId.get(p.person)!.weiterbildung], [p.erwerbstaetig, p.weiterbildung], p.person);
  const k = crossCounts(kreuztabelle.rows);
  assert.deepEqual([k.cells, k.rowSum, k.colSum, k.n], [[[1, 0], [1, 3]], [1, 4], [2, 3], 5]);
  const row = kreuztabelle.apply(kreuztabelle.rows, 'row'), col = kreuztabelle.apply(kreuztabelle.rows, 'col'), none = kreuztabelle.apply(kreuztabelle.rows, 'none');
  assert.deepEqual(row.rows.map(r => r.prozent), ['75 %', '25 %', '100 %', '75 %', '75 %'], 'Zeilenprozente je Person');
  assert.deepEqual(col.rows.map(r => r.prozent), ['100 %', '50 %', '50 %', '100 %', '100 %'], 'Spaltenprozente je Person');
  assert.deepEqual(none.rows.map(r => r.zelle), [3, 1, 1, 3, 3]); assert.equal(none.columns.length, 3);
  assert.equal(kreuztabelle.check.answer('row'), 75);
  assert.match(kreuztabelle.check.diagnose('row', 60)!, /unter allen fünf/); assert.match(kreuztabelle.check.diagnose('row', 100)!, /Spaltenprozent/);
  for (const o of kreuztabelle.options) assert.match(kreuztabelle.rCode(o.id), new RegExp(`crosstab\\(row = erwerbstaetig, col = weiterbildung, percentages = "${o.id}"\\)`));
  // Reiter: Schulabschluss und Weiterbildung der 200.
  const a = abschlussNachWeiterbildung({ rows, columns: { x: ['schulabschluss'], y: ['weiterbildung'] } });
  assert.deepEqual(a.groups.map(g => [g.n, g.ja]), [[42, 17], [40, 12], [37, 17], [41, 17], [40, 19]]); assert.deepEqual([a.n, a.ja], [200, 82]);
  const s = tabsFor('crosstab')!.sample!;
  if (s.kind === 'analysis') {
    const r = s.result({ rows, columns: { x: ['schulabschluss'], y: ['weiterbildung'] } });
    assert.equal(r.kurz, 'Insgesamt haben 41 % der 200 Befragten in den letzten zwölf Monaten eine Weiterbildung gemacht. Am häufigsten mit „Abitur / fachgebundene Hochschulreife“ (47,5 %), am seltensten mit „Haupt-/Volksschulabschluss“ (30 %).');
    assert.equal(r.fachlich, 'Zeilenprozente für Weiterbildung = Ja: Ohne Schulabschluss 40,5 %, Haupt-/Volksschulabschluss 30 %, Mittlerer Abschluss 45,9 %, Fachhochschulreife 41,5 %, Abitur / fachgebundene Hochschulreife 47,5 %.');
    assert.ok(near(s.value!({ rows, columns: { x: ['schulabschluss'], y: ['weiterbildung'] } }), 47.5), 'Abitur 47,5 %');
  }
});

/*
 * Erwartete Zellhäufigkeit, Formel als Satz und Reiter (x = schulabschluss, y = weiterbildung):
 *   tb <- table(schulabschluss, weiterbildung); E <- outer(rowSums(tb), colSums(tb)) / sum(tb)
 *   E[, 2]                                     # 17.22 16.40 15.17 16.81 16.40 (Ja), beobachtet 17 12 17 17 19
 *   tb[5, 2] - E[5, 2]                         # 2.6 (Abitur und Ja)
 *   y2 <- 1 - weiterbildung: tb2[5, 2] - E2[5, 2]   # -2.6
 *   40 * 82 / 200; 50 * 80 / 200               # 16.4; 20 (Kontrollfrage)
 */
test('B5 erwartete Zellhäufigkeit: Abitur und Weiterbildung wie in R', () => {
  const s = erwartet.compute(erwartet.initial);
  assert.ok(near(s.E, 16.4) && s.prod === 3280 && near(s.colShare, 0.41), 'E = 40 · 82 / 200');
  assert.equal(erwartet.check.answer, 20); assert.match(erwartet.check.diagnose(40), /durch 100 geteilt/); assert.match(erwartet.check.diagnose(4000), /^Fast!/);
  assert.equal(erwartet.interpret(s).kurz, 'Gäbe es keinen Zusammenhang, stünden in dieser Zelle 16,4 Personen. Das sind 41 % der Zeile, so viel wie in der ganzen Spalte.');
  const ctx = { rows, columns: { x: ['schulabschluss'], y: ['weiterbildung'] } }, e = erwartetJa(ctx);
  assert.deepEqual(e.rows.map(g => Math.round(g.E * 100) / 100), [17.22, 16.4, 15.17, 16.81, 16.4]); assert.deepEqual(e.rows.map(g => g.ja), [17, 12, 17, 17, 19]);
  const t = tabsFor('expected')!.sample!;
  if (t.kind === 'analysis') {
    assert.equal(t.result(ctx).kurz, 'Gäbe es keinen Zusammenhang, hätte jede Schulabschluss-Gruppe 41 % mit Weiterbildung. Mit Abitur wären das 16,4 von 40; beobachtet sind 19.');
    assert.equal(t.result(ctx).zusatz, 'Am weitesten liegt „Haupt-/Volksschulabschluss“ von der Erwartung entfernt: 12 beobachtet, 16,4 erwartet.');
    const gap = t.think[0].expect.measure!;
    assert.ok(near(gap(ctx), 2.6) && near(gap({ ...ctx, rows: applyOp(rows, 'weiterbildung', 'reverse') }), -2.6), 'beobachtet minus erwartet');
  }
});

/*
 * Phi (x = weiterbildung, y = erwerbstaetig):
 *   table(weiterbildung, erwerbstaetig)        # 0: 40 78; 1: 23 59 → a = 59, b = 23, c = 78, d = 40
 *   atlas %>% phi(weiterbildung, erwerbstaetig)   # 0.06193526
 *   cor(weiterbildung, erwerbstaetig)          # 0.06193526 (Pearson-r der 0/1-Spalten)
 *   chisq.test(table(weiterbildung, erwerbstaetig), correct = FALSE)$statistic   # 0.7671952
 *   59 / 137; 23 / 63                          # 0.4306569; 0.3650794
 *   (30 * 30 - 10 * 10) / sqrt(40^4)           # 0.5 (Kontrollfrage)
 */
test('B5 Phi: Vierfeldertafel und die 200 wie in R', () => {
  const s = phiSatz.compute(phiSatz.initial);
  assert.deepEqual([s.ad, s.bc, s.diff, s.r1, s.r2, s.k1, s.k2, s.n], [2360, 1794, 566, 82, 118, 137, 63, 200]);
  assert.ok(near(s.phi, 0.06193526) && near(s.chi2, 0.7671952) && near(s.shareA, 0.4306569) && near(s.shareB, 0.3650794), 'φ, χ², Anteile');
  assert.equal(phiSatz.interpret(s).kurz, 'Unter den Erwerbstätigen haben 43,1 % eine Weiterbildung gemacht, unter den anderen 36,5 %. φ ≈ 0,06: Die beiden Merkmale hängen kaum zusammen.');
  assert.match(phiSatz.check.diagnose(0.25), /zum Quadrat/); assert.match(phiSatz.check.diagnose(-0.5), /Vorzeichen/);
  const ctx = { rows, columns: { x: ['weiterbildung'], y: ['erwerbstaetig'] } }, p = phiData(ctx);
  assert.ok(near(p.phi, 0.06193526) && near(p.r, 0.06193526) && near(p.chi2, 0.7671952), 'φ und r aus den Daten');
  assert.ok(near(phiData({ ...ctx, rows: applyOp(rows, 'weiterbildung', 'reverse') }).r, -0.06193526), 'umgepolt: r dreht sich');
  assert.equal(locate(CATALOG_OUTPUT['phi:0'].output, '0.06193526')?.text, '0.06193526');
});

/*
 * Cramér-V (x = schulabschluss, y = geschlecht):
 *   tb <- table(schulabschluss, geschlecht); chisq.test(tb, correct = FALSE)$statistic   # 10.01834 (Warnung: kleine erwartete Zahlen)
 *   atlas %>% cramers_v(schulabschluss, geschlecht)   # 0.1292178 = sqrt(10.01834 / (200 * 3))
 *   sqrt(10.02 / 600); sqrt(40.08 / 2400)      # 0.1292285 (gerundetes χ²), bei n und χ² mal 4 gleich
 *   sqrt(18 / 200); sqrt(18 / 100); sqrt(18 / 300)   # 0.3 (Kontrollfrage); 0.424 ohne k; 0.245 mit k = 3
 */
test('B5 Cramér-V: Formel als Satz und die 200 wie in R', () => {
  const s = cramerSatz.compute(cramerSatz.initial);
  assert.ok(close(s.V, 0.1292285, 1e-6) && s.denom === 600, 'V aus χ² = 10,02');
  const four = cramerSatz.compute(cramerSatz.quick[0].apply(cramerSatz.initial));
  assert.ok(close(four.V, s.V, 1e-9), 'n und χ² mal 4: V bleibt');
  assert.match(cramerSatz.check.diagnose(0.09), /Wurzel/); assert.match(cramerSatz.check.diagnose(0.4243), /k vergessen/); assert.match(cramerSatz.check.diagnose(0.245), /nicht 3/);
  const v = vData({ rows, columns: { x: ['schulabschluss'], y: ['geschlecht'] } });
  assert.ok(near(v.V, 0.1292178) && near(v.chi2, 10.01834, 1e-5) && v.r === 5 && v.k === 4, 'V, χ², 5 × 4 wie in R');
  assert.equal(locate(CATALOG_OUTPUT['cramers_v:0'].output, '0.1292178')?.text, '0.1292178');
});

/*
 * Partielle Korrelation (x = lernplanung5, y = wissenstest, z = lernzeit):
 *   cor(lernplanung5, wissenstest); cor(lernplanung5, lernzeit); cor(wissenstest, lernzeit)   # 0.1625443 0.3408015 0.5391689
 *   atlas %>% partial_cor(lernplanung5, wissenstest, controls = c(lernzeit))   # partial r = -0.027, p = 0.707 (zero-order r = 0.163)
 *   cor(resid(lm(lernplanung5 ~ lernzeit)), resid(lm(wissenstest ~ lernzeit)))   # -0.02678178
 *   pc <- function(a, b, c) (a - b * c) / sqrt((1 - b^2) * (1 - c^2)); pc(0.16, 0.34, 0.54)   # -0.02981593 (gerundete r)
 *   0.16 - 0.34 * 0.54; sqrt((1 - 0.34^2) * (1 - 0.54^2))      # -0.0236; 0.7915232
 *   pc(0.5, 0.5, 0.5); 0.25 / 0.5625                           # 0.3333333; 0.4444444 (ohne Wurzel)
 *   umgepolt (6 - lernplanung5 oder 20 - wissenstest)          # +0.02678178
 * R-Ausgabe (Katalog): atlas %>% partial_cor(lernzeit, wissenstest, controls = c(alter, schlafdauer))   # partial r = 0.528, zero-order r = 0.539
 */
test('B5 partielle Korrelation: Lernplanung, Wissenstest und Lernzeit wie in R', () => {
  const s = partielleKorrelation.compute(partielleKorrelation.initial);
  assert.ok(near(s.partial, -0.02981593) && near(s.numer, -0.0236) && near(s.den, 0.7915232), 'gerundete r');
  assert.equal(partielleKorrelation.interpret(s).kurz, 'Ohne Kontrolle hängen Lernplanung und Wissenstest mit r = 0,16 zusammen. Rechnet man die Lernzeit heraus, wird der Zusammenhang schwächer: r = −0,03.');
  assert.equal(partielleKorrelation.worked(s)[0].text, '0,16 − 0,34 · 0,54 ≈ −0,024.');
  assert.match(partielleKorrelation.check.diagnose(-1 / 3), /Andersherum/); assert.match(partielleKorrelation.check.diagnose(0.4444), /Wurzel vergessen/);
  const ctx = { rows, columns: { x: ['lernplanung5'], y: ['wissenstest'], z: ['lernzeit'] } }, p = partialData(ctx);
  assert.ok(near(p.rxy, 0.1625443) && near(p.rxz, 0.3408015) && near(p.ryz, 0.5391689) && near(p.partial, -0.02678178), 'r und partielles r aus den Daten');
  assert.ok(near(partialData({ ...ctx, rows: applyOp(rows, 'lernplanung5', 'reverse') }).partial, 0.02678178) && near(partialData({ ...ctx, rows: applyOp(rows, 'wissenstest', 'reverse') }).partial, 0.02678178), 'umgepolt');
  const out = CATALOG_OUTPUT['partial_cor:0'].output;
  assert.deepEqual(['partial r', 'zero-order r', 'p', 'N'].map(m => locate(out, m)?.text), ['0.528', '0.539', '0.001', '200']);
});
