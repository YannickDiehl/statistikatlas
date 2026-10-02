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
cat("#### Zufallscheck alle\n")
exp %>% pearson_cor(wiederholung, betrag, papier, age, zusage)
cat("#### Zufallscheck online\n")
exp %>% filter(mode == 3) %>% pearson_cor(wiederholung, betrag, age, zusage)
cat("#### Zufallscheck online, Matrix\n")
exp %>% filter(mode == 3) %>% pearson_cor(wiederholung, betrag, age, zusage) %>% summary(pairwise = FALSE, sample_size = FALSE)
