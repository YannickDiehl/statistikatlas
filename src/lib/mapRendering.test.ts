import test from 'node:test';
import assert from 'node:assert/strict';
import { createZoomSync } from './zoomSync';
import { retainGraphItems } from './stableGraph';

function fakeClock(){
 let id=0;const pending=new Map<number,()=>void>();
 return {pending,later:(callback:()=>void)=>{pending.set(++id,callback);return id;},cancel:(handle:unknown)=>{pending.delete(handle as number);},run:()=>{const tasks=[...pending.values()];pending.clear();tasks.forEach(task=>task());}};
}
test('100 zoom updates keep exact visual scale but prepare labels only once',()=>{
 const clock=fakeClock(),scales:number[]=[],layouts:number[]=[];
 const sync=createZoomSync(scale=>scales.push(scale),zoom=>layouts.push(zoom),clock);
 for(let i=1;i<=100;i++)sync.update(i/100);
 assert.equal(scales.length,100);assert.equal(scales[0],100);assert.equal(scales.at(-1),1);
 assert.equal(layouts.length,0);assert.equal(clock.pending.size,1);
 clock.run();assert.deepEqual(layouts,[1]);
 // Panning emits store updates too, but cannot schedule another label pass.
 for(let i=0;i<100;i++)sync.update(1);
 assert.equal(clock.pending.size,0);assert.equal(scales.length,100);
 sync.dispose();
});
test('gesture end flushes current zoom; unmount cancels delayed work',()=>{
 const clock=fakeClock(),scales:number[]=[],layouts:number[]=[];
 const sync=createZoomSync(scale=>scales.push(scale),zoom=>layouts.push(zoom),clock);
 sync.update(.25);sync.update(.5);sync.flush();
 assert.deepEqual(layouts,[.5]);assert.equal(clock.pending.size,0);
 sync.update(.6);sync.dispose();clock.run();sync.update(.7);sync.flush();
 assert.deepEqual(layouts,[.5]);assert.deepEqual(scales,[4,2,1/.6]);
});
test('invalid zoom values never write invalid CSS or schedule layout',()=>{
 const clock=fakeClock(),scales:number[]=[],layouts:number[]=[];
 const sync=createZoomSync(scale=>scales.push(scale),zoom=>layouts.push(zoom),clock);
 for(const value of [NaN,Infinity,-Infinity,0,-1])sync.update(value);
 sync.flush();assert.deepEqual(scales,[]);assert.deepEqual(layouts,[]);assert.equal(clock.pending.size,0);
});
test('one hovered edge preserves all other objects and unchanged arrays',()=>{
 const previous=Array.from({length:451},(_,i)=>({id:String(i),source:'a',target:'b',data:{arrow:false},style:{stroke:'blue',opacity:.5}}));
 const equal=previous.map(edge=>({...edge,data:{...edge.data},style:{...edge.style}}));
 assert.equal(retainGraphItems(previous,equal),previous);
 const changed=equal.map((edge,i)=>i===10?{...edge,style:{...edge.style,opacity:1}}:edge);
 const result=retainGraphItems(previous,changed);
 assert.notEqual(result,previous);assert.equal(result[10],changed[10]);
 assert.equal(result.filter((edge,i)=>edge===previous[i]).length,450);
 assert.equal(previous[10].style.opacity,.5);
});
test('moved nodes, callback changes, order and removal cannot be hidden by reuse',()=>{
 const action=()=>{},previous=[{id:'a',position:{x:0,y:0},data:{onSelect:action}},{id:'b',position:{x:1,y:2},data:{onSelect:action}}];
 const moved={...previous[0],position:{x:10,y:0}},callback={...previous[1],data:{onSelect:()=>{}}};
 assert.deepEqual(retainGraphItems(previous,[moved,callback]),[moved,callback]);
 assert.equal(retainGraphItems(previous,[moved,previous[1]])[1],previous[1]);
 const reversed=retainGraphItems(previous,[previous[1],previous[0]]);
 assert.equal(reversed[0],previous[1]);assert.equal(reversed[1],previous[0]);
 assert.deepEqual(retainGraphItems(previous,[previous[1]]),[previous[1]]);
});
