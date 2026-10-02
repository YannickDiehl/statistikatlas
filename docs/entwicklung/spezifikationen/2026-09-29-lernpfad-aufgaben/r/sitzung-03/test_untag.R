suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
saal <- allbus %>%
  mutate(wahl = untag_na(pv01)) %>%
  filter(wahl != -50, wahl != -42, wahl != -9, wahl != -7)
saal %>% fre(wahl) %>% summary()
str(attributes(saal$wahl))
