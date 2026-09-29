# Lernpfad mit Missionen „Belege es!“ – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein neuer Lernpfad nach dem Sitzungsplan, dessen Kern Missionen „Belege es!“ sind: Studierende prüfen öffentliche Behauptungen mit ihrer eigenen ALLBUS-Datei selbst, fällen ein Urteil, werden kritisch hinterfragt und sehen im Robustheitsspiegel, wie stark ihr Urteil an ihren Entscheidungen hängt.

**Architecture:** Ein eigenständiges Modul `src/sandbox/` mit reiner Rechenschicht (SPSS-Leser, Rechenkern, Behauptungskatalog, Spiegel, Gegenfragen, R-Generator, Zustand) und einer Missionsoberfläche in `src/sandbox/ui/`. Ein neu geschriebener Lernpfad (`src/domain/curriculum.ts`, `src/components/LearningPath.tsx`) bettet die Missionen in die Sitzungen ein und ersetzt den bisherigen Lernpfad samt Aufgabensystem. Die ALLBUS-Datei wird nur im Arbeitsspeicher des Browsers gelesen.

**Tech Stack:** React 19, TypeScript (strict), Vite, `node --import tsx --test`, lucide-react; zur Prüfung R 4.5 mit mariposa 0.7.3, haven 2.5.5 und jsonlite.

**Spec:** `docs/superpowers/specs/2026-09-29-sandbox-belege-es-design.md`

## Global Constraints

- Keine ALLBUS-Mikrodaten im Repository, im Build oder im Browser-Speicher. `.gitignore` schließt `*.sav` und `*.zsav` aus; nur `src/sandbox/fixtures/*.sav` (synthetisch) ist erlaubt.
- R-Code folgt mariposa im tidy-style: `read_spss()`, `rec()` in `mutate()`, `crosstab()` in `%>%`-Pipes. Gezählte Missing-Codes laufen über `untag_na()`. Nie `read_spss(tag_na = FALSE)` für diesen Zweck verwenden: Die Codes gingen still verloren.
- Referenzversionen: ALLBUScompact 2023 ZA8831 v1.3.0; mariposa 0.7.3; R 4.5.
- Keine neuen npm-Abhängigkeiten. Kein Server, kein Netzwerkzugriff zur Laufzeit.
- Oberflächentexte auf Deutsch in der Du-Form, wie im übrigen Atlas.
- Alles per Tastatur bedienbar; der Spiegel hat eine Textalternative.
- Tests laufen mit `pnpm test` (`node --import tsx --test …`); `pnpm build` muss grün bleiben.
- Die echte ALLBUS-Datei liegt außerhalb des Repositorys, z. B. `../../ZA8831_v1-3-0.sav` relativ zum Projektordner. In Befehlen steht dafür `$ALLBUS_SAV`.

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `src/sandbox/readSav.ts` | SPSS-Systemdateien lesen (Labels, Missing-Definitionen, Bytecode-Kompression, lange Namen, Zeichenkodierung) |
| `src/sandbox/format.ts` | Zahlformat für Prozent, Punkte, Fallzahlen |
| `src/sandbox/analysis.ts` | Gruppen bilden, dichotomisieren, gewichtete 2×2-Tabellen, Anteile |
| `src/sandbox/claims.ts` | Die drei Behauptungen als Daten: Items, Voreinstellungen, Dimensionen des Spiegels |
| `src/sandbox/allbus.ts` | ZA8831 erkennen, fehlende Variablen melden, Variablensuche |
| `src/sandbox/multiverse.ts` | Alle Wege durchrechnen, eigenen Weg einordnen, Gewicht der Entscheidungen |
| `src/sandbox/rcode.ts` | mariposa-Skript aus dem Zustand |
| `src/sandbox/questions.ts` | Elf Gegenfragen-Regeln |
| `src/sandbox/state.ts` | Arbeitsstand, Missionsstatus, Speicherung, Schrittprüfung, Belegsatz, Faktencheck-Karte |
| `src/sandbox/testData.ts` | Testhilfen (nur von Tests importiert) |
| `src/sandbox/fixtures/*` | Synthetische `.sav`-Dateien und haven-Erwartung |
| `src/sandbox/ui/*.tsx` | Missionsoberfläche (Datei laden, fünf Schritte) |
| `src/sandbox.css` | Stile der Missionen |
| `src/domain/curriculum.ts` | Zehn Sitzungen nach dem Sitzungsplan: Begriffe, Leitfragen, Missionen |
| `src/components/LearningPath.tsx`, `src/learning-path.css` | Neuer Lernpfad mit Sitzungsleiste und eingebetteten Missionen |
| `scripts/make-sandbox-fixture.R` | Erzeugt die synthetischen Testdateien |
| `scripts/export-sandbox-grid.ts`, `scripts/verify-sandbox-r.R` | Abgleich des erzeugten R-Codes mit dem Rechenkern |

Abweichung von der Spezifikation (7): Die Rechenschicht liegt flach in `src/sandbox/` statt in Unterordnern, damit der bestehende Test-Glob `src/sandbox/*.test.ts` reicht.

---

### Task 0: Arbeitszweig anlegen

- [ ] **Step 1: Zweig vom aktuellen Stand abzweigen**

```bash
git switch -c sandbox-belege-es
git add docs/superpowers/specs/2026-09-29-sandbox-belege-es-design.md docs/superpowers/plans/2026-09-29-sandbox-belege-es.md
git commit -m "Add design spec and implementation plan for the mission learning path"
```

---

### Task 1: SPSS-Leser mit synthetischen Testdateien

**Files:**
- Modify: `.gitignore`, `package.json` (Testskript)
- Create: `scripts/make-sandbox-fixture.R`, `src/sandbox/fixtures/` (erzeugt), `src/sandbox/testData.ts`, `src/sandbox/readSav.ts`
- Test: `src/sandbox/readSav.test.ts`

**Interfaces:**
- Produces: `readSav(buffer: ArrayBuffer): SavFile`, `isMissingCode(variable: SavVariable, x: number): boolean`, `class SavError`, Typen `SavFile`, `SavVariable`, `SavMissing`; Testhilfen `fixtureBuffer(name?)`, `fixtureSav(name?)`, `fixtureExpected()`, `fakeSav(columns)`.

- [ ] **Step 1: `.gitignore` und Testskript erweitern**

An `.gitignore` anhängen:

```gitignore
*.sav
*.zsav
!src/sandbox/fixtures/*.sav
```

In `package.json` das Testskript ersetzen:

```json
"test": "node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts"
```

- [ ] **Step 2: Fixture-Skript anlegen und Testdateien erzeugen**

`scripts/make-sandbox-fixture.R`

```r
# Erzeugt synthetische ALLBUS-ähnliche SPSS-Dateien für die Sandbox-Tests.
# Keine echten Befragten. Aufruf aus dem Projektordner:
#   Rscript --vanilla scripts/make-sandbox-fixture.R
suppressMessages({ library(haven); library(jsonlite) })
set.seed(8831)
out <- "src/sandbox/fixtures"
args <- commandArgs(trailingOnly = TRUE)
if (length(args) > 0) out <- args[1]
dir.create(out, showWarnings = FALSE, recursive = TRUE)
n <- 60
miss <- c(-Inf, -1)
lab <- function(x, labels, label) labelled_spss(x, labels = labels, na_range = miss, label = label)
pick <- function(codes, p) sample(codes, n, replace = TRUE, prob = p)

d <- data.frame(respid = seq_len(n))
d$za_nr <- labelled(rep(8831, n), c("ALLBUScompact 2023" = 8831), label = "STUDIENNUMMER")
d$version <- rep("v1.3.0, 2025-07-30 (synthetisch)", n)
d$eastwest <- labelled(pick(1:2, c(.65, .35)), c("ALTE BUNDESLAENDER" = 1, "NEUE BUNDESLAENDER" = 2), label = "ERHEBUNGSGEBIET")
d$wghtpew <- lab(ifelse(d$eastwest == 1, 1.2, 0.55) + round(runif(n, 0, 0.05), 4), c("DATENFEHLER" = -42), "OST-WEST-GEWICHT")
d$age <- lab(c(18, 29, 30, 90, -32, pick(18:90, NULL)[-(1:5)]), c("NICHT GENERIERBAR" = -32), "ALTER")
d$pa02a <- lab(pick(c(1:5, -9, -42), c(.1, .3, .4, .1, .06, .03, .01)),
               c("DATENFEHLER" = -42, "KEINE ANGABE" = -9, "SEHR STARK" = 1, "STARK" = 2, "MITTEL" = 3, "WENIG" = 4, "UEBERHAUPT NICHT" = 5),
               "POLITISCHES INTERESSE")
d$li07 <- lab(pick(c(1:7, -9), c(rep(.12, 7), .16)), c("KEINE ANGABE" = -9, "1 - UNWICHTIG" = 1, "7 - SEHR WICHTIG" = 7), "WICHTIGKEIT POLITIK")
for (v in c("pt03", "pt12", "pt15")) {
  d[[v]] <- lab(pick(c(1:7, -11, -9), c(rep(.07, 7), .45, .06)),
                c("TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "GAR KEIN VERTRAUEN" = 1, "GROSSES VERTRAUEN" = 7), paste("VERTRAUEN", v))
}
d$pe01 <- lab(pick(c(1:4, -11, -8), c(.2, .25, .15, .05, .3, .05)),
              c("TNZ: SPLIT" = -11, "WEISS NICHT" = -8, "STIMME VOLL ZU" = 1, "STIMME EHER ZU" = 2, "STIMME EHER NICHT ZU" = 3, "STIMME GAR NICHT ZU" = 4),
              "POLITIKER KUEMMERN S.NICHT UM M.GEDANKEN")
d$pa35 <- lab(pick(c(1:5, -11), c(.15, .2, .2, .1, .05, .3)), c("TNZ: SPLIT" = -11, "STIMME VOLL ZU" = 1, "LEHNE GANZ AB" = 5), "POLITIKER VERTRETEN NUR DIE REICHEN")
d$pv01 <- lab(pick(c(1, 2, 3, 4, 6, 42, 90, 91, -8, -7, -50), c(.15, .12, .05, .12, .05, .08, .03, .12, .14, .08, .06)),
              c("NICHT WAHLBERECHTIGT" = -50, "VERWEIGERT" = -7, "WEISS NICHT" = -8, "CDU-CSU" = 1, "WUERDE NICHT WAEHLEN" = 91),
              "WAHLABSICHT BUNDESTAGSWAHL")
d$vertrauen_bundestag_lang <- lab(as.numeric(d$pt03), c("TNZ: SPLIT" = -11), "Langer Variablenname zum Test")
d$kommentar <- sample(c("", "ja", "Ümläute & Ärger", "ein sehr langer Kommentar mit mehr als acht Zeichen"), n, replace = TRUE)

write_sav(d, file.path(out, "sandbox-fixture.sav"), compress = "byte")
write_sav(d, file.path(out, "sandbox-fixture-uncompressed.sav"), compress = "none")

back <- read_sav(file.path(out, "sandbox-fixture.sav"), user_na = TRUE)
num <- function(x) { x <- unclass(as.numeric(x)); ifelse(is.na(x), NA, x) }
expected <- list(nCases = nrow(back), variables = lapply(names(back), function(v) {
  x <- back[[v]]
  labels <- attr(x, "labels")
  list(
    name = v,
    label = if (is.null(attr(x, "label"))) "" else attr(x, "label"),
    kind = if (is.character(x)) "string" else "numeric",
    values = if (is.character(x)) NULL else num(x),
    strings = if (is.character(x)) as.character(x) else NULL,
    naValues = if (is.null(attr(x, "na_values"))) list() else as.list(attr(x, "na_values")),
    naRange = if (is.null(attr(x, "na_range"))) NULL else ifelse(is.infinite(attr(x, "na_range")), NA, attr(x, "na_range")),
    valueLabels = if (is.null(labels) || is.character(x)) list() else lapply(seq_along(labels), function(i) list(value = unname(labels[i]), label = names(labels)[i]))
  )
}))
write_json(expected, file.path(out, "sandbox-fixture.expected.json"), auto_unbox = TRUE, digits = I(17), null = "null", na = "null", pretty = TRUE)
cat("Geschrieben nach", out, "\n")
```

Run: `Rscript --vanilla scripts/make-sandbox-fixture.R`
Expected: `Geschrieben nach src/sandbox/fixtures` und drei Dateien `sandbox-fixture.sav`, `sandbox-fixture-uncompressed.sav`, `sandbox-fixture.expected.json`. Die Daten sind durch `set.seed(8831)` festgelegt. Die Referenzwerte in späteren Tests gelten für genau diese Dateien.

- [ ] **Step 3: Testhilfen anlegen**

`src/sandbox/testData.ts`

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readSav, type SavFile, type SavVariable } from './readSav';

const here = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

export function fixtureBuffer(name = 'sandbox-fixture.sav'): ArrayBuffer {
  const bytes = readFileSync(here(name));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
export const fixtureSav = (name?: string): SavFile => readSav(fixtureBuffer(name));
export const fixtureExpected = () => JSON.parse(readFileSync(here('sandbox-fixture.expected.json'), 'utf8'));

/** Kleiner handgebauter Datensatz für Rechentests. */
export function fakeSav(columns: Record<string, { values: number[]; labels?: Record<number, string>; missingFrom?: number }>): SavFile {
  const variables: SavVariable[] = Object.entries(columns).map(([name, c]) => ({
    name, label: name, kind: 'numeric', values: Float64Array.from(c.values), strings: [],
    missing: { values: [], range: c.missingFrom === undefined ? null : [-Infinity, c.missingFrom] },
    valueLabels: new Map(Object.entries(c.labels ?? {}).map(([k, v]) => [Number(k), v])),
  }));
  const nCases = variables[0]?.values.length ?? 0;
  return { label: '', encoding: 'utf-8', nCases, variables, byName: new Map(variables.map(v => [v.name, v])) };
}
```

- [ ] **Step 4: Fehlschlagenden Test schreiben**

`src/sandbox/readSav.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { isMissingCode, readSav, SavError } from './readSav';
import { fixtureBuffer, fixtureExpected } from './testData';

for (const file of ['sandbox-fixture.sav', 'sandbox-fixture-uncompressed.sav']) {
  test(`reads ${file} exactly like haven`, () => {
    const expected = fixtureExpected();
    const sav = readSav(fixtureBuffer(file));
    assert.equal(sav.nCases, expected.nCases);
    assert.deepEqual(sav.variables.map(v => v.name), expected.variables.map((v: { name: string }) => v.name));
    for (const e of expected.variables) {
      const v = sav.byName.get(e.name)!;
      assert.equal(v.label, e.label, e.name);
      assert.equal(v.kind, e.kind, e.name);
      if (e.kind === 'numeric') assert.deepEqual(Array.from(v.values, x => Number.isNaN(x) ? null : x), e.values, e.name);
      else assert.deepEqual(v.strings, e.strings, e.name);
      const range = e.naRange ? [e.naRange[0] ?? -Infinity, e.naRange[1] ?? Infinity] : null;
      assert.deepEqual(v.missing.range, range, `${e.name} range`);
      assert.deepEqual(v.missing.values, e.naValues, `${e.name} values`);
      assert.deepEqual([...v.valueLabels].map(([value, label]) => ({ value, label })), e.valueLabels, `${e.name} labels`);
    }
  });
}

test('keeps user missing codes as values and recognises them as missing', () => {
  const pv01 = readSav(fixtureBuffer()).byName.get('pv01')!;
  assert.ok(pv01.values.includes(-8));
  assert.equal(isMissingCode(pv01, -8), true);
  assert.equal(isMissingCode(pv01, 91), false);
  assert.equal(isMissingCode(pv01, NaN), true);
});

test('rejects files that are not plain SPSS system files', () => {
  const text = new TextEncoder().encode('Das ist keine SPSS-Datei, sondern Text.'.padEnd(200, '.'));
  assert.throws(() => readSav(text.buffer), (e: unknown) => e instanceof SavError && /keine SPSS-Datei/.test(e.message));
  const zsav = new Uint8Array(fixtureBuffer().slice(0));
  zsav.set(new TextEncoder().encode('$FL3'), 0);
  assert.throws(() => readSav(zsav.buffer), /ZSAV/);
  assert.throws(() => readSav(new ArrayBuffer(10)), /zu kurz/);
});
```

- [ ] **Step 5: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/readSav.test.ts`
Expected: FAIL, weil `./readSav` nicht existiert.

- [ ] **Step 6: SPSS-Leser implementieren**

`src/sandbox/readSav.ts`

```ts
export type SavMissing = { values: number[]; range: [number, number] | null };
export type SavVariable = {
  name: string; label: string; kind: 'numeric' | 'string';
  values: Float64Array; strings: string[];
  missing: SavMissing; valueLabels: Map<number, string>;
};
export type SavFile = { label: string; encoding: string; nCases: number; variables: SavVariable[]; byName: Map<string, SavVariable> };

export class SavError extends Error {}

const SYSMIS = -Number.MAX_VALUE;
const CODEPAGES: Record<number, string> = { 65001: 'utf-8', 1252: 'windows-1252', 28591: 'iso-8859-1', 1250: 'windows-1250' };

type RawVar = { width: number; nameBytes: Uint8Array; labelBytes: Uint8Array | null; nMissing: number; missing: number[] };
type LabelSet = { values: Uint8Array[]; labels: Uint8Array[]; slots: number[] };

export function readSav(buffer: ArrayBuffer): SavFile {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  if (bytes.length < 176) throw new SavError('Die Datei ist zu kurz für eine SPSS-Datei.');
  const magic = String.fromCharCode(...bytes.subarray(0, 4));
  if (magic === '$FL3') throw new SavError('Komprimierte ZSAV-Dateien werden nicht unterstützt. Bitte die normale .sav-Datei von GESIS verwenden.');
  if (magic !== '$FL2') throw new SavError('Das ist keine SPSS-Datei (.sav).');
  const layout = view.getInt32(64, true);
  const le = layout === 2 || layout === 3;
  let pos = 64;
  const i32 = () => { const v = view.getInt32(pos, le); pos += 4; return v; };
  const f64 = () => { const v = view.getFloat64(pos, le); pos += 8; return v; };
  const take = (n: number) => { const b = bytes.slice(pos, pos + n); pos += n; return b; };

  i32();
  i32();
  const compression = i32();
  i32();
  const headerCases = i32();
  const bias = f64();
  pos += 17;
  const fileLabel = take(64);
  pos += 3;
  if (compression === 2) throw new SavError('Komprimierte ZSAV-Dateien werden nicht unterstützt. Bitte die normale .sav-Datei von GESIS verwenden.');

  const raw: RawVar[] = [];
  const slots: number[] = [];
  const labelSets: LabelSet[] = [];
  const extensions = new Map<number, Uint8Array>();
  let characterCode = 0;

  for (;;) {
    if (pos + 4 > bytes.length) throw new SavError('Die Datei endet vor dem Datenteil.');
    const rec = i32();
    if (rec === 2) {
      const width = i32(); const hasLabel = i32(); const nMissing = i32();
      i32(); i32();
      const nameBytes = take(8);
      let labelBytes: Uint8Array | null = null;
      if (hasLabel === 1) { const len = i32(); labelBytes = take(len); pos += (4 - (len % 4)) % 4; }
      const missing: number[] = [];
      for (let k = 0; k < Math.abs(nMissing); k++) { if (width === 0) missing.push(f64()); else pos += 8; }
      if (width === -1) { slots.push(-1); continue; }
      slots.push(raw.length);
      raw.push({ width, nameBytes, labelBytes, nMissing, missing });
    } else if (rec === 3) {
      const count = i32();
      const set: LabelSet = { values: [], labels: [], slots: [] };
      for (let k = 0; k < count; k++) {
        set.values.push(take(8));
        const len = bytes[pos]; pos += 1;
        set.labels.push(take(len));
        pos += (8 - ((len + 1) % 8)) % 8;
      }
      if (i32() !== 4) throw new SavError('Wertelabels ohne Variablenzuordnung.');
      const nVars = i32();
      for (let k = 0; k < nVars; k++) set.slots.push(i32() - 1);
      labelSets.push(set);
    } else if (rec === 6) {
      pos += 80 * i32();
    } else if (rec === 7) {
      const subtype = i32(); const size = i32(); const count = i32();
      const data = take(size * count);
      extensions.set(subtype, data);
      if (subtype === 3 && size === 4 && count >= 8) characterCode = new DataView(data.buffer).getInt32(28, le);
    } else if (rec === 999) {
      i32();
      break;
    } else {
      throw new SavError(`Unbekannter Datensatztyp ${rec} an Byte ${pos - 4}.`);
    }
  }

  const encodingName = extensions.has(20)
    ? String.fromCharCode(...extensions.get(20)!).trim().toLowerCase()
    : CODEPAGES[characterCode] ?? 'windows-1252';
  let decoder: TextDecoder;
  try { decoder = new TextDecoder(encodingName); } catch { decoder = new TextDecoder('windows-1252'); }
  const text = (b: Uint8Array) => decoder.decode(b).replace(/[\s\u0000]+$/, '');

  const longNames = new Map<string, string>();
  if (extensions.has(13)) {
    for (const pair of decoder.decode(extensions.get(13)!).split('\t')) {
      const eq = pair.indexOf('=');
      if (eq > 0) longNames.set(pair.slice(0, eq), pair.slice(eq + 1).replace(/\u0000+$/, ''));
    }
  }

  const values: number[][] = raw.map(() => []);
  const strings: string[][] = raw.map(() => []);
  const plan = slots.map((v, j) => {
    if (v >= 0) return { v, first: true };
    let k = j; while (slots[k] < 0) k--;
    return { v: slots[k], first: false };
  });
  const nSlots = slots.length;
  let cmd = new Uint8Array(8), ci = 8, eof = false;

  const nextSlot = (): number | Uint8Array | null => {
    if (compression === 0) {
      if (pos + 8 > bytes.length) return null;
      return take(8);
    }
    for (;;) {
      if (ci === 8) {
        if (pos + 8 > bytes.length) return null;
        cmd = take(8); ci = 0;
      }
      const c = cmd[ci++];
      if (c === 0) continue;
      if (c === 252) { eof = true; return null; }
      if (c === 253) { if (pos + 8 > bytes.length) return null; return take(8); }
      if (c === 254) return new Uint8Array(8).fill(32);
      if (c === 255) return NaN;
      return c - bias;
    }
  };

  const caseBytes = raw.map(r => new Uint8Array(Math.ceil(Math.max(r.width, 1) / 8) * 8));
  let nCases = 0;
  outer: while (!eof && (headerCases < 0 || nCases < headerCases)) {
    const offsets = new Array<number>(raw.length).fill(0);
    for (let j = 0; j < nSlots; j++) {
      const slot = nextSlot();
      if (slot === null) { if (j === 0) break outer; throw new SavError('Die Datei endet mitten in einem Fall.'); }
      const { v } = plan[j];
      if (raw[v].width === 0) {
        let x: number;
        if (typeof slot === 'number') x = slot;
        else x = new DataView(slot.buffer, slot.byteOffset, 8).getFloat64(0, le);
        values[v].push(x === SYSMIS ? NaN : x);
      } else {
        const chunk = typeof slot === 'number' ? new Uint8Array(8).fill(32) : slot;
        caseBytes[v].set(chunk, offsets[v]); offsets[v] += 8;
        if (j + 1 === nSlots || plan[j + 1].first || plan[j + 1].v !== v) strings[v].push(text(caseBytes[v].subarray(0, offsets[v])).trimEnd());
      }
    }
    nCases++;
  }

  const variables: SavVariable[] = raw.map((r, i) => {
    const shortName = text(r.nameBytes).trim();
    const missing: SavMissing = { values: [], range: null };
    if (r.nMissing > 0) missing.values = r.missing;
    if (r.nMissing <= -2) missing.range = [r.missing[0] <= -1e300 ? -Infinity : r.missing[0], r.missing[1] >= 1e300 ? Infinity : r.missing[1]];
    if (r.nMissing === -3) missing.values = [r.missing[2]];
    return {
      name: longNames.get(shortName) ?? shortName,
      label: r.labelBytes ? text(r.labelBytes) : '',
      kind: r.width === 0 ? 'numeric' : 'string',
      values: Float64Array.from(values[i]),
      strings: strings[i],
      missing,
      valueLabels: new Map(),
    };
  });

  for (const set of labelSets) {
    for (const slot of set.slots) {
      const v = slots[slot];
      if (v === undefined || v < 0 || raw[v].width !== 0) continue;
      set.values.forEach((b, k) => variables[v].valueLabels.set(new DataView(b.buffer).getFloat64(0, le), text(set.labels[k])));
    }
  }

  return { label: text(fileLabel).trim(), encoding: encodingName, nCases, variables, byName: new Map(variables.map(v => [v.name, v])) };
}

export function isMissingCode(variable: SavVariable, x: number): boolean {
  if (Number.isNaN(x)) return true;
  if (variable.missing.values.includes(x)) return true;
  const r = variable.missing.range;
  return r !== null && x >= r[0] && x <= r[1];
}
```

- [ ] **Step 7: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/readSav.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 8: Gegen die echte Datei gegenlesen (lokal, nicht eingecheckt)**

Run: `node --import tsx -e "import('./src/sandbox/readSav.ts').then(({readSav})=>{const b=require('node:fs').readFileSync(process.env.ALLBUS_SAV);const s=readSav(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));console.log(s.nCases,s.variables.length,s.byName.get('version').strings[0]);})"`
Expected: `5246 579 v1.3.0, 2025-07-30`

- [ ] **Step 9: Commit**

```bash
git add .gitignore package.json scripts/make-sandbox-fixture.R src/sandbox/fixtures src/sandbox/testData.ts src/sandbox/readSav.ts src/sandbox/readSav.test.ts
git commit -m "Read SPSS system files in the browser for the sandbox"
```

---

### Task 2: Rechenkern

**Files:**
- Create: `src/sandbox/format.ts`, `src/sandbox/analysis.ts`
- Test: `src/sandbox/analysis.test.ts`

**Interfaces:**
- Consumes: `SavFile`, `SavVariable`, `isMissingCode` (Task 1)
- Produces: Typen `Range`, `MissingMode`, `Selector`, `Outcome`, `Analysis`, `Table2x2`, `AnalysisResult`; `WEIGHT_VARIABLE`, `variableOf`, `groupCodes`, `dichotomize`, `crosstab2`, `share`, `analyse(sav, analysis): AnalysisResult`, `columnShare(table, group, cell)`; `num1`, `pct`, `count`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/analysis.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse, columnShare, crosstab2, dichotomize, groupCodes } from './analysis';
import { fakeSav } from './testData';

const sav = fakeSav({
  age: { values: [18, 25, 40, 70, -32, 30], missingFrom: -1 },
  q: { values: [1, 2, 3, -9, 1, 4], missingFrom: -1 },
  w: { values: [2, 1, 1, 1, NaN, 0.5] },
});

test('assigns target, comparison and excluded cases from ranges and missing codes', () => {
  const g = groupCodes(sav.byName.get('age')!, { variable: 'age', target: [[18, 29]], comparison: [[30, Infinity]] });
  assert.deepEqual([...g], [0, 0, 1, 1, -1, 1]);
});

test('dichotomizes with every missing mode and excluded categories', () => {
  const q = sav.byName.get('q')!;
  const base = { variable: 'q', positive: [1, 2], exclude: [] as number[] };
  const values = (m: Parameters<typeof dichotomize>[1]) => [...dichotomize(q, m)].map(x => Number.isNaN(x) ? null : x);
  assert.deepEqual(values({ ...base, missing: { mode: 'drop' } }), [1, 1, 0, null, 1, 0]);
  assert.deepEqual(values({ ...base, missing: { mode: 'allAsNo' } }), [1, 1, 0, 0, 1, 0]);
  assert.deepEqual(values({ ...base, missing: { mode: 'codesAsYes', codes: [-9] } }), [1, 1, 0, 1, 1, 0]);
  assert.deepEqual(values({ ...base, exclude: [3], missing: { mode: 'drop' } }), [1, 1, null, null, 1, 0]);
});

test('crosstab counts cases, weights them and drops invalid weights', () => {
  const groups = Int8Array.from([0, 0, 1, 1, -1, 1]);
  const outcome = Float64Array.from([1, 1, 0, NaN, 1, 0]);
  assert.deepEqual(crosstab2(groups, outcome, null), { yes: [2, 0], no: [0, 2], n: [2, 2] });
  assert.deepEqual(crosstab2(groups, outcome, Float64Array.from([2, 1, 1, 1, NaN, 0.5])), { yes: [3, 0], no: [0, 1.5], n: [2, 2] });
  assert.deepEqual(crosstab2(groups, outcome, Float64Array.from([2, 1, NaN, 1, 1, 0.5])), { yes: [3, 0], no: [0, 0.5], n: [2, 1] });
});

test('reports shares, difference in points and column shares', () => {
  const r = analyse(sav, { group: { variable: 'age', target: [[18, 29]], comparison: [[30, Infinity]] }, outcome: { variable: 'q', positive: [1], exclude: [], missing: { mode: 'drop' } }, weighted: false });
  assert.equal(r.target, 0.5);
  assert.equal(r.comparison, 0);
  assert.equal(r.difference, 50);
  assert.equal(columnShare(r.table, 0, 'yes'), 1);
  assert.equal(columnShare(r.table, 1, 'no'), 2 / 3);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/analysis.test.ts`
Expected: FAIL, weil `./analysis` nicht existiert.

- [ ] **Step 3: Formatierung anlegen**

`src/sandbox/format.ts`

```ts
const one = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
export const num1 = (x: number) => x.toLocaleString('de-DE', one);
export const pct = (share: number) => Number.isFinite(share) ? `${num1(share * 100)} %` : '–';
export const count = (n: number) => Math.round(n).toLocaleString('de-DE');
```

- [ ] **Step 4: Rechenkern implementieren**

`src/sandbox/analysis.ts`

```ts
import { isMissingCode, type SavFile, type SavVariable } from './readSav';

export type Range = [number, number];
export type MissingMode = { mode: 'drop' } | { mode: 'allAsNo' } | { mode: 'codesAsYes'; codes: number[] };
export type Selector = { variable: string; target: Range[]; comparison: Range[] };
export type Outcome = { variable: string; positive: number[]; exclude: number[]; missing: MissingMode };
export type Analysis = { group: Selector; outcome: Outcome; weighted: boolean };
export type Table2x2 = { yes: [number, number]; no: [number, number]; n: [number, number] };
export type AnalysisResult = { table: Table2x2; target: number; comparison: number; difference: number };

export const WEIGHT_VARIABLE = 'wghtpew';
const inRanges = (x: number, ranges: Range[]) => ranges.some(([lo, hi]) => x >= lo && x <= hi);

export function variableOf(sav: SavFile, name: string): SavVariable {
  const v = sav.byName.get(name);
  if (!v) throw new Error(`Variable ${name} fehlt im Datensatz.`);
  return v;
}

/** 0 = Zielgruppe, 1 = Vergleichsgruppe, -1 = ausgeschlossen */
export function groupCodes(variable: SavVariable, selector: Selector): Int8Array {
  const out = new Int8Array(variable.values.length).fill(-1);
  variable.values.forEach((x, i) => {
    if (isMissingCode(variable, x)) return;
    if (inRanges(x, selector.target)) out[i] = 0;
    else if (inRanges(x, selector.comparison)) out[i] = 1;
  });
  return out;
}

/** 1 = ja, 0 = nein, NaN = ausgeschlossen */
export function dichotomize(variable: SavVariable, outcome: Outcome): Float64Array {
  const out = new Float64Array(variable.values.length);
  variable.values.forEach((x, i) => {
    if (isMissingCode(variable, x)) {
      const m = outcome.missing;
      out[i] = m.mode === 'allAsNo' ? 0 : m.mode === 'codesAsYes' && m.codes.includes(x) ? 1 : NaN;
    } else if (outcome.exclude.includes(x)) out[i] = NaN;
    else out[i] = outcome.positive.includes(x) ? 1 : 0;
  });
  return out;
}

export function crosstab2(groups: Int8Array, outcome: Float64Array, weights: Float64Array | null): Table2x2 {
  const t: Table2x2 = { yes: [0, 0], no: [0, 0], n: [0, 0] };
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i], y = outcome[i];
    if (g < 0 || Number.isNaN(y)) continue;
    const w = weights ? weights[i] : 1;
    if (!(w > 0)) continue;
    if (y === 1) t.yes[g] += w; else t.no[g] += w;
    t.n[g] += 1;
  }
  return t;
}

export const share = (t: Table2x2, g: 0 | 1) => t.yes[g] / (t.yes[g] + t.no[g]);

export function analyse(sav: SavFile, a: Analysis): AnalysisResult {
  const groups = groupCodes(variableOf(sav, a.group.variable), a.group);
  const outcome = dichotomize(variableOf(sav, a.outcome.variable), a.outcome);
  const table = crosstab2(groups, outcome, a.weighted ? variableOf(sav, WEIGHT_VARIABLE).values : null);
  const target = share(table, 0), comparison = share(table, 1);
  return { table, target, comparison, difference: (target - comparison) * 100 };
}

/** Anteil einer Gruppe an allen „ja“ (bzw. „nein“) beider Gruppen – die Spaltenprozente. */
export const columnShare = (t: Table2x2, g: 0 | 1, cell: 'yes' | 'no') => t[cell][g] / (t[cell][0] + t[cell][1]);
```

- [ ] **Step 5: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/analysis.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 6: Commit**

```bash
git add src/sandbox/format.ts src/sandbox/analysis.ts src/sandbox/analysis.test.ts
git commit -m "Add weighted two-by-two engine for sandbox claims"
```

---

### Task 3: Behauptungskatalog

**Files:**
- Create: `src/sandbox/claims.ts`
- Test: `src/sandbox/claims.test.ts`

**Interfaces:**
- Consumes: `Analysis`, `AnalysisResult`, `MissingMode`, `Range` (Task 2)
- Produces: Typen `Choice`, `Category`, `ItemOption`, `Level`, `Dimension`, `MissingOption`, `FixedOutcome`, `Claim`; `toRanges`, `itemOf(claim, variable)`, `jugend`, `osten`, `nichtwahl`, `claims`, `claimById`. `claim.analysis(choice, item)`, `claim.groupLabels(choice, item)`, `claim.outcomeLabels(choice, item)` liefern Analyse und Beschriftungen.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/claims.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse } from './analysis';
import { claims, itemOf, jugend, nichtwahl, osten, toRanges } from './claims';
import { fixtureSav } from './testData';

test('compresses codes into sorted ranges', () => {
  assert.deepEqual(toRanges([3, 1, 2, 7, 5, 6, 42]), [[1, 3], [5, 7], [42, 42]]);
  assert.deepEqual(toRanges([]), []);
});

test('every claim is complete and its defaults are one of its own paths', () => {
  for (const claim of claims) {
    assert.equal(claim.gaps.length, 5, claim.id);
    assert.ok(claim.items.some(i => i.variable === claim.defaults.item), claim.id);
    assert.ok(claim.missingOptions.some(o => JSON.stringify(o.mode) === JSON.stringify(claim.defaults.missing)), claim.id);
    for (const item of claim.items) for (const code of [...item.strict, ...item.wide]) assert.ok(item.categories.some(k => k.code === code), `${claim.id} ${item.variable} ${code}`);
  }
});

test('each claim builds the intended groups and outcome', () => {
  const young = jugend.analysis({ ...jugend.defaults, cut: 24, comparison: 'mid' }, itemOf(jugend, 'pa02a'));
  assert.deepEqual(young.group, { variable: 'age', target: [[18, 24]], comparison: [[40, 59]] });
  assert.deepEqual(jugend.groupLabels({ ...jugend.defaults, cut: 24 }, itemOf(jugend, 'pa02a')), ['18–24', '25 und älter']);
  const east = osten.analysis({ ...osten.defaults, exclude: [4] }, itemOf(osten, 'pt03'));
  assert.deepEqual(east.group.target, [[2, 2]]);
  assert.deepEqual(east.outcome.exclude, [4]);
  const distrust = nichtwahl.analysis({ ...nichtwahl.defaults, positive: [1, 2] }, itemOf(nichtwahl, 'pe01'));
  assert.deepEqual(distrust.group, { variable: 'pe01', target: [[1, 2]], comparison: [[3, 4]] });
  assert.deepEqual(distrust.outcome.positive, [91]);
});

// Referenzwerte der synthetischen Datei; mit scripts/verify-sandbox-r.R gegen mariposa 0.7.3 geprüft.
test('matches mariposa on the synthetic fixture', () => {
  const f = fixtureSav();
  const run = (claim: typeof jugend, choice = claim.defaults) => analyse(f, claim.analysis(choice, itemOf(claim, choice.item)));
  const o = run(osten);
  assert.deepEqual(o.table, { yes: [8, 4], no: [5, 9], n: [13, 13] });
  assert.equal(o.target, 8 / 13);
  const n = run(nichtwahl, { ...nichtwahl.defaults, missing: { mode: 'codesAsYes', codes: [-8] } });
  assert.deepEqual([n.target, n.comparison], [3 / 8, 10 / 28]);
  const j = run(jugend, { ...jugend.defaults, weighted: true });
  assert.equal(j.target.toFixed(6), '0.246710');
  assert.equal(j.comparison.toFixed(6), '0.381749');
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/claims.test.ts`
Expected: FAIL, weil `./claims` nicht existiert.

- [ ] **Step 3: Katalog implementieren**

`src/sandbox/claims.ts`

```ts
import type { Analysis, AnalysisResult, MissingMode, Range } from './analysis';

export type Choice = {
  item: string;
  positive: number[];
  cut: number;
  comparison: string;
  missing: MissingMode;
  exclude: number[];
  weighted: boolean;
};

export type Category = { code: number; label: string };
export type ItemOption = {
  variable: string;
  title: string;
  question: string;
  categories: Category[];
  strict: number[];
  wide: number[];
  split: boolean;
  yes: string;
  no: string;
};
export type Level = { label: string; apply: (c: Choice) => Choice };
export type Dimension = { id: string; label: string; levels: Level[] };
export type MissingOption = { id: string; label: string; mode: MissingMode };
export type FixedOutcome = { variable: string; codes: number[]; positive: number[]; yes: string; no: string };

export type Claim = {
  id: 'jugend' | 'osten' | 'nichtwahl';
  quote: string;
  source: string;
  gaps: [string, string][];
  itemRole: 'outcome' | 'group';
  itemPrompt: string;
  items: ItemOption[];
  comparisons: { id: string; label: string }[];
  cutRange: [number, number] | null;
  missingOptions: MissingOption[];
  requiredVariables: string[];
  defaults: Choice;
  fixedOutcome: FixedOutcome | null;
  groupLabels: (c: Choice, item: ItemOption) => [string, string];
  outcomeLabels: (c: Choice, item: ItemOption) => [string, string];
  rNames: { group: string; outcome: string };
  analysis: (c: Choice, item: ItemOption) => Analysis;
  dimensions: Dimension[];
  temporal: boolean;
  intention: boolean;
  midpoint: number | null;
  thirdVariables: string;
  core: { label: string; test: (r: AnalysisResult) => boolean };
};

export const toRanges = (codes: number[]): Range[] => {
  const sorted = [...new Set(codes)].sort((a, b) => a - b), out: Range[] = [];
  for (const c of sorted) {
    const last = out[out.length - 1];
    if (last && c === last[1] + 1) last[1] = c; else out.push([c, c]);
  }
  return out;
};

const scale = (from: number, to: number, labels: Record<number, string>): Category[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ code: from + i, label: labels[from + i] ?? String(from + i) }));

export function itemOf(claim: Claim, variable: string): ItemOption {
  const item = claim.items.find(i => i.variable === variable);
  if (!item) throw new Error(`Item ${variable} gehört nicht zu ${claim.id}.`);
  return item;
}

const itemLevels = (items: ItemOption[]): Level[] =>
  items.map(i => ({ label: i.variable, apply: c => ({ ...c, item: i.variable, positive: i.strict }) }));
const weightLevels: Level[] = [
  { label: 'gewichtet', apply: c => ({ ...c, weighted: true }) },
  { label: 'ungewichtet', apply: c => ({ ...c, weighted: false }) },
];
const thresholdLevels = (claim: () => Claim, strictLabel: string, wideLabel: string): Level[] => [
  { label: strictLabel, apply: c => ({ ...c, positive: itemOf(claim(), c.item).strict }) },
  { label: wideLabel, apply: c => ({ ...c, positive: itemOf(claim(), c.item).wide }) },
];
const outcomeOf = (c: Choice): Analysis['outcome'] => ({ variable: c.item, positive: c.positive, exclude: c.exclude, missing: c.missing });

const interestItems: ItemOption[] = [
  {
    variable: 'pa02a', title: 'Politisches Interesse',
    question: 'Wie stark interessieren Sie sich für Politik? Sehr stark, stark, mittel, wenig oder überhaupt nicht?',
    categories: scale(1, 5, { 1: 'sehr stark', 2: 'stark', 3: 'mittel', 4: 'wenig', 5: 'überhaupt nicht' }),
    strict: [1, 2], wide: [1, 2, 3], split: false, yes: 'interessiert', no: 'nicht interessiert',
  },
  {
    variable: 'li07', title: 'Wichtigkeit von Politik',
    question: 'Wie wichtig ist Ihnen der Lebensbereich Politik und öffentliches Leben? (1 unwichtig bis 7 sehr wichtig)',
    categories: scale(1, 7, { 1: '1 unwichtig', 7: '7 sehr wichtig' }),
    strict: [6, 7], wide: [5, 6, 7], split: false, yes: 'Politik wichtig', no: 'Politik nicht wichtig',
  },
];

const trustScale = scale(1, 7, { 1: '1 gar kein Vertrauen', 7: '7 großes Vertrauen' });
const trustItems: ItemOption[] = [
  ['pt03', 'Vertrauen in den Bundestag'],
  ['pt12', 'Vertrauen in die Bundesregierung'],
  ['pt15', 'Vertrauen in die Parteien'],
].map(([variable, title]) => ({
  variable, title,
  question: `${title}: 1 gar kein Vertrauen bis 7 großes Vertrauen. Nur einer Hälfte der Befragten gestellt.`,
  categories: trustScale, strict: [6, 7], wide: [5, 6, 7], split: true, yes: 'vertraut', no: 'vertraut nicht',
}));

const distrustItems: ItemOption[] = [
  {
    variable: 'pe01', title: 'Politiker kümmern sich nicht um meine Gedanken',
    question: '„Die Politiker kümmern sich nicht viel darum, was Leute wie ich denken.“ Stimme voll zu bis stimme gar nicht zu.',
    categories: scale(1, 4, { 1: 'stimme voll zu', 2: 'stimme eher zu', 3: 'stimme eher nicht zu', 4: 'stimme gar nicht zu' }),
    strict: [1], wide: [1, 2], split: true, yes: 'misstraut', no: 'übrige',
  },
  {
    variable: 'pa35', title: 'Politiker vertreten nur die Reichen',
    question: '„Politiker vertreten nur die Interessen der Reichen.“ Stimme voll zu bis lehne ganz ab.',
    categories: scale(1, 5, { 1: 'stimme voll zu', 2: 'stimme eher zu', 3: 'teils/teils', 4: 'lehne eher ab', 5: 'lehne ganz ab' }),
    strict: [1], wide: [1, 2], split: true, yes: 'misstraut', no: 'übrige',
  },
];

const ageComparison: Record<string, (cut: number) => Range> = {
  older: cut => [cut + 1, Infinity],
  mid: () => [40, 59],
  senior: () => [60, Infinity],
};
const ageLabel: Record<string, (cut: number) => string> = {
  older: cut => `${cut + 1} und älter`,
  mid: () => '40–59',
  senior: () => '60 und älter',
};

export const jugend: Claim = {
  id: 'jugend',
  quote: 'Die Jungen interessieren sich doch gar nicht mehr für Politik.',
  source: 'Talkshow, Gast (fiktiv)',
  gaps: [
    ['Wer genau?', 'die Jungen = ?'],
    ['Was genau?', 'Interesse = ?'],
    ['Wie viel heißt „gar nicht“?', 'niemand? weniger als die Hälfte?'],
    ['Im Vergleich zu wem?', 'zu den Älteren? zu früher?'],
    ['„Nicht mehr“ – seit wann?', 'Veränderung seit …?'],
  ],
  itemRole: 'outcome',
  itemPrompt: 'Was misst „Interesse“?',
  items: interestItems,
  comparisons: [{ id: 'older', label: 'allen Älteren' }, { id: 'mid', label: '40 bis 59' }, { id: 'senior', label: '60 und älter' }],
  cutRange: [20, 39],
  missingOptions: [
    { id: 'drop', label: 'ausschließen', mode: { mode: 'drop' } },
    { id: 'no', label: 'als „nein“ zählen', mode: { mode: 'allAsNo' } },
  ],
  requiredVariables: ['age', 'pa02a', 'li07', 'wghtpew'],
  defaults: { item: 'pa02a', positive: [1, 2], cut: 29, comparison: 'older', missing: { mode: 'drop' }, exclude: [], weighted: false },
  fixedOutcome: null,
  groupLabels: c => [`18–${c.cut}`, ageLabel[c.comparison](c.cut)],
  outcomeLabels: (_c, item) => [item.yes, item.no],
  rNames: { group: 'altersgruppe', outcome: 'interessiert' },
  analysis: c => ({
    group: { variable: 'age', target: [[18, c.cut]], comparison: [ageComparison[c.comparison](c.cut)] },
    outcome: outcomeOf(c),
    weighted: c.weighted,
  }),
  dimensions: [],
  temporal: true,
  intention: false,
  midpoint: null,
  thirdVariables: 'etwa Bildung, Lebensphase oder Erwerbstätigkeit',
  core: { label: '„Die meisten Jungen interessieren sich nicht“', test: r => r.target < 0.5 },
};
jugend.dimensions = [
  { id: 'item', label: 'Item', levels: itemLevels(interestItems) },
  { id: 'cut', label: 'Altersgrenze', levels: [24, 29, 34].map(cut => ({ label: `bis ${cut}`, apply: (c: Choice) => ({ ...c, cut }) })) },
  { id: 'comparison', label: 'Vergleichsgruppe', levels: jugend.comparisons.map(k => ({ label: k.label, apply: (c: Choice) => ({ ...c, comparison: k.id }) })) },
  { id: 'threshold', label: 'Schwelle für „ja“', levels: thresholdLevels(() => jugend, 'streng', 'weit') },
  { id: 'weighted', label: 'Gewichtung', levels: weightLevels },
];

export const osten: Claim = {
  id: 'osten',
  quote: 'Im Osten vertraut kaum noch jemand dem Bundestag.',
  source: 'Social-Media-Post (fiktiv)',
  gaps: [
    ['Wer genau?', '„der Osten“ = ?'],
    ['Was genau?', 'Vertrauen = ?'],
    ['Wie viel heißt „kaum jemand“?', 'unter 10 %? unter 20 %?'],
    ['Im Vergleich zu wem?', 'zum Westen? zu früher?'],
    ['„Noch“ – seit wann?', 'Veränderung seit …?'],
  ],
  itemRole: 'outcome',
  itemPrompt: 'Was misst „Vertrauen in den Bundestag“?',
  items: trustItems,
  comparisons: [{ id: 'west', label: 'Westen' }],
  cutRange: null,
  missingOptions: [
    { id: 'drop', label: 'ausschließen', mode: { mode: 'drop' } },
    { id: 'no', label: 'als „nein“ zählen', mode: { mode: 'allAsNo' } },
  ],
  requiredVariables: ['eastwest', 'pt03', 'pt12', 'pt15', 'wghtpew'],
  defaults: { item: 'pt03', positive: [5, 6, 7], cut: 0, comparison: 'west', missing: { mode: 'drop' }, exclude: [], weighted: false },
  fixedOutcome: null,
  groupLabels: () => ['Osten', 'Westen'],
  outcomeLabels: (_c, item) => [item.yes, item.no],
  rNames: { group: 'region', outcome: 'vertrauen' },
  analysis: c => ({
    group: { variable: 'eastwest', target: [[2, 2]], comparison: [[1, 1]] },
    outcome: outcomeOf(c),
    weighted: c.weighted,
  }),
  dimensions: [],
  temporal: true,
  intention: false,
  midpoint: 4,
  thirdVariables: 'etwa Alter, Einkommen oder Erfahrungen mit Arbeitslosigkeit',
  core: { label: '„Kaum jemand im Osten vertraut“ (unter 20 %)', test: r => r.target < 0.2 },
};
osten.dimensions = [
  { id: 'item', label: 'Item', levels: itemLevels(trustItems) },
  { id: 'threshold', label: 'Schwelle für „vertraut“', levels: thresholdLevels(() => osten, '6–7', '5–7') },
  {
    id: 'midpoint', label: 'Mittelkategorie 4', levels: [
      { label: 'ausgeschlossen', apply: c => ({ ...c, exclude: [4] }) },
      { label: 'als „vertraut nicht“', apply: c => ({ ...c, exclude: [] }) },
    ],
  },
  { id: 'weighted', label: 'Gewichtung', levels: weightLevels },
];

export const nichtwahl: Claim = {
  id: 'nichtwahl',
  quote: 'Wer Politikern misstraut, geht gar nicht mehr wählen.',
  source: 'Pressemitteilung (fiktiv)',
  gaps: [
    ['Wer genau?', '„wer misstraut“ = ?'],
    ['Was genau?', '„nicht wählen“ = ?'],
    ['Wie viel heißt „gar nicht“?', 'alle? die meisten?'],
    ['Im Vergleich zu wem?', 'zu denen, die vertrauen?'],
    ['„Nicht mehr“ – seit wann?', 'Veränderung seit …?'],
  ],
  itemRole: 'group',
  itemPrompt: 'Was misst „Politikern misstrauen“?',
  items: distrustItems,
  comparisons: [{ id: 'rest', label: 'alle übrigen' }],
  cutRange: null,
  missingOptions: [
    { id: 'drop', label: 'nur „würde nicht wählen“', mode: { mode: 'drop' } },
    { id: 'dk', label: '+ „weiß nicht“', mode: { mode: 'codesAsYes', codes: [-8] } },
    { id: 'dkref', label: '+ „weiß nicht“ + „verweigert“', mode: { mode: 'codesAsYes', codes: [-8, -7] } },
  ],
  requiredVariables: ['pe01', 'pa35', 'pv01', 'wghtpew'],
  defaults: { item: 'pe01', positive: [1], cut: 0, comparison: 'rest', missing: { mode: 'drop' }, exclude: [], weighted: false },
  fixedOutcome: { variable: 'pv01', codes: [1, 2, 3, 4, 6, 42, 90, 91], positive: [91], yes: 'nicht wählen', no: 'wählen' },
  groupLabels: (_c, item) => [item.yes, item.no],
  outcomeLabels: () => ['nicht wählen', 'wählen'],
  rNames: { group: 'misstrauen', outcome: 'nichtwahl' },
  analysis: (c, item) => {
    const rest = item.categories.map(k => k.code).filter(k => !c.positive.includes(k) && !c.exclude.includes(k));
    return {
      group: { variable: c.item, target: toRanges(c.positive), comparison: toRanges(rest) },
      outcome: { variable: 'pv01', positive: [91], exclude: [], missing: c.missing },
      weighted: c.weighted,
    };
  },
  dimensions: [],
  temporal: true,
  intention: true,
  midpoint: null,
  thirdVariables: 'etwa Bildung, politisches Interesse oder Alter',
  core: { label: '„Die meisten Misstrauenden wollen nicht wählen“', test: r => r.target > 0.5 },
};
nichtwahl.dimensions = [
  { id: 'item', label: 'Item', levels: itemLevels(distrustItems) },
  { id: 'threshold', label: 'Schwelle für „misstraut“', levels: thresholdLevels(() => nichtwahl, 'nur voll', 'voll oder eher') },
  { id: 'missing', label: 'Wer zählt als Nichtwahl', levels: nichtwahl.missingOptions.map(o => ({ label: o.label, apply: (c: Choice) => ({ ...c, missing: o.mode }) })) },
  { id: 'weighted', label: 'Gewichtung', levels: weightLevels },
];

export const claims: Claim[] = [jugend, osten, nichtwahl];
export const claimById: Record<Claim['id'], Claim> = { jugend, osten, nichtwahl };
```

- [ ] **Step 4: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/claims.test.ts`
Expected: PASS (4 Tests). Schlägt nur „matches mariposa on the synthetic fixture“ fehl, wurden die Testdateien mit abweichendem R erzeugt: Task 1, Step 2 mit R 4.5 wiederholen.

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/claims.ts src/sandbox/claims.test.ts
git commit -m "Describe the three sandbox claims as data"
```

---

### Task 4: ALLBUS erkennen und Variablen suchen

**Files:**
- Create: `src/sandbox/allbus.ts`
- Test: `src/sandbox/allbus.test.ts`

**Interfaces:**
- Consumes: `SavFile`, `SavVariable`, `isMissingCode` (Task 1); `Claim`, `ItemOption` (Task 3)
- Produces: `ALLBUS_STUDY`, `allbusSource`, `allbusCodebook`, Typ `AllbusCheck`, `validateAllbus(sav)`, `missingVariables(sav, claim)`, `customItem(variable, role)`, `searchVariables(sav, query, role, limit?)`, `resolveItem(claim, sav, variable)`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/allbus.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { customItem, missingVariables, resolveItem, searchVariables, validateAllbus } from './allbus';
import { jugend, nichtwahl } from './claims';
import { fakeSav, fixtureSav } from './testData';

test('accepts ZA8831 and reports its version', () => {
  const check = validateAllbus(fixtureSav());
  assert.deepEqual(check, { ok: true, version: 'v1.3.0, 2025-07-30 (synthetisch)', nCases: 60 });
});

test('rejects other studies with the study number it found', () => {
  const check = validateAllbus(fakeSav({ za_nr: { values: [5270, 5270] } }));
  assert.equal(check.ok, false);
  assert.match(check.ok ? '' : check.message, /Studiennummer 5270/);
  const none = validateAllbus(fakeSav({ x: { values: [1] } }));
  assert.match(none.ok ? '' : none.message, /keine Studiennummer/);
});

test('lists variables a claim needs but the file lacks', () => {
  assert.deepEqual(missingVariables(fixtureSav(), jugend), []);
  assert.deepEqual(missingVariables(fakeSav({ age: { values: [30] } }), jugend), ['pa02a', 'li07', 'wghtpew']);
});

test('turns labelled numeric variables with 2 to 11 valid categories into items', () => {
  const sav = fixtureSav();
  const pa02a = customItem(sav.byName.get('pa02a')!, 'outcome')!;
  assert.deepEqual(pa02a.categories.map(c => c.code), [1, 2, 3, 4, 5]);
  assert.equal(pa02a.categories[0].label, '1 sehr stark');
  assert.deepEqual([pa02a.yes, pa02a.no], ['ja', 'nein']);
  assert.equal(customItem(sav.byName.get('kommentar')!, 'outcome'), null);
  assert.equal(customItem(sav.byName.get('respid')!, 'outcome'), null);
  assert.equal(customItem(sav.byName.get('pe01')!, 'group')!.split, true);
});

test('searches names and labels and resolves claim items before custom ones', () => {
  const sav = fixtureSav();
  assert.deepEqual(searchVariables(sav, 'vertrauen', 'outcome').map(i => i.variable), ['pt03', 'pt12', 'pt15']);
  assert.deepEqual(searchVariables(sav, 'x', 'outcome'), []);
  assert.equal(resolveItem(jugend, sav, 'pa02a'), jugend.items[0]);
  assert.equal(resolveItem(nichtwahl, sav, 'pt03').yes, 'ausgewählt');
  assert.throws(() => resolveItem(jugend, sav, 'kommentar'), /nicht verwendbar/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/allbus.test.ts`
Expected: FAIL, weil `./allbus` nicht existiert.

- [ ] **Step 3: Implementieren**

`src/sandbox/allbus.ts`

```ts
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
```

- [ ] **Step 4: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/allbus.test.ts`
Expected: PASS (5 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/allbus.ts src/sandbox/allbus.test.ts
git commit -m "Validate ZA8831 files and search ALLBUS variables"
```

---

### Task 5: Robustheitsspiegel

**Files:**
- Create: `src/sandbox/multiverse.ts`
- Test: `src/sandbox/multiverse.test.ts`

**Interfaces:**
- Consumes: `analyse` (Task 2); `Claim`, `Choice`, `ItemOption`, `itemOf` (Task 3); `resolveItem` (Task 4, nur im Test)
- Produces: Typen `PathResult`, `DecisionWeight`, `Mirror`; `enumeratePaths(claim)`, `buildMirror(sav, claim, own, ownItem): Mirror`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/multiverse.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveItem } from './allbus';
import { analyse } from './analysis';
import { claims, itemOf, jugend, osten } from './claims';
import { buildMirror, enumeratePaths } from './multiverse';
import { fixtureSav } from './testData';

test('enumerates every combination of levels exactly once', () => {
  assert.deepEqual(claims.map(c => enumeratePaths(c).length), [72, 24, 24]);
  const paths = enumeratePaths(jugend);
  assert.equal(new Set(paths.map(p => p.levels.join('|'))).size, 72);
  assert.deepEqual(paths[0].levels, ['pa02a', 'bis 24', 'allen Älteren', 'streng', 'gewichtet']);
  assert.deepEqual(paths[0].choice.positive, [1, 2]);
  assert.deepEqual(paths[1].choice.weighted, false);
});

test('summarises the mirror and places the own path', () => {
  const sav = fixtureSav();
  const m = buildMirror(sav, osten, osten.defaults, itemOf(osten, 'pt03'));
  assert.equal(m.paths.length, 24);
  assert.equal(m.ownInGrid, true);
  assert.ok(m.sameDirection >= m.atLeastFive);
  assert.ok(m.targetRange[0] <= m.own.target && m.own.target <= m.targetRange[1]);
  assert.deepEqual(m.weights.map(w => w.spread), [...m.weights.map(w => w.spread)].sort((a, b) => b - a));
  assert.deepEqual(new Set(m.weights.map(w => w.id)), new Set(['item', 'threshold', 'midpoint', 'weighted']));
});

test('marks paths outside the prepared grid', () => {
  const sav = fixtureSav();
  const odd = { ...jugend.defaults, cut: 31 };
  assert.equal(buildMirror(sav, jugend, odd, itemOf(jugend, 'pa02a')).ownInGrid, false);
  const custom = resolveItem(jugend, sav, 'pt03');
  assert.equal(buildMirror(sav, jugend, { ...jugend.defaults, item: 'pt03', positive: [7] }, custom).ownInGrid, false);
});

test('every path yields finite shares on the synthetic file', () => {
  const sav = fixtureSav();
  for (const claim of claims) for (const p of enumeratePaths(claim)) {
    const r = analyse(sav, claim.analysis(p.choice, itemOf(claim, p.choice.item)));
    assert.ok(Number.isFinite(r.target) && Number.isFinite(r.comparison), `${claim.id} ${p.levels.join('/')}`);
  }
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/multiverse.test.ts`
Expected: FAIL, weil `./multiverse` nicht existiert.

- [ ] **Step 3: Implementieren**

`src/sandbox/multiverse.ts`

```ts
import { analyse, type AnalysisResult } from './analysis';
import { itemOf, type Choice, type Claim, type ItemOption } from './claims';
import type { SavFile } from './readSav';

export type PathResult = { choice: Choice; levels: string[]; result: AnalysisResult };
export type DecisionWeight = { id: string; label: string; spread: number };
export type Mirror = {
  paths: PathResult[];
  own: AnalysisResult;
  ownInGrid: boolean;
  sameDirection: number;
  atLeastFive: number;
  core: number;
  targetRange: [number, number];
  weights: DecisionWeight[];
};

export function enumeratePaths(claim: Claim): { choice: Choice; levels: string[] }[] {
  let acc = [{ choice: claim.defaults, levels: [] as string[] }];
  for (const dim of claim.dimensions) {
    acc = acc.flatMap(p => dim.levels.map(l => ({ choice: l.apply(p.choice), levels: [...p.levels, l.label] })));
  }
  return acc;
}

export function buildMirror(sav: SavFile, claim: Claim, own: Choice, ownItem: ItemOption): Mirror {
  const paths = enumeratePaths(claim).map(p => ({
    ...p,
    result: analyse(sav, claim.analysis(p.choice, itemOf(claim, p.choice.item))),
  }));
  const ownAnalysis = JSON.stringify(claim.analysis(own, ownItem));
  const ownResult = analyse(sav, claim.analysis(own, ownItem));
  const sign = Math.sign(ownResult.difference);
  const targets = paths.map(p => p.result.target);
  const weights = claim.dimensions.map((dim, d) => {
    const means = dim.levels.map(l => {
      const hit = paths.filter(p => p.levels[d] === l.label);
      return hit.reduce((s, p) => s + p.result.difference, 0) / hit.length;
    });
    return { id: dim.id, label: dim.label, spread: Math.max(...means) - Math.min(...means) };
  }).sort((a, b) => b.spread - a.spread);
  return {
    paths,
    own: ownResult,
    ownInGrid: paths.some(p => JSON.stringify(claim.analysis(p.choice, itemOf(claim, p.choice.item))) === ownAnalysis),
    sameDirection: paths.filter(p => Math.sign(p.result.difference) === sign).length,
    atLeastFive: paths.filter(p => Math.sign(p.result.difference) === sign && Math.abs(p.result.difference) >= 5).length,
    core: paths.filter(p => claim.core.test(p.result)).length,
    targetRange: [Math.min(...targets), Math.max(...targets)],
    weights,
  };
}
```

- [ ] **Step 4: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/multiverse.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/multiverse.ts src/sandbox/multiverse.test.ts
git commit -m "Compute the robustness mirror over all prepared paths"
```

---

### Task 6: R-Generator mit Abgleich gegen mariposa

**Files:**
- Create: `src/sandbox/rcode.ts`, `scripts/export-sandbox-grid.ts`, `scripts/verify-sandbox-r.R`
- Test: `src/sandbox/rcode.test.ts`

**Interfaces:**
- Consumes: `Range` (Task 2); `toRanges`, `Choice`, `Claim`, `ItemOption`, `itemOf`, `claims` (Task 3); `enumeratePaths` (Task 5)
- Produces: Typ `RParts`, `rParts(claim, choice, item, base, file): RParts`, `rScript(claim, choice, item, base, file): string`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/rcode.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { itemOf, jugend, nichtwahl, osten } from './claims';
import { rParts, rScript } from './rcode';

test('writes the default path as tidy mariposa code', () => {
  assert.equal(rScript(jugend, jugend.defaults, itemOf(jugend, 'pa02a'), 'row', 'ZA8831_v1-3-0.sav'), `library(mariposa)
library(dplyr)

allbus <- read_spss("ZA8831_v1-3-0.sav")   # fehlende Angaben werden zu getaggten NAs

allbus <- allbus %>%
  mutate(
    altersgruppe = rec(age, rules = "18:29=1 [18–29]; 30:max=2 [30 und älter]; else=NA"),
    interessiert = rec(pa02a, rules = "1:2=1 [interessiert]; 3:5=0 [nicht interessiert]; else=NA")
  )

allbus %>%
  crosstab(altersgruppe, interessiert, percentages = "row") %>%
  summary()
`);
});

test('translates missing modes, exclusions, weights and base', () => {
  const trust = rParts(osten, { ...osten.defaults, exclude: [4], missing: { mode: 'allAsNo' }, weighted: true }, itemOf(osten, 'pt03'), 'col', 'a.sav');
  assert.match(trust.setup, /vertrauen = rec\(pt03, rules = "NA=0; 5:7=1 \[vertraut\]; 1:3=0 \[vertraut nicht\]; 4=NA; else=NA"\)/);
  assert.match(trust.setup, /region = rec\(eastwest, rules = "2=1 \[Osten\]; 1=2 \[Westen\]; else=NA"\)/);
  assert.match(trust.table, /percentages = "col",\n {11}weights = wghtpew\)/);
  const vote = rParts(nichtwahl, { ...nichtwahl.defaults, missing: { mode: 'codesAsYes', codes: [-8, -7] } }, itemOf(nichtwahl, 'pe01'), 'row', 'a.sav');
  assert.match(vote.setup, /nichtwahl = rec\(untag_na\(pv01\), rules = "-8:-7=1; 91=1 \[nicht wählen\]; 1:4=0 \[wählen\]; 6=0; 42=0; 90=0; else=NA"\)/);
  assert.match(vote.setup, /misstrauen = rec\(pe01, rules = "1=1 \[misstraut\]; 2:4=2 \[übrige\]; else=NA"\)/);
  const mid = rParts(jugend, { ...jugend.defaults, comparison: 'senior', positive: [1, 3] }, itemOf(jugend, 'pa02a'), 'row', 'a.sav');
  assert.match(mid.setup, /"18:29=1 \[18–29\]; 60:max=2 \[60 und älter\]; else=NA"/);
  assert.match(mid.setup, /"1=1 \[interessiert\]; 3=1; 2=0 \[nicht interessiert\]; 4:5=0; else=NA"/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/rcode.test.ts`
Expected: FAIL, weil `./rcode` nicht existiert.

- [ ] **Step 3: Generator implementieren**

`src/sandbox/rcode.ts`

```ts
import type { Range } from './analysis';
import { toRanges, type Choice, type Claim, type ItemOption } from './claims';

const bound = (x: number) => x === Infinity ? 'max' : x === -Infinity ? 'min' : String(x);
const span = ([lo, hi]: Range) => lo === hi ? bound(lo) : `${bound(lo)}:${bound(hi)}`;

type RulePart = { ranges: Range[]; value: string; label?: string };
function rules(parts: RulePart[]): string {
  const out: string[] = [];
  for (const p of parts) p.ranges.forEach((r, i) => out.push(`${span(r)}=${p.value}${i === 0 && p.label ? ` [${p.label}]` : ''}`));
  out.push('else=NA');
  return out.join('; ');
}

export type RParts = { setup: string; table: string };

export function rParts(claim: Claim, choice: Choice, item: ItemOption, base: 'row' | 'col', file: string): RParts {
  const a = claim.analysis(choice, item);
  const [targetLabel, comparisonLabel] = claim.groupLabels(choice, item);
  const [yesLabel, noLabel] = claim.outcomeLabels(choice, item);
  const groupRules = rules([
    { ranges: a.group.target, value: '1', label: targetLabel },
    { ranges: a.group.comparison, value: '2', label: comparisonLabel },
  ]);
  const o = a.outcome;
  const codes = claim.fixedOutcome ? claim.fixedOutcome.codes : item.categories.map(k => k.code);
  const no = codes.filter(k => !o.positive.includes(k) && !o.exclude.includes(k));
  const parts: RulePart[] = [];
  if (o.missing.mode === 'codesAsYes') parts.push({ ranges: toRanges(o.missing.codes), value: '1' });
  parts.push({ ranges: toRanges(o.positive), value: '1', label: yesLabel });
  parts.push({ ranges: toRanges(no), value: '0', label: noLabel });
  parts.push({ ranges: toRanges(o.exclude), value: 'NA' });
  const outcomeRules = (o.missing.mode === 'allAsNo' ? 'NA=0; ' : '') + rules(parts);
  const source = o.missing.mode === 'codesAsYes' ? `untag_na(${o.variable})` : o.variable;
  const setup = [
    'library(mariposa)',
    'library(dplyr)',
    '',
    `allbus <- read_spss("${file}")   # fehlende Angaben werden zu getaggten NAs`,
    '',
    'allbus <- allbus %>%',
    '  mutate(',
    `    ${claim.rNames.group} = rec(${a.group.variable}, rules = "${groupRules}"),`,
    `    ${claim.rNames.outcome} = rec(${source}, rules = "${outcomeRules}")`,
    '  )',
  ].join('\n');
  const weights = a.weighted ? ',\n           weights = wghtpew' : '';
  const table = `allbus %>%\n  crosstab(${claim.rNames.group}, ${claim.rNames.outcome}, percentages = "${base}"${weights})`;
  return { setup, table };
}

export function rScript(claim: Claim, choice: Choice, item: ItemOption, base: 'row' | 'col', file: string): string {
  const { setup, table } = rParts(claim, choice, item, base, file);
  return `${setup}\n\n${table} %>%\n  summary()\n`;
}
```

- [ ] **Step 4: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/rcode.test.ts`
Expected: PASS (2 Tests).

- [ ] **Step 5: Exportskript und R-Abgleich anlegen**

`scripts/export-sandbox-grid.ts`

```ts
// Schreibt alle Spiegel-Wege mit erzeugtem mariposa-Code und Sandbox-Ergebnis als JSON.
// Aufruf: node --import tsx scripts/export-sandbox-grid.ts <datei.sav> <ausgabe.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { analyse } from '../src/sandbox/analysis';
import { claims, itemOf } from '../src/sandbox/claims';
import { enumeratePaths } from '../src/sandbox/multiverse';
import { rParts } from '../src/sandbox/rcode';
import { readSav } from '../src/sandbox/readSav';

const [file, out] = process.argv.slice(2);
if (!file || !out) throw new Error('Aufruf: export-sandbox-grid.ts <datei.sav> <ausgabe.json>');
const bytes = readFileSync(file);
const sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const grid = claims.flatMap(claim => enumeratePaths(claim).map(p => {
  const item = itemOf(claim, p.choice.item);
  const result = analyse(sav, claim.analysis(p.choice, item));
  return { claim: claim.id, levels: p.levels, ...rParts(claim, p.choice, item, 'row', file), target: 100 * result.target, comparison: 100 * result.comparison };
}));
writeFileSync(out, JSON.stringify(grid));
console.log(`${grid.length} Wege nach ${out} geschrieben.`);
```

`scripts/verify-sandbox-r.R`

```r
# Führt die vom Sandbox-Generator erzeugten mariposa-Skripte aus und vergleicht
# die Zeilenprozente mit dem Rechenkern. Aufruf:
#   Rscript --vanilla scripts/verify-sandbox-r.R <grid.json>
suppressMessages({ library(mariposa); library(dplyr); library(jsonlite) })
args <- commandArgs(trailingOnly = TRUE)
grid <- fromJSON(args[1], simplifyDataFrame = FALSE)
cache <- new.env()
cached_read <- function(path) {
  if (is.null(cache[[path]])) cache[[path]] <- mariposa::read_spss(path)
  cache[[path]]
}
failures <- 0
for (entry in grid) {
  env <- new.env()
  env$read_spss <- cached_read
  suppressMessages(eval(parse(text = entry$setup), envir = env))
  ct <- suppressWarnings(eval(parse(text = entry$table), envir = env))
  got <- c(ct$row_pct["1", "1"], ct$row_pct["2", "1"])
  want <- c(entry$target, entry$comparison)
  if (any(abs(got - want) > 0.05)) {
    failures <- failures + 1
    cat("ABWEICHUNG", entry$claim, paste(entry$levels, collapse = " / "), ": R", round(got, 2), "Sandbox", round(want, 2), "\n")
  }
}
cat(length(grid) - failures, "von", length(grid), "Wegen stimmen überein.\n")
if (failures > 0) quit(status = 1)
```

- [ ] **Step 6: Abgleich auf den synthetischen Daten**

Run:
```bash
mkdir -p tmp
node --import tsx scripts/export-sandbox-grid.ts src/sandbox/fixtures/sandbox-fixture.sav tmp/sandbox-grid.json
Rscript --vanilla scripts/verify-sandbox-r.R tmp/sandbox-grid.json
```
Expected: `120 Wege nach tmp/sandbox-grid.json geschrieben.` und `120 von 120 Wegen stimmen überein.`

- [ ] **Step 7: Abgleich auf der echten Datei (lokal)**

Run:
```bash
node --import tsx scripts/export-sandbox-grid.ts "$ALLBUS_SAV" tmp/sandbox-grid-allbus.json
Rscript --vanilla scripts/verify-sandbox-r.R tmp/sandbox-grid-allbus.json
```
Expected: `120 von 120 Wegen stimmen überein.` Hinweis: Die synthetische Datei enthält bewusst keine fehlenden Gewichte. mariposa 0.7.3 bricht bei `crosstab(weights = …)` ab, wenn ein gelabeltes Gewicht ein NA enthält (`R/crosstab.R`, Zeile 158 ff.). Im ALLBUS fehlt kein Gewicht.

- [ ] **Step 8: Commit**

```bash
git add src/sandbox/rcode.ts src/sandbox/rcode.test.ts scripts/export-sandbox-grid.ts scripts/verify-sandbox-r.R
git commit -m "Generate tidy mariposa scripts and verify them against R"
```

---

### Task 7: Gegenfragen

**Files:**
- Create: `src/sandbox/questions.ts`
- Test: `src/sandbox/questions.test.ts`

**Interfaces:**
- Consumes: `analyse`, `columnShare`, `AnalysisResult` (Task 2); `Choice`, `Claim`, `ItemOption` (Task 3); `count`, `num1`, `pct` (Task 2)
- Produces: Typen `Evidence`, `Verdict`, `QuestionContext`, `Question`; `VERDICTS`, `NOT_TESTABLE`, `CAUSAL_WORDS`, `questionsFor(ctx): Question[]`. Regel-IDs: `weight`, `temporal`, `threshold`, `base`, `size`, `causal`, `item`, `missing`, `split`, `intention`, `midpoint`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/questions.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { claims, itemOf, jugend, nichtwahl, osten } from './claims';
import { enumeratePaths } from './multiverse';
import { CAUSAL_WORDS, questionsFor, type Evidence, type QuestionContext } from './questions';
import { fixtureSav } from './testData';

const sav = fixtureSav();
const ctx = (claim: typeof jugend, patch: Partial<QuestionContext> = {}): QuestionContext => ({
  sav, claim, choice: claim.defaults, item: itemOf(claim, claim.defaults.item), evidence: null, verdict: 1, reason: 'Stimmt nur teilweise.', ...patch,
});
const ids = (c: QuestionContext) => questionsFor(c).map(q => q.id);
const colEvidence: Evidence = { row: 0, cell: 'yes', base: 'col' };

test('every one of the eleven rules can be triggered by one of the three claims', () => {
  const seen = new Set<string>();
  for (const claim of claims) for (const p of enumeratePaths(claim)) for (const missing of claim.missingOptions) {
    const choice = { ...p.choice, missing: missing.mode };
    for (const id of ids(ctx(claim, { choice, item: itemOf(claim, choice.item), evidence: colEvidence, reason: 'weil es so ist' }))) seen.add(id);
  }
  assert.deepEqual([...seen].sort(), ['base', 'causal', 'intention', 'item', 'midpoint', 'missing', 'size', 'split', 'temporal', 'threshold', 'weight']);
});

test('rules only fire when their condition holds', () => {
  assert.ok(ids(ctx(jugend)).includes('weight'));
  assert.ok(!ids(ctx(jugend, { choice: { ...jugend.defaults, weighted: true } })).includes('weight'));
  assert.ok(!ids(ctx(jugend, { verdict: 4 })).includes('temporal'));
  assert.ok(!ids(ctx(jugend, { verdict: null })).includes('temporal'));
  assert.ok(!ids(ctx(jugend)).includes('base'));
  assert.ok(ids(ctx(jugend, { evidence: colEvidence })).includes('base'));
  assert.ok(!ids(ctx(jugend)).includes('causal'));
  assert.ok(ids(ctx(nichtwahl)).includes('intention') && !ids(ctx(osten)).includes('intention'));
  assert.ok(ids(ctx(osten)).includes('midpoint'));
  assert.ok(!ids(ctx(osten, { choice: { ...osten.defaults, exclude: [4] } })).includes('midpoint'));
  assert.ok(ids(ctx(osten)).includes('split') && !ids(ctx(jugend)).includes('split'));
  assert.ok(!ids(ctx(jugend)).includes('missing'));
  assert.ok(ids(ctx(jugend, { choice: { ...jugend.defaults, missing: { mode: 'allAsNo' } } })).includes('missing'));
  assert.ok(ids(ctx(nichtwahl)).includes('missing'));
});

test('recognises causal language without false alarms', () => {
  for (const s of ['weil sie enttäuscht sind', 'Das führt dazu', 'Der Grund ist Bildung', 'deshalb', 'verursacht']) assert.ok(CAUSAL_WORDS.test(s), s);
  for (const s of ['Die Grundgesamtheit', 'Ein Drittel vertraut', 'Anteil']) assert.ok(!CAUSAL_WORDS.test(s), s);
});

test('questions quote recomputed numbers', () => {
  const split = questionsFor(ctx(osten, { choice: { ...osten.defaults, missing: { mode: 'allAsNo' } } })).find(q => q.id === 'split')!;
  assert.match(split.text, /Nicht-Gefragten als „nein“/);
  const threshold = questionsFor(ctx(osten)).find(q => q.id === 'threshold')!;
  assert.match(threshold.text, /\d+,\d %/);
  assert.equal(threshold.concept, 'operationalization');
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/questions.test.ts`
Expected: FAIL, weil `./questions` nicht existiert.

- [ ] **Step 3: Regeln implementieren**

`src/sandbox/questions.ts`

```ts
import { analyse, columnShare, type AnalysisResult } from './analysis';
import type { Choice, Claim, ItemOption } from './claims';
import { count, num1, pct } from './format';
import type { SavFile } from './readSav';

export type Evidence = { row: 0 | 1; cell: 'yes' | 'no'; base: 'row' | 'col' };
export type Verdict = 0 | 1 | 2 | 3 | 4;
export const VERDICTS = ['stimmt', 'stimmt teilweise', 'irreführend', 'falsch', 'mit diesen Daten nicht prüfbar'] as const;
export const NOT_TESTABLE: Verdict = 4;

export type QuestionContext = {
  sav: SavFile;
  claim: Claim;
  choice: Choice;
  item: ItemOption;
  evidence: Evidence | null;
  verdict: Verdict | null;
  reason: string;
};
export type Question = { id: string; title: string; text: string; concept?: string };

const points = (x: number) => `${num1(x)} Punkten`;
const sorted = (a: number[]) => JSON.stringify([...a].sort((x, y) => x - y));
const same = (a: number[], b: number[]) => sorted(a) === sorted(b);
export const CAUSAL_WORDS = /\b(weil|deshalb|daher|darum|führt|führen|verursach\w*|liegt an|wegen|Grund|bewirk\w*)\b/i;

export function questionsFor(ctx: QuestionContext): Question[] {
  const { sav, claim, choice, item } = ctx;
  const run = (c: Choice, i: ItemOption = item): AnalysisResult => analyse(sav, claim.analysis(c, i));
  const cur = run(choice);
  const [target] = claim.groupLabels(choice, item);
  const [yes] = claim.outcomeLabels(choice, item);
  const out: Question[] = [];

  if (!choice.weighted) {
    const alt = run({ ...choice, weighted: true });
    const east = sav.byName.get('eastwest');
    const eastShare = east ? Array.from(east.values).filter(x => x === 2).length / sav.nCases : NaN;
    const colBased = ctx.evidence?.base === 'col';
    const now = colBased ? columnShare(cur.table, ctx.evidence!.row, ctx.evidence!.cell) : cur.target;
    const then = colBased ? columnShare(alt.table, ctx.evidence!.row, ctx.evidence!.cell) : alt.target;
    out.push(Math.abs(now - then) < 0.01
      ? { id: 'weight', title: 'Du hast ungewichtet gerechnet.', concept: 'weights',
          text: `Gewichtet ändert sich dein Wert kaum (${pct(then)} statt ${pct(now)}). Warum wirkt das Gewicht hier so wenig – und bei welcher Aussage würde es viel ändern? Tipp: wghtpew gleicht vor allem aus, dass der Osten überproportional befragt wurde.` }
      : { id: 'weight', title: 'Du hast ungewichtet gerechnet.', concept: 'weights',
          text: `Im ALLBUS stammen ${pct(eastShare)} der Befragten aus dem Osten, in der Bevölkerung sind es deutlich weniger. Gewichtet mit wghtpew wären es ${pct(then)} statt ${pct(now)}. Ändert das dein Urteil?` });
  }

  if (claim.temporal && ctx.verdict !== null && ctx.verdict !== 4) {
    out.push({ id: 'temporal', title: 'Die Behauptung spricht von einer Veränderung.',
      text: 'Die Befragung stammt aus 2023 und zeigt einen Zustand. Womit müsstest du vergleichen, um „nicht mehr“ oder „noch“ zu prüfen? Tipp: Die ALLBUS-Kumulation enthält Wellen seit 1980.' });
  }

  if (item.strict.length && item.wide.length) {
    const altCodes = same(choice.positive, item.wide) ? item.strict : item.wide;
    const alt = run({ ...choice, positive: altCodes });
    const labels = item.categories.filter(k => altCodes.includes(k.code)).map(k => k.label).join(', ');
    out.push({ id: 'threshold', title: 'Deine Grenze entscheidet mit.', concept: 'operationalization',
      text: `Zählst du „${labels}“ als „${claim.itemRole === 'outcome' ? yes : target}“, läge der Anteil „${yes}“ in der Gruppe „${target}“ bei ${pct(alt.target)} statt ${pct(cur.target)}, der Abstand bei ${points(alt.difference)} statt ${points(cur.difference)}. Wo ziehst du die Grenze – und warum dort?` });
  }

  if (ctx.evidence && ctx.evidence.base === 'col') {
    out.push({ id: 'base', title: 'Deine Prozentbasis passt nicht zur Behauptung.', concept: 'crosstab',
      text: `Dein Beleg sagt, wie sich eine Antwort auf die Gruppen verteilt (Spaltenprozente). Die Behauptung handelt davon, wie viele in der Gruppe „${target}“ „${yes}“ sind – das sind Zeilenprozente: ${pct(cur.target)}.` });
  }

  const cell = ctx.evidence ? Math.round(cur.table.n[ctx.evidence.row] * (ctx.evidence.cell === 'yes' ? cur.target : 1 - cur.target)) : Infinity;
  if (cur.table.n[0] < 500 || cell < 30) {
    out.push({ id: 'size', title: 'Wie viele Menschen stehen hinter deiner Zahl?', concept: 'sampling',
      text: `Die Gruppe „${target}“ umfasst ${count(cur.table.n[0])} Befragte${Number.isFinite(cell) ? `, deine Belegzelle etwa ${cell}` : ''}. Wie sicher ist eine Aussage über alle in Deutschland auf dieser Grundlage?` });
  }

  if (CAUSAL_WORDS.test(ctx.reason)) {
    out.push({ id: 'causal', title: 'Du nennst eine Ursache.', concept: 'causality',
      text: `Zeigen die Daten, warum sich die Gruppen unterscheiden – oder nur, dass sie es tun? Welche Drittvariable, ${claim.thirdVariables}, könnte beides erklären?` });
  }

  const other = claim.items.find(i => i.variable !== choice.item);
  if (other) {
    const altCodes = item.wide.length && same(choice.positive, item.wide) ? other.wide : other.strict;
    const alt = run({ ...choice, item: other.variable, positive: altCodes, exclude: [] }, other);
    out.push({ id: 'item', title: 'Misst dein Item, was die Behauptung meint?', concept: 'operationalization',
      text: `Mit ${other.variable} („${other.title}“) läge der Abstand bei ${points(alt.difference)} statt ${points(cur.difference)}. Welches Item trifft die Behauptung genauer – und warum?` });
  }

  const codesOption = claim.missingOptions.find(o => o.mode.mode === 'codesAsYes');
  if (choice.missing.mode !== 'drop') {
    const alt = run({ ...choice, missing: { mode: 'drop' } });
    out.push({ id: 'missing', title: 'Du zählst fehlende Angaben mit.', concept: 'missing',
      text: `Ohne sie läge der Anteil „${yes}“ in der Gruppe „${target}“ bei ${pct(alt.target)} statt ${pct(cur.target)}. Was sagt eine fehlende Angabe hier eigentlich aus?` });
  } else if (codesOption) {
    const alt = run({ ...choice, missing: codesOption.mode });
    out.push({ id: 'missing', title: 'Was ist mit „weiß nicht“?', concept: 'missing',
      text: `Du schließt „weiß nicht“ aus. Zählst du es als „${yes}“ (${codesOption.label}), läge der Anteil bei ${pct(alt.target)} statt ${pct(cur.target)}. Was bedeutet „weiß nicht“ bei einer Wahlabsicht?` });
  }

  if (item.split) {
    const v = sav.byName.get(choice.item);
    const asked = v ? Array.from(v.values).filter(x => x !== -11).length / sav.nCases : NaN;
    out.push({ id: 'split', title: 'Nur ein Teil wurde gefragt.', concept: 'random_sampling',
      text: `Diese Frage wurde nur ${pct(asked)} der Befragten gestellt (Fragebogensplit). Was bedeutet das für die Fallzahl – und warum verzerrt es das Ergebnis nicht, wenn die Teilgruppen zufällig gebildet wurden?${choice.missing.mode === 'allAsNo' ? ' Achtung: Du zählst gerade auch alle Nicht-Gefragten als „nein“.' : ''}` });
  }

  if (claim.intention) {
    out.push({ id: 'intention', title: 'Absicht ist nicht Verhalten.', concept: 'measurement_error',
      text: 'Die Daten zeigen eine Wahlabsicht, keine tatsächliche Wahl. Was kann zwischen Befragung und Wahltag passieren – und wie offen antwortet man auf die Frage, ob man wählen geht?' });
  }

  if (claim.midpoint !== null && !choice.exclude.includes(claim.midpoint) && !choice.positive.includes(claim.midpoint)) {
    const alt = run({ ...choice, exclude: [...choice.exclude, claim.midpoint] });
    out.push({ id: 'midpoint', title: 'Die Mitte zählt bei dir als „nein“.', concept: 'ordinal',
      text: `Wer ${claim.midpoint} angibt, liegt genau in der Mitte. Ohne diese Antworten läge der Anteil „${yes}“ in der Gruppe „${target}“ bei ${pct(alt.target)} statt ${pct(cur.target)}. Ist die Mitte Misstrauen?` });
  }

  return out;
}
```

- [ ] **Step 4: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/questions.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/questions.ts src/sandbox/questions.test.ts
git commit -m "Ask critical follow-up questions derived from the analysis path"
```

---

### Task 8: Arbeitsstand, Speicherung und Faktencheck-Karte

**Files:**
- Create: `src/sandbox/state.ts`
- Test: `src/sandbox/state.test.ts`

**Interfaces:**
- Consumes: `columnShare`, `AnalysisResult`, `pct` (Task 2); `claims`, `Choice`, `Claim` (Task 3); `Mirror` (Task 5); `VERDICTS`, `Evidence`, `Verdict` (Task 7)
- Produces: `missionStorageKey = 'statistikatlas.missionen.v1'`, Typen `Step`, `ClaimWork`, `MissionStore`, `MissionStatus`, `TableLabels`; `STEPS`, `initialWork(claim)`, `emptyStore()`, `missionStatus(work)`, `parseStore(raw)`, `stepError(claim, work, categories)`, `evidenceText(labels, result, evidence)`, `factCardMarkdown(claim, work, evidence, mirror)`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/state.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse } from './analysis';
import { itemOf, jugend, nichtwahl, osten } from './claims';
import { buildMirror } from './multiverse';
import { evidenceText, factCardMarkdown, initialWork, missionStatus, parseStore, stepError, type ClaimWork } from './state';
import { fixtureSav } from './testData';

test('restores stored work and rejects malformed values', () => {
  const work: ClaimWork = { ...initialWork(osten), step: 3, reached: 4, verdict: 2, reason: 'Etwa ein Drittel vertraut.', evidence: { row: 0, cell: 'yes', base: 'row' }, answers: { weight: 'Kaum Unterschied.' } };
  const store = { work: { osten: work } };
  assert.deepEqual(parseStore(JSON.stringify(store)), store);
  const broken = parseStore(JSON.stringify({ work: { osten: { step: 9, reached: 1, choice: { cut: 'a', missing: { mode: 'evil' }, weighted: 'yes' }, evidence: { row: 2 }, answers: { a: 1 } } } }));
  assert.deepEqual(broken.work.osten!.choice, osten.defaults);
  assert.equal(broken.work.osten!.step, 0);
  assert.equal(broken.work.osten!.evidence, null);
  assert.deepEqual(broken.work.osten!.answers, {});
  for (const raw of [null, '', '{kaputt', '[]', 'null']) assert.deepEqual(parseStore(raw), { work: {} });
  const cut = parseStore(JSON.stringify({ work: { jugend: { choice: { cut: 55 } } } }));
  assert.equal(cut.work.jugend!.choice.cut, 29);
});

test('reports whether a mission is open, running or done', () => {
  const w = initialWork(jugend);
  assert.equal(missionStatus(undefined), 'open');
  assert.equal(missionStatus(w), 'open');
  assert.equal(missionStatus({ ...w, gaps: ['junge Leute', '', '', '', ''] }), 'running');
  assert.equal(missionStatus({ ...w, step: 2, reached: 2 }), 'running');
  assert.equal(missionStatus({ ...w, step: 3, reached: 4 }), 'done');
});

test('explains what is missing before a step can be left', () => {
  const w = initialWork(jugend);
  assert.match(stepError(jugend, w, []), /drei Lücken/);
  assert.equal(stepError(jugend, { ...w, gaps: ['a', 'b', 'c', '', ''] }, []), '');
  const bench = { ...w, step: 1 as const };
  assert.match(stepError(jugend, { ...bench, choice: { ...w.choice, positive: [] } }, [1, 2, 3, 4, 5]), /mindestens eine Kategorie/);
  assert.match(stepError(jugend, bench, [1, 2, 3, 4, 5]), /Zelle/);
  const all = { ...initialWork(nichtwahl), step: 1 as const, evidence: { row: 0 as const, cell: 'yes' as const, base: 'row' as const }, choice: { ...nichtwahl.defaults, positive: [1, 2, 3, 4] } };
  assert.match(stepError(nichtwahl, all, [1, 2, 3, 4]), /Vergleichsgruppe/);
  assert.match(stepError(jugend, { ...w, step: 2 }, []), /Urteil/);
  assert.match(stepError(jugend, { ...w, step: 2, verdict: 1, reason: 'kurz' }, []), /Satz/);
});

test('phrases evidence by its base and writes a fact card', () => {
  const sav = fixtureSav();
  const item = itemOf(osten, 'pt03');
  const result = analyse(sav, osten.analysis(osten.defaults, item));
  const labels = { groups: osten.groupLabels(osten.defaults, item), outcome: osten.outcomeLabels(osten.defaults, item) };
  assert.equal(evidenceText(labels, result, { row: 0, cell: 'yes', base: 'row' }), '61,5 % in der Gruppe „Osten“: vertraut');
  assert.equal(evidenceText(labels, result, { row: 0, cell: 'yes', base: 'col' }), '66,7 % aller „vertraut“ gehören zur Gruppe „Osten“');
  const work = { ...initialWork(osten), verdict: 3 as const, reason: 'Die Daten zeigen das Gegenteil.', gaps: ['Ostdeutsche', '', '', '', ''] };
  const md = factCardMarkdown(osten, work, 'Beleg X', buildMirror(sav, osten, osten.defaults, item));
  assert.match(md, /\*\*Urteil:\*\* falsch/);
  assert.match(md, /Die Daten zeigen das Gegenteil\./);
  assert.match(md, /- Wer genau\? Ostdeutsche/);
  assert.match(md, /von 24 vertretbaren Auswertungswegen\./);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/state.test.ts`
Expected: FAIL, weil `./state` nicht existiert.

- [ ] **Step 3: Implementieren**

`src/sandbox/state.ts`

```ts
import { columnShare, type AnalysisResult } from './analysis';
import { claims, type Choice, type Claim } from './claims';
import { pct } from './format';
import type { Mirror } from './multiverse';
import { VERDICTS, type Evidence, type Verdict } from './questions';

export const missionStorageKey = 'statistikatlas.missionen.v1';
export type Step = 0 | 1 | 2 | 3 | 4;
export const STEPS = ['Zerlegen', 'Werkbank', 'Urteil', 'Gegenfragen', 'Spiegel'] as const;

export type ClaimWork = {
  step: Step;
  reached: Step;
  gaps: string[];
  choice: Choice;
  base: 'row' | 'col';
  evidence: Evidence | null;
  verdict: Verdict | null;
  reason: string;
  answers: Record<string, string>;
};
export type MissionStore = { work: Partial<Record<Claim['id'], ClaimWork>> };
export type MissionStatus = 'open' | 'running' | 'done';

export const initialWork = (claim: Claim): ClaimWork => ({
  step: 0, reached: 0, gaps: claim.gaps.map(() => ''), choice: structuredClone(claim.defaults),
  base: 'row', evidence: null, verdict: null, reason: '', answers: {},
});
export const emptyStore = (): MissionStore => ({ work: {} });

export function missionStatus(work: ClaimWork | undefined): MissionStatus {
  if (!work) return 'open';
  if (work.reached === 4) return 'done';
  return work.reached > 0 || work.gaps.some(g => g.trim()) ? 'running' : 'open';
}

const isStep = (x: unknown): x is Step => typeof x === 'number' && [0, 1, 2, 3, 4].includes(x);
const isNumArray = (x: unknown): x is number[] => Array.isArray(x) && x.every(n => typeof n === 'number' && Number.isFinite(n));
const text = (x: unknown, max: number) => typeof x === 'string' ? x.slice(0, max) : '';

function parseChoice(claim: Claim, raw: unknown): Choice {
  const d = claim.defaults;
  if (!raw || typeof raw !== 'object') return structuredClone(d);
  const r = raw as Record<string, unknown>;
  const missing = claim.missingOptions.find(o => JSON.stringify(o.mode) === JSON.stringify(r.missing))?.mode ?? d.missing;
  const cutOk = typeof r.cut === 'number' && claim.cutRange !== null && r.cut >= claim.cutRange[0] && r.cut <= claim.cutRange[1];
  return {
    item: typeof r.item === 'string' && /^[a-z0-9_]{1,32}$/i.test(r.item) ? r.item : d.item,
    positive: isNumArray(r.positive) ? r.positive : [...d.positive],
    cut: cutOk ? r.cut as number : d.cut,
    comparison: claim.comparisons.some(k => k.id === r.comparison) ? r.comparison as string : d.comparison,
    missing: structuredClone(missing),
    exclude: isNumArray(r.exclude) ? r.exclude : [...d.exclude],
    weighted: typeof r.weighted === 'boolean' ? r.weighted : d.weighted,
  };
}

function parseEvidence(raw: unknown): Evidence | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if ((r.row !== 0 && r.row !== 1) || (r.cell !== 'yes' && r.cell !== 'no') || (r.base !== 'row' && r.base !== 'col')) return null;
  return { row: r.row, cell: r.cell, base: r.base };
}

export function parseStore(raw: string | null): MissionStore {
  try {
    const input: unknown = JSON.parse(raw || '{}');
    if (!input || typeof input !== 'object' || Array.isArray(input)) return emptyStore();
    const r = input as Record<string, unknown>;
    const store = emptyStore();
    const work = r.work && typeof r.work === 'object' ? r.work as Record<string, unknown> : {};
    for (const claim of claims) {
      const w = work[claim.id];
      if (!w || typeof w !== 'object') continue;
      const x = w as Record<string, unknown>;
      const answers: Record<string, string> = {};
      if (x.answers && typeof x.answers === 'object') {
        for (const [k, v] of Object.entries(x.answers)) if (typeof v === 'string') answers[k] = v.slice(0, 4000);
      }
      const step = isStep(x.step) ? x.step : 0;
      store.work[claim.id] = {
        step,
        reached: isStep(x.reached) && x.reached >= step ? x.reached : step,
        gaps: claim.gaps.map((_, i) => Array.isArray(x.gaps) ? text(x.gaps[i], 300) : ''),
        choice: parseChoice(claim, x.choice),
        base: x.base === 'col' ? 'col' : 'row',
        evidence: parseEvidence(x.evidence),
        verdict: typeof x.verdict === 'number' && [0, 1, 2, 3, 4].includes(x.verdict) ? x.verdict as Verdict : null,
        reason: text(x.reason, 4000),
        answers,
      };
    }
    return store;
  } catch {
    return emptyStore();
  }
}

/** Leerer Text, wenn der Schritt abgeschlossen werden darf; sonst die Meldung für die Studierenden. */
export function stepError(claim: Claim, work: ClaimWork, categories: number[]): string {
  if (work.step === 0 && work.gaps.filter(g => g.trim()).length < 3) return 'Fülle mindestens drei Lücken in eigenen Worten aus, bevor du rechnest.';
  if (work.step === 1) {
    const { positive, exclude } = work.choice;
    if (positive.length === 0) return 'Tippe mindestens eine Kategorie als „ja“ an.';
    if (claim.itemRole === 'group' && categories.every(k => positive.includes(k) || exclude.includes(k))) return 'Lass mindestens eine Kategorie für die Vergleichsgruppe übrig.';
    if (!work.evidence) return 'Tippe in der Tabelle die Zelle an, die deine Aussage belegt.';
  }
  if (work.step === 2 && work.verdict === null) return 'Wähle ein Urteil.';
  if (work.step === 2 && work.reason.trim().length < 20) return 'Begründe dein Urteil in mindestens einem Satz.';
  return '';
}

export type TableLabels = { groups: [string, string]; outcome: [string, string] };

export function evidenceText(labels: TableLabels, result: AnalysisResult, e: Evidence): string {
  const group = labels.groups[e.row];
  const answer = labels.outcome[e.cell === 'yes' ? 0 : 1];
  if (e.base === 'row') {
    const share = e.row === 0 ? result.target : result.comparison;
    return `${pct(e.cell === 'yes' ? share : 1 - share)} in der Gruppe „${group}“: ${answer}`;
  }
  return `${pct(columnShare(result.table, e.row, e.cell))} aller „${answer}“ gehören zur Gruppe „${group}“`;
}

export function factCardMarkdown(claim: Claim, work: ClaimWork, evidence: string, mirror: Mirror): string {
  const answered = Object.values(work.answers).filter(a => a.trim()).length;
  return [
    `# Faktencheck: „${claim.quote}“`,
    '',
    `Quelle: ${claim.source} · Daten: ALLBUScompact 2023 (ZA8831), GESIS`,
    '',
    `**Urteil:** ${work.verdict === null ? '–' : VERDICTS[work.verdict]}`,
    '',
    work.reason.trim() || '(keine Begründung)',
    '',
    `**Beleg:** ${evidence}`,
    '',
    `**Tragfähigkeit:** Die Richtung trägt in ${mirror.sameDirection} von ${mirror.paths.length} vertretbaren Auswertungswegen${mirror.ownInGrid ? '' : ' (dein Weg liegt außerhalb der vorbereiteten Wege)'}.`,
    '',
    '## Zerlegung',
    ...claim.gaps.map(([q], i) => `- ${q} ${work.gaps[i]?.trim() || '–'}`),
    '',
    `Gegenfragen beantwortet: ${answered}`,
    '',
  ].join('\n');
}
```

- [ ] **Step 4: Test erneut laufen lassen**

Run: `node --import tsx --test src/sandbox/state.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/state.ts src/sandbox/state.test.ts
git commit -m "Persist mission work safely and write fact cards"
```

---

### Task 9: Missionsoberfläche

**Files:**
- Create: `src/sandbox/ui/DataDrop.tsx`, `Decompose.tsx`, `LiveTable.tsx`, `Workbench.tsx`, `Verdict.tsx`, `Questions.tsx`, `Mirror.tsx`, `ClaimWorkspace.tsx`; `src/sandbox.css`
- Test: `src/sandbox/workspace.test.ts`

**Interfaces:**
- Consumes: alle Exporte aus Task 1–8; `downloadText` aus `src/domain/mariposa.ts`
- Produces: `ClaimWorkspace({ sav, fileName, claim, work, onChange, onConcept })`, `DataDrop({ onLoaded })`, `loadAllbusFile(file)`, Typ `LoadedData`. Die Missionsoberfläche erwartet einen umgebenden Container mit der Klasse `sandbox`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/sandbox/workspace.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { claims } from './claims';
import { initialWork, type ClaimWork, type Step } from './state';
import { fixtureBuffer, fixtureSav } from './testData';
import { ClaimWorkspace } from './ui/ClaimWorkspace';
import { loadAllbusFile } from './ui/DataDrop';

const sav = fixtureSav();
const renderClaim = (claim: (typeof claims)[number], patch: Partial<ClaimWork>) => renderToStaticMarkup(createElement(ClaimWorkspace, {
  sav, fileName: 'ZA8831_v1-3-0.sav', claim, work: { ...initialWork(claim), ...patch }, onChange: () => {}, onConcept: () => {},
}));

test('loads only ZA8831 .sav files', async () => {
  const file = (name: string, buffer: ArrayBuffer) => ({ name, arrayBuffer: async () => buffer });
  const loaded = await loadAllbusFile(file('allbus.sav', fixtureBuffer()));
  assert.equal(loaded.version, 'v1.3.0, 2025-07-30 (synthetisch)');
  await assert.rejects(loadAllbusFile(file('allbus.csv', fixtureBuffer())), /Endung \.sav/);
});

const expectations: Record<Step, RegExp[]> = {
  0: [/Bevor du rechnest/, /Wer genau\?/],
  1: [/Deine Tabelle, live/, /library\(mariposa\)/, /Andere Variable suchen/],
  2: [/Dein Urteil über die Behauptung/, /mit diesen Daten nicht prüfbar/],
  3: [/kritische Gutachterin/, /Du hast ungewichtet gerechnet\./],
  4: [/Robustheitsspiegel: \d+ vertretbare Auswertungswege/, /Deine Faktencheck-Karte/, /R-Skript/],
};

for (const claim of claims) {
  test(`${claim.id}: every step renders with the synthetic file`, () => {
    for (const step of [0, 1, 2, 3, 4] as Step[]) {
      const html = renderClaim(claim, { step, reached: 4, verdict: 1, reason: 'Stimmt nur zum Teil, siehe Tabelle.', evidence: { row: 0, cell: 'yes', base: 'row' } });
      for (const re of expectations[step]) assert.match(html, re, `${claim.id} Schritt ${step}: ${re}`);
      assert.match(html, new RegExp(claim.quote.replace(/[.?]/g, '\\$&')));
    }
  });
}

test('only reached steps are reachable in the step bar', () => {
  const html = renderClaim(claims[0], { step: 1, reached: 1 });
  assert.equal((html.match(/<button disabled="">\d /g) ?? []).length, 3);
});

test('the workbench shows the evidence sentence and the midpoint switch only where it belongs', () => {
  const east = renderClaim(claims.find(c => c.id === 'osten')!, { step: 1, reached: 1, evidence: { row: 0, cell: 'yes', base: 'row' } });
  assert.match(east, /61,5 % in der Gruppe „Osten“: vertraut/);
  assert.match(east, /Mittelkategorie 4 ausschließen/);
  assert.doesNotMatch(renderClaim(claims[0], { step: 1, reached: 1 }), /Mittelkategorie/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/sandbox/workspace.test.ts`
Expected: FAIL, weil `./ui/ClaimWorkspace` nicht existiert.

- [ ] **Step 3: Datei laden**

`src/sandbox/ui/DataDrop.tsx`

```tsx
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
```

- [ ] **Step 4: Die fünf Schritte**

`src/sandbox/ui/Decompose.tsx`

```tsx
import type { Claim } from '../claims';
import type { ClaimWork } from '../state';

export function Decompose({ claim, work, onChange }: {
  claim: Claim;
  work: ClaimWork;
  onChange: (patch: Partial<ClaimWork>) => void;
}) {
  return <section className="sandbox-card">
    <h3>Bevor du rechnest: Was genau wird hier behauptet?</h3>
    <p className="sandbox-note">Fülle die Lücken in eigenen Worten. Deine Antworten tauchen später in den Gegenfragen und auf deiner Faktencheck-Karte wieder auf.</p>
    {claim.gaps.map(([question, hint], i) => <label key={question} className="sandbox-gap">
      <span>{question}</span>
      <input type="text" value={work.gaps[i]} placeholder={hint}
        onChange={e => onChange({ gaps: work.gaps.map((g, k) => k === i ? e.target.value : g) })} />
    </label>)}
  </section>;
}
```

`src/sandbox/ui/LiveTable.tsx`

```tsx
import { columnShare, type AnalysisResult } from '../analysis';
import { count, num1, pct } from '../format';
import type { Evidence } from '../questions';
import { evidenceText, type TableLabels } from '../state';

const ROWS = [0, 1] as const;
const CELLS = ['yes', 'no'] as const;

export function LiveTable({ result, labels, base, weighted, evidence, onBase, onEvidence }: {
  result: AnalysisResult;
  labels: TableLabels;
  base: 'row' | 'col';
  weighted: boolean;
  evidence: Evidence | null;
  onBase: (base: 'row' | 'col') => void;
  onEvidence: (evidence: Evidence) => void;
}) {
  const shares = [result.target, result.comparison];
  const value = (row: 0 | 1, cell: 'yes' | 'no') => base === 'row'
    ? (cell === 'yes' ? shares[row] : 1 - shares[row])
    : columnShare(result.table, row, cell);
  return <div className="sandbox-live">
    <div className="sandbox-chips" role="group" aria-label="Prozentbasis">
      <button aria-pressed={base === 'row'} onClick={() => onBase('row')}>Zeilenprozente</button>
      <button aria-pressed={base === 'col'} onClick={() => onBase('col')}>Spaltenprozente</button>
    </div>
    <table className="sandbox-table">
      <thead><tr><th scope="col">Gruppe</th><th scope="col">{labels.outcome[0]}</th><th scope="col">{labels.outcome[1]}</th><th scope="col">n</th></tr></thead>
      <tbody>{ROWS.map(row => <tr key={row}>
        <th scope="row">{labels.groups[row]}</th>
        {CELLS.map(cell => {
          const v = value(row, cell);
          const selected = evidence?.row === row && evidence.cell === cell && evidence.base === base;
          return <td key={cell}>
            <button aria-pressed={selected} disabled={!Number.isFinite(v)} onClick={() => onEvidence({ row, cell, base })}
              aria-label={`${pct(v)}, ${labels.groups[row]}, ${labels.outcome[cell === 'yes' ? 0 : 1]}: als Beleg markieren`}>{pct(v)}</button>
          </td>;
        })}
        <td>{count(result.table.n[row])}</td>
      </tr>)}</tbody>
    </table>
    <p className="sandbox-note">
      {base === 'row' ? 'Basis: jede Zeile. Wie viele in jeder Gruppe antworten so?' : 'Basis: jede Spalte. Wie verteilt sich eine Antwort auf die Gruppen?'}
      {weighted ? ' Gewichtet mit wghtpew.' : ' Ungewichtet.'} n = ungewichtete Fallzahl.
    </p>
    <div className="sandbox-metrics">
      <div><span>Abstand {labels.groups[0]} − {labels.groups[1]}</span><strong>{Number.isFinite(result.difference) ? `${num1(result.difference)} Punkte` : '–'}</strong></div>
      <div><span>Dein Beleg</span><strong>{evidence ? evidenceText(labels, result, evidence) : 'Tippe eine Zelle an'}</strong></div>
    </div>
  </div>;
}
```

`src/sandbox/ui/Workbench.tsx`

```tsx
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { searchVariables } from '../allbus';
import type { AnalysisResult } from '../analysis';
import type { Choice, Claim, ItemOption } from '../claims';
import type { SavFile } from '../readSav';
import { rScript } from '../rcode';
import type { ClaimWork, TableLabels } from '../state';
import { LiveTable } from './LiveTable';

const toggle = (list: number[], code: number) => list.includes(code) ? list.filter(x => x !== code) : [...list, code].sort((a, b) => a - b);
const sameMode = (a: Choice['missing'], b: Choice['missing']) => JSON.stringify(a) === JSON.stringify(b);

export function Workbench({ sav, fileName, claim, work, item, result, labels, onChange, onConcept }: {
  sav: SavFile;
  fileName: string;
  claim: Claim;
  work: ClaimWork;
  item: ItemOption;
  result: AnalysisResult;
  labels: TableLabels;
  onChange: (patch: Partial<ClaimWork>) => void;
  onConcept: (id: string) => void;
}) {
  const c = work.choice;
  const [query, setQuery] = useState('');
  const found = useMemo(() => searchVariables(sav, query, claim.itemRole), [sav, query, claim.itemRole]);
  const setChoice = (patch: Partial<Choice>) => onChange({ choice: { ...c, ...patch }, evidence: null });
  const pickItem = (next: ItemOption) => { setChoice({ item: next.variable, positive: next.strict, exclude: [] }); setQuery(''); };
  const custom = !claim.items.some(i => i.variable === c.item);
  const yesName = claim.itemRole === 'outcome' ? labels.outcome[0] : labels.groups[0];

  return <>
    <section className="sandbox-card">
      <h3>1 · {claim.itemPrompt}</h3>
      <div className="sandbox-items">
        {claim.items.map(i => <button key={i.variable} aria-pressed={c.item === i.variable} onClick={() => pickItem(i)}>
          <strong>{i.variable} · {i.title}</strong><span>{i.question}</span>
        </button>)}
        {custom && <button aria-pressed="true"><strong>{item.variable} · {item.title}</strong><span>Selbst gewählte Variable</span></button>}
      </div>
      <label className="sandbox-search">
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">Andere Variable suchen</span>
        <input type="search" value={query} placeholder="Andere Variable suchen, z. B. vertrauen oder pt08" onChange={e => setQuery(e.target.value)} />
      </label>
      {found.length > 0 && <ul className="sandbox-found">{found.map(f => <li key={f.variable}>
        <button onClick={() => pickItem(f)}>{f.variable} · {f.title} <small>{f.categories.length} Kategorien</small></button>
      </li>)}</ul>}
      {query.trim().length >= 2 && found.length === 0 && <p className="sandbox-note">Keine Variable mit 2 bis 11 gelabelten Kategorien gefunden.</p>}
      <button className="sandbox-link" onClick={() => onConcept('operationalization')}>Was heißt Operationalisierung?</button>
    </section>

    <section className="sandbox-card">
      <h3>2 · Wer wird verglichen?</h3>
      {claim.cutRange && <label className="sandbox-slider">
        <span>„Jung“ heißt 18 bis</span>
        <input type="range" min={claim.cutRange[0]} max={claim.cutRange[1]} step={1} value={c.cut} onChange={e => setChoice({ cut: Number(e.target.value) })} />
        <output>{c.cut} Jahre</output>
      </label>}
      {claim.comparisons.length > 1
        ? <div className="sandbox-chips" role="group" aria-label="Vergleichsgruppe">
            <span>verglichen mit</span>
            {claim.comparisons.map(k => <button key={k.id} aria-pressed={c.comparison === k.id} onClick={() => setChoice({ comparison: k.id })}>{k.label}</button>)}
          </div>
        : <p className="sandbox-note">„{labels.groups[0]}“ im Vergleich mit „{labels.groups[1]}“.</p>}
    </section>

    <section className="sandbox-card">
      <h3>3 · Wer zählt als „{yesName}“? Kategorien antippen</h3>
      <div className="sandbox-chips">{item.categories.map(k => <button key={k.code} aria-pressed={c.positive.includes(k.code)} disabled={c.exclude.includes(k.code)} onClick={() => setChoice({ positive: toggle(c.positive, k.code) })}>{k.label}</button>)}</div>
      {claim.midpoint !== null && <button className="sandbox-toggle" aria-pressed={c.exclude.includes(claim.midpoint)}
        onClick={() => {
          const m = claim.midpoint!;
          setChoice(c.exclude.includes(m) ? { exclude: c.exclude.filter(x => x !== m) } : { exclude: [...c.exclude, m], positive: c.positive.filter(x => x !== m) });
        }}>Mittelkategorie {claim.midpoint} ausschließen</button>}
      <h3>4 · {claim.fixedOutcome ? `Wer zählt als „${claim.fixedOutcome.yes}“?` : 'Fehlende Angaben'}</h3>
      <div className="sandbox-chips">{claim.missingOptions.map(o => <button key={o.id} aria-pressed={sameMode(o.mode, c.missing)} onClick={() => setChoice({ missing: o.mode })}>{o.label}</button>)}</div>
      <h3>5 · Gewichtung</h3>
      <div className="sandbox-chips">
        <button aria-pressed={c.weighted} onClick={() => setChoice({ weighted: !c.weighted })}>Mit wghtpew gewichten</button>
        <button className="sandbox-link" onClick={() => onConcept('weights')}>Was macht ein Gewicht?</button>
      </div>
    </section>

    <section className="sandbox-card">
      <h3>6 · Deine Tabelle, live. Tippe die Zelle an, die deine Aussage belegt.</h3>
      <LiveTable result={result} labels={labels} base={work.base} weighted={c.weighted} evidence={work.evidence}
        onBase={base => onChange({ base })} onEvidence={evidence => onChange({ evidence })} />
    </section>

    <section className="sandbox-card">
      <h3>Dein Weg als R-Code</h3>
      <pre className="sandbox-code">{rScript(claim, c, item, work.base, fileName)}</pre>
    </section>
  </>;
}
```

`src/sandbox/ui/Verdict.tsx`

```tsx
import { VERDICTS, type Verdict } from '../questions';
import type { ClaimWork } from '../state';

export function VerdictStep({ work, evidence, onChange }: {
  work: ClaimWork;
  evidence: string;
  onChange: (patch: Partial<ClaimWork>) => void;
}) {
  return <section className="sandbox-card">
    <h3>Dein Urteil über die Behauptung</h3>
    <div className="sandbox-chips" role="radiogroup" aria-label="Urteil">
      {VERDICTS.map((v, i) => <button key={v} role="radio" aria-checked={work.verdict === i} onClick={() => onChange({ verdict: i as Verdict })}>{v}</button>)}
    </div>
    <label className="sandbox-label" htmlFor="sandbox-reason">Begründung für die Faktencheck-Karte</label>
    <textarea id="sandbox-reason" value={work.reason} placeholder="Die Behauptung … denn …" onChange={e => onChange({ reason: e.target.value })} />
    <p className="sandbox-note">Dein Beleg: {evidence}</p>
  </section>;
}
```

`src/sandbox/ui/Questions.tsx`

```tsx
import type { Question } from '../questions';

export function QuestionsStep({ questions, answers, onAnswer, onEdit, onConcept }: {
  questions: Question[];
  answers: Record<string, string>;
  onAnswer: (id: string, text: string) => void;
  onEdit: () => void;
  onConcept: (id: string) => void;
}) {
  return <>
    <p className="sandbox-note">Eine kritische Gutachterin liest deine Analyse. Ihre Fragen entstehen aus deinem Weg – nicht aus einer Musterlösung. Antworten sind freiwillig.</p>
    {questions.map(q => <section key={q.id} className="sandbox-card sandbox-question">
      <h3>{q.title}</h3>
      <p>{q.text}</p>
      <label className="sr-only" htmlFor={`sandbox-answer-${q.id}`}>Deine Antwort auf: {q.title}</label>
      <textarea id={`sandbox-answer-${q.id}`} value={answers[q.id] ?? ''} placeholder="Deine Antwort" onChange={e => onAnswer(q.id, e.target.value)} />
      <div className="sandbox-chips">
        <button onClick={onEdit}>In der Werkbank ändern</button>
        {q.concept && <button className="sandbox-link" onClick={() => onConcept(q.concept!)}>Begriff in der Karte</button>}
      </div>
    </section>)}
  </>;
}
```

`src/sandbox/ui/Mirror.tsx`

```tsx
import { Download } from 'lucide-react';
import { downloadText } from '../../domain/mariposa';
import type { Claim } from '../claims';
import { num1, pct } from '../format';
import type { Mirror } from '../multiverse';
import { VERDICTS } from '../questions';
import { factCardMarkdown, type ClaimWork } from '../state';

const WIDTH = 640, LEFT = 60, RIGHT = 20, ROW = 38, TOP = 34;

export function MirrorStep({ claim, work, mirror, ownVariable, evidence, script }: {
  claim: Claim;
  work: ClaimWork;
  mirror: Mirror;
  ownVariable: string;
  evidence: string;
  script: string;
}) {
  const rows = claim.items.map(i => i.variable);
  if (!rows.includes(ownVariable)) rows.push(ownVariable);
  const diffs = mirror.paths.map(p => p.result.difference);
  const lo = Math.floor(Math.min(...diffs, mirror.own.difference, 0) - 2);
  const hi = Math.ceil(Math.max(...diffs, mirror.own.difference, 0) + 2);
  const x = (v: number) => LEFT + (v - lo) / (hi - lo) * (WIDTH - LEFT - RIGHT);
  const y = (variable: string) => TOP + rows.indexOf(variable) * ROW + ROW / 2;
  const height = TOP + rows.length * ROW + 26;
  const ticks = Array.from({ length: Math.floor(hi / 5) - Math.ceil(lo / 5) + 1 }, (_, i) => (Math.ceil(lo / 5) + i) * 5);
  const total = mirror.paths.length;
  const maxWeight = Math.max(...mirror.weights.map(w => w.spread), 0.1);
  const summary = `Abstand zwischen den Gruppen in ${total} Auswertungswegen, von ${num1(Math.min(...diffs))} bis ${num1(Math.max(...diffs))} Prozentpunkten. Dein Weg: ${num1(mirror.own.difference)} Punkte.`;

  return <>
    <section className="sandbox-card">
      <h3>Robustheitsspiegel: {total} vertretbare Auswertungswege</h3>
      <svg className="sandbox-mirror" viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={summary}>
        <line x1={x(0)} x2={x(0)} y1={TOP - 12} y2={height - 26} className="zero" />
        <text x={x(0)} y={TOP - 18} textAnchor="middle">kein Unterschied</text>
        {rows.map(r => <text key={r} x={0} y={y(r) + 4}>{r}</text>)}
        {mirror.paths.map((p, i) => <circle key={i} cx={x(p.result.difference)} cy={y(p.choice.item) + ((i % 5) - 2) * 4} r={4} className="path">
          <title>{p.levels.join(' · ')}: {num1(p.result.difference)} Punkte</title>
        </circle>)}
        <circle cx={x(mirror.own.difference)} cy={y(ownVariable)} r={9} className="own" />
        <text x={x(mirror.own.difference)} y={y(ownVariable) - 13} textAnchor="middle" className="own-label">dein Weg</text>
        {ticks.map(t => <text key={t} x={x(t)} y={height - 8} textAnchor="middle">{t}</text>)}
      </svg>
      <p className="sandbox-note">Jeder Punkt ist ein Weg aus {claim.dimensions.map(d => d.label).join(' × ')}. Werte: Abstand in Prozentpunkten.{mirror.ownInGrid ? '' : ' Dein Weg liegt außerhalb der vorbereiteten Wege.'}</p>
    </section>

    <div className="sandbox-metrics">
      <div><span>Gleiche Richtung wie dein Ergebnis</span><strong>{mirror.sameDirection} von {total}</strong><small>davon {mirror.atLeastFive} mit mindestens 5 Punkten Abstand</small></div>
      <div><span>{claim.core.label}</span><strong>{mirror.core} von {total}</strong><small>Anteil in der Zielgruppe: {pct(mirror.targetRange[0])} bis {pct(mirror.targetRange[1])}</small></div>
    </div>

    <section className="sandbox-card">
      <h3>Welche Entscheidung wiegt am schwersten?</h3>
      {mirror.weights.map(w => <div key={w.id} className="sandbox-weight">
        <span>{w.label}</span>
        <span className="bar"><span style={{ width: `${w.spread / maxWeight * 100}%` }} /></span>
        <span>{num1(w.spread)} Pkt.</span>
      </div>)}
    </section>

    <section className="sandbox-card sandbox-factcard" aria-label="Deine Faktencheck-Karte">
      <small>Deine Faktencheck-Karte · {claim.source}</small>
      <q>{claim.quote}</q>
      <span className="sandbox-verdict">{work.verdict === null ? '–' : VERDICTS[work.verdict]}</span>
      <p>{work.reason}</p>
      <p className="sandbox-note">Beleg: {evidence} · Richtung trägt in {mirror.sameDirection} von {total} Wegen · {Object.values(work.answers).filter(a => a.trim()).length} Gegenfragen beantwortet</p>
      <div className="sandbox-chips">
        <button onClick={() => downloadText(`faktencheck-${claim.id}.md`, factCardMarkdown(claim, work, evidence, mirror), 'text/markdown;charset=utf-8')}><Download size={15} aria-hidden="true" /> Karte als Markdown</button>
        <button onClick={() => downloadText(`faktencheck-${claim.id}.R`, script)}><Download size={15} aria-hidden="true" /> R-Skript</button>
      </div>
    </section>
  </>;
}
```

- [ ] **Step 5: Arbeitsbereich einer Mission**

`src/sandbox/ui/ClaimWorkspace.tsx`

```tsx
import { ArrowLeft, ArrowRight, Mic } from 'lucide-react';
import { useMemo, useState } from 'react';
import { resolveItem } from '../allbus';
import { analyse } from '../analysis';
import { itemOf, type Choice, type Claim, type ItemOption } from '../claims';
import { buildMirror } from '../multiverse';
import { questionsFor } from '../questions';
import type { SavFile } from '../readSav';
import { rScript } from '../rcode';
import { evidenceText, STEPS, stepError, type ClaimWork, type Step } from '../state';
import { Decompose } from './Decompose';
import { MirrorStep } from './Mirror';
import { QuestionsStep } from './Questions';
import { VerdictStep } from './Verdict';
import { Workbench } from './Workbench';

function usable(claim: Claim, sav: SavFile, choice: Choice): { choice: Choice; item: ItemOption } {
  try {
    return { choice, item: resolveItem(claim, sav, choice.item) };
  } catch {
    return { choice: claim.defaults, item: itemOf(claim, claim.defaults.item) };
  }
}

export function ClaimWorkspace({ sav, fileName, claim, work, onChange, onConcept }: {
  sav: SavFile;
  fileName: string;
  claim: Claim;
  work: ClaimWork;
  onChange: (work: ClaimWork) => void;
  onConcept: (id: string) => void;
}) {
  const [error, setError] = useState('');
  const { choice, item } = usable(claim, sav, work.choice);
  const current = choice === work.choice ? work : { ...work, choice };
  const result = useMemo(() => analyse(sav, claim.analysis(choice, item)), [sav, claim, choice, item]);
  const labels = { groups: claim.groupLabels(choice, item), outcome: claim.outcomeLabels(choice, item) };
  const evidence = current.evidence ? evidenceText(labels, result, current.evidence) : '–';
  const mirror = useMemo(() => current.step === 4 ? buildMirror(sav, claim, choice, item) : null, [current.step, sav, claim, choice, item]);
  const set = (patch: Partial<ClaimWork>) => { setError(''); onChange({ ...current, ...patch }); };

  function go(delta: 1 | -1) {
    const message = delta > 0 ? stepError(claim, current, item.categories.map(k => k.code)) : '';
    setError(message);
    if (message) return;
    const step = Math.min(4, Math.max(0, current.step + delta)) as Step;
    onChange({ ...current, step, reached: Math.max(current.reached, step) as Step });
  }

  return <section className="sandbox-work" aria-labelledby="sandbox-quote">
    <figure className="sandbox-quote">
      <figcaption><Mic size={15} aria-hidden="true" /> {claim.source}</figcaption>
      <blockquote id="sandbox-quote">„{claim.quote}“</blockquote>
    </figure>
    <nav className="sandbox-steps" aria-label="Schritte">
      {STEPS.map((name, i) => <button key={name} aria-current={i === current.step ? 'step' : undefined} disabled={i > current.reached}
        onClick={() => set({ step: i as Step })}>{i + 1} {name}</button>)}
    </nav>
    {current.step === 0 && <Decompose claim={claim} work={current} onChange={set} />}
    {current.step === 1 && <Workbench sav={sav} fileName={fileName} claim={claim} work={current} item={item} result={result} labels={labels} onChange={set} onConcept={onConcept} />}
    {current.step === 2 && <VerdictStep work={current} evidence={evidence} onChange={set} />}
    {current.step === 3 && <QuestionsStep
      questions={questionsFor({ sav, claim, choice, item, evidence: current.evidence, verdict: current.verdict, reason: current.reason })}
      answers={current.answers}
      onAnswer={(id, text) => set({ answers: { ...current.answers, [id]: text } })}
      onEdit={() => set({ step: 1 })}
      onConcept={onConcept} />}
    {mirror && <MirrorStep claim={claim} work={current} mirror={mirror} ownVariable={item.variable}
      evidence={evidence} script={rScript(claim, choice, item, current.base, fileName)} />}
    {error && <p className="sandbox-error" role="alert">{error}</p>}
    <div className="sandbox-nav">
      {current.step > 0 && <button onClick={() => go(-1)}><ArrowLeft size={16} aria-hidden="true" /> Zurück</button>}
      {current.step < 4 && <button className="primary" onClick={() => go(1)}>Weiter <ArrowRight size={16} aria-hidden="true" /></button>}
    </div>
  </section>;
}
```

- [ ] **Step 6: Stile**

`src/sandbox.css`

```css
.sandbox{font:16px/1.6 var(--sans);color:var(--ink)}
.sandbox button{font:14px/1.4 var(--sans);color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:7px 12px;cursor:pointer}
.sandbox button:hover:not(:disabled){background:var(--wash)}
.sandbox button:disabled{opacity:.45;cursor:default}
.sandbox button[aria-pressed=true],.sandbox button[aria-checked=true],.sandbox button[aria-current=step]{border-color:var(--green);background:var(--wash);color:var(--green);font-weight:600}
.sandbox button.primary{background:var(--green);border-color:var(--green);color:#fff}
.sandbox button:focus-visible,.sandbox input:focus-visible,.sandbox textarea:focus-visible{outline:3px solid var(--green);outline-offset:2px}
.sandbox .sandbox-link{border:0;background:none;color:var(--green);text-decoration:underline;text-underline-offset:3px;padding:4px 6px}
.sandbox-card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:18px 22px;margin:0 0 14px}
.sandbox-card h3{font:600 15px/1.4 var(--sans);margin:14px 0 10px}
.sandbox-card h3:first-child{margin-top:0}
.sandbox-note{font-size:14px;color:var(--muted);margin:8px 0}
.sandbox-label{display:block;font-size:14px;color:var(--muted);margin:14px 0 6px}
.sandbox-error{color:var(--red);font-size:14px;margin:8px 0}
.sandbox-warning{background:#fff5e6;border:1px solid #e3c08a;border-radius:8px;padding:10px 14px;font-size:14px}
.sandbox-drop{display:flex;flex-direction:column;align-items:center;gap:6px;border:2px dashed var(--line);border-radius:12px;padding:38px 20px;text-align:center;cursor:pointer;background:#fff}
.sandbox-drop.over,.sandbox-drop:hover{border-color:var(--green);background:var(--wash)}
.sandbox-drop span{font-size:14px;color:var(--muted)}
.sandbox-drop input{font-size:14px;margin-top:8px}
.sandbox-data{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:14px;color:var(--muted)}
.sandbox-quote{margin:0 0 14px;border-left:4px solid var(--red);padding:4px 0 4px 18px}
.sandbox-quote figcaption{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:6px}
.sandbox-quote blockquote{font:24px/1.35 Georgia,serif;margin:6px 0 0}
.sandbox-steps,.sandbox-chips,.sandbox-nav{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 12px}
.sandbox-nav{justify-content:space-between;margin-top:18px}
.sandbox-nav .primary{margin-left:auto}
.sandbox-gap{display:grid;grid-template-columns:220px 1fr;gap:12px;align-items:center;margin:0 0 10px;font-size:14px}
.sandbox input[type=text],.sandbox input[type=search],.sandbox textarea{width:100%;box-sizing:border-box;font:15px/1.5 var(--sans);border:1px solid var(--line);border-radius:6px;padding:8px 10px;background:#fff;color:var(--ink)}
.sandbox textarea{min-height:80px;resize:vertical}
.sandbox-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
.sandbox .sandbox-items button{display:flex;flex-direction:column;gap:4px;text-align:left;padding:10px 12px}
.sandbox-items span{font-size:13px;font-weight:400;color:var(--muted)}
.sandbox-search{display:flex;align-items:center;gap:8px;margin:12px 0 6px}
.sandbox-found{list-style:none;padding:0;margin:0 0 8px;max-height:220px;overflow:auto;border:1px solid var(--line);border-radius:6px}
.sandbox .sandbox-found button{width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);border-radius:0}
.sandbox-found small{color:var(--muted)}
.sandbox-slider{display:flex;align-items:center;gap:12px;font-size:14px;margin:0 0 12px}
.sandbox-slider input{flex:1}
.sandbox-slider output{font-weight:600;min-width:72px}
.sandbox-toggle{margin:4px 0 8px}
.sandbox-table{width:100%;border-collapse:collapse;font-size:15px;table-layout:fixed;margin:4px 0}
.sandbox-table th,.sandbox-table td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;font-weight:400}
.sandbox-table th:first-child{text-align:left}
.sandbox-table td button{width:100%;text-align:right;font-variant-numeric:tabular-nums}
.sandbox-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:12px 0 14px}
.sandbox-metrics>div{background:var(--soft);border-radius:8px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}
.sandbox-metrics span,.sandbox-metrics small{font-size:13px;color:var(--muted)}
.sandbox-metrics strong{font-size:18px}
.sandbox-code{font:12.5px/1.55 ui-monospace,Menlo,monospace;background:var(--soft);border-radius:8px;padding:12px;white-space:pre-wrap;margin:0;overflow-x:auto}
.sandbox-question p{margin:0 0 10px}
.sandbox-mirror{width:100%;height:auto;font:11px var(--sans);fill:var(--muted)}
.sandbox-mirror .zero{stroke:var(--line);stroke-dasharray:4 3}
.sandbox-mirror .path{fill:var(--muted);opacity:.5}
.sandbox-mirror .own{fill:none;stroke:var(--red);stroke-width:2.5}
.sandbox-mirror .own-label{fill:var(--red);font-size:12px}
.sandbox-weight{display:grid;grid-template-columns:200px 1fr 70px;gap:10px;align-items:center;font-size:14px;margin:0 0 6px}
.sandbox-weight .bar{height:10px;background:var(--soft);border-radius:4px;overflow:hidden}
.sandbox-weight .bar span{display:block;height:100%;background:var(--green)}
.sandbox-weight span:last-child{text-align:right}
.sandbox-factcard{border:2px solid var(--green)}
.sandbox-factcard small{font-size:13px;color:var(--muted)}
.sandbox-factcard q{display:block;font:20px/1.4 Georgia,serif;margin:6px 0 10px}
.sandbox-verdict{display:inline-block;background:var(--wash);color:var(--green);border-radius:6px;padding:3px 10px;font-weight:600;font-size:14px}
@media (max-width:700px){.sandbox-gap,.sandbox-weight{grid-template-columns:1fr}.sandbox-quote blockquote{font-size:20px}}
```

- [ ] **Step 7: Tests und Typprüfung**

Run: `node --import tsx --test src/sandbox/workspace.test.ts && npx tsc --noEmit`
Expected: PASS (6 Tests), keine TypeScript-Fehler.

- [ ] **Step 8: Commit**

```bash
git add src/sandbox/ui src/sandbox/workspace.test.ts src/sandbox.css
git commit -m "Build the five-step mission interface"
```

---

### Task 10: Neuer Lernpfad nach Sitzungsplan

**Files:**
- Create: `src/domain/curriculum.ts`
- Replace: `src/components/LearningPath.tsx`, `src/learning-path.css`
- Delete: `src/domain/learningPath.ts`, `src/domain/learningTasks.ts`, `src/domain/learningTasksData.ts`, `src/domain/learningPath.test.ts`, `src/components/LearningTaskCard.tsx`, `src/components/AtlasTaskBridge.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/domain/network.test.ts`
- Test: `src/domain/curriculum.test.ts`

**Interfaces:**
- Consumes: `ClaimWorkspace`, `DataDrop`, `LoadedData` (Task 9); `claimById` (Task 3); `allbusCodebook` (Task 4); `missionStorageKey`, `parseStore`, `emptyStore`, `initialWork`, `missionStatus`, `MissionStore`, `ClaimWork` (Task 8)
- Produces: `sessions: Session[]`, Typen `Session`, `Term`, `Mission`, `workshopUrl`, `setupScript`; `LearningPath({ onConcept, sessionIndex, onSessionChange, initialData?, initialStore? })`. Fokusziel `#learning-heading`, Sprungziel `#learning-main`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`src/domain/curriculum.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPath } from '../components/LearningPath';
import { claimById } from '../sandbox/claims';
import { initialWork, type MissionStore } from '../sandbox/state';
import { fixtureSav } from '../sandbox/testData';
import { conceptById } from './concepts';
import { sessions } from './curriculum';

const data = { sav: fixtureSav(), fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' };
const render = (sessionIndex: number, withData = true, store?: MissionStore) => renderToStaticMarkup(createElement(LearningPath, {
  onConcept: () => {}, sessionIndex, onSessionChange: () => {}, initialData: withData ? data : null, initialStore: store,
}));

test('follows the session plan with ten sessions and three missions', () => {
  assert.deepEqual(sessions.map(s => s.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(sessions.map(s => s.mission), ['setup', null, 'jugend', 'nichtwahl', 'osten', null, null, null, null, null]);
  for (const s of sessions) {
    assert.ok(s.introduced.length > 0, `Sitzung ${s.id}`);
    for (const term of [...s.repetition, ...s.introduced]) if (term.concept) assert.ok(conceptById[term.concept], `${s.id}: ${term.concept}`);
    if (s.mission && s.mission !== 'setup') assert.ok(claimById[s.mission]);
  }
});

test('lists every session with its status and marks missing map terms', () => {
  const store: MissionStore = { work: { jugend: { ...initialWork(claimById.jugend), step: 4, reached: 4 } } };
  const html = render(3, true, store);
  for (const s of sessions) assert.match(html, new RegExp(`<strong>${s.title}<small>`));
  assert.match(html, /Mission abgeschlossen/);
  assert.match(html, /Mission offen/);
  assert.match(html, /Mission folgt/);
  assert.match(html, /<span title="Steht im Sitzungsplan, fehlt der Karte noch">AV und UV<\/span>/);
  assert.match(html, /<button>Kreuztabelle<\/button>/);
});

test('embeds the mission of a session once the file is loaded', () => {
  assert.match(render(3), /Wer Politikern misstraut, geht gar nicht mehr wählen\./);
  assert.match(render(3), /Bevor du rechnest/);
  const withoutData = render(3, false);
  assert.match(withoutData, /Lade dafür zuerst deine Datei/);
  assert.match(withoutData, /ALLBUS-Datei hierher ziehen oder auswählen/);
});

test('shows setup and upcoming sessions without a mission', () => {
  const setup = render(0, false);
  assert.match(setup, /EINRICHTUNG/);
  assert.match(setup, /read_spss\(file\.choose\(\)\)/);
  assert.match(render(0), /Andere Datei laden/);
  const later = render(5);
  assert.match(later, /MISSION FOLGT/);
  assert.match(later, /Mittelwerte vergleichen/);
  assert.match(render(99), /Logistische Regression/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/domain/curriculum.test.ts`
Expected: FAIL, weil `./curriculum` nicht existiert.

- [ ] **Step 3: Sitzungen nach dem Sitzungsplan anlegen**

`src/domain/curriculum.ts`

```ts
import type { Claim } from '../sandbox/claims';

export const workshopUrl = 'https://rloesung.github.io/RWorkshop/';

/** Ein Begriff aus dem Sitzungsplan; ohne `concept` fehlt er der Karte noch. */
export type Term = { label: string; concept?: string };
export type Mission = 'setup' | Claim['id'] | null;
export type Session = {
  id: number;
  plan: string;
  title: string;
  short: string;
  question: string;
  repetition: Term[];
  introduced: Term[];
  mission: Mission;
};

const t = (label: string, concept?: string): Term => ({ label, concept });

// Gliederung nach „Statistik im WiSe 24/25“; die gestrichenen Sitzungen 7–8 (EFA) entfallen.
export const sessions: Session[] = [
  {
    id: 1, plan: 'Sitzungsplan 1', title: 'Einstieg', short: 'R, RStudio, ALLBUS',
    question: 'Wie kommen die Daten auf meinen Rechner?',
    repetition: [],
    introduced: [t('R und RStudio'), t('Daten nach R einlesen', 'data_import'), t('Codebuch & Variablensuche', 'codebook')],
    mission: 'setup',
  },
  {
    id: 2, plan: 'Sitzungsplan 2', title: 'Vom Fragebogen zum Datensatz', short: 'Datenmatrix, Labels',
    question: 'Was steht eigentlich in einer Zeile des ALLBUS?',
    repetition: [t('Datenmatrix'), t('Variable'), t('Fall'), t('Wert'), t('Datenreihe', 'series')],
    introduced: [t('Variablen- & Wertelabels', 'labels'), t('Codebuch & Variablensuche', 'codebook'), t('Datentypen umwandeln', 'conversion')],
    mission: null,
  },
  {
    id: 3, plan: 'Sitzungsplan 3', title: 'Erste Auszählung', short: 'Häufigkeiten, fehlende Werte',
    question: 'Wie viele interessieren sich eigentlich für Politik?',
    repetition: [t('Nominale Kategorien', 'nominal'), t('Geordnete Kategorien', 'ordinal'), t('Metrisches Skalenniveau', 'metric'), t('Arithmetisches Mittel', 'mean'), t('Median', 'median'), t('Standardabweichung', 'sd'), t('Häufigkeiten', 'frequency'), t('Balkendiagramm'), t('Boxplot'), t('Schiefe & Kurtosis', 'shape')],
    introduced: [t('Fehlende Angaben', 'missing'), t('Missing-Codes aufbereiten', 'missing_tools'), t('Fälle auswählen'), t('Deskriptiver Überblick', 'describe')],
    mission: 'jugend',
  },
  {
    id: 4, plan: 'Sitzungsplan 4', title: 'Kreuztabellen', short: 'Prozentbasen, Umkodieren',
    question: 'Gehen Misstrauende nicht mehr wählen?',
    repetition: [t('AV und UV'), t('Kausalität', 'causality'), t('Grundgesamtheit & Parameter', 'population_parameter'), t('Stichprobe & Unabhängigkeit', 'sampling'), t('Chi-Quadrat · Unabhängigkeit', 'chi_square')],
    introduced: [t('Kreuztabelle', 'crosstab'), t('Zeilen-, Spalten-, Zellenprozente'), t('Rekodieren & Umpolen', 'recode'), t('Dummyvariablen', 'dummy'), t('Rechnen innerhalb einer Person', 'row_operations')],
    mission: 'nichtwahl',
  },
  {
    id: 5, plan: 'Sitzungsplan 5', title: 'Gewichtung und Zusammenhang', short: 'Gewichte, Zusammenhangsmaße',
    question: 'Vertraut der Osten dem Bundestag weniger?',
    repetition: [],
    introduced: [t('Gewichte', 'weights'), t('Drittvariable'), t('Confounding · gemeinsame Ursachen', 'confounding'), t('Phi', 'phi'), t('Cramér-V', 'cramers_v'), t('Goodman–Kruskal-Gamma', 'goodman_gamma'), t('Kendall Tau-b', 'kendall_tau'), t('Spearman-Korrelation', 'spearman'), t('Pearson-Korrelation', 'pearson')],
    mission: 'osten',
  },
  {
    id: 6, plan: 'Sitzungsplan 6', title: 'Mittelwerte vergleichen', short: 't-Test, ANOVA',
    question: 'Unterscheiden sich Gruppen im Mittel?',
    repetition: [t('Normalverteilung', 'normal_distribution')],
    introduced: [t('t-Test', 't_test'), t('Einfaktorielle ANOVA', 'oneway_anova'), t('Korrelationsmatrix', 'correlation_matrix')],
    mission: null,
  },
  {
    id: 7, plan: 'Sitzungsplan 9', title: 'Index und Skala', short: 'Reliabilität, Cronbachs α',
    question: 'Wie misst man Populismus mit mehreren Fragen?',
    repetition: [t('Validität', 'validity'), t('Messfehler', 'measurement_error')],
    introduced: [t('Mittelwertindex', 'row_operations'), t('Skalenwert pro Person', 'item_score'), t('Kombinationsindex'), t('Reliabilität · Alpha & Omega', 'reliability')],
    mission: null,
  },
  {
    id: 8, plan: 'Sitzungsplan 10', title: 'Lineare Regression', short: 'Modell, Residuen, R²',
    question: 'Was sagt eine Gerade über politische Einstellungen?',
    repetition: [],
    introduced: [t('Lineare Regression', 'linear_regression'), t('Linearer Prädiktor', 'prediction'), t('Residuen & kleinste Quadrate', 'residuals'), t('Erklärter Varianzanteil · R²', 'explained_variance'), t('Gleiche Fehlervarianz', 'variance_assumption')],
    mission: null,
  },
  {
    id: 9, plan: 'Sitzungsplan 11', title: 'Regression vertiefen', short: 'mehrere Prädiktoren',
    question: 'Was bleibt, wenn man mehr berücksichtigt?',
    repetition: [],
    introduced: [t('Dummyvariablen', 'dummy'), t('Multikollinearität', 'multicollinearity'), t('Ausreißer & Einfluss', 'outliers_influence'), t('Interaktion', 'interaction'), t('Confounding · gemeinsame Ursachen', 'confounding')],
    mission: null,
  },
  {
    id: 10, plan: 'Sitzungsplan 12', title: 'Logistische Regression', short: 'Odds, Logit',
    question: 'Wer geht wählen – und wie wahrscheinlich?',
    repetition: [],
    introduced: [t('Wahrscheinlichkeit, Odds & Logit', 'logit'), t('Logistische Regression', 'logistic_regression'), t('Likelihood', 'likelihood'), t('Marginale Effekte', 'marginal_effects')],
    mission: null,
  },
];

export const setupScript = `library(mariposa)

# ZA8831_v1-3-0.sav auswählen (nach Registrierung bei GESIS beziehen)
allbus <- read_spss(file.choose())

# Fragetexte und Kategorien der Variablen aus den Missionen
summary(codebook(allbus, pa02a, pv01, eastwest, view = FALSE))
find_var(allbus, "VERTRAUEN")
`;
```

- [ ] **Step 4: Lernpfad neu schreiben (ersetzt die Datei vollständig)**

`src/components/LearningPath.tsx`

```tsx
import { ArrowLeft, ArrowRight, BookOpen, Check, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessions, setupScript, workshopUrl, type Session, type Term } from '../domain/curriculum';
import { allbusCodebook } from '../sandbox/allbus';
import { claimById } from '../sandbox/claims';
import { emptyStore, initialWork, missionStatus, missionStorageKey, parseStore, type ClaimWork, type MissionStore } from '../sandbox/state';
import { ClaimWorkspace } from '../sandbox/ui/ClaimWorkspace';
import { DataDrop, type LoadedData } from '../sandbox/ui/DataDrop';

const STORAGE_WARNING = 'Dein Browser erlaubt keine lokale Speicherung. Deine Arbeit bleibt nur erhalten, solange dieser Tab offen ist.';
const STATUS_TEXT = { open: 'Mission offen', running: 'Mission läuft', done: 'Mission abgeschlossen' } as const;

function readStore(): { store: MissionStore; warning: string } {
  if (typeof localStorage === 'undefined') return { store: emptyStore(), warning: '' };
  try {
    return { store: parseStore(localStorage.getItem(missionStorageKey)), warning: '' };
  } catch {
    return { store: emptyStore(), warning: STORAGE_WARNING };
  }
}

function sessionStatus(session: Session, store: MissionStore, data: LoadedData | null): string {
  if (session.mission === 'setup') return data ? 'ALLBUS geladen' : 'Einrichtung';
  if (!session.mission) return 'Mission folgt';
  return STATUS_TEXT[missionStatus(store.work[session.mission])];
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

export function LearningPath({ onConcept, sessionIndex = 0, onSessionChange, initialData = null, initialStore }: {
  onConcept: (id: string) => void;
  sessionIndex?: number;
  onSessionChange: (index: number) => void;
  initialData?: LoadedData | null;
  initialStore?: MissionStore;
}) {
  const [data, setData] = useState<LoadedData | null>(initialData);
  const [{ store: loaded, warning: loadWarning }] = useState(readStore);
  const [store, setStore] = useState<MissionStore>(initialStore ?? loaded);
  const [warning, setWarning] = useState(loadWarning);
  const index = Math.min(Math.max(sessionIndex, 0), sessions.length - 1);
  const session = sessions[index];

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(missionStorageKey, JSON.stringify(store));
    } catch {
      setWarning(STORAGE_WARNING);
    }
  }, [store]);

  const choose = (next: number) => {
    onSessionChange(next);
    requestAnimationFrame(() => document.getElementById('learning-heading')?.focus({ preventScroll: true }));
    document.getElementById('learning-main')?.scrollTo({ top: 0 });
  };
  const claim = session.mission && session.mission !== 'setup' ? claimById[session.mission] : null;
  const work = claim ? store.work[claim.id] ?? initialWork(claim) : null;
  const updateWork = (next: ClaimWork) => { if (claim) setStore(s => ({ ...s, work: { ...s.work, [claim.id]: next } })); };
  const dataLine = data ? `ALLBUScompact 2023 · ${data.version || 'Version unbekannt'} · ${data.sav.nCases.toLocaleString('de-DE')} Befragte` : 'ALLBUS noch nicht geladen';

  return <main className="learning-path" id="learning-main">
    <aside className="learning-rail">
      <a className="learning-brand" href="#learning-main">Statistikatlas<span>.</span></a>
      <span className="learning-eyebrow">LERNPFAD · STATISTIK IB</span>
      <h1>Statistik als Entscheidungshilfe</h1>
      <p>Zehn Sitzungen nach dem Sitzungsplan. In den Missionen prüfst du öffentliche Behauptungen mit dem echten ALLBUS – und entscheidest selbst, was die Daten tragen.</p>
      <p className="learning-data-status">{dataLine}</p>
      <nav aria-label="Sitzungen"><ol>
        {sessions.map((s, i) => {
          const status = sessionStatus(s, store, data);
          return <li key={s.id} className={`${i === index ? 'current' : ''}${status === STATUS_TEXT.done ? ' done' : ''}`}>
            <button aria-current={i === index ? 'page' : undefined} onClick={() => choose(i)}>
              <span>{s.id}</span><strong>{s.title}<small>{status}</small></strong>
              {status === STATUS_TEXT.done && <Check size={16} aria-hidden="true" />}
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

      <section className="sandbox learning-mission" aria-label="Mission">
        {session.mission === 'setup' && <>
          <span className="learning-eyebrow">EINRICHTUNG</span>
          <p>Bezieh den ALLBUScompact 2023 bei GESIS, öffne ihn in R mit mariposa – und zieh dieselbe Datei hier in den Lernpfad. Sie gilt dann für alle Missionen.</p>
          {data
            ? <p className="sandbox-data">{dataLine} · {data.fileName} <button className="sandbox-link" onClick={() => setData(null)}>Andere Datei laden</button></p>
            : <DataDrop onLoaded={setData} />}
          <span className="learning-eyebrow">IN R</span>
          <pre className="sandbox-code">{setupScript}</pre>
          <p className="sandbox-note"><a href={allbusCodebook} target="_blank" rel="noreferrer">Codebuch ZA8831 <ExternalLink size={13} aria-hidden="true" /></a></p>
        </>}
        {claim && work && (data
          ? <>
              <span className="learning-eyebrow">MISSION · BELEGE ES!</span>
              <ClaimWorkspace key={claim.id} sav={data.sav} fileName={data.fileName} claim={claim} work={work} onChange={updateWork} onConcept={onConcept} />
            </>
          : <>
              <span className="learning-eyebrow">MISSION · BELEGE ES!</span>
              <p>In dieser Mission prüfst du die Behauptung „{claim.quote}“ mit dem echten ALLBUS. Lade dafür zuerst deine Datei.</p>
              <DataDrop onLoaded={setData} />
            </>)}
        {!session.mission && <div className="learning-mission-soon">
          <span className="learning-eyebrow">MISSION FOLGT</span>
          <p>Für diese Sitzung entsteht eine eigene Mission mit echten ALLBUS-Daten. Bis dahin: Begriffe oben in der Karte erkunden und im Seminar in R arbeiten.</p>
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

- [ ] **Step 5: Stile des Lernpfads ersetzen**

`src/learning-path.css` vollständig ersetzen. Übernommen sind Rahmen, Reiter, Sitzungsleiste, Kopf und Blätterleiste; ergänzt sind Begriffe und Missionsbereich.

`src/learning-path.css`

```css
.atlas-shell{height:100dvh;display:flex;flex-direction:column;overflow:hidden;background:var(--paper)}
.workspace-switcher{display:flex;align-items:center;gap:26px;padding:0 28px;min-height:62px;flex-shrink:0;border-top:4px solid var(--red);border-bottom:1px solid var(--line);background:var(--paper)}
.workspace-tabs{display:flex;gap:8px;align-self:stretch}
.workspace-tabs button{display:flex;align-items:center;gap:9px;background:none;border:0;border-bottom:3px solid transparent;padding:12px 16px;font:500 16px/1.4 var(--sans);color:var(--muted)}
.workspace-tabs button[aria-selected=true]{border-bottom-color:var(--green);color:var(--green)}
.workspace-switcher>span{margin-left:auto;font:14px var(--sans);color:var(--muted)}
.atlas-panel{flex:1;min-height:0;overflow:hidden}
.atlas-panel[hidden]{display:none}
.atlas-panel>.network-app{height:100%;border-top:0}
.learning-path{height:100%;overflow:auto;display:grid;grid-template-columns:310px minmax(0,850px);justify-content:center;gap:60px;padding:38px 48px 70px;scroll-behavior:smooth}
.learning-rail{border-right:1px solid var(--line);padding-right:34px;min-width:0}
.learning-brand{font:30px Georgia,serif;text-decoration:none;color:var(--ink)}
.learning-brand span{color:var(--red)}
.learning-eyebrow{display:block;font:600 12px/1.5 var(--sans);letter-spacing:1.4px;color:var(--green);margin:30px 0 10px}
.learning-rail h1{font:30px/1.15 Georgia,serif;letter-spacing:-.5px;margin:0}
.learning-rail>p:not(.learning-eyebrow){font:14px/1.6 var(--sans);color:var(--muted);margin:15px 0 27px}
.learning-rail ol{list-style:none;margin:0;padding:0}
.learning-rail li{display:flex;gap:13px;align-items:flex-start;padding:12px 0;font:14px/1.5 var(--sans);border-bottom:1px solid #d5d7ce}
.learning-rail li>span{color:var(--muted);font-variant-numeric:tabular-nums}
.learning-rail li strong{font-weight:400}
.learning-rail li.current{color:var(--green)}
.learning-rail li.current strong{font-weight:650}
.learning-source{display:flex;align-items:center;gap:8px;font:14px var(--sans);color:var(--green);margin-top:27px;text-underline-offset:4px}
.learning-lesson{min-width:0;padding:8px 0 24px}
.learning-meta{display:flex;gap:16px;font:14px var(--sans);color:var(--muted);margin-bottom:22px}
.learning-meta>span:first-child{color:var(--green)}
.learning-lesson h2{font:clamp(30px,3.1vw,44px)/1.15 Georgia,serif;letter-spacing:-.7px;margin:0 0 18px;max-width:740px}
.learning-lead{font:19px/1.65 Georgia,serif;max-width:700px;margin:0 0 30px}
.learning-lesson h3{font:25px/1.3 Georgia,serif;margin:8px 0 16px}
.map-learning-return{border:0;background:none;color:var(--green);font:14px var(--sans);display:flex;align-items:center;gap:6px;margin-left:auto}
.atlas-shell button:focus-visible,.atlas-shell a:focus-visible{outline:3px solid #a34f15;outline-offset:3px}
.learning-path button{cursor:pointer}
@media(max-width:1050px){.learning-path{grid-template-columns:250px minmax(0,1fr);gap:30px;padding:28px}
.learning-rail{padding-right:25px}
.learning-rail h1{font-size:26px}
.workspace-switcher>span{display:none}
}
@media(max-width:720px){.workspace-switcher{padding:0 10px;min-height:60px;gap:8px;flex-wrap:wrap}
.workspace-tabs button{font-size:15px;padding:12px}
.learning-path{display:block;padding:22px}
.learning-rail{border:0;padding:0}
.learning-brand{font-size:26px}
.learning-rail h1{font-size:27px}
.learning-rail ol{display:flex;gap:8px;overflow:auto;padding:6px 0 15px}
.learning-rail li{min-width:155px;border:1px solid var(--line);padding:12px;border-radius:5px}
.learning-rail li>span{font-size:13px}
.learning-source{margin:8px 0 22px}
.learning-lesson{padding-top:24px}
.learning-lesson h2{font-size:32px}
.learning-lead{font-size:18px}
.map-learning-return{margin:0 0 9px 12px}
.workspace-switcher:has(.map-learning-return){min-height:84px}
}
@media(prefers-reduced-motion:reduce){.learning-path{scroll-behavior:auto}
}
.learning-rail nav ol li{padding:0;border:0}
.learning-rail nav li>button{width:100%;display:flex;align-items:flex-start;gap:12px;text-align:left;padding:11px 10px;border:0;border-bottom:1px solid #d5d7ce;background:none;font:14px/1.5 var(--sans);color:var(--muted)}
.learning-rail nav li>button>span{flex-shrink:0;min-width:21px;font-variant-numeric:tabular-nums}
.learning-rail nav li>button>strong{font-weight:400}
.learning-rail nav li>button>svg{margin-left:auto;flex-shrink:0;margin-top:3px}
.learning-rail nav li.current>button{background:#e7eee4;border-bottom-color:#acbfa6;border-radius:4px;color:var(--green)}
.learning-rail nav li.current strong{font-weight:600}
.learning-rail nav li>button:hover{background:#eef0e8;color:var(--green)}
.learning-meta{flex-wrap:wrap}
.learning-meta>span{display:flex;align-items:center;gap:5px}
.learning-pagination{display:flex;justify-content:space-between;gap:15px;margin-top:35px;padding-top:25px;border-top:1px solid var(--line)}
.learning-pagination button{display:flex;align-items:center;gap:8px;border:1px solid var(--green);border-radius:5px;padding:12px 16px;background:none;font:15px/1.5 var(--sans);color:var(--green);text-align:left}
.learning-pagination button:last-child{background:var(--green);color:white}
.learning-pagination button:disabled{opacity:.4;cursor:default;border-color:var(--line)}
.learning-lesson h2:focus{outline:none}
@media(min-width:1200px){.learning-rail{position:sticky;top:0;align-self:start}
}
@media(max-width:720px){.learning-rail nav li>button{min-width:168px;height:100%;padding:11px;border:1px solid var(--line);border-radius:5px}
.learning-rail nav li>button>svg{display:none}
.learning-meta{font-size:13px;gap:10px}
.learning-pagination{flex-wrap:wrap}
.learning-pagination button{flex:1;justify-content:center}
}
.atlas-map-panel{display:flex;flex-direction:column}
.atlas-map-panel>.network-app{flex:1;min-height:0;height:auto}
.atlas-shell summary:focus-visible{outline:3px solid #a34f15;outline-offset:3px}
.learning-rail nav li>button>strong small{display:block;font-size:12px;font-weight:400;color:var(--muted)}
.learning-rail nav li.done>button>strong small{color:var(--green)}
.learning-rail nav li>button>svg{color:var(--green)}
.learning-data-status{font:13px/1.5 var(--sans);color:var(--muted);margin:-12px 0 18px}
.learning-terms{border-top:1px solid var(--line);padding-top:6px;margin:0 0 30px}
.learning-terms .learning-eyebrow{margin:18px 0 10px}
.learning-term-list{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0}
.learning-term-list button,.learning-term-list span{display:inline-block;font:14px/1.4 var(--sans);border-radius:6px;padding:6px 11px}
.learning-term-list button{border:1px solid var(--line);background:#fff;color:var(--green)}
.learning-term-list button:hover{background:var(--wash)}
.learning-term-list span{border:1px dashed var(--line);color:var(--muted)}
.learning-term-note{font:13px/1.5 var(--sans);color:var(--muted);margin:12px 0 0}
.learning-mission{border-top:1px solid var(--line);padding-top:6px}
.learning-mission>p{font:16px/1.6 var(--sans);max-width:720px}
.learning-mission-soon{border:1px dashed var(--line);border-radius:10px;padding:4px 22px 12px;font:15px/1.6 var(--sans);color:var(--muted);margin-top:18px}
```

- [ ] **Step 6: Alten Lernpfad entfernen**

```bash
git rm src/domain/learningPath.ts src/domain/learningTasks.ts src/domain/learningTasksData.ts src/domain/learningPath.test.ts src/components/LearningTaskCard.tsx src/components/AtlasTaskBridge.tsx
```

- [ ] **Step 7: `App.tsx` anpassen**

Jede Ersetzung trifft genau eine Stelle. Leere Ersetzungen entfernen den Text.

1. Ersetze

```tsx
import {AtlasTaskBridge} from './components/AtlasTaskBridge';
import {type AtlasTaskContext} from './domain/learningTasks';
```

   durch

*(nichts – Text entfernen)*

2. Ersetze

```tsx
conceptRequest:{id:string;sequence:number;taskContext:AtlasTaskContext|null}|null;visible
```

   durch

```tsx
conceptRequest:{id:string;sequence:number}|null;visible
```

3. Ersetze

```tsx
useState<{id:string;sequence:number;taskContext:AtlasTaskContext|null}|null>(null);
```

   durch

```tsx
useState<{id:string;sequence:number}|null>(null);
```

4. Ersetze

```tsx
 const [returnRequest,setReturnRequest]=useState<{context:AtlasTaskContext;sequence:number}|null>(null);
 const taskContext=conceptRequest?.taskContext||null;
```

   durch

*(nichts – Text entfernen)*

5. Ersetze

```tsx
function showConcept(id:string,context?:AtlasTaskContext){setConceptRequest(r=>({id,sequence:(r?.sequence||0)+1,taskContext:context||null}));changeTab('map');}
```

   durch

```tsx
function showConcept(id:string){setConceptRequest(r=>({id,sequence:(r?.sequence||0)+1}));changeTab('map');}
```

6. Ersetze

```tsx
function returnToLearning(){if(taskContext){setSessionIndex(taskContext.sessionId-1);setReturnRequest(r=>({context:taskContext,sequence:(r?.sequence||0)+1}));changeTab('learn');}else changeTab('learn',true);}
```

   durch

```tsx
function returnToLearning(){changeTab('learn',true);}
```

7. Ersetze

```tsx
{taskContext?'Zurück zur Aufgabe':`Zurück zu Sitzung ${sessionIndex+1}`}
```

   durch

```tsx
{`Zurück zu Sitzung ${sessionIndex+1}`}
```

8. Ersetze

```tsx
{taskContext&&<AtlasTaskBridge context={taskContext} onConcept={showConcept} onReturn={returnToLearning}/>}
```

   durch

*(nichts – Text entfernen)*

9. Ersetze

```tsx
<LearningPath onConcept={showConcept} sessionIndex={sessionIndex} onSessionChange={setSessionIndex} returnRequest={returnRequest}/>
```

   durch

```tsx
<LearningPath onConcept={showConcept} sessionIndex={sessionIndex} onSessionChange={setSessionIndex}/>
```

In `src/main.tsx` nach `import './learning-path.css';` einfügen:

```ts
import './sandbox.css';
```

- [ ] **Step 8: Starttest an den neuen Lernpfad anpassen**

In `src/domain/network.test.ts`:

1. Ersetze

```tsx
test('the initial surface starts on the political learning path with a separate map tool',()=>{
```

   durch

```tsx
test('the initial surface starts on the learning path with a separate map tool',()=>{
```

2. Ersetze

```tsx
assert.match(html,/Politik mit Daten verstehen/);assert.match(html,/ALLBUScompact 2023/);
```

   durch

```tsx
assert.match(html,/Statistik als Entscheidungshilfe/);assert.match(html,/ALLBUScompact 2023/);
```

3. Ersetze

```tsx
assert.match(html,/Ergebnisse erklären/);
```

   durch

```tsx
assert.match(html,/Logistische Regression/);
```

- [ ] **Step 9: Gesamte Suite, Build, keine Testdaten im Build**

Run: `pnpm test && pnpm build && grep -c "2025-07-30\|sandbox-fixture\|DEIN ARBEITSHEFT" dist/assets/*.js`
Expected: 125 Tests, davon 124 PASS und 1 übersprungen (Echtdaten); Build mit `dist/Statistikatlas-offline.html`; `0`.

- [ ] **Step 10: Browserprüfung mit der echten Datei**

Run: `pnpm dev`, dann `http://127.0.0.1:5173/` öffnen und prüfen:
1. Start in Sitzung 1 „Einstieg“; die Leiste zeigt zehn Sitzungen, 3–5 „Mission offen“, die übrigen „Mission folgt“.
2. `ZA8831_v1-3-0.sav` laden → Leiste „ALLBUScompact 2023 · v1.3.0, 2025-07-30 · 5.246 Befragte“, Sitzung 1 „ALLBUS geladen“.
3. Sitzung 4: gestrichelte Begriffe „AV und UV“ und „Zeilen-, Spalten-, Zellenprozente“ sind nicht anklickbar; „Kreuztabelle“ öffnet die Karte.
4. Mission „Wer Politikern misstraut …“: ohne Lücken „Weiter“ → Hinweis; drei Lücken → Werkbank 8,8 % gegenüber 3,7 % (n 833 / 1.952); Leiste „Mission läuft“.
5. „+ „weiß nicht““, Spaltenprozente, Zelle „misstraut / nicht wählen“ → Beleg 41,5 %, R-Code mit `untag_na(pv01)` und `percentages = "col"`.
6. Begriff „Kreuztabelle“ → Karte, „Zurück zu Sitzung 4“ → gleiche Sitzung, gleicher Schritt, Fokus auf der Überschrift.
7. Urteil, Gegenfragen, Spiegel (24 Wege) und Downloads; danach „Mission abgeschlossen“ in der Leiste.
8. Neu laden → Missionsstand ist wieder da, Datei muss neu gewählt werden. Keine Fehler in der Konsole.

- [ ] **Step 11: Commit**

```bash
git add src/domain/curriculum.ts src/domain/curriculum.test.ts src/components/LearningPath.tsx src/learning-path.css src/App.tsx src/main.tsx src/domain/network.test.ts
git commit -m "Replace the learning path with sessions from the course plan and embedded missions"
```

---

### Task 11: Echtdaten-Test und Dokumentation

**Files:**
- Create: `src/sandbox/allbus.local.test.ts`
- Modify: `README.md`, `UMSETZUNG-Pruefstand.md`

- [ ] **Step 1: Test mit Referenzwerten der Spezifikation**

`src/sandbox/allbus.local.test.ts`

```ts
// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyse, columnShare } from './analysis';
import { itemOf, jugend, nichtwahl, osten, type Claim, type Choice } from './claims';
import { readSav } from './readSav';

const file = process.env.ALLBUS_SAV;

test('reproduces the reference values of the specification', { skip: !file && 'ALLBUS_SAV nicht gesetzt' }, () => {
  const bytes = readFileSync(file!);
  const sav = readSav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const run = (claim: Claim, patch: Partial<Choice> = {}) => {
    const choice = { ...claim.defaults, ...patch };
    return analyse(sav, claim.analysis(choice, itemOf(claim, choice.item)));
  };
  const p = (x: number) => (100 * x).toFixed(1);
  assert.equal(sav.nCases, 5246);
  const young = run(jugend, { weighted: true });
  assert.deepEqual([p(young.target), p(young.comparison)], ['33.1', '40.9']);
  const wide = run(jugend, { weighted: true, positive: [1, 2, 3] });
  assert.deepEqual([p(wide.target), p(wide.comparison)], ['80.1', '84.0']);
  const east = run(osten);
  assert.deepEqual([p(east.target), p(east.comparison)], ['34.6', '43.0']);
  assert.equal(east.table.n[0] + east.table.n[1], 3592);
  const distrustful = (weighted: boolean) => columnShare(run(osten, { positive: [3, 4, 5, 6, 7], weighted }).table, 0, 'no');
  assert.deepEqual([p(distrustful(false)), p(distrustful(true))], ['41.8', '23.4']);
  assert.deepEqual([p(run(osten, { item: 'pt12' }).target), p(run(osten, { item: 'pt15' }).target)], ['31.9', '15.8']);
  assert.equal(p(run(nichtwahl).target), '8.8');
  assert.equal(p(run(nichtwahl, { weighted: true }).target), '9.2');
  assert.equal(p(run(nichtwahl, { missing: { mode: 'codesAsYes', codes: [-8] } }).target), '23.0');
  const agree = run(nichtwahl, { positive: [1, 2] });
  assert.deepEqual([p(agree.target), p(columnShare(agree.table, 0, 'yes'))], ['6.5', '87.0']);
  assert.equal(p(run(nichtwahl, { item: 'pa35' }).target), '10.8');
});
```

- [ ] **Step 2: Ohne und mit Datei laufen lassen**

Run: `pnpm test`
Expected: der Test wird mit „ALLBUS_SAV nicht gesetzt“ übersprungen.

Run: `ALLBUS_SAV="$ALLBUS_SAV" node --import tsx --test src/sandbox/allbus.local.test.ts`
Expected: PASS.

- [ ] **Step 3: README anpassen**

In `README.md` die vier Absätze von „Stand: 28. September 2026 · politikwissenschaftlicher Lernpfad …“ bis einschließlich „… `?ansicht=karte` öffnet weiterhin direkt das Netz.“ ersetzen durch:

```markdown
Stand: 29. September 2026 · Lernpfad nach dem Sitzungsplan Statistik Ib mit Missionen auf echten ALLBUS-Daten und freie Karte zur Orientierung.

Der Reiter **Lernpfad** ist die Startansicht. Zehn Sitzungen folgen dem Sitzungsplan „Statistik im WiSe 24/25“; die dort gestrichene Faktorenanalyse entfällt. Jede Sitzung nennt ihre politische Leitfrage, die Begriffe zur Wiederholung und die neuen Begriffe. Begriffe mit Kartenknoten öffnen die freie Karte, Begriffe ohne Knoten erscheinen gestrichelt. Sitzung 1 richtet R und die ALLBUS-Datei ein, die Sitzungen 3–5 enthalten je eine Mission „Belege es!“, für die übrigen Sitzungen folgen Missionen.

In einer Mission prüfen Studierende eine öffentliche Behauptung – „Die Jungen interessieren sich doch gar nicht mehr für Politik“, „Wer Politikern misstraut, geht gar nicht mehr wählen“ oder „Im Osten vertraut kaum noch jemand dem Bundestag“ – mit ihrer eigenen ALLBUScompact-2023-Datei (ZA8831). Fünf Schritte führen durch Zerlegen, Werkbank, Urteil, Gegenfragen und Robustheitsspiegel. Jede Auswertungsentscheidung wird selbst getroffen, die Kreuztabelle rechnet live, der eigene Weg erscheint als mariposa-Skript. Elf Gegenfragen-Regeln reagieren auf den eigenen Weg; der Spiegel rechnet 72 bzw. 24 vorbereitete Auswertungswege durch und zeigt, welche Entscheidung das Ergebnis am stärksten bewegt. Die `.sav`-Datei wird nur im Browser gelesen und nicht gespeichert; gespeichert werden ausschließlich eigene Entscheidungen und Texte (`statistikatlas.missionen.v1`).

Der zweite Reiter **Freie Karte** ergänzt den Lernpfad als Orientierungshilfe. „Zurück zu Sitzung N“ führt in dieselbe Sitzung zurück; der Stand der Mission bleibt erhalten. `?ansicht=karte` öffnet direkt das Netz. Prüfung der Missionen: `pnpm test` (synthetische Testdateien aus `scripts/make-sandbox-fixture.R`), `ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav node --import tsx --test src/sandbox/allbus.local.test.ts` für die Referenzwerte und `scripts/export-sandbox-grid.ts` mit `scripts/verify-sandbox-r.R` für den Abgleich des erzeugten R-Codes mit mariposa.
```

- [ ] **Step 4: Prüfstand ergänzen**

Oben in `UMSETZUNG-Pruefstand.md` einfügen (Zahlen an die tatsächlichen Ergebnisse anpassen):

```markdown
## 29. September 2026 – Lernpfad nach Sitzungsplan mit Missionen „Belege es!“

- Neuer Lernpfad mit zehn Sitzungen nach dem Sitzungsplan WiSe 24/25, Begriffen zur Wiederholung und neuen Begriffen je Sitzung sowie drei Missionen (Sitzungen 3–5) auf echten ALLBUS-Daten. Der bisherige Lernpfad mit zwölf Politik-Sitzungen, Vermutungsfragen, 36 Aufgaben, Arbeitsheft und Aufgabenbrücke entfällt.
- Missionen: Zerlegen, Werkbank mit Live-Kreuztabelle und Variablensuche, Urteil, elf Gegenfragen-Regeln, Robustheitsspiegel (72/24/24 Wege), Faktencheck-Karte und mariposa-Skript. Eigener SPSS-Leser im Browser; die ALLBUS-Datei wird nicht gespeichert.
- Rechenkern und erzeugter mariposa-Code stimmen auf synthetischen Daten und auf ZA8831 v1.3.0 in 120 von 120 Wegen überein (`verify-sandbox-r.R`, mariposa 0.7.3). Alle Referenzwerte der Spezifikation im Echtdaten-Test reproduziert.
- 125 automatisierte Tests: 124 bestanden, ein Echtdaten-Test ohne Datei übersprungen. TypeScript, Produktions- und Offline-Build erfolgreich. Browserprüfung mit echter Datei: Laden, Sitzungsstatus, Schrittprüfung, Werkbank, Kartenweg und Rückkehr, Spiegel, Wiederherstellung; keine Konsolenfehler.
- Bekannt, nicht Teil dieser Änderung: doppelter React-Key beim Öffnen von „Gewichte“ in der freien Karte; mariposa `crosstab()` bricht bei gelabeltem Gewicht mit NA ab.
```

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/allbus.local.test.ts README.md UMSETZUNG-Pruefstand.md
git commit -m "Document the new learning path and test missions against the real ALLBUS file"
```

---

## Abdeckung der Spezifikation

| Spezifikation | Task |
|---|---|
| 3 Ablauf einer Mission (Daten laden, fünf Schritte, Schrittleiste, Zustand) | 8, 9 |
| 3a Neuer Lernpfad nach Sitzungsplan, Begriffe, Sitzungsleiste, Rückweg aus der Karte | 10 |
| 4 Drei Behauptungen mit Items, Fallen, Spiegel-Dimensionen | 3 |
| 4 Referenzwerte | 3 (synthetisch), 11 (echt) |
| 5 Elf Gegenfragen | 7 |
| 6 Robustheitsspiegel, Gewicht der Entscheidungen, eigener Weg außerhalb des Rasters | 5, 9 |
| 7.3 SPSS-Leser, ZSAV-Ablehnung, Validierung | 1, 4 |
| 7.4 Variablensuche | 4, 9 |
| 7.5 R-Generator inkl. `untag_na()` | 6 |
| 7.6 Einbindung, Entfernen des alten Lernpfads, Speicherung | 8, 10 |
| 8 Datenschutz, `.gitignore` | 1, 10 (Step 9) |
| 9 Fehlerbehandlung | 1, 4, 8, 9, 10 |
| 10 Prüfung und Abnahme | 1–11 |
