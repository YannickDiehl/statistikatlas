/**
 * R lesen im Reiter „In R“ (Spezifikation Lehrdatensatz und R, Abschnitt 5.5), ohne React:
 * Leitaufrufe, deren Ausgabe der Atlas selbst druckt (`LiveCall`), Zahlen in einer R-Ausgabe finden (`locate`)
 * und den Code in antippbare Zeichen zerlegen (`tokenize`). Die Lernkarten der Zeichen stehen in
 * src/domain/rTokens.ts (`RTOKENS`) und in den Reitern (`RTab.tokens`); Spalten, `atlas` und mariposa-Funktionen
 * bekommen eine Karte aus ihren Metadaten.
 */
import { columnById, type SurveyRow } from '../domain/survey';
import { savVariableLabel } from '../domain/savWriter';
import { functionToConcept } from '../domain/mariposaCatalog';
import { RTOKENS } from '../domain/rTokens';
import { ref, titleFor } from '../domain/learning';
import { covOutput, describeOutput, frequencyOutput, pearsonOutput, rCov } from './rOutput';
import { sampleColumn, textTitle } from './sample';
import type { LiveCall, TokenNote } from './types';

// ---------- Leitaufrufe mit Ausgabe aus den aktuellen Daten ----------

const quoted = (s: string) => `"${s}"`;
/** Der Aufruf ohne Startblock, im Pipe-Stil (`atlas %>%` und eingerückt die Funktion). */
export function liveCode(live: LiveCall, x: string, y = ''): string {
  switch (live.fn) {
    case 'describe': return `atlas %>%\n  describe(${x}, show = ${live.show.length === 1 ? quoted(live.show[0]) : `c(${live.show.map(quoted).join(', ')})`})`;
    case 'pearson_cor': return `atlas %>%\n  pearson_cor(${x}, ${y})`;
    case 'cov': return `atlas %>%\n  summarise(kovarianz = cov(${x}, ${y}))`;
    case 'frequency': return `atlas %>%\n  frequency(${x})`;
    case 'rec_frequency': return `atlas %>%\n  mutate(${x}_umgepolt = rec(${x}, rules = "rev")) %>%\n  frequency(${x}_umgepolt)`;
  }
}

/** Ob ein Leitaufruf mit diesen Spalten möglich ist (Paare brauchen y, Umpolen braucht Antwortcodes). */
export function liveFits(live: LiveCall, x: string, y = ''): boolean {
  if (!columnById[x]) return false;
  if (live.fn === 'pearson_cor' || live.fn === 'cov') return !!columnById[y] && y !== x;
  if (live.fn === 'rec_frequency') return !!columnById[x].categories;
  return true;
}

/** Die Ausgabe des Leitaufrufs für die aktuellen Daten, Zeichen für Zeichen wie mariposa 0.7.4. */
export function liveOutput(live: LiveCall, rows: readonly SurveyRow[], x: string, y = ''): string {
  const xs = sampleColumn(rows, x), c = columnById[x];
  const labels = Object.fromEntries((c?.categories ?? []).map(k => [k.value, k.label]));
  switch (live.fn) {
    case 'describe': return describeOutput({ [x]: xs }, [x], live.show);
    case 'pearson_cor': return pearsonOutput(xs, sampleColumn(rows, y), x, y);
    case 'cov': return covOutput('kovarianz', rCov(xs, sampleColumn(rows, y)));
    case 'frequency': return frequencyOutput(xs, labels, x, c ? savVariableLabel(c) : undefined);
    // rules = "rev" spiegelt Codes und Wertelabels (wie im Werkzeug) und hängt „(recoded)“ an das Variablenlabel.
    case 'rec_frequency': {
      const mirrored = Object.fromEntries((c.categories ?? []).map(k => [c.min + c.max - k.value, k.label]));
      return frequencyOutput(xs.map(v => c.min + c.max - v), mirrored, `${x}_umgepolt`, `${savVariableLabel(c)} (recoded)`);
    }
  }
}

/** Funktionen, deren Hilfe unter „Weitere Funktionen und Hilfe“ steht. */
export function liveHelp(live: LiveCall): string[] {
  switch (live.fn) {
    case 'describe': return ['mariposa::describe'];
    case 'pearson_cor': return ['mariposa::pearson_cor'];
    case 'cov': return ['stats::cov', 'dplyr::summarise'];
    case 'frequency': return ['mariposa::frequency'];
    case 'rec_frequency': return ['mariposa::rec', 'mariposa::frequency'];
  }
}

// ---------- Zahlen in der Ausgabe finden ----------

export type Spot = { start: number; end: number; text: string };
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Eine Zahl als eigenes Wort (nicht in „lernplanung5“ oder „schulabschluss_1“). */
const NUMBER = /(?<![\p{L}\p{N}_.])-?\d+(?:\.\d+)?(?:e[+-]?\d+)?(?![\p{L}\p{N}_])/gu;
const numbersIn = (line: string) => [...line.matchAll(NUMBER)].map(m => ({ start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, text: m[0] }));

/**
 * Wo `match` in der Ausgabe auf eine Zahl zeigt:
 * 1. „match = Zahl“ oder „match < Zahl“, auch mit Klammer dazwischen („r = 0.539“, „mean=3.26“, „t(175.8) = 0.156“, „p < 0.001“);
 * 2. `match` als Spaltenkopf (eine Zeile ohne eigene Zahlen), darunter die erste Zahl, die unter dem Kopf steht
 *    („SD“ über „3.238“, „kovarianz“ über „5.44“, „N“ in der Häufigkeitstabelle);
 * 3. sonst der Text selbst. null, wenn `match` nicht vorkommt.
 */
export function locate(output: string, match: string): Spot | null {
  if (!match) return null;
  const assign = new RegExp(`(?<![\\p{L}\\p{N}_.])${escape(match)}(?:\\([^)\\n]*\\))?\\s?[=<]\\s?(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)`, 'u').exec(output);
  if (assign) {
    const text = assign[1], start = assign.index + assign[0].length - text.length;
    return { start, end: start + text.length, text };
  }
  // Typangaben wie <dbl> stehen über der Zahl, gehören aber nicht zu ihr: nur den Text selbst markieren.
  if (/^<[^>]*>$/.test(match)) { const at = output.indexOf(match); return at < 0 ? null : { start: at, end: at + match.length, text: match }; }
  const lines = output.split('\n'), offsets: number[] = [];
  lines.reduce((at, line) => { offsets.push(at); return at + line.length + 1; }, 0);
  const head = new RegExp(`(?<=^|[\\s|])${escape(match)}(?=$|[\\s|])`, 'gu');
  for (let i = 0; i < lines.length; i++) {
    if (numbersIn(lines[i]).length) continue;
    for (const m of lines[i].matchAll(head)) {
      const from = m.index ?? 0, to = from + match.length;
      for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
        const hit = numbersIn(lines[j]).find(n => n.start < to && n.end > from);
        if (hit) return { start: offsets[j] + hit.start, end: offsets[j] + hit.end, text: hit.text };
      }
    }
  }
  const at = output.indexOf(match);
  return at < 0 ? null : { start: at, end: at + match.length, text: match };
}

// ---------- Code in antippbare Zeichen zerlegen ----------

export type CodePart = { text: string; key?: string };
const TOKEN = /"[^"\n]*"|%>%|<-|==|[A-Za-z_.][A-Za-z0-9_.]*|\s+|./g;

/** Lernkarte für die Spalte, den Datensatz `atlas` oder eine mariposa-Funktion, wenn keine eigene Karte da ist. */
export function autoNote(key: string, next = ''): TokenNote | null {
  const c = columnById[key];
  if (c) return {
    sym: key, term: `Variable „${textTitle(c.title)}“`,
    kurz: `Der Name der Spalte im Lehrdatensatz. Gefragt war: ${c.question}`,
    fehler: 'Schreib den Namen genau wie im Datensatz, klein und ohne Leerzeichen. Mit einem Tippfehler findet R die Spalte nicht und bricht mit einer Fehlermeldung ab.',
  };
  if (key === 'atlas') return {
    sym: 'atlas', term: 'Datensatz in R',
    kurz: 'Unter diesem Namen liegt der Lehrdatensatz in R, sobald die Zeile mit read_spss() gelaufen ist.',
    fehler: 'Groß- und Kleinschreibung zählt: Atlas ist für R ein anderer Name. Dann meldet R: Objekt \'Atlas\' nicht gefunden.',
  };
  const concept = functionToConcept[key];
  if (concept && next.startsWith('(')) return {
    sym: `${key}()`, term: titleFor(ref(concept)),
    kurz: `Die mariposa-Funktion für ${titleFor(ref(concept))}. Mit ?${key} öffnest du ihre Hilfe.`,
    fehler: `Fehlt die Zeile library(mariposa), meldet R: konnte Funktion "${key}" nicht finden.`,
  };
  return null;
}

/**
 * Zerlegt Code in Teile; Teile mit `key` sind antippbar. Gesucht wird zuerst in `notes` (Reiter, dann RTOKENS),
 * dann in den automatischen Karten (Spalten, `atlas`, mariposa-Funktionen). Zeichenketten sind nur mit eigener
 * Karte antippbar (Schlüssel mit Anführungszeichen, etwa '"sd"').
 */
export function tokenize(code: string, notes: Record<string, TokenNote>): CodePart[] {
  const parts: CodePart[] = [];
  for (const m of code.matchAll(TOKEN)) {
    const text = m[0], next = code.slice((m.index ?? 0) + text.length).trimStart();
    const key = notes[text] || (!text.startsWith('"') && autoNote(text, next)) ? text : undefined;
    const last = parts[parts.length - 1];
    if (!key && last && !last.key) last.text += text;
    else parts.push(key ? { text, key } : { text });
  }
  return parts;
}

/** Karte zu einem Schlüssel: Reiter-Ergänzung, allgemeine Codelegende, sonst automatisch. */
export function noteFor(key: string, extra: Record<string, TokenNote> = {}, next = '('): TokenNote | null {
  return extra[key] ?? RTOKENS[key] ?? autoNote(key, next);
}
