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
