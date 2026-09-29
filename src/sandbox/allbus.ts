import { isMissingCode, type SavFile, type SavVariable } from './readSav';
import type { Claim, ItemOption } from './claims';

export const ALLBUS_STUDY = 8831;
export const allbusSource = 'https://search.gesis.org/research_data/ZA8831';
export const allbusCodebook = 'https://access.gesis.org/dbk/78527';

export type AllbusCheck =
  | { ok: true; version: string; nCases: number }
  | { ok: false; message: string };

export function validateAllbus(sav: SavFile): AllbusCheck {
  const study = sav.byName.get('za_nr');
  const number = study && study.kind === 'numeric' ? study.values.find(x => !Number.isNaN(x)) : undefined;
  if (number !== ALLBUS_STUDY) {
    const found = number === undefined ? 'keine Studiennummer' : `Studiennummer ${number}`;
    return { ok: false, message: `Das ist nicht der ALLBUScompact 2023 (ZA8831), sondern eine Datei mit ${found}.` };
  }
  const version = sav.byName.get('version');
  return { ok: true, version: version?.kind === 'string' ? version.strings[0] ?? '' : '', nCases: sav.nCases };
}

export const missingVariables = (sav: SavFile, claim: Claim) => claim.requiredVariables.filter(v => !sav.byName.has(v));

function validCategories(variable: SavVariable) {
  return [...variable.valueLabels.entries()]
    .filter(([code]) => !isMissingCode(variable, code) && Number.isInteger(code))
    .sort((a, b) => a[0] - b[0])
    .map(([code, label]) => ({ code, label: `${code} ${label.toLocaleLowerCase('de')}` }));
}

/** Macht eine beliebige ALLBUS-Variable zum Item, wenn sie 2 bis 11 gelabelte gültige Kategorien hat. */
export function customItem(variable: SavVariable, role: Claim['itemRole']): ItemOption | null {
  if (variable.kind !== 'numeric') return null;
  const categories = validCategories(variable);
  if (categories.length < 2 || categories.length > 11) return null;
  return {
    variable: variable.name,
    title: variable.label || variable.name,
    question: `${variable.label || variable.name} (aus dem ALLBUS gewählt)`,
    categories,
    strict: [],
    wide: [],
    split: variable.valueLabels.has(-11),
    yes: role === 'outcome' ? 'ja' : 'ausgewählt',
    no: role === 'outcome' ? 'nein' : 'übrige',
  };
}

export function searchVariables(sav: SavFile, query: string, role: Claim['itemRole'], limit = 30): ItemOption[] {
  const q = query.trim().toLocaleLowerCase('de');
  if (q.length < 2) return [];
  const out: ItemOption[] = [];
  for (const v of sav.variables) {
    if (!v.name.toLocaleLowerCase('de').includes(q) && !v.label.toLocaleLowerCase('de').includes(q)) continue;
    const item = customItem(v, role);
    if (item) out.push(item);
    if (out.length === limit) break;
  }
  return out;
}

export function resolveItem(claim: Claim, sav: SavFile | null, variable: string): ItemOption {
  const known = claim.items.find(i => i.variable === variable);
  if (known) return known;
  const v = sav?.byName.get(variable);
  const custom = v ? customItem(v, claim.itemRole) : null;
  if (!custom) throw new Error(`${variable} ist als Item nicht verwendbar.`);
  return custom;
}
