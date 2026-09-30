// Vorlage „Werkzeug“ (Stufe 3) am Beispiel Rekodieren mit mariposa::rec() 0.7.4. Wortlaut: docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt/05-rekodieren.md
import { apply, trace, type Code, type Outcome, type Program, type Rule } from '../rules';
import { num, count, pct } from '../format';

/** ALLBUS 2023, politisches Interesse pa02a, ungewichtet (aggregiert). */
export const PA02A: Code[] = [
  { k: 1, label: 'sehr stark', f: 527 },
  { k: 2, label: 'stark', f: 1542 },
  { k: 3, label: 'mittel', f: 2303 },
  { k: 4, label: 'wenig', f: 663 },
  { k: 5, label: 'überhaupt nicht', f: 190 },
  { k: 'M', label: 'fehlend', f: 21 },
];
export const SCALE = { min: 1, max: 5 };
export const MEAN_BEFORE = 2.70;

const q = (s: string) => `„${s}“`;
const code = (c: Code) => c.k === 'M' ? 'keine gültige Angabe' : `den Code ${c.k} (${q(c.label)})`;
const target = (r: Rule['rhs']) => r === 'NA' ? 'NA (fehlend)' : r === 'copy' ? 'sich selbst (unverändert)' : num(r);

export const rekodieren = {
  concept: 'recode',
  oldName: 'pa02a',
  newName: 'interesse',
  codes: PA02A,
  scale: SCALE,
  wofuer: 'Im ALLBUS heißt beim politischen Interesse (pa02a) der Code 1 „sehr stark“ und 5 „überhaupt nicht“. Wer „höhere Zahl = mehr Interesse“ lesen will, muss umpolen. Wer zwei Gruppen vergleichen will, fasst Codes zusammen.',
  kurz: 'Rekodieren gibt Antworten neue Zahlen. Was die Befragten geantwortet haben, bleibt dasselbe.',
  fachlich: 'Rekodieren ordnet den Codes einer Variable nach Regeln neue Codes und Wertelabels zu. Umpolen kehrt die Reihenfolge einer Skala um, Dichotomisieren fasst sie zu zwei Gruppen zusammen.',
  terms: [
    { term: 'Code', plain: 'die Zahl, die für eine Antwort gespeichert ist, etwa 4', concept: null },
    { term: 'Wertelabel', plain: 'der Text zum Code, etwa „wenig“', concept: 'labels' },
    { term: 'Umpolen', plain: 'die Skala umdrehen: aus 1 wird 5, aus 5 wird 1', concept: null },
    { term: 'Dichotomisieren', plain: 'in zwei Gruppen teilen, meist 0 und 1', concept: 'dummy' },
    { term: 'Fehlender Wert', plain: 'keine gültige Antwort, etwa „keine Angabe“; in R NA', concept: 'missing' },
  ],
  signs: [
    { sym: '=', say: 'sprich „wird zu“', plain: 'links alt, rechts neu' },
    { sym: '1:2', say: 'sprich „1 bis 2“', plain: 'ein Bereich, von klein nach groß' },
    { sym: '1,2', say: 'sprich „1 und 2“', plain: 'eine Liste einzelner Codes' },
    { sym: '[stark]', say: 'Wertelabel', plain: 'Text für den neuen Code' },
    { sym: ';', say: 'Trenner', plain: 'danach kommt die nächste Regel' },
    { sym: 'else', say: 'sprich „sonst“', plain: 'alles Übrige, auch fehlende Werte' },
    { sym: 'rev', say: 'sprich „reverse“', plain: 'umpolen: neu = 6 − alt bei 1 bis 5' },
  ],
  presets: [
    { label: 'Umpolen', rule: 'rev' },
    { label: 'Dichotomisieren', rule: '1:2=1 [stark]; 3:5=0 [nicht stark]' },
    { label: 'Mit Lücke', rule: '1:2=1 [stark]; 4:5=0 [schwach]' },
    { label: 'Mit else', rule: '1:2=1 [stark]; else=0 [nicht stark]' },
  ],
  /** „So liest rec() deine Regel“: eine Zeile je Regel. */
  describe(p: Program): { label: string; src: string; text: string }[] {
    if (p.kind === 'rev') return [{ label: 'Regel', src: p.src, text: `Die Skala wird umgepolt. neu = kleinster + größter Code − alt, hier ${num(p.lo + p.hi)} − alt. Die Wertelabels wandern mit.` }];
    return p.rules.map((r, i) => ({
      label: `Regel ${i + 1}`, src: r.src,
      text: 'else' in r.lhs
        ? `Alles, was bis hierhin keine Regel getroffen hat, wird ${target(r.rhs)}${r.label ? ` mit dem Wertelabel ${q(r.label)}` : ''}. Achtung: Das gilt auch für fehlende Werte.`
        : 'na' in r.lhs
          ? `Fehlende Werte werden zu ${target(r.rhs)}.`
          : `Die Codes ${r.lhs.items.map(([a, b]) => a === b ? num(a) : `${num(a)} bis ${num(b)}`).join(' und ')} werden zu ${target(r.rhs)}${r.label ? `, Wertelabel ${q(r.label)}` : ''}.`,
    }));
  },
  firstWins: 'Die Regeln werden der Reihe nach geprüft. Die erste passende gewinnt.',
  /** „Vorgerechnet für eine Person“: nummerierte Sätze und ein Kurz gesagt. */
  walk(p: Program, c: Code): { lines: string[]; kurz: string; result: Outcome } {
    const { checked, result } = trace(p, c);
    const lines = [`Die Person hat ${code(c)}.`];
    if (p.kind === 'rev') {
      if (c.k === 'M') lines.push('rev dreht nur gültige Codes um. Die Person bleibt fehlend.');
      else lines.push(`rev rechnet: neu = kleinster + größter Code − alt = ${num(p.lo)} + ${num(p.hi)} − ${c.k} = ${num(p.lo + p.hi - c.k)}.`, `Das Wertelabel ${q(c.label)} wandert mit zum Code ${num(p.lo + p.hi - c.k)}.`);
    } else {
      for (const s of checked) lines.push(`Regel ${s.rule} (${s.src}) ${s.hit ? 'passt.' : s.missingInRange ? 'passt nicht: Fehlende Werte liegen in keinem Bereich.' : 'passt nicht.'}`);
    }
    lines.push(result.t === 'val' ? `Neuer Code: ${num(result.v)}${result.label ? `, Wertelabel ${q(result.label)}` : ''}.`
      : result.t === 'miss' ? 'Ergebnis: Die Person bleibt fehlend.'
      : result.t === 'na' ? 'Ergebnis: NA, ausdrücklich gesetzt.'
      : 'Keine Regel passt. Der Code wird NA, und mariposa gibt eine Warnung aus.');
    const from = c.k === 'M' ? '„fehlend“' : String(c.k);
    const to = result.t === 'val' ? num(result.v) : result.t === 'miss' ? '„fehlend“' : 'NA';
    return { lines, kurz: `Aus ${from} wird ${to}.`, result };
  },
  warnUnmatched: (codes: Code[]) => ({
    text: `Warnung wie in mariposa: Code ${codes.map(c => c.k).join(', ')} passt zu keiner Regel und wird NA. Das betrifft ${count(codes.reduce((a, c) => a + c.f, 0))} Befragte. Mit „else=copy“ behältst du die Codes, mit „else=NA“ bestätigst du es.`,
    r: `${codes.length} value${codes.length === 1 ? '' : 's'} of \`pa02a\` matched no rule and became "NA": ${codes.map(c => c.k).join(', ')}.`,
    kurz: 'Diese Antworten gehen verloren, wenn du nichts tust.',
  }),
  warnCaptured: (v: number, label: string | null) => ({
    text: `Achtung: Auch die 21 fehlenden Angaben treffen hier eine Regel. Sie zählen jetzt als ${num(v)}${label ? ` ${q(label)}` : ''}. Sicherer ist es, die Codes ausdrücklich zu nennen.`,
    kurz: 'Aus „keine Angabe“ wird eine Antwort, die niemand gegeben hat.',
  }),
  meanNote(p: Program, mean: number, binary: boolean): string {
    if (p.kind === 'rev') return `Umpolen rechnet neu = ${num(p.lo + p.hi)} − alt. Das gilt auch für den Mittelwert: ${num(p.lo + p.hi)} − 2,70 = ${num(p.lo + p.hi - MEAN_BEFORE)}. Die Streuung bleibt gleich.`;
    if (binary) return `Bei einer 0/1-Variable ist der Mittelwert der Anteil der 1: ${pct(mean)}.`;
    return 'Der Mittelwert ändert sich mit den neuen Codes. Ob er inhaltlich sinnvoll ist, hängt von den Abständen der neuen Codes ab.';
  },
  rCode: (rule: string) => `library(mariposa)\nallbus <- read_spss("ZA8831_v1-3-0.sav")\n\nallbus %>%\n  mutate(interesse = rec(pa02a, rules = "${rule}")) %>%\n  frequency(interesse)`,
  fehler: '„else“ schreiben und vergessen, dass es auch fehlende Angaben erfasst. Nach dem Umpolen die alte Bedeutung im Kopf behalten: Jetzt heißt 5 „sehr stark“.',
  check: {
    /** Code für die Frage: die gewählte Person, bei „fehlend“ Code 2. */
    codeFor: (who: number) => PA02A[who].k === 'M' ? PA02A[1] : PA02A[who],
    question: (c: Code) => `Eine Person hat ${c.k} angegeben (${q(c.label)}). Welchen neuen Code bekommt sie mit der aktuellen Regel? Tippe eine Zahl oder NA.`,
    answer: (p: Program, c: Code): number | 'NA' => { const o = apply(p, c); return o.t === 'val' ? o.v : 'NA'; },
    diagnose: (p: Program, c: Code, v: number | 'NA') => p.kind === 'rev' && v !== 'NA' && v === c.k
      ? `Das ist noch der alte Code. Umpolen heißt ${num(p.lo + p.hi)} − alt.`
      : 'Geh die Regeln von links nach rechts durch. Die erste passende gewinnt; passt keine, wird der Code NA.',
  },
  think: [
    {
      question: 'Vorher liegt der Mittelwert bei 2,70. Wo liegt er nach dem Umpolen?', options: ['2,70', '3,30', '−2,70'], correct: 1,
      explain: 'Umpolen heißt neu = 6 − alt. Das gilt für jeden Code und damit auch für den Mittelwert: 6 − 2,70 = 3,30.',
      kurz: 'Die Skala dreht sich, der Mittelwert dreht sich mit.', rule: 'rev', who: null as number | null,
    },
    {
      question: 'Was passiert bei „1:2=1; else=0“ mit den 21 fehlenden Angaben?', options: ['bleiben fehlend', 'werden zu 0'], correct: 1,
      explain: 'else fängt alles, was keine andere Regel trifft, auch fehlende Werte. Die 21 Personen würden als „nicht stark“ gezählt.',
      kurz: 'else heißt wirklich: alles andere.', rule: '1:2=1 [stark]; else=0 [nicht stark]', who: 5 as number | null,
    },
  ],
  genau: {
    kurz: 'Die erste passende Regel gewinnt. Was keine Regel trifft, wird NA, und fehlende Werte bleiben fehlend, solange keine NA- oder else-Regel sie erfasst.',
    paragraphs: [
      'rec() prüft die Regeln von links nach rechts; für jeden Code gilt die erste passende. Gültige Codes ohne passende Regel werden NA, und mariposa gibt eine Warnung aus. Mit „else=copy“ behält man sie, mit „else=NA“ bestätigt man das. Fehlende Werte aus read_spss() bleiben fehlend, außer eine Regel „NA=…“ oder „else=…“ erfasst sie.',
      'Ob ein Mittelwert der neuen Codes sinnvoll ist, hängt vom Skalenniveau ab. Bei einer 0/1-Variable ist er der Anteil der 1.',
    ],
  },
};

export type RecodeTemplate = typeof rekodieren;
