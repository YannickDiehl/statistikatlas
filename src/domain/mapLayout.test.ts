import test from 'node:test';
import assert from 'node:assert/strict';
import { concepts } from './concepts';
import { ref } from './learning';
import { places, regionConcepts } from './network';
import { gravityLayout, gravityMembers, restingPlaces, topicAreas, type MapLayout } from './mapLayout';
import { initialExploration, visit, step } from './exploration';

function readable(layout:MapLayout){
 assert.deepEqual(new Set(Object.keys(layout)),new Set(concepts.map(c=>c.id)));
 const entries=Object.entries(layout);
 for(const [id,p] of entries){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),id);for(const [other,q] of entries)if(id!==other)assert.ok(Math.abs(p.x-q.x)>=226||Math.abs(p.y-q.y)>=146,`${id} overlaps ${other}`);}
}

test('soft home map and gravity keep every field separate and preserve the selected anchor',()=>{
 const snapshot=JSON.stringify(places),rest=JSON.stringify(restingPlaces);readable(restingPlaces);
 for(const id of ['mean','pearson','t_test','oneway_anova','efa','linear_regression','series','divide'])for(const trace of [false,true]){
  const selected=id==='divide'?ref(id,'y','mean'):ref(id),layout=gravityLayout(selected,'z',trace);
  readable(layout);assert.deepEqual(layout[id],restingPlaces[id]);
  assert.deepEqual(layout,gravityLayout(selected,'z',trace));
 }
 assert.equal(JSON.stringify(places),snapshot);assert.equal(JSON.stringify(restingPlaces),rest);
});

test('gravity makes distant direct relationships closer while retaining the entire network',()=>{
 for(const id of ['pearson','t_test','efa','linear_regression']){
  const selected=ref(id),members=[...gravityMembers(selected,'covariance')],layout=gravityLayout(selected,'covariance'),anchor=restingPlaces[id];
  const distance=(positions:MapLayout)=>members.reduce((sum,key)=>sum+Math.hypot(positions[key].x-anchor.x,positions[key].y-anchor.y),0);
  assert.ok(distance(layout)<distance(restingPlaces),id);
 }
});

test('active routes and assumptions determine attraction without requiring valid numeric data',()=>{
 const z=gravityMembers(ref('pearson'),'z',true),cov=gravityMembers(ref('pearson'),'covariance',true);
 for(const id of ['z','centering','scaling','df','positive_sd'])assert.ok(z.has(id),id);
 assert.ok(!z.has('covariance'));assert.ok(!z.has('sd_product'));assert.ok(cov.has('covariance'));assert.ok(cov.has('sd_product'));
 const division=gravityMembers(ref('divide','y','mean'),'covariance');assert.deepEqual(division,new Set(['divide','sum','validn','mean']));
 const classic=gravityMembers(ref('oneway_anova','x','v0'),'covariance'),welch=gravityMembers(ref('oneway_anova','x','v1'),'covariance');
 assert.ok(classic.has('tukey_test'));assert.ok(classic.has('scheffe_test'));assert.ok(!welch.has('tukey_test'));assert.ok(!welch.has('scheffe_test'));

});

test('history restores gravity, anchor positions, viewport and exact original arrangement',()=>{
 let history=initialExploration('P002');history=visit(history,{...history.present,selected:ref('pearson','y'),panelOpen:true});
 history=visit(history,{...history.present,gravity:true});const first=history.present,anchor=first.layout!.sd,viewport={x:20,y:-30,zoom:.6};
 history=visit(history,{...first,selected:ref('sd','y')},viewport);assert.deepEqual(history.present.layout!.sd,anchor);
 const second=history.present;
 history=step(history,'back',{x:0,y:0,zoom:.8},['P002']);assert.deepEqual(history.present.layout,first.layout);assert.deepEqual(history.present.viewport,viewport);
 history=step(history,'forward',viewport,['P002']);assert.deepEqual(history.present.layout,second.layout);
 const trail=visit(history,first);assert.deepEqual(trail.present.layout,first.layout);
 const unchanged=visit(history,{...history.present,caseId:'P003'});assert.equal(unchanged.present.layout,history.present.layout);
 const reset=visit(history,{...history.present,gravity:false});assert.equal(reset.present.layout,undefined);assert.equal(reset.present.selected?.variable,'y');
 const whole=visit(history,{...history.present,selected:null,gravity:false,panelOpen:false});assert.equal(whole.present.layout,undefined);
});

test('soft topic areas span their members even after gravity moves across topics',()=>{
 for(const layout of [restingPlaces,gravityLayout(ref('efa'),'covariance')])for(const area of topicAreas(layout)){
  for(const id of regionConcepts(area.id)){const p=layout[id];assert.ok(p.x>=area.x&&p.y>=area.y&&p.x+196<=area.x+area.width&&p.y+112<=area.y+area.height,id);}
  assert.ok(area.width>0&&area.height>0);assert.ok(Number.isFinite(area.labelX)&&Number.isFinite(area.labelY));
 }
});

 test('a rapid selection anchors the actually displayed position during an unfinished movement',()=>{
 let history=initialExploration('P002');history=visit(history,{...history.present,selected:ref('pearson'),gravity:true});
 const displayed={...history.present.layout!,sd:{x:1370,y:490}};
 const next=visit(history,{...history.present,selected:ref('sd')},undefined,displayed);
 assert.deepEqual(next.present.layout!.sd,displayed.sd);assert.deepEqual(next.past.at(-1)!.layout,displayed);
 });
