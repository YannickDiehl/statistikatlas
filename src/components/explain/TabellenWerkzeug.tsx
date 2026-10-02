import { useMemo, useState } from 'react';
import type { TableTool } from '../../explain/types';
import { cell, close } from '../../explain/format';
import { Genau, MutBox, Section, TopKurz, useExplainMode, useStepJump } from './basics';
import { CheckQuestion, NameBox, ThinkQuestions } from './pieces';
import { pictureFor } from './pictures/register';

type Columns = TableTool['columns'];
type Rows = TableTool['rows'];

/**
 * Kleine Datentabelle; neue Spalten (`fresh`) sind hervorgehoben. Fehlende Werte stehen als „NA“ da, Zahlen deutsch
 * mit Komma und echtem Minus („8,3“, „−9“), Texte so, wie sie im Werkzeug stehen.
 */
function DataTable({ columns, rows, fresh = new Set<string>(), caption }: { columns: Columns; rows: Rows; fresh?: Set<string>; caption: string }) {
  return (
    <div className="xw-table-wrap">
      <table className="xw-table xw-data">
        <caption className="sr-only">{caption}</caption>
        <thead><tr>{columns.map(c => <th scope="col" key={c.key} className={fresh.has(c.key) ? 'on' : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{columns.map((c, k) => {
          const v = r[c.key], text = v === null || v === undefined ? 'NA' : typeof v === 'number' ? cell(v) : v;
          return k === 0 ? <th scope="row" key={c.key}>{text}</th> : <td key={c.key} className={fresh.has(c.key) ? 'on' : undefined}>{text}</td>;
        })}</tr>)}</tbody>
      </table>
    </div>
  );
}

const GENERAL = 'Noch nicht ganz. Schau dir die Tabelle „Nachher“ noch einmal an.';

/**
 * Tabellen-Werkzeug (Vorlage 3, allgemein): fünf Personen vorher, die Operation in Schritten, nachher, der
 * mariposa-Aufruf. Die Wahl oben verändert die Operation und damit Tabelle und R-Code.
 * Kompakt zeigt Kurz gesagt, die Wahl, die Schritte mit „Was passiert?“ und „Das nennt man“, beide Tabellen und den R-Code.
 */
export function TabellenWerkzeug({ tool: t, onConcept }: { tool: TableTool; onConcept: (id: string) => void }) {
  const [mode] = useExplainMode(), compact = mode === 'kompakt';
  const jump = useStepJump();
  const [option, setOption] = useState(t.options[0].id);
  const after = useMemo(() => t.apply(t.rows, option), [t, option]);
  const fresh = useMemo(() => new Set(after.columns.map(c => c.key).filter(k => !t.columns.some(c => c.key === k))), [after, t.columns]);
  const chosen = t.options.find(o => o.id === option)?.label ?? option;
  const draw = pictureFor(t.picture, 'tabelle');
  const summary = `Deine Wahl: ${chosen}. ${fresh.size ? `Neue Spalten: ${after.columns.filter(c => fresh.has(c.key)).map(c => c.label).join(', ')}.` : 'Keine neuen Spalten.'}`;
  return (
    <div className={`xw xw-tabelle${compact ? ' xw-compact' : ''}`}>
      {!compact && <div className="xw-wofuer"><h2>Wofür?</h2><p>{t.wofuer}</p></div>}
      <TopKurz text={t.kurz} />
      {!compact && t.mut && <MutBox text={t.mut} />}
      <div className="xw-presets" role="group" aria-label="Deine Wahl">
        <span className="xw-note">Deine Wahl:</span>
        {t.options.map(o => <button type="button" key={o.id} aria-pressed={o.id === option} onClick={() => setOption(o.id)}>{o.label}</button>)}
      </div>
      <Section title="Vorher"><DataTable columns={t.columns} rows={t.rows} caption="Die Daten vorher" /></Section>
      <Section title="Schritt für Schritt">
        {t.steps.map((st, i) => (
          <div className={`xw-card${jump.marked === i + 1 ? ' xw-marked' : ''}`} key={i} aria-current={jump.marked === i + 1 ? 'step' : undefined}>
            <span className="xw-label">Schritt {i + 1} von {t.steps.length}</span>
            <h3 className="xw-step-title" ref={jump.titleRef(i)} tabIndex={-1}>{st.title}</h3>
            <h4>Was passiert?</h4><p>{st.was}</p>
            <NameBox concept={st.concept} sym={st.sym} say={st.say} fach={st.fach}
              links={st.concept && st.concept !== t.concept ? [{ id: st.concept, label: 'Begriff öffnen' }] : []} onConcept={onConcept} />
            {!compact && <>
              <h4>Warum?</h4><p>{st.warum}</p>
              <h4 className="xw-warn-head">Aufgepasst</h4><p>{st.acht}</p>
            </>}
          </div>
        ))}
      </Section>
      <Section title="Nachher">
        <p className="xw-note" aria-live="polite">{summary} Neue Spalten sind hervorgehoben.</p>
        <DataTable columns={after.columns} rows={after.rows} fresh={fresh} caption={`Die Daten nachher, Wahl: ${chosen}`} />
      </Section>
      {draw && <Section title="Das Bild dazu">{draw({ tool: t, option, before: { columns: t.columns, rows: t.rows }, after })}</Section>}
      <Section title="So sieht es in R aus"><pre className="xw-code-block"><code>{t.rCode(option)}</code></pre></Section>
      {!compact && <CheckQuestion key={option} question={t.check.question}
        evaluate={value => {
          const answer = t.check.answer(option);
          const ok = answer === 'NA' ? value === 'NA' : value !== 'NA' && value.some(x => close(x, answer));
          if (ok) return { ok, message: t.check.right };
          const hint = value === 'NA' ? t.check.diagnose(option, 'NA') : value.map(x => t.check.diagnose(option, x)).find(Boolean);
          return { ok, message: hint ?? GENERAL };
        }} />}
      {!compact && <ThinkQuestions title="Mitdenken" note="Erst vermuten, dann nachsehen." hint=""
        items={t.think.map(q => ({ question: q.question, options: q.options, correct: q.correct, kurz: q.kurz, explain: () => q.explain,
          note: q.step ? `Mehr dazu in Schritt ${q.step}: ${t.steps[q.step - 1]?.title ?? ''}.` : undefined }))} />}
      {!compact && <Genau kurz={t.genau.kurz} paragraphs={t.genau.paragraphs} />}
    </div>
  );
}
