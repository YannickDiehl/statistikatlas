import { registerAtlasTools, type AtlasTool } from './atlasTools';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mariposaExports,mariposaEntries,entryById,functionToConcept,formulaParts,formulaTargets} from './mariposaCatalog';
import {exampleVariants,analysisCode,bootstrapCode,initialRSettings,validateRSettings,eligible,surveyCsv,rolesFor} from './mariposa';
import {createSurvey,migrateSurvey,surveyColumns,columnById,defaultSelection} from './survey';
import {concepts,conceptById,connections} from './concepts';
import {mapRelations,incomingPaths,regions,regionConcepts,places,referenceInMap} from './network';
import {ref} from './learning';
import {MariposaPanel} from '../components/MariposaPanel';
import {initialExploration,visit,step} from './exploration';
const rows=createSurvey(),noop=()=>{};
test('every public mariposa export has exactly one concept and an executable example variant',()=>{
 assert.equal(mariposaExports.length,80);assert.deepEqual(new Set(Object.keys(functionToConcept)),new Set(mariposaExports));
 for(const fn of mariposaExports){const found=mariposaEntries.filter(e=>e.variants.some(v=>v.fn===fn));assert.equal(found.length,1,fn);assert.ok(conceptById[found[0].id]);}
 assert.equal(functionToConcept.fre,functionToConcept.frequency);assert.equal(functionToConcept.write_sas,undefined);
 const snapshot=JSON.parse(readFileSync(new URL('../../scripts/mariposa-public-api.json',import.meta.url),'utf8'));assert.deepEqual(snapshot.exports,mariposaExports);
});
test('all example selections are valid, disjoint, typed and completely substituted',()=>{
 for(const example of exampleVariants()){assert.deepEqual(validateRSettings(example.entry,example.settings,true,rows),[],example.variant.label);assert.doesNotMatch(analysisCode(example.entry,example.settings),/UNKNOWN_|\{[a-z_]+\}/);}
 const t=entryById.t_test,bad=initialRSettings(t);bad.columns.group=['geschlecht'];assert.ok(validateRSettings(t,bad).length);
 const efa=initialRSettings(entryById.efa);assert.ok(validateRSettings(entryById.efa,efa,false).length);efa.columns.items=['lernplanung5','lernzuversicht7','statistikinteresse10'];assert.ok(validateRSettings(entryById.efa,efa).length);
 const repeated=rolesFor(entryById.wilcoxon_test)[0];assert.ok(!eligible(repeated,columnById.lernzuversicht7));
});
test('formula symbols including absolute-value bars resolve and every variant follows its own sources',()=>{
 assert.deepEqual(formulaParts('V = [[R(|dᵢ|)|paired_difference|Differenzbeträge ordnen]]')[1],{text:'R(|dᵢ|)',target:'paired_difference',hint:'Differenzbeträge ordnen'});
 for(const e of mariposaEntries)for(const formula of [e.formula,...e.variants.map(v=>v.formula||'')])for(const id of formulaTargets(formula))assert.ok(conceptById[id],id);
 const corrected=mapRelations(ref('chi_square','x','v1'),'covariance');assert.ok(corrected.some(e=>e.source==='expected'&&e.target==='chi_square'&&!e.alternative));
 const paired=ref('t_test','x','v3'),hover=mapRelations(ref('paired_difference'),'covariance',paired);
 assert.ok(hover.filter(e=>e.target==='t_test'&&e.source==='se').every(e=>e.alternative));
 assert.equal(referenceInMap('oneway_anova',ref('tukey_test'),'covariance').use,'v0');
 const tukey=mapRelations(ref('tukey_test'),'covariance');assert.ok(tukey.find(e=>e.source==='variance'&&e.target==='oneway_anova')?.alternative);
 const path=incomingPaths('t_test',mapRelations(paired,'covariance'));assert.ok(path.nodes.has('paired_difference'));
 assert.equal(referenceInMap('mean',ref('t_test','y','v2'),'covariance').variable,'y');
});
test('the expanded dataset preserves old edited cells and adds coherent learning blocks',()=>{
 const old=rows.map(r=>({...r,values:Object.fromEntries(surveyColumns.slice(0,16).map(c=>[c.id,r.values[c.id]]))}));old[10].values.einkommen=4321;
 const upgraded=migrateSurvey(old)!;assert.equal(upgraded[10].values.einkommen,4321);assert.equal(upgraded.length,200);assert.deepEqual(upgraded.map(r=>r.id),old.map(r=>r.id));
 for(const row of upgraded)for(const col of surveyColumns.slice(0,16))assert.equal(row.values[col.id],old.find(r=>r.id===row.id)!.values[col.id]);
 assert.ok(surveyColumns.filter(c=>/^methoden[1-5]$/.test(c.id)).every(c=>c.categories?.length===7));assert.equal(surveyCsv(rows).split('\r\n').length,201);assert.match(bootstrapCode(),/rep\("numeric", 28\)/);
});
test('R snippets retain the selected Y axis and the exact Spearman rank transformation',()=>{
 const props={onSelect:noop,onHover:noop,selection:{...defaultSelection,x:'lernzeit',y:'schlafdauer'}};
 const y=renderToStaticMarkup(createElement(MariposaPanel,{...props,entry:entryById.sd,reference:ref('sd','y')}));assert.match(y,/w_sd\(d, schlafdauer\)/);assert.doesNotMatch(y,/w_sd\(d, lernzeit\)/);
 const selection={...defaultSelection,x:'schulabschluss',y:'finanzlage'},ranked=renderToStaticMarkup(createElement(MariposaPanel,{...props,selection,entry:entryById.pearson,reference:ref('pearson','x',undefined,'ranks')}));
 assert.match(ranked,/ties.method/);assert.match(ranked,/rank\(d\$schulabschluss/);assert.match(ranked,/rank\(d\$finanzlage/);assert.match(ranked,/pearson_cor\(d, schulabschluss, finanzlage/);assert.doesNotMatch(ranked,/Spaltenauswahl anpassen/);
 const spearman=renderToStaticMarkup(createElement(MariposaPanel,{...props,selection:{...defaultSelection,x:'lernplanung5'},entry:entryById.spearman,reference:ref('spearman')}));assert.doesNotMatch(spearman,/Die Rechnung nimmt gleich große Abstände/);
});
test('all map regions contain stable individual concept places',()=>{
 const ids=regions.flatMap(r=>regionConcepts(r.id));assert.deepEqual(new Set(ids),new Set(concepts.map(c=>c.id)));assert.equal(ids.length,concepts.length);
 for(const region of regions)for(const id of regionConcepts(region.id)){const p=places[id];assert.ok(p.x>=region.x&&p.x+196<=region.x+region.width,id);assert.ok(p.y>=region.y&&p.y+112<=region.y+region.height,id);}
});
test('history restores complete R choices together with their variant and data columns',()=>{
 const start=initialExploration('P001'),rSettings={t_test:initialRSettings(entryById.t_test,2)},one={...start.present,selected:ref('t_test','x','v2'),rSettings,columns:{...defaultSelection,x:'schlafdauer'}};
 const first=visit(start,one),second=visit(first,{...one,selected:ref('t_test','x','v0'),rSettings:{t_test:initialRSettings(entryById.t_test)}}),back=step(second,'back',undefined,rows.map(r=>r.id));assert.deepEqual(back.present,{...one,viewport:undefined});
});

test('optional atlas tools use the same navigation action and reject unknown concepts',()=>{
 const registered:AtlasTool[]=[],signals:AbortSignal[]=[];let selected='mean';const stop=registerAtlasTools({registerTool:(tool,options)=>{registered.push(tool);signals.push(options.signal);}},{read:()=>({selected}),open:id=>{selected=id;}});
 assert.equal(registered.length,2);assert.equal(registered[0].annotations.readOnlyHint,true);assert.equal(registered[1].annotations.readOnlyHint,false);
 registered[1].execute({id:'std'});assert.deepEqual(registered[0].execute({}),{selected:'z'});assert.throws(()=>registered[1].execute({id:'made_up'}));assert.equal(selected,'z');stop();assert.ok(signals.every(s=>s.aborted));
});
