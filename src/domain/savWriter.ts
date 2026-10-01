/**
 * SPSS-Systemdatei (.sav, unkomprimiert, Little Endian) für den Lehrdatensatz, im Browser geschrieben
 * (Spezifikation Lehrdatensatz und R, Abschnitt 8). Aufbau nach der PSPP-Dokumentation „System File Format“:
 * Kopfsatz, je Spalte ein Variablensatz mit Label, Wertelabels, Maschinenangaben, Messniveau,
 * lange Variablennamen, Zeichenkodierung UTF-8, Ende des Wörterbuchs, dann die Fälle.
 * Geprüft mit read_spss() und haven::read_sav() durch scripts/verify-sav.R.
 */
import { surveyColumns, type SurveyColumn, type SurveyRow } from './survey';

const encoder = new TextEncoder();
/** Fehlender Wert in SPSS (SYSMIS): die kleinste darstellbare Zahl. */
const SYSMIS = -Number.MAX_VALUE;

/** Variablenlabel: der Fragetext ohne äußere Anführungszeichen; teilen sich Spalten eine Frage, steht der Titel davor. */
export function savVariableLabel(c: SurveyColumn): string {
  const question = c.question.replace(/^„(.*)“$/, '$1');
  const shared = surveyColumns.some(o => o.id !== c.id && o.question === c.question);
  return shared ? `${c.title.replace(/ · /g, ' ')}: ${question}` : question;
}

/** Messniveau in SPSS: 1 nominal, 2 ordinal, 3 metrisch (scale). */
export function savMeasure(c: SurveyColumn): 1 | 2 | 3 {
  return c.scale === 'metric' ? 3 : c.scale === 'ordinal' ? 2 : 1;
}

/** Nachkommastellen des Anzeigeformats aus der Schrittweite der Spalte (1 → F8.0, 0,1 → F8.1). */
function decimals(c: SurveyColumn): number {
  const text = String(c.step);
  return text.includes('.') ? text.split('.')[1].length : 0;
}

/** Eindeutige kurze Namen (höchstens acht Zeichen, Großbuchstaben); ihre Endziffern bleiben erhalten. */
function shortNames(ids: string[]): string[] {
  const used = new Set<string>();
  return ids.map(id => {
    const upper = id.toUpperCase(), tail = /\d+$/.exec(upper)?.[0] ?? '';
    let name = upper.length <= 8 ? upper : upper.slice(0, 8 - tail.length) + tail;
    for (let k = 1; used.has(name); k++) name = upper.slice(0, 8 - String(k).length) + k;
    used.add(name);
    return name;
  });
}

/** Byte-Puffer, der nach Bedarf wächst. */
class Writer {
  private buffer = new Uint8Array(1 << 16);
  private view = new DataView(this.buffer.buffer);
  length = 0;
  private grow(n: number) {
    if (this.length + n <= this.buffer.length) return;
    let size = this.buffer.length * 2;
    while (size < this.length + n) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buffer.subarray(0, this.length));
    this.buffer = next;
    this.view = new DataView(next.buffer);
  }
  int(n: number) { this.grow(4); this.view.setInt32(this.length, n, true); this.length += 4; }
  double(x: number) { this.grow(8); this.view.setFloat64(this.length, x, true); this.length += 8; }
  bytes(b: Uint8Array) { this.grow(b.length); this.buffer.set(b, this.length); this.length += b.length; }
  /** Text in einem Feld fester Länge, mit Leerzeichen aufgefüllt. */
  fixed(text: string, size: number) {
    const b = encoder.encode(text).subarray(0, size), padded = new Uint8Array(size).fill(0x20);
    padded.set(b);
    this.bytes(padded);
  }
  zeros(n: number) { this.bytes(new Uint8Array(n)); }
  result() { return this.buffer.slice(0, this.length); }
}

/** UTF-8-Text auf eine Byte-Länge gekürzt, ohne ein Zeichen zu zerschneiden. */
function utf8(text: string, max: number): Uint8Array {
  let b = encoder.encode(text);
  while (b.length > max) { text = text.slice(0, -1); b = encoder.encode(text); }
  return b;
}

/** Label des Datensatzes (höchstens 40 Zeichen, damit auch write_xpt() es übernehmen kann). */
export const FILE_LABEL = 'Statistikatlas: 200 Befragte';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const two = (n: number) => String(n).padStart(2, '0');

/**
 * Schreibt die aktuellen Daten (auch eigene Änderungen) als SPSS-Systemdatei:
 * `id` als Zeichenkette, 28 numerische Spalten, lange Variablennamen, Variablen- und Wertelabels,
 * Messniveau und Zeichenkodierung UTF-8.
 */
export function writeSav(rows: SurveyRow[], created: Date = new Date()): Uint8Array<ArrayBuffer> {
  const idWidth = Math.max(1, ...rows.map(r => encoder.encode(r.id).length)), idSegments = Math.ceil(idWidth / 8);
  const columns = surveyColumns, names = shortNames(['id', ...columns.map(c => c.id)]);
  const out = new Writer();

  // Kopfsatz (176 Bytes)
  out.fixed('$FL2', 4);
  out.fixed('@(#) SPSS DATA FILE Statistikatlas', 60);
  out.int(2); // Layout: Little Endian
  out.int(idSegments + columns.length); // 8-Byte-Einheiten je Fall
  out.int(0); // unkomprimiert
  out.int(0); // keine Gewichtsvariable
  out.int(rows.length);
  out.double(100); // Kompressionsversatz (Standardwert)
  out.fixed(`${two(created.getUTCDate())} ${MONTHS[created.getUTCMonth()]} ${two(created.getUTCFullYear() % 100)}`, 9);
  out.fixed(`${two(created.getUTCHours())}:${two(created.getUTCMinutes())}:${two(created.getUTCSeconds())}`, 8);
  // Dateilabel: read_spss() übernimmt es als Label des Datensatzes; write_xpt() erlaubt höchstens 40 Zeichen.
  out.fixed(FILE_LABEL, 64);
  out.zeros(3);

  // Variablensätze
  const variable = (name: string, type: number, label: string, format: number) => {
    const text = utf8(label, 255);
    out.int(2); out.int(type); out.int(1); out.int(0); out.int(format); out.int(format); out.fixed(name, 8);
    out.int(text.length); out.bytes(text); out.zeros((4 - (text.length % 4)) % 4);
  };
  variable(names[0], idWidth, 'Befragten-ID', (1 << 16) | (idWidth << 8));
  for (let s = 1; s < idSegments; s++) { out.int(2); out.int(-1); out.int(0); out.int(0); out.int(0); out.int(0); out.fixed('', 8); }
  const index = (k: number) => idSegments + k + 1; // 1-basierter Wörterbuchindex der Spalte k
  columns.forEach((c, k) => variable(names[k + 1], 0, savVariableLabel(c), (5 << 16) | (8 << 8) | decimals(c)));

  // Wertelabels (Satz 3) und die Variablen, für die sie gelten (Satz 4)
  columns.forEach((c, k) => {
    if (!c.categories) return;
    out.int(3); out.int(c.categories.length);
    for (const { value, label } of c.categories) {
      const text = utf8(label, 120);
      out.double(value); out.bytes(new Uint8Array([text.length])); out.bytes(text); out.zeros((8 - ((text.length + 1) % 8)) % 8);
    }
    out.int(4); out.int(1); out.int(index(k));
  });

  // Maschinenangaben: Ganzzahlen (7/3) und Gleitkommazahlen (7/4)
  out.int(7); out.int(3); out.int(4); out.int(8);
  for (const n of [20, 0, 0, -1, 1, 1, 2, 65001]) out.int(n); // Version, Maschine, IEEE 754, Kompression, Little Endian, UTF-8
  out.int(7); out.int(4); out.int(8); out.int(3);
  out.double(SYSMIS); out.double(Number.MAX_VALUE);
  out.bytes(new Uint8Array([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xef, 0xff])); // LOWEST: nächste Zahl über SYSMIS

  // Anzeige je Variable (7/11): Messniveau, Breite, Ausrichtung
  out.int(7); out.int(11); out.int(4); out.int(3 * (columns.length + 1));
  out.int(1); out.int(Math.max(8, idWidth)); out.int(0);
  for (const c of columns) { out.int(savMeasure(c)); out.int(Math.max(8, Math.min(c.id.length, 20))); out.int(1); }

  // Lange Variablennamen (7/13) und Zeichenkodierung (7/20)
  const longNames = encoder.encode(['id', ...columns.map(c => c.id)].map((id, k) => `${names[k]}=${id}`).join('\t'));
  out.int(7); out.int(13); out.int(1); out.int(longNames.length); out.bytes(longNames);
  const encoding = encoder.encode('UTF-8');
  out.int(7); out.int(20); out.int(1); out.int(encoding.length); out.bytes(encoding);

  // Ende des Wörterbuchs
  out.int(999); out.int(0);

  // Fälle
  for (const row of rows) {
    out.fixed(row.id, idSegments * 8);
    for (const c of columns) {
      const value = row.values[c.id];
      out.double(typeof value === 'number' && Number.isFinite(value) ? value : SYSMIS);
    }
  }
  return out.result();
}
