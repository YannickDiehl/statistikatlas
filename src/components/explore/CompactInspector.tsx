import { useMemo } from 'react';
import { ArrowUpRight,Expand,X } from 'lucide-react';
import { entryById } from '../../domain/mariposaCatalog';
import { introduction,titleFor,type Ref,type LessonContext } from '../../domain/learning';
import { mapRelations,referenceInMap,regions } from '../../domain/network';
import { conceptRegion,focusLabels,focusPath,type FocusMode } from '../../domain/prototypeMap';
type Props={selected:Ref;context:LessonContext;contextAnchor?:Ref;mode:FocusMode;onMode:(mode:FocusMode)=>void;onSelect:(r:Ref)=>void;onHover:(id:string|null)=>void;onExpand:()=>void;onClose:()=>void;onFocus:()=>void};
export function CompactInspector(p:Props){
 const {selected,context}=p,entry=entryById[selected.id];
 const links=useMemo(()=>{const edges=mapRelations(selected,context.route,p.contextAnchor),path=focusPath(selected.id,edges,p.mode);return edges.filter(e=>path.edges.has(e.id)&&(e.source===selected.id||e.target===selected.id)).map(e=>({id:e.source===selected.id?e.target:e.source,label:e.label,kind:e.kind}));},[selected,context.route,p.contextAnchor,p.mode]);
 const groups=useMemo(()=>Object.entries(links.reduce<Record<string,typeof links>>((groups,link)=>{(groups[conceptRegion(link.id)] ||= []).push(link);return groups;},{})),[links]);
 function link(item:typeof links[number]){const target=referenceInMap(item.id,selected,context.route,p.contextAnchor);return <button key={item.id} className="explorer-related-link" onClick={()=>p.onSelect(target)} onPointerEnter={()=>p.onHover(item.id)} onPointerLeave={()=>p.onHover(null)} onFocus={()=>p.onHover(item.id)} onBlur={()=>p.onHover(null)} title={item.label}><span>{titleFor(target)}</span><ArrowUpRight size={14}/></button>;}
 return <aside className="explorer-preview" aria-labelledby="inspector-title"><div className="explorer-preview-heading"><span className="eyebrow">{entry?.variants.length?'Verfahren erkunden':'Zusammenhänge verstehen'}</span><button onClick={p.onClose} aria-label="Kompakte Erklärung schließen"><X size={18}/></button></div><h1 id="inspector-title">{titleFor(selected)}</h1><p>{entry&&!entry.existing?entry.intro:introduction(selected,context)}</p>
 <div className="explorer-preview-actions"><button className="explorer-expand" onClick={p.onExpand}>Formeln & Experimente öffnen<ArrowUpRight size={17}/></button><button className="explorer-context-link" onClick={p.onFocus}><Expand size={16}/>Umfeld ansehen</button></div>
 <div className="explorer-focus-options"><label>In der Karte hervorheben<select aria-label="Beziehungen hervorheben" value={p.mode} onChange={e=>p.onMode(e.target.value as FocusMode)}>{Object.entries(focusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>
 <details className="explorer-connections"><summary>Weiter erkunden · {links.length} direkte Anschlüsse</summary>{links.length>6?groups.map(([region,items])=><details key={region} className="explorer-connection-group"><summary>{regions.find(r=>r.id===region)?.title||'Weitere Bausteine'} <span>{items!.length}</span></summary>{items!.map(link)}</details>):links.map(link)}{!links.length&&<p>In dieser Richtung gibt es keinen direkten Anschluss. Wähle eine andere Beziehung.</p>}</details>
 </aside>;
}
