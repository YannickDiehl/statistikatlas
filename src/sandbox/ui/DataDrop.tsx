import { ExternalLink, Upload } from 'lucide-react';
import { useState } from 'react';
import { allbusSource, validateAllbus } from '../allbus';
import { readSav, SavError, type SavFile } from '../readSav';

export type LoadedData = { sav: SavFile; fileName: string; version: string };

export async function loadAllbusFile(file: { name: string; arrayBuffer: () => Promise<ArrayBuffer> }): Promise<LoadedData> {
  if (!/\.sav$/i.test(file.name)) throw new SavError('Bitte eine SPSS-Datei mit der Endung .sav wählen.');
  const sav = readSav(await file.arrayBuffer());
  const check = validateAllbus(sav);
  if (!check.ok) throw new SavError(check.message);
  return { sav, fileName: file.name, version: check.version };
}

export function DataDrop({ onLoaded }: { onLoaded: (data: LoadedData) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function take(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onLoaded(await loadAllbusFile(file));
    } catch (e) {
      setError(e instanceof SavError ? e.message : 'Die Datei konnte nicht gelesen werden.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="sandbox-drop-wrap" aria-labelledby="sandbox-drop-title">
    <label
      className={`sandbox-drop${over ? ' over' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); void take(e.dataTransfer.files[0]); }}
    >
      <Upload size={28} aria-hidden="true" />
      <strong id="sandbox-drop-title">{busy ? 'Datei wird gelesen …' : 'ALLBUS-Datei hierher ziehen oder auswählen'}</strong>
      <span>ZA8831_v1-3-0.sav · bleibt auf deinem Rechner</span>
      <input type="file" accept=".sav" onChange={e => void take(e.target.files?.[0])} />
    </label>
    {error && <p className="sandbox-error" role="alert">{error}</p>}
    <p className="sandbox-note">
      Noch keine Datei? Den ALLBUScompact 2023 (ZA8831) gibt es nach kostenloser Registrierung bei{' '}
      <a href={allbusSource} target="_blank" rel="noreferrer">GESIS <ExternalLink size={13} aria-hidden="true" /></a>.
      Die Sandbox liest die Datei nur in diesem Browser-Tab. Nichts wird hochgeladen oder gespeichert.
    </p>
  </section>;
}
