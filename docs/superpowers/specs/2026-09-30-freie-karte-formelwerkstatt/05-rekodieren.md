# Vorlage „Werkzeug“: Rekodieren & Umpolen (Stufe 3)

Begriff: `recode` („Rekodieren & Umpolen“, Eintrag im mariposa-Katalog, dargestellt im `PackageInspector`). Grundlage ist der gebilligte Entwurf „stufe3_rekodieren_ausfuehrlich“. Diese Datei ist zugleich das Muster für spätere Werkzeugbegriffe.

Daten (ALLBUS 2023, aggregiert, ungewichtet), politisches Interesse `pa02a`: 1 sehr stark 527, 2 stark 1.542, 3 mittel 2.303, 4 wenig 663, 5 überhaupt nicht 190, fehlend 21 (keine Angabe und Datenfehler). Mittelwert der gültigen Werte 2,70. Verhalten von `rec()` geprüft mit mariposa 0.7.3 (CRAN); Unterschiede zur Entwicklungsversion 0.7.4 laut deren NEWS im Abschnitt „Referenzfälle“.

## Aufbau

1. **Wofür?** Im ALLBUS heißt beim politischen Interesse (pa02a) der Code 1 „sehr stark“ und 5 „überhaupt nicht“. Wer „höhere Zahl = mehr Interesse“ lesen will, muss umpolen. Wer zwei Gruppen vergleichen will, fasst Codes zusammen.
   - Kurz gesagt: Rekodieren gibt Antworten neue Zahlen. Was die Befragten geantwortet haben, bleibt dasselbe.
   - Fachlich: Rekodieren ordnet den Codes einer Variable nach Regeln neue Codes und Wertelabels zu. Umpolen kehrt die Reihenfolge einer Skala um, Dichotomisieren fasst sie zu zwei Gruppen zusammen.
2. **Die Fachbegriffe:** Code (die Zahl, die für eine Antwort gespeichert ist, etwa 4); Wertelabel (der Text zum Code, etwa „wenig“; Begriff „Variablen- & Wertelabels“); Umpolen (die Skala umdrehen: aus 1 wird 5, aus 5 wird 1); Dichotomisieren (in zwei Gruppen teilen, meist 0 und 1; Begriff „Dummyvariablen“); Fehlender Wert (keine gültige Antwort, etwa „keine Angabe“; in R NA; Begriff „Fehlende Angaben“).
3. **Die Zeichen der Regel:** `=` sprich „wird zu“ (links alt, rechts neu); `1:2` sprich „1 bis 2“ (ein Bereich, von klein nach groß); `[stark]` Wertelabel (Text für den neuen Code); `;` Trenner (danach kommt die nächste Regel); `else` sprich „sonst“ (alles Übrige, auch fehlende Werte); `rev` sprich „reverse“ (umpolen: neu = 6 − alt bei 1 bis 5).
4. **Voreinstellungen:** Umpolen `rev` (Start); Dichotomisieren `1:2=1 [stark]; 3:5=0 [nicht stark]`; Mit Lücke `1:2=1 [stark]; 4:5=0 [schwach]`; Mit else `1:2=1 [stark]; else=0 [nicht stark]`. Dazu ein Eingabefeld `rules =` mit „Anwenden“ und Enter.
5. **So liest rec() deine Regel:** je Regel eine Zeile „Regel n“, der Regeltext und seine Übersetzung:
   - Bereich/Liste: „Die Codes 1 bis 2 werden zu 1, Wertelabel „stark“.“
   - `else=x`: „Alles, was bis hierhin keine Regel getroffen hat, wird x. Achtung: Das gilt auch für fehlende Werte.“
   - `NA=x`: „Fehlende Werte werden zu x.“
   - `copy`: „… werden zu sich selbst (unverändert).“
   - `rev`: „Die Skala wird umgepolt. neu = kleinster + größter Code − alt, hier 6 − alt. Die Wertelabels wandern mit.“
   - Darunter: „Die Regeln werden der Reihe nach geprüft. Die erste passende gewinnt.“
6. **Vorgerechnet für eine Person, die diesen Code angegeben hat:** Knöpfe 1–5 und „fehlend“ (Start: 4). Durchlauf mit „Schritt 1, 2, …“:
   - Schritt 1: „Die Person hat den Code 4 („wenig“).“ beziehungsweise „… keine gültige Angabe.“
   - rev: „rev rechnet: neu = kleinster + größter Code − alt = 1 + 5 − 4 = 2.“ und „Das Wertelabel „wenig“ wandert mit zum Code 2.“; bei fehlend: „rev dreht nur gültige Codes um. Die Person bleibt fehlend.“
   - Regeln: je geprüfte Regel „Regel n (…) passt.“ / „passt nicht.“ / bei fehlend und Bereichsregel „passt nicht: Fehlende Werte liegen in keinem Bereich.“ Abbruch nach der ersten passenden.
   - Ergebnis: „Neuer Code: 0, Wertelabel „nicht stark“.“ / „Ergebnis: Die Person bleibt fehlend.“ / „Ergebnis: NA, ausdrücklich gesetzt.“ / „Keine Regel passt. Der Code wird NA.“
   - Kurz gesagt: „Aus 4 wird 2.“ (allgemein: „Aus {alt} wird {neu}.“)
7. **Vorher und nachher:** links `pa02a` (Codes, Labels, Balken, Häufigkeit), rechts die neue Variable `interesse` (neue Codes sortiert, dann „NA keine Regel“, „NA gesetzt“, „NA fehlend, bleibt“), dazwischen Linien je alter Code mit Dicke nach Häufigkeit. Die gewählte Person ist links und rechts hervorgehoben. Wege ohne Regel in Warnfarbe, fehlend → gültiger Code in Hinweisfarbe.
8. **Warnungen:**
   - Codes ohne Regel: „Achtung: Code {k} passt zu keiner Regel und wird NA. Das betrifft {Anzahl} Befragte. Mit „else=copy“ behältst du die Codes, mit „else=NA“ bestätigst du es. Ab mariposa 0.7.4 warnt R an dieser Stelle; ältere Versionen setzen NA ohne Warnung.“ Kurz gesagt: „Diese Antworten gehen verloren, wenn du nichts tust.“
   - Fehlende erfasst: „Achtung: Auch die 21 fehlenden Angaben treffen hier eine Regel. Sie zählen jetzt als {neu} „{Label}“. Sicherer ist es, die Codes ausdrücklich zu nennen.“ Kurz gesagt: „Aus „keine Angabe“ wird eine Antwort, die niemand gegeben hat.“
9. **Kennzahl:** „Mittelwert vorher 2,70, nachher {m} (n = {gültige})“. Zusatz bei rev: „Umpolen rechnet neu = 6 − alt. Das gilt auch für den Mittelwert: 6 − 2,70 = 3,30. Die Streuung bleibt gleich.“; bei 0/1: „Bei einer 0/1-Variable ist der Mittelwert der Anteil der 1: {Prozent} %.“; sonst: „Der Mittelwert ändert sich mit den neuen Codes. Ob er inhaltlich sinnvoll ist, hängt von den Abständen der neuen Codes ab.“
10. **R-Code** (mitlaufend, mariposa-Stil des Lernpfads):
    ```r
    library(mariposa)
    allbus <- read_spss("ZA8831_v1-3-0.sav")

    allbus %>%
      mutate(interesse = rec(pa02a, rules = "{Regel}")) %>%
      frequency(interesse)
    ```
11. **Typische Fehler:** „else“ schreiben und vergessen, dass es auch fehlende Angaben erfasst. Nach dem Umpolen die alte Bedeutung im Kopf behalten: Jetzt heißt 5 „sehr stark“.
12. **Kurz prüfen:** „Eine Person hat {k} angegeben („{Label}“). Welchen neuen Code bekommt sie mit der aktuellen Regel? Tippe eine Zahl oder NA.“ ({k} = gewählter Code; bei „fehlend“ Code 2.) Richtig: „Stimmt.“ + Kurz gesagt des Durchlaufs. Diagnosen: rev und Eingabe = alter Code → „Das ist noch der alte Code. Umpolen heißt 6 − alt.“; sonst → „Geh die Regeln von links nach rechts durch. Die erste passende gewinnt; passt keine, wird der Code NA.“ Leere oder unlesbare Eingabe → Meldung am Feld.
13. **Mitdenken:**
    - „Vorher liegt der Mittelwert bei 2,70. Wo liegt er nach dem Umpolen?“ 2,70 / 3,30 / −2,70 → 3,30. Umpolen heißt neu = 6 − alt. Das gilt für jeden Code und damit auch für den Mittelwert: 6 − 2,70 = 3,30. Kurz gesagt: Die Skala dreht sich, der Mittelwert dreht sich mit. (Setzt die Regel auf `rev`.)
    - „Was passiert bei „1:2=1; else=0“ mit den 21 fehlenden Angaben?“ bleiben fehlend / werden zu 0 → werden zu 0. else fängt alles, was keine andere Regel trifft, auch fehlende Werte. Die 21 Personen würden als „nicht stark“ gezählt. Kurz gesagt: else heißt wirklich: alles andere. (Setzt die Regel „Mit else“ und wählt „fehlend“.)
14. **Genau genommen:** Kurz gesagt: Die erste passende Regel gewinnt. Was keine Regel trifft, wird NA, und fehlende Werte bleiben fehlend, solange keine NA- oder else-Regel sie erfasst. Dann: rec() prüft die Regeln von links nach rechts; für jeden Code gilt die erste passende. Gültige Codes ohne passende Regel werden NA; ab mariposa 0.7.4 mit einer Warnung. Mit „else=copy“ behält man sie, mit „else=NA“ bestätigt man das. Fehlende Werte aus read_spss() bleiben fehlend, außer eine Regel „NA=…“ oder „else=…“ erfasst sie. Ob ein Mittelwert der neuen Codes sinnvoll ist, hängt vom Skalenniveau ab. Bei einer 0/1-Variable ist er der Anteil der 1.

## Parser (`src/explain/rules.ts`)

Unterstützt: `rev`; Regeln getrennt durch `;` außerhalb eckiger Klammern; linke Seite: Code, Bereich `lo:hi`, Liste mit `,` (erst ab mariposa 0.7.4; bei Referenzversion 0.7.3 mit Hinweis ablehnen, siehe Review-Punkt 7 der Spezifikation), `min`/`max` (hier 1/5), `else`, `NA`; rechte Seite: Zahl, `NA`, `copy`; optional `[Label]` (darf `;` enthalten). Fehlermeldungen: leere Eingabe; „„…“ verstehe ich nicht. Erwartet wird alt=neu, zum Beispiel 1:2=1.“; ungültiger neuer Wert; „„…“ ist weder ein Code noch ein Bereich.“; Bereich absteigend („Bereiche bitte von klein nach groß schreiben: 2:5.“). Nicht unterstützt im Pilot (mit Hinweis „Das kann rec(), die Werkstatt zeigt es noch nicht“): `rev(lo, hi)`, `dicho`, `mean`, `quart`.

## Referenzfälle (mariposa 0.7.3, ALLBUS 2023)

| Regel | Ergebnis |
|---|---|
| `rev` | 1: 190, 2: 663, 3: 2.303, 4: 1.542, 5: 527, NA: 21; Labels umgedreht; Mittelwert 3,297 |
| `1:2=1 [stark]; 3:5=0 [nicht stark]` | 0: 3.156, 1: 2.069, NA: 21 |
| `1:2=1; else=0` | 0: 3.177 (inklusive der 21 fehlenden), 1: 2.069, NA: 0 |
| `1:2=1; 4:5=0` | 0: 853, 1: 2.069, NA: 2.324 (2.303 ohne Regel und 21 fehlende); in 0.7.3 ohne Warnung, in 0.7.4 mit Warnung |

Unterschiede 0.7.3 (CRAN) zu 0.7.4 (Entwicklung, laut NEWS): In 0.7.4 warnt `rec()` bei Codes ohne Regel, versteht Listen (`1,2=1`), `rev(lo, hi)` und Schlüsselwörter in beliebiger Schreibweise und behält die Missing-Typen aus `read_spss()` bei. In 0.7.3 werden getaggte NA zu einfachen NA (die Zahl der fehlenden Werte bleibt gleich).

## Übergang im `PackageInspector`

Die Vorlage ersetzt für `recode` die Einleitung und den Abschnitt „Was sagt das Ergebnis?“. Die Notiz „Umpolen ist eine inhaltliche Entscheidung. Die Methodenitems im Atlas sind bereits gleichgerichtet; das Beispiel zeigt nur die Operation.“ wird zu „Umpolen ist eine inhaltliche Entscheidung: Erst die Frage entscheidet, welche Richtung ‚mehr‘ bedeutet.“; die zweite Notiz bleibt. Das `MariposaPanel` darunter zeigt weiter den Aufruf für den Lehrdatensatz.

## Kompakt

Kurz gesagt, Zeichen der Regel, Eingabefeld mit Voreinstellungen, Vorher und nachher, R-Code. Alles andere erscheint erst in „Ausführlich“.
