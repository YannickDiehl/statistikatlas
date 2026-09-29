import type { Hint } from '../kit/HintLadder';

export type AntragId = 'horoskop' | 'gefluechtete' | 'politik' | 'einsamkeit';
export const ANTRAG_IDS: readonly AntragId[] = ['horoskop', 'gefluechtete', 'politik', 'einsamkeit'];

export type Antrag = {
  id: AntragId;
  text: string;
  /** Rückmeldung zu Variablen, die man für diese Idee übernehmen könnte (spiegelt, bewertet nicht). */
  catalog: Record<string, string>;
  /** Reaktion der Kollegin auf den Stempel „beauftragen“. */
  onAsk: { tone: 'ok' | 'hint'; text: string; needsReason: boolean };
  hint: Hint;
};

export const SETUP_SCRIPT = `library(mariposa)

# ZA8831_v1-3-0.sav auswählen (nach Registrierung bei GESIS)
allbus <- read_spss(file.choose())

# Suchen und nachschlagen – codebook() immer mit Variablen, sonst dauert es lange
find_var(allbus, "horoskop")
codebook(allbus, rh08b)
`;

export const handshakeHint: Hint = {
  think: 'Welches Fenster in RStudio zeigt, welche Objekte R gerade kennt?',
  pointer: 'Oben rechts im Environment steht allbus mit „… obs. of … variables“. Klappt das Einlesen nicht, füg die Fehlermeldung unten in den Fehler-Decoder ein.',
  concept: { id: 'data_import', label: 'Daten nach R einlesen' },
  workshop: 'Kap. 1, Environment und History',
  scaffold: 'library(mariposa)\nallbus <- ____(file.choose())',
  solution: SETUP_SCRIPT,
};

export const antraege: Antrag[] = [
  {
    id: 'horoskop',
    text: 'Halten die Leute eigentlich etwas von Horoskopen?',
    catalog: { rh08b: 'Passt: Die Frage misst genau, was man von Astrologie und Horoskopen hält.' },
    onAsk: { tone: 'hint', text: 'Die Kollegin zögert: „Such mal nach ‚astro‘ – ich meine, der ALLBUS fragt danach.“', needsReason: true },
    hint: {
      think: 'find_var() findet auch Wortteile. Ein kurzes Suchwort reicht.',
      pointer: 'find_var() durchsucht Namen und Labels, codebook() zeigt Fragetext, Werte und fehlende Angaben.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.1 find_var()',
      scaffold: 'find_var(allbus, "____")\ncodebook(allbus, ____)',
      solution: 'find_var(allbus, "horoskop")\ncodebook(allbus, rh08b)',
    },
  },
  {
    id: 'gefluechtete',
    text: 'Wie viele haben Angst vor Geflüchteten?',
    catalog: {
      mp16: 'Misst, ob Geflüchtete eher als Chance oder als Risiko für den Sozialstaat gesehen werden. Ist „Risiko“ dasselbe wie Angst?',
      mp17: 'Misst Chance oder Risiko für die Sicherheit. Ist „Risiko“ dasselbe wie Angst?',
      mp18: 'Misst Chance oder Risiko für das Zusammenleben. Ist „Risiko“ dasselbe wie Angst?',
      mp19: 'Misst Chance oder Risiko für die Wirtschaft. Ist „Risiko“ dasselbe wie Angst?',
      mi05: 'Misst, ob man den Zuzug von Kriegsflüchtlingen begrenzen will – eine Forderung, kein Gefühl.',
    },
    onAsk: { tone: 'hint', text: 'Einspruch der Kollegin: „Wie schreibt der ALLBUS eigentlich ‚ü‘? Versuch es mit einem Wortstamm.“', needsReason: true },
    hint: {
      think: 'Welches Wort stünde in einem kurzen Label in GROSSBUCHSTABEN – und wie ohne Umlaute?',
      pointer: 'Labels im ALLBUS sind gekürzt und ohne Umlaute geschrieben.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.1 find_var()',
      scaffold: 'find_var(allbus, "fl____")\ncodebook(allbus, ____)',
      solution: 'find_var(allbus, "fluecht")\ncodebook(allbus, mi05, mp16, mp17, mp18, mp19)',
    },
  },
  {
    id: 'politik',
    text: 'Vertrauen die Menschen der Politik noch?',
    catalog: {
      pt03: 'Vertrauen in den Bundestag. Meint „die Politik“ das Parlament?',
      pt12: 'Vertrauen in die Bundesregierung. Meint „die Politik“ die Regierung?',
      pt15: 'Vertrauen in die politischen Parteien. Meint „die Politik“ die Parteien?',
      st01: 'Vertrauen zu Mitmenschen – das ist nicht die Politik.',
      pe01: 'Die Aussage „Politiker kümmern sich nicht um meine Gedanken“ misst Unzufriedenheit, aber kein Vertrauen.',
    },
    onAsk: { tone: 'hint', text: 'Einspruch der Kollegin: „‚vertrauen‘ ergibt 16 Treffer. Bist du sicher, dass keiner passt?“', needsReason: true },
    hint: {
      think: '„Vertrauen“ findet viele Fragen. Welche Einrichtung meint „die Politik“?',
      pointer: 'Mehrere Treffer vergleichst du, indem du sie zusammen in codebook() schreibst. Achte auf „TNZ: SPLIT“ bei den fehlenden Werten.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.2 codebook()',
      scaffold: 'find_var(allbus, "____")\ncodebook(allbus, ____, ____, ____)',
      solution: 'find_var(allbus, "vertrauen")\ncodebook(allbus, pt03, pt12, pt15)',
    },
  },
  {
    id: 'einsamkeit',
    text: 'Wie einsam sind die Menschen?',
    catalog: {
      dp03: 'Scheintreffer: gemEINSAMer Haushalt mit dem Lebenspartner.',
      xs01: 'Scheintreffer: ob das Interview allein durchgeführt wurde.',
      li04: 'Nah dran: wie wichtig Freunde und Bekannte sind – aber nicht, ob man sich einsam fühlt.',
    },
    onAsk: { tone: 'ok', text: 'Die Kollegin: „Ich finde auch nur Scheintreffer. Dein Stempel geht so durch.“', needsReason: false },
    hint: {
      think: 'Prüf jeden Treffer: Steckt das Wort wirklich drin – oder nur als Teil eines anderen Worts?',
      pointer: 'Ein Treffer ist erst ein Kandidat. Ob die Frage passt, zeigt der Fragetext im Codebuch.',
      concept: { id: 'codebook', label: 'Codebuch & Variablensuche' },
      workshop: '4.4.2 codebook()',
      scaffold: 'find_var(allbus, "____")\ncodebook(allbus, ____)',
      solution: 'find_var(allbus, "einsam")\nfind_var(allbus, "allein")\ncodebook(allbus, dp03, xs01, li04)',
    },
  },
];
export const antragById = Object.fromEntries(antraege.map(a => [a.id, a])) as Record<AntragId, Antrag>;

/** Typische Fehlermeldungen beim Einstieg (deutsch und englisch). */
export const ERROR_PATTERNS: { pattern: RegExp; cause: string; fix: string }[] = [
  { pattern: /there is no package called|es gibt kein Paket/i, cause: 'mariposa ist noch nicht installiert.', fix: 'Einmal install.packages("mariposa") ausführen, danach library(mariposa).' },
  { pattern: /could not find function "%>%"|Funktion "%>%" nicht finden/i, cause: 'Die Pipe %>% kommt aus dplyr.', fix: 'library(dplyr) ausführen – in dieser Sitzung geht es auch ohne Pipe.' },
  { pattern: /could not find function|konnte Funktion .* nicht finden/i, cause: 'Das Paket ist nicht geladen oder der Funktionsname ist vertippt.', fix: 'library(mariposa) ausführen und die Schreibweise prüfen.' },
  { pattern: /object '.*' not found|Objekt '.*' nicht gefunden/i, cause: 'R kennt dieses Objekt nicht.', fix: 'Die Zeile mit allbus <- read_spss(…) zuerst ausführen und die Schreibweise prüfen.' },
  { pattern: /cannot open|kann .* nicht öffnen|does not exist|existiert nicht/i, cause: 'Die Datei wurde nicht gefunden.', fix: 'read_spss(file.choose()) nutzen und die Datei im Dialog auswählen. Unter macOS liegt der Dialog manchmal hinter RStudio.' },
  { pattern: /file choice cancelled|Dateiauswahl abgebrochen/i, cause: 'Der Auswahldialog wurde geschlossen.', fix: 'Die Zeile noch einmal ausführen und die Datei auswählen.' },
  { pattern: /unexpected|unerwartete/i, cause: 'Tippfehler im Code: meist eine fehlende Klammer, ein Komma oder ein Anführungszeichen.', fix: 'Die Zeile Zeichen für Zeichen mit der Vorlage vergleichen.' },
  { pattern: /No variables found/i, cause: 'find_var() hat keinen Treffer.', fix: 'Anders suchen: ohne Umlaute (ae, oe, ue), mit Wortstamm oder Synonym.' },
];
