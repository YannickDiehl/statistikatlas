suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
r <- allbus %>% reliability(pa31, pa32, pa33)
rw <- allbus %>% reliability(pa31, pa32, pa33, weights = wghtpew)
cat("alpha", r$alpha, "std", r$alpha_standardized, "omega", r$omega, "weighted", rw$alpha, "\n")
allbus <- allbus %>%
  mutate(
    kurz = row_means(., pa31, pa32, pa33, min_valid = 3),
    rest = row_means(., pa29, pa30, pa34, pa35, min_valid = 4),
    lang = row_means(., pa29, pa30, pa31, pa32, pa33, pa34, pa35, min_valid = 7)
  )
allbus %>% pearson_cor(kurz, rest, weights = wghtpew) %>% print()
allbus %>% pearson_cor(kurz, lang) %>% print()
allbus %>% describe(kurz, rest, weights = wghtpew) %>% print()
r2 <- allbus %>% reliability(pa30, pa32, pa35); cat("pa30+32+35 alpha", r2$alpha, "\n")
