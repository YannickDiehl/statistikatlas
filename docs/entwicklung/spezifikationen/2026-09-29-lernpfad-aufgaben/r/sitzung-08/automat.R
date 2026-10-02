library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# Schritt 1: Ausgabe des Automaten vorbereiten – hohe Werte sollen "zufrieden" heißen
allbus <- allbus %>%
  mutate(demo = rec(ps03, rules = "rev"))

frequency(allbus, demo)

# Schritt 2: Den Automaten einstellen (Beispiel: Eingabefrage pt03, Vertrauen in den Bundestag)
automat <- allbus %>%
  linear_regression(demo ~ pt03, weights = wghtpew)
automat
summary(automat)
