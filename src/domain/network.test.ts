import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactFlowProvider } from '@xyflow/react';
import App from '../App';
import { ConceptInspector } from '../components/ConceptInspector';
import { concepts, connections } from './concepts';
import { defaultPairs } from './statistics';
import { ref, lessonContext, type Route } from './learning';
import { places, mapRelations, neighbors, relatedIds, referenceInMap, routeAfterSelection } from './network';
import { initialExploration, visit, step } from './exploration';

test('all concepts keep a unique non-overlapping place across every selection and route',()=>{
 const initial=JSON.stringify(places),ids=new Set(concepts.map(c=>c.id));
 assert.equal(ids.size,36);assert.equal(connections.length,70);assert.deepEqual(new Set(Object.keys(places)),ids);
 for(const a of concepts)for(const b of concepts){if(a.id===b.id)continue;const p=places[a.id],q=places[b.id];assert.ok(Math.abs(p.x-q.x)>=196||Math.abs(p.y-q.y)>=112,`${a.id} overlaps ${b.id}`);}
 for(const c of concepts)for(const route of ['covariance','z'] as Route[]){const edges=mapRelations(ref(c.id),route);assert.equal(new Set(edges.map(e=>e.id)).size,edges.length);for(const e of edges)assert.ok(ids.has(e.source)&&ids.has(e.target));for(const e of connections)assert.ok(edges.some(next=>next.id===e.id));}
 assert.equal(JSON.stringify(places),initial);
});

test('relationships are traversable in both directions and preserve contextual uses',()=>{
 const mean=ref('mean','y'),n=neighbors(mean.id,mean);
 assert.ok(n.before.some(e=>e.source==='sum'));assert.ok(n.after.some(e=>e.target==='deviation'));
 assert.deepEqual(referenceInMap('divide',mean,'covariance'),ref('divide','y','mean'));
 assert.deepEqual(referenceInMap('sd',ref('z','y'),'z'),ref('sd','y'));
 assert.deepEqual(referenceInMap('crossproduct_sum',ref('pearson'),'z'),ref('crossproduct_sum','x','z'));
 assert.deepEqual(referenceInMap('crossproduct_sum',ref('covariance'),'z'),ref('crossproduct_sum'));
 assert.equal(referenceInMap('sd',ref('sd','y'),'z').id,referenceInMap('sd',ref('sd','x'),'z').id);
});

test('standardized products never claim to be the raw covariance numerator',()=>{
 const product=ref('crossproduct','x','z'),sum=ref('crossproduct_sum','x','z');
 const p=neighbors(product.id,product,'z'),s=neighbors(sum.id,sum,'z');
 assert.ok(p.before.some(e=>e.source==='z'&&!e.alternative));
 assert.ok(p.before.some(e=>e.source==='deviation'&&e.alternative));
 assert.ok(s.after.some(e=>e.target==='pearson'&&!e.alternative));
 assert.ok(s.after.some(e=>e.target==='covariance'&&e.alternative));
 assert.deepEqual(referenceInMap('crossproduct_sum',product,'z'),sum);
 const raw=neighbors('crossproduct_sum',ref('crossproduct_sum'),'z');
 assert.ok(raw.after.some(e=>e.target==='covariance'&&!e.alternative));
});

test('tracing prerequisites follows the selected Pearson route and the actual operation',()=>{
 const z=relatedIds(ref('pearson'),true,'z'),cov=relatedIds(ref('pearson'),true,'covariance');
 for(const id of ['z','centering','scaling','sd','variance','mean','series','df'])assert.ok(z.has(id),id);
 assert.ok(!z.has('covariance'));assert.ok(!z.has('sd_product'));assert.ok(cov.has('covariance'));assert.ok(cov.has('sd_product'));assert.ok(!cov.has('z'));
 const op=neighbors('divide',ref('divide','y','pearson'),'z');
 assert.ok(op.before.some(e=>e.source==='crossproduct_sum'&&!e.alternative));
 assert.ok(op.before.some(e=>e.source==='df'&&!e.alternative));
 assert.ok(op.after.some(e=>e.target==='mean'&&e.alternative));
 const scaling=neighbors('scaling',ref('scaling','y','z'),'z');
 assert.ok(scaling.before.some(e=>e.source==='centering'&&!e.alternative));assert.ok(scaling.after.some(e=>e.target==='z'&&!e.alternative));
});

test('following a route into Pearson opens the corresponding formula',()=>{
 assert.equal(routeAfterSelection(ref('crossproduct_sum','x','z'),ref('pearson'),'covariance'),'z');
 assert.equal(routeAfterSelection(ref('z','y'),ref('pearson'),'covariance'),'z');
 assert.equal(routeAfterSelection(ref('covariance'),ref('pearson'),'z'),'covariance');
 assert.equal(routeAfterSelection(ref('mean'),ref('sd'),'z'),'z');
});

test('back and forward restore the complete view and actual viewport without storing datasets',()=>{
 const start=initialExploration('b'),wide={x:30,y:40,zoom:.5},focused={x:-240,y:-120,zoom:.9};
 const y={...start.present,selected:ref('sd','y'),variable:'y' as const,caseId:'c',route:'z' as const,trace:true,panelOpen:true};
 const first=visit(start,y,wide),second=visit(first,{...y,selected:ref('variance','y')},focused);
 const back=step(second,'back',{x:0,y:0,zoom:1},['a','b','c']);
 assert.deepEqual(back.present,{...y,viewport:focused});
 assert.deepEqual(step(back,'back',focused,['a','b','c']).present,{...start.present,viewport:wide});
 const forward=step(back,'forward',focused,['a','b','c']);assert.equal(forward.present.selected?.id,'variance');assert.deepEqual(forward.present.viewport,{x:0,y:0,zoom:1});
 assert.ok(!('pairs' in back.present));assert.equal(visit(back,{...y,selected:ref('z','y')},focused).future.length,0);
 const removed=step(second,'back',undefined,['a','b']);assert.equal(removed.present.caseId,'a');
});

test('the initial surface starts on the network without procedure tabs or a selected lesson',()=>{
 const html=renderToStaticMarkup(createElement(ReactFlowProvider,null,createElement(App)));
 assert.match(html,/gesamte interaktive Netzkarte/);assert.match(html,/Wo möchtest du anfangen/);
 assert.doesNotMatch(html,/entry-nav|role="tab"|id="inspector-title"/);
 assert.match(html,/Datensatz mit 200 Befragten öffnen/);
});

test('inspectors render every concept, distinguish other uses and hide irrelevant X/Y switches',()=>{
 const noop=()=>{},context=lessonContext(defaultPairs,defaultPairs[1].id,'z');
 function render(selected:ReturnType<typeof ref>){return renderToStaticMarkup(createElement(ConceptInspector,{selected,context,highlight:null,onHighlight:noop,onSelect:noop,onHover:noop,onClose:noop,onFocusMap:noop,onCase:noop,onPairs:noop,onReset:noop,resetRevision:0,onVariable:noop,onRoute:noop,trace:false,onTrace:noop,experimentOpen:false,experimentRequest:0,onExperimentFocused:noop,onExperiment:noop}));}
 for(const c of concepts){const html=render(ref(c.id));assert.match(html,/Von hier aus weiter/);assert.doesNotMatch(html,/NaN|Infinity/);}
 for(const id of ['validn','df','pearson'])assert.doesNotMatch(render(ref(id)),/aria-label="Variable betrachten"/);
 assert.match(render(ref('sd','y')),/aria-label="Variable betrachten"/);
 const sum=render(ref('crossproduct_sum','x','z'));
 assert.match(sum,/Weitere Verwendungen &amp; Rechenwege/);assert.match(sum,/Summe unstandardisierter Abweichungsprodukte/);
});
