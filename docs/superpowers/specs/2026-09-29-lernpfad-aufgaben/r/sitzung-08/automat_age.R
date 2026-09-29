suppressPackageStartupMessages({library(mariposa); library(dplyr)})
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
allbus <- allbus %>%
  mutate(demo = rec(ps03, rules = "rev"),
         alter_gruppe = rec(age, rules = "18:29=1 [18-29]; 30:44=2 [30-44]; 45:59=3 [45-59]; 60:74=4 [60-74]; 75:max=5 [75+]"))
automat <- allbus %>% linear_regression(demo ~ age, weights = wghtpew)
automat
print(coef(automat))
allbus <- allbus %>% mutate(anzeige = 3.950 + 0.004 * age, daneben = demo - anzeige)
allbus %>% filter(!is.na(daneben)) %>% group_by(alter_gruppe) %>% describe(daneben, weights = wghtpew, show = c("mean", "sd"))
# Profi: Konstante als Anzeige für eine durchschnittliche Besucherin
allbus <- allbus %>% center(age, weights = wghtpew, suffix = "_c")
allbus %>% linear_regression(demo ~ age_c, weights = wghtpew) %>% coef() %>% print()
# pa01: linearity
allbus <- allbus %>% mutate(anzeige2 = 4.857 - 0.140 * pa01, daneben2 = demo - anzeige2)
allbus %>% filter(!is.na(daneben2)) %>% group_by(pa01) %>% describe(daneben2, weights = wghtpew, show = c("mean", "sd"))
allbus %>% linear_regression(demo ~ pa01, weights = wghtpew) %>% print()
allbus %>% linear_regression(pt03 ~ demo, weights = wghtpew) %>% print()
