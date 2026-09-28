import {useEffect,useState} from 'react';
import {ArrowLeft,ChevronDown} from 'lucide-react';
import {resolveAtlasTask,type AtlasTaskContext} from '../domain/learningTasks';
import {titleFor,ref} from '../domain/learning';
export function AtlasTaskBridge({context,onConcept,onReturn}:{context:AtlasTaskContext;onConcept:(id:string,context:AtlasTaskContext)=>void;onReturn:()=>void}){
 const [expanded,setExpanded]=useState(true);
 useEffect(()=>setExpanded(true),[context.sessionId,context.taskIndex]);
 const resolved=resolveAtlasTask(context);if(!resolved)return null;
 const {session,task,concept}=resolved;
 return <aside className="atlas-task-bridge" aria-label="Arbeitsauftrag aus dem Lernpfad">
  <div className="atlas-task-heading"><span>Sitzung {session.id} · Aufgabe {context.taskIndex+1}</span><strong>{task.title}</strong><button onClick={onReturn}><ArrowLeft size={16}/>Zur Aufgabe</button><button className="atlas-task-collapse" onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded} aria-controls="atlas-task-instructions">{expanded?'Auftrag einklappen':'Auftrag anzeigen'}<ChevronDown size={16}/></button></div>
  <div id="atlas-task-instructions" hidden={!expanded}><p><strong>{titleFor(ref(concept.id))}: </strong>{concept.prompt}</p><div className="atlas-task-concepts">{task.atlas.map((link,conceptIndex)=><button key={link.id} onClick={()=>onConcept(link.id,{...context,conceptIndex})}>{titleFor(ref(link.id))}</button>)}</div><small>Der Atlas nutzt eigene Lehr- und Modelldaten. Übertrage den Zusammenhang auf deine politische Frage; die Zahlen sind keine ALLBUS-Ergebnisse.</small></div>
 </aside>;
}
