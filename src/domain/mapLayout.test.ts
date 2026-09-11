import test from 'node:test';
import assert from 'node:assert/strict';
import { mapConcepts, mapIds, detailIds, mapAnchor, visibleRelations, visibleRelated } from './visibleNetwork';
import { incomingPaths } from './network';
import { ref } from './learning';
import { relationStrength } from './gravitySolver';
import { organicLayout, pointGap, placeLabels } from './organicLayout';
import { coreIds, corePlaces, coreLabelOrder, overviewTitles, spineLinks } from './organicStructure';
import { gravityLayout, restingPlaces, dragLayout, type MapLayout } from './mapLayout';
import { initialExploration, visit, step } from './exploration';

function readable(layout:MapLayout){
 assert.deepEqual(new Set(Object.keys(layout)),mapIds);
 const entries=Object.entries(layout);
 for(const [i,[id,p]] of entries.entries()){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),id);for(const [other,q] of entries.slice(i+1))assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>=pointGap-1e-7,`${id} overlaps ${other}`);}
}
test('one connected statistical graph contracts arithmetic without losing important inputs',()=>{
 const edges=visibleRelations(null,'covariance').filter(e=>!e.alternative);
 assert.equal(mapConcepts.length,144);
 for(const e of edges)assert.ok(!detailIds.has(e.source)&&!detailIds.has(e.target));
 for(const [source,target] of [['series','mean'],['validn','mean'],['mean','ss'],['ss','variance'],['variance','sd'],['sd','pearson'],['covariance','pearson']])assert.ok(edges.some(e=>e.source===source&&e.target===target),`${source} → ${target}`);
 const visited=new Set<string>(),queue=['series'];while(queue.length){const id=queue.pop()!;if(visited.has(id))continue;visited.add(id);for(const e of edges)if(e.source===id)queue.push(e.target);else if(e.target===id)queue.push(e.source);}
 assert.deepEqual(visited,mapIds);
});
test('context, route and variant survive projection without introducing false rank prerequisites',()=>{
 for(const route of ['covariance','z'] as const){const edges=visibleRelations(ref('pearson','y'),route),path=incomingPaths('pearson',edges);assert.equal(path.nodes.has('covariance'),route==='covariance');assert.equal(path.nodes.has('z'),route==='z');for(const id of path.nodes)assert.ok(mapIds.has(id));}
 assert.equal(mapAnchor(ref('sqrt','y','sd'))?.id,'sd');assert.equal(mapAnchor(ref('sqrt','y','sd'))?.variable,'y');
 assert.deepEqual(mapAnchor(ref('subtract','y','df'),ref('variance','y')),ref('variance','y'));
 assert.deepEqual(visibleRelated(ref('subtract','y','df'),false,'covariance',ref('variance','y')),visibleRelated(ref('variance','y'),false,'covariance'));
 assert.ok(incomingPaths('se',visibleRelations(ref('se'),'covariance')).nodes.has('sd'));
 const p=incomingPaths('p_value',visibleRelations(ref('p_value'),'covariance'));assert.ok(p.nodes.has('null_distribution'));assert.ok(p.nodes.has('t_test'));
 assert.ok(!incomingPaths('t_test',visibleRelations(ref('t_test'),'covariance')).edges.has('p_value--t_test--build--active'));
 const paired=incomingPaths('t_test',visibleRelations(ref('t_test','x','v3'),'covariance'));
 assert.ok(paired.nodes.has('paired_difference'));assert.ok(!paired.nodes.has('ranks'));
 const wilcoxon=incomingPaths('wilcoxon_test',visibleRelations(ref('wilcoxon_test'),'covariance'));
 assert.ok(wilcoxon.nodes.has('ranks'));assert.ok(wilcoxon.nodes.has('paired_difference'));
});
test('organic layout keeps reviewed anchors and deterministic, separated detail points',()=>{
 readable(restingPlaces);assert.deepEqual(organicLayout([...mapIds],visibleRelations(null,'covariance')),restingPlaces);
 for(const id of coreIds)assert.deepEqual(restingPlaces[id],corePlaces[id],id);
 const chain=['series','mean','centering','variance','sd','se','t_test'];for(let i=1;i<chain.length;i++)assert.ok(restingPlaces[chain[i]].x>restingPlaces[chain[i-1]].x,chain[i]);
 assert.ok(relationStrength.build>relationStrength.condition&&relationStrength.condition>relationStrength.meaning);
});
test('explicit attraction and dragging keep every point available and the selected anchor fixed',()=>{
 const original=JSON.stringify(restingPlaces);
 for(const id of ['pearson','t_test','efa','linear_regression']){const selected=ref(id),layout=gravityLayout(selected,'covariance');readable(layout);assert.deepEqual(layout[id],restingPlaces[id]);
 const members=[...visibleRelated(selected)],distance=(positions:MapLayout)=>members.reduce((sum,key)=>sum+Math.hypot(positions[key].x-positions[id].x,positions[key].y-positions[id].y),0);
 assert.ok(distance(layout)<distance(restingPlaces),id);
 }
 const point={x:restingPlaces.mean.x+300,y:restingPlaces.mean.y+200},dragged=dragLayout('mean',point,restingPlaces,ref('mean'),'covariance');readable(dragged);assert.deepEqual(dragged.mean,point);assert.equal(JSON.stringify(restingPlaces),original);
});
test('selection and data changes preserve layout; history restores deliberate movement and camera',()=>{
 let history=initialExploration('P002');const layout=gravityLayout(ref('pearson'),'covariance');history=visit(history,{...history.present,selected:ref('pearson'),layout,gravity:true});const first=history.present,viewport={x:20,y:-30,zoom:.6};
 history=visit(history,{...first,selected:ref('sd','y')},viewport);assert.equal(history.present.layout,layout);
 history=visit(history,{...history.present,caseId:'P003'});assert.equal(history.present.layout,layout);
 history=step(history,'back',viewport,['P002','P003']);history=step(history,'back',viewport,['P002','P003']);assert.deepEqual(history.present.layout,layout);assert.deepEqual(history.present.viewport,viewport);
 const reset=visit(history,{...history.present,gravity:false,layout:undefined});assert.equal(reset.present.layout,undefined);
});


test('the overview spine connects real concepts and preserves interpretation and alternative derivations',()=>{
 const edges=visibleRelations(null,'covariance');
 for(const edge of spineLinks){assert.ok(coreIds.has(edge.source)&&coreIds.has(edge.target));assert.ok(edges.some(e=>!e.alternative&&e.source===edge.source&&e.target===edge.target&&e.kind===edge.kind),edge.source+' → '+edge.target);}
 const seen=new Set<string>(),queue=['series'];while(queue.length){const id=queue.pop()!;if(seen.has(id))continue;seen.add(id);for(const e of spineLinks)if(e.source===id)queue.push(e.target);else if(e.target===id)queue.push(e.source);}
 assert.deepEqual(seen,coreIds);
 assert.ok(!edges.some(e=>e.source==='variance'&&e.target==='covariance'));
 assert.ok(!edges.some(e=>e.source==='series'&&e.target==='sampling'));
 assert.equal(edges.find(e=>e.source==='estimator'&&e.target==='sampling_distribution')?.kind,'meaning');
 const z=visibleRelations(ref('pearson'),'z');assert.ok(z.filter(e=>e.source==='covariance'&&e.target==='pearson').every(e=>e.alternative));
 assert.ok(edges.some(e=>e.source==='sd'&&e.target==='pearson'&&e.kind==='condition'));
});
test('core labels remain screen-sized through zoom; an explored detail gets a label',()=>{
 for(const zoom of [.625,.8,1.2]){
  const labels=placeLabels(restingPlaces,zoom,{...overviewTitles,null_distribution:'Nullverteilung'},['null_distribution',...coreLabelOrder],['null_distribution']);
  assert.ok(labels.null_distribution);
  const overview=placeLabels(restingPlaces,zoom,overviewTitles,coreLabelOrder);
  for(const id of coreIds)assert.ok(overview[id],id);
  assert.ok(labels.mean.width>=60&&labels.mean.height>=20);
 }
 // On a narrow overview, omit a crowded label instead of covering another one.
 for(const zoom of [.15,.3,.42]){
  const labels=placeLabels(restingPlaces,zoom,overviewTitles,coreLabelOrder),boxes=Object.entries(labels).map(([id,p])=>({...p,x:p.x+restingPlaces[id].x*zoom,y:p.y+restingPlaces[id].y*zoom}));
  assert.ok(boxes.length>=12);
  for(let i=0;i<boxes.length;i++)for(const q of boxes.slice(i+1)){const p=boxes[i];assert.ok(p.x+p.width<=q.x||p.x>=q.x+q.width||p.y+p.height<=q.y||p.y>=q.y+q.height);}
 }
});
