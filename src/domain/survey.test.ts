import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { surveyColumns, columnById, createSurvey, projectPairs, defaultSelection, validSurvey, compatible, reconcileColumns, updateProjectedPairs, validColumnValue, type ColumnSelection } from './survey';
import { averageRanks, middleValues, spearman, crossTable, distributionGroups, previewIndices } from './descriptive';
import { ref, keyOf, inputs, lessonContext, valueFor, unitFor, conditions, displayValue, contextFor, allowedFor, introduction, interpretation } from './learning';
import { formulaFor, type Expression } from './formulas';
import { incomingPaths, mapRelations, referenceInMap } from './network';
import { nodeTypes, nodeInteraction } from '../components/NetworkMap';
import { Formula } from '../components/Formula';
import { ConceptInspector } from '../components/ConceptInspector';
import { SurveyData } from '../components/SurveyData';
import { SurveyExperiment } from '../components/SurveyExperiment';
import { concepts } from './concepts';
const rows=createSurvey(),noop=()=>{},close=(a:number|null,b:number)=>assert.ok(a!==null&&Math.abs(a-b)<1e-10,`${a} != ${b}`);
const context=(selection:ColumnSelection=defaultSelection)=>lessonContext(projectPairs(rows,selection),'P137','covariance',{x:columnById[selection.x],y:columnById[selection.y]},selection.likertMetric);
function targets(e:Expression):ReturnType<typeof ref>[]{if(typeof e==='string')return [];switch(e.type){case 'term':return [e.target];case 'row':return e.items.flatMap(targets);case 'fraction':return [e.operation,...targets(e.top),...targets(e.bottom)];case 'sum':return [e.target,e.count,...targets(e.body)];case 'power':case 'root':return [e.operation,...targets(e.body)];}}

test('the reproducible survey contains exactly 200 unique respondents and valid values in all 16 columns',()=>{
 assert.equal(rows.length,200);assert.equal(surveyColumns.length,16);assert.deepEqual(rows,createSurvey());assert.ok(validSurvey(rows));assert.equal(rows[199].id,'P200');
 for(const c of surveyColumns){for(const r of rows)assert.ok(validColumnValue(c,r.values[c.id]),`${r.id}/${c.id}`);if(c.categories)for(const k of c.categories)assert.ok(rows.some(r=>r.values[c.id]===k.value),`${c.id} misses category ${k.value}`);}
 for(const size of [5,7,10]){const c=surveyColumns.find(c=>c.kind==='likert'&&c.categories?.length===size)!;assert.equal(c.min,1);assert.equal(c.max,size);assert.equal(c.scale,'ordinal');}
 assert.ok(rows.some(r=>r.values.lernzeit%1!==0));assert.ok(!validSurvey(rows.slice(0,199)));
});

test('variable eligibility follows scale meaning, with explicit metric treatment of Likert and binary indicators',()=>{
 for(const id of ['mean','variance','sd','z','pearson']){assert.ok(compatible(id,columnById.einkommen));assert.ok(compatible(id,columnById.lernplanung5));assert.ok(compatible(id,columnById.erwerbstaetig));assert.ok(!compatible(id,columnById.schulabschluss));assert.ok(!compatible(id,columnById.geschlecht));assert.ok(!compatible(id,columnById.lernplanung5,false));}
 for(const id of ['median','ranks','spearman']){assert.ok(compatible(id,columnById.schulabschluss));assert.ok(compatible(id,columnById.finanzlage));assert.ok(!compatible(id,columnById.berufsabschluss));}
 assert.ok(compatible('crosstab',columnById.lernplanung5));assert.ok(!compatible('crosstab',columnById.einkommen));assert.ok(compatible('frequency',columnById.einkommen));
 const selected=reconcileColumns('pearson',{x:'geschlecht',y:'schulabschluss',likertMetric:true});assert.ok(compatible('pearson',columnById[selected.x]));assert.ok(compatible('pearson',columnById[selected.y]));assert.notEqual(selected.x,selected.y);
 const duplicate=reconcileColumns('series',{...defaultSelection,y:defaultSelection.x});assert.notEqual(duplicate.x,duplicate.y);
});

test('editing a projection preserves all respondent IDs, unselected columns and the 200-row dataset',()=>{
 const pairs=projectPairs(rows,defaultSelection),next=updateProjectedPairs(rows,defaultSelection,pairs.map((p,i)=>i===136?{...p,x:12.5}:p));
 assert.equal(next[136].values.lernzeit,12.5);assert.equal(next.length,200);assert.deepEqual(next.map(r=>r.id),rows.map(r=>r.id));
 for(let i=0;i<rows.length;i++)for(const c of surveyColumns)if(i!==136||c.id!=='lernzeit')assert.equal(next[i].values[c.id],rows[i].values[c.id]);
 const invalid=updateProjectedPairs(rows,{...defaultSelection,x:'schulabschluss'},[{id:'P001',x:2.5,y:rows[0].values.wissenstest}]);assert.equal(invalid[0].values.schulabschluss,rows[0].values.schulabschluss);
 assert.ok(validSurvey(next));
});

test('nominal/ordinal codes never leak into unsupported numeric results and units follow columns',()=>{
 const nominal=context({...defaultSelection,x:'geschlecht'});assert.equal(valueFor(ref('mean'),nominal),null);assert.equal(valueFor(ref('pearson','x',undefined,'ranks'),nominal),null);assert.ok(conditions(ref('mean'),nominal).some(c=>c.ok===false));
 const income=context({...defaultSelection,x:'einkommen',y:'schlafdauer'});assert.equal(unitFor(ref('mean'),income),'€/Monat');assert.equal(unitFor(ref('variance'),income),'(€/Monat)²');assert.equal(unitFor(ref('covariance'),income),'€/Monat · h/Nacht');
 const likert=context({...defaultSelection,x:'lernplanung5'});assert.ok(conditions(ref('mean'),likert).some(c=>c.text.includes('gleich groß')));assert.equal(unitFor(ref('mean'),likert),'');
});

test('tied ranks reproduce Spearman through the reusable Pearson calculation',()=>{
 const pairs=[{id:'a',x:1,y:1},{id:'b',x:1,y:2},{id:'c',x:2,y:2},{id:'d',x:3,y:3}],c=lessonContext(pairs,'c','covariance',{x:columnById.schulabschluss,y:columnById.finanzlage});
 assert.deepEqual(averageRanks(pairs.map(p=>p.x)),[1.5,1.5,3,4]);assert.deepEqual(averageRanks(pairs.map(p=>p.y)),[1,2.5,2.5,4]);close(spearman(pairs),5/6);
 close(valueFor(ref('pearson','x',undefined,'ranks'),c),5/6);assert.equal(valueFor(ref('pearson'),c),null);
 for(const route of ['covariance','z'] as const){const local={...c,route},root=ref('pearson','x',undefined,'ranks'),seen=new Set<string>();function walk(r:ReturnType<typeof ref>){if(seen.has(keyOf(r)))return;seen.add(keyOf(r));assert.ok(allowedFor(r,local),keyOf(r));const html=renderToStaticMarkup(createElement(Formula,{reference:r,context:local,onSelect:noop}));assert.doesNotMatch(html,/NaN|Infinity|Wähle eine passende/);for(const t of targets(formulaFor(r,local)))assert.ok(allowedFor(t,local),`${keyOf(r)} -> ${keyOf(t)}`);inputs(r,route).forEach(walk);}walk(root);close(valueFor(root,local),5/6);}
 assert.equal(unitFor(ref('sd','x',undefined,'ranks'),c),'Rang');assert.deepEqual(contextFor(ref('mean','y',undefined,'ranks'),c).pairs.map(p=>p.y),[1,2.5,2.5,4]);
});

test('ordinal medians return existing middle categories and metric medians average the central values',()=>{
 const c=lessonContext([{id:'a',x:0,y:2},{id:'b',x:1,y:4},{id:'c',x:2,y:6},{id:'d',x:4,y:10}],'a','covariance',{x:columnById.schulabschluss,y:columnById.lernzeit});
 assert.deepEqual(middleValues(c.pairs.map(p=>p.x)),[1,2]);assert.equal(valueFor(ref('median'),c),null);assert.equal(displayValue(ref('median'),c),'Haupt-/Volksschulabschluss / Mittlerer Abschluss');assert.equal(valueFor(ref('median','y'),c),5);
});

test('frequency groups, histogram classes and cross-table margins all cover the same 200 respondents',()=>{
 for(const c of surveyColumns){const values=rows.map(r=>r.values[c.id]),groups=distributionGroups(values,c);assert.equal(groups.reduce((n,g)=>n+g.count,0),200,c.id);assert.equal(new Set(groups.flatMap(g=>g.indices)).size,200,c.id);close(groups.reduce((n,g)=>n+g.proportion,0),1);}
 const pairs=projectPairs(rows,{...defaultSelection,x:'geschlecht',y:'schulabschluss'}),table=crossTable(pairs,[0,1,2,3],[0,1,2,3,4]);assert.equal(table.n,200);assert.equal(table.rowTotals.reduce((a,b)=>a+b,0),200);assert.equal(table.columnTotals.reduce((a,b)=>a+b,0),200);
});

test('numeric sums use all 200 cases while keeping only a few linked contributions in the formula',()=>{
 const c=context();assert.deepEqual(previewIndices(200,136),[0,1,136,199]);for(const id of ['sum','ss','crossproduct_sum','series','count']){const html=renderToStaticMarkup(createElement(Formula,{reference:ref(id),context:c,onSelect:noop,numeric:true}));assert.ok((html.match(/<button/g)||[]).length<15,id);assert.match(html,/200/);assert.doesNotMatch(html,/NaN|Infinity/);}
 close(valueFor(ref('sum'),c),c.pairs.reduce((n,p)=>n+p.x,0));
});

test('hover follows only incoming paths, including distant ancestors and the current z route',()=>{
 const mean=incomingPaths('mean',mapRelations(ref('mean'),'covariance'));for(const id of ['series','sum','count','validn'])assert.ok(mean.nodes.has(id));assert.ok(!mean.nodes.has('deviation'));assert.ok(!mean.edges.has('mean--deviation'));
 const sd=incomingPaths('sd',mapRelations(ref('sd'),'covariance'));assert.ok(sd.nodes.has('series'));assert.ok(!sd.nodes.has('z'));
 const z=incomingPaths('pearson',mapRelations(ref('pearson'),'z'));assert.ok(z.edges.has('z--crossproduct'));assert.ok(!z.edges.has('deviation--crossproduct'));assert.ok(!z.nodes.has('covariance'));
 const ranks=referenceInMap('pearson',ref('spearman'),'covariance');assert.equal(ranks.basis,'ranks');
});

test('React Flow wrappers retain pointer hit-testing when selection and dragging are disabled',()=>{
 const node={id:'mean',type:'concept',position:{x:0,y:0},width:196,height:112,...nodeInteraction,data:{reference:ref('mean'),context:context(),active:false,related:true,hovered:false,visited:false,onSelect:noop,onHover:noop}};
 const html=renderToStaticMarkup(createElement(ReactFlowProvider,{initialNodes:[node],initialWidth:800,initialHeight:600,children:createElement(ReactFlow,{nodes:[node],nodeTypes,nodesDraggable:false,elementsSelectable:false})}));
 assert.match(html,/pointer-events:all/);assert.match(html,/z-index:3/);assert.match(html,/Mittelwert im Netzwerk erkunden/);
});

test('all 36 inspectors and their survey experiments render with eligible columns without invalid geometry',()=>{
 for(const concept of concepts){const selection=reconcileColumns(concept.id,{...defaultSelection,x:'geschlecht',y:'schulabschluss'}),c=context(selection),reference=ref(concept.id);const html=renderToStaticMarkup(createElement(ConceptInspector,{selected:reference,context:c,selection,onColumns:noop,onData:noop,highlight:null,onHighlight:noop,onSelect:noop,onHover:noop,onClose:noop,onFocusMap:noop,onCase:noop,onPairs:noop,onReset:noop,resetRevision:0,onVariable:noop,onRoute:noop,trace:false,onTrace:noop,experimentOpen:true,experimentRequest:0,onExperimentFocused:noop,onExperiment:noop}));assert.doesNotMatch(html,/NaN|Infinity|width="-/);assert.match(html,/P137/);assert.ok(html.length<140000,concept.id);}
 const c=context({...defaultSelection,x:'schulabschluss',y:'finanzlage'});const ranks=renderToStaticMarkup(createElement(SurveyExperiment,{reference:ref('spearman'),context:c,onPairs:noop,onCase:noop,onData:noop,onReset:noop}));assert.match(ranks,/Rang von Schulabschluss/);assert.doesNotMatch(ranks,/NaN|Infinity/);
 const dataset=renderToStaticMarkup(createElement(SurveyData,{rows,selection:defaultSelection,caseId:'P137',procedure:'mean',onCase:noop,onChange:noop,onSelection:noop,onReset:noop,onClose:noop}));assert.match(dataset,/P137/);assert.match(dataset,/P140/);assert.doesNotMatch(dataset,/<th scope="row"><button[^>]*>P001/);
});


test('rank basis survives condition links and the standardized-product map path',()=>{
 const c=context({...defaultSelection,x:'schulabschluss',y:'finanzlage'}),r=ref('pearson','x',undefined,'ranks');
 for(const condition of conditions(r,c))if(condition.target){assert.equal(condition.target.basis,'ranks');assert.ok(allowedFor(condition.target,c));}
 assert.equal(referenceInMap('crossproduct_sum',ref('z','y',undefined,'ranks'),'z').basis,'ranks');
 assert.match(introduction(ref('mean','x',undefined,'ranks'),c),/Rang von Schulabschluss/);
});

test('frequency division and rank notation retain the selected Y variable',()=>{
 const c=context({...defaultSelection,y:'lernplanung5'});
 const divides=targets(formulaFor(ref('frequency','y'),c)).filter(r=>r.id==='divide');assert.ok(divides.length);assert.ok(divides.every(r=>r.variable==='y'));
 const html=renderToStaticMarkup(createElement(Formula,{reference:ref('ranks','y'),context:c,onSelect:noop}));assert.match(html,/R\(yᵢ\)/);
});

test('household income, binary means and ordinal medians use the correct interpretation',()=>{
 const income=context({...defaultSelection,x:'einkommen'});assert.doesNotMatch(interpretation(ref('mean'),income),/pro Person/);assert.match(interpretation(ref('mean'),income),/Haushaltsnettoeinkommen/);
 const binary=context({...defaultSelection,x:'erwerbstaetig'});assert.match(interpretation(ref('mean'),binary),/% der Befragten antworten mit Ja/);
 const metric=renderToStaticMarkup(createElement(Formula,{reference:ref('median'),context:income,numeric:true,onSelect:noop}));assert.match(metric,/ \/ 2 ≈ /);assert.doesNotMatch(metric,/ · /);
});

test('projection safeguards also retain X edits if a caller supplies a duplicate column mapping',()=>{
 const selection={...defaultSelection,y:defaultSelection.x},pairs=projectPairs(rows,selection),next=updateProjectedPairs(rows,selection,[{...pairs[0],x:12.5}]);assert.equal(next[0].values.lernzeit,12.5);
});
