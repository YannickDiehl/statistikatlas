library(mariposa)
library(dplyr)
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

allbus <- allbus %>%
  mutate(kurz = row_means(., pa31, pa32, pa33, min_valid = 3)) %>%
  mutate(
    z31 = rec(pa31, rules = "1:2=1 [stimmt zu]; 3:5=0 [nicht]"),
    z32 = rec(pa32, rules = "1:2=1 [stimmt zu]; 3:5=0 [nicht]"),
    z33 = rec(pa33, rules = "1:2=1 [stimmt zu]; 3:5=0 [nicht]")
  ) %>%
  mutate(zustimmungen = row_sums(., z31, z32, z33, min_valid = 3)) %>%
  mutate(
    durchgehend = rec(zustimmungen, rules = "3=1 [allen drei zugestimmt]; 0:2=0 [nicht allen]"),
    im_schnitt  = rec(kurz, rules = "1:2=1 [im Schnitt Zustimmung]; 2.01:5=0 [nein]")
  )
cat("NA kurz:", sum(is.na(allbus$kurz)), " NA im_schnitt:", sum(is.na(allbus$im_schnitt)), " NA durchgehend:", sum(is.na(allbus$durchgehend)), "\n")
print(table(allbus$kurz, useNA = "ifany"))
summary(allbus %>% crosstab(im_schnitt, durchgehend, percentages = "total", weights = wghtpew))
summary(allbus %>% frequency(zustimmungen, weights = wghtpew))
