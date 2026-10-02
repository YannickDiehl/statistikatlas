library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# 1 · Hinschauen
allbus %>%
  crosstab(ep01, ps03, percentages = "row", weights = wghtpew)

# 2 · Messen: Waehrung waehlen
allbus %>% cramers_v(ps03, ep01, weights = wghtpew)
allbus %>% goodman_gamma(ps03, ep01, weights = wghtpew)
allbus %>%
  unlabel(ps03, ep01, wghtpew) %>%          # macht kendall_tau() schnell
  kendall_tau(ps03, ep01, weights = wghtpew)
allbus %>% spearman_rho(ps03, ep01)
allbus %>% pearson_cor(ps03, ep01, weights = wghtpew)

# 3 · Gewicht: hier mit und ohne
allbus %>% goodman_gamma(ps03, ep01)

# 4 · Drittvariable Ost/West
allbus %>%
  group_by(eastwest) %>%
  goodman_gamma(ps03, ep01)
allbus %>%
  unlabel(ps03, ep01) %>%
  group_by(eastwest) %>%
  kendall_tau(ps03, ep01)
