import type { RSettings } from './mariposa';
import type { Viewport } from '@xyflow/react';
import { defaultSelection, type ColumnSelection } from './survey';
import { type Ref, type Route, type Variable } from './learning';
import { type MapLayout } from './mapLayout';
export type ExplorationView={selected:Ref|null;variable:Variable;caseId:string;route:Route;trace:boolean;panelOpen:boolean;columns:ColumnSelection;rSettings?:Record<string,RSettings>;contextAnchor?:Ref;gravity?:boolean;layout?:MapLayout;viewport?:Viewport};
export type ExplorationHistory={present:ExplorationView;past:ExplorationView[];future:ExplorationView[]};
export function initialExploration(caseId:string,columns:ColumnSelection={...defaultSelection}):ExplorationHistory{return {present:{selected:null,variable:'x',caseId,columns,route:'covariance',trace:false,panelOpen:false},past:[],future:[]};}
export function visit(history:ExplorationHistory,next:ExplorationView,viewport?:Viewport,displayedLayout?:MapLayout):ExplorationHistory{
 if(next.gravity&&(next.selected!==history.present.selected||next.route!==history.present.route||next.trace!==history.present.trace))next={...next,gravity:false};
 // Layout changes are deliberate actions. Selecting another concept, changing
 // columns or hovering must never rerun gravity or discard a dragged position.
 return {present:next,past:[...history.past.slice(-49),{...history.present,viewport,...(history.present.layout&&displayedLayout?{layout:displayedLayout}:{})}],future:[]};}
export function step(history:ExplorationHistory,direction:'back'|'forward',viewport:Viewport|undefined,caseIds:string[],displayedLayout?:MapLayout):ExplorationHistory{
 const source=direction==='back'?history.past:history.future,target=source.at(-1);if(!target)return history;
 const current={...history.present,viewport,...(history.present.layout&&displayedLayout?{layout:displayedLayout}:{})},present={...target,caseId:caseIds.includes(target.caseId)?target.caseId:caseIds[0]};
 return direction==='back'?{present,past:history.past.slice(0,-1),future:[...history.future,current]}:{present,past:[...history.past,current],future:history.future.slice(0,-1)};
}
