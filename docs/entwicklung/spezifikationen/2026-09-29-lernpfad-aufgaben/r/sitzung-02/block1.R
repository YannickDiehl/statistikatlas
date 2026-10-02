suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus %>% codebook(pa02a, pa01, pt03, st01, pv01, ls01, mode, splt23_1) %>% summary()
