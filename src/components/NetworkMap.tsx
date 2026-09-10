import { entryById } from '../domain/mariposaCatalog';
import { useEffect, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, MarkerType, useReactFlow, useStore, type Node, type NodeProps, type Viewport } from '@xyflow/react';
import { concepts, conceptById } from '../domain/concepts';
import { isOperation, titleFor, valueFor, displayValue, unitFor, type Ref, type LessonContext } from '../domain/learning';
import { landmarks, mapTitles, relatedIds, referenceInMap, mapRelations, incomingPaths, routeAfterSelection, regionConcepts } from '../domain/network';

import { restingPlaces, topicAreas, gravityMembers, type MapLayout } from '../domain/mapLayout';

function useAnimatedPlaces(target:MapLayout){
 const [positions,setPositions]=useState(target),current=useRef(target);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)'),start=current.current,begin=performance.now();let frame=0;
  function finish(){cancelAnimationFrame(frame);current.current=target;setPositions(target);}
  function tick(now:number){const t=Math.min(1,(now-begin)/420),ease=t*t*(3-2*t);const next=Object.fromEntries(Object.keys(target).map(id=>[id,{x:start[id].x+(target[id].x-start[id].x)*ease,y:start[id].y+(target[id].y-start[id].y)*ease}]));current.current=next;setPositions(next);if(t<1)frame=requestAnimationFrame(tick);}
  if(media.matches||start===target)finish();else frame=requestAnimationFrame(tick);
  media.addEventListener('change',finish);return ()=>{cancelAnimationFrame(frame);media.removeEventListener('change',finish);};
 },[target]);return positions;
}

type MapData={reference:Ref;context:LessonContext;active:boolean;related:boolean;hovered:boolean;visited:boolean;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void};
type MapNode=Node<MapData,'concept'>;
const sides=[['left',Position.Left],['right',Position.Right],['top',Position.Top],['bottom',Position.Bottom]] as const;
function Concept({data:d}:NodeProps<MapNode>){const r=d.reference,c=conceptById[r.id];return <article className={`network-node ${entryById[r.id]&&!entryById[r.id].existing?'package-node':''} concept-${r.id} ${landmarks.has(r.id)?'landmark':''} category-${c.category} ${d.active?'selected':''} ${d.related?'related':'muted'} ${d.hovered?'hovered':''} ${d.visited?'visited':''}`}>
 {sides.map(([side,position])=><Handle key={`in-${side}`} id={`in-${side}`} type="target" position={position}/>)}
 <button className="nodrag" onClick={()=>d.onSelect(r)} onPointerEnter={()=>d.onHover(r.id)} onPointerLeave={()=>d.onHover(null)} onFocus={()=>d.onHover(r.id)} onBlur={()=>d.onHover(null)} aria-label={`${titleFor(r)} im Netzwerk erkunden`} aria-pressed={d.active}><span className="network-node-kind">{c.category==='operation'?'Rechenschritt':c.category==='data'?'Grundlage':c.category==='relationship'?'Zusammenhang':'Baustein'}</span><strong>{r.use==='z'&&['crossproduct','crossproduct_sum'].includes(r.id)?(r.id==='crossproduct'?'z-Produkte':'z-Produktsumme'):mapTitles[r.id]||titleFor(r)}</strong><span className="network-node-value">{!isOperation(r)&&valueFor(r,d.context)!==null?`${['validn','count','df','crossproduct','crossproduct_sum','covariance','sd_product','pearson'].includes(r.id)?'':r.variable.toUpperCase()+' · '}${displayValue(r,d.context)} ${unitFor(r,d.context)}`:c.short}</span><span className="network-node-dot" aria-hidden="true"/></button>
 {sides.map(([side,position])=><Handle key={`out-${side}`} id={`out-${side}`} type="source" position={position}/>)}</article>;}
type RegionData={region:ReturnType<typeof topicAreas>[number];onOpen:()=>void;zoom:number};
function Region({data:d}:NodeProps<Node<RegionData,'region'>>){
 const compact=d.zoom<.16,short:Record<string,string>={basics:'Kennwerte',prepare:'Daten',inference:'Schlüsse',groups:'Gruppen',models:'Modelle',categorical:'Kategorien & Ränge',describe:'Verteilungen',scales:'Skalen'};
 return <div className="map-region" style={{width:d.region.width,height:d.region.height}}><button className="nodrag region-open" style={{left:Number.isFinite(d.region.labelX)?d.region.labelX-d.region.x:d.region.width/2,top:Number.isFinite(d.region.labelY)?d.region.labelY-d.region.y:80,transform:`translate(-50%,-100%) scale(${Math.min(20,1/d.zoom)})`,transformOrigin:'bottom center'}} onClick={d.onOpen} title={`${d.region.title} · ${d.region.description}`} aria-label={`${d.region.title}: Kartenbereich öffnen`}><strong>{compact?short[d.region.id]:d.region.title}</strong><span aria-hidden="true">↗</span></button></div>;
}
export const nodeTypes={concept:Concept,region:Region};
export const nodeInteraction={style:{pointerEvents:'all' as const},zIndex:3,draggable:false,selectable:false,focusable:false};
export type CameraRequest={id:number;kind:'all'|'focus'|'restore'|'ensure'|'none'|'area';regionId?:string;viewport?:Viewport};
export function NetworkMap({selected,context,hovered,visited,onSelect,onHover,onViewport,onViewportReader,camera,trace=false,inspectorOpen=false,onBackground,highlightRef,onRegion,layout,onLayoutReader,gravity=false}:{selected:Ref|null;context:LessonContext;hovered:string|null;visited:Set<string>;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void;onViewport:(v:Viewport)=>void;onViewportReader:(read:()=>Viewport)=>void;camera:CameraRequest;trace?:boolean;inspectorOpen?:boolean;onBackground?:()=>void;highlightRef?:Ref;onRegion?:(id:string)=>void;layout?:MapLayout;onLayoutReader?:(read:()=>MapLayout)=>void;gravity?:boolean}){
 const destinations=layout||restingPlaces,positions=useAnimatedPlaces(destinations);
 const drawn=useRef(positions);drawn.current=positions;
 useEffect(()=>{onLayoutReader?.(()=>drawn.current);},[onLayoutReader]);
 const zoom=useStore(s=>s.transform[2]);
 const flow=useReactFlow(),container=useRef<HTMLDivElement>(null),mounted=useRef(false);
 const mapReference=highlightRef||(hovered?referenceInMap(hovered,selected,context.route):selected),hoverRoute=mapReference?routeAfterSelection(selected,mapReference,context.route):context.route,relations=mapRelations(mapReference,hoverRoute,selected),hoverPath=hovered?incomingPaths(hovered,relations):null,related=hoverPath?.nodes||relatedIds(selected,trace,context.route),hoverNeighbors=hoverPath?.nodes;
 const conceptNodes:MapNode[]=concepts.map(c=>({id:c.id,type:'concept',position:positions[c.id],...nodeInteraction,data:{reference:highlightRef?.id===c.id?highlightRef:referenceInMap(c.id,mapReference,context.route),context,active:selected?.id===c.id,related:related.has(c.id)||!!hoverNeighbors?.has(c.id),hovered:hovered===c.id,visited:visited.has(c.id),onSelect,onHover}}));
 const edges=relations.map(e=>{const a=positions[e.source],b=positions[e.target],dx=b.x-a.x,dy=b.y-a.y,vertical=Math.abs(dy)>Math.abs(dx),sourceSide=vertical?(dy>0?'bottom':'top'):(dx>0?'right':'left'),targetSide=vertical?(dy>0?'top':'bottom'):(dx>0?'left':'right'),direct=e.source===selected?.id||e.target===selected?.id,hover=hoverPath?.edges.has(e.id),traced=trace&&related.has(e.source)&&related.has(e.target),strong=!e.alternative&&(hoverPath?hover:direct||traced);return {id:e.id,source:e.source,target:e.target,sourceHandle:`out-${sourceSide}`,targetHandle:`in-${targetSide}`,type:'default',label:direct?e.label:undefined,style:{stroke:e.kind==='condition'?'#98714e':strong?'#6b8266':'#bfc7b6',strokeWidth:strong?2.1:1.2,opacity:(selected||hovered)&&!strong?.18:strong?1:.65,strokeDasharray:e.alternative?'3 7':e.kind==='condition'?'7 4':e.kind==='optional'?'2 5':undefined},markerEnd:{type:MarkerType.ArrowClosed,color:strong?'#6b8266':'#bfc7b6',width:16,height:16},labelStyle:{fontSize:12,fill:'#43553e'},labelBgStyle:{fill:'#faf8f3',fillOpacity:.94},labelBgPadding:[6,4] as [number,number],labelBgBorderRadius:3,focusable:false,zIndex:strong?2:0};});
 const regionNodes:Node<RegionData,'region'>[]=topicAreas(destinations).map(region=>({id:`region-${region.id}`,type:'region',position:{x:region.x,y:region.y},width:region.width,height:region.height,style:{pointerEvents:'none'},zIndex:1,selectable:false,draggable:false,data:{region,zoom,onOpen:()=>onRegion?.(region.id)}}));
 const nodes=[...regionNodes,...conceptNodes];
 function bounds(){const width=container.current?.clientWidth||800,height=container.current?.clientHeight||600,mobile=width<=760;return {width:width-(inspectorOpen&&!mobile?434:0),height:height-(inspectorOpen&&mobile?height*.51:0),mobile};}
 function fit(ids:string[],duration:number,readable=false){const b=bounds(),points=ids.map(id=>destinations[id]).filter(Boolean),left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x+196)),top=Math.min(...points.map(p=>p.y))-120,bottom=Math.max(...points.map(p=>p.y+112)),zoom=Math.max(.05,Math.min(1.1,(b.width-80)/(right-left),(b.height-190)/(bottom-top)));if(readable&&zoom<(b.mobile?.8:.85)){ensure(duration,true);return;}void flow.setViewport({x:b.width/2-(left+right)/2*zoom,y:(b.height+100)/2-(top+bottom)/2*zoom,zoom},{duration});}
 function ensure(duration:number,center=false){
  if(!selected)return;const p=destinations[selected.id],b=bounds(),v=flow.getViewport(),zoom=Math.max(v.zoom,b.mobile?.8:.85),cx=(p.x+98)*v.zoom+v.x,cy=(p.y+56)*v.zoom+v.y;
  const left=48,right=b.width-20,top=b.mobile&&inspectorOpen?18:125,bottom=b.height-60,px=Math.min(108*zoom,(right-left)/2),py=Math.min(65*zoom,(bottom-top)/2);
  const tx=center?(left+right)/2:Math.max(left+px,Math.min(right-px,cx)),ty=center?(top+bottom)/2:Math.max(top+py,Math.min(bottom-py,cy));
  if(zoom!==v.zoom||Math.abs(tx-cx)>1||Math.abs(ty-cy)>1)void flow.setViewport({zoom,x:tx-(p.x+98)*zoom,y:ty-(p.y+56)*zoom},{duration});else void flow.setViewport(v,{duration:0});
 }
 useEffect(()=>{onViewportReader(()=>flow.getViewport());},[flow,onViewportReader]);
 useEffect(()=>{const timer=setTimeout(()=>{if(!container.current?.clientWidth)return;if(container.current.clientWidth<=760){const b=bounds(),zoom=.65;void flow.setViewport({x:b.width/2-1040*zoom,y:b.height/2-510*zoom,zoom});}else fit(concepts.map(c=>c.id),0);mounted.current=true;},80);return ()=>clearTimeout(timer);},[flow]);
 useEffect(()=>{if(!mounted.current)return;const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:320;if(camera.kind==='area'&&camera.regionId)fit(regionConcepts(camera.regionId),duration);else if(camera.kind==='restore'&&camera.viewport)void flow.setViewport(camera.viewport,{duration});else if(camera.kind==='all')fit(concepts.map(c=>c.id),duration);else if(camera.kind==='focus'&&selected)fit([...(gravity?gravityMembers(selected,context.route,trace):relatedIds(selected,false,context.route))],duration,!gravity);else if(camera.kind==='ensure')ensure(duration);},[camera.id]);
 return <div ref={container} className={`network-canvas ${zoom<.48?'map-overview':'map-detail'} ${gravity?'gravity-active':''}`} aria-label="Statistikatlas – gesamte interaktive Netzkarte"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} minZoom={.05} maxZoom={1.5} nodesConnectable={false} nodesDraggable={false} elementsSelectable={false} onPaneClick={onBackground} onMoveEnd={(_,v)=>onViewport(v)} onEdgeClick={(_,e)=>onSelect(referenceInMap(e.source===selected?.id?e.target:e.source,mapReference,context.route))} zoomOnDoubleClick={false} ariaLabelConfig={{'controls.zoomIn.ariaLabel':'Karte vergrößern','controls.zoomOut.ariaLabel':'Karte verkleinern','controls.fitView.ariaLabel':'Ganze Karte zeigen'}}><Background color="#cdd4c3" gap={24} size={1}/><Controls showInteractive={false} showFitView={false}/><MiniMap nodeColor={n=>n.type==='region'?'transparent':n.id===selected?.id?'#8b2e2e':hoverNeighbors?.has(n.id)?'#7a8f6e':'#bcc8b1'} maskColor="rgba(250,248,243,.8)" pannable zoomable ariaLabel="Orientierung in der gesamten Karte"/></ReactFlow></div>;
}
