suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus %>% mutate(ost = rec(eastwest, rules = "1=0 [West]; 2=1 [Ost]; else=NA")) %>% t_test(ls01, group = ost) %>% summary(effect_sizes = FALSE)
