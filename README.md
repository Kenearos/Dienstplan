# Excel XLSX Generator

Ein Python-Projekt zum Erstellen von Excel-Dateien (.xlsx) mit der openpyxl-Bibliothek.

## Voraussetzungen

- Python 3.8 oder höher
- pip (Python Package Installer)

## Installation

1. Erstellen Sie eine virtuelle Umgebung (empfohlen):

```powershell
python -m venv venv
```

1. Aktivieren Sie die virtuelle Umgebung:

```powershell
.\venv\Scripts\Activate.ps1
```

1. Installieren Sie die erforderlichen Pakete:

```powershell
pip install -r requirements.txt
```

## Verwendung

Führen Sie das Hauptskript aus:

```powershell
python src/main.py
```

Dies erstellt eine Excel-Datei `output/example.xlsx` mit Beispieldaten.

### NRW-Dienstplan-Vorlage erstellen

Das Skript `src/build_template.py` erzeugt eine leere Excel-Vorlage mit allen Regeln für NRW (Wochenenddefinition Fr–So, Feiertage + Vortag, automatische Abzüge).

```powershell
python src/build_template.py
```

Die Vorlage wird unter `templates/Dienstplan_Template_NRW.xlsx` abgelegt. Dort tragen Sie lediglich Namen/Anteile ein; die Abrechnung erfolgt über die vorbereiteten Formeln.

## Projektstruktur

```text
.
├── src/
│   ├── main.py             # Beispielskript für XLSX-Ausgabe
│   └── build_template.py   # Generator für die NRW-Dienstplan-Vorlage
├── output/              # Ausgabeverzeichnis für erstellte Excel-Dateien
├── templates/           # Enthält die generierte Dienstplan-Vorlage
├── requirements.txt     # Python-Abhängigkeiten
└── README.md            # Diese Datei
```

## Anpassung

Bearbeiten Sie `src/main.py`, um Ihre eigenen Excel-Dateien zu erstellen.
