# Werkstatt: Arithmetisches Mittel (Stufe 1)

Begriff: `mean` („Arithmetisches Mittel“). Zwei Schritte. Schrittkarte für `sum`.

Platzhalter: `{P}` gewählte Person (A–E), `{x}` ihr Wert, `{werte}` alle Werte mit „ + “ verbunden, `{sum}` Summe, `{m}` Mittelwert, `{n}` = 5. Zahlen nach Abschnitt 7.5 der Spezifikation.

## Kopf

- **Wofür?** Wo stehen die Befragten einer Gruppe politisch im Durchschnitt? Fünf Beispielpersonen stufen sich auf der Links-rechts-Skala des ALLBUS ein (1 = ganz links, 10 = ganz rechts).
- **Kurz gesagt:** Der Mittelwert ist der Ausgleichspunkt. Würde man alle Werte gerecht verteilen, bekäme jede Person genau ihn.
- **Fachlich:** Das arithmetische Mittel x̄ ist die Summe aller Beobachtungen geteilt durch die Fallzahl n.
- **Formel:** x̄ = Σxᵢ / n. Vorlesbar: „x quer gleich Summe über alle Personen i von x i, geteilt durch n“.
- **Eingesetzt:** x̄ = ({werte}) / 5 = {sum} / 5 = {m}.
- **Voreinstellungen:** Gruppe B 1 3 5 7 9 (Start), Gruppe A 4 5 5 5 6, „Mit Ausreißer“ 1 3 5 7 10.

## Die Zeichen

| Zeichen | Sprich | Fachbegriff | Einfach | Schritt |
|---|---|---|---|---|
| x̄ | „x quer“ | Arithmetisches Mittel | die Mitte der Gruppe | 2 |
| xᵢ | „x i“ | Beobachtung | der Wert von Person i | 1 |
| i | „i“ | Laufindex | die Nummer der Person, von 1 bis n | 1 |
| n | „n“ | Fallzahl | wie viele Personen, hier 5 | 2 |
| Σ | „Sigma“ | Summenzeichen | alles addieren, jede Person einmal | 1 |

## Schritt 1: Σ

- **Begriff:** `sum` („Summe“), Zeichen Σxᵢ.
- **Kurz gesagt:** Alle Werte werden zusammengezählt.
- **Fachlich:** Das Summenzeichen Σ addiert die Beobachtungen xᵢ aller n Personen.
- **Vorgerechnet:** {werte} = {sum}. Person {P} trägt ihren Wert {x} dazu bei, wie alle anderen auch.
- **Wie im Alltag:** Wie beim Zusammenlegen: Alle werfen ihre Punkte in einen gemeinsamen Topf.
- **Warum?** Der Mittelwert soll alle Personen berücksichtigen, jede genau einmal. Dafür sorgt Σ: Der Laufindex i geht von 1 bis n.
- **Typischer Fehler:** Eine Person vergessen oder doppelt zählen. Zähle nach: Es müssen n = 5 Summanden sein.
- **Kurz prüfen:** „Wie groß ist die Summe Σxᵢ?“ Soll {sum}. Diagnosen: Summe ohne einen der Werte → „Da fehlt eine Person. Es müssen 5 Summanden sein.“; Summe mit einem Wert doppelt → „Eine Person ist doppelt gezählt.“

## Schritt 2: ÷ n

- **Begriff:** `mean` („Arithmetisches Mittel“), Zeichen x̄, auch: Division der Summe durch n.
- **Kurz gesagt:** Die Summe wird gerecht auf alle verteilt.
- **Fachlich:** Die Summe geteilt durch die Fallzahl n ergibt das arithmetische Mittel x̄.
- **Vorgerechnet:** {sum} / 5 = {m}. Hätten alle fünf dieselbe Einstufung, läge sie bei {m}.
- **Wie im Alltag:** Wie beim Teilen einer Rechnung: der Gesamtbetrag geteilt durch die Zahl der Personen.
- **Warum?** Ohne das Teilen wüchse die Zahl mit jeder weiteren Person. Erst das Teilen macht Gruppen unterschiedlicher Größe vergleichbar.
- **Typischer Fehler:** Durch n − 1 teilen. Das gehört zur Varianz; beim Mittelwert wird durch n geteilt.
- **Kurz prüfen:** „Wie groß ist x̄?“ Soll {m}. Diagnosen: = {sum} → „Das ist noch die Summe. Jetzt durch n = 5 teilen.“; = {sum}/4 → „Beim Mittelwert durch n = 5 teilen, nicht durch n − 1.“

## Rechentabelle

Spalten: Person | xᵢ (Schritt 1) | xᵢ − x̄ (Schritt 2, als Kontrollspalte „So gleichen sich die Abstände aus“). Summenzeile: Σxᵢ = {sum}; Σ(xᵢ − x̄) = 0 mit dem Zusatz „immer“. Zeile darunter ab Schritt 2: x̄ = {sum} / 5 = {m}.

## Bild: Wippe

Zahlenstrahl 1–10, fünf ziehbare Punkte (Pfeiltasten: ±1). Ab Schritt 2 steht unter x̄ ein Dreieck als Stützpunkt; von ihm führen Hebel zu den Punkten, links in Braunrot, rechts in Grün, beschriftet mit der Abweichung. Unterschrift: „Links und rechts gleichen sich die Abstände genau aus. Deshalb ist x̄ der Ausgleichspunkt.“

## Was heißt das Ergebnis?

- **Kurz gesagt:** Im Durchschnitt stufen sich die fünf bei {m} ein, {m < 5,5: „etwas links der Skalenmitte 5,5“ | m = 5,5: „genau auf der Skalenmitte“ | sonst: „etwas rechts der Skalenmitte 5,5“}.
- **Fachlich:** x̄ = {m}. Wie einig sich die Gruppe ist, sagt der Mittelwert nicht: Gruppe A und Gruppe B haben beide x̄ = 5. Das misst die Standardabweichung (Link zur Werkstatt Streuung).

## Mit der Formel denken

1. **Person E rückt von 9 auf 10. Um wie viel ändert sich x̄?** Antworten: um 1 / um 0,2 / gar nicht. Richtig: um 0,2. Schritt 2. Erklärung: Die Summe wächst um 1, geteilt durch n = 5 ergibt +0,2. Jede Person bewegt den Mittelwert um ein n-tel ihrer eigenen Änderung. Kurz gesagt: Einzelne zählen, aber nur anteilig. Ausprobieren: E auf 10.
2. **Muss der Mittelwert ein Wert sein, den jemand angegeben hat?** Antworten: ja / nein. Richtig: nein. Schritt 2. Erklärung: Bei 1 3 5 7 10 ist x̄ = 5,2, und niemand hat 5,2 angegeben. Der Mittelwert ist ein Rechenwert, kein beobachteter Wert. Kurz gesagt: Der Durchschnitt muss nicht vorkommen. Ausprobieren: „Mit Ausreißer“.
3. **Was ergibt die Summe aller Abweichungen xᵢ − x̄?** Antworten: 0 / n / hängt von den Daten ab. Richtig: 0. Schritt 2. Erklärung: Der Mittelwert ist genau der Punkt, an dem sich die Abweichungen nach links und nach rechts ausgleichen, wie bei einer Wippe im Gleichgewicht. Die Summenzeile der Tabelle zeigt es. Kurz gesagt: Die Wippe ist immer im Gleichgewicht.
4. **Ein Tippfehler: Statt 9 steht 90 im Datensatz. Was passiert mit x̄?** Antworten: ändert sich kaum / springt stark nach oben. Richtig: springt stark nach oben. Schritt 1. Erklärung: Die Summe wird 106, geteilt durch 5 ergibt 21,2, weit außerhalb der Skala. Deshalb zuerst die Daten prüfen. Robuster gegen Ausreißer ist der Median. Kurz gesagt: Ein einziger falscher Wert kann den Mittelwert weit verschieben.

## Genau genommen

- **Kurz gesagt:** Der Mittelwert ist nur sinnvoll, wenn die Abstände zwischen den Werten etwas bedeuten.
- Die Links-rechts-Skala hier wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten. Für geordnete Kategorien ohne diese Annahme eignet sich der Median.
- Der Mittelwert ist der Wert, für den die Summe der quadrierten Abweichungen am kleinsten ist. Deshalb misst man die Streuung um ihn herum (Werkstatt Streuung).
- In gewichteten Stichproben wie dem ALLBUS zählt jede Person mit ihrem Gewicht: x̄_w = Σwᵢxᵢ / Σwᵢ (Begriff „Gewichte“).

## Schrittkarte `sum`

Zeigt Schritt 1 dieser Werkstatt mit dem Link „Ist Schritt 1 von 2 im arithmetischen Mittel (Werkstatt öffnen)“.
