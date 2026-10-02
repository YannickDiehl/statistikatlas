/**
 * Allgemeine Codelegende für die R-Aufrufe des Atlas (Spezifikation Lehrdatensatz und R, Abschnitt 5.5):
 * Zu jedem antippbaren Zeichen Fachbegriff, Aussprache (wo nötig), „Kurz gesagt“ und ein typischer Fehler.
 * Die Fehlermeldungen sind die Meldungen von R (deutsch) und mariposa 0.7.4, in R nachgeprüft.
 * Schlüssel ist das Zeichen, wie es im Code steht (Funktionen ohne Klammern).
 */

/** Eine Lernkarte zu einem Zeichen im R-Code. Der Koordinator vereinheitlicht den Typ mit F1 (src/explain/types.ts). */
export interface TokenNote { sym: string; term: string; say?: string; kurz: string; fehler: string }

/**
 * Begriff der Karte, auf den ein Zeichen verweist. Der Fachbegriff (`term`) ist dann der Titel dieses Begriffs
 * (titleFor(ref(id))); die Lernkarte kann zum Begriff in der Karte führen.
 */
export const RTOKEN_CONCEPTS: Record<string, string> = {
  read_spss: 'data_import',
  rec: 'recode',
  as_factor: 'conversion',
  show: 'describe',
  weights: 'weights',
  use: 'missing',
  'na.rm': 'missing',
  'conf.level': 'confidence',
  mu: 'hypothesis',
  alternative: 'test_sides',
  'var.equal': 'variance_assumption',
  by: 'crosstab',
  cov: 'covariance',
  rank: 'ranks',
  p_adjust: 'multiplicity',
};

export const RTOKENS: Record<string, TokenNote> = {
  dplyr: {
    sym: 'dplyr', term: 'Paket dplyr',
    kurz: 'Ein Paket zum Umformen von Daten. Es bringt mutate(), summarise() und den Pipe-Operator %>% mit.',
    fehler: 'Ist dplyr nicht installiert, meldet R: es gibt kein Paket namens ‘dplyr’. Dann hilft einmalig install.packages("dplyr").',
  },
  mariposa: {
    sym: 'mariposa', term: 'Paket mariposa',
    kurz: 'Das Statistikpaket des Kurses: describe(), frequency(), t_test() und viele mehr, mit Ausgaben im Stil von SPSS.',
    fehler: 'Ist mariposa nicht installiert, meldet R: es gibt kein Paket namens ‘mariposa’. Ältere Versionen kennen nicht alle Regeln und Argumente; der Atlas rechnet mit mariposa 0.7.4.',
  },
  '"Statistikatlas-200-Befragte.sav"': {
    sym: '"Statistikatlas-200-Befragte.sav"', term: 'Dateiname',
    kurz: 'Der Name der heruntergeladenen Datei, in Anführungszeichen. R sucht sie im Arbeitsverzeichnis.',
    fehler: 'Hat der Browser die Datei umbenannt, etwa mit einer (1) am Ende, meldet mariposa: File \'Statistikatlas-200-Befragte.sav\' does not exist. Benenne die Datei um oder passe den Namen an.',
  },
  library: {
    sym: 'library()', term: 'Paket laden',
    kurz: 'Holt ein installiertes Paket in die laufende R-Sitzung. Erst danach kennt R dessen Funktionen.',
    fehler: 'Ist das Paket nicht installiert, meldet R: es gibt kein Paket namens ‘mariposa’. Dann hilft einmalig install.packages("mariposa").',
  },
  '<-': {
    sym: '<-', term: 'Zuweisung', say: 'bekommt',
    kurz: 'Speichert ein Ergebnis unter einem Namen. atlas <- read_spss(…) heißt: atlas bekommt die eingelesenen Daten.',
    fehler: 'Hast du die Zeile mit <- nicht ausgeführt, kennt R den Namen nicht und meldet: Objekt \'atlas\' nicht gefunden.',
  },
  read_spss: {
    sym: 'read_spss()', term: 'Daten nach R einlesen',
    kurz: 'Liest eine SPSS-Datei (.sav) mit Fragetexten und Antwortlabels ein. Fehlende Angaben bleiben als fehlend markiert.',
    fehler: 'Liegt die Datei nicht im Arbeitsverzeichnis, meldet R: File \'Statistikatlas-200-Befragte.sav\' does not exist. Lege Skript und Datei in denselben Ordner.',
  },
  '%>%': {
    sym: '%>%', term: 'Pipe-Operator', say: 'und dann',
    kurz: 'Gibt das Ergebnis links an die Funktion rechts weiter. atlas %>% describe(lernzeit) heißt: Nimm atlas und beschreibe dann die Lernzeit.',
    fehler: 'Fehlen library(dplyr) und library(mariposa), meldet R: konnte Funktion "%>%" nicht finden. Führe zuerst die library-Zeilen aus.',
  },
  mutate: {
    sym: 'mutate()', term: 'Neue Variable bilden',
    kurz: 'Legt eine Spalte neu an oder überschreibt sie. Links vom = steht der Name, rechts die Rechnung.',
    fehler: 'mutate() ändert atlas nur in diesem Aufruf. Willst du die Spalte behalten, speichere das Ergebnis: atlas <- atlas %>% mutate(…).',
  },
  rec: {
    sym: 'rec()', term: 'Rekodieren & Umpolen',
    kurz: 'Ordnet alten Codes neue Codes zu, nach einer Regel wie "1:2=1; 3:5=2". So fasst du Antworten zusammen oder drehst eine Skala um.',
    fehler: 'Gültige Codes ohne passende Regel werden NA, und mariposa warnt: matched no rule and became "NA". Mit else=copy behältst du sie.',
  },
  rules: {
    sym: 'rules =', term: 'Rekodierregel',
    kurz: 'Die Regel steht in Anführungszeichen: alter Code, Gleichheitszeichen, neuer Code. Mehrere Regeln trennt ein Semikolon.',
    fehler: 'Ohne rules weiß rec() nicht, was es tun soll, und mariposa meldet: `rules` is required.',
  },
  as_factor: {
    sym: 'as_factor =', term: 'Datentypen umwandeln',
    kurz: 'as_factor = TRUE macht aus den Codes einen Faktor mit den Antworttexten als Stufen. Regressionen bilden daraus Dummyvariablen.',
    fehler: 'Die alte Schreibweise mit Punkt gibt es nicht mehr. as.factor = TRUE ergibt: The `as.factor` argument was removed; schreibe as_factor.',
  },
  summary: {
    sym: 'summary()', term: 'Ausführliche Ausgabe',
    kurz: 'Zeigt zu einem gespeicherten Ergebnis die ausführliche Tabelle. Der Name allein zeigt die Kurzfassung.',
    fehler: 'summary() braucht ein gespeichertes Ergebnis. Steht summary(a) im Skript vor der Zeile a <- …, meldet R: Objekt \'a\' nicht gefunden.',
  },
  c: {
    sym: 'c()', term: 'Vektor bilden', say: 'combine',
    kurz: 'Fasst mehrere Werte zu einer Liste zusammen, etwa c("mean", "sd"). R behandelt sie dann als ein Argument.',
    fehler: 'Ohne c() hält R den zweiten Wert für eine weitere Variable: show = "mean", "sd" ergibt Column `sd` doesn\'t exist.',
  },
  show: {
    sym: 'show =', term: 'Deskriptiver Überblick',
    kurz: 'Wählt die Kennwerte, die describe() zeigt, etwa "mean", "sd", "var" oder "se". N und Missing stehen immer dabei.',
    fehler: 'Deutsche Namen kennt describe() nicht. show = "varianz" ergibt: Unknown `show` value; richtig ist "var".',
  },
  weights: {
    sym: 'weights =', term: 'Gewichte',
    kurz: 'Nennt die Spalte, die festlegt, wie stark jede Person zählt. Im ALLBUS heißt sie wghtpew.',
    fehler: 'Gibt es die Spalte nicht, meldet mariposa: Weights variable `gewicht` not found in data. Bilde sie vorher mit mutate().',
  },
  // Gilt für alle Aufrufe mit group = (t_test, oneway_anova, levene_test, mann_whitney, kruskal_wallis …); Besonderheiten
  // eines Tests (genau zwei Gruppen bei t_test) gehören in die Karte seines Reiters (IB29).
  group: {
    sym: 'group =', term: 'Gruppenvariable',
    kurz: 'Nennt die Spalte, die die Befragten in Gruppen teilt, etwa Weiterbildung Ja oder Nein oder die fünf Schulabschlüsse. Die Gruppennamen kommen aus den Labels der SPSS-Datei.',
    fehler: 'Schreib den Spaltennamen genau wie im Datensatz. Bei einem Tippfehler wie group = weiterbilding meldet mariposa: Column `weiterbilding` doesn\'t exist.',
  },
  use: {
    sym: 'use =', term: 'Fehlende Angaben',
    kurz: 'Legt fest, wer bei fehlenden Angaben mitzählt. "listwise" (bei efa() "complete") nimmt nur Personen mit allen Werten, "pairwise" je Paar alle mit beiden Werten.',
    fehler: 'Welche Wörter erlaubt sind, hängt von der Funktion ab. Ein Tippfehler wie use = "listweise" ergibt bei pearson_cor(): \'arg\' sollte eines von “pairwise”, “listwise” sein.',
  },
  'na.rm': {
    sym: 'na.rm =', term: 'Fehlende Angaben',
    kurz: 'na.rm = TRUE lässt fehlende Werte beim Rechnen weg. NA steht in R für einen fehlenden Wert.',
    fehler: 'Ohne na.rm = TRUE ergeben Funktionen wie mean() schon bei einem einzigen fehlenden Wert NA.',
  },
  'conf.level': {
    sym: 'conf.level =', term: 'Konfidenzintervall',
    kurz: 'Legt das Niveau des Konfidenzintervalls fest. .95 bedeutet 95 Prozent.',
    fehler: 'Das Niveau ist ein Anteil, keine Prozentzahl. conf.level = 95 ergibt bei pearson_cor(): `conf.level` must be between 0 and 1.',
  },
  // Gilt für t_test (eine Gruppe, Differenzen) und mann_whitney (Verschiebung), IB29.
  mu: {
    sym: 'mu =', term: 'Null- & Alternativhypothese', say: 'mü',
    kurz: 'Der Vergleichswert der Nullhypothese. mu = 7 prüft, ob der Mittelwert in der Grundgesamtheit 7 sein könnte; mu = 0 heißt bei Differenzen oder einer Verschiebung: kein Unterschied.',
    fehler: 'mu ist nicht dein Stichprobenmittelwert, sondern der Wert, gegen den du testest. Lege ihn vor der Analyse fest.',
  },
  alternative: {
    sym: 'alternative =', term: 'Einseitig & zweiseitig testen',
    kurz: 'Legt die Richtung des Tests fest: "two.sided", "less" oder "greater". Die Richtung entscheidest du vor dem Blick in die Daten.',
    fehler: 'Nur die englischen Wörter funktionieren. alternative = "kleiner" ergibt: \'arg\' sollte eines von “two.sided”, “less”, “greater” sein.',
  },
  'var.equal': {
    sym: 'var.equal =', term: 'Gleiche Fehlervarianz',
    kurz: 'TRUE rechnet den t-Test nach Student mit gleichen Varianzen, FALSE nach Welch. Welch ist die vorsichtigere Voreinstellung.',
    fehler: 'TRUE steht ohne Anführungszeichen. Mit var.equal = "TRUE" meldet R: ungültiger Argumenttyp.',
  },
  by: {
    sym: 'by =', term: 'Kreuztabelle',
    kurz: 'Kreuzt die Mehrfachantworten mit den Gruppen einer weiteren Variable. Das entspricht MULT RESPONSE mit BY in SPSS.',
    fehler: 'by braucht eine kategoriale Variable. Eine metrische Spalte ergibt eine eigene Gruppe für jeden Wert.',
  },
  summarise: {
    sym: 'summarise()', term: 'Kennwert berechnen',
    kurz: 'Berechnet aus allen Zeilen einen Wert und gibt eine kleine Tabelle zurück. Links vom = steht der Name der Ergebnisspalte.',
    fehler: 'Ohne Namen heißt die Ergebnisspalte wie die Rechnung, etwa `cov(lernzeit, wissenstest)`. Gib ihr einen Namen wie kovarianz = cov(…).',
  },
  cov: {
    sym: 'cov()', term: 'Kovarianz',
    kurz: 'Berechnet die Kovarianz zweier Spalten mit n − 1 im Nenner. mariposa hat dafür keine eigene Funktion, deshalb steht cov() in summarise().',
    fehler: 'cov() rechnet nur mit Zahlen. Mit der Textspalte id meldet R: is.numeric(y) || is.logical(y) ist nicht TRUE.',
  },
  rank: {
    sym: 'rank()', term: 'Ränge',
    kurz: 'Ersetzt jeden Wert durch seinen Platz in der Reihenfolge. Gleiche Werte teilen sich den mittleren Rang.',
    fehler: 'rank() in mutate() ersetzt die Werte nur in diesem Aufruf. atlas behält die Originalwerte, solange du nichts mit <- speicherst.',
  },
  'ties.method': {
    sym: 'ties.method =', term: 'Gleiche Werte (Bindungen)',
    kurz: '"average" gibt gleichen Werten den Mittelwert ihrer Rangplätze. So rechnen auch Spearman und die Rangtests.',
    fehler: 'Nur englische Namen funktionieren. ties.method = "mittel" ergibt: \'arg\' sollte eines von “average”, “first”, … sein.',
  },
  p_adjust: {
    sym: 'p_adjust =', term: 'Mehrere Vergleiche',
    kurz: 'Korrigiert die p-Werte, wenn viele Paare verglichen werden. "holm" ist eine übliche Wahl.',
    fehler: 'Ohne Korrektur steigt die Wahrscheinlichkeit, irgendwo zufällig einen Unterschied zu finden.',
  },
  suffix: {
    sym: 'suffix =', term: 'Namenszusatz',
    kurz: 'Hängt einen Zusatz an den Spaltennamen, etwa "_z" für lernzeit_z. So bleibt die Originalspalte erhalten.',
    fehler: 'Ohne suffix überschreibt die Funktion die Originalspalte im Ergebnis.',
  },
  pick: {
    sym: 'pick()', term: 'Spalten weitergeben',
    kurz: 'Gibt mehrere Spalten als kleine Tabelle an eine Funktion weiter. row_means(pick(methoden1, methoden2)) rechnet je Person über diese Spalten.',
    fehler: 'Ohne pick() bekommt row_means() keine Tabelle und meldet: `data` must be a data frame or tibble.',
  },
  pull: {
    sym: 'pull()', term: 'Spalte herausziehen',
    kurz: 'Holt eine Spalte als reine Zahlenreihe aus der Tabelle. Manche Funktionen wie na_frequencies() erwarten genau das.',
    fehler: 'Nach pull() gibt es keine Tabelle mehr. describe() meldet dann: `data` must be a data frame.',
  },
  head: {
    sym: 'head()', term: 'Anfang zeigen',
    kurz: 'Zeigt nur die ersten Werte, head(3) die ersten drei. Praktisch, wenn du nur hineinschauen willst.',
    fehler: 'head() kürzt nur die Anzeige. Gespeicherte Daten bleiben vollständig.',
  },
  select: {
    sym: 'select()', term: 'Spalten auswählen',
    kurz: 'Behält nur die genannten Spalten. Die Zeilen bleiben alle erhalten.',
    fehler: 'Ein Tippfehler im Namen ergibt: Can\'t select columns that don\'t exist.',
  },
  starts_with: {
    sym: 'starts_with()', term: 'Namensmuster',
    kurz: 'Wählt alle Spalten, deren Name so beginnt, etwa starts_with("schulabschluss_").',
    fehler: 'Passt keine Spalte zum Muster, ist die Auswahl leer, und R meldet keinen Fehler.',
  },
  filter: {
    sym: 'filter()', term: 'Fälle auswählen',
    kurz: 'Behält nur die Zeilen, auf die die Bedingung zutrifft, etwa filter(erwerbstaetig == 1).',
    fehler: 'In der Bedingung steht ==. Mit filter(erwerbstaetig = 1) meldet dplyr: you\'ve used `=` instead of `==`.',
  },
  '==': {
    sym: '==', term: 'Vergleich auf Gleichheit', say: 'ist gleich',
    kurz: 'Prüft, ob zwei Werte gleich sind, und liefert TRUE oder FALSE. Ein einzelnes = setzt dagegen ein Argument.',
    fehler: 'Ein einzelnes = in filter() ist ein häufiger Fehler. dplyr fragt dann: Did you mean `erwerbstaetig == 1`?',
  },
  '=': {
    sym: '=', term: 'Argument setzen',
    kurz: 'Gibt einem Argument einen Wert, etwa show = "mean". In mutate() und summarise() benennt es die neue Spalte.',
    fehler: 'Für Vergleiche brauchst du ==, nicht =.',
  },
  '~': {
    sym: '~', term: 'Modellformel', say: 'Tilde',
    kurz: 'Trennt die Zielvariable links von den erklärenden Variablen rechts. wissenstest ~ lernzeit + alter heißt: Wissenstest erklärt durch Lernzeit und Alter.',
    fehler: 'Links steht genau eine Zielvariable. Weitere Variablen kommen rechts dazu, verbunden mit +.',
  },
  TRUE: {
    sym: 'TRUE', term: 'Wahrheitswert',
    kurz: 'TRUE heißt ja, FALSE heißt nein. Beide stehen ohne Anführungszeichen und in Großbuchstaben.',
    fehler: 'true in Kleinbuchstaben kennt R nicht und meldet: Objekt \'true\' nicht gefunden.',
  },
  FALSE: {
    sym: 'FALSE', term: 'Wahrheitswert',
    kurz: 'FALSE heißt nein, TRUE heißt ja. Beide stehen ohne Anführungszeichen und in Großbuchstaben.',
    fehler: 'false in Kleinbuchstaben kennt R nicht und meldet: Objekt \'false\' nicht gefunden.',
  },
  predict: {
    sym: 'predict()', term: 'Vorhersage',
    kurz: 'Berechnet für jede Person den Wert, den das Modell erwartet. Beim Logitmodell liefert type = "response" Wahrscheinlichkeiten.',
    fehler: 'Ohne type = "response" zeigt das Logitmodell Logits statt Wahrscheinlichkeiten, also auch negative Zahlen.',
  },
};
