export type SavMissing = { values: number[]; range: [number, number] | null };
export type SavVariable = {
  name: string; label: string; kind: 'numeric' | 'string';
  values: Float64Array; strings: string[];
  missing: SavMissing; valueLabels: Map<number, string>;
};
export type SavFile = { label: string; encoding: string; nCases: number; variables: SavVariable[]; byName: Map<string, SavVariable> };

export class SavError extends Error {}

const SYSMIS = -Number.MAX_VALUE;
const CODEPAGES: Record<number, string> = { 65001: 'utf-8', 1252: 'windows-1252', 28591: 'iso-8859-1', 1250: 'windows-1250' };

type RawVar = { width: number; nameBytes: Uint8Array; labelBytes: Uint8Array | null; nMissing: number; missing: number[] };
type LabelSet = { values: Uint8Array[]; labels: Uint8Array[]; slots: number[] };

export function readSav(buffer: ArrayBuffer): SavFile {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  if (bytes.length < 176) throw new SavError('Die Datei ist zu kurz für eine SPSS-Datei.');
  const magic = String.fromCharCode(...bytes.subarray(0, 4));
  if (magic === '$FL3') throw new SavError('Komprimierte ZSAV-Dateien werden nicht unterstützt. Bitte die normale .sav-Datei von GESIS verwenden.');
  if (magic !== '$FL2') throw new SavError('Das ist keine SPSS-Datei (.sav).');
  const layout = view.getInt32(64, true);
  const le = layout === 2 || layout === 3;
  let pos = 64;
  const i32 = () => { const v = view.getInt32(pos, le); pos += 4; return v; };
  const f64 = () => { const v = view.getFloat64(pos, le); pos += 8; return v; };
  const take = (n: number) => { const b = bytes.slice(pos, pos + n); pos += n; return b; };

  i32();
  i32();
  const compression = i32();
  i32();
  const headerCases = i32();
  const bias = f64();
  pos += 17;
  const fileLabel = take(64);
  pos += 3;
  if (compression === 2) throw new SavError('Komprimierte ZSAV-Dateien werden nicht unterstützt. Bitte die normale .sav-Datei von GESIS verwenden.');

  const raw: RawVar[] = [];
  const slots: number[] = [];
  const labelSets: LabelSet[] = [];
  const extensions = new Map<number, Uint8Array>();
  let characterCode = 0;

  for (;;) {
    if (pos + 4 > bytes.length) throw new SavError('Die Datei endet vor dem Datenteil.');
    const rec = i32();
    if (rec === 2) {
      const width = i32(); const hasLabel = i32(); const nMissing = i32();
      i32(); i32();
      const nameBytes = take(8);
      let labelBytes: Uint8Array | null = null;
      if (hasLabel === 1) { const len = i32(); labelBytes = take(len); pos += (4 - (len % 4)) % 4; }
      const missing: number[] = [];
      for (let k = 0; k < Math.abs(nMissing); k++) { if (width === 0) missing.push(f64()); else pos += 8; }
      if (width === -1) { slots.push(-1); continue; }
      slots.push(raw.length);
      raw.push({ width, nameBytes, labelBytes, nMissing, missing });
    } else if (rec === 3) {
      const count = i32();
      const set: LabelSet = { values: [], labels: [], slots: [] };
      for (let k = 0; k < count; k++) {
        set.values.push(take(8));
        const len = bytes[pos]; pos += 1;
        set.labels.push(take(len));
        pos += (8 - ((len + 1) % 8)) % 8;
      }
      if (i32() !== 4) throw new SavError('Wertelabels ohne Variablenzuordnung.');
      const nVars = i32();
      for (let k = 0; k < nVars; k++) set.slots.push(i32() - 1);
      labelSets.push(set);
    } else if (rec === 6) {
      pos += 80 * i32();
    } else if (rec === 7) {
      const subtype = i32(); const size = i32(); const count = i32();
      const data = take(size * count);
      extensions.set(subtype, data);
      if (subtype === 3 && size === 4 && count >= 8) characterCode = new DataView(data.buffer).getInt32(28, le);
    } else if (rec === 999) {
      i32();
      break;
    } else {
      throw new SavError(`Unbekannter Datensatztyp ${rec} an Byte ${pos - 4}.`);
    }
  }

  const encodingName = extensions.has(20)
    ? String.fromCharCode(...extensions.get(20)!).trim().toLowerCase()
    : CODEPAGES[characterCode] ?? 'windows-1252';
  let decoder: TextDecoder;
  try { decoder = new TextDecoder(encodingName); } catch { decoder = new TextDecoder('windows-1252'); }
  const text = (b: Uint8Array) => decoder.decode(b).replace(/[\s\u0000]+$/, '');

  const longNames = new Map<string, string>();
  if (extensions.has(13)) {
    for (const pair of decoder.decode(extensions.get(13)!).split('\t')) {
      const eq = pair.indexOf('=');
      if (eq > 0) longNames.set(pair.slice(0, eq), pair.slice(eq + 1).replace(/\u0000+$/, ''));
    }
  }

  const values: number[][] = raw.map(() => []);
  const strings: string[][] = raw.map(() => []);
  const plan = slots.map((v, j) => {
    if (v >= 0) return { v, first: true };
    let k = j; while (slots[k] < 0) k--;
    return { v: slots[k], first: false };
  });
  const nSlots = slots.length;
  let cmd = new Uint8Array(8), ci = 8, eof = false;

  const nextSlot = (): number | Uint8Array | null => {
    if (compression === 0) {
      if (pos + 8 > bytes.length) return null;
      return take(8);
    }
    for (;;) {
      if (ci === 8) {
        if (pos + 8 > bytes.length) return null;
        cmd = take(8); ci = 0;
      }
      const c = cmd[ci++];
      if (c === 0) continue;
      if (c === 252) { eof = true; return null; }
      if (c === 253) { if (pos + 8 > bytes.length) return null; return take(8); }
      if (c === 254) return new Uint8Array(8).fill(32);
      if (c === 255) return NaN;
      return c - bias;
    }
  };

  const caseBytes = raw.map(r => new Uint8Array(Math.ceil(Math.max(r.width, 1) / 8) * 8));
  let nCases = 0;
  outer: while (!eof && (headerCases < 0 || nCases < headerCases)) {
    const offsets = new Array<number>(raw.length).fill(0);
    for (let j = 0; j < nSlots; j++) {
      const slot = nextSlot();
      if (slot === null) { if (j === 0) break outer; throw new SavError('Die Datei endet mitten in einem Fall.'); }
      const { v } = plan[j];
      if (raw[v].width === 0) {
        let x: number;
        if (typeof slot === 'number') x = slot;
        else x = new DataView(slot.buffer, slot.byteOffset, 8).getFloat64(0, le);
        values[v].push(x === SYSMIS ? NaN : x);
      } else {
        const chunk = typeof slot === 'number' ? new Uint8Array(8).fill(32) : slot;
        caseBytes[v].set(chunk, offsets[v]); offsets[v] += 8;
        if (j + 1 === nSlots || plan[j + 1].first || plan[j + 1].v !== v) strings[v].push(text(caseBytes[v].subarray(0, offsets[v])).trimEnd());
      }
    }
    nCases++;
  }

  const variables: SavVariable[] = raw.map((r, i) => {
    const shortName = text(r.nameBytes).trim();
    const missing: SavMissing = { values: [], range: null };
    if (r.nMissing > 0) missing.values = r.missing;
    if (r.nMissing <= -2) missing.range = [r.missing[0] <= -1e300 ? -Infinity : r.missing[0], r.missing[1] >= 1e300 ? Infinity : r.missing[1]];
    if (r.nMissing === -3) missing.values = [r.missing[2]];
    return {
      name: longNames.get(shortName) ?? shortName,
      label: r.labelBytes ? text(r.labelBytes) : '',
      kind: r.width === 0 ? 'numeric' : 'string',
      values: Float64Array.from(values[i]),
      strings: strings[i],
      missing,
      valueLabels: new Map(),
    };
  });

  for (const set of labelSets) {
    for (const slot of set.slots) {
      const v = slots[slot];
      if (v === undefined || v < 0 || raw[v].width !== 0) continue;
      set.values.forEach((b, k) => variables[v].valueLabels.set(new DataView(b.buffer).getFloat64(0, le), text(set.labels[k])));
    }
  }

  return { label: text(fileLabel).trim(), encoding: encodingName, nCases, variables, byName: new Map(variables.map(v => [v.name, v])) };
}

export function isMissingCode(variable: SavVariable, x: number): boolean {
  if (Number.isNaN(x)) return true;
  if (variable.missing.values.includes(x)) return true;
  const r = variable.missing.range;
  return r !== null && x >= r[0] && x <= r[1];
}
