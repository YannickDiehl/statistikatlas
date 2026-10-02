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
cat("\n######## 2) Wiederholung, alle\n")
exp %>% t_test(zusage, group = wiederholung) %>% summary()
cat("\n######## 3) Wiederholung, nur online\n")
online %>% t_test(zusage, group = wiederholung) %>% summary()
