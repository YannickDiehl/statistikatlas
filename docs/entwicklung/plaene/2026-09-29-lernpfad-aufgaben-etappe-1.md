# Lernpfad-Aufgaben, Etappe 1: Grundlage und Sitzungen 1–3 – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Lernpfad zeigt je Sitzung eine eigene Aufgabe; gebaut werden die Grundlage (Register, Aufgabenrahmen, Hilfsbausteine) und die Aufgaben der Sitzungen 1–3.

**Architecture:** Neues Modul `src/tasks/` mit einem Register `TaskId → TaskDef`. `LearningPath.tsx` rendert über `TaskHost` die Aufgabe der Sitzung (Datei laden, Variablen prüfen, Zustand wiederherstellen). Jede Aufgabe hat reine Prüflogik (`domain.ts`, getestet), Inhalte (`content.ts`) und eine eigene Oberfläche; gemeinsam sind nur Hilfsbausteine in `src/tasks/kit/`. Sitzung 4 behält vorerst die Mission „Belege es!“.

**Tech Stack:** React 19, TypeScript 7, Vite 8, `node --test` mit `tsx`, `react-dom/server` für Rendertests, R 4 mit mariposa 0.7.3 und haven für Testdatei und Skriptprüfung.

**Spec:** `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md` (Abschnitte 4.1–4.3, 5–9). Konzepte mit Rollenauftrag und Referenzwerten: `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-aufgaben/sitzung-01.md` … `sitzung-03.md`.

**Entstehung:** Der gesamte Code dieses Plans wurde vorab in einer Kopie des Repositorys Task für Task gebaut und geprüft (153 Tests grün, Typprüfung, Produktions- und Offline-Build, Echtdaten-Test mit ZA8831 v1.3.0, Lösungsskripte in R 3/3, Browserdurchlauf mit echter Datei). Die Code-Blöcke sind der geprüfte Endstand.

## Global Constraints

- Arbeitszweig: `sandbox-belege-es` im Repository `Kartenkonzept/Statistikatlas-Prototyp`; nach jedem Task ein Commit.
- `pnpm` steht in dieser Shell nicht im PATH: Befehle mit `node_modules/.bin/…` bzw. `node --import tsx …` ausführen (siehe Befehle in den Tasks).
- Keine ALLBUS-Mikrodaten im Repository, im Build oder im Browser-Speicher; nur aggregierte Referenzwerte in Tests und Doku. Die Testdatei ist synthetisch (n = 60).
- Gespeichert werden nur Entscheidungen und Texte, Schlüssel `statistikatlas.aufgaben.v1`; der alte Schlüssel `statistikatlas.missionen.v1` bleibt für die Mission in Sitzung 4.
- R-Code für Studierende im mariposa-Stil: `read_spss()`, `rec()` in `mutate()`, Analysen gepiped; keine `ifelse()`/`%in%`-Umkodierung. Sitzung 1 ohne Pipe, ab Sitzung 2 `library(dplyr)`.
- Sitzungen 1–3 rechnen ungewichtet. Quartile wie mariposa `describe()`: SPSS Typ 6; Schiefe SPSS Typ 2.
- Hilfe immer vierstufig: Denkanstoß → Verweis (Atlas-Karte, R-Workshop) → Gerüst mit `___` → vollständiger Code. Keine Punkte, keine Musterlösung für Entscheidungen.
- Alle Personen, Büros, Institute und Ausstellungen sind erfunden und als fiktiv gekennzeichnet. Kategorienfarben sind neutral, keine Parteifarben.
- Texte auf Deutsch, Code-Bezeichner auf Englisch wie im bestehenden Code.

## File Structure

| Datei | Verantwortung |
|---|---|
| `scripts/make-sandbox-fixture.R` | synthetische Testdatei, erweitert um die Variablen der Sitzungen 1–3 |
| `src/tasks/types.ts` | `TaskId`, `TaskDef`, `TaskProps`, `TaskStatus` |
| `src/tasks/kit/*` | Hilfsbausteine: Zahlen lesen, Speicherung, Hilfeleiter, R-Block, Plenumskarte, Partnerschalter, Rückmeldung, Rollenauftrag |
| `src/tasks/registry.ts` | alle gebauten Aufgaben |
| `src/tasks/TaskHost.tsx` | Datei laden → Variablen prüfen → Aufgabe mit wiederhergestelltem Zustand |
| `src/tasks/testRender.ts` | Render-Hilfe für Tests (Lernpfad mit Testdatei) |
| `src/tasks/s01-schon-gefragt/` | Sitzung 1: `content.ts`, `domain.ts`, `SchonGefragt.tsx`, `index.ts`, Tests |
| `src/tasks/s02-datenerfassung/` | Sitzung 2: `content.ts`, `domain.ts`, `PaperSheet.tsx`, `Datenerfassung.tsx`, `index.ts`, Tests |
| `src/tasks/s03-stuehle/` | Sitzung 3: `content.ts`, `domain.ts`, `Charts.tsx`, `Stuehle.tsx`, `index.ts`, Tests |
| `src/tasks/allbus.local.test.ts` | Referenzwerte mit echter Datei (nur mit `ALLBUS_SAV`) |
| `src/tasks.css` | Styles der Hilfsbausteine und der drei Aufgaben |
| `src/domain/curriculum.ts` | `Session.task` statt `mission: 'setup' …`; `setupScript` entfällt |
| `src/components/LearningPath.tsx` | rendert Aufgabe oder (Sitzung 4) Mission; Status „Aufgabe offen/läuft/abgeschlossen“ |
| `scripts/export-task-scripts.ts`, `scripts/verify-task-scripts.R` | Lösungsskripte in R ausführen |

---

### Task 1: Testdatei um die Variablen der Sitzungen 1–3 erweitern

**Files:**
- Modify: `scripts/make-sandbox-fixture.R` (Block vor `write_sav(…)` einfügen)
- Regenerate: `src/sandbox/fixtures/sandbox-fixture.sav`, `sandbox-fixture-uncompressed.sav`, `sandbox-fixture.expected.json`
- Modify: `src/sandbox/allbus.test.ts:38`

**Interfaces:**
- Produces: Testdatei mit `pv01` (alle echten Labels), `mode`, `splt23_1`, `rh08b`, `mi05`, `mp16`–`mp19`, `st01`, `li04`, `dp03`, `xs01`, `pa01`, `ls01`, `work`, `dw15` – Labels und Missing-Codes wie im echten ALLBUS, Werte synthetisch. Neue Ziehungen stehen hinter allen bisherigen, damit bestehende Werte gleich bleiben.

- [ ] **Step 1: Block einfügen.** In `scripts/make-sandbox-fixture.R` direkt nach der Zeile `d$kommentar <- sample(…)` und vor `write_sav(d, file.path(out, "sandbox-fixture.sav"), compress = "byte")` einfügen:

```r
# Lernpfad-Aufgaben 1–3: Variablen mit den Labels und Missing-Codes des echten ALLBUS (Werte synthetisch).
# Neue Zufallsziehungen stehen hinter allen bisherigen, damit deren Werte gleich bleiben.
scale_labels <- function(from, to, first, last) setNames(from:to, c(first, rep("..", to - from - 1), last))
d$pv01 <- labelled_spss(as.numeric(d$pv01), label = "BEFR.: WAHLABSICHT BUNDESTAGSWAHL", na_range = miss,
  labels = c("NICHT WAHLBERECHTIGT" = -50, "DATENFEHLER: MFN" = -42, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, "VERWEIGERT" = -7,
             "CDU-CSU" = 1, "SPD" = 2, "FDP" = 3, "DIE GRUENEN" = 4, "DIE LINKE" = 6, "AFD" = 42, "ANDERE PARTEI" = 90, "WUERDE NICHT WAEHLEN" = 91))
d$mode <- labelled(pick(2:4, c(.4, .3, .3)), c("PAPI" = 1, "CAPI" = 2, "CAWI" = 3, "MAIL" = 4), label = "ERHEBUNGSMODUS DER ALLBUS-HAUPTBEFRAGUNG")
d$splt23_1 <- lab(ifelse(d$mode == 2, -15, pick(1:2, c(.5, .5))), c("TNZ: MODE" = -15, "SPLIT A" = 1, "SPLIT B" = 2), "FRAGEBOGENSPLIT 2023: FRABO-ERWEITERUNG")
d$rh08b <- lab(pick(c(1:3, -6, -9), c(.1, .3, .5, .07, .03)), c("KEINE ANGABE" = -9, "KENNE ICH NICHT" = -6, "VIEL" = 1, "ETWAS" = 2, "GAR NICHTS" = 3), "HALTE VON: ASTROLOGIE, HOROSKOPE")
d$mi05 <- lab(pick(c(1:3, -11, -8), c(.2, .35, .1, .3, .05)), c("TNZ: SPLIT" = -11, "WEISS NICHT" = -8, "UNEINGESCHRAENKT" = 1, "ZUZUG BEGRENZEN" = 2, "GANZ UNTERBINDEN" = 3), "ZUZUG VON: KRIEGSFLUECHTLINGEN")
for (v in c("mp16", "mp17", "mp18", "mp19")) {
  d[[v]] <- lab(pick(c(1:5, -11), c(rep(.14, 5), .3)), c("TNZ: SPLIT" = -11, "RISIKO UEBERWIEGT" = 1, "EHER RISIKO" = 2, "WEDER NOCH" = 3, "EHER CHANCE" = 4, "CHANCE UEBERWIEGT" = 5),
                paste("FLUECHTL. CHANCE O.RISIKO:", c(mp16 = "SOZIALSTAAT", mp17 = "SICHERHEIT", mp18 = "ZUSAMMENLEB", mp19 = "WIRTSCHAFT")[[v]]))
}
d$st01 <- lab(ifelse(d$splt23_1 == 1, -11, pick(c(1:4, -8, -9, -42), c(.3, .35, .25, .02, .03, .02, .03))),
              c("DATENFEHLER: MFN" = -42, "TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8,
                "MAN KANN TRAUEN" = 1, "MUSS VORSICHTIG SEIN" = 2, "KOMMT DARAUF AN" = 3, "SONSTIGES" = 4), "VERTRAUEN ZU MITMENSCHEN")
d$li04 <- lab(pick(1:7, NULL), scale_labels(1, 7, "1 - UNWICHTIG", "7 - SEHR WICHTIG"), "WICHTIGKEIT: FREUNDE UND BEKANNTE")
d$dp03 <- lab(pick(c(1, 2, -10), c(.4, .1, .5)), c("TNZ: FILTER" = -10, "KEINE ANGABE" = -9, "JA" = 1, "NEIN" = 2), "LEBENSPARTNER: GEMEINSAMER HAUSHALT?")
d$xs01 <- lab(pick(c(0, 1, -9), c(.3, .65, .05)), c("KEINE ANGABE" = -9, "NEIN" = 0, "JA" = 1), "INTERVIEW: ALLEINE DURCHGEFUEHRT")
d$pa01 <- lab(ifelse(d$mode == 4 & runif(n) < .15, -42, pick(c(1:10, -9), c(rep(.095, 10), .05))),
              c("DATENFEHLER: MFN" = -42, "KEINE ANGABE" = -9, scale_labels(1, 10, "LINKS", "RECHTS")), "LINKS-RECHTS-SELBSTEINSTUFUNG, BEFR.")
d$ls01 <- lab(pick(c(0:10, -9), c(rep(.09, 11), .01)), c("KEINE ANGABE" = -9, scale_labels(0, 10, "GANZ UNZUFRIEDEN", "GANZ ZUFRIEDEN")), "ALLGEMEINE LEBENSZUFRIEDENHEIT")
d$work <- lab(pick(1:4, c(.4, .15, .05, .4)), c("KEINE ANGABE" = -9, "VOLLZEIT, GANZTAGS" = 1, "TEILZEIT" = 2, "NEBENHER BERUFSTAE." = 3, "NICHT ERWERBSTAETIG" = 4), "BEFRAGTE(R) BERUFSTAETIG?")
d$dw15 <- lab(ifelse(d$work %in% 1:2, sample(c(10, 20, 25, 30, 35, 38.5, 40, 40, 40, 45, 50, 60), n, replace = TRUE), -10),
              c("DATENFEHLER" = -41, "TNZ: FILTER" = -10, "KEINE ANGABE" = -9), "BEFRAGTER: ARBEITSSTUNDEN PRO WOCHE")
```

- [ ] **Step 2: Testdatei neu schreiben**

Run: `Rscript --vanilla scripts/make-sandbox-fixture.R`
Expected: `Geschrieben nach src/sandbox/fixtures`

- [ ] **Step 3: Tests laufen lassen**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts`
Expected: FAIL in `searches names and labels and resolves claim items before custom ones` – die Suche nach „vertrauen“ findet jetzt zusätzlich `st01` („VERTRAUEN ZU MITMENSCHEN“).

- [ ] **Step 4: Erwartung anpassen.** In `src/sandbox/allbus.test.ts` die Zeile

```ts
  assert.deepEqual(searchVariables(sav, 'vertrauen', 'outcome').map(i => i.variable), ['pt03', 'pt12', 'pt15']);
```

ersetzen durch

```ts
  assert.deepEqual(searchVariables(sav, 'vertrauen', 'outcome').map(i => i.variable), ['pt03', 'pt12', 'pt15', 'st01']);
```

- [ ] **Step 5: Tests und R-Abgleich der Mission**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts`
Expected: `# pass 129`, `# fail 0` (1 übersprungen).

Run: `node --import tsx scripts/export-sandbox-grid.ts src/sandbox/fixtures/sandbox-fixture.sav /tmp/grid.json && Rscript --vanilla scripts/verify-sandbox-r.R /tmp/grid.json`
Expected: `120 von 120 Wegen stimmen überein.`

- [ ] **Step 6: Commit**

```bash
git add scripts/make-sandbox-fixture.R src/sandbox/fixtures src/sandbox/allbus.test.ts
git commit -m "Extend synthetic fixture with variables for learning-path tasks 1-3"
```

---

### Task 2: Hilfsbausteine (`src/tasks/kit`) und Aufgabentypen

**Files:**
- Create: `src/tasks/types.ts`, `src/tasks/kit/numbers.ts`, `src/tasks/kit/storage.ts`, `src/tasks/kit/RBlock.tsx`, `src/tasks/kit/HintLadder.tsx`, `src/tasks/kit/PlenumCard.tsx`, `src/tasks/kit/PartnerToggle.tsx`, `src/tasks/kit/Feedback.tsx`, `src/tasks/kit/RoleBrief.tsx`
- Create: `src/tasks.css` (Grundteil)
- Test: `src/tasks/kit/kit.test.ts`
- Modify: `src/main.tsx` (CSS importieren), `package.json` (Testskript)

**Interfaces:**
- Produces:
  - `type TaskId = 's01' | … | 's10'`, `TASK_IDS`, `type TaskStatus = 'open' | 'running' | 'done'`, `type TaskProps<S> = { data: LoadedData; state: S; onChange(next: S): void; onConcept(id: string): void }`, `type TaskDef<S> = { id; title; role; intro; requiredVariables: string[]; initial(): S; parse(raw: unknown): S; status(s: S): TaskStatus; Component(p: TaskProps<S>) }`
  - `parseNumber(input: string): number | null`, `near(value, target, tolerance): boolean`, `de(x, digits = 1): string`
  - `taskStorageKey`, `type TaskStore = { tasks: Partial<Record<TaskId, unknown>> }`, `emptyTaskStore()`, `parseTaskStore(raw)`, Helfer `record`, `str`, `bool`, `oneOf`, `strList`
  - Komponenten `RBlock({ code, file? })`, `HintLadder({ hint: Hint, onConcept, file? })` mit `type Hint = { think; pointer; concept?: { id; label }; workshop?; scaffold; solution }`, `PlenumCard({ title, lines: [string, string][], file })` und `plenumMarkdown(title, lines)`, `PartnerToggle({ mode, onChange, solo, pair })` mit `type WorkMode`, `WORK_MODES`, `Feedback({ notes: Note[] })` mit `type Note = { tone: 'ok' | 'hint' | 'warn'; text }`, `RoleBrief({ role, title, children })`

- [ ] **Step 1: Failing test schreiben** – `src/tasks/kit/kit.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HintLadder } from './HintLadder';
import { near, parseNumber } from './numbers';
import { PlenumCard, plenumMarkdown } from './PlenumCard';
import { RBlock } from './RBlock';
import { emptyTaskStore, oneOf, parseTaskStore, str, strList } from './storage';

test('reads German and English number formats', () => {
  assert.equal(parseNumber('37,9'), 37.9);
  assert.equal(parseNumber('37.9'), 37.9);
  assert.equal(parseNumber('1.656'), 1656);
  assert.equal(parseNumber('5 246'), 5246);
  assert.equal(parseNumber('−8'), -8);
  assert.equal(parseNumber('-0,5'), -0.5);
  for (const bad of ['', 'abc', '1,2,3', '5,5 %']) assert.equal(parseNumber(bad), null, bad);
  assert.ok(near(37.94, 37.9, 0.05));
  assert.ok(!near(38, 37.9, 0.05));
});

test('restores only known tasks from storage and survives garbage', () => {
  assert.deepEqual(parseTaskStore(null), emptyTaskStore());
  assert.deepEqual(parseTaskStore('{kaputt'), emptyTaskStore());
  assert.deepEqual(parseTaskStore('{"tasks":[1,2]}'), emptyTaskStore());
  const store = parseTaskStore(JSON.stringify({ tasks: { s01: { a: 1 }, s99: { b: 2 }, s02: 'text' } }));
  assert.deepEqual(store, { tasks: { s01: { a: 1 } } });
  assert.equal(str(42), '');
  assert.equal(str('x'.repeat(3000)).length, 2000);
  assert.equal(oneOf('b', ['a', 'b'] as const, 'a'), 'b');
  assert.equal(oneOf('c', ['a', 'b'] as const, 'a'), 'a');
  assert.deepEqual(strList(['a', 3, 'b']), ['a', 'b']);
});

test('hint ladder starts closed and the plenum card lists its lines', () => {
  const hint = { think: 'Denk nach.', pointer: 'Schau in die Karte.', scaffold: 'find_var(___)', solution: 'find_var(allbus, "x")' };
  const html = renderToStaticMarkup(createElement(HintLadder, { hint, onConcept: () => {} }));
  assert.match(html, /Ich komme nicht weiter/);
  assert.doesNotMatch(html, /Denk nach/);
  const card = renderToStaticMarkup(createElement(PlenumCard, { title: 'Stempelbilanz', lines: [['Beauftragen', '2 von 4'], ['Variable', '']], file: 'plenum.md' }));
  assert.match(card, /FÜR DAS PLENUM/);
  assert.match(card, /2 von 4/);
  assert.equal(plenumMarkdown('T', [['A', '1'], ['B', '']]), '# T\n\n- **A:** 1\n- **B:** –\n');
  assert.match(renderToStaticMarkup(createElement(RBlock, { code: 'library(mariposa)', file: 'x.R' })), /library\(mariposa\)/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/kit/kit.test.ts`
Expected: FAIL mit `Cannot find module './HintLadder'`.

- [ ] **Step 3: Typen anlegen** – `src/tasks/types.ts`:

```ts
import type { ReactNode } from 'react';
import type { LoadedData } from '../sandbox/ui/DataDrop';

export type TaskId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10';
export const TASK_IDS: readonly TaskId[] = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10'];
export type TaskStatus = 'open' | 'running' | 'done';

export type TaskProps<S> = {
  data: LoadedData;
  state: S;
  onChange: (next: S) => void;
  onConcept: (id: string) => void;
};

/** Eine Aufgabe des Lernpfads. Zustand und Texte gehören der Aufgabe; gespeichert werden nie Daten. */
export type TaskDef<S> = {
  id: TaskId;
  title: string;
  role: string;
  intro: string;
  requiredVariables: string[];
  initial: () => S;
  parse: (raw: unknown) => S;
  status: (state: S) => TaskStatus;
  Component: (props: TaskProps<S>) => ReactNode;
};
```

- [ ] **Step 4: `src/tasks/kit/numbers.ts` anlegen**

```ts
/** Liest „37,9“, „37.9“, „1.656“ (Tausenderpunkt), „5 246“ und „−8“. Gibt null zurück, wenn es keine Zahl ist. */
export function parseNumber(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace(/[−–]/g, '-');
  if (!s) return null;
  let t = s;
  if (s.includes(',')) t = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) t = s.replace(/\./g, '');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return Number(t);
}

export const near = (value: number, target: number, tolerance: number) => Math.abs(value - target) <= tolerance + 1e-9;

export const de = (x: number, digits = 1) => Number.isFinite(x)
  ? x.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  : '–';
```

- [ ] **Step 5: `src/tasks/kit/storage.ts` anlegen**

```ts
import { TASK_IDS, type TaskId } from '../types';

export const taskStorageKey = 'statistikatlas.aufgaben.v1';
export type TaskStore = { tasks: Partial<Record<TaskId, unknown>> };

export const emptyTaskStore = (): TaskStore => ({ tasks: {} });

export function parseTaskStore(raw: string | null): TaskStore {
  if (!raw) return emptyTaskStore();
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return emptyTaskStore(); }
  const tasks = record(record(data).tasks);
  const out = emptyTaskStore();
  for (const id of TASK_IDS) {
    const value = tasks[id];
    if (value && typeof value === 'object' && !Array.isArray(value)) out.tasks[id] = value;
  }
  return out;
}

/* Kleine Helfer zum defensiven Lesen gespeicherter Zustände. */
export const record = (x: unknown): Record<string, unknown> =>
  x && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, unknown> : {};
export const str = (x: unknown, max = 2000) => typeof x === 'string' ? x.slice(0, max) : '';
export const bool = (x: unknown, fallback = false) => typeof x === 'boolean' ? x : fallback;
export const oneOf = <T extends string>(x: unknown, options: readonly T[], fallback: T): T =>
  options.includes(x as T) ? x as T : fallback;
export const strList = (x: unknown, maxItems = 20, max = 200) =>
  Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string').slice(0, maxItems).map(s => s.slice(0, max)) : [];
```

- [ ] **Step 6: `src/tasks/kit/RBlock.tsx` anlegen**

```tsx
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';
import { downloadText } from '../../domain/mariposa';

export function RBlock({ code, file }: { code: string; file?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return <div className="task-rblock">
    <pre className="sandbox-code">{code}</pre>
    <div className="sandbox-chips">
      <button onClick={() => void copy()}><Copy size={14} aria-hidden="true" /> {copied ? 'Kopiert' : 'Kopieren'}</button>
      {file && <button onClick={() => downloadText(file, code)}><Download size={14} aria-hidden="true" /> {file}</button>}
    </div>
  </div>;
}
```

- [ ] **Step 7: `src/tasks/kit/HintLadder.tsx` anlegen**

```tsx
import { LifeBuoy } from 'lucide-react';
import { useState } from 'react';
import { workshopUrl } from '../../domain/curriculum';
import { RBlock } from './RBlock';

/** Vier Stufen: Denkanstoß → Verweis → Gerüst mit Lücken (___) → vollständiger Code. */
export type Hint = {
  think: string;
  pointer: string;
  concept?: { id: string; label: string };
  workshop?: string;
  scaffold: string;
  solution: string;
};

export function HintLadder({ hint, onConcept, file }: { hint: Hint; onConcept: (id: string) => void; file?: string }) {
  const [level, setLevel] = useState(0);
  return <div className="task-hints">
    {level > 0 && <ol className="task-hint-steps">
      <li><strong>Denkanstoß.</strong> {hint.think}</li>
      {level > 1 && <li>
        <strong>Wo nachsehen?</strong> {hint.pointer}{' '}
        {hint.concept && <button className="sandbox-link" onClick={() => onConcept(hint.concept!.id)}>{hint.concept.label} in der Karte</button>}
        {hint.workshop && <a href={workshopUrl} target="_blank" rel="noreferrer">R-Workshop: {hint.workshop}</a>}
      </li>}
      {level > 2 && <li><strong>Gerüst.</strong> Ersetze die Lücken ___:<RBlock code={hint.scaffold} /></li>}
      {level > 3 && <li><strong>Lösung.</strong> Die Aufgabe zählt trotzdem als bearbeitet – entscheiden musst du weiterhin selbst.<RBlock code={hint.solution} file={file} /></li>}
    </ol>}
    {level < 4 && <button onClick={() => setLevel(level + 1)} aria-expanded={level > 0}>
      <LifeBuoy size={15} aria-hidden="true" /> {level === 0 ? 'Ich komme nicht weiter' : `Nächste Hilfe (${level + 1} von 4)`}
    </button>}
  </div>;
}
```

- [ ] **Step 8: `src/tasks/kit/PlenumCard.tsx` anlegen**

```tsx
import { Download } from 'lucide-react';
import { downloadText } from '../../domain/mariposa';

export const plenumMarkdown = (title: string, lines: [string, string][]) =>
  `# ${title}\n\n${lines.map(([k, v]) => `- **${k}:** ${v || '–'}`).join('\n')}\n`;

/** Das vergleichbare Ergebnis, das im Plenum vorgelesen oder an die Tafel geschrieben wird. */
export function PlenumCard({ title, lines, file }: { title: string; lines: [string, string][]; file: string }) {
  return <section className="task-plenum" aria-label="Ergebnis für das Plenum">
    <span className="learning-eyebrow">FÜR DAS PLENUM</span>
    <h4>{title}</h4>
    <dl>{lines.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || '–'}</dd></div>)}</dl>
    <button onClick={() => downloadText(file, plenumMarkdown(title, lines), 'text/markdown;charset=utf-8')}>
      <Download size={14} aria-hidden="true" /> Karte als Markdown
    </button>
  </section>;
}
```

- [ ] **Step 9: `src/tasks/kit/PartnerToggle.tsx` anlegen**

```tsx
export type WorkMode = 'solo' | 'pair';
export const WORK_MODES = ['solo', 'pair'] as const;

export function PartnerToggle({ mode, onChange, solo, pair }: { mode: WorkMode; onChange: (mode: WorkMode) => void; solo: string; pair: string }) {
  return <div className="task-partner">
    <div className="sandbox-chips" role="group" aria-label="Arbeitsform">
      <button aria-pressed={mode === 'solo'} onClick={() => onChange('solo')}>Allein</button>
      <button aria-pressed={mode === 'pair'} onClick={() => onChange('pair')}>Zu zweit</button>
    </div>
    <p className="sandbox-note">{mode === 'solo' ? solo : pair}</p>
  </div>;
}
```

- [ ] **Step 10: `src/tasks/kit/Feedback.tsx` anlegen**

```tsx
export type Note = { tone: 'ok' | 'hint' | 'warn'; text: string };

export function Feedback({ notes }: { notes: Note[] }) {
  if (!notes.length) return null;
  return <ul className="task-feedback" aria-live="polite">
    {notes.map((n, i) => <li key={i} className={`tone-${n.tone}`}>{n.text}</li>)}
  </ul>;
}
```

- [ ] **Step 11: `src/tasks/kit/RoleBrief.tsx` anlegen**

```tsx
import type { ReactNode } from 'react';

/** Der Rollenauftrag, so wie Studierende ihn lesen. */
export function RoleBrief({ role, title, children }: { role: string; title: string; children: ReactNode }) {
  return <section className="task-brief" aria-label="Auftrag">
    <span className="learning-eyebrow">AUFGABE · {role.toLocaleUpperCase('de')}</span>
    <h3>{title}</h3>
    <div className="task-brief-text">{children}</div>
  </section>;
}
```

- [ ] **Step 12: Styles anlegen** – `src/tasks.css`:

```css
/* Lernpfad-Aufgaben: gemeinsame Hilfsbausteine. Aufgabenspezifisches steht darunter je Sitzung. */
.task-brief{background:#fff;border:1px solid var(--line);border-left:4px solid var(--green);border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 14px}
.task-brief h3{font:22px/1.3 Georgia,serif;margin:6px 0 10px}
.task-brief-text p{margin:0 0 10px}
.task-brief-text ol{margin:0 0 10px;padding-left:22px}
.task-step{margin:22px 0 0}
.task-step>h3{font:600 16px/1.4 var(--sans);margin:0 0 8px}
.task-hints{margin:10px 0 4px}
.task-hint-steps{margin:0 0 10px;padding-left:22px;font-size:15px}
.task-hint-steps li{margin:0 0 8px}
.task-rblock{margin:8px 0}
.task-feedback{list-style:none;padding:0;margin:10px 0}
.task-feedback li{font-size:14px;padding:8px 12px;border-radius:6px;margin:0 0 6px;border:1px solid var(--line);background:#fff}
.task-feedback .tone-ok{border-color:#9fbf9a;background:#eef5ec}
.task-feedback .tone-hint{border-color:#c9c3a2;background:#faf7ea}
.task-feedback .tone-warn{border-color:#e3c08a;background:#fff5e6}
.task-plenum{background:var(--soft);border-radius:10px;padding:16px 20px;margin:18px 0}
.task-plenum h4{font:600 16px/1.4 var(--sans);margin:4px 0 10px}
.task-plenum dl{display:grid;grid-template-columns:minmax(140px,max-content) 1fr;gap:6px 16px;margin:0 0 12px;font-size:15px}
.task-plenum dl>div{display:contents}
.task-plenum dt{color:var(--muted)}
.task-plenum dd{margin:0;font-weight:600}
.task-partner{margin:0 0 14px}
.task-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:8px 0}
.task-grid label{display:flex;flex-direction:column;gap:4px;font-size:14px;color:var(--muted)}
.sandbox .task-grid input,.sandbox .task-grid select{font:15px/1.4 var(--sans);border:1px solid var(--line);border-radius:6px;padding:7px 9px;background:#fff;color:var(--ink)}
.task-card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px 20px;margin:0 0 14px}
.task-card>h4{font:600 16px/1.4 var(--sans);margin:0 0 8px}
@media(max-width:560px){.task-plenum dl{grid-template-columns:1fr}.task-plenum dd{margin-bottom:6px}}
```

In `src/main.tsx` nach `import './sandbox.css';` die Zeile `import './tasks.css';` ergänzen.

- [ ] **Step 13: Testskript erweitern.** In `package.json` das Skript `"test"` ersetzen durch:

```json
    "test": "node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*/*.test.ts"
```

- [ ] **Step 14: Tests und Typprüfung**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 132`, `# fail 0`.

Run: `node_modules/.bin/tsc --noEmit`
Expected: keine Ausgabe.

- [ ] **Step 15: Commit**

```bash
git add src/tasks src/tasks.css src/main.tsx package.json
git commit -m "Add task kit: numbers, storage, hints, R block, plenum card, partner toggle"
```

---

### Task 3: Register, Aufgabenrahmen und Umstellung des Lernpfads

**Files:**
- Create: `src/tasks/registry.ts`, `src/tasks/TaskHost.tsx`, `src/tasks/testRender.ts`
- Modify (ganze Datei ersetzen): `src/domain/curriculum.ts`, `src/components/LearningPath.tsx`, `src/domain/curriculum.test.ts`
- Test: `src/tasks/host.test.ts`
- Modify: `package.json` (Glob `src/tasks/*.test.ts`), `src/tasks.css` (Link in der Seitenleiste)

**Interfaces:**
- Consumes: `TaskDef`, `TaskStore`, `parseTaskStore`, `taskStorageKey` (Task 2); `DataDrop`, `LoadedData` aus `src/sandbox/ui/DataDrop`.
- Produces: `taskRegistry: Partial<Record<TaskId, TaskDef<any>>>`; `TaskHost({ def, data, raw, onRaw, onData, onConcept })`; `Session.task: TaskId | null`, `Session.mission: Claim['id'] | null`; `LearningPath`-Prop `initialTasks?: TaskStore`; `renderSession(sessionIndex, withData = true, store?, tasks = { tasks: {} })` und `testData()` in `src/tasks/testRender.ts`.

- [ ] **Step 1: Failing tests schreiben** – `src/tasks/host.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixtureSav } from '../sandbox/testData';
import { TaskHost } from './TaskHost';
import type { TaskDef } from './types';

type Dummy = { clicks: number };
const dummy: TaskDef<Dummy> = {
  id: 's10', title: 'Attrappe', role: 'Testrolle', intro: 'Nur für Tests.', requiredVariables: ['pa02a'],
  initial: () => ({ clicks: 0 }),
  parse: raw => ({ clicks: typeof (raw as Dummy)?.clicks === 'number' ? (raw as Dummy).clicks : 0 }),
  status: s => s.clicks > 0 ? 'running' : 'open',
  Component: ({ state }) => createElement('p', null, `Klicks: ${state.clicks}`),
};
const data = { sav: fixtureSav(), fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' };
const host = (props: Partial<Parameters<typeof TaskHost<Dummy>>[0]>) => renderToStaticMarkup(createElement(TaskHost<Dummy>, {
  def: dummy, data, raw: undefined, onRaw: () => {}, onData: () => {}, onConcept: () => {}, ...props,
}));

test('asks for the file first, then checks variables, then shows the task with restored state', () => {
  const empty = host({ data: null });
  assert.match(empty, /AUFGABE · TESTROLLE/);
  assert.match(empty, /ALLBUS-Datei hierher ziehen/);
  assert.match(host({ def: { ...dummy, requiredVariables: ['gibtesnicht'] } }), /fehlen in deiner Datei die Variablen gibtesnicht/);
  assert.match(host({}), /Klicks: 0/);
  assert.match(host({ raw: { clicks: 3 } }), /Klicks: 3/);
  assert.match(host({ raw: { clicks: 'x' } }), /Klicks: 0/);
});
```

und `src/domain/curriculum.test.ts` ganz ersetzen durch:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { claimById } from '../sandbox/claims';
import { initialWork, type MissionStore } from '../sandbox/state';
import { renderSession } from '../tasks/testRender';
import { conceptById } from './concepts';
import { sessions } from './curriculum';

test('follows the session plan: ten sessions, one task each, Belege es! only in session 4', () => {
  assert.deepEqual(sessions.map(s => s.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(sessions.map(s => s.task), ['s01', 's02', 's03', null, null, null, null, null, null, null]);
  assert.deepEqual(sessions.map(s => s.mission), [null, null, null, 'nichtwahl', null, null, null, null, null, null]);
  for (const s of sessions) {
    assert.ok(s.introduced.length > 0, `Sitzung ${s.id}`);
    for (const term of [...s.repetition, ...s.introduced]) if (term.concept) assert.ok(conceptById[term.concept], `${s.id}: ${term.concept}`);
    if (s.mission) assert.ok(claimById[s.mission]);
  }
});

test('lists every session with its status and marks missing map terms', () => {
  const store: MissionStore = { work: { nichtwahl: { ...initialWork(claimById.nichtwahl), step: 4, reached: 4 } } };
  const html = renderSession(3, true, store);
  for (const s of sessions) assert.match(html, new RegExp(`<strong>${s.title}<small>`));
  assert.match(html, /Mission abgeschlossen/);
  assert.match(html, /Aufgabe folgt/);
  assert.match(html, /<span title="Steht im Sitzungsplan, fehlt der Karte noch">AV und UV<\/span>/);
  assert.match(html, /<button>Kreuztabelle<\/button>/);
  assert.match(html, /Andere Datei laden/);
});

test('keeps the Belege es! mission in session 4 and announces upcoming tasks', () => {
  assert.match(renderSession(3), /Wer Politikern misstraut, geht gar nicht mehr wählen\./);
  assert.match(renderSession(3, false), /Lade dafür zuerst deine Datei/);
  const later = renderSession(5);
  assert.match(later, /AUFGABE FOLGT/);
  assert.match(later, /Mittelwerte vergleichen/);
  assert.match(renderSession(99), /Logistische Regression/);
});
```

- [ ] **Step 2: Tests laufen lassen**

Run: `node --import tsx --test src/tasks/host.test.ts src/domain/curriculum.test.ts`
Expected: FAIL mit `Cannot find module './TaskHost'` bzw. `Cannot find module '../tasks/testRender'`.

- [ ] **Step 3: Register anlegen** – `src/tasks/registry.ts`:

```ts
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {};
```

- [ ] **Step 4: Aufgabenrahmen** – `src/tasks/TaskHost.tsx`:

```tsx
import { useMemo } from 'react';
import { DataDrop, type LoadedData } from '../sandbox/ui/DataDrop';
import type { TaskDef } from './types';

/** Lädt bei Bedarf die ALLBUS-Datei, prüft die benötigten Variablen und zeigt dann die Aufgabe. */
export function TaskHost<S>({ def, data, raw, onRaw, onData, onConcept }: {
  def: TaskDef<S>;
  data: LoadedData | null;
  raw: unknown;
  onRaw: (next: S) => void;
  onData: (data: LoadedData) => void;
  onConcept: (id: string) => void;
}) {
  const state = useMemo(() => raw === undefined ? def.initial() : def.parse(raw), [def, raw]);
  if (!data) return <>
    <span className="learning-eyebrow">AUFGABE · {def.role.toLocaleUpperCase('de')}</span>
    <h3 className="task-title">{def.title}</h3>
    <p>{def.intro}</p>
    <DataDrop onLoaded={onData} />
  </>;
  const missing = def.requiredVariables.filter(v => !data.sav.byName.has(v));
  if (missing.length) return <p className="sandbox-error" role="alert">
    Für diese Aufgabe fehlen in deiner Datei die Variablen {missing.join(', ')}. Bitte die vollständige Datei ZA8831 v1.3.0 von GESIS laden.
  </p>;
  const Task = def.Component;
  return <Task data={data} state={state} onChange={onRaw} onConcept={onConcept} />;
}
```

- [ ] **Step 5: Render-Hilfe für Tests** – `src/tasks/testRender.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPath } from '../components/LearningPath';
import type { MissionStore } from '../sandbox/state';
import { fixtureSav } from '../sandbox/testData';
import type { TaskStore } from './kit/storage';

/** Rendert eine Sitzung des Lernpfads mit der synthetischen Testdatei (nur für Tests). */
export const testData = () => ({ sav: fixtureSav(), fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' });
export const renderSession = (sessionIndex: number, withData = true, store?: MissionStore, tasks: TaskStore = { tasks: {} }) =>
  renderToStaticMarkup(createElement(LearningPath, {
    onConcept: () => {}, sessionIndex, onSessionChange: () => {}, initialData: withData ? testData() : null, initialStore: store, initialTasks: tasks,
  }));
```

- [ ] **Step 6: Curriculum umstellen** – `src/domain/curriculum.ts` ganz ersetzen durch (Sitzungen 1–3 bekommen `task`, Sitzung 4 behält `mission: 'nichtwahl'`, `setupScript` und der Typ `Mission` entfallen):

```ts
import type { Claim } from '../sandbox/claims';
import type { TaskId } from '../tasks/types';

export const workshopUrl = 'https://rloesung.github.io/RWorkshop/';

/** Ein Begriff aus dem Sitzungsplan; ohne `concept` fehlt er der Karte noch. */
export type Term = { label: string; concept?: string };
export type Session = {
  id: number;
  plan: string;
  title: string;
  short: string;
  question: string;
  repetition: Term[];
  introduced: Term[];
  /** Die Aufgabe der Sitzung (Einzelanfertigung, `src/tasks/`). */
  task: TaskId | null;
  /** Übergangsweise: Mission „Belege es!“ bis zum Umbau von Sitzung 4. */
  mission: Claim['id'] | null;
};

const t = (label: string, concept?: string): Term => ({ label, concept });

// Gliederung nach „Statistik im WiSe 24/25“; die gestrichenen Sitzungen 7–8 (EFA) entfallen.
export const sessions: Session[] = [
  {
    id: 1, plan: 'Sitzungsplan 1', title: 'Einstieg', short: 'R, RStudio, ALLBUS',
    question: 'Wie kommen die Daten auf meinen Rechner?',
    repetition: [],
    introduced: [t('R und RStudio'), t('Daten nach R einlesen', 'data_import'), t('Codebuch & Variablensuche', 'codebook')],
    task: 's01', mission: null,
  },
  {
    id: 2, plan: 'Sitzungsplan 2', title: 'Vom Fragebogen zum Datensatz', short: 'Datenmatrix, Labels',
    question: 'Was steht eigentlich in einer Zeile des ALLBUS?',
    repetition: [t('Datenmatrix'), t('Variable'), t('Fall'), t('Wert'), t('Datenreihe', 'series')],
    introduced: [t('Variablen- & Wertelabels', 'labels'), t('Codebuch & Variablensuche', 'codebook'), t('Datentypen umwandeln', 'conversion')],
    task: 's02', mission: null,
  },
  {
    id: 3, plan: 'Sitzungsplan 3', title: 'Erste Auszählung', short: 'Häufigkeiten, fehlende Werte',
    question: 'Wie viele interessieren sich eigentlich für Politik?',
    repetition: [t('Nominale Kategorien', 'nominal'), t('Geordnete Kategorien', 'ordinal'), t('Metrisches Skalenniveau', 'metric'), t('Arithmetisches Mittel', 'mean'), t('Median', 'median'), t('Standardabweichung', 'sd'), t('Häufigkeiten', 'frequency'), t('Balkendiagramm'), t('Boxplot'), t('Schiefe & Kurtosis', 'shape')],
    introduced: [t('Fehlende Angaben', 'missing'), t('Missing-Codes aufbereiten', 'missing_tools'), t('Fälle auswählen'), t('Deskriptiver Überblick', 'describe')],
    task: 's03', mission: null,
  },
  {
    id: 4, plan: 'Sitzungsplan 4', title: 'Kreuztabellen', short: 'Prozentbasen, Umkodieren',
    question: 'Gehen Misstrauende nicht mehr wählen?',
    repetition: [t('AV und UV'), t('Kausalität', 'causality'), t('Grundgesamtheit & Parameter', 'population_parameter'), t('Stichprobe & Unabhängigkeit', 'sampling'), t('Chi-Quadrat · Unabhängigkeit', 'chi_square')],
    introduced: [t('Kreuztabelle', 'crosstab'), t('Zeilen-, Spalten-, Zellenprozente'), t('Rekodieren & Umpolen', 'recode'), t('Dummyvariablen', 'dummy'), t('Rechnen innerhalb einer Person', 'row_operations')],
    task: null, mission: 'nichtwahl',
  },
  {
    id: 5, plan: 'Sitzungsplan 5', title: 'Gewichtung und Zusammenhang', short: 'Gewichte, Zusammenhangsmaße',
    question: 'Vertraut der Osten dem Bundestag weniger?',
    repetition: [],
    introduced: [t('Gewichte', 'weights'), t('Drittvariable'), t('Confounding · gemeinsame Ursachen', 'confounding'), t('Phi', 'phi'), t('Cramér-V', 'cramers_v'), t('Goodman–Kruskal-Gamma', 'goodman_gamma'), t('Kendall Tau-b', 'kendall_tau'), t('Spearman-Korrelation', 'spearman'), t('Pearson-Korrelation', 'pearson')],
    task: null, mission: null,
  },
  {
    id: 6, plan: 'Sitzungsplan 6', title: 'Mittelwerte vergleichen', short: 't-Test, ANOVA',
    question: 'Unterscheiden sich Gruppen im Mittel?',
    repetition: [t('Normalverteilung', 'normal_distribution')],
    introduced: [t('t-Test', 't_test'), t('Einfaktorielle ANOVA', 'oneway_anova'), t('Korrelationsmatrix', 'correlation_matrix')],
    task: null, mission: null,
  },
  {
    id: 7, plan: 'Sitzungsplan 9', title: 'Index und Skala', short: 'Reliabilität, Cronbachs α',
    question: 'Wie misst man Populismus mit mehreren Fragen?',
    repetition: [t('Validität', 'validity'), t('Messfehler', 'measurement_error')],
    introduced: [t('Mittelwertindex', 'row_operations'), t('Skalenwert pro Person', 'item_score'), t('Kombinationsindex'), t('Reliabilität · Alpha & Omega', 'reliability')],
    task: null, mission: null,
  },
  {
    id: 8, plan: 'Sitzungsplan 10', title: 'Lineare Regression', short: 'Modell, Residuen, R²',
    question: 'Was sagt eine Gerade über politische Einstellungen?',
    repetition: [],
    introduced: [t('Lineare Regression', 'linear_regression'), t('Linearer Prädiktor', 'prediction'), t('Residuen & kleinste Quadrate', 'residuals'), t('Erklärter Varianzanteil · R²', 'explained_variance'), t('Gleiche Fehlervarianz', 'variance_assumption')],
    task: null, mission: null,
  },
  {
    id: 9, plan: 'Sitzungsplan 11', title: 'Regression vertiefen', short: 'mehrere Prädiktoren',
    question: 'Was bleibt, wenn man mehr berücksichtigt?',
    repetition: [],
    introduced: [t('Dummyvariablen', 'dummy'), t('Multikollinearität', 'multicollinearity'), t('Ausreißer & Einfluss', 'outliers_influence'), t('Interaktion', 'interaction'), t('Confounding · gemeinsame Ursachen', 'confounding')],
    task: null, mission: null,
  },
  {
    id: 10, plan: 'Sitzungsplan 12', title: 'Logistische Regression', short: 'Odds, Logit',
    question: 'Wer geht wählen – und wie wahrscheinlich?',
    repetition: [],
    introduced: [t('Wahrscheinlichkeit, Odds & Logit', 'logit'), t('Logistische Regression', 'logistic_regression'), t('Likelihood', 'likelihood'), t('Marginale Effekte', 'marginal_effects')],
    task: null, mission: null,
  },
];
```

- [ ] **Step 7: Lernpfad umstellen** – `src/components/LearningPath.tsx` ganz ersetzen durch:

```tsx
import { ArrowLeft, ArrowRight, BookOpen, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessions, workshopUrl, type Session, type Term } from '../domain/curriculum';
import { claimById } from '../sandbox/claims';
import { emptyStore, initialWork, missionStatus, missionStorageKey, parseStore, type ClaimWork, type MissionStore } from '../sandbox/state';
import { ClaimWorkspace } from '../sandbox/ui/ClaimWorkspace';
import { DataDrop, type LoadedData } from '../sandbox/ui/DataDrop';
import { emptyTaskStore, parseTaskStore, taskStorageKey, type TaskStore } from '../tasks/kit/storage';
import { taskRegistry } from '../tasks/registry';
import { TaskHost } from '../tasks/TaskHost';

const STORAGE_WARNING = 'Dein Browser erlaubt keine lokale Speicherung. Deine Arbeit bleibt nur erhalten, solange dieser Tab offen ist.';
const STATUS_TEXT = { open: 'Mission offen', running: 'Mission läuft', done: 'Mission abgeschlossen' } as const;
const TASK_TEXT = { open: 'Aufgabe offen', running: 'Aufgabe läuft', done: 'Aufgabe abgeschlossen' } as const;

function readStore(): { store: MissionStore; tasks: TaskStore; warning: string } {
  if (typeof localStorage === 'undefined') return { store: emptyStore(), tasks: emptyTaskStore(), warning: '' };
  try {
    return { store: parseStore(localStorage.getItem(missionStorageKey)), tasks: parseTaskStore(localStorage.getItem(taskStorageKey)), warning: '' };
  } catch {
    return { store: emptyStore(), tasks: emptyTaskStore(), warning: STORAGE_WARNING };
  }
}

function sessionStatus(session: Session, store: MissionStore, tasks: TaskStore): string {
  const def = session.task ? taskRegistry[session.task] : undefined;
  if (def) {
    const raw = tasks.tasks[def.id];
    return TASK_TEXT[def.status(raw === undefined ? def.initial() : def.parse(raw))];
  }
  if (session.mission) return STATUS_TEXT[missionStatus(store.work[session.mission])];
  return 'Aufgabe folgt';
}

function Terms({ label, terms, onConcept }: { label: string; terms: Term[]; onConcept: (id: string) => void }) {
  if (!terms.length) return null;
  return <>
    <span className="learning-eyebrow">{label}</span>
    <ul className="learning-term-list">
      {terms.map(term => <li key={term.label}>{term.concept
        ? <button onClick={() => onConcept(term.concept!)}>{term.label}</button>
        : <span title="Steht im Sitzungsplan, fehlt der Karte noch">{term.label}</span>}</li>)}
    </ul>
  </>;
}

export function LearningPath({ onConcept, sessionIndex = 0, onSessionChange, initialData = null, initialStore, initialTasks }: {
  onConcept: (id: string) => void;
  sessionIndex?: number;
  onSessionChange: (index: number) => void;
  initialData?: LoadedData | null;
  initialStore?: MissionStore;
  initialTasks?: TaskStore;
}) {
  const [data, setData] = useState<LoadedData | null>(initialData);
  const [{ store: loaded, tasks: loadedTasks, warning: loadWarning }] = useState(readStore);
  const [store, setStore] = useState<MissionStore>(initialStore ?? loaded);
  const [tasks, setTasks] = useState<TaskStore>(initialTasks ?? loadedTasks);
  const [warning, setWarning] = useState(loadWarning);
  const index = Math.min(Math.max(sessionIndex, 0), sessions.length - 1);
  const session = sessions[index];

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(missionStorageKey, JSON.stringify(store));
      localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
    } catch {
      setWarning(STORAGE_WARNING);
    }
  }, [store, tasks]);

  const choose = (next: number) => {
    onSessionChange(next);
    requestAnimationFrame(() => document.getElementById('learning-heading')?.focus({ preventScroll: true }));
    document.getElementById('learning-main')?.scrollTo({ top: 0 });
  };
  const claim = session.mission ? claimById[session.mission] : null;
  const taskDef = session.task ? taskRegistry[session.task] : undefined;
  const work = claim ? store.work[claim.id] ?? initialWork(claim) : null;
  const updateWork = (next: ClaimWork) => { if (claim) setStore(s => ({ ...s, work: { ...s.work, [claim.id]: next } })); };
  const dataLine = data ? `ALLBUScompact 2023 · ${data.version || 'Version unbekannt'} · ${data.sav.nCases.toLocaleString('de-DE')} Befragte` : 'ALLBUS noch nicht geladen';

  return <main className="learning-path" id="learning-main">
    <aside className="learning-rail">
      <a className="learning-brand" href="#learning-main">Statistikatlas<span>.</span></a>
      <span className="learning-eyebrow">LERNPFAD · STATISTIK IB</span>
      <h1>Statistik als Entscheidungshilfe</h1>
      <p>Zehn Sitzungen nach dem Sitzungsplan. Jede Sitzung gibt dir einen neuen Auftrag mit dem echten ALLBUScompact 2023: Du rechnest in R und entscheidest selbst, was die Daten tragen.</p>
      <p className="learning-data-status">{dataLine}{data && <> · <button className="sandbox-link" onClick={() => setData(null)}>Andere Datei laden</button></>}</p>
      <nav aria-label="Sitzungen"><ol>
        {sessions.map((s, i) => {
          const status = sessionStatus(s, store, tasks);
          const done = status === STATUS_TEXT.done || status === TASK_TEXT.done;
          return <li key={s.id} className={`${i === index ? 'current' : ''}${done ? ' done' : ''}`}>
            <button aria-current={i === index ? 'page' : undefined} onClick={() => choose(i)}>
              <span>{s.id}</span><strong>{s.title}<small>{status}</small></strong>
              {done && <Check size={16} aria-hidden="true" />}
            </button>
          </li>;
        })}
      </ol></nav>
      <a className="learning-source" href={workshopUrl} target="_blank" rel="noreferrer"><BookOpen size={16} aria-hidden="true" /> R-Workshop von Diehl und Moosdorf</a>
    </aside>

    <article className="learning-lesson" aria-labelledby="learning-heading">
      <div className="learning-meta"><span>Sitzung {session.id}</span><span>{session.short}</span><span>{session.plan}</span></div>
      <h2 id="learning-heading" tabIndex={-1}>{session.title}</h2>
      <p className="learning-lead">{session.question}</p>
      {warning && <p className="sandbox-warning" role="status">{warning}</p>}

      <section className="learning-terms" aria-label="Begriffe dieser Sitzung">
        <Terms label="WIEDERHOLUNG" terms={session.repetition} onConcept={onConcept} />
        <Terms label="NEU IN DIESER SITZUNG" terms={session.introduced} onConcept={onConcept} />
        <p className="learning-term-note">Begriffe öffnen die freie Karte. Gestrichelte stehen im Sitzungsplan und fehlen der Karte noch.</p>
      </section>

      <section className="sandbox learning-mission" aria-label="Aufgabe">
        {taskDef && <TaskHost key={taskDef.id} def={taskDef} data={data} raw={tasks.tasks[taskDef.id]}
          onRaw={next => setTasks(t => ({ tasks: { ...t.tasks, [taskDef.id]: next } }))} onData={setData} onConcept={onConcept} />}
        {!taskDef && claim && work && (data
          ? <>
              <span className="learning-eyebrow">MISSION · BELEGE ES!</span>
              <ClaimWorkspace key={claim.id} sav={data.sav} fileName={data.fileName} claim={claim} work={work} onChange={updateWork} onConcept={onConcept} />
            </>
          : <>
              <span className="learning-eyebrow">MISSION · BELEGE ES!</span>
              <p>In dieser Mission prüfst du die Behauptung „{claim.quote}“ mit dem echten ALLBUS. Lade dafür zuerst deine Datei.</p>
              <DataDrop onLoaded={setData} />
            </>)}
        {!taskDef && !claim && <div className="learning-mission-soon">
          <span className="learning-eyebrow">AUFGABE FOLGT</span>
          <p>Für diese Sitzung entsteht eine eigene Aufgabe mit echten ALLBUS-Daten. Bis dahin: Begriffe oben in der Karte erkunden und im Seminar in R arbeiten.</p>
        </div>}
      </section>

      <nav className="learning-pagination" aria-label="Sitzung wechseln">
        <button disabled={index === 0} onClick={() => choose(index - 1)}><ArrowLeft size={17} aria-hidden="true" /> {index > 0 ? `Sitzung ${sessions[index - 1].id}: ${sessions[index - 1].title}` : 'Anfang'}</button>
        <button disabled={index === sessions.length - 1} onClick={() => choose(index + 1)}>{index < sessions.length - 1 ? `Sitzung ${sessions[index + 1].id}: ${sessions[index + 1].title}` : 'Ende'} <ArrowRight size={17} aria-hidden="true" /></button>
      </nav>
    </article>
  </main>;
}
```

- [ ] **Step 8: Styles und Testskript.** An `src/tasks.css` anhängen:

```css
.learning-data-status .sandbox-link{border:0;background:none;color:var(--green);text-decoration:underline;text-underline-offset:3px;padding:0;font:inherit;cursor:pointer}
```

In `package.json` das Skript `"test"` ersetzen durch:

```json
    "test": "node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts"
```

- [ ] **Step 9: Tests und Typprüfung**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 132`, `# fail 0` (der App-Test `the initial surface starts on the learning path …` findet „ALLBUScompact 2023“ jetzt im Einleitungstext der Seitenleiste).

Run: `node_modules/.bin/tsc --noEmit`
Expected: keine Ausgabe.

- [ ] **Step 10: Commit**

```bash
git add src/tasks src/domain/curriculum.ts src/domain/curriculum.test.ts src/components/LearningPath.tsx src/tasks.css package.json
git commit -m "Switch learning path to per-session tasks with registry and task host"
```

---

### Task 4: Sitzung 1 „Schon gefragt?“ – Inhalte und Prüflogik

**Files:**
- Modify: `src/sandbox/testData.ts` (`fakeSav` bekommt optionales `label`)
- Create: `src/tasks/s01-schon-gefragt/content.ts`, `src/tasks/s01-schon-gefragt/domain.ts`
- Test: `src/tasks/s01-schon-gefragt/domain.test.ts`

**Interfaces:**
- Consumes: `SavFile`, `SavVariable`, `isMissingCode` (`src/sandbox/readSav`); Kit aus Task 2.
- Produces:
  - `content.ts`: `type AntragId`, `ANTRAG_IDS`, `type Antrag = { id; text; catalog: Record<string, string>; onAsk: { tone; text; needsReason }; hint: Hint }`, `antraege`, `antragById`, `SETUP_SCRIPT`, `handshakeHint`, `ERROR_PATTERNS`
  - `domain.ts`: `type Stamp`, `type S01State`, `emptyStamp()`, `initialS01()`, `parseS01(raw)`, `statusS01(s)`, `findVar(sav, pattern): SearchResult`, `askedCount(v)`, `lowestLabel(v)`, `checkStamp(sav, antrag | null, stamp): Note[]`, `checkHandshake(sav, cases, vars): Note[]`, `decodeError(message)`, `plenumLines(s)`, `reportMarkdown(s)`, `rScript(s)`

- [ ] **Step 1: `fakeSav` erweitern.** In `src/sandbox/testData.ts` die Signatur und das Label so ändern:

```ts
export function fakeSav(columns: Record<string, { values: number[]; labels?: Record<number, string>; missingFrom?: number; label?: string }>): SavFile {
  const variables: SavVariable[] = Object.entries(columns).map(([name, c]) => ({
    name, label: c.label ?? name, kind: 'numeric', values: Float64Array.from(c.values), strings: [],
```

(Rest der Funktion unverändert.)

- [ ] **Step 2: Failing test schreiben** – `src/tasks/s01-schon-gefragt/domain.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { antragById } from './content';
import { askedCount, checkHandshake, checkStamp, decodeError, emptyStamp, findVar, initialS01, lowestLabel, parseS01, plenumLines, reportMarkdown, rScript, statusS01 } from './domain';

const sav = fakeSav({
  rh08b: { label: 'HALTE VON: ASTROLOGIE, HOROSKOPE', values: [1, 2, 3, -6, 2], labels: { [-6]: 'KENNE ICH NICHT', 1: 'VIEL', 2: 'ETWAS', 3: 'GAR NICHTS' }, missingFrom: -1 },
  dp03: { label: 'LEBENSPARTNER: GEMEINSAMER HAUSHALT?', values: [1, -10, 2, -10, 1], labels: { [-10]: 'TNZ: FILTER', 1: 'JA', 2: 'NEIN' }, missingFrom: -1 },
  mp16: { label: 'FLUECHTL. CHANCE O.RISIKO: SOZIALSTAAT', values: [1, 5, -11, -11, 3], labels: { [-11]: 'TNZ: SPLIT', 1: 'RISIKO UEBERWIEGT', 5: 'CHANCE UEBERWIEGT' }, missingFrom: -1 },
  pt03: { label: 'VERTRAUEN: BUNDESTAG', values: [1, 7, -11, -9, 4], labels: { [-11]: 'TNZ: SPLIT', [-9]: 'KEINE ANGABE', 1: 'GAR KEIN VERTRAUEN', 7: 'GROSSES VERTRAUEN' }, missingFrom: -1 },
});
const hits = (pattern: string) => { const r = findVar(sav, pattern); return r.ok ? r.hits.map(v => v.name) : r.message; };

test('searches names and labels like find_var and explains empty or partial hits', () => {
  assert.deepEqual(hits('horoskop'), ['rh08b']);
  assert.deepEqual(hits('fluecht'), ['mp16']);
  const stem = findVar(sav, 'fluecht');
  assert.ok(stem.ok && stem.notes.length === 0, 'Wortstamm am Wortanfang ist kein Wortteil-Treffer');
  assert.deepEqual(hits('pt0'), ['pt03']);
  const umlaut = findVar(sav, 'flüchtling');
  assert.ok(umlaut.ok && umlaut.hits.length === 0 && /ohne Umlaute/.test(umlaut.notes[0].text));
  const partial = findVar(sav, 'einsam');
  assert.ok(partial.ok && partial.hits[0].name === 'dp03' && /gemEINSAMer/.test(partial.notes[0].text));
  assert.match(String(hits('(')), /Sonderzeichen/);
  assert.match(String(hits('  ')), /Suchwort/);
});

test('counts who was asked and reads the lowest valid label', () => {
  assert.equal(askedCount(sav.byName.get('pt03')!), 4);
  assert.equal(askedCount(sav.byName.get('rh08b')!), 5);
  assert.equal(lowestLabel(sav.byName.get('pt03')!), 'GAR KEIN VERTRAUEN');
  const real = fixtureSav().byName.get('pt03')!;
  assert.equal(askedCount(real), Array.from(real.values).filter(x => x !== -11).length);
});

test('mirrors a take-stamp without judging it', () => {
  const take = { ...emptyStamp(), decision: 'take' as const };
  assert.match(checkStamp(sav, antragById.politik, take)[0].text, /Welche Variable/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt99' })[0].text, /gibt es im ALLBUS nicht/);
  const good = checkStamp(sav, antragById.politik, { ...take, variable: 'PT03', lowest: 'gar kein Vertrauen', asked: '4' });
  assert.match(good[0].text, /Bundestag/);
  assert.equal(good[1].tone, 'ok');
  assert.match(good[2].text, /4 Befragten wurde die Frage gestellt/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt03', asked: '5' })[1].text, /TNZ: SPLIT \(n = 1\)/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt03', asked: '3' })[1].text, /gültigen Antworten/);
  assert.match(checkStamp(sav, antragById.politik, { ...take, variable: 'pt03', lowest: 'viel' })[1].text, /passt nicht/);
  assert.match(checkStamp(sav, null, { ...take, variable: 'rh08b' })[0].text, /HALTE VON: ASTROLOGIE/);
});

test('asks for documented searches and lets a reason overrule an objection', () => {
  const ask = { ...emptyStamp(), decision: 'ask' as const, searches: ['angst'] };
  assert.match(checkStamp(sav, antragById.politik, ask)[0].text, /mindestens zwei Suchwörter/);
  const two = { ...ask, searches: ['angst', 'furcht'] };
  assert.match(checkStamp(sav, antragById.gefluechtete, two)[0].text, /Einspruch/);
  assert.equal(checkStamp(sav, antragById.gefluechtete, { ...two, note: 'Risiko ist nicht dasselbe wie Angst.' })[0].tone, 'ok');
  assert.equal(checkStamp(sav, antragById.einsamkeit, two)[0].tone, 'ok');
  assert.deepEqual(checkStamp(sav, antragById.einsamkeit, emptyStamp()), []);
});

test('checks the handshake and decodes typical R errors', () => {
  assert.equal(checkHandshake(sav, '5', String(sav.variables.length)).every(n => n.tone === 'ok'), true);
  assert.equal(checkHandshake(sav, '6', '1')[0].tone, 'warn');
  assert.deepEqual(checkHandshake(sav, '', ''), []);
  assert.match(decodeError('Fehler in find_var(allbus, "x") : konnte Funktion "find_var" nicht finden')!.fix, /library\(mariposa\)/);
  assert.match(decodeError("Error: object 'allbus' not found")!.cause, /kennt dieses Objekt nicht/);
  assert.match(decodeError('Error in library(mariposa) : there is no package called ‘mariposa’')!.fix, /install\.packages/);
  assert.equal(decodeError('alles gut'), null);
});

test('restores state defensively and reports status, plenum line, report and script', () => {
  assert.deepEqual(parseS01(null), initialS01());
  const state = parseS01({ cases: '5246', vars: '579', stamps: { politik: { decision: 'take', variable: 'pt03', searches: ['vertrauen', 4] }, horoskop: { decision: 'nonsense' } }, mode: 'pair' });
  assert.equal(state.stamps.politik.variable, 'pt03');
  assert.deepEqual(state.stamps.politik.searches, ['vertrauen']);
  assert.equal(state.stamps.horoskop.decision, null);
  assert.equal(state.mode, 'pair');
  assert.equal(statusS01(initialS01()), 'open');
  assert.equal(statusS01(state), 'running');
  const done = { ...state, stamps: {
    horoskop: { ...emptyStamp(), decision: 'take' as const, variable: 'rh08b' },
    gefluechtete: { ...emptyStamp(), decision: 'ask' as const, searches: ['angst', 'fluecht'] },
    politik: { ...emptyStamp(), decision: 'take' as const, variable: 'pt03' },
    einsamkeit: { ...emptyStamp(), decision: 'ask' as const, searches: ['einsam', 'allein'] },
  } };
  assert.equal(statusS01(done), 'done');
  assert.deepEqual(plenumLines(done).slice(0, 2), [['Muss das Büro beauftragen', '2 von 4'], ['Idee 3 (Politik) übernommen als', 'pt03']]);
  assert.match(reportMarkdown(done), /Stempel: beauftragen · gesucht: „angst“, „fluecht“/);
  const script = rScript(done);
  assert.match(script, /find_var\(allbus, "fluecht"\)/);
  assert.match(script, /codebook\(allbus, rh08b, pt03\)/);
});
```

- [ ] **Step 3: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s01-schon-gefragt/domain.test.ts`
Expected: FAIL mit `Cannot find module './content'`.

- [ ] **Step 4: Inhalte** – `src/tasks/s01-schon-gefragt/content.ts`:

```ts
import type { Hint } from '../kit/HintLadder';

export type AntragId = 'horoskop' | 'gefluechtete' | 'politik' | 'einsamkeit';
export const ANTRAG_IDS: readonly AntragId[] = ['horoskop', 'gefluechtete', 'politik', 'einsamkeit'];

export type Antrag = {
  id: AntragId;
  text: string;
  /** Rückmeldung zu Variablen, die man für diese Idee übernehmen könnte (spiegelt, bewertet nicht). */
  catalog: Record<string, string>;
  /** Reaktion der Kollegin auf den Stempel „beauftragen“. */
  onAsk: { tone: 'ok' | 'hint'; text: string; needsReason: boolean };
  hint: Hint;
};

export const SETUP_SCRIPT = `library(mariposa)

# ZA8831_v1-3-0.sav auswählen (nach Registrierung bei GESIS)
allbus <- read_spss(file.choose())

# Suchen und nachschlagen – codebook() immer mit Variablen, sonst dauert es lange
find_var(allbus, "horoskop")
codebook(allbus, rh08b)
`;

export const handshakeHint: Hint = {
  think: 'Welches Fenster in RStudio zeigt, welche Objekte R gerade kennt?',
  pointer: 'Oben rechts im Environment steht allbus mit „… obs. of … variables“. Klappt das Einlesen nicht, füg die Fehlermeldung unten in den Fehler-Decoder ein.',
  concept: { id: 'data_import', label: 'Daten nach R einlesen' },
  workshop: 'Kap. 1, Environment und History',
  scaffold: 'library(mariposa)\nallbus <- ____(file.choose())',
  solution: SETUP_SCRIPT,
};

export const antraege: Antrag[] = [
  {
    id: 'horoskop',
    text: 'Halten die Leute eigentlich etwas von Horoskopen?',
    catalog: { rh08b: 'Passt: Die Frage misst genau, was man von Astrologie und Horoskopen hält.' },
    onAsk: { tone: 'hint', text: 'Die Kollegin zögert: „Such mal nach ‚astro‘ – ich meine, der ALLBUS fragt danach.“', needsReason: true },
    hint: {
      think: 'find_var() findet auch Wortteile. Ein kurzes Suchwort reicht.',
      pointer: 'find_var() durchsucht Namen und Labels, codebook() zeigt Fragetext, Werte und fehlende Angaben.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.1 find_var()',
      scaffold: 'find_var(allbus, "____")\ncodebook(allbus, ____)',
      solution: 'find_var(allbus, "horoskop")\ncodebook(allbus, rh08b)',
    },
  },
  {
    id: 'gefluechtete',
    text: 'Wie viele haben Angst vor Geflüchteten?',
    catalog: {
      mp16: 'Misst, ob Geflüchtete eher als Chance oder als Risiko für den Sozialstaat gesehen werden. Ist „Risiko“ dasselbe wie Angst?',
      mp17: 'Misst Chance oder Risiko für die Sicherheit. Ist „Risiko“ dasselbe wie Angst?',
      mp18: 'Misst Chance oder Risiko für das Zusammenleben. Ist „Risiko“ dasselbe wie Angst?',
      mp19: 'Misst Chance oder Risiko für die Wirtschaft. Ist „Risiko“ dasselbe wie Angst?',
      mi05: 'Misst, ob man den Zuzug von Kriegsflüchtlingen begrenzen will – eine Forderung, kein Gefühl.',
    },
    onAsk: { tone: 'hint', text: 'Einspruch der Kollegin: „Wie schreibt der ALLBUS eigentlich ‚ü‘? Versuch es mit einem Wortstamm.“', needsReason: true },
    hint: {
      think: 'Welches Wort stünde in einem kurzen Label in GROSSBUCHSTABEN – und wie ohne Umlaute?',
      pointer: 'Labels im ALLBUS sind gekürzt und ohne Umlaute geschrieben.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.1 find_var()',
      scaffold: 'find_var(allbus, "fl____")\ncodebook(allbus, ____)',
      solution: 'find_var(allbus, "fluecht")\ncodebook(allbus, mi05, mp16, mp17, mp18, mp19)',
    },
  },
  {
    id: 'politik',
    text: 'Vertrauen die Menschen der Politik noch?',
    catalog: {
      pt03: 'Vertrauen in den Bundestag. Meint „die Politik“ das Parlament?',
      pt12: 'Vertrauen in die Bundesregierung. Meint „die Politik“ die Regierung?',
      pt15: 'Vertrauen in die politischen Parteien. Meint „die Politik“ die Parteien?',
      st01: 'Vertrauen zu Mitmenschen – das ist nicht die Politik.',
      pe01: 'Die Aussage „Politiker kümmern sich nicht um meine Gedanken“ misst Unzufriedenheit, aber kein Vertrauen.',
    },
    onAsk: { tone: 'hint', text: 'Einspruch der Kollegin: „‚vertrauen‘ ergibt 16 Treffer. Bist du sicher, dass keiner passt?“', needsReason: true },
    hint: {
      think: '„Vertrauen“ findet viele Fragen. Welche Einrichtung meint „die Politik“?',
      pointer: 'Mehrere Treffer vergleichst du, indem du sie zusammen in codebook() schreibst. Achte auf „TNZ: SPLIT“ bei den fehlenden Werten.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.2 codebook()',
      scaffold: 'find_var(allbus, "____")\ncodebook(allbus, ____, ____, ____)',
      solution: 'find_var(allbus, "vertrauen")\ncodebook(allbus, pt03, pt12, pt15)',
    },
  },
  {
    id: 'einsamkeit',
    text: 'Wie einsam sind die Menschen?',
    catalog: {
      dp03: 'Scheintreffer: gemEINSAMer Haushalt mit dem Lebenspartner.',
      xs01: 'Scheintreffer: ob das Interview allein durchgeführt wurde.',
      li04: 'Nah dran: wie wichtig Freunde und Bekannte sind – aber nicht, ob man sich einsam fühlt.',
    },
    onAsk: { tone: 'ok', text: 'Die Kollegin: „Ich finde auch nur Scheintreffer. Dein Stempel geht so durch.“', needsReason: false },
    hint: {
      think: 'Prüf jeden Treffer: Steckt das Wort wirklich drin – oder nur als Teil eines anderen Worts?',
      pointer: 'Ein Treffer ist erst ein Kandidat. Ob die Frage passt, zeigt der Fragetext im Codebuch.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.2 codebook()',
      scaffold: 'find_var(allbus, "____")\ncodebook(allbus, ____)',
      solution: 'find_var(allbus, "einsam")\nfind_var(allbus, "allein")\ncodebook(allbus, dp03, xs01, li04)',
    },
  },
];
export const antragById = Object.fromEntries(antraege.map(a => [a.id, a])) as Record<AntragId, Antrag>;

/** Typische Fehlermeldungen beim Einstieg (deutsch und englisch). */
export const ERROR_PATTERNS: { pattern: RegExp; cause: string; fix: string }[] = [
  { pattern: /there is no package called|es gibt kein Paket/i, cause: 'mariposa ist noch nicht installiert.', fix: 'Einmal install.packages("mariposa") ausführen, danach library(mariposa).' },
  { pattern: /could not find function "%>%"|Funktion "%>%" nicht finden/i, cause: 'Die Pipe %>% kommt aus dplyr.', fix: 'library(dplyr) ausführen – in dieser Sitzung geht es auch ohne Pipe.' },
  { pattern: /could not find function|konnte Funktion .* nicht finden/i, cause: 'Das Paket ist nicht geladen oder der Funktionsname ist vertippt.', fix: 'library(mariposa) ausführen und die Schreibweise prüfen.' },
  { pattern: /object '.*' not found|Objekt '.*' nicht gefunden/i, cause: 'R kennt dieses Objekt nicht.', fix: 'Die Zeile mit allbus <- read_spss(…) zuerst ausführen und die Schreibweise prüfen.' },
  { pattern: /cannot open|kann .* nicht öffnen|does not exist|existiert nicht/i, cause: 'Die Datei wurde nicht gefunden.', fix: 'read_spss(file.choose()) nutzen und die Datei im Dialog auswählen. Unter macOS liegt der Dialog manchmal hinter RStudio.' },
  { pattern: /file choice cancelled|Dateiauswahl abgebrochen/i, cause: 'Der Auswahldialog wurde geschlossen.', fix: 'Die Zeile noch einmal ausführen und die Datei auswählen.' },
  { pattern: /unexpected|unerwartete/i, cause: 'Tippfehler im Code: meist eine fehlende Klammer, ein Komma oder ein Anführungszeichen.', fix: 'Die Zeile Zeichen für Zeichen mit der Vorlage vergleichen.' },
  { pattern: /No variables found/i, cause: 'find_var() hat keinen Treffer.', fix: 'Anders suchen: ohne Umlaute (ae, oe, ue), mit Wortstamm oder Synonym.' },
];
```

- [ ] **Step 5: Prüflogik** – `src/tasks/s01-schon-gefragt/domain.ts`:

```ts
import { isMissingCode, type SavFile, type SavVariable } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { oneOf, record, str, strList } from '../kit/storage';
import type { TaskStatus } from '../types';
import { ANTRAG_IDS, antraege, ERROR_PATTERNS, type Antrag, type AntragId } from './content';

export type Stamp = {
  decision: 'take' | 'ask' | null;
  variable: string;
  lowest: string;
  asked: string;
  searches: string[];
  note: string;
};
export type S01State = {
  mode: WorkMode;
  cases: string;
  vars: string;
  stamps: Record<AntragId, Stamp>;
  idea: string;
  ideaStamp: Stamp;
  lesson: string;
};

export const emptyStamp = (): Stamp => ({ decision: null, variable: '', lowest: '', asked: '', searches: [], note: '' });
export const initialS01 = (): S01State => ({
  mode: 'solo', cases: '', vars: '',
  stamps: { horoskop: emptyStamp(), gefluechtete: emptyStamp(), politik: emptyStamp(), einsamkeit: emptyStamp() },
  idea: '', ideaStamp: emptyStamp(), lesson: '',
});

function parseStamp(raw: unknown): Stamp {
  const r = record(raw);
  return {
    decision: r.decision === 'take' || r.decision === 'ask' ? r.decision : null,
    variable: str(r.variable, 40), lowest: str(r.lowest, 120), asked: str(r.asked, 20),
    searches: strList(r.searches, 12, 60), note: str(r.note, 600),
  };
}

export function parseS01(raw: unknown): S01State {
  const r = record(raw), stamps = record(r.stamps);
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    cases: str(r.cases, 20), vars: str(r.vars, 20),
    stamps: Object.fromEntries(ANTRAG_IDS.map(id => [id, parseStamp(stamps[id])])) as Record<AntragId, Stamp>,
    idea: str(r.idea, 300), ideaStamp: parseStamp(r.ideaStamp), lesson: str(r.lesson, 600),
  };
}

const stampComplete = (s: Stamp) => s.decision === 'take' ? s.variable.trim() !== '' : s.decision === 'ask' && s.searches.filter(x => x.trim()).length >= 2;

export function statusS01(s: S01State): TaskStatus {
  if (ANTRAG_IDS.every(id => stampComplete(s.stamps[id]))) return 'done';
  const touched = s.cases || s.vars || s.idea || ANTRAG_IDS.some(id => s.stamps[id].decision !== null);
  return touched ? 'running' : 'open';
}

/* ---------- Suche wie mariposa::find_var() ---------- */

export type SearchResult = { ok: true; hits: SavVariable[]; notes: Note[] } | { ok: false; message: string };
const LETTER = /[A-Za-zÄÖÜäöüß]/;

/** Zeigt ein Treffer-Wort mit hervorgehobenem Suchteil, wenn das Suchwort mitten in einem anderen Wort beginnt (gemEINSAMer). */
function wordPart(label: string, re: RegExp): string {
  const m = re.exec(label);
  if (!m || !m[0] || !LETTER.test(label[m.index - 1] ?? '')) return '';
  const end0 = m.index + m[0].length;
  let start = m.index;
  while (start > 0 && LETTER.test(label[start - 1])) start--;
  let end = end0;
  while (end < label.length && LETTER.test(label[end])) end++;
  return label.slice(start, m.index).toLocaleLowerCase('de') + m[0].toLocaleUpperCase('de') + label.slice(end0, end).toLocaleLowerCase('de');
}

export function findVar(sav: SavFile, pattern: string): SearchResult {
  const p = pattern.trim();
  if (!p) return { ok: false, message: 'Gib ein Suchwort ein.' };
  let re: RegExp;
  try { re = new RegExp(p, 'i'); } catch { return { ok: false, message: 'Das Suchwort enthält Sonderzeichen, die R als Suchmuster liest. Nimm ein einfaches Wort.' }; }
  const hits = sav.variables.filter(v => re.test(v.name) || re.test(v.label));
  const notes: Note[] = [];
  if (!hits.length && /[äöüÄÖÜß]/.test(p)) notes.push({ tone: 'hint', text: 'Die Labels im ALLBUS stehen in Großbuchstaben ohne Umlaute (zum Beispiel FLUECHTL.). Versuch es mit ae, oe, ue oder einem Wortstamm.' });
  const parts = [...new Set(hits.map(v => wordPart(v.label, re)).filter(Boolean))];
  if (parts.length) notes.push({ tone: 'hint', text: `Wortteil-Treffer: ${parts.join(', ')} – dein Suchwort steckt mitten in einem anderen Wort.` });
  return { ok: true, hits, notes };
}

/* ---------- Codebuch lesen ---------- */

const tnzCodes = (v: SavVariable) => [...v.valueLabels].filter(([, label]) => /^TNZ/i.test(label)).map(([code]) => code);

/** Wie vielen Befragten wurde die Frage gestellt? Alle außer „TNZ: trifft nicht zu“ (Split, Filter, Modus). */
export function askedCount(v: SavVariable): number {
  const tnz = new Set(tnzCodes(v));
  let n = 0;
  for (const x of v.values) if (!tnz.has(x)) n++;
  return n;
}

const validCount = (v: SavVariable) => Array.from(v.values).filter(x => !isMissingCode(v, x)).length;

export function lowestLabel(v: SavVariable): string | null {
  const valid = [...v.valueLabels].filter(([code]) => !isMissingCode(v, code)).sort((a, b) => a[0] - b[0]);
  return valid[0]?.[1] ?? null;
}

const norm = (s: string) => s.toLocaleLowerCase('de').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const labelMatches = (input: string, label: string) => {
  const a = norm(input), b = norm(label);
  return a.length >= 3 && (b.includes(a) || a.includes(b));
};
const n = (x: number) => x.toLocaleString('de-DE');

/* ---------- Stempel spiegeln ---------- */

export function checkStamp(sav: SavFile, antrag: Antrag | null, stamp: Stamp): Note[] {
  if (stamp.decision === 'take') {
    const name = stamp.variable.trim().toLowerCase();
    if (!name) return [{ tone: 'hint', text: 'Welche Variable übernimmst du? Trag ihren Namen ein, zum Beispiel rh08b.' }];
    const v = sav.byName.get(name);
    if (!v) return [{ tone: 'warn', text: `Eine Variable „${stamp.variable.trim()}“ gibt es im ALLBUS nicht. Prüf die Schreibweise mit find_var().` }];
    const notes: Note[] = [{ tone: 'hint', text: antrag?.catalog[name] ?? `${name} heißt im Datensatz „${v.label}“. Passt das zur Idee?` }];
    if (stamp.lowest.trim()) {
      const lowest = lowestLabel(v);
      notes.push(lowest && labelMatches(stamp.lowest, lowest)
        ? { tone: 'ok', text: `Stimmt: Der niedrigste Wert heißt „${lowest}“.` }
        : { tone: 'warn', text: `Das passt nicht zum Label des niedrigsten gültigen Werts. Schau mit codebook(allbus, ${name}) nach.` });
    }
    const asked = parseNumber(stamp.asked);
    if (asked !== null) {
      const want = askedCount(v), valid = validCount(v), never = sav.nCases - want;
      const tnz = tnzCodes(v).map(c => `${c} = ${v.valueLabels.get(c)}`).join(', ');
      if (asked === want) notes.push({ tone: 'ok', text: `Stimmt: ${n(want)} Befragten wurde die Frage gestellt.` });
      else if (asked === valid) notes.push({ tone: 'ok', text: `${n(valid)} ist die Zahl der gültigen Antworten. Gestellt wurde die Frage ${n(want)} Personen – manche haben sie gehört, aber nicht beantwortet.` });
      else if (asked === sav.nCases && never > 0) notes.push({ tone: 'warn', text: `Schau unter den fehlenden Werten nach: ${tnz} (n = ${n(never)}). Diesen Menschen wurde die Frage nie gestellt.` });
      else notes.push({ tone: 'warn', text: 'Diese Zahl finde ich nicht. Zähl nach: alle Befragten minus diejenigen mit einem Code „TNZ“ (trifft nicht zu).' });
    }
    return notes;
  }
  if (stamp.decision === 'ask') {
    if (stamp.searches.filter(s => s.trim()).length < 2) return [{ tone: 'hint', text: 'Zeig, wie du gesucht hast: Trag mindestens zwei Suchwörter ein, die du in R ausprobiert hast.' }];
    if (!antrag) return [{ tone: 'ok', text: 'Deine Suche ist dokumentiert.' }];
    if (antrag.onAsk.needsReason && stamp.note.trim().length < 10) return [{ tone: 'hint', text: `${antrag.onAsk.text} Wenn du bei „beauftragen“ bleibst, begründe es in einem Satz.` }];
    if (antrag.onAsk.needsReason) return [{ tone: 'ok', text: 'Einspruch zur Kenntnis genommen. Deine Begründung steht im Prüfbericht.' }];
    return [{ tone: antrag.onAsk.tone, text: antrag.onAsk.text }];
  }
  return [];
}

/* ---------- Handschlag und Fehler-Decoder ---------- */

export function checkHandshake(sav: SavFile, cases: string, vars: string): Note[] {
  const c = parseNumber(cases), v = parseNumber(vars), notes: Note[] = [];
  if (c !== null) notes.push(c === sav.nCases
    ? { tone: 'ok', text: `${n(sav.nCases)} Fälle – das sind alle Befragten.` }
    : { tone: 'warn', text: 'Die Fallzahl steht im Environment hinter allbus: „… obs.“' });
  if (v !== null) notes.push(v === sav.variables.length
    ? { tone: 'ok', text: `Handschlag geglückt: ${n(sav.variables.length)} Variablen. R und Browser sehen dieselbe Datei.` }
    : { tone: 'warn', text: 'Die Zahl der Variablen steht im Environment hinter „obs. of“.' });
  return notes;
}

export function decodeError(message: string): { cause: string; fix: string } | null {
  const hit = ERROR_PATTERNS.find(e => e.pattern.test(message));
  return hit ? { cause: hit.cause, fix: hit.fix } : null;
}

/* ---------- Ergebnis ---------- */

export function plenumLines(s: S01State): [string, string][] {
  const asks = ANTRAG_IDS.filter(id => s.stamps[id].decision === 'ask').length;
  const politik = s.stamps.politik;
  return [
    ['Muss das Büro beauftragen', `${asks} von 4`],
    ['Idee 3 (Politik) übernommen als', politik.decision === 'take' ? politik.variable.trim() : politik.decision === 'ask' ? 'beauftragt' : ''],
    ['Eigene Idee', s.idea.trim()],
  ];
}

function stampLine(stamp: Stamp): string {
  if (stamp.decision === 'take') return `Stempel: übernehmen · Variable ${stamp.variable.trim() || '–'} · niedrigster Wert: ${stamp.lowest.trim() || '–'} · gestellt: ${stamp.asked.trim() || '–'}`;
  if (stamp.decision === 'ask') return `Stempel: beauftragen · gesucht: ${stamp.searches.map(x => `„${x}“`).join(', ') || '–'}${stamp.note.trim() ? ` · Begründung: ${stamp.note.trim()}` : ''}`;
  return 'Stempel: offen';
}

export function reportMarkdown(s: S01State): string {
  const parts = [
    '# Prüfbericht „Schon gefragt?“',
    '',
    'Büro einer Bundestagsabgeordneten (fiktiv) · Daten: ALLBUScompact 2023 (ZA8831), GESIS',
    '',
    `Handschlag: ${s.cases.trim() || '–'} Fälle, ${s.vars.trim() || '–'} Variablen`,
    ...antraege.flatMap((a, i) => ['', `## Idee ${i + 1}: „${a.text}“`, stampLine(s.stamps[a.id])]),
    '', `## Eigene Idee: ${s.idea.trim() || '–'}`, stampLine(s.ideaStamp),
    '', '## Was mich am meisten in die Irre geführt hat', s.lesson.trim() || '–', '',
  ];
  return parts.join('\n');
}

export function rScript(s: S01State): string {
  const all = [...ANTRAG_IDS.map(id => s.stamps[id]), s.ideaStamp];
  const searches = [...new Set(all.flatMap(x => x.searches.map(w => w.trim()).filter(Boolean)))];
  const taken = [...new Set(all.filter(x => x.decision === 'take' && x.variable.trim()).map(x => x.variable.trim().toLowerCase()))];
  return [
    'library(mariposa)',
    '',
    'allbus <- read_spss(file.choose())',
    '',
    ...searches.map(w => `find_var(allbus, "${w.replace(/"/g, '')}")`),
    ...(taken.length ? ['', `codebook(allbus, ${taken.join(', ')})`] : []),
    '',
  ].join('\n');
}
```

- [ ] **Step 6: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s01-schon-gefragt/domain.test.ts`
Expected: `# pass 6`, `# fail 0`.

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit`
Expected: `# pass 138`, `# fail 0`; tsc ohne Ausgabe.

- [ ] **Step 7: Commit**

```bash
git add src/sandbox/testData.ts src/tasks/s01-schon-gefragt
git commit -m "Add session 1 domain: find_var search, stamp checks, handshake, error decoder, report"
```

---

### Task 5: Sitzung 1 – Oberfläche und Anmeldung

**Files:**
- Create: `src/tasks/s01-schon-gefragt/SchonGefragt.tsx`, `src/tasks/s01-schon-gefragt/index.ts`
- Modify: `src/tasks/registry.ts`, `src/tasks.css`
- Test: `src/tasks/s01-schon-gefragt/task.test.ts`

**Interfaces:**
- Consumes: alles aus Task 4; `downloadText` aus `src/domain/mariposa`; `renderSession` aus `src/tasks/testRender`.
- Produces: `schonGefragt: TaskDef<S01State>` (id `s01`, `requiredVariables: ['rh08b', 'pt03']`).

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s01-schon-gefragt/task.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession } from '../testRender';
import { taskRegistry } from '../registry';

test('session 1 shows the task: file first, then handshake, four ideas and the plenum card', () => {
  assert.equal(taskRegistry.s01?.title, 'Schon gefragt?');
  const empty = renderSession(0, false);
  assert.match(empty, /AUFGABE · REFERENT:IN IM ABGEORDNETENBÜRO/);
  assert.match(empty, /ALLBUS-Datei hierher ziehen/);
  const html = renderSession(0);
  assert.match(html, /Willkommen im Büro/);
  assert.match(html, /1 · Handschlag mit R/);
  assert.match(html, /read_spss\(file\.choose\(\)\)/);
  for (const idea of ['Horoskopen', 'Angst vor Geflüchteten', 'Politik noch', 'einsam']) assert.match(html, new RegExp(idea));
  assert.match(html, /Notfallkonsole/);
  assert.match(html, /FÜR DAS PLENUM/);
  assert.match(html, /Muss das Büro beauftragen/);
  assert.match(html, /Aufgabe offen/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s01-schon-gefragt/task.test.ts`
Expected: FAIL (`taskRegistry.s01` ist `undefined`).

- [ ] **Step 3: Oberfläche** – `src/tasks/s01-schon-gefragt/SchonGefragt.tsx`:

```tsx
import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import { downloadText } from '../../domain/mariposa';
import type { SavFile } from '../../sandbox/readSav';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { antraege, handshakeHint, SETUP_SCRIPT, type Antrag, type AntragId } from './content';
import { checkHandshake, checkStamp, decodeError, findVar, plenumLines, reportMarkdown, rScript, type S01State, type Stamp } from './domain';

const splitWords = (text: string) => text.split(/[,;\n]/).map(w => w.trim()).filter(Boolean);

function SearchTester({ sav, onSearched }: { sav: SavFile; onSearched: (word: string) => void }) {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<ReturnType<typeof findVar> | null>(null);
  const run = () => { const r = findVar(sav, word); setResult(r); if (r.ok) onSearched(word.trim()); };
  return <div className="s01-tester">
    <label className="sandbox-search">
      <Search size={16} aria-hidden="true" />
      <input type="search" value={word} placeholder="Suchwort, das du auch in R probierst" aria-label="Suchwort testen"
        onChange={e => setWord(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') run(); }} />
      <button onClick={run}>Treffer zählen</button>
    </label>
    {result && (result.ok
      ? <><p className="sandbox-note" role="status">{result.hits.length} Treffer für „{word.trim()}“. Namen und Labels liest du in R.</p><Feedback notes={result.notes} /></>
      : <p className="sandbox-error" role="status">{result.message}</p>)}
  </div>;
}

function StampEditor({ sav, antrag, stamp, onChange }: { sav: SavFile; antrag: Antrag | null; stamp: Stamp; onChange: (s: Stamp) => void }) {
  const set = (patch: Partial<Stamp>) => onChange({ ...stamp, ...patch });
  return <div className="s01-stamp">
    <div className="sandbox-chips" role="group" aria-label="Stempel">
      <button aria-pressed={stamp.decision === 'take'} onClick={() => set({ decision: 'take' })}>Übernehmen</button>
      <button aria-pressed={stamp.decision === 'ask'} onClick={() => set({ decision: 'ask' })}>Beauftragen</button>
    </div>
    {stamp.decision === 'take' && <div className="task-grid">
      <label>Variable<input type="text" value={stamp.variable} placeholder="z. B. rh08b" onChange={e => set({ variable: e.target.value })} /></label>
      <label>Label des niedrigsten Werts<input type="text" value={stamp.lowest} onChange={e => set({ lowest: e.target.value })} /></label>
      <label>Wie vielen wurde die Frage gestellt?<input type="text" inputMode="numeric" value={stamp.asked} onChange={e => set({ asked: e.target.value })} /></label>
    </div>}
    {stamp.decision === 'ask' && <div className="task-grid">
      <label>Deine Suchwörter in R (mit Komma getrennt)<input type="text" value={stamp.searches.join(', ')} onChange={e => set({ searches: splitWords(e.target.value) })} /></label>
      <label>Begründung (ein Satz)<input type="text" value={stamp.note} onChange={e => set({ note: e.target.value })} /></label>
    </div>}
    <Feedback notes={checkStamp(sav, antrag, stamp)} />
  </div>;
}

function AntragCard({ n, antrag, stamp, sav, onChange, onConcept }: { n: number; antrag: Antrag; stamp: Stamp; sav: SavFile; onChange: (s: Stamp) => void; onConcept: (id: string) => void }) {
  const addSearch = (word: string) => { if (!stamp.searches.includes(word)) onChange({ ...stamp, searches: [...stamp.searches, word] }); };
  return <article className="task-card s01-antrag" aria-labelledby={`s01-antrag-${antrag.id}`}>
    <h4 id={`s01-antrag-${antrag.id}`}>Idee {n}: „{antrag.text}“</h4>
    <SearchTester sav={sav} onSearched={addSearch} />
    <StampEditor sav={sav} antrag={antrag} stamp={stamp} onChange={onChange} />
    <HintLadder hint={antrag.hint} onConcept={onConcept} />
  </article>;
}

function ErrorDecoder() {
  const [message, setMessage] = useState('');
  const decoded = message.trim() ? decodeError(message) : null;
  return <details className="s01-decoder">
    <summary>R zeigt eine Fehlermeldung? Hier einfügen</summary>
    <textarea value={message} aria-label="Fehlermeldung aus R" placeholder="z. B. Fehler … konnte Funktion nicht finden" onChange={e => setMessage(e.target.value)} />
    {message.trim() && (decoded
      ? <p className="sandbox-note" role="status"><strong>{decoded.cause}</strong> {decoded.fix}</p>
      : <p className="sandbox-note" role="status">Diese Meldung kenne ich nicht. Vergleich deinen Code Zeichen für Zeichen mit der Vorlage oder frag deine Nachbarin.</p>)}
  </details>;
}

function EmergencyConsole({ sav }: { sav: SavFile }) {
  const [word, setWord] = useState('');
  const result = word.trim() ? findVar(sav, word) : null;
  return <details className="s01-emergency">
    <summary>Notfallkonsole – nur wenn R gerade nicht läuft</summary>
    <p className="sandbox-note">Ein nachgebautes find_var() im Browser. Es zeigt Namen und Labels, aber kein Codebuch. Der Handschlag bleibt offen, bis R läuft.</p>
    <input type="search" value={word} aria-label="Notfallsuche" onChange={e => setWord(e.target.value)} />
    {result && (result.ok
      ? <ul className="sandbox-found">{result.hits.slice(0, 30).map(v => <li key={v.name}><code>{v.name}</code> <small>{v.label}</small></li>)}</ul>
      : <p className="sandbox-error">{result.message}</p>)}
  </details>;
}

export function SchonGefragt({ data, state, onChange, onConcept }: TaskProps<S01State>) {
  const set = (patch: Partial<S01State>) => onChange({ ...state, ...patch });
  const setStamp = (id: AntragId, stamp: Stamp) => set({ stamps: { ...state.stamps, [id]: stamp } });
  return <div className="task s01">
    <RoleBrief role="Referent:in im Abgeordnetenbüro" title="Schon gefragt?">
      <p><strong>Willkommen im Büro.</strong> Du arbeitest ab heute für eine Bundestagsabgeordnete (Büro und Personen sind erfunden). Sie will im Frühjahr eine eigene Umfrage beauftragen – jede Frage kostet Geld. Was schon einmal gut gefragt wurde, muss niemand neu bezahlen: Der ALLBUS 2023 ist für die Wissenschaft frei verfügbar, und er liegt gerade auf deinem Rechner.</p>
      <p>Vier Ideen liegen auf deinem Tisch. Für jede entscheidest du: <strong>übernehmen</strong> (du nennst die Variable und belegst sie aus dem Codebuch) oder <strong>beauftragen</strong> (du zeigst, wie du gesucht hast). Beides kann schiefgehen. Übernimmst du eine Frage, die etwas anderes misst, argumentiert das Büro mit falschen Zahlen. Beauftragst du eine Frage, die es längst gibt, zahlt es doppelt. Eine Kollegin schaut sich deine Stempel „beauftragen“ an.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du prüfst alle vier Ideen selbst. Die Kollegin im Browser liest deine Stempel „beauftragen“ gegen."
      pair="Vier-Augen-Prinzip: A prüft die Ideen 1 und 3, B die Ideen 2 und 4. Danach prüft jede:r die Stempel „beauftragen“ der anderen Person mit zwei neuen Suchwörtern." />

    <section className="task-step">
      <h3>1 · Handschlag mit R</h3>
      <p>Leg in RStudio ein neues Skript an und lies deine Datei ein. Oben rechts im Environment steht, wie viele Fälle (obs.) und Variablen der Datensatz hat. Trag beide Zahlen ein.</p>
      <RBlock code={SETUP_SCRIPT} file="schon-gefragt.R" />
      <div className="task-grid">
        <label>Fälle (obs.)<input type="text" inputMode="numeric" value={state.cases} onChange={e => set({ cases: e.target.value })} /></label>
        <label>Variablen<input type="text" inputMode="numeric" value={state.vars} onChange={e => set({ vars: e.target.value })} /></label>
      </div>
      <Feedback notes={checkHandshake(data.sav, state.cases, state.vars)} />
      <ErrorDecoder />
      <HintLadder hint={handshakeHint} onConcept={onConcept} />
    </section>

    <section className="task-step">
      <h3>2 · Die vier Ideen</h3>
      <p className="sandbox-note">Such in R mit find_var(), lies mit codebook() nach. Hier kannst du zählen, wie viele Treffer ein Suchwort hat – was sie bedeuten, zeigt dir R.</p>
      {antraege.map((a, i) => <AntragCard key={a.id} n={i + 1} antrag={a} stamp={state.stamps[a.id]} sav={data.sav} onChange={s => setStamp(a.id, s)} onConcept={onConcept} />)}
    </section>

    <section className="task-step">
      <h3>3 · Deine eigene Idee</h3>
      <label className="sandbox-label" htmlFor="s01-idea">Welche Frage würdest du 3.000 Menschen stellen?</label>
      <input id="s01-idea" type="text" value={state.idea} onChange={e => set({ idea: e.target.value })} />
      {state.idea.trim() && <StampEditor sav={data.sav} antrag={null} stamp={state.ideaStamp} onChange={ideaStamp => set({ ideaStamp })} />}
    </section>

    <EmergencyConsole sav={data.sav} />

    <section className="task-step">
      <h3>4 · Prüfbericht</h3>
      <label className="sandbox-label" htmlFor="s01-lesson">Welche Suche hat dich am meisten in die Irre geführt?</label>
      <textarea id="s01-lesson" value={state.lesson} onChange={e => set({ lesson: e.target.value })} />
      <PlenumCard title="Stempelbilanz" lines={plenumLines(state)} file="schon-gefragt-plenum.md" />
      <div className="sandbox-chips">
        <button onClick={() => downloadText('pruefbericht-schon-gefragt.md', reportMarkdown(state), 'text/markdown;charset=utf-8')}><Download size={14} aria-hidden="true" /> Prüfbericht</button>
        <button onClick={() => downloadText('schon-gefragt-suche.R', rScript(state))}><Download size={14} aria-hidden="true" /> R-Skript deiner Suche</button>
      </div>
    </section>
  </div>;
}
```

- [ ] **Step 4: Aufgabendefinition** – `src/tasks/s01-schon-gefragt/index.ts`:

```ts
import type { TaskDef } from '../types';
import { initialS01, parseS01, statusS01, type S01State } from './domain';
import { SchonGefragt } from './SchonGefragt';

export const schonGefragt: TaskDef<S01State> = {
  id: 's01',
  title: 'Schon gefragt?',
  role: 'Referent:in im Abgeordnetenbüro',
  intro: 'Ein (fiktives) Abgeordnetenbüro will eine Umfrage beauftragen. Du prüfst mit R, welche Frageideen der ALLBUS 2023 schon beantwortet. Lade dafür deine eigene ALLBUS-Datei – sie gilt danach für alle Sitzungen.',
  requiredVariables: ['rh08b', 'pt03'],
  initial: initialS01,
  parse: parseS01,
  status: statusS01,
  Component: SchonGefragt,
};
```

- [ ] **Step 5: Anmelden** – `src/tasks/registry.ts` ersetzen durch:

```ts
import { schonGefragt } from './s01-schon-gefragt';
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {
  s01: schonGefragt,
};
```

- [ ] **Step 6: Styles** – an `src/tasks.css` anhängen:

```css
/* Sitzung 1 · Schon gefragt? */
.s01-tester{margin:0 0 6px}
.s01-stamp{border-top:1px solid var(--line);padding-top:10px;margin-top:6px}
.s01-decoder,.s01-emergency{margin:12px 0;font-size:15px}
.s01-decoder summary,.s01-emergency summary{cursor:pointer;color:var(--green)}
.s01-decoder textarea{margin-top:8px}
.s01-emergency input{margin:8px 0}
.s01-emergency code{font-size:13px}
```

- [ ] **Step 7: Tests und Typprüfung**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 139`, `# fail 0`.

Run: `node_modules/.bin/tsc --noEmit`
Expected: keine Ausgabe.

- [ ] **Step 8: Im Browser prüfen (mit eigener Datei).** Dev-Server starten (`node_modules/.bin/vite --host 127.0.0.1 --port 5173`), Sitzung 1 öffnen, `ZA8831_v1-3-0.sav` laden. Erwartet: Handschlag mit 5246/579 → zwei grüne Rückmeldungen; Idee 2 „flüchtling“ → 0 Treffer mit Umlaut-Hinweis, „fluecht“ → 5 Treffer mit Wortteil-Hinweis „kriegsFLUECHTlingen“; Idee 3 übernehmen `pt03`, niedrigster Wert „gar kein Vertrauen“, gestellt 5246 → Hinweis „−11 = TNZ: SPLIT (n = 1.596)“; Idee 4 „einsam“ → „gemEINSAMer“; keine Konsolenfehler; `localStorage['statistikatlas.aufgaben.v1']` enthält nur Eingaben.

- [ ] **Step 9: Commit**

```bash
git add src/tasks src/tasks.css
git commit -m "Add session 1 task UI 'Schon gefragt?' and register it"
```

---

### Task 6: Sitzung 2 „Erster Tag in der Datenerfassung“ – Inhalte und Prüflogik

**Files:**
- Create: `src/tasks/s02-datenerfassung/content.ts`, `src/tasks/s02-datenerfassung/domain.ts`
- Test: `src/tasks/s02-datenerfassung/domain.test.ts`

**Interfaces:**
- Consumes: `SavFile`, `isMissingCode`; Kit aus Task 2.
- Produces:
  - `content.ts`: `S02_VARS`, `type S02Var`, `SHEET_IDS`, `type SheetId`, `type Soll`, `type Mark`, `type Question`, `type Sheet`, `type Entry`, `questions`, `sheets`, `ben`, `benNotes`, `R_SOLUTION`, `hints` (`codes`, `paper`, `convert`)
  - `domain.ts`: `type Entries`, `type S02State` (mit `graded`, `revealed`), `emptyEntries()`, `initialS02()`, `parseS02(raw)`, `statusS02(s)`, `checkCell(sav, variable, input): CellCheck`, `gradeCell(sav, sheet, variable, input): CellGrade`, `benEntries(sav)`, `diffEntries(a, b)`, `encodeRow(e)`, `decodeRow(code)`, `countCode(sav, variable, code, mode?)`, `scanCode(sav, code)`, `factorPosition(sav, variable)`, `checkNumbers(sav, numbers): Note[]`, `plenumLines(s)`, `cellKey(sheet, variable)`

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s02-datenerfassung/domain.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { ben, S02_VARS, sheets, type S02Var } from './content';
import { benEntries, checkCell, checkNumbers, countCode, decodeRow, diffEntries, emptyEntries, encodeRow, factorPosition, gradeCell, initialS02, parseS02, plenumLines, scanCode, statusS02 } from './domain';

const labels = {
  pa02a: { [-9]: 'KEINE ANGABE', 1: 'SEHR STARK', 2: 'STARK', 3: 'MITTEL', 4: 'WENIG', 5: 'UEBERHAUPT NICHT' },
  pa01: { [-42]: 'DATENFEHLER: MFN', [-9]: 'KEINE ANGABE', 1: 'LINKS', 2: '..', 3: '..', 4: '..', 5: '..', 6: '..', 7: '..', 8: '..', 9: '..', 10: 'RECHTS' },
  pt03: { [-11]: 'TNZ: SPLIT', [-9]: 'KEINE ANGABE', 1: 'GAR KEIN VERTRAUEN', 2: '..', 3: '..', 4: '..', 5: '..', 6: '..', 7: 'GROSSES VERTRAUEN' },
  st01: { [-42]: 'DATENFEHLER: MFN', [-11]: 'TNZ: SPLIT', [-9]: 'KEINE ANGABE', [-8]: 'WEISS NICHT', 1: 'MAN KANN TRAUEN', 2: 'MUSS VORSICHTIG SEIN', 3: 'KOMMT DARAUF AN', 4: 'SONSTIGES' },
  pv01: { [-9]: 'KEINE ANGABE', [-8]: 'WEISS NICHT', 1: 'CDU-CSU', 2: 'SPD', 3: 'FDP', 4: 'DIE GRUENEN', 6: 'DIE LINKE', 42: 'AFD', 90: 'ANDERE PARTEI', 91: 'WUERDE NICHT WAEHLEN' },
  ls01: { [-9]: 'KEINE ANGABE', 0: 'GANZ UNZUFRIEDEN', 1: '..', 2: '..', 3: '..', 4: '..', 5: '..', 6: '..', 7: '..', 8: '..', 9: '..', 10: 'GANZ ZUFRIEDEN' },
};
const sav = fakeSav({
  mode: { values: [2, 3, 4, 4, 4, 4], labels: { 2: 'CAPI', 3: 'CAWI', 4: 'MAIL' } },
  pa02a: { values: [1, 2, 3, 4, 5, 2], labels: labels.pa02a, missingFrom: -1 },
  pa01: { values: [3, 5, -42, -42, 8, 2], labels: labels.pa01, missingFrom: -1 },
  pt03: { values: [1, -11, 7, -42, 2, 3], labels: labels.pt03, missingFrom: -1 },
  st01: { values: [-8, 1, -11, 3, 2, -8], labels: labels.st01, missingFrom: -1 },
  pv01: { values: [1, 42, 6, 91, -8, 2], labels: labels.pv01, missingFrom: -1 },
  ls01: { values: [0, 8, 10, 7, -9, 5], labels: labels.ls01, missingFrom: -1 },
});

test('checks a cell against the codebook without giving the answer away', () => {
  assert.equal(checkCell(sav, 'pv01', '').state, 'empty');
  assert.match((checkCell(sav, 'pv01', 'Linke') as { message: string }).message, /als Zahl/);
  assert.match((checkCell(sav, 'pa01', '5,5') as { message: string }).message, /Doppelkreuz ist eine Entscheidung/);
  assert.match((checkCell(sav, 'pv01', '5') as { message: string }).message, /pv01 hat keinen Code 5/);
  assert.deepEqual(checkCell(sav, 'pv01', '6'), { state: 'ok', code: 6 });
  assert.deepEqual(checkCell(sav, 'ls01', '0'), { state: 'ok', code: 0 });
});

test('grades clear cells, leaves open cells to the student and explains typical slips', () => {
  const s1 = sheets[0], s2 = sheets[1], s3 = sheets[2];
  assert.equal(gradeCell(sav, s1, 'pv01', '6').status, 'match');
  assert.equal(gradeCell(sav, s1, 'pa02a', '5').status, 'mismatch');
  assert.match(gradeCell(sav, s1, 'st01', '-9').message ?? '', /stand in Version A gar nicht/);
  assert.equal(gradeCell(sav, s1, 'st01', '-11').status, 'match');
  assert.equal(gradeCell(sav, s2, 'pa01', '5').status, 'open');
  assert.equal(gradeCell(sav, s2, 'pa01', '').status, 'empty');
  assert.match(gradeCell(sav, s3, 'ls01', '-9').message ?? '', /gültige Antwort/);
  assert.equal(gradeCell(sav, s3, 'pt03', '1').status, 'match');
});

test('compares a double entry with Ben and round-trips a partner row code', () => {
  const mine = emptyEntries();
  const codeOf = (v: S02Var, label: string) => String([...sav.byName.get(v)!.valueLabels].find(([, l]) => l === label)![0]);
  for (const sheet of sheets) for (const v of S02_VARS) {
    const soll = sheet.cells[v].soll;
    mine[sheet.id][v] = soll.kind === 'value' ? String(soll.value) : soll.kind === 'label' ? codeOf(v, soll.label) : '5';
  }
  const benRows = benEntries(sav);
  assert.equal(benRows['1'].pa02a, '5');
  assert.equal(benRows['1'].st01, '');
  assert.equal(benRows['3'].ls01, '-9');
  const d = diffEntries(mine, benRows).map(x => `${x.sheet}.${x.variable}`);
  assert.deepEqual(d, ['1.pa02a', '1.st01', '1.pv01', '2.st01', '2.ls01', '3.ls01']);
  assert.equal(Object.keys(ben).length, 3);
  const code = encodeRow(mine);
  assert.deepEqual(decodeRow(code), mine);
  assert.equal(decodeRow('kaputt'), null);
});

test('counts codes by mode, scans for paper-only codes and mirrors to_numeric(to_label())', () => {
  assert.equal(countCode(sav, 'pa01', -42, 4), 2);
  assert.equal(countCode(sav, 'st01', -8, 4), 1);
  assert.equal(countCode(sav, 'st01', -8), 2);
  const scan = scanCode(sav, -42);
  assert.deepEqual(scan, { total: 3, variables: 2, byMode: [{ label: 'CAPI', n: 0 }, { label: 'CAWI', n: 0 }, { label: 'MAIL', n: 3 }] });
  assert.equal(factorPosition(sav, 'pv01').get(42), 4);
  const notes = checkNumbers(sav, { mfn: '2', dk: '1', afd: '4' });
  assert.deepEqual(notes.map(n => n.tone), ['ok', 'ok', 'ok']);
  assert.equal(checkNumbers(sav, { mfn: '9', dk: '', afd: '42' }).map(n => n.tone).join(), 'warn,warn');
  const real = fixtureSav();
  assert.equal(factorPosition(real, 'pv01').get(1), 1);
});

test('restores state defensively and reports status and plenum line', () => {
  assert.deepEqual(parseS02(undefined), initialS02());
  const s = parseS02({ entries: { 2: { pa02a: '4', pa01: 5, x: '1' } }, rules: { '2.pa01': 'Bei zwei Kreuzen: −42.' }, numbers: { afd: '6' } });
  assert.equal(s.entries['2'].pa02a, '4');
  assert.equal(s.entries['2'].pa01, '');
  assert.equal(s.rules['2.pa01'], 'Bei zwei Kreuzen: −42.');
  assert.equal(statusS02(initialS02()), 'open');
  assert.equal(statusS02(s), 'running');
  assert.deepEqual(plenumLines(s)[0], ['Zeile für Bogen 2', '4 | – | – | – | – | –']);
  assert.equal(plenumLines(s)[1][1], 'Bei zwei Kreuzen: −42.');
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s02-datenerfassung/domain.test.ts`
Expected: FAIL mit `Cannot find module './content'`.

- [ ] **Step 3: Inhalte** – `src/tasks/s02-datenerfassung/content.ts` (Soll-Antworten stehen als Labels; der Browser übersetzt sie zur Laufzeit in die Codes der geladenen Datei):

```ts
import type { Hint } from '../kit/HintLadder';

export const S02_VARS = ['pa02a', 'pa01', 'pt03', 'st01', 'pv01', 'ls01'] as const;
export type S02Var = typeof S02_VARS[number];
export const SHEET_IDS = ['1', '2', '3'] as const;
export type SheetId = typeof SHEET_IDS[number];

/** Was richtig erfasst wäre – als Label oder Zahl; die Codes ermittelt der Browser zur Laufzeit aus der Datei. */
export type Soll = { kind: 'label'; label: string } | { kind: 'value'; value: number } | { kind: 'open'; options: string[] };
/** Wie der Bogen aussieht. */
export type Mark =
  | { kind: 'cross'; at: string[] }
  | { kind: 'struck'; struck: string; at: string }
  | { kind: 'between'; a: string; b: string }
  | { kind: 'note'; text: string }
  | { kind: 'empty' }
  | { kind: 'absent' };
export type Question = { variable: S02Var; text: string; options: string[] };
export type Sheet = { id: SheetId; version: 'A' | 'B'; cells: Record<S02Var, { mark: Mark; soll: Soll }> };
/** Eintrag des fiktiven Kollegen Ben. */
export type Entry = { kind: 'label'; label: string } | { kind: 'value'; value: number } | { kind: 'blank' };

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

export const questions: Question[] = [
  { variable: 'pa02a', text: 'Wie stark interessieren Sie sich für Politik?', options: ['sehr stark', 'stark', 'mittel', 'wenig', 'überhaupt nicht'] },
  { variable: 'pa01', text: 'Viele Leute verwenden die Begriffe „links“ und „rechts“. Wo würden Sie sich selbst einstufen? (1 = links, 10 = rechts)', options: range(1, 10) },
  { variable: 'pt03', text: 'Wie viel Vertrauen haben Sie in den Bundestag? (1 = gar kein Vertrauen, 7 = großes Vertrauen)', options: range(1, 7) },
  { variable: 'st01', text: 'Kann man den meisten Menschen vertrauen, oder muss man im Umgang mit anderen vorsichtig sein?', options: ['Man kann den meisten trauen', 'Man muss vorsichtig sein', 'Kommt darauf an', 'Sonstiges'] },
  { variable: 'pv01', text: 'Wenn am nächsten Sonntag Bundestagswahl wäre: Welche Partei würden Sie wählen?', options: ['CDU/CSU', 'SPD', 'FDP', 'Bündnis 90/Die Grünen', 'Die Linke', 'AfD', 'eine andere Partei', 'Ich würde nicht wählen', 'Weiß nicht'] },
  { variable: 'ls01', text: 'Wie zufrieden sind Sie gegenwärtig, alles in allem, mit Ihrem Leben? (0 = ganz unzufrieden, 10 = ganz zufrieden)', options: range(0, 10) },
];

const label = (l: string): Soll => ({ kind: 'label', label: l });
const value = (v: number): Soll => ({ kind: 'value', value: v });
const cross = (...at: string[]): Mark => ({ kind: 'cross', at });

export const sheets: Sheet[] = [
  { id: '1', version: 'A', cells: {
    pa02a: { mark: cross('sehr stark'), soll: label('SEHR STARK') },
    pa01: { mark: cross('3'), soll: value(3) },
    pt03: { mark: cross('6'), soll: value(6) },
    st01: { mark: { kind: 'absent' }, soll: label('TNZ: SPLIT') },
    pv01: { mark: cross('Die Linke'), soll: label('DIE LINKE') },
    ls01: { mark: cross('8'), soll: value(8) },
  } },
  { id: '2', version: 'B', cells: {
    pa02a: { mark: { kind: 'struck', struck: 'mittel', at: 'wenig' }, soll: label('WENIG') },
    pa01: { mark: cross('5', '6'), soll: { kind: 'open', options: ['5', '6', 'DATENFEHLER: MFN'] } },
    pt03: { mark: { kind: 'absent' }, soll: label('TNZ: SPLIT') },
    st01: { mark: { kind: 'note', text: '„weiß nicht so recht, kommt auf die Leute an“' }, soll: { kind: 'open', options: ['KOMMT DARAUF AN', 'WEISS NICHT', 'KEINE ANGABE'] } },
    pv01: { mark: cross('Weiß nicht'), soll: label('WEISS NICHT') },
    ls01: { mark: { kind: 'between', a: '7', b: '8' }, soll: { kind: 'open', options: ['7', '8', 'KEINE ANGABE'] } },
  } },
  { id: '3', version: 'A', cells: {
    pa02a: { mark: cross('überhaupt nicht'), soll: label('UEBERHAUPT NICHT') },
    pa01: { mark: cross('8'), soll: value(8) },
    pt03: { mark: cross('1'), soll: label('GAR KEIN VERTRAUEN') },
    st01: { mark: { kind: 'absent' }, soll: label('TNZ: SPLIT') },
    pv01: { mark: { kind: 'empty' }, soll: label('KEINE ANGABE') },
    ls01: { mark: cross('0'), soll: value(0) },
  } },
];

const bv = (v: number): Entry => ({ kind: 'value', value: v });
const bl = (l: string): Entry => ({ kind: 'label', label: l });
/** Bens Ersterfassung: sechs Abweichungen mit typischen Fehlern. */
export const ben: Record<SheetId, Record<S02Var, Entry>> = {
  '1': { pa02a: bv(5), pa01: bv(3), pt03: bv(6), st01: { kind: 'blank' }, pv01: bv(5), ls01: bv(8) },
  '2': { pa02a: bl('WENIG'), pa01: bv(5), pt03: bl('TNZ: SPLIT'), st01: bl('WEISS NICHT'), pv01: bl('WEISS NICHT'), ls01: bv(8) },
  '3': { pa02a: bl('UEBERHAUPT NICHT'), pa01: bv(8), pt03: bl('GAR KEIN VERTRAUEN'), st01: bl('TNZ: SPLIT'), pv01: bl('KEINE ANGABE'), ls01: bl('KEINE ANGABE') },
};
export const benNotes: Record<string, string> = {
  '1.pa02a': 'Ben hat die Richtung der Skala verwechselt.',
  '1.pv01': 'Ben hat den Listenplatz auf dem Bogen eingetragen, nicht den Code.',
  '1.st01': 'Ben hat die Zelle leer gelassen – in R wird daraus ein namenloses NA.',
  '2.pa01': 'Ben hat einfach das erste Kreuz genommen.',
  '2.ls01': 'Ben hat aufgerundet.',
  '3.ls01': 'Ben hat die 0 als „keine Angabe“ gelesen – sie ist eine gültige Antwort.',
};

export const R_SOLUTION = `library(mariposa)
library(dplyr)

allbus <- read_spss(file.choose())

# Block 1: Welche Zahl gehört zu welchem Wort?
allbus %>%
  codebook(pa02a, pa01, pt03, st01, pv01, ls01, mode, splt23_1) %>%
  summary()

# Block 2: Wie speichert der ALLBUS Papierbögen?
papier <- allbus %>% filter(mode == 4)   # 4 = MAIL
papier %>%
  codebook(pa01, st01, pt03) %>%
  summary()

# Block 3: Was passiert beim Umwandeln?
allbus %>%
  mutate(partei_text = to_label(pv01),
         partei_zahl = to_numeric(partei_text)) %>%
  frequency(pv01, partei_zahl) %>%
  summary()
`;

export const hints: Record<'codes' | 'paper' | 'convert', Hint> = {
  codes: {
    think: 'Auf dem Papier stehen Wörter, im Datensatz Zahlen. Wo steht, welche Zahl zu welchem Wort gehört?',
    pointer: 'codebook() zeigt zu jeder Variable Fragetext, Codes, Wertelabels und fehlende Angaben.',
    concept: { id: 'labels', label: 'Variablen- & Wertelabels' },
    workshop: '4.4.2 codebook()',
    scaffold: 'allbus %>%\n  codebook(___, ___, ___) %>%\n  summary()',
    solution: 'allbus %>%\n  codebook(pa02a, pa01, pt03, st01, pv01, ls01, mode, splt23_1) %>%\n  summary()',
  },
  paper: {
    think: 'Welche Spalte verrät, auf welchem Weg jemand geantwortet hat – und welche Zahl heißt MAIL?',
    pointer: 'mode ist der Erhebungsmodus. Mit filter() behältst du nur die Zeilen, die eine Bedingung erfüllen.',
    concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
    workshop: '4.5.2 Fälle filtern',
    scaffold: 'papier <- allbus %>% filter(mode == ___)\npapier %>%\n  codebook(___, ___) %>%\n  summary()',
    solution: 'papier <- allbus %>% filter(mode == 4)\npapier %>%\n  codebook(pa01, st01, pt03) %>%\n  summary()',
  },
  convert: {
    think: 'Was passiert mit einem Code, wenn man ihn in ein Wort und wieder zurück in eine Zahl verwandelt?',
    pointer: 'to_label() macht aus Codes Wörter (einen Faktor), to_numeric() macht daraus wieder Zahlen.',
    concept: { id: 'conversion', label: 'Datentypen umwandeln' },
    workshop: '4.6 Datentypen',
    scaffold: 'allbus %>%\n  mutate(partei_text = to_label(___),\n         partei_zahl = to_numeric(___)) %>%\n  frequency(pv01, partei_zahl) %>%\n  summary()',
    solution: 'allbus %>%\n  mutate(partei_text = to_label(pv01),\n         partei_zahl = to_numeric(partei_text)) %>%\n  frequency(pv01, partei_zahl) %>%\n  summary()',
  },
};
```

- [ ] **Step 4: Prüflogik** – `src/tasks/s02-datenerfassung/domain.ts`:

```ts
import { isMissingCode, type SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { ben, S02_VARS, SHEET_IDS, type Entry, type S02Var, type Sheet, type SheetId, type Soll } from './content';

export type Entries = Record<SheetId, Record<S02Var, string>>;
export type S02State = {
  mode: WorkMode;
  entries: Entries;
  /** Erfassungsregeln für offene Zellen, Schlüssel „Bogen.Variable“. */
  rules: Record<string, string>;
  /** Schlichtung der Doppelerfassung, Schlüssel „Bogen.Variable“. */
  settled: Record<string, 'mine' | 'other'>;
  partnerCode: string;
  numbers: { mfn: string; dk: string; afd: string };
  plenumRule: string;
  /** Erst nach „Erfassung abschließen“ werden eindeutige Zellen bewertet. */
  graded: boolean;
  revealed: boolean;
};

export const emptyEntries = (): Entries => Object.fromEntries(SHEET_IDS.map(id => [id, Object.fromEntries(S02_VARS.map(v => [v, '']))])) as Entries;
export const initialS02 = (): S02State => ({
  mode: 'solo', entries: emptyEntries(), rules: {}, settled: {}, partnerCode: '', numbers: { mfn: '', dk: '', afd: '' }, plenumRule: '', graded: false, revealed: false,
});
const cellKey = (sheet: SheetId, variable: S02Var) => `${sheet}.${variable}`;
const KEY = /^[123]\.(pa02a|pa01|pt03|st01|pv01|ls01)$/;

export function parseS02(raw: unknown): S02State {
  const r = record(raw), e = record(r.entries), n = record(r.numbers);
  const entries = emptyEntries();
  for (const id of SHEET_IDS) { const row = record(e[id]); for (const v of S02_VARS) entries[id][v] = str(row[v], 8); }
  const rules: Record<string, string> = {}, settled: Record<string, 'mine' | 'other'> = {};
  for (const [k, v] of Object.entries(record(r.rules))) if (KEY.test(k)) rules[k] = str(v, 300);
  for (const [k, v] of Object.entries(record(r.settled))) if (KEY.test(k) && (v === 'mine' || v === 'other')) settled[k] = v;
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'), entries, rules, settled, partnerCode: str(r.partnerCode, 400),
    numbers: { mfn: str(n.mfn, 12), dk: str(n.dk, 12), afd: str(n.afd, 12) }, plenumRule: str(r.plenumRule, 300),
    graded: bool(r.graded), revealed: bool(r.revealed),
  };
}

export function statusS02(s: S02State): TaskStatus {
  const cells = SHEET_IDS.flatMap(id => S02_VARS.map(v => s.entries[id][v]));
  if (cells.every(c => c.trim()) && s.numbers.mfn && s.numbers.dk && s.numbers.afd) return 'done';
  return cells.some(c => c.trim()) || s.numbers.mfn || s.numbers.afd ? 'running' : 'open';
}

/* ---------- Zellen prüfen ---------- */

export type CellCheck = { state: 'empty'; message: string } | { state: 'invalid'; message: string } | { state: 'ok'; code: number };

export function checkCell(sav: SavFile, variable: S02Var, input: string): CellCheck {
  if (!input.trim()) return { state: 'empty', message: 'Eine leere Zelle wird in R zu einem namenlosen NA. Der ALLBUS speichert, warum etwas fehlt.' };
  const x = parseNumber(input);
  if (x === null) return { state: 'invalid', message: 'Bitte den Code als Zahl eintragen – das Wort dazu steht im Codebuch.' };
  if (!Number.isInteger(x)) return { state: 'invalid', message: `Ein Doppelkreuz ist eine Entscheidung, keine Rechnung: ${de(x)} hat kein Label.` };
  const v = sav.byName.get(variable);
  if (v && !v.valueLabels.has(x)) return { state: 'invalid', message: `${variable} hat keinen Code ${x}.` };
  return { state: 'ok', code: x };
}

/** Übersetzt ein Label oder einen Wert in den Code der geladenen Datei. */
function resolve(sav: SavFile, variable: S02Var, e: Soll | Entry): number | null {
  if (e.kind === 'value') return e.value;
  if (e.kind !== 'label') return null;
  const hit = [...(sav.byName.get(variable)?.valueLabels ?? [])].find(([, l]) => l.toUpperCase() === e.label.toUpperCase());
  return hit ? hit[0] : null;
}

export type CellGrade = { status: 'match' | 'mismatch' | 'open' | 'invalid' | 'empty'; message?: string };

export function gradeCell(sav: SavFile, sheet: Sheet, variable: S02Var, input: string): CellGrade {
  const check = checkCell(sav, variable, input);
  if (check.state !== 'ok') return { status: check.state, message: check.message };
  const soll = sheet.cells[variable].soll;
  if (soll.kind === 'open') return { status: 'open', message: 'Hier musst du entscheiden. Schreib deine Regel dazu, damit die nächste Person genauso erfasst.' };
  const want = resolve(sav, variable, soll);
  if (want === check.code) return { status: 'match' };
  const v = sav.byName.get(variable)!;
  if (soll.kind === 'label' && /^TNZ/i.test(soll.label)) return { status: 'mismatch', message: `Diese Frage stand in Version ${sheet.version} gar nicht auf dem Bogen. Welcher Code sagt „nicht gefragt“?` };
  if (soll.kind === 'value' && soll.value === 0 && isMissingCode(v, check.code)) return { status: 'mismatch', message: 'Die 0 ist hier eine gültige Antwort (ganz unzufrieden), keine fehlende Angabe.' };
  return { status: 'mismatch', message: 'Das passt nicht zum Codebuch. Welche Zahl steht dort beim angekreuzten Wort – und in welche Richtung läuft die Skala?' };
}

/* ---------- Doppelerfassung ---------- */

export function benEntries(sav: SavFile): Entries {
  const out = emptyEntries();
  for (const id of SHEET_IDS) for (const v of S02_VARS) {
    const code = resolve(sav, v, ben[id][v]);
    out[id][v] = code === null ? '' : String(code);
  }
  return out;
}

const same = (a: string, b: string) => {
  const x = parseNumber(a), y = parseNumber(b);
  return x === null || y === null ? a.trim() === b.trim() : x === y;
};

export function diffEntries(a: Entries, b: Entries): { sheet: SheetId; variable: S02Var }[] {
  return SHEET_IDS.flatMap(sheet => S02_VARS.filter(v => !same(a[sheet][v], b[sheet][v])).map(variable => ({ sheet, variable })));
}

/** Kompakter Zeilencode zum Abtippen in der Partnervariante: „S02:1,4,…“ mit 18 Werten. */
export const encodeRow = (e: Entries) => `S02:${SHEET_IDS.flatMap(id => S02_VARS.map(v => e[id][v].trim())).join(',')}`;

export function decodeRow(code: string): Entries | null {
  const m = /^S02:(.*)$/.exec(code.trim());
  if (!m) return null;
  const values = m[1].split(',');
  if (values.length !== SHEET_IDS.length * S02_VARS.length) return null;
  const out = emptyEntries();
  SHEET_IDS.forEach((id, i) => S02_VARS.forEach((v, j) => { out[id][v] = values[i * S02_VARS.length + j].trim(); }));
  return out;
}

/* ---------- Die drei Zahlen aus R ---------- */

export function countCode(sav: SavFile, variable: string, code: number, mode?: number): number {
  const v = sav.byName.get(variable), m = sav.byName.get('mode');
  if (!v) return 0;
  let n = 0;
  v.values.forEach((x, i) => { if (x === code && (mode === undefined || m?.values[i] === mode)) n++; });
  return n;
}

export function scanCode(sav: SavFile, code: number) {
  const m = sav.byName.get('mode');
  const modes = [...new Set(Array.from(m?.values ?? []))].filter(x => !Number.isNaN(x)).sort((a, b) => a - b);
  const byMode = modes.map(x => ({ label: m?.valueLabels.get(x) ?? String(x), n: 0 }));
  let total = 0, variables = 0;
  for (const v of sav.variables) {
    if (v.kind !== 'numeric' || v.name === 'mode') continue;
    let hit = false;
    v.values.forEach((x, i) => { if (x === code) { total++; hit = true; const k = modes.indexOf(m?.values[i] ?? NaN); if (k >= 0) byMode[k].n++; } });
    if (hit) variables++;
  }
  return { total, variables, byMode };
}

/** Position eines Codes nach to_numeric(to_label(x)): gültige Codes, die vorkommen, fortlaufend nummeriert. */
export function factorPosition(sav: SavFile, variable: string): Map<number, number> {
  const v = sav.byName.get(variable);
  if (!v) return new Map();
  const present = new Set(Array.from(v.values).filter(x => !isMissingCode(v, x)));
  const codes = [...v.valueLabels.keys()].filter(c => present.has(c)).sort((a, b) => a - b);
  return new Map(codes.map((c, i) => [c, i + 1]));
}

export function checkNumbers(sav: SavFile, numbers: S02State['numbers']): Note[] {
  const notes: Note[] = [];
  const mfn = parseNumber(numbers.mfn), dk = parseNumber(numbers.dk), afd = parseNumber(numbers.afd);
  const wantMfn = countCode(sav, 'pa01', -42, 4), elsewhere = countCode(sav, 'pa01', -42) - wantMfn;
  if (mfn !== null) notes.push(mfn === wantMfn
    ? { tone: 'ok', text: `Stimmt: ${wantMfn} Papierbögen haben bei links–rechts mehrere Kreuze. In allen anderen Modi zusammen: ${elsewhere}.` }
    : { tone: 'warn', text: 'Zähl in der Papier-Teilmenge die Zeilen mit −42 bei pa01.' });
  const wantDk = countCode(sav, 'st01', -8, 4);
  if (dk !== null) notes.push(dk === wantDk
    ? { tone: 'ok', text: `Stimmt: ${wantDk}. ${wantDk === 0 ? 'Das Codebuch listet „weiß nicht“, auf Papier kommt es nie vor. ' : ''}Was heißt das für deine Randnotiz?` }
    : { tone: 'warn', text: 'Schau in der Papier-Teilmenge bei st01 nach dem Code −8.' });
  const wantAfd = factorPosition(sav, 'pv01').get(42);
  if (afd !== null && wantAfd !== undefined) notes.push(afd === wantAfd
    ? { tone: 'ok', text: `Stimmt: Nach dem Umwandeln trägt die AfD die ${wantAfd}. Codes sind Namen, keine Rangplätze – beim Umwandeln wird neu durchnummeriert.` }
    : { tone: 'warn', text: 'Vergleich in der Häufigkeitstabelle die Zeile der AfD in pv01 und in partei_zahl.' });
  return notes;
}

/* ---------- Ergebnis ---------- */

export function plenumLines(s: S02State): [string, string][] {
  const row = S02_VARS.map(v => s.entries['2'][v].trim() || '–').join(' | ');
  const rule = s.plenumRule.trim() || Object.values(s.rules).find(r => r.trim()) || '';
  return [['Zeile für Bogen 2', row], ['Meine Regel', rule]];
}

export { cellKey };
```

- [ ] **Step 5: Tests und Typprüfung**

Run: `node --import tsx --test src/tasks/s02-datenerfassung/domain.test.ts`
Expected: `# pass 5`, `# fail 0`.

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit`
Expected: `# pass 144`, `# fail 0`; tsc ohne Ausgabe.

- [ ] **Step 6: Commit**

```bash
git add src/tasks/s02-datenerfassung
git commit -m "Add session 2 domain: cell checks, double entry, paper-only codes, factor positions"
```

---

### Task 7: Sitzung 2 – Faksimiles, Oberfläche und Anmeldung

**Files:**
- Create: `src/tasks/s02-datenerfassung/PaperSheet.tsx`, `src/tasks/s02-datenerfassung/Datenerfassung.tsx`, `src/tasks/s02-datenerfassung/index.ts`
- Modify: `src/tasks/registry.ts`, `src/tasks.css`
- Test: `src/tasks/s02-datenerfassung/task.test.ts`

**Interfaces:**
- Consumes: alles aus Task 6; Kit.
- Produces: `datenerfassung: TaskDef<S02State>` (id `s02`, `requiredVariables: ['mode', 'pa02a', 'pa01', 'pt03', 'st01', 'pv01', 'ls01']`). Die Faksimiles sind gestaltetes HTML (echter Text, Beschreibung der Kreuze für Screenreader) – Abweichung von „SVG“ in der Spezifikation, dort korrigiert (Task 10).

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s02-datenerfassung/task.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialS02 } from './domain';
import { renderSession } from '../testRender';

test('session 2 shows three paper sheets, the entry grid and the release step', () => {
  const html = renderSession(1);
  assert.match(html, /Erster Tag in der Datenerfassung/);
  assert.match(html, /Fragebogen · Version A · Bogen 1/);
  assert.match(html, /Fragebogen · Version B · Bogen 2/);
  assert.match(html, /Kreuze bei „5“ und „6“/);
  assert.match(html, /Randnotiz/);
  assert.match(html, /aria-label="Bogen 2, pa01"/);
  assert.match(html, /Erfassung abschließen/);
  assert.doesNotMatch(html, /3 · Doppelerfassung/);
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /Dein ganzes R-Skript/);
});

test('after grading, open cells ask for a rule and Ben is compared', () => {
  const state = { ...initialS02(), graded: true, entries: { ...initialS02().entries, '2': { pa02a: '4', pa01: '5', pt03: '-11', st01: '3', pv01: '-8', ls01: '8' } } };
  const html = renderSession(1, true, undefined, { tasks: { s02: state } });
  assert.match(html, /Hier musstest du entscheiden/);
  assert.match(html, /Bogen 2, pa01 \(du hast 5 eingetragen\)/);
  assert.match(html, /3 · Doppelerfassung/);
  assert.match(html, /Ben/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s02-datenerfassung/task.test.ts`
Expected: FAIL (Sitzung 2 zeigt noch „AUFGABE FOLGT“).

- [ ] **Step 3: Faksimile** – `src/tasks/s02-datenerfassung/PaperSheet.tsx`:

```tsx
import { questions, type Mark, type Sheet } from './content';

function describe(mark: Mark): string {
  switch (mark.kind) {
    case 'cross': return mark.at.length > 1 ? `Kreuze bei „${mark.at.join('“ und „')}“` : `Kreuz bei „${mark.at[0]}“`;
    case 'struck': return `„${mark.struck}“ angekreuzt und durchgestrichen, Kreuz bei „${mark.at}“`;
    case 'between': return `Kreuz auf der Linie zwischen ${mark.a} und ${mark.b}`;
    case 'note': return `kein Kreuz, Randnotiz: ${mark.text}`;
    case 'empty': return 'kein Kreuz';
    case 'absent': return '';
  }
}

function Options({ options, mark }: { options: string[]; mark: Mark }) {
  return <span className="s02-options">
    {options.map(o => {
      const crossed = (mark.kind === 'cross' && mark.at.includes(o)) || (mark.kind === 'struck' && (mark.at === o || mark.struck === o));
      const struck = mark.kind === 'struck' && mark.struck === o;
      return <span key={o} className="s02-option">
        <span className="s02-box">{crossed ? '✕' : ''}</span>
        {struck ? <s>{o}</s> : o}
        {mark.kind === 'between' && mark.a === o && <span className="s02-between">✕</span>}
      </span>;
    })}
  </span>;
}

/** Nachgestellter Papierbogen (erfundene Person). Fragen, die in einer Version fehlen, stehen nicht auf dem Bogen. */
export function PaperSheet({ sheet }: { sheet: Sheet }) {
  return <figure className="s02-paper" aria-label={`Bogen ${sheet.id}, Version ${sheet.version}`}>
    <figcaption>Fragebogen · Version {sheet.version} · Bogen {sheet.id} <small>(erfundene Person)</small></figcaption>
    <ol>
      {questions.filter(q => sheet.cells[q.variable].mark.kind !== 'absent').map(q => {
        const mark = sheet.cells[q.variable].mark;
        return <li key={q.variable}>
          <p>{q.text}</p>
          <Options options={q.options} mark={mark} />
          {mark.kind === 'note' && <span className="s02-note">{mark.text}</span>}
          <span className="sr-only">{describe(mark)}</span>
        </li>;
      })}
    </ol>
  </figure>;
}
```

- [ ] **Step 4: Oberfläche** – `src/tasks/s02-datenerfassung/Datenerfassung.tsx` (Code für die R-Blöcke 2 und 3 nur über die Hilfeleiter; das ganze Skript erscheint erst, wenn alle drei Zahlen stimmen):

```tsx
import type { SavFile } from '../../sandbox/readSav';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { benNotes, hints, R_SOLUTION, S02_VARS, SHEET_IDS, sheets, type S02Var, type SheetId } from './content';
import { benEntries, cellKey, checkCell, checkNumbers, decodeRow, diffEntries, encodeRow, gradeCell, plenumLines, scanCode, type Entries, type S02State } from './domain';
import { PaperSheet } from './PaperSheet';

const sheetById = Object.fromEntries(sheets.map(s => [s.id, s])) as Record<SheetId, (typeof sheets)[number]>;

function EntryGrid({ sav, state, set }: { sav: SavFile; state: S02State; set: (patch: Partial<S02State>) => void }) {
  const setCell = (sheet: SheetId, v: S02Var, value: string) =>
    set({ entries: { ...state.entries, [sheet]: { ...state.entries[sheet], [v]: value } } });
  const messages: string[] = [];
  const open: { sheet: SheetId; variable: S02Var }[] = [];
  for (const sheet of SHEET_IDS) for (const v of S02_VARS) {
    const input = state.entries[sheet][v];
    if (!state.graded) {
      const check = checkCell(sav, v, input);
      if (input.trim() && check.state === 'invalid') messages.push(`Bogen ${sheet}, ${v}: ${check.message}`);
      continue;
    }
    const grade = gradeCell(sav, sheetById[sheet], v, input);
    if (grade.status === 'open') open.push({ sheet, variable: v });
    else if (grade.status !== 'match') messages.push(`Bogen ${sheet}, ${v}: ${grade.message}`);
  }
  return <>
    <table className="sandbox-table s02-grid">
      <caption className="sr-only">Erfassungsraster: je Variable ein Code pro Bogen</caption>
      <thead><tr><th scope="col">Variable</th>{SHEET_IDS.map(id => <th key={id} scope="col">Bogen {id}</th>)}</tr></thead>
      <tbody>{S02_VARS.map(v => <tr key={v}>
        <th scope="row"><code>{v}</code></th>
        {SHEET_IDS.map(id => {
          const grade = state.graded ? gradeCell(sav, sheetById[id], v, state.entries[id][v]).status : '';
          return <td key={id}><input type="text" inputMode="numeric" className={grade ? `grade-${grade}` : ''} aria-label={`Bogen ${id}, ${v}`}
            value={state.entries[id][v]} onChange={e => setCell(id, v, e.target.value)} /></td>;
        })}
      </tr>)}</tbody>
    </table>
    {messages.length > 0 && <ul className="task-feedback">{messages.map(m => <li key={m} className="tone-warn">{m}</li>)}</ul>}
    {!state.graded
      ? <button className="primary" onClick={() => set({ graded: true })}>Erfassung abschließen</button>
      : open.length > 0 && <div className="s02-rules">
          <p>Hier musstest du entscheiden. Schreib deine Regel so auf, dass die nächste Person genauso erfasst:</p>
          {open.map(({ sheet, variable }) => {
            const key = cellKey(sheet, variable);
            return <label key={key} className="sandbox-label">Bogen {sheet}, {variable} (du hast {state.entries[sheet][variable]} eingetragen)
              <input type="text" value={state.rules[key] ?? ''} onChange={e => set({ rules: { ...state.rules, [key]: e.target.value } })} />
            </label>;
          })}
        </div>}
  </>;
}

function DoubleEntry({ sav, state, set }: { sav: SavFile; state: S02State; set: (patch: Partial<S02State>) => void }) {
  const partner = state.mode === 'pair' ? decodeRow(state.partnerCode) : null;
  const other: Entries | null = state.mode === 'pair' ? partner : benEntries(sav);
  const who = state.mode === 'pair' ? 'Partner:in' : 'Ben';
  const diffs = other ? diffEntries(state.entries, other) : [];
  const settle = (sheet: SheetId, variable: S02Var, choice: 'mine' | 'other') => {
    const key = cellKey(sheet, variable);
    const entries = choice === 'other' && other
      ? { ...state.entries, [sheet]: { ...state.entries[sheet], [variable]: other[sheet][variable] } }
      : state.entries;
    set({ entries, settled: { ...state.settled, [key]: choice } });
  };
  return <>
    {state.mode === 'pair' && <div className="task-grid">
      <label>Dein Zeilencode (zum Abtippen für die andere Person)<input type="text" readOnly value={encodeRow(state.entries)} /></label>
      <label>Zeilencode deiner Partnerin oder deines Partners<input type="text" value={state.partnerCode} onChange={e => set({ partnerCode: e.target.value })} /></label>
    </div>}
    {state.mode === 'pair' && state.partnerCode.trim() && !partner && <p className="sandbox-error">Der Code ist unvollständig. Er beginnt mit „S02:“ und hat 18 Werte.</p>}
    {other && (diffs.length === 0
      ? <p className="sandbox-note">Keine Abweichungen zu {who}.</p>
      : <ul className="s02-diffs">{diffs.map(({ sheet, variable }) => {
          const key = cellKey(sheet, variable);
          const settled = state.settled[key];
          return <li key={key}>
            <span>Bogen {sheet}, <code>{variable}</code>: du {state.entries[sheet][variable] || 'leer'} · {who} {other[sheet][variable] || 'leer'}</span>
            <span className="sandbox-chips">
              <button aria-pressed={settled === 'mine'} onClick={() => settle(sheet, variable, 'mine')}>Meine Zahl bleibt</button>
              <button aria-pressed={settled === 'other'} onClick={() => settle(sheet, variable, 'other')}>Übernehmen</button>
            </span>
            {settled && state.mode === 'solo' && benNotes[key] && <small>{benNotes[key]}</small>}
          </li>;
        })}</ul>)}
  </>;
}

export function Datenerfassung({ data, state, onChange, onConcept }: TaskProps<S02State>) {
  const set = (patch: Partial<S02State>) => onChange({ ...state, ...patch });
  const scan = state.revealed ? scanCode(data.sav, -42) : null;
  const numberNotes = checkNumbers(data.sav, state.numbers);
  const allRight = numberNotes.length === 3 && numberNotes.every(n => n.tone === 'ok');
  return <div className="task s02">
    <RoleBrief role="Datenerfasser:in im Feldinstitut" title="Erster Tag in der Datenerfassung">
      <p>Du fängst heute in der Erfassungsstelle eines Feldinstituts an. Institut und Kollegium sind erfunden, die Daten nicht: Fast jede dritte Zeile im ALLBUS 2023 war einmal Papier – 1.656 Menschen haben ihren Fragebogen per Post zurückgeschickt. Jemand hat aus den Kreuzen Zahlen gemacht. Heute bist du das.</p>
      <p>Mach aus jedem der drei Bögen eine Zeile, die so im ALLBUS stehen könnte. Auf dem Papier stehen Wörter; welche Zahl du eintippst, verrät nur das Codebuch. Nicht jedes Kreuz ist eindeutig. Wo du entscheiden musst, entscheidest du – und schreibst deine Regel auf. Alles wird doppelt erfasst. Jede Abweichung landet wieder bei dir.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Dein Kollege Ben (erfunden) hat die Bögen schon einmal erfasst. Du gleichst mit ihm ab."
      pair="A und B erfassen blind jede:r für sich. Danach tippt ihr gegenseitig eure Zeilencodes ab. In R übernimmt A den Block „Papier“, B den Block „Umwandeln“." />

    <section className="task-step">
      <h3>1 · Welche Zahl gehört zu welchem Wort?</h3>
      <p>Lies deine Datei in R ein und schau dir die sechs Variablen der Bögen im Codebuch an.</p>
      <RBlock code={'library(mariposa)\nlibrary(dplyr)\n\nallbus <- read_spss(file.choose())\n\n' + hints.codes.solution} />
      <HintLadder hint={hints.codes} onConcept={onConcept} />
    </section>

    <section className="task-step">
      <h3>2 · Erfassen</h3>
      <div className="s02-sheets">{sheets.map(s => <PaperSheet key={s.id} sheet={s} />)}</div>
      <EntryGrid sav={data.sav} state={state} set={set} />
    </section>

    {state.graded && <section className="task-step">
      <h3>3 · Doppelerfassung</h3>
      <DoubleEntry sav={data.sav} state={state} set={set} />
    </section>}

    <section className="task-step">
      <h3>4 · Wie speichert der ALLBUS Papier?</h3>
      <p>Filter in R die Papierbögen und schau nach, was der ALLBUS bei Doppelkreuzen und bei „weiß nicht“ gespeichert hat. Wandle danach die Wahlabsicht in Wörter und zurück in Zahlen um.</p>
      <HintLadder hint={hints.paper} onConcept={onConcept} />
      <HintLadder hint={hints.convert} onConcept={onConcept} file="datenerfassung.R" />
      <div className="task-grid">
        <label>Papierbögen mit −42 bei pa01<input type="text" inputMode="numeric" value={state.numbers.mfn} onChange={e => set({ numbers: { ...state.numbers, mfn: e.target.value } })} /></label>
        <label>Papierbögen mit −8 bei st01<input type="text" inputMode="numeric" value={state.numbers.dk} onChange={e => set({ numbers: { ...state.numbers, dk: e.target.value } })} /></label>
        <label>Zahl der AfD nach dem Umwandeln<input type="text" inputMode="numeric" value={state.numbers.afd} onChange={e => set({ numbers: { ...state.numbers, afd: e.target.value } })} /></label>
      </div>
      <Feedback notes={numberNotes} />
      {!state.revealed
        ? <button onClick={() => set({ revealed: true })}>Wo steht −42 im ganzen Datensatz?</button>
        : scan && <p className="s02-reveal" role="status">
            {scan.total.toLocaleString('de-DE')} Zellen mit −42 („Mehrfachnennung“) in {scan.variables} Variablen: {scan.byMode.map(m => `${m.label} ${m.n.toLocaleString('de-DE')}`).join(' · ')}.
            {scan.byMode.every(m => m.label === 'MAIL' || m.n === 0) && ' Diesen Code gibt es nur, weil es Papier gibt.'}
          </p>}
    </section>

    <section className="task-step">
      <h3>5 · Freigabe</h3>
      <label className="sandbox-label" htmlFor="s02-rule">Welche deiner Regeln soll für alle 1.656 Papierbögen gelten?</label>
      <input id="s02-rule" type="text" value={state.plenumRule} onChange={e => set({ plenumRule: e.target.value })} />
      <PlenumCard title="Eine Person, viele Zeilen" lines={plenumLines(state)} file="datenerfassung-plenum.md" />
      {allRight && <details className="s02-solution"><summary>Dein ganzes R-Skript zum Mitnehmen</summary><RBlock code={R_SOLUTION} file="datenerfassung.R" /></details>}
    </section>
  </div>;
}
```

- [ ] **Step 5: Aufgabendefinition** – `src/tasks/s02-datenerfassung/index.ts`:

```ts
import type { TaskDef } from '../types';
import { Datenerfassung } from './Datenerfassung';
import { initialS02, parseS02, statusS02, type S02State } from './domain';

export const datenerfassung: TaskDef<S02State> = {
  id: 's02',
  title: 'Erster Tag in der Datenerfassung',
  role: 'Datenerfasser:in im Feldinstitut',
  intro: 'Du machst aus drei Papierfragebögen Datenzeilen, so wie sie im ALLBUS stehen könnten – und entscheidest, was bei mehrdeutigen Kreuzen gilt. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['mode', 'pa02a', 'pa01', 'pt03', 'st01', 'pv01', 'ls01'],
  initial: initialS02,
  parse: parseS02,
  status: statusS02,
  Component: Datenerfassung,
};
```

- [ ] **Step 6: Anmelden** – `src/tasks/registry.ts` ersetzen durch:

```ts
import { schonGefragt } from './s01-schon-gefragt';
import { datenerfassung } from './s02-datenerfassung';
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {
  s01: schonGefragt,
  s02: datenerfassung,
};
```

- [ ] **Step 7: Styles** – an `src/tasks.css` anhängen:

```css
/* Sitzung 2 · Erster Tag in der Datenerfassung */
.s02-sheets{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:0 0 16px}
.s02-paper{margin:0;background:#fffef8;border:1px solid #d9d4bf;box-shadow:2px 3px 0 #ebe6d2;padding:14px 16px;font:14px/1.45 Georgia,serif}
.s02-paper figcaption{font:600 13px/1.4 var(--sans);color:var(--muted);border-bottom:1px solid #d9d4bf;padding-bottom:6px;margin-bottom:8px}
.s02-paper ol{margin:0;padding-left:18px}
.s02-paper li{margin:0 0 10px}
.s02-paper p{margin:0 0 4px}
.s02-options{display:flex;flex-wrap:wrap;gap:4px 10px}
.s02-option{position:relative;display:inline-flex;align-items:center;gap:4px;font-size:13px}
.s02-box{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border:1px solid #6b6750;font:700 13px/1 var(--sans);color:#1f3f8f}
.s02-between{position:absolute;right:-11px;top:-2px;font:700 14px/1 var(--sans);color:#1f3f8f}
.s02-note{display:block;margin-top:4px;font:italic 14px/1.3 'Bradley Hand','Segoe Script',cursive;color:#1f3f8f;transform:rotate(-2deg)}
.s02-grid input{width:100%;text-align:right;border:1px solid var(--line);border-radius:5px;padding:5px 7px;font:15px/1.3 var(--sans)}
.s02-grid input.grade-match{border-color:#7fae78;background:#f1f8ef}
.s02-grid input.grade-mismatch,.s02-grid input.grade-invalid,.s02-grid input.grade-empty{border-color:var(--red);background:#fbefec}
.s02-grid input.grade-open{border-color:#c9a64a;background:#fdf8e8}
.s02-rules,.s02-diffs{margin:12px 0}
.s02-diffs{list-style:none;padding:0}
.s02-diffs li{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;border-bottom:1px solid var(--line);padding:6px 0;font-size:14px}
.s02-diffs small{flex-basis:100%;color:var(--muted)}
.s02-reveal{background:var(--soft);border-radius:8px;padding:10px 14px;font-size:14px}
.s02-solution{margin:12px 0}
```

- [ ] **Step 8: Tests und Typprüfung**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 146`, `# fail 0`.

Run: `node_modules/.bin/tsc --noEmit`
Expected: keine Ausgabe.

- [ ] **Step 9: Im Browser prüfen (mit eigener Datei).** Sitzung 2: `5,5` in „Bogen 2, pa01“ → „Ein Doppelkreuz ist eine Entscheidung …“; nach „Erfassung abschließen“ drei offene Zellen (Bogen 2: pa01, st01, ls01) mit Regelfeld; Doppelerfassung mit Ben zeigt die Abweichungen; R-Zahlen 24 / 0 / 6 → drei grüne Rückmeldungen; „Wo steht −42 …?“ → „638 Zellen … in 202 Variablen: CAPI 0 · CAWI 0 · MAIL 638. Diesen Code gibt es nur, weil es Papier gibt.“; bei 390 px kein horizontales Überlaufen.

- [ ] **Step 10: Commit**

```bash
git add src/tasks src/tasks.css
git commit -m "Add session 2 task UI 'Erster Tag in der Datenerfassung' with paper facsimiles"
```

---

### Task 8: Sitzung 3 „Deutschland in 100 Stühlen“ – Inhalte und Prüflogik

**Files:**
- Create: `src/tasks/s03-stuehle/content.ts`, `src/tasks/s03-stuehle/domain.ts`
- Test: `src/tasks/s03-stuehle/domain.test.ts`

**Interfaces:**
- Consumes: `SavFile`, `SavVariable`, `isMissingCode`; Kit.
- Produces:
  - `content.ts`: `CHAIR_CODES = [-8, -7, -50, -9, -42]`, `type Selection = 'gefragt' | 'vollzeit' | 'teilzeit' | 'alle0'`, `SELECTIONS`, `R_SOLUTION`, `hints` (`hall`, `row`)
  - `domain.ts`: `type Measure`, `type Sign`, `type S03State`, `initialS03()`, `parseS03(raw)`, `statusS03(s)`, `rawCounts(v)`, `validCodes(v)`, `largestRemainder(groups, total = 100)`, `seatsFor(counts, valid, rule)`, `codeName(v, code)`, `describeRule(rule)`, `diagnoseSeats(v, ticked, entered): SeatDiagnosis` (`kind: 'ok' | 'raw' | 'rounded' | 'otherRule' | 'nomatch'`), `hoursFor(sav, selection)`, `quantile6(sorted, p)`, `describeHours(values): Describe`, `checkSign(sav, sign): Note[]`, `plenumLines(s)`

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s03-stuehle/domain.test.ts` (Erwartungswerte für `describeHours` mit R und mariposa nachgerechnet: Mittel 36,25, Median 40, Q1 22,5, Q3 47,5 nach SPSS Typ 6, SD 15,9799, Schiefe −0,3019528):

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { checkSign, describeHours, diagnoseSeats, hoursFor, initialS03, largestRemainder, parseS03, plenumLines, quantile6, rawCounts, seatsFor, statusS03 } from './domain';

const pvLabels = { [-50]: 'NICHT WAHLBERECHTIGT', [-42]: 'DATENFEHLER: MFN', [-9]: 'KEINE ANGABE', [-8]: 'WEISS NICHT', [-7]: 'VERWEIGERT', 1: 'CDU-CSU', 2: 'SPD', 6: 'DIE LINKE', 42: 'AFD' };
const rep = (code: number, n: number) => Array(n).fill(code);
const sav = fakeSav({
  pv01: { values: [...rep(1, 50), ...rep(2, 30), ...rep(6, 13), ...rep(42, 7), ...rep(-8, 20), ...rep(-7, 5), ...rep(-50, 5)], labels: pvLabels, missingFrom: -1 },
  work: { values: [...rep(1, 60), ...rep(2, 40), ...rep(4, 30)], labels: { 1: 'VOLLZEIT, GANZTAGS', 2: 'TEILZEIT', 4: 'NICHT ERWERBSTAETIG' } },
  dw15: { values: [...rep(40, 30), ...rep(45, 20), ...rep(50, 10), ...rep(20, 25), ...rep(30, 15), ...rep(-10, 30)], labels: { [-10]: 'TNZ: FILTER' }, missingFrom: -1 },
});
const seats = (entries: Record<number, number>) => new Map(Object.entries(entries).map(([k, v]) => [Number(k), v]));

test('distributes 100 chairs by largest remainders', () => {
  assert.deepEqual([...largestRemainder([[1, 50], [2, 30], [6, 13], [42, 7]])], [[1, 50], [2, 30], [6, 13], [42, 7]]);
  const withDk = seatsFor(rawCounts(sav.byName.get('pv01')!), [1, 2, 6, 42], [-8]);
  assert.deepEqual(Object.fromEntries(withDk), { 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 16 });
});

test('diagnoses which chair rule the entered numbers follow', () => {
  const v = sav.byName.get('pv01')!;
  assert.equal(diagnoseSeats(v, [], seats({ 1: 50, 2: 30, 6: 13, 42: 7 })).kind, 'ok');
  assert.match(diagnoseSeats(v, [-8], seats({ 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 16 })).notes[0].text, /Regel „mit ‚weiß nicht‘“\./);
  const raw = diagnoseSeats(v, [], seats({ 1: 38, 2: 23, 6: 10, 42: 5 }));
  assert.equal(raw.kind, 'raw');
  assert.match(raw.notes[0].text, /Rohprozente.*24 Stühle fehlen/);
  const rounded = diagnoseSeats(v, [-8], seats({ 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 17 }));
  assert.equal(rounded.kind, 'rounded');
  assert.match(rounded.notes[0].text, /einer muss aufstehen.*„weiß nicht“/);
  const other = diagnoseSeats(v, [], seats({ 1: 42, 2: 25, 6: 11, 42: 6, [-8]: 16 }));
  assert.equal(other.kind, 'otherRule');
  assert.match(other.notes[0].text, /passen zur Regel „mit ‚weiß nicht‘“, angekreuzt hast du „nur klare Antworten“/);
  assert.equal(diagnoseSeats(v, [], seats({ 1: 10, 2: 10 })).kind, 'nomatch');
});

test('describes hours like mariposa::describe (SPSS quartiles, SPSS skewness)', () => {
  const d = describeHours([10, 20, 30, 40, 40, 40, 50, 60]);
  assert.equal(d.mean, 36.25);
  assert.equal(d.median, 40);
  assert.equal(d.q1, 22.5);
  assert.equal(d.q3, 47.5);
  assert.ok(Math.abs(d.sd - 15.9799) < 1e-4);
  assert.ok(Math.abs(d.skew - -0.3019528) < 1e-6);
  assert.equal(d.above, 0.625);
  assert.equal(quantile6([1, 2, 3, 4], 0.5), 2.5);
  assert.deepEqual(hoursFor(sav, 'gefragt').length, 100);
  assert.deepEqual(hoursFor(sav, 'vollzeit'), [...rep(40, 30), ...rep(45, 20), ...rep(50, 10)]);
  assert.equal(hoursFor(sav, 'alle0').length, 130);
});

test('names the number on the sign and checks the chairs right of the mean', () => {
  const g = describeHours(hoursFor(sav, 'gefragt'));
  const notes = checkSign(sav, { value: String(g.median).replace('.', ','), measure: 'median', selection: 'gefragt', right: String(Math.round(g.above * 100)) });
  assert.match(notes[0].text, /ist der Median aller Voll- und Teilzeitbeschäftigten/);
  assert.equal(notes[1].tone, 'ok');
  const mixed = checkSign(sav, { value: String(g.median), measure: 'mean', selection: 'gefragt', right: '10' });
  assert.match(mixed[1].text, /nicht der Mittelwert/);
  assert.equal(mixed[2].tone, 'warn');
  assert.deepEqual(checkSign(sav, { value: '', measure: '', selection: '', right: '' }), []);
});

test('restores state and reports status and plenum lines', () => {
  assert.deepEqual(parseS03(null), initialS03());
  const s = parseS03({ rule: [-8, 99, 'x'], seats: { '1': '25', '-8': '13', bad: '1' }, built: true, hallText: 'Ein Stuhl ist ein Prozent.', sign: { value: '40', measure: 'median', selection: 'gefragt', right: '66' } });
  assert.deepEqual(s.rule, [-8]);
  assert.deepEqual(s.seats, { '1': '25', '-8': '13' });
  assert.equal(statusS03(initialS03()), 'open');
  assert.equal(statusS03(s), 'done');
  const lines = plenumLines(s);
  assert.deepEqual(lines[0], ['Stuhlregel', 'mit „weiß nicht“']);
  assert.equal(lines[1][1], '25 · 13 · –');
  assert.equal(lines[2][1], '40 Stunden (Median aller Voll- und Teilzeitbeschäftigten)');
  const real = fixtureSav();
  assert.ok(hoursFor(real, 'gefragt').every(h => h > 0));
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s03-stuehle/domain.test.ts`
Expected: FAIL mit `Cannot find module './domain'`.

- [ ] **Step 3: Inhalte** – `src/tasks/s03-stuehle/content.ts`:

```ts
import type { Hint } from '../kit/HintLadder';

/** Missing-Codes der Wahlabsicht in der Reihenfolge, in der sie in der Stuhlregel erscheinen. */
export const CHAIR_CODES = [-8, -7, -50, -9, -42] as const;
export type Selection = 'gefragt' | 'vollzeit' | 'teilzeit' | 'alle0';
export const SELECTIONS: { id: Selection; label: string; short: string }[] = [
  { id: 'gefragt', label: 'alle, denen die Frage gestellt wurde (Voll- und Teilzeit)', short: 'aller Voll- und Teilzeitbeschäftigten' },
  { id: 'vollzeit', label: 'nur Vollzeit', short: 'der Vollzeitbeschäftigten' },
  { id: 'teilzeit', label: 'nur Teilzeit', short: 'der Teilzeitbeschäftigten' },
  { id: 'alle0', label: 'alle Befragten, Nicht-Erwerbstätige mit 0 Stunden', short: 'aller Befragten (Nicht-Erwerbstätige mit 0)' },
];

export const R_SOLUTION = `library(mariposa)
library(dplyr)

allbus <- read_spss(file.choose())

# Saal 1: Welche Lücken gibt es?
allbus %>% fre(pv01) %>% summary()
na_frequencies(allbus$pv01)

# Stuhlregel, hier ein Beispiel: Unentschlossene bekommen Stühle,
# Nicht-Wahlberechtigte, Datenfehler, keine Angabe und Verweigerung nicht
saal <- allbus %>%
  mutate(wahl = untag_na(pv01)) %>%        # Missing-Codes zurückholen
  filter(wahl != -50, wahl != -42, wahl != -9, wahl != -7)
saal %>% fre(wahl) %>% summary()           # Valid % = Stühle

# Saal 2: Wer wurde überhaupt gefragt?
na_frequencies(allbus$dw15)
allbus %>% describe(dw15, show = c("mean", "median", "sd", "skew", "quantiles"))
allbus %>% filter(dw15 > 37.89) %>% nrow()     # rechts vom Durchschnitt
allbus %>% filter(work == 1) %>% describe(dw15) # nur Vollzeit
`;

export const hints: Record<'hall' | 'row', Hint> = {
  hall: {
    think: 'fre() zeigt zwei Prozentspalten. Welche verteilt 100 Stühle nur auf gültige Antworten? Lücken sind nicht weg – sie tragen einen Code.',
    pointer: 'Mit untag_na() holst du die Missing-Codes als Zahlen zurück, mit filter() wirfst du die Gruppen hinaus, die keinen Stuhl bekommen.',
    concept: { id: 'missing_tools', label: 'Missing-Codes aufbereiten' },
    workshop: '4.8 Fehlende Werte, 4.5.2 Fälle filtern',
    scaffold: 'saal <- allbus %>%\n  mutate(wahl = untag_na(___)) %>%\n  filter(wahl != ___, wahl != ___)\nsaal %>% fre(___) %>% summary()',
    solution: 'saal <- allbus %>%\n  mutate(wahl = untag_na(pv01)) %>%\n  filter(wahl != -50, wahl != -42, wahl != -9, wahl != -7)\nsaal %>% fre(wahl) %>% summary()',
  },
  row: {
    think: 'Wer bekam die Stundenfrage gar nicht? Und wo sitzt in der Reihe der Mensch in der Mitte?',
    pointer: 'describe() liefert Mittelwert, Median, Quartile und Schiefe. filter() wählt Fälle aus, nrow() zählt sie.',
    concept: { id: 'describe', label: 'Deskriptiver Überblick' },
    workshop: '7.4.2 describe()',
    scaffold: 'allbus %>% filter(work == ___) %>% describe(___)\nallbus %>% filter(dw15 > ___) %>% nrow()',
    solution: 'allbus %>% describe(dw15, show = c("mean", "median", "sd", "skew", "quantiles"))\nallbus %>% filter(dw15 > 37.89) %>% nrow()\nallbus %>% filter(work == 1) %>% describe(dw15)',
  },
};
```

- [ ] **Step 4: Prüflogik** – `src/tasks/s03-stuehle/domain.ts`:

```ts
import { isMissingCode, type SavFile, type SavVariable } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, near, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { CHAIR_CODES, SELECTIONS, type Selection } from './content';

export type Measure = 'mean' | 'median';
export type Sign = { value: string; measure: Measure | ''; selection: Selection | ''; right: string };
export type S03State = {
  mode: WorkMode;
  /** Halbsatz je Missing-Code: Wer ist das? */
  who: Record<string, string>;
  /** Missing-Codes, die einen Stuhl bekommen. */
  rule: number[];
  reasons: { dk: string; nw: string };
  /** Stühle je Code, als Eingabetext. */
  seats: Record<string, string>;
  built: boolean;
  hallText: string;
  sign: Sign;
};

export const initialS03 = (): S03State => ({
  mode: 'solo', who: {}, rule: [], reasons: { dk: '', nw: '' }, seats: {}, built: false, hallText: '',
  sign: { value: '', measure: '', selection: '', right: '' },
});

const CODE_KEY = /^-?\d{1,3}$/;
export function parseS03(raw: unknown): S03State {
  const r = record(raw), reasons = record(r.reasons), sign = record(r.sign);
  const who: Record<string, string> = {}, seats: Record<string, string> = {};
  for (const [k, v] of Object.entries(record(r.who))) if (CODE_KEY.test(k)) who[k] = str(v, 200);
  for (const [k, v] of Object.entries(record(r.seats))) if (CODE_KEY.test(k)) seats[k] = str(v, 6);
  const rule = Array.isArray(r.rule) ? r.rule.filter((c): c is number => (CHAIR_CODES as readonly number[]).includes(c as number)) : [];
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'), who, rule: [...new Set(rule)],
    reasons: { dk: str(reasons.dk, 300), nw: str(reasons.nw, 300) }, seats, built: bool(r.built), hallText: str(r.hallText, 400),
    sign: {
      value: str(sign.value, 12), measure: oneOf(sign.measure, ['mean', 'median', ''] as const, ''),
      selection: oneOf(sign.selection, ['gefragt', 'vollzeit', 'teilzeit', 'alle0', ''] as const, ''), right: str(sign.right, 6),
    },
  };
}

export function statusS03(s: S03State): TaskStatus {
  if (s.built && s.hallText.trim() && s.sign.value.trim() && s.sign.right.trim()) return 'done';
  return s.built || s.rule.length || Object.keys(s.seats).length || s.sign.value ? 'running' : 'open';
}

/* ---------- Saal 1: Stühle ---------- */

export function rawCounts(v: SavVariable): Map<number, number> {
  const out = new Map<number, number>();
  for (const x of v.values) if (!Number.isNaN(x)) out.set(x, (out.get(x) ?? 0) + 1);
  return out;
}

/** Gültige, gelabelte Codes, die in den Daten vorkommen. */
export function validCodes(v: SavVariable): number[] {
  const counts = rawCounts(v);
  return [...v.valueLabels.keys()].filter(c => !isMissingCode(v, c) && counts.has(c)).sort((a, b) => a - b);
}

/** Hare-Verfahren: ganze Anteile, Reststühle nach größten Resten (bei Gleichstand die größere Gruppe). */
export function largestRemainder(groups: [number, number][], total = 100): Map<number, number> {
  const sum = groups.reduce((a, [, n]) => a + n, 0);
  if (!sum) return new Map(groups.map(([c]) => [c, 0]));
  const quotas = groups.map(([code, n]) => ({ code, n, q: n / sum * total }));
  const out = new Map(quotas.map(g => [g.code, Math.floor(g.q)]));
  let rest = total - [...out.values()].reduce((a, b) => a + b, 0);
  for (const g of [...quotas].sort((a, b) => (b.q - Math.floor(b.q)) - (a.q - Math.floor(a.q)) || b.n - a.n || a.code - b.code)) {
    if (rest-- <= 0) break;
    out.set(g.code, out.get(g.code)! + 1);
  }
  return out;
}

export const seatsFor = (counts: Map<number, number>, valid: number[], rule: readonly number[]) =>
  largestRemainder([...valid, ...rule].map(c => [c, counts.get(c) ?? 0] as [number, number]));

const SHORT: Record<number, string> = { [-8]: 'weiß nicht', [-7]: 'verweigert', [-50]: 'nicht wahlberechtigt', [-9]: 'keine Angabe', [-42]: 'Datenfehler' };
export const codeName = (v: SavVariable, code: number) => SHORT[code] ?? v.valueLabels.get(code) ?? String(code);

export function describeRule(rule: readonly number[]): string {
  if (!rule.length) return 'nur klare Antworten';
  if (CHAIR_CODES.every(c => rule.includes(c))) return 'alle Befragten';
  return `mit ${CHAIR_CODES.filter(c => rule.includes(c)).map(c => `„${SHORT[c]}“`).join(', ')}`;
}
const nested = (s: string) => s.replace(/„/g, '‚').replace(/“/g, '‘');

function subsets(codes: readonly number[]): number[][] {
  return Array.from({ length: 1 << codes.length }, (_, mask) => codes.filter((_, i) => mask & (1 << i)));
}

export type SeatDiagnosis = { kind: 'ok' | 'raw' | 'rounded' | 'otherRule' | 'nomatch'; sum: number; notes: Note[] };

export function diagnoseSeats(v: SavVariable, ticked: readonly number[], entered: Map<number, number>): SeatDiagnosis {
  const counts = rawCounts(v), valid = validCodes(v);
  const sum = [...entered.values()].reduce((a, b) => a + b, 0);
  const get = (c: number) => entered.get(c) ?? 0;
  const within = (want: Map<number, number>, tol: number) => [...new Set([...want.keys(), ...entered.keys()])].every(c => Math.abs(get(c) - (want.get(c) ?? 0)) <= tol);

  const expected = seatsFor(counts, valid, ticked);
  if (sum === 100 && within(expected, 1)) return { kind: 'ok', sum, notes: [{ tone: 'ok', text: `Dein Saal steht: 100 Stühle nach der Regel „${nested(describeRule(ticked))}“.` }] };

  const all = [...counts.values()].reduce((a, b) => a + b, 0);
  const raw = new Map(valid.map(c => [c, Math.round((counts.get(c) ?? 0) / all * 100)]));
  if (valid.every(c => get(c) === raw.get(c)) && CHAIR_CODES.every(c => !entered.get(c))) {
    return { kind: 'raw', sum, notes: [{ tone: 'warn', text: `Du hast Rohprozente abgelesen – die Spalte, die alle Befragten zählt. ${100 - sum} Stühle fehlen. Wo sitzen diese Menschen?` }] };
  }

  const base = [...valid, ...ticked].reduce((a, c) => a + (counts.get(c) ?? 0), 0);
  const rounded = new Map([...valid, ...ticked].map(c => [c, Math.round((counts.get(c) ?? 0) / base * 100)]));
  if (sum !== 100 && within(rounded, 0)) {
    const diff = [...expected.keys()].find(c => (rounded.get(c) ?? 0) !== (expected.get(c) ?? 0));
    const who = diff === undefined ? 'jemand' : `„${codeName(v, diff)}“`;
    const text = sum > 100
      ? `${sum} Stühle – einer muss aufstehen. Nach größten Resten wäre es ${who}. Parlamente streiten über solche Verfahren.`
      : `${sum} Stühle – einer bleibt frei. Nach größten Resten bekäme ${who} ihn.`;
    return { kind: 'rounded', sum, notes: [{ tone: 'hint', text }] };
  }

  let best: { rule: number[]; distance: number } | null = null;
  for (const rule of subsets(CHAIR_CODES)) {
    const want = seatsFor(counts, valid, rule);
    if (!within(want, 1)) continue;
    const distance = [...want.keys()].reduce((a, c) => a + Math.abs(get(c) - want.get(c)!), 0);
    if (!best || distance < best.distance) best = { rule, distance };
  }
  if (best) return { kind: 'otherRule', sum, notes: [{ tone: 'warn', text: `Deine Zahlen passen zur Regel „${nested(describeRule(best.rule))}“, angekreuzt hast du „${nested(describeRule(ticked))}“. Hast du vor fre() anders gefiltert?` }] };
  return { kind: 'nomatch', sum, notes: [{ tone: 'warn', text: 'Diese Stuhlzahlen passen zu keiner Regel. Filtere in R nach deiner Regel und lies in fre() die Spalte „Valid %“ ab.' }] };
}

/* ---------- Saal 2: Stuhlreihe ---------- */

export function hoursFor(sav: SavFile, selection: Selection): number[] {
  const h = sav.byName.get('dw15'), w = sav.byName.get('work');
  if (!h) return [];
  const out: number[] = [];
  h.values.forEach((x, i) => {
    const work = w?.values[i];
    if (selection === 'alle0' && x === -10) { out.push(0); return; }
    if (isMissingCode(h, x)) return;
    if (selection === 'vollzeit' && work !== 1) return;
    if (selection === 'teilzeit' && work !== 2) return;
    out.push(x);
  });
  return out;
}

/** Quantil nach SPSS (Typ 6, HAVERAGE) – so rechnet mariposa::describe(). Erwartet sortierte Werte. */
export function quantile6(sorted: number[], p: number): number {
  const n = sorted.length;
  if (!n) return NaN;
  const h = (n + 1) * p;
  if (h <= 1) return sorted[0];
  if (h >= n) return sorted[n - 1];
  const lo = Math.floor(h);
  return sorted[lo - 1] + (h - lo) * (sorted[lo] - sorted[lo - 1]);
}

export type Describe = { n: number; mean: number; median: number; q1: number; q3: number; sd: number; skew: number; above: number };

export function describeHours(values: number[]): Describe {
  const x = [...values].sort((a, b) => a - b), n = x.length;
  const mean = x.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(x.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  const skew = n > 2 && sd > 0 ? n / ((n - 1) * (n - 2)) * x.reduce((a, b) => a + ((b - mean) / sd) ** 3, 0) : NaN;
  return { n, mean, median: quantile6(x, 0.5), q1: quantile6(x, 0.25), q3: quantile6(x, 0.75), sd, skew, above: x.filter(v => v > mean).length / n };
}

const selectionShort = (id: Selection | '') => SELECTIONS.find(s => s.id === id)?.short ?? '';
const measureName = (m: Measure) => m === 'mean' ? 'Mittelwert' : 'Median';

export function checkSign(sav: SavFile, sign: Sign): Note[] {
  const value = parseNumber(sign.value);
  if (value === null) return [];
  const notes: Note[] = [];
  const stats = Object.fromEntries(SELECTIONS.map(s => [s.id, describeHours(hoursFor(sav, s.id))])) as Record<Selection, Describe>;
  const match = SELECTIONS.flatMap(s => (['median', 'mean'] as Measure[]).map(m => ({ s: s.id, m }))).find(({ s, m }) => near(value, stats[s][m], 0.05));
  notes.push(match
    ? { tone: 'hint', text: `${de(value, Number.isInteger(value) ? 0 : 1)} ist der ${measureName(match.m)} ${selectionShort(match.s)}.` }
    : { tone: 'warn', text: 'Diese Zahl finde ich unter keiner Fallauswahl. Prüf in R Filter und Maß.' });
  if (sign.measure && sign.selection) {
    const want = stats[sign.selection][sign.measure];
    notes.push(near(value, want, 0.05)
      ? { tone: 'ok', text: `Passt zu deiner Angabe: ${measureName(sign.measure)} ${selectionShort(sign.selection)}.` }
      : { tone: 'warn', text: `Deine Zahl ist nicht der ${measureName(sign.measure)} ${selectionShort(sign.selection)} – der liegt bei ${de(want)}.` });
    const right = parseNumber(sign.right);
    if (right !== null) {
      const wantRight = Math.round(stats[sign.selection].above * 100);
      notes.push(Math.abs(right - wantRight) <= 1
        ? { tone: 'ok', text: `Stimmt: ${wantRight} von 100 Stühlen stehen rechts vom Durchschnitt. Der Durchschnitt ist nicht die Mitte.` }
        : { tone: 'warn', text: 'Zähl mit filter(dw15 > Mittelwert) %>% nrow() und rechne auf 100 Stühle um.' });
    }
  }
  return notes;
}

/* ---------- Ergebnis ---------- */

export function plenumLines(s: S03State): [string, string][] {
  const seat = (code: number) => s.seats[String(code)]?.trim() || '–';
  const sign = s.sign.value.trim() && s.sign.measure
    ? `${s.sign.value.trim()} Stunden (${measureName(s.sign.measure)} ${selectionShort(s.sign.selection)})`.replace(' )', ')')
    : '';
  return [
    ['Stuhlregel', describeRule(s.rule)],
    ['Stühle CDU/CSU · weiß nicht · AfD', `${seat(1)} · ${seat(-8)} · ${seat(42)}`],
    ['Schild', sign],
    ['Stühle rechts vom Durchschnitt', s.sign.right.trim()],
  ];
}
```

- [ ] **Step 5: Tests und Typprüfung**

Run: `node --import tsx --test src/tasks/s03-stuehle/domain.test.ts`
Expected: `# pass 5`, `# fail 0`.

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit`
Expected: `# pass 151`, `# fail 0`; tsc ohne Ausgabe.

- [ ] **Step 6: Commit**

```bash
git add src/tasks/s03-stuehle
git commit -m "Add session 3 domain: largest remainders, chair-rule diagnosis, SPSS quartiles, sign check"
```

---

### Task 9: Sitzung 3 – Saal, Stuhlreihe, Oberfläche und Anmeldung

**Files:**
- Create: `src/tasks/s03-stuehle/Charts.tsx`, `src/tasks/s03-stuehle/Stuehle.tsx`, `src/tasks/s03-stuehle/index.ts`
- Modify: `src/tasks/registry.ts`, `src/tasks.css`
- Test: `src/tasks/s03-stuehle/task.test.ts`

**Interfaces:**
- Consumes: alles aus Task 8; Kit.
- Produces: `stuehle: TaskDef<S03State>` (id `s03`, `requiredVariables: ['pv01', 'dw15', 'work']`); `Hall({ groups })`, `ChairRow({ values, stats })`.

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s03-stuehle/task.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession } from '../testRender';
import { initialS03 } from './domain';

test('session 3 shows both halls, the chair rule and the plenum card', () => {
  const html = renderSession(2);
  assert.match(html, /Deutschland in 100 Stühlen/);
  assert.match(html, /Saal 1 · Wer fehlt in der Tabelle\?/);
  assert.match(html, /weiß nicht: kein Stuhl/);
  assert.match(html, /Saal bauen/);
  assert.match(html, /Saal 2 · Die Stuhlreihe/);
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /Saaltext/);
});

test('a built hall shows the diagnosis, the grid and the hall text field', () => {
  const state = { ...initialS03(), built: true, seats: { '1': '100' }, sign: { value: '40', measure: 'median' as const, selection: 'gefragt' as const, right: '50' } };
  const html = renderSession(2, true, undefined, { tasks: { s03: state } });
  assert.match(html, /Saal mit 100 Stühlen/);
  assert.match(html, /Saaltext/);
  assert.match(html, /100 Stühle sortiert nach Stunden/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s03-stuehle/task.test.ts`
Expected: FAIL (Sitzung 3 zeigt noch „AUFGABE FOLGT“).

- [ ] **Step 3: Diagramme** – `src/tasks/s03-stuehle/Charts.tsx`:

```tsx
import { de } from '../kit/numbers';
import { quantile6, type Describe } from './domain';

/** Neutrale Farben – bewusst keine Parteifarben. Fehlende Angaben grau. */
const PALETTE = ['#5b7c6f', '#8fa58a', '#b9c7a5', '#c9b98a', '#a38b6d', '#7d6b5d', '#9aa3b0', '#6f7f94'];
const MISSING = '#d9d6ce';

export type HallGroup = { code: number; label: string; seats: number; missing: boolean };

/** Saal 1: 100 Stühle als 10×10-Raster, gefüllt in der Reihenfolge der Gruppen. */
export function Hall({ groups }: { groups: HallGroup[] }) {
  const cells: { group: HallGroup; color: string }[] = [];
  let k = 0;
  groups.forEach(g => {
    const color = g.missing ? MISSING : PALETTE[k++ % PALETTE.length];
    for (let i = 0; i < Math.max(0, g.seats); i++) cells.push({ group: g, color });
  });
  const summary = groups.map(g => `${g.label} ${g.seats}`).join(', ');
  return <figure className="s03-hall">
    <svg viewBox="0 0 300 300" role="img" aria-label={`Saal mit ${cells.length} Stühlen: ${summary}`}>
      {cells.slice(0, 120).map((c, i) => <rect key={i} x={(i % 10) * 30 + 4} y={Math.floor(i / 10) * 30 + 4} width={22} height={22} rx={5} fill={c.color} />)}
    </svg>
    <figcaption>
      {groups.map((g, i) => {
        const color = g.missing ? MISSING : PALETTE[groups.slice(0, i).filter(x => !x.missing).length % PALETTE.length];
        return <span key={g.code}><i style={{ background: color }} aria-hidden="true" />{g.label} {g.seats}</span>;
      })}
    </figcaption>
  </figure>;
}

/** Saal 2: 100 Stühle in einer Reihe, sortiert nach Stunden (Lehnenhöhe = Stunden), mit Quartilen und Durchschnitt. */
export function ChairRow({ values, stats }: { values: number[]; stats: Describe }) {
  const sorted = [...values].sort((a, b) => a - b);
  const chairs = Array.from({ length: 100 }, (_, i) => quantile6(sorted, (i + 0.5) / 100));
  const max = Math.max(...chairs, 1);
  const W = 600, H = 170, base = 140, step = W / 100;
  const meanIndex = chairs.filter(c => c <= stats.mean).length;
  const marks: [string, number][] = [['Q1', 25], ['Median', 50], ['Q3', 75]];
  return <div className="s03-row-scroll" tabIndex={0} aria-label="Stuhlreihe">
    <svg viewBox={`0 0 ${W} ${H}`} className="s03-row" role="img"
      aria-label={`100 Stühle sortiert nach Stunden. Q1 ${de(stats.q1)}, Median ${de(stats.median)}, Q3 ${de(stats.q3)}, Durchschnitt ${de(stats.mean)}. ${Math.round(stats.above * 100)} Stühle stehen rechts vom Durchschnitt.`}>
      {chairs.map((c, i) => <rect key={i} x={i * step + 0.6} y={base - (c / max) * 110} width={step - 1.2} height={(c / max) * 110} fill={i >= meanIndex ? '#5b7c6f' : '#b9c7a5'} />)}
      {marks.map(([label, pos]) => <g key={label}>
        <line x1={pos * step} x2={pos * step} y1={base} y2={base + 10} stroke="#242822" />
        <text x={pos * step} y={base + 24} textAnchor="middle">{label}</text>
      </g>)}
      <line x1={meanIndex * step} x2={meanIndex * step} y1={14} y2={base} stroke="#8b2e2e" strokeDasharray="4 3" />
      <text x={meanIndex * step} y={11} textAnchor="middle" className="mean">Ø {de(stats.mean)}</text>
    </svg>
  </div>;
}
```

- [ ] **Step 4: Oberfläche** – `src/tasks/s03-stuehle/Stuehle.tsx`:

```tsx
import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { parseNumber } from '../kit/numbers';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { TaskProps } from '../types';
import { ChairRow, Hall } from './Charts';
import { CHAIR_CODES, hints, R_SOLUTION, SELECTIONS, type Selection } from './content';
import { codeName, describeHours, diagnoseSeats, hoursFor, plenumLines, rawCounts, validCodes, checkSign, type Measure, type S03State } from './domain';

export function Stuehle({ data, state, onChange, onConcept }: TaskProps<S03State>) {
  const set = (patch: Partial<S03State>) => onChange({ ...state, ...patch });
  const pv = data.sav.byName.get('pv01')!;
  const counts = useMemo(() => rawCounts(pv), [pv]);
  const valid = useMemo(() => validCodes(pv), [pv]);
  const present = CHAIR_CODES.filter(c => counts.has(c));
  const included = [...valid, ...CHAIR_CODES.filter(c => state.rule.includes(c))];
  const entered = new Map(included.map(c => [c, parseNumber(state.seats[String(c)] ?? '') ?? 0]));
  const diagnosis = state.built ? diagnoseSeats(pv, state.rule, entered) : null;
  const toggle = (code: number) => set({ rule: state.rule.includes(code) ? state.rule.filter(c => c !== code) : [...state.rule, code] });
  const rowSelection: Selection = state.sign.selection || 'gefragt';
  const rowValues = useMemo(() => hoursFor(data.sav, rowSelection), [data.sav, rowSelection]);
  const rowStats = useMemo(() => describeHours(rowValues), [rowValues]);

  return <div className="task s03">
    <RoleBrief role="Szenograf:in einer Ausstellung" title="Deutschland in 100 Stühlen">
      <p>Die Wanderausstellung „Deutschland in 100 Stühlen“ (fiktiv) braucht deine Baupläne. Die Kuratorin schreibt:</p>
      <p>„Im ersten Saal stehen 100 Stühle. Jeder steht für ein Prozent – nur wovon? Auf jede Lehne kommt eine Antwort auf die Frage, welche Partei man wählen würde, wenn am Sonntag Bundestagswahl wäre. Besucher:innen sollen ihren Stuhl finden können, auch wenn sie keine Partei nennen würden. Im zweiten Saal stellen wir 100 Stühle in eine Reihe, sortiert nach Wochenarbeitsstunden. Darüber hängt ein Schild: ‚Hier arbeitet man im Mittel __ Stunden.‘ Wer einen Stuhl bekommt und was auf dem Schild steht, entscheidest du. Am Freitag gehen die Pläne in die Schreinerei – gebaut wird, was du einträgst.“</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du planst beide Säle selbst und entscheidest, wer einen Stuhl bekommt."
      pair="A plant den „Saal der Vielen“ (alle Befragten bekommen einen Stuhl), B den „Saal der Stimmen“ (nur klare Antworten). Gebaut wird ein Saal: Einigt euch und schreibt den Saaltext gemeinsam. In Saal 2 rechnet A „wie gefragt“, B „nur Vollzeit“." />

    <section className="task-step">
      <h3>Saal 1 · Wer fehlt in der Tabelle?</h3>
      <p>Zähl in R die Wahlabsicht aus. Neben den Parteien gibt es Lücken – jede mit eigenem Code. Schreib zu jeder Lücke einen Halbsatz: Wer ist das?</p>
      <RBlock code={'library(mariposa)\nlibrary(dplyr)\n\nallbus <- read_spss(file.choose())\n\nallbus %>% fre(pv01) %>% summary()\nna_frequencies(allbus$pv01)'} />
      <div className="task-grid">
        {present.map(c => <label key={c}>{c} {codeName(pv, c)}<input type="text" value={state.who[String(c)] ?? ''} placeholder="Das sind Menschen, die …"
          onChange={e => set({ who: { ...state.who, [String(c)]: e.target.value } })} /></label>)}
      </div>
    </section>

    <section className="task-step">
      <h3>Saal 1 · Stuhlregel und Sitzplan</h3>
      <p>Wer bekommt einen Stuhl? Die Parteien und „würde nicht wählen“ sitzen immer. Entscheide für jede Lücke.</p>
      <div className="sandbox-chips" role="group" aria-label="Stuhlregel">
        {present.map(c => <button key={c} aria-pressed={state.rule.includes(c)} onClick={() => toggle(c)}>{codeName(pv, c)}: {state.rule.includes(c) ? 'Stuhl' : 'kein Stuhl'}</button>)}
      </div>
      <div className="task-grid">
        <label>Warum (nicht) für „weiß nicht“?<input type="text" value={state.reasons.dk} onChange={e => set({ reasons: { ...state.reasons, dk: e.target.value } })} /></label>
        <label>Warum (nicht) für „nicht wahlberechtigt“?<input type="text" value={state.reasons.nw} onChange={e => set({ reasons: { ...state.reasons, nw: e.target.value } })} /></label>
      </div>
      <p>Filtere in R nach deiner Regel und trag die Stühle je Gruppe ein (zusammen 100):</p>
      <div className="task-grid">
        {included.map(c => <label key={c}>{codeName(pv, c)}<input type="text" inputMode="numeric" value={state.seats[String(c)] ?? ''}
          onChange={e => set({ seats: { ...state.seats, [String(c)]: e.target.value }, built: false })} /></label>)}
      </div>
      <p className="sandbox-note">Summe: {[...entered.values()].reduce((a, b) => a + b, 0)} Stühle</p>
      <button className="primary" onClick={() => set({ built: true })}>Saal bauen</button>
      {diagnosis && <>
        <Feedback notes={diagnosis.notes} />
        <Hall groups={included.map(c => ({ code: c, label: codeName(pv, c), seats: entered.get(c) ?? 0, missing: c < 0 }))} />
      </>}
      <HintLadder hint={hints.hall} onConcept={onConcept} />
      {state.built && <>
        <label className="sandbox-label" htmlFor="s03-hall-text">Saaltext (höchstens zwei Sätze): Wofür steht ein Stuhl?</label>
        <textarea id="s03-hall-text" value={state.hallText} onChange={e => set({ hallText: e.target.value })} />
      </>}
    </section>

    <section className="task-step">
      <h3>Saal 2 · Die Stuhlreihe</h3>
      <p>Wem wurde die Frage nach den Wochenarbeitsstunden gestellt? Beschreib die Stunden in R, wähl eine Fallauswahl und ein Maß für das Schild – und zähl, wie viele von 100 Stühlen rechts vom Durchschnitt stehen.</p>
      <div className="task-grid">
        <label>Zahl auf dem Schild<input type="text" inputMode="decimal" value={state.sign.value} onChange={e => set({ sign: { ...state.sign, value: e.target.value } })} /></label>
        <label>Maß<select value={state.sign.measure} onChange={e => set({ sign: { ...state.sign, measure: e.target.value as Measure | '' } })}>
          <option value="">bitte wählen</option><option value="mean">Mittelwert</option><option value="median">Median</option>
        </select></label>
        <label>Fallauswahl<select value={state.sign.selection} onChange={e => set({ sign: { ...state.sign, selection: e.target.value as Selection | '' } })}>
          <option value="">bitte wählen</option>{SELECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select></label>
        <label>Stühle rechts vom Durchschnitt<input type="text" inputMode="numeric" value={state.sign.right} onChange={e => set({ sign: { ...state.sign, right: e.target.value } })} /></label>
      </div>
      <Feedback notes={checkSign(data.sav, state.sign)} />
      {state.sign.value.trim() && state.sign.selection && <ChairRow values={rowValues} stats={rowStats} />}
      <HintLadder hint={hints.row} onConcept={onConcept} file="stuehle.R" />
    </section>

    <PlenumCard title="Deutschland in 100 Stühlen" lines={plenumLines(state)} file="stuehle-plenum.md" />
    {state.built && state.sign.right.trim() && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={R_SOLUTION} file="stuehle.R" /></details>}
  </div>;
}
```

- [ ] **Step 5: Aufgabendefinition** – `src/tasks/s03-stuehle/index.ts`:

```ts
import type { TaskDef } from '../types';
import { initialS03, parseS03, statusS03, type S03State } from './domain';
import { Stuehle } from './Stuehle';

export const stuehle: TaskDef<S03State> = {
  id: 's03',
  title: 'Deutschland in 100 Stühlen',
  role: 'Szenograf:in einer Ausstellung',
  intro: 'Du baust zwei Säle einer (fiktiven) Ausstellung: 100 Stühle für die Wahlabsicht und eine Stuhlreihe nach Arbeitsstunden. Wer einen Stuhl bekommt und was auf dem Schild steht, entscheidest du. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['pv01', 'dw15', 'work'],
  initial: initialS03,
  parse: parseS03,
  status: statusS03,
  Component: Stuehle,
};
```

- [ ] **Step 6: Anmelden** – `src/tasks/registry.ts` ersetzen durch:

```ts
import { schonGefragt } from './s01-schon-gefragt';
import { datenerfassung } from './s02-datenerfassung';
import { stuehle } from './s03-stuehle';
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {
  s01: schonGefragt,
  s02: datenerfassung,
  s03: stuehle,
};
```

- [ ] **Step 7: Styles** – an `src/tasks.css` anhängen:

```css
/* Sitzung 3 · Deutschland in 100 Stühlen */
.s03-hall{margin:14px 0;display:grid;grid-template-columns:minmax(0,300px) 1fr;gap:16px;align-items:start}
.s03-hall svg{width:100%;height:auto;background:#fff;border:1px solid var(--line);border-radius:8px}
.s03-hall figcaption{display:flex;flex-direction:column;gap:4px;font-size:14px}
.s03-hall figcaption i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.s03-row-scroll{overflow-x:auto;margin:12px 0}
.s03-row{width:100%;min-width:480px;height:auto;background:#fff;border:1px solid var(--line);border-radius:8px}
.s03-row text{font:13px var(--sans);fill:var(--muted)}
.s03-row text.mean{fill:var(--red)}
.sandbox .task-grid select{width:100%}
@media(max-width:560px){.s03-hall{grid-template-columns:1fr}}
```

- [ ] **Step 8: Tests und Typprüfung**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 153`, `# fail 0`.

Run: `node_modules/.bin/tsc --noEmit`
Expected: keine Ausgabe.

- [ ] **Step 9: Im Browser prüfen (mit eigener Datei).** Sitzung 3, Saal 1 ohne Lücken-Stühle: Rohprozente 19/15/6/14/5/9/3/4 → „… Rohprozente … 25 Stühle fehlen“; gerundet 25/20/8/19/7/12/4/6 → „101 Stühle – einer muss aufstehen … „DIE LINKE““; mit „weiß nicht“: 22/17/7/16/6/10/4/5/13 → „Dein Saal steht …“ und Raster mit Legende. Saal 2: Schild 40, Maß Mittelwert, Fallauswahl „gefragt“, 66 Stühle → „40 ist der Median …“, „… Mittelwert … liegt bei 37,9“, „Stimmt: 66 von 100 Stühlen …“; Stuhlreihe mit Q1/Median/Q3 und Ø 37,9 links von der Mitte.

- [ ] **Step 10: Commit**

```bash
git add src/tasks src/tasks.css
git commit -m "Add session 3 task UI 'Deutschland in 100 Stühlen' with hall and chair row"
```

---

### Task 10: Echtdaten-Test, R-Prüfung der Lösungsskripte, Doku und Build

**Files:**
- Create: `src/tasks/allbus.local.test.ts`, `scripts/export-task-scripts.ts`, `scripts/verify-task-scripts.R`
- Modify: `README.md`, `docs/PRUEFSTAND.md`, `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md`

**Interfaces:**
- Consumes: Prüflogik der Sitzungen 1–3; `SETUP_SCRIPT`, `antraege`, `R_SOLUTION` (Sitzungen 2 und 3).
- Produces: `ALLBUS_SAV=… pnpm test` prüft alle Referenzwerte; `export-task-scripts.ts <sav> <ordner>` + `verify-task-scripts.R <ordner>` führt die Lösungsskripte aus.

- [ ] **Step 1: Echtdaten-Test** – `src/tasks/allbus.local.test.ts` (wird ohne `ALLBUS_SAV` übersprungen):

```ts
// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav, type SavFile } from '../sandbox/readSav';
import { askedCount, findVar } from './s01-schon-gefragt/domain';
import { sheets } from './s02-datenerfassung/content';
import { countCode, factorPosition, gradeCell, scanCode } from './s02-datenerfassung/domain';
import { describeHours, diagnoseSeats, hoursFor, rawCounts, seatsFor, validCodes } from './s03-stuehle/domain';

const file = process.env.ALLBUS_SAV;
const skip = !file && 'ALLBUS_SAV nicht gesetzt';
let cached: SavFile | null = null;
const load = () => {
  if (cached) return cached;
  const bytes = readFileSync(file!);
  return (cached = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
};
const names = (sav: SavFile, p: string) => { const r = findVar(sav, p); return r.ok ? r.hits.map(v => v.name) : []; };
const r1 = (x: number) => Math.round(x * 10) / 10;

test('session 1: search hits and asked counts match the concept', { skip }, () => {
  const sav = load();
  assert.equal(sav.nCases, 5246);
  assert.equal(sav.variables.length, 579);
  assert.deepEqual(names(sav, 'horoskop'), ['rh08b']);
  assert.deepEqual(names(sav, 'flüchtling'), []);
  assert.deepEqual(names(sav, 'angst'), []);
  assert.deepEqual(names(sav, 'fluecht'), ['mi05', 'mp16', 'mp17', 'mp18', 'mp19']);
  assert.equal(names(sav, 'vertrauen').length, 16);
  assert.deepEqual(names(sav, 'einsam'), ['dp03']);
  assert.equal(askedCount(sav.byName.get('rh08b')!), 5246);
  assert.equal(askedCount(sav.byName.get('pt03')!), 3650);
  assert.equal(askedCount(sav.byName.get('mp16')!), 3599);
});

test('session 2: paper-only codes, factor positions and sheet grading', { skip }, () => {
  const sav = load();
  assert.equal(countCode(sav, 'mode', 4), 1656);
  assert.equal(countCode(sav, 'pa01', -42, 4), 24);
  assert.equal(countCode(sav, 'pa01', -42), 24);
  assert.equal(countCode(sav, 'st01', -8, 4), 0);
  assert.equal(countCode(sav, 'pt03', -11, 4), 798);
  assert.equal(factorPosition(sav, 'pv01').get(42), 6);
  assert.deepEqual(scanCode(sav, -42), { total: 638, variables: 202, byMode: [{ label: 'CAPI', n: 0 }, { label: 'CAWI', n: 0 }, { label: 'MAIL', n: 638 }] });
  assert.equal(gradeCell(sav, sheets[0], 'pv01', '6').status, 'match');
  assert.equal(gradeCell(sav, sheets[1], 'pt03', '-11').status, 'match');
  assert.equal(gradeCell(sav, sheets[2], 'pt03', '1').status, 'match');
  assert.equal(gradeCell(sav, sheets[2], 'pv01', '-9').status, 'match');
});

test('session 3: chairs per rule, diagnoses and hours match the concept', { skip }, () => {
  const sav = load();
  const pv = sav.byName.get('pv01')!, counts = rawCounts(pv), valid = validCodes(pv);
  const seat = (rule: number[]) => Object.fromEntries(seatsFor(counts, valid, rule));
  assert.deepEqual(seat([]), { 1: 25, 2: 20, 3: 8, 4: 19, 6: 6, 42: 12, 90: 4, 91: 6 });
  const dk = seat([-8]);
  assert.deepEqual([dk[1], dk[2], dk[4], dk[42], dk[3], dk[6], dk[-8]], [22, 17, 16, 10, 7, 6, 13]);
  const all = seat([-8, -7, -50, -9, -42]);
  assert.deepEqual([all[1], all[2], all[4], all[42], all[3], all[6], all[-8], all[-7], all[-50]], [19, 15, 14, 9, 6, 5, 11, 6, 4]);
  const entered = (m: Record<number, number>) => new Map(Object.entries(m).map(([k, v]) => [Number(k), v]));
  const raw = diagnoseSeats(pv, [], entered({ 1: 19, 2: 15, 3: 6, 4: 14, 6: 5, 42: 9, 90: 3, 91: 4 }));
  assert.equal(raw.kind, 'raw');
  assert.equal(raw.sum, 75);
  const rounded = diagnoseSeats(pv, [], entered({ 1: 25, 2: 20, 3: 8, 4: 19, 6: 7, 42: 12, 90: 4, 91: 6 }));
  assert.equal(rounded.kind, 'rounded');
  assert.match(rounded.notes[0].text, /DIE LINKE/);
  const g = describeHours(hoursFor(sav, 'gefragt'));
  assert.deepEqual([g.n, r1(g.mean), g.median, g.q1, g.q3, r1(g.sd), Math.round(g.skew * 100) / 100, Math.round(g.above * 1000) / 10], [2945, 37.9, 40, 35, 41.5, 9.9, -0.25, 66.2]);
  const v = describeHours(hoursFor(sav, 'vollzeit'));
  assert.deepEqual([v.n, r1(v.mean), v.median, v.q1, v.q3, Math.round(v.skew * 100) / 100], [2172, 41.7, 40, 39, 44, 0.97]);
  const a = describeHours(hoursFor(sav, 'alle0'));
  assert.deepEqual([a.n, r1(a.mean), a.median], [5208, 21.4, 25]);
});
```

- [ ] **Step 2: Mit eigener Datei laufen lassen**

Run: `ALLBUS_SAV="/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav" node --import tsx --test src/tasks/allbus.local.test.ts`
Expected: `# pass 3`, `# fail 0`.

- [ ] **Step 3: Skript-Export** – `scripts/export-task-scripts.ts`:

```ts
// Schreibt die Lösungsskripte (Hilfestufe 4) der Lernpfad-Aufgaben als .R-Dateien, mit festem Dateipfad statt file.choose().
//   node --import tsx scripts/export-task-scripts.ts <datei.sav> <ordner>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { antraege, SETUP_SCRIPT } from '../src/tasks/s01-schon-gefragt/content';
import { R_SOLUTION as S02 } from '../src/tasks/s02-datenerfassung/content';
import { R_SOLUTION as S03 } from '../src/tasks/s03-stuehle/content';

const [sav, out] = process.argv.slice(2);
if (!sav || !out) {
  console.error('Aufruf: node --import tsx scripts/export-task-scripts.ts <datei.sav> <ordner>');
  process.exit(1);
}
const withFile = (code: string) => code.replaceAll('file.choose()', JSON.stringify(sav));
const scripts: Record<string, string> = {
  's01-schon-gefragt.R': `${SETUP_SCRIPT}\n${antraege.map(a => a.hint.solution).join('\n')}\n`,
  's02-datenerfassung.R': S02,
  's03-stuehle.R': S03,
};
mkdirSync(out, { recursive: true });
for (const [name, code] of Object.entries(scripts)) writeFileSync(join(out, name), withFile(code));
console.log(`${Object.keys(scripts).length} Skripte nach ${out} geschrieben.`);
```

- [ ] **Step 4: R-Prüfung** – `scripts/verify-task-scripts.R`:

```r
# Führt die Lösungsskripte der Lernpfad-Aufgaben aus und meldet Fehler. Aufruf:
#   Rscript --vanilla scripts/verify-task-scripts.R <ordner>
args <- commandArgs(trailingOnly = TRUE)
files <- list.files(args[1], pattern = "\\.R$", full.names = TRUE)
failures <- 0
for (f in files) {
  env <- new.env()
  res <- tryCatch({
    invisible(capture.output(suppressMessages(suppressWarnings(source(f, local = env, print.eval = TRUE)))))
    "ok"
  }, error = function(e) conditionMessage(e))
  cat(basename(f), ":", res, "\n")
  if (res != "ok") failures <- failures + 1
}
cat(length(files) - failures, "von", length(files), "Skripten laufen fehlerfrei.\n")
if (failures > 0) quit(status = 1)
```

- [ ] **Step 5: Lösungsskripte auf Testdatei und echter Datei ausführen**

Run: `node --import tsx scripts/export-task-scripts.ts "$PWD/src/sandbox/fixtures/sandbox-fixture.sav" /tmp/rcheck-fixture && Rscript --vanilla scripts/verify-task-scripts.R /tmp/rcheck-fixture`
Expected: `3 von 3 Skripten laufen fehlerfrei.`

Run: `node --import tsx scripts/export-task-scripts.ts "/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav" /tmp/rcheck-real && Rscript --vanilla scripts/verify-task-scripts.R /tmp/rcheck-real`
Expected: `3 von 3 Skripten laufen fehlerfrei.`

- [ ] **Step 6: README.** In `README.md` die Zeile 3 (beginnt mit „Stand:“), die Zeile 5 (beginnt mit „Der Reiter **Lernpfad**“) und die Zeile 7 (beginnt mit „In einer Mission“) durch diese drei Absätze ersetzen:

```markdown
Stand: 29. September 2026 · Lernpfad nach dem Sitzungsplan Statistik Ib: jede Sitzung eine eigene Aufgabe auf echten ALLBUS-Daten, dazu die freie Karte zur Orientierung.

Der Reiter **Lernpfad** ist die Startansicht. Zehn Sitzungen folgen dem Sitzungsplan „Statistik im WiSe 24/25“; die dort gestrichene Faktorenanalyse entfällt. Jede Sitzung nennt ihre politische Leitfrage, die Begriffe zur Wiederholung und die neuen Begriffe und bekommt eine eigene Aufgabe (Einzelanfertigung, `src/tasks/`): eine neue Rolle mit echtem Auftrag, eigenes Rechnen in RStudio mit mariposa, eine eigene Entscheidung und ein Ergebnis für das Plenum. Jede Aufgabe ist der Kern einer 30–45-minütigen Arbeitsphase und trägt auch allein; eine gestufte Hilfe führt bis zum vollständigen R-Code, eine Partnervariante verteilt die Rollen.

Gebaut sind Sitzung 1 „Schon gefragt?“ (Referent:in in einem fiktiven Abgeordnetenbüro prüft mit `find_var()` und `codebook()`, welche Frageideen der ALLBUS schon beantwortet), Sitzung 2 „Erster Tag in der Datenerfassung“ (drei nachgestellte Papierbögen codieren, Regeln für mehrdeutige Kreuze, Doppelerfassung) und Sitzung 3 „Deutschland in 100 Stühlen“ (die Wahlabsicht als Saal mit 100 Stühlen, die Arbeitsstunden als Stuhlreihe). Sitzung 4 enthält bis zu ihrem Umbau die Mission „Belege es!“ („Wer Politikern misstraut, geht gar nicht mehr wählen“); für die Sitzungen 5–10 folgen die Aufgaben nach der Spezifikation `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md`. Die `.sav`-Datei wird nur im Browser gelesen und nicht gespeichert; gespeichert werden ausschließlich eigene Entscheidungen und Texte (`statistikatlas.aufgaben.v1`, für die Mission `statistikatlas.missionen.v1`).
```

Den Absatz, der mit „Der zweite Reiter **Freie Karte**“ beginnt, ganz ersetzen durch:

```markdown
Der zweite Reiter **Freie Karte** ergänzt den Lernpfad als Orientierungshilfe. „Zurück zu Sitzung N“ führt in dieselbe Sitzung zurück; der Stand der Aufgabe bleibt erhalten. `?ansicht=karte` öffnet direkt das Netz. Prüfung: `pnpm test` (synthetische Testdateien aus `scripts/make-sandbox-fixture.R`); mit der eigenen Datei `ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test` für alle Referenzwerte; `scripts/export-task-scripts.ts` mit `scripts/verify-task-scripts.R` führt die Lösungsskripte der Aufgaben in R aus, `scripts/export-sandbox-grid.ts` mit `scripts/verify-sandbox-r.R` gleicht den R-Code der Mission ab.
```

- [ ] **Step 7: Prüfstand und Spezifikation.** In `docs/PRUEFSTAND.md` ganz oben einfügen (gefolgt von einer Leerzeile, `---` und einer Leerzeile):

```markdown
## 29. September 2026 – Lernpfad: eigene Aufgaben für die Sitzungen 1–3

- Der Lernpfad zeigt je Sitzung eine eigene Aufgabe (`src/tasks/`, Register und Aufgabenrahmen). Gemeinsam sind nur Hilfsbausteine: Datei laden, vierstufige Hilfe bis zum vollständigen R-Code, Plenumskarte, Partnerschalter, Speicherung unter `statistikatlas.aufgaben.v1`.
- Sitzung 1 „Schon gefragt?“: Handschlag mit R (Fälle, Variablen), vier Frageideen mit Suche wie `find_var()` (Umlaut- und Wortteil-Hinweise), Stempel übernehmen/beauftragen mit Spiegelung aus dem Codebuch, Einspruch der Kollegin, Fehler-Decoder, Notfallkonsole, Prüfbericht und R-Skript.
- Sitzung 2 „Erster Tag in der Datenerfassung“: drei HTML-Faksimiles mit mehrdeutigen Kreuzen, Erfassungsraster mit Codebuch-Prüfung, Bewertung erst nach „Erfassung abschließen“, Regeln für offene Zellen, Doppelerfassung mit Ben oder per Zeilencode, drei R-Zahlen, Suche nach −42 im ganzen Datensatz.
- Sitzung 3 „Deutschland in 100 Stühlen“: Stuhlregel für die Missing-Codes der Wahlabsicht, Sitzplan nach größten Resten, Diagnose über alle 32 Regeln (Rohprozente, gerundete 101, andere Regel), Saal als 10×10-Raster; Stuhlreihe nach Arbeitsstunden mit Quartilen nach SPSS (wie `describe()`), Schild-Prüfung und Stühle rechts vom Durchschnitt.
- Sitzung 4 behält vorerst die Mission „Belege es!“; die Mission aus Sitzung 3 entfällt, Sitzung 5 zeigt „Aufgabe folgt“.
- 153 automatisierte Tests bestanden (4 Echtdaten-Tests ohne Datei übersprungen); mit ZA8831 v1.3.0 stimmen alle Referenzwerte der Konzepte (u. a. 24/0/6 und 638 Zellen −42 in 202 Variablen, Stühle 25/20/19/12/8/6, Median 40, Mittel 37,9, 66 Stühle rechts). Lösungsskripte laufen mit mariposa 0.7.3 auf Testdatei und echter Datei (3/3), R-Abgleich der Mission 120/120. Browserprüfung mit echter Datei ohne Konsolenfehler, 390 px ohne Überlaufen.
```

In `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md` zwei Stellen ersetzen (alt → neu):

```text
alt: Kennwerte mit Fallauswahl (Mittel, Median, Quartile Typ 7, Anteil über dem Mittel, Option −10 → 0)
neu: Kennwerte mit Fallauswahl (Mittel, Median, Quartile nach SPSS Typ 6 wie describe(), Schiefe nach SPSS, Anteil über dem Mittel, Option −10 → 0)

alt: Faksimiles als SVG mit Textalternative, erfundene Personen, keine Logos.
neu: Faksimiles als gestaltetes HTML (echter Text, barrierefrei; mit Beschreibung der Kreuze für Screenreader), erfundene Personen, keine Logos.
```

- [ ] **Step 8: Gesamtprüfung und Build**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 153`, `# fail 0`, `# skipped 4`.

Run: `node --import tsx scripts/generate-map-layout.ts && node_modules/.bin/tsc --noEmit && node_modules/.bin/vite build && node scripts/export-offline.mjs`
Expected: `✓ built in …` und `Offline-Prototyp erstellt: … KB, alle Skripte und Stile eingebettet.`

- [ ] **Step 9: Abschließender Browserdurchlauf** mit eigener Datei: Sitzungen 1–3 je einmal allein und einmal in der Partnervariante, Neuladen (Stand bleibt, Datei muss neu geladen werden), Sitzung 4 zeigt weiterhin „Belege es!“, Sitzungen 5–10 „Aufgabe folgt“, Downloads (Prüfbericht, Plenumskarte, R-Skripte), 390 px ohne Überlaufen, keine Konsolenfehler.

- [ ] **Step 10: Commit**

```bash
git add src/tasks/allbus.local.test.ts scripts/export-task-scripts.ts scripts/verify-task-scripts.R README.md docs/PRUEFSTAND.md docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md
git commit -m "Add real-data checks, R script verification and docs for tasks 1-3"
```

---

## Nächste Etappen

Etappe 2: Sitzung 4 „Nenner-Check“ (Umbau von „Belege es!“ auf R, Werkbank/Live-Tabelle entfernen) und Sitzung 5 „Treiber-Rangliste“ (gewichtete n×m-Tabellen, V, Phi, Gamma, Tau-b, Spearman, Pearson). Etappe 3: Sitzungen 6–7 (t-Test, ANOVA, Tukey, Korrelationsmatrix; α, ω, Mittelwertindex). Etappe 4: Sitzungen 8–10 (OLS einfach/multipel, Wackeltest; Logit per IRLS). Jede Etappe bekommt einen eigenen Plan nach diesem Muster.
