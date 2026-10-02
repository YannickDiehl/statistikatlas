suppressMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(partei_text = to_label(pv01),
         partei_zahl = to_numeric(partei_text))
class(allbus$partei_text); class(allbus$partei_zahl)
allbus %>% frequency(pv01, partei_zahl) %>% summary()
levels(allbus$partei_text)
# untag_na
allbus %>% mutate(pa01_roh = untag_na(pa01)) %>% frequency(pa01_roh) %>% summary()
