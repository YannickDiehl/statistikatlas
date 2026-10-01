/**
 * Prüfregeln des Sprachleitfadens (Spezifikation 2026-10-01-freie-karte-ausbau-alle-knoten-design.md, Abschnitt 2),
 * soweit sie sich maschinell prüfen lassen. Die Inhaltstests und die Bereichsagenten rufen `styleProblems` für
 * jeden sichtbaren Text auf; eine leere Liste heißt: Der Text verletzt keine dieser Regeln.
 *
 * Geprüft wird hier: Regel 3 (Kurz gesagt höchstens zwei Sätze, über `maxSentences`), Regel 4 (Satzlänge, über
 * `maxWords`), Regel 5 (keine abwertenden Wörter) und Regel 11 (Mittelpunkt nur als Malzeichen, echtes Minus).
 * Die übrigen Regeln prüft die Begutachtung.
 */

/**
 * Regel 5: Wortstämme, die Schwieriges kleinreden. Gemeldet wird jedes Wort, das mit einem Stamm beginnt
 * („einfacher“, „offensichtlicher“, „trivialerweise“, „Natürliche“), außer den Fachbegriffen in `ALLOWED_TERMS`.
 */
export const BANNED_WORDS: readonly string[] = ['einfach', 'offensichtlich', 'trivial', 'natürlich', 'bekanntlich', 'leicht zu sehen'];

/** Fachbegriffe, die einen Stamm aus `BANNED_WORDS` enthalten und erlaubt bleiben. */
export const ALLOWED_TERMS: readonly RegExp[] = [
  /^einfache[nrs]?\s+(Zufallsstichprobe|Zufallsauswahl|lineare)/i,
  /^natürliche[nrs]?\s+(Logarithmus|Zahl|Experiment)/i,
];

/** Abkürzungen, deren Punkt kein Satzende ist. */
const ABBREVIATIONS = ['z. B.', 'z.B.', 'd. h.', 'd.h.', 'u. a.', 'u.a.', 'z. T.', 'u. U.', 'o. Ä.', 'bzw.', 'ca.', 'vgl.', 'usw.', 'etc.', 'evtl.', 'ggf.', 'inkl.', 'Nr.', 'bspw.', 'Abb.', 'Kap.', 'Mio.', 'Mrd.'];
/** Wörter nach einer Ordnungszahl („3. Oktober“, „20. Bundestag“): Der Punkt davor beendet keinen Satz. */
const AFTER_ORDINAL = 'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Jahrhundert|Bundestag|Wahlperiode|Semester|Sitzung';
const ORDINAL = new RegExp(`(?<![\\d.,])(\\d{1,2})\\.(\\s+(?:${AFTER_ORDINAL}))(?!\\p{L})`, 'gu');
const HIDE = '\u0000';

/**
 * Zerlegt einen Text in Sätze. Ein Satz endet mit „.“, „!“ oder „?“ (auch vor schließenden Anführungszeichen
 * oder Klammern), wenn danach Leerraum oder das Textende folgt. Zahlen wie 1.550,3, die üblichen Abkürzungen
 * („z. B.“, „bzw.“) und Ordnungszahlen vor Monaten und Ähnlichem („am 3. Oktober“) beenden keinen Satz.
 */
export function sentences(text: string): string[] {
  let hidden = text.replace(ORDINAL, `$1${HIDE}$2`);
  for (const a of ABBREVIATIONS) hidden = hidden.split(a).join(a.replace(/\./g, HIDE));
  const parts = hidden.split(/(?<=[.!?][“”"»)\]]*)\s+/u);
  return parts.map(p => p.split(HIDE).join('.').trim()).filter(Boolean);
}

/** Wörter eines Satzes: Teile mit mindestens einem Buchstaben oder einer Ziffer („=“, „−“, „·“ zählen nicht). */
const wordsOf = (sentence: string) => sentence.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));

const quote = (s: string, max = 60) => `„${s.length > max ? `${s.slice(0, max - 1)}…` : s}“`;
const around = (text: string, at: number, width = 24) => text.slice(Math.max(0, at - width), at + width).trim();

/**
 * Mittelpunkt als Trenner: zwischen zwei Wörtern („Mittelwert · Varianz“), vor einer Zahl mit Einheit
 * („Lernplanung · 5 Stufen“) oder nach „Schritt n“. Als Malzeichen neben einer Zahl oder einem Zeichen bleibt
 * er erlaubt („3 · 4“, „2 · Abstand“, „Summe · 2“, „sₓ · sᵧ“); zwischen zwei Wörtern schreibst du „mal“.
 */
const SEPARATOR = /\p{Ll}{3,}\s*·\s*(?:\p{L}\p{Ll}{2,}|\d[\d.,]*\s+\p{L}\p{Ll}{2,})|Schritt \d+\s*·/gu;
/**
 * Bindestrich statt Minus: vor einer Zahl am Anfang, nach Leerraum, Klammer oder Rechenzeichen („-4“, „(-4)²“),
 * mit Leerzeichen auf beiden Seiten („n - 1“, „1 - α“; als Gedankenstrich dient „–“) und zwischen einem
 * einzelnen Zeichen und einer Zahl („n-1“). Wörter mit Bindestrich („t-Test“, „Links-rechts-Skala“) bleiben erlaubt.
 */
const HYPHEN_MINUS = /(^|[\s([{=≈<>/:;,])-(?=\d)|(?<=\S)\s-\s(?=\S)|(?<![\p{L}\p{M}])\p{L}\p{M}*-(?=\d)/gu;

/**
 * Alle Verstöße eines Textes gegen die prüfbaren Regeln, als lesbare Meldungen; leer heißt gut.
 * `maxWords` prüft jeden Satz (für „Was passiert?“, „Kurz gesagt“ und „Warum?“ gilt 25),
 * `maxSentences` die Zahl der Sätze (für „Kurz gesagt“ gilt 2). Ohne diese Angaben werden Länge und Satzzahl nicht geprüft.
 */
export function styleProblems(text: string, opts: { maxWords?: number; maxSentences?: number } = {}): string[] {
  const problems: string[] = [];
  for (const word of BANNED_WORDS) {
    const pattern = new RegExp(`(?<!\\p{L})${word.replace(/ /g, '\\s+')}\\p{L}*`, 'giu');
    for (const m of text.matchAll(pattern)) {
      if (ALLOWED_TERMS.some(a => a.test(text.slice(m.index)))) continue;
      problems.push(`„${word}“ wertet das Schwierige ab (Regel 5): ${quote(m[0])}`);
    }
  }
  const list = sentences(text);
  if (opts.maxSentences !== undefined && list.length > opts.maxSentences)
    problems.push(`Zu viele Sätze: ${list.length}, erlaubt sind höchstens ${opts.maxSentences} (Regel 3).`);
  if (opts.maxWords !== undefined) for (const s of list) {
    const n = wordsOf(s).length;
    if (n > opts.maxWords) problems.push(`Satzlänge: ${n} Wörter, erlaubt sind höchstens ${opts.maxWords} (Regel 4): ${quote(s)}`);
  }
  for (const m of text.matchAll(SEPARATOR)) problems.push(`Mittelpunkt „·“ als Trenner, er steht nur für „mal“ (Regel 11): ${quote(around(text, m.index ?? 0))}`);
  for (const m of text.matchAll(HYPHEN_MINUS)) problems.push(`Bindestrich statt echtem Minus „−“ (Regel 11): ${quote(around(text, (m.index ?? 0) + (m[1]?.length ?? 0)))}`);
  return problems;
}
