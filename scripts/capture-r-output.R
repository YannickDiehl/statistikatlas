# Erfasst die Druckausgaben von mariposa 0.7.4 für den Atlas (Spezifikation Lehrdatensatz und R, Abschnitt 6):
#   (a) Referenzausgaben der Leitaufrufe für die Ausgangsdaten, „alle + 1“ und „P002 = 40“ (lernzeit),
#       dazu Zusatzfälle für Tabellenbreiten, p-Werte, ungerade Summen, fehlende Werte, jede Änderung von
#       lernplanung5 um ±1 und den Tibble-Druck; src/explain/rOutput.test.ts
#       vergleicht sie zeichengenau mit src/explain/rOutput.ts.
#   (b) catalog.json mit Code und Ausgabe aller 110 Katalogbeispiele auf den Ausgangsdaten.
# Aufruf (nach generate-mariposa-check.ts):
#   Rscript --vanilla scripts/capture-r-output.R <mariposa-quellbaum> <prüfverzeichnis> src/explain/fixtures/r-output
options(warn = 1, cli.num_colors = 1, crayon.enabled = FALSE, width = 80)
args <- commandArgs(trailingOnly = TRUE)
stopifnot(length(args) == 3L)
source_dir <- normalizePath(args[1])
check_dir <- normalizePath(args[2])
dir.create(args[3], recursive = TRUE, showWarnings = FALSE)
out_dir <- normalizePath(args[3])
pkgload::load_all(source_dir, export_all = FALSE, helpers = FALSE, compile = FALSE, quiet = TRUE)
stopifnot(as.character(utils::packageVersion("mariposa")) == "0.7.4")
suppressPackageStartupMessages(library(dplyr))
sav <- file.path(check_dir, "Statistikatlas-200-Befragte.sav")
atlas <- read_spss(sav)

# Konsolentext eines Werts, wie R ihn druckt (ohne den letzten Zeilenumbruch).
printed <- function(value) paste(capture.output(print(value)), collapse = "\n")
save_text <- function(name, text) {
  con <- file(file.path(out_dir, paste0(name, ".txt")), open = "w", encoding = "UTF-8")
  writeLines(text, con)
  close(con)
}

# (a) Leitaufrufe auf drei Datenständen
data <- list(
  ausgang = atlas,
  plus1 = atlas %>% mutate(lernzeit = lernzeit + 1),
  p002_40 = atlas %>% mutate(lernzeit = replace(lernzeit, id == "P002", 40))
)
lead <- list(
  "describe-mean" = function(d) d %>% describe(lernzeit, show = "mean"),
  "describe-mean-var" = function(d) d %>% describe(lernzeit, show = c("mean", "var")),
  "describe-mean-sd-var" = function(d) d %>% describe(lernzeit, show = c("mean", "sd", "var")),
  "describe-mean-sd-se" = function(d) d %>% describe(lernzeit, show = c("mean", "sd", "se")),
  "pearson" = function(d) d %>% pearson_cor(lernzeit, wissenstest),
  "kovarianz" = function(d) d %>% summarise(kovarianz = cov(lernzeit, wissenstest)),
  "frequency" = function(d) d %>% frequency(lernplanung5)
)
for (state in names(data)) for (call in names(lead)) save_text(paste0(state, "--", call), printed(lead[[call]](data[[state]])))

# Zusatzfälle auf den Ausgangsdaten
extra <- list(
  "describe-zwei-variablen" = atlas %>% describe(lernzeit, einkommen, show = c("mean", "sd", "var", "se")),
  "describe-breit" = atlas %>% describe(einkommen, statistikinteresse10, show = c("mean", "sd", "var", "se", "min", "max", "range")),
  "pearson-zwei-sterne" = atlas %>% pearson_cor(haushaltsgroesse, lernzeit),
  "pearson-negativ" = atlas %>% pearson_cor(lernzeit, schlafdauer),
  "pearson-nahe-null" = atlas %>% pearson_cor(einkommen, alter),
  "frequency-schulabschluss" = atlas %>% frequency(schulabschluss),
  "frequency-geschlecht" = atlas %>% frequency(geschlecht),
  "frequency-wissenstest" = atlas %>% frequency(wissenstest)
)
for (name in names(extra)) save_text(paste0("zusatz--", name), printed(extra[[name]]))

# Mittelwert wie R: mean() rechnet in zwei Durchgängen (Summe / n, dann Korrektur um Σ(x − Mittel) / n).
# Bei ungerader Summe liegt mean = x.xx5 genau auf der Rundungsgrenze; die Kennwertzeile von frequency()
# hängt dann vom zweiten Durchgang ab. Erfasst auf diesem Rechner (Plattform siehe unten).
odd <- atlas %>% mutate(lernplanung5 = replace(lernplanung5, id == "P002", 4)) # P002: 3 → 4, Summe 653
save_text("zusatz--frequency-ungerade-summe", printed(odd %>% frequency(lernplanung5)))
save_text("zusatz--describe-ungerade-summe", printed(odd %>% describe(lernplanung5, show = c("mean", "sd", "var", "se"))))
# Fehlende Werte: „Total valid“, „System“, „Total“ (im Atlas können Zellen nicht leer werden; der Pfad ist trotzdem geprüft)
save_text("zusatz--frequency-fehlend", printed(atlas %>% mutate(lernplanung5 = replace(lernplanung5, id %in% c("P001", "P002"), NA)) %>% frequency(lernplanung5)))
# Jede einzelne Änderung von lernplanung5 um ±1 innerhalb 1 bis 5: die Kennwertzeile von frequency()
x <- as.numeric(atlas$lernplanung5)
edits <- list()
for (i in seq_along(x)) for (delta in c(-1, 1)) {
  if (x[i] + delta < 1 || x[i] + delta > 5) next
  d <- atlas %>% mutate(lernplanung5 = replace(lernplanung5, seq_along(lernplanung5) == i, x[i] + delta))
  line <- grep("^# total", capture.output(print(d %>% frequency(lernplanung5))), value = TRUE)
  edits[[length(edits) + 1]] <- list(id = atlas$id[i], delta = delta, line = line)
}
jsonlite::write_json(list(platform = paste(R.version$platform, "long.double:", capabilities("long.double")), edits = edits),
                     file.path(out_dir, "frequency-edits.json"), auto_unbox = TRUE, pretty = TRUE)

# Tibble-Druck (pillar) für einzelne Kennwerte: echte Kovarianzen und Grenzfälle der Stellenzahl
values <- c(
  cov(atlas$einkommen, atlas$lernzeit), cov(atlas$alter, atlas$arbeitsstunden), cov(atlas$lernzeit, atlas$schlafdauer),
  var(atlas$einkommen), 5.43891, 0.0123456, -2.5, 1234.5678, 12.3456, 100, 0.5, -0.000123456, 123456.7, 1e-10, 0, 3,
  -45.678, 999.99, 0.999, 9.999, 99.95, 0.00999, 1e6, 12345678.9, 1.5e-5, -0.5, 10, 1.05, 2.0001, 1e15, 0.1, 123.456,
  -1234.5, 1.234e20, 2.5e-14, -7.77e-9
)
tibbles <- lapply(as.numeric(values), function(v) list(value = v, output = printed(tibble(kovarianz = v))))
jsonlite::write_json(tibbles, file.path(out_dir, "tibble.json"), digits = NA, auto_unbox = TRUE, pretty = TRUE)

# (b) Katalog: Ausgabe aller 110 Beispiele auf den Ausgangsdaten, in einem eigenen Arbeitsverzeichnis
examples <- jsonlite::fromJSON(file.path(check_dir, "examples.json"), simplifyVector = FALSE)
start <- paste(readLines(file.path(check_dir, "start.R"), encoding = "UTF-8"), collapse = "\n")
work <- file.path(tempdir(), "atlas-katalog")
dir.create(work, showWarnings = FALSE)
invisible(file.copy(sav, work, overwrite = TRUE))
old <- setwd(work)
catalog <- list()
for (ex in examples) {
  if (length(strsplit(ex$key, ":", fixed = TRUE)[[1]]) != 2L) next # Zusatzwege der Prüfstrecke
  stopifnot(startsWith(ex$code, start))
  output <- character()
  if (!ex$fn %in% c("read_por", "read_sas")) {
    env <- new.env(parent = globalenv())
    env$atlas <- atlas
    for (e in parse(text = substring(ex$code, nchar(start) + 1L))) {
      v <- suppressMessages(suppressWarnings(withVisible(eval(e, envir = env))))
      if (v$visible) output <- c(output, capture.output(print(v$value)))
    }
  }
  catalog[[ex$key]] <- list(code = ex$code, output = paste(output, collapse = "\n"))
}
setwd(old)
stopifnot(length(catalog) == 110L)
jsonlite::write_json(catalog, file.path(out_dir, "catalog.json"), auto_unbox = TRUE, pretty = TRUE)
cat(sprintf("%d Referenzausgaben, %d Zusatzfälle, %d Einzeländerungen, %d Tibble-Fälle, %d Katalogausgaben in %s\n",
            length(data) * length(lead), length(extra) + 3L, length(edits), length(tibbles), length(catalog), out_dir))
