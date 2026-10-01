// Reiter „In R“ (Spezifikation Lehrdatensatz und R, Abschnitt 5.5): Lehrdatensatz holen, den Leitaufruf Zeichen für
// Zeichen lesen (Codelegende), „So antwortet R“ mit antippbaren Zahlen, die zum Atlas führen, „Kurz prüfen“,
// „Anderer Aufruf“ mit den Katalogvarianten, Kopieren und R-Skript, Hilfe.
import { useEffect, useMemo, useState } from 'react';
import { Copy, Download } from 'lucide-react';
import type { ColumnSelection, SurveyRow } from '../../domain/survey';
import { entryById, type AtlasEntry } from '../../domain/mariposaCatalog';
import { analysisCode, downloadText, initialRSettings, rolesFor, SAV_NAME, scriptFor, scriptText, startBlock, surveyCsv, type RSettings } from '../../domain/mariposa';
import { writeSav } from '../../domain/savWriter';
import { RTOKENS, RTOKEN_CONCEPTS } from '../../domain/rTokens';
import type { Ref } from '../../domain/learning';
import { num } from '../../explain/format';
import { liveCode, liveFits, liveHelp, liveOutput, locate, noteFor, tokenize, type Spot } from '../../explain/rRead';
import type { LiveCall, RTab as RTabData, TokenNote } from '../../explain/types';
import { KurzGesagt, Section, tight, useExplainMode } from './basics';
import { ConceptLink, Feedback } from './pieces';
import { MariposaPanel, panelSettings, type RPanelProps } from '../MariposaPanel';

type Catalog = Record<string, { code: string; output: string }>;
export type RProps = Omit<RPanelProps, 'entry' | 'embedded'> & {
  tab: RTabData;
  /** Titel des Begriffs, für das R-Skript. */
  title: string;
  rows: SurveyRow[];
  modified: boolean;
  /** Sprung zu einem Formelschritt (im Reiter „Mit 200 Befragten“, sonst „Verstehen“); `stepTitle` nennt ihn. */
  onStepLink?: (step: number) => void;
  stepTitle?: (step: number) => string | undefined;
  onConcept: (id: string) => void;
};

/** In R erfasste Katalogausgaben, nachgeladen (rund 84 KB), damit sie nicht im ersten Paket stecken. */
let catalogCache: Catalog | null = null;
function useCatalog(): Catalog | 'error' | null {
  const [catalog, setCatalog] = useState<Catalog | 'error' | null>(catalogCache);
  useEffect(() => {
    if (catalogCache) return;
    let alive = true;
    import('../../explain/catalogOutput').then(m => { catalogCache = m.CATALOG_OUTPUT; if (alive) setCatalog(m.CATALOG_OUTPUT); }).catch(() => { if (alive) setCatalog('error'); });
    return () => { alive = false; };
  }, []);
  return catalog;
}

/** Spalten des Leitaufrufs: R-Einstellungen eines Verfahrens, sonst die Spaltenwahl (x bzw. die Variable des Begriffs). */
function liveColumns(live: LiveCall, p: RProps): { x: string; y: string } {
  const pair = live.fn === 'pearson_cor' || live.fn === 'cov', set = p.settings?.columns;
  const own = p.tab.entry ? entryById[p.tab.entry] : undefined;
  const fromSettings = own && !own.existing && p.reference?.id === own.id && set?.x?.[0] ? { x: set.x[0], y: set.y?.[0] ?? '' } : null;
  const fromSelection = p.selection ? { x: pair ? p.selection.x : p.selection[p.reference?.variable ?? 'x'], y: p.selection.y } : null;
  const fallback = { x: own?.roles.find(r => r.key === 'x')?.default[0] ?? 'lernzeit', y: own?.roles.find(r => r.key === 'y')?.default[0] ?? 'wissenstest' };
  for (const c of [fromSettings, fromSelection, fallback]) if (c && liveFits(live, c.x, c.y)) return c;
  return { x: 'lernzeit', y: 'wissenstest' };
}

const LIVE_LABEL: Record<LiveCall['fn'], string> = {
  describe: 'describe() aus mariposa.',
  pearson_cor: 'pearson_cor() aus mariposa.',
  cov: 'Kovarianz mit summarise() und cov(). mariposa hat dafür keine eigene Funktion.',
  frequency: 'frequency() aus mariposa.',
  rec_frequency: 'Umpolen mit rec() aus mariposa, danach frequency().',
};

/** Code mit antippbaren Zeichen; ein Tipp markiert alle Vorkommen desselben Zeichens. */
function CodeView({ code, notes, active, onPick }: { code: string; notes: Record<string, TokenNote>; active: string | null; onPick: (key: string) => void }) {
  const parts = useMemo(() => tokenize(code, notes), [code, notes]);
  return (
    <pre className="r-code xw-rcode"><code>{parts.map((part, i) => part.key
      ? <button type="button" key={i} className={`xw-tok${active === part.key ? ' on' : ''}`} aria-pressed={active === part.key} aria-label={`${part.text}: erklären`} onClick={() => onPick(part.key!)}>{part.text}</button>
      : <span key={i}>{part.text}</span>)}</code></pre>
  );
}

/** Lernkarte zu einem Zeichen: Zeichen, Fachbegriff mit Aussprache, Kurz gesagt, typischer Fehler. */
function TokenCard({ note, concept, onConcept }: { note: TokenNote; concept?: string; onConcept: (id: string) => void }) {
  return (
    <div className="xw-card xw-token">
      <p className="xw-name-term"><code>{note.sym}</code><strong>{note.term}</strong>{note.say && <small>sprich „{note.say}“</small>}</p>
      <KurzGesagt text={note.kurz} />
      <h4 className="xw-warn-head">Aufgepasst</h4>
      <p>{tight(note.fehler)}</p>
      {concept && <p><ConceptLink id={concept} onConcept={onConcept}>Begriff öffnen</ConceptLink></p>}
    </div>
  );
}

type Mapped = { spot: Spot; match: string; atlas: string; step?: number; explain: string };

/** Die Ausgabe mit antippbaren Zahlen nach `outputMap`. */
function OutputView({ output, mapped, active, onPick }: { output: string; mapped: Mapped[]; active: string | null; onPick: (match: string) => void }) {
  const pieces: (string | Mapped)[] = [];
  let at = 0;
  for (const m of [...mapped].sort((a, b) => a.spot.start - b.spot.start)) {
    if (m.spot.start < at) continue;
    pieces.push(output.slice(at, m.spot.start), m);
    at = m.spot.end;
  }
  pieces.push(output.slice(at));
  return (
    <pre className="r-code xw-routput"><code>{pieces.map((piece, i) => typeof piece === 'string' ? <span key={i}>{piece}</span>
      : <button type="button" key={i} className={`xw-num${active === piece.match ? ' on' : ''}`} aria-pressed={active === piece.match} aria-label={`${piece.match} ${piece.spot.text}: im Atlas zeigen`} onClick={() => onPick(piece.match)}>{piece.spot.text}</button>)}</code></pre>
  );
}

/** Deutsche Lesart einer R-Zahl („3.238“ → „3,24“), sonst null. */
const asNumber = (text: string) => /^-?\d+(\.\d+)?$/.test(text) ? num(Number(text)) : null;

function Mapping({ m, stepTitle, onStepLink }: { m: Mapped; stepTitle?: (step: number) => string | undefined; onStepLink?: (step: number) => void }) {
  const de = asNumber(m.spot.text), title = m.step ? stepTitle?.(m.step) : undefined;
  return (
    <div className="xw-card xw-map-card" aria-live="polite">
      <p><code>{m.match} {m.spot.text}</code> ↔ <strong>{m.atlas}{de !== null && de !== m.spot.text ? ` ≈ ${de}` : ''}</strong>{m.step ? `, Schritt ${m.step}${title ? `: ${title}` : ''}` : ''}</p>
      <p>{tight(m.explain)}</p>
      {m.step && onStepLink && <p><button type="button" className="xw-link" onClick={() => onStepLink(m.step!)}>Schritt {m.step} ansehen</button></p>}
    </div>
  );
}

/** „Kurz prüfen“: Welche Zahl der Ausgabe ist gefragt? Antworten sind die markierten Stellen in der Reihenfolge der Ausgabe. */
function QuickCheck({ check, mapped, output }: { check: RTabData['check']; mapped: Mapped[]; output: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const keys = [...new Set([check.correct, ...Object.keys(check.wrong), ...mapped.map(m => m.match)])];
  const options = keys.map(k => ({ k, spot: mapped.find(m => m.match === k)?.spot ?? locate(output, k) })).filter((o): o is { k: string; spot: Spot } => !!o.spot)
    .sort((a, b) => a.spot.start - b.spot.start).filter((o, i, all) => all.findIndex(x => x.spot.start === o.spot.start) === i);
  const right = mapped.find(m => m.match === check.correct);
  const message = pick === null ? null : pick === check.correct
    ? `Genau, ${check.correct} ${right?.spot.text ?? ''} ist ${right?.atlas ?? check.correct}.`
    : check.wrong[pick] ?? 'Noch nicht ganz. Lies die Beschriftung über oder vor der Zahl: Dort steht, was R berechnet hat.';
  return (
    <div className="xw-check">
      <h3>Kurz prüfen</h3>
      <p>{check.question}</p>
      <div className="xw-options" role="group" aria-label="Zahlen aus der Ausgabe">
        {options.map(o => <button type="button" key={o.k} className={pick === null ? '' : o.k === check.correct && pick === o.k ? 'right' : o.k === pick ? 'wrong' : ''} aria-pressed={pick === o.k} onClick={() => setPick(o.k)}><code>{o.spot.text}</code></button>)}
      </div>
      <div aria-live="polite">{message && <Feedback ok={pick === check.correct} message={message} />}</div>
    </div>
  );
}

export function RTab(p: RProps) {
  const { tab } = p, [mode] = useExplainMode(), compact = mode === 'kompakt';
  const catalog = useCatalog();
  const entry = tab.entry ? entryById[tab.entry] : undefined;
  const [token, setToken] = useState<string | null>(null), [spot, setSpot] = useState<string | null>(null), [feedback, setFeedback] = useState('');
  const notes = useMemo(() => ({ ...RTOKENS, ...tab.tokens }), [tab.tokens]);
  const ranked = p.reference?.basis === 'ranks';

  // Leitaufruf: live aus den aktuellen Daten oder die Katalogvariante mit der in R erfassten Ausgabe.
  const live = tab.live, cols = live ? liveColumns(live, p) : null;
  // Die R-Einstellungen des Inspectors gehören zum offenen Begriff; zeigt der Reiter ein anderes Verfahren
  // (p-Wert → t_test), wählt er dessen Varianten unter „Anderer Aufruf“ selbst.
  const own = !!entry && p.reference?.id === entry.id, [local, setLocal] = useState<RSettings | undefined>();
  const settings = own ? p.settings : local, onSettings = own ? p.onSettings : setLocal;
  const leadBase = entry ? initialRSettings(entry, tab.variant) : null;
  const leadSettings: RSettings | null = entry && leadBase && !live ? panelSettings(entry, settings?.variant === tab.variant ? settings : { ...leadBase, columns: { ...leadBase.columns, ...Object.fromEntries(Object.entries(settings?.columns ?? {}).filter(([k]) => rolesFor(entry, tab.variant).some(r => r.key === k))) } }, p.selection, p.reference) : null;
  const code = live && cols ? `${startBlock()}\n\n${liveCode(live, cols.x, cols.y)}` : entry && leadSettings ? analysisCode(entry, leadSettings, ranked) : '';
  const captured = !live && entry && catalog && catalog !== 'error' ? catalog[`${entry.id}:${tab.variant}`] : undefined;
  const output = live && cols ? liveOutput(live, p.rows, cols.x, cols.y) : captured?.output ?? '';
  const mapped: Mapped[] = tab.outputMap.flatMap(m => { const s = output ? locate(output, m.match) : null; return s ? [{ ...m, spot: s }] : []; });
  const active = mapped.find(m => m.match === spot);
  useEffect(() => setFeedback(''), [code]);

  const script = () => live && cols
    ? scriptText(p.title, `Leitaufruf: ${LIVE_LABEL[live.fn]}`, liveCode(live, cols.x, cols.y))
    : entry && leadSettings ? scriptFor(entry, leadSettings, ranked) : '';
  const fn = live ? (live.fn === 'rec_frequency' ? 'rec' : live.fn === 'cov' ? 'kovarianz' : live.fn) : entry && leadSettings ? entry.variants[leadSettings.variant]?.fn ?? entry.id : 'aufruf';
  async function copy() { try { await navigator.clipboard.writeText(code); setFeedback('R-Aufruf kopiert.'); } catch { setFeedback('Kopieren ist hier nicht verfügbar. Du kannst das R-Skript herunterladen.'); } }

  const note = token ? noteFor(token, tab.tokens) : null;
  const tokenConcept = token ? RTOKEN_CONCEPTS[token] : undefined;
  const others = entry && (live ? entry.variants.length > 0 : entry.variants.length > 1);
  const help = [...new Set([...(live ? liveHelp(live) : []), ...(entry?.variants.map(v => `mariposa::${v.fn}`) ?? [])])];

  return (
    <div className={`xw xw-r${compact ? ' xw-compact' : ''}`}>
      <KurzGesagt text="In R rechnet mariposa dieselbe Zahl. Tippe ein Zeichen im Code an, um zu lesen, was es tut." />
      <Section title="Daten holen" note="Lege die Datei und dein R-Skript in denselben Ordner. Die Datei enthält die aktuellen Werte, auch deine Änderungen.">
        <div className="r-actions">
          <button type="button" className="primary" onClick={() => downloadText(SAV_NAME, writeSav(p.rows), 'application/x-spss-sav')}><Download size={14} />Lehrdatensatz als SPSS-Datei (.sav)</button>
          <button type="button" className="xw-small" onClick={() => downloadText('Statistikatlas-200-Befragte-synthetisch.csv', surveyCsv(p.rows), 'text/csv;charset=utf-8')}>auch als CSV</button>
        </div>
      </Section>
      <Section title="Der Aufruf">
        <CodeView code={code} notes={notes} active={token} onPick={k => setToken(t => t === k ? null : k)} />
        <div aria-live="polite">{note && <TokenCard note={note} concept={tokenConcept} onConcept={p.onConcept} />}</div>
        <div className="r-actions">
          <button type="button" onClick={copy}><Copy size={14} />Aufruf kopieren</button>
          <button type="button" onClick={() => downloadText(`Statistikatlas-${fn}.R`, script())}><Download size={14} />R-Skript</button>
        </div>
        {feedback && <p role="status" className="xw-note">{feedback}</p>}
      </Section>
      <Section title="So antwortet R" note="R schreibt Punkt statt Komma und meist drei Nachkommastellen. Tippe eine markierte Zahl an.">
        {!live && <p className="xw-note">{catalog === 'error' ? 'Die in R erfasste Ausgabe lässt sich hier nicht laden.' : 'Ausgabe für die Ausgangsdaten, in R erfasst.'}
          {captured && captured.code !== code && ' Sie gehört zum Aufruf mit den Ausgangsspalten.'}
          {p.modified && ' Deine Daten sind verändert; R würde andere Zahlen zeigen.'}</p>}
        {live && p.modified && <p className="xw-note">Die Ausgabe zeigt deine veränderten Daten, so wie R sie mit der heruntergeladenen Datei zeigen würde.</p>}
        {output ? <OutputView output={output} mapped={mapped} active={spot} onPick={m => setSpot(s => s === m ? null : m)} />
          : !live && catalog === null ? <p className="xw-note">Die Ausgabe wird geladen …</p>
          : !live && catalog !== 'error' ? <p className="xw-note">R zeigt hier keine Ausgabe.</p> : null}
        {active && <Mapping m={active} stepTitle={p.stepTitle} onStepLink={p.onStepLink} />}
      </Section>
      {!compact && output && <QuickCheck key={code} check={tab.check} mapped={mapped} output={output} />}
      {others && entry && <details className="xw-other">
        <summary>Anderer Aufruf</summary>
        <MariposaPanel {...p} entry={entry} settings={settings} onSettings={onSettings} embedded />
        <OtherOutput entry={entry} p={{ ...p, settings }} catalog={catalog} />
      </details>}
      {!compact && <details className="xw-help">
        <summary>Weitere Funktionen und Hilfe</summary>
        <p>{help.map(h => <code key={h}>?{h}<br /></code>)}</p>
        <p>Bei Analyseobjekten zeigt <code>print(ergebnis)</code> die kompakte Ausgabe und <code>summary(ergebnis)</code> die ausführliche Darstellung.</p>
      </details>}
    </div>
  );
}

/** Erfasste Ausgabe der unter „Anderer Aufruf“ gewählten Variante, wenn sie zur Auswahl passt. */
function OtherOutput({ entry, p, catalog }: { entry: AtlasEntry; p: RProps; catalog: Catalog | 'error' | null }) {
  if (!catalog || catalog === 'error') return null;
  const s = panelSettings(entry, p.settings ?? initialRSettings(entry), p.selection, p.reference);
  const captured = catalog[`${entry.id}:${s.variant}`];
  if (!captured?.output) return null;
  const same = captured.code === analysisCode(entry, s, p.reference?.basis === 'ranks');
  return (
    <div className="xw-other-output">
      <h4>So antwortet R</h4>
      <p className="xw-note">Ausgabe für die Ausgangsdaten{same ? '' : ' und die Ausgangsspalten'}, in R erfasst.{p.modified ? ' Deine Daten sind verändert; R würde andere Zahlen zeigen.' : ''}</p>
      <pre className="r-code xw-routput"><code>{captured.output}</code></pre>
    </div>
  );
}
