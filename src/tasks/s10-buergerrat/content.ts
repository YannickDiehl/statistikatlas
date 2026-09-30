import type { Hint } from '../kit/HintLadder';

/** Die beiden Ratsmitglieder mit ihren Antworten in den Originalcodes (pe09: 1 voll zu … 4 gar nicht zu; pa02a: 1 sehr stark … 5 überhaupt nicht). */
export type PersonId = 'jana' | 'wiegand';
export type Person = { id: PersonId; name: string; dative: string; age: number; quote: string; pe09: number; pa02a: number; interest: string };
export const PERSONS: Record<PersonId, Person> = {
  jana: { id: 'jana', name: 'Jana', dative: 'Jana', age: 24, quote: '„Bürgerpflicht? Stimme eher nicht zu. Politik interessiert mich wenig.“', pe09: 3, pa02a: 4, interest: 'wenig' },
  wiegand: { id: 'wiegand', name: 'Herr Wiegand', dative: 'Herrn Wiegand', age: 67, quote: '„Bürgerpflicht – stimme eher zu. Politik interessiert mich stark.“', pe09: 2, pa02a: 2, interest: 'stark' },
};

/** Die Zahl auf der Folie des Sachverständigen. */
export const EXPERT_OR = 3.77;
export const CAMPAIGN = '„Wählen ist Ehrensache“';

export const QUESTIONS = [
  '„Heißt 3,77, dass Menschen mit einer Stufe mehr Pflichtgefühl 3,77-mal so wahrscheinlich wählen gehen?“',
  '„Wie wahrscheinlich geht jemand wie Jana wählen, wie wahrscheinlich jemand wie Herr Wiegand – und was ändert jeweils eine Stufe mehr Pflichtgefühl?“',
  '„Bei wem bewirkt unsere Kampagne mehr?“',
  '„Für den Abschlussbericht brauchen wir eine Zahl. Welche?“',
];

export const CAMPAIGN_ANSWERS = [
  { id: 'jana', label: 'bei Jana' },
  { id: 'wiegand', label: 'bei Herrn Wiegand' },
  { id: 'same', label: 'bei beiden gleich' },
  { id: 'depends', label: 'kommt auf die Sprache an' },
] as const;
export type CampaignAnswer = typeof CAMPAIGN_ANSWERS[number]['id'];

export const UNITS = [
  { id: 'pp', label: 'Prozentpunkte' },
  { id: 'pct', label: 'Prozent' },
  { id: 'times', label: '-fach (Faktor)' },
  { id: 'logit', label: 'Logit-Einheiten' },
  { id: 'none', label: 'ohne Einheit' },
] as const;
export type Unit = typeof UNITS[number]['id'];

/** Die sechs typischen Umwege, die der Browser erkennt (Nachwort; ohne Zahlen, weil sie von der Datei abhängen). */
export const DETOURS = [
  { title: 'Ohne Gewicht gerechnet', text: 'Der ALLBUS befragt Ostdeutsche absichtlich häufiger. Für eine Aussage über Deutschland gehört weights = wghtpew in das Modell; ohne Gewicht liegt Exp(B) etwas daneben.' },
  { title: 'Gegenrichtung', text: 'Wer Nichtwahl als 1 kodiert oder beide Skalen nicht umpolt, bekommt Kehrwerte: Aus einem Exp(B) über 1 wird eines unter 1.' },
  { title: 'Eine Skala nicht umgepolt', text: 'pe09 läuft von „stimme voll zu“ (1) bis „stimme gar nicht zu“ (4), pa02a von „sehr stark“ (1) bis „überhaupt nicht“ (5). Ohne rec(…, rules = "rev") heißt ein höherer Wert weniger Pflichtgefühl bzw. weniger Interesse.' },
  { title: 'Nichtwahl zu weit gefasst', text: '„Weiß nicht“, „nicht wahlberechtigt“ (−50) oder alle fehlenden Angaben als 0 zu zählen, verwässert den Vergleich: Wer keine Absicht geäußert hat oder nicht wählen darf, entscheidet sich nicht gegen das Wählen (Sitzung 4).' },
  { title: 'Chance als Wahrscheinlichkeit gelesen', text: 'Eine Chance von 3 heißt „3 zu 1“, also 75 %. Wahrscheinlichkeiten liegen zwischen 0 und 1, Chancen zwischen 0 und unendlich.' },
  { title: 'Exp(B) als „x-mal so wahrscheinlich“ gelesen', text: 'Exp(B) vervielfacht die Chance, nicht die Wahrscheinlichkeit. Wer schon zu 80 % wählt, kann nicht dreimal so wahrscheinlich wählen – das wären 240 %.' },
] as const;

export const WORKSHOP = '9 Erklärungsmodelle (9.8 Logistische Regression), zu rec() Kap. 5';

/* ---------- R-Code (Hilfestufen und Lösungsskripte) ---------- */

export const R_START = `library(dplyr)
library(mariposa)   # zuletzt laden: haven würde sonst read_spss() überdecken

allbus <- read_spss(file.choose())   # ZA8831_v1-3-0.sav`;

const R_RECODE = `# Wählen 1/0 aus pv01 – fehlende Angaben (auch −50 „nicht wahlberechtigt“) bleiben NA; beide Skalen umpolen
allbus <- allbus %>%
  mutate(
    waehlen   = rec(pv01, rules = "1:90=1 [würde wählen]; 91=0 [würde nicht wählen]; else=NA"),
    pflicht   = rec(pe09, rules = "rev"),   # 1 = stimme gar nicht zu … 4 = stimme voll zu
    interesse = rec(pa02a, rules = "rev")   # 1 = überhaupt nicht … 5 = sehr stark
  )`;

const R_MODEL = `# Überblick: Wahlabsicht je Stufe Pflichtgefühl (Zeilenprozente, gewichtet)
allbus %>% crosstab(pflicht, waehlen, percentages = "row", weights = wghtpew) %>% summary()

# Das Modell des Sachverständigen. Die Warnmeldung „Nicht-ganzzahlige #Erfolge in einem binomial-GLM“
# ist harmlos: Sie erscheint nur, weil die Gewichte keine ganzen Zahlen sind.
modell <- allbus %>%
  logistic_regression(waehlen ~ pflicht + interesse, weights = wghtpew)
summary(modell)`;

const R_JANA = `# Station 2: Jana von Hand übersetzen – Logit → Chance → Wahrscheinlichkeit
b <- coef(modell)
logit_jana  <- b[["(Intercept)"]] + b[["pflicht"]] * 2 + b[["interesse"]] * 2
chance_jana <- exp(logit_jana)
p_jana      <- chance_jana / (1 + chance_jana)
c(logit = logit_jana, chance = chance_jana, p = p_jana)`;

const R_PROFILES = `# Station 4: beide Ratsmitglieder, jeweils mit einer Stufe mehr Pflichtgefühl
profile <- tibble(
  person    = c("Jana", "Jana, eine Stufe mehr", "Herr Wiegand", "Herr Wiegand, eine Stufe mehr"),
  pflicht   = c(2, 3, 3, 4),
  interesse = c(2, 2, 4, 4)
)
profile %>%
  mutate(
    p_waehlen = predict(modell, newdata = profile, type = "response"),
    chance    = p_waehlen / (1 - p_waehlen)
  )`;

const R_AME = `# Station 5: durchschnittlicher marginaler Effekt – mittlere Änderung der Wahrscheinlichkeit je Stufe
modell %>% marginal_effects() %>% summary()`;

const R_LIKELIHOOD = `# Station 6: Trefferquote gegen Likelihood
# summary(modell) oben zeigt die Classification Table (Overall Percentage) und −2 Log Likelihood
k <- modell$classification
k$n_1 / (k$n_0 + k$n_1) * 100            # Trefferquote der Regel „alle wählen“
modell$null.deviance                     # −2LL des Nullmodells (nur die Konstante)
modell$deviance                          # −2LL deines Modells`;

const join = (...parts: string[]) => parts.join('\n\n');
export const R_SOLUTION = {
  model: join(R_START, R_RECODE, R_MODEL),
  jana: join(R_START, R_RECODE, R_MODEL, R_JANA),
  profiles: join(R_START, R_RECODE, R_MODEL, R_PROFILES),
  ame: join(R_START, R_RECODE, R_MODEL, R_AME),
  likelihood: join(R_START, R_RECODE, R_MODEL, R_LIKELIHOOD),
  full: join(R_START, R_RECODE, R_MODEL, R_JANA, R_PROFILES, R_AME),
};

export const hints: Record<'model' | 'jana' | 'profiles' | 'ame' | 'likelihood', Hint> = {
  model: {
    think: 'pv01 ist keine 0/1-Variable. Welche Codes heißen „würde wählen“, welcher „würde nicht wählen“? Und in welche Richtung laufen pe09 und pa02a – heißt ein höherer Wert mehr oder weniger Pflichtgefühl?',
    pointer: 'rec() baut die 0/1-Variable und polt Skalen um (rules = "rev"); logistic_regression() schätzt das Modell, mit weights = wghtpew für Deutschland. Exp(B) steht in summary(). Die Warnmeldung „Nicht-ganzzahlige #Erfolge in einem binomial-GLM“ ist harmlos – sie meldet nur, dass die Gewichte keine ganzen Zahlen sind.',
    concept: { id: 'logistic_regression', label: 'Logistische Regression' },
    scaffold: `allbus <- allbus %>%
  mutate(
    waehlen   = rec(pv01, rules = "___=1 [würde wählen]; ___=0 [würde nicht wählen]; else=NA"),
    pflicht   = rec(pe09, rules = "___"),
    interesse = rec(pa02a, rules = "___")
  )
modell <- allbus %>% logistic_regression(___ ~ ___ + ___, weights = ___)
summary(modell)`,
    solution: R_SOLUTION.model,
  },
  jana: {
    think: 'Das Modell rechnet in Logits. Setz Janas Antworten ein – aber auf den umgepolten Skalen: Welcher Wert wird aus „stimme eher nicht zu“ und aus „wenig“?',
    pointer: 'Logit = Konstante + B × Wert (für jeden Prädiktor, B aus der Spalte B). Chance = exp(Logit). Wahrscheinlichkeit = Chance / (1 + Chance).',
    concept: { id: 'logit', label: 'Wahrscheinlichkeit, Odds & Logit' },
    scaffold: `b <- coef(modell)
logit_jana  <- b[["(Intercept)"]] + b[["pflicht"]] * ___ + b[["interesse"]] * ___
chance_jana <- ___(logit_jana)
p_jana      <- chance_jana / (___ + chance_jana)
c(logit = logit_jana, chance = chance_jana, p = p_jana)`,
    solution: R_SOLUTION.jana,
  },
  profiles: {
    think: 'In Chancen brauchst du kein R: Eine Stufe mehr Pflichtgefühl multipliziert die Chance mit Exp(B). Für Wahrscheinlichkeiten hilft predict() – mit erfundenen Profilen für beide Ratsmitglieder.',
    pointer: 'predict(modell, newdata = profile, type = "response") liefert Wahrscheinlichkeiten; ohne type = "response" kommen Logits heraus. Herr Wiegand: „stimme eher zu“ und „stark“ – wieder auf den umgepolten Skalen.',
    concept: { id: 'logit', label: 'Wahrscheinlichkeit, Odds & Logit' },
    scaffold: `profile <- tibble(
  person    = c("Jana", "Jana, eine Stufe mehr", "Herr Wiegand", "Herr Wiegand, eine Stufe mehr"),
  pflicht   = c(___, ___, ___, ___),
  interesse = c(___, ___, ___, ___)
)
profile %>% mutate(p_waehlen = predict(modell, newdata = profile, type = "___"))`,
    solution: R_SOLUTION.profiles,
  },
  ame: {
    think: 'Welche Zahl gilt für alle – und welche versteht jemand ohne Statistik? Der durchschnittliche marginale Effekt (AME) mittelt die Änderung der Wahrscheinlichkeit über alle Befragten.',
    pointer: 'marginal_effects() berechnet den AME je Prädiktor als Anteil: 0,05 heißt 5 Prozentpunkte. Prozentpunkte sind Differenzen von Prozentwerten, keine Prozente.',
    concept: { id: 'marginal_effects', label: 'Marginale Effekte' },
    scaffold: 'modell %>% ___() %>% summary()',
    solution: R_SOLUTION.ame,
  },
  likelihood: {
    think: 'Wie oft läge die simple Regel „alle wählen“ richtig? Und was misst −2LL, wenn nicht die Trefferquote?',
    pointer: 'summary(modell) zeigt die Classification Table (Overall Percentage) und −2 Log Likelihood. Das Nullmodell hat nur die Konstante; seine −2LL steht in modell$null.deviance.',
    concept: { id: 'likelihood', label: 'Likelihood' },
    scaffold: `summary(modell)
k <- modell$classification
k$n_1 / (k$n_0 + ___) * 100
modell$___   # −2LL des Nullmodells
modell$___   # −2LL des Modells`,
    solution: R_SOLUTION.likelihood,
  },
};
