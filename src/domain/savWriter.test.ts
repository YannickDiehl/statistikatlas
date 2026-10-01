// Rundreise der SPSS-Systemdatei mit einem kleinen Leser (Format nach der PSPP-Dokumentation
// „System File Format“). Die Prüfung mit read_spss() und haven::read_sav() macht scripts/verify-sav.R.
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeSav, savVariableLabel, savMeasure, FILE_LABEL } from './savWriter';
import { createSurvey, surveyColumns, columnById } from './survey';

type Variable = { name: string; type: number; label?: string; print: number; segments: number; index: number };
type Parsed = {
  magic: string; product: string; layout: number; caseSize: number; compression: number; cases: number; bias: number; fileLabel: string;
  variables: Variable[]; valueLabels: { indexes: number[]; labels: Map<number, string> }[];
  longNames: Map<string, string>; encoding: string; display: number[]; integerInfo: number[]; rows: (string | number)[][];
};

/** Kleiner Leser für unkomprimierte Dateien in Little Endian. */
function readSav(bytes: Uint8Array): Parsed {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), dec = new TextDecoder('utf-8');
  let at = 0;
  const int = () => { const v = view.getInt32(at, true); at += 4; return v; };
  const dbl = () => { const v = view.getFloat64(at, true); at += 8; return v; };
  const str = (n: number) => { const v = dec.decode(bytes.subarray(at, at + n)); at += n; return v; };
  const raw = (n: number) => { const v = bytes.subarray(at, at + n); at += n; return v; };
  const magic = str(4), product = str(60), layout = int(), caseSize = int(), compression = int();
  int(); // Gewichtsvariable
  const cases = int(), bias = dbl();
  str(9); str(8);
  const fileLabel = str(64).trimEnd();
  raw(3);
  const variables: Variable[] = [], valueLabels: Parsed['valueLabels'] = [];
  let longNames = new Map<string, string>(), encoding = '', display: number[] = [], integerInfo: number[] = [], index = 0;
  for (;;) {
    const type = int();
    if (type === 2) {
      const width = int(), hasLabel = int(), missing = int(), print = int();
      int(); // Schreibformat
      const name = str(8).trimEnd();
      index += 1;
      if (width === -1) { variables[variables.length - 1].segments += 1; continue; }
      const variable: Variable = { name, type: width, print, segments: 1, index };
      if (hasLabel) { const n = int(); variable.label = str(n); raw((4 - (n % 4)) % 4); }
      assert.equal(missing, 0);
      variables.push(variable);
    } else if (type === 3) {
      const count = int(), labels = new Map<number, string>();
      for (let i = 0; i < count; i++) { const value = dbl(), n = bytes[at]; at += 1; labels.set(value, str(n)); raw((8 - ((n + 1) % 8)) % 8); }
      assert.equal(int(), 4);
      const vars = int(), indexes = Array.from({ length: vars }, int);
      valueLabels.push({ indexes, labels });
    } else if (type === 7) {
      const subtype = int(), size = int(), count = int(), body = raw(size * count), body32 = () => Array.from({ length: count }, (_, i) => new DataView(body.buffer, body.byteOffset + i * 4, 4).getInt32(0, true));
      if (subtype === 13) longNames = new Map(dec.decode(body).split('\t').map(pair => pair.split('=') as [string, string]));
      else if (subtype === 20) encoding = dec.decode(body);
      else if (subtype === 11) display = body32();
      else if (subtype === 3) integerInfo = body32();
    } else if (type === 999) { int(); break; }
    else throw new Error(`Unbekannter Satztyp ${type}`);
  }
  const rows: (string | number)[][] = [];
  for (let c = 0; c < cases; c++) rows.push(variables.map(v => v.type > 0 ? str(v.segments * 8).trimEnd() : dbl()));
  assert.equal(at, bytes.length, 'keine Bytes nach dem letzten Fall');
  return { magic, product, layout, caseSize, compression, cases, bias, fileLabel, variables, valueLabels, longNames, encoding, display, integerInfo, rows };
}

const rows = createSurvey(), sav = readSav(writeSav(rows, new Date(Date.UTC(2026, 9, 1, 12, 0, 0))));

test('header: uncompressed SPSS system file in little endian with 200 cases', () => {
  assert.equal(sav.magic, '$FL2');
  assert.match(sav.product, /^@\(#\) SPSS DATA FILE/);
  assert.equal(sav.layout, 2);
  assert.equal(sav.compression, 0);
  assert.equal(sav.cases, 200);
  assert.equal(sav.bias, 100);
  assert.equal(sav.caseSize, 29);
  assert.equal(sav.fileLabel, FILE_LABEL);
  assert.ok(FILE_LABEL.length <= 40, 'write_xpt() übernimmt höchstens 40 Zeichen');
  assert.equal(sav.variables.length, 29);
  assert.equal(sav.encoding, 'UTF-8');
  assert.equal(sav.integerInfo[7], 65001, 'Zeichenkodierung UTF-8 im Maschinensatz');
  assert.equal(sav.integerInfo[6], 2, 'Little Endian');
});

test('long names restore the 29 column names in the order of the CSV', () => {
  const names = sav.variables.map(v => sav.longNames.get(v.name));
  assert.deepEqual(names, ['id', ...surveyColumns.map(c => c.id)]);
  assert.equal(new Set(sav.variables.map(v => v.name)).size, 29, 'kurze Namen eindeutig');
  for (const v of sav.variables) assert.match(v.name, /^[A-Z][A-Z0-9_]{0,7}$/);
  assert.equal(sav.variables[0].type, 4, 'id als Zeichenkette');
  assert.ok(sav.variables.slice(1).every(v => v.type === 0), '28 numerische Variablen');
});

test('variable labels carry the question text, value labels the answer categories in UTF-8', () => {
  const byName = new Map(sav.variables.map(v => [sav.longNames.get(v.name)!, v]));
  assert.equal(byName.get('lernzeit')!.label, 'Wie viele Stunden haben Sie in den letzten sieben Tagen selbstständig gelernt?');
  assert.equal(byName.get('lernplanung5')!.label, 'Ich plane feste Zeiten zum Lernen ein.');
  assert.equal(byName.get('kurs_vor')!.label, savVariableLabel(columnById.kurs_vor));
  assert.notEqual(savVariableLabel(columnById.kurs_vor), savVariableLabel(columnById.kurs_nach), 'gleiche Frage, verschiedene Labels');
  assert.equal(byName.get('quelle_buch')!.label, 'Lernquelle Buch', 'Mehrfachauswahl: kurzes Label je Option');
  for (const c of surveyColumns) {
    const v = byName.get(c.id)!, set = sav.valueLabels.find(s => s.indexes.includes(v.index));
    if (!c.categories) { assert.equal(set, undefined, c.id); continue; }
    assert.deepEqual([...set!.labels], c.categories.map(k => [k.value, k.label]), c.id);
  }
  assert.equal(sav.valueLabels.find(s => s.indexes.includes(byName.get('lernplanung5')!.index))!.labels.get(1), 'Stimme überhaupt nicht zu');
});

test('measurement level and display width per variable', () => {
  assert.equal(sav.display.length, 29 * 3);
  const measure = (id: string) => sav.display[sav.variables.findIndex(v => sav.longNames.get(v.name) === id) * 3];
  assert.equal(measure('id'), 1);
  assert.equal(measure('geschlecht'), 1);
  assert.equal(measure('schulabschluss'), 2);
  assert.equal(measure('lernplanung5'), 2);
  assert.equal(measure('lernzeit'), 3);
  for (const c of surveyColumns) assert.equal(measure(c.id), savMeasure(c), c.id);
});

test('values of the first and the last respondent, including own changes', () => {
  for (const index of [0, 199]) {
    const row = rows[index];
    assert.deepEqual(sav.rows[index], [row.id, ...surveyColumns.map(c => row.values[c.id])]);
  }
  const edited = rows.map(r => r.id === 'P002' ? { ...r, values: { ...r.values, lernzeit: 40 } } : r);
  assert.equal(readSav(writeSav(edited)).rows[1][1 + surveyColumns.findIndex(c => c.id === 'lernzeit')], 40);
});

test('an empty or invalid cell becomes SYSMIS, which SPSS and haven read as missing', () => {
  // Im Atlas können Zellen nicht leer werden (validSurvey); der Zweig schützt die Datei trotzdem vor NaN.
  const lernzeit = 1 + surveyColumns.findIndex(c => c.id === 'lernzeit');
  const empty = rows.map(r => r.id === 'P003' ? { ...r, values: { ...r.values, lernzeit: Number.NaN } } : r);
  assert.equal(readSav(writeSav(empty)).rows[2][lernzeit], -Number.MAX_VALUE);
});
