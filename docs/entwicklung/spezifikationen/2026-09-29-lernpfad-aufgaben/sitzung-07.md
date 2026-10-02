# Sitzung 7 · Index und Skala – Aufgabenkonzepte

Stand 29.09.2026. Alle Zahlen stammen aus dem ALLBUScompact 2023 (v1.3.0) und wurden mit mariposa 0.7.3 per `Rscript` auf der lokalen Datei geprüft. Die Hilfsskripte liegen in `konzepte/tmp-07/` und enthalten keine Mikrodaten.

## 1 Drei Konzepte

### A · „Drei Fragen müssen reichen“ (Empfehlung)

**Rolle:** Methodenleitung im Monatspanel eines fiktiven Umfrageinstituts. Ab Januar passen von den sieben Populismusfragen (pa29–pa35) nur noch drei ins Modul. Die Kurzskala läuft dann drei Jahre lang unverändert. Die Studierenden entscheiden, welche vier Fragen sie streichen. In R prüfen sie ihre Wahl mit zwei Maßstäben: der **Stimmigkeit** (α der drei Fragen) und dem **Stellvertreter-Test** (Korrelation ihres Kurzindex mit dem Index der vier gestrichenen Fragen). Danach zeigt der Browser alle 35 möglichen Kurzskalen. Die stimmigste ist ein schwacher Stellvertreter (Rang 26 von 35), die zweitstimmigste fast der schwächste (Rang 34). **Ergebnis:** eine begründete Kurzskala und ein Satz darüber, was sie nicht mehr misst. Es gibt keine richtige Lösung.

### B · „Der Raum rechnet Alpha“

**Rolle:** Prüferin oder Prüfer einer fiktiven Prüfstelle für Messinstrumente. Die Prüfstelle soll eine Vertrauensskala aus sechs Fragen (pt02, pt03, pt08, pt12, pt14, pt15) für eine Langzeitstudie freigeben. Das Prüfverfahren ist eine Doppelmessung: Jedes Paar teilt die sechs Fragen nach eigenem Urteil in zwei Hälften. Mit `row_means()` bildet es zwei Skalenwerte pro Person, korreliert sie und rechnet das Ergebnis mit Spearman-Brown auf die volle Länge hoch. Es gibt genau zehn Teilungen. An der Tafel entsteht ihre Verteilung von .83 bis .92. Die „logische“ Teilung Rechtsstaat gegen Parteipolitik liefert den niedrigsten Wert (.830). Der Mittelwert aller zehn (.897) liegt fast genau auf Cronbachs α (.894); nach der Rulon-Formel trifft er α exakt. Erst danach rechnen alle `reliability()`. So wird sichtbar: α ist der Durchschnitt aller Teilungen, die der Raum gerade gemacht hat. Wer allein arbeitet, bekommt nach der eigenen Rechnung die übrigen neun Teilungen vom Browser.

### C · „Der Wertetyp-Automat“

**Rolle:** Datenentwicklung für eine Mitmachstation in einer fiktiven Demokratie-Ausstellung. Besucher:innen bringen vier politische Ziele in eine Rangfolge. Die Station nennt ihren Wertetyp und sagt, wie viele Menschen in Deutschland so denken. Die Bauanleitung des Inglehart-Index fehlt. Die Studierenden rekonstruieren den Kombinationsindex `ingle` aus den Rangfragen va01–va04 mit `rec()` und `row_sums()`. Der Browser vergleicht ihre Häufigkeiten Zelle für Zelle mit `ingle`. Der naheliegende Weg trifft 5.070 Fälle exakt. Er verliert aber 35 Befragte mit unvollständiger Rangfolge, die `ingle` trotzdem einordnet, denn es zählen nur die ersten zwei Ränge. Danach schreiben die Studierenden den Anzeigetext (gewichtet: 18,2 % Postmaterialist:innen) und entscheiden, was die Station bei unvollständiger Eingabe anzeigt. Dabei lernen sie, warum man Ränge kombiniert statt mittelt.

## 2 Ausgearbeitet: „Drei Fragen müssen reichen“

### Rollenauftrag (so steht er im Browser)

> **Neuer Job: Methodenleitung im Monatspanel „Querschnitt“** *(Institut und Panel sind fiktiv)*
>
> Unser Panel befragt jeden Monat 3.000 Menschen. Bisher stehen sieben Populismusfragen im Fragebogen. Ab Januar ist nur noch Platz für drei. Die Kurzskala läuft dann drei Jahre lang unverändert. Wer später etwas tauscht, zerreißt die Zeitreihe.
>
> Du entscheidest, welche drei Fragen bleiben. Teste deine Wahl vorher am ALLBUS 2023, in dem alle sieben Fragen gestellt wurden: Messen deine drei Fragen stimmig dasselbe? Und sagen sie voraus, was die vier gestrichenen Fragen ergeben hätten?
>
> Abgabe bis Sitzungsende: deine drei Fragen, zwei Kennzahlen und ein Satz: *„Was meine Kurzskala nicht mehr misst: …“*

### Ablauf (etwa 40 Minuten)

| Min. | Schritt | Wo |
|---|---|---|
| 0–4 | Auftrag lesen. Die sieben Fragen erscheinen mit Wortlaut und Zustimmungsanteil: pa29 78 %, die übrigen 28–70 % | Browser |
| 4–9 | **Inhaltskarte:** die Fragen nach selbst benannten Seiten des Populismus sortieren. Vorschlag: Volkssouveränität, Anti-Elitismus, Einheit des Volkes; frei umbenennbar. Erste Wahl mit einem Satz Begründung | Browser |
| 9–22 | Batterie und Kurzskala prüfen, Kurz- und Restwert je Person bilden, korrelieren | RStudio |
| 22–27 | Werte eintragen, Prüfung, danach die **Landschaft** aller 35 Kurzskalen | Browser |
| 27–35 | Umentscheiden ist ausdrücklich erlaubt: eine Frage tauschen und neu rechnen (eine Zeile ändern). Danach die endgültige Wahl | beide |
| 35–40 | Ergebniskarte und Satz | Browser |
| +10 | Kür: Kombinationsindex „durchgehend populistisch“ | beide |

### R-Teil (auf der lokalen Datei ausgeführt)

```r
library(mariposa)
library(dplyr)

allbus <- read_spss("ZA8831_v1-3-0.sav")

# 1 · Die ganze Batterie: Trennschärfen und „Alpha ohne Item“
allbus %>%
  reliability(pa29, pa30, pa31, pa32, pa33, pa34, pa35) %>%
  summary()

# 2 · Stimmigkeit deiner Kurzskala (Beispiel: pa31, pa32, pa33)
allbus %>%
  reliability(pa31, pa32, pa33)

# 3 · Zwei Skalenwerte pro Person
allbus <- allbus %>%
  mutate(
    kurz = row_means(., pa31, pa32, pa33, min_valid = 3),
    rest = row_means(., pa29, pa30, pa34, pa35, min_valid = 4)
  )

# 4 · Stellvertreter-Test
allbus %>%
  pearson_cor(kurz, rest)
```

**Echte Ergebnisse:**
- Alle sieben Fragen: α = .833, ω = .841, n = 3.427 (nur Split A, listenweise). pa29 hat die schwächste Trennschärfe (.348). Ohne pa29 stiege α auf .842.
- Beispiel pa31 + pa32 + pa33: α = .759 (n = 3.478), r(kurz, rest) = .758 (n = 3.427).
- Alle 35 Kurzskalen: α liegt zwischen .527 und .776, der Stellvertreter-Wert zwischen .630 und .764. Nur 14 Kurzskalen erreichen α ≥ .70, keine davon enthält pa29 (höchstens .631). Über die 35 Kurzskalen hängen α und Stellvertreter-Wert nur schwach zusammen (r = .23).

| Kurzskala | Seiten* | α (Rang) | Stellvertreter-r (Rang) |
|---|---|---|---|
| pa31 + pa32 + pa35 | E H E | .776 (1) | .702 (26) |
| pa30 + pa32 + pa35 | E H E | .767 (2) | .678 (34) |
| pa30 + pa31 + pa35 | E E E | .740 (6) | .689 (31) |
| pa31 + pa32 + pa33 | E H V | .759 (5) | .758 (2) |
| pa30 + pa32 + pa33 | E H V | .728 (11) | .764 (1) |
| pa29 + pa33 + pa34 | V V H | .620 (25) | .630 (35) |

\*Vorschlagszuordnung: V = Volkssouveränität, E = Anti-Elitismus, H = Einheit des Volkes.

**Kür:** `rec(pa31, rules = "1:2=1 [stimmt zu]; 3:5=0 [nicht]")` usw., dann `row_sums(., z31, z32, z33, min_valid = 3)`, dann `crosstab(im_schnitt, durchgehend, weights = wghtpew)`. Ergebnis gewichtet für pa31 + pa32 + pa33: Nach dem Mittelwertindex stimmen 21,7 % im Schnitt zu (Kurzwert ≤ 2). Allen drei Fragen stimmen aber nur 14,2 % zu (Kombinationsindex). Also gelten 7,5 % nur nach der Mittelwertlogik als populistisch, weil Zustimmung auf einer Seite die Ablehnung auf einer anderen ausgleicht.

### Was der Browser prüft

**Neue TypeScript-Rechnung (klein):** Werte 1–5 gelten, alle anderen Codes als fehlend. Dazu α aus der Kovarianzmatrix (listenweise), Mittelwert je Person, Pearson-r, Trennschärfen und α ohne Item; eine Schleife über alle 35 Kombinationen (rund 3.400 Fälle, sofort). Referenzwerte aus R liegen vor. Die Kür nutzt die vorhandene gewichtete 2×2-Tabelle.

- **Eingabeprüfung** für α und r (Toleranz ±.005). Abweichungen werden erkannt und erklärt, nicht bewertet:
  - α = .833: „Das ist das α aller sieben Fragen.“
  - Gewichtetes α (.754) oder standardisiertes α (.759): wird angenommen, mit Hinweis.
  - r = .937: „Du hast mit dem Gesamtindex korreliert. Der enthält deine drei Fragen selbst, du prüfst also eine Aussage an sich selbst.“ (Überlappung von Teil und Ganzem.)
  - r ohne `min_valid` (bis .02 niedriger): wird angenommen, mit der Frage „Wer bekommt überhaupt einen Skalenwert?“
- **Inhaltsabgleich** mit der eigenen Inhaltskarte, etwa: „Aus ‚Einheit des Volkes‘ ist keine Frage mehr dabei.“
- **Überraschungsmoment, die Landschaft:** ein Streudiagramm aller 35 Kurzskalen (x: α, y: Stellvertreter-r), die eigene markiert, beide „Champions“ benannt. Wer nur auf α geachtet hat, landet unten rechts: Fast gleiche Fragen stimmen miteinander überein, sagen aber wenig über die anderen Seiten des Begriffs.
- **Hinweis zu pa29,** falls gewählt: Die Frage trifft den Kern des Begriffs, aber 78 % stimmen ihr zu, sie unterscheidet also kaum. Streichen oder behalten ist eine Frage der Validität, keine Rechenfrage.

### Gestufte Hilfen (R)

1. **Denkanstoß:** „Du brauchst eine Zahl für die Stimmigkeit deiner drei Fragen. Außerdem für jede Person zwei Werte, die du miteinander korrelierst.“
2. **Verweis:** die Begriffskarten Reliabilität · Alpha & Omega, Mittelwertindex, Skalenwert pro Person und Pearson-Korrelation; der R-Workshop https://rloesung.github.io/RWorkshop/.
3. **Gerüst mit Lücken:** `reliability(___, ___, ___)`, `kurz = row_means(., ___, min_valid = 3)`, `rest = row_means(., ___, min_valid = 4)`, `pearson_cor(___, ___)`.
4. **Vollständiger Code** mit der eigenen Wahl eingesetzt (über den vorhandenen Codegenerator). Die Aufgabe zählt trotzdem als bearbeitet. Dazu der Satz: „Die Entscheidung bleibt deine.“

### Plenum, Partnervariante, allein

**Plenum (5–10 Minuten):** Jede Gruppe klebt einen Punkt mit ihren drei Fragen in ein Koordinatenkreuz an der Tafel (α × Stellvertreter-r) und liest ihren Satz vor. Die Punkte liegen nicht auf einer Linie. Leitfragen: Welche Kurzskala würdet ihr drei Jahre lang verantworten? Wer hat pa29 behalten, und warum? Fällt die Wahl zu einheitlich aus, lost der Browser je Gruppe eine Pflichtfrage aus („bleibt wegen der Vorgängerstudie“).

**Partnervariante:** A vertritt die Stimmigkeit: Sie optimiert α und liest die Trennschärfen. B vertritt den Inhalt: Jede Seite des Begriffs soll erhalten bleiben, und er prüft den Stellvertreter-Test. Beide schlagen eine Kurzskala vor, rechnen beide Kennzahlen für beide Vorschläge und einigen sich auf eine. Wer allein arbeitet, wird vom Browser nacheinander durch beide Rollen geführt („Jetzt wechselst du die Seite“).

**Allein tragfähig:** Alles steht im Browser; die Landschaft ersetzt den Vergleich im Raum. Die Karte lässt sich als Markdown herunterladen.

### Begriffe und Missverständnis

**Abgedeckt:** Mittelwertindex; Skalenwert pro Person (`row_means`, `min_valid`); Reliabilität (α, ω, Trennschärfe, α ohne Item, Abhängigkeit von der Zahl der Fragen); Validität (Inhalt; die gestrichenen Fragen als Kriterium); Messfehler (Überlappung schönt Korrelationen). Der Kombinationsindex kommt nur in der Kür vor.

**Angegriffenes Missverständnis:** „Je höher α, desto besser misst die Skala.“ α misst Stimmigkeit, nicht Bedeutung. Fast gleiche Fragen treiben α hoch und verengen den Begriff. Nebenbei zeigt sich, dass α von der Zahl der Fragen abhängt: sieben Fragen erreichen .833, die beste Dreierauswahl nur .776.

### Aufwand und Risiken

**Aufwand M.** Kleiner Rechenkern; neu sind Inhaltskarte, Streudiagramm, Eingabeprüfung mit Diagnosen und Ergebniskarte. Hilfenleiter und Codegenerator lassen sich wiederverwenden.

**Risiken:**
1. Der Stellvertreter-Wert hängt auch davon ab, was im Rest steckt. Steht pa29 in der Kurzskala, enthält der Rest nur starke Fragen (pa29 + pa31 + pa32: α-Rang 24, Stellvertreter-Rang 4). Das braucht einen Satz in der Rückmeldung und ist ein guter Anlass fürs Plenum.
2. Zwei korrelationsartige Kennzahlen können verwirren; konsequent „Stimmigkeit“ und „Stellvertreter-Wert“ sagen.
3. Die Batterie wurde nur in Split A gestellt: n ≈ 3.430.
4. Gute Dreierauswahlen sprechen sich im Raum herum. Das Pflichtfrage-Los wirkt dagegen.

## 3 Offene Fragen an den Dozenten

1. Soll der Kombinationsindex Pflicht werden (Kür wird Pflicht, +10 Minuten)? Oder soll Konzept C diesen Begriff als eigene Zusatzaufgabe übernehmen?
2. Gewichtet oder ungewichtet rechnen? α ändert sich kaum (.759 gegenüber .754). Ich empfehle ungewichtet, mit Hinweis.
3. Soll die Zuordnung der Seiten (Volkssouveränität, Anti-Elitismus, Einheit des Volkes) als Vorschlag sichtbar sein, oder sortieren die Studierenden völlig frei?
