#!/usr/bin/env node
/*
 * Browserprüfung der Erklärungen in der freien Karte (Spezifikation Ausbau, Abschnitt 8; AUTHORING.md, Abschnitt 9).
 *
 * Aufruf (Dev-Server vorher auf einem eigenen Port starten, danach beenden):
 *   BASE=http://127.0.0.1:<port> IDS=mean,sd OUT=<ordner> node scripts/check-explanations.cjs
 *
 * Umgebungsvariablen:
 *   BASE        Adresse des Dev-Servers (Pflicht)
 *   IDS         Begriffs-IDs, durch Komma getrennt (Pflicht)
 *   OUT         Ordner für die Ergebnisse: je Begriff <id>.json, dazu summary.json (Pflicht)
 *   SIZES       Breiten in px, durch Komma getrennt (Standard: 1440,390; Höhe 900, bei 390 px 844)
 *   MODE        „kompakt“ prüft die Erklärungen in der Ansicht Kompakt (Standard: Ausführlich)
 *   SHOTS=1     zusätzlich je Reiter und Breite ein Bildschirmfoto nach OUT/shots
 *   PLAYWRIGHT  Pfad zum Playwright-Paket (Standard: das npx-Paket dieses Rechners)
 *
 * Je Begriff und Breite: öffnet den Begriff über die Suche der Karte (`/?ansicht=karte`, Suchfeld „Begriff im
 * Netzwerk finden“; findet die Suche ihn nicht eindeutig, über das Atlas-Werkzeug `open_atlas_concept`, das steht
 * dann als Hinweis da) und prüft:
 * - gleich nach dem Öffnen: Die Reiterleiste ist im sichtbaren Teil des Inspectors zu sehen (auch im Blatt auf dem
 *   Telefon), alle Reiter liegen ganz in der Leiste (nichts abgeschnitten, kein seitliches Schieben nötig), kein Wort
 *   einer Beschriftung bricht mitten im Wort um, und die Leiste (mit Schatten) überdeckt nichts, was über ihr steht;
 * - Tastatur: Pfeil rechts durch alle Reiter, Pfeil links zurück, Ende, Pos1; jedes Panel hat Inhalt, die anderen sind verborgen;
 * - in jedem Reiter (alle Abschnitte aufgeklappt): Konsolenfehler und -warnungen, kleinste Schrift sichtbarer Texte
 *   (berechnete font-size; Bilder zeichnet der Baukasten 1 : 1, eine Skalierung des SVG misst das Skript nicht),
 *   seitliches Überlaufen von Seite und Inspector, Steuerelemente ohne zugänglichen Namen (Barrierefreiheitsbaum),
 *   übersprungene Überschriftenebenen (etwa h2 → h4);
 * - Zustand: Ein gewählter Schritt bleibt nach einem Reiterwechsel erhalten;
 * - „Weiter“: jedes Ziel nur einmal;
 * - Fokus: nach „Schritt k ansehen“ in „In R“ steht der Fokus bei Schritt k im richtigen Reiter und liegt nicht unter
 *   einem klebenden Element; mit der Tabulatortaste durch jeden Reiter (bis zu 30 Stopps) liegt kein Fokus unter einem
 *   klebenden Element (Reiterleiste, stehende Formel, Kopf des Blatts); nach „Zu … wechseln“, nach „Ausprobieren“ und
 *   „Ausgangsdaten wiederherstellen“ (im Reiter und in der Kopfzeile) und nach dem Link „Als Nächstes“ steht der
 *   Fokus nicht auf der Seite (body).
 * Nicht parallel laufen lassen (zwei Läufe gleichzeitig führen zu Zeitüberschreitungen): erst Ausführlich, dann Kompakt.
 * Begriffe ohne Reiter werden ohne die Reiterpunkte geprüft. Konsolenmeldungen beim Laden der Seite zählen zum
 * ersten Begriff. Gibt je Begriff eine JSON-Zeile aus und endet mit Code 1, wenn ein Befund auftritt.
 */
const fs = require('node:fs');
const path = require('node:path');

const BASE = process.env.BASE, OUT = process.env.OUT;
const IDS = (process.env.IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const SIZES = (process.env.SIZES || '1440,390').split(',').map(Number).filter(Boolean);
const PLAYWRIGHT = process.env.PLAYWRIGHT || '/Users/yannickdiehl/.npm/_npx/9833c18b2d85bc59/node_modules/playwright';
const MIN_FONT = 13;
if (!BASE || !OUT || !IDS.length) {
  console.error('Aufruf: BASE=http://127.0.0.1:<port> IDS=mean,sd OUT=<ordner> node scripts/check-explanations.cjs');
  process.exit(2);
}
const { chromium } = require(PLAYWRIGHT);
fs.mkdirSync(OUT, { recursive: true });
if (process.env.SHOTS) fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });

/** Messungen im Browser: kleinste Schrift sichtbarer Texte im Inspector und seitliches Überlaufen. */
function measure() {
  const ins = document.getElementById('atlas-inspector');
  if (!ins) return { missing: true };
  let minFont = Infinity, minAt = '';
  const walker = document.createTreeWalker(ins, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent.trim()) continue;
    const el = node.parentElement;
    if (!el || !el.getClientRects().length || el.closest('[hidden]')) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    const size = parseFloat(style.fontSize);
    if (size < minFont) { minFont = size; minAt = `${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(' ')[0]}: ${node.textContent.trim().slice(0, 40)}`; }
  }
  // Überschriften im sichtbaren Teil (auch sr-only): Eine Ebene darf nicht übersprungen werden (h2 → h4).
  const levels = [...ins.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => !h.closest('[hidden]') && !h.closest('details:not([open])')).map(h => ({ n: Number(h.tagName[1]), t: h.textContent.trim().slice(0, 30) }));
  const jumps = levels.flatMap((h, i) => i && h.n > levels[i - 1].n + 1 ? [`h${levels[i - 1].n} „${levels[i - 1].t}“ → h${h.n} „${h.t}“`] : []);
  const doc = document.scrollingElement || document.documentElement;
  return { jumps,
    minFont: Number.isFinite(minFont) ? minFont : null, minAt,
    pageOverflow: doc.scrollWidth > window.innerWidth + 1,
    inspectorOverflow: ins.scrollWidth > ins.clientWidth + 1,
    inspectorWidth: ins.clientWidth,
  };
}

/**
 * Im Browser: Wie weit liegt das fokussierte Element unter einem klebenden oder festen Element des Inspectors
 * (Reiterleiste, stehende Formel, Kopf des Blatts)? null, wenn nichts verdeckt.
 */
function coverage() {
  const a = document.activeElement, ins = document.getElementById('atlas-inspector');
  if (!a || a === document.body || !ins) return null;
  const r = a.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  let worst = null;
  for (const s of [ins, ...ins.querySelectorAll('*')]) {
    if (s === a || s.contains(a) || a.contains(s)) continue;
    const cs = getComputedStyle(s);
    if ((cs.position !== 'sticky' && cs.position !== 'fixed') || cs.visibility === 'hidden' || s.closest('[hidden]')) continue;
    const q = s.getBoundingClientRect();
    if (!q.width || !q.height) continue;
    const x = Math.min(r.right, q.right) - Math.max(r.left, q.left), y = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
    // Verdeckt heißt: Ober- oder Unterkante des Ziels liegt unter dem klebenden Element. Ein Panel, das über beide
    // Ränder hinausreicht, ist nur zum Teil zu sehen, aber nicht verdeckt.
    // Ein Ziel, das zwischen klebendem Element und unterem Rand gar nicht Platz hat, zentriert der Browser; es zählt nicht.
    const room = Math.min(ins.getBoundingClientRect().bottom, innerHeight) - q.bottom;
    const edge = r.height <= room - 2 && ((r.top >= q.top - 2 && r.top < q.bottom - 2) || (r.bottom > q.top + 2 && r.bottom <= q.bottom + 2));
    if (x > 2 && y > 2 && edge && (!worst || y > worst.y)) worst = { y: Math.round(y), by: String(s.className || s.tagName).split(' ')[0], what: (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 40) };
  }
  return worst;
}

async function openConcept(page, id) {
  // Titel über das Atlas-Werkzeug erfragen, dann über die Suche öffnen; sonst direkt über das Werkzeug.
  const title = await page.evaluate(i => window.__atlasTools?.open_atlas_concept?.execute({ id: i })?.title ?? null, id);
  if (!title) return { title: null, via: 'nicht gefunden' };
  await page.waitForFunction(i => window.__atlasTools.read_atlas_state.execute({})?.selected?.id === i, id);
  // Das Werkzeug fokussiert den Titel nach 120 ms (App.tsx); war der Begriff schon offen, käme das sonst mitten in die Suche.
  await page.waitForTimeout(300);
  const whole = page.getByRole('button', { name: 'Ganze Karte' }).first();
  if (await whole.isVisible().catch(() => false)) await whole.click();
  const search = page.getByRole('searchbox', { name: 'Begriff im Netzwerk finden' });
  await search.fill(title);
  const results = page.locator('.network-search-results > button');
  // Die Trefferliste baut sich nach dem Tippen noch um; erst lesen, wenn sie zweimal hintereinander gleich ist.
  const snapshot = () => results.evaluateAll(bs => bs.map(b => ({ strong: b.querySelector('strong')?.textContent.trim(), small: b.querySelector('small')?.textContent.trim() })));
  let list = await snapshot();
  for (let k = 0; k < 20; k++) {
    await page.waitForTimeout(150);
    const again = await snapshot();
    if (JSON.stringify(again) === JSON.stringify(list) && again.length) break;
    list = again;
  }
  let picked = -1;
  for (let i = 0; i < list.length && picked < 0; i++) {
    const { strong, small } = list[i];
    if (strong === title) picked = i;
    else if (list.length === 1) picked = i;
    else if (small && i === 0 && title.length > 3 && strong && title.includes(strong)) picked = i;
  }
  if (picked >= 0) {
    await results.nth(picked).click();
    await page.waitForSelector('#inspector-title');
    await page.waitForFunction(i => window.__atlasTools.read_atlas_state.execute({})?.selected?.id === i, id, { timeout: 3000 }).catch(() => {});
    const shown = (await page.locator('#inspector-title').textContent())?.trim();
    const opened = await page.evaluate(() => window.__atlasTools?.read_atlas_state?.execute({})?.selected?.id);
    if (opened === id) return { title: shown, via: 'Suche' };
  }
  await page.evaluate(i => window.__atlasTools.open_atlas_concept.execute({ id: i }), id);
  await page.waitForFunction(i => window.__atlasTools.read_atlas_state.execute({})?.selected?.id === i, id);
  await page.waitForSelector('#inspector-title');
  return { title: (await page.locator('#inspector-title').textContent())?.trim(), via: 'Werkzeug', list: list.map(x => x.strong).slice(0, 4) };
}

async function checkConcept(page, id, width, errors) {
  const problems = [], result = { id, width };
  const opened = await openConcept(page, id);
  Object.assign(result, { title: opened.title, openedVia: opened.via });
  if (!opened.title) { problems.push('Begriff nicht gefunden'); return { ...result, problems }; }
  await page.waitForTimeout(300);
  const ins = page.locator('#atlas-inspector');
  const tabs = ins.locator('[role=tablist] [role=tab]');
  const n = await tabs.count();
  result.tabs = n ? await tabs.allTextContents() : [];
  result.panels = [];
  if (opened.via !== 'Suche') result.hinweise = [`über das Werkzeug geöffnet, die Suche fand „${opened.title}“ nicht eindeutig (Treffer: ${(opened.list ?? []).join(', ') || 'keine'})`];
  if (n) {
    // Gleich nach dem Öffnen: Leiste sichtbar (nicht unter dem Kopf, nicht unter dem Rand des Blatts), alle Reiter ganz darin.
    const bar = await page.evaluate(() => {
      const ins = document.getElementById('atlas-inspector'), bar = ins.querySelector('[role=tablist]'), head = ins.querySelector('.inspector-top');
      const ib = ins.getBoundingClientRect(), bb = bar.getBoundingClientRect(), hb = head?.getBoundingClientRect();
      const top = Math.max(ib.top, getComputedStyle(head ?? ins).position === 'sticky' ? hb.bottom : ib.top), bottom = Math.min(ib.bottom, innerHeight);
      const cut = [...bar.querySelectorAll('[role=tab]')].filter(t => { const r = t.getBoundingClientRect(); return r.left < bb.left - 1 || r.right > bb.right + 1 || t.scrollWidth > t.clientWidth + 1; }).map(t => t.textContent);
      // Wörter, die über zwei Zeilen laufen („Wei / ter“): Range je Wort, Zeilen nach Oberkante.
      const broken = [];
      for (const t of bar.querySelectorAll('[role=tab]')) {
        const walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
        for (let node = walk.nextNode(); node; node = walk.nextNode()) for (const m of node.textContent.matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
          if (new Set([...range.getClientRects()].filter(x => x.width > 0.5).map(x => Math.round(x.top))).size > 1) broken.push(m[0]);
        }
      }
      // Was die Leiste malt (Rahmen und Schatten), darf nichts überdecken, was im Dokument vor ihr steht (Titel, „Kurz gesagt“).
      const ink = [bb];
      const shadow = getComputedStyle(bar).boxShadow;
      if (shadow && shadow !== 'none') for (const part of shadow.split(/,(?![^(]*\))/)) {
        if (/inset/.test(part)) continue;
        const [x = 0, y = 0, blur = 0, spread = 0] = part.replace(/rgba?\([^)]*\)/, '').trim().split(/\s+/).map(parseFloat).filter(v => !Number.isNaN(v));
        ink.push({ left: bb.left + x - blur - spread, right: bb.right + x + blur + spread, top: bb.top + y - blur - spread, bottom: bb.bottom + y + blur + spread });
      }
      const covered = [];
      for (const el of ins.querySelectorAll('*')) {
        if (el.contains(bar) || bar.contains(el) || !(el.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING) || el.closest('[hidden]')) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const hit = ink.some(k => Math.min(r.right, k.right) - Math.max(r.left, k.left) > 1 && Math.min(r.bottom, k.bottom) - Math.max(r.top, k.top) > 1);
        if (hit && !el.querySelector('*')) covered.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}: ${el.textContent.trim().slice(0, 30)}`);
        else if (hit && getComputedStyle(el).borderBottomWidth !== '0px') covered.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (Rahmen)`);
      }
      return { visible: bb.top >= top - 1 && bb.bottom <= bottom + 1, scrolls: bar.scrollWidth > bar.clientWidth + 1, cut, broken, covered, top: Math.round(bb.top), area: [Math.round(top), Math.round(bottom)] };
    });
    if (!bar.visible) problems.push(`Reiterleiste beim Öffnen nicht im sichtbaren Teil (oben ${bar.top}, sichtbar ${bar.area.join(' bis ')})`);
    if (bar.scrolls || bar.cut.length) problems.push(`Reiterleiste abgeschnitten: ${bar.cut.join(', ') || 'seitlich zu schieben'}`);
    if (bar.broken.length) problems.push(`Reiter brechen mitten im Wort um: ${[...new Set(bar.broken)].join(', ')}`);
    if (bar.covered.length) problems.push(`Reiterleiste überdeckt, was darüber steht: ${[...new Set(bar.covered)].slice(0, 3).join(' | ')}`);
  }
  /** Steuerelemente ohne Namen im Barrierefreiheitsbaum des Inspectors (nur sichtbare Teile). */
  const unnamed = async () => (await ins.ariaSnapshot()).split('\n')
    .filter(l => /^\s*- (button|slider|textbox|combobox|checkbox|radio|link|tab|spinbutton|switch|searchbox)(?=:|$)/.test(l)).map(l => l.trim());
  const visit = async label => {
    // Alle Abschnitte im sichtbaren Teil aufklappen, dann messen.
    await page.evaluate(() => document.querySelectorAll('#atlas-inspector details:not([open])').forEach(d => { if (!d.closest('[hidden]')) d.open = true; }));
    await page.waitForTimeout(250);
    const m = await page.evaluate(measure);
    if (m.minFont !== null && m.minFont < MIN_FONT) problems.push(`${label}: Schrift ${m.minFont} px (${m.minAt})`);
    if (m.pageOverflow) problems.push(`${label}: Seite läuft seitlich über`);
    if (m.inspectorOverflow) problems.push(`${label}: Inspector läuft seitlich über`);
    if (m.jumps.length) problems.push(`${label}: Überschriftenebene übersprungen: ${m.jumps.slice(0, 2).join(' | ')}`);
    const nameless = await unnamed();
    if (nameless.length) problems.push(`${label}: Steuerelemente ohne Namen: ${[...new Set(nameless)].slice(0, 4).join(' | ')}`);
    if (process.env.SHOTS) await page.screenshot({ path: path.join(OUT, 'shots', `${id}-${width}-${result.panels.length}.png`) });
    return m;
  };
  if (!n) {
    result.panels.push({ tab: '(ohne Reiter)', ...(await visit('ohne Reiter')) });
  } else {
    // Tastatur: ersten Reiter fokussieren, mit Pfeil rechts durch alle, dann Ende und Pos1.
    await tabs.first().focus();
    for (let i = 0; i < n; i++) {
      if (i > 0) await page.keyboard.press('ArrowRight');
      const label = result.tabs[i];
      const state = await tabs.nth(i).evaluate(el => ({ selected: el.getAttribute('aria-selected'), focused: document.activeElement === el, panel: el.getAttribute('aria-controls') }));
      if (state.selected !== 'true' || !state.focused) problems.push(`${label}: per Pfeiltaste nicht erreicht`);
      const panel = page.locator(`[id="${state.panel}"]`);
      const visible = await panel.evaluate(el => !el.hidden && el.textContent.trim().length > 40);
      if (!visible) problems.push(`${label}: Reiter leer oder verborgen`);
      const hiddenOthers = await page.evaluate(own => [...document.querySelectorAll('#atlas-inspector [role=tabpanel]')].filter(p => p.id !== own && !p.hidden).length, state.panel);
      if (hiddenOthers) problems.push(`${label}: andere Reiter nicht verborgen`);
      const m = await visit(label);
      result.panels.push({ tab: label, ...m });
      await tabs.nth(i).focus();
    }
    await page.keyboard.press('ArrowRight');
    if (await tabs.first().getAttribute('aria-selected') !== 'true') problems.push('Pfeil rechts springt am Ende nicht zum ersten Reiter');
    await page.keyboard.press('ArrowLeft');
    if (await tabs.nth(n - 1).getAttribute('aria-selected') !== 'true') problems.push('Pfeil links springt am Anfang nicht zum letzten Reiter');
    await page.keyboard.press('End');
    if (await tabs.nth(n - 1).getAttribute('aria-selected') !== 'true') problems.push('Ende wählt nicht den letzten Reiter');
    await page.keyboard.press('Home');
    if (await tabs.first().getAttribute('aria-selected') !== 'true') problems.push('Pos1 wählt nicht den ersten Reiter');
    // Tabulatortaste durch jeden Reiter (von oben, bis zu 30 Stopps): Kein Fokus darf unter einem klebenden Element liegen.
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      await page.evaluate(() => document.getElementById('atlas-inspector')?.scrollTo(0, 0));
      await tabs.nth(i).focus();
      const panelId = await tabs.nth(i).getAttribute('aria-controls');
      for (let k = 0; k < 30; k++) {
        await page.keyboard.press('Tab');
        const st = await page.evaluate(pid => ({ inside: !!document.getElementById(pid)?.contains(document.activeElement), cov: window.__coverage() }), panelId);
        if (!st.inside) break;
        if (st.cov) { problems.push(`${result.tabs[i]}: Fokus ${st.cov.y} px unter ${st.cov.by} (${st.cov.what})`); break; }
      }
    }
    await tabs.first().click();
    // Zustand: in jedem Reiter mit Schrittknöpfen den letzten Schritt wählen, alle Reiter wechseln, dann vergleichen.
    const chosen = {};
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      const steps = ins.locator('[role=tabpanel]:not([hidden]) .xw-steps button');
      const count = await steps.count();
      if (count > 1) { await steps.nth(count - 1).click(); chosen[i] = count - 1; }
    }
    for (let i = n - 1; i >= 0; i--) await tabs.nth(i).click();
    for (const [i, k] of Object.entries(chosen)) {
      await tabs.nth(Number(i)).click();
      const pressed = await ins.locator('[role=tabpanel]:not([hidden]) .xw-steps button').evaluateAll(list => list.findIndex(b => b.getAttribute('aria-pressed') === 'true'));
      if (pressed !== k) problems.push(`${result.tabs[i]}: Schritt nach dem Reiterwechsel verloren`);
    }
    result.stateChecked = Object.keys(chosen).length;
    await tabs.first().click();
    const tabIndex = name => result.tabs.findIndex(t => t.startsWith(name));
    // Fokus nach „Schritt k ansehen“: Der Sprung landet bei Schritt k (Schrittknopf gedrückt oder Karte markiert), der Fokus dort.
    const rTab = tabIndex('In R');
    if (rTab >= 0) {
      await tabs.nth(rTab).click();
      const nums = ins.locator('[role=tabpanel]:not([hidden]) .xw-num');
      for (let i = 0; i < await nums.count(); i++) {
        await nums.nth(i).click();
        const go = ins.locator('[role=tabpanel]:not([hidden])').getByRole('button', { name: /^Schritt \d+ ansehen$/ });
        if (!await go.count()) continue;
        const k = Number((await go.textContent()).match(/\d+/)[0]);
        await go.click();
        await page.waitForTimeout(300);
        const jump = await page.evaluate(k => {
          const panel = document.querySelector('#atlas-inspector [role=tabpanel]:not([hidden])'), a = document.activeElement;
          const pressed = [...panel.querySelectorAll('.xw-steps button[aria-pressed=true]')].some(b => b.textContent.includes(`Schritt ${k}`));
          const marked = !!panel.querySelector(`[aria-current=step]`) && panel.querySelector('[aria-current=step]').textContent.includes(`Schritt ${k} von`);
          return { ok: pressed || marked, focus: a && a !== document.body && panel.contains(a) };
        }, k);
        if (!jump.ok) problems.push(`„Schritt ${k} ansehen“ zeigt Schritt ${k} nicht`);
        if (!jump.focus) problems.push(`„Schritt ${k} ansehen“: Fokus nicht beim Schritt`);
        const cov = await page.evaluate(() => window.__coverage());
        if (cov) problems.push(`„Schritt ${k} ansehen“: Ziel ${cov.y} px unter ${cov.by} (${cov.what})`);
        break;
      }
      await tabs.first().click();
    }
    // Fokus nach Ausprobieren und Zurücksetzen (gemeinsamer Lehrdatensatz).
    const sTab = tabIndex('Mit 200 Befragten');
    if (sTab >= 0) {
      await tabs.nth(sTab).click();
      const panel = ins.locator('[role=tabpanel]:not([hidden])');
      const onBody = () => page.evaluate(() => document.activeElement === document.body);
      // Spaltenwechsel: eine andere passende Spalte wählen; „Zu … wechseln“ führt zurück, der Fokus bleibt im Reiter.
      const picker = panel.locator('.column-picker select').first();
      if (await picker.count()) {
        const current = await picker.inputValue();
        const other = await picker.evaluate((el, cur) => [...el.querySelectorAll('optgroup:first-of-type option')].find(o => !o.disabled && o.value !== cur)?.value ?? null, current);
        if (other) {
          await picker.selectOption(other);
          const back = panel.getByRole('button', { name: /^Zu .* wechseln$/ });
          if (await back.count()) {
            await back.click();
            await page.waitForTimeout(300);
            if (await onBody()) problems.push('Fokus nach „Zu … wechseln“ verloren');
          }
          if (await picker.inputValue() !== current) await picker.selectOption(current);
        }
      }
      const tryOnce = async () => {
        const q = panel.locator('.xw-question').first();
        if (!await q.count()) return false;
        await q.locator('.xw-options button').first().click();
        const tryIt = q.getByRole('button', { name: /^Ausprobieren/ });
        if (!await tryIt.count()) return false;
        await tryIt.click();
        return true;
      };
      if (await tryOnce()) {
        const reset = panel.getByRole('button', { name: 'Ausgangsdaten wiederherstellen' });
        if (await reset.count()) {
          await reset.click();
          await page.waitForTimeout(300);
          if (await onBody()) problems.push('Fokus nach „Ausgangsdaten wiederherstellen“ verloren');
        }
      }
      // Dasselbe über „Zurücksetzen“ in der Kopfzeile: Der Knopf verschwindet danach, der Fokus darf nicht auf die Seite fallen.
      if (await tryOnce()) {
        const toolbar = page.locator('.network-reset-button');
        if (await toolbar.isVisible().catch(() => false)) {
          await toolbar.click();
          await page.waitForTimeout(300);
          if (await onBody()) problems.push('Fokus nach „Zurücksetzen“ in der Kopfzeile verloren');
        } else problems.push('Kopfzeile zeigt nach „Ausprobieren“ kein „Zurücksetzen“');
      }
      await tabs.first().click();
    }
    // „Weiter“: jedes Ziel einmal; der Link „Als Nächstes“ öffnet den Begriff, der Fokus landet nicht auf der Seite.
    const wTab = tabIndex('Weiter');
    if (wTab >= 0) {
      await tabs.nth(wTab).click();
      const titles = await ins.locator('[role=tabpanel]:not([hidden]) .relation-link strong').allTextContents();
      const twice = titles.filter((t, i) => titles.indexOf(t) !== i);
      if (twice.length) problems.push(`Weiter: doppelte Ziele ${[...new Set(twice)].join(', ')}`);
      await ins.locator('[role=tabpanel]:not([hidden]) .xw-next-main button').first().click();
      await page.waitForTimeout(400);
      if (await page.evaluate(() => document.activeElement === document.body)) problems.push('Fokus nach dem Link „Als Nächstes“ verloren');
    }
  }
  result.consoleErrors = [...errors];
  if (errors.length) problems.push(`Konsole: ${errors.slice(0, 3).join(' | ')}`);
  result.minFont = Math.min(...result.panels.map(p => p.minFont ?? Infinity));
  return { ...result, problems };
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const all = {};
  try {
    for (const width of SIZES) {
      const context = await browser.newContext({ viewport: { width, height: width <= 480 ? 844 : 900 }, ...(width <= 480 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
      await context.addInitScript(mode => {
        try { localStorage.setItem('statistikatlas.erklaerung.v1', mode); } catch { /* ohne Speicher: Ausführlich */ }
        window.__atlasTools = {};
        document.modelContext = { registerTool: tool => { window.__atlasTools[tool.name] = tool; } };
      }, process.env.MODE === 'kompakt' ? 'kompakt' : 'ausfuehrlich');
      await context.addInitScript({ content: `window.__coverage = ${coverage.toString()};` });
      const page = await context.newPage(), errors = [];
      page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(`${BASE.replace(/\/$/, '')}/?ansicht=karte`);
      await page.waitForFunction(() => window.__atlasTools?.open_atlas_concept);
      for (const id of IDS) {
        let r;
        try { r = await checkConcept(page, id, width, errors); }
        catch (e) {
          const at = String(e.stack ?? '').split('\n').find(l => l.includes('check-explanations')) ?? '';
          r = { id, width, problems: [`Abbruch: ${String(e).split('\n')[0]}${at ? ` (${at.trim().replace(/^at /, '').replace(/.*check-explanations\.cjs/, 'Zeile')})` : ''}`] };
        }
        errors.length = 0;                                   // Meldungen beim Laden zählen zum ersten Begriff
        (all[id] ??= []).push(r);
        console.log(JSON.stringify({ id, width, mode: process.env.MODE === 'kompakt' ? 'kompakt' : 'ausführlich', title: r.title, via: r.openedVia, tabs: r.tabs, minFont: r.minFont, problems: r.problems, ...(r.hinweise ? { hinweise: r.hinweise } : {}) }));
      }
      await context.close();
    }
  } finally { await browser.close(); }
  for (const [id, runs] of Object.entries(all)) fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(runs, null, 2));
  const summary = Object.fromEntries(Object.entries(all).map(([id, runs]) => [id, runs.flatMap(r => r.problems.map(p => `${r.width}px: ${p}`))]));
  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
  const bad = Object.values(summary).filter(p => p.length).length;
  console.log(bad ? `${bad} von ${IDS.length} Begriffen mit Befund, Einzelheiten in ${OUT}/summary.json` : `Alle ${IDS.length} Begriffe ohne Befund bei ${SIZES.join(', ')} px.`);
  process.exit(bad ? 1 : 0);
})();
