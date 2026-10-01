/**
 * „So antwortet R“: Druckausgaben der Leitaufrufe im Format von mariposa 0.7.4, im Browser aus den
 * aktuellen Daten erzeugt (Spezifikation Lehrdatensatz und R, Abschnitt 6). Nachgebaut sind
 * print.describe(), print.pearson_cor(), der Tibble-Druck von dplyr::summarise() (pillar) und
 * print.frequency() bei einer Konsolenbreite von 80 Zeichen, ohne Farben.
 * Zeichengenau geprüft gegen die mit R erfassten Ausgaben in fixtures/r-output (rOutput.test.ts).
 */
import { pt } from '../tasks/kit/dist';

const WIDTH = 80;
const EPS = 2.220446049250313e-16;
const SQRT_EPS = Math.sqrt(EPS);

// ---------- Zahlen wie in R ----------

/** Exakter Dezimalwert einer Gleitkommazahl als ganze Zahl und Stellenzahl (Wert = int / 10^scale). */
function exactDecimal(x: number): { int: bigint; scale: number } {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, Math.abs(x));
  const hi = view.getUint32(0), lo = view.getUint32(4), biased = (hi >>> 20) & 0x7ff;
  let mantissa = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo), exponent: number;
  if (biased === 0) exponent = -1074;
  else { mantissa |= 1n << 52n; exponent = biased - 1075; }
  return exponent >= 0 ? { int: mantissa << BigInt(exponent), scale: 0 } : { int: mantissa * 5n ** BigInt(-exponent), scale: -exponent };
}

/**
 * formatC(x, format = "f", digits = d) bzw. sprintf("%.df", x): rundet den exakten Binärwert,
 * bei genau halber Stelle zur geraden Ziffer (wie C printf).
 */
export function cFixed(x: number, d: number): string {
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return x > 0 ? 'Inf' : '-Inf';
  const { int, scale } = exactDecimal(x);
  let q: bigint;
  if (scale <= d) q = int * 10n ** BigInt(d - scale);
  else {
    const div = 10n ** BigInt(scale - d), half = div / 2n, r = int % div;
    q = int / div;
    if (r > half || (r === half && q % 2n === 1n)) q += 1n;
  }
  const digits = q.toString().padStart(d + 1, '0'), sign = x < 0 || Object.is(x, -0) ? '-' : '';
  return d === 0 ? sign + digits : `${sign}${digits.slice(0, -d)}.${digits.slice(-d)}`;
}

/** R: round() bzw. nearbyint() mit Rundung zur geraden Zahl. */
function roundHalfEven(x: number): number {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

/** R: signif(x, digits) (nmath/fprec.c). */
function signif(x: number, digits: number): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  const dig = Math.max(1, Math.min(Math.round(digits), 22)), sgn = x < 0 ? -1 : 1, ax = Math.abs(x);
  const e10 = dig - 1 - Math.floor(Math.log10(ax));
  if (e10 > 0) { const pow10 = 10 ** e10; return sgn * (roundHalfEven(ax * pow10) / pow10); }
  const pow10 = 10 ** -e10;
  return sgn * (roundHalfEven(ax / pow10) * pow10);
}

/**
 * R: as.character() für Zahlen (15 signifikante Stellen). Grenze: R schreibt runde große oder sehr kleine Zahlen
 * wissenschaftlich (100000 → "1e+05", 0.00001 → "1e-05"), JavaScript nicht. In den Leitaufrufen kommen nur
 * Antwortcodes und Werte mit höchstens zwei Nachkommastellen vor; für Spalten wie einkommen wäre das nachzubauen.
 */
function rCharacter(x: number): string {
  return String(Number(x.toPrecision(15)));
}

/** Anzeigebreite (alle Zeichen hier gleich breit). */
const width = (s: string) => [...s].length;
const pad = (s: string, w: number, right = false) => right ? ' '.repeat(Math.max(0, w - width(s))) + s : s + ' '.repeat(Math.max(0, w - width(s)));

/** mariposa fmt_num(): kaufmännisch gerundet (mit kleiner Toleranz), dann formatC. */
function fmtNum(x: number, d: number): string {
  if (!Number.isFinite(x)) return '';
  const scaled = Math.abs(x) * 10 ** d;
  const v = scaled < 1e15 ? Math.sign(x) * Math.trunc(scaled + 0.5 + SQRT_EPS) / 10 ** d + 0 : x;
  return cFixed(v, d);
}

const sum = (x: number[]) => x.reduce((a, b) => a + b, 0);
/**
 * Mittelwert wie mean() in R (summary.c, real_mean): Summe / n, dann ein zweiter Durchgang mit der Korrektur
 * Σ(x − Mittel) / n. Bei ungerader Summe von 200 ganzen Zahlen liegt der Mittelwert genau auf x.xx5; erst der
 * zweite Durchgang entscheidet, auf welcher Seite er landet (mean=3.26 statt 3.27). Die Referenz ist R ohne
 * long double (Apple Silicon, aarch64). Auf x86_64 summiert R in 80 Bit und kann an solchen Grenzen anders runden.
 */
export function rMean(x: number[]): number {
  const n = x.length;
  if (!n) return NaN;
  let s = sum(x) / n;
  if (Number.isFinite(s)) {
    let t = 0;
    for (const v of x) t += v - s;
    s += t / n;
  }
  return s;
}
const mean = rMean;
/** Stichprobenkovarianz wie cov(x, y) in R (Mittelwerte in zwei Durchgängen, n − 1 im Nenner), für covOutput(). */
export function rCov(x: number[], y: number[]): number {
  if (x.length < 2) return NaN;
  const mx = rMean(x), my = rMean(y);
  return sum(x.map((v, i) => (v - mx) * (y[i] - my))) / (x.length - 1);
}
/** var() wie in R: Mittelwert in zwei Durchgängen (cov.c, MEAN), dann Σ(x − Mittel)² / (n − 1). */
function variance(x: number[]) {
  if (x.length < 2) return NaN;
  const m = mean(x);
  return sum(x.map(v => (v - m) ** 2)) / (x.length - 1);
}
const valid = (x: readonly (number | null | undefined)[]) => x.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
/** Schiefe Typ 2 wie SPSS (mariposa .calc_skewness). */
function skewness(x: number[]) {
  const n = x.length, m = mean(x), m2 = sum(x.map(v => (v - m) ** 2)) / n, m3 = sum(x.map(v => (v - m) ** 3)) / n;
  return m3 / m2 ** 1.5 * Math.sqrt(n * (n - 1)) / (n - 2);
}

/** print_header(): Leerzeile, Titel, Strichlinie in Titelbreite. */
const header = (title: string) => ['', title, '-'.repeat(width(title))];

// ---------- describe() ----------

const DESCRIBE: Record<string, [string, (x: number[]) => number]> = {
  mean: ['Mean', mean],
  sd: ['SD', x => Math.sqrt(variance(x))],
  se: ['SE', x => Math.sqrt(variance(x)) / Math.sqrt(x.length)],
  var: ['Variance', variance],
  min: ['Min', x => x.length ? Math.min(...x) : NaN],
  max: ['Max', x => x.length ? Math.max(...x) : NaN],
  range: ['Range', x => x.length ? Math.max(...x) - Math.min(...x) : NaN],
};

/** mariposa .print_desc_table(): Tabelle nach Inhalt bemessen, bei Überbreite in Spaltenblöcke geteilt. */
function descTable(headers: string[], rows: string[][], text: boolean[]): string[] {
  const colW = headers.map((h, j) => Math.max(width(h), ...rows.map(r => width(r[j])), 1)), indent = '  ';
  const gap = indent.length + sum(colW) + 2 * (colW.length - 1) <= WIDTH ? 2 : 1;
  const blocks: number[][] = [];
  let current: number[] = [], used = indent.length + colW[0];
  for (let j = 1; j < colW.length; j++) {
    const need = gap + colW[j];
    if (current.length && used + need > WIDTH) { blocks.push(current); current = []; used = indent.length + colW[0]; }
    current.push(j);
    used += need;
  }
  if (current.length) blocks.push(current);
  const lines: string[] = [];
  blocks.forEach((block, b) => {
    const cols = [0, ...block], line = (values: string[]) => indent + cols.map(k => pad(values[k], colW[k], !text[k])).join(' '.repeat(gap));
    const head = line(headers), rule = indent + '-'.repeat(width(head) - indent.length);
    if (b > 0) lines.push('');
    lines.push(rule, head, rule, ...rows.map(line), rule);
  });
  return lines;
}

/**
 * `atlas %>% describe(vars, show = show)` ohne Gewichte. Unterstützt show aus mean, sd, se, var, min, max, range;
 * N und Missing folgen immer. Fehlende Werte (NaN, null) zählen als Missing.
 */
export function describeOutput(data: Record<string, number[]>, vars: string[], show: string[]): string {
  for (const s of show) if (!DESCRIBE[s]) throw new Error(`describeOutput: show = "${s}" ist nicht nachgebaut.`);
  const headers = ['Variable', ...show.map(s => DESCRIBE[s][0]), 'N', 'Missing'];
  const rows = vars.map(v => {
    const all = data[v] || [], x = valid(all);
    return [v, ...show.map(s => fmtNum(DESCRIBE[s][1](x), 3)), String(x.length), String(all.length - x.length)];
  });
  return [...header('Descriptive Statistics'), '', ...descTable(headers, rows, headers.map((_, j) => j === 0))].join('\n');
}

// ---------- pearson_cor() ----------

/** mariposa format_p_stars(): „p < 0.001 ***“ oder „p = 0.045 *“. */
function pStars(p: number): string {
  if (Number.isNaN(p)) return 'p = NA';
  const stars = p <= 0.001 ? '***' : p <= 0.01 ? '**' : p <= 0.05 ? '*' : '';
  const text = p < 0.001 ? 'p < 0.001' : `p = ${cFixed(p, 3)}`;
  return stars ? `${text} ${stars}` : text;
}

/** `atlas %>% pearson_cor(x, y)`: kompakter Druck mit zweiseitigem p-Wert (t-Verteilung, n − 2 Freiheitsgrade). */
export function pearsonOutput(x: number[], y: number[], xName: string, yName: string): string {
  const pairs = x.map((v, i) => [v, y[i]] as const).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b)), n = pairs.length;
  let text: string;
  const xs = pairs.map(p => p[0]), ys = pairs.map(p => p[1]);
  if (n < 3) text = 'not computed (too few valid cases)';
  else if (new Set(xs).size < 2 || new Set(ys).size < 2) text = 'not computed (no variance)';
  else {
    const mx = mean(xs), my = mean(ys);
    const sxy = sum(xs.map((v, i) => (v - mx) * (ys[i] - my))), sxx = sum(xs.map(v => (v - mx) ** 2)), syy = sum(ys.map(v => (v - my) ** 2));
    const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy))), df = n - 2;
    const p = Math.abs(r) === 1 ? 0 : 2 * pt(-Math.abs(r * Math.sqrt(df / (1 - r * r))), df);
    text = `r = ${cFixed(r, 3)}, ${pStars(p)}`;
  }
  return [`Pearson Correlation: ${xName} x ${yName}`, `  ${text}, N = ${n}`, 'Use summary() for detailed output.'].join('\n');
}

// ---------- summarise() als Tibble 1 × 1 (pillar) ----------

function withinTolerance(x: number, y: number) {
  const l2x = Math.round(Math.log2(x)), l2y = Math.round(Math.log2(y));
  if (!(l2x === l2y)) return false;
  return x === y || Math.abs((x - y) * 2 ** -l2x) <= 2 * EPS;
}

/** pillar compute_rhs_digits(): Nachkommastellen für drei signifikante Stellen, ohne Nullen am Ende. */
function rhsDigits(x: number, sigfig: number) {
  if (x === Math.trunc(x)) return 0;
  const exp = x !== 0 && Number.isFinite(x) ? Math.floor(Math.log10(x)) : Infinity;
  if (exp > sigfig) return 0;
  let digits = sigfig - 1 - exp;
  while (digits > 0) {
    const val = x * 10 ** (digits - 1);
    if (!withinTolerance(val, roundHalfEven(val))) break;
    digits -= 1;
  }
  return digits;
}

/** pillar split_decimal() und format_mantissa() für einen Wert, dezimal oder wissenschaftlich. */
function pillarNumber(x: number, scientific: boolean): string {
  const sigfig = 3, neg = x < 0, absX = Math.abs(x);
  let mnt = absX, exp = 0;
  if (scientific && mnt !== 0) {
    const offset = Math.log1p(-5 * 10 ** (-sigfig - 1)) / Math.LN10;
    exp = Math.floor(Math.log10(mnt) - offset);
    mnt = 10 ** (Math.log10(mnt) - exp);
  }
  const minSigfig = mnt !== 0 ? Math.floor(Math.log10(mnt)) + 1 : sigfig;
  const rounded = signif(mnt, Math.max(sigfig, minSigfig)), rhsN = rhsDigits(mnt, sigfig);
  const lhs = Math.trunc(rounded), rhs = rounded - lhs;
  const dec = !(mnt === 0 || (rhs === 0 && withinTolerance(lhs * 10 ** exp, absX)));
  let rhsText = cFixed(Math.abs(roundHalfEven(rhs * 10 ** rhsN)), 0);
  if (rhsText === '0') rhsText = '';
  rhsText = '0'.repeat(Math.max(0, rhsN - rhsText.length)) + rhsText;
  const mantissa = (neg ? '-' : '') + cFixed(lhs, 0) + (dec ? '.' + rhsText : '');
  return scientific && mnt !== 0 ? `${mantissa}e${exp}` : mantissa;
}

/** pillar: dezimal, solange die Breite höchstens 13 Zeichen beträgt (pillar.max_dec_width), sonst wissenschaftlich. */
function pillarCell(x: number): string {
  if (Number.isNaN(x)) return 'NA'; // cov() mit weniger als zwei Fällen liefert NA
  if (!Number.isFinite(x)) return x > 0 ? 'Inf' : '-Inf';
  const decimal = pillarNumber(x, false);
  return width(decimal) > 13 ? pillarNumber(x, true) : decimal;
}

/** `atlas %>% summarise(name = cov(x, y))`: Druck des Tibbles 1 × 1 von dplyr (pillar, drei signifikante Stellen). */
export function covOutput(name: string, value: number): string {
  const cell = pillarCell(value), w = Math.max(width(name), 5, width(cell));
  return ['# A tibble: 1 × 1', `  ${pad(name, w, true)}`, `  ${pad('<dbl>', w, true)}`, `1 ${pad(cell, w, true)}`].join('\n');
}

// ---------- frequency() ----------

/** mariposa .fre_wrap(): Zeilen höchstens `w` Zeichen, wie strwrap(text, w + 1); überlange Wörter hart getrennt. */
function wrap(text: string, w: number): string[] {
  if (!text || width(text) <= w) return [text];
  const lines: string[] = [];
  let line: string[] = [], used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line.length && used + width(word) + 1 > w + 1) { lines.push(line.join(' ')); line = []; used = 0; }
    line.push(word);
    used += width(word) + 1;
  }
  if (line.length) lines.push(line.join(' '));
  return lines.flatMap(l => { const out: string[] = []; let rest = l; while (width(rest) > w) { out.push(rest.slice(0, w)); rest = rest.slice(w); } return [...out, rest]; });
}

type FreRow = { kind: 'cat' | 'sum'; value: string; label: string; n: string; raw: string; valid: string; cum: string };

/**
 * `atlas %>% frequency(name)` ohne Gewichte: Kopfzeile mit Variablenlabel, Kennwertzeile und Tabelle im
 * SPSS-Layout (Value, Label, N, Raw %, Valid %, Cum. %). `labels` sind die Wertelabels, `label` ist das Variablenlabel.
 */
export function frequencyOutput(values: (number | null)[], labels: Record<number, string>, name: string, label?: string): string {
  const x = valid(values), total = values.length, missing = total - x.length, pct = (v: number) => cFixed(v, 2);
  // Kennwertzeile: mean, sd, skewness nur, wenn sie existieren
  const parts = [`total N=${total}`, `valid N=${x.length}`], sd = Math.sqrt(variance(x));
  if (x.length > 0) parts.push(`mean=${cFixed(mean(x), 2)}`);
  if (x.length > 1) parts.push(`sd=${cFixed(sd, 2)}`);
  if (x.length > 2 && sd > 0) parts.push(`skewness=${cFixed(skewness(x), 2)}`);
  // Häufigkeiten der beobachteten Werte, aufsteigend
  const counts = new Map<number, number>();
  for (const v of x) counts.set(v, (counts.get(v) || 0) + 1);
  const keys = [...counts.keys()].sort((a, b) => a - b), rows: FreRow[] = [];
  let cum = 0, validRaw = 0;
  for (const k of keys) {
    const n = counts.get(k)!, raw = n / total * 100, validPct = n / x.length * 100;
    cum += validPct;
    validRaw += raw;
    rows.push({ kind: 'cat', value: rCharacter(k), label: labels[k] ?? '', n: String(n), raw: pct(raw), valid: pct(validPct), cum: pct(cum) });
  }
  const valid100 = x.length > 0 ? pct(100) : '';
  if (missing > 0) {
    const missRaw = missing / total * 100;
    if (x.length) rows.push({ kind: 'sum', value: 'Total valid', label: '', n: String(x.length), raw: pct(validRaw), valid: valid100, cum: '' });
    rows.push({ kind: 'cat', value: 'System', label: '', n: String(missing), raw: pct(missRaw), valid: '', cum: '' });
    rows.push({ kind: 'sum', value: 'Total', label: '', n: String(total), raw: pct(validRaw + missRaw), valid: '', cum: '' });
  } else rows.push({ kind: 'sum', value: 'Total', label: '', n: String(x.length), raw: pct(validRaw), valid: valid100, cum: '' });
  // Spalten und Breiten
  const showLabel = rows.some(r => r.label !== '');
  const cols = (['value', ...(showLabel ? ['label'] : []), 'n', 'raw', 'valid', 'cum'] as (keyof Omit<FreRow, 'kind'>)[]);
  const headers: Record<string, string> = { value: 'Value', label: 'Label', n: 'N', raw: 'Raw %', valid: 'Valid %', cum: 'Cum. %' };
  const catRows = rows.filter(r => r.kind === 'cat'), sumRows = rows.filter(r => r.kind === 'sum');
  const widths: Record<string, number> = Object.fromEntries(cols.map(c => [c, Math.max(width(headers[c]), ...(c === 'value' || c === 'label' ? catRows : rows).map(r => width(r[c])), 1)]));
  const span = showLabel ? 2 : 1, spanW = () => cols.slice(0, span).reduce((a, c) => a + widths[c], 0) + 3 * (span - 1);
  const widen = () => { const need = Math.max(...sumRows.map(r => width(r.value))); if (need > spanW()) widths[cols[span - 1]] += need - spanW(); };
  widen();
  const totalW = 1 + cols.reduce((a, c) => a + widths[c] + 3, 0);
  if (showLabel && totalW > WIDTH) { widths.label = Math.max(10, widths.label - (totalW - WIDTH)); widen(); }
  const left = (c: string) => c === 'label';
  const rule = '+' + cols.map(c => '-'.repeat(widths[c] + 2)).join('+') + '+';
  const cell = (s: string, w: number, l: boolean) => ` ${pad(s, w, !l)} `;
  const lines = [rule, '|' + cols.map(c => cell(headers[c], widths[c], left(c))).join('|') + '|', rule];
  let prev: FreRow['kind'] = 'cat';
  for (const r of rows) {
    if (r.kind === 'sum' || prev === 'sum') lines.push(rule);
    let first: string | null = r.kind === 'sum' ? cell(r.value, spanW(), true) : null;
    const rest = r.kind === 'sum' ? cols.slice(span) : cols, labelLines = showLabel && r.kind === 'cat' ? wrap(r.label, widths.label) : [''];
    labelLines.forEach((labelLine, k) => {
      const cells = rest.map(c => cell(c === 'label' ? labelLine : k === 0 ? r[c] : '', widths[c], left(c)));
      lines.push('|' + [...(first !== null ? [first] : []), ...cells].join('|') + '|');
      if (first !== null) first = cell('', spanW(), true);
    });
    prev = r.kind;
  }
  lines.push(rule, '');
  const title = label && label !== name ? `${name} (${label})` : name;
  return [...header('Frequency Analysis Results'), '', title, `# ${parts.join(' ')}`, '', ...lines].join('\n');
}
