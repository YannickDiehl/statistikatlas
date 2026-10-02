// Begriffskarte „Confounding (gemeinsame Ursachen)“: Lernplanung und Wissenstest im Lehrdatensatz hängen zusammen,
// die Lernzeit hängt mit beidem zusammen. R-Referenzwerte (cor, partial_cor aus mariposa 0.7.4): b12-kategorial-design.test.ts.
// Ursachenwörter stehen hier bewusst (Leitplanke in AUTHORING 2a, Ausnahme B12), aber nur als Vermutung über die Entstehung.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num } from '../../format';

/** Lehrdatensatz: Planer = Zustimmung 4 oder 5 bei lernplanung5; Lernzeit geteilt am Median 7,6 h. */
export const PLANUNG = {
  nPlaner: 88, nAndere: 112, wissPlaner: 10.60227273, wissAndere: 9.75, lernPlaner: 8.670454545, lernAndere: 7.029464286,
  r: 0.1625442706, partial: -0.02678177921, rPlanLern: 0.3408014766, rLernWiss: 0.5391688537, median: 7.6,
  wenig: { planer: 9.34375, andere: 9.014492754, nPlaner: 32, nAndere: 69, lernPlaner: 5.93125, lernAndere: 4.956521739 },
  viel: { planer: 11.32142857, andere: 10.93023256, nPlaner: 56, nAndere: 43 },
} as const;
const P = PLANUNG;

export const confounding: ConceptCard = {
  concept: 'confounding',
  picture: 'b12-confounding',
  wofuer: 'Im Lehrdatensatz lösen Befragte, die feste Lernzeiten einplanen, im Wissenstest mehr Aufgaben. Liegt das am Planen? Oder steckt die Lernzeit hinter beidem: Wer viel lernt, plant eher feste Zeiten ein und löst auch mehr Aufgaben? Confounding heißt: Eine dritte Größe steckt hinter beidem.',
  kurz: 'Confounding heißt: Eine gemeinsame Ursache steckt hinter zwei Merkmalen und lässt sie zusammenhängen. Der Zusammenhang allein zeigt dann nicht, ob das eine das andere bewirkt.',
  stellDirVor: {
    text: `${P.nPlaner} Befragte stimmen der Aussage „Ich plane feste Zeiten zum Lernen ein.“ eher oder voll zu. Sie lösen im Wissenstest im Schnitt ${num(P.wissPlaner)} Aufgaben, die übrigen ${P.nAndere} nur ${num(P.wissAndere)}. Die Planer haben in den letzten sieben Tagen aber auch länger gelernt: ${num(P.lernPlaner)} statt ${num(P.lernAndere)} Stunden. Vergleichst du nur Befragte mit ähnlicher Lernzeit, schrumpft der Unterschied auf weniger als die Hälfte.`,
    figures: [
      { label: 'Planer, Wissenstest', value: `${num(P.wissPlaner)} Aufgaben` },
      { label: 'andere, Wissenstest', value: `${num(P.wissAndere)} Aufgaben` },
      { label: 'Korrelation r', value: num(P.r) },
      { label: 'bei gleicher Lernzeit', value: num(P.partial) },
    ],
  },
  heisst: {
    sym: 'A ← C → Y', say: 'A, C und Y: C zeigt auf A und auf Y',
    fach: 'Confounding liegt vor, wenn eine Variable C sowohl die untersuchte Einflussgröße A als auch das Ergebnis Y beeinflusst. Der beobachtete Zusammenhang zwischen A und Y mischt dann einen möglichen Effekt von A mit dem Einfluss von C.',
  },
  bausteine: [
    {
      title: 'Einen Zusammenhang finden',
      was: 'Befragte mit fester Lernplanung lösen mehr Aufgaben. Die Korrelation von Lernplanung und Wissenstest beträgt r = 0,16.',
      rechnung: `${num(P.wissPlaner)} − ${num(P.wissAndere)} = ${num(P.wissPlaner - P.wissAndere)} Aufgaben Unterschied. R meldet r = 0.163, p = 0.021.`,
      warum: 'Ein Zusammenhang ist der Anfang jeder Ursachenfrage. Er allein beantwortet sie aber nicht.',
      acht: 'r = 0,16 sagt nur: Beide Merkmale gehen gemeinsam etwas nach oben. Warum, sagt r nicht.',
      concept: 'pearson',
    },
    {
      title: 'Nach einer gemeinsamen Ursache fragen',
      was: `Die Lernzeit hängt mit beidem zusammen: mit der Planung (r = ${num(P.rPlanLern)}) und mit dem Wissenstest (r = ${num(P.rLernWiss)}). Sie könnte hinter dem Zusammenhang stecken.`,
      rechnung: `Planer lernen im Schnitt ${num(P.lernPlaner)} Stunden, die anderen ${num(P.lernAndere)} Stunden.`,
      warum: 'Eine Vermutung: Wer ohnehin viel lernt, plant eher feste Zeiten ein, und wer viel lernt, löst mehr Aufgaben. Dann hingen Planung und Wissenstest zusammen, ohne dass das Planen etwas bewirkt.',
      acht: 'Welche Größe eine gemeinsame Ursache ist, folgt aus Wissen über die Entstehung der Daten, nicht aus den Zahlen. Ginge der Weg andersherum, also Planung führt zu mehr Lernzeit, wäre die Lernzeit ein Mediator. Dann darfst du sie nicht herausrechnen, wenn du die ganze Wirkung der Planung suchst.',
      concept: 'causality',
    },
    {
      title: 'Vergleichbare vergleichen',
      was: 'Wir vergleichen Planer und Nicht-Planer nur innerhalb ähnlicher Lernzeiten. Dann bleibt vom Unterschied wenig übrig.',
      rechnung: `Bis ${num(P.median)} Stunden: ${num(P.wenig.planer)} gegen ${num(P.wenig.andere)} Aufgaben. Über ${num(P.median)} Stunden: ${num(P.viel.planer)} gegen ${num(P.viel.andere)}. In der unteren Hälfte lernen Planer immer noch ${num(P.wenig.lernPlaner)} statt ${num(P.wenig.lernAndere)} Stunden. Partielle Korrelation bei gleicher Lernzeit: ${num(P.partial)}.`,
      warum: 'Innerhalb einer Hälfte liegen die Lernzeiten näher beieinander, deshalb schrumpft der Unterschied. Ganz verschwindet er erst, wenn du die Lernzeit genauer festhältst, wie die partielle Korrelation.',
      acht: 'Kontrollieren hilft nur bei gemessenen Größen. Eine gemeinsame Ursache, die niemand erhoben hat, bleibt in den Zahlen versteckt.',
      concept: 'partial_cor',
    },
  ],
  ausprobieren: [
    {
      question: 'Du vergleichst Planer und Nicht-Planer nur unter Befragten mit ähnlicher Lernzeit. Was erwartest du?',
      options: ['Der Unterschied im Wissenstest wird kleiner.', 'Der Unterschied wird größer.', 'Nichts ändert sich.'], correct: 0, step: 3,
      explain: `Ein Teil des Unterschieds kam über die Lernzeit zustande. Hältst du sie fest, bleibt nur der Rest: Die Korrelation fällt von ${num(P.r)} auf ${num(P.partial)}.`,
      kurz: 'Die gemeinsame Ursache festhalten heißt: ihren Anteil herausnehmen.',
    },
    {
      question: 'Eine Zeitung titelt: „Wer plant, weiß mehr.“ Was fehlt?',
      options: ['nichts, r = 0,16 belegt das', 'die Frage nach gemeinsamen Ursachen', 'ein größeres r'], correct: 1, step: 2,
      explain: 'r zeigt einen Zusammenhang, keine Wirkung. Hier hängt die Lernzeit mit beidem zusammen; auch ein größeres r änderte daran nichts.',
      kurz: 'Zusammenhang ist nicht Ursache.',
    },
    {
      question: 'Sollte man in eine Auswertung möglichst viele Kontrollvariablen aufnehmen?',
      options: ['ja, je mehr, desto sicherer', 'nein, nur begründete gemeinsame Ursachen'], correct: 1, step: 3,
      explain: 'Wer eine Folge des Ergebnisses oder eine gemeinsame Folge beider Merkmale kontrolliert, erzeugt neue Verzerrungen. Kontrollvariablen begründest du mit Wissen über Entstehung und zeitliche Reihenfolge.',
      kurz: 'Kontrollieren braucht eine Begründung.',
    },
  ],
  check: {
    question: 'Welche Erklärung beschreibt Confounding?',
    options: [
      'Die Lernzeit beeinflusst die Planung und den Wissenstest und kann so einen Zusammenhang zwischen beiden erzeugen.',
      'Planung bewirkt bessere Ergebnisse, das zeigt r = 0,16.',
      'Der Wissenstest bewirkt die Planung.',
      'r = 0,16 ist zu klein, um etwas zu bedeuten.',
      'Die Planung erhöht die Lernzeit, und die Lernzeit erhöht den Wissenstest.',
    ],
    correct: 0,
    right: 'Genau. Eine gemeinsame Ursache lässt zwei Merkmale zusammenhängen, auch wenn keines das andere beeinflusst.',
    diagnose: {
      1: 'Fast! Ein Zusammenhang allein zeigt keine Wirkung. Hier hängt die Lernzeit mit beidem zusammen.',
      2: 'Fast! Das wäre eine umgekehrte Wirkungsrichtung. Confounding meint eine dritte Größe, die hinter beiden steckt.',
      3: 'Fast! Auch kleine Zusammenhänge können zählen. Die Frage ist, woher sie kommen.',
      4: 'Fast! Das wäre ein Mediator: Die Planung wirkte dann über die Lernzeit. Confounding meint eine Größe, die vor beiden steht.',
    },
  },
  fuerDich: 'Wenn du liest „Wer X tut, hat öfter Y“, frag zuerst: Welche dritte Größe könnte beides beeinflussen? Alter, Bildung und Einkommen sind in der Politikwissenschaft häufige Kandidaten.',
  genau: {
    kurz: 'Kontrolle hilft nur gegen gemessene gemeinsame Ursachen. Wahllos weitere Variablen aufzunehmen, kann neue Verzerrungen erzeugen.',
    paragraphs: [
      'Im Lehrdatensatz ist die Lernzeit eine gemeinsame Ursache, weil der Atlas sie so erzeugt: Planung und Testergebnis hängen beide von ihr ab, nicht voneinander. Die 200 Befragten sind synthetisch; über reale Lernende sagt das Beispiel nichts.',
      `Die partielle Korrelation rechnet die Lernzeit aus beiden Merkmalen heraus: r = ${num(P.partial)}, laut R p = 0.707. Das setzt voraus, dass die Lernzeit gut gemessen ist und linear mit beiden zusammenhängt.`,
      'Nicht jede Drittvariable ist eine Störgröße. Liegt sie auf dem Weg von A zu Y (ein Mediator) oder ist sie eine gemeinsame Folge beider (ein Collider), verzerrt ihre Kontrolle das Ergebnis.',
      'Eine veränderte Regressionssteigung allein beweist kein Confounding, und kein Regressionsmodell gleicht unbeobachtete Ursachen von selbst aus. Sicherer ist ein Design mit zufälliger Zuweisung.',
    ],
  },
};

export const confoundingTabs: ConceptTabs = {
  next: {
    next: { id: 'random_assignment', why: 'Zufällige Zuweisung schaltet gemeinsame Ursachen aus, auch die, die niemand gemessen hat.' },
    before: [
      { id: 'pearson', why: 'Misst den Zusammenhang, hinter dem eine gemeinsame Ursache stecken kann.' },
      { id: 'causality', why: 'Die Frage, was sich ändern würde, wenn man eingreift.' },
    ],
    after: [
      { id: 'partial_cor', why: 'Rechnet eine gemessene gemeinsame Ursache aus einem Zusammenhang heraus.' },
      { id: 'linear_regression', why: 'Nimmt Kontrollvariablen gemeinsam mit der Einflussgröße auf.' },
    ],
    more: [{ id: 'ancova', why: 'Vergleicht Gruppenmittelwerte bei gleicher Ausprägung einer Kontrollvariable.' }],
  },
};
