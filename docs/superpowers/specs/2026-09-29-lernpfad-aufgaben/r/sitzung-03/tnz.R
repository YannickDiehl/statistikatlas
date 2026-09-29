suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus %>%
  mutate(std = rec(untag_na(dw15), rules = "-10=0; -9=NA; -41=NA; else=copy")) %>%
  describe(std)
