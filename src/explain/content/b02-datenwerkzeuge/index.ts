// Bereich B2 „Datenwerkzeuge“. Begriffe (Spezifikation Ausbau, Abschnitt 6): codebook, labels, conversion, missing_tools, data_import, data_export, sorting.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
import type { AreaIndex } from '../../types';
import { labels, labelsTabs } from './labels';
import { conversion, conversionTabs } from './conversion';
import { missingTools, missingToolsTabs } from './missing-tools';
import { dataExport, dataExportTabs } from './data-export';
import { sorting, sortingTabs } from './sorting';
import { codebook, codebookTabs } from './codebook';
import { dataImport, dataImportTabs } from './data-import';

export const b02Datenwerkzeuge: AreaIndex = {
  explanations: {
    codebook: { kind: 'begriff', card: codebook },
    labels: { kind: 'tabelle', tool: labels },
    conversion: { kind: 'tabelle', tool: conversion },
    missing_tools: { kind: 'tabelle', tool: missingTools },
    data_import: { kind: 'begriff', card: dataImport },
    data_export: { kind: 'tabelle', tool: dataExport },
    sorting: { kind: 'tabelle', tool: sorting },
  },
  tabs: {
    codebook: codebookTabs,
    labels: labelsTabs,
    conversion: conversionTabs,
    missing_tools: missingToolsTabs,
    data_import: dataImportTabs,
    data_export: dataExportTabs,
    sorting: sortingTabs,
  },
};
