import test from 'node:test';
import assert from 'node:assert/strict';
import { BANNED_WORDS, sentences, styleProblems } from './style';

const words = (n: number) => Array.from({ length: n }, (_, i) => (i === 0 ? 'Wort' : 'wort')).join(' ') + '.';
const has = (problems: string[], part: string) => problems.some(p => p.includes(part));

test('Regel 5: abwertende Wörter werden gemeldet, Fachbegriffe mit ähnlichem Wortstamm nicht', () => {
  assert.ok(has(styleProblems('Das ist einfach.'), '„einfach“'));
  assert.ok(has(styleProblems('Natürlich ist s nie negativ.'), '„natürlich“'));
  assert.ok(has(styleProblems('Hier ist es leicht zu sehen.'), '„leicht zu sehen“'));
  for (const w of BANNED_WORDS) assert.ok(styleProblems(`Das ist ${w}.`).length > 0, w);
  assert.deepEqual(styleProblems('Die Formel gilt für einfache Zufallsstichproben.'), []);
  assert.deepEqual(styleProblems('Wir zählen die natürlichen Zahlen.'), []);
});

test('Regel 4: Satzlänge nur, wenn maxWords gesetzt ist', () => {
  assert.ok(has(styleProblems(words(26), { maxWords: 25 }), 'Satzlänge'));
  assert.deepEqual(styleProblems(words(25), { maxWords: 25 }), []);
  assert.deepEqual(styleProblems(words(26)), []);
  // Zeichen ohne Buchstaben oder Ziffern zählen nicht als Wort.
  assert.deepEqual(styleProblems('(−4)² = 16 · 1 + 0.', { maxWords: 4 }), []);
});

test('Regel 11: Mittelpunkt nur als Malzeichen, echtes Minus vor Zahlen', () => {
  assert.ok(has(styleProblems('Mittelwert · Varianz'), 'Mittelpunkt'));
  assert.ok(has(styleProblems('Lernplanung · 5 Stufen'), 'Mittelpunkt'));
  assert.ok(has(styleProblems('Schritt 2 · Abweichung'), 'Mittelpunkt'));
  assert.deepEqual(styleProblems('3 · 4'), []);
  assert.deepEqual(styleProblems('Teile durch sₓ · sᵧ, also 1,58 · 1,58.'), []);
  assert.deepEqual(styleProblems('x̄ − 1,96 · SE'), []);
  assert.ok(has(styleProblems('-4'), 'Minus'));
  assert.ok(has(styleProblems('Im Taschenrechner: (-4)² = 16.'), 'Minus'));
  assert.ok(has(styleProblems('Die Abweichung ist -2,5.'), 'Minus'));
  assert.deepEqual(styleProblems('Die Abweichung ist −4.'), []);
  // Bindestriche in Wörtern und Spannen mit Halbgeviertstrich bleiben erlaubt.
  assert.deepEqual(styleProblems('Die Links-rechts-Skala reicht von 1 bis 10, das 95-%-Intervall auch.'), []);
});

test('Regel 3: „Kurz gesagt“ mit drei Sätzen meldet bei maxSentences 2', () => {
  assert.ok(has(styleProblems('Eins. Zwei. Drei.', { maxSentences: 2 }), 'Sätze'));
  assert.deepEqual(styleProblems('Eins. Zwei.', { maxSentences: 2 }), []);
  assert.deepEqual(styleProblems('Eins. Zwei. Drei.'), []);
});

test('sentences: Satzenden, Abkürzungen, Zahlen und Anführungszeichen', () => {
  assert.deepEqual(sentences('Wir teilen durch 4. Das ist n − 1.'), ['Wir teilen durch 4.', 'Das ist n − 1.']);
  assert.deepEqual(sentences('Mehr dazu steht unter „Genau genommen“. Dann weiter.'), ['Mehr dazu steht unter „Genau genommen“.', 'Dann weiter.']);
  assert.deepEqual(sentences('Zum Beispiel 3,16 oder 1.550,3 Stunden, z. B. bei Gruppe B.'), ['Zum Beispiel 3,16 oder 1.550,3 Stunden, z. B. bei Gruppe B.']);
  assert.deepEqual(sentences('Wirklich? Ja! Gut.'), ['Wirklich?', 'Ja!', 'Gut.']);
  assert.deepEqual(sentences('Ohne Punkt am Ende'), ['Ohne Punkt am Ende']);
  assert.deepEqual(sentences(''), []);
});

test('mehrere Probleme in einem Text werden alle gemeldet', () => {
  const problems = styleProblems('Das ist natürlich einfach. Mittelwert · Varianz -4.', { maxSentences: 1 });
  for (const part of ['„natürlich“', '„einfach“', 'Mittelpunkt', 'Minus', 'Sätze']) assert.ok(has(problems, part), part);
});
