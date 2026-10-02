suppressMessages({library(dplyr); library(mariposa)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# Prüfauftrag 3, Beispiel-Lesart: Gegenprobe mit pe05 (umgepolt), "weiß nicht" zählt als Nichtwahl
allbus <- allbus %>%
  mutate(
    pe05_r     = rec(pe05, rules = "rev"),   # jetzt 1 = stimme gar nicht zu (wie bei pe01: 1 = Misstrauen)
    misstrauen = rec(pe05_r, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl  = rec(untag_na(pv01),
                     rules = "91=1 [wuerde nicht waehlen]; -8=1; 1:90=0 [wuerde waehlen]; else=NA")
  )
allbus %>% crosstab(pe05, pe05_r, percentages = "none")
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "row") %>% summary()

# Stolperweg: pe01-Regel einfach kopiert
allbus %>%
  mutate(misstrauen_falsch = rec(pe05, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
         nichtwahl91 = rec(pv01, rules = "91=1 [wuerde nicht waehlen]; 1:90=0 [wuerde waehlen]; else=NA")) %>%
  crosstab(misstrauen_falsch, nichtwahl91, percentages = "row") %>% summary()

# Zusatz: Misstrauens-Zähler (Rechnen innerhalb einer Person)
allbus <- allbus %>%
  mutate(
    m_pe01 = rec(pe01, rules = "1:2=1; 3:4=0; else=NA"),
    m_pa35 = rec(pa35, rules = "1:2=1; 3:5=0; else=NA"),
    m_pe05 = rec(pe05, rules = "3:4=1; 1:2=0; else=NA"),
    misstrauen_zahl = row_sums(pick(m_pe01, m_pa35, m_pe05), min_valid = 3),
    nichtwahl91 = rec(pv01, rules = "91=1 [wuerde nicht waehlen]; 1:90=0 [wuerde waehlen]; else=NA")
  )
allbus %>% crosstab(misstrauen_zahl, nichtwahl91, percentages = "row") %>% summary()
# Mittelwert eines Dummys = Anteil
allbus %>% group_by(m_pe01) %>% describe(nichtwahl91)
