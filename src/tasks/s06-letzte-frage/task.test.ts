import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { renderSession } from '../testRender';
import { compute, initialS06, prepare, type S06State } from './domain';

const render = (state: Partial<S06State>) => renderSession(5, true, { tasks: { s06: { ...initialS06(), ...state } } });
const c = compute(prepare(fixtureSav()));
const pctIn = (x: number) => (100 * x).toFixed(1).replace('.', ',');
const propIn = (x: number) => x.toFixed(3).replace('.', ',').replace('-', '−');
const shown = (x: number, digits = 1) => x.toFixed(digits).replace('.', ',').replace('-', '−');
const share = (scope: 'all' | 'online', grouping: 'rep' | 'amt' | 'version', level: number) =>
  c.shares.find(v => v.scope === scope && v.grouping === grouping && v.level === level && !v.weighted && v.coding === 'ok')!.value;
const empty = { a: '', b: '', t: '' };
const rep = (scope: 'all' | 'online') => ({ a: pctIn(share(scope, 'rep', 0)), b: pctIn(share(scope, 'rep', 1)), t: '' });
const rOf = (pair: string) => propIn(c.rs.find(v => v.pair === pair && v.scope === 'all' && !v.weighted)!.value);
const fOnline = c.fs.find(v => v.scope === 'online' && v.kind === 'classical' && !v.weighted)!;

test('session 6 starts with the brief, the four versions and the gut feeling – no numbers from the file', () => {
  const html = render({});
  assert.match(html, /AUFGABE · PANELAUFBAU IM UMFRAGEINSTITUT/);
  assert.match(html, /Neuer Job: Panelaufbau beim Institut Wiederfrage\./);
  assert.match(html, /„Dürfen wir Sie zu weiteren Befragungen einladen\?“/);
  assert.doesNotMatch(html, /fiktiv/i);
  assert.match(html, /Die vier Fassungen der Einladungsfrage/);
  assert.match(html, /Vorab · Dein Bauchgefühl/);
  for (const h of ['Station 1 · Erste Auswertung', 'Station 2 · Zufallscheck', 'Station 3a · Der saubere Vergleich: nur online', 'Station 3b · Vier Fassungen, sechs Paare', 'Station 4 · Freigabe']) assert.match(html, new RegExp(h));
  assert.match(html, /FÜR DAS PLENUM/);
  assert.match(html, /Freigabe · Die letzte Frage/);
  // keine Enthüllung, kein Wert aus der Datei
  assert.doesNotMatch(html, /Die Falle|Zweite Enthüllung|Korrelationsmatrix über alle|Tukey-Paarvergleiche nur online|Wer bekam welche Fassung|Zum Vergleich/);
  for (const x of [share('all', 'rep', 0), share('all', 'rep', 1), share('online', 'rep', 0), share('online', 'version', 1)]) assert.doesNotMatch(html, new RegExp(`${pctIn(x)} %`));
  assert.doesNotMatch(html, new RegExp(rOf('wiederholung-papier')));
  // Das Aufgabenblatt fragt r erst nach der festgehaltenen Markierung ab.
  assert.doesNotMatch(html, /r\(wiederholung, papier\)/);
  assert.match(html, /Markierung festhalten/);
});

test('station 1: recognised shares give the own difference and the voice of the management', () => {
  const html = render({ s1: { rep: { ...rep('all'), t: '' }, amt: empty } });
  assert.match(html, /Stimmt: Zusagequote „ohne“ Wiederholung, über alle Selbstausfüller:innen, ungewichtet/);
  assert.match(html, /Deine Differenz aus deinen Quoten: „mit“ − „ohne“ = \+14,8 Pp\./);
  assert.match(html, /Die Geschäftsführung liest mit: „\+14,8 Punkte durch die Wiederholung/);
  const wrong = render({ s1: { rep: { a: '12,3', b: '45,6', t: '' }, amt: empty } });
  assert.match(wrong, /Diese Quote für „ohne“ Wiederholung finde ich nicht/);
  assert.doesNotMatch(wrong, /Geschäftsführung liest mit|Deine Differenz/);
  assert.match(render({ s1: { rep: { a: '1,577', b: '', t: '' }, amt: empty } }), /Ein Mittelwert über 1/);
});

test('station 2: r only after the locked marks, the matrix only after recognised r', () => {
  const marks = ['wiederholung-papier' as const, 'betrag-papier' as const];
  const open = render({ marks });
  assert.match(open, /aria-pressed="true"[^>]*aria-label="wiederholung × papier: müsste ≈ 0 sein"/);
  assert.doesNotMatch(open, /r\(wiederholung, papier\)/);
  const locked = render({ marks, locked: true });
  assert.match(locked, /Deine Markierung ist festgehalten/);
  assert.match(locked, /disabled=""[^>]*aria-label="betrag × age: müsste ≈ 0 sein"/);
  assert.match(locked, /r\(wiederholung, papier\)/);
  assert.doesNotMatch(locked, /Korrelationsmatrix über alle/);
  const r = { repPaper: rOf('wiederholung-papier'), amtPaper: rOf('betrag-papier') };
  assert.doesNotMatch(render({ marks, locked: true, r: { ...r, amtPaper: '0,999' } }), /Korrelationsmatrix über alle/);
  const reveal = render({ marks, locked: true, r });
  assert.match(reveal, /Korrelationsmatrix über alle Selbstausfüller:innen, ungewichtet/);
  assert.match(reveal, /markiert · ≠ 0 – über die Modi nicht ausgelost/);
  assert.doesNotMatch(reveal, /Los verletzt/);
  // Werte aus anderen Zellen öffnen die Matrix nicht
  assert.doesNotMatch(render({ marks, locked: true, r: { repPaper: rOf('age-zusage'), amtPaper: rOf('papier-zusage') } }), /Korrelationsmatrix über alle/);
  assert.match(reveal, /Aus Kostengründen gab es auf Papier nur A1 und B1/);
  assert.match(reveal, /Wer bekam welche Fassung\?/);
  assert.match(reveal, /Der Unterschied aus Station 1 kommt nicht \(nur\) von der Wiederholung, weil/);
  assert.match(render({ marks, locked: true, r, s1: { rep: rep('all'), amt: empty } }), /Deine \+14,8 Punkte aus Station 1 kommen nicht \(nur\) von der Wiederholung/);
  assert.match(render({ marks, locked: true, r, matrixView: 'weighted' }), /Korrelationsmatrix über alle Selbstausfüller:innen, gewichtet/);
});

test('station 3a: the trap appears after the own shares over all and online', () => {
  const trapHtml = render({ s1: { rep: rep('all'), amt: empty }, s3: { rep: rep('online'), amt: empty } });
  assert.match(trapHtml, /Die Falle/);
  assert.match(trapHtml, /Nicht die Wiederholung hat sich verändert, sondern die Vergleichsgruppe\./);
  assert.match(trapHtml, /„mit“ bleibt stehen – alle Fälle mit Wiederholung sind online\./);
  assert.match(trapHtml, /role="img" aria-label="Zusagequote „ohne“ Wiederholung: alle Selbstausfüller:innen/);
  assert.match(trapHtml, /Unter „ohne“ steckten 19 Papier-Befragte/);
  assert.match(render({ s1: { rep: rep('all'), amt: empty }, s3: { rep: rep('online'), amt: empty }, trapView: 'online' }), /aria-pressed="true">nur online/);
  const half = render({ s3: { rep: rep('online'), amt: empty } });
  assert.doesNotMatch(half, /Die Falle/);
  assert.match(half, /Trag auch die Quoten „ohne\/mit“ aus Station 1 ein/);
  assert.doesNotMatch(render({ s1: { rep: rep('all'), amt: empty }, s3: { rep: rep('all'), amt: empty } }), /Die Falle/);
});

test('station 3b: ANOVA entries, Tukey only after the own ANOVA and „Auswahl prüfen“, the weighted reveal without station 3a', () => {
  const means = [1, 2, 3, 4].map(k => pctIn(share('online', 'version', k)));
  const anova = { means, F: propIn(fOnline.value), p: '' };
  const html = render({ anova });
  assert.match(html, /Stimmt: Zusagequote Fassung A1, nur online, ungewichtet = 80,0 %/);
  assert.match(html, /Stimmt: F\(3, 10\) = 0,238/);
  assert.match(html, /Zweite Enthüllung · mit Gewicht/);
  assert.match(html, /Mit wghtpew: F\(3, 9\) = 0,201/);
  // Die Online-t-Tests aus Station 3a und Tukey gewichtet bleiben verborgen, solange sie nicht eingetragen bzw. geprüft sind.
  assert.doesNotMatch(html, /Wiederholung online: ungewichtet|Betrag online: ungewichtet|Tukey gewichtet/);
  assert.match(render({ anova, s3: { rep: rep('online'), amt: empty } }), /Wiederholung online: ungewichtet/);
  assert.doesNotMatch(render({ anova: { means, F: '0,999', p: '' } }), /Zweite Enthüllung/);
  // ohne eigene ANOVA: Auswahl gesperrt, keine Tabelle, kein Urteil – auch nicht mit gespeicherter „richtiger“ Auswahl
  const locked = render({ tukey: ['none'], tukeyTried: ['none'] });
  assert.match(locked, /Die Auswahl öffnet sich, sobald oben F oder p deiner ANOVA erkannt ist/);
  assert.match(locked, /<button disabled="" aria-pressed="false">B2 – A2<\/button>/);
  assert.doesNotMatch(locked, /Tukey-Paarvergleiche nur online|Stimmt: Nach Tukey/);
  // mit ANOVA, aber ungeprüft: kein Urteil
  const unchecked = render({ anova, tukey: ['none'] });
  assert.doesNotMatch(unchecked, /Tukey-Paarvergleiche nur online|Stimmt: Nach Tukey|Noch nicht/);
  assert.match(unchecked, /Auswahl prüfen/);
  const wrong = render({ anova, tukey: ['4-2'], tukeyTried: ['4-2'] });
  assert.match(wrong, /Noch nicht: Deine Auswahl passt nicht zur Tukey-Tabelle/);
  assert.doesNotMatch(wrong, /Tukey-Paarvergleiche nur online|B2 – A2 ist/);
  const table = render({ anova, tukey: ['none'], tukeyTried: ['none'] });
  assert.match(table, /Stimmt: Nach Tukey unterscheidet sich kein Paar signifikant\./);
  assert.match(table, /Tukey-Paarvergleiche nur online/);
  assert.match(table, /p gewichtet/);
  assert.match(table, /Tukey gewichtet: kein Paar signifikant/);
  assert.match(table, /<td>,937<\/td>/);   // p wie mariposa, ohne führende Null
});

test('station 4: inputs after the version, the interval after the own rate and span, two signatures', () => {
  assert.doesNotMatch(render({}), /Versprochene Online-Quote \(%\)/);
  const chosen = render({ release: { ...initialS06().release, version: 'A1' } });
  assert.match(chosen, /Versprochene Online-Quote \(%\)/);
  assert.match(chosen, /Hast du die vier Fassungen online verglichen/);
  assert.doesNotMatch(chosen, /Balken/);
  const means = [1, 2, 3, 4].map(k => pctIn(share('online', 'version', k)));
  assert.match(render({ anova: { means, F: '', p: '' }, release: { ...initialS06().release, version: 'A1' } }), /höchsten Balken\. Hast du mit Tukey geprüft/);
  assert.doesNotMatch(chosen, /Zum Vergleich/);
  const rate = render({ release: { ...initialS06().release, version: 'A1', rate: '75' } });
  assert.match(rate, /Wie breit ist dein Intervall\?/);
  assert.doesNotMatch(rate, /Zum Vergleich/);
  const ci = c.rates[0]!;
  // beliebige Spanne ohne eigene vier Quoten: kein Intervall aus der Datei
  const span = render({ release: { ...initialS06().release, version: 'A1', rate: '75', low: '70', high: '80' } });
  assert.doesNotMatch(span, /Zum Vergleich|95-%-Intervall aus t_test/);
  assert.match(span, /Woran misst du deine Spanne\?/);
  assert.match(render({ anova: { means, F: '', p: '' }, release: { ...initialS06().release, version: 'A1', rate: '75', low: '70', high: '80' } }),
    new RegExp(`Zum Vergleich: A1 online, ungewichtet: ${shown(100 * ci.mean)} %`));
  const own = render({ release: { ...initialS06().release, version: 'A1', rate: '75', low: shown(100 * ci.ci[0]), high: shown(100 * ci.ci[1]) } });
  assert.match(own, /Das ist das 95-%-Intervall aus t_test\(\) für A1 online/);
  assert.match(span, /Unterschrift Panelaufbau \(ein Satz\)/);
  assert.match(span, /Freigabe: noch offen/);
  const veto = render({ release: { ...initialS06().release, version: 'A1' }, sign: { panel: 'Ich verspreche 75 %.', qs: 'Veto.', veto: true } });
  assert.match(veto, /Freigabe: Veto der Qualitätssicherung/);
  assert.match(veto, /<dt>Freigabe<\/dt><dd>Veto der Qualitätssicherung<\/dd>/);
});

test('the pair variant names A and B on every station and on the signatures', () => {
  const pair = render({ mode: 'pair', release: { ...initialS06().release, version: 'B1' } });
  assert.match(pair, /A ist Panelaufbau: Stationen 1 und 3a/);
  assert.match(pair, /Station 1 · Erste Auswertung <span class="s06-role">A · Panelaufbau<\/span>/);
  assert.match(pair, /Station 2 · Zufallscheck <span class="s06-role">B · Qualitätssicherung<\/span>/);
  assert.match(pair, /Unterschrift A · Panelaufbau/);
  assert.match(pair, /Unterschrift B · Qualitätssicherung/);
  assert.match(render({}), /Station 1 · Erste Auswertung <span class="s06-role">Panelaufbau<\/span>/);
});

test('a signed release completes the session, fills the card and offers the full script', () => {
  const done = render({
    gut: { version: 'B2', rate: '80' },
    release: { version: 'B1', rate: '67', low: '62', high: '72', amount: '4,5', notClaimed: 'Dass die Wiederholung wirkt.' },
    sign: { panel: 'Ich verspreche 67 %.', qs: 'Ich gebe frei.', veto: false },
  });
  assert.match(done, /Mittelwerte vergleichen<small>Aufgabe abgeschlossen/);
  assert.match(done, /<dt>Fassung<\/dt><dd>B1 · 10 € \(5 € fürs Ja, 5 € bei Teilnahme\), Geld nur am Schluss der Frage genannt<\/dd>/);
  assert.match(done, /<dt>Versprochene Online-Quote<\/dt><dd>67 % \(Spanne 62–72 %\)<\/dd>/);
  assert.match(done, /<dt>Was wir nicht behaupten<\/dt><dd>Dass die Wiederholung wirkt\.<\/dd>/);
  assert.match(done, /<dt>Freigabe<\/dt><dd>freigegeben mit zwei Unterschriften<\/dd>/);
  assert.match(done, /<dt>Bauchgefühl vorher<\/dt><dd>B2 · 80 %<\/dd>/);
  assert.match(done, /vollständiges R-Skript/);
  assert.match(done, /filter\(splt23_3 == 3\) %&gt;% t_test\(zusage\)/);
  assert.doesNotMatch(render({}), /vollständiges R-Skript/);
});

test('gut feeling locks after the first recognised number, t is optional, station 3a does not spoil station 2, rates print in percent', () => {
  const open = render({ gut: { version: 'B2', rate: '80' } });
  assert.doesNotMatch(open, /<button disabled="" aria-pressed="true">B2<\/button>/);
  assert.match(open, /Sobald deine erste Zahl aus Station 1 erkannt ist, wird es festgehalten/);
  const fixed = render({ gut: { version: 'B2', rate: '80' }, s1: { rep: rep('all'), amt: empty } });
  assert.match(fixed, /<button disabled="" aria-pressed="true">B2<\/button>/);
  assert.match(fixed, /value="80" disabled=""|disabled="" value="80"/);
  assert.match(fixed, /Dein Bauchgefühl ist festgehalten/);
  assert.match(open, /t \(Welch\) – zur Kontrolle, freiwillig/);
  assert.doesNotMatch(open, /nur online gab es alle vier Fassungen/);
  const card = render({ gut: { version: 'A2', rate: '0,8' }, release: { ...initialS06().release, version: 'B1', rate: '0,67', low: '0,62', high: '0,72' } });
  assert.match(card, /<dt>Versprochene Online-Quote<\/dt><dd>67 % \(Spanne 62–72 %\)<\/dd>/);
  assert.match(card, /<dt>Bauchgefühl vorher<\/dt><dd>A2 · 80 %<\/dd>/);
});
