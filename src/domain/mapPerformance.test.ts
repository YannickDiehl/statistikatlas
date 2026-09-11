import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ref,titleFor,type Ref,type Route } from './learning';
import { mapIds,visibleRelations } from './visibleNetwork';
import { restingPlaces } from './mapLayout';
import { placeLabels } from './organicLayout';
import { coreLabelOrder,overviewTitles } from './organicStructure';

// Captured from the implementation before its cache/spatial-index optimization.
const baseline=JSON.parse(readFileSync(new URL('./fixtures/map-performance-regression.json',import.meta.url),'utf8')) as {
 labels:{zoom:number;detail:boolean;hash:string}[];
 graphs:{selected:Ref;anchor:Ref;route:Route;hash:string}[];
};
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
test('spatial label lookup preserves every placement in 12 overview/detail baselines',()=>{
 const titles=Object.fromEntries([...mapIds].map(id=>[id,overviewTitles[id]||titleFor(ref(id))]));
 for(const c of baseline.labels)assert.equal(hash(placeLabels(restingPlaces,c.zoom,titles,c.detail?[...mapIds]:coreLabelOrder)),c.hash,JSON.stringify(c));
});
test('cached projection preserves 48 X/Y, route and procedure-variant baselines',()=>{
 for(const c of baseline.graphs)assert.equal(hash(visibleRelations(c.selected,c.route,c.anchor)),c.hash,JSON.stringify(c));
});
test('graph cache reuses equivalent contexts without merging axes, ranks, variants or anchors',()=>{
 const selected=ref('mean','x'),anchor=ref('t_test','x','v2');
 const base=visibleRelations(selected,'covariance',anchor);
 assert.equal(visibleRelations({...selected},'covariance',{...anchor}),base);
 for(const variant of [
  visibleRelations({...selected,variable:'y'},'covariance',anchor),
  visibleRelations({...selected,use:'v2'},'covariance',anchor),
  visibleRelations({...selected,basis:'ranks'},'covariance',anchor),
  visibleRelations(selected,'z',anchor),
  visibleRelations(selected,'covariance',{...anchor,variable:'y'}),
  visibleRelations(selected,'covariance',{...anchor,use:'v3'}),
  visibleRelations(selected,'covariance',{...anchor,basis:'ranks'}),
 ])assert.notEqual(variant,base);
 assert.ok(Object.isFrozen(base));assert.ok(base.every(Object.isFrozen));
 assert.throws(()=>base.pop(),TypeError);
 assert.throws(()=>{base[0].label='changed';},TypeError);
 assert.equal(visibleRelations(selected,'covariance',anchor),base);
});
