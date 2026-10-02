import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSurvey } from '../../../domain/survey';
import { readSav } from '../../../sandbox/readSav';
import { applyOp } from '../../sample';
import { close } from '../../format';
import { ALLBUS, INTERESSE, VERTRAUEN } from './daten';
import { haelften, kopienSE, sampling, samplingTabs } from './sampling';

/*
 * Referenzwerte des Bereichs B8, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand).
 *
 * Lehrdatensatz, gelesen wie im R-Code der Studierenden (die .sav aus dem Atlas oder writeSav(createSurvey())):
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   x <- as.numeric(atlas$lernzeit)
 *   mean(x[1:100]); mean(x[101:200]); mean(x)                 # 7.824  7.679  7.7515
 *   cor(1:200, x)                                             # 0.0168: Die Nummern sagen nichts über die Lernzeit
 *
 * ALLBUS 2023 (ZA8831_v1-3-0.sav, nur lesen, Pfad in ALLBUS_SAV), nur Aggregate:
 *   d <- haven::read_sav(Sys.getenv("ALLBUS_SAV"))
 *   nrow(d); table(d$eastwest)                                # 5246; West 3567, Ost 1679
 *   sum(d$wghtpew[d$eastwest == 2]) / sum(d$wghtpew)          # 0.1683825 (Anteil Ost, gewichtet)
 *   t3 <- as.numeric(d$pt03)                                  # Vertrauen Bundestag 1–7, fehlende Codes sind NA
 *   sum(!is.na(t3)); mean(t3, na.rm = TRUE); sd(t3, na.rm = TRUE)   # 3592  3.946826  1.625373
 *   ok <- !is.na(t3); sum(d$wghtpew[ok] * t3[ok]) / sum(d$wghtpew[ok])   # 4.013856 (gewichtet)
 *   mean(t3[ok & d$eastwest == 2]); mean(t3[ok & d$eastwest == 1])       # 3.666382  4.08213
 *   x <- 6 - as.numeric(d$pa02a); x <- x[!is.na(x)]          # politisches Interesse, umgepolt
 *   length(x); mean(x); sd(x); sum(x >= 4)                   # 5225  3.297225  0.93954  2069
 *   for (k in 1:4) { xx <- rep(x, k); print(sd(xx) / sqrt(length(xx))) }   # 0.012998 0.009190 0.007504 0.006498
 */

const rows = createSurvey();
const allbusFile = process.env.ALLBUS_SAV;

/** Gültige Werte einer ALLBUS-Variable (Codes im Bereich lo bis hi; fehlende Codes sind negativ) mit Gewicht und Gebiet. */
function allbus(names: string[]) {
  const bytes = readFileSync(allbusFile!), sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  return { n: sav.nCases, v: (name: string) => Array.from(sav.byName.get(name)!.values) };
}
const ctx = (data = rows) => ({ rows: data, columns: { x: ['lernzeit'] } });

test('B8 sampling: ALLBUS-Aggregate, Kopien im Regler und die zwei Hälften wie in R', () => {
  assert.equal(ALLBUS.befragte, 5246, 'ALLBUS 2023: Befragte');
  assert.equal(ALLBUS.ost, 1679, 'ALLBUS 2023: davon Ost');
  assert.ok(close(ALLBUS.ostGewichtet, 0.1683825, 1e-7), 'Anteil Ost gewichtet');
  assert.ok(close(VERTRAUEN.mean, 3.946826, 1e-6) && close(VERTRAUEN.gewichtet, 4.013856, 1e-6), 'Vertrauen Bundestag');
  assert.ok(close(INTERESSE.sd, 0.93954, 1e-5) && INTERESSE.n === 5225, 'politisches Interesse');
  for (const [k, se] of [[1, 0.012998], [2, 0.009190], [3, 0.007504], [4, 0.006498]])
    assert.ok(close(kopienSE(k), se, 1e-6), `Kopien ${k}: ${kopienSE(k)} ≠ R ${se}`);
  assert.match(sampling.stellDirVor.text, /5\.246 Menschen geantwortet, 1\.679 davon in Ostdeutschland\. Das sind 32 % der Befragten\./);
  assert.match(sampling.stellDirVor.text, /nur noch mit 16,8 %\./);
  assert.match(sampling.bausteine[2].acht, /ungewichtet im Mittel 3,95, gewichtet 4,01\./);
  assert.match(sampling.regler!.describe(1), /Standardfehler 0,013\./);
  assert.match(sampling.regler!.describe(2), /10\.450 Zeilen .*Standardfehler 0,0092 statt 0,013\./);

  const h = haelften(ctx());
  assert.ok(close(h.a, 7.824, 1e-9) && close(h.b, 7.679, 1e-9) && close(h.alle, 7.7515, 1e-9), 'Hälften wie in R');
  assert.equal(h.first, 'P100'); assert.equal(h.second, 'P101');
  const s = samplingTabs.sample!;
  assert.equal(s.kind, 'analysis');
  if (s.kind === 'analysis') {
    const r = s.result(ctx());
    assert.match(r.kurz, /im Schnitt 7,82 Stunden gelernt, die anderen 100 7,68 Stunden\. .* 0,14 Stunden auseinander\./);
    assert.match(r.fachlich, /Mittelwert aller 200, 7,75 h\./);
    assert.match(s.result(ctx(applyOp(rows, 'lernzeit', 'double'))).kurz, /0,29 Stunden auseinander/, 'verdoppelt: 0,29');
  }
});

test('B8: ALLBUS-Aggregate aus der Datei nachgerechnet (nur mit ALLBUS_SAV)', { skip: !allbusFile && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const a = allbus(['eastwest', 'wghtpew', 'pt03', 'pa02a', 'dh04']);
  const ew = a.v('eastwest'), w = a.v('wghtpew'), t3 = a.v('pt03'), pa = a.v('pa02a'), hh = a.v('dh04');
  assert.equal(a.n, ALLBUS.befragte);
  assert.equal(ew.filter(v => v === 2).length, ALLBUS.ost);
  const wOst = w.filter((_, i) => ew[i] === 2).reduce((x, y) => x + y, 0), wAll = w.reduce((x, y) => x + y, 0);
  assert.ok(close(wOst / wAll, ALLBUS.ostGewichtet, 1e-7), 'Anteil Ost gewichtet');
  const ok = t3.map(v => v >= 1 && v <= 7), t = t3.filter((_, i) => ok[i]);
  const m = t.reduce((x, y) => x + y, 0) / t.length, sd = Math.sqrt(t.reduce((x, y) => x + (y - m) ** 2, 0) / (t.length - 1));
  assert.equal(t.length, VERTRAUEN.n); assert.ok(close(m, VERTRAUEN.mean, 1e-6) && close(sd, VERTRAUEN.sd, 1e-6), 'pt03 Mittelwert und s');
  const tw = t3.reduce((x, v, i) => ok[i] ? x + v * w[i] : x, 0) / w.reduce((x, v, i) => ok[i] ? x + v : x, 0);
  assert.ok(close(tw, VERTRAUEN.gewichtet, 1e-6), 'pt03 gewichtet');
  const east = t3.filter((v, i) => ok[i] && ew[i] === 2), west = t3.filter((v, i) => ok[i] && ew[i] === 1);
  assert.ok(close(east.reduce((x, y) => x + y, 0) / east.length, VERTRAUEN.ost, 1e-6) && close(west.reduce((x, y) => x + y, 0) / west.length, VERTRAUEN.west, 1e-6), 'pt03 Ost und West');
  const pi = pa.filter(v => v >= 1 && v <= 5).map(v => 6 - v), pm = pi.reduce((x, y) => x + y, 0) / pi.length;
  assert.equal(pi.length, INTERESSE.n); assert.equal(pi.filter(v => v >= 4).length, INTERESSE.stark);
  assert.ok(close(pm, INTERESSE.mean, 1e-6) && close(Math.sqrt(pi.reduce((x, y) => x + (y - pm) ** 2, 0) / (pi.length - 1)), INTERESSE.sd, 1e-5), 'pa02a');
});
