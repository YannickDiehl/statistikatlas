> Aktualisierung vom 10. September 2026: Die nachfolgende Planung mit vier Einstiegen wurde durch das Nutzerfeedback revidiert. Maßgeblich ist jetzt die dauerhaft sichtbare Netzkarte ohne Verfahrensreiter; aktuelle Bedienung und Prüfstand stehen in README.md und UMSETZUNG-Pruefstand.md.

# Statistikatlas: Gesamtkonzept für die Weiterentwicklung

Stand: 10. September 2026. Konzeptioneller Entwurf für den vorhandenen Atlas mit 29 Konzepten und vier Einstiegen. Ausgangspunkt ist der besprochene Mittelwert-Prototyp mit aufklappbaren Bausteinen, verständlichen Erklärungen, interaktiven Formeln und veränderbaren Beispieldaten. Die Anwendung selbst wird durch dieses Dokument nicht verändert.

## 1. Leitentscheidung

Der Atlas zeigt, wie statistische Verfahren aus wiederverwendbaren Bausteinen entstehen. Die fachliche Struktur bleibt vollständig; die Oberfläche legt sie schrittweise offen. Allgemeine Formel, konkrete Rechnung und Bedeutung des Ergebnisses gehören sichtbar zusammen.

Vier gleichberechtigte Einstiege erschließen denselben Baukasten:

| Einstieg | Leitfrage | Ergebnis des Einstiegs |
|---|---|---|
| Mittelwert | Wie wird aus mehreren Werten eine zusammenfassende Zahl? | Die Summe gleichmäßig auf die Beobachtungen verteilen. |
| Streuung | Wie stark unterscheiden sich die Werte? | Streuung um den Mittelwert in der ursprünglichen Einheit beschreiben. |
| z-Standardisierung | Wie weit liegt ein Wert vom Mittelwert entfernt – gemessen in Standardabweichungen? | Eine Beobachtung relativ zu ihrer Datenreihe einordnen. |
| Korrelation | Wie hängen zwei Merkmale linear zusammen? | Richtung und Stärke des linearen Zusammenhangs beschreiben. |

Die Reihenfolge ist ein didaktisches Angebot. Insbesondere ist z-Standardisierung keine notwendige Vorstufe der Pearson-Korrelation. Alle Einstiege sind von Anfang an erreichbar; Aufklappen setzt keine absolvierte Lektion voraus.

## 2. Ein Begriff, verschiedene Verwendungen

Die Mittelwert-Demonstration reicht als Datenmodell für den gesamten Atlas noch nicht aus. „Teilen“ kann die Summe durch die Anzahl, die Quadratsumme durch Freiheitsgrade oder die Kovarianz durch ein Streuungsprodukt teilen. Die Erklärung muss jeweils die tatsächlichen Eingänge benennen.

Deshalb unterscheiden wir:

- **Begriff:** ein eindeutiger fachlicher Eintrag, beispielsweise Standardabweichung oder Division. Alle 29 Einträge bleiben erhalten.
- **Verwendung im Bauplan:** der Begriff mit seinen konkreten Eingängen, etwa Standardabweichung von X oder Division der Kovarianz durch sₓsᵧ.
- **Aktueller Betrachtungskontext:** Einstieg, Rechenweg, Variable, betrachtete Werteebene und ausgewählte Beobachtung.

Im Gesamtnetz erscheint ein Begriff einmal. Im Bauplan können X und Y als zwei Verwendungen desselben Begriffs erscheinen, mit derselben Erklärung und klaren Beschriftungen. Wenn dieselbe Größe mehrfach gebraucht wird, wird sie geteilt: sₓ bleibt beispielsweise eine gemeinsame Größe für zₓ und das Produkt sₓsᵧ.

Die Identität einer berechneten Größe richtet sich nach ihren Eingängen. Ein anderer Navigationsweg oder eine andere Auswahl darf nicht allein zu einer Kopie führen. Grundoperationen dürfen an verschiedenen Rechnungen als kompakte Elemente erscheinen; sie führen jeweils zum selben fachlichen Eintrag und zeigen die passenden Operanden.

Besonders wichtige Kontextregeln:

1. Ein Klick auf sᵧ öffnet Standardabweichung **für Y**; ein Klick auf sₓ öffnet sie für X.
2. Die ausgewählte Person bleibt beim Wechsel zwischen X und Y dieselbe.
3. Ein generisches xᵢ bezeichnet den aktuell betrachteten Fall. Bei Σ durchläuft i dagegen alle berücksichtigten Fälle; die Summe wird niemals auf den ausgewählten Fall reduziert.
4. Skalierung verwendet allgemein einen Eingangswert uᵢ und einen Maßstab a. Im eigenständigen Beispiel kann uᵢ = xᵢ gelten; im z-Weg gilt uᵢ = xᵢ − x̄. Der Eingang wird sichtbar benannt.
5. Die Grundformel bleibt allgemein. Eine lokale Belegung wird ausdrücklich mit „Hier …“ erklärt.

## 3. Einheitlicher Aufbau eines Bausteins

Jeder aufgerufene Baustein verwendet dieselbe inhaltliche Reihenfolge:

1. **Name und Bedeutung:** verständlicher Titel mit präzisem Fachbegriff, wo beide gebraucht werden; zwei bis drei kurze Sätze.
2. **Formel oder passende Schreibweise:** sichtbar, mathematisch korrekt gesetzt und mit anklickbaren Bestandteilen. Nicht jeder Begriff benötigt eine künstliche Formel.
3. **Rechnung mit den aktuellen Daten:** dieselben Operanden in derselben Struktur, gefolgt von einem verständlich interpretierten Ergebnis.
4. **Passendes Experiment:** direkt am Begriff, mit einer konkreten Veränderungsmöglichkeit und sichtbaren Folgen.
5. **Weitere Bausteine und Vertiefung:** direkte Eingänge und eine gezielte Frage wie „Warum n − 1?“.

Die notwendige Bedingung für die aktuelle Berechnung steht am Ergebnis. Vertiefende Begründungen dürfen eingeklappt sein. Eine nicht erfüllte Bedingung darf nie erst hinter „Mehr erfahren“ sichtbar werden.

Beispiel für z:

> Ein z-Wert zeigt, wie weit eine Beobachtung vom Mittelwert entfernt ist. Als Maßstab dient die Standardabweichung.
>
> zₓᵢ = (xᵢ − x̄) / sₓ
>
> Für Person 2: (2 − 3) / √2,5 ≈ −0,632.
>
> Die Lernzeit liegt ungefähr 0,63 Standardabweichungen unter dem Mittelwert.

Die Aussage über den Einzelwert wird nicht mit Eigenschaften der gesamten standardisierten Reihe vermischt. „Mittelwert 0 und Stichproben-Standardabweichung 1“ ist eine ergänzende Beobachtung zur Reihe.

## 4. Verbindliche Regeln für interaktive Formeln

### Navigation und Erklärung

- Ein Formelbestandteil verweist auf **Begriff und Verwendung**, nicht nur auf eine Begriffs-ID.
- Zeigen oder Tastaturfokus erklärt das Zeichen und markiert die zugehörige sichtbare Größe im Bauplan und in der Einsetzung.
- Ein Klick öffnet den passenden Baustein. Verdeckte notwendige Zwischenstufen werden entlang des aktiven Rechenwegs geöffnet.
- Ein Sprung über einen anderen Rechenweg wird als solcher bezeichnet. Das Öffnen eines verdeckten Begriffs aktiviert niemals pauschal alle Alternativen.
- Ganze Ausdrücke bleiben erreichbar: etwa die Quadratsumme Σ(xᵢ − x̄)² und die Freiheitsgrade n − 1. Ihre Bestandteile werden bei der Vertiefung einzeln erklärt.
- Ein Bruch verweist zusätzlich auf die Operation Teilen; Potenz und Wurzel verweisen auf Quadrieren und Wurzelziehen. Diese Links brauchen ausreichend große Bedienflächen und eindeutige Beschriftungen.
- Der Index i erhält eine Erklärung und eine Verbindung zur Fallauswahl; dafür wird kein zusätzlicher Rechenknoten erfunden.

### Formale Konsistenz

- Es wird intern mit ungerundeten Werten gerechnet. Sobald angezeigte Operanden oder Ergebnisse gerundet sind, muss die Darstellung eine Näherung kenntlich machen.
- Formel, Zahlenbeispiel, Beschriftung, Diagramm und Ergebnis verwenden dieselbe Variable, dieselben Fälle und denselben Rechenweg.
- Varianz hat quadrierte Einheiten; Standardabweichung die ursprüngliche Einheit; Kovarianz das Produkt der Einheiten; z und r sind einheitenlos.
- Datenreihen und Paare verwenden Semikola als Trennzeichen, damit Dezimalkommas und Multiplikationszeichen eindeutig bleiben.
- Für Zählen genügt eine Zählfolge; für metrisches Skalenniveau und linearen Zusammenhang sind passende Gegenüberstellungen hilfreicher als zusätzliche Formeln.
- In langen Formeln wird eine verständliche kompakte Hauptform gezeigt. Beim Öffnen eines Teilbegriffs erscheint dessen ausgeschriebene Formel. Wesentliche Bedingungen bleiben dabei sichtbar.

## 5. Bedienung und große Baupläne

Die vier Einstiege bleiben als Navigation sichtbar. Im Arbeitsbereich gibt es drei primäre Handlungen: Baustein auswählen, seine direkten Bausteine zeigen und zur vorherigen Ansicht zurückkehren. Eine ausdrücklich aufgerufene Übersicht erschließt das Gesamtnetz und alle Begriffe.

**Auswählen:** ändert die Erklärung, ohne die gesamte Ansicht zurückzusetzen. **Aufklappen:** ergänzt einen Zweig, ohne einen neuen Einstieg zu beginnen. **Zurück:** stellt Einstieg, Rechenweg, Variablenbezug, Auswahl, geöffnete Zweige und Kartenausschnitt wieder her. Veränderte Messwerte werden dadurch nicht rückgängig gemacht; dafür gibt es die eigene Aktion „Beispiel zurücksetzen“.

Zu Beginn eines Einstiegs werden das Ergebnis und seine unmittelbaren Eingänge gezeigt. Tiefere Voraussetzungen bleiben über jeden Baustein erreichbar. Die Übersicht über alle 29 Konzepte ist eine zusätzliche Orientierungshilfe; sie ist nicht Voraussetzung für das Lesen einer einzelnen Rechnung.

Beim Aufklappen werden vorhandene Positionen nach Möglichkeit erhalten und neue Zweige lokal angeordnet. Eingaben und Fallwechsel verschieben die Karte nicht. Wenn mehr Platz gebraucht wird, darf sich die Arbeitsfläche erweitern. Ein vollständiges Einpassen geschieht auf ausdrücklichen Wunsch; dabei darf der Überblick kleiner werden, die Erklärung bleibt lesbar.

Gemeinsam verwendete Voraussetzungen verschwinden erst, wenn kein offener Zweig sie mehr benötigt. Verbindungen werden beim ausgewählten Baustein hervorgehoben; lange Kantenbeschreibungen erscheinen gezielt zu dieser Auswahl.

Auf kleinen Bildschirmen zeigt die Standardansicht den ausgewählten Baustein mit seinen unmittelbaren Eingängen und einem nachvollziehbaren Rückweg. Erklärung, Formel und Experiment folgen unmittelbar. Tiefere Ebenen werden nacheinander erkundet. Eine vollständig aufgeklappte Karte soll dort nicht vor mehreren Bildschirmseiten Text stehen.

## 6. Die vier Lernwege

### 6.1 Mittelwert

**Erste Ansicht:** Mittelwert, Summe, Anzahl und die Operation Teilen. Summe und Anzahl greifen bei weiterem Öffnen auf dieselben Daten zurück.

**Hauptformel:** x̄ = Σᵢ₌₁ⁿ xᵢ / n.

**Experiment:** Einzelwerte verändern, Mittelwertmarkierung beobachten. Die Idee des gleichmäßigen Verteilens erklärt die Rechnung. Gleiche Werte oder ein Wert von 0 zählen weiterhin als Beobachtungen. „Anzahl“ heißt im univariaten Kontext Anzahl der verwendeten Werte.

**Bedingungen und Vertiefung:** Mindestens ein Wert; interpretierbare Abstände der Messwerte. Die Messannahme wird erläutert, nicht automatisch aus Zahlen diagnostiziert. Ausreißerempfindlichkeit wird durch Veränderung eines Wertes erfahrbar.

### 6.2 Streuung

**Erste Ansicht:** Standardabweichung, Varianz und Quadratwurzel. Die nächste Ebene der Varianz zeigt Quadratsumme, Freiheitsgrade und Division.

Der weitere Bauplan verzweigt:

- Abweichung = Einzelwert − Mittelwert.
- Quadrierte Abweichung = Abweichung².
- Quadratsumme = Summe aller quadrierten Abweichungen.
- Varianz = Quadratsumme / (n − 1).
- Standardabweichung = Quadratwurzel der Varianz.

Die Freiheitsgrade bilden einen eigenen Eingang zur Division; sie entstehen nicht aus der Quadratsumme.

**Hauptformeln:** sₓ = √sₓ² und beim Öffnen der Varianz sₓ² = Σᵢ₌₁ⁿ(xᵢ − x̄)² / (n − 1).

**Experiment:** Eine Zahlengerade zeigt Werte und Mittelwert. Die Auswahl macht die gerichtete Abweichung sichtbar. Beim Quadrieren wird deren quadratische Gewichtung dargestellt. Später kann ein gesteuertes Auseinanderziehen um denselben Mittelwert die Streuung verändern, ohne gleichzeitig die Lage zu verändern.

**Bedingungen und Vertiefung:** Für die korrigierte Stichprobenvarianz gilt n ≥ 2. Eine konstante Reihe hat Varianz und Standardabweichung 0; beide sind dann definiert. „Warum n − 1?“ erklärt die Bindung der Abweichungen durch den geschätzten Mittelwert. Die Aussage über unverzerrte Schätzung und ihre Stichprobenannahmen folgt als eigene Vertiefung. Die Standardabweichung wird nicht als durchschnittlicher absoluter Abstand bezeichnet.

### 6.3 z-Standardisierung

**Erste Ansicht:** z-Wert, zentrierter Wert, Standardabweichung und Skalierung durch Division. Die Bedingung sₓ > 0 ist angeheftet und erklärbar.

**Hauptformel:** zₓᵢ = (xᵢ − x̄) / sₓ.

Die Zentrierung und die Standardabweichung sind zwei Eingänge. Erst wird der Mittelwert abgezogen, danach wird die entstandene Abweichung durch die Standardabweichung geteilt. Die Streuung kann aus der ursprünglichen Reihe berechnet werden; Zentrieren verändert sie nicht.

**Experiment:** Zwei gekoppelte Zahlengeraden zeigen ursprüngliche Werte und z-Werte. Derselbe Fall bleibt ausgewählt. Die Zwischenstufe der Zentrierung kann eingeblendet werden. Anfangs genügt das Ändern eines Einzelwerts; gemeinsame Verschiebung und positive Skalierung eignen sich als spätere, gezielte Versuche.

**Bedingungen und Vertiefung:** Bei der gewählten Konvention gelten n ≥ 2 und sₓ > 0. Bei konstanter X-Reihe ist zₓ nicht definiert, auch wenn Y streut. Für zₓ wird keine positive Streuung von Y verlangt. Standardisieren erzeugt keine Normalverteilung und liefert ohne weitere Annahmen keine Prozentposition.

### 6.4 Pearson-Korrelation

**Erste Ansicht:** Pearson-r, Kovarianz, Produkt der Standardabweichungen und Division. Beim Öffnen des Produkts erscheinen sₓ und sᵧ als klar benannte Verwendungen desselben Konzepts.

**Hauptformel:** r = sₓᵧ / (sₓ · sᵧ).

Der Kovarianzzweig führt über die Summe der Abweichungsprodukte zum Produkt der X- und Y-Abweichung desselben Falls. Beide Variablen benötigen ihren eigenen Mittelwert und ihre eigene Streuung; die Fallzuordnung bleibt gemeinsam.

**Alternative:** „Über z-Werte rechnen“ zeigt r = Σᵢ₌₁ⁿ(zₓᵢzᵧᵢ)/(n − 1). Die aktive Formel und ihr Bauplan wechseln zusammen. Daten und Ergebnis bleiben identisch. Ein Rückweg zur Kovarianz ist sichtbar. Ein gleichzeitiger Vergleich beider Formeln ist eine Vertiefung, kein zweiter dauerhafter Bauplan.

**Experiment:** Streudiagramm mit verschiebbaren Punkten und Zahlenfeldern. Bei Auswahl eines Falls erscheinen die beiden Abweichungen von den Mittelwertlinien und ihr Produkt. Gleiche Vorzeichen tragen positiv, unterschiedliche negativ bei; eine Abweichung von 0 ergibt einen Beitrag von 0. Gezielte Beispieldaten können später positive, negative und gekrümmte Muster zeigen.

**Bedingungen und Vertiefung:** Vollständige zusammengehörige Paare, n ≥ 2 und positive Streuung beider Reihen. Linearität ist eine Frage der Interpretation, keine Bedingung dafür, einen Zahlenwert zu berechnen. Normalverteilung ist für die deskriptive Berechnung nicht erforderlich. r nahe 0 schließt einen nichtlinearen Zusammenhang nicht aus; Korrelation belegt keine Kausalität. Bei zwei nichtkonstanten Paaren ist r zwangsläufig ±1 und daher kein überzeugender Beleg für ein allgemeines Muster.

## 7. Behandlung sämtlicher 29 Konzepte

| ID | Sichtbarer Begriff | Formale Ebene und zentrale Verknüpfung | Passende Anschauung |
|---|---|---|---|
| `series` | Datenreihe | (x₁; …; xₙ); Zeichen zu Fall und Variable | Werte und ihre Beobachtungen |
| `pairs` | Zusammengehörige Wertepaare | (xᵢ; yᵢ); gleicher Index, gleicher Fall | Tabellenzeile und Punkt gemeinsam markieren |
| `metric` | Metrisches Skalenniveau | Interpretierbare Abstände; keine künstliche Formel | Messwerte und bloße Kategorienummern unterscheiden |
| `count` | Zählen | Zählfolge bis n | Jeden Fall einmal berücksichtigen |
| `add` | Addieren | a + b; alternativ die tatsächlich verwendete wiederholte Addition | Tatsächliche Summanden der aktuellen Rechnung |
| `subtract` | Subtrahieren | a − b; Operandenrollen benennen | Gerichteter Abstand, Vorzeichen erhalten |
| `multiply` | Multiplizieren | a · b; aktuelle Faktoren | Vorzeichen der Abweichungsprodukte |
| `divide` | Teilen | a / b, b ≠ 0; aktuelle Eingänge benennen | Zähler, Nenner und Ergebnis verbinden |
| `square` | Quadrieren | a² = a · a | Gleiche Beträge mit verschiedenen Vorzeichen ergeben dasselbe Quadrat |
| `sqrt` | Quadratwurzel | √a, a ≥ 0 | Von der quadrierten zur ursprünglichen Einheit |
| `validn` | Anzahl der verwendeten Werte / Wertepaare | n; Benennung passend zum Kontext | Gültige Beobachtungen zählen; keine Zahl der verschiedenen Ausprägungen |
| `sum` | Summe | Σᵢ₌₁ⁿxᵢ | Alle Einzelwerte zusammenfassen |
| `mean` | Mittelwert · arithmetisches Mittel | x̄ = Σxᵢ/n | Gesamtmenge gleichmäßig verteilen |
| `deviation` | Abweichung vom Mittelwert | dᵢ = xᵢ − x̄ | Ein Fall, gerichteter Abstand |
| `squared_deviation` | Quadrierte Abweichung | dᵢ² = (xᵢ − x̄)² | Quadratische Gewichtung eines Falls |
| `ss` | Quadratsumme der Abweichungen | SSₓ = Σdᵢ² | Alle quadratischen Beiträge zusammen |
| `df` | Freiheitsgrade | df = n − 1 | Die letzte Abweichung ist durch die übrigen festgelegt |
| `variance` | Varianz · korrigierte Stichprobenvarianz | sₓ² = SSₓ/(n − 1) | Zwei Eingänge und quadrierte Einheit |
| `sd` | Standardabweichung | sₓ = √sₓ²; X/Y-Bezug erhalten | Streuung in der ursprünglichen Einheit |
| `centering` | Zentrieren | xᶜᵢ = xᵢ − x̄ | Ganze Reihe verschieben; Abstände bleiben gleich |
| `scaling` | Skalieren | uᵢ/a, a > 0; uᵢ passend zum Rechenweg belegen | Einen gemeinsamen Maßstab verwenden |
| `positive_sd` | Voraussetzung: Die Werte streuen | sₓ > 0; bei Pearson zusätzlich sᵧ > 0 | Konstante Reihe und Folgen für Division |
| `z` | z-Standardisierung | zₓᵢ = (xᵢ − x̄)/sₓ | Derselbe Fall in ursprünglicher und standardisierter Reihe |
| `crossproduct` | Abweichungsprodukt | pᵢ = (xᵢ − x̄)(yᵢ − ȳ) | Zwei Abweichungen desselben Falls |
| `crossproduct_sum` | Summe der Abweichungsprodukte | SPₓᵧ = Σpᵢ | Positive und negative Beiträge addieren |
| `covariance` | Kovarianz · Stichprobenkovarianz | sₓᵧ = SPₓᵧ/(n − 1) | Gemeinsame Streuung mit Einheitenbezug |
| `sd_product` | Produkt der Standardabweichungen | sₓ · sᵧ | Zwei variable Streuungsmaßstäbe |
| `linear` | Linearer Zusammenhang | Form und Interpretation; keine erzwungene neue Regressionsformel | Gerade und gekrümmtes Muster vergleichen |
| `pearson` | Pearson-Korrelation | Kovarianzweg oder äquivalenter z-Weg | Punkte, Abweichungsprodukte und r koppeln |

Addition, Quadrieren und andere Operationen können wiederholt verwendet werden. Ihr lokales Zahlenbeispiel muss den gerade betrachteten Rechenschritt zeigen. Eine Summe von Abweichungsprodukten darf beim Öffnen von „Addieren“ nicht plötzlich zu einer Summe der ursprünglichen X-Werte werden.

## 8. Bedingungen, Interpretation und Rechenwege

Die bisherigen Beziehungsarten werden inhaltlich präzisiert:

| Rolle | Darstellung | Verhalten |
|---|---|---|
| Recheneingang | Verbundener Baustein mit Wert und Bezeichnung | Wird für den aktiven Rechenweg verwendet |
| Operation | Kompaktes Element an den passenden Eingängen | Erklärt die tatsächlich ausgeführte Operation |
| Berechnungsbedingung | Kurzer Hinweis direkt am Verfahren | Wird anhand der Daten geprüft, z. B. sₓ > 0 |
| Messannahme oder Interpretation | Erklärbarer fachlicher Hinweis | Wird nicht allein aus Zahlen automatisch bestätigt |
| Alternativer Rechenweg | Benannte Auswahl am betreffenden Verfahren | Wechselt Formel und Bauplan gemeinsam |

Die positive Standardabweichung bleibt als eigener Begriff erreichbar, auch wenn sie zunächst als Bedingung erscheint. „Linearer Zusammenhang“ gehört zur Interpretation. Der alternative z-Weg ist ein vollständiger Rechenweg und keine Sammlung zusätzlicher Pflichtzutaten.

Bei nicht erfüllten Bedingungen bleiben Formel und sinnvoll berechenbare Zwischenwerte sichtbar. Beispiel: Alle X-Werte sind gleich → Mittelwert ist definiert, Varianz und Standardabweichung sind 0; zₓ und Pearson-r sind nicht definiert. Der Hinweis nennt die konkrete Ursache, nicht nur einen allgemeinen Fehlerstatus.

## 9. Daten und Experimente

Für die erste vollständige Fassung bleibt eine gemeinsame kleine Tabelle die Quelle aller Rechnungen. Die fünf vollständigen Paare können als fiktive Lernzeiten und gelöste Aufgaben bezeichnet werden. Univariate Einstiege zeigen vorwiegend X; beim Zusammenhang kommt Y hinzu. Die Beschriftung erklärt, dass die gemeinsame Fallauswahl eine Entscheidung dieses Beispiels ist. Ein Mittelwert benötigt grundsätzlich keine zweite Variable.

Die bestehende Berechnungsbasis mit vollständigen Paaren bleibt zunächst konsistent. Fehlende Daten und unterschiedliche fallweise Ausschlüsse werden nicht nebenbei eingeführt. Falls das später gewünscht ist, braucht es eine ausdrückliche Regel für die Datengrundlage jeder Rechnung.

Alle Experimentansichten verwenden dieselbe Fallidentität. Änderungen werden sofort übernommen, und zuletzt gültige Werte bleiben bei unvollständigen Eingaben mit sichtbarem Hinweis wirksam. Ein Wechsel des Einstiegs setzt die Daten nicht zurück. Beispielwechsel sind eigene, klar benannte Handlungen.

Nicht jeder Begriff braucht eine neue Simulation. Fünf wiederverwendbare Darstellungen genügen als Grundlage:

1. Werte und Mittelwert auf einer gemeinsamen Skala.
2. Gerichtete und quadrierte Abweichungen.
3. Ursprüngliche, zentrierte und standardisierte Werte.
4. Zusammengehörige Paare im Streudiagramm mit Abweichungsprodukten.
5. Einzelbeiträge und ihre Summe.

Direkte Eingaben und zugängliche Zahlenfelder gehören zur ersten Fassung. Zusätzliche Beispielmuster, gesteuerte Transformationen und Lernaufträge folgen gezielt, nachdem die Grundbedienung geprüft ist. Wertebereiche stammen aus dem gewählten Beispiel; die Begriffslogik übernimmt keine pauschale Begrenzung auf 0 bis 12 Stunden.

## 10. Texte und spätere Gestaltung

Die Texte erhalten einen gemeinsamen Aufbau, aber keine mechanische Längenbegrenzung auf Kosten der Präzision. Ziel für den sichtbaren Einstieg sind zwei bis drei kurze Sätze. Ein neuer Fachbegriff wird unmittelbar erklärt oder über einen Baustein erreichbar gemacht.

Bevorzugte Formulierungen:

- „Was geht in die Rechnung ein?“ für Recheneingänge.
- „Das muss gelten“ für eine Berechnungsbedingung.
- „So ordnest du das Ergebnis ein“ für Interpretation.
- „Anderen Rechenweg ansehen“ für ein äquivalentes Verfahren.
- „Warum n − 1?“ für die Vertiefung zu Freiheitsgraden.

Fachbegriffe bleiben lesbar, etwa „Varianz · korrigierte Stichprobenvarianz“. Formeln stehen sichtbar bei den Verfahren. „Nicht definiert“ wird beibehalten und durch einen konkreten Grund ergänzt. Lehrtexte unterscheiden einzelne Beobachtungen, ganze Reihen und Schätzannahmen.

Die endgültige Gestaltung ist noch offen. Unabhängig von der späteren Palette benötigt sie gut lesbare Formeln, klar unterscheidbare Rollen und konsistente Hervorhebungen. Variable X/Y, Auswahl, Fehler und Beziehungstyp dürfen nicht widersprüchlich dieselbe Farbbedeutung erhalten. Text und Form ergänzen Farbe. Wesentliche Funktionen funktionieren ohne Hover, Animation respektiert reduzierte Bewegung, und mobil wird Inhalt umgeordnet statt verkleinert.

## 11. Konsequenzen für die vorhandene Umsetzung

Die React-/TypeScript-Anwendung und ihre unabhängigen Rechenfunktionen bieten eine passende Grundlage. Die Inline-Prototypen illustrieren die Zielbedienung; ihre fest angeordneten Mittelwert-Karten werden nicht als allgemeines Layoutmodell übernommen.

Konkrete Änderungen bei einer späteren Umsetzung:

1. **Konzeptdaten erweitern:** Titel, Einstiegserklärung, Formelstruktur, Interpretation, Voraussetzungen, Vertiefungsfrage und Experimentzuordnung werden getrennt gepflegt.
2. **Rechenwege beschreiben:** Das Begriffsnetz bleibt erhalten. Ergänzende Baupläne ordnen konkrete Eingänge, Operationsrollen und alternative Wege zu.
3. **Formeln strukturiert darstellen:** Ein gemeinsamer Renderer stellt Brüche, Potenzen, Indizes und Summen dar. Referenzen tragen Variablen- und Verwendungskontext; die Zahlenbeispiele werden aus demselben Rechenzustand erzeugt.
4. **Werte kontextabhängig lesen:** `readingFor` benötigt statt der festen X-Perspektive einen expliziten Bezug auf Variable, Fall und Eingangswerte einer Operation.
5. **Navigation bündeln:** Auswahl, geöffnete Zweige, Rechenweg, Variablenbezug und Verlauf werden zusammenhängend verwaltet. Dateneingaben bleiben davon getrennt.
6. **Lokales Layout stabilisieren:** Die ausgewählte Karte wird beim Öffnen verankert; vorhandene Teilbäume werden möglichst erhalten. Der automatische globale `fitView` nach jeder Strukturänderung entfällt.
7. **Experimente integrieren:** Die gemeinsame Datentabelle bleibt die Quelle; kleine kontextbezogene Ansichten ersetzen den notwendigen Wechsel zwischen „Verstehen“ und „Ausprobieren“.

Im vorhandenen Code sind besonders zu beachten:

- In `App.tsx` verweisen sₓ und sᵧ derzeit beide auf dieselbe ID `sd`; der Variablenkontext fehlt.
- `readings.ts` berechnet univariate Anzeigen grundsätzlich für X.
- `selectConcept` aktiviert beim Öffnen eines verdeckten Formelziels pauschal `alternatives`, auch bei gewöhnlichen Voraussetzungen.
- `scaling` zeigt derzeit xᵢ/sₓ. Der z-Weg benötigt dagegen die Skalierung der zentrierten Eingänge.
- `positive_sd` prüft als Anzeige beide Reihen, obwohl zₓ nur die Bedingung für X benötigt.
- `optional` umfasst sowohl den alternativen z-Weg als auch die lineare Interpretation. Diese Rollen sollten getrennt werden.

## 12. Umsetzungsfolge und Abnahmekriterien

### Empfohlene Reihenfolge

1. **Gemeinsame Grundlage und Mittelwert:** Begriffe und Verwendungen trennen, Formelverweise und Verlauf implementieren, Datenkontext festlegen, akzeptierte Mittelwertbedienung in die Anwendung übertragen.
2. **Streuung:** Den ersten tieferen, verzweigten Bauplan mit Einheiten, Freiheitsgraden und Wiederverwendung umsetzen. Hier zeigt sich, ob die Layout- und Formelstruktur trägt.
3. **z-Standardisierung:** Transformationseingänge und gekoppelte Reihen ergänzen; Bedingungen kontextbezogen prüfen.
4. **Pearson:** X/Y-Verwendungen, Paarzuordnung und zwei vollständige Rechenwege hinzufügen.
5. **Gesamtprüfung und Gestaltung:** Alle 29 Konzepte, Mobilbedienung, längere Texte, Tastatur und den visuellen Stil gemeinsam prüfen; zusätzliche Lernaufträge erst danach ausbauen.

### Fachliche und funktionale Abnahme

- Alle 29 Begriffe sind erreichbar und behalten ihre fachliche Bedeutung.
- Jeder Formelverweis öffnet den richtigen Begriff mit richtiger Variable und richtigen Eingängen.
- Gemeinsam benötigte Größen bleiben beim Zuklappen anderer Zweige erhalten.
- Beide Pearson-Rechenwege liefern für dieselben gültigen Daten dasselbe Ergebnis innerhalb numerischer Toleranz.
- Die Reihe aus fünf konstanten X-Werten zeigt Mittelwert, Varianz 0 und Standardabweichung 0, aber keine definierten zₓ- oder r-Werte.
- Ist nur Y konstant, bleibt zₓ bei streuendem X definiert; Pearson ist nicht definiert.
- Eine reine Verschiebung aller X-Werte lässt die Streuung, zₓ und r unverändert, sofern die jeweiligen Größen definiert sind.
- Vorzeichenwechsel eines Merkmals kehrt bei definierten Größen das Vorzeichen von r um.
- Zurück navigiert durch Ansichten, ohne Eingaben zu verlieren.
- Zahlenbeispiel und Diagramm bleiben beim Variablen- und Fallwechsel synchron.
- Mobil und per Tastatur sind die gleichen fachlichen Inhalte erreichbar; wesentliche Texte werden nicht abgeschnitten.

### Prüfung mit Studierenden

Zunächst wenige kurze Aufgaben ohne Einführung in die Oberfläche: den Nenner im Mittelwert erklären; n − 1 bei der Varianz finden; einen negativen z-Wert interpretieren; die Standardabweichung von Y aus Pearson öffnen; eine konstante Reihe erklären; den alternativen Pearson-Weg aufrufen.

Beobachtet werden insbesondere Orientierung nach einem Formelverweis, Rückweg zum Ausgangsverfahren, Verständnis der Eingänge und die Interpretation der veränderten Daten. Gestaltungshypothesen werden daran überprüft, nicht allein an der Zahl der Klicks.

## 13. Bereits recherchierte Anregungen

- [Seeing Theory – Regression Analysis](https://seeing-theory.brown.edu/regression-analysis/): Verbindung von bewegbaren Datenpunkten und auswählbaren Ergebnisgrößen.
- [Polypad](https://mathigon.org/polypad/7jyvbdys1jkrq): mathematische Objekte und Operationen als bearbeitbare Elemente.
- [Explorable Explanations](https://worrydream.com/ExplorableExplanations/): veränderbare Beispiele innerhalb einer verständlichen Erklärung.
- [Implicit scaffolding in interactive simulations](https://arxiv.org/abs/1306.6544): Gestaltung von Handlungsmöglichkeiten, Hinweisen und Rückmeldungen für selbstständiges Erkunden.

Die Übertragung auf den Statistikatlas ist eine Gestaltungsentscheidung. Ihre Wirkung auf die konkrete Zielgruppe wird mit Studierenden geprüft.
