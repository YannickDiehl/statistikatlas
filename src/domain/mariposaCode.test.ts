// Codestil der R-Aufrufe (Spezifikation Lehrdatensatz und R, Abschnitt 7):
// Startblock mit library(dplyr), library(mariposa) und read_spss(), dann Pipe-Stil;
// kein Basis-R-Umkodieren, kein read.csv2, keine veraltete Versionsangabe.
import test from 'node:test';
import assert from 'node:assert/strict';
import { analysisCode, exampleVariants, initialRSettings, scriptFor, startBlock, SAV_NAME } from './mariposa';
import { entryById } from './mariposaCatalog';

/** POR- und native SAS-Dateien kann mariposa nicht schreiben; diese Aufrufe lesen eine fremde Datei ein. */
const readsForeignFile = (fn: string) => fn === 'read_por' || fn === 'read_sas';

test('the start block loads dplyr and mariposa and reads the SPSS file of the atlas', () => {
  assert.equal(SAV_NAME, 'Statistikatlas-200-Befragte.sav');
  assert.equal(startBlock(), 'library(dplyr)\nlibrary(mariposa)\n\natlas <- read_spss("Statistikatlas-200-Befragte.sav")');
});

test('every catalog call starts with the start block and uses the pipe without base-R recoding', () => {
  const examples = exampleVariants();
  assert.equal(examples.length, 110);
  for (const { entry, variant, settings } of examples) {
    const code = analysisCode(entry, settings), label = `${entry.id}: ${variant.label}`;
    assert.ok(code.startsWith(startBlock() + '\n\n'), label);
    if (!readsForeignFile(variant.fn)) assert.match(code, /atlas %>%\n/, label);
    assert.doesNotMatch(code, /\bd\$/, label);
    assert.doesNotMatch(code, /\bd <- /, label);
    assert.doesNotMatch(code, /(^|[^_a-z])factor\(/, label);
    assert.doesNotMatch(code, /read\.csv2/, label);
    assert.doesNotMatch(code, /ifelse\(/, label);
    assert.doesNotMatch(code, /0\.7\.2/, label);
    assert.doesNotMatch(code, /UNKNOWN_|\{[a-z_]+\}/, label);
    const script = scriptFor(entry, settings);
    assert.doesNotMatch(script, /stopifnot/, label);
    assert.ok(script.includes(startBlock()), label);
    assert.ok(script.includes(code.slice(startBlock().length).trim()), label);
  }
});

test('unit weights are created with mutate() and explained in the variant text', () => {
  for (const { entry, variant, settings } of exampleVariants()) {
    if (!/weights = gewicht/.test(variant.code)) continue;
    assert.match(analysisCode(entry, settings), /mutate\(gewicht = 1\) %>%/, entry.id);
    assert.equal(variant.note, 'Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew.', entry.id);
  }
});

test('groups use the value labels of the .sav file directly', () => {
  const code = analysisCode(entryById.t_test, initialRSettings(entryById.t_test));
  assert.match(code, /atlas %>%\n {2}t_test\(lernzeit, group = weiterbildung, var\.equal = FALSE\)$/);
  assert.doesNotMatch(code, /gruppe|rec\(/);
});

test('categorical predictors with more than two categories become factors with rec() inside mutate()', () => {
  const lm = entryById.linear_regression, settings = initialRSettings(lm);
  settings.columns.predictors = ['lernzeit', 'geschlecht'];
  const code = analysisCode(lm, settings);
  assert.match(code, /modell <- atlas %>%\n {2}mutate\(geschlecht = rec\(geschlecht, rules = "else=copy", as_factor = TRUE\)\) %>%\n {2}linear_regression\(wissenstest ~ lernzeit \+ geschlecht/);
  // 0/1-Indikatoren bleiben Zahlen; die Koeffizienten sind dieselben wie mit einem Faktor.
  settings.columns.predictors = ['lernzeit', 'weiterbildung'];
  assert.doesNotMatch(analysisCode(lm, settings), /rec\(/);
});

test('rank variants rank inside mutate() before the call', () => {
  const code = analysisCode(entryById.pearson, { variant: 0, columns: { x: ['schulabschluss'], y: ['finanzlage'] } }, true);
  assert.match(code, /atlas %>%\n {2}mutate\(\n {4}schulabschluss = rank\(schulabschluss, ties\.method = "average"\),\n {4}finanzlage = rank\(finanzlage, ties\.method = "average"\)\n {2}\) %>%\n {2}pearson_cor\(schulabschluss, finanzlage/);
});
