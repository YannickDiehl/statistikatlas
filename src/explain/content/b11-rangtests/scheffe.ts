// Begriffskarte „Scheffé-Paarvergleiche“ (B11): dieselben zehn Paare wie bei Tukey (Lernzeit nach Schulabschluss), aber mit
// der Hürde für alle denkbaren Kontraste, wie mariposa::scheffe_test(). Zahlen aus R in b11-rangtests.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { qt } from '../../../tasks/kit/dist';
import { qtukey } from '../../../tasks/kit/means';
import { qf } from './rank';
import { basePairs, hurdle40, pairLabel, pairsOf } from './posthoc';

/** Hürden in Stunden für k Gruppen mit je 40 Personen und der Fehlervarianz des Lehrdatensatzes: t-Test, Tukey, Scheffé. */
export function hurdlesFor(k: number) {
  const g = Math.round(k), df = 39 * g, se = Math.sqrt(basePairs().mse * 2 / 40);
  return { k: g, df, t: qt(0.975, df) * se, tukey: qtukey(0.95, g, df) / Math.SQRT2 * se, scheffe: Math.sqrt((g - 1) * qf(0.95, g - 1, df)) * se };
}

export const scheffeCard: ConceptCard = {
  concept: 'scheffe_test',
  picture: 'b11-scheffe',
  wofuer: 'Nach einer ANOVA willst du manchmal mehr vergleichen als Paare, etwa die drei Gruppen ohne Hochschulreife gegen die zwei mit. Scheffé schützt jeden solchen Vergleich zugleich. Der Preis: Für einzelne Paare liegt seine Hürde höher als bei Tukey.',
  kurz: 'Scheffé vergleicht nach einer ANOVA Gruppen so, dass jeder denkbare Vergleich geschützt ist. Deshalb ist seine Hürde höher als bei Tukey, und er meldet seltener einen Unterschied.',
  stellDirVor: {
    text: 'Bei der Lernzeit nach Schulabschluss meldet Tukey 4 der 10 Paare als auffällig, Scheffé nur 3. Der Unterschied liegt bei Ohne Schulabschluss minus Mittlerer Abschluss: −2,06 Stunden. Tukey meldet dafür p ≈ 0,023, Scheffé p ≈ 0,06; nur der erste Wert liegt unter α = 0,05.',
    figures: [
      { label: 'auffällig nach Tukey', value: '4 von 10' },
      { label: 'auffällig nach Scheffé', value: '3 von 10' },
      { label: 'ohne minus Mittlerer', value: '−2,06 h' },
      { label: 'Hürden dieses Paars', value: '1,87 und 2,11 h' },
    ],
  },
  heisst: {
    sym: 'S', say: 'S',
    fach: 'Die Scheffé-Methode prüft einen Kontrast mit F = Differenz² / ((k − 1) · MSE · (1/nᵢ + 1/nⱼ)) gegen die F-Verteilung mit k − 1 und N − k Freiheitsgraden. Ihre Grenze S = √((k − 1) · F_krit) gilt für alle Kontraste zugleich.',
  },
  bausteine: [
    {
      title: 'Mehr als Paare zulassen',
      was: 'Ein Kontrast vergleicht Gruppen oder Kombinationen von Gruppen, zum Beispiel ohne Hochschulreife gegen mit. Davon gibt es unendlich viele, nicht nur zehn Paare.',
      warum: 'Wer erst nach dem Blick in die Daten entscheidet, was er vergleicht, hat in Gedanken viele Vergleiche gerechnet. Scheffé schützt sie alle.',
      acht: 'scheffe_test() in mariposa zeigt nur die Paare. Die Hürde ist trotzdem die strenge für alle Kontraste.',
      concept: 'multiplicity',
    },
    {
      title: 'Die Hürde aus der F-Verteilung ableiten',
      was: 'Scheffé leitet seine Hürde aus der F-Verteilung der ANOVA ab. In Standardfehlern gemessen liegt sie bei fünf Gruppen etwa 13 % höher als bei Tukey.',
      rechnung: 'S = √((5 − 1) · 2,42) ≈ 3,11 Standardfehler, Tukey braucht 3,89 / √2 ≈ 2,75. Für ohne Schulabschluss gegen Mittleren Abschluss: 3,11 · 0,68 ≈ 2,11 Stunden statt 1,87.',
      warum: 'Die Hürde muss so hoch sein, dass auch der auffälligste aller denkbaren Kontraste nur selten zufällig darüber liegt.',
      acht: 'Mit zwei Gruppen sind Scheffé, Tukey und der t-Test gleich, denn es gibt nur einen Vergleich. Der Abstand wächst mit der Zahl der Gruppen.',
      concept: 'f_distribution',
    },
    {
      title: 'Paare an der Hürde messen',
      was: 'Wie bei Tukey ist ein Paar auffällig, wenn seine Differenz im Betrag über der Hürde liegt. Die Intervalle von Scheffé sind entsprechend breiter.',
      rechnung: 'Ohne Schulabschluss minus Mittlerer Abschluss: −2,06 Stunden. Über der Tukey-Hürde von 1,87, aber unter der Scheffé-Hürde von 2,11.',
      warum: 'Für reine Paarvergleiche verschenkt Scheffé deshalb etwas: Er übersieht eher einen echten Unterschied als Tukey.',
      acht: 'Welchen Test du nimmst, legst du vor dem Blick auf die Ergebnisse fest. Wer beide rechnet und den günstigeren berichtet, hebelt den Schutz aus.',
      concept: 'confidence',
    },
  ],
  ausprobieren: [
    {
      question: 'Du willst nur die zehn Paare vergleichen. Welcher Test findet einen echten Unterschied eher?', options: ['Tukey', 'Scheffé', 'beide gleich'], correct: 0, step: 3,
      explain: 'Tukey ist genau auf die Familie der Paare zugeschnitten und hat dafür die niedrigere Hürde. Scheffé schützt zusätzlich Vergleiche, die du gar nicht rechnest.',
      kurz: 'Für Paare ist Tukey die schärfere Wahl.',
    },
    {
      question: 'Wie weit liegen die Hürden von Scheffé und Tukey bei nur zwei Gruppen auseinander?', options: ['gar nicht', 'ein wenig', 'weit'], correct: 0, step: 2,
      explain: 'Bei zwei Gruppen gibt es nur einen Vergleich. Beide Hürden sind dann gleich der des t-Tests, hier 1,34 Stunden. Stell den Regler auf 2.',
      kurz: 'Ohne Auswahl gibt es nichts zu korrigieren.',
    },
    {
      question: 'Kann ein Paar bei Scheffé auffällig sein, bei Tukey aber nicht?', options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Für Paare liegt die Scheffé-Hürde nie unter der von Tukey. Was Scheffé meldet, meldet Tukey also auch, umgekehrt nicht immer.',
      kurz: 'Scheffé ist für Paare immer der strengere Test.',
    },
  ],
  regler: {
    label: 'Wie viele Gruppen werden verglichen?',
    min: 2, max: 10, step: 1, initial: 5,
    format: v => `${Math.round(v)} Gruppen`,
    describe: v => {
      const h = hurdlesFor(v);
      return h.k === 2
        ? `Bei 2 Gruppen mit je 40 Personen braucht ein Unterschied bei allen drei Verfahren mindestens ${num(h.t)} Stunden. Es gibt nur ein Paar.`
        : `Bei ${h.k} Gruppen mit je 40 Personen braucht ein Paar bei Tukey mindestens ${num(h.tukey)} Stunden Unterschied, bei Scheffé ${num(h.scheffe)} Stunden. Ein einzelner t-Test bräuchte ${num(h.t)} Stunden.`;
    },
  },
  check: {
    question: 'Tukey meldet für ein Paar p ≈ 0,023, Scheffé für dasselbe Paar p ≈ 0,06. Wie passt das zusammen?',
    options: [
      'Scheffé hat eine höhere Hürde, weil er jeden denkbaren Vergleich schützt.',
      'Einer der beiden hat sich verrechnet.',
      'Scheffé nutzt weniger Befragte.',
      'Der Unterschied ist bei Scheffé kleiner.',
    ],
    correct: 0,
    right: 'Genau. Dieselbe Differenz, dieselbe Fehlervarianz, aber eine strengere Hürde.',
    diagnose: {
      1: 'Noch nicht ganz. Beide rechnen richtig, nur mit verschiedenen Hürden.',
      2: 'Fast! Beide nutzen alle 200 Befragten und dieselbe Fehlervarianz. Nur die Hürde ist verschieden.',
      3: 'Fast! Die Differenz ist dieselbe, −2,06 Stunden. Nur die Hürde, über die sie springen muss, ist höher.',
    },
  },
  fuerDich: 'Liest du von Scheffé-Vergleichen, weißt du: Hier wurde besonders vorsichtig geprüft. Ein Paar, das bei Scheffé unauffällig ist, kann bei Tukey auffallen, umgekehrt nicht.',
  genau: {
    kurz: 'Scheffé schützt alle Kontraste zugleich und ist für reine Paarvergleiche vorsichtiger als nötig. Er setzt wie Tukey gleiche Streuungen voraus.',
    paragraphs: [
      'mariposa rechnet F = Differenz² / ((k − 1) · MSE · (1/nᵢ + 1/nⱼ)) und vergleicht mit der F-Verteilung mit k − 1 und N − k Freiheitsgraden. Die Intervalle nutzen S = √((k − 1) · F_krit) Standardfehler.',
      'Ein Kontrast ist eine gewichtete Summe von Gruppenmitteln, deren Gewichte zusammen 0 ergeben, etwa (x̄₁ + x̄₂) / 2 − x̄₃. mariposa bietet nur Paarkontraste an; frei eingegebene Kontraste gibt es dort nicht.',
      'Liegt das p des F-Tests der ANOVA nicht unter α, findet Scheffé auch keinen auffälligen Kontrast. Bei Tukey kann das in seltenen Fällen anders sein.',
      'Nach einer mehrfaktoriellen ANOVA nimmt scheffe_test() die rohen Gruppenmittel und die Fehlervarianz des Gesamtmodells.',
    ],
  },
};

// Reiter -------------------------------------------------------------------------------

export const scheffeCountOf = (c: SampleCtx) => { const r = pairsOf(c); return r ? r.pairs.filter(p => p.pScheffe < 0.05).length : null; };

export const scheffeTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', group: 'schulabschluss' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Welche Schulabschlüsse unterscheiden sich in der Lernzeit, wenn jeder denkbare Vergleich geschützt sein soll?',
    value: scheffeCountOf,
    result: c => {
      const r = pairsOf(c);
      if (!r || !(r.mse > 0)) return { kurz: 'Innerhalb der Gruppen streut die Lernzeit nicht. Dann lässt sich kein Paarvergleich rechnen.', fachlich: 'Die Fehlervarianz MSE ist 0.' };
      const s = r.pairs.filter(p => p.pScheffe < 0.05), t = r.pairs.filter(p => p.pTukey < 0.05);
      return {
        kurz: `Bei α = 0,05 meldet Scheffé ${s.length} der ${r.pairs.length} Paare als auffällig, Tukey ${t.length}. Für zwei Gruppen mit je 40 Personen liegt die Scheffé-Hürde bei ${num(hurdle40(r, 'scheffe'))} Stunden, die von Tukey bei ${num(hurdle40(r, 'tukey'))}.`,
        fachlich: `Scheffé nach der einfaktoriellen ANOVA, MSE ≈ ${num(r.mse)} bei ${r.df} Freiheitsgraden. ${s.length ? `Auffällig (p < 0,05), in der Richtung von R: ${s.map(p => `${pairLabel(p)} ${num(p.diff)} h`).join('; ')}.` : 'Bei keinem Paar liegt das p unter α = 0,05.'}`,
        zusatz: `${t.length - s.length === 1 ? 'Ein Paar fällt' : `${t.length - s.length} Paare fallen`} nur bei Tukey auf, keines nur bei Scheffé.`,
      };
    },
    voraussetzung: 'Die Befragten sind unabhängig, die Lernzeit ist in jeder Gruppe annähernd normalverteilt und streut in allen Gruppen ähnlich stark.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit der Zahl der auffälligen Paare?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Alle Gruppenmittel rücken um eine Stunde, ihre Differenzen bleiben. Die Streuung innerhalb der Gruppen bleibt auch, also auch die Hürde.',
        kurz: 'Verschieben ändert nichts an den Vergleichen.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Eine Person gibt 60 Stunden Lernzeit an. Was passiert mit der Scheffé-Hürde?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Der extreme Wert vergrößert die Streuung in seiner Gruppe und damit die gemeinsame Fehlervarianz. Scheffé misst alle Vergleiche an ihr, also steigt die Hürde.',
        kurz: 'Ein Ausreißer macht alle Vergleiche vorsichtiger.',
        tryIt: { label: 'eine Person auf 60 Stunden', op: 'outlier', column: 'x', value: 60 },
        expect: { change: 'up', measure: c => { const r = pairsOf(c); return r ? hurdle40(r, 'scheffe') : null; } },
      },
    ],
  },
  r: {
    entry: 'scheffe_test', variant: 0,
    tokens: {
      scheffe_test: { sym: 'scheffe_test()', term: 'Scheffé-Paarvergleiche', kurz: 'Vergleicht nach oneway_anova() alle Paare mit der strengen Hürde für alle Kontraste. summary() zeigt Differenzen, p-Werte und Intervalle.', fehler: 'scheffe_test() braucht das Ergebnis von oneway_anova() davor. Direkt auf die Daten angewandt meldet mariposa: `scheffe_test()` is not available for objects of class <tbl_df/tbl/data.frame>.' },
      group: { sym: 'group =', term: 'Gruppenvariable', kurz: 'Nennt die Spalte mit den Gruppen, hier die fünf Schulabschlüsse.', fehler: 'Mit nur zwei Gruppen gibt es nur einen Vergleich. Dann sind Scheffé, Tukey und t-Test gleich.' },
    },
    outputMap: [
      { match: '10 comparisons', atlas: 'zehn Paare', step: 1, explain: 'Fünf Gruppen ergeben zehn Paare. Geschützt sind darüber hinaus alle denkbaren Kontraste.' },
      { match: '3 significant', atlas: 'auffällige Paare', step: 3, explain: 'Drei Paare überspringen die Scheffé-Hürde, eines weniger als bei Tukey.' },
      { match: 'p < .05', atlas: 'Signifikanzniveau α', explain: 'Die Schwelle α = 0,05 für die korrigierten p-Werte.' },
    ],
    check: {
      question: 'Wie viele Paare meldet Scheffé als auffällig? Tippe es an.', correct: '3 significant',
      wrong: { '10 comparisons': 'Fast! Das ist die Zahl aller Paare. Auffällig sind weniger.', 'p < .05': 'Fast! Das ist die Schwelle α. Die Zahl der auffälligen Paare steht davor.' },
    },
  },
  next: {
    next: { id: 'multiplicity', why: 'Der gemeinsame Gedanke hinter Tukey, Scheffé, Dunn und Holm: viele Vergleiche, eine Fehlerkontrolle.' },
    before: [
      { id: 'oneway_anova', why: 'Liefert die Gruppenmittel und die gemeinsame Fehlervarianz.' },
      { id: 'tukey_test', why: 'Die mildere Wahl, wenn nur Paare verglichen werden.' },
    ],
    after: [
      { id: 'confidence', why: 'Scheffé liefert zu jedem Paar ein breiteres, simultanes Intervall.' },
    ],
    more: [
      { id: 'f_distribution', why: 'Aus ihr leitet Scheffé seine Hürde ab.' },
      { id: 'type_errors', why: 'Eine strengere Hürde heißt: seltener falscher Alarm, öfter ein übersehener Unterschied.' },
    ],
  },
};
