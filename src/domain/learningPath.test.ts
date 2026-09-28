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

test('every session has three concrete tasks with valid Atlas inquiries and staged support',async()=>{
 const {tasksFor}=await import('./learningTasks');
 for(const session of learningSessions){const tasks=tasksFor(session.id);assert.equal(tasks.length,3,`Sitzung ${session.id}`);assert.equal(tasks.reduce((sum,t)=>sum+t.minutes,0),65);
  for(const task of tasks){assert.equal(task.instructions.length,3);assert.equal(task.hints.length,2);assert.equal(task.checks.length,2);assert.ok(task.solution.length>100);assert.ok(task.responsePrompt.length>30);
   assert.ok(task.atlas.length>=2);for(const inquiry of task.atlas){assert.ok(conceptById[inquiry.id],`${session.id}: ${inquiry.id}`);assert.ok(inquiry.prompt.length>25);}
  }
 }
});
test('workbook restores notes and self-checks by task and rejects malformed or unrelated storage',async()=>{
 const {parseWorkbook,workbookMarkdown}=await import('./learningTasks');
 const source={'3-1':{note:'Der Median bleibt 4.\nDie Streuung steigt.',checked:[true,false]},'99-0':{note:'unknown'},'1-0':{note:42,checked:['true',true]}};
 const restored=parseWorkbook(JSON.stringify(source));assert.deepEqual(restored['3-1'],source['3-1']);assert.deepEqual(restored['1-0'],{note:'',checked:[false,true]});assert.equal(restored['99-0'],undefined);
 assert.deepEqual(parseWorkbook('{broken'),{});assert.deepEqual(parseWorkbook('[]'),{});assert.deepEqual(parseWorkbook('null'),{});
 const markdown=workbookMarkdown(restored);assert.match(markdown,/Der Median bleibt 4\.\nDie Streuung steigt\./);assert.match(markdown,/- \[x\]/);assert.match(markdown,/Sitzung 12/);
});
test('Atlas task context resolves its exact inquiry and rejects stale or invalid destinations',async()=>{
 const {resolveAtlasTask,taskAnchor}=await import('./learningTasks');
 const request={sessionId:3,taskIndex:1,conceptIndex:2},resolved=resolveAtlasTask(request);assert.ok(resolved);assert.equal(resolved.concept.id,'sd');assert.equal(resolved.session.id,3);assert.equal(taskAnchor(3,1),'learning-task-3-1');
 assert.equal(resolveAtlasTask(null),null);assert.equal(resolveAtlasTask({...request,sessionId:99}),null);assert.equal(resolveAtlasTask({...request,conceptIndex:100}),null);
});
