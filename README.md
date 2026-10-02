# Statistikatlas

Interaktiver Lernbegleiter für Statistik Ib (Politikwissenschaft): ein Lernpfad mit zehn Sitzungsaufgaben auf ALLBUS-Daten und eine freie Karte, in der alle Statistikbegriffe Schritt für Schritt erklärt sind, mit R-Code im mariposa-Stil.

**[Atlas öffnen](https://yannickdiehl.github.io/statistikatlas/)**

- [Freie Karte direkt](https://yannickdiehl.github.io/statistikatlas/?ansicht=karte)
- [Offline-Fassung](https://yannickdiehl.github.io/statistikatlas/Statistikatlas-offline.html) (eine HTML-Datei, läuft ohne Internet)

## Was drin ist

- **Lernpfad:** zehn Sitzungen nach dem Sitzungsplan. Jede Sitzung hat eine eigene Aufgabe mit Rolle, Rechnen in R mit mariposa und einem Ergebnis fürs Plenum.
- **Freie Karte:** 144 Begriffe als Netz. Jeder Begriff wird erklärt: erst an fünf Beispielpersonen, dann mit 200 Befragten, dann in R mit `read_spss()`.

## Daten

- Die ALLBUS-Datei (ZA8831) ist nicht enthalten; es gibt sie bei GESIS. Wer sie im Lernpfad lädt, behält sie im eigenen Browser, hochgeladen wird nichts.
- Der Lehrdatensatz mit 200 Befragten ist synthetisch und lässt sich als `.sav` herunterladen.

## Lokal starten

Voraussetzungen: Node 22 und pnpm; für den R-Code mariposa 0.7.4.

```bash
pnpm install
pnpm dev     # http://127.0.0.1:5173
pnpm test    # mit ALLBUS_SAV=/pfad/ZA8831_v1-3-0.sav auch die Echtdaten-Tests
pnpm build   # dist/ und Statistikatlas-Prototyp.html
```

Jeder Push auf `main` testet, baut und veröffentlicht die Webseite (`.github/workflows/pages.yml`).

## Aufbau

| Ordner | Inhalt |
|---|---|
| `src/tasks/` | Aufgaben des Lernpfads |
| `src/explain/` | Erklärungen der freien Karte, Leitfaden in `src/explain/AUTHORING.md` |
| `src/domain/` | Begriffsnetz, Lehrdatensatz, mariposa-Katalog |
| `src/components/` | Oberfläche |
| `scripts/` | Prüfskripte (R-Abgleich, Browserprüfung) und Export |

## Mehr

- [Ausführliche Beschreibung](docs/BESCHREIBUNG.md): Karte, Farben, Lehrdatensatz, fachliche Konventionen
- [Prüfstand](UMSETZUNG-Pruefstand.md): was wann umgesetzt und geprüft wurde
- Spezifikationen und Pläne: `docs/superpowers/`
