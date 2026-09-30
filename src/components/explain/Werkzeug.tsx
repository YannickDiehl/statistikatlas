import { useMemo, useState } from 'react';
import { MEAN_BEFORE, type RecodeTemplate } from '../../explain/content/rekodieren';
import { parseRules, recode, RuleError, type Program } from '../../explain/rules';
import { count, fixed, num } from '../../explain/format';
import { Genau, KurzGesagt, Section, useExplainMode } from './basics';
import { CheckQuestion, ConceptLink, ThinkQuestions } from './pieces';

const ROW = 34;

/** Stufe 3: Werkzeug (Spezifikation 5.3), hier für mariposa::rec(). */
export function Werkzeug({ template: t, onConcept }: { template: RecodeTemplate; onConcept: (id: string) => void }) {
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const [rule, setRule] = useState(t.presets[0].rule);
  const [draft, setDraft] = useState(rule);
  const [error, setError] = useState('');
  const [who, setWho] = useState(3);
  const program = useMemo<Program>(() => parseRules(rule, t.scale), [rule, t.scale]);
  const map = useMemo(() => recode(program, t.codes, v => num(v)), [program, t.codes]);
  const walk = t.walk(program, t.codes[who]);
  const maxF = Math.max(...t.codes.map(c => c.f), ...map.rows.map(r => r.f));

  function use(next: string) {
    try { parseRules(next, t.scale); setRule(next.trim()); setDraft(next.trim()); setError(''); }
    catch (e) { if (e instanceof RuleError) setError(e.message); else throw e; }
  }

  const height = Math.max(t.codes.length, map.rows.length) * ROW;
  const rowView = (code: string, label: string, f: number, bad?: boolean, hl?: boolean) => (
    <div className={`xw-row${bad ? ' bad' : ''}${hl ? ' sel' : ''}`}>
      <span className="xw-code">{code}</span><span className="xw-row-label">{label}</span>
      <span className="xw-bar" style={{ ['--w' as string]: f / maxF }} /><span className="xw-count">{count(f)}</span>
    </div>
  );
  const mine = map.targets[who];

  return (
    <div className={`xw${compact ? ' xw-compact' : ''}`}>
      {!compact && <div className="xw-wofuer"><h2>Wofür?</h2><p>{t.wofuer}</p></div>}
      <KurzGesagt text={t.kurz} fach={t.fachlich} />
      {!compact && <Section title="Die Fachbegriffe">
        <div className="xw-legend static">{t.terms.map(x => (
          <div key={x.term} className="xw-legend-item"><strong>{x.term}</strong><span>{x.plain}</span>{x.concept && <ConceptLink id={x.concept} onConcept={onConcept} />}</div>
        ))}</div>
      </Section>}
      <Section title="Die Zeichen der Regel">
        <div className="xw-legend static">{t.signs.map(x => (
          <div key={x.sym} className="xw-legend-item"><span className="xw-legend-head"><code>{x.sym}</code><small>{x.say}</small></span><span>{x.plain}</span></div>
        ))}</div>
      </Section>
      <div className="xw-presets" role="group" aria-label="Voreinstellungen">{t.presets.map(p => <button type="button" key={p.label} aria-pressed={rule === p.rule} onClick={() => use(p.rule)}>{p.label}</button>)}</div>
      <form className="xw-rule" onSubmit={e => { e.preventDefault(); use(draft); }}>
        <label htmlFor="xw-rule-input">rules =</label>
        <input id="xw-rule-input" value={draft} spellCheck={false} aria-invalid={!!error} aria-describedby="xw-rule-error" onChange={e => { setDraft(e.target.value); setError(''); }} />
        <button type="submit">Anwenden</button>
      </form>
      <p className="xw-error" id="xw-rule-error" role="alert">{error}</p>
      {!compact && <Section title="So liest rec() deine Regel">
        {t.describe(program).map((d, i) => <div key={i} className="xw-rule-line"><small>{d.label}</small><div><code>{d.src}</code><p>{d.text}</p></div></div>)}
        {program.kind === 'rules' && <p className="xw-note">{t.firstWins}</p>}
        <h3>Vorgerechnet für eine Person, die diesen Code angegeben hat</h3>
        <div className="xw-people" role="group" aria-label="Code wählen">
          {t.codes.map((c, i) => <button type="button" key={String(c.k)} aria-pressed={i === who} onClick={() => setWho(i)}>{c.k === 'M' ? 'fehlend' : c.k}</button>)}
        </div>
        <ol className="xw-walk" aria-live="polite">{walk.lines.map((l, i) => <li key={i}><small>Schritt {i + 1}</small><span>{l}</span></li>)}</ol>
        <KurzGesagt text={walk.kurz} />
      </Section>}
      <Section title="Vorher und nachher" note="Alle Befragten des ALLBUS 2023, ungewichtet. Die Linien zeigen, wohin jeder Code wandert; ihre Dicke entspricht der Zahl der Befragten.">
        <div className="xw-map">
          <p className="xw-note">vorher: {t.oldName}</p><span /><p className="xw-note">nachher: {t.newName}</p>
          <div>{t.codes.map((c, i) => <div key={String(c.k)}>{rowView(c.k === 'M' ? 'NA' : String(c.k), c.label, c.f, false, i === who)}</div>)}</div>
          <svg className="xw-links" height={height} viewBox={`0 0 80 ${height}`} preserveAspectRatio="none" aria-hidden="true">
            {t.codes.map((c, i) => {
              const j = map.rows.findIndex(r => r.key === map.targets[i]), y1 = i * ROW + ROW / 2, y2 = j * ROW + ROW / 2;
              const cls = map.targets[i] === 'unm' ? 'bad' : c.k === 'M' && map.captured ? 'warn' : i === who ? 'sel' : '';
              return <path key={i} className={cls} d={`M0 ${y1} C40 ${y1} 40 ${y2} 80 ${y2}`} strokeWidth={1 + 4 * c.f / maxF} />;
            })}
          </svg>
          <div>{map.rows.map(r => <div key={r.key}>{rowView(r.code, r.label, r.f, r.bad, r.key === mine)}</div>)}</div>
        </div>
      </Section>
      {map.unmatched.length > 0 && (() => { const w = t.warnUnmatched(map.unmatched); return <div className="xw-alert bad"><p>{w.text}</p><p><code>{w.r}</code></p><p><strong>Kurz gesagt:</strong> {w.kurz}</p></div>; })()}
      {program.kind === 'rev' && map.outside.length > 0 && (() => { const w = t.warnOutside(program, map.outside); return <div className="xw-alert bad"><p>{w.text}</p><p><code>{w.r}</code></p><p><strong>Kurz gesagt:</strong> {w.kurz}</p></div>; })()}
      {map.captured && (() => { const w = t.warnCaptured(map.captured.to.v, map.captured.to.label); return <div className="xw-alert warn"><p>{w.text}</p><p><strong>Kurz gesagt:</strong> {w.kurz}</p></div>; })()}
      <div className="xw-metrics wide"><div><span>Mittelwert vorher</span><strong>{fixed(MEAN_BEFORE)}</strong></div><div><span>nachher (n = {count(map.nValid)})</span><strong>{Number.isFinite(map.mean) ? fixed(map.mean) : 'nicht berechenbar'}</strong></div></div>
      <p className="xw-note">{t.meanNote(program, map.mean, map.binary)}</p>
      <pre className="xw-code-block"><code>{t.rCode(rule)}</code></pre>
      {!compact && <><h3 className="xw-warn-head">Typische Fehler</h3><p>{t.fehler}</p></>}
      {!compact && (() => {
        const c = t.check.codeFor(who);
        return <CheckQuestion key={`${rule}-${who}`} title="Kurz prüfen" question={t.check.question(c)} invalid="Tippe eine Zahl oder NA."
          evaluate={v => {
            const answer = t.check.answer(program, c);
            const ok = answer === 'NA' ? v === 'NA' : v !== 'NA' && v.some(x => Math.abs(x - answer) < 1e-9);
            return ok ? { ok, message: t.walk(program, c).kurz } : { ok, message: t.check.diagnose(program, c, v === 'NA' ? 'NA' : v[0]) };
          }} />;
      })()}
      {!compact && <ThinkQuestions title="Mitdenken" note="Erst tippen, dann nachsehen." hint="Oben siehst du es an den Linien und im Durchlauf."
        items={t.think.map(q => ({ question: q.question, options: q.options, correct: q.correct, kurz: q.kurz, explain: () => q.explain,
          note: `Oben siehst du es an den Linien und im Durchlauf. Die Regel steht dafür jetzt auf „${q.rule}“.`,
          onAnswer: () => { use(q.rule); if (q.who !== null) setWho(q.who); } }))} />}
      {!compact && <Genau kurz={t.genau.kurz} paragraphs={t.genau.paragraphs} />}
    </div>
  );
}
