import { Download, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { downloadText } from '../../domain/mariposa';
import type { SavFile } from '../../sandbox/readSav';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { antraege, handshakeHint, SETUP_SCRIPT, type Antrag, type AntragId } from './content';
import { checkHandshake, checkStamp, decodeError, findVar, plenumLines, reportMarkdown, rScript, type S01State, type SearchResult, type Stamp } from './domain';

const splitWords = (text: string) => text.split(/[,;\n]/).map(w => w.trim()).filter(Boolean);

/** Freitext für Suchwörter: Der Rohtext bleibt beim Tippen erhalten (Komma, Leerzeichen); übernommen werden die getrennten Wörter. */
function SearchWordsInput({ words, onChange }: { words: string[]; onChange: (words: string[]) => void }) {
  const [text, setText] = useState(words.join(', '));
  useEffect(() => {
    if (splitWords(text).join('|') !== words.join('|')) setText(words.join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.join('|')]);
  return <input type="text" value={text} onChange={e => { setText(e.target.value); onChange(splitWords(e.target.value)); }} />;
}

function SearchTester({ sav, onSearched }: { sav: SavFile; onSearched: (word: string) => void }) {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<{ word: string; r: SearchResult } | null>(null);
  const run = () => { const r = findVar(sav, word); setResult({ word: word.trim(), r }); if (r.ok) onSearched(word.trim()); };
  return <div className="s01-tester">
    <label className="sandbox-search">
      <Search size={16} aria-hidden="true" />
      <input type="search" value={word} placeholder="Suchwort, das du auch in R probierst" aria-label="Suchwort testen"
        onChange={e => setWord(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') run(); }} />
      <button onClick={run}>Treffer zählen</button>
    </label>
    {result && (result.r.ok
      ? <><p className="sandbox-note" role="status">{result.r.hits.length} Treffer für „{result.word}“. Namen und Labels liest du in R.</p><Feedback notes={result.r.notes} /></>
      : <p className="sandbox-error" role="status">{result.r.message}</p>)}
  </div>;
}

function StampEditor({ sav, antrag, stamp, onChange }: { sav: SavFile; antrag: Antrag | null; stamp: Stamp; onChange: (s: Stamp) => void }) {
  const set = (patch: Partial<Stamp>) => onChange({ ...stamp, ...patch });
  return <div className="s01-stamp">
    <div className="sandbox-chips" role="group" aria-label="Stempel">
      <button aria-pressed={stamp.decision === 'take'} onClick={() => set({ decision: 'take' })}>Übernehmen</button>
      <button aria-pressed={stamp.decision === 'ask'} onClick={() => set({ decision: 'ask' })}>Beauftragen</button>
    </div>
    {stamp.decision === 'take' && <div className="task-grid">
      <label>Variable<input type="text" value={stamp.variable} placeholder="z. B. rh08b" onChange={e => set({ variable: e.target.value })} /></label>
      <label>Label des niedrigsten Werts<input type="text" value={stamp.lowest} onChange={e => set({ lowest: e.target.value })} /></label>
      <label>Wie vielen wurde die Frage gestellt?<input type="text" inputMode="numeric" value={stamp.asked} onChange={e => set({ asked: e.target.value })} /></label>
    </div>}
    {stamp.decision === 'ask' && <div className="task-grid">
      <label>Deine Suchwörter in R (mit Komma getrennt)<SearchWordsInput words={stamp.searches} onChange={searches => set({ searches })} /></label>
      <label>Begründung (ein Satz)<input type="text" value={stamp.note} onChange={e => set({ note: e.target.value })} /></label>
    </div>}
    <Feedback notes={checkStamp(sav, antrag, stamp)} />
  </div>;
}

function AntragCard({ n, antrag, stamp, sav, onChange, onConcept }: { n: number; antrag: Antrag; stamp: Stamp; sav: SavFile; onChange: (s: Stamp) => void; onConcept: (id: string) => void }) {
  const addSearch = (word: string) => { if (!stamp.searches.includes(word)) onChange({ ...stamp, searches: [...stamp.searches, word] }); };
  return <article className="task-card s01-antrag" aria-labelledby={`s01-antrag-${antrag.id}`}>
    <h4 id={`s01-antrag-${antrag.id}`}>Idee {n}: „{antrag.text}“</h4>
    <SearchTester sav={sav} onSearched={addSearch} />
    <StampEditor sav={sav} antrag={antrag} stamp={stamp} onChange={onChange} />
    <HintLadder hint={antrag.hint} onConcept={onConcept} />
  </article>;
}

function ErrorDecoder() {
  const [message, setMessage] = useState('');
  const decoded = message.trim() ? decodeError(message) : null;
  return <details className="s01-decoder">
    <summary>R zeigt eine Fehlermeldung? Hier einfügen</summary>
    <textarea value={message} aria-label="Fehlermeldung aus R" placeholder="z. B. Fehler … konnte Funktion nicht finden" onChange={e => setMessage(e.target.value)} />
    {message.trim() && (decoded
      ? <p className="sandbox-note" role="status"><strong>{decoded.cause}</strong> {decoded.fix}</p>
      : <p className="sandbox-note" role="status">Diese Meldung kenne ich nicht. Vergleich deinen Code Zeichen für Zeichen mit der Vorlage oder frag deine Nachbarin.</p>)}
  </details>;
}

function EmergencyConsole({ sav }: { sav: SavFile }) {
  const [word, setWord] = useState('');
  const result = word.trim() ? findVar(sav, word) : null;
  return <details className="s01-emergency">
    <summary>Notfallkonsole – nur wenn R gerade nicht läuft</summary>
    <p className="sandbox-note">Ein nachgebautes find_var() im Browser. Es zeigt Namen und Labels, aber kein Codebuch. Der Handschlag bleibt offen, bis R läuft.</p>
    <input type="search" value={word} aria-label="Notfallsuche" onChange={e => setWord(e.target.value)} />
    {result && (result.ok
      ? <ul className="sandbox-found">{result.hits.slice(0, 30).map(v => <li key={v.name}><code>{v.name}</code> <small>{v.label}</small></li>)}</ul>
      : <p className="sandbox-error">{result.message}</p>)}
  </details>;
}

export function SchonGefragt({ data, state, onChange, onConcept }: TaskProps<S01State>) {
  const set = (patch: Partial<S01State>) => onChange({ ...state, ...patch });
  const setStamp = (id: AntragId, stamp: Stamp) => set({ stamps: { ...state.stamps, [id]: stamp } });
  return <div className="task s01">
    <RoleBrief role="Referent:in im Abgeordnetenbüro" title="Schon gefragt?">
      <p><strong>Willkommen im Büro.</strong> Du arbeitest ab heute für eine Bundestagsabgeordnete (Büro und Personen sind erfunden). Sie will im Frühjahr eine eigene Umfrage beauftragen – jede Frage kostet Geld. Was schon einmal gut gefragt wurde, muss niemand neu bezahlen: Der ALLBUS 2023 ist für die Wissenschaft frei verfügbar, und er liegt gerade auf deinem Rechner.</p>
      <p>Vier Ideen liegen auf deinem Tisch. Für jede entscheidest du: <strong>übernehmen</strong> (du nennst die Variable und belegst sie aus dem Codebuch) oder <strong>beauftragen</strong> (du zeigst, wie du gesucht hast). Beides kann schiefgehen. Übernimmst du eine Frage, die etwas anderes misst, argumentiert das Büro mit falschen Zahlen. Beauftragst du eine Frage, die es längst gibt, zahlt es doppelt. Eine Kollegin schaut sich deine Stempel „beauftragen“ an.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du prüfst alle vier Ideen selbst. Die Kollegin im Browser liest deine Stempel „beauftragen“ gegen."
      pair="Vier-Augen-Prinzip: A prüft die Ideen 1 und 3, B die Ideen 2 und 4. Danach prüft jede:r die Stempel „beauftragen“ der anderen Person mit zwei neuen Suchwörtern." />

    <section className="task-step">
      <h3>1 · Handschlag mit R</h3>
      <p>Leg in RStudio ein neues Skript an und lies deine Datei ein. Oben rechts im Environment steht, wie viele Fälle (obs.) und Variablen der Datensatz hat. Trag beide Zahlen ein.</p>
      <RBlock code={SETUP_SCRIPT} file="schon-gefragt.R" />
      <div className="task-grid">
        <label>Fälle (obs.)<input type="text" inputMode="numeric" value={state.cases} onChange={e => set({ cases: e.target.value })} /></label>
        <label>Variablen<input type="text" inputMode="numeric" value={state.vars} onChange={e => set({ vars: e.target.value })} /></label>
      </div>
      <Feedback notes={checkHandshake(data.sav, state.cases, state.vars)} />
      <ErrorDecoder />
      <HintLadder hint={handshakeHint} onConcept={onConcept} />
    </section>

    <section className="task-step">
      <h3>2 · Die vier Ideen</h3>
      <p className="sandbox-note">Such in R mit find_var(), lies mit codebook() nach. Hier kannst du zählen, wie viele Treffer ein Suchwort hat – was sie bedeuten, zeigt dir R.</p>
      {antraege.map((a, i) => <AntragCard key={a.id} n={i + 1} antrag={a} stamp={state.stamps[a.id]} sav={data.sav} onChange={s => setStamp(a.id, s)} onConcept={onConcept} />)}
    </section>

    <section className="task-step">
      <h3>3 · Deine eigene Idee</h3>
      <label className="sandbox-label" htmlFor="s01-idea">Welche Frage würdest du 3.000 Menschen stellen?</label>
      <input id="s01-idea" type="text" value={state.idea} onChange={e => set({ idea: e.target.value })} />
      {state.idea.trim() && <StampEditor sav={data.sav} antrag={null} stamp={state.ideaStamp} onChange={ideaStamp => set({ ideaStamp })} />}
    </section>

    <EmergencyConsole sav={data.sav} />

    <section className="task-step">
      <h3>4 · Prüfbericht</h3>
      <label className="sandbox-label" htmlFor="s01-lesson">Welche Suche hat dich am meisten in die Irre geführt?</label>
      <textarea id="s01-lesson" value={state.lesson} onChange={e => set({ lesson: e.target.value })} />
      <PlenumCard title="Stempelbilanz" lines={plenumLines(state)} file="schon-gefragt-plenum.md" />
      <div className="sandbox-chips">
        <button onClick={() => downloadText('pruefbericht-schon-gefragt.md', reportMarkdown(state), 'text/markdown;charset=utf-8')}><Download size={14} aria-hidden="true" /> Prüfbericht</button>
        <button onClick={() => downloadText('schon-gefragt-suche.R', rScript(state))}><Download size={14} aria-hidden="true" /> R-Skript deiner Suche</button>
      </div>
    </section>
  </div>;
}
