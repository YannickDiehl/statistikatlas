// Rechenbausteine der Detailansicht (B12): Addieren, Subtrahieren, Multiplizieren, Teilen, Quadrieren und die Quadratwurzel
// sind Schritte der Pilot-Werkstätten und bekommen Schrittkarten (`stepCards`) mit dem Reiter „Weiter“.
// Zählen (count.ts) und „Die Werte streuen“ (positive-sd.ts) sind kurze Begriffskarten.
import type { AreaIndex, ConceptTabs } from '../../types';

/** Schritte der Pilot-Werkstätten, in denen die Rechenbausteine vorkommen (src/explain/content/mittel.ts, streuung.ts, zusammenhang.ts). */
export const STEP_CARDS: NonNullable<AreaIndex['stepCards']> = {
  add: { workshop: 'mittel', variant: 'mean', step: 1 },
  divide: { workshop: 'mittel', variant: 'mean', step: 2 },
  subtract: { workshop: 'streuung', variant: 'sd', step: 2 },
  square: { workshop: 'streuung', variant: 'sd', step: 3 },
  sqrt: { workshop: 'streuung', variant: 'sd', step: 6 },
  multiply: { workshop: 'zusammenhang', variant: 'pearson', step: 3 },
};

/**
 * Reiter „Weiter“ für die sechs Schrittkarten, fertig geschrieben, aber noch nicht eingetragen: Eine Schrittkarte zeigt
 * in Ausführlich und Kompakt dasselbe, und render.test.ts verlangt für jeden Begriff mit Reitern, dass Kompakt kürzer ist.
 * Bis das Fundament Schrittkarten mit Reitern erlaubt, zeigt der Inspector für sie die bisherigen Bezüge
 * („Von hier aus weiter“), wie bei den Schrittkarten des Pilots. Der Bereichstest prüft Ton und Ziele dieser Sätze.
 */
export const STEP_TABS: Record<string, ConceptTabs> = {
  add: {
    next: {
      next: { id: 'sum', why: 'Die Summe aller Werte einer Reihe: zusammenzählen, bis jede Person einmal dabei ist.' },
      before: [{ id: 'series', why: 'Die Werte, die zusammengezählt werden.' }],
      after: [
        { id: 'ss', why: 'Zählt die quadrierten Abstände zur Mitte zusammen.' },
        { id: 'crossproduct_sum', why: 'Zählt die Abweichungsprodukte aller Personen zusammen.' },
      ],
      more: [{ id: 'chi_square', why: 'Auch χ² entsteht durch Zusammenzählen: der Beiträge aller Zellen.' }],
    },
  },
  subtract: {
    next: {
      next: { id: 'deviation', why: 'Wert minus Mittelwert: wie weit und auf welcher Seite eine Person liegt.' },
      before: [{ id: 'mean', why: 'Der Bezugspunkt, der abgezogen wird.' }],
      after: [
        { id: 'df', why: 'n − 1: Hier wird ein Freiheitsgrad abgezogen.' },
        { id: 'centering', why: 'Zieht von allen Werten denselben Mittelwert ab.' },
      ],
      more: [{ id: 'chi_square', why: 'Beobachtet minus erwartet, Zelle für Zelle.' }],
    },
  },
  multiply: {
    next: {
      next: { id: 'crossproduct', why: 'Die beiden Abweichungen einer Person malgenommen: ihr gemeinsamer Beitrag zum Zusammenhang.' },
      before: [{ id: 'deviation', why: 'Die Abweichungen, die malgenommen werden.' }],
      after: [
        { id: 'square', why: 'Eine Zahl mit sich selbst malnehmen.' },
        { id: 'sd_product', why: 'Die beiden Standardabweichungen malgenommen: der Nenner von r.' },
      ],
      more: [{ id: 'expected', why: 'Zeilensumme mal Spaltensumme, geteilt durch n: die erwartete Zellhäufigkeit.' }],
    },
  },
  divide: {
    next: {
      next: { id: 'mean', why: 'Die Summe gerecht auf alle n Personen verteilen.' },
      before: [
        { id: 'sum', why: 'Die Summe, die geteilt wird.' },
        { id: 'validn', why: 'n, durch das geteilt wird.' },
      ],
      after: [
        { id: 'variance', why: 'Die Quadratsumme geteilt durch n − 1.' },
        { id: 'pearson', why: 'Die Kovarianz geteilt durch das Produkt der Standardabweichungen.' },
      ],
      more: [
        { id: 'scaling', why: 'Alle Werte durch denselben Maßstab teilen.' },
        { id: 'positive_sd', why: 'Durch 0 lässt sich nicht teilen: Die Werte müssen streuen.' },
      ],
    },
  },
  square: {
    next: {
      next: { id: 'squared_deviation', why: 'Jede Abweichung quadriert: nie negativ, und große zählen stärker.' },
      before: [
        { id: 'multiply', why: 'Quadrieren heißt: mit sich selbst malnehmen.' },
        { id: 'deviation', why: 'Die Abweichungen, die quadriert werden.' },
      ],
      after: [{ id: 'ss', why: 'Die Summe aller quadrierten Abweichungen.' }],
      more: [{ id: 'chi_square', why: 'Auch dort wird jede Abweichung von der Erwartung quadriert.' }],
    },
  },
  sqrt: {
    next: {
      next: { id: 'sd', why: 'Die Wurzel der Varianz, wieder in der Einheit der Daten.' },
      before: [
        { id: 'variance', why: 'Die Varianz in quadrierten Einheiten, aus der die Wurzel gezogen wird.' },
        { id: 'square', why: 'Die Wurzel macht das Quadrieren rückgängig.' },
      ],
      after: [{ id: 'se', why: 'Teilt s durch die Wurzel aus n.' }],
      more: [{ id: 'z', why: 'Misst Abstände zur Mitte in Standardabweichungen.' }],
    },
  },
};

