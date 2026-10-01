// Allgemeine Codelegende: Pflichtzeichen, Aussprache, typische Fehler und Sprachleitfaden
// (Ausbau-Spezifikation, Abschnitt 2). Die Prüfung der Sprachregeln ist hier lokal, weil
// src/explain/style.ts parallel entsteht; der Koordinator kann sie beim Zusammenführen ersetzen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { RTOKENS, RTOKEN_CONCEPTS } from './rTokens';
import { titleFor, ref } from './learning';
import { conceptById } from './concepts';
import { exampleVariants, analysisCode } from './mariposa';

const BANNED = ['einfach', 'offensichtlich', 'trivial', 'natürlich', 'bekanntlich', 'leicht zu sehen'];
/** Sprachregeln mit [Test]: keine Abwertung, kein „·“ als Trenner neben Wörtern, echtes Minus vor Zahlen. */
function styleProblems(text: string): string[] {
  const problems: string[] = [];
  for (const word of BANNED) if (new RegExp(`(^|[^\\p{L}])${word}`, 'iu').test(text)) problems.push(`„${word}“`);
  if (/\p{L}\s*·|·\s*\p{L}/u.test(text)) problems.push('„·“ als Trenner');
  if (/(^|[\s(=,;:])-\d/.test(text)) problems.push('Bindestrich statt Minus');
  return problems;
}
const sentences = (text: string) => (text.match(/[.!?](?=\s|$)/g) || []).length;
const words = (sentence: string) => sentence.split(/\s+/).filter(Boolean).length;

test('the legend covers the shared tokens of every call, with pronunciation where needed', () => {
  for (const key of ['library', '<-', 'read_spss', '%>%', 'mutate', 'rec', 'summary', 'c', 'show', 'weights', 'group', 'use', 'conf.level', 'mu', 'by'])
    assert.ok(RTOKENS[key], key);
  assert.equal(RTOKENS['<-'].say, 'bekommt');
  assert.equal(RTOKENS['%>%'].say, 'und dann');
  assert.match(RTOKENS['%>%'].fehler, /konnte Funktion "%>%" nicht finden/);
  assert.match(RTOKENS.read_spss.fehler, /does not exist/);
  assert.match(RTOKENS.library.fehler, /es gibt kein Paket namens/);
});

test('every card has term, Kurz gesagt in at most two sentences and a typical mistake, in the tone of the guide', () => {
  for (const [key, note] of Object.entries(RTOKENS)) {
    assert.ok(note.sym && note.term && note.kurz && note.fehler, key);
    assert.ok(sentences(note.kurz) <= 2, `${key}: höchstens zwei Sätze in „Kurz gesagt“`);
    for (const text of [note.term, note.kurz, note.fehler, note.say || '']) {
      assert.deepEqual(styleProblems(text), [], `${key}: ${text}`);
      for (const sentence of text.split(/(?<=[.!?])\s+/)) assert.ok(words(sentence) <= 25, `${key}: Satz zu lang`);
    }
  }
});

test('linked tokens use the title of their concept as the term', () => {
  for (const [key, id] of Object.entries(RTOKEN_CONCEPTS)) {
    assert.ok(conceptById[id], id);
    assert.ok(RTOKENS[key], key);
    assert.equal(RTOKENS[key].term, titleFor(ref(id)), key);
  }
});

test('the local style check catches the banned words and separators', () => {
  assert.deepEqual(styleProblems('Das ist einfach.'), ['„einfach“']);
  assert.deepEqual(styleProblems('Lernplanung · 5 Stufen'), ['„·“ als Trenner']);
  assert.deepEqual(styleProblems('Der Code -9 fehlt.'), ['Bindestrich statt Minus']);
  assert.deepEqual(styleProblems('2 · 3 = 6 und −9'), []);
});

test('the argument tokens of the legend appear in the generated calls', () => {
  const code = exampleVariants().map(v => analysisCode(v.entry, v.settings)).join('\n');
  for (const key of ['library', '<-', 'read_spss', '%>%', 'mutate', 'rec', 'rules', 'summary', 'c', 'show', 'weights', 'group', 'use', 'conf.level', 'mu', 'alternative', 'var.equal', 'p_adjust', 'na.rm', 'suffix', 'pick', 'pull', 'head', 'select', 'starts_with', 'filter', '==', '~', 'TRUE', 'FALSE', 'predict'])
    assert.ok(code.includes(key), key);
});
