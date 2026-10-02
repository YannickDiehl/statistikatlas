library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# 1 Variablen vorbereiten
allbus <- allbus %>%
  mutate(
    waehlen   = rec(pv01, rules = "1:90=1 [würde wählen]; 91=0 [würde nicht wählen]; else=NA"),
    pflicht   = rec(pe09, rules = "rev"),   # 1 = stimme gar nicht zu ... 4 = stimme voll zu
    interesse = rec(pa02a, rules = "rev")   # 1 = überhaupt nicht ... 5 = sehr stark
  )

allbus %>% crosstab(pflicht, waehlen, percentages = "row", weights = wghtpew) %>% summary()

# 2 Modell des Gutachtens nachrechnen
modell <- allbus %>%
  logistic_regression(waehlen ~ pflicht + interesse, weights = wghtpew)
summary(modell)

# 3 Jana von Hand übersetzen: Logit -> Chance -> Wahrscheinlichkeit
b <- coef(modell)
logit_jana <- b[["(Intercept)"]] + b[["pflicht"]] * 2 + b[["interesse"]] * 2
chance_jana <- exp(logit_jana)
p_jana <- chance_jana / (1 + chance_jana)
c(logit = logit_jana, chance = chance_jana, p = p_jana)

# 4 Beide Ratsmitglieder, jeweils mit einer Stufe mehr Pflichtgefühl
profile <- tibble(
  person    = c("Jana", "Jana, eine Stufe mehr", "Herr Brandt", "Herr Brandt, eine Stufe mehr"),
  pflicht   = c(2, 3, 3, 4),
  interesse = c(2, 2, 4, 4)
)
profile %>%
  mutate(
    p_waehlen = predict(modell, newdata = profile, type = "response"),
    chance    = p_waehlen / (1 - p_waehlen)
  )

# 5 Eine Zahl für den Bericht: durchschnittlicher marginaler Effekt
modell %>% marginal_effects() %>% summary()
