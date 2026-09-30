import { Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { de } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { ParadeTable, ProbeChart, SpreadChart } from './Charts';
import { DECISIONS, GUESSES, hints, INPUTS, inputById, MIN_CASES, ROLE, WORKSHOP, type InputId } from './content';
import {
  checkDisplay, checkLevene, checkSetting, checkSpread, codeNumber, displayOk, drawVisitors, knobScore, leveneVariants, levelName, machineFor, parade,
  own, paradeNotes, pickInput, plenumLines, prepare, probeRows, probeTotals, recognisedSetting, resolution, rSetup, rSolution, scaffoldSetting, scaffoldSpread,
  signQuestions, spread, spreadRecognised, statusS08, variants, type Machine, type S08State,
} from './domain';

const pct = (x: number) => `${de(100 * x, 1)} %`;

export function Automat({ data, state, onChange, onConcept }: TaskProps<S08State>) {
  const set = (patch: Partial<S08State>) => onChange({ ...state, ...patch });
  const p = useMemo(() => prepare(data.sav), [data.sav]);
  const item = state.input ? inputById[state.input] : null;
  const vars = useMemo(() => (item ? variants(p, item) : []), [p, item]);
  const main = vars.find(v => v.kind === 'main') ?? null;
  const setting = { a: state.a, b: state.b, r2: state.r2 };
  const rec = item ? recognisedSetting(vars, setting) : null;
  const machine = useMemo(() => (item && rec ? machineFor(p, item, rec, { a: state.a, b: state.b, r2: state.r2 }) : null), [p, item, rec, state.a, state.b, state.r2]);
  const res = useMemo(() => (machine ? resolution(machine) : null), [machine]);
  const sp = useMemo(() => (machine ? spread(machine) : null), [machine]);
  const spreadOk = sp ? spreadRecognised(sp, state.sdMin, state.sdMax) : false;
  const lv = useMemo(() => (machine ? leveneVariants(machine) : null), [machine]);
  const code = codeNumber(state.code);
  const visitors = useMemo(() => (machine && code !== null ? probeRows(machine, drawVisitors(machine, code)) : []), [machine, code]);
  const totals = probeTotals(visitors);
  const shown = Boolean(res && state.guess);
  const paradeRows = useMemo(() => (rec && state.decision ? parade(p, rec.weighted) : null), [p, rec, state.decision]);
  const pair = state.mode === 'pair';
  const tag = (who: string) => (pair ? ` · ${who}` : '');
  const newCode = () => set({ code: String(100 + Math.floor(Math.random() * 900)) });

  return <div className="task s08">
    <RoleBrief role="Technik im Besucherzentrum" title="Der Demokratie-Automat">
      <p><strong>Dein neuer Job: Technik im {ROLE.place}.</strong> Im Foyer soll ab März ein Automat stehen. Besucher:innen tippen eine einzige Antwort über sich ein, und der Automat zeigt an: „Menschen wie du sind im Schnitt so zufrieden mit der Demokratie in Deutschland: …“ Die Zahlen kommen aus dem ALLBUS 2023.</p>
      <p>Die Kuratorin {ROLE.curator} schreibt dir: „Du baust den Automaten. Welche Frage er stellt, entscheidest du. Bis Freitag brauche ich drei Dinge: die Formel, mit der er rechnet, eine Probe, wie weit er danebenliegt, und das Schild, das neben ihm hängt. Das Schild muss ehrlich sein, es lesen auch Schulklassen. Und der Automat soll für alle funktionieren, nicht nur für manche.“</p>
      <p>Du rechnest in RStudio mit mariposa; hier stellst du den Automaten ein, lässt ihn gegen echte Befragte und gegen den „Faulpelz“ antreten – einen Automaten, der allen einfach den Durchschnitt zeigt – und entscheidest am Ende: freigeben, nur mit Schild freigeben oder eine andere Frage vorschlagen.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du bist erst Technik (Automat in R einstellen), dann Kuratorin (zwei Anzeigen nachrechnen, Besucherprobe, Schild). Am Ende zeigt dir die Automaten-Parade alle zehn Eingabefragen aus deiner Datei."
      pair="A ist Technik und stellt den Automaten in R ein. B ist Kuratorin: gibt erst frei, wenn sie zwei Anzeigen selbst nachgerechnet hat, führt die Besucherprobe durch und schreibt das Schild. Beim zweiten R-Schritt tauscht ihr; die Entscheidung unterschreibt ihr beide." />

    <section className="task-step">
      <h3>1 · Welche Frage stellt der Automat?</h3>
      <p>Wähle eine der zehn vorbereiteten Eingabefragen (im Seminar werden sie nach Sitzreihen verteilt).</p>
      <div className="task-grid">
        <label>Eingabefrage<select value={state.input ?? ''} onChange={e => onChange(pickInput(state, (e.target.value || null) as InputId | null))}>
          <option value="">bitte wählen</option>{INPUTS.map((it, i) => <option key={it.id} value={it.id}>{i + 1} · {it.title}</option>)}
        </select></label>
      </div>
      {item && <article className="task-card s08-card">
        <h4>{item.title} <code>{item.id}</code></h4>
        <p className="s08-ask">„{item.ask}“</p>
        <p className="sandbox-note">{item.scale}</p>
        {main && main.fit.n < MIN_CASES && <p className="sandbox-note" role="note">Nur {main.fit.n} Befragte haben diese Frage und ps03 beantwortet – der Automat steht auf wackligen Beinen.</p>}
        <label className="sandbox-label" htmlFor="s08-reason">Warum diese Frage? (ein Satz)</label>
        <input id="s08-reason" type="text" maxLength={400} value={state.reason} onChange={e => set({ reason: e.target.value })} />
      </article>}
    </section>

    {item && <>
      <section className="task-step">
        <h3>2 · Automat einstellen (R){tag('Technik')}</h3>
        <p>Pol ps03 um, damit hohe Werte „zufrieden“ heißen, und stell den Automaten mit <code>linear_regression()</code> ein – gewichtet, denn er soll für ganz Deutschland sprechen. Trag Konstante, Steigung und R² ein.</p>
        <RBlock code={rSetup(item)} file="automat-start.R" />
        <div className="task-grid">
          <label>Konstante<input type="text" inputMode="decimal" maxLength={12} value={state.a} onChange={e => set({ a: e.target.value })} /></label>
          <label>Steigung<input type="text" inputMode="decimal" maxLength={12} value={state.b} onChange={e => set({ b: e.target.value })} /></label>
          <label>R²<input type="text" inputMode="decimal" maxLength={12} value={state.r2} onChange={e => set({ r2: e.target.value })} /></label>
        </div>
        <Feedback notes={checkSetting(item, vars, setting)} />
        <HintLadder key={`setting-${item.id}`} hint={{ ...hints.setting, workshop: WORKSHOP, scaffold: scaffoldSetting(item), solution: rSolution(item) }} onConcept={onConcept} file="automat.R" />
      </section>

      {machine && <Testing machine={machine} state={state} set={set} visitors={visitors} totals={totals} code={code} newCode={newCode} tag={tag} />}

      {machine && res && <section className="task-step">
        <h3>Auflösung: Automat gegen Faulpelz</h3>
        <p>Über alle Befragten: Wer trifft öfter auf ±1 genau – dein Automat oder der Faulpelz?</p>
        <div className="sandbox-chips" role="group" aria-label="Tipp: Wer trifft öfter?">
          {GUESSES.map(g => <button key={g} aria-pressed={state.guess === g} onClick={() => set({ guess: g })}>{g}</button>)}
        </div>
        {shown && <div className="s08-reveal" aria-live="polite">
          <p><strong>Fehlerquadrate:</strong> Automat {de(res.sse, 0)}, Faulpelz {de(res.sst, 0)} – also {pct(res.reduction)} weniger. Das ist dein R² ({own(state.r2)}).</p>
          <p><strong>Treffer auf ±1:</strong> Automat {pct(res.hit)}, Faulpelz {pct(res.lazyHit)}.{res.hit < res.lazyHit - 1e-12 ? ' Der Automat trifft seltener als der Faulpelz!' : Math.abs(res.hit - res.lazyHit) <= 1e-12 ? ' Beide treffen genau gleich oft.' : ''}</p>
          <p className="sandbox-note">Warum ist der Faulpelz so gut? Er zeigt allen {de(res.mean, 2)}. Damit liegt er bei allen, die {res.near.map(n => `${n.value} (${pct(n.share)})`).join(' oder ')} geantwortet haben, höchstens 1 daneben – das sind die häufigsten Antworten. Weniger Fehlerquadrate heißt nicht mehr Treffer.</p>
        </div>}
        {shown && <Knobs key={`${item.id}-${machine.weighted}`} machine={machine} />}
      </section>}

      {machine && sp && <section className="task-step">
        <h3>4 · Gleich gut für alle? (R){pair ? ' · Rollentausch: Kuratorin rechnet, Technik prüft' : ''}</h3>
        <p>Bilde in R die Anzeige und das Residuum (Antwort minus Anzeige) und lass dir die Streuung der Residuen je {item.groups ? 'Altersgruppe' : 'Eingabewert'} zeigen. Trag die kleinste und die größte SD ein.</p>
        <div className="task-grid">
          <label>Kleinste SD<input type="text" inputMode="decimal" maxLength={12} value={state.sdMin} onChange={e => set({ sdMin: e.target.value })} /></label>
          <label>Größte SD<input type="text" inputMode="decimal" maxLength={12} value={state.sdMax} onChange={e => set({ sdMax: e.target.value })} /></label>
        </div>
        <Feedback notes={checkSpread(machine, sp, state.sdMin, state.sdMax)} />
        <HintLadder key={`spread-${item.id}`} hint={{ ...hints.spread, workshop: WORKSHOP, scaffold: scaffoldSpread(item), solution: rSolution(item) }} onConcept={onConcept} file="automat.R" />
        {spreadOk
          ? <SpreadChart spread={sp} item={item} />
          : <p className="sandbox-note">Nach deinem Eintrag zeige ich dir die Streuung aller Stufen als Balken, dazu die Residuenmittel als Blick auf die Linearität.</p>}
        <details className="s08-extra">
          <summary>Profi-Zusatz: Levene-Test der Voraussetzung</summary>
          <p>mariposa hat keinen Test speziell für Regressionen; der Levene-Test auf die Residuen je Stufe prüft, ob die Streuung überall gleich ist.</p>
          <div className="task-grid"><label>F aus levene_test()<input type="text" inputMode="decimal" maxLength={12} value={state.levene} onChange={e => set({ levene: e.target.value })} /></label></div>
          {lv && <Feedback notes={checkLevene(machine, lv, state.levene)} />}
        </details>
      </section>}

      <section className="task-step">
        <h3>5 · Schild und Entscheidung{tag('Kuratorin schreibt, beide unterschreiben')}</h3>
        <label className="sandbox-label" htmlFor="s08-sign">Das Schild neben dem Automaten (zwei, drei Sätze, auch für Schulklassen)</label>
        <textarea id="s08-sign" maxLength={400} value={state.sign} placeholder="Dieser Automat zeigt … Er liegt typischerweise … daneben, am weitesten bei …"
          onChange={e => set({ sign: e.target.value })} />
        <Feedback notes={signQuestions(state.sign, item, spreadOk ? sp : null)} />
        <div className="sandbox-chips" role="group" aria-label="Entscheidung">
          {DECISIONS.map(d => <button key={d} aria-pressed={state.decision === d} onClick={() => set({ decision: d })}>{d}</button>)}
        </div>
        {pair && <div className="s08-signatures">
          <label className="s04-check"><input type="checkbox" checked={state.signedTech} onChange={e => set({ signedTech: e.target.checked })} /> Technik unterschreibt</label>
          <label className="s04-check"><input type="checkbox" checked={state.signedCurator} onChange={e => set({ signedCurator: e.target.checked })} /> Kuratorin unterschreibt</label>
        </div>}
      </section>

      {paradeRows && <section className="task-step">
        <h3>6 · Automaten-Parade</h3>
        <details className="s08-extra">
          <summary>Parade aufdecken (im Seminar erst nach dem Plenum)</summary>
          <p>So schneiden alle zehn Eingabefragen aus deiner Datei ab ({rec?.weighted ? 'gewichtet' : 'ohne Gewicht'}); ↓ heißt: trifft seltener als der Faulpelz.</p>
          <ParadeTable rows={paradeRows} own={item.id} />
          <ul className="s08-notes">{paradeNotes(paradeRows).map(n => <li key={n}>{n}</li>)}</ul>
        </details>
      </section>}
    </>}

    <PlenumCard title="Der Demokratie-Automat" lines={plenumLines(state, rec, shown ? res : null)} file="automat-plenum.md" />
    {item && statusS08(state) === 'done' && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={rSolution(item)} file="automat.R" /></details>}
  </div>;
}

/** Schritt 3: Anzeige von Hand, Automat im Probebetrieb, Besucherprobe. */
function Testing({ machine, state, set, visitors, totals, code, newCode, tag }: {
  machine: Machine; state: S08State; set: (patch: Partial<S08State>) => void; visitors: ReturnType<typeof probeRows>; totals: ReturnType<typeof probeTotals>;
  code: number | null; newCode: () => void; tag: (who: string) => string;
}) {
  const item = machine.item, [x1, x2] = item.probe;
  const both = displayOk(machine, x1, state.shows[0]) && displayOk(machine, x2, state.shows[1]);
  const setShow = (i: 0 | 1, v: string) => set({ shows: (i === 0 ? [v, state.shows[1]] : [state.shows[0], v]) as [string, string] });
  return <section className="task-step">
    <h3>3 · Testen{tag('Kuratorin')}</h3>
    <p>Rechne zwei Anzeigen von Hand nach: Konstante + Steigung × Eingabe.</p>
    <div className="task-grid">
      <label>Anzeige bei {item.groups ? `Alter ${x1}` : `Eingabe ${x1}`}<input type="text" inputMode="decimal" maxLength={12} value={state.shows[0]} onChange={e => setShow(0, e.target.value)} /></label>
      <label>Anzeige bei {item.groups ? `Alter ${x2}` : `Eingabe ${x2}`}<input type="text" inputMode="decimal" maxLength={12} value={state.shows[1]} onChange={e => setShow(1, e.target.value)} /></label>
    </div>
    <Feedback notes={[...checkDisplay(machine, x1, state.shows[0]), ...checkDisplay(machine, x2, state.shows[1])]} />
    {both && <>
      <p className="sandbox-note">Und bei Eingabe 0 zeigt er die Konstante, {de(machine.a, 3)}. {item.zero}</p>
      <Display key={item.id} machine={machine} />
    </>}
    <h4 className="s08-sub">Besucherprobe</h4>
    <p>Eine Besuchergruppe zieht 20 Befragte aus deiner Datei. Du siehst nur Eingabe und Antwort – und wie weit Automat und Faulpelz danebenliegen. Mit demselben Gruppencode ziehen alle Rechner im Raum dieselben Personen.</p>
    <div className="sandbox-chips">
      <label className="s08-code">Gruppencode <input type="text" inputMode="numeric" maxLength={4} value={state.code} onChange={e => set({ code: e.target.value.replace(/\D/g, '') })} /></label>
      <button onClick={newCode}><Shuffle size={14} aria-hidden="true" /> Neue Besuchergruppe</button>
    </div>
    {code === null && state.code.trim() !== '' && <p className="sandbox-note">Der Gruppencode hat drei oder vier Ziffern.</p>}
    {visitors.length > 0 && <>
      <ProbeChart rows={visitors} item={item} />
      <p><strong>Deine Gruppe:</strong> Fehlerquadrate Automat {de(totals.sse, 1)}, Faulpelz {de(totals.lazySse, 1)} · Treffer auf ±1: Automat {totals.hits}, Faulpelz {totals.lazyHits} von {visitors.length}.</p>
    </>}
  </section>;
}

/** Der Automat im Probebetrieb: eine Eingabe tippen, die Anzeige erscheint. */
function Display({ machine }: { machine: Machine }) {
  const item = machine.item;
  const [x, setX] = useState(item.probe[0]);
  const show = machine.a + machine.b * x;
  return <div className="s08-display">
    <label>{item.ask} <input type="number" value={x} onChange={e => setX(Number(e.target.value))} /></label>
    <output aria-live="polite">Menschen wie du sind im Schnitt so zufrieden mit der Demokratie: <strong>{de(show, 1)}</strong> von 6</output>
  </div>;
}

/** Knöpfe: Konstante und Steigung selbst drehen – kleiner als die Fehlerquadratsumme aus R wird es nie. */
function Knobs({ machine }: { machine: Machine }) {
  const a0 = machine.fit.coef[0], b0 = machine.fit.coef[1];
  const xs = machine.x, span = Math.max(1, Math.max(...xs) - Math.min(...xs));
  const bRange = 2 / span;
  const [a, setA] = useState(a0), [b, setB] = useState(b0);
  const best = knobScore(machine, a0, b0), now = knobScore(machine, a, b);
  return <details className="s08-extra">
    <summary>Knöpfe (optional): selbst einstellen</summary>
    <div className="s08-knobs">
      <label>Konstante {de(a, 2)}<input type="range" min={a0 - 2} max={a0 + 2} step={0.01} value={a} onChange={e => setA(Number(e.target.value))} /></label>
      <label>Steigung {de(b, 3)}<input type="range" min={b0 - bRange} max={b0 + bRange} step={bRange / 100} value={b} onChange={e => setB(Number(e.target.value))} /></label>
    </div>
    <p aria-live="polite">Fehlerquadrate {de(now.sse, 0)} (aus R: {de(best.sse, 0)}) · Treffer auf ±1: {pct(now.hit)} (aus R: {pct(best.hit)}).</p>
    <p className="sandbox-note">Keine Stellung unterbietet die Fehlerquadratsumme aus R – das sind die kleinsten Quadrate. Mehr Treffer lassen sich aber holen: Die Gerade optimiert etwas anderes als die Trefferquote.</p>
  </details>;
}
