suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
exp <- allbus %>%
  filter(mode != 2) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]; else=NA"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; 3:4=10 [10 Euro]; else=NA"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]; else=NA")
  )
exp %>% crosstab(splt23_3, mode, percentages = "none") %>% summary()
online <- exp %>% filter(mode == 3)
online %>% t_test(zusage, group = betrag, weights = wghtpew) %>% summary(effect_sizes = FALSE)
online %>% t_test(zusage, group = wiederholung, weights = wghtpew) %>% summary(effect_sizes = FALSE)
exp %>% t_test(zusage, group = wiederholung, weights = wghtpew) %>% summary(effect_sizes = FALSE)
online %>% oneway_anova(zusage, group = splt23_3, weights = wghtpew) %>% summary()
