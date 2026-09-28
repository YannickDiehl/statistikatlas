import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPath } from '../components/LearningPath';
import { conceptById } from './concepts';
import { learningSessions,learningScript,politicalSummary } from './learningPath';

test('all twelve political session outlines render with valid orientation links and their own tasks',()=>{
 assert.deepEqual(learningSessions.map(s=>s.id),Array.from({length:12},(_,i)=>i+1));
 for(const [index,s] of learningSessions.entries()){
  for(const id of s.concepts)assert.ok(conceptById[id],`${s.id}: ${id}`);
  const html=renderToStaticMarkup(createElement(LearningPath,{sessionIndex:index,onSessionChange:()=>{},onConcept:()=>{}}));
  assert.ok(html.includes(s.question));assert.ok(html.includes(s.product));
  assert.ok(html.includes(s.model?'ausdrücklich erfundene politische Antworten':'ALLBUScompact 2023'));
  assert.equal(s.prediction.feedback.length,s.prediction.options.length);
  assert.ok(s.prediction.correct>=0&&s.prediction.correct<s.prediction.options.length);
 }
});
test('downloadable worksheets clearly separate actual ALLBUS imports from invented model data',()=>{
 for(const session of learningSessions){const code=learningScript(session);
  if(session.model){assert.match(code,/keine ALLBUS-Fälle/);assert.match(code,/modell <- data.frame/);assert.doesNotMatch(code,/file.choose/);}
  else {assert.match(code,/ZA8831/);assert.match(code,/file.choose/);assert.match(code,/pa01 = c\(-42, -9\)/);assert.doesNotMatch(code,/ZA8901/);}
  assert.ok(code.includes(session.code));
 }
});
test('political sandbox preserves the original observations and distinguishes mean, median and sample SD',()=>{
 const original=[2,3,4,5,6];assert.deepEqual(politicalSummary(original),{mean:4,median:4,sd:Math.sqrt(2.5)});
 assert.deepEqual(original,[2,3,4,5,6]);
 const shifted=politicalSummary([2,3,4,5,10]);assert.equal(shifted.mean,4.8);assert.equal(shifted.median,4);assert.ok(shifted.sd>Math.sqrt(2.5));
 assert.equal(politicalSummary([4,4,4,4,4]).sd,0);
});
