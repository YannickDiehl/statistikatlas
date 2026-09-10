import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Formula } from '../components/Formula';
import { Experiment } from '../components/Experiment';
import { concepts, conceptById } from './concepts';
import { defaultPairs, calculateStatistics } from './statistics';
import { ref, keyOf, inputs, visibleRefs, findPath, valueFor, unitFor, outputRef, lessonContext, conditions, interpretation, type Ref, type Route } from './learning';
import { formulaFor, type Expression } from './formulas';
import { parseInput, validStoredPairs } from './data';
const close=(actual:number|null,expected:number)=>assert.ok(actual!==null&&Math.abs(actual-expected)<1e-12,`${actual} != ${expected}`);
function targets(e:Expression):Ref[]{if(typeof e==='string')return [];switch(e.type){case 'term':return [e.target];case 'row':return e.items.flatMap(targets);case 'fraction':return [e.operation,...targets(e.top),...targets(e.bottom)];case 'sum':return [e.target,e.count,...targets(e.body)];case 'power':case 'root':return [e.operation,...targets(e.body)];}}
function allRecipe(root:Ref,route:Route):Ref[]{const found=new Map<string,Ref>();function walk(r:Ref){if(found.has(keyOf(r)))return;found.set(keyOf(r),r);inputs(r,route).forEach(walk);}walk(root);return [...found.values()];}

test('decimal constants have exactly zero dispersion without treating small real dispersion as zero',()=>{
 const constant=calculateStatistics(defaultPairs.map(p=>({...p,x:.9})));
 assert.equal(constant.meanX,.9);assert.equal(constant.sdX,0);assert.equal(constant.varianceX,0);assert.deepEqual(constant.zX,[null,null,null,null,null]);assert.equal(constant.pearson,null);
 const tiny=calculateStatistics(defaultPairs.map(p=>({...p,x:p.x*1e-12})));
 assert.ok(tiny.sdX!>0);close(tiny.pearson,calculateStatistics(defaultPairs).pearson!);
});
test('formulas keep the selected case and the X/Y context, including denominator navigation',()=>{
 const c=lessonContext(defaultPairs,defaultPairs[2].id,'covariance');close(valueFor(ref('z','x'),c),0);close(valueFor(ref('z','y'),c),1/Math.sqrt(1.5));
 const yTargets=targets(formulaFor(ref('z','y'),c));assert.ok(yTargets.some(r=>r.id==='sd'&&r.variable==='y'));assert.ok(yTargets.filter(r=>['series','mean','sd','centering','scaling'].includes(r.id)).every(r=>r.variable==='y'));
 close(valueFor(ref('scaling','x'),{...c,caseId:defaultPairs[1].id}),2/Math.sqrt(2.5));close(valueFor(ref('scaling','x','z'),{...c,caseId:defaultPairs[1].id}),-1/Math.sqrt(2.5));
});
test('all contextual operations use the result, units and actual operands of their recipe',()=>{
 for(const route of ['covariance','z'] as Route[]){const c=lessonContext(defaultPairs,defaultPairs[0].id,route);for(const r of allRecipe(ref('pearson'),route)){const out=outputRef(r);if(out!==r){assert.equal(valueFor(r,c),valueFor(out,c),keyOf(r));assert.equal(unitFor(r),unitFor(out),keyOf(r));assert.ok(inputs(r,route).length>0,keyOf(r));}}}
 const c=lessonContext(defaultPairs,defaultPairs[0].id,'z');close(valueFor(ref('multiply','x','zproducts'),c),2.065591117977289);close(valueFor(ref('add','x','zsum'),c),3.0983866769659336);assert.equal(unitFor(ref('crossproduct','x','z')),'');assert.equal(unitFor(ref('crossproduct_sum','x','z')),'');
});
test('constant-series conditions are local and never invent a sign for undefined z-products',()=>{
 const xConstant=lessonContext(defaultPairs.map(p=>({...p,x:.9})),defaultPairs[0].id,'z');
 for(const r of [ref('crossproduct','x','z'),ref('crossproduct_sum','x','z'),ref('multiply','x','zproducts'),ref('add','x','zsum'),ref('pearson')]){assert.equal(valueFor(r,xConstant),null);assert.ok(conditions(r,xConstant).some(condition=>condition.ok===false&&condition.text.includes('X ist konstant')));assert.match(interpretation(r,xConstant),/X ist konstant/);}
 const yConstant=lessonContext(defaultPairs.map(p=>({...p,y:4})),defaultPairs[0].id,'covariance');assert.ok(valueFor(ref('z','x'),yConstant)!<0);assert.ok(!conditions(ref('z','x'),yConstant).some(c=>c.ok===false));assert.ok(conditions(ref('z','y'),yConstant).some(c=>c.ok===false));
});
test('both Pearson routes agree and remain in [-1,1], including affine and curved examples',()=>{
 for(const pairs of [defaultPairs,defaultPairs.map(p=>({...p,y:2*p.x})),defaultPairs.map(p=>({...p,y:10-2*p.x})),defaultPairs.map(p=>({...p,y:(p.x-3)**2}))]){const c=lessonContext(pairs,pairs[0].id,'covariance');const z=valueFor(ref('pearson'),{...c,route:'z'});close(z,c.stats.pearson!);assert.ok(z!==null&&z>=-1&&z<=1);}
});
test('shared prerequisites survive collapse while X and Y remain separate uses',()=>{
 const root=ref('pearson'),route:Route='z',expanded=new Set(allRecipe(root,route).map(keyOf));const all=visibleRefs(root,expanded,route);
 assert.equal(all.filter(r=>r.id==='validn').length,1);assert.ok(all.some(r=>keyOf(r)===keyOf(ref('sd','x'))));assert.ok(all.some(r=>keyOf(r)===keyOf(ref('sd','y'))));
 expanded.delete(keyOf(ref('centering','x')));assert.ok(visibleRefs(root,expanded,route).some(r=>keyOf(r)===keyOf(ref('mean','x'))));
 expanded.delete(keyOf(ref('variance','x')));assert.ok(!visibleRefs(root,expanded,route).some(r=>keyOf(r)===keyOf(ref('mean','x'))));
 assert.ok(findPath(root,ref('sd','y'),route));assert.equal(findPath(root,ref('covariance'),route),null);
});
test('every symbolic and numeric link resolves, and arithmetic links have contextual inputs',()=>{
 for(const route of ['covariance','z'] as Route[]){const c=lessonContext(defaultPairs,defaultPairs[1].id,route);const refs=[...concepts.flatMap(concept=>[ref(concept.id,'x'),ref(concept.id,'y')]),...allRecipe(ref('pearson'),route)];for(const r of refs){for(const numeric of [false,true])for(const target of targets(formulaFor(r,c,numeric))){assert.ok(conceptById[target.id],`${keyOf(r)} -> ${keyOf(target)}`);if(target.use&&['divide','multiply','subtract','square','sqrt','add','scaling'].includes(target.id))assert.ok(inputs(target,route).length>0,keyOf(target));}}}
});
test('displayed rounded arithmetic is marked approximate, even when the result is an integer',()=>{
 const pairs=[1,1,1,0,0,0,0,0].map((x,i)=>({id:String(i),x,y:i})),c=lessonContext(pairs,'0','covariance');
 for(const r of [ref('ss'),ref('add'),ref('variance')]){const html=renderToStaticMarkup(createElement(Formula,{reference:r,context:c,numeric:true,onSelect:()=>{}}));assert.match(html,/≈/);}
});
test('all 29 concepts render both variables with boundary data and usable formula links',()=>{
 for(const pairs of [defaultPairs,defaultPairs.slice(0,1),defaultPairs.map(p=>({...p,x:0,y:0}))])for(const variable of ['x','y'] as const)for(const concept of concepts){const reference=ref(concept.id,variable),context=lessonContext(pairs,pairs[0].id,'covariance');const html=renderToStaticMarkup(createElement(Formula,{reference,context,onSelect:()=>{}}));assert.ok(html.length>100,concept.id);assert.doesNotMatch(html,/NaN|Infinity/);const experiment=renderToStaticMarkup(createElement(Experiment,{reference,context,showBoth:concept.category==='relationship',onPairs:()=>{},onCase:()=>{},onReset:()=>{}}));assert.doesNotMatch(experiment,/NaN|Infinity/);}
});
test('German numeric input and stored cases preserve valid complete row identities',()=>{
 assert.equal(parseInput(' 1,25 '),1.25);assert.equal(parseInput('-0,25'),-.25);assert.equal(parseInput('1e-5'),1e-5);assert.equal(parseInput('−'),null);assert.equal(parseInput('-'),null);assert.equal(parseInput(''),null);assert.equal(parseInput('1.000,5'),null);assert.equal(parseInput('Infinity'),null);assert.equal(parseInput('1e7'),null);
 assert.ok(validStoredPairs(defaultPairs));assert.ok(validStoredPairs(defaultPairs.slice(0,1)));assert.ok(!validStoredPairs([{id:'same',x:1,y:2},{id:'same',x:3,y:4}]));assert.ok(!validStoredPairs([{id:'a',x:1,y:null}]));assert.ok(!validStoredPairs([]));
});

test('invalid elementary operations explain the real cause at the result',()=>{
 const c=lessonContext([{id:'a',x:-2,y:1},{id:'b',x:0,y:2}],'a','covariance');
 assert.match(interpretation(ref('divide'),c),/Teilen durch 0/);assert.match(interpretation(ref('sqrt'),c),/negative Zahl/);
});
