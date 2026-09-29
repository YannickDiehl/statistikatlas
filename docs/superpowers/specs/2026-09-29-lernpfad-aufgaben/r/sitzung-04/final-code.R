library(dplyr)
library(mariposa)   # zuletzt laden: haven::read_spss() würde sonst mariposa::read_spss() überdecken

allbus <- read_spss("ZA8831_v1-3-0.sav")

# Prüfauftrag 1 · Zahl nachbauen: zwei Dummyvariablen (zusammenfassen)
allbus <- allbus %>%
  mutate(
    misstrauen = rec(pe01, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl  = rec(pv01, rules = "91=1 [würde nicht wählen]; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "col") %>% summary()

# Prüfauftrag 2 · Eine Zelle, drei Nenner
allbus %>% crosstab(misstrauen, nichtwahl, percentages = "all") %>% summary()
allbus %>% chi_square(misstrauen, nichtwahl)            # Wiederholung, freiwillig

# Prüfauftrag 3 · Deine Lesart, z. B. Gegenprobe pe05 (umpolen) + „weiß nicht“ zählt als Nichtwahl
allbus <- allbus %>%
  mutate(
    pe05_r      = rec(pe05, rules = "rev"),              # jetzt 1 = stimme gar nicht zu, wie bei pe01: 1 = Misstrauen
    misstrauen3 = rec(pe05_r, rules = "1:2=1 [misstraut]; 3:4=0 [misstraut nicht]; else=NA"),
    nichtwahl3  = rec(untag_na(pv01),
                      rules = "91=1 [würde nicht wählen]; -8=1; 1:90=0 [würde wählen]; else=NA")
  )
allbus %>% crosstab(misstrauen3, nichtwahl3, percentages = "row") %>% summary()
