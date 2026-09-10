import { chromium } from '/Users/yannickdiehl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=path.resolve('artifacts');await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-networking']});
const errors=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)||!['http:','https:'].includes(u.protocol)?r.continue():r.abort();});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/');
 await page.getByTestId('detail-title').waitFor();await page.waitForTimeout(900);
 await page.screenshot({path:path.join(dir,'prototyp-desktop.png'),fullPage:true});
 console.log(JSON.stringify({errors,title:await page.getByTestId('detail-title').innerText(),nodes:await page.locator('[data-concept]').count(),size:await page.locator('.react-flow__viewport').getAttribute('style')},null,2));
 await page.getByRole('button',{name:'Standardabweichung: Bausteine aufklappen',exact:true}).click();
 await page.waitForTimeout(600);await page.screenshot({path:path.join(dir,'prototyp-aufgeklappt.png'),fullPage:true});
 await page.getByRole('button',{name:'Ausgewählten Knoten lesbar anzeigen',exact:true}).click();await page.waitForTimeout(400);
 await page.screenshot({path:path.join(dir,'prototyp-leseansicht.png'),fullPage:true});
 await page.getByRole('button',{name:'Ganzer Ausschnitt',exact:true}).click();await page.waitForTimeout(500);
 const clippedTitles=await page.locator('.concept-main').evaluateAll(nodes=>nodes.filter(n=>{
   const title=n.querySelector('strong').getBoundingClientRect(), value=n.querySelector('.concept-value').getBoundingClientRect(), label=n.querySelector('.concept-value-label').getBoundingClientRect();
   return title.bottom>value.top+.5 || label.bottom>n.getBoundingClientRect().bottom+.5;
 }).map(n=>n.querySelector('strong').textContent));
 assert.deepEqual(clippedTitles,[],'All 29 concept titles and values fit inside the node');
 const proseStyle=await page.locator('.detail-explanation').evaluate(n=>({font:getComputedStyle(n).fontFamily,size:getComputedStyle(n).fontSize,lineHeight:getComputedStyle(n).lineHeight}));
 assert(proseStyle.font.includes('Georgia')&&proseStyle.size==='16px','Explanations use Georgia at 16px');
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForTimeout(700);
 await page.screenshot({path:path.join(dir,'prototyp-mobile.png'),fullPage:true});
 const viewports=[];
 for(const width of [1440,1120,960,768,390,320]) {
   await page.setViewportSize({width,height:900});await page.waitForTimeout(100);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
   assert(!overflow,`No horizontal page overflow at ${width}px`);viewports.push({width,overflow});
 }
 assert.equal(errors.length,0,'No browser runtime errors');
 const report={checkedAt:new Date().toISOString(),viewports,proseStyle,clippedTitles,errors};
 await fs.writeFile(path.join(dir,'design-qa.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
