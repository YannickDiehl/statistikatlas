library(mariposa)
library(dplyr)
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# Karte "Konfession" (nominal)
allbus <- allbus %>%
  mutate(konf = rec(rd01, rules = "1:2=1 [evangelisch]; 3=2 [katholisch]; 4:5=3 [andere]; 6=4 [keine]; else=NA"))
allbus %>% crosstab(konf, ps03, percentages = "row", weights = wghtpew) %>% summary()
allbus %>% cramers_v(ps03, konf, weights = wghtpew)
allbus %>% cramers_v(ps03, konf)
allbus %>% group_by(eastwest) %>% cramers_v(ps03, konf)

# Karte "Alter" (metrisch)
allbus <- allbus %>%
  mutate(altersgruppe = rec(age, rules = "18:29=1 [18-29]; 30:44=2 [30-44]; 45:59=3 [45-59]; 60:74=4 [60-74]; 75:max=5 [75+]; else=NA"))
allbus %>% crosstab(altersgruppe, ps03, percentages = "row", weights = wghtpew)
allbus %>% pearson_cor(ps03, age, weights = wghtpew)
allbus %>% pearson_cor(ps03, age)
allbus %>% group_by(eastwest) %>% pearson_cor(ps03, age)

# Karte "Wohnort" (ordinal)
allbus %>% unlabel(ps03, gs01, wghtpew) %>% kendall_tau(ps03, gs01, weights = wghtpew)
allbus %>% unlabel(ps03, gs01) %>% group_by(eastwest) %>% kendall_tau(ps03, gs01)

# Karte "Ost/West" (nominal, zweistufig)
allbus %>% cramers_v(ps03, eastwest, weights = wghtpew)
allbus %>% cramers_v(ps03, eastwest)
allbus %>% goodman_gamma(ps03, eastwest, weights = wghtpew)
allbus %>% goodman_gamma(ps03, eastwest)
