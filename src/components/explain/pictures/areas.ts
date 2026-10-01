// Bilder aller Bereiche, je Bereich eine Datei. Formelwerkstatt.tsx führt sie mit den Pilotbildern zu `PICTURES` zusammen.
import type { Picture } from './kit';
import { pictures as b01 } from './b01-messen';
import { pictures as b02 } from './b02-datenwerkzeuge';
import { pictures as b03 } from './b03-lage';
import { pictures as b04 } from './b04-umformen';
import { pictures as b05 } from './b05-zusammenhang';
import { pictures as b06 } from './b06-wahrscheinlichkeit';
import { pictures as b07 } from './b07-verteilungen';
import { pictures as b08 } from './b08-schaetzen';
import { pictures as b09 } from './b09-testlogik';
import { pictures as b10 } from './b10-mittelwerte';
import { pictures as b11 } from './b11-rangtests';
import { pictures as b12 } from './b12-kategorial-design';
import { pictures as b13 } from './b13-regression';
import { pictures as b14 } from './b14-faktoren';

export const AREA_PICTURES: Record<string, Record<string, Picture>> = {
  b01,
  b02,
  b03,
  b04,
  b05,
  b06,
  b07,
  b08,
  b09,
  b10,
  b11,
  b12,
  b13,
  b14,
};
