# Sitzung 1 · Schon gefragt? – Neuheitsprüfung für „Querschnitt 27“ (fiktiv)
library(mariposa)

# 0 Handschlag: ZA8831_v1-3-0.sav auswählen
allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")
# -> Environment oben rechts: „5246 obs. of 579 variables“

# 1 „Halten die Leute etwas von Horoskopen?“
print(find_var(allbus, "horoskop"))
summary(codebook(allbus, rh08b, view = FALSE), overview = FALSE)

# 2 „Wie viele haben Angst vor Geflüchteten?“
print(find_var(allbus, "angst"))
print(find_var(allbus, "flüchtling"))
print(find_var(allbus, "fluecht"))
summary(codebook(allbus, mi05, mp16, mp17, mp18, mp19, view = FALSE), overview = FALSE)
print(5246 - 1647)

# 3 „Vertrauen die Menschen der Politik noch?“
print(find_var(allbus, "vertrauen"))
print(find_var(allbus, "politik"))
summary(codebook(allbus, pt03, pt12, pt15, view = FALSE), overview = FALSE)
print(5246 - 1596)

# 4 „Wie einsam sind die Menschen?“
print(find_var(allbus, "einsam"))
print(find_var(allbus, "allein"))
print(find_var(allbus, "freund"))
summary(codebook(allbus, dp03, xs01, li04, view = FALSE), overview = FALSE)
