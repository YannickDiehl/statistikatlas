export type ConceptCategory = 'data' | 'operation' | 'summary' | 'relationship';

export interface Concept {
  id: string;
  title: string;
  short: string;
  explanation: string;
  formula?: string;
  category: ConceptCategory;
  boundary?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  kind: 'build' | 'condition' | 'optional';
}

// „boundary“ bezeichnet einen erklärten Ausgangspunkt dieses Ausschnitts.
// Die größere Seminarlandkarte kann diese Ausgangspunkte weiter auflösen.
export const concepts: Concept[] = [
  {
    id: 'series', title: 'Datenreihe', short: 'Ein Wert je Fall und Variable.',
    explanation: 'Eine Datenreihe enthält die beobachteten Werte einer Variable. Im Beispiel bilden die X-Werte eine Reihe und die Y-Werte eine zweite. Die Reihenfolge hält fest, welcher Wert zu welchem Fall gehört; sie ist keine Sortierung nach Größe.',
    formula: 'x₁, x₂, …, xₙ', category: 'data', boundary: true,
  },
  {
    id: 'pairs', title: 'Zusammengehörige Wertepaare', short: 'X und Y stammen jeweils vom selben Fall.',
    explanation: 'Jede Tabellenzeile enthält zwei Messwerte desselben Falls. Nur diese Zuordnung erlaubt die Untersuchung eines Zusammenhangs. Wer die beiden Spalten unabhängig sortiert, erzeugt andere Paare und kann damit die Korrelation verändern.',
    formula: '(xᵢ, yᵢ)', category: 'data', boundary: true,
  },
  {
    id: 'metric', title: 'Metrisches Skalenniveau', short: 'Gleiche Zahlenabstände bedeuten gleiche Merkmalsabstände.',
    explanation: 'Bei metrischen Messungen sind Abstände zwischen Werten inhaltlich interpretierbar. Dadurch sind Mittelwert, Varianz und die hier betrachtete Pearson-Korrelation sinnvoll einsetzbar. Eine bloße Nummerierung von Kategorien reicht dafür nicht aus.',
    category: 'data', boundary: true,
  },
  {
    id: 'count', title: 'Zählen', short: 'Bestimmen, wie viele Einträge vorliegen.',
    explanation: 'Beim Zählen erhält jeder berücksichtigte Eintrag genau eine Einheit. Für dieses Beispiel zählen wir vollständige Wertepaare, sodass X und Y in allen gemeinsamen Berechnungen dieselben Fälle verwenden.',
    category: 'operation', boundary: true,
  },
  {
    id: 'add', title: 'Addition', short: 'Werte zusammenzählen.',
    explanation: 'Addition fasst mehrere Zahlen zu einer Gesamtsumme zusammen. Die Zahlen müssen für eine inhaltlich sinnvolle Summe zusammenpassen: Stunden können beispielsweise mit Stunden addiert werden.',
    formula: 'a + b', category: 'operation', boundary: true,
  },
  {
    id: 'subtract', title: 'Subtraktion', short: 'Eine Differenz bilden.',
    explanation: 'Subtraktion bestimmt den gerichteten Abstand zwischen zwei Zahlen. Das Vorzeichen unterscheidet, ob der erste Wert über oder unter dem Vergleichswert liegt.',
    formula: 'a − b', category: 'operation', boundary: true,
  },
  {
    id: 'multiply', title: 'Multiplikation', short: 'Zwei Zahlen miteinander vervielfachen.',
    explanation: 'Multiplikation bildet ein Produkt. Zwei gleich gerichtete Abweichungen ergeben ein positives Produkt; eine positive und eine negative Abweichung ergeben ein negatives Produkt.',
    formula: 'a · b', category: 'operation', boundary: true,
  },
  {
    id: 'divide', title: 'Division', short: 'Eine Größe durch eine andere teilen.',
    explanation: 'Division setzt zwei Zahlen ins Verhältnis oder verteilt eine Gesamtsumme auf gleich große Anteile. Der Divisor darf nicht null sein.',
    formula: 'a / b, mit b ≠ 0', category: 'operation', boundary: true,
  },
  {
    id: 'square', title: 'Quadrieren', short: 'Eine Zahl mit sich selbst multiplizieren.',
    explanation: 'Das Quadrat einer reellen Zahl ist nie negativ. Gleich große positive und negative Abweichungen erhalten dadurch denselben Wert; große Abweichungen werden besonders stark gewichtet.',
    formula: 'a² = a · a', category: 'operation',
  },
  {
    id: 'sqrt', title: 'Quadratwurzel', short: 'Vom Quadrat zurück zur ursprünglichen Größenordnung.',
    explanation: 'Die Quadratwurzel einer nicht negativen Zahl ist die nicht negative Zahl, deren Quadrat den Ausgangswert ergibt. Bei der Varianz führt sie von quadrierten Einheiten zur ursprünglichen Einheit zurück.',
    formula: '√a · √a = a, mit a ≥ 0', category: 'operation', boundary: true,
  },
  {
    id: 'validn', title: 'Anzahl gültiger Wertepaare', short: 'n zählt die verwendeten Tabellenzeilen.',
    explanation: 'Der Umfang n zählt hier die vollständigen Wertepaare. Mittelwerte, Streuungen und Kovarianz beruhen deshalb auf denselben Fällen. In einem Datensatz mit fehlenden Angaben kann n kleiner als die Zahl aller erhobenen Fälle sein.',
    formula: 'n = Anzahl vollständiger Paare', category: 'summary',
  },
  {
    id: 'sum', title: 'Summe', short: 'Alle Werte einer Reihe addieren.',
    explanation: 'Die Summe addiert sämtliche berücksichtigten Werte einer Datenreihe. Das Summenzeichen Σ steht für diese wiederholte Addition. X und Y haben jeweils ihre eigene Summe.',
    formula: 'Σxᵢ = x₁ + x₂ + … + xₙ', category: 'summary',
  },
  {
    id: 'mean', title: 'Arithmetisches Mittel', short: 'Die Summe gleichmäßig auf n Werte verteilen.',
    explanation: 'Der Mittelwert teilt die Summe einer Datenreihe durch ihre Anzahl. Er ist ein Lagewert und reagiert auf die tatsächliche Größe aller Einzelwerte. Für X und Y berechnen wir je einen eigenen Mittelwert.',
    formula: 'x̄ = Σxᵢ / n', category: 'summary',
  },
  {
    id: 'deviation', title: 'Abweichung vom Mittelwert', short: 'Wie weit und auf welcher Seite des Mittels liegt ein Wert?',
    explanation: 'Eine Abweichung entsteht, indem der Mittelwert vom jeweiligen Einzelwert abgezogen wird. Positive Werte liegen über, negative unter dem Mittel. Über dieselbe Datenreihe summieren sich die Abweichungen zu null.',
    formula: 'dᵢ = xᵢ − x̄', category: 'summary',
  },
  {
    id: 'squared_deviation', title: 'Quadrierte Abweichung', short: 'Eine Abweichung ohne Vorzeichen, quadratisch gewichtet.',
    explanation: 'Eine quadrierte Abweichung ist das Quadrat eines einzelnen Abstands vom Mittelwert. Durch das Quadrieren können sich positive und negative Abweichungen beim späteren Summieren nicht gegenseitig aufheben.',
    formula: 'dᵢ² = (xᵢ − x̄)²', category: 'summary',
  },
  {
    id: 'ss', title: 'Quadratsumme der Abweichungen', short: 'Alle quadrierten Abweichungen zusammenfassen.',
    explanation: 'Die Quadratsumme addiert die quadrierten Abweichungen einer Datenreihe. Sie misst die gesamte quadratische Streuung um den Mittelwert. Noch ist sie nicht auf die Anzahl der Werte bezogen.',
    formula: 'SSₓ = Σ(xᵢ − x̄)²', category: 'summary',
  },
  {
    id: 'df', title: 'Freiheitsgrade der Streuung', short: 'Nach der Mittelwertschätzung bleiben n − 1 freie Abweichungen.',
    explanation: 'Die Abweichungen vom geschätzten Mittelwert müssen zusammen null ergeben. Sind n − 1 davon bekannt, steht die letzte fest. Deshalb verwenden die korrigierte Stichprobenvarianz und die Stichprobenkovarianz hier n − 1 im Nenner.',
    formula: 'df = n − 1', category: 'summary',
  },
  {
    id: 'variance', title: 'Korrigierte Stichprobenvarianz', short: 'Quadratsumme geteilt durch n − 1.',
    explanation: 'Die korrigierte Stichprobenvarianz setzt die Quadratsumme ins Verhältnis zu den Freiheitsgraden. Für unabhängige, gleich verteilte Beobachtungen mit endlicher Varianz schätzt sie die Populationsvarianz unverzerrt. Sie ist erst für n ≥ 2 definiert und trägt die quadrierte Einheit.',
    formula: 'sₓ² = SSₓ / (n − 1)', category: 'summary',
  },
  {
    id: 'sd', title: 'Standardabweichung', short: 'Streuung in derselben Einheit wie die Einzelwerte.',
    explanation: 'Die Standardabweichung ist die Quadratwurzel der Varianz. Sie beschreibt, wie stark Einzelwerte um den Mittelwert streuen, und besitzt wieder deren ursprüngliche Einheit. Hier verwenden wir durchgehend die korrigierte Stichprobenvarianz.',
    formula: 'sₓ = √sₓ²', category: 'summary',
  },
  {
    id: 'centering', title: 'Zentrierung am Mittelwert', short: 'Das Mittel der Reihe auf null verschieben.',
    explanation: 'Die Zentrierung zieht von allen Werten denselben Mittelwert ab. Sie erzeugt die Reihe der Abweichungen und verschiebt deren Mittelpunkt auf null. Die Abstände zwischen zwei Fällen und die Standardabweichung verändern sich dabei nicht.',
    formula: 'xᶜᵢ = xᵢ − x̄', category: 'operation',
  },
  {
    id: 'scaling', title: 'Skalierung durch Division', short: 'Alle Werte durch denselben positiven Maßstab teilen.',
    explanation: 'Diese Skalierung teilt alle Werte durch dieselbe positive Zahl a. Die numerischen Abstände ändern sich im Verhältnis 1/a; ihre Reihenfolge bleibt erhalten. Für die z-Standardisierung dient die Standardabweichung als Maßstab.',
    formula: 'x*ᵢ = xᵢ / a, mit a > 0', category: 'operation',
  },
  {
    id: 'positive_sd', title: 'Positive Standardabweichung', short: 'Die Datenreihe enthält mindestens zwei verschiedene Werte.',
    explanation: 'Bei einer konstanten Datenreihe ist die Standardabweichung null. Durch sie könnte nicht dividiert werden: z-Werte dieser Reihe und eine Pearson-Korrelation mit ihr sind daher nicht definiert. Für Pearson müssen beide Reihen streuen.',
    formula: 'sₓ > 0; für r zusätzlich sᵧ > 0', category: 'summary',
  },
  {
    id: 'z', title: 'z-Standardisierung', short: 'Den Abstand zum Mittel in Standardabweichungen ausdrücken.',
    explanation: 'Die z-Standardisierung verbindet Zentrierung und Skalierung: Ein z-Wert zeigt, wie viele Standardabweichungen ein Einzelwert über oder unter dem Mittel liegt. Mit unserer Konvention hat die z-Reihe Mittelwert null und korrigierte Standardabweichung eins. Standardisieren erzeugt keine Normalverteilung.',
    formula: 'zₓᵢ = (xᵢ − x̄) / sₓ', category: 'summary',
  },
  {
    id: 'crossproduct', title: 'Abweichungsprodukt', short: 'Die beiden Abweichungen eines Falls multiplizieren.',
    explanation: 'Das Abweichungsprodukt verknüpft die Abweichung von X mit der Abweichung von Y desselben Falls. Es ist positiv, wenn beide Werte auf derselben Seite ihrer jeweiligen Mittelwerte liegen, und negativ, wenn sie auf entgegengesetzten Seiten liegen.',
    formula: 'pᵢ = (xᵢ − x̄)(yᵢ − ȳ)', category: 'relationship',
  },
  {
    id: 'crossproduct_sum', title: 'Summe der Abweichungsprodukte', short: 'Gemeinsame Abweichungen über alle Paare zusammenfassen.',
    explanation: 'Die Summe der Abweichungsprodukte addiert die Produkte aller zusammengehörigen Wertepaare. Gleich gerichtete Abweichungen erhöhen sie, entgegengesetzte senken sie. Ihr Wert hängt noch von den Einheiten und vom Umfang der Daten ab.',
    formula: 'SPₓᵧ = Σ(xᵢ − x̄)(yᵢ − ȳ)', category: 'relationship',
  },
  {
    id: 'covariance', title: 'Stichprobenkovarianz', short: 'Gemeinsame Streuung, bezogen auf n − 1.',
    explanation: 'Die Stichprobenkovarianz teilt die Summe der Abweichungsprodukte durch n − 1. Ihr Vorzeichen beschreibt die Richtung gemeinsamer Abweichungen. Ihr Betrag hängt von den Maßeinheiten beider Variablen ab und ist deshalb kein einheitenfreies Maß der Zusammenhangsstärke.',
    formula: 'sₓᵧ = SPₓᵧ / (n − 1)', category: 'relationship',
  },
  {
    id: 'sd_product', title: 'Produkt der Standardabweichungen', short: 'Die beiden Streuungsmaßstäbe gemeinsam berücksichtigen.',
    explanation: 'Dieses Produkt multipliziert die Standardabweichung von X mit der von Y. Es hat dieselbe Einheit wie die Kovarianz. Teilen wir die Kovarianz durch dieses Produkt, kürzen sich die Einheiten heraus.',
    formula: 'sₓ · sᵧ', category: 'relationship',
  },
  {
    id: 'linear', title: 'Linearer Zusammenhang', short: 'Ein Zusammenhang, den eine Gerade beschreibt.',
    explanation: 'Bei einem linearen Zusammenhang lässt sich die mittlere Veränderung von Y durch eine Gerade in Abhängigkeit von X beschreiben. Pearson erfasst diese lineare Komponente. Ein r nahe null kann bei einem starken gekrümmten Zusammenhang auftreten; zur Einordnung gehört daher der Blick auf die Wertepaare.',
    category: 'relationship',
  },
  {
    id: 'pearson', title: 'Pearson-Korrelation', short: 'Richtung und Stärke des linearen Zusammenhangs.',
    explanation: 'Pearsons r standardisiert die Kovarianz mit beiden Standardabweichungen. Es liegt zwischen −1 und +1; das Vorzeichen gibt die Richtung an und der Betrag die Stärke des linearen Zusammenhangs. Für die Berechnung ist keine Normalverteilung erforderlich. Korrelation belegt keine Ursache-Wirkungs-Beziehung.',
    formula: 'r = sₓᵧ / (sₓ · sᵧ) = Σ(zₓᵢ zᵧᵢ) / (n − 1)', category: 'relationship',
  },
];

const edge = (source: string, target: string, label: string, kind: Edge['kind'] = 'build'): Edge => ({
  id: `${source}--${target}`, source, target, label, kind,
});

export const connections: Edge[] = [
  edge('pairs', 'series', 'liefert je eine X- und Y-Reihe'),
  edge('pairs', 'validn', 'bestimmt die berücksichtigten Fälle'),
  edge('count', 'validn', 'zählt vollständige Paare'),
  edge('multiply', 'square', 'multipliziert eine Zahl mit sich selbst'),
  edge('series', 'sum', 'liefert die Einzelwerte'),
  edge('add', 'sum', 'addiert alle Einzelwerte'),
  edge('sum', 'mean', 'liefert die Gesamtsumme'),
  edge('validn', 'mean', 'liefert den Divisor n'),
  edge('divide', 'mean', 'verteilt die Summe auf n Werte'),
  edge('metric', 'mean', 'macht Zahlenabstände interpretierbar', 'condition'),
  edge('series', 'deviation', 'liefert den jeweiligen Einzelwert'),
  edge('mean', 'deviation', 'liefert den Bezugspunkt'),
  edge('subtract', 'deviation', 'bildet Einzelwert minus Mittelwert'),
  edge('deviation', 'squared_deviation', 'liefert die gerichtete Abweichung'),
  edge('square', 'squared_deviation', 'entfernt das Vorzeichen durch Quadrieren'),
  edge('squared_deviation', 'ss', 'liefert alle quadrierten Abweichungen'),
  edge('add', 'ss', 'addiert die quadrierten Abweichungen'),
  edge('validn', 'df', 'liefert den Umfang n'),
  edge('subtract', 'df', 'zieht einen Freiheitsgrad ab'),
  edge('mean', 'df', 'bindet einen Freiheitsgrad'),
  edge('ss', 'variance', 'liefert die gesamte quadratische Streuung'),
  edge('df', 'variance', 'liefert den Nenner n − 1'),
  edge('divide', 'variance', 'teilt Quadratsumme durch Freiheitsgrade'),
  edge('variance', 'sd', 'liefert die quadrierte Streuung'),
  edge('sqrt', 'sd', 'führt zur ursprünglichen Einheit zurück'),
  edge('deviation', 'centering', 'wendet dieselbe Abweichungsbildung auf alle Fälle an'),
  edge('series', 'scaling', 'liefert die zu skalierenden Werte'),
  edge('divide', 'scaling', 'teilt durch denselben positiven Maßstab'),
  edge('sd', 'positive_sd', 'prüft, ob die Reihe tatsächlich streut'),
  edge('centering', 'z', 'verschiebt das Mittel auf null'),
  edge('scaling', 'z', 'teilt die zentrierten Werte durch s'),
  edge('sd', 'z', 'liefert den Streuungsmaßstab s'),
  edge('positive_sd', 'z', 'verhindert Division durch null', 'condition'),
  edge('pairs', 'crossproduct', 'hält X und Y desselben Falls zusammen'),
  edge('deviation', 'crossproduct', 'liefert die Abweichungen von X und Y'),
  edge('multiply', 'crossproduct', 'verknüpft die beiden Abweichungen'),
  edge('crossproduct', 'crossproduct_sum', 'liefert ein Produkt je Wertepaar'),
  edge('add', 'crossproduct_sum', 'addiert alle Abweichungsprodukte'),
  edge('crossproduct_sum', 'covariance', 'liefert die gemeinsame Gesamtabweichung'),
  edge('df', 'covariance', 'liefert den Nenner n − 1'),
  edge('divide', 'covariance', 'teilt Produktsumme durch Freiheitsgrade'),
  edge('sd', 'sd_product', 'liefert die Streuungen von X und Y'),
  edge('multiply', 'sd_product', 'multipliziert beide Standardabweichungen'),
  edge('pairs', 'linear', 'lässt die Form des Zusammenhangs erkennen'),
  edge('covariance', 'pearson', 'liefert die gemeinsame Streuung'),
  edge('sd_product', 'pearson', 'liefert den einheitenbereinigenden Nenner'),
  edge('divide', 'pearson', 'standardisiert die Kovarianz'),
  edge('positive_sd', 'pearson', 'beide Reihen müssen streuen', 'condition'),
  edge('linear', 'pearson', 'ordnet ein, welche Zusammenhangsform r beschreibt', 'optional'),
  edge('z', 'pearson', 'ermöglicht den äquivalenten Rechenweg über z-Produkte', 'optional'),
  edge('multiply', 'pearson', 'multipliziert je zwei z-Werte im alternativen Weg', 'optional'),
  edge('add', 'pearson', 'summiert z-Produkte im alternativen Weg', 'optional'),
  edge('df', 'pearson', 'liefert n − 1 im alternativen Weg', 'optional'),
];

export const conceptById: Record<string, Concept> = Object.fromEntries(
  concepts.map((concept) => [concept.id, concept]),
);
