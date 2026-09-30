/**
 * Die Regelsprache von mariposa::rec() (Referenzversion 0.7.4), soweit die
 * Rekodier-Werkstatt sie zeigt. Die erste passende Regel gewinnt; gültige Codes
 * ohne Regel werden NA; fehlende Werte bleiben fehlend, außer NA= oder else= erfasst sie.
 */
export type Code = { k: number | 'M'; label: string; f: number };
export type Rhs = number | 'NA' | 'copy';
export type Lhs = { else: true } | { na: true } | { items: [number, number][] };
export type Rule = { src: string; lhs: Lhs; rhs: Rhs; label: string | null };
export type Program = { kind: 'rev'; lo: number; hi: number; src: string } | { kind: 'rules'; rules: Rule[] };
export type Outcome =
  | { t: 'val'; v: number; label: string | null }
  | { t: 'miss' }
  | { t: 'na' }
  | { t: 'unm' };
export type Scale = { min: number; max: number };

export class RuleError extends Error {}

const NUM = '-?\\d+(?:[.,]\\d+)?';
const toNum = (t: string, s: Scale) => /^min$/i.test(t) ? s.min : /^max$/i.test(t) ? s.max : Number(t.replace(',', '.'));

/** Trennt an „;“ außerhalb eckiger Klammern, damit Labels Semikolons enthalten dürfen. */
export function splitRules(input: string): string[] {
  const out: string[] = [];
  let cur = '', depth = 0;
  for (const ch of input) {
    if (ch === '[') depth++;
    if (ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(x => x.trim()).filter(Boolean);
}

export function parseRules(input: string, scale: Scale): Program {
  const s = input.trim();
  if (!s) throw new RuleError('Gib eine Regel ein, zum Beispiel 1:2=1; 3:5=0.');
  if (/^rev$/i.test(s)) return { kind: 'rev', lo: scale.min, hi: scale.max, src: s };
  const revRange = s.match(new RegExp(`^rev\\s*\\(\\s*(${NUM})\\s*,\\s*(${NUM})\\s*\\)$`, 'i'));
  if (revRange) {
    const lo = toNum(revRange[1], scale), hi = toNum(revRange[2], scale);
    if (lo > hi) throw new RuleError(`Bei rev(lo, hi) kommt der kleinere Wert zuerst: rev(${revRange[2]}, ${revRange[1]}).`);
    return { kind: 'rev', lo, hi, src: s };
  }
  if (/^(dicho|mean|quart)\b/i.test(s)) throw new RuleError('Das kann rec(), die Werkstatt zeigt es noch nicht.');
  const rules: Rule[] = [];
  for (const part of splitRules(s)) {
    const m = part.match(/^(.+?)\s*=\s*([^[\s]+)\s*(?:\[(.*)\])?\s*$/);
    if (!m) throw new RuleError(`„${part}“ verstehe ich nicht. Erwartet wird alt=neu, zum Beispiel 1:2=1.`);
    const left = m[1].trim(), right = m[2].trim(), label = m[3] !== undefined ? m[3].trim() : null;
    if (!new RegExp(`^(${NUM}|na|copy)$`, 'i').test(right)) throw new RuleError(`„${right}“ ist kein gültiger neuer Wert. Erlaubt sind eine Zahl, NA oder copy.`);
    const rhs: Rhs = /^na$/i.test(right) ? 'NA' : /^copy$/i.test(right) ? 'copy' : toNum(right, scale);
    let lhs: Lhs;
    if (/^else$/i.test(left)) lhs = { else: true };
    else if (/^na$/i.test(left)) lhs = { na: true };
    else {
      lhs = {
        items: left.split(',').map(raw => {
          const it = raw.trim();
          const r = it.match(new RegExp(`^(${NUM}|min|max)(?:\\s*:\\s*(${NUM}|min|max))?$`, 'i'));
          if (!r) throw new RuleError(`„${it}“ ist weder ein Code noch ein Bereich.`);
          const lo = toNum(r[1], scale), hi = r[2] ? toNum(r[2], scale) : lo;
          if (lo > hi) throw new RuleError(`Bereiche bitte von klein nach groß schreiben: ${r[2]}:${r[1]}.`);
          return [lo, hi] as [number, number];
        }),
      };
    }
    rules.push({ src: part, lhs, rhs, label });
  }
  return { kind: 'rules', rules };
}

export function hits(rule: Rule, code: Code): boolean {
  if (code.k === 'M') return 'na' in rule.lhs || 'else' in rule.lhs;
  const k = code.k;
  return 'else' in rule.lhs || ('items' in rule.lhs && rule.lhs.items.some(([a, b]) => k >= a && k <= b));
}

function outcome(rule: Rule, code: Code): Outcome {
  if (rule.rhs === 'NA') return { t: 'na' };
  if (rule.rhs === 'copy') return code.k === 'M' ? { t: 'miss' } : { t: 'val', v: code.k, label: code.label };
  return { t: 'val', v: rule.rhs, label: rule.label };
}

export function apply(p: Program, code: Code): Outcome {
  if (p.kind === 'rev') return code.k === 'M' ? { t: 'miss' } : { t: 'val', v: p.lo + p.hi - code.k, label: code.label };
  for (const rule of p.rules) if (hits(rule, code)) return outcome(rule, code);
  return code.k === 'M' ? { t: 'miss' } : { t: 'unm' };
}

/** Der Weg einer Antwort durch die Regeln, für den Durchlauf „Vorgerechnet für eine Person“. */
export type TraceStep = { rule: number; src: string; hit: boolean; missingInRange: boolean };
export function trace(p: Program, code: Code): { checked: TraceStep[]; result: Outcome } {
  const result = apply(p, code);
  if (p.kind === 'rev') return { checked: [], result };
  const checked: TraceStep[] = [];
  for (let i = 0; i < p.rules.length; i++) {
    const rule = p.rules[i], hit = hits(rule, code);
    checked.push({ rule: i + 1, src: rule.src, hit, missingInRange: code.k === 'M' && 'items' in rule.lhs });
    if (hit) break;
  }
  return { checked, result };
}

export type Row = { key: string; code: string; label: string; f: number; bad?: boolean };
export type Mapping = {
  rows: Row[];
  /** Für jeden alten Code (gleiche Reihenfolge) der Schlüssel seiner Zeile rechts. */
  targets: string[];
  unmatched: Code[];
  captured: { code: Code; to: Extract<Outcome, { t: 'val' }> } | null;
  mean: number;
  nValid: number;
  binary: boolean;
};

export const outcomeKey = (o: Outcome) => o.t === 'val' ? `v${o.v}` : o.t;

/** Die ganze Häufigkeitstabelle vorher → nachher. */
export function recode(p: Program, codes: readonly Code[], fmt: (v: number) => string): Mapping {
  const outs = codes.map(c => apply(p, c));
  const labels = new Map<number, string>();
  outs.forEach(o => { if (o.t === 'val' && o.label && !labels.has(o.v)) labels.set(o.v, o.label); });
  const values = [...new Set(outs.flatMap(o => o.t === 'val' ? [o.v] : []))].sort((a, b) => a - b);
  const rows: Row[] = values.map(v => ({ key: `v${v}`, code: fmt(v), label: labels.get(v) ?? '', f: 0 }));
  if (outs.some(o => o.t === 'unm')) rows.push({ key: 'unm', code: 'NA', label: 'keine Regel', f: 0, bad: true });
  if (outs.some(o => o.t === 'na')) rows.push({ key: 'na', code: 'NA', label: 'gesetzt', f: 0 });
  if (outs.some(o => o.t === 'miss')) rows.push({ key: 'miss', code: 'NA', label: 'fehlend, bleibt', f: 0 });
  const targets = outs.map(outcomeKey);
  codes.forEach((c, i) => { rows.find(r => r.key === targets[i])!.f += c.f; });
  let sum = 0, nValid = 0;
  outs.forEach((o, i) => { if (o.t === 'val') { sum += o.v * codes[i].f; nValid += codes[i].f; } });
  const capIndex = codes.findIndex((c, i) => c.k === 'M' && outs[i].t === 'val');
  return {
    rows, targets,
    unmatched: codes.filter((_, i) => outs[i].t === 'unm'),
    captured: capIndex >= 0 ? { code: codes[capIndex], to: outs[capIndex] as Extract<Outcome, { t: 'val' }> } : null,
    mean: nValid ? sum / nValid : NaN,
    nValid,
    binary: values.length > 0 && values.every(v => v === 0 || v === 1),
  };
}
