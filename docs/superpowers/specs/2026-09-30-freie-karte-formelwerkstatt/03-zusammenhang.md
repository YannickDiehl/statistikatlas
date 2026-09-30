# Werkstatt: Zusammenhang (Stufe 1)

Begriffe: `covariance` („Stichprobenkovarianz“, endet nach Schritt 5) und `pearson` („Pearson-Korrelation“, endet nach Schritt 6). Schrittkarten für `deviation` (2, wenn man aus dieser Werkstatt kommt), `crossproduct` (3), `crossproduct_sum` (4), `sd_product` (6). Neu gegenüber den gezeigten Entwürfen; das Bild überträgt die Quadrate der Streuung auf Rechtecke.

Platzhalter: `{P}` gewählte Person, `{x}`/`{y}` ihre Werte, `{dx}`/`{dy}` ihre Abweichungen mit Vorzeichen, `{(dx)}`/`{(dy)}` negativ in Klammern, `{p}` ihr Abweichungsprodukt, `{mx}`/`{my}` Mittelwerte, `{P+}`/`{P−}` Summe der positiven/negativen Produkte, `{C}` Summe der Produkte, `{cov}`, `{sx}`, `{sy}`, `{sxy}` = sₓ · sᵧ, `{r}`.

## Kopf

- **Wofür?** Vertraut, wer dem Bundestag vertraut, auch eher der Bundesregierung? Fünf Beispielpersonen beantworten zwei ALLBUS-Fragen auf einer Skala von 1 (gar kein Vertrauen) bis 7 (großes Vertrauen). Die Formel fragt: Liegen die beiden Antworten einer Person meist auf derselben Seite ihres Durchschnitts?
- **Kennzahlen:** Kovarianz sₓᵧ; bei `pearson` zusätzlich r.
- **Kurz gesagt (covariance):** Die Kovarianz sagt, ob zwei Merkmale gemeinsam über oder unter ihrem Durchschnitt liegen: positiv heißt gleichläufig, negativ gegenläufig.
- **Fachlich (covariance):** die Summe der Abweichungsprodukte geteilt durch n − 1.
- **Kurz gesagt (pearson):** r sagt, wie eng die Punkte an einer Geraden liegen, von −1 (perfekt gegenläufig) über 0 bis +1 (perfekt gleichläufig).
- **Fachlich (pearson):** die Kovarianz geteilt durch das Produkt der beiden Standardabweichungen.
- **Formel (covariance):** sₓᵧ = Σ(xᵢ − x̄)(yᵢ − ȳ) / (n − 1). Vorlesbar: „s x y gleich Summe über alle Personen i von: x i minus x quer, mal y i minus y quer, geteilt durch n minus 1“.
- **Formel (pearson):** r = sₓᵧ / (sₓ · sᵧ), in der Werkstatt ausgeschrieben als Bruch mit der Kovarianzformel im Zähler. Vorlesbar: „r gleich s x y geteilt durch s x mal s y“.
- **Voreinstellungen:** gleichläufig x 2 3 4 5 6, y 2 5 3 6 4 (Start; x̄ = ȳ = 4, Produkte 4, −1, 0, 2, 0, Summe 5, Kovarianz 1,25, sₓ = sᵧ ≈ 1,58, sₓ · sᵧ = 2,5, r = 0,5); gegenläufig y 6 3 5 2 4 (Kovarianz −1,25, r = −0,5); gekrümmt y 5 3 2 3 5 (ȳ = 3,6, Kovarianz 0, r = 0).

## Die Zeichen

| Zeichen | Sprich | Fachbegriff | Einfach | Schritt |
|---|---|---|---|---|
| x̄, ȳ | „x quer, y quer“ | Mittelwerte | die Mitte jeder Frage | 1 |
| xᵢ, yᵢ | „x i, y i“ | Beobachtungen, zusammengehöriges Wertepaar | die beiden Antworten von Person i | 2 |
| ( ) · ( ) | „mal“ | Abweichungsprodukt | die beiden Abweichungen malnehmen | 3 |
| Σ | „Sigma“ | Summenzeichen | alles addieren, jede Person einmal | 4 |
| n − 1 | „n minus eins“ | Freiheitsgrade | eins weniger als Personen | 5 |
| sₓᵧ | „s x y“ | Stichprobenkovarianz | das typische Rechteck | 5 |
| sₓ, sᵧ | „s x, s y“ | Standardabweichungen | typische Abstände jeder Frage (Werkstatt Streuung) | 6 |
| r | „r“ | Pearson-Korrelation | Zusammenhang zwischen −1 und +1 | 6 |

## Schritte

### Schritt 1: x̄ und ȳ
- **Begriff:** `mean`, auch: Mittelwerte beider Variablen.
- **Kurz gesagt:** Wir suchen für beide Fragen die Mitte. Zusammen bilden die beiden Mitten ein Achsenkreuz.
- **Fachlich:** Die arithmetischen Mittel x̄ und ȳ sind die Bezugspunkte für die Abweichungen beider Variablen.
- **Vorgerechnet:** x̄ = (2 + 3 + 4 + 5 + 6) / 5 = {mx}; ȳ = (2 + 5 + 3 + 6 + 4) / 5 = {my}. Das Achsenkreuz liegt bei ({mx} | {my}).
- **Wie im Alltag:** Wie ein Fadenkreuz: Es teilt das Diagramm in vier Felder, rechts oben, links oben, links unten, rechts unten.
- **Warum?** Ob zwei Merkmale gemeinsam variieren, sieht man erst relativ zu ihren Mitten: Liegt jemand in beiden Fragen über oder unter dem Durchschnitt?
- **Typischer Fehler:** Nur eine Mitte berechnen. Die Kovarianz braucht beide.
- **Kurz prüfen:** „Wie groß ist ȳ?“ Diagnose: = Summe von y → „Das ist die Summe. Jetzt durch n = 5 teilen.“

### Schritt 2: xᵢ − x̄ und yᵢ − ȳ
- **Begriff:** `deviation` („Abweichung vom Mittelwert“), Zusatz: zwei je Person.
- **Kurz gesagt:** Für jede Person messen wir in beiden Fragen: Wie weit liegt sie von der Mitte weg, und auf welcher Seite?
- **Fachlich:** Je Person gibt es zwei Abweichungen vom Mittelwert, xᵢ − x̄ und yᵢ − ȳ, jeweils mit Vorzeichen. Beide gehören zu derselben Person (zusammengehöriges Wertepaar).
- **Vorgerechnet:** Person {P}: x = {x}, y = {y}. xᵢ − x̄ = {x} − {mx} = {dx}, yᵢ − ȳ = {y} − {my} = {dy}. {P} liegt beim Vertrauen in den Bundestag {über/unter/genau auf} dem Durchschnitt und bei der Bundesregierung {über/unter/genau auf} dem Durchschnitt.
- **Wie im Alltag:** Wie eine Adresse im Fadenkreuz: so weit nach links oder rechts, so weit nach unten oder oben.
- **Warum?** Die beiden Vorzeichen zeigen, in welchem der vier Felder eine Person liegt.
- **Typischer Fehler:** Abweichungen verschiedener Personen mischen, etwa nach getrenntem Sortieren der Spalten. Beide Abweichungen gehören zu derselben Person.
- **Kurz prüfen:** „Wie groß ist yᵢ − ȳ für Person {P}?“ Diagnose: = −dy → „Der Betrag stimmt, das Vorzeichen nicht. Rechne Wert minus Mittelwert: {y} − {my}.“; = dx → „Das ist die Abweichung in x. Gefragt ist y.“

### Schritt 3: ( ) · ( )
- **Begriff:** `crossproduct` („Abweichungsprodukt“).
- **Kurz gesagt:** Die beiden Abweichungen einer Person werden malgenommen. Das Ergebnis ist eine Rechteckfläche mit Vorzeichen.
- **Fachlich:** Das Abweichungsprodukt (xᵢ − x̄)(yᵢ − ȳ) ist positiv, wenn eine Person in beiden Variablen auf derselben Seite der Mitte liegt, und negativ, wenn sie auf verschiedenen Seiten liegt.
- **Vorgerechnet:** {P}: {(dx)} · {(dy)} = {p}. [p > 0:] Positiv: {P} liegt in beiden Fragen auf derselben Seite, das passt zu einem gleichläufigen Muster. [p < 0:] Negativ: {P} liegt auf verschiedenen Seiten, das spricht gegen ein gleichläufiges Muster. [p = 0:] Null: {P} liegt in einer Frage genau im Durchschnitt und trägt nichts bei. Im Bild: ein Rechteck mit den Seiten {|dx|} und {|dy|}.
- **Wie im Alltag:** Wie zwei Wetterfahnen: Zeigen beide in dieselbe Richtung, zählt das als Übereinstimmung, sonst als Widerspruch. Je stärker der Wind, desto mehr zählt es.
- **Warum?** Das Vorzeichen des Produkts sagt, ob diese Person zum gleichläufigen oder zum gegenläufigen Muster beiträgt, die Fläche, wie deutlich.
- **Typischer Fehler:** Die Vorzeichenregel vergessen: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus. Und: Das Abweichungsquadrat der Streuung ist der Sonderfall, in dem eine Variable mit sich selbst multipliziert wird.
- **Kurz prüfen:** „Wie groß ist das Abweichungsprodukt von Person {P}?“ Diagnosen: = −p (p ≠ 0) → „Vorzeichenregel: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus.“; = dx + dy → „Das ist die Summe der Abweichungen. Gefragt ist ihr Produkt.“

### Schritt 4: Σ
- **Begriff:** `crossproduct_sum` („Summe der Abweichungsprodukte“).
- **Kurz gesagt:** Alle Rechteckflächen werden verrechnet: Plusflächen gegen Minusflächen.
- **Fachlich:** Die Summe der Abweichungsprodukte fasst die gemeinsame Abweichung aller Personen zusammen.
- **Vorgerechnet:** 4 + (−1) + 0 + 2 + 0 = {C}. Plusflächen zusammen {P+}, Minusflächen {P−}. Die {Plus/Minus}flächen überwiegen.
- **Wie im Alltag:** Wie eine Abstimmung: Gleichläufige Personen stimmen für Plus, gegenläufige für Minus, und deutlichere Stimmen zählen mehr.
- **Warum?** Erst über alle Personen hinweg zeigt sich, welches Muster überwiegt.
- **Typischer Fehler:** Negative Produkte weglassen oder positiv zählen. Sie gehören mit ihrem Minus in die Summe.
- **Kurz prüfen:** „Wie groß ist die Summe der Abweichungsprodukte?“ Diagnosen: = Summe der Beträge → „Du hast die negativen Produkte positiv gezählt.“; = 0 bei C ≠ 0 → „0 ist die Summe der Abweichungen einer Variable. Gefragt ist die Summe der Produkte.“

### Schritt 5: ÷ (n − 1)
- **Begriff:** `covariance` („Stichprobenkovarianz“), Zeichen sₓᵧ.
- **Kurz gesagt:** Die Summe wird auf n − 1 verteilt. So groß ist ein typisches Rechteck.
- **Fachlich:** Die Summe der Abweichungsprodukte geteilt durch n − 1 ergibt die Stichprobenkovarianz sₓᵧ.
- **Vorgerechnet:** {C} / (5 − 1) = {cov}. Einheit: Vertrauenspunkte beim Bundestag mal Vertrauenspunkte bei der Bundesregierung.
- **Wie im Alltag:** Wie bei der Varianz: gerecht auf n − 1 Stücke verteilen.
- **Warum?** Teilen macht die Kovarianz unabhängig davon, wie viele Personen befragt wurden; n − 1 aus demselben Grund wie bei der Varianz.
- **Typischer Fehler:** Die Größe der Kovarianz als Stärke lesen. Sie hängt von den Einheiten ab: Misst man beide Fragen auf einer Skala von 10 bis 70, wird sie hundertmal so groß, ohne dass der Zusammenhang stärker wird.
- **Kurz prüfen:** „Wie groß ist die Kovarianz sₓᵧ?“ Diagnosen: = C/5 → „Du hast durch n = 5 geteilt. Die Formel teilt durch n − 1 = 4.“; = C → „Das ist noch die Summe. Es fehlt das Teilen durch n − 1.“

### Schritt 6: ÷ (sₓ · sᵧ) (nur `pearson`)
- **Begriff:** `pearson` („Pearson-Korrelation“); das Produkt im Nenner ist `sd_product` („Produkt der Standardabweichungen“).
- **Kurz gesagt:** Wir vergleichen das typische Rechteck mit dem größtmöglichen. So entsteht eine Zahl zwischen −1 und +1.
- **Fachlich:** Pearson-r ist die Kovarianz geteilt durch das Produkt der beiden Standardabweichungen. Das Ergebnis hat keine Einheit und liegt zwischen −1 und +1.
- **Vorgerechnet:** sₓ ≈ {sx} und sᵧ ≈ {sy} (je aus der Werkstatt Streuung), also sₓ · sᵧ ≈ {sxy}. r = {cov} / {sxy} = {r}.
- **Wie im Alltag:** Wie eine Prozentangabe: nicht wie viele Punkte, sondern welcher Anteil vom Höchstmöglichen.
- **Warum?** Die Kovarianz kann nie größer sein als sₓ · sᵧ. Teilt man durch diesen Höchstwert, verschwinden die Einheiten, und Zusammenhänge zwischen ganz verschiedenen Fragen werden vergleichbar.
- **Typischer Fehler:** r als Anteil der Personen lesen. r = 0,5 heißt nicht, dass die Hälfte übereinstimmt. Es beschreibt, wie eng die Punkte an einer steigenden Geraden liegen.
- **Kurz prüfen:** „Wie groß ist r?“ Diagnosen: = cov/(sx + sy) → „Im Nenner steht das Produkt sₓ · sᵧ, nicht die Summe.“; = cov/(sx² · sy²) → „Im Nenner stehen die Standardabweichungen, nicht die Varianzen.“; = cov → „Das ist noch die Kovarianz. Es fehlt das Teilen durch sₓ · sᵧ.“

## Rechentabelle

Spalten: Person | xᵢ | yᵢ (ab 1) | xᵢ − x̄ | yᵢ − ȳ (ab 2) | Produkt (ab 3). Summenzeile: Σxᵢ, Σyᵢ; Σ(xᵢ − x̄) = 0 und Σ(yᵢ − ȳ) = 0 „immer“ (ab 2); Summe der Produkte (ab 4). Zeilen darunter: x̄, ȳ; ab 5 sₓᵧ = {C} / 4 = {cov}; ab 6 sₓ, sᵧ, r. Negative Produkte stehen mit echtem Minuszeichen und in der Farbe für negative Beiträge.

## Bild: Rechtecke

Streudiagramm, beide Achsen 1–7, fünf ziehbare Punkte mit Buchstaben (Tastatur: Pfeiltasten links/rechts für x, oben/unten für y, Werte 1–7).
- Ab 1: Mittelwertlinien x̄ (senkrecht) und ȳ (waagerecht) als gestricheltes Achsenkreuz, Felder beschriftet „beide über dem Durchschnitt“ (rechts oben) und „beide darunter“ (links unten).
- Ab 2: für jede Person eine waagerechte Strecke zu x̄ und eine senkrechte zu ȳ mit Vorzeichen.
- Ab 3: das Rechteck zwischen Punkt und Achsenkreuz; rechts oben und links unten grün mit „+“, links oben und rechts unten braunrot mit „−“, Fläche als Zahl. Bildunterschrift: „Rechts oben und links unten: gleichläufig, Fläche zählt plus. Die anderen Felder zählen minus.“
- Ab 4: ein Waagebalken aus allen Plusflächen und allen Minusflächen, Unterschrift „Summe {C}“.
- Ab 5: das durchschnittliche Rechteck als Quadrat gleicher Fläche (Seite √|{cov}|), Unterschrift „{C} / 4 = {cov}“.
- Ab 6: das Rechteck sₓ · sᵧ gestrichelt daneben, das durchschnittliche Rechteck darin; Unterschrift „{cov} von höchstens {sxy}: r = {r}“.

## Was heißt das Ergebnis?

- **Kurz gesagt (covariance):** positiv: „Wer dem Bundestag mehr vertraut, vertraut in diesen fünf Beispielen eher auch der Bundesregierung.“ negativ: „…vertraut der Bundesregierung eher weniger.“ 0: „Ein gerades gemeinsames Muster ist nicht zu erkennen.“
- **Fachlich (covariance):** sₓᵧ = {cov}. Das Vorzeichen zeigt die Richtung. Die Größe ist ohne Einheiten schwer zu deuten, dafür gibt es Pearson-r (Link).
- **Kurz gesagt (pearson):** |r| < 0,1: „Kein gerader Zusammenhang.“ Sonst: „{Gleichläufig/Gegenläufig} und {schwach/mittel/stark}, aber kein perfekter Zusammenhang.“ (bei |r| = 1: „perfekt“).
- **Fachlich (pearson):** r = {r}. Nach der verbreiteten Faustregel von Cohen ist ein Betrag ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark. Bei nur fünf Personen ist r sehr unsicher; die Werkstatt zeigt die Rechnung, nicht einen Befund über Deutschland.

## Mit der Formel denken

1. **Du misst beide Fragen auf einer Skala von 10 bis 70 statt 1 bis 7 (alles mal 10). Was passiert?** beide werden zehnmal so groß / Kovarianz hundertmal so groß, r gleich / beide bleiben gleich → Kovarianz hundertmal so groß, r gleich. Schritt 6 (bei `covariance`: 5). Jede Abweichung wird zehnmal so groß, jedes Produkt hundertmal (10 · 10). sₓ und sᵧ werden je zehnmal so groß, ihr Produkt hundertmal; in r kürzt sich das weg. Kurz gesagt: r hängt nicht von der Einheit ab, die Kovarianz schon.
2. **Die Punkte liegen auf einem U. Wie groß ist r?** nahe 1 / 0 / negativ → 0. Schritt 4. Rechts und links liegen die Punkte oben, in der Mitte unten: Die Plus- und Minusrechtecke heben sich genau auf, die Summe ist 0. r misst nur den geraden (linearen) Anteil eines Zusammenhangs. Kurz gesagt: r = 0 heißt nicht, dass es keinen Zusammenhang gibt. Ausprobieren: gekrümmt.
3. **Eine Person liegt beim Vertrauen in den Bundestag genau im Durchschnitt. Was trägt sie zur Kovarianz bei?** etwas Positives / nichts / etwas Negatives → nichts. Schritt 3. Ihre Abweichung in x ist 0, das Rechteck hat keine Breite, das Produkt ist 0, egal wie weit sie in y abweicht. Kurz gesagt: Wer in einer Frage im Durchschnitt liegt, trägt nichts bei.
4. **Wer dem Bundestag mehr vertraut, vertraut der Regierung weniger. Welches Vorzeichen hat r?** positiv / negativ → negativ. Schritt 3. Die Punkte liegen dann vor allem links oben und rechts unten; dort sind die Rechtecke negativ. Kurz gesagt: Gegenläufig heißt Minus. Ausprobieren: gegenläufig.

Bei `covariance` bleibt Frage 1 gleich; der Teil über r ist dort ein Ausblick („r bliebe gleich“).

## Genau genommen

- **Kurz gesagt:** r beschreibt nur gerade Muster und sagt nichts darüber, was was verursacht.
- Es gibt einen zweiten Rechenweg mit demselben Ergebnis: beide Variablen z-standardisieren und r = Σzₓzᵧ / (n − 1) rechnen. Er ist über den Routenwähler im Abschnitt „Mit dem Lehrdatensatz“ erreichbar.
- Dass r zwischen −1 und +1 liegt, folgt aus |sₓᵧ| ≤ sₓ · sᵧ (Cauchy-Schwarz-Ungleichung). Gleichheit gilt nur, wenn alle Punkte exakt auf einer Geraden liegen.
- Einzelne auffällige Punkte können r stark verändern. Bei Ausreißern oder nur geordneten Kategorien ist die Spearman-Korrelation robuster.
- Die Vertrauensskalen hier wie metrische Skalen zu behandeln, ist eine Annahme.
- Ein Zusammenhang ist keine Ursache: Beides kann zum Beispiel von allgemeinem politischem Vertrauen abhängen (Begriff „Confounding“).
