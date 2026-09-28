import { taskContent } from './learningTasksData';
import { learningSessions } from './learningPath';

export type LearningTask = {
 title:string;minutes:number;instructions:string[];
 atlas:{id:string;prompt:string}[];responsePrompt:string;
 hints:string[];solution:string;checks:string[];
};
export type AtlasTaskContext={sessionId:number;taskIndex:number;conceptIndex:number};
export type TaskWork={note:string;checked:boolean[]};
export type Workbook=Record<string,TaskWork>;
export const workbookStorageKey='statistikatlas.learning-workbook.v1';
export const taskKey=(sessionId:number,taskIndex:number)=>`${sessionId}-${taskIndex}`;
export const taskAnchor=(sessionId:number,taskIndex:number)=>`learning-task-${taskKey(sessionId,taskIndex)}`;
export function tasksFor(sessionId:number):LearningTask[]{return taskContent[sessionId]||[];}
export function resolveAtlasTask(context:AtlasTaskContext|null){
 if(!context)return null;
 const session=learningSessions.find(s=>s.id===context.sessionId),task=tasksFor(context.sessionId)[context.taskIndex];
 const concept=task?.atlas[context.conceptIndex];
 return session&&task&&concept?{session,task,concept}:null;
}
export function parseWorkbook(raw:string|null):Workbook{
 try{const input:unknown=JSON.parse(raw||'{}');if(!input||typeof input!=='object'||Array.isArray(input))return {};
 const result:Workbook={};
 for(const session of learningSessions)tasksFor(session.id).forEach((task,index)=>{
  const key=taskKey(session.id,index),entry=(input as Record<string,unknown>)[key];
  if(!entry||typeof entry!=='object'||Array.isArray(entry))return;
  const value=entry as Record<string,unknown>;
  result[key]={note:typeof value.note==='string'?value.note.slice(0,12000):'',checked:task.checks.map((_,i)=>Array.isArray(value.checked)&&value.checked[i]===true)};
 });return result;
 }catch{return {};}
}
export function workbookMarkdown(workbook:Workbook){
 return '# Mein Statistikatlas-Arbeitsheft\n\nEigene Notizen und Selbstchecks; keine automatische Bewertung.\n\n'+learningSessions.map(session=>
 `## Sitzung ${session.id}: ${session.title}\n\n${session.question}\n\n`+tasksFor(session.id).map((task,index)=>{
 const entry=workbook[taskKey(session.id,index)];
 return `### Aufgabe ${index+1}: ${task.title}\n\n${task.responsePrompt}\n\n${entry?.note||'(Noch keine Notiz)'}\n\n`+task.checks.map((text,i)=>`- [${entry?.checked[i]?'x':' '}] ${text}`).join('\n');
 }).join('\n\n')).join('\n\n');
}
