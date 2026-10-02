# Lernpfad-Aufgaben, Etappe 2: Sitzungen 4 und 5 – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitzung 4 bekommt den „Nenner-Check“ (Umbau von „Belege es!“ auf R), Sitzung 5 die „Treiber-Rangliste“; dazu ein gemeinsamer Rechenkern für Kreuztabellen und Zusammenhangsmaße. Die alte Mission mit Werkbank, Live-Tabelle und Spiegel entfällt.

**Architecture:** Beide Aufgaben folgen dem Muster aus Etappe 1: `src/tasks/sNN-…/` mit `content.ts` (Texte, Karten, R-Code), `domain.ts` (reine Prüflogik, getestet) und eigener Oberfläche, angemeldet im Register. Neu ist `src/tasks/kit/stats.ts` (gewichtete Kreuztabellen, V, Phi, Gamma, Tau-b, Spearman, Pearson, Zufalls-V), das genau wie mariposa rechnet. Sitzung 4 rechnet aus einer Grundzählung je Item alle 1.856 Vierfeldertafeln und findet so den Weg hinter einer Zahl. Nach dem Umbau enthält `src/sandbox/` nur noch Datei-Einleser, ALLBUS-Prüfung, Ladefeld und Testdaten.

**Tech Stack:** React 19, TypeScript 7, Vite 8, `node --test` mit `tsx`, `react-dom/server` für Rendertests, R 4 mit mariposa 0.7.3 und haven für Testdatei und Skriptprüfung.

**Spec:** `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md` (Abschnitte 4.4, 4.5, 5–9). Konzepte mit Rollenauftrag, Ablauf und Referenzwerten: `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-aufgaben/sitzung-04.md`, `sitzung-05.md`.

**Entstehung:** Der gesamte Code wurde vorab Task für Task in einer Kopie des Repositorys gebaut und geprüft. Jeder Zwischenstand liegt als Git-Tag vor (`plan2-t1` … `plan2-t7` im Zweig `plan2-steps`; Endstand zusätzlich im Zweig `plan2-prototype`). Jeder Stand ist typgeprüft und grün; der Endstand hat 155 Tests bestanden (5 Echtdaten-Tests ohne Datei übersprungen). Außerdem geprüft: Echtdaten-Test mit ZA8831 v1.3.0 (5/5), Lösungsskripte in R auf Testdatei und echter Datei (17/17), Produktions- und Offline-Build, Browserdurchlauf mit echter Datei (allein/zu zweit, 390 px, keine Konsolenfehler). Die Code-Blöcke dieses Plans sind byte-gleich mit den Dateien der Tags; zum Übertragen `git show plan2-tN:<pfad> > <pfad>` verwenden (typografische Anführungszeichen „“ ‚‘ und − bleiben so erhalten).

## Global Constraints

- Arbeitszweig: `lernpfad-etappe-2` (von `main`) im Repository `Kartenkonzept/Statistikatlas-Prototyp`; nach jedem Task ein Commit.
- `pnpm` steht in dieser Shell nicht im PATH: Befehle mit `node_modules/.bin/…` bzw. `node --import tsx …` ausführen.
- Keine ALLBUS-Mikrodaten im Repository, im Build oder im Browser-Speicher; nur aggregierte Referenzwerte in Tests und Doku. Die Testdatei ist synthetisch (n = 60).
- Gespeichert werden nur Entscheidungen und Texte unter `statistikatlas.aufgaben.v1`; der Schlüssel `statistikatlas.missionen.v1` entfällt mit der Mission.
- R-Code für Studierende im mariposa-Stil: `read_spss()`, `rec()` in `mutate()`, Analysen gepiped; keine `ifelse()`/`%in%`-Umkodierung; `library(dplyr)` und `library(mariposa)` (mariposa zuletzt, sonst überdeckt haven `read_spss()`).
- Gewichtung: Sitzung 4 ungewichtet (Gewicht nur als vertretbare Variante), ab Sitzung 5 gewichtet mit `wghtpew`.
- Zusammenhangsmaße wie mariposa: χ², V und Phi ohne Kontinuitätskorrektur, gewichtet auf gerundeten gewichteten Zellen; Gamma auf derselben Tabelle; Tau-b mit Paargewicht √(wᵢ·wⱼ); Spearman nutzt Gewichte nur zur Fallauswahl; `kendall_tau()` in R erst nach `unlabel()`; `ps03` wird zuerst umgepolt (`rec(ps03, rules = "rev")`, höher = zufriedener).
- Hilfe immer vierstufig: Denkanstoß → Verweis (Atlas-Karte, R-Workshop) → Gerüst mit `___` → vollständiger Code. Keine Punkte, keine Musterlösung für Urteile und Stempel.
- Alle Personen, Büros, Redaktionen und Fonds sind erfunden und als fiktiv gekennzeichnet. Kategorienfarben neutral, keine Parteifarben.
- Texte auf Deutsch, Code-Bezeichner auf Englisch wie im bestehenden Code.

## Festlegungen dieses Plans (begründet)

1. **Rechenkern als eine Datei** `src/tasks/kit/stats.ts` statt Ordner `stats/` (Spezifikation §6): Für Etappe 2 genügen sieben Funktionen; ein Ordner lohnt sich erst mit t-Test, ANOVA und Regression.
2. **Vierfelder-Kern und Gegenfragen für Sitzung 4 liegen in `s04-nenner-check/domain.ts`.** Die alten Module (`analysis`, `questions`, `claims`, `multiverse`, `rcode`, `state`) waren eng an die Mission gebunden; ihre Regeln (Prozentbasen, Nichtwahl-Definitionen, Gegenfragen „weiß nicht“, Kausalsprache, Fallzahl, Absicht) sind übernommen, der Rest entfällt. §6 der Spezifikation wird in Task 7 angepasst.
3. **Rückwärtssuche:** Stimmen Prozentwert und Zellen-n auch ohne eine Entscheidung (ein Nichtwahl-Code ohne Fälle, else=0 ohne Einfluss auf diese Zelle, ein Gewicht ohne Wirkung), wird der einfachere Weg genannt – so gibt es keine Scheintreffer.
4. **Sitzung 5 mit 13 Karten:** zwölf Kandidaten und `pt03` als Joker (Spezifikation: „bleibt als bewusst zu guter Kandidat im Deck“). Bei 25 Studierenden geht jeder Kandidat an zwei Personen, der Joker an eine.
5. **Stempel-Regel (offengelegt):** „kehrt sich um“ bei verschiedenen Vorzeichen in West und Ost (beide ≥ 0,03 vom Nullpunkt); „nur in einem Landesteil“, wenn ein Wert mindestens doppelt so groß ist wie der andere und der kleinere unter 0,1 liegt; „schrumpft“, wenn die Landesteile im Mittel unter 85 % des Gesamtwerts liegen; sonst „trägt“. Die Regel liefert die Stempel des Konzepts (Wirtschaftslage trägt, Kirchgang schrumpft, Wohnort nur im Osten, Alter kehrt sich um). Der Stempel bleibt die Entscheidung der Studierenden.
6. **Karte „West oder Ost“:** Der Landesteil ist hier selbst der Kandidat; statt des Ost/West-Tests prüft man innerhalb gleicher Wirtschaftslage (gut / teils/teils / schlecht, aus `ep01`) – die Drittvariable aus dem Konzept.
7. **Leitfrage von Sitzung 5** wird zur Aufgabe passend: „Was hängt mit der Zufriedenheit mit der Demokratie zusammen?“ (bisher „Vertraut der Osten dem Bundestag weniger?“).
8. **Metrische Karten ohne Kreuztabellen-Überblick** im Lösungsskript (Alter hätte 79 Zeilen); dort genügen die Korrelationen.
9. **mariposa-Eigenheit:** `cramers_v()`/`goodman_gamma()` bilden die Kategorien je Variable, nicht aus vollständigen Paaren; kommt eine Kategorie nur bei fehlendem Partner vor, wird χ² NaN. Auf der echten Datei tritt das bei keiner Karte auf (geprüft), nur auf der kleinen Testdatei (Alter). Der Browser rechnet über vollständige Paare.

## File Structure

| Datei | Verantwortung |
|---|---|
| `scripts/make-sandbox-fixture.R` | Testdatei um `pe05`, `ep01`, `ps03`, `ep03`, `id02`, `educ`, `rp01`, `rd01`, `gs01` erweitert |
| `src/tasks/kit/stats.ts` | gewichtete Kreuztabellen, χ², Cramér-V, Phi, Gamma, Tau-b, Spearman, Pearson, Zufalls-V (wie mariposa) |
| `src/tasks/s04-nenner-check/` | Sitzung 4: `content.ts`, `domain.ts` (Vierfeldertafeln, Rückwärtssuche, Prüfungen, Gegenfragen, R-Code), `Charts.tsx` (Nenner-Bild, Streifen), `NennerCheck.tsx`, `index.ts`, Tests |
| `src/tasks/s05-treiber/` | Sitzung 5: `content.ts` (13 Karten), `domain.ts` (Varianten, Detektor, Passung, Stempel, Rangliste, R-Code), `RankChart.tsx`, `Treiber.tsx`, `index.ts`, Tests |
| `src/components/LearningPath.tsx` | nur noch Aufgaben; Missions-Speicher und Missions-Zweig entfallen |
| `src/domain/curriculum.ts` | `Session.mission` entfällt; Sitzungen 4 und 5 bekommen `s04`, `s05` |
| `src/tasks/testRender.ts` | `renderSession(index, withData, tasks)` ohne Missions-Speicher |
| `src/sandbox/` | bleibt: `readSav`, `allbus` (nur Studienprüfung), `ui/DataDrop`, `testData`, Testdatei; alles andere entfällt |
| `src/tasks/allbus.local.test.ts` | Referenzwerte der Sitzungen 4 und 5 mit echter Datei |
| `scripts/export-task-scripts.ts` | exportiert zusätzlich Sitzung 4 und alle 13 Karten von Sitzung 5 |

---
### Task 1: Testdatei um die Variablen der Sitzungen 4 und 5 erweitern

**Files:**
- Modify: `scripts/make-sandbox-fixture.R` (Block vor `write_sav(d, file.path(out, "sandbox-fixture.sav"), compress = "byte")` einfügen)
- Regenerate: `src/sandbox/fixtures/sandbox-fixture.sav`, `sandbox-fixture-uncompressed.sav`, `sandbox-fixture.expected.json`

**Interfaces:**
- Produces: Testdatei mit `pe05`, `ep01`, `ps03` (mit `ep01` korreliert, damit Zusammenhangsmaße sichtbar werden), `ep03`, `id02`, `educ`, `rp01`, `rd01`, `gs01` – Labels und Missing-Codes wie im echten ALLBUS, Werte synthetisch. Neue Zufallsziehungen stehen hinter allen bisherigen; bestehende Werte bleiben gleich.

- [ ] **Step 1: Block einfügen.** In `scripts/make-sandbox-fixture.R` direkt vor der Zeile `write_sav(d, file.path(out, "sandbox-fixture.sav"), compress = "byte")` (nach dem `pt03`-Block aus Etappe 1) einfügen:

```r
# Lernpfad-Aufgaben 4–5: Variablen mit Labels und Missing-Codes des echten ALLBUS (Werte synthetisch).
# Neue Zufallsziehungen stehen hinter allen bisherigen, damit deren Werte gleich bleiben.
agree4 <- c("STIMME VOLL ZU" = 1, "STIMME EHER ZU" = 2, "STIMME EHER NICHT ZU" = 3, "STIMME GAR NICHT ZU" = 4)
d$pe05 <- lab(pick(c(1:4, -11, -9, -8), c(.05, .25, .25, .12, .3, .02, .01)),
              c("TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, agree4), "POLITIKER VERTRETEN INTERESSEN D. BEV.")
good5 <- c("SEHR GUT" = 1, "GUT" = 2, "TEILS/TEILS" = 3, "SCHLECHT" = 4, "SEHR SCHLECHT" = 5)
d$ep01 <- lab(pick(c(1:5, -9), c(.05, .25, .4, .2, .08, .02)), c("KEINE ANGABE" = -9, "WEISS NICHT" = -8, good5), "WIRTSCHAFTSLAGE IN DEUTSCHLAND HEUTE")
ps <- pmin(6, pmax(1, as.numeric(d$ep01) + sample(-2:1, n, replace = TRUE)))
d$ps03 <- lab(ifelse(runif(n) < .3, -11, ifelse(as.numeric(d$ep01) < 0, -9, ps)),
              c("DATENFEHLER: MFN" = -42, "TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, "SEHR ZUFRIEDEN" = 1, "ZIEMLICH ZUFRIEDEN" = 2,
                "ETWAS ZUFRIEDEN" = 3, "ETWAS UNZUFRIEDEN" = 4, "ZIEML. UNZUFRIEDEN" = 5, "SEHR UNZUFRIEDEN" = 6), "ZUFRIEDEN MIT DEMOKRATIE IN DEUTSCHLAND?")
d$ep03 <- lab(pick(c(1:5, -9), c(.08, .5, .28, .1, .02, .02)), c("KEINE ANGABE" = -9, "WEISS NICHT" = -8, good5), "WIRTSCHAFTSLAGE, BEFR. HEUTE")
d$id02 <- lab(pick(c(1:5, -50, -8), c(.05, .25, .5, .14, .02, .02, .02)),
              c("KEINER DER SCHICHTEN" = -50, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, "VERWEIGERT" = -7, "UNTERSCHICHT" = 1, "ARBEITERSCHICHT" = 2,
                "MITTELSCHICHT" = 3, "OBERE MITTELSCHICHT" = 4, "OBERSCHICHT" = 5), "SUBJEKTIVE SCHICHTEINSTUFUNG, BEFR.")
d$educ <- lab(pick(c(1:7, -9), c(.02, .17, .31, .12, .33, .02, .02, .01)),
              c("NICHT BESTIMMBAR" = -33, "KEINE ANGABE" = -9, "OHNE ABSCHLUSS" = 1, "VOLKS-,HAUPTSCHULE" = 2, "MITTLERE REIFE" = 3,
                "FACHHOCHSCHULREIFE" = 4, "HOCHSCHULREIFE" = 5, "ANDERER ABSCHLUSS" = 6, "NOCH SCHUELER" = 7), "ALLGEMEINER SCHULABSCHLUSS")
d$rp01 <- lab(pick(c(1:6, -10, -9), c(.02, .03, .05, .12, .27, .45, .04, .02)),
              c("TNZ: FILTER" = -10, "KEINE ANGABE" = -9, "UEBER 1X DIE WOCHE" = 1, "1X PRO WOCHE" = 2, "1-3X PRO MONAT" = 3,
                "MEHRMALS IM JAHR" = 4, "SELTENER" = 5, "NIE" = 6), "KIRCHGANGSHAEUFIGKEIT")
d$rd01 <- lab(pick(c(1:6, -7), c(.21, .02, .22, .03, .03, .47, .02)),
              c("KEINE ANGABE" = -9, "VERWEIGERT" = -7, "EVANG.OHNE FREIKIRCH" = 1, "EVANG.FREIKIRCHE" = 2, "ROEMISCH-KATHOLISCH" = 3,
                "AND.CHRISTL.RELIGION" = 4, "AND.NICHT-CHRISTLICH" = 5, "KEINER RELIGIONSGEM." = 6), "KONFESSION, BEFRAGTE(R)")
d$gs01 <- lab(pick(c(1:5, -9), c(.21, .13, .36, .27, .01, .02)),
              c("KEINE ANGABE" = -9, "GROSSSTADT" = 1, "VORORT GROSSSTADT" = 2, "MITTEL-, KLEINSTADT" = 3, "LAENDL. DORF" = 4, "EINZELHAUS, LAND" = 5),
              "SELBSTBESCHREIBUNG DES WOHNORTS")

```

- [ ] **Step 2: Testdatei neu erzeugen**

Run: `Rscript --vanilla scripts/make-sandbox-fixture.R`
Expected: `Geschrieben nach src/sandbox/fixtures`; `git diff --stat src/sandbox/fixtures/sandbox-fixture.expected.json` zeigt nur Einfügungen (neue Variablen).

- [ ] **Step 3: Tests laufen lassen**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 164`, `# fail 0`, `# skipped 4` (unverändert; bestehende Werte der Testdatei bleiben gleich).

- [ ] **Step 4: Commit**

```bash
git add scripts/make-sandbox-fixture.R src/sandbox/fixtures
git commit -m "Extend synthetic fixture with variables for sessions 4 and 5"
```

---
### Task 2: Rechenkern für Kreuztabellen und Zusammenhangsmaße

**Files:**
- Create: `src/tasks/kit/stats.ts`
- Test: `src/tasks/kit/stats.test.ts`

**Interfaces:**
- Consumes: `isMissingCode`, `SavVariable` aus `src/sandbox/readSav.ts`.
- Produces: `validValues(v): Float64Array` (fehlende Codes → NaN); `crosstab(x, y, w?) → Table { rows, cols, cells, n }`; `roundHalfEven(v)`; `roundTable(t)`; `chiSquare(cells) → { chi2, df, n }`; `cramersV`, `phi`, `gamma`, `tauB`, `pearson`, `spearman` – jeweils `(x, y, w | null) → number`; `type MeasureId = 'V' | 'phi' | 'gamma' | 'tau' | 'rho' | 'r'`; `MEASURES: Record<MeasureId, { label, fn, r }>`; `random(seed)`; `permutationV(x, y, w, runs = 20, seed = 2023)`.

- [ ] **Step 1: Failing test schreiben** – `src/tasks/kit/stats.test.ts` (Referenzwerte mit mariposa 0.7.3 auf der Testdatei aus Task 1 gerechnet; `ps03` hier in der Originalkodierung):

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureSav } from '../../sandbox/testData';
import { chiSquare, cramersV, crosstab, gamma, pearson, permutationV, phi, roundHalfEven, spearman, tauB, validValues } from './stats';

const sav = fixtureSav();
const col = (name: string) => validValues(sav.byName.get(name)!);
const ps03 = col('ps03'), w = col('wghtpew');
const close = (actual: number, expected: number, digits = 8) => assert.ok(Math.abs(actual - expected) < 10 ** -digits, `${actual} ≠ ${expected}`);

test('builds weighted crosstabs and rounds like R', () => {
  const t = crosstab([1, 1, 2, NaN, 2], [1, 2, 2, 1, 2], [0.5, 1.5, 2, 1, 1]);
  assert.deepEqual(t.rows, [1, 2]);
  assert.deepEqual(t.cells, [[0.5, 1.5], [0, 3]]);
  assert.equal(t.n, 5);
  assert.deepEqual([0.5, 1.5, 2.5, 2.51, -2.5].map(roundHalfEven), [0, 2, 2, 3, -2]);
  assert.equal(chiSquare([[10, 20], [30, 40]]).df, 1);
});

// Referenzwerte: mariposa 0.7.3 auf der Testdatei (scripts/make-sandbox-fixture.R), ps03 in der Originalkodierung.
test('nominal and ordinal measures match mariposa, weighted on rounded cells', () => {
  const ref: Record<string, number[]> = {
    ep01: [0.4771702106, 0.4701388156, 0.9543404212, 0.8110236220, 0.7899686520],
    rd01: [0.2810016564, 0.2945886471, 0.5620033129, 0.1942148760, 0.1937984496],
    eastwest: [0.3223491092, 0.2946985560, 0.3223491092, -0.0422535211, -0.1873350923],
  };
  for (const [v, [vw, vu, phiW, gw, gu]] of Object.entries(ref)) {
    const x = col(v);
    close(cramersV(ps03, x, w), vw);
    close(cramersV(ps03, x), vu);
    close(phi(ps03, x, w), phiW);
    close(gamma(ps03, x, w), gw);
    close(gamma(ps03, x), gu);
  }
});

test('Tau-b, Spearman and Pearson match mariposa', () => {
  const ref: Record<string, number[]> = {
    ep01: [0.6544889972, 0.6458842532, 0.7508144656, 0.7699054185, 0.7573178550],
    age: [0.2014839144, 0.1861380710, 0.2485905514, 0.2748574215, 0.2630279757],
    rd01: [0.1543385371, 0.1423871691, 0.1647905888, 0.1820824660, 0.1449122280],
    eastwest: [-0.1095041155, -0.1152724999, -0.1285608343, -0.1022473638, -0.1154736699],
  };
  for (const [v, [tw, tu, rho, rw, ru]] of Object.entries(ref)) {
    const x = col(v);
    close(tauB(ps03, x, w), tw);
    close(tauB(ps03, x), tu);
    close(spearman(ps03, x, w), rho);
    close(spearman(ps03, x), rho);
    close(pearson(ps03, x, w), rw);
    close(pearson(ps03, x), ru);
  }
});

test('the permutation V is reproducible and smaller than a real association', () => {
  const x = col('ep01');
  const a = permutationV(ps03, x, w, 20, 7), b = permutationV(ps03, x, w, 20, 7);
  assert.equal(a, b);
  assert.ok(a < cramersV(ps03, x, w));
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/kit/stats.test.ts`
Expected: FAIL (`Cannot find module './stats'`).

- [ ] **Step 3: Implementieren** – `src/tasks/kit/stats.ts`:

```ts
import { isMissingCode, type SavVariable } from '../../sandbox/readSav';

/** Werte einer Variable; fehlende Codes (Missing-Bereich, NA) werden NaN – wie getaggte NA nach read_spss(). */
export function validValues(v: SavVariable): Float64Array {
  return Float64Array.from(v.values, x => (isMissingCode(v, x) ? NaN : x));
}

export type Table = { rows: number[]; cols: number[]; cells: number[][]; n: number };
type Nums = ArrayLike<number>;

const usable = (x: Nums, y: Nums, w: Nums | null, i: number) =>
  Number.isFinite(x[i]) && Number.isFinite(y[i]) && (w === null || w[i] > 0);

/** Kreuztabelle über alle Fälle mit gültigem x und y (und Gewicht > 0), Zeilen = x, Spalten = y – wie xtabs(). */
export function crosstab(x: Nums, y: Nums, w: Nums | null = null): Table {
  const rowSet = new Set<number>(), colSet = new Set<number>();
  for (let i = 0; i < x.length; i++) if (usable(x, y, w, i)) { rowSet.add(x[i]); colSet.add(y[i]); }
  const rows = [...rowSet].sort((a, b) => a - b), cols = [...colSet].sort((a, b) => a - b);
  const ri = new Map(rows.map((r, k) => [r, k])), ci = new Map(cols.map((c, k) => [c, k]));
  const cells = rows.map(() => cols.map(() => 0));
  let n = 0;
  for (let i = 0; i < x.length; i++) {
    if (!usable(x, y, w, i)) continue;
    const add = w ? w[i] : 1;
    cells[ri.get(x[i])!][ci.get(y[i])!] += add;
    n += add;
  }
  return { rows, cols, cells, n };
}

/** R-Rundung (IEC 60559): bei genau ,5 zur geraden Zahl. */
export function roundHalfEven(v: number): number {
  const r = Math.round(v);
  return Math.abs(v % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

/** mariposa rundet gewichtete Zellen vor χ² und Gamma auf ganze Zahlen (wie SPSS). */
export function roundTable(t: Table): Table {
  const cells = t.cells.map(row => row.map(roundHalfEven));
  return { ...t, cells, n: cells.flat().reduce((a, b) => a + b, 0) };
}

export function chiSquare(cells: number[][]): { chi2: number; df: number; n: number } {
  const rowSum = cells.map(r => r.reduce((a, b) => a + b, 0));
  const colSum = cells[0]?.map((_, j) => cells.reduce((a, r) => a + r[j], 0)) ?? [];
  const n = rowSum.reduce((a, b) => a + b, 0);
  let chi2 = 0;
  cells.forEach((row, i) => row.forEach((o, j) => {
    const e = rowSum[i] * colSum[j] / n;
    chi2 += (o - e) ** 2 / e;
  }));
  return { chi2, df: (cells.length - 1) * (colSum.length - 1), n };
}

const tableFor = (x: Nums, y: Nums, w: Nums | null) => (w ? roundTable(crosstab(x, y, w)) : crosstab(x, y));

/** Cramér-V wie mariposa::cramers_v(): χ² ohne Korrektur, gewichtet auf gerundeten Zellen. */
export function cramersV(x: Nums, y: Nums, w: Nums | null = null): number {
  const t = tableFor(x, y, w), { chi2, n } = chiSquare(t.cells);
  return Math.sqrt(chi2 / (n * Math.min(t.rows.length - 1, t.cols.length - 1)));
}

/** Phi wie mariposa::phi(): √(χ²/n), ohne Vorzeichen, auch für größere Tabellen. */
export function phi(x: Nums, y: Nums, w: Nums | null = null): number {
  const { chi2, n } = chiSquare(tableFor(x, y, w).cells);
  return Math.sqrt(chi2 / n);
}

/** Summe aller Zellen rechts unterhalb (dir = 1) bzw. links unterhalb (dir = -1) von (i, j). */
function below(cells: number[][], i: number, j: number, dir: 1 | -1): number {
  let s = 0;
  for (let k = i + 1; k < cells.length; k++) {
    for (let l = dir === 1 ? j + 1 : 0; dir === 1 ? l < cells[k].length : l < j; l++) s += cells[k][l];
  }
  return s;
}

/** Goodman-Kruskal-Gamma wie mariposa::goodman_gamma(): konkordante gegen diskordante Paare, gewichtet auf gerundeten Zellen. */
export function gamma(x: Nums, y: Nums, w: Nums | null = null): number {
  const { cells } = tableFor(x, y, w);
  let p = 0, q = 0;
  cells.forEach((row, i) => row.forEach((o, j) => { p += o * below(cells, i, j, 1); q += o * below(cells, i, j, -1); }));
  return (p - q) / (p + q);
}

/** Kendall Tau-b wie mariposa::kendall_tau(); mit Gewichten zählt jedes Paar √(wᵢ·wⱼ) – über Zellsummen von √w und w. */
export function tauB(x: Nums, y: Nums, w: Nums | null = null): number {
  const s = crosstab(x, y, w ? Float64Array.from({ length: x.length }, (_, i) => Math.sqrt(w[i])) : null);
  const W = w ? crosstab(x, y, w).cells : s.cells;
  const S = s.cells, sum = (m: number[][]) => m.flat().reduce((a, b) => a + b, 0);
  const tot = (sum(S) ** 2 - sum(W)) / 2;
  const tx = S.reduce((a, row, i) => a + (row.reduce((b, c) => b + c, 0) ** 2 - W[i].reduce((b, c) => b + c, 0)) / 2, 0);
  const ty = (S[0] ?? []).reduce((a, _, j) => {
    const cs = S.reduce((b, row) => b + row[j], 0), cw = W.reduce((b, row) => b + row[j], 0);
    return a + (cs ** 2 - cw) / 2;
  }, 0);
  let c = 0, d = 0;
  S.forEach((row, i) => row.forEach((v, j) => { c += v * below(S, i, j, 1); d += v * below(S, i, j, -1); }));
  return (c - d) / Math.sqrt((tot - tx) * (tot - ty));
}

function ranks(v: number[]): number[] {
  const order = v.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const out = new Array<number>(v.length);
  for (let k = 0; k < order.length;) {
    let e = k;
    while (e + 1 < order.length && order[e + 1][0] === order[k][0]) e++;
    for (let m = k; m <= e; m++) out[order[m][1]] = (k + e) / 2 + 1;
    k = e + 1;
  }
  return out;
}

function pairs(x: Nums, y: Nums, w: Nums | null) {
  const xs: number[] = [], ys: number[] = [], ws: number[] = [];
  for (let i = 0; i < x.length; i++) if (usable(x, y, w, i)) { xs.push(x[i]); ys.push(y[i]); ws.push(w ? w[i] : 1); }
  return { xs, ys, ws };
}

/** Pearson-r, gewichtet wie mariposa::pearson_cor(weights = …). */
export function pearson(x: Nums, y: Nums, w: Nums | null = null): number {
  const { xs, ys, ws } = pairs(x, y, w);
  const sw = ws.reduce((a, b) => a + b, 0);
  const mx = xs.reduce((a, v, i) => a + ws[i] * v, 0) / sw, my = ys.reduce((a, v, i) => a + ws[i] * v, 0) / sw;
  let sxy = 0, sxx = 0, syy = 0;
  xs.forEach((v, i) => { sxy += ws[i] * (v - mx) * (ys[i] - my); sxx += ws[i] * (v - mx) ** 2; syy += ws[i] * (ys[i] - my) ** 2; });
  return sxy / Math.sqrt(sxx * syy);
}

/** Spearman-ρ wie mariposa::spearman_rho(): Gewichte dienen nur der Fallauswahl, gerechnet wird ungewichtet. */
export function spearman(x: Nums, y: Nums, w: Nums | null = null): number {
  const { xs, ys } = pairs(x, y, w);
  return pearson(ranks(xs), ranks(ys));
}

export type MeasureId = 'V' | 'phi' | 'gamma' | 'tau' | 'rho' | 'r';
export const MEASURES: Record<MeasureId, { label: string; fn: (x: Nums, y: Nums, w: Nums | null) => number; r: string }> = {
  V: { label: 'Cramér-V', fn: cramersV, r: 'cramers_v' },
  phi: { label: 'Phi', fn: phi, r: 'phi' },
  gamma: { label: 'Gamma', fn: gamma, r: 'goodman_gamma' },
  tau: { label: 'Tau-b', fn: tauB, r: 'kendall_tau' },
  rho: { label: 'Spearman-ρ', fn: spearman, r: 'spearman_rho' },
  r: { label: 'Pearson-r', fn: pearson, r: 'pearson_cor' },
};

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
export function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zufalls-V: Mittel von V, wenn y zufällig unter den Fällen vertauscht wird – so groß wird V schon ohne jeden Zusammenhang. */
export function permutationV(x: Nums, y: Nums, w: Nums | null, runs = 20, seed = 2023): number {
  const { xs, ys, ws } = pairs(x, y, w);
  const next = random(seed), shuffled = [...ys];
  let total = 0;
  for (let r = 0; r < runs; r++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    total += cramersV(xs, shuffled, w ? ws : null);
  }
  return total / runs;
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --import tsx --test src/tasks/kit/stats.test.ts` → `# pass 4`, `# fail 0`.
Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit` → `# pass 168`, `# fail 0`, `# skipped 4`; tsc ohne Ausgabe.

- [ ] **Step 5: Commit**

```bash
git add src/tasks/kit/stats.ts src/tasks/kit/stats.test.ts
git commit -m "Add stats kit: weighted crosstabs and association measures like mariposa"
```

---
### Task 3: Sitzung 4 „Nenner-Check“ – Inhalte und Prüflogik

**Files:**
- Create: `src/tasks/s04-nenner-check/content.ts`, `src/tasks/s04-nenner-check/domain.ts`
- Test: `src/tasks/s04-nenner-check/domain.test.ts`

**Interfaces:**
- Consumes: `SavFile` (readSav), `Note` (kit/Feedback), `de`, `near`, `parseNumber` (kit/numbers), `WORK_MODES`, `WorkMode` (kit/PartnerToggle), `bool`, `oneOf`, `record`, `str` (kit/storage), `TaskStatus` (types), `Hint` (kit/HintLadder).
- Produces:
  - `content.ts`: `type ItemId = 'pe01' | 'pa35' | 'pe05'`, `ITEM_IDS`, `ITEMS` (Kategorien, `reversed`, `strict`, `wide`), `NONVOTE_EXTRAS` (−8 wn, −7 vw, −9 ka), `NOT_ELIGIBLE = -50`, `PRESS_RELEASE`, `CLAIMED = 87`, `R_SETUP`, `R_P1`, `R_P2`, `R_P3_EXAMPLE`, `R_EXTRA`, `R_SOLUTION`, `hints` (`p1`, `p2`, `p3`, `extra`), `CAUSES`.
  - `domain.ts`: `type Way`, `Cell`, `Base`, `Four`, `WayTable`, `Joint`, `Candidate`, `S04State`, `Question`; `PARTY`; `prepare(sav): Joint`; `fourfold(joint, way): WayTable`; `percent(t, cell, base)`; `cellCount(t, cell)`; `allTables(joint)` (1.856 Tafeln); `lookup(tables, pct, n, integer?)`; `groupText`, `meaning(candidate)`, `shortcut(way)`; `checkP1(tables, joint, pct, n)`, `checkP2(tables, joint, p2)`, `checkP3(tables, joint, p3)`; `denominators(joint)`; `readings(joint)` (18 Lesarten); `declaredWay(p3)`; `stairs(sav)`, `checkExtra(sav, input)`; `VERDICTS`, `CAUSAL_WORDS`, `questions(joint, state)`; `initialS04`, `parseS04`, `statusS04`, `plenumLines`, `rCodeFor(way)`.

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s04-nenner-check/domain.test.ts` (handgebaute Vierfeldertafel, damit jede erwartete Zahl nachrechenbar ist):

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import {
  allTables, checkExtra, checkP1, checkP2, checkP3, denominators, fourfold, initialS04, lookup, parseS04, PARTY, percent,
  plenumLines, prepare, questions, rCodeFor, readings, shortcut, stairs, statusS04,
} from './domain';

// Handgebaute Vierfeldertafel (pe01 × pv01): misstraut (1–2) & nicht wählen (91) = 5, misstraut & wählen = 10,
// übrige & nicht wählen = 1, übrige & wählen = 9; dazu 2× „weiß nicht“ und 3× „nicht wahlberechtigt“.
const rows: [pe01: number, pv01: number, pe05: number, times: number, weight?: number][] = [
  [1, 91, 2, 2, 2], [1, 91, 4, 1, 2], [2, 91, 3, 2], [3, 91, 4, 1], [4, 1, 1, 4], [1, 1, 3, 6], [2, 2, 2, 1], [2, 2, 3, 3], [3, 2, 3, 5],
  [2, -8, 1, 2], [4, -50, 1, 3],
];
const col = (k: 0 | 1 | 2 | 4) => rows.flatMap(r => Array(r[3]).fill(k === 4 ? r[4] ?? 1 : r[k]));
const sav = fakeSav({
  pe01: { values: col(0), missingFrom: -1 }, pv01: { values: col(1), missingFrom: -1 }, pe05: { values: col(2), missingFrom: -1 },
  pa35: { values: col(0).map(() => -11), missingFrom: -1 }, wghtpew: { values: col(4) },
});
const joint = prepare(sav), tables = allTables(joint);

test('counts the fourfold table and its three bases', () => {
  assert.equal(tables.length, 1856);
  const t = fourfold(joint, PARTY);
  assert.deepEqual(t.n, { a: 5, b: 10, c: 1, d: 9 });
  assert.equal(percent(t, 'a', 'col'), 500 / 6);
  assert.equal(percent(t, 'a', 'row'), 100 / 3);
  assert.equal(percent(t, 'c', 'row'), 10);
  assert.equal(percent(t, 'a', 'all'), 20);
  assert.deepEqual(denominators(joint), { cell: 5, nonvoters: 6, distrusting: 15, all: 25 });
  assert.deepEqual(fourfold(joint, { ...PARTY, nonvote: [-8] }).n, { a: 7, b: 10, c: 1, d: 9 });
  assert.deepEqual(fourfold(joint, { ...PARTY, else0: true }).n, { a: 5, b: 12, c: 1, d: 12 });
});

test('names who the 100 % are and recognises the press-release way', () => {
  assert.match(checkP1(tables, joint, '83,3', '5')[0].text, /unter den 6, die nicht wählen wollen\. Genau so hat der Parteivorstand gerechnet/);
  assert.match(checkP1(tables, joint, '83', '')[0].text, /Trag noch die Häufigkeit/);
  assert.match(checkP1(tables, joint, '88,9', '8')[0].text, /gewichtet.*Gewichtet ist das vertretbar/);
  assert.match(checkP1(tables, joint, '33,3', '5')[0].text, /unter den 15 Befragten mit pe01 1–2.*Der Nenner ist vertauscht/);
  assert.match(checkP1(tables, joint, '20,0', '5')[0].text, /an allen 25 Befragten.*alle Befragten 100 %/);
  assert.match(checkP1(tables, joint, '16,7', '1')[0].text, /pe01 3–4.*andere Zelle/);
  assert.match(checkP1(tables, joint, '28,6', '2')[0].text, /pe05 1–2.*Lies pe05 noch einmal/);
  assert.match(checkP1(tables, joint, '41,7', '99')[0].text, /finde ich unter den gut 1\.800/);
  assert.deepEqual(checkP1(tables, joint, '', ''), []);
});

test('finds the way behind a number, merging mirror twins and silent else=0 variants', () => {
  const hits = lookup(tables, 500 / 6, 5);
  assert.equal(shortcut(hits[0].table.way), 'pe01 1–2 · 91');
  // In so kleinen Daten passt dieselbe Zahl zufällig auch zu pe01 3 (Wählende) – aber nie doppelt über wirkungslose Entscheidungen.
  assert.deepEqual(hits.map(h => `${shortcut(h.table.way)} ${h.cell} ${h.base}`), ['pe01 1–2 · 91 a col', 'pe01 3 · 91 b row', 'pe01 3 · 91 c col']);
  assert.equal(shortcut({ item: 'pe05', distrust: [3, 4], nonvote: [-8, -7], else0: false, weighted: true }), 'pe05↺ 1–2 · 91+wn+vw · gewichtet');
});

test('checks three denominators and the own reading', () => {
  assert.deepEqual(checkP2(tables, joint, { rowDistrust: '33,3', rowOthers: '10', total: '20' }).map(n => n.tone), ['ok', 'ok', 'ok']);
  assert.match(checkP2(tables, joint, { rowDistrust: '83,3', rowOthers: '', total: '' })[0].text, /unter den 6.*andere Basis/);
  const p3 = { item: 'pe01' as const, distrust: [1, 2], nonvote: [-8], weighted: false, rowDistrust: '41,2', rowOthers: '10,0', n: '7' };
  assert.match(checkP3(tables, joint, p3).at(-1)!.text, /Stimmt für deine Lesart pe01 1–2 · 91\+wn/);
  assert.match(checkP3(tables, joint, { ...p3, rowDistrust: '33,3', n: '5' }).at(-1)!.text, /untag_na\(\) vergessen/);
  assert.match(checkP3(tables, joint, { ...p3, nonvote: [] }).at(0)!.text, /genau der Weg des Parteivorstands/);
  assert.match(checkP3(tables, joint, { ...p3, item: 'pe05', distrust: [1, 2] })[0].text, /Misst deine Gruppe wirklich Misstrauen/);
  assert.equal(readings(joint).length, 18);
});

test('asks at most three questions and builds the plenum card', () => {
  const s = { ...initialS04(), guess: 'Nichtwähler', verdict: 2, reason: 'weil Misstrauen abhält', sentence: 'Von denen …',
    p3: { item: 'pe01' as const, distrust: [1, 2], nonvote: [], weighted: false, rowDistrust: '33,3', rowOthers: '10', n: '5' } };
  const q = questions(joint, s);
  assert.deepEqual(q.map(x => x.id), ['causal', 'dk', 'size']);
  assert.match(q[1].text, /41,2 % der Misstrauenden nicht wählen statt 33,3 %/);
  assert.deepEqual(plenumLines(s)[1], ['Meine Lesart', 'pe01 1–2 · 91']);
  assert.deepEqual(plenumLines(s)[2], ['Misstrauende · Übrige (nicht wählen)', '33,3 % · 10,0 %']);
  assert.equal(plenumLines(s)[3][1], 'irreführend');
});

test('writes R code for the own reading', () => {
  assert.equal(rCodeFor({ item: 'pe05', distrust: [3, 4], nonvote: [-8], else0: false, weighted: false }), [
    'allbus <- allbus %>%', '  mutate(', '    pe05_r = rec(pe05, rules = "rev"),   # umgepolt: jetzt 1 = stimme gar nicht zu',
    '    misstrauen3 = rec(pe05_r, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),',
    '    nichtwahl3  = rec(untag_na(pv01), rules = "91=1 [würde nicht wählen]; -8=1; 1:90=0 [würde wählen]; else=NA")',
    '  )', 'allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row") %>% summary()',
  ].join('\n'));
  assert.match(rCodeFor({ item: 'pa35', distrust: [1, 3], nonvote: [], else0: false, weighted: true }),
    /rec\(pa35, rules = "1=1 \[misstraut\]; 3=1; 2=0 \[misstraut nicht\]; 4:5=0; else=NA"\)[\s\S]*rec\(pv01, rules = "91=1 \[würde nicht wählen\]; 1:90=0[\s\S]*weights = wghtpew/);
});

test('counts the distrust stairs and checks the top step', () => {
  const real = fixtureSav(), steps = stairs(real);
  assert.deepEqual(steps.map(s => s.step), [0, 1, 2, 3]);
  const top = steps[3];
  assert.match(checkExtra(real, top.share.toFixed(1).replace('.', ','))[0].text, /Stimmt/);
});

test('restores state defensively and reports status', () => {
  assert.deepEqual(parseS04(null), initialS04());
  const s = parseS04({ verdict: 9, p3: { item: 'pa35', distrust: [1, 9, 'x'], nonvote: [-8, -50] }, p1: { pct: 87 } });
  assert.equal(s.verdict, null);
  assert.deepEqual(s.p3.distrust, [1]);
  assert.deepEqual(s.p3.nonvote, [-8]);
  assert.equal(s.p1.pct, '');
  assert.equal(statusS04(initialS04()), 'open');
  assert.equal(statusS04({ ...initialS04(), guess: 'x' }), 'running');
  assert.equal(statusS04({ ...initialS04(), p1: { pct: '87', n: '127' }, p2: { rowDistrust: '6,5', rowOthers: '', total: '' },
    p3: { ...initialS04().p3, rowDistrust: '21,5' }, verdict: 2, sentence: 'Satz' }), 'done');
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s04-nenner-check/domain.test.ts`
Expected: FAIL (`Cannot find module './domain'`).

- [ ] **Step 3: Inhalte** – `src/tasks/s04-nenner-check/content.ts`:

```ts
import type { Hint } from '../kit/HintLadder';

export type ItemId = 'pe01' | 'pa35' | 'pe05';
export type Category = { code: number; label: string };
export type Item = {
  id: ItemId;
  title: string;
  statement: string;
  categories: Category[];
  /** Zustimmung heißt hier Vertrauen: vor dem Zusammenfassen umpolen. */
  reversed: boolean;
  /** Misstrauen eng bzw. weit gefasst, in den Originalcodes. */
  strict: number[];
  wide: number[];
};

const agree4: Category[] = [
  { code: 1, label: 'stimme voll zu' }, { code: 2, label: 'stimme eher zu' },
  { code: 3, label: 'stimme eher nicht zu' }, { code: 4, label: 'stimme gar nicht zu' },
];

export const ITEM_IDS = ['pe01', 'pa35', 'pe05'] as const;
export const ITEMS: Record<ItemId, Item> = {
  pe01: {
    id: 'pe01', title: 'Politiker kümmern sich nicht um Leute wie mich',
    statement: '„Die Politiker kümmern sich nicht viel darum, was Leute wie ich denken.“',
    categories: agree4, reversed: false, strict: [1], wide: [1, 2],
  },
  pa35: {
    id: 'pa35', title: 'Politiker vertreten nur die Reichen',
    statement: '„Politiker vertreten nur die Interessen der Reichen.“',
    categories: [
      { code: 1, label: 'stimme voll zu' }, { code: 2, label: 'stimme eher zu' }, { code: 3, label: 'teils/teils' },
      { code: 4, label: 'lehne eher ab' }, { code: 5, label: 'lehne ganz ab' },
    ],
    reversed: false, strict: [1], wide: [1, 2],
  },
  pe05: {
    id: 'pe05', title: 'Politiker vertreten die Interessen der Bevölkerung',
    statement: '„Die Politiker vertreten die Interessen der Bevölkerung.“',
    categories: agree4, reversed: true, strict: [4], wide: [3, 4],
  },
};

/** Fehlende Angaben der Wahlabsicht, die man als Nichtwahl zählen kann. */
export const NONVOTE_EXTRAS = [
  { code: -8, short: 'wn', label: '„weiß nicht“' },
  { code: -7, short: 'vw', label: '„verweigert“' },
  { code: -9, short: 'ka', label: '„keine Angabe“' },
] as const;
export const NOT_ELIGIBLE = -50;

export const PRESS_RELEASE = '„Wer Politikern misstraut, geht gar nicht mehr wählen. Die Zahlen sind eindeutig: 87 Prozent der Nichtwähler sagen, dass sich Politiker nicht darum kümmern, was Leute wie sie denken. (Quelle: ALLBUS 2023)“';
export const CLAIMED = 87;

export const R_SETUP = `library(dplyr)
library(mariposa)   # zuletzt laden: haven würde sonst read_spss() überdecken

allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav`;

export const R_P1 = `${R_SETUP}

# Prüfauftrag 1 · Zahl nachbauen: zwei Dummyvariablen (Kategorien zusammenfassen)
allbus <- allbus %>%
  mutate(
    misstrauen = rec(pe01, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl  = rec(pv01, rules = "91=1 [würde nicht wählen]; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "col") %>% summary()`;

export const R_P2 = `# Prüfauftrag 2 · Eine Zelle, drei Nenner
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "all") %>% summary()
allbus %>% chi_square(misstrauen, nichtwahl)   # Wiederholung, freiwillig`;

export const R_P3_EXAMPLE = `# Prüfauftrag 3 · Beispiel-Lesart: Gegenprobe pe05 (umpolen), „weiß nicht“ zählt als Nichtwahl
allbus <- allbus %>%
  mutate(
    pe05_r      = rec(pe05, rules = "rev"),   # jetzt 1 = stimme gar nicht zu, wie bei pe01: 1 = Misstrauen
    misstrauen3 = rec(pe05_r, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl3  = rec(untag_na(pv01),
                      rules = "91=1 [würde nicht wählen]; -8=1; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row") %>% summary()`;

export const R_EXTRA = `# Zusatz · Misstrauens-Zähler: Rechnen innerhalb einer Person
allbus <- allbus %>%
  mutate(
    m_pe01 = rec(pe01, rules = "1:2=1; 3:4=0; else=NA"),
    m_pa35 = rec(pa35, rules = "1:2=1; 3:5=0; else=NA"),
    m_pe05 = rec(pe05, rules = "3:4=1; 1:2=0; else=NA"),   # umgepolt: nicht zustimmen = Misstrauen
    misstrauen_zahl = row_sums(pick(m_pe01, m_pa35, m_pe05), min_valid = 3),
    nichtwahl = rec(pv01, rules = "91=1 [würde nicht wählen]; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen_zahl, nichtwahl, percentages = "row") %>% summary()`;

export const R_SOLUTION = `${R_P1}\n\n${R_P2}\n\n${R_P3_EXAMPLE}\n\n${R_EXTRA}\n`;

export const hints: Record<'p1' | 'p2' | 'p3' | 'extra', Hint> = {
  p1: {
    think: 'Zwei Merkmale mit je zwei Ausprägungen: Du brauchst zwei Variablen mit 0 und 1. Wer ist in der Pressemitteilung 100 %?',
    pointer: 'rec() fasst Kategorien zusammen, crosstab() zeigt die Prozente – mit percentages = "row", "col" oder "all" legst du fest, wer 100 % ist.',
    concept: { id: 'recode', label: 'Rekodieren' },
    workshop: '5 Datenaufbereitung (rec) · 7 Bivariate Analyse (crosstab)',
    scaffold: 'allbus <- allbus %>%\n  mutate(\n    misstrauen = rec(pe01, rules = "___=1 [misstraut]; ___=0 [misstraut nicht]; else=NA"),\n    nichtwahl  = rec(pv01, rules = "___=1 [würde nicht wählen]; ___=0 [würde wählen]; else=NA")\n  )\nallbus %>% crosstab(misstrauen, nichtwahl, percentages = "___") %>% summary()',
    solution: R_P1,
  },
  p2: {
    think: 'Dieselben Menschen in derselben Zelle – nur der Nenner wechselt. Wer ist jetzt 100 %?',
    pointer: 'percentages = "all" zeigt Zeilen-, Spalten- und Gesamtprozente zugleich.',
    concept: { id: 'crosstab', label: 'Kreuztabelle' },
    workshop: '7 Bivariate Analyse (crosstab)',
    scaffold: 'allbus %>% crosstab(misstrauen, nichtwahl, percentages = "___") %>% summary()',
    solution: R_P2,
  },
  p3: {
    think: 'Wer pe05 zustimmt, vertraut – oder misstraut? Und: −8 ist ein getaggtes NA; rec() sieht es erst nach untag_na().',
    pointer: 'rules = "rev" dreht eine Skala um; untag_na() holt fehlende Codes als Zahlen zurück.',
    concept: { id: 'missing_tools', label: 'Missing-Codes aufbereiten' },
    workshop: '4 Daten einlesen und fehlende Werte',
    scaffold: 'allbus <- allbus %>%\n  mutate(\n    pe05_r      = rec(pe05, rules = "___"),\n    misstrauen3 = rec(pe05_r, rules = "___=1 [misstraut]; ___=0 [misstraut nicht]; else=NA"),\n    nichtwahl3  = rec(untag_na(pv01), rules = "91=1; ___=1; 1:90=0; else=NA")\n  )\nallbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "___") %>% summary()',
    solution: R_P3_EXAMPLE,
  },
  extra: {
    think: 'Jede Person bekommt drei Nullen oder Einsen – die Summe zählt, wie vielen Aussagen sie misstrauisch zustimmt.',
    pointer: 'row_sums() rechnet innerhalb einer Zeile; mit min_valid = 3 zählt nur, wer alle drei beantwortet hat.',
    concept: { id: 'dummy', label: 'Dummyvariablen' },
    scaffold: 'allbus <- allbus %>%\n  mutate(\n    m_pe01 = rec(pe01, rules = "1:2=1; 3:4=0; else=NA"),\n    m_pa35 = rec(pa35, rules = "___"),\n    m_pe05 = rec(pe05, rules = "___"),\n    misstrauen_zahl = row_sums(pick(m_pe01, m_pa35, m_pe05), min_valid = ___)\n  )',
    solution: R_EXTRA,
  },
};

/** Typische Ursachen hinter „Das wollte ich anders“. */
export const CAUSES = [
  'untag_na() vergessen: rec() lässt getaggte fehlende Werte wie −8 stehen – deine Regel „-8=1“ greift dann nicht.',
  'haven nach mariposa geladen: haven::read_spss() überdeckt dann mariposa::read_spss(), die fehlenden Codes sind weg. Lade mariposa zuletzt.',
  'Kopierte Regel: pe05 misst Vertrauen. Ohne rules = "rev" zählst du Vertrauende als Misstrauende.',
  'else=0 statt else=NA: Dann zählen auch Nicht-Wahlberechtigte und fehlende Angaben als „würde wählen“.',
  'Falsche Zeile abgelesen: In einer Vierfeldertafel stehen vier Zellen – prüfe, ob deine Zelle misstraut & nicht wählen ist.',
];
```

- [ ] **Step 4: Prüflogik** – `src/tasks/s04-nenner-check/domain.ts`:

```ts
import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, near, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { CLAIMED, ITEM_IDS, ITEMS, NONVOTE_EXTRAS, NOT_ELIGIBLE, type ItemId } from './content';

/** Ein Rechenweg: welche Antworten als Misstrauen zählen, welche fehlenden Angaben als Nichtwahl, else=0, Gewicht. */
export type Way = { item: ItemId; distrust: number[]; nonvote: number[]; else0: boolean; weighted: boolean };
/** a: misstraut & nicht wählen · b: misstraut & wählen · c: übrige & nicht wählen · d: übrige & wählen */
export type Cell = 'a' | 'b' | 'c' | 'd';
export type Base = 'row' | 'col' | 'all';
export type Four = Record<Cell, number>;
export type WayTable = { way: Way; n: Four; w: Four };
export type Joint = Record<ItemId, Map<string, { item: number; vote: number; n: number; w: number }>>;

export const PARTY: Way = { item: 'pe01', distrust: [1, 2], nonvote: [], else0: false, weighted: false };
const CELLS: Cell[] = ['a', 'b', 'c', 'd'];
const zero = (): Four => ({ a: 0, b: 0, c: 0, d: 0 });
const sameSet = (a: number[], b: number[]) => a.length === b.length && [...a].sort((x, y) => x - y).every((x, i) => x === [...b].sort((p, q) => p - q)[i]);

/** Zählt einmal je Item alle Kombinationen aus Antwort und Wahlabsicht (ungewichtet und mit wghtpew). */
export function prepare(sav: SavFile): Joint {
  const pv = sav.byName.get('pv01')!, weight = sav.byName.get('wghtpew');
  const out = {} as Joint;
  for (const id of ITEM_IDS) {
    const v = sav.byName.get(id)!, codes = ITEMS[id].categories.map(c => c.code), map = new Map<string, { item: number; vote: number; n: number; w: number }>();
    for (let i = 0; i < sav.nCases; i++) {
      const x = v.values[i], p = pv.values[i];
      if (!codes.includes(x) || Number.isNaN(p)) continue;
      const key = `${x}|${p}`, cell = map.get(key) ?? { item: x, vote: p, n: 0, w: 0 };
      cell.n += 1;
      cell.w += weight ? weight.values[i] : 1;
      map.set(key, cell);
    }
    out[id] = map;
  }
  return out;
}

/** Nichtwahl-Dummy wie rec(untag_na(pv01), "91=1; -8=1; 1:90=0; else=NA"): 1, 0 oder null (fällt heraus). */
function voteDummy(p: number, way: Way): 0 | 1 | null {
  if (p === 91 || way.nonvote.includes(p)) return 1;
  if (p >= 1 && p <= 90) return 0;
  return way.else0 ? 0 : null;
}

export function fourfold(joint: Joint, way: Way): WayTable {
  const n = zero(), w = zero();
  for (const c of joint[way.item].values()) {
    const y = voteDummy(c.vote, way);
    if (y === null) continue;
    const cell: Cell = way.distrust.includes(c.item) ? (y ? 'a' : 'b') : (y ? 'c' : 'd');
    n[cell] += c.n;
    w[cell] += c.w;
  }
  return { way, n, w };
}

/** Prozentwert einer Zelle bei gegebener Basis – wie crosstab(percentages = "row" | "col" | "all"). */
export function percent(t: WayTable, cell: Cell, base: Base): number {
  const f = t.way.weighted ? t.w : t.n;
  const den = base === 'all' ? f.a + f.b + f.c + f.d
    : base === 'row' ? (cell === 'a' || cell === 'b' ? f.a + f.b : f.c + f.d)
    : (cell === 'a' || cell === 'c' ? f.a + f.c : f.b + f.d);
  return 100 * f[cell] / den;
}
export const cellCount = (t: WayTable, cell: Cell) => (t.way.weighted ? Math.round(t.w[cell]) : t.n[cell]);

function subsets<T>(xs: readonly T[]): T[][] {
  return Array.from({ length: 1 << xs.length }, (_, m) => xs.filter((_, i) => m & (1 << i)));
}

/** Alle Wege: 58 Zweiteilungen der drei Items × 8 Nichtwahl-Definitionen × else=0 × Gewicht = 1.856 Vierfeldertafeln. */
export function allTables(joint: Joint): WayTable[] {
  const out: WayTable[] = [];
  for (const item of ITEM_IDS) {
    const codes = ITEMS[item].categories.map(c => c.code);
    for (const distrust of subsets(codes).filter(s => s.length > 0 && s.length < codes.length)) {
      for (const nonvote of subsets(NONVOTE_EXTRAS.map(e => e.code))) {
        for (const else0 of [false, true]) for (const weighted of [false, true]) out.push(fourfold(joint, { item, distrust, nonvote, else0, weighted }));
      }
    }
  }
  return out;
}

export type Candidate = { table: WayTable; cell: Cell; base: Base; pct: number; n: number; group: number[]; side: 0 | 1 };
const groupOf = (t: WayTable, cell: Cell) => {
  const codes = ITEMS[t.way.item].categories.map(c => c.code);
  return cell === 'a' || cell === 'b' ? [...t.way.distrust].sort((x, y) => x - y) : codes.filter(c => !t.way.distrust.includes(c));
};
const wayKey = (w: Way) => [w.item, [...w.distrust].sort((a, b) => a - b).join(','), [...w.nonvote].sort((a, b) => a - b).join(','), w.else0, w.weighted].join('|');
const meaningKey = (c: Candidate) =>
  [c.table.way.item, c.group.join(','), c.side, c.base, [...c.table.way.nonvote].sort((a, b) => a - b).join(','), c.table.way.else0, c.table.way.weighted].join('|');
const index = new WeakMap<WayTable[], Map<string, WayTable>>();

/** Einfachster Weg zur selben Zahl: Nichtwahl-Codes, else=0 und Gewicht fallen weg, wenn sie Prozentwert und Zellen-n nicht ändern. */
function canonical(tables: WayTable[], t: WayTable, cell: Cell, base: Base): WayTable {
  if (!index.has(tables)) index.set(tables, new Map(tables.map(x => [wayKey(x.way), x])));
  const byKey = index.get(tables)!;
  const same = (a: WayTable, b: WayTable) => Math.abs(percent(a, cell, base) - percent(b, cell, base)) < 1e-9 && cellCount(a, cell) === cellCount(b, cell);
  let cur = t;
  const lighter = (way: Way) => { const next = byKey.get(wayKey(way)); if (next && same(next, cur)) cur = next; };
  for (const code of t.way.nonvote) lighter({ ...cur.way, nonvote: cur.way.nonvote.filter(c => c !== code) });
  if (cur.way.else0) lighter({ ...cur.way, else0: false });
  if (cur.way.weighted) lighter({ ...cur.way, weighted: false });
  return cur;
}

/** Rückwärtssuche: Welche Zellen passen zu Prozentwert (±0,1; ganzzahlig ±0,55) und Zellen-n (gewichtet ±1)? */
export function lookup(tables: WayTable[], pct: number, n: number | null, integer = Number.isInteger(pct)): Candidate[] {
  const tol = integer ? 0.55 : 0.1, seen = new Map<string, Candidate>();
  for (const t of tables) for (const cell of CELLS) for (const base of ['row', 'col', 'all'] as Base[]) {
    const p = percent(t, cell, base), count = cellCount(t, cell);
    if (!near(pct, p, tol)) continue;
    if (n !== null && (t.way.weighted ? Math.abs(n - t.w[cell]) > 1 : n !== count)) continue;
    const table = canonical(tables, t, cell, base);
    const c: Candidate = { table, cell, base, pct: p, n: count, group: groupOf(table, cell), side: cell === 'a' || cell === 'c' ? 1 : 0 };
    const key = meaningKey(c);
    if (!seen.has(key)) seen.set(key, c);
  }
  return [...seen.values()];
}

const ranges = (codes: number[]) => {
  const s = [...codes].sort((a, b) => a - b), out: string[] = [];
  for (let i = 0; i < s.length;) {
    let j = i;
    while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
    out.push(j > i ? `${s[i]}–${s[j]}` : `${s[i]}`);
    i = j + 1;
  }
  return out.join(', ');
};
const labelsOf = (item: ItemId, codes: number[]) => ITEMS[item].categories.filter(c => codes.includes(c.code)).map(c => `„${c.label}“`).join(', ');
export const groupText = (item: ItemId, codes: number[]) => `${item} ${ranges(codes)} (${labelsOf(item, codes)})`;
const extrasText = (nonvote: number[]) => NONVOTE_EXTRAS.filter(e => nonvote.includes(e.code)).map(e => e.label).join(', ');
const sideText = (side: 0 | 1, way: Way) => side
  ? `nicht wählen wollen${way.nonvote.length ? ` (samt ${extrasText(way.nonvote)})` : ''}`
  : 'wählen wollen';
const count = (x: number) => Math.round(x).toLocaleString('de-DE');
const pctText = (x: number) => `${de(x)} %`;

/** Bedeutungssatz: Wer sind die 100 %? */
export function meaning(c: Candidate): string {
  const t = c.table, f = t.way.weighted ? t.w : t.n, way = t.way;
  const group = groupText(way.item, c.group), side = sideText(c.side, way);
  const groupN = c.cell === 'a' || c.cell === 'b' ? f.a + f.b : f.c + f.d, sideN = c.side ? f.a + f.c : f.b + f.d;
  const weighted = way.weighted ? ' (gewichtet)' : '';
  if (c.base === 'row') return `Deine ${pctText(c.pct)} sind der Anteil derer, die ${side}, unter den ${count(groupN)} Befragten mit ${group}${weighted}.`;
  if (c.base === 'col') return `Deine ${pctText(c.pct)} sind der Anteil der Befragten mit ${group} unter den ${count(sideN)}, die ${side}${weighted}.`;
  return `Deine ${pctText(c.pct)} sind der Anteil der Befragten mit ${group}, die ${side}, an allen ${count(f.a + f.b + f.c + f.d)} Befragten mit gültigen Angaben${weighted}.`;
}

/** Wegkürzel für Karte und Streifen, z. B. „pe05↺ 1–2 · 91+wn“. */
export function shortcut(way: Way): string {
  const item = ITEMS[way.item], codes = item.categories.map(c => c.code);
  const shown = item.reversed ? way.distrust.map(c => Math.max(...codes) + Math.min(...codes) - c) : way.distrust;
  const extras = NONVOTE_EXTRAS.filter(e => way.nonvote.includes(e.code)).map(e => `+${e.short}`).join('');
  return `${way.item}${item.reversed ? '↺' : ''} ${ranges(shown)} · 91${extras}${way.else0 ? ' · else=0' : ''}${way.weighted ? ' · gewichtet' : ''}`;
}

const isParty = (way: Way) => way.item === PARTY.item && sameSet(way.distrust, PARTY.distrust) && !way.nonvote.length && !way.else0;
/** Die Tabelle des Parteivorstands (auch mit vertauschten Zeilen), ungewichtet. */
const partyTable = (c: Candidate) => {
  const w = c.table.way;
  return w.item === 'pe01' && (sameSet(w.distrust, [1, 2]) || sameSet(w.distrust, [3, 4])) && !w.nonvote.length && !w.else0 && !w.weighted;
};
/** Misstrauende (pe01 1–2) unter bzw. mit „würde nicht wählen“. */
const partyCell = (c: Candidate) => c.group.join() === '1,2' && c.side === 1;
const sensible = (way: Way) => {
  const item = ITEMS[way.item];
  return !way.else0 && (sameSet(way.distrust, item.strict) || sameSet(way.distrust, item.wide));
};
const unreversedPe05 = (c: Candidate) => c.table.way.item === 'pe05' && c.group.every(x => x <= 2) && c.side === 1;
const notEligible = (joint: Joint, item: ItemId) => [...joint[item].values()].filter(c => c.vote === NOT_ELIGIBLE).reduce((a, c) => a + c.n, 0);

const CHECKLIST = 'Diese Zahl finde ich unter den gut 1.800 möglichen Vierfeldertafeln nicht. Prüfe: Hast du beide Dummys mit rec() gebildet (1 = misstraut, 1 = nicht wählen)? Stimmt die Prozentbasis? Hast du die Häufigkeit aus derselben Zelle abgeschrieben?';

/** Prüfauftrag 1: Zahl nachbauen. */
export function checkP1(tables: WayTable[], joint: Joint, pctIn: string, nIn: string): Note[] {
  const pct = parseNumber(pctIn);
  if (pct === null) return [];
  const n = parseNumber(nIn), cands = lookup(tables, pct, n === null ? null : n, !pctIn.includes(',') && !pctIn.includes('.'));
  if (!cands.length) return [{ tone: 'warn', text: CHECKLIST }];
  const expected = cands.find(c => c.table.way.item === 'pe01' && partyCell(c) && c.base === 'col' && !c.table.way.nonvote.length && !c.table.way.else0);
  if (expected && !expected.table.way.weighted) {
    return [{ tone: 'ok', text: `${meaning(expected)} Genau so hat der Parteivorstand gerechnet – die Zahl stimmt.${n === null ? ' Trag noch die Häufigkeit derselben Zelle ein.' : ''}` }];
  }
  if (expected) return [{ tone: 'ok', text: `${meaning(expected)} Gewichtet ist das vertretbar; der Parteivorstand hat ungewichtet gerechnet (${de(CLAIMED, 0)} %).` }];
  const ask = n === null && cands.length > 1 ? ' Trag die Häufigkeit derselben Zelle ein, dann kann ich genauer sagen, wie du gerechnet hast.' : '';
  const party = partyNote(cands);
  if (party) return [{ ...party, text: party.text + ask }];
  const defensible = cands.find(c => sensible(c.table.way) && c.cell === 'a' && c.base === 'col' && !unreversedPe05(c));
  if (defensible) return [{ tone: 'hint', text: `${meaning(defensible)} Vertretbar anders gerechnet: ${shortcut(defensible.table.way)}. Für den Nachbau der ${CLAIMED} % brauchst du pe01 1–2 und nur „würde nicht wählen“ (91).${ask}` }];
  const trap = trapNote(cands, joint);
  if (trap) return [{ ...trap, text: trap.text + ask }];
  const shown = cands.slice(0, 3).map(meaning);
  return [{ tone: 'hint', text: (shown.length > 1 ? `Deine Zahl passt zu mehreren Wegen: ${shown.join(' – ')}` : shown[0]) + ask }];
}

/** Fehler in der Tabelle des Parteivorstands: vertauschter Nenner, alle als 100 %, andere Zelle. */
function partyNote(cands: Candidate[]): Note | null {
  const party = cands.filter(partyTable);
  const swapped = party.find(c => partyCell(c) && c.base === 'row');
  if (swapped) return { tone: 'warn', text: `${meaning(swapped)} Der Nenner ist vertauscht: Die Pressemitteilung spricht vom Anteil unter den Nichtwählenden.` };
  const total = party.find(c => partyCell(c) && c.base === 'all');
  if (total) return { tone: 'warn', text: `${meaning(total)} Hier sind alle Befragten 100 % – die Pressemitteilung meint nur die Nichtwählenden.` };
  const other = party.find(c => !partyCell(c));
  if (other) return { tone: 'warn', text: `${meaning(other)} Das ist eine andere Zelle der Tabelle – gesucht ist „misstraut“ und „würde nicht wählen“.` };
  return null;
}

function trapNote(cands: Candidate[], joint: Joint): Note | null {
  const pe05 = cands.find(unreversedPe05);
  if (pe05) return { tone: 'warn', text: `${meaning(pe05)} Bei dir zählen Zustimmende als Misstrauende – aber pe05 fragt, ob Politiker die Interessen der Bevölkerung vertreten. Lies pe05 noch einmal.` };
  const else0 = cands.find(c => c.table.way.else0);
  if (else0) return { tone: 'warn', text: `${meaning(else0)} Mit else=0 zählen bei dir auch ${count(notEligible(joint, else0.table.way.item))} Nicht-Wahlberechtigte und weitere fehlende Angaben als Wählende.` };
  return null;
}

/** Prüfauftrag 2: dieselbe Zelle mit drei Nennern. */
export function checkP2(tables: WayTable[], joint: Joint, p2: S04State['p2']): Note[] {
  const party = fourfold(joint, PARTY);
  const want: [keyof S04State['p2'], number, string][] = [
    ['rowDistrust', percent(party, 'a', 'row'), 'Von den Misstrauenden wollen so viele nicht wählen.'],
    ['rowOthers', percent(party, 'c', 'row'), 'Von den Übrigen wollen so viele nicht wählen.'],
    ['total', percent(party, 'a', 'all'), 'So groß ist die Zelle, gemessen an allen Befragten.'],
  ];
  const notes: Note[] = [];
  for (const [key, target, ok] of want) {
    const x = parseNumber(p2[key]);
    if (x === null) continue;
    const integer = !p2[key].includes(',') && !p2[key].includes('.');
    if (near(x, target, integer ? 0.55 : 0.1)) { notes.push({ tone: 'ok', text: `${pctText(target)} – stimmt. ${ok}` }); continue; }
    const hit = lookup(tables, x, null, integer).find(partyTable);
    notes.push({ tone: 'warn', text: hit ? `${meaning(hit)} Gesucht war hier eine andere Basis.` : 'Diese Zahl finde ich in der Tabelle aus Prüfauftrag 1 nicht. Hast du dieselben Dummys verwendet?' });
  }
  return notes;
}

/** Das Nenner-Bild: dieselbe Zelle in drei Nennern. */
export function denominators(joint: Joint) {
  const f = fourfold(joint, PARTY).n;
  return { cell: f.a, nonvoters: f.a + f.c, distrusting: f.a + f.b, all: f.a + f.b + f.c + f.d };
}

/** Die 18 vorbereiteten Lesarten: drei Items × eng/weit × Nichtwahl {91; +weiß nicht; +verweigert}, ungewichtet. */
export function readings(joint: Joint): { way: Way; distrusting: number; others: number }[] {
  const out: { way: Way; distrusting: number; others: number }[] = [];
  for (const item of ITEM_IDS) for (const distrust of [ITEMS[item].strict, ITEMS[item].wide]) for (const nonvote of [[], [-8], [-8, -7]]) {
    const t = fourfold(joint, { item, distrust, nonvote, else0: false, weighted: false });
    out.push({ way: t.way, distrusting: percent(t, 'a', 'row'), others: percent(t, 'c', 'row') });
  }
  return out;
}

export const declaredWay = (p3: S04State['p3']): Way => ({ item: p3.item, distrust: p3.distrust, nonvote: p3.nonvote, else0: false, weighted: p3.weighted });

/** Prüfauftrag 3: eigene Lesart. */
export function checkP3(tables: WayTable[], joint: Joint, p3: S04State['p3']): Note[] {
  const way = declaredWay(p3), item = ITEMS[p3.item], codes = item.categories.map(c => c.code);
  const notes: Note[] = [];
  if (!p3.distrust.length || p3.distrust.length === codes.length) return [{ tone: 'hint', text: 'Wähle, welche Antworten als Misstrauen zählen – nicht alle und nicht keine.' }];
  if (item.reversed && p3.distrust.every(c => c <= 2)) notes.push({ tone: 'warn', text: 'Wer pe05 zustimmt, sagt: Politiker vertreten die Interessen der Bevölkerung. Misst deine Gruppe wirklich Misstrauen?' });
  if (isParty(way) && !way.weighted) notes.push({ tone: 'hint', text: 'Das ist genau der Weg des Parteivorstands. Ändere mindestens eine Entscheidung: Item, Grenze, „weiß nicht“ oder Gewicht.' });
  const t = fourfold(joint, way);
  const a = parseNumber(p3.rowDistrust), c = parseNumber(p3.rowOthers), n = parseNumber(p3.n);
  if (a === null) return notes;
  const tol = (s: string) => (!s.includes(',') && !s.includes('.') ? 0.55 : 0.1);
  const okA = near(a, percent(t, 'a', 'row'), tol(p3.rowDistrust)), okC = c === null || near(c, percent(t, 'c', 'row'), tol(p3.rowOthers));
  const okN = n === null || (way.weighted ? Math.abs(n - t.w.a) <= 1 : n === t.n.a);
  if (okA && okC && okN) {
    notes.push({ tone: 'ok', text: `Stimmt für deine Lesart ${shortcut(way)}: Von den Misstrauenden wollen ${pctText(percent(t, 'a', 'row'))} nicht wählen, von den Übrigen ${pctText(percent(t, 'c', 'row'))}.` });
    return notes;
  }
  const found = lookup(tables, a, n, tol(p3.rowDistrust) > 0.1).filter(x => x.base === 'row');
  const forgotUntag = found.find(x => x.table.way.item === way.item && sameSet(x.group, [...way.distrust].sort((p, q) => p - q)) && !x.table.way.nonvote.length && way.nonvote.length);
  if (forgotUntag) notes.push({ tone: 'warn', text: `${meaning(forgotUntag)} Deine „weiß nicht“-Regel greift nicht: untag_na() vergessen? rec() lässt getaggte fehlende Werte stehen.` });
  else if (found[0]) notes.push({ tone: 'warn', text: `${meaning(found[0])} Das ist nicht die Lesart, die du oben festgelegt hast (${shortcut(way)}).` });
  else notes.push({ tone: 'warn', text: `Diese Zahl passt nicht zu deiner Lesart ${shortcut(way)}. Prüfe Umpolen, Grenze und die Nichtwahl-Regel.` });
  return notes;
}

/** Zusatz: Misstrauens-Zähler – Nichtwahl-Anteil je Stufe (0–3 misstrauische Antworten). */
export function stairs(sav: SavFile): { step: number; n: number; share: number }[] {
  const get = (name: string) => sav.byName.get(name)!;
  const pe01 = get('pe01'), pa35 = get('pa35'), pe05 = get('pe05'), pv = get('pv01');
  const dummy = (v: typeof pe01, yes: number[], no: number[], i: number) => (yes.includes(v.values[i]) ? 1 : no.includes(v.values[i]) ? 0 : null);
  const out = [0, 1, 2, 3].map(step => ({ step, n: 0, yes: 0 }));
  for (let i = 0; i < sav.nCases; i++) {
    const ds = [dummy(pe01, [1, 2], [3, 4], i), dummy(pa35, [1, 2], [3, 4, 5], i), dummy(pe05, [3, 4], [1, 2], i)];
    const y = voteDummy(pv.values[i], PARTY);
    if (ds.some(d => d === null) || y === null) continue;
    const k = ds.reduce<number>((s, d) => s + (d ?? 0), 0);
    out[k].n += 1;
    out[k].yes += y;
  }
  return out.map(o => ({ step: o.step, n: o.n, share: 100 * o.yes / o.n }));
}

export function checkExtra(sav: SavFile, input: string): Note[] {
  const x = parseNumber(input);
  if (x === null) return [];
  const top = stairs(sav)[3];
  return near(x, top.share, !input.includes(',') && !input.includes('.') ? 0.55 : 0.1)
    ? [{ tone: 'ok', text: `Stimmt: Von den ${count(top.n)}, die allen drei Aussagen misstrauisch zustimmen, wollen ${pctText(top.share)} nicht wählen – die übrigen ${pctText(100 - top.share)} wollen wählen.` }]
    : [{ tone: 'warn', text: 'Das ist nicht die oberste Stufe. Lies in der Zeile misstrauen_zahl = 3 den Anteil „würde nicht wählen“ ab.' }];
}

/* ---------- Urteil, Gegenfragen, Zustand ---------- */

export const VERDICTS = ['stimmt', 'stimmt teilweise', 'irreführend', 'falsch', 'mit diesen Daten nicht prüfbar'] as const;
export const CAUSAL_WORDS = /\b(weil|deshalb|daher|darum|führt|führen|verursach\w*|liegt an|wegen|Grund|bewirk\w*|abhält|hält\s+ab)\b/i;
export type Question = { id: string; title: string; text: string; concept?: string };

export function questions(joint: Joint, s: S04State): Question[] {
  const out: Question[] = [];
  if (CAUSAL_WORDS.test(`${s.reason} ${s.sentence}`)) {
    out.push({ id: 'causal', title: 'Du nennst eine Ursache.', concept: 'causality',
      text: 'Zeigen die Daten, dass Misstrauen vom Wählen abhält – oder nur, dass beides zusammen auftritt? Denk an Drittvariablen wie Alter, Bildung oder politisches Interesse und an die umgekehrte Richtung.' });
  }
  const way = declaredWay(s.p3), dk = way.nonvote.includes(-8);
  if (way.distrust.length) {
    const now = percent(fourfold(joint, way), 'a', 'row');
    const alt = percent(fourfold(joint, { ...way, nonvote: dk ? way.nonvote.filter(c => c !== -8) : [...way.nonvote, -8] }), 'a', 'row');
    out.push({ id: 'dk', title: 'Was ist mit „weiß nicht“?', concept: 'missing_tools',
      text: dk
        ? `Du zählst „weiß nicht“ als Nichtwahl. Ohne sie wollen ${pctText(alt)} der Misstrauenden nicht wählen statt ${pctText(now)}. Ist Unentschlossenheit schon Nichtwahl?`
        : `Zählst du „weiß nicht“ als Nichtwahl, wollen ${pctText(alt)} der Misstrauenden nicht wählen statt ${pctText(now)}. Was bedeutet „weiß nicht“ bei einer Wahlabsicht?` });
  }
  const d = denominators(joint);
  out.push({ id: 'size', title: 'Wie viele Menschen stehen hinter der Zahl?', concept: 'sampling',
    text: `Hinter den ${CLAIMED} % stehen ${count(d.nonvoters)} Nichtwählende, in der Zelle ${count(d.cell)} Menschen. Wie sicher ist eine Aussage über alle Nichtwähler in Deutschland auf dieser Grundlage?` });
  out.push({ id: 'intention', title: 'Absicht ist nicht Verhalten.', concept: 'measurement_error',
    text: 'Die Daten zeigen eine Wahlabsicht, keine tatsächliche Wahl. Was kann zwischen Befragung und Wahltag passieren – und wie offen antwortet man auf die Frage, ob man wählen geht?' });
  return out.slice(0, 3);
}

export type S04State = {
  mode: WorkMode;
  guess: string;
  p1: { pct: string; n: string };
  p2: { rowDistrust: string; rowOthers: string; total: string };
  p3: { item: ItemId; distrust: number[]; nonvote: number[]; weighted: boolean; rowDistrust: string; rowOthers: string; n: string };
  verdict: number | null;
  reason: string;
  sentence: string;
  extra: string;
};

export const initialS04 = (): S04State => ({
  mode: 'solo', guess: '', p1: { pct: '', n: '' }, p2: { rowDistrust: '', rowOthers: '', total: '' },
  p3: { item: 'pe05', distrust: [3, 4], nonvote: [-8], weighted: false, rowDistrust: '', rowOthers: '', n: '' },
  verdict: null, reason: '', sentence: '', extra: '',
});

const codeList = (x: unknown, allowed: number[]) => (Array.isArray(x) ? [...new Set(x.filter((c): c is number => allowed.includes(c as number)))] : []);

export function parseS04(raw: unknown): S04State {
  const r = record(raw), p1 = record(r.p1), p2 = record(r.p2), p3 = record(r.p3), init = initialS04();
  const item = oneOf(p3.item, ITEM_IDS, init.p3.item);
  const verdict = typeof r.verdict === 'number' && Number.isInteger(r.verdict) && r.verdict >= 0 && r.verdict < VERDICTS.length ? r.verdict : null;
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'), guess: str(r.guess, 300),
    p1: { pct: str(p1.pct, 12), n: str(p1.n, 12) },
    p2: { rowDistrust: str(p2.rowDistrust, 12), rowOthers: str(p2.rowOthers, 12), total: str(p2.total, 12) },
    p3: {
      item, distrust: 'distrust' in p3 ? codeList(p3.distrust, ITEMS[item].categories.map(c => c.code)) : init.p3.distrust,
      nonvote: 'nonvote' in p3 ? codeList(p3.nonvote, NONVOTE_EXTRAS.map(e => e.code)) : init.p3.nonvote,
      weighted: bool(p3.weighted), rowDistrust: str(p3.rowDistrust, 12), rowOthers: str(p3.rowOthers, 12), n: str(p3.n, 12),
    },
    verdict, reason: str(r.reason, 600), sentence: str(r.sentence, 600), extra: str(r.extra, 12),
  };
}

export function statusS04(s: S04State): TaskStatus {
  if (s.p1.pct.trim() && s.p2.rowDistrust.trim() && s.p3.rowDistrust.trim() && s.verdict !== null && s.sentence.trim()) return 'done';
  const texts = [s.guess, s.p1.pct, s.p1.n, s.p2.rowDistrust, s.p2.rowOthers, s.p2.total, s.p3.rowDistrust, s.p3.rowOthers, s.p3.n, s.reason, s.sentence, s.extra];
  return texts.some(t => t.trim()) || s.verdict !== null ? 'running' : 'open';
}

export function plenumLines(s: S04State): [string, string][] {
  const a = parseNumber(s.p3.rowDistrust), c = parseNumber(s.p3.rowOthers);
  return [
    ['Die 87 % beziehen sich auf alle, die …', s.guess.trim()],
    ['Meine Lesart', s.p3.rowDistrust.trim() ? shortcut(declaredWay(s.p3)) : ''],
    ['Misstrauende · Übrige (nicht wählen)', a === null ? '' : `${de(a)} % · ${c === null ? '–' : `${de(c)} %`}`],
    ['Urteil', s.verdict === null ? '' : VERDICTS[s.verdict]],
    ['Faktencheck-Satz', s.sentence.trim()],
  ];
}

/** R-Code der eigenen Lesart (Hilfestufe 4 in Prüfauftrag 3). */
export function rCodeFor(way: Way): string {
  const item = ITEMS[way.item], codes = item.categories.map(c => c.code);
  const shown = item.reversed ? way.distrust.map(c => Math.max(...codes) + Math.min(...codes) - c) : way.distrust;
  const rest = codes.filter(c => !shown.includes(c));
  const rule = (xs: number[], value: number, label: string) => ranges(xs).split(', ').map((r, i) => `${r.replace('–', ':')}=${value}${i === 0 ? ` [${label}]` : ''}`).join('; ');
  const source = item.reversed ? `${way.item}_r` : way.item;
  const extras = NONVOTE_EXTRAS.filter(e => way.nonvote.includes(e.code)).map(e => `${e.code}=1; `).join('');
  const lines = [
    'allbus <- allbus %>%',
    '  mutate(',
    ...(item.reversed ? [`    ${way.item}_r = rec(${way.item}, rules = "rev"),   # umgepolt: jetzt 1 = stimme gar nicht zu`] : []),
    `    misstrauen3 = rec(${source}, rules = "${rule(shown, 1, 'misstraut')}; ${rule(rest, 0, 'misstraut nicht')}; else=NA"),`,
    `    nichtwahl3  = rec(${way.nonvote.length ? 'untag_na(pv01)' : 'pv01'}, rules = "91=1 [würde nicht wählen]; ${extras}1:90=0 [würde wählen]; else=NA")`,
    '  )',
    `allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row"${way.weighted ? ', weights = wghtpew' : ''}) %>% summary()`,
  ];
  return lines.join('\n');
}
```

- [ ] **Step 5: Tests laufen lassen**

Run: `node --import tsx --test src/tasks/s04-nenner-check/domain.test.ts` → `# pass 8`, `# fail 0`.
Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit` → `# pass 176`, `# fail 0`, `# skipped 4`; tsc ohne Ausgabe.

- [ ] **Step 6: Commit**

```bash
git add src/tasks/s04-nenner-check
git commit -m "Add session 4 domain: fourfold tables, reverse lookup, checks, questions"
```

---
### Task 4: Sitzung 4 – Oberfläche, Anmeldung und Abschied von der Mission

**Files:**
- Create: `src/tasks/s04-nenner-check/Charts.tsx`, `src/tasks/s04-nenner-check/NennerCheck.tsx`, `src/tasks/s04-nenner-check/index.ts`
- Test: `src/tasks/s04-nenner-check/task.test.ts`
- Modify: `src/tasks/registry.ts`, `src/domain/curriculum.ts`, `src/domain/curriculum.test.ts`, `src/components/LearningPath.tsx`, `src/tasks/testRender.ts`, `src/sandbox/allbus.ts`, `src/sandbox/allbus.test.ts`, `src/tasks/s01-schon-gefragt/task.test.ts`, `src/tasks/s02-datenerfassung/task.test.ts`, `src/tasks/s03-stuehle/task.test.ts`, `src/tasks.css`
- Delete: `scripts/export-sandbox-grid.ts`, `scripts/verify-sandbox-r.R`, `src/sandbox/allbus.local.test.ts`, `src/sandbox/analysis.test.ts`, `src/sandbox/analysis.ts`, `src/sandbox/claims.test.ts`, `src/sandbox/claims.ts`, `src/sandbox/format.ts`, `src/sandbox/multiverse.test.ts`, `src/sandbox/multiverse.ts`, `src/sandbox/questions.test.ts`, `src/sandbox/questions.ts`, `src/sandbox/rcode.test.ts`, `src/sandbox/rcode.ts`, `src/sandbox/state.test.ts`, `src/sandbox/state.ts`, `src/sandbox/ui/ClaimWorkspace.tsx`, `src/sandbox/ui/Decompose.tsx`, `src/sandbox/ui/LiveTable.tsx`, `src/sandbox/ui/Mirror.tsx`, `src/sandbox/ui/Questions.tsx`, `src/sandbox/ui/Verdict.tsx`, `src/sandbox/ui/Workbench.tsx`, `src/sandbox/workspace.test.ts`

**Interfaces:**
- Consumes: alles aus Task 3; `TaskProps`, `TaskDef` (types); Kit-Bausteine `Feedback`, `HintLadder`, `PartnerToggle`, `PlenumCard`, `RBlock`, `RoleBrief`.
- Produces: `nennerCheck: TaskDef<S04State>` (id `s04`); `Session` ohne `mission`; `renderSession(sessionIndex, withData = true, tasks = { tasks: {} })` (dritter Parameter jetzt der Aufgaben-Speicher); `LearningPath` ohne `initialStore`.

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s04-nenner-check/task.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession, testData } from '../testRender';
import { fourfold, initialS04, PARTY, percent, prepare } from './domain';

const joint = prepare(testData().sav);
const fmt = (x: number) => x.toFixed(1).replace('.', ',');

test('session 4 shows the press release, three checks, the verdict and the plenum card', () => {
  const html = renderSession(3);
  assert.match(html, /Faktencheck-Redaktion „Nachgezählt“ \(fiktiv\)/);
  assert.match(html, /87 Prozent der Nichtwähler/);
  for (const step of ['Prüfauftrag 1 · Zahl nachbauen', 'Prüfauftrag 2 · Eine Zelle, drei Nenner', 'Prüfauftrag 3 · Deine Lesart', 'Urteil und Faktencheck-Satz']) assert.match(html, new RegExp(step));
  assert.match(html, /FÜR DAS PLENUM/);
  assert.doesNotMatch(html, /percentages = &quot;col&quot;/);
  assert.doesNotMatch(html, /drei Nenner –/);
  assert.doesNotMatch(html, /vollständiges R-Skript/);
});

test('draws the denominator picture and the strip once the numbers are right', () => {
  const party = fourfold(joint, PARTY);
  const p2 = { rowDistrust: fmt(percent(party, 'a', 'row')), rowOthers: fmt(percent(party, 'c', 'row')), total: fmt(percent(party, 'a', 'all')) };
  const own = fourfold(joint, { item: 'pe05', distrust: [3, 4], nonvote: [-8], else0: false, weighted: false });
  const p3 = { ...initialS04().p3, rowDistrust: fmt(percent(own, 'a', 'row')), rowOthers: fmt(percent(own, 'c', 'row')), n: String(own.n.a) };
  const html = renderSession(3, true, { tasks: { s04: { ...initialS04(), p2, p3 } } });
  assert.match(html, /Dieselben \d+ Menschen, drei Nenner/);
  assert.match(html, /18 Lesarten: Von den Misstrauenden wollen/);
  assert.match(html, /Deine Lesart: <strong>pe05↺ 1–2 · 91\+wn<\/strong>/);
});

test('asks at most three questions after a verdict and offers the full script when done', () => {
  const done = { ...initialS04(), p1: { pct: '87', n: '127' }, p2: { rowDistrust: '6,5', rowOthers: '2,3', total: '4,6' },
    p3: { ...initialS04().p3, rowDistrust: '21,5' }, verdict: 2, reason: 'Misstrauen führt nicht zur Nichtwahl', sentence: 'Von denen, die misstrauen, wollen 6,5 % nicht wählen, von den übrigen 2,3 %.' };
  const html = renderSession(3, true, { tasks: { s04: done } });
  assert.match(html, /Du nennst eine Ursache\./);
  assert.equal((html.match(/<li><strong>/g) ?? []).length, 3);
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Kreuztabellen<small>Aufgabe abgeschlossen/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s04-nenner-check/task.test.ts`
Expected: FAIL (Sitzung 4 zeigt noch die Mission; `renderSession` erwartet noch den Missions-Speicher als dritten Parameter).

- [ ] **Step 3: Diagramme** – `src/tasks/s04-nenner-check/Charts.tsx`:

```tsx
import { de } from '../kit/numbers';
import { shortcut, type Way } from './domain';

const count = (x: number) => x.toLocaleString('de-DE');

/** Nenner-Bild: dieselbe Zelle (dieselben Menschen) in drei Nennern. */
export function DenominatorBars({ cell, nonvoters, distrusting, all }: { cell: number; nonvoters: number; distrusting: number; all: number }) {
  const bars: [string, number][] = [
    [`unter den ${count(nonvoters)} Nichtwählenden`, nonvoters],
    [`unter den ${count(distrusting)} Misstrauenden`, distrusting],
    [`unter allen ${count(all)} Befragten`, all],
  ];
  const W = 800, scale = (x: number) => (x / all) * (W - 4);
  const label = bars.map(([text, n]) => `${text}: ${de(100 * cell / n)} %`).join('; ');
  return <figure className="s04-bars">
    <svg viewBox={`0 0 ${W} 150`} className="s04-bars-svg" role="img" aria-label={`Dieselben ${cell} Menschen, drei Nenner – ${label}`}>
      {bars.map(([text, n], i) => <g key={text} transform={`translate(2 ${i * 50 + 6})`}>
        <rect width={Math.max(scale(n), 3)} height={18} rx={4} fill="#d9d6ce" />
        <rect width={Math.max(scale(cell), 3)} height={18} rx={4} fill="#5b7c6f" />
        <text x={0} y={36}>{text}: <tspan className="value">{de(100 * cell / n)} %</tspan></text>
      </g>)}
    </svg>
    <figcaption>Das dunkle Stück sind in allen drei Balken dieselben {cell} Menschen. Nur der Nenner wechselt.</figcaption>
  </figure>;
}

/** Streifen: die 18 vorbereiteten Lesarten, die eigene Lesart und die 87 % als Fähnchen „anderer Nenner“. */
export function ReadingStrip({ readings, own, claimed }: {
  readings: { way: Way; distrusting: number; others: number }[];
  own: { way: Way; distrusting: number; others: number } | null;
  claimed: number;
}) {
  const W = 600, x = (p: number) => 20 + (p / 100) * (W - 40);
  const lo = Math.min(...readings.map(r => r.distrusting)), hi = Math.max(...readings.map(r => r.distrusting));
  const summary = `${readings.length} Lesarten: Von den Misstrauenden wollen ${de(lo)} bis ${de(hi)} % nicht wählen.${own ? ` Deine Lesart ${shortcut(own.way)}: ${de(own.distrusting)} % gegenüber ${de(own.others)} % bei den Übrigen.` : ''} Die ${claimed} % haben einen anderen Nenner.`;
  return <figure className="s04-strip">
    <svg viewBox={`0 0 ${W} 120`} role="img" aria-label={summary}>
      <line x1={x(0)} x2={x(100)} y1={70} y2={70} stroke="#242822" />
      {[0, 25, 50, 75, 100].map(p => <g key={p}>
        <line x1={x(p)} x2={x(p)} y1={66} y2={74} stroke="#242822" />
        <text x={x(p)} y={90} textAnchor="middle">{p} %</text>
      </g>)}
      <line x1={x(50)} x2={x(50)} y1={24} y2={70} stroke="#8b2e2e" strokeDasharray="4 3" />
      {readings.map((r, i) => <g key={i}>
        <line x1={x(r.others)} x2={x(r.distrusting)} y1={58 - (i % 3) * 8} y2={58 - (i % 3) * 8} stroke="#b9c7a5" />
        <circle cx={x(r.distrusting)} cy={58 - (i % 3) * 8} r={3.5} fill="#8fa58a" />
      </g>)}
      {own && <g>
        <line x1={x(own.others)} x2={x(own.distrusting)} y1={38} y2={38} stroke="#242822" strokeWidth={2} />
        <circle cx={x(own.distrusting)} cy={38} r={6} fill="#242822" />
        <circle cx={x(own.others)} cy={38} r={4} fill="#fff" stroke="#242822" strokeWidth={2} />
        <text x={x(own.distrusting)} y={24} textAnchor="middle" className="own">du</text>
      </g>}
      <g>
        <line x1={x(claimed)} x2={x(claimed)} y1={14} y2={70} stroke="#7d6b5d" />
        <path d={`M${x(claimed)} 14 h 34 l -6 6 l 6 6 h -34 z`} fill="#c9b98a" />
        <text x={x(claimed) + 4} y={24} className="flag">{claimed} %</text>
      </g>
    </svg>
    <figcaption>Jede Linie verbindet die Übrigen (links) mit den Misstrauenden (Punkt). Die gestrichelte Linie markiert 50 %, das Fähnchen die {claimed} % der Pressemitteilung – sie haben einen anderen Nenner.</figcaption>
  </figure>;
}
```

- [ ] **Step 4: Oberfläche** – `src/tasks/s04-nenner-check/NennerCheck.tsx`:

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
import { DenominatorBars, ReadingStrip } from './Charts';
import { CAUSES, CLAIMED, hints, ITEM_IDS, ITEMS, NONVOTE_EXTRAS, PRESS_RELEASE, R_SETUP, R_SOLUTION, type ItemId } from './content';
import {
  allTables, checkExtra, checkP1, checkP2, checkP3, declaredWay, denominators, fourfold, percent, plenumLines, prepare,
  questions, rCodeFor, readings, shortcut, statusS04, stairs, VERDICTS, type S04State,
} from './domain';

export function NennerCheck({ data, state, onChange, onConcept }: TaskProps<S04State>) {
  const set = (patch: Partial<S04State>) => onChange({ ...state, ...patch });
  const joint = useMemo(() => prepare(data.sav), [data.sav]);
  const tables = useMemo(() => allTables(joint), [joint]);
  const p1 = checkP1(tables, joint, state.p1.pct, state.p1.n);
  const p2 = checkP2(tables, joint, state.p2);
  const p3 = checkP3(tables, joint, state.p3);
  const way = declaredWay(state.p3);
  const p3ok = p3.some(n => n.tone === 'ok');
  const own = p3ok ? (() => { const t = fourfold(joint, way); return { way, distrusting: percent(t, 'a', 'row'), others: percent(t, 'c', 'row') }; })() : null;
  const setP3 = (patch: Partial<S04State['p3']>) => set({ p3: { ...state.p3, ...patch } });
  const item = ITEMS[state.p3.item];
  const toggle = (list: number[], code: number) => (list.includes(code) ? list.filter(c => c !== code) : [...list, code]);

  return <div className="task s04">
    <RoleBrief role="Faktenchecker:in" title="Nenner-Check">
      <p><strong>Faktencheck-Redaktion „Nachgezählt“ (fiktiv) · dein Auftrag.</strong> Auf deinem Tisch liegt die Pressemitteilung eines Parteivorstands (fiktiv):</p>
      <figure className="sandbox-quote"><blockquote>{PRESS_RELEASE}</blockquote></figure>
      <p>Die Chefredaktion will bis zur Konferenz zwei Dinge wissen: <strong>Stimmt die Zahl? Und trägt sie die Behauptung?</strong> Rechne in RStudio nach, rechne gegen und liefere einen Faktencheck-Satz mit zwei Zahlen und dein Urteil. Hier trägst du deine Ergebnisse ein und bekommst Rückmeldung.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du rechnest alle drei Prüfaufträge nacheinander. Der Streifen am Ende zeigt dir die Lesarten, die sonst im Raum entstehen; die Gegenfragen ersetzen das Gespräch."
      pair="A ist die Nachrechnerin (Prüfauftrag 1), B der Gegenrechner (Prüfauftrag 2) – vergleicht danach eure Zellenhäufigkeit. In Prüfauftrag 3 wählt ihr zwei Lesarten, die sich in mindestens einer Entscheidung unterscheiden. Am Ende steht ein gemeinsamer Satz – oder ein festgehaltener Dissens." />

    <section className="task-step">
      <h3>Vorab · Wer sind die 100 %?</h3>
      <label className="sandbox-label" htmlFor="s04-guess">Die {CLAIMED} % beziehen sich auf alle, die …</label>
      <input id="s04-guess" type="text" maxLength={300} value={state.guess} onChange={e => set({ guess: e.target.value })} />
      <p className="sandbox-note">Dein Satz wird nicht geprüft – er steht am Ende auf deiner Karte.</p>
    </section>

    <section className="task-step">
      <h3>Prüfauftrag 1 · Zahl nachbauen</h3>
      <p>Bilde in R zwei Dummys (1 = misstraut, 1 = würde nicht wählen) und lass dir die Kreuztabelle mit der passenden Prozentbasis zeigen. Trag den Prozentwert ein und die Häufigkeit derselben Zelle.</p>
      <RBlock code={R_SETUP} file="nenner-check.R" />
      <div className="task-grid">
        <label>Prozentwert<input type="text" inputMode="decimal" maxLength={12} value={state.p1.pct} onChange={e => set({ p1: { ...state.p1, pct: e.target.value } })} /></label>
        <label>Häufigkeit derselben Zelle<input type="text" inputMode="numeric" maxLength={12} value={state.p1.n} onChange={e => set({ p1: { ...state.p1, n: e.target.value } })} /></label>
      </div>
      <Feedback notes={p1} />
      <details className="s04-causes"><summary>Das wollte ich anders</summary><ul>{CAUSES.map(c => <li key={c}>{c}</li>)}</ul></details>
      <HintLadder hint={hints.p1} onConcept={onConcept} file="nenner-check-p1.R" />
    </section>

    <section className="task-step">
      <h3>Prüfauftrag 2 · Eine Zelle, drei Nenner</h3>
      <p>Dieselbe Tabelle mit <code>percentages = "all"</code>: Wie viele der Misstrauenden wollen nicht wählen, wie viele der Übrigen – und wie groß ist die Zelle, gemessen an allen?</p>
      <div className="task-grid">
        <label>Misstrauende: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p2.rowDistrust} onChange={e => set({ p2: { ...state.p2, rowDistrust: e.target.value } })} /></label>
        <label>Übrige: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p2.rowOthers} onChange={e => set({ p2: { ...state.p2, rowOthers: e.target.value } })} /></label>
        <label>Zelle an allen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p2.total} onChange={e => set({ p2: { ...state.p2, total: e.target.value } })} /></label>
      </div>
      <Feedback notes={p2} />
      {p2.length === 3 && p2.every(n => n.tone === 'ok') && <DenominatorBars {...denominators(joint)} />}
      <HintLadder hint={hints.p2} onConcept={onConcept} />
    </section>

    <section className="task-step">
      <h3>Prüfauftrag 3 · Deine Lesart</h3>
      <p>Leg selbst fest, wer als misstrauisch gilt und was als Nichtwahl zählt – mindestens eine Entscheidung anders als der Parteivorstand. Vorschlag: die Gegenprobe mit pe05.</p>
      <div className="task-grid">
        <label>Item<select value={state.p3.item} onChange={e => { const id = e.target.value as ItemId; setP3({ item: id, distrust: ITEMS[id].wide }); }}>
          {ITEM_IDS.map(id => <option key={id} value={id}>{id} · {ITEMS[id].title}</option>)}
        </select></label>
      </div>
      <p className="sandbox-note">{item.statement}</p>
      <div className="sandbox-chips" role="group" aria-label="Als Misstrauen zählt">
        {item.categories.map(c => <button key={c.code} aria-pressed={state.p3.distrust.includes(c.code)} onClick={() => setP3({ distrust: toggle(state.p3.distrust, c.code) })}>{c.code} {c.label}</button>)}
      </div>
      <div className="sandbox-chips" role="group" aria-label="Als Nichtwahl zählt außerdem">
        <span className="sandbox-note">Nichtwahl: 91 „würde nicht wählen“ und</span>
        {NONVOTE_EXTRAS.map(e => <button key={e.code} aria-pressed={state.p3.nonvote.includes(e.code)} onClick={() => setP3({ nonvote: toggle(state.p3.nonvote, e.code) })}>{e.code} {e.label}</button>)}
      </div>
      <label className="s04-check"><input type="checkbox" checked={state.p3.weighted} onChange={e => setP3({ weighted: e.target.checked })} /> gewichtet mit wghtpew</label>
      {state.p3.distrust.length > 0 && <p className="sandbox-note">Deine Lesart: <strong>{shortcut(way)}</strong></p>}
      <div className="task-grid">
        <label>Misstrauende: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p3.rowDistrust} onChange={e => setP3({ rowDistrust: e.target.value })} /></label>
        <label>Übrige: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.p3.rowOthers} onChange={e => setP3({ rowOthers: e.target.value })} /></label>
        <label>Häufigkeit: misstraut & nicht wählen<input type="text" inputMode="numeric" maxLength={12} value={state.p3.n} onChange={e => setP3({ n: e.target.value })} /></label>
      </div>
      <Feedback notes={p3} />
      {own && <ReadingStrip readings={readings(joint)} own={own} claimed={CLAIMED} />}
      <HintLadder hint={{ ...hints.p3, solution: state.p3.distrust.length ? rCodeFor(way) : hints.p3.solution }} onConcept={onConcept} file="nenner-check-p3.R" />
    </section>

    <section className="task-step">
      <h3>Urteil und Faktencheck-Satz</h3>
      <div className="sandbox-chips" role="group" aria-label="Urteil">
        {VERDICTS.map((v, i) => <button key={v} aria-pressed={state.verdict === i} onClick={() => set({ verdict: i })}>{v}</button>)}
      </div>
      <label className="sandbox-label" htmlFor="s04-reason">Begründung</label>
      <textarea id="s04-reason" maxLength={600} value={state.reason} onChange={e => set({ reason: e.target.value })} />
      <label className="sandbox-label" htmlFor="s04-sentence">Faktencheck-Satz mit zwei Zahlen</label>
      <textarea id="s04-sentence" maxLength={600} placeholder="Von denen, die …, wollen … % nicht wählen, von den übrigen … %." value={state.sentence} onChange={e => set({ sentence: e.target.value })} />
      {state.verdict !== null && <ul className="s04-questions">{questions(joint, state).map(q => <li key={q.id}>
        <strong>{q.title}</strong> {q.text}{q.concept && <> <button className="sandbox-link" onClick={() => onConcept(q.concept!)}>Karte öffnen</button></>}
      </li>)}</ul>}
    </section>

    <details className="task-step s04-extra">
      <summary>Zusatz für Schnelle · Misstrauens-Zähler</summary>
      <p>Zähle je Person, wie vielen der drei Aussagen sie misstrauisch zustimmt (0–3), und kreuze das mit der Nichtwahl. Wie viele auf der obersten Stufe wollen nicht wählen?</p>
      <div className="task-grid">
        <label>Oberste Stufe: nicht wählen (%)<input type="text" inputMode="decimal" maxLength={12} value={state.extra} onChange={e => set({ extra: e.target.value })} /></label>
      </div>
      <Feedback notes={checkExtra(data.sav, state.extra)} />
      {checkExtra(data.sav, state.extra).some(n => n.tone === 'ok') && <p className="sandbox-note">Die Treppe: {stairs(data.sav).map(s => `${s.step}: ${s.share.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %`).join(' · ')}</p>}
      <HintLadder hint={hints.extra} onConcept={onConcept} />
    </details>

    <PlenumCard title="Nenner-Check" lines={plenumLines(state)} file="nenner-check-plenum.md" />
    {statusS04(state) === 'done' && parseNumber(state.p3.rowDistrust) !== null && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={R_SOLUTION} file="nenner-check.R" /></details>}
  </div>;
}
```

- [ ] **Step 5: Aufgabendefinition** – `src/tasks/s04-nenner-check/index.ts`:

```ts
import type { TaskDef } from '../types';
import { initialS04, parseS04, statusS04, type S04State } from './domain';
import { NennerCheck } from './NennerCheck';

export const nennerCheck: TaskDef<S04State> = {
  id: 's04',
  title: 'Nenner-Check',
  role: 'Faktenchecker:in',
  intro: 'Eine (fiktive) Pressemitteilung behauptet: „87 Prozent der Nichtwähler sagen, dass sich Politiker nicht um Leute wie sie kümmern.“ Du rechnest die Zahl in R nach, drehst den Nenner und prüfst eine eigene Lesart. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['pe01', 'pa35', 'pe05', 'pv01', 'wghtpew'],
  initial: initialS04,
  parse: parseS04,
  status: statusS04,
  Component: NennerCheck,
};
```

- [ ] **Step 6: Anmelden** – `src/tasks/registry.ts` ersetzen durch:

```ts
import { schonGefragt } from './s01-schon-gefragt';
import { datenerfassung } from './s02-datenerfassung';
import { stuehle } from './s03-stuehle';
import { nennerCheck } from './s04-nenner-check';
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {
  s01: schonGefragt,
  s02: datenerfassung,
  s03: stuehle,
  s04: nennerCheck,
};
```

- [ ] **Step 7: Curriculum ohne Mission** – `src/domain/curriculum.ts` ersetzen durch (Sitzung 4 → `s04`, Feld `mission` entfällt):

```ts
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
};

const t = (label: string, concept?: string): Term => ({ label, concept });

// Gliederung nach „Statistik im WiSe 24/25“; die gestrichenen Sitzungen 7–8 (EFA) entfallen.
export const sessions: Session[] = [
  {
    id: 1, plan: 'Sitzungsplan 1', title: 'Einstieg', short: 'R, RStudio, ALLBUS',
    question: 'Wie kommen die Daten auf meinen Rechner?',
    repetition: [],
    introduced: [t('R und RStudio'), t('Daten nach R einlesen', 'data_import'), t('Codebuch & Variablensuche', 'codebook')],
    task: 's01',
  },
  {
    id: 2, plan: 'Sitzungsplan 2', title: 'Vom Fragebogen zum Datensatz', short: 'Datenmatrix, Labels',
    question: 'Was steht eigentlich in einer Zeile des ALLBUS?',
    repetition: [t('Datenmatrix'), t('Variable'), t('Fall'), t('Wert'), t('Datenreihe', 'series')],
    introduced: [t('Variablen- & Wertelabels', 'labels'), t('Codebuch & Variablensuche', 'codebook'), t('Datentypen umwandeln', 'conversion')],
    task: 's02',
  },
  {
    id: 3, plan: 'Sitzungsplan 3', title: 'Erste Auszählung', short: 'Häufigkeiten, fehlende Werte',
    question: 'Wie viele interessieren sich eigentlich für Politik?',
    repetition: [t('Nominale Kategorien', 'nominal'), t('Geordnete Kategorien', 'ordinal'), t('Metrisches Skalenniveau', 'metric'), t('Arithmetisches Mittel', 'mean'), t('Median', 'median'), t('Standardabweichung', 'sd'), t('Häufigkeiten', 'frequency'), t('Balkendiagramm'), t('Boxplot'), t('Schiefe & Kurtosis', 'shape')],
    introduced: [t('Fehlende Angaben', 'missing'), t('Missing-Codes aufbereiten', 'missing_tools'), t('Fälle auswählen'), t('Deskriptiver Überblick', 'describe')],
    task: 's03',
  },
  {
    id: 4, plan: 'Sitzungsplan 4', title: 'Kreuztabellen', short: 'Prozentbasen, Umkodieren',
    question: 'Gehen Misstrauende nicht mehr wählen?',
    repetition: [t('AV und UV'), t('Kausalität', 'causality'), t('Grundgesamtheit & Parameter', 'population_parameter'), t('Stichprobe & Unabhängigkeit', 'sampling'), t('Chi-Quadrat · Unabhängigkeit', 'chi_square')],
    introduced: [t('Kreuztabelle', 'crosstab'), t('Zeilen-, Spalten-, Zellenprozente'), t('Rekodieren & Umpolen', 'recode'), t('Dummyvariablen', 'dummy'), t('Rechnen innerhalb einer Person', 'row_operations')],
    task: 's04',
  },
  {
    id: 5, plan: 'Sitzungsplan 5', title: 'Gewichtung und Zusammenhang', short: 'Gewichte, Zusammenhangsmaße',
    question: 'Vertraut der Osten dem Bundestag weniger?',
    repetition: [],
    introduced: [t('Gewichte', 'weights'), t('Drittvariable'), t('Confounding · gemeinsame Ursachen', 'confounding'), t('Phi', 'phi'), t('Cramér-V', 'cramers_v'), t('Goodman–Kruskal-Gamma', 'goodman_gamma'), t('Kendall Tau-b', 'kendall_tau'), t('Spearman-Korrelation', 'spearman'), t('Pearson-Korrelation', 'pearson')],
    task: null,
  },
  {
    id: 6, plan: 'Sitzungsplan 6', title: 'Mittelwerte vergleichen', short: 't-Test, ANOVA',
    question: 'Unterscheiden sich Gruppen im Mittel?',
    repetition: [t('Normalverteilung', 'normal_distribution')],
    introduced: [t('t-Test', 't_test'), t('Einfaktorielle ANOVA', 'oneway_anova'), t('Korrelationsmatrix', 'correlation_matrix')],
    task: null,
  },
  {
    id: 7, plan: 'Sitzungsplan 9', title: 'Index und Skala', short: 'Reliabilität, Cronbachs α',
    question: 'Wie misst man Populismus mit mehreren Fragen?',
    repetition: [t('Validität', 'validity'), t('Messfehler', 'measurement_error')],
    introduced: [t('Mittelwertindex', 'row_operations'), t('Skalenwert pro Person', 'item_score'), t('Kombinationsindex'), t('Reliabilität · Alpha & Omega', 'reliability')],
    task: null,
  },
  {
    id: 8, plan: 'Sitzungsplan 10', title: 'Lineare Regression', short: 'Modell, Residuen, R²',
    question: 'Was sagt eine Gerade über politische Einstellungen?',
    repetition: [],
    introduced: [t('Lineare Regression', 'linear_regression'), t('Linearer Prädiktor', 'prediction'), t('Residuen & kleinste Quadrate', 'residuals'), t('Erklärter Varianzanteil · R²', 'explained_variance'), t('Gleiche Fehlervarianz', 'variance_assumption')],
    task: null,
  },
  {
    id: 9, plan: 'Sitzungsplan 11', title: 'Regression vertiefen', short: 'mehrere Prädiktoren',
    question: 'Was bleibt, wenn man mehr berücksichtigt?',
    repetition: [],
    introduced: [t('Dummyvariablen', 'dummy'), t('Multikollinearität', 'multicollinearity'), t('Ausreißer & Einfluss', 'outliers_influence'), t('Interaktion', 'interaction'), t('Confounding · gemeinsame Ursachen', 'confounding')],
    task: null,
  },
  {
    id: 10, plan: 'Sitzungsplan 12', title: 'Logistische Regression', short: 'Odds, Logit',
    question: 'Wer geht wählen – und wie wahrscheinlich?',
    repetition: [],
    introduced: [t('Wahrscheinlichkeit, Odds & Logit', 'logit'), t('Logistische Regression', 'logistic_regression'), t('Likelihood', 'likelihood'), t('Marginale Effekte', 'marginal_effects')],
    task: null,
  },
];

```

- [ ] **Step 8: Lernpfad nur mit Aufgaben** – `src/components/LearningPath.tsx` ersetzen durch:

```tsx
import { ArrowLeft, ArrowRight, BookOpen, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessions, workshopUrl, type Session, type Term } from '../domain/curriculum';
import type { LoadedData } from '../sandbox/ui/DataDrop';
import { emptyTaskStore, parseTaskStore, taskStorageKey, type TaskStore } from '../tasks/kit/storage';
import { taskRegistry } from '../tasks/registry';
import { TaskHost } from '../tasks/TaskHost';

const STORAGE_WARNING = 'Dein Browser erlaubt keine lokale Speicherung. Deine Arbeit bleibt nur erhalten, solange dieser Tab offen ist.';
const TASK_TEXT = { open: 'Aufgabe offen', running: 'Aufgabe läuft', done: 'Aufgabe abgeschlossen' } as const;

function readStore(): { tasks: TaskStore; warning: string } {
  if (typeof localStorage === 'undefined') return { tasks: emptyTaskStore(), warning: '' };
  try {
    return { tasks: parseTaskStore(localStorage.getItem(taskStorageKey)), warning: '' };
  } catch {
    return { tasks: emptyTaskStore(), warning: STORAGE_WARNING };
  }
}

function sessionStatus(session: Session, tasks: TaskStore): string {
  const def = session.task ? taskRegistry[session.task] : undefined;
  if (!def) return 'Aufgabe folgt';
  const raw = tasks.tasks[def.id];
  return TASK_TEXT[def.status(raw === undefined ? def.initial() : def.parse(raw))];
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

export function LearningPath({ onConcept, sessionIndex = 0, onSessionChange, initialData = null, initialTasks }: {
  onConcept: (id: string) => void;
  sessionIndex?: number;
  onSessionChange: (index: number) => void;
  initialData?: LoadedData | null;
  initialTasks?: TaskStore;
}) {
  const [data, setData] = useState<LoadedData | null>(initialData);
  const [{ tasks: loadedTasks, warning: loadWarning }] = useState(readStore);
  const [tasks, setTasks] = useState<TaskStore>(initialTasks ?? loadedTasks);
  const [warning, setWarning] = useState(loadWarning);
  const index = Math.min(Math.max(sessionIndex, 0), sessions.length - 1);
  const session = sessions[index];

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
    } catch {
      setWarning(STORAGE_WARNING);
    }
  }, [tasks]);

  const choose = (next: number) => {
    onSessionChange(next);
    requestAnimationFrame(() => document.getElementById('learning-heading')?.focus({ preventScroll: true }));
    document.getElementById('learning-main')?.scrollTo({ top: 0 });
  };
  const taskDef = session.task ? taskRegistry[session.task] : undefined;
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
          const status = sessionStatus(s, tasks);
          const done = status === TASK_TEXT.done;
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
        {!taskDef && <div className="learning-mission-soon">
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

- [ ] **Step 9: Render-Hilfe ohne Missions-Speicher** – `src/tasks/testRender.ts` ersetzen durch:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPath } from '../components/LearningPath';
import { fixtureSav } from '../sandbox/testData';
import type { TaskStore } from './kit/storage';

/** Rendert eine Sitzung des Lernpfads mit der synthetischen Testdatei (nur für Tests). */
export const testData = () => ({ sav: fixtureSav(), fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' });
export const renderSession = (sessionIndex: number, withData = true, tasks: TaskStore = { tasks: {} }) =>
  renderToStaticMarkup(createElement(LearningPath, {
    onConcept: () => {}, sessionIndex, onSessionChange: () => {}, initialData: withData ? testData() : null, initialTasks: tasks,
  }));
```

Die Aufrufe mit leerem drittem Argument in den Rendertests der Sitzungen 1–3 anpassen (reine ASCII-Ersetzung; die Dateien bleiben sonst byte-gleich):

```bash
python3 - <<'EOF'
import pathlib
for f, n in [('src/tasks/s01-schon-gefragt/task.test.ts', 2), ('src/tasks/s02-datenerfassung/task.test.ts', 5), ('src/tasks/s03-stuehle/task.test.ts', 5)]:
    p = pathlib.Path(f); s = p.read_text()
    assert s.count(', true, undefined, {') == n, f
    p.write_text(s.replace(', true, undefined, {', ', true, {'))
EOF
```

- [ ] **Step 10: Curriculum-Test** – `src/domain/curriculum.test.ts` ersetzen durch:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialS04 } from '../tasks/s04-nenner-check/domain';
import { renderSession } from '../tasks/testRender';
import { conceptById } from './concepts';
import { sessions } from './curriculum';

test('follows the session plan: ten sessions, one task each', () => {
  assert.deepEqual(sessions.map(s => s.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(sessions.map(s => s.task), ['s01', 's02', 's03', 's04', null, null, null, null, null, null]);
  for (const s of sessions) {
    assert.ok(s.introduced.length > 0, `Sitzung ${s.id}`);
    for (const term of [...s.repetition, ...s.introduced]) if (term.concept) assert.ok(conceptById[term.concept], `${s.id}: ${term.concept}`);
  }
});

test('lists every session with its status and marks missing map terms', () => {
  const html = renderSession(3, true, { tasks: { s04: { ...initialS04(), guess: 'Nichtwähler' } } });
  for (const s of sessions) assert.match(html, new RegExp(`<strong>${s.title}<small>`));
  assert.match(html, /Kreuztabellen<small>Aufgabe läuft/);
  assert.match(html, /Aufgabe folgt/);
  assert.match(html, /<span title="Steht im Sitzungsplan, fehlt der Karte noch">AV und UV<\/span>/);
  assert.match(html, /<button>Kreuztabelle<\/button>/);
  assert.match(html, /Andere Datei laden/);
});

test('shows the Nenner-Check in session 4 and announces upcoming tasks', () => {
  assert.match(renderSession(3), /Nenner-Check/);
  assert.match(renderSession(3, false), /87 Prozent der Nichtwähler/);
  const later = renderSession(5);
  assert.match(later, /AUFGABE FOLGT/);
  assert.match(later, /Mittelwerte vergleichen/);
  assert.match(renderSession(99), /Logistische Regression/);
});
```

- [ ] **Step 11: ALLBUS-Modul auf die Studienprüfung kürzen** – `src/sandbox/allbus.ts` ersetzen durch:

```ts
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
```

und `src/sandbox/allbus.test.ts` ersetzen durch:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAllbus } from './allbus';
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
```

- [ ] **Step 12: Alten Missions-Code entfernen**

```bash
git rm scripts/export-sandbox-grid.ts scripts/verify-sandbox-r.R src/sandbox/allbus.local.test.ts src/sandbox/analysis.test.ts src/sandbox/analysis.ts src/sandbox/claims.test.ts src/sandbox/claims.ts src/sandbox/format.ts src/sandbox/multiverse.test.ts src/sandbox/multiverse.ts src/sandbox/questions.test.ts src/sandbox/questions.ts src/sandbox/rcode.test.ts src/sandbox/rcode.ts src/sandbox/state.test.ts src/sandbox/state.ts src/sandbox/ui/ClaimWorkspace.tsx src/sandbox/ui/Decompose.tsx src/sandbox/ui/LiveTable.tsx src/sandbox/ui/Mirror.tsx src/sandbox/ui/Questions.tsx src/sandbox/ui/Verdict.tsx src/sandbox/ui/Workbench.tsx src/sandbox/workspace.test.ts
```

- [ ] **Step 13: Styles** – an `src/tasks.css` anhängen:

```css

/* Sitzung 4 · Nenner-Check */
.s04 .sandbox-quote blockquote{font-size:19px}
.s04-bars,.s04-strip{margin:12px 0}
.s04-bars svg,.s04-strip svg{width:100%;height:auto;background:#fff;border:1px solid var(--line);border-radius:8px}
.s04-bars text,.s04-strip text{font:13px var(--sans);fill:var(--muted)}
.s04-bars text .value{fill:var(--ink);font-weight:600}
.s04-strip text.own,.s04-strip text.flag{fill:var(--ink);font-weight:600}
.s04-bars figcaption,.s04-strip figcaption{font-size:14px;color:var(--muted);margin-top:6px}
.s04-check{display:flex;align-items:center;gap:8px;font-size:14px;margin:8px 0}
.s04-causes{margin:8px 0;font-size:14px}
.s04-causes ul{margin:6px 0 0;padding-left:20px}
.s04-questions{margin:12px 0;padding-left:20px;font-size:15px}
.s04-questions li{margin:0 0 8px}
.s04-extra summary{font:600 16px/1.4 var(--sans);cursor:pointer}
.s04 .sandbox-chips .sandbox-note{margin:0 6px 0 0;align-self:center}
```

- [ ] **Step 14: Tests und Typprüfung**

Run: `node --import tsx --test src/tasks/s04-nenner-check/*.test.ts` → `# pass 11`, `# fail 0`.
Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit` → `# pass 144`, `# fail 0`, `# skipped 3` (die Tests der entfernten Mission fallen weg); tsc ohne Ausgabe.
Run: `grep -rn "sandbox/claims\|sandbox/state\|missionen" src` → keine Treffer.

- [ ] **Step 15: Im Browser prüfen (mit eigener Datei).** Sitzung 4: Prüfauftrag 1 mit 87,0 und 127 → „… unter den 146, die nicht wählen wollen. Genau so hat der Parteivorstand gerechnet“; 6,5/127 → „Der Nenner ist vertauscht“; 3,2 → „Lies pe05 noch einmal“. Prüfauftrag 2 mit 6,5 · 2,3 · 4,6 → drei „stimmt“ und das Nenner-Bild (146 · 1.956 · 2.785, dunkles Stück 127). Prüfauftrag 3 mit pe05 3–4, „weiß nicht“, 21,5 · 11,7 · 386 → „Stimmt für deine Lesart pe05↺ 1–2 · 91+wn“ und der Streifen (18 Lesarten 6,5–29,2 %). Urteil mit „führt“ in der Begründung → höchstens drei Gegenfragen, darunter „Du nennst eine Ursache.“ Allein/zu zweit, 390 px ohne Überlaufen.

- [ ] **Step 16: Commit**

```bash
git add -A src scripts
git commit -m "Replace the Belege es! mission with the session 4 task 'Nenner-Check'"
```

---
### Task 5: Sitzung 5 „Treiber-Rangliste“ – Karten und Prüflogik

**Files:**
- Create: `src/tasks/s05-treiber/content.ts`, `src/tasks/s05-treiber/domain.ts`
- Test: `src/tasks/s05-treiber/domain.test.ts`

**Interfaces:**
- Consumes: `crosstab`, `MEASURES`, `permutationV`, `validValues`, `MeasureId` (kit/stats); `Note`, `de`, `parseNumber`, `WORK_MODES`, `WorkMode`, `bool`, `oneOf`, `record`, `str`, `TaskStatus`.
- Produces:
  - `content.ts`: `type Level = 'nominal' | 'ordinal' | 'metrisch'`, `type CardId`, `type Card` (`source`, `title`, `question`, `level`, `alsoLevel?`, `high`, `recode?`, `joker?`), `CARDS` (13), `CARD_IDS`, `cardById`, `KONF_ORDERS`, `LEVEL_MEASURES`, `STAMPS`, `type Stamp`, `LAGE`, `ROLE`, `hintTexts`, `WORKSHOP`.
  - `domain.ts`: `MEASURE_IDS`; `type Prepared`, `Stratum`, `Variant`, `Entry`, `View`, `Reveal`, `S05State`; `prepare(sav)`; `cardValues(p, card, map?)`; `strata(p, card)`; `variants(p, card)` (Maß × Gewicht × gesamt/Landesteile × Kodierung von ps03); `tolerance(input)`; `measureLabel(m)`; `direction(card, value)`; `checkEntry`, `checkStrata`, `STAMP_RULE`, `stampReading(total, parts, signed)`, `checkStamp`, `fitNotes`, `checkLevel`; `CURRENCIES`, `VIEWS`, `VIEW_LABELS`, `reveal(p)`, `ranks(values)`, `revealNotes(r, view)`; `DRIVER_WORDS`, `driverQuestion(text)`; `initialS05`, `parseS05`, `statusS05`, `plenumLines`, `rSetupFor(card)`, `rCodeFor(card)`, `scaffoldFor(card)`.

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s05-treiber/domain.test.ts` (Stempel-Regel mit echten ALLBUS-Werten, alles andere auf der Testdatei):

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { fakeSav, fixtureSav } from '../../sandbox/testData';
import { cardById } from './content';
import {
  cardValues, checkEntry, checkLevel, checkStamp, checkStrata, direction, driverQuestion, fitNotes, initialS05, parseS05, plenumLines, prepare,
  ranks, rCodeFor, reveal, revealNotes, scaffoldFor, stampReading, statusS05, strata, tolerance, variants,
} from './domain';

const p = prepare(fixtureSav());
const ep01 = cardById.ep01, vars = variants(p, ep01);
const value = (measure: string, weighted: boolean, stratum = -1, reversed = true) =>
  vars.find(v => v.measure === measure && v.weighted === weighted && v.stratum === stratum && v.reversed === reversed)!.value;
const fmt = (x: number) => x.toFixed(3).replace('.', ',');

test('reverses ps03, recodes cards like rec() and groups the economy as a third variable', () => {
  const sav = fakeSav({
    ps03: { values: [1, 6, -11, 3], missingFrom: -1 }, ep01: { values: [1, 3, 5, -9], missingFrom: -1 }, wghtpew: { values: [1, 1, 1, 1] },
    eastwest: { values: [1, 2, 1, 2] }, rd01: { values: [2, 3, 5, 6], missingFrom: -1 }, educ: { values: [1, 5, 6, 7], missingFrom: -1 },
  });
  const q = prepare(sav);
  assert.deepEqual([...q.y], [6, 1, NaN, 4]);
  assert.deepEqual([...q.lage], [1, 2, 3, NaN]);
  assert.deepEqual([...cardValues(q, cardById.konf)], [1, 2, 3, 4]);
  assert.deepEqual([...cardValues(q, cardById.educ5)], [1, 5, NaN, NaN]);
  assert.deepEqual(strata(q, cardById.eastwest).map(s => s.label), ['Wirtschaftslage gut', 'Wirtschaftslage teils/teils', 'Wirtschaftslage schlecht']);
});

test('computes every variant: measure × weight × region × coding of ps03', () => {
  assert.equal(vars.length, 60);
  assert.equal(variants(p, cardById.eastwest).length, 80);
  assert.equal(value('gamma', true, -1, false), -value('gamma', true));
  assert.equal(value('rho', true), value('rho', false));
  assert.equal(tolerance('0,54'), 0.005 + 1e-9);
  assert.equal(tolerance('0,5'), null);
});

test('the value detector names which variant a number is', () => {
  const check = (measure: 'gamma' | 'tau' | 'rho', weighted: boolean, input: string) => checkEntry(p, ep01, vars, { measure, weighted, value: input });
  assert.match(check('gamma', true, fmt(value('gamma', true)))[0].text, /^Stimmt: Gamma mit Gewicht/);
  assert.match(check('gamma', true, fmt(value('gamma', false)))[0].text, /Gamma ohne Gewicht.*weights = wghtpew/);
  assert.match(check('gamma', true, fmt(-value('gamma', true)))[0].text, /Originalkodierung.*umgepolt/);
  assert.match(check('tau', true, fmt(value('tau', false, 0)))[0].text, /\(West\).*ganz Deutschland/);
  assert.match(check('tau', true, fmt(value('gamma', true)))[0].text, /Gamma mit Gewicht.*Tau-b gewählt/);
  assert.match(check('gamma', true, '0,5')[0].text, /drei Nachkommastellen/);
  assert.match(check('gamma', true, '0,999')[0].text, /finde ich für diese Karte nicht/);
  assert.match(check('rho', true, fmt(value('rho', true)))[0].text, /nur zur Fallauswahl/);
  assert.deepEqual(checkStrata(p, ep01, vars, 'tau', [fmt(value('tau', false, 0)), fmt(value('tau', true, 1))]).map(n => n.tone), ['ok', 'ok']);
});

test('reads the stamp by the disclosed rule (real ALLBUS values)', () => {
  assert.equal(stampReading(-0.387, [-0.367, -0.436], true), 'trägt');
  assert.equal(stampReading(-0.136, [-0.109, -0.076], true), 'schrumpft');
  assert.equal(stampReading(-0.057, [-0.063, -0.136], true), 'nur in einem Landesteil');
  assert.equal(stampReading(0.059, [0.095, -0.045], true), 'kehrt sich um');
  assert.equal(stampReading(-0.028, [-0.040, 0.005], true), 'nur in einem Landesteil');
  assert.match(checkStamp(p, ep01, vars, 'tau', 'kehrt sich um')[0].text, /die Entscheidung bleibt bei dir/);
});

test('gives fit prompts without grading', () => {
  const konf = cardById.konf, kv = variants(p, konf);
  assert.match(fitNotes(p, konf, kv, 'gamma')[0].text, /willkürlich.*\/.*\//);
  assert.match(fitNotes(p, ep01, vars, 'phi')[0].text, /Vierfeldertafeln/);
  assert.match(fitNotes(p, ep01, vars, 'gamma')[0].text, /Bindungen.*über Tau-b/);
  assert.match(fitNotes(p, ep01, vars, 'r')[0].text, /gleiche Abstände/);
  assert.match(fitNotes(p, cardById.age, variants(p, cardById.age), 'V')[0].text, /Zufalls-V/);
  assert.equal(checkLevel(cardById.pa01, 'ordinal')[0].tone, 'ok');
  assert.equal(checkLevel(ep01, 'nominal')[0].tone, 'hint');
  assert.equal(direction(ep01, -0.5), 'Wer die Wirtschaftslage schlechter einschätzt, ist eher unzufriedener mit der Demokratie.');
  assert.match(driverQuestion('Die Wirtschaftslage treibt die Zufriedenheit')[0].text, /Drittvariable/);
  assert.deepEqual(driverQuestion('hängt zusammen'), []);
});

test('reveals the ranking in four currencies', () => {
  assert.deepEqual(ranks({ ep01: -0.5, age: 0.1, konf: NaN, pt03: 0.6 }), { pt03: 1, ep01: 2, age: 3 });
  const r = reveal(p);
  assert.ok(Number.isNaN(r.west.eastwest.V));
  assert.ok(revealNotes(r, 'weighted').length >= 3);
});

test('writes the R script for each kind of card', () => {
  assert.match(rCodeFor(cardById.konf), /zufriedenheit = rec\(ps03, rules = "rev"\),\n    konf = rec\(rd01, rules = "1:2=1 \[evangelisch\]; 3=2 \[katholisch\]; 4:5=3 \[andere\]; 6=4 \[keine\]; else=NA"\)/);
  assert.match(rCodeFor(cardById.konf), /group_by\(eastwest\) %>% cramers_v\(zufriedenheit, konf\)/);
  assert.match(rCodeFor(ep01), /unlabel\(zufriedenheit, ep01, wghtpew\) %>% kendall_tau\(zufriedenheit, ep01, weights = wghtpew\)/);
  assert.match(rCodeFor(cardById.age), /pearson_cor\(zufriedenheit, age, weights = wghtpew\)/);
  assert.doesNotMatch(rCodeFor(cardById.age), /crosstab/);
  assert.match(rCodeFor(cardById.eastwest), /filter\(lage == 3\) %>% goodman_gamma\(zufriedenheit, eastwest\)/);
  assert.match(scaffoldFor(ep01), /rules = "___"/);
});

test('restores state defensively, reports status and builds the plenum card', () => {
  assert.deepEqual(parseS05(null), initialS05());
  const s = parseS05({ card: 'xx', measure: 'gamma', stamp: 'trägt', strata: ['-0,5', 7] });
  assert.equal(s.card, null);
  assert.deepEqual(s.strata, ['-0,5', '', '']);
  const done = { ...initialS05(), card: 'ep01' as const, measure: 'gamma' as const, value: '-0,544', stamp: 'trägt' as const, sentence: 'Satz', recommendation: 'Empfehlung',
    second: { measure: 'tau' as const, value: '-0,387', unweighted: '', veto: true } };
  assert.equal(statusS05(initialS05()), 'open');
  assert.equal(statusS05({ ...initialS05(), card: 'age' }), 'running');
  assert.equal(statusS05(done), 'done');
  assert.deepEqual(plenumLines(done).slice(0, 4), [['Kandidat', 'Wirtschaftslage in Deutschland (ep01)'], ['Maß = Wert · Stempel', 'Gamma = -0,544 · trägt'], ['Zweite Währung', 'Tau-b = -0,387'], ['„Treiber“?', 'Veto: kein Treiber']]);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s05-treiber/domain.test.ts`
Expected: FAIL (`Cannot find module './content'`).

- [ ] **Step 3: Karten und Texte** – `src/tasks/s05-treiber/content.ts`:

```ts
import type { MeasureId } from '../kit/stats';

export type Level = 'nominal' | 'ordinal' | 'metrisch';
export type CardId = 'ep01' | 'ep03' | 'ls01' | 'id02' | 'eastwest' | 'educ5' | 'pa01' | 'rp01' | 'konf' | 'gs01' | 'age' | 'pa02a' | 'pt03';
export type Card = {
  id: CardId;
  /** Variable in der Datei. */
  source: string;
  title: string;
  question: string;
  level: Level;
  /** Ebenfalls vertretbares Skalenniveau (quasi-metrische Skalen, Dichotomien). */
  alsoLevel?: Level;
  /** Was ein höherer Code bedeutet – für den Richtungssatz; null bei rein nominalen Karten. */
  high: string | null;
  /** Umkodierung wie in R: rec(source, rules = …) als neue Variable id; TS-Spiegel map. */
  recode?: { rules: string; map: (x: number) => number | null };
  joker?: boolean;
};

const konfMap = (x: number) => (x === 1 || x === 2 ? 1 : x === 3 ? 2 : x === 4 || x === 5 ? 3 : x === 6 ? 4 : null);

export const CARDS: Card[] = [
  { id: 'ep01', source: 'ep01', title: 'Wirtschaftslage in Deutschland', question: 'Wie beurteilen Sie ganz allgemein die heutige wirtschaftliche Lage in Deutschland? (1 sehr gut … 5 sehr schlecht)', level: 'ordinal', high: 'die Wirtschaftslage schlechter einschätzt' },
  { id: 'ep03', source: 'ep03', title: 'Eigene wirtschaftliche Lage', question: 'Und Ihre eigene wirtschaftliche Lage heute? (1 sehr gut … 5 sehr schlecht)', level: 'ordinal', high: 'die eigene Lage schlechter einschätzt' },
  { id: 'ls01', source: 'ls01', title: 'Lebenszufriedenheit', question: 'Wie zufrieden sind Sie gegenwärtig, alles in allem, mit Ihrem Leben? (0 ganz unzufrieden … 10 ganz zufrieden)', level: 'metrisch', alsoLevel: 'ordinal', high: 'zufriedener mit dem eigenen Leben ist' },
  { id: 'id02', source: 'id02', title: 'Schicht', question: 'Welcher Schicht rechnen Sie sich selbst eher zu? (1 Unterschicht … 5 Oberschicht)', level: 'ordinal', high: 'sich einer höheren Schicht zurechnet' },
  { id: 'eastwest', source: 'eastwest', title: 'Wohnort West oder Ost', question: 'Erhebungsgebiet: alte (1) oder neue (2) Bundesländer', level: 'nominal', alsoLevel: 'ordinal', high: 'im Osten wohnt' },
  { id: 'educ5', source: 'educ', title: 'Schulabschluss', question: 'Allgemeiner Schulabschluss (1 ohne … 5 Hochschulreife; „anderer Abschluss“ und „noch Schüler“ fallen heraus)', level: 'ordinal', high: 'einen höheren Schulabschluss hat',
    recode: { rules: '1:5=copy; else=NA', map: x => (x >= 1 && x <= 5 ? x : null) } },
  { id: 'pa01', source: 'pa01', title: 'Links-rechts-Selbsteinstufung', question: 'Wo würden Sie sich selbst auf einer Skala von 1 (links) bis 10 (rechts) einstufen?', level: 'metrisch', alsoLevel: 'ordinal', high: 'sich weiter rechts einstuft' },
  { id: 'rp01', source: 'rp01', title: 'Kirchgang', question: 'Wie oft gehen Sie in die Kirche? (1 über einmal pro Woche … 6 nie)', level: 'ordinal', high: 'seltener in die Kirche geht' },
  { id: 'konf', source: 'rd01', title: 'Konfession', question: 'Welcher Religionsgemeinschaft gehören Sie an? (evangelisch, katholisch, andere, keine)', level: 'nominal', high: null,
    recode: { rules: '1:2=1 [evangelisch]; 3=2 [katholisch]; 4:5=3 [andere]; 6=4 [keine]; else=NA', map: konfMap } },
  { id: 'gs01', source: 'gs01', title: 'Wohnort: Stadt oder Land', question: 'Wie würden Sie Ihren Wohnort beschreiben? (1 Großstadt … 5 Einzelhaus auf dem Land)', level: 'ordinal', high: 'ländlicher wohnt' },
  { id: 'age', source: 'age', title: 'Alter', question: 'Alter in Jahren', level: 'metrisch', high: 'älter ist' },
  { id: 'pa02a', source: 'pa02a', title: 'Politisches Interesse', question: 'Wie stark interessieren Sie sich für Politik? (1 sehr stark … 5 überhaupt nicht)', level: 'ordinal', high: 'sich weniger für Politik interessiert' },
  { id: 'pt03', source: 'pt03', title: 'Vertrauen in den Bundestag', question: 'Wie viel Vertrauen haben Sie in den Bundestag? (1 gar kein … 7 großes Vertrauen)', level: 'ordinal', high: 'dem Bundestag mehr vertraut', joker: true },
];
export const CARD_IDS = CARDS.map(c => c.id) as CardId[];
export const cardById = Object.fromEntries(CARDS.map(c => [c.id, c])) as Record<CardId, Card>;

/** Konfession in zwei weiteren, ebenso willkürlichen Reihenfolgen (für Gamma). */
export const KONF_ORDERS: { label: string; rules: string; map: (x: number) => number | null }[] = [
  { label: 'evangelisch, katholisch, andere, keine', rules: '1:2=1; 3=2; 4:5=3; 6=4; else=NA', map: konfMap },
  { label: 'keine, evangelisch, katholisch, andere', rules: '6=1; 1:2=2; 3=3; 4:5=4; else=NA', map: x => (x === 6 ? 1 : x === 1 || x === 2 ? 2 : x === 3 ? 3 : x === 4 || x === 5 ? 4 : null) },
  { label: 'katholisch, keine, andere, evangelisch', rules: '3=1; 6=2; 4:5=3; 1:2=4; else=NA', map: x => (x === 3 ? 1 : x === 6 ? 2 : x === 4 || x === 5 ? 3 : x === 1 || x === 2 ? 4 : null) },
];

export const LEVEL_MEASURES: Record<Level, MeasureId[]> = {
  nominal: ['V', 'phi'],
  ordinal: ['gamma', 'tau', 'rho'],
  metrisch: ['r', 'rho'],
};

export const STAMPS = ['trägt', 'schrumpft', 'nur in einem Landesteil', 'kehrt sich um'] as const;
export type Stamp = typeof STAMPS[number];

/** Die Wirtschaftslage als Drittvariable für die Karte „West oder Ost“. */
export const LAGE = { rules: '1:2=1 [gut]; 3=2 [teils/teils]; 4:5=3 [schlecht]; else=NA', groups: ['gut', 'teils/teils', 'schlecht'] };

export const ROLE = {
  office: 'Beratungsbüro „Querschnitt“ (fiktiv)',
  fund: 'Förderfonds „Gemeinsinn“ (fiktiv)',
};

export const hintTexts: Record<Level, { think: string; pointer: string; concept: { id: string; label: string } }> = {
  nominal: {
    think: 'Kategorien ohne Reihenfolge: Welches Maß braucht keine Rangfolge? Und wie nimmst du die Ost-Überquote aus dem Spiel?',
    pointer: 'cramers_v() beruht auf χ²; mit weights = wghtpew rechnest du für Deutschland. group_by(eastwest) trennt West und Ost.',
    concept: { id: 'cramers_v', label: 'Cramér-V' },
  },
  ordinal: {
    think: 'Geordnete Stufen ohne gleiche Abstände: Welche Maße nutzen nur die Reihenfolge? Wie nimmst du die Ost-Überquote aus dem Spiel?',
    pointer: 'goodman_gamma() und kendall_tau() nutzen die Rangfolge; kendall_tau() erst nach unlabel() (sonst sehr langsam). Mit weights = wghtpew rechnest du für Deutschland.',
    concept: { id: 'kendall_tau', label: 'Kendall Tau-b' },
  },
  metrisch: {
    think: 'Viele Stufen mit gleichen Abständen: Welches Maß nutzt die Abstände selbst? Wie nimmst du die Ost-Überquote aus dem Spiel?',
    pointer: 'pearson_cor() rechnet mit weights = wghtpew gewichtet; spearman_rho() nutzt Gewichte nur zur Fallauswahl.',
    concept: { id: 'pearson', label: 'Pearson-Korrelation' },
  },
};
export const WORKSHOP = '7 Bivariate Analyse (Gewichtung, Zusammenhangsmaße)';
```

- [ ] **Step 4: Prüflogik** – `src/tasks/s05-treiber/domain.ts`:

```ts
import type { SavFile } from '../../sandbox/readSav';
import type { Note } from '../kit/Feedback';
import { de, parseNumber } from '../kit/numbers';
import { WORK_MODES, type WorkMode } from '../kit/PartnerToggle';
import { crosstab, MEASURES, permutationV, validValues, type MeasureId } from '../kit/stats';
import { bool, oneOf, record, str } from '../kit/storage';
import type { TaskStatus } from '../types';
import { CARD_IDS, cardById, CARDS, KONF_ORDERS, LAGE, LEVEL_MEASURES, STAMPS, type Card, type CardId, type Level, type Stamp } from './content';

export const MEASURE_IDS = ['V', 'phi', 'gamma', 'tau', 'rho', 'r'] as const satisfies readonly MeasureId[];
const SIGNED: MeasureId[] = ['gamma', 'tau', 'rho', 'r'];

/** Spalten, die alle Karten brauchen: Zufriedenheit (umgepolt und original), Gewicht, Landesteil, Wirtschaftslage-Gruppe. */
export type Prepared = { sav: SavFile; y: Float64Array; yOrig: Float64Array; w: Float64Array; east: Float64Array; lage: Float64Array };

export function prepare(sav: SavFile): Prepared {
  const yOrig = validValues(sav.byName.get('ps03')!);
  const ep01 = validValues(sav.byName.get('ep01')!);
  return {
    sav, yOrig,
    // rec(ps03, rules = "rev"): max + min − x = 7 − x, höher = zufriedener
    y: Float64Array.from(yOrig, v => (Number.isNaN(v) ? NaN : 7 - v)),
    w: validValues(sav.byName.get('wghtpew')!),
    east: validValues(sav.byName.get('eastwest')!),
    lage: Float64Array.from(ep01, v => (v <= 2 ? 1 : v === 3 ? 2 : v <= 5 ? 3 : NaN)),
  };
}

/** Werte einer Karte, nach der Umkodierung wie in R. */
export function cardValues(p: Prepared, card: Card, map = card.recode?.map): Float64Array {
  const raw = validValues(p.sav.byName.get(card.source)!);
  return map ? Float64Array.from(raw, v => (Number.isNaN(v) ? NaN : map(v) ?? NaN)) : raw;
}

export type Stratum = { label: string; keep: (i: number) => boolean };
/** West und Ost – bei der Karte „West oder Ost“ stattdessen die Wirtschaftslage als Drittvariable. */
export function strata(p: Prepared, card: Card): Stratum[] {
  if (card.id === 'eastwest') return LAGE.groups.map((label, g) => ({ label: `Wirtschaftslage ${label}`, keep: i => p.lage[i] === g + 1 }));
  return [{ label: 'West', keep: i => p.east[i] === 1 }, { label: 'Ost', keep: i => p.east[i] === 2 }];
}
const only = (x: Float64Array, keep: (i: number) => boolean) => Float64Array.from(x, (v, i) => (keep(i) ? v : NaN));

export type Variant = { measure: MeasureId; weighted: boolean; stratum: number; reversed: boolean; value: number };

/** Alle Werte einer Karte: Maß × Gewicht × gesamt/Landesteile × ps03 umgepolt oder original. */
export function variants(p: Prepared, card: Card): Variant[] {
  const x = cardValues(p, card), groups = strata(p, card), out: Variant[] = [];
  for (const measure of MEASURE_IDS) for (const reversed of SIGNED.includes(measure) ? [true, false] : [true]) {
    const y = reversed ? p.y : p.yOrig;
    for (const weighted of [true, false]) for (let s = -1; s < groups.length; s++) {
      const keep = s < 0 ? () => true : groups[s].keep;
      out.push({ measure, weighted, stratum: s, reversed, value: MEASURES[measure].fn(only(y, keep), only(x, keep), weighted ? p.w : null) });
    }
  }
  return out;
}

const decimals = (s: string) => (s.trim().replace(/^[−–-]/, '').split(/[.,]/)[1] ?? '').length;
/** Toleranz aus den eingegebenen Nachkommastellen: 0,54 → ±0,005; 0,544 → ±0,0005. */
export const tolerance = (input: string) => (decimals(input) >= 2 ? 0.5 * 10 ** -decimals(input) + 1e-9 : null);

const fmt = (x: number) => de(x, 3);
export const measureLabel = (m: MeasureId) => MEASURES[m].label;
const variantText = (v: Variant, groups: string[]) =>
  `${measureLabel(v.measure)} ${v.weighted ? 'mit' : 'ohne'} Gewicht${v.stratum >= 0 ? ` (${groups[v.stratum]})` : ''}${v.reversed ? '' : ' mit ps03 in der Originalkodierung'} = ${fmt(v.value)}`;

/** Richtungssatz in Worten. */
export function direction(card: Card, value: number): string {
  if (card.high === null || Math.abs(value) < 0.005) return 'Eine Richtung lässt sich hier nicht angeben.';
  return `Wer ${card.high}, ist eher ${value > 0 ? 'zufriedener' : 'unzufriedener'} mit der Demokratie.`;
}

export type Entry = { measure: MeasureId | ''; weighted: boolean; value: string };

/** Wertedetektor: Welcher Variante entspricht die eingetragene Zahl? */
export function checkEntry(p: Prepared, card: Card, vars: Variant[], e: Entry): Note[] {
  const x = parseNumber(e.value);
  if (x === null || !e.measure) return [];
  const tol = tolerance(e.value);
  if (tol === null) return [{ tone: 'hint', text: 'Trag den Wert mit drei Nachkommastellen ein, so wie R ihn zeigt.' }];
  const groups = strata(p, card).map(s => s.label);
  const hits = vars.filter(v => Math.abs(v.value - x) <= tol).sort((a, b) => Math.abs(a.value - x) - Math.abs(b.value - x));
  const notes: Note[] = [];
  if (e.measure === 'rho' && e.weighted) notes.push({ tone: 'hint', text: 'spearman_rho() nutzt Gewichte nur zur Fallauswahl – gewichtet und ungewichtet ist ρ hier gleich.' });
  const want = hits.find(v => v.measure === e.measure && v.weighted === e.weighted && v.stratum < 0 && v.reversed);
  if (want) return [...notes, { tone: 'ok', text: `Stimmt: ${variantText(want, groups)}. ${SIGNED.includes(want.measure) ? direction(card, want.value) : ''}`.trim() }];
  const same = hits.find(v => v.measure === e.measure && v.stratum < 0 && v.reversed);
  if (same) return [...notes, { tone: 'hint', text: `Das ist ${variantText(same, groups)}. ${e.weighted ? 'Für Deutschland rechnest du mit weights = wghtpew.' : 'Du hast oben „ohne Gewicht“ angegeben.'}` }];
  const orig = hits.find(v => !v.reversed);
  if (orig) return [...notes, { tone: 'warn', text: `Das ist ${variantText(orig, groups)}. Das Vorzeichen passt zu ps03 mit 1 = sehr zufrieden – hast du ps03 zuerst umgepolt?` }];
  const part = hits.find(v => v.stratum >= 0);
  if (part) return [...notes, { tone: 'hint', text: `Das ist ${variantText(part, groups)} – gesucht ist hier der Wert für ganz Deutschland.` }];
  if (hits[0]) return [...notes, { tone: 'hint', text: `Das ist ${variantText(hits[0], groups)} – oben hast du ${measureLabel(e.measure)} gewählt.` }];
  return [...notes, { tone: 'warn', text: 'Diesen Wert finde ich für diese Karte nicht. Prüfe Umpolen, Umkodierung und Gewicht.' }];
}

/** Werte für die Landesteile (bzw. Wirtschaftslage-Gruppen): mit oder ohne Gewicht, ps03 umgepolt. */
export function checkStrata(p: Prepared, card: Card, vars: Variant[], measure: MeasureId | '', inputs: string[]): Note[] {
  if (!measure) return [];
  const groups = strata(p, card).map(s => s.label);
  return inputs.flatMap((input, s): Note[] => {
    const x = parseNumber(input), tol = tolerance(input);
    if (x === null || s >= groups.length) return [];
    if (tol === null) return [{ tone: 'hint', text: `${groups[s]}: bitte mit drei Nachkommastellen.` }];
    const hit = vars.find(v => v.measure === measure && v.stratum === s && v.reversed && Math.abs(v.value - x) <= tol);
    const other = vars.find(v => Math.abs(v.value - x) <= tol);
    return [hit
      ? { tone: 'ok', text: `${groups[s]}: ${measureLabel(measure)} = ${fmt(hit.value)} – stimmt.` }
      : { tone: 'warn', text: other ? `${groups[s]}: Das ist ${variantText(other, groups)}.` : `${groups[s]}: Diesen Wert finde ich nicht. Filtere mit filter() oder group_by() und rechne dasselbe Maß.` }];
  });
}

/** Offengelegte Stempel-Regel. */
export const STAMP_RULE = 'kehrt sich um: Die Landesteile haben verschiedene Vorzeichen, beide mindestens 0,03 vom Nullpunkt entfernt. · nur in einem Landesteil: Ein Wert ist mindestens doppelt so groß wie der andere, und der kleinere liegt unter 0,1. · schrumpft: Im Mittel liegen die Landesteile unter 85 % des Gesamtwerts. · Sonst: trägt.';

export function stampReading(total: number, parts: number[], signed: boolean): Stamp {
  const abs = parts.map(Math.abs);
  if (signed && parts.some(a => a >= 0.03) && parts.some(a => a <= -0.03)) return 'kehrt sich um';
  if (Math.max(...abs) >= 2 * Math.min(...abs) && Math.min(...abs) < 0.1) return 'nur in einem Landesteil';
  if (abs.reduce((a, b) => a + b, 0) / abs.length < 0.85 * Math.abs(total)) return 'schrumpft';
  return 'trägt';
}

export function checkStamp(p: Prepared, card: Card, vars: Variant[], measure: MeasureId | '', stamp: Stamp | ''): Note[] {
  if (!stamp) return [];
  const m = measure || LEVEL_MEASURES[card.level][0];
  const total = vars.find(v => v.measure === m && v.weighted && v.stratum < 0 && v.reversed)!.value;
  const parts = strata(p, card).map((_, s) => vars.find(v => v.measure === m && !v.weighted && v.stratum === s && v.reversed)!.value);
  const mine = stampReading(total, parts, SIGNED.includes(m));
  const where = card.id === 'eastwest' ? 'in den drei Wirtschaftslage-Gruppen' : 'in West und Ost';
  const values = `${measureLabel(m)} gesamt ${fmt(total)}, ${where} ${parts.map(fmt).join(' / ')}`;
  return stamp === mine
    ? [{ tone: 'ok', text: `Meine Lesart nach der offengelegten Regel ist auch „${mine}“ (${values}).` }]
    : [{ tone: 'hint', text: `Nach der offengelegten Regel lese ich „${mine}“ (${values}). Du stempelst „${stamp}“ – die Entscheidung bleibt bei dir; begründe sie im Satz.` }];
}

/** Passung von Maß und Skalenniveau: Denkanstöße, keine Bewertung. */
export function fitNotes(p: Prepared, card: Card, vars: Variant[], measure: MeasureId | ''): Note[] {
  if (!measure) return [];
  const v = (m: MeasureId, weighted = true) => vars.find(x => x.measure === m && x.weighted === weighted && x.stratum < 0 && x.reversed)!.value;
  const notes: Note[] = [];
  const x = cardValues(p, card), t = crosstab(p.y, x);
  if (measure === 'V' && card.level !== 'nominal') {
    const rv = permutationV(p.y, x, p.w);
    notes.push({ tone: 'hint', text: v('V') < 1.5 * rv
      ? `Zufalls-V: Vertauscht man die Zufriedenheit zufällig, ergibt sich schon V ≈ ${fmt(rv)}. Dein V (${fmt(v('V'))}) ist fast nur Tabellengröße.`
      : `V nutzt die Reihenfolge der Stufen nicht. Zum Vergleich: Zufalls-V ≈ ${fmt(rv)}.` });
  }
  if (measure === 'phi' && Math.min(t.rows.length, t.cols.length) > 2) notes.push({ tone: 'hint', text: `Phi ist für Vierfeldertafeln gedacht; diese Tabelle ist ${t.rows.length}×${t.cols.length} groß – Phi kann hier über 1 steigen. Nimm Cramér-V.` });
  if ((measure === 'gamma' || measure === 'tau') && card.id === 'konf') {
    const gammas = KONF_ORDERS.map(o => MEASURES.gamma.fn(p.y, cardValues(p, card, o.map), p.w));
    notes.push({ tone: 'warn', text: `Die Reihenfolge der Konfessionen ist willkürlich. Gamma je nach Reihenfolge: ${gammas.map(fmt).join(' / ')} (${KONF_ORDERS.map(o => o.label).join(' | ')}).` });
  }
  if (measure === 'gamma' && card.id !== 'konf') notes.push({ tone: 'hint', text: `Gamma übergeht Paare mit Bindungen und liegt deshalb über Tau-b (γ ${fmt(v('gamma'))}, τ ${fmt(v('tau'))}).` });
  if (measure === 'r' && card.level === 'ordinal') notes.push({ tone: 'hint', text: 'Pearson-r setzt gleiche Abstände zwischen den Stufen voraus. Hält das für diese Skala?' });
  return notes;
}

export function checkLevel(card: Card, level: Level | ''): Note[] {
  if (!level) return [];
  if (level === card.level || level === card.alsoLevel) return [{ tone: 'ok', text: `${level} – passt. Dazu passen ${LEVEL_MEASURES[level].map(measureLabel).join(', ')}.` }];
  return [{ tone: 'hint', text: `Schau noch einmal ins Codebuch: ${card.question}` }];
}

/* ---------- Enthüllung: Rangliste in vier Währungen ---------- */

export const CURRENCIES = ['V', 'gamma', 'tau', 'r'] as const satisfies readonly MeasureId[];
export const VIEWS = ['weighted', 'unweighted', 'west', 'ost'] as const;
export type View = typeof VIEWS[number];
export const VIEW_LABELS: Record<View, string> = { weighted: 'gewichtet', unweighted: 'ohne Gewicht', west: 'nur West', ost: 'nur Ost' };
export type Reveal = Record<View, Record<CardId, Record<typeof CURRENCIES[number], number>>>;

export function reveal(p: Prepared): Reveal {
  const out = {} as Reveal;
  for (const view of VIEWS) {
    out[view] = {} as Reveal[View];
    const keep = view === 'west' ? (i: number) => p.east[i] === 1 : view === 'ost' ? (i: number) => p.east[i] === 2 : () => true;
    const y = only(p.y, keep), w = view === 'weighted' ? p.w : null;
    for (const card of CARDS) {
      const x = only(cardValues(p, card), keep);
      out[view][card.id] = Object.fromEntries(CURRENCIES.map(m => [m, card.id === 'eastwest' && (view === 'west' || view === 'ost') ? NaN : MEASURES[m].fn(y, x, w)])) as Reveal[View][CardId];
    }
  }
  return out;
}

/** Rangplätze nach Betrag (1 = stärkster Zusammenhang); nicht berechenbare Werte bekommen keinen Platz. */
export function ranks(values: Partial<Record<CardId, number>>): Partial<Record<CardId, number>> {
  const sorted = (Object.entries(values) as [CardId, number][]).filter(([, v]) => Number.isFinite(v)).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  return Object.fromEntries(sorted.map(([id], i) => [id, i + 1]));
}

export function revealNotes(r: Reveal, view: View): string[] {
  const byCurrency = Object.fromEntries(CURRENCIES.map(m => [m, ranks(Object.fromEntries(CARD_IDS.map(id => [id, r[view][id][m]])))])) as Record<typeof CURRENCIES[number], Partial<Record<CardId, number>>>;
  const notes: string[] = [];
  let jump: { id: CardId; from: number; to: number; m: string } | null = null;
  for (const id of CARD_IDS) for (const m of ['gamma', 'tau', 'r'] as const) {
    const a = byCurrency.V[id], b = byCurrency[m][id];
    if (a && b && (!jump || Math.abs(b - a) > Math.abs(jump.to - jump.from))) jump = { id, from: a, to: b, m: measureLabel(m) };
  }
  if (jump) notes.push(`${cardById[jump.id].title} steht bei V auf Platz ${jump.from}, bei ${jump.m} auf Platz ${jump.to}.`);
  const joker = CARDS.find(c => c.joker);
  if (joker && CURRENCIES.every(m => byCurrency[m][joker.id] === 1)) notes.push(`Der Joker „${cardById[joker.id].title}“ steht in allen vier Währungen auf Platz 1 – kein Wunder: Er misst fast dasselbe wie die Demokratiezufriedenheit.`);
  const without = Object.fromEntries(CURRENCIES.map(m => [m, ranks(Object.fromEntries(CARD_IDS.filter(id => !cardById[id].joker).map(id => [id, r[view][id][m]])))])) as typeof byCurrency;
  const firsts = CARD_IDS.filter(id => !cardById[id].joker && CURRENCIES.every(m => without[m][id] === 1));
  if (firsts.length) notes.push(`Unter den übrigen Kandidaten steht nur ${cardById[firsts[0]].title} in allen vier Währungen vorn.`);
  if (view === 'weighted') {
    const age = r.weighted.age.r, ageU = r.unweighted.age.r;
    notes.push(`Mit Gewicht ändert sich r für das Alter von ${fmt(ageU)} auf ${fmt(age)}: In West (${fmt(r.west.age.r)}) und Ost (${fmt(r.ost.age.r)}) zeigt der Zusammenhang in verschiedene Richtungen, ungewichtet rechnet die Ost-Überquote das gegeneinander auf.`);
    notes.push(`Für West oder Ost bleibt Gamma mit Gewicht fast gleich (${fmt(r.unweighted.eastwest.gamma)} → ${fmt(r.weighted.eastwest.gamma)}), V nicht (${fmt(r.unweighted.eastwest.V)} → ${fmt(r.weighted.eastwest.V)}).`);
  }
  return notes;
}

/* ---------- Gegenfrage, Zustand, Karte, R-Code ---------- */

export const DRIVER_WORDS = /\b(treib\w*|Treiber|bewirk\w*|verursach\w*|weil|führt|führen|sorgt|macht\s+\w+\s+zufrieden)\b/i;

export function driverQuestion(text: string): Note[] {
  return DRIVER_WORDS.test(text)
    ? [{ tone: 'hint', text: 'Du schreibst von einer Ursache. Zeigt ein Zusammenhangsmaß, was was bewirkt? Welche Drittvariable könnte beides beeinflussen – und kann die Richtung auch umgekehrt sein?' }]
    : [];
}

export type S05State = {
  mode: WorkMode;
  card: CardId | null;
  level: Level | '';
  measure: MeasureId | '';
  weighted: boolean;
  value: string;
  strata: string[];
  stamp: Stamp | '';
  sentence: string;
  second: { measure: MeasureId | ''; value: string; unweighted: string; veto: boolean };
  view: View;
  recommendation: string;
};

export const initialS05 = (): S05State => ({
  mode: 'solo', card: null, level: '', measure: '', weighted: true, value: '', strata: ['', '', ''], stamp: '', sentence: '',
  second: { measure: '', value: '', unweighted: '', veto: false }, view: 'weighted', recommendation: '',
});

export function parseS05(raw: unknown): S05State {
  const r = record(raw), sec = record(r.second), strataRaw = Array.isArray(r.strata) ? r.strata : [];
  return {
    mode: oneOf(r.mode, WORK_MODES, 'solo'),
    card: typeof r.card === 'string' && (CARD_IDS as string[]).includes(r.card) ? r.card as CardId : null,
    level: oneOf(r.level, ['nominal', 'ordinal', 'metrisch', ''] as const, ''),
    measure: oneOf(r.measure, [...MEASURE_IDS, ''] as const, ''),
    weighted: bool(r.weighted, true), value: str(r.value, 12),
    strata: [0, 1, 2].map(i => str(strataRaw[i], 12)),
    stamp: oneOf(r.stamp, [...STAMPS, ''] as const, ''), sentence: str(r.sentence, 600),
    second: { measure: oneOf(sec.measure, [...MEASURE_IDS, ''] as const, ''), value: str(sec.value, 12), unweighted: str(sec.unweighted, 12), veto: bool(sec.veto) },
    view: oneOf(r.view, VIEWS, 'weighted'), recommendation: str(r.recommendation, 800),
  };
}

export function statusS05(s: S05State): TaskStatus {
  if (s.card && s.measure && s.value.trim() && s.stamp && s.sentence.trim() && s.recommendation.trim()) return 'done';
  return s.card || s.level || s.measure || s.value.trim() || s.sentence.trim() || s.recommendation.trim() ? 'running' : 'open';
}

export function plenumLines(s: S05State): [string, string][] {
  const card = s.card ? cardById[s.card] : null;
  return [
    ['Kandidat', card ? `${card.title} (${card.id})` : ''],
    ['Maß = Wert · Stempel', s.measure && s.value.trim() ? `${measureLabel(s.measure)} = ${s.value.trim()}${s.stamp ? ` · ${s.stamp}` : ''}` : ''],
    ['Zweite Währung', s.second.measure && s.second.value.trim() ? `${measureLabel(s.second.measure)} = ${s.second.value.trim()}` : ''],
    ['„Treiber“?', s.second.veto ? 'Veto: kein Treiber' : ''],
    ['Satz für den Fonds', s.sentence.trim()],
    ['Empfehlung', s.recommendation.trim()],
  ];
}

/** Einlesen, ps03 umpolen und die Karte umkodieren. */
export function rSetupFor(card: Card): string {
  const recode = card.recode ? `,\n    ${card.id} = rec(${card.source}, rules = "${card.recode.rules}")` : '';
  return ['library(mariposa)', 'library(dplyr)', '',
    'allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav',
    'allbus <- allbus %>%',
    `  mutate(zufriedenheit = rec(ps03, rules = "rev")${recode})   # umgepolt: höher = zufriedener`].join('\n');
}

/** Vollständiger R-Code für eine Karte (Hilfestufe 4). */
export function rCodeFor(card: Card): string {
  const x = card.id;
  // Bei metrischen Karten wäre die Kreuztabelle zu lang (Alter: 79 Zeilen) – dort genügen die Korrelationen.
  const head = card.level === 'metrisch' ? [rSetupFor(card), ''] : [
    rSetupFor(card), '',
    '# Überblick: Zeilenprozente, gewichtet',
    `allbus %>% crosstab(${x}, zufriedenheit, percentages = "row", weights = wghtpew) %>% summary()`, '',
  ];
  const measure = card.level === 'nominal'
    ? ['# Maß: Cramér-V, gewichtet und ohne Gewicht', `allbus %>% cramers_v(zufriedenheit, ${x}, weights = wghtpew)`, `allbus %>% cramers_v(zufriedenheit, ${x})`]
    : card.level === 'ordinal'
      ? ['# Maß: Gamma und Tau-b, gewichtet (kendall_tau() erst nach unlabel(), sonst sehr langsam)', `allbus %>% goodman_gamma(zufriedenheit, ${x}, weights = wghtpew)`,
        `allbus %>% unlabel(zufriedenheit, ${x}, wghtpew) %>% kendall_tau(zufriedenheit, ${x}, weights = wghtpew)`]
      : ['# Maß: Pearson-r, gewichtet und ohne Gewicht', `allbus %>% pearson_cor(zufriedenheit, ${x}, weights = wghtpew)`, `allbus %>% pearson_cor(zufriedenheit, ${x})`];
  const split = card.id === 'eastwest'
    ? ['', '# Drittvariable: Hält der Unterschied innerhalb gleicher Wirtschaftslage?', `allbus <- allbus %>% mutate(lage = rec(ep01, rules = "${LAGE.rules}"))`,
      'allbus %>% filter(lage == 1) %>% goodman_gamma(zufriedenheit, eastwest)', 'allbus %>% filter(lage == 2) %>% goodman_gamma(zufriedenheit, eastwest)',
      'allbus %>% filter(lage == 3) %>% goodman_gamma(zufriedenheit, eastwest)']
    : ['', '# West und Ost getrennt', card.level === 'nominal'
      ? `allbus %>% group_by(eastwest) %>% cramers_v(zufriedenheit, ${x})`
      : card.level === 'ordinal'
        ? `allbus %>% unlabel(zufriedenheit, ${x}) %>% group_by(eastwest) %>% kendall_tau(zufriedenheit, ${x})`
        : `allbus %>% group_by(eastwest) %>% pearson_cor(zufriedenheit, ${x})`];
  return [...head, ...measure, ...split].join('\n');
}

export function scaffoldFor(card: Card): string {
  const fn = card.level === 'nominal' ? 'cramers_v' : card.level === 'ordinal' ? 'goodman_gamma' : 'pearson_cor';
  return `allbus <- allbus %>% mutate(zufriedenheit = rec(ps03, rules = "___"))\nallbus %>% ${fn}(zufriedenheit, ___, weights = ___)\nallbus %>% group_by(___) %>% ${fn}(zufriedenheit, ___)`;
}
```

- [ ] **Step 5: Tests laufen lassen**

Run: `node --import tsx --test src/tasks/s05-treiber/domain.test.ts` → `# pass 8`, `# fail 0`.
Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit` → `# pass 152`, `# fail 0`, `# skipped 3`; tsc ohne Ausgabe.

- [ ] **Step 6: Commit**

```bash
git add src/tasks/s05-treiber
git commit -m "Add session 5 domain: cards, value detector, fit prompts, stamp rule, ranking"
```

---
### Task 6: Sitzung 5 – Rangliste, Oberfläche und Anmeldung

**Files:**
- Create: `src/tasks/s05-treiber/RankChart.tsx`, `src/tasks/s05-treiber/Treiber.tsx`, `src/tasks/s05-treiber/index.ts`
- Test: `src/tasks/s05-treiber/task.test.ts`
- Modify: `src/tasks/registry.ts`, `src/domain/curriculum.ts`, `src/domain/curriculum.test.ts`, `src/tasks.css`

**Interfaces:**
- Consumes: alles aus Task 5; Kit-Bausteine; `TaskProps`, `TaskDef`.
- Produces: `treiber: TaskDef<S05State>` (id `s05`); Sitzung 5 im Curriculum mit `task: 's05'` und neuer Leitfrage.

- [ ] **Step 1: Failing test schreiben** – `src/tasks/s05-treiber/task.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSession } from '../testRender';
import { initialS05 } from './domain';

test('session 5 starts with the brief and the card draw', () => {
  const html = renderSession(4);
  assert.match(html, /Beratungsbüro „Querschnitt“ \(fiktiv\)/);
  assert.match(html, /Förderfonds „Gemeinsinn“ \(fiktiv\)/);
  assert.match(html, /Karte ziehen/);
  assert.doesNotMatch(html, /2 · Skalenniveau und Maß/);
  assert.match(html, /FÜR DAS PLENUM/);
});

test('a drawn card opens the steps; the ranking waits for value and stamp', () => {
  const card = renderSession(4, true, { tasks: { s05: { ...initialS05(), card: 'konf' } } });
  assert.match(card, /Konfession/);
  assert.match(card, /konf = rec\(rd01, rules = &quot;1:2=1 \[evangelisch\]/);
  assert.match(card, /4 · West und Ost/);
  assert.doesNotMatch(card, /Rangliste in vier Währungen/);
  const ew = renderSession(4, true, { tasks: { s05: { ...initialS05(), card: 'eastwest' } } });
  assert.match(ew, /4 · Innerhalb gleicher Wirtschaftslage/);
  const ready = renderSession(4, true, { tasks: { s05: { ...initialS05(), card: 'ep01', measure: 'gamma', value: '-0,500', stamp: 'trägt' } } });
  assert.match(ready, /7 · Die Rangliste in vier Währungen/);
  assert.match(ready, /Rangliste gewichtet: Cramér-V Platz 1/);
  assert.match(ready, /8 · Empfehlung an den Fonds/);
});

test('a finished entry offers the full script and marks the session done', () => {
  const done = { ...initialS05(), card: 'age' as const, measure: 'r' as const, value: '0,059', stamp: 'kehrt sich um' as const, sentence: 'Satz', recommendation: 'Empfehlung' };
  const html = renderSession(4, true, { tasks: { s05: done } });
  assert.match(html, /vollständiges R-Skript/);
  assert.match(html, /Gewichtung und Zusammenhang<small>Aufgabe abgeschlossen/);
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `node --import tsx --test src/tasks/s05-treiber/task.test.ts`
Expected: FAIL (Sitzung 5 zeigt „Aufgabe folgt“).

- [ ] **Step 3: Rangverlauf** – `src/tasks/s05-treiber/RankChart.tsx`:

```tsx
import { de } from '../kit/numbers';
import { CARD_IDS, cardById, type CardId } from './content';
import { CURRENCIES, measureLabel, ranks, VIEW_LABELS, type Reveal, type View } from './domain';

/** Rangverlauf aller Kandidaten über vier Währungen (V | Gamma | Tau-b | r); die eigene Karte ist hervorgehoben. */
export function RankChart({ data, view, own }: { data: Reveal; view: View; own: CardId | null }) {
  const byCurrency = CURRENCIES.map(m => ranks(Object.fromEntries(CARD_IDS.map(id => [id, data[view][id][m]]))));
  const rows = Math.max(...byCurrency.map(r => Object.keys(r).length));
  const W = 640, top = 34, step = 24, left = 190, right = 190, colX = (i: number) => left + i * ((W - left - right) / (CURRENCIES.length - 1));
  const y = (rank: number) => top + (rank - 1) * step;
  const leader = (m: number) => cardById[(Object.entries(byCurrency[m]).find(([, r]) => r === 1)?.[0] ?? CARD_IDS[0]) as CardId].title;
  const summary = `Rangliste ${VIEW_LABELS[view]}: ${CURRENCIES.map((m, i) => `${measureLabel(m)} Platz 1 ${leader(i)}`).join('; ')}.${own ? ` Deine Karte ${cardById[own].title}: Plätze ${byCurrency.map(r => r[own] ?? '–').join(', ')}.` : ''}`;
  return <figure className="s05-rank">
    <svg viewBox={`0 0 ${W} ${top + rows * step}`} role="img" aria-label={summary}>
      {CURRENCIES.map((m, i) => <text key={m} x={colX(i)} y={16} textAnchor="middle" className="head">{measureLabel(m)}</text>)}
      {CARD_IDS.map(id => {
        const pts = byCurrency.map((r, i) => (r[id] ? [colX(i), y(r[id]!)] as const : null));
        const mine = id === own, joker = cardById[id].joker;
        const path = pts.filter(Boolean).map((pt, k) => `${k ? 'L' : 'M'}${pt![0]} ${pt![1]}`).join(' ');
        const first = pts.find(Boolean), last = [...pts].reverse().find(Boolean);
        return <g key={id} className={mine ? 'own' : ''}>
          {path && <path d={path} fill="none" stroke={mine ? '#242822' : '#b9c7a5'} strokeWidth={mine ? 3 : 1.5} strokeDasharray={joker ? '4 3' : undefined} />}
          {pts.map((pt, i) => pt && <circle key={i} cx={pt[0]} cy={pt[1]} r={mine ? 5 : 3.5} fill={mine ? '#242822' : '#8fa58a'} />)}
          {first && <text x={first[0] - 10} y={first[1] + 4} textAnchor="end">{cardById[id].title}</text>}
          {last && <text x={last[0] + 10} y={last[1] + 4}>{cardById[id].title}</text>}
        </g>;
      })}
    </svg>
    <table className="s05-rank-table">
      <caption>Werte {VIEW_LABELS[view]} (Platz in Klammern)</caption>
      <thead><tr><th scope="col">Kandidat</th>{CURRENCIES.map(m => <th key={m} scope="col">{measureLabel(m)}</th>)}</tr></thead>
      <tbody>{CARD_IDS.map(id => <tr key={id} className={id === own ? 'own' : ''}>
        <th scope="row">{cardById[id].title}{cardById[id].joker ? ' (Joker)' : ''}</th>
        {CURRENCIES.map((m, i) => <td key={m}>{Number.isFinite(data[view][id][m]) ? `${de(data[view][id][m], 3)} (${byCurrency[i][id]})` : '–'}</td>)}
      </tr>)}</tbody>
    </table>
  </figure>;
}
```

- [ ] **Step 4: Oberfläche** – `src/tasks/s05-treiber/Treiber.tsx`:

```tsx
import { Shuffle } from 'lucide-react';
import { useMemo } from 'react';
import { Feedback } from '../kit/Feedback';
import { HintLadder } from '../kit/HintLadder';
import { PartnerToggle } from '../kit/PartnerToggle';
import { PlenumCard } from '../kit/PlenumCard';
import { RBlock } from '../kit/RBlock';
import { RoleBrief } from '../kit/RoleBrief';
import type { MeasureId } from '../kit/stats';
import type { TaskProps } from '../types';
import { CARD_IDS, CARDS, cardById, hintTexts, ROLE, STAMPS, WORKSHOP, type CardId, type Level } from './content';
import {
  checkEntry, checkLevel, checkStamp, checkStrata, driverQuestion, fitNotes, MEASURE_IDS, measureLabel, plenumLines, prepare,
  rCodeFor, reveal, revealNotes, rSetupFor, scaffoldFor, STAMP_RULE, statusS05, strata, variants, VIEW_LABELS, VIEWS, type S05State,
} from './domain';
import { RankChart } from './RankChart';

const LEVELS: Level[] = ['nominal', 'ordinal', 'metrisch'];

export function Treiber({ data, state, onChange, onConcept }: TaskProps<S05State>) {
  const set = (patch: Partial<S05State>) => onChange({ ...state, ...patch });
  const p = useMemo(() => prepare(data.sav), [data.sav]);
  const card = state.card ? cardById[state.card] : null;
  const vars = useMemo(() => (card ? variants(p, card) : []), [p, card]);
  const groups = card ? strata(p, card) : [];
  const main = card ? checkEntry(p, card, vars, state) : [];
  const ready = Boolean(card && state.value.trim() && state.stamp);
  const rev = useMemo(() => (ready ? reveal(p) : null), [p, ready]);
  const draw = () => set({ card: CARD_IDS[Math.floor(Math.random() * CARD_IDS.length)], level: '', measure: '', value: '', strata: ['', '', ''], stamp: '' });
  const setSecond = (patch: Partial<S05State['second']>) => set({ second: { ...state.second, ...patch } });

  return <div className="task s05">
    <RoleBrief role="Analyst:in im Beratungsbüro" title="Treiber-Rangliste">
      <p><strong>Dein neuer Job: Analyst:in im {ROLE.office}.</strong> Der {ROLE.fund} vergibt nächstes Jahr 1,5 Millionen Euro an Projekte. Er will das Geld dorthin lenken, wo die Zufriedenheit mit der Demokratie „entsteht“, und bestellt bei uns eine Rangliste: <strong>Welche Merkmale hängen am stärksten mit der Demokratiezufriedenheit in Deutschland zusammen?</strong> Grundlage ist der ALLBUS 2023, <code>ps03</code> (1 = sehr zufrieden … 6 = sehr unzufrieden). Polst du ps03 zuerst um, heißt ein höherer Wert: zufriedener.</p>
      <p>Du bekommst einen Kandidaten zugelost und lieferst genau einen Eintrag. Beachte:</p>
      <ul>
        <li>Die Rangliste soll für Deutschland gelten. Der ALLBUS hat Ostdeutsche absichtlich überrepräsentiert: 32 % der Befragten statt rund 17 % der Bevölkerung.</li>
        <li>Wähle das Maß, das zu deinen Variablen passt, und steh dafür ein.</li>
        <li>Der Fonds fördert in West und Ost. Prüfe, ob dein Zusammenhang in beiden Landesteilen hält.</li>
      </ul>
      <p><strong>Eintrag:</strong> Maß = Wert · Richtung in Worten · Stempel (trägt / schrumpft / nur in einem Landesteil / kehrt sich um) · ein Satz für den Fonds. Der Fonds nennt die Kandidaten „Treiber“. Ob das Wort stimmt, entscheidest du.</p>
    </RoleBrief>
    <PartnerToggle mode={state.mode} onChange={mode => set({ mode })}
      solo="Du bist erst Analyst:in (Maß wählen, gewichtet rechnen, Satz), dann Gegenleser:in des Fonds (zweite Währung, ohne Gewicht, Veto gegen „Treiber“). Die Rangliste am Ende zeigt dir, was sonst im Raum entsteht."
      pair="A ist Analyst:in: Maß wählen, gewichtet rechnen, Satz. B ist Gegenleser:in des Fonds: rechnet eine zweite Währung und ohne Gewicht, macht den Ost/West-Test und hat ein Veto gegen „Treiber“. Einigt euch auf einen Eintrag." />

    <section className="task-step">
      <h3>1 · Karte ziehen</h3>
      <div className="sandbox-chips">
        <button onClick={draw}><Shuffle size={14} aria-hidden="true" /> Karte ziehen</button>
        <label className="s05-pick">oder zugeteilte Karte wählen
          <select value={state.card ?? ''} onChange={e => set({ card: (e.target.value || null) as CardId | null, level: '', measure: '', value: '', strata: ['', '', ''], stamp: '' })}>
            <option value="">–</option>{CARDS.map(c => <option key={c.id} value={c.id}>{c.title}{c.joker ? ' (Joker)' : ''}</option>)}
          </select>
        </label>
      </div>
      {card && <article className="task-card s05-card">
        <h4>{card.title}{card.joker && <span className="s05-joker"> Joker</span>} <code>{card.id}</code></h4>
        <p>{card.question}</p>
        {card.joker && <p className="sandbox-note">Der Joker ist bewusst „zu gut“: Prüfe, ob er überhaupt ein eigener Kandidat ist.</p>}
      </article>}
    </section>

    {card && <>
      <section className="task-step">
        <h3>2 · Skalenniveau und Maß</h3>
        <p>Schau mit <code>codebook()</code> nach und entferne Sonderkodes mit <code>rec()</code>. Welches Skalenniveau hat dein Kandidat, welches Maß passt?</p>
        <RBlock code={rSetupFor(card)} file="treiber.R" />
        <div className="sandbox-chips" role="group" aria-label="Skalenniveau">
          {LEVELS.map(l => <button key={l} aria-pressed={state.level === l} onClick={() => set({ level: l })}>{l}</button>)}
        </div>
        <Feedback notes={checkLevel(card, state.level)} />
        <div className="task-grid">
          <label>Maß<select value={state.measure} onChange={e => set({ measure: e.target.value as MeasureId | '' })}>
            <option value="">bitte wählen</option>{MEASURE_IDS.map(m => <option key={m} value={m}>{measureLabel(m)}</option>)}
          </select></label>
        </div>
        <Feedback notes={fitNotes(p, card, vars, state.measure)} />
      </section>

      <section className="task-step">
        <h3>3 · Gewichtet rechnen</h3>
        <label className="s04-check"><input type="checkbox" checked={state.weighted} onChange={e => set({ weighted: e.target.checked })} /> gewichtet mit wghtpew</label>
        <div className="task-grid">
          <label>Wert (drei Nachkommastellen)<input type="text" inputMode="decimal" maxLength={12} value={state.value} onChange={e => set({ value: e.target.value })} /></label>
        </div>
        <Feedback notes={main} />
        <HintLadder hint={{ ...hintTexts[card.level], workshop: WORKSHOP, scaffold: scaffoldFor(card), solution: rCodeFor(card) }} onConcept={onConcept} file="treiber.R" />
      </section>

      <section className="task-step">
        <h3>4 · {card.id === 'eastwest' ? 'Innerhalb gleicher Wirtschaftslage' : 'West und Ost'}</h3>
        <p>{card.id === 'eastwest'
          ? 'Bei dieser Karte ist der Landesteil selbst der Kandidat. Prüfe stattdessen, ob der Unterschied innerhalb gleicher Wirtschaftslage hält (Drittvariable).'
          : 'Rechne dasselbe Maß getrennt für West und Ost. Hält der Zusammenhang in beiden Landesteilen?'}</p>
        <div className="task-grid">
          {groups.map((g, i) => <label key={g.label}>{g.label}<input type="text" inputMode="decimal" maxLength={12} value={state.strata[i] ?? ''}
            onChange={e => set({ strata: state.strata.map((v, k) => (k === i ? e.target.value : v)) })} /></label>)}
        </div>
        <Feedback notes={checkStrata(p, card, vars, state.measure, state.strata.slice(0, groups.length))} />
        <div className="sandbox-chips" role="group" aria-label="Stempel">
          {STAMPS.map(s => <button key={s} aria-pressed={state.stamp === s} onClick={() => set({ stamp: s })}>{s}</button>)}
        </div>
        <Feedback notes={checkStamp(p, card, vars, state.measure, state.stamp)} />
        <details className="s05-rule"><summary>Die offengelegte Regel</summary><p>{STAMP_RULE}</p></details>
      </section>

      <section className="task-step">
        <h3>5 · Dein Eintrag</h3>
        <label className="sandbox-label" htmlFor="s05-sentence">Ein Satz für den Fonds (Maß = Wert, Richtung in Worten, Stempel)</label>
        <textarea id="s05-sentence" maxLength={600} value={state.sentence} placeholder="Gamma = −0,54: Wer die Wirtschaftslage schlechter einschätzt, ist eher unzufriedener mit der Demokratie – in West und Ost (trägt)."
          onChange={e => set({ sentence: e.target.value })} />
        <Feedback notes={driverQuestion(state.sentence)} />
      </section>

      <section className="task-step">
        <h3>6 · Gegenlesen für den Fonds</h3>
        <p>Rechne eine zweite Währung und dein Maß ohne Gewicht. Trägt das Wort „Treiber“?</p>
        <div className="task-grid">
          <label>Zweite Währung<select value={state.second.measure} onChange={e => setSecond({ measure: e.target.value as MeasureId | '' })}>
            <option value="">bitte wählen</option>{MEASURE_IDS.filter(m => m !== state.measure).map(m => <option key={m} value={m}>{measureLabel(m)}</option>)}
          </select></label>
          <label>Wert, gewichtet<input type="text" inputMode="decimal" maxLength={12} value={state.second.value} onChange={e => setSecond({ value: e.target.value })} /></label>
          <label>Dein Maß ohne Gewicht<input type="text" inputMode="decimal" maxLength={12} value={state.second.unweighted} onChange={e => setSecond({ unweighted: e.target.value })} /></label>
        </div>
        <Feedback notes={[
          ...checkEntry(p, card, vars, { measure: state.second.measure, weighted: true, value: state.second.value }),
          ...checkEntry(p, card, vars, { measure: state.measure, weighted: false, value: state.second.unweighted }),
          ...fitNotes(p, card, vars, state.second.measure),
        ]} />
        <label className="s04-check"><input type="checkbox" checked={state.second.veto} onChange={e => setSecond({ veto: e.target.checked })} /> Veto: Das Wort „Treiber“ trägt hier nicht</label>
      </section>

      {rev && <section className="task-step">
        <h3>7 · Die Rangliste in vier Währungen</h3>
        <p>So stehen alle Kandidaten aus deiner Datei da – jede Spalte ist eine andere Währung. Deine Karte ist hervorgehoben.</p>
        <div className="sandbox-chips" role="group" aria-label="Ansicht">
          {VIEWS.map(v => <button key={v} aria-pressed={state.view === v} onClick={() => set({ view: v })}>{VIEW_LABELS[v]}</button>)}
        </div>
        <RankChart data={rev} view={state.view} own={card.id} />
        <ul className="s05-notes">{revealNotes(rev, state.view).map(n => <li key={n}>{n}</li>)}</ul>
      </section>}

      {rev && <section className="task-step">
        <h3>8 · Empfehlung an den Fonds</h3>
        <label className="sandbox-label" htmlFor="s05-rec">Wie sieht eine faire Rangliste aus – und passt das Wort „Treiber“? (2–3 Sätze)</label>
        <textarea id="s05-rec" maxLength={800} value={state.recommendation} onChange={e => set({ recommendation: e.target.value })} />
        <Feedback notes={driverQuestion(state.recommendation)} />
      </section>}
    </>}

    <PlenumCard title="Treiber-Rangliste" lines={plenumLines(state)} file="treiber-plenum.md" />
    {card && statusS05(state) === 'done' && <details className="s02-solution"><summary>Ein vollständiges R-Skript zum Mitnehmen</summary><RBlock code={rCodeFor(card)} file="treiber.R" /></details>}
  </div>;
}
```

- [ ] **Step 5: Aufgabendefinition** – `src/tasks/s05-treiber/index.ts`:

```ts
import type { TaskDef } from '../types';
import { initialS05, parseS05, statusS05, type S05State } from './domain';
import { Treiber } from './Treiber';

export const treiber: TaskDef<S05State> = {
  id: 's05',
  title: 'Treiber-Rangliste',
  role: 'Analyst:in im Beratungsbüro',
  intro: 'Ein (fiktiver) Förderfonds bestellt eine Rangliste: Was hängt am stärksten mit der Demokratiezufriedenheit zusammen? Du ziehst einen Kandidaten, wählst ein passendes Maß, rechnest gewichtet und prüfst West und Ost. Lade dafür deine ALLBUS-Datei.',
  requiredVariables: ['ps03', 'wghtpew', 'eastwest', 'ep01', 'ep03', 'ls01', 'id02', 'educ', 'pa01', 'rp01', 'rd01', 'gs01', 'age', 'pa02a', 'pt03'],
  initial: initialS05,
  parse: parseS05,
  status: statusS05,
  Component: Treiber,
};
```

- [ ] **Step 6: Anmelden** – `src/tasks/registry.ts` ersetzen durch:

```ts
import { schonGefragt } from './s01-schon-gefragt';
import { datenerfassung } from './s02-datenerfassung';
import { stuehle } from './s03-stuehle';
import { nennerCheck } from './s04-nenner-check';
import { treiber } from './s05-treiber';
import type { TaskDef, TaskId } from './types';

/** Alle gebauten Aufgaben. Sitzungen, deren Aufgabe hier fehlt, zeigen „Aufgabe folgt“. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const taskRegistry: Partial<Record<TaskId, TaskDef<any>>> = {
  s01: schonGefragt,
  s02: datenerfassung,
  s03: stuehle,
  s04: nennerCheck,
  s05: treiber,
};
```

- [ ] **Step 7: Curriculum** – bei Sitzung 5 Leitfrage und Aufgabe setzen, im Curriculum-Test die erwartete Liste anpassen (Endstand beider Dateien: Tag `plan2-t6`):

```bash
python3 - <<'EOF'
import pathlib
p = pathlib.Path('src/domain/curriculum.ts'); s = p.read_text()
old_q = "    question: 'Vertraut der Osten dem Bundestag weniger?',"
assert s.count(old_q) == 1
s = s.replace(old_q, "    question: 'Was hängt mit der Zufriedenheit mit der Demokratie zusammen?',")
i = s.index('id: 5,'); j = s.index('task: null,', i)
p.write_text(s[:j] + "task: 's05'," + s[j + len('task: null,'):])
t = pathlib.Path('src/domain/curriculum.test.ts'); s = t.read_text()
old = "['s01', 's02', 's03', 's04', null, null, null, null, null, null]"
assert s.count(old) == 1
t.write_text(s.replace(old, "['s01', 's02', 's03', 's04', 's05', null, null, null, null, null]"))
EOF
```

- [ ] **Step 8: Styles** – an `src/tasks.css` anhängen:

```css

/* Sitzung 5 · Treiber-Rangliste */
.s05-pick{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--muted)}
.s05-pick select{font:15px/1.4 var(--sans);border:1px solid var(--line);border-radius:6px;padding:6px 8px;background:#fff;color:var(--ink)}
.s05-card{margin-top:12px}
.s05-card h4 code{font-size:14px;color:var(--muted);margin-left:6px}
.s05-joker{font:600 12px/1 var(--sans);text-transform:uppercase;letter-spacing:.06em;color:#7d6b5d;margin-left:6px}
.s05-rule{margin:8px 0;font-size:14px}
.s05-rank{margin:12px 0}
.s05-rank svg{width:100%;height:auto;background:#fff;border:1px solid var(--line);border-radius:8px}
.s05-rank svg text{font:12px var(--sans);fill:var(--muted)}
.s05-rank svg text.head{font-weight:600;fill:var(--ink)}
.s05-rank svg .own text{fill:var(--ink);font-weight:600}
.s05-rank-table{width:100%;border-collapse:collapse;font-size:14px;margin-top:10px}
.s05-rank-table caption{text-align:left;color:var(--muted);margin-bottom:4px}
.s05-rank-table th,.s05-rank-table td{border-bottom:1px solid var(--line);padding:4px 6px;text-align:right}
.s05-rank-table th[scope=row],.s05-rank-table thead th:first-child{text-align:left}
.s05-rank-table tr.own{background:var(--soft);font-weight:600}
.s05-notes{margin:10px 0;padding-left:20px;font-size:15px}
.s05-notes li{margin:0 0 6px}
@media(max-width:560px){.s05-rank-table{font-size:12px}.s05-rank-table th,.s05-rank-table td{padding:3px 4px}}
```

- [ ] **Step 9: Tests und Typprüfung**

Run: `node --import tsx --test src/tasks/s05-treiber/*.test.ts` → `# pass 11`, `# fail 0`.
Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts` und `node_modules/.bin/tsc --noEmit` → `# pass 155`, `# fail 0`, `# skipped 3`; tsc ohne Ausgabe.

- [ ] **Step 10: Im Browser prüfen (mit eigener Datei).** Sitzung 5, Karte „Wirtschaftslage in Deutschland“: ordinal → „passt“; Gamma → Hinweis „liegt deshalb über Tau-b (γ -0,544, τ -0,387)“; Wert −0,544 gewichtet → „Stimmt: Gamma mit Gewicht = -0,544. Wer die Wirtschaftslage schlechter einschätzt, ist eher unzufriedener …“; −0,553 → „Gamma ohne Gewicht“; 0,544 → „Originalkodierung … umgepolt?“; West −0,533, Ost −0,588 → „stimmt“; Stempel „trägt“ → „Meine Lesart … ist auch „trägt““; Satz mit „treibt“ → Gegenfrage zur Drittvariable; danach Rangliste in vier Währungen (Alter bei V Platz 5, bei Gamma Platz 12; Joker überall Platz 1) mit Umschalter gewichtet/ohne Gewicht/nur West/nur Ost. Karte „Alter“ mit V → „Zufalls-V … ≈ 0,149“; Karte „Konfession“ mit Gamma → drei Reihenfolgen −0,147 / 0,135 / 0,043. Allein/zu zweit, 390 px ohne Überlaufen.

- [ ] **Step 11: Commit**

```bash
git add src/tasks/s05-treiber src/tasks/registry.ts src/domain/curriculum.ts src/domain/curriculum.test.ts src/tasks.css
git commit -m "Add session 5 task UI 'Treiber-Rangliste' with ranking in four currencies"
```

---
### Task 7: Echtdaten-Test, R-Prüfung der Lösungsskripte, Doku und Build

**Files:**
- Modify: `src/tasks/allbus.local.test.ts`, `scripts/export-task-scripts.ts`, `README.md`, `docs/PRUEFSTAND.md`, `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md`

**Interfaces:**
- Consumes: Domänenfunktionen der Sitzungen 4 und 5.

- [ ] **Step 1: Echtdaten-Test** – `src/tasks/allbus.local.test.ts` ersetzen durch (wird ohne `ALLBUS_SAV` übersprungen; nur aggregierte Werte):

```ts
// Läuft nur mit der eigenen GESIS-Datei: ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSav, type SavFile } from '../sandbox/readSav';
import { askedCount, findVar } from './s01-schon-gefragt/domain';
import { S02_VARS, sheets } from './s02-datenerfassung/content';
import { countCode, factorPosition, gradeCell, scanCode } from './s02-datenerfassung/domain';
import { describeHours, diagnoseSeats, hoursFor, rawCounts, seatsFor, validCodes } from './s03-stuehle/domain';
import { allTables, checkP1, denominators, fourfold, PARTY, percent, prepare as prepareS04, readings, stairs } from './s04-nenner-check/domain';
import { cardById } from './s05-treiber/content';
import { prepare as prepareS05, reveal, variants } from './s05-treiber/domain';

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
  for (const sheet of sheets) for (const v of S02_VARS) {
    const soll = sheet.cells[v].soll;
    if (soll.kind === 'open') continue;
    const code = soll.kind === 'value' ? soll.value : [...sav.byName.get(v)!.valueLabels].find(([, l]) => l.toUpperCase() === soll.label.toUpperCase())?.[0];
    assert.notEqual(code, undefined, `Bogen ${sheet.id}, ${v}`);
    assert.equal(gradeCell(sav, sheet, v, String(code)).status, 'match', `Bogen ${sheet.id}, ${v}`);
  }
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

test('session 4: the 87 %, three denominators, 18 readings and the stairs match the concept', { skip }, () => {
  const sav = load(), joint = prepareS04(sav), tables = allTables(joint);
  const party = fourfold(joint, PARTY);
  assert.deepEqual(party.n, { a: 127, b: 1829, c: 19, d: 810 });
  assert.deepEqual([percent(party, 'a', 'col'), percent(party, 'a', 'row'), percent(party, 'c', 'row'), percent(party, 'a', 'all')].map(r1), [87, 6.5, 2.3, 4.6]);
  assert.equal(r1(percent(fourfold(joint, { ...PARTY, weighted: true }), 'a', 'col')), 86.5);
  assert.deepEqual(denominators(joint), { cell: 127, nonvoters: 146, distrusting: 1956, all: 2785 });
  assert.match(checkP1(tables, joint, '87,0', '127')[0].text, /Genau so hat der Parteivorstand gerechnet/);
  assert.match(checkP1(tables, joint, '3,2', '')[0].text, /Lies pe05 noch einmal/);
  const rd = readings(joint).map(x => x.distrusting);
  assert.deepEqual([r1(Math.min(...rd)), r1(Math.max(...rd))], [6.5, 29.2]);
  const example = fourfold(joint, { item: 'pe05', distrust: [3, 4], nonvote: [-8], else0: false, weighted: false });
  assert.deepEqual([r1(percent(example, 'a', 'row')), example.n.a, r1(percent(example, 'c', 'row'))], [21.5, 386, 11.7]);
  assert.deepEqual(stairs(sav).map(x => r1(x.share)), [1.2, 4.4, 5.6, 8.8]);
});

test('session 5: measures per card, strata and the ranking match mariposa (ps03 reversed)', { skip }, () => {
  const p = prepareS05(load());
  const r3 = (x: number) => Math.round(x * 1000) / 1000;
  const get = (id: keyof typeof cardById, measure: string, weighted: boolean, stratum = -1) =>
    r3(variants(p, cardById[id]).find(v => v.measure === measure && v.weighted === weighted && v.stratum === stratum && v.reversed)!.value);
  assert.deepEqual([get('ep01', 'V', true), get('ep01', 'gamma', true), get('ep01', 'gamma', false), get('ep01', 'tau', true), get('ep01', 'tau', false, 0), get('ep01', 'tau', false, 1)], [0.277, -0.544, -0.553, -0.387, -0.367, -0.436]);
  assert.deepEqual([get('age', 'V', true), get('age', 'r', true), get('age', 'r', false), get('age', 'r', false, 0), get('age', 'r', false, 1)], [0.158, 0.059, 0.031, 0.095, -0.045]);
  assert.deepEqual([get('eastwest', 'V', true), get('eastwest', 'V', false), get('eastwest', 'gamma', true)], [0.186, 0.229, -0.35]);
  assert.deepEqual([get('konf', 'V', true), get('konf', 'gamma', true)], [0.105, -0.147]);
  assert.equal(get('pt03', 'tau', true), 0.485);
  const r = reveal(p);
  assert.equal(r3(r.weighted.rp01.tau), -0.136);
  assert.equal(r3(r.west.gs01.tau), -0.063);
});
```

- [ ] **Step 2: Mit eigener Datei laufen lassen**

Run: `ALLBUS_SAV="/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav" node --import tsx --test src/tasks/allbus.local.test.ts`
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 3: Skript-Export** – `scripts/export-task-scripts.ts` ersetzen durch:

```ts
// Schreibt die Lösungsskripte (Hilfestufe 4) der Lernpfad-Aufgaben als .R-Dateien, mit festem Dateipfad statt file.choose().
//   node --import tsx scripts/export-task-scripts.ts <datei.sav> <ordner>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { antraege, SETUP_SCRIPT } from '../src/tasks/s01-schon-gefragt/content';
import { R_SOLUTION as S02 } from '../src/tasks/s02-datenerfassung/content';
import { R_SOLUTION as S03 } from '../src/tasks/s03-stuehle/content';
import { R_SOLUTION as S04 } from '../src/tasks/s04-nenner-check/content';
import { CARDS } from '../src/tasks/s05-treiber/content';
import { rCodeFor } from '../src/tasks/s05-treiber/domain';

const [sav, out] = process.argv.slice(2);
if (!sav || !out) {
  console.error('Aufruf: node --import tsx scripts/export-task-scripts.ts <datei.sav> <ordner>');
  process.exit(1);
}
const withFile = (code: string) => code.replaceAll('file.choose()', () => JSON.stringify(sav));
const scripts: Record<string, string> = {
  's01-schon-gefragt.R': `${SETUP_SCRIPT}\n${antraege.map(a => a.hint.solution).join('\n')}\n`,
  's02-datenerfassung.R': S02,
  's03-stuehle.R': S03,
  's04-nenner-check.R': S04,
  ...Object.fromEntries(CARDS.map(c => [`s05-treiber-${c.id}.R`, rCodeFor(c)])),
};
mkdirSync(out, { recursive: true });
for (const [name, code] of Object.entries(scripts)) writeFileSync(join(out, name), withFile(code));
console.log(`${Object.keys(scripts).length} Skripte nach ${out} geschrieben.`);
```

- [ ] **Step 4: Lösungsskripte in R ausführen**

Run: `node --import tsx scripts/export-task-scripts.ts "$PWD/src/sandbox/fixtures/sandbox-fixture.sav" /tmp/rcheck2-fixture && Rscript --vanilla scripts/verify-task-scripts.R /tmp/rcheck2-fixture`
Expected: `17 von 17 Skripten laufen fehlerfrei.`

Run: `node --import tsx scripts/export-task-scripts.ts "/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav" /tmp/rcheck2-real && Rscript --vanilla scripts/verify-task-scripts.R /tmp/rcheck2-real` (dauert gut eine Minute)
Expected: `17 von 17 Skripten laufen fehlerfrei.`

- [ ] **Step 5: README, Prüfstand, Spezifikation.** Die drei Dateien auf den Stand von Tag `plan2-t7` bringen (`git show plan2-t7:<pfad> > <pfad>`). Die Änderungen im Wortlaut (alt → neu, jeweils ganze Zeilen):

`README.md`:

```text
alt:
Stand: 29. September 2026 · Lernpfad nach dem Sitzungsplan Statistik Ib: jede Sitzung eine eigene Aufgabe auf echten ALLBUS-Daten, dazu die freie Karte zur Orientierung.
Gebaut sind Sitzung 1 „Schon gefragt?“ (Referent:in in einem fiktiven Abgeordnetenbüro prüft mit `find_var()` und `codebook()`, welche Frageideen der ALLBUS schon beantwortet), Sitzung 2 „Erster Tag in der Datenerfassung“ (drei nachgestellte Papierbögen codieren, Regeln für mehrdeutige Kreuze, Doppelerfassung) und Sitzung 3 „Deutschland in 100 Stühlen“ (die Wahlabsicht als Saal mit 100 Stühlen, die Arbeitsstunden als Stuhlreihe). Sitzung 4 enthält bis zu ihrem Umbau die Mission „Belege es!“ („Wer Politikern misstraut, geht gar nicht mehr wählen“); für die Sitzungen 5–10 folgen die Aufgaben nach der Spezifikation `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md`. Die `.sav`-Datei wird nur im Browser gelesen und nicht gespeichert; gespeichert werden ausschließlich eigene Entscheidungen und Texte (`statistikatlas.aufgaben.v1`, für die Mission `statistikatlas.missionen.v1`).
Der zweite Reiter **Freie Karte** ergänzt den Lernpfad als Orientierungshilfe. „Zurück zu Sitzung N“ führt in dieselbe Sitzung zurück; der Stand der Aufgabe bleibt erhalten. `?ansicht=karte` öffnet direkt das Netz. Prüfung: `pnpm test` (synthetische Testdateien aus `scripts/make-sandbox-fixture.R`); mit der eigenen Datei `ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test` für die geprüften Referenzwerte; `scripts/export-task-scripts.ts` mit `scripts/verify-task-scripts.R` führt die Lösungsskripte der Aufgaben in R aus, `scripts/export-sandbox-grid.ts` mit `scripts/verify-sandbox-r.R` gleicht den R-Code der Mission ab.

neu:
Stand: 30. September 2026 · Lernpfad nach dem Sitzungsplan Statistik Ib: jede Sitzung eine eigene Aufgabe auf echten ALLBUS-Daten, dazu die freie Karte zur Orientierung.
Gebaut sind Sitzung 1 „Schon gefragt?“ (Referent:in in einem fiktiven Abgeordnetenbüro prüft mit `find_var()` und `codebook()`, welche Frageideen der ALLBUS schon beantwortet), Sitzung 2 „Erster Tag in der Datenerfassung“ (drei nachgestellte Papierbögen codieren, Regeln für mehrdeutige Kreuze, Doppelerfassung) Sitzung 3 „Deutschland in 100 Stühlen“ (die Wahlabsicht als Saal mit 100 Stühlen, die Arbeitsstunden als Stuhlreihe), Sitzung 4 „Nenner-Check“ (Faktenchecker:in baut die „87 %“ einer fiktiven Pressemitteilung in R nach, dreht den Nenner und rechnet eine eigene Lesart; der Browser erkennt aus Prozentwert und Zellen-n, wie gerechnet wurde) und Sitzung 5 „Treiber-Rangliste“ (Analyst:in eines fiktiven Beratungsbüros zieht einen von 13 Kandidaten, wählt ein passendes Zusammenhangsmaß, rechnet gewichtet und für West und Ost; danach die Rangliste in vier Währungen). Für die Sitzungen 6–10 folgen die Aufgaben nach der Spezifikation `docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md`. Die `.sav`-Datei wird nur im Browser gelesen und nicht gespeichert; gespeichert werden ausschließlich eigene Entscheidungen und Texte (`statistikatlas.aufgaben.v1`).
Der zweite Reiter **Freie Karte** ergänzt den Lernpfad als Orientierungshilfe. „Zurück zu Sitzung N“ führt in dieselbe Sitzung zurück; der Stand der Aufgabe bleibt erhalten. `?ansicht=karte` öffnet direkt das Netz. Prüfung: `pnpm test` (synthetische Testdateien aus `scripts/make-sandbox-fixture.R`); mit der eigenen Datei `ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav pnpm test` für die geprüften Referenzwerte; `scripts/export-task-scripts.ts` mit `scripts/verify-task-scripts.R` führt die Lösungsskripte der Aufgaben in R aus.
```

`docs/PRUEFSTAND.md`:

```text
neu:
## 30. September 2026 – Lernpfad: Sitzungen 4 und 5

- Sitzung 4 „Nenner-Check“ ersetzt die Mission „Belege es!“: Vorab-Satz „Die 87 % beziehen sich auf …“, Prüfauftrag 1 (Zahl nachbauen), 2 (eine Zelle, drei Nenner, danach das Nenner-Bild) und 3 (eigene Lesart mit Item, Grenze, „weiß nicht“ und Gewicht, danach der Streifen der 18 vorbereiteten Lesarten), Urteil in fünf Stufen, Faktencheck-Satz, höchstens drei Gegenfragen, Zusatz „Misstrauens-Zähler“. Die Rückwärtssuche rechnet 1.856 Vierfeldertafeln (58 Zweiteilungen × 8 Nichtwahl-Definitionen × else=0 × Gewicht) und sagt in Worten, wer die 100 % sind; Stolperwege (vertauschter Nenner, alle als 100 %, andere Zelle, pe05 nicht umgepolt, else=0, untag_na() vergessen) bekommen eine gezielte Rückfrage.
- Sitzung 5 „Treiber-Rangliste“: 13 Karten (zwölf Kandidaten und pt03 als Joker), ps03 umgepolt (höher = zufriedener), Skalenniveau und Maß mit Passungs-Hinweisen (Zufalls-V, drei Reihenfolgen der Konfession für Gamma, Gamma über Tau-b), Wertedetektor über Maß × Gewicht × gesamt/Landesteile × Kodierung von ps03, West/Ost (bei der Karte „West oder Ost“ die Wirtschaftslage als Drittvariable), Stempel nach offengelegter Regel, Gegenlesen mit zweiter Währung, Wert ohne Gewicht und Veto gegen „Treiber“, Rangliste in vier Währungen (gewichtet, ohne Gewicht, nur West, nur Ost) und Empfehlung an den Fonds.
- Gemeinsamer Rechenkern `src/tasks/kit/stats.ts`: gewichtete Kreuztabellen, χ², Cramér-V, Phi, Gamma (wie mariposa auf gerundeten gewichteten Zellen), Tau-b (Paargewicht √(wᵢ·wⱼ) über Zellsummen), Spearman (Gewichte nur zur Fallauswahl), Pearson, Zufalls-V; auf der Testdatei auf acht Nachkommastellen gleich mit mariposa 0.7.3.
- Die Mission „Belege es!“ mit Werkbank, Live-Tabelle, Spiegel, Zerlegen und Behauptungen ist entfernt, ebenso der Speicherschlüssel `statistikatlas.missionen.v1` und der R-Abgleich der Mission; `src/sandbox/` enthält nur noch Datei-Einleser, ALLBUS-Prüfung, Ladefeld und Testdaten. Die Testdatei kennt jetzt auch ps03, pe05, ep01, ep03, id02, educ, rp01, rd01 und gs01.
- 155 automatisierte Tests bestanden (5 Echtdaten-Tests ohne Datei übersprungen); mit ZA8831 v1.3.0 stimmen die geprüften Referenzwerte (u. a. 87,0 % = 127 von 146, 6,5 % von 1.956, 4,6 % von 2.785, Lesarten 6,5–29,2 %, Treppe 8,8 %; Wirtschaftslage V .277, Gamma −.544, Tau-b −.387; Alter r .059 gewichtet, .031 ohne Gewicht, West .095, Ost −.045). Lösungsskripte laufen mit mariposa 0.7.3 auf Testdatei und echter Datei (17/17).

---

```

`docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md`:

```text
alt:
- **Festgelegt:** `ps03` wird zuerst umgepolt (höher = zufriedener); `kendall_tau()` nach `unlabel()`, bis mariposa behoben ist; `pt03` bleibt als bewusst „zu guter“ Kandidat im Deck; Hinweis, dass `spearman_rho()` Gewichte nur zur Fallauswahl nutzt.
src/sandbox/                   bleibt: readSav, allbus (Laden, Validierung), format, crosstab-Kern,
                               Gegenfragen-Regeln (für Sitzung 4 angepasst); Werkbank, LiveTable,
                               Mirror, Decompose, Verdict und die Missionen 3/5 entfallen

neu:
- **Festgelegt:** `ps03` wird zuerst umgepolt (höher = zufriedener); `kendall_tau()` nach `unlabel()`, bis mariposa behoben ist; `pt03` bleibt als bewusst „zu guter“ Kandidat im Deck (13. Karte, „Joker“); Hinweis, dass `spearman_rho()` Gewichte nur zur Fallauswahl nutzt. Stempel-Regel (offengelegt): „kehrt sich um“, wenn die Landesteile verschiedene Vorzeichen haben (beide mindestens 0,03 vom Nullpunkt); „nur in einem Landesteil“, wenn ein Wert mindestens doppelt so groß ist wie der andere und der kleinere unter 0,1 liegt; „schrumpft“, wenn die Landesteile im Mittel unter 85 % des Gesamtwerts liegen; sonst „trägt“. Bei der Karte „West oder Ost“ ersetzt die Wirtschaftslage (gut/teils/schlecht) als Drittvariable den Ost/West-Test. Leitfrage der Sitzung: „Was hängt mit der Zufriedenheit mit der Demokratie zusammen?“
src/sandbox/                   bleibt: readSav, allbus (Laden, Validierung), DataDrop, Testdaten; Vierfelder-
                               Kern und Gegenfragen für Sitzung 4 liegen in s04-nenner-check (Stand Etappe 2);
                               Werkbank, LiveTable, Mirror, Decompose, Verdict und alle Missionen entfallen
```


- [ ] **Step 6: Gesamtprüfung und Build**

Run: `node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts`
Expected: `# pass 155`, `# fail 0`, `# skipped 5`.
Run: `node --import tsx scripts/generate-map-layout.ts && node_modules/.bin/tsc --noEmit && node_modules/.bin/vite build && node scripts/export-offline.mjs`
Expected: `✓ built in …` und `Offline-Prototyp erstellt: … KB, alle Skripte und Stile eingebettet.`

- [ ] **Step 7: Abschließender Browserdurchlauf** mit eigener Datei: Sitzungen 4 und 5 je einmal allein und zu zweit, Neuladen (Stand bleibt, Datei muss neu geladen werden), Sitzungen 1–3 unverändert, Sitzungen 6–10 „Aufgabe folgt“, Downloads (Plenumskarten, R-Skripte), 390 px ohne Überlaufen, keine Konsolenfehler.

- [ ] **Step 8: Commit**

```bash
git add src/tasks/allbus.local.test.ts scripts/export-task-scripts.ts README.md docs/PRUEFSTAND.md docs/entwicklung/spezifikationen/2026-09-29-lernpfad-zehn-aufgaben-design.md
git commit -m "Add real-data checks, R script verification and docs for sessions 4 and 5"
```

---

## Nächste Etappen

Etappe 3: Sitzungen 6–7 (t-Test, ANOVA, Tukey, Korrelationsmatrix; α, ω, Mittelwertindex). Etappe 4: Sitzungen 8–10 (OLS einfach/multipel, Wackeltest; Logit per IRLS). Der Rechenkern `src/tasks/kit/stats.ts` wird dann um diese Verfahren erweitert (ggf. als Ordner). Jede Etappe bekommt einen eigenen Plan nach diesem Muster.
