library(mariposa)
library(dplyr)
packageVersion("mariposa")
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# Schritt 1: Codes nachschlagen
cb <- allbus %>% codebook(pa02a, pa01, pt03, st01, pv01, ls01, view = FALSE)
summary(cb)
val_labels(allbus, pv01)
var_label(allbus, pt03, st01)
find_var(allbus, "VERTRAUEN")
