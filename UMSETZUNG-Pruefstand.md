# Aktueller Prüfstand · Explorationsprototyp

11. September 2026: Alternative Ansicht unter `?ansicht=prototyp` mit fester Geografie, semantischem Zoom, priorisierten Beschriftungen, abgestuften Hoverpfaden und kompakter Erklärung. Zwei Frage-Einstiege erschließen vorhandene Rechenwege; Anwendungen sind bei dicht vernetzten Begriffen nach Themen aufklappbar. Die bisherige Ansicht bleibt unter der Hauptadresse erhalten.

78 automatisierte Tests bestehen. Produktionsbuild und beide Offline-Fassungen bestehen. Keine Browser-Interaktions- oder visuelle Geräteprüfung. Einzelheiten und Grenzen: [PROTOTYP-EXPLORATION.md](PROTOTYP-EXPLORATION.md).

---

# Früherer Prüfstand · Grundlagen und Ergebnisdeutung

10. September 2026: 55 neue Grundlagen mit verknüpften Formeln, Quellen und interaktiven Experimenten. Insgesamt 159 Bausteine, 486 Verbindungen und zwölf transparente Themenbereiche. Alle 80 öffentlichen mariposa-Exporte bleiben erschlossen. Vollständige neue Abdeckung: [GRUNDLAGEN-ABDECKUNG.md](GRUNDLAGEN-ABDECKUNG.md).

143 direkte Einordnungsverbindungen verbinden Verfahren mit der Deutung ihrer Ergebnisse. Sie bleiben außerhalb der rekursiven Rechenvoraussetzungen. Fisher-p-Werte sind als Ergebnis, nicht als Recheneingang verknüpft. Effektgrößen, Intervalle und Varianten folgen den tatsächlich berichteten mariposa-Ausgaben. Beim Ausflug in eine Grundlage bleiben Spalten, Rangbasis, Route und die gewählte Verfahrensvariante für die Rückkehr erhalten; Hover verwendet dieselbe erinnerte Variante.

71 automatisierte Tests bestehen. Die neuen numerischen Prüfungen vergleichen 85 Dichte-/Masse-/CDF-Punkte und 99 Quantile über acht Verteilungsfamilien sowie 74 Normaltest-Power-Fälle mit unabhängigen R-4.5.3-Referenzen. Zusätzlich geprüft: diskrete Grenzen, reproduzierbare Stichproben, OLS, Rotationsinvarianz, Überanpassung, bekannte Formelziele und azyklische Voraussetzungen, direkte Einordnungsbezüge, 159 kollisionsfreie Positionen und serverseitiges Rendern aller 55 Experimente mit endlichen SVG-Koordinaten. TypeScript sowie Produktions- und Offline-Build bestehen.

Die bisherigen mariposa-R-Aufrufe und der Datensatz wurden nicht geändert; ihre vorherige Ausführungsprüfung bleibt unten dokumentiert. Keine Browser-Interaktionsprüfung, visuelle Geräteprüfung oder Erprobung mit Studierenden in diesem Umsetzungslauf.

---

# Früherer Prüfstand · durchlässige Karte und Gravitation

10. September 2026: Transparente Themenellipsen mit freien, anklickbaren Überschriften; leicht gelockerte Grundanordnung der neuen Themen. Alle 104 Felder und Verbindungen bleiben erhalten. Bereichszoom passt auch auf schmalen Bildschirmen zum tatsächlichen Ausschnitt.

Optionale Gravitation um den ausgewählten Baustein: aktive direkte Bezüge, mit Voraussetzungsspur auch rekursive Voraussetzungen. Alternative Rechenwege ziehen keine Knoten an; Welch-ANOVA zieht die klassischen Tukey-/Scheffé-Anschlüsse nicht heran. Anker, Layout und Kamera bleiben bei Vorwärts/Zurück, Pfadverlauf und schnellen Klicks nachvollziehbar. Ein Klick setzt die Anordnung zurück. Hover löst keine Layoutberechnung aus. Die Bewegung endet nach 420 ms und berücksichtigt die Systemeinstellung für reduzierte Bewegung.

61 Tests bestehen, einschließlich deterministischer, überlappungsfreier Endpositionen, tatsächlicher Annäherung entfernter Bezüge, Rechenwegvarianten, Verlauf und Anker während einer laufenden Bewegung. TypeScript sowie Produktions- und Offline-Build bestehen. Quelltextprüfung berücksichtigt außerdem den Abbruch vorheriger Kamerafahrten bei schneller Neuauswahl. Während der lokalen Strukturänderung meldete Hot Reload kurzzeitig ungültige alte Bereichsdaten und ResizeObserver-Hinweise; Bereichsmaße sind nun explizit, die Flächen folgen dem fertigen Layout statt jedem Animationsbild, und die Überschrift besitzt einen gültigen Fallback für alte Hot-Reload-Daten. Keine Browser-Interaktionsprüfung oder visuelle Geräteprüfung. R-Aufrufe und Lehrdaten bleiben auf dem zuvor geprüften Stand.

Der folgende Prüfstand dokumentiert die vorausgehende mariposa-Erweiterung:

---

# Aktueller Prüfstand · mariposa-Erweiterung

10. September 2026: 80 öffentliche Funktionen, 104 Bausteine, acht Kartenbereiche, 200 synthetische Befragte mit 28 Variablen. Vollständige Zuordnung und Prüfergebnisse: [MARIPOSA-ABDECKUNG.md](MARIPOSA-ABDECKUNG.md).

55 Tests bestehen; TypeScript und Produktions-/Offline-Build bestehen. 110 auswählbare R-Varianten plus zusätzlicher Rangkontext wurden geprüft: 109 erfolgreich ausgeführt, zwei externe Importaufrufe syntaktisch geprüft. Keine Browser-Interaktionsprüfung. Optionale WebMCP-Verträge im Testkontext geprüft; reale Browserunterstützung nicht geprüft.

Der folgende frühere Prüfstand dokumentiert den Ausbau vor mariposa:

---

# Umsetzung und Prüfstand

10. September 2026 · Anklickbare Netzkarte, eingehende Hoverpfade und synthetischer Lehrdatensatz.

## Enthalten

36 Begriffe mit 70 Grundbeziehungen. Ganze Kartenflächen erhalten Pointer-Ereignisse und liegen über den Kanten. Hover und Tastaturfokus verfolgen ausschließlich die vollständigen eingehenden Pfade im jeweiligen Rohwert-, z- oder Rangkontext.

200 reproduzierbare synthetische Befragte, 16 Spalten plus ID, Codebuch, zulässige Werte, passende X/Y-Auswahl, sichtbare Likert-Annahme, Datensatzdialog mit Pagination und CSV. Keine echten Befragten oder fehlenden Antworten. Datenänderungen sind von der Navigation getrennt und erhalten alle übrigen Spalten.

Häufigkeiten, Median, mittlere Ränge, Spearman und Kreuztabellen ergänzen die bisherigen Verfahren. Lange Rechnungen sind kompakt; Verteilungen und Streudiagramme bleiben bei 200 Fällen bedienbar. Bedingungs- und Formelverweise erhalten Variable, Verwendung und Rangkontext.

## Automatisiert geprüft

47 Tests: bestehende numerische Referenzen und Randfälle sowie neue Prüfungen für den vollständigen Datensatz, Werteskalen und Antwortkategorien, Auswahlregeln, Zelländerungen ohne Datenverlust, dynamische Einheiten, Likert-Annahmen, Spearman mit Gleichständen, Rangkontext in Formeln und Bedingungen, ordinale Medianpaare, metrische Mediane, Histogrammsummen und Kreuztabellenränder, kompakte Rechnungen mit 200 Fällen, vollständige eingehende Hoverpfade und React Flows Pointer-Hit-Testing bei deaktivierter Auswahl/Bewegung.

Alle 36 Inspector-Ansichten und zugehörigen Survey-Experimente werden serverseitig mit passenden Spalten gerendert. Keine NaN-/Infinity-Ausgabe oder negativen SVG-Breiten. TypeScript und Produktionsbuild inklusive selbstständigem Offline-Export gehören zum Abschluss.

## Durch Quelltextprüfung korrigiert

React Flow unterdrückte Mausereignisse des Knoten-Wrappers; Kanten lagen über Karten. Außerdem: doppelte X/Y-Zuordnungen mit überschriebenen Änderungen, Escape schloss zwei UI-Ebenen, ungültige Eingabeentwürfe wanderten zur nächsten Person, Rangbasis ging in Bedingungs- und z-Verweisen verloren, Y-Häufigkeiten verlinkten X, Y-Ränge zeigten das X-Zeichen, Haushaltsmittelwerte wurden als persönlicher Betrag formuliert und die numerische Mediananzeige verwendete ein falsches Rechenzeichen.

## Grenzen der Prüfung

Keine automatisierten Browserklicks, Screenshots oder Nutzertests in diesem Umsetzungslauf. Serverseitiges Rendern und Quelltextprüfung ersetzen keine Erprobung auf realen Geräten oder mit Screenreader. Frühere Browserartefakte gehören zu älteren Oberflächen. Die Kursinhalte außerhalb dieses Atlas-Ausschnitts bleiben unverändert.
