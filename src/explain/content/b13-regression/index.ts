// Bereich B13 „Regression“. Begriffe (Spezifikation Ausbau, Abschnitt 6): prediction, residuals, interaction, logit, likelihood, linear_regression, logistic_regression, marginal_effects, explained_variance, outliers_influence, multicollinearity, overfitting.
// Je Begriff eine Datei in diesem Ordner, hier nur eintragen. Anleitung: src/explain/AUTHORING.md.
// Werkstatt „Gerade“ (gerade.ts) für linear_regression, prediction und residuals.
import type { AreaIndex } from '../../types';
import { gerade } from './gerade';
import { linearRegressionTabs, predictionTabs, residualsTabs } from './gerade-tabs';

export const b13Regression: AreaIndex = {
  explanations: {
    linear_regression: { kind: 'werkstatt', workshop: gerade, variant: 'linear_regression' },
    prediction: { kind: 'werkstatt', workshop: gerade, variant: 'prediction' },
    residuals: { kind: 'werkstatt', workshop: gerade, variant: 'residuals' },
  },
  tabs: {
    linear_regression: linearRegressionTabs,
    prediction: predictionTabs,
    residuals: residualsTabs,
  },
};
