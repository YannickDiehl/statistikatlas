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
import { CONVERSION_MITTEL, conversion, conversionTabs } from './conversion';
import { EINKOMMEN, missingMittel, missingTools, missingToolsTabs, mitCode } from './missing-tools';
import { FORMATE, dataExport } from './data-export';
import { paare, positionP002, reihe, sorting, sortingTabs } from './sorting';
import { codebook, codebookTabs, eintrag } from './codebook';
import { dataImport } from './data-import';
import { surveyColumns } from '../../../domain/survey';
import { savVariableLabel } from '../../../domain/savWriter';

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

/*
 * Datentypen umwandeln (erwerbstaetig, P001 bis P005):
 *   five %>% to_numeric(erwerbstaetig)                          # <dbl> 1 1 0 1 1, mean 0.8
 *   f <- five %>% to_label(erwerbstaetig)                       # <fct> Ja Ja Nein Ja Ja, levels Nein, Ja
 *   as.numeric(f$erwerbstaetig)                                 # 2 2 1 2 2, mean 1.8
 *   mean(f$erwerbstaetig)                                       # NA, Warnung: Argument ist weder numerisch noch boolesch: gebe NA zurück
 *   five %>% to_character(erwerbstaetig)                        # <chr> Ja Ja Nein Ja Ja, mean ebenso NA
 *   f %>% to_numeric(erwerbstaetig)                             # wieder 1 1 0 1 1
 *   Schulabschluss P001 bis P005: as.numeric(to_label(…)) 1 4 3 3 1, to_numeric(to_label(…)) 0 3 2 2 0
 *   200 Befragte: mean(atlas$erwerbstaetig) 0.685 (137 Ja, 63 Nein), as.numeric(to_label(…)) im Mittel 1.685
 *   atlas %>% to_label(erwerbstaetig) %>% mutate(erwerbstaetig = as.numeric(erwerbstaetig)) %>% frequency(erwerbstaetig)   # mean=1.69
 *   atlas %>% to_character(erwerbstaetig) %>% frequency(erwerbstaetig)  # Ja 137 vor Nein 63: Texte nach dem Alphabet, ohne mean=
 *   atlas %>% to_label(erwerbstaetig) %>% describe(erwerbstaetig, show = "mean")
 *   # Fehler: Variable `erwerbstaetig` is not numeric. `describe()` only works with numeric variables.
 */
test('Datentypen umwandeln: Tabelle nachher und Mittelwerte wie in R', () => {
  assert.deepEqual([CONVERSION_MITTEL.codes, CONVERSION_MITTEL.stufen].map(x => Math.round(x * 1e9) / 1e9), [0.8, 1.8]);
  assert.deepEqual(conversion.apply(conversion.rows, 'zahl').rows.map(r => r.erwerbstaetig), [1, 1, 0, 1, 1]);
  assert.deepEqual(conversion.apply(conversion.rows, 'faktor').rows.map(r => r.erwerbstaetig), ['Ja', 'Ja', 'Nein', 'Ja', 'Ja']);
  assert.deepEqual(conversion.apply(conversion.rows, 'text').rows.map(r => r.erwerbstaetig), ['Ja', 'Ja', 'Nein', 'Ja', 'Ja']);
  assert.deepEqual(conversion.apply(conversion.rows, 'stufen').rows.map(r => r.erwerbstaetig), [2, 2, 1, 2, 2]);
  assert.deepEqual(conversion.options.map(o => conversion.check.answer(o.id)), [CONVERSION_MITTEL.codes, 'NA', 'NA', CONVERSION_MITTEL.stufen]);
  assert.equal(conversion.check.diagnose('faktor', 'NA'), null);
  const s = conversionTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx(rows, 'erwerbstaetig'));
  assert.match(r.kurz, /Mittelwert 0,69: 68,5 % der Befragten .* 137-mal „Ja“ und 63-mal „Nein“/);
  assert.match(r.fachlich, /Mittelwert 0,69\. .*Mittelwert 1,69\.$/);
  assert.ok(close(s.value!(ctx(applyOp(rows, 'erwerbstaetig', 'reverse'), 'erwerbstaetig'))!, 0.315, 1e-12), 'getauscht: 63 / 200');
  const out = CATALOG_OUTPUT['conversion:0'].output;
  assert.match(out, /\| Nein\s+\|\s+63 \|\s+31\.50 \|/);
  assert.doesNotMatch(out, /mean=/);
});

/*
 * Missing-Codes (einkommen, P001 bis P005; zum Üben P001 = -9, P004 = -8):
 *   five <- five %>% select(id, einkommen) %>%
 *     mutate(einkommen = replace(einkommen, id == "P001", -9), einkommen = replace(einkommen, id == "P004", -8))
 *   mean(five$einkommen)                                         # 1692.6 (Summe 8463)
 *   n9 <- five %>% set_na(einkommen = -9); mean(n9$einkommen, na.rm = TRUE)          # 2118 (8472 / 4), P001 NA(a)
 *   b <- five %>% set_na(einkommen = c(-9, -8)); mean(b$einkommen, na.rm = TRUE)     # 2826.666667 (8480 / 3), NA(a), NA(b)
 *   na_frequencies(b$einkommen)                                  # -9 Tag a, -8 Tag b
 *   b %>% describe(einkommen, show = "mean")                     # Mean 2826.667, N 3, Missing 2
 *   200 Befragte, der Katalogaufruf mit P001 = -9:
 *   atlas %>% mutate(einkommen = replace(einkommen, id == "P001", -9)) %>% set_na(einkommen = -9) %>%
 *     describe(einkommen, show = c("mean", "sd"))                # Mean 3147.613, SD 1426.790, N 199, Missing 1
 *   mean(replace(atlas$einkommen, 1, -9))                        # 3131.83 (ohne set_na), Unterschied 15.783065
 *   mean(replace(atlas$einkommen + 100, 1, -9)) - 3131.83        # 99.5: ohne set_na() wächst der Code nicht mit
 *   Codezeilen des Werkzeugs auf atlas (P001 = -9, P004 = -8): ohne set_na Mean 3108.770 (N 200), nur -9 3124.437 (199, 1),
 *   beide 3140.258 (198, 2)
 *   d <- atlas %>% mutate(alter = replace(alter, id == "P002", -9), einkommen = replace(einkommen, id == "P001", -9)) %>% set_na(-9)
 *   sum(is.na(d$alter)); sum(is.na(d$einkommen))                 # 1 1: ohne Spaltennamen gilt der Code für alle Zahlenspalten
 *   Fehlermeldungen: set_na(einkommen = "-9")                    → Missing values for `einkommen` must be numeric.
 *                    replace(einkommen, id = "P001", -9)          → unbenutztes Argument (id = "P001")
 *                    replace(einkommen, id == P001, -9)           → Objekt 'P001' nicht gefunden
 */
test('Missing-Codes: Mittelwerte der fünf und der 200 wie in R', () => {
  assert.deepEqual([...EINKOMMEN], [-9, 3850, 2762, -8, 1868]);
  assert.deepEqual(['keine', 'neun', 'beide'].map(o => { const m = missingMittel(o); return [m.summe, m.n]; }), [[8463, 5], [8472, 4], [8480, 3]]);
  assert.ok(close(missingMittel('keine').mittel, 1692.6, 1e-9) && close(missingMittel('neun').mittel, 2118, 1e-9) && close(missingMittel('beide').mittel, 2826.666667, 1e-6), 'Mittelwerte wie in R');
  assert.deepEqual(missingTools.apply(missingTools.rows, 'beide').rows.map(r => r.einkommen), ['NA(a)', 3850, 2762, 'NA(b)', 1868]);
  assert.deepEqual(missingTools.apply(missingTools.rows, 'neun').rows.map(r => r.einkommen), ['NA(a)', 3850, 2762, '−8', 1868]);
  assert.match(missingTools.check.diagnose('neun', 8472 / 5)!, /8\.472 \/ 4 = 2\.118\./);
  assert.match(missingTools.check.diagnose('beide', 2120)!, /8\.480 \/ 3 ≈ 2\.826,67\./);
  assert.match(missingTools.check.diagnose('keine', 8463 / 4)!, /8\.463 \/ 5 = 1\.692,6\./);
  assert.match(missingTools.wofuer, /1\.654 von 5\.246 Befragten .* bei −0,76 statt bei 3,95\./);
  assert.match(missingTools.rCode('beide'), /set_na\(einkommen = c\(-9, -8\)\)/);
  const m = mitCode(ctx(rows, 'einkommen'));
  assert.ok(close(m.ohne, 3147.613065, 1e-6) && close(m.mit, 3131.83, 1e-9), 'mit und ohne Code wie in R');
  const shifted = mitCode(ctx(applyOp(rows, 'einkommen', 'shift', 100), 'einkommen'));
  assert.ok(close(shifted.mit - m.mit, 99.5, 1e-9) && close(shifted.ohne - m.ohne, 100, 1e-9), 'um 100 € verschoben');
  const s = missingToolsTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const r = s.result(ctx(rows, 'einkommen'));
  assert.match(r.kurz, /bei 3\.131,83 €\. Als fehlend markiert sind es 3\.147,61 €, berechnet aus 199 gültigen Angaben\./);
  assert.match(r.zusatz!, /um 15,78 € nach unten/);
  const out = CATALOG_OUTPUT['missing_tools:0'].output;
  assert.match(out, /einkommen  3147\.613  1426\.790  199        1/);
});

/*
 * Weitergeben (P001 bis P005 mit erwerbstaetig und einkommen, P001 = -9 mit set_na() markiert), schreiben und wieder einlesen:
 *   five <- five %>% select(id, erwerbstaetig, einkommen) %>% mutate(einkommen = replace(einkommen, id == "P001", -9)) %>% set_na(einkommen = -9)
 *   five %>% write_spss("g.sav");  z <- read_spss("g.sav")      # 5 Personen mit Wertelabel, Variablenlabel da, na_frequencies: -9
 *   five %>% write_stata("g.dta"); z <- read_stata("g.dta")     # 5 mit Wertelabel, Variablenlabel da, Code .a
 *   five %>% write_xpt("g.xpt", version = 8, name = "atlas"); z <- read_xpt("g.xpt")   # 0 mit Wertelabel, Variablenlabel da, Code .a
 *   five %>% write_xlsx("g.xlsx"); z <- read_xlsx("g.xlsx")     # 5 mit Wertelabel, Variablenlabel da, Code -9 (Blätter Data, Labels)
 *   In allen vier Formaten bleiben 4 gültige Einkommen. atlas %>% write_xpt(…) in Version 5 bricht ab:
 *   SAS transport version 5 allows variable names of up to 8 characters; … methoden1 -> methoden …
 *   atlas %>% write_spss("ohne")                                 # `path` must end in ".sav" or ".zsav".
 *   Eine vorhandene atlas.sav oder atlas.xlsx wird ohne Rückfrage überschrieben.
 *   atlas %>% describe(lernzeit, show = mean)                    # `show` must be a character vector of statistic names.
 *   atlas %>% frequency(erwerbstaetig) %>% write_xlsx("haeufigkeit.xlsx")   # geht
 */
test('Weitergeben: was nach dem Wiedereinlesen ankommt, wie in R', () => {
  assert.deepEqual(Object.entries(FORMATE).map(([k, f]) => [k, f.wertelabels, f.code]), [['sav', true, '−9'], ['dta', true, '.a'], ['xpt', false, '.a'], ['xlsx', true, '−9']]);
  assert.deepEqual(dataExport.options.map(o => dataExport.check.answer(o.id)), [5, 5, 0, 5]);
  assert.deepEqual(dataExport.apply(dataExport.rows, 'xpt').rows.map(r => [r.erwerbstaetig, r.einkommen]), [[1, 'NA (.a)'], [1, 3850], [0, 2762], [1, 4604], [1, 1868]]);
  assert.deepEqual(dataExport.apply(dataExport.rows, 'sav').rows.map(r => r.erwerbstaetig), ['1 [Ja]', '1 [Ja]', '0 [Nein]', '1 [Ja]', '1 [Ja]']);
  assert.match(dataExport.rCode('xpt'), /write_xpt\("atlas\.xpt", version = 8, name = "atlas"\)/);
});

/*
 * Sortieren (P001 bis P005, Lernzeit und Wissenstest):
 *   five %>% arrange(lernzeit) %>% select(id, lernzeit, wissenstest)
 *   #   P001 6.0 12, P003 6.3 14, P005 6.8 11, P002 8.3 9, P004 10.5 13      (P002 an Position 4)
 *   five %>% arrange(desc(lernzeit)) %>% select(id, lernzeit, wissenstest)  # P004, P002, P005, P003, P001 (P002 an Position 2)
 *   five %>% mutate(lernzeit = sort(lernzeit)) %>% select(id, lernzeit, wissenstest)
 *   #   P001 6.0 12, P002 6.3 9, P003 6.8 14, P004 8.3 13, P005 10.5 11      (fremde Lernzeiten)
 *   median(five$lernzeit)                                        # 6.8
 *   s <- sort(atlas$lernzeit); s[c(1, 2, 100, 101, 200)]; median(s); length(unique(s))   # 0 0.9 7.6 7.6 18.4; 7.6; 99
 *   atlas %>% mutate(lernzeit = lernzeit + 1) %>% describe(lernzeit, show = c("min", "max"))   # Min 1.000, Max 19.400
 *   atlas %>% describe(lernzeit, show = "minimum")               # Unknown `show` value: "minimum".
 */
test('Sortieren: Reihenfolge, Positionen und die 200 wie in R', () => {
  const zeilen = (o: string) => sorting.apply(sorting.rows, o).rows.map(r => [r.person, r.lernzeit, r.wissenstest, r.os]);
  assert.deepEqual(zeilen('auf'), [['P001', '6', 12, 'x₍₁₎'], ['P003', '6,3', 14, 'x₍₂₎'], ['P005', '6,8', 11, 'x₍₃₎'], ['P002', '8,3', 9, 'x₍₄₎'], ['P004', '10,5', 13, 'x₍₅₎']]);
  assert.deepEqual(zeilen('ab'), [['P004', '10,5', 13, 'x₍₅₎'], ['P002', '8,3', 9, 'x₍₄₎'], ['P005', '6,8', 11, 'x₍₃₎'], ['P003', '6,3', 14, 'x₍₂₎'], ['P001', '6', 12, 'x₍₁₎']]);
  assert.deepEqual(zeilen('spalte'), [['P001', '6', 12, 'x₍₁₎'], ['P002', '6,3', 9, 'x₍₂₎'], ['P003', '6,8', 14, 'x₍₃₎'], ['P004', '8,3', 13, 'x₍₄₎'], ['P005', '10,5', 11, 'x₍₅₎']]);
  assert.deepEqual(['auf', 'ab', 'spalte'].map(positionP002), [4, 2, 2]);
  // Bild: Ganze Zeilen sortiert, bleiben alle Paare; nur die Spalte sortiert, wandern vier von fünf Punkten (P001 behält 6 h).
  assert.deepEqual(['auf', 'ab', 'spalte'].map(o => paare(o).filter(q => q.vorher.x !== q.nachher.x).length), [0, 0, 4]);
  assert.match(sorting.steps[2].was as string, /x₍₃₎ = 6,8 h\./);
  const r = reihe(rows.map(x => x.values.lernzeit));
  assert.deepEqual([r.n, r.min, r.unten, r.oben, r.max, r.median, r.verschieden], [200, 0, 7.6, 7.6, 18.4, 7.6, 99]);
  const s = sortingTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  const res = s.result(ctx(rows, 'lernzeit'));
  assert.match(res.kurz, /x₍₁₎ = 0 h und endet bei x₍₂₀₀₎ = 18,4 h\. Der Median, der mittlere Wert der Reihe nach, ist der Durchschnitt der Werte an den Positionen 100 und 101: 7,6 h\./);
  assert.match(res.zusatz!, /^Nur 99 der 200 Lernzeiten/);
  assert.equal(s.value!(ctx(applyOp(rows, 'lernzeit', 'shift', 1), 'lernzeit')), 1);
  const next = sortingTabs.next.next.why;
  assert.equal(typeof next === 'function' ? next(ctx(rows, 'lernzeit')) : next, 'Der mittlere Wert der Reihe nach: Bei den 200 Befragten liegt er bei 7,6 h, an den Positionen 100 und 101.');
  assert.equal(liveOutput({ fn: 'describe', show: ['min', 'max'] }, applyOp(rows, 'lernzeit', 'shift', 1), 'lernzeit').split('\n')[7], '  lernzeit  1.000  19.400  200        0');
});

/*
 * Codebuch (Lehrdatensatz):
 *   atlas %>% codebook(view = FALSE)          # 29 variables | 200 observations | 29 labelled; Types: 1 chr, 9 dbl, 19 lbl+dbl
 *   summary(atlas %>% codebook(view = FALSE)) # lernzeit: Values 0 - 18.4 (99 distinct); id: Label Befragten-ID
 *   atlas %>% find_var("lern")                # lernzeit, lernplanung5, lernzuversicht7, quelle_buch, quelle_video, quelle_kurs
 *   atlas %>% find_var("Bildung")             # nur weiterbildung
 *   table(atlas$geschlecht)                   # 0: 95, 1: 103, 2: 1, 3: 1
 *   allbus %>% find_var("Bundestag")          # pt03 VERTRAUEN: BUNDESTAG, pv01 BEFR.: WAHLABSICHT BUNDESTAGSWAHL
 *   Fehlermeldungen: codebook(view = FALSE) ohne Daten → Argument `data` is missing, with no default.
 *                    atlas %>% codebook(View = FALSE)  → Unknown argument `View` of `codebook()`.
 */
test('Codebuch: Zahlen der Karte, der Suche und des Eintrags wie in R', () => {
  // find_var() sucht ohne Rücksicht auf Groß- und Kleinschreibung in Namen und Variablenlabels.
  const find = (p: string) => surveyColumns.filter(c => `${c.id} ${savVariableLabel(c)}`.toLowerCase().includes(p.toLowerCase())).map(c => c.id);
  assert.deepEqual(find('lern'), ['lernzeit', 'lernplanung5', 'lernzuversicht7', 'quelle_buch', 'quelle_video', 'quelle_kurs']);
  assert.deepEqual(find('Bildung'), ['weiterbildung']);
  assert.equal(surveyColumns.length + 1, 29, '28 Fragen und die Kennung id');
  assert.equal(surveyColumns.filter(c => c.categories).length, 19, '19 Spalten mit Wertelabels');
  const e = eintrag(ctx(rows, 'lernzeit'));
  assert.deepEqual([e.n, e.fehlend, e.verschieden, e.min, e.max], [200, 0, 99, 0, 18.4]);
  assert.match(codebook.bausteine[2].was, /von 0 bis 18,4 Stunden, mit 99 verschiedenen Werten/);
  assert.match(codebook.stellDirVor.text, /5\.246 Befragte und 579 Spalten/);
  assert.match(codebook.ausprobieren[0].question, /bei 1\.596 Befragten der Code −11/);
  const s = codebookTabs.sample!;
  if (s.kind !== 'analysis') throw new Error('Auswertung erwartet');
  assert.equal(s.result(ctx(rows, 'lernzeit')).kurz, 'Die Spalte lernzeit trägt das Label „Wie viele Stunden haben Sie in den letzten sieben Tagen selbstständig gelernt?“ Die Antworten reichen von 0 bis 18,4 h, mit 99 verschiedenen Werten. Es fehlt keine Angabe.');
  assert.match(s.result(ctx(rows, 'geschlecht')).kurz, /verteilen sich auf 4 von 4 Antworten; am häufigsten ist „Weiblich“ mit 103\./);
  assert.match(s.result(ctx(rows, 'quelle_buch')).kurz, /trägt das Label „Lernquelle Buch“\. Die 200/);
  assert.equal(s.value!(ctx(applyOp(rows, 'lernzeit', 'reverse'), 'lernzeit')), 99);
  const out = CATALOG_OUTPUT['codebook:0'].output;
  assert.match(out, /29 variables \| 200 observations \| 29 labelled/);
  assert.match(out, /Types: 1 chr, 9 dbl, 19 lbl\+dbl/);
  // Jede Spalte des Lehrdatensatzes ergibt einen lesbaren Eintrag.
  for (const c of surveyColumns) { const r = s.result(ctx(rows, c.id)); assert.ok(!/NaN|undefined|Infinity/.test(r.kurz + r.fachlich + r.zusatz), c.id); }
});

/*
 * Einlesen (ALLBUS-Zahlen siehe den ALLBUS-Test unten):
 *   allbus %>% describe(pt03, show = "mean")      # Mean 3.947, N 3592, Missing 1654
 *   read_stata("atlas.sav")                       # `read_stata()` cannot read 'atlas.sav': it looks like an SPSS data file (.sav). Use `read_spss()` instead.
 *   read_spss("gibtsnicht.sav")                   # File 'gibtsnicht.sav' does not exist.
 *   openxlsx2::write_xlsx(data.frame(erwerbstaetig = c(1, 0), einkommen = c(-9, 3850)), "fremd.xlsx"); read_xlsx("fremd.xlsx")
 *   # ohne Labelblatt: <dbl> ohne Labels, -9 bleibt eine Zahl (Mittelwert 1920.5)
 */
test('Einlesen: die ALLBUS-Zahlen der Karte', () => {
  assert.equal(ALLBUS.pt03.gueltig + ALLBUS.pt03.fehlend, ALLBUS.befragte);
  assert.equal(ALLBUS.pt03.codes.reduce((a, c) => a + c.n, 0), ALLBUS.pt03.fehlend);
  assert.match(dataImport.stellDirVor.text, /5\.246 Befragte und 579 Spalten\..*3\.592 gültige Antworten, im Schnitt 3,95, ungewichtet\..*fiele auf −0,76\./);
  assert.match(dataImport.ausprobieren[1].explain, /^3\.592 und 1\.654 ergeben zusammen die 5\.246 Befragten\./);
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
  assert.equal(pt03.valueLabels.get(-11), 'TNZ: SPLIT');
  assert.equal(pt03.valueLabels.get(1), 'GAR KEIN VERTRAUEN');
  assert.equal(pt03.valueLabels.get(7), 'GROSSES VERTRAUEN');
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
