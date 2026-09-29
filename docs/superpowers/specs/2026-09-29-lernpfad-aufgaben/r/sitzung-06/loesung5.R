suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
exp <- allbus %>%
  filter(!is.na(splt23_3)) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]"),
    interesse    = rec(pa02a, rules = "rev"),
    papier       = rec(mode, rules = "3=0 [online]; 4=1 [Papier]")
  )
online <- exp %>% filter(mode == 3)
online %>% oneway_anova(zusage, group = splt23_3) %>% tukey_test() %>% summary()
exp %>% t_test(age, group = wiederholung) %>% summary(effect_sizes = FALSE)
exp %>% t_test(zusage, age, group = papier) %>% summary(effect_sizes = FALSE)
cat("\n#### Korrelationsmatrix Selbstausfüller\n")
exp %>% pearson_cor(zusage, age, interesse, isced97, ls01, papier) %>% summary()
cat("\n#### gewichtet\n")
exp %>% pearson_cor(zusage, age, interesse, isced97, ls01, weights = wghtpew)
cat("\n#### Korrelation nur online\n")
online %>% pearson_cor(zusage, age, interesse, isced97, ls01)
