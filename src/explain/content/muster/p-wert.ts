// Muster der Begriffskarte: p-Wert. Beispiel aus dem Lehrdatensatz (200 Befragte): Lernzeit nach Weiterbildung,
// Welch-t-Test wie mariposa::t_test(lernzeit, group = weiterbildung). Alle Zahlen sind in R nachgerechnet,
// die Referenzwerte und R-Befehle stehen in src/explain/content/muster/muster.test.ts.
import type { ConceptCard } from '../../types';
import { num } from '../../format';
import { pTwoSided } from '../../../tasks/kit/dist';

/** Lernzeit (Stunden in der letzten Woche) nach Weiterbildung im Lehrdatensatz; Welch-t-Test, zweiseitig. */
export const LERNZEIT_NACH_WEITERBILDUNG = {
  nMit: 82, nOhne: 118,
  mit: 7.708537, ohne: 7.781356,
  /** Betrag des Unterschieds in Stunden */
  diff: 0.072819,
  se: 0.465493, df: 175.841175, t: 0.156435, p: 0.875870,
} as const;
const L = LERNZEIT_NACH_WEITERBILDUNG;

/** Auf zwei Stellen gerundet, wie angezeigt: Die Rechnung im Text geht mit den sichtbaren Zahlen auf. */
const shown2 = (v: number) => Math.round(v * 100) / 100;

/** p-Wert eines Unterschieds von `v` Stunden bei gleichem Standardfehler und gleichen Freiheitsgraden. */
export const pFor = (v: number) => pTwoSided(v / L.se, L.df);

export const pWert: ConceptCard = {
  concept: 'p_value',
  wofuer: 'Lernen Studierende mit Weiterbildung mehr als die anderen? Im Lehrdatensatz unterscheiden sich die beiden Gruppen ein klein wenig. Der p-Wert hilft bei der Frage, ob so ein Unterschied auch durch Zufall entstehen könnte.',
  kurz: 'Der p-Wert sagt dir, wie überraschend dein Ergebnis wäre, wenn es in Wahrheit keinen Unterschied gäbe. Je kleiner er ist, desto überraschender.',
  stellDirVor: {
    text: `${L.nMit} Befragte haben im letzten Jahr eine Weiterbildung gemacht, ${L.nOhne} nicht. Die mit Weiterbildung haben in der letzten Woche im Schnitt ${num(L.mit)} Stunden gelernt, die ohne ${num(L.ohne)} Stunden. Das sind gut vier Minuten Unterschied. Der t-Test in R meldet dazu p = 0.876, auf zwei Stellen gerundet ${num(L.p)}.`,
    figures: [
      { label: 'mit Weiterbildung', value: `${num(L.mit)} h` },
      { label: 'ohne Weiterbildung', value: `${num(L.ohne)} h` },
      { label: 'Unterschied', value: `${num(L.diff)} h` },
      { label: 'p-Wert', value: num(L.p) },
    ],
  },
  heisst: {
    sym: 'p', say: 'p',
    fach: 'die Wahrscheinlichkeit, unter der Nullhypothese und den Annahmen des Tests eine Prüfgröße zu erhalten, die mindestens so extrem ist wie die beobachtete.',
  },
  bausteine: [
    {
      title: 'Annehmen, es gäbe keinen Unterschied',
      was: 'Wir tun so, als hätten Weiterbildung und Lernzeit nichts miteinander zu tun. Diese Annahme heißt Nullhypothese.',
      warum: 'Nur unter einer festen Annahme lässt sich ausrechnen, was der Zufall allein anrichten würde.',
      acht: 'Die Nullhypothese ist eine Annahme zum Rechnen, keine Behauptung. Niemand muss glauben, dass sie stimmt.',
      concept: 'hypothesis',
    },
    {
      title: 'Den Unterschied in eine Prüfgröße übersetzen',
      was: 'Der t-Test teilt den Unterschied durch seinen Standardfehler. So sieht man, ob der Unterschied groß ist im Vergleich zum üblichen Schwanken.',
      rechnung: `t = ${num(L.diff)} / ${num(L.se)} ≈ ${num(shown2(L.diff) / shown2(L.se))}. Mit allen Nachkommastellen rechnet R ${num(L.t)}.`,
      warum: 'Ob ein Unterschied groß ist, hängt davon ab, wie stark die Werte ohnehin schwanken. t misst den Unterschied in Standardfehlern.',
      acht: 'Ein großes t heißt nicht automatisch ein wichtiger Unterschied. Bei sehr vielen Befragten wird auch ein winziger Unterschied groß.',
      concept: 'test_statistic',
    },
    {
      title: 'Nachsehen, wie oft der Zufall so etwas liefert',
      was: `Wir schauen nach, wie oft ein t von mindestens ${num(L.t)} vorkäme, in die eine oder andere Richtung, wenn es keinen Unterschied gäbe.`,
      rechnung: `p ≈ ${num(L.p)}: In etwa ${Math.round(L.p * 100)} von 100 Wiederholungen der Befragung wäre der Unterschied mindestens so groß.`,
      warum: 'Genau dieser Anteil ist der p-Wert. Er zählt beide Richtungen, weil vorher nicht feststand, welche Gruppe mehr lernt.',
      acht: 'p ist keine Wahrscheinlichkeit dafür, dass die Nullhypothese stimmt. Er rechnet unter der Annahme, dass sie stimmt.',
      concept: 'null_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'In einer anderen Studie lernen die beiden Gruppen 2 Stunden unterschiedlich viel, bei gleicher Streuung und Gruppengröße. Was passiert mit p?',
      options: ['p wird kleiner', 'p bleibt gleich', 'p wird größer'], correct: 0, step: 2,
      explain: `Ein größerer Unterschied ergibt ein größeres t. Ohne echten Unterschied käme so ein Ergebnis kaum vor: p fällt auf unter 0,001. Schieb den Regler oben auf 2 Stunden.`,
      kurz: 'Größerer Unterschied, kleinerer p-Wert.',
    },
    {
      question: `p ist hier ${num(L.p)}. Heißt das, Weiterbildung hat sicher keinen Einfluss auf die Lernzeit?`,
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Ein großer p-Wert heißt nur: Die Daten passen gut zur Annahme ohne Unterschied. Ein kleiner Unterschied kann trotzdem bestehen, und die Stichprobe reicht nicht, um ihn zu erkennen.',
      kurz: 'Nicht überraschend heißt nicht: kein Unterschied.',
    },
    {
      question: `Mit 20.000 statt 200 Befragten bleibt der Unterschied bei ${num(L.diff)} Stunden. Was passiert mit p?`,
      options: ['p wird kleiner', 'p bleibt gleich', 'p wird größer'], correct: 0, step: 2,
      explain: 'Mit hundertmal so vielen Befragten schrumpft der Standardfehler auf ein Zehntel, und t wird zehnmal so groß. p fällt von 0,88 auf etwa 0,12. Der Unterschied selbst bleibt gleich klein.',
      kurz: 'Mehr Befragte machen auch kleine Unterschiede auffälliger.',
    },
  ],
  regler: {
    label: 'Wie überraschend wäre das Ergebnis, wenn es keinen Unterschied gäbe?',
    min: 0, max: 2, step: 0.01, initial: 0.07,
    format: v => `${num(v)} h Unterschied`,
    describe: v => {
      if (v < 0.005) return 'Gar kein Unterschied: Genau das erwartet man, wenn es keinen gibt. p ist dann 1.';
      const p = pFor(v);
      const often = p >= 0.01 ? `in etwa ${Math.round(p * 100)} von 100` : p >= 0.001 ? 'in weniger als 1 von 100' : 'in weniger als 1 von 1.000';
      const shown = p >= 0.01 ? `p ≈ ${num(p)}` : p >= 0.001 ? 'p < 0,01' : 'p < 0,001';
      const verdict = p >= 0.2 ? 'Das wäre gar nicht überraschend.' : p >= 0.05 ? 'Das wäre etwas überraschend, kommt aber oft genug vor.' : p >= 0.01 ? 'Das wäre überraschend.' : 'Das wäre sehr überraschend.';
      return `Gäbe es keinen Unterschied, käme ein Unterschied von ${num(v)} Stunden oder mehr ${often} Wiederholungen der Befragung vor (${shown}). ${verdict}`;
    },
  },
  check: {
    question: 'Ein Test meldet p = 0,03. Was heißt das?',
    options: [
      'Die Nullhypothese stimmt mit 3 % Wahrscheinlichkeit.',
      'Gäbe es keinen Unterschied, käme ein so deutliches Ergebnis nur in etwa 3 von 100 Stichproben vor.',
      'Der Unterschied ist groß und wichtig.',
      'Mit 97 % Wahrscheinlichkeit gibt es einen Unterschied.',
    ],
    correct: 1,
    right: 'Genau. p rechnet unter der Annahme ohne Unterschied und fragt, wie selten das Ergebnis dann wäre.',
    diagnose: {
      0: 'Fast! Das ist der häufigste Fehler. p rechnet unter der Annahme, dass die Nullhypothese stimmt. Wie wahrscheinlich sie selbst ist, sagt p nicht.',
      2: 'Noch nicht ganz. p sagt nichts über die Größe. Bei sehr vielen Befragten wird auch ein winziger Unterschied überraschend.',
      3: 'Fast! Das ist derselbe Fehler, nur andersherum. p sagt nicht, wie wahrscheinlich ein Unterschied ist.',
    },
  },
  fuerDich: 'Wenn du in einer Studie „p < 0,05“ liest, frag dich zweierlei: Wie groß ist der Unterschied überhaupt? Und wie viele Menschen wurden befragt? Der p-Wert allein beantwortet keine der beiden Fragen.',
  genau: {
    kurz: 'Der p-Wert gilt nur, wenn die Annahmen des Tests stimmen. Er ist keine Wahrscheinlichkeit für eine Hypothese.',
    paragraphs: [
      `Genau genommen ist p die Wahrscheinlichkeit, unter der Nullhypothese und den Annahmen des Tests eine Prüfgröße zu erhalten, die mindestens so extrem ist wie die beobachtete. Hier ist das ein Welch-t-Test, zweiseitig, mit t ≈ ${num(L.t)} und etwa ${Math.round(L.df)} Freiheitsgraden.`,
      'Die Schwelle α, oft 5 %, wird vor der Auswertung festgelegt. Wer viele Tests rechnet, findet auch ohne echte Unterschiede einzelne kleine p-Werte (Begriff „Mehrere Vergleiche“).',
      'Ein p-Wert über α ist kein Beleg für die Nullhypothese. Wie groß der Unterschied sein könnte, zeigt das Konfidenzintervall: Hier reicht es von knapp einer Stunde in die eine bis knapp einer Stunde in die andere Richtung.',
    ],
  },
};
