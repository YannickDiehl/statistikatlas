suppressPackageStartupMessages(library(mariposa))
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
print(codebook(allbus, view = FALSE))
summary(codebook(allbus, ls01, rh08b, pt03, pt12, pt15, mp16, mp17, mp18, mp19, mi05, li04, dp03, xs01, pe01, view = FALSE))
