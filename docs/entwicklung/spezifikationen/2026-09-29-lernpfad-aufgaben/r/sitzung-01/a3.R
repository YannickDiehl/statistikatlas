suppressPackageStartupMessages(library(mariposa))
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
print(system.time(cb <- codebook(allbus, view = FALSE)))
# Wertelabel 10 von ls01
print(val_labels(allbus$ls01))
# gefragt = n - TNZ (split/filter), gueltig = nicht NA
cands <- c("rh08b","ls01","ps03","ps01","mp16","mp17","mp18","mp19","mi05","mp07","pt03","pt12","pt15","pt20","st01","pe01","pe05","lp05","pa35","pa30","ps03","li07","li04","dp03","xs01","mc04")
for (v in cands) {
  x <- untag_na(allbus[[v]])
  x <- as.numeric(x)
  lab <- attr(allbus[[v]], "label")
  tnz <- sum(x %in% c(-10, -11), na.rm = TRUE)
  valid <- sum(!is.na(allbus[[v]]))
  cat(sprintf("%-6s %-42s gefragt=%4d (%.1f%%) gueltig=%4d tnz=%4d\n", v, lab, 5246 - tnz, 100*(5246-tnz)/5246, valid, tnz))
}
