# Werkstatt: Streuung (Stufe 1)

Begriffe: `variance` („Korrigierte Stichprobenvarianz“, endet nach Schritt 5) und `sd` („Standardabweichung“, endet nach Schritt 6). Schrittkarten für `deviation` (2), `squared_deviation` (3), `ss` (4), `df` (5). Grundlage ist der gebilligte Entwurf „standardabweichung_ausfuehrlich_kurz_gesagt“ vom 30. September 2026.

Platzhalter: `{P}` gewählte Person, `{x}` ihr Wert, `{d}` ihre Abweichung mit Vorzeichen, `{|d|}` Betrag, `{(d)}` negativ in Klammern, `{q}` Quadrat, `{werte}`, `{sum}`, `{m}` Mittelwert, `{S}` Quadratsumme, `{v}` Varianz, `{s}` Standardabweichung, `{share}` Anteil der Person an S in Prozent, `{sA}`/`{sB}` s der Gruppen A/B.

## Kopf

- **Wofür?** Zwei Gruppen stufen sich auf der Links-rechts-Skala ein (1 = ganz links, 10 = ganz rechts). Beide haben denselben Mittelwert 5. Trotzdem wirken sie verschieden: In der einen sind sich alle ziemlich einig, in der anderen gehen die Meinungen weit auseinander. Die Standardabweichung macht diesen Unterschied zu einer Zahl.
- **Kennzahlen:** Mittelwert x̄, Standardabweichung s (bei `variance`: Varianz s²).
- **Kurz gesagt (sd):** Die Standardabweichung sagt, wie weit die Werte typischerweise von ihrer Mitte entfernt liegen.
- **Fachlich (sd):** die Quadratwurzel der Varianz, also der Quadratsumme der Abweichungen vom Mittelwert geteilt durch die Freiheitsgrade n − 1.
- **Kurz gesagt (variance):** Die Varianz ist die Fläche eines typischen Abweichungsquadrats. Je größer, desto weiter liegen die Werte auseinander.
- **Fachlich (variance):** die Quadratsumme der Abweichungen vom Mittelwert geteilt durch die Freiheitsgrade n − 1.
- **Formel:** s = √( Σ(xᵢ − x̄)² / (n − 1) ); bei `variance` ohne Wurzel: s² = Σ(xᵢ − x̄)² / (n − 1). Vorlesbar: „s gleich Wurzel aus: Summe über alle Personen i von x i minus x quer, zum Quadrat, geteilt durch n minus 1“.
- **Eingesetzt:** s = √[ (x₁ − x̄)² + … + (x₅ − x̄)² / (5 − 1) ] mit den Zahlen, zweite Zeile = √[ {S} / 4 ] = √{v} ≈ {s}.
- **Voreinstellungen:** Gruppe B 1 3 5 7 9 (Start; s ≈ 3,16), Gruppe A 4 5 5 5 6 (s ≈ 0,71).

## Die Zeichen

| Zeichen | Sprich | Fachbegriff | Einfach | Schritt |
|---|---|---|---|---|
| x̄ | „x quer“ | Mittelwert | die Mitte der Gruppe | 1 |
| xᵢ | „x i“ | Beobachtung | der Wert von Person i | 2 |
| i | „i“ | Laufindex | die Nummer der Person, von 1 bis n | 4 |
| n | „n“ | Fallzahl | wie viele Personen, hier 5 | 5 |
| Σ | „Sigma“ | Summenzeichen | alles addieren, jede Person einmal | 4 |
| ( )² | „hoch zwei“ | Quadrat | mit sich selbst malnehmen | 3 |
| √ | „Wurzel“ | Quadratwurzel | welche Zahl ergibt mal sich selbst diesen Wert? | 6 |

## Schritte

### Schritt 1: x̄
- **Begriff:** `mean`, auch: arithmetisches Mittel.
- **Kurz gesagt:** Wir suchen die Mitte der Gruppe. Von ihr aus wird gleich jeder Abstand gemessen.
- **Fachlich:** Der Mittelwert x̄ ist die Summe aller Beobachtungen geteilt durch die Fallzahl n. Er ist der Bezugspunkt für alle Abweichungen.
- **Vorgerechnet:** Alle fünf Werte addieren: {werte} = {sum}. Durch die Fallzahl teilen: {sum} / 5 = {m}. Person {P} trägt ihren Wert {x} dazu bei, wie alle anderen auch.
- **Wie im Alltag:** Wie eine Wippe: Der Mittelwert ist der Punkt, an dem die Werte links und rechts genau im Gleichgewicht sind.
- **Warum?** Streuung heißt immer Streuung um etwas herum. Ohne Mitte gäbe es keine Abweichung, die man messen könnte.
- **Typischer Fehler:** Beim Mittelwert wird durch n = 5 geteilt, also durch alle Personen. Das n − 1 kommt erst in Schritt 5.
- **Kurz prüfen:** „Wie groß ist der Mittelwert x̄ dieser Gruppe?“ Diagnosen: = Summe → „Das ist die Summe. Jetzt noch durch n = 5 teilen.“; = Summe/4 → „Beim Mittelwert durch n = 5 teilen, nicht durch n − 1.“

### Schritt 2: xᵢ − x̄
- **Begriff:** `deviation` („Abweichung vom Mittelwert“), Zusatz: mit Vorzeichen.
- **Kurz gesagt:** Für jede Person messen wir: Wie weit ist sie von der Mitte weg, und auf welcher Seite?
- **Fachlich:** Die Abweichung ist die Beobachtung einer Person minus den Mittelwert. Ihr Vorzeichen zeigt die Richtung.
- **Vorgerechnet:** Person {P} hat den Wert {x}. Der Mittelwert liegt bei {m}. Abweichung: {x} − {m} = {d}. Negativ: {P} liegt links der Mitte. / Positiv: {P} liegt rechts der Mitte. / Null: {P} liegt genau auf der Mitte.
- **Wie im Alltag:** Wie Hausnummern auf einer Straße: Wer bei Nummer 1 wohnt, wohnt 4 Häuser links von Nummer 5.
- **Warum?** Das Vorzeichen zeigt die Seite, links oder rechts der Mitte. Der Betrag zeigt, wie weit weg jemand ist.
- **Typischer Fehler:** Das Minus weglassen. Es wirkt unwichtig, zeigt aber etwas Wichtiges: Addiert man alle Abweichungen, kommt immer 0 heraus (siehe Summenzeile der Tabelle).
- **Kurz prüfen:** „Person {P} hat den Wert {x}, der Mittelwert liegt bei {m}. Wie groß ist die Abweichung xᵢ − x̄ von {P}?“ Diagnose: = −d (d ≠ 0) → „Der Betrag stimmt, das Vorzeichen nicht. Rechne Wert minus Mittelwert: {x} − {m}.“

### Schritt 3: ( )²
- **Begriff:** `squared_deviation` („Quadrierte Abweichung“), auch: Abweichungsquadrat.
- **Kurz gesagt:** Aus jedem Abstand wird eine Fläche. Danach zählt nur noch, wie weit jemand weg ist, nicht mehr die Seite.
- **Fachlich:** Jede Abweichung wird quadriert, also mit sich selbst multipliziert. Das Ergebnis ist nie negativ.
- **Vorgerechnet:** Die Abweichung von {P} ist {d}. Quadriert: ({d})² = {(d)} · {(d)} = {q}. [bei negativem d:] Minus mal Minus ergibt Plus. Im Bild: ein Quadrat mit der Seitenlänge {|d|} und der Fläche {q} Kästchen.
- **Wie im Alltag:** Aus jedem Abstand wird eine quadratische Fläche, wie eine Terrasse mit dieser Seitenlänge. Doppelte Seitenlänge heißt vierfache Fläche.
- **Warum?** Das Quadrat macht jede Abweichung positiv, sodass sich nichts mehr aufhebt. Und es lässt große Abweichungen stärker zählen als kleine.
- **Typischer Fehler:** Taschenrechner-Falle: Wer −4² eintippt, bekommt −16, weil erst quadriert und dann das Minus gesetzt wird. Richtig ist (−4)² = 16 mit Klammern. Ein Quadrat ist nie negativ.
- **Kurz prüfen:** „Die Abweichung von Person {P} ist {d}. Was ergibt ({d})²?“ Diagnosen: = −q → „Taschenrechner-Falle: Klammern setzen. Ein Quadrat ist nie negativ.“; = 2·|d| → „Das ist mal 2. Hoch 2 heißt: die Zahl mit sich selbst malnehmen.“

### Schritt 4: Σ
- **Begriff:** `ss` („Quadratsumme der Abweichungen“), auch: Summe der Abweichungsquadrate.
- **Kurz gesagt:** Alle Flächen kommen auf einen Haufen.
- **Fachlich:** Das Summenzeichen Σ addiert die quadrierten Abweichungen aller n Personen. Das Ergebnis heißt Quadratsumme.
- **Vorgerechnet:** Die Abweichungsquadrate der fünf Personen: q₁ + … + q₅ = {S}. Person {P} steuert {q} bei, das sind {share} % der Quadratsumme.
- **Wie im Alltag:** Wie beim Einsammeln: Jede Person gibt ihre Fläche ab, alle Flächen kommen auf einen Haufen.
- **Warum?** Σ sorgt dafür, dass jede Person genau einmal in die Rechnung eingeht: Der Laufindex i geht von 1 bis n.
- **Typischer Fehler:** Die Abweichungen addieren statt ihrer Quadrate. Die Summe der Abweichungen ist immer 0, damit ließe sich keine Streuung messen.
- **Kurz prüfen:** „Wie groß ist die Quadratsumme der Abweichungen?“ Diagnose: = 0 → „0 ist die Summe der Abweichungen. Gefragt ist die Summe ihrer Quadrate.“

### Schritt 5: ÷ (n − 1)
- **Begriff:** `variance` („Korrigierte Stichprobenvarianz“), auch: Varianz s², geteilt durch die Freiheitsgrade n − 1 (Begriff `df`, „Freiheitsgrade der Streuung“).
- **Kurz gesagt:** Der Haufen wird fair aufgeteilt. So groß ist eine typische Fläche.
- **Fachlich:** Die Quadratsumme geteilt durch die Freiheitsgrade n − 1 ergibt die Varianz s².
- **Vorgerechnet:** {S} geteilt durch n − 1 = 5 − 1 = 4 ergibt {v}. Das ist die Fläche eines typischen Quadrats, gemessen in Skalenpunkten zum Quadrat.
- **Wie im Alltag:** Wie gerechtes Aufteilen: Der Haufen wird in gleich große Stücke geteilt, eins weniger, als es Personen gibt.
- **Warum?** Teilen macht Gruppen unterschiedlicher Größe vergleichbar. Warum durch n − 1 und nicht durch n, erklärt „Genau genommen“.
- **Typischer Fehler:** Durch n statt durch n − 1 teilen. Das ergäbe {S} / 5 = {S/5} statt {v}.
- **Kurz prüfen:** „Wie groß ist die Varianz s²?“ Diagnosen: = S/5 → „Du hast durch n = 5 geteilt. Die Formel teilt durch die Freiheitsgrade n − 1 = 4.“; = S → „Das ist noch die Quadratsumme. Es fehlt das Teilen durch n − 1.“

### Schritt 6: √ (nur `sd`)
- **Begriff:** `sd` („Standardabweichung“), auch: Quadratwurzel der Varianz.
- **Kurz gesagt:** Aus der typischen Fläche wird wieder ein Abstand: So weit liegen die Werte typischerweise von der Mitte weg.
- **Fachlich:** Die Standardabweichung s ist die Quadratwurzel der Varianz. Sie hat wieder die Einheit der Daten.
- **Vorgerechnet:** √{v} ≈ {s}. Probe: {s} · {s} ≈ {v}. Die Seitenlänge des typischen Quadrats beträgt also etwa {s} Skalenpunkte.
- **Wie im Alltag:** Eine Terrasse mit 10 m² Fläche ist ein Quadrat mit etwa 3,16 m Seitenlänge. Die Wurzel rechnet von der Fläche zurück zur Länge.
- **Warum?** Die Varianz hat die Einheit „Skalenpunkte zum Quadrat“, die niemand deuten kann. Erst s ist wieder in Skalenpunkten und lässt sich am Zahlenstrahl abtragen.
- **Typischer Fehler:** Die Wurzel vergessen. {v} ist die Varianz, nicht die Standardabweichung. Prüfe die Einheit: s muss in Skalenpunkten sein.
- **Kurz prüfen:** „Wie groß ist die Standardabweichung s? Zwei Nachkommastellen reichen.“ Diagnose: = v → „Das ist noch die Varianz. Es fehlt die Wurzel.“

## Rechentabelle

Spalten: Person | xᵢ (ab 1) | xᵢ − x̄ (ab 2) | (xᵢ − x̄)² (ab 3). Hervorgehoben: xᵢ in 1, Abweichung in 2, Quadrat in 3 und 4. Summenzeile: Σxᵢ; Σ(xᵢ − x̄) = 0 „immer“ (ab 2); Quadratsumme (ab 4, in 3 „…“). Zeilen darunter: x̄ = {sum} / 5 = {m}; ab 5 s² = {S} / (5 − 1) = {v}; ab 6 s = √{v} ≈ {s}. Die Zeile des aktuellen Schritts ist hervorgehoben. Ein Klick auf eine Zeile wählt die Person.

## Bild

Wie im gebilligten Entwurf: Zahlenstrahl mit einer Zeile je Person (A–E) und ziehbaren Punkten (Pfeiltasten ±1, Werte 1–10), gestrichelte Mittelwertlinie mit „x̄ = {m}“; ab 2 Abweichungspfeile mit Vorzeichenbeschriftung (gewählte Person dicker); darunter ab 3 Quadrate mit Kästchenraster (1 Kästchen = 1 Punkt²) und Zahl im Quadrat; ab 4 Klammer „Quadratsumme {S}“; ab 5 gestricheltes typisches Quadrat „{S} / 4 = {v}“; ab 6 dessen Unterkante hervorgehoben „s ≈ {s}“ und oben das Band x̄ − s bis x̄ + s. Bildunterschriften je Schritt:
- 3: Jede Abweichung wird zur Seite eines Quadrats. Ein Kästchen ist 1 Punkt².
- 4: Die Quadratsumme legt alle Flächen zusammen.
- 5: Geteilt durch n − 1 ergibt sich die Fläche eines typischen Quadrats: die Varianz.
- 6: Die Seite dieses Quadrats ist die Standardabweichung s. Oben am Zahlenstrahl: x̄ ± s.

## Was heißt das Ergebnis?

- **Kurz gesagt:** s ≈ 0: „Alle sagen dasselbe. Es gibt keine Streuung.“ Sonst: „Diese Gruppe ist sich eher einig, ähnlich wie Gruppe A.“ beziehungsweise „eher uneinig, ähnlich wie Gruppe B.“ (je nachdem, welchem s sie näher liegt).
- **Fachlich (sd):** Die Standardabweichung beträgt s = {s} Skalenpunkte. Die Einstufungen liegen also typischerweise etwa {s} Punkte um den Mittelwert {m} herum, grob zwischen {m − s} und {m + s}. Zum Vergleich: Gruppe A hat s = {sA}, Gruppe B s = {sB}. Je kleiner s, desto einiger ist sich eine Gruppe. Der Mittelwert allein hätte diesen Unterschied nicht gezeigt.
- **Fachlich (variance):** Die Varianz beträgt s² = {v} Skalenpunkte zum Quadrat. Als Fläche ist sie schwer zu deuten; ihre Wurzel, die Standardabweichung s ≈ {s}, ist wieder in Skalenpunkten (Link zu `sd`).

## Mit der Formel denken

1. **Alle fünf wählen die 5. Wie groß wird s?** 0 / 5 / hängt von n ab → 0. Schritt 2. Jede Abweichung wird 5 − 5 = 0. Null quadriert bleibt 0, die Quadratsumme ist 0, √0 = 0. Die Formel misst nur Abweichungen, und es gibt keine. Kurz gesagt: Keine Unterschiede, keine Streuung. Ausprobieren: 5 5 5 5 5.
2. **Alle rücken zwei Punkte nach rechts. Was macht s?** wird größer / bleibt gleich / wird kleiner → bleibt gleich. Schritt 2. Der Mittelwert wandert mit. In der Abweichung heben sich die 2 Punkte auf: (xᵢ + 2) − (x̄ + 2) = xᵢ − x̄. s beschreibt, wie weit die Werte auseinanderliegen, nicht wo sie liegen. Kurz gesagt: Verschieben ändert die Lage, nicht die Streuung. Ausprobieren: +2 (oder −2, wenn ein Wert über 8 liegt; liegen Werte an beiden Enden, Gruppe A um 2 verschoben).
3. **Warum nicht einfach die Abweichungen addieren, ohne Quadrat?** das ginge genauso / die Summe wäre immer 0 → die Summe wäre immer 0. Schritt 3. Hier: {Abweichungen mit „ + “} = 0. Die Abweichungen vom eigenen Mittelwert ergeben immer genau 0, das zeigt auch die Summenzeile der Tabelle. Erst das Quadrat macht jede Abweichung positiv. Kurz gesagt: Plus und Minus würden sich sonst gegenseitig aufheben.
4. **Eine Abweichung verdoppelt sich von 2 auf 4. Wie wächst ihr Beitrag zur Quadratsumme?** doppelt / vierfach → vierfach. Schritt 3. 2² = 4, aber 4² = 16. Das Quadrat lässt Personen am Rand überproportional zählen. Deshalb reagiert s empfindlich auf Ausreißer. Kurz gesagt: Wer weit weg ist, zählt viel mehr. Ausprobieren: Gruppe B, Person E auf 10 (s ≈ 3,49).

Bei `variance` entfällt Schritt 6; Frage 1 und 2 sprechen dann von s².

## Genau genommen

- **Kurz gesagt:** Mit n − 1 wird die Streuung in der Bevölkerung nicht zu klein geschätzt. Und s ist etwas anderes als der durchschnittliche Abstand.
- Warum n − 1? Die Abweichungen vom eigenen Mittelwert ergeben zusammen immer 0, das zeigt die Summenzeile der Tabelle. Kennt man vier davon, steht die fünfte fest: Es bleiben n − 1 frei wählbare Abweichungen, die Freiheitsgrade. Mit n − 1 ist s² ein erwartungstreuer Schätzer der Varianz der Grundgesamtheit, unterschätzt sie also nicht systematisch. Teilt man durch n, erhält man die mittlere quadrierte Abweichung genau dieser fünf Personen.
- s ist kein durchschnittlicher Abstand. Hier beträgt die mittlere absolute Abweichung {mad}, s dagegen {s}. Das Quadrat gewichtet große Abweichungen stärker. (Referenz: Gruppe B mad 2,4, s ≈ 3,16; Gruppe A mad 0,4, s ≈ 0,71.)
- Die Links-rechts-Skala hier wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten.

## Kompakt

Formel, Schrittknöpfe, je Schritt Fachbegriff und Kurz gesagt, das Bild. Alles andere erscheint erst in „Ausführlich“.
