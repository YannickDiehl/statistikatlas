import { chromium } from '/Users/yannickdiehl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifacts = path.join(root, 'artifacts');
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--disable-background-networking', '--disable-component-update', '--disable-default-apps', '--no-first-run'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const blocked = [];
await context.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (['127.0.0.1', 'localhost'].includes(url.hostname) || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
  blocked.push(url.origin);
  return route.abort();
});
await context.addInitScript(() => localStorage.clear());
const page = await context.newPage();
page.setDefaultTimeout(8000);
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
const checks = [];
const textIs = async (locator, expected) => {
  let actual = '';
  for (let attempt = 0; attempt < 50; attempt++) {
    actual = (await locator.innerText()).trim();
    if (actual === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  assert.equal(actual, expected);
};
const check = async (name, test) => {
  try { await test(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, error: String(error) }); }
  console.log(`${checks.at(-1).passed ? 'PASS' : 'FAIL'} ${name}`);
};
const openLab = async () => {
  await page.getByRole('tab', { name: /Ausprobieren/ }).click();
  await page.locator('.exlab').waitFor({ state: 'visible' });
};
const reset = async () => {
  await openLab();
  await page.getByRole('button', { name: 'Datenlabor auf die fünf Ausgangswerte zurücksetzen' }).click();
};
const field = (axis, index) => page.getByRole('textbox', { name: `${axis}-Wert für Fall ${index}`, exact: true });
const pearson = () => page.locator('.exlab-correlation-value strong');
const settleCanvas = async () => {
  let previous = '';
  let steadyFrames = 0;
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const transform = await page.locator('.react-flow__viewport').getAttribute('style');
    steadyFrames = transform === previous ? steadyFrames + 1 : 0;
    if (steadyFrames >= 3) return;
    previous = transform;
  }
};

try {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.getByTestId('value-z').waitFor();
  await openLab();

  await check('Default Pearson r is 0.775; z for case 2 is -0.632', async () => {
    await textIs(pearson(), '0,775');
    await textIs(page.getByTestId('value-z'), '-0,632');
    await textIs(page.locator('.exlab-result').filter({ hasText: 'Mittelwert' }).locator('strong').first(), '3');
  });

  await check('Editing one X value updates z and the subsequently selected mean node', async () => {
    await field('x', 1).fill('6');
    await textIs(page.getByTestId('value-z'), '-1,265');
    await page.locator('.exlab-result').filter({ hasText: 'Mittelwert' }).click();
    await textIs(page.getByTestId('value-mean'), '4');
    await openLab();
    assert.equal(await page.locator('.exlab-point').count(), 5);
  });

  await check('Empty input remains visible and retains the last valid value', async () => {
    await field('x', 1).fill('');
    assert.equal(await field('x', 1).inputValue(), '');
    assert.equal(await field('x', 1).getAttribute('aria-invalid'), 'true');
    await page.locator('.exlab-input-hint').waitFor({ state: 'visible' });
    await textIs(page.getByTestId('value-mean'), '4');
  });

  await check('Invalid text does not propagate NaN; German decimal comma works', async () => {
    await field('x', 1).fill('keine Zahl');
    assert.equal(await field('x', 1).getAttribute('aria-invalid'), 'true');
    await textIs(page.getByTestId('value-mean'), '4');
    await field('x', 1).fill('2,5');
    assert.equal(await field('x', 1).getAttribute('aria-invalid'), 'false');
    await textIs(page.getByTestId('value-mean'), '3,3');
    assert.equal((await page.locator('body').innerText()).includes('NaN'), false);
  });

  await check('Constant X yields undefined z and Pearson, with no NaN', async () => {
    for (let i = 1; i <= 5; i++) await field('x', i).fill('3');
    await textIs(pearson(), 'nicht definiert');
    await textIs(page.getByTestId('value-z'), 'nicht definiert');
    await textIs(page.getByTestId('value-sd'), '0');
    assert.equal((await page.locator('body').innerText()).includes('NaN'), false);
  });

  await check('Very large finite inputs remain renderable; infinity is rejected', async () => {
    await field('x', 1).fill('1e308');
    assert.equal(await field('x', 1).getAttribute('aria-invalid'), 'false');
    const coordinates = await page.locator('.exlab-point circle').evaluateAll((circles) => circles.flatMap((circle) => [Number(circle.getAttribute('cx')), Number(circle.getAttribute('cy'))]));
    assert(coordinates.every(Number.isFinite));
    await field('x', 1).fill('1e309');
    assert.equal(await field('x', 1).getAttribute('aria-invalid'), 'true');
    assert.equal((await page.locator('body').innerText()).includes('NaN'), false);
    await reset();
  });

  await check('Adding, removing and minimum/maximum case boundaries work', async () => {
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: '+ Fall hinzufügen', exact: true }).click();
    assert.equal(await page.locator('.exlab-table tbody tr').count(), 8);
    assert.equal(await page.getByRole('button', { name: '+ Fall hinzufügen', exact: true }).isDisabled(), true);
    for (let i = 8; i > 2; i--) await page.getByRole('button', { name: `Fall ${i} entfernen`, exact: true }).click();
    assert.equal(await page.locator('.exlab-table tbody tr').count(), 2);
    assert.equal(await page.getByRole('button', { name: 'Fall 1 entfernen', exact: true }).isDisabled(), true);
    await reset();
    assert.equal(await page.locator('.exlab-table tbody tr').count(), 5);
    assert.equal(await field('x', 1).inputValue(), '1');
    await textIs(pearson(), '0,775');
  });

  await check('Each linked metric selects the corresponding concept', async () => {
    for (const [name, title] of [['Mittelwert', 'Arithmetisches Mittel'], ['Standardabweichung', 'Standardabweichung'], ['Pearson-Korrelation', 'Pearson-Korrelation']]) {
      await openLab();
      await page.locator('.exlab-result').filter({ hasText: name }).click();
      await textIs(page.getByTestId('detail-title'), title);
      assert.equal(await page.getByRole('tab', { name: 'Verstehen', exact: true }).getAttribute('aria-selected'), 'true');
    }
  });

  await reset();
  await page.locator('.focus-choices button').filter({ hasText: 'z-Standardisierung' }).click();
  await openLab();
  await settleCanvas();
  await page.screenshot({ path: path.join(artifacts, 'example-desktop.png'), fullPage: true });
  await page.locator('.details-panel').screenshot({ path: path.join(artifacts, 'example-desktop-panel.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await settleCanvas();
  await page.getByRole('tab', { name: /Ausprobieren/ }).scrollIntoViewIfNeeded();
  await page.locator('.exlab').scrollIntoViewIfNeeded();
  await check('Mobile data table and plot fit the viewport', async () => {
    const table = await page.locator('.exlab-table').boundingBox();
    const plot = await page.locator('.exlab-plot').boundingBox();
    assert(table && table.x >= 0 && table.x + table.width <= 390);
    assert(plot && plot.x >= 0 && plot.x + plot.width <= 390);
    await field('y', 2).fill('4,5');
    assert.equal(await field('y', 2).getAttribute('aria-invalid'), 'false');
    assert.notEqual(await pearson().innerText(), '0,775');
    await reset();
  });
  await page.screenshot({ path: path.join(artifacts, 'example-mobile.png'), fullPage: true });
  await page.locator('.exlab').screenshot({ path: path.join(artifacts, 'example-mobile-panel.png') });
  await check('No browser runtime errors', async () => assert.deepEqual(pageErrors, []));
} catch (error) {
  checks.push({ name: 'QA harness completion', passed: false, error: String(error) });
} finally {
  const report = { checkedAt: new Date().toISOString(), url: 'http://127.0.0.1:5173/', checks, passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, pageErrors, blockedExternalOrigins: [...new Set(blocked)] };
  await writeFile(path.join(artifacts, 'example-qa.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (report.failed) process.exitCode = 1;
}
