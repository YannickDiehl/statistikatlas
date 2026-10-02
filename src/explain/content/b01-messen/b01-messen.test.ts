import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { liveOutput } from '../../rRead';
import { applyOp } from '../../sample';
import type { SampleCtx, SampleTab } from '../../types';
import { FUENF } from './shared';
import { series, seriesTabs } from './series';

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
