import type { TaskId } from '../tasks/types';

export const workshopUrl = 'https://rloesung.github.io/RWorkshop/';

/** Ein Begriff aus dem Sitzungsplan; ohne `concept` fehlt er der Karte noch. */
export type Term = { label: string; concept?: string };
export type Session = {
  id: number;
  plan: string;
  title: string;
  short: string;
  question: string;
  repetition: Term[];
  introduced: Term[];
  /** Die Aufgabe der Sitzung (Einzelanfertigung, `src/tasks/`). */
  task: TaskId | null;
};

const t = (label: string, concept?: string): Term => ({ label, concept });

// Gliederung nach „Statistik im WiSe 24/25“; die gestrichenen Sitzungen 7–8 (EFA) entfallen.
export const sessions: Session[] = [
  {
    id: 1, plan: 'Sitzungsplan 1', title: 'Einstieg', short: 'R, RStudio, ALLBUS',
    question: 'Wie kommen die Daten auf meinen Rechner?',
    repetition: [],
    introduced: [t('R und RStudio'), t('Daten nach R einlesen', 'data_import'), t('Codebuch & Variablensuche', 'codebook')],
    task: 's01',
  },
  {
    id: 2, plan: 'Sitzungsplan 2', title: 'Vom Fragebogen zum Datensatz', short: 'Datenmatrix, Labels',
    question: 'Was steht eigentlich in einer Zeile des ALLBUS?',
    repetition: [t('Datenmatrix'), t('Variable'), t('Fall'), t('Wert'), t('Datenreihe', 'series')],
    introduced: [t('Variablen- & Wertelabels', 'labels'), t('Codebuch & Variablensuche', 'codebook'), t('Datentypen umwandeln', 'conversion')],
    task: 's02',
  },
  {
    id: 3, plan: 'Sitzungsplan 3', title: 'Erste Auszählung', short: 'Häufigkeiten, fehlende Werte',
    question: 'Wie viele interessieren sich eigentlich für Politik?',
    repetition: [t('Nominale Kategorien', 'nominal'), t('Geordnete Kategorien', 'ordinal'), t('Metrisches Skalenniveau', 'metric'), t('Arithmetisches Mittel', 'mean'), t('Median', 'median'), t('Standardabweichung', 'sd'), t('Häufigkeiten', 'frequency'), t('Balkendiagramm'), t('Boxplot'), t('Schiefe & Kurtosis', 'shape')],
    introduced: [t('Fehlende Angaben', 'missing'), t('Missing-Codes aufbereiten', 'missing_tools'), t('Fälle auswählen'), t('Deskriptiver Überblick', 'describe')],
    task: 's03',
  },
  {
    id: 4, plan: 'Sitzungsplan 4', title: 'Kreuztabellen', short: 'Prozentbasen, Umkodieren',
    question: 'Gehen Misstrauende nicht mehr wählen?',
    repetition: [t('AV und UV'), t('Kausalität', 'causality'), t('Grundgesamtheit & Parameter', 'population_parameter'), t('Stichprobe & Unabhängigkeit', 'sampling'), t('Chi-Quadrat · Unabhängigkeit', 'chi_square')],
    introduced: [t('Kreuztabelle', 'crosstab'), t('Zeilen-, Spalten-, Zellenprozente'), t('Rekodieren & Umpolen', 'recode'), t('Dummyvariablen', 'dummy'), t('Rechnen innerhalb einer Person', 'row_operations')],
    task: 's04',
  },
  {
    id: 5, plan: 'Sitzungsplan 5', title: 'Gewichtung und Zusammenhang', short: 'Gewichte, Zusammenhangsmaße',
    question: 'Was hängt mit der Zufriedenheit mit der Demokratie zusammen?',
    repetition: [],
    introduced: [t('Gewichte', 'weights'), t('Drittvariable'), t('Confounding · gemeinsame Ursachen', 'confounding'), t('Phi', 'phi'), t('Cramér-V', 'cramers_v'), t('Goodman–Kruskal-Gamma', 'goodman_gamma'), t('Kendall Tau-b', 'kendall_tau'), t('Spearman-Korrelation', 'spearman'), t('Pearson-Korrelation', 'pearson')],
    task: 's05',
  },
  {
    id: 6, plan: 'Sitzungsplan 6', title: 'Mittelwerte vergleichen', short: 't-Test, ANOVA',
    question: 'Unterscheiden sich Gruppen im Mittel?',
    repetition: [t('Normalverteilung', 'normal_distribution')],
    introduced: [t('t-Test', 't_test'), t('Einfaktorielle ANOVA', 'oneway_anova'), t('Korrelationsmatrix', 'correlation_matrix')],
    task: null,
  },
  {
    id: 7, plan: 'Sitzungsplan 9', title: 'Index und Skala', short: 'Reliabilität, Cronbachs α',
    question: 'Wie misst man Populismus mit mehreren Fragen?',
    repetition: [t('Validität', 'validity'), t('Messfehler', 'measurement_error')],
    introduced: [t('Mittelwertindex', 'row_operations'), t('Skalenwert pro Person', 'item_score'), t('Kombinationsindex'), t('Reliabilität · Alpha & Omega', 'reliability')],
    task: null,
  },
  {
    id: 8, plan: 'Sitzungsplan 10', title: 'Lineare Regression', short: 'Modell, Residuen, R²',
    question: 'Was sagt eine Gerade über politische Einstellungen?',
    repetition: [],
    introduced: [t('Lineare Regression', 'linear_regression'), t('Linearer Prädiktor', 'prediction'), t('Residuen & kleinste Quadrate', 'residuals'), t('Erklärter Varianzanteil · R²', 'explained_variance'), t('Gleiche Fehlervarianz', 'variance_assumption')],
    task: 's08',
  },
  {
    id: 9, plan: 'Sitzungsplan 11', title: 'Regression vertiefen', short: 'mehrere Prädiktoren',
    question: 'Was bleibt, wenn man mehr berücksichtigt?',
    repetition: [],
    introduced: [t('Dummyvariablen', 'dummy'), t('Multikollinearität', 'multicollinearity'), t('Ausreißer & Einfluss', 'outliers_influence'), t('Interaktion', 'interaction'), t('Confounding · gemeinsame Ursachen', 'confounding')],
    task: 's09',
  },
  {
    id: 10, plan: 'Sitzungsplan 12', title: 'Logistische Regression', short: 'Odds, Logit',
    question: 'Wer geht wählen – und wie wahrscheinlich?',
    repetition: [],
    introduced: [t('Wahrscheinlichkeit, Odds & Logit', 'logit'), t('Logistische Regression', 'logistic_regression'), t('Likelihood', 'likelihood'), t('Marginale Effekte', 'marginal_effects')],
    task: null,
  },
];

