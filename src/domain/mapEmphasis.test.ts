import test from 'node:test';
import assert from 'node:assert/strict';
import { mapEmphasis,relationLanes } from './mapEmphasis';
import { visibleRelations } from './visibleNetwork';
import { incomingPaths } from './network';
import { ref } from './learning';

test('incoming and outgoing interpretations keep their direction, including reciprocal neighbors',()=>{
 const edges=visibleRelations(ref('frequency'),'covariance'),path=incomingPaths('frequency',edges),focus=mapEmphasis('frequency',edges,path.edges);
 assert.equal(focus.nodeRole('series'),'incoming');assert.equal(focus.nodeRole('crosstab'),'outgoing');assert.equal(focus.nodeRole('empirical_distribution'),'both');assert.equal(focus.nodeRole('frequency'),'focus');
 for(const e of edges.filter(e=>!e.alternative&&e.source==='frequency'))assert.equal(focus.edgeRole(e),'outgoing');
 const lanes=relationLanes(edges),pair=edges.filter(e=>!e.alternative&&['frequency','empirical_distribution'].includes(e.source)&&['frequency','empirical_distribution'].includes(e.target));
 assert.ok(pair.length>=2);assert.equal(new Set(pair.map(e=>(lanes.get(e.id)||0)*(e.source<e.target?1:-1))).size,pair.length);
});
test('changing focus does not retain another center, and an output in the trace stays outgoing',()=>{
 const edges=visibleRelations(ref('t_test'),'covariance'),path=incomingPaths('t_test',edges),first=mapEmphasis('t_test',edges,path.edges);
 const p=edges.find(e=>e.source==='t_test'&&e.target==='p_value')!;
 assert.ok(path.edges.has(p.id));assert.equal(first.edgeRole(p),'outgoing');assert.equal(first.nodeRole('sd'),'ancestor');
 const next=mapEmphasis('se',edges,incomingPaths('se',edges).edges);assert.equal(next.nodeRole('se'),'focus');assert.equal(next.nodeRole('t_test'),'outgoing');
 assert.equal(mapEmphasis(undefined,edges).nodeRole('se'),'neutral');
});
test('alternative Pearson derivations never receive active direction colors or lanes',()=>{
 const edges=visibleRelations(ref('pearson'),'z'),focus=mapEmphasis('pearson',edges),lanes=relationLanes(edges);
 for(const edge of edges.filter(e=>e.alternative)){assert.equal(focus.edgeRole(edge),'neutral');assert.equal(lanes.has(edge.id),false);}
 assert.equal(focus.nodeRole('covariance'),'neutral');assert.equal(focus.nodeRole('z'),'incoming');
});
