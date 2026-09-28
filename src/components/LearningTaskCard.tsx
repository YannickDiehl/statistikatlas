import {ArrowUpRight,BookOpen,Check,ChevronDown,Compass} from 'lucide-react';
import {titleFor,ref} from '../domain/learning';
import {taskAnchor,type LearningTask,type TaskWork,type AtlasTaskContext} from '../domain/learningTasks';

type Props={sessionId:number;index:number;task:LearningTask;work:TaskWork;onWork:(work:TaskWork)=>void;onConcept:(id:string,context?:AtlasTaskContext)=>void;onR:()=>void;onSandbox?:()=>void};
export function LearningTaskCard({sessionId,index,task,work,onWork,onConcept,onR,onSandbox}:Props){
 const anchor=taskAnchor(sessionId,index),complete=task.checks.every((_,i)=>work.checked[i]);
 return <section className="learning-task-card" aria-labelledby={anchor}>
  <div className="task-meta"><span>AUFGABE {index+1} · {['ERKUNDEN','ANWENDEN','ÜBERTRAGEN'][index]}</span><span>etwa {task.minutes} Min.</span>{complete&&<span className="task-checked"><Check size={15}/>selbst geprüft</span>}</div>
  <h3 id={anchor} tabIndex={-1}>{task.title}</h3>
  <ol className="task-instructions">{task.instructions.map(instruction=><li key={instruction}>{instruction}</li>)}</ol>
  <div className="task-atlas"><strong><Compass size={18}/>Mit dem Atlas untersuchen</strong><p>Öffne einen Baustein mit deinem Arbeitsauftrag. Danach kommst du genau zu dieser Aufgabe zurück.</p>
   {task.atlas.map((concept,conceptIndex)=><button key={concept.id} onClick={()=>onConcept(concept.id,{sessionId,taskIndex:index,conceptIndex})}><span><strong>{titleFor(ref(concept.id))}</strong><small>{concept.prompt}</small></span><ArrowUpRight size={18}/></button>)}
  </div>
  <div className="task-materials">{onSandbox&&<button onClick={onSandbox}>Zum politischen Modellversuch <ArrowUpRight size={16}/></button>}{index===1&&<button onClick={onR}><BookOpen size={16}/>Passendes R-Skript öffnen</button>}</div>
  <div className="task-response"><label htmlFor={`${anchor}-note`}><strong>Deine Beobachtung und Begründung</strong><span>{task.responsePrompt}</span></label><textarea id={`${anchor}-note`} value={work.note} maxLength={12000} rows={4} placeholder="Halte deinen Gedankengang fest. Du kannst ihn nach einem Atlas-Ausflug ergänzen." onChange={e=>onWork({...work,note:e.target.value})}/></div>
  <div className="task-support"><p>Du kommst nicht weiter? Öffne so viel Hilfe, wie du brauchst.</p>
   {task.hints.map((hint,i)=><details key={i}><summary>Hinweis {i+1} · {i===0?'Ein erster Ansatz':'Einen Schritt weiter'}<ChevronDown size={17}/></summary><p>{hint}</p></details>)}
   <details className="task-solution"><summary>Musterlösung mit Begründung<ChevronDown size={17}/></summary><p>{task.solution}</p><p className="task-solution-note">Vergleiche den Gedankengang mit deiner Notiz. Bei offenen Fragen können mehrere begründete Antworten passen.</p></details>
  </div>
  <fieldset className="task-selfcheck"><legend>Prüfe deine Antwort selbst</legend>{task.checks.map((criterion,i)=><label key={criterion}><input type="checkbox" checked={!!work.checked[i]} onChange={e=>onWork({...work,checked:task.checks.map((_,j)=>j===i?e.target.checked:!!work.checked[j])})}/><span>{criterion}</span></label>)}</fieldset>
 </section>;
}
