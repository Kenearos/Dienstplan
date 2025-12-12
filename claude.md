# Dienstplan Bonusrechner - Projekt Übersicht

## Projektbeschreibung

Dieses Projekt berechnet Bonuszahlungen für Mitarbeiter basierend auf Wochenend- und Feiertagsdiensten nach spezifischen NRW-Regeln. Es existieren drei verschiedene Implementierungen für unterschiedliche Anwendungsfälle.

## Verfügbare Implementierungen

### 1. Web-App (empfohlen)
**Verzeichnis**: `webapp/`
**Technologie**: Vanilla JavaScript, HTML5, CSS3
**Verwendung**: Browser-basiert, keine Installation erforderlich

Die Web-App ist die modernste und benutzerfreundlichste Version. Sie läuft komplett im Browser und speichert Daten lokal im LocalStorage.

### 2. Python/Excel Version
**Verzeichnis**: `src/`
**Technologie**: Python mit openpyxl
**Verwendung**: Generiert Excel-Dateien mit Formeln

Die ursprüngliche Implementierung, die Excel-Arbeitsmappen mit eingebetteten Formeln erstellt.

### 3. Android App
**Verzeichnis**: `android-app/`
**Technologie**: Kotlin, Android SDK
**Verwendung**: Native Android-Anwendung

Mobile Version für Android-Geräte.

## Berechnungsregeln - Unterschiede

### Web-App Logik (Benutzer-Anforderung)
Die Web-App implementiert eine vereinfachte Logik:

1. **Qualifizierende Tage (WE/Feiertag)**:
   - Freitag, Samstag, Sonntag
   - Feiertage in NRW
   - Tag vor einem Feiertag

2. **Bonusberechnung**:
   - Mindestens **2.0 qualifizierende Tage** erforderlich
   - Bei Erreichen: **2.0 qualifizierende Tage** werden abgezogen
   - **Alle übrigen Tage** werden bezahlt:
     - Normale Tage (Mo-Do, kein Feiertag): 250€
     - Qualifizierende Tage: 450€
   - Unter Schwellenwert: **Keine Bonuszahlung**

### Python/Android Logik (Variante 2 "streng")
Die ältere Implementierung nutzt eine andere Logik:

1. **Tag-Kategorien**:
   - **WT-Tag** (Werktag): Mo-Do (ohne Feiertag/Vortag)
   - **WE-Tag** (Weekend): Fr-So + Feiertag + Vortag Feiertag

2. **Bonusberechnung**:
   - **WT-Tage** werden bei Erreichen der Schwelle mit 250€ vergütet
   - **WE-Tage** nur vergütet wenn ≥ 2.0 WE-Einheiten:
     - Bei Erreichen: 450€ pro WE-Tag
     - Dann Abzug von 2.0 WE-Einheiten (Freitag-Priorität)
     - Unter Schwellenwert: Keine Bonuszahlung (weder WE noch WT)

### Wichtiger Unterschied - Beispiel

**Szenario**: Mitarbeiter arbeitet 1 × Mo, 1 × Di, 1 × Sa

**Web-App**:
- Qualifizierende Tage: 1.0 (nur Samstag)
- Schwellenwert nicht erreicht → **0€ Bonus**

**Python/Android**:
- WT-Tage: 2.0 (Mo, Di) → 2 × 250€ = **500€**
- WE-Tage: 1.0 (Sa) → Schwelle nicht erreicht → 0€
- **Gesamt: 500€**

Die Web-App ist **strenger** für Mitarbeiter ohne ausreichend WE-Dienste.

## Dateistruktur

```
Dienstplan/
├── webapp/                          # Web-Anwendung (Browser)
│   ├── index.html                   # Haupt-UI
│   ├── styles.css                   # Styling (Gradient-Design)
│   ├── app.js                       # UI-Logik, Event-Handling
│   ├── calculator.js                # Bonusberechnungs-Engine
│   ├── holidays.js                  # NRW-Feiertage (2025-2030)
│   ├── storage.js                   # LocalStorage-Verwaltung
│   └── README.md                    # Web-App Dokumentation
│
├── src/                             # Python/Excel Version
│   ├── build_template.py            # Excel-Vorlage erstellen
│   ├── fill_plan_dates.py           # Monatspläne generieren
│   └── read_excel.py                # Excel-Dateien lesen
│
├── android-app/                     # Android App
│   ├── app/src/main/java/com/dienstplan/nrw/
│   │   ├── MainActivity.kt          # Haupt-Activity
│   │   ├── data/
│   │   │   ├── PayrollCalculator.kt # Bonusberechnung
│   │   │   ├── HolidayProvider.kt   # Feiertagsdaten
│   │   │   └── DutyDataStore.kt     # Datenverwaltung
│   │   └── model/                   # Datenmodelle
│   └── README.md                    # Android-Dokumentation
│
├── templates/                       # Excel-Vorlagen
├── output/                          # Generierte Excel-Dateien
├── README.md                        # Projekt-Hauptdokumentation
├── SPECIFICATION.md                 # Detaillierte Regelspezifikation
├── claude.md                        # Diese Datei
└── requirements.txt                 # Python-Abhängigkeiten
```

## NRW Feiertage

Alle Implementierungen nutzen die gleichen NRW-Feiertage:

- Neujahr (1. Januar)
- Karfreitag (variabel)
- Ostermontag (variabel)
- Tag der Arbeit (1. Mai)
- Christi Himmelfahrt (variabel)
- Pfingstmontag (variabel)
- Fronleichnam (variabel)
- Tag der Deutschen Einheit (3. Oktober)
- Allerheiligen (1. November)
- 1. Weihnachtstag (25. Dezember)
- 2. Weihnachtstag (26. Dezember)

**Abdeckung**: 2025-2030 (Web-App), 2025-2026 (Python/Android)

## Entwicklungshinweise

### Web-App erweitern

**Neue Feiertage hinzufügen** (`webapp/holidays.js`):
```javascript
2031: [
    { date: '2031-01-01', name: 'Neujahr' },
    // ... weitere Feiertage
]
```

**Berechnungsraten ändern** (`webapp/calculator.js`):
```javascript
this.RATE_NORMAL = 250;          // Normale Tage
this.RATE_WEEKEND = 450;         // WE/Feiertag Tage
this.MIN_QUALIFYING_DAYS = 2.0;  // Schwellenwert
```

### Python Version erweitern

**Neue Monate generieren**:
```bash
python src/fill_plan_dates.py 2025 11  # November 2025
```

### Android App

**Build & Install**:
```bash
cd android-app
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Testing-Szenarien

### Testfall 1: Schwellenwert genau erreicht
- 1 × Freitag (1.0)
- 1 × Samstag (1.0)
- Erwartung: 2.0 qualifizierende Tage → 2.0 abgezogen → 0.0 × 450€ = **0€**

### Testfall 2: Schwellenwert nicht erreicht
- 1 × Samstag (1.0)
- 1 × Sonntag (0.5 - halber Dienst)
- Erwartung: 1.5 qualifizierende Tage → **0€** (Schwelle nicht erreicht)

### Testfall 3: Mit normalen Tagen
- 2 × Montag (2.0)
- 2 × Samstag (2.0)
- Erwartung:
  - 2.0 qualifizierende → -2.0 Abzug → 0.0 bezahlt
  - Bonus: (2 × 250€) + (0 × 450€) = **500€**

### Testfall 4: Feiertag + Vortag
- 1 × Donnerstag vor Karfreitag (qualifizierend!)
- 1 × Karfreitag (Feiertag, qualifizierend!)
- Erwartung: 2.0 qualifizierende → -2.0 → 0.0 × 450€ = **0€**

## Häufige Anpassungen

### Schwellenwert ändern (Web-App)
`webapp/calculator.js`, Zeile 10:
```javascript
this.MIN_QUALIFYING_DAYS = 3.0;  // Statt 2.0
```

### Vergütungsraten ändern (Web-App)
`webapp/calculator.js`, Zeilen 8-9:
```javascript
this.RATE_NORMAL = 300;   // Statt 250
this.RATE_WEEKEND = 500;  // Statt 450
```

### Abzug ändern (Web-App)
Der Abzug ist als Konstante in `webapp/calculator.js` definiert:
```javascript
this.DEDUCTION_AMOUNT = 2.0;  // Im Constructor
```

Um den Abzugswert zu ändern, einfach diesen Wert anpassen.

## Code-Architektur

### Web-App (MVC-ähnlich)

**Model** (`storage.js`):
- Datenverwaltung
- LocalStorage-Persistenz
- CRUD-Operationen für Mitarbeiter & Dienste

**Controller** (`app.js`):
- Event-Handling
- Koordination zwischen Model, View, Calculator
- UI-State-Management

**Business Logic** (`calculator.js`):
- Bonusberechnung
- Tag-Klassifizierung (qualifizierend/normal)
- Formatierung

**Data Provider** (`holidays.js`):
- Feiertagsdaten
- Datum-Utilities

**View** (`index.html` + `styles.css`):
- UI-Layout (Tabs)
- Styling
- Responsives Design

### Datenfluss (Web-App)

```
User Action (UI)
    ↓
Event Handler (app.js)
    ↓
Storage Operation (storage.js) ←→ LocalStorage
    ↓
Data Retrieved
    ↓
Calculator Processing (calculator.js) → Holiday Check (holidays.js)
    ↓
Results
    ↓
UI Update (app.js)
    ↓
View Rendering (HTML)
```

## Browser-Kompatibilität (Web-App)

- **Chrome/Edge**: ✅ Vollständig unterstützt
- **Firefox**: ✅ Vollständig unterstützt
- **Safari**: ✅ Vollständig unterstützt
- **Opera**: ✅ Vollständig unterstützt

**Mindestanforderungen**:
- LocalStorage API
- ES6 JavaScript (Arrow Functions, Classes, Template Literals)
- CSS Grid & Flexbox
- Date API

## Deployment-Optionen (Web-App)

### Option 1: Lokale Datei
Einfach `index.html` im Browser öffnen - funktioniert sofort!

### Option 2: Statischer Webserver
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### Option 3: Cloud-Hosting
Geeignet für Plattformen wie:
- **GitHub Pages**: Kostenlos, einfach via Git
- **Netlify**: Drag & Drop, kostenloser Plan
- **Vercel**: Automatisches Deployment
- **AWS S3**: Static Website Hosting

Da die App rein client-seitig läuft (keine Server-Logik), ist jeder Static-Hosting-Service geeignet.

## Sicherheitshinweise

### LocalStorage-Daten
- Daten sind **nicht verschlüsselt**
- Für produktive Nutzung mit sensiblen Daten ggf. Verschlüsselung hinzufügen
- Regelmäßige Backups via Export-Funktion empfohlen

### CORS (bei Web-Hosting)
- LocalStorage funktioniert nur auf gleicher Domain
- Beim Testen via `file://` können CORS-Einschränkungen auftreten
- Lösung: Lokaler Webserver (siehe Deployment-Optionen)

## Lizenz

MIT License - Siehe Hauptprojekt

## Versionshistorie

- **v3.0** (2025): Web-App hinzugefügt mit vereinfachter Berechnungslogik
- **v2.0** (2024): Android-App implementiert
- **v1.0**: Python/Excel Version (Variante 2 "streng")

## Kontakt & Support

Für Fragen zum Projekt siehe `README.md` der jeweiligen Implementierung.
