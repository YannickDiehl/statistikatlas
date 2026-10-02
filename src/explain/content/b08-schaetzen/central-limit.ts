// Begriffskarte „Zentraler Grenzwertsatz“ (central_limit). Beispiel: Haushaltsgröße im ALLBUS 2023 (Häufigkeiten,
// ungewichtet), stark rechtsschief; die mittlere Haushaltsgröße von n unabhängig gezogenen Befragten wird exakt durch
// Faltung berechnet (Bild 'b08-glocke', Regler n). Reiter: Schiefe des Haushaltseinkommens und seiner Mittelwerte.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { count, num, pct } from '../../format';
import { HAUSHALT_KENNWERTE as H, HAUSHALT_N, columnX, mean, skew, stufe } from './daten';

/** Stichprobengrößen des Reglers. */
export const GLOCKE_N = [1, 2, 3, 5, 10, 20, 30, 50, 100] as const;
/** Wie viele Befragte im Reiter gemittelt werden. */
export const GEMITTELT = 30;

/** Schiefe der Mittelwerte aus n unabhängigen Ziehungen: Schiefe der Einzelwerte geteilt durch √n. */
export const schiefeMittel = (n: number, g = H.skew) => g / Math.sqrt(n);

/**
 * Wie gut die Glocke zu Mittelwerten mit der Schiefe g passt, in Worten; eine Schwelle für Bild, Regler und Reiter.
 * Ab 0,5: noch deutlich schief; ab 0,25: recht gut; darunter: fast symmetrisch. `bars` spricht von den Balken des Bildes.
 */
export function glockeUrteil(g: number, bars: boolean): string {
  const a = Math.abs(g);
  if (a >= 0.5) return bars ? 'Die Verteilung ist noch deutlich schief.' : 'Sie sind noch deutlich schief; die Glocke passt hier schlecht.';
  if (a >= 0.25) return `Die Glocke passt schon recht gut; ${g > 0 ? 'rechts' : 'links'} bleibt ein kleiner Überhang.`;
  return bars ? 'Die Balken folgen fast genau der Glockenkurve.' : 'Sie sind fast symmetrisch, wie eine Glocke.';
}

/** Text zum Regler: Schiefe der Mittelwerte aus n Befragten und wie gut die Glocke passt. */
export function glockeText(n: number): string {
  if (n === 1) return `Mit einer Person siehst du die Haushaltsgrößen selbst: Die Schiefe beträgt ${num(H.skew)}, rechts hängt ein langer Ausläufer. Die Glockenkurve passt schlecht.`;
  const g = schiefeMittel(n);
  return `Mittelwerte aus ${n} Befragten haben eine Schiefe von ${num(H.skew)} / √${n} ≈ ${num(g)}. ${glockeUrteil(g, true)}`;
}

/** Schiefe des Haushaltseinkommens (Spalte x) und der Mittelwerte aus 30 Ziehungen, aus den aktuellen Daten. */
export function einkommenSchiefe(c: SampleCtx) {
  const x = columnX(c, 'einkommen'), g = skew(x);
  return { N: x.length, mean: mean(x), skew: g, skewMean: schiefeMittel(GEMITTELT, g) };
}

export const centralLimit: ConceptCard = {
  concept: 'central_limit',
  picture: 'b08-glocke',
  wofuer: 'Viele Verfahren rechnen mit der Normalverteilung, auch wenn die Daten gar nicht glockenförmig sind. Warum darf man das bei Mittelwerten oft?',
  kurz: 'Der zentrale Grenzwertsatz sagt: Mittelwerte aus vielen Beobachtungen sind annähernd normalverteilt, auch wenn die einzelnen Werte schief verteilt sind. Je mehr Beobachtungen, desto besser passt die Glocke.',
  stellDirVor: {
    text: `Im ALLBUS 2023 haben ${count(HAUSHALT_N)} Menschen gesagt, wie viele Personen in ihrem Haushalt leben, sie selbst eingeschlossen (ungewichtet). ${pct(H.bisZwei)} leben allein oder zu zweit, nur ${pct(H.abFuenf)} zu fünft oder mehr. Die Verteilung ist schief: Rechts zieht sich ein langer Ausläufer bis zu 12 Personen. Ziehst du immer wieder 30 Befragte und rechnest ihre mittlere Haushaltsgröße aus, sehen diese Mittelwerte dagegen fast wie eine Glocke aus.`,
    figures: [
      { label: 'mittlere Haushaltsgröße', value: `${num(H.mu)} Personen` },
      { label: 'Schiefe der Einzelwerte', value: num(H.skew) },
      { label: 'Schiefe bei 30 Befragten', value: num(schiefeMittel(30)) },
    ],
  },
  heisst: {
    sym: '√n · (X̄ − μ) / σ → N(0, 1)', say: 'Wurzel n mal X quer minus mü durch sigma geht gegen N von null und eins',
    fach: 'Bei unabhängigen, identisch verteilten Beobachtungen mit endlicher positiver Varianz nähert sich die Verteilung des standardisierten Mittelwerts √n · (X̄ − μ) / σ mit wachsendem n der Standardnormalverteilung.',
  },
  bausteine: [
    {
      title: 'Viele Werte mitteln',
      was: 'Du ziehst 30 Befragte und rechnest ihre mittlere Haushaltsgröße aus. Das wiederholst du in Gedanken sehr oft.',
      warum: 'Im Mittelwert gleichen sich große und kleine Haushalte teilweise aus. Ein einzelner großer Haushalt zieht ihn nur ein Stück nach oben.',
      acht: 'Gemittelt wird über die Befragten einer Stichprobe. Die einzelnen Haushaltsgrößen bleiben so schief, wie sie sind.',
      concept: 'sampling_distribution',
    },
    {
      title: 'Die Schiefe schrumpfen sehen',
      was: 'Die Schiefe der Mittelwerte ist die Schiefe der Einzelwerte geteilt durch √n. Bei 30 Befragten bleibt weniger als ein Fünftel übrig.',
      rechnung: `${num(H.skew)} / √30 ≈ ${num(H.skew)} / ${num(Math.sqrt(30))} ≈ ${num(schiefeMittel(30))}`,
      warum: 'Je kleiner die Schiefe, desto symmetrischer die Verteilung. Bei 0 wäre sie ganz symmetrisch.',
      acht: 'Es gibt keine feste Grenze wie „ab 30 ist alles normal“. Bei sehr schiefen Daten braucht es mehr Befragte, bei fast symmetrischen weniger.',
      concept: 'shape',
    },
    {
      title: 'Mit der Glocke rechnen',
      was: 'Standardisiert man die Mittelwerte, folgen sie fast der Standardnormalverteilung. Daher kommt die 1,96 im 95-%-Konfidenzintervall.',
      warum: 'So lassen sich Wahrscheinlichkeiten für Mittelwerte ausrechnen, ohne die genaue Verteilung der Daten zu kennen.',
      acht: 'Der Satz braucht unabhängige Beobachtungen mit endlicher Streuung. Er sagt nicht, wie gut die Näherung bei deinem n schon ist.',
      concept: 'standard_normal',
    },
  ],
  ausprobieren: [
    {
      question: 'Die einzelnen Haushaltsgrößen sind schief. Wie sehen Mittelwerte aus 100 Befragten aus?',
      options: ['fast wie eine Glocke', 'genauso schief', 'gleichmäßig verteilt'], correct: 0, step: 2,
      explain: `Die Schiefe schrumpft auf ${num(H.skew)} / √100 ≈ ${num(schiefeMittel(100))}. Schieb den Regler auf 100.`,
      kurz: 'Mittelwerte werden glockenförmig.',
    },
    {
      question: 'Werden durch mehr Befragte auch die einzelnen Haushaltsgrößen normalverteilt?',
      options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Die Haushalte bleiben, wie sie sind: viele klein, wenige groß. Nur die Mittelwerte vieler Befragter werden glockenförmig.',
      kurz: 'Der Satz betrifft Mittelwerte, nicht die Rohdaten.',
    },
    {
      question: 'Warum steht im Konfidenzintervall oft 1,96?',
      options: ['weil Mittelwerte annähernd normalverteilt sind', 'weil die Daten immer normalverteilt sind'], correct: 0, step: 3,
      explain: 'In der Standardnormalverteilung liegen 95 % der Werte zwischen −1,96 und 1,96. Dank des Satzes gilt das ungefähr auch für standardisierte Mittelwerte.',
      kurz: 'Die 1,96 kommt aus der Glocke der Mittelwerte.',
    },
  ],
  regler: {
    label: 'Aus wie vielen Befragten mittelst du?',
    min: 0, max: GLOCKE_N.length - 1, step: 1, initial: 0,
    format: v => { const n = stufe(GLOCKE_N, v); return n === 1 ? 'eine Person' : `${n} Befragte`; },
    describe: v => glockeText(stufe(GLOCKE_N, v)),
  },
  check: {
    question: 'Was beschreibt der zentrale Grenzwertsatz?',
    options: [
      'Ab 30 Befragten sind die Daten normalverteilt.',
      'Die Verteilung von Mittelwerten nähert sich bei wachsendem n einer Normalverteilung.',
      'Der Mittelwert liegt bei großen Stichproben nah am wahren Wert.',
      'Große Stichproben haben weniger Ausreißer.',
    ],
    correct: 1,
    right: 'Genau. Es geht um die Form der Schwankungen von Mittelwerten, nicht um die Form der Daten.',
    diagnose: {
      0: 'Fast! Die Daten bleiben, wie sie sind, und 30 ist nur eine Faustregel. Normal werden die Mittelwerte, nicht die Daten.',
      2: 'Fast! Das ist das Gesetz der großen Zahlen. Der zentrale Grenzwertsatz sagt etwas über die Form der Schwankungen.',
      3: 'Noch nicht ganz. Ausreißer gibt es in großen Stichproben genauso. Der Satz handelt von der Verteilung der Mittelwerte.',
    },
  },
  fuerDich: 'Wenn ein Verfahren eine Normalverteilung voraussetzt, ist oft die Verteilung von Mittelwerten gemeint, nicht die deiner Rohdaten. Bei schiefen Daten und kleinen Gruppen lohnt trotzdem ein zweiter Blick.',
  genau: {
    kurz: 'Der Satz betrifft Mittelwerte und Summen, nicht die Form der Rohdaten. Wie gut die Näherung ist, hängt von Schiefe, Rändern und Ausreißern ab.',
    paragraphs: [
      'Formal: Bei unabhängigen, identisch verteilten Beobachtungen mit endlicher positiver Varianz σ² nähert sich die Verteilung von Zₙ = √n · (X̄ − μ) / σ mit wachsendem n der Standardnormalverteilung N(0, 1).',
      'Es gibt keine universelle Grenze wie n = 30. Die Faustregel stammt aus Lehrbüchern; bei stark schiefen Daten oder extremen Werten braucht es deutlich mehr Beobachtungen.',
      'Die Formel verwendet die wahre Standardabweichung σ. Wird sie aus den Daten geschätzt, nimmt man bei kleinen Stichproben die t-Verteilung.',
      `Das Bild ist exakt: Die Verteilung der Summe von n unabhängigen Ziehungen aus den Haushaltsgrößen des ALLBUS 2023 (ungewichtet, ${count(HAUSHALT_N)} gültige Angaben) entsteht durch wiederholtes Falten der Häufigkeiten. Die Schiefe ist das dritte standardisierte Moment, hier ${num(H.skew)}.`,
    ],
  },
};

export const centralLimitTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'einkommen' },
    kurz: `Das Haushaltsnettoeinkommen der 200 Befragten ist schief verteilt: Wenige Haushalte haben sehr viel. Wie schief sind Mittelwerte aus ${GEMITTELT} zufällig gezogenen Befragten?`,
    value: c => einkommenSchiefe(c).skewMean,
    result: c => {
      const e = einkommenSchiefe(c);
      return {
        kurz: `Die einzelnen Einkommen haben eine Schiefe von ${num(e.skew)}: Rechts zieht sich ein Ausläufer zu hohen Einkommen. Mittelwerte aus ${GEMITTELT} Befragten haben nur noch eine Schiefe von ${num(e.skewMean)}. ${glockeUrteil(e.skewMean, false)}`,
        fachlich: `Schiefe des Mittelwerts aus n unabhängigen Ziehungen = Schiefe der Einzelwerte / √n = ${num(e.skew)} / √${GEMITTELT} ≈ ${num(e.skewMean)}.`,
        zusatz: `0 hieße ganz symmetrisch. Das mittlere Einkommen der ${e.N} beträgt ${count(e.mean)} € im Monat.`,
      };
    },
    voraussetzung: 'Die Ziehungen sind unabhängig, mit Zurücklegen aus den 200. Die Schiefe ist hier aus den Momenten der 200 gerechnet; R meldet mit describe() eine leicht korrigierte Fassung.',
    think: [
      {
        question: 'Alle Einkommen verdoppeln sich. Was passiert mit der Schiefe der Mittelwerte?',
        options: ['bleibt gleich', 'verdoppelt sich', 'halbiert sich'], correct: 0,
        explain: 'Verdoppeln streckt die Verteilung, ändert aber nicht ihre Form. Die Schiefe misst nur die Form.',
        kurz: 'Die Form hängt nicht von der Einheit ab.',
        tryIt: { label: 'alle Einkommen doppelt so hoch', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Ein Haushalt hat plötzlich 30.000 € im Monat. Was passiert mit der Schiefe der Mittelwerte?',
        options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Ein so hohes Einkommen verlängert den Ausläufer nach rechts. Die Einzelwerte werden schiefer, und auch Mittelwerte aus 30 bleiben dann schiefer.',
        kurz: 'Extreme Werte bremsen die Glocke.',
        tryIt: { label: 'die gewählte Person auf 30.000 €', op: 'outlier', column: 'x', value: 30000 },
        expect: { change: 'up' },
      },
      {
        question: 'Alle Haushalte bekommen 100 € mehr. Was passiert mit der Schiefe der Mittelwerte?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Verschieben ändert die Form nicht. Die ganze Verteilung rückt nur nach rechts.',
        kurz: 'Verschieben lässt die Schiefe, wie sie ist.',
        tryIt: { label: 'alle 100 € mehr', op: 'shift', column: 'x', value: 100 },
        expect: { change: 'same' },
      },
    ],
  },
  next: {
    next: { id: 'confidence', why: 'Weil Mittelwerte annähernd normalverteilt sind, reicht der Mittelwert plus minus etwa zwei Standardfehler für ein 95-%-Intervall.' },
    before: [
      { id: 'sampling_distribution', why: 'Der Satz beschreibt die Form der Stichprobenverteilung von Mittelwerten.' },
      { id: 'law_large_numbers', why: 'Sagt, wohin der Mittelwert läuft; der Grenzwertsatz sagt, wie er dabei schwankt.' },
    ],
    after: [
      { id: 'standard_normal', why: 'Die Glockenkurve, der sich standardisierte Mittelwerte nähern.' },
      { id: 't_test', why: 'Rechnet mit annähernd normalverteilten Mittelwerten, auch bei schiefen Daten.' },
    ],
    more: [
      { id: 'exact_asymptotic', why: 'Wann man exakt rechnet und wann eine Näherung wie die Glocke reicht.' },
      { id: 'shape', why: 'Wie man die Form einer Verteilung beschreibt, auch ihre Schiefe.' },
    ],
  },
};
