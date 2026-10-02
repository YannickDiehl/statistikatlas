library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

exp <- allbus %>%
  filter(!is.na(splt23_3)) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; 3:4=10 [10 Euro]"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]")
  )

cat("\n######## 1) Betrag, alle Selbstausfüller\n")
exp %>% t_test(zusage, group = betrag)
cat("\n######## 2) Wiederholung, alle Selbstausfüller\n")
exp %>% t_test(zusage, group = wiederholung)
cat("\n######## 3) Wiederholung, getrennt nach Modus\n")
exp %>% group_by(mode) %>% t_test(zusage, group = wiederholung)
cat("\n######## 4) Betrag, getrennt nach Modus\n")
exp %>% group_by(mode) %>% t_test(zusage, group = betrag)
