import type {LearningTask} from './learningTasks';
export const taskContent:Record<number,LearningTask[]>={
  "1": [
    {
      "title": "Eine politische Frage in Bausteine übersetzen",
      "minutes": 20,
      "instructions": [
        "Öffne die drei verlinkten Atlas-Begriffe. Notiere zu jedem in einem Satz, welche Rolle er bei einer Befragung zum politischen Interesse spielt.",
        "Vergleiche die Fragen „Welche politische Haltung ist richtig?“ und „Wie verteilt sich politisches Interesse unter den Befragten?“. Entscheide, welche davon die vorhandenen Antworten untersuchen können.",
        "Formuliere eine eigene beschreibende Frage. Benenne ausdrücklich die betrachteten Menschen, den Zeitraum und das Merkmal; vermeide zunächst Aussagen über Ursachen."
      ],
      "atlas": [
        {
          "id": "operationalization",
          "prompt": "Wie wird aus dem abstrakten Begriff politisches Interesse eine beobachtbare Antwort?"
        },
        {
          "id": "series",
          "prompt": "Wofür steht ein einzelner Eintrag in einer Reihe politischer Antworten?"
        },
        {
          "id": "sampling",
          "prompt": "Warum sind die Befragten und die Bevölkerung nicht einfach dasselbe?"
        }
      ],
      "responsePrompt": "Schreibe deine Frage auf und ergänze: „Ich beobachte …; ich möchte etwas über … wissen; dafür benötige ich …“.",
      "hints": [
        "Eine untersuchbare Frage verlangt Antworten, die im Datensatz tatsächlich erfasst wurden.",
        "„Wie verteilt sich das berichtete politische Interesse unter den ALLBUScompact-Befragten 2023?“ ist ein möglicher Anfang. Ein Schluss auf die Bevölkerung benötigt weitere Begründungen."
      ],
      "solution": "Eine passende Antwort benennt Fälle, Zeitpunkt und gemessenes Merkmal. Beispiel: Wir beschreiben das selbstberichtete politische Interesse der Befragten 2023. Die Antwortkategorien sind die Operationalisierung, die Personen sind die Fälle und ihre Antworten bilden eine Datenreihe. Die Befragung entscheidet nicht, welche Haltung richtig ist; Aussagen über eine größere Bevölkerung verlangen ein passendes Erhebungsdesign.",
      "checks": [
        "Meine Frage lässt sich mit beobachtbaren Angaben beantworten und enthält kein Urteil darüber, welche Haltung richtig ist.",
        "Ich unterscheide die tatsächlich Befragten von der Zielgruppe, über die ich später möglicherweise etwas aussagen möchte."
      ]
    },
    {
      "title": "Den ersten politischen Datensatz in R lesen",
      "minutes": 25,
      "instructions": [
        "Öffne das vorbereitete Sitzungsskript in RStudio und speichere eine eigene Kopie. Führe zuerst den Startteil aus und wähle die heruntergeladene ALLBUScompact-Datei.",
        "Führe die vorbereitete Codebuchzeile mit summary(codebook(...)) und danach find_var(allbus, \"POLIT\") aus. Suche pa02a und pa01 in der ausführlichen Ausgabe; lies Fragetext und Antwortmöglichkeiten im verlinkten GESIS-Codebuch nach.",
        "Öffne allbus in der Tabellenansicht von RStudio. Wähle eine sichtbare Zelle einer der beiden Variablen und beschreibe Zeile, Spalte und Antwort; prüfe die Bedeutung anhand des Codebuchs."
      ],
      "atlas": [
        {
          "id": "data_import",
          "prompt": "Was entsteht in R, wenn eine Befragungsdatei eingelesen wird?"
        },
        {
          "id": "codebook",
          "prompt": "Welche Informationen brauchst du zusätzlich zum kurzen Variablennamen?"
        },
        {
          "id": "series",
          "prompt": "Wie unterscheiden sich eine Tabellenzelle und die gesamte Spalte?"
        }
      ],
      "responsePrompt": "Dokumentiere für pa02a und pa01 jeweils Variablenname, gemessenes Merkmal und eine geprüfte Antwortkategorie. Beschreibe außerdem eine Tabellenzelle ohne identifizierende Angaben.",
      "hints": [
        "Führe in RStudio nur die markierte Zeile aus. Das Objekt allbus sollte nach dem Import im Environment erscheinen.",
        "pa02a bezeichnet politisches Interesse, pa01 die Links-Rechts-Selbsteinstufung. Die genaue Bedeutung eines Zahlenwertes liest du aus dem Codebuch, nicht aus der Position der Tabellenzeile."
      ],
      "solution": "Erwartet wird eine nachvollziehbare Zuordnung: Eine Zeile steht für einen befragten Fall, eine Spalte für eine Variable und eine Zelle für die Angabe dieses Falls. pa02a erfasst das politische Interesse, pa01 die Links-Rechts-Selbsteinstufung. Die konkrete Zelle und die Anzahl der Fälle werden aus der eigenen Datei dokumentiert; dafür gibt es keine hier vorgegebene Ergebniszahl.",
      "checks": [
        "Mein gespeichertes Skript lässt sich bis zur Codebuchausgabe ausführen.",
        "Ich kann Fall, Variable und Antwort an einer echten Zelle meiner importierten Datei unterscheiden."
      ]
    },
    {
      "title": "Den eigenen Projektsteckbrief anlegen",
      "minutes": 20,
      "instructions": [
        "Übernimm deine politische Frage aus Aufgabe 1. Prüfe im Codebuch, ob das gesuchte Merkmal tatsächlich erhoben wurde; passe die Frage bei Bedarf an.",
        "Wähle eine Zielvariable und, falls ein Vergleich geplant ist, eine zweite Variable. Notiere für beide Fragetext, Antwortmöglichkeiten und Fundstelle im Codebuch.",
        "Schreibe einen kurzen Steckbrief mit Frage, Datensatz und Version, Zielgruppe, Zeitraum sowie den ausgewählten Variablen. Ergänze eine Aussage, die diese Daten allein nicht beantworten können."
      ],
      "atlas": [
        {
          "id": "operationalization",
          "prompt": "Wie gut passt der konkrete Fragetext zu deinem politischen Begriff?"
        },
        {
          "id": "codebook",
          "prompt": "Wo belegst du die Bedeutung deiner ausgewählten Variablen?"
        },
        {
          "id": "sampling",
          "prompt": "Welche Einschränkung ergibt sich daraus, wer befragt wurde?"
        }
      ],
      "responsePrompt": "Halte deinen Projektsteckbrief in fünf bis sieben Sätzen fest. Kennzeichne ungeklärte Punkte als offene Fragen.",
      "hints": [
        "Eine enge Frage ist für den Anfang geeigneter als „Was erklärt Politik?“. Du kannst zunächst nur eine Verteilung beschreiben.",
        "Als Vergleich ist beispielsweise politisches Interesse nach Region denkbar. Prüfe aber, ob du tatsächlich einen Regionalvergleich meinst und ob die Regionsvariable deine gewünschte Unterscheidung abbildet."
      ],
      "solution": "Ein guter Steckbrief verbindet eine begrenzte politische Frage mit tatsächlich vorhandenen Angaben. Er dokumentiert die Datenquelle und unterscheidet Beschreibung der Befragten von Bevölkerungsschlüssen. Als Grenze kann etwa genannt werden, dass eine Selbstauskunft beobachtet wird oder dass ein beobachteter Unterschied keine Ursache beweist. Eigene Fragen sind gleichwertig, wenn Variablen und Datengrundlage dazu passen.",
      "checks": [
        "Jede verwendete Variable ist im Codebuch belegt; ich habe keinen Variablencode geraten.",
        "Mein Steckbrief enthält eine konkrete Forschungsfrage und mindestens eine begründete Grenze."
      ]
    }
  ],
  "2": [
    {
      "title": "Zahlencodes in politische Antworten übersetzen",
      "minutes": 20,
      "instructions": [
        "Öffne Labels, geordnete und nominale Kategorien im Atlas. Erkläre für jeden Begriff, welche Information eine Zahl darin trägt.",
        "Lies pa02a, pa01 und eastwest im Codebuch nach. Notiere die Endpunkte der beiden Antwortskalen und die Bedeutung der Regionscodes.",
        "Prüfe die Aussagen „Eine größere Zahl bedeutet immer mehr“ und „Der Abstand zwischen zwei Zahlencodes hat immer eine Bedeutung“. Formuliere für beide ein Gegenbeispiel aus diesen Variablen."
      ],
      "atlas": [
        {
          "id": "labels",
          "prompt": "Was verrät ein Wertelabel, das die Zahl allein nicht erklärt?"
        },
        {
          "id": "ordinal",
          "prompt": "Welche Information enthält die Reihenfolge beim politischen Interesse?"
        },
        {
          "id": "nominal",
          "prompt": "Warum lässt sich aus den Regionscodes kein sinnvolles Mehr oder Weniger berechnen?"
        }
      ],
      "responsePrompt": "Schreibe für jede der drei Variablen einen Übersetzungssatz und ordne das Skalenniveau mit einer kurzen Begründung ein.",
      "hints": [
        "pa02a läuft von sehr starkem zu überhaupt keinem Interesse. Lies deshalb nicht nur die Zahlen, sondern beide Endpunkte.",
        "eastwest bezeichnet Kategorien; die Differenz 2 minus 1 ist kein politischer Abstand. Bei pa01 bedeutet die Reihenfolge links bis rechts; gleich große inhaltliche Abstände sind eine zusätzliche Annahme."
      ],
      "solution": "pa02a: 1 bedeutet sehr starkes, 5 überhaupt kein politisches Interesse; größere Werte stehen also für weniger Interesse. eastwest: 1 steht für West einschließlich West-Berlin, 2 für Ost einschließlich Ost-Berlin; die Codes sind nominal. pa01 ordnet die Selbsteinstufung von 1 links bis 10 rechts. Die geordnete Skala kann für bestimmte Rechnungen näherungsweise metrisch behandelt werden, aber die Kodierung beweist keine gleichen inhaltlichen Abstände.",
      "checks": [
        "Ich lese das politische Interesse in der richtigen Zahlenrichtung.",
        "Ich unterscheide die Ordnung von Kategorien von der zusätzlichen Annahme gleich großer Abstände."
      ]
    },
    {
      "title": "Gültige Antworten und fehlende Angaben prüfen",
      "minutes": 25,
      "instructions": [
        "Führe den Startteil und anschließend die vorbereiteten summary(frequency(...))- und na_frequencies-Zeilen aus. summary zeigt die ausführliche Tabelle. Halte fest, welche Variablen jeweils ausgewertet werden.",
        "Vergleiche die ausgewiesenen Kategorien mit dem Codebuch. Prüfe, ob die im Startteil behandelten Sondercodes bei pa02a und pa01 als fehlend und nicht als politische Antworten eingehen.",
        "Dokumentiere für pa02a die Gesamtzahl, die Zahl gültiger Antworten und die Zahl fehlender Angaben, soweit die Ausgabe sie ausweist. Falls dir eine Zahl fehlt, ermittle sie mit nrow(allbus), sum(!is.na(allbus$pa02a)) oder sum(is.na(allbus$pa02a))."
      ],
      "atlas": [
        {
          "id": "missing",
          "prompt": "Warum ist eine fehlende Angabe keine zusätzliche Interessenkategorie?"
        },
        {
          "id": "frequency",
          "prompt": "Welche Kategorien und welchen Nenner zählt deine Häufigkeitsausgabe?"
        },
        {
          "id": "labels",
          "prompt": "Wie kontrollierst du, dass die angezeigten Kategorien zum Codebuch passen?"
        }
      ],
      "responsePrompt": "Notiere deine tatsächlich beobachteten Fallzahlen und erkläre in zwei Sätzen, warum Sondercodes vor Mittelwerten und Anteilen geprüft werden müssen.",
      "hints": [
        "NA bezeichnet in R eine fehlende Angabe. is.na(...) prüft für jeden Eintrag, ob er fehlt; ein Ausrufezeichen kehrt diese Prüfung um.",
        "Bei einer einzelnen Variable gilt: gültige plus fehlende Angaben ergeben die Gesamtzahl. Ein Sondercode wie -9 darf nicht als besonders hohes oder niedriges politisches Interesse interpretiert werden."
      ],
      "solution": "Die konkreten Fallzahlen müssen aus der eigenen Datei stammen. Die Kontrollgleichung lautet Gesamtzahl = gültige + fehlende Angaben für dieselbe Variable und Fallauswahl. Sondercodes bezeichnen keine Position auf der politischen Skala. Würden sie wie reguläre Zahlen verarbeitet, könnten sie Kennwerte und Nenner verfälschen. Dass fehlende Angaben erkannt werden, erklärt noch nicht, warum sie fehlen.",
      "checks": [
        "Meine Fallzahlen beziehen sich auf dieselbe Variable und erfüllen die Kontrollgleichung.",
        "Ich habe die dokumentierten Sondercodes von regulären politischen Antwortkategorien getrennt."
      ]
    },
    {
      "title": "Ein verlässliches Variablenverzeichnis erstellen",
      "minutes": 20,
      "instructions": [
        "Nimm die Variablen deines Projektsteckbriefs. Übertrage Fragetext, gültige Werte, Wertelabels, fehlende Angaben und Skalenniveau in eine kleine Tabelle.",
        "Ergänze für jede Variable einen Satz zur Zahlenrichtung und ermittle ihre gültige Fallzahl. Wenn du weitere Variablen nutzt, prüfe deren eigene Sondercodes gesondert.",
        "Formuliere zwei konkrete Auswertungsregeln für dein Projekt: wie du fehlende Angaben behandelst und welche Interpretation die Kodierung erlaubt. Notiere offene Messfragen, statt sie stillschweigend zu entscheiden."
      ],
      "atlas": [
        {
          "id": "codebook",
          "prompt": "Welche Fundstelle belegt jede Zeile deines Variablenverzeichnisses?"
        },
        {
          "id": "missing",
          "prompt": "Welche Angaben werden bei deiner Auswertung nicht als gültige Antwort gezählt?"
        },
        {
          "id": "ordinal",
          "prompt": "Welche Vergleiche erlaubt die geordnete Antwortskala bereits, ohne gleiche Abstände anzunehmen?"
        }
      ],
      "responsePrompt": "Speichere dein Variablenverzeichnis und die zwei Auswertungsregeln. Füge eine noch ungeklärte Frage hinzu, falls nötig.",
      "hints": [
        "Kopiere Sondercodes nicht ungeprüft von pa02a auf eine andere Variable. Sie können sich zwischen Fragen unterscheiden.",
        "Eine mögliche Regel lautet: „Ich beschreibe zunächst gültige Antworten und berichte zusätzlich die Zahl fehlender Angaben.“ Eine metrische Näherung muss ausdrücklich begründet werden."
      ],
      "solution": "Erwartet wird ein Verzeichnis, aus dem eine andere Person die Angaben richtig lesen kann. Es enthält für jede Variable eigene Kodierungs- und Missing-Regeln. Die Zahl gültiger Antworten kann sich zwischen Variablen unterscheiden. Bei einer geordneten Skala ist die Rangfolge gesichert; Rechnungen mit Abständen benötigen eine zusätzliche inhaltliche Entscheidung.",
      "checks": [
        "Meine Angaben zur Kodierung und zu Sondercodes sind für jede Variable einzeln geprüft.",
        "Eine andere Person könnte anhand meines Verzeichnisses eine hohe Zahl und eine fehlende Angabe korrekt interpretieren."
      ]
    }
  ],
  "3": [
    {
      "title": "Mitte und Streuung im Atlas auseinanderhalten",
      "minutes": 20,
      "instructions": [
        "Öffne Mittelwert, Median und Standardabweichung. Formuliere für jeden Begriff eine Frage, die er über politische Selbsteinstufungen beantwortet.",
        "Vergleiche die erfundenen Gruppen A = 4, 5, 6 und B = 1, 5, 9. Bestimme die beiden Mittelwerte und beschreibe ohne weitere Rechnung die Streuung.",
        "Verfolge bei der Standardabweichung den Bezug zur Varianz und zur Mittelwertabweichung in der Erklärung. Erkläre, warum ein gleicher Mittelwert keine gleiche Verteilung bedeutet."
      ],
      "atlas": [
        {
          "id": "mean",
          "prompt": "Wie entsteht derselbe Mittelwert aus unterschiedlichen Antworten?"
        },
        {
          "id": "median",
          "prompt": "Welche Rolle spielt die Reihenfolge für die Mitte der Antworten?"
        },
        {
          "id": "sd",
          "prompt": "Welche zusätzliche Information liefert die Streuung um den Mittelwert?"
        }
      ],
      "responsePrompt": "Schreibe eine kurze Gegenüberstellung von A und B: gleiche Eigenschaft, unterschiedliche Eigenschaft und politische Interpretationsgrenze.",
      "hints": [
        "Beide Gruppen haben drei Antworten und dieselbe Summe 15.",
        "In B liegen zwei Antworten weiter von der Mitte 5 entfernt. Eine gemeinsame Mitte bedeutet daher nicht, dass die Befragten sich ähnlich einordnen."
      ],
      "solution": "Beide Gruppen haben Mittelwert 5 und Median 5. B streut stärker: Die äußeren Antworten liegen vier statt einen Skalenpunkt von der Mitte entfernt. Die gleiche Lage kann somit sehr verschiedene Antwortmuster zusammenfassen. Die Zahlen beschreiben Selbsteinstufungen; sie belegen weder identische politische Überzeugungen noch eine inhaltliche Einigkeit der Gruppen.",
      "checks": [
        "Ich kann Lage und Streuung an denselben Antworten getrennt erklären.",
        "Ich behaupte aus einem gemeinsamen Mittelwert nicht, dass beide Gruppen dieselbe Verteilung besitzen."
      ]
    },
    {
      "title": "Eine Antwort von 6 auf 10 verschieben",
      "minutes": 25,
      "instructions": [
        "Setze den vorhandenen Slider-Versuch zurück. Die fünf erfundenen Antworten lauten 2, 3, 4, 5, 6. Notiere Mittelwert, Median und Standardabweichung und sage voraus, was bei einer Änderung nur der fünften Antwort auf 10 passiert.",
        "Schiebe Person 5 auf 10. Vergleiche Vorhersage und Anzeige; klicke anschließend die Bestandteile der Mittelwertformel an und erkläre, warum die Summe steigt, n aber gleich bleibt.",
        "Setze den Versuch wieder zurück und führe danach den vorbereiteten R-Block für pa01 aus. Vergleiche die ausführliche Häufigkeitstabelle aus summary(frequency(...)) mit w_mean, w_median und w_sd: Was zeigt die Verteilung zusätzlich zu einer einzelnen Kennzahl?"
      ],
      "atlas": [
        {
          "id": "mean",
          "prompt": "Warum steigt der Mittelwert um 0,8, wenn eine von fünf Antworten um vier Punkte steigt?"
        },
        {
          "id": "median",
          "prompt": "Warum bleibt der Median bei genau dieser Veränderung gleich?"
        },
        {
          "id": "sd",
          "prompt": "Warum wächst die Streuung, obwohl weiterhin fünf Antworten vorliegen?"
        }
      ],
      "responsePrompt": "Halte deine Vorhersage, beide Dreiergruppen von Kennwerten und eine Erklärung der Veränderung fest. Ergänze einen Satz zu der tatsächlich beobachteten ALLBUS-Verteilung ohne Modell- und Realdaten zu vermischen.",
      "hints": [
        "Die ursprüngliche Summe ist 20; nach der Änderung beträgt sie 24. Die Zahl der Antworten bleibt fünf.",
        "Die mittlere der fünf geordneten Antworten ist weiterhin 4. Die Standardabweichung berücksichtigt dagegen die Abstände aller Antworten zum jeweils neuen Mittelwert."
      ],
      "solution": "Für 2, 3, 4, 5, 6 gilt: Mittelwert 4, Median 4, korrigierte Standardabweichung ungefähr 1,58. Für 2, 3, 4, 5, 10 gilt: Mittelwert 4,8, Median 4, Standardabweichung ungefähr 3,11. Nur eine Antwort wurde geändert; die Summe steigt um 4, die Anzahl bleibt 5. Diese Ergebnisse betreffen fünf erfundene Antworten. Die ALLBUS-Kennwerte müssen der eigenen R-Ausgabe entnommen werden; Mittelwert und SD verwenden dort die ausdrücklich erklärte metrische Näherung.",
      "checks": [
        "Ich erkläre sowohl den veränderten Mittelwert als auch den gleich gebliebenen Median anhand der fünf Antworten.",
        "Ich trenne die exakten Ergebnisse des Modellversuchs von meiner tatsächlichen ALLBUS-Auswertung."
      ]
    },
    {
      "title": "Eine politische Verteilung im eigenen Projekt beschreiben",
      "minutes": 20,
      "instructions": [
        "Wähle pa01 oder eine geprüfte geordnete beziehungsweise metrische Variable deines Projekts. Erzeuge eine Häufigkeitsübersicht und bestimme einen passenden Lagewert.",
        "Begründe, ob du zusätzlich Mittelwert und Standardabweichung berichten möchtest. Bei einer Antwortskala musst du die Annahme gleich großer Abstände nennen; bei nominalen Kategorien verwendest du diese Kennwerte nicht.",
        "Schreibe eine Beschreibung mit gültiger Fallzahl, auffälligen Antwortkategorien, Lage und gegebenenfalls Streuung. Ergänze, welche Information eine einzelne Kennzahl verbergen würde."
      ],
      "atlas": [
        {
          "id": "empirical_distribution",
          "prompt": "Welche Muster siehst du erst, wenn du die einzelnen Antwortkategorien betrachtest?"
        },
        {
          "id": "median",
          "prompt": "Was kannst du über die Mitte sagen, ohne gleiche Abstände vorauszusetzen?"
        },
        {
          "id": "metric",
          "prompt": "Welche zusätzliche Annahme benötigst du für Mittelwert und Standardabweichung deiner Skala?"
        }
      ],
      "responsePrompt": "Verfasse vier bis sechs Sätze zu deiner Verteilung. Verwende nur Kennwerte aus deiner eigenen Ausgabe und kennzeichne die metrische Näherung, falls du sie nutzt.",
      "hints": [
        "Beginne mit „Unter den gültigen Antworten …“. Dann ist deutlich, welche Fälle deine Beschreibung umfasst.",
        "Ein geeignetes Antwortgerüst lautet: „Die häufigen Kategorien sind …; die Mitte liegt bei …; die Antworten streuen …; dabei setze ich … voraus.“ Nicht jede Variable braucht alle Kennwerte."
      ],
      "solution": "Es gibt keine vorgegebene empirische Ergebniszahl. Erwartet wird eine zur Variable passende Beschreibung mit einer klaren Datenbasis. Bei pa01 können Häufigkeiten und Median die Ordnung abbilden; Mittelwert und Standardabweichung erfordern die hier verwendete Annahme gleicher Skalenabstände. Aus einer Verteilung unter Befragten folgt nicht automatisch eine gleichartige Verteilung in der Bevölkerung.",
      "checks": [
        "Meine Kennwerte passen zum Skalenniveau und stammen aus derselben dokumentierten Fallauswahl.",
        "Meine Beschreibung enthält mindestens einen Verteilungsaspekt, den der Mittelwert allein nicht zeigt."
      ]
    }
  ],
  "4": [
    {
      "title": "Den Nenner einer politischen Aussage finden",
      "minutes": 20,
      "instructions": [
        "Öffne Häufigkeiten, Kreuztabelle und bedingte Wahrscheinlichkeit. Finde in jeder Erklärung heraus, auf welche Gruppe sich eine relative Angabe bezieht.",
        "Vergleiche „30 % der stark Interessierten leben im Osten“ und „30 % der Befragten im Osten sind stark interessiert“. Notiere für beide getrennt die gezählten Fälle und die Bezugsgruppe.",
        "Zeichne eine leere Tabelle mit Region in den Zeilen und Interessenkategorien in den Spalten. Markiere, welche Randgesamtzahl zu Zeilenprozenten und welche zu Spaltenprozenten gehört."
      ],
      "atlas": [
        {
          "id": "frequency",
          "prompt": "Welche Anzahl wird durch welche Gesamtzahl geteilt?"
        },
        {
          "id": "crosstab",
          "prompt": "Was bezeichnet eine Zelle, was eine Zeilen- oder Spaltensumme?"
        },
        {
          "id": "conditional_probability",
          "prompt": "Warum beantwortet ein vertauschter Bezug eine andere Frage?"
        }
      ],
      "responsePrompt": "Vervollständige zweimal: „Gezählt werden …; geteilt wird durch …; die Aussage beschreibt damit …“.",
      "hints": [
        "Beide Sätze können dieselbe Schnittmenge zählen. Der Unterschied liegt in der Bezugsgruppe.",
        "„Unter den Interessierten“ legt die Interessierten als Nenner fest; „innerhalb des Ostens“ legt die Befragten dieser Region als Nenner fest."
      ],
      "solution": "Im ersten Satz sind stark Interessierte im Osten der Zähler und alle stark Interessierten der Nenner. Im zweiten Satz bleibt der Zähler gleich, der Nenner umfasst aber alle betrachteten Befragten im Osten. Die 30 % sind ausschließlich ein Satzbeispiel, kein ALLBUS-Ergebnis. In einer Tabelle mit Region in Zeilen vergleichen Zeilenprozente die Interessenkategorien innerhalb einer Region.",
      "checks": [
        "Ich benenne bei beiden Sätzen den Nenner ausdrücklich.",
        "Ich setze einen Anteil innerhalb einer Region nicht mit dem Regionalanteil innerhalb einer Interessengruppe gleich."
      ]
    },
    {
      "title": "Dieselben Antworten mit zwei Prozentbasen auswerten",
      "minutes": 25,
      "instructions": [
        "Führe die vorbereiteten summary(crosstab(...))-Zeilen mit percentages = \"row\" und percentages = \"col\" aus. summary zeigt die Zellen und Prozente. Lass die Variablenreihenfolge unverändert: zuerst eastwest, dann pa02a.",
        "Wähle in beiden Ausgaben dieselbe Zelle, beispielsweise West und sehr starkes Interesse. Schreibe zu jedem Prozentwert einen vollständigen Satz mit korrekter Bezugsgruppe.",
        "Führe anschließend den vorbereiteten gewichteten Zeilenprozent-Aufruf aus. Lies die Bedeutung von wghtpew im Codebuch und vergleiche dieselbe Zelle mit dem ungewichteten Ergebnis; dokumentiere den Unterschied oder seine geringe Größe."
      ],
      "atlas": [
        {
          "id": "crosstab",
          "prompt": "Welche Frage beantwortet genau die von dir ausgewählte Tabellenzelle?"
        },
        {
          "id": "weights",
          "prompt": "Was verändert ein Gewicht am Beitrag einer befragten Person?"
        },
        {
          "id": "conditional_probability",
          "prompt": "Welche Größe bleibt beim Wechsel der Prozentbasis gleich und welche ändert sich?"
        }
      ],
      "responsePrompt": "Notiere drei Werte aus deiner Ausgabe und drei dazu passende Sätze: Zeilenprozent, Spaltenprozent und gewichtetes Zeilenprozent. Begründe kurz, ob die Gewichtung zu deiner Beschreibung passt.",
      "hints": [
        "Bei Zeilenprozenten summieren sich die Kategorien innerhalb einer Region über dieselbe verwendete Prozentbasis auf ungefähr 100 %. Rundungen sind möglich.",
        "Gewichte ändern die Beiträge der Fälle; sie tauschen nicht einfach den Nenner von Zeile zu Spalte. Ein Gewichtungsargument allein liefert noch keine vollständig designgerechte Unsicherheitsrechnung."
      ],
      "solution": "Erwartet werden korrekt beschriftete Werte aus der eigenen Datei. Ein Zeilenprozent lautet etwa „Unter den ausgewerteten Befragten im Westen entfallen … % auf sehr starkes Interesse“. Ein Spaltenprozent lautet „Unter den ausgewerteten sehr stark Interessierten entfallen … % auf den Westen“. Das gewichtete Zeilenprozent behält die erste Bezugsfrage bei, verändert aber die Fallbeiträge. Es muss nicht sichtbar stärker oder schwächer ausfallen.",
      "checks": [
        "Jeder berichtete Prozentwert hat einen ausdrücklich genannten Nenner und eine geklärte Behandlung fehlender Antworten.",
        "Ich unterscheide den Wechsel der Prozentbasis von einer Gewichtung derselben Beschreibung."
      ]
    },
    {
      "title": "Die passende Prozentfrage für das Projekt wählen",
      "minutes": 20,
      "instructions": [
        "Prüfe deinen Projektsteckbrief: Möchtest du Gruppen hinsichtlich ihrer politischen Antworten vergleichen oder die Zusammensetzung einer Antwortgruppe untersuchen?",
        "Wähle dafür zwei passende kategoriale beziehungsweise geordnete Variablen und lege Zeilen, Spalten und Prozentbasis fest. Nutze den vorhandenen Kreuztabellenaufruf mit den geprüften Variablen; kategorisiere keine metrische Variable ohne Begründung.",
        "Erstelle eine Tabelle und schreibe eine zentrale Aussage samt Nenner. Ergänze, ob die Darstellung gewichtet ist und warum; halte fest, welche zweite Frage die andere Prozentbasis beantworten würde."
      ],
      "atlas": [
        {
          "id": "crosstab",
          "prompt": "Wie musst du deine Tabelle lesen, damit sie die Forschungsfrage beantwortet?"
        },
        {
          "id": "frequency",
          "prompt": "Welche gültigen Fälle bilden deine Prozentbasis?"
        },
        {
          "id": "weights",
          "prompt": "Auf welche Zielgruppe soll deine gewichtete oder ungewichtete Aussage bezogen sein?"
        }
      ],
      "responsePrompt": "Speichere Tabelle und Code. Formuliere eine Ergebnisbeschreibung und daneben eine andere Frage, die dieselbe Tabelle mit vertauschter Prozentbasis beantworten könnte.",
      "hints": [
        "Wenn du Interesse innerhalb von Regionen vergleichen möchtest, gehören die Regionen in die Bezugsgruppen.",
        "Wähle die Prozentbasis zuerst anhand deiner Frage. Die optisch eindrucksvollere Prozentzahl ist kein Auswahlkriterium."
      ],
      "solution": "Eine überzeugende Lösung begründet Tabellenrichtung und Prozentbasis aus der Forschungsfrage. Für politische Antworten innerhalb von Gruppen sind die Gruppen die Nenner. Wer stattdessen die Zusammensetzung einer Antwortgruppe untersuchen möchte, verwendet diese Antwortgruppe als Nenner. Beide Fragen sind zulässig, aber nicht austauschbar. Die konkreten Prozentwerte werden aus der eigenen Analyse übernommen.",
      "checks": [
        "Meine Tabellenbeschriftung, mein Code und mein Ergebnissatz verwenden dieselbe Prozentbasis.",
        "Ich kann eine zweite, andere Frage formulieren, die mit der anderen Prozentbasis beantwortet wird."
      ]
    }
  ],
  "5": [
    {
      "title": "Vom Antwortpaar zur Rangkorrelation",
      "minutes": 20,
      "instructions": [
        "Öffne zusammengehörige Wertepaare, Ränge und Spearman. Erkläre, warum die beiden Angaben einer Person zusammenbleiben müssen.",
        "Zeichne zwei erfundene Muster: eines, bei dem höhere Werte einer Skala meist mit höheren Werten der anderen auftreten, und eines, bei dem hohe Werte an beiden Enden der anderen Skala auftreten.",
        "Übertrage diese Muster auf pa02a und pa01. Lies beide Kodierungen erneut und formuliere vor der Rechnung eine Vermutung; gib an, ob sie monoton oder nichtmonoton ist."
      ],
      "atlas": [
        {
          "id": "pairs",
          "prompt": "Warum darfst du Interesse und Orientierung nicht unabhängig voneinander sortieren?"
        },
        {
          "id": "ranks",
          "prompt": "Welche Information bleibt erhalten, wenn Antworten in Rangpositionen übersetzt werden?"
        },
        {
          "id": "spearman",
          "prompt": "Welche Form von Zusammenhang fasst die Rangkorrelation zusammen?"
        }
      ],
      "responsePrompt": "Notiere deine Vermutung und erkläre an deinen Skizzen, welches Muster Spearman gut zusammenfasst und welches durch einen kleinen Wert verborgen bleiben könnte.",
      "hints": [
        "Monoton bedeutet: Wenn X zunimmt, nimmt Y tendenziell in einer Richtung zu oder ab.",
        "Bei pa02a steht eine hohe Zahl für wenig Interesse. Wenn beide politischen Enden besonders interessiert wären, lägen die pa02a-Zahlen an beiden Enden niedrig; die sichtbare Kurvenrichtung hängt daher von der Kodierung ab."
      ],
      "solution": "Spearman korreliert die Ränge zusammengehöriger Wertepaare. Es beschreibt einen monotonen Zusammenhang, nicht jede mögliche Beziehung. Ein Muster mit hohen oder niedrigen Antworten an beiden Enden der anderen Skala kann eine geringe Rangkorrelation ergeben. Bei politischen Interpretationen müssen beide Zahlenrichtungen berücksichtigt werden. Die Skizzen sind Hypothesen, keine behaupteten ALLBUS-Befunde.",
      "checks": [
        "Meine Skizzen unterscheiden monotone und nichtmonotone Muster.",
        "Ich formuliere meine Vermutung mit der tatsächlichen Kodierung von pa02a und pa01."
      ]
    },
    {
      "title": "Kennzahl und Antwortmuster gemeinsam lesen",
      "minutes": 25,
      "instructions": [
        "Führe den vorbereiteten spearman_rho-Aufruf und die Ausgabe von rho und n aus. Notiere Richtung, Größe und die Zahl der gültigen Antwortpaare.",
        "Führe die vorbereitete ausführliche Kreuztabelle mit summary(crosstab(...)) von pa02a und pa01 aus. Untersuche, ob die Verteilung der Links-Rechts-Antworten über die Interessenkategorien hinweg einen erkennbaren Trend oder ein anderes Muster zeigt.",
        "Vergleiche Ausgabe und Vermutung. Formuliere einen beschreibenden Ergebnissatz und prüfe ausdrücklich, ob die Kodierung deine erste Lesart des Vorzeichens verändert; interpretiere hier keine gewöhnlichen p-Werte als designgerechte ALLBUS-Inferenz."
      ],
      "atlas": [
        {
          "id": "spearman",
          "prompt": "Was sagen Vorzeichen und Betrag des tatsächlich beobachteten rho aus?"
        },
        {
          "id": "pairs",
          "prompt": "Warum kann n für die gemeinsame Auswertung kleiner sein als für eine einzelne Variable?"
        },
        {
          "id": "crosstab",
          "prompt": "Welche Einzelheiten des Antwortmusters siehst du in der Tabelle zusätzlich?"
        }
      ],
      "responsePrompt": "Schreibe vier Sätze: Vermutung, beobachtetes rho mit n, Lesart unter beiden Kodierungen und eine Grenze der Kennzahl.",
      "hints": [
        "Ein positives rho bedeutet zunächst nur: höhere Codes gehen tendenziell mit höheren Codes einher.",
        "Für dieses Variablenpaar würde ein positives Vorzeichen tendenziell höhere Links-Rechts-Codes mit weniger Interesse verbinden. Ob rho tatsächlich positiv ist und wie groß es ausfällt, entscheidet deine Ausgabe."
      ],
      "solution": "Es wird kein Vorzeichen und keine Effektgröße vorgegeben. Eine korrekte Lösung berichtet das beobachtete rho und n, übersetzt die beiden Codes in politische Begriffe und nutzt die Kreuztabelle zur Einordnung. n zählt hier gültige Antwortpaare. Ein kleines rho schließt nichtmonotone Muster nicht aus; ein großer Betrag belegt weder Kausalität noch eine universelle Beziehung außerhalb der betrachteten Antworten.",
      "checks": [
        "Meine Interpretation folgt dem tatsächlichen Vorzeichen und beiden geprüften Kodierungen.",
        "Ich benutze die Tabelle als zusätzliche Information und behaupte aus rho allein keine Ursache."
      ]
    },
    {
      "title": "Eine Zusammenhangsaussage für das Projekt begrenzen",
      "minutes": 20,
      "instructions": [
        "Wähle ein Variablenpaar aus deinem Projekt. Prüfe, ob eine Kreuztabelle oder eine Rangkorrelation zur Frage und zu den Variablentypen passt; bei rein nominalen Codes rechnest du nicht einfach Spearman.",
        "Schreibe eine Vorhersage und führe die passende beschreibende Auswertung aus. Halte auch fest, wenn deine ursprüngliche Vermutung nicht zu den beobachteten Antworten passt.",
        "Formuliere zwei mögliche Erklärungen für einen beobachteten Zusammenhang, etwa umgekehrte Wirkungsrichtung oder ein weiteres Merkmal. Kennzeichne sie als Möglichkeiten und benenne eine zusätzliche Information, die zur Prüfung benötigt würde."
      ],
      "atlas": [
        {
          "id": "spearman",
          "prompt": "Passt eine monotone Zusammenhangsfrage zu deinen beiden geordneten Merkmalen?"
        },
        {
          "id": "crosstab",
          "prompt": "Wäre eine Tabelle für die ausgewählten Kategorien verständlicher?"
        },
        {
          "id": "causality",
          "prompt": "Welche Informationen fehlen, um aus einem Zusammenhang auf eine Wirkung zu schließen?"
        }
      ],
      "responsePrompt": "Ergänze dein Projektdokument um eine begründete Verfahrenswahl, einen Ergebnisabsatz und zwei ausdrücklich vorläufige Erklärungen.",
      "hints": [
        "Für Region und Interesse ist eine Kreuztabelle ein naheliegender Einstieg. Für zwei geordnete Angaben kannst du eine Rangkorrelation erwägen.",
        "Formuliere „könnte mit beiden Merkmalen zusammenhängen“ statt „ist die Ursache“. Eine plausible Geschichte wird durch die vorliegende Tabelle noch nicht geprüft."
      ],
      "solution": "Erwartet wird eine zur Frage passende beschreibende Analyse. Die Schlussfolgerung trennt beobachteten Zusammenhang, mögliche Erklärung und noch fehlende Evidenz. Beispielsweise könnten politische Sozialisation oder weitere soziale Merkmale mit zwei Antworten zusammenhängen; das ist eine Untersuchungsidee, kein Ergebnis der hier gerechneten Korrelation. Auch eine nicht bestätigte Vermutung ist ein nachvollziehbares Projektergebnis.",
      "checks": [
        "Ich habe das Verfahren nach Frage und Variablentyp gewählt, nicht nach einem auffälligen Ergebnis.",
        "Ich kennzeichne alternative Erklärungen als ungetestet und benenne dafür eine benötigte Zusatzinformation."
      ]
    }
  ],
  "6": [
    {
      "title": "Personenwerte und Umfrageergebnisse unterscheiden",
      "minutes": 20,
      "instructions": [
        "Öffne Zufallsauswahl, Stichprobenverteilung und Standardfehler. Erkläre die Begriffe für wiederholte fiktive Befragungen zur Links-Rechts-Selbsteinstufung.",
        "Zeichne 25 kleine Personenpunkte und fasse sie zu einem Mittelwertpunkt zusammen. Zeichne danach drei weitere Mittelwertpunkte für drei neue Gruppen und beschrifte beide Darstellungsebenen.",
        "Sage voraus, was sich verändert, wenn jede Gruppe statt 25 nun 100 unabhängig gezogene Antworten enthält. Unterscheide dabei die Streuung einzelner Antworten von der Streuung der Gruppenmittelwerte."
      ],
      "atlas": [
        {
          "id": "random_sampling",
          "prompt": "Was wird bei jeder Wiederholung erneut zufällig ausgewählt?"
        },
        {
          "id": "sampling_distribution",
          "prompt": "Wofür steht ein einzelner Punkt in der Verteilung wiederholter Mittelwerte?"
        },
        {
          "id": "se",
          "prompt": "Welche Art von Schwankung wird durch den Standardfehler beschrieben?"
        }
      ],
      "responsePrompt": "Ergänze: „Ein Personenpunkt steht für …; ein Mittelwertpunkt steht für …; bei größeren unabhängigen Stichproben erwarte ich …“.",
      "hints": [
        "500 Mittelwertpunkte sind nicht 500 einzelne Befragte. Jeder Punkt fasst eine ganze Stichprobe zusammen.",
        "Mehr Antworten verändern nicht automatisch die Streuung der Modellbevölkerung. Sie machen deren Mittelwert bei unabhängiger Auswahl typischerweise präziser schätzbar."
      ],
      "solution": "Ein Personenpunkt ist eine einzelne fiktive Antwort, ein Mittelwertpunkt der Mittelwert einer ganzen Stichprobe. Die Stichprobenverteilung sammelt solche Mittelwerte über wiederholte Auswahlen. Bei unabhängiger Ziehung aus demselben Modell schwanken Mittelwerte aus 100 Antworten typischerweise weniger als Mittelwerte aus 25 Antworten. Die Verteilung der möglichen Personenantworten wird dadurch nicht enger.",
      "checks": [
        "Ich beschrifte beide Ebenen so, dass Personenwerte und Stichprobenmittelwerte nicht verwechselt werden können.",
        "Meine Vorhersage bezieht sich auf unabhängige Stichproben aus derselben Modellbevölkerung."
      ]
    },
    {
      "title": "500 fiktive politische Umfragen vergleichen",
      "minutes": 25,
      "instructions": [
        "Ziehe zur Veranschaulichung in R einmal mit antworten <- sample(1:10, 25, replace = TRUE) 25 fiktive Antworten. Zeige antworten an und berechne mit mean(antworten) den Mittelwert genau dieser Gruppe.",
        "Führe anschließend den vorbereiteten Block ab set.seed(602) vollständig aus. Er erzeugt 500 Mittelwerte aus Gruppen zu 25 Antworten. Notiere, was die Achsen des Histogramms bedeuten, und ergänze sd(mittelwerte), um die Streuung der Mittelwerte festzuhalten.",
        "Ändere in replicate(...) nur die Gruppengröße von 25 auf 100, nicht die Zahl 500. Starte ab set.seed(602) erneut und vergleiche Histogramm und sd(mittelwerte). Prüfe die numerischen Streuungen, statt dich nur auf automatisch gewählte Achsen zu verlassen."
      ],
      "atlas": [
        {
          "id": "sampling_distribution",
          "prompt": "Was wird in mittelwerte gespeichert, und was wird im Histogramm gezählt?"
        },
        {
          "id": "se",
          "prompt": "Warum ist sd(mittelwerte) hier eine simulierte Streuung des Schätzers und nicht die Streuung einzelner Personen?"
        },
        {
          "id": "random_sampling",
          "prompt": "Was bedeutet Ziehen mit Zurücklegen in diesem künstlichen Modell?"
        }
      ],
      "responsePrompt": "Dokumentiere die beiden simulierten Streuungen und erläutere den Unterschied. Ergänze, warum 500 und 25 beziehungsweise 100 im Code verschiedene Aufgaben haben.",
      "hints": [
        "replicate(500, ...) wiederholt die gesamte innere Rechnung 500-mal; sample(..., 25, ...) legt die Zahl der Antworten innerhalb einer Wiederholung fest.",
        "Für unabhängige Antworten sinkt der Standardfehler mit 1/√n. Viermal so viele Antworten pro Stichprobe lassen daher ungefähr die halbe Streuung der Mittelwerte erwarten; Simulationsergebnisse müssen das Verhältnis nicht exakt treffen."
      ],
      "solution": "Im Modell sind die Positionen 1 bis 10 gleich wahrscheinlich; es handelt sich nicht um die ALLBUS-Verteilung. Die 500 gespeicherten Werte sind Mittelwerte von jeweils 25 beziehungsweise 100 Antworten. Bei 100 Antworten sollte ihre simulierte Standardabweichung ungefähr halb so groß sein wie bei 25. Die Mittelwerte liegen weiterhin um denselben Modellmittelwert 5,5. Konkrete simulierte Kennwerte werden aus der eigenen R-Ausgabe übernommen.",
      "checks": [
        "Ich habe nur die Stichprobengröße verändert und in beiden Durchläufen 500 Wiederholungen verwendet.",
        "Ich deute sd(mittelwerte) als Schwankung wiederholter Schätzungen und kennzeichne den Versuch als künstliches Modell."
      ]
    },
    {
      "title": "Zufall und Auswahlverzerrung im eigenen Projekt prüfen",
      "minutes": 20,
      "instructions": [
        "Lies im Codebuch beziehungsweise in der Studiendokumentation nach, wer zur Zielgruppe deiner Daten gehört und wie die Befragten ausgewählt wurden. Notiere, welche Information du gefunden hast und was noch unklar bleibt.",
        "Vergleiche diese Erhebung gedanklich mit einer Befragung ausschließlich vor einem Parteitag. Erkläre, warum eine größere Fallzahl allein diese einseitige Auswahl nicht beheben würde.",
        "Ergänze deinen Projektsteckbrief um zwei Grenzen: eine zur Zufallsschwankung und eine zu möglicher systematischer Verzerrung. Schreibe dazu, welche Aussage derzeit nur die ausgewerteten Befragten beschreibt."
      ],
      "atlas": [
        {
          "id": "sampling_bias",
          "prompt": "Welche Abweichung bleibt möglicherweise bestehen, selbst wenn sehr viele Personen befragt werden?"
        },
        {
          "id": "sampling",
          "prompt": "Welche Bedingungen unterscheiden deine realen Daten vom unabhängigen Modellversuch?"
        },
        {
          "id": "population_parameter",
          "prompt": "Über welche Grundgesamtheit möchtest du eine Aussage treffen?"
        }
      ],
      "responsePrompt": "Verfasse einen kurzen Abschnitt „Wen beschreibt meine Analyse?“ mit Datenquelle, Zielgruppe, gefundenen Designinformationen und zwei getrennten Unsicherheitsgrenzen.",
      "hints": [
        "Zufallsschwankung betrifft wechselnde Ergebnisse wiederholter Auswahlen. Verzerrung betrifft eine systematische Abweichung des Auswahl- oder Messprozesses.",
        "Wenn Designinformationen fehlen, ist „noch zu prüfen“ eine korrekte Angabe. Das Modell mit unabhängigen Ziehungen und gleichen Auswahlchancen darf nicht ungeprüft auf ALLBUS übertragen werden."
      ],
      "solution": "Ein guter Abschnitt unterscheidet Zielgruppe, tatsächlich analysierte Fälle und Auswahlmechanismus. Eine größere unabhängige Stichprobe kann Zufallsschwankungen verringern; sie korrigiert nicht automatisch eine einseitige Rekrutierung, Nichtteilnahme oder ungeeignete Messung. Welche dieser Probleme im eigenen Datensatz auftreten, muss anhand der Dokumentation untersucht werden. Bis dahin bleibt eine klar begrenzte Beschreibung der gültigen Befragungsantworten zulässig.",
      "checks": [
        "Ich habe Zufallsschwankung und systematische Verzerrung mit unterschiedlichen Beispielen erklärt.",
        "Meine Aussagen über die Reichweite des Projekts stützen sich auf dokumentierte Erhebungsinformationen oder sind ausdrücklich als offen markiert."
      ]
    }
  ],
  "7": [
    {
      "title": "Personen streuen – Schätzungen schwanken",
      "minutes": 20,
      "instructions": [
        "Öffne Standardabweichung und Standardfehler nacheinander im Atlas. Schreibe zu beiden: Was streut hier, welche Einheit hat die Zahl und wo kommt die Fallzahl in der Formel vor? Markiere den Unterschied zwischen Antworten einzelner Personen und wiederholten Mittelwerten.",
        "Öffne Konfidenzintervall. Im dortigen Lehrlabor bleiben der beobachtete Mittelwert, σ = 1 und α = 0,05 gleich. Vergleiche n = 40 mit n = 160 und notiere, wie sich Standardfehler und Intervallbreite verändern. Dieses Labor verwendet bekannte Populationsstreuung und einen z-Ansatz.",
        "Verbessere zwei Sätze: 'Im 95-%-Intervall liegen 95 % der Personen' und 'Ein enges Intervall beweist eine unverzerrte Auswahl'. Nutze die Atlas-Erklärungen und formuliere stattdessen, was sich auf die Schätzung und was sich auf das Erhebungsdesign bezieht."
      ],
      "atlas": [
        {
          "id": "sd",
          "prompt": "Was beschreibt die Streuung der einzelnen politischen Antworten?"
        },
        {
          "id": "se",
          "prompt": "Warum steht die Wurzel der Fallzahl im Nenner?"
        },
        {
          "id": "confidence",
          "prompt": "Was wird bei Wiederholung vom Intervall überdeckt?"
        }
      ],
      "responsePrompt": "Notiere einen Vergleich von SD und SE, die beobachtete Veränderung der Intervallbreite und zwei korrigierte Erklärungssätze.",
      "hints": [
        "Ergänze 'Streuung von …'. Bei der Standardabweichung sind es Personenwerte; beim Standardfehler ist es eine Schätzung über gedachte Wiederholungen.",
        "√160 ist doppelt so groß wie √40. Bei unverändertem σ halbieren sich SE und die Breite des z-Intervalls."
      ],
      "solution": "Die Standardabweichung beschreibt Unterschiede zwischen einzelnen Antworten. Der Standardfehler beschreibt die Streuung des Mittelwertschätzers bei wiederholter unabhängiger Stichprobenziehung. Beide haben hier die Einheit Skalenpunkte. Im Labor halbieren viermal so viele Fälle bei festem σ den Standardfehler und die Intervallbreite. Bei wiederholter Anwendung sollen unter dem Modell langfristig ungefähr 95 % der neu berechneten Intervalle den einen festen Populationsmittelwert überdecken. Es enthält nicht notwendigerweise 95 % der Personenwerte. Auch ein präziser Schätzer kann durch Auswahl oder Messung systematisch verzerrt sein.",
      "checks": [
        "Ich habe Personenstreuung und Schätzunsicherheit unterschieden und die Fallzahlabhängigkeit korrekt erklärt.",
        "Meine 95-%-Erklärung bezieht sich auf wiederholte Intervalle und behauptet weder 95 % Personenwerte noch automatisch unverzerrte Auswahl."
      ]
    },
    {
      "title": "Das Modellintervall Zeile für Zeile lesen",
      "minutes": 25,
      "instructions": [
        "Führe das vollständige Skript dieser Sitzung aus. Prüfe im Anfangsteil: modell enthält 200 erfundene Antworten; linksrechts wird aus 1 bis 10 gezogen. Notiere Datenstatus, Fallzahl, Mittelwert, Standardabweichung und Standardfehler aus den Ausgaben.",
        "Ordne die letzte Rechenzeile den Atlas-Bausteinen zu: mean(x) ist die Punktschätzung, sd(x)/sqrt(n) ihr geschätzter Standardfehler und qt(.975, df = n - 1) der kritische t-Wert. Übertrage die beiden ausgegebenen Grenzen und kontrolliere, ob der Mittelwert in ihrer Mitte liegt.",
        "Erkläre, weshalb die t-Rechnung hier nur eine Näherung für diskrete, gleichverteilte Modellantworten ist. Vergleiche sie mit dem z-Labor aus Aufgabe 1: Dort war σ bekannt, hier wird die Streuung geschätzt. Formuliere die Interpretation ausschließlich für die Modellbevölkerung."
      ],
      "atlas": [
        {
          "id": "estimator",
          "prompt": "Welcher Wert schätzt hier welchen unbekannten Parameter?"
        },
        {
          "id": "se",
          "prompt": "Woher kommt die Unsicherheit des Mittelwerts?"
        },
        {
          "id": "t_distribution",
          "prompt": "Warum erscheint ein kritischer t-Wert in der Rechnung?"
        }
      ],
      "responsePrompt": "Halte Mittelwert, SD, SE und Intervall aus deinem Lauf fest; erläutere die drei Bestandteile der Intervallformel und eine Modellgrenze.",
      "hints": [
        "c(-1, 1) erzeugt eine untere und eine obere Grenze. Multipliziere den kritischen Wert mit SE: Das ist der Abstand jeder Grenze vom Mittelwert.",
        "Die Modellantworten sind nicht normalverteilt. Bei 200 unabhängigen Fällen ist die t-Intervallmethode eine Näherung; die angezeigten Zahlen sind keine ALLBUS-Ergebnisse."
      ],
      "solution": "Ein vollständiges Ergebnis nennt die tatsächlich ausgegebenen Zahlen: 'Für die 200 Modellantworten beträgt die geschätzte mittlere Position …; das näherungsweise 95-%-Intervall reicht von … bis …'. Das Intervall liegt symmetrisch um den Stichprobenmittelwert. Der Standardfehler verwendet die geschätzte Streuung; n − 1 sind hier 199 Freiheitsgrade. Die gleichwahrscheinliche Modellskala 1 bis 10 hat den bekannten Modellmittelwert 5,5. Ob dieses einzelne Intervall ihn enthält, lässt sich prüfen, belegt aber keine 95-%-Überdeckung. Diese bezieht sich auf viele Wiederholungen. Die Gleichverteilung und die behandelten Skalenabstände sind Modellannahmen, keine Feststellungen über politische Einstellungen.",
      "checks": [
        "Meine Zahlen stammen aus dem ausgeführten Modellskript, und ich kann Schätzung, SE und kritischen Wert zeigen.",
        "Ich kennzeichne das Intervall als Modellrechnung und verwechsle weder die einzelne Überdeckung noch den z-Laborwert mit einer garantierten 95-%-Aussage."
      ]
    },
    {
      "title": "Unsicherheit für das eigene Projekt planen",
      "minutes": 20,
      "instructions": [
        "Öffne deinen Projektsteckbrief. Benenne eine konkrete Zielgröße: zum Beispiel die mittlere Links-Rechts-Selbsteinstufung oder den Anteil mit starkem politischem Interesse. Schreibe dazu, für welche Menschen und welchen Zeitraum du eine Aussage machen möchtest.",
        "Nutze im Atlas Stichprobe, Gewichte und Schätzer. Erkläre, welche Größe deine bisherigen gültigen Antworten beschreiben und was für einen Schluss auf die Zielgruppe zusätzlich geklärt werden muss. Halte fehlende Antworten und die metrische Näherung fest, falls du einen Mittelwert verwendest.",
        "Entscheide schriftlich, was du jetzt verantwortbar berichten kannst. Wenn das ALLBUS-Design für ein Intervall noch nicht berücksichtigt ist, berichte vorerst eine Beschreibung und einen offenen Prüfauftrag. Übernimm die einfache Modellformel nicht unverändert als designgerechtes ALLBUS-Intervall."
      ],
      "atlas": [
        {
          "id": "estimator",
          "prompt": "Schätzt dein Projekt einen Mittelwert, einen Anteil oder eine andere Größe?"
        },
        {
          "id": "sampling",
          "prompt": "Worauf beruht der Übergang von Befragten zur Zielgruppe?"
        },
        {
          "id": "weights",
          "prompt": "Was verändert eine Gewichtung – und was klärt sie nicht allein?"
        }
      ],
      "responsePrompt": "Schreibe vier Sätze: Zielgröße; Zielgruppe; bisher mögliche Aussage; noch offene Frage zu Unsicherheit oder Erhebungsdesign.",
      "hints": [
        "Ein Anteil stark Interessierter und die mittlere Links-Rechts-Position sind verschiedene Zielgrößen. Sie brauchen nicht automatisch denselben Standardfehler.",
        "Ein weights-Argument berücksichtigt nicht von selbst alle Abhängigkeiten und Designmerkmale. 'Noch kein belastbares Bevölkerungsintervall' ist eine begründete Entscheidung."
      ],
      "solution": "Ein mögliches Antwortgerüst lautet: 'Ich möchte … für … im Jahr … beschreiben. Meine Auswertung verwendet … gültige Angaben und beschreibt zunächst …. Für eine Bevölkerungsangabe muss ich … klären.' Beim Mittelwert der 1–10-Skala gehört die Annahme gleich großer Abstände dazu. Bei Anteilen müssen Antwortkategorie und Nenner feststehen. Die Gewichtung für eine passende gesamtdeutsche Beschreibung ersetzt keine vollständige designgerechte Varianzschätzung. Eine gute Lösung kann daher ausdrücklich bei einer deskriptiven Aussage bleiben. Bewertet wird die Begründung, nicht das Vorhandensein eines Intervalls.",
      "checks": [
        "Meine Zielgröße und Zielgruppe sind ausdrücklich benannt; ich habe nicht ungeprüft jede Frage in eine Mittelwertfrage umgewandelt.",
        "Ich trenne die aktuell belegte Beschreibung von zusätzlichen Annahmen für Bevölkerungsschlüsse und nenne einen konkreten offenen Prüfauftrag."
      ]
    }
  ],
  "8": [
    {
      "title": "Vom Nullmodell zur schattierten Fläche",
      "minutes": 20,
      "instructions": [
        "Öffne Null- und Alternativhypothese. Formuliere für die fiktiven Regionen A und B: H₀ behauptet gleiche mittlere Links-Rechts-Positionen; H₁ lässt Unterschiede in beide Richtungen zu. Begründe, warum die Richtung vor der Auswertung festgelegt wird.",
        "Öffne Prüfgröße und p-Wert. Lies die Kette 'beobachtete Abweichung → durch ihren Standardfehler teilen → mit der Nullverteilung vergleichen'. Erkläre, weshalb ein Unterschied von einem Skalenpunkt allein noch keinen p-Wert festlegt.",
        "Nutze beim p-Wert das z-Lehrlabor: beobachteter Mittelwert 0,3, σ = 1, zweiseitige Alternative und α = 0,05. Ändere nur n von 40 auf 160. Notiere, was bei konstantem beobachtetem Unterschied mit SE, Prüfgröße und schattierter Fläche passiert; behaupte dabei keine Veränderung der Effektgröße."
      ],
      "atlas": [
        {
          "id": "hypothesis",
          "prompt": "Welcher Unterschied ist unter H₀ vorgesehen und welche Alternative prüfst du?"
        },
        {
          "id": "test_statistic",
          "prompt": "Warum wird eine Abweichung an ihrer Unsicherheit gemessen?"
        },
        {
          "id": "p_value",
          "prompt": "Welche Wahrscheinlichkeit ist mit der schattierten Fläche gemeint?"
        }
      ],
      "responsePrompt": "Schreibe H₀ und H₁ sowie eine dreistufige Erklärung der p-Wert-Berechnung. Ergänze, was sich im Labor bei größerem n verändert.",
      "hints": [
        "Schreibe die Hypothesen als μA − μB = 0 beziehungsweise μA − μB ≠ 0. Es geht um Modellmittelwerte, nicht identische Einzelantworten.",
        "Bei gleichem Unterschied und kleinerem SE liegt die standardisierte Prüfgröße weiter von null entfernt. Das Labor illustriert einen z-Test; der folgende R-Vergleich verwendet Welch-t."
      ],
      "solution": "H₀ lautet μA = μB, H₁ lautet μA ≠ μB. Die Prüfgröße setzt die beobachtete Differenz zur geschätzten Unsicherheit ins Verhältnis. Der p-Wert bezeichnet unter H₀ und den Modellannahmen die Wahrscheinlichkeit einer mindestens so extremen Prüfgröße. Im z-Labor sinkt bei größerem n der SE; der Betrag der Prüfgröße wächst und der zweiseitige p-Wert wird kleiner. Der beobachtete Unterschied bleibt 0,3. Daraus folgt weder mehr politische Bedeutung noch eine Wahrscheinlichkeit dafür, dass H₀ wahr ist. Der z-Versuch erklärt das Prinzip und liefert nicht die Zahlen des Welch-Gruppenvergleichs.",
      "checks": [
        "Meine Hypothesen beziehen sich auf Mittelwerte, und ich habe die Alternative vor der Rechnung festgelegt.",
        "Ich kann erklären, warum ein p-Wert mit n sinken kann, obwohl der beobachtete Unterschied unverändert bleibt."
      ]
    },
    {
      "title": "Den Welch-Vergleich als begrenzte Aussage berichten",
      "minutes": 25,
      "instructions": [
        "Führe das vollständige Skript aus und lies zunächst die Modellbeschreibung. Kontrolliere, dass Region A und Region B verschiedene Fälle enthalten. Öffne die Ausgabe von summary(vergleich) und identifiziere die Gruppenreihenfolge, die beiden Mittelwerte und die Differenz.",
        "Lies danach das Konfidenzintervall der Differenz, die Welch-Prüfgröße, ihre Freiheitsgrade und den zweiseitigen p-Wert. Falls die Ausgabe zwei Varianzannahmen zeigt, verwende die Zeile 'Unequal variances' für Welch. Übertrage genau deine Zahlen und prüfe die Richtung der Differenz anhand der Gruppenreihenfolge.",
        "Schreibe einen Ergebnisabsatz zuerst mit Größe und Unsicherheit des Unterschieds, erst danach mit p. Ergänze die Annahmen unabhängiger Fälle und gleich interpretierter Skalenabstände. Nenne eine Schlussfolgerung, die diese Rechnung nicht zulässt."
      ],
      "atlas": [
        {
          "id": "t_test",
          "prompt": "Welche zwei Gruppen und welche Zielvariable werden verglichen?"
        },
        {
          "id": "confidence",
          "prompt": "Was sagt das Intervall über mit den Daten vereinbare Differenzen?"
        },
        {
          "id": "effect",
          "prompt": "Wie groß ist der Unterschied in Skalenpunkten, unabhängig vom p-Wert?"
        }
      ],
      "responsePrompt": "Verfasse vier bis fünf Sätze mit Gruppenreihenfolge, Mittelwertdifferenz, Intervall, Welch-t und p sowie einer klaren Interpretationsgrenze.",
      "hints": [
        "Lies die Richtung aus den Gruppenbezeichnungen der Ausgabe. Ein negatives Vorzeichen bedeutet nicht automatisch, dass Region B niedriger liegt.",
        "'Unequal variances' bezeichnet die Welch-Zeile; gleiche Gruppenvarianzen werden nicht vorausgesetzt. Ein großer p-Wert beweist keine Gleichheit, ein kleiner p-Wert keine politische Relevanz."
      ],
      "solution": "Das Antwortgerüst lautet: 'In den erfundenen Daten liegt der Mittelwert in Region … bei … und in Region … bei …. Die Differenz … minus … beträgt … Skalenpunkte; ihr Intervall reicht von … bis …. Der Welch-Test ergibt t = …, df = … und p = …. Das beschreibt eine Modellstichprobe und belegt keine Wirkung der Region.' Das Vorzeichen muss zur berichteten Subtraktion passen. Das Generierungsmodell enthält keine systematische Regionswirkung; zufällige Stichproben können trotzdem Unterschiede zeigen. Ob H₀ nach einer vorher festgelegten Schwelle verworfen wird, wird aus der eigenen Ausgabe berichtet, nicht als gewünschtes Ergebnis vorausgesetzt.",
      "checks": [
        "Mein Vorzeichen stimmt mit der ausgegebenen Gruppenreihenfolge überein, und ich berichte Differenz und Intervall vor dem p-Wert.",
        "Ich mache weder aus einem großen p einen Gleichheitsbeweis noch aus fiktiven Regionen einen Befund über Ost- und Westdeutschland."
      ]
    },
    {
      "title": "Für das eigene Projekt eine Prüfentscheidung begründen",
      "minutes": 20,
      "instructions": [
        "Wähle eine Frage aus deinem Projekt und formuliere zuerst, ob du beschreiben, schätzen oder testen möchtest. Falls ein Gruppenvergleich sinnvoll ist, benenne Zielvariable, zwei Gruppen und die inhaltlich relevante Differenz. Andernfalls begründe, weshalb ein Welch-Test deine Frage nicht beantwortet.",
        "Prüfe im Atlas Stichprobe und Kausalität. Sind die Beobachtungen unabhängig? Sind die Gruppen zufällig zugewiesen oder nur beobachtet? Welche zusätzlichen Merkmale könnten eine beobachtete Differenz erklären? Halte mindestens eine konkrete Alternative fest.",
        "Schreibe einen Analyseplan, bevor du neue Tests startest: Hypothese, deskriptiver Einstieg, geeignetes Verfahren und Grenzen. Bei ALLBUS bleibt eine designgerechte Inferenz ein gesonderter Prüfauftrag; ersetze diesen nicht durch einen gewöhnlichen t-Test mit Gewichten."
      ],
      "atlas": [
        {
          "id": "hypothesis",
          "prompt": "Lässt sich aus deiner politischen Frage eine vorab formulierte prüfbare Aussage ableiten?"
        },
        {
          "id": "sampling",
          "prompt": "Sind Unabhängigkeit und Auswahl für dein Verfahren begründet?"
        },
        {
          "id": "causality",
          "prompt": "Welche Erklärung lässt ein beobachteter Gruppenunterschied offen?"
        }
      ],
      "responsePrompt": "Notiere eine begründete Entscheidung für oder gegen einen Gruppenmittelwerttest und einen kurzen Analyseplan mit einer alternativen Erklärung.",
      "hints": [
        "Fünf geordnete Interessenkategorien und eine Frage nach Anteilen verlangen nicht automatisch einen Mittelwerttest.",
        "Wohngebiet wird in ALLBUS nicht experimentell zugewiesen. Ein Unterschied zwischen Wohngebieten kann mit vielen weiteren Merkmalen zusammenhängen."
      ],
      "solution": "Eine passende Lösung verbindet Verfahren und Frage: 'Ich untersuche …, deshalb beginne ich mit …. Ein Welch-Test wäre nur passend, wenn …; für mein jetziges Projekt entscheide ich …. Ein beobachteter Unterschied könnte außerdem durch … erklärt werden.' Beim Mittelwertvergleich gehören die metrische Näherung, unabhängige Gruppen und die Stichprobenbedingungen in die Begründung. Eine Anteilsbeschreibung oder Kreuztabelle kann die bessere Entscheidung sein. Die Formulierung einer Hypothese zwingt nicht dazu, mit ungeeigneten Standardfehlern eine Bevölkerungsinferenz zu rechnen.",
      "checks": [
        "Meine Methodenentscheidung folgt meiner Frage und den Variablentypen, nicht einem gewünschten p-Wert.",
        "Ich nenne mindestens eine konkrete Grenze der Inferenz oder Kausalinterpretation und einen dazu passenden nächsten Prüfschritt."
      ]
    }
  ],
  "9": [
    {
      "title": "Was würde Unabhängigkeit in einer Tabelle bedeuten?",
      "minutes": 20,
      "instructions": [
        "Öffne Kreuztabelle und benenne für den Sitzungsversuch Zeilen, Spalten und Nenner: Region in den Zeilen, fünf Interessenkategorien in den Spalten, Prozentuierung innerhalb der Region. Erkläre, wie das Muster bei Unabhängigkeit ungefähr aussehen sollte.",
        "Öffne erwartete Häufigkeiten. Erkläre E = Zeilensumme × Spaltensumme / Gesamtsumme in Worten. Rechne ein rein fiktives Beispiel: 100 Fälle in einer Region, 40 Antworten in einer Interessenkategorie und insgesamt 200 Fälle. Welche Zellhäufigkeit wäre unter Unabhängigkeit zu erwarten?",
        "Öffne Chi-Quadrat und unterscheide beobachtete von erwarteten Zahlen. Erkläre, warum Abweichungen über alle Zellen zusammengefasst werden und warum dabei Zählwerte statt gerundeter Zeilenprozente benötigt werden."
      ],
      "atlas": [
        {
          "id": "crosstab",
          "prompt": "Von welchen Fällen sprechen die Prozente einer Tabellenzeile?"
        },
        {
          "id": "expected",
          "prompt": "Welche Zellzahl folgt aus den Rändern unter Unabhängigkeit?"
        },
        {
          "id": "chi_square",
          "prompt": "Wie werden die Abweichungen vieler Zellen zu einer Prüfgröße zusammengefasst?"
        }
      ],
      "responsePrompt": "Erkläre Unabhängigkeit an der Tabelle, berechne die erwartete Beispielzelle und unterscheide beobachtet, erwartet und prozentuiert.",
      "hints": [
        "Unter Unabhängigkeit verändert die Kenntnis der Region die Verteilung der Interessenkategorien nicht.",
        "40 von 200 Fällen gehören insgesamt zur Kategorie. Derselbe Anteil von den 100 Fällen einer Region ergibt 20 erwartete Fälle."
      ],
      "solution": "Bei Unabhängigkeit hätten die Regionen dieselben Modellwahrscheinlichkeiten für die Interessenkategorien. Die beobachteten Zeilenprozente müssen in endlichen Stichproben trotzdem nicht exakt gleich sein. Im Beispiel ergibt sich E = 100 × 40 / 200 = 20. Das ist keine beobachtete Zahl und keine aus dem ALLBUS übernommene Häufigkeit. Chi-Quadrat summiert Beiträge (O − E)²/E über die Zellen. Deshalb werden Häufigkeiten und ihre Ränder gebraucht; gerundete Prozente allein tragen die Information über die Fallzahl nicht. Ein Unterschied der Prozentwerte beschreibt zunächst das Tabellenmuster, noch keine Ursache.",
      "checks": [
        "Meine erwartete Beispielhäufigkeit beträgt 20, und ich kann ihren Nenner erklären.",
        "Ich unterscheide Zellzahl und Prozentwert sowie empirische Abweichung und Unabhängigkeit im Modell."
      ]
    },
    {
      "title": "Evidenz und Zusammenhangsstärke getrennt lesen",
      "minutes": 25,
      "instructions": [
        "Führe das vollständige Sitzungsskript aus. Lies zuerst die ausführliche Kreuztabelle aus summary(crosstab(...)) und notiere je Region einen Satz zu einer Interessenkategorie. Im Modell bedeutet 1 niedriges und 5 hohes Interesse; das ist andersherum als pa02a im ALLBUS.",
        "Prüfe die erwarteten Häufigkeiten anhand der Tabellenränder: Das Modell hat 100 Fälle je Region und 200 insgesamt. Addiere für jede Interessenkategorie die beiden Zellzahlen; die Hälfte dieser Spaltensumme ist jeweils die erwartete Zellzahl in beiden Regionen. Notiere die kleinste erwartete Häufigkeit und etwaige Warnungen des Tests.",
        "Lies den Chi-Quadrat-Test und anschließend Cramér-V. Halte Prüfgröße, p-Wert und V getrennt fest. Ordne jeder Zahl ihre Frage zu: Vereinbarkeit mit Unabhängigkeit oder Stärke des kategorialen Zusammenhangs. Schreibe keine Richtung in Cramér-V hinein."
      ],
      "atlas": [
        {
          "id": "expected",
          "prompt": "Sind die erwarteten Zellen groß genug für eine brauchbare Chi-Quadrat-Näherung?"
        },
        {
          "id": "chi_square",
          "prompt": "Wie vereinbar ist das beobachtete Tabellenmuster mit Unabhängigkeit?"
        },
        {
          "id": "cramers_v",
          "prompt": "Wie stark ist die kategoriale Assoziation, ohne Richtungsangabe?"
        }
      ],
      "responsePrompt": "Dokumentiere zwei Prozent-Sätze, die kleinste erwartete Häufigkeit und eine Interpretation, die p-Wert und Cramér-V ausdrücklich trennt.",
      "hints": [
        "Für erwartete Häufigkeiten brauchst du absolute Zellzahlen. Bei gleich großen Regionen ist jede erwartete Zellzahl die Hälfte der jeweiligen Spaltensumme.",
        "V liegt zwischen 0 und 1 und besitzt kein Vorzeichen. Der p-Wert beantwortet eine andere Frage; für die Testnäherung zählen die erwarteten, nicht nur die beobachteten Zellen."
      ],
      "solution": "Eine vollständige Antwort nennt die eigenen Tabellenwerte und ihre Bezugsgruppen. Sie berechnet die erwarteten Häufigkeiten aus den tatsächlichen Rändern; die Zahl 20 aus Aufgabe 1 muss in der erzeugten Tabelle nicht für jede Kategorie gelten. Eine Lösung berichtet etwa: 'Die kleinste erwartete Zelle beträgt …. Der Test ergibt χ² = … und p = …; unter den Modellbedingungen …. Die Assoziation beträgt V = ….' V beschreibt weder eine positive noch eine negative Richtung. Ein auffälliges Testresultat beweist keine Wirkung der Region. Das Generierungsmodell verwendet unabhängig erzeugte Interessenangaben; Ergebnisse dieses Versuchs werden nicht auf eine reale Bevölkerung übertragen.",
      "checks": [
        "Meine Voraussetzungskontrolle verwendet erwartete absolute Häufigkeiten aus den tatsächlichen Tabellenrändern.",
        "Ich beschreibe mit p die Evidenz gegen Unabhängigkeit und mit V die Assoziationsstärke, ohne Ursache oder Richtung zu erfinden."
      ]
    },
    {
      "title": "Eine Methodenkarte für das eigene Projekt schreiben",
      "minutes": 20,
      "instructions": [
        "Schreibe deine politische Frage mit den konkreten Variablen auf. Bestimme für jede Variable Kategorien, Ordnung und gegebenenfalls die angenommene Bedeutung von Abständen. Notiere außerdem, ob Fälle unabhängig sind und ob du beschreiben oder auf eine Zielgruppe schließen möchtest.",
        "Vergleiche zwei mögliche Auswertungswege im Atlas: etwa Kreuztabelle für Region und Interessenkategorien, Welch für eine begründete Mittelwertfrage oder Spearman für einen monotonen Zusammenhang geordneter Angaben. Begründe, welcher Weg deine Frage direkt beantwortet und was die Alternative anders fragen würde.",
        "Lege eine überprüfbare Voraussetzung und eine passende Ergebnisdarstellung fest. Für eine Kreuztabelle gehört die Prozentbasis dazu; für Inferenz mit ALLBUS zusätzlich eine geklärte Designbehandlung. Ein reiner Beschreibungsweg ist ein vollständiger Plan, wenn er die Frage angemessen beantwortet."
      ],
      "atlas": [
        {
          "id": "crosstab",
          "prompt": "Fragt dein Projekt nach Verteilungen innerhalb von Gruppen?"
        },
        {
          "id": "t_test",
          "prompt": "Fragt es tatsächlich nach zwei Mittelwerten einer sinnvoll metrisch behandelten Variable?"
        },
        {
          "id": "spearman",
          "prompt": "Geht es um einen monotonen Zusammenhang geordneter Antworten?"
        }
      ],
      "responsePrompt": "Erstelle eine Methodenkarte: Frage → Variablen/Design → gewählter Weg → Darstellung → Voraussetzung → begründete Alternative.",
      "hints": [
        "Ein numerisch gespeicherter Regionscode ist keine metrische Messung. Das Speicherformat allein entscheidet kein Verfahren.",
        "Eine Kreuztabelle verliert die Ordnung nicht aus den Daten, nutzt sie aber nicht als Richtung eines Zusammenhangs. Spearman fasst dagegen einen monotonen Rangzusammenhang zusammen."
      ],
      "solution": "Das Gerüst lautet: 'Ich frage …. X ist …, Y ist …. Ich wähle …, weil …. Zuerst zeige ich …. Prüfen muss ich …. Die Alternative … beantwortet stattdessen ….' Bei Region × Interesse ist eine Kreuztabelle mit einer zur Frage passenden Prozentbasis ein nachvollziehbarer Einstieg. Bei Interesse × Links-Rechts kann Spearman einen monotonen Zusammenhang beschreiben; ein U-förmiges Muster muss zusätzlich betrachtet werden. Es gibt keine Pflicht, Chi-Quadrat zu wählen, weil es gerade behandelt wurde. Eine gute Entscheidung trennt Beschreibung, Modellannahmen und mögliche Bevölkerungsschlüsse.",
      "checks": [
        "Meine Methodenkarte nennt echte Variablen, ihre Bedeutung und mindestens eine konkrete Voraussetzung.",
        "Ich begründe meine Wahl gegenüber einer Alternative und rechne keinen Test nur deshalb, weil er verfügbar ist."
      ]
    }
  ],
  "10": [
    {
      "title": "Vorhersage, Abweichung und erklärte Streuung verbinden",
      "minutes": 20,
      "instructions": [
        "Öffne Vorhersage und Residuen. Schreibe die beiden Gleichungen ŷ = b₀ + b₁x und e = y − ŷ in Alltagssprache. Erkläre, welche Größe zur Modellgeraden gehört und welche zur tatsächlichen Antwort einer einzelnen Person.",
        "Öffne erklärte Varianz und das dortige Lehrlabor. Lass die zusätzliche Fehlerstreuung unverändert. Halte X des hervorgehobenen Falls fest und verändere nur seinen Y-Wert. Vergleiche die Gerade mit und ohne diesen Fall sowie R². Notiere eine beobachtete Veränderung, ohne sie als Befund über politische Antworten auszugeben.",
        "Beurteile die Sätze 'R² ist der Anteil korrekt vorhergesagter Personen' und 'Ein großes Residuum ist eine falsche Antwort'. Ersetze beide durch eine Erklärung, die sich auf Vorhersagefehler beziehungsweise Streuung um den Gesamtmittelwert bezieht."
      ],
      "atlas": [
        {
          "id": "prediction",
          "prompt": "Welche Antwort würde die Gerade für einen bestimmten X-Wert vorhersagen?"
        },
        {
          "id": "residuals",
          "prompt": "Wie weit und in welcher Richtung liegt eine Antwort von ihrer Vorhersage entfernt?"
        },
        {
          "id": "explained_variance",
          "prompt": "Welche Streuung fasst R² bei einem Modell mit Achsenabschnitt zusammen?"
        }
      ],
      "responsePrompt": "Notiere die zwei Gleichungen in Worten, einen Vergleich aus dem Lehrlabor und zwei korrigierte Erklärungssätze.",
      "hints": [
        "Eine Person oberhalb der Geraden hat y > ŷ und damit ein positives Residuum.",
        "R² vergleicht im gewöhnlichen Modell mit Achsenabschnitt die verbleibende Quadratsumme mit der gesamten Quadratsumme um den Mittelwert. Es zählt keine richtig klassifizierten Personen."
      ],
      "solution": "Die Gerade liefert für einen vorgegebenen X-Wert eine geschätzte Antwort beziehungsweise einen bedingten Mittelwert. Das Residuum ist die beobachtete Antwort minus diese Vorhersage und besitzt die Einheit von Y. R² beschreibt, welcher Anteil der Variation um den Gesamtmittelwert durch das angepasste lineare Modell statistisch erfasst wird. Es ist weder ein Anteil korrekter Personenprognosen noch ein Kausalitätsmaß. Ein großer Abstand zur Geraden kann zeigen, was das Modell nicht erfasst; eine gültige Antwort wird dadurch nicht falsch. Im Lehrlabor kann der hervorgehobene Fall die angepasste Gerade beeinflussen. Richtung und Ausmaß werden aus der tatsächlich gewählten Einstellung beschrieben.",
      "checks": [
        "Ich unterscheide beobachteten Wert, Vorhersage und vorzeichenbehaftetes Residuum.",
        "Meine Erklärung von R² bezieht sich auf Streuung, und ich behandle einen auffälligen Fall nicht automatisch als Datenfehler."
      ]
    },
    {
      "title": "Aus der R-Ausgabe eine konkrete Vorhersage bauen",
      "minutes": 25,
      "instructions": [
        "Führe das vollständige Modellskript aus und lies summary(fit). Zeige in linksrechts ~ interesse auf Zielvariable und Prädiktor. Übertrage den unstandardisierten Achsenabschnitt und die unstandardisierte Steigung B sowie R². Verwechsle B nicht mit einem standardisierten Koeffizienten.",
        "Öffne das bereits erzeugte Objekt modell im Datenbetrachter von RStudio. Wähle eine Zeile und notiere ihre beiden Werte. Berechne mit den abgelesenen Koeffizienten von Hand oder mit dem Taschenrechner ŷ = b₀ + b₁ × interesse und anschließend linksrechts − ŷ. Die angezeigten gerundeten Koeffizienten liefern eine entsprechend gerundete Vorhersage.",
        "Schreibe die Steigung in beiden Einheiten auf. Erkläre dein Residuum und R². Vergleiche dies mit dem Anfangsteil des Skripts: Interesse und Links-Rechts werden unabhängig gezogen. Begründe, warum eine geschätzte Gerade trotzdem eine von null verschiedene Steigung haben kann."
      ],
      "atlas": [
        {
          "id": "linear_regression",
          "prompt": "Welche Koeffizienten gehören in die Vorhersagegleichung?"
        },
        {
          "id": "prediction",
          "prompt": "Wie entsteht aus deinem gewählten Interessenwert eine vorhergesagte Position?"
        },
        {
          "id": "residuals",
          "prompt": "Was bedeutet der Abstand der gewählten Antwort von ihrer Vorhersage?"
        }
      ],
      "responsePrompt": "Berichte deine Geradengleichung, eine tatsächlich abgelesene Modellzeile, deren Vorhersage und Residuum sowie eine Interpretation von Steigung und R².",
      "hints": [
        "In diesem Modell bedeutet Interesse 1 niedrig und 5 hoch. Eine Erhöhung um einen Punkt verändert die vorhergesagte Links-Rechts-Position um B Skalenpunkte.",
        "Verwende den unstandardisierten Koeffizienten der Zeile interesse. Der Achsenabschnitt bei Interesse 0 ist ein mathematischer Bezugspunkt außerhalb der Modellskala, keine beobachtete Person."
      ],
      "solution": "Ein vollständiges Ergebnis verwendet die eigenen Koeffizienten: 'ŷ = … + … × Interesse'. Für eine wirklich abgelesene Zeile x = …, y = … folgt ŷ = … und e = y − ŷ = …. Die Steigung beschreibt die geschätzte Änderung der vorhergesagten Position je einem Interessenpunkt; ein positives Residuum bedeutet eine höhere beobachtete Position als vorhergesagt. R² beschreibt die erfasste Variation in dieser Modellstichprobe. Weil die Variablen unabhängig erzeugt wurden, ist kein systematischer Zusammenhang eingebaut. Endliche Zufallsdaten können trotzdem eine von null verschiedene Schätzung ergeben. Das Modell und die näherungsweise gleich behandelten Skalenabstände erlauben keine Aussage über eine reale Wirkung politischen Interesses.",
      "checks": [
        "Meine Vorhersage verwendet die unstandardisierten Koeffizienten und eine reale Zeile des erzeugten Modellobjekts; das Vorzeichen des Residuums stimmt.",
        "Ich erkläre die Einheiten und die umgekehrte Interessenkodierung gegenüber pa02a, ohne eine kausale Wirkung aus der Geraden abzuleiten."
      ]
    },
    {
      "title": "Prüfen, ob eine Gerade dem eigenen Projekt hilft",
      "minutes": 20,
      "instructions": [
        "Wähle aus deinem Projekt ein mögliches X/Y-Paar und formuliere, was eine Vorhersage inhaltlich bedeuten würde. Wenn deine Frage ausschließlich Kategorienanteile betrifft, begründe stattdessen, warum die einfache lineare Regression nicht dein nächster Schritt ist.",
        "Zeichne für das Paar mindestens zwei plausible Muster: eine Gerade und ein nichtlineares Muster, etwa höheres Interesse an beiden Enden der politischen Orientierung. Vergleiche beide mit den bisherigen Verteilungen oder Kreuztabellen deines Projekts; markiere, welche Behauptung du noch nicht prüfen konntest.",
        "Verfasse einen kurzen Modellentscheid. Benenne die benötigte Kodierung, gegebenenfalls die metrische Näherung und eine mögliche Drittvariable. Unterscheide eine Beschreibung vorhandener Antworten von einer verlässlich geprüften Vorhersage für neue Personen oder einer Kausalerklärung."
      ],
      "atlas": [
        {
          "id": "linear_regression",
          "prompt": "Welche Form von Zusammenhang würde eine einzelne Gerade zulassen?"
        },
        {
          "id": "explained_variance",
          "prompt": "Reicht eine Anpassungskennzahl in den vorhandenen Daten für deine Aussage?"
        },
        {
          "id": "causality",
          "prompt": "Was müsste zusätzlich bekannt sein, um von Wirkung sprechen zu können?"
        }
      ],
      "responsePrompt": "Notiere ein mögliches Vorhersageziel, zwei Skizzen und eine Entscheidung für oder gegen eine Gerade mit drei ausdrücklich genannten Grenzen.",
      "hints": [
        "Im ALLBUS läuft pa02a von starkem zu geringem Interesse; im Modellskript läuft interesse von niedrig nach hoch. Übertrage das Vorzeichen nie ohne die Kodierung.",
        "Selbst ein hohes R² beweist weder eine Ursache noch gute Vorhersagen außerhalb der vorhandenen Daten. Eine nachvollziehbare Entscheidung gegen die Gerade ist eine gültige Lösung."
      ],
      "solution": "Eine passende Antwort lautet etwa: 'Für … könnte ich … aus … vorhersagen. Eine Gerade würde … voraussetzen. Ein ebenfalls plausibles Muster wäre …. Deshalb verwende ich zunächst … beziehungsweise prüfe vor einer Regression ….' Bei politischen Skalen werden die gleich behandelten Abstände benannt. Bei Interesse und Links-Rechts gehört ein mögliches nichtmonotones Muster in die Prüfung. Eine Drittvariable wie Bildung kann als zu prüfende Erklärung genannt werden, ohne ihren Einfluss als belegt auszugeben. Für einen Vergleich von Kategorienanteilen kann die Kreuztabelle weiterhin das passendere Werkzeug sein. Es werden keine zusätzlichen realen Regressionsergebnisse vorausgesetzt.",
      "checks": [
        "Meine Entscheidung nennt Variablen, Kodierungsrichtung und eine mögliche Abweichung von Linearität.",
        "Ich trenne die Anpassung an vorhandene Daten von Vorhersagegüte bei neuen Personen und von einer kausalen Erklärung."
      ]
    }
  ],
  "11": [
    {
      "title": "Die eigene Analyse an drei Schwachstellen prüfen",
      "minutes": 20,
      "instructions": [
        "Lege Projektsteckbrief, Variablenverzeichnis und bisherige Ausgabe nebeneinander. Öffne fehlende Werte im Atlas. Verfolge für jede verwendete Variable, welche Antworten gültig sind und ob dein Nenner alle Fälle oder nur die gültigen Angaben umfasst. Markiere jede ungeklärte Sonderkodierung.",
        "Öffne Gewichte. Schreibe zu deiner bisherigen Darstellung ausdrücklich 'ungewichtet' oder die verwendete Gewichtungsvariable. Begründe, weshalb diese Wahl zur Frage passt, und trenne die gewichtete Beschreibung von einer vollständig designgerechten Unsicherheitsrechnung.",
        "Öffne Ausreißer und Einfluss. Suche keine Fälle zum beliebigen Löschen, sondern prüfe: Gibt es Werte außerhalb des gültigen Bereichs oder lediglich seltene, aber gültige Antworten? Formuliere eine vorab begründete Regel für den Umgang mit tatsächlichen Datenproblemen."
      ],
      "atlas": [
        {
          "id": "missing",
          "prompt": "Welche Fälle gehen in deine Aussage ein und welche fehlen warum?"
        },
        {
          "id": "weights",
          "prompt": "Welche Beschreibung soll die Gewichtung ermöglichen?"
        },
        {
          "id": "outliers_influence",
          "prompt": "Ist eine auffällige Antwort ungültig oder lediglich ungewöhnlich?"
        }
      ],
      "responsePrompt": "Erstelle ein Prüfprotokoll mit den drei Punkten gültige Angaben/Nenner, Gewichtung und auffällige Werte; notiere zu jedem einen geklärten Punkt oder konkreten offenen Auftrag.",
      "hints": [
        "Ein seltener gültiger Wert 10 auf pa01 ist nicht dasselbe wie ein negativer Missingcode. Die Grenze stammt aus dem Codebuch, nicht aus deinem bevorzugten Ergebnis.",
        "Bei mehreren Variablen kann die Zahl gültiger Antwortpaare kleiner sein als die Zahl gültiger Angaben jeder einzelnen Variable."
      ],
      "solution": "Ein gutes Protokoll benennt für jede Analyse den tatsächlichen gültigen Wertebereich, ihre Fallbasis und die Behandlung fehlender Angaben. Es dokumentiert die Gewichtungsentscheidung einschließlich ihrer Reichweite. Auffällige Antworten werden zuerst mit der Dokumentation verglichen; eine gültige politische Extremposition wird nicht gelöscht, nur weil sie eine Kennzahl verändert. Nicht alles muss schon gelöst sein. 'Die gültige Fallzahl für dieses Variablenpaar muss ich noch prüfen' ist präziser als eine unbegründete Vollständigkeitsbehauptung. Jede vorgesehene Änderung benötigt eine fachliche Regel, die nicht vom erwünschten Ergebnis abhängt.",
      "checks": [
        "Ich kann für meine zentrale Ausgabe erklären, welche Fälle und welche Gewichte verwendet wurden.",
        "Ich unterscheide ungültige Kodierungen von gültigen seltenen Antworten und nenne eine ergebnisunabhängige Umgangsregel."
      ]
    },
    {
      "title": "Eine Ausgabe reproduzieren und eine Alternative einordnen",
      "minutes": 25,
      "instructions": [
        "Führe den bestehenden Sitzungsbeginn mit ALLBUS und die ausführliche Kreuztabelle aus summary(crosstab(...)) aus. Nutze sie als Reproduktionsprobe: Woher stammen Zeilenvariable, Spaltenvariable und Prozentbasis? Überprüfe dieselben Angaben für die zentrale Ausgabe deines eigenen Projekts.",
        "Wähle genau eine fachlich begründete Vergleichsfrage. Für das vorbereitete Beispiel kannst du aus Sitzung 4 den bereits vorhandenen Aufruf mit Spaltenprozenten oder den mit wghtpew verwenden. Notiere vor dem Vergleich, ob du damit eine andere Bezugsfrage stellst oder eine andere Gewichtung derselben Beschreibung untersuchst.",
        "Vergleiche beide Ausgaben anhand eines konkret bezeichneten Tabellenfelds oder Satzes. Halte fest, was unverändert blieb und weshalb sich eine Zahl gegebenenfalls verändert. Wähle den Berichtsweg anhand deiner Frage, nicht anhand der auffälligeren Zahl; dokumentiere die Alternative auch ohne sichtbare Änderung."
      ],
      "atlas": [
        {
          "id": "codebook",
          "prompt": "Kannst du die verwendeten Variablen eindeutig auf ihre dokumentierten Fragen zurückführen?"
        },
        {
          "id": "crosstab",
          "prompt": "Welche Frage beantwortet jede Prozentbasis?"
        },
        {
          "id": "weights",
          "prompt": "Ändert sich die Bezugsgruppe oder die Gewichtung der Fälle?"
        }
      ],
      "responsePrompt": "Dokumentiere Originalweg, eine begründete Alternative, einen Vergleich mit deinen echten Ausgaben und die daraus folgende Berichtsentscheidung.",
      "hints": [
        "Zeilen- und Spaltenprozente beantworten unterschiedliche bedingte Fragen. Eine veränderte Prozentzahl ist dann nicht automatisch ein instabiles Ergebnis zur gleichen Frage.",
        "Verwende die bereits eingeführten Befehle aus Sitzung 4. Es ist nicht nötig, zusätzliche Tests auszuprobieren oder neue Variablen nach einem auffälligen Ergebnis zu durchsuchen."
      ],
      "solution": "Ein mögliches Protokoll lautet: 'Meine ursprüngliche Aussage bezieht sich auf …. Die Alternative verändert …. Im Feld … steht vorher … und danach …. Für meine Forschungsfrage berichte ich deshalb ….' Bei einem Wechsel der Prozentbasis muss die geänderte Bezugsgruppe ausdrücklich genannt werden; das ist keine bloße Robustheitsprüfung derselben Aussage. Bei Gewichtung bleibt die Frage erkennbar, aber Fälle tragen verschieden stark bei. Auch gleiche Zahlen können sachlich erklärbar sein. Eine gute Lösung berichtet den Vergleich offen und erfindet weder eine Veränderung noch einen besonderen Befund. Das Übungsbeispiel kann als Vorlage für eine vergleichbar klar dokumentierte Projektentscheidung dienen.",
      "checks": [
        "Ich habe genau eine begründete Alternative verglichen und dabei festgehalten, welche Frage beide Ausgaben jeweils beantworten.",
        "Meine Berichtsentscheidung folgt der Forschungsfrage; sie verschweigt weder eine Veränderung noch eine ausbleibende Veränderung."
      ]
    },
    {
      "title": "Den Projekttext einer Gegenprüfung unterziehen",
      "minutes": 20,
      "instructions": [
        "Schreibe einen Rohabsatz zu deiner eigenen Analyse: politische Frage, Datenquelle und Version, Variablen, gültige Fallbasis, Verfahren und eine zentrale Aussage. Verwende nur Zahlen, die du in deiner Ausgabe wiederfinden kannst.",
        "Lies den Absatz anschließend wie eine fremde Person. Öffne Operationalisierung und Kausalität im Atlas und markiere unklare Begriffe, verwechselte Kodierungsrichtungen oder Wörter wie 'bewirkt' und 'führt zu'. Tausche ihn optional mit einer anderen Person; die Selbstprüfung reicht aus.",
        "Überarbeite den Absatz. Ergänze mindestens eine konkrete Grenze und einen nachvollziehbaren nächsten Untersuchungsschritt. Lege daneben den Skriptabschnitt oder die Tabelle ab, die jede zentrale Zahl trägt; halte die begründete Alternative aus Aufgabe 2 fest."
      ],
      "atlas": [
        {
          "id": "operationalization",
          "prompt": "Deckt die tatsächlich gestellte Frage deinen verwendeten politischen Begriff ab?"
        },
        {
          "id": "causality",
          "prompt": "Ist die formulierte Erklärung durch das beobachtende Design gedeckt?"
        },
        {
          "id": "missing",
          "prompt": "Ist sichtbar, auf welchen gültigen Angaben die Aussage beruht?"
        }
      ],
      "responsePrompt": "Erstelle einen überprüfbaren Projektabsatz und markiere zwei überarbeitete Formulierungen mit kurzer Begründung.",
      "hints": [
        "'In den ausgewerteten gültigen Antworten …' ist etwas anderes als 'Alle Menschen in Deutschland …'. Wähle den Geltungsbereich, den deine Analyse tatsächlich trägt.",
        "Eine Grenze sollte konkret sein: etwa metrische Näherung, fehlende Antworten, ungeklärte Design-Inferenz oder eine nicht untersuchte Drittvariable."
      ],
      "solution": "Das Antwortgerüst lautet: 'Mit ALLBUScompact 2023, Version …, beschreibe ich …. Dafür nutze ich …; die Kodierung bedeutet …. Unter … gültigen Fällen zeigt die gewählte … Darstellung …. Die Auswertung ist … gewichtet. Sie beantwortet …, lässt aber … offen. Als nächsten Schritt würde ich … prüfen.' Der Wortlaut wird an die eigene Methode angepasst; bei einer reinen Beschreibung wird keine Testaussage ergänzt. Eine gute Überarbeitung ersetzt unbelegte Kausalität durch eine Beschreibung des beobachteten Musters und verbindet Grenzen mit konkreten Prüfaufträgen. Jede Zahl muss in der eigenen Rechnung auffindbar sein.",
      "checks": [
        "Alle Zahlen und Kodierungsrichtungen meines Texts lassen sich in dokumentierten Ausgaben überprüfen.",
        "Mein Absatz nennt mindestens eine konkrete Grenze und vermeidet einen unbelegten Bevölkerungs- oder Kausalschluss."
      ]
    }
  ],
  "12": [
    {
      "title": "Den eigenen Weg durch den Atlas erklären",
      "minutes": 20,
      "instructions": [
        "Wähle die eine politische Frage, die du abschließend beantworten möchtest. Öffne Operationalisierung und zeige, welche konkrete Frage beziehungsweise Antwortskala aus dem Datensatz deinen Begriff erfasst. Begründe in zwei Sätzen, warum diese Messung zu deiner Frage passt und was sie auslässt.",
        "Öffne Stichprobe und anschließend die für dein Projekt verwendeten Kennwerte oder Verfahren auf der Karte. Notiere einen eigenen Weg mit drei bis fünf Begriffen vom Datensatz zur Ergebnisdarstellung. Begründe die Schritte in Worten; eine sichtbare Linie allein ersetzt deine Begründung nicht.",
        "Öffne Kausalität und markiere die Grenze deines Weges: Welche Antwort ist durch deine Analyse gedeckt, welche weitergehende Behauptung nicht? Ergänze eine begründete Erklärung, weshalb du keine zusätzlichen Verfahren benötigst oder welcher Schritt für eine weitergehende Frage fehlt."
      ],
      "atlas": [
        {
          "id": "operationalization",
          "prompt": "Wie wird aus deinem politischen Begriff eine tatsächlich erhobene Antwort?"
        },
        {
          "id": "sampling",
          "prompt": "Für wen gilt die durch deine Analyse gestützte Aussage?"
        },
        {
          "id": "causality",
          "prompt": "Wo endet dein belegter Schluss und beginnt eine zusätzliche Erklärung?"
        }
      ],
      "responsePrompt": "Erstelle einen kommentierten Atlas-Weg mit drei bis fünf Begriffen und je einem Satz zu Messung, Datenbasis, Auswertung und Schlussgrenze.",
      "hints": [
        "Für eine Anteilsfrage kann ein sinnvoller Weg von Operationalisierung über gültige Fälle zu Häufigkeiten oder Kreuztabelle führen. Er muss nicht bis zur Regression reichen.",
        "Benenne bei einer geordneten Skala, ob du Kategorien beschreibst oder gleiche Abstände näherungsweise annimmst. Das sind unterschiedliche Entscheidungen."
      ],
      "solution": "Ein tragfähiger Atlas-Weg macht die tatsächliche Analyse nachvollziehbar: 'Ich messe … mit …; meine Datenbasis ist …; weil ich … wissen möchte, verwende ich …; daraus kann ich … schließen.' Die verwendeten Begriffe müssen zusammenpassen, aber nicht alle Verfahren des Kurses enthalten. Eine korrekt begründete Kreuztabelle kann den gesamten Weg tragen. Das Schlussglied nennt den Geltungsbereich und eine offene Frage, etwa Auswahl, Messung oder mögliche Drittvariablen. Die Karte dient als Erklärungshilfe, nicht als Beweis dafür, dass jeder räumlich benachbarte Knoten eine notwendige Voraussetzung ist.",
      "checks": [
        "Mein Atlas-Weg beschreibt meine tatsächliche Analyse und enthält keine nur zur Vollständigkeit angehängten Verfahren.",
        "Ich kann jede Verbindung in eigenen Worten begründen und die Grenze zwischen Beschreibung, Inferenz und Kausalerklärung zeigen."
      ]
    },
    {
      "title": "Die Analyse aus einem frischen Start reproduzieren",
      "minutes": 25,
      "instructions": [
        "Starte eine frische R-Sitzung und führe dein vollständiges Projektskript von oben nach unten aus. Wähle beim Import die selbst bezogene ALLBUS-Datei. Wenn ein Objekt fehlt, suche die erzeugende Zeile im Skript, statt ein Ergebnis aus einer früheren Sitzung manuell zu übernehmen.",
        "Führe anschließend die beiden vorbereiteten Befehle packageVersion('mariposa') und sessionInfo() aus. Übertrage Paket- und R-Version sowie Datenquelle und tatsächliche Datenversion in den Bericht. Dokumentiere deine Fallauswahl, Missing-Behandlung und Gewichtungsentscheidung.",
        "Vergleiche die neu erzeugte zentrale Tabelle oder Grafik mit deinem Bericht. Prüfe Werte, Beschriftungen, Prozentbasis und Kodierungsrichtung. Korrigiere jeden Widerspruch oder dokumentiere eine nachvollziehbare Versionsänderung. Gib als Anhang dein Skript und zulässige Ergebnisdarstellungen weiter, nicht ungeprüft die ALLBUS-Mikrodaten."
      ],
      "atlas": [
        {
          "id": "data_import",
          "prompt": "Welche Originalquelle und welche Einleseschritte erzeugen deine Datenbasis?"
        },
        {
          "id": "labels",
          "prompt": "Stimmen die lesbaren Beschriftungen mit den analysierten Codes überein?"
        },
        {
          "id": "data_export",
          "prompt": "Welche Ergebnisse und Analyseschritte müssen andere prüfen können?"
        }
      ],
      "responsePrompt": "Halte einen Reproduktionsvermerk fest: Datum, R-/Paketversion, Datenversion, erfolgreich erzeugte Hauptausgabe und behobene oder noch offene Abweichungen.",
      "hints": [
        "Der erfolgreiche Start aus einer leeren Sitzung zeigt, ob alle benötigten Objekte im Skript erzeugt werden. Eine gespeicherte Konsolenausgabe allein genügt dafür nicht.",
        "Die Softwareversion und die Datenversion sind verschiedene Angaben. Das Codebuch des Lernpfads bezieht sich auf ZA8831 v1.3.0; prüfe, welche Version du tatsächlich verwendest."
      ],
      "solution": "Eine vollständige Lösung lautet beispielsweise: 'Am … habe ich das Skript in einer frischen Sitzung mit R … und mariposa … ausgeführt. Die Daten stammen aus …, Version …. Die zentrale Ausgabe … wurde vollständig neu erzeugt und stimmt mit … überein; geändert beziehungsweise noch offen ist ….' Es wird kein bestimmter Versionswert erfunden. Der Anhang enthält den nachvollziehbaren Analyseweg und die verwendeten Entscheidungen. Andere beziehen die zugangsbeschränkten Originaldaten selbst entsprechend den GESIS-Bedingungen. Ein Fehler ist nicht das Scheitern der Aufgabe: Entscheidend ist, ihn zu lokalisieren, zu korrigieren oder nachvollziehbar als offen zu dokumentieren.",
      "checks": [
        "Meine Hauptausgabe lässt sich aus dem Skript in einer frischen Sitzung erzeugen, oder ich habe den konkreten verbleibenden Fehler dokumentiert.",
        "Bericht, Ausgabe, Beschriftungen und dokumentierte Daten-/Softwareversionen stimmen überein; ich verteile keine ungeprüften Rohdaten."
      ]
    },
    {
      "title": "Eine Aussage präsentieren und auf eine neue Frage übertragen",
      "minutes": 20,
      "instructions": [
        "Erkläre dein Projekt in höchstens drei Minuten als Selbstaufnahme, gegenüber einer freiwilligen Zuhörperson oder schriftlich in etwa 150 Wörtern. Zeige genau eine zentrale Darstellung und nenne Frage, Daten, begründeten Auswertungsweg, Ergebnis und eine Grenze.",
        "Bearbeite anschließend eine neue Frage ohne sofort weiterzurechnen: Wenn dein Projekt bisher Regionen verglichen hat, frage nach dem Zusammenhang von pa02a und pa01. Andernfalls frage nach der Verteilung der Interessenkategorien innerhalb von Ost und West. Notiere, welche Atlas-Bausteine und bereits eingeführten R-Aufrufe du wiederverwenden kannst.",
        "Öffne die passenden Atlas-Knoten und begründe, was sich durch die neue Frage ändert: Variablenrolle, Nenner, benötigtes Zusammenhangsmuster oder Voraussetzungen. Formuliere einen ersten Auswertungsschritt und eine Frage, die auch nach diesem Schritt offenbliebe. Neue Zahlen sind dafür nicht erforderlich."
      ],
      "atlas": [
        {
          "id": "crosstab",
          "prompt": "Welche Darstellung beantwortet die Verteilungsfrage innerhalb der Regionen?"
        },
        {
          "id": "spearman",
          "prompt": "Was kann ein Rangzusammenhang zwischen Interesse und Links-Rechts erfassen und was nicht?"
        },
        {
          "id": "causality",
          "prompt": "Welche weitere Erklärung ist durch beide Auswertungswege noch nicht belegt?"
        }
      ],
      "responsePrompt": "Gib deine kurze Ergebnisdarstellung sowie einen Transferplan mit wiederverwendbaren Bausteinen, erstem R-Schritt und einer verbleibenden Grenze ab.",
      "hints": [
        "Für Regionen × Interesse passt der bekannte crosstab-Aufruf mit Zeilenprozenten. Für zwei geordnete Angaben steht der Spearman-Aufruf aus Sitzung 5 bereit; prüfe dabei auch ein mögliches U-Muster.",
        "Ein Transfer besteht nicht darin, dieselbe Methode mit neuen Spalten zu starten. Begründe zuerst, welche Frage und welche Bedeutung der Codes sich ändern."
      ],
      "solution": "Die Präsentation beantwortet die eigene Frage mit tatsächlich berechneten Zahlen und einer passenden Darstellung. Ein Transferplan für Region × Interesse beginnt mit einer Kreuztabelle und klarer Prozentbasis. Ein Transferplan für pa02a × pa01 kann zunächst die Antwortkombinationen und anschließend eine monotone Rangassoziation betrachten. Dabei stehen höhere pa02a-Werte für weniger Interesse; ein Rangkorrelationswert nahe null schließt ein U-Muster nicht aus. Beide Wege verlangen keine erfundenen Ergebnisse. Die neue Frage kann einen anderen Nenner, andere Variableigenschaften oder weitere Designfragen mitbringen. Eine verbleibende Grenze ist zum Beispiel die fehlende Grundlage für eine Kausalaussage.",
      "checks": [
        "Meine Präsentation enthält eine überprüfbare Aussage mit begründetem Verfahren und konkreter Grenze.",
        "Mein Transferplan erklärt, was sich gegenüber dem Projekt ändert, und enthält einen passenden ersten Schritt ohne behauptete neue Befunde."
      ]
    }
  ]
};
