# Erzeugt synthetische ALLBUS-ähnliche SPSS-Dateien für die Sandbox-Tests.
# Keine echten Befragten. Aufruf aus dem Projektordner:
#   Rscript --vanilla scripts/make-sandbox-fixture.R
suppressMessages({ library(haven); library(jsonlite) })
set.seed(8831)
out <- "src/sandbox/fixtures"
args <- commandArgs(trailingOnly = TRUE)
if (length(args) > 0) out <- args[1]
dir.create(out, showWarnings = FALSE, recursive = TRUE)
n <- 60
miss <- c(-Inf, -1)
lab <- function(x, labels, label) labelled_spss(x, labels = labels, na_range = miss, label = label)
pick <- function(codes, p) sample(codes, n, replace = TRUE, prob = p)

d <- data.frame(respid = seq_len(n))
d$za_nr <- labelled(rep(8831, n), c("ALLBUScompact 2023" = 8831), label = "STUDIENNUMMER")
d$version <- rep("v1.3.0, 2025-07-30 (synthetisch)", n)
d$eastwest <- labelled(pick(1:2, c(.65, .35)), c("ALTE BUNDESLAENDER" = 1, "NEUE BUNDESLAENDER" = 2), label = "ERHEBUNGSGEBIET")
d$wghtpew <- lab(ifelse(d$eastwest == 1, 1.2, 0.55) + round(runif(n, 0, 0.05), 4), c("DATENFEHLER" = -42), "OST-WEST-GEWICHT")
d$age <- lab(c(18, 29, 30, 90, -32, pick(18:90, NULL)[-(1:5)]), c("NICHT GENERIERBAR" = -32), "ALTER")
d$pa02a <- lab(pick(c(1:5, -9, -42), c(.1, .3, .4, .1, .06, .03, .01)),
               c("DATENFEHLER" = -42, "KEINE ANGABE" = -9, "SEHR STARK" = 1, "STARK" = 2, "MITTEL" = 3, "WENIG" = 4, "UEBERHAUPT NICHT" = 5),
               "POLITISCHES INTERESSE")
d$li07 <- lab(pick(c(1:7, -9), c(rep(.12, 7), .16)), c("KEINE ANGABE" = -9, "1 - UNWICHTIG" = 1, "7 - SEHR WICHTIG" = 7), "WICHTIGKEIT POLITIK")
for (v in c("pt03", "pt12", "pt15")) {
  d[[v]] <- lab(pick(c(1:7, -11, -9), c(rep(.07, 7), .45, .06)),
                c("TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "GAR KEIN VERTRAUEN" = 1, "GROSSES VERTRAUEN" = 7), paste("VERTRAUEN", v))
}
d$pe01 <- lab(pick(c(1:4, -11, -8), c(.2, .25, .15, .05, .3, .05)),
              c("TNZ: SPLIT" = -11, "WEISS NICHT" = -8, "STIMME VOLL ZU" = 1, "STIMME EHER ZU" = 2, "STIMME EHER NICHT ZU" = 3, "STIMME GAR NICHT ZU" = 4),
              "POLITIKER KUEMMERN S.NICHT UM M.GEDANKEN")
d$pa35 <- lab(pick(c(1:5, -11), c(.15, .2, .2, .1, .05, .3)), c("TNZ: SPLIT" = -11, "STIMME VOLL ZU" = 1, "LEHNE GANZ AB" = 5), "POLITIKER VERTRETEN NUR DIE REICHEN")
d$pv01 <- lab(pick(c(1, 2, 3, 4, 6, 42, 90, 91, -8, -7, -50), c(.15, .12, .05, .12, .05, .08, .03, .12, .14, .08, .06)),
              c("NICHT WAHLBERECHTIGT" = -50, "VERWEIGERT" = -7, "WEISS NICHT" = -8, "CDU-CSU" = 1, "WUERDE NICHT WAEHLEN" = 91),
              "WAHLABSICHT BUNDESTAGSWAHL")
d$vertrauen_bundestag_lang <- lab(as.numeric(d$pt03), c("TNZ: SPLIT" = -11), "Langer Variablenname zum Test")
d$kommentar <- sample(c("", "ja", "Ümläute & Ärger", "ein sehr langer Kommentar mit mehr als acht Zeichen"), n, replace = TRUE)

# Lernpfad-Aufgaben 1–3: Variablen mit den Labels und Missing-Codes des echten ALLBUS (Werte synthetisch).
# Neue Zufallsziehungen stehen hinter allen bisherigen, damit deren Werte gleich bleiben.
scale_labels <- function(from, to, first, last) setNames(from:to, c(first, rep("..", to - from - 1), last))
d$pv01 <- labelled_spss(as.numeric(d$pv01), label = "BEFR.: WAHLABSICHT BUNDESTAGSWAHL", na_range = miss,
  labels = c("NICHT WAHLBERECHTIGT" = -50, "DATENFEHLER: MFN" = -42, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, "VERWEIGERT" = -7,
             "CDU-CSU" = 1, "SPD" = 2, "FDP" = 3, "DIE GRUENEN" = 4, "DIE LINKE" = 6, "AFD" = 42, "ANDERE PARTEI" = 90, "WUERDE NICHT WAEHLEN" = 91))
d$mode <- labelled(pick(2:4, c(.4, .3, .3)), c("PAPI" = 1, "CAPI" = 2, "CAWI" = 3, "MAIL" = 4), label = "ERHEBUNGSMODUS DER ALLBUS-HAUPTBEFRAGUNG")
d$splt23_1 <- lab(ifelse(d$mode == 2, -15, pick(1:2, c(.5, .5))), c("TNZ: MODE" = -15, "SPLIT A" = 1, "SPLIT B" = 2), "FRAGEBOGENSPLIT 2023: FRABO-ERWEITERUNG")
d$rh08b <- lab(pick(c(1:3, -6, -9), c(.1, .3, .5, .07, .03)), c("KEINE ANGABE" = -9, "KENNE ICH NICHT" = -6, "VIEL" = 1, "ETWAS" = 2, "GAR NICHTS" = 3), "HALTE VON: ASTROLOGIE, HOROSKOPE")
d$mi05 <- lab(pick(c(1:3, -11, -8), c(.2, .35, .1, .3, .05)), c("TNZ: SPLIT" = -11, "WEISS NICHT" = -8, "UNEINGESCHRAENKT" = 1, "ZUZUG BEGRENZEN" = 2, "GANZ UNTERBINDEN" = 3), "ZUZUG VON: KRIEGSFLUECHTLINGEN")
for (v in c("mp16", "mp17", "mp18", "mp19")) {
  d[[v]] <- lab(pick(c(1:5, -11), c(rep(.14, 5), .3)), c("TNZ: SPLIT" = -11, "RISIKO UEBERWIEGT" = 1, "EHER RISIKO" = 2, "WEDER NOCH" = 3, "EHER CHANCE" = 4, "CHANCE UEBERWIEGT" = 5),
                paste("FLUECHTL. CHANCE O.RISIKO:", c(mp16 = "SOZIALSTAAT", mp17 = "SICHERHEIT", mp18 = "ZUSAMMENLEB", mp19 = "WIRTSCHAFT")[[v]]))
}
d$st01 <- lab(ifelse(d$splt23_1 == 1, -11, pick(c(1:4, -8, -9, -42), c(.3, .35, .25, .02, .03, .02, .03))),
              c("DATENFEHLER: MFN" = -42, "TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8,
                "MAN KANN TRAUEN" = 1, "MUSS VORSICHTIG SEIN" = 2, "KOMMT DARAUF AN" = 3, "SONSTIGES" = 4), "VERTRAUEN ZU MITMENSCHEN")
d$li04 <- lab(pick(1:7, NULL), scale_labels(1, 7, "1 - UNWICHTIG", "7 - SEHR WICHTIG"), "WICHTIGKEIT: FREUNDE UND BEKANNTE")
d$dp03 <- lab(pick(c(1, 2, -10), c(.4, .1, .5)), c("TNZ: FILTER" = -10, "KEINE ANGABE" = -9, "JA" = 1, "NEIN" = 2), "LEBENSPARTNER: GEMEINSAMER HAUSHALT?")
d$xs01 <- lab(pick(c(0, 1, -9), c(.3, .65, .05)), c("KEINE ANGABE" = -9, "NEIN" = 0, "JA" = 1), "INTERVIEW: ALLEINE DURCHGEFUEHRT")
d$pa01 <- lab(ifelse(d$mode == 4 & runif(n) < .15, -42, pick(c(1:10, -9), c(rep(.095, 10), .05))),
              c("DATENFEHLER: MFN" = -42, "KEINE ANGABE" = -9, scale_labels(1, 10, "LINKS", "RECHTS")), "LINKS-RECHTS-SELBSTEINSTUFUNG, BEFR.")
d$ls01 <- lab(pick(c(0:10, -9), c(rep(.09, 11), .01)), c("KEINE ANGABE" = -9, scale_labels(0, 10, "GANZ UNZUFRIEDEN", "GANZ ZUFRIEDEN")), "ALLGEMEINE LEBENSZUFRIEDENHEIT")
d$work <- lab(pick(1:4, c(.4, .15, .05, .4)), c("KEINE ANGABE" = -9, "VOLLZEIT, GANZTAGS" = 1, "TEILZEIT" = 2, "NEBENHER BERUFSTAE." = 3, "NICHT ERWERBSTAETIG" = 4), "BEFRAGTE(R) BERUFSTAETIG?")
d$dw15 <- lab(ifelse(d$work %in% 1:2, sample(c(10, 20, 25, 30, 35, 38.5, 40, 40, 40, 45, 50, 60), n, replace = TRUE), -10),
              c("DATENFEHLER" = -41, "TNZ: FILTER" = -10, "KEINE ANGABE" = -9), "BEFRAGTER: ARBEITSSTUNDEN PRO WOCHE")

# Sitzung 2 erfasst pt03 = 6: Labels wie im echten ALLBUS (2–6 als „..“), Werte unverändert.
d$pt03 <- lab(as.numeric(d$pt03), c("TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, scale_labels(1, 7, "GAR KEIN VERTRAUEN", "GROSSES VERTRAUEN")), "VERTRAUEN pt03")

# Lernpfad-Aufgaben 4–5: Variablen mit Labels und Missing-Codes des echten ALLBUS (Werte synthetisch).
# Neue Zufallsziehungen stehen hinter allen bisherigen, damit deren Werte gleich bleiben.
agree4 <- c("STIMME VOLL ZU" = 1, "STIMME EHER ZU" = 2, "STIMME EHER NICHT ZU" = 3, "STIMME GAR NICHT ZU" = 4)
d$pe05 <- lab(pick(c(1:4, -11, -9, -8), c(.05, .25, .25, .12, .3, .02, .01)),
              c("TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, agree4), "POLITIKER VERTRETEN INTERESSEN D. BEV.")
good5 <- c("SEHR GUT" = 1, "GUT" = 2, "TEILS/TEILS" = 3, "SCHLECHT" = 4, "SEHR SCHLECHT" = 5)
d$ep01 <- lab(pick(c(1:5, -9), c(.05, .25, .4, .2, .08, .02)), c("KEINE ANGABE" = -9, "WEISS NICHT" = -8, good5), "WIRTSCHAFTSLAGE IN DEUTSCHLAND HEUTE")
ps <- pmin(6, pmax(1, as.numeric(d$ep01) + sample(-2:1, n, replace = TRUE)))
d$ps03 <- lab(ifelse(runif(n) < .3, -11, ifelse(as.numeric(d$ep01) < 0, -9, ps)),
              c("DATENFEHLER: MFN" = -42, "TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, "SEHR ZUFRIEDEN" = 1, "ZIEMLICH ZUFRIEDEN" = 2,
                "ETWAS ZUFRIEDEN" = 3, "ETWAS UNZUFRIEDEN" = 4, "ZIEML. UNZUFRIEDEN" = 5, "SEHR UNZUFRIEDEN" = 6), "ZUFRIEDEN MIT DEMOKRATIE IN DEUTSCHLAND?")
d$ep03 <- lab(pick(c(1:5, -9), c(.08, .5, .28, .1, .02, .02)), c("KEINE ANGABE" = -9, "WEISS NICHT" = -8, good5), "WIRTSCHAFTSLAGE, BEFR. HEUTE")
d$id02 <- lab(pick(c(1:5, -50, -8), c(.05, .25, .5, .14, .02, .02, .02)),
              c("KEINER DER SCHICHTEN" = -50, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, "VERWEIGERT" = -7, "UNTERSCHICHT" = 1, "ARBEITERSCHICHT" = 2,
                "MITTELSCHICHT" = 3, "OBERE MITTELSCHICHT" = 4, "OBERSCHICHT" = 5), "SUBJEKTIVE SCHICHTEINSTUFUNG, BEFR.")
d$educ <- lab(pick(c(1:7, -9), c(.02, .17, .31, .12, .33, .02, .02, .01)),
              c("NICHT BESTIMMBAR" = -33, "KEINE ANGABE" = -9, "OHNE ABSCHLUSS" = 1, "VOLKS-,HAUPTSCHULE" = 2, "MITTLERE REIFE" = 3,
                "FACHHOCHSCHULREIFE" = 4, "HOCHSCHULREIFE" = 5, "ANDERER ABSCHLUSS" = 6, "NOCH SCHUELER" = 7), "ALLGEMEINER SCHULABSCHLUSS")
d$rp01 <- lab(pick(c(1:6, -10, -9), c(.02, .03, .05, .12, .27, .45, .04, .02)),
              c("TNZ: FILTER" = -10, "KEINE ANGABE" = -9, "UEBER 1X DIE WOCHE" = 1, "1X PRO WOCHE" = 2, "1-3X PRO MONAT" = 3,
                "MEHRMALS IM JAHR" = 4, "SELTENER" = 5, "NIE" = 6), "KIRCHGANGSHAEUFIGKEIT")
d$rd01 <- lab(pick(c(1:6, -7), c(.21, .02, .22, .03, .03, .47, .02)),
              c("KEINE ANGABE" = -9, "VERWEIGERT" = -7, "EVANG.OHNE FREIKIRCH" = 1, "EVANG.FREIKIRCHE" = 2, "ROEMISCH-KATHOLISCH" = 3,
                "AND.CHRISTL.RELIGION" = 4, "AND.NICHT-CHRISTLICH" = 5, "KEINER RELIGIONSGEM." = 6), "KONFESSION, BEFRAGTE(R)")
d$gs01 <- lab(pick(c(1:5, -9), c(.21, .13, .36, .27, .01, .02)),
              c("KEINE ANGABE" = -9, "GROSSSTADT" = 1, "VORORT GROSSSTADT" = 2, "MITTEL-, KLEINSTADT" = 3, "LAENDL. DORF" = 4, "EINZELHAUS, LAND" = 5),
              "SELBSTBESCHREIBUNG DES WOHNORTS")

# Lernpfad-Aufgabe 6: Incentive-Experiment (splt23_3, xr21) mit Labels und Missing-Codes des echten ALLBUS (Werte synthetisch).
# Wie im ALLBUS: nur Selbstausfüller:innen im Experiment, Papier (MAIL) nur A1/B1, online (CAWI) alle vier Fassungen,
# der Betrag folgt der Fragebogenhälfte splt23_1. Online sagen mehr Menschen zu als auf Papier (die Falle der Aufgabe).
set.seed(8806)
s6_mode <- as.numeric(d$mode)
s6_half <- as.numeric(d$splt23_1)
s6_version <- rep(-15, n)
s6_version[s6_mode == 4] <- ifelse(s6_half[s6_mode == 4] == 1, 1, 3)
for (s6_h in 1:2) {
  s6_idx <- which(s6_mode == 3 & s6_half == s6_h)
  s6_version[s6_idx] <- 2 * s6_h - 1 + rep(0:1, length.out = length(s6_idx))
}
d$splt23_3 <- lab(s6_version, c("TNZ: MODE" = -15, "A1 - 5 EURO OHNE" = 1, "A2 - 5 EURO MIT" = 2, "B1 - 10 EURO OHNE" = 3, "B2 - 10 EURO MIT" = 4),
                  "FRAGEBOGENSPLIT 2023: EXPERIMENT XR21")
repeat {  # jede Fassung hat online mindestens ein Ja und ein Nein, damit ANOVA, Welch und Tukey schätzbar sind
  s6_p <- ifelse(s6_mode == 4, .4, ifelse(s6_version == 4, .8, .65))
  s6_x <- ifelse(s6_mode == 2, -15, ifelse(runif(n) < .06, -9, ifelse(runif(n) < s6_p, 1, 2)))
  if (all(sapply(1:4, function(k) all(1:2 %in% s6_x[s6_mode == 3 & s6_version == k])))) break
}
d$xr21 <- lab(s6_x, c("TNZ: MODE" = -15, "KEINE ANGABE" = -9, "JA" = 1, "NEIN" = 2), "TEILNAHMEBEREITSCHAFT WEITERE UMFRAGEN")

# Lernpfad-Aufgabe 7: Populismus-Batterie pa29–pa34 zu pa35 (steht schon oben), Labels und Missing-Codes wie im echten ALLBUS.
# Gestellt nur, wo pa35 gestellt wurde (sonst −11 „TNZ: SPLIT“). Ein gemeinsamer Faktor (an pa35 gekoppelt) und drei Seiten:
# Volkssouveränität (pa29, pa33), Anti-Elitismus (pa30, pa31, pa35), Einheit des Volkes (pa32, pa34). pa29 stark schief (viel Zustimmung).
set.seed(8807)
local({
  p35 <- as.numeric(d$pa35)
  asked <- p35 > 0
  z35 <- ifelse(asked, (p35 - 3) / 1.2, 0)
  g <- 0.7 * z35 + rnorm(n, 0, 0.7)
  side <- list(V = rnorm(n), E = 0.5 * z35 + rnorm(n, 0, 0.85), H = rnorm(n))
  cut5 <- function(x, p) as.numeric(cut(x, c(-Inf, quantile(x[asked], cumsum(p)[1:4]), Inf)))
  agree5 <- c("STIMME VOLL ZU" = 1, "STIMME EHER ZU" = 2, "TEILS/TEILS" = 3, "LEHNE EHER AB" = 4, "LEHNE GANZ AB" = 5)
  item <- function(load_g, s, load_s, sd, p, label, mfn = FALSE) {
    x <- cut5(load_g * g + load_s * side[[s]] + rnorm(n, 0, sd), p)
    x <- ifelse(!asked, -11, ifelse(runif(n) < .035, sample(c(-9, -8), n, replace = TRUE), x))
    labels <- c("TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, agree5)
    if (mfn) labels <- c("DATENFEHLER: MFN" = -42, labels)
    lab(x, labels, label)
  }
  mid <- c(.15, .22, .33, .22, .08)
  d$pa29 <<- item(0.55, "V", 0.35, 0.75, c(.50, .28, .16, .04, .02), "ABGEORDNETE NUR DEM VOLK VERPFLICHTET")
  d$pa30 <<- item(0.60, "E", 0.40, 0.55, c(.39, .32, .23, .05, .01), "POLITIKER REDEN ZU VIEL,HANDELN ZU WENIG")
  d$pa31 <<- item(0.60, "E", 0.40, 0.55, mid, "EINFACHE BUERGER BESSERE VOLKSVERTRETER", mfn = TRUE)
  d$pa32 <<- item(0.65, "H", 0.40, 0.55, mid, "POLIT.KOMPROMISS IST VERRAT V.PRINZIPIEN")
  d$pa33 <<- item(0.60, "V", 0.40, 0.55, mid, "VOLK SOLLTE POLIT.ENTSCHEIDUNGEN TREFFEN", mfn = TRUE)
  d$pa34 <<- item(0.55, "H", 0.40, 0.65, c(.10, .22, .34, .24, .10), "VOLK EINIG WAS POLITISCH PASSIEREN MUSS")
})

# Lernpfad-Aufgabe 10: Bürgerpflicht (pe09) mit Label und Missing-Codes des echten ALLBUS (Werte synthetisch).
# pe09 hängt an der Wahlabsicht pv01 (Nichtwählende stimmen seltener zu), damit das Logit-Modell schätzbar ist;
# Nichtwählende liegen nie im Split, sonst blieben zu wenige für das Modell.
set.seed(8810)
d$pe09 <- local({
  pv <- as.numeric(d$pv01)
  prob <- function(v) if (v == 91) c(.1, .2, .35, .35) else if (v >= 1) c(.45, .3, .15, .1) else c(.35, .3, .2, .15)
  x <- vapply(pv, function(v) sample(1:4, 1, prob = prob(v)), numeric(1))
  x <- ifelse(pv != 91 & runif(n) < .25, -11, x)
  x[pv != 91 & x > 0 & runif(n) < .05] <- -8
  lab(x, c("TNZ: SPLIT" = -11, "KEINE ANGABE" = -9, "WEISS NICHT" = -8, "STIMME VOLL ZU" = 1, "STIMME EHER ZU" = 2,
           "STIMME EHER NICHT ZU" = 3, "STIMME GAR NICHT ZU" = 4), "WAHLBETEILIGUNG IST BUERGERPFLICHT")
})

write_sav(d, file.path(out, "sandbox-fixture.sav"), compress = "byte")
write_sav(d, file.path(out, "sandbox-fixture-uncompressed.sav"), compress = "none")

back <- read_sav(file.path(out, "sandbox-fixture.sav"), user_na = TRUE)
num <- function(x) { x <- unclass(as.numeric(x)); ifelse(is.na(x), NA, x) }
expected <- list(nCases = nrow(back), variables = lapply(names(back), function(v) {
  x <- back[[v]]
  labels <- attr(x, "labels")
  list(
    name = v,
    label = if (is.null(attr(x, "label"))) "" else attr(x, "label"),
    kind = if (is.character(x)) "string" else "numeric",
    values = if (is.character(x)) NULL else num(x),
    strings = if (is.character(x)) as.character(x) else NULL,
    naValues = if (is.null(attr(x, "na_values"))) list() else as.list(attr(x, "na_values")),
    naRange = if (is.null(attr(x, "na_range"))) NULL else ifelse(is.infinite(attr(x, "na_range")), NA, attr(x, "na_range")),
    valueLabels = if (is.null(labels) || is.character(x)) list() else lapply(seq_along(labels), function(i) list(value = unname(labels[i]), label = names(labels)[i]))
  )
}))
write_json(expected, file.path(out, "sandbox-fixture.expected.json"), auto_unbox = TRUE, digits = I(17), null = "null", na = "null", pretty = TRUE)
cat("Geschrieben nach", out, "\n")
