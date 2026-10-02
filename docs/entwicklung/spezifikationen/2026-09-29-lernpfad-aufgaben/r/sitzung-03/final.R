library(mariposa)
library(dplyr)
library(ggplot2)
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

## Saal 1
allbus %>% fre(pv01) %>% summary()
na_frequencies(allbus$pv01)
saal <- allbus %>%
  mutate(wahl = untag_na(pv01)) %>%
  filter(wahl != -50, wahl != -42, wahl != -9, wahl != -7)
saal %>% fre(wahl) %>% summary()
nrow(saal)

## Saal 2
na_frequencies(allbus$dw15)
allbus %>% describe(dw15)
allbus %>% filter(dw15 > 37.89) %>% nrow()
allbus %>% filter(work == 1) %>% describe(dw15)
allbus %>% filter(!is.na(dw15)) %>% mutate(ueber = rec(dw15, rules = "mean")) %>% fre(ueber) %>% summary()
pdf(NULL)
p <- allbus %>% filter(!is.na(dw15)) %>%
  ggplot(aes(x = "", y = as.numeric(dw15))) + geom_boxplot() + labs(x = NULL, y = "Stunden pro Woche")
print(p)
invisible(dev.off())
cat("plot ok\n")
