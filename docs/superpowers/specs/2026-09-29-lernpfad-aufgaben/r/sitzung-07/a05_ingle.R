suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(
    pm_top2_b = rec(va02, rules = "1:2=1; 3:4=0"),
    pm_top2_m = rec(va04, rules = "1:2=1; 3:4=0"),
    pm_erst_b = rec(va02, rules = "1=1; 2:4=0"),
    pm_erst_m = rec(va04, rules = "1=1; 2:4=0")
  ) %>%
  mutate(punkte = row_sums(., pm_top2_b, pm_top2_m, pm_erst_b, pm_erst_m, min_valid = 4)) %>%
  mutate(ingle_neu = rec(punkte, rules = "3=1 [Postmaterialist]; 2=2 [PM-Mischtyp]; 1=3 [M-Mischtyp]; 0=4 [Materialist]"))
print(table(neu = as.numeric(allbus$ingle_neu), orig = as.numeric(unclass(haven::zap_missing(allbus$ingle))), useNA = "ifany"))
allbus %>% frequency(ingle, weights = wghtpew)
allbus %>% crosstab(ingle, eastwest, percentages = "col", weights = wghtpew)
# patterns in va for partial rankings (aggregate only)
pat <- with(allbus, paste(is.na(va01), is.na(va02), is.na(va03), is.na(va04)))
print(table(pat))
