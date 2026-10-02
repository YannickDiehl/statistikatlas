# Freie Karte: Formelwerkstatt (Pilot) – Implementation Plan

> **For agentic workers:** Dieser Plan wurde in der Nacht vom 30. September auf den 1. Oktober 2026 in einem Durchgang umgesetzt (Zweig `formelwerkstatt-prototype`) und danach von vier unabhängigen Prüfagenten (Spezifikation, Code und Barrierefreiheit, Fachlichkeit und Sprache, Browser-Randfälle) begutachtet. Die Häkchen dokumentieren den Stand; für den Ausbau siehe Abschnitt „Ausbau“.

**Goal:** Die freie Karte erklärt Mittelwert, Varianz/Standardabweichung, Kovarianz/Pearson als Formelwerkstatt (Stufe 1), den Standardfehler als „Formel als Satz“ (Stufe 2) und Rekodieren als „Werkzeug“ (Stufe 3); Rechenbegriffe dieser Formeln bekommen Schrittkarten.

**Architecture:** Inhalte sind reines TypeScript in `src/explain/` (ohne React, in Node testbar): Inhaltsmodell, Rechnen, rec()-Regelsprache, Zuordnung Begriff → Erklärung, Speicher des Umschalters. Die Oberfläche in `src/components/explain/` rendert diese Inhalte; `ConceptInspector`/`PackageInspector` fragen `explainFor()`/`stepCardFor()` und fallen sonst auf die bisherige Darstellung zurück.

**Tech Stack:** React 19, TypeScript (strict), Vite 8, node:test mit tsx, `renderToStaticMarkup` für Rendertests, headless Chrome (Playwright) für Browserprüfungen.

**Spec:** `docs/entwicklung/spezifikationen/2026-09-30-freie-karte-formelwerkstatt-pilot-design.md` und die Inhaltsdateien `docs/entwicklung/spezifikationen/2026-09-30-freie-karte-formelwerkstatt/01–05`.

## Global Constraints

- Fachbegriff in der Lernkarte = Titel des verlinkten Begriffs in `concepts.ts`; jede Erklärung hat ein „Kurz gesagt“ (höchstens zwei Sätze).
- Kein „·“ als Trennzeichen neben Mathematik; „·“ nur als Malzeichen. Schrittknöpfe: „Schritt n“ klein über dem Zeichen.
- Zahlen deutsch mit echtem Minus „−“, höchstens zwei Nachkommastellen, Rundung nur zur Anzeige; Kontrollfragen mit Toleranz 0,011.
- Umschalter „Kompakt / Ausführlich“, Standard Ausführlich, `localStorage` `statistikatlas.erklaerung.v1`, jeder Zugriff in `try/catch`.
- Ausführlich verbreitert den Inspector: ab 1280 px `min(720px, 55vw)`, 1101–1279 px 560 px; darunter unverändert.
- mariposa-Referenzversion 0.7.4; R-Code im Lernpfad-Stil (`read_spss()`, `rec()` in `mutate()`, Pipe, `frequency()`).
- Keine ALLBUS-Mikrodaten im Atlas; nur aggregierte Zahlen von `pa02a`.
- Nicht verändern: `src/tasks/`, `curriculum.ts`.

---

### Task 1: Rechnen, Formatierung, Regelsprache — erledigt (8e49f5d)

**Files:** Create `src/explain/format.ts`, `math.ts`, `rules.ts`; Test `src/explain/math.test.ts`, `rules.test.ts`.

**Interfaces (Produces):** `num(v, digits=2)`, `signed`, `paren`, `pct`, `count`, `parseAnswer(input): number | 'NA' | null`, `close(a, b, tol=0.011)`; `describe(xs): Describe`, `relate(xs, ys): Relate` (r = null bei Streuung 0), `series`, `pairStats`, `standardError(s, n)`; `parseRules(input, scale): Program` (wirft `RuleError`), `apply`, `trace`, `recode(p, codes, fmt): Mapping`.

- [x] Referenzwerte aus R als Tests: Gruppe B s ≈ 3,1623, Gruppe A ≈ 0,7071, E auf 10 → 3,4928; Zusammenhang Produkte 4, −1, 0, 2, 0, Kovarianz 1,25, r = 0,5 / −0,5 / 0; Abgleich mit `calculateStatistics()`.
- [x] rec()-Referenzfälle mit mariposa 0.7.4 auf ZA8831: `rev`, `rev(1, 5)`, Dichotomisieren, Liste `1,2=1`, `else=0` (3.177 inkl. 21 fehlender), Lücke (NA 2.324); erste passende Regel gewinnt; Fehlertexte.

### Task 2: Inhalte, Zuordnung, Umschalter-Speicher — erledigt (8e49f5d)

**Files:** Create `src/explain/types.ts`, `registry.ts`, `mode.ts`, `content/{mittel,streuung,zusammenhang,standardfehler,rekodieren}.ts`; Test `src/explain/content.test.ts`.

**Interfaces (Produces):** `Workshop<D, S>` mit `variants[conceptId]` (lastStep, kurz, fachlich, symbolic, aria, metrics, interpret, genau), `steps: Step<S>[]` (button, sym, concept, also, kurz, fachlich, perPerson, vorgerechnet, alltag, warum, fehler, check), `table`, `captions`, `think`; `SentenceTemplate`; `rekodieren` (Typ `RecodeTemplate`); `explainFor(id)`, `stepCardFor(id, anchor?)`, `requestStep(concept, step)`, `takeStep(concept)`; `createModeStore(storage)`, `modeStore`.

- [x] Test: alle Texte für alle Voreinstellungen × Begriffe × Personen ohne NaN/undefined, ohne Mittelpunkt-Trenner, „Kurz gesagt“ ≤ 2 Sätze, richtige Antwort ohne Diagnose.
- [x] Test: Fachbegriffe = Kartentitel; typische Fehlantworten lösen ihre Diagnose aus (−16, 8, 40, 10, 25, 6,25; Vorzeichenregel, Beträge, n statt n − 1, Summe statt Produkt, Varianzen im Nenner; SE 0,01/10/1; rec alter Code).
- [x] Test: Zuordnung inklusive `contextAnchor` und Schritt-Sprung; Umschalter-Speicher inklusive gesperrtem Speicher.

### Task 3: Oberfläche — erledigt (fc15e8d, ec73e35)

**Files:** Create `src/components/explain/{basics,pieces,pictures,Formelwerkstatt,FormelAlsSatz,Werkzeug}.tsx`, `src/explain.css`; Test `src/explain/render.test.ts`.

- [x] `FormulaView` (Formelknoten, gekoppelte Hervorhebung, `role="img"` mit vorlesbarer Fassung), `GlyphLegend`, `StepNav`, `LearnCard` (auch Schrittkarte), `WorkTable`, `CheckQuestion` (Meldung am Feld, `aria-live`), `ThinkQuestions`, `Genau`, `ModeToggle`/`useExplainMode` (useSyncExternalStore).
- [x] Bilder: `NumberLine` (Mittel mit Wippe, Streuung mit Band x̄ ± s), `Squares`, `Rectangles` (Streudiagramm, Plus-/Minusrechtecke, Waagebalken, typisches und größtmögliches Rechteck); Punkte ziehbar und per Pfeiltasten.
- [x] Rendertest: alle Blöcke in Ausführlich, reduziert in Kompakt; Schrittkarten; Stufe 2 und 3.

### Task 4: Einbau in Inspector, App, Lernpfad — erledigt (fc15e8d, ec73e35)

**Files:** Modify `src/components/ConceptInspector.tsx`, `PackageInspector.tsx`, `src/App.tsx` (Klasse `explain-wide`, Kopfzeilentext entfernt), `src/components/NetworkMap.tsx` (`inspectorOffset()` misst die echte Breite), `src/components/LearningPath.tsx` (Eyebrow, Einleitung, Dateistatus entfernt), `src/domain/mariposaCatalog.ts` (Notiz zu `recode`), `src/main.tsx`, `package.json` (Testmuster), `src/domain/curriculum.test.ts`.

- [x] Pilotbegriffe: Eyebrow „Formelwerkstatt“, Werkstatt statt Einleitung/`Formula`/`CalculationSteps`/Tiefen-Aufklapper, danach „Mit dem Lehrdatensatz (200 Befragte)“ mit den bisherigen Abschnitten.
- [x] `se`/`recode`: Vorlage statt Einleitung, `LinkedFormula`, `CalculationSteps`, `PrincipleLab`, „Was sagt das Ergebnis?“.
- [x] Browser (headless Chrome, 45 Prüfpunkte, `scratchpad/flows.cjs`): Schritte, Kontrollfragen richtig/falsch/leer, Tastatur, Denkfragen mit „Ausprobieren“, Kompakt/Ausführlich mit Breiten 720/408, Schrittkarte hin und zurück, Pearson-Bilder 3–6, gekrümmt r = 0, Mittel mit Wippe, Varianz mit 5 Schritten, SE-Regler, rec-Warnungen und Fehlertexte, 1200/1000/390 px, Lernpfad ohne gestrichene Texte; keine Konsolenfehler.

### Task 5: Prüfung durch unabhängige Agenten und Korrekturen

- [x] Befunde der vier Prüfagenten eingearbeitet (b99cac6): Wortlaut Statistik (n − 1, SE-Deutung, „durchschnittliche Fläche“, symmetrisches U …), rec()-Parität mit mariposa 0.7.4 (Komma nur als Liste, rev(lo < hi), leere Labels, „;“, Warnung außerhalb der Skala, NA= ohne Warnung, R-String maskiert, library(dplyr)), Antwort-Lesarten („+2“, „3.162“), typisierte Werkstätten, Schritt-Sprung per Effekt, Rückmeldung bei neuen Daten zurückgesetzt, Fokus und Live-Bereiche, Zeichnungen mit gemessener Breite, Kartenhinweise und Kamera beim Umschalten, Container-Abfragen, Datei-Wechsel im Aufgabenbereich.
- [x] README und Prüfstand ergänzt; Zusammenführung mit `main` nach der Nachprüfung.

## Prüfen

```bash
node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts src/explain/*.test.ts
node --import tsx scripts/generate-map-layout.ts && node_modules/.bin/tsc --noEmit && node_modules/.bin/vite build && node scripts/export-offline.mjs
```

## Ausbau: eine weitere Formel aufnehmen

1. **Stufe 1 (Formelwerkstatt):** `src/explain/content/<name>.ts` nach dem Muster von `zusammenhang.ts` anlegen: Beispieldaten und `compute`, Zeichen, Schritte (je Schritt `concept` = Kartenbegriff, Kurz gesagt, Fachlich, Vorgerechnet, Alltag, Warum, Fehler, Kontrollfrage mit Diagnosen), eingesetzte Formel, Tabelle, Bildunterschriften, Denkfragen, `variants` je Begriff. In `registry.ts` in `WORKSHOPS` eintragen, Schrittkarten in `stepCardFor()`. Braucht die Werkstatt ein neues Bild, in `pictures.tsx` ergänzen und in `Formelwerkstatt.tsx` nach `w.id` wählen. `content.test.ts` prüft Texte und Diagnosen automatisch mit; Referenzwerte vorab in R nachrechnen und als Test festhalten.
2. **Stufe 2 (Formel als Satz):** eine `SentenceTemplate` nach `standardfehler.ts`; `explainFor()` so erweitern, dass sie nach Begriffs-ID eine Liste von Vorlagen durchsucht (im Pilot gibt es genau eine).
3. **Stufe 3 (Werkzeug):** Werkzeuge unterscheiden sich stark; für jedes eine eigene Inhaltsdatei und, falls die Regelsprache neu ist, einen eigenen Parser mit Referenzfällen aus R.
