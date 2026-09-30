import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { renderSession } from '../testRender';
import { DreiFragen } from './DreiFragen';
import { detailOf, dutyFor, initialS07, kuer, prepare, type S07State } from './domain';

const render = (state: Partial<S07State>) => renderSession(6, true, { tasks: { s07: { ...initialS07(), ...state } } });
const p = prepare(fixtureSav());
const A = p.byKey['pa31+pa32+pa33'], B = p.byKey['pa29+pa30+pa33'];
const f3 = (x: number) => x.toFixed(3).replace('.', ',');
const f4 = (x: number) => x.toFixed(4).replace('.', ',');
const entered: Partial<S07State> = {
  a: { struck: ['pa29', 'pa30', 'pa34', 'pa35'], why: 'stimmig', alpha: f4(A.alpha), r: f4(A.r) },
  b: { struck: ['pa31', 'pa32', 'pa34', 'pa35'], why: 'Inhalt', alpha: f4(B.alpha), r: f4(B.r) },
};
const LANDSCAPE = /Die stimmigste Kurzskala ist/;

test('session 7 starts with the news app brief, the seven questions and the battery check', () => {
  const html = renderSession(6);
  assert.match(html, /AUFGABE · DATENTEAM EINER NACHRICHTEN-APP/);
  assert.match(html, /Drei Fragen müssen reichen/);
  assert.match(html, /Neuer Job: Datenteam der Nachrichten-App „Wochenfaden“\./);
  assert.match(html, /„Wochenfaden-Barometer“/);
  assert.doesNotMatch(html, /fiktiv|Querschnitt/);
  assert.match(html, /pa29<\/code> Abgeordnete nur dem Volk verpflichtet<span class="s07-agree">\d+ % Zustimmung/);
  assert.match(html, /α aller sieben Fragen/);
  assert.match(html, /2 · Rolle 1: Stimmigkeit/);
  assert.match(html, /3 · Rolle 2: Inhalt – jetzt wechselst du die Seite/);
  assert.match(html, /erscheint, sobald für beide Vorschläge Stimmigkeit und Stellvertreter-Wert eingetragen und erkannt sind/);
  assert.doesNotMatch(html, /5 · Deine Wahl/);
  assert.match(html, /FÜR DAS PLENUM/);
  // Die drei Seiten des Begriffs erscheinen nicht vorab.
  assert.doesNotMatch(html, /Volkssouveränität|Anti-Elitismus|Einheit des Volkes/);
  assert.match(html, /Welche Seiten hat der Begriff\?/);
});

test('no numbers from the file before the own entry: neither alpha, omega nor the short scale values', () => {
  const champion = p.triples.find(t => t.rankAlpha === 1)!;
  const secrets = [p.full.alpha, p.full.omega, A.alpha, A.r, B.alpha, B.r, p.full.items[0].corrected, champion.alpha].map(f3);
  const cases: [Partial<S07State>, string[]][] = [
    [{}, secrets],
    [{ a: { ...entered.a!, alpha: '', r: '' } }, secrets],
    // Eigene, erkannte Werte werden bestätigt; B hat noch keinen erkannten r-Wert: nichts sonst aus der Datei.
    [{ ...entered, b: { ...entered.b!, r: '0,999' } }, [p.full.alpha, p.full.omega, B.r, p.full.items[0].corrected, champion.alpha].map(f3)],
  ];
  for (const [state, hidden] of cases) {
    const html = render(state).replace(/value="[^"]*"/g, '');
    for (const s of hidden) assert.doesNotMatch(html, new RegExp(s), `${s} in ${JSON.stringify(state)}`);
    assert.doesNotMatch(html, LANDSCAPE);
  }
});

test('striking four questions opens the entry fields; three struck asks for one more', () => {
  const three = render({ a: { struck: ['pa29', 'pa30', 'pa34'], why: '', alpha: '', r: '' } });
  assert.match(three, /Noch 1 Frage streichen\./);
  assert.doesNotMatch(three, /Stellvertreter-Wert r<input/);
  const four = render({ a: { struck: ['pa29', 'pa30', 'pa34', 'pa35'], why: '', alpha: '', r: '' } });
  assert.match(four, /Gestrichen: pa29 \+ pa30 \+ pa34 \+ pa35\. Es bleiben: pa31 \+ pa32 \+ pa33\./);
  assert.match(four, /Stimmigkeit α<input/);
  assert.match(four, /aria-pressed="true" disabled=""|aria-pressed="false" disabled=""/);
  const ok = render({ a: { ...entered.a! } });
  assert.match(ok, /Stimmt: Die Stimmigkeit deiner drei Fragen ist α = /);
  assert.match(ok, /Stimmt: Der Stellvertreter-Wert deiner Kurzskala ist r = /);
});

test('the landscape waits for both proposals and accepts the min_valid variant', () => {
  assert.doesNotMatch(render({ a: entered.a }), LANDSCAPE);
  assert.doesNotMatch(render({ ...entered, a: { ...entered.a!, alpha: f4(A.omega) } }), LANDSCAPE);
  assert.doesNotMatch(render({ ...entered, b: { ...entered.b!, alpha: 'x' } }), LANDSCAPE);
  const html = render(entered);
  assert.match(html, LANDSCAPE);
  assert.match(html, /role="img" aria-label="35 Kurzskalen: Stimmigkeit α von/);
  assert.match(html, /Stimmigkeit: pa31 \+ pa32 \+ pa33, α 0,599, r 0,685\. Inhalt: pa29 \+ pa30 \+ pa33/);
  assert.match(html, /Alle 35 Kurzskalen als Tabelle/);
  assert.match(html, /5 · Deine Wahl/);
  assert.match(html, /Pflichtfrage bei zu einheitlicher Wahl/);
  assert.match(render({ ...entered, a: { ...entered.a!, r: f4(detailOf(p, A).rAny[0]) } }), LANDSCAPE);
});

test('the three sides appear only as help and then name what a proposal misses', () => {
  const think = render({ ...entered, facetLevel: 1 });
  assert.match(think, /Denkanstoß\.<\/strong> Lies die sieben Aussagen/);
  assert.doesNotMatch(think, /Volkssouveränität/);
  const shown = render({ ...entered, facetLevel: 2 });
  assert.match(shown, /Volkssouveränität<\/strong> \(V\)/);
  assert.match(shown, /Vorschlag Inhalt: Aus „Einheit des Volkes“ ist keine Frage mehr dabei\./);
  assert.match(shown, /Vorschlag Stimmigkeit: Jede der drei Seiten ist mit einer Frage vertreten\./);
  assert.match(shown, /<th scope="col">Seiten<\/th>/);
  assert.doesNotMatch(render(entered), /<th scope="col">Seiten<\/th>/);
});

test('partner variant: A for consistency, B for content, and an agreement', () => {
  const html = render({ ...entered, mode: 'pair' });
  assert.match(html, /A vertritt die Stimmigkeit: optimiert α und liest die Trennschärfen\. B vertritt den Inhalt/);
  assert.match(html, /2 · Person A: Stimmigkeit/);
  assert.match(html, /3 · Person B: Inhalt/);
  assert.match(html, /Einigt euch auf eine\./);
  assert.match(html, /Stimmigkeit: pa31 \+ pa32 \+ pa33, α 0,599|A: pa31 \+ pa32 \+ pa33, α 0,599/);
});

test('final choice, duty question and plenum card', () => {
  const duty = dutyFor(2);
  const html = render({ ...entered, final: ['pa31', 'pa32', 'pa33'], sentence: 'die Einheit des Volkes', reason: 'Stellvertreter', duty: 2 });
  assert.match(html, new RegExp(`Pflichtfrage für Gruppe 2: ${duty.item}`));
  if (!['pa31', 'pa32', 'pa33'].includes(duty.item)) assert.match(html, new RegExp(`Eure Pflichtfrage ${duty.item} fehlt in dieser Auswahl`));
  assert.match(html, /<dt>Kurzskala<\/dt><dd>pa31 \+ pa32 \+ pa33<\/dd>/);
  assert.match(html, /<dt>Punkt im Kreuz \(α \| r\)<\/dt><dd>0,599 \| 0,685<\/dd>/);
  assert.match(html, /<dt>Was sie nicht mehr misst<\/dt><dd>die Einheit des Volkes<\/dd>/);
  assert.match(html, /<dt>Pflichtfrage \(Gruppe 2\)<\/dt>/);
  assert.match(html, /Kür \(optional, etwa 10 Minuten\)/);
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Index und Skala<small>Aufgabe abgeschlossen/);
  assert.match(render({ ...entered, final: ['pa29', 'pa31', 'pa32'] }), /pa29 trifft den Kern des Begriffs/);
  assert.match(render({ ...entered, final: ['pa31', 'pa32', 'pa33'], sentence: 'nichts' }), /Jede Kurzskala verliert etwas/);
  // Vor der Enthüllung: Wahl steht auf der Karte, der Punkt im Kreuz noch nicht.
  const early = render({ final: ['pa31', 'pa32', 'pa33'] });
  assert.match(early, /<dt>Punkt im Kreuz \(α \| r\)<\/dt><dd>–<\/dd>/);
  assert.doesNotMatch(early, /Kür \(optional/);
});

test('the bonus task reveals the gap only after both shares are recognised', () => {
  const k = kuer(p, ['pa31', 'pa32', 'pa33']);
  const f1 = (x: number) => x.toFixed(2).replace('.', ',');
  const base = { ...entered, final: ['pa31', 'pa32', 'pa33'] } as Partial<S07State>;
  assert.doesNotMatch(render({ ...base, kuer: { mean: f1(k.meanW), all: '' } }), /nur nach der Mittelwertlogik/);
  assert.match(render({ ...base, kuer: { mean: f1(k.meanW), all: f1(k.allW) } }), /gelten nur nach der Mittelwertlogik als populistisch/);
  assert.match(render({ ...base, kuer: { mean: '21', all: '' } }), /mit einer Nachkommastelle/);
});

test('a file without complete answers gets an explanation instead of NaN', () => {
  const col = { values: [-11, 1, -11, 2], missingFrom: -1 };
  const sav = fakeSav({ pa29: col, pa30: col, pa31: { values: [3, -9, -11, -11], missingFrom: -1 }, pa32: col, pa33: col, pa34: col, pa35: col, wghtpew: { values: [1, 1, 1, 1] } });
  const state = { ...initialS07(), battery: { alpha: '0,833', weakest: 'pa29' as const, value: '0,348' }, a: { struck: ['pa29', 'pa30', 'pa34', 'pa35'] as const, why: '', alpha: '0,759', r: '0,758' } };
  const html = renderToStaticMarkup(createElement(DreiFragen, {
    data: { sav, fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' }, state: { ...state, a: { ...state.a, struck: [...state.a.struck] } }, onChange: () => {}, onConcept: () => {},
  }));
  assert.match(html, /weniger als zwei Befragte alle sieben Fragen beantwortet/);
  assert.doesNotMatch(html, /NaN/);
  assert.doesNotMatch(html, LANDSCAPE);
});
