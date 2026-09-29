# Lernpfad: zehn Aufgaben als Einzelanfertigungen – Designspezifikation

Stand: 29. September 2026 · Grundlage: zehn Konzepte, je Sitzung von einem eigenen Agenten entworfen und mit mariposa 0.7.3 auf ZA8831 v1.3.0 nachgerechnet (`2026-09-29-lernpfad-aufgaben/sitzung-01.md` … `sitzung-10.md`, geprüfte R-Skripte unter `…/r/`). Der Dozent hat für jede Sitzung die Empfehlung gewählt. Diese Spezifikation ersetzt im Lernpfad die gleichförmigen Missionen aus `2026-09-29-sandbox-belege-es-design.md`; deren Technik (SPSS-Leser, Rechenkern, Speicherung) bleibt.

## 1. Ziel

Jede der zehn Sitzungen bekommt eine eigene, neue Aufgabe. Keine Aufgabenform wiederholt sich. Jede Aufgabe versetzt die Studierenden in eine andere Rolle mit einem echten Auftrag, verlangt eigenes Rechnen in R und eine eigene Entscheidung, und endet mit einem Ergebnis, das im Plenum verglichen werden kann.

## 2. Entscheidungen des Dozenten

| Frage | Entscheidung |
|---|---|
| Aufgabenform | Einzelanfertigung je Sitzung. Gemeinsam sind nur Hilfsbausteine (Datei laden, Hilfeleiter, Speichern, Plenumskarte), nicht der Ablauf. |
| Rolle in der Seminarsitzung | Kern der Arbeitsphase, ca. 30–45 Minuten nach dem Input des Dozenten. |
| Selbststudium | Allein als abgeschlossene Übung tragfähig, ohne Dozent verständlich. |
| R | Immer: Studierende rechnen in RStudio mit mariposa. Der Browser stellt Auftrag und Geschichte, prüft Eingaben gegen die echten Daten und gibt Rückmeldung. Er führt kein R aus. |
| Rollen | Wechselnd, keine fortlaufende Geschichte. |
| Plenum | Jede Aufgabe endet mit einem kurzen, vergleichbaren Ergebnis. Unterschiede im Raum werden Lerngegenstand. Kein Server. |
| Partnervariante | Wo passend, optional mit verteilten Rollen; allein führt der Browser durch beide Rollen. |
| R-Hilfe | Vier Stufen: Denkanstoß → Verweis (Atlas-Karte, R-Workshop) → Code-Gerüst mit Lücken → vollständiger Code. Die Aufgabe zählt trotzdem als bearbeitet. |
| Bewertung | Keine Punkte, keine Musterlösung für Urteile, keine Hinweise für Lehrende. |
| „Belege es!“ | Bleibt nur in Sitzung 4 (Variante „Nenner-Check“). |

## 3. Die zehn Aufgaben

| # | Aufgabe · Rolle | Kern | Plenum |
|---|---|---|---|
| 1 | **Schon gefragt?** · Referent:in eines fiktiven Abgeordnetenbüros¹ | Vier Frageideen mit `find_var()`/`codebook()` prüfen und stempeln: übernehmen oder beauftragen | Wie viele Ideen muss das Büro beauftragen (0–4)? |
| 2 | **Erster Tag in der Datenerfassung** · Datenerfasser:in eines fiktiven Feldinstituts | Drei nachgestellte Papierbögen codieren, Regeln für mehrdeutige Kreuze setzen, doppelt erfassen | Zeile für Bogen 2 an der Tafel: eine Person in zwanzig Fassungen |
| 3 | **Deutschland in 100 Stühlen** · Szenograf:in einer fiktiven Wanderausstellung | Wahlabsicht als Saal mit 100 Stühlen (wer bekommt einen Stuhl?), Arbeitsstunden als Stuhlreihe mit Schild | Stühle für CDU/CSU, „weiß nicht“, AfD je Regel; Schildzahl |
| 4 | **Nenner-Check** · Faktenchecker:in | Die „87 %“ einer fiktiven Pressemitteilung nachbauen, Nenner drehen, eigene Lesart | Zwei verbundene Punkte je Person auf einer 0–100-%-Skala, Urteil |
| 5 | **Treiber-Rangliste** · Analyst:in eines fiktiven Beratungsbüros | Einen von 12 Kandidaten ziehen, passendes Zusammenhangsmaß wählen, gewichtet und Ost/West rechnen | Tafelraster „Maß = Wert · Stempel“, dann die Frage: Ist das eine Rangliste? |
| 6 | **Die letzte Frage** · Panelaufbau eines fiktiven Instituts | Mit dem echten Incentive-Experiment Fassung der Einladungsfrage wählen und Zusagequote versprechen | Gewählte Fassung, versprochene Quote, der Satz, den man nicht behauptet |
| 7 | **Drei Fragen müssen reichen** · Datenteam einer fiktiven Nachrichten-App¹ | Sieben Populismus-Items auf drei kürzen; α gegen Stellvertreter-Test | Punkt je Gruppe im Kreuz α × Stellvertreter-r |
| 8 | **Der Demokratie-Automat** · Technik im Besucherzentrum eines fiktiven Landtags¹ | Vorhersage-Automat per Regression einstellen, gegen den „Faulpelz“ antreten lassen, Schild schreiben | „Automaten-Parade“: Eingabe, b, R², Trefferquote, Entscheidung |
| 9 | **Mitgenommen** · Recherche einer fiktiven Doku-Redaktion | Ost-West-Umgezogene: Dummies, selbst gewählte Referenz, Selektion, Kontrollen, Off-Text-Satz | Koeffizienten je Referenz – Vorhersagen gleich |
| 10 | **Dolmetschen für den Bürgerrat** · Statistik-Dolmetscher:in eines fiktiven Bürgerrats | „Exp(B) = 3,77“ in Logit, Chance und Wahrscheinlichkeit übersetzen; entscheiden, bei wem eine Kampagne mehr bewirkt | Verschiedene richtige Zahlen aus einem Modell; die eine Zahl für den Bericht |

¹ **Anpassungen gegen Überschneidungen** (vom Assistenten vorgeschlagen, beim Review zu bestätigen): Die Konzepte spielten viermal in einem Umfrageinstitut (1, 2, 6, 7) und zweimal in einer Ausstellung (3, 8). Deshalb wechseln drei Kulissen, die Mechanik bleibt unverändert: Sitzung 1 im Abgeordnetenbüro („Gibt es dazu schon Daten, oder beauftragen wir eine Umfrage?“), Sitzung 7 bei einer Nachrichten-App (wöchentliches Barometer mit drei Fragen, Zeitreihe läuft drei Jahre), Sitzung 8 im Besucherzentrum eines Landtags. Alle fiktiven Namen sind eindeutig; „Querschnitt“ wird nicht doppelt verwendet.

## 4. Die Aufgaben im Einzelnen

Die Konzeptdateien enthalten Rollenauftrag im Wortlaut, Minutenplan, vollständigen R-Code, Hilfeleiter und Risiken. Hier stehen verbindlich: Ablauf in Kürze, R-Funktionen, Browser-Rechnungen, Plenum/Partner, Referenzwerte für Tests und die Festlegung offener Fragen.

### 4.1 Sitzung 1 · Schon gefragt?

- **Ablauf (38 Min.):** Auftrag → „Handschlag“ (einlesen, 5.246 Fälle und 579 Variablen im Environment ablesen) → vier Anträge: Horoskope, Angst vor Geflüchteten, Vertrauen in die Politik, Einsamkeit → eigene Idee → Prüfbericht.
- **R:** `read_spss(file.choose())`, `find_var()`, `codebook()` mit Variablenauswahl, R als Taschenrechner. Ohne Pipe.
- **Browser:** `findVar(pattern)` wie `find_var()` (Regex, ohne Beachtung der Groß-/Kleinschreibung, über Name und Label) mit Trefferzahl, Hinweise bei Umlauten und Wortteil-Treffern; Stempel „übernehmen“: Variable existiert, niedrigster Wert (tolerant gegen Wertelabel), Zahl der Gefragten (n minus TNZ-Codes); Stempel „selbst fragen“: mindestens zwei Suchwörter; Katalog mit Rückmeldungen je Antrag; Fehler-Decoder (ca. acht Muster); gekennzeichnete Notfallkonsole (nur `find_var`-Nachbildung) bei kaputtem R; Prüfbericht als Markdown plus R-Skript.
- **Plenum/Partner:** Stempelbilanz 0–4 und übernommene Variable für Antrag 3. Partner: Vier-Augen-Prinzip (A: Anträge 1 und 3, B: 2 und 4, dann Gegenprüfung mit neuen Suchwörtern).
- **Referenz:** „horoskop“ → `rh08b` (1 Treffer, alle 5.246); „flüchtling“/„angst“ → 0; „fluecht“ → 5 (`mi05`, `mp16`–`mp19`; `mp16`–`mp19` gefragt 3.599); „vertrauen“ → 16; `pt03` gefragt 3.650 (−11: 1.596); „einsam“ → `dp03`; 179 Variablen mit −11, 240 mit −10.
- **Festgelegt:** Sitzung 1 ohne Pipe; Notfallkonsole ja; die Anträge stehen in einer Datendatei und lassen sich pro Semester tauschen.

### 4.2 Sitzung 2 · Erster Tag in der Datenerfassung

- **Ablauf (40 Min.):** Auftrag → R-Block 1 (Codes nachschlagen) → 24 Zellen erfassen (8 Variablen × 3 Bögen), bei offenen Fällen Regel notieren → Doppelerfassung mit dem fiktiven Kollegen Ben oder Partner:in → R-Block 2/3, drei Zahlen eintragen → Freigabe, Plenumskarte.
- **Bögen:** Variablen `pa02a`, `pa01`, `pt03`, `st01`, `pv01`, `ls01` (+ `mode`, `splt23_1` im Bogenkopf); Bogen 2 enthält vier offene Fälle (Doppelkreuz, fehlende Frage in Version B, Randnotiz, Kreuz auf der Linie). Faksimiles als SVG mit Textalternative, erfundene Personen, keine Logos.
- **R:** `codebook() %>% summary()`, `filter(mode == 4)`, `to_label()`/`to_numeric()` in `mutate()`, `frequency()`. `filter()` und `frequency()` nur als Gerüstzeilen.
- **Browser:** Zellprüfung beim Tippen gegen die Metadaten (Code vergeben, ganzzahlig, keine leere Zelle); eindeutige Zellen gegen Soll-Labels (im Code als Labels hinterlegt, zur Laufzeit in Codes übersetzt); offene Zellen nicht bewertet, Nachfrage nach der Regel; Abgleich der Doppelerfassung; Zählung der drei R-Zahlen; Scan nach −42 über alle Variablen nach Modus; Zeilencode für die Partnervariante.
- **Referenz:** MAIL 1.656 (31,6 %), Version A 858, B 798; `pa01` −42: 24, nur MAIL; −42 insgesamt 638 Zellen in 202 Variablen, alle MAIL; 357 Papierbögen mit mindestens einer −42; `st01` bei MAIL: −8 und 4 kommen nie vor; `pt03` bei MAIL −11 = 798; nach `to_numeric(to_label(pv01))` AfD (42) = 6.
- **Festgelegt:** Eingabe als Mini-Datensatz in R (`tibble()`, `var_label()`, `val_labels()`, `set_na()`) ist Zusatz für zu Hause, nicht Kern.

### 4.3 Sitzung 3 · Deutschland in 100 Stühlen

- **Ablauf (40 Min.):** Saal 1: Lücken sichten → Stuhlregel je Missing-Code (Begründung zu −8 und −50) → Sitzplan → Saaltext. Saal 2: Arbeitsstunden, Fallauswahl, Schild, Stühle rechts vom Durchschnitt → Ergebniskarte. Saal 2 darf bei Zeitnot zu Hause fertiggestellt werden.
- **R:** `fre()`, `na_frequencies()`, `mutate(wahl = untag_na(pv01))` + `filter()`, `describe()`, `filter() %>% nrow()`.
- **Browser:** Rohcodes zählen; 100 Stühle nach größten Resten verteilen, ±1 Toleranz; Regel-Diagnose über alle 32 Teilmengen der Missing-Codes („angekreuzt X, deine Zahlen passen zu Y“), Hinweise bei 75 bzw. 101 Stühlen; Kennwerte mit Fallauswahl (Mittel, Median, Quartile Typ 7, Anteil über dem Mittel, Option −10 → 0); zwei SVG-Ansichten (10×10-Raster, Stuhlreihe mit Q1/Median/Q3).
- **Plenum/Partner:** Tabelle „Regel | CDU/CSU | weiß nicht | AfD“ und Zahlenstrahl der Schildzahlen. Partner: „Saal der Vielen“ gegen „Saal der Stimmen“, gemeinsamer Saaltext.
- **Referenz (ungewichtet):** `pv01` fehlt 24,1 % (603 −8, 306 −7, 186 −50, 149 −9, 18 −42); Stühle „nur klare Antworten“ 25/20/19/12/8/6, „+ weiß nicht“ 22/17/16/10/7/6/13, „alle“ 19/15/14/9/6/5/11/6/4; Rohprozente → 75 Stühle, gerundete gültige → 101. `dw15`: n = 2.945, Mittel 37,9, Median 40, Q1 35, Q3 41,5, SD 9,9, Schiefe −0,25, 1.950 (66,2 %) über dem Mittel; nur Vollzeit Mittel 41,7, Schiefe +0,97; mit −10 → 0: Mittel 21,4, Median 25 (n = 5.208).
- **Festgelegt:** Ungewichtet, mit Ausblick auf Sitzung 5; Parteien als Thema sind in Ordnung (neutral dargestellt); `untag_na()` in `mutate()` als einzelne vorgegebene Zeile.

### 4.4 Sitzung 4 · Nenner-Check (Belege es!)

- **Ablauf (40 Min.):** P1 Zahl nachbauen (zwei Dummys mit `rec()`, `crosstab(percentages = "col")`) → P2 eine Zelle, drei Nenner (`"row"`, `"all"`) → P3 eigene Lesart (Gegenprobe mit `pe05` umgepolt und/oder „weiß nicht“ als Nichtwahl per `untag_na()`) → Urteil und Faktencheck-Satz mit zwei Zahlen.
- **Browser:** rechnet nichts vor; erkennt aus Prozentwert und Zellen-n, welchen Weg jemand gerechnet hat, und sagt in Worten, wer die 100 % sind; benennt abweichende, aber vertretbare Umkodierungen statt sie als falsch zu markieren; Gegenfragen (bestehende Regeln, angepasst); der Spiegel schrumpft zu einem Streifen mit den vorbereiteten Lesarten. Werkbank und Live-Tabelle entfallen.
- **Plenum/Partner:** Zwei verbundene Punkte (Misstrauende, Übrige) je Person mit Wegkürzel und Urteil auf einer 0–100-%-Skala, oben das Fähnchen „87 %“. Partner: Nachrechnerin (P1) und Gegenrechner (P2), dann zwei Lesarten und ein gemeinsamer Satz oder festgehaltener Dissens. Zusatz für Schnelle: Misstrauens-Zähler mit `row_sums()` (oberste Stufe 8,8 %).
- **Referenz (ungewichtet):** 87,0 % = 127 von 146 Nichtwählenden; dieselbe Zelle 6,5 % von 1.956 Misstrauenden, 4,6 % von 2.785; 69,3 % der Wählenden stimmen `pe01` zu; 18 Lesarten: Nichtwahl der Misstrauenden 6,5–29,2 %, keine über 50 %; `pe05` ohne Umpolen 3,2 % gegen 6,9 % (Richtung kippt); χ² = 20,7, V = .086.
- **Festgelegt:** Die Pressemitteilung nennt die Zahl 87 %; `pe05` ist in P3 vorgeschlagen, nicht Pflicht; Werkbank- und Live-Tabellen-Code werden entfernt, Rechenkern und Gegenfragen-Regeln wiederverwendet. Warnhinweis in den Hilfen: `haven` nicht nach mariposa laden (überdeckt `read_spss()`).

### 4.5 Sitzung 5 · Treiber-Rangliste

- **Ablauf:** Karte ziehen (12 Kandidaten, jeder doppelt vergeben) → Skalenniveau bestimmen, Maß wählen → gewichtet rechnen, zusätzlich Ost und West getrennt → Eintrag „Maß = Wert · Stempel“ und Satz → Empfehlung an den Fonds, ob „Treiber“ das richtige Wort ist.
- **R:** `rec()` (Umpolen von `ps03`), `crosstab()`, `cramers_v()`, `phi()`, `goodman_gamma()`, `kendall_tau()` (nach `unlabel()`), `spearman_rho()`, `pearson_cor()`, jeweils mit `weights = wghtpew`, `filter(eastwest == …)`.
- **Browser:** gewichtete Kreuztabellen beliebiger Größe, Cramér-V, Phi, Gamma, Tau-b, Spearman, Pearson; Prüfung der eingetragenen Werte; Enthüllung aller zwölf Kandidaten in allen Währungen; Zufallsvergleich für V (Permutationswert).
- **Plenum/Partner:** Tafelraster mit zwölf Zeilen, dann Sortieren und Streiten. Partner: Analyst:in und Gegenleser:in des Fonds (zweite Währung, ungewichtet, Ost/West-Test, Veto gegen „Treiber“).
- **Referenz (gewichtet):** Wirtschaftslage V .277, Tau-b .387, Gamma .544; Alter V .158 (Zufall ≈ .154), r West −.095 / Ost +.045, Gewichtung verdoppelt r (−.031 → −.059); Konfession Gamma je nach Reihenfolge +.147 / −.135 / −.043; Ost/West V .229 → .186 mit Gewicht, Gamma .350.
- **Festgelegt:** `ps03` wird zuerst umgepolt (höher = zufriedener); `kendall_tau()` nach `unlabel()`, bis mariposa behoben ist; `pt03` bleibt als bewusst „zu guter“ Kandidat im Deck; Hinweis, dass `spearman_rho()` Gewichte nur zur Fallauswahl nutzt.

### 4.6 Sitzung 6 · Die letzte Frage

- **Hintergrund (Codebuch):** Splitexperiment „Incentivierung“ für Selbstausfüller:innen, Frage nach Einladung zu weiteren Befragungen. Betrag: 5 € bei Teilnahme oder 10 € (5 € für die Zustimmung + 5 € bei Teilnahme). „mit/ohne“: Anreiz nur am Ende des Fragetexts oder am Anfang genannt und am Ende wiederholt. Auf Papier nur A1/B1; online alle vier Fassungen etwa gleich groß; Zuweisung innerhalb eines Modus plausibel zufällig.
- **Ablauf:** Stationen: t-Tests für Wiederholung und Betrag → Korrelationsmatrix als Zufallscheck → ANOVA mit Tukey über die vier Fassungen (online) → Entscheidung: Fassung, versprochene Quote, ein Satz, den man ausdrücklich nicht behauptet.
- **R:** `rec()` für Gruppen und 0/1-Zusage, `t_test()`, `pearson_cor()` (Matrix), `oneway_anova()`, `tukey_test()`, `filter(mode == …)`. Kein `group_by() %>% t_test()`.
- **Browser:** Welch-t-Test, ANOVA, Tukey, Korrelationsmatrix, jeweils ungewichtet und gewichtet; Prüfung der Eingaben; Enthüllung der Falle.
- **Plenum/Partner:** Fassung, Quote, Nicht-Satz. Partner: Panelaufbau (will eine starke Zahl) und Qualitätssicherung (Vetorecht); Freigabe mit zwei Unterschriften.
- **Referenz:** Wiederholung über alle Selbstausfüller:innen +15,1 Punkte (52,7 → 67,7 %, p < .001), nur online +1,0 (p = .69); Betrag +4,4 (p = .013), online +4,5 (p = .059); ANOVA online p = .046, gewichtet .063; Korrelation Wiederholung × Papier r = −.58; Betrag deckt sich mit `splt23_1`.
- **Festgelegt:** 0/1-Zusage als Mittelwert (Anteil) genügt; ungewichtet rechnen, die gewichtete ANOVA ist die zweite Enthüllung.

### 4.7 Sitzung 7 · Drei Fragen müssen reichen

- **Ablauf:** Auftrag (App-Barometer, drei Fragen, drei Jahre) → vier Fragen streichen → α der Kurzskala und Stellvertreter-Test (Korrelation mit dem Index der gestrichenen vier) → Browser zeigt alle 35 Kurzskalen → begründete Wahl und ein Satz, was die Skala nicht mehr misst. Kür (+10 Min., optional): Kombinationsindex gegen Mittelwertindex.
- **R:** `reliability()`, `row_means()` in `mutate()`, `pearson_cor()`.
- **Browser:** α und ω für beliebige Item-Teilmengen, Mittelwertindex, Korrelationen, alle 35 Dreierauswahlen; Koordinatenkreuz α × Stellvertreter-r.
- **Plenum/Partner:** Punkte im Kreuz, Satz vorlesen; bei zu einheitlicher Wahl lost der Browser je Gruppe eine Pflichtfrage aus. Partner: Stimmigkeit (α, Trennschärfen) gegen Inhalt (alle Facetten, Stellvertreter-Test).
- **Referenz (ungewichtet):** alle sieben α = .833, ω = .841, n = 3.427; 14 von 35 Dreierauswahlen mit α ≥ .70, keine mit `pa29` (78 % Zustimmung); höchstes α `pa31+pa32+pa35` = .776, als Stellvertreter Rang 26/35; zweitstimmigste Rang 34; r(α, Stellvertreter) über alle 35 = .23; Beispiel `pa31+pa32+pa33`: α = .759, r = .758; Kür gewichtet 21,7 % gegen 14,2 %.
- **Festgelegt:** ungewichtet; die drei Facetten des Populismus erscheinen erst als Hilfe, nicht vorab.

### 4.8 Sitzung 8 · Der Demokratie-Automat

- **Ablauf:** Eingabefrage aus zehn vorbereiteten Items wählen (im Seminar nach Sitzreihen verteilt) → Automat in R einstellen (Konstante, Steigung) → Browser: Automat gegen echte Befragte und gegen den Faulpelz → Genauigkeit für alle gleich? (Residuen) → Schild → Entscheidung: freigeben, nur mit Schild, andere Frage.
- **R:** `rec()` (Umpolen `ps03`), `linear_regression(..., weights = wghtpew)`, `describe()` der Residuen je Eingabestufe; Levene-Test als Profi-Zusatz.
- **Browser:** gewichtete einfache OLS, Vorhersagen, Trefferquote (±1) gegen Mittelwert-Vorhersage, Residuenstreuung je Stufe, Levene; „Besucherprobe“.
- **Plenum/Partner:** Automaten-Parade (Eingabe, b, R², Treffer, Streuung, Entscheidung). Partner: Technik rechnet, Kuratorin rechnet zwei Anzeigen nach und schreibt das Schild.
- **Referenz (gewichtet, `ps03` umgepolt):** Eingabe `pt03`: n = 3.577, Konstante 2,288, b = 0,465, R² = 0,346; Residuen-SD 1,33 („kein Vertrauen“) gegen 0,71 (Stufe 6), Levene F = 74,9; Faulpelz ±1: 65 %, bester Automat 71 %; bei 5 von 10 Eingaben trifft der Automat seltener als der Faulpelz; `id02` b = 0,41, R² = 0,06; Alter p < .001, R² = 0,003; Links-Rechts: beide Ränder unzufriedener (Residuenmittel −0,85/−0,92).
- **Festgelegt:** kuratierte Liste mit zehn Items; die Treffer-Wendung gehört zum Kern; Levene als Zusatz.

### 4.9 Sitzung 9 · Mitgenommen

- **Ablauf:** Streit „Prägung gegen Ort“ → Dummies aus `dg03`, Referenz selbst wählen → Selektion prüfen (wer zieht um?) → Kontrollen als gemeinsame Ursache oder Folge einordnen → Interaktion als zweite Schreibweise → Off-Text-Satz.
- **R:** `rec()`/`to_dummy()`, `linear_regression(..., weights = wghtpew)` mit Dummies und Kontrollen, `crosstab()` für Selektion. Nie alle vier Dummies zugleich ins Modell (VIF-Fehler).
- **Browser:** gewichtete multiple OLS mit Dummies, Vorhersagen je Gruppe, Konfidenzintervalle, „Wackeltest“ (Einfluss: Neuschätzung ohne einflussreichste Fälle), „Tafel der anderen Schnittplätze“ mit allen Referenzen.
- **Plenum/Partner:** Koeffizienten je Referenz verschieden, Vorhersagen gleich. Partner: „Schnittplatz Ost“ und „Schnittplatz West“ gleichen Vorhersagen ab; A prüft Selektion und Kontrollen, B die Gegenprobe mit `pt03`.
- **Referenz (gewichtet; Vorzeichen hier für `ps03` im Original, positiv = unzufriedener; nach dem Umpolen gemäß Abschnitt 5 kehren sie sich um):** Referenz West-Bleibende: Ost-Bleibende +0,71, Ost→West +0,17 [−0,07; 0,40], West→Ost +0,03 [−0,32; 0,39]; Vorhersage Ost→West 2,92 bei jeder Referenz; West→Ost 78 % Abitur, mit Bildungskontrolle 0,155; mit `pt03` konstant Ost-Lücke 0,49; Interaktion 0,51 (p = .023). Umzugsgruppen n = 91 und 97.
- **Festgelegt:** bei `ps03` bleiben (kleine Gruppen werden ausdrücklich thematisiert); Referenzen im Seminar zugeteilt, allein frei; Einfluss nur als Wackeltest im Browser.

### 4.10 Sitzung 10 · Dolmetschen für den Bürgerrat

- **Ablauf:** Auftrag (Sachverständiger hinterließ „Exp(B) = 3,77“) → Modell nachrechnen → für zwei fiktive Ratsmitglieder übersetzen: Logit, Chance, Wahrscheinlichkeit (mit und ohne Pflichtgefühl) → Antwort „Bei wem bewirkt die Kampagne mehr?“ → die eine Zahl für den Bericht mit Laiensatz. Optional: Likelihood-Station (Trefferquote gegen −2LL).
- **R:** `rec()` (Wählen 0/1 aus `pv01`, −50 ausgeschlossen; Pflichtgefühl aus `pe09`; Interesse aus `pa02a`), `logistic_regression(..., weights = wghtpew)`, `marginal_effects()`, `predict()` für die zwei Profile.
- **Browser:** gewichtete Logit-Schätzung per IRLS, vorhergesagte Wahrscheinlichkeiten, Odds-Ratio, AME, sechs Fehlervarianten zur Diagnose (z. B. OR als „x-mal so wahrscheinlich“ gelesen).
- **Plenum/Partner:** verschiedene richtige Zahlen aus einem Modell, Abstimmung über die Berichtszahl. Partner: eine Person rechnet in Chancen, die andere in Wahrscheinlichkeiten.
- **Referenz (gewichtet, n = 2.758):** Exp(B) Pflichtgefühl 3,77, AME 5,4 Pp.; Jana 76,4 → 92,4 % (+16,0), Herr Brandt 96,0 → 98,9 % (+2,9); Trefferquote 95,1 % gegen 94,8 % („alle wählen“); −2LL 1.122 → 856.
- **Festgelegt:** `pe09` trotz Split als Kernprädiktor; `predict()` aus Base R für die Profile; die deutsche GLM-Warnung wird in den Hilfen als harmlos erklärt, bis mariposa sie unterdrückt; Likelihood-Station optional.

## 5. Übergreifende Festlegungen

- **Gewichtung:** Sitzungen 1–4 ungewichtet (Zählungen, Codierung, erste Auszählung, Kreuztabelle), mit Hinweis auf Sitzung 5. Ab Sitzung 5 gewichtet mit `wghtpew`, wo Aussagen über die Bevölkerung gemacht werden; Sitzungen 6 und 7 wie in 4.6/4.7 festgelegt.
- **Pipe:** Sitzung 1 ohne Pipe. Ab Sitzung 2 `library(mariposa)` und `library(dplyr)`, Analysen gepiped.
- **Codestil:** `read_spss()`, `rec()` in `mutate()`, keine `ifelse()`/`%in%`-Umkodierung (siehe mariposa-Codestil).
- **Demokratiezufriedenheit:** `ps03` wird in den Sitzungen 5, 8 und 9 einheitlich umgepolt (höher = zufriedener). Die Referenzwerte aus 4.9 werden dafür im Plan umgerechnet.
- **mariposa-Umgehungen bis zur Korrektur:** `unlabel()` vor `kendall_tau()`; kein `group_by()` vor `t_test()`/`describe()` mit getaggten NAs, stattdessen `filter()`; keine vollständigen Dummy-Sätze in gewichteten Regressionen; `codebook()` immer mit Variablenauswahl; die deutsche GLM-Warnung erklären.
- **Fiktion:** Alle Personen, Organisationen und Projekte sind erfunden und als fiktiv gekennzeichnet; keine echten Organisationen imitieren; Namen vor dem Einsatz auf Verwechslung prüfen.
- **Datenschutz:** Keine ALLBUS-Mikrodaten im Repository, Build oder Browser-Speicher. Aggregierte Referenzwerte in Tests und Doku sind erlaubt.

## 6. Architektur

```
src/tasks/                     neu: die zehn Aufgaben
  kit/                         gemeinsame Hilfsbausteine (keine gemeinsame Aufgabenform)
    HintLadder.tsx             vier Hilfestufen, Stufe 4 zeigt vollständigen Code
    NumberCheck.ts/.tsx        Eingabe mit Toleranz, Rückmeldung
    PlenumCard.tsx             Ergebniskarte zum Vorlesen/Abschreiben, Markdown-Download
    PartnerToggle.tsx          allein/zu zweit, Rollenwechsel
    RBlock.tsx                 Codeblock mit Kopieren und Skript-Download
    storage.ts                 statistikatlas.aufgaben.v1: nur Entscheidungen/Texte je Aufgabe
    stats/                     reine Rechenfunktionen (gewichtet): describe, crosstab n×m,
                               assoziationsmaße, t-Test, ANOVA, Tukey, Korrelationsmatrix,
                               alpha/omega, OLS (einfach/multipel), Logit (IRLS)
  s01-schon-gefragt/ … s10-buergerrat/
    content.ts                 Rollenauftrag, Texte, Anträge/Karten/Bögen (Daten, keine Logik)
    domain.ts                  Prüf- und Diagnoselogik der Aufgabe
    Task.tsx (+ Teilkomponenten)
    *.test.ts
src/sandbox/                   bleibt: readSav, allbus (Laden, Validierung), format, crosstab-Kern,
                               Gegenfragen-Regeln (für Sitzung 4 angepasst); Werkbank, LiveTable,
                               Mirror, Decompose, Verdict und die Missionen 3/5 entfallen
src/domain/curriculum.ts       Session.mission → Session.task (s01 … s10)
src/components/LearningPath.tsx rendert die Aufgabe der Sitzung
```

- **Daten laden:** einmal pro Browser-Tab; Sitzung 1 führt ein, jede Aufgabe bietet das Laden an, solange keine Datei geladen ist. Validierung wie bisher (ZA8831, benötigte Variablen je Aufgabe; fehlt eine, wird nur diese Aufgabe gesperrt).
- **Speicherung:** neuer Schlüssel `statistikatlas.aufgaben.v1`, defensive Wiederherstellung; der alte Schlüssel `statistikatlas.missionen.v1` wird ignoriert.
- **Karte:** Begriffe und Hilfen verlinken wie bisher in die freie Karte; „Zurück zu Sitzung N“ erhält den Aufgabenstand.
- **Rechenfunktionen** werden einmal gebaut und von mehreren Aufgaben genutzt; jede ist gegen R-Referenzwerte getestet.

## 7. Fehlerbehandlung

Wie bisher für Datei, Format und Speicher (Spezifikation „Belege es!“, Abschnitt 9). Zusätzlich: Eingaben außerhalb der Toleranz erhalten eine Diagnose statt „falsch“, wo die Aufgabe das vorsieht (Sitzungen 3, 4, 10); bei leeren Gruppen oder nicht schätzbaren Modellen erscheint eine Erklärung statt einer Zahl.

## 8. Prüfung

- **Testdatei:** `scripts/make-sandbox-fixture.R` wird um alle Variablen der zehn Aufgaben erweitert (synthetisch, mit denselben Missing-Codes und Splits).
- **Einheitentests** (`node --test`): jede Rechenfunktion gegen R-Werte auf der Testdatei; jede Aufgaben-Domäne mit auslösenden und nicht auslösenden Eingaben; Rendern jeder Aufgabe ohne Warnungen.
- **Echtdaten-Tests** (nur mit `ALLBUS_SAV`): alle Referenzwerte aus Abschnitt 4.
- **R-Abgleich:** Die Lösungsskripte (Hilfestufe 4) laufen mit mariposa 0.7.3 auf der Testdatei und der echten Datei und liefern die Zahlen, die der Browser erwartet.
- **Browser:** jede Aufgabe einmal allein und einmal in der Partnervariante durchspielen, mit echter Datei; Neuladen, Kartenweg, Downloads, Tastatur, 390 px.
- **Abnahme:** (1) Referenzwerte im Browser auf die angegebene Genauigkeit reproduziert; (2) jedes Lösungsskript läuft fehlerfrei; (3) jede Aufgabe ist in 45 Minuten allein schaffbar (Probedurchlauf); (4) kein ALLBUS-Wert im Speicher oder Build; (5) alle Schritte per Tastatur bedienbar, Grafiken mit Textalternative.

## 9. Umsetzungsreihenfolge

In Semesterfolge, damit jede Aufgabe vor ihrem Termin steht: (0) Grundlage: `src/tasks/kit`, Speicherung, Curriculum-Umstellung, Testdatei → (1) Sitzung 1 → (2) Sitzung 2 → (3) Sitzung 3 → (4) Sitzung 4 (Umbau) → (5) Sitzung 5 → … → (10) Sitzung 10. Jede Sitzung wird einzeln fertiggestellt, getestet und kommittiert. Rechenfunktionen entstehen mit der ersten Aufgabe, die sie braucht.

## 10. Nicht Teil dieser Spezifikation

Korrekturen in mariposa (eigenes Vorhaben im mariposa-Repository); Hinweise für Lehrende; Bewertung; Online-Austausch im Raum; weitere Modi aus früheren Plänen („Veröffentlichen mit Folgen“).

## 11. Beim Review zu bestätigen

1. Die drei Kulissenwechsel (Sitzungen 1, 7, 8) aus Abschnitt 3.
2. Die Festlegungen zu den offenen Fragen der Agenten in Abschnitt 4 und 5 (Gewichtung, Pipe, Umpolen, Zusatz- statt Kernteile).
