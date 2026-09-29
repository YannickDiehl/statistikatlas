suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
summary(allbus %>% frequency(ingle, weights = wghtpew))
summary(allbus %>% crosstab(ingle, eastwest, percentages = "col", weights = wghtpew))
