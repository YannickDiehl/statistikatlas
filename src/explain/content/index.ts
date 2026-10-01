/**
 * Alle Bereiche der Erklärungen. Die Zuordnung (src/explain/registry.ts) liest sie automatisch ein;
 * ein Begriff darf nur in einem Bereich vorkommen, sonst wirft das Laden einen Fehler.
 * `muster` enthält die Muster der Vorlagen Begriffskarte (`p_value`) und Tabellen-Werkzeug (`dummy`).
 */
import type { AreaIndex } from '../types';
import { muster } from './muster';
import { b01Messen } from './b01-messen';
import { b02Datenwerkzeuge } from './b02-datenwerkzeuge';
import { b03Lage } from './b03-lage';
import { b04Umformen } from './b04-umformen';
import { b05Zusammenhang } from './b05-zusammenhang';
import { b06Wahrscheinlichkeit } from './b06-wahrscheinlichkeit';
import { b07Verteilungen } from './b07-verteilungen';
import { b08Schaetzen } from './b08-schaetzen';
import { b09Testlogik } from './b09-testlogik';
import { b10Mittelwerte } from './b10-mittelwerte';
import { b11Rangtests } from './b11-rangtests';
import { b12KategorialDesign } from './b12-kategorial-design';
import { b13Regression } from './b13-regression';
import { b14Faktoren } from './b14-faktoren';

export const AREAS: Record<string, AreaIndex> = {
  muster,
  b01: b01Messen,
  b02: b02Datenwerkzeuge,
  b03: b03Lage,
  b04: b04Umformen,
  b05: b05Zusammenhang,
  b06: b06Wahrscheinlichkeit,
  b07: b07Verteilungen,
  b08: b08Schaetzen,
  b09: b09Testlogik,
  b10: b10Mittelwerte,
  b11: b11Rangtests,
  b12: b12KategorialDesign,
  b13: b13Regression,
  b14: b14Faktoren,
};
