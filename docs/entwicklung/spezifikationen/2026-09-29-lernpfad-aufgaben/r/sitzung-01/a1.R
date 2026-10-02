suppressPackageStartupMessages(library(mariposa))
cat("mariposa", as.character(packageVersion("mariposa")), "\n")
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
cat("dim:", dim(allbus), "\n")
for (p in c("zufrieden","zufriedenheit","horoskop","vertrauen","politik","flüchtling","fluecht","flücht","angst","furcht","einsam","allein","tempo","auto","verkehr","religion","religiös","ausländer","auslaender","migration","migra","klima","umwelt","gott","glück","glueck","demokratie","wahl","internet","smartphone","handy","tiktok","social","medien","sport","gesund","stolz")) {
  r <- suppressMessages(find_var(allbus, p))
  cat(sprintf("\n## %s : %d Treffer\n", p, nrow(r)))
  if (nrow(r) > 0 && nrow(r) <= 25) print(r[, c("name","label")], row.names = FALSE)
}
