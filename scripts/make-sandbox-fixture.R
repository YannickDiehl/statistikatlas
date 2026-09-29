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
