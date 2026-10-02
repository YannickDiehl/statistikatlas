# Sitzung 1 · Einstieg – Aufgabenkonzept

Alle Zahlen: ALLBUScompact 2023, ZA8831 v1.3.0, mariposa 0.7.3, per `Rscript` auf der lokalen Datei geprüft. Die Zählungen des Browsers habe ich mit dem vorhandenen `readSav.ts` (Node 22) gegengeprüft. Nur Aggregate, keine Einzelfälle.

## 1 Drei Konzepte

### K1 „Schon gefragt?“ – Neuheitsprüfung für eine neue Umfrage (empfohlen)

**Rolle:** Neuheitsprüfer:in beim fiktiven Umfrageprojekt „Querschnitt 27“. **Kernidee:** Der Beirat reicht vier Frageideen ein, und jede Interviewminute kostet Geld. Wer eine Frage übernimmt, die der ALLBUS 2023 schon stellt, spart. Wer eine Frage übernimmt, die etwas anderes misst, misst am Ende das Falsche. Mit `find_var()` und `codebook()` prüfen die Studierenden jede Idee und stempeln sie: **übernehmen** (Variable plus Beleg aus dem Codebuch) oder **selbst fragen** (dokumentierte Suche). Die Ideen sind so gewählt, dass die Suche selbst zum Thema wird: ein glatter Treffer (Horoskope), null Treffer wegen der Umlaute („Flüchtling“, im Label steht FLUECHTL.), sechzehn Treffer mit Split (Vertrauen) und Scheintreffer („einsam“ findet GEMEINSAMER HAUSHALT). **Erschaffen:** Zum Schluss reicht jede:r eine eigene Frageidee ein und prüft sie selbst. **Plenum:** Wie viele Ideen muss das Projekt selbst stellen?

### K2 „Landvermessung“ – den ALLBUS kartieren

**Rolle:** Kartograf:in für einen fiktiven Datenservice, der einen Übersichtsplan des ALLBUS braucht. **Kernidee:** Jedes Paar erhält eine „Region“, also eine Namensfamilie wie `pt`, `rh`, `mp`, `hh` oder `x`. Mit `find_var(allbus, "^rh", search = "name")` und `codebook()` vermessen die Paare ihre Region: Wie viele Variablen hat sie, worum geht es, wem wurden die Fragen gestellt, und was ist die „Sehenswürdigkeit“ (z. B. `rh09b` TAROT-KARTEN, WAHRSAGEN)? Sie geben der Region einen Namen und schreiben einen Satz wie für einen Reiseführer. Der Browser prüft Zählungen und Split-Anteile und trägt die Region in einen Plan ein. **Plenum:** An der Tafel entsteht die ganze Karte. Jede Region wird doppelt vergeben, deshalb lassen sich die Benennungen vergleichen. **Überraschung:** Viele Variablen beschreiben gar nicht die Befragten selbst: 35 weitere Haushaltsmitglieder, 30 Kinder außer Haus, 64 Ehe- und Lebenspartner:innen, 37 das Interview.

### K3 „Stolpersteinprotokoll“ – Testlauf für den nächsten Jahrgang

**Rolle:** Tester:in einer Einstiegsanleitung, die ein fiktives Methodenzentrum im nächsten Jahr an 300 Erstsemester ausgeben will. **Kernidee:** Die Studierenden arbeiten ein Startskript in sechs Schritten ab (Paket laden, einlesen, Environment lesen, suchen, Codebuch, eigene Suche) und protokollieren jeden Schritt: klappt, Fehlermeldung im Wortlaut, eigene Lösung. Ein Fehler-Decoder im Browser ordnet eingefügte Meldungen typischen Ursachen zu („konnte Funktion nicht finden“ → Paket nicht geladen). Ein Handschlag (5.246 Fälle, 579 Variablen) bestätigt den Erfolg. **Erschaffen:** ein verbesserter Anleitungssatz für den nächsten Jahrgang. **Plenum:** „An welchem Schritt bist du zuerst gestolpert?“ Die Verteilung an der Tafel zeigt, dass Stolpern normal ist, und die drei häufigsten Fehler werden gemeinsam gelöst. K3 nimmt die wackelige Installation zum Gegenstand, statt sie zu umgehen.

**Empfehlung: K1.** K1 verlangt alle drei neuen Begriffe und sichert nach drei Minuten den ersten Erfolg (genau ein Treffer). Die Entscheidung trägt Verantwortung in zwei Richtungen, und das Ergebnis lässt sich im Plenum vergleichen, weil die Anträge 2 und 3 den Raum absehbar spalten. Die Partnervariante ergibt sich von selbst (Vier-Augen-Prinzip), und die Prüfung im Browser ist billig: Der nachgebaute `find_var()` liefert nachweislich dieselben Treffer wie R. Den Fehler-Decoder aus K3 übernimmt K1 als Hilfe beim Handschlag.

---

## 2 „Schon gefragt?“ ausgearbeitet

### Rollenauftrag (Wortlaut im Browser)

> **Willkommen im Team.** Du prüfst ab heute Fragen für „Querschnitt 27“, eine neue Umfrage, die 2027 rund 3.000 Menschen persönlich befragen will (Projekt und Personen sind erfunden). Jede Interviewminute kostet Geld. Was schon einmal gut gefragt wurde, muss niemand neu fragen: Der ALLBUS 2023 ist für die Wissenschaft frei verfügbar, und er liegt gerade auf deinem Rechner.
>
> Der Beirat hat vier Ideen eingereicht. Für jede entscheidest du: **übernehmen** (du nennst die Variable und belegst sie aus dem Codebuch) oder **selbst fragen** (du zeigst, wie du gesucht hast). Beides kann schiefgehen. Übernimmst du eine Frage, die etwas anderes misst, misst Querschnitt 27 das Falsche. Gibst du eine Frage frei, die es längst gibt, zahlt das Projekt doppelt. Eine Zweitprüferin schaut sich deine „selbst fragen“-Stempel an, sonst niemand.
>
> 1. „Halten die Leute eigentlich etwas von Horoskopen?“
> 2. „Wie viele haben Angst vor Geflüchteten?“
> 3. „Vertrauen die Menschen der Politik noch?“
> 4. „Wie einsam sind die Menschen?“
> 5. Deine eigene Idee: Welche Frage würdest du 3.000 Menschen stellen?

### Ablauf (38 Minuten, Puffer bis 45)

| Min. | Schritt |
|---|---|
| 0–3 | Auftrag lesen; `.sav` liegt im Browser |
| 3–10 | **Handschlag:** Skript anlegen, einlesen; im Environment „5246 obs. of 579 variables“ ablesen und eintragen |
| 10–13 | Antrag 1 (Aufwärmen) |
| 13–20 | Antrag 2 |
| 20–27 | Antrag 3 |
| 27–33 | Antrag 4 |
| 33–38 | eigene Idee, Prüfbericht mit Plenumszeile |

### R-Teil

Sitzung 1 kommt ohne Pipe aus, wie das bisherige Startskript (siehe offene Frage 1).

```r
library(mariposa)
allbus <- read_spss(file.choose())        # ZA8831_v1-3-0.sav; ca. 1 s

find_var(allbus, "horoskop")              # 1 Treffer: rh08b
codebook(allbus, rh08b)

find_var(allbus, "angst")                 # No variables found
find_var(allbus, "flüchtling")            # No variables found
find_var(allbus, "fluecht")               # 5: mi05, mp16–mp19
codebook(allbus, mi05, mp16, mp17, mp18, mp19)
5246 - 1647                               # R als Taschenrechner: 3599

find_var(allbus, "vertrauen")             # 16: st01, pt01–pt20
find_var(allbus, "politik")               # 8: li07, lp05, pe01, pe04, pe05, pe06, pa30, pa35
codebook(allbus, pt03, pt12, pt15)

find_var(allbus, "einsam")                # dp03 LEBENSPARTNER: GEMEINSAMER HAUSHALT?
find_var(allbus, "allein")                # xs01 INTERVIEW: ALLEINE DURCHGEFUEHRT
codebook(allbus, dp03, xs01, li04)
```

**Echte Ergebnisse (aggregiert):**

| Antrag | Kandidaten | Skala (Wertelabels) | gefragt |
|---|---|---|---|
| 1 | `rh08b` HALTE VON: ASTROLOGIE, HOROSKOPE | 1 VIEL · 2 ETWAS · 3 GAR NICHTS; −6 KENNE ICH NICHT (178) | 5.246 (alle) |
| 2 | `mp16`–`mp19` FLUECHTL. CHANCE O.RISIKO: … | 1 RISIKO UEBERWIEGT … 5 CHANCE UEBERWIEGT; −11 TNZ: SPLIT (1.647) | 3.599 (68,6 %) |
| 2 | `mi05` ZUZUG VON: KRIEGSFLUECHTLINGEN | 1 UNEINGESCHRAENKT · 2 BEGRENZEN · 3 GANZ UNTERBINDEN | 3.650 (69,6 %) |
| 3 | `pt03`/`pt12`/`pt15` Bundestag/Bundesregierung/Parteien | 1 GAR KEIN VERTRAUEN … 7 GROSSES VERTRAUEN; −11 (1.596) | 3.650 (69,6 %); gültig 3.592/3.607/3.586 |
| 4 | Scheintreffer `dp03`, `xs01`; nah dran `li04` WICHTIGKEIT: FREUNDE UND BEKANNTE (1–7) | – | dp03 nur 1.023 (TNZ: FILTER) |

Außerdem: 179 der 579 Variablen tragen den Split-Code −11, 240 den Filter-Code −10.

### Was der Browser prüft

- **Handschlag:** eingetragene Zahlen gegen `sav.nCases` (5.246) und `sav.variables.length` (579), geprüft mit `readSav.ts` in 0,33 s. Weil der Browser die Fallzahl schon anzeigt, zählt vor allem die 579.
- **Suchwörter:** `findVar(sav, pattern)` rechnet `find_var()` nach (`new RegExp(pattern, 'i')` über Name und Label) und liefert für alle Testbegriffe dieselben Treffer wie R. Der Browser zeigt nur die **Trefferzahl**; die Labels liest man in R. Bei 0 Treffern und Umlaut im Suchwort meldet er: „Die Labels stehen in Großbuchstaben ohne Umlaute (FLUECHTL.).“ Bei Treffern nur im Wortinneren meldet er: „Wortteil-Treffer: gemEINSAMer.“ Geprüft sind auch „tier“ → RESPEKTIEREN und „essen“ → INTERESSEN.
- **Stempel „übernehmen“:** Existiert die Variable? Ein Katalog je Antrag spiegelt die Wahl, ohne sie zu bewerten („`st01` misst Vertrauen zu Mitmenschen, nicht zur Politik“). Bei unbekannten Variablen zeigt er das Label mit der Frage „Passt das?“. **Beleg:** (a) die Bedeutung des niedrigsten Werts, tolerant mit dem Wertelabel verglichen; (b) „Wie vielen wurde die Frage gestellt?“, berechnet als n minus die Codes mit Label „TNZ…“. Die Zahl der gültigen Antworten gilt auch, mit Erklärung.
- **Überraschungsmoment:** Wer bei `pt03` 5.246 einträgt, liest: „Schau unter den fehlenden Werten nach: −11 = TNZ: SPLIT (n = 1.596). Diesen Menschen wurde die Frage nie gestellt, und das betrifft 179 der 579 Variablen.“
- **Stempel „selbst fragen“:** mindestens zwei Suchwörter. Bei Antrag 2 und 3 legt die fiktive Zweitprüferin Einspruch mit einem Tipp ein, nicht mit der Lösung („Wie schreibt der ALLBUS ‚ü‘?“). Mit Begründung darf der Stempel bleiben („Risiko ist nicht Angst“). Bei Antrag 4 bestätigt sie: „Ich finde auch nur Scheintreffer.“ Nach Antrag 1 lädt sie ein: „Such mal nach ‚tarot‘.“
- **Prüfbericht:** Stempel, Belege, Suchwörter und eine Plenumszeile, als Markdown-Download zusammen mit einem R-Skript aus den eigenen Suchwörtern.
- **Neu zu bauen:** `findVar` mit Wortteil-Erkennung, Labelvergleich, TNZ-Zählung, Katalog, Fehler-Decoder (etwa acht Muster), Stempeloberfläche, Skriptgenerator. Dazu eine gekennzeichnete **Notfallkonsole** für kaputtes R: nur `find_var()` mit Trefferliste, kein Codebuch; der Handschlag bleibt offen.

### Gestufte Hilfen (am Beispiel)

| Stufe | Handschlag | Antrag 2 (Suche) | Beleg lesen |
|---|---|---|---|
| 1 Denkanstoß | „Welches Fenster zeigt, welche Objekte R kennt?“; Fehlermeldung einfügen → Decoder | „Welches Wort stünde in einem kurzen Label in GROSSBUCHSTABEN?“ | „Fehlende Werte stehen unter den gültigen.“ |
| 2 Verweis | Karte `data_import`; Workshop Kap. 1 „Environment und History“, Kap. 4.3 | Karte `codebook`; Workshop 4.4.1 `find_var()` | Karte `missing`; Workshop 4.4.2 `codebook()` |
| 3 Gerüst | `allbus <- ____(file.choose())` | `find_var(allbus, "fl____")` | `codebook(allbus, ____)` |
| 4 Lösung | vollständige Zeile | `find_var(allbus, "fluecht")` | `codebook(allbus, mp16, mp17, mp18, mp19)` |

Auch mit Stufe 4 zählt der Antrag als bearbeitet; entscheiden muss man trotzdem selbst.

### Plenum, Partnervariante, allein

- **Stempelbilanz:** Jede:r nennt eine Zahl (wie viele der vier Ideen Querschnitt 27 selbst stellen muss, 0–4) und für Antrag 3 die übernommene Variable. Erwartet: Antrag 1 einstimmig übernommen, Antrag 4 überwiegend „selbst fragen“ (einige nehmen `li04`), Antrag 2 und 3 spalten den Raum. Fragen an die Minderheit: „Ist ‚Risiko für die Sicherheit‘ dasselbe wie Angst?“ – „Meint ‚die Politik‘ Bundestag, Regierung oder Parteien?“ – „Reichen 3.650 Befragte?“ Die eigenen Ideen ergeben einen „Wunschzettel an den ALLBUS“.
- **Partner (Vier-Augen-Prinzip):** A prüft zuerst die Anträge 1 und 3, B die Anträge 2 und 4. Danach prüft jede:r die „selbst fragen“-Stempel der anderen Person mit zwei *neuen* Suchwörtern und zeichnet gegen oder legt Einspruch ein. Die eigene Idee schreibt man für die andere Person. Läuft nur ein R, sucht A in R und B übernimmt die Zweitprüfung in der Notfallkonsole.
- **Allein:** Der Browser übernimmt die Zweitprüferin, und die eigene Idee prüft man zweimal. Der Prüfbericht endet mit einem Satz: „Welche Suche hat mich am meisten in die Irre geführt?“

### Begriffe und Missverständnis

**Abgedeckt:** R/RStudio (Skript, Konsole, Environment, `<-`, R als Taschenrechner); Daten einlesen (`read_spss()`, Objekt, fehlende Werte als Codes); Codebuch und Variablensuche (`find_var()`, `codebook()`, Name/Label/Wertelabel, TNZ). **Missverständnis:** „Kein Treffer heißt, es gibt die Frage nicht; ein Treffer heißt, ich habe sie gefunden.“ `find_var()` sieht nur kurze Labels: ohne Umlaute, mit Wortteilen, ohne Synonyme. Nebenbei: „Alle 5.246 wurden alles gefragt.“

### Aufwand und Risiken

**Aufwand M** (etwa 2–3 Tage inklusive Texte; Rechenkern S, Oberfläche M).
**Risiken:**
- Installation: früher Handschlag, Decoder, Partner, Notfallkonsole.
- Der `file.choose()`-Dialog öffnet sich unter macOS manchmal hinter RStudio; dazu kommt ein Hinweis.
- `codebook(allbus)` zeigt das ganze Codebuch des Datensatzes – dafür ist die Funktion gedacht; mit Variablennamen schlägt man gezielt einzelne Fragen nach. Beides gehört ins Skript.
- Regex-Sonderzeichen können sich in R und JS unterscheiden; einfache Wörter empfehlen.
- Zeitdruck: Antrag 4 oder die eigene Idee ist die Kür.
- Der Codebuch-Viewer zeigt Häufigkeiten; der Browser nennt bewusst keine Prozente, um Sitzung 3 nichts vorwegzunehmen.
- Der Name „Querschnitt 27“ vor Einsatz auf Verwechslung mit echten Projekten prüfen.

---

## 3 Offene Fragen an den Dozenten

1. **Pipe ab Sitzung 1?** Nach `library(mariposa)` allein fehlt `%>%`: mariposa importiert die Pipe nur, exportiert sie nicht. Ich habe `find_var(allbus, …)` ohne Pipe geschrieben, wie im bisherigen Startskript. Sollen `library(dplyr)` und der Pipe-Stil schon hier beginnen?
2. **Notfallkonsole:** Darf der Browser bei kaputtem R eine `find_var()`-Nachbildung mit Trefferliste zeigen, oder soll ohne R gar nichts gehen (nur Partnerarbeit)?
3. **Anträge fest oder austauschbar?** Sollen Sie die vier Ideen pro Semester tauschen können (z. B. aktuelle Themen)? Dann bräuchte der Katalog eine kleine Pflegeanleitung.
