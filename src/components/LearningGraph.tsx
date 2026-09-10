import { useEffect, useMemo, useRef } from 'react';
import dagre from '@dagrejs/dagre';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType, useReactFlow, type Node, type NodeProps, type Viewport } from '@xyflow/react';
import { concepts, connections, conceptById } from '../domain/concepts';
import { ref, keyOf, inputs, visibleRefs, titleFor, subtitle, valueFor, numberText, unitFor, isOperation, type Ref, type LessonContext } from '../domain/learning';

type BlockData = { reference: Ref; context: LessonContext; active: boolean; highlighted: boolean; expanded: boolean; overview: boolean; onSelect: (r:Ref)=>void; onExpand:(r:Ref)=>void };
type Block = Node<BlockData, 'block'>;
function BlockNode({data}:NodeProps<Block>) {
 const r=data.reference, operation=isOperation(r), hasInputs=inputs(r,data.context.route).length>0;
 return <div className={`atlas-node ${operation?'operation-node':''} ${data.active?'active':''} ${data.highlighted?'highlighted':''}`}>
  <Handle type="target" position={Position.Left}/>
  <button className="node-content nodrag" onClick={()=>data.onSelect(r)} aria-label={`${titleFor(r)}, ${subtitle(r)} erklären`} aria-pressed={data.active}>
   <span className="node-label">{operation?'Rechenschritt':subtitle(r)}</span><strong>{titleFor(r)}</strong>
   {!operation&&<span className="node-result">{valueFor(r,data.context)!==null?`${numberText(valueFor(r,data.context))} ${unitFor(r)}`:conceptById[r.id]?.category==='data'?'Ausgangspunkt':'Noch nicht definiert'}</span>}
  </button>
  {!operation&&!data.overview&&hasInputs&&<button className="node-expand nodrag" aria-expanded={data.expanded} onClick={()=>data.onExpand(r)}>{data.expanded?'− Zuklappen':'+ Woraus entsteht das?'}</button>}
  {data.overview&&<span className="node-category">{({data:'Daten & Voraussetzungen',operation:'Rechenschritte',summary:'Kennwerte',relationship:'Zusammenhänge'})[conceptById[r.id].category]}</span>}
  <Handle type="source" position={Position.Right}/>
 </div>;
}
const nodeTypes={block:BlockNode};
export type GraphProps={focus:Ref;selected:Ref;expanded:Set<string>;context:LessonContext;overview:boolean;highlight:string|null;onSelect:(r:Ref)=>void;onExpand:(r:Ref)=>void;onDrill:(r:Ref)=>void;viewId:number;restore?:Viewport;restorePositions?:Map<string,{x:number;y:number}>;onPositions:(positions:Map<string,{x:number;y:number}>)=>void;onViewport:(v:Viewport)=>void};
export function LearningGraph(p:GraphProps){
 const flow=useReactFlow<Block>(), container=useRef<HTMLDivElement>(null), previous=useRef(new Map<string,{x:number;y:number}>());
 const focusKey=keyOf(p.focus), expansionKey=[...p.expanded].sort().join('|');
 const structure=useMemo(()=>{
  const refs=p.overview?concepts.map(c=>ref(c.id)):visibleRefs(p.focus,p.expanded,p.context.route), ids=new Set(refs.map(keyOf));
  const links=p.overview?connections.map(e=>({source:keyOf(ref(e.source)),target:keyOf(ref(e.target)),label:e.label,kind:e.kind})):
   refs.flatMap(r=>(p.expanded.has(keyOf(r))||isOperation(r))?inputs(r,p.context.route).filter(child=>ids.has(keyOf(child))).map(child=>({source:keyOf(child),target:keyOf(r),label:'',kind:'build'})):[]);
  const g=new dagre.graphlib.Graph();g.setGraph({rankdir:'LR',nodesep:26,ranksep:62,marginx:30,marginy:30});g.setDefaultEdgeLabel(()=>({}));
  refs.forEach(r=>g.setNode(keyOf(r),{width:isOperation(r)?158:218,height:isOperation(r)?80:p.overview?134:162}));links.forEach(e=>g.setEdge(e.source,e.target));dagre.layout(g);
  const anchor=previous.current.get(keyOf(p.selected)), current=g.node(keyOf(p.selected));
  const delta=anchor&&current&&!p.overview?{x:anchor.x-(current.x-current.width/2),y:anchor.y-(current.y-current.height/2)}:{x:0,y:0};
  const positions=new Map(refs.map(r=>{const n=g.node(keyOf(r));return [keyOf(r),p.restorePositions?.get(keyOf(r))||{x:n.x-n.width/2+delta.x,y:n.y-n.height/2+delta.y}];}));previous.current=positions;
  return {refs,positions,links};
 // Data edits and term highlighting must not relayout the map.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[focusKey,p.focus.variable,expansionKey,p.context.route,p.overview,p.viewId]);
 useEffect(()=>p.onPositions(structure.positions),[structure.positions]);
 const nodes:Block[]=structure.refs.map(r=>({id:keyOf(r),type:'block',position:structure.positions.get(keyOf(r))!,draggable:false,selectable:false,data:{reference:r,context:p.context,active:keyOf(r)===keyOf(p.selected),highlighted:keyOf(r)===p.highlight,expanded:p.expanded.has(keyOf(r)),overview:p.overview,onSelect:p.onSelect,onExpand:p.onExpand}}));
 const edges=structure.links.map((e,i)=>({id:`${e.source}-${e.target}-${i}`,source:e.source,target:e.target,type:'smoothstep',label:p.overview&&(e.source===keyOf(p.selected)||e.target===keyOf(p.selected))?e.label:undefined,style:{stroke:e.kind==='condition'||e.source===keyOf(p.selected)||e.target===keyOf(p.selected)?'#8b2e2e':'#809080',strokeWidth:e.source===keyOf(p.selected)||e.target===keyOf(p.selected)?2:1.5,strokeDasharray:e.kind==='condition'?'6 4':e.kind==='optional'?'2 5':undefined},markerEnd:{type:MarkerType.ArrowClosed,color:'#809080'},labelStyle:{fontSize:11,fill:'#62695e'},labelBgStyle:{fill:'#faf8f3'},focusable:false}));
 useEffect(()=>{const handle=setTimeout(()=>{if(!container.current?.clientWidth)return;if(p.restore)void flow.setViewport(p.restore);else void flow.fitView({padding:.15,minZoom:.25,maxZoom:1,duration:0});},70);return ()=>clearTimeout(handle);},[p.viewId,p.overview,flow]);
 return <>
  <div className="graph-canvas" ref={container} aria-label={p.overview?'Gesamtkarte der 29 Bausteine':'Dein aufgeklappter Baukasten'}>
   <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} minZoom={.12} maxZoom={1.6} nodesConnectable={false} nodesDraggable={false} elementsSelectable={false} onMoveEnd={(_,v)=>p.onViewport(v)} proOptions={{hideAttribution:true}} preventScrolling={false} zoomOnDoubleClick={false} ariaLabelConfig={{'controls.zoomIn.ariaLabel':'Vergrößern','controls.zoomOut.ariaLabel':'Verkleinern','controls.fitView.ariaLabel':'Sichtbare Bausteine einpassen','controls.interactive.ariaLabel':'Interaktion umschalten'}}>
    <Background color="#cdd0c4" gap={22} size={1}/><Controls showInteractive={false}/>
   </ReactFlow>
  </div>
  <div className="mobile-recipe" aria-label="Bausteine in dieser Ansicht">
   {[...new Map([p.selected,...inputs(p.selected,p.context.route).flatMap(r=>isOperation(r)?inputs(r,p.context.route):[r])].map(r=>[keyOf(r),r])).values()].map(r=><div key={keyOf(r)} className={keyOf(r)===keyOf(p.selected)?'active':''}><button onClick={()=>p.onSelect(r)}><span className="eyebrow">{subtitle(r)}</span><strong>{titleFor(r)}</strong><span>{valueFor(r,p.context)===null?'':`${numberText(valueFor(r,p.context))} ${unitFor(r)}`}</span></button>{inputs(r,p.context.route).length>0&&<button className="text-button" onClick={()=>p.onDrill(r)}>Baustein zerlegen →</button>}</div>)}
  </div>
 </>;
}
