# Dienstplan Bonusrechner - Web App

Eine Web-Anwendung zur Berechnung von Bonuszahlungen für Wochenend- und Feiertagsdienste nach NRW-Regeln.

## Features

- ✅ **Mitarbeiterverwaltung**: Mehrere Mitarbeiter gleichzeitig verwalten
- ✅ **Dienstplanung**: Dienste für beliebige Monate eintragen (ganze und halbe Dienste)
- ✅ **Automatische Feiertagserkennung**: NRW-Feiertage 2025-2030
- ✅ **Bonusberechnung**: Automatische Berechnung nach festgelegten Regeln
- ✅ **Datenexport/Import**: JSON-Export für Backup und Migration
- ✅ **LocalStorage**: Alle Daten werden lokal im Browser gespeichert
- ✅ **Responsive Design**: Funktioniert auf Desktop und Mobilgeräten

## Berechnungsregeln

### Qualifizierende Tage (WE/Feiertag)
- **Wochenende**: Freitag, Samstag, Sonntag
- **Feiertage**: Alle gesetzlichen Feiertage in NRW
- **Tag vor Feiertag**: Der Tag vor einem gesetzlichen Feiertag

### Bonusberechnung
1. **Schwellenwert**: Mindestens **2.0 qualifizierende Tage** im Monat erforderlich
2. **Abzug**: Bei Erreichen des Schwellenwerts werden **2.0 qualifizierende Tage** abgezogen (Freitag-Priorität)
3. **Vergütung**:
   - Normale Tage: **250€** pro Tag
   - Qualifizierende Tage (WE/Feiertag): **450€** pro Tag
   - Halbe Dienste: Jeweils die Hälfte

### Beispiel
Mitarbeiter hat im Monat:
- 3 normale Tage (Mo-Do, keine Feiertage)
- 3 Wochenend-Tage (Fr, Sa, So)

**Berechnung**:
- Qualifizierende Tage: 3.0 (Schwellenwert erreicht ✓)
- Abzug: -2.0 qualifizierende Tage
- Bezahlt: 3 normale Tage + 1 qualifizierender Tag
- **Bonus**: (3 × 250€) + (1 × 450€) = **1.200€**

## Installation & Nutzung

### Lokale Nutzung (einfachste Methode)

1. **Dateien öffnen**:
   - Navigieren Sie zum Ordner `webapp`
   - Öffnen Sie die Datei `index.html` direkt in Ihrem Browser (Doppelklick)

2. **Fertig!** Die App läuft komplett im Browser, keine Installation nötig.

### Mit lokalem Webserver (optional)

Wenn Sie lieber einen Webserver verwenden möchten:

```bash
# Im webapp-Ordner
python -m http.server 8000
# Oder mit Node.js
npx http-server -p 8000
```

Dann im Browser öffnen: `http://localhost:8000`

## Bedienung

### 1. Mitarbeiter hinzufügen
1. Gehen Sie zum Tab "Mitarbeiter verwalten"
2. Geben Sie den Namen ein und klicken Sie auf "Hinzufügen"

### 2. Dienste eintragen
1. Gehen Sie zum Tab "Dienste eintragen"
2. Wählen Sie Monat und Jahr
3. Wählen Sie einen Mitarbeiter
4. Wählen Sie das Datum
5. Wählen Sie Dienstanteil (ganz oder halb)
6. Klicken Sie auf "Dienst hinzufügen"

**Hinweis**: Qualifizierende Tage (WE/Feiertag) werden grün hervorgehoben.

### 3. Bonus berechnen
1. Gehen Sie zum Tab "Berechnung"
2. Wählen Sie Monat und Jahr
3. Klicken Sie auf "Berechnung durchführen"
4. Sehen Sie die Ergebnisse für alle Mitarbeiter

### 4. Daten exportieren/importieren
1. Gehen Sie zum Tab "Einstellungen"
2. Klicken Sie auf "Daten exportieren" für ein Backup
3. Verwenden Sie "Daten importieren" um gespeicherte Daten zu laden

## Datenspeicherung

- Alle Daten werden im **Browser LocalStorage** gespeichert
- Die Daten bleiben erhalten, auch nach Schließen des Browsers
- **Wichtig**: Beim Löschen der Browser-Daten gehen die Daten verloren
- Regelmäßige Exports werden empfohlen!

## NRW Feiertage (2025-2030)

Die App enthält alle gesetzlichen Feiertage für NRW von 2025 bis 2030:
- Neujahr
- Karfreitag
- Ostermontag
- Tag der Arbeit
- Christi Himmelfahrt
- Pfingstmontag
- Fronleichnam
- Tag der Deutschen Einheit
- Allerheiligen
- 1. und 2. Weihnachtstag

## Technische Details

### Projektstruktur
```
webapp/
├── index.html       # Haupt-HTML-Datei
├── styles.css       # Styling
├── app.js           # Haupt-App-Logik & UI
├── calculator.js    # Bonusberechnungs-Logik
├── holidays.js      # NRW-Feiertagsdaten
├── storage.js       # LocalStorage-Verwaltung
└── README.md        # Diese Datei
```

### Technologien
- **Vanilla JavaScript** (kein Framework erforderlich)
- **HTML5 & CSS3**
- **LocalStorage API**
- Keine externen Abhängigkeiten
- Funktioniert in allen modernen Browsern

### Browser-Kompatibilität
- Chrome/Edge (empfohlen)
- Firefox
- Safari
- Opera

## Tipps & Tricks

1. **Regelmäßige Backups**: Exportieren Sie Ihre Daten regelmäßig als JSON-Datei
2. **Drucken**: Die Berechnungsseite kann direkt gedruckt werden (Datei → Drucken)
3. **Mehrere Browser**: Daten sind browser-spezifisch und werden nicht synchronisiert
4. **Mobile Nutzung**: Die App ist mobilfreundlich und kann auch auf Tablets/Smartphones genutzt werden

## Unterschiede zu anderen Versionen

Diese Web-App verwendet leicht andere Regeln als die Python/Excel Version:

### Web-App Logik (Ihre Anforderungen)
- Wenn < 2 WE-Tage: **Keine Bonuszahlung**
- Wenn ≥ 2 WE-Tage:
  - 1 WE-Tag wird abgezogen
  - Alle übrigen Tage werden bezahlt (normale: 250€, WE: 450€)

### Python/Excel Version (Variante 2 "streng")
- Normale Tage (WT) werden immer bezahlt (250€)
- WE-Tage nur wenn ≥ 2.0 WE-Einheiten

Die Web-App folgt genau Ihren beschriebenen Anforderungen.

## Lizenz

MIT
