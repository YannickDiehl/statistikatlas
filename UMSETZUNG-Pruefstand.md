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
