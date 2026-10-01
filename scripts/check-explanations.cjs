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
 *   Telefon), alle Reiter liegen ganz in der Leiste (nichts abgeschnitten, kein seitliches Schieben nötig);
 * - Tastatur: Pfeil rechts durch alle Reiter, Pfeil links zurück, Ende, Pos1; jedes Panel hat Inhalt, die anderen sind verborgen;
 * - in jedem Reiter (alle Abschnitte aufgeklappt): Konsolenfehler und -warnungen, kleinste Schrift sichtbarer Texte
 *   (berechnete font-size; Bilder zeichnet der Baukasten 1 : 1, eine Skalierung des SVG misst das Skript nicht),
 *   seitliches Überlaufen von Seite und Inspector, Steuerelemente ohne zugänglichen Namen (Barrierefreiheitsbaum);
 * - Zustand: Ein gewählter Schritt bleibt nach einem Reiterwechsel erhalten;
 * - „Weiter“: jedes Ziel nur einmal;
 * - Fokus: nach „Schritt k ansehen“ in „In R“ steht der Fokus bei Schritt k im richtigen Reiter, nach „Ausprobieren“
 *   und „Ausgangsdaten wiederherstellen“ und nach dem Link „Als Nächstes“ nicht auf der Seite (body).
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
  const doc = document.scrollingElement || document.documentElement;
  return {
    minFont: Number.isFinite(minFont) ? minFont : null, minAt,
    pageOverflow: doc.scrollWidth > window.innerWidth + 1,
    inspectorOverflow: ins.scrollWidth > ins.clientWidth + 1,
    inspectorWidth: ins.clientWidth,
  };
}

async function openConcept(page, id) {
  // Titel über das Atlas-Werkzeug erfragen, dann über die Suche öffnen; sonst direkt über das Werkzeug.
  const title = await page.evaluate(i => window.__atlasTools?.open_atlas_concept?.execute({ id: i })?.title ?? null, id);
  if (!title) return { title: null, via: 'nicht gefunden' };
  await page.waitForFunction(i => window.__atlasTools.read_atlas_state.execute({})?.selected?.id === i, id);
  const whole = page.getByRole('button', { name: 'Ganze Karte' }).first();
  if (await whole.isVisible().catch(() => false)) await whole.click();
  const search = page.getByRole('searchbox', { name: 'Begriff im Netzwerk finden' });
  await search.fill(title);
  const results = page.locator('.network-search-results > button');
  const count = await results.count();
  let picked = -1;
  for (let i = 0; i < count && picked < 0; i++) {
    const strong = (await results.nth(i).locator('strong').textContent())?.trim();
    const small = (await results.nth(i).locator('small').textContent())?.trim();
    if (strong === title) picked = i;
    else if (count === 1) picked = i;
    else if (small && i === 0 && title.length > 3 && strong && title.includes(strong)) picked = i;
  }
  if (picked >= 0) {
    await results.nth(picked).click();
    await page.waitForSelector('#inspector-title');
    const shown = (await page.locator('#inspector-title').textContent())?.trim();
    const opened = await page.evaluate(() => window.__atlasTools?.read_atlas_state?.execute({})?.selected?.id);
    if (opened === id) return { title: shown, via: 'Suche' };
  }
  await page.evaluate(i => window.__atlasTools.open_atlas_concept.execute({ id: i }), id);
  await page.waitForFunction(i => window.__atlasTools.read_atlas_state.execute({})?.selected?.id === i, id);
  await page.waitForSelector('#inspector-title');
  return { title: (await page.locator('#inspector-title').textContent())?.trim(), via: 'Werkzeug' };
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
  if (opened.via !== 'Suche') result.hinweise = [`über das Werkzeug geöffnet, die Suche fand „${opened.title}“ nicht eindeutig`];
  if (n) {
    // Gleich nach dem Öffnen: Leiste sichtbar (nicht unter dem Kopf, nicht unter dem Rand des Blatts), alle Reiter ganz darin.
    const bar = await page.evaluate(() => {
      const ins = document.getElementById('atlas-inspector'), bar = ins.querySelector('[role=tablist]'), head = ins.querySelector('.inspector-top');
      const ib = ins.getBoundingClientRect(), bb = bar.getBoundingClientRect(), hb = head?.getBoundingClientRect();
      const top = Math.max(ib.top, getComputedStyle(head ?? ins).position === 'sticky' ? hb.bottom : ib.top), bottom = Math.min(ib.bottom, innerHeight);
      const cut = [...bar.querySelectorAll('[role=tab]')].filter(t => { const r = t.getBoundingClientRect(); return r.left < bb.left - 1 || r.right > bb.right + 1 || t.scrollWidth > t.clientWidth + 1; }).map(t => t.textContent);
      return { visible: bb.top >= top - 1 && bb.bottom <= bottom + 1, scrolls: bar.scrollWidth > bar.clientWidth + 1, cut, top: Math.round(bb.top), area: [Math.round(top), Math.round(bottom)] };
    });
    if (!bar.visible) problems.push(`Reiterleiste beim Öffnen nicht im sichtbaren Teil (oben ${bar.top}, sichtbar ${bar.area.join(' bis ')})`);
    if (bar.scrolls || bar.cut.length) problems.push(`Reiterleiste abgeschnitten: ${bar.cut.join(', ') || 'seitlich zu schieben'}`);
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
        break;
      }
      await tabs.first().click();
    }
    // Fokus nach Ausprobieren und Zurücksetzen (gemeinsamer Lehrdatensatz).
    const sTab = tabIndex('Mit 200 Befragten');
    if (sTab >= 0) {
      await tabs.nth(sTab).click();
      const panel = ins.locator('[role=tabpanel]:not([hidden])'), q = panel.locator('.xw-question').first();
      if (await q.count()) {
        await q.locator('.xw-options button').first().click();
        const tryIt = q.getByRole('button', { name: /^Ausprobieren/ });
        if (await tryIt.count()) {
          await tryIt.click();
          const reset = panel.getByRole('button', { name: 'Ausgangsdaten wiederherstellen' });
          if (await reset.count()) {
            await reset.click();
            await page.waitForTimeout(300);
            if (await page.evaluate(() => document.activeElement === document.body)) problems.push('Fokus nach „Ausgangsdaten wiederherstellen“ verloren');
          }
        }
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
      const page = await context.newPage(), errors = [];
      page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(`${BASE.replace(/\/$/, '')}/?ansicht=karte`);
      await page.waitForFunction(() => window.__atlasTools?.open_atlas_concept);
      for (const id of IDS) {
        let r;
        try { r = await checkConcept(page, id, width, errors); }
        catch (e) { r = { id, width, problems: [`Abbruch: ${String(e).split('\n')[0]}`] }; }
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
