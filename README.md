# Dienstplan Generator (NRW - Variante 2)

Projekt zum automatischen Erstellen von Dienstplänen mit Vergütungsberechnung nach NRW-Regeln (Variante 2 "streng").

## Verfügbare Versionen

### Web-App (Browser) 🆕
**Empfohlen für die meisten Benutzer!**

Moderne Web-Anwendung zur Bonusberechnung für Wochenend- und Feiertagsdienste.
- ✅ Läuft direkt im Browser (keine Installation)
- ✅ Mitarbeiterverwaltung
- ✅ Monatliche Dienstplanung
- ✅ Automatische Bonusberechnung
- ✅ Export/Import-Funktion

Siehe [webapp/README.md](webapp/README.md) für Details.

### Python/Excel Version (Desktop)
Python-basierter Generator für Excel-Dienstpläne.

### Android App (Mobile)
Native Android-App für mobiles Dienstplan-Management. Siehe [android-app/README.md](android-app/README.md) für Details.

## Features (Python/Excel Version)

- ✅ Automatische Erkennung von Wochenenden (Fr–So), Feiertagen und Vortagen
- ✅ Vergütungslogik: WT 250€, WE 450€ (nur ab Schwelle ≥ 2,0 WE-Einheiten)
- ✅ Abzug 1,0 WE-Einheit (Freitag-Priorität) nach Erreichen der Schwelle
- ✅ Vorbefüllte Monatsvorlagen mit allen Datumswerten
- ✅ Excel-kompatibel (ohne Office 365 Funktionen)

## Installation

1. Virtuelle Umgebung erstellen:

```powershell
python -m venv .venv
```

2. Umgebung aktivieren:

```powershell
.\.venv\Scripts\Activate.ps1
```

3. Abhängigkeiten installieren:

```powershell
pip install -r requirements.txt
```

## Verwendung

### Monat erstellen

```powershell
python src/fill_plan_dates.py 2025 11  # November 2025
python src/fill_plan_dates.py 2025 12  # Dezember 2025
```

Die Datei landet in `output/Dienstplan_YYYY_MM_NRW.xlsx`.

### Daten eintragen

1. Öffne die generierte Datei
2. Gehe zum Blatt "Plan"
3. Trage in Spalte B die Mitarbeiter-Namen ein
4. Trage in Spalte C den Anteil ein (1 = voll, 0.5 = halb)
5. Gehe zum Blatt "Auswertung" und trage in Spalte A alle Mitarbeiter ein

**Fertig!** Alle Berechnungen erfolgen automatisch.

## Projektstruktur

```text
.
├── webapp/                 # Web-App (Browser) 🆕
│   ├── index.html          # Haupt-HTML-Datei
│   ├── styles.css          # Styling
│   ├── app.js              # App-Logik & UI
│   ├── calculator.js       # Bonusberechnung
│   ├── holidays.js         # NRW-Feiertagsdaten
│   ├── storage.js          # LocalStorage-Verwaltung
│   └── README.md           # Web-App Dokumentation
├── src/                    # Python source code
│   ├── build_template.py   # Erstellt die Basis-Vorlage
│   ├── fill_plan_dates.py  # Füllt Monate mit Datumszeilen
│   └── read_excel.py       # Liest xlsx-Dateien aus
├── android-app/            # Android mobile app
│   ├── app/                # Android app source code
│   ├── build.gradle.kts    # Build configuration
│   └── README.md           # Android app documentation
├── output/                 # Generierte Monatspläne
├── templates/              # Basis-Vorlage
├── requirements.txt        # Python-Abhängigkeiten (openpyxl)
├── SPECIFICATION.md        # Vollständige Regeln & Formeln
├── claude.md               # Umfassende Projekt-Dokumentation
└── README.md               # Diese Datei
```

## Regeln (Variante 2 - streng)

- **WE-Tag**: Fr/Sa/So + Feiertag + Vortag Feiertag
- **WT-Tag**: Alle anderen Tage (250 € pro Einheit)
- **WE-Vergütung**: Nur wenn Monatssumme ≥ 2,0 WE-Einheiten → 450 €/Einheit, dann Abzug 1,0 (zuerst von Freitag)
- **Unter Schwelle**: WE-Dienste = 0 € (nicht als WT vergütet)

Details siehe `SPECIFICATION.md`.

## Lizenz

MIT
