suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
exp <- allbus %>%
  filter(!is.na(splt23_3)) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; 3:4=10 [10 Euro]"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]")
  )
online <- exp %>% filter(mode == 3)
papier <- exp %>% filter(mode == 4)
# availability of split items among selfadmin
print(exp %>% summarise(across(c(pt11, pt03, ps03, pa02a, ls01, age, isced97, hs01, pa01), ~ sum(!is.na(.x)))))
print(exp %>% group_by(s1 = as.numeric(splt23_1)) %>% summarise(across(c(pt11, pt03, ps03), ~ sum(!is.na(.x)))))
cat("\n#### Betrag alle\n"); exp %>% t_test(zusage, group = betrag) %>% summary(effect_sizes = FALSE)
cat("\n#### Betrag online\n"); online %>% t_test(zusage, group = betrag) %>% summary()
cat("\n#### Betrag papier\n"); papier %>% t_test(zusage, group = betrag) %>% summary()
cat("\n#### Betrag alle gewichtet\n"); exp %>% t_test(zusage, group = betrag, weights = wghtpew)
cat("\n#### Wiederholung alle gewichtet\n"); exp %>% t_test(zusage, group = wiederholung, weights = wghtpew)
cat("\n#### Wiederholung online gewichtet\n"); online %>% t_test(zusage, group = wiederholung, weights = wghtpew)
