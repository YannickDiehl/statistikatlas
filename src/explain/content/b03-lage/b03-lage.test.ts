import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSurvey } from '../../../domain/survey';
import { readSav, isMissingCode } from '../../../sandbox/readSav';
import { close } from '../../format';
import { ALLBUS_N, validn, validnTabs, validCounts } from './validn';
import { LERNZEIT, range, rangeOf, rangeTabs, rangeWithTop } from './range';
import { applyOp } from '../../sample';
import { quantile6 } from './lage';

/*
 * Referenzwerte des Bereichs B3, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas oder writeSav(createSurvey())), und auf dem
 * ALLBUS 2023 (ZA8831_v1-3-0.sav, ungewichtet, nur Aggregate):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *
 * Anzahl (validn), ALLBUS 2023 mit haven::read_sav(user_na = FALSE), Missing-Codes werden NA:
 *   a <- haven::read_sav(Sys.getenv("ALLBUS_SAV")); lr <- as.numeric(a$pa01); bt <- as.numeric(a$pt03)
 *   nrow(a); sum(!is.na(lr)); sum(!is.na(bt)); sum(!is.na(lr) & !is.na(bt))      # 5246 4997 3592 3436
 *   sum(is.na(lr)); sum(is.na(bt)); sum(is.na(lr) & is.na(bt))                     # 249 1654 93
 *   sum(as.numeric(haven::read_sav(Sys.getenv("ALLBUS_SAV"), user_na = TRUE)$pt03) == -11)   # 1596 (Split, nicht gefragt)
 *   atlas %>% describe(lernzeit, show = "mean")                                      # Mean 7.752, N 200, Missing 0
 *
 * Spannweite (range), x <- as.numeric(atlas$lernzeit), q <- function(v, p) unname(quantile(v, p, type = 6)):
 *   atlas %>% describe(lernzeit, show = c("min", "max", "range"))                   # Min 0.000, Max 18.400, Range 18.400
 *   atlas$id[x == min(x)]; atlas$id[x == max(x)]; sort(x)[c(2, 199)]                  # P100, P175; 0.9, 17.3
 *   q(x, .25); q(x, .75); q(x, .75) - q(x, .25)                                       # 5.8 9.75 3.95 (wie w_quantile, w_iqr)
 *   for (top in c(25, 40, 60)) { xx <- x; xx[atlas$id == "P175"] <- top; max(xx) - min(xx); q(xx, .75) - q(xx, .25) }   # 25/40/60, IQR immer 3.95
 *   range(sapply(1:200, function(k) { xx <- x; xx[k] <- 40; max(xx) - min(xx) }))   # 39.1 40
 */

const rows = createSurvey();

test('B3 Anzahl: die ALLBUS-Zahlen gehen auf, die Texte nennen sie, der Lehrdatensatz hat 200 vollständige Paare', () => {
  const A = ALLBUS_N;
  assert.equal(A.total - A.lrMissing, A.lr, 'Links-rechts gültig');
  assert.equal(A.total - A.btMissing, A.bt, 'Vertrauen gültig');
  assert.equal(A.total - (A.lrMissing + A.btMissing - A.bothMissing), A.both, 'vollständige Paare');
  assert.equal(A.total - A.lrMissing - A.btMissing, 3343, 'doppelt abgezogen');
  assert.match(validn.stellDirVor.text, /4\.997 der 5\.246 Befragten.*3\.592 gültige Antworten: 1\.596 Befragte.*weiteren 58.*3\.436 Befragte/);
  assert.match(validn.bausteine[1].rechnung!, /249 \+ 1\.654 − 93 = 1\.810 .*5\.246 − 1\.810 = 3\.436/);
  assert.match(validn.bausteine[1].acht, /kommt auf 3\.343 statt 3\.436/);
  // Probier es selbst: 1.000 − (50 + 80 − 20) = 890; doppelt abgezogen 870; nur Einkommen 920.
  assert.equal(validn.check.options[validn.check.correct], String(1000 - (50 + 80 - 20)));
  assert.deepEqual(validn.check.options.slice(1), ['870', '920', '1.000']);
  const v = validCounts({ rows, columns: { x: ['lernzeit'], y: ['wissenstest'] } });
  assert.deepEqual([v.nx, v.ny, v.nxy], [200, 200, 200], 'Lehrdatensatz ohne fehlende Werte');
  const s = validnTabs.sample!;
  assert.ok(s.kind === 'analysis' && /n = 200/.test(s.result({ rows, columns: { x: ['lernzeit'], y: ['wissenstest'] } }).kurz), 'Deutung nennt n = 200');
});

const allbus = process.env.ALLBUS_SAV;
test('B3 Anzahl: die Aggregate stimmen mit der ALLBUS-Datei überein (nur mit ALLBUS_SAV)', { skip: !allbus && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const bytes = readFileSync(allbus!), sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const lr = sav.byName.get('pa01')!, bt = sav.byName.get('pt03')!;
  const ok = (v: typeof lr, i: number) => !isMissingCode(v, v.values[i]);
  let nlr = 0, nbt = 0, both = 0, none = 0, split = 0;
  for (let i = 0; i < sav.nCases; i++) {
    const a = ok(lr, i), b = ok(bt, i);
    nlr += +a; nbt += +b; both += +(a && b); none += +(!a && !b); split += +(bt.values[i] === -11);
  }
  assert.deepEqual([sav.nCases, nlr, nbt, both, none, split], [ALLBUS_N.total, ALLBUS_N.lr, ALLBUS_N.bt, ALLBUS_N.both, ALLBUS_N.bothMissing, ALLBUS_N.btSplit]);
  assert.ok(close(nlr / sav.nCases, 0.9525, 0.001), 'Anteil gültig bei Links-rechts');
});

test('B3 Spannweite: Lernzeit, Regler und Auswertung wie in R', () => {
  const xs = rows.map(r => r.values.lernzeit);
  assert.deepEqual([Math.min(...xs), Math.max(...xs)], [LERNZEIT.min, LERNZEIT.max]);
  assert.equal(rows.find(r => r.values.lernzeit === 0)!.id, LERNZEIT.minPerson);
  assert.equal(rows.find(r => r.values.lernzeit === 18.4)!.id, LERNZEIT.maxPerson);
  assert.ok(close(quantile6(xs, 0.25), 5.8, 1e-9) && close(quantile6(xs, 0.75), 9.75, 1e-9) && close(LERNZEIT.iqr, 3.95, 1e-9), 'Quartile Type 6');
  for (const top of [18.4, 25, 40, 60]) {
    const r = rangeWithTop(top);
    assert.ok(close(r.range, top, 1e-9) && close(r.iqr, 3.95, 1e-9), `Regler ${top}`);
  }
  assert.match(range.regler!.describe(40), /Mit 40 Stunden reicht die Spannweite von 0 bis 40 Stunden: 40 Stunden\. Der Interquartilsabstand bleibt bei 3,95 Stunden/);
  assert.match(range.regler!.describe(18.4), /So ist es in den Daten: Die Spannweite beträgt 18,4 Stunden, der Interquartilsabstand 3,95 Stunden\./);
  assert.match(range.stellDirVor.text, /18,4 − 0 = 18,4 Stunden.*zwischen 5,8 und 9,75 Stunden.*3,95 Stunden breit/);
  const ctx = { rows, columns: { x: ['lernzeit'] } }, r0 = rangeOf(ctx);
  assert.deepEqual([r0.atMax, r0.atMin], [['P175'], ['P100']]);
  const after = rows.map((_, k) => rangeOf({ rows: applyOp(rows, 'lernzeit', 'outlier', 40, k), columns: { x: ['lernzeit'] } }).range);
  assert.ok(close(Math.min(...after), 39.1, 1e-9) && close(Math.max(...after), 40, 1e-9), 'Ausreißer 40: 39,1 bis 40 Stunden');
  const s = rangeTabs.sample!;
  assert.ok(s.kind === 'analysis' && s.think[0].explain.includes('auf 39,1 bis 40 Stunden'));
});
