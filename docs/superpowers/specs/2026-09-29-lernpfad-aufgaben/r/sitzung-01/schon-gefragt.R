# Sitzung 1 · Schon gefragt? – Neuheitsprüfung für „Querschnitt 27“ (fiktiv)
library(mariposa)

# 0 Handschlag: ZA8831_v1-3-0.sav auswählen
allbus <- read_spss(file.choose())
# -> Environment oben rechts: „5246 obs. of 579 variables“

# 1 „Halten die Leute etwas von Horoskopen?“
find_var(allbus, "horoskop")
codebook(allbus, rh08b)

# 2 „Wie viele haben Angst vor Geflüchteten?“
find_var(allbus, "angst")
find_var(allbus, "flüchtling")
find_var(allbus, "fluecht")
codebook(allbus, mi05, mp16, mp17, mp18, mp19)
5246 - 1647

# 3 „Vertrauen die Menschen der Politik noch?“
find_var(allbus, "vertrauen")
find_var(allbus, "politik")
codebook(allbus, pt03, pt12, pt15)
5246 - 1596

# 4 „Wie einsam sind die Menschen?“
find_var(allbus, "einsam")
find_var(allbus, "allein")
find_var(allbus, "freund")
codebook(allbus, dp03, xs01, li04)
