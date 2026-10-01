/**
 * Prüfregeln des Sprachleitfadens (Spezifikation 2026-10-01-freie-karte-ausbau-alle-knoten-design.md, Abschnitt 2),
 * soweit sie sich maschinell prüfen lassen. Die Inhaltstests und die Bereichsagenten rufen `styleProblems` für
 * jeden sichtbaren Text auf; eine leere Liste heißt: Der Text verletzt keine dieser Regeln.
 *
 * Geprüft wird hier: Regel 3 (Kurz gesagt höchstens zwei Sätze, über `maxSentences`), Regel 4 (Satzlänge, über
 * `maxWords`), Regel 5 (keine abwertenden Wörter) und Regel 11 (Mittelpunkt nur als Malzeichen, echtes Minus).
 * Die übrigen Regeln prüft die Begutachtung.
 */

/** Regel 5: Wörter, die Schwieriges kleinreden. Geprüft wird das ganze Wort, „einfache Zufallsstichprobe“ bleibt erlaubt. */
export const BANNED_WORDS: readonly string[] = ['einfach', 'offensichtlich', 'trivial', 'natürlich', 'bekanntlich', 'leicht zu sehen'];

/** Abkürzungen, deren Punkt kein Satzende ist. */
const ABBREVIATIONS = ['z. B.', 'z.B.', 'd. h.', 'd.h.', 'u. a.', 'u.a.', 'z. T.', 'u. U.', 'o. Ä.', 'bzw.', 'ca.', 'vgl.', 'usw.', 'etc.', 'evtl.', 'ggf.', 'inkl.', 'Nr.', 'bspw.', 'Abb.', 'Kap.', 'Mio.', 'Mrd.'];
const HIDE = '\u0000';

/**
 * Zerlegt einen Text in Sätze. Ein Satz endet mit „.“, „!“ oder „?“ (auch vor schließenden Anführungszeichen
 * oder Klammern), wenn danach Leerraum oder das Textende folgt. Zahlen wie 1.550,3 und die üblichen Abkürzungen
 * („z. B.“, „bzw.“) beenden keinen Satz.
 */
export function sentences(text: string): string[] {
  let hidden = text;
  for (const a of ABBREVIATIONS) hidden = hidden.split(a).join(a.replace(/\./g, HIDE));
  const parts = hidden.split(/(?<=[.!?][“”"»)\]]*)\s+/u);
  return parts.map(p => p.split(HIDE).join('.').trim()).filter(Boolean);
}

/** Wörter eines Satzes: Teile mit mindestens einem Buchstaben oder einer Ziffer („=“, „−“, „·“ zählen nicht). */
const wordsOf = (sentence: string) => sentence.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));

const quote = (s: string, max = 60) => `„${s.length > max ? `${s.slice(0, max - 1)}…` : s}“`;
const around = (text: string, at: number, width = 24) => text.slice(Math.max(0, at - width), at + width).trim();

/** Mittelpunkt neben einem Wort aus mindestens drei Buchstaben oder nach „Schritt n“: als Trenner gelesen. */
const SEPARATOR = /\p{Ll}{3,}\s*·|·\s*\p{L}\p{Ll}{2,}|Schritt \d+\s*·/gu;
/** Bindestrich-Minus vor einer Zahl am Anfang, nach Leerraum, Klammer oder Rechenzeichen. */
const HYPHEN_MINUS = /(^|[\s([{=≈<>/:;,])-(?=\d)/g;

/**
 * Alle Verstöße eines Textes gegen die prüfbaren Regeln, als lesbare Meldungen; leer heißt gut.
 * `maxWords` prüft jeden Satz (für „Was passiert?“, „Kurz gesagt“ und „Warum?“ gilt 25),
 * `maxSentences` die Zahl der Sätze (für „Kurz gesagt“ gilt 2). Ohne diese Angaben werden Länge und Satzzahl nicht geprüft.
 */
export function styleProblems(text: string, opts: { maxWords?: number; maxSentences?: number } = {}): string[] {
  const problems: string[] = [];
  for (const word of BANNED_WORDS) {
    const pattern = new RegExp(`(?<!\\p{L})${word.replace(/ /g, '\\s+')}(?!\\p{L})`, 'iu');
    if (pattern.test(text)) problems.push(`„${word}“ wertet das Schwierige ab (Regel 5).`);
  }
  const list = sentences(text);
  if (opts.maxSentences !== undefined && list.length > opts.maxSentences)
    problems.push(`Zu viele Sätze: ${list.length}, erlaubt sind höchstens ${opts.maxSentences} (Regel 3).`);
  if (opts.maxWords !== undefined) for (const s of list) {
    const n = wordsOf(s).length;
    if (n > opts.maxWords) problems.push(`Satzlänge: ${n} Wörter, erlaubt sind höchstens ${opts.maxWords} (Regel 4): ${quote(s)}`);
  }
  for (const m of text.matchAll(SEPARATOR)) problems.push(`Mittelpunkt „·“ als Trenner, er steht nur für „mal“ (Regel 11): ${quote(around(text, m.index ?? 0))}`);
  for (const m of text.matchAll(HYPHEN_MINUS)) problems.push(`Bindestrich statt echtem Minus „−“ vor einer Zahl (Regel 11): ${quote(around(text, (m.index ?? 0) + m[1].length))}`);
  return problems;
}
