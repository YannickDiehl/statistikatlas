# Sitzung 2 · Vom Fragebogen zum Datensatz

Leitfrage: *Was steht eigentlich in einer Zeile des ALLBUS?*
Alle Zahlen stammen aus ZA8831 v1.3.0 (n = 5.246) und wurden mit mariposa 0.7.3 per `Rscript` nachgerechnet. Sie sind ungewichtet, weil hier Zellen gezählt und keine Bevölkerungsanteile geschätzt werden.

---

## 1 · Drei Konzepte (Kurzskizzen)

### K1 „Erster Tag in der Datenerfassung“ (empfohlen)
**Rolle:** Datenerfasser:in in einem (fiktiven) Feldinstitut.
**Kernidee:** 1.656 Zeilen des ALLBUS 2023 waren einmal Papierbögen. Die Studierenden tippen drei nachgestellte Papierbögen (erfundene Personen) in eine Datenmatrix. Auf dem Papier stehen nur Wörter; die Zahlen dazu müssen sie in R im Codebuch nachschlagen. Manche Kreuze sind eindeutig, andere nicht: zwei Kreuze, eine Randnotiz, ein Kreuz auf der Linie, eine Frage, die in dieser Fragebogenversion gar nicht vorkam. Nach einer Doppelerfassung (Partner:in oder fiktiver Kollege) prüfen sie in R, wie der echte ALLBUS solche Fälle speichert, und stoßen auf einen Code, den es nur auf Papier gibt.
**Sie erschaffen:** drei Datenzeilen und eine eigene Erfassungsregel.
**Plenum:** „Eine Person, zwanzig Zeilen“: Jede Gruppe schreibt ihre Zeile für denselben Bogen an die Tafel.

### K2 „Der verschollene Fragebogen“
**Rolle:** Replikationsteam im Jahr 2045 (fiktiv).
**Kernidee:** Die Fragebögen von 2023 sind verloren, nur die .sav-Datei ist übrig. Aus den Spuren im Datensatz (−11 TNZ Split, −15 TNZ Mode, −10 Filter) rekonstruieren die Studierenden den Bauplan der Befragung: Wie viele Fragebogenversionen gab es, welche Frage stand wo? Sie formulieren drei Behauptungen, und der Browser prüft sie an den Daten. Echte Funde: Nach privater Internetnutzung (`xr19`) wurde online niemand gefragt (−15 in allen 1.587 CAWI-Zeilen). Der Papierbogen hatte nur Platz für acht Kinder außer Haus (`kh9*` fehlt in allen 1.656 MAIL-Zeilen).
**Sie erschaffen:** eine Bauplan-Skizze der Befragung.
**Plenum:** Wie viele Versionen habt ihr gefunden? Die Antworten gehen auseinander (3, 5, 6 …), und genau darüber lässt sich reden.

### K3 „Freigabekonferenz“ (nah am Entwurf „Datenzwilling“)
**Rolle:** Freigabeteam eines fiktiven Datenarchivs.
**Kernidee:** Vor einer Veröffentlichung muss jemand prüfen, ob harmlose Spalten zusammen Personen verraten. Mit einer fiktiven Persona zählen die Studierenden in R, wie viele ALLBUS-Zeilen nach jedem weiteren Merkmal noch passen. Echte Zahlen: Geburtsjahr, Geschlecht und Ost/West machen 0,5 % der Befragten einzigartig. Kommen Schulabschluss, Haushaltsgröße und Konfession dazu, sind es 52,5 %.
**Sie entscheiden:** Welche Spalte vergröbert ihr (z. B. `yborn` → `agec`), und wie viel Information gebt ihr dafür auf?
**Plenum:** Nach wie vielen Merkmalen war eure Persona allein, und welche Vergröberung habt ihr gewählt?

---

## 2 · Ausarbeitung K1 „Erster Tag in der Datenerfassung“

### Rollenauftrag (so lesen ihn die Studierenden)

> **Erster Tag in der Datenerfassung**
> Du fängst heute in der Erfassungsstelle eines Feldinstituts an. Institut und Kollegium sind erfunden, die Daten nicht. Fast jede dritte Zeile im ALLBUS 2023 war einmal Papier: 1.656 Menschen haben ihren Fragebogen per Post zurückgeschickt. Jemand hat aus den Kreuzen Zahlen gemacht. Heute bist du das.
> Mach aus jedem der drei Bögen auf deinem Tisch eine Zeile, die so im ALLBUS stehen könnte. Die Personen sind erfunden. Auf dem Papier stehen Wörter; welche Zahl du eintippst, verrät nur das Codebuch. Nicht jedes Kreuz ist eindeutig. Wo du entscheiden musst, entscheidest du. Schreib deine Regel so auf, dass die nächste Person genauso erfasst.
> Alles wird doppelt erfasst. Jede Abweichung landet wieder bei dir.

### Die drei Bögen (Faksimiles, Fragetexte gekürzt nach dem Codebuch)

Raster: `respid` (vorgegeben) plus acht Spalten, zusammen 24 Zellen. `mode` ist immer 4 (MAIL), `splt23_1` steht als „Version A/B“ im Bogenkopf.

| | Bogen 1 (Version A) | **Bogen 2 (Version B, Plenum)** | Bogen 3 (Version A) |
|---|---|---|---|
| `pa02a` Interesse | „sehr stark“ → 1 | „mittel“ gestrichen, „wenig“ → 4 | „überhaupt nicht“ → 5 |
| `pa01` links–rechts | 3 | **Kreuze bei 5 und 6 → offen** | 8 |
| `pt03` Bundestag | 6 | **Frage fehlt in Version B → −11** | „gar kein Vertrauen“ → 1 |
| `st01` Mitmenschen | fehlt in A → −11 | **Randnotiz „weiß nicht so recht, kommt auf die Leute an“ → offen** | −11 |
| `pv01` Wahlabsicht | „Die Linke“ → 6 (nicht 5) | „weiß nicht“ → −8 | leer → −9 |
| `ls01` Zufriedenheit | 8 | **Kreuz auf der Linie 7/8 → offen** | „0“ → 0 (gültig) |

Die Ersterfassung von **Kollege Ben** (fiktiv) weicht in sechs Zellen ab. Bogen 1: umgedrehte Skala (`pa02a` = 5), Listenplatz statt Code (`pv01` = 5), leere Zelle (`st01`). Bogen 2: erstes Kreuz genommen (`pa01` = 5), aufgerundet (`ls01` = 8). Bogen 3: die 0 als „nichts“ gelesen (`ls01` = −9).

### Ablauf (40 Minuten)

| Min. | Schritt |
|---|---|
| 0–4 | Auftrag lesen, .sav in den Browser ziehen, Bögen ansehen |
| 4–10 | **R-Block 1:** Codes nachschlagen |
| 10–20 | 24 Zellen erfassen, bei offenen Fällen eine Regel notieren |
| 20–25 | Doppelerfassung: Abgleich mit Ben oder Partner:in, schlichten |
| 25–35 | **R-Block 2 + 3**, dann drei Zahlen in den Browser eintragen und die Auflösung ansehen |
| 35–40 | Freigabe: Zeile für Bogen 2 und eine Regel auf die Plenumskarte |

### R-Teil (Stufe 4 = vollständige Lösung, lauffähig geprüft)

```r
library(mariposa)
library(dplyr)

allbus <- read_spss("ZA8831_v1-3-0.sav")

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
```

**Echte Ergebnisse:**
- `mode`: CAPI 2.003 · CAWI 1.587 · MAIL 1.656 (31,6 %), davon Version A 858 und B 798.
- `pa01`: −42 „DATENFEHLER: MFN“ (Mehrfachnennung) steht **24-mal da, nur bei Papierbögen**. In CAPI und CAWI kommt der Code nicht vor.
- `st01` bei Papierbögen: 193 / 287 / 287 gültige Antworten, −42 = 22, −11 = 858, −9 = 9. Das Codebuch listet −8 „weiß nicht“ und 4 „Sonstiges“, aber **ohne ein einziges Vorkommen**. Beides gibt es nur im Interview (CAPI: 5-mal bzw. 7-mal).
- `pt03` bei Papierbögen: −11 = 798, also genau alle Bögen der Version B.
- `pv01` hat die Codes 1, 2, 3, 4, 6, 42, 90 und 91. Nach der Umwandlung laufen sie von 1 bis 8: **Die AfD (480 Fälle) trägt die 6**, im Original der Code der Linken. Die Linke rutscht auf 5.
- Im ganzen Datensatz: **638 Zellen mit −42 in 202 Variablen, alle aus Papierbögen**. 357 von 1.656 Papierbögen (21,6 %) haben mindestens eine Mehrfachnennung.

### Was der Browser prüft (die .sav wird nur gelesen)

- **Beim Tippen**, gegen die Metadaten der Datei: Ist der Code vergeben? Ist er ganzzahlig? Die Rückmeldung verrät nichts, zum Beispiel: „pv01 hat keinen Code 5.“ · „Ein Doppelkreuz ist eine Entscheidung, keine Rechnung: 5,5 hat kein Label.“ · „Eine leere Zelle wird in R zu einem namenlosen NA. Der ALLBUS speichert, *warum* etwas fehlt.“
- **Nach dem Erfassen:** Die eindeutigen Zellen werden gegen Soll-Antworten geprüft. Diese sind als Labels hinterlegt (`pv01: "DIE LINKE"`) und werden erst zur Laufzeit in Codes übersetzt, damit im App-Code keine ALLBUS-Codes stehen. Offene Zellen werden nicht bewertet; der Browser fragt dort nach der Regel.
- **Doppelerfassung:** Jede markierte Abweichung wird geschlichtet. **Drei Zahlen aus R** (24, 0, 6) zählt der Browser selbst nach.
- **Überraschung:** Der Browser sucht in allen Variablen nach −42 und zeigt: „638 Zellen: CAPI 0, CAWI 0, MAIL 638. Diesen Code gibt es nur, weil es Papier gibt.“ Zu `st01` fragt er: „−8 steht im Codebuch, kommt auf Papier aber nie vor. Was heißt das für deine Randnotiz?“ Eine „richtige“ Regel wird nicht behauptet.

**TypeScript (klein, auf dem vorhandenen SPSS-Leser):** `validateCell`, `codeForLabel`, `countCode(variable, code, modus)`, `scanCode(-42)`, `factorPosition`, Zeilenvergleich und Zeilencode-Parser.

### Gestufte Hilfen

| Stufe | Block 1 · Codes | Block 2 · Papier | Block 3 · Umwandeln |
|---|---|---|---|
| Denkanstoß | Papier zeigt Wörter, der Datensatz Zahlen. Wo steht die Zuordnung? | Welche Spalte verrät den Modus, welche Zahl heißt MAIL? | Was passiert mit einem Code, wenn man ihn in ein Wort und zurück verwandelt? |
| Verweis | Karten „Variablen- & Wertelabels“, „Codebuch“, dazu der R-Workshop | `find_var(allbus, "MODUS")` | Karte „Datentypen umwandeln“ |
| Gerüst | `codebook(___, ___) %>% summary()` | `filter(mode == ___)` | `to_label(___)`, `to_numeric(___)` |
| Lösung | vollständiger Code wie oben; die Aufgabe zählt als bearbeitet | | |

### Plenum, Partner:innen, allein

- **Plenum:** Alle schreiben ihre Zeile für Bogen 2 untereinander an die Tafel. So entsteht eine Datenmatrix mit *einer* Person in zwanzig Fassungen. Bei `pv01` und `pa02a` dürfte der Raum fast einig sein, bei `pa01`, `st01` und `ls01` wird er streuen. Die Leitfrage: Welche Abweichung ist ein Fehler gegen das Codebuch, und welche ist eine Konvention, die jemand festlegen und dokumentieren muss?
- **Zu zweit:** A erfasst, B erfasst blind auf dem eigenen Gerät. Jede Person sieht ihre Erfassung als **Zeilencode** (24 Zahlen) und tippt den Code der anderen ab. Der Browser markiert die Abweichungen, und nebenbei sieht man, wie eine Zeile ohne Labels aussieht. In R übernimmt A Block 2 und B Block 3.
- **Allein:** Ben ist der Zweiterfasser. Nach der Freigabe zeigt der Browser zu jeder offenen Zelle zwei bis drei vertretbare Regeln und fragt, welche für alle 1.656 Papierbögen gelten soll.

### Begriffe und Missverständnis

**Abgedeckt:** Datenmatrix, Fall, Variable und Wert; Variablen- und Wertelabels; Codebuch und Variablensuche; Missing-Codes als gespeicherte Gründe (−8, −9, −11, −42); Datentypen umwandeln (Label ↔ Faktor ↔ Zahl); Erhebungsmodus und Split als Teil der Zeile.
**Angegriffenes Missverständnis:** „Daten sind gegeben.“ Tatsächlich ist jede Zelle eine Erfassungsentscheidung, und „fehlt“ ist nicht gleich „fehlt“. Nebenbei geht es gegen „Codes sind Rangplätze“ (AfD = 42, 1 = sehr stark) und „0 heißt nichts“.

### Aufwand und Risiken

**Aufwand: M.** Die Rechnungen sind trivial; die Arbeit steckt in drei SVG-Faksimiles mit Textalternative, dem Raster, der Abgleichsansicht und der Plenumskarte. Speicherung, Kartenverweise und Codeblöcke kommen aus „Belege es!“. Die Tests gleichen 24, 0, 6, 638 und 357 mit R ab.
**Risiken:**
- Die Faksimiles müssen mehrdeutig und trotzdem lesbar sein.
- Die echten Erfassungsregeln des Feldinstituts kennen wir nicht. Der Browser zeigt deshalb nur, was die Daten verraten.
- `filter()` und `frequency()` kommen vor Sitzung 3 vor, hier nur als Gerüstzeilen.
- Das Fehlersuchen bei Ben ähnelt Sitzung 9 und bleibt deshalb Nebenschritt.
- Fragetexte paraphrasiert, keine Logos, Institut und Kollege als fiktiv gekennzeichnet.

---

## 3 · Offene Fragen an den Dozenten

1. Kennst du aus dem ALLBUS-Methodenbericht 2023 die Erfassungsregeln für Papierbögen (Randnotizen, Kreuz zwischen zwei Kästchen)? Dann könnte die Auflösung sie zitieren, statt sie offen zu lassen.
2. Sind `filter()` und `frequency()` als Gerüstzeilen in Sitzung 2 in Ordnung, oder soll der R-Teil bei `codebook()`, `find_var()`, `to_label()` und `to_numeric()` bleiben?
3. Soll die „Eingabe in R“ zum Kern gehören? Dann bauen die Studierenden die eigenen Zeilen als Mini-Datensatz mit `tibble()`, `var_label()`, `val_labels()` und `set_na()`. Das ist getestet und dauert etwa 10 Minuten länger. Oder soll sie Zusatz für zu Hause bleiben?
