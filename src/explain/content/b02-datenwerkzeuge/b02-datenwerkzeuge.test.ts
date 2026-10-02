import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSurvey } from '../../../domain/survey';
import { close } from '../../format';
import { CATALOG_OUTPUT } from '../../catalogOutput';
import { liveOutput } from '../../rRead';
import { applyOp } from '../../sample';
import type { SampleCtx } from '../../types';
import { ALLBUS, FUENF } from './daten';
import { LABELS_MITTEL, labels, labelsTabs } from './labels';

/*
 * Referenzwerte des Bereichs B2, in R nachgerechnet (R 4.x, mariposa 0.7.4 aus dem Quellstand) auf dem Lehrdatensatz,
 * gelesen wie im R-Code der Studierenden (writeSav(createSurvey()) als Statistikatlas-200-Befragte.sav):
 *
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   five <- atlas %>% filter(id %in% c("P001", "P002", "P003", "P004", "P005"))
 *   five %>% select(id, erwerbstaetig, einkommen, lernzeit, wissenstest)
 *   #   P001 1 [Ja]   4549   6.0 12
 *   #   P002 1 [Ja]   3850   8.3  9
 *   #   P003 0 [Nein] 2762   6.3 14
 *   #   P004 1 [Ja]   4604  10.5 13
 *   #   P005 1 [Ja]   1868   6.8 11
 */
const rows = createSurvey();
const byId = new Map(rows.map(r => [r.id, r.values]));
const ctx = (data = rows, x?: string): SampleCtx => ({ rows: data, columns: x ? { x: [x] } : {} });

test('B2: die fünf Befragten P001 bis P005 stimmen mit dem Lehrdatensatz überein', () => {
  for (const r of FUENF) {
    const v = byId.get(r.person)!;
    for (const k of ['erwerbstaetig', 'einkommen', 'lernzeit', 'wissenstest'] as const) assert.equal(v[k], r[k], `${r.person} ${k}`);
  }
});

/*
 * Labels:
 *   mean(five$erwerbstaetig)                                                     # 0.8
 *   five %>% select(id, erwerbstaetig) %>% unlabel() %>%
 *     var_label(erwerbstaetig = "Sind Sie gegenwärtig erwerbstätig?") %>%
 *     val_labels(erwerbstaetig = c("Nein" = 0, "Ja" = 1))                       # 1 [Ja], 1 [Ja], 0 [Nein], 1 [Ja], 1 [Ja]
 *   five %>% val_labels(erwerbstaetig = c("Ja" = 0, "Nein" = 1))                 # 1 [Nein] …, mean weiter 0.8
 *   five %>% unlabel(erwerbstaetig)                                              # <dbl> 1 1 0 1 1, keine Attribute, mean 0.8
 *   atlas %>% unlabel(erwerbstaetig) %>% var_label(…) %>% val_labels(…) %>% frequency(erwerbstaetig)
 *   # erwerbstaetig (Sind Sie gegenwärtig erwerbstätig?) … 0 Nein 63, 1 Ja 137, mean=0.69
 *   atlas %>% unlabel(erwerbstaetig) %>% frequency(erwerbstaetig)                # Kopf nur „erwerbstaetig“, ohne Label-Spalte
 *   atlas %>% val_labels(erwerbstaetig = c("Weiß nicht" = 8), .add = TRUE)       # Nein 0, Ja 1, Weiß nicht 8; ohne .add nur Weiß nicht 8
 *   Fehlermeldungen: to_labelled(erwerbstaetigg, …) in mutate()   → Objekt 'erwerbstaetigg' nicht gefunden
 *                    parse(text = 'c(0 = "Nein")')                → Unerwartete(s) '='
 *                    to_labelled(…, label = Erwerbstätig)          → Objekt 'Erwerbstätig' nicht gefunden
 */
test('Labels: Tabelle nachher, Mittelwert und Häufigkeiten wie in R', () => {
  assert.ok(close(LABELS_MITTEL, 0.8, 1e-12), 'Mittelwert 0,8');
  assert.deepEqual(labels.apply(labels.rows, 'setzen').rows.map(r => r.erwerbstaetig), ['1 [Ja]', '1 [Ja]', '0 [Nein]', '1 [Ja]', '1 [Ja]']);
  assert.deepEqual(labels.apply(labels.rows, 'vertauscht').rows.map(r => r.erwerbstaetig), ['1 [Nein]', '1 [Nein]', '0 [Ja]', '1 [Nein]', '1 [Nein]']);
  assert.deepEqual(labels.apply(labels.rows, 'entfernen').rows.map(r => r.erwerbstaetig), [1, 1, 0, 1, 1]);
  assert.match(labels.rCode('setzen'), /val_labels\(erwerbstaetig = c\("Nein" = 0, "Ja" = 1\)\)/);
  assert.match(labels.rCode('vertauscht'), /val_labels\(erwerbstaetig = c\("Ja" = 0, "Nein" = 1\)\)/);
  assert.match(labels.check.right, /^Genau, 0,8\./);
  for (const o of labels.options) assert.equal(labels.check.answer(o.id), LABELS_MITTEL);
  const s = labelsTabs.sample!;
  assert.equal(s.kind, 'analysis');
  if (s.kind !== 'analysis') return;
  const r = s.result(ctx(rows, 'erwerbstaetig'));
  assert.match(r.kurz, /^137 Befragte tragen das Label „Ja“, 63 das Label „Nein“\..*Mittelwert 0,69 .* 68,5 %/);
  assert.match(r.fachlich, /Häufigkeiten 63 und 137, Mittelwert der Codes 0,69/);
  // Codes getauscht: 63 Ja, 137 Nein; alle auf 1: niemand mit Nein.
  assert.equal(s.value!(ctx(applyOp(rows, 'erwerbstaetig', 'reverse'), 'erwerbstaetig')), 63);
  assert.equal(s.think[1].expect.measure!(ctx(applyOp(rows, 'erwerbstaetig', 'constant', 1), 'erwerbstaetig')), 0);
  // In R: die erfasste Ausgabe des Leitaufrufs (conversion:1) mit dem neuen Variablenlabel und den Wertelabels.
  const out = CATALOG_OUTPUT['conversion:1'].output;
  assert.match(out, /erwerbstaetig \(Erwerbstätig\)/);
  assert.match(out, /\|\s+0 \| Nein\s+\|\s+63 \|/);
  assert.match(out, /mean=0\.69/);
});

// ALLBUS 2023 nur, wenn die eigene GESIS-Datei da ist (ALLBUS_SAV); die Aggregate stehen fest in ./daten.ts.
const allbusFile = process.env.ALLBUS_SAV;
test('ALLBUS 2023: Größe und Vertrauen in den Bundestag (pt03) wie in R', { skip: !allbusFile && 'ALLBUS_SAV nicht gesetzt' }, async () => {
  /*
   *   allbus <- read_spss("ZA8831_v1-3-0.sav")
   *   dim(allbus)                                              # 5246 579
   *   allbus %>% codebook(view = FALSE)                        # 579 variables | 5246 observations | 579 labelled; 576 lbl+dbl
   *   na_frequencies(allbus$pt03)                              # -42: 3, -11: 1596, -9: 55
   *   sum(!is.na(allbus$pt03)); mean(allbus$pt03, na.rm = TRUE) # 3592, 3.946826 (Summe 14177)
   *   mean(as.numeric(untag_na(allbus$pt03)))                  # -0.762486, wenn die Codes als Zahlen mitzählen
   *   allbus %>% find_var("Bundestag", search = "label")       # pt03 VERTRAUEN: BUNDESTAG, pv01 WAHLABSICHT BUNDESTAGSWAHL
   */
  const { readSav, isMissingCode } = await import('../../../sandbox/readSav');
  const bytes = readFileSync(allbusFile!);
  const sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  assert.equal(sav.nCases, ALLBUS.befragte);
  assert.equal(sav.variables.length, ALLBUS.spalten);
  const pt03 = sav.byName.get('pt03')!, values = [...pt03.values];
  const valid = values.filter(x => !isMissingCode(pt03, x));
  assert.equal(valid.length, ALLBUS.pt03.gueltig);
  assert.equal(values.length - valid.length, ALLBUS.pt03.fehlend);
  assert.equal(valid.reduce((a, b) => a + b, 0), ALLBUS.pt03.summeGueltig);
  assert.ok(close(ALLBUS.pt03.summeGueltig / ALLBUS.pt03.gueltig, ALLBUS.pt03.mittel, 1e-6), 'Mittelwert der gültigen Antworten');
  assert.ok(close(values.reduce((a, b) => a + b, 0) / values.length, ALLBUS.pt03.mittelMitCodes, 1e-6), 'Mittelwert mit Codes als Zahlen');
  for (const c of ALLBUS.pt03.codes) assert.equal(values.filter(x => x === c.code).length, c.n, `Code ${c.code}`);
  assert.equal(pt03.label, 'VERTRAUEN: BUNDESTAG');
});

test('B2: Live-Ausgaben der Leitaufrufe wie in R', () => {
  /*
   *   atlas %>% describe(lernzeit, show = c("min", "max"))     # Min 0.000, Max 18.400, N 200, Missing 0
   *   atlas %>% describe(lernzeit, show = "mean")              # Mean 7.752, N 200, Missing 0
   */
  assert.equal(liveOutput({ fn: 'describe', show: ['min', 'max'] }, rows, 'lernzeit'),
    '\nDescriptive Statistics\n----------------------\n\n  -------------------------------------\n  Variable    Min     Max    N  Missing\n  -------------------------------------\n  lernzeit  0.000  18.400  200        0\n  -------------------------------------');
  assert.equal(liveOutput({ fn: 'describe', show: ['mean'] }, rows, 'lernzeit'),
    '\nDescriptive Statistics\n----------------------\n\n  -----------------------------\n  Variable   Mean    N  Missing\n  -----------------------------\n  lernzeit  7.752  200        0\n  -----------------------------');
});
