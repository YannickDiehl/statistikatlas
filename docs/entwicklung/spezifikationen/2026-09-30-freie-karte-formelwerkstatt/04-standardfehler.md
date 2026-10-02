# Vorlage „Formel als Satz“: Standardfehler (Stufe 2)

Begriff: `se` („Standardfehler“, Eintrag im mariposa-Katalog, dargestellt im `PackageInspector`). Grundlage ist der gebilligte Entwurf „stufe2_standardfehler_ausfuehrlich“. Diese Datei ist zugleich das Muster für alle späteren Stufe-2-Begriffe.

Zahlen (ALLBUS 2023, aggregiert, ungewichtet): politisches Interesse `pa02a`, umgepolt (1 = überhaupt nicht, 5 = sehr stark), gültige n = 5.225, x̄ = 3,297 (angezeigt 3,30), s = 0,9395 (angezeigt 0,94), SE ≈ 0,013. Platzhalter: `{s}`, `{n}`, `{r}` = √n, `{se}`, `{lo}`/`{hi}` Intervallgrenzen x̄ ± 1,96 · SE.

## Aufbau

1. **Wofür?** Umfragen berichten Mittelwerte oft mit einem ±. Das politische Interesse liegt im ALLBUS 2023 im Mittel bei 3,30 (umgepolt: 1 = überhaupt nicht, 5 = sehr stark). Wie genau ist diese Zahl, wenn nur 5.225 von rund 70 Millionen Erwachsenen befragt wurden?
2. **Kennzahlen:** Mittelwert x̄ = 3,30; Standardfehler SE (mitlaufend).
3. **Die Zeichen** (Klick markiert Zeichen in Formel und Satz):

| Zeichen | Sprich | Fachbegriff | Einfach | Begriff |
|---|---|---|---|---|
| SE | „S E“ | Standardfehler | wie stark der Mittelwert von Stichprobe zu Stichprobe schwanken würde | `se` |
| s | „s“ | Standardabweichung | wie verschieden die Befragten antworten | `sd` |
| √ | „Wurzel“ | Quadratwurzel | welche Zahl ergibt mal sich selbst n? | `sqrt` |
| n | „n“ | Fallzahl | wie viele gültige Antworten es gibt | `validn` |

4. **Formel:** SE = s / √n, vorlesbar „S E gleich s geteilt durch Wurzel aus n“. Darunter eingesetzt: SE = {s} / √{n} = {s} / {r} ≈ {se}. Die Zeichen sind in beiden Zeilen gekoppelt.
5. **Kurz gesagt:** Der Standardfehler sagt, wie genau ein Mittelwert aus einer Stichprobe ist. Je kleiner, desto genauer. **Fachlich:** die geschätzte Standardabweichung der Stichprobenverteilung des Mittelwerts.
6. **Als Satz gelesen:** „Der [Standardfehler] ist [die Standardabweichung der Antworten], geteilt durch [die Quadratwurzel] aus [der Fallzahl].“ Die Klammerteile sind mit den Zeichen gekoppelt.
7. **Vorgerechnet:**
   - Schritt 1, Quadratwurzel der Fallzahl: √{n} ≈ {r}. Probe: {r} · {r} ≈ {n}.
   - Schritt 2, Standardabweichung durch diese Zahl teilen: {s} / {r} ≈ {se}.
   - Schritt 3, Einheit prüfen: Das Ergebnis hat die Einheit der Daten: {se} Punkte auf der Interesse-Skala.
8. **Typischer Fehler:** Standardabweichung und Standardfehler verwechseln. s beschreibt, wie verschieden die Befragten sind, und wird mit mehr Befragten nicht kleiner. SE beschreibt, wie genau der Mittelwert ist, und schrumpft mit mehr Befragten.
9. **Ein Regler je Zeichen:** s von 0,2 bis 2 (Schritt 0,02); n logarithmisch von 10 bis 40.000. Knöpfe „n mal 4“, „n durch 4“, „ALLBUS-Werte“. Zeile darunter: „s bleibt bei mehr Befragten gleich, SE schrumpft. Hier: s = {s}, SE ≈ {se}.“
10. **Kurz prüfen:** „Wie groß ist der Standardfehler bei s = 1 und n = 100?“ Soll 0,1 (Toleranz 0,0011). Richtig: „Stimmt: 1 / √100 = 1 / 10 = 0,1.“ Diagnosen: 0,01 → „Du hast durch n geteilt. Geteilt wird durch √n, also durch 10.“; 10 → „Umgekehrt: s wird durch √n geteilt, nicht √n durch s.“; 1 → „Das ist noch s selbst. Es fehlt das Teilen durch √n.“; sonst → „Erst √100 ausrechnen, dann s durch dieses Ergebnis teilen.“
11. **Was heißt das Ergebnis?**
    - Kurz gesagt, SE < 0,05: „Der Mittelwert aus {n} Befragten ist sehr genau. Eine andere Zufallsstichprobe gleicher Größe läge fast immer höchstens etwa {1,96 · se} Punkte daneben.“ Sonst: „Mit {n} Befragten ist der Mittelwert noch recht ungenau. Eine andere Zufallsstichprobe könnte bis zu etwa {1,96 · se} Punkte daneben liegen.“
    - Fachlich: „SE ≈ {se}. Das 95-%-Konfidenzintervall reicht von x̄ − 1,96 · SE bis x̄ + 1,96 · SE, hier von {lo} bis {hi}. Bei wiederholten Zufallsstichproben würden etwa 95 % solcher Intervalle den wahren Mittelwert enthalten.“ (Referenz mit ALLBUS-Werten: 3,27 bis 3,32.)
12. **Denkfrage:** „Du willst den Standardfehler halbieren. Wie viele Befragte brauchst du?“ doppelt so viele / viermal so viele / zehnmal so viele → viermal so viele. Erklärung: Die Fallzahl steht unter der Wurzel: √(4 · n) = 2 · √n. Viermal so viele Befragte teilen den Standardfehler nur durch 2. Kurz gesagt: Doppelte Genauigkeit kostet vierfache Fallzahl. Hinweis: „Probiere oben ‚n mal 4‘.“
13. **Genau genommen:** Kurz gesagt: Die Formel gilt für reine Zufallsstichproben. Beim ALLBUS ist der echte Standardfehler etwas größer. Dann: s / √n gilt für einfache Zufallsstichproben unabhängiger Personen. Der ALLBUS zieht zuerst Gemeinden und darin Personen. Befragte aus derselben Gemeinde ähneln sich etwas, deshalb ist der tatsächliche Standardfehler etwas größer (Designeffekt). Außerdem wird Ostdeutschland überproportional befragt; für Aussagen über ganz Deutschland wird gewichtet. s ist selbst aus der Stichprobe geschätzt; bei kleinen Stichproben nimmt man für das Intervall deshalb die t-Verteilung statt 1,96.

## Übergang im `PackageInspector`

Die Vorlage ersetzt für `se` die Einleitung (`intro`), den `PrincipleLab` „se“ und den Abschnitt „Was sagt das Ergebnis?“. Die vorhandenen Notizen bleiben unter „Voraussetzungen & Einordnung“: „Diese Formel gilt für den ungewichteten Mittelwert unabhängiger, gleich verteilter Beobachtungen.“ und „Bei Gewichten, Abhängigkeiten oder Modellen muss der Standardfehler zum Schätzverfahren passen.“ R-Abschnitt (`w_se`), Quellen und Bezüge bleiben unverändert.

## Kompakt

Formel mit Zeichen, Kurz gesagt, Als Satz gelesen, Regler. Alles andere erscheint erst in „Ausführlich“.
