import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurvey } from '../../../domain/survey';
import { tTest } from '../../../tasks/kit/means';
import { pt } from '../../../tasks/kit/dist';
import { close } from '../../format';
import { LERNZEIT_NACH_WEITERBILDUNG as L, pFor, pWert } from './p-wert';
import { ABSCHLUESSE, dummy } from './dummy';

/*
 * Referenzwerte der Muster, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz
 * createSurvey() als CSV beziehungsweise als .sav mit Wertelabels:
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read.csv("atlas.csv")
 *   tt <- t.test(lernzeit ~ weiterbildung, data = atlas)        # Welch, wie mariposa::t_test
 *   # n0 = 118, n1 = 82, mean0 = 7.781356, mean1 = 7.708537
 *   # t = 0.156435, df = 175.841175, p = 0.875870, stderr = 0.465493, conf.int = [-0.845854, 0.991492]
 *   atlas %>% t_test(lernzeit, group = weiterbildung)          # t(175.8) = 0.156, p = 0.876
 *   se <- tt$stderr; df <- tt$parameter
 *   2 * pt(-c(0.07, 0.5, 1, 1.5, 2) / se, df)                   # 0.880639 0.284237 0.033062 0.001515 0.000029
 *   # hundertmal so viele Befragte bei gleichen Mittelwerten und Streuungen:
 *   # se = 0.046549, t = 1.564348, df = 17781.8, p = 0.117754
 *
 *   five <- atlas %>% filter(id %in% c("P001", "P002", "P003", "P007", "P011"))
 *   five %>% mutate(haupt  = rec(schulabschluss, rules = "1=1; 0,2,3,4=0"),
 *                   mittel = rec(schulabschluss, rules = "2=1; 0,1,3,4=0"),
 *                   fhr    = rec(schulabschluss, rules = "3=1; 0,1,2,4=0"),
 *                   abitur = rec(schulabschluss, rules = "4=1; 0,1,2,3=0"))
 *   #   id   schulabschluss haupt mittel fhr abitur
 *   #   P001 0              0     0      0   0
 *   #   P002 3              0     0      1   0
 *   #   P003 2              0     1      0   0
 *   #   P007 1              1     0      0   0
 *   #   P011 4              0     0      0   1
 *   to_dummy(five, schulabschluss, ref = 0)                     # dieselben vier Spalten (schulabschluss_1 … _4)
 *   # Mit read_spss() aus einer .sav mit Wertelabels: table(rec(schulabschluss, rules = "4=1; 0,1,2,3=0")) = 160 / 40
 */

const rows = createSurvey();
const R = {
  nOhne: 118, nMit: 82, ohne: 7.781356, mit: 7.708537, t: 0.156435, df: 175.841175, p: 0.875870, se: 0.465493,
  regler: [[0.07, 0.880639], [0.5, 0.284237], [1, 0.033062], [1.5, 0.001515], [2, 0.000029]],
};

test('p-Wert: Lernzeit nach Weiterbildung stimmt mit R und mit dem Lehrdatensatz überein', () => {
  const t = tTest(rows.map(r => r.values.lernzeit), rows.map(r => r.values.weiterbildung))!;
  const at = (level: number) => t.levels.indexOf(level);
  assert.deepEqual([t.n[at(1)], t.n[at(0)]], [R.nMit, R.nOhne]);
  assert.deepEqual([L.nMit, L.nOhne], [R.nMit, R.nOhne]);
  for (const [mine, data, r] of [[L.mit, t.means[at(1)], R.mit], [L.ohne, t.means[at(0)], R.ohne], [L.t, Math.abs(t.welch.t), R.t], [L.df, t.welch.df, R.df], [L.p, t.welch.p, R.p], [L.se, t.welch.se, R.se], [L.diff, Math.abs(t.diff), R.ohne - R.mit]])
    { assert.ok(close(mine, r, 1e-6), `${mine} ≠ R ${r}`); assert.ok(close(data, r, 1e-6), `Lehrdatensatz ${data} ≠ R ${r}`); }
  for (const [v, p] of R.regler) assert.ok(close(pFor(v), p, 1e-6), `Regler ${v}: ${pFor(v)} ≠ R ${p}`);
  // Hundertmal so viele Befragte: SE durch 10, t mal 10.
  assert.ok(close(2 * pt(-10 * L.t, 17781.8), 0.117754, 1e-5));
  assert.match(pWert.stellDirVor.text, /p = 0\.876, auf zwei Stellen gerundet 0,88\./);
  assert.match(pWert.ausprobieren[2].explain, /p fällt von 0,88 auf etwa 0,12/);
  assert.match(pWert.regler!.describe(0.07), /in etwa 88 von 100 .*\(p ≈ 0,88\)/);
  assert.match(pWert.regler!.describe(1), /in etwa 3 von 100 .*\(p ≈ 0,03\)/);
  assert.match(pWert.regler!.describe(2), /weniger als 1 von 1\.000 .*\(p < 0,001\)/);
});

test('Dummy: die fünf Befragten, ihre Abschlüsse und die neuen Spalten stimmen mit R überein', () => {
  const byId = new Map(rows.map(r => [r.id, r.values.schulabschluss]));
  for (const r of dummy.rows) assert.equal(byId.get(String(r.person)), r.schulabschluss, `${r.person}`);
  const after = dummy.apply(dummy.rows, '0');
  assert.deepEqual(after.columns.map(c => c.key), ['person', 'label', 'haupt', 'mittel', 'fhr', 'abitur']);
  assert.deepEqual(after.rows.map(r => [r.person, r.haupt, r.mittel, r.fhr, r.abitur]), [
    ['P001', 0, 0, 0, 0], ['P002', 0, 0, 1, 0], ['P003', 0, 1, 0, 0], ['P007', 1, 0, 0, 0], ['P011', 0, 0, 0, 1],
  ]);
  for (const ref of ABSCHLUESSE) {
    const a = dummy.apply(dummy.rows, String(ref.code)), names = a.columns.slice(2).map(c => c.key);
    assert.equal(names.length, 4); assert.ok(!names.includes(ref.name));
    for (const r of a.rows) assert.equal(names.reduce((s, k) => s + Number(r[k]), 0), r.label === ref.label ? 0 : 1, `${ref.name}/${r.person}`);
    const code = dummy.rCode(String(ref.code));
    for (const other of ABSCHLUESSE.filter(o => o.code !== ref.code)) assert.match(code, new RegExp(`${other.name} += rec\\(schulabschluss, rules = "${other.code}=1; [0-4,]+=0"\\)`));
    assert.ok(!new RegExp(`\\b${ref.name} += rec`).test(code));
  }
  assert.equal(dummy.check.answer('0'), 4);
  assert.match(dummy.check.diagnose('0', 5)!, /^Fast!/);
});

