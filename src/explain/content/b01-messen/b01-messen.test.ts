import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { liveOutput } from '../../rRead';
import { applyOp } from '../../sample';
import type { SampleCtx, SampleTab } from '../../types';
import { FUENF } from './shared';
import { series, seriesTabs } from './series';
import { pairs, pairsTabs, R_FUENF } from './pairs';
import { metric, metricTabs } from './metric';
import { BERUF, nominal, nominalTabs } from './nominal';
import { FINANZ, ordinal, ordinalTabs } from './ordinal';
import { OP, operationalization, operationalizationTabs } from './operationalization';
import { pearson } from './shared';
import { attenuation, measurementError, measurementErrorTabs, MF } from './measurement-error';
import { VAL, validity, validityTabs } from './validity';
import { CATALOG_OUTPUT } from '../../catalogOutput';
import { ALLBUS_HHINC, ALLBUS_INC, MITTEL, missing, missingTabs } from './missing';
import { readFileSync } from 'node:fs';
import { readSav, type SavFile } from '../../../sandbox/readSav';
import { ALLBUS_SPLIT, missingMechanisms, missingMechanismsTabs, ohneJedeZehnte, ohneSpitze } from './missing-mechanisms';
import { surveyColumns } from '../../../domain/survey';
import { styleProblems } from '../../style';

/*
 * Referenzwerte des Bereichs B1 „Messen und Skalen“, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand)
 * auf dem Lehrdatensatz, gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) bzw. Knopf „SPSS-Datei (.sav)“):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   x <- as.numeric(atlas$lernzeit); y <- as.numeric(atlas$wissenstest); ein <- as.numeric(atlas$einkommen)
 *
 * Datenreihe (series):
 *   x[1:5]                                  # 6.0 8.3 6.3 10.5 6.8 (P001 bis P005)
 *   sort(x[1:5])                            # 6.0 6.3 6.8 8.3 10.5
 *   min(x); atlas$id[x == min(x)]           # 0, P100
 *   max(x); atlas$id[x == max(x)]           # 18.4, P175
 *   atlas %>% describe(lernzeit, show = c("min", "max"))   # Ausgabe siehe MINMAX unten (Min 0.000, Max 18.400, N 200)
 *
 * Wertepaare (pairs):
 *   cbind(x[1:5], y[1:5])                   # (6, 12) (8.3, 9) (6.3, 14) (10.5, 13) (6.8, 11)
 *   cor(x[1:5], y[1:5])                     # -0.07140336
 *   cor(sort(x[1:5]), sort(y[1:5]))         # 0.8806415
 *   cor(x, y); cor(sort(x), sort(y))        # 0.5391689; 0.9878151
 *   cor(x + 1, y)                           # 0.5391689 (Verschieben ändert r nicht)
 *   atlas %>% pearson_cor(lernzeit, wissenstest, use = "listwise", conf.level = .95)   # r = 0.539, p < 0.001 ***, N = 200
 *
 * Metrisches Skalenniveau (metric):
 *   mean(x); sd(x); x[2] - x[1]; x[4] / x[1]          # 7.7515; 3.237515; 2.3; 1.75
 *   atlas %>% filter(id == "P002") %>% select(lernzeit, schulabschluss, berufsabschluss)   # 8.3, 3, 1
 *   sapply(c("lernplanung5", "schulabschluss", "erwerbstaetig", "berufsabschluss"), function(v) mean(as.numeric(atlas[[v]])))
 *   #   3.26 1.985 0.685 3.81   (frequency(schulabschluss) druckt mean=1.99)
 *   atlas %>% describe(lernzeit, einkommen, show = "all")      # Mean 7.752, Median 7.600, SD 3.238, N 200
 *
 * Nominale Kategorien (nominal):
 *   table(as.numeric(atlas$berufsabschluss))   # Codes 0 bis 8: 16 29 29 22 27 17 21 22 17
 *   mean(as.numeric(atlas$berufsabschluss)); mean(8 - as.numeric(atlas$berufsabschluss))   # 3.81; 4.19
 *   29 / 200                                    # 0.145 (je 14,5 % duale und schulische Berufsausbildung)
 *   atlas %>% to_label(erwerbstaetig) %>% frequency(erwerbstaetig)   # Nein 63 (31.50 %), Ja 137, total N=200
 *
 * Geordnete Kategorien (ordinal):
 *   f <- as.numeric(atlas$finanzlage); table(f)   # Codes 1 bis 5: 17 54 57 52 20; cumsum 17 71 128 180 200
 *   median(f); sort(f)[c(100, 101)]; mean(f)       # 3; 3 3; 3.02
 *   mean(c(1, 2, 3, 10, 20)[f]); median(c(1, 2, 3, 10, 20)[f])   # 6.08; 3 (Median bleibt „Teils / teils“)
 *   table(6 - f)[5]                                # 17 (umgepolt: wer „Sehr schwer“ sagte, steht oben)
 *   atlas %>% frequency(schulabschluss, show_unused = TRUE)   # mean=1.99 sd=1.43, Cum. % 21.00 41.00 59.50 80.00 100.00
 *
 * Operationalisierung (operationalization):
 *   mean(x); 2 * mean(x); mean(x + 1); range(x)   # 7.7515; 15.503; 8.7515; 0 18.4
 *   m <- rowMeans(sapply(paste0("methoden", 1:5), function(v) as.numeric(atlas[[v]])))
 *   cor(m, y)                                       # 0.0211 (Methoden-Zuversicht und Wissenstest)
 *   atlas %>% find_var("lern", search = "name_label")   # lernzeit in Spalte 10, Label = Fragetext
 *
 * Messfehler (measurement_error), klassisches Messmodell mit fehlerfreiem Wissenstest:
 *   cor(y, as.numeric(atlas$wissenstest_t2))       # 0.8413497 (zwei Zeitpunkte)
 *   v <- var(x); r <- cor(x, y)                     # 10.4815; 0.5391689
 *   for (s in c(1, 2, 3, 6)) { rel <- v / (v + s^2); print(c(v + s^2, rel, r * sqrt(rel))) }
 *   #   s = 1: 11.4815 0.9129 0.5152;  s = 2: 14.4815 0.7238 0.4587;  s = 3: 19.4815 0.5380 0.3955;  s = 6: 46.4815 0.2255 0.2560
 *   cor(x + 1, y); mean(x + 1)                      # 0.5391689; 8.7515 (systematischer Fehler +1 h)
 *   rel <- atlas %>% reliability(methoden1, methoden2, methoden3, methoden4, methoden5, na.rm = TRUE); summary(rel)
 *   #   Cronbach's Alpha 0.898, N (listwise) 200, Corrected Item-Total (methoden1) 0.761
 *
 * Validität (validity):
 *   cor(m, y); cor(x, y); cor(x, 20 - y); cor(x, y + 1)   # 0.0211; 0.5391689; -0.5391689; 0.5391689
 *   (Cronbach's Alpha der fünf Methodenfragen: 0.898, siehe oben)
 *
 * Fehlende Angaben (missing), Übungskopie wie im R-Code des Werkzeugs:
 *   fuenf <- atlas %>% filter(id %in% c("P001", "P002", "P003", "P004", "P005")) %>%
 *     mutate(einkommen = replace(einkommen, id == "P003", -9), lernzeit = replace(lernzeit, id == "P005", NA))
 *   fuenf %>% describe(einkommen, show = "mean")                                   # Mean 2972.400, N 5
 *   fuenf %>% set_na(einkommen = -9) %>% describe(einkommen, show = "mean")        # Mean 3717.750, N 4, Missing 1
 *   fuenf %>% mutate(einkommen = replace(einkommen, id == "P003", 0)) %>% describe(einkommen, show = "mean")   # 2974.200
 *   fuenf %>% set_na(einkommen = -9) %>% pearson_cor(einkommen, lernzeit)          # N = 3 (listenweise)
 *   atlas %>% mutate(einkommen = replace(einkommen, id == "P001", -9)) %>% set_na(einkommen = -9) %>%
 *     describe(einkommen, show = c("mean", "sd"))                                   # Mean 3147.613, SD 1426.790, N 199, Missing 1
 *
 * ALLBUS 2023 (ZA8831 v1-3-0, ungewichtet, nur Aggregate; haven::read_sav(user_na = TRUE)):
 *   table(a$hhincc)[c("-9", "-7")]                  # 696 keine Angabe, 28 verweigert: 724 / 5246 = 13.8 %
 *   table(a$incc)[c("-9", "-7", "-50")]             # 362 + 84 = 446 keine Angabe oder verweigert; 251 kein Einkommen
 *   sum(a$pt03 == -11)                              # 1596 nicht gefragt (TNZ: Split; genau die Splitgruppe 2 von splt23_1)
 *
 * Warum fehlen Angaben? (missing_mechanisms), Gedankenexperiment auf dem Lehrdatensatz:
 *   ein <- as.numeric(atlas$einkommen); mean(ein)   # 3154.62
 *   for (k in c(1, 5, 10, 20, 30, 40)) print(mean(ein[-order(ein, decreasing = TRUE)[1:k]]))
 *   #   3127.0754 3052.0000 2976.6316 2836.9167 2718.4118 2605.7125   (k = 20: Verzerrung -317.7033)
 *   mean(ein[-seq(10, 200, by = 10)])               # 3138.45 (jede zehnte Person fehlt)
 *   o <- order(ein, decreasing = TRUE)[1:20]
 *   mean((ein + 100)[-o]) - mean(ein + 100); mean((2 * ein)[-o]) - mean(2 * ein)   # -317.7033; -635.4067
 */

const rows = createSurvey();
const ctx = (data = rows, columns: Record<string, string[]> = { x: ['lernzeit'], y: ['wissenstest'] }): SampleCtx => ({ rows: data, columns });
const analysis = (tab: SampleTab | undefined) => { assert.ok(tab && tab.kind === 'analysis', 'Auswertung fehlt'); return tab as Extract<SampleTab, { kind: 'analysis' }>; };
const col = (id: string) => rows.map(r => r.values[id]);

const MINMAX = `
Descriptive Statistics
----------------------

  -------------------------------------
  Variable    Min     Max    N  Missing
  -------------------------------------
  lernzeit  0.000  18.400  200        0
  -------------------------------------`;

test('B1: die fünf Beispielpersonen sind P001 bis P005 des Lehrdatensatzes', () => {
  FUENF.forEach((p, i) => {
    assert.equal(rows[i].id, p.id, 'Kennung');
    for (const k of ['lernzeit', 'wissenstest', 'einkommen'] as const) assert.equal(rows[i].values[k], p[k], `${p.id} ${k}`);
  });
});

test('B1 Datenreihe: Beispielwerte, Sortierung und Reiter wie in R', () => {
  assert.deepEqual(col('lernzeit').slice(0, 5), [6, 8.3, 6.3, 10.5, 6.8]);
  assert.match(series.stellDirVor.text, /P001 6 h, P002 8,3 h, P003 6,3 h, P004 10,5 h und P005 6,8 h/);
  assert.match(series.bausteine[2].was, /6; 6,3; 6,8; 8,3; 10,5\./, 'sortierte Reihe wie sort(x[1:5])');
  const tab = analysis(seriesTabs.sample);
  const r = tab.result(ctx());
  assert.match(r.kurz, /„Lernzeit“ ist eine Datenreihe mit 200 Werten.*P001 \(6 h\), P002 \(8,3 h\) und P003 \(6,3 h\)/);
  assert.match(r.fachlich, /x₁ bis x₂₀₀ .* von P001 bis P200\. Der kleinste Wert ist 0 h, der größte 18,4 h\./);
  assert.equal(r.zusatz, 'P175 hat mit 18,4 h den größten Wert. In der Datenreihe steht er an Stelle 175, sortiert stünde er ganz am Ende.');
  assert.match(tab.result(ctx(rows, { x: ['geschlecht'] })).fachlich, /Codes reichen von „Männlich“ \(Code 0\) bis „Kein Eintrag“ \(Code 3\)/);
  assert.equal(tab.value!(ctx(applyOp(rows, 'lernzeit', 'double'))), 200);
  // Leitaufruf „In R“: der Atlas druckt describe(lernzeit, show = c("min", "max")) Zeichen für Zeichen wie R.
  assert.equal(liveOutput({ fn: 'describe', show: ['min', 'max'] }, rows, 'lernzeit').trim(), MINMAX.trim());
  assert.ok(close(Math.min(...col('lernzeit')), 0) && rows[99].id === 'P100' && rows[99].values.lernzeit === 0, 'Minimum bei P100');
});

test('B1 Wertepaare: r der fünf wie erhoben und getrennt sortiert, die 200 wie in R', () => {
  assert.ok(close(R_FUENF.erhoben, -0.07140336, 1e-6) && close(R_FUENF.sortiert, 0.8806415, 1e-6), `${R_FUENF.erhoben} ${R_FUENF.sortiert}`);
  assert.match(pairs.stellDirVor.text, /r ≈ −0,07\. Sortierst du beide Spalten getrennt, kommt r ≈ 0,88 heraus/);
  assert.match(pairs.regler!.describe(1), /r steigt auf 0,88/);
  const tab = analysis(pairsTabs.sample), r = tab.result(ctx());
  assert.match(r.kurz, /200 Wertepaare .* Wer mehr lernt, löst eher mehr Aufgaben: r ≈ 0,54\. Getrennt sortiert käme r ≈ 0,99 heraus/);
  assert.equal(r.zusatz, 'P002 bildet das Paar (8,3 h; 9 Aufgaben).');
  assert.ok(close(tab.value!(ctx()) as number, 0.5391689, 1e-6), 'r wie in R');
  assert.ok(close(tab.value!(ctx(applyOp(rows, 'lernzeit', 'shift', 1))) as number, 0.5391689, 1e-6), 'r nach dem Verschieben wie in R');
  // Umgepolt (20 − Aufgaben) liest die Deutung die Richtung aus dem Vorzeichen.
  assert.match(tab.result(ctx(applyOp(rows, 'wissenstest', 'reverse'))).kurz, /löst eher weniger Aufgaben: r ≈ −0,54/);
});

test('B1 metrisch: Deutung je Skalenniveau mit den Mittelwerten aus R, für jede Spalte im Ton des Leitfadens', () => {
  assert.deepEqual([rows[1].values.lernzeit, rows[1].values.schulabschluss, rows[1].values.berufsabschluss], [8.3, 3, 1]);
  assert.match(metric.stellDirVor.text, /Code 3 \(Fachhochschulreife\), ihr Berufsabschluss den Code 1 \(Duale Berufsausbildung\)/);
  assert.match(metric.bausteine[2].rechnung!, /^10,5 \/ 6 = 1,75$/);
  const tab = analysis(metricTabs.sample);
  const at = (x: string) => tab.result(ctx(rows, { x: [x] }));
  assert.match(at('lernzeit').kurz, /„Lernzeit“ ist metrisch.*Mittelwert 7,75 h/);
  assert.match(at('lernzeit').fachlich, /s ≈ 3,24 h/);
  assert.match(at('lernzeit').zusatz!, /P001 und P002 liegen 2,3 h auseinander/);
  assert.match(at('lernplanung5').kurz, /Zustimmungsstufen\. Den Mittelwert 3,26 darfst du nur deuten/);
  assert.match(at('schulabschluss').kurz, /ordinal.*Mittelwert der Codes, 1,99, ist deshalb/, 'gerundet wie R (mean=1.99)');
  assert.match(at('erwerbstaetig').kurz, /Anteil der Antworten „Ja“: 68,5 %/);
  assert.match(at('berufsabschluss').kurz, /nominal.*Mittelwert der Codes, 3,81, bedeutet nichts/);
  for (const c of surveyColumns) for (const [k, t] of Object.entries(at(c.id))) {
    assert.deepEqual(styleProblems(t!, { maxWords: 25, maxSentences: k === 'kurz' ? 3 : undefined }), [], `${c.id} ${k}: ${t}`);
    assert.ok(!/NaN|undefined/.test(t!), `${c.id} ${k}`);
  }
});

test('B1 nominal: Berufsabschlüsse wie in R, Umdrehen der Codes ändert keine Gruppe', () => {
  const codes = col('berufsabschluss');
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => codes.filter(v => v === k).length), [...BERUF]);
  assert.ok(close(codes.reduce((a, b) => a + b, 0) / 200, 3.81, 1e-9), 'Mittelwert der Codes wie in R');
  assert.match(nominal.stellDirVor.text, /29 Befragte nennen eine duale Berufsausbildung \(Code 1\), 22 .* 27 einen Bachelor \(Code 4\)\. .* Mittelwert der Codes ist 3,81/);
  assert.match(nominal.bausteine[2].rechnung!, /je 29 von 200, das sind je 14,5 %/);
  const tab = analysis(nominalTabs.sample), at = (data = rows) => tab.result(ctx(data, { x: ['berufsabschluss'] }));
  assert.match(at().kurz, /„Duale Berufsausbildung“ und „Schulische Berufsausbildung“ \(je 29 von 200\)/);
  assert.match(at().fachlich, /9 besetzten Kategorien.*Mittelwert der Codes \(3,81\)/);
  assert.match(nominalTabs.sample!.think[0].explain, /von 3,81 auf 4,19/);
  assert.match(at(applyOp(rows, 'berufsabschluss', 'reverse')).fachlich, /Mittelwert der Codes \(4,19\)/);
  assert.match(at(applyOp(rows, 'berufsabschluss', 'constant', 1)).kurz, /„Duale Berufsausbildung“ \(200 von 200\)/);
});

test('B1 ordinal: finanzielle Lage wie in R, Median und Umpolen', () => {
  const f = col('finanzlage');
  assert.deepEqual([1, 2, 3, 4, 5].map(k => f.filter(v => v === k).length), [...FINANZ]);
  assert.match(ordinal.stellDirVor.text, /17 Befragte sagen „Sehr schwer“, 54 „Eher schwer“, 57 „Teils \/ teils“, 52 „Eher leicht“ und 20 „Sehr leicht“/);
  assert.match(ordinal.bausteine[2].rechnung!, /sind es 71 Befragte, bis „Teils \/ teils“ 128\./);
  assert.match(ordinal.bausteine[1].acht, /hier 3,02,/);
  assert.match(ordinal.ausprobieren[0].explain, /von 3,02 auf 6,08\./);
  const tab = analysis(ordinalTabs.sample), at = (data = rows) => tab.result(ctx(data, { x: ['finanzlage'] }));
  assert.equal(at().kurz, 'Die mittlere Person der Reihe nach sagt „Teils / teils“ (Code 3). 71 von 200 kommen eher schwer oder sehr schwer aus, 72 eher leicht oder sehr leicht.');
  assert.equal(at().zusatz, 'Häufigkeiten von „Sehr schwer“ bis „Sehr leicht“: 17, 54, 57, 52, 20.');
  assert.equal(at(applyOp(rows, 'finanzlage', 'reverse')).zusatz, 'Häufigkeiten von „Sehr schwer“ bis „Sehr leicht“: 20, 52, 57, 54, 17.');
  assert.equal(tab.value!(ctx(rows, { x: ['finanzlage'] })), 3);
});

test('B1 Operationalisierung: Messregel, Mittelwerte und Methoden-Zuversicht wie in R', () => {
  const lz = col('lernzeit'), m = lz.reduce((a, b) => a + b, 0) / 200;
  assert.ok(close(m, OP.mittel, 1e-9), 'Mittelwert der Lernzeit wie in R');
  const methoden = rows.map(r => [1, 2, 3, 4, 5].reduce((a, k) => a + r.values[`methoden${k}`], 0) / 5);
  assert.ok(close(pearson(methoden, col('wissenstest'))!, OP.rMethodenWissen, 5e-5), 'r Methoden-Zuversicht und Wissenstest wie in R');
  assert.match(operationalization.stellDirVor.text, /die Frage: „Wie viele Stunden haben Sie in den letzten sieben Tagen selbstständig gelernt\?“ Die Antwortregel: Stunden mit einer Nachkommastelle, von 0 bis 60\. .* die Zahl 8,3\./);
  assert.match(operationalization.ausprobieren[0].explain, /Aus 7,75 würden etwa 15,5 Stunden/);
  assert.match(operationalization.ausprobieren[1].explain, /r ≈ 0,02\./);
  const tab = analysis(operationalizationTabs.sample), at = (data = rows) => tab.result(ctx(data, { x: ['lernzeit'] }));
  assert.match(at().kurz, /Im Schnitt antworten die 200 Befragten mit 7,75 h\./);
  assert.match(at().fachlich, /beobachtet 0 h bis 18,4 h, Mittelwert x̄ ≈ 7,75 h/);
  assert.match(at(applyOp(rows, 'lernzeit', 'double')).kurz, /mit 15,5 h\./);
  assert.match(at(applyOp(rows, 'lernzeit', 'shift', 1)).kurz, /mit 8,75 h\./);
});

test('B1 Messfehler: Messmodell, Regler und Reiter wie in R', () => {
  const lz = col('lernzeit'), m = lz.reduce((a, b) => a + b, 0) / 200, v = lz.reduce((a, b) => a + (b - m) ** 2, 0) / 199;
  assert.ok(close(v, MF.varT, 1e-4) && close(pearson(lz, col('wissenstest'))!, MF.r, 1e-6), 'Varianz und r wie in R');
  assert.ok(close(pearson(col('wissenstest'), col('wissenstest_t2'))!, MF.rRetest, 1e-6), 'Wissenstest zu zwei Zeitpunkten wie in R');
  for (const [s, varX, rel, r] of [[1, 11.4815, 0.9129, 0.5152], [2, 14.4815, 0.7238, 0.4587], [3, 19.4815, 0.5380, 0.3955], [6, 46.4815, 0.2255, 0.2560]]) {
    const a = attenuation(s);
    assert.ok(close(a.varX, varX, 1e-4) && close(a.rel, rel, 1e-4) && close(a.r, r, 1e-4), `Messmodell bei s = ${s}: ${JSON.stringify(a)}`);
  }
  assert.match(measurementError.stellDirVor.text, /r ≈ 0,84\./);
  assert.match(measurementError.bausteine[2].rechnung!, /Var\(X\) = 10,48 h² \+ 4 h² = 14,48 h²\. Echt sind 10,48 \/ 14,48 ≈ 0,72 davon\./);
  assert.match(measurementError.regler!.describe(2), /wächst die Streuung auf 14,48 h²\. Nur 72 % davon sind echt, .* von 0,54 auf etwa 0,46\./);
  assert.match(measurementError.ausprobieren[1].explain, /auf etwa 0,4\./);
  const tab = analysis(measurementErrorTabs.sample), r = tab.result(ctx());
  assert.match(r.kurz, /Wer mehr lernt, löst im Wissenstest eher mehr Aufgaben: r ≈ 0,54\. .* nur bei etwa 0,46\./);
  assert.match(r.zusatz!, /von 7,75 h auf 8,75 h\./);
  assert.ok(close(tab.value!(ctx(applyOp(rows, 'lernzeit', 'shift', 1))) as number, MF.r, 1e-6), 'r nach +1 h wie in R');
});

test('B1 Validität: Alpha, Zuversicht und Lernzeit gegen den Wissenstest wie in R', () => {
  assert.match(CATALOG_OUTPUT['reliability:0'].output, /Cronbach's Alpha:\s+0\.898/, 'Alpha wie in R');
  assert.ok(close(VAL.rLernzeit, MF.r, 1e-12) && close(VAL.rMethoden, OP.rMethodenWissen, 1e-12), 'dieselben Referenzwerte wie oben');
  assert.match(validity.stellDirVor.text, /Cronbach-Alpha 0,9\. .* r ≈ 0,02\. Die Lernzeit dagegen schon: r ≈ 0,54\./);
  const tab = analysis(validityTabs.sample);
  assert.equal(tab.result(ctx()).kurz, 'Wer mehr lernt, löst im Wissenstest eher mehr Aufgaben: r ≈ 0,54. Das passt zur Deutung „Der Test misst Wissen“. Mit der Methoden-Zuversicht hängt der Wissenstest kaum zusammen (r ≈ 0,02).');
  const reversed = tab.result(ctx(applyOp(rows, 'wissenstest', 'reverse')));
  assert.match(reversed.kurz, /eher niedrigere Werte: r ≈ −0,54\. Das passt nicht/);
  assert.match(reversed.kurz, /kaum zusammen \(r ≈ −0,02\)/);
  assert.ok(close(tab.value!(ctx(applyOp(rows, 'wissenstest', 'shift', 1))) as number, VAL.rLernzeit, 1e-6), 'r nach +1 Aufgabe wie in R');
});

test('B1 fehlende Angaben: die Übungskopie und ihre Mittelwerte wie in R', () => {
  assert.ok(close(MITTEL.zahl, 2972.4, 1e-9) && close(MITTEL.na, 3717.75, 1e-9) && close(MITTEL.null, 2974.2, 1e-9), JSON.stringify(MITTEL));
  for (const o of ['zahl', 'na', 'null']) assert.equal(missing.check.answer(o), MITTEL[o as keyof typeof MITTEL]);
  assert.match(missing.check.diagnose('na', 2974.2)!, /^Fast! Du hast durch 5 geteilt/);
  assert.deepEqual(missing.apply(missing.rows, 'na').rows.map(r => r.einkommen), [4549, 3850, null, 4604, 1868]);
  assert.deepEqual(missing.apply(missing.rows, 'null').rows.map(r => r.zaehlt), ['ja', 'ja', 'ja, als 0', 'ja', 'ja']);
  assert.match(missing.rCode('na'), /set_na\(einkommen = -9\) %>%\n  describe\(einkommen, show = "mean"\)$/);
  assert.match(missing.wofuer, /ALLBUS 2023 \(ungewichtet\) machten 13,8 %/);
  assert.match(missing.genau.paragraphs[1], /446 von 5\.246 .* Weitere 251/);
  const tab = analysis(missingTabs.sample), r = tab.result(ctx(rows, { x: ['einkommen'] }));
  assert.equal(r.kurz, 'Alle 200 von 200 Befragten haben eine gültige Angabe zum Haushaltsnettoeinkommen. Der Mittelwert 3.154,62 €/Monat beruht deshalb auf allen 200.');
  assert.match(CATALOG_OUTPUT['missing_tools:0'].output, /einkommen\s+3147\.613\s+1426\.790\s+199\s+1/);
  assert.ok(ALLBUS_HHINC.fehlend === 696 + 28 && ALLBUS_INC.fehlend === 362 + 84, 'Summen der ALLBUS-Codes');
});

const allbusFile = process.env.ALLBUS_SAV;
let allbus: SavFile | null = null;
const loadAllbus = () => { if (!allbus) { const b = readFileSync(allbusFile!); allbus = readSav(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); } return allbus; };
const codeCount = (name: string, code: number) => loadAllbus().byName.get(name)!.values.filter(v => v === code).length;

test('B1 ALLBUS 2023: Aggregate wie in R (nur mit der eigenen GESIS-Datei)', { skip: !allbusFile && 'ALLBUS_SAV nicht gesetzt' }, () => {
  assert.equal(loadAllbus().nCases, 5246);
  assert.deepEqual([codeCount('hhincc', -9), codeCount('hhincc', -7)], [696, 28]);
  assert.deepEqual([codeCount('incc', -9), codeCount('incc', -7), codeCount('incc', -50)], [362, 84, 251]);
  assert.equal(codeCount('pt03', -11), 1596, 'Vertrauen in den Bundestag: durch den Split nicht gefragt');
});

test('B1 warum fehlen Angaben: Spitzenverdiener verschweigen ihr Einkommen, Werte wie in R', () => {
  const ein = col('einkommen');
  assert.ok(close(ein.reduce((a, b) => a + b, 0) / 200, 3154.62, 1e-9), 'Mittelwert aller 200');
  for (const [k, m] of [[1, 3127.0754], [5, 3052], [10, 2976.6316], [20, 2836.9167], [30, 2718.4118], [40, 2605.7125]])
    assert.ok(close(ohneSpitze(ein, k).m, m, 1e-4), `ohne die ${k} höchsten: ${ohneSpitze(ein, k).m}`);
  assert.ok(close(ohneSpitze(ein, 20).bias, -317.7033, 1e-4) && close(ohneJedeZehnte(ein), 3138.45, 1e-9), 'Verzerrung und jede zehnte');
  assert.match(missingMechanisms.bausteine[0].rechnung!, /bei 3\.138,45 € statt 3\.154,62 €\./);
  assert.match(missingMechanisms.bausteine[2].rechnung!, /von 3\.154,62 € auf 2\.836,92 €\./);
  assert.equal(missingMechanisms.regler!.describe(20), 'Fehlen die 20 Befragten mit dem höchsten Einkommen, liegt der Mittelwert der übrigen 180 bei 2.836,92 € statt 3.154,62 €: 317,7 € zu niedrig.');
  assert.match(missingMechanisms.regler!.describe(1), /^Fehlt die Person mit dem höchsten Einkommen, .* 3\.127,08 €/);
  assert.match(missingMechanisms.stellDirVor.text, /1\.596 von 5\.246 Befragten .* 446 Befragte/);
  assert.equal(ALLBUS_SPLIT.nichtGefragt, 1596);
  const tab = analysis(missingMechanismsTabs.sample), at = (data = rows) => tab.result(ctx(data, { x: ['einkommen'] }));
  assert.match(at().fachlich, /n = 180; Verzerrung des Mittelwerts −317,7 €\./);
  assert.match(at(applyOp(rows, 'einkommen', 'double')).fachlich, /−635,41 €\./);
  assert.match(at().zusatz!, /bei 3\.138,45 €\./);
});
