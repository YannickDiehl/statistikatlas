import { ArrowLeft, ArrowRight, BookOpen, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessions, workshopUrl, type Session, type Term } from '../domain/curriculum';
import { claimById } from '../sandbox/claims';
import { emptyStore, initialWork, missionStatus, missionStorageKey, parseStore, type ClaimWork, type MissionStore } from '../sandbox/state';
import { ClaimWorkspace } from '../sandbox/ui/ClaimWorkspace';
import { DataDrop, type LoadedData } from '../sandbox/ui/DataDrop';
import { emptyTaskStore, parseTaskStore, taskStorageKey, type TaskStore } from '../tasks/kit/storage';
import { taskRegistry } from '../tasks/registry';
import { TaskHost } from '../tasks/TaskHost';

const STORAGE_WARNING = 'Dein Browser erlaubt keine lokale Speicherung. Deine Arbeit bleibt nur erhalten, solange dieser Tab offen ist.';
const STATUS_TEXT = { open: 'Mission offen', running: 'Mission läuft', done: 'Mission abgeschlossen' } as const;
const TASK_TEXT = { open: 'Aufgabe offen', running: 'Aufgabe läuft', done: 'Aufgabe abgeschlossen' } as const;

function readStore(): { store: MissionStore; tasks: TaskStore; warning: string } {
  if (typeof localStorage === 'undefined') return { store: emptyStore(), tasks: emptyTaskStore(), warning: '' };
  try {
    return { store: parseStore(localStorage.getItem(missionStorageKey)), tasks: parseTaskStore(localStorage.getItem(taskStorageKey)), warning: '' };
  } catch {
    return { store: emptyStore(), tasks: emptyTaskStore(), warning: STORAGE_WARNING };
  }
}

function sessionStatus(session: Session, store: MissionStore, tasks: TaskStore): string {
  const def = session.task ? taskRegistry[session.task] : undefined;
  if (def) {
    const raw = tasks.tasks[def.id];
    return TASK_TEXT[def.status(raw === undefined ? def.initial() : def.parse(raw))];
  }
  if (session.mission) return STATUS_TEXT[missionStatus(store.work[session.mission])];
  return 'Aufgabe folgt';
}

function Terms({ label, terms, onConcept }: { label: string; terms: Term[]; onConcept: (id: string) => void }) {
  if (!terms.length) return null;
  return <>
    <span className="learning-eyebrow">{label}</span>
    <ul className="learning-term-list">
      {terms.map(term => <li key={term.label}>{term.concept
        ? <button onClick={() => onConcept(term.concept!)}>{term.label}</button>
        : <span title="Steht im Sitzungsplan, fehlt der Karte noch">{term.label}</span>}</li>)}
    </ul>
  </>;
}

export function LearningPath({ onConcept, sessionIndex = 0, onSessionChange, initialData = null, initialStore, initialTasks }: {
  onConcept: (id: string) => void;
  sessionIndex?: number;
  onSessionChange: (index: number) => void;
  initialData?: LoadedData | null;
  initialStore?: MissionStore;
  initialTasks?: TaskStore;
}) {
  const [data, setData] = useState<LoadedData | null>(initialData);
  const [{ store: loaded, tasks: loadedTasks, warning: loadWarning }] = useState(readStore);
  const [store, setStore] = useState<MissionStore>(initialStore ?? loaded);
  const [tasks, setTasks] = useState<TaskStore>(initialTasks ?? loadedTasks);
  const [warning, setWarning] = useState(loadWarning);
  const index = Math.min(Math.max(sessionIndex, 0), sessions.length - 1);
  const session = sessions[index];

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(missionStorageKey, JSON.stringify(store));
      localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
    } catch {
      setWarning(STORAGE_WARNING);
    }
  }, [store, tasks]);

  const choose = (next: number) => {
    onSessionChange(next);
    requestAnimationFrame(() => document.getElementById('learning-heading')?.focus({ preventScroll: true }));
    document.getElementById('learning-main')?.scrollTo({ top: 0 });
  };
  const claim = session.mission ? claimById[session.mission] : null;
  const taskDef = session.task ? taskRegistry[session.task] : undefined;
  const work = claim ? store.work[claim.id] ?? initialWork(claim) : null;
  const updateWork = (next: ClaimWork) => { if (claim) setStore(s => ({ ...s, work: { ...s.work, [claim.id]: next } })); };
  const dataLine = data ? `ALLBUScompact 2023 · ${data.version || 'Version unbekannt'} · ${data.sav.nCases.toLocaleString('de-DE')} Befragte` : 'ALLBUS noch nicht geladen';

  return <main className="learning-path" id="learning-main">
    <aside className="learning-rail">
      <a className="learning-brand" href="#learning-main">Statistikatlas<span>.</span></a>
      <span className="learning-eyebrow">LERNPFAD · STATISTIK IB</span>
      <h1>Statistik als Entscheidungshilfe</h1>
      <p>Zehn Sitzungen nach dem Sitzungsplan. Jede Sitzung gibt dir einen neuen Auftrag mit dem echten ALLBUScompact 2023: Du rechnest in R und entscheidest selbst, was die Daten tragen.</p>
      <p className="learning-data-status">{dataLine}{data && <> · <button className="sandbox-link" onClick={() => setData(null)}>Andere Datei laden</button></>}</p>
      <nav aria-label="Sitzungen"><ol>
        {sessions.map((s, i) => {
          const status = sessionStatus(s, store, tasks);
          const done = status === STATUS_TEXT.done || status === TASK_TEXT.done;
          return <li key={s.id} className={`${i === index ? 'current' : ''}${done ? ' done' : ''}`}>
            <button aria-current={i === index ? 'page' : undefined} onClick={() => choose(i)}>
              <span>{s.id}</span><strong>{s.title}<small>{status}</small></strong>
              {done && <Check size={16} aria-hidden="true" />}
            </button>
          </li>;
        })}
      </ol></nav>
      <a className="learning-source" href={workshopUrl} target="_blank" rel="noreferrer"><BookOpen size={16} aria-hidden="true" /> R-Workshop von Diehl und Moosdorf</a>
    </aside>

    <article className="learning-lesson" aria-labelledby="learning-heading">
      <div className="learning-meta"><span>Sitzung {session.id}</span><span>{session.short}</span><span>{session.plan}</span></div>
      <h2 id="learning-heading" tabIndex={-1}>{session.title}</h2>
      <p className="learning-lead">{session.question}</p>
      {warning && <p className="sandbox-warning" role="status">{warning}</p>}

      <section className="learning-terms" aria-label="Begriffe dieser Sitzung">
        <Terms label="WIEDERHOLUNG" terms={session.repetition} onConcept={onConcept} />
        <Terms label="NEU IN DIESER SITZUNG" terms={session.introduced} onConcept={onConcept} />
        <p className="learning-term-note">Begriffe öffnen die freie Karte. Gestrichelte stehen im Sitzungsplan und fehlen der Karte noch.</p>
      </section>

      <section className="sandbox learning-mission" aria-label="Aufgabe">
        {taskDef && <TaskHost key={taskDef.id} def={taskDef} data={data} raw={tasks.tasks[taskDef.id]}
          onRaw={next => setTasks(t => ({ tasks: { ...t.tasks, [taskDef.id]: next } }))} onData={setData} onConcept={onConcept} />}
        {!taskDef && claim && work && (data
          ? <>
              <span className="learning-eyebrow">MISSION · BELEGE ES!</span>
              <ClaimWorkspace key={claim.id} sav={data.sav} fileName={data.fileName} claim={claim} work={work} onChange={updateWork} onConcept={onConcept} />
            </>
          : <>
              <span className="learning-eyebrow">MISSION · BELEGE ES!</span>
              <p>In dieser Mission prüfst du die Behauptung „{claim.quote}“ mit dem echten ALLBUS. Lade dafür zuerst deine Datei.</p>
              <DataDrop onLoaded={setData} />
            </>)}
        {!taskDef && !claim && <div className="learning-mission-soon">
          <span className="learning-eyebrow">AUFGABE FOLGT</span>
          <p>Für diese Sitzung entsteht eine eigene Aufgabe mit echten ALLBUS-Daten. Bis dahin: Begriffe oben in der Karte erkunden und im Seminar in R arbeiten.</p>
        </div>}
      </section>

      <nav className="learning-pagination" aria-label="Sitzung wechseln">
        <button disabled={index === 0} onClick={() => choose(index - 1)}><ArrowLeft size={17} aria-hidden="true" /> {index > 0 ? `Sitzung ${sessions[index - 1].id}: ${sessions[index - 1].title}` : 'Anfang'}</button>
        <button disabled={index === sessions.length - 1} onClick={() => choose(index + 1)}>{index < sessions.length - 1 ? `Sitzung ${sessions[index + 1].id}: ${sessions[index + 1].title}` : 'Ende'} <ArrowRight size={17} aria-hidden="true" /></button>
      </nav>
    </article>
  </main>;
}
