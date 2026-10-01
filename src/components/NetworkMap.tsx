import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Controls, Handle, Position, BaseEdge, useReactFlow, useStore, type Edge, type Node, type NodeProps, type EdgeProps, type Viewport } from '@xyflow/react';
import { titleFor, type Ref, type LessonContext } from '../domain/learning';
import { referenceInMap, incomingPaths, routeAfterSelection } from '../domain/network';
import { restingPlaces, gravityMembers, dragLayout, type MapLayout } from '../domain/mapLayout';
import { mapConcepts, mapIds, mapAnchor, visibleRelations, visibleRelated } from '../domain/visibleNetwork';
import { coreIds, coreLabelOrder, overviewTitles, spineFor } from '../domain/organicStructure';
import { placeLabels, type LabelPlacement } from '../domain/organicLayout';
import { useMapZoom } from './useMapZoom';
import { useStableActions } from './useStableActions';
import { retainGraphItems } from '../lib/stableGraph';
import { mapEmphasis, relationLanes, directionColors, directionLabels, type MapRole } from '../domain/mapEmphasis';

type MapData={reference:Ref;active:boolean;related:boolean;hovered:boolean;visited:boolean;role?:MapRole;label?:LabelPlacement;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void};
type MapNode=Node<MapData,'concept'>;
function Concept({data:d}:NodeProps<MapNode>){const r=d.reference,core=coreIds.has(r.id),title=overviewTitles[r.id]||titleFor(r),role=d.role||'neutral';return <article className={`organic-node flow-${role} ${core?'core-point':'detail-point'} ${d.active?'selected':''} ${d.related?'related':'muted'} ${d.hovered?'hovered':''} ${d.visited?'visited':''}`}>
 <Handle id="in" type="target" position={Position.Left}/><Handle id="out" type="source" position={Position.Right}/>
 <div className="organic-node-face" style={{transform:'scale(var(--map-inverse-zoom, 1))'}}>
  <button className="organic-point nodrag" onClick={()=>d.onSelect(r)} onPointerEnter={()=>d.onHover(r.id)} onPointerLeave={()=>d.onHover(null)} onFocus={()=>d.onHover(r.id)} onBlur={()=>d.onHover(null)} aria-label={`${titleFor(r)} im Netzwerk erkunden${directionLabels[role]?` · ${directionLabels[role]}`:''}`} aria-pressed={d.active}><span/></button>
  {d.label&&<><svg className="organic-label-stem" aria-hidden="true"><path d={`M 0 0 L ${d.label.x+d.label.width/2} ${d.label.y+d.label.height/2}`}/></svg><button className="organic-label nodrag" style={{left:d.label.x,top:d.label.y,width:d.label.width,minHeight:d.label.height}} onClick={()=>d.onSelect(r)} onPointerEnter={()=>d.onHover(r.id)} onPointerLeave={()=>d.onHover(null)} onFocus={()=>d.onHover(r.id)} onBlur={()=>d.onHover(null)} tabIndex={-1} aria-hidden="true">{title}</button></>}
  <span className="organic-drag" title="Begriff verschieben" aria-hidden="true">⠿</span>
 </div>
 </article>;}
export const nodeTypes={concept:memo(Concept,(a,b)=>{
 const x=a.data,y=b.data;
 return x.active===y.active&&x.related===y.related&&x.hovered===y.hovered&&x.visited===y.visited&&x.role===y.role&&x.reference===y.reference&&x.label===y.label;
})};
export const nodeInteraction={style:{pointerEvents:'all' as const,width:16,height:16},zIndex:3,draggable:true,selectable:false,focusable:false};
function EdgeCurve({id,sourceX:sx,sourceY:sy,targetX:tx,targetY:ty,style,data,laneZoom=1}:EdgeProps&{laneZoom?:number}){
 const dx=tx-sx,dy=ty-sy,vertical=Math.abs(dy)>Math.abs(dx)*1.2;
 // Tangents soften each actual connection; curves are never merged into fake junctions.
 const bend=Math.min(310,Math.max(60,(vertical?Math.abs(dy):Math.abs(dx))*.48)),sign=(vertical?dy:dx)>=0?1:-1;
 const c1=vertical?{x:sx,y:sy+bend*sign}:{x:sx+bend*sign,y:sy},c2=vertical?{x:tx,y:ty-bend*sign}:{x:tx-bend*sign,y:ty};
 const offset=Number(data?.lane||0)/laneZoom,length=Math.hypot(dx,dy)||1;
 c1.x-=dy/length*offset;c2.x-=dy/length*offset;c1.y+=dx/length*offset;c2.y+=dx/length*offset;
 const path=`M ${sx} ${sy} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${tx} ${ty}`,t=.82,u=1-t;
 const x=u*u*u*sx+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*tx,y=u*u*u*sy+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*ty;
 const vx=3*u*u*(c1.x-sx)+6*u*t*(c2.x-c1.x)+3*t*t*(tx-c2.x),vy=3*u*u*(c1.y-sy)+6*u*t*(c2.y-c1.y)+3*t*t*(ty-c2.y);
 return <><BaseEdge id={id} path={path} style={{...style,vectorEffect:'non-scaling-stroke'}} interactionWidth={14}/>{data?.arrow===true&&<g transform={`translate(${x} ${y}) rotate(${Math.atan2(vy,vx)*180/Math.PI})`}><path d="M -5 -3 L 0 0 L -5 3" style={{transform:'scale(var(--map-inverse-zoom, 1))',stroke:style?.stroke,opacity:style?.opacity,strokeWidth:1.3,fill:'none',pointerEvents:'none'}}/></g>}</>;
}
// Only the few offset curves need live geometric updates. Their lane spacing
// stays fixed during zoom, without subscribing the graph or every single edge.
function ParallelEdge(props:EdgeProps){const zoom=useStore(state=>state.transform[2]);return <EdgeCurve {...props} laneZoom={zoom}/>;}
function OrganicEdge(props:EdgeProps){return props.data?.lane?<ParallelEdge {...props}/>:<EdgeCurve {...props}/>;}
const edgeTypes={organic:memo(OrganicEdge)};
const nodeOrigin:[number,number]=[.5,.5];
const ariaLabelConfig={'controls.zoomIn.ariaLabel':'Karte vergrößern','controls.zoomOut.ariaLabel':'Karte verkleinern','controls.fitView.ariaLabel':'Ganze Karte zeigen'};
const titles=Object.fromEntries(mapConcepts.map(c=>[c.id,overviewTitles[c.id]||titleFor({id:c.id,variable:'x'})]));
export type CameraRequest={id:number;kind:'all'|'focus'|'restore'|'ensure'|'none';viewport?:Viewport};
function NetworkMapImpl({selected,context,hovered,visited,onSelect,onHover,onViewport,onViewportReader,camera,trace=false,inspectorOpen=false,onBackground,highlightRef,layout,onLayoutReader,contextAnchor,gravity=false,onLayoutChange,visible=true}:{selected:Ref|null;context:LessonContext;hovered:string|null;visited:Set<string>;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void;onViewport:(v:Viewport)=>void;onViewportReader:(read:()=>Viewport)=>void;camera:CameraRequest;trace?:boolean;inspectorOpen?:boolean;onBackground?:()=>void;highlightRef?:Ref;layout?:MapLayout;contextAnchor?:Ref;onLayoutReader?:(read:()=>MapLayout)=>void;gravity?:boolean;onLayoutChange?:(layout:MapLayout)=>void;visible?:boolean}){
 const destinations=layout||restingPlaces;
 const [edgeHover,setEdgeHover]=useState<string|null>(null),[dragged,setDragged]=useState<{id:string;position:{x:number;y:number}}|null>(null),[overviewZoom,setOverviewZoom]=useState(.6);
 const positions=useMemo(()=>dragged?{...destinations,[dragged.id]:dragged.position}:destinations,[destinations,dragged]);
 const handlers=useRef({onSelect,onHover,onLayoutChange});handlers.current={onSelect,onHover,onLayoutChange};
 const hoverTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const selectNode=useCallback((r:Ref)=>{clearTimeout(hoverTimer.current);handlers.current.onSelect(r);},[]);
 const hoverNode=useCallback((id:string|null)=>{clearTimeout(hoverTimer.current);if(id)handlers.current.onHover(id);else hoverTimer.current=setTimeout(()=>handlers.current.onHover(null),130);},[]);
 useEffect(()=>()=>clearTimeout(hoverTimer.current),[]);
 const focus=mapAnchor(selected,contextAnchor),drawn=useRef(positions);drawn.current=positions;
 useEffect(()=>{onLayoutReader?.(()=>drawn.current);},[onLayoutReader]);
 const flow=useReactFlow(),container=useRef<HTMLDivElement>(null),mounted=useRef(false);
 const {zoom,settleZoom}=useMapZoom(container),detail=zoom>overviewZoom*1.5;
 const mapReference=useMemo(()=>highlightRef||(hovered?referenceInMap(hovered,selected,context.route,contextAnchor):selected),[highlightRef,hovered,selected,context.route,contextAnchor]),hoverRoute=mapReference?routeAfterSelection(selected,mapReference,context.route):context.route;
 const relations=useMemo(()=>visibleRelations(mapReference,hoverRoute,contextAnchor||selected),[mapReference?.id,mapReference?.use,mapReference?.variable,mapReference?.basis,hoverRoute,contextAnchor,selected]);
 const hoveredAnchor=hovered?mapAnchor(mapReference,contextAnchor||selected):null;
 const hoverPath=useMemo(()=>hoveredAnchor?incomingPaths(hoveredAnchor.id,relations):null,[hoveredAnchor?.id,relations]);
 const activeId=hoveredAnchor?.id||focus?.id;
 const directNodes=useMemo(()=>new Set(activeId?[activeId,...relations.filter(e=>!e.alternative&&(e.source===activeId||e.target===activeId)).flatMap(e=>[e.source,e.target])]:[]),[relations,activeId]);
 const tracedPath=useMemo(()=>!hoveredAnchor&&trace&&focus?incomingPaths(focus.id,relations):undefined,[hoveredAnchor?.id,trace,focus?.id,relations]);
 const pathEdges=hoverPath?.edges||tracedPath?.edges,related=hoverPath?.nodes||tracedPath?.nodes||(!focus?mapIds:directNodes);
 const emphasis=useMemo(()=>mapEmphasis(activeId,relations,pathEdges),[activeId,relations,pathEdges]);
 const lanes=useMemo(()=>relationLanes(relations),[relations]);
 const labels=useMemo(()=>{const priority=[...new Set([activeId,focus?.id,...coreLabelOrder,...(activeId?[...directNodes]:[]),...(detail?[...mapIds]:[])].filter((id):id is string=>!!id))];return placeLabels(destinations,zoom,titles,priority,[activeId,focus?.id].filter((id):id is string=>!!id));},[destinations,zoom,activeId,focus?.id,directNodes,detail]);
 const references=useMemo(()=>Object.fromEntries(mapConcepts.map(c=>[c.id,highlightRef?.id===c.id?highlightRef:referenceInMap(c.id,mapReference,context.route,contextAnchor)])),[highlightRef,mapReference,context.route,contextAnchor]);
 const nodeCache=useRef<MapNode[]>([]),edgeCache=useRef<Edge[]>([]);
 const nodes=useMemo(()=>{
  const next:MapNode[]=mapConcepts.map(c=>({id:c.id,type:'concept',position:positions[c.id],...nodeInteraction,zIndex:c.id===activeId?8:coreIds.has(c.id)?4:3,data:{reference:references[c.id],label:labels[c.id],active:focus?.id===c.id,related:related.has(c.id)||directNodes.has(c.id),hovered:hoveredAnchor?.id===c.id,visited:visited.has(c.id),role:emphasis.nodeRole(c.id),onSelect:selectNode,onHover:hoverNode}}));
  return nodeCache.current=retainGraphItems(nodeCache.current,next);
 },[positions,activeId,references,labels,focus?.id,related,directNodes,hoveredAnchor?.id,visited,emphasis,selectNode,hoverNode]);
 const edges=useMemo(()=>{const next:Edge[]=relations.filter(e=>!e.alternative).map(e=>{
  const direct=e.source===activeId||e.target===activeId,path=!!pathEdges?.has(e.id),spine=spineFor(e)?.kind===e.kind,pointed=edgeHover===e.id,strong=direct||pointed,role=emphasis.edgeRole(e);
  const color=role==='incoming'||role==='ancestor'?directionColors.incoming:role==='outgoing'?directionColors.outgoing:directionColors.neutral;
  return {id:e.id,source:e.source,target:e.target,sourceHandle:'out',targetHandle:'in',type:'organic',data:{lane:lanes.get(e.id),arrow:strong||spine},ariaLabel:`${titles[e.source]} → ${titles[e.target]}: ${e.label}`,style:{stroke:color,strokeWidth:pointed?3.1:direct?2.4:path?1.35:spine?1.3:.65,opacity:pointed?1:activeId?(direct?.96:path?.48:spine?.22:.06):spine?.78:detail?.18:.09,strokeDasharray:e.kind==='meaning'?'2 5':e.kind==='condition'?'7 4':e.kind==='optional'?'2 7':undefined},focusable:false,zIndex:strong?2:spine?1:0};
 });return edgeCache.current=retainGraphItems(edgeCache.current,next);},[relations,activeId,pathEdges,edgeHover,emphasis,lanes,detail]);
 const hoveredEdge=relations.find(e=>e.id===edgeHover);
 // Breite des Inspectors plus Rand; „Ausführlich“ verbreitert ihn (src/explain.css).
 function inspectorOffset(){const panel=container.current?.closest('.network-workspace')?.querySelector('.network-inspector');return panel?panel.getBoundingClientRect().width+26:466;}
 function bounds(){const width=container.current?.clientWidth||800,height=container.current?.clientHeight||600,mobile=width<=760;return {width:width-(inspectorOpen&&!mobile?inspectorOffset():0),height:height-(inspectorOpen&&mobile?height*.51:0),mobile};}
 function fit(ids:string[],duration:number){const b=bounds(),points=ids.map(id=>destinations[id]).filter(Boolean);if(!points.length)return overviewZoom;const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y)),z=Math.max(.1,Math.min(1.2,(b.width-200)/Math.max(1,right-left),(b.height-150)/Math.max(1,bottom-top)));void flow.setViewport({x:b.width/2-(left+right)/2*z,y:b.height/2-(top+bottom)/2*z,zoom:z},{duration});return z;}
 function ensure(duration:number){
  if(!focus)return;const p=destinations[focus.id],b=bounds(),v=flow.getViewport(),cx=p.x*v.zoom+v.x,cy=p.y*v.zoom+v.y;
  const marginX=Math.min(90,b.width/3),marginY=65,tx=Math.max(marginX,Math.min(b.width-marginX,cx)),ty=Math.max(marginY,Math.min(b.height-marginY,cy));
  if(Math.abs(tx-cx)>1||Math.abs(ty-cy)>1)void flow.setViewport({...v,x:v.x+tx-cx,y:v.y+ty-cy},{duration});
 }
 useEffect(()=>{onViewportReader(()=>flow.getViewport());},[flow,onViewportReader]);
 useEffect(()=>{if(!visible||mounted.current)return;const timer=setTimeout(()=>{if(!container.current?.clientWidth)return;setOverviewZoom(fit([...mapIds],0));mounted.current=true;},80);return ()=>clearTimeout(timer);},[flow,visible]);
 useEffect(()=>{if(!mounted.current)return;const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:320;if(camera.kind==='restore'&&camera.viewport)void flow.setViewport(camera.viewport,{duration});else if(camera.kind==='all')fit([...mapIds],duration);else if(camera.kind==='focus'&&selected)fit([...(gravity?gravityMembers(selected,context.route,trace,contextAnchor):visibleRelated(selected,false,context.route,contextAnchor))],duration);else if(camera.kind==='ensure')ensure(duration);},[camera.id]);
 const flowActions=useStableActions({
  onNodeDrag:(_:unknown,node:MapNode)=>setDragged({id:node.id,position:node.position}),
  onNodeDragStop:(_:unknown,node:MapNode)=>{setDragged(null);handlers.current.onLayoutChange?.(dragLayout(node.id,node.position,destinations,selected,context.route));},
  onEdgeMouseEnter:(_:unknown,edge:Edge)=>setEdgeHover(edge.id),onEdgeMouseLeave:()=>setEdgeHover(null),
  onMoveEnd:(_:unknown,v:Viewport)=>{settleZoom();onViewport(v);},
  onEdgeClick:(_:unknown,e:Edge)=>selectNode(referenceInMap(e.source===focus?.id?e.target:e.source,mapReference,context.route,contextAnchor)),
 });
 return <div ref={container} className={`network-canvas organic-map ${detail?'map-detail':'map-overview'} ${gravity?'gravity-active':''}`} aria-label="Statistikatlas – gesamte interaktive Netzkarte"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} nodeOrigin={nodeOrigin} minZoom={.1} maxZoom={2} nodesConnectable={false} nodesDraggable {...flowActions} elementsSelectable={false} onPaneClick={onBackground} zoomOnDoubleClick={false} ariaLabelConfig={ariaLabelConfig}><Controls showInteractive={false} showFitView={false}/></ReactFlow>
  {hoveredEdge&&<div className={`organic-edge-caption flow-${emphasis.edgeRole(hoveredEdge)}`} role="status"><span>{overviewTitles[hoveredEdge.source]||titles[hoveredEdge.source]} <b>→</b> {overviewTitles[hoveredEdge.target]||titles[hoveredEdge.target]}</span><strong>{hoveredEdge.label}</strong></div>}
  <aside className={`map-direction-key ${activeId?'has-focus':''}`} aria-label="Farben der Bezüge"><p>{activeId?<>Bezüge zu <strong>{titles[activeId]}</strong></>:'Berühre einen Begriff für seine Bezüge'}</p><div><span className="key-incoming"><i aria-hidden="true">→</i>Zum Begriff</span><span className="key-focus"><i aria-hidden="true"/>Im Blick</span><span className="key-outgoing"><i aria-hidden="true">→</i>Vom Begriff</span>{emphasis.both&&<span className="key-both"><i aria-hidden="true"/>Beide Richtungen</span>}</div></aside>
  <div className="organic-zoom-note">{detail?'Detailansicht · jeder Punkt ist ein Begriff':'Überblick · kleine Punkte beim Zoomen entdecken'}</div>
 </div>;
}

export const NetworkMap=memo(NetworkMapImpl);
