/**
 * Bild-Register aller Vorlagen: Schlüssel = `picture` einer Werkstatt, Begriffskarte, Formel als Satz oder eines
 * Tabellen-Werkzeugs. Die Pilotbilder stehen in ./pilot.tsx, jeder Bereich trägt seine Bilder in
 * ./<bereich>.tsx ein (über ./areas.ts eingelesen). Ein Schlüssel darf nur einmal vorkommen.
 */
import type { Picture } from './kit';
import { pilotPictures } from './pilot';
import { AREA_PICTURES } from './areas';

/** Führt Bildregister zusammen; ein Schlüssel darf nur einmal vorkommen. */
export function mergePictures(groups: Record<string, Record<string, Picture>>): Record<string, Picture> {
  const out: Record<string, Picture> = {}, owner: Record<string, string> = {};
  for (const [group, pictures] of Object.entries(groups)) for (const [key, picture] of Object.entries(pictures)) {
    if (owner[key]) throw new Error(`Bild „${key}“ ist doppelt vergeben: ${owner[key]} und ${group}.`);
    owner[key] = group; out[key] = picture;
  }
  return out;
}

export const PICTURES: Record<string, Picture> = mergePictures({ pilot: pilotPictures, ...AREA_PICTURES });

type DrawFor = { [P in Picture as P['kind']]: P['draw'] };

/** Zeichenfunktion eines Bildes, wenn der Schlüssel existiert und zur Vorlage passt; sonst null (dann kein Bild). */
export function pictureFor<K extends Picture['kind']>(key: string | undefined, kind: K): DrawFor[K] | null {
  const picture = key ? PICTURES[key] : undefined;
  return picture && picture.kind === kind ? (picture.draw as unknown as DrawFor[K]) : null;
}
