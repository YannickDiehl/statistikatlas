library(mariposa)
library(dplyr)

allbus <- read_spss("/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav")

# --- Block 1: Welche Zahl gehört zu welchem Wort? ---------------------------
allbus %>%
  codebook(pa02a, pa01, pt03, st01, pv01, ls01) %>%
  summary()
find_var(allbus, "MODUS")
val_labels(allbus, mode)

# --- Block 2: Wie erfasst der ALLBUS Papierbögen? ---------------------------
papier <- allbus %>% filter(mode == 4)          # 4 = MAIL
papier %>%
  codebook(pa01, st01, pt03) %>%
  summary()

# --- Block 3: Was passiert beim Umwandeln? ----------------------------------
allbus %>%
  mutate(partei_text = to_label(pv01),
         partei_zahl = to_numeric(partei_text)) %>%
  frequency(pv01, partei_zahl) %>%
  summary()

# --- Zusatz (zu Hause): die eigene Lieferung als Mini-Datensatz -------------
lieferung <- tibble(
  respid = c(900001, 900002, 900003),
  pa01   = c(3, -42, 8),
  pv01   = c(6, -8, -9)
) %>%
  var_label(pa01 = "LINKS-RECHTS-SELBSTEINSTUFUNG, BEFR.",
            pv01 = "BEFR.: WAHLABSICHT BUNDESTAGSWAHL") %>%
  val_labels(pa01 = c("LINKS" = 1, "RECHTS" = 10, "DATENFEHLER: MFN" = -42),
             pv01 = c("DIE LINKE" = 6, "WEISS NICHT" = -8, "KEINE ANGABE" = -9)) %>%
  set_na(pa01 = -42, pv01 = c(-8, -9))
lieferung %>% codebook(view = FALSE) %>% summary()
