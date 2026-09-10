import type { Viewport } from '@xyflow/react';
import { defaultSelection, type ColumnSelection } from './survey';
import type { Ref, Route, Variable } from './learning';
export type ExplorationView={selected:Ref|null;variable:Variable;caseId:string;route:Route;trace:boolean;panelOpen:boolean;columns:ColumnSelection;viewport?:Viewport};
export type ExplorationHistory={present:ExplorationView;past:ExplorationView[];future:ExplorationView[]};
export function initialExploration(caseId:string,columns:ColumnSelection={...defaultSelection}):ExplorationHistory{return {present:{selected:null,variable:'x',caseId,columns,route:'covariance',trace:false,panelOpen:false},past:[],future:[]};}
export function visit(history:ExplorationHistory,next:ExplorationView,viewport?:Viewport):ExplorationHistory{return {present:next,past:[...history.past.slice(-49),{...history.present,viewport}],future:[]};}
export function step(history:ExplorationHistory,direction:'back'|'forward',viewport:Viewport|undefined,caseIds:string[]):ExplorationHistory{
 const source=direction==='back'?history.past:history.future,target=source.at(-1);if(!target)return history;
 const current={...history.present,viewport},present={...target,caseId:caseIds.includes(target.caseId)?target.caseId:caseIds[0]};
 return direction==='back'?{present,past:history.past.slice(0,-1),future:[...history.future,current]}:{present,past:[...history.past,current],future:history.future.slice(0,-1)};
}
