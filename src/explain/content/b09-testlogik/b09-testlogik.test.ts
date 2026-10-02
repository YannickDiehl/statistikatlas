import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { applyOp } from '../../sample';
import type { ConceptTabs, SampleCtx } from '../../types';
import { b09Testlogik } from './index';
import { SCHLAF, schlafP, schlafTest } from './rechnen';
import { hypothese } from './hypothese';
import { pruefgroesse, T_START } from './pruefgroesse';

/*
 * Referenzwerte des Bereichs B9, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) als Statistikatlas-200-Befragte.sav):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *
 * A. Schlafdauer gegen sieben Stunden
 *   x <- as.numeric(atlas$schlafdauer); t.test(x, mu = 7)
 *   # n = 200, mean = 7.0825, sd = 0.81975836, se = 0.05796567, t = 1.4232562, df = 199, p = 0.15622776,
 *   # conf.int = [6.9681942, 7.1968058]; sum(x > 7) = 101, sum(x < 7) = 88, min 5.1, max 9.5
 *   atlas %>% t_test(schlafdauer, mu = 7, alternative = "two.sided")      # t(199) = 1.423, p = 0.156, N = 200
 *   2 * pt(-abs((mean(x) - mu0) / se), 199) für mu0 = 6.7, 6.9, 6.95, 7.05, 7.1, 7.2, 7.25, 7.5
 *   # 3.671806658e-10, 0.001894168685, 0.02331727259, 0.5756486708, 0.7630414097, 0.04399001708, 0.004284468244, 1.190923325e-11
 *   t.test(x + 0.1, mu = 7); t.test(x - 0.1, mu = 7)                       # t = 3.1484, p = 0.0018942; t = -0.3019, p = 0.7630
 *   0.0825 / (0.82 / sqrt(200)); 0.82 / sqrt(200)                          # 1.4228368, 0.0579828 (Formel als Satz mit s ≈ 0,82)
 *   0.0825 / (sd(x) / sqrt(20000)); qt(.975, 199); sd(x) / sqrt(200) * 60  # 14.2326, 1.9719565, 3.4779 Minuten
 */
const rows = createSurvey();
const ctx = (columns: Record<string, string>): SampleCtx => ({ rows, columns: Object.fromEntries(Object.entries(columns).map(([k, v]) => [k, [v]])) });
const tabs = (id: string): ConceptTabs => b09Testlogik.tabs[id];
const result = (id: string, data = rows) => { const s = tabs(id).sample; assert.ok(s?.kind === 'analysis', `${id}: Auswertung`); const cols = Object.fromEntries(Object.entries(s.columns ?? {}).map(([k, v]) => [k, [v]])); return s.result({ rows: data, columns: cols }); };

test('B9: alle zwölf Begriffe sind erklärt und haben Reiter mit Weiter', () => {
  const ids = ['hypothesis', 'test_statistic'];
  for (const id of ids) {
    assert.ok(b09Testlogik.explanations[id], `${id}: Erklärung fehlt`);
    assert.ok(b09Testlogik.tabs[id]?.next, `${id}: Weiter fehlt`);
  }
});

test('B9 Hypothese: Schlafdauer gegen sieben Stunden wie in R', () => {
  const r = schlafTest(ctx({ x: 'schlafdauer' }))!;
  for (const [mine, data, ref] of [[SCHLAF.mean, r.mean, 7.0825], [SCHLAF.sd, r.sd, 0.81975836], [SCHLAF.se, r.se, 0.05796567], [SCHLAF.t, r.t, 1.4232562], [SCHLAF.p, r.p, 0.15622776], [SCHLAF.lo, r.ci[0], 6.9681942], [SCHLAF.hi, r.ci[1], 7.1968058]] as const) {
    assert.ok(close(mine, ref, 1e-6), `Konstante ${mine} ≠ R ${ref}`);
    assert.ok(close(data, ref, 1e-6), `Lehrdatensatz ${data} ≠ R ${ref}`);
  }
  assert.deepEqual([r.n, r.df, r.mehr, r.weniger, SCHLAF.mehr, SCHLAF.weniger], [200, 199, 101, 88, 101, 88]);
  for (const [mu0, p] of [[6.7, 3.671806658e-10], [6.9, 0.001894168685], [6.95, 0.02331727259], [7.05, 0.5756486708], [7.1, 0.7630414097], [7.2, 0.04399001708], [7.25, 0.004284468244], [7.5, 1.190923325e-11]])
    assert.ok(close(schlafP(mu0), p, Math.max(1e-6 * p, 1e-15)), `μ₀ = ${mu0}: ${schlafP(mu0)} ≠ R ${p}`);
  assert.match(hypothese.stellDirVor.text, /im Schnitt 7,08 Stunden .* R meldet dazu p = 0\.156\./);
  assert.match(hypothese.ausprobieren[1].explain, /von etwa 6,97 bis 7,2 Stunden/);
  assert.match(hypothese.ausprobieren[2].explain, /p fällt auf etwa 0,002\./);
  assert.match(hypothese.regler!.describe(7), /mindestens 0,08 Stunden in etwa 16 von 100 Stichproben vor, p ≈ 0,16\. .* nicht\./);
  assert.match(hypothese.regler!.describe(7.1), /in etwa 76 von 100 .*p ≈ 0,76/);
  assert.match(hypothese.regler!.describe(6.9), /in weniger als 1 von 100 .*p ≈ 0,0019\. .*signifikant/);
  assert.match(hypothese.regler!.describe(7.2), /in etwa 4 von 100 .*p ≈ 0,044\. .*signifikant/);
  assert.match(hypothese.genau.paragraphs[0], /t\(199\) ≈ 1,42, p ≈ 0,16\. .*von 6,97 bis 7,2 Stunden/);
  // Reiter: Auswertung mit allen 200 und nach den beiden Verschiebungen (R: p 0.0018942 bzw. 0.7630414).
  assert.match(result('hypothesis').kurz, /im Schnitt 7,08 Stunden pro Nacht, 0,08 Stunden mehr als sieben\. .*in etwa 16 von 100 .*\(p ≈ 0,16\)\. .*nicht\./);
  assert.match(result('hypothesis').fachlich, /t\(199\) ≈ 1,42, p ≈ 0,16; 95-%-Konfidenzintervall von 6,97 bis 7,2 Stunden/);
  assert.equal(result('hypothesis').zusatz, '101 Befragte schlafen mehr als sieben Stunden, 88 weniger.');
  assert.match(result('hypothesis', applyOp(rows, 'schlafdauer', 'shift', 0.1)).kurz, /7,18 Stunden .*p ≈ 0,0019\)\. .*signifikant/);
  assert.match(result('hypothesis', applyOp(rows, 'schlafdauer', 'shift', -0.1)).kurz, /6,98 Stunden pro Nacht, 0,02 Stunden weniger .*p ≈ 0,76/);
});

test('B9 Prüfgröße: t für die Schlafdauer wie in R, mit den sichtbaren Zahlen nachrechenbar', () => {
  const s = pruefgroesse.compute(T_START);
  assert.ok(close(s.t, 1.4228368, 1e-6) && close(s.se, 0.0579828, 1e-6), `t ${s.t}, SE ${s.se}`);
  assert.ok(close(T_START.d, SCHLAF.mean - 7, 1e-9), 'Abstand wie in den Daten');
  assert.ok(close(pruefgroesse.compute({ ...T_START, s: SCHLAF.sd, n: 20000 }).t, 14.2326, 1e-4), 'bei 20.000 Befragten');
  assert.deepEqual(pruefgroesse.worked(s).map(w => w.text), ['√200 ≈ 14,14.', 'SE = 0,82 / 14,14 ≈ 0,058 Stunden.', 't = 0,0825 / 0,058 ≈ 1,42.']);
  assert.match(pruefgroesse.fehler, /0,08 Stunden sind bei 200 Befragten etwa 1,4 Standardfehler, bei 20\.000 Befragten wären es über 14\./);
  assert.match(pruefgroesse.interpret(s).kurz, /1,42 Standardfehler über dem Vergleichswert\. .*in etwa 16 von 100 Stichproben/);
  assert.match(pruefgroesse.interpret(s).fachlich, /bei 199 Freiheitsgraden, zweiseitig p ≈ 0,16\. Die Grenze für α = 0,05 liegt bei ±1,97/);
  assert.equal(pruefgroesse.check.diagnose(0.5).startsWith('Fast!'), true);
  // Reiter: R t = 1.4232562, verschoben 3.1484153 und −0.3019028; ein Standardfehler 0.05796567 h = 3.48 Minuten.
  assert.match(result('test_statistic').kurz, /Standardfehler von 0,058 Stunden liegt das 1,42 Standardfehler über sieben Stunden: t ≈ 1,42\./);
  assert.match(result('test_statistic').fachlich, /\(7,0825 − 7\) \/ \(0,82 \/ √200\) ≈ 1,42 bei 199 Freiheitsgraden\. .*±1,97/);
  assert.equal(result('test_statistic').zusatz, 'Ein Standardfehler entspricht hier 3,48 Minuten Schlaf pro Nacht.');
  assert.match(result('test_statistic', applyOp(rows, 'schlafdauer', 'shift', 0.1)).kurz, /t ≈ 3,15\./);
  assert.match(result('test_statistic', applyOp(rows, 'schlafdauer', 'shift', -0.1)).kurz, /0,3 Standardfehler unter sieben Stunden: t ≈ −0,3\./);
});
