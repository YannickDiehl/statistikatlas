suppressPackageStartupMessages(library(mariposa))
f <- "/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav"
print(system.time(allbus <- read_spss(f)))
print(system.time(cb <- codebook(allbus, mp16, mp17, mp18, mp19, view = FALSE)))
# Anteil Variablen mit TNZ-Codes (Split/Filter) – nur Metadaten/Zaehlungen
has_split <- 0; has_filter <- 0
for (v in names(allbus)) {
  x <- suppressWarnings(as.numeric(untag_na(allbus[[v]])))
  if (any(x == -11, na.rm = TRUE)) has_split <- has_split + 1
  if (any(x == -10, na.rm = TRUE)) has_filter <- has_filter + 1
}
cat("Variablen mit TNZ: SPLIT:", has_split, " mit TNZ: FILTER:", has_filter, "\n")
# weitere Suchbegriffe fuer den 'neu'-Fall und eigene Fragen
for (p in c("freund","kontakt","isol","allein|einsam","ALLEIN","wohn","miete","arbeit","kinder","tier","essen","fleisch","krieg","russ","ukrain","nato","europa","eu","afd","partei","gendern","geschlecht","frau","corona","impf","wissenschaft","hochschul","polizei","gerecht","reich","arm","rente","stolz","heimat","ost","nachbar")) {
  r <- suppressMessages(find_var(allbus, p))
  cat(sprintf("%-14s %3d  %s\n", p, nrow(r), paste(head(r$name, 12), collapse = " ")))
}
