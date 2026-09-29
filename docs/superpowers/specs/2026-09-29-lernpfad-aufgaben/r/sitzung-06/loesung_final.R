library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# Station 1 – Variablen vorbereiten (nur Selbstausfüller:innen waren im Experiment)
exp <- allbus %>%
  filter(mode != 2) %>%
  mutate(
    zusage       = rec(xr21, rules = "1=1 [ja]; 2=0 [nein]; else=NA"),
    betrag       = rec(splt23_3, rules = "1:2=5 [5 Euro]; 3:4=10 [10 Euro]; else=NA"),
    wiederholung = rec(splt23_3, rules = "1=0 [ohne]; 3=0 [ohne]; 2=1 [mit]; 4=1 [mit]; else=NA"),
    papier       = rec(mode, rules = "3=0 [online]; 4=1 [Papier]; else=NA")
  )
cat("N exp:", nrow(exp), "\n")
exp %>% t_test(zusage, group = wiederholung)
exp %>% t_test(zusage, group = betrag)

# Station 2 – Zufallscheck
exp %>% pearson_cor(wiederholung, betrag, papier, age, zusage) %>%
  summary(pvalue_matrix = FALSE, n_matrix = FALSE)
exp %>% crosstab(splt23_3, mode, percentages = "none")

# Station 3 – der saubere Vergleich (das fiktive Panel befragt nur online)
online <- exp %>% filter(mode == 3)
online %>% t_test(zusage, group = wiederholung)
online %>% t_test(zusage, group = betrag)
online %>% oneway_anova(zusage, group = splt23_3) %>% tukey_test()

# Zusatz: gewichtet
cat("\n--- gewichtet ---\n")
online %>% t_test(zusage, group = betrag, weights = wghtpew)
online %>% oneway_anova(zusage, group = splt23_3, weights = wghtpew)
exp %>% t_test(zusage, group = betrag, weights = wghtpew)
