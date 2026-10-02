// Begriffskarte „Kausalität: Was würde sich ändern?“: Lernzeit und Wissenstest im Lehrdatensatz hängen deutlich zusammen,
// eine Wirkung zeigt das allein nicht. R-Referenzwerte: b12-kategorial-design.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';

/** Lehrdatensatz: r(lernzeit, wissenstest) und Wissenstest bei Lernzeit über bzw. bis zum Median 7,6 h; P002 als Beispielperson. */
export const LERNEN = { r: 0.5391688537, median: 7.6, viel: 11.15151515, nViel: 99, wenig: 9.118811881, nWenig: 101, p002: { lernzeit: 8.3, wissenstest: 9 }, mitWb: 7.708536585, ohneWb: 7.781355932 } as const;
const L = LERNEN;

export const causality: ConceptCard = {
  concept: 'causality',
  wofuer: 'Wer in den letzten sieben Tagen mehr gelernt hat, löst im Wissenstest mehr Aufgaben. Würde also jede Person mehr Aufgaben lösen, wenn sie mehr lernte? Das ist eine kausale Frage, und sie ist schwerer zu beantworten, als der Zusammenhang vermuten lässt.',
  kurz: 'Kausalität fragt: Was würde sich ändern, wenn man eingreift? Ein Unterschied zwischen beobachteten Gruppen beantwortet das allein noch nicht.',
  stellDirVor: {
    text: `Im Lehrdatensatz hängen Lernzeit und Wissenstest deutlich zusammen: r = ${num(L.r)}. Die ${L.nViel} Befragten mit mehr als ${num(L.median)} Stunden Lernzeit lösen im Schnitt ${num(L.viel)} Aufgaben, die übrigen ${L.nWenig} nur ${num(L.wenig)}. Ob zusätzliche Lernstunden mehr gelöste Aufgaben bewirken würden, zeigen diese Zahlen aber nicht.`,
    figures: [
      { label: 'Korrelation r', value: num(L.r) },
      { label: `mehr als ${num(L.median)} h Lernzeit`, value: `${num(L.viel)} Aufgaben` },
      { label: `bis ${num(L.median)} h Lernzeit`, value: `${num(L.wenig)} Aufgaben` },
    ],
  },
  heisst: {
    sym: 'Y(1) − Y(0)', say: 'Y von 1 minus Y von 0',
    fach: 'Der kausale Effekt einer Handlung ist der Unterschied zwischen den potenziellen Ergebnissen Y(1) und Y(0) derselben Person unter zwei klar beschriebenen Bedingungen. Der durchschnittliche Effekt in einer Zielpopulation ist ATE = E[Y(1) − Y(0)].',
  },
  bausteine: [
    {
      title: 'Die Frage als Was-wäre-wenn stellen',
      was: 'Wir beschreiben zwei Bedingungen genau, etwa „drei Stunden mehr lernen“ und „wie bisher lernen“. Gefragt ist, wie sich das Testergebnis derselben Person unterschiede.',
      warum: 'Ohne genaue Handlung, Vergleich, Ergebnis und Zeitpunkt lässt sich eine Ursachenfrage nicht prüfen.',
      acht: '„Hat Lernzeit einen Einfluss?“ ist zu ungenau. Frag: Welche Änderung, für wen, mit welchem Ergebnis, zu welchem Zeitpunkt?',
    },
    {
      title: 'Sehen, was fehlt',
      was: 'Von jeder Person sehen wir nur ein Ergebnis: das unter der Bedingung, die sie tatsächlich erlebt hat. Das andere potenzielle Ergebnis bleibt unbeobachtet.',
      rechnung: `P002 hat ${num(L.p002.lernzeit)} Stunden gelernt und ${L.p002.wissenstest} Aufgaben gelöst. Wie viele es mit drei Stunden mehr gewesen wären, steht in keinem Datensatz.`,
      warum: 'Deshalb lässt sich ein kausaler Effekt nie an einer einzelnen Person ausrechnen. Man braucht Gruppen, die sich nur in der Bedingung unterscheiden.',
      acht: 'Der Vergleich mit anderen Personen ersetzt das fehlende Ergebnis nur, wenn diese Personen vergleichbar sind.',
    },
    {
      title: 'Vergleichbare Gruppen schaffen',
      was: 'Unterscheiden sich die Gruppen schon vorher, etwa in Motivation oder Vorwissen, mischt sich das in den Vergleich. Zufällige Zuweisung macht die Gruppen im Mittel vergleichbar.',
      warum: 'Dann hängt die Bedingung mit nichts zusammen, was die Personen mitbringen. Ein Unterschied im Ergebnis lässt sich der Bedingung zuschreiben.',
      acht: 'Auch bei Zufall können Gruppen in einer kleinen Stichprobe zufällig verschieden sein. Ein Test rechnet mit solchen Unterschieden.',
      concept: 'random_assignment',
    },
    {
      title: 'Gemeinsame Ursachen bedenken',
      was: 'Ohne zufällige Zuweisung musst du gemeinsame Ursachen messen und berücksichtigen. Welche das sind, begründest du mit Wissen über die Entstehung der Daten.',
      warum: 'Sonst hältst du einen Zusammenhang, den eine dritte Größe erzeugt, für eine Wirkung.',
      acht: 'Auch viele Kontrollvariablen garantieren keinen kausalen Schluss. Was niemand gemessen hat, bleibt unberücksichtigt.',
      concept: 'confounding',
    },
  ],
  ausprobieren: [
    {
      question: 'Kannst du ausrechnen, wie viele Aufgaben P002 mit drei Stunden mehr Lernzeit gelöst hätte?',
      options: ['ja, aus den Daten von P002', 'nein, dieses Ergebnis fehlt immer'], correct: 1, step: 2,
      explain: 'P002 hat nur eine Lernzeit erlebt. Das Ergebnis mit drei Stunden mehr ist unbeobachtet; schätzen lässt es sich nur über vergleichbare Gruppen.',
      kurz: 'Von jeder Person sieht man nur eine der beiden Welten.',
    },
    {
      question: `Befragte mit Weiterbildung lernen im Schnitt ${num(L.mitWb)} Stunden, die ohne ${num(L.ohneWb)}. Zeigt das, dass eine Weiterbildung nichts an der Lernzeit ändert?`,
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Wer eine Weiterbildung macht, hat sie selbst gewählt. Die Gruppen können sich in vielem unterscheiden, das auch mit der Lernzeit zusammenhängt; eine Wirkung könnte dadurch verdeckt sein.',
      kurz: 'Kein Unterschied ist noch kein Beleg für keine Wirkung.',
    },
    {
      question: 'Ein Kurs geht an alle, die sich anmelden. Danach lösen die Teilnehmenden mehr Aufgaben als die anderen. Wo liegt das Problem?',
      options: ['Die Gruppen haben sich selbst gebildet.', 'Die Stichprobe ist zu groß.', 'Es gibt kein Problem.'], correct: 0, step: 3,
      explain: 'Wer sich anmeldet, ist vielleicht motivierter oder lernt ohnehin mehr. Der Unterschied mischt den Kurs mit diesen Eigenschaften.',
      kurz: 'Selbstauswahl bringt Unterschiede mit, die schon vorher da waren.',
    },
  ],
  check: {
    question: 'Welcher Satz über Lernzeit und Wissenstest im Lehrdatensatz ist richtig?',
    options: [
      'Mehr Lernzeit bewirkt mehr gelöste Aufgaben, denn r = 0,54.',
      'Lernzeit und Wissenstest hängen zusammen; ob mehr Lernen mehr gelöste Aufgaben bewirkt, zeigt r allein nicht.',
      'Weil r so groß ist, kann es keine gemeinsame Ursache geben.',
      'Die Daten zeigen, dass Lernen nichts bewirkt.',
    ],
    correct: 1,
    right: 'Genau. r beschreibt einen Zusammenhang. Für eine Wirkung braucht es ein passendes Design oder begründete Annahmen.',
    diagnose: {
      0: 'Fast! Das ist der Schluss vom Zusammenhang auf die Wirkung. r zeigt nur, dass beides gemeinsam variiert.',
      2: 'Fast! Auch ein großer Zusammenhang kann ganz oder teilweise von einer gemeinsamen Ursache kommen.',
      3: 'Noch nicht ganz. Die Daten zeigen einen deutlichen Zusammenhang. Ob er eine Wirkung ist, lassen sie offen.',
    },
  },
  fuerDich: 'Wenn eine Studie schreibt, etwas „wirkt“, „führt zu“ oder „senkt“, prüf das Design: Wurde zufällig zugeteilt? Wenn nicht, welche gemeinsamen Ursachen wurden berücksichtigt? Beobachtungsdaten zeigen zunächst nur Zusammenhänge.',
  genau: {
    kurz: 'Kausale Schlüsse brauchen ein Design und begründete Annahmen. Die 200 Befragten des Atlas sind synthetisch und zeigen keine Wirkung realer Lernangebote.',
    paragraphs: [
      'Y(1) und Y(0) sind die potenziellen Ergebnisse derselben Person unter zwei Bedingungen. Beobachtet wird nur eines davon. Der durchschnittliche kausale Effekt ATE = E[Y(1) − Y(0)] bezieht sich auf eine festgelegte Zielpopulation.',
      'Für kausale Schlüsse aus Beobachtungsdaten braucht es Annahmen: Vergleichbarkeit der Gruppen nach Berücksichtigung gemessener Größen, klar definierte Bedingungen und genug Personen in jeder Bedingung (Überlappung).',
      'Im Lehrdatensatz hängen viele Spalten zusammen, weil der Atlas sie so erzeugt. Diese Zusammenhänge veranschaulichen Rechnungen; aus ihnen folgt keine Wirkung realer Lernangebote.',
    ],
  },
};

export const causalityTabs: ConceptTabs = {
  next: {
    next: { id: 'random_assignment', why: 'Der sicherste Weg zu vergleichbaren Gruppen: Der Zufall entscheidet, wer welche Bedingung bekommt.' },
    before: [
      { id: 'pearson', why: 'Misst einen Zusammenhang, der noch keine Wirkung belegt.' },
      { id: 'expectation', why: 'Der durchschnittliche Effekt ist ein Erwartungswert über die Zielpopulation.' },
    ],
    after: [{ id: 'confounding', why: 'Gemeinsame Ursachen, die einen Zusammenhang ohne Wirkung erzeugen.' }],
    more: [{ id: 'linear_regression', why: 'Schätzt Zusammenhänge unter Kontrolle weiterer Variablen, aber nicht von selbst Wirkungen.' }],
  },
};
