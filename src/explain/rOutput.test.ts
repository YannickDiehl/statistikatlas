// Druckformat von mariposa 0.7.4, zeichengenau gegen die mit R erfassten Referenzausgaben
// (scripts/capture-r-output.R → src/explain/fixtures/r-output). Ändert eine künftige mariposa-Version
// ihr Format, schlägt dieser Test nach erneutem Erfassen fehl; das ist gewollt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describeOutput, pearsonOutput, covOutput, frequencyOutput, cFixed, CATALOG_OUTPUT } from './rOutput';
import { createSurvey, columnById, type SurveyRow } from '../domain/survey';
import { savVariableLabel } from '../domain/savWriter';
import { analysisCode, exampleVariants } from '../domain/mariposa';

/** Referenztext ohne den Zeilenumbruch, den writeLines() anhängt. */
const fixture = (name: string) => readFileSync(new URL(`./fixtures/r-output/${name}.txt`, import.meta.url), 'utf8').replace(/\n$/, '');
const base = createSurvey();
const states: Record<string, SurveyRow[]> = {
  ausgang: base,
  plus1: base.map(r => ({ ...r, values: { ...r.values, lernzeit: r.values.lernzeit + 1 } })),
  p002_40: base.map(r => r.id === 'P002' ? { ...r, values: { ...r.values, lernzeit: 40 } } : r),
};
const column = (rows: SurveyRow[], id: string) => rows.map(r => r.values[id]);
const labelsOf = (id: string) => Object.fromEntries((columnById[id].categories || []).map(k => [k.value, k.label]));
const frequency = (rows: SurveyRow[], id: string) => frequencyOutput(column(rows, id), labelsOf(id), id, savVariableLabel(columnById[id]));
function cov(x: number[], y: number[]) {
  const mx = x.reduce((a, b) => a + b, 0) / x.length, my = y.reduce((a, b) => a + b, 0) / y.length;
  return x.reduce((a, xi, i) => a + (xi - mx) * (y[i] - my), 0) / (x.length - 1);
}

for (const [state, rows] of Object.entries(states)) {
  test(`lead calls print like mariposa 0.7.4: ${state}`, () => {
    const lernzeit = { lernzeit: column(rows, 'lernzeit') };
    assert.equal(describeOutput(lernzeit, ['lernzeit'], ['mean']), fixture(`${state}--describe-mean`));
    assert.equal(describeOutput(lernzeit, ['lernzeit'], ['mean', 'var']), fixture(`${state}--describe-mean-var`));
    assert.equal(describeOutput(lernzeit, ['lernzeit'], ['mean', 'sd', 'var']), fixture(`${state}--describe-mean-sd-var`));
    assert.equal(describeOutput(lernzeit, ['lernzeit'], ['mean', 'sd', 'se']), fixture(`${state}--describe-mean-sd-se`));
    assert.equal(pearsonOutput(column(rows, 'lernzeit'), column(rows, 'wissenstest'), 'lernzeit', 'wissenstest'), fixture(`${state}--pearson`));
    assert.equal(covOutput('kovarianz', cov(column(rows, 'lernzeit'), column(rows, 'wissenstest'))), fixture(`${state}--kovarianz`));
    assert.equal(frequency(rows, 'lernplanung5'), fixture(`${state}--frequency`));
  });
}

test('the sd of the base data reads 3.238 and the pilot numbers stay as in the spec', () => {
  assert.match(fixture('ausgang--describe-mean-sd-var'), /lernzeit {2}7\.752 {2}3\.238 {4}10\.482 {2}200 {8}0/);
  assert.match(fixture('ausgang--pearson'), /r = 0\.539, p < 0\.001 \*\*\*, N = 200/);
});

test('extra cases: two variables, split wide tables, p-value stars, wrapped labels, no value labels', () => {
  const rows = base, data = Object.fromEntries(['lernzeit', 'einkommen', 'statistikinteresse10'].map(id => [id, column(rows, id)]));
  assert.equal(describeOutput(data, ['lernzeit', 'einkommen'], ['mean', 'sd', 'var', 'se']), fixture('zusatz--describe-zwei-variablen'));
  assert.equal(describeOutput(data, ['einkommen', 'statistikinteresse10'], ['mean', 'sd', 'var', 'se', 'min', 'max', 'range']), fixture('zusatz--describe-breit'));
  assert.equal(pearsonOutput(column(rows, 'haushaltsgroesse'), column(rows, 'lernzeit'), 'haushaltsgroesse', 'lernzeit'), fixture('zusatz--pearson-zwei-sterne'));
  assert.equal(pearsonOutput(column(rows, 'lernzeit'), column(rows, 'schlafdauer'), 'lernzeit', 'schlafdauer'), fixture('zusatz--pearson-negativ'));
  assert.equal(pearsonOutput(column(rows, 'einkommen'), column(rows, 'alter'), 'einkommen', 'alter'), fixture('zusatz--pearson-nahe-null'));
  assert.equal(frequency(rows, 'schulabschluss'), fixture('zusatz--frequency-schulabschluss'));
  assert.equal(frequency(rows, 'geschlecht'), fixture('zusatz--frequency-geschlecht'));
  assert.equal(frequency(rows, 'wissenstest'), fixture('zusatz--frequency-wissenstest'));
});

test('a 1 × 1 tibble prints its number like pillar with three significant digits', () => {
  const cases = JSON.parse(readFileSync(new URL('./fixtures/r-output/tibble.json', import.meta.url), 'utf8')) as { value: number; output: string }[];
  assert.ok(cases.length >= 30);
  for (const { value, output } of cases) assert.equal(covOutput('kovarianz', value), output, String(value));
});

test('formatC rounds the exact binary value, ties to even, like C printf', () => {
  assert.equal(cFixed(0.125, 2), '0.12');
  assert.equal(cFixed(0.375, 2), '0.38');
  assert.equal(cFixed(2.675, 2), '2.67');
  assert.equal(cFixed(-0.0004, 3), '-0.000');
  assert.equal(cFixed(100, 2), '100.00');
  assert.equal(cFixed(7.7515, 3), '7.752');
});

test('pearson without variance or with too few cases prints the mariposa note', () => {
  assert.match(pearsonOutput([1, 1, 1, 1], [1, 2, 3, 4], 'x', 'y'), /not computed \(no variance\), N = 4/);
  assert.match(pearsonOutput([1, 2], [2, 1], 'x', 'y'), /not computed \(too few valid cases\), N = 2/);
});

test('the catalog output holds the code and the R output of all 110 examples', () => {
  const examples = exampleVariants();
  assert.equal(Object.keys(CATALOG_OUTPUT).length, 110);
  for (const { entry, settings } of examples) {
    const key = `${entry.id}:${settings.variant}`, captured = CATALOG_OUTPUT[key];
    assert.ok(captured, key);
    assert.equal(captured.code, analysisCode(entry, settings), `${key}: catalog.json neu erfassen (scripts/capture-r-output.R)`);
    assert.doesNotMatch(captured.output, /^(Error|Fehler) in/m, key);
  }
  assert.match(CATALOG_OUTPUT['describe:0'].output, /Descriptive Statistics/);
  assert.match(CATALOG_OUTPUT['sd:0'].output, /3\.238/);
  assert.match(CATALOG_OUTPUT['recode:0'].output, /lernplanung5_umgepolt/);
  assert.equal(CATALOG_OUTPUT['data_import:1'].output, '', 'POR braucht eine fremde Datei und wird nicht ausgeführt');
});
