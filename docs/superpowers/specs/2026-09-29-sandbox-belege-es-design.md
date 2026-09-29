# Sandbox „Belege es!“ – Designspezifikation

Stand: 29. September 2026 · Prototyp 1 der Statistik-Sandbox im Statistikatlas · Grundlage: gemeinsame Abstimmung und klickbare Entwürfe mit echten ALLBUS-Zahlen. Überarbeitet: Die Missionen bilden den Kern eines neuen Lernpfads nach dem Sitzungsplan (Abschnitt 3a); ein eigener Reiter „Sandbox“ entfällt.

## 1. Ziel

Studierende in Methoden Ib erleben Statistik als Werkzeug, mit dem sie eine öffentliche Behauptung selbst prüfen und ein begründetes Urteil fällen. Sie bauen das Argument eigenständig, statt Optionen anzukreuzen. Die Rückmeldung stammt aus den echten Daten: Gegenfragen reagieren auf den eigenen Auswertungsweg, und ein Robustheitsspiegel zeigt, wie stark das Urteil von vertretbaren Entscheidungen abhängt.

Leitgedanke: Statistik nimmt die Entscheidung nicht ab. Sie macht sichtbar, welche Entscheidungen ein Urteil tragen und was sie kosten.

## 2. Getroffene Entscheidungen

| Frage | Entscheidung |
|---|---|
| Welt | Echter ALLBUScompact 2023 (ZA8831). Keine fiktive Stadt, nicht Blobtopia. |
| Aufgabenform | Offene, selbstwirksame Aufgaben; keine Wahlaufgaben als Kern. |
| Modi insgesamt | „Belege es!“, Spin-Doktor, Vorregistrieren & aufdecken, Gutachten reparieren. |
| Prototyp 1 | Nur „Belege es!“, dafür vollständig ausgebaut. |
| Setting | Allein und lokal im Browser; kein Server, kein Austausch. |
| Datenzugang | Studierende ziehen ihre selbst bezogene GESIS-Datei (`.sav`) in den Browser. |
| Abschluss | Robustheitsspiegel als Höhepunkt, Faktencheck-Karte als Ergebnis. „Veröffentlichen mit Folgen“ folgt später. |
| R-Code | mariposa im tidy-style: `read_spss()`, `rec()` in `mutate()`, `crosstab()` in Pipes. |
| Einbettung | Die Missionen sind Teil des Lernpfads. Der Lernpfad wird nach dem Sitzungsplan WiSe 24/25 neu gegliedert; der bisherige Lernpfad (zwölf Politik-Sitzungen, Vermutungsfragen, 36 Aufgaben, Arbeitsheft) entfällt. |

## 3. Ablauf für Studierende

Jede Mission gehört zu einer Sitzung des Lernpfads (Abschnitt 3a) und steht dort unter den Begriffen der Sitzung.

**0 · Daten laden.** Eine Ablagefläche nimmt die eigene ALLBUS-Datei an – in Sitzung 1 oder in der ersten Mission, die man öffnet. Die Datei gilt danach für alle Missionen. Ohne Datei erklärt die Fläche den Bezug über GESIS und den Grund: Die Daten verlassen den Rechner nicht. Nach dem Laden: Version und Fallzahl.

**1 · Behauptung zerlegen.** Zitat mit Quellenangabe (fiktive Sprecher:innen) und fünf Lücken in eigenen Worten: Wer genau? Was genau? Wie viel heißt …? Im Vergleich zu wem? Seit wann? Mindestens drei müssen gefüllt sein. Die Antworten erscheinen später in Gegenfragen und Karte.

**2 · Werkbank.** Jede Entscheidung wird durch direktes Hantieren getroffen, die Tabelle rechnet live:
- Item wählen: vorgeschlagene Items mit Fragetext; zusätzlich **Variablensuche** über alle Variablen mit Wertelabels (siehe 7.4).
- Gruppen bilden: je Behauptung, z. B. Altersgrenze per Schieberegler und Vergleichsgruppe oder Region.
- Kategorien sortieren: antippen, was als „interessiert“, „vertraut“, „misstraut“ usw. zählt.
- Fehlende Angaben: ausschließen, alle als „nein“ zählen oder bestimmte Codes als „ja“ zählen (z. B. „weiß nicht“ als Nichtwahl).
- Gewichtung mit `wghtpew` an/aus.
- Prozentbasis: Zeilen- oder Spaltenprozente.
- Beleg: eine Tabellenzelle antippen; sie wird als Satz formuliert („33 % der 18- bis 29-Jährigen sind interessiert“).
- Daneben: der eigene Weg als mariposa-Code, live.

**3 · Urteil.** Fünf Stufen (stimmt · stimmt teilweise · irreführend · falsch · mit diesen Daten nicht prüfbar) und eine Begründung von mindestens einem Satz.

**4 · Gegenfragen.** Eine „kritische Gutachterin“ stellt Fragen, die aus dem eigenen Weg entstehen, jeweils mit einer konkret nachgerechneten Alternative. Antwortfelder sind optional; „In der Werkbank ändern“ führt zurück, ohne Eingaben zu verlieren.

**5 · Spiegel und Karte.** Robustheitsspiegel (Abschnitt 6), danach die Faktencheck-Karte: Behauptung, Urteil, Begründung, Beleg, Tragfähigkeit („Richtung trägt in 60 von 72 Wegen“), Zahl beantworteter Gegenfragen. Downloads: Karte als Markdown und das R-Skript.

Bereits erreichte Schritte bleiben über die Schrittleiste erreichbar. Zustand und Texte bleiben beim Wechsel in die Karte und zwischen Sitzungen erhalten.

## 3a. Der neue Lernpfad

Der Lernpfad folgt dem Sitzungsplan „Statistik im WiSe 24/25“. Die dort gestrichenen Sitzungen 7–8 (Explorative Faktorenanalyse) entfallen; die Nummerierung ist fortlaufend.

| Sitzung | Sitzungsplan | Thema | Mission |
|---|---|---|---|
| 1 | 1 | Einstieg: R, RStudio, ALLBUS | Einrichtung: Datei laden, R-Startskript |
| 2 | 2 | Vom Fragebogen zum Datensatz | folgt |
| 3 | 3 | Erste Auszählung | 4.1 „Die Jungen …“ |
| 4 | 4 | Kreuztabellen | 4.3 „Wer Politikern misstraut …“ |
| 5 | 5 | Gewichtung und Zusammenhang | 4.2 „Im Osten …“ |
| 6 | 6 | Mittelwerte vergleichen | folgt |
| 7 | 9 | Index und Skala | folgt |
| 8 | 10 | Lineare Regression | folgt |
| 9 | 11 | Regression vertiefen | folgt |
| 10 | 12 | Logistische Regression | folgt |

**Aufbau einer Sitzung:** Kopf mit Sitzungsnummer, Kurzthema und Bezug zum Sitzungsplan; Titel; politische Leitfrage. Darunter die Begriffe der Sitzung: „Wiederholung“ und „Neu in dieser Sitzung“ nach den Angaben des Sitzungsplans. Begriffe mit Kartenknoten öffnen die freie Karte; Begriffe ohne Knoten (etwa Boxplot, AV/UV, Kombinationsindex) erscheinen gestrichelt und nicht anklickbar. Danach die Mission, in Sitzung 1 die Einrichtung, in Sitzungen ohne Mission der Hinweis „Mission folgt“. Unten Blättern zur vorigen und nächsten Sitzung. Keine Wahlaufgaben.

**Sitzungsleiste:** alle zehn Sitzungen mit Status (Einrichtung/ALLBUS geladen, Mission offen/läuft/abgeschlossen, Mission folgt) und dem Ladezustand der Datei.

**Karte:** „Zurück zu Sitzung N“ führt in dieselbe Sitzung zurück, setzt den Fokus auf die Überschrift und erhält den Stand der Mission. Die Aufgabenbrücke über der Karte entfällt.

## 4. Die drei Behauptungen

Alle Zahlen: ALLBUScompact 2023, v1.3.0, geprüft mit mariposa 0.7.3 bzw. haven. Die Behauptungen sind typisierte Daten, keine Sonderlogik.

### 4.1 „Die Jungen interessieren sich doch gar nicht mehr für Politik.“ (Talkshow)

- Items: `pa02a` politisches Interesse (1 sehr stark … 5 überhaupt nicht); Alternative `li07` Wichtigkeit von Politik (1–7).
- Gruppen: 18 bis Grenze (Schieberegler 20–39) gegen alle Älteren, 40–59 oder 60+.
- Hauptfallen: Schwelle („zählt mittel?“), „nicht mehr“ ist im Querschnitt nicht prüfbar; Gewichtung ist hier fast folgenlos.
- Referenz: gewichtet 33,1 % (18–29) gegenüber 40,9 % (30+) „sehr stark/stark“; mit „mittel“ 80 % gegenüber 84 %.
- Spiegel: Item {pa02a, li07} × Grenze {24, 29, 34} × Vergleich {Ältere, 40–59, 60+} × Schwelle {streng, weit} × Gewichtung {ja, nein} = 72 Wege.

### 4.2 „Im Osten vertraut kaum noch jemand dem Bundestag.“ (Social-Media-Post)

- Items: `pt03` Vertrauen Bundestag (1–7); Alternativen `pt12` Bundesregierung, `pt15` Parteien.
- Gruppen: `eastwest`.
- Hauptfallen: „kaum noch jemand“ gegen die Daten; Mittelkategorie 4 (Ost 21,5 %) zählt wohin?; Split: nur 69,6 % wurden gefragt (3.592 Gültige); Gewichtung wirkt nicht bei Anteilen innerhalb der Regionen, aber stark bei Spaltenaussagen.
- Referenz: vertrauen (5–7) Ost 34,6 %, West 43,0 %; Anteil Ost an den stark Misstrauenden (≤ 2) ungewichtet 41,8 %, gewichtet 23,4 %. `pt12`: 31,9 / 40,9 %; `pt15`: 15,8 / 20,6 %.
- Spiegel: Item {pt03, pt12, pt15} × Schwelle {5–7, 6–7} × Mitte 4 {ausgeschlossen, als „nicht vertrauend“} × Gewichtung {ja, nein} = 24 Wege.

### 4.3 „Wer Politikern misstraut, geht gar nicht mehr wählen.“ (Pressemitteilung)

- Items: `pe01` „Politiker kümmern sich nicht um meine Gedanken“ (1 stimme voll zu … 4); Alternative `pa35` „Politiker vertreten nur die Reichen“ (1–5).
- Ergebnis: `pv01` Wahlabsicht; Nichtwahl = 91 „würde nicht wählen“.
- Hauptfallen: Prozentbasis (87 % der Nichtwählenden stimmen zu, aber 6,5 % der Zustimmenden wollen nicht wählen); fehlende Angaben („weiß nicht“ als Nichtwahl: 23 % statt 8,8 %); Absicht ist kein Verhalten; Kausalsprache; Split.
- Referenz: Nichtwahl bei voller Zustimmung zu `pe01` 8,8 % (gewichtet 9,2 %) gegenüber 3,6 % (gewichtet, übrige); `pa35` voll zu 10,8 %, übrige 3,5 %.
- Spiegel: Item {pe01, pa35} × Schwelle {nur „voll zu“, „voll/eher zu“} × Nichtwahl-Definition {91; 91 + weiß nicht; 91 + weiß nicht + verweigert} × Gewichtung {ja, nein} = 24 Wege.

Nicht wahlberechtigte Befragte (−50) sind bei 4.3 immer ausgeschlossen.

## 5. Gegenfragen

Jede Regel ist eine reine Funktion `(Behauptung, Zustand, Rechenkern) → Gegenfrage | null`. Eine Gegenfrage hat Titel, Text mit nachgerechneter Alternative und optional einen Kartenbegriff. Nur Regeln, deren Bedingung zutrifft, erscheinen.

| Regel | Auslöser | Nachgerechnet |
|---|---|---|
| Gewichtung | ungewichtet | gewichtetes Ergebnis; bei < 1 Punkt Unterschied die Variante „Warum ändert sich hier kaum etwas?“ |
| Zeitbehauptung | Behauptung enthält Veränderung, Urteil ≠ „nicht prüfbar“ | – (Hinweis auf ALLBUS-Kumulation) |
| Schwelle | immer | Ergebnis mit der anderen Standardschwelle |
| Prozentbasis | Beleg nutzt eine andere Basis als die Behauptung | Wert mit passender Basis |
| Fallzahl | kleinste Gruppe n < 500 oder Belegzelle n < 30 | n nennen |
| Kausalsprache | Begründung enthält weil, deshalb, daher, führt, verursacht, liegt an, wegen, Grund | – (Drittvariablen-Beispiele je Behauptung) |
| Item | immer, wenn Alternativen existieren | Ergebnis mit dem ersten alternativen Item |
| Fehlende Angaben | Missing-Codes als Kategorie gezählt, oder bei 4.3 nicht gezählt | Ergebnis mit der anderen Behandlung |
| Split | Item stammt aus einer Split-Hälfte | Anteil gefragter Personen |
| Absicht ≠ Verhalten | nur 4.3 | – |
| Mittelkategorie | nur 4.2, wenn „4“ einer Seite zugeschlagen ist | Ergebnis ohne Mittelkategorie |

Gegenfragen sind Denkanstöße, keine Bewertung. Es gibt keine Punkte und keine Musterlösung.

## 6. Robustheitsspiegel

- Jede Behauptung definiert ihren Entscheidungsraum als Liste von Dimensionen mit Stufen (Abschnitt 4). Der Rechenkern berechnet für jeden Weg Anteil in der Zielgruppe, Anteil in der Vergleichsgruppe und Abstand in Prozentpunkten.
- Darstellung: Punktstreifen je Item, Nulllinie, eigener Weg hervorgehoben. Liegt der eigene Weg außerhalb des Rasters (freie Schwelle, gesuchte Variable), erscheint er mit Hinweis „außerhalb der vorbereiteten Wege“.
- Kennzahlen: Zahl der Wege mit gleicher Richtung wie das eigene Ergebnis; Zahl mit Abstand ≥ 5 Punkten; Spanne des Anteils in der Zielgruppe. Je Behauptung zusätzlich eine Aussage zur Kernbehauptung (z. B. „die meisten Jungen interessieren sich nicht“: 54 von 72 Wegen; die Zahl hängt fast nur an der Schwelle).
- Gewicht jeder Entscheidung: für jede Dimension die Spanne der mittleren Abstände über ihre Stufen (Mittel über alle übrigen Dimensionen). Als Balken, absteigend sortiert.

## 7. Architektur

Neues Modul `src/sandbox/`, ohne Abhängigkeit vom Kartencode außer dem bestehenden Begriffsaufruf `showConcept`.

```
src/sandbox/
  sav/readSav.ts          SPSS-Leser
  sav/validateAllbus.ts   Studiennummer, benötigte Variablen
  claims/types.ts         Behauptung, Dimension, Weg, Zustand
  claims/catalog.ts       die drei Behauptungen als Daten
  engine/recode.ts        Kategorien → 1/0/NA nach rec()-Semantik
  engine/crosstab.ts      gewichtete 2×2-Tabellen, Zeilen-/Spaltenprozente
  engine/multiverse.ts    alle Wege, Gewicht der Entscheidungen
  questions/rules.ts      Gegenfragen-Regeln
  rcode/mariposa.ts       Codegenerator
  state.ts                Zustand, Speicherung, Wiederherstellung
  ui/…                    DataDrop, ClaimWorkspace, Decompose, Workbench,
                          LiveTable, Verdict, Questions, Mirror
src/domain/curriculum.ts  Sitzungen nach Sitzungsplan, Begriffe, Missionen
src/components/LearningPath.tsx  neuer Lernpfad mit eingebetteten Missionen
```

### 7.1 Datenfluss

`.sav` → `readSav` → `Dataset` (Spaltenvektoren + Metadaten) → `validateAllbus` → Behauptung wählen → Zustand ändern → `engine` berechnet Tabelle, Beleg, Gegenfragen-Zahlen, Spiegel → UI. Der Datensatz lebt nur im Arbeitsspeicher der Seite.

### 7.2 Kerntypen

```ts
type Variable = { name: string; label: string; values: Float64Array; // NaN = systemfehlend
  missingCodes: number[]; valueLabels: Record<number, string> };
type Dataset = { study: string; version: string; n: number; vars: Map<string, Variable> };
type SandboxState = { claimId: string; gaps: string[]; item: string; groups: Record<string, number | string>;
  positive: number[]; // Kategoriecodes, die als „ja“ zählen
  missing: { mode: 'drop' } | { mode: 'allAsNo' } | { mode: 'codesAsYes'; codes: number[] };
  weighted: boolean; base: 'row' | 'col';
  evidence: { row: 0 | 1; col: 0 | 1; base: 'row' | 'col' } | null;
  verdict: 0 | 1 | 2 | 3 | 4 | null; reason: string; answers: Record<string, string> };
```

### 7.3 SPSS-Leser

- Unterstützt: Header, Variablen-Records mit Missing-Definitionen (Einzelwerte und Bereiche), Wertelabels (Typ 3/4), Erweiterungen für lange Namen und Zeichenkodierung (Typ 7, Untertypen 13 und 20), Bytecode-Kompression und unkomprimierte Daten. Zeichenkettenvariablen werden gelesen, aber in Prototyp 1 nicht ausgewertet.
- Nicht unterstützt: ZSAV (zlib). Sie wird mit verständlicher Meldung abgelehnt.
- Benutzerdefinierte Missing-Codes bleiben als Werte erhalten; der Rechenkern entscheidet über ihre Behandlung. So kann „weiß nicht“ bewusst als Kategorie gezählt werden.
- Läuft im Hauptthread. Ein Web Worker kommt nur hinzu, wenn das Einlesen der ALLBUS-Datei im Browser länger als 300 ms dauert.
- Validierung: `za_nr` = 8831 und alle benötigten Variablen vorhanden; die Version wird angezeigt, aber nicht erzwungen.

### 7.4 Variablensuche

Durchsucht Namen und Labels aller Variablen. Wählbar sind numerische Variablen mit Wertelabels und höchstens elf gültigen Kategorien. Die Kategorien lassen sich dann wie vorgeschlagene Items sortieren. Gegenfragen, die eine Alternative nachrechnen, arbeiten auch hier; der Spiegel zeigt den Weg als „außerhalb der vorbereiteten Wege“.

### 7.5 R-Generator

Erzeugt aus dem Zustand ein ausführbares Skript, z. B.:

```r
library(mariposa)
library(dplyr)

allbus <- read_spss("ZA8831_v1-3-0.sav")   # −42/−9 werden zu getaggten NAs

allbus <- allbus %>%
  mutate(
    altersgruppe = rec(age, rules = "18:29=1 [18-29]; 30:max=2 [30 und älter]; else=NA"),
    interessiert = rec(pa02a, rules = "1:2=1 [interessiert]; 3:5=0 [nicht interessiert]")
  )

allbus %>%
  crosstab(altersgruppe, interessiert, percentages = "row",
           weights = wghtpew) %>%
  summary()
```

Regeln: gewählte Kategorien werden zu Bereichen zusammengefasst; `NA=0` für „alle fehlenden als nein“. Bewusst gezählte Missing-Codes holt `untag_na()` zurück, bevor `rec()` sie zuordnet, z. B. `nichtwahl = rec(untag_na(pv01), rules = "91=1 [nicht wählen]; -8=1; 1:90=0 [wählen]; else=NA")` (geprüft: 23,0 % bei voller Zustimmung zu `pe01`). Der Dateiname entspricht der geladenen Datei.

### 7.6 Einbindung in den Atlas

- Die Missionen stehen im Reiter „Lernpfad“ (Abschnitt 3a); es bleibt bei den Reitern „Lernpfad“ und „Freie Karte“. `LearningPath.tsx` wird neu geschrieben; `learningPath.ts`, `learningTasks.ts`, `learningTasksData.ts`, `LearningTaskCard.tsx`, `AtlasTaskBridge.tsx` und ihre Tests entfallen, `learning-path.css` behält nur Rahmen, Sitzungsleiste und Blätterleiste.
- Begriffe in Sitzung, Gegenfragen und Werkbank verlinken in die Karte (z. B. `crosstab`, `weights`, `missing`, `causality`, `operationalization`, `random_sampling`). „Zurück zu Sitzung N“ erhält den Zustand.
- Speicherung unter `statistikatlas.missionen.v1` im Browser: nur Zustand und Texte je Mission, nie Daten. Defensive Wiederherstellung.
- Der Offline-Export funktioniert unverändert; die Missionen brauchen kein Netz.

## 8. Datenschutz und Lizenz

- Keine ALLBUS-Mikrodaten im Repository, im Build oder im Browser-Speicher. `.gitignore` erhält `*.sav` und `*.zsav`.
- Aggregierte Referenzwerte (Abschnitt 4) dürfen in Tests und Dokumentation stehen; Quelle: GESIS, ALLBUScompact 2023, ZA8831 v1.3.0.
- Keine Übertragung an einen Server.

## 9. Fehlerbehandlung

| Situation | Verhalten |
|---|---|
| Keine `.sav` / falsches Format / ZSAV | klare Meldung, was erwartet wird |
| Anderer Datensatz | „Das ist nicht ZA8831“ mit gefundener Studiennummer |
| Fehlende Variable | Behauptung ausgegraut, mit Name der fehlenden Variable |
| Gruppe oder Kategorie leer | Zelle zeigt „–“, Erklärung statt Division durch null |
| Keine Kategorie als positiv gewählt | Hinweis in der Werkbank, kein Weiter |
| Speicher gesperrt | Arbeit bleibt für die Sitzung nutzbar, Hinweis wie beim Arbeitsheft |

## 10. Prüfung und Abnahme

**Automatisiert** (`pnpm test`, `node --test` wie bisher):
- SPSS-Leser gegen eine synthetische `.sav`, die ein R-Skript (`scripts/make-sandbox-fixture.R`) mit mariposa schreibt: Labels, Missing-Codes, Kompression, lange Namen. Erwartung aus haven.
- Rechenkern: Tabellen, Prozente und Gewichtung gegen R-Referenzwerte auf den synthetischen Daten.
- Spiegel: Zahl der Wege, Gewicht der Entscheidungen, eigener Weg innerhalb und außerhalb des Rasters.
- Jede Gegenfragen-Regel mit auslösendem und nicht auslösendem Zustand.
- Codegenerator: Bereiche, `NA=0`, Missing-Codes, Gewichtung, Prozentbasis.

**R-Abgleich:** `scripts/verify-sandbox-r.R` führt den erzeugten Code für ein Raster von Zuständen auf der synthetischen Datei aus und vergleicht die Prozente mit dem Rechenkern (Toleranz 0,05 Punkte).

**Lokal mit echten Daten:** Ein Test läuft nur, wenn `ALLBUS_SAV` gesetzt ist, und prüft die Referenzwerte aus Abschnitt 4.

**Browser:** Datei laden, alle drei Behauptungen einmal sauber und einmal „schlampig“ durchspielen, Rückweg aus der Karte, Neuladen mit Wiederherstellung, Downloads.

**Abnahmekriterien:**
1. Alle Referenzwerte aus Abschnitt 4 werden im Browser exakt (auf 0,1 Punkte) reproduziert.
2. Der erzeugte R-Code läuft mit mariposa 0.7.3 auf ZA8831 v1.3.0 und liefert dieselben Prozente wie die Sandbox.
3. Jede Gegenfragen-Regel ist durch mindestens einen Weg in einer der drei Behauptungen auslösbar.
4. Kein ALLBUS-Wert landet im Browser-Speicher oder im Build.
5. Alle Schritte sind per Tastatur bedienbar; der Spiegel hat eine Textalternative.

## 11. Nicht in Prototyp 1

Missionen für die Sitzungen 2 und 6–10; Spin-Doktor, Vorregistrieren & aufdecken, Gutachten reparieren; „Veröffentlichen mit Folgen“; Klassenraum und Austausch; Mittelwertvergleiche und Tests; mehr als zwei Gruppen pro Tabelle; ZSAV; Bewertung oder Punkte.

## 12. Offene Punkte

- ~~Wortlaut der fiktiven Quellenangaben und der Drittvariablen-Beispiele~~ – am 29. September 2026 abgestimmt. Die Gegenfrage „Du nennst eine Ursache.“ hat je Behauptung einen eigenen Denkanstoß (`causalHint`): Alter gegen Generation (Jugend), Zusammensetzung der Regionen (Osten), Drittvariablen und umgekehrte Richtung (Nichtwahl). Alter und Region werden von keiner Drittvariable verursacht.
- Ob die Faktencheck-Karte zusätzlich als Bild exportiert werden soll, entscheiden wir nach der ersten Erprobung.
