suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
exp <- allbus %>%
  filter(!is.na(splt23_3)) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; 3:4=10 [10 Euro]"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]"),
    papier       = rec(mode, rules = "3=0 [online]; 4=1 [Papier]")
  )
online <- exp %>% filter(mode == 3)
cat("\n#### ANOVA online 4 Gruppen\n")
a <- online %>% oneway_anova(zusage, group = splt23_3)
summary(a)
a %>% tukey_test()
cat("\n#### ANOVA alle 4 Gruppen\n")
exp %>% oneway_anova(zusage, group = splt23_3)
cat("\n#### Modus (nicht experimentell)\n")
exp %>% t_test(zusage, age, group = papier)
cat("\n#### Balance: Alter nach Wiederholung, alle vs online\n")
exp %>% t_test(age, group = wiederholung)
online %>% t_test(age, group = wiederholung)
online %>% oneway_anova(age, group = splt23_3)
