// Begriffskarte „Zufällige Zuweisung“: Die 200 Befragten werden per Münzwurf in zwei Gruppen geteilt (Zufallsgenerator des
// Lehrdatensatzes, Startwerte 1 bis 10) und mit selbst gewählten Gruppen (feste Lernplanung) verglichen.
// R-Referenzwerte (derselbe Generator in R): b12-kategorial-design.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num, pct, unit } from '../../format';
import { baseSurvey } from '../../sample';
import { mean } from '../../../tasks/kit/means';
import { coin } from './rechnen';
import { PLANUNG } from './confounding';

/** Gruppen eines Münzwurfs (Startwert `seed`): Größe, mittlere Lernzeit, mittleres Alter, Anteil mit Abitur. */
export function coinGroups(seed: number) {
  const rows = baseSurvey(), g = coin(seed, rows.length);
  const part = (k: number) => {
    const r = rows.filter((_, i) => g[i] === k);
    return { n: r.length, lernzeit: mean(r.map(x => x.values.lernzeit)), alter: mean(r.map(x => x.values.alter)), abitur: r.filter(x => x.values.schulabschluss === 4).length / r.length };
  };
  return { a: part(1), b: part(0) };
}

/** Typischer Zufallsunterschied der mittleren Lernzeit bei 100 bzw. 1.000 Personen je Gruppe: s · √(2 / n); `p081`: Anteil der Losungen mit mindestens 0,81 h Unterschied (Normalnäherung). */
export const TYPISCH = { sd: 3.237515294, n100: 0.4578538037, n1000: 0.1447860855, p081: 0.07610963636 } as const;

const first = coinGroups(1);

export const randomAssignment: ConceptCard = {
  concept: 'random_assignment',
  picture: 'b12-zuweisung',
  wofuer: 'Du willst wissen, ob ein Lernkurs die Ergebnisse im Wissenstest verbessert. Lässt du die Leute selbst wählen, kommen vielleicht vor allem die Motivierten. Lost du dagegen aus, wer den Kurs bekommt, sind die Gruppen im Mittel gleich, auch in dem, was niemand gemessen hat.',
  kurz: 'Bei zufälliger Zuweisung entscheidet der Zufall, wer welche Bedingung bekommt. So unterscheiden sich die Gruppen vorher nur zufällig, nicht systematisch.',
  stellDirVor: {
    text: `Teilst du die 200 Befragten per Münzwurf in zwei Gruppen, lernen beide fast gleich lange: Beim ersten Wurf sind es ${num(first.a.lernzeit)} und ${num(first.b.lernzeit)} Stunden. Teilst du sie danach, ob sie feste Lernzeiten einplanen, sind es ${num(PLANUNG.lernPlaner)} und ${num(PLANUNG.lernAndere)} Stunden. Selbst gewählte Gruppen unterscheiden sich schon vorher.`,
    figures: [
      { label: 'Münzwurf, Gruppe A', value: `${num(first.a.lernzeit)} h` },
      { label: 'Münzwurf, Gruppe B', value: `${num(first.b.lernzeit)} h` },
      { label: 'mit fester Lernplanung', value: `${num(PLANUNG.lernPlaner)} h` },
      { label: 'ohne feste Lernplanung', value: `${num(PLANUNG.lernAndere)} h` },
    ],
  },
  heisst: {
    sym: 'A ⟂ Y(0), Y(1)', say: 'A unabhängig von Y von 0 und Y von 1',
    fach: 'Bei zufälliger Zuweisung ist die zugeteilte Bedingung A unabhängig von den potenziellen Ergebnissen Y(0) und Y(1). Die Gruppen sind dann im Erwartungswert vergleichbar, auch in nicht gemessenen Merkmalen.',
  },
  bausteine: [
    {
      title: 'Den Zufall entscheiden lassen',
      was: 'Für jede Person wird gelost, etwa per Münzwurf oder mit sample() in R. Niemand wählt selbst, auch nicht die Forschenden.',
      warum: 'So hängt die Zuteilung mit nichts zusammen, was die Personen mitbringen: weder mit Motivation noch mit Vorwissen.',
      acht: 'Zufällige Zuweisung ist etwas anderes als eine Zufallsstichprobe. Die eine verteilt auf Bedingungen, die andere wählt aus einer Bevölkerung aus.',
      concept: 'random_sampling',
    },
    {
      title: 'Die Gruppen vergleichen',
      was: 'Nach dem Losen sehen beide Gruppen ähnlich aus: ähnliche Lernzeit, ähnliches Alter, ähnlich viele mit Abitur. Kleine Unterschiede bleiben.',
      rechnung: `Erster Münzwurf: ${first.a.n} und ${first.b.n} Befragte; Lernzeit ${num(first.a.lernzeit)} und ${num(first.b.lernzeit)} h; Alter ${num(first.a.alter)} und ${num(first.b.alter)} Jahre; Abitur ${pct(first.a.abitur)} und ${pct(first.b.abitur)}.`,
      warum: 'Mit genug Personen gleichen sich Unterschiede aus, auch bei Merkmalen, die niemand gemessen hat.',
      acht: 'Gleich heißt hier: im Mittel über viele Losungen. In einer einzelnen Losung können Gruppen zufällig etwas verschieden sein.',
      concept: 'law_large_numbers',
    },
    {
      title: 'Den Unterschied der Bedingung zuschreiben',
      was: 'Bekommt dann eine Gruppe den Kurs und die andere nicht, unterscheiden sie sich nur durch den Kurs und den Zufall. Ein Test sagt, ob der Unterschied über den Zufall hinausgeht.',
      warum: 'Gemeinsame Ursachen können nicht mehr hinter dem Unterschied stecken, weil der Zufall die Bedingung festgelegt hat.',
      acht: 'Der Effekt gilt für die zugeteilte Bedingung. Wer zugeteilt ist, aber nicht teilnimmt, verändert, was gemessen wird.',
      concept: 'causality',
    },
  ],
  ausprobieren: [
    {
      question: 'Beim vierten Münzwurf lernt Gruppe B 0,81 Stunden mehr als Gruppe A. Ist die Zuweisung misslungen?',
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: `Auch Zufall erzeugt Unterschiede. Bei 100 Personen je Gruppe sind etwa ${num(TYPISCH.n100)} Stunden typisch; 0,81 ist knapp das Doppelte. Ein mindestens so großer Unterschied käme bei etwa ${Math.round(TYPISCH.p081 * 100)} von 100 Losungen vor, und ein Test rechnet damit.`,
      kurz: 'Zufällige Unterschiede gehören dazu.',
    },
    {
      question: 'Was passiert mit den zufälligen Unterschieden, wenn du 2.000 statt 200 Personen auslost?',
      options: ['sie werden kleiner', 'sie bleiben gleich', 'sie werden größer'], correct: 0, step: 2,
      explain: `Der typische Zufallsunterschied schrumpft mit der Wurzel der Gruppengröße. Bei 1.000 statt 100 Personen je Gruppe fällt er etwa auf ein Drittel, von ${num(TYPISCH.n100)} auf ${num(TYPISCH.n1000)} Stunden.`,
      kurz: 'Mehr Personen, ähnlichere Gruppen.',
    },
    {
      question: 'Gleicht die Zuweisung per Zufall auch Unterschiede in der Motivation aus, die niemand gemessen hat?',
      options: ['ja, im Mittel auch diese', 'nein, nur gemessene Merkmale'], correct: 0, step: 1,
      explain: 'Der Münzwurf weiß nichts über die Personen. Deshalb verteilt er gemessene und ungemessene Merkmale gleich, im Mittel über viele Losungen.',
      kurz: 'Das ist der große Vorteil gegenüber Kontrollvariablen.',
    },
  ],
  regler: {
    label: 'Welcher Münzwurf?', min: 1, max: 10, step: 1, initial: 1,
    format: v => `Münzwurf ${v}`,
    describe: v => {
      const g = coinGroups(v), d = g.b.lernzeit - g.a.lernzeit;
      return `Gruppe A hat ${g.a.n} Befragte, Gruppe B ${g.b.n}. Sie lernen im Schnitt ${num(g.a.lernzeit)} und ${num(g.b.lernzeit)} Stunden, ein Unterschied von ${unit(Math.abs(d), 'Stunde', 'Stunden')}, nur durch den Zufall. Nach eigener Lernplanung geteilt sind es ${num(PLANUNG.lernPlaner - PLANUNG.lernAndere)} Stunden.`;
    },
  },
  check: {
    question: 'Eine Forscherin teilt dem Kurs die Personen zu, die ihr motiviert erscheinen. Wo liegt das Problem?',
    options: [
      'Keins, solange beide Gruppen gleich groß sind.',
      'Die Zuteilung hängt mit der Motivation zusammen und ist nicht mehr zufällig.',
      'Die Stichprobe ist keine Zufallsstichprobe.',
      'Der Kurs wirkt dann sicher.',
    ],
    correct: 1,
    right: 'Genau. Wer zuteilt, bringt seine Auswahl in die Gruppen. Ein Unterschied im Ergebnis mischt dann Kurs und Motivation.',
    diagnose: {
      0: 'Fast! Gleich große Gruppen helfen nicht, wenn die Zuteilung mit Eigenschaften der Personen zusammenhängt.',
      2: 'Fast! Hier geht es nicht um die Auswahl aus einer Bevölkerung, sondern um die Verteilung auf die Bedingungen.',
      3: 'Noch nicht ganz. Ob der Kurs wirkt, lässt sich mit dieser Zuteilung gerade nicht sicher sagen.',
    },
  },
  fuerDich: 'Wenn eine Studie von einem Experiment spricht, prüf, wer die Bedingungen verteilt hat. Nur wenn der Zufall entschieden hat, kannst du einen Unterschied der Bedingung zuschreiben.',
  genau: {
    kurz: 'Zufällige Zuweisung macht Gruppen im Mittel vergleichbar, nicht in jeder einzelnen Losung gleich. Ausfälle und Abweichungen von der Zuweisung brauchen zusätzliche Überlegungen.',
    paragraphs: [
      'Formal ist die Zuweisung A unabhängig von den potenziellen Ergebnissen Y(0) und Y(1). Bei geschichteter Zuweisung, etwa getrennt nach Schulabschluss, gilt das innerhalb jeder Schicht.',
      'Die Münzwürfe hier nutzen den Zufallsgenerator des Atlas mit den Startwerten 1 bis 10. In R losen Forschende zum Beispiel mit sample(c("A", "B"), 200, replace = TRUE).',
      'Ein Effekt der Zuweisung bezieht sich auf die angebotene Bedingung. Er ist nicht automatisch der Effekt der tatsächlich erhaltenen Behandlung, wenn manche nicht teilnehmen.',
      'Zufällige Stichprobenziehung und zufällige Zuweisung lösen verschiedene Probleme: Die eine erlaubt den Schluss auf eine Bevölkerung, die andere den Schluss auf eine Wirkung.',
    ],
  },
};

export const randomAssignmentTabs: ConceptTabs = {
  next: {
    next: { id: 't_test', why: 'Prüft, ob sich zwei zufällig gebildete Gruppen nach der Behandlung mehr unterscheiden, als der Zufall erwarten lässt.' },
    before: [
      { id: 'causality', why: 'Die Frage, die eine zufällige Zuweisung beantwortbar macht.' },
      { id: 'confounding', why: 'Das Problem, das der Zufall bei der Zuweisung löst.' },
    ],
    after: [{ id: 'oneway_anova', why: 'Vergleicht mehr als zwei zufällig gebildete Gruppen.' }],
    more: [
      { id: 'random_sampling', why: 'Zufall bei der Auswahl aus einer Bevölkerung, nicht bei der Zuteilung.' },
      { id: 'paired_design', why: 'Dieselben Personen unter beiden Bedingungen, eine Alternative zu zwei Gruppen.' },
    ],
  },
};
