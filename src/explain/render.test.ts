import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Formelwerkstatt, StepCard } from '../components/explain/Formelwerkstatt';
import { FormelAlsSatz } from '../components/explain/FormelAlsSatz';
import { Werkzeug } from '../components/explain/Werkzeug';
import { explainFor, stepCardFor, WORKSHOPS } from './registry';
import { standardfehler } from './content/standardfehler';
import { rekodieren } from './content/rekodieren';
import { modeStore } from './mode';

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const sound = (html: string, label: string) => assert.ok(!/NaN|undefined|Infinity|\[object/.test(text(html)), `${label}: kaputter Wert`);

test('every workshop variant renders all blocks in Ausführlich and fewer in Kompakt', () => {
  for (const w of WORKSHOPS) for (const variant of Object.keys(w.variants)) {
    modeStore.set('ausfuehrlich');
    const full = renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: w, variant, onConcept: noop }));
    sound(full, `${w.id}/${variant}`);
    for (const part of ['Wofür?', 'Kurz gesagt', 'Die Zeichen, bevor es losgeht', 'Schritt 1', 'Fachbegriff', 'Die Rechentabelle', 'Das Bild dazu', 'Kurz prüfen: Schritt 1', 'Was heißt das Ergebnis?', 'Mit der Formel denken', 'Genau genommen'])
      assert.ok(text(full).includes(part), `${w.id}/${variant}: „${part}“ fehlt`);
    assert.ok(full.includes('role="img"') && full.includes(`aria-label="${w.variants[variant].aria}"`), `${w.id}/${variant}: vorlesbare Formel fehlt`);
    modeStore.set('kompakt');
    const compact = text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: w, variant, onConcept: noop })));
    for (const part of ['Kurz gesagt', 'Fachbegriff', 'Das Bild dazu']) assert.ok(compact.includes(part), `${w.id}/${variant} kompakt: „${part}“ fehlt`);
    for (const part of ['Die Rechentabelle', 'Kurz prüfen', 'Mit der Formel denken', 'Wie im Alltag']) assert.ok(!compact.includes(part), `${w.id}/${variant} kompakt: „${part}“ sollte fehlen`);
  }
  modeStore.set('ausfuehrlich');
});

test('step cards name their term and offer the jump into their workshop', () => {
  const html = text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('deviation', 'pearson')!, onConcept: noop, onOpen: noop })));
  assert.ok(html.includes('Abweichung vom Mittelwert') && html.includes('Ist Schritt 2 von 6 der Werkstatt Pearson-Korrelation'));
  const ss = text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('ss')!, onConcept: noop, onOpen: noop })));
  assert.ok(ss.includes('Quadratsumme der Abweichungen') && ss.includes('Ist Schritt 4 von 6 der Werkstatt Standardabweichung'));
});

test('Stufe 2 and Stufe 3 templates render their blocks', () => {
  assert.equal(explainFor('se')?.kind, 'satz');
  const se = renderToStaticMarkup(createElement(FormelAlsSatz, { template: standardfehler, onConcept: noop }));
  sound(se, 'se');
  for (const part of ['Als Satz gelesen', 'Ein Regler je Zeichen', 'Vorgerechnet', 'Kurz prüfen', 'Genau genommen', '0,013']) assert.ok(text(se).includes(part), `se: „${part}“ fehlt`);
  const rec = renderToStaticMarkup(createElement(Werkzeug, { template: rekodieren, onConcept: noop }));
  sound(rec, 'recode');
  for (const part of ['Die Fachbegriffe', 'Die Zeichen der Regel', 'So liest rec() deine Regel', 'Vorher und nachher', 'rules = "rev"', 'Aus 4 wird 2.', '3,3'])
    assert.ok(text(rec).includes(part), `recode: „${part}“ fehlt`);
});
