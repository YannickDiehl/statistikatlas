import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { conceptById } from '../domain/concepts';
import { Formelwerkstatt, mergePictures, PICTURES, StepCard } from '../components/explain/Formelwerkstatt';
import { FormelAlsSatz } from '../components/explain/FormelAlsSatz';
import { Werkzeug } from '../components/explain/Werkzeug';
import { Begriffskarte } from '../components/explain/Begriffskarte';
import { TabellenWerkzeug } from '../components/explain/TabellenWerkzeug';
import { Explanation, EXPLAIN_LABEL } from '../components/explain/Explanation';
import { AreaUnder, Axis, Bar, Curve, DragPoint, forCard, forSentence, forTable, forWorkshop, GridCell, linear, MarkLine } from '../components/explain/pictures/kit';
import { pictureFor } from '../components/explain/pictures/register';
import { EXPLANATIONS, explainFor, STEP_CARD_IDS, stepCardFor, WORKSHOPS } from './registry';
import { standardfehler } from './content/standardfehler';
import { rekodieren } from './content/rekodieren';
import { pWert } from './content/muster/p-wert';
import { dummy } from './content/muster/dummy';
import { modeStore } from './mode';

const noop = () => {};
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const sound = (html: string, label: string) => assert.ok(!/NaN|undefined|Infinity|\[object/.test(text(html)), `${label}: kaputter Wert`);
const both = (render: () => string) => {
  try { modeStore.set('ausfuehrlich'); const full = render(); modeStore.set('kompakt'); return { full, compact: render() }; }
  finally { modeStore.set('ausfuehrlich'); }
};

test('every workshop variant renders the new learn card in Ausführlich and fewer blocks in Kompakt', () => {
  for (const w of WORKSHOPS) for (const variant of Object.keys(w.variants)) {
    const { full, compact } = both(() => renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: w, variant, onConcept: noop })));
    sound(full, `${w.id}/${variant}`);
    const t = text(full), step = w.steps[0];
    for (const part of ['Wofür?', 'Kurz gesagt', w.mut, `Schritt 1 von ${w.variants[variant].lastStep}`, step.title, 'Was passiert?', 'Rechnung', 'Das nennt man', conceptById[step.concept].title,
      'In der Fachsprache', 'Warum?', 'Aufgepasst', 'Die Rechentabelle', 'Das Bild dazu', 'Probier es selbst', 'Nachsehen', 'Was heißt das Ergebnis?', 'Mit der Formel denken', 'Genau genommen', 'Alle Zeichen auf einen Blick'])
      assert.ok(t.includes(part), `${w.id}/${variant}: „${part}“ fehlt`);
    assert.match(t, /noch \d+ kleine Schritte|noch 1 kleiner Schritt/, `${w.id}/${variant}: Fortschritt fehlt`);
    assert.ok(full.includes('class="xw-mut"'), `${w.id}/${variant}: Mut-Kasten fehlt`);
    assert.ok(full.includes('<details class="xw-glyphs">') && !full.includes('<details class="xw-glyphs" open'), `${w.id}/${variant}: Zeichenübersicht nicht zugeklappt`);
    assert.ok(t.indexOf('Alle Zeichen auf einen Blick') > t.indexOf('Genau genommen'), `${w.id}/${variant}: Zeichenübersicht steht nicht am Ende`);
    assert.ok(full.includes('role="img"') && full.includes(`aria-label="${w.variants[variant].aria}"`), `${w.id}/${variant}: vorlesbare Formel fehlt`);
    w.steps.slice(0, w.variants[variant].lastStep).forEach((st, i) => assert.ok(t.includes(`Schritt ${i + 1} ${st.title} ${st.button}`), `${w.id}/${variant}: Schrittknopf ${i + 1} zeigt nicht Schritt, Titel und Zeichen`));
    const c = text(compact);
    for (const part of ['Kurz gesagt', 'Was passiert?', 'Rechnung', 'Das nennt man', 'Das Bild dazu']) assert.ok(c.includes(part), `${w.id}/${variant} kompakt: „${part}“ fehlt`);
    for (const part of ['Die Rechentabelle', 'Probier es selbst', 'Mit der Formel denken', 'Warum?', 'Aufgepasst', 'Wie im Alltag']) assert.ok(!c.includes(part), `${w.id}/${variant} kompakt: „${part}“ sollte fehlen`);
  }
});

test('every picture key of every explanation is in the register with the right kind, and keys are unique', () => {
  for (const w of WORKSHOPS) assert.equal(PICTURES[w.picture]?.kind, 'werkstatt', `${w.id}: Bild „${w.picture}“ fehlt in PICTURES oder ist kein Werkstattbild (forWorkshop)`);
  for (const [id, e] of Object.entries(EXPLANATIONS)) {
    const key = e.kind === 'begriff' ? e.card.picture : e.kind === 'satz' ? e.template.picture : e.kind === 'tabelle' ? e.tool.picture : undefined;
    const maker = { begriff: 'forCard', satz: 'forSentence', tabelle: 'forTable' }[e.kind as string];
    if (key !== undefined) assert.equal(PICTURES[key]?.kind, e.kind, `${id}: Bild „${key}“ fehlt in PICTURES oder ist nicht mit ${maker} gebaut`);
  }
  assert.deepEqual(['mittel', 'streuung', 'zusammenhang'].filter(k => !PICTURES[k]), []);
  assert.equal(pictureFor('mittel', 'begriff'), null, 'falsche Art liefert kein Bild');
  assert.equal(pictureFor('gibtsnicht', 'werkstatt'), null);
  assert.throws(() => mergePictures({ pilot: { a: forWorkshop(() => null) }, b05: { a: forCard(() => null) } }), /Bild „a“ ist doppelt vergeben: pilot und b05/);
});

test('pictures show in every template: card with its slider value, sentence with its values, table with before and after', () => {
  // Begriffskarte: das echte Bild des p-Werts, gesteuert vom Regler.
  const card = text(renderToStaticMarkup(createElement(Begriffskarte, { card: pWert, onConcept: noop })));
  assert.ok(card.includes('Das Bild dazu') && card.includes('Markierte Fläche: p ≈ 0,88') && card.includes('t, wenn es keinen Unterschied gäbe'), 'Bild der Begriffskarte fehlt');
  assert.ok(card.indexOf('Das Bild dazu') < card.indexOf('Das nennt man') && card.indexOf(pWert.regler!.label) < card.indexOf('Das nennt man'), 'Bild und Regler stehen nach „Stell dir vor“');
  assert.equal(card.split(pWert.regler!.label).length, 2, 'der Regler steht nur einmal da');
  // Formel als Satz und Tabellen-Werkzeug mit vorübergehend eingetragenen Bildern.
  PICTURES['test-satz'] = forSentence(p => createElement('svg', { 'aria-label': `Satzbild ${p.mark} ${p.values.n} ${typeof p.s.se}` }));
  PICTURES['test-tabelle'] = forTable(p => createElement('svg', { 'aria-label': `Tabellenbild ${p.option} ${p.before.rows.length} ${p.after.columns.length}` }));
  try {
    const se = renderToStaticMarkup(createElement(FormelAlsSatz, { template: { ...standardfehler, picture: 'test-satz' }, onConcept: noop }));
    assert.ok(se.includes('aria-label="Satzbild s 5225 number"'), 'Bild der Formel als Satz fehlt');
    const tool = renderToStaticMarkup(createElement(TabellenWerkzeug, { tool: { ...dummy, picture: 'test-tabelle' }, onConcept: noop }));
    assert.ok(tool.includes('aria-label="Tabellenbild 0 5 6"'), 'Bild des Tabellen-Werkzeugs fehlt');
    assert.ok(!renderToStaticMarkup(createElement(FormelAlsSatz, { template: { ...standardfehler, picture: 'test-tabelle' }, onConcept: noop })).includes('Tabellenbild'), 'Bild der falschen Art erscheint nicht');
  } finally { delete PICTURES['test-satz']; delete PICTURES['test-tabelle']; }
});

test('step cards name their term and offer the jump into their workshop', () => {
  const html = text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('deviation', 'pearson')!, current: 'deviation', onConcept: noop, onOpen: noop })));
  assert.ok(html.includes('Abweichung vom Mittelwert') && html.includes('Ist Schritt 2 von 6 der Werkstatt Pearson-Korrelation'));
  assert.ok(html.includes('Abstände messen') && html.includes('Das nennt man'));
  assert.ok(!html.includes('Begriff öffnen'), 'Schrittkarte verlinkt nicht auf sich selbst');
  modeStore.set('kompakt');
  try { assert.ok(text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('ss')!, current: 'ss', onConcept: noop, onOpen: noop }))).includes('Aufgepasst'), 'Schrittkarte bleibt vollständig'); }
  finally { modeStore.set('ausfuehrlich'); }
  const ss = text(renderToStaticMarkup(createElement(StepCard, { card: stepCardFor('ss')!, current: 'ss', onConcept: noop, onOpen: noop })));
  assert.ok(ss.includes('Quadratsumme der Abweichungen') && ss.includes('Ist Schritt 4 von 6 der Werkstatt Standardabweichung'));
});

test('every registered step card renders for every anchor and opens a registered workshop concept', () => {
  assert.ok(STEP_CARD_IDS.length >= 8);
  for (const id of STEP_CARD_IDS) for (const anchor of [undefined, 'variance', 'covariance', 'pearson']) {
    const card = stepCardFor(id, anchor);
    assert.ok(card, `${id}: keine Schrittkarte`);
    const v = card.workshop.variants[card.variant];
    assert.ok(v && card.step >= 1 && card.step <= v.lastStep, `${id}: Schritt ${card.step} passt nicht zu ${card.variant}`);
    const target = explainFor(card.variant);
    assert.ok(target?.kind === 'werkstatt' && target.workshop === card.workshop, `${id}: Sprungziel ${card.variant} ist nicht diese Werkstatt`);
    const html = renderToStaticMarkup(createElement(StepCard, { card, current: id, onConcept: noop, onOpen: noop }));
    sound(html, `Schrittkarte ${id}`);
    assert.ok(text(html).includes(card.workshop.steps[card.step - 1].title) && text(html).includes('Werkstatt öffnen'), `${id}: Schrittkarte unvollständig`);
  }
});

test('Formel als Satz and Werkzeug render their blocks in the new tone', () => {
  assert.equal(explainFor('se')?.kind, 'satz');
  const se = renderToStaticMarkup(createElement(FormelAlsSatz, { template: standardfehler, onConcept: noop }));
  sound(se, 'se');
  for (const part of ['Als Satz gelesen', 'Ein Regler je Zeichen', 'Vorgerechnet', 'Aufgepasst', 'Probier es selbst', 'Genau genommen', 'Alle Zeichen auf einen Blick', 'Das nennt man', '0,013']) assert.ok(text(se).includes(part), `se: „${part}“ fehlt`);
  const rec = renderToStaticMarkup(createElement(Werkzeug, { template: rekodieren, onConcept: noop }));
  sound(rec, 'recode');
  for (const part of ['Die Fachbegriffe', 'Die Zeichen der Regel', 'So liest rec() deine Regel', 'Vorher und nachher', 'rules = "rev"', 'Aus 4 wird 2.', '3,3', 'Aufgepasst', 'Probier es selbst', rekodieren.mut])
    assert.ok(text(rec).includes(part), `recode: „${part}“ fehlt`);
});

test('Begriffskarte (p-Wert) renders all parts in Ausführlich and the short form in Kompakt', () => {
  const { full, compact } = both(() => renderToStaticMarkup(createElement(Begriffskarte, { card: pWert, onConcept: noop })));
  sound(full, 'p_value');
  const t = text(full);
  for (const part of ['Wofür?', 'Kurz gesagt', 'Stell dir vor …', '0,88', 'Das nennt man', 'p-Wert', 'In der Fachsprache', 'Schritt 1 von 3', pWert.bausteine[0].title, 'Was passiert?', 'Warum?', 'Aufgepasst',
    'Ausprobieren', pWert.regler!.label, pWert.regler!.describe(pWert.regler!.initial), 'Probier es selbst', pWert.check.options[1], 'Was heißt das für dich?', 'Genau genommen'])
    assert.ok(t.includes(part), `p_value: „${part}“ fehlt`);
  assert.ok(t.includes(`${conceptById.hypothesis.title} öffnen`), 'Bausteine verlinken ihren Begriff');
  const c = text(compact);
  for (const part of ['Kurz gesagt', 'Stell dir vor …', 'Das nennt man', 'Was passiert?', 'Was heißt das für dich?']) assert.ok(c.includes(part), `p_value kompakt: „${part}“ fehlt`);
  for (const part of ['Ausprobieren', 'Probier es selbst', 'Aufgepasst', 'Genau genommen']) assert.ok(!c.includes(part), `p_value kompakt: „${part}“ sollte fehlen`);
});

test('Tabellen-Werkzeug (Dummy) renders before, steps, after and the R call', () => {
  const { full, compact } = both(() => renderToStaticMarkup(createElement(TabellenWerkzeug, { tool: dummy, onConcept: noop })));
  sound(full, 'dummy');
  const t = text(full);
  for (const part of ['Wofür?', 'Kurz gesagt', dummy.mut!, 'Vorher', 'Schritt für Schritt', 'Eine Vergleichsgruppe wählen', 'Das nennt man', 'Dummyvariablen', 'Nachher', 'haupt', 'abitur',
    'So sieht es in R aus', 'mutate(', 'rec(schulabschluss, rules = "1=1; 0,2,3,4=0")', 'Probier es selbst', 'Mitdenken', 'Genau genommen'])
    assert.ok(t.includes(part), `dummy: „${part}“ fehlt`);
  assert.ok(!/\bohne\s+=\s+rec/.test(t), 'die Vergleichsgruppe bekommt keine eigene Spalte');
  assert.ok(full.includes('<th scope="col" class="on">haupt</th>'), 'neue Spalten sind hervorgehoben');
  assert.ok(t.includes('Deine Wahl: Ohne Schulabschluss. Neue Spalten: haupt, mittel, fhr, abitur.'), 'Zusammenfassung der Wahl fehlt');
  assert.ok(!/aria-live="polite"><div class="xw-table-wrap"/.test(full), 'die Tabelle selbst wird nicht vorgelesen');
  const first = t.slice(t.indexOf('Eine Vergleichsgruppe wählen'), t.indexOf('Für jede andere Gruppe'));
  assert.ok(first.includes('In der Fachsprache') && !first.includes('Das nennt man'), 'ohne Begriff und Zeichen kein „Das nennt man“');
  const c = text(compact);
  for (const part of ['Kurz gesagt', 'Vorher', 'Nachher', 'So sieht es in R aus']) assert.ok(c.includes(part), `dummy kompakt: „${part}“ fehlt`);
  for (const part of ['Probier es selbst', 'Mitdenken', 'Genau genommen']) assert.ok(!c.includes(part), `dummy kompakt: „${part}“ sollte fehlen`);
});

test('every registered explanation renders through Explanation in Ausführlich and Kompakt without broken values', () => {
  for (const [id, explain] of Object.entries(EXPLANATIONS)) {
    const { full, compact } = both(() => renderToStaticMarkup(createElement(Explanation, { id, explain, onConcept: noop })));
    for (const [mode, html] of [['ausführlich', full], ['kompakt', compact]]) {
      sound(html, `${id} ${mode}`);
      assert.ok(text(html).includes('Kurz gesagt'), `${id} ${mode}: Kurz gesagt fehlt`);
    }
    assert.ok(text(compact).length < text(full).length, `${id}: Kompakt ist nicht kürzer`);
    assert.ok(EXPLAIN_LABEL[explain.kind]);
  }
});

test('the data note counts the example people or uses the workshop note', () => {
  const mittel = WORKSHOPS.find(w => w.id === 'mittel')!;
  assert.ok(text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: mittel, variant: 'mean', onConcept: noop }))).includes('Fünf Beispielpersonen. Die Punkte im Bild lassen sich ziehen.'));
  const six = { ...mittel, names: ['A', 'B', 'C', 'D', 'E', 'F'], presets: [{ id: 'x', label: 'Sechs Werte', data: [1, 2, 3, 4, 5, 6] }] };
  assert.ok(text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: six, variant: 'mean', onConcept: noop }))).includes('Sechs Beispielpersonen.'));
  const own = { ...mittel, dataNote: 'Zwei Gruppen aus dem Lehrdatensatz.' };
  assert.ok(text(renderToStaticMarkup(createElement(Formelwerkstatt, { workshop: own, variant: 'mean', onConcept: noop }))).includes('Zwei Gruppen aus dem Lehrdatensatz.'));
});

test('picture kit: building blocks draw in screen pixels and keep the slider role', () => {
  const x = linear([0, 10], [40, 440]), y = linear([0, 1], [200, 20]);
  assert.equal(x(5), 240); assert.equal(x.invert(240), 5); assert.equal(y(0.5), 110);
  const svg = renderToStaticMarkup(createElement('svg', null,
    createElement(Axis, { scale: x, ticks: [0, 5, 10], at: 200, from: 40, to: 440, title: 'Stunden' }),
    createElement(Axis, { scale: y, ticks: [0, 1], at: 40, from: 20, to: 200, orient: 'left' }),
    createElement(Bar, { x: 40, y: 50, width: 120, height: 16, tone: 'neg', label: 'Minusflächen −3' }),
    createElement(Curve, { f: v => Math.exp(-v), from: 0, to: 10, x, y }),
    createElement(AreaUnder, { f: v => Math.exp(-v), from: 8, to: 10, x, y }),
    createElement(MarkLine, { x: x(5), from: 20, to: 200, label: 'x̄ = 5' }),
    createElement(GridCell, { x: 0, y: 0, w: 60, h: 40, text: '12', sub: 'erwartet 9', tone: 'pos' }),
    createElement(DragPoint, { x: 100, y: 100, label: 'Person A', selected: true, bounds: { min: 1, max: 10 }, valueNow: 4, onPointerDown: noop, onKeyDown: noop, children: 'A' })));
  sound(svg, 'kit');
  for (const part of ['role="slider"', 'aria-valuenow="4"', 'r="20"', 'class="xw-area-pos"', 'class="xw-curve"', 'class="xw-bar-neg"', 'class="xw-cell xw-cell-pos"', 'Stunden', 'erwartet 9', 'x̄ = 5'])
    assert.ok(svg.includes(part), `Baukasten: „${part}“ fehlt`);
  assert.ok(!/font-size="?\d/.test(svg), 'Schriftgrößen kommen aus dem CSS (mindestens 13 px), nicht aus Attributen');
});
