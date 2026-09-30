import type { SavFile } from './readSav';

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
