suppressMessages({library(dplyr); library(mariposa)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(
    misstrauen = rec(pe01, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl  = rec(pv01, rules = "91=1 [wuerde nicht waehlen]; 1:90=0 [wuerde waehlen]; else=NA")
  )
cat("\n### gewichtet\n")
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "all", weights = wghtpew) %>% summary()
cat("\n### Chi-Quadrat\n")
allbus %>% chi_square(misstrauen, nichtwahl) %>% print()
cat("\n### Umgedrehte Orientierung\n")
allbus %>% crosstab(nichtwahl, misstrauen, percentages = "row") %>% summary()
cat("\n### Treppe: Rechnen innerhalb einer Person\n")
allbus <- allbus %>%
  mutate(
    m_pe01 = rec(pe01, rules = "1:2=1 [misstraut]; 3:4=0 [nicht]; else=NA"),
    m_pa35 = rec(pa35, rules = "1:2=1 [misstraut]; 3:5=0 [nicht]; else=NA"),
    pe05_r = rec(pe05, rules = "rev"),
    m_pe05 = rec(pe05_r, rules = "3:4=1 [misstraut]; 1:2=0 [nicht]; else=NA"),
    misstrauen_zahl = row_sums(pick(m_pe01, m_pa35, m_pe05), min_valid = 3)
  )
allbus %>% crosstab(pe05, pe05_r, percentages = "none") %>% summary()
allbus %>% crosstab(misstrauen_zahl, nichtwahl, percentages = "row") %>% summary()
allbus %>% crosstab(misstrauen_zahl, nichtwahl, percentages = "col") %>% summary()
