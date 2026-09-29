import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readSav, type SavFile, type SavVariable } from './readSav';

const here = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

export function fixtureBuffer(name = 'sandbox-fixture.sav'): ArrayBuffer {
  const bytes = readFileSync(here(name));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
export const fixtureSav = (name?: string): SavFile => readSav(fixtureBuffer(name));
export const fixtureExpected = () => JSON.parse(readFileSync(here('sandbox-fixture.expected.json'), 'utf8'));

/** Kleiner handgebauter Datensatz für Rechentests. */
export function fakeSav(columns: Record<string, { values: number[]; labels?: Record<number, string>; missingFrom?: number; label?: string }>): SavFile {
  const variables: SavVariable[] = Object.entries(columns).map(([name, c]) => ({
    name, label: c.label ?? name, kind: 'numeric', values: Float64Array.from(c.values), strings: [],
    missing: { values: [], range: c.missingFrom === undefined ? null : [-Infinity, c.missingFrom] },
    valueLabels: new Map(Object.entries(c.labels ?? {}).map(([k, v]) => [Number(k), v])),
  }));
  const nCases = variables[0]?.values.length ?? 0;
  return { label: '', encoding: 'utf-8', nCases, variables, byName: new Map(variables.map(v => [v.name, v])) };
}
