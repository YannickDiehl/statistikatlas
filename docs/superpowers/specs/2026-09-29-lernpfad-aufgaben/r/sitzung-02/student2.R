suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus %>% frequency(mode) %>% summary()
allbus %>% group_by(mode) %>% frequency(pa01) %>% summary()
